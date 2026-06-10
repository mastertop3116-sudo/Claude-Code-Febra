const { V, esc, ribbon, motImg, renderPDF } = require('./_fj_base');

const CSS = `
.bw{position:absolute;inset:8mm 0;display:flex;flex-direction:column;justify-content:space-around;padding:4mm 11mm;gap:6mm}
.card{flex:1;display:flex;flex-direction:column;padding:7mm 9mm;position:relative}
.card .ch{display:flex;align-items:center;gap:6mm;margin-bottom:3mm}
.card .ch img{height:22mm;filter:drop-shadow(0 3px 4px rgba(0,0,0,.2))}
.card .nm{font-family:'Bevan';font-size:21pt;line-height:1}
.card .sec{font-family:'Oswald';font-weight:700;text-transform:uppercase;letter-spacing:1.5px;font-size:9.5pt;color:${V.red};margin:2mm 0 1mm}
.card .mt{font-weight:700;color:${V.marrom};font-size:10pt;line-height:1.4}
.card ol{margin:0 0 0 6mm;color:${V.tinta};font-weight:600;font-size:10pt;line-height:1.45}
.card li{margin-bottom:.6mm}
.cols{display:flex;gap:8mm}.cols>div{flex:1}
`;
function card(cor, nome, mot, materiais, passos) {
  return `<div class="card panel">
    <div class="ch">${motImg(mot)}<div><div class="nm" style="color:${cor}">${esc(nome)}</div></div></div>
    <div class="cols">
      <div><div class="sec">🎒 O que precisa</div><div class="mt">${esc(materiais)}</div></div>
      <div><div class="sec">🎯 Como brincar</div><ol>${passos.map(p => `<li>${esc(p)}</li>`).join('')}</ol></div>
    </div>
  </div>`;
}
function page(a, b) { return `<div class="page"><div class="bw">${a}${b}</div><div class="brand">Kit Festa Junina · Brincadeiras</div></div>`; }

const jogos = [
  card(V.red, 'Pescaria', 'balao', 'Bacia ou caixa, peixinhos de papel com clipe, vara com barbante e ímã.', ['Recorte os peixinhos e prenda um clipe em cada.', 'Espalhe os peixes na "água" (bacia/caixa).', 'Cada um pesca com a varinha de ímã.', 'Ganha quem pescar mais no tempo combinado.']),
  card('#2d6fae', 'Argola na Garrafa', 'fogueira', 'Garrafas pet, argolas de papelão ou de fita.', ['Enfileire as garrafas a uns 2 passos.', 'Cada jogador recebe 3 argolas.', 'Tente encaixar as argolas no gargalo.', 'Cada acerto vale um ponto.']),
  card(V.verde, 'Boliche de Latas', 'milho', 'Latas ou garrafas, uma bolinha.', ['Monte uma pirâmide com as latas.', 'Marque a linha de lançamento.', 'Role a bolinha pra derrubar as latas.', 'Conte quantas caíram = sua pontuação.']),
  card('#d56a1e', 'Corrida do Saco', 'chapeu-palha', 'Sacos de pano ou sacolas grandes.', ['Cada um entra dentro de um saco.', 'Todos na linha de largada.', 'Ao sinal, pule até a linha de chegada.', 'O primeiro a chegar vence!']),
  card('#b83c69', 'Dança da Cadeira', 'sanfona', 'Cadeiras (uma a menos que o número de pessoas) e música.', ['Forme um círculo de cadeiras.', 'Todos dançam ao redor com a música.', 'Quando a música parar, sente!', 'Quem ficar sem cadeira sai. Repita.']),
  card('#7a4ea0', 'Rabo no Burro', 'lampiao', 'Cartaz do burrinho, rabos de papel, fita e uma venda.', ['Pendure o cartaz do burro na parede.', 'Vende os olhos do jogador e gire-o.', 'Ele tenta colar o rabo no lugar certo.', 'Ganha quem chegar mais perto!']),
  card(V.red2, 'Correio Elegante', 'girassois', 'Bilhetes de papel, caixinha e um "carteiro".', ['Cada um escreve um bilhete divertido.', 'Coloca na caixinha do correio.', 'O carteiro sorteia e entrega os bilhetes.', 'Vale recado, elogio e paquera caipira!']),
  card('#2f7d4f', 'Cabo de Guerra', 'casal-caipira', 'Uma corda forte e uma fita no meio.', ['Divida a turma em dois times.', 'Cada time segura uma ponta da corda.', 'Ao sinal, puxem com força!', 'Vence quem puxar a fita pro seu lado.']),
];
const pages = [];
for (let i = 0; i < jogos.length; i += 2) pages.push(page(jogos[i], jogos[i + 1] || ''));

renderPDF(pages, '09_Brincadeiras', CSS).then(() => console.log('brincadeiras ok'));
