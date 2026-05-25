const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const { getTexture } = require('./textures');

const outputDir = 'C:\\Users\\Rodrigo Cruz\\Downloads\\instagram-posts';
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

const conteudo = {
  titulo: '3 formas de manter a atenção das crianças no tatame',
  dica: 'Crianças entre 4 e 8 anos têm janela de atenção de 5 a 10 minutos. Se sua aula não muda o estímulo nesse intervalo, você perde a turma.',
  destaque: 'O que fazer na prática:',
  resposta: '🥋 Troque a atividade a cada 8 minutos\n🎯 Use dinâmicas com nome e regra simples\n🏆 Celebre cada acerto, por menor que seja',
  cta: '💾 Salva esse post e aplica hoje mesmo na sua aula!',
};

function buildHtml(textura) {
  const linhas = conteudo.resposta.split('\n').map(l => l.trim()).filter(Boolean);
  const linhasHtml = linhas.map(l =>
    `<div style="display:flex;align-items:flex-start;gap:14px;margin-bottom:14px;">
      <div style="width:4px;min-height:20px;background:#f97316;border-radius:2px;flex-shrink:0;margin-top:4px;"></div>
      <span style="font-size:20px;color:#e2e8f0;line-height:1.5;">${l}</span>
    </div>`
  ).join('');

  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>* { box-sizing:border-box; margin:0; padding:0; font-family:Arial,Helvetica,sans-serif; } body { width:1080px; height:1080px; overflow:hidden; }</style>
</head><body>
<div style="width:1080px;height:1080px;background:#0a0a0f;position:relative;overflow:hidden;display:flex;flex-direction:column;justify-content:center;padding:80px 88px;">
  ${getTexture(textura)}
  <div style="position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(10,10,15,0.55);z-index:1;pointer-events:none;"></div>
  <div style="position:absolute;top:0;right:0;width:500px;height:350px;background:radial-gradient(ellipse at top right,rgba(249,115,22,0.22) 0%,transparent 70%);z-index:2;pointer-events:none;"></div>
  <div style="position:absolute;top:0;left:0;width:100%;height:4px;background:linear-gradient(90deg,#f97316,#ea580c,transparent);z-index:3;"></div>
  <div style="position:relative;z-index:4;display:flex;flex-direction:column;justify-content:center;">
    <div style="display:inline-flex;align-items:center;gap:10px;border:1.5px solid rgba(249,115,22,0.7);border-radius:4px;padding:8px 18px;margin-bottom:36px;width:fit-content;">
      <span style="font-size:16px;">🥋</span>
      <span style="font-size:12px;font-weight:800;color:#f97316;letter-spacing:3px;text-transform:uppercase;">Dica do Tatame</span>
    </div>
    <div style="font-size:60px;font-weight:900;color:#ffffff;line-height:1.0;letter-spacing:-2px;margin-bottom:28px;text-transform:uppercase;">${conteudo.titulo}</div>
    <div style="width:60px;height:3px;background:#f97316;margin-bottom:28px;"></div>
    <div style="font-size:19px;color:#94a3b8;line-height:1.65;margin-bottom:32px;max-width:820px;">${conteudo.dica}</div>
    <div style="border-left:4px solid #f97316;padding-left:24px;margin-bottom:24px;">
      <div style="font-size:12px;font-weight:800;color:#f97316;letter-spacing:2px;text-transform:uppercase;margin-bottom:16px;">▶ ${conteudo.destaque}</div>
      ${linhasHtml}
    </div>
    <div><span style="font-size:18px;font-weight:700;color:#f97316;">${conteudo.cta}</span></div>
  </div>
  <div style="position:absolute;bottom:40px;right:88px;font-size:12px;font-weight:700;color:rgba(255,255,255,0.2);letter-spacing:2px;text-transform:uppercase;z-index:4;">Dinâmicas · Jiu-Jitsu</div>
</div>
</body></html>`;
}

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });

  for (const textura of ['grunge', 'concrete', 'halftone']) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1080 });
    await page.setContent(buildHtml(textura), { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 800));
    const out = path.join(outputDir, `textura-${textura}.png`);
    await page.screenshot({ path: out, type: 'png' });
    await page.close();
    console.log(`Salvo: ${out}`);
  }

  await browser.close();
})();
