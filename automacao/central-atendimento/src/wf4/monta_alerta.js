// Um aviso só no WhatsApp do Jonas com quem pediu atenção desde a última rodada
const res = $input.all().flatMap((i) => i.json.results || []);
if (!res.length) return [];
const chaves = $('Chaves Z-API').first().json;
const ok = (s) => !!s && !/COLE|PREENCHER|A_DEFINIR/i.test(String(s));
if (!ok(chaves.pessoalInstancia) || !ok(chaves.pessoalToken) || !ok(chaves.clientToken) || !ok(chaves.numeroJonas)) return [];
const linhas = res.slice(0, 10).map((c) => {
  const p = c.properties || {};
  const passo = L.texto(p['Próximo passo']).trim();
  return `• ${L.titulo(p['Nome'])} (${L.opcao(p['Intenção atual']) || 'quente'})${passo ? `: ${passo}` : ''}`;
});
if (res.length > 10) linhas.push(`• e mais ${res.length - 10}`);
const texto = [
  res.length === 1 ? '🔥 Central: 1 contato pede sua atenção' : `🔥 Central: ${res.length} contatos pedem sua atenção`,
  '',
  ...linhas,
  '',
  'No Notion: CRM → 🔥 Quentes agora. Rascunhos em 📤 Fila de respostas.',
].join('\n');
return [{ json: {
  zUrl: `${ZAPI}/instances/${chaves.pessoalInstancia}/token/${chaves.pessoalToken}/send-text`,
  telefone: soDigitos(chaves.numeroJonas), texto, ids: res.map((c) => c.id),
} }];
