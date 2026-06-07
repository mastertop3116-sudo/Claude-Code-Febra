// Gera versões WEB (menores) dos mascotes pro e-book premium não ficar gigante.
// 2048px (~2MB) → ~820px PNG transparente (~150-300KB). Qualidade de impressão mantida (capa 92mm).
const fs = require('fs'); const path = require('path');
const puppeteer = require('puppeteer');
const DIR = path.join(__dirname, '../assets/mascotes');
const W = 820;

(async () => {
  const files = fs.readdirSync(DIR).filter(f => /-transp\.png$/.test(f));
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  for (const f of files) {
    const b64 = fs.readFileSync(path.join(DIR, f)).toString('base64');
    const out = await page.evaluate(async (src, w) => {
      const img = new Image();
      await new Promise(r => { img.onload = r; img.src = src; });
      const h = Math.round(w * img.height / img.width);
      const c = document.createElement('canvas'); c.width = w; c.height = h;
      const ctx = c.getContext('2d'); ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, w, h);
      return c.toDataURL('image/png');
    }, 'data:image/png;base64,' + b64, W);
    const buf = Buffer.from(out.replace(/^data:image\/png;base64,/, ''), 'base64');
    const outName = f.replace('-transp.png', '-web.png');
    fs.writeFileSync(path.join(DIR, outName), buf);
    console.log('  ', outName, Math.round(buf.length / 1024) + 'KB');
  }
  await browser.close();
  console.log('✅ mascotes web gerados (' + files.length + ')');
})().catch(e => { console.error('❌', e.message); process.exit(1); });
