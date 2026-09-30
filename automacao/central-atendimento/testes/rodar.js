#!/usr/bin/env node
// Roda os três fluxos num n8n local contra o simulador e confere o resultado.
// Uso: N8N_DIR=/caminho/do/n8n node testes/rodar.js [central|email|business]
const { execFileSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const RAIZ = path.join(__dirname, '..');
const N8N_DIR = process.env.N8N_DIR || '/tmp/claude-0/n8n-test';
const N8N = path.join(N8N_DIR, 'node_modules/.bin/n8n');
const PORTA = 5999;
const BASE = `http://127.0.0.1:${PORTA}`;
const TRAB = fs.mkdtempSync(path.join(process.env.TMPDIR || os.tmpdir(), 'central-teste-'));
const qual = process.argv[2] || 'central';
// O n8n 2.x pede Node 24: NODE_BIN aponta para a pasta do binário, se o Node padrão for mais antigo
const PATH_N8N = process.env.NODE_BIN ? `${process.env.NODE_BIN}:${process.env.PATH}` : process.env.PATH;
const env = { ...process.env, PATH: PATH_N8N, N8N_USER_FOLDER: TRAB, N8N_ENCRYPTION_KEY: 'teste-local', N8N_DIAGNOSTICS_ENABLED: 'false', N8N_LOG_LEVEL: 'warn', DB_SQLITE_POOL_SIZE: '1', N8N_RUNNERS_ENABLED: 'true', GENERIC_TIMEZONE: 'America/Sao_Paulo', NO_PROXY: '127.0.0.1,localhost', no_proxy: '127.0.0.1,localhost' };

execFileSync('node', [path.join(RAIZ, 'build.js'), '--teste', BASE], { stdio: 'inherit' });
const ler = (arq) => JSON.parse(fs.readFileSync(path.join(RAIZ, 'testes/workflows', arq), 'utf8'));
const CT = require('./cenario_central').CLIENT_TOKEN;

function trocaGatilho(wf, nomes, dados) {
  // Troca gatilhos reais (IMAP, webhook) por um gatilho manual + nó de código com o mesmo nome, que devolve o conteúdo de teste
  const gat = { id: 'gatilho-manual', name: 'Gatilho de teste', type: 'n8n-nodes-base.manualTrigger', typeVersion: 1, position: [-300, 0], parameters: {} };
  wf.nodes = wf.nodes.filter((n) => !nomes.slice(1).includes(n.name));
  const alvo = wf.nodes.find((n) => n.name === nomes[0]);
  Object.assign(alvo, { type: 'n8n-nodes-base.code', typeVersion: 2, parameters: { jsCode: `return ${JSON.stringify(dados)}.map((json) => ({ json }));` }, credentials: undefined, webhookId: undefined });
  for (const n of nomes.slice(1)) delete wf.connections[n];
  wf.nodes.push(gat);
  wf.connections[gat.name] = { main: [[{ node: nomes[0], type: 'main', index: 0 }]] };
}

async function emailsDeTeste() {
  const { simpleParser } = require(path.join(N8N_DIR, 'node_modules/mailparser'));
  const crus = [
    ['Message-ID: <r1@alfa.com.br>', 'From: "Ana Lima" <ana@empresay.com.br>', 'To: contato@ativeassessoriafinanceira.com.br', 'Subject: Re: =?UTF-8?Q?Diagn=C3=B3stico_financeiro?=', 'Date: Wed, 30 Sep 2026 09:10:00 -0300', 'Content-Type: text/plain; charset=utf-8', '', 'Olá Jonas, pode me mandar a apresentação?', '', 'Em ter., 29 de set. de 2026 às 10:00, Jonas <contato@ativeassessoriafinanceira.com.br>', 'escreveu:', '> Olá, sou o Jonas da Ative...'],
    ['Message-ID: <b1@mx>', 'From: Mail Delivery System <MAILER-DAEMON@mx.hostinger.com>', 'To: contato@ativeassessoriafinanceira.com.br', 'Subject: Undelivered Mail Returned to Sender', 'Date: Wed, 30 Sep 2026 09:11:00 -0300', 'Content-Type: text/plain', '', 'This is the mail system.', '<x@empresaz.com.br>: host not found', 'Final-Recipient: rfc822; x@empresaz.com.br'],
    ['Message-ID: <a1@beta>', 'From: Recepcao <recepcao@beta.com.br>', 'To: contato@ativeassessoriafinanceira.com.br', 'Subject: Resposta automática: Diagnóstico', 'Auto-Submitted: auto-replied', 'Date: Wed, 30 Sep 2026 09:12:00 -0300', 'Content-Type: text/plain', '', 'Estou de férias até dia 10.'],
    ['Message-ID: <d1@gama>', 'From: Pedro <pedro@gama.com.br>', 'To: contato@ativeassessoriafinanceira.com.br', 'Subject: Re: Diagnóstico', 'Date: Wed, 30 Sep 2026 09:13:00 -0300', 'Content-Type: text/plain', '', 'Por favor, me remova da lista.'],
    ['Message-ID: <s1@ative>', 'From: Jonas <contato@ativeassessoriafinanceira.com.br>', 'To: "Financeiro" <financeiro@novaempresa.com.br>', 'Subject: Diagnóstico financeiro', 'Date: Wed, 30 Sep 2026 09:14:00 -0300', 'Content-Type: text/html; charset=utf-8', '', '<p>Olá, tudo bem?</p><p>Sou o Jonas, da Ative.</p>'],
    ['Message-ID: <r1@alfa.com.br>', 'From: "Ana Lima" <ana@empresay.com.br>', 'To: contato@ativeassessoriafinanceira.com.br', 'Subject: duplicado', 'Date: Wed, 30 Sep 2026 09:10:00 -0300', '', 'mesmo Message-ID: não pode gravar duas vezes'],
  ];
  const out = [];
  for (const linhas of crus) {
    const r = await simpleParser(Buffer.from(linhas.join('\r\n')));
    const headers = {};
    for (const h of r.headerLines) headers[h.key] = h.line;
    out.push(JSON.parse(JSON.stringify({ ...r, headers, headerLines: undefined, attachments: undefined, attributes: { uid: out.length + 1 } })));
  }
  return out;
}

const avisosBusiness = [
  { type: 'ReceivedCallback', instanceId: 'INST-BUS', messageId: 'M1', phone: '5548977776666', chatLid: '11122233344455@lid', fromMe: false, fromApi: false, isGroup: false, senderName: 'Roberto', chatName: 'Roberto', momment: Date.now(), text: { message: 'Recebi a mensagem de vocês, podemos falar?' } },
  { type: 'ReceivedCallback', instanceId: 'INST-BUS', messageId: 'M2', phone: '5548977776666', fromMe: false, fromApi: false, isGroup: false, senderName: 'Roberto', momment: Date.now(), audio: { audioUrl: `${BASE}/midia/audio-123.ogg`, seconds: 7, mimeType: 'audio/ogg; codecs=opus', ptt: true } },
  { type: 'ReceivedCallback', instanceId: 'INST-BUS', messageId: 'M3', phone: '120363000000@g.us', isGroup: true, fromMe: false, momment: Date.now(), text: { message: 'grupo' } },
  { type: 'ReceivedCallback', instanceId: 'INST-BUS', messageId: 'M4', phone: '5548977776666', fromMe: true, fromApi: true, momment: Date.now(), text: { message: 'eco do sistema' } },
  { type: 'MessageStatusCallback', instanceId: 'INST-BUS', status: 'READ' },
  { type: 'ReceivedCallback', instanceId: 'OUTRA', messageId: 'M6', phone: '5548977776666', fromMe: false, momment: Date.now(), text: { message: 'instância errada' } },
  { type: 'ReceivedCallback', instanceId: 'INST-BUS', messageId: 'M1', phone: '5548977776666', fromMe: false, momment: Date.now(), text: { message: 'duplicada' } },
];

function importa(wf, id) {
  wf.id = id;
  wf.active = false;
  const arq = path.join(TRAB, `${id}.json`);
  fs.writeFileSync(arq, JSON.stringify(wf));
  execFileSync(N8N, ['import:workflow', `--input=${arq}`], { env, stdio: 'pipe' });
}

function executa(id) {
  try {
    const out = execFileSync(N8N, ['execute', `--id=${id}`, '--rawOutput'], { env, maxBuffer: 1 << 28, timeout: 300000 }).toString();
    return out;
  } catch (e) {
    return `FALHOU: ${e.stdout || ''}${e.stderr || ''}`;
  }
}

async function main() {
  const creds = [
    { id: 'ativeCredNotion0', name: 'Notion (n8n Ative)', type: 'notionApi', data: { apiKey: 'secret_teste' } },
    { id: 'ativeCredOpenAi0', name: 'OpenAI (n8n Ative)', type: 'openAiApi', data: { apiKey: 'sk-teste', url: `${BASE}/openai` } },
    { id: 'ativeCredSmtp000', name: 'SMTP contato@ative', type: 'smtp', data: { user: 'contato@ativeassessoriafinanceira.com.br', password: 'teste', host: '127.0.0.1', port: PORTA + 1, secure: false, disableStartTls: true } },
  ];
  fs.writeFileSync(path.join(TRAB, 'creds.json'), JSON.stringify(creds));
  execFileSync(N8N, ['import:credentials', `--input=${path.join(TRAB, 'creds.json')}`], { env, stdio: 'pipe' });

  const execucoes = [];
  if (qual === 'central') {
    const wf = ler('gab-wpp-4-central.json');
    const ch = wf.nodes.find((n) => n.name === 'Chaves Z-API');
    const val = { pessoalInstancia: 'INST-PES', pessoalToken: 'TOK-PES', businessInstancia: 'INST-BUS', businessToken: 'TOK-BUS', clientToken: CT, numeroJonas: '5548974007161' };
    for (const a of ch.parameters.assignments.assignments) a.value = val[a.name];
    Object.assign(wf.nodes.find((n) => n.name === 'A cada 10 minutos'), { type: 'n8n-nodes-base.manualTrigger', typeVersion: 1, parameters: {} });
    importa(wf, 'testeCentral0001');
    execucoes.push(['testeCentral0001', 2]); // duas rodadas: a segunda não pode repetir nada
  }
  if (qual === 'email') {
    const wf = ler('gab-wpp-3-email.json');
    trocaGatilho(wf, ['E-mail nos enviados', 'E-mail na caixa de entrada'], await emailsDeTeste());
    importa(wf, 'testeEmail000001');
    execucoes.push(['testeEmail000001', 1]);
  }
  if (qual === 'business') {
    const base = ler('gab-wpp-5-business.json');
    base.nodes.find((n) => n.name === 'Config Business').parameters.assignments.assignments[0].value = 'INST-BUS';
    avisosBusiness.forEach((av, i) => {
      const wf = JSON.parse(JSON.stringify(base));
      trocaGatilho(wf, ['Webhook Z-API Business'], [{ headers: {}, params: {}, query: {}, body: av }]);
      const id = `testeBusiness${String(i).padStart(3, '0')}`;
      importa(wf, id);
      execucoes.push([id, 1]);
    });
  }

  const saida = path.join(TRAB, 'resultado.json');
  const cen = path.join(__dirname, qual === 'central' ? 'cenario_central.js' : 'cenario_capturas.js');
  const sim = spawn('node', [path.join(__dirname, 'simulador.js'), String(PORTA), cen, saida], { stdio: ['ignore', 'pipe', 'inherit'] });
  await new Promise((r) => sim.stdout.once('data', r));
  const brutos = [];
  for (const [id, vezes] of execucoes) for (let i = 0; i < vezes; i += 1) brutos.push([id, executa(id)]);
  sim.kill('SIGTERM');
  await new Promise((r) => sim.once('exit', r));
  fs.writeFileSync(path.join(TRAB, 'execucoes.txt'), brutos.map(([id, o]) => `=== ${id}\n${o}`).join('\n'));
  console.log(`Pasta do teste: ${TRAB}`);
  console.log(`Resultado: ${saida}`);
}
main().catch((e) => { console.error(e); process.exit(1); });
