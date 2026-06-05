const puppeteer = require('puppeteer');
const { PDFDocument } = require('pdf-lib');
const fs = require('fs');

// ── SVG CARTOONS ──────────────────────────────────────────────

const svgProfessoraEstressada = `
<svg width="340" height="340" viewBox="0 0 340 340" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- papéis voando -->
  <rect x="60" y="30" width="70" height="90" rx="8" fill="white" stroke="#ddd" stroke-width="2" transform="rotate(-20 95 75)"/>
  <line x1="75" y1="55" x2="115" y2="55" stroke="#eee" stroke-width="3" stroke-linecap="round" transform="rotate(-20 95 55)"/>
  <line x1="75" y1="68" x2="105" y2="68" stroke="#eee" stroke-width="3" stroke-linecap="round" transform="rotate(-20 90 68)"/>
  <rect x="200" y="20" width="70" height="90" rx="8" fill="white" stroke="#ddd" stroke-width="2" transform="rotate(15 235 65)"/>
  <line x1="215" y1="45" x2="255" y2="45" stroke="#eee" stroke-width="3" stroke-linecap="round" transform="rotate(15 235 45)"/>
  <line x1="215" y1="58" x2="245" y2="58" stroke="#eee" stroke-width="3" stroke-linecap="round" transform="rotate(15 230 58)"/>
  <rect x="130" y="10" width="70" height="90" rx="8" fill="white" stroke="#ddd" stroke-width="2" transform="rotate(5 165 55)"/>
  <line x1="145" y1="35" x2="185" y2="35" stroke="#eee" stroke-width="3" stroke-linecap="round"/>
  <line x1="145" y1="48" x2="175" y2="48" stroke="#eee" stroke-width="3" stroke-linecap="round"/>
  <!-- corpo -->
  <rect x="115" y="230" width="110" height="90" rx="20" fill="#00b4ae"/>
  <!-- braços -->
  <rect x="68" y="235" width="52" height="28" rx="14" fill="#00b4ae" transform="rotate(-30 94 249)"/>
  <rect x="220" y="235" width="52" height="28" rx="14" fill="#00b4ae" transform="rotate(30 246 249)"/>
  <!-- mãos -->
  <circle cx="70" cy="215" r="18" fill="#f5c5a3"/>
  <circle cx="270" cy="215" r="18" fill="#f5c5a3"/>
  <!-- pescoço -->
  <rect x="152" y="208" width="36" height="28" rx="10" fill="#f5c5a3"/>
  <!-- cabeça -->
  <circle cx="170" cy="185" r="52" fill="#f5c5a3"/>
  <!-- cabelo -->
  <ellipse cx="170" cy="142" rx="52" ry="22" fill="#5c3d2e"/>
  <ellipse cx="122" cy="168" rx="14" ry="28" fill="#5c3d2e"/>
  <ellipse cx="218" cy="168" rx="14" ry="28" fill="#5c3d2e"/>
  <!-- olhos preocupados -->
  <ellipse cx="152" cy="183" rx="9" ry="9" fill="white"/>
  <ellipse cx="188" cy="183" rx="9" ry="9" fill="white"/>
  <circle cx="154" cy="185" r="5" fill="#333"/>
  <circle cx="190" cy="185" r="5" fill="#333"/>
  <!-- sobrancelhas tensas -->
  <path d="M143 171 Q152 167 161 171" stroke="#5c3d2e" stroke-width="3.5" stroke-linecap="round" fill="none"/>
  <path d="M179 171 Q188 167 197 171" stroke="#5c3d2e" stroke-width="3.5" stroke-linecap="round" fill="none"/>
  <!-- boca triste -->
  <path d="M158 202 Q170 196 182 202" stroke="#c0856a" stroke-width="3" stroke-linecap="round" fill="none"/>
  <!-- suor -->
  <ellipse cx="210" cy="165" rx="6" ry="9" fill="#7dd3fc" opacity="0.8"/>
  <ellipse cx="220" cy="178" rx="5" ry="7" fill="#7dd3fc" opacity="0.6"/>
</svg>`;

