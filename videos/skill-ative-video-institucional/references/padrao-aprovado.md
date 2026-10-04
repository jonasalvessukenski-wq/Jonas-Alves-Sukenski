# Padrão aprovado (Apresentação v12 · Estruturação v7d · Tributário v7c) — 03–04/10/2026

"A Apresentação v11/v12 é o padrão dos próximos vídeos" (Jonas, 03/10 22h55). Os outros dois foram refeitos nesse
padrão e aprovados em 04/10. Tudo abaixo foi **medido nas páginas**, não estimado.

## 1. Formato e motor
| Item | Valor |
|---|---|
| Quadro | 1920×1080, 30 fps, 16:9, sem borda (medido com `cropdetect`) |
| Vídeo | H.264 CRF 17 preset medium, yuv420p, `+faststart`; 720p CRF 22 para celular/chat |
| Áudio | AAC 48 kHz estéreo ~196 kb/s |
| Motor | página HTML + JS, `render(t)`, fotografada quadro a quadro pelo Playwright 1.63 (Chromium SwiftShader, `render.js`) |
| Fontes | Manrope (Bold/SemiBold/ExtraBold em `fonte/assets/*.ttf`, carregadas locais); Poppins ExtraBold só em título de rede social |
| 3D | símbolo dourado (`logo3d_simbolo.png`, `piramide*.png`) animado por `window.render3d(ang, escala, T)` com three.js |

## 2. Paleta do vídeo (exceção à paleta navy/creme dos PDFs)
| Uso | Cor |
|---|---|
| Azul identidade (fundo das telas de serviço, tile da abertura da Apresentação) | `#008DE6` |
| Navy escuro (abertura Estr/Trib, telas de número, fundo do encerramento: `bgEnd` quase preto) | `#000050` |
| Texto | branco; sobre tela branca, navy |
| Cursor da máquina de escrever | ciano `#2FE1F2` |
| Fio/régua dourada (64×5 px, raio 3) | `#C9A24B` |
| Tela branca P3 | branco/creme `#F3F0EB`, destaque azul `#008DE6` |
| Ícones de traço | branco 1,5–2 px; nunca preenchidos |

Proibido: verde, degradê chamativo, azul royal `#1A2B9E`, serifa (exceto placa "ATIVE CAPITAL" filmada real).

## 3. Abertura
**Estruturação e Tributário:** fundo navy com feixes de luz (gradiente suave, movimento seno lento) e a **pergunta do
gancho digitada** ("Se a sua empresa tem um faturamento alto, por que o caixa continua apertado?") ; voz entra em **1,5 s** (`D=1.5`).
Pergunta: uma por tela, máquina de escrever ~28–60 ms/letra, cursor ciano pisca e some; a anterior sai 0,22 s antes.

**Apresentação:** direto no azul `#008DE6` com o tile branco e o símbolo; o logo fica **sozinho** enquanto ela diz
"Esta é a Ative!" (voz em **3,0 s**, logo segura 2,1–4,1 s com aproximação contínua de 2 % — zoom só em bitmap); sai; e
"Existimos para dar mais vida à sua empresa." vem **em tela nova, só texto** (P3), nunca junto com o logo.
Sem campo de ícones coloridos antes (reprovado em 03/10: "azul com bolinhas coloridas").

## 4. Telas (pranchas escolhidas por ele em 03/10, P3/P5/P8)
| Tela | Desenho |
|---|---|
| **P3 frase** | fundo branco, texto Manrope 104 px navy, palavra-chave em azul `#008DE6`, fio dourado em cima |
| **P5 serviço** | azul `#008DE6`, luz/feixes e vinheta, **fita** branca + dourada com o nome do serviço; círculos navy/ciano/branco sobre o azul (quem abre é o círculo FINANCEIRO navy) |
| **P8 painel** | navy, **placa de vidro em PNG** (`fonte/assets/tile_vidro.png`, pintada uma vez por `tile_png.js`), gráfico/ícone SVG por cima |
| P6 (decisão minha, mantida) | mesma placa em azul para CUSTOS / TRIBUTÁRIO / REFORMA — alterna azul/marinho |
| Números | navy, número grande branco com destaque ciano ("+**70** empresas"), fade de 0,3 s |
| Parede de parceiros / painéis | desenhados (gradiente + ícone em traço + logos reais), nunca foto embaçada |
| Cenas de processo (`v7_comum.js`) | **passos** (quatro etapas numeradas), **degraus**, **ondas**, **fita**, **motivo** — cada uma com **feixes próprios** (`luzes(c)`), porque o fundo delas é opaco |
| Cartões de caso | três cartões brancos com cabeçalho-imagem, valor em destaque, linhas OPERAÇÃO/SITUAÇÃO/ORIGINAÇÃO; sem rodapé legal |
| **Cartões ilustrados** (elogiado 04/10 09h50, "muito bom") | cartão 560×680 navy com borda fina; em cima ilustração **desenhada em SVG** (560×440, luz radial, arco dourado no canto) animada pelo tempo da página; embaixo painel escuro com rótulo ciano em caixa alta (21 px, espaçamento 6) e frase branca Manrope 38 px, texto parado. Exemplos prontos: documento com varredura e moedas (RECUPERAR), tablet com barras + linha + caneta (PLANEJAR), equipe à mesa com notebook e selo (A REFORMA). Script: `scripts/exemplos/montar_previa_cartoes.py` |

