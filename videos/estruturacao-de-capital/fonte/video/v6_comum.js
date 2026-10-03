// v6 (03/10/2026): componentes das cenas reconstruídas. Tudo é DOM/SVG animado por tempo real (T).
(function(){
const $=id=>document.getElementById(id),cl=(x,a=0,b=1)=>Math.min(b,Math.max(a,x)),P=(t,a,b)=>cl((t-a)/(b-a));
const E=x=>1-Math.pow(1-x,3),EIO=x=>x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2;
const NS='http://www.w3.org/2000/svg';
const stage=()=>document.getElementById('stage');
function el(tag,attrs,parent,html){const e=document.createElement(tag);for(const k in attrs)e.setAttribute(k,attrs[k]);if(html!=null)e.innerHTML=html;(parent||stage()).appendChild(e);return e;}
function sv(tag,attrs,parent){const e=document.createElementNS(NS,tag);for(const k in attrs)e.setAttribute(k,attrs[k]);parent.appendChild(e);return e;}
function dash(path,k){const L=path.getTotalLength();path.style.strokeDasharray=L;path.style.strokeDashoffset=(L*(1-cl(k))).toFixed(1);}

// entrada/saída da cena + câmera lenta
function cena(id,T,a,b,o={}){const e=$(id);if(T<a||T>b){e.style.opacity=0;return -1;}
 const i=E(P(T,a,a+(o.in??.4))),s=EIO(P(T,b-(o.out??.35),b));
 e.style.opacity=i*(1-s);e.style.filter=`blur(${((1-i)*(o.blur??8)+s*6).toFixed(2)}px)`;
 const k=P(T,a,b),z=(o.z0??1)+((o.z1??1.03)-(o.z0??1))*k;
 e.firstElementChild.style.transform=`translate(${((o.dx??0)*k).toFixed(1)}px,${((o.dy??-6)*k).toFixed(1)}px) scale(${z.toFixed(4)})`;
 e.firstElementChild.style.transformOrigin=o.orig??'50% 50%';return k;}
function sobe(e,T,a,d=.55,dy=60){const p=E(P(T,a,a+d));e.style.opacity=p;e.style.filter=`blur(${((1-p)*10).toFixed(2)}px)`;e.style.transform=`translateY(${((1-p)*dy).toFixed(1)}px)`;}

const ICONES={
 cadeado:'<path d="M20 32h24a4 4 0 0 1 4 4v22a4 4 0 0 1-4 4H20a4 4 0 0 1-4-4V36a4 4 0 0 1 4-4z"/><path d="M24 32v-8a8 8 0 0 1 16 0v8"/><path d="M32 44v8"/><path d="M14 20V12a4 4 0 0 1 4-4h20l10 10v6"/>',
 lupa:'<circle cx="28" cy="28" r="16"/><path d="M40 40l14 14"/><path d="M20 32v-6M28 32V20M36 32v-9"/>',
 proposta:'<path d="M16 8h24l12 12v36a4 4 0 0 1-4 4H16a4 4 0 0 1-4-4V12a4 4 0 0 1 4-4z"/><path d="M40 8v12h12"/><path d="M20 34h20M20 42h20"/><path d="M22 52l5 5 11-11"/>',
 alvo:'<circle cx="32" cy="32" r="22"/><circle cx="32" cy="32" r="13"/><circle cx="32" cy="32" r="4"/><path d="M32 10v8M32 46v8M10 32h8M46 32h8"/>'
};
const PASSOS=[['01','Confidencialidade','Termo assinado antes de qualquer documento.','cadeado'],
 ['02','Diagnóstico','Leitura da empresa e do que ela pode estruturar.','lupa'],
 ['03','Proposta','Por escrito, com cada etapa definida.','proposta'],
 ['04','Execução','Acompanhamento até o recurso chegar à empresa.','alvo']];

// Cena A — quatro passos (cartões brancos, selo navy com anel dourado, linha que liga um ao outro)
function montarPassos(id,titulo){
 const c=el('div',{id,class:'v6 azul'});const cam=el('div',{class:'cam'},c);
 if(titulo)el('div',{class:'titulo',id:id+'t'},cam,titulo);
 const y0=titulo?230:190,y1=titulo?600:590,X=[120,980,120,980],Y=[y0,y0,y1,y1];
 PASSOS.forEach((p,i)=>{const d=el('div',{class:'passo',id:id+'c'+i,style:`left:${X[i]}px;top:${Y[i]}px`},cam,
  `<div class="selo"><svg viewBox="0 0 64 64">${ICONES[p[3]]}</svg></div><div class="num">${p[0]}</div><h3>${p[1]}</h3><p>${p[2]}</p><div class="sub"></div>`);});
 const svg=sv('svg',{class:'liga',viewBox:'0 0 1920 1080'},cam);
 const segs=[`M940 ${y0+150} L980 ${y0+150}`,`M1390 ${y0+300} L1390 ${(y0+300+y1)/2} L530 ${(y0+300+y1)/2} L530 ${y1}`,`M940 ${y1+150} L980 ${y1+150}`];
 c._ligas=segs.map(d=>sv('path',{d},svg));
 return c;}
function passos(id,T,a,b,ts){const k=cena(id,T,a,b,{in:.4,z1:1.03,dy:-6});if(k<0)return;
 const c=$(id);if($(id+'t'))sobe($(id+'t'),T,a+.1,.5,30);
 for(let i=0;i<4;i++)sobe($(id+'c'+i),T,ts[i],.55,70);
 c._ligas.forEach((p,i)=>dash(p,P(T,ts[i]+.35,ts[i+1]+.1)));}

// Cena B — degraus luminosos: frase à esquerda, caminho que se desenha subindo três discos
function montarDegraus(id,linhas){
 const c=el('div',{id,class:'v6 azul'});const cam=el('div',{class:'cam'},c);
 const ys=[370,474,578];linhas.forEach((l,i)=>el('div',{class:'fala'+(i==2?' ciano':''),id:id+'l'+i,style:`top:${ys[i]}px`},cam,l));
 const svg=sv('svg',{class:'deg',viewBox:'0 0 1920 1080'},cam);
 const defs=sv('defs',{},svg);defs.innerHTML='<filter id="gl" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="8" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter><filter id="gl2" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="18"/></filter>';
 const D=[[1300,790,170,50],[1520,590,135,40],[1710,400,105,31]];
 c._discos=D.map(([x,y,rx,ry])=>{const g=sv('g',{opacity:0},svg);
  sv('ellipse',{cx:x,cy:y+22,rx:rx*1.15,ry:ry*1.3,fill:'rgba(255,255,255,.25)',filter:'url(#gl2)'},g);
  sv('path',{d:`M${x-rx} ${y} v26 a${rx} ${ry} 0 0 0 ${rx*2} 0 v-26`,fill:'rgba(120,200,255,.55)',stroke:'rgba(255,255,255,.5)','stroke-width':2},g);
  sv('ellipse',{cx:x,cy:y,rx,ry,fill:'rgba(200,240,255,.75)',stroke:'#fff','stroke-width':3},g);return g;});
 const d=`M${D[0][0]} ${D[0][1]} C ${D[0][0]} ${D[0][1]-120}, ${D[1][0]} ${D[1][1]+140}, ${D[1][0]} ${D[1][1]} C ${D[1][0]} ${D[1][1]-120}, ${D[2][0]} ${D[2][1]+130}, ${D[2][0]} ${D[2][1]}`;
 sv('path',{d,stroke:'rgba(255,255,255,.35)','stroke-width':18,fill:'none',filter:'url(#gl2)',id:id+'p0'},svg);
 c._tra=sv('path',{d,stroke:'#fff','stroke-width':6,fill:'none',filter:'url(#gl)','stroke-linecap':'round'},svg);
 c._pt=sv('circle',{r:12,fill:'#fff',filter:'url(#gl)',opacity:0},svg);
 return c;}
function degraus(id,T,a,b,tl){const k=cena(id,T,a,b,{in:.4,z1:1.035,orig:'70% 55%'});if(k<0)return;
 const c=$(id);tl.forEach((t,i)=>sobe($(id+'l'+i),T,t,.5,26));
 const q=EIO(P(T,a+.25,a+2.2));dash($(id+'p0'),q);dash(c._tra,q);
 const L=c._tra.getTotalLength(),pt=c._tra.getPointAtLength(L*q);c._pt.setAttribute('cx',pt.x);c._pt.setAttribute('cy',pt.y);c._pt.setAttribute('opacity',q>0&&q<1?1:0);
 c._discos.forEach((g,i)=>{const on=E(P(T,a+.2+i*.95,a+.7+i*.95));g.setAttribute('opacity',on);g.setAttribute('transform',`translate(0 ${(1-on)*30})`);});}

// Cena C — ondas: três linhas que correm devagar atrás da frase, com pontos de luz
function montarOndas(id,linhas){
 const c=el('div',{id,class:'v6 azul'});const cam=el('div',{class:'cam'},c);
 const svg=sv('svg',{class:'onda',viewBox:'0 0 1920 1080'},cam);
 const defs=sv('defs',{},svg);defs.innerHTML='<filter id="glo" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>';
 c._ondas=[[.35,4,760,70,1.0],[.22,3,820,55,1.6],[.14,2.5,700,90,.7]].map(([o,w,y,amp,v])=>{const p=sv('path',{'stroke-opacity':o,'stroke-width':w},svg);p._cfg={y,amp,v};return p;});
 c._pts=[0,1,2,3,4,5].map(()=>sv('circle',{r:6,fill:'#fff',filter:'url(#glo)',opacity:.9},svg));
 const ys=[398,468,580];linhas.forEach((l,i)=>el('div',{class:'lin'+(i==1?' forte':''),id:id+'l'+i,style:`top:${ys[i]}px`},cam,l));
 return c;}
function ondas(id,T,a,b,tl){const k=cena(id,T,a,b,{in:.4,z1:1.04});if(k<0)return;
 const c=$(id);tl.forEach((t,i)=>sobe($(id+'l'+i),T,t,.55,30));
 c._ondas.forEach(p=>{const {y,amp,v}=p._cfg;let d='M-20 '+y;for(let x=0;x<=1940;x+=20){const yy=y+Math.sin(x/260+T*v)*amp+Math.sin(x/90-T*v*.6)*amp*.25;d+=` L${x} ${yy.toFixed(1)}`;}p.setAttribute('d',d);});
 const m=c._ondas[0]._cfg;c._pts.forEach((pt,i)=>{const x=200+i*300+Math.sin(T*.5+i)*40;const y=m.y+Math.sin(x/260+T*m.v)*m.amp+Math.sin(x/90-T*m.v*.6)*m.amp*.25;pt.setAttribute('cx',x);pt.setAttribute('cy',y);pt.setAttribute('opacity',(.5+.5*Math.sin(T*2+i*1.3)).toFixed(2));});}

// Motivo para cenas de texto: feixes de luz que deslizam + um ícone desenhado em traço ao lado
const TRACOS={
 grafico:'<path d="M30 220V40"/><path d="M30 220h200"/><path d="M50 180l50-50 40 25 70-85"/><path d="M190 70h20v20"/>',
 lupa:'<circle cx="110" cy="105" r="62"/><path d="M155 150l60 60"/><path d="M85 125v-25M110 125V75M135 125v-40"/>',
 documento:'<path d="M60 30h90l50 50v150a10 10 0 0 1-10 10H60a10 10 0 0 1-10-10V40a10 10 0 0 1 10-10z"/><path d="M150 30v50h50"/><path d="M80 120h80M80 150h80"/><path d="M85 190l18 18 40-40"/>',
 equipe:'<circle cx="130" cy="78" r="30"/><path d="M70 220v-30a60 60 0 0 1 120 0v30"/><circle cx="60" cy="100" r="22"/><path d="M20 210v-22a40 40 0 0 1 50-39"/><circle cx="200" cy="100" r="22"/><path d="M240 210v-22a40 40 0 0 0-50-39"/>'
};
function montarMotivo(id,traco,x,y){
 const c=el('div',{id,class:'v6 transp'});const cam=el('div',{class:'cam'},c);
 c._fx=[0,1,2].map(i=>el('div',{class:'feixe',id:id+'f'+i,style:`left:${300+i*520}px;opacity:${(.9-i*.2).toFixed(2)}`},cam));
 const svg=sv('svg',{class:'ico',viewBox:'0 0 260 260',style:`left:${x}px;top:${y}px`},cam);svg.innerHTML=TRACOS[traco];
 c._tr=[...svg.querySelectorAll('path,circle')];return c;}
function motivo(id,T,a,b,sentido=1){const k=cena(id,T,a,b,{in:.5,out:.4,z0:1,z1:1,blur:0});if(k<0)return;
 const c=$(id);c._fx.forEach((f,i)=>{f.style.transform=`translateX(${(sentido*(k*260-130)*(1+i*.3)).toFixed(1)}px) rotate(-28deg)`;});
 const n=c._tr.length;c._tr.forEach((p,i)=>dash(p,P(T,a+.3+i*(1.4/n),a+.3+i*(1.4/n)+.6)));}

// Fita (abertura): dois traços, navy e dourado, que se desenham atrás da frase
function montarFita(id){const c=el('div',{id,class:'v6 transp'});const cam=el('div',{class:'cam'},c);
 const svg=sv('svg',{class:'fita',viewBox:'0 0 1920 1080'},cam);
 const d='M-40 880 C 300 700, 700 1000, 1100 820 S 1700 640, 1960 760';
 c._a=sv('path',{d,stroke:'#000050','stroke-width':10,'stroke-opacity':.10},svg);
 c._b=sv('path',{d:'M-40 920 C 320 740, 720 1040, 1120 860 S 1720 680, 1960 800',stroke:'#C9A24B','stroke-width':6,'stroke-opacity':.55},svg);return c;}
function fita(id,T,a,b){const k=cena(id,T,a,b,{in:.3,out:.4,z0:1,z1:1,blur:0});if(k<0)return;const c=$(id);dash(c._a,EIO(P(T,a,a+2.4)));dash(c._b,EIO(P(T,a+.3,a+2.9)));}

window.V6={montarPassos,passos,montarDegraus,degraus,montarOndas,ondas,montarMotivo,motivo,montarFita,fita,P,E,EIO};
})();
