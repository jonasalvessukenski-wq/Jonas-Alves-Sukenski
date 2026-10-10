// Análise de uma conversa (janela de mensagens de um contato) pela IA.
// A IA propõe; o código valida. Regras herdadas:
// - Datas: a IA devolve só a expressão literal; datas.ts converte.
// - Evidência obrigatória: toda pendência traz o trecho literal que a sustenta,
//   e o código confere que o trecho existe na conversa (sem trecho, sem pendência).
// - Confiança baixa não age: vira item "para conferir", nunca pendência automática.
// - Pedido de pagamento ou troca de conta bancária nunca vira pendência sozinho.

import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import * as z from "zod/v4";
import { interpretarPrazo, type Prazo } from "./datas";

export const MODELO = process.env.CLAUDE_MODELO ?? "claude-opus-5-5";

const Pendencia = z.object({
  titulo: z.string().describe("Verbo no infinitivo + objeto, até 90 caracteres. Ex.: 'Enviar balanço do 1º semestre ao banco'"),
  quem_deve: z.enum(["adriano", "contato", "terceiro"]).describe("Quem precisa agir"),
  expressao_de_prazo: z.string().nullable().describe("Expressão de data/hora EXATAMENTE como escrita na conversa, ou null"),
  trecho: z.string().describe("Trecho literal da conversa que sustenta a pendência, copiado sem alterar"),
  confianca: z.number().min(0).max(1),
});

const Analise = z.object({
  resumo: z.string().describe("Uma ou duas frases: o que esta conversa trata e em que pé está"),
  trilha: z.enum(["trabalho", "pessoal", "ruido"]),
  urgencia: z.enum(["hoje", "semana", "rotina", "silencio"]),
  adriano_deve_resposta: z.boolean().describe("A última fala relevante é do contato e espera retorno do Adriano"),
  pendencias: z.array(Pendencia),
  assunto_dinheiro_sensivel: z.boolean().describe("Pedido de pagamento, PIX, troca de conta bancária ou dado bancário"),
});
export type AnaliseIA = z.infer<typeof Analise>;

const SISTEMA = `Você é o chefe de gabinete do Adriano Leite, consultor financeiro (assessoria, M&A, crédito estruturado) e professor.
Você lê UMA conversa de WhatsApp ou e-mail entre o Adriano e um contato e devolve a análise no formato pedido.

Regras:
- Fale só do que está escrito. Não deduza fatos, valores, nomes ou datas que não estejam na conversa.
- Pendência é algo que alguém precisa FAZER e ainda não fez. Pergunta de confirmação ("tu vai estar aqui amanhã às 11?") não é compromisso fechado: registre como pendência de responder, não como reunião marcada.
- Mensagens marcadas [ADRIANO] foram escritas pelo Adriano; [CONTATO] pelo outro lado.
- "trecho" deve ser cópia literal de uma linha da conversa.
- Não converta datas. Copie a expressão ("até sexta", "dia 28", "amanhã às 16h") em expressao_de_prazo.
- Confiança abaixo de 0,7 quando houver dúvida sobre quem deve agir ou se já foi feito.
- Cortesias, figurinhas e "ok" não geram pendência.`;

export type LinhaConversa = { autor: "adriano" | "contato"; momento: Date; texto: string };

export type PendenciaValidada = {
  titulo: string;
  quemDeve: "adriano" | "contato" | "terceiro";
  prazo: Prazo | null;
  trecho: string;
  confianca: number;
  destino: "pendencia" | "conferir"; // conferir = Adriano decide no portal
  motivoConferir: string | null;
};

export type ResultadoAnalise = {
  resumo: string;
  trilha: AnaliseIA["trilha"];
  urgencia: AnaliseIA["urgencia"];
  adrianoDeveResposta: boolean;
  pendencias: PendenciaValidada[];
  uso: { entrada: number; saida: number; modelo: string };
};

export function montarConversa(linhas: LinhaConversa[], contexto: string | null): string {
  const fmt = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
  });
  const corpo = linhas
    .map((l) => `[${l.autor === "adriano" ? "ADRIANO" : "CONTATO"} ${fmt.format(l.momento)}] ${l.texto}`)
    .join("\n");
  return (contexto ? `Contexto já conhecido deste contato:\n${contexto}\n\n` : "") + `Conversa:\n${corpo}`;
}

/** Validação em código do que a IA devolveu. Separada para ser testável sem rede. */
export function validar(a: AnaliseIA, linhas: LinhaConversa[], agora: Date, minimo = 0.7): Omit<ResultadoAnalise, "uso"> {
  const textoTodo = linhas.map((l) => l.texto).join("\n").replace(/\s+/g, " ").toLowerCase();
  const pendencias: PendenciaValidada[] = [];
  for (const p of a.pendencias) {
    const trecho = p.trecho.trim();
    const trechoExiste = trecho.length > 0 && textoTodo.includes(trecho.replace(/\s+/g, " ").toLowerCase());
    if (!trechoExiste) continue; // sem evidência literal, não existe pendência
    const prazo = p.expressao_de_prazo ? interpretarPrazo(p.expressao_de_prazo, agora) : null;
    let motivo: string | null = null;
    if (a.assunto_dinheiro_sensivel) motivo = "envolve pagamento ou dado bancário";
    else if (p.confianca < minimo) motivo = `confiança ${p.confianca.toFixed(2)}`;
    else if (p.expressao_de_prazo && !prazo) motivo = `prazo não reconhecido: "${p.expressao_de_prazo}"`;
    pendencias.push({
      titulo: p.titulo.slice(0, 90),
      quemDeve: p.quem_deve,
      prazo,
      trecho,
      confianca: p.confianca,
      destino: motivo ? "conferir" : "pendencia",
      motivoConferir: motivo,
    });
  }
  return {
    resumo: a.resumo,
    trilha: a.trilha,
    urgencia: a.urgencia,
    adrianoDeveResposta: a.adriano_deve_resposta,
    pendencias,
  };
}

export async function analisarConversa(
  linhas: LinhaConversa[],
  contexto: string | null,
  agora: Date = new Date(),
  client: Anthropic = new Anthropic(),
): Promise<ResultadoAnalise> {
  const resposta = await client.beta.messages.parse({
    model: MODELO,
    max_tokens: 4000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    system: [{ type: "text", text: SISTEMA, cache_control: { type: "ephemeral" } }],
    output_config: { effort: "low", format: betaZodOutputFormat(Analise) },
    messages: [{ role: "user", content: montarConversa(linhas, contexto) }],
  });
  if (resposta.stop_reason === "refusal") throw new Error("Análise recusada pelo modelo");
  if (!resposta.parsed_output) throw new Error(`Saída fora do formato (stop_reason=${resposta.stop_reason})`);
  return {
    ...validar(resposta.parsed_output, linhas, agora),
    uso: { entrada: resposta.usage.input_tokens, saida: resposta.usage.output_tokens, modelo: resposta.model },
  };
}
