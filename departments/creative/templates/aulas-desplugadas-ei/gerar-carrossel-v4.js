const puppeteer = require('puppeteer');
const fs = require('fs');

// Paleta & constantes — azul/preto da LP dinamicasjiujitsu.netlify.app
const TEAL    = '#033da2';  // azul primário LP
const TEAL2   = '#0575e6';  // azul médio LP
const DARK    = '#0d0f1a';  // preto/dark
const DARK2   = '#15192c';  // dark com tom azul (LP)
const WHITE   = '#ffffff';
const RED     = '#e74c3c';

const slides = [

// ─── SLIDE 1 ─ GANCHO ──────────────────────────────────────────────────────
`<div style="width:1080px;height:1080px;background:linear-gradient(155deg,${DARK} 0%,${DARK2} 50%,#0a1845 100%);display:flex;flex-direction:column;justify-content:center;padding:96px 88px;position:relative;overflow:hidden;">

  <!-- decoração: arco de fundo -->
  <div style="position:absolute;top:-200px;right:-200px;width:700px;height:700px;border-radius:50%;border:2px solid rgba(5,117,230,0.15);"></div>
  <div style="position:absolute;top:-120px;right:-120px;width:500px;height:500px;border-radius:50%;border:1.5px solid rgba(5,117,230,0.10);"></div>
  <div style="position:absolute;bottom:-160px;left:-160px;width:480px;height:480px;border-radius:50%;border:1.5px solid rgba(5,117,230,0.08);"></div>

  <!-- linha de topo colorida -->
  <div style="position:absolute;top:0;left:0;right:0;height:5px;background:linear-gradient(90deg,${TEAL},${TEAL2});"></div>

  <!-- tag -->
  <div style="display:inline-flex;align-items:center;gap:10px;background:rgba(5,117,230,0.15);border:1px solid rgba(5,117,230,0.40);border-radius:50px;padding:10px 22px;width:fit-content;margin-bottom:52px;">
    <div style="width:8px;height:8px;border-radius:50%;background:${TEAL2};"></div>
    <span style="font-size:16px;font-weight:700;color:${TEAL2};letter-spacing:2.5px;text-transform:uppercase;">Para Professoras de EI</span>
  </div>

  <!-- número hero -->
  <div style="font-size:180px;font-weight:900;line-height:1;color:transparent;background:linear-gradient(135deg,${TEAL},${TEAL2});-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:8px;letter-spacing:-4px;">100h</div>

  <!-- headline -->
  <div style="font-size:42px;font-weight:800;color:${WHITE};line-height:1.25;margin-bottom:32px;">
    É o tempo que você desperdiça<br>todo ano escrevendo pareceres<br><span style="color:rgba(255,255,255,0.5);">que poderiam ser feitos em</span> <span style="color:${TEAL2};">10 minutos.</span>
  </div>

  <!-- subtext -->
  <div style="font-size:20px;color:rgba(255,255,255,0.55);line-height:1.6;max-width:640px;">
    Arraste para descobrir o sistema que mais de <strong style="color:${WHITE};">centenas de professoras</strong> já usam para fechar bimestre sem virar noites.
  </div>

  <!-- contador -->
  <div style="position:absolute;bottom:44px;right:64px;font-size:14px;color:rgba(255,255,255,0.2);font-weight:700;letter-spacing:2px;">01 / 06</div>
</div>`,


// ─── SLIDE 2 ─ PROBLEMA ────────────────────────────────────────────────────
`<div style="width:1080px;height:1080px;background:${WHITE};display:flex;flex-direction:column;padding:80px 88px;position:relative;overflow:hidden;">

  <!-- linha de topo -->
  <div style="position:absolute;top:0;left:0;right:0;height:5px;background:linear-gradient(90deg,${TEAL},${TEAL2});"></div>

  <!-- seção label -->
  <div style="font-size:14px;font-weight:800;color:${TEAL};text-transform:uppercase;letter-spacing:3px;margin-bottom:20px;">O problema</div>

  <!-- headline forte -->
  <div style="font-size:58px;font-weight:900;color:${DARK};line-height:1.1;margin-bottom:48px;">
    Fim de bimestre.<br>20 pareceres.<br><span style="color:${RED};">Do zero. De novo.</span>
  </div>

  <!-- dores -->
  <div style="display:flex;flex-direction:column;gap:18px;flex:1;">

    <div style="display:flex;align-items:flex-start;gap:20px;padding:22px 26px;background:#fef9f9;border-left:4px solid ${RED};border-radius:0 14px 14px 0;">
      <div style="font-size:28px;flex-shrink:0;margin-top:2px;">⏰</div>
      <div>
        <div style="font-size:20px;font-weight:800;color:#c0392b;margin-bottom:4px;">3 a 4 horas por aluno, escrevendo do zero</div>
        <div style="font-size:16px;color:#888;line-height:1.5;">Com 20 ou 30 alunos, isso vira semanas perdidas toda vez</div>
      </div>
    </div>

    <div style="display:flex;align-items:flex-start;gap:20px;padding:22px 26px;background:#fef9f9;border-left:4px solid ${RED};border-radius:0 14px 14px 0;">
      <div style="font-size:28px;flex-shrink:0;margin-top:2px;">🌙</div>
      <div>
        <div style="font-size:20px;font-weight:800;color:#c0392b;margin-bottom:4px;">Fins de semana e noites sacrificados</div>
        <div style="font-size:16px;color:#888;line-height:1.5;">Prazo apertado, cansaço acumulado, qualidade caindo</div>
      </div>
    </div>

    <div style="display:flex;align-items:flex-start;gap:20px;padding:22px 26px;background:#fef9f9;border-left:4px solid ${RED};border-radius:0 14px 14px 0;">
      <div style="font-size:28px;flex-shrink:0;margin-top:2px;">😰</div>
      <div>
        <div style="font-size:20px;font-weight:800;color:#c0392b;margin-bottom:4px;">"Estou usando a linguagem certa da BNCC?"</div>
        <div style="font-size:16px;color:#888;line-height:1.5;">Insegurança mesmo com anos de experiência</div>
      </div>
    </div>

  </div>

  <div style="position:absolute;bottom:44px;right:64px;font-size:14px;color:#ccc;font-weight:700;letter-spacing:2px;">02 / 06</div>
</div>`,


// ─── SLIDE 3 ─ SOLUÇÃO ─────────────────────────────────────────────────────
`<div style="width:1080px;height:1080px;background:linear-gradient(155deg,#eef3ff 0%,#dce8ff 100%);display:flex;flex-direction:column;padding:80px 88px;position:relative;overflow:hidden;">

  <div style="position:absolute;top:0;left:0;right:0;height:5px;background:linear-gradient(90deg,${TEAL},${TEAL2});"></div>

  <!-- decoração geométrica -->
  <div style="position:absolute;bottom:-80px;right:-80px;width:360px;height:360px;border-radius:50%;background:rgba(3,61,162,0.08);"></div>

  <div style="font-size:14px;font-weight:800;color:${TEAL};text-transform:uppercase;letter-spacing:3px;margin-bottom:20px;">A solução</div>

  <div style="font-size:54px;font-weight:900;color:${DARK};line-height:1.1;margin-bottom:14px;">
    200 blocos de texto<br>pedagógico prontos.
  </div>
  <div style="font-size:22px;color:#444;margin-bottom:52px;line-height:1.5;">
    Você combina, personaliza e coloca o nome —<br><strong style="color:${TEAL};">parecer único em 10 minutos, por aluno.</strong>
  </div>

  <!-- grid de campos BNCC -->
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;flex:1;">

    <div style="background:${WHITE};border:1.5px solid ${TEAL};border-radius:18px;padding:26px 28px;display:flex;flex-direction:column;gap:8px;">
      <div style="font-size:28px;">🤝</div>
      <div style="font-size:18px;font-weight:800;color:${DARK};line-height:1.3;">O eu, o outro e o nós</div>
      <div style="font-size:14px;color:#888;">Identidade, empatia, convivência</div>
    </div>

    <div style="background:${WHITE};border:1.5px solid #e0e0e0;border-radius:18px;padding:26px 28px;display:flex;flex-direction:column;gap:8px;">
      <div style="font-size:28px;">🏃</div>
      <div style="font-size:18px;font-weight:800;color:${DARK};line-height:1.3;">Corpo, gestos e movimentos</div>
      <div style="font-size:14px;color:#888;">Coordenação, expressão corporal</div>
    </div>

    <div style="background:${WHITE};border:1.5px solid #e0e0e0;border-radius:18px;padding:26px 28px;display:flex;flex-direction:column;gap:8px;">
      <div style="font-size:28px;">🎨</div>
      <div style="font-size:18px;font-weight:800;color:${DARK};line-height:1.3;">Traços, sons e cores</div>
      <div style="font-size:14px;color:#888;">Arte, música, expressão criativa</div>
    </div>

    <div style="background:${WHITE};border:1.5px solid #e0e0e0;border-radius:18px;padding:26px 28px;display:flex;flex-direction:column;gap:8px;">
      <div style="font-size:28px;">📖</div>
      <div style="font-size:18px;font-weight:800;color:${DARK};line-height:1.3;">Escuta, fala e imaginação</div>
      <div style="font-size:14px;color:#888;">Linguagem, narrativa, literatura</div>
    </div>

  </div>

  <div style="position:absolute;bottom:44px;right:64px;font-size:14px;color:#aaa;font-weight:700;letter-spacing:2px;">03 / 06</div>
</div>`,


// ─── SLIDE 4 ─ COMO FUNCIONA ───────────────────────────────────────────────
`<div style="width:1080px;height:1080px;background:linear-gradient(155deg,${DARK} 0%,#0d1535 60%,#0a1845 100%);display:flex;flex-direction:column;padding:80px 88px;position:relative;overflow:hidden;">

  <div style="position:absolute;top:0;left:0;right:0;height:5px;background:linear-gradient(90deg,${TEAL},${TEAL2});"></div>

  <!-- decoração -->
  <div style="position:absolute;top:-120px;right:-120px;width:420px;height:420px;border-radius:50%;border:1.5px solid rgba(5,117,230,0.15);"></div>

  <div style="font-size:14px;font-weight:800;color:${TEAL};text-transform:uppercase;letter-spacing:3px;margin-bottom:20px;">Como funciona</div>

  <div style="font-size:52px;font-weight:900;color:${WHITE};line-height:1.15;margin-bottom:52px;">
    5 passos.<br><span style="color:${TEAL2};">10 minutos.</span><br>Parecer pronto.
  </div>

  <div style="display:flex;flex-direction:column;gap:16px;flex:1;">
  ${[
    ['Abre o PDF no celular ou computador', 'Offline, sem internet, sem assinatura mensal'],
    ['Escolhe o Campo de Experiência', 'O que mais trabalhou com aquele aluno naquele bimestre'],
    ['Define o nível de desenvolvimento', 'Iniciando · Em processo · Consolidado'],
    ['Seleciona 4 ou 5 blocos descritivos', 'Linguagem BNCC, personalizáveis com um clique'],
    ['Insere o nome do aluno e salva ✓', 'Parecer único, coerente, profissional'],
  ].map(([title, desc], i) => `
  <div style="display:flex;align-items:center;gap:20px;">
    <div style="width:46px;height:46px;border-radius:14px;background:linear-gradient(135deg,${TEAL},${TEAL2});color:${DARK};font-size:20px;font-weight:900;display:flex;align-items:center;justify-content:center;flex-shrink:0;">${i+1}</div>
    <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.09);border-radius:14px;padding:14px 22px;flex:1;">
      <div style="font-size:18px;font-weight:800;color:${WHITE};line-height:1.2;">${title}</div>
      <div style="font-size:13px;color:rgba(255,255,255,0.45);margin-top:3px;">${desc}</div>
    </div>
  </div>`).join('')}
  </div>

  <div style="position:absolute;bottom:44px;right:64px;font-size:14px;color:rgba(255,255,255,0.2);font-weight:700;letter-spacing:2px;">04 / 06</div>
</div>`,


