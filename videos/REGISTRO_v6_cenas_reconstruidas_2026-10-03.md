# Registro de alterações — v6: cenas reconstruídas (03/10/2026)

## Lote da madrugada (v5) — o que foi revisado

| Nº | Vídeo | v5 (madrugada) | Situação na revisão | v6 |
|---|---|---|---|---|
| 1 | Tributário | `tributario/ATIVE_Tributario_v5_narrado.mp4` | refeito | `tributario/ATIVE_Tributario_v6_narrado.mp4` |
| 2 | Apresentação da Ative | `apresentacao-ative/ATIVE_Apresentacao_v5_narrado.mp4` | refeito | `apresentacao-ative/ATIVE_Apresentacao_v6_narrado.mp4` |
| 3 | Estruturação de Capital | `estruturacao-de-capital/ATIVE_Estruturacao_de_Capital_v5_narrado.mp4` | refeito | `estruturacao-de-capital/ATIVE_Estruturacao_de_Capital_v6_narrado.mp4` |
| — | Quem somos | não entrou no lote (continua a versão aprovada) | sem mudança | — |

As v4 e v5 continuam nos mesmos lugares (nada foi apagado). As v6 partem da **v4** — voz, música,
duração e sincronia idênticas — e trocam só as cenas listadas abaixo.

## O que a v4 fazia melhor e o que a v5 perdeu

- A v4 tinha identidade: fundos azuis chapados (o azul `#008DE6` e o navy `#000050`), letra branca
  nítida, elementos desenhados na página (barras, círculos, cartões) e movimento por cena.
- A v5 colocou as imagens de IA quase como slides: fundo azul-claro com brilhos genéricos, textos
  renderizados na imagem (menos nítidos que o HTML), logos de terceiros redesenhados pela IA, e um
  zoom lento que não acompanhava a fala. Em vários trechos a cena ficou parada.

## Método da v6

As imagens de IA viraram **referência de composição**, não quadro. Cada cena foi remontada como
elementos separados (fundo, cartões, selos, ícones em traço, linhas, texto) em HTML/SVG, no mesmo
padrão de código das cenas da v4, e animada no tempo real da narração. Componentes novos
(`estruturacao-de-capital/fonte/video/v6_comum.js` e `v6_comum.css`), reutilizados nos três vídeos
para manter cor, tipografia e ritmo iguais:

| Componente | O que é | Como se move |
|---|---|---|
| Quatro passos | cartões brancos 2×2, selo navy com anel dourado e ícone em traço (cadeado, lupa, proposta, alvo), título, descrição e sublinhado dourado | cada cartão sobe quando a narração chega nele; uma linha ciano se desenha ligando 01→02→03→04 |
| Degraus | frase à esquerda (duas linhas brancas, a terceira em ciano) e três discos luminosos à direita | o caminho se desenha subindo, um ponto de luz percorre a linha, cada disco surge quando a linha chega; "Do seu lado." aparece quando é dito |
| Ondas | três linhas senoidais com pontos de luz atrás da frase | as ondas correm devagar o tempo todo; a frase entra linha a linha |
| Feixes + ícone | feixes de luz diagonais suaves e um ícone desenhado em traço (gráfico, lupa, documento, equipe) | os feixes deslizam; o ícone se desenha enquanto a frase é dita |
| Fita | dois traços (navy e dourado) atrás da frase da abertura | se desenham da esquerda para a direita |

## Mapa de correção — Tributário (v5 → v6)

| Tempo | Fala | v5 | v6 |
|---|---|---|---|
| 21,6–24,9 s | "Auditar, recuperar e planejar." | círculos de IA colados | **v4 de volta** (círculos desenhados na página, já nítidos) |
| 34,1–38,8 s | "Identificamos possíveis valores pagos a mais…" | imagem com ondas e texto renderizado | **Ondas** em SVG + texto HTML, "valores pagos a mais" em destaque |
| 38,5–46,9 s | "Um enquadramento incorreto…" | três cartões de IA | **v4 de volta** (três painéis com foto, acendendo na vez) |
| 46,6–51,0 s | "Do diagnóstico à economia no caixa, seguimos do seu lado." | imagem dos degraus com texto fixo | **Degraus** desenhados; "Do seu lado." em ciano no momento da fala |
| 61,2–64,4 s | "Tudo começa pelo diagnóstico." | imagem dos quatro passos | **Quatro passos** em HTML, acendendo em sequência com a linha ligando |

