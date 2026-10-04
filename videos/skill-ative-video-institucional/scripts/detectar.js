// Lista os quadros em que algum dos elementos dados fica visível (opacity > 0) na página narrada.
// Uso: node detectar.js <url> <N> <id1,id2,...>  -> imprime JSON com a lista de quadros
// Atenção (lição 21): só enxerga os ids que você passar; o trecho a refazer é o BLOCO inteiro que mudou.
// PW_DIR: pasta com node_modules/playwright (padrão: fonte/video do repo dos vídeos).
const PW = process.env.PW_DIR || 'C:/Users/Jonas/dev/Jonas-Alves-Sukenski/videos/estruturacao-de-capital/fonte/video';
const { chromium } = require(PW + '/node_modules/playwright');
(async () => {
  const [url, N, ids] = [process.argv[2], +process.argv[3], process.argv[4].split(',')];
  const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto(url, { waitUntil: 'load' }); await page.evaluate(() => document.fonts.ready);
  const vis = await page.evaluate(([N, ids]) => {
    const out = [];
    for (let i = 0; i < N; i++) { window.render(i / 30);
      const on = ids.some(id => { const e = document.getElementById(id); return e && parseFloat(e.style.opacity || getComputedStyle(e).opacity) > 0.001; });
      if (on) out.push(i); }
    return out; }, [N, ids]);
  console.log(JSON.stringify(vis));
  await browser.close();
})();
