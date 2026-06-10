// Protótipo: capa ANTES (sem mascote) e DEPOIS (com mascote), nos 3 estilos.
const puppeteer = require('puppeteer');
const path = require('path');
const fs   = require('fs');
const { getFontStyle } = require('./fonts');
const { urlMascote }   = require('./mascote');

const templates = {
  dark:    require('./templates/dark/slide'),
  premium: require('./templates/premium/slide'),
  color:   require('./templates/color/slide'),
};
const FONTE = { dark: ['bebas'], premium: ['anton'], color: ['gagalin'] };

const OUT = path.join(process.env.USERPROFILE || '.', 'Downloads', 'AMOSTRAS-INSTAGRAM-JIUJITSU', '05-UPGRADE-mascote');
fs.mkdirSync(OUT, { recursive: true });

function buildHtml(bodyHtml, fontes) {
  const fontStyle = getFontStyle(fontes);
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Noto+Color+Emoji&display=block" rel="stylesheet">
${fontStyle}
<style>
  * { box-sizing:border-box; margin:0; padding:0; font-family:'${fontes[0] || 'Arial'}','Noto Color Emoji',Arial,sans-serif; }
  body { width:1080px; height:1080px; overflow:hidden; position:relative; }
</style>
</head><body>${bodyHtml}</body></html>`;
}

const capa = {
  tipo: 'capa',
  titulo: '6 Erros Que Afastam Crianças do Tatame',
  texto: 'O 3º acontece em quase toda aula e ninguém percebe a tempo.',
  total: 7, badge: 'Erros Comuns', emoji: '🥋',
};
const cta = {
  tipo: 'cta',
  titulo: 'Salva e Aplica na Próxima Aula',
  texto: 'Manda pra um sensei que precisa ver isso e salva pra não esquecer.',
  total: 7, badge: 'Bora Treinar', emoji: '🥋',
};
const FAIXA_PROTO = { dark: 'preta', premium: 'marrom', color: 'laranja' };

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'] });
  for (const estilo of ['dark', 'premium', 'color']) {
    const fn = templates[estilo];
    const masc = urlMascote({ faixa: FAIXA_PROTO[estilo] });
    for (const base of [capa, cta]) {
      const html = buildHtml(fn({ ...base, mascote: masc }), FONTE[estilo]);
      const page = await browser.newPage();
      await page.setViewport({ width: 1080, height: 1080 });
      await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await new Promise(r => setTimeout(r, 2500));
      const out = path.join(OUT, `${base.tipo}-${estilo}-DEPOIS.png`);
      await page.screenshot({ path: out, type: 'png' });
      await page.close();
      console.log('->', out);
    }
  }
  await browser.close();
  console.log('\nPronto:', OUT);
})().catch(e => { console.error('ERRO:', e); process.exit(1); });
