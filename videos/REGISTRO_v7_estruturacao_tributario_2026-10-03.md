# Registro — Estruturação de Capital v7 e Tributário v7 (03/10/2026, noite)

Pedido do Jonas depois de aprovar a Apresentação v12 ("o resto tá perfeito; os próximos vídeos podem seguir tudo nesse
mesmo padrão… cada vídeo tem a sua especificação pela narração, mas tudo que você fez nesse pode aplicar nos outros").
Os dois vídeos foram refeitos a partir das versões v6 (Estruturação `fonte/video/v9.html`, Tributário `trib_v6.html`),
com a **mesma voz, a mesma música, a mesma ordem de cenas e os mesmos textos**; mudou o desenho das telas e a mistura,
no padrão da Apresentação v11/v12.

## O que foi aplicado (igual nos dois)

| Nº | Item da Apresentação v12 | Como ficou aqui |
|---|---|---|
| 1 | abertura sem o campo de ícones coloridos | navy com dois feixes de luz lentos; a primeira pergunta é **digitada** com cursor ciano enquanto a voz fala (Tributário: as duas perguntas das falas 1 e 2); o cursor pisca antes da voz entrar |
| 2 | voz entra em 1,5 s | D passa de 0,3 para 1,5 s (música e cursor antes da primeira pergunta); as cenas antigas recebem T − 1,2 s, então nada sai do lugar em relação à voz |
| 3 | tile branco + logo | mantidos como sempre (tile entra 0,3 s depois do corte navy → azul, como na v6) |
| 4 | tela de frase P3 (branco) | frase das falas 3/4 em 92 px, destaque azul na palavra-chave, fio dourado |
| 5 | tela de frase P5 (azul) | luz difusa + feixes + vinheta + fio + fita |
| 6 | placas de vidro P6/P8 | placa de vidro em PNG (sem desenho em CSS que tremia), ícone em traço, fio, etiqueta, frase. Estruturação: "Capital começa com preparo." (navy). Tributário: "PLANEJAMENTO TRIBUTÁRIO" (azul, 3 linhas) e "REFORMA TRIBUTÁRIA" (navy; a segunda linha acende na fala 15) |
| 7 | parede e painéis desenhados | cartões da parede (Estruturação, 13 produtos) e painéis tributários (Enquadramento, Estruturas, Fator previdenciário) com gradiente + ícone em traço no lugar das fotos comprimidas (1180×310 px, 12–43 KB, saíam embaçadas); ícones novos: pessoas, gráfico, calendário, balança, escudo, prédio, documento |
| 8 | sem zoom contínuo em texto ou caixa | retirado o zoom lento de 2,5 % das frases, da parede, dos círculos e do contêiner dos painéis; `v7_comum.js` = `v6_comum.js` sem a câmera lenta das cenas (passos, degraus, ondas) |
| 9 | feixes sem `filter:blur` | luz por gradiente radial; dois feixes globais (`#ambG`) só sobre azul e navy (somem no branco e no encerramento) |
| 10 | encerramento | frase "Toda parceria…/Antes de qualquer negócio…" sai em desfoque quando o ATIVE entra; ATIVE entra devagar (0,8 s), **embaixo da pirâmide** (correção da v12) |
| 11 | mistura | igual à Apresentação: música +4 dB, abertura a +9 dB até 0,8 s descendo até 1,5 s, duck leve (0,05 / 2,5), final segura 2,5 s |

## Decisões desta versão
- **Sem frase digitada no fim.** Na Apresentação a voz termina em "…dar mais vida à sua empresa" e a tela "Mais vida /
  para sua empresa!" é digitada por cima. Nestes dois a voz termina em "Ative." sobre o símbolo; digitar uma frase que a
  voz não diz quebraria a regra "o vídeo se adapta à narração". O encerramento fica símbolo → ATIVE embaixo → preto.
  Se o Jonas quiser a assinatura escrita, é uma linha para acrescentar.
- **Números seguem a voz:** Estruturação "+70 empresas / 18 estados"; Tributário "+130 empresas / 19 estados" (a voz
  diz 130/19; os números públicos autorizados são +70/18 — item aberto desde a v4, não mexido aqui).
- **Transição navy → tile:** mantida da v6 (frase sai em desfoque, corte para o azul, tile entra em 0,3 s). Não foi
  trocada por crossfade para não mexer no que já estava aprovado.
- Render em **uma sessão só** de navegador por vídeo (regra da v11: navegador novo por bloco gera salto de sub-pixel).

## Correção no meio do caminho (04/10 ~00h)
A primeira conferência da Estruturação acusou 8 trechos parados; 6 deles eram as cenas dos **passos** (22–26 s) e dos
**degraus** (45–47 s), que vêm da v6 com fundo azul opaco próprio e tapavam os feixes globais: entre uma entrada e outra
a tela ficava morta. Correção em `v7_comum.js`: cada cena azul (passos, degraus, ondas) ganhou dois feixes próprios,
com o mesmo desenho e o mesmo movimento dos globais. Na Estruturação só esses dois trechos foram refeitos (quadros
636–844 e 1291–1444); a emenda foi escolhida onde não há texto na tela e a sessão nova coincide com a antiga (diferença
≤ 2 níveis: a primeira tentativa, com a emenda em cima da frase branca, acusou 41 e 90 de salto de sub-pixel e foi
descartada). O Tributário, que ainda estava renderizando, foi reiniciado do zero com a correção.

## Render e conferências (ffmpeg)

| Nº | Item | Estruturação v7 | Tributário v7 |
|---|---|---|---|
| 1 | quadros | 2.070 (1:09,00), uma sessão + 2 trechos refeitos | 2.372 (1:19,07), uma sessão |
| 2 | arquivo 1080p CRF 17 | `ATIVE_Estruturacao_de_Capital_v7_narrado.mp4` 25,9 MB | `ATIVE_Tributario_v7_narrado.mp4` 28,3 MB |
| 3 | cópia 720p | 6,5 MB | 6,9 MB |
| 4 | som (ebur128) | música sozinha 0–1,5 s −18,4 LUFS · inteiro −18,4 LUFS, pico −0,9 dBFS | música sozinha −20,6 LUFS · inteiro −20,4 LUFS, pico −0,9 dBFS |
| 5 | `freezedetect` (≥ 0,4 s) | 2: as duas telas brancas de frase (14,9 e 17,6 s), de propósito | 3: tela branca de frase (19,7 s), círculos no branco (24,3 s) e o feixe no ponto de retorno do seno sobre os números (68,8 s; os quadros diferem em ≤ 4 níveis, não é tela parada) |
| 6 | pares estáticos (YMAX quadro a quadro) | pergunta digitada 6 · frase navy 7/6/9 · números 6/6 · placa 7 | perguntas 7 e 5 · frase navy 6/4/7 · placas 8/9 e 7/8 · números 6/6 |
| 7 | emendas dos trechos refeitos | 635/636 = 19 (vizinhos 37 e 38) · 1290/1291 = 6 (vizinhos 18 e 5) | — |

O ganho final do `retime.py audio` é por pico (−2,5 dB na Estruturação, −4,7 dB no Tributário, cuja voz tem picos mais
altos); por isso o Tributário fecha 2 dB mais baixo que a Estruturação e 4 dB abaixo da Apresentação (−16,0). Não foi
posto limitador para não processar a voz. Se o Jonas quiser os três no mesmo nível, é uma decisão à parte.

## Revisão do Jonas (04/10 ~00h30) e correção v7b
Ele assistiu aos dois: "todos ficaram maravilhosos", três ajustes pequenos. (1) Tributário: tirar o aviso "A Ative não
realiza atividade privativa de advocacia…" do rodapé da tela branca "Equipe técnica e jurídica…" e da placa "Planejamento
tributário". (2) O fechamento não estava igual ao da Apresentação v12: a frase "Antes de qualquer negócio…" e o ATIVE
caíram no meio do símbolo. (3) O mesmo fechamento na Estruturação ("é a única falha do outro também").

**Causa do (2):** o mesmo erro da v11 → v12. Na montagem, um comentário `// v7: …` entrou no meio da linha e engoliu
`filter` e `transform` do ATIVE e da frase; sem o `translateY`, os dois ficaram no centro da tela. O still de conferência
mostrou "ATIVE presente" e eu não comparei a altura com a v12. Regra nova: em troca por string, só comentário de bloco.

**Correção (v7b, mesmos arquivos, sem nova versão de nome):** comentários de bloco; frase a 290 px abaixo do centro e
ATIVE a 262 px (valores da v12); no Tributário as duas linhas do aviso passam a opacidade 0. Só os quadros afetados
foram refeitos (detecção automática pela visibilidade dos elementos que mudaram; cada trecho em uma sessão, com sobra;
emenda no quadro em que a sessão nova coincide com a antiga, YMAX ≤ 3):

| Nº | Vídeo | Trecho refeito | Emenda (pares vizinhos → emenda) |
|---|---|---|---|
| 1 | Tributário | 580–685 (tela branca, 19,3–22,9 s) | 42, 53 → 64 (entrada do texto) · fim 3, 0 |
| 2 | Tributário | 1569–1727 (placa Planejamento, 52,3–57,6 s) | 51, 59 → 67 (entrada da placa) · fim 11, 15 |
| 3 | Tributário | 2175–2371 (encerramento, 72,5 s ao fim) | 227, 227 → 235 (símbolo girando) |
| 4 | Estruturação | 1884–2069 (encerramento, 62,8 s ao fim) | 215, 221 → 220 (símbolo girando) |

Tributário v7b: 1:19,07, 28,2 MB, −20,4 LUFS, os mesmos 3 trechos parados de antes (telas brancas e o feixe no ponto
de retorno do seno). Estruturação v7b: 1:09,00, 25,9 MB, −18,4 LUFS, os mesmos 2 trechos parados (telas brancas).
Conferido no arquivo final: frase sob o símbolo e ATIVE embaixo da pirâmide nos dois, lado a lado com a v12. Observação para o Jonas: o aviso de advocacia existia por prudência com a OAB (a Ative não é
escritório); saiu das telas a pedido dele; se quiser, pode ir para a descrição do vídeo.

## Segunda revisão do Jonas (04/10 ~01h15) e v7c: a frase de confiança vira tela digitada
Ele gostou dos dois ("ficou muito, muito bom"), mas achou feia a frase pequena embaixo do logo no fechamento e pediu:
trazer a frase digitada numa tela própria, como a assinatura da v12, e só depois o símbolo girando com o ATIVE —
"dar uma atrasada quando ela fala Ative"; um vídeo por vez.

**Como ficou (nos dois, mesma mecânica, tempos da voz de cada um):**

| Nº | Momento | O que acontece |
|---|---|---|
| 1 | 0,3 s antes da fala de confiança | navy dos números dissolve para o fundo escuro do encerramento (igual antes) |
| 2 | fala "…confiança." (Trib 72,4–75,7 s; Estr 62,7–65,7 s) | tela própria: fio dourado + frase em 108 px digitada com a voz (0,06 s por letra, cursor ciano pisca ao terminar), duas linhas: "Antes de qualquer negócio, / existe confiança." · "Toda parceria / começa com confiança." |
| 3 | 0,3 s antes de "Ative." | a frase sai em desfoque (corte da v12) |
| 4 | "Ative." (Trib 75,7 s; Estr 65,7 s) | símbolo 3D entra girando (1,8 s), vira a imagem completa, brilho passa, e o ATIVE entra devagar embaixo da pirâmide (2,15–3,15 s depois do início do giro) — exatamente os tempos do encerramento da v12 |
| 5 | fim | o final segura 4,0 s depois da voz (era 2,5) para o ATIVE respirar ~1,9 s parado; Trib 1:20,57 (2.417 quadros), Estr 1:10,50 (2.115) |

A frase pequena sob o logo (`#endT`) foi desligada. Tudo em tempo real (`fimReal` em `renderReal`), por cima do bloco de
encerramento da página, que continua cuidando só do fundo. `retime.py`: `fim=4.0` nas duas CORRIDA v7.

**Tributário v7c (render 04/10 ~07h00):** render parcial só do encerramento, em uma sessão (quadros 2159–2417, sobra de
15 antes do trecho forçado 2174–2417). Emenda no quadro 2163 (fundo puro: os números já em opacidade 0; de 2164 em diante
a v7b já mostrava o símbolo entrando, por isso não coincide). 254 quadros substituídos (2163–2417).

| Nº | Medida | Resultado |
|---|---|---|
| 1 | pares na emenda (YMAX) | 2160/2161: 15 · 2161/2162: 9 · 2162/2163: 5 — é o desvanecimento natural dos números, sem degrau |
| 2 | quadros 2410→2416 | 32–57 por par, contínuo: é o push lento de 5 % da imagem do símbolo (igual à v12), não corte |
| 3 | saída | 1:20,57 · 2.417 quadros · 29,4 MB (1080p) · 7,2 MB (720p) |
| 4 | som | −20,3 LUFS, pico −1,2 dBFS (ganho −4,7 dB pelo pico); só música 0–1,5 s: −20,6 LUFS |
| 5 | `freezedetect` | os mesmos 3 pontos de antes (19,6 s tela branca · 24,3 s círculos no branco · 68,8 s retorno do feixe) |
| 6 | telas conferidas | digitação 73,3–75,3 s · desfoque de saída 75,6 s · símbolo girando 76,2–77,8 s · ATIVE sob a pirâmide até 80,5 s · sem frase pequena |

**Estruturação v7c:** página `v10.html` e `narr_1_Estruturacao_v7.html` já regeneradas (2.115 quadros, final de 4,0 s);
o render do encerramento (quadros 1884–2115, emenda prevista em 1872–1884, só fundo) aguarda o OK do Jonas no
Tributário — ele pediu um vídeo por vez.

## Arquivos
`estruturacao-de-capital/fonte/video/v10.html` (Estruturação v7) · `tributario/trib_v7.html` · `fonte/video/v7_comum.js` ·
`fonte/video/narr_1_Estruturacao_v7.html` e `narr_3_Tributario_v7.html` (gerados pelo `retime.py pagina`) ·
`retime.py` (`PAGINAS` + `CORRIDA['1_Estruturacao_v7']`/`['3_Tributario_v7']`) · `alinhar.py` · `gerar_guias.py` ·
quadros em `fonte/video/narr1v7_q/` e `narr3v7_q/` · `PREVIA_Estruturacao_v7_cenas.jpg` · `PREVIA_Tributario_v7_cenas.jpg` ·
cópias no Drive (`Ative — Vídeos institucionais`). v6 e anteriores intactas.
