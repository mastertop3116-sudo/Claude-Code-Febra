// JOGOS JUNINOS PRINTÁVEIS — painéis pra imprimir, recortar, montar e jogar.
// Modela o concorrente (Mini Cesta Caipira, Tomba Torre, Acerte o Alvo/Milho, Pescaria, Painel Premiado) e ENTREGA MAIS.
const { V, BAND, esc, bunting, ribbon, sunCorners, motImg, renderPDF } = require('./_fj_base');

const CSS = `
.jp{position:absolute;inset:9mm 0;display:flex;flex-direction:column;align-items:center;padding:4mm 12mm 0;text-align:center}
.jtt{font-family:'Bevan';font-size:30pt;color:${V.red};line-height:.98;text-shadow:0 2px 0 rgba(0,0,0,.06);margin-top:1mm}
.jsub{font-weight:800;color:${V.marrom};font-size:11pt;margin-top:1mm;max-width:150mm;line-height:1.3}
.center{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;width:100%;gap:3mm;position:relative}
.how{width:100%;background:rgba(255,250,241,.92);border:2.5px solid ${V.marrom};border-radius:5mm;padding:4mm 7mm;position:relative;margin-bottom:2mm}
.how::before{content:'';position:absolute;inset:2mm;border:1.5px dashed ${V.red};border-radius:3.5mm;opacity:.35}
.how .ht{font-family:'Oswald';font-weight:700;text-transform:uppercase;letter-spacing:2px;color:${V.verde};font-size:11pt;margin-bottom:1.5mm}
.how .hr{font-weight:800;color:${V.tinta};font-size:9.6pt;line-height:1.5;text-align:left}
.how .hr b{color:${V.red}}
.mont{font-weight:800;color:#8a6f57;font-size:8.6pt;margin-top:1mm}
/* alvo */
.alvo{width:118mm;height:118mm;border-radius:50%;display:flex;align-items:center;justify-content:center;position:relative;box-shadow:0 8px 20px rgba(60,30,10,.25);border:3mm solid #fff}
.ring{position:absolute;border-radius:50%;display:flex;align-items:flex-start;justify-content:center}
.ring b{font-family:'Bevan';color:#fff;font-size:13pt;margin-top:2mm;text-shadow:0 1px 2px rgba(0,0,0,.4)}
/* milho */
.milho-wrap{position:relative;display:flex;align-items:center;justify-content:center}
.ptbubble{position:absolute;width:24mm;height:24mm;border-radius:50%;background:${V.red};color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;border:2.5mm solid #fff;box-shadow:0 4px 8px rgba(0,0,0,.3);font-family:'Bevan'}
.ptbubble b{font-size:17pt;line-height:.9}.ptbubble small{font-family:'Oswald';font-weight:700;font-size:6pt;letter-spacing:1px}
/* cesta */
.cestas{display:flex;gap:8mm;align-items:flex-end;justify-content:center}
.cesta{display:flex;flex-direction:column;align-items:center;gap:2mm}
.aro{width:38mm;height:20mm;border:3mm solid ${V.marrom};border-top:none;border-radius:0 0 19mm 19mm;background:rgba(255,250,241,.5);display:flex;align-items:flex-end;justify-content:center;padding-bottom:2mm}
.cesta .pt{font-family:'Bevan';font-size:20pt;color:${V.red}}
.cesta .lab{font-family:'Oswald';font-weight:700;text-transform:uppercase;font-size:8pt;color:${V.marrom};letter-spacing:1px}
.cole{font-weight:800;color:${V.verde};font-size:8.5pt;margin-top:1mm}
/* latas / argolas / boliche — grade de tiras */
.grid{display:grid;gap:5mm;width:100%}
.tira{border:2px dashed #b89a78;border-radius:3mm;height:34mm;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;background:rgba(255,250,241,.55)}
.tira .lt{font-family:'Bevan';font-size:15pt;color:#fff;background:var(--c);padding:2mm 0;width:100%;height:100%;display:flex;align-items:center;justify-content:center;text-transform:uppercase;letter-spacing:1px;text-shadow:0 1px 2px rgba(0,0,0,.3)}
/* peixes */
.peixes{display:grid;grid-template-columns:repeat(4,1fr);gap:5mm;width:100%}
.peixe{height:30mm;background:var(--c);position:relative;display:flex;align-items:center;justify-content:center;
  clip-path:polygon(0 50%,22% 12%,72% 12%,100% 0,86% 50%,100% 100%,72% 88%,22% 88%);box-shadow:0 3px 5px rgba(0,0,0,.2)}
.peixe b{font-family:'Bevan';color:#fff;font-size:19pt;text-shadow:0 1px 2px rgba(0,0,0,.4);margin-left:-6mm}
.peixe i{position:absolute;left:24%;top:34%;width:4mm;height:4mm;border-radius:50%;background:#fff;border:1px solid rgba(0,0,0,.3)}
.pdash{position:absolute;inset:-2.5mm;border:2px dashed #b89a78}
/* premiado */
.pgrid{display:grid;grid-template-columns:repeat(4,1fr);gap:4mm;width:100%}
.pcard{aspect-ratio:1/1.15;border:2px dashed #b89a78;border-radius:3mm;display:flex;flex-direction:column;align-items:center;justify-content:center;background:var(--c);color:#fff;gap:1mm;box-shadow:0 2px 4px rgba(0,0,0,.18)}
.pcard .e{font-size:20pt}.pcard .pt2{font-family:'Bevan';font-size:11pt;line-height:1;text-align:center;text-shadow:0 1px 2px rgba(0,0,0,.35)}
`;

