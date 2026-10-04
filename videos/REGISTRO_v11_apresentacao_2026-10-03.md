# Registro — Apresentação da Ative v11, versão cheia 1080p (03/10/2026, noite)

Revisão pedida pelo Jonas depois de assistir à v10 ("ficou ótimo, o tempo ficou ótimo"): (1) "alguns quadradinhos e
algumas frases estão tremendo demais, parece terremoto"; (2) no final, ATIVE "mais devagarzinho" e, quando ela diz a
próxima frase, encerrar numa tela nova só com a frase, bem grande, digitada como as perguntas — nunca a frase embaixo do
logo; (3) as imagens da parede de instrumentos (CRI, fundos…) estão embaçadas: refazer. A v11 parte da v10 (mesmo tempo,
mesma voz, mesma mistura). v6 a v10 continuam intactas.

## 1. O tremor — causa e correção

| Nº | O que era | Causa encontrada | Correção |
|---|---|---|---|
| 1 | frases "tremendo" | toda frase tinha um **zoom lento contínuo de 2,5 %** (e os títulos de área, 3 % na câmera). A cada quadro o texto era rasterizado numa escala um pouquinho diferente, e as bordas das letras mudavam de lugar por sub-pixel — na tela isso aparece como tremor. Medido com mapa de diferença entre quadros consecutivos: as bordas das letras acendiam em todas as telas de texto | zoom contínuo retirado de todo texto e caixa (frases, títulos, círculos, cartões da rede, cena DIAGNÓSTICO). O texto entra, **fica parado** e sai. Mapa de diferença refeito: bordas apagadas |
| 2 | "quadradinhos" (placas de vidro dos títulos) | além do zoom, um defeito real de pintura: o Chromium em modo software pintava **blocos brancos de borda dura dentro da placa**, mudando de largura a cada quadro (visto no recorte de quadros consecutivos; diferença máxima 114/255 dentro da placa). A placa era desenhada por CSS (gradiente translúcido + borda + sombras) e repintada por partes a cada quadro | a placa passou a ser **uma imagem pintada uma vez** (`assets/tile_vidro.png`, gerada por `tile_png.js` do mesmo CSS); o ícone em traço continua em SVG por cima. Teste refeito nos mesmos 42 quadros: diferença máxima caiu para 32 (só o feixe passando atrás do vidro); visualmente estável |
| 3 | tela "morta" sem o zoom | sem o zoom, telas só de texto ficariam congeladas | **dois feixes de luz lentos** (desfocados, 14 s de período) atrás de tudo em todas as telas azuis e navy: a tela respira sem mexer no texto |

## 2. Parede de instrumentos (0:19–0:22,6)
As fotos dos 13 cartões tinham ~1180×310 px e 12–43 KB (muito comprimidas) — por isso embaçadas. Viraram **arte desenhada**:
gradiente em três tons da paleta (navy → azul, azul → ciano, navy profundo), feixe suave e um ícone em traço por
instrumento (prédio, trigo, moedas, título com selo, ciclo, escudo, lâmpada, banco), com a etiqueta de vidro de antes.
Nítido em qualquer zoom; nada colado.

## 3. Encerramento (1:36,3 em diante)

| Nº | Tempo | O que acontece |
|---|---|---|
| 1 | 1:36,3–1:39,5 | símbolo 3D dourado + "Antes de qualquer negócio, existe confiança." (igual) |
| 2 | 1:39,4–1:40,4 | **ATIVE** (wordmark branco) entra **em 1,0 s** (era 0,6 s), quando ela diz "Ative." |
| 3 | 1:40,15–1:40,45 | símbolo e ATIVE saem (desfoque curto) |
| 4 | 1:40,4–1:42,0 | **tela nova**: "Mais vida / para sua empresa!" em 140 px, branco, fio dourado em cima, **digitada** a 60 ms por letra (termina junto com a voz); cursor ciano pisca até o fim |
| 5 | 1:42,0–1:44,8 | frase completa, cursor piscando; música fecha |

