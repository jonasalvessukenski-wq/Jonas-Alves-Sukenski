# -*- coding: utf-8 -*-
"""Estruturação de Capital v7 (fonte/video/v10.html, a partir da v9.html = v6 do vídeo) e Tributário v7
(tributario/trib_v7.html, a partir da trib_v6.html), no padrão aprovado da Apresentação v11/v12 (03/10/2026, ~23h):
- abertura sem o campo de ícones coloridos: navy + feixes de luz, pergunta DIGITADA (cursor ciano) com a voz,
  depois o tile branco + logo como sempre;
- sem zoom lento em texto ou caixa (tremor); feixes sem filter:blur; vida da tela por dois feixes globais;
- telas de frase no desenho das pranchas: P3 (branco, 92–104 px, destaque azul, fio dourado), P5 (azul, luz + feixes +
  vinheta + fio + fita), P6/P8 (placa de vidro em PNG + ícone em traço + fio + etiqueta + frase);
- parede e painéis com arte desenhada (gradiente + ícone em traço) no lugar das fotos comprimidas;
- encerramento: ATIVE entra mais devagar, embaixo da pirâmide;
- v7_comum.js = v6_comum.js sem a câmera lenta das cenas (passos, degraus, ondas).
A voz, a música e a ordem das cenas não mudam; D passa de 0,3 para 1,5 s (música e cursor antes da primeira pergunta)."""
import io, os
V = r'C:\Users\Jonas\dev\Jonas-Alves-Sukenski\videos'
FV = os.path.join(V, 'estruturacao-de-capital', 'fonte', 'video')

h = ''
def troca(a, b, n=1):
    global h
    assert h.count(a) == n, (h.count(a), a[:100])
    h = h.replace(a, b)

CSS = r'''/* v7 (03/10 noite): padrão da Apresentação v12 — sem zoom em texto, placa de vidro em PNG, feixes sem filter, parede e painéis desenhados, perguntas digitadas */
.fio{width:64px;height:5px;border-radius:3px;background:#C9A24B;transform-origin:50% 50%}
#fim2{z-index:60}
.fimQ{color:#fff;font-weight:800;font-size:108px;line-height:1.1;letter-spacing:-2.2px;white-space:nowrap;text-align:center}
.fimQ .cur{display:inline-block;width:8px;height:92px;margin-left:10px;vertical-align:-10px;border-radius:3px;background:#2FE1F2;opacity:0}
.h2{font-weight:800;font-size:80px;line-height:1.1;letter-spacing:-1.5px;color:#fff;text-shadow:0 6px 40px rgba(0,20,80,.25);white-space:nowrap}
.h3{font-weight:800;font-size:104px;line-height:1.1;letter-spacing:-1.5px;color:var(--navy);white-space:nowrap}
.h3 b{font-weight:800;color:var(--blue)}
#luzS2{position:absolute;inset:0;opacity:0;background:radial-gradient(ellipse 45% 50% at 50% 50%,rgba(0,141,230,.07),rgba(0,141,230,0) 70%)}
#qLuz{position:absolute;left:50%;top:50%;width:1500px;height:900px;border-radius:50%;background:radial-gradient(ellipse at center,rgba(120,170,255,.15) 0%,rgba(120,170,255,.05) 40%,rgba(120,170,255,0) 70%);opacity:0;transform:translate(-50%,-50%)}
.q{color:#fff;font-weight:700;font-size:68px;line-height:1.18;white-space:nowrap;text-align:center;letter-spacing:-.5px}
.q .cur{display:inline-block;width:6px;height:58px;margin-left:8px;vertical-align:-6px;border-radius:2px;background:#2FE1F2;opacity:0}
.v7{position:absolute;inset:0;opacity:0;overflow:hidden;z-index:55;will-change:opacity,filter;font-family:M,sans-serif}
.v7 .cam{position:absolute;inset:0;will-change:transform,filter,opacity;transform-origin:50% 50%}
#ambG{position:absolute;inset:0;opacity:0;overflow:hidden;pointer-events:none}
#ambG .feixe{position:absolute;top:-40%;width:640px;height:180%;background:linear-gradient(90deg,rgba(255,255,255,0) 0%,rgba(255,255,255,.035) 28%,rgba(255,255,255,.10) 50%,rgba(255,255,255,.035) 72%,rgba(255,255,255,0) 100%);transform:rotate(-24deg)}
.tt .luz{position:absolute;inset:0;background:radial-gradient(ellipse 55% 60% at 22% 12%,rgba(255,255,255,.20),rgba(255,255,255,0) 70%)}
.tt.navy .luz{background:radial-gradient(ellipse 55% 60% at 25% 15%,rgba(90,120,255,.30),rgba(90,120,255,0) 70%)}
.tt .vinheta{position:absolute;inset:0;background:radial-gradient(ellipse 75% 80% at 50% 50%,rgba(0,0,0,0) 55%,rgba(0,20,80,.32) 100%)}
.tt .feixe{position:absolute;top:-40%;height:180%;width:560px;transform:rotate(-24deg);background:linear-gradient(90deg,rgba(255,255,255,0) 0%,rgba(255,255,255,.04) 28%,rgba(255,255,255,.11) 50%,rgba(255,255,255,.04) 72%,rgba(255,255,255,0) 100%)}
.tt .tile{position:absolute;left:810px;top:150px;width:300px;height:300px;display:flex;align-items:center;justify-content:center;opacity:0}
.tt .tile .tbg{position:absolute;left:-120px;top:-120px;width:540px;height:540px}
.tt .tile svg{position:relative;width:62%;height:62%;fill:none;stroke:#fff;stroke-width:6;stroke-linecap:round;stroke-linejoin:round}
.tt .tile .barra{fill:rgba(255,255,255,.22);stroke:rgba(255,255,255,.95);stroke-width:3.5}
.tt .tile .lin{stroke:#2FE1F2;stroke-width:8}
.tt .tile .pt{fill:#2FE1F2;stroke:none}
.tt .centro{position:absolute;left:0;right:0;top:63%;transform:translateY(-50%);text-align:center}
.tt .centro .fio{margin:0 auto 32px}
.tt .eyb2{font-weight:800;font-size:26px;letter-spacing:9px;color:rgba(255,255,255,.88);margin-bottom:26px;opacity:0}
.tt .h2{opacity:0}
.arte{position:absolute;inset:0;overflow:hidden}
.arte.t1{background:radial-gradient(ellipse at 20% 0%,#2a7fd6 0%,#0b2a7a 45%,#06154a 100%)}
.arte.t2{background:radial-gradient(ellipse at 80% 100%,#1aa7e8 0%,#0a4fa8 50%,#07215e 100%)}
.arte.t3{background:radial-gradient(ellipse at 30% 100%,#0e3f9a 0%,#0a1f66 55%,#060f3a 100%)}
.arte::after{content:'';position:absolute;top:-40%;left:36%;width:180px;height:180%;background:linear-gradient(90deg,rgba(255,255,255,0) 0%,rgba(255,255,255,.04) 30%,rgba(255,255,255,.10) 50%,rgba(255,255,255,.04) 70%,rgba(255,255,255,0) 100%);transform:rotate(-24deg)}
.arte svg{position:absolute;right:28px;top:18px;width:274px;height:274px;fill:none;stroke:rgba(255,255,255,.62);stroke-width:5;stroke-linecap:round;stroke-linejoin:round}
.arte svg .lin{stroke:#2FE1F2;stroke-opacity:.9}
.tp .arte svg{right:auto;left:143px;top:80px}'''

