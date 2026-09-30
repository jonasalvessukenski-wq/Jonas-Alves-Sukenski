// Simulador do Notion, da OpenAI e da Z-API para testar os fluxos no n8n local, sem tocar nos dados reais.
// Uso: node testes/simulador.js <porta> <arquivo-do-cenario.js> <arquivo-de-saida.json>
const http = require('http');
const crypto = require('crypto');
const fs = require('fs');

const PORTA = Number(process.argv[2] || 5999);
const cenario = require(require('path').resolve(process.argv[3]));
const SAIDA = process.argv[4] || 'resultado.json';

const paginas = new Map(); // id -> { id, db, created_time, properties (formato de leitura) }
const log = [];
const agora = () => new Date();

// ---------- conversão escrita -> leitura ----------
function paraLeitura(v) {
  if (!v || typeof v !== 'object') return v;
  if (v.title) return { type: 'title', title: v.title.map((t) => ({ plain_text: t.text.content, text: t.text })) };
  if (v.rich_text) return { type: 'rich_text', rich_text: v.rich_text.map((t) => ({ plain_text: t.text.content, text: t.text })) };
  if ('select' in v) return { type: 'select', select: v.select ? { name: v.select.name } : null };
  if (v.status) return { type: 'status', status: { name: v.status.name } };
  if (v.relation) return { type: 'relation', relation: v.relation.map((r) => ({ id: r.id })) };
  if ('date' in v) return { type: 'date', date: v.date ? { start: v.date.start } : null };
  if ('checkbox' in v) return { type: 'checkbox', checkbox: !!v.checkbox };
  if ('phone_number' in v) return { type: 'phone_number', phone_number: v.phone_number };
  if ('email' in v) return { type: 'email', email: v.email };
  if ('number' in v) return { type: 'number', number: v.number };
  if ('url' in v) return { type: 'url', url: v.url };
  return v;
}
const minuto = (iso) => { const d = new Date(iso); d.setUTCSeconds(0, 0); return d.toISOString(); };

function comFormulas(pg) {
  const props = { ...pg.properties };
  if (pg.db === cenario.DB.crm) {
    const um = props['Última mensagem em'] && props['Última mensagem em'].date ? props['Última mensagem em'].date.start : null;
    const ua = props['Última análise'] && props['Última análise'].date ? props['Última análise'].date.start : null;
    const precisa = !!um && (!ua || (Date.parse(minuto(um)) - Date.parse(minuto(ua))) > 0);
    props['Precisa análise'] = { type: 'formula', formula: { type: 'boolean', boolean: precisa } };
  }
  return { object: 'page', id: pg.id, created_time: pg.created_time, parent: { database_id: pg.db }, properties: props };
}

function criar(db, propsEscrita, created) {
  const id = crypto.randomUUID();
  const properties = {};
  for (const [k, v] of Object.entries(propsEscrita || {})) properties[k] = paraLeitura(v);
  paginas.set(id, { id, db, created_time: minuto(created || agora().toISOString()), properties });
  return id;
}

