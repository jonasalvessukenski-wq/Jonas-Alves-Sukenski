// Junta as respostas que podem sair nesta rodada (no máximo 20) e prepara a busca do contato de cada uma
const plano = $('Fila: consultas').first().json;
const aprovadas = $('Busca aprovadas').all().flatMap((i) => i.json.results || []);
const nivel1 = plano.nivel1.nada ? [] : $('Busca nível 1').all().flatMap((i) => i.json.results || []);
const vistos = new Set();
const out = [];
for (const [pg, auto] of [...aprovadas.map((x) => [x, false]), ...nivel1.map((x) => [x, true])]) {
  if (vistos.has(pg.id)) continue;
  vistos.add(pg.id);
  const p = pg.properties || {};
  const contatoId = L.relacao(p['Contato'])[0] || '';
  const [destino, nomeDestino] = L.texto(p['Destino']).split('|').map((x) => x.trim());
  out.push({ json: {
    tipo: L.opcao(p['Tipo']) || 'resposta', destino: destino || '', nomeDestino: nomeDestino || '', assunto: L.texto(p['Assunto']).trim(),
    filaId: pg.id, numero: L.numero(p['Número']), auto, contatoId,
    texto: L.texto(p['Texto']).trim(), canal: L.opcao(p['Canal']) || 'WhatsApp pessoal',
    modelo: L.texto(p['Modelo ou cartão']).trim(), editada: L.marca(p['Editada pelo Jonas']),
    criadaEm: pg.created_time, empresaId: L.relacao(p['Empresa (prospecção)'])[0] || '',
    motivoAnterior: L.texto(p['Motivo']).slice(0, 300),
    urlContato: contatoId ? `${NOTION}/pages/${contatoId}` : `${NOTION}/users/me`,
  } });
  if (out.length >= 20) break;
}
return out;
