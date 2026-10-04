# -*- coding: utf-8 -*-
"""v7c (04/10, pedido do Jonas): a frase de confiança do encerramento vira tela própria, digitada com a voz (como a
assinatura da Apresentação v12); no "Ative." o símbolo gira e o ATIVE entra embaixo da pirâmide. Final segura 4 s.
Aplica as mudanças em montar_v7_outros.py (gerador das duas páginas) e em retime.py (fim=4.0)."""
import io, os
AQUI = os.path.dirname(os.path.abspath(__file__))
p = os.path.join(AQUI, 'montar_v7_outros.py')
s = io.open(p, encoding='utf-8').read()


def troca(a, b, n=1):
    global s
    assert s.count(a) == n, (s.count(a), a[:90])
    s = s.replace(a, b)


# 1) CSS da tela digitada (derivada da .fimQ da v12: 140 px -> 108 px, cabe "Antes de qualquer negócio," numa linha)
troca(".fio{width:64px;height:5px;border-radius:3px;background:#C9A24B;transform-origin:50% 50%}\n",
      ".fio{width:64px;height:5px;border-radius:3px;background:#C9A24B;transform-origin:50% 50%}\n"
      "#fim2{z-index:60}\n"
      ".fimQ{color:#fff;font-weight:800;font-size:108px;line-height:1.1;letter-spacing:-2.2px;white-space:nowrap;text-align:center}\n"
      ".fimQ .cur{display:inline-block;width:8px;height:92px;margin-left:10px;vertical-align:-10px;border-radius:3px;background:#2FE1F2;opacity:0}\n")

# 2) bloco(): função fimReal + chamada em renderReal, parametrizada por vídeo
troca("def bloco(VZ, montar, tt, qs, real):", "def bloco(VZ, montar, tt, qs, real, fim):")
FIMJS = r''' // v7c (04/10, pedido do Jonas): a frase de confiança vira tela própria, digitada com a voz; no "Ative." o símbolo gira e o
 // ATIVE entra embaixo da pirâmide, com os tempos do encerramento da Apresentação v12. A frase pequena sob o logo sai.
 const FL1=''' + "'<L1>'" + r''',FL2=''' + "'<L2>'" + r''',FA=R(<kA>),FB=R(<kB>),FIM=R(<kC>)+4.0;
 function fimReal(T){const e=$('fim2'),a0=FA+.1,ta=FA+.25,cut=EIO(P(T,FB-.3,FB));
  if(T<a0||cut>=1){e.style.opacity=0;}else{const ent=E(P(T,a0,a0+.35));e.style.opacity=ent*(1-cut);e.style.filter=`blur(${((1-ent)*10+cut*10).toFixed(2)}px)`;e.style.transform='translate(-50%,-50%)';
   const n=FL1.length+FL2.length,sp=Math.min(.06,(FB-.5-ta)/n),tx=ta+n*sp,k=T<ta?0:Math.min(n,Math.floor(n*P(T,ta,tx)+1e-6)),k1=Math.min(k,FL1.length),k2=Math.max(0,k-FL1.length);
   $('fmL1').textContent=FL1.slice(0,k1);$('fmL2').textContent=FL2.slice(0,k2);
   const blink=k<n?1:(Math.floor((T-tx)/.45)%2?0:1);$('fmC1').style.opacity=k<FL1.length?1:0;$('fmC2').style.opacity=k>=FL1.length?blink:0;}
  const P0=FB-.2,gl=$('gl'),pf=$('pfull'),sh=$('shine'),wm=$('wmEnd');$('endT').style.opacity=0;
  if(T<P0){gl.style.opacity=0;pf.style.opacity=0;sh.style.opacity=0;wm.style.opacity=0;return;}
  const sp=E(P(T,P0,P0+1.8)),fin=E(P(T,P0,P0+.45)),xf=EIO(P(T,P0+1.6,P0+2.15)),push=1+.05*P(T,P0+1.6,FIM);
  gl.style.opacity=fin*(1-xf);gl.style.filter=`blur(${(1-fin)*12}px)`;
  pf.style.opacity=xf;pf.style.transform=`scale(${push})`;pf.style.transformOrigin='50% 45%';
  const s1=(T>P0+2.1&&T<P0+3.05)?Math.sin(Math.PI*P(T,P0+2.1,P0+3.05))*.9:0;sh.style.opacity=s1;sh.style.backgroundPosition=`${100-100*P(T,P0+2.1,P0+3.05)}% 0`;sh.style.transform=`scale(${push})`;sh.style.transformOrigin='50% 45%';
  if(T<P0+2.3)window.render3d&&window.render3d((1-sp)*3*Math.PI*2,(.62+.38*sp),T);
  const w=E(P(T,P0+2.15,P0+3.15));wm.style.opacity=w;wm.style.filter=`blur(${(1-w)*16}px)`;wm.style.transform=`translate(-50%,-50%) translateY(${262+(1-w)*24}px)`;}
'''
troca(" window.renderReal=function(T){\n  perguntas(T);\n''' + real + r'''\n };})();",
      "''' + FIMJS.replace('<L1>', fim['L1']).replace('<L2>', fim['L2']).replace('<kA>', str(fim['kA'])).replace('<kB>', str(fim['kB'])).replace('<kC>', str(fim['kC'])) + r'''"
      " window.renderReal=function(T){\n  perguntas(T);\n''' + real + r'''\n  fimReal(T);\n };})();")