// ---------- filtros ----------
const textoDe = (p) => {
  if (!p) return '';
  if (p.title) return p.title.map((t) => t.plain_text).join('');
  if (p.rich_text) return p.rich_text.map((t) => t.plain_text).join('');
  if (p.phone_number !== undefined) return p.phone_number || '';
  if (p.email !== undefined) return p.email || '';
  return '';
};
function casa(pg, f) {
  if (!f) return true;
  if (f.and) return f.and.every((x) => casa(pg, x));
  if (f.or) return f.or.some((x) => casa(pg, x));
  if (f.timestamp === 'created_time') {
    const c = f.created_time;
    if (c.on_or_after) return Date.parse(pg.created_time) >= Date.parse(minuto(c.on_or_after));
    if (c.on_or_before) return Date.parse(pg.created_time) <= Date.parse(c.on_or_before);
    return true;
  }
  const p = comFormulas(pg).properties[f.property];
  const [tipo, cond] = Object.entries(f).find(([k]) => k !== 'property');
  const [op, val] = Object.entries(cond)[0];
  switch (tipo) {
    case 'rich_text': case 'title': case 'phone_number': case 'email': {
      const t = textoDe(p);
      if (op === 'is_empty') return !t;
      if (op === 'is_not_empty') return !!t;
      if (op === 'equals') return t === val;
      if (op === 'contains') return t.includes(val);
      if (op === 'ends_with') return t.endsWith(val);
      return false;
    }
    case 'select': {
      const n = p && p.select ? p.select.name : null;
      if (op === 'equals') return n === val;
      if (op === 'does_not_equal') return n !== val;
      if (op === 'is_empty') return !n;
      if (op === 'is_not_empty') return !!n;
      return false;
    }
    case 'checkbox': return (p ? !!p.checkbox : false) === val;
    case 'relation': return op === 'contains' ? !!(p && p.relation && p.relation.some((r) => r.id === val)) : false;
    case 'formula': return (p && p.formula ? p.formula.boolean : false) === cond.checkbox.equals;
    case 'date': {
      const d = p && p.date ? p.date.start : null;
      if (!d) return false;
      if (op === 'on_or_before') return Date.parse(d) <= Date.parse(val);
      if (op === 'on_or_after') return Date.parse(d) >= Date.parse(val);
      return false;
    }
    default: throw new Error(`filtro não simulado: ${tipo}`);
  }
}
function ordena(lista, sorts) {
  for (const s of [...(sorts || [])].reverse()) {
    lista.sort((a, b) => {
      const va = s.timestamp ? a.created_time : (() => { const p = a.properties[s.property]; return p ? (p.number ?? (p.date && p.date.start) ?? '') : ''; })();
      const vb = s.timestamp ? b.created_time : (() => { const p = b.properties[s.property]; return p ? (p.number ?? (p.date && p.date.start) ?? '') : ''; })();
      const r = va < vb ? -1 : va > vb ? 1 : 0;
      return s.direction === 'descending' ? -r : r;
    });
  }
  return lista;
}

// ---------- respostas simuladas ----------
function jev(body) {
  const u = body.messages.find((m) => m.role === 'user').content;
  const nome = (u.match(/^CONTATO: (.+)$/m) || [])[1] || '';
  const d = cenario.decisaoJev(nome, u);
  return { id: 'chatcmpl-sim', object: 'chat.completion', choices: [{ index: 0, message: { role: 'assistant', content: JSON.stringify(d) }, finish_reason: 'stop' }] };
}

function responde(res, cod, obj) {
  res.writeHead(cod, { 'content-type': 'application/json' });
  res.end(JSON.stringify(obj));
}

