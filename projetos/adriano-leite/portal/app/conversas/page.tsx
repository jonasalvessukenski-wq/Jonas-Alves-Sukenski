import Link from "next/link";
import { emDemonstracao, listarConversas } from "@/lib/dados";
import { FaixaDemo } from "@/componentes/FaixaDemo";
import { quando } from "@/componentes/formato";

export const dynamic = "force-dynamic";

export default async function Conversas() {
  const conversas = await listarConversas();
  const pendentes = conversas.filter((c) => c.situacao === "pendente").length;
  return (
    <>
      <FaixaDemo ativo={emDemonstracao()} />
      <p className="rotulo">WhatsApp e e-mail</p>
      <h1 style={{ marginTop: 12 }}>Conversas</h1>
      <p className="lead">Cada contato em uma linha, com o resumo do que está em andamento.</p>
      {pendentes > 0 && (
        <p style={{ marginTop: 24 }}>
          <Link className="botao" href="/contatos">{pendentes} {pendentes === 1 ? "número novo" : "números novos"} para identificar</Link>
        </p>
      )}
      <ul className="lista secao">
        {conversas.map((c) => (
          <li key={c.id}>
            <Link className="item" href={`/conversas/${c.id}`}>
              <span className="item-titulo">
                {c.deveResposta && <span className="marca-resposta" aria-label="espera sua resposta" />}
                {c.nome}{c.empresa ? <span className="sutil"> · {c.empresa}</span> : null}
              </span>
              <span className="item-meta">{c.ultimaMensagem && quando(c.ultimaMensagem.momento)}</span>
              <span className="item-texto">{c.resumo ?? (c.ultimaMensagem?.deMim ? "Você: " : "") + (c.ultimaMensagem?.texto ?? "")}</span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
