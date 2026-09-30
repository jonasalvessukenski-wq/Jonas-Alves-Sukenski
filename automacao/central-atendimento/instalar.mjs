#!/usr/bin/env node
// Instala os fluxos da central no n8n Cloud pela API pública.
//
//   node instalar.mjs                          -> confere tudo e mostra o que vai fazer (não grava nada)
//   node instalar.mjs --gravar                 -> cria ou atualiza os 3 fluxos, todos DESLIGADOS
//   node instalar.mjs --gravar --ligar central -> e publica (liga) o fluxo central
//        --ligar aceita: central, email, business (separados por vírgula)
//
// Precisa de N8N_API_KEY no ambiente. Opcionais: N8N_URL, BUSINESS_INSTANCIA, BUSINESS_TOKEN, IMAP_CRED_ID.
// As chaves da Z-API da linha pessoal são copiadas do nó Config do GAB-WPP 2 (não passam por conversa nenhuma).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const URL_N8N = (process.env.N8N_URL || 'https://ativeassessoriafinanceir.app.n8n.cloud').replace(/\/$/, '');
const CHAVE = process.env.N8N_API_KEY;
const args = process.argv.slice(2);
const GRAVAR = args.includes('--gravar');
const LIGAR = (args[args.indexOf('--ligar') + 1] || '').split(',').filter((x) => args.includes('--ligar') && x);
const WF1 = 'IJLPj2CoZmrGomw0'; // GAB-WPP 1 - captura
const WF2 = 'VyXguNQmosDizrnR'; // GAB-WPP 2 - despacho das 18h
const ARQUIVOS = { central: 'gab-wpp-4-central.json', email: 'gab-wpp-3-email.json', business: 'gab-wpp-5-business.json' };

if (!CHAVE) { console.error('Falta N8N_API_KEY no ambiente.'); process.exit(1); }

async function api(metodo, caminho, corpo) {
  const r = await fetch(`${URL_N8N}/api/v1${caminho}`, {
    method: metodo,
    headers: { 'X-N8N-API-KEY': CHAVE, accept: 'application/json', ...(corpo ? { 'content-type': 'application/json' } : {}) },
    body: corpo ? JSON.stringify(corpo) : undefined,
  });
  const txt = await r.text();
  let json; try { json = txt ? JSON.parse(txt) : {}; } catch { json = { bruto: txt }; }
  if (!r.ok) throw new Error(`${metodo} ${caminho} -> ${r.status}: ${txt.slice(0, 300)}`);
  return json;
}

const vazio = (v) => !v || /COLE|PREENCHER|A_DEFINIR|INSTANCIA$|^TOKEN$/i.test(String(v));
const mascara = (v) => (vazio(v) ? '(vazio)' : `${String(v).slice(0, 4)}…${String(v).slice(-2)}`);

// Procura um valor pelo nome do campo em qualquer nó (Set v1/v2/v3 ou código "chave: 'valor'")
function extrai(wf, nomes) {
  for (const n of wf.nodes || []) {
    const p = n.parameters || {};
    const pares = [
      ...((p.assignments && p.assignments.assignments) || []).map((a) => [a.name, a.value]),
      ...Object.values(p.values || {}).flat().map((a) => [a && a.name, a && a.value]),
    ];
    for (const nome of nomes) {
      const achou = pares.find(([k, v]) => k === nome && !vazio(v));
      if (achou) return String(achou[1]).trim();
      const codigo = p.jsCode || p.functionCode || '';
      const m = codigo.match(new RegExp(`\\b${nome}\\s*[:=]\\s*['"\`]([^'"\`]+)['"\`]`));
      if (m && !vazio(m[1])) return m[1].trim();
    }
  }
  return '';
}
function credencial(wfs, tipo) {
  for (const wf of wfs) for (const n of wf.nodes || []) if (n.credentials && n.credentials[tipo]) return n.credentials[tipo];
  return null;
}
function numero(v) {
  let d = String(v || '').replace(/\D/g, '');
  if (d.length === 10 || d.length === 11) d = `55${d}`;
  return d;
}