const servidor = http.createServer((req, res) => {
  const partes = [];
  req.on('data', (c) => partes.push(c));
  req.on('end', () => {
    const cru = Buffer.concat(partes);
    let body = {};
    const ct = req.headers['content-type'] || '';
    if (ct.includes('json') && cru.length) { try { body = JSON.parse(cru.toString()); } catch (e) { body = { invalido: cru.toString() }; } }
    const u = req.url;
    const entrada = { metodo: req.method, url: u, headers: { 'notion-version': req.headers['notion-version'], 'client-token': req.headers['client-token'], authorization: req.headers.authorization ? 'sim' : 'não', 'content-type': ct }, body };
    log.push(entrada);
    try {
      let m;
      if ((m = u.match(/^\/notion\/databases\/([\w-]+)\/query$/))) {
        const db = m[1].replace(/-/g, '');
        let lista = [...paginas.values()].filter((p) => p.db === db && casa(p, body.filter));
        lista = ordena(lista, body.sorts);
        const inicio = body.start_cursor ? Number(body.start_cursor) : 0;
        const tam = (body.page_size || 100) >= 100 ? Math.min(100, cenario.TAM_PAGINA || 100) : body.page_size;
        const fatia = lista.slice(inicio, inicio + tam);
        const mais = inicio + tam < lista.length;
        return responde(res, 200, { object: 'list', results: fatia.map(comFormulas), has_more: mais, next_cursor: mais ? String(inicio + tam) : null });
      }
      if (req.method === 'GET' && (m = u.match(/^\/notion\/pages\/([\w-]+)$/))) {
        const pg = paginas.get(m[1]);
        return pg ? responde(res, 200, comFormulas(pg)) : responde(res, 404, { object: 'error', status: 404, code: 'object_not_found', message: 'Could not find page' });
      }
      if (req.method === 'PATCH' && (m = u.match(/^\/notion\/pages\/([\w-]+)$/))) {
        const pg = paginas.get(m[1]);
        if (!pg) return responde(res, 404, { object: 'error', status: 404, code: 'object_not_found', message: 'Could not find page' });
        for (const [k, v] of Object.entries(body.properties || {})) pg.properties[k] = paraLeitura(v);
        return responde(res, 200, comFormulas(pg));
      }
      if (req.method === 'POST' && u === '/notion/pages') {
        const id = criar(String(body.parent.database_id).replace(/-/g, ''), body.properties);
        return responde(res, 200, comFormulas(paginas.get(id)));
      }
      if (u === '/notion/search') return responde(res, 200, { object: 'list', results: [], has_more: false, next_cursor: null });
      if (u === '/notion/users/me') return responde(res, 200, { object: 'user', id: 'bot', type: 'bot' });
      if (u === '/openai/chat/completions') return responde(res, 200, jev(body));
      if (u === '/openai/audio/transcriptions') {
        const txt = cru.toString('latin1');
        const ok = /name="file"; filename="[^"]+"/.test(txt) && /name="model"\r\n\r\nwhisper-1/.test(txt) && /name="language"\r\n\r\npt/.test(txt);
        entrada.multipart = { ok, tamanho: cru.length, nomeArquivo: (txt.match(/name="file"; filename="([^"]+)"/) || [])[1] };
        return ok ? responde(res, 200, { text: 'Oi Jonas, recebi a proposta e quero marcar uma conversa na quinta.' }) : responde(res, 400, { error: { message: 'multipart inválido' } });
      }
      if ((m = u.match(/^\/zapi\/instances\/([^/]+)\/token\/([^/]+)\/send-text$/))) {
        if (req.headers['client-token'] !== cenario.CLIENT_TOKEN) return responde(res, 400, { error: 'your client-token is not configured' });
        const id = `3EB0${crypto.randomBytes(8).toString('hex').toUpperCase()}`;
        entrada.envio = { instancia: m[1], phone: body.phone, message: body.message };
        return responde(res, 200, { zaapId: `Z${id}`, messageId: id, id });
      }
      if (u.startsWith('/midia/audio')) { res.writeHead(200, { 'content-type': 'audio/ogg' }); return res.end(Buffer.from('OggS-simulado-'.repeat(50))); }
      return responde(res, 404, { erro: `rota não simulada: ${req.method} ${u}` });
    } catch (e) {
      entrada.falha = e.message;
      return responde(res, 500, { erro: e.message });
    }
  });
});

cenario.popular({ criar, paginas });
servidor.listen(PORTA, '127.0.0.1', () => console.log(`simulador em ${PORTA}`));
const salvar = () => {
  const porDb = {};
  for (const pg of paginas.values()) (porDb[pg.db] = porDb[pg.db] || []).push(comFormulas(pg));
  fs.writeFileSync(SAIDA, JSON.stringify({ log, porDb }, null, 2));
};
process.on('SIGTERM', () => { salvar(); process.exit(0); });
process.on('SIGINT', () => { salvar(); process.exit(0); });
