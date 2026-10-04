# -*- coding: utf-8 -*-
"""Prévia pedida pelo Jonas (04/10 ~09h30): na Apresentação v12, os três cartões do tributário (RECUPERAR / PLANEJAR /
A REFORMA, hoje uma imagem recebida com foto) virariam ILUSTRAÇÕES desenhadas, animadas conforme a narração.
Não altera a v12: gera uma página narrada nova (narr_previa_cartoes_ilustrados.html) a partir do invólucro da v12,
trocando só essa cena. Texto em HTML (parado), ilustração em SVG movida quadro a quadro pelo tempo t da página.
Entradas dos cartões iguais à v12: ta+0,1 (fala 14 "Buscamos recuperar…"), M.tp1 (70,7 s, "planejamento tributário…"),
V[15] ("Para a reforma tributária…"); saída em V[16]. Sem escala contínua no grupo (regra do texto parado)."""
import io, os, re
FV = r'C:\Users\Jonas\dev\Jonas-Alves-Sukenski\videos\estruturacao-de-capital\fonte\video'
src = os.path.join(FV, 'narr_2_Apresentacao_v12.html')
dst = os.path.join(FV, 'narr_previa_cartoes_ilustrados.html')
s = io.open(src, encoding='utf-8').read()


def troca(a, b, n=1):
    global s
    assert s.count(a) == n, (s.count(a), a[:80])
    s = s.replace(a, b)


# 1) CSS dos cartões ilustrados (no lugar da imagem recebida)
troca('.tpi{width:549px;height:805px;border-radius:40px;background:url(../ia_apres/cartoes_tributario_recebido_0310.jpg) no-repeat;background-size:1800px auto;box-shadow:0 40px 80px rgba(0,0,40,.5)}',
      '.tpc{background:linear-gradient(180deg,#10307f 0%,#0a1f5e 55%,#071747 100%);border:1px solid rgba(255,255,255,.22)}\n'
      '.tpc .ilu{position:absolute;left:0;top:0;width:560px;height:440px;overflow:hidden}\n'
      '.tpc .pan{position:absolute;left:22px;right:22px;bottom:22px;height:200px;border-radius:24px;background:rgba(8,18,66,.72);border:1px solid rgba(255,255,255,.26);padding:24px 26px;box-sizing:border-box}\n'
      '.tpc .lab{color:#2FE1F2;font-weight:800;font-size:21px;letter-spacing:6px}\n'
      '.tpc .txt{color:#fff;font-weight:700;font-size:38px;line-height:1.12;margin-top:10px;letter-spacing:-.5px}\n'
      '.tpc svg text{font-family:M,sans-serif}')
troca('#tax.img{width:1705px;height:805px}#tax.img #tp1{left:578px}#tax.img #tp2{left:1156px}',
      '#tax.img{width:1740px;height:680px}#tax.img #tp1{left:590px}#tax.img #tp2{left:1180px}')

# 2) HTML: três cartões com ilustração SVG + painel de texto
W = '#FFFFFF'; AZ = '#4FB3FF'; AZ2 = '#7CC7F5'; CI = '#2FE1F2'; OU = '#E2B960'; OU2 = '#C9A24B'
def defs():
    return ('<defs><radialGradient id="gl" cx="50%" cy="40%" r="60%"><stop offset="0" stop-color="#2a66d8" stop-opacity=".55"/><stop offset="1" stop-color="#0a1f5e" stop-opacity="0"/></radialGradient>'
            '<linearGradient id="scan" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2FE1F2" stop-opacity="0"/><stop offset=".5" stop-color="#2FE1F2" stop-opacity=".45"/><stop offset="1" stop-color="#2FE1F2" stop-opacity="0"/></linearGradient>'
            '<linearGradient id="gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F0D08A"/><stop offset="1" stop-color="#B8924F"/></linearGradient></defs>'
            '<rect width="560" height="440" fill="url(#gl)"/>'
            '<path d="M470 18 a72 72 0 0 1 72 72" fill="none" stroke="#C9A24B" stroke-width="3" opacity=".9"/>')

