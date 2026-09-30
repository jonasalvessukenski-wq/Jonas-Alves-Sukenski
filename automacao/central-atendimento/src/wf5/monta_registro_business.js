// Grava a mensagem da linha Business na base Recebidas. A portaria da central liga ao contato e o Jev lê a conversa.
const m = $('Segue se for nova').first().json;
let texto = m.texto;
if (m.tipo === 'audio') {
  let transcrito = '';
  try { if ($('Transcreve (OpenAI)').isExecuted) transcrito = String($('Transcreve (OpenAI)').first().json.text || '').trim(); } catch (e) { transcrito = ''; }
  texto = transcrito ? `[áudio ${m.duracao}s] ${transcrito}` : `[áudio ${m.duracao}s, sem transcrição]`;
}
if (m.encaminhada) texto = `[encaminhada] ${texto}`;
const titulo = `${m.enviada ? '→ ' : ''}${texto}`.replace(/\s+/g, ' ').slice(0, 200) || '(sem texto)';
const props = {
  'Mensagem': P.titulo(titulo),
  'Conteudo': P.texto(texto),
  'Canal': P.opcao('WhatsApp Business'),
  'Tipo': P.opcao(m.tipo),
  'Situacao': P.opcao(m.enviada ? 'enviada por mim' : 'aguardando decisao'),
  'Recebida em': P.data(m.data),
  'messageId': P.texto(m.messageId),
};
if (m.de) props['De'] = P.telefone(m.de);
if (m.lid) props['Lid'] = P.texto(m.lid);
if (m.nome && !/@lid$/.test(m.nome)) props['Nome no WhatsApp'] = P.texto(m.nome);
if (m.midia) props['Midia'] = { url: m.midia };
return [{ json: criaPagina(DB.recebidas, props) }];
