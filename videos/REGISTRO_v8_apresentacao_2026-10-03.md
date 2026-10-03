# Registro — Apresentação da Ative v8, PRÉVIA em baixa qualidade (03/10/2026, fim de tarde)

A **v7** (abertura em navy escuro com símbolo 3D e cena DIAGNÓSTICO em 6 s) foi **reprovada** pelo Jonas: "avacalhou a
abertura; a abertura em azul com branco estava muito bonita; o que manda é a narração original; o diagnóstico vai onde
a narração fala dele; usa as imagens que eu mandei no lugar certo; refaz em baixa qualidade só para eu ver".
A v8 parte da **v6** e corrige isso. v6 e v7 continuam intactas.

## O que a v8 faz (tempo final)

| Nº | Tempo | Cena | Origem |
|---|---|---|---|
| 1 | 0:00–0:03,0 | **campo de ícones em navy** (o mesmo tom e o mesmo código da abertura do Tributário e da Estruturação): os ícones aparecem apagados, acendem em cor, giram para o centro e somem. Só música, mais alta | novo (código copiado de `trib_v6.html`) |
| 2 | 0:03,0–0:05,1 | **abertura original da v6**: azul `#008DE6`, tile branco com o símbolo, tela branca, símbolo + wordmark navy | v6, intacta |
| 3 | 0:05,1–0:05,7 | logo completo segura com um respiro leve (1,2 %) enquanto a voz diz "Esta é a Ative!" (4,64–5,9 s) | v6 + respiro |
| 4 | 0:05,7 em diante | **sequência original da v6, 1:1**, 3,6 s mais tarde: "Existimos para dar mais vida…", fita, "Soluções financeiras e tributárias…", círculos, financeiro, parede de instrumentos, rede, custos e resultados, gráfico… | v6 (quadros copiados) |
| 5 | 0:51,0 / 0:52,4 / 0:54,7 | perguntas **uma por tela**, máquina de escrever, troca no início de cada fala | v7 (quadros copiados) |
| 6 | 1:11,9–1:24,4 | cena do tributário (falas 15–16) com **os três cartões da imagem recebida** (RECUPERAR · PLANEJAR · A REFORMA): a imagem foi recortada em três cartões, cada um entra na sua fala (recuperar 1:12,0 · planejar 1:14,3 · reforma 1:18,9), com a mesma entrada dos painéis da v6 | imagem do Jonas (`imagens_ia_0310/cartoes_tributario_recebido_0310.jpg`) |
| 7 | 1:29,7–1:33,6 | **"Tudo começa pelo / DIAGNÓSTICO"** exatamente quando a narradora diz a frase (fala 18), no navy do campo de ícones (tom da imagem de referência), selo com documento + lupa em traço, moldura dourada fina. Substitui os quatro passos da v6 | v7, movida para o lugar certo e recolorida |
| 8 | 1:33,6 até o fim | "Uma oportunidade…", pirâmide, "Antes de qualquer negócio…", ATIVE, "Mais vida para sua empresa!" | v6 |

Duração: **1:46,40** (v6 + 3,6 s). Voz inteira, sem corte, entrando em 4,6 s. Narração original mandando em todas as cenas.

## Áudio
Mesma mistura medida da v7: música +9 dB enquanto só ela toca (0–3,4 s), descendo em rampa até a voz entrar (4,6 s);
no corpo, +4 dB em relação à v6 e sidechain mais leve (na v4/v6 a música ficava a −48 LUFS sob a voz, inaudível).
Medições na prévia: só música 0–4,6 s **−19,8 LUFS** (pico −6,7 dBFS); "Esta é a Ative!" 4,6–6 s −15,3 LUFS; vídeo inteiro **−16,1 LUFS, pico −6,1 dBFS** (sem clipping).

## Prévia em baixa qualidade
`apresentacao-ative/ATIVE_Apresentacao_v8_PREVIA_baixa.mp4` — **960×540, CRF 28** (4,4 MB), só para avaliar
ritmo e cenas. Os quadros foram renderizados em 1920×1080 (`fonte/video/narr2v8_q/`): se aprovar, a versão cheia é só
recodificar (sem render novo, ~2 min).

## Conferências
- Quadros parados (freezedetect −75 dB, 0,4 s): **0**. Duração 1:46,40.
- Montagem: 2.502 quadros copiados (v6 deslocados +108 e perguntas da v7), 690 renderizados (abertura 0–180, cartões 2150–2536, DIAGNÓSTICO 2688–2812).
- Folha de contato: `apresentacao-ative/PREVIA_Apresentacao_v8_cenas.jpg`.

## Arquivos
| O quê | Onde |
|---|---|
| Página-fonte | `apresentacao-ative/inst_v8.html` (montada por script a partir da `inst_v6.html`; cada troca conferida) |
| Página sincronizada | `fonte/video/narr_2_Apresentacao_v8.html` |
| Registro nos scripts | `retime.py` (`PAGINAS`/`CORRIDA['2_Apresentacao_v8']`: D=4,6; seg = campo parado → tile 1:1 → segura 0,6 s → 1:1), `alinhar.py`, `gerar_guias.py` |
| Imagem dos cartões | `apresentacao-ative/imagens_ia_0310/cartoes_tributario_recebido_0310.jpg` e cópia em `fonte/ia_apres/` |

## O que depende do Jonas
| Nº | Ponto |
|---|---|
| 1 | Aprovar a v8 em prévia (ou apontar cena por tempo) → aí sai a versão cheia 1080p |
| 2 | Volume da música na abertura e sob a voz (ouvir no fone e no celular) |
| 3 | A imagem "Tudo começa pelo DIAGNÓSTICO" (teal, com gráfico subindo) foi refeita em HTML no navy; se quiser a imagem original colada, dizer |
