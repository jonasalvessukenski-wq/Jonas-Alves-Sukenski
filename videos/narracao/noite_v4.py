"""Render em fila das vozes v4: Apresentação (Aline), Estruturação (Larissa) e Tributário (Ana Alice).
Um vídeo por vez (não disputam memória): encaixa, grava os quadros (retoma se cair), monta, coloca a voz,
confere congelamento e copia para o Drive. Vídeo já pronto é pulado; uma segunda cópia do script sai na hora.
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
VIDEOS = [  # nome, wav, prefixo do alinhamento, pasta de quadros, saída
    ('2_Apresentacao_v4', 'vozC_aline.wav', 'audio2v4', 'narr2v4_q', os.path.join(V, 'apresentacao-ative', 'ATIVE_Apresentacao_v4_narrado.mp4')),
    ('1_Estruturacao_v4', 'vozA_larissa.wav', 'audio1v4', 'narr1v4_q', os.path.join(V, 'estruturacao-de-capital', 'ATIVE_Estruturacao_de_Capital_v4_narrado.mp4')),
    ('3_Tributario_v4', 'vozB_anaalice.wav', 'audio3v4', 'narr3v4_q', os.path.join(V, 'tributario', 'ATIVE_Tributario_v4_narrado.mp4')),
]


def log(*a):
    print(time.strftime('%H:%M:%S'), *a, file=LOG, flush=True)


def run(cmd, cwd, env=ENV, tentativas=1):
    for k in range(tentativas):
        r = subprocess.run(cmd, cwd=cwd, env=env, stdout=LOG, stderr=LOG)
        if r.returncode == 0:
            return True
        log('falhou', k + 1, cmd[:3])
        time.sleep(20)
    return False


TRAVA = os.path.join(AQUI, 'noite_v4.lock')
if os.path.exists(TRAVA) and time.time() - os.path.getmtime(TRAVA) < 6 * 3600:
    log('outra cópia rodando (trava existe); saindo')
    sys.exit(0)
open(TRAVA, 'w').write(str(os.getpid()))
log('INICIO')
srv = subprocess.Popen([PY, '-m', 'http.server', '8765'], cwd=FONTE, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(3)
sys.path.insert(0, AQUI)
try:
    bruta = os.path.join(AQUI, 'voz_bruta')
    for nome, wav, pre, pasta, saida in VIDEOS:
        if os.path.exists(saida):
            log('já pronto, pulando', nome)
            continue
        # alinhamento: whisper se houver memória; senão as pausas da voz
        if not (os.path.exists(os.path.join(bruta, pre + '.json')) or os.path.exists(os.path.join(bruta, pre + '_falas.json'))):
            if not run([PY, os.path.join(AQUI, 'transcrever.py'), wav, pre + '.json'], bruta, tentativas=2):
                run([PY, 'pausas.py', nome, os.path.join(bruta, wav)], AQUI)
        if not (run([PY, 'retime.py', 'plano', nome], AQUI) and run([PY, 'retime.py', 'pagina', nome], AQUI)):
            log('ERRO no encaixe', nome); continue
        import retime
        n = math.ceil(retime.plano_corrido(nome)[-1][1] * 30)
        log(nome, 'quadros', n)
        env = dict(ENV, FROM='0', TO=str(n), FRAMES_DIR=pasta, URL=f'http://localhost:8765/video/narr_{nome}.html')
        ok = run(['node', 'render.js', 'video', 'x'], Q, env, tentativas=6)  # cada tentativa retoma os quadros que faltam
        feitos = len(glob.glob(os.path.join(Q, pasta, 'f*.jpg')))
        if not ok or feitos < n:
            log('ERRO quadros', nome, feitos, 'de', n); continue
        mudo = os.path.join(Q, pasta.replace('_q', '_mudo.mp4'))
        if not run([FF, '-nostdin', '-y', '-framerate', '30', '-i', os.path.join(pasta, 'f%05d.jpg'), *ENC, mudo], Q, tentativas=2):
            log('ERRO montagem', nome); continue
        if not run([PY, 'retime.py', 'audio', nome, mudo, saida], AQUI, tentativas=2):
            log('ERRO áudio', nome); continue
        r = subprocess.run([FF, '-nostdin', '-hide_banner', '-i', mudo, '-vf', 'freezedetect=n=-75dB:d=0.4', '-f', 'null', '-'],
                           capture_output=True, text=True, encoding='utf-8', errors='ignore').stderr
        congela = [l.split('freeze_')[1] for l in r.splitlines() if 'freeze_start' in l or 'freeze_duration' in l]
        log('PRONTO', nome, 'congelamentos:', congela or 'nenhum')
        for d in glob.glob(r'G:\Meu Drive\Ative*institucionais'):
            shutil.copy2(saida, d)
            log('Drive', d)
    log('FIM')
finally:
    srv.terminate()
    os.remove(TRAVA)
