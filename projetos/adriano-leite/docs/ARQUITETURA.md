# Gabinete do Adriano Leite — arquitetura

Versão 0.1 · 10/10/2026 · Este repositório é público: aqui não entra nenhum dado pessoal, de cliente ou de operação. Contexto, perfil e decisões comerciais ficam no Notion do Jonas.

## O que é

Um "segundo cérebro" de trabalho para um consultor financeiro que vive no WhatsApp e em videochamadas. O sistema lê as conversas, entende o que ficou pendente, quem está esperando resposta e o que vence hoje, e mostra tudo num portal que abre no celular e no computador.

O sistema não responde ninguém sozinho. Ele organiza; quem decide é o Adriano.

## Onde roda

Tudo na nuvem. Nenhuma peça depende do computador do Jonas ou do Adriano.

| Peça | Serviço | Por quê |
|---|---|---|
| Portal + entrada do webhook + processador | Vercel (Next.js) | Publica direto do GitHub; HTTPS e domínio prontos |
| Banco de dados, arquivos (áudios, documentos) | Supabase (Postgres + Storage) | Banco de verdade: unicidade, transações, busca; backup diário |
| WhatsApp | Z-API (instância própria do Adriano) | Mesmo provedor que o Jonas já opera |
| Análise das conversas | API do Claude | Saída estruturada validada em código |
| Transcrição de áudio | Serviço compatível com `/audio/transcriptions` | **[CONFIRMAR provedor]** |
| Agenda e reuniões (fase 2) | Google Calendar / Google Meet | O Adriano usa Google Meet **[CONFIRMAR conta Workspace com transcrição]** |
| E-mail (fase 2) | Gmail API ou IMAP | **[CONFIRMAR provedor do e-mail corporativo]** |

## Fluxo

```
WhatsApp ──► Z-API ──► /api/webhooks/zapi/<segredo>
                         │ confere segredo e instância
                         │ normaliza (descarta eco, canal, grupo fora da lista)
                         │ GRAVA a mensagem (o banco barra repetida)
                         └► fila: identificar
                                   │
Vercel Cron (1 min) ──► /api/processar
                         ├ identificar: telefone/LID → contato (desconhecido vira "pendente")
                         ├ baixar_midia: guarda áudio/arquivo no Storage (a URL do provedor expira)
                         ├ transcrever: áudio → texto (sem sobrescrever nada)
                         └ analisar_conversa: quando a conversa assenta
                              ├ só cortesias → fecha sem IA (custo zero)
                              └ conteúdo → Claude propõe; código valida
                                   ├ trecho literal obrigatório (sem trecho, sem pendência)
                                   ├ prazo calculado em código (fuso de São Paulo)
                                   ├ confiança baixa / dinheiro / contato novo → "Conferir"
                                   └ duplicata → anexa evidência à pendência existente
                                              │
Portal ◄──────────────────────────────────────┘
  Hoje · Conversas · Pendências (Fazer / Aguardando / Conferir) · Busca · Sistema
```

## Erros da automação anterior e a decisão tomada aqui

Cada linha é um problema que aconteceu de verdade na automação do Jonas (setembro e outubro de 2026) e a regra que o impede neste projeto.

