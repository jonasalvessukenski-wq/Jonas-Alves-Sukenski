"""Apresentação v12 = v11 com o ATIVE do final de volta para baixo da pirâmide. Só os quadros em que o wordmark aparece
mudam (T 99,40–100,45 s = quadros 2982–3013); o resto vem da v11 por hardlink. Render dos novos em UMA sessão; as duas
fronteiras caem em movimento (frase saindo em desfoque / letra sendo digitada) e são medidas depois.
Uso: python pipeline_v12.py [quadros|codificar|audio|conferir|celular|tudo]"""
import os, subprocess, sys, re
import imageio_ffmpeg
FF = imageio_ffmpeg.get_ffmpeg_exe()
PY = sys.executable
VID = r'C:\Users\Jonas\dev\Jonas-Alves-Sukenski\videos'
FV = os.path.join(VID, 'estruturacao-de-capital', 'fonte', 'video')
Q11 = os.path.join(FV, 'narr2v11_q')
Q = os.path.join(FV, 'narr2v12_q')
MUDO = os.path.join(FV, 'narr2v12_q.mp4')
SAIDA = os.path.join(VID, 'apresentacao-ative', 'ATIVE_Apresentacao_v12_narrado.mp4')
CEL = os.path.join(VID, 'apresentacao-ative', 'ATIVE_Apresentacao_v12_720p.mp4')
N = 3144
NOVOS = (2982, 3014)  # [a, b): quadros refeitos
URL = 'http://127.0.0.1:8765/video/narr_2_Apresentacao_v12.html'


def quadros():
    os.makedirs(Q, exist_ok=True)
    a, b = NOVOS
    liga = 0
    for i in range(N):
        if a <= i < b:
            continue
        d = os.path.join(Q, f'f{i:05d}.jpg')
        if not os.path.exists(d):
            os.link(os.path.join(Q11, f'f{i:05d}.jpg'), d); liga += 1
    print('hardlinks da v11:', liga, flush=True)
    for i in range(a, b):  # garante render novo (não aproveita quadro antigo da faixa)
        p = os.path.join(Q, f'f{i:05d}.jpg')
        if os.path.exists(p): os.remove(p)
    env = dict(os.environ, URL=URL, FRAMES_DIR=Q, FROM=str(a), TO=str(b), PYTHON=PY)
    subprocess.run(['node', os.path.join(FV, 'render.js'), 'frames'], env=env, cwd=FV, check=True)
    faltam = [i for i in range(N) if not os.path.exists(os.path.join(Q, f'f{i:05d}.jpg'))]
    print('quadros em disco', N - len(faltam), 'faltam', len(faltam), flush=True); assert not faltam, faltam[:10]


def codificar():
    subprocess.run([FF, '-y', '-v', 'error', '-framerate', '30', '-i', os.path.join(Q, 'f%05d.jpg'),
                    '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', '-threads', '4',
                    '-movflags', '+faststart', MUDO], check=True)
    print('mudo', MUDO, os.path.getsize(MUDO) // 1024, 'KB', flush=True)


def audio():
    env = dict(os.environ, FFMPEG=FF, PYTHONIOENCODING='utf-8')
    subprocess.run([PY, os.path.join(VID, 'narracao', 'retime.py'), 'audio', '2_Apresentacao_v12', MUDO, SAIDA], env=env, check=True)


def ebur(a, b):
    r = subprocess.run([FF, '-hide_banner', '-nostdin', '-ss', str(a), '-t', str(b - a), '-i', SAIDA, '-filter_complex', 'ebur128=peak=true',
                        '-f', 'null', '-'], capture_output=True, text=True, encoding='utf-8', errors='ignore').stderr
    t = r[r.rfind('Summary:'):]
    return t.split('I:')[1].split('LUFS')[0].strip(), t.split('Peak:')[1].split('dBFS')[0].strip()


def ymax(i, j, crop):
    r = subprocess.run([FF, '-hide_banner', '-nostdin', '-i', os.path.join(Q, f'f{i:05d}.jpg'), '-i', os.path.join(Q, f'f{j:05d}.jpg'),
                        '-filter_complex', f'[0][1]blend=all_mode=difference,crop={crop},signalstats,metadata=print:key=lavfi.signalstats.YMAX',
                        '-f', 'null', '-'], capture_output=True, text=True, encoding='utf-8', errors='ignore').stderr
    m = re.findall(r'YMAX=(\d+)', r)
    return int(m[-1]) if m else None


def conferir():
    r = subprocess.run([FF, '-hide_banner', '-nostdin', '-i', SAIDA, '-vf', 'freezedetect=n=-75dB:d=0.4', '-an', '-f', 'null', '-'],
                       capture_output=True, text=True, encoding='utf-8', errors='ignore').stderr
    print('quadros parados:', r.count('freeze_start'), re.findall(r'freeze_start: ([\d.]+)', r)[:8])
    print('duracao:', re.search(r'Duration: ([\d:.]+)', r).group(1), '| tamanho', os.path.getsize(SAIDA) // 1024, 'KB',
          '|', re.search(r'Video: .*?, (\d+x\d+)', r).group(1))
    for nome, a, b in [('so musica 0-3.0', 0, 3.0), ('video inteiro', 0, 104.8)]:
        I, pk = ebur(a, b); print(f'  {nome}: {I} LUFS, pico {pk} dBFS')
    # fronteiras do trecho novo e vizinhos (quadro inteiro)
    pares = [(2979, 2980), (2980, 2981), (2981, 2982), (2982, 2983), (2983, 2984), (3011, 3012), (3012, 3013), (3013, 3014), (3014, 3015), (3015, 3016)]
    print('fronteiras (quadro inteiro):', ' · '.join(f'{i}/{j}: {ymax(i, j, "1920:1080:0:0")}' for i, j in pares))
    folha = os.path.join(VID, 'apresentacao-ative', 'PREVIA_Apresentacao_v12_cenas.jpg')
    subprocess.run([FF, '-y', '-v', 'error', '-i', SAIDA, '-vf', 'fps=1/3,scale=384:-1,tile=6x6', '-frames:v', '1', folha], check=True)
    print('folha', folha)


def celular():
    subprocess.run([FF, '-y', '-v', 'error', '-i', SAIDA, '-vf', 'scale=1280:720', '-c:v', 'libx264', '-preset', 'medium', '-crf', '22',
                    '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', CEL], check=True)
    print('720p', CEL, os.path.getsize(CEL) // 1024, 'KB')


if __name__ == '__main__':
    et = sys.argv[1] if len(sys.argv) > 1 else 'tudo'
    passos = {'quadros': quadros, 'codificar': codificar, 'audio': audio, 'conferir': conferir, 'celular': celular}
    for k in (passos if et == 'tudo' else [et]):
        print('==', k, flush=True); passos[k]()