const svgPapeisTriste = `
<svg width="320" height="300" viewBox="0 0 320 300" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- sombra -->
  <ellipse cx="160" cy="285" rx="100" ry="14" fill="#0001" />
  <!-- papéis empilhados -->
  <rect x="60" y="140" width="200" height="130" rx="10" fill="white" stroke="#e0e0e0" stroke-width="2"/>
  <rect x="55" y="125" width="200" height="130" rx="10" fill="white" stroke="#e0e0e0" stroke-width="2"/>
  <rect x="50" y="110" width="200" height="130" rx="10" fill="white" stroke="#ddd" stroke-width="2"/>
  <rect x="45" y="95" width="200" height="130" rx="10" fill="white" stroke="#ccc" stroke-width="2"/>
  <!-- linhas no papel do topo -->
  <line x1="68" y1="118" x2="225" y2="118" stroke="#eee" stroke-width="3" stroke-linecap="round"/>
  <line x1="68" y1="132" x2="200" y2="132" stroke="#eee" stroke-width="3" stroke-linecap="round"/>
  <line x1="68" y1="146" x2="215" y2="146" stroke="#eee" stroke-width="3" stroke-linecap="round"/>
  <line x1="68" y1="160" x2="185" y2="160" stroke="#eee" stroke-width="3" stroke-linecap="round"/>
  <!-- carinha triste no topo -->
  <circle cx="232" cy="75" r="42" fill="#fef08a" stroke="#fcd34d" stroke-width="3"/>
  <circle cx="218" cy="65" r="6" fill="#555"/>
  <circle cx="246" cy="65" r="6" fill="#555"/>
  <path d="M216 90 Q232 82 248 90" stroke="#555" stroke-width="3.5" stroke-linecap="round" fill="none"/>
  <!-- número de páginas -->
  <rect x="48" y="84" width="52" height="28" rx="8" fill="#ef4444"/>
  <text x="74" y="103" font-size="16" font-weight="900" fill="white" text-anchor="middle" font-family="Arial">20x</text>
</svg>`;

const svgProfessoraFeliz = `
<svg width="300" height="320" viewBox="0 0 300 320" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- estrelinhas -->
  <text x="28" y="60" font-size="22">⭐</text>
  <text x="248" y="50" font-size="18">✨</text>
  <text x="255" y="90" font-size="14">⭐</text>
  <!-- corpo -->
  <rect x="100" y="225" width="100" height="80" rx="20" fill="#00b4ae"/>
  <!-- braços levantados celebrando -->
  <rect x="48" y="185" width="55" height="26" rx="13" fill="#00b4ae" transform="rotate(-50 75 198)"/>
  <rect x="197" y="185" width="55" height="26" rx="13" fill="#00b4ae" transform="rotate(50 225 198)"/>
  <!-- mãos -->
  <circle cx="58" cy="165" r="17" fill="#f5c5a3"/>
  <circle cx="242" cy="165" r="17" fill="#f5c5a3"/>
  <!-- pescoço -->
  <rect x="136" y="205" width="28" height="24" rx="10" fill="#f5c5a3"/>
  <!-- cabeça -->
  <circle cx="150" cy="182" r="50" fill="#f5c5a3"/>
  <!-- cabelo -->
  <ellipse cx="150" cy="140" rx="50" ry="20" fill="#5c3d2e"/>
  <ellipse cx="104" cy="164" rx="13" ry="26" fill="#5c3d2e"/>
  <ellipse cx="196" cy="164" rx="13" ry="26" fill="#5c3d2e"/>
  <!-- olhos felizes (arcos) -->
  <path d="M134 178 Q143 172 152 178" stroke="#333" stroke-width="3.5" stroke-linecap="round" fill="none"/>
  <path d="M158 178 Q167 172 176 178" stroke="#333" stroke-width="3.5" stroke-linecap="round" fill="none"/>
  <!-- bochecha -->
  <ellipse cx="128" cy="192" rx="10" ry="7" fill="#f09090" opacity="0.5"/>
  <ellipse cx="172" cy="192" rx="10" ry="7" fill="#f09090" opacity="0.5"/>
  <!-- sorriso -->
  <path d="M134 198 Q150 212 166 198" stroke="#c0856a" stroke-width="3.5" stroke-linecap="round" fill="none"/>
  <!-- check badge -->
  <circle cx="220" cy="240" r="28" fill="#22c55e"/>
  <path d="M208 240 L218 252 L234 228" stroke="white" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
</svg>`;

