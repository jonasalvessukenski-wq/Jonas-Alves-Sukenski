// Normaliza cada e-mail (caixa de entrada ou enviados): quem é a outra ponta, texto sem o histórico citado e que tipo de e-mail é.
// Não grava Filtro: a portaria da central faz isso e liga ao contato, como no WhatsApp.
const NOSSO = 'contato@ativeassessoriafinanceira.com.br';
const NOSSO_DOMINIO = 'ativeassessoriafinanceira.com.br';

const enderecos = (campo) => [].concat(campo || []).flatMap((a) => (a && a.value) || []).filter((v) => v && v.address)
  .map((v) => ({ email: String(v.address).toLowerCase().trim(), nome: String(v.name || '').trim() }));
const cabecalho = (h, k) => {
  const v = h && h[k];
  if (!v) return '';
  const s = String(Array.isArray(v) ? v[0] : v);
  return s.replace(new RegExp(`^${k}\\s*:\\s*`, 'i'), '').trim();
};
const semHtml = (h) => String(h || '').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>/gi, '\n')
  .replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/[ \t]+/g, ' ');

// Corta o histórico citado: tudo a partir de "Em ... escreveu:", "On ... wrote:", "De:/From:" de encaminhamento ou linhas com ">"
function semCitacao(t) {
  const linhas = String(t || '').replace(/\r/g, '').split('\n');
  const corte = /^(\s*>|\s*Em .{3,200}escreveu:\s*$|\s*On .{3,200}wrote:\s*$|\s*-{2,}\s*(Original Message|Mensagem original|Forwarded message|Mensagem encaminhada)|\s*_{8,}\s*$|\s*(De|From)\s*:\s.+@|\s*Enviado do meu |\s*Sent from my )/i;
  const out = [];
  for (let i = 0; i < linhas.length; i += 1) {
    const l = linhas[i];
    // "Em qua., 30 de set. de 2026 às 10:00, Fulano <x@y>" pode quebrar em duas linhas antes do "escreveu:"
    if (corte.test(l) || (/^\s*Em .{3,200}$/.test(l) && /escreveu:\s*$/.test(linhas[i + 1] || ''))) break;
    out.push(l);
  }
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

const out = [];
for (const it of $input.all()) {
  const m = it.json || {};
  const h = m.headers || {};
  const de = enderecos(m.from)[0] || { email: '', nome: '' };
  const para = [...enderecos(m.to), ...enderecos(m.cc)];
  const enviado = de.email === NOSSO || de.email.endsWith(`@${NOSSO_DOMINIO}`);
  const outro = enviado ? para.find((x) => !x.email.endsWith(`@${NOSSO_DOMINIO}`)) : de;
  const assunto = String(m.subject || '').trim();
  let texto = semCitacao(m.text || semHtml(m.html));
  const bruto = String(m.text || semHtml(m.html) || '');

  let tipo = 'e-mail';
  let contraparte = outro ? outro.email : '';
  let nome = outro ? outro.nome : '';
  if (!enviado) {
    const autoSub = cabecalho(h, 'auto-submitted').toLowerCase();
    const precedencia = cabecalho(h, 'precedence').toLowerCase();
    if (RE_DEVOLUCAO_REMETENTE.test(de.email) || RE_DEVOLUCAO_ASSUNTO.test(assunto)) {
      tipo = 'e-mail devolvido';
      // A devolução vem do servidor: a outra ponta é o endereço que falhou
      const alvo = (bruto.match(/final-recipient:\s*rfc822;\s*([^\s<>;]+@[^\s<>;]+)/i) || [])[1]
        || (bruto.match(/[\w.+-]+@[\w-]+(\.[\w-]+)+/g) || []).find((e) => !RE_DEVOLUCAO_REMETENTE.test(e) && !e.toLowerCase().endsWith(`@${NOSSO_DOMINIO}`));
      contraparte = alvo ? String(alvo).toLowerCase() : '';
      nome = '';
      texto = `Devolvido pelo servidor: ${assunto}`.slice(0, 300);
    } else if ((autoSub && autoSub !== 'no') || cabecalho(h, 'x-autoreply') || cabecalho(h, 'x-autorespond') || /auto_reply|auto-reply|bulk|list|junk/.test(precedencia) || cabecalho(h, 'list-unsubscribe') || RE_AUSENCIA.test(assunto)) {
      tipo = 'e-mail automático';
    } else if (RE_DESCADASTRO.test(`${assunto}\n${texto.slice(0, 400)}`)) {
      tipo = 'e-mail descadastro';
    }
  }
  if (!contraparte || contraparte === NOSSO) continue; // e-mail para si mesmo ou sem destinatário externo

  const quando = m.date ? new Date(m.date) : new Date();
  const messageId = cabecalho(h, 'message-id') || String(m.messageId || '');
  const idBusca = messageId || `sem-id-${quando.getTime()}-${contraparte}`;
  out.push({ json: {
    messageId: idBusca, enviado, contraparte, nome, assunto, texto: texto.slice(0, 6000), tipo,
    data: partesSP(quando).data,
    buscaDuplicata: pedido('POST', `/databases/${DB.recebidas}/query`, { filter: { property: 'messageId', rich_text: { equals: idBusca.slice(0, 1900) } }, page_size: 1 }),
  } });
}
return out;
