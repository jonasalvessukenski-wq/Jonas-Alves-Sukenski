# Prompt para o Claude Code do computador (instalação da central)

Copie tudo abaixo e cole no Claude Code do computador.

```
Contexto: sou o Jonas. Outra sessão do Claude (na nuvem) deixou pronta a central de atendimento do n8n + Notion. Sua tarefa é instalar, conectar o e-mail contato@ (leitura e envio) e conectar o WhatsApp Business (48 97400-7161). Tudo está no repositório Jonas-Alves-Sukenski, branch claude/elegant-tesla-87ziz3, pasta automacao/central-atendimento. Leia o README.md dessa pasta antes de começar.

Regras:
- Nunca me peça senha, token ou chave no chat. Senha e token eu digito direto no n8n ou na Z-API.
- O envio automático (autoEnvio, na tabela ⚙️ Controles da central) continua DESLIGADO. Os textos N1-x continuam desligados até eu aprovar.
- Não altere os fluxos GAB-WPP 1 e GAB-WPP 2. O instalador só lê esses dois.
- Não mexa no VPS nem no projeto "painel".

Passo 1 — Instalar a central
1. git fetch origin claude/elegant-tesla-87ziz3 && git checkout claude/elegant-tesla-87ziz3
2. cd automacao/central-atendimento
3. Rode `node instalar.mjs` com a chave da API do n8n que você já usa (N8N_API_KEY). Me mostre a conferência: chaves da Z-API encontradas (mascaradas), credenciais do Notion e da OpenAI.
4. Se estiver tudo certo, rode `node instalar.mjs --gravar --ligar central`.
5. Me guie para dar acesso da conexão "n8n Ative" no Notion a três bases: Empresas — Prospecção set/2026, 📤 Fila de respostas e ⚙️ Controles da central (página → ••• → Conexões).
6. Execute o fluxo "GAB-WPP 4 - Central" uma vez pelo n8n e confira a execução. Se aparecer "Could not find database" ou 404, é acesso do Notion faltando. Me diga qual base.

Passo 2 — E-mail contato@ (ler e enviar)
1. Me guie para criar no n8n a credencial IMAP (Credentials → New → IMAP): usuário contato@ativeassessoriafinanceira.com.br, servidor imap.hostinger.com, porta 993, SSL ligado. A senha eu digito lá.
2. Me guie para criar também a credencial SMTP (Credentials → New → SMTP): mesmo usuário, servidor smtp.hostinger.com, porta 465, SSL ligado. A mesma senha, digitada por mim.
3. Rode `node instalar.mjs --gravar --ligar central,email`.
4. Se o nó "E-mail nos enviados" der erro de pasta, troque INBOX.Sent por Sent (ou pela pasta de enviados que o servidor mostrar) e rode o instalador de novo.
5. Na tabela ⚙️ Controles da central, marque "Ligado" na linha envioEmail.
6. Teste: eu mando um e-mail de outro endereço para contato@. Confira se entrou em 📥 Recebidas com Canal "E-mail" e se a central ligou ao contato.

Passo 3 — Texto do disparo (contexto do Jev)
Procure no computador o arquivo Ative_Email_e_WhatsApp_Estruturacao_de_Capital.md. Com o texto dele, preencha nos ⚙️ Controles:
- a linha disparoEmail, com o e-mail aprovado;
- a linha disparoWhatsApp, com os dois WhatsApp aprovados, o de primeiro contato e o de reforço.
Depois marque "Ligado" nas duas linhas. Esse texto não é enviado a ninguém: ele só dá contexto ao Jev. Se não achar o arquivo, me avise.

Passo 4 — WhatsApp Business
1. Me guie na Z-API para criar a instância da linha 48 97400-7161 e ler o QR Code com o app WhatsApp Business.
2. A instância e o token eu mesmo coloco. Tenho duas opções: exportar BUSINESS_INSTANCIA e BUSINESS_TOKEN no terminal antes de rodar o instalador, ou colar direto no n8n, nos nós "Chaves Z-API" (fluxo central) e "Config Business" (fluxo GAB-WPP 5). Me diga qual é mais simples.
3. Rode `node instalar.mjs --gravar --ligar central,email,business`. O instalador mostra a URL do webhook do Business.
4. Me guie no painel da Z-API dessa instância: colar a URL em "Ao receber" e ligar "Notificar as enviadas por mim".
5. Teste: eu mando um texto e um áudio de outro celular para o Business. Confira se entraram em 📥 Recebidas com Canal "WhatsApp Business" e se o áudio veio transcrito.

No fim, me diga o que ficou ligado, o que foi testado e o que ainda falta. Lembre-me de aprovar os textos N1-x nos Controles (caixa "Ligado") e de ligar autoEnvio quando eu quiser que as respostas saiam sozinhas.
```
