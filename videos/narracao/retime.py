"""A narração comanda o tempo do vídeo.

Cada fala gravada vira uma âncora: o instante em que a narradora começa a frase (tempo novo, T)
é levado ao instante em que a cena dela começa na página (tempo original, t). Entre âncoras o
tempo da página corre mais devagar ou mais depressa; a voz fica intacta (sem acelerar).

  python retime.py plano <nome>            mostra o mapa de tempo e as velocidades de cada trecho
  python retime.py pagina <nome>           grava a página com o tempo remapeado em fonte/video/
  python retime.py audio <nome> <mudo.mp4> <saida.mp4>   junta voz + música no vídeo renderizado
"""
import json, math, os, subprocess, sys
AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
from gerar_guias import VIDEOS
from alinhar import AUDIO, BRUTA, alinhar

V = os.path.dirname(AQUI)
FONTE = os.path.join(V, 'estruturacao-de-capital', 'fonte')
FF = os.environ.get('FFMPEG', 'ffmpeg')
PAGINAS = {  # página de origem, música de fundo
    '1_Estruturacao_de_Capital': (os.path.join(FONTE, 'video', 'v6.html'), os.path.join(FONTE, 'audio', 'musica_sem_voz.wav')),
    '2_Apresentacao_da_Ative': (os.path.join(V, 'apresentacao-ative', 'inst.html'), os.path.join(FONTE, 'audio', 'musica_sem_voz.wav')),
    '3_Tributario': (os.path.join(V, 'tributario', 'trib.html'), os.path.join(FONTE, 'audio', 'musica_sem_voz.wav')),
    '4_Quem_Somos': (os.path.join(V, 'quem-somos', 'fonte', 'qs.html'), os.path.join(FONTE, 'audio', 'musica_sem_voz.wav')),
    '1_Estruturacao_v2': (os.path.join(FONTE, 'video', 'v7.html'), os.path.join(FONTE, 'audio', 'musica_sem_voz.wav')),
    '3_Tributario_v2': (os.path.join(V, 'tributario', 'trib_v2.html'), os.path.join(FONTE, 'audio', 'musica_sem_voz.wav')),
    '1_Estruturacao_v4': (os.path.join(FONTE, 'video', 'v7.html'), os.path.join(FONTE, 'audio', 'musica_sem_voz.wav')),
    '3_Tributario_v4': (os.path.join(V, 'tributario', 'trib_v4.html'), os.path.join(FONTE, 'audio', 'musica_sem_voz.wav')),
    '3_Tributario_v5': (os.path.join(V, 'tributario', 'trib_v5.html'), os.path.join(FONTE, 'audio', 'musica_sem_voz.wav')),
    '2_Apresentacao_v4': (os.path.join(V, 'apresentacao-ative', 'inst_v4.html'), os.path.join(FONTE, 'audio', 'musica_sem_voz.wav')),
    '1_Estruturacao_v5': (os.path.join(FONTE, 'video', 'v8.html'), os.path.join(FONTE, 'audio', 'musica_sem_voz.wav')),
    '3_Tributario_v6': (os.path.join(V, 'tributario', 'trib_v6.html'), os.path.join(FONTE, 'audio', 'musica_sem_voz.wav')),
    '2_Apresentacao_v6': (os.path.join(V, 'apresentacao-ative', 'inst_v6.html'), os.path.join(FONTE, 'audio', 'musica_sem_voz.wav')),
    '1_Estruturacao_v6': (os.path.join(FONTE, 'video', 'v9.html'), os.path.join(FONTE, 'audio', 'musica_sem_voz.wav')),
    '2_Apresentacao_v5': (os.path.join(V, 'apresentacao-ative', 'inst_v5.html'), os.path.join(FONTE, 'audio', 'musica_sem_voz.wav')),
    '2_Apresentacao_v7': (os.path.join(V, 'apresentacao-ative', 'inst_v7.html'), os.path.join(FONTE, 'audio', 'musica_sem_voz.wav')),
    '2_Apresentacao_v8': (os.path.join(V, 'apresentacao-ative', 'inst_v8.html'), os.path.join(FONTE, 'audio', 'musica_sem_voz.wav')),
    '2_Apresentacao_v9': (os.path.join(V, 'apresentacao-ative', 'inst_v9.html'), os.path.join(FONTE, 'audio', 'musica_sem_voz.wav')),
}
ENTRA = 0.12   # a voz entra este tanto depois de a frase começar a aparecer na tela


