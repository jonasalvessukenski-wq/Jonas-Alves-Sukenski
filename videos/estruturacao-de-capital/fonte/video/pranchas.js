// Fotografa as pranchas (telas paradas) de uma página de propostas, sem render de vídeo.
// Uso: PAGE=pranchas_apres_1003.html OUT=<pasta> NOMES='["a","b",...]' node pranchas.js
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{
 const b=await chromium.launch({args:['--allow-file-access-from-files','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const pg=await b.newPage({viewport:{width:1920,height:1080}});
 await pg.goto('file://'+__dirname+'/'+(process.env.PAGE||'pranchas_apres_1003.html'));await pg.evaluate(()=>document.fonts.ready);
 const OUT=process.env.OUT;fs.mkdirSync(OUT,{recursive:true});const nomes=JSON.parse(process.env.NOMES||'[]');
 for(let i=1;i<=nomes.length;i++){await pg.evaluate(n=>mostrar(n),i);await pg.waitForTimeout(80);
  await pg.screenshot({path:`${OUT}/P${i}_${nomes[i-1]}.jpg`,type:'jpeg',quality:92});console.log('P'+i,nomes[i-1]);}
 await b.close();
})();
