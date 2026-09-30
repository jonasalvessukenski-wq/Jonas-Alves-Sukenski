// ===== comum.js — trecho repetido no início de cada nó de código da central =====
// Não edite dentro do n8n: edite aqui e rode `node build.js` para gerar os fluxos.

const NOTION = 'https://api.notion.com/v1';
const ZAPI = 'https://api.z-api.io';

// Bases do Notion (API 2022-06-28 usa o id da base, não o do data source)
const DB = {
  recebidas: 'a62d96495d3d486397f27b5d8b6dfc81',
  crm: '4e84cf3d628583f3b09481990f3dd072',
  tarefas: '73e4cf3d628582f1bbca015a4dda5a08',
  prospeccao: 'a95d43b45b0f41d7882a749adb2d01d9',
  fila: '6b1fc7f7c6034371b2536a116c037b0b',
  controles: 'b74182348b7a46ddb2182028c44dbc75',
};

// Números e LIDs do próprio Jonas: conversa entre eles nunca vira contato nem resposta
const PROPRIOS_8 = new Set(['96202573', '74007161']); // 48 9620-2573 (pessoal) e 48 97400-7161 (Business)
const PROPRIOS_LID = new Set(['83194221199558', '111729413476602']);

const soDigitos = (s) => String(s || '').replace(/\D/g, '');
const ultimos8 = (s) => soDigitos(s).slice(-8);

// 554899230407 -> +55 48 9923-0407 ; 5548999230407 -> +55 48 99923-0407
function formataTel(d) {
  const s = soDigitos(d);
  if (s.length === 12 || s.length === 13) {
    const loc = s.slice(4);
    return `+${s.slice(0, 2)} ${s.slice(2, 4)} ${loc.slice(0, loc.length - 4)}-${loc.slice(-4)}`;
  }
  return s ? `+${s}` : '';
}

// Um campo de telefone ou LID pode ter vários valores separados por ; , / | ou quebra de linha
const separaValores = (s) => String(s || '').split(/[;,/|\n]+/).map((x) => x.trim()).filter(Boolean);

// ---------- datas no fuso de São Paulo ----------
function partesSP(d = new Date()) {
  const f = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false, weekday: 'short',
  });
  const p = Object.fromEntries(f.formatToParts(d).map((x) => [x.type, x.value]));
  const dias = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return {
    data: `${p.year}-${p.month}-${p.day}`,
    hora: Number(p.hour === '24' ? '0' : p.hour),
    minuto: Number(p.minute),
    diaSemana: dias[p.weekday],
    hhmm: `${p.hour === '24' ? '00' : p.hour}:${p.minute}`,
    ddmm: `${p.day}/${p.month}`,
  };
}
const isoMenosMinutos = (min, base = new Date()) => new Date(base.getTime() - min * 60000).toISOString();

