#!/usr/bin/env node
// Gera os fluxos do n8n (workflows/*.json) a partir do código em src/.
// Uso: node build.js                      -> fluxos de produção
//      node build.js --teste http://127.0.0.1:5999 -> cópia apontada para o servidor simulado (testes/)
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const args = process.argv.slice(2);
const TESTE = args[0] === '--teste' ? args[1] : null;
const RAIZ = __dirname;
const SRC = path.join(RAIZ, 'src');
const SAIDA = path.join(RAIZ, TESTE ? 'testes/workflows' : 'workflows');

const COMUM = fs.readFileSync(path.join(SRC, 'comum.js'), 'utf8');
const PROMPT = fs.readFileSync(path.join(SRC, 'prompt_jev.js'), 'utf8');

// Credenciais: ids provisórios. O instalador troca pelos ids reais do n8n (os mesmos do GAB-WPP 1).
const CRED = {
  notionApi: { id: 'ativeCredNotion0', name: 'Notion (n8n Ative)' },
  openAiApi: { id: 'ativeCredOpenAi0', name: 'OpenAI (n8n Ative)' },
  imap: { id: 'ativeCredImap000', name: 'IMAP contato@ative' },
};
const ERRO_WORKFLOW = 'QtrobngLSAoMtnjX'; // GAB-WPP 0 - erros

const idDe = (wf, nome) => {
  const h = crypto.createHash('sha1').update(`${wf}/${nome}`).digest('hex');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-a${h.slice(17, 20)}-${h.slice(20, 32)}`;
};

// ---------- tipos de nó ----------
function codigo(nome, arquivo, { jev = false, porItem = false } = {}) {
  const corpo = fs.readFileSync(path.join(SRC, arquivo), 'utf8');
  const partes = [COMUM];
  if (jev) partes.push(PROMPT);
  partes.push(`// ===== ${arquivo} =====`, corpo);
  return {
    name: nome, type: 'n8n-nodes-base.code', typeVersion: 2,
    parameters: { mode: porItem ? 'runOnceForEachItem' : 'runOnceForAllItems', jsCode: partes.join('\n') },
  };
}

// Nó HTTP genérico do Notion: executa o pedido {method, url, body} montado pelo nó de código anterior
function notion(nome, { fonte = '$json', get = false, umaVez = false, paginar = 0, estatico = null } = {}) {
  const f = estatico ? null : fonte;
  const parameters = {
    method: get ? 'GET' : (estatico ? estatico.method : `={{ ${f}.method }}`),
    url: estatico ? estatico.url : `={{ ${f}.url }}`,
    authentication: 'predefinedCredentialType',
    nodeCredentialType: 'notionApi',
    sendHeaders: true,
    headerParameters: { parameters: [{ name: 'Notion-Version', value: '2022-06-28' }] },
    sendBody: !get,
    options: { batching: { batch: { batchSize: 3, batchInterval: 1100 } }, timeout: 30000 },
  };
  if (!get) {
    parameters.specifyBody = 'json';
    parameters.jsonBody = estatico ? JSON.stringify(estatico.body) : `={{ JSON.stringify(${f}.body || {}) }}`;
  }
  if (paginar) {
    parameters.options.pagination = { pagination: {
      paginationMode: 'updateAParameterInEachRequest',
      parameters: { parameters: [{ type: 'body', name: 'start_cursor', value: '={{ $response.body.next_cursor }}' }] },
      paginationCompleteWhen: 'other',
      completeExpression: '={{ !$response.body.has_more }}',
      limitPagesFetched: true,
      maxRequests: paginar,
    } };
  }
  return {
    name: nome, type: 'n8n-nodes-base.httpRequest', typeVersion: 4.2, parameters,
    credentials: { notionApi: CRED.notionApi },
    executeOnce: umaVez || undefined,
    retryOnFail: true, maxTries: 3, waitBetweenTries: 3000,
    onError: 'continueRegularOutput',
  };
}

