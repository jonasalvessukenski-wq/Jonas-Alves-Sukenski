import { emDemonstracao, listarPendencias } from "@/lib/dados";
import { FaixaDemo } from "@/componentes/FaixaDemo";
import { ItemPendencia } from "@/componentes/Pendencia";
import { novaPendencia } from "@/app/acoes";

export const dynamic = "force-dynamic";

export default async function Pendencias() {
  const demo = emDemonstracao();
  const todas = await listarPendencias();
  const colunas = [
    { titulo: "Fazer", sub: "depende de você", itens: todas.filter((p) => p.situacao === "aberta" && p.quemDeve === "adriano") },
    { titulo: "Aguardando", sub: "depende de outra pessoa", itens: todas.filter((p) => p.situacao === "aguardando" || (p.situacao === "aberta" && p.quemDeve !== "adriano")) },
    { titulo: "Conferir", sub: "o sistema ficou em dúvida", itens: todas.filter((p) => p.situacao === "conferir") },
  ];
  return (
    <>
      <FaixaDemo ativo={demo} />
      <p className="rotulo">Quadro</p>
      <h1 style={{ marginTop: 12 }}>Pendências</h1>
      <p className="lead">Tudo que saiu das conversas, com o trecho que originou cada item. Só você conclui.</p>

      <form action={novaPendencia} className="linha-form secao" aria-label="Nova pendência">
        <div className="campo"><label htmlFor="titulo">Nova pendência</label><input id="titulo" name="titulo" className="entrada" placeholder="Ex.: Ligar para o banco" disabled={demo} /></div>
        <div className="campo"><label htmlFor="prazo">Prazo</label><input id="prazo" name="prazo" type="date" className="entrada" disabled={demo} /></div>
        <button className="botao primario" disabled={demo}>Adicionar</button>
      </form>

      <div className="quadro secao">
        {colunas.map((c) => (
          <section key={c.titulo}>
            <div className="coluna-cab">
              <div><h2>{c.titulo}</h2><span className="sutil">{c.sub}</span></div>
              <span className="contagem">{c.itens.length}</span>
            </div>
            <ul className="lista">{c.itens.map((p) => <ItemPendencia key={p.id} p={p} demo={demo} />)}</ul>
          </section>
        ))}
      </div>
    </>
  );
}
