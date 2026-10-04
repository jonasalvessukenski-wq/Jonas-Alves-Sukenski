# -*- coding: utf-8 -*-
"""Pipeline de um vídeo institucional da Ative depois da página narrada pronta:
render de TODOS os quadros em UMA sessão de navegador (navegador novo por bloco gera salto de sub-pixel nas letras),
H.264 1080p CRF 17, áudio pelo retime.py, conferências (quadros parados, ebur128, pares estáticos, folha de cenas) e
cópia 720p para o celular/chat.

Uso: python pipeline_video.py <config.json> [render|codificar|audio|conferir|celular|tudo]

config.json (ver config_exemplo_*.json):
  key     nome no retime.py (PAGINAS/CORRIDA)          q      pasta de quadros dentro de FV (ex.: narr3v7_q)
  url     página narrada servida (http://127.0.0.1:8765/video/narr_<key>.html)
  n       nº de quadros (retime.py pagina imprime)      dur    duração em s (n/30)
  pasta   subpasta de videos/ onde sai o mp4            nome   prefixo dos arquivos de saída
  previa  nome da folha de cenas                        tile   grade da folha (ex.: 6x7)
  pares   [[rótulo, "w:h:x:y", [[i,j],…]], …] janelas de tela parada para medir YMAX entre quadros consecutivos
  vid     (opcional) raiz videos/; fv (opcional) pasta das páginas narradas e quadros
Origem: scratchpad pipeline_v7_outros.py (04/10/2026), generalizado para a skill ative-video-institucional."""
import json, os, re, subprocess, sys
import imageio_ffmpeg

FF = imageio_ffmpeg.get_ffmpeg_exe()
PY = sys.executable
VID_PADRAO = r'C:\Users\Jonas\dev\Jonas-Alves-Sukenski\videos'


class Alvo:
    def __init__(self, cfg):
        self.__dict__.update(cfg)
        self.VID = cfg.get('vid', VID_PADRAO)
        self.FV = cfg.get('fv', os.path.join(self.VID, 'estruturacao-de-capital', 'fonte', 'video'))
        self.Q = os.path.join(self.FV, self.q); self.MUDO = os.path.join(self.FV, self.q + '.mp4')
        self.SAIDA = os.path.join(self.VID, self.pasta, self.nome + '_narrado.mp4')
        self.CEL = os.path.join(self.VID, self.pasta, self.nome + '_720p.mp4')
        self.FOLHA = os.path.join(self.VID, self.pasta, self.previa)
        self.tile = cfg.get('tile', '6x7'); self.pares = cfg.get('pares', [])


def render(A):
    N = A.n
    if not all(os.path.exists(os.path.join(A.Q, f'f{i:05d}.jpg')) for i in range(N)):
        env = dict(os.environ, URL=A.url, FRAMES_DIR=A.Q, FROM='0', TO=str(N), PYTHON=PY)
        subprocess.run(['node', os.path.join(A.FV, 'render.js'), 'frames'], env=env, cwd=A.FV, check=True)
    faltam = [i for i in range(N) if not os.path.exists(os.path.join(A.Q, f'f{i:05d}.jpg'))]
    print('quadros em disco', N - len(faltam), 'faltam', len(faltam), flush=True); assert not faltam, faltam[:10]


