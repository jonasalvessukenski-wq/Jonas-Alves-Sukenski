# -*- coding: utf-8 -*-
"""Refaz só um trecho de um vídeo já renderizado (página mudou num pedaço) e emenda onde a sessão nova coincide com a antiga.
1. Renderiza cada trecho pedido com sobra nas duas pontas (15 → 45 → 135 quadros), em UMA sessão por trecho.
2. Emenda só onde YMAX(antigo × novo) ≤ 3: isso só acontece em quadro SEM texto (fundo, feixes, 3D); texto parado
   re-rasteriza diferente a cada sessão (41–90). Sem coincidência, aumenta a sobra; sem solução, sai com código 2
   → refazer o vídeo inteiro (pipeline_video.py … tudo numa pasta de quadros nova).
3. Substitui os quadros, mede os pares da emenda e roda codificar/audio/conferir/celular do pipeline_video.py.

Uso: python refazer_trechos.py <config.json> <a-b> [<c-d> …]      (quadros; o trecho é o BLOCO inteiro que mudou)
Para descobrir o bloco: scripts/detectar.js (quadros em que um elemento está visível) e scripts/sonda_visiveis.js
(o que está visível quadro a quadro) — e lembrar o que a detecção por id não conhece (lição 21).
Origem: scratchpad refazer_trechos.py (04/10/2026), generalizado para a skill ative-video-institucional."""
import json, os, re, shutil, subprocess, sys
import imageio_ffmpeg

FF = imageio_ffmpeg.get_ffmpeg_exe(); PY = sys.executable
AQUI = os.path.dirname(os.path.abspath(__file__))
LIM = 3  # YMAX máximo para considerar que as duas sessões coincidem (ruído de JPEG)


def ymax(fa, fb):
    r = subprocess.run([FF, '-hide_banner', '-nostdin', '-i', fa, '-i', fb, '-filter_complex',
                        '[0][1]blend=all_mode=difference,signalstats,metadata=print:key=lavfi.signalstats.YMAX', '-f', 'null', '-'],
                       capture_output=True, text=True, encoding='utf-8', errors='ignore').stderr
    m = re.findall(r'YMAX=(\d+)', r); return int(m[-1]) if m else 999


def main(cfg_path, trechos):
    c = json.load(open(cfg_path, encoding='utf-8'))
    VID = c.get('vid', r'C:\Users\Jonas\dev\Jonas-Alves-Sukenski\videos')
    FV = c.get('fv', os.path.join(VID, 'estruturacao-de-capital', 'fonte', 'video'))
    Q = os.path.join(FV, c['q']); N = c['n']; url = c['url']
    print('trechos:', trechos, flush=True)
    subst = []
    for a, b in trechos:
        ok = False
        for M in (15, 45, 135):
            ra, rb = max(0, a - M), min(N, b + M)
            QF = os.path.join(FV, f"{c['q']}_fix_{a}_{M}"); shutil.rmtree(QF, ignore_errors=True); os.makedirs(QF)
            env = dict(os.environ, URL=url, FRAMES_DIR=QF, FROM=str(ra), TO=str(rb), PYTHON=PY)
            subprocess.run(['node', os.path.join(FV, 'render.js'), 'frames'], env=env, cwd=FV, check=True)
            s_ini = next((i for i in range(min(a, rb - 1), ra - 1, -1) if ymax(os.path.join(Q, f'f{i:05d}.jpg'), os.path.join(QF, f'f{i:05d}.jpg')) <= LIM), None) if ra > 0 else 0
            if rb >= N: s_fim = N
            else: s_fim = next((j for j in range(b, rb) if ymax(os.path.join(Q, f'f{j:05d}.jpg'), os.path.join(QF, f'f{j:05d}.jpg')) <= LIM), None)
            print(f'  trecho {a}-{b} sobra {M}: emenda inicio={s_ini} fim={s_fim}', flush=True)
            if s_ini is not None and s_fim is not None:
                subst.append((s_ini, s_fim, QF)); ok = True; break
        if not ok:
            print('SEM EMENDA LIMPA no trecho', a, b, '-> refazer o video inteiro', flush=True); sys.exit(2)
    for s0, s1, QF in subst:
        for i in range(s0, s1): shutil.copyfile(os.path.join(QF, f'f{i:05d}.jpg'), os.path.join(Q, f'f{i:05d}.jpg'))
        med = []
        for i in (s0 - 2, s0 - 1, s0, s1 - 1, s1):
            if 0 < i < N: med.append(f'{i-1}/{i}: {ymax(os.path.join(Q, f"f{i-1:05d}.jpg"), os.path.join(Q, f"f{i:05d}.jpg"))}')
        print(f'substituidos {s0}-{s1} ({s1-s0} quadros); pares na emenda: ' + ' · '.join(med), flush=True)
    for p in ('codificar', 'audio', 'conferir', 'celular'):
        subprocess.run([PY, os.path.join(AQUI, 'pipeline_video.py'), cfg_path, p], check=True)


if __name__ == '__main__':
    tr = [tuple(int(x) for x in t.split('-')) for t in sys.argv[2:]]
    assert tr, 'informe ao menos um trecho a-b (quadros)'
    main(sys.argv[1], tr)
