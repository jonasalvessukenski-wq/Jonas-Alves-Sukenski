// Quem mandou a mensagem. Três regras que nasceram de erros reais:
// 1. Nunca identificar pelo nome (nem pelo primeiro nome, nem pelo nome do perfil).
// 2. Número desconhecido vira contato "pendente" na hora — mensagem nunca fica sem dono.
// 3. Quando telefone e LID chegam juntos, o par é aprendido; se já existia um
//    contato só com aquele LID, os dois são fundidos (sem perder histórico).

import { normalizar } from "./telefone";

export type Contato = {
  id: string;
  nome: string | null; // nome confirmado por Adriano; null enquanto pendente
  apelidoPerfil: string | null; // nome do perfil do WhatsApp: só pista, nunca identidade
  chaves: string[]; // chaves de telefone (ver telefone.ts)
  lids: string[];
  situacao: "confirmado" | "pendente";
};

export interface RepositorioContatos {
  porChave(chave: string): Promise<Contato | null>;
  porLid(lid: string): Promise<Contato | null>;
  criar(c: Omit<Contato, "id">): Promise<Contato>;
  acrescentarLid(id: string, lid: string): Promise<void>;
  acrescentarChave(id: string, chave: string, e164: string): Promise<void>;
  /** Move mensagens, tarefas e identificadores de `origem` para `destino` e apaga `origem`. */
  fundir(origemId: string, destinoId: string): Promise<void>;
}

export type Entrada = {
  telefone?: string | null; // como veio do provedor
  lid?: string | null;
  nomePerfil?: string | null;
};

export type Resolucao = {
  contato: Contato;
  criado: boolean;
  aprendeuLid: boolean;
  fundiu: string | null; // id do contato absorvido
};

export async function resolverContato(e: Entrada, repo: RepositorioContatos): Promise<Resolucao> {
  const tel = e.telefone ? normalizar(e.telefone) : null;
  const lidInfo = e.lid ? normalizar(e.lid.includes("@") ? e.lid : `${e.lid}@lid`) : null;
  const telefone = tel?.tipo === "telefone" ? tel : null;
  const lid = lidInfo?.tipo === "lid" ? lidInfo.lid : tel?.tipo === "lid" ? tel.lid : null;

  const peloTelefone = telefone ? await repo.porChave(telefone.chave) : null;
  const peloLid = lid ? await repo.porLid(lid) : null;

  // Os dois apontam para contatos diferentes: o do telefone é a identidade forte.
  if (peloTelefone && peloLid && peloTelefone.id !== peloLid.id) {
    if (peloLid.situacao === "pendente" && peloLid.chaves.length === 0) {
      await repo.fundir(peloLid.id, peloTelefone.id);
      return { contato: peloTelefone, criado: false, aprendeuLid: false, fundiu: peloLid.id };
    }
    // Conflito entre dois contatos com telefone: não decide sozinho.
    throw new ConflitoDeIdentidade(peloTelefone.id, peloLid.id, lid!);
  }

  if (peloTelefone) {
    let aprendeu = false;
    if (lid && !peloTelefone.lids.includes(lid)) {
      await repo.acrescentarLid(peloTelefone.id, lid);
      aprendeu = true;
    }
    return { contato: peloTelefone, criado: false, aprendeuLid: aprendeu, fundiu: null };
  }

  if (peloLid) {
    if (telefone && !peloLid.chaves.includes(telefone.chave)) {
      await repo.acrescentarChave(peloLid.id, telefone.chave, telefone.e164);
    }
    return { contato: peloLid, criado: false, aprendeuLid: false, fundiu: null };
  }

  if (!telefone && !lid) throw new Error("Mensagem sem telefone nem LID: não há como identificar o remetente.");

  const novo = await repo.criar({
    nome: null,
    apelidoPerfil: e.nomePerfil?.trim() || null,
    chaves: telefone ? [telefone.chave] : [],
    lids: lid ? [lid] : [],
    situacao: "pendente",
  });
  return { contato: novo, criado: true, aprendeuLid: false, fundiu: null };
}

export class ConflitoDeIdentidade extends Error {
  constructor(
    public readonly contatoTelefone: string,
    public readonly contatoLid: string,
    public readonly lid: string,
  ) {
    super(`LID ${lid} pertence a outro contato com telefone. Precisa de decisão humana.`);
  }
}
