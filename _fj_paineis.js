const { V, esc, bunting, ribbon, sunCorners, motImg, renderPDF } = require('./_fj_base');

const CSS = `
.pa{position:absolute;inset:9mm 0;display:flex;align-items:center;justify-content:center;padding:6mm 13mm}
.pn{width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:7mm;padding:14mm 11mm;text-align:center}
.big{font-size:42pt;line-height:1.04;letter-spacing:.5px;text-shadow:0 2px 0 rgba(0,0,0,.08),0 3px 6px rgba(0,0,0,.12)}
.motrow{display:flex;align-items:flex-end;justify-content:center;gap:7mm;height:48mm}
.motrow img{height:46mm;filter:drop-shadow(0 5px 6px rgba(0,0,0,.22))}
.motrow img.sm{height:38mm}
.ps{font-weight:800;font-size:13.5pt;color:${V.marrom};max-width:150mm;line-height:1.32}
.nome{border-bottom:3px dashed ${V.red};min-width:95mm;height:15mm;align-self:center}
`;

function painel(cor, kicker, titulo, motifs, sub, off, nome) {
  const mot = motifs.map((m, i) => motImg(m, i % 2 ? 'sm' : '')).join('');
  return `<div class="page">${bunting(16, off)}
    <div class="pa"><div class="panel pn">
      ${ribbon(kicker, cor)}
      <div class="big g" style="color:${cor}">${titulo}</div>
      <div class="motrow">${mot}</div>
      ${nome ? `<div class="nome"></div>` : ''}
      <div class="ps">${esc(sub)}</div>
    </div></div>
    ${sunCorners()}
    ${bunting(16, off + 3, true)}
    <div class="brand">Kit Festa Junina</div>
  </div>`;
}

const paineis = [
  painel(V.red, 'Sejam bem-vindos', 'BEM-VINDOS<br>AO ARRAIÁ', ['balao', 'fogueira', 'casal-caipira'], 'A festa mais animada do São João começa aqui!', 0),
  painel('#d56a1e', 'Chegou a hora', 'É HORA DO<br>FORRÓ!', ['chapeu-palha', 'sanfona', 'milho'], 'Puxa a sanfona que a quadrilha vai começar!', 2),
  painel('#2d6fae', 'Anarriê!', 'BORA CAIR NA<br>QUADRILHA', ['casal-caipira', 'sanfona'], 'Todo mundo de mãos dadas no salão. Bora dançar!', 4),
  painel(V.verde, 'O arraiá é aqui', 'SEJA BEM-VINDO<br>À NOSSA FESTA', ['balao', 'girassois', 'lampiao'], 'Entre, dance, coma e divirta-se com a gente!', 1),
  painel(V.red2, 'Bem-vindos ao', 'ARRAIÁ<br>DO/DA', ['fogueira', 'milho'], 'Escreva o nome da família ou da festa na linha acima.', 5, true),
  painel('#caa11e', 'Que comece a festa', 'QUE COMECE<br>A FESTA!', ['balao', 'fogueira', 'sanfona'], 'Comida boa, música boa e muita diversão. Aproveite!', 6),
];

renderPDF(paineis, '03_Paineis-Bem-Vindos', CSS).then(() => console.log('painéis ok'));