# RECUPERAR: documento, varredura, linhas que viram ouro, moedas voltando
linhas = ''.join(f'<rect id="r_l{i}" x="152" y="{104+i*32}" width="{[250,190,230,160,240,200,170][i]}" height="11" rx="5.5" fill="rgba(255,255,255,.55)"/>' for i in range(7))
svg0 = (f'<svg viewBox="0 0 560 440" width="560" height="440">{defs()}'
        '<rect x="122" y="66" width="316" height="300" rx="18" fill="rgba(255,255,255,.08)" stroke="rgba(255,255,255,.75)" stroke-width="2"/>'
        '<rect x="152" y="86" width="120" height="10" rx="5" fill="rgba(255,255,255,.35)"/>'
        + linhas +
        '<rect id="r_scan" x="122" y="66" width="316" height="46" fill="url(#scan)" opacity="0"/>'
        '<g id="r_c2" opacity="0"><circle cx="420" cy="173.5" r="15" fill="url(#gold)"/><text x="420" y="178" text-anchor="middle" font-size="12" font-weight="800" fill="#1b1b4d">R$</text></g>'
        '<g id="r_c5" opacity="0"><circle cx="372" cy="269.5" r="15" fill="url(#gold)"/><text x="372" y="274" text-anchor="middle" font-size="12" font-weight="800" fill="#1b1b4d">R$</text></g>'
        '<path id="r_arrow" d="M440 230 C 496 222, 512 176, 470 134" fill="none" stroke="#2FE1F2" stroke-width="5" stroke-linecap="round" stroke-dasharray="200" stroke-dashoffset="200"/>'
        '<path id="r_head" d="M456 138 L470 124 L486 142" fill="none" stroke="#2FE1F2" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" opacity="0"/>'
        '<g id="r_coins" opacity="0"><ellipse cx="470" cy="108" rx="30" ry="10" fill="url(#gold)"/><ellipse cx="470" cy="96" rx="30" ry="10" fill="url(#gold)" stroke="#8a6a2a" stroke-width="1"/><ellipse cx="470" cy="84" rx="30" ry="10" fill="url(#gold)" stroke="#8a6a2a" stroke-width="1"/></g>'
        '</svg>')

# PLANEJAR: tablet, barras que crescem, linha que se desenha, caneta que acompanha
barras = ''.join(f'<rect id="p_b{i}" x="{150+i*60}" y="330" width="36" height="0" rx="6" fill="{OU if i==4 else AZ}" opacity=".95"/>' for i in range(5))
svg1 = (f'<svg viewBox="0 0 560 440" width="560" height="440">{defs()}'
        '<rect x="88" y="44" width="384" height="352" rx="28" fill="rgba(255,255,255,.06)" stroke="rgba(255,255,255,.8)" stroke-width="2.5"/>'
        '<rect x="110" y="70" width="340" height="300" rx="14" fill="rgba(20,60,160,.35)"/>'
        '<line x1="134" y1="330" x2="430" y2="330" stroke="rgba(255,255,255,.5)" stroke-width="2"/>'
        + barras +
        '<polyline id="p_line" points="168,230 228,200 288,215 348,160 408,120" fill="none" stroke="#2FE1F2" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="400" stroke-dashoffset="400"/>'
        '<circle id="p_halo" cx="168" cy="230" r="14" fill="#2FE1F2" opacity="0"/><circle id="p_dot" cx="168" cy="230" r="8" fill="#fff" opacity="0"/>'
        '<g id="p_pen" opacity="0"><path d="M0 0 L20 -58 L34 -54 L14 4 Z" fill="url(#gold)" stroke="#8a6a2a" stroke-width="1"/><path d="M0 0 L14 4 L4 12 Z" fill="#1b1b4d"/></g>'
        '</svg>')

# A REFORMA: equipe à mesa, notebook, selo de qualificação
def pessoa(i, x, y, cor):
    return (f'<g id="f_p{i}" opacity="0"><path d="M{x-46} {y+70} q0 -46 46 -46 q46 0 46 46 Z" fill="{cor}" opacity=".95"/>'
            f'<circle cx="{x}" cy="{y}" r="24" fill="{cor}"/><circle cx="{x}" cy="{y}" r="24" fill="none" stroke="rgba(255,255,255,.7)" stroke-width="2"/></g>')
