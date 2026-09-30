// Monta registro — corpo da linha em 📥 Recebidas (Canal = E-mail).
// Chega aqui pelos dois lados do IF: com o contato recém-criado (resposta do Notion)
// ou direto, quando não havia o que criar.
const e = $('Resolve contato').first().json;
const r = $input.first().json;

let contatoId = e.contatoId;
let contatoNovo = false;
let comoIdentificou = e.comoIdentificou;
if (e.criarContato) {
  if (r.object === 'page' && r.id) {
    contatoId = r.id;
    contatoNovo = true;
    comoIdentificou = 'contato novo criado (a_confirmar)';
  } else {
    comoIdentificou = 'falhou ao criar o contato - nao identificado';
  }
}

let situacao;
if (e.pasta === 'enviados') situacao = 'enviada por mim';
else if (e.automatico) situacao = 'ignorada';
else if (contatoId && !contatoNovo) situacao = 'vinculada a contato';
else situacao = 'aguardando decisao';

const max = e.cfg.maxConteudo;
const rt = (s) => [{ text: { content: String(s || '').slice(0, max) } }];

let conteudo = e.texto || '(sem texto)';
if (e.anexos.length) conteudo = `📎 ${e.anexos.length} anexo(s): ${e.anexos.join(', ')}\n\n` + conteudo;

// Corpo da página: ficha do e-mail + texto completo em blocos de até 1900 caracteres
const ficha = [
  `De: ${e.de}`,
  `Para: ${e.para}`,
  e.cc ? `Cc: ${e.cc}` : '',
  `Data: ${new Date(e.recebidaEm).toLocaleString('pt-BR', { timeZone: e.cfg.fuso })}`,
  `Identificação: ${comoIdentificou}`,
  `Message-ID: ${e.messageId}`,
].filter(Boolean).join('\n');

const children = [{
  object: 'block', type: 'callout',
  callout: { icon: { type: 'emoji', emoji: '✉️' }, rich_text: rt(ficha) },
}];
const texto = e.texto || '';
for (let i = 0; i < texto.length && children.length < 20; i += max) {
  children.push({ object: 'block', type: 'paragraph', paragraph: { rich_text: rt(texto.slice(i, i + max)) } });
}

const properties = {
  Mensagem: { title: rt(e.titulo) },
  Canal: { select: { name: 'E-mail' } },
  'E-mail': { email: e.email },
  Assunto: { rich_text: rt(e.assunto) },
  Conteudo: { rich_text: rt(conteudo) },
  Tipo: { select: { name: e.anexos.length ? 'documento' : 'texto' } },
  Situacao: { select: { name: situacao } },
  'Recebida em': { date: { start: e.recebidaEm } },
  messageId: { rich_text: rt(e.messageId) },
};
if (contatoId) properties.Contato = { relation: [{ id: contatoId }] };

return [{
  json: {
    ...e,
    contatoId,
    contatoNovo,
    comoIdentificou,
    situacao,
    corpoRegistro: { parent: { database_id: e.cfg.recebidasDbId }, properties, children },
  },
}];
