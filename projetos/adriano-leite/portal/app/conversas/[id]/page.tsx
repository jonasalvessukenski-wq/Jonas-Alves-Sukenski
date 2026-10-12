import Link from "next/link";
import { notFound } from "next/navigation";
import { conversa, emDemonstracao } from "@/lib/dados";
import { FaixaDemo } from "@/componentes/FaixaDemo";
import { ItemPendencia } from "@/componentes/Pendencia";
import { hora, quando } from "@/componentes/formato";

export const dynamic = "force-dynamic";

export default async function Conversa({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const demo = emDemonstracao();
  const dados = await conversa(id);
  if (!dados) notFound();
  const { contato, mensagens, pendencias } = dados;
  return (
    <>
      <FaixaDemo ativo={demo} />
      <p className="rotulo"><Link href="/conversas">Conversas</Link></p>
      <h1 style={{ marginTop: 12 }}>{contato.nome}</h1>
      {contato.empresa && <p className="lead">{contato.empresa}</p>}

      <div className="grade grade-2 secao">
        <section aria-label="Mensagens">
          <div className="fio-conversa">
            {mensagens.map((m) => (
              <div key={m.id} className={`balao${m.deMim ? " meu" : ""}`}>
                {m.tipo === "audio" && <span className="audio">Áudio transcrito</span>}
                {m.transcricao ?? m.texto ?? <span className="sutil">({m.tipo})</span>}
                <span className="hora">{quando(m.momento)} {quando(m.momento).includes(":") ? "" : `· ${hora(m.momento)}`}</span>
              </div>
            ))}
          </div>
        </section>
        <aside className="primeiro-no-celular">
          {contato.resumo && (
            <div className="resumo">
              <p className="rotulo">Em que pé está</p>
              <p style={{ marginTop: 8 }}>{contato.resumo}</p>
            </div>
          )}
          <div className="secao">
            <div className="secao-cab"><h2>Pendências</h2><span className="sutil">{pendencias.length}</span></div>
            {pendencias.length === 0 ? <p className="sutil">Nenhuma pendência aberta com este contato.</p> : (
              <ul className="lista">{pendencias.map((p) => <ItemPendencia key={p.id} p={p} demo={demo} mostrarContato={false} />)}</ul>
            )}
          </div>
        </aside>
      </div>
    </>
  );
}
