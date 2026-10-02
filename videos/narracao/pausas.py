"""Acha onde começa cada fala pelas pausas da voz (sem whisper; serve quando falta memória).
Estima o início de cada fala pelo tamanho do texto e escolhe, em ordem, as pausas mais próximas
(programação dinâmica que também premia pausa longa). Grava voz_bruta/audio{i}_falas.json, que alinhar.py lê.
Uso: python pausas.py <nome> <voz.wav>"""
import json, os, sys, wave
import numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gerar_guias import VIDEOS
from alinhar import AUDIO, BRUTA


def limites(wav, falas):
    w = wave.open(wav)
    x = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
    if w.getnchannels() > 1:
        x = x.reshape(-1, w.getnchannels()).mean(1)
    h = int(w.getframerate() * .02); n = len(x) // h
    r = 20 * np.log10(np.sqrt((x[:n * h].reshape(n, h) ** 2).mean(1)) + 1e-9)
    fala = np.where(r > -30)[0]; t0, t1 = fala[0] * .02, (fala[-1] + 1) * .02
    q = r < -32; pausas = []; i = 0
    while i < n:
        if q[i]:
            j = i
            while j < n and q[j]:
                j += 1
            if (j - i) * .02 >= .1 and i * .02 > t0 + .3 and j * .02 < t1:
                pausas.append(((i + j) / 2 * .02, (j - i) * .02))
            i = j
        else:
            i += 1
    c = np.array([len(f) + 6 for f in falas], float)
    est = t0 + (t1 - t0) * (np.cumsum(c) / c.sum())[:-1]
    K, m, INF = len(est), len(pausas), 1e9
    assert m >= K, f'só {m} pausas para {K} viradas de fala'
    custo = lambda k, j: (pausas[j][0] - est[k]) ** 2 / 4 - 3 * pausas[j][1]
    D = [[INF] * m for _ in range(K)]; B = [[-1] * m for _ in range(K)]
    for j in range(m):
        D[0][j] = custo(0, j)
    for k in range(1, K):
        best, bj = INF, -1
        for j in range(m):
            if j > 0 and D[k - 1][j - 1] < best:
                best, bj = D[k - 1][j - 1], j - 1
            if bj >= 0:
                D[k][j], B[k][j] = best + custo(k, j), bj
    j = min(range(m), key=lambda j: D[K - 1][j]); sel = []
    for k in range(K - 1, -1, -1):
        sel.append(j); j = B[k][j]
    b = [t0] + [pausas[j][0] for j in sel[::-1]] + [t1]
    return [(round(b[k], 2), round(b[k + 1], 2)) for k in range(len(falas))]


if __name__ == '__main__':
    nome, wav = sys.argv[1], sys.argv[2]
    falas = [f for _, _, f in VIDEOS[nome][1]]
    res = limites(wav, falas)
    json.dump(res, open(os.path.join(BRUTA, f'audio{AUDIO[nome]}_falas.json'), 'w'))
    for k, ((a, b), f) in enumerate(zip(res, falas)):
        print(f'{k + 1:2d} {a:6.2f}-{b:6.2f} ({b - a:5.2f})  {f[:50]}')
