// Gerenciador de fontes para os posts
// Carrega fontes locais da pasta fonts/ como base64 — sem internet na hora de gerar

const fs   = require('fs');
const path = require('path');

const FONTS_DIR = path.join(__dirname, 'fonts');

const fontMap = {
  gagalin:       'Gagalin-Regular.woff',
  bebas:         'BebasNeue-Regular.ttf',
  anton:         'Anton-Regular.ttf',
  oswald:        'Oswald-Bold.ttf',
  barlow:        'BarlowCondensed-Black.ttf',
  poppins:       'Poppins-Bold.ttf',
  'poppins-black': 'Poppins-Black.ttf',
  montserrat:    'Montserrat-Bold.woff2',
  raleway:       'Raleway-Bold.ttf',
  playfair:      'PlayfairDisplay-Bold.ttf',
  inter:         'Inter-Bold.woff2',
};

const formatoMap = {
  ttf:   'truetype',
  otf:   'opentype',
  woff:  'woff',
  woff2: 'woff2',
};

function carregarFonte(apelido) {
  const arquivo = fontMap[apelido.toLowerCase()];
  if (!arquivo) return null;

  const caminho = path.join(FONTS_DIR, arquivo);
  if (!fs.existsSync(caminho)) return null;

  const buffer  = fs.readFileSync(caminho);
  if (buffer.length < 1000) return null; // arquivo corrompido

  const base64  = buffer.toString('base64');
  const ext     = path.extname(arquivo).slice(1).toLowerCase();
  const formato = formatoMap[ext] || 'truetype';
  const mimeFont = ext === 'woff2' ? 'font/woff2' : ext === 'woff' ? 'font/woff' : `font/${formato}`;
  const familia = apelido.charAt(0).toUpperCase() + apelido.slice(1);

  return `@font-face {
    font-family: '${familia}';
    src: url('data:${mimeFont};base64,${base64}') format('${formato}');
    font-weight: 400 900;
    font-style: normal;
  }`;
}

function getFontStyle(fontes = []) {
  const blocos = fontes.map(f => carregarFonte(f)).filter(Boolean).join('\n');
  return blocos ? `<style>${blocos}</style>` : '';
}

module.exports = { carregarFonte, getFontStyle, fontMap };
