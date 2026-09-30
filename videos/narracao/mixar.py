"""Monta a narração gravada sobre cada vídeo.

Cada fala entra no tempo da sua cena (ou logo depois da anterior, com uma respiração);
se não couber nos 60 s, a voz inteira acelera um pouco (até 10 %). A música abaixa sob a voz
(sidechain) e o resultado sai em -16 LUFS.
Uso: python mixar.py <pasta de saída> [nomes...]   (FFMPEG=... opcional)
"""
import json, os, subprocess, sys
AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
from gerar_guias import VIDEOS
from alinhar import AUDIO, BRUTA, alinhar

FF = os.environ.get('FFMPEG', 'ffmpeg')
PRE, POS, RESPIRO, ANTECIPA, FIM = 0.06, 0.14, 0.22, 0.30, 59.85


def plano(nome):
    """Encadeia as falas; só acelera (até 10 %) a fala que entra atrasada em relação à cena."""
    falas, voz = VIDEOS[nome][1], alinhar(nome)
    for g in [1 + k / 100 for k in range(0, 13)]:  # se não couber, acelera o conjunto aos poucos
        pos, fim = [], 0.0
        for (s0, _, _), (a, b) in zip(falas, voz):
            ini = max(s0 - ANTECIPA, fim + RESPIRO if pos else 0.0)
            d = b - a + PRE + POS
            f = min(1.10, 1 + max(0.0, ini - s0) / max(d, 1.0)) if ini - s0 > 0.2 else 1.0
            f = min(1.16, f * g)
            pos.append((a - PRE, b + POS, ini, f)); fim = ini + d / f
        if fim <= FIM:
            break
    return pos


def mixar(nome, out_dir):
    src = VIDEOS[nome][0]
    wav = os.path.join(BRUTA, f'audio{AUDIO[nome]}.wav')
    pos = plano(nome)
    parts, labels = [], []
    for k, (a, b, ini, f) in enumerate(pos):
        parts.append(f"[1:a]atrim={a:.3f}:{b:.3f},asetpts=PTS-STARTPTS,afade=t=in:d=0.03,afade=t=out:st={b-a-0.05:.3f}:d=0.05,"
                     f"atempo={f:.2f},adelay={int(ini*1000)}:all=1[v{k}]")
        labels.append(f'[v{k}]')
    fc = ';'.join(parts) + ';' + ''.join(labels) + f"amix=inputs={len(labels)}:normalize=0,apad=whole_dur=60,atrim=0:60," \
         "highpass=f=80,afftdn=nf=-28,acompressor=threshold=-20dB:ratio=3:attack=8:release=120,loudnorm=I=-16:TP=-2[voz];" \
         "[voz]asplit[vz1][vz2];" \
         "[0:a]atrim=0:60,volume=-4dB[mus];[mus][vz1]sidechaincompress=threshold=0.03:ratio=6:attack=40:release=450[musd];" \
         "[musd][vz2]amix=inputs=2:normalize=0,loudnorm=I=-16:TP=-1.5,afade=t=out:st=59.6:d=0.4[aout]"
    out = os.path.join(out_dir, os.path.basename(src).replace('_musica', '').replace('_so_musica', '').replace('.mp4', '') + '_narrado.mp4')
    out = out.replace('_so_narrado', '_narrado').replace('_v1_narrado', '_narrado')
    subprocess.run([FF, '-nostdin', '-v', 'error', '-y', '-i', src, '-i', wav, '-filter_complex', fc, '-map', '0:v', '-map', '[aout]',
                    '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-movflags', '+faststart', out], check=True)
    atraso = max(ini - s0 for (s0, _, _), (_, _, ini, _) in zip(VIDEOS[nome][1], pos))
    fim = max(ini + (b - a) / f for a, b, ini, f in pos)
    print(f'{nome}: vel. máx {max(p[3] for p in pos):.2f}x, maior atraso {atraso:.1f}s, voz termina em {fim:.1f}s -> {os.path.basename(out)}')
    return out


if __name__ == '__main__':
    out_dir = sys.argv[1]; so = sys.argv[2:]
    os.makedirs(out_dir, exist_ok=True)
    for nome in AUDIO:
        if not so or nome in so:
            mixar(nome, out_dir)
