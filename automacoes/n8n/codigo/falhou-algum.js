// Falhou algum? — roda depois do lote inteiro. Se algum e-mail não foi gravado, a
// execução termina em erro de propósito: o GAB-WPP 0 grava a nota "FALHA em..." com
// esta mensagem, e o e-mail perdido fica nomeado (assunto e remetente).
const todos = $input.all().map((i) => i.json);
const falhas = todos.filter((j) => !j.ok);

if (falhas.length) {
  const lista = falhas.map((f) => `- ${f.pasta}: "${f.assunto}" (${f.email}) -> ${f.erro}`).join('\n');
  throw new Error(`${falhas.length} de ${todos.length} e-mail(s) nao gravados em Recebidas:\n${lista}`);
}

return [{
  json: {
    gravados: todos.length,
    contatosNovos: todos.filter((j) => j.contatoNovo).length,
    porSituacao: todos.reduce((acc, j) => ({ ...acc, [j.situacao]: (acc[j.situacao] || 0) + 1 }), {}),
  },
}];
