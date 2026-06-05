const puppeteer = require('puppeteer');

const html = `<!DOCTYPE html>
<html><head><meta charset='UTF-8'>
<link href='https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap' rel='stylesheet'>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', sans-serif; background: #fff; width: 794px; height: 1123px; padding: 28px 32px; color: #1a1a2e; display: flex; flex-direction: column; gap: 12px; }

  .header { display: flex; align-items: center; justify-content: space-between; }
  .brand { font-size: 11px; font-weight: 700; color: #aaa; letter-spacing: 1.5px; text-transform: uppercase; }
  .badge { background: #00b4ae; color: white; font-size: 11px; font-weight: 700; padding: 5px 14px; border-radius: 20px; }

  .titulo-bloco { display: flex; align-items: flex-end; justify-content: space-between; border-bottom: 3px solid #00b4ae; padding-bottom: 10px; }
  .titulo { font-size: 24px; font-weight: 900; }
  .titulo span { color: #00b4ae; }
  .semana-row { display: flex; gap: 20px; }
  .campo-s { font-size: 10px; color: #888; font-weight: 600; }
  .campo-s .ln { border-bottom: 1.5px solid #ccc; margin-top: 5px; height: 16px; }

  .bncc-strip { background: #f0fffe; border: 1.5px solid #b2e8e6; border-radius: 10px; padding: 10px 14px; }
  .bncc-title { font-size: 9.5px; font-weight: 800; color: #00b4ae; text-transform: uppercase; letter-spacing: .8px; margin-bottom: 8px; }
  .bncc-tags { display: flex; flex-wrap: wrap; gap: 6px; }
  .bncc-item { display: flex; align-items: flex-start; gap: 5px; }
  .bncc-cod { background: #00b4ae; color: white; font-size: 8.5px; font-weight: 800; padding: 3px 7px; border-radius: 5px; white-space: nowrap; margin-top: 1px; }
  .bncc-desc { font-size: 9px; color: #555; line-height: 1.4; max-width: 195px; }

  .grid-wrap { flex: 1; display: flex; flex-direction: column; gap: 5px; }
  .grid-header { display: grid; grid-template-columns: 104px repeat(5, 1fr); gap: 5px; }
  .gh-vazio { }
  .gh-dia { background: #00b4ae; color: white; font-size: 10px; font-weight: 800; text-align: center; padding: 8px 4px; border-radius: 7px; text-transform: uppercase; letter-spacing: .5px; }

  .campo-row { display: grid; grid-template-columns: 104px repeat(5, 1fr); gap: 5px; flex: 1; }
  .campo-label { background: #f7f7f7; border: 1.5px solid #e8e8e8; border-radius: 8px; padding: 8px 10px; display: flex; align-items: center; justify-content: center; text-align: center; }
  .campo-label span { font-size: 9px; font-weight: 800; color: #555; text-transform: uppercase; letter-spacing: .3px; line-height: 1.4; }
  .campo-cell { border: 1.5px solid #e8e8e8; border-radius: 8px; }
  .campo-cell.hl { border-color: #00b4ae; background: #f9fffe; }

  .bottom-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
  .bottom-box { border: 1.5px solid #e8e8e8; border-radius: 10px; padding: 10px 14px; min-height: 80px; }
  .bottom-box .sub { font-size: 9px; font-weight: 800; color: #00b4ae; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 6px; }

  .rodape { display: flex; justify-content: space-between; align-items: center; padding-top: 8px; border-top: 1px dashed #ddd; }
  .rodape-texto { font-size: 9px; color: #ccc; }
  .rodape-badge { background: #00b4ae; color: white; font-size: 9px; font-weight: 700; padding: 3px 12px; border-radius: 12px; }
</style>
</head>
<body>

<div class='header'>
  <div class='brand'>Atividades e Dinâmicas</div>
  <div class='badge'>🌈 Jardim · 4-5 anos</div>
</div>

<div class='titulo-bloco'>
  <div class='titulo'>Planejamento <span>Semanal</span></div>
  <div class='semana-row'>
    <div class='campo-s'>Semana de:<div class='ln' style='width:110px'></div></div>
    <div class='campo-s'>Turma:<div class='ln' style='width:80px'></div></div>
    <div class='campo-s'>Professora:<div class='ln' style='width:150px'></div></div>
  </div>
</div>

<div class='bncc-strip'>
  <div class='bncc-title'>Habilidades BNCC — Jardim (4-5 anos)</div>
  <div class='bncc-tags'>
    <div class='bncc-item'>
      <div class='bncc-cod'>EI04EO01</div>
      <div class='bncc-desc'>Demonstrar empatia pelos outros, percebendo diferentes sentimentos e necessidades.</div>
    </div>
    <div class='bncc-item'>
      <div class='bncc-cod'>EI04CG02</div>
      <div class='bncc-desc'>Demonstrar controle e adequação do uso do corpo em brincadeiras e atividades.</div>
    </div>
    <div class='bncc-item'>
      <div class='bncc-cod'>EI04TS03</div>
      <div class='bncc-desc'>Reconhecer qualidades do som: intensidade, duração, altura e timbre.</div>
    </div>
    <div class='bncc-item'>
      <div class='bncc-cod'>EI04EF04</div>
      <div class='bncc-desc'>Recontar histórias ouvidas e planejar coletivamente roteiros de encenações.</div>
    </div>
    <div class='bncc-item'>
      <div class='bncc-cod'>EI04ET05</div>
      <div class='bncc-desc'>Classificar objetos e figuras de acordo com semelhanças e diferenças.</div>
    </div>
  </div>
</div>

<div class='grid-wrap'>
  <div class='grid-header'>
    <div class='gh-vazio'></div>
    <div class='gh-dia'>Segunda</div>
    <div class='gh-dia'>Terça</div>
    <div class='gh-dia'>Quarta</div>
    <div class='gh-dia'>Quinta</div>
    <div class='gh-dia'>Sexta</div>
  </div>
  <div class='campo-row' style='flex:1.2'>
    <div class='campo-label'><span>Campo de Experiência</span></div>
    <div class='campo-cell hl'></div>
    <div class='campo-cell'></div>
    <div class='campo-cell hl'></div>
    <div class='campo-cell'></div>
    <div class='campo-cell hl'></div>
  </div>
  <div class='campo-row' style='flex:2.5'>
    <div class='campo-label'><span>Atividade Principal</span></div>
    <div class='campo-cell hl'></div>
    <div class='campo-cell'></div>
    <div class='campo-cell hl'></div>
    <div class='campo-cell'></div>
    <div class='campo-cell hl'></div>
  </div>
  <div class='campo-row' style='flex:1.5'>
    <div class='campo-label'><span>Recursos / Materiais</span></div>
    <div class='campo-cell hl'></div>
    <div class='campo-cell'></div>
    <div class='campo-cell hl'></div>
    <div class='campo-cell'></div>
    <div class='campo-cell hl'></div>
  </div>
  <div class='campo-row' style='flex:1.2'>
    <div class='campo-label'><span>Objetivo do Dia</span></div>
    <div class='campo-cell hl'></div>
    <div class='campo-cell'></div>
    <div class='campo-cell hl'></div>
    <div class='campo-cell'></div>
    <div class='campo-cell hl'></div>
  </div>
</div>

<div class='bottom-row'>
  <div class='bottom-box'><div class='sub'>Objetivo Geral da Semana</div></div>
  <div class='bottom-box'><div class='sub'>Observações / Ajustes</div></div>
  <div class='bottom-box'><div class='sub'>Avaliação da Semana</div></div>
</div>

<div class='rodape'>
  <div class='rodape-texto'>Atividades e Dinâmicas · Kit Planejamento Semanal BNCC</div>
  <div class='rodape-badge'>Jardim</div>
</div>

</body></html>`;

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 794, height: 1123 });
  await page.setContent(html, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: 'planejamento-exemplo.png', fullPage: false });
  await browser.close();
  console.log('ok');
})();