function somaDias(dataISO, n) {
  const d = new Date(`${dataISO}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

// Converte o prazo dito na conversa em data (AAAA-MM-DD). A IA devolve o texto; a data é sempre calculada aqui.
function calculaPrazo(texto, base = new Date()) {
  if (!texto) return null;
  const t = String(texto).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
  const hoje = partesSP(base);
  if (/^hoje\b/.test(t)) return hoje.data;
  if (/depois de amanha/.test(t)) return somaDias(hoje.data, 2);
  if (/amanha/.test(t)) return somaDias(hoje.data, 1);
  let m = t.match(/em (\d{1,2}) dias?/);
  if (m) return somaDias(hoje.data, Number(m[1]));
  m = t.match(/(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?/);
  if (m) {
    let ano = m[3] ? Number(m[3].length === 2 ? `20${m[3]}` : m[3]) : Number(hoje.data.slice(0, 4));
    const mes = String(m[2]).padStart(2, '0');
    const dia = String(m[1]).padStart(2, '0');
    let iso = `${ano}-${mes}-${dia}`;
    if (!m[3] && iso < hoje.data) iso = `${ano + 1}-${mes}-${dia}`;
    return /^\d{4}-\d{2}-\d{2}$/.test(iso) ? iso : null;
  }
  if (/semana que vem|proxima semana/.test(t) && !/(segunda|terca|quarta|quinta|sexta|sabado|domingo)/.test(t)) {
    const ate = (8 - hoje.diaSemana) % 7 || 7; // próxima segunda
    return somaDias(hoje.data, ate);
  }
  if (/fim do mes|final do mes/.test(t)) {
    const [a, mm] = hoje.data.split('-').map(Number);
    const ultimo = new Date(Date.UTC(a, mm, 0)).getUTCDate();
    return `${a}-${String(mm).padStart(2, '0')}-${String(ultimo).padStart(2, '0')}`;
  }
  const nomes = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
  for (let i = 0; i < 7; i += 1) {
    if (t.includes(nomes[i])) {
      let ate = (i - hoje.diaSemana + 7) % 7;
      if (ate === 0) ate = 7; // "sexta" dita numa sexta = a próxima sexta
      return somaDias(hoje.data, ate);
    }
  }
  return null;
}

// ---------- montagem de propriedades do Notion ----------
function pedacos(texto, tam = 1900) {
  const s = String(texto || '');
  const out = [];
  for (let i = 0; i < s.length && out.length < 50; i += tam) out.push({ text: { content: s.slice(i, i + tam) } });
  return out.length ? out : [];
}
const P = {
  titulo: (t) => ({ title: [{ text: { content: String(t || '').slice(0, 1900) } }] }),
  texto: (t) => ({ rich_text: pedacos(t) }),
  opcao: (n) => ({ select: n ? { name: n } : null }),
  status: (n) => ({ status: { name: n } }),
  relacao: (ids) => ({ relation: (ids || []).filter(Boolean).map((id) => ({ id })) }),
  data: (iso) => ({ date: iso ? { start: iso } : null }),
  marca: (b) => ({ checkbox: !!b }),
  telefone: (t) => ({ phone_number: t || null }),
  email: (e) => ({ email: e || null }),
  numero: (n) => ({ number: n }),
};

// ---------- leitura de propriedades do Notion ----------
const L = {
  titulo: (p) => (p && p.title ? p.title.map((x) => x.plain_text).join('') : ''),
  texto: (p) => (p && p.rich_text ? p.rich_text.map((x) => x.plain_text).join('') : ''),
  opcao: (p) => (p && p.select ? p.select.name : ''),
  status: (p) => (p && p.status ? p.status.name : ''),
  relacao: (p) => (p && p.relation ? p.relation.map((x) => x.id) : []),
  data: (p) => (p && p.date ? p.date.start : ''),
  marca: (p) => !!(p && p.checkbox),
  telefone: (p) => (p && p.phone_number) || '',
  email: (p) => (p && p.email) || '',
  numero: (p) => (p && typeof p.number === 'number' ? p.number : null),
  formulaBool: (p) => !!(p && p.formula && p.formula.boolean),
  criadoEm: (pagina) => pagina.created_time,
};

// ---------- pedidos à API do Notion (executados pelo nó HTTP genérico) ----------
const pedido = (method, caminho, body) => ({ method, url: `${NOTION}${caminho}`, body: body || {} });
const criaPagina = (db, propriedades, extra = {}) => pedido('POST', '/pages', { parent: { database_id: db }, properties: propriedades, ...extra });
const atualizaPagina = (id, propriedades) => pedido('PATCH', `/pages/${id}`, { properties: propriedades });
// Pedido que não altera nada: usado para o fluxo não parar quando não há o que gravar
const NADA = { method: 'POST', url: `${NOTION}/search`, body: { page_size: 1 }, nada: true };

// ---------- padrões de texto ----------
const RE_ROBO = /(digite\s*\d|selecione (uma|a) op[cç][aã]o|op[cç][aã]o\s*\d|menu (principal|de op)|n[uú]mero do (seu )?protocolo|protocolo( de atendimento)?\s*[:n]|chamado\s*(id|n[ºo°]|#)?\s*\d|atendimento autom[aá]tico|mensagem autom[aá]tica|resposta autom[aá]tica|sou (o|a) (assistente|atendente) virtual|assistente virtual|fora do (nosso )?hor[aá]rio|nosso hor[aá]rio de atendimento|aceit[ae] (os )?termos|pol[ií]tica de privacidade|lgpd|consentimento (para|de) (tratamento|uso)|em breve (um|uma) (de nossos|atendente)|obrigad[oa] por entrar em contato)/i;
const RE_DESCADASTRO = /(n[aã]o (tenho|temos) interesse|sem interesse|n[aã]o (me )?(mande|envie|mandem|enviem)|pare de (mandar|enviar)|parem de|(me )?(remova|remover|retire|retirar|tire|tirar)( meu (n[uú]mero|contato|e-?mail))?( da| dessa| desta)? lista|descadastr|unsubscribe|n[aã]o quero (mais )?receber|bloquear|spam)/i;
const RE_LINHA_VERMELHA = /(\d+[.,]?\d*\s*%|r\$\s*\d|garantid|sem risco|a receita aceita|precat[oó]rio|direito credit[oó]rio|em \d+\s*(dias|meses|semanas) (voc[eê]|o senhor|a senhora) (recebe|recupera)|at[eé] \d+\s*%)/i;
const RE_DEVOLUCAO_REMETENTE = /(mailer-daemon|postmaster|mail delivery (subsystem|system))/i;
const RE_DEVOLUCAO_ASSUNTO = /(undeliver|delivery status notification|mail delivery failed|returned mail|n[aã]o (foi )?entregue|falha na entrega|delivery failure)/i;
const RE_AUSENCIA = /(out of office|fora do escrit[oó]rio|aus[eê]ncia|ausente|f[eé]rias|resposta autom[aá]tica|automatic reply|auto(-| )?reply)/i;

const FREEMAIL = new Set(['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com', 'yahoo.com.br', 'live.com', 'icloud.com', 'uol.com.br', 'bol.com.br', 'terra.com.br', 'ig.com.br', 'msn.com']);

function lerControles(respostas) {
  const cfg = {};
  for (const r of respostas) {
    for (const pg of r.results || []) {
      const p = pg.properties || {};
      const chave = L.texto(p['Chave']).trim();
      if (!chave) continue;
      cfg[chave] = { ligado: L.marca(p['Ligado']), valor: L.texto(p['Valor']).trim() };
    }
  }
  return cfg;
}
const ligado = (cfg, k, padrao = false) => (cfg[k] ? cfg[k].ligado : padrao);
// Linhas de valor (esperas, teto, horário) valem pelo campo Valor; a caixa "Ligado" só conta para as chaves liga/desliga
const valorNum = (cfg, k, padrao) => {
  const v = cfg[k] && cfg[k].valor !== '' ? Number(String(cfg[k].valor).replace(',', '.')) : NaN;
  return Number.isFinite(v) ? v : padrao;
};
const valorTxt = (cfg, k, padrao) => (cfg[k] && cfg[k].valor ? cfg[k].valor : padrao);

// ---------- textos aprovados (linhas N1-x e OBJ-xx da base Controles) ----------
// Primeiro nome apresentável a partir do nome do CRM ("Maria (Metalúrgica Alfa)" -> "Maria"); vazio se for telefone, e-mail etc.
function primeiroNome(nomeCrm) {
  const p = String(nomeCrm || '').replace(/\s*\(.*\)\s*$/, '').trim().split(/\s+/)[0] || '';
  if (!/^[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ'-]{1,}$/.test(p)) return '';
  return p.charAt(0).toUpperCase() + p.slice(1).toLowerCase();
}
// Preenche [Nome] e [Empresa]. Sem nome, some a vírgula junto: "Obrigado, [Nome]." -> "Obrigado."
function preencheTexto(modelo, { nome, empresa } = {}) {
  let t = String(modelo || '');
  t = nome ? t.replace(/\[Nome\]/g, nome) : t.replace(/,?[ \t]*\[Nome\]/g, '');
  t = t.replace(/\[Empresa\]/g, empresa || 'sua empresa');
  return t.replace(/[ \t]+([.,!?])/g, '$1').trim();
}
const N1_POR_INTENCAO = { 'quer conversar': 'N1-A', 'pede material': 'N1-B', 'não é comigo': 'N1-C', 'sem interesse': 'N1-D', 'descadastro': 'N1-E' };

// Janela de horário "seg-sex 08:00-19:00"
function dentroDoHorario(txt, agora = new Date()) {
  const sp = partesSP(agora);
  const m = String(txt || 'seg-sex 08:00-19:00').match(/(\d{1,2}):?(\d{2})?\s*-\s*(\d{1,2}):?(\d{2})?/);
  const ini = m ? Number(m[1]) * 60 + Number(m[2] || 0) : 8 * 60;
  const fim = m ? Number(m[3]) * 60 + Number(m[4] || 0) : 19 * 60;
  const agoraMin = sp.hora * 60 + sp.minuto;
  const soUteis = /seg-sex|dias [uú]teis/i.test(String(txt || 'seg-sex'));
  if (soUteis && (sp.diaSemana === 0 || sp.diaSemana === 6)) return false;
  return agoraMin >= ini && agoraMin < fim;
}
// ===== fim do comum.js =====
