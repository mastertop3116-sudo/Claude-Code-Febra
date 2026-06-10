const { V, BAND, esc, bunting, ribbon, sunCorners, renderPDF } = require('./_fj_base');

const CSS = `
.hd{position:relative;padding:11mm 14mm 4mm;text-align:center;z-index:3}
.hd .htt{font-family:'Bevan';font-size:23pt;color:${V.red};text-shadow:0 2px 0 rgba(0,0,0,.06);line-height:1}
.hd .hs{font-weight:800;color:${V.marrom};font-size:10.5pt;margin-top:1.5mm}
.rowwrap{padding:0 11mm}
.row{position:relative;height:40mm;margin-bottom:5mm}
.string{position:absolute;top:2mm;left:1mm;right:1mm;height:0;border-top:2.5px solid ${V.marrom};border-radius:50%}
.pens{display:flex;justify-content:space-between;padding-top:2mm}
.pen{width:21mm;height:27mm;position:relative;box-shadow:0 2px 3px rgba(0,0,0,.18);display:flex;align-items:center;justify-content:center}
.tri{clip-path:polygon(0 0,100% 0,50% 100%)}
.ret{border-radius:0 0 2mm 2mm}
.ond{clip-path:polygon(0 0,100% 0,100% 70%,75% 100%,50% 70%,25% 100%,0 70%)}
.pen .L{font-family:'Bevan';color:#fff;font-size:17pt;margin-bottom:5mm;text-shadow:0 1px 2px rgba(0,0,0,.4)}
.pen.ret .L,.pen.ond .L{margin-bottom:0}
.foot2{position:absolute;bottom:8mm;left:0;right:0;text-align:center;font-weight:800;color:${V.verde};font-size:10pt;padding:0 14mm}
.foot2 small{display:block;color:#8a6f57;font-weight:700;font-size:8.5pt;margin-top:.8mm}
`;

function pat(i) {
  const c = BAND[i % BAND.length];
  const k = i % 5;
  let ex = '';
  if (k === 1) ex = `background-image:radial-gradient(circle,rgba(255,255,255,.9) 1.4mm,transparent 1.6mm);background-size:5.5mm 5.5mm;background-position:2mm 2mm`;
  else if (k === 2) ex = `background-image:repeating-linear-gradient(45deg,rgba(255,255,255,.55) 0 1.8mm,transparent 1.8mm 4.5mm)`;
  else if (k === 3) ex = `background-image:linear-gradient(45deg,rgba(255,255,255,.4) 25%,transparent 25% 75%,rgba(255,255,255,.4) 75%),linear-gradient(45deg,rgba(255,255,255,.4) 25%,transparent 25% 75%,rgba(255,255,255,.4) 75%);background-size:4.5mm 4.5mm;background-position:0 0,2.25mm 2.25mm`;
  return { c, ex };
}
function pennant(i, shape, letter) {
  const { c, ex } = pat(i);
  return `<div class="pen ${shape}" style="background:${c};${ex}">${letter ? `<span class="L">${esc(letter)}</span>` : ''}</div>`;
}
function row(n, off, shape) { let p = ''; for (let i = 0; i < n; i++) p += pennant(i + off, shape); return `<div class="row"><div class="string"></div><div class="pens">${p}</div></div>`; }
function letterRow(word, off, shape) {
  const ch = word.split(''); let p = '';
  ch.forEach((l, i) => p += pennant(i + off, shape, l === ' ' ? '' : l));
  return `<div class="row"><div class="string"></div><div class="pens">${p}</div></div>`;
}

function sheet(htt, hs, rowsHTML) {
  return `<div class="page">${bunting(16, 1)}
    <div class="hd"><div class="htt">${esc(htt)}</div><div class="hs">${esc(hs)}</div></div>
    <div class="rowwrap">${rowsHTML}</div>
    ${sunCorners()}
    <div class="foot2">✂️ Recorte cada bandeirinha e cole numa cordinha ou barbante<small>Imprima em papel colorido ou cartão pra durar mais</small></div>
    <div class="brand">Kit Festa Junina</div>
  </div>`;
}

const pages = [
  sheet('Bandeirinhas Clássicas', 'O enfeite que não pode faltar no arraiá', [row(7,0,'tri'),row(7,3,'tri'),row(7,1,'tri'),row(7,4,'tri'),row(7,2,'tri')].join('')),
  sheet('Bandeirinhas Xadrez & Bolinhas', 'Capriche na decoração da festa', [row(7,3,'tri'),row(7,1,'tri'),row(7,3,'tri'),row(7,1,'tri'),row(7,3,'tri')].join('')),
  sheet('Bandeirinhas Retangulares', 'Um charme a mais pra pendurar', [row(7,0,'ret'),row(7,2,'ret'),row(7,4,'ret'),row(7,1,'ret'),row(7,3,'ret')].join('')),
  sheet('Bandeirinhas Onduladas', 'Modelo diferente pra variar', [row(7,1,'ond'),row(7,3,'ond'),row(7,0,'ond'),row(7,2,'ond'),row(7,4,'ond')].join('')),
  sheet('Letreiro: ARRAIÁ', 'Recorte as letras e monte o varal', [letterRow('ARRAIÁ',0,'tri'),letterRow('SÃO JOÃO',1,'tri'),letterRow('FORRÓ',2,'tri'),letterRow('QUADRILHA',3,'tri'),letterRow('ANARRIÊ',4,'tri')].join('')),
  sheet('Letreiro: BEM-VINDOS', 'Pendure na entrada da festa', [letterRow('BEM',0,'tri'),letterRow('VINDOS',2,'tri'),letterRow('AO NOSSO',1,'tri'),letterRow('ARRAIÁ',3,'tri'),letterRow('É HOJE',4,'tri')].join('')),
];

renderPDF(pages, '02_Bandeirinhas', CSS).then(() => console.log('bandeirinhas ok'));
