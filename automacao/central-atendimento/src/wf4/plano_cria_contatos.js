// Cria no CRM, como "a_confirmar", quem escreveu e ainda não tem cadastro.
// Disparo sem resposta e robô não viram contato: a mensagem fica ligada só à empresa da prospecção.
const plano = $('Portaria').first().json;
const buscas = $('Plano: busca empresa').all();
const resps = $('Busca empresa').all();
const empresaPorChave = {};
buscas.forEach((b, i) => {
  const ch = b.json.chave;
  if (!ch || b.json.nada) return;
  const n = plano.novos.find((x) => x.chave === ch);
  const res = (resps[i] && resps[i].json && resps[i].json.results) || [];
  let achou = null;
  for (const pg of res) {
    const p = pg.properties || {};
    const tels = [L.telefone(p['WhatsApp']), L.texto(p['Telefone'])].flatMap(separaValores).map(ultimos8);
    const em = (L.email(p['E-mail']) || '').toLowerCase();
    if (n.de && tels.includes(ultimos8(n.de))) { achou = pg; break; }
    if (n.email && em === n.email) { achou = pg; break; }
    const dom = em.split('@')[1];
    if (!achou && n.email && dom && dom === n.email.split('@')[1] && !FREEMAIL.has(dom)) achou = pg;
  }
  if (achou) empresaPorChave[ch] = { id: achou.id, nome: L.titulo(achou.properties['Empresa']), status: L.opcao(achou.properties['Status']) };
});
const sp = partesSP();
const out = [];
for (const n of plano.novos) {
  const emp = empresaPorChave[n.chave];
  const criar = n.recebidas > 0 || (n.enviadas > 0 && !emp);
  if (!criar) continue;
  const base = n.nomes[0] || n.nomeEnviada || (n.email ? n.email.split('@')[0] : '') || (n.de ? formataTel(n.de) : 'Contato');
  const nome = `${base} (${emp ? emp.nome : 'a identificar'})`;
  const props = {
    'Nome': P.titulo(nome),
    'Situação': P.opcao('a_confirmar'),
    'Data de Entrada': P.data(sp.data),
    'Origem': P.texto(`Criado automaticamente pela central em ${sp.ddmm}, a partir do canal ${n.canal}. Nome e tipo a confirmar.`),
  };
  const apelidos = [...n.nomes, n.nomeEnviada].filter(Boolean).join(', ');
  if (apelidos) props['Aliases'] = P.texto(apelidos);
  if (n.de) props['Contato'] = P.telefone(formataTel(n.de));
  if (n.lid) props['LID WhatsApp'] = P.texto(n.lid);
  if (n.email) props['Email'] = P.email(n.email);
  if (emp) { props['Empresa (prospecção)'] = P.relacao([emp.id]); props['Empresa'] = P.texto(emp.nome); }
  out.push({ json: { ...criaPagina(DB.crm, props), chave: n.chave } });
}
if (!out.length) out.push({ json: { ...NADA, chave: null } });
out[0].json.empresaPorChave = empresaPorChave;
return out;
