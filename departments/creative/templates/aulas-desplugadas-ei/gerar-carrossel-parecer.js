const puppeteer = require('puppeteer');

const slides = [

// SLIDE 1 — CAPA / GANCHO
`<div style="width:1080px;height:1080px;background:linear-gradient(145deg,#0a2e2d 0%,#00b4ae 100%);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px;position:relative;overflow:hidden;">
  <div style="position:absolute;top:-80px;right:-80px;width:400px;height:400px;border-radius:50%;background:rgba(255,255,255,0.04);"></div>
  <div style="position:absolute;bottom:-60px;left:-60px;width:300px;height:300px;border-radius:50%;background:rgba(255,255,255,0.04);"></div>
  <div style="background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.2);border-radius:30px;padding:10px 24px;font-size:18px;font-weight:700;color:rgba(255,255,255,0.9);letter-spacing:1.5px;text-transform:uppercase;margin-bottom:40px;">Para Professoras de EI</div>
  <div style="font-size:72px;font-weight:900;color:white;text-align:center;line-height:1.1;margin-bottom:32px;">Você gasta até<br><span style="color:#00e5df;">100 horas</span><br>por ano escrevendo<br>pareceres?</div>
  <div style="font-size:26px;color:rgba(255,255,255,0.75);text-align:center;line-height:1.5;max-width:700px;">Existe uma forma de fazer isso em <strong style="color:white;">10 minutos por aluno</strong> — sem perder qualidade.</div>
  <div style="position:absolute;bottom:40px;right:60px;font-size:16px;color:rgba(255,255,255,0.4);font-weight:600;letter-spacing:1px;">1 / 6</div>
</div>`,

// SLIDE 2 — O PROBLEMA
`<div style="width:1080px;height:1080px;background:#fff;display:flex;flex-direction:column;padding:80px;position:relative;">
  <div style="font-size:18px;font-weight:800;color:#00b4ae;text-transform:uppercase;letter-spacing:2px;margin-bottom:24px;">O problema</div>
  <div style="font-size:52px;font-weight:900;color:#1a1a2e;line-height:1.15;margin-bottom:40px;">Fim de bimestre.<br>20 pareceres.<br><span style="color:#e74c3c;">Do zero.</span></div>
  <div style="display:flex;flex-direction:column;gap:18px;flex:1;">
    <div style="display:flex;align-items:center;gap:20px;background:#fff5f5;border:2px solid #fdd;border-radius:16px;padding:22px 28px;">
      <div style="font-size:36px;">😩</div>
      <div style="font-size:22px;color:#c0392b;font-weight:700;line-height:1.4;">Horas escrevendo a mesma coisa com palavras diferentes para cada aluno</div>
    </div>
    <div style="display:flex;align-items:center;gap:20px;background:#fff5f5;border:2px solid #fdd;border-radius:16px;padding:22px 28px;">
      <div style="font-size:36px;">🌙</div>
      <div style="font-size:22px;color:#c0392b;font-weight:700;line-height:1.4;">Virando a noite antes do prazo — fim de semana perdido</div>
    </div>
    <div style="display:flex;align-items:center;gap:20px;background:#fff5f5;border:2px solid #fdd;border-radius:16px;padding:22px 28px;">
      <div style="font-size:36px;">😰</div>
      <div style="font-size:22px;color:#c0392b;font-weight:700;line-height:1.4;">Insegurança: "Será que estou usando a linguagem pedagógica certa?"</div>
    </div>
  </div>
  <div style="position:absolute;bottom:40px;right:60px;font-size:16px;color:#ccc;font-weight:600;letter-spacing:1px;">2 / 6</div>
</div>`,

// SLIDE 3 — A SOLUÇÃO
`<div style="width:1080px;height:1080px;background:linear-gradient(160deg,#f0fffe 0%,#e0f7f6 100%);display:flex;flex-direction:column;padding:80px;position:relative;">
  <div style="font-size:18px;font-weight:800;color:#00b4ae;text-transform:uppercase;letter-spacing:2px;margin-bottom:24px;">A solução</div>
  <div style="font-size:52px;font-weight:900;color:#1a1a2e;line-height:1.15;margin-bottom:12px;">200 blocos de<br>texto prontos.</div>
  <div style="font-size:24px;color:#555;margin-bottom:40px;line-height:1.5;">Você combina, coloca o nome — <strong style="color:#00b4ae;">parecer único em 10 minutos.</strong></div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;flex:1;">
    <div style="background:white;border:2px solid #00b4ae;border-radius:16px;padding:24px;display:flex;flex-direction:column;gap:10px;">
      <div style="font-size:32px;">🤝</div>
      <div style="font-size:19px;font-weight:800;color:#1a1a2e;">O eu, o outro e o nós</div>
      <div style="font-size:16px;color:#777;">Empatia, convivência, identidade</div>
    </div>
    <div style="background:white;border:2px solid #e8e8e8;border-radius:16px;padding:24px;display:flex;flex-direction:column;gap:10px;">
      <div style="font-size:32px;">🏃</div>
      <div style="font-size:19px;font-weight:800;color:#1a1a2e;">Corpo, gestos e movimentos</div>
      <div style="font-size:16px;color:#777;">Coordenação, expressão corporal</div>
    </div>
    <div style="background:white;border:2px solid #e8e8e8;border-radius:16px;padding:24px;display:flex;flex-direction:column;gap:10px;">
      <div style="font-size:32px;">🎨</div>
      <div style="font-size:19px;font-weight:800;color:#1a1a2e;">Traços, sons e cores</div>
      <div style="font-size:16px;color:#777;">Arte, música, expressão criativa</div>
    </div>
    <div style="background:white;border:2px solid #e8e8e8;border-radius:16px;padding:24px;display:flex;flex-direction:column;gap:10px;">
      <div style="font-size:32px;">📖</div>
      <div style="font-size:19px;font-weight:800;color:#1a1a2e;">Escuta, fala e imaginação</div>
      <div style="font-size:16px;color:#777;">Linguagem, narrativa, literatura</div>
    </div>
  </div>
  <div style="position:absolute;bottom:40px;right:60px;font-size:16px;color:#aaa;font-weight:600;letter-spacing:1px;">3 / 6</div>
</div>`,

// SLIDE 4 — COMO FUNCIONA
`<div style="width:1080px;height:1080px;background:#1a1a2e;display:flex;flex-direction:column;padding:80px;position:relative;">
  <div style="font-size:18px;font-weight:800;color:#00e5df;text-transform:uppercase;letter-spacing:2px;margin-bottom:24px;">Como funciona</div>
  <div style="font-size:48px;font-weight:900;color:white;line-height:1.2;margin-bottom:40px;">5 passos.<br><span style="color:#00e5df;">10 minutos.</span><br>Parecer pronto.</div>
  <div style="display:flex;flex-direction:column;gap:14px;flex:1;">
    ${[
      ['Abre o PDF','Offline, sem internet, sem assinatura'],
      ['Escolhe o Campo de Experiência','O campo que mais trabalhou com aquele aluno'],
      ['Define o nível','Desenvolvendo · Em desenvolvimento · Consolidado'],
      ['Seleciona 4-5 blocos','Textos prontos, linguagem BNCC, personalizáveis'],
      ['Coloca o nome e pronto ✓','Parecer único, coerente e profissional'],
    ].map(([t,d],i) => `
    <div style="display:flex;align-items:center;gap:20px;">
      <div style="width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,#00b4ae,#00e5df);color:#1a1a2e;font-size:22px;font-weight:900;display:flex;align-items:center;justify-content:center;flex-shrink:0;">${i+1}</div>
      <div style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:14px 20px;flex:1;">
        <div style="font-size:19px;font-weight:800;color:white;">${t}</div>
        <div style="font-size:15px;color:rgba(255,255,255,0.5);margin-top:3px;">${d}</div>
      </div>
    </div>`).join('')}
  </div>
  <div style="position:absolute;bottom:40px;right:60px;font-size:16px;color:rgba(255,255,255,0.3);font-weight:600;letter-spacing:1px;">4 / 6</div>
</div>`,

// SLIDE 5 — RESULTADO / PROVA
`<div style="width:1080px;height:1080px;background:#fff;display:flex;flex-direction:column;padding:80px;position:relative;">
  <div style="font-size:18px;font-weight:800;color:#00b4ae;text-transform:uppercase;letter-spacing:2px;margin-bottom:24px;">O resultado</div>
  <div style="font-size:52px;font-weight:900;color:#1a1a2e;line-height:1.15;margin-bottom:40px;">O que muda na<br>sua <span style="color:#00b4ae;">rotina</span>?</div>
  <div style="display:flex;gap:20px;margin-bottom:24px;">
    <div style="flex:1;background:#fff5f5;border:2px solid #fdd;border-radius:20px;padding:28px;text-align:center;">
      <div style="font-size:48px;font-weight:900;color:#e74c3c;margin-bottom:8px;">3-4h</div>
      <div style="font-size:18px;font-weight:700;color:#c0392b;">por aluno, antes</div>
      <div style="font-size:15px;color:#aaa;margin-top:6px;">escrevendo do zero</div>
    </div>
    <div style="display:flex;align-items:center;font-size:48px;color:#ccc;">→</div>
    <div style="flex:1;background:#f0fffe;border:2px solid #00b4ae;border-radius:20px;padding:28px;text-align:center;">
      <div style="font-size:48px;font-weight:900;color:#00b4ae;margin-bottom:8px;">10min</div>
      <div style="font-size:18px;font-weight:700;color:#008f8a;">por aluno, depois</div>
      <div style="font-size:15px;color:#aaa;margin-top:6px;">com os blocos prontos</div>
    </div>
  </div>
  <div style="background:linear-gradient(135deg,#1a1a2e,#2d2d4e);border-radius:20px;padding:28px 36px;display:flex;align-items:center;justify-content:space-between;">
    <div>
      <div style="font-size:22px;font-weight:800;color:white;">35 alunos × 4 bimestres</div>
      <div style="font-size:16px;color:rgba(255,255,255,0.6);margin-top:4px;">= até 140 horas economizadas por ano</div>
    </div>
    <div style="background:linear-gradient(135deg,#00b4ae,#00e5df);border-radius:12px;padding:14px 28px;font-size:22px;font-weight:900;color:#1a1a2e;">R$97 / ano</div>
  </div>
  <div style="position:absolute;bottom:40px;right:60px;font-size:16px;color:#ccc;font-weight:600;letter-spacing:1px;">5 / 6</div>
</div>`,

// SLIDE 6 — CTA
`<div style="width:1080px;height:1080px;background:linear-gradient(145deg,#00b4ae 0%,#007a76 100%);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px;position:relative;overflow:hidden;text-align:center;">
  <div style="position:absolute;top:-100px;right:-100px;width:500px;height:500px;border-radius:50%;background:rgba(255,255,255,0.06);"></div>
  <div style="position:absolute;bottom:-80px;left:-80px;width:400px;height:400px;border-radius:50%;background:rgba(255,255,255,0.06);"></div>
  <div style="font-size:22px;font-weight:700;color:rgba(255,255,255,0.8);letter-spacing:1px;margin-bottom:20px;">Atividades e Dinâmicas</div>
  <div style="font-size:64px;font-weight:900;color:white;line-height:1.1;margin-bottom:20px;">Chega de<br>noites viradas<br>por pareceres.</div>
  <div style="font-size:26px;color:rgba(255,255,255,0.85);margin-bottom:48px;line-height:1.5;max-width:700px;">200 blocos descritivos prontos.<br>Linguagem BNCC. 10 minutos por aluno.</div>
  <div style="background:white;border-radius:20px;padding:28px 60px;margin-bottom:24px;">
    <div style="font-size:22px;color:#888;font-weight:600;text-decoration:line-through;margin-bottom:4px;">De R$197</div>
    <div style="font-size:56px;font-weight:900;color:#00b4ae;line-height:1;">R$97</div>
    <div style="font-size:18px;color:#555;margin-top:4px;">pagamento único · acesso vitalício</div>
  </div>
  <div style="font-size:20px;color:rgba(255,255,255,0.7);">👇 Link na bio</div>
  <div style="position:absolute;bottom:40px;right:60px;font-size:16px;color:rgba(255,255,255,0.3);font-weight:600;letter-spacing:1px;">6 / 6</div>
</div>`,

];

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1080 });

  const pdfPages = [];

  for (let i = 0; i < slides.length; i++) {
    const html = `<!DOCTYPE html><html><head><meta charset='UTF-8'>
        <style>* { box-sizing: border-box; margin: 0; padding: 0; font-family: Arial, sans-serif; }</style>
    </head><body style="width:1080px;height:1080px;overflow:hidden;">${slides[i]}</body></html>`;
    await page.setContent(html, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 600));
    const buf = await page.pdf({
      width: '1080px',
      height: '1080px',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 }
    });
    pdfPages.push(buf);
    console.log(`Slide ${i + 1}/6 ok`);
  }

  await browser.close();

  // Merge com PDFLib
  const { PDFDocument } = require('pdf-lib');
  const merged = await PDFDocument.create();
  for (const buf of pdfPages) {
    const doc = await PDFDocument.load(buf);
    const [p] = await merged.copyPages(doc, [0]);
    merged.addPage(p);
  }
  const bytes = await merged.save();
  require('fs').writeFileSync('C:\\Users\\Rodrigo Cruz\\Downloads\\carrossel-pareceres.pdf', bytes);
  console.log('PDF final salvo!');
})();