## Mapa de correção — Apresentação (v5 → v6)

| Tempo | Fala | v5 | v6 |
|---|---|---|---|
| 2,3–11,4 s | abertura | imagem de ondas com logo e frase (opção A) | **v4 de volta** (logo e frase nítidos) + **Fita** navy/dourada que se desenha atrás da frase 2 |
| 11,2–17,0 s | "Na área financeira…" | imagem com placas de luz | texto da v4 + **Feixes** + ícone de gráfico em traço |
| 34,0–38,5 s | "…custos e resultados." | idem | texto da v4 + **Feixes** + ícone de lupa |
| 38,4–47,5 s | "Investigamos a operação e cruzamos os números…" | imagem da lente | **v4 de volta** (gráfico faturamento × caixa desenhado, com as três etiquetas) |
| 63,7–68,3 s | "Na área tributária…" | imagem | texto da v4 + **Feixes** + ícone de documento |
| 68,2–80,9 s | "Buscamos recuperar… planejamento… reforma" | três cartões de IA | **v4 de volta** (três painéis com foto) |
| 80,7–86,3 s | "Profissionais preparados para orientar… treinar sua equipe" | imagem | texto da v4 + **Feixes** + ícone de equipe |
| 86,1–90,0 s | "Tudo começa pelo diagnóstico." | imagem dos quatro passos | **Quatro passos** em HTML |
| 97,4–102,8 s | "Ative. Mais vida para sua empresa!" | pirâmide de IA | **v4 de volta** (pirâmide 3D original com a assinatura) |

## Mapa de correção — Estruturação de Capital (v5 → v6)

| Tempo | Fala | v5 | v6 |
|---|---|---|---|
| 20,0–26,6 s | "Organizamos as informações, desenhamos a estratégia e preparamos sua empresa…" | imagem dos quatro passos | **Quatro passos** em HTML (sem título, porque a fala não o diz) |
| 29,5–36,1 s | "Crédito bancário, mercado de capitais, fomento." | cartões de IA | **v4 de volta** (parede CRI / FIDC / Plano Safra / BNDES com foto) |
| 41,9–46,6 s | "Do diagnóstico ao capital no caixa, seguimos do seu lado." | imagem dos degraus | **Degraus** desenhados |
| 46,5–49,9 s | "Energia, indústria, mercado imobiliário." | fundo de IA + fichas originais | **v4 de volta** (fichas originais MW / Bremen / Conceito, logos reais) |

## Imagens de IA que ficaram fora da v6
Todas as 21 (Tributário 6, Apresentação 11, Estruturação 4). Continuam guardadas em
`*/imagens_ia_0310/` como referência. Nenhum logo redesenhado por IA aparece nos vídeos.

## Conferências
- Texto de cada cena nova conferido com a narração (nenhuma palavra fora da fala; "Do seu lado." só
  quando é dito).
- Detector de quadro parado (freezedetect −75 dB, 0,4 s): **0** nos três vídeos (Tributário 1:17,9 · Estruturação 1:07,1 · Apresentação 1:42,8).
- Quadros conferidos em tamanho cheio (1920×1080) e em prévia reduzida (384 px, equivalente ao
  celular): letras, linhas e ícones nítidos; sem rosto, mão ou documento gerado por IA.
- Volume: mesmo ganho fixo da v4; voz sem filtro.

## Site
O site público ainda **não** embute os vídeos narrados (só o vídeo da abertura, da cidade). A
proposta de seção "Vídeo institucional" (home, Soluções financeiras e Inteligência tributária) está
preparada num worktree separado (`dev/ative-site-video`, branch `video-institucional`), com
versões 720p para a web (`public/videos/`, 5,6–8,3 MB cada; hospedagem definitiva a decidir).
Prévia em desktop (1440 px) e celular (390 px): `SITE_previa_video_institucional.jpg` (também no Drive).
Nada publicado: entra no ar só com o "pode" do Jonas, pela sessão do site.
