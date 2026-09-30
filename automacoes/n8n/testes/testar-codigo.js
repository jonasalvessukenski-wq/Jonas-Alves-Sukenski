// Roda o código dos nós do GAB-MAIL 1 fora do n8n, com $input e $('Nó') simulados.
// Uso: node automacoes/n8n/testes/testar-codigo.js
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const COD = path.join(__dirname, '..', 'codigo');

function roda(arquivo, itens, nos = {}) {
  const fonte = fs.readFileSync(path.join(COD, arquivo), 'utf8');
  const $input = { all: () => itens, first: () => itens[0] };
  const $ = (nome) => {
    if (!(nome in nos)) throw new Error(`nó não simulado: ${nome}`);
    const lista = nos[nome];
    return { first: () => lista[0], all: () => lista };
  };
  return new Function('$input', '$', fonte)($input, $);
}

const cfg = roda('config-email.js', [{ json: {} }])[0].json.cfg;

const base = (pasta, extra) => ({
  json: {
    pasta, cfg,
    headers: {},
    date: '2026-09-30T02:30:00.000Z', // 23h30 do dia 29 em São Paulo
    messageId: `<${Math.random().toString(36).slice(2)}@x>`,
    ...extra,
  },
});

const entradas = [
  base('entrada', {
    from: { value: [{ address: 'Fulano@Empresa.com.br', name: 'Fulano da Silva' }] },
    to: { value: [{ address: 'contato@ativeassessoriafinanceira.com.br', name: '' }] },
    subject: 'Proposta de estruturação',
    text: 'Bom dia Jonas,\nsegue o balanço.\n\nEm ter., 29 de set. de 2026 às 10:00, Jonas escreveu:\n> texto antigo',
  }),
  base('enviados', {
    from: { value: [{ address: 'contato@ativeassessoriafinanceira.com.br', name: 'Ative' }] },
    to: { value: [{ address: 'contato@ativeassessoriafinanceira.com.br', name: '' }, { address: 'cliente@gmail.com', name: 'Maria' }] },
    cc: { value: [{ address: 'socio@x.com', name: '' }] },
    subject: 'Re: Documentos',
    html: '<p>Oi Maria,</p><p>recebido, obrigado.</p>',
  }),
  base('entrada', {
    from: { value: [{ address: 'no-reply@banco.com.br', name: 'Banco' }] },
    to: { value: [{ address: 'contato@ativeassessoriafinanceira.com.br' }] },
    subject: 'Seu extrato',
    text: 'extrato',
  }),
  base('entrada', {
    from: { value: [{ address: 'vendas@loja.com', name: 'Loja' }] },
    to: { value: [{ address: 'contato@ativeassessoriafinanceira.com.br' }] },
    headers: { 'list-unsubscribe': 'List-Unsubscribe: <mailto:x>' },
    subject: 'Promoção', text: 'oferta',
  }),
  base('entrada', { // cópia do que o próprio contato@ mandou: tem de sumir
    from: { value: [{ address: 'contato@ativeassessoriafinanceira.com.br' }] },
    to: { value: [{ address: 'contato@ativeassessoriafinanceira.com.br' }] },
    subject: 'cópia', text: 'x',
  }),
  base('entrada', { // formato "simple" do gatilho
    from: '"Beto Arkcon" <beto@arkcon.com.br>',
    to: 'contato@ativeassessoriafinanceira.com.br',
    subject: 'RES: orçamento', textPlain: 'Pode ser amanhã.', inReplyTo: '<abc@x>',
  }),
];

const norm = roda('normaliza-email.js', entradas);
assert.strictEqual(norm.length, 5, 'a cópia própria tem de ser descartada');

const [fulano, maria, banco, loja, beto] = norm.map((i) => i.json);
assert.strictEqual(fulano.email, 'fulano@empresa.com.br');
assert.strictEqual(fulano.emailOriginal, 'Fulano@Empresa.com.br');
assert.strictEqual(fulano.nomeCadastro, 'Fulano da Silva (empresa.com.br)');
assert.strictEqual(fulano.texto, 'Bom dia Jonas,\nsegue o balanço.', 'histórico citado tem de sair');
assert.strictEqual(fulano.dataSP, '2026-09-29', 'data no fuso de São Paulo, não UTC');
assert.strictEqual(fulano.automatico, false);
assert.strictEqual(fulano.titulo, 'Proposta de estruturação');