AMB_DOM = '''
<div id="qLuz"></div><div id="luzS2"></div>
<div id="ambG"><div class="feixe" id="agF0" style="left:420px;opacity:.55"></div><div class="feixe" id="agF1" style="left:1240px;opacity:.4"></div></div>
<div id="ambS3" class="v7 tt azul" style="z-index:auto"><div class="cam"><div class="luz"></div><div class="feixe" style="left:300px"></div><div class="feixe" style="left:1200px;opacity:.6"></div><div class="vinheta"></div></div></div>'''

ICOW = r'''// v7: cartões da parede e painéis desenhados (gradiente + ícone em traço) — as fotos antigas tinham ~1180×310 px, 12–43 KB, e saíam embaçadas
const ICOW={
 predio:'<path d="M60 262V92l90-42 90 42v170"/><path d="M40 262h220"/><path d="M100 124h20M140 124h20M180 124h20M100 164h20M140 164h20M180 164h20M100 204h20M140 204h20M180 204h20"/><path class="lin" d="M130 262v-42h40v42"/>',
 agro:'<path d="M150 272V70"/><path d="M150 122c-30 0-55-20-60-52 30 0 55 20 60 52z"/><path d="M150 122c30 0 55-20 60-52-30 0-55 20-60 52z"/><path d="M150 178c-30 0-55-20-60-52 30 0 55 20 60 52z"/><path d="M150 178c30 0 55-20 60-52-30 0-55 20-60 52z"/><path d="M150 234c-30 0-55-20-60-52 30 0 55 20 60 52z"/><path class="lin" d="M150 234c30 0 55-20 60-52-30 0-55 20-60 52z"/>',
 fundo:'<ellipse cx="150" cy="92" rx="80" ry="28"/><path d="M70 92v50c0 15 36 28 80 28s80-13 80-28V92"/><path d="M70 142v50c0 15 36 28 80 28s80-13 80-28v-50"/><path class="lin" d="M70 192v40c0 15 36 28 80 28s80-13 80-28v-40"/>',
 titulo:'<path d="M70 30h110l50 50v180a10 10 0 0 1-10 10H70a10 10 0 0 1-10-10V40a10 10 0 0 1 10-10z"/><path d="M180 30v50h50"/><path d="M90 130h100M90 165h100M90 200h60"/><circle class="lin" cx="200" cy="225" r="26"/><path class="lin" d="M188 225l9 9 16-18"/>',
 ciclo:'<path d="M60 150a90 90 0 0 1 160-56"/><path d="M240 150a90 90 0 0 1-160 56"/><path class="lin" d="M222 60v36h-36"/><path class="lin" d="M78 240v-36h36"/>',
 escudo:'<path d="M150 30l100 36v80c0 60-42 104-100 124C92 250 50 206 50 146V66z"/><path class="lin" d="M108 150l28 28 56-60"/>',
 ideia:'<path d="M110 200c-24-18-40-46-40-78a80 80 0 0 1 160 0c0 32-16 60-40 78v24H110z"/><path d="M118 250h64M126 272h48"/><path class="lin" d="M150 122v78"/><path class="lin" d="M128 148l22 22 22-22"/>',
 banco:'<path d="M40 112l110-62 110 62H40z"/><path d="M70 112v110M120 112v110M180 112v110M230 112v110"/><path d="M50 222h200M36 252h228"/><circle class="lin" cx="150" cy="86" r="10"/>',
 pessoas:'<circle cx="150" cy="96" r="36"/><path d="M78 256v-36a72 72 0 0 1 144 0v36"/><circle cx="66" cy="124" r="26"/><path class="lin" d="M22 246v-28a46 46 0 0 1 58-44"/><circle cx="234" cy="124" r="26"/><path class="lin" d="M278 246v-28a46 46 0 0 0-58-44"/>',
 grafico:'<path d="M40 256h220"/><rect x="62" y="176" width="36" height="80" rx="7"/><rect x="118" y="140" width="36" height="116" rx="7"/><rect x="174" y="108" width="36" height="148" rx="7"/><path class="lin" d="M54 150l56-36 56 10 70-74"/><path class="lin" d="M206 50h30v30"/>',
 calendario:'<rect x="50" y="62" width="200" height="190" rx="18"/><path d="M50 118h200"/><path d="M98 40v44M202 40v44"/><path d="M90 160h28M136 160h28M182 160h28M90 206h28M136 206h28"/><path class="lin" d="M182 206h28"/>',
 balanca:'<path d="M150 56v196"/><path d="M100 252h100"/><path d="M62 96h176"/><path d="M62 96l-38 80a38 24 0 0 0 76 0z"/><path d="M238 96l-38 80a38 24 0 0 0 76 0z"/><circle class="lin" cx="150" cy="80" r="14"/>'};
'''

# tela digitada do encerramento (v7c), parametrizada por vídeo em bloco()
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

