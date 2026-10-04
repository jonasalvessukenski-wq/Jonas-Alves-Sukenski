# Histórico das versões (30/09 → 04/10/2026) e pendências

Registros completos em `videos/REGISTRO_*.md` (repo e Drive). Memória viva: `video-quem-somos-ative.md`.

## Linha do tempo
| Data | Versão | O que foi | Resultado |
|---|---|---|---|
| 30/09 | Quem somos v1; Estruturação com pausas na voz | filmagem real, voz gravada | voz com pausas/filtro "muito ruim" → regra: voz intacta |
| 01/10 | retime CORRIDA; Quem somos narrado | `retime.py` modo voz corrida | render em quadros no disco (PC sem memória) |
| 02/10 | v2 → v4 dos três (vozes ElevenLabs Larissa / Aline / Ana Alice) | páginas no tempo real das falas; tarefa noturna 01:00 | v4 no Drive (commit b207ac8); música inaudível (não medida) |
| 03/10 madrugada | v5 = v4 + imagens de IA por cima | camadas em `renderReal` | **reprovada** ("IA colada como slide") |
| 03/10 manhã | v6 = v4 + cenas em HTML/SVG (`v6_comum.js`) | passos, degraus, ondas, feixes, fita | aceita como base (commit 3cffde7) |
| 03/10 tarde | Apresentação v7 (brief em inglês) | abertura navy 6 s, DIAGNÓSTICO em 6 s, música medida | **reprovada** ("avacalhou a abertura") |
| 03/10 16h | v8 = abertura original + campo de ícones + música antes da voz | DIAGNÓSTICO na fala 18, cartões do Jonas | prévia baixa; ele pediu tirar o campo de ícones |
| 03/10 17h | v9 = direto no azul, logo sozinho, frase em tela nova | D=3,0 | **aprovada na estrutura** ("acertando a mosca", commit 9bd85c4) |
| 03/10 18h | 8 pranchas paradas → P3/P5/P8 → v10 cheia 1080p | método prancha → número → vídeo | "ficou ótimo" no tempo; "quadradinhos tremendo" |
| 03/10 19h–22h30 | v11 = sem zoom em texto, placa PNG, feixes sem blur, parede desenhada, final ATIVE + frase digitada; render em uma sessão | 3.144 quadros, −16,0 LUFS | **aprovada com um erro** ("o resto tá perfeito") |
| 03/10 22h50 | v12 = v11 + transform do ATIVE (comentário `//` tinha engolido) | 32 quadros refeitos | **PADRÃO** |
| 04/10 00h10 | Estruturação v7 e Tributário v7 no padrão v12 (`v10.html`, `trib_v7.html`, `v7_comum.js`) | commit f8284a3 | "todos ficaram maravilhosos"; 3 ajustes |
| 04/10 00h30 | v7b: avisos de advocacia fora (Trib), fechamento igual ao v12 (ATIVE caíra no meio: `//` de novo) | trechos refeitos com emenda medida; commit 87506d6 | "muito, muito bom"; frase pequena sob o logo "feia" |
| 04/10 01h–07h10 | v7c: frase de confiança digitada em tela própria antes do "Ative.", final 4,0 s | Trib: só o encerramento refeito (emenda 2163); commit 5807990 | **Tributário APROVADO** ("esse está perfeito") |
| 04/10 07h20–08h | Estruturação v7d: avisos de parceiros e casos fora + mesmo encerramento | render inteiro em uma sessão (2.115 quadros); commit 30f7933 | entregue; "todos os três perfeitos" |
| 04/10 manhã | Apresentação v13 = v12 + trilha MorningLight (130 bpm) | `trocar_trilha.py`; música sob a voz −26 LUFS | aguarda ele ouvir; licença a conferir |

## Pendências abertas (decisão do Jonas)
| Nº | Pendência | Estado |
|---|---|---|
| 1 | Tributário fala "130 empresas / 19 estados"; público autorizado é +70 / 18 | manter (voz aprovada) ou regravar só essa fala |
| 2 | Níveis de som diferentes (Apres −16,0 · Estr −18,4 · Trib −20,3 LUFS) | igualar com limiter? perguntar antes |
| 3 | Avisos de responsabilidade saíram das telas | levar para a descrição do vídeo / página |
| 4 | Apresentação v13 (trilha nova) | ele ouvir e escolher v12 ou v13; licença da faixa |
| 5 | Seção "Vídeo institucional" no site | worktree `dev/ative-site-video`, branch `video-institucional`, **não publicado** (precisa de "pode") |
| 6 | Quem somos: autorização de imagem das 4 pessoas, trilha licenciada, versão 9:16 | parado desde 01/10 |
| 7 | Versões 9:16 / 4:5 dos três para Instagram | não pedidas ainda; usar `video-ative` só para recorte simples, ou página própria 1080×1920 |

## Custo evitado (palavras dele, 04/10)
"Gastaríamos brincando uns dois mil reais para fazer todos esses vídeos, ou até mais." Três vídeos institucionais
1080p com narração, trilha medida e identidade própria, em quatro dias, sem produtora.
