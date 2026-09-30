// Grava o resultado da portaria: Filtro, Canal, Contato e Empresa de cada mensagem; "Última mensagem" no CRM;
// envio, devolução e descadastro na base de prospecção
const plano = $('Portaria').first().json;
const cria = $('Plano: cria contatos').all();
const criados = $('Cria contatos').all();
const empresas = (cria[0] && cria[0].json.empresaPorChave) || {};
const idPorChave = {};
cria.forEach((c, i) => {
  if (c.json.nada || !c.json.chave) return;
  const r = criados[i] && criados[i].json;
  if (r && r.object === 'page' && r.id) idPorChave[c.json.chave] = r.id;
});
const sp = partesSP();
const cfg = $('Config').first().json.cfg;
const out = [];
for (const m of plano.msgs) {
  const props = { 'Filtro': P.opcao(m.filtro) };
  if (m.setCanal) props['Canal'] = P.opcao(m.canal);
  const cid = m.contatoId || (m.novoChave ? idPorChave[m.novoChave] : null);
  if (cid) props['Contato'] = P.relacao([cid]);
  const emp = m.novoChave && empresas[m.novoChave] ? empresas[m.novoChave].id : null;
  if (emp) props['Empresa (prospecção)'] = P.relacao([emp]);
  out.push({ json: atualizaPagina(m.pageId, props) });
}
const agora = Date.now();
for (const u of plano.ultimas) {
  const chave = u.ref.startsWith('novo:') ? u.ref.slice(5) : '';
  const cid = u.ref.startsWith('id:') ? u.ref.slice(3) : idPorChave[chave];
  const empNovo = chave ? empresas[chave] : null;
  const empresaId = u.empresaId || (empNovo ? empNovo.id : '');

  // Base de prospecção
  if (empresaId) {
    const pp = {};
    if (u.descadastro) {
      Object.assign(pp, { 'Status': P.opcao('Descadastrar'), 'Etapa da sequência': P.opcao('encerrada'), 'Próximo envio': P.data(null), 'Motivo': P.texto(`Pediu para não receber mais mensagens (${sp.ddmm}).`) });
    } else if (u.devolvido) {
      pp['Motivo'] = P.texto(`E-mail devolvido em ${sp.ddmm}: endereço inválido ou caixa cheia. Conferir o e-mail antes do próximo envio.`);
    }
    if (u.envio && !u.descadastro) {
      pp['Último envio'] = P.data(u.envio.slice(0, 10));
      pp['Canal do último envio'] = P.opcao(u.canalEnvio);
      // Primeiro toque registrado: só quando se sabe que a empresa ainda estava como "Não contatado"
      if (empNovo && (!empNovo.status || empNovo.status === 'Não contatado')) {
        const email = u.canalEnvio === 'E-mail';
        pp['Status'] = P.opcao(email ? 'E-mail enviado' : 'WhatsApp enviado');
        pp['Etapa da sequência'] = P.opcao(email ? 'D0 e-mail' : 'D+2 WhatsApp');
        pp['Próximo envio'] = P.data(somaDias(u.envio.slice(0, 10), email ? 2 : 5));
      }
    }
    if (Object.keys(pp).length) out.push({ json: atualizaPagina(empresaId, pp) });
  }

  // Menu de robô de empresa da campanha: responde só o número da opção (financeiro, administrativo ou atendente).
  // Sai sem aprovação porque o Jonas autorizou; a chave contornoMenu nos Controles desliga.
  if (u.menu && empresaId && !u.descadastro && ligado(cfg, 'contornoMenu', false) && agora - Date.parse(u.menu.hora) < 2 * 3600 * 1000) {
    const nomeEmp = empNovo ? empNovo.nome : '';
    const fila = {
      'Resposta': P.titulo(`Menu automático${nomeEmp ? ` · ${nomeEmp}` : ''} · opção ${u.menu.numero}`),
      'Texto': P.texto(u.menu.numero),
      'Tipo': P.opcao('menu'),
      'Destino': P.texto(u.menu.de),
      'Canal': P.opcao(u.menu.canal),
      'Nível': P.opcao('1 - automática'),
      'Situação': P.opcao('aprovada'),
      'Modelo ou cartão': P.texto('menu'),
      'Motivo': P.texto(`O robô da empresa mostrou um menu; o sistema escolheu a opção ${u.menu.numero} (${u.menu.rotulo}) para chegar a uma pessoa.`),
      'Empresa (prospecção)': P.relacao([empresaId]),
      'Mensagens de origem': P.relacao([u.menu.msgId]),
    };
    if (cid) fila['Contato'] = P.relacao([cid]);
    out.push({ json: criaPagina(DB.fila, fila) });
  }

  if (!cid) continue;
  if (u.descadastro) out.push({ json: atualizaPagina(cid, { 'Intenção atual': P.opcao('descadastro'), 'Nível de resposta': P.opcao('3 - só o Jonas') }) });
  // Mensagem com mais de 12 horas não dispara leitura do Jev (evita reanalisar o passado na primeira rodada)
  if (!u.hora || agora - Date.parse(u.hora) > 12 * 3600 * 1000) continue;
  // O Notion guarda hora sem segundos: mensagem do mesmo minuto da última análise ganha 1 minuto para não ficar sem leitura
  let hora = u.hora;
  if (u.de === 'Contato' && u.analise && Date.parse(hora) <= Date.parse(u.analise)) hora = new Date(Date.parse(u.analise) + 60000).toISOString();
  out.push({ json: atualizaPagina(cid, { 'Última mensagem em': P.data(hora), 'Última mensagem de': P.opcao(u.de) }) });
}
if (!out.length) out.push({ json: NADA });
return out;
