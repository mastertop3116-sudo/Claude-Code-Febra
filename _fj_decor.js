const { V, BAND, esc, bunting, sunCorners, motImg, renderPDF } = require('./_fj_base');

const CSS = `
.hd{position:relative;padding:11mm 14mm 5mm;text-align:center;z-index:3}
.hd .htt{font-family:'Bevan';font-size:23pt;color:${V.red};line-height:1}
.hd .hs{font-weight:800;color:${V.marrom};font-size:10.5pt;margin-top:1.5mm}
.foot2{position:absolute;bottom:8mm;left:0;right:0;text-align:center;font-weight:800;color:${V.verde};font-size:10pt;padding:0 14mm}
.foot2 small{display:block;color:#8a6f57;font-weight:700;font-size:8.5pt;margin-top:.8mm}
/* forminhas */
.fmg{display:grid;grid-template-columns:repeat(4,1fr);gap:9mm 7mm;padding:2mm 13mm;justify-items:center}
.fm{width:40mm;height:40mm;position:relative}
.fm .b{position:absolute;inset:0;border-radius:50%;background:repeating-conic-gradient(var(--c) 0 18deg, #fff7ea 18deg 36deg)}
.fm .c{position:absolute;inset:7mm;border-radius:50%;background:var(--c);display:flex;align-items:center;justify-content:center}
.fm .c::after{content:'';position:absolute;inset:0;border-radius:50%;border:1.4mm dotted rgba(255,255,255,.75)}
.fm .cut{position:absolute;inset:-1mm;border-radius:50%;border:1.8px dashed #b08a5e}
/* tags copo */
.tcg{display:grid;grid-template-columns:repeat(4,1fr);gap:10mm 7mm;padding:2mm 13mm;justify-items:center}
.tc{width:40mm;height:34mm;background:rgba(255,250,241,.95);border:2px dashed #b08a5e;border-radius:4mm;position:relative;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 4px rgba(60,30,10,.14)}
.tc .top{position:absolute;top:0;left:0;right:0;height:7mm;display:flex}
.tc .top span{flex:1;clip-path:polygon(0 0,100% 0,50% 100%)}
.tc .slit{position:absolute;top:50%;right:-1px;width:9mm;height:2px;background:#b08a5e}
.tc .w{font-family:'Bevan';font-size:12pt;margin-top:5mm}
/* medalhoes */
.mdg{display:grid;grid-template-columns:repeat(2,1fr);gap:11mm;padding:2mm 16mm;justify-items:center}
.md{width:78mm;height:78mm;border-radius:50%;position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2mm;background:rgba(255,250,241,.95);box-shadow:0 4px 8px rgba(60,30,10,.18)}
.md .ring{position:absolute;inset:0;border-radius:50%;border:4mm solid var(--c)}
.md .ring::after{content:'';position:absolute;inset:1mm;border-radius:50%;border:1.4mm dotted rgba(255,255,255,.7)}
.md .cut{position:absolute;inset:-1.5mm;border-radius:50%;border:1.8px dashed #b08a5e}
.md img{height:30mm;position:relative}
.md .w{position:relative;font-family:'Bevan';font-size:15pt;color:var(--c)}
.md .hole{position:absolute;top:3mm;width:5mm;height:5mm;border-radius:50%;border:1.6px dashed #b08a5e}
`;

function forminha(i) { const c = BAND[i % BAND.length]; return `<div class="fm" style="--c:${c}"><div class="cut"></div><div class="b"></div><div class="c"></div></div>`; }
function tagcopo(txt, i) { const c = BAND[i % BAND.length]; let t = ''; for (let k = 0; k < 6; k++) t += `<span style="background:${BAND[(i + k) % BAND.length]}"></span>`; return `<div class="tc"><div class="top">${t}</div><div class="slit"></div><div class="w" style="color:${c}">${esc(txt)}</div></div>`; }
function medalhao(txt, mot, i) { const c = BAND[i % BAND.length]; return `<div class="md" style="--c:${c}"><div class="cut"></div><div class="ring"></div><div class="hole"></div>${mot ? motImg(mot) : ''}<div class="w">${esc(txt)}</div></div>`; }

function sheet(htt, hs, gridCls, inner, foot) {
  return `<div class="page">${bunting(16, 5)}
    <div class="hd"><div class="htt">${esc(htt)}</div><div class="hs">${esc(hs)}</div></div>
    <div class="${gridCls}">${inner}</div>
    ${sunCorners()}
    <div class="foot2">${foot}</div>
    <div class="brand">Kit Festa Junina</div>
  </div>`;
}

const nomes = ['João','Maria','Zé','Ana','Chico','Lia','Tião','Rita','Bento','Cida','Vovó','Vovô'];
const pages = [
  sheet('Forminhas de Docinho', 'Pra deixar brigadeiro e bem-casado com charme', 'fmg', Array.from({length:12},(_,i)=>forminha(i)).join(''), '✂️ Recorte e acomode o docinho no centro<small>Imprima em papel um pouco mais firme</small>'),
  sheet('Tags de Copo & Canudo', 'Ninguém troca de copo na festa', 'tcg', nomes.map((n,i)=>tagcopo(n,i)).join('') + Array.from({length:4},(_,i)=>tagcopo('____',i+8)).join(''), '✂️ Recorte e encaixe a fenda no copo ou canudo<small>Escreva o nome de cada convidado</small>'),
  sheet('Medalhões Decorativos', 'Pendure pela festa ou use de enfeite de mesa', 'mdg', [medalhao('Arraiá','girassois',0),medalhao('Forró','sanfona',1),medalhao('São João','fogueira',2),medalhao('Bem-vindo','balao',3)].join(''), '✂️ Recorte, fure o topo e pendure num barbante<small>Faça vários e crie um varal de medalhões</small>'),
];

renderPDF(pages, '10_Decoracao-Extra', CSS).then(() => console.log('decor ok'));
