// Prévia da seção "Vídeo institucional" no site (worktree ative-site-video, porta 3001), desktop e celular
const {chromium}=require('playwright');const fs=require('fs');
const OUT=process.argv[2]||'.';fs.mkdirSync(OUT,{recursive:true});
const PAGS=[['/', 'video-apresentacao-titulo','home'],['/financeiro','video-financeiro-titulo','financeiro'],['/tributario','video-tributario-titulo','tributario']];
const VIEWS=[['desktop',{width:1440,height:900}],['celular',{width:390,height:844,deviceScaleFactor:2,isMobile:true,hasTouch:true}]];
(async()=>{const b=await chromium.launch();
 for(const [nome,vp] of VIEWS){const ctx=await b.newContext({viewport:{width:vp.width,height:vp.height},deviceScaleFactor:vp.deviceScaleFactor||1,isMobile:!!vp.isMobile,hasTouch:!!vp.hasTouch});
  const pg=await ctx.newPage();
  for(const [url,id,tag] of PAGS){await pg.goto('http://localhost:3001'+url,{waitUntil:'networkidle',timeout:120000});
   await pg.evaluate(id=>{const s=document.getElementById(id).closest('section');s.scrollIntoView({block:'start'});},id);
   await pg.waitForTimeout(2200);
   const sec=await pg.evaluateHandle(id=>document.getElementById(id).closest('section'),id);
   await sec.screenshot({path:`${OUT}/site_${tag}_${nome}.png`});
   await pg.screenshot({path:`${OUT}/tela_${tag}_${nome}.png`});
   console.log(nome,tag,'ok');}
  await ctx.close();}
 await b.close();})();