svg2 = (f'<svg viewBox="0 0 560 440" width="560" height="440">{defs()}'
        '<ellipse cx="280" cy="352" rx="214" ry="44" fill="rgba(255,255,255,.10)" stroke="rgba(255,255,255,.35)" stroke-width="2"/>'
        + pessoa(0, 150, 240, AZ2) + pessoa(1, 280, 212, AZ) + pessoa(2, 410, 240, CI) +
        '<g id="f_lap"><rect x="226" y="300" width="108" height="9" rx="4" fill="rgba(255,255,255,.85)"/><rect x="234" y="236" width="92" height="66" rx="7" fill="rgba(10,30,110,.9)" stroke="rgba(255,255,255,.85)" stroke-width="2"/>'
        '<rect id="f_s0" x="246" y="284" width="12" height="0" fill="#4FB3FF"/><rect id="f_s1" x="264" y="284" width="12" height="0" fill="#2FE1F2"/><rect id="f_s2" x="282" y="284" width="12" height="0" fill="#E2B960"/><rect id="f_s3" x="300" y="284" width="12" height="0" fill="#4FB3FF"/></g>'
        '<g id="f_badge" opacity="0"><circle id="f_glow" cx="280" cy="112" r="62" fill="#E2B960" opacity=".18"/><circle cx="280" cy="112" r="44" fill="url(#gold)"/><circle cx="280" cy="112" r="36" fill="none" stroke="rgba(255,255,255,.75)" stroke-width="2"/>'
        '<path d="M258 113 L273 128 L303 96" fill="none" stroke="#1b1b4d" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></g>'
        '<g id="f_b0" opacity="0"><rect x="112" y="150" width="56" height="40" rx="12" fill="rgba(255,255,255,.92)"/><path d="M126 170 L136 180 L154 160" fill="none" stroke="#1b7fd6" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></g>'
        '<g id="f_b2" opacity="0"><rect x="392" y="150" width="56" height="40" rx="12" fill="rgba(255,255,255,.92)"/><path d="M406 170 L416 180 L434 160" fill="none" stroke="#1b7fd6" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></g>'
        '</svg>')

def cartao(i, svg, lab, txt):
    return (f'<div class="tp tpc" id="tp{i}"><div class="ilu">{svg}</div>'
            f'<div class="pan"><div class="lab">{lab}</div><div class="txt">{txt}</div></div></div>')

html_novo = ('<div id="tax" class="el img" style="width:1740px;height:680px">\n'
             + cartao(0, svg0, 'RECUPERAR', 'Buscamos recuperar valores pagos a mais.') + '\n'
             + cartao(1, svg1, 'PLANEJAR', 'Planejamento tributário e estratégia jurídica.') + '\n'
             + cartao(2, svg2, 'A REFORMA', 'Equipe especializada e altamente qualificada.') + '\n</div>')
m = re.search(r'<div id="tax" class="el img"[^>]*>.*?\n</div>', s, re.S); assert m
s = s[:m.start()] + html_novo + s[m.end():]

