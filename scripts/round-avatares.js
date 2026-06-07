// Gera avatares JÁ REDONDOS (PNG com cantos transparentes) a partir do avatar.b64 quadrado.
// Assim o e-book usa <img> sem clipe CSS → o Chromium DEDUPLICA (PDF pequeno).
const fs = require('fs'); const path = require('path');
const puppeteer = require('puppeteer');
const BASE = path.join(__dirname, '../assets/catalogo-auto');

(async () => {
  const dirs = fs.readdirSync(BASE).filter(d => /^pessoas-/.test(d));
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  let n = 0;
  for (const d of dirs) {
    const f = path.join(BASE, d, 'avatar.b64');
    if (!fs.existsSync(f)) continue;
    const src = fs.readFileSync(f, 'utf8').trim();
    const out = await page.evaluate(async (src) => {
      const img = new Image();
      await new Promise(r => { img.onload = r; img.src = src; });
      // anel branco + sombra ASSADOS no PNG → no e-book o <img> não precisa de efeito CSS (deduplica)
      const S = 256, R = 104, cx = 128, cy = 122, ring = 7;
      const c = document.createElement('canvas'); c.width = S; c.height = S;
      const ctx = c.getContext('2d');
      // círculo branco (base do anel) com sombra suave
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.26)'; ctx.shadowBlur = 13; ctx.shadowOffsetY = 5;
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill();
      ctx.restore();
      // avatar recortado dentro (deixa o anel branco aparecer)
      ctx.save();
      ctx.beginPath(); ctx.arc(cx, cy, R - ring, 0, Math.PI * 2); ctx.clip();
      const ar = img.width / img.height; let dw = 2 * (R - ring), dh = dw, dx = cx - (R - ring), dy = cy - (R - ring);
      if (ar > 1) { dh = 2 * (R - ring); dw = dh * ar; dx = cx - dw / 2; } else { dw = 2 * (R - ring); dh = dw / ar; dy = (cy - (R - ring)) - (dh - 2 * (R - ring)) * 0.16; }
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, dx, dy, dw, dh);
      ctx.restore();
      return c.toDataURL('image/png');
    }, src);
    fs.writeFileSync(path.join(BASE, d, 'avatar-round.b64'), out);
    n++;
  }
  await browser.close();
  console.log('✅ avatares redondos:', n);
})().catch(e => { console.error('❌', e.message); process.exit(1); });
