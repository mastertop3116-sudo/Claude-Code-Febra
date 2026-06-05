const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const DIR = __dirname;
const ATIVIDADES = JSON.parse(fs.readFileSync(path.join(DIR, 'atividades.json')));
const TEMPLATE = fs.readFileSync(path.join(DIR, 'template.html'), 'utf-8');
const HEAD_ASSETS = TEMPLATE.match(/(<link[^>]+>[\s\S]*?)?<style>[\s\S]*?<\/style>/)[0];

// Import builders from gerar.js by re-running it stripped of main()
const gerarCode = fs.readFileSync(path.join(DIR, 'gerar.js'), 'utf-8')
  .replace(/\/\/ --- MAIN ---[\s\S]*$/, '');
eval(gerarCode.replace(/^const puppeteer.*\n|^const fs.*\n|^const path.*\n|^const DIR.*\n|^const ATIVIDADES.*\n|^const TEMPLATE.*\n|^const OUT_DIR.*\n|^if.*mkdirSync.*\n|\['Maternal'.*forEach[\s\S]*?\}\);/gm, ''));

const OUT = path.join(DIR, 'screenshots');
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT);

async function main() {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 794, height: 1123 });

  for (const at of ATIVIDADES) {
    const icon = ICONS[at.faixa] || '📄';
    const conteudo = buildConteudo(at);
    const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">${HEAD_ASSETS}
    <style>* { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:'Nunito','Noto Color Emoji',sans-serif; width:794px; min-height:1123px; background:#fff; padding:32px 36px; display:flex; flex-direction:column; --cor:${at.cor}; }</style>
    </head><body>
    <div class="header"><div class="header-left"><div class="header-icon">${icon}</div><div class="header-title">${at.titulo}</div></div><div class="header-faixa">${at.faixa} · ${at.idade}</div></div>
    <div class="instrucao-box"><div class="instrucao-icon">👉</div><div class="instrucao-text">${at.instrucao}</div></div>
    <div class="conteudo">${conteudo}</div>
    <div class="footer"><div class="footer-marca">Aulas Desplugadas</div><div>Nome: <span class="nome-linha"></span></div><div class="footer-faixa">${at.faixa}</div></div>
    </body></html>`;

    await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 10000 });
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(OUT, `${at.id}.png`), fullPage: false });
    process.stdout.write(`✅ ${at.id}\n`);
  }

  await browser.close();
  console.log('\nDone! Screenshots em:', OUT);
}

main().catch(e => { console.error(e); process.exit(1); });
