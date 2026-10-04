# Pipeline: da voz ao arquivo entregue

Raiz: `C:\Users\Jonas\dev\Jonas-Alves-Sukenski\videos` (`VID`). Pasta servida: `estruturacao-de-capital\fonte` (`FONTE`);
páginas narradas e quadros em `FONTE\video` (`FV`). Python: `%LOCALAPPDATA%\Programs\Python\Python312\python.exe`
(fora do PATH). ffmpeg: o do `imageio_ffmpeg` (`python -c "import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())"`).
Node + Playwright 1.63 em `FV\node_modules`.

## 0. Custo e horário
| Etapa | Tempo típico | Memória |
|---|---|---|
| render 1080p | ~100 quadros/min (2.115 quadros ≈ 20–25 min; 3.144 ≈ 35 min) | alta: só com "pode" no expediente |
| codificar CRF 17 | 1–2 min | baixa |
| áudio (retime) + conferir + 720p | 2–3 min | baixa |
| still/prancha | segundos | baixa |

Avisar o consumo antes (memória `protocolo-avisar-consumo-antes-de-executar`). À noite: tarefa agendada ou background + Monitor.

## 1. Voz
- Gravação aprovada vai para `narracao/voz_bruta/` e **não se mexe** nela.
- ElevenLabs: uma marca só em todos os blocos (`[upbeat, confident]`); a marcação automática oscila o tom.
- Falas: `alinhar.py` (faster-whisper; pesado — PC pode não ter memória) ou `pausas.py` (acha as falas pelas pausas;
  conferir 3 viradas à mão). Texto das falas em `gerar_guias.py` → `VIDEOS[nome] = (None, [(0,0,'frase'), …])`.
- Guia para o narrador regravar: `gerar_guias.py` (vídeo com a frase na tela no tempo certo).

## 2. Página
- Copiar a página aprovada mais parecida (ver `padrao-aprovado.md §7`) e montar por **troca de string**
  (`scripts/exemplos/montar_v7_outros.py`): cada `troca(a, b)` exige `count == 1`; comentário **só de bloco** `/* */`.
- Contrato: `window.render(t)` desenha o tempo `t` da página (0–60 s na maioria); `window.renderReal(T)` desenha o que
  depende do tempo real da voz (perguntas digitadas, encerramento `fimReal`), chamado pelo invólucro narrado.
- Elementos de tempo real usam `R(k, off) = D + VZ[k] + off` (VZ = início de cada fala na voz, D = silêncio inicial).
- Conferir em still: `URL=http://127.0.0.1:8765/video/<pagina>.html node render.js stills 3.2 10.5 58.9`
  (gera `still_<t>.jpg`) ou `node scripts/sonda_visiveis.js <url> <deQuadro> <atéQuadro>` (lista o que está visível).

## 3. Tempo da voz (`retime.py`)
```
PAGINAS['<nome>'] = (caminho da página, caminho da música)
CORRIDA['<nome>'] = dict(voz='arquivo em voz_bruta', D=1.5, fim=4.0,
    anc=[(fala k, deslocamento s, tempo da página), …]      # ou
    seg=[(fala k, deslocamento, página de, página até), …], # permite cortar/reordenar cenas
    abre=(9.0, 0.8, 1.5), mus_db=4, duck=(0.05, 2.5))
```
- `python retime.py plano <nome>` → mapa de tempo e velocidade de cada trecho (a página nunca corre > 1,2×).
- `python retime.py pagina <nome>` → `FV/narr_<nome>.html` (invólucro com `const S=[[realA,realB,pagA,pagB],…]`) e
  imprime o nº de quadros `N` (= `DURACAO × 30`).
- `python retime.py audio <nome> <mudo.mp4> <saida.mp4>` → junta voz + música com a mistura medida.
- Trocar só a trilha de um vídeo pronto: `trocar_trilha.py` (usa as faixas `_so_voz.wav` / `_so_musica.wav`).

## 4. Servir e renderizar (UMA sessão)
```bash
cd videos/estruturacao-de-capital/fonte && python -m http.server 8765 --bind 127.0.0.1   # background, encerrar no fim
```
```bash
cd videos/estruturacao-de-capital/fonte/video && URL=http://127.0.0.1:8765/video/narr_<nome>.html FRAMES_DIR=narr<id>_q FROM=0 TO=<N> PYTHON=<python> node render.js frames
```
- `render.js frames` grava `f00000.jpg…` em `FRAMES_DIR`, **pula os que já existem** (retoma de onde parou), uma
  sessão de navegador por chamada. Nunca dividir em blocos com navegador novo (pop de sub-pixel nas letras).
- Em background com log e `Monitor` filtrando (`quadros|LUFS|parados|Traceback|FIM`); nunca `rm` do log no monitor.
- Versão nova de página já renderizada: mover a pasta antiga (`narr<id>_q_v7b`) e renderizar na limpa; ou refazer trecho (§7).