// ─── SLIDE 5 ─ RESULTADO ───────────────────────────────────────────────────
`<div style="width:1080px;height:1080px;background:${WHITE};display:flex;flex-direction:column;padding:80px 88px;position:relative;overflow:hidden;">

  <div style="position:absolute;top:0;left:0;right:0;height:5px;background:linear-gradient(90deg,${TEAL},${TEAL2});"></div>

  <div style="font-size:14px;font-weight:800;color:${TEAL};text-transform:uppercase;letter-spacing:3px;margin-bottom:20px;">O resultado em números</div>

  <div style="font-size:52px;font-weight:900;color:${DARK};line-height:1.1;margin-bottom:44px;">
    O que muda na<br>sua <span style="color:${TEAL};">rotina real?</span>
  </div>

  <!-- before/after visual -->
  <div style="display:flex;align-items:center;gap:20px;margin-bottom:28px;">
    <div style="flex:1;background:#fef4f4;border:2px solid #fcc;border-radius:20px;padding:28px;text-align:center;">
      <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#c0392b;margin-bottom:8px;">Antes</div>
      <div style="font-size:64px;font-weight:900;color:${RED};line-height:1;margin-bottom:6px;">3-4h</div>
      <div style="font-size:16px;color:#c0392b;font-weight:600;">por aluno</div>
      <div style="font-size:14px;color:#bbb;margin-top:6px;">escrevendo do zero, sob pressão</div>
    </div>

    <div style="display:flex;flex-direction:column;align-items:center;gap:8px;flex-shrink:0;">
      <div style="font-size:36px;color:#ccc;">→</div>
    </div>

    <div style="flex:1;background:#eef3ff;border:2px solid ${TEAL};border-radius:20px;padding:28px;text-align:center;">
      <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:${TEAL};margin-bottom:8px;">Depois</div>
      <div style="font-size:64px;font-weight:900;color:${TEAL};line-height:1;margin-bottom:6px;">10min</div>
      <div style="font-size:16px;color:#0343a8;font-weight:600;">por aluno</div>
      <div style="font-size:14px;color:#bbb;margin-top:6px;">combinando blocos prontos</div>
    </div>
  </div>

  <!-- ROI box -->
  <div style="background:linear-gradient(135deg,${DARK},${DARK2});border-radius:20px;padding:28px 36px;display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">
    <div>
      <div style="font-size:24px;font-weight:900;color:${WHITE};margin-bottom:4px;">35 alunos × 4 bimestres</div>
      <div style="font-size:15px;color:rgba(255,255,255,0.55);">= até 140 horas economizadas por ano letivo</div>
    </div>
    <div style="background:linear-gradient(135deg,${TEAL},${TEAL2});border-radius:14px;padding:14px 28px;flex-shrink:0;">
      <div style="font-size:13px;font-weight:700;color:rgba(255,255,255,0.7);text-align:center;">por apenas</div>
      <div style="font-size:28px;font-weight:900;color:${WHITE};line-height:1;">R$27</div>
    </div>
  </div>

  <!-- custo por hora -->
  <div style="background:#f9f9f9;border-radius:14px;padding:16px 24px;display:flex;align-items:center;gap:14px;">
    <div style="font-size:24px;">🧮</div>
    <div style="font-size:17px;color:#555;line-height:1.4;">
      Isso equivale a <strong style="color:${DARK};">menos de R$0,20 por hora recuperada.</strong><br>
      <span style="color:#888;">Menos do que um cafezinho — por hora de vida de volta.</span>
    </div>
  </div>

  <div style="position:absolute;bottom:44px;right:64px;font-size:14px;color:#ccc;font-weight:700;letter-spacing:2px;">05 / 06</div>
</div>`,


