# Central de atendimento — n8n + Notion

Cada conversa pertence a um contato do CRM. O Jev lê a conversa inteira, e não uma mensagem de cada vez. Ele atualiza o contato, cria ou atualiza as tarefas com "Com quem está" e propõe respostas. Por padrão, nada sai sem o Jonas aprovar.

## Os três fluxos

| Fluxo | O que faz | Quando roda |
|---|---|---|
| `GAB-WPP 4 - Central (portaria, Jev, fila e alertas)` | 1) **Portaria**: marca o Filtro de cada mensagem nova (passou, robô, descadastro, e-mail devolvido, números do Jonas). Liga ao contato por telefone, LID ou e-mail, nunca por nome, e cria no CRM quem escreveu e não tem cadastro. 2) **Jev**: lê a conversa das últimas 36 h de cada contato com mensagem nova e grava temperatura, intenção, nível, resumo e próximo passo. Também cria ou atualiza tarefas e deixa rascunho na Fila. 3) **Fila**: envia o que o Jonas aprovou e, se ligado, o nível 1 automático. Antes, passa pelas travas. 4) **Alertas**: manda um aviso só no WhatsApp do Jonas com quem esquentou. | a cada 10 min, das 7h às 21h50 |
| `GAB-WPP 3 - Captura e-mail (contato@ative)` | Lê a caixa de entrada e a de enviados do contato@. Tira o histórico citado, classifica o e-mail (resposta, devolvido, automático ou descadastro) e grava em Recebidas, sem duplicar. | a cada e-mail |
| `GAB-WPP 5 - Captura WhatsApp Business` | Recebe o aviso da Z-API da linha 48 97400-7161, transcreve áudio e grava em Recebidas. Descarta grupo, status, eco do sistema, repetidas e os números do Jonas. | a cada mensagem |

O `GAB-WPP 1` (captura do WhatsApp pessoal) e o `GAB-WPP 2` (despacho das 18h) **não foram alterados**. A central trabalha em cima do que eles gravam no Notion.

### Travas antes de qualquer envio
- Só sai dentro de `horarioEnvio`, que por padrão é seg–sex, das 08:00 às 19:00. Fora disso, espera.
- Não sai quando a última mensagem da conversa já é da Ative (alguém respondeu antes).
- Não sai quando o contato escreveu de novo depois do rascunho. O Jev relê e propõe outro.
- Não sai para quem pediu descadastro, salvo a confirmação N1-E.
- Sai no máximo uma resposta por contato por rodada.
- O nível 1 automático só vale para contato da campanha e quando `autoEnvio` está ligado. Ele respeita o teto diário (`tetoDiarioAuto`) e o limite por contato (`maxAutoPorContato24h`). Texto com número, percentual, R$, prazo ou termo proibido é barrado.
- A resposta é marcada como "enviada" antes do envio. Assim, uma falha no meio nunca manda duas vezes, e o que a Z-API recusa vira "falhou" com o motivo.
- Resposta por e-mail ainda não sai pelo sistema. Fica como rascunho para copiar no webmail.

### Controles (Notion → ⚙️ Controles da central)
Mudar ali vale na rodada seguinte, sem mexer no n8n. As chaves liga/desliga usam a caixa **Ligado**; as de valor usam o campo **Valor**.
`autoEnvio` (começa desligado) · `analiseConversa` · `esperaProspectMin` · `esperaDemaisMin` · `horarioEnvio` · `tetoDiarioAuto` · `maxAutoPorContato24h` · `modeloJev` · `maxAnalisesPorRodada`

## Instalação (sessão do computador, com a chave da API do n8n)

Prompt para colar no Claude Code do computador:

> Busque a branch `claude/elegant-tesla-87ziz3` e entre em `automacao/central-atendimento`. Siga o README. Rode `node instalar.mjs` com a chave da API do n8n que você já usa (`N8N_API_KEY`) e me mostre a conferência. Se estiver tudo certo, rode `node instalar.mjs --gravar --ligar central`. Depois me diga o que falta e o que eu preciso fazer.

O instalador:
- copia as chaves da Z-API da linha pessoal do nó Config do `GAB-WPP 2`, sem passar por conversa;
- usa as mesmas credenciais do Notion e da OpenAI do `GAB-WPP 1`;
- cria ou atualiza os três fluxos, sem duplicar;
- liga só o que for pedido em `--ligar`;
- mostra a URL do webhook do Business.

