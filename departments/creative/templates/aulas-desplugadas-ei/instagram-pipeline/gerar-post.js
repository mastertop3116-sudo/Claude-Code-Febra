// Renderiza posts e carrosséis em PNG via Puppeteer
const puppeteer    = require('puppeteer');
const path         = require('path');
const fs           = require('fs');
const os           = require('os');
const config       = require('./config');
const { getFontStyle } = require('./fonts');
const { gerarFundo } = require('./gerar-bg-ia');

function carregarTemplate(tipo, estilo) {
  const estilos = ['dark', 'color', 'premium'];
  const pasta = estilos.includes(estilo) ? `./templates/${estilo}` : './templates/dark';
  return require(`${pasta}/${tipo}`);
}

function buildHtml(bodyHtml, fontes, bgFilePath = null) {
  const fontStyle = getFontStyle(fontes);

  // Fundo via file:// evita base64 gigante no HTML
  const bgCss = bgFilePath
    ? `body::before { content:''; position:absolute; top:0; left:0; width:1080px; height:1080px; background:url('${bgFilePath}') center/cover; z-index:0; }`
    : '';

  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Noto+Color+Emoji&display=block" rel="stylesheet">
${fontStyle}
<style>
  * { box-sizing:border-box; margin:0; padding:0; font-family:'${fontes[0] || 'Arial'}','Noto Color Emoji',Arial,sans-serif; }
  body { width:1080px; height:1080px; overflow:hidden; position:relative; }
  ${bgCss}
</style>
</head><body>${bodyHtml}</body></html>`;
}

function garantirOutputDir() {
  if (!fs.existsSync(config.posting.outputDir)) {
    fs.mkdirSync(config.posting.outputDir, { recursive: true });
  }
}

async function gerarPost(entrada, bgBase64 = null) {
  const { tipo, estilo = 'dark', fontes = [], conteudo } = entrada;

  const templateFn = carregarTemplate(tipo, estilo);
  if (!templateFn) throw new Error(`Template desconhecido: "${tipo}" / "${estilo}"`);

  // Salva fundo 3D em arquivo temporário (base64 vem pronto do pipeline em paralelo)
  let bgFilePath = null;
  let bgTempFile = null;
  if (bgBase64) {
    try {
      bgTempFile = path.join(os.tmpdir(), `bg-${Date.now()}.png`);
      fs.writeFileSync(bgTempFile, Buffer.from(bgBase64, 'base64'));
      bgFilePath = `file://${bgTempFile.replace(/\\/g, '/')}`;
      console.log('[gerar-post] Fundo 3D cartoon pronto.');
    } catch (e) {
      console.warn(`[gerar-post] Erro ao salvar fundo: ${e.message}`);
    }
  }

  // Passa bgImage=null para o template (fundo via CSS), sem embutir base64
  const html = buildHtml(templateFn({ ...conteudo, bgImage: null }), fontes, bgFilePath);
  garantirOutputDir();

  const timestamp  = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const filename   = `post-${estilo}-${tipo}-${timestamp}.png`;
  const outputPath = path.join(config.posting.outputDir, filename);

  const browser = await puppeteer.launch({ headless: 'new' });
  const page    = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1080 });
  await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await new Promise(r => setTimeout(r, 3000));
  await page.screenshot({ path: outputPath, type: 'png' });
  await browser.close();

  // Limpa arquivo temporário do fundo
  if (bgTempFile && fs.existsSync(bgTempFile)) fs.unlinkSync(bgTempFile);

  console.log(`[gerar-post] ${outputPath}`);
  return outputPath;
}

async function gerarCarrossel(entrada) {
  const { estilo = 'dark', fontes = [], textura = 'grunge', badge, emoji, slides } = entrada;

  const slideFn = carregarTemplate('slide', estilo);
  if (!slideFn) throw new Error(`Template de slide desconhecido para estilo "${estilo}"`);

  garantirOutputDir();

  const total = slides.length;
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const paths = [];

  const browser = await puppeteer.launch({ headless: 'new' });

  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i];
    const bodyHtml = slideFn({ ...slide, total, textura, badge, emoji });
    const html = buildHtml(bodyHtml, fontes);

    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1080 });
    await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await new Promise(r => setTimeout(r, 3000));

    const filename   = `carrossel-${timestamp}-slide${i + 1}.png`;
    const outputPath = path.join(config.posting.outputDir, filename);
    await page.screenshot({ path: outputPath, type: 'png' });
    await page.close();

    console.log(`[gerar-carrossel] slide ${i + 1}/${total}: ${outputPath}`);
    paths.push(outputPath);
  }

  await browser.close();
  return paths;
}

module.exports = { gerarPost, gerarCarrossel };
