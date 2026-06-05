const puppeteer = require('puppeteer');

const html = `<!DOCTYPE html>
<html><head><meta charset='UTF-8'>
<link href='https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap' rel='stylesheet'>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', sans-serif; background: #f8f9fc; width: 960px; padding: 40px 48px; color: #1a1a2e; }

  h1 { font-size: 22px; font-weight: 900; color: #1a1a2e; margin-bottom: 4px; }
  h1 span { color: #00b4ae; }
  .subtitle { font-size: 12px; color: #888; margin-bottom: 36px; font-weight: 500; }

  /* ── SEÇÕES ── */
  .section-label {
    font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px;
    color: #00b4ae; margin-bottom: 10px;
  }

  /* ── FLUXO PRINCIPAL ── */
  .flow { display: flex; align-items: center; gap: 0; margin-bottom: 40px; }

  .step {
    display: flex; flex-direction: column; align-items: center; text-align: center;
    flex: 1;
  }
  .step-circle {
    width: 44px; height: 44px; border-radius: 50%;
    background: linear-gradient(135deg, #00b4ae, #008f8a);
    color: white; font-size: 18px; font-weight: 900;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 10px; box-shadow: 0 4px 12px rgba(0,180,174,0.3);
  }
  .step-box {
    background: white; border: 2px solid #e8e8e8; border-radius: 12px;
    padding: 12px 10px; width: 100%; min-height: 80px;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 4px;
  }
  .step-box.hl { border-color: #00b4ae; background: linear-gradient(135deg, #f0fffe, #e8fffe); }
  .step-title { font-size: 11px; font-weight: 800; color: #1a1a2e; }
  .step-desc { font-size: 9.5px; color: #777; line-height: 1.45; }

  .arrow {
    font-size: 22px; color: #00b4ae; font-weight: 900;
    flex-shrink: 0; padding: 0 6px; margin-bottom: 34px;
  }

  /* ── ESTRUTURA DO PRODUTO ── */
  .product-grid {
    display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px;
    margin-bottom: 40px;
  }
  .campo-card {
    background: white; border: 1.5px solid #e8e8e8; border-radius: 12px;
    padding: 14px 10px; text-align: center;
  }
  .campo-card.hl { border-color: #00b4ae; background: linear-gradient(135deg, #f0fffe, #e8fffe); }
  .campo-icon { font-size: 24px; margin-bottom: 8px; }
  .campo-nome { font-size: 9px; font-weight: 800; color: #1a1a2e; line-height: 1.4; margin-bottom: 8px; }
  .nivel-row { display: flex; flex-direction: column; gap: 4px; }
  .nivel-tag {
    font-size: 7.5px; font-weight: 700; padding: 3px 6px; border-radius: 5px;
    text-align: center;
  }
  .nivel-tag.v1 { background: #ffeaea; color: #c0392b; }
  .nivel-tag.v2 { background: #fff3dc; color: #d68910; }
  .nivel-tag.v3 { background: #e8fff3; color: #1e8449; }
  .campo-count { font-size: 8px; color: #aaa; margin-top: 8px; font-weight: 600; }

  /* ── RESULTADO FINAL ── */
  .resultado-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; margin-bottom: 36px; }
  .resultado-card {
    background: white; border: 1.5px solid #e8e8e8; border-radius: 12px;
    padding: 16px 14px;
  }
  .resultado-card.destaque {
    border-color: #00b4ae;
    background: linear-gradient(135deg, #00b4ae, #008f8a);
    color: white;
  }
  .res-icon { font-size: 28px; margin-bottom: 8px; }
  .res-title { font-size: 12px; font-weight: 800; margin-bottom: 4px; }
  .res-desc { font-size: 9.5px; line-height: 1.5; opacity: 0.85; }
  .resultado-card.destaque .res-title { color: white; }
  .resultado-card.destaque .res-desc { color: rgba(255,255,255,0.85); }

  /* ── RODAPÉ / ROI ── */
  .roi-bar {
    background: linear-gradient(135deg, #1a1a2e, #2d2d4e);
    border-radius: 14px; padding: 18px 24px;
    display: flex; align-items: center; justify-content: space-between;
  }
  .roi-texto { color: white; font-size: 13px; font-weight: 700; }
  .roi-texto span { color: #00e5df; }
  .roi-tag {
    background: linear-gradient(135deg, #00b4ae, #00e5df);
    color: #1a1a2e; font-size: 14px; font-weight: 900;
    padding: 10px 24px; border-radius: 10px;
  }

  .divider { height: 1px; background: #eee; margin: 28px 0; }
</style>
</head>
<body>

<h1>Sistema de <span>Pareceres Descritivos</span></h1>
<div class='subtitle'>Como o produto funciona — do conteúdo ao resultado final</div>

<!-- FLUXO DO USO -->
<div class='section-label'>Como a professora usa</div>
<div class='flow'>
  <div class='step'>
    <div class='step-circle'>1</div>
    <div class='step-box hl'>
      <div class='step-title'>Abre o PDF</div>
      <div class='step-desc'>Produto offline, sem internet, sem assinatura</div>
    </div>
  </div>
  <div class='arrow'>›</div>
  <div class='step'>
    <div class='step-circle'>2</div>
    <div class='step-box'>
      <div class='step-title'>Escolhe o Campo</div>
      <div class='step-desc'>Seleciona o Campo de Experiência do aluno</div>
    </div>
  </div>
  <div class='arrow'>›</div>
  <div class='step'>
    <div class='step-circle'>3</div>
    <div class='step-box'>
      <div class='step-title'>Define o Nível</div>
      <div class='step-desc'>Desenvolvendo · Em desenvolvimento · Consolidado</div>
    </div>
  </div>
  <div class='arrow'>›</div>
  <div class='step'>
    <div class='step-circle'>4</div>
    <div class='step-box'>
      <div class='step-title'>Copia 4-5 Blocos</div>
      <div class='step-desc'>Textos prontos, linguagem BNCC, personalizáveis</div>
    </div>
  </div>
  <div class='arrow'>›</div>
  <div class='step'>
    <div class='step-circle'>5</div>
    <div class='step-box hl'>
      <div class='step-title'>Parecer Pronto ✓</div>
      <div class='step-desc'>Único, coerente e alinhado à BNCC em 10 min</div>
    </div>
  </div>
</div>

<div class='divider'></div>

<!-- ESTRUTURA DO PRODUTO -->
<div class='section-label'>Estrutura interna — 200 blocos organizados</div>
<div class='product-grid'>
  <div class='campo-card hl'>
    <div class='campo-icon'>🤝</div>
    <div class='campo-nome'>O eu, o outro e o nós</div>
    <div class='nivel-row'>
      <div class='nivel-tag v1'>Desenvolvendo</div>
      <div class='nivel-tag v2'>Em desenvolvimento</div>
      <div class='nivel-tag v3'>Consolidado</div>
    </div>
    <div class='campo-count'>~40 blocos</div>
  </div>
  <div class='campo-card'>
    <div class='campo-icon'>🏃</div>
    <div class='campo-nome'>Corpo, gestos e movimentos</div>
    <div class='nivel-row'>
      <div class='nivel-tag v1'>Desenvolvendo</div>
      <div class='nivel-tag v2'>Em desenvolvimento</div>
      <div class='nivel-tag v3'>Consolidado</div>
    </div>
    <div class='campo-count'>~40 blocos</div>
  </div>
  <div class='campo-card'>
    <div class='campo-icon'>🎨</div>
    <div class='campo-nome'>Traços, sons, cores e formas</div>
    <div class='nivel-row'>
      <div class='nivel-tag v1'>Desenvolvendo</div>
      <div class='nivel-tag v2'>Em desenvolvimento</div>
      <div class='nivel-tag v3'>Consolidado</div>
    </div>
    <div class='campo-count'>~40 blocos</div>
  </div>
  <div class='campo-card'>
    <div class='campo-icon'>📖</div>
    <div class='campo-nome'>Escuta, fala, pensamento e imaginação</div>
    <div class='nivel-row'>
      <div class='nivel-tag v1'>Desenvolvendo</div>
      <div class='nivel-tag v2'>Em desenvolvimento</div>
      <div class='nivel-tag v3'>Consolidado</div>
    </div>
    <div class='campo-count'>~40 blocos</div>
  </div>
  <div class='campo-card'>
    <div class='campo-icon'>🔢</div>
    <div class='campo-nome'>Espaços, tempos, quantidades e transformações</div>
    <div class='nivel-row'>
      <div class='nivel-tag v1'>Desenvolvendo</div>
      <div class='nivel-tag v2'>Em desenvolvimento</div>
      <div class='nivel-tag v3'>Consolidado</div>
    </div>
    <div class='campo-count'>~40 blocos</div>
  </div>
</div>

<div class='divider'></div>

<!-- RESULTADO / ENTREGA -->
<div class='section-label'>O que a professora recebe</div>
<div class='resultado-row'>
  <div class='resultado-card'>
    <div class='res-icon'>📄</div>
    <div class='res-title'>200 blocos de texto</div>
    <div class='res-desc'>Organizados por campo, nível e comportamento. Linguagem pedagógica alinhada à BNCC.</div>
  </div>
  <div class='resultado-card'>
    <div class='res-icon'>🗂️</div>
    <div class='res-title'>Índice navegável</div>
    <div class='res-desc'>Encontra o bloco certo em segundos. Sem precisar ler tudo — vai direto ao que precisa.</div>
  </div>
  <div class='resultado-card destaque'>
    <div class='res-icon'>⏱️</div>
    <div class='res-title'>10 min por parecer</div>
    <div class='res-desc'>De 3-4 horas para 10 minutos. 35 alunos × 4 bimestres = 80-140h economizadas por ano.</div>
  </div>
</div>

<!-- ROI BAR -->
<div class='roi-bar'>
  <div class='roi-texto'>Economize <span>80 horas por ano</span> — por apenas <span>R$97</span> uma única vez</div>
  <div class='roi-tag'>ROI: R$1,21/hora economizada</div>
</div>

</body></html>`;

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 960, height: 1200 });
  await page.setContent(html, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));
  const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
  await page.setViewport({ width: 960, height: bodyHeight });
  await page.screenshot({
    path: 'C:\\Users\\Rodrigo Cruz\\Downloads\\fluxograma-parecer.png',
    fullPage: true
  });
  await browser.close();
  console.log('ok');
})();
