// Cenário das capturas (e-mail e Business): base vazia; o simulador guarda o que os fluxos gravarem
const c = require('./cenario_central');
module.exports = { DB: c.DB, CLIENT_TOKEN: c.CLIENT_TOKEN, popular: () => {}, decisaoJev: () => ({}) };
