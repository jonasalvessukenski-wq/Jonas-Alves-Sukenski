import Link from "next/link";
import { buscar, emDemonstracao } from "@/lib/dados";
import { FaixaDemo } from "@/componentes/FaixaDemo";
import { quando } from "@/componentes/formato";

export const dynamic = "force-dynamic";

export default async function Busca({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const resultados = q ? await buscar(q) : [];
  return (
    <>
      <FaixaDemo ativo={emDemonstracao()} />
      <p className="rotulo">Memória</p>
      <h1 style={{ marginTop: 12 }}>Busca</h1>
      <p className="lead">Procure em todas as mensagens e transcrições de áudio.</p>
      <form className="secao" role="search">
        <div className="campo">
          <label htmlFor="q">Palavra, nome ou assunto</label>
          <input id="q" name="q" defaultValue={q} className="entrada" placeholder="Ex.: balanço, mandato, comitê" autoFocus />
        </div>
      </form>
      {q && (
        <section className="secao">
          <div className="secao-cab"><h2>{resultados.length} {resultados.length === 1 ? "resultado" : "resultados"}</h2></div>
          <ul className="lista">
            {resultados.map((r, i) => (
              <li key={i}>
                <Link className="item" href={r.contatoId ? `/conversas/${r.contatoId}` : "#"}>
                  <span className="item-titulo">{r.contato}</span>
                  <span className="item-meta">{quando(r.momento)}</span>
                  <span className="item-texto">{r.trecho}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
