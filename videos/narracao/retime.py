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


def mostrar(nome):
    anc, linhas = plano(nome)
    pausa = sum(max(0, l2[2] - l1[2] - (l2[0] - l1[0])) for l1, l2 in zip(linhas, linhas[1:]))
    print(f'{nome}: duração nova {anc[-1][0]:.2f}s; pausas acrescentadas à voz: {pausa:.2f}s no total')
    for (T0, t0), (T1, t1) in zip(anc, anc[1:]):
        print(f'  novo {T0:6.2f}-{T1:6.2f}  ← página {t0:6.2f}-{t1:6.2f}   velocidade da página {(t1-t0)/(T1-T0):4.2f}x')


def pagina(nome):
    src = PAGINAS[nome][0]
    anc, _ = plano(nome)
    html = open(src, encoding='utf-8').read()
    inj = ("<script>(function(){const A=%s;const o=window.render;"
           "window.render=function(T){let k=0;while(k<A.length-2&&T>A[k+1][0])k++;"
           "const [T0,t0]=A[k],[T1,t1]=A[k+1];const u=Math.min(1,Math.max(0,(T-T0)/(T1-T0)));"
           "return o(t0+(t1-t0)*u);};window.DURACAO=%s;})();</script>\n" % (json.dumps([[round(a, 3), round(b, 3)] for a, b in anc]), round(anc[-1][0], 3)))
    # entra logo depois do script clássico que define render (antes do módulo 3D)
    marca = '<script type="importmap">' if '<script type="importmap">' in html else '<script type="module">'
    html = html.replace(marca, inj + marca, 1)
    out = os.path.join(FONTE, 'video', f'narr_{nome}.html')
    open(out, 'w', encoding='utf-8', newline='\n').write(html)
    print(out, 'quadros:', math.ceil(anc[-1][0] * 30))


def audio(nome, mudo, saida):
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