MAXV = 1.2    # a página nunca corre mais que isto; se a fala chegar cedo, ganha uma pausa
PRE, POS = 0.06, 0.18


def plano(nome):
    """Devolve as âncoras (tempo novo, tempo da página) e onde cada fala gravada entra no tempo novo."""
    falas, voz = VIDEOS[nome][1], alinhar(nome)
    T = [falas[0][0] + ENTRA]
    for k in range(1, len(falas)):
        natural = T[-1] + (voz[k][0] - voz[k - 1][0])
        minimo = T[-1] + (falas[k][0] - falas[k - 1][0]) / MAXV
        T.append(max(natural, minimo))
    anc = [(0.0, 0.0)] + [(Tk - ENTRA, s0) for Tk, (s0, _, _) in zip(T, falas)]
    fim_voz = T[-1] + voz[-1][1] - voz[-1][0]
    anc.append((max(fim_voz + 0.5, anc[-1][0] + (60.0 - anc[-1][1]) / 0.8), 60.0))
    linhas = [(a - PRE, b + POS, Tk - PRE) for (a, b), Tk in zip(voz, T)]
    return anc, linhas


# Voz corrida (aprovada como gravada): a gravação entra inteira, sem cortes nem pausas; só o vídeo se ajusta.
# Âncoras = (fala k, deslocamento em s em relação ao início da fala, tempo da página). D = silêncio antes da voz.
CORRIDA = {
    '4_Quem_Somos': dict(voz='audio4_aprovado_0110.m4a', D=2.4, fim=2.3, anc=[
        (0, -0.4, 4.0), (1, 0.4, 9.2), (2, 0.3, 14.2), (3, -0.12, 19.2), (4, -0.12, 25.2),
        (5, -0.12, 31.0), (6, 0.3, 40.3), (7, -0.12, 46.2),
        (8, -1.49, 53.9),   # Balneário termina e a pirâmide começa a girar
        (8, 0.2, 56.7)]),   # a frase final aparece junto com a voz
    # seg = (fala k, deslocamento, página de, página até): cada trecho vai do início da sua fala até o início do
    # próximo trecho; a página pode saltar (corte seco entre cenas) e até voltar, para trocar a ordem das cenas.
    '1_Estruturacao_v2': dict(voz='audio1_estruturacao_eleven_0210.mp3', D=0.3, fim=1.8, pagina_fim=60.0, seg=[
        (0, -9, 0.0, 2.9),       # começa em T=0 (deslocamento grande = limitado a 0)
        (1, -0.3, 2.9, 4.3),     # t2 aparece
        (2, -0.3, 4.3, 5.55),    # a segunda frase acende na mesma cena
        (2, 1.6, 5.55, 6.85),    # fim da frase: ícones giram e viram o bloco do logo
        (3, -0.35, 6.85, 10.0),  # "Prazer, somos a Ative!"
        (4, -0.3, 10.0, 11.35), (5, -0.3, 11.35, 12.75),
        (6, -0.3, 12.75, 15.7), (7, -0.3, 15.7, 18.2), (8, -0.3, 18.2, 23.15),
        (9, -0.3, 23.15, 26.05), (10, -0.3, 26.05, 30.47), (11, -0.3, 30.47, 33.12),
        (12, -0.3, 33.12, 37.45), (13, -0.3, 37.45, 41.25),
        (14, -0.3, 50.35, 56.85),  # números antes de "capital começa com preparo" (ordem do texto novo)
        (15, -0.3, 46.3, 50.35),
        (16, -0.3, 56.9, 58.6),    # pirâmide gira; "Toda parceria começa com confiança." entra com a voz
        (17, -0.25, 58.6, 60.0)]),
    '3_Tributario_v2': dict(voz='audio3_tributario_eleven_0210.mp3', D=0.3, fim=2.5, seg=[
        (0, -9, 0.0, 2.9),
        (1, -0.3, 2.9, 4.25),     # t2
        (2, -0.3, 4.25, 5.6),     # t2b na mesma cena dos ícones
        (3, -0.4, 5.6, 10.0),     # ícones giram, logo: "É aí que a Ative entra"
        (4, -0.3, 10.0, 12.75),   # equipe técnica e jurídica + rodapé jurídico
        (5, -0.3, 12.75, 15.7),   # auditar, recuperar, planejar
        (6, -0.3, 15.7, 18.2),
        (7, -0.3, 18.2, 23.15),   # contribuições... e "cada detalhe importa" sobre a parede
        (9, -0.3, 23.15, 26.05),
        (10, -0.3, 26.05, 30.47), # três painéis acompanham a enumeração
        (11, -0.3, 30.47, 33.15),
        (12, -0.3, 33.15, 37.38), # planejamento + rodapé jurídico
        (13, -0.3, 37.38, 41.25), # reforma (a segunda frase acende com a voz)
        (15, -0.3, 41.25, 46.05),
        (16, -0.3, 46.05, 50.35),
        (17, -0.3, 50.35, 56.9),
        (18, -0.4, 56.9, 58.6),   # pirâmide gira rápido e a assinatura ATIVE vem com a voz
        (18, 0.6, 58.6, 60.0)]),
}
# v4 (02/10 noite): vozes novas do ElevenLabs v4 — Larissa (Estruturação) e Ana Alice (Tributário)
CORRIDA['1_Estruturacao_v4'] = dict(CORRIDA['1_Estruturacao_v2'], voz='vozA_larissa.mp3')
CORRIDA['2_Apresentacao_v4'] = dict(voz='vozC_aline.mp3', D=1.0, fim=2.5, seg=[(0, -9, 0.0, 102.8)])
CORRIDA['2_Apresentacao_v5'] = CORRIDA['2_Apresentacao_v4']  # v5 = v4 + imagens de IA por cima
CORRIDA['3_Tributario_v4'] = dict(CORRIDA['3_Tributario_v2'], voz='vozB_anaalice.mp3',
    seg=CORRIDA['3_Tributario_v2']['seg'][:-2] + [
        (18, -0.3, 56.9, 58.6),   # pirâmide gira; "Antes de qualquer negócio, existe confiança." entra com a voz
        (19, -0.25, 58.6, 60.0)]) # assinatura ATIVE com o "Ative!"
