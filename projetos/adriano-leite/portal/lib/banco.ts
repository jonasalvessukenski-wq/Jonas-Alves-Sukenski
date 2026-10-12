// Acesso ao Supabase do lado do servidor (service key: nunca vai ao navegador).
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Contato, RepositorioContatos } from "./identidade";

let cliente: SupabaseClient | null = null;

export function banco(): SupabaseClient {
  if (cliente) return cliente;
  const url = process.env.SUPABASE_URL;
  const chave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !chave) throw new Error("SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY não configuradas");
  cliente = createClient(url, chave, { auth: { persistSession: false } });
  return cliente;
}

export function bancoConfigurado(): boolean {
  return !!process.env.SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
}

function falhou(contexto: string, erro: { message: string } | null): void {
  if (erro) throw new Error(`${contexto}: ${erro.message}`);
}

export async function registrarEvento(tipo: string, alvo: string | null, detalhe: Record<string, unknown> = {}) {
  const { error } = await banco().from("eventos").insert({ tipo, alvo, detalhe });
  falhou("evento", error);
}

export async function lerControle<T>(chave: string, padrao: T): Promise<T> {
  const { data, error } = await banco().from("controles").select("valor").eq("chave", chave).maybeSingle();
  falhou("controle", error);
  return (data?.valor as T) ?? padrao;
}

export async function enfileirar(tipo: string, alvo: string, tentarEm?: Date) {
  // O índice único parcial impede o mesmo trabalho duas vezes na fila.
  const { error } = await banco()
    .from("trabalhos")
    .insert({ tipo, alvo, ...(tentarEm ? { tentar_em: tentarEm.toISOString() } : {}) });
  if (error && !/duplicate key/i.test(error.message)) falhou("enfileirar", error);
}

async function carregarContato(id: string): Promise<Contato | null> {
  const db = banco();
  const { data, error } = await db
    .from("contatos")
    .select("id, nome, apelido_perfil, situacao, contato_telefones(chave), contato_lids(lid)")
    .eq("id", id)
    .maybeSingle();
  falhou("contato", error);
  if (!data) return null;
  return {
    id: data.id,
    nome: data.nome,
    apelidoPerfil: data.apelido_perfil,
    situacao: data.situacao === "confirmado" ? "confirmado" : "pendente",
    chaves: (data.contato_telefones ?? []).map((t: { chave: string }) => t.chave),
    lids: (data.contato_lids ?? []).map((l: { lid: string }) => l.lid),
  };
}

export const repositorioContatos: RepositorioContatos = {
  async porChave(chave) {
    const { data, error } = await banco().from("contato_telefones").select("contato_id").eq("chave", chave).maybeSingle();
    falhou("porChave", error);
    return data ? carregarContato(data.contato_id) : null;
  },
  async porLid(lid) {
    const { data, error } = await banco().from("contato_lids").select("contato_id").eq("lid", lid).maybeSingle();
    falhou("porLid", error);
    return data ? carregarContato(data.contato_id) : null;
  },
  async criar(c) {
    const db = banco();
    const { data, error } = await db
      .from("contatos")
      .insert({ nome: c.nome, apelido_perfil: c.apelidoPerfil, situacao: c.situacao })
      .select("id")
      .single();
    falhou("criar contato", error);
    const id = data!.id as string;
    if (c.lids.length) falhou("lid", (await db.from("contato_lids").insert(c.lids.map((lid) => ({ lid, contato_id: id })))).error);
    await registrarEvento("contato_criado", id, { situacao: c.situacao });
    return { ...c, id };
  },
  async acrescentarLid(id, lid) {
    falhou("lid", (await banco().from("contato_lids").insert({ lid, contato_id: id })).error);
    await registrarEvento("lid_aprendido", id);
  },
  async acrescentarChave(id, chave, e164) {
    falhou("telefone", (await banco().from("contato_telefones").insert({ chave, e164, contato_id: id })).error);
  },
  async fundir(origem, destino) {
    falhou("fundir", (await banco().rpc("fundir_contatos", { p_origem: origem, p_destino: destino })).error);
  },
};

/** Grava o telefone (com E.164) ao criar contato novo: `criar` recebe só a chave. */
export async function garantirTelefone(contatoId: string, chave: string, e164: string) {
  const { error } = await banco().from("contato_telefones").upsert({ chave, e164, contato_id: contatoId }, { onConflict: "chave", ignoreDuplicates: true });
  falhou("telefone", error);
}
