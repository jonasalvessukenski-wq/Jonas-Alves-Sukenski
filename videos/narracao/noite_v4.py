"""Render noturno das vozes v4 (Larissa = Estruturação, Ana Alice = Tributário).
Transcreve, encaixa, grava os quadros (retoma se cair), monta, coloca a voz e copia para o Drive.
Log em noite_v4.log. Uso: python noite_v4.py"""
import glob, math, os, shutil, subprocess, sys, time
AQUI = os.path.dirname(os.path.abspath(__file__))
V = os.path.dirname(AQUI)
FONTE = os.path.join(V, 'estruturacao-de-capital', 'fonte')
Q = os.path.join(FONTE, 'video')
PY = sys.executable
LOG = open(os.path.join(AQUI, 'noite_v4.log'), 'a', encoding='utf-8')
import imageio_ffmpeg
FF = imageio_ffmpeg.get_ffmpeg_exe()
ENV = dict(os.environ, PYTHONIOENCODING='utf-8', FFMPEG=FF)
ENC = ['-c:v', 'libx264', '-preset', 'fast', '-threads', '2', '-x264-params', 'rc-lookahead=10', '-crf', '18',
       '-pix_fmt', 'yuv420p', '-movflags', '+faststart']
VIDEOS = [  # nome, wav, json, pasta de quadros, saída
    ('1_Estruturacao_v4', 'vozA_larissa.wav', 'audio1v4.json', 'narr1v4_q', os.path.join(V, 'estruturacao-de-capital', 'ATIVE_Estruturacao_de_Capital_v4_narrado.mp4')),
    ('3_Tributario_v4', 'vozB_anaalice.wav', 'audio3v4.json', 'narr3v4_q', os.path.join(V, 'tributario', 'ATIVE_Tributario_v4_narrado.mp4')),
]


def log(*a):
    print(time.strftime('%H:%M:%S'), *a, file=LOG, flush=True)


def run(cmd, cwd, env=ENV, tentativas=1):
    for k in range(tentativas):
        r = subprocess.run(cmd, cwd=cwd, env=env, stdout=LOG, stderr=LOG)
        if r.returncode == 0:
            return
        log('falhou', k + 1, cmd[:3])
        time.sleep(20)
    raise SystemExit(f'ERRO em {cmd[:3]}')


log('INICIO')
srv = subprocess.Popen([PY, '-m', 'http.server', '8765'], cwd=FONTE, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(3)
try:
    bruta = os.path.join(AQUI, 'voz_bruta')
    for nome, wav, js, _, _ in VIDEOS:
        if not os.path.exists(os.path.join(bruta, js)):
            run([PY, os.path.join(AQUI, 'transcrever.py'), wav, js], bruta, tentativas=3)
        run([PY, 'retime.py', 'plano', nome], AQUI)
        run([PY, 'retime.py', 'pagina', nome], AQUI)
    sys.path.insert(0, AQUI)
    import retime
    for nome, _, _, pasta, saida in VIDEOS:
        n = math.ceil(retime.plano_corrido(nome)[-1][1] * 30)
        log(nome, 'quadros', n)
        env = dict(ENV, FROM='0', TO=str(n), FRAMES_DIR=pasta, URL=f'http://localhost:8765/video/narr_{nome}.html')
        run(['node', 'render.js', 'video', 'x'], Q, env, tentativas=4)  # cada tentativa retoma os quadros que faltam
        mudo = os.path.join(Q, pasta.replace('_q', '_mudo.mp4'))
        run([FF, '-nostdin', '-y', '-framerate', '30', '-i', os.path.join(pasta, 'f%05d.jpg'), *ENC, mudo], Q)
        run([PY, 'retime.py', 'audio', nome, mudo, saida], AQUI)
        log('PRONTO', nome)
        for d in glob.glob(r'G:\Meu Drive\Ative*institucionais'):
            shutil.copy2(saida, d)
            log('Drive', d)
    log('FIM')
finally:
    srv.terminate()
