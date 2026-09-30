// Contatos que o Jev marcou para o Jonas ver hoje
return [{ json: pedido('POST', `/databases/${DB.crm}/query`, { filter: { property: 'Alertar Jonas', checkbox: { equals: true } }, page_size: 30 }) }];
