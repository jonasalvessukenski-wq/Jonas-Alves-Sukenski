// Sessão simples para um único dono: senha em variável de ambiente e cookie
// assinado (HMAC). Funciona no middleware (Web Crypto) e no servidor.
export const COOKIE = "portal_sessao";
const DURACAO_S = 60 * 60 * 24 * 30;

async function assinar(valor: string, segredo: string): Promise<string> {
  const chave = await crypto.subtle.importKey("raw", new TextEncoder().encode(segredo), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", chave, new TextEncoder().encode(valor));
  return btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
}

export function protecaoAtiva(): boolean {
  return !!process.env.PORTAL_SENHA && !!process.env.SESSAO_SEGREDO;
}

export async function criarToken(agora = Date.now()): Promise<{ token: string; maxAge: number }> {
  const expira = Math.floor(agora / 1000) + DURACAO_S;
  const corpo = `v1.${expira}`;
  return { token: `${corpo}.${await assinar(corpo, process.env.SESSAO_SEGREDO!)}`, maxAge: DURACAO_S };
}

export async function tokenValido(token: string | undefined, agora = Date.now()): Promise<boolean> {
  if (!token || !process.env.SESSAO_SEGREDO) return false;
  const [v, expira, sig] = token.split(".");
  if (v !== "v1" || !expira || !sig) return false;
  if (Number(expira) * 1000 < agora) return false;
  const esperado = await assinar(`${v}.${expira}`, process.env.SESSAO_SEGREDO);
  if (esperado.length !== sig.length) return false;
  let dif = 0;
  for (let i = 0; i < sig.length; i++) dif |= sig.charCodeAt(i) ^ esperado.charCodeAt(i);
  return dif === 0;
}