// ─── SLIDE 6 ─ CTA ─────────────────────────────────────────────────────────
`<div style="width:1080px;height:1080px;background:linear-gradient(155deg,#021d5e 0%,${TEAL} 55%,${TEAL2} 100%);display:flex;flex-direction:column;justify-content:center;padding:88px 88px;position:relative;overflow:hidden;">

  <div style="position:absolute;top:-160px;right:-160px;width:560px;height:560px;border-radius:50%;background:rgba(255,255,255,0.06);"></div>
  <div style="position:absolute;bottom:-120px;left:-120px;width:440px;height:440px;border-radius:50%;background:rgba(255,255,255,0.05);"></div>
  <div style="position:absolute;top:0;left:0;right:0;height:5px;background:rgba(255,255,255,0.3);"></div>

  <!-- marca -->
  <div style="font-size:15px;font-weight:700;color:rgba(255,255,255,0.7);letter-spacing:2px;text-transform:uppercase;margin-bottom:24px;">Atividades e Dinâmicas</div>

  <!-- headline final -->
  <div style="font-size:66px;font-weight:900;color:${WHITE};line-height:1.05;margin-bottom:24px;">
    Feche o prazo<br>em paz pela<br>primeira vez.
  </div>

  <!-- subheadline -->
  <div style="font-size:22px;color:rgba(255,255,255,0.85);line-height:1.55;margin-bottom:52px;">
    200 blocos descritivos prontos · 5 Campos de Experiência<br>
    Linguagem BNCC · Acesso vitalício · Funciona offline
  </div>

  <!-- price card -->
  <div style="background:${WHITE};border-radius:22px;padding:28px 44px;display:inline-flex;align-items:center;gap:44px;width:fit-content;margin-bottom:28px;">
    <div>
      <div style="font-size:16px;color:#aaa;text-decoration:line-through;font-weight:600;margin-bottom:2px;">De R$147</div>
      <div style="font-size:72px;font-weight:900;color:${TEAL};line-height:1;">R$27</div>
      <div style="font-size:15px;color:#777;margin-top:2px;">pagamento único · acesso vitalício</div>
    </div>
    <div style="width:1px;height:80px;background:#eee;"></div>
    <div style="text-align:center;">
      <div style="font-size:36px;margin-bottom:6px;">📚</div>
      <div style="font-size:15px;font-weight:700;color:#444;line-height:1.4;">200 blocos<br>prontos</div>
    </div>
  </div>

  <!-- CTA arrow -->
  <div style="display:flex;align-items:center;gap:12px;">
    <div style="font-size:22px;">👇</div>
    <div style="font-size:20px;font-weight:800;color:rgba(255,255,255,0.9);">Link na bio para garantir o seu</div>
  </div>

  <div style="position:absolute;bottom:44px;right:64px;font-size:14px;color:rgba(255,255,255,0.25);font-weight:700;letter-spacing:2px;">06 / 06</div>
</div>`,

];

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1080 });

  const pdfPages = [];

  for (let i = 0; i < slides.length; i++) {
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
      <style>* { box-sizing:border-box; margin:0; padding:0; font-family:Arial,Helvetica,sans-serif; }</style>
    </head><body style="width:1080px;height:1080px;overflow:hidden;">${slides[i]}</body></html>`;

    await page.setContent(html, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 500));

    await page.screenshot({ path: `C:\\Users\\Rodrigo Cruz\\Downloads\\v4-slide-${i+1}.png` });

    const buf = await page.pdf({
      width: '1080px', height: '1080px',
      printBackground: true,
      margin: { top:0, right:0, bottom:0, left:0 }
    });
    pdfPages.push(buf);
    console.log(`Slide ${i+1}/6 ok`);
  }

  await browser.close();

  const { PDFDocument } = require('pdf-lib');
  const merged = await PDFDocument.create();
  for (const buf of pdfPages) {
    const doc = await PDFDocument.load(buf);
    const [p] = await merged.copyPages(doc, [0]);
    merged.addPage(p);
  }
  const bytes = await merged.save();
  fs.writeFileSync('C:\\Users\\Rodrigo Cruz\\Downloads\\carrossel-pareceres-v4.pdf', bytes);
  console.log('PDF v4 salvo!');
})();
