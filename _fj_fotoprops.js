const { V, BAND, esc, bunting, sunCorners, motImg, renderPDF } = require('./_fj_base');

const CSS = `
.hd{position:relative;padding:11mm 14mm 5mm;text-align:center;z-index:3}
.hd .htt{font-family:'Bevan';font-size:23pt;color:${V.red};line-height:1}
.hd .hs{font-weight:800;color:${V.marrom};font-size:10.5pt;margin-top:1.5mm}
.fg{display:grid;grid-template-columns:repeat(2,1fr);gap:9mm;padding:2mm 14mm}
.prop{height:42mm;border-radius:9mm;display:flex;align-items:center;justify-content:center;text-align:center;position:relative;box-shadow:0 4px 7px rgba(60,30,10,.2)}
.prop::after{content:'';position:absolute;inset:2.5mm;border:1.6mm dashed rgba(255,255,255,.6);border-radius:6.5mm}
.prop .pw{position:relative;font-family:'Bevan';color:#fff;font-size:15pt;line-height:1.06;padding:0 7mm;text-shadow:0 1px 2px rgba(0,0,0,.3)}
.prop .stk{position:absolute;bottom:-7mm;left:50%;transform:translateX(-50%);width:7mm;height:9mm;background:#b5895a;border-radius:0 0 2mm 2mm}
.foot2{position:absolute;bottom:8mm;left:0;right:0;text-align:center;font-weight:800;color:${V.verde};font-size:10pt;padding:0 14mm}
.foot2 small{display:block;color:#8a6f57;font-weight:700;font-size:8.5pt;margin-top:.8mm}
/* moldura */
.molw{position:absolute;inset:9mm 0;padding:6mm 12mm;display:flex;align-items:center;justify-content:center}
.mol{width:100%;height:100%;border:7mm solid ${V.red};border-radius:8mm;position:relative;background:rgba(255,250,241,.5);display:flex;align-items:center;justify-content:center;flex-direction:column;box-shadow:0 6px 16px rgba(60,30,10,.2)}
.mol::before{content:'';position:absolute;inset:4mm;border:2px dashed #fff;border-radius:4mm}
.mol .hole{width:74%;height:54%;border:2px dashed ${V.marrom};border-radius:5mm;display:flex;align-items:center;justify-content:center;color:#a98b6a;font-weight:800;font-size:12pt;text-align:center;background:rgba(255,255,255,.35)}
.mol .mrow{display:flex;align-items:center;gap:6mm;margin-top:3mm}
.mol .mrow img{height:26mm;filter:drop-shadow(0 3px 4px rgba(0,0,0,.2))}
.mol .mtt{font-family:'Bevan';color:${V.red};font-size:32pt}
.mol .msub{font-weight:800;color:${V.marrom};font-size:12pt;margin-top:4mm}
`;

function prop(txt, i) {
  const c = BAND[i % BAND.length];
  return `<div class="prop" style="background:${c}"><div class="pw">${esc(txt)}</div><div class="stk"></div></div>`;
}
function sheet(htt, hs, itens) {
  return `<div class="page">${bunting(16, 4)}
    <div class="hd"><div class="htt">${esc(htt)}</div><div class="hs">${esc(hs)}</div></div>
    <div class="fg">${itens.map((t, i) => prop(t, i)).join('')}</div>
    ${sunCorners()}
    <div class="foot2">✂️ Recorte e cole num palito de churrasco<small>Distribua na festa e tire fotos engraçadas com a turma</small></div>
    <div class="brand">Kit Festa Junina</div>
  </div>`;
}
const moldura = `<div class="page">${bunting(16, 1)}
  <div class="molw"><div class="mol">
    <div class="mrow">${motImg('balao')}<div class="mtt">ARRAIÁ</div>${motImg('fogueira')}</div>
    <div class="hole">recorte este espaço<br>e coloque o rosto 📸</div>
    <div class="msub">Tire fotos divertidas na nossa festa junina! 🎉</div>
  </div></div>
  ${sunCorners()}
  ${bunting(16, 4, true)}
  <div class="brand">Kit Festa Junina · Moldura de Selfie</div></div>`;

const sayings = ['Tô Caindo na Fogueira','Cadê meu Par?','Bora Dançar!','Solteiro(a) e Caipira','Amo Forró','Rainha da Quadrilha','Rei do Milho','Meu Xodó','#Arraiá','Anarriê!','Casa Comigo?','Tô no Forró','Viva São João','Procura-se um Par','Caipira de Respeito','Xeque-mate no Forró','Festança!','Eu Amo Junho'];
const pages = [];
for (let i = 0; i < sayings.length; i += 6) pages.push(sheet('Cantinho da Foto', 'Plaquinhas divertidas pra fotos', sayings.slice(i, i + 6)));
pages.push(moldura);

renderPDF(pages, '07_Cantinho-da-Foto', CSS).then(() => console.log('foto props ok'));
