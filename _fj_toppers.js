const { V, BAND, esc, bunting, sunCorners, renderPDF } = require('./_fj_base');

const CSS = `
.hd{position:relative;padding:11mm 14mm 5mm;text-align:center;z-index:3}
.hd .htt{font-family:'Bevan';font-size:23pt;color:${V.red};line-height:1}
.hd .hs{font-weight:800;color:${V.marrom};font-size:10.5pt;margin-top:1.5mm}
.tg{display:grid;grid-template-columns:repeat(4,1fr);gap:11mm 6mm;padding:2mm 12mm;justify-items:center}
.top{width:42mm;height:42mm;border-radius:50%;position:relative;display:flex;align-items:center;justify-content:center}
.top .cut{position:absolute;inset:0;border-radius:50%;border:2px dashed #b08a5e}
.top .ring{position:absolute;inset:1.5mm;border-radius:50%;border:3mm solid;box-shadow:0 3px 5px rgba(60,30,10,.18)}
.top .ring::after{content:'';position:absolute;inset:-3mm;border-radius:50%;border:1.2mm dotted rgba(255,255,255,.7)}
.top .in{position:absolute;inset:4.5mm;border-radius:50%;background:rgba(255,250,241,.97);display:flex;align-items:center;justify-content:center;text-align:center}
.top .w{font-family:'Bevan';font-size:11pt;line-height:1.02;padding:0 3mm}
.foot2{position:absolute;bottom:8mm;left:0;right:0;text-align:center;font-weight:800;color:${V.verde};font-size:10pt;padding:0 14mm}
.foot2 small{display:block;color:#8a6f57;font-weight:700;font-size:8.5pt;margin-top:.8mm}
`;

function top(txt, i) {
  const c = BAND[i % BAND.length];
  return `<div class="top"><div class="cut"></div><div class="ring" style="border-color:${c}"></div><div class="in"><div class="w" style="color:${c}">${esc(txt)}</div></div></div>`;
}
function sheet(htt, hs, itens) {
  return `<div class="page">${bunting(16, 3)}
    <div class="hd"><div class="htt">${esc(htt)}</div><div class="hs">${esc(hs)}</div></div>
    <div class="tg">${itens.map((t, i) => top(t, i)).join('')}</div>
    ${sunCorners()}
    <div class="foot2">✂️ Recorte e cole num palito de dente ou espeto<small>Perfeito pra bolos, cupcakes, docinhos e espetinhos</small></div>
    <div class="brand">Kit Festa Junina</div>
  </div>`;
}

const pages = [
  sheet('Toppers do Arraiá', 'Espete nos doces e no bolo', ['Arraiá','Forró','É Festa','Viva São João','Caipira','Quadrilha','São João','Anarriê','Bora Dançar','Pula a Fogueira','Bem-vindo','Que Delícia']),
  sheet('Toppers dos Quitutes', 'Identifique os docinhos com charme', ['Canjica','Paçoca','Pé-de-moleque','Pipoca','Milho','Cocada','Doce','Curau','Amo Junho','Festança','Meu Xodó','Cuidado: Gostoso']),
];

renderPDF(pages, '05_Toppers', CSS).then(() => console.log('toppers ok'));