async function main() {
  console.log(`n8n: ${URL_N8N}  |  modo: ${GRAVAR ? 'GRAVAR' : 'só conferir'}`);
  const [wf1, wf2] = await Promise.all([api('GET', `/workflows/${WF1}`), api('GET', `/workflows/${WF2}`)]);

  const chaves = {
    pessoalInstancia: extrai(wf2, ['instancia', 'instanciaZapi']) || extrai(wf1, ['instanciaEsperada']),
    pessoalToken: extrai(wf2, ['tokenZapi', 'token']),
    clientToken: extrai(wf2, ['clientToken']),
    numeroJonas: numero(extrai(wf2, ['numeroDestino']) || extrai(wf1, ['numeroJonas']) || '5548974007161'),
    businessInstancia: process.env.BUSINESS_INSTANCIA || '',
    businessToken: process.env.BUSINESS_TOKEN || '',
  };
  const credNotion = credencial([wf1, wf2], 'notionApi');
  const credOpenAi = credencial([wf1, wf2], 'openAiApi');
  let credImap = process.env.IMAP_CRED_ID ? { id: process.env.IMAP_CRED_ID, name: 'IMAP' } : null;
  let credSmtp = process.env.SMTP_CRED_ID ? { id: process.env.SMTP_CRED_ID, name: 'SMTP' } : null;
  if (!credImap || !credSmtp) {
    try {
      const lista = await api('GET', '/credentials?limit=250');
      const achaTipo = (t) => (lista.data || []).find((x) => x.type === t);
      if (!credImap && achaTipo('imap')) credImap = { id: achaTipo('imap').id, name: achaTipo('imap').name };
      if (!credSmtp && achaTipo('smtp')) credSmtp = { id: achaTipo('smtp').id, name: achaTipo('smtp').name };
    } catch (e) { console.log(`(não deu para listar credenciais: ${e.message.slice(0, 80)})`); }
  }

  console.log('\nChaves Z-API encontradas:');
  for (const [k, v] of Object.entries(chaves)) console.log(`  ${k.padEnd(18)} ${k === 'numeroJonas' ? v : mascara(v)}`);
  console.log(`Credencial Notion: ${credNotion ? `${credNotion.name} (${credNotion.id})` : 'NÃO ACHEI'}`);
  console.log(`Credencial OpenAI: ${credOpenAi ? `${credOpenAi.name} (${credOpenAi.id})` : 'NÃO ACHEI'}`);
  console.log(`Credencial IMAP:   ${credImap ? `${credImap.name} (${credImap.id})` : 'ainda não existe (criar no n8n: Credentials > New > IMAP)'}`);
  console.log(`Credencial SMTP:   ${credSmtp ? `${credSmtp.name} (${credSmtp.id})` : 'ainda não existe (criar no n8n: Credentials > New > SMTP)'}`);
  if (!credNotion || !credOpenAi) throw new Error('Sem as credenciais do Notion e da OpenAI não dá para seguir.');

  const trocaCred = (wf) => {
    for (const n of wf.nodes) {
      if (!n.credentials) continue;
      if (n.credentials.notionApi) n.credentials.notionApi = credNotion;
      if (n.credentials.openAiApi) n.credentials.openAiApi = credOpenAi;
      if (n.credentials.imap && credImap) n.credentials.imap = credImap;
      if (n.credentials.smtp && credSmtp) n.credentials.smtp = credSmtp;
    }
  };
  const fluxos = {};
  for (const [qual, arq] of Object.entries(ARQUIVOS)) {
    const wf = JSON.parse(fs.readFileSync(path.join(AQUI, 'workflows', arq), 'utf8'));
    trocaCred(wf);
    if (qual === 'central') {
      for (const a of wf.nodes.find((n) => n.name === 'Chaves Z-API').parameters.assignments.assignments) if (!vazio(chaves[a.name])) a.value = chaves[a.name];
    }
    if (qual === 'business' && !vazio(chaves.businessInstancia)) {
      wf.nodes.find((n) => n.name === 'Config Business').parameters.assignments.assignments[0].value = chaves.businessInstancia;
    }
    fluxos[qual] = wf;
  }
  const hook = fluxos.business.nodes.find((n) => n.type === 'n8n-nodes-base.webhook').parameters.path;

  const existentes = (await api('GET', '/workflows?limit=250')).data || [];
  const ids = {};
  for (const [qual, wf] of Object.entries(fluxos)) {
    const ja = existentes.find((x) => x.name === wf.name);
    const corpo = { name: wf.name, nodes: wf.nodes, connections: wf.connections, settings: wf.settings };
    if (!GRAVAR) { console.log(`\n[${qual}] ${wf.name}: ${ja ? `atualizaria ${ja.id}` : 'criaria novo'} (${wf.nodes.length} nós)`); continue; }
    const r = ja ? await api('PUT', `/workflows/${ja.id}`, corpo) : await api('POST', '/workflows', corpo);
    ids[qual] = r.id || (ja && ja.id);
    console.log(`\n[${qual}] ${wf.name}: ${ja ? 'atualizado' : 'criado'} -> ${ids[qual]}`);
    if (ja && ja.active && !LIGAR.includes(qual)) console.log('  (estava ligado: republique no n8n ou rode de novo com --ligar)');
  }
  for (const qual of LIGAR) {
    if (!ids[qual]) continue;
    try { await api('POST', `/workflows/${ids[qual]}/publish`); } catch (e) { await api('POST', `/workflows/${ids[qual]}/activate`); }
    console.log(`[${qual}] ligado.`);
  }

  console.log(`\nURL do webhook da linha Business (colar na Z-API, instância do Business, campo "Ao receber"):\n  ${URL_N8N}/webhook/${hook}`);
  const falta = [];
  if (vazio(chaves.pessoalToken) || vazio(chaves.clientToken)) falta.push('chaves da Z-API da linha pessoal (nó "Chaves Z-API" do fluxo central)');
  if (vazio(chaves.businessInstancia)) falta.push('instância e token do Business nos nós "Chaves Z-API" (central) e "Config Business"');
  if (!credImap) falta.push('credencial IMAP do contato@ (o Jonas digita a senha no n8n) e escolher nos 2 nós de e-mail');
  if (!credSmtp) falta.push('credencial SMTP do contato@ para enviar e-mail (o Jonas digita a senha no n8n); depois ligar envioEmail nos Controles');
  if (falta.length) console.log(`\nFalta:\n- ${falta.join('\n- ')}`);
}
main().catch((e) => { console.error(`\nERRO: ${e.message}`); process.exit(1); });
