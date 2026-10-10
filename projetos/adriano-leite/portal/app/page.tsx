import Link from "next/link";
import { emDemonstracao, listarConversas, listarPendencias, reunioesDoDia } from "@/lib/dados";
import { FaixaDemo } from "@/componentes/FaixaDemo";
import { ItemPendencia } from "@/componentes/Pendencia";
import { dataExtensa, hora, quando, saudacao } from "@/componentes/formato";
import { hojeEmSP, iso } from "@/lib/datas";

export const dynamic = "force-dynamic";

export default async function Hoje() {
  const demo = emDemonstracao();
  const [conversas, pendencias, reunioes] = await Promise.all([listarConversas(), listarPendencias(), reunioesDoDia()]);
  const hoje = iso(hojeEmSP());
  const devoResposta = conversas.filter((c) => c.deveResposta);
  const doDia = pendencias.filter((p) => p.situacao === "aberta" && p.quemDeve === "adriano" && p.prazoData && p.prazoData <= hoje);
  const conferir = pendencias.filter((p) => p.situacao === "conferir");
  const agora = Date.now();
  const proxima = reunioes.find((r) => +new Date(r.inicio) > agora);

  const frase = [
    devoResposta.length && `${devoResposta.length} ${devoResposta.length === 1 ? "pessoa espera" : "pessoas esperam"} sua resposta`,
    doDia.length && `${doDia.length} ${doDia.length === 1 ? "pendência vence" : "pendências vencem"} hoje`,
    reunioes.length && `${reunioes.length} ${reunioes.length === 1 ? "reunião" : "reuniões"} na agenda`,
  ].filter(Boolean);

  return (
    <>
      <FaixaDemo ativo={demo} />
      <header className="entra">
        <p className="rotulo">{dataExtensa()}</p>
        <h1 style={{ marginTop: 12 }}>{saudacao()}, Adriano.</h1>
        <p className="lead">{frase.length ? frase.join(" · ") + "." : "Nada esperando por você agora."}</p>
        {proxima && (
          <p style={{ marginTop: 16 }}>
            <span className="rotulo">Próxima</span>{" "}
            <span className="mono">{hora(proxima.inicio)}</span> {proxima.titulo}
          </p>
        )}
      </header>

      <div className="grade grade-2 secao">
        <div>
          <section>
            <div className="secao-cab"><h2>Esperam sua resposta</h2><Link className="sutil" href="/conversas">Todas</Link></div>
            {devoResposta.length === 0 ? <p className="sutil">Ninguém esperando.</p> : (
              <ul className="lista">
                {devoResposta.map((c) => (
                  <li key={c.id}>
                    <Link className="item" href={`/conversas/${c.id}`}>
                      <span className="item-titulo"><span className="marca-resposta" aria-hidden="true" />{c.nome}{c.empresa ? <span className="sutil"> · {c.empresa}</span> : null}</span>
                      <span className="item-meta">{c.ultimaMensagem && quando(c.ultimaMensagem.momento)}</span>
                      <span className="item-texto">{c.resumo ?? c.ultimaMensagem?.texto}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="secao">
            <div className="secao-cab"><h2>Vence hoje</h2><Link className="sutil" href="/pendencias">Quadro</Link></div>
            {doDia.length === 0 ? <p className="sutil">Nada vencendo hoje.</p> : (
              <ul className="lista">{doDia.map((p) => <ItemPendencia key={p.id} p={p} demo={demo} />)}</ul>
            )}
          </section>

          {conferir.length > 0 && (
            <section className="secao">
              <div className="secao-cab"><h2>Para você conferir</h2><span className="sutil">{conferir.length}</span></div>
              <p className="sutil" style={{ marginTop: 12 }}>O sistema ficou em dúvida. Nada aqui vira pendência sem a sua confirmação.</p>
              <ul className="lista">{conferir.map((p) => <ItemPendencia key={p.id} p={p} demo={demo} />)}</ul>
            </section>
          )}
        </div>

        <aside>
          <div className="secao-cab"><h2>Agenda</h2><span className="sutil">{reunioes.length}</span></div>
          {reunioes.length === 0 ? <p className="sutil">Agenda ainda não conectada ou sem reuniões hoje.</p> : (
            <ul className="lista agenda">
              {reunioes.map((r) => {
                const passou = r.fim ? +new Date(r.fim) < agora : +new Date(r.inicio) < agora;
                const agoraMesmo = +new Date(r.inicio) <= agora && !passou;
                return (
                  <li key={r.id} className={passou ? "passada" : agoraMesmo ? "agora" : ""}>
                    <span className="hora">{hora(r.inicio)}</span>
                    <span>
                      <span className="titulo">{r.titulo}</span>
                      <span className="sutil" style={{ display: "block" }}>{agoraMesmo ? "acontecendo agora · " : ""}{r.participantes.join(", ")}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>
      </div>
    </>
  );
}
