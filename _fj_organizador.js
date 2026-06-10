const { V, esc, bunting, ribbon, sunCorners, motImg, renderPDF } = require('./_fj_base');

const CSS = `
.ow{position:absolute;inset:9mm 0;padding:5mm 13mm;display:flex;flex-direction:column}
.opanel{flex:1;padding:8mm 10mm;display:flex;flex-direction:column}
.ohd{text-align:center;margin-bottom:4mm}
.ott{font-family:'Bevan';font-size:25pt;line-height:1;margin-top:2mm}
.ocols{display:flex;gap:9mm;flex:1}
.ocol{flex:1}
.grp{font-family:'Oswald';font-weight:700;text-transform:uppercase;letter-spacing:1.5px;font-size:10pt;color:${V.red};margin:3mm 0 1.5mm;border-bottom:2px dashed #cbb08a;padding-bottom:1mm}
.it{display:flex;align-items:center;gap:2.5mm;font-weight:700;color:${V.tinta};font-size:10pt;line-height:1.9}
.box{width:4mm;height:4mm;border:1.8px solid ${V.marrom};border-radius:1mm;flex:0 0 auto}
.line{font-weight:700;color:${V.tinta};font-size:10.5pt;line-height:2.2;border-bottom:2px dashed #cbb08a}
.dish{font-weight:800;color:${V.tinta};font-size:10.5pt;line-height:1.85}
.dish b{color:${V.red}}
.song{font-weight:700;color:${V.tinta};font-size:10.5pt;line-height:1.95}
.song span{color:${V.verde};font-weight:900;margin-right:2mm}
.mtop{position:absolute;top:6mm;right:8mm;height:26mm;opacity:.95}
`;

function page(cor, kicker, titulo, inner, mot) {
  return `<div class="page">${bunting(16, 6)}
    <div class="ow"><div class="opanel panel">
      ${mot ? motImg(mot, 'mtop') : ''}
      <div class="ohd">${ribbon(kicker, cor)}<div class="ott" style="color:${cor}">${esc(titulo)}</div></div>
      ${inner}
    </div></div>
    ${sunCorners()}
    <div class="brand">Kit Festa Junina · Bônus do Organizador</div>
  </div>`;
}
const grp = (t, items) => `<div class="grp">${esc(t)}</div>` + items.map(i => `<div class="it"><span class="box"></span>${esc(i)}</div>`).join('');
const lines = n => Array.from({ length: n }, () => `<div class="line">&nbsp;</div>`).join('');

const checklist = page(V.red, 'Não esqueça nada', 'Checklist do Arraiá',
  `<div class="ocols">
    <div class="ocol">
      ${grp('🎏 Decoração', ['Bandeirinhas e varais','Balões e enfeites','Painel de boas-vindas','Plaquinhas de sinalização','Toppers e rótulos','Fogueira (real ou cenográfica)','Iluminação / lampião','Toalha xadrez na mesa'])}
      ${grp('🥘 Comidas', ['Milho cozido','Pipoca','Pamonha / cuscuz','Bolo de milho / fubá','Cachorro-quente','Amendoim e pinhão'])}
      ${grp('🍬 Doces', ['Canjica','Paçoca','Pé-de-moleque','Cocada','Maçã do amor'])}
    </div>
    <div class="ocol">
      ${grp('🥤 Bebidas', ['Quentão','Suco e refrigerante','Água','Café','Chocolate quente'])}
      ${grp('🎲 Brincadeiras', ['Pescaria','Argola','Boliche de latas','Correio elegante','Dança da cadeira','Rabo no burro'])}
      ${grp('🎶 Som & Clima', ['Playlist de forró','Caixa de som','Microfone','Sanfona / viola'])}
      ${grp('🧻 Descartáveis', ['Copos e pratos','Guardanapos','Talheres','Sacos de lixo'])}
    </div>
  </div>`, 'chapeu-palha');

