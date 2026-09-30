// Confere a decisão do Jev com regras em código (não só no prompt) e prepara o que será gravado
const ctx = $('Monta pedido ao Jev').item.json;
const INTENCOES = ['quer conversar', 'pede material', 'não é comigo', 'sem interesse', 'descadastro', 'pergunta', 'objeção', 'quente e sensível', 'robô', 'fora da campanha'];
const NIVEIS = { 1: '1 - automática', 2: '2 - rascunho', 3: '3 - só o Jonas' };
const NIVEL1_OK = ['quer conversar', 'pede material', 'não é comigo', 'sem interesse', 'descadastro'];

let d = null; let erro = '';
try {
  const conteudo = $json.choices && $json.choices[0] && $json.choices[0].message && $json.choices[0].message.content;
  d = JSON.parse(conteudo);
} catch (e) {
  erro = `resposta do Jev ilegível: ${($json.error && ($json.error.message || JSON.stringify($json.error))) || e.message}`;
}
if (!d || typeof d !== 'object') return { json: { contatoId: ctx.contatoId, erro: erro || 'sem decisão', escritas: [] } };

const intencao = INTENCOES.includes(d.intencao) ? d.intencao : 'pergunta';
const temp = ['frio', 'morno', 'quente'].includes(d.temperatura) ? d.temperatura : 'morno';
let nivel = [1, 2, 3].includes(Number(d.nivel)) ? Number(d.nivel) : 3;
const conf = Number(d.confianca) || 0;
const campanha = !!ctx.empresaId;
if (nivel === 1 && (!campanha || !NIVEL1_OK.includes(intencao))) nivel = 2;
if (conf < 0.8 && nivel < 3) nivel += 1;
if (['quente e sensível', 'fora da campanha', 'robô'].includes(intencao)) nivel = 3;
if (ctx.ultimoCanal === 'E-mail' && nivel === 1) nivel = 2; // e-mail ainda não sai sozinho: vira rascunho para copiar

let resposta = d.resposta && typeof d.resposta.texto === 'string' ? d.resposta.texto.trim() : '';
let modelo = String((d.resposta && d.resposta.modelo_ou_cartao) || 'livre').trim().slice(0, 40);
let aviso = '';
// Intenção de primeira linha com texto cadastrado nos Controles: vale o texto aprovado, não a redação do Jev.
// Só sai sozinho (nível 1) se a linha do texto estiver marcada como "Ligado" (= aprovado pelo Jonas).
const cfg = $('Config').first().json.cfg;
const codN1 = N1_POR_INTENCAO[intencao];
// Indicação com contato já informado: o texto N1-C (que pede o contato) não serve; vale a redação do Jev, sempre como rascunho
const ind = d.indicacao && typeof d.indicacao === 'object' && (d.indicacao.email || d.indicacao.telefone) ? d.indicacao : null;
if (ind && nivel === 1) nivel = 2;
const txtN1 = codN1 && !(codN1 === 'N1-C' && ind) && cfg[codN1] && cfg[codN1].valor ? cfg[codN1] : null;
if (nivel === 1 && !(txtN1 && txtN1.ligado)) nivel = 2;
if (codN1 === 'N1-B' && nivel === 1) nivel = 2; // o sistema ainda não anexa o PDF
if (resposta && txtN1) {
  resposta = preencheTexto(txtN1.valor, { nome: primeiroNome(ctx.nome), empresa: ctx.empresaNome });
  modelo = codN1;
}
if (codN1 === 'N1-B' && resposta) aviso = ' | lembrete: o sistema não anexa arquivo, mande o PDF da apresentação junto';
let trava = '';
if (resposta && RE_LINHA_VERMELHA.test(resposta)) { trava = 'a resposta citava número, percentual, prazo, garantia ou termo proibido'; nivel = 3; }
if (ctx.ultimoAutor !== 'Contato' || intencao === 'robô') resposta = '';

const agoraISO = new Date().toISOString();
const sp = partesSP();
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

