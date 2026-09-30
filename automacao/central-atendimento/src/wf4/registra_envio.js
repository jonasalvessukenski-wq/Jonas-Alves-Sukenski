// Registra cada envio: fila (ID ou falha), conversa em Recebidas, CRM (última mensagem da Ative) e prospecção
const envios = $('Lista de envios').all().map((i) => i.json);
const resps = $input.all().map((i) => i.json);
const agoraISO = new Date().toISOString();
const sp = partesSP();
const out = [];
envios.forEach((e, i) => {
  const r = resps[i] || {};
  const id = r.messageId || r.zaapId || r.id || '';
  if (!id) {
    const erro = (r.error && (r.error.message || JSON.stringify(r.error))) || r.message || JSON.stringify(r);
    out.push({ json: atualizaPagina(e.filaId, { 'Situação': P.opcao('falhou'), 'ID do envio': P.texto(''), 'Motivo': P.texto(`Z-API recusou em ${sp.ddmm} ${sp.hhmm}: ${String(erro).slice(0, 500)}`) }) });
    return;
  }
  out.push({ json: atualizaPagina(e.filaId, { 'ID do envio': P.texto(String(id)) }) });
  const msg = {
    'Mensagem': P.titulo(`→ ${e.texto}`.slice(0, 200)),
    'Conteudo': P.texto(e.texto),
    'De': P.telefone(formataTel(e.telefone)),
    'Situacao': P.opcao('enviada pelo sistema'),
    'Filtro': P.opcao('passou'),
    'Canal': P.opcao(e.canal),
    'Tipo': P.opcao('texto'),
    'Recebida em': P.data(sp.data),
    'messageId': P.texto(String(id)),
    'Contato': P.relacao([e.contatoId]),
  };
  if (e.empresaId) msg['Empresa (prospecção)'] = P.relacao([e.empresaId]);
  out.push({ json: criaPagina(DB.recebidas, msg) });
  out.push({ json: atualizaPagina(e.contatoId, { 'Última mensagem de': P.opcao('Ative'), 'Última mensagem em': P.data(agoraISO), 'Última análise': P.data(agoraISO) }) });
  if (e.empresaId) out.push({ json: atualizaPagina(e.empresaId, { 'Último envio': P.data(sp.data), 'Canal do último envio': P.opcao('WhatsApp') }) });
});
if (!out.length) out.push({ json: NADA });
return out;
