const fs = require('fs');
const path = require('path');
const BASE = 'C:\\Users\\Rodrigo Cruz\\Downloads';

const slides = [1,2,3,4,5,6].map(i => {
  const buf = fs.readFileSync(path.join(BASE, `v2-slide-${i}.png`));
  return 'data:image/png;base64,' + buf.toString('base64');
});

const html = `<!DOCTYPE html>
<html><head><style>
* { margin:0; padding:0; box-sizing:border-box; }
body { background:#1a1a1a; padding:24px; display:grid; grid-template-columns:1fr 1fr; gap:16px; font-family:Arial; }
.slide { border-radius:12px; overflow:hidden; box-shadow:0 8px 32px rgba(0,0,0,0.5); }
.slide img { width:100%; display:block; }
.label { color:#666; font-size:12px; text-align:center; padding:8px; }
</style></head><body>
${slides.map((s, i) => `<div class="slide"><img src="${s}"><div class="label">Slide ${i+1}</div></div>`).join('')}
</body></html>`;

const out = path.join(BASE, 'preview-carrossel.html');
fs.writeFileSync(out, html);
console.log('ok - ' + out);
