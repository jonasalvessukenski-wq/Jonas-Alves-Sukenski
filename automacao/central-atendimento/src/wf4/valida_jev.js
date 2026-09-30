// Confere a decisão do Jev com regras em código (não só no prompt) e prepara o que será gravado
const ctx = $('Monta pedido ao Jev').item.json;
const cfg = $('Config').first().json.cfg;
const INTENCOES = ['quer conversar', 'pede material', 'não é comigo', 'sem interesse', 'descadastro', 'adiar', 'atendimento', 'pergunta', 'objeção', 'quente e sensível', 'robô', 'fora da campanha'];
const NIVEIS = { 1: '1 - automática', 2: '2 - rascunho', 3: '3 - só o Jonas' };
const NIVEL1_OK = ['quer conversar', 'pede material', 'não é comigo', 'sem interesse', 'descadastro', 'adiar', 'atendimento'];

let d = null; let erro = '';
try {
  const conteudo = $json.choices && $json.choices[0] && $json.choices[0].message && $json.choices[0].message.content;
  d = JSON.parse(conteudo);
} catch (e) {
  erro = `resposta do Jev ilegível: ${($json.error && ($json.error.message || JSON.stringify($json.error))) || e.message}`;
}
if (!d || typeof d !== 'object') return { json: { contatoId: ctx.contatoId, erro: erro || 'sem decisão', escritas: [], rascunhos: [] } };

const intencao = INTENCOES.includes(d.intencao) ? d.intencao : 'pergunta';
const temp = ['frio', 'morno', 'quente'].includes(d.temperatura) ? d.temperatura : 'morno';
let nivel = [1, 2, 3].includes(Number(d.nivel)) ? Number(d.nivel) : 3;
const conf = Number(d.confianca) || 0;
const campanha = !!ctx.empresaId;
if (nivel === 1 && (!campanha || !NIVEL1_OK.includes(intencao))) nivel = 2;
if (conf < 0.8 && nivel < 3) nivel += 1;
if (['quente e sensível', 'fora da campanha', 'robô'].includes(intencao)) nivel = 3;

const sp = partesSP();
const nome = primeiroNome(ctx.nome);
const nomeCurto = String(ctx.nome || '').replace(/\s*\(.*\)\s*$/, '');
const retomarEm = typeof d.retomar_em === 'string' && d.retomar_em.trim() ? d.retomar_em.trim().slice(0, 60) : '';
// Indicação com e-mail ou telefone informado
const ind = d.indicacao && typeof d.indicacao === 'object' && (d.indicacao.email || d.indicacao.telefone) ? d.indicacao : null;
const indEmail = ind && RE_EMAIL.test(String(ind.email || '').trim()) ? String(ind.email).trim().toLowerCase() : '';
const indTel = ind ? telefoneDe(ind.telefone) : '';
const indNome = ind ? primeiroNome(ind.nome) : '';

// Qual texto aprovado vale para esta intenção (linhas N1-x nos Controles)
let codN1 = N1_POR_INTENCAO[intencao] || '';
if (codN1 === 'N1-C' && ind) codN1 = 'N1-G'; // já passou o contato: agradecer, não pedir de novo
if (codN1 === 'N1-F' && retomarEm) codN1 = 'N1-F2'; // já disse quando: confirmar, não perguntar
const txtN1 = codN1 && cfg[codN1] && cfg[codN1].valor ? cfg[codN1] : null;
if (nivel === 1 && !(txtN1 && txtN1.ligado)) nivel = 2; // só sai sozinho com texto aprovado
if (codN1 === 'N1-B' && nivel === 1) nivel = 2; // o sistema ainda não anexa o PDF

let resposta = d.resposta && typeof d.resposta.texto === 'string' ? d.resposta.texto.trim() : '';
let modelo = String((d.resposta && d.resposta.modelo_ou_cartao) || 'livre').trim().slice(0, 40);
let aviso = '';
const vars = { nome, empresa: ctx.empresaNome, indicado: indNome || (ind && ind.nome) || '', quando: retomarEm };
if (txtN1 && (resposta || ['N1-G', 'N1-F', 'N1-F2', 'N1-H'].includes(codN1))) {
  resposta = preencheTexto(txtN1.valor, vars);
  modelo = codN1;
}
if (codN1 === 'N1-B' && resposta) aviso = ' | lembrete: o sistema não anexa arquivo, mande o PDF da apresentação junto';
let trava = '';
if (resposta && RE_LINHA_VERMELHA.test(resposta)) { trava = 'a resposta citava número, percentual, prazo, garantia ou termo proibido'; nivel = 3; }
if (ctx.ultimoAutor !== 'Contato' || intencao === 'robô') resposta = '';