const how = (t, rows, mont) => `<div class="how"><div class="ht">${t}</div><div class="hr">${rows.map(r => `• ${r}`).join('<br>')}</div>${mont ? `<div class="mont">🛠️ ${mont}</div>` : ''}</div>`;

function page(tt, sub, centerHTML, howT, howRows, mont, bandOff = 0) {
  return `<div class="page">${bunting(16, bandOff)}
    <div class="jp">
      <div class="jtt">${tt}</div><div class="jsub">${esc(sub)}</div>
      <div class="center">${centerHTML}</div>
      ${how(howT, howRows, mont)}
    </div>
    ${sunCorners()}${bunting(16, bandOff + 2, true)}
    <div class="brand">Kit Festa Junina · Jogos pra Imprimir</div>
  </div>`;
}

// 1) ACERTE O ALVO
const ringsCfg = [[118, V.red, '10'], [96, V.most, '20'], [74, '#4e8a3e', '30'], [52, '#2d6fae', '40'], [30, V.tinta, '50']];
const alvo = ringsCfg.map(([d, c, p], i) => `<div class="ring" style="width:${d}mm;height:${d}mm;background:${c};z-index:${i}"><b>${p}</b></div>`).join('');
const pAlvo = page('ACERTE O ALVO', 'Mire no centro e some os pontos!',
  `<div class="alvo">${alvo}</div>`,
  'Como jogar', ['Faça <b>bolinhas de papel</b> ou use saquinhos de feijão (3 por rodada).', 'Cada um joga de uma <b>linha marcada no chão</b> (uns 2 passos).', 'Some os pontos onde a bolinha cair. <b>Quem fizer mais pontos, ganha!</b>'],
  'Imprima e cole numa cartolina ou papelão. Pendure na parede ou apoie numa cadeira.', 0);

// 2) ACERTE O MILHO
const pMilho = page('ACERTE O MILHO', 'Acerte as bocas do milho e marque pontos!',
  `<div class="milho-wrap">${motImg('milho', '', 'height:120mm;filter:drop-shadow(0 6px 10px rgba(0,0,0,.25))')}
     <div class="ptbubble" style="top:10mm;left:-6mm;background:${V.verde}"><b>10</b><small>pontos</small></div>
     <div class="ptbubble" style="top:48mm;right:-8mm;background:${V.most}"><b>20</b><small>pontos</small></div>
     <div class="ptbubble" style="bottom:8mm;left:-4mm;background:${V.red}"><b>30</b><small>pontos</small></div>
   </div>`,
  'Como jogar', ['Recorte os <b>3 alvos de pontos</b> e cole sobre o milho (ou jogue mirando neles).', 'Com bolinhas de papel, <b>acerte cada alvo</b> de longe.', 'Quem somar <b>mais pontos em 3 jogadas</b> vence.'],
  'Imprima, cole numa cartolina e apoie em pé. Dá pra furar as bocas e jogar a bolinha por dentro.', 1);

// 3) MINI CESTA CAIPIRA
const cestaCfg = [['10', 'fácil', V.verde], ['20', 'médio', V.most], ['30', 'difícil', V.red]];
const pCesta = page('MINI CESTA CAIPIRA', 'Encaixe os coponhos e acerte a bola na cesta!',
  `${motImg('chapeu-palha', '', 'height:34mm;margin-bottom:1mm;filter:drop-shadow(0 4px 6px rgba(0,0,0,.2))')}
   <div class="cestas" style="gap:11mm">${cestaCfg.map(([p, l, c], i) => `<div class="cesta"><div class="aro" style="border-color:${c};width:46mm;height:26mm"><span class="pt" style="color:${c};font-size:24pt">${p}</span></div><div class="lab" style="font-size:9pt">${l}</div><div style="font-size:8.5pt;font-weight:800;color:${V.marrom}">${['perto','meio','longe'][i]}</div></div>`).join('')}
     </div>
   <div style="font-family:'Bevan';color:${V.red};font-size:15pt;margin-top:1mm">🏀 Arremesse e pontue!</div>
   <div class="cole" style="font-size:9.5pt">📌 Cole um copo de verdade embaixo de cada aro pra virar cestinha!</div>`,
  'Como jogar', ['Cole um <b>copo descartável</b> embaixo de cada aro (a cesta).', 'Cada jogador tem <b>3 bolinhas</b> (de papel amassado).', 'Acerte a bolinha dentro do copo e some os pontos da cesta. <b>Quanto mais longe, mais pontos!</b>'],
  'Imprima, cole numa cartolina firme e prenda na parede. Os copos viram as cestas.', 2);

