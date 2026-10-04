// Fotografa a placa de vidro (tile_png.html) com fundo transparente → ../assets/tile_vidro.png (540×540, placa de 300 px no centro)
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({args:['--allow-file-access-from-files']});const pg=await b.newPage({viewport:{width:600,height:600}});
 await pg.goto('file://'+__dirname+'/tile_png.html');
 await pg.locator('#wrap').screenshot({path:__dirname+'/../assets/tile_vidro.png',omitBackground:true});await b.close();console.log('tile_vidro.png ok');})();