// Tarefas novas (no máximo 3; nunca repetida)
const nomeCurto = String(ctx.nome || '').replace(/\s*\(.*\)\s*$/, '');
const semAcento = (s) => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const doNome = new Set(semAcento(ctx.nome).split(/\W+/));
const palavras = (s) => new Set(semAcento(s).split(/\W+/).filter((w) => w.length > 3 && !doNome.has(w) && !['para', 'com', 'sobre', 'ativa'].includes(w)));
// Repetida = divide pelo menos 2 palavras e metade das palavras da menor (sem contar o nome do contato)
const repete = (a, b) => { const A = palavras(a); const B = palavras(b); let n = 0; A.forEach((w) => { if (B.has(w)) n += 1; }); return n >= 2 && n / Math.max(1, Math.min(A.size, B.size)) >= 0.5; };
const aceitas = [];
for (const t of (Array.isArray(d.tarefas_novas) ? d.tarefas_novas : []).slice(0, 3)) {
  if (!t || !t.titulo) continue;
  const repetida = ctx.tarefasAbertas.some((x) => repete(t.titulo, x.titulo)) || aceitas.some((x) => repete(t.titulo, x));
  if (!repetida) aceitas.push(t.titulo);
  if (repetida) continue;
  const prazo = calculaPrazo(t.prazo_texto);
  const props = {
    'Tarefa Interna': P.titulo(`${nomeCurto} — ${t.titulo}`.slice(0, 150)),
    'Pessoas': P.relacao([ctx.contatoId]),
    'Fonte': P.opcao('sugerida pelo Claude'),
    'Tipo de tarefa': P.opcao('a confirmar'),
    'Situação': P.opcao('a fazer'),
    'Status': P.status('Processar'),
    'Com quem está': P.opcao(t.com_quem_esta === 'Contato' ? 'Contato' : 'Ative'),
    'Registrado em': P.data(sp.data),
    'Trecho de origem': P.texto(String(t.trecho || '').slice(0, 1000)),
    'Mensagens': P.relacao(ctx.msgIds),
    'Nota do assistente': P.texto(`Criada pelo Jev lendo a conversa inteira em ${sp.ddmm} ${sp.hhmm}. Confira antes de confiar.`),
  };
  if (prazo) props['Prazo / Horário'] = P.data(prazo);
  escritas.push(criaPagina(DB.tarefas, props));
}

// Indicação: tarefa para a Ative falar com a pessoa indicada
if (ind) {
  const quem = [ind.nome, ind.email, ind.telefone].filter(Boolean).map((x) => String(x).trim()).join(' · ').slice(0, 200);
  const titulo = `Falar com ${quem} (indicação de ${nomeCurto || 'contato'})`;
  if (!ctx.tarefasAbertas.some((x) => repete(titulo, x.titulo)) && !aceitas.some((x) => repete(titulo, x))) {
    aceitas.push(titulo);
    escritas.push(criaPagina(DB.tarefas, {
      'Tarefa Interna': P.titulo(`${nomeCurto} — ${titulo}`.slice(0, 150)),
      'Pessoas': P.relacao([ctx.contatoId]),
      'Fonte': P.opcao('sugerida pelo Claude'),
      'Tipo de tarefa': P.opcao('a confirmar'),
      'Situação': P.opcao('a fazer'),
      'Status': P.status('Processar'),
      'Com quem está': P.opcao('Ative'),
      'Registrado em': P.data(sp.data),
      'Mensagens': P.relacao(ctx.msgIds),
      'Nota do assistente': P.texto(`Indicação lida pelo Jev em ${sp.ddmm} ${sp.hhmm}. Mandar a apresentação citando quem indicou.`),
    }));
  }
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
  else if (!['Reunião', 'Sem interesse', 'Descadastrar', 'Respondeu'].includes(st) && !['robô', 'fora da campanha'].includes(intencao)) novo = 'Respondeu';
  if (novo && novo !== st) {
    const pp = { 'Status': P.opcao(novo) };
    if (novo === 'Descadastrar' || novo === 'Sem interesse') { pp['Etapa da sequência'] = P.opcao('encerrada'); pp['Próximo envio'] = P.data(null); }
    escritas.push(atualizaPagina(ctx.empresaId, pp));
  }
}

// Rascunho para a fila (nível 1 e 2). Nível 3: nada sai.
let rascunho = null;
if (resposta && nivel < 3) {
  rascunho = {
    contatoId: ctx.contatoId, texto: resposta.slice(0, 1500), nivel: NIVEIS[nivel], canal: ctx.ultimoCanal,
    modelo,
    motivo: `${String(d.motivo || '').slice(0, 400)}${trava ? ` | trava: ${trava}` : ''}${aviso}`,
    empresaId: ctx.empresaId, msgIds: ctx.msgIds, titulo: `${ctx.nome} · ${intencao}`,
  };
}
return { json: { contatoId: ctx.contatoId, escritas, rascunho, nivel, intencao, erro } };