# 3) HTML da tela digitada, antes do #endT de cada página
FIM2 = ('<div id="fim2" class="el" style="text-align:center"><div class="fio" style="margin:0 auto 40px"></div>'
        '<div class="fimQ"><span id="fmL1"></span><span class="cur" id="fmC1"></span><br><span id="fmL2"></span><span class="cur" id="fmC2"></span></div></div>\n')
troca("troca('<div id=\"legalJur\" class=\"legal\">', '<div id=\"legalJur\" class=\"legal\" style=\"z-index:56\">')",
      "troca('<div id=\"legalJur\" class=\"legal\">', '<div id=\"legalJur\" class=\"legal\" style=\"z-index:56\">')\n"
      "troca('<div id=\"endT\" class=\"el t\"', " + repr(FIM2) + " + '<div id=\"endT\" class=\"el t\"')")
# na Estruturação, o mesmo, ancorado na troca do título
troca("troca('<title>ATIVE · Estruturação de capital</title>', '<title>ATIVE · Estruturação de capital v7</title>')",
      "troca('<title>ATIVE · Estruturação de capital</title>', '<title>ATIVE · Estruturação de capital v7</title>')\n"
      "troca('<div id=\"endT\" class=\"el t\"', " + repr(FIM2) + " + '<div id=\"endT\" class=\"el t\"')")

# 4) parâmetros por vídeo: Estruturação falas 16 ("E toda parceria começa com confiança.", 61,22–64,21) e 17 ("Ative.", 64,21–65,0);
#    Tributário falas 18 ("Antes de qualquer negócio, existe confiança.", 70,90–74,23) e 19 ("Ative.", 74,23–75,04)
troca("""  V.degraus('wB',T-DS,41.85,46.6,[42.1,42.7,45.0]);\"\"\"))""",
      """  V.degraus('wB',T-DS,41.85,46.6,[42.1,42.7,45.0]);\"\"\", dict(L1='Toda parceria', L2='começa com confiança.', kA=16, kB=17, kC=18)))""")
troca("""  V.passos('wA',T-DS,61.15,64.45,[61.7,62.15,62.6,63.05]);\"\"\"))""",
      """  V.passos('wA',T-DS,61.15,64.45,[61.7,62.15,62.6,63.05]);\"\"\", dict(L1='Antes de qualquer negócio,', L2='existe confiança.', kA=18, kB=19, kC=20)))""")
io.open(p, 'w', encoding='utf-8', newline='\n').write(s)
print('montar_v7_outros.py ok')

# 5) retime.py: o final segura 4,0 s (era 2,5) para o ATIVE respirar depois do giro
r = r'C:\Users\Jonas\dev\Jonas-Alves-Sukenski\videos\narracao\retime.py'
t = io.open(r, encoding='utf-8').read()
for k in ('1_Estruturacao_v7', '3_Tributario_v7'):
    a = f"CORRIDA['{k}'] = dict(CORRIDA['{k.replace('_v7', '_v4')}'], D=1.5, fim=2.5,"
    b = f"CORRIDA['{k}'] = dict(CORRIDA['{k.replace('_v7', '_v4')}'], D=1.5, fim=4.0,"
    if b in t: print('ja tinha', k); continue
    assert t.count(a) == 1, (k, t.count(a)); t = t.replace(a, b)
t = t.replace("# antes da primeira pergunta), o final segura 2,5 s e a música ganha a mistura medida da Apresentação (+4 dB, duck leve).",
              "# antes da primeira pergunta), o final segura 2,5 s e a música ganha a mistura medida da Apresentação (+4 dB, duck leve).\n"
              "# v7c (04/10): o final passa a segurar 4,0 s — a frase de confiança vira tela digitada antes do símbolo, e o ATIVE só entra depois do giro.", 1)
io.open(r, 'w', encoding='utf-8', newline='\n').write(t)
print('retime.py ok')