# ---------------------------------------------------------------- bloco de tempo real (comum aos dois, com parâmetros)
def bloco(VZ, montar, tt, qs, real, fim):
    return r'''<!-- v6 (03/10): cenas reconstruídas em HTML/SVG · v7 (03/10 noite): padrão da Apresentação v12 -->
<link rel="stylesheet" href="v6_comum.css"><script src="v7_comum.js"></script>
<script>
(function(){const V=window.V6,$=id=>document.getElementById(id);
 const P=V.P,E=V.E,EIO=V.EIO,cl=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
 const D=1.5,DS=D-0.3; // v7: a voz entra em 1,5 s (era 0,3): música e cursor antes da primeira pergunta; as cenas da v6 recebem T-DS
 const VZ=''' + VZ + r'''; // início de cada fala na voz (alinhamento) e fim da última
 const R=(k,off=0)=>D+VZ[k]+off;
''' + montar + r'''
 V.montarFita('wF');{const f=$('wF');f._a.setAttribute('stroke','#fff');f._a.setAttribute('stroke-opacity','.30');f._b.setAttribute('stroke-opacity','.9');}
 // títulos com placa de vidro (pranchas P6/P8 da Apresentação): luz, feixes, vinheta, placa em PNG com ícone em traço, fio, etiqueta e frase
 const ICO={
  grafico:'<path d="M38 252h228"/><rect class="barra" x="60" y="170" width="36" height="82" rx="7"/><rect class="barra" x="116" y="136" width="36" height="116" rx="7"/><rect class="barra" x="172" y="104" width="36" height="148" rx="7"/><rect class="barra" x="228" y="66" width="36" height="186" rx="7"/><path class="lin" d="M52 152 L110 118 L166 126 L236 52"/><path class="lin" d="M206 52h30v30"/><circle class="pt" cx="52" cy="152" r="9"/><circle class="pt" cx="110" cy="118" r="9"/><circle class="pt" cx="166" cy="126" r="9"/>',
  lupa:'<circle cx="128" cy="122" r="76"/><path class="lin" d="M184 178l62 62"/><path d="M98 148v-30M128 148V88M158 148v-46"/>',
  documento:'<path d="M70 34h104l58 58v170a12 12 0 0 1-12 12H70a12 12 0 0 1-12-12V46a12 12 0 0 1 12-12z"/><path d="M174 34v58h58"/><path d="M94 140h92M94 174h92"/><path class="lin" d="M100 222l20 20 46-46"/>',
  equipe:'<circle cx="150" cy="92" r="34"/><path d="M82 250v-34a68 68 0 0 1 136 0v34"/><circle cx="68" cy="116" r="26"/><path class="lin" d="M22 240v-26a46 46 0 0 1 58-44"/><circle cx="232" cy="116" r="26"/><path class="lin" d="M278 240v-26a46 46 0 0 0-58-44"/>'};
 function montarTitulo(id,tom,ico,eyb,frase,sz){const e=document.createElement('div');e.id=id;e.className='v7 tt '+tom;
  e.innerHTML=`<div class="cam"><div class="luz"></div><div class="feixe" style="left:300px"></div><div class="feixe" style="left:860px;opacity:.7"></div><div class="feixe" style="left:1420px;opacity:.5"></div><div class="vinheta"></div><div class="tile"><img class="tbg" src="../assets/tile_vidro.png"><svg viewBox="0 0 300 300">${ICO[ico]}</svg></div><div class="centro"><div class="fio"></div><div class="eyb2"${eyb?'':' style="display:none"'}>${eyb}</div><div class="h2"${sz?` style="font-size:${sz}px"`:''}>${frase}</div></div></div>`;
  $('stage').appendChild(e);e._fx=[...e.querySelectorAll('.feixe')];e._tile=e.querySelector('.tile');e._tr=[...e.querySelectorAll('.tile svg *')];
  e._fio=e.querySelector('.fio');e._eyb=e.querySelector('.eyb2');e._h=e.querySelector('.h2');return e;}
''' + tt + r'''
 const dash=(p,k)=>{const L=p.getTotalLength();p.style.strokeDasharray=L;p.style.strokeDashoffset=(L*(1-cl(k))).toFixed(1);};
 function titulo(id,T,a,b){const e=$(id);if(T<a||T>b+.05){e.style.opacity=0;return;}
  const out=EIO(P(T,b-.4,b)),k=P(T,a,b);e.style.opacity=1-out;e.style.filter=`blur(${(out*14).toFixed(2)}px)`;
  e._fx.forEach((f,i)=>{f.style.transform=`translateX(${((k*300-150)*(1+i*.3)).toFixed(1)}px) rotate(-24deg)`;});
  const tp=E(P(T,a,a+.6)),tl=e._tile;tl.style.opacity=tp;tl.style.transform=`translateY(${((1-tp)*40).toFixed(1)}px) scale(${(.92+.08*tp).toFixed(4)})`; // sem filter na placa (PNG): sem blocos brancos
  const n=e._tr.length;e._tr.forEach((p,i)=>{const q=P(T,a+.25+i*(1.1/n),a+.25+i*(1.1/n)+.5);if(p.classList.contains('pt')){p.style.opacity=q;}else{dash(p,q);p.style.fillOpacity=q;}});
  e._fio.style.transform=`scaleX(${E(P(T,a+.2,a+.6)).toFixed(3)})`;
  const ep=E(P(T,a+.3,a+.7));e._eyb.style.opacity=ep;e._eyb.style.transform=`translateY(${((1-ep)*14).toFixed(1)}px)`;
  const hp=E(P(T,a+.4,a+.95));e._h.style.opacity=hp;e._h.style.filter=`blur(${((1-hp)*12).toFixed(2)}px)`;e._h.style.transform=`translateY(${((1-hp)*36).toFixed(1)}px)`;}
 // ambiente da prancha P5 (luz + feixes + vinheta) atrás das frases sobre o azul, em uma ou mais janelas de tempo real
 const ambE=$('ambS3');ambE._fx=[...ambE.querySelectorAll('.feixe')];
 function amb(T,wins){let o=0,k=0;wins.forEach(([a,b])=>{if(T>=a&&T<=b){o=Math.max(o,E(P(T,a,a+.4))*(1-P(T,b-.3,b)));k=P(T,a,b);}});
  ambE.style.opacity=o;if(o>0)ambE._fx.forEach((f,i)=>{f.style.transform=`translateX(${((k*300-150)*(1+i*.3)).toFixed(1)}px) rotate(-24deg)`;});}
 // perguntas digitadas (duas linhas), cursor ciano: pisca antes da voz, acompanha a digitação, pisca depois
 const QS=''' + qs + r''';
 function perguntas(T){QS.forEach(q=>{const e=$(q.id),L1=q.L[0],L2=q.L[1],n=L1.length+L2.length;
  if(T<q.a0||T>=q.b){e.style.opacity=0;return;}
  const sp=Math.min(.06,(q.b-q.a)*.7/n),tx=q.a+n*sp,k=T<q.a?0:Math.min(n,Math.floor(n*P(T,q.a,tx)+1e-6)),sai=EIO(P(T,q.b-.25,q.b)),ent=E(P(T,q.a0,q.a0+.35));
  e.style.opacity=ent*(1-sai);e.style.filter=`blur(${((1-ent)*8+sai*8).toFixed(2)}px)`;e.style.transform=`translate(-50%,-50%) translateY(${((1-ent)*16-sai*14).toFixed(1)}px)`;
  const k1=Math.min(k,L1.length),k2=Math.max(0,k-L1.length);$(q.id+'a').textContent=L1.slice(0,k1);$(q.id+'b').textContent=L2.slice(0,k2);
  const blink=(Math.floor(T/.4)%2?0:1);
  $(q.id+'c1').style.opacity=k<L1.length?(T<q.a?blink:1):0;$(q.id+'c2').style.opacity=k>=L1.length?(k<n?1:blink):0;});}
''' + FIMJS.replace('<L1>', fim['L1']).replace('<L2>', fim['L2']).replace('<kA>', str(fim['kA'])).replace('<kB>', str(fim['kB'])).replace('<kC>', str(fim['kC'])) + r''' window.renderReal=function(T){
  perguntas(T);
''' + real + r'''
  fimReal(T);
 };})();
</script>'''

