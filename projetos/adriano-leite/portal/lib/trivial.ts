// Mensagens que sozinhas não pedem análise de IA ("ok", "👍", "valeu").
// Não são descartadas: ficam gravadas e entram como contexto da conversa.
// Só não disparam análise sozinhas. Mensagem curta com conteúdo ("assinado",
// "JB tem estoque?") NÃO é trivial — o erro antigo foi tratá-la como ruído.

const CORTESIAS = new Set([
  "ok", "okay", "oks", "okk", "blz", "beleza", "show", "top", "perfeito", "certo", "certinho",
  "obrigado", "obrigada", "obg", "brigado", "valeu", "vlw", "tmj", "fechado", "combinado",
  "bom dia", "boa tarde", "boa noite", "oi", "ola", "olá", "opa", "e ai", "e aí",
  "sim", "ss", "isso", "exato", "entendi", "ciente", "anotado", "joia", "jóia",
  "kk", "kkk", "kkkk", "rs", "rsrs", "haha", "hahaha", "amem", "amém", "gloria a deus", "glória a deus",
]);

const SO_EMOJI_OU_PONTUACAO = /^[\p{Extended_Pictographic}\p{Emoji_Component}\p{P}\s]+$/u;

export function ehTrivial(texto: string | null | undefined): boolean {
  if (!texto) return true;
  const t = texto.trim();
  if (!t) return true;
  if (SO_EMOJI_OU_PONTUACAO.test(t)) return true;
  const limpo = t
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[!.,;:?…]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (CORTESIAS.has(limpo)) return true;
  // "ok obrigado", "valeu, bom dia": todas as palavras são cortesia.
  const palavras = limpo.split(" ");
  if (palavras.length <= 4 && palavras.every((p) => CORTESIAS.has(p) || p.length <= 1)) return true;
  // Reações em dupla ("bom dia, obrigado")
  const pares = limpo.replace(/\b(bom dia|boa tarde|boa noite|e ai|gloria a deus)\b/g, "").trim();
  return pares.length > 0 && pares.split(" ").every((p) => CORTESIAS.has(p));
}