# v4 (Larissa, Ana Alice): elas dizem a fala do logo mais depressa; o logo ganha ~0,8 s da fala seguinte
# para não correr (a frase seguinte entra um pouco depois da voz, e o logo fica em ~1,1x / 1,5x)
CORRIDA['1_Estruturacao_v4']['seg'] = [(4, 0.5, 10.0, 11.35) if s[0] == 4 else s for s in CORRIDA['1_Estruturacao_v4']['seg']]
CORRIDA['3_Tributario_v4']['seg'] = [(4, 0.6, 10.0, 12.75) if s[0] == 4 else s for s in CORRIDA['3_Tributario_v4']['seg']]
CORRIDA['3_Tributario_v5'] = CORRIDA['3_Tributario_v4']
CORRIDA['1_Estruturacao_v5'] = CORRIDA['1_Estruturacao_v4']
CORRIDA['1_Estruturacao_v6'] = CORRIDA['1_Estruturacao_v4']  # v6 = v4 + cenas reconstruídas em HTML
CORRIDA['3_Tributario_v6'] = CORRIDA['3_Tributario_v4']
CORRIDA['2_Apresentacao_v6'] = CORRIDA['2_Apresentacao_v4']  # v5 = v4 + imagens de IA por cima
# v7 (03/10 tarde): abertura de 6 s (a voz inteira entra em 4,6 s, sem corte), cena "Tudo começa pelo DIAGNÓSTICO"
# até a fala 4, perguntas uma por tela. A página fica parada em t=0 (cenas novas vivem em renderReal) e corre 1:1
# a partir de t=10,9 — tudo da v6 acontece 3,6 s mais tarde. abre = (ganho da música antes da voz em dB, início e fim
# da descida suave até o nível normal). Música medida (03/10): na v4/v6 ela ficava a -40 LUFS sozinha e -48 LUFS sob a
# voz (inaudível); aqui mus_db=+4 e duck mais leve dão -20 LUFS na abertura e -32 LUFS sob a voz (voz a -16).
CORRIDA['2_Apresentacao_v7'] = dict(voz='vozC_aline.mp3', D=4.6, fim=2.5, abre=(9.0, 3.0, 4.6), mus_db=4, duck=(0.05, 2.5),
                                    seg=[(0, -9, 0.0, 0.0), (3, -0.3, 10.9, 102.8)])