# 3) JS: animação das ilustrações pelo tempo da página (u = segundos desde a entrada do cartão)
ILU = r'''
/* prévia 04/10: ilustrações dos cartões do tributário, animadas pelo tempo t da página (sem escala no texto) */
const EBk=x=>{const c=1.70158;x=Math.max(0,Math.min(1,x));return 1+(c+1)*Math.pow(x-1,3)+c*Math.pow(x-1,2)};
const SA=(id,k,v)=>$(id).setAttribute(k,v);
const ILU=[
 u=>{ /* RECUPERAR */
  const sc=EIO(P(u,.3,2.7)),y=66+sc*(366-46-66);$('r_scan').setAttribute('y',y);$('r_scan').setAttribute('opacity',u<.3?0:(u<2.7?1:Math.max(0,1-P(u,2.7,3.1))));
  [[2,173.5,420,'r_c2'],[5,269.5,372,'r_c5']].forEach(([i,cy,cx,c])=>{const k=P(y+23-cy,0,30);SA('r_l'+i,'fill',k>0?'#E2B960':'rgba(255,255,255,.55)');
   SA(c,'opacity',k>0?1:0);SA(c,'transform',`translate(${cx} ${cy}) scale(${EBk(k).toFixed(3)}) translate(${-cx} ${-cy})`);});
  const d=P(u,2.9,3.7);SA('r_arrow','stroke-dashoffset',200-200*E(d));SA('r_head','opacity',d>=1?1:0);
  const co=E(P(u,3.4,4.0)),bob=Math.sin(u*2.6)*4*co;SA('r_coins','opacity',co);SA('r_coins','transform',`translate(0 ${(1-co)*30+bob})`);},
 u=>{ /* PLANEJAR */
  const H=[92,132,112,172,212];H.forEach((h,i)=>{const g=E(P(u,.3+i*.18,.9+i*.18)),hh=h*g;SA('p_b'+i,'height',hh);SA('p_b'+i,'y',330-hh);});
  const d=E(P(u,1.5,2.7));SA('p_line','stroke-dashoffset',400-400*d);
  const pts=[[168,230],[228,200],[288,215],[348,160],[408,120]],L=400*d;let acc=0,px=168,py=230;
  for(let i=0;i<4;i++){const [x0,y0]=pts[i],[x1,y1]=pts[i+1],seg=Math.hypot(x1-x0,y1-y0);if(L<=acc+seg){const f=(L-acc)/seg;px=x0+(x1-x0)*f;py=y0+(y1-y0)*f;break;}acc+=seg;px=x1;py=y1;}
  const on=u>=1.5?1:0,pulse=d>=1?8+2*Math.sin(u*3.2):8;SA('p_dot','cx',px);SA('p_dot','cy',py);SA('p_dot','r',pulse);SA('p_dot','opacity',on);
  SA('p_halo','cx',px);SA('p_halo','cy',py);SA('p_halo','r',d>=1?16+4*Math.sin(u*3.2):14);SA('p_halo','opacity',on*.35);
  const pen=E(P(u,1.2,1.6)),lift=d>=1?6+3*Math.sin(u*2.2):0;SA('p_pen','opacity',pen);SA('p_pen','transform',`translate(${px+2} ${py-2-lift}) rotate(${18+(1-pen)*20})`);},
 u=>{ /* A REFORMA */
  [0,1,2].forEach(i=>{const p=E(P(u,.2+i*.25,.9+i*.25)),bob=Math.sin(u*1.6+i)*3;SA('f_p'+i,'opacity',p);SA('f_p'+i,'transform',`translate(0 ${(1-p)*40+bob*p})`);});
  [34,48,26,56].forEach((h,i)=>{const g=E(P(u,1.3+i*.15,1.8+i*.15)),hh=h*g;SA('f_s'+i,'height',hh);SA('f_s'+i,'y',284-hh);});
  const b=EBk(P(u,2.0,2.6)),gp=.14+.08*Math.sin(u*2.4);SA('f_badge','opacity',Math.min(1,b*1.5));SA('f_badge','transform',`translate(280 112) scale(${Math.max(0,b)}) translate(-280 -112)`);SA('f_glow','opacity',gp);
  [[0,2.8],[2,3.1]].forEach(([i,t0])=>{const p=EBk(P(u,t0,t0+.5)),bob=Math.sin(u*2+i)*3;SA('f_b'+i,'opacity',Math.min(1,p));SA('f_b'+i,'transform',`translate(0 ${(1-Math.min(1,p))*16+bob})`);});}
];
'''
troca('const V=[1.04,2.36,5.22,', ILU + 'const V=[1.04,2.36,5.22,')
m = re.search(r" const tx=\$\('tax'\),ta=V\[14\],tb=V\[16\];.*?\} else tx\.style\.opacity=0;", s, re.S); assert m
js_novo = (" const tx=$('tax'),ta=V[14],tb=V[16];\n"
           " if(t>=ta&&t<tb){const po=EIO(P(t,tb-.4,tb));tx.style.opacity=1-po;tx.style.filter=`blur(${po*16}px)`;tx.style.transform='translate(-50%,-50%)';\n"
           "  [ta+.1,M.tp1,V[15]].forEach((a,i)=>{const el=$('tp'+i),p=E(P(t,a,a+.8));\n"
           "   el.style.opacity=p;el.style.filter=`blur(${(1-p)*14}px)`;el.style.transform=`translateY(${(1-p)*90}px) perspective(1600px) rotateY(${(1-p)*(i-1)*-22}deg)`;\n"
           "   if(t>=a)ILU[i](t-a);});\n"
           " } else tx.style.opacity=0;")
s = s[:m.start()] + js_novo + s[m.end():]
troca('<title>', '<title>PRÉVIA cartões ilustrados · ', 1)
io.open(dst, 'w', encoding='utf-8', newline='\n').write(s)
print(dst, len(s))
