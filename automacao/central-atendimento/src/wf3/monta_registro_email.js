// Grava na base Recebidas o que ainda não estava lá (a mesma mensagem pode chegar pela caixa de entrada e pelos enviados)
const emails = $('Normaliza e-mail').all().map((i) => i.json);
const buscas = $input.all().map((i) => i.json);
const out = [];
const nesteLote = new Set();
emails.forEach((e, i) => {
  const b = buscas[i] || {};
  if ((b.results || []).length || nesteLote.has(e.messageId)) return; // já registrado
  nesteLote.add(e.messageId);
  if (b.error) return; // sem conseguir conferir, não grava (evita duplicata); o próximo e-mail do mesmo contato traz o contexto
  const titulo = `${e.enviado ? '→ ' : ''}${e.assunto || e.texto.slice(0, 80) || '(sem assunto)'}`;
  const props = {
    'Mensagem': P.titulo(titulo.slice(0, 200)),
    'Conteudo': P.texto(e.texto),
    'E-mail': P.email(e.contraparte),
    'Assunto': P.texto(e.assunto.slice(0, 500)),
    'Canal': P.opcao('E-mail'),
    'Tipo': P.opcao(e.tipo),
    'Situacao': P.opcao(e.enviado ? 'enviada por mim' : 'aguardando decisao'),
    'Recebida em': P.data(e.data),
    'messageId': P.texto(e.messageId),
  };
  if (e.nome) props['Nome no WhatsApp'] = P.texto(e.nome);
  out.push({ json: criaPagina(DB.recebidas, props) });
});
return out;
