const puppeteer = require('puppeteer');

const html = `<!DOCTYPE html>
<html><head><meta charset='UTF-8'>
<link href='https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap' rel='stylesheet'>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', sans-serif; background: #fff; width: 794px; height: 1123px; padding: 30px 34px 24px; color: #1a1a2e; display: flex; flex-direction: column; gap: 11px; }
  .header { display: flex; align-items: center; justify-content: space-between; }
  .brand { font-size: 10.5px; font-weight: 700; color: #b0b0b0; letter-spacing: 2px; text-transform: uppercase; }
  .badge-header { background: linear-gradient(135deg,#00b4ae,#008f8a); color: white; font-size: 11px; font-weight: 700; padding: 5px 15px; border-radius: 20px; }
  .titulo-bloco { display: flex; align-items: flex-end; justify-content: space-between; border-bottom: 3px solid #00b4ae; padding-bottom: 11px; }
  .titulo { font-size: 26px; font-weight: 900; }
  .titulo span { color: #00b4ae; }
  .campos-linha { display: flex; gap: 18px; align-items: flex-end; }
  .campo-label-small { font-size: 9.5px; color: #999; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
  .campo-linha { border-bottom: 1.5px solid #ccc; margin-top: 5px; height: 18px; }
  .bncc-strip { background: linear-gradient(135deg,#f0fffe,#e8fffe); border: 1.5px solid #b2e8e6; border-radius: 12px; padding: 11px 16px; }
  .bncc-title { font-size: 9px; font-weight: 800; color: #00b4ae; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 9px; }
  .bncc-tags { display: flex; flex-wrap: wrap; gap: 7px; }
  .bncc-item { display: flex; align-items: flex-start; gap: 6px; }
  .bncc-cod { background: linear-gradient(135deg,#00b4ae,#008f8a); color: white; font-size: 8px; font-weight: 800; padding: 3px 8px; border-radius: 6px; white-space: nowrap; margin-top: 1px; }
  .bncc-desc { font-size: 8.5px; color: #555; line-height: 1.45; max-width: 185px; }
  .grid-wrap { flex: 1; display: flex; flex-direction: column; gap: 5px; min-height: 0; }
  .grid-header { display: grid; grid-template-columns: 108px repeat(5,1fr); gap: 5px; }
  .gh-dia { background: linear-gradient(135deg,#00b4ae,#008f8a); color: white; font-size: 10px; font-weight: 800; text-align: center; padding: 9px 4px; border-radius: 8px; text-transform: uppercase; letter-spacing: 0.8px; }
  .campo-row { display: grid; grid-template-columns: 108px repeat(5,1fr); gap: 5px; flex: 1; min-height: 0; }
  .campo-label-cel { background: #f5f5f7; border: 1.5px solid #e8e8e8; border-radius: 9px; padding: 8px 10px; display: flex; align-items: center; justify-content: center; text-align: center; }
  .campo-label-cel span { font-size: 8.5px; font-weight: 800; color: #666; text-transform: uppercase; letter-spacing: 0.4px; line-height: 1.5; }
  .campo-cell { border: 1.5px solid #e8e8e8; border-radius: 9px; background: #fff; }
  .campo-cell.hl { border-color: #00b4ae; background: linear-gradient(135deg,#f9fffe,#f0fffe); }
  .ct { padding: 7px 9px; font-size: 9px; color: #333; line-height: 1.5; height: 100%; display: flex; flex-direction: column; gap: 3px; }
  .tag { background: #e0f7f6; color: #008f8a; font-size: 7.5px; font-weight: 800; padding: 1px 6px; border-radius: 4px; display: inline-block; width: fit-content; text-transform: uppercase; letter-spacing: 0.3px; }
  .txt { font-size: 8.5px; color: #444; line-height: 1.45; }
  .bottom-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
  .bottom-box { border: 1.5px solid #e8e8e8; border-radius: 11px; padding: 11px 14px; min-height: 82px; }
  .bottom-box.hl { border-color: #00b4ae; background: linear-gradient(135deg,#f9fffe,#f0fffe); }
  .bottom-box .sub { font-size: 8.5px; font-weight: 800; color: #00b4ae; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 7px; }
  .line { border-bottom: 1px solid #eee; height: 1px; margin-top: 9px; }
  .rodape { display: flex; justify-content: space-between; align-items: center; padding-top: 9px; border-top: 1px dashed #ddd; }
  .rodape-texto { font-size: 8.5px; color: #ccc; }
  .rodape-badge { background: linear-gradient(135deg,#00b4ae,#008f8a); color: white; font-size: 8.5px; font-weight: 700; padding: 4px 14px; border-radius: 12px; }
</style>
</head>
<body>
<div class='header'>
  <div class='brand'>Atividades e Dinâmicas</div>
  <div class='badge-header'>🌈 Jardim · 4-5 anos</div>
</div>
<div class='titulo-bloco'>
  <div class='titulo'>Planejamento <span>Semanal</span></div>
  <div class='campos-linha'>
    <div><div class='campo-label-small'>Semana de:</div><div class='campo-linha' style='width:110px'></div></div>
    <div><div class='campo-label-small'>Turma:</div><div class='campo-linha' style='width:80px'></div></div>
    <div><div class='campo-label-small'>Professora:</div><div class='campo-linha' style='width:145px'></div></div>
  </div>
</div>
<div class='bncc-strip'>
  <div class='bncc-title'>Habilidades BNCC — Jardim (4-5 anos)</div>
  <div class='bncc-tags'>
    <div class='bncc-item'><div class='bncc-cod'>EI04EO01</div><div class='bncc-desc'>Demonstrar empatia pelos outros, percebendo diferentes sentimentos e necessidades.</div></div>
    <div class='bncc-item'><div class='bncc-cod'>EI04CG02</div><div class='bncc-desc'>Demonstrar controle e adequação do uso do corpo em brincadeiras e atividades.</div></div>
    <div class='bncc-item'><div class='bncc-cod'>EI04TS03</div><div class='bncc-desc'>Reconhecer qualidades do som: intensidade, duração, altura e timbre.</div></div>
    <div class='bncc-item'><div class='bncc-cod'>EI04EF04</div><div class='bncc-desc'>Recontar histórias ouvidas e planejar coletivamente roteiros de encenações.</div></div>
    <div class='bncc-item'><div class='bncc-cod'>EI04ET05</div><div class='bncc-desc'>Classificar objetos e figuras de acordo com semelhanças e diferenças.</div></div>
  </div>
</div>
<div class='grid-wrap'>
  <div class='grid-header'>
    <div></div>
    <div class='gh-dia'>Segunda</div><div class='gh-dia'>Terça</div><div class='gh-dia'>Quarta</div><div class='gh-dia'>Quinta</div><div class='gh-dia'>Sexta</div>
  </div>
  <div class='campo-row' style='flex:1.1'>
    <div class='campo-label-cel'><span>Campo de Experiência</span></div>
    <div class='campo-cell hl'><div class='ct'><span class='tag'>O eu, o outro e o nós</span><span class='txt'>Identidade e convivência</span></div></div>
    <div class='campo-cell'><div class='ct'><span class='tag'>Corpo, gestos e mov.</span><span class='txt'>Expressão corporal</span></div></div>
    <div class='campo-cell hl'><div class='ct'><span class='tag'>Traços, sons, cores</span><span class='txt'>Linguagem musical</span></div></div>
    <div class='campo-cell'><div class='ct'><span class='tag'>Escuta e narrativas</span><span class='txt'>Contação de histórias</span></div></div>
    <div class='campo-cell hl'><div class='ct'><span class='tag'>Espaços, tempos, qtd.</span><span class='txt'>Classificação e lógica</span></div></div>
  </div>
  <div class='campo-row' style='flex:2.4'>
    <div class='campo-label-cel'><span>Atividade Principal</span></div>
    <div class='campo-cell hl'><div class='ct'><span class='txt'><b>Roda de sentimentos:</b> crianças identificam e expressam emoções com fichas ilustradas. Discussão coletiva sobre empatia.</span></div></div>
    <div class='campo-cell'><div class='ct'><span class='txt'><b>Circuito motor:</b> equilíbrio na linha, pular corda baixa e rolar bola. Trabalha controle corporal.</span></div></div>
    <div class='campo-cell hl'><div class='ct'><span class='txt'><b>Orquestra do corpo:</b> explorar sons com palmas, batidas e voz. Identificar grave/agudo, forte/fraco.</span></div></div>
    <div class='campo-cell'><div class='ct'><span class='txt'><b>Recontar em dupla:</b> após ouvir "Os Três Porquinhos", planejar mini-encenação em grupo.</span></div></div>
    <div class='campo-cell hl'><div class='ct'><span class='txt'><b>Jogo das formas:</b> separar blocos lógicos por cor, tamanho e espessura. Registrar critério usado.</span></div></div>
  </div>
  <div class='campo-row' style='flex:1.3'>
    <div class='campo-label-cel'><span>Recursos / Materiais</span></div>
    <div class='campo-cell hl'><div class='ct'><span class='txt'>Fichas de emoções, espelho, tapete de roda</span></div></div>
    <div class='campo-cell'><div class='ct'><span class='txt'>Corda, bola de borracha, fita no chão</span></div></div>
    <div class='campo-cell hl'><div class='ct'><span class='txt'>Instrumentos simples, caixinha de som, pandeiro</span></div></div>
    <div class='campo-cell'><div class='ct'><span class='txt'>Livro do conto, fantoches, figurino simples</span></div></div>
    <div class='campo-cell hl'><div class='ct'><span class='txt'>Blocos lógicos, fichas de registro, lápis de cor</span></div></div>
  </div>
  <div class='campo-row' style='flex:1.1'>
    <div class='campo-label-cel'><span>Objetivo do Dia</span></div>
    <div class='campo-cell hl'><div class='ct'><span class='txt'>Nomear e respeitar sentimentos próprios e alheios (EI04EO01)</span></div></div>
    <div class='campo-cell'><div class='ct'><span class='txt'>Controlar movimentos com segurança e consciência corporal (EI04CG02)</span></div></div>
    <div class='campo-cell hl'><div class='ct'><span class='txt'>Discriminar características do som no cotidiano (EI04TS03)</span></div></div>
    <div class='campo-cell'><div class='ct'><span class='txt'>Planejar e encenar narrativa coletiva (EI04EF04)</span></div></div>
    <div class='campo-cell hl'><div class='ct'><span class='txt'>Classificar objetos por mais de um critério (EI04ET05)</span></div></div>
  </div>
</div>
<div class='bottom-row'>
  <div class='bottom-box hl'><div class='sub'>Objetivo Geral da Semana</div><div class='line'></div><div class='line'></div><div class='line'></div></div>
  <div class='bottom-box'><div class='sub'>Observações / Ajustes</div><div class='line'></div><div class='line'></div><div class='line'></div></div>
  <div class='bottom-box'><div class='sub'>Avaliação da Semana</div><div class='line'></div><div class='line'></div><div class='line'></div></div>
</div>
<div class='rodape'>
  <div class='rodape-texto'>Atividades e Dinâmicas · Kit Planejamento Semanal BNCC · Jardim (4-5 anos)</div>
  <div class='rodape-badge'>jardim · 2025</div>
</div>
</body></html>`;

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 794, height: 1123 });
  await page.setContent(html, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));
  await page.pdf({
    path: 'C:\\Users\\Rodrigo Cruz\\Downloads\\planejamento-semanal-demo.pdf',
    width: '794px',
    height: '1123px',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  });
  await browser.close();
  console.log('ok');
})();
