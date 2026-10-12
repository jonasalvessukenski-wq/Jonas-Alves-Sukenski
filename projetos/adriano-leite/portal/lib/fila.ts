// Duas decisões determinísticas que vivem fora da IA:
// 1. Quando uma conversa está pronta para análise (análise por conversa,
//    não por mensagem — cada "ok" passando pela IA foi o custo antigo).
// 2. O que fazer quando um passo falha (429/503 derrubavam a mensagem antes;
//    agora a mensagem já está gravada e o passo é repetido com espera crescente).

import { ehTrivial } from "./trivial";

export type MensagemPendente = { recebidaEm: Date; texto: string | null; tipo: string };

export type JanelaConfig = {
  silencioMin: number; // conversa parada há X minutos → analisa
  esperaMaxMin: number; // mensagem mais antiga esperando há X minutos → analisa mesmo sem silêncio
  maxMensagens: number; // acumulou X mensagens → analisa
};

export const JANELA_PADRAO: JanelaConfig = { silencioMin: 4, esperaMaxMin: 20, maxMensagens: 15 };

export type DecisaoJanela =
  | { acao: "aguardar" }
  | { acao: "fechar_sem_ia"; motivo: string } // só cortesias: marca como lida, custo zero
  | { acao: "analisar"; motivo: string };

export function decidirJanela(
  pendentes: MensagemPendente[],
  agora: Date,
  cfg: JanelaConfig = JANELA_PADRAO,
): DecisaoJanela {
  if (pendentes.length === 0) return { acao: "aguardar" };
  const ordenadas = [...pendentes].sort((a, b) => +a.recebidaEm - +b.recebidaEm);
  const primeira = ordenadas[0].recebidaEm;
  const ultima = ordenadas[ordenadas.length - 1].recebidaEm;
  const min = (d: Date) => (+agora - +d) / 60000;

  const pronta =
    pendentes.length >= cfg.maxMensagens
      ? "volume"
      : min(ultima) >= cfg.silencioMin
        ? "silencio"
        : min(primeira) >= cfg.esperaMaxMin
          ? "espera_maxima"
          : null;
  if (!pronta) return { acao: "aguardar" };

  const temConteudo = pendentes.some((m) => m.tipo !== "texto" || !ehTrivial(m.texto));
  return temConteudo ? { acao: "analisar", motivo: pronta } : { acao: "fechar_sem_ia", motivo: "so_cortesia" };
}

const ESPERAS_MIN = [1, 5, 15, 60, 240];
export const MAX_TENTATIVAS = ESPERAS_MIN.length + 1;

export type Falha = { status?: number; rede?: boolean };

export function ehRepetivel(f: Falha): boolean {
  if (f.rede) return true;
  if (f.status === undefined) return true;
  return f.status === 408 || f.status === 409 || f.status === 429 || f.status >= 500;
}

export type ProximoPasso =
  | { estado: "aguardando"; tentarEm: Date }
  | { estado: "morta"; motivo: string }; // aparece no painel "Saúde", nunca some calada

export function aposFalha(tentativasFeitas: number, f: Falha, agora: Date): ProximoPasso {
  if (!ehRepetivel(f)) return { estado: "morta", motivo: `erro não repetível (${f.status})` };
  if (tentativasFeitas >= MAX_TENTATIVAS) return { estado: "morta", motivo: "tentativas esgotadas" };
  const espera = ESPERAS_MIN[Math.min(Math.max(tentativasFeitas - 1, 0), ESPERAS_MIN.length - 1)];
  return { estado: "aguardando", tentarEm: new Date(+agora + espera * 60000) };
}