# v8 (03/10 fim de tarde, correção do Jonas): a abertura ORIGINAL volta (azul + tile branco + logo), precedida pelo
# campo de ícones em navy dos outros vídeos só com música (0–3,0 s, em renderReal); o tile anima de 3,0 a 5,1 (1:1),
# o logo completo segura de 5,1 a 5,7 enquanto a voz diz "Esta é a Ative!" (4,64–5,9) e daí a página corre 1:1, 3,6 s atrás da v6.
# DIAGNÓSTICO vai para onde a narração o diz (página 86,12) e os três cartões do tributário entram na cena das falas 15-16.
CORRIDA['2_Apresentacao_v8'] = dict(voz='vozC_aline.mp3', D=4.6, fim=2.5, abre=(9.0, 3.4, 4.6), mus_db=4, duck=(0.05, 2.5),
                                    seg=[(0, -9, 0.0, 0.0), (0, -1.64, 0.0, 2.1), (0, 0.46, 2.1, 2.1), (1, -0.26, 2.1, 102.8)])
# v9 (03/10 ~17h): sem o campo de ícones — começa direto no azul com o tile (1:1 de 0 a 2,1 s), o logo completo segura
# de 2,1 a 4,1 s (música; a voz entra em 3,0 s: "Esta é a Ative!" 3,04–4,3), sai quando começa "Existimos…" (4,36) e a
# frase vem numa tela nova, sem logo. Daí a página corre 1:1, 2,0 s atrás da v6.
CORRIDA['2_Apresentacao_v9'] = dict(voz='vozC_aline.mp3', D=3.0, fim=2.5, abre=(9.0, 2.0, 3.0), mus_db=4, duck=(0.05, 2.5),
                                    seg=[(0, -9, 0.0, 2.1), (0, -0.94, 2.1, 2.1), (1, -0.26, 2.1, 102.8)])


def plano_corrido(nome):
    """Lista de trechos (T0, T1, página de, página até)."""
    c, voz = CORRIDA[nome], alinhar(nome)
    if 'seg' not in c:
        anc = [(0.0, 0.0)] + [(c['D'] + voz[k][0] + off, t) for k, off, t in c['anc']]
        anc.append((c['D'] + voz[-1][1] + c['fim'], 60.0))
        assert all(b[0] > a[0] and b[1] > a[1] for a, b in zip(anc, anc[1:])), anc
        return [(a[0], b[0], a[1], b[1]) for a, b in zip(anc, anc[1:])]
    ini = [max(0.0, c['D'] + voz[k][0] + off) for k, off, _, _ in c['seg']]
    fim = c['D'] + voz[-1][1] + c['fim']
    segs = [(T0, T1, p0, p1) for T0, T1, (_, _, p0, p1) in zip(ini, ini[1:] + [fim], c['seg'])]
    assert all(T1 > T0 for T0, T1, _, _ in segs), segs
    return segs


def suavizar(segs, ent=0.6, sai=0.4, lim=0.85):
    """Trecho lento: a entrada e a saída da cena correm em 1x e só o miolo (texto parado) é esticado,
    para a animação não ficar arrastada."""
    out = []
    for T0, T1, p0, p1 in segs:
        if p1 > p0 and (p1 - p0) / (T1 - T0) < lim and p1 - p0 > ent + sai + 0.2:
            out += [(T0, T0 + ent, p0, p0 + ent), (T0 + ent, T1 - sai, p0 + ent, p1 - sai), (T1 - sai, T1, p1 - sai, p1)]
        else:
            out.append((T0, T1, p0, p1))
    return out


def mostrar(nome):
    if nome in CORRIDA:
        segs = plano_corrido(nome)
        print(f'{nome}: voz corrida, duração nova {segs[-1][1]:.2f}s')
        for T0, T1, t0, t1 in segs:
            print(f'  novo {T0:6.2f}-{T1:6.2f}  ← página {t0:6.2f}-{t1:6.2f}   velocidade da página {(t1-t0)/(T1-T0):4.2f}x')
        return
    anc, linhas = plano(nome)
    pausa = sum(max(0, l2[2] - l1[2] - (l2[0] - l1[0])) for l1, l2 in zip(linhas, linhas[1:]))
    print(f'{nome}: duração nova {anc[-1][0]:.2f}s; pausas acrescentadas à voz: {pausa:.2f}s no total')
    for (T0, t0), (T1, t1) in zip(anc, anc[1:]):
        print(f'  novo {T0:6.2f}-{T1:6.2f}  ← página {t0:6.2f}-{t1:6.2f}   velocidade da página {(t1-t0)/(T1-T0):4.2f}x')


