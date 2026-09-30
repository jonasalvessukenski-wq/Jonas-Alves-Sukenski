// Para cada contato novo, procura a empresa na base de prospecção (pelo WhatsApp/telefone ou pelo e-mail)
const plano = $('Portaria').first().json;
const out = [];
for (const n of plano.novos) {
  const filtros = [];
  if (n.de) {
    filtros.push({ property: 'WhatsApp', phone_number: { contains: n.de.slice(-4) } });
    filtros.push({ property: 'Telefone', rich_text: { contains: n.de.slice(-4) } });
  }
  if (n.email) {
    filtros.push({ property: 'E-mail', email: { equals: n.email } });
    const dom = n.email.split('@')[1];
    if (dom && !FREEMAIL.has(dom)) filtros.push({ property: 'E-mail', email: { ends_with: `@${dom}` } });
  }
  if (!filtros.length) { out.push({ json: { ...NADA, chave: n.chave } }); continue; }
  out.push({ json: { ...pedido('POST', `/databases/${DB.prospeccao}/query`, { filter: { or: filtros }, page_size: 25 }), chave: n.chave } });
}
if (!out.length) out.push({ json: { ...NADA, chave: null } });
return out;
