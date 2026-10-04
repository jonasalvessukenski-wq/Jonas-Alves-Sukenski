---
name: ative-video-institucional
description: 'Vídeo institucional animado da Ative no padrão APROVADO pelo Jonas em 03–04/10/2026 (Apresentação v12, Estruturação de Capital v7d, Tributário v7c): página HTML renderizada quadro a quadro pelo Playwright, narração gravada intacta comandando o tempo, encerramento com frase digitada + símbolo girando + ATIVE sob a pirâmide. Use para qualquer vídeo novo da Ative (institucional, serviço, campanha, home equity, Quem somos), para alterar um dos três existentes ou para "aplicar o padrão dos vídeos". Edição simples de arquivo pronto (corte, legenda, Reels): video-ative.'
---

# Vídeo institucional Ative — o modelo aprovado

Quatro dias de trabalho (01–04/10/2026), três vídeos aprovados ("todos perfeitos", "fizemos um bom trabalho").
Esta skill guarda **o que ficou aprovado, como se produz e o que não se repete**. O Jonas é analista, não
programador: conduza em português, entregue arquivo pronto, decisões dele por número.

| Vídeo | Arquivo aprovado | Página-fonte | Duração |
|---|---|---|---|
| Apresentação da Ative | `apresentacao-ative/ATIVE_Apresentacao_v12_narrado.mp4` (v13 = v12 + trilha nova, aguarda ele ouvir) | `apresentacao-ative/inst_v12.html` | 1:44,8 |
| Estruturação de Capital | `estruturacao-de-capital/ATIVE_Estruturacao_de_Capital_v7_narrado.mp4` (v7d) | `estruturacao-de-capital/fonte/video/v10.html` | 1:10,5 |
| Inteligência Tributária | `tributario/ATIVE_Tributario_v7_narrado.mp4` (v7c) | `tributario/trib_v7.html` | 1:20,57 |

Tudo em `C:\Users\Jonas\dev\Jonas-Alves-Sukenski\videos` (branch `claude/jolly-babbage-qoj0xh`); cópias em
`G:\Meu Drive\Ative — Vídeos institucionais`. Cópia desta skill versionada no repo em `videos/skill-ative-video-institucional/`.

## Leia antes de mexer
1. `references/padrao-aprovado.md` — o desenho que ele aprovou: abertura, telas, cenas, encerramento (tempos exatos), som.
2. `references/pipeline.md` — voz → página → retime → render → áudio → conferência → entrega, com os comandos.
3. `references/licoes.md` — as 20 lições pagas com reprovação. **Obrigatório** antes de qualquer render.
4. `references/historico.md` — versões, commits, decisões e pendências abertas.

## Regras do Jonas (invioláveis)
| Nº | Regra | Origem |
|---|---|---|
| 1 | **A voz manda.** Narração gravada entra inteira: nunca cortar, pausar, filtrar, acelerar. O vídeo se ajusta a ela (`retime.py`, modo CORRIDA) | 01/10 |
| 2 | **Nada em tela fora da fala.** Texto na tela é a frase que a narradora diz, onde ela diz | 03/10 |
| 3 | **Imagem de IA só como referência.** Cena é desenhada em HTML/SVG/CSS; foto embaçada vira arte desenhada | 03/10 (v5 reprovada) |
| 4 | **Cores:** azul identidade `#008DE6`, navy `#000050`, branco; cursor ciano `#2FE1F2`; fio dourado `#C9A24B`. Manrope. (Vídeo é exceção à paleta navy/creme dos PDFs) | aprovado v9–v12 |
| 5 | **Texto parado.** Entra, fica, sai. Nunca zoom/escala contínua em texto, ícone ou caixa com borda | 03/10 ("terremoto") |
| 6 | **Encerramento único** nos três: frase de confiança digitada em tela própria → desfoque → símbolo girando no "Ative." → ATIVE sob a pirâmide → 4 s de respiro. Nunca frase pequena embaixo do logo | 04/10 |
| 7 | **Sem aviso de responsabilidade em tela** (parceiros, casos, advocacia): vai para a descrição do vídeo | 04/10 |
| 8 | **Sem parceiro** (Proma, Dr. Sérgio, Lions) e sem coworking aparente | 30/09 |
| 9 | **Números públicos:** +70 empresas, 18 estados, +30 instituições. (Voz do Tributário diz 130/19: pendência dele) | 05/09 |
| 10 | **Um vídeo por vez**; o seguinte só depois do OK explícito no anterior | 04/10 |
| 11 | **Prévia antes do pesado:** prancha parada 1920×1080 → ele escolhe por número → vídeo. Prévia de vídeo em 960×540 engana (CRF alto parece "colado") | 03/10 |
| 12 | **Render só com "pode"** em horário de expediente (o PC fica sem memória); à noite/madrugada pode | 02/10 |
| 13 | **Toda versão é nova** (sufixo vN), original intacta, `REGISTRO_vN_<assunto>_<data>.md` em português, cópia no Drive, 720p pelo chat | sempre |
| 14 | **Nunca `git add -A videos`**; adicionar arquivo por arquivo; quadros (`narr*_q`) e mp4 fora do git; commits com `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>` | 03/10 |
| 15 | **Nunca dizer que renderizou** sem o arquivo medido (duração, LUFS, quadros parados) | sempre |