# ======================================================================= ESTRUTURAÇÃO v7
h = io.open(os.path.join(FV, 'v9.html'), encoding='utf-8').read()
troca('<title>ATIVE · Estruturação de capital</title>', '<title>ATIVE · Estruturação de capital v7</title>')
# v7d (04/10 ~07h20, pedido do Jonas): os dois avisos pequenos do rodapé saem (parede de parceiros e cartões de casos)
troca(" $('legalRede').style.opacity=(t>=26.6&&t<30.45)?Math.min(E(P(t,26.6,27.2)),1-P(t,30.1,30.45)):0;", " $('legalRede').style.opacity=0; /* v7d (04/10): aviso retirado da parede de parceiros, a pedido do Jonas */")
troca(" $('legal').style.opacity=(t>=33.4&&t<41.2)?Math.min(E(P(t,33.4,34.0)),1-P(t,40.9,41.2)):0;", " $('legal').style.opacity=0; /* v7d (04/10): aviso retirado dos cartões de casos, a pedido do Jonas */")
troca('<div id="endT" class="el t"', '<div id="fim2" class="el" style="text-align:center"><div class="fio" style="margin:0 auto 40px"></div><div class="fimQ"><span id="fmL1"></span><span class="cur" id="fmC1"></span><br><span id="fmL2"></span><span class="cur" id="fmC2"></span></div></div>\n' + '<div id="endT" class="el t"')
troca('\n</style></head>', '\n' + CSS + '\n</style></head>')
troca('<div id="icons" style="position:absolute;inset:0"></div>', '<div id="icons" style="position:absolute;inset:0"></div>' + AMB_DOM)
troca('<div id="t1" class="el t">O crédito da sua empresa vem com prazo curto,<br>juros altos e limite baixo?</div>',
      '<div id="q1" class="el q"><span id="q1a"></span><span class="cur" id="q1c1"></span><br><span id="q1b"></span><span class="cur" id="q1c2"></span></div>')
troca('<div id="t3" class="el t dark">Sua empresa tem mais a oferecer<br>do que os números mostram.</div>',
      '<div id="t3" class="el" style="text-align:center"><div class="fio" style="margin:0 auto 32px"></div><div class="h3" style="font-size:92px">Sua empresa tem <b>mais a oferecer</b><br>do que os números mostram.</div></div>')
troca('<div id="t3b" class="el t dark">Nós ajudamos as instituições financeiras<br>a enxergar esse valor.</div>',
      '<div id="t3b" class="el" style="text-align:center"><div class="fio" style="margin:0 auto 32px"></div><div class="h3" style="font-size:92px">Nós ajudamos<br>as instituições financeiras<br>a <b>enxergar esse valor</b>.</div></div>')
troca('<div id="t4" class="el t">Porque as possibilidades<br>vão além do seu banco.</div>',
      '<div id="t4" class="el" style="text-align:center"><div class="fio" style="margin:0 auto 32px"></div><div class="h2" style="font-size:92px">Porque as possibilidades<br>vão além do seu banco.</div></div>')
troca('<div id="t5" class="el t">O caminho começa<br>pela sua empresa.</div>',
      '<div id="t5" class="el" style="text-align:center"><div class="fio" style="margin:0 auto 32px"></div><div class="h2" style="font-size:92px">O caminho começa<br>pela sua empresa.</div></div>')
troca("const icons=POS.map((p,i)=>{const d=document.createElement('div');d.className='icon';d.style.background=COLS[i];d.innerHTML='<svg viewBox=\"0 0 24 24\">'+IC[p[2]]+'</svg>';$('icons').appendChild(d);return {d,x:p[0],y:p[1],ph:i*0.9};});",
      "const icons=[]; // v7: sem o campo de ícones coloridos (reprovado na Apresentação v9); a abertura vai direto às perguntas sobre o navy com feixes")
