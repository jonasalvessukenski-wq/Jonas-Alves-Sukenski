// Cenário de teste: um dia típico de disparos, com prospect interessado, robô, descadastro, e-mail e devolução.
const DB = {
  recebidas: 'a62d96495d3d486397f27b5d8b6dfc81',
  crm: '4e84cf3d628583f3b09481990f3dd072',
  tarefas: '73e4cf3d628582f1bbca015a4dda5a08',
  prospeccao: 'a95d43b45b0f41d7882a749adb2d01d9',
  fila: '6b1fc7f7c6034371b2536a116c037b0b',
  controles: 'b74182348b7a46ddb2182028c44dbc75',
};
const CLIENT_TOKEN = 'client-token-de-teste';
const ha = (min) => new Date(Date.now() - min * 60000).toISOString();

const t = (s) => ({ title: [{ text: { content: s } }] });
const tx = (s) => ({ rich_text: [{ text: { content: s } }] });
const sel = (s) => ({ select: s ? { name: s } : null });
const rel = (ids) => ({ relation: ids.map((id) => ({ id })) });
const dt = (s) => ({ date: s ? { start: s } : null });
const cb = (b) => ({ checkbox: b });
const tel = (s) => ({ phone_number: s });
const em = (s) => ({ email: s });

const ids = {};
function popular({ criar }) {
  // Controles da central
  // TESTE_TRAVADO=1: envio automático desligado e horário fechado -> nada pode sair além do alerta
  const travado = process.env.TESTE_TRAVADO === '1';
  const ctl = [['autoEnvio', !travado, ''], ['rascunhosWhatsApp', true, ''], ['analiseConversa', true, ''], ['esperaProspectMin', false, '3'], ['esperaDemaisMin', false, '10'],
    ['horarioEnvio', false, travado ? 'todos os dias 03:00-03:01' : 'todos os dias 00:00-24:00'], ['tetoDiarioAuto', false, '50'], ['maxAutoPorContato24h', false, '1'], ['modeloJev', false, 'gpt-4o-mini'], ['maxAnalisesPorRodada', false, '6']];
  // Textos: N1-A aprovado; os demais cadastrados e ainda não aprovados; um cartão OBJ aprovado
  ctl.push(['N1-A', true, 'Obrigado pelo retorno, [Nome]. Aqui é o Jonas, da Ative.\nProponho uma videochamada de 15 minutos. Qual dia e horário ficam melhores para você nesta semana?'],
    ['N1-B', false, 'Claro, [Nome]. Segue a apresentação da Ative.\nDepois de olhar, qual o melhor dia para eu ouvir o que achou?'],
    ['N1-E', false, 'Pronto, [Nome]. Seu contato foi retirado da nossa lista. Desculpe o incômodo.'],
    ['OBJ-03', true, 'Seu contato veio de uma pesquisa de mercado em base pública de empresas. Se preferir, retiro agora.']);
  for (const [k, l, v] of ctl) criar(DB.controles, { Controle: t(k), Chave: tx(k), Ligado: cb(l), Valor: tx(v) });

  // Prospecção
  ids.E1 = criar(DB.prospeccao, { Empresa: t('Metalúrgica Alfa'), WhatsApp: tel('+55 48 9911-1111'), 'E-mail': em('financeiro@alfa.com.br'), Status: sel('WhatsApp enviado'), Setor: tx('Indústria'), Cidade: tx('Joinville'), UF: sel('SC') });
  ids.E2 = criar(DB.prospeccao, { Empresa: t('Transportes Beta'), WhatsApp: tel('+55 47 8888-7777'), Status: sel('Não contatado') });
  ids.E3 = criar(DB.prospeccao, { Empresa: t('Comércio Gama'), 'E-mail': em('compras@empresay.com.br'), Status: sel('E-mail enviado') });
  ids.E4 = criar(DB.prospeccao, { Empresa: t('Construtora Delta'), 'E-mail': em('x@empresaz.com.br'), Status: sel('E-mail enviado') });
  ids.E5 = criar(DB.prospeccao, { Empresa: t('Atacado Épsilon'), Telefone: tx('(47) 3333-4444'), Status: sel('WhatsApp enviado') });

  // CRM
  ids.C1 = criar(DB.crm, { Nome: t('Maria (Metalúrgica Alfa)'), Contato: tel('+55 48 9911-1111'), Situação: sel('a_confirmar'), 'Empresa (prospecção)': rel([ids.E1]), 'Última análise': dt(ha(120)) }, ha(3000));
  ids.C2 = criar(DB.crm, { Nome: t('Paulo (cliente)'), Contato: tel('+55 48 9922-2222'), Email: em('paulo@cliente.com.br'), Situação: sel('ativa'), Tipo: sel('cliente') }, ha(9000));
  ids.C3 = criar(DB.crm, { Nome: t('Irmã'), Contato: tel('+55 48 9933-3333'), Mapa: sel('PES') }, ha(9000));

  // Tarefa aberta do Paulo
  ids.T1 = criar(DB.tarefas, { 'Tarefa Interna': t('Paulo — enviar contrato revisado'), Pessoas: rel([ids.C2]), Feito: cb(false), Situação: sel('a fazer') });

  // Mensagens pendentes (sem Filtro)
  const msg = (min, props) => criar(DB.recebidas, props, ha(min));
  ids.R1 = msg(20, { Mensagem: t('Tenho interesse sim'), Conteudo: tx('Tenho interesse sim, podemos conversar amanhã?'), De: tel('554899111111'), Situacao: sel('aguardando decisao'), Tipo: sel('texto'), 'Nome no WhatsApp': tx('Maria Souza') });
  ids.R2 = msg(19, { Mensagem: t('Bom dia, quem fala?'), Conteudo: tx('Bom dia, quem fala?'), De: tel('554788887777'), Lid: tx('99887766554433'), Situacao: sel('aguardando decisao'), Tipo: sel('texto'), 'Nome no WhatsApp': tx('João Silva') });
  ids.R3 = msg(18, { Mensagem: t('Menu'), Conteudo: tx('Olá! Digite 1 para Financeiro, 2 para Compras.'), De: tel('554733334444'), Situacao: sel('aguardando decisao'), Tipo: sel('texto'), 'Nome no WhatsApp': tx('Atacado Épsilon') });
  ids.R4 = msg(17, { Mensagem: t('não tenho interesse'), Conteudo: tx('Não tenho interesse, me tire da lista por favor'), De: tel('554855556666'), Situacao: sel('aguardando decisao'), Tipo: sel('texto'), 'Nome no WhatsApp': tx('Carlos') });
  ids.R5 = msg(16, { Mensagem: t('teste'), Conteudo: tx('teste do Jonas'), De: tel('554896202573'), Situacao: sel('enviada por mim'), Tipo: sel('texto') });
  ids.R6 = msg(15, { Mensagem: t('Re: Diagnóstico financeiro'), Conteudo: tx('Olá Jonas, pode me mandar a apresentação?'), 'E-mail': em('ana@empresay.com.br'), Assunto: tx('Re: Diagnóstico financeiro'), Canal: sel('E-mail'), Tipo: sel('e-mail'), Situacao: sel('aguardando decisao'), 'Nome no WhatsApp': tx('Ana Lima') });
  ids.R7 = msg(14, { Mensagem: t('Undelivered Mail'), Conteudo: tx('Devolvido pelo servidor'), 'E-mail': em('x@empresaz.com.br'), Assunto: tx('Undelivered Mail Returned to Sender'), Canal: sel('E-mail'), Tipo: sel('e-mail devolvido'), Situacao: sel('aguardando decisao') });
  ids.R8 = msg(13, { Mensagem: t('Assinei o contrato'), Conteudo: tx('Jonas, assinei e te mandei o contrato agora.'), De: tel('554899222222'), Situacao: sel('aguardando decisao'), Tipo: sel('texto') });
  ids.R9 = msg(12, { Mensagem: t('oi mano'), Conteudo: tx('oi mano, domingo tem almoço'), De: tel('554899333333'), Situacao: sel('aguardando decisao'), Tipo: sel('texto') });
  // Mensagem antiga já filtrada (não deve ser reprocessada)
  ids.R0 = msg(600, { Mensagem: t('antiga'), Conteudo: tx('antiga'), De: tel('554899111111'), Filtro: sel('passou'), Contato: rel([ids.C1]), Situacao: sel('vinculada a contato') });

  // Fila: uma aprovada por e-mail (deve ser barrada) e uma aprovada antiga do Paulo (conversa mudou depois)
  ids.F1 = criar(DB.fila, { Resposta: t('Paulo · pergunta'), Texto: tx('Paulo, segue o contrato.'), Contato: rel([ids.C2]), Canal: sel('E-mail'), Nível: sel('2 - rascunho'), Situação: sel('aprovada'), Número: { number: 7 } }, ha(60));
}

