# n8n → Notion: WhatsApp Business e e-mail da Ative

Estado em 30/09/2026. Histórico completo do fluxo em Notion → CON-AUT (automacoes) e
"Conversas por contato — plano e estado (30/09/2026)".

| Item | Situação |
|---|---|
| E-mail contato@ → Recebidas | fluxo **GAB-MAIL 1** montado e testado localmente; falta importar no n8n e criar a credencial IMAP |
| WhatsApp Business (48 97400-7161) → Recebidas | mudança no **GAB-WPP 1** especificada abaixo; depende da 2ª instância na Z-API e da chave da API do n8n |

## 1. E-mail — GAB-MAIL 1

Arquivo: `GAB-MAIL-1-captura-email.json` (gerado por `montar_gab_mail.py` a partir de `codigo/`).

O que faz, para cada e-mail da Caixa de entrada e dos Enviados:

- grava uma linha em 📥 Recebidas com Canal = E-mail, E-mail, Assunto, Conteúdo (só a
  parte nova, sem o histórico citado), Recebida em e messageId; o texto inteiro e a ficha
  (De, Para, Cc, data) vão no corpo da página;
- liga ao contato pelo campo **Email** do CRM SOS;
- e-mail sem cadastro vira contato `a_confirmar` com nome + domínio — "Fulano (empresa.com.br)",
  ou "(e-mail)" para Gmail/Hotmail etc.;
- atualiza **Último Contato** do contato;
- situação: `vinculada a contato` (conhecido), `aguardando decisao` (novo), `enviada por mim`
  (Enviados), `ignorada` (automático: no-reply, newsletter, lista — sem criar contato);
- título com `→` para enviado e `↩` para resposta recebida, igual ao WhatsApp.

Travas:

- **Não marca como lido nem move nada** na caixa (`postProcessAction = nothing`).
- Só entra e-mail a partir de 30/09/2026; depois o gatilho acompanha pelo UID e o nó
  `Ja processei esse?` barra repetição pelo Message-ID.
- Busca no CRM que falhou **nunca cria contato** (evita cadastro duplicado).
- Cópia do que o próprio contato@ enviou, recebida na entrada, é descartada (já entra por Enviados).
- Se algum e-mail não for gravado, a execução termina em erro com assunto e remetente, e o
  `GAB-WPP 0` grava a nota "FALHA em...".
- Nada é enviado. Respostas continuam sendo rascunho: nada sai sem "pode enviar".

### Passos para ligar (Jonas, no n8n)

1. **Credentials → Add credential → IMAP**. Nome: `IMAP contato@ativeassessoriafinanceira.com.br`.
   User `contato@ativeassessoriafinanceira.com.br`, Password (digitada por você), Host
   `imap.hostinger.com`, Port `993`, SSL/TLS ligado. Salvar — o n8n testa a conexão.
2. **Workflows → ··· → Import from File** → `GAB-MAIL-1-captura-email.json`.
3. Nos dois gatilhos IMAP, escolher a credencial do passo 1. Nos quatro nós "(Notion)",
   escolher a credencial do Notion que o GAB-WPP 1 já usa.
4. **[CONFIRMAR] nome da pasta de enviados.** Está `INBOX.Sent`. Se o gatilho "IMAP -
   Enviados" acusar pasta inexistente, trocar por `Sent` (ou o nome que aparece no webmail).
5. Ativar e mandar um e-mail de teste de fora para contato@ e outro de contato@ para fora.
   Conferir as duas linhas em Recebidas (visão "Conversas por contato").

Com a chave da API do n8n no ambiente, os passos 2 e 3 saem por
`python3 n8n_api.py subir-novo GAB-MAIL-1-captura-email.json --imap-cred-id <id>`
(a credencial do Notion é copiada do GAB-WPP 1).

Observação: e-mail enviado por um aplicativo que não salva cópia em Enviados no servidor
não será visto. O webmail da Hostinger salva.

## 2. WhatsApp Business — mudança no GAB-WPP 1 (`IJLPj2CoZmrGomw0`)

Números: a instância atual da Z-API ("Meu número") é o **48 9620-2573** — Canal
`WhatsApp pessoal`, número que também recebe os comandos. O **48 97400-7161** é o
WhatsApp Business do Jonas, que hoje só aparece como remetente dos comandos
(`cfg.numeroJonas = 74007161`, últimos 8 dígitos).

### Parte do Jonas (Z-API)

1. Criar uma **segunda instância** na Z-API e ler o QR code no celular do Business
   (WhatsApp Business → Dispositivos conectados). Custo da segunda instância: [A CONFIRMAR].
2. Em Webhooks da instância nova: **"Ao receber"** = a mesma URL de produção da instância
   "Meu número" (copiar de lá; o caminho é o segredo, não publicar). Ligar
   **"Notificar as enviadas por mim também"**. Os outros campos vazios.
3. Mandar uma mensagem qualquer para o Business. Ela chega ao n8n e é descartada
   ("instancia diferente da esperada"), mas o `instanceId` fica na execução — é de lá que
   sai o ID da instância nova. O token da instância não é necessário para captura.

### Parte do Claude Code (com `N8N_API_KEY` no ambiente)

Antes de tudo: `python3 n8n_api.py baixar IJLPj2CoZmrGomw0` e ler o `Normaliza` atual.

1. **Config**: além de `instanciaEsperada`, mapa `instancias` = { idPessoal: `WhatsApp pessoal`,
   idBusiness: `WhatsApp Business` } e `numeroAssistente = 96202573`.
2. **Normaliza**: aceitar as duas instâncias (qualquer outra continua descartada com
   "instancia diferente da esperada") e devolver `canal`.
3. **Regras novas na instância Business:**
   - nunca é rota `comanda` — só o número do assistente recebe comando;
   - conversa com o próprio número do assistente (96202573), nos dois sentidos, é
     **descarte** ("ja capturada pela instancia pessoal"): o comando que o Jonas manda do
     Business já entra como `comanda` pela instância pessoal, e o despacho das 18h volta no
     Business como recebido — sem essa regra, cada um viraria linha duplicada;
   - recebida de terceiro → `triagem`; digitada pelo Jonas no Business
     (`fromMe && !fromApi`) → `enviada`, pelo mesmo caminho de hoje.
4. **Todos os nós que gravam em Recebidas**: incluir `Canal` com o valor do item. Registros
   antigos seguem com Canal vazio (= WhatsApp pessoal).
5. PUT pelo `n8n_api.py atualizar` (já desativa e reativa — PATCH em fluxo ativo não recarrega).
   Conferir no switch `Quem mandou?` que o fallback continua sendo a **última** saída.
6. Testes com mensagem real: terceiro → Business; Business → contato; Business → assistente
   (tem de sair só a `comanda`, sem linha duplicada). Verificar o resultado em Recebidas,
   não só o status da execução.

## Testes locais

    node testes/testar-codigo.js      # roda o código dos nós do GAB-MAIL 1 com e-mails de exemplo
    python3 montar_gab_mail.py        # regenera o JSON depois de mexer em codigo/