## 5. Codificar, áudio, conferir, 720p — `scripts/pipeline_video.py`
```bash
python scripts/pipeline_video.py scripts/config_exemplo_tributario_v7.json tudo      # render|codificar|audio|conferir|celular|tudo
```
Config (JSON): `key` (nome no retime), `q` (pasta de quadros), `url`, `n`, `dur`, `pasta`, `nome` (prefixo de saída),
`previa`, `pares` (janelas de tela parada para medir YMAX), `tile` (grade da folha). O que ele faz:

| Passo | Comando / medida | Esperado |
|---|---|---|
| codificar | `ffmpeg -framerate 30 -i f%05d.jpg -c:v libx264 -preset medium -crf 17 -pix_fmt yuv420p -movflags +faststart` | mudo `narr<id>_q.mp4` |
| audio | `retime.py audio` | `<nome>_narrado.mp4` |
| conferir | `freezedetect=n=-75dB:d=0.4` | só paradas propositais (telas brancas, cursor, pausa da frase digitada ≤ 0,4 s); feixe no retorno do seno (≤ 4 de diferença) também acusa e não é defeito |
| conferir | `ebur128=peak=true` em 0–1,5 s e inteiro | música sozinha ≈ −20 LUFS; inteiro −16 a −20; pico ≤ −1 dBFS |
| conferir | pares `blend=all_mode=difference,crop,signalstats` YMAX em tela parada | ≤ ~30 (texto parado); ~100 = bloco pintado errado; 41–90 numa fronteira = sessão diferente |
| conferir | folha `fps=1/2,scale=384:-1,tile=6x7` | `PREVIA_<nome>_cenas.jpg` |
| celular | `scale=1280:720 crf 22 aac 160k` | `<nome>_720p.mp4` (≤ 10 MB, passa no chat) |

Mapa de diferença para ver o tremor: `ffmpeg -i fA.jpg -i fB.jpg -filter_complex "[0][1]blend=all_mode=difference,eq=brightness=0.9" dif.png`.
Borda preta: `-vf cropdetect=limit=24:round=2:reset=0` deve devolver `1920:1080:0:0`.

## 6. Prévia barata (quando a mudança é pequena)
- Prancha parada 1920×1080 das telas novas (`pranchas.js`) → ele escolhe por número → só então vídeo.
- Hardlink dos quadros da versão anterior com deslocamento de índice + render só do trecho novo (ver `historico.md`, v9/v10).
- Prévia 960×540 CRF 28 **só para tempo e ritmo**; não serve para julgar acabamento (enganou em 03/10).

## 7. Refazer só um trecho — `scripts/refazer_trechos.py`
```bash
python scripts/refazer_trechos.py <config.json> 2174-2417 [outro-trecho …]
```
1. Renderiza o trecho com sobra (15 → 45 → 135 quadros) em uma sessão própria.
2. Procura a emenda: maior `i ≤ a` e menor `j ≥ b` em que `YMAX(antigo, novo) ≤ 3` — só acontece em quadro **sem texto**
   (fundo, feixes, 3D); texto re-rasteriza diferente a cada sessão (41–90 mesmo parado).
3. Substitui, mede os pares da emenda, roda codificar/audio/conferir/celular.
4. Sem emenda limpa → render inteiro (`pipeline_video.py … tudo` numa pasta nova). Foi o caso da Estruturação v7d
   (três trechos em telas de texto): 20 min a mais e nenhum risco.
- Trecho = o **bloco inteiro** que mudou (do primeiro quadro em que o antigo difere ao último), não só os elementos
  detectados; `scripts/detectar.js <url> <N> <id1,id2>` lista quadros em que um elemento está visível, mas esquece o
  que ele não conhece (esqueceu `gl/pfull` em 04/10 e partiu o encerramento em dois).

## 8. Entrega
1. `REGISTRO_v<N>_<assunto>_<data>.md` em `videos/`: pedido do Jonas com as palavras dele, tabela do que mudou, tabela de
   medições (duração, tamanho, LUFS, paradas, emendas), arquivos, pendências. Sem código no texto.
2. Copiar 1080p, 720p, prévia e registro para `G:\Meu Drive\Ative — Vídeos institucionais\`.
3. `SendUserFile` da 720p + folha de quadros do trecho mudado (1080p > 30 MB não passa).
4. `git add` arquivo por arquivo (página, registro, prévia, retime.py…); commit com `Co-Authored-By`; push.
5. Memória `video-quem-somos-ative.md` + linha no `MEMORY.md`; encerrar o servidor 8765 (`TaskStop`).
6. Resposta ao Jonas: curta, tabela numerada "Nº | Momento | O que acontece", pendências dele por número.
