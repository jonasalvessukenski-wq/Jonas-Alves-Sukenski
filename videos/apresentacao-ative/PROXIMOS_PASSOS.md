# Vídeo de apresentação da Ative (60s) — onde paramos

Estado em 30/09/2026: roteiro aprovado por Jonas, todas as cenas montadas em `inst.html` e conferidas em prévia. Falta só renderizar e colocar a música.

## Roteiro aprovado

| Tempo | Cena | Na tela |
|---|---|---|
| 0–3s | Logo 3D | ATIVE |
| 3–6s | Branco | Soluções financeiras e tributárias para a sua empresa. |
| 6–9s | Três círculos | DIAGNÓSTICO · FINANCEIRO · TRIBUTÁRIO |
| 9–13s | Azul | +14 ANOS construindo autoridade na trajetória dos sócios |
| 13–15s | Azul | FINANCEIRO — Estruturamos crédito de alto valor para grandes empresas. |
| 15–20s | Cartões de vidro | Instrumentos financeiros |
| 20–24s | Rede de parceiros | 30 instituições na nossa rede de parceria (com a ressalva) |
| 24–27s | Azul | Com uma consultoria de custos especializada, encontramos os gargalos dentro da indústria. |
| 27–30s | Marinho | TRIBUTÁRIO — Analisamos toda a matriz tributária da sua empresa. |
| 30–37s | Três painéis | O PASSADO · O FUTURO · A REFORMA |
| 37–41s | Azul | Economia de tributos com planejamento e estratégia jurídica, dentro da lei. |
| 41–45s | Números | +130 EMPRESAS EM RELACIONAMENTO · 19 ESTADOS |
| 45–51s | Passos | Tudo começa pelo diagnóstico. |
| 51–57s | Marinho | O que a sua empresa ainda não enxergou pode ser o seu maior resultado. |
| 57–60s | Pirâmide 3D | ATIVE · Antes de qualquer negócio, existe confiança. |

## Pendências com Jonas

- Consultoria de custos: parceira ou serviço próprio da Ative?
- Números 130 empresas / 19 estados: atualizar também o vídeo de Estruturação de Capital (hoje 70 / 18)?
- Locução: a esposa de Jonas vai gravar; depois, limpar, encaixar frase a frase e mixar.

## Como renderizar

A página usa os mesmos arquivos de `videos/estruturacao-de-capital/fonte/` (assets, crops, h, video/node_modules com three.js).
Copie `inst.html` para `fonte/video/`, sirva a pasta `fonte` por HTTP (porta 8765) e rode
`URL=http://localhost:8765/video/inst.html node render.js video ATIVE_Apresentacao_60s.mp4`.
Depois junte a música sem voz (`fonte/audio/musica_sem_voz.wav`, cortar 0,09 s do início, fade no último meio segundo).
