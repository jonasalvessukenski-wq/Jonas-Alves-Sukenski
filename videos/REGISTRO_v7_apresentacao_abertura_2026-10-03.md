# Registro de alterações — Apresentação da Ative v7 (03/10/2026, tarde)

Versão de revisão feita a partir da **v6** (`apresentacao-ative/ATIVE_Apresentacao_v6_narrado.mp4`, 1:42,8),
seguindo o brief "Ative Presentation V6 — Video Editing and Motion Design" recebido em 03/10/2026.
A v6, a v5 e a v4 continuam intactas nos mesmos lugares.

## Fonte conferida

| Item | Valor |
|---|---|
| Arquivo de origem | `apresentacao-ative/ATIVE_Apresentacao_v6_narrado.mp4` (22,6 MB) |
| Duração | 1:42,80 |
| Vídeo | 1920×1080, 16:9, 30 fps, H.264 |
| Áudio | AAC 48 kHz estéreo, 196 kb/s |
| Voz | `narracao/voz_bruta/vozC_aline.wav` (Aline, 1:39,47, 16 kHz mono) — entra inteira, sem corte, filtro ou aceleração |
| Bordas pretas | **não há**: medi a luminância das bordas em 14 quadros (0,5 s a 100,5 s); o que aparece escuro é o próprio fundo navy `#000050` e o fundo quase preto do encerramento. Nada foi esticado nem recortado |
| Abertura original | logo da v6 sozinho de 0,1 a 2,36 s (≈2,3 s; o brief falava em 3 s) e, com a frase "Existimos para dar mais vida…", até 5,22 s |

## O que mudou (v6 → v7)

| Nº | Trecho (tempo final) | v6 | v7 |
|---|---|---|---|
| 1 | 0:00–0:06 abertura | fundo azul, tile branco com o símbolo, tela branca, wordmark navy | **fundo navy contínuo** com luz quente larga que atravessa devagar; **símbolo 3D navy + dourado** (`logo3d_simbolo.png`, o mesmo da v4/v6) revelado em 0–0,85 s com halo e profundidade; **ATIVE branco** (`wordmark_branco_limpo.png`) em 0,45–1,05 s; nome parado e legível de 1 a 3 s; **"Mais vida para sua empresa!"** em ciano `#3FC3F7` (a cor da assinatura final) em 3,0–3,7 s; composição completa parada de 4 a 6 s; saída em 5,55–6,0 s |
| 2 | 0:06–0:14,85 cena 2 | "Existimos para dar mais vida à sua empresa." e "Soluções financeiras e tributárias…" com a fita navy/dourada | **"Tudo começa pelo" / "DIAGNÓSTICO"** (texto HTML, Manrope, acento correto), selo navy com anel dourado e ícone em traço de documento + lupa (desenhado progressivamente), moldura dourada fina que se desenha, dois feixes de luz lentos, leve aproximação de câmera. Sem gráfico subindo. Nada da abertura fica por baixo (camadas separadas, conferido quadro a quadro na saída) |
| 3 | 0:14,5–0:14,85 | — | o azul da cena "Na área financeira" entra por baixo enquanto a cena 2 sai (transição contínua, sem corte seco) |
| 4 | 0:51,0 / 0:52,4 / 0:54,7 perguntas | as três frases empilhadas, a anterior ficando a 38 % | **uma pergunta por tela**, em máquina de escrever (28 ms por letra: 0,64 s, 0,84 s e 1,18 s), cursor ciano que pisca e some; a tela troca no início de cada fala; a anterior sai em 0,22 s antes da próxima (sem sobreposição); luz azul suave atravessando o fundo |
| 5 | tudo o mais | — | igual à v6, deslocado **+3,6 s** (quadros copiados da v6, não re-renderizados) |

## Narração e tempo

- A voz entra em **4,6 s** (na v6 entrava em 1,0 s). "Esta é a Ative!" é dita de 4,64 a ~5,9 s, com o logo, o nome e a
  assinatura completos na tela; "Existimos para dar mais vida à sua empresa." começa em 6,06 s, junto com a cena 2.
- Isso cumpre a abertura de 6 s **sem inserir pausa dentro da gravação** (regra 1: nunca cortar, pausar ou acelerar a voz).
  A alternativa literal do brief (frase em 0 s e silêncio até 6 s) exigiria abrir um corte na gravação depois de "Ative." — fica como decisão do Jonas.
- Duração final: **1:46,40** (3.192 quadros a 30 fps) = 1:42,80 + 3,6 s. Nenhuma fala perdida, duplicada ou acelerada.
- Mapa fonte → final: tudo da v6 a partir de 11,25 s está em v6 + 3,6 s. Perguntas: v6 47,39 / 48,79 / 51,12 → v7 50,99 / 52,39 / 54,72. "Tudo começa pelo diagnóstico." (quatro passos): v6 86,12 → v7 89,72. Assinatura final: v6 97,55 → v7 101,15.
- Transcrição conferida com faster-whisper (modelo base) nos trechos 0–6 s e 45,5–55 s da voz: "Esta é a Ative. Existimos para dar mais vida à sua empresa." e "onde estão os gargalos / o que pode ser mais eficiente? / Quais custos estão consumindo o resultado?" — o texto na tela é a frase completa, igual ao roteiro aprovado.

## Áudio

