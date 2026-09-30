"""Acha, na gravação corrida, onde começa e termina cada fala do roteiro (pelas palavras transcritas)."""
import json, os, re, sys, unicodedata
from difflib import SequenceMatcher
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gerar_guias import VIDEOS

AUDIO = {'1_Estruturacao_de_Capital': 1, '2_Apresentacao_da_Ative': 2, '3_Tributario': 3, '4_Quem_Somos': 4}
BRUTA = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'voz_bruta')


def norm(w):
    w = unicodedata.normalize('NFD', w.lower())
    return re.sub(r'[^a-z0-9]', '', ''.join(c for c in w if unicodedata.category(c) != 'Mn'))


def alinhar(nome):
    i = AUDIO[nome]
    segs = json.load(open(os.path.join(BRUTA, f'audio{i}.json'), encoding='utf-8'))
    words = [(a, b, norm(w)) for s in segs for a, b, w in s['words'] if norm(w)]
    falas = VIDEOS[nome][1]
    script, owner = [], []
    for k, (_, _, t) in enumerate(falas):
        for w in t.split():
            if norm(w):
                script.append(norm(w)); owner.append(k)
    sm = SequenceMatcher(None, script, [w[2] for w in words], autojunk=False)
    m = {}
    for blk in sm.get_matching_blocks():
        for j in range(blk.size):
            m[blk.a + j] = blk.b + j
    res = []
    for k in range(len(falas)):
        idx = [m[p] for p in range(len(script)) if owner[p] == k and p in m]
        res.append((words[min(idx)][0], words[max(idx)][1]) if idx else None)
    # falas sem casamento: preenche pelo vão entre vizinhas
    for k, r in enumerate(res):
        if r is None:
            a = res[k - 1][1] if k and res[k - 1] else 0
            b = next((x[0] for x in res[k + 1:] if x), a + 2)
            res[k] = (a, b)
    return res


if __name__ == '__main__':
    out = {}
    for nome in AUDIO:
        res = alinhar(nome)
        falas = VIDEOS[nome][1]
        print('==', nome)
        for k, ((a, b), (s0, s1, t)) in enumerate(zip(res, falas)):
            vaga = (falas[k + 1][0] if k + 1 < len(falas) else 60.0) - s0
            print(f'{k+1:2d} voz {a:6.2f}-{b:6.2f} ({b-a:4.2f}s)  vaga {vaga:4.2f}s  {"ESTOURA" if b-a > vaga-0.1 else ""}  {t[:50]}')
        out[nome] = res
    json.dump(out, open(os.path.join(BRUTA, 'alinhamento.json'), 'w', encoding='utf-8'))