def pagina(nome):
    src = PAGINAS[nome][0]
    if nome in CORRIDA:
        segs = plano_corrido(nome)
        if CORRIDA[nome].get('seg'):
            segs = suavizar(segs)
    else:
        anc = plano(nome)[0]
        segs = [(a[0], b[0], a[1], b[1]) for a, b in zip(anc, anc[1:])]
    dur = segs[-1][1]
    inj = ("<script>(function(){const S=%s;const o=window.render;"
           "window.render=function(T){let k=0;while(k<S.length-1&&T>=S[k][1])k++;"
           "const [T0,T1,t0,t1]=S[k];const u=Math.min(1,Math.max(0,(T-T0)/(T1-T0)));"
           "const r=o(t0+(t1-t0)*u);window.renderReal&&window.renderReal(T);return r;};window.DURACAO=%s;})();</script>\n" % (json.dumps([[round(x, 3) for x in s] for s in segs]), round(dur, 3)))
    html = open(src, encoding='utf-8').read()
    # entra logo depois do script clássico que define render (antes do módulo 3D)
    marca = '<script type="importmap">' if '<script type="importmap">' in html else '<script type="module">'
    html = html.replace(marca, inj + marca, 1)
    out = os.path.join(FONTE, 'video', f'narr_{nome}.html')
    open(out, 'w', encoding='utf-8', newline='\n').write(html)
    print(out, 'quadros:', math.ceil(dur * 30))


def trilha(dur, compasso=60 / 136 * 4, xf=1.0, mus_db=-6):
    """Até 63 s a música só estica um pouco. Mais longa, repete um trecho do meio cortado no compasso
    (136 bpm), sem mexer no andamento; o final da música continua no final do vídeo."""
    if dur <= 63:
        return f"[2:a]atrim=start=0.09,asetpts=PTS-STARTPTS,atempo={60.07/dur:.4f},apad=whole_dur={dur:.3f},atrim=0:{dur:.3f},volume={mus_db}dB[mus];"
    R = math.ceil((dur - 59.98) / compasso) * compasso
    Y = min(49.5, 8 + R); Z = Y - R
    return (f"[2:a]asplit[ma][mb];[ma]atrim=start=0.09:end={Y:.3f},asetpts=PTS-STARTPTS[m1];"
            f"[mb]atrim=start={Z - xf:.3f},asetpts=PTS-STARTPTS[m2];[m1][m2]acrossfade=d={xf}[mx];"
            f"[mx]apad=whole_dur={dur:.3f},atrim=0:{dur:.3f},volume={mus_db}dB[mus];")


