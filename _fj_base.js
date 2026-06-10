// BASE rústico-vintage do Kit Festa Junina — kraft de fundo, paleta quente, fitas/selos, motivos.
const fs = require('fs'); const path = require('path');
const puppeteer = require('puppeteer');
const REPO = __dirname;
const ART = path.join(REPO, 'assets/festa-junina');
const OUT = 'C:/Users/Rodrigo Cruz/Downloads/KIT-FESTA-JUNINA';
fs.mkdirSync(OUT, { recursive: true });

const b64 = (f, mime) => { try { return `data:${mime};base64,` + fs.readFileSync(path.join(ART, f)).toString('base64'); } catch (_) { return ''; } };
const KRAFT = b64('textura-kraft-web.jpg', 'image/jpeg');
const MADEIRA = b64('textura-madeira-web.jpg', 'image/jpeg');
let GAG = ''; try { GAG = fs.readFileSync(path.join(REPO, 'assets/fonts/Gagalin-Regular.otf')).toString('base64'); } catch (_) {}
const _motCache = {};
const motif = n => (_motCache[n] !== undefined ? _motCache[n] : (_motCache[n] = b64(n + '-web.png', 'image/png')));
const motImg = (n, cls = '', style = '') => `<img class="${cls}" src="${motif(n)}" style="${style}">`;

// paleta vintage
const V = { red: '#a8322a', red2: '#c0392b', most: '#d99a1f', verde: '#5f7d33', marrom: '#5b3a23', tinta: '#4a3526' };
const BAND = ['#c0392b', '#e8a020', '#4e8a3e', '#2d6fae', '#d56a1e', '#b83c69']; // bandeirinhas vivas
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function bunting(n = 16, off = 0, down = false) {
  let p = '';
  for (let i = 0; i < n; i++) p += `<span style="background:${BAND[(i + off) % BAND.length]}"></span>`;
  return `<div class="bunting ${down ? 'down' : ''}">${p}</div>`;
}
const ribbon = (txt, cor = V.red) => `<div class="ribbon" style="background:${cor}"><span>${esc(txt)}</span></div>`;
const sunCorners = () => `${motImg('girassois', 'sun tl')}${motImg('girassois', 'sun br')}`;

const BASE_CSS = `
@page{size:A4;margin:0}*{margin:0;padding:0;box-sizing:border-box}
${GAG ? `@font-face{font-family:'Gagalin';src:url(data:font/otf;base64,${GAG}) format('opentype')}` : ''}
body{font-family:'Nunito',sans-serif;color:${V.tinta}}
.page{width:210mm;height:297mm;position:relative;overflow:hidden;page-break-after:always;
  background:linear-gradient(rgba(60,30,10,.05),rgba(60,30,10,.12)), url(${KRAFT}) center/cover}
.page:last-child{page-break-after:auto}
.g{font-family:'Bevan','Gagalin',serif;font-weight:400}
.osw{font-family:'Oswald','Nunito',sans-serif}
.rye{font-family:'Rye','Bevan',serif}
.bunting{display:flex;width:100%;height:9mm;filter:drop-shadow(0 2px 1px rgba(0,0,0,.18))}
.bunting span{flex:1;clip-path:polygon(0 0,100% 0,50% 100%)}
.bunting.down{align-items:flex-start}.bunting.down span{clip-path:polygon(0 100%,100% 100%,50% 0)}
.ribbon{display:inline-block;color:#fff;text-align:center;padding:3mm 14mm;position:relative;
  clip-path:polygon(0 0,100% 0,calc(100% - 5mm) 50%,100% 100%,0 100%,5mm 50%);
  box-shadow:0 3px 5px rgba(0,0,0,.25)}
.ribbon span{font-family:'Oswald';font-weight:700;letter-spacing:3px;text-transform:uppercase;font-size:14pt;
  text-shadow:0 1px 1px rgba(0,0,0,.3)}
.sun{position:absolute;width:42mm;opacity:.96;z-index:4;pointer-events:none}
.sun.tl{top:-6mm;left:-6mm;transform:rotate(-8deg)}
.sun.br{bottom:-6mm;right:-6mm;transform:rotate(170deg)}
.panel{background:rgba(255,250,241,.9);border-radius:6mm;border:3px solid ${V.marrom};
  box-shadow:0 6px 18px rgba(60,30,10,.18);position:relative}
.panel::before{content:'';position:absolute;inset:3mm;border:2px dashed ${V.red};border-radius:4mm;opacity:.4;pointer-events:none}
.cut{border:2px dashed #b89a78;border-radius:4mm}
.foot{position:absolute;bottom:8mm;left:0;right:0;text-align:center;font-weight:800;color:${V.verde};font-size:10.5pt;padding:0 14mm;z-index:5}
.foot small{display:block;color:#8a6f57;font-weight:700;font-size:8.5pt;margin-top:1mm}
.brand{position:absolute;bottom:3mm;left:0;right:0;text-align:center;font-family:'Oswald';font-weight:600;font-size:7pt;letter-spacing:2px;text-transform:uppercase;color:rgba(91,58,35,.55);z-index:5}
`;

function doc(pagesHTML, extraCSS = '') {
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bevan&family=Oswald:wght@500;600;700&family=Rye&family=Nunito:wght@600;700;800;900&display=swap" rel="stylesheet">
<style>${BASE_CSS}${extraCSS}</style></head><body>${pagesHTML.join('')}</body></html>`;
}

async function renderPDF(pagesHTML, outName, extraCSS = '') {
  const b = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const pg = await b.newPage();
  await pg.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2 });
  await pg.setContent(doc(pagesHTML, extraCSS), { waitUntil: 'load', timeout: 120000 });
  await pg.evaluateHandle('document.fonts.ready');
  const out = path.join(OUT, outName + '.pdf');
  await pg.pdf({ path: out, format: 'A4', printBackground: true });
  await b.close();
  console.log('  ✓', outName + '.pdf', '(' + pagesHTML.length + ' pg)');
  return out;
}

module.exports = { OUT, REPO, ART, V, BAND, GAG, KRAFT, MADEIRA, esc, bunting, ribbon, sunCorners, motif, motImg, doc, renderPDF, BASE_CSS };
