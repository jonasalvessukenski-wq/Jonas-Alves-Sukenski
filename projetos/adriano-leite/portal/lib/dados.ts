// Camada de leitura do portal. Com Supabase configurado, lê o banco.
// Sem Supabase, entra em MODO DEMONSTRAÇÃO com dados fictícios (marcados na tela).
import { banco, bancoConfigurado } from "./banco";
import { hojeEmSP, iso } from "./datas";
import * as demo from "./demo";

export type ContatoResumo = {
  id: string;
  nome: string;
  empresa: string | null;
  situacao: "pendente" | "confirmado" | "arquivado";
  ultimaMensagem: { texto: string; momento: string; deMim: boolean } | null;
  resumo: string | null;
  deveResposta: boolean;
  urgencia: "hoje" | "semana" | "rotina" | "silencio" | null;
  naoLidas: number;
};

export type Pendencia = {
  id: string;
  titulo: string;
  contatoId: string | null;
  contatoNome: string | null;
  quemDeve: "adriano" | "contato" | "terceiro";
  prazoData: string | null;
  prazoHora: string | null;
  situacao: "conferir" | "aberta" | "aguardando" | "feita" | "descartada";
  motivoConferir: string | null;
  evidencias: string[];
};

export type Mensagem = {
  id: string;
  deMim: boolean;
  momento: string;
  tipo: string;
  texto: string | null;
  transcricao: string | null;
};

export type Reuniao = { id: string; titulo: string; inicio: string; fim: string | null; participantes: string[]; resumo: string | null };

export type Saude = {
  capturaLigada: boolean;
  analiseLigada: boolean;
  envioAutomatico: boolean;
  ultimaMensagem: string | null;
  fila: { aguardando: number; processando: number; mortas: number };
  mortas: { id: number; tipo: string; erro: string; quando: string }[];
  conflitos: number;
  tokensHoje: { entrada: number; saida: number; analises: number };
  eventos: { momento: string; tipo: string; detalhe: string }[];
};

export const emDemonstracao = () => !bancoConfigurado();

function nomeExibicao(c: { nome: string | null; apelido_perfil: string | null; e164?: string | null }): string {
  return c.nome ?? (c.apelido_perfil ? `${c.apelido_perfil} (não confirmado)` : c.e164 ? `+${c.e164}` : "Número não identificado");
}

export async function listarConversas(): Promise<ContatoResumo[]> {
  if (emDemonstracao()) return demo.conversas;
  const db = banco();
  const { data, error } = await db
    .from("contatos")
    .select("id, nome, empresa, apelido_perfil, situacao, contato_telefones(e164)")
    .neq("situacao", "arquivado");
  if (error) throw error;
  const out: ContatoResumo[] = [];
  for (const c of data ?? []) {
    const [{ data: ult }, { data: an }, { count }] = await Promise.all([
      db.from("mensagens").select("texto, transcricao, tipo, momento, de_mim").eq("contato_id", c.id).order("momento", { ascending: false }).limit(1).maybeSingle(),
      db.from("analises").select("resumo, deve_resposta, urgencia").eq("contato_id", c.id).order("criado_em", { ascending: false }).limit(1).maybeSingle(),
      db.from("mensagens").select("id", { count: "exact", head: true }).eq("contato_id", c.id).is("analisada_em", null),
    ]);
    if (!ult) continue;
    out.push({
      id: c.id,
      nome: nomeExibicao({ ...c, e164: c.contato_telefones?.[0]?.e164 }),
      empresa: c.empresa,
      situacao: c.situacao,
      ultimaMensagem: { texto: ult.transcricao ?? ult.texto ?? `(${ult.tipo})`, momento: ult.momento, deMim: ult.de_mim },
      resumo: an?.resumo ?? null,
      deveResposta: !!an?.deve_resposta && !ult.de_mim,
      urgencia: an?.urgencia ?? null,
      naoLidas: count ?? 0,
    });
  }
  return out.sort((a, b) => (b.ultimaMensagem!.momento > a.ultimaMensagem!.momento ? 1 : -1));
}

export async function conversa(id: string): Promise<{ contato: ContatoResumo; mensagens: Mensagem[]; pendencias: Pendencia[] } | null> {
  if (emDemonstracao()) return demo.conversa(id);
  const db = banco();
  const lista = await listarConversas();
  const contato = lista.find((c) => c.id === id);
  if (!contato) return null;
  const { data: msgs } = await db.from("mensagens").select("id, de_mim, momento, tipo, texto, transcricao").eq("contato_id", id).order("momento", { ascending: false }).limit(200);
  const pend = (await listarPendencias()).filter((p) => p.contatoId === id);
  return {
    contato,
    mensagens: (msgs ?? []).reverse().map((m) => ({ id: m.id, deMim: m.de_mim, momento: m.momento, tipo: m.tipo, texto: m.texto, transcricao: m.transcricao })),
    pendencias: pend,
  };
}

