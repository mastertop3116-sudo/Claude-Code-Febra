// Gera o CATÁLOGO de imagens (manifesto + galeria) de tudo que a gente criou.
//   node gerar-catalogo.js
const { catalogar, SAIDA } = require('./utils/catalogoImagens');
const path = require('path');
const m = catalogar();
console.log(`>>> Catálogo gerado: ${m.total} imagens`);
for (const [n, q] of Object.entries(m.por_nicho)) console.log(`      ${n}: ${q}`);
console.log(`\nManifesto: ${path.join(SAIDA, 'catalogo-imagens.json')}`);
console.log(`Galeria:   ${path.join(SAIDA, 'index.html')}  (abra no navegador)`);