- Música: a mesma trilha em laço cortado no compasso (136 bpm), estendida para 1:46,4; fade de saída de 1,5 s; sem buraco nem emenda audível (laço com crossfade de 1 s).
- **Medição que mudou o plano:** na v4/v6 a música ficava a **−40 LUFS** sozinha (0–1 s) e **−48 LUFS** sob a voz — na prática
  inaudível (a trilha entrava a −6 dB e o sidechain a derrubava mais ~20 dB). O brief pede música com presença antes da voz e
  audível por baixo dela, então a v7 tem mistura nova, medida em vez de arbitrada:
  - música +4 dB em relação à v6 no corpo do vídeo; antes da voz (0–3,0 s) mais **+9 dB** (a introdução da trilha é baixa),
    descendo em rampa suave de 3,0 a 4,6 s — termina exatamente quando a voz entra, sem salto;
  - sob a voz, sidechain mais leve (limiar 0,05, razão 2,5, ataque 60 ms, soltura 600 ms): a música desce ~12 dB quando a
    narradora fala e volta devagar nas respirações.
- Voz sem filtro, sem compressão; ganho fixo medido na mistura (alvo −16 LUFS integrado, pico abaixo de −1 dBFS).
- Medições na saída (`ebur128`, trecho a trecho):

| Trecho | Mistura | Só a música (medida à parte, com o mesmo ganho) |
|---|---|---|
| 0–4,6 s, abertura só com música | −20,0 LUFS, pico −7,6 dBFS | −20,0 LUFS |
| 4,6–6,1 s, "Esta é a Ative!" | −15,6 LUFS | −31,6 LUFS (16 dB abaixo da voz) |
| 6,1–14,8 s, cena 2 | −15,6 LUFS | −32,0 LUFS |
| 51–57,7 s, perguntas | −15,9 LUFS | −31,3 LUFS |
| vídeo inteiro | **−16,1 LUFS, pico −6,1 dBFS** (sem clipping) | −29,1 LUFS |

- Não ouvi no fone nem no celular (não tenho como): os números acima são medição, não escuta. O Jonas decide se a música sobe ou desce.

## Conferências

- Quadros parados (freezedetect −75 dB, 0,4 s): **0**. Duração conferida: 1:46,40. Vídeo 1920×1080, 30 fps, H.264 CRF 18; áudio AAC 192 kb/s 48 kHz. Arquivo de 28,4 MB.
- Montagem: 2.527 quadros copiados da v6 (idênticos, só deslocados) + 665 renderizados (abertura/cena 2: 0–450; perguntas: 1527–1742). Render leve, ~4 min, 2 threads.
- Quadros conferidos em tamanho cheio (1920×1080) e em prévia reduzida (contato 480 px): abertura, cena 2, transição para o azul, as três perguntas, quatro passos.
- Fontes: só Manrope (600/700/800). Cores: navy, azul `#008DE6`, ciano `#2FE1F2`/`#3FC3F7`, dourado `#C9A24B` só como fio (anel do selo e moldura).
- Nenhuma imagem gerada por IA entrou. As duas imagens recebidas em 03/10 (três cartões do tributário; "Tudo começa pelo DIAGNÓSTICO") foram usadas só como referência de composição.

## Arquivos

| O quê | Onde |
|---|---|
| Página-fonte v7 | `apresentacao-ative/inst_v7.html` |
| Página sincronizada | `estruturacao-de-capital/fonte/video/narr_2_Apresentacao_v7.html` (gerada por `retime.py pagina 2_Apresentacao_v7`) |
| Quadros | `estruturacao-de-capital/fonte/video/narr2v7_q/` (fora do git) |
| Vídeo mudo | `estruturacao-de-capital/fonte/video/narr2v7_q.mp4` (fora do git) |
| **Vídeo de revisão** | `apresentacao-ative/ATIVE_Apresentacao_v7_narrado.mp4` |
| Folha de contato | `apresentacao-ative/PREVIA_Apresentacao_v7_cenas.jpg` (1 quadro a cada 3 s) |
| Registro em `retime.py` | `PAGINAS['2_Apresentacao_v7']`, `CORRIDA['2_Apresentacao_v7']` (D = 4,6 s; `abre` = música +9 dB antes da voz; `mus_db` = +4; `duck` = (0,05, 2,5); página parada em 0 até 14,5 s e 1:1 a partir de 10,9). Os parâmetros novos têm padrão igual ao antigo: v4/v5/v6 não mudam se forem regeradas |
| Cópia no Drive | `G:\Meu Drive\Ative — Vídeos institucionais\` (v7, prévia e este registro) |
| Registro em `alinhar.py` / `gerar_guias.py` | `AUDIO['2_Apresentacao_v7'] = '2v4'`, `VIDEOS['2_Apresentacao_v7']` |

## O que depende do Jonas

| Nº | Ponto |
|---|---|
| 1 | A cena 2 ("Tudo começa pelo DIAGNÓSTICO", 6–14,85 s) toca enquanto a voz diz "Existimos para dar mais vida à sua empresa. Com soluções financeiras e tributárias…". A frase "Tudo começa pelo diagnóstico" é dita em 1:29,7 (cena dos quatro passos). Manter como o brief pede, mover para 1:29,7, ou as duas? |
| 2 | Voz inteira entrando em 4,6 s (feito) × frase "Esta é a Ative!" em 0 s com silêncio inserido até 6 s (exige corte na gravação) |
| 3 | Nível da música na abertura (+3 dB) — ouvir no fone e no celular e dizer se sobe ou desce |
| 4 | Site, Drive e publicação: nada foi substituído; a v7 é versão de revisão |
