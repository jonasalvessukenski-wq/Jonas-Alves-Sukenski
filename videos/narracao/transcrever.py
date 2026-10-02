"""Transcreve uma voz (wav 16 kHz) com o tempo de cada palavra, no formato que alinhar.py lê.
Uso: python transcrever.py <entrada.wav> <saida.json> [modelo]"""
import json, sys
from faster_whisper import WhisperModel

ent, sai = sys.argv[1], sys.argv[2]
m = WhisperModel(sys.argv[3] if len(sys.argv) > 3 else 'base', device='cpu', compute_type='int8', cpu_threads=2)
segs, _ = m.transcribe(ent, language='pt', word_timestamps=True, beam_size=1)
out = [{'start': x.start, 'end': x.end, 'text': x.text.strip(), 'words': [[w.start, w.end, w.word] for w in x.words]} for x in segs]
json.dump(out, open(sai, 'w', encoding='utf-8'), ensure_ascii=False)
print(sai, len(out), 'trechos')