const agoraISO = new Date().toISOString();
const escritas = [];

// Estado da conversa no CRM
const crm = {
  'Temperatura': P.opcao(temp),
  'Intenção atual': P.opcao(intencao),
  'Nível de resposta': P.opcao(NIVEIS[nivel]),
  'Resumo da conversa': P.texto(String(d.resumo || '').slice(0, 1500)),
  'Última análise': P.data(agoraISO),
};
if (typeof d.proximo_passo === 'string') crm['Próximo passo'] = P.texto(d.proximo_passo.slice(0, 500));
const quente = temp === 'quente' || intencao === 'quer conversar' || intencao === 'quente e sensível';
if (d.alertar_jonas === true && quente && ctx.temperaturaAnterior !== 'quente') crm['Alertar Jonas'] = P.marca(true);
escritas.push(atualizaPagina(ctx.contatoId, crm));

// Tarefas (no máximo 3 do Jev + as de indicação e retomada; nunca repetidas)
const semAcento = (s) => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const doNome = new Set(semAcento(ctx.nome).split(/\W+/));
const palavras = (s) => new Set(semAcento(s).split(/\W+/).filter((w) => w.length > 3 && !doNome.has(w) && !['para', 'com', 'sobre', 'ativa'].includes(w)));
// Repetida = divide pelo menos 2 palavras e metade das palavras da menor (sem contar o nome do contato)
const repete = (a, b) => { const A = palavras(a); const B = palavras(b); let n = 0; A.forEach((w) => { if (B.has(w)) n += 1; }); return n >= 2 && n / Math.max(1, Math.min(A.size, B.size)) >= 0.5; };
const aceitas = [];
const novaTarefa = (titulo, { comQuem = 'Ative', prazo = null, trecho = '', nota = '' } = {}) => {
  if (ctx.tarefasAbertas.some((x) => repete(titulo, x.titulo)) || aceitas.some((x) => repete(titulo, x))) return;
  aceitas.push(titulo);
  const props = {
    'Tarefa Interna': P.titulo(`${nomeCurto} — ${titulo}`.slice(0, 150)),
    'Pessoas': P.relacao([ctx.contatoId]),
    'Fonte': P.opcao('sugerida pelo Claude'),
    'Tipo de tarefa': P.opcao('a confirmar'),
    'Situação': P.opcao('a fazer'),
    'Status': P.status('Processar'),
    'Com quem está': P.opcao(comQuem === 'Contato' ? 'Contato' : 'Ative'),
    'Registrado em': P.data(sp.data),
    'Mensagens': P.relacao(ctx.msgIds),
    'Nota do assistente': P.texto(nota || `Criada pelo Jev lendo a conversa inteira em ${sp.ddmm} ${sp.hhmm}. Confira antes de confiar.`),
  };
  if (trecho) props['Trecho de origem'] = P.texto(String(trecho).slice(0, 1000));
  if (prazo) props['Prazo / Horário'] = P.data(prazo);
  escritas.push(criaPagina(DB.tarefas, props));
};
for (const t of (Array.isArray(d.tarefas_novas) ? d.tarefas_novas : []).slice(0, 3)) {
  if (!t || !t.titulo) continue;
  novaTarefa(t.titulo, { comQuem: t.com_quem_esta, prazo: calculaPrazo(t.prazo_texto), trecho: t.trecho });
}
if (ind) {
  const quem = [ind.nome, ind.email, ind.telefone].filter(Boolean).map((x) => String(x).trim()).join(' · ').slice(0, 200);
  novaTarefa(`Falar com ${quem} (indicação de ${nomeCurto || 'contato'})`, { nota: `Indicação lida pelo Jev em ${sp.ddmm} ${sp.hhmm}. A primeira mensagem ao indicado está na 📤 Fila de respostas.` });
}
if (intencao === 'adiar') {
  let prazo = calculaPrazo(retomarEm) || somaDias(sp.data, 2);
  const dia = new Date(`${prazo}T12:00:00Z`).getUTCDay();
  if (dia === 6) prazo = somaDias(prazo, 2); else if (dia === 0) prazo = somaDias(prazo, 1);
  novaTarefa(`Retomar a conversa${retomarEm ? ` (${retomarEm})` : ''}`, { prazo, nota: `O contato pediu para falar depois${retomarEm ? `: ${retomarEm}` : ''}. Lido pelo Jev em ${sp.ddmm} ${sp.hhmm}.` });
}

