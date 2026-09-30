// Últimas respostas da fila: dão o próximo número livre e os rascunhos em aberto de cada contato
return [{ json: pedido('POST', `/databases/${DB.fila}/query`, { sorts: [{ property: 'Número', direction: 'descending' }], page_size: 100 }) }];
