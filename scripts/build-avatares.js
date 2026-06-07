// Cria miniaturas circulares leves (avatar.b64) de cada pessoa-guia do catálogo.
// Lê o PNG grande de cada pasta pessoas-<slug>-<genero>/ e gera um data-URL JPEG
// ~240px focado no rosto. O motor (montarPessoasCss) lê esse avatar.b64 — render leve.
//   uso:  node scripts/build-avatares.js
const fs = require('fs'); const path = require('path');
const AUTO = require('../utils/imageLibrary').AUTO_DIR;

(async () => {
  const dirs = fs.existsSync(AUTO)
    ? fs.readdirSync(AUTO).filter(d => d.startsWith('pessoas-') && fs.statSync(path.join(AUTO, d)).isDirectory())
    : [];
  if (!dirs.length) { console.log('Nenhuma pasta pessoas-* encontrada em', AUTO); return; }

  const puppeteer = require('puppeteer');
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  let ok = 0;
  for (const d of dirs) {
    const full = path.join(AUTO, d);
    const png = fs.readdirSync(full).filter(f => /\.png$/i.test(f)).sort().pop();
    if (!png) { console.log('· sem png:', d); continue; }
    const src = 'data:image/png;base64,' + fs.readFileSync(path.join(full, png)).toString('base64');
    const out = await page.evaluate(async (src) => {
      const img = new Image(); img.src = src; await img.decode();
      const S = 240, c = document.createElement('canvas'); c.width = S; c.height = S;
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#eef1f5'; ctx.fillRect(0, 0, S, S);
      // cover-crop alinhado ao TOPO (mantém o rosto/cabeça no quadro)
      const scale = Math.max(S / img.width, S / img.height);
      const w = img.width * scale, h = img.height * scale;
      ctx.drawImage(img, (S - w) / 2, 0, w, h);
      return c.toDataURL('image/jpeg', 0.82);
    }, src);
    fs.writeFileSync(path.join(full, 'avatar.b64'), out);
    ok++; console.log('✓', d, Math.round(out.length / 1024) + 'KB');
  }
  await browser.close();
  console.log(`\nFIM. ${ok}/${dirs.length} avatares criados.`);
})();