### O que só o Jonas pode fazer
1. **Notion**: dar acesso à conexão **n8n Ative** nestas três bases: *Empresas — Prospecção set/2026*, *📤 Fila de respostas* e *⚙️ Controles da central*. O caminho é: página → ••• → Conexões → n8n Ative.
2. **E-mail**: no n8n, criar a credencial IMAP (Credentials → New → IMAP) e **digitar a senha lá**. Dados: servidor `imap.hostinger.com`, porta `993`, SSL ligado, usuário `contato@ativeassessoriafinanceira.com.br`. Depois, rodar de novo `node instalar.mjs --gravar --ligar email`. Se o nó de enviados reclamar da pasta, trocar `INBOX.Sent` por `Sent`.
3. **WhatsApp Business**: na Z-API, criar a instância da linha 48 97400-7161 e ler o QR Code com o WhatsApp Business. Depois:
   - colar a instância e o token nos nós `Chaves Z-API` (fluxo central) e `Config Business` (fluxo 5) direto no n8n. Outra opção é exportar `BUSINESS_INSTANCIA` e `BUSINESS_TOKEN` no terminal e rodar o instalador;
   - no painel da Z-API dessa instância, colar a URL do webhook em "Ao receber" e ligar "Notificar as enviadas por mim";
   - rodar `node instalar.mjs --gravar --ligar central,business`.

### Primeiro dia
- `autoEnvio` fica **desligado**. O Jev só faz rascunhos, e o Jonas aprova mudando a Situação para "aprovada" na 📤 Fila de respostas (vista "✍️ Rascunhos para aprovar").
- O Jev antigo do `GAB-WPP 1`, que analisa mensagem por mensagem, continua ligado. Depois de um dia, compare as tarefas dos dois e desligue a criação de tarefas do antigo, para não duplicar.
- Na primeira rodada, a portaria processa as mensagens dos últimos 3 dias que ainda estão sem Filtro, até 150 por rodada. O Jev só lê conversas com mensagem das últimas 12 h.

### Execuções do n8n (limite do plano)
Central: 90 execuções por dia (cerca de 2.700 por mês). E-mail e Business: uma execução por mensagem. Para gastar menos, troque o cron do nó `A cada 10 minutos` (por exemplo, `*/15 7-20 * * 1-6`).

## Onde mexer
- **Textos e tom do Jev**: `src/prompt_jev.js`. É onde entram os textos do redator: modelos N1-A a N1-E e cartões OBJ.
- **Regras**: `src/wf4/*.js` (central), `src/wf3/*.js` (e-mail), `src/wf5/*.js` (Business) e `src/comum.js` (funções comuns, padrões de robô, descadastro e linhas vermelhas).
- Depois de editar: `node build.js` e em seguida `node instalar.mjs --gravar --ligar central`. **Não edite o código dentro do n8n**, porque a próxima instalação sobrescreve.

## Testes (sem tocar nos dados reais)
`testes/simulador.js` imita o Notion, a OpenAI e a Z-API. `testes/rodar.js` monta os fluxos apontando para ele e roda no n8n local (versão 2.40.3, a mesma da nuvem, com Node 24).
```
N8N_DIR=/caminho/do/n8n NODE_BIN=/caminho/do/node24/bin node testes/rodar.js central   # ou email, business
TESTE_TRAVADO=1 node testes/rodar.js central    # envio automático desligado e fora do horário: só o alerta sai
node testes/resumo.js <resultado.json>          # estado final das bases simuladas
```
Resultado em 30/09/2026 (cenário com prospect interessado, robô, descadastro, e-mail, devolução, cliente e contato pessoal):
- portaria: todos os filtros e ligações certos;
- 3 contatos novos criados, e nenhum para robô ou devolução;
- 5 leituras do Jev;
- tarefa nova sem duplicar a existente, e a existente com "sugere baixa";
- 1 resposta automática enviada, 1 barrada (e-mail), rascunhos numerados e 1 alerta;
- a segunda rodada não repetiu nada.

No modo travado, só o alerta saiu. O teste do e-mail classificou os 5 tipos sem duplicar. O do Business transcreveu o áudio e descartou grupo, eco, status, instância errada e repetida. O instalador foi testado contra um n8n local: criou os fluxos, atualizou sem duplicar, ligou e o webhook respondeu 200.
