# Gabinete — portal do Adriano Leite

Portal e processador que leem o WhatsApp do Adriano, organizam pendências e mostram tudo num só lugar. Arquitetura e decisões em [`../docs/ARQUITETURA.md`](../docs/ARQUITETURA.md).

## Ver funcionando agora (modo demonstração)

Sem nenhuma chave configurada, o portal abre com dados fictícios e uma faixa avisando.

```bash
npm install
npm run dev        # http://localhost:3000
```

## Testes

```bash
npm test           # núcleo (identidade, datas, duplicidade, fila, Z-API, validação da IA) + banco em memória
npm run typecheck
```

## Ligar de verdade (fase 1)

Feito uma vez, pelo navegador (tablet serve). Segredos são digitados por quem é dono da conta, nunca colados em conversa.

1. **Supabase**: criar projeto (região São Paulo). Em SQL Editor, rodar `supabase/migrations/0001_estrutura.sql`. Em Storage, criar o bucket privado `midias`.
2. **Vercel**: importar este repositório, pasta raiz `projetos/adriano-leite/portal`. Cadastrar as variáveis de `.env.example`.
3. **Z-API**: criar a instância do Adriano e ler o QR Code com o celular dele. Em Webhooks, "Ao receber" = `https://SEU-DOMINIO/api/webhooks/zapi/<WEBHOOK_SEGREDO>` e ativar "notificar as enviadas por mim". Gerar o Client-Token (sem ele os envios voltam com erro 400).
4. **Teste com número interno primeiro**: mandar mensagens de um celular da equipe, conferir em **Sistema** que chegou e em **Conversas** que apareceu. Conferir no destino, não na tela verde.
5. Só então liberar para o uso do Adriano.

## Estrutura

```
app/                    telas (Hoje, Conversas, Pendências, Busca, Sistema) e rotas de API
  api/webhooks/zapi/    entrada do WhatsApp
  api/processar/        processador da fila (Vercel Cron, 1 min)
lib/                    núcleo: telefone, identidade, datas, trivial, deduplicar, fila, zapi, classificador
supabase/migrations/    estrutura do banco
tests/                  testes (vitest + PGlite)
```
