const {chromium}=require('playwright');const {spawn}=require('child_process');
const FF='/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2';
(async()=>{const mode=process.argv[2];
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--allow-file-access-from-files']});
 const pg=await b.newPage({viewport:{width:1920,height:1080}});
 await pg.goto('file://'+__dirname+'/'+(process.env.PAGE||'index.html'));await pg.evaluate(()=>document.fonts.ready);
 if(mode==='stills'){for(const t of process.argv.slice(3)){await pg.evaluate(t=>render(+t),t);await pg.screenshot({path:`still_${t}.jpg`,quality:80,type:'jpeg'});}}
 else{const out=process.argv[3];const ff=spawn(FF,['-y','-f','image2pipe','-framerate','30','-c:v','mjpeg','-i','-','-c:v','libx264','-pix_fmt','yuv420p','-crf','18','-preset','medium','-movflags','+faststart',out],{stdio:['pipe','inherit','inherit']});
  for(let i=0;i<1800;i++){await pg.evaluate(t=>render(t),i/30);const buf=await pg.screenshot({type:'jpeg',quality:95});if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r));if(i%300==0)console.log('frame',i);}
  ff.stdin.end();await new Promise(r=>ff.on('close',r));}
 await b.close();})();
