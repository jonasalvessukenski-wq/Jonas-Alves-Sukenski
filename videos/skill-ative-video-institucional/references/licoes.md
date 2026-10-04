# Lições pagas (01–04/10/2026) — ler antes de qualquer render

Cada linha custou uma reprovação, um render perdido ou horas. Ordem: as que mais doeram primeiro.

| Nº | Lição | Como aconteceu | Como aplicar |
|---|---|---|---|
| 1 | **Comentário `//` no meio da linha engole o resto** | v11 (03/10) e DE NOVO v7 (04/10): o `transform` do ATIVE sumiu e ele caiu no meio do símbolo; o Jonas reprovou o final duas vezes | em `troca()` por string, só `/* … */`; depois de montar, still do encerramento lado a lado com o aprovado |
| 2 | **Zoom contínuo em texto = tremor** ("terremoto") | v10: `show()` com escala 2,5 % e câmera 3 % re-rasterizava as letras a cada quadro | texto entra, fica parado, sai; zoom só em bitmap (push de 5 % do símbolo); medir f[n]×f[n+1] |
| 3 | **Placa de vidro em CSS pinta blocos brancos** no Chromium em software (diferença 114) | v10/v11 "quadradinhos" | placa pintada uma vez em PNG (`tile_png.js`), ícone SVG por cima |
| 4 | **`filter:blur` em elemento gigante derruba o render** a 1 quadro/s | feixes de 500×1900 px na v11 | desfoque por gradiente suave |
| 5 | **Render em UMA sessão** | blocos de 100 quadros com navegador novo = pop de sub-pixel em todas as letras a cada fronteira (52 numa tela parada) | `render.js frames` uma vez por vídeo; sessão longa não degrada |
| 6 | **Emenda só em quadro sem texto** | ao refazer trecho, texto parado difere 41–90 entre sessões; fundo/feixes/3D coincidem em ≤ 3 | `refazer_trechos.py` procura YMAX ≤ 3; sem achar, render inteiro |
| 7 | **Cena com fundo opaco tapa os feixes globais** → tela morta (6 travadas) | v6_comum (passos, degraus, ondas) na Estruturação v7 | toda cena opaca tem feixes próprios (`luzes(c)`) com o mesmo movimento |
| 8 | **Imagem de IA colada vira slide** | v5 reprovada ("pior que a v4") | IA só como referência; cena desenhada em HTML/SVG; foto embaçada vira arte |
| 9 | **Prompt longo gerado por IA ≠ pedido do Jonas** | v7 da Apresentação "avacalhou a abertura" | só mexer no que ele falou com a própria voz; na dúvida, manter a estética aprovada |
| 10 | **Nada em tela fora da fala; a narração manda nas cenas** | v7/v8 da Apresentação | DIAGNÓSTICO onde a voz diz; frase nova só se ela a diz |
| 11 | **Prancha parada → número → vídeo** | v9→v10: ele escolheu P3/P5/P8 por imagem parada ("consome menos") | tela nova = prancha 1920×1080 antes do render |
| 12 | **Prévia 960×540 CRF 28 engana** | ele achou a tela FINANCEIRO "colada"; era compressão | prévia baixa só para tempo; acabamento se julga em 1080p ou still |
| 13 | **Nunca frase pequena embaixo do logo** | v7b: "ficou feio" | frase em tela própria, digitada; logo sozinho |
| 14 | **Logo e frase nunca juntos na abertura** | v8: ele pediu logo sozinho em "Esta é a Ative!" e a frase em tela nova | idem |
| 15 | **A voz não se toca** | 30/09: pausas inseridas + filtro = "muito ruim" | CORRIDA: voz inteira; D e âncoras ajustam a página; se a música precisa "subir quando ela para", é render novo com pausa, só com "pode" |
| 16 | **Música inaudível por falta de medição** | v4/v6: −48 LUFS sob a voz | medir com `ebur128` e `RETIME_MUS`; valores em `padrao-aprovado.md §6` |
| 17 | **`style.background=''` apaga o inline do HTML** | círculo sumiu na v10 | repor o valor explicitamente |
| 18 | **`freezedetect` acusa coisas legítimas** | telas brancas de frase, cursor piscando, pausa da frase digitada (0,4 s), feixe no retorno do seno | listar no registro o motivo de cada parada; só é defeito se os quadros são iguais E não é de propósito |
| 19 | **Avisos de responsabilidade em tela incomodam** | 04/10: tirou os cinco (advocacia ×2, parceiros, casos ×2) | nenhum em tela; sugerir descrição do vídeo |
| 20 | **Um vídeo por vez** | 04/10: ele pediu explicitamente | entregar, esperar o OK, só então o próximo; render do seguinte não começa antes |
| 21 | **Detecção por elemento esquece o que não conhece** | `detectar.js` com `fim2,wmEnd` partiu o encerramento em dois (faltou `gl/pfull`) | forçar o intervalo inteiro do bloco que mudou |
| 22 | **Heredoc corrompe script** | scripts gravados por `cat <<EOF` perderam caracteres | gravar com `Write`; heredoc só para texto curto |
| 23 | **`rm` do log dentro do monitor** apaga o log em uso | 04/10 madrugada | monitor só lê (`tail -F`) |
| 24 | **1080p > 30 MB não passa no chat** | SendUserFile recusou | sempre gerar e mandar a 720p; 1080p no Drive |
| 25 | **`git add -A videos` trava** (quadros e mp4) | 03/10 | adicionar arquivo por arquivo; quadros e mp4 fora do git |
| 26 | **Som desigual entre vídeos** | ganho pelo pico, sem limiter: −16,0 / −18,4 / −20,3 LUFS | decisão aberta: alvo único (−16 ou −18) com limiter; perguntar antes |
| 27 | **Borda preta "no vídeo"** era o player | 04/10: janela maximizada com barra de tarefas | medir `cropdetect` antes de mexer; explicar |

Memórias ligadas: `feedback-video-sem-zoom-continuo-em-texto`, `feedback-comentario-de-linha-engole-codigo`,
`feedback-heredoc-bash-corrompe`, `feedback-imagens-diretas-ao-assunto`, `feedback-material-externo-sem-parceiro`,
`video-quem-somos-ative`.
