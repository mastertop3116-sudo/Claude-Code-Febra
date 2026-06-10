const { V, esc, bunting, ribbon, motImg, motif, renderPDF } = require('./_fj_base');

const CSS = `
.wrap{position:absolute;inset:9mm 0;display:flex;flex-direction:column;justify-content:space-around;padding:5mm 12mm;gap:6mm}
.sign{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3mm;padding:8mm 9mm;text-align:center;position:relative}
.sign .word{font-family:'Bevan';font-size:38pt;line-height:1;text-shadow:0 2px 0 rgba(0,0,0,.07)}
.sign .arrow{font-family:'Bevan';font-size:30pt;line-height:1}
.sign .mot{height:34mm;filter:drop-shadow(0 4px 5px rgba(0,0,0,.2))}
.sign .mb{display:flex;height:6mm;width:70mm}
.sign .mb span{flex:1;clip-path:polygon(0 0,100% 0,50% 100%)}
`;
const BAND = require('./_fj_base').BAND;

function sign(cor, word, mot, arrow) {
  let mb = ''; for (let k = 0; k < 11; k++) mb += `<span style="background:${BAND[k % BAND.length]}"></span>`;
  return `<div class="sign panel">
    ${ribbon('Arraiá', cor)}
    <div class="word" style="color:${cor}">${esc(word)}${arrow ? ` <span class="arrow">${arrow}</span>` : ''}</div>
    ${mot ? motImg(mot, 'mot') : ''}
    <div class="mb">${mb}</div>
  </div>`;
}
function page(a, b) {
  return `<div class="page">${bunting(16, 2)}
    <div class="wrap">${a}${b}</div>
    <div class="brand">Kit Festa Junina</div>
  </div>`;
}

const signs = [
  sign(V.red, 'COMIDAS', 'milho', '➜'),
  sign('#2d6fae', 'BEBIDAS', 'balao', '➜'),
  sign('#d56a1e', 'CANTINHO DA FOTO', 'girassois', ''),
  sign(V.verde, 'DOCES', 'milho', '➜'),
  sign('#b83c69', 'BAR DO ARRAIÁ', 'sanfona', ''),
  sign(V.red2, 'QUENTÃO', 'fogueira', '➜'),
  sign('#7a4ea0', 'PESCARIA', 'balao', '➜'),
  sign('#2f7d4f', 'CORREIO ELEGANTE', 'lampiao', ''),
  sign(V.most, 'BARRACA DE PRENDAS', 'chapeu-palha', ''),
  sign(V.red, 'BEM-VINDOS', 'casal-caipira', ''),
  sign('#1f7a8c', 'BANHEIRO', 'lampiao', '➜'),
  sign('#c0392b', 'SELFIE AQUI', 'girassois', ''),
];
const pages = [];
for (let i = 0; i < signs.length; i += 2) pages.push(page(signs[i], signs[i + 1] || ''));

renderPDF(pages, '06_Plaquinhas-Sinalizacao', CSS).then(() => console.log('placas ok'));
