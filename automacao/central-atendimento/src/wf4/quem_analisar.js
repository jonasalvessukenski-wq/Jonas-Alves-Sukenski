// Quem precisa de leitura do Jev: mensagem nova depois da última análise e alguns minutos de silêncio
const cfg = $('Config').first().json.cfg;
if (!ligado(cfg, 'analiseConversa', true)) return [];
const minEspera = Math.min(valorNum(cfg, 'esperaProspectMin', 3), valorNum(cfg, 'esperaDemaisMin', 10));
return [{ json: pedido('POST', `/databases/${DB.crm}/query`, {
  filter: { and: [
    { property: 'Precisa análise', formula: { checkbox: { equals: true } } },
    { property: 'Última mensagem em', date: { on_or_before: isoMenosMinutos(minEspera) } },
    { property: 'Mapa', select: { does_not_equal: 'PES' } },
  ] },
  sorts: [{ property: 'Última mensagem em', direction: 'ascending' }],
  page_size: 20,
}) }];
