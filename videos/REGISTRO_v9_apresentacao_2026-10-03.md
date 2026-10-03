# Registro — Apresentação da Ative v9, PRÉVIA em baixa qualidade (03/10/2026, ~17h)

Correção pedida pelo Jonas sobre a v8: "tira o azul com as bolinhas coloridas do início; vai direto para o azul-bebê com o
logo branco; quando ela fala 'Ative' o logo continua igual; na próxima frase sai do logo e larga uma tela nova só com as
letras — não ponha o logo junto com a frase embaixo". A v9 parte da v8 e muda só a abertura. v6, v7 e v8 continuam intactas.

## Abertura (tempo final)

| Nº | Tempo | O que acontece |
|---|---|---|
| 1 | 0:00–0:02,1 | **direto no azul `#008DE6` com o tile branco e o símbolo**, igual à v6; tela branca, símbolo e wordmark navy completos em 2,1 s. Só música, mais alta |
| 2 | 0:02,1–0:04,1 | logo completo **segura 2 s** sozinho (respiro leve de 1,2 %); a voz entra em 3,0 s: "Esta é a Ative!" (3,04–4,3) com o logo parado na tela |
| 3 | 0:04,26–0:04,66 | o logo **sai** (desfoca e some), sem subir |
| 4 | 0:04,6 em diante | **tela nova, só a frase** "Existimos para dar mais vida à sua empresa." centrada (navy sobre branco, 70 px, o mesmo corpo da frase seguinte); a voz começa "Existimos…" em 4,36 |
| 5 | 0:07,2 em diante | sequência original da v6 (fita, "Soluções financeiras e tributárias…", círculos…) **2,0 s depois** da v6 |

Resto igual à v8: perguntas uma por tela (0:49,4 / 0:50,8 / 0:53,1), três cartões recebidos no tributário (1:10,3–1:22,8),
"Tudo começa pelo DIAGNÓSTICO" quando a narradora diz a frase (1:28,1–1:32,0), encerramento da v6.
Duração **1:44,80** (v6 + 2,0 s). Voz inteira, sem corte. Áudio com a mesma mistura medida (música +9 dB antes da voz até 2,0 s, rampa até 3,0 s).

## Prévia
`apresentacao-ative/ATIVE_Apresentacao_v9_PREVIA_baixa.mp4` — 960×540, CRF 28, 4,3 MB. Quadros em 1080p em
`fonte/video/narr2v9_q/` (311 renderizados + 2.914 reaproveitados da v8): a versão cheia é só recodificar + `retime.py audio`.

## Conferências (ffmpeg, 03/10/2026 ~17h)

| Nº | Item | Resultado |
|---|---|---|
| 1 | quadros parados (`freezedetect` −75 dB, 0,4 s) | **0** — a primeira passada acusou 1 em 2,93 s (o respiro em seno parava no pico); trocado por aproximação contínua de 2 % e refeitos os 81 quadros da segurada |
| 2 | duração | 1:44,80 (v6 1:42,80 + 2,0 s) |
| 3 | música sozinha 0–3,0 s | −20,6 LUFS, pico −10,9 dBFS |
| 4 | "Esta é a Ative!" 3,0–4,35 s | −15,2 LUFS |
| 5 | vídeo inteiro | −16,0 LUFS, pico −6,4 dBFS |
| 6 | quadros 0,5 / 1,5 / 2,1 / 3,3 / 4,2 / 4,4 / 4,7 / 5,0 / 5,8 s | tile azul → símbolo → logo completo → segura → segura → logo desfocando sozinho → frase sozinha entrando → frase. Em nenhum quadro o logo divide a tela com a frase |

## Arquivos
`apresentacao-ative/inst_v9.html` (montada por script a partir da `inst_v8.html`) · `fonte/video/narr_2_Apresentacao_v9.html` ·
`retime.py` `CORRIDA['2_Apresentacao_v9']` (D = 3,0; 1:1 → segura 2 s → 1:1) · `alinhar.py` · `gerar_guias.py` ·
`PREVIA_Apresentacao_v9_cenas.jpg` · cópia no Drive.