// 4) TOMBA LATA (derruba a torre)
const latas = ['MILHO', 'QUENTÃO', 'PIPOCA', 'PAÇOCA', 'CANJICA', 'PÉ-DE-MOLEQUE'];
const tiras = `<div class="grid" style="grid-template-columns:1fr 1fr">${latas.map((t, i) => `<div class="tira"><div class="lt" style="--c:${BAND[i % BAND.length]}">${t}</div></div>`).join('')}</div>`;
const pLata = page('TOMBA LATA', 'Monte a torre caipira e derrube tudo!',
  tiras,
  'Como jogar', ['Recorte cada <b>rótulo</b> e enrole em volta de um copo ou latinha.', 'Monte uma <b>torre/pirâmide</b> (3 embaixo, 2 no meio, 1 em cima).', 'De longe, <b>jogue a bolinha e derrube</b>. Quem derrubar mais em 2 jogadas, ganha!'],
  'Imprima, recorte nas linhas pontilhadas e cole o rótulo em copos descartáveis ou latinhas.', 3);

// 5) PESCARIA — placa + peixes (2 páginas)
const pescaPlaca = `<div class="page">${bunting(16, 4)}
  <div class="jp">
    <div class="jtt" style="font-size:38pt">PESCARIA</div>
    <div class="jsub">A barraquinha clássica do arraiá!</div>
    <div class="center">
      <div style="display:flex;align-items:flex-end;gap:6mm;margin:2mm 0">${motImg('balao', '', 'height:46mm')}${motImg('casal-caipira', '', 'height:74mm;filter:drop-shadow(0 5px 8px rgba(0,0,0,.22))')}${motImg('lampiao', '', 'height:46mm')}</div>
      <div style="font-size:42pt;line-height:1;margin-top:-2mm">🎣🐟</div>
      <div style="font-family:'Bevan';color:${V.verde};font-size:20pt;margin-top:1mm">Pesque e ganhe pontos!</div>
      <div style="width:80%;height:5mm;margin-top:2mm;border-radius:3mm;background:repeating-linear-gradient(90deg,#2d6fae 0 8mm,#5fa0d6 8mm 16mm);opacity:.6"></div>
    </div>
    ${how('Como montar a vara', ['Amarre um <b>barbante</b> numa varinha (ou lápis).', 'Na ponta, prenda um <b>clipe de papel</b> aberto em gancho (ou um ímã).', 'Em cada peixe, prenda um <b>clipe</b> — aí o gancho pesca!'], 'Imprima esta placa, cole numa cartolina e pendure na frente da barraca.')}
  </div>
  ${sunCorners()}${bunting(16, 6, true)}
  <div class="brand">Kit Festa Junina · Jogos pra Imprimir</div></div>`;
const peixeCfg = [['1', V.red], ['2', V.most], ['3', V.verde], ['5', '#2d6fae'], ['1', '#d56a1e'], ['2', '#b83c69'], ['3', V.red], ['5', V.most], ['1', V.verde], ['2', '#2d6fae'], ['3', '#d56a1e'], ['5', '#b83c69']];
const peixes = `<div class="peixes">${peixeCfg.map(([n, c]) => `<div style="position:relative;padding:2.5mm"><div class="pdash"></div><div class="peixe" style="--c:${c}"><i></i><b>${n}</b></div></div>`).join('')}</div>`;
const pescaPeixes = page('PEIXINHOS DA PESCARIA', 'Recorte e prenda um clipe na boca de cada peixe',
  peixes,
  'Como jogar', ['Espalhe os peixes <b>virados pra baixo</b> (ou num baldinho com água).', 'Cada um <b>pesca 3 peixes</b> com a vara.', 'Some os <b>números</b> dos peixes pescados. Quem fizer mais pontos, ganha um docinho! 🍬'],
  'Imprima, recorte nas linhas pontilhadas e prenda um clipe de papel na boca de cada peixe.', 5);

