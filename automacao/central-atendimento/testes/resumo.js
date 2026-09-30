// Mostra o estado final das bases simuladas de forma legível. Uso: node testes/resumo.js <resultado.json>
const r = require(require('path').resolve(process.argv[2]));
const DB = require('./cenario_central').DB;
const nomeDb = Object.fromEntries(Object.entries(DB).map(([k, v]) => [v, k]));
const nomes = {};
for (const lista of Object.values(r.porDb)) for (const pg of lista) {
  const p = pg.properties;
  const t = Object.values(p).find((x) => x && x.type === 'title');
  nomes[pg.id] = t ? t.title.map((x) => x.plain_text).join('').slice(0, 40) : pg.id.slice(0, 8);
}
const val = (x) => {
  if (!x) return '';
  switch (x.type) {
    case 'title': return x.title.map((y) => y.plain_text).join('');
    case 'rich_text': return x.rich_text.map((y) => y.plain_text).join('');
    case 'select': return x.select ? x.select.name : '';
    case 'status': return x.status ? x.status.name : '';
    case 'relation': return x.relation.map((y) => nomes[y.id] || y.id.slice(0, 8)).join(' + ');
    case 'date': return x.date ? x.date.start : '';
    case 'checkbox': return x.checkbox ? '☑' : '';
    case 'phone_number': return x.phone_number || '';
    case 'email': return x.email || '';
    case 'number': return x.number ?? '';
    case 'url': return x.url || '';
    case 'formula': return String(x.formula.boolean);
    default: return JSON.stringify(x);
  }
};
const so = process.argv[3] ? process.argv[3].split(',') : Object.keys(DB);
for (const [db, lista] of Object.entries(r.porDb)) {
  if (!so.includes(nomeDb[db])) continue;
  console.log(`\n##### ${nomeDb[db] || db} (${lista.length})`);
  for (const pg of lista) {
    const campos = Object.entries(pg.properties).map(([k, v]) => [k, val(v)]).filter(([, v]) => v !== '' && v !== 'false');
    console.log(`- ${campos.map(([k, v]) => `${k}: ${String(v).replace(/\n/g, ' ⏎ ').slice(0, 160)}`).join(' | ')}`);
  }
}
const envios = r.log.filter((l) => l.envio);
console.log(`\n##### Z-API (${envios.length} envios)`);
for (const e of envios) console.log(`- ${e.envio.instancia} → ${e.envio.phone}: ${e.envio.message.replace(/\n/g, ' ⏎ ')}`);
const falhas = r.log.filter((l) => l.falha);
if (falhas.length) console.log('\nFALHAS NO SIMULADOR:', falhas.map((f) => `${f.url}: ${f.falha}`));
