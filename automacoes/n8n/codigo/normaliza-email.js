// Normaliza e-mail — lê a saída do gatilho IMAP (formato "resolved", do mailparser;
// o formato "simple" também é aceito) e devolve campos únicos para o resto do fluxo.
// Descarta só o que duplicaria registro. E-mail automático não é descartado: vira
// linha "ignorada", sem criar contato.

const limpa = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();

function enderecos(v) {
  if (!v) return [];
  if (Array.isArray(v)) return v.flatMap(enderecos);
  if (Array.isArray(v.value)) {
    return v.value
      .filter((a) => a && a.address)
      .map((a) => ({ address: a.address.trim(), name: limpa(a.name) }));
  }
  if (typeof v === 'string') {
    // "Fulano <fulano@x.com>, outro@y.com"
    return v.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map((parte) => {
      const m = parte.match(/^\s*"?([^"<]*?)"?\s*<([^>]+)>\s*$/);
      if (m) return { address: m[2].trim(), name: limpa(m[1]) };
      return { address: parte.trim(), name: '' };
    }).filter((a) => a.address.includes('@'));
  }
  return [];
}

function cabecalho(headers, nome) {
  if (!headers) return '';
  const v = headers[nome] ?? headers[nome.toLowerCase()];
  if (v == null) return '';
  // O n8n guarda a linha inteira ("List-Id: <...>"); tira o nome do cabeçalho
  return String(v).replace(new RegExp('^' + nome + ':\\s*', 'i'), '');
}

function htmlParaTexto(html) {
  return String(html || '')
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|tr|li|h\d)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

// Fica só com a parte nova: corta o histórico citado da resposta
function parteNova(texto) {
  const linhas = String(texto || '').replace(/\r/g, '').split('\n');
  const saida = [];
  for (const linha of linhas) {
    const l = linha.trim();
    if (/^(em|on)\s.+(escreveu|wrote)\s*:$/i.test(l)) break;
    if (/^-{2,}\s*(mensagem original|original message|forwarded message|mensagem encaminhada)/i.test(l)) break;
    if (/^(de|from)\s*:\s.+@/i.test(l) && saida.length > 0) break;
    if (l.startsWith('>')) continue;
    saida.push(linha);
  }
  return saida.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

function titulo80(s) {
  const t = limpa(s);
  if (t.length <= 80) return t;
  const corte = t.slice(0, 80);
  const espaco = corte.lastIndexOf(' ');
  return (espaco > 40 ? corte.slice(0, espaco) : corte) + '…';
}

function dataSP(d, fuso) {
  // YYYY-MM-DD no fuso de São Paulo (perto da meia-noite o UTC já virou o dia)
  return new Intl.DateTimeFormat('en-CA', { timeZone: fuso, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
}

const saida = [];
for (const item of $input.all()) {
  const j = item.json;
  const cfg = j.cfg;
  const caixa = cfg.caixa.toLowerCase();
  const pasta = j.pasta === 'enviados' ? 'enviados' : 'entrada';
  const headers = j.headers || {};

  const de = enderecos(j.from)[0] || { address: '', name: '' };
  const para = enderecos(j.to);
  const cc = enderecos(j.cc);
  const externos = [...para, ...cc].filter((a) => a.address.toLowerCase() !== caixa);

  const contraparte = pasta === 'enviados' ? externos[0] : de;

  // Descartes: só o que viraria registro duplicado ou sem ninguém do outro lado
  if (pasta === 'entrada' && de.address.toLowerCase() === caixa) continue; // cópia do que já entra por Enviados
  if (!contraparte || !contraparte.address) continue;

  const email = contraparte.address.toLowerCase();
  const local = email.split('@')[0];
  const dominio = email.split('@')[1] || '';

  const automatico =
    pasta === 'entrada' && (
      /^(no-?reply|nao-?responda|naoresponda|mailer-daemon|postmaster|bounces?|notifica(cao|coes)?|notifications?|newsletter)([.+_-]|$)/i.test(local) ||
      /^(auto-generated|auto-replied|auto-notified)/i.test(cabecalho(headers, 'auto-submitted')) ||
      /^(bulk|list|junk)/i.test(cabecalho(headers, 'precedence')) ||
      !!cabecalho(headers, 'list-unsubscribe') ||
      !!cabecalho(headers, 'list-id')
    );

  const assunto = limpa(j.subject) || '(sem assunto)';
  const bruto = j.text || j.textPlain || htmlParaTexto(j.html || j.textHtml);
  const texto = parteNova(bruto) || limpa(bruto);

  const quando = j.date ? new Date(j.date) : new Date();
  const data = isNaN(quando) ? new Date() : quando;

  const anexos = Object.values(item.binary || {}).map((b) => b.fileName).filter(Boolean)
    .concat((j.attachments || []).map((a) => a.filename).filter(Boolean));

  const ehResposta = pasta === 'entrada' && (!!j.inReplyTo || /^\s*(re|res|resp)\s*:/i.test(assunto));

  const messageId = limpa(j.messageId || cabecalho(headers, 'message-id')) ||
    `sem-id:${pasta}:${data.toISOString()}:${email}:${assunto.slice(0, 40)}`;

  const nome = contraparte.name || local;
  const generico = cfg.dominiosGenericos.includes(dominio);

  saida.push({
    json: {
      cfg,
      pasta,
      canal: 'E-mail',
      email,
      emailOriginal: contraparte.address,
      nome,
      nomeCadastro: `${nome} (${generico ? 'e-mail' : dominio})`,
      assunto,
      texto,
      titulo: (pasta === 'enviados' ? '→ ' : ehResposta ? '↩ ' : '') + titulo80(assunto),
      de: de.address,
      para: para.map((a) => a.address).join(', '),
      cc: cc.map((a) => a.address).join(', '),
      outrosDestinatarios: externos.slice(1).map((a) => a.address),
      anexos,
      ehResposta,
      automatico,
      messageId,
      recebidaEm: data.toISOString(),
      dataSP: dataSP(data, cfg.fuso),
    },
  });
}

return saida;