Movimento permitido: entrada por desfoque/translação (0,35–0,6 s), saída por desfoque; feixes de luz atrás (gradiente,
**sem** `filter:blur`), brilhos grandes lentos (`ambG`). Texto **parado** enquanto está na tela.

## 5. Encerramento (idêntico nos três; tempos relativos à voz)
Sequência medida em `fimReal(T)` (Estr/Trib) e `fimTela` (Apres). `FA` = início da fala de confiança, `FB` = início de "Ative.".

| Nº | Quando | O que acontece |
|---|---|---|
| 1 | FA − 0,3 s | navy dos números dissolve para `bgEnd` (quase preto com luz azul difusa) |
| 2 | FA + 0,1 s | tela própria entra (0,35 s, desfoque 10 px → 0): fio dourado 64×5 centrado, 40 px acima da frase |
| 3 | FA + 0,25 s | frase **digitada** com a voz, 0,06 s por letra (ou menos, para terminar 0,5 s antes de FB), Manrope 800, **108 px**, duas linhas, espaçamento −2,2 px; cursor ciano 8×92 px, pisca a cada 0,45 s ao terminar |
| 4 | FB − 0,3 s | frase sai em desfoque (10 px) em 0,3 s |
| 5 | P0 = FB − 0,2 s | símbolo 3D entra: 3 voltas desacelerando em 1,8 s, nitidez em 0,45 s (desfoque 12 → 0), escala 0,62 → 1 |
| 6 | P0 + 1,6 → 2,15 s | troca para a imagem completa (`pfull`), que ganha **push de 5 %** até o fim (zoom em bitmap, permitido) |
| 7 | P0 + 2,1 → 3,05 s | brilho (`shine`) atravessa o símbolo |
| 8 | P0 + 2,15 → 3,15 s | **ATIVE** (wordmark branco) entra desfocado → nítido, **262 px abaixo do centro**, sob a base da pirâmide |
| 9 | fim da voz + **4,0 s** | corte (a música faz fade de 1,5 s); ATIVE fica parado ~1,9 s |

Frases: Estruturação "Toda parceria / começa com confiança." (62,7–65,7 s); Tributário "Antes de qualquer negócio, /
existe confiança." (72,4–75,7 s). Na **Apresentação** a voz termina com a assinatura, então a ordem é: ATIVE 1,0 s sob
a pirâmide e corte para "Mais vida / para sua empresa!" digitada em **140 px**. Regra geral: a frase digitada fica onde a
voz a diz; "Ative." é sempre símbolo girando + ATIVE; **nunca frase pequena embaixo do logo**.

## 6. Som (mistura medida, `retime.py` CORRIDA)
| Parâmetro | Valor aprovado |
|---|---|
| Voz | inteira, sem filtro/compressão; ganho fixo pelo pico da mix (sem limiter) |
| Música | `fonte/audio/musica_sem_voz.wav` (136 bpm; acima de 63 s repete trecho no compasso com crossfade de 1 s); v13 da Apresentação usa MorningLight "Uplifting & Inspiring" 130 bpm (licença a conferir) |
| `abre=(9.0, 0.8, 1.5)` | música +9 dB antes da voz, rampa de 0,8 s terminando quando a voz entra |
| `mus_db=4` | música +4 dB no corpo em relação à v6 |
| `duck=(0.05, 2.5)` | sidechain leve: limiar 0,05, razão 2,5 (ataque 60 ms, soltura 600 ms) → música ~12 dB abaixo quando ela fala |
| `fim=4.0` | segura 4 s depois da voz (Apres v12: 2,5) |
| Medidas de referência | música sozinha na abertura −20 LUFS; sob a voz −26 a −32 LUFS; mix integrada Apres −16,0 · Estr −18,4 · Trib −20,3 LUFS (**igualar é decisão aberta**); pico −0,9 a −6 dBFS |

## 7. Arquivos de referência (copiar daqui, não reinventar)
| O quê | Onde |
|---|---|
| Página padrão completa (abertura azul, P3/P5/P8, perguntas, encerramento) | `apresentacao-ative/inst_v12.html` (+ `fonte/video/v6_comum.js`) |
| Página com abertura navy + pergunta digitada e `fimReal` | `estruturacao-de-capital/fonte/video/v10.html`, `tributario/trib_v7.html` |
| Cenas de processo com feixes próprios | `fonte/video/v7_comum.js` (+ `v6_comum.css`) |
| Placa de vidro PNG e gerador | `fonte/assets/tile_vidro.png`, `fonte/video/tile_png.js` / `tile_png.html` |
| Símbolo 3D, pirâmide, wordmark | `fonte/assets/logo3d_simbolo.png`, `piramide*.png`, `ative_wordmark_navy.png`, `logo_vertical_branco.png` |
| Montagem por troca de string (como as páginas v7 nasceram da v9/trib_v6) | `scripts/exemplos/montar_v7_outros.py`, `patch_v7c.py` |
| Pranchas paradas para escolha | `fonte/video/pranchas_apres_1003.html` + `pranchas.js` |
| Tempo da voz | `narracao/retime.py` (`PAGINAS`, `CORRIDA`), `alinhar.py`, `pausas.py`, `gerar_guias.py` (`VIDEOS` = falas) |
| Trilha nova sobre mix | `narracao/trocar_trilha.py` |
