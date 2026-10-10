// Antes de criar uma pendência, compara com as pendências abertas do mesmo
// contato. A trava antiga ("mesmo dia + duas palavras em comum") deixava passar
// duplicatas e ainda juntava coisas diferentes. Aqui a comparação é por
// palavras significativas (sem acento, sem palavra vazia, com radical simples),
// medida por sobreposição, e só entre pendências do mesmo contato.

const VAZIAS = new Set(
  ("a o as os um uma uns umas de da do das dos em no na nos nas para pra pro por com sem " +
    "e ou que se ao aos à às eu tu ele ela nos vos eles elas me te lhe meu minha seu sua " +
    "isso isto aquilo esse essa este esta ja já ainda hoje amanha amanhã sobre ate até " +
    "mais menos muito pouco bem vai vou ir fazer ver ter tem é ser estar esta está foi " +
    "favor por favor pf pfv obrigado sr sra dr dra").split(/\s+/),
);

const SUFIXOS = [
  "amentos", "imentos", "amento", "imento", "acoes", "acao", "ando", "endo", "indo",
  "ados", "adas", "idos", "idas", "ado", "ada", "ido", "ida", "ar", "er", "ir",
  "as", "es", "os", "a", "e", "o", "s",
];

export function radical(p: string): string {
  // Radical grosseiro em português: "enviar/envio/enviado" → "envi".
  for (const s of SUFIXOS) {
    if (p.endsWith(s) && p.length - s.length >= 3) return p.slice(0, -s.length);
  }
  return p;
}

export function palavrasChave(texto: string): Set<string> {
  const limpo = texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ");
  const out = new Set<string>();
  for (const p of limpo.split(/\s+/)) {
    if (p.length < 3 || VAZIAS.has(p)) continue;
    out.add(/^\d+$/.test(p) ? p : radical(p));
  }
  return out;
}

/** Sobreposição: interseção / menor conjunto. 1 = um contém o outro. */
export function semelhanca(a: string, b: string): number {
  const A = palavrasChave(a);
  const B = palavrasChave(b);
  if (A.size === 0 || B.size === 0) return 0;
  let comum = 0;
  for (const x of A) if (B.has(x)) comum++;
  return comum / Math.min(A.size, B.size);
}

export type PendenciaAberta = { id: string; contatoId: string; titulo: string };

export type Veredito =
  | { acao: "criar" }
  | { acao: "anexar"; pendenciaId: string; semelhanca: number } // mesma coisa: só acrescenta evidência
  | { acao: "revisar"; pendenciaId: string; semelhanca: number }; // parecida: Adriano decide

export function decidir(
  novoTitulo: string,
  contatoId: string,
  abertas: PendenciaAberta[],
  limites = { anexar: 0.8, revisar: 0.5 },
): Veredito {
  let melhor: { id: string; s: number } | null = null;
  for (const p of abertas) {
    if (p.contatoId !== contatoId) continue;
    const s = semelhanca(novoTitulo, p.titulo);
    if (!melhor || s > melhor.s) melhor = { id: p.id, s };
  }
  if (!melhor) return { acao: "criar" };
  if (melhor.s >= limites.anexar) return { acao: "anexar", pendenciaId: melhor.id, semelhanca: melhor.s };
  if (melhor.s >= limites.revisar) return { acao: "revisar", pendenciaId: melhor.id, semelhanca: melhor.s };
  return { acao: "criar" };
}
