import { describe, it, expect } from "vitest";
import { normalizar, formatar } from "@/lib/telefone";
import { resolverContato, type Contato, type RepositorioContatos, ConflitoDeIdentidade } from "@/lib/identidade";
import { ehTrivial } from "@/lib/trivial";
import { interpretarPrazo, hojeEmSP } from "@/lib/datas";
import { decidir, semelhanca } from "@/lib/deduplicar";
import { decidirJanela, aposFalha, MAX_TENTATIVAS } from "@/lib/fila";
import { normalizarZapi } from "@/lib/zapi";
import { validar, type AnaliseIA, type LinhaConversa } from "@/lib/classificador";

// Números fictícios (faixa 0000) — nenhum dado real nos testes.
describe("telefone", () => {
  it("celular sem nono dígito e com nono dígito geram a mesma chave", () => {
    const a = normalizar("554899990000@c.us");
    const b = normalizar("+55 (48) 9 9999-0000");
    expect(a).toMatchObject({ tipo: "telefone", e164: "5548999990000" });
    expect(a.tipo === "telefone" && b.tipo === "telefone" && a.chave === b.chave).toBe(true);
  });
  it("LID nunca vira telefone", () => {
    expect(normalizar("12345678901234@lid")).toEqual({ tipo: "lid", lid: "12345678901234" });
  });
  it("fixo mantém 8 dígitos", () => {
    expect(normalizar("1133330000")).toMatchObject({ tipo: "telefone", e164: "551133330000" });
  });
  it("número nacional sem DDI ganha 55", () => {
    expect(normalizar("11 90000-0000")).toMatchObject({ e164: "5511900000000" });
  });
  it("formata para exibição", () => {
    expect(formatar("5511900000000")).toBe("+55 11 90000-0000");
  });
});

function repoMemoria(iniciais: Contato[] = []) {
  const contatos = new Map(iniciais.map((c) => [c.id, structuredClone(c)]));
  let n = 0;
  const fusoes: [string, string][] = [];
  const repo: RepositorioContatos = {
    async porChave(ch) { return [...contatos.values()].find((c) => c.chaves.includes(ch)) ?? null; },
    async porLid(l) { return [...contatos.values()].find((c) => c.lids.includes(l)) ?? null; },
    async criar(c) { const novo = { ...c, id: `novo${++n}` }; contatos.set(novo.id, novo); return novo; },
    async acrescentarLid(id, l) { contatos.get(id)!.lids.push(l); },
    async acrescentarChave(id, ch) { contatos.get(id)!.chaves.push(ch); },
    async fundir(o, d) { const org = contatos.get(o)!; const dst = contatos.get(d)!; dst.lids.push(...org.lids); contatos.delete(o); fusoes.push([o, d]); },
  };
  return { repo, contatos, fusoes };
}

const chave = (tel: string) => { const n = normalizar(tel); if (n.tipo !== "telefone") throw new Error(tel); return n.chave; };
const base = (p: Partial<Contato>): Contato => ({ id: "x", nome: null, apelidoPerfil: null, chaves: [], lids: [], situacao: "confirmado", ...p });

describe("identidade", () => {
  it("número desconhecido vira contato pendente (nunca fica sem dono)", async () => {
    const { repo } = repoMemoria();
    const r = await resolverContato({ telefone: "5511900000000", nomePerfil: "Fulano" }, repo);
    expect(r.criado).toBe(true);
    expect(r.contato.situacao).toBe("pendente");
    expect(r.contato.nome).toBeNull(); // nome do perfil não é identidade
    expect(r.contato.apelidoPerfil).toBe("Fulano");
  });
  it("nunca liga pelo nome: dois 'Bruno' diferentes continuam separados", async () => {
    const { repo } = repoMemoria([base({ id: "b1", nome: "Bruno (Empresa A)", chaves: [chave("11 90000-0001")] })]);
    const r = await resolverContato({ telefone: "11 90000-0002", nomePerfil: "Bruno" }, repo);
    expect(r.contato.id).not.toBe("b1");
  });
  it("aprende o par telefone/LID", async () => {
    const { repo, contatos } = repoMemoria([base({ id: "c1", chaves: [chave("11 90000-0001")] })]);
    const r = await resolverContato({ telefone: "11 90000-0001", lid: "999" }, repo);
    expect(r.aprendeuLid).toBe(true);
    expect(contatos.get("c1")!.lids).toContain("999");
  });
  it("funde contato que só tinha LID quando o telefone aparece", async () => {
    const { repo, fusoes } = repoMemoria([
      base({ id: "c1", chaves: [chave("11 90000-0001")] }),
      base({ id: "soLid", lids: ["777"], situacao: "pendente" }),
    ]);
    const r = await resolverContato({ telefone: "11 90000-0001", lid: "777" }, repo);
    expect(r.contato.id).toBe("c1");
    expect(fusoes).toEqual([["soLid", "c1"]]);
  });
  it("conflito entre dois contatos com telefone não é decidido sozinho", async () => {
    const { repo } = repoMemoria([
      base({ id: "c1", chaves: [chave("11 90000-0001")] }),
      base({ id: "c2", chaves: [chave("11 90000-0002")], lids: ["777"] }),
    ]);
    await expect(resolverContato({ telefone: "11 90000-0001", lid: "777" }, repo)).rejects.toBeInstanceOf(ConflitoDeIdentidade);
  });
});

