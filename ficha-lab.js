// Laboratório da Ficha de Dinâmica:
//   node ficha-lab.js gen     → gera conteúdo no Claude e salva (conteudo.json + pdf)  [gasta crédito]
//   node ficha-lab.js render  → SÓ re-renderiza o PDF a partir do conteudo salvo       [DE GRAÇA]
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const eng = require('./departments/creative/engines/criador_engine');

const OUT = path.join(__dirname, 'audit-pdfs');
fs.mkdirSync(OUT, { recursive: true });
const JSON_PATH = path.join(OUT, 'ficha_conteudo.json');
const PDF_PATH  = path.join(OUT, 'ficha_dinamica.pdf');

const params = {
  tipo: 'ficha_dinamica',
  nicho: 'jiu-jitsu infantil para professores e donos de academia',
  publico: 'professores de jiu-jitsu que dão aula para crianças de 4 a 12 anos',
  tema: 'dinâmica lúdica que ensina base e guarda de forma divertida',
  autor: 'Mestre Bruno',
  tom: 'conversacional',
  extensao: 'medio',
};

(async () => {
  const modo = process.argv[2] || 'render';
  const faixaArg = process.argv[3] || null;
  if (faixaArg) params.faixa = faixaArg;
  const PDF_OUT = faixaArg ? path.join(OUT, `ficha_${faixaArg}.pdf`) : PDF_PATH;
  let conteudo;
  if (modo === 'gen') {
    console.log('>>> gerando conteúdo no Claude...');
    conteudo = await eng.gerarConteudo(params);
    fs.writeFileSync(JSON_PATH, JSON.stringify(conteudo, null, 2));
    console.log('conteúdo salvo:', conteudo.titulo);
  } else {
    if (!fs.existsSync(JSON_PATH)) { console.log('Sem conteudo salvo. Rode: node ficha-lab.js gen'); process.exit(1); }
    conteudo = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
    console.log('>>> re-renderizando (sem Claude):', conteudo.titulo);
  }
  // mascote agora vem da FAIXA (engine carrega de assets/mascotes/jj-<faixa>-transp.png).
  // Deixa conteudo.ilustracao vazio pra o engine resolver pela faixa.
  const r = await eng.renderizarPDF(conteudo, params);
  fs.writeFileSync(PDF_OUT, r.pdfBuffer);
  console.log('OK pdf:', Math.round(r.pdfBuffer.length / 1024) + 'KB ->', PDF_OUT);
  process.exit(0);
})().catch(e => { console.error('ERRO:', e.message); process.exit(1); });
