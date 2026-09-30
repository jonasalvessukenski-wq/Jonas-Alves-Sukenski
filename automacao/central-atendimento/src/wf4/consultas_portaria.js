// Monta as duas consultas da portaria: mensagens ainda sem Filtro (últimos 3 dias, fora de grupo) e contatos do CRM com telefone, LID ou e-mail
return [{
  json: {
    pendentes: pedido('POST', `/databases/${DB.recebidas}/query`, {
      filter: { and: [
        { property: 'Filtro', select: { is_empty: true } },
        { property: 'Grupo', rich_text: { is_empty: true } },
        { timestamp: 'created_time', created_time: { on_or_after: isoMenosMinutos(3 * 24 * 60) } },
      ] },
      sorts: [{ timestamp: 'created_time', direction: 'ascending' }],
      page_size: 100,
    }),
    contatos: pedido('POST', `/databases/${DB.crm}/query`, {
      filter: { or: [
        { property: 'Contato', phone_number: { is_not_empty: true } },
        { property: 'LID WhatsApp', rich_text: { is_not_empty: true } },
        { property: 'Email', email: { is_not_empty: true } },
      ] },
      page_size: 100,
    }),
  },
}];
