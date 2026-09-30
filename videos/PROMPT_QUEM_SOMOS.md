# Prompt — vídeo "Quem somos" da Ative

Você vai atuar como diretor criativo, roteirista e editor de vídeo da Ative. Vamos produzir um vídeo institucional "Quem somos", no mesmo padrão dos três vídeos que já fizemos, agora usando fotos e vídeos reais da Ative que eu vou te enviar.

## 1. Onde está a base

Tudo o que foi feito está no repositório `jonasalvessukenski-wq/Jonas-Alves-Sukenski`, pasta `videos/` (branch `claude/jolly-babbage-qoj0xh`). Antes de qualquer coisa, leia:

- `videos/estruturacao-de-capital/`: vídeo aprovado (v6), com os arquivos-fonte em `fonte/`: `video/v6.html` (animação), `video/render.js` (renderização), `assets/` (logo 3D, pirâmide, fontes Manrope, wordmarks), `crops/` (telas e logos da rede), `h/` (fotos dos instrumentos), `audio/` (música sem voz e locução)
- `videos/apresentacao-ative/inst.html`: vídeo de apresentação aprovado e renderizado
- `videos/tributario/`: roteiro e página do vídeo tributário
- `videos/LOCUCAO_PARA_GRAVAR.md`: padrão de texto de locução

Reaproveite o código, os componentes e os arquivos. Não recrie nem substitua nenhuma imagem minha sem me perguntar.

## 2. O padrão visual que funcionou (siga à risca)

- Modelo de montagem: vídeo da Atendare. 60 segundos, 1920×1080, 30 fps, tipografia animada, alternância frase → prova, corte a cada 3–4 segundos.
- Cores: marinho `#000050` (fundo com leve radial), azul `#008DE6`, ciano `#2FE1F2`, branco. Fonte: Manrope 700/800.
- Texto: entra com desfoque e sobe; sai com desfoque. Frases curtas, com vida, que despertem curiosidade. Nada de cara de PowerPoint.
- Nunca usar painel branco com texto. As provas usam imagens reais: cartões de vidro fosco, estilo Apple (foto de fundo e placa de vidro com o título), telas do PDF recortadas e animadas em 3D e faixas de logos.
- Movimento sempre contínuo. Nenhum trecho pode ficar congelado. Confira medindo a diferença entre quadros; eu percebo as "travadinhas".
- Abertura do logo: quadrado branco com o símbolo 3D sobre o azul, que cresce até virar o fundo branco. O símbolo desliza e forma a assinatura com o "ATIVE". Arquivos: `logo3d_simbolo.png` e `ative_wordmark_navy.png`.
- Encerramento: a pirâmide dourada 3D (three.js, símbolo extrudado do logo oficial) gira três voltas no próprio eixo, para de frente e se funde na imagem original da pirâmide (`piramide_full.png`), alinhada ponto a ponto. Fundo azul-escuro, brilho atravessando o ouro, "ATIVE" branco sem fio embaixo e a frase "Antes de qualquer negócio, existe confiança."
- Sem CTA apelativo ("conversa de 15 minutos" foi rejeitado).

## 3. Verdade e segurança (não negociável)

- Não invente números, clientes, datas nem resultados.
- Números aprovados por mim: +14 anos de experiência (trajetória dos sócios); +130 empresas em relacionamento; 19 estados; R$ 118,6 milhões em três operações de 2026 da nossa rede de parceria (MW Energias Renováveis, Bremen, CRI Conceito, autorizadas pelo Adriano); 30 instituições com que a rede de parceria opera.
- Operações: sempre "da nossa rede de parceria", com o rodapé "Operações conduzidas pela rede de parceria da Ative e divulgadas com autorização. Não constitui oferta de crédito nem promessa de resultado."
- Rede de bancos: rodapé "Instituições com que operam os parceiros da Ative. A menção não indica vínculo contratual direto com a Ative."
- Quando falar de área jurídica: rodapé "A Ative não realiza atividade privativa de advocacia; a atuação jurídica é conduzida por escritório parceiro."
- Não citar Olimpo nem BMS pelo nome. A consultoria de custos aparece como "consultoria de custos especializada".
- Pessoas nas fotos e vídeos: pergunte se há autorização de imagem antes de usar rosto de cliente ou de terceiros.

## 4. Como trabalhar comigo

1. Primeiro analise todo o material novo (fotos e vídeos): liste, veja cada um, classifique (sócios, equipe, escritório, reuniões, eventos, bastidores, documentos) e aponte os melhores trechos e o que não tem qualidade.
2. Depois me traga o conceito em duas linhas e o roteiro em tabela (tempo | cena | na tela), para eu aprovar antes de montar.
3. Com o roteiro aprovado, monte e me mostre quadros de prévia das cenas principais antes de renderizar o vídeo inteiro.
4. Vídeos reais: use trechos curtos (2–4 s), estabilizados, em câmera lenta quando fizer sentido, com tratamento de cor que combine com a paleta (leve tom azulado nos escuros, pele natural). Podem entrar em tela cheia com o texto por cima, ou dentro de molduras de vidro.
5. Renderização: o processo leva uns 4–5 minutos. Avise antes de começar e deixe claro que qualquer mensagem minha no meio interrompe.

## 5. Parte técnica (como os vídeos foram gerados)

- Animação em HTML/JS com uma função `render(t)` determinística. Quadros capturados pelo Chromium do Playwright (`/opt/pw-browsers`) e codificados com o ffmpeg do pacote `imageio-ffmpeg` (H.264, CRF 18, faststart).
- A pirâmide 3D usa three.js (`npm install three@0.169.0` em `fonte/video/`). Para funcionar, é preciso servir a pasta `fonte/` por HTTP (porta 8765) e abrir o Chromium com `--use-angle=swiftshader --enable-unsafe-swiftshader`.
- Vídeos reais dentro da animação: extraia os quadros com o ffmpeg e sincronize pelo tempo `t`, ou componha as camadas com o ffmpeg depois. O importante é o resultado ser determinístico, quadro a quadro.
- Áudio: a música sem voz está em `fonte/audio/musica_sem_voz.wav` (voz removida com Demucs `htdemucs_ft`). Para usar, corte 0,09 s do início e faça um fade no fim. Locução: uma frase por arquivo, posicionada no tempo da cena, com a música abaixando sob a voz (sidechain) e o volume normalizado em −16 LUFS.
- Atenção: a música é do vídeo da Atendare. Serve para aprovação e uso interno. Para publicar, sugira uma trilha licenciada parecida.

## 6. O que eu quero agora

Um vídeo "Quem somos" da Ative, de 60 segundos em 16:9 (e depois uma versão 9:16 para Reels), mostrando quem somos, o que fazemos nas frentes financeira e tributária, a nossa experiência e a confiança, com as nossas imagens reais. Vou te enviar agora as fotos e os vídeos. Comece pela análise do material.
