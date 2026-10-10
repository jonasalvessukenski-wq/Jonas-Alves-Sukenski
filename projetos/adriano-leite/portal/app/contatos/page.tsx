import { contatosPendentes, emDemonstracao } from "@/lib/dados";
import { FaixaDemo } from "@/componentes/FaixaDemo";
import { arquivarContato, confirmarContato } from "@/app/acoes";
import { formatar } from "@/lib/telefone";

export const dynamic = "force-dynamic";

export default async function Contatos() {
  const demo = emDemonstracao();
  const lista = await contatosPendentes();
  return (
    <>
      <FaixaDemo ativo={demo} />
      <p className="rotulo">Identificação</p>
      <h1 style={{ marginTop: 12 }}>Números novos</h1>
      <p className="lead">Quem escreveu pela primeira vez. O nome do perfil do WhatsApp é só uma pista: confirme quem é.</p>
      <ul className="lista secao">
        {lista.length === 0 && <li className="sutil" style={{ padding: "16px 0" }}>Nenhum número esperando identificação.</li>}
        {lista.map((c) => (
          <li key={c.id} style={{ padding: "20px 0" }}>
            <h3>{c.apelido ?? "Sem nome no perfil"} <span className="sutil">· {c.telefone ? formatar(c.telefone) : "só identificador interno"}</span></h3>
            {c.primeira && <p className="pend-evid" style={{ margin: "8px 0 16px" }}>“{c.primeira}”</p>}
            <form action={confirmarContato} className="linha-form">
              <input type="hidden" name="id" value={c.id} />
              <div className="campo"><label htmlFor={`n-${c.id}`}>Nome</label><input id={`n-${c.id}`} name="nome" className="entrada" required disabled={demo} /></div>
              <div className="campo"><label htmlFor={`e-${c.id}`}>Empresa</label><input id={`e-${c.id}`} name="empresa" className="entrada" disabled={demo} /></div>
              <button className="botao primario" disabled={demo}>Confirmar</button>
            </form>
            <form action={arquivarContato} style={{ marginTop: 8 }}>
              <input type="hidden" name="id" value={c.id} />
              <button className="botao" disabled={demo}>Ignorar este número</button>
            </form>
          </li>
        ))}
      </ul>
    </>
  );
}