// 6) PAINEL PREMIADO
const premios = ['🎁 GANHOU', 'TENTE DE NOVO', '🍬 DOCE', 'GANHOU 🎈', 'TENTE DE NOVO', '🌽 MILHO', 'GANHOU', 'PASSE A VEZ', '🎁 PRÊMIO', 'TENTE DE NOVO', 'GANHOU 🍭', 'DE NOVO', '🎈 BALÃO', 'GANHOU', 'TENTE DE NOVO', '🏆 SUPER'];
const premCards = premios.map((p, i) => { const win = !/TENTE|PASSE|DE NOVO/.test(p); const c = win ? BAND[i % BAND.length] : '#7a6650'; return `<div class="pcard" style="--c:${c}"><div class="e">${win ? '★' : '·'}</div><div class="pt2">${esc(p)}</div></div>`; }).join('');
const pPremiado = page('PAINEL PREMIADO', 'Escolha um número e descubra se ganhou!',
  `<div class="pgrid">${premCards}</div>`,
  'Como jogar', ['Recorte os <b>16 cartões</b> e dobre ao meio (ou cubra com um papelzinho).', 'Misture e cole no painel com a <b>parte de trás pra fora</b> (numere 1 a 16).', 'Cada um <b>escolhe um número</b>, abre e vê o prêmio. <b>Quem tira ★ ganha!</b>'],
  'Imprima, recorte e cole numa cartolina. Dá pra colar balas atrás de cada cartão premiado.', 6);

// 7) BOLICHE JUNINO (bônus)
const pinos = ['🌽', '🎉', '🔥', '🪕', '🎈', '⭐'];
const pinoTiras = `<div class="grid" style="grid-template-columns:1fr 1fr 1fr">${pinos.map((e, i) => `<div class="tira" style="height:42mm"><div class="lt" style="--c:${BAND[i % BAND.length]};flex-direction:column;font-size:22pt">${e}<span style="font-family:'Oswald';font-size:8pt;letter-spacing:1px;margin-top:1mm">PINO ${i + 1}</span></div></div>`).join('')}</div>`;
const pBoliche = page('BOLICHE JUNINO', 'Monte os pinos e derrube tudo numa tacada!',
  pinoTiras,
  'Como jogar', ['Enrole cada <b>rótulo</b> num copo ou garrafa pet (vira um pino).', 'Enfileire os <b>6 pinos</b> e role a bola pra derrubar.', 'Conte <b>quantos caíram</b>. Quem derrubar mais em 2 jogadas, vence o arraiá! 🎳'],
  'Imprima, recorte e cole em copos ou garrafinhas. Quanto mais pesado embaixo, mais firme o pino.', 7);

// 8) JOGO DA ARGOLA (bônus)
const argCfg = [['10', V.verde], ['20', V.most], ['30', V.red], ['50', '#2d6fae']];
const pArgola = page('JOGO DA ARGOLA', 'Acerte a argola no gargalo e marque pontos!',
  `<div style="display:flex;gap:9mm;align-items:flex-end;justify-content:center;flex-wrap:wrap">
     ${argCfg.map(([p, c]) => `<div style="display:flex;flex-direction:column;align-items:center;gap:2mm">
        <div style="width:26mm;height:46mm;background:${c};border-radius:8mm 8mm 4mm 4mm;position:relative;box-shadow:0 4px 7px rgba(0,0,0,.22);display:flex;align-items:center;justify-content:center">
          <div style="position:absolute;top:-7mm;width:9mm;height:9mm;background:${c};border-radius:3mm"></div>
          <span style="font-family:'Bevan';color:#fff;font-size:20pt;text-shadow:0 1px 2px rgba(0,0,0,.4)">${p}</span>
        </div>
        <div style="font-family:'Oswald';font-weight:700;font-size:8pt;color:${V.marrom};text-transform:uppercase;letter-spacing:1px">${p} pts</div>
     </div>`).join('')}
   </div><div class="cole">🪢 Faça argolas com papelão, fita ou tampinhas presas em barbante.</div>`,
  'Como jogar', ['Coloque as <b>garrafas marcadas</b> em pé, lado a lado.', 'De uma linha, <b>jogue 3 argolas</b> tentando encaixar no gargalo.', 'Some os <b>pontos</b> das garrafas que você acertar. Mais pontos = vencedor!'],
  'Imprima, recorte e cole cada marca numa garrafa pet. A argola pode ser de papelão ou tampinha + barbante.', 8);

const pages = [pAlvo, pMilho, pCesta, pLata, pescaPlaca, pescaPeixes, pPremiado, pBoliche, pArgola];
renderPDF(pages, '12_Jogos-Juninos-Para-Imprimir', CSS).then(() => console.log('jogos ok'));