const svgCelebra = `
<svg width="300" height="300" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- confetes -->
  <rect x="40" y="30" width="14" height="14" rx="3" fill="#fcd34d" transform="rotate(25 47 37)"/>
  <rect x="240" y="50" width="12" height="12" rx="3" fill="#f87171" transform="rotate(-15 246 56)"/>
  <rect x="80" y="20" width="10" height="10" rx="2" fill="#34d399" transform="rotate(40 85 25)"/>
  <rect x="200" y="25" width="12" height="12" rx="2" fill="#60a5fa" transform="rotate(-30 206 31)"/>
  <rect x="260" y="100" width="10" height="10" rx="2" fill="#a78bfa" transform="rotate(20 265 105)"/>
  <rect x="30" y="110" width="10" height="10" rx="2" fill="#f472b6" transform="rotate(-25 35 115)"/>
  <!-- corpo -->
  <rect x="110" y="215" width="80" height="75" rx="18" fill="white" opacity="0.25"/>
  <!-- braços levantados -->
  <rect x="55" y="175" width="50" height="24" rx="12" fill="white" opacity="0.25" transform="rotate(-55 80 187)"/>
  <rect x="195" y="175" width="50" height="24" rx="12" fill="white" opacity="0.25" transform="rotate(55 220 187)"/>
  <!-- mãos -->
  <circle cx="52" cy="152" r="16" fill="#f5c5a3"/>
  <circle cx="248" cy="152" r="16" fill="#f5c5a3"/>
  <!-- pescoço -->
  <rect x="134" y="196" width="32" height="24" rx="10" fill="#f5c5a3"/>
  <!-- cabeça -->
  <circle cx="150" cy="172" r="52" fill="#f5c5a3"/>
  <!-- cabelo -->
  <ellipse cx="150" cy="128" rx="52" ry="22" fill="#5c3d2e"/>
  <ellipse cx="102" cy="154" rx="14" ry="28" fill="#5c3d2e"/>
  <ellipse cx="198" cy="154" rx="14" ry="28" fill="#5c3d2e"/>
  <!-- olhos felizes -->
  <path d="M132 168 Q142 160 152 168" stroke="#333" stroke-width="3.5" stroke-linecap="round" fill="none"/>
  <path d="M158 168 Q168 160 178 168" stroke="#333" stroke-width="3.5" stroke-linecap="round" fill="none"/>
  <!-- bochechas -->
  <ellipse cx="126" cy="182" rx="11" ry="7" fill="#f09090" opacity="0.5"/>
  <ellipse cx="174" cy="182" rx="11" ry="7" fill="#f09090" opacity="0.5"/>
  <!-- sorriso grande -->
  <path d="M132 190 Q150 208 168 190" stroke="#c0856a" stroke-width="4" stroke-linecap="round" fill="none"/>
  <!-- estrela no topo -->
  <text x="135" y="118" font-size="28" text-anchor="middle">🎉</text>
</svg>`;

// ── SLIDES ────────────────────────────────────────────────────