| Erro anterior | Decisão neste projeto | Onde está |
|---|---|---|
| Webhook nunca configurado: 36 mensagens na Z-API e zero no fluxo | Tela **Sistema** mostra "Silenciosa" quando não chega mensagem em horário comercial | `app/sistema` |
| Nono dígito: o celular chegava sem o 9 e era barrado | Chave do contato = 55 + DDD + últimos 8 dígitos | `lib/telefone.ts` |
| URL do webhook aberta: qualquer um forjaria mensagem | Segredo no caminho (comparação em tempo constante) + trava de instância | `app/api/webhooks` |
| Repetição pelo `messageId` falhava no código do n8n | Unicidade no banco: `unique (canal, id_externo)` | migração |
| Alteração em fluxo ativo não recarregava | Não há fluxo visual: código versionado, publicado a cada commit | — |
| Fallback do Switch fora de ordem jogava tudo em descarte | Descarte só por regra explícita e testada; cada descarte gera evento com o motivo | `lib/zapi.ts` |
| Áudio e imagem sumiam (iam para um NoOp) | Todo tipo é gravado; mídia vai para o Storage | `lib/zapi.ts`, processador |
| Transcrição sobrescrita por texto vazio | `transcricao` é coluna própria; nunca sobrescreve `texto` | migração |
| "Até sexta" virou quarta; servidor em UTC | IA devolve a expressão; código calcula no fuso de São Paulo | `lib/datas.ts` |
| Fluxo apagou conteúdo escrito pelo Jonas | Nada é sobrescrito: evidências são acrescentadas | `evidencias` |
| Nó tolerante a erro escondia falha (execução verde sem fazer nada) | Fila com estados; falha vira nova tentativa ou "morta" visível no portal | `lib/fila.ts` |
| LID gravado como telefone falso | LID tem tabela própria e nunca é tratado como telefone | `lib/telefone.ts`, `contato_lids` |
| Relações omitidas pela API do Notion | Fonte da verdade é Postgres, não o Notion | — |
| Ligação pelo primeiro nome ("Bruno" errado) | Identidade só por telefone, LID ou e-mail. Nome nunca identifica | `lib/identidade.ts` |
| 243 mensagens sem dono | Número novo vira contato "pendente" na hora | `lib/identidade.ts` |
| Contato conhecido aparecia como "não reconhecido" | Par telefone/LID aprendido; contato só-LID é fundido sem perder histórico | `fundir_contatos` |
| Mensagem curta com conteúdo marcada como ruído | Só cortesia pura é trivial; mesmo assim entra como contexto | `lib/trivial.ts` |
| "Ligada por contexto" a tarefa errada | Pendência só compara com pendências do mesmo contato | `lib/deduplicar.ts` |
| Pergunta virou compromisso com horário errado | Instrução explícita + trecho literal obrigatório + confiança | `lib/classificador.ts` |
| Tarefas duplicadas | Sobreposição de palavras-chave com radical; parecida vai para "Conferir" | `lib/deduplicar.ts` |
| 392 de 399 mensagens passaram pela IA, inclusive "ok" | Análise por conversa assentada; cortesia fecha sem IA | `lib/fila.ts` |
| "Too many requests" derrubava mensagens | Mensagem gravada antes; passo repetido com espera crescente | `lib/fila.ts` |
| n8n guardava conteúdo de terceiros em todo log | Eventos guardam só o motivo e o tipo; corpo bruto tem prazo de retenção | `controles.retencao_bruto_dias` |
| Dependência do PC, da extensão do Chrome e de cota do Claude | Tudo roda em serviço gerenciado; nada local | — |

## Regras que valem sempre

1. Nada sai em nome do Adriano sem aprovação. `envio_automatico` começa desligado e não há tela para ligá-lo nesta versão.
2. Baixa de pendência só pelo Adriano. O banco recusa outra origem.
3. Pedido de pagamento, PIX ou troca de conta nunca vira pendência sozinho.
4. A IA propõe, o código garante. Datas, identidade, duplicidade e validação ficam em código testado.
5. Toda peça tem botão de desligar (Sistema) e deixa rastro (eventos).
6. Segredos ficam em variáveis de ambiente, cadastrados pelo Jonas ou pelo Adriano. Ninguém cola token em conversa.

## Fases

| Fase | Entrega | Estado |
|---|---|---|
| 0 | Núcleo testado, banco, portal em modo demonstração | feito (este commit) |
| 1 | WhatsApp do Adriano ligado: captura, identificação, transcrição, análise, portal com login | código pronto; falta contratar/configurar serviços |
| 2 | Agenda (Google Calendar) e resumo das reuniões do Google Meet | a fazer |
| 3 | E-mail corporativo | a fazer |
| 4 | Despacho diário (resumo de fim de dia) e busca semântica | a fazer |

## Custos a validar

Não há valor confirmado ainda. Itens que geram custo mensal: Z-API (instância), Vercel (o cron a cada minuto exige plano pago; alternativa gratuita: `pg_cron` do Supabase chamando o processador), Supabase (plano gratuito pode bastar no início), API do Claude (por volume de conversas analisadas), transcrição (por minuto de áudio). **[CONFIRMAR com orçamento real antes de ligar]**