def audio_corrido(nome, mudo, saida):
    """Voz inteira, sem filtro nem compressão (só ganho fixo); a música abaixa por baixo dela."""
    c, dur = CORRIDA[nome], plano_corrido(nome)[-1][1]
    wav, musica = os.path.join(BRUTA, c['voz']), PAGINAS[nome][1]
    d = int(c['D'] * 1000)
    env, mus = '', 'mus'
    if c.get('abre'):  # música com mais presença antes da voz, descendo suavemente até o nível normal
        g, t0, t1 = c['abre']; g = 10 ** (g / 20)
        env = f"[mus]volume='if(lt(t,{t0}),{g:.3f},if(lt(t,{t1}),1+({g:.3f}-1)*({t1}-t)/({t1 - t0}),1))':eval=frame[musE];"; mus = 'musE'
    th, ratio = c.get('duck', (0.03, 5))  # quanto a música abaixa sob a voz (limiar linear, razão)
    base = (f"[1:a]aresample=48000,adelay={d}:all=1,apad=whole_dur={dur:.3f},atrim=0:{dur:.3f},asplit[vz1][vz2];"
            + trilha(dur, mus_db=c.get('mus_db', -6)) + env +
            f"[{mus}][vz1]sidechaincompress=threshold={th}:ratio={ratio}:attack=60:release=600[musd];"
            f"[musd][vz2]amix=inputs=2:normalize=0,volume={{m}}dB,afade=t=out:st={dur-1.5:.3f}:d=1.5[aout]")
    ent = ['-i', mudo, '-i', wav, '-i', musica]
    # 1ª passada mede o volume; a 2ª aplica ganho fixo (sem loudnorm dinâmico, que mexe na voz)
    r = subprocess.run([FF, '-nostdin', '-hide_banner', *ent, '-filter_complex', base.format(m=0) + ';[aout]ebur128=peak=true[o]',
                        '-map', '[o]', '-f', 'null', '-'], capture_output=True, text=True, encoding='utf-8', errors='ignore').stderr
    tail = r[r.rfind('Summary:'):]
    I = float(tail.split('I:')[1].split('LUFS')[0]); pk = float(tail.split('Peak:')[1].split('dBFS')[0])
    m = min(-16 - I, -1.0 - pk)
    print(f'volume medido {I:.1f} LUFS, pico {pk:.1f} dBFS -> ganho {m:+.1f} dB')
    if os.environ.get('RETIME_MUS'):  # grava só a música (já abaixada sob a voz e com o ganho final) para medir
        so_mus = base.format(m=f'{m:.2f}').replace('[musd][vz2]amix=inputs=2:normalize=0,', '[vz2]anullsink;[musd]')
        subprocess.run([FF, '-nostdin', '-v', 'error', '-y', *ent, '-filter_complex', so_mus, '-map', '[aout]', '-ar', '48000',
                        os.environ['RETIME_MUS']], check=True)
    subprocess.run([FF, '-nostdin', '-v', 'error', '-y', *ent, '-filter_complex', base.format(m=f'{m:.2f}'),
                    '-map', '0:v', '-map', '[aout]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000',
                    '-movflags', '+faststart', '-t', f'{dur:.3f}', saida], check=True)
    print(saida)


def audio(nome, mudo, saida):
    if nome in CORRIDA:
        return audio_corrido(nome, mudo, saida)
    anc, linhas = plano(nome)
    dur = anc[-1][0]
    wav = os.path.join(BRUTA, f'audio{AUDIO[nome]}.wav')
    musica = PAGINAS[nome][1]
    parts = [f"[1:a]atrim={a:.3f}:{b:.3f},asetpts=PTS-STARTPTS,afade=t=in:d=0.03,afade=t=out:st={b-a-0.06:.3f}:d=0.06,"
             f"adelay={int(ini*1000)}:all=1[v{k}]" for k, (a, b, ini) in enumerate(linhas)]
    fc = (';'.join(parts) + ';' + ''.join(f'[v{k}]' for k in range(len(linhas))) +
          f"amix=inputs={len(linhas)}:normalize=0,apad=whole_dur={dur:.3f},atrim=0:{dur:.3f},"
          "highpass=f=80,afftdn=nf=-28,acompressor=threshold=-20dB:ratio=3:attack=8:release=120,loudnorm=I=-16:TP=-2,asplit[vz1][vz2];"
          f"[2:a]atrim=start=0.09,asetpts=PTS-STARTPTS,atempo={60.07/dur:.4f},apad=whole_dur={dur:.3f},atrim=0:{dur:.3f},volume=-4dB[mus];"
          "[mus][vz1]sidechaincompress=threshold=0.03:ratio=6:attack=40:release=450[musd];"
          f"[musd][vz2]amix=inputs=2:normalize=0,loudnorm=I=-16:TP=-1.5,afade=t=out:st={dur-0.8:.3f}:d=0.8[aout]")
    subprocess.run([FF, '-nostdin', '-v', 'error', '-y', '-i', mudo, '-i', wav, '-i', musica, '-filter_complex', fc,
                    '-map', '0:v', '-map', '[aout]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000',
                    '-movflags', '+faststart', '-t', f'{dur:.3f}', saida], check=True)
    print(saida)


if __name__ == '__main__':
    cmd, nome = sys.argv[1], sys.argv[2]
    {'plano': lambda: mostrar(nome), 'pagina': lambda: pagina(nome), 'audio': lambda: audio(nome, sys.argv[3], sys.argv[4])}[cmd]()