function zapi(nome) {
  return {
    name: nome, type: 'n8n-nodes-base.httpRequest', typeVersion: 4.2,
    parameters: {
      method: 'POST', url: '={{ $json.zUrl }}',
      sendHeaders: true,
      headerParameters: { parameters: [{ name: 'Client-Token', value: "={{ $('Chaves Z-API').first().json.clientToken }}" }] },
      sendBody: true, specifyBody: 'json',
      jsonBody: '={{ JSON.stringify({ phone: $json.telefone, message: $json.texto }) }}',
      options: { batching: { batch: { batchSize: 1, batchInterval: 2500 } }, timeout: 30000 },
    },
    onError: 'continueRegularOutput', // nunca repete envio: falha vira "falhou" na fila
  };
}

function openaiChat(nome) {
  return {
    name: nome, type: 'n8n-nodes-base.httpRequest', typeVersion: 4.2,
    parameters: {
      method: 'POST', url: 'https://api.openai.com/v1/chat/completions',
      authentication: 'predefinedCredentialType', nodeCredentialType: 'openAiApi',
      sendBody: true, specifyBody: 'json', jsonBody: '={{ JSON.stringify($json.openaiBody) }}',
      options: { batching: { batch: { batchSize: 1, batchInterval: 300 } }, timeout: 120000 },
    },
    credentials: { openAiApi: CRED.openAiApi },
    retryOnFail: true, maxTries: 2, waitBetweenTries: 5000,
    onError: 'continueRegularOutput',
  };
}

function definir(nome, campos) {
  return {
    name: nome, type: 'n8n-nodes-base.set', typeVersion: 3.4,
    parameters: {
      mode: 'manual',
      assignments: { assignments: Object.entries(campos).map(([k, v]) => ({ id: idDe('set', `${nome}/${k}`), name: k, value: v, type: 'string' })) },
      options: {},
    },
  };
}

