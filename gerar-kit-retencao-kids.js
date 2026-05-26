// ============================================================
// Gerador — Kit Retenção Kids (5 PDFs)
// ============================================================
require("dotenv").config();
const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

const OUT_DIR = path.join(__dirname, "public", "kit-retencao-kids");
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

// ── SVG Ilustrações de Capa ────────────────────────────────
const SVG_WHATSAPP = `<svg width="220" height="220" viewBox="0 0 220 220" xmlns="http://www.w3.org/2000/svg">
  <rect width="220" height="220" rx="20" fill="#1a1a2e"/>
  <rect x="55" y="30" width="110" height="160" rx="12" fill="#0d1117" stroke="#f97316" stroke-width="2"/>
  <rect x="62" y="50" width="96" height="28" rx="8" fill="#25d366" opacity="0.9"/>
  <text x="110" y="69" text-anchor="middle" fill="white" font-size="11" font-family="Arial">Oi, família Silva! 🥋</text>
  <rect x="72" y="88" width="76" height="24" rx="6" fill="#374151"/>
  <text x="110" y="104" text-anchor="middle" fill="#d1d5db" font-size="9" font-family="Arial">O Lucas se saiu bem!</text>
  <rect x="62" y="120" width="86" height="24" rx="6" fill="#25d366" opacity="0.8"/>
  <text x="105" y="136" text-anchor="middle" fill="white" font-size="9" font-family="Arial">Obrigada, sensei! 🙏</text>
  <rect x="72" y="152" width="76" height="20" rx="6" fill="#374151" opacity="0.8"/>
  <text x="110" y="166" text-anchor="middle" fill="#9ca3af" font-size="8" font-family="Arial">Até sábado! 😄</text>
  <circle cx="110" cy="198" r="6" fill="#f97316"/>
</svg>`;

const SVG_CADERNETA = `<svg width="220" height="220" viewBox="0 0 220 220" xmlns="http://www.w3.org/2000/svg">
  <rect width="220" height="220" rx="20" fill="#1a1a2e"/>
  <rect x="40" y="40" width="140" height="160" rx="10" fill="#fffbf5" stroke="#f97316" stroke-width="3"/>
  <rect x="40" y="40" width="20" height="160" rx="5" fill="#f97316"/>
  <line x1="75" y1="75" x2="165" y2="75" stroke="#e5e7eb" stroke-width="2"/>
  <line x1="75" y1="95" x2="165" y2="95" stroke="#e5e7eb" stroke-width="2"/>
  <line x1="75" y1="115" x2="165" y2="115" stroke="#e5e7eb" stroke-width="2"/>
  <line x1="75" y1="135" x2="145" y2="135" stroke="#e5e7eb" stroke-width="2"/>
  <text x="110" y="65" text-anchor="middle" fill="#1a1a2e" font-size="9" font-weight="bold" font-family="Arial">Pequeno Guerreiro</text>
  <rect x="75" y="150" width="25" height="8" rx="3" fill="#f97316" opacity="0.7"/>
  <rect x="105" y="150" width="25" height="8" rx="3" fill="#1a1a2e" opacity="0.5"/>
  <rect x="135" y="150" width="25" height="8" rx="3" fill="#22c55e" opacity="0.6"/>
  <text x="110" y="185" text-anchor="middle" fill="#f97316" font-size="24" font-family="Arial">🥋</text>
</svg>`;

const SVG_PROTOCOLO = `<svg width="220" height="220" viewBox="0 0 220 220" xmlns="http://www.w3.org/2000/svg">
  <rect width="220" height="220" rx="20" fill="#1a1a2e"/>
  <rect x="30" y="40" width="160" height="150" rx="10" fill="#0d1117" stroke="#f97316" stroke-width="2"/>
  <rect x="30" y="40" width="160" height="30" rx="10" fill="#f97316"/>
  <text x="110" y="60" text-anchor="middle" fill="white" font-size="12" font-weight="bold" font-family="Arial">90 DIAS</text>
  <g transform="translate(45,85)">
    ${[0,1,2].map(r => [0,1,2,3,4,5,6].map(c =>
      `<rect x="${c*18}" y="${r*22}" width="14" height="16" rx="3" fill="${r===0&&c<3?'#f97316':r===1&&c<6?'#f97316':r===2&&c<2?'#f97316':'#374151'}" opacity="${r===0&&c<3?'1':r===1&&c<6?'0.8':r===2&&c<2?'0.6':'0.4'}"/>`
    ).join('')).join('')}
  </g>
  <text x="110" y="190" text-anchor="middle" fill="#f97316" font-size="11" font-family="Arial" font-weight="bold">FASE 1 → 2 → 3 → 4</text>
</svg>`;

const SVG_CONQUISTAS = `<svg width="220" height="220" viewBox="0 0 220 220" xmlns="http://www.w3.org/2000/svg">
  <rect width="220" height="220" rx="20" fill="#1a1a2e"/>
  <!-- Trophy -->
  <rect x="90" y="155" width="40" height="15" rx="4" fill="#f97316"/>
  <rect x="80" y="165" width="60" height="8" rx="3" fill="#f97316" opacity="0.8"/>
  <path d="M75,70 L75,140 Q75,155 110,155 Q145,155 145,140 L145,70 Z" fill="#f97316"/>
  <path d="M75,80 Q55,80 55,100 Q55,120 75,125" stroke="#f97316" stroke-width="8" fill="none" stroke-linecap="round"/>
  <path d="M145,80 Q165,80 165,100 Q165,120 145,125" stroke="#f97316" stroke-width="8" fill="none" stroke-linecap="round"/>
  <text x="110" y="125" text-anchor="middle" fill="#1a1a2e" font-size="32" font-family="Arial">★</text>
  <!-- Stars around -->
  <text x="45" y="75" fill="#fde68a" font-size="16" opacity="0.7">★</text>
  <text x="165" y="75" fill="#fde68a" font-size="16" opacity="0.7">★</text>
  <text x="30" y="120" fill="#fde68a" font-size="12" opacity="0.5">✦</text>
  <text x="178" y="120" fill="#fde68a" font-size="12" opacity="0.5">✦</text>
</svg>`;

const SVG_CARTA = `<svg width="220" height="220" viewBox="0 0 220 220" xmlns="http://www.w3.org/2000/svg">
  <rect width="220" height="220" rx="20" fill="#1a1a2e"/>
  <!-- Envelope body -->
  <rect x="30" y="75" width="160" height="110" rx="8" fill="#fffbf5" stroke="#f97316" stroke-width="2"/>
  <!-- Flap open -->
  <path d="M30,75 L110,125 L190,75" fill="#fde68a" stroke="#f97316" stroke-width="2"/>
  <path d="M30,75 L110,40 L190,75" fill="#f97316" opacity="0.9"/>
  <!-- Letter lines inside -->
  <line x1="55" y1="135" x2="165" y2="135" stroke="#e5e7eb" stroke-width="2"/>
  <line x1="55" y1="150" x2="165" y2="150" stroke="#e5e7eb" stroke-width="2"/>
  <line x1="55" y1="165" x2="130" y2="165" stroke="#e5e7eb" stroke-width="2"/>
  <!-- Heart seal -->
  <text x="110" y="60" text-anchor="middle" fill="white" font-size="18" font-family="Arial">🥋</text>
</svg>`;

const SVGS = {
  whatsapp: SVG_WHATSAPP,
  caderneta: SVG_CADERNETA,
  protocolo: SVG_PROTOCOLO,
  conquistas: SVG_CONQUISTAS,
  carta: SVG_CARTA,
};

async function htmlParaPDF(html, nomeArquivo) {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0", timeout: 60000 });
  const buffer = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
  });
  await browser.close();
  const outPath = path.join(OUT_DIR, nomeArquivo);
  fs.writeFileSync(outPath, buffer);
  console.log(`  ✅ Salvo: ${outPath} (${(buffer.length / 1024).toFixed(0)} KB)`);
  return outPath;
}