A frase é a da narração ("Mais vida para sua empresa!", assinatura da marca) — não "Existimos para dar vida", para não pôr
na tela palavra que a narradora não diz. A voz não foi pausada entre "Ative." e "Mais vida": o ATIVE fica ~1 s na tela,
o tempo que a fala dá.

## Conferências (ffmpeg, 03/10/2026 ~21h)

| Nº | Item | Resultado |
|---|---|---|
| 1 | arquivo | `ATIVE_Apresentacao_v11_narrado.mp4` — 1920×1080, 30 fps, CRF 17, 41,2 MB; cópia `_720p.mp4` 9,8 MB para o celular |
| 2 | duração · som | 1:44,80 · música sozinha −20,6 LUFS · inteiro −16,0 LUFS, pico −6,4 dBFS (igual à v10) |
| 3 | tremor (mapa de diferença entre quadros consecutivos, ×10) | telas de texto paradas: bordas das letras apagadas (na v10 acendiam todas) |
| 4 | placa de vidro (diferença máxima dentro da placa, quadros consecutivos) | v10/primeira v11: 114/255 (blocos brancos) → final: ≤ 32 nas quatro cenas (só o feixe passando atrás do vidro) |
| 5 | `freezedetect` −75 dB, 0,4 s | **7 trechos parados, todos de propósito**: 1 na tela "Existimos…" (texto parado sobre branco, 1,8 s, sem zoom) e 6 na tela final entre as piscadas do cursor (0,45 s cada). Nenhum quadro travado por erro |
| 6 | render | a 1ª tentativa caiu por tempo de captura (feixes com `filter:blur` em elemento gigante → 1 quadro/s e um quadro > 30 s); feixes refeitos com gradiente suave sem filtro e `render.js` com limite de 180 s por quadro |
| 7 | falso alarme e correção de rota | depois da placa em imagem, uma medição apontou 109–112 nas cenas 3 e 4; atribuí a "cache de pintura da sessão longa" e refiz o render com navegador novo a cada 100 quadros. Medindo par a par ficou claro que os 109–112 eram a **saída desfocada do título** dentro da janela medida (legítima), e que o navegador novo a cada bloco criava um defeito novo: na fronteira de cada bloco todas as letras mudavam de sub-pixel (diferença 52 numa tela parada = um pop a cada 3,3 s). Render definitivo em **uma sessão só** do navegador; medição final na linha 8 |
| 8 | pares de quadros parados no render final (diferença máxima 0–255; entrada e saída fora da janela) | "Existimos" (texto sobre branco) 160/161, 198/199, **199/200 (antiga fronteira)**, 200/201: **0** (no render em blocos a fronteira dava 52) · placa FINANCEIRO 440/441: 11, 499/500: 31, 520/521: 30 · placa TRIBUTÁRIO 2020–2100: 6–24 · placa REFORMA 2550–2635: 6–7 · selo DIAGNÓSTICO 2720–2801: 6–8 · tela final digitada 3100/3101, 3120/3121: 0. Os únicos valores altos medidos são movimento de propósito: círculo TRIBUTÁRIO entrando (330/331: 146), título FINANCEIRO entrando (420/421: 181), letra sendo digitada/cursor (3099/3100: 169) |

## Arquivos
`apresentacao-ative/inst_v11.html` (montada por script a partir da `inst_v10.html`) · `fonte/video/narr_2_Apresentacao_v11.html` ·
`retime.py` `CORRIDA['2_Apresentacao_v11']` (= v9) · `alinhar.py` · `gerar_guias.py` · `ATIVE_Apresentacao_v11_narrado.mp4` (1080p) ·
`ATIVE_Apresentacao_v11_720p.mp4` (celular) · `PREVIA_Apresentacao_v11_cenas.jpg` · quadros em `fonte/video/narr2v11_q/` (3.144, todos novos) · cópia no Drive.