// ---------- montagem ----------
function fluxo(nomeFluxo, linhas, ligacoes, extras = {}) {
  const nodes = [];
  linhas.forEach((linha, li) => {
    linha.forEach((n, ci) => {
      if (!n) return;
      nodes.push({ id: idDe(nomeFluxo, n.name), position: [ci * 240, li * 260], ...n });
    });
  });
  const nomes = new Set(nodes.map((n) => n.name));
  const connections = {};
  for (const [de, saidas] of ligacoes) {
    if (!nomes.has(de)) throw new Error(`${nomeFluxo}: nó inexistente ${de}`);
    connections[de] = { main: saidas.map((alvos) => [].concat(alvos).map((a) => {
      if (!nomes.has(a)) throw new Error(`${nomeFluxo}: nó inexistente ${a}`);
      return { node: a, type: 'main', index: 0 };
    })) };
  }
  // Toda referência $('Nome') precisa existir
  for (const n of nodes) {
    const txt = JSON.stringify(n.parameters);
    for (const m of txt.matchAll(/\$\('([^']+)'\)/g)) if (!nomes.has(m[1])) throw new Error(`${nomeFluxo}/${n.name}: referência a nó inexistente ${m[1]}`);
  }
  return {
    name: nomeFluxo, nodes, connections,
    settings: { executionOrder: 'v1', timezone: 'America/Sao_Paulo', errorWorkflow: ERRO_WORKFLOW, callerPolicy: 'workflowsFromSameOwner' },
    ...extras,
  };
}

const seq = (...nomes) => nomes.slice(0, -1).map((n, i) => [n, [[nomes[i + 1]]]]);

// ===== GAB-WPP 4 — Central: portaria, Jev por conversa, fila de respostas e alertas =====
const DB_CONTROLES = 'b74182348b7a46ddb2182028c44dbc75';
const DB_FILA = '6b1fc7f7c6034371b2536a116c037b0b';
const central = fluxo('GAB-WPP 4 - Central (portaria, Jev, fila e alertas)', [
  // linha 0: gatilho, chaves e controles
  [
    { name: 'A cada 10 minutos', type: 'n8n-nodes-base.scheduleTrigger', typeVersion: 1.2,
      parameters: { rule: { interval: [{ field: 'cronExpression', expression: '*/10 7-21 * * *' }] } } },
    definir('Chaves Z-API', {
      pessoalInstancia: 'COLE_A_INSTANCIA_DO_PESSOAL', pessoalToken: 'COLE_O_TOKEN_DO_PESSOAL',
      businessInstancia: 'COLE_A_INSTANCIA_DO_BUSINESS', businessToken: 'COLE_O_TOKEN_DO_BUSINESS',
      clientToken: 'COLE_O_CLIENT_TOKEN', numeroJonas: '5548974007161',
    }),
    notion('Busca controles', { paginar: 2, estatico: { method: 'POST', url: `https://api.notion.com/v1/databases/${DB_CONTROLES}/query`, body: { page_size: 100 } } }),
    codigo('Config', 'wf4/config.js'),
  ],
  // linha 1: portaria
  [null, null, null, null,
    codigo('Plano da portaria', 'wf4/consultas_portaria.js'),
    notion('Busca pendentes', { fonte: '$json.pendentes', paginar: 3 }),
    notion('Busca contatos', { fonte: "$('Plano da portaria').first().json.contatos", umaVez: true, paginar: 10 }),
    codigo('Portaria', 'wf4/portaria.js'),
    codigo('Plano: busca empresa', 'wf4/plano_busca_empresa.js'),
    notion('Busca empresa'),
    codigo('Plano: cria contatos', 'wf4/plano_cria_contatos.js'),
    notion('Cria contatos'),
    codigo('Plano: atualiza', 'wf4/plano_atualiza.js'),
    notion('Grava portaria'),
  ],
  // linha 2: Jev lendo a conversa inteira
  [null, null, null, null,
    codigo('Quem analisar', 'wf4/quem_analisar.js'),
    notion('Busca candidatos'),
    codigo('Filtra por espera', 'wf4/filtra_espera.js'),
    notion('Busca conversa', { fonte: '$json.reqConversa' }),
    notion('Busca tarefas', { fonte: "$('Filtra por espera').item.json.reqTarefas" }),
    notion('Busca empresa da conversa', { fonte: '', get: true }),
    codigo('Monta pedido ao Jev', 'wf4/monta_jev.js', { jev: true, porItem: true }),
    openaiChat('Jev (OpenAI)'),
    codigo('Valida decisão do Jev', 'wf4/valida_jev.js', { porItem: true }),
    notion('Conta rascunhos', { umaVez: true, estatico: { method: 'POST', url: `https://api.notion.com/v1/databases/${DB_FILA}/query`, body: { sorts: [{ property: 'Número', direction: 'descending' }], page_size: 100 } } }),
    codigo('Plano de gravação', 'wf4/plano_gravacao.js'),
    notion('Grava decisões'),
  ],
  // linha 3: fila de respostas
  [null, null, null, null,
    codigo('Fila: consultas', 'wf4/fila_consultas.js'),
    notion('Busca aprovadas', { fonte: '$json.aprovadas' }),
    notion('Busca nível 1', { fonte: "$('Fila: consultas').first().json.nivel1", umaVez: true }),
    notion('Busca enviadas 24h', { fonte: "$('Fila: consultas').first().json.enviadas", umaVez: true, paginar: 5 }),
    codigo('Candidatos', 'wf4/candidatos.js'),
    notion('Busca contato da resposta', { get: true }),
    codigo('Travas', 'wf4/travas.js'),
    notion('Grava travas'),
    codigo('Lista de envios', 'wf4/lista_envios.js'),
    zapi('Envia resposta (Z-API)'),
    codigo('Registra envio', 'wf4/registra_envio.js'),
    notion('Grava envio'),
  ],
  // linha 4: alertas para o Jonas
  [null, null, null, null,
    codigo('Alertas: consulta', 'wf4/alertas_consulta.js'),
    notion('Busca alertas'),
    codigo('Monta alerta', 'wf4/monta_alerta.js'),
    zapi('Envia alerta (Z-API)'),
    codigo('Desmarca alertas', 'wf4/desmarca_alertas.js'),
    notion('Grava alertas'),
  ],
], [
  ...seq('A cada 10 minutos', 'Chaves Z-API', 'Busca controles'),
  ['Busca controles', [['Config']]],
  ['Config', [['Plano da portaria', 'Quem analisar', 'Fila: consultas', 'Alertas: consulta']]],
  ...seq('Plano da portaria', 'Busca pendentes', 'Busca contatos', 'Portaria', 'Plano: busca empresa', 'Busca empresa', 'Plano: cria contatos', 'Cria contatos', 'Plano: atualiza', 'Grava portaria'),
  ...seq('Quem analisar', 'Busca candidatos', 'Filtra por espera', 'Busca conversa', 'Busca tarefas', 'Busca empresa da conversa', 'Monta pedido ao Jev', 'Jev (OpenAI)', 'Valida decisão do Jev', 'Conta rascunhos', 'Plano de gravação', 'Grava decisões'),
  ...seq('Fila: consultas', 'Busca aprovadas', 'Busca nível 1', 'Busca enviadas 24h', 'Candidatos', 'Busca contato da resposta', 'Travas', 'Grava travas', 'Lista de envios', 'Envia resposta (Z-API)', 'Registra envio', 'Grava envio'),
  ...seq('Alertas: consulta', 'Busca alertas', 'Monta alerta', 'Envia alerta (Z-API)', 'Desmarca alertas', 'Grava alertas'),
]);
// URLs dos GET: vêm de campos específicos
central.nodes.find((n) => n.name === 'Busca empresa da conversa').parameters.url = "={{ $('Filtra por espera').item.json.urlEmpresa }}";
central.nodes.find((n) => n.name === 'Busca contato da resposta').parameters.url = '={{ $json.urlContato }}';

// ===== GAB-WPP 3 — Captura de e-mail (caixa de entrada e enviados) =====
const imap = (nome, pasta) => ({
  name: nome, type: 'n8n-nodes-base.emailReadImap', typeVersion: 2.2,
  parameters: { mailbox: pasta, postProcessAction: 'nothing', format: 'resolved', dataPropertyAttachmentsPrefixName: 'anexo_', options: { customEmailConfig: '["ALL"]', trackLastMessageId: true } },
  credentials: { imap: CRED.imap },
});
const email = fluxo('GAB-WPP 3 - Captura e-mail (contato@ative)', [
  [imap('E-mail na caixa de entrada', 'INBOX')],
  [imap('E-mail nos enviados', 'INBOX.Sent'), codigo('Normaliza e-mail', 'wf3/normaliza_email.js'), notion('Busca duplicata', { fonte: '$json.buscaDuplicata' }), codigo('Monta registro', 'wf3/monta_registro_email.js'), notion('Grava no Notion')],
], [
  ['E-mail na caixa de entrada', [['Normaliza e-mail']]],
  ...seq('E-mail nos enviados', 'Normaliza e-mail', 'Busca duplicata', 'Monta registro', 'Grava no Notion'),
]);

// ===== GAB-WPP 5 — Captura da linha WhatsApp Business (Z-API) =====
const CAMINHO_WEBHOOK = `ative-business-${crypto.createHash('sha1').update('ative-business-central').digest('hex').slice(0, 12)}`;
const business = fluxo('GAB-WPP 5 - Captura WhatsApp Business', [
  [
    { name: 'Webhook Z-API Business', type: 'n8n-nodes-base.webhook', typeVersion: 2,
      parameters: { httpMethod: 'POST', path: CAMINHO_WEBHOOK, responseMode: 'onReceived', options: {} },
      webhookId: idDe('webhook', CAMINHO_WEBHOOK) },
    definir('Config Business', { instanciaBusiness: 'COLE_A_INSTANCIA_DO_BUSINESS' }),
    codigo('Normaliza (Business)', 'wf5/normaliza_business.js'),
    notion('Busca duplicata', { fonte: '$json.buscaDuplicata' }),
    codigo('Segue se for nova', 'wf5/segue_se_novo.js'),
    { name: 'É áudio?', type: 'n8n-nodes-base.if', typeVersion: 2.2,
      parameters: {
        conditions: {
          options: { caseSensitive: true, leftValue: '', typeValidation: 'loose', version: 2 },
          conditions: [{ id: idDe('if', 'audio'), leftValue: "={{ $json.tipo === 'audio' && !!$json.midia }}", rightValue: '', operator: { type: 'boolean', operation: 'true', singleValue: true } }],
          combinator: 'and',
        },
        options: {},
      } },
  ],
  [null, null, null, null, null, null,
    { name: 'Baixa o áudio', type: 'n8n-nodes-base.httpRequest', typeVersion: 4.2,
      parameters: { url: '={{ $json.midia }}', options: { response: { response: { responseFormat: 'file', outputPropertyName: 'data' } }, timeout: 60000 } },
      onError: 'continueRegularOutput' },
    { name: 'Transcreve (OpenAI)', type: 'n8n-nodes-base.httpRequest', typeVersion: 4.2,
      parameters: {
        method: 'POST', url: 'https://api.openai.com/v1/audio/transcriptions',
        authentication: 'predefinedCredentialType', nodeCredentialType: 'openAiApi',
        sendBody: true, contentType: 'multipart-form-data',
        bodyParameters: { parameters: [
          { parameterType: 'formBinaryData', name: 'file', inputDataFieldName: 'data' },
          { name: 'model', value: 'whisper-1' },
          { name: 'language', value: 'pt' },
        ] },
        options: { timeout: 120000 },
      },
      credentials: { openAiApi: CRED.openAiApi },
      onError: 'continueRegularOutput' },
  ],
  [null, null, null, null, null, null, null, null, codigo('Monta registro', 'wf5/monta_registro_business.js'), notion('Grava no Notion')],
], [
  ...seq('Webhook Z-API Business', 'Config Business', 'Normaliza (Business)', 'Busca duplicata', 'Segue se for nova', 'É áudio?'),
  ['É áudio?', [['Baixa o áudio'], ['Monta registro']]],
  ...seq('Baixa o áudio', 'Transcreve (OpenAI)', 'Monta registro', 'Grava no Notion'),
]);

// ---------- gravação ----------
fs.mkdirSync(SAIDA, { recursive: true });
const saidas = [['gab-wpp-4-central.json', central], ['gab-wpp-3-email.json', email], ['gab-wpp-5-business.json', business]];
for (const [arq, wf] of saidas) {
  let txt = JSON.stringify(wf, null, 2);
  if (TESTE) {
    txt = txt.split('https://api.notion.com/v1').join(`${TESTE}/notion`)
      .split('https://api.z-api.io').join(`${TESTE}/zapi`)
      .split('https://api.openai.com/v1').join(`${TESTE}/openai`);
  }
  // Os nós de código precisam compilar
  for (const n of JSON.parse(txt).nodes.filter((x) => x.type === 'n8n-nodes-base.code')) {
    try { new Function('$input', '$', '$json', `return (async () => {\n${n.parameters.jsCode}\n})`); } catch (e) { throw new Error(`${wf.name}/${n.name}: ${e.message}`); }
  }
  fs.writeFileSync(path.join(SAIDA, arq), `${txt}\n`);
  console.log(`${arq}: ${wf.nodes.length} nós`);
}
console.log(`Webhook do Business: /webhook/${CAMINHO_WEBHOOK}`);