export async function listarPendencias(): Promise<Pendencia[]> {
  if (emDemonstracao()) return demo.pendencias;
  const { data, error } = await banco()
    .from("pendencias")
    .select("id, titulo, contato_id, quem_deve, prazo_data, prazo_hora, situacao, motivo_conferir, contatos(nome, apelido_perfil), evidencias(trecho)")
    .in("situacao", ["conferir", "aberta", "aguardando"])
    .order("prazo_data", { ascending: true, nullsFirst: false });
  if (error) throw error;
  return (data ?? []).map((p: any) => ({
    id: p.id,
    titulo: p.titulo,
    contatoId: p.contato_id,
    contatoNome: p.contatos ? nomeExibicao(p.contatos) : null,
    quemDeve: p.quem_deve,
    prazoData: p.prazo_data,
    prazoHora: p.prazo_hora?.slice(0, 5) ?? null,
    situacao: p.situacao,
    motivoConferir: p.motivo_conferir,
    evidencias: (p.evidencias ?? []).map((e: { trecho: string }) => e.trecho),
  }));
}

export async function reunioesDoDia(): Promise<Reuniao[]> {
  if (emDemonstracao()) return demo.reunioes;
  const hoje = iso(hojeEmSP());
  const { data, error } = await banco()
    .from("reunioes")
    .select("id, titulo, inicio, fim, participantes, resumo")
    .gte("inicio", `${hoje}T00:00:00-03:00`)
    .lte("inicio", `${hoje}T23:59:59-03:00`)
    .order("inicio");
  if (error) throw error;
  return (data ?? []).map((r: any) => ({ ...r, participantes: (r.participantes ?? []).map((p: any) => p.nome ?? p.email ?? String(p)) }));
}

export async function contatosPendentes(): Promise<{ id: string; apelido: string | null; telefone: string | null; primeira: string | null }[]> {
  if (emDemonstracao()) return demo.contatosPendentes;
  const { data, error } = await banco()
    .from("contatos")
    .select("id, apelido_perfil, contato_telefones(e164), mensagens(texto, momento)")
    .eq("situacao", "pendente")
    .order("criado_em", { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data ?? []).map((c: any) => ({
    id: c.id,
    apelido: c.apelido_perfil,
    telefone: c.contato_telefones?.[0]?.e164 ?? null,
    primeira: c.mensagens?.[0]?.texto ?? null,
  }));
}

export async function saude(): Promise<Saude> {
  if (emDemonstracao()) return demo.saude;
  const db = banco();
  const hoje = iso(hojeEmSP());
  const [controles, ult, ag, pr, mo, mortas, conf, an, ev] = await Promise.all([
    db.from("controles").select("chave, valor"),
    db.from("mensagens").select("momento").order("momento", { ascending: false }).limit(1).maybeSingle(),
    db.from("trabalhos").select("id", { count: "exact", head: true }).eq("estado", "aguardando"),
    db.from("trabalhos").select("id", { count: "exact", head: true }).eq("estado", "processando"),
    db.from("trabalhos").select("id", { count: "exact", head: true }).eq("estado", "morta"),
    db.from("trabalhos").select("id, tipo, ultimo_erro, criado_em").eq("estado", "morta").order("criado_em", { ascending: false }).limit(10),
    db.from("eventos").select("id", { count: "exact", head: true }).eq("tipo", "conflito_identidade"),
    db.from("analises").select("tokens_entrada, tokens_saida").gte("criado_em", `${hoje}T00:00:00-03:00`),
    db.from("eventos").select("momento, tipo, detalhe").order("momento", { ascending: false }).limit(15),
  ]);
  const c = Object.fromEntries((controles.data ?? []).map((x) => [x.chave, x.valor]));
  return {
    capturaLigada: c.captura_ligada !== false,
    analiseLigada: c.analise_ligada !== false,
    envioAutomatico: c.envio_automatico === true,
    ultimaMensagem: ult.data?.momento ?? null,
    fila: { aguardando: ag.count ?? 0, processando: pr.count ?? 0, mortas: mo.count ?? 0 },
    mortas: (mortas.data ?? []).map((m) => ({ id: m.id, tipo: m.tipo, erro: m.ultimo_erro ?? "", quando: m.criado_em })),
    conflitos: conf.count ?? 0,
    tokensHoje: (an.data ?? []).reduce(
      (s, a) => ({ entrada: s.entrada + a.tokens_entrada, saida: s.saida + a.tokens_saida, analises: s.analises + 1 }),
      { entrada: 0, saida: 0, analises: 0 },
    ),
    eventos: (ev.data ?? []).map((e) => ({ momento: e.momento, tipo: e.tipo, detalhe: JSON.stringify(e.detalhe ?? {}) })),
  };
}

export async function buscar(termo: string): Promise<{ contatoId: string | null; contato: string; momento: string; trecho: string }[]> {
  if (emDemonstracao()) return demo.buscar(termo);
  const t = termo.trim();
  if (t.length < 3) return [];
  const { data, error } = await banco()
    .from("mensagens")
    .select("contato_id, momento, texto, transcricao, contatos(nome, apelido_perfil)")
    .or(`texto.ilike.%${t.replace(/[%,()]/g, " ")}%,transcricao.ilike.%${t.replace(/[%,()]/g, " ")}%`)
    .order("momento", { ascending: false })
    .limit(40);
  if (error) throw error;
  return (data ?? []).map((m: any) => ({
    contatoId: m.contato_id,
    contato: m.contatos ? nomeExibicao(m.contatos) : "—",
    momento: m.momento,
    trecho: m.transcricao ?? m.texto ?? "",
  }));
}
