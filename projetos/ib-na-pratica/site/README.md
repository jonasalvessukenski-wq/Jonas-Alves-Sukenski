# IB na Prática — protótipo do site e da área do aluno (v2)

Protótipo estático (HTML, CSS e JS, sem build) do novo site do **IB na Prática**, a
escola de formação e especialização em Private, Corporate e Investment Banking de
Adriano Leite, CFP®. A v2 usa a identidade do site da Ative (azul-marinho e dourado,
Archivo e Source Sans 3) e os fatos públicos atuais do curso. Nada aqui está
publicado nem conectado.

## Como abrir

Abra `index.html` direto no navegador. A área do aluno está em `area-do-aluno.html`
(link "Área do aluno" no topo). As fontes vêm do Google Fonts; sem internet, a página
usa as fontes de reserva do sistema e continua legível.

| Arquivo | O que é |
|---|---|
| `index.html` | Página do curso: hero, ficha, 6 dias, por que funciona, percurso, quem ensina, Valuation, leitura de mercado, agenda, depoimentos, inscrição, FAQ, rodapé |
| `area-do-aluno.html` | Área logada: início (`#inicio`) e página de aula (`#aula`) |
| `style.css` | Estilos únicos das duas páginas |
| `app.js` | Gesto do hero, entradas de bloco, checkout simulado, vistas da área do aluno |
| `img/adriano.jpg` | Retrato do Adriano (900px) com duotone azul-marinho aplicado por filtro SVG |
| `previas/` | Capturas de página inteira em 1440px e 390px |

Nas prévias em 390px da área do aluno, a barra de abas aparece no fim da página. No
celular de verdade ela fica fixa na base da tela.

## O que é placeholder

- Tudo marcado com **[CONFIRMAR …]** depende de confirmação: data da próxima turma,
  valor e condições no novo site, condições da garantia, prazo das gravações,
  pré-requisitos, anos de mercado do Adriano, forma de citar a Olimpo, grafia e
  minibio do Huk Jung, datas dos encontros, e-mail, termos, privacidade, razão
  social e CNPJ, arquivo oficial do logo.
- **Foto do Adriano**: é a foto do site atual (ibnapratica.com.br). Substituir pela
  oficial em alta resolução. O Huk Jung aparece com monograma "HJ" até termos foto.
- **Logo**: monograma "IB" em SVG de traço fino e wordmark em Archivo. É uma
  reconstrução; trocar pelo arquivo oficial.
- **Depoimentos**: três blocos "aguardando autorização". O caso de Nota Comercial
  originado por alunos também só entra com autorização.
- **Leitura de mercado**: os gráficos são ilustrações sem valores, marcados como tal.
- **Área do aluno**: progresso, datas, durações, materiais e tópicos são exemplos.
- **Checkout**: o diálogo não envia nada.
- As descrições de cada um dos 6 dias são texto genérico e correto sobre cada tema,
  ainda não validado pelo professor.

## Próximos passos técnicos sugeridos

São opções para avaliar. Preços e condições mudam e precisam ser consultados com cada
fornecedor.

1. **Hospedagem do site**: estático, pode ir para Cloudflare Pages, Netlify ou
   Vercel, com domínio próprio e HTTPS.
2. **Vídeo com proteção**: Panda Video (brasileira), Vimeo (OTT/Enterprise), Bunny
   Stream, Mux, VdoCipher ou JW Player. Comparar DRM de verdade (Widevine/FairPlay)
   ou só token e marca d'água, marca d'água com dados do aluno, envio direto da
   gravação da aula ao vivo, legendas.
3. **Pagamento no próprio site (Pix e cartão)**: Mercado Pago, Pagar.me, Stripe,
   Asaas, PagBank, Efí, Iugu ou Vindi. Comparar checkout transparente, parcelamento,
   prazo de recebimento, antifraude, split com professores parceiros, webhooks para
   liberar o acesso sozinho e emissão de nota fiscal de serviço.
4. **Login e acesso**: Supabase Auth, Firebase Auth, Auth0 ou Clerk, com acesso
   liberado pelo webhook do pagamento. Alternativa sem desenvolvimento: manter a
   área de membros numa plataforma pronta (Hotmart Club, Memberkit, Cademí) e usar
   este site como vitrine e checkout.
5. **Certificado**: PDF gerado na conclusão, com código e página pública de
   verificação. Definir carga horária impressa e critério de conclusão.
6. **LGPD**: política de privacidade e termos de uso, aviso de cookies, base legal de
   cada dado, contratos com operadores (gateway, vídeo, e-mail), encarregado (DPO),
   prazo de retenção e canal para os direitos do titular. O cartão nunca passa pelo
   servidor do site, fica no gateway.
7. **Aulas ao vivo**: link da sala exibido só para alunos logados, convite de
   calendário (.ics) e lembrete por e-mail.

## Decisões de design

- Paleta da Ative: fundos `#061225`, `#0A1C3A`, `#0B2545`; painéis azuis
  translúcidos com borda `rgba(156,194,255,.15)`; dourado `#CBA75A` (botão em
  pílula, palavra-chave, fios), `#E0C77E` (realces e ícones); texto `#EEF1F7`,
  `#B7C1D6`, `#8D99B2`. Grão fino sobre o azul.
- Fontes: Archivo nos títulos (palavra-chave em negrito ou em dourado, resto em peso
  regular) e Source Sans 3 no texto. Corpo de 19px (18px no celular), entrelinha
  1,65.
- Movimento: o arco dourado do hero se desenha uma vez por sessão; os blocos entram
  uma vez. Com "reduzir movimento" ligado, tudo aparece no estado final.