troca('const wallCards=[];\n', ICOW + "const ARTE={cra:['t2','agro'],cri:['t1','predio'],fidc:['t3','fundo'],debenture:['t1','titulo'],nota:['t2','titulo'],fiagro:['t3','agro'],\n ccb:['t3','titulo'],giro:['t1','ciclo'],safra:['t2','agro'],bndes:['t1','banco'],garantia:['t3','escudo'],finep:['t2','ideia'],fco:['t1','fundo']};\n"
      "document.querySelectorAll('.arte[data-ico]').forEach(e=>{e.innerHTML='<svg viewBox=\"0 0 300 300\">'+ICOW[e.dataset.ico]+'</svg>';});\nconst wallCards=[];\n")
troca(" show($('t2'),t,2.95,5.55);", " show($('t2'),t,2.95,6.7); // v7: a frase fica até o tile entrar (antes, os ícones giravam nesse trecho)")
troca("  const f=E(P(t,57.3,57.9));const et=$('endT');et.style.opacity=f;",
      "  const f=E(P(t,57.3,57.9))*(1-EIO(P(t,58.35,58.75)));const et=$('endT');et.style.opacity=f; /* v7: a frase sai quando o ATIVE entra (como na Apresentação v12); comentário de bloco: o de linha engolia o resto da linha */")
troca(''' d.innerHTML=`<div class="ph" style="background-image:url(../h/${n}.jpg)"></div><div class="shade"></div>''',
      ''' d.innerHTML=`<div class="arte ${ARTE[n][0]}"><svg viewBox="0 0 300 300">${ICOW[ARTE[n][1]]}</svg></div><div class="shade"></div>''')
troca("   const ph=c.d.firstChild;ph.style.transform=`translateX(${(c.ri?-1:1)*18*k}px) scale(${1.02+.04*k})`;});", "   });")
troca(" const s=(1+sc*(1-pi)+(o.outScale??0)*po)*(o.noDrift?1:1+.025*P(t,a,b));",
      " const s=(1+sc*(1-pi)+(o.outScale??0)*po); // v7: sem o zoom lento de 2,5 % (fazia o texto tremer quadro a quadro)")
troca(""" bg('bgNavy', t<7.1?1:(t>=45.8)?E(P(t,45.8,46.3)):0);
 bg('bgBlue', (t>=6.5&&t<8.45)?E(P(t,6.5,7.1)):(t>=15.55&&t<46.3)?1:0);
 bg('bgWhite',(t>=8.3&&t<15.6)?1:0);
 bg('bgFlash',0);
""", """ const op={bgNavy:t<7.1?1:(t>=45.8)?E(P(t,45.8,46.3)):0,bgBlue:(t>=6.5&&t<8.45)?E(P(t,6.5,7.1)):(t>=15.55&&t<46.3)?1:0,bgWhite:(t>=8.3&&t<15.6)?1:0,bgEnd:t>=56.9?E(P(t,56.9,57.7)):0};
 bg('bgNavy',op.bgNavy);bg('bgBlue',op.bgBlue);bg('bgWhite',op.bgWhite);bg('bgFlash',0);
 // v7: dois feixes de luz lentos sobre o azul e o navy, atrás de tudo — a tela nunca fica morta e o texto não se mexe
 $('ambG').style.opacity=Math.max(op.bgBlue,op.bgNavy)*(1-op.bgWhite)*(1-op.bgEnd);
 $('agF0').style.transform=`translateX(${(140*Math.sin(t*.45)).toFixed(1)}px) rotate(-24deg)`;$('agF1').style.transform=`translateX(${(-110*Math.sin(t*.37+1)).toFixed(1)}px) rotate(-24deg)`;
 // v7: brilho difuso atrás das perguntas da abertura
 const ql=$('qLuz');if(t<6.6){ql.style.opacity=E(P(t,0,.8))*(1-P(t,6.1,6.6));ql.style.transform=`translate(-50%,-50%) translateX(${(-360+720*P(t,0,6.6)).toFixed(1)}px) translateY(${(50*Math.sin(t*.8)).toFixed(1)}px)`;}else ql.style.opacity=0;
""")
troca(" show($('t1'),t,0.25,2.75);\n", " // v7: a pergunta da fala 1 é digitada em tempo real (q1, renderReal)\n")
troca(" show($('t3'),t,10.0,11.4,{out:.3});show($('t3b'),t,11.35,12.75);",
      " show($('t3'),t,10.0,11.4,{out:.3});show($('t3b'),t,11.35,12.75);$('luzS2').style.opacity=Math.max(+$('t3').style.opacity,+$('t3b').style.opacity); // v7: prancha P3")
troca(" if(t>=12.7&&t<15.7){cw.style.opacity=1;cw.style.filter='none';cw.style.transform=`translate(-50%,-50%) translateY(${-14*P(t,12.7,15.0)}px) scale(${1+.06*P(t,12.7,15.0)})`;",
      " if(t>=12.7&&t<15.7){cw.style.opacity=1;cw.style.filter='none';cw.style.transform='translate(-50%,-50%) translateY(-10px) scale(1.04)'; // v7: parado (sem tremor nos rótulos)")
troca("  const p=E(P(t,a,a+.7)),po=EIO(P(t,30.1,30.45));const push=1+.035*P(t,27.5,30.45);",
      "  const p=E(P(t,a,a+.7)),po=EIO(P(t,30.1,30.45));const push=1; // v7: sem zoom lento")
troca(" show($('t8'),t,46.3,50.3);", " $('t8').style.opacity=0; // v7: a frase vai na placa de vidro (tt1, renderReal)")
troca("  const w=E(P(t,58.65,59.25));const wm2=$('wmEnd');wm2.style.opacity=w;",
      "  const w=E(P(t,58.62,59.4));const wm2=$('wmEnd');wm2.style.opacity=w; /* v7: ATIVE entra mais devagar, embaixo da pirâmide */")