// Decisão simulada do Jev, por contato
function decisaoJev(nome, texto) {
  const base = { temperatura: 'morno', resumo: `Resumo simulado de ${nome}.`, proximo_passo: '', nivel: 2, confianca: 0.9, resposta: null, tarefas_novas: [], tarefas_atualizar: [], reuniao_marcada: false, alertar_jonas: false, motivo: 'simulado' };
  if (nome.startsWith('Maria')) {
    return { ...base, intencao: 'quer conversar', temperatura: 'quente', nivel: 1, alertar_jonas: true, proximo_passo: 'Marcar videochamada amanhã',
      resposta: { texto: 'Oi, Maria! Obrigado pelo retorno. Pode ser amanhã às 10h ou às 15h, numa videochamada de 15 minutos?', modelo_ou_cartao: 'N1-A' },
      tarefas_novas: [{ titulo: 'Marcar videochamada com a Maria', com_quem_esta: 'Ative', prazo_texto: 'amanhã', trecho: 'podemos conversar amanhã?' }] };
  }
  if (nome.startsWith('João')) return { ...base, intencao: 'pergunta', resposta: { texto: 'Bom dia, João! Aqui é o Jonas, da Ative. Falei com a Transportes Beta sobre um diagnóstico financeiro. Posso te explicar em 15 minutos?', modelo_ou_cartao: 'OBJ-03' } };
  if (nome.startsWith('Ana')) return { ...base, intencao: 'pede material', nivel: 1, resposta: { texto: 'Olá, Ana! Envio a apresentação. Qual o melhor dia para conversarmos?', modelo_ou_cartao: 'N1-B' } };
  if (nome.startsWith('Carlos')) return { ...base, intencao: 'descadastro', nivel: 1, resposta: { texto: 'Certo, Carlos. Já retirei seu contato. Desculpe o incômodo.', modelo_ou_cartao: 'N1-E' } };
  if (nome.startsWith('Paulo')) {
    const id = (texto.match(/id=([\w-]+)/) || [])[1];
    return { ...base, intencao: 'quente e sensível', nivel: 3, tarefas_atualizar: id ? [{ id, com_quem_esta: 'Ative', sugere_baixa: true, nota: 'Paulo diz que assinou e mandou o contrato.' }] : [],
      tarefas_novas: [{ titulo: 'Conferir contrato assinado do Paulo', com_quem_esta: 'Ative', prazo_texto: 'hoje', trecho: 'assinei e te mandei o contrato' }, { titulo: 'Enviar contrato revisado para Paulo', com_quem_esta: 'Ative', prazo_texto: null, trecho: 'x' }],
      resposta: { texto: 'Recebido, Paulo! O valor fica em R$ 5.000.', modelo_ou_cartao: 'livre' } };
  }
  return { ...base, intencao: 'fora da campanha', nivel: 3 };
}

module.exports = { DB, CLIENT_TOKEN, popular, decisaoJev, ids, TAM_PAGINA: 4 };
