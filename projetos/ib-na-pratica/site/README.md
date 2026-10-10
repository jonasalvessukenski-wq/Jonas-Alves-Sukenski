# IB na Prática — protótipo do site e da área do aluno

Protótipo estático (HTML, CSS e JS, sem build) do site de venda e da área logada do
curso **IB na Prática**, de Adriano Leite, CFP. Serve para validar estrutura, tom e
visual antes de qualquer desenvolvimento real. Nada aqui está publicado nem conectado.

## Como abrir

Abra `index.html` direto no navegador (duplo clique). A área do aluno está em
`area-do-aluno.html`, e há um link "Área do aluno" no topo do site.
As fontes (Newsreader e Schibsted Grotesk) vêm do Google Fonts. Sem internet, a página
usa as fontes de reserva do sistema e continua legível.

| Arquivo | O que é |
|---|---|
| `index.html` | Página institucional e de venda, com checkout simulado (botão "Inscrever-se") |
| `area-do-aluno.html` | Área logada: início (`#inicio`) e página de aula (`#aula`) |
| `style.css` | Estilos únicos das duas páginas |
| `app.js` | Gesto do hero, entradas de bloco, diálogo de inscrição, vistas da área do aluno |
| `previas/` | Capturas de página inteira em 1440px e 390px |

Nas prévias em 390px da área do aluno, a barra de abas inferior aparece no fim da
página. No celular de verdade ela fica fixa na base da tela.

## O que é placeholder

- Tudo marcado com **[CONFIRMAR …]** depende de confirmação do Adriano: preço,
  parcelamento, datas, ementa, nome do professor parceiro do Programa de Valuation,
  forma de citar a Olimpo, foto, minibiografia, certificado, prazo de acesso, dados
  jurídicos.
- **Prova social**: o caso de Nota Comercial e os depoimentos são blocos reservados.
  Só entram com autorização por escrito.
- **Área do aluno**: aulas, progresso, datas, durações e tópicos da comunidade são
  exemplos e estão sinalizados como tal na tela.
- **Checkout**: o diálogo não envia nada. Ele só mostra onde entraria o pagamento.
- **Retrato**: um monograma "AL" faz o papel da foto até haver um retrato autorizado.
- As anotações da aula ficam só no navegador de quem testa (localStorage).

## Próximos passos técnicos sugeridos

São opções para avaliar. Preços e condições mudam e precisam ser consultados com cada
fornecedor. Nada aqui é recomendação fechada.

1. **Hospedagem do site**: o protótipo é estático e pode ir para Cloudflare Pages,
   Netlify ou Vercel, com domínio próprio e HTTPS.
2. **Vídeo com proteção (DRM ou similar)**: Panda Video (brasileira), Vimeo
   (planos OTT/Enterprise), Bunny Stream, Mux, VdoCipher ou JW Player. Pontos a
   comparar: DRM de verdade (Widevine/FairPlay) ou só token e marca d'água, marca
   d'água com dados do aluno, gravação do Google Meet enviada direto, legendas.
3. **Pagamento no próprio site (Pix e cartão)**: Mercado Pago, Pagar.me, Stripe,
   Asaas, PagBank, Efí, Iugu ou Vindi. Pontos a comparar: checkout transparente
   (dentro do site), parcelamento, prazo de recebimento, antifraude, split com o
   professor parceiro, webhooks para liberar o acesso sozinho, emissão de nota
   fiscal de serviço (direto ou por integração).
4. **Login e controle de acesso**: Supabase Auth, Firebase Auth, Auth0 ou Clerk, com
   acesso liberado pelo webhook do pagamento. Alternativa sem desenvolvimento:
   manter a área de membros em plataforma pronta (Hotmart Club, Memberkit, Cademí)
   e usar este site só como vitrine e checkout.
5. **Certificado**: PDF gerado na conclusão, com código e página pública de
   verificação. Definir carga horária e critério de conclusão antes.
6. **LGPD**: política de privacidade e termos de uso, aviso de cookies, base legal
   de cada dado coletado, contratos com operadores (gateway, vídeo, e-mail),
   encarregado (DPO), prazo de retenção e canal para os direitos do titular.
   Coletar só o necessário. O cartão nunca passa pelo servidor do site, fica no
   gateway.
7. **Agenda ao vivo**: link do Google Meet exibido só para alunos logados, convite
   de calendário (.ics) e lembrete por e-mail.

## Decisões de design

- Paleta: quase preto `#0C0D0B` com grão nos blocos escuros, papel `#F3EFE6`, texto
  `#13140F` e `#4E4B43`. Um acento só, dourado contido `#B7975A`, usado como fio
  de 1px e no botão primário.
- Fontes: Newsreader (serifa editorial, títulos) e Schibsted Grotesk (texto).
- Corpo de 18px (17px no celular), entrelinha 1,65, coluna de cerca de 65 caracteres.
- Movimento: o fio dourado do hero se desenha uma vez por sessão. Os blocos entram uma
  vez. Com "reduzir movimento" ligado, tudo aparece já no estado final.
