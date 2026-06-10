const { V, BAND, esc, bunting, sunCorners, renderPDF } = require('./_fj_base');

const CSS = `
.hd{position:relative;padding:11mm 14mm 5mm;text-align:center;z-index:3}
.hd .htt{font-family:'Bevan';font-size:23pt;color:${V.red};line-height:1}
.hd .hs{font-weight:800;color:${V.marrom};font-size:10.5pt;margin-top:1.5mm}
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:7mm;padding:0 13mm}
.tag{background:rgba(255,250,241,.94);border:2px dashed #b08a5e;border-radius:5mm;overflow:hidden;height:48mm;display:flex;flex-direction:column;box-shadow:0 3px 6px rgba(60,30,10,.14)}
.tb{height:12mm;position:relative;display:flex;align-items:center;justify-content:center}
.tb::after{content:'';position:absolute;inset:0;background-image:radial-gradient(circle,rgba(255,255,255,.85) 1mm,transparent 1.2mm);background-size:5mm 5mm;background-position:2mm 3mm}
.tb b{position:relative;color:#fff;font-family:'Oswald';font-weight:600;letter-spacing:2px;text-transform:uppercase;font-size:8.5pt;text-shadow:0 1px 1px rgba(0,0,0,.3)}
.tn{flex:1;display:flex;align-items:center;justify-content:center;text-align:center;font-family:'Bevan';font-size:15.5pt;padding:0 3mm;line-height:1.05}
.mb{display:flex;height:6mm}
.mb span{flex:1;clip-path:polygon(0 0,100% 0,50% 100%)}
.foot2{position:absolute;bottom:8mm;left:0;right:0;text-align:center;font-weight:800;color:${V.verde};font-size:10pt;padding:0 14mm}
.foot2 small{display:block;color:#8a6f57;font-weight:700;font-size:8.5pt;margin-top:.8mm}
`;

function tag(nome, i, etiqueta) {
  const c = BAND[i % BAND.length];
  let mb = ''; for (let k = 0; k < 9; k++) mb += `<span style="background:${BAND[(i + k) % BAND.length]}"></span>`;
  return `<div class="tag">
    <div class="tb" style="background:${c}"><b>${esc(etiqueta)}</b></div>
    <div class="tn" style="color:${c}">${esc(nome)}</div>
    <div class="mb">${mb}</div>
  </div>`;
}
function sheet(htt, hs, itens, etiqueta) {
  const g = itens.map((n, i) => tag(n, i, etiqueta)).join('');
  return `<div class="page">${bunting(16, 2)}
    <div class="hd"><div class="htt">${esc(htt)}</div><div class="hs">${esc(hs)}</div></div>
    <div class="grid">${g}</div>
    ${sunCorners()}
    <div class="foot2">✂️ Recorte, dobre ou cole num palito — vira plaquinha de pé<small>Use nos potes, garrafas, bolos, docinhos e travessas</small></div>
    <div class="brand">Kit Festa Junina</div>
  </div>`;
}

const pages = [
  sheet('Rótulos — Comidas', 'Identifique os quitutes da mesa', ['Pipoca','Milho Cozido','Pamonha','Cuscuz','Bolo de Milho','Caldo Verde','Pastel','Cachorro-quente','Amendoim'], 'Mesa do Arraiá'),
  sheet('Rótulos — Docinhos', 'Os doces típicos de São João', ['Canjica','Pé-de-moleque','Paçoca','Curau','Cocada','Maçã do Amor','Arroz Doce','Doce de Abóbora','Bolo de Fubá'], 'Doces da Festa'),
  sheet('Rótulos — Bebidas', 'Pra molhar a palavra no arraiá', ['Quentão','Suco','Refrigerante','Água','Café','Chocolate Quente','Caldo de Cana','Limonada','Vinho Quente'], 'Bebidas'),
  sheet('Rótulos — Em Branco', 'Escreva o que quiser na linha', ['__________','__________','__________','__________','__________','__________','__________','__________','__________'], 'Escreva aqui'),
];

renderPDF(pages, '04_Rotulos-Comida-Bebida', CSS).then(() => console.log('rótulos ok'));
