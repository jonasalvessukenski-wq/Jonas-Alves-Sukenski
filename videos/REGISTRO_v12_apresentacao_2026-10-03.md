# Registro — Apresentação da Ative v12 (03/10/2026, ~22h50)

Correção única apontada pelo Jonas depois de assistir à v11 ("o único erro; o resto tá perfeito"): no encerramento, o
wordmark **ATIVE** apareceu no meio do símbolo dourado, à direita da pirâmide, em vez de **embaixo** dela (como na v10).
Os próximos vídeos seguem o padrão da v11/v12.

## Causa
Na montagem da v11 o comentário `// v11: ATIVE entra mais devagar…` foi colocado antes do fim da linha e engoliu a
instrução `wm2.style.transform = translate(-50%,-50%) translateY(262px…)`. Sem o deslocamento, a imagem ficou na posição
padrão (centro da tela). Erro meu de montagem, não de desenho.

## Correção (v12 = v11 + uma linha)
`inst_v12.html`: a instrução do `transform` voltou para antes do comentário. O ATIVE entra em 1,0 s, desfocado → nítido,
**262 px abaixo do centro, sob a base da pirâmide**, e sai no corte para a tela "Mais vida / para sua empresa!". Nada mais mudou.

## Render e conferências (ffmpeg)

| Nº | Item | Resultado |
|---|---|---|
| 1 | quadros | só os 32 em que o ATIVE aparece foram refeitos (quadros 2982–3013, 1:39,4–1:40,45); os outros 3.112 são os mesmos da v11 (hardlink) |
| 2 | fronteiras do trecho novo | 2981/2982 cai com a frase "Antes de qualquer negócio…" saindo em desfoque e o símbolo em movimento (diferença 103, vizinhos 86 e 76: mesmo movimento, sem salto extra; mapa de diferença conferido) · 3013/3014 cai exatamente na primeira letra digitada (235, igual à letra seguinte 238); entre letras, 0 |
| 3 | arquivo | `ATIVE_Apresentacao_v12_narrado.mp4` 1920×1080, CRF 17, 41,2 MB; `ATIVE_Apresentacao_v12_720p.mp4` 9,8 MB (celular) |
| 4 | duração · som | 1:44,80 · música sozinha −20,6 LUFS · inteiro −16,0 LUFS, pico −6,4 dBFS (idêntico à v11) |
| 5 | `freezedetect` | os mesmos 7 trechos parados de propósito da v11 (Existimos 1,8 s + 6 piscadas do cursor) |

## Arquivos
`apresentacao-ative/inst_v12.html` · `fonte/video/narr_2_Apresentacao_v12.html` · `retime.py` `CORRIDA['2_Apresentacao_v12']` (= v9) ·
`alinhar.py` · `gerar_guias.py` · quadros em `fonte/video/narr2v12_q/` · `PREVIA_Apresentacao_v12_cenas.jpg` · cópia no Drive.
v6 a v11 intactas.
