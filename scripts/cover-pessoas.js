// Gera retrato REDONDO GRANDE (capa) de cada pessoa, a partir do PNG original (1024px).
// Usado como "especialista/autor" na capa do e-book premium genérico (qualquer nicho).
const fs = require('fs'); const path = require('path');
const puppeteer = require('puppeteer');
const BASE = path.join(__dirname, '../assets/catalogo-auto');

(async () => {
  const dirs = fs.readdirSync(BASE).filter(d => /^pessoas-/.test(d));
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  let n = 0;
  for (const d of dirs) {
    const dir = path.join(BASE, d);
    const orig = fs.readdirSync(dir).find(f => /\.png$/.test(f) && !/avatar/.test(f));
    if (!orig) continue;
    const src = 'data:image/png;base64,' + fs.readFileSync(path.join(dir, orig)).toString('base64');
    const out = await page.evaluate(async (src) => {
      const img = new Image();
      await new Promise(r => { img.onload = r; img.src = src; });
      const S = 480;
      const c = document.createElement('canvas'); c.width = S; c.height = S;
      const ctx = c.getContext('2d');
      ctx.save();
      ctx.beginPath(); ctx.arc(S / 2, S / 2, S / 2, 0, Math.PI * 2); ctx.clip();
      // "cover" enquadrando cabeça+ombros (topo da imagem)
      const ar = img.width / img.height; let dw = S, dh = S, dx = 0, dy = 0;
      if (ar > 1) { dh = S; dw = S * ar; dx = (S - dw) / 2; } else { dw = S; dh = S / ar; dy = (S - dh) * 0.06; }
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, dx, dy, dw, dh);
      ctx.restore();
      return c.toDataURL('image/png');
    }, src);
    fs.writeFileSync(path.join(dir, 'cover.b64'), out);
    n++;
  }
  await browser.close();
  console.log('✅ retratos de capa:', n);
})().catch(e => { console.error('❌', e.message); process.exit(1); });