assert.strictEqual(maria.email, 'cliente@gmail.com', 'enviado: contraparte é o destinatário externo');
assert.strictEqual(maria.nomeCadastro, 'Maria (e-mail)');
assert.strictEqual(maria.titulo, '→ Re: Documentos');
assert.deepStrictEqual(maria.outrosDestinatarios, ['socio@x.com']);
assert.ok(maria.texto.includes('recebido, obrigado.'));

assert.strictEqual(banco.automatico, true);
assert.strictEqual(loja.automatico, true);
assert.strictEqual(beto.email, 'beto@arkcon.com.br');
assert.strictEqual(beto.titulo, '↩ RES: orçamento');

// Caminho do loop para cada e-mail
function loop(e, respostaBusca, respostaCria) {
  const resolvido = roda('resolve-contato.js', [{ json: respostaBusca }], { 'Um por vez': [{ json: e }] })[0].json;
  const entradaMonta = resolvido.criarContato ? respostaCria : resolvido;
  const montado = roda('monta-registro.js', [{ json: entradaMonta }], { 'Resolve contato': [{ json: resolvido }] })[0].json;
  const conferido = roda('confere-gravacao.js', [{ json: { object: 'page', id: 'reg-1' } }], { 'Monta registro': [{ json: montado }] })[0].json;
  return { resolvido, montado, conferido };
}

// 1. remetente desconhecido: cria contato a_confirmar e liga
let r = loop(fulano, { results: [] }, { object: 'page', id: 'contato-novo' });
assert.strictEqual(r.resolvido.criarContato, true);
assert.strictEqual(r.resolvido.corpoContato.properties['Situação'].select.name, 'a_confirmar');
assert.strictEqual(r.montado.situacao, 'aguardando decisao');
assert.deepStrictEqual(r.montado.corpoRegistro.properties.Contato.relation, [{ id: 'contato-novo' }]);
assert.strictEqual(r.montado.corpoRegistro.properties.Canal.select.name, 'E-mail');
assert.strictEqual(r.conferido.atualizarContato, true);

// 2. contato conhecido: liga, não cria
r = loop(beto, { results: [{ id: 'beto-crm' }] });
assert.strictEqual(r.resolvido.criarContato, false);
assert.strictEqual(r.montado.situacao, 'vinculada a contato');

// 3. enviado
r = loop(maria, { results: [{ id: 'maria-crm' }] });
assert.strictEqual(r.montado.situacao, 'enviada por mim');

// 4. automático: não cria contato, vira "ignorada", não mexe no CRM
r = loop(banco, { results: [] });
assert.strictEqual(r.resolvido.criarContato, false);
assert.strictEqual(r.montado.situacao, 'ignorada');
assert.strictEqual(r.montado.corpoRegistro.properties.Contato, undefined);
assert.strictEqual(r.conferido.atualizarContato, false);

// 5. busca no CRM falhou: NUNCA cria contato (evita cadastro duplicado)
r = loop(fulano, { error: { message: 'timeout' } });
assert.strictEqual(r.resolvido.criarContato, false);
assert.strictEqual(r.montado.situacao, 'aguardando decisao');
assert.ok(r.montado.corpoRegistro.children[0].callout.rich_text[0].text.content.includes('busca no CRM falhou'));

// 6. criação do contato falhou: grava sem contato
r = loop(fulano, { results: [] }, { error: { message: 'validation_error' } });
assert.strictEqual(r.montado.contatoId, '');
assert.strictEqual(r.montado.corpoRegistro.properties.Contato, undefined);

// 7. texto longo vira vários blocos de até 1900 caracteres
const longo = { ...fulano, texto: 'a'.repeat(5000) };
r = loop(longo, { results: [{ id: 'x' }] });
assert.strictEqual(r.montado.corpoRegistro.children.length, 1 + 3);
assert.ok(r.montado.corpoRegistro.properties.Conteudo.rich_text[0].text.content.length <= 1900);

// 8. fim do lote: falha de gravação derruba a execução com a lista
assert.throws(
  () => roda('falhou-algum.js', [{ json: { ok: true, situacao: 'x' } }, { json: { ok: false, pasta: 'entrada', assunto: 'A', email: 'a@b', erro: 'boom' } }]),
  /1 de 2 e-mail\(s\) nao gravados[\s\S]*"A" \(a@b\) -> boom/,
);
const resumo = roda('falhou-algum.js', [{ json: { ok: true, situacao: 'enviada por mim', contatoNovo: true } }])[0].json;
assert.strictEqual(resumo.gravados, 1);

console.log('ok — todos os casos passaram');
