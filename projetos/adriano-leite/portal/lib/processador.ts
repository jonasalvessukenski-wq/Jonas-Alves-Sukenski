// Processador da fila. Roda na nuvem a cada minuto (Vercel Cron → /api/processar).
// Cada passo é pequeno, repetível e deixa rastro. Falha não some: vai para
// nova tentativa com espera crescente ou para "morta", visível no portal.

import Anthropic from "@anthropic-ai/sdk";
import { banco, enfileirar, garantirTelefone, lerControle, registrarEvento, repositorioContatos } from "./banco";
import { ConflitoDeIdentidade, resolverContato } from "./identidade";
import { normalizar } from "./telefone";
import { normalizarZapi } from "./zapi";
import { decidirJanela, aposFalha } from "./fila";
import { analisarConversa, type LinhaConversa } from "./classificador";
import { decidir } from "./deduplicar";
import { transcreverAudio } from "./transcricao";

type Trabalho = { id: number; tipo: string; alvo: string; tentativas: number };

class Adiar extends Error {
  constructor(public minutos: number) { super("adiar"); }
}

const BUCKET = "midias";

async function identificar(msgId: string) {
  const db = banco();
  const { data: msg, error } = await db.from("mensagens").select("id, bruto, tipo, contato_id").eq("id", msgId).single();
  if (error) throw error;
  if (msg.contato_id) return;
  const r = normalizarZapi(msg.bruto, new Set(await lerControle<string[]>("grupos_permitidos", [])));
  if (!r.aceitar) return;
  const m = r.mensagem;
  const entrada = m.grupo
    ? { telefone: m.grupo.participanteTelefone, lid: m.grupo.participanteLid, nomePerfil: m.nomePerfil }
    : { telefone: m.telefone, lid: m.lid, nomePerfil: m.deMim ? null : m.nomePerfil };
  if (m.deMim && m.grupo) return; // mensagem do Adriano em grupo: fica no grupo, sem contato

  try {
    const res = await resolverContato(entrada, repositorioContatos);
    if (res.criado && entrada.telefone) {
      const t = normalizar(entrada.telefone);
      if (t.tipo === "telefone") await garantirTelefone(res.contato.id, t.chave, t.e164);
    }
    await db.from("mensagens").update({ contato_id: res.contato.id }).eq("id", msgId);
    if (res.fundiu) await registrarEvento("fundiu", res.contato.id, { origem: res.fundiu });
  } catch (e) {
    if (e instanceof ConflitoDeIdentidade) {
      await registrarEvento("conflito_identidade", msgId, { contatos: [e.contatoTelefone, e.contatoLid] });
      return; // decisão humana no portal; não é falha técnica
    }
    throw e;
  }
  if (m.midia) await enfileirar("baixar_midia", msgId);
}

async function baixarMidia(msgId: string) {
  const db = banco();
  const { data: msg, error } = await db.from("mensagens").select("id, bruto, tipo, contato_id, midia_path").eq("id", msgId).single();
  if (error) throw error;
  if (msg.midia_path) return;
  const r = normalizarZapi(msg.bruto, new Set(["*"]));
  const url = r.aceitar ? r.mensagem.midia?.url : null;
  if (!url) return;
  const resp = await fetch(url);
  if (!resp.ok) throw Object.assign(new Error(`download ${resp.status}`), { status: resp.status });
  const caminho = `${msg.contato_id ?? "sem-contato"}/${msgId}`;
  const { error: e2 } = await db.storage.from(BUCKET).upload(caminho, await resp.arrayBuffer(), {
    contentType: resp.headers.get("content-type") ?? "application/octet-stream",
    upsert: true,
  });
  if (e2) throw e2;
  await db.from("mensagens").update({ midia_path: caminho }).eq("id", msgId);
  if (msg.tipo === "audio") await enfileirar("transcrever", msgId);
}