troca("translateY(${352+(1-f)*20}px)`;", "translateY(${290+(1-f)*20}px)`; /* v7b: frase na altura da Apresentação v12 */")
V6_ESTR = '''<!-- v6 (03/10): cenas reconstruídas em HTML/SVG, sem imagem colada -->
<link rel="stylesheet" href="v6_comum.css"><script src="v6_comum.js"></script>
<script>
(function(){const V=window.V6;
 V.montarPassos('wA',null);
 V.montarDegraus('wB',['Do diagnóstico','ao capital no caixa.','Do seu lado.']);
 window.renderReal=function(T){
  // 7 "Organizamos as informações, desenhamos a estratégia e preparamos sua empresa…": os quatro passos
  V.passos('wA',T,20.0,26.65,[20.4,21.3,22.6,24.1]);
  // 12 "Do diagnóstico ao capital no caixa, seguimos do seu lado."
  V.degraus('wB',T,41.85,46.6,[42.1,42.7,45.0]);
 };})();
</script>'''
troca(V6_ESTR, bloco(
    '[0.04,4.71,7.25,10.36,12.47,15.97,20.09,26.59,29.41,33.36,36.11,41.83,46.34,49.75,54.44,58.79,61.22,64.21,65.00]',
    " V.montarPassos('wA',null);\n V.montarDegraus('wB',['Do diagnóstico','ao capital no caixa.','Do seu lado.']);",
    " montarTitulo('tt1','navy','grafico','','Capital começa<br>com preparo.');",
    "[{id:'q1',L:['O crédito da sua empresa vem com prazo curto,','juros altos e limite baixo?'],a0:0.6,a:R(0),b:R(1,-.05)}]",
    """  // 7 "Porque as possibilidades vão além do seu banco." e 9 "O caminho começa pela sua empresa." (azul, prancha P5): luz + feixes + vinheta; a fita só na primeira
  amb(T,[[R(7,-.25),R(8,-.3)],[R(9,-.2),R(10,-.3)]]);V.fita('wF',T,R(7,.05),R(8,-.3));
  // 15 "Porque capital começa com preparo." (navy, prancha P8): placa de vidro com o gráfico
  titulo('tt1',T,R(15,-.3),R(16,-.3));
  // cenas da v6 (tempos calculados com D=0,3): quatro passos (fala 6) e degraus (fala 11)
  V.passos('wA',T-DS,20.0,26.65,[20.4,21.3,22.6,24.1]);
  V.degraus('wB',T-DS,41.85,46.6,[42.1,42.7,45.0]);""", dict(L1='Toda parceria', L2='começa com confiança.', kA=16, kB=17, kC=18)))
out = os.path.join(FV, 'v10.html')
assert '../h/' not in h and '.025*P(t,a,b)' not in h and "$('t1')" not in h
io.open(out, 'w', encoding='utf-8', newline='\n').write(h)
print(out, len(h))

# ======================================================================= TRIBUTÁRIO v7
h = io.open(os.path.join(V, 'tributario', 'trib_v6.html'), encoding='utf-8').read()
troca('<title>ATIVE · Estruturação de capital</title>', '<title>ATIVE · Tributário v7</title>')
troca('\n</style></head>', '\n' + CSS + '\n</style></head>')
troca('<div id="icons" style="position:absolute;inset:0"></div>', '<div id="icons" style="position:absolute;inset:0"></div>' + AMB_DOM)
troca('<div id="t1" class="el t">Sua empresa está pagando mais tributos<br>do que deveria?</div>\n<div id="t2" class="el t">E se parte do que sua empresa paga<br>pudesse voltar para o caixa?</div>',
      '<div id="q1" class="el q"><span id="q1a"></span><span class="cur" id="q1c1"></span><br><span id="q1b"></span><span class="cur" id="q1c2"></span></div>\n'
      '<div id="q2" class="el q"><span id="q2a"></span><span class="cur" id="q2c1"></span><br><span id="q2b"></span><span class="cur" id="q2c2"></span></div>')
troca('<div id="t3" class="el t dark" style="font-weight:800;font-size:72px">Equipe técnica e jurídica<br>especializada em auditoria tributária.</div>',
      '<div id="t3" class="el" style="text-align:center"><div class="fio" style="margin:0 auto 32px"></div><div class="h3" style="font-size:92px">Equipe técnica e jurídica<br>especializada em<br><b>auditoria tributária</b>.</div></div>')
troca('<div id="legalJur" class="legal">', '<div id="legalJur" class="legal" style="z-index:56">')
troca('<div id="endT" class="el t"', '<div id="fim2" class="el" style="text-align:center"><div class="fio" style="margin:0 auto 40px"></div><div class="fimQ"><span id="fmL1"></span><span class="cur" id="fmC1"></span><br><span id="fmL2"></span><span class="cur" id="fmC2"></span></div></div>\n' + '<div id="endT" class="el t"')
troca(" $('legalJur2').style.opacity=(t>=10.2&&t<12.75)?Math.min(E(P(t,10.2,10.7)),1-P(t,12.4,12.75)):0;", " $('legalJur2').style.opacity=0; /* v7b (04/10): aviso retirado da tela branca, a pedido do Jonas */")
troca(" $('legalJur').style.opacity=(t>=33.4&&t<37.35)?Math.min(E(P(t,33.4,33.9)),1-P(t,37.0,37.35)):0;", " $('legalJur').style.opacity=0; /* v7b (04/10): aviso retirado da placa Planejamento, a pedido do Jonas */")
troca("translateY(${352+(1-f)*20}px)`;", "translateY(${290+(1-f)*20}px)`; /* v7b: frase na altura da Apresentação v12 */")
troca('<div id="t4" class="el t">Analisamos toda a estrutura<br>tributária da sua empresa.</div>',
      '<div id="t4" class="el" style="text-align:center"><div class="fio" style="margin:0 auto 32px"></div><div class="h2" style="font-size:92px">Analisamos toda a estrutura<br>tributária da sua empresa.</div></div>')
troca('<div class="ph" style="background-image:url(../h/garantia.jpg)"></div>', '<div class="arte t3" data-ico="escudo"></div>')
troca('<div class="ph" style="background-image:url(../h/giro.jpg)"></div>', '<div class="arte t1" data-ico="predio"></div>')
troca('<div class="ph" style="background-image:url(../h/fidc.jpg)"></div>', '<div class="arte t2" data-ico="grafico"></div>')
troca('<div id="t10" class="el t" style="color:#3FC3F7">Nem sempre o problema está<br>onde aparece.</div>',
      '<div id="t10" class="el" style="text-align:center"><div class="fio" style="margin:0 auto 32px"></div><div class="h2" style="font-size:92px">Nem sempre o problema está<br>onde aparece.</div></div>')
