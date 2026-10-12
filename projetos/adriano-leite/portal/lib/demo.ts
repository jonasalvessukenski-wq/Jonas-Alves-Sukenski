// DADOS FICTÍCIOS para o modo demonstração. Nenhum nome, número ou empresa real.
import type { ContatoResumo, Mensagem, Pendencia, Reuniao, Saude } from "./dados";
import { hojeEmSP, interpretarPrazo, iso } from "./datas";

const agora = () => Date.now();
const minAtras = (m: number) => new Date(agora() - m * 60000).toISOString();
const hoje = () => iso(hojeEmSP());
const emDias = (n: number) => {
  const d = new Date(`${hoje()}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};
const horaHoje = (h: number, m = 0) => {
  const d = new Date(`${hoje()}T00:00:00-03:00`);
  return new Date(+d + (h * 60 + m) * 60000).toISOString();
};

export const conversas: ContatoResumo[] = [
  {
    id: "d1", nome: "Helena Prado", empresa: "Banco Exemplo", situacao: "confirmado",
    ultimaMensagem: { texto: "Consegue me mandar o balanço do 1º semestre até sexta? O comitê é dia 28.", momento: minAtras(12), deMim: false },
    resumo: "Operação de capital de giro da Indústria Exemplo em análise. Banco pede balanço do 1º semestre antes do comitê.",
    deveResposta: true, urgencia: "hoje", naoLidas: 2,
  },
  {
    id: "d2", nome: "Rafael Moura", empresa: "Frigorífico Exemplo", situacao: "confirmado",
    ultimaMensagem: { texto: "(áudio) Adriano, a carta do banco ficou pronta, só falta a assinatura do sócio...", momento: minAtras(48), deMim: false },
    resumo: "Cliente reunindo documentos para três bancos. Falta assinatura do sócio na carta e o endividamento atualizado.",
    deveResposta: false, urgencia: "semana", naoLidas: 0,
  },
  {
    id: "d3", nome: "Turma de Valuation", empresa: null, situacao: "confirmado",
    ultimaMensagem: { texto: "Professor, a gravação de sábado já está na plataforma?", momento: minAtras(95), deMim: false },
    resumo: "Alunos perguntando pela gravação da aula de sábado.",
    deveResposta: true, urgencia: "semana", naoLidas: 3,
  },
  {
    id: "d4", nome: "Paulo Teixeira", empresa: "Escritório Exemplo", situacao: "confirmado",
    ultimaMensagem: { texto: "Fechado. Te mando o mandato assinado amanhã cedo.", momento: minAtras(180), deMim: false },
    resumo: "Mandato da operação combinado; cliente envia assinado amanhã.",
    deveResposta: false, urgencia: "rotina", naoLidas: 0,
  },
  {
    id: "d5", nome: "Lucas (não confirmado)", empresa: null, situacao: "pendente",
    ultimaMensagem: { texto: "Boa tarde, peguei seu contato com um aluno. Podemos falar sobre uma captação?", momento: minAtras(240), deMim: false },
    resumo: "Número novo pedindo conversa sobre captação. Origem: indicação de aluno.",
    deveResposta: true, urgencia: "semana", naoLidas: 1,
  },
];

const mensagensPorContato: Record<string, Mensagem[]> = {
  d1: [
    { id: "m1", deMim: false, momento: minAtras(60 * 26), tipo: "texto", texto: "Bom dia, Adriano. Recebi o material da Indústria Exemplo, obrigada.", transcricao: null },
    { id: "m2", deMim: true, momento: minAtras(60 * 25), tipo: "texto", texto: "Bom dia, Helena. Qualquer dúvida me chama.", transcricao: null },
    { id: "m3", deMim: false, momento: minAtras(14), tipo: "texto", texto: "Adriano, avançamos bem na análise.", transcricao: null },
    { id: "m4", deMim: false, momento: minAtras(12), tipo: "texto", texto: "Consegue me mandar o balanço do 1º semestre até sexta? O comitê é dia 28.", transcricao: null },
  ],
  d2: [
    { id: "m5", deMim: true, momento: minAtras(300), tipo: "texto", texto: "Rafael, precisamos da carta assinada e do endividamento com data-base de 30/09.", transcricao: null },
    { id: "m6", deMim: false, momento: minAtras(48), tipo: "audio", texto: null, transcricao: "Adriano, a carta do banco ficou pronta, só falta a assinatura do sócio. O endividamento eu te mando amanhã de manhã." },
  ],
};

export const pendencias: Pendencia[] = [
  { id: "p1", titulo: "Enviar balanço do 1º semestre ao banco", contatoId: "d1", contatoNome: "Helena Prado (Banco Exemplo)", quemDeve: "adriano", prazoData: interpretarPrazo("até sexta")?.data ?? null, prazoHora: null, situacao: "aberta", motivoConferir: null, evidencias: ["Consegue me mandar o balanço do 1º semestre até sexta?"] },
  { id: "p2", titulo: "Responder alunos sobre a gravação de sábado", contatoId: "d3", contatoNome: "Turma de Valuation", quemDeve: "adriano", prazoData: hoje(), prazoHora: null, situacao: "aberta", motivoConferir: null, evidencias: ["Professor, a gravação de sábado já está na plataforma?"] },
  { id: "p3", titulo: "Receber carta assinada pelo sócio", contatoId: "d2", contatoNome: "Rafael Moura (Frigorífico Exemplo)", quemDeve: "contato", prazoData: null, prazoHora: null, situacao: "aguardando", motivoConferir: null, evidencias: ["só falta a assinatura do sócio"] },
  { id: "p4", titulo: "Receber endividamento atualizado", contatoId: "d2", contatoNome: "Rafael Moura (Frigorífico Exemplo)", quemDeve: "contato", prazoData: emDias(1), prazoHora: null, situacao: "aguardando", motivoConferir: null, evidencias: ["O endividamento eu te mando amanhã de manhã."] },
  { id: "p5", titulo: "Receber mandato assinado", contatoId: "d4", contatoNome: "Paulo Teixeira (Escritório Exemplo)", quemDeve: "contato", prazoData: emDias(1), prazoHora: null, situacao: "aguardando", motivoConferir: null, evidencias: ["Te mando o mandato assinado amanhã cedo."] },
  { id: "p6", titulo: "Marcar conversa sobre captação", contatoId: "d5", contatoNome: "Lucas (não confirmado)", quemDeve: "adriano", prazoData: null, prazoHora: null, situacao: "conferir", motivoConferir: "contato ainda não confirmado", evidencias: ["Podemos falar sobre uma captação?"] },
  { id: "p7", titulo: "Atualizar dados bancários do fornecedor", contatoId: "d4", contatoNome: "Paulo Teixeira (Escritório Exemplo)", quemDeve: "adriano", prazoData: null, prazoHora: null, situacao: "conferir", motivoConferir: "envolve pagamento ou dado bancário", evidencias: ["segue a conta nova para o pagamento"] },
];

export const reunioes: Reuniao[] = [
  { id: "r1", titulo: "Comitê interno — carteira de crédito", inicio: horaHoje(9), fim: horaHoje(9, 45), participantes: ["Equipe"], resumo: null },
  { id: "r2", titulo: "Indústria Exemplo — alinhamento com o banco", inicio: horaHoje(11), fim: horaHoje(11, 30), participantes: ["Helena Prado", "Cliente"], resumo: null },
  { id: "r3", titulo: "Mentoria individual", inicio: horaHoje(14), fim: horaHoje(15), participantes: ["Aluno"], resumo: null },
  { id: "r4", titulo: "Frigorífico Exemplo — documentos", inicio: horaHoje(16), fim: horaHoje(16, 30), participantes: ["Rafael Moura"], resumo: null },
  { id: "r5", titulo: "Aula ao vivo — Valuation", inicio: horaHoje(19), fim: horaHoje(21), participantes: ["Turma"], resumo: null },
];

export const contatosPendentes = [
  { id: "d5", apelido: "Lucas", telefone: "5511900000000", primeira: "Boa tarde, peguei seu contato com um aluno. Podemos falar sobre uma captação?" },
];

export const saude: Saude = {
  capturaLigada: true,
  analiseLigada: true,
  envioAutomatico: false,
  ultimaMensagem: minAtras(12),
  fila: { aguardando: 1, processando: 0, mortas: 0 },
  mortas: [],
  conflitos: 0,
  tokensHoje: { entrada: 41200, saida: 6100, analises: 23 },
  eventos: [
    { momento: minAtras(12), tipo: "recebida", detalhe: '{"tipo":"texto"}' },
    { momento: minAtras(11), tipo: "analisou", detalhe: '{"mensagens":2,"pendencias":1}' },
    { momento: minAtras(48), tipo: "recebida", detalhe: '{"tipo":"audio"}' },
    { momento: minAtras(240), tipo: "contato_criado", detalhe: '{"situacao":"pendente"}' },
  ],
};

export function conversa(id: string) {
  const contato = conversas.find((c) => c.id === id);
  if (!contato) return null;
  const mensagens = mensagensPorContato[id] ?? [
    { id: `${id}-u`, deMim: contato.ultimaMensagem!.deMim, momento: contato.ultimaMensagem!.momento, tipo: "texto", texto: contato.ultimaMensagem!.texto, transcricao: null },
  ];
  return { contato, mensagens, pendencias: pendencias.filter((p) => p.contatoId === id) };
}

export function buscar(termo: string) {
  const t = termo.trim().toLowerCase();
  if (t.length < 3) return [];
  const out: { contatoId: string | null; contato: string; momento: string; trecho: string }[] = [];
  for (const c of conversas) {
    for (const m of conversa(c.id)!.mensagens) {
      const txt = m.transcricao ?? m.texto ?? "";
      if (txt.toLowerCase().includes(t)) out.push({ contatoId: c.id, contato: c.nome, momento: m.momento, trecho: txt });
    }
  }
  return out;
}