const compras = page('#2d6fae', 'Anote tudo', 'Lista de Compras',
  `<div class="ocols">
    <div class="ocol"><div class="grp">🥘 Comidas</div>${lines(8)}<div class="grp">🍬 Doces</div>${lines(6)}</div>
    <div class="ocol"><div class="grp">🥤 Bebidas</div>${lines(6)}<div class="grp">🧻 Descartáveis & Extras</div>${lines(8)}</div>
  </div>`, 'milho');

const cardapio = page(V.verde, 'Sugestão da casa', 'Cardápio do Arraiá',
  `<div class="ocols">
    <div class="ocol">
      <div class="grp">🥘 Salgados</div>
      <div class="dish"><b>•</b> Milho cozido na manteiga<br><b>•</b> Pamonha e curau<br><b>•</b> Cuscuz nordestino<br><b>•</b> Cachorro-quente caipira<br><b>•</b> Caldo verde e caldo de mandioca<br><b>•</b> Pastel e amendoim torrado</div>
      <div class="grp">🍬 Doces</div>
      <div class="dish"><b>•</b> Canjica cremosa<br><b>•</b> Paçoca e pé-de-moleque<br><b>•</b> Cocada e maçã do amor<br><b>•</b> Bolo de fubá e de milho<br><b>•</b> Arroz doce com canela</div>
    </div>
    <div class="ocol">
      <div class="grp">🥤 Bebidas</div>
      <div class="dish"><b>•</b> Quentão (com ou sem álcool)<br><b>•</b> Suco natural e limonada<br><b>•</b> Refrigerante e água<br><b>•</b> Café passado na hora<br><b>•</b> Chocolate quente<br><b>•</b> Caldo de cana</div>
      <div class="grp">💡 Dica de mestre</div>
      <div class="dish">Calcule cerca de <b>2 a 3 porções</b> de comida e <b>3 a 4 copos</b> de bebida por convidado. Sirva os doces em potes pequenos pra render mais!</div>
    </div>
  </div>`, 'fogueira');

const cronograma = page('#d56a1e', 'Pra não atrasar', 'Cronograma da Festa',
  `<div class="ocols">
    <div class="ocol"><div class="grp">🕐 Horário &nbsp;·&nbsp; O que acontece</div>${lines(9)}</div>
    <div class="ocol"><div class="grp">📝 Sugestão pronta</div>
      <div class="dish"><b>•</b> Abertura e recepção com forró<br><b>•</b> Início das comidas e bebidas<br><b>•</b> Brincadeiras (pescaria, argola...)<br><b>•</b> Apresentação da quadrilha<br><b>•</b> Correio elegante<br><b>•</b> Casamento caipira (de brincadeira)<br><b>•</b> Sorteio de prendas<br><b>•</b> Encerramento ao redor da fogueira</div>
    </div>
  </div>`, 'lampiao');

const playlist = page('#b83c69', 'Pra animar', 'Playlist Junina',
  `<div class="ocols">
    <div class="ocol"><div class="grp">🎵 Clássicos do São João</div>
      <div class="song"><span>♪</span>Olha pro Céu — Luiz Gonzaga<br><span>♪</span>Pula a Fogueira — Xand Avião<br><span>♪</span>Festa no Interior — Sá e Guarabyra<br><span>♪</span>Asa Branca — Luiz Gonzaga<br><span>♪</span>O Xote das Meninas — Gonzaga<br><span>♪</span>Isso Aqui Tá Bom Demais<br><span>♪</span>Cintura Fina — Luiz Gonzaga</div>
    </div>
    <div class="ocol"><div class="grp">🎶 Pra dançar a noite toda</div>
      <div class="song"><span>♪</span>Forró do Xenhenhém<br><span>♪</span>Capoeira do Arnaldo<br><span>♪</span>Sanfoninha Arretada<br><span>♪</span>Eu Só Quero um Xodó<br><span>♪</span>Adeus Maria Fulô<br><span>♪</span>De Volta pro Aconchego</div>
      <div class="grp">🎧 Anote as suas</div>${lines(2)}
    </div>
  </div>`, 'sanfona');

renderPDF([checklist, compras, cardapio, cronograma, playlist], '11_Bonus-Organizador', CSS).then(() => console.log('organizador ok'));
