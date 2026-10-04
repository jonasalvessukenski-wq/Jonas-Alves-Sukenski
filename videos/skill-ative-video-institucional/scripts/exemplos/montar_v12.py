"""v12 = v11 + UMA correção: no encerramento, o comentário '// v11: ATIVE entra mais devagar…' engoliu a instrução
wm2.style.transform (ficou na mesma linha, depois do //). Sem o transform, o wordmark ATIVE perdeu o translateY(262px)
e apareceu no meio do símbolo em vez de embaixo da pirâmide (apontado pelo Jonas em 03/10/2026 ~22h30)."""
import os
A = r'C:\Users\Jonas\dev\Jonas-Alves-Sukenski\videos\apresentacao-ative'
src = open(os.path.join(A, 'inst_v11.html'), encoding='utf-8').read()

velho = ("wm2.style.filter=`blur(${(1-w)*16+cut*14}px)`; // v11: ATIVE entra mais devagar (1,0 s) e sai no corte"
         "wm2.style.transform=`translate(-50%,-50%) translateY(${262+(1-w)*24}px)`;")
novo = ("wm2.style.filter=`blur(${(1-w)*16+cut*14}px)`;"
        "wm2.style.transform=`translate(-50%,-50%) translateY(${262+(1-w)*24}px)`; // v11: ATIVE entra mais devagar (1,0 s) e sai no corte; v12: transform de volta (embaixo da pirâmide, como na v10)")
assert src.count(velho) == 1, src.count(velho)
out = src.replace(velho, novo)
assert out.count('wm2.style.transform=`translate(-50%,-50%) translateY(${262+(1-w)*24}px)`;') == 1
assert '<title>' in out
out = out.replace('v11', 'v12', 1) if '<title>' in out and 'v11' in out.split('</title>')[0] else out
open(os.path.join(A, 'inst_v12.html'), 'w', encoding='utf-8', newline='\n').write(out)
print('inst_v12.html gravada', len(out), 'bytes; v11 intacta', len(src))