troca('const wallCards=[];\n', ICOW + "const ARTE={a:['t1','pessoas'],b:['t3','escudo'],c:['t2','grafico'],d:['t1','calendario'],e:['t2','ideia'],f:['t3','titulo'],g:['t1','balanca']};\n"
      "document.querySelectorAll('.arte[data-ico]').forEach(e=>{e.innerHTML='<svg viewBox=\"0 0 300 300\">'+ICOW[e.dataset.ico]+'</svg>';});\nconst wallCards=[];\n")
troca("  const f=E(P(t,57.3,57.9));const et=$('endT');et.style.opacity=f;",
      "  const f=E(P(t,57.3,57.9))*(1-EIO(P(t,58.35,58.75)));const et=$('endT');et.style.opacity=f; /* v7: a frase sai quando o ATIVE entra (como na Apresentação v12); comentário de bloco: o de linha engolia o resto da linha */")
troca(''' d.innerHTML=`<div class="ph" style="background-image:url(../h/${INS[n][2]}.jpg)"></div><div class="shade"></div>''',
      ''' d.innerHTML=`<div class="arte ${ARTE[n][0]}"><svg viewBox="0 0 300 300">${ICOW[ARTE[n][1]]}</svg></div><div class="shade"></div>''')
troca("   c.d.firstChild.style.transform=`translateX(${(c.ri?-1:1)*18*k}px) scale(${1.02+.04*k})`;});", "   });")
troca(" const s=(1+sc*(1-pi)+(o.outScale??0)*po)*(o.noDrift?1:1+.025*P(t,a,b));",
      " const s=(1+sc*(1-pi)+(o.outScale??0)*po); // v7: sem o zoom lento de 2,5 % (fazia o texto tremer quadro a quadro)")
troca("const icons=POS.map((p,i)=>{const d=document.createElement('div');d.className='icon';d.style.background=COLS[i];d.innerHTML='<svg viewBox=\"0 0 24 24\">'+IC[p[2]]+'</svg>';$('icons').appendChild(d);return {d,x:p[0],y:p[1],ph:i*0.9};});",
      "const icons=[]; // v7: sem o campo de ícones coloridos (reprovado na Apresentação v9); a abertura vai direto às perguntas sobre o navy com feixes")
troca(" for(const k in op)$(k).style.opacity=op[k];\n",
      """ for(const k in op)$(k).style.opacity=op[k];
 // v7: dois feixes de luz lentos sobre o azul e o navy, atrás de tudo — a tela nunca fica morta e o texto não se mexe
 $('ambG').style.opacity=Math.max(op.bgBlue,op.bgNavy)*(1-op.bgWhite)*(1-op.bgEnd);
 $('agF0').style.transform=`translateX(${(140*Math.sin(t*.45)).toFixed(1)}px) rotate(-24deg)`;$('agF1').style.transform=`translateX(${(-110*Math.sin(t*.37+1)).toFixed(1)}px) rotate(-24deg)`;
 // v7: brilho difuso atrás das perguntas da abertura
 const ql=$('qLuz');if(t<6.6){ql.style.opacity=E(P(t,0,.8))*(1-P(t,6.1,6.6));ql.style.transform=`translate(-50%,-50%) translateX(${(-360+720*P(t,0,6.6)).toFixed(1)}px) translateY(${(50*Math.sin(t*.8)).toFixed(1)}px)`;}else ql.style.opacity=0;
""")
troca(" show($('t1'),t,0.25,2.75);\n show($('t2'),t,2.95,4.3,{out:.3});show($('t2b'),t,4.25,5.55);",
      " show($('t2b'),t,4.25,6.7); // v7: as perguntas das falas 1 e 2 são digitadas em tempo real (q1, q2 em renderReal); a frase fica até o tile entrar")
troca(" show($('t3'),t,10.0,12.75);\n", " show($('t3'),t,10.0,12.75);$('luzS2').style.opacity=$('t3').style.opacity; // v7: prancha P3\n")
troca(" if(C>=12.7&&C<15.7){cw.style.opacity=1;cw.style.filter='none';cw.style.transform=`translate(-50%,-50%) translateY(${-14*P(C,12.7,15.0)}px) scale(${1+.06*P(C,12.7,15.0)})`;",
      " if(C>=12.7&&C<15.7){cw.style.opacity=1;cw.style.filter='none';cw.style.transform='translate(-50%,-50%) translateY(-10px) scale(1.04)'; // v7: parado (sem tremor nos rótulos)")
troca(" if(t>=26.1&&t<30.45){const po=EIO(P(t,30.1,30.45));tx.style.opacity=1-po;tx.style.filter=`blur(${po*16}px)`;tx.style.transform=`translate(-50%,-50%) scale(${1+.03*P(t,26.1,30.45)})`;",
      " if(t>=26.1&&t<30.45){const po=EIO(P(t,30.1,30.45));tx.style.opacity=1-po;tx.style.filter=`blur(${po*16}px)`;tx.style.transform='translate(-50%,-50%)'; // v7: sem zoom lento")
troca("   el.querySelector('.ph').style.transform=`scale(${1.04+.05*P(t,a,30.45)})`;});", "   });")
troca(" show($('t7'),t,33.2,37.35);\n show($('t8'),t,37.4,41.2);$('t8b').style.opacity=E(P(t,39.5,40.0));",
      " $('t7').style.opacity=0;$('t8').style.opacity=0; // v7: as duas frases vão nas placas de vidro (tt1 azul, tt2 navy) em renderReal")
troca("  const w=E(P(t,58.65,59.25));const wm2=$('wmEnd');wm2.style.opacity=w;",
      "  const w=E(P(t,58.62,59.4));const wm2=$('wmEnd');wm2.style.opacity=w; /* v7: ATIVE entra mais devagar, embaixo da pirâmide */")
