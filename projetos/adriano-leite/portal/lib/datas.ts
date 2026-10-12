// Datas são calculadas em código, no fuso de São Paulo. A IA só devolve a
// expressão literal ("até sexta", "amanhã às 16h"); quem converte é esta função.
// Erro de origem: a IA transformou "até sexta" em quarta-feira, e o servidor
// rodava em UTC.

export const FUSO = "America/Sao_Paulo";

export type DataLocal = { ano: number; mes: number; dia: number }; // mes 1-12
export type Prazo = { data: string; hora: string | null; certeza: "exata" | "aproximada" };

/** Data de hoje em São Paulo, independente do fuso do servidor. */
export function hojeEmSP(agora: Date = new Date()): DataLocal {
  const p = new Intl.DateTimeFormat("en-CA", {
    timeZone: FUSO, year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(agora);
  const v = (t: string) => Number(p.find((x) => x.type === t)!.value);
  return { ano: v("year"), mes: v("month"), dia: v("day") };
}

function paraUTC(d: DataLocal): Date {
  return new Date(Date.UTC(d.ano, d.mes - 1, d.dia));
}
function deUTC(x: Date): DataLocal {
  return { ano: x.getUTCFullYear(), mes: x.getUTCMonth() + 1, dia: x.getUTCDate() };
}
function somarDias(d: DataLocal, n: number): DataLocal {
  const x = paraUTC(d);
  x.setUTCDate(x.getUTCDate() + n);
  return deUTC(x);
}
function diaDaSemana(d: DataLocal): number {
  return paraUTC(d).getUTCDay(); // 0 = domingo
}
export function iso(d: DataLocal): string {
  return `${d.ano}-${String(d.mes).padStart(2, "0")}-${String(d.dia).padStart(2, "0")}`;
}

const SEMANA: Record<string, number> = {
  domingo: 0, segunda: 1, terca: 2, quarta: 3, quinta: 4, sexta: 5, sabado: 6,
};
const MESES: Record<string, number> = {
  janeiro: 1, fevereiro: 2, marco: 3, abril: 4, maio: 5, junho: 6, julho: 7,
  agosto: 8, setembro: 9, outubro: 10, novembro: 11, dezembro: 12,
};

function limpar(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ").trim();
}

function extrairHora(t: string): string | null {
  // 16h, 16h30, 16:30, às 9, 9 horas, meio-dia
  if (/\bmeio[- ]dia\b/.test(t)) return "12:00";
  let m = /\b(?:as|a partir das|ate as)?\s*(\d{1,2})\s*(?:h|:|hs|hrs|horas)\s*(\d{2})?\b/.exec(t);
  if (!m) m = /\bas (\d{1,2})\b(?!\s*\/)/.exec(t);
  if (!m) return null;
  const h = Number(m[1]);
  const min = m[2] ? Number(m[2]) : 0;
  if (h > 23 || min > 59) return null;
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

/**
 * Converte uma expressão em português para data (e hora, se houver).
 * Devolve null quando não há data reconhecível — melhor não marcar do que marcar errado.
 */
export function interpretarPrazo(expressao: string, agora: Date = new Date()): Prazo | null {
  const t = limpar(expressao);
  const hoje = hojeEmSP(agora);
  const hora = extrairHora(t);

  // dd/mm ou dd/mm/aaaa
  let m = /\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/.exec(t);
  if (m) {
    const dia = Number(m[1]);
    const mes = Number(m[2]);
    let ano = m[3] ? Number(m[3]) : hoje.ano;
    if (ano < 100) ano += 2000;
    if (mes < 1 || mes > 12 || dia < 1 || dia > 31) return null;
    let d: DataLocal = { ano, mes, dia };
    if (!m[3] && iso(d) < iso(hoje)) d = { ...d, ano: ano + 1 };
    if (deUTC(paraUTC(d)).dia !== dia) return null; // 31/02
    return { data: iso(d), hora, certeza: "exata" };
  }

  // "dia 15 de outubro", "15 de outubro"
  m = /\b(?:dia )?(\d{1,2}) de (janeiro|fevereiro|marco|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)\b/.exec(t);
  if (m) {
    let d: DataLocal = { ano: hoje.ano, mes: MESES[m[2]], dia: Number(m[1]) };
    if (iso(d) < iso(hoje)) d = { ...d, ano: d.ano + 1 };
    return { data: iso(d), hora, certeza: "exata" };
  }

  if (/\bdepois de amanha\b/.test(t)) return { data: iso(somarDias(hoje, 2)), hora, certeza: "exata" };
  if (/\bamanha\b/.test(t)) return { data: iso(somarDias(hoje, 1)), hora, certeza: "exata" };
  if (/\b(hoje|agora|ainda hoje|hj)\b/.test(t)) return { data: iso(hoje), hora, certeza: "exata" };

  // Dia da semana: "sexta", "até sexta", "na segunda", "semana que vem na terça"
  m = /\b(domingo|segunda|terca|quarta|quinta|sexta|sabado)(?:-feira)?\b/.exec(t);
  if (m) {
    const alvo = SEMANA[m[1]];
    let delta = (alvo - diaDaSemana(hoje) + 7) % 7;
    if (delta === 0) delta = 7; // "sexta" dito numa sexta = a próxima
    if (/\b(semana que vem|proxima semana)\b/.test(t) && delta < 7) {
      // "semana que vem na terça": a terça da semana seguinte (seg-dom)
      const ateDomingo = (7 - diaDaSemana(hoje)) % 7;
      if (delta <= ateDomingo) delta += 7;
    }
    return { data: iso(somarDias(hoje, delta)), hora, certeza: "exata" };
  }

  if (/\b(semana que vem|proxima semana)\b/.test(t)) {
    const ateSegunda = ((8 - diaDaSemana(hoje)) % 7) || 7;
    return { data: iso(somarDias(hoje, ateSegunda)), hora, certeza: "aproximada" };
  }
  if (/\b(fim de semana|final de semana)\b/.test(t)) {
    const ateSabado = ((6 - diaDaSemana(hoje)) + 7) % 7 || 7;
    return { data: iso(somarDias(hoje, ateSabado)), hora, certeza: "aproximada" };
  }
  if (/\b(fim do mes|final do mes)\b/.test(t)) {
    const ultimo = deUTC(new Date(Date.UTC(hoje.ano, hoje.mes, 0)));
    return { data: iso(ultimo), hora, certeza: "aproximada" };
  }
  return null;
}
