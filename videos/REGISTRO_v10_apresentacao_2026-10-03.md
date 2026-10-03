# Registro — Apresentação da Ative v10, versão cheia 1080p (03/10/2026, noite)

Depois da prévia v9, o Jonas escolheu entre as 8 pranchas paradas (`apresentacao-ative/pranchas_2026-10-03/`):
**P3** para "Existimos…" (branco, letra maior), **P5** para "Soluções…" (azul da marca) e **P8** para FINANCEIRO
(azul-marinho, placa de vidro com o gráfico). Pediu o vídeo completo, "caprichando na qualidade dessas imagens".
A v10 parte da v9 (mesmo tempo, mesma voz, mesma mistura de som) e muda só essas telas. v6 a v9 continuam intactas.

## O que mudou (tempo final)

| Nº | Tempo | Tela | Como ficou |
|---|---|---|---|
| 1 | 0:04,6–0:07,2 | "Existimos para dar mais vida à sua empresa." | prancha P3: branco, Manrope 800 em 104 px (era 70), "mais vida" em azul `#008DE6`, fio dourado em cima, brilho azul suave atrás |
| 2 | 0:06,9–0:13,2 | "Soluções financeiras e tributárias…" | prancha P5: fundo azul `#008DE6` com luz difusa, feixes e vinheta; letra branca 80 px com fio dourado; a fita que se desenha embaixo ficou branca + dourada (era navy + dourada sobre branco) |
| 3 | 0:10,2–0:13,2 | três círculos FINANCEIRO · RESULTADOS · TRIBUTÁRIO | sobre o azul: navy, ciano e **branco** (o terceiro era azul e sumiria no fundo). Quem abre a tela agora é o círculo **FINANCEIRO** (navy), que cresce e vira o fundo do título seguinte |
| 4 | 0:13,2–0:19,0 | título FINANCEIRO | prancha P8: azul-marinho, placa de vidro com o gráfico (barras + linha ciano) que se desenha, fio dourado, etiqueta e frase em 80 px; aproximação lenta da câmera |
| 5 | 0:36,0–0:40,5 | título CUSTOS E RESULTADOS | mesmo desenho sobre o azul (P6), ícone lupa com barras |
| 6 | 1:05,8–1:10,3 | título TRIBUTÁRIO | mesmo desenho, ícone documento com check |
| 7 | 1:22,8–1:28,2 | título REFORMA TRIBUTÁRIA | mesmo desenho, ícone equipe |

Os títulos 5–7 ficaram no azul (não no marinho) para manter a alternância azul / marinho que o vídeo já tinha: cada um
é seguido de uma cena em marinho (gráfico, cartões, DIAGNÓSTICO). Só o FINANCEIRO é marinho, como escolhido, e a
parede de instrumentos volta ao azul logo depois.

Tudo o mais é a v9: abertura direto no azul com o tile, logo sozinho até "Esta é a Ative!", perguntas uma por tela,
cartões recebidos no tributário, DIAGNÓSTICO na fala 18, encerramento. Duração **1:44,80**. Voz inteira, sem corte.

## Qualidade
Quadros em 1080p (JPEG 95) → H.264 CRF 17, preset medium, 30 fps. A tela FINANCEIRO nunca foi imagem colada: é
desenhada na página; na prévia 960×540 (CRF 28) ela parecia pobre pela compressão e pelo desenho simples da v6.

## Conferências (ffmpeg, 03/10/2026 ~19h)

| Nº | Item | Resultado |
|---|---|---|
| 1 | arquivo | `ATIVE_Apresentacao_v10_narrado.mp4` — 1920×1080, 30 fps, 38,5 MB |
| 2 | quadros parados (`freezedetect` −75 dB, 0,4 s) | **0** |
| 3 | duração | 1:44,80 (igual à v9) |
| 4 | música sozinha 0–3,0 s · "Esta é a Ative!" · vídeo inteiro | −20,6 LUFS · −15,2 LUFS · −16,0 LUFS (pico −6,4 dBFS) — mesma mistura da v9 |
| 5 | quadros 5,5 / 7,7 / 10,0 / 11,6 / 12,85 / 13,1 / 13,4 / 14,6 / 37,6 / 67,0 / 84,6 s | Existimos (P3) → Soluções sobre o azul com fita → círculos navy/ciano/branco → círculo FINANCEIRO crescendo → tela toda navy (sem flash azul) → placa entrando → FINANCEIRO (P8) → CUSTOS → TRIBUTÁRIO → REFORMA; quadro 1080p da cena FINANCEIRO extraído do mp4 final: nítido |
| 6 | correção no caminho | na 1ª montagem o círculo FINANCEIRO ficou sem fundo (`style.background=''` apagou o navy inline); corrigido antes do render |

## Arquivos
`apresentacao-ative/inst_v10.html` (montada por script a partir da `inst_v9.html`) · `fonte/video/narr_2_Apresentacao_v10.html` ·
`retime.py` `CORRIDA['2_Apresentacao_v10']` (= v9) · `alinhar.py` · `gerar_guias.py` · `ATIVE_Apresentacao_v10_narrado.mp4` ·
`PREVIA_Apresentacao_v10_cenas.jpg` · quadros em `fonte/video/narr2v10_q/` (892 renderizados + 2.252 reaproveitados da v9) · cópia no Drive.
