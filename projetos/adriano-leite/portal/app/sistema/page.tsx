import { emDemonstracao, saude } from "@/lib/dados";
import { FaixaDemo } from "@/componentes/FaixaDemo";
import { Interruptor } from "@/componentes/Interruptor";
import { quando } from "@/componentes/formato";
import { sair } from "@/app/acoes";
import { protecaoAtiva } from "@/lib/sessao";

export const dynamic = "force-dynamic";

export default async function Sistema() {
  const demo = emDemonstracao();
  const s = await saude();
  const horasSemMensagem = s.ultimaMensagem ? (Date.now() - +new Date(s.ultimaMensagem)) / 3600000 : null;
  const capturaOk = s.capturaLigada && horasSemMensagem !== null && horasSemMensagem < 3;
  return (
    <>
      <FaixaDemo ativo={demo} />
      <p className="rotulo">Saúde do sistema</p>
      <h1 style={{ marginTop: 12 }}>Sistema</h1>
      <p className="lead">O que está funcionando, o que falhou e os botões de desligar. Nada falha em silêncio.</p>

      <div className="indicadores secao">
        <div className="indicador">
          <span className="rotulo">Captura</span>
          <div className={`valor ${capturaOk ? "ok" : "ruim"}`}>{s.capturaLigada ? (capturaOk ? "Recebendo" : "Silenciosa") : "Desligada"}</div>
          <span className="sutil">última mensagem {s.ultimaMensagem ? quando(s.ultimaMensagem) : "—"}</span>
        </div>
        <div className="indicador">
          <span className="rotulo">Fila</span>
          <div className="valor">{s.fila.aguardando + s.fila.processando}</div>
          <span className="sutil">{s.fila.processando} processando agora</span>
        </div>
        <div className="indicador">
          <span className="rotulo">Falhas</span>
          <div className={`valor ${s.fila.mortas ? "ruim" : "ok"}`}>{s.fila.mortas}</div>
          <span className="sutil">{s.conflitos} conflitos de identidade</span>
        </div>
        <div className="indicador">
          <span className="rotulo">IA hoje</span>
          <div className="valor">{s.tokensHoje.analises}</div>
          <span className="sutil">{Math.round((s.tokensHoje.entrada + s.tokensHoje.saida) / 1000)} mil tokens</span>
        </div>
      </div>

      <div className="grade grade-2 secao">
        <section>
          <div className="secao-cab"><h2>Controles</h2></div>
          <Interruptor chave="captura_ligada" ligado={s.capturaLigada} rotulo="Captura do WhatsApp" descricao="Se desligar, as mensagens recebidas deixam de ser gravadas." demo={demo} />
          <Interruptor chave="analise_ligada" ligado={s.analiseLigada} rotulo="Análise por IA" descricao="Se desligar, as mensagens continuam gravadas e esperam." demo={demo} />
          <div className="interruptor">
            <div><h3>Envio automático</h3><span className="sutil">Nada sai em seu nome sem a sua aprovação.</span></div>
            <span className="etiqueta">{s.envioAutomatico ? "ligado" : "desligado"}</span>
          </div>
          {s.mortas.length > 0 && (
            <div className="secao">
              <div className="secao-cab"><h2>Falhas que precisam de atenção</h2></div>
              <ul className="lista">
                {s.mortas.map((m) => (
                  <li key={m.id} className="item"><span className="item-titulo">{m.tipo}</span><span className="item-meta">{quando(m.quando)}</span><span className="item-texto mono">{m.erro}</span></li>
                ))}
              </ul>
            </div>
          )}
          {protecaoAtiva() && <form action={sair} className="secao"><button className="botao">Sair</button></form>}
        </section>
        <aside>
          <div className="secao-cab"><h2>Registro</h2></div>
          <ul className="lista">
            {s.eventos.map((e, i) => (
              <li key={i} className="item"><span className="item-titulo">{e.tipo}</span><span className="item-meta">{quando(e.momento)}</span><span className="item-texto mono">{e.detalhe}</span></li>
            ))}
          </ul>
        </aside>
      </div>
    </>
  );
}
