const puppeteer = require('puppeteer');
const { PDFDocument } = require('pdf-lib');
const fs = require('fs');

(async () => {
  const pdfBytes = fs.readFileSync('C:\\Users\\Rodrigo Cruz\\Downloads\\carrossel-pareceres.pdf');
  const pdf = await PDFDocument.load(pdfBytes);
  console.log('Páginas:', pdf.getPageCount());

  // Gerar screenshot de cada slide via puppeteer re-renderizando o HTML
  // (mais fácil: só tirar screenshot do PDF via página HTML com embed)
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1080 });

  const slides = require('./gerar-carrossel-parecer.js');
  await browser.close();
})();