describe("trivial", () => {
  it.each(["ok", "Ok!", "👍", "👍🏻👍🏻", "valeu", "bom dia, obrigado", "kkk", "Glória a Deus!"])("'%s' é cortesia", (t) => {
    expect(ehTrivial(t)).toBe(true);
  });
  it.each(["assinado", "JB tem estoque?", "manda o balanço", "ok, manda amanhã"])("'%s' tem conteúdo", (t) => {
    expect(ehTrivial(t)).toBe(false);
  });
});

describe("datas em São Paulo", () => {
  // 10/10/2026 é sábado. 02:30 UTC ainda é sexta 09/10 em São Paulo.
  const sabado = new Date("2026-10-10T15:00:00Z");
  it("usa o dia de São Paulo, não o do servidor", () => {
    expect(hojeEmSP(new Date("2026-10-10T02:30:00Z"))).toEqual({ ano: 2026, mes: 10, dia: 9 });
  });
  it("'até sexta' num sábado é a sexta seguinte (não quarta)", () => {
    expect(interpretarPrazo("até sexta", sabado)?.data).toBe("2026-10-16");
  });
  it("amanhã às 16h", () => {
    expect(interpretarPrazo("amanhã às 16h", sabado)).toEqual({ data: "2026-10-11", hora: "16:00", certeza: "exata" });
  });
  it("dia 28 de outubro", () => {
    expect(interpretarPrazo("dia 28 de outubro", sabado)?.data).toBe("2026-10-28");
  });
  it("15/10 às 9h30", () => {
    expect(interpretarPrazo("15/10 às 9h30", sabado)).toEqual({ data: "2026-10-15", hora: "09:30", certeza: "exata" });
  });
  it("data passada sem ano vai para o ano seguinte", () => {
    expect(interpretarPrazo("05/01", sabado)?.data).toBe("2027-01-05");
  });
  it("31/02 é inválido", () => {
    expect(interpretarPrazo("31/02/2027", sabado)).toBeNull();
  });
  it("sem data reconhecível devolve null (não chuta)", () => {
    expect(interpretarPrazo("assim que der", sabado)).toBeNull();
  });
});

describe("duplicidade", () => {
  it("mesma pendência com outras palavras é anexada", () => {
    const v = decidir("Enviar o balanço do primeiro semestre", "c1", [{ id: "p1", contatoId: "c1", titulo: "Envio do balanço primeiro semestre" }]);
    expect(v.acao).toBe("anexar");
  });
  it("assunto diferente cria nova", () => {
    const v = decidir("Agendar reunião com o banco", "c1", [{ id: "p1", contatoId: "c1", titulo: "Enviar balanço do semestre" }]);
    expect(v.acao).toBe("criar");
  });
  it("só compara com pendências do mesmo contato", () => {
    const v = decidir("Enviar balanço do semestre", "c2", [{ id: "p1", contatoId: "c1", titulo: "Enviar balanço do semestre" }]);
    expect(v.acao).toBe("criar");
  });
  it("semelhança é simétrica", () => {
    expect(semelhanca("assinar contrato", "contrato assinado")).toBe(semelhanca("contrato assinado", "assinar contrato"));
  });
});

