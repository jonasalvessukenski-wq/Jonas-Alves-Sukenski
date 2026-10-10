// Identidade de telefone. Regra herdada da automação do Jonas:
// a Z-API às vezes entrega o celular sem o nono dígito e às vezes entrega
// só o LID (identificador interno do WhatsApp, termina em @lid).
// LID nunca é telefone. Telefone nunca é comparado pelo texto cru.

export type Identificador =
  | { tipo: "telefone"; e164: string; chave: string }
  | { tipo: "lid"; lid: string }
  | { tipo: "invalido"; bruto: string };

const SO_DIGITOS = /\D+/g;

export function ehLid(bruto: string): boolean {
  return /@lid\b/i.test(bruto);
}

/**
 * Normaliza um número vindo do WhatsApp, de agenda ou digitado.
 * Devolve o E.164 sem "+" e a chave estável usada para casar contatos:
 * para o Brasil, 55 + DDD + últimos 8 dígitos (imune ao nono dígito).
 */
export function normalizar(bruto: string): Identificador {
  if (!bruto || !bruto.trim()) return { tipo: "invalido", bruto };
  if (ehLid(bruto)) {
    const lid = bruto.split("@")[0].replace(SO_DIGITOS, "");
    return lid ? { tipo: "lid", lid } : { tipo: "invalido", bruto };
  }

  let d = bruto.split("@")[0].replace(SO_DIGITOS, "");
  if (d.startsWith("00")) d = d.slice(2);

  // Número nacional sem DDI: 10 (fixo) ou 11 (celular) dígitos.
  if (d.length === 10 || d.length === 11) d = "55" + d;

  if (d.startsWith("55") && (d.length === 12 || d.length === 13)) {
    const ddd = d.slice(2, 4);
    let local = d.slice(4);
    if (Number(ddd[0]) === 0) return { tipo: "invalido", bruto };
    // Celular sem o nono dígito: 8 dígitos começando por 6, 7, 8 ou 9.
    if (local.length === 8 && /^[6-9]/.test(local)) local = "9" + local;
    const e164 = "55" + ddd + local;
    return { tipo: "telefone", e164, chave: "55" + ddd + local.slice(-8) };
  }

  // Estrangeiro ou formato desconhecido: aceita E.164 plausível como está.
  if (d.length >= 8 && d.length <= 15) return { tipo: "telefone", e164: d, chave: d };
  return { tipo: "invalido", bruto };
}

/** Exibição amigável: +55 11 91234-5678 */
export function formatar(e164: string): string {
  const m = /^55(\d{2})(\d{4,5})(\d{4})$/.exec(e164);
  return m ? `+55 ${m[1]} ${m[2]}-${m[3]}` : `+${e164}`;
}
