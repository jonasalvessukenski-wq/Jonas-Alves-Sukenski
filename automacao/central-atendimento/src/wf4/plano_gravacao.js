// Junta tudo o que o Jev decidiu nesta rodada, numera os rascunhos novos e descarta o rascunho antigo do mesmo contato
const itens = $('Valida decisão do Jev').all();
const fila = $('Conta rascunhos').all().flatMap((r) => r.json.results || []);
let n = 0;
const abertosPorContato = {};
for (const pg of fila) {
  const p = pg.properties || {};
  n = Math.max(n, L.numero(p['Número']) || 0);
  if (L.opcao(p['Situação']) !== 'rascunho') continue;
  for (const cid of L.relacao(p['Contato'])) (abertosPorContato[cid] = abertosPorContato[cid] || []).push(pg.id);
}
const out = [];
for (const it of itens) {
  const v = it.json;
  for (const e of v.escritas || []) out.push({ json: e });
  if (v.rascunho) {
    n += 1;
    const r = v.rascunho;
    for (const antigo of abertosPorContato[r.contatoId] || []) {
      out.push({ json: atualizaPagina(antigo, { 'Situação': P.opcao('descartada'), 'Motivo': P.texto(`Substituído pelo rascunho ${n}: o contato escreveu de novo e o Jev releu a conversa.`) }) });
    }
    const props = {
      'Resposta': P.titulo(r.titulo),
      'Texto': P.texto(r.texto),
      'Contato': P.relacao([r.contatoId]),
      'Mensagens de origem': P.relacao(r.msgIds),
      'Canal': P.opcao(r.canal),
      'Nível': P.opcao(r.nivel),
      'Situação': P.opcao('rascunho'),
      'Número': P.numero(n),
      'Modelo ou cartão': P.texto(r.modelo),
      'Motivo': P.texto(r.motivo),
    };
    if (r.empresaId) props['Empresa (prospecção)'] = P.relacao([r.empresaId]);
    out.push({ json: criaPagina(DB.fila, props) });
  }
}
if (!out.length) out.push({ json: NADA });
return out;
