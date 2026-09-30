// Só envia o que o Notion confirmou como "enviada" no passo anterior
const planos = $('Travas').all();
const resps = $input.all();
const out = [];
planos.forEach((pl, i) => {
  if (!pl.json.envio) return;
  const r = resps[i] && resps[i].json;
  if (r && r.object === 'page') out.push({ json: pl.json.envio });
});
return out;
