// Resolve contato — decide a quem o e-mail pertence, pelo campo Email do CRM.
// Busca que falhou NUNCA cria contato: sem resposta do Notion não dá para saber se a
// pessoa já existe, e cadastro duplicado é pior que linha sem contato.
const e = $('Um por vez').first(1).json; // saída 1 = loop
const r = $input.first().json;

const buscaOk = Array.isArray(r.results);
const achados = buscaOk ? r.results : [];

let contatoId = achados[0]?.id || '';
let comoIdentificou = '';
if (achados.length === 1) comoIdentificou = 'e-mail';
if (achados.length > 1) comoIdentificou = `e-mail (${achados.length} cadastros com esse e-mail - conferir)`;
if (!buscaOk) comoIdentificou = 'busca no CRM falhou - nao identificado';

const criarContato = buscaOk && achados.length === 0 && !e.automatico;
if (!contatoId && !criarContato) comoIdentificou = comoIdentificou || (e.automatico ? 'e-mail automatico - sem contato' : 'nao identificado');

const hoje = new Intl.DateTimeFormat('pt-BR', { timeZone: e.cfg.fuso }).format(new Date());
const papel = e.pasta === 'enviados' ? 'destinatário' : 'remetente';

return [{
  json: {
    ...e,
    contatoId,
    contatoNovo: false,
    comoIdentificou,
    criarContato,
    corpoContato: criarContato ? {
      parent: { database_id: e.cfg.crmDbId },
      properties: {
        Nome: { title: [{ text: { content: e.nomeCadastro.slice(0, 200) } }] },
        Email: { email: e.email },
        'Situação': { select: { name: 'a_confirmar' } },
        Origem: { rich_text: [{ text: { content:
          `Criado pela captura de e-mail (n8n) em ${hoje}: ${papel} de "${e.assunto.slice(0, 150)}" ` +
          `na caixa ${e.cfg.caixa}. O nome veio do cabeçalho do e-mail - não é identidade confirmada.`,
        } }] },
      },
    } : null,
  },
}];