## Fluxo resumido (detalhe em `pipeline.md`)
1. Voz aprovada (ElevenLabs ou gravação; uma marca só `[upbeat, confident]`) → `narracao/voz_bruta/`; falas por `alinhar.py` (whisper) ou `pausas.py`.
2. Página HTML: `render(t)` (tempo da página) + `window.renderReal(T)` (tempo real) — comece copiando a página aprovada mais parecida.
3. `retime.py`: `PAGINAS[nome]`, `CORRIDA[nome]` (D, fim, anc/seg, abre, mus_db, duck) → `retime.py pagina <nome>` → `narr_<nome>.html` + nº de quadros.
4. Stills de conferência (`render.js stills` ou `scripts/sonda_visiveis.js`) → prancha para ele escolher, se a tela é nova.
5. Render **em uma sessão** (`render.js frames`), codificar CRF 17, `retime.py audio`, conferir (freezedetect, ebur128, pares YMAX, folha de cenas), 720p: `scripts/pipeline_video.py <config.json> tudo`.
6. Trecho refeito: `scripts/refazer_trechos.py <config.json> <a-b>` — emenda só em quadro sem texto (YMAX antigo×novo ≤ 3).
7. Entrega: Drive + 720p no chat + registro + commit arquivo por arquivo + memória `video-quem-somos-ative`.

## Antes de entregar (checklist)
- [ ] Voz intacta (duração da voz = duração na mix; nenhuma fala perdida/duplicada).
- [ ] Encerramento conferido em still lado a lado com a v12/v7c (ATIVE **sob** a pirâmide, 262 px abaixo do centro).
- [ ] `freezedetect` só nos trechos propositais (telas brancas, cursor, pausa de frase digitada ≤ 0,4 s).
- [ ] Mapa de diferença f[n]×f[n+1] numa tela de texto parada: borda de letra apagada (≤ ~30).
- [ ] `ebur128`: música sozinha na abertura ≈ −20 LUFS; mix inteira −16 a −20 LUFS; pico ≤ −1 dBFS.
- [ ] Sem borda preta (`cropdetect` → 1920:1080:0:0).
- [ ] Registro escrito, Drive copiado, 720p enviada, commit arquivo por arquivo, memória atualizada.

## Encadeamento
- Roteiro e copy da narração → `ative-linguagem` (texto redondo) e `ative-instagram` para cortes.
- Corte, legenda, Reels, compressão de arquivo pronto → `video-ative`.
- Trilha nova sobre mix existente → `narracao/trocar_trilha.py` (refaz a partir das faixas separadas; nunca separa música de mix pronta).
- Site (seção "Vídeo institucional") → worktree `dev/ative-site-video`, branch `video-institucional`, não publicado.