// ── CSS base compartilhado ─────────────────────────────────
const BASE_CSS = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; background: white; color: #1a1a2e; }
  .page { width: 210mm; min-height: 297mm; position: relative; page-break-after: always; overflow: hidden; }
  .page:last-child { page-break-after: auto; }

  /* Cover */
  .cover { background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #0f0f1a 100%); display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 40px; }
  .cover-badge { background: #f97316; color: white; padding: 6px 20px; border-radius: 20px; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 24px; }
  .cover-title { color: white; font-size: 34px; font-weight: 800; line-height: 1.2; margin-bottom: 12px; }
  .cover-subtitle { color: rgba(255,255,255,0.65); font-size: 15px; line-height: 1.6; max-width: 360px; margin-bottom: 32px; }
  .cover-img { width: 240px; height: 240px; object-fit: cover; border-radius: 16px; border: 3px solid #f97316; margin-bottom: 32px; }
  .cover-img-placeholder { width: 240px; height: 240px; background: linear-gradient(135deg, #f97316, #dc2626); border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 80px; margin-bottom: 32px; }
  .cover-footer { color: rgba(255,255,255,0.4); font-size: 11px; position: absolute; bottom: 30px; }
  .cover-accent { width: 60px; height: 4px; background: #f97316; border-radius: 2px; margin: 0 auto 32px; }

  /* Content pages */
  .content { padding: 50px 45px; }
  .content-header { display: flex; align-items: center; gap: 12px; padding-bottom: 16px; border-bottom: 3px solid #f97316; margin-bottom: 32px; }
  .content-header-icon { font-size: 28px; }
  .content-header-title { font-size: 20px; font-weight: 800; color: #1a1a2e; }
  .content-header-badge { margin-left: auto; background: #f97316; color: white; padding: 4px 12px; border-radius: 12px; font-size: 10px; font-weight: 700; text-transform: uppercase; }
  h2 { font-size: 16px; font-weight: 700; color: #f97316; margin: 24px 0 12px; text-transform: uppercase; letter-spacing: 1px; }
  h3 { font-size: 14px; font-weight: 700; color: #1a1a2e; margin: 16px 0 8px; }
  p { font-size: 12.5px; line-height: 1.7; color: #374151; margin-bottom: 10px; }
  ul, ol { margin: 8px 0 12px 20px; }
  li { font-size: 12.5px; line-height: 1.7; color: #374151; margin-bottom: 4px; }
  .card { background: #f8fafc; border: 1px solid #e5e7eb; border-left: 4px solid #f97316; border-radius: 8px; padding: 14px 16px; margin-bottom: 12px; }
  .card-num { font-size: 10px; font-weight: 700; color: #f97316; text-transform: uppercase; margin-bottom: 4px; }
  .card-text { font-size: 12.5px; line-height: 1.6; color: #374151; }
  .bubble { background: #e8fef0; border: 1px solid #86efac; border-radius: 0 12px 12px 12px; padding: 12px 16px; margin-bottom: 10px; font-size: 12px; color: #166534; line-height: 1.6; }
  .tag { display: inline-block; background: #1a1a2e; color: white; padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: 600; margin-bottom: 8px; }
  .phase-bar { background: linear-gradient(135deg, #1a1a2e, #f97316); color: white; padding: 14px 20px; border-radius: 10px; margin-bottom: 16px; }
  .phase-bar h3 { color: white; margin: 0 0 4px; font-size: 15px; }
  .phase-bar p { color: rgba(255,255,255,0.85); margin: 0; font-size: 12px; }
  .checklist-item { display: flex; align-items: flex-start; gap: 10px; padding: 8px 0; border-bottom: 1px solid #f3f4f6; font-size: 12.5px; color: #374151; }
  .check-box { width: 16px; height: 16px; border: 2px solid #d1d5db; border-radius: 3px; flex-shrink: 0; margin-top: 2px; }
  .mission-card { background: white; border: 2px solid #1a1a2e; border-radius: 12px; padding: 16px; margin-bottom: 12px; position: relative; }
  .mission-level { position: absolute; top: 12px; right: 12px; background: #f97316; color: white; padding: 3px 10px; border-radius: 10px; font-size: 10px; font-weight: 700; }
  .mission-title { font-size: 14px; font-weight: 700; color: #1a1a2e; margin-bottom: 6px; padding-right: 80px; }
  .mission-desc { font-size: 12px; color: #6b7280; }
  .cert-box { border: 3px solid #f97316; border-radius: 12px; padding: 24px; text-align: center; margin: 16px 0; }
  .cert-title { font-size: 22px; font-weight: 800; color: #1a1a2e; margin-bottom: 8px; }
  .cert-body { font-size: 13px; color: #374151; line-height: 1.8; }
  .cert-name { font-size: 20px; font-weight: 700; color: #f97316; border-bottom: 2px solid #f97316; display: inline-block; padding-bottom: 2px; margin: 8px 0; }
  .sig-line { border-top: 1px solid #d1d5db; width: 180px; margin: 24px auto 4px; }
  .letter { background: #fffbf5; border: 1px solid #fde68a; border-radius: 12px; padding: 28px; margin-bottom: 20px; }
  .letter-header { font-size: 13px; color: #92400e; margin-bottom: 16px; font-style: italic; }
  .letter-body { font-size: 13px; color: #374151; line-height: 1.9; }
  .letter-sig { margin-top: 20px; color: #92400e; font-weight: 700; font-size: 13px; }
  .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .footer { text-align: center; color: #9ca3af; font-size: 10px; padding: 16px; border-top: 1px solid #f3f4f6; margin-top: 24px; }
`;

// ═══════════════════════════════════════════════════════════
// PDF 1 — 50 Mensagens de WhatsApp
// ═══════════════════════════════════════════════════════════
async function gerarMensagensWhatsApp() {
  console.log("\n📱 Gerando PDF 1 — 50 Mensagens de WhatsApp...");

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>${BASE_CSS}
  .bloco-title { background: #1a1a2e; color: white; padding: 10px 16px; border-radius: 8px 8px 0 0; font-size: 13px; font-weight: 700; margin-top: 20px; }
  .bloco-body { border: 1px solid #1a1a2e; border-top: none; border-radius: 0 0 8px 8px; padding: 12px; }
  </style></head><body>

  <!-- CAPA -->
  <div class="page cover">
    <div class="cover-badge">Kit Retenção Kids</div>
    <div style="margin-bottom:24px">${SVGS.whatsapp}</div>
    <div class="cover-accent"></div>
    <div class="cover-title">50 Mensagens de<br>WhatsApp para Pais</div>
    <div class="cover-subtitle">Copie, personalize o nome e envie.<br>Rápido, profissional e humano.</div>
    <div class="cover-footer">Kit Retenção Kids • Rodrigo Cruz + Bruno</div>
  </div>

  <!-- COMO USAR -->
  <div class="page content">
    <div class="content-header">
      <div class="content-header-icon">📋</div>
      <div class="content-header-title">Como Usar Este Material</div>
      <div class="content-header-badge">Guia Rápido</div>
    </div>
    <p>Estas 50 mensagens foram criadas para o sensei <strong>copiar e enviar</strong> para os pais dos alunos. Cada mensagem é um ponto de contato que fortalece o vínculo família-academia.</p>
    <h2>Instruções de Uso</h2>
    <div class="card"><div class="card-num">Passo 1</div><div class="card-text">Encontre a situação que se encaixa no momento atual do aluno.</div></div>
    <div class="card"><div class="card-num">Passo 2</div><div class="card-text">Substitua <strong>[Nome da criança]</strong> e <strong>[Nome do pai/mãe]</strong> pelos nomes reais.</div></div>
    <div class="card"><div class="card-num">Passo 3</div><div class="card-text">Personalize se quiser — mas o texto já está pronto pra usar no estado atual.</div></div>
    <div class="card"><div class="card-num">Passo 4</div><div class="card-text">Envie pelo WhatsApp. Um contato semanal já faz diferença enorme.</div></div>
    <h2>Os 8 Blocos</h2>
    <div class="grid2">
      <div class="card"><div class="card-num">Bloco 1</div><div class="card-text">Boas-Vindas (Mensagens 1–5)</div></div>
      <div class="card"><div class="card-num">Bloco 2</div><div class="card-text">Motivação (Mensagens 6–15)</div></div>
      <div class="card"><div class="card-num">Bloco 3</div><div class="card-text">Avisos (Mensagens 16–20)</div></div>
      <div class="card"><div class="card-num">Bloco 4</div><div class="card-text">Conquistas (Mensagens 21–30)</div></div>
      <div class="card"><div class="card-num">Bloco 5</div><div class="card-text">Gestão de Faltas (Msg 31–37)</div></div>
      <div class="card"><div class="card-num">Bloco 6</div><div class="card-text">Datas Especiais (Msg 38–43)</div></div>
      <div class="card"><div class="card-num">Bloco 7</div><div class="card-text">Dicas para Pais (Msg 44–47)</div></div>
      <div class="card"><div class="card-num">Bloco 8</div><div class="card-text">Fidelização (Mensagens 48–50)</div></div>
    </div>
  </div>

  <!-- BLOCO 1 e 2 -->
  <div class="page content">
    <div class="content-header">
      <div class="content-header-icon">👋</div>
      <div class="content-header-title">Blocos 1 e 2 — Boas-Vindas e Motivação</div>
    </div>
    <div class="tag">BLOCO 1 — BOAS-VINDAS (use na 1ª semana)</div>
    <div class="bubble"><strong>#1 — Chegada na academia</strong><br>Olá, [Nome do pai/mãe]! 🥋 Seja bem-vindo(a) à nossa família! O [Nome da criança] começou hoje uma jornada incrível. O Jiu-Jitsu vai desenvolver muito mais do que golpes — vai formar o caráter dele(a). Qualquer dúvida, estou aqui!</div>
    <div class="bubble"><strong>#2 — Após a primeira aula</strong><br>E aí, [Nome do pai/mãe]? Como o [Nome da criança] voltou pra casa? 😄 Primeira aula é sempre especial. Ele(a) foi muito bem! Pode ficar tranquilo(a), vamos caminhar no ritmo dele(a).</div>
    <div class="bubble"><strong>#3 — Explicando a metodologia</strong><br>[Nome do pai/mãe], trabalhamos com 3 pilares: respeito, disciplina e confiança. O Jiu-Jitsu é só o meio. O que sai daqui é um filho(a) mais seguro(a) e centrado(a). 🙏</div>
    <div class="bubble"><strong>#4 — Primeiros dias — tranquilizando</strong><br>Normal a criança chegar cansada e animada ao mesmo tempo nos primeiros dias! 😂 O corpo está se adaptando. É sinal que a aula foi de qualidade. Descansando bem, amanhã ela está 100%!</div>
    <div class="bubble"><strong>#5 — Próximos passos</strong><br>[Nome do pai/mãe], nas próximas semanas o [Nome da criança] vai aprender os fundamentos. Aqui valorizamos o processo. Cada aula é uma vitória! 🏆</div>
    <div class="tag" style="margin-top:16px">BLOCO 2 — MOTIVAÇÃO (use quando quiser)</div>
    <div class="bubble"><strong>#6 — Elogio do dia</strong><br>[Nome do pai/mãe], quero te contar: o [Nome da criança] se destacou muito hoje! A dedicação dele(a) dentro do tatame é muito bonita de ver. Você pode se orgulhar! 💪</div>
    <div class="bubble"><strong>#7 — Evoluindo</strong><br>Ei! O [Nome da criança] está evoluindo muito! Dá pra ver a diferença da primeira aula até agora. Isso é resultado de consistência — e da parceria de vocês em trazê-lo(a) aqui. Valeu demais! 🥋</div>
  </div>

  <!-- BLOCO 2 continuação + 3 -->
  <div class="page content">
    <div class="content-header">
      <div class="content-header-icon">💬</div>
      <div class="content-header-title">Blocos 2 e 3 — Motivação e Avisos</div>
    </div>
    <div class="bubble"><strong>#8 — Comportamento positivo</strong><br>Hoje o [Nome da criança] ajudou um coleguinha com dificuldade no movimento. Sem eu pedir. Isso é Jiu-Jitsu de verdade. Parabéns pra vocês pela criação! 🙏❤️</div>
    <div class="bubble"><strong>#9 — Segunda-feira</strong><br>Boa semana, família [Sobrenome]! O tatame está esperando o [Nome da criança]. Essa semana vai ser incrível — tenho certeza! 💪🥋</div>
    <div class="bubble"><strong>#10 — Motivacional geral</strong><br>Todo grande campeão um dia foi um iniciante que não desistiu. O [Nome da criança] está construindo algo sólido aqui. Bloco por bloco. Aula por aula. 🏆</div>
    <div class="bubble"><strong>#11 — Após aula difícil</strong><br>A aula de hoje foi puxada, mas o [Nome da criança] não largou! Esses momentos difíceis são os que mais formam o caráter. Diga pra ele(a) que o sensei se orgulha muito. 💙</div>
    <div class="bubble"><strong>#12 — Frase de impacto</strong><br>"A faixa muda. O caráter construído no tatame, ninguém tira." 🥋 O [Nome da criança] está nesse caminho. Continue apoiando!</div>
    <div class="bubble"><strong>#13 — Superando desafio</strong><br>Que aula hoje! O [Nome da criança] tentou aquele movimento 10 vezes e na 10ª saiu perfeito. Isso chamamos de garra. Ele(a) tem muito! 🔥</div>
    <div class="bubble"><strong>#14 — Fim de semana</strong><br>Bom fim de semana, família! Aproveitem bastante o [Nome da criança]. Na segunda, recebemos ele(a) com tudo! 😄🥋</div>
    <div class="bubble"><strong>#15 — Reconhecimento da família</strong><br>[Nome do pai/mãe], quero agradecer por confiar o [Nome da criança] pra gente. Manter a rotina, incentivar — isso é família comprometida. 🙏</div>
    <div class="tag" style="margin-top:16px">BLOCO 3 — AVISOS (use com frequência)</div>
    <div class="bubble"><strong>#16 — Lembrete de aula</strong><br>Oi, [Nome do pai/mãe]! Só lembrando: amanhã tem aula às [HORÁRIO]. O [Nome da criança] não pode faltar, né? 😄🥋 Qualquer imprevisto me avisa!</div>
    <div class="bubble"><strong>#17 — Aula especial</strong><br>Aviso importante! Na próxima [DIA], teremos uma aula especial: [TEMA]. Vai ser incrível! Traga o [Nome da criança] com a kimono limpa e boa energia. 🔥</div>
  </div>

  <!-- BLOCO 4 -->
  <div class="page content">
    <div class="content-header">
      <div class="content-header-icon">🏆</div>
      <div class="content-header-title">Bloco 4 — Conquistas e Celebrações</div>
    </div>
    <div class="bubble"><strong>#18 — Cancelamento</strong><br>[Nome do pai/mãe], a aula de [DIA] está cancelada por [MOTIVO]. Reagendamos para [NOVA DATA]. Desculpe o inconveniente! 🙏</div>
    <div class="bubble"><strong>#19 — Evento/torneio</strong><br>Atenção, família [Sobrenome]! No dia [DATA] teremos [NOME DO EVENTO]. Seria ótimo ter o [Nome da criança] presente! Mais detalhes em breve. 🏆</div>
    <div class="bubble"><strong>#20 — Feriado</strong><br>Oi! Lembrando que no dia [DATA] — [FERIADO] — não haverá aula. Aproveitem em família! Na [DIA] retomamos normalmente. 🙏</div>
    <div class="tag" style="margin-top:8px">BLOCO 4 — CONQUISTAS (momentos de ouro!)</div>
    <div class="bubble"><strong>#21 — Nova faixa/grau</strong><br>🎉 PARABÉNS, [Nome da criança]! Hoje você conquistou [FAIXA/GRAU]! Essa conquista é resultado de muito esforço, dedicação e coragem. Família [Sobrenome], vocês têm motivo enorme pra se orgulhar! 🥋❤️</div>
    <div class="bubble"><strong>#22 — Primeiro galão</strong><br>Ei, [Nome do pai/mãe]! O [Nome da criança] ganhou o primeiro galão hoje! Parece pequeno, mas é um marco enorme. Ele(a) está construindo a base de um campeão(ã)! 🔥🏅</div>
    <div class="bubble"><strong>#23 — Primeiro sparring</strong><br>Grande dia hoje! O [Nome da criança] fez o primeiro treino de luta. Ficou nervoso(a) no começo, mas foi de cabeça — e se saiu muito bem! Esse é o Jiu-Jitsu que forma pessoas de verdade. 💪</div>
    <div class="bubble"><strong>#24 — Primeiro torneio</strong><br>[Nome do pai/mãe], participar de um torneio já é uma vitória enorme. O [Nome da criança] mostrou coragem hoje e isso vale qualquer medalha. Parabéns pra toda a família! 🏅🎉</div>
    <div class="bubble"><strong>#25 — 1 mês</strong><br>Um mês de Jiu-Jitsu! 🎉 O [Nome da criança] chegou tímido(a) e hoje já faz os movimentos com naturalidade. Em 1 mês, a evolução é visível. Imagina em 1 ano! 🥋💙</div>
    <div class="bubble"><strong>#26 — 6 meses</strong><br>6 meses de tatame! O [Nome da criança] mostrou consistência e caráter. Que os próximos 6 sejam ainda melhores! 🏆</div>
  </div>

  <!-- BLOCO 5, 6, 7, 8 -->
  <div class="page content">
    <div class="content-header">
      <div class="content-header-icon">📅</div>
      <div class="content-header-title">Blocos 5, 6, 7 e 8</div>
    </div>
    <div class="tag">BLOCO 5 — GESTÃO DE FALTAS (crítico para retenção)</div>
    <div class="bubble"><strong>#27 — 1 falta</strong><br>Oi, [Nome do pai/mãe]! O [Nome da criança] faltou hoje. Está tudo bem? Qualquer coisa, estou à disposição! A gente sente falta dele(a) no tatame. 🥋</div>
    <div class="bubble"><strong>#28 — 2 faltas seguidas</strong><br>[Nome do pai/mãe], o [Nome da criança] está sumido! 😅 Ficamos com saudade. Algum problema? Me conta pra ver se consigo ajudar. Não desista — vocês chegaram longe demais pra parar agora!</div>
    <div class="bubble"><strong>#29 — Retorno após falta</strong><br>QUE SAUDADE! O [Nome da criança] voltou e a turma ficou feliz de verdade! Isso aqui é uma família. Bem-vindo(a) de volta! 🥋❤️</div>
    <div class="bubble"><strong>#30 — Motivação para voltar</strong><br>[Nome do pai/mãe], sei que a vida é corrida. Mas o [Nome da criança] tem um talento real pra isso. Seria uma pena desperdiçar. O tatame está esperando. 💪</div>
    <div class="tag" style="margin-top:8px">BLOCO 6 — DATAS ESPECIAIS</div>
    <div class="bubble"><strong>#31 — Aniversário da criança</strong><br>🎂 Parabéns, [Nome da criança]! Hoje é o seu dia especial. Que você cresça sempre com garra, respeito e muita alegria — dentro e fora do tatame! Abraço do sensei! 🥋🎉</div>
    <div class="bubble"><strong>#32 — Aniversário dos pais</strong><br>[Nome do pai/mãe], hoje é o seu dia! 🎂 Obrigado por confiar o [Nome da criança] pra gente. É uma honra fazer parte da jornada dessa família. Feliz aniversário! 🙏</div>
    <div class="bubble"><strong>#33 — Natal</strong><br>Feliz Natal, família [Sobrenome]! 🎄 Que esse fim de ano seja cheio de paz, saúde e motivos pra sorrir. Nos vemos em [DATA DE RETORNO]! 🥋❤️</div>
    <div class="tag" style="margin-top:8px">BLOCO 7 — DICAS PARA PAIS</div>
    <div class="bubble"><strong>#34 — Como ajudar em casa</strong><br>[Nome do pai/mãe], uma dica simples que faz diferença: pergunte ao [Nome da criança] o que ele(a) aprendeu hoje na aula. Isso reforça o aprendizado e mostra que você valoriza o esforço dele(a). 🧠🥋</div>
    <div class="bubble"><strong>#35 — Importância da regularidade</strong><br>A maior lição do Jiu-Jitsu é: consistência. Uma criança que vem toda semana evolui 3x mais rápido. A rotina é o maior presente que vocês podem dar a ele(a). 🏆</div>
    <div class="tag" style="margin-top:8px">BLOCO 8 — FIDELIZAÇÃO</div>
    <div class="bubble"><strong>#36 — Indicação</strong><br>[Nome do pai/mãe], se você conhece algum amigo com filho(a) que se beneficiaria do Jiu-Jitsu, adoraríamos receber! Crianças que treinam com amigos evoluem ainda mais rápido. 🥋😄</div>
    <div class="bubble"><strong>#37 — Gratidão pelo ano</strong><br>Fim de ano chegando e eu só tenho gratidão! Obrigado, família [Sobrenome], por cada aula, cada treino, cada conquista do [Nome da criança]. 2025 foi especial por causa de vocês. 🙏❤️</div>
    <div class="footer">Kit Retenção Kids • 50 Mensagens de WhatsApp para Pais • Rodrigo Cruz + Bruno</div>
  </div>

  </body></html>`;

  return htmlParaPDF(html, "01-mensagens-whatsapp.pdf");
}

// ═══════════════════════════════════════════════════════════
// PDF 2 — Caderneta do Pequeno Guerreiro
// ═══════════════════════════════════════════════════════════
async function gerarCaderneta() {
  console.log("\n📓 Gerando PDF 2 — Caderneta do Pequeno Guerreiro...");

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>${BASE_CSS}
  .field-line { border-bottom: 2px solid #e5e7eb; padding: 8px 0; margin-bottom: 16px; min-height: 36px; font-size: 14px; }
  .field-label { font-size: 10px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
  .faixa-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 16px 0; }
  .faixa-card { border: 2px solid #e5e7eb; border-radius: 8px; padding: 10px; text-align: center; }
  .faixa-color { width: 40px; height: 10px; border-radius: 4px; margin: 0 auto 6px; }
  .faixa-name { font-size: 10px; font-weight: 700; color: #374151; }
  .faixa-date { font-size: 9px; color: #9ca3af; margin-top: 4px; font-style: italic; }
  .presenca-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; margin: 12px 0; }
  .presenca-cell { width: 28px; height: 28px; border: 2px solid #e5e7eb; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #9ca3af; }
  .momento-box { border: 1px dashed #d1d5db; border-radius: 8px; padding: 16px; margin-bottom: 12px; min-height: 60px; }
  .momento-num { font-size: 10px; font-weight: 700; color: #f97316; margin-bottom: 8px; }
  .capa-kinder { background: linear-gradient(135deg, #1a1a2e, #2d3748); }
  </style></head><body>

  <!-- CAPA -->
  <div class="page cover capa-kinder">
    <div class="cover-badge">Kit Retenção Kids</div>
    <div style="margin-bottom:24px">${SVGS.caderneta}</div>
    <div class="cover-accent"></div>
    <div class="cover-title">Caderneta do<br>Pequeno Guerreiro</div>
    <div class="cover-subtitle">Minha jornada no Jiu-Jitsu</div>
    <div class="cover-footer">Kit Retenção Kids • Rodrigo Cruz + Bruno</div>
  </div>

  <!-- PÁG 1 — Meu Perfil -->
  <div class="page content">
    <div class="content-header">
      <div class="content-header-icon">🥋</div>
      <div class="content-header-title">Meu Perfil de Guerreiro</div>
    </div>
    <div class="field-label">Meu nome completo</div>
    <div class="field-line"></div>
    <div class="field-label">Apelidado pelo sensei de</div>
    <div class="field-line"></div>
    <div class="grid2">
      <div><div class="field-label">Data de nascimento</div><div class="field-line"></div></div>
      <div><div class="field-label">Cidade</div><div class="field-line"></div></div>
    </div>
    <div class="field-label">Nome da academia</div>
    <div class="field-line"></div>
    <div class="field-label">Nome do sensei</div>
    <div class="field-line"></div>
    <div class="grid2">
      <div><div class="field-label">Data de início no Jiu-Jitsu</div><div class="field-line"></div></div>
      <div><div class="field-label">Faixa atual</div><div class="field-line"></div></div>
    </div>
    <h2>Minha Frase de Guerreiro</h2>
    <div class="momento-box" style="min-height:80px"></div>
    <h2>O que me fez começar o Jiu-Jitsu?</h2>
    <div class="momento-box" style="min-height:80px"></div>
  </div>

  <!-- PÁG 2 — Jornada das Faixas -->
  <div class="page content">
    <div class="content-header">
      <div class="content-header-icon">🏅</div>
      <div class="content-header-title">Minha Jornada das Faixas</div>
    </div>
    <p>Registre cada faixa conquistada! Coloque a data e como você se sentiu nesse dia especial.</p>
    <div class="faixa-grid">
      <div class="faixa-card"><div class="faixa-color" style="background:#f9f9f9;border:2px solid #ccc"></div><div class="faixa-name">Branca</div><div class="faixa-date">Data: ____/____/____</div></div>
      <div class="faixa-card"><div class="faixa-color" style="background:#e2e8f0;border:2px solid #94a3b8"></div><div class="faixa-name">Cinza</div><div class="faixa-date">Data: ____/____/____</div></div>
      <div class="faixa-card"><div class="faixa-color" style="background:#fef08a;border:2px solid #eab308"></div><div class="faixa-name">Amarela</div><div class="faixa-date">Data: ____/____/____</div></div>
      <div class="faixa-card"><div class="faixa-color" style="background:#bbf7d0;border:2px solid #22c55e"></div><div class="faixa-name">Verde</div><div class="faixa-date">Data: ____/____/____</div></div>
      <div class="faixa-card"><div class="faixa-color" style="background:#bfdbfe;border:2px solid #3b82f6"></div><div class="faixa-name">Azul</div><div class="faixa-date">Data: ____/____/____</div></div>
      <div class="faixa-card"><div class="faixa-color" style="background:#e9d5ff;border:2px solid #a855f7"></div><div class="faixa-name">Roxa</div><div class="faixa-date">Data: ____/____/____</div></div>
      <div class="faixa-card"><div class="faixa-color" style="background:#fed7aa;border:2px solid #f97316"></div><div class="faixa-name">Laranja</div><div class="faixa-date">Data: ____/____/____</div></div>
      <div class="faixa-card"><div class="faixa-color" style="background:#1a1a2e"></div><div class="faixa-name">Preta 🏆</div><div class="faixa-date">Data: ____/____/____</div></div>
    </div>
    <h2>O Dia da Minha Faixa Favorita</h2>
    <div class="field-label">Qual faixa foi mais especial e por quê?</div>
    <div class="momento-box" style="min-height:100px"></div>
  </div>

  <!-- PÁG 3 — Golpes Favoritos -->
  <div class="page content">
    <div class="content-header">
      <div class="content-header-icon">⚡</div>
      <div class="content-header-title">Meus Golpes Favoritos</div>
    </div>
    <p>À medida que você aprender novos golpes, registre aqui os seus preferidos!</p>
    ${Array(8).fill(0).map((_, i) => `
    <div class="card" style="margin-bottom:10px">
      <div class="card-num">Golpe #${i+1}</div>
      <div class="field-label" style="margin-top:6px">Nome do golpe</div>
      <div class="field-line" style="margin-bottom:8px"></div>
      <div class="field-label">Por que eu amo esse golpe?</div>
      <div class="field-line"></div>
    </div>`).join("")}
  </div>

  <!-- PÁG 4 — Presenças -->
  <div class="page content">
    <div class="content-header">
      <div class="content-header-icon">📅</div>
      <div class="content-header-title">Minhas Presenças</div>
    </div>
    <p>A cada aula que você vier, coloque um ✅ ou uma marca no quadradinho. Vamos ver quantas aulas você vai acumular!</p>
    ${["Mês 1", "Mês 2", "Mês 3"].map(mes => `
    <h3>${mes}</h3>
    <div class="presenca-grid">
      ${Array(28).fill(0).map(() => `<div class="presenca-cell"></div>`).join("")}
    </div>`).join("")}
    <h2>Minha Meta de Presenças</h2>
    <div class="field-label">Eu quero vir _______ vezes por semana porque</div>
    <div class="momento-box" style="min-height:60px"></div>
  </div>

  <!-- PÁG 5 — Momentos Inesquecíveis -->
  <div class="page content">
    <div class="content-header">
      <div class="content-header-icon">⭐</div>
      <div class="content-header-title">Momentos Inesquecíveis</div>
    </div>
    <p>Esses são os momentos que você vai querer lembrar para sempre. Escreva, desenhe, cole uma foto!</p>
    <div class="momento-box" style="min-height:100px"><div class="momento-num">MOMENTO #1 — Primeiro dia de aula</div></div>
    <div class="momento-box" style="min-height:100px"><div class="momento-num">MOMENTO #2 — Minha primeira faixa</div></div>
    <div class="momento-box" style="min-height:100px"><div class="momento-num">MOMENTO #3 — Aquele treino que eu nunca esqueço</div></div>
    <div class="momento-box" style="min-height:100px"><div class="momento-num">MOMENTO #4 — Livre! (escolha você)</div></div>
  </div>

  <!-- PÁG 6 — Carta do Sensei -->
  <div class="page content">
    <div class="content-header">
      <div class="content-header-icon">💌</div>
      <div class="content-header-title">Carta do Sensei</div>
    </div>
    <div class="letter">
      <div class="letter-header">Para: _____________________________ | Data: ____/____/____</div>
      <div class="letter-body">
        <p>Pequeno Guerreiro,</p>
        <p>Você chegou aqui com coragem. Não importa se estava com medo, tímido(a) ou nervoso(a) — você veio. E isso já diz muito sobre quem você é.</p>
        <p>O Jiu-Jitsu vai te ensinar coisas que nenhuma escola do mundo ensina: como se levantar depois de cair, como respeitar quem é diferente de você, e como confiar em si mesmo(a) quando a situação aperta.</p>
        <p>Cada aula que você vier, cada golpe que aprender, cada vez que não desistir — você estará construindo a versão mais forte de si mesmo(a).</p>
        <p>Eu acredito em você.</p>
      </div>
      <div class="letter-sig">
        Seu Sensei, ___________________________
        <div class="sig-line" style="width:180px;margin:16px 0 4px"></div>
        Assinatura
      </div>
    </div>
    <div class="footer">Kit Retenção Kids — Caderneta do Pequeno Guerreiro • Rodrigo Cruz + Bruno</div>
  </div>

  </body></html>`;

  return htmlParaPDF(html, "02-caderneta-pequeno-guerreiro.pdf");
}

// ═══════════════════════════════════════════════════════════
// PDF 3 — Protocolo dos 90 Dias
// ═══════════════════════════════════════════════════════════
async function gerarProtocolo90Dias() {
  console.log("\n📋 Gerando PDF 3 — Protocolo dos 90 Dias...");

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>${BASE_CSS}
  .week-card { border: 1px solid #e5e7eb; border-radius: 10px; padding: 14px; margin-bottom: 12px; }
  .week-header { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
  .week-num { background: #f97316; color: white; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800; flex-shrink: 0; }
  .week-title { font-size: 14px; font-weight: 700; color: #1a1a2e; }
  .week-sub { font-size: 11px; color: #6b7280; }
  </style></head><body>

  <!-- CAPA -->
  <div class="page cover">
    <div class="cover-badge">Kit Retenção Kids</div>
    <div style="margin-bottom:24px">${SVGS.protocolo}</div>
    <div class="cover-accent"></div>
    <div class="cover-title">Protocolo dos<br>90 Dias</div>
    <div class="cover-subtitle">Guia semana a semana para reter<br>alunos infantis nos primeiros 3 meses</div>
    <div class="cover-footer">Kit Retenção Kids • Rodrigo Cruz + Bruno</div>
  </div>

  <!-- POR QUE 90 DIAS -->
  <div class="page content">
    <div class="content-header">
      <div class="content-header-icon">🧠</div>
      <div class="content-header-title">Por Que 90 Dias?</div>
    </div>
    <div class="card" style="border-left-color:#1a1a2e">
      <div class="card-text" style="font-size:14px;line-height:1.8">Os dados mostram que crianças que passam os primeiros <strong>90 dias de forma estruturada</strong> têm <strong>70% mais chance de continuar por 1 ano ou mais</strong>. O abandono infantil acontece, na maioria das vezes, por <strong>falta de vínculo</strong> — não por falta de vontade.</div>
    </div>
    <p style="margin-top:16px">Este protocolo cria o vínculo <strong>antes que o problema apareça</strong>. Cada semana tem ações específicas. São pequenas atitudes que somam um relacionamento sólido entre sensei, criança e família.</p>
    <h2>As 4 Fases</h2>
    <div class="phase-bar" style="margin-bottom:10px"><h3>🌟 Fase 1 — Encantamento (Sem. 1-2)</h3><p>Fazer a criança e os pais se apaixonarem pela academia nos primeiros 14 dias.</p></div>
    <div class="phase-bar" style="margin-bottom:10px"><h3>🔗 Fase 2 — Consolidação (Sem. 3-6)</h3><p>Criar rotina e hábito. A criança deve sentir que o tatame é o lugar DELA.</p></div>
    <div class="phase-bar" style="margin-bottom:10px"><h3>🏠 Fase 3 — Pertencimento (Sem. 7-10)</h3><p>A criança já não é novata. Ela tem papel na turma e orgulho de estar ali.</p></div>
    <div class="phase-bar"><h3>🏆 Fase 4 — Primeira Conquista (Sem. 11-13)</h3><p>Primeira graduação ou conquista. Momento de celebração e fidelização.</p></div>
  </div>

  <!-- FASE 1 -->
  <div class="page content">
    <div class="content-header">
      <div class="content-header-icon">🌟</div>
      <div class="content-header-title">Fase 1 — Encantamento (Semanas 1 e 2)</div>
      <div class="content-header-badge">Dias 1–14</div>
    </div>
    <div class="card" style="border-left-color:#22c55e;background:#f0fdf4">
      <div class="card-text"><strong>Objetivo:</strong> fazer a criança e os pais se apaixonarem nos primeiros 14 dias.</div>
    </div>
    <h3>Dia 1 — Primeiro Contato (CRÍTICO)</h3>
    <p><strong>Antes da aula:</strong></p>
    <div class="checklist-item"><div class="check-box"></div>Receba a criança pelo nome na entrada ("Ei, [Nome]! Você chegou!")</div>
    <div class="checklist-item"><div class="check-box"></div>Apresente-a a pelo menos 2 colegas de turma</div>
    <div class="checklist-item"><div class="check-box"></div>Mostre o espaço: vestiário, tatame, bebedouro</div>
    <div class="checklist-item"><div class="check-box"></div>Entregue a Caderneta do Pequeno Guerreiro — peça pra ela escrever o nome na capa</div>
    <div class="checklist-item"><div class="check-box"></div>Tire uma foto dela com a caderneta (com permissão dos pais)</div>
    <p style="margin-top:12px"><strong>Durante a aula:</strong></p>
    <div class="checklist-item"><div class="check-box"></div>Corrija com paciência, nunca com impaciência</div>
    <div class="checklist-item"><div class="check-box"></div>Elogie em público pelo menos 1 vez na frente dos colegas</div>
    <div class="checklist-item"><div class="check-box"></div>Observe: ela é introvertida ou extrovertida? (isso vai guiar sua abordagem)</div>
    <p style="margin-top:12px"><strong>Após a aula (mesmo dia):</strong></p>
    <div class="checklist-item"><div class="check-box"></div>Envie a Mensagem #2 para os pais (como foi a primeira aula)</div>
    <div class="checklist-item"><div class="check-box"></div>Envie a foto da criança com a caderneta</div>
    <h3 style="margin-top:16px">Semana 1 — Aulas 1 a 3</h3>
    <div class="checklist-item"><div class="check-box"></div>Chamar a criança pelo nome em TODA aula</div>
    <div class="checklist-item"><div class="check-box"></div>Enviar pelo menos 1 mensagem aos pais durante a semana</div>
    <div class="checklist-item"><div class="check-box"></div>Anotar as presenças na caderneta junto com a criança</div>
    <div class="checklist-item"><div class="check-box"></div>Identificar um ponto forte e verbalizar: "você tem um jeito natural pra isso"</div>
    <h3 style="margin-top:16px">Semana 2 — Aulas 4 a 6</h3>
    <div class="checklist-item"><div class="check-box"></div>Enviar Mensagem #3 (explicando a metodologia)</div>
    <div class="checklist-item"><div class="check-box"></div>Fazer o primeiro check-in emocional: "Está gostando? Tem algo difícil?"</div>
    <div class="checklist-item"><div class="check-box"></div>Se detectar insegurança: 5 min de treino individual ao final da aula</div>
    <div class="checklist-item"><div class="check-box"></div>Apresentar a ideia dos Desafios Semanais</div>
  </div>

  <!-- FASE 2 e 3 -->
  <div class="page content">
    <div class="content-header">
      <div class="content-header-icon">🔗</div>
      <div class="content-header-title">Fases 2 e 3 — Consolidação e Pertencimento</div>
    </div>
    <div class="phase-bar" style="margin-bottom:16px"><h3>Fase 2 — Consolidação (Semanas 3–6)</h3><p>Criar rotina. A criança deve sentir que o tatame é o lugar DELA.</p></div>
    <div class="week-card">
      <div class="week-header"><div class="week-num">3</div><div><div class="week-title">Semana 3</div><div class="week-sub">Início dos Desafios Semanais</div></div></div>
      <div class="checklist-item"><div class="check-box"></div>Primeiro Desafio Semanal oficial</div>
      <div class="checklist-item"><div class="check-box"></div>Reunião rápida com os pais (WhatsApp): "Como o [Nome] está em casa?"</div>
      <div class="checklist-item"><div class="check-box"></div>Atualizar a caderneta: golpes favoritos e conquistas</div>
    </div>
    <div class="week-card">
      <div class="week-header"><div class="week-num">4</div><div><div class="week-title">Semana 4 — 1 MÊS! 🎉</div><div class="week-sub">Marco importante de retenção</div></div></div>
      <div class="checklist-item"><div class="check-box"></div>Enviar Mensagem #25 (completando 1 mês!)</div>
      <div class="checklist-item"><div class="check-box"></div>Vídeo ou áudio personalizado do sensei para a família</div>
      <div class="checklist-item"><div class="check-box"></div>Avaliar frequência — se irregular, ativar Protocolo de Faltas</div>
    </div>
    <div class="week-card">
      <div class="week-header"><div class="week-num">5-6</div><div><div class="week-title">Semanas 5 e 6</div><div class="week-sub">Aprofundando o vínculo</div></div></div>
      <div class="checklist-item"><div class="check-box"></div>Criar um apelido positivo para a criança no tatame</div>
      <div class="checklist-item"><div class="check-box"></div>Enviar Mensagem de conquista (qualquer evolução visível)</div>
      <div class="checklist-item"><div class="check-box"></div>Registrar golpes favoritos na caderneta</div>
    </div>
    <div class="phase-bar" style="margin: 16px 0"><h3>Fase 3 — Pertencimento (Semanas 7–10)</h3><p>A criança já tem papel na turma. Ela é referência para os mais novos.</p></div>
    <div class="week-card">
      <div class="week-header"><div class="week-num">7-8</div><div><div class="week-title">Semanas 7 e 8</div><div class="week-sub">Dando protagonismo</div></div></div>
      <div class="checklist-item"><div class="check-box"></div>Dar tarefa de liderança: "ajude esse coleguinha nesse movimento"</div>
      <div class="checklist-item"><div class="check-box"></div>Elogiar em frente à turma por evolução técnica específica</div>
    </div>
    <div class="week-card">
      <div class="week-header"><div class="week-num">9-10</div><div><div class="week-title">Semanas 9 e 10</div><div class="week-sub">Preparando para a 1ª conquista</div></div></div>
      <div class="checklist-item"><div class="check-box"></div>Comunicar aos pais que a criança está pronta para a avaliação</div>
      <div class="checklist-item"><div class="check-box"></div>Aumentar desafios técnicos gradualmente</div>
    </div>
  </div>

  <!-- PROTOCOLO DE FALTAS + FASE 4 -->
  <div class="page content">
    <div class="content-header">
      <div class="content-header-icon">🚨</div>
      <div class="content-header-title">Protocolo de Faltas + Fase 4</div>
    </div>
    <div class="card" style="border-left-color:#dc2626;background:#fef2f2">
      <div class="card-num" style="color:#dc2626">PROTOCOLO DE FALTAS — ativar imediatamente</div>
      <div class="card-text">As faltas são o sinal mais claro de abandono iminente. Não espere: aja no primeiro dia de falta.</div>
    </div>
    <div class="checklist-item" style="padding:10px 0"><div class="check-box"></div><div><strong>1ª falta:</strong> Envie Mensagem #27 no mesmo dia ("Está tudo bem?")</div></div>
    <div class="checklist-item" style="padding:10px 0"><div class="check-box"></div><div><strong>2ª falta seguida:</strong> Ligue ou envie áudio. Mensagem #28. Mostre que sentiu falta de verdade.</div></div>
    <div class="checklist-item" style="padding:10px 0"><div class="check-box"></div><div><strong>1 semana sem aparecer:</strong> Contato direto com os pais. Entenda o motivo. Ofereça solução.</div></div>
    <div class="checklist-item" style="padding:10px 0"><div class="check-box"></div><div><strong>Retorno:</strong> Comemore! Envie Mensagem #29. A turma deve dar boas-vindas em aula.</div></div>
    <div class="phase-bar" style="margin: 20px 0 16px"><h3>Fase 4 — Primeira Conquista (Semanas 11–13) 🏆</h3><p>Momento de celebração. Aqui a retenção está garantida por pelo menos mais 6 meses.</p></div>
    <div class="week-card">
      <div class="week-header"><div class="week-num">11-12</div><div><div class="week-title">Semanas 11 e 12</div><div class="week-sub">Avaliação e preparação</div></div></div>
      <div class="checklist-item"><div class="check-box"></div>Comunicar formalmente aos pais a data da avaliação</div>
      <div class="checklist-item"><div class="check-box"></div>Preparar certificado e missão de conquista do Kit</div>
      <div class="checklist-item"><div class="check-box"></div>Conversar com a criança sobre o que ela aprendeu nesses 90 dias</div>
    </div>
    <div class="week-card">
      <div class="week-header"><div class="week-num">13</div><div><div class="week-title">Semana 13 — DIA DA CONQUISTA 🎉</div><div class="week-sub">O momento mais importante dos 90 dias</div></div></div>
      <div class="checklist-item"><div class="check-box"></div>Cerimônia de entrega da faixa/grau (mesmo que simples)</div>
      <div class="checklist-item"><div class="check-box"></div>Entregar certificado impresso (do Kit de Conquistas)</div>
      <div class="checklist-item"><div class="check-box"></div>Enviar Mensagem #21 para os pais no mesmo dia</div>
      <div class="checklist-item"><div class="check-box"></div>Pedir para os pais compartilharem nas redes sociais — marque a academia</div>
    </div>
    <div class="footer">Kit Retenção Kids — Protocolo dos 90 Dias • Rodrigo Cruz + Bruno</div>
  </div>

  </body></html>`;

  return htmlParaPDF(html, "03-protocolo-90-dias.pdf");
}

// ═══════════════════════════════════════════════════════════
// PDF 4 — Kit de Conquistas
// ═══════════════════════════════════════════════════════════
async function gerarKitConquistas() {
  console.log("\n🏆 Gerando PDF 4 — Kit de Conquistas...");

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>${BASE_CSS}
  .level-header { padding: 12px 16px; border-radius: 8px; color: white; font-weight: 800; font-size: 14px; margin: 16px 0 10px; }
  .lv1 { background: #6b7280; }
  .lv2 { background: #f97316; }
  .lv3 { background: #dc2626; }
  .lv4 { background: #1a1a2e; }
  </style></head><body>

  <!-- CAPA -->
  <div class="page cover">
    <div class="cover-badge">Kit Retenção Kids</div>
    <div style="margin-bottom:24px">${SVGS.conquistas}</div>
    <div class="cover-accent"></div>
    <div class="cover-title">Kit de Conquistas</div>
    <div class="cover-subtitle">Sistema de missões, certificados e diplomas<br>para engajar e reter alunos infantis</div>
    <div class="cover-footer">Kit Retenção Kids • Rodrigo Cruz + Bruno</div>
  </div>

  <!-- COMO FUNCIONA -->
  <div class="page content">
    <div class="content-header">
      <div class="content-header-icon">🎮</div>
      <div class="content-header-title">Como Funciona o Sistema</div>
    </div>
    <p>O Kit de Conquistas transforma o aprendizado em um jogo. Cada missão cumprida aproxima a criança de um certificado especial — e os pais adoram compartilhar nas redes sociais.</p>
    <div class="grid2" style="margin:16px 0">
      <div class="card"><div class="card-num">Nível 1 — Iniciante</div><div class="card-text">Primeiras missões. Para os alunos nas primeiras semanas.</div></div>
      <div class="card"><div class="card-num">Nível 2 — Guerreiro</div><div class="card-text">Missões de consistência. Alunos com 1–3 meses.</div></div>
      <div class="card"><div class="card-num">Nível 3 — Campeão</div><div class="card-text">Missões de liderança. Alunos com 3–6 meses.</div></div>
      <div class="card"><div class="card-num">Nível 4 — Lenda</div><div class="card-text">Missões de honra. Alunos veteranos da turma.</div></div>
    </div>
    <h2>Como Aplicar</h2>
    <div class="card"><div class="card-num">Passo 1</div><div class="card-text">Escolha a missão adequada ao momento do aluno.</div></div>
    <div class="card"><div class="card-num">Passo 2</div><div class="card-text">Anuncie a missão para a turma (cria expectativa!).</div></div>
    <div class="card"><div class="card-num">Passo 3</div><div class="card-text">Quando concluída, entregue o certificado impresso em aula.</div></div>
    <div class="card"><div class="card-num">Passo 4</div><div class="card-text">Incentive os pais a fotografar e postar nas redes. Marketing orgânico!</div></div>
  </div>

  <!-- MISSÕES NÍVEL 1 e 2 -->
  <div class="page content">
    <div class="content-header">
      <div class="content-header-icon">⚔️</div>
      <div class="content-header-title">Missões — Níveis 1 e 2</div>
    </div>
    <div class="level-header lv1">⚪ NÍVEL 1 — INICIANTE</div>
    <div class="mission-card"><div class="mission-level">Nível 1</div><div class="mission-title">🥋 Primeira Aula</div><div class="mission-desc">Veio para a primeira aula e ficou até o fim. Coragem de começar!</div></div>
    <div class="mission-card"><div class="mission-level">Nível 1</div><div class="mission-title">🙏 Respeito Total</div><div class="mission-desc">Cumprimentou o sensei e todos os colegas em 3 aulas seguidas.</div></div>
    <div class="mission-card"><div class="mission-level">Nível 1</div><div class="mission-title">📓 Guerreiro Registrado</div><div class="mission-desc">Preencheu a Caderneta do Pequeno Guerreiro com todos os dados.</div></div>
    <div class="mission-card"><div class="mission-level">Nível 1</div><div class="mission-title">💪 Sem Desistir</div><div class="mission-desc">Tentou um golpe difícil pelo menos 5 vezes sem parar.</div></div>
    <div class="mission-card"><div class="mission-level">Nível 1</div><div class="mission-title">⏰ Nunca Atrasou</div><div class="mission-desc">Chegou no horário em 5 aulas seguidas.</div></div>
    <div class="level-header lv2" style="margin-top:8px">🟠 NÍVEL 2 — GUERREIRO</div>
    <div class="mission-card"><div class="mission-level" style="background:#f97316">Nível 2</div><div class="mission-title">🔥 10 Aulas no Tatame</div><div class="mission-desc">Completou 10 aulas sem desistir. Consistência de verdade!</div></div>
    <div class="mission-card"><div class="mission-level" style="background:#f97316">Nível 2</div><div class="mission-title">🤝 Amigo do Tatame</div><div class="mission-desc">Ajudou um coleguinha novo a aprender um movimento.</div></div>
    <div class="mission-card"><div class="mission-level" style="background:#f97316">Nível 2</div><div class="mission-title">🏆 1 Mês de Garra</div><div class="mission-desc">Completou 1 mês completo de treinos.</div></div>
    <div class="mission-card"><div class="mission-level" style="background:#f97316">Nível 2</div><div class="mission-title">⭐ Golpe Favorito</div><div class="mission-desc">Dominou um golpe e ensinou para um colega.</div></div>
  </div>

  <!-- MISSÕES NÍVEL 3 e 4 -->
  <div class="page content">
    <div class="content-header">
      <div class="content-header-icon">👑</div>
      <div class="content-header-title">Missões — Níveis 3 e 4</div>
    </div>
    <div class="level-header lv3">🔴 NÍVEL 3 — CAMPEÃO</div>
    <div class="mission-card"><div class="mission-level" style="background:#dc2626">Nível 3</div><div class="mission-title">🥇 3 Meses de Consistência</div><div class="mission-desc">Completou 90 dias de treinos. Raridade absoluta!</div></div>
    <div class="mission-card"><div class="mission-level" style="background:#dc2626">Nível 3</div><div class="mission-title">🦁 Liderança no Tatame</div><div class="mission-desc">Foi escolhido como monitor de aula pelo sensei.</div></div>
    <div class="mission-card"><div class="mission-level" style="background:#dc2626">Nível 3</div><div class="mission-title">🎯 Técnica Impecável</div><div class="mission-desc">Executou 3 golpes diferentes com perfeição.</div></div>
    <div class="mission-card"><div class="mission-level" style="background:#dc2626">Nível 3</div><div class="mission-title">💼 Embaixador da Academia</div><div class="mission-desc">Trouxe um amigo para experimentar uma aula.</div></div>
    <div class="level-header lv4" style="margin-top:8px">⚫ NÍVEL 4 — LENDA</div>
    <div class="mission-card"><div class="mission-level" style="background:#1a1a2e">Nível 4</div><div class="mission-title">⚫ 6 Meses Ininterruptos</div><div class="mission-desc">Meio ano de treinos sem desistir. Isso é Jiu-Jitsu.</div></div>
    <div class="mission-card"><div class="mission-level" style="background:#1a1a2e">Nível 4</div><div class="mission-title">🎖️ Coração de Sensei</div><div class="mission-desc">Demonstrou respeito e cuidado com TODOS os colegas.</div></div>
    <div class="mission-card"><div class="mission-level" style="background:#1a1a2e">Nível 4</div><div class="mission-title">🏛️ Pilar da Academia</div><div class="mission-desc">Reconhecido pela turma como exemplo de caráter e dedicação.</div></div>
  </div>

  <!-- CERTIFICADO MODELO -->
  <div class="page content">
    <div class="content-header">
      <div class="content-header-icon">📜</div>
      <div class="content-header-title">Modelo de Certificado</div>
      <div class="content-header-badge">Imprima e preencha</div>
    </div>
    <div class="cert-box">
      <div style="font-size:11px;color:#9ca3af;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px">Academia de Jiu-Jitsu</div>
      <div class="cert-title">Certificado de Conquista</div>
      <div style="width:80px;height:3px;background:#f97316;margin:8px auto 20px;border-radius:2px"></div>
      <div class="cert-body">
        <p>Certificamos que o(a) guerreiro(a)</p>
        <div class="cert-name">___________________________________</div>
        <p style="margin-top:12px">conquistou com bravura, dedicação e honra</p>
        <div class="cert-name" style="font-size:16px;margin:8px 0">[ NOME DA MISSÃO ]</div>
        <p>demonstrando os valores do Jiu-Jitsu:<br><strong>Respeito · Disciplina · Coragem</strong></p>
      </div>
      <div style="display:flex;justify-content:space-around;margin-top:28px">
        <div style="text-align:center"><div class="sig-line"></div><div style="font-size:11px;color:#6b7280">Sensei</div></div>
        <div style="text-align:center"><div style="font-size:40px">🥋</div></div>
        <div style="text-align:center"><div class="sig-line"></div><div style="font-size:11px;color:#6b7280">Data</div></div>
      </div>
    </div>
    <p style="text-align:center;color:#9ca3af;font-size:11px;margin-top:12px">Imprima este modelo, preencha à mão e entregue em aula. Custo: praticamente zero. Impacto: enorme.</p>
    <div class="footer">Kit Retenção Kids — Kit de Conquistas • Rodrigo Cruz + Bruno</div>
  </div>

  </body></html>`;

  return htmlParaPDF(html, "04-kit-conquistas.pdf");
}

// ═══════════════════════════════════════════════════════════
// PDF 5 — Carta de Boas-Vindas para Pais
// ═══════════════════════════════════════════════════════════
async function gerarCartaBoasVindas() {
  console.log("\n💌 Gerando PDF 5 — Carta de Boas-Vindas...");

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>${BASE_CSS}
  .letter { background: #fffbf5; border: 2px solid #fde68a; border-radius: 12px; padding: 30px; margin-bottom: 24px; }
  .letter-label { background: #f97316; color: white; padding: 4px 14px; border-radius: 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; display: inline-block; margin-bottom: 16px; }
  .letter-body { font-size: 13px; color: #374151; line-height: 2; }
  .letter-sig { margin-top: 24px; padding-top: 16px; border-top: 1px solid #fde68a; }
  .letter-sig-name { font-weight: 700; color: #92400e; font-size: 14px; }
  .letter-sig-title { color: #9ca3af; font-size: 11px; }
  </style></head><body>

  <!-- CAPA -->
  <div class="page cover">
    <div class="cover-badge">Kit Retenção Kids</div>
    <div style="margin-bottom:24px">${SVGS.carta}</div>
    <div class="cover-accent"></div>
    <div class="cover-title">Carta de<br>Boas-Vindas para Pais</div>
    <div class="cover-subtitle">3 modelos prontos para imprimir e entregar<br>na primeira aula do aluno</div>
    <div class="cover-footer">Kit Retenção Kids • Rodrigo Cruz + Bruno</div>
  </div>

  <!-- COMO USAR -->
  <div class="page content">
    <div class="content-header">
      <div class="content-header-icon">📋</div>
      <div class="content-header-title">Como Usar Esta Carta</div>
    </div>
    <p>A Carta de Boas-Vindas é entregue na <strong>primeira aula do aluno</strong>. Custo médio de impressão: <strong>R$0,50</strong>. Impacto: enorme. Diferencia você de 99% das academias.</p>
    <h2>Orientações de Uso</h2>
    <div class="card"><div class="card-num">Escolha o modelo</div><div class="card-text">Temos 3 estilos: Clássica (formal), Direta (moderna) e Emocional (conexão profunda). Escolha o que mais combina com seu estilo.</div></div>
    <div class="card"><div class="card-num">Personalize</div><div class="card-text">Substitua [NOME DA ACADEMIA], [SEU NOME] e campos entre colchetes pelos dados reais. Pode personalizar com o nome do aluno também.</div></div>
    <div class="card"><div class="card-num">Imprima</div><div class="card-text">Imprima em folha A4 normal ou carta. Pode dobrar em 3 e colocar em um envelope simples para um toque especial.</div></div>
    <div class="card"><div class="card-num">Entregue</div><div class="card-text">Entregue pessoalmente ao pai ou mãe ao final da primeira aula. Um simples "preparei isso para vocês" já faz toda a diferença.</div></div>
    <h2>Checklist Antes de Entregar</h2>
    <div class="checklist-item"><div class="check-box"></div>Nome da academia preenchido</div>
    <div class="checklist-item"><div class="check-box"></div>Seu nome e assinatura no final</div>
    <div class="checklist-item"><div class="check-box"></div>Contato do WhatsApp incluído</div>
    <div class="checklist-item"><div class="check-box"></div>Carta impressa (não enviar por digital — o físico tem impacto muito maior)</div>
  </div>

  <!-- MODELO 1 -->
  <div class="page content">
    <div class="content-header">
      <div class="content-header-icon">📄</div>
      <div class="content-header-title">Modelo 1 — Carta Clássica</div>
      <div class="content-header-badge">Formal e Elegante</div>
    </div>
    <div class="letter">
      <div class="letter-label">Modelo 1 — Clássica</div>
      <div class="letter-body">
        <p>[Local], [Data]</p>
        <br>
        <p>Prezados pais e responsáveis,</p>
        <br>
        <p>Em nome de toda a equipe da <strong>[NOME DA ACADEMIA]</strong>, é com grande satisfação que damos as boas-vindas ao(à) <strong>[Nome da criança]</strong> à nossa família.</p>
        <p>Acreditamos que o Jiu-Jitsu é muito mais do que um esporte. É uma ferramenta de transformação de vida. Aqui, seu filho(a) aprenderá não apenas técnicas e golpes, mas também respeito, disciplina, perseverança e confiança — valores que carregará para sempre.</p>
        <p>Nos comprometemos a acompanhar o desenvolvimento do(a) <strong>[Nome da criança]</strong> com atenção, cuidado e dedicação. Sua família pode contar conosco para qualquer dúvida ou necessidade.</p>
        <p>Nosso contato direto: <strong>[SEU WHATSAPP]</strong></p>
        <p>Bem-vindo(a) ao tatame. Aqui começa uma jornada incrível.</p>
      </div>
      <div class="letter-sig">
        <div class="letter-sig-name">_________________________________</div>
        <div class="letter-sig-title">[SEU NOME] — Sensei | [NOME DA ACADEMIA]</div>
      </div>
    </div>
  </div>

  <!-- MODELO 2 -->
  <div class="page content">
    <div class="content-header">
      <div class="content-header-icon">💬</div>
      <div class="content-header-title">Modelo 2 — Carta Direta</div>
      <div class="content-header-badge">Moderna e Objetiva</div>
    </div>
    <div class="letter">
      <div class="letter-label">Modelo 2 — Direta</div>
      <div class="letter-body">
        <p>Oi, família [Sobrenome da criança]!</p>
        <br>
        <p>Hoje o(a) [Nome da criança] deu um passo enorme. Ele(a) entrou no tatame pela primeira vez — e isso não é pouca coisa.</p>
        <p>Meu nome é [SEU NOME] e sou o sensei que vai acompanhar a jornada dele(a). Quero que saibam desde o primeiro dia:</p>
        <p><strong>✅ Aqui a criança vem primeiro.</strong> Cada aula é adaptada ao ritmo do aluno.</p>
        <p><strong>✅ Aqui a família faz parte.</strong> Qualquer dúvida, fale comigo diretamente.</p>
        <p><strong>✅ Aqui valorizamos o processo.</strong> Resultado vem com consistência, não com pressa.</p>
        <p>Meu WhatsApp: <strong>[SEU WHATSAPP]</strong>. Pode chamar quando quiser!</p>
        <p>Nos vemos na próxima aula! 🥋</p>
      </div>
      <div class="letter-sig">
        <div class="letter-sig-name">_________________________________</div>
        <div class="letter-sig-title">Sensei [SEU NOME] | [NOME DA ACADEMIA]</div>
      </div>
    </div>
  </div>

  <!-- MODELO 3 -->
  <div class="page content">
    <div class="content-header">
      <div class="content-header-icon">❤️</div>
      <div class="content-header-title">Modelo 3 — Carta Emocional</div>
      <div class="content-header-badge">Conexão Profunda</div>
    </div>
    <div class="letter">
      <div class="letter-label">Modelo 3 — Emocional</div>
      <div class="letter-body">
        <p>Para os pais do(a) [Nome da criança],</p>
        <br>
        <p>Obrigado por trazer seu filho(a) até aqui.</p>
        <p>Sei que essa decisão não foi tomada de impulso. Você pesquisou, pensou, ponderou. E escolheu confiar uma parte preciosa da vida do seu filho(a) ao Jiu-Jitsu — e a nós.</p>
        <p>Essa confiança não é pequena. E eu a recebo com muita responsabilidade.</p>
        <p>Ao longo dos próximos meses, você vai ver mudanças que vão além do tatame. Uma postura diferente. Uma resposta mais calma diante dos desafios. Uma confiança que vem de dentro. Isso não vem do golpe que ele(a) aprendeu — vem de cada vez que não desistiu.</p>
        <p>Meu compromisso com vocês é simples: eu me importo. Com o[a] [Nome da criança], com a evolução dele(a), e com o relacionamento que vamos construir ao longo dessa jornada.</p>
        <p>Qualquer coisa, pode me chamar: <strong>[SEU WHATSAPP]</strong></p>
        <p>Com respeito e gratidão,</p>
      </div>
      <div class="letter-sig">
        <div class="letter-sig-name">_________________________________</div>
        <div class="letter-sig-title">Sensei [SEU NOME] | [NOME DA ACADEMIA]</div>
      </div>
    </div>
    <div class="footer">Kit Retenção Kids — Carta de Boas-Vindas para Pais • Rodrigo Cruz + Bruno</div>
  </div>

  </body></html>`;

  return htmlParaPDF(html, "05-carta-boas-vindas.pdf");
}

// ═══════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════
async function main() {
  console.log("🥋 Kit Retenção Kids — Gerador de PDFs");
  console.log("========================================");
  console.log(`📁 Saída: ${OUT_DIR}\n`);

  const arquivos = [];
  try { arquivos.push(await gerarMensagensWhatsApp()); } catch (e) { console.error("❌ PDF 1 falhou:", e.message); }
  try { arquivos.push(await gerarCaderneta()); } catch (e) { console.error("❌ PDF 2 falhou:", e.message); }
  try { arquivos.push(await gerarProtocolo90Dias()); } catch (e) { console.error("❌ PDF 3 falhou:", e.message); }
  try { arquivos.push(await gerarKitConquistas()); } catch (e) { console.error("❌ PDF 4 falhou:", e.message); }
  try { arquivos.push(await gerarCartaBoasVindas()); } catch (e) { console.error("❌ PDF 5 falhou:", e.message); }

  console.log("\n========================================");
  console.log(`✅ ${arquivos.length}/5 PDFs gerados com sucesso!`);
  arquivos.forEach(f => console.log(`   • ${path.basename(f)}`));
  console.log(`\n📁 Pasta: ${OUT_DIR}`);
  process.exit(0);
}

main().catch(e => { console.error("Fatal:", e); process.exit(1); });