async function transcrever(msgId: string) {
  const db = banco();
  const { data: msg, error } = await db.from("mensagens").select("midia_path, midia_mime, transcricao").eq("id", msgId).single();
  if (error) throw error;
  if (msg.transcricao || !msg.midia_path) return;
  const { data: arquivo, error: e2 } = await db.storage.from(BUCKET).download(msg.midia_path);
  if (e2) throw e2;
  const texto = await transcreverAudio(arquivo, msg.midia_mime ?? "audio/ogg");
  await db.from("mensagens").update({ transcricao: texto }).eq("id", msgId);
}

async function agendarAnalises() {
  const db = banco();
  const { data, error } = await db.from("mensagens").select("contato_id").is("analisada_em", null).not("contato_id", "is", null).limit(500);
  if (error) throw error;
  const contatos = new Set((data ?? []).map((x) => x.contato_id as string));
  for (const c of contatos) await enfileirar("analisar_conversa", c);
}

async function analisar(contatoId: string, agora: Date) {
  if (!(await lerControle("analise_ligada", true))) throw new Adiar(30);
  const db = banco();
  const { data: novas, error } = await db
    .from("mensagens")
    .select("id, de_mim, momento, tipo, texto, transcricao, midia_path")
    .eq("contato_id", contatoId)
    .is("analisada_em", null)
    .order("momento");
  if (error) throw error;
  if (!novas?.length) return;

  const decisao = decidirJanela(novas.map((n) => ({ recebidaEm: new Date(n.momento), texto: n.texto, tipo: n.tipo })), agora);
  if (decisao.acao === "aguardar") throw new Adiar(2);
  const ids = novas.map((n) => n.id);
  const marcar = async () => {
    const { error: e } = await db.from("mensagens").update({ analisada_em: agora.toISOString() }).in("id", ids);
    if (e) throw e;
  };
  if (decisao.acao === "fechar_sem_ia") return marcar();

  // Áudio ainda sem transcrição: espera (a transcrição tem fila própria).
  if (novas.some((n) => n.tipo === "audio" && !n.transcricao)) throw new Adiar(2);

  const { data: anteriores } = await db
    .from("mensagens")
    .select("de_mim, momento, texto, transcricao, tipo")
    .eq("contato_id", contatoId)
    .not("analisada_em", "is", null)
    .order("momento", { ascending: false })
    .limit(10);
  const linha = (n: { de_mim: boolean; momento: string; texto: string | null; transcricao?: string | null; tipo: string }): LinhaConversa | null => {
    const texto = n.transcricao ? `(áudio) ${n.transcricao}` : n.texto ?? (n.tipo !== "texto" ? `(${n.tipo})` : null);
    return texto ? { autor: n.de_mim ? "adriano" : "contato", momento: new Date(n.momento), texto } : null;
  };
  const linhas = [...(anteriores ?? []).reverse(), ...novas].map(linha).filter((l): l is LinhaConversa => !!l);
  const { data: contato } = await db.from("contatos").select("nome, empresa, contexto").eq("id", contatoId).single();
  const contexto = [contato?.nome && `Nome: ${contato.nome}${contato.empresa ? ` (${contato.empresa})` : ""}`, contato?.contexto]
    .filter(Boolean)
    .join("\n") || null;

  const a = await analisarConversa(linhas, contexto, agora, new Anthropic());

  const { error: eA } = await db.from("analises").insert({
    contato_id: contatoId, mensagens: ids, resumo: a.resumo, trilha: a.trilha, urgencia: a.urgencia,
    deve_resposta: a.adrianoDeveResposta, modelo: a.uso.modelo, tokens_entrada: a.uso.entrada, tokens_saida: a.uso.saida,
  });
  if (eA) throw eA;

  const { data: abertas } = await db
    .from("pendencias")
    .select("id, contato_id, titulo")
    .eq("contato_id", contatoId)
    .in("situacao", ["conferir", "aberta", "aguardando"]);
  const lista = (abertas ?? []).map((p) => ({ id: p.id, contatoId: p.contato_id, titulo: p.titulo }));

  for (const p of a.pendencias) {
    const v = decidir(p.titulo, contatoId, lista);
    const evidenciaMsg = novas.find((n) => (n.transcricao ?? n.texto ?? "").includes(p.trecho))?.id ?? null;
    if (v.acao === "anexar") {
      await db.from("evidencias").insert({ pendencia_id: v.pendenciaId, mensagem_id: evidenciaMsg, trecho: p.trecho });
      continue;
    }
    const situacao = v.acao === "revisar" || p.destino === "conferir" ? "conferir" : "aberta";
    const motivo = v.acao === "revisar" ? `parecida com pendência existente (${Math.round(v.semelhanca * 100)}%)` : p.motivoConferir;
    const { data: nova, error: eP } = await db
      .from("pendencias")
      .insert({
        contato_id: contatoId, titulo: p.titulo, quem_deve: p.quemDeve, prazo_data: p.prazo?.data ?? null,
        prazo_hora: p.prazo?.hora ?? null, situacao, motivo_conferir: motivo, origem: "ia",
      })
      .select("id")
      .single();
    if (eP) throw eP;
    await db.from("evidencias").insert({ pendencia_id: nova.id, mensagem_id: evidenciaMsg, trecho: p.trecho });
    lista.push({ id: nova.id, contatoId, titulo: p.titulo });
  }
  await marcar();
  await registrarEvento("analisou", contatoId, { mensagens: ids.length, pendencias: a.pendencias.length, tokens: a.uso });
}

