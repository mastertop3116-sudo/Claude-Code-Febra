const { V, BAND, esc, ribbon, motImg, renderPDF } = require('./_fj_base');

const CSS = `
.cw{position:absolute;inset:8mm 0;display:flex;flex-direction:column;justify-content:space-around;padding:4mm 11mm;gap:6mm}
.inv{flex:1;display:flex;align-items:center;gap:7mm;padding:7mm 9mm;text-align:left}
.inv .mside{flex:0 0 40mm;display:flex;align-items:center;justify-content:center}
.inv .mside img{height:52mm;filter:drop-shadow(0 4px 5px rgba(0,0,0,.2))}
.inv .body{flex:1;display:flex;flex-direction:column;gap:2mm;align-items:flex-start}
.inv .tt{font-family:'Bevan';font-size:24pt;line-height:1.02}
.inv .det{font-weight:800;color:${V.marrom};font-size:11pt;line-height:2}
.inv .det b{color:${V.tinta}}
.inv .ln{display:inline-block;border-bottom:2px dashed #b08a5e;min-width:42mm}
.inv .cta{font-family:'Bevan';font-size:11pt;margin-top:1mm}
`;
function inv(cor, titulo, mot) {
  return `<div class="inv panel">
    <div class="mside">${motImg(mot)}</div>
    <div class="body">
      ${ribbon('Você é nosso convidado', cor)}
      <div class="tt" style="color:${cor}">${esc(titulo)}</div>
      <div class="det">📅 Dia: <span class="ln"></span><br>🕐 Hora: <span class="ln"></span><br>📍 Local: <span class="ln"></span><br>👕 Traje: caipira a caráter</div>
      <div class="cta" style="color:${V.verde}">Bora festejar com a gente! 🌽🔥</div>
    </div>
  </div>`;
}
function page(a, b) { return `<div class="page"><div class="cw">${a}${b}</div><div class="brand">Kit Festa Junina · Convites</div></div>`; }

const invites = [
  inv(V.red, 'Arraiá do/da ____', 'casal-caipira'),
  inv('#2d6fae', 'Festa Junina ____', 'balao'),
  inv('#d56a1e', 'São João do/da ____', 'fogueira'),
  inv(V.verde, 'Nosso Arraiá ____', 'girassois'),
  inv('#b83c69', 'Forró do/da ____', 'sanfona'),
  inv(V.red2, 'Quadrilha do/da ____', 'chapeu-palha'),
];
const pages = [];
for (let i = 0; i < invites.length; i += 2) pages.push(page(invites[i], invites[i + 1] || ''));

renderPDF(pages, '08_Convites', CSS).then(() => console.log('convites ok'));
