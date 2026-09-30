// Confere gravação — nó tolerante a erro esconde falha (lição de 21/09), então o
// resultado é conferido aqui, na resposta do Notion, e não pelo status da execução.
const e = $('Monta registro').first().json;
const r = $input.first().json;
const ok = r.object === 'page' && !!r.id;

return [{
  json: {
    ok,
    registroId: ok ? r.id : '',
    erro: ok ? '' : String(r.error?.message || r.message || JSON.stringify(r).slice(0, 300)),
    pasta: e.pasta,
    email: e.email,
    assunto: e.assunto,
    messageId: e.messageId,
    situacao: e.situacao,
    contatoId: e.contatoId,
    contatoNovo: e.contatoNovo,
    atualizarContato: ok && !!e.contatoId && !e.automatico,
    dataSP: e.dataSP,
  },
}];
