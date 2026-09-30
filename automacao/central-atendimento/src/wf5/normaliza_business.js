// Normaliza o aviso da Z-API da linha Business (48 97400-7161). Só mensagem de conversa direta entra.
const b = $('Webhook Z-API Business').first().json.body || {};
const cfg = $('Config Business').first().json;
// Descartado: a execução termina aqui (o aviso cru continua visível no histórico do n8n, no nó do webhook)
const fora = (motivo) => []; // eslint-disable-line no-unused-vars
if (b.type !== 'ReceivedCallback') return fora(`tipo ${b.type || 'desconhecido'}`);
const esperada = String(cfg.instanciaBusiness || '');
if (esperada && !/COLE|PREENCHER|A_DEFINIR/i.test(esperada) && b.instanceId && b.instanceId !== esperada) return fora('instância diferente da esperada');
if (b.isGroup || /@g\.us$|-group$/.test(String(b.phone || ''))) return fora('grupo');
if (b.isNewsletter || /@newsletter$/.test(String(b.phone || ''))) return fora('canal/newsletter');
if (b.broadcast || /status@broadcast/.test(String(b.phone || ''))) return fora('lista de transmissão ou status');
if (b.isStatusReply) return fora('resposta a status');
if (b.fromApi) return fora('eco de envio feito pelo próprio sistema');

const phone = String(b.phone || '');
const ehLid = /@lid$/.test(phone);
const de = ehLid ? '' : soDigitos(phone);
const lid = soDigitos(String(b.chatLid || '')) || (ehLid ? soDigitos(phone) : '');
if ((de && PROPRIOS_8.has(ultimos8(de))) || (lid && PROPRIOS_LID.has(lid))) return fora('conversa entre números do Jonas');
if (!de && !lid) return fora('sem número nem LID');

let tipo = 'texto'; let texto = ''; let midia = '';
if (b.text && b.text.message) texto = b.text.message;
else if (b.audio) { tipo = 'audio'; midia = b.audio.audioUrl || ''; texto = ''; }
else if (b.image) { tipo = 'imagem'; midia = b.image.imageUrl || ''; texto = b.image.caption || '[imagem]'; }
else if (b.video) { tipo = 'video'; midia = b.video.videoUrl || ''; texto = b.video.caption || '[vídeo]'; }
else if (b.document) { tipo = 'documento'; midia = b.document.documentUrl || ''; texto = [b.document.fileName || b.document.title, b.document.caption].filter(Boolean).join(' - ') || '[documento]'; }
else if (b.buttonsResponseMessage) texto = b.buttonsResponseMessage.message || b.buttonsResponseMessage.buttonId || '';
else if (b.listResponseMessage) texto = b.listResponseMessage.message || b.listResponseMessage.title || '';
else if (b.reaction) { tipo = 'outro'; texto = `[reação ${b.reaction.value || ''}]`; }
else if (b.sticker) { tipo = 'outro'; texto = '[figurinha]'; }
else if (b.location) { tipo = 'outro'; texto = '[localização]'; }
else if (b.contact) { tipo = 'outro'; texto = `[contato: ${b.contact.displayName || ''}]`; }
else { tipo = 'outro'; texto = '[mensagem sem texto]'; }

const enviada = !!b.fromMe;
const nome = enviada ? String(b.chatName || '') : String(b.senderName || b.chatName || '');
const quando = b.momment ? new Date(Number(b.momment)) : new Date();
const messageId = String(b.messageId || `sem-id-${quando.getTime()}-${de || lid}`);
return [{ json: {
  enviada, de, lid, nome, tipo, texto, midia, messageId,
  duracao: b.audio ? Number(b.audio.seconds) || 0 : 0,
  encaminhada: !!b.forwarded,
  data: partesSP(quando).data,
  buscaDuplicata: pedido('POST', `/databases/${DB.recebidas}/query`, { filter: { property: 'messageId', rich_text: { equals: messageId } }, page_size: 1 }),
} }];
