// Travas: nada sai fora do horário, para quem pediu para parar, depois que alguém já respondeu, acima do teto ou com texto proibido.
// O que passa é marcado como "enviada" ANTES do envio: uma falha no meio nunca manda a mesma resposta duas vezes.
const cfg = $('Config').first().json.cfg;
const chaves = $('Chaves Z-API').first().json;
const cands = $('Candidatos').all().map((i) => i.json);
const contatos = $input.all().map((i) => i.json);
const enviadas = $('Busca enviadas 24h').all().flatMap((i) => i.json.results || []);

const hoje = partesSP().data;
let autoHoje = 0;
const auto24 = {};
for (const pg of enviadas) {
  const p = pg.properties || {};
  if (L.opcao(p['Nível']) !== '1 - automática') continue;
  const quando = L.data(p['Enviada em']);
  if (quando && partesSP(new Date(quando)).data === hoje) autoHoje += 1;
  for (const cid of L.relacao(p['Contato'])) auto24[cid] = (auto24[cid] || 0) + 1;
}

const chaveOk = (s) => !!s && !/COLE|PREENCHER|A_DEFINIR/i.test(String(s));
const INST = {
  'WhatsApp pessoal': { instancia: chaves.pessoalInstancia, token: chaves.pessoalToken },
  'WhatsApp Business': { instancia: chaves.businessInstancia, token: chaves.businessToken },
};
const noHorario = dentroDoHorario(valorTxt(cfg, 'horarioEnvio', 'seg-sex 08:00-19:00'));
const teto = valorNum(cfg, 'tetoDiarioAuto', 50);
const maxPorContato = valorNum(cfg, 'maxAutoPorContato24h', 1);
const agoraISO = new Date().toISOString();
const sp = partesSP();
const out = [];
const nestaRodada = new Set();

cands.forEach((c, i) => {
  const nota = (m) => P.texto(`${sp.ddmm} ${sp.hhmm}: ${m}${c.motivoAnterior ? ` | antes: ${c.motivoAnterior}` : ''}`);
  const barra = (m) => out.push({ json: atualizaPagina(c.filaId, { 'Situação': P.opcao('barrada pela trava'), 'Motivo': nota(m) }) });
  const rebaixa = (m) => out.push({ json: atualizaPagina(c.filaId, { 'Nível': P.opcao('2 - rascunho'), 'Motivo': nota(`não saiu sozinha: ${m} Aprove se quiser enviar.`) }) });

  if (!noHorario) return; // fora da janela: espera, sem gravar nada
  if (!c.texto) return barra('texto vazio.');
  if (c.canal === 'E-mail') return barra('resposta por e-mail ainda não sai pelo sistema. Copie o texto e responda pelo webmail.');
  const ct = contatos[i] && contatos[i].object === 'page' ? contatos[i] : null;
  if (!ct) return barra('contato não encontrado no CRM.');
  const p = ct.properties || {};
  const tel = soDigitos(separaValores(L.telefone(p['Contato']))[0]);
  if (tel.length < 12) return barra('o contato não tem telefone completo no CRM (só LID). Responda pelo celular.');
  if (PROPRIOS_8.has(ultimos8(tel))) return barra('número do próprio Jonas.');
  const inst = INST[c.canal];
  if (!inst || !chaveOk(inst.instancia) || !chaveOk(inst.token) || !chaveOk(chaves.clientToken)) return barra(`falta a chave da Z-API do canal ${c.canal} no nó "Chaves Z-API". Depois de preencher, volte a Situação para "aprovada".`);
  if (L.opcao(p['Intenção atual']) === 'descadastro' && c.modelo !== 'N1-E') return barra('o contato pediu para não receber mensagens.');
  const ultDe = L.opcao(p['Última mensagem de']);
  const ultEm = L.data(p['Última mensagem em']);
  if (ultDe && ultDe !== 'Contato') return barra('a última mensagem da conversa já é da Ative: alguém respondeu depois deste rascunho.');
  if (ultEm && Date.parse(ultEm) >= Date.parse(c.criadaEm) + 60000) return barra('o contato escreveu de novo depois deste rascunho. O Jev vai reler a conversa e propor outro.');
  if (c.auto) {
    if (RE_LINHA_VERMELHA.test(c.texto)) return barra('texto automático com número, percentual, prazo ou termo proibido.');
    if (/^N1-/.test(c.modelo) && !(cfg[c.modelo] && cfg[c.modelo].ligado)) return rebaixa(`o texto ${c.modelo} não está aprovado nos Controles.`);
    if (L.opcao(p['Nível de resposta']) !== '1 - automática' || L.opcao(p['Mapa']) === 'PES' || !c.empresaId) return rebaixa('o contato não está mais no nível 1.');
    if (autoHoje >= teto) return rebaixa(`teto diário de ${teto} respostas automáticas atingido.`);
    if ((auto24[c.contatoId] || 0) >= maxPorContato) return rebaixa('este contato já recebeu resposta automática nas últimas 24 horas.');
  }
  if (nestaRodada.has(c.contatoId)) return; // uma por contato por rodada
  nestaRodada.add(c.contatoId);
  if (c.auto) { autoHoje += 1; auto24[c.contatoId] = (auto24[c.contatoId] || 0) + 1; }
  out.push({ json: {
    ...atualizaPagina(c.filaId, { 'Situação': P.opcao('enviada'), 'Enviada em': P.data(agoraISO), 'ID do envio': P.texto('enviando') }),
    envio: { ...c, telefone: tel, nome: L.titulo(p['Nome']), zUrl: `${ZAPI}/instances/${inst.instancia}/token/${inst.token}/send-text` },
  } });
});
if (!out.length) out.push({ json: NADA });
return out;