describe("fila", () => {
  const agora = new Date("2026-10-10T15:00:00Z");
  const m = (minAtras: number, texto: string) => ({ recebidaEm: new Date(+agora - minAtras * 60000), texto, tipo: "texto" });
  it("espera a conversa assentar", () => {
    expect(decidirJanela([m(1, "manda o contrato")], agora).acao).toBe("aguardar");
  });
  it("analisa após silêncio", () => {
    expect(decidirJanela([m(6, "manda o contrato")], agora)).toEqual({ acao: "analisar", motivo: "silencio" });
  });
  it("só cortesia fecha sem IA (custo zero)", () => {
    expect(decidirJanela([m(6, "ok"), m(5, "👍")], agora).acao).toBe("fechar_sem_ia");
  });
  it("áudio sempre conta como conteúdo", () => {
    expect(decidirJanela([{ ...m(6, ""), tipo: "audio" }], agora).acao).toBe("analisar");
  });
  it("429 é repetido com espera; 400 vai para 'morta' visível", () => {
    expect(aposFalha(1, { status: 429 }, agora)).toMatchObject({ estado: "aguardando" });
    expect(aposFalha(1, { status: 400 }, agora)).toMatchObject({ estado: "morta" });
    expect(aposFalha(MAX_TENTATIVAS, { status: 503 }, agora)).toMatchObject({ estado: "morta" });
  });
});

describe("z-api", () => {
  const msg = { type: "ReceivedCallback", messageId: "M1", instanceId: "I", phone: "5511900000000", fromMe: false, momment: 1791600000000, senderName: "Fulano", text: { message: "oi" } };
  it("aceita texto", () => {
    const r = normalizarZapi(msg);
    expect(r.aceitar && r.mensagem.tipo === "texto" && r.mensagem.telefone).toBe("5511900000000");
  });
  it("descarta eco da API, canal e status", () => {
    expect(normalizarZapi({ ...msg, fromApi: true }).aceitar).toBe(false);
    expect(normalizarZapi({ ...msg, isNewsletter: true }).aceitar).toBe(false);
    expect(normalizarZapi({ ...msg, type: "MessageStatusCallback" }).aceitar).toBe(false);
  });
  it("LID vai para o campo lid, nunca para telefone", () => {
    const r = normalizarZapi({ ...msg, phone: "123456789@lid" });
    expect(r.aceitar && [r.mensagem.telefone, r.mensagem.lid]).toEqual([null, "123456789@lid"]);
  });
  it("áudio não some", () => {
    const r = normalizarZapi({ ...msg, text: undefined, audio: { audioUrl: "https://x/a.ogg", seconds: 12 } });
    expect(r.aceitar && r.mensagem.tipo).toBe("audio");
  });
});

describe("validação da análise", () => {
  const agora = new Date("2026-10-10T15:00:00Z");
  const linhas: LinhaConversa[] = [
    { autor: "contato", momento: agora, texto: "Consegue me mandar o balanço até sexta?" },
    { autor: "adriano", momento: agora, texto: "Mando sim" },
  ];
  const base: AnaliseIA = { resumo: "r", trilha: "trabalho", urgencia: "semana", adriano_deve_resposta: false, assunto_dinheiro_sensivel: false, pendencias: [] };
  it("pendência com trecho literal e prazo calculado em código", () => {
    const r = validar({ ...base, pendencias: [{ titulo: "Enviar balanço", quem_deve: "adriano", expressao_de_prazo: "até sexta", trecho: "me mandar o balanço até sexta", confianca: 0.9 }] }, linhas, agora);
    expect(r.pendencias[0]).toMatchObject({ destino: "pendencia", prazo: { data: "2026-10-16" } });
  });
  it("trecho inventado é descartado", () => {
    const r = validar({ ...base, pendencias: [{ titulo: "Pagar boleto", quem_deve: "adriano", expressao_de_prazo: null, trecho: "paga o boleto hoje", confianca: 0.95 }] }, linhas, agora);
    expect(r.pendencias).toHaveLength(0);
  });
  it("confiança baixa e dinheiro sensível vão para conferência", () => {
    const p = { titulo: "Enviar balanço", quem_deve: "adriano" as const, expressao_de_prazo: null, trecho: "Mando sim", confianca: 0.5 };
    expect(validar({ ...base, pendencias: [p] }, linhas, agora).pendencias[0].destino).toBe("conferir");
    expect(validar({ ...base, assunto_dinheiro_sensivel: true, pendencias: [{ ...p, confianca: 0.99 }] }, linhas, agora).pendencias[0].destino).toBe("conferir");
  });
});
