# Registro — Apresentação da Ative v14 (05/10/2026, ~06h40)

## Pedido do Jonas
Em 04/10 ele perguntou se os três cartões da cena tributária (RECUPERAR, PLANEJAR e A REFORMA), que na v12 eram uma
imagem recebida com fotos, poderiam virar ilustração desenhada, "uma ilustração animada se movimentando conforme a
narração", e pediu primeiro o modelo. A prévia foi aprovada ("muito bom, parabéns") e em 05/10 ele confirmou a mudança.

## O que mudou (v12 → v14)
Só a cena dos cartões, de 70,4 s a 82,8 s. Todo o resto é a v12 quadro a quadro.

| Nº | Cartão | Entra em | Ilustração e movimento |
|---|---|---|---|
| 1 | RECUPERAR | 70,4 s, "Buscamos recuperar…" | documento com linhas; uma varredura ciano desce o texto, duas linhas ficam douradas com a moeda R$, uma seta sobe até a pilha de moedas |
| 2 | PLANEJAR | 72,7 s, "…planejamento tributário…" | tablet; cinco barras crescem em sequência, a linha se desenha sobre elas e a caneta acompanha o traço |
| 3 | A REFORMA | 77,3 s, "Para a reforma tributária…" | três pessoas chegam à mesa, o notebook desenha um gráfico, o selo dourado de qualificação aparece no alto |

Ilustrações desenhadas em SVG, sem imagem de IA; texto em HTML parado no painel; o grupo de cartões deixou de ter a
escala contínua que tinha na v12. Entradas e saída dos cartões nos mesmos tempos da v12.

## Render e conferências

| Nº | Item | Resultado |
|---|---|---|
| 1 | quadros | trecho 2085–2504 renderizado em uma sessão (o mesmo da prévia aprovada; a página da v14 é idêntica à da prévia) e o resto copiado da v12 |
| 2 | emendas | entrada no quadro 2111 e saída no 2483, os dois com diferença 0 entre a v12 e o trecho novo; pares vizinhos 15–18 na entrada (movimento normal) e 3–6 na saída |
| 3 | arquivo | `ATIVE_Apresentacao_v14_narrado.mp4` 1920×1080, CRF 17, 38,3 MB; `ATIVE_Apresentacao_v14_720p.mp4` 9,0 MB |
| 4 | duração e som | 1:44,80; áudio copiado da v12 sem nova mistura; −16,0 LUFS |
| 5 | `freezedetect` | os mesmos 7 trechos parados de propósito da v12 (Existimos e as piscadas do cursor) |
| 6 | borda preta | nenhuma |

A trilha nova da v13 não entrou aqui: a v14 usa o som da v12. Se ele escolher a trilha da v13, ela pode ser aplicada
sobre a v14 pelo `trocar_trilha.py`.

## Arquivos
`apresentacao-ative/inst_v14.html` · `fonte/video/narr_2_Apresentacao_v14.html` · `retime.py`, `alinhar.py` e
`gerar_guias.py` com a chave `2_Apresentacao_v14` (iguais à v12) · quadros em `fonte/video/narr2v14_q/` ·
`PREVIA_Apresentacao_v14_cenas.jpg` · cópia no Drive. v12 e v13 intactas.
