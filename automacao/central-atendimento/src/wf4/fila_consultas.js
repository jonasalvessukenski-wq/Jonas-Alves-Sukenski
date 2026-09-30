// Fila: respostas aprovadas pelo Jonas, automáticas de nível 1 (só se o envio automático estiver ligado) e o que saiu nas últimas 24 horas
const cfg = $('Config').first().json.cfg;
const q = (filtro, extra = {}) => pedido('POST', `/databases/${DB.fila}/query`, { filter: filtro, page_size: 30, ...extra });
const porNumero = { sorts: [{ property: 'Número', direction: 'ascending' }] };
return [{ json: {
  aprovadas: q({ property: 'Situação', select: { equals: 'aprovada' } }, porNumero),
  nivel1: ligado(cfg, 'autoEnvio', false)
    ? q({ and: [{ property: 'Situação', select: { equals: 'rascunho' } }, { property: 'Nível', select: { equals: '1 - automática' } }] }, porNumero)
    : NADA,
  enviadas: q({ and: [{ property: 'Situação', select: { equals: 'enviada' } }, { property: 'Enviada em', date: { on_or_after: isoMenosMinutos(24 * 60) } }] }, { page_size: 100 }),
} }];