function statusDoErro(e: unknown): { status?: number; rede?: boolean } {
  if (e instanceof Anthropic.APIError) return { status: e.status };
  const s = (e as { status?: number })?.status;
  if (typeof s === "number") return { status: s };
  if (e instanceof TypeError) return { rede: true }; // fetch falhou
  return {};
}

export async function processarFila(agora = new Date(), lote = 20) {
  const db = banco();
  await agendarAnalises();
  const { data: trabalhos, error } = await db.rpc("pegar_trabalhos", { qtd: lote });
  if (error) throw error;
  const resumo = { feitos: 0, adiados: 0, falhas: 0, mortos: 0 };

  for (const t of (trabalhos ?? []) as Trabalho[]) {
    try {
      if (t.tipo === "identificar") await identificar(t.alvo);
      else if (t.tipo === "baixar_midia") await baixarMidia(t.alvo);
      else if (t.tipo === "transcrever") await transcrever(t.alvo);
      else if (t.tipo === "analisar_conversa") await analisar(t.alvo, agora);
      else throw new Error(`tipo desconhecido: ${t.tipo}`);
      await db.from("trabalhos").update({ estado: "feito", feito_em: new Date().toISOString(), ultimo_erro: null }).eq("id", t.id);
      resumo.feitos++;
    } catch (e) {
      if (e instanceof Adiar) {
        // Esperar não é falha: devolve a tentativa.
        await db.from("trabalhos").update({
          estado: "aguardando", tentativas: t.tentativas - 1, tentar_em: new Date(+agora + e.minutos * 60000).toISOString(),
        }).eq("id", t.id);
        resumo.adiados++;
        continue;
      }
      const passo = aposFalha(t.tentativas, statusDoErro(e), agora);
      const msg = e instanceof Error ? e.message : String(e);
      if (passo.estado === "morta") {
        await db.from("trabalhos").update({ estado: "morta", ultimo_erro: `${passo.motivo}: ${msg}` }).eq("id", t.id);
        await registrarEvento("morta", t.alvo, { tipo: t.tipo, erro: msg });
        resumo.mortos++;
      } else {
        await db.from("trabalhos").update({ estado: "aguardando", tentar_em: passo.tentarEm.toISOString(), ultimo_erro: msg }).eq("id", t.id);
        resumo.falhas++;
      }
    }
  }
  return resumo;
}
