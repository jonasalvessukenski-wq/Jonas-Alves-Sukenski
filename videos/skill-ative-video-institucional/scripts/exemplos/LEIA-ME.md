# Exemplos reais (04/10/2026) — copiar e adaptar, não rodar às cegas

| Arquivo | O que mostra |
|---|---|
| `montar_v7_outros.py` | como as páginas Estruturação v7 (`v10.html`, a partir de `v9.html`) e Tributário v7 (`trib_v7.html`, de `trib_v6.html`) e o `v7_comum.js` nasceram por troca de string: abertura navy + pergunta digitada, P3/P5, placas PNG, feixes nas cenas opacas, bloco `fimReal` do encerramento (template `FIMJS` com L1/L2/kA/kB/kC por vídeo) |
| `patch_v7c.py` | como uma alteração pedida vira patch no montador (frase digitada em tela própria + `fim=4.0` no retime), em vez de editar a página à mão |
| `montar_v12.py`, `pipeline_v12.py` | Apresentação v12: a correção de uma linha e o render parcial com hardlink dos quadros anteriores |
| `tile_png.js` | pinta a placa de vidro UMA vez em PNG (lição 3) |
| `../render.js` | cópia do motor de render (o oficial fica em `videos/estruturacao-de-capital/fonte/video/render.js`): modos `frames` (FRAMES_DIR/FROM/TO, retoma), `stills <t…>` e pipe direto para o ffmpeg |

Caminhos dentro dos scripts apontam para o repo `C:\Users\Jonas\dev\Jonas-Alves-Sukenski\videos` e para o scratchpad
da sessão de 04/10; ajuste antes de usar.
