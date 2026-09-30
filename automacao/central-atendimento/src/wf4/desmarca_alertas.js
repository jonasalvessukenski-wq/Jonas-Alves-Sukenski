// Aviso entregue: desmarca "Alertar Jonas". Se a Z-API falhou, deixa marcado para a próxima rodada.
const a = $('Monta alerta').first().json;
const r = $input.first().json || {};
if (!(r.messageId || r.zaapId || r.id)) return [{ json: NADA }];
return a.ids.map((id) => ({ json: atualizaPagina(id, { 'Alertar Jonas': P.marca(false) }) }));