// Tarefas existentes: só ids da lista enviada; nunca conclui
const idsValidos = new Set(ctx.tarefasAbertas.map((t) => t.id));
for (const t of (Array.isArray(d.tarefas_atualizar) ? d.tarefas_atualizar : []).slice(0, 5)) {
  if (!t || !idsValidos.has(t.id)) continue;
  const props = {};
  if (['Ative', 'Contato'].includes(t.com_quem_esta)) props['Com quem está'] = P.opcao(t.com_quem_esta);
  if (t.sugere_baixa === true) { props['Assistente'] = P.opcao('sugere baixa'); props['Assistente em'] = P.data(sp.data); }
  if (t.nota) props['Nota do assistente'] = P.texto(`Jev ${sp.ddmm} ${sp.hhmm}: ${String(t.nota).slice(0, 600)}`);
  if (Object.keys(props).length) escritas.push(atualizaPagina(t.id, props));
}

// Status na campanha de prospecção
if (ctx.empresaId) {
  const st = ctx.statusCampanha;
  let novo = '';
  if (intencao === 'descadastro') novo = 'Descadastrar';
  else if (intencao === 'sem interesse') novo = 'Sem interesse';
  else if (d.reuniao_marcada === true) novo = 'Reunião';
  else if (!['Reunião', 'Sem interesse', 'Descadastrar', 'Respondeu'].includes(st) && !['robô', 'fora da campanha', 'atendimento'].includes(intencao)) novo = 'Respondeu';
  if (novo && novo !== st) {
    const pp = { 'Status': P.opcao(novo) };
    if (novo === 'Descadastrar' || novo === 'Sem interesse') { pp['Etapa da sequência'] = P.opcao('encerrada'); pp['Próximo envio'] = P.data(null); }
    escritas.push(atualizaPagina(ctx.empresaId, pp));
  }
}

// Rascunhos para a fila (nível 1 e 2). Nível 3: nada sai.
const rascunhos = [];
const reAssunto = ctx.ultimoAssunto ? (/^re:/i.test(ctx.ultimoAssunto) ? ctx.ultimoAssunto : `Re: ${ctx.ultimoAssunto}`) : 'Re: Ative';
if (resposta && nivel < 3) {
  rascunhos.push({
    tipo: 'resposta', contatoId: ctx.contatoId, texto: resposta.slice(0, 1500), nivel: NIVEIS[nivel], canal: ctx.ultimoCanal, modelo,
    motivo: `${String(d.motivo || '').slice(0, 400)}${trava ? ` | trava: ${trava}` : ''}${aviso}`,
    empresaId: ctx.empresaId, msgIds: ctx.msgIds, titulo: `${ctx.nome} · ${intencao}`,
    assunto: ctx.ultimoCanal === 'E-mail' ? reAssunto : '',
  });
}
// Primeira mensagem para a pessoa indicada (e-mail se houver, senão WhatsApp), citando quem indicou
if (ind && nivel < 3 && (indEmail || indTel)) {
  const porEmail = !!indEmail;
  const cod = porEmail ? 'N1-I-email' : 'N1-I';
  const tpl = cfg[cod] && cfg[cod].valor ? cfg[cod] : null;
  if (tpl) {
    const v = { nome: indNome, empresa: ctx.empresaNome, indicador: nome || nomeCurto };
    const texto = preencheTexto(tpl.valor, v);
    const assunto = porEmail ? preencheTexto((cfg['N1-I-assunto'] && cfg['N1-I-assunto'].valor) || 'Indicação de [Indicador]', v) : '';
    const aprovado = tpl.ligado && (!porEmail || (cfg['N1-I-assunto'] && cfg['N1-I-assunto'].ligado));
    const nivelInd = campanha && aprovado && conf >= 0.8 && !RE_LINHA_VERMELHA.test(texto) ? 1 : 2;
    rascunhos.push({
      tipo: 'indicação', contatoId: ctx.contatoId, texto: texto.slice(0, 3000), nivel: NIVEIS[nivelInd],
      canal: porEmail ? 'E-mail' : (String(ctx.ultimoCanal).startsWith('WhatsApp') ? ctx.ultimoCanal : 'WhatsApp Business'),
      modelo: cod, motivo: `Indicação de ${nomeCurto}: ${[ind.nome, indEmail || indTel].filter(Boolean).join(' · ')}`,
      empresaId: ctx.empresaId, msgIds: ctx.msgIds, titulo: `${ind.nome || indEmail || indTel} · indicação de ${nomeCurto}`,
      destino: porEmail ? indEmail : indTel, assunto, nomeDestino: String(ind.nome || '').slice(0, 80),
    });
  }
}
return { json: { contatoId: ctx.contatoId, escritas, rascunhos, nivel, intencao, erro } };
