// Monta o pedido ao Jev com a conversa inteira do contato (uma chamada por contato, não por mensagem)
const c = $('Filtra por espera').item.json;
const conversa = ($('Busca conversa').item.json.results) || [];
const tarefas = ($('Busca tarefas').item.json.results) || [];
const empPg = $json && $json.object === 'page' ? $json : null;
const cfg = $('Config').first().json.cfg;

const linhas = []; let ultimoAutor = ''; let ultimoCanal = 'WhatsApp pessoal';
for (const m of conversa) {
  const p = m.properties || {};
  const sit = L.opcao(p['Situacao']);
  const filtro = L.opcao(p['Filtro']);
  const nossa = sit === 'enviada por mim' || sit === 'enviada pelo sistema';
  let txt = (L.texto(p['Conteudo']) || L.titulo(p['Mensagem'])).replace(/^→\s*/, '');
  const tipo = L.opcao(p['Tipo']);
  if (tipo && tipo !== 'texto') txt = `[${tipo}] ${txt}`;
  if (filtro === 'robô') txt = `[robô] ${txt}`;
  const assunto = L.texto(p['Assunto']);
  if (assunto) txt = `[e-mail: ${assunto}] ${txt}`;
  const h = partesSP(new Date(m.created_time));
  linhas.push(`[${h.ddmm} ${h.hhmm}] ${nossa ? (sit === 'enviada pelo sistema' ? 'Ative (sistema)' : 'Jonas') : 'Contato'}: ${txt.replace(/\s+/g, ' ').slice(0, 700)}`);
  ultimoAutor = nossa ? 'Ative' : 'Contato';
  if (!nossa) ultimoCanal = L.opcao(p['Canal']) || ultimoCanal;
}
let transcricao = linhas.join('\n');
if (transcricao.length > 14000) transcricao = `(início cortado)\n${transcricao.slice(-14000)}`;

const listaTarefas = tarefas.map((t) => {
  const p = t.properties || {};
  return `- id=${t.id} | ${L.titulo(p['Tarefa Interna'])} | situação: ${L.opcao(p['Situação']) || '-'} | com quem está: ${L.opcao(p['Com quem está']) || '-'} | prazo: ${L.data(p['Prazo / Horário']) || '-'}`;
}).join('\n') || '(nenhuma tarefa aberta)';

let empresa = '(não é contato da campanha de prospecção)';
let statusCampanha = '';
if (empPg) {
  const p = empPg.properties || {};
  statusCampanha = L.opcao(p['Status']);
  empresa = `Empresa: ${L.titulo(p['Empresa'])} | Setor: ${L.texto(p['Setor'])} | Cidade/UF: ${L.texto(p['Cidade'])}/${L.opcao(p['UF'])} | Serviço Ative: ${L.opcao(p['Serviço Ative'])} | Status na campanha: ${statusCampanha} | Etapa: ${L.opcao(p['Etapa da sequência'])}`;
}
const agora = partesSP();
const user = [
  `DATA E HORA AGORA (Brasília): ${agora.data} ${agora.hhmm}`,
  '',
  `CONTATO: ${c.nome}`,
  `Tipo no CRM: ${c.tipo || '-'} | Situação do cadastro: ${c.situacao || '-'} | Mapa: ${c.mapa || '-'}`,
  `Resumo do cadastro: ${c.tldr || '-'}`,
  `CAMPANHA: ${empresa}`,
  '',
  'RESUMO DA CONVERSA ATÉ A ÚLTIMA LEITURA:',
  c.resumoAnterior || '(primeira leitura)',
  `Próximo passo anotado: ${c.proximoPasso || '-'}`,
  '',
  'TAREFAS ABERTAS LIGADAS A ESTE CONTATO:',
  listaTarefas,
  '',
  'CONVERSA (últimas 36 horas, em ordem):',
  transcricao || '(sem mensagens)',
  '',
  `Última mensagem foi de: ${ultimoAutor || '-'}`,
].join('\n');

return { json: {
  contatoId: c.contatoId, nome: c.nome, ultimoAutor, ultimoCanal, empresaId: c.empresaId, statusCampanha,
  temperaturaAnterior: c.temperaturaAnterior,
  msgIds: conversa.slice(-5).map((m) => m.id),
  tarefasAbertas: tarefas.map((t) => ({ id: t.id, titulo: L.titulo((t.properties || {})['Tarefa Interna']) })),
  openaiBody: {
    model: valorTxt(cfg, 'modeloJev', 'gpt-4o-mini'),
    temperature: 0.2,
    response_format: { type: 'json_object' },
    messages: [{ role: 'system', content: PROMPT_JEV }, { role: 'user', content: user }],
  },
} };
