import { hojeEmSP, iso } from "@/lib/datas";

const tz = "America/Sao_Paulo";

export function hora(isoStr: string) {
  return new Intl.DateTimeFormat("pt-BR", { timeZone: tz, hour: "2-digit", minute: "2-digit" }).format(new Date(isoStr));
}

export function quando(isoStr: string, agora = new Date()) {
  const d = new Date(isoStr);
  const min = Math.round((+agora - +d) / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `há ${min} min`;
  const diaMsg = new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(d);
  const hoje = iso(hojeEmSP(agora));
  if (diaMsg === hoje) return hora(isoStr);
  return new Intl.DateTimeFormat("pt-BR", { timeZone: tz, day: "2-digit", month: "short" }).format(d).replace(".", "");
}

export function prazo(data: string | null, horaStr: string | null, agora = new Date()): { texto: string; classe: string } | null {
  if (!data) return null;
  const hoje = iso(hojeEmSP(agora));
  const [a, m, d] = data.split("-").map(Number);
  const dias = Math.round((Date.UTC(a, m - 1, d) - Date.parse(`${hoje}T00:00:00Z`)) / 86400000);
  const h = horaStr ? ` · ${horaStr}` : "";
  if (dias < 0) return { texto: `atrasada ${-dias}d`, classe: "atrasada" };
  if (dias === 0) return { texto: `hoje${h}`, classe: "hoje" };
  if (dias === 1) return { texto: `amanhã${h}`, classe: "" };
  const nome = new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC", weekday: "short", day: "2-digit", month: "2-digit" }).format(new Date(Date.UTC(a, m - 1, d)));
  return { texto: nome.replace(".", "") + h, classe: "" };
}

export function dataExtensa(agora = new Date()) {
  return new Intl.DateTimeFormat("pt-BR", { timeZone: tz, weekday: "long", day: "numeric", month: "long" }).format(agora);
}

export function saudacao(agora = new Date()) {
  const h = Number(new Intl.DateTimeFormat("en-US", { timeZone: tz, hour: "numeric", hour12: false }).format(agora));
  return h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
}
