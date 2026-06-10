const { V, esc, bunting, ribbon, sunCorners, motImg, renderPDF } = require('./_fj_base');

const CSS = `
.cov{position:absolute;inset:9mm 0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:8mm 14mm;gap:5mm}
.selo{position:absolute;top:14mm;right:12mm;width:34mm;height:34mm;border-radius:50%;background:${V.verde};color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;transform:rotate(12deg);box-shadow:0 4px 8px rgba(0,0,0,.25);border:2mm solid #fff;z-index:6}
.selo b{font-family:'Bevan';font-size:17pt;line-height:.9}.selo small{font-family:'Oswald';font-weight:700;text-transform:uppercase;letter-spacing:1px;font-size:7pt}
.ctt{font-family:'Bevan';font-size:52pt;line-height:.98;color:${V.red};text-shadow:0 3px 0 rgba(0,0,0,.08),0 5px 9px rgba(0,0,0,.16)}
.csub{font-weight:800;color:${V.marrom};font-size:13pt;max-width:155mm;line-height:1.35}
.cmot{display:flex;align-items:flex-end;justify-content:center;gap:5mm;height:62mm;margin-top:2mm}
.cmot img{filter:drop-shadow(0 5px 7px rgba(0,0,0,.22))}
.cmot .big{height:62mm}.cmot .md{height:48mm}.cmot .sm{height:40mm}
.cbrand{font-weight:800;color:${V.tinta};font-size:12pt;margin-top:3mm}
.cbrand .ln{display:inline-block;border-bottom:2px dashed ${V.red};min-width:60mm}
/* indice */
.iw{position:absolute;inset:9mm 0;padding:6mm 13mm;display:flex;flex-direction:column}
.ipanel{flex:1;padding:9mm 11mm}
.itt{font-family:'Bevan';font-size:26pt;color:${V.red};text-align:center;margin:2mm 0 5mm}
.irow{display:flex;align-items:baseline;gap:3mm;font-size:11pt;color:${V.tinta};font-weight:700;line-height:2.35;border-bottom:2px dotted #d3bd9a}
.irow .em{font-size:13pt}.irow b{font-family:'Bevan';font-weight:400;color:${V.red2}}
.irow .q{margin-left:auto;font-family:'Oswald';font-weight:700;color:${V.verde};font-size:10pt;white-space:nowrap}
/* como usar */
.pw{position:absolute;inset:9mm 0;padding:6mm 13mm;display:flex;flex-direction:column;gap:6mm}
.ptt{font-family:'Bevan';font-size:25pt;color:${V.red};text-align:center}
.pgrid{flex:1;display:grid;grid-template-columns:1fr 1fr;gap:7mm}
.step{display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:2mm;padding:7mm}
.step .num{width:18mm;height:18mm;border-radius:50%;background:var(--c);color:#fff;font-family:'Bevan';font-size:22pt;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 5px rgba(0,0,0,.2)}
.step .e{font-size:24pt}
.step .st{font-family:'Bevan';font-size:17pt;color:var(--c)}
.step .sd{font-weight:700;color:${V.marrom};font-size:10.5pt;line-height:1.35;max-width:62mm}
`;

const capa = `<div class="page">${bunting(18, 0)}
  <div class="cov">
    <div class="selo"><b>100+</b><small>materiais</small></div>
    ${ribbon('Tudo prontinho pra imprimir')}
    <div class="ctt">KIT<br>FESTA JUNINA</div>
    <div class="csub">Decore e monte um arraiá lindo em poucos minutos — sem perder horas criando tudo do zero.</div>
    <div class="cmot">${motImg('girassois','sm')}${motImg('fogueira','md')}${motImg('casal-caipira','big')}${motImg('balao','md')}${motImg('sanfona','sm')}</div>
    <div class="cbrand">por <span class="ln"></span></div>
  </div>
  ${sunCorners()}
  ${bunting(18, 3, true)}
</div>`;

const ir = (em, nome, q) => `<div class="irow"><span class="em">${em}</span><b>${esc(nome)}</b><span class="q">${esc(q)}</span></div>`;
const indice = `<div class="page">${bunting(16, 1)}
  <div class="iw"><div class="ipanel panel">
    <div class="itt">O que tem no Kit</div>
    ${ir('🎪','Painéis "Bem-Vindos ao Arraiá"','6 painéis')}
    ${ir('🎏','Bandeirinhas e Letreiros','6 folhas')}
    ${ir('🏷️','Rótulos de Comida e Bebida','32 rótulos')}
    ${ir('🎂','Toppers de Bolo e Docinho','24 toppers')}
    ${ir('🪧','Plaquinhas de Sinalização','12 placas')}
    ${ir('📸','Cantinho da Foto + Moldura','18 placas')}
    ${ir('💌','Convites','6 modelos')}
    ${ir('🎲','Brincadeiras com Regras','8 jogos')}
    ${ir('🎀','Decoração Extra (forminhas, tags, medalhões)','3 folhas')}
    ${ir('📋','Bônus do Organizador (checklist, compras, cardápio…)','5 guias')}
  </div></div>
  ${sunCorners()}
  <div class="brand">Kit Festa Junina</div>
</div>`;

const step = (c, n, e, t, d) => `<div class="step panel" style="--c:${c}"><div class="num">${n}</div><div class="e">${e}</div><div class="st">${esc(t)}</div><div class="sd">${esc(d)}</div></div>`;
const comoUsar = `<div class="page">${bunting(16, 2)}
  <div class="pw">
    <div class="ptt">Como usar o Kit — em 4 passos</div>
    <div class="pgrid">
      ${step(V.red,'1','🖨️','Imprima','Imprima as páginas que quiser em papel comum (sulfite). Papel mais firme ou colorido deixa ainda mais bonito.')}
      ${step('#2d6fae','2','✂️','Recorte','Recorte nas linhas pontilhadas. As peças já vêm prontas pra montar — é só seguir o tracejado.')}
      ${step(V.verde,'3','🧩','Monte','Cole em palitos, barbantes ou cartolina conforme cada peça. Tem dica em cada folha.')}
      ${step('#d56a1e','4','🎉','Aproveite','Decore o espaço, espalhe as brincadeiras e curta um arraiá lindo e organizado com a turma!')}
    </div>
  </div>
  ${sunCorners()}
  <div class="brand">Kit Festa Junina</div>
</div>`;

renderPDF([capa, indice, comoUsar], '00_Capa-Indice-Como-Usar', CSS).then(() => console.log('capa ok'));