V6_TRIB = '''<!-- v6 (03/10): cenas reconstruídas em HTML/SVG, sem imagem colada -->
<link rel="stylesheet" href="v6_comum.css"><script src="v6_comum.js"></script>
<script>
(function(){const V=window.V6;
 V.montarOndas('wC',['Identificamos possíveis','valores pagos a mais','nos últimos cinco anos.']);
 V.montarDegraus('wB',['Do diagnóstico','à economia no caixa.','Do seu lado.']);
 V.montarPassos('wA','Tudo começa pelo diagnóstico.');
 window.renderReal=function(T){
  // 10 "Identificamos possíveis valores pagos a mais nos últimos cinco anos."
  V.ondas('wC',T,34.1,38.8,[34.3,35.0,36.4]);
  // 13 "Do diagnóstico à economia no caixa, seguimos do seu lado." (cyan quando diz "do seu lado")
  V.degraus('wB',T,46.6,51.05,[46.8,47.4,49.6]);
  // 17 "Tudo começa pelo diagnóstico."
  V.passos('wA',T,61.15,64.45,[61.7,62.15,62.6,63.05]);
 };})();
</script>'''
troca(V6_TRIB, bloco(
    '[0.18,3.07,8.70,15.10,17.06,21.65,24.66,28.13,32.21,34.05,38.46,46.60,50.85,56.43,58.95,61.46,63.63,66.39,70.90,74.23,75.04]',
    " V.montarOndas('wC',['Identificamos possíveis','valores pagos a mais','nos últimos cinco anos.']);\n V.montarDegraus('wB',['Do diagnóstico','à economia no caixa.','Do seu lado.']);\n V.montarPassos('wA','Tudo começa pelo diagnóstico.');",
    " montarTitulo('tt1','azul','grafico','PLANEJAMENTO TRIBUTÁRIO','Olhamos para o futuro,<br>com planejamento tributário e estratégia<br>jurídica, dentro da lei.',72);\n"
    " montarTitulo('tt2','navy','documento','REFORMA TRIBUTÁRIA','A reforma tributária muda as regras.<br><span id=\"t8x\" style=\"opacity:0\">Sua empresa precisa estar preparada.</span>');",
    "[{id:'q1',L:['Sua empresa está pagando mais tributos','do que deveria?'],a0:0.6,a:R(0),b:R(1)},{id:'q2',L:['E se parte do que sua empresa paga','pudesse voltar para o caixa?'],a0:R(1),a:R(1,.05),b:R(2,-.3)}]",
    """  // 7 "Analisamos toda a estrutura tributária da sua empresa." (azul, prancha P5): luz + feixes + vinheta + fita
  amb(T,[[R(6,-.25),R(7,-.3)]]);V.fita('wF',T,R(6,.05),R(7,-.3));
  // 13 planejamento (azul, placa com gráfico) · 14-15 reforma (navy, placa com documento; a segunda linha acende na fala 15)
  titulo('tt1',T,R(12,-.25),R(13,-.3));titulo('tt2',T,R(13,-.28),R(15,-.3));$('t8x').style.opacity=E(P(T,R(14),R(14,.5)));
  // cenas da v6 (tempos calculados com D=0,3): ondas (fala 10), degraus (fala 12), quatro passos (fala 16)
  V.ondas('wC',T-DS,34.1,38.8,[34.3,35.0,36.4]);
  V.degraus('wB',T-DS,46.6,51.05,[46.8,47.4,49.6]);
  V.passos('wA',T-DS,61.15,64.45,[61.7,62.15,62.6,63.05]);""", dict(L1='Antes de qualquer negócio,', L2='existe confiança.', kA=18, kB=19, kC=20)))
out = os.path.join(V, 'tributario', 'trib_v7.html')
assert '../h/' not in h and '.025*P(t,a,b)' not in h and "$('t1')" not in h and "$('t2')," not in h
io.open(out, 'w', encoding='utf-8', newline='\n').write(h)
print(out, len(h))

# ======================================================================= v7_comum.js (v6 sem câmera lenta)
j = io.open(os.path.join(FV, 'v6_comum.js'), encoding='utf-8').read()
a = " const k=P(T,a,b),z=(o.z0??1)+((o.z1??1.03)-(o.z0??1))*k;\n e.firstElementChild.style.transform=`translate(${((o.dx??0)*k).toFixed(1)}px,${((o.dy??-6)*k).toFixed(1)}px) scale(${z.toFixed(4)})`;\n"
assert j.count(a) == 1
j = j.replace(a, " const k=P(T,a,b); // v7 (03/10 noite): sem câmera lenta — o zoom contínuo re-rasterizava o texto a cada quadro (tremor)\n"
                 " const cam=e.querySelector('.cam');if(cam)cam.style.transform='none';\n"
                 " // v7: as cenas de fundo azul opaco tapavam os feixes globais (#ambG) e a tela ficava parada entre uma entrada e outra; feixes próprios, mesmo movimento\n"
                 " if(e._lz)e._lz.forEach((f,i)=>{f.style.transform=`translateX(${(i?-110*Math.sin(T*.37+1):140*Math.sin(T*.45)).toFixed(1)}px) rotate(-24deg)`;});\n")
# feixes dentro das cenas azuis (atrás da câmera), com o desenho dos feixes globais
LZ = ("function luzes(c){const g='linear-gradient(90deg,rgba(255,255,255,0) 0%,rgba(255,255,255,.035) 28%,rgba(255,255,255,.10) 50%,rgba(255,255,255,.035) 72%,rgba(255,255,255,0) 100%)';\n"
      " c._lz=[[420,.55],[1240,.4]].map(([x,o])=>el('div',{class:'feixe',style:`left:${x}px;width:640px;opacity:${o};background:${g};mix-blend-mode:normal;transform:rotate(-24deg)`},c));}\n")
a2 = "function montarPassos("
assert j.count(a2) == 1
j = j.replace(a2, LZ + a2)
a3 = " const c=el('div',{id,class:'v6 azul'});const cam=el('div',{class:'cam'},c);"
assert j.count(a3) == 3, j.count(a3)
j = j.replace(a3, " const c=el('div',{id,class:'v6 azul'});luzes(c);const cam=el('div',{class:'cam'},c);")
j = j.replace("// v6 (03/10/2026): componentes das cenas reconstruídas.", "// v7 (03/10/2026 noite) = v6 sem a câmera lenta de cena() e com feixes de luz dentro das cenas azuis. v6: componentes das cenas reconstruídas.", 1)
io.open(os.path.join(FV, 'v7_comum.js'), 'w', encoding='utf-8', newline='\n').write(j)
print('v7_comum.js ok')
