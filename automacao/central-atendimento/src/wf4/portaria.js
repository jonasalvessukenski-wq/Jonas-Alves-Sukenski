// Portaria: marca o Filtro de cada mensagem nova, liga ao contato e descobre quem ainda não tem cadastro.
// Nunca liga pelo primeiro nome citado no texto: só por telefone, LID ou e-mail.
const LIMITE = 150; // mensagens por rodada (a fila antiga é esvaziada aos poucos)
const pendentes = $('Busca pendentes').all().flatMap((i) => i.json.results || []).slice(0, LIMITE);
const contatos = $('Busca contatos').all().flatMap((i) => i.json.results || []);
if (!pendentes.length) return []; // nada novo: a cadeia da portaria para aqui

const por8 = new Map(); const porLid = new Map(); const porEmail = new Map(); const empresaDe = new Map(); const analiseDe = new Map();
for (const c of contatos) {
  const p = c.properties || {};
  for (const tel of separaValores(L.telefone(p['Contato']))) { const k = ultimos8(tel); if (k.length === 8 && !por8.has(k)) por8.set(k, c.id); }
  for (const lid of separaValores(L.texto(p['LID WhatsApp']))) { const k = soDigitos(lid); if (k && !porLid.has(k)) porLid.set(k, c.id); }
  for (const em of separaValores(L.email(p['Email']).toLowerCase())) if (!porEmail.has(em)) porEmail.set(em, c.id);
  const emp = L.relacao(p['Empresa (prospecção)'])[0]; if (emp) empresaDe.set(c.id, emp);
  const an = L.data(p['Última análise']); if (an) analiseDe.set(c.id, an);
}

// Tipo gravado pela captura de e-mail -> Filtro
const FILTRO_EMAIL = { 'e-mail devolvido': 'e-mail devolvido', 'e-mail automático': 'robô', 'e-mail descadastro': 'descadastro' };

const msgs = []; const novos = new Map(); const ultimas = new Map();
for (const pg of pendentes) {
  const p = pg.properties || {};
  const de = soDigitos(L.telefone(p['De']));
  const lid = soDigitos(L.texto(p['Lid']));
  const canal = L.opcao(p['Canal']);
  const sit = L.opcao(p['Situacao']);
  const tipo = L.opcao(p['Tipo']);
  const texto = L.texto(p['Conteudo']) || L.titulo(p['Mensagem']);
  const email = (L.email(p['E-mail']) || '').toLowerCase();
  const enviada = sit === 'enviada por mim' || sit === 'enviada pelo sistema';
  const proprio = (de && PROPRIOS_8.has(ultimos8(de))) || (lid && PROPRIOS_LID.has(lid));
  const ehEmail = canal === 'E-mail' || (!!email && !de && !lid);

  let filtro = 'passou';
  if (proprio) filtro = 'números do Jonas';
  else if (ehEmail) { if (FILTRO_EMAIL[tipo] && !(enviada && tipo === 'e-mail descadastro')) filtro = FILTRO_EMAIL[tipo]; }
  else if (!enviada && RE_ROBO.test(texto)) filtro = 'robô';
  else if (!enviada && texto.length <= 280 && RE_DESCADASTRO.test(texto)) filtro = 'descadastro';
  const semLeitura = filtro === 'robô' || filtro === 'e-mail devolvido'; // não pedem resposta: não acionam o Jev

  const upd = { pageId: pg.id, filtro, canal: canal || (ehEmail ? 'E-mail' : 'WhatsApp pessoal'), setCanal: !canal };
  // Robô com menu numerado (WhatsApp): guarda a opção a escolher; só vira resposta se for empresa da campanha (plano_atualiza)
  const menu = filtro === 'robô' && !ehEmail && !enviada && de ? opcaoDoMenu(texto) : null;
  if (!proprio) {
    const jaLigado = L.relacao(p['Contato'])[0] || null;
    const empJaLigada = L.relacao(p['Empresa (prospecção)'])[0] || '';
    let cid = jaLigado;
    if (!cid && de) cid = por8.get(ultimos8(de)) || null;
    if (!cid && lid) cid = porLid.get(lid) || null;
    if (!cid && email) cid = porEmail.get(email) || null;
    let ref = null;
    if (cid) {
      ref = `id:${cid}`;
      if (!jaLigado) upd.contatoId = cid;
    } else {
      const chave = de ? `8:${ultimos8(de)}` : lid ? `lid:${lid}` : email ? `em:${email}` : null;
      if (chave) {
        ref = `novo:${chave}`; upd.novoChave = chave;
        const nome = L.texto(p['Nome no WhatsApp']).trim();
        const n = novos.get(chave) || { chave, de: '', lid: '', email: '', nomes: [], nomeEnviada: '', canal: upd.canal, recebidas: 0, enviadas: 0, indicado: '' };
        // Primeira mensagem do sistema a uma pessoa indicada: vira contato já ligado à empresa de quem indicou
        if (sit === 'enviada pelo sistema' && empJaLigada) n.indicado = empJaLigada;
        if (de && !n.de) n.de = de;
        if (lid && !n.lid) n.lid = lid;
        if (email && !n.email) n.email = email;
        if (enviada) n.enviadas += 1; else if (!semLeitura) n.recebidas += 1;
        const nomeValido = nome && !/@lid$/i.test(nome) && !/^\d+$/.test(nome) && !/mailer-daemon|postmaster/i.test(nome);
        if (nomeValido && !enviada && !semLeitura && !n.nomes.includes(nome)) n.nomes.push(nome);
        if (nomeValido && enviada && !/^jonas/i.test(nome) && !n.nomeEnviada) n.nomeEnviada = nome;
        novos.set(chave, n);
      }
    }
    if (ref) {
      const u = ultimas.get(ref) || { hora: '', de: '', descadastro: false, devolvido: false, envio: '', canalEnvio: '', analise: (cid && analiseDe.get(cid)) || '', empresaId: (cid ? empresaDe.get(cid) : '') || empJaLigada };
      // Mensagem do próprio sistema não pede nova leitura do Jev (o registro do envio já atualiza o CRM)
      if (!semLeitura && sit !== 'enviada pelo sistema' && pg.created_time > u.hora) { u.hora = pg.created_time; u.de = enviada ? 'Ative' : 'Contato'; }
      if (enviada && pg.created_time > u.envio) { u.envio = pg.created_time; u.canalEnvio = ehEmail ? 'E-mail' : 'WhatsApp'; }
      if (filtro === 'descadastro') u.descadastro = true;
      if (menu && (!u.menu || pg.created_time >= u.menu.hora)) u.menu = { ...menu, de, canal: upd.canal, hora: pg.created_time, msgId: pg.id };
      if (filtro === 'e-mail devolvido') u.devolvido = true;
      if (!u.empresaId && empJaLigada) u.empresaId = empJaLigada;
      ultimas.set(ref, u);
    }
  }
  msgs.push(upd);
}
return [{ json: { msgs, novos: [...novos.values()], ultimas: [...ultimas.entries()].map(([ref, v]) => ({ ref, ...v })) } }];
