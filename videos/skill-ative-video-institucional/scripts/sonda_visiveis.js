// Lista, entre dois quadros, os conjuntos de elementos com id visíveis (opacity > 0) e em que quadro o conjunto muda.
// Serve para achar onde a tela é só fundo (lugar de emenda) e conferir entradas/saídas sem renderizar.
// Uso: node sonda_visiveis.js <url> <deQuadro> <atéQuadro>
// Limite: não testa a opacidade dos ancestrais — elemento dentro de cena oculta pode aparecer na lista.
// PW_DIR: pasta com node_modules/playwright (padrão: fonte/video do repo dos vídeos).
const PW = process.env.PW_DIR || 'C:/Users/Jonas/dev/Jonas-Alves-Sukenski/videos/estruturacao-de-capital/fonte/video';
const { chromium } = require(PW + '/node_modules/playwright');
(async () => {
  const [url, A, B] = [process.argv[2], +process.argv[3], +process.argv[4]];
  const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto(url, { waitUntil: 'load' }); await page.evaluate(() => document.fonts.ready);
  const out = await page.evaluate(([A, B]) => {
    const res = []; let prev = '';
    const els = [...document.querySelectorAll('[id]')].filter(e => e.id && !['bg', 'beams', 'luz', 'pal'].includes(e.id));
    for (let i = A; i < B; i++) { window.render(i / 30);
      const on = els.filter(e => { const o = e.style.opacity; const v = o === '' ? parseFloat(getComputedStyle(e).opacity) : parseFloat(o); return v > 0.001 && e.offsetWidth > 0; })
        .map(e => e.id + (e.style.opacity && +e.style.opacity < 0.999 ? '(' + (+e.style.opacity).toFixed(2) + ')' : ''));
      const s = on.join(' ');
      if (s !== prev) { res.push(i + ': ' + s); prev = s; } }
    return res; }, [A, B]);
  console.log(out.join('\n'));
  await browser.close();
})();
