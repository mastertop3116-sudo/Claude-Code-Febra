// Script de AUDITORIA: gera entregáveis localmente e salva os PDFs pra leitura.
// Uso: node audit-gen.js ebook guia checklist script_vsl
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { executar } = require('./departments/creative/engines/criador_engine');

const OUT = path.join(__dirname, 'audit-pdfs');
fs.mkdirSync(OUT, { recursive: true });

const base = {
  nicho: 'jiu-jitsu infantil para professores e donos de academia',
  publico: 'professores de jiu-jitsu que dão aula para crianças de 4 a 12 anos e querem reter mais alunos',
  tema: 'como manter as crianças engajadas, disciplinadas e evoluindo nas aulas',
  autor: 'Mestre Bruno',
  tom: 'conversacional',
  extensao: 'medio',
};

const tipos = process.argv.slice(2);
if (!tipos.length) tipos.push('ebook');

(async () => {
  for (const tipo of tipos) {
    const t0 = Date.now();
    try {
      console.log(`>>> gerando ${tipo}...`);
      const r = await executar({ tipo, ...base });
      if (!r || !r.pdf) { console.log(`ERRO ${tipo}: sem pdf no retorno ->`, JSON.stringify(r).slice(0, 200)); continue; }
      const f = path.join(OUT, `${tipo}.pdf`);
      fs.writeFileSync(f, r.pdf);
      console.log(`OK ${tipo} :: "${r.titulo}" :: ${Math.round(r.pdf.length / 1024)}KB :: ${Math.round((Date.now()-t0)/1000)}s :: ${f}`);
    } catch (e) {
      console.log(`ERRO ${tipo}:`, e.message);
    }
  }
  process.exit(0);
})();
