const {chromium}=require('playwright');const {spawn}=require('child_process');
// ffmpeg: $FFMPEG > imageio-ffmpeg (python/python3/py) > ffmpeg do PATH. Chromium: $CHROME > o do Playwright.
const FF=process.env.FFMPEG||(()=>{const {execSync}=require('child_process');for(const py of[process.env.PYTHON,'python','python3','py'].filter(Boolean)){try{return execSync(`"${py}" -c "import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())"`,{stdio:['ignore','pipe','ignore']}).toString().trim();}catch(e){}}return 'ffmpeg';})();
(async()=>{const mode=process.argv[2];
 const b=await chromium.launch({...(process.env.CHROME?{executablePath:process.env.CHROME}:{}),args:['--allow-file-access-from-files','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const pg=await b.newPage({viewport:{width:1920,height:1080}});
 await pg.goto(process.env.URL?process.env.URL:'file://'+__dirname+'/'+(process.env.PAGE||'index.html'),{timeout:180000});if(process.env.URL)await pg.waitForFunction(()=>window.render3dReady,null,{timeout:60000});await pg.evaluate(()=>document.fonts.ready);
 if(mode==='stills'){for(const t of process.argv.slice(3)){await pg.evaluate(t=>render(+t),t);await pg.screenshot({path:`still_${t}.jpg`,quality:80,type:'jpeg'});}}
 else if(process.env.FRAMES_DIR){const fs=require('fs');const D=process.env.FRAMES_DIR;fs.mkdirSync(D,{recursive:true});const I0=+(process.env.FROM||0),I1=+(process.env.TO||1800);
  // quadros em disco (retoma de onde parou); codificar depois, com o navegador fechado, poupa memória
  for(let i=I0;i<I1;i++){const f=`${D}/f${String(i).padStart(5,'0')}.jpg`;if(fs.existsSync(f))continue;await pg.evaluate(t=>render(t),i/30);await pg.screenshot({path:f,type:'jpeg',quality:95});if(i%300==0)console.log('frame',i);}}
 else{const out=process.argv[3];const ff=spawn(FF,['-y','-f','image2pipe','-framerate','30','-c:v','mjpeg','-i','-','-c:v','libx264','-pix_fmt','yuv420p','-crf','18','-preset','medium','-movflags','+faststart',out],{stdio:['pipe','inherit','inherit']});
  const I0=+(process.env.FROM||0),I1=+(process.env.TO||1800);
  for(let i=I0;i<I1;i++){await pg.evaluate(t=>render(t),i/30);const buf=await pg.screenshot({type:'jpeg',quality:95});if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r));if(i%300==0)console.log('frame',i);}
  ff.stdin.end();await new Promise(r=>ff.on('close',r));}
 await b.close();})();
