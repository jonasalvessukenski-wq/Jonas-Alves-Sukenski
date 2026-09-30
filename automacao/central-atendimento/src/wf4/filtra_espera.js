// Aplica a espera certa (prospect ou demais) e limita quantas conversas o Jev lê por rodada
const cfg = $('Config').first().json.cfg;
const eP = valorNum(cfg, 'esperaProspectMin', 3);
const eD = valorNum(cfg, 'esperaDemaisMin', 10);
const max = valorNum(cfg, 'maxAnalisesPorRodada', 6);
const res = $input.all().flatMap((i) => i.json.results || []);
const out = [];
for (const c of res) {
  const p = c.properties || {};
  if (L.opcao(p['Mapa']) === 'PES') continue;
  const emp = L.relacao(p['Empresa (prospecção)'])[0] || '';
  const ult = L.data(p['Última mensagem em']);
  if (!ult) continue;
  const espera = emp ? eP : eD;
  if (Date.now() - Date.parse(ult) < espera * 60000) continue;
  out.push({ json: {
    contatoId: c.id, nome: L.titulo(p['Nome']), empresaId: emp, tipo: L.opcao(p['Tipo']), situacao: L.opcao(p['Situação']),
    mapa: L.opcao(p['Mapa']), resumoAnterior: L.texto(p['Resumo da conversa']), proximoPasso: L.texto(p['Próximo passo']),
    intencaoAnterior: L.opcao(p['Intenção atual']), temperaturaAnterior: L.opcao(p['Temperatura']), tldr: L.texto(p['TL;DR']),
    reqConversa: pedido('POST', `/databases/${DB.recebidas}/query`, {
      filter: { and: [
        { property: 'Contato', relation: { contains: c.id } },
        { timestamp: 'created_time', created_time: { on_or_after: isoMenosMinutos(36 * 60) } },
      ] },
      sorts: [{ timestamp: 'created_time', direction: 'ascending' }],
      page_size: 100,
    }),
    reqTarefas: pedido('POST', `/databases/${DB.tarefas}/query`, {
      filter: { and: [
        { property: 'Pessoas', relation: { contains: c.id } },
        { property: 'Feito', checkbox: { equals: false } },
      ] },
      page_size: 30,
    }),
    urlEmpresa: emp ? `${NOTION}/pages/${emp}` : `${NOTION}/users/me`,
  } });
  if (out.length >= max) break;
}
return out;