def codificar(A):
    subprocess.run([FF, '-y', '-v', 'error', '-framerate', '30', '-i', os.path.join(A.Q, 'f%05d.jpg'),
                    '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', '-threads', '4',
                    '-movflags', '+faststart', A.MUDO], check=True)
    print('mudo', A.MUDO, os.path.getsize(A.MUDO) // 1024, 'KB', flush=True)


def audio(A):
    env = dict(os.environ, FFMPEG=FF, PYTHONIOENCODING='utf-8')
    subprocess.run([PY, os.path.join(A.VID, 'narracao', 'retime.py'), 'audio', A.key, A.MUDO, A.SAIDA], env=env, check=True)


def ebur(arq, a, b):
    r = subprocess.run([FF, '-hide_banner', '-nostdin', '-ss', str(a), '-t', str(b - a), '-i', arq, '-filter_complex', 'ebur128=peak=true',
                        '-f', 'null', '-'], capture_output=True, text=True, encoding='utf-8', errors='ignore').stderr
    t = r[r.rfind('Summary:'):]
    return t.split('I:')[1].split('LUFS')[0].strip(), t.split('Peak:')[1].split('dBFS')[0].strip()


def ymax(A, i, j, crop):
    r = subprocess.run([FF, '-hide_banner', '-nostdin', '-i', os.path.join(A.Q, f'f{i:05d}.jpg'), '-i', os.path.join(A.Q, f'f{j:05d}.jpg'),
                        '-filter_complex', f'[0][1]blend=all_mode=difference,crop={crop},signalstats,metadata=print:key=lavfi.signalstats.YMAX',
                        '-f', 'null', '-'], capture_output=True, text=True, encoding='utf-8', errors='ignore').stderr
    m = re.findall(r'YMAX=(\d+)', r)
    return int(m[-1]) if m else None


def conferir(A):
    r = subprocess.run([FF, '-hide_banner', '-nostdin', '-i', A.SAIDA, '-vf', 'freezedetect=n=-75dB:d=0.4', '-an', '-f', 'null', '-'],
                       capture_output=True, text=True, encoding='utf-8', errors='ignore').stderr
    print('quadros parados:', r.count('freeze_start'), re.findall(r'freeze_start: ([\d.]+)', r)[:10])
    print('duracao:', re.search(r'Duration: ([\d:.]+)', r).group(1), '| tamanho', os.path.getsize(A.SAIDA) // 1024, 'KB',
          '|', re.search(r'Video: .*?, (\d+x\d+)', r).group(1))
    c = subprocess.run([FF, '-hide_banner', '-nostdin', '-ss', '20', '-t', '20', '-i', A.SAIDA, '-vf', 'cropdetect=limit=24:round=2:reset=0',
                        '-f', 'null', '-'], capture_output=True, text=True, encoding='utf-8', errors='ignore').stderr
    bordas = set(re.findall(r'crop=(\d+:\d+:\d+:\d+)', c)); print('borda preta:', 'nenhuma' if bordas == {'1920:1080:0:0'} else bordas)
    for nome, a, b in [('so musica 0-1.5', 0, 1.5), ('video inteiro', 0, A.dur)]:
        I, pk = ebur(A.SAIDA, a, b); print(f'  {nome}: {I} LUFS, pico {pk} dBFS')
    for nome, crop, pares in A.pares:
        print('  ' + nome + ': ' + ' · '.join(f'{i}/{j}: {ymax(A, i, j, crop)}' for i, j in pares), flush=True)
    subprocess.run([FF, '-y', '-v', 'error', '-i', A.SAIDA, '-vf', f'fps=1/2,scale=384:-1,tile={A.tile}', '-frames:v', '1', A.FOLHA], check=True)
    print('folha', A.FOLHA)


def celular(A):
    subprocess.run([FF, '-y', '-v', 'error', '-i', A.SAIDA, '-vf', 'scale=1280:720', '-c:v', 'libx264', '-preset', 'medium', '-crf', '22',
                    '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', A.CEL], check=True)
    print('720p', A.CEL, os.path.getsize(A.CEL) // 1024, 'KB')


if __name__ == '__main__':
    A = Alvo(json.load(open(sys.argv[1], encoding='utf-8')))
    et = sys.argv[2] if len(sys.argv) > 2 else 'tudo'
    passos = {'render': render, 'codificar': codificar, 'audio': audio, 'conferir': conferir, 'celular': celular}
    for k in (passos if et == 'tudo' else [et]):
        print('==', A.key, k, flush=True); passos[k](A)