const slides = [

// SLIDE 1 — CAPA
`<div style="width:1080px;height:1080px;background:linear-gradient(145deg,#0a2e2d 0%,#00b4ae 100%);display:flex;align-items:center;justify-content:space-between;padding:80px 70px;position:relative;overflow:hidden;">
  <div style="position:absolute;top:-80px;right:-80px;width:400px;height:400px;border-radius:50%;background:rgba(255,255,255,0.04);"></div>
  <div style="position:absolute;bottom:-60px;left:-60px;width:300px;height:300px;border-radius:50%;background:rgba(255,255,255,0.04);"></div>
  <div style="flex:1;padding-right:40px;">
    <div style="background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.2);border-radius:30px;padding:10px 24px;font-size:17px;font-weight:700;color:rgba(255,255,255,0.9);letter-spacing:1.5px;text-transform:uppercase;margin-bottom:36px;display:inline-block;">Para Professoras de EI</div>
    <div style="font-size:70px;font-weight:900;color:white;line-height:1.08;margin-bottom:28px;">Você gasta até<br><span style="color:#00e5df;">100 horas</span><br>por ano<br>escrevendo<br>pareceres?</div>
    <div style="font-size:23px;color:rgba(255,255,255,0.75);line-height:1.5;max-width:480px;">Existe uma forma de fazer isso em <strong style="color:white;">10 minutos por aluno</strong> — sem perder qualidade.</div>
  </div>
  <div style="flex-shrink:0;opacity:0.95;">${svgProfessoraEstressada}</div>
  <div style="position:absolute;bottom:40px;right:60px;font-size:16px;color:rgba(255,255,255,0.4);font-weight:600;letter-spacing:1px;">1 / 6</div>
</div>`,

// SLIDE 2 — O PROBLEMA
`<div style="width:1080px;height:1080px;background:#fff;display:flex;align-items:center;justify-content:space-between;padding:80px;position:relative;">
  <div style="flex:1;padding-right:48px;">
    <div style="font-size:17px;font-weight:800;color:#00b4ae;text-transform:uppercase;letter-spacing:2px;margin-bottom:22px;">O problema</div>
    <div style="font-size:58px;font-weight:900;color:#1a1a2e;line-height:1.1;margin-bottom:36px;">Fim de<br>bimestre.<br>20 pareceres.<br><span style="color:#e74c3c;">Do zero.</span></div>
    <div style="display:flex;flex-direction:column;gap:16px;">
      <div style="display:flex;align-items:center;gap:16px;background:#fff5f5;border:2px solid #fdd;border-radius:14px;padding:18px 22px;">
        <div style="font-size:30px;">😩</div>
        <div style="font-size:20px;color:#c0392b;font-weight:700;line-height:1.4;">Horas escrevendo do zero para cada aluno</div>
      </div>
      <div style="display:flex;align-items:center;gap:16px;background:#fff5f5;border:2px solid #fdd;border-radius:14px;padding:18px 22px;">
        <div style="font-size:30px;">🌙</div>
        <div style="font-size:20px;color:#c0392b;font-weight:700;line-height:1.4;">Fim de semana perdido antes do prazo</div>
      </div>
      <div style="display:flex;align-items:center;gap:16px;background:#fff5f5;border:2px solid #fdd;border-radius:14px;padding:18px 22px;">
        <div style="font-size:30px;">😰</div>
        <div style="font-size:20px;color:#c0392b;font-weight:700;line-height:1.4;">"Estou usando a linguagem pedagógica certa?"</div>
      </div>
    </div>
  </div>
  <div style="flex-shrink:0;">${svgPapeisTriste}</div>
  <div style="position:absolute;bottom:40px;right:60px;font-size:16px;color:#ccc;font-weight:600;letter-spacing:1px;">2 / 6</div>
</div>`,

// SLIDE 3 — A SOLUÇÃO
`<div style="width:1080px;height:1080px;background:linear-gradient(160deg,#f0fffe 0%,#e0f7f6 100%);display:flex;flex-direction:column;padding:72px 80px;position:relative;">
  <div style="font-size:17px;font-weight:800;color:#00b4ae;text-transform:uppercase;letter-spacing:2px;margin-bottom:20px;">A solução</div>
  <div style="font-size:56px;font-weight:900;color:#1a1a2e;line-height:1.1;margin-bottom:10px;">200 blocos de<br>texto prontos.</div>
  <div style="font-size:22px;color:#555;margin-bottom:36px;line-height:1.5;">Você combina, coloca o nome — <strong style="color:#00b4ae;">parecer único em 10 minutos.</strong></div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;flex:1;">
    <div style="background:white;border:2.5px solid #00b4ae;border-radius:16px;padding:22px;display:flex;align-items:center;gap:14px;box-shadow:0 4px 20px rgba(0,180,174,0.12);">
      <div style="font-size:38px;">🤝</div><div><div style="font-size:18px;font-weight:800;color:#1a1a2e;">O eu, o outro e o nós</div><div style="font-size:14px;color:#777;margin-top:3px;">Empatia, convivência, identidade</div></div>
    </div>
    <div style="background:white;border:2px solid #e8e8e8;border-radius:16px;padding:22px;display:flex;align-items:center;gap:14px;">
      <div style="font-size:38px;">🏃</div><div><div style="font-size:18px;font-weight:800;color:#1a1a2e;">Corpo, gestos e movimentos</div><div style="font-size:14px;color:#777;margin-top:3px;">Coordenação, expressão corporal</div></div>
    </div>
    <div style="background:white;border:2px solid #e8e8e8;border-radius:16px;padding:22px;display:flex;align-items:center;gap:14px;">
      <div style="font-size:38px;">🎨</div><div><div style="font-size:18px;font-weight:800;color:#1a1a2e;">Traços, sons e cores</div><div style="font-size:14px;color:#777;margin-top:3px;">Arte, música, expressão criativa</div></div>
    </div>
    <div style="background:white;border:2px solid #e8e8e8;border-radius:16px;padding:22px;display:flex;align-items:center;gap:14px;">
      <div style="font-size:38px;">📖</div><div><div style="font-size:18px;font-weight:800;color:#1a1a2e;">Escuta, fala e imaginação</div><div style="font-size:14px;color:#777;margin-top:3px;">Linguagem, narrativa, literatura</div></div>
    </div>
    <div style="background:white;border:2px solid #e8e8e8;border-radius:16px;padding:22px;display:flex;align-items:center;gap:14px;grid-column:span 2;">
      <div style="font-size:38px;">🔢</div><div><div style="font-size:18px;font-weight:800;color:#1a1a2e;">Espaços, tempos, quantidades e transformações</div><div style="font-size:14px;color:#777;margin-top:3px;">Matemática, ciências, mundo natural</div></div>
    </div>
  </div>
  <div style="position:absolute;bottom:40px;right:60px;font-size:16px;color:#aaa;font-weight:600;letter-spacing:1px;">3 / 6</div>
</div>`,

// SLIDE 4 — COMO FUNCIONA
`<div style="width:1080px;height:1080px;background:#1a1a2e;display:flex;flex-direction:column;padding:80px;position:relative;">
  <div style="font-size:17px;font-weight:800;color:#00e5df;text-transform:uppercase;letter-spacing:2px;margin-bottom:20px;">Como funciona</div>
  <div style="font-size:52px;font-weight:900;color:white;line-height:1.15;margin-bottom:36px;">5 passos.<br><span style="color:#00e5df;">10 minutos.</span><br>Parecer pronto.</div>
  <div style="display:flex;flex-direction:column;gap:16px;flex:1;">
    ${[
      ['📄','Abre o PDF','Offline, sem internet, sem assinatura'],
      ['🗂️','Escolhe o Campo de Experiência','O campo que mais trabalhou com aquele aluno'],
      ['📊','Define o nível','Desenvolvendo · Em desenvolvimento · Consolidado'],
      ['✂️','Seleciona 4-5 blocos','Textos prontos, linguagem BNCC, personalizáveis'],
      ['✅','Coloca o nome e pronto','Parecer único, coerente e profissional'],
    ].map(([icon, t, d], i) => `
    <div style="display:flex;align-items:center;gap:18px;">
      <div style="width:52px;height:52px;border-radius:50%;background:linear-gradient(135deg,#00b4ae,#00e5df);font-size:22px;font-weight:900;display:flex;align-items:center;justify-content:center;flex-shrink:0;">${icon}</div>
      <div style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:14px;padding:16px 22px;flex:1;">
        <div style="font-size:20px;font-weight:800;color:white;">${t}</div>
        <div style="font-size:15px;color:rgba(255,255,255,0.5);margin-top:3px;">${d}</div>
      </div>
    </div>`).join('')}
  </div>
  <div style="position:absolute;bottom:40px;right:60px;font-size:16px;color:rgba(255,255,255,0.3);font-weight:600;letter-spacing:1px;">4 / 6</div>
</div>`,

// SLIDE 5 — RESULTADO
`<div style="width:1080px;height:1080px;background:#fff;display:flex;align-items:center;justify-content:space-between;padding:80px;position:relative;">
  <div style="flex:1;padding-right:40px;">
    <div style="font-size:17px;font-weight:800;color:#00b4ae;text-transform:uppercase;letter-spacing:2px;margin-bottom:22px;">O resultado</div>
    <div style="font-size:52px;font-weight:900;color:#1a1a2e;line-height:1.15;margin-bottom:32px;">O que muda na<br>sua <span style="color:#00b4ae;">rotina</span>?</div>
    <div style="display:flex;gap:16px;margin-bottom:20px;">
      <div style="flex:1;background:#fff5f5;border:2px solid #fdd;border-radius:18px;padding:24px;text-align:center;">
        <div style="font-size:44px;font-weight:900;color:#e74c3c;margin-bottom:6px;">3-4h</div>
        <div style="font-size:16px;font-weight:700;color:#c0392b;">por aluno, antes</div>
        <div style="font-size:13px;color:#aaa;margin-top:4px;">escrevendo do zero</div>
      </div>
      <div style="display:flex;align-items:center;font-size:36px;color:#ccc;">→</div>
      <div style="flex:1;background:#f0fffe;border:2.5px solid #00b4ae;border-radius:18px;padding:24px;text-align:center;">
        <div style="font-size:44px;font-weight:900;color:#00b4ae;margin-bottom:6px;">10min</div>
        <div style="font-size:16px;font-weight:700;color:#008f8a;">por aluno, depois</div>
        <div style="font-size:13px;color:#aaa;margin-top:4px;">com os blocos prontos</div>
      </div>
    </div>
    <div style="background:linear-gradient(135deg,#1a1a2e,#2d2d4e);border-radius:18px;padding:22px 28px;display:flex;align-items:center;justify-content:space-between;">
      <div><div style="font-size:20px;font-weight:800;color:white;">35 alunos × 4 bimestres</div><div style="font-size:14px;color:rgba(255,255,255,0.55);margin-top:3px;">= até 140 horas economizadas por ano</div></div>
      <div style="background:linear-gradient(135deg,#00b4ae,#00e5df);border-radius:10px;padding:12px 22px;font-size:20px;font-weight:900;color:#1a1a2e;">R$97 / ano</div>
    </div>
  </div>
  <div style="flex-shrink:0;">${svgProfessoraFeliz}</div>
  <div style="position:absolute;bottom:40px;right:60px;font-size:16px;color:#ccc;font-weight:600;letter-spacing:1px;">5 / 6</div>
</div>`,

// SLIDE 6 — CTA
`<div style="width:1080px;height:1080px;background:linear-gradient(145deg,#00b4ae 0%,#007a76 100%);display:flex;align-items:center;justify-content:space-between;padding:80px 70px;position:relative;overflow:hidden;">
  <div style="position:absolute;top:-100px;right:-100px;width:500px;height:500px;border-radius:50%;background:rgba(255,255,255,0.06);"></div>
  <div style="position:absolute;bottom:-80px;left:-80px;width:400px;height:400px;border-radius:50%;background:rgba(255,255,255,0.06);"></div>
  <div style="flex:1;padding-right:48px;">
    <div style="font-size:20px;font-weight:700;color:rgba(255,255,255,0.8);letter-spacing:1px;margin-bottom:18px;">Atividades e Dinâmicas</div>
    <div style="font-size:62px;font-weight:900;color:white;line-height:1.08;margin-bottom:18px;">Chega de<br>noites viradas<br>por pareceres.</div>
    <div style="font-size:22px;color:rgba(255,255,255,0.85);margin-bottom:40px;line-height:1.5;">200 blocos descritivos prontos.<br>Linguagem BNCC. 10 minutos por aluno.</div>
    <div style="background:white;border-radius:18px;padding:24px 44px;display:inline-block;margin-bottom:20px;">
      <div style="font-size:18px;color:#aaa;font-weight:600;text-decoration:line-through;margin-bottom:2px;">De R$197</div>
      <div style="font-size:52px;font-weight:900;color:#00b4ae;line-height:1;">R$97</div>
      <div style="font-size:16px;color:#666;margin-top:2px;">pagamento único · acesso vitalício</div>
    </div>
    <div style="font-size:20px;color:rgba(255,255,255,0.8);">👇 Link na bio</div>
  </div>
  <div style="flex-shrink:0;">${svgCelebra}</div>
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
    await new Promise(r => setTimeout(r, 400));
    // screenshot para preview
    await page.screenshot({ path: `C:\\Users\\Rodrigo Cruz\\Downloads\\v2-slide-${i+1}.png` });
    // pdf buffer
    const buf = await page.pdf({ width:'1080px', height:'1080px', printBackground:true, margin:{top:0,right:0,bottom:0,left:0} });
    pdfPages.push(buf);
    console.log(`Slide ${i+1}/6 ok`);
  }
  await browser.close();

  const merged = await PDFDocument.create();
  for (const buf of pdfPages) {
    const doc = await PDFDocument.load(buf);
    const [p] = await merged.copyPages(doc, [0]);
    merged.addPage(p);
  }
  fs.writeFileSync('C:\\Users\\Rodrigo Cruz\\Downloads\\carrossel-pareceres-v2.pdf', await merged.save());
  console.log('PDF v2 salvo!');
})();
