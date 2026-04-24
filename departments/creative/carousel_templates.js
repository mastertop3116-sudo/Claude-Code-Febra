// ============================================
// NEXUS — Carousel Templates
// Slides HTML prontos para satori (inline styles, flexbox only)
// Paletas derivadas dos 6 temas do Nexus
// ============================================

// Paleta de cores por tema — mapeia temaKey → cores do slide
const PALETAS = {
  impacto: {
    bg:       "#0D0D0D",
    bgCard:   "#1A1A1A",
    primary:  "#E63946",
    accent:   "#FF6B35",
    text:     "#F5F5F5",
    textSec:  "rgba(245,245,245,0.65)",
    num:      "#E63946",
  },
  elegancia: {
    bg:       "#1A0F18",
    bgCard:   "#241525",
    primary:  "#C9A84C",
    accent:   "#C2798A",
    text:     "#F5EEF8",
    textSec:  "rgba(245,238,248,0.65)",
    num:      "#C9A84C",
  },
  sabedoria: {
    bg:       "#1A1005",
    bgCard:   "#261A08",
    primary:  "#DAA520",
    accent:   "#8B4513",
    text:     "#FDF6E3",
    textSec:  "rgba(253,246,227,0.65)",
    num:      "#DAA520",
  },
  produtividade: {
    bg:       "#060C1A",
    bgCard:   "#0D1A2E",
    primary:  "#2979FF",
    accent:   "#FF8F00",
    text:     "#F0F4FF",
    textSec:  "rgba(240,244,255,0.65)",
    num:      "#2979FF",
  },
  bemestar: {
    bg:       "#0A140A",
    bgCard:   "#101E10",
    primary:  "#66BB6A",
    accent:   "#F06292",
    text:     "#F1F8E9",
    textSec:  "rgba(241,248,233,0.65)",
    num:      "#66BB6A",
  },
  criatividade: {
    bg:       "#0D0A18",
    bgCard:   "#180F2A",
    primary:  "#9C6FFF",
    accent:   "#00E5FF",
    text:     "#F5F0FF",
    textSec:  "rgba(245,240,255,0.65)",
    num:      "#9C6FFF",
  },
};

function getPaleta(temaKey) {
  return PALETAS[temaKey] || PALETAS.produtividade;
}

// ── Slide 0: CAPA ──────────────────────────────────
function slideCapa({ titulo, subtitulo, autor, temaKey, badge }) {
  const P = getPaleta(temaKey);
  const tituloLimpo = String(titulo || "").slice(0, 80);
  const subLimpo    = String(subtitulo || "").slice(0, 100);
  const autorLimpo  = String(autor || "Nexus Digital").toUpperCase();
  const badgeLimpo  = String(badge || "").slice(0, 40);

  return `<div style="width:100%;height:100%;background:${P.bg};display:flex;flex-direction:column;justify-content:space-between;padding:72px 64px;position:relative;">
  <!-- Linha accent topo -->
  <div style="position:absolute;top:0;left:0;right:0;height:6px;background:${P.primary};display:flex;"></div>

  <!-- Topo: badge nicho -->
  <div style="display:flex;align-items:center;gap:12px;">
    <div style="width:32px;height:2px;background:${P.primary};display:flex;"></div>
    <span style="font-family:Poppins;font-size:18px;font-weight:600;color:${P.primary};letter-spacing:2px;text-transform:uppercase;">${badgeLimpo || "Conteúdo Exclusivo"}</span>
  </div>

  <!-- Centro: título principal -->
  <div style="display:flex;flex-direction:column;gap:24px;">
    <h1 style="font-family:Anton;font-size:72px;font-weight:400;color:${P.text};line-height:1.1;margin:0;letter-spacing:1px;">${tituloLimpo}</h1>
    <div style="width:64px;height:4px;background:${P.accent};display:flex;"></div>
    <p style="font-family:Poppins;font-size:26px;font-weight:400;color:${P.textSec};line-height:1.5;margin:0;">${subLimpo}</p>
  </div>

  <!-- Rodapé: autor + instrução -->
  <div style="display:flex;justify-content:space-between;align-items:flex-end;">
    <span style="font-family:Poppins;font-size:20px;font-weight:600;color:${P.accent};letter-spacing:1.5px;">${autorLimpo}</span>
    <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px;">
      <span style="font-family:Poppins;font-size:16px;color:${P.textSec};">Deslize para ver →</span>
    </div>
  </div>
</div>`;
}

// ── Slide de CONTEÚDO (seções numeradas) ──────────────
function slideConteudo({ titulo, corpo, destaques, numero, total, temaKey }) {
  const P      = getPaleta(temaKey);
  const numStr = String(numero).padStart(2, "0");
  const titLimpo = String(titulo || "").slice(0, 60);

  // Pega até 3 destaques, sanitiza e limita tamanho
  const items = (destaques || [])
    .slice(0, 3)
    .map(d => String(d).replace(/^(FATO\/DADO|FATO|DADO|VERSÍCULO|CHAVE DE ATIVAÇÃO|TREINO DO DIA \d+|Habilidades formadas)\s*:\s*/i, "").slice(0, 120));

  const corpoCurto = String(corpo || "").split(";")[0].replace(/^(FUNDAMENTO|APLICAÇÃO|PROGRESSÃO)\s*:\s*/i, "").trim().slice(0, 160);

  return `<div style="width:100%;height:100%;background:${P.bg};display:flex;flex-direction:column;padding:64px;position:relative;">
  <!-- Linha accent topo -->
  <div style="position:absolute;top:0;left:0;right:0;height:5px;background:${P.primary};display:flex;"></div>

  <!-- Número grande decorativo -->
  <span style="font-family:Anton;font-size:96px;font-weight:400;color:${P.num};opacity:0.18;line-height:1;margin-bottom:-16px;">${numStr}</span>

  <!-- Título da seção -->
  <h2 style="font-family:Anton;font-size:52px;font-weight:400;color:${P.text};line-height:1.15;margin:0 0 20px 0;">${titLimpo}</h2>

  <!-- Linha separadora -->
  <div style="width:48px;height:3px;background:${P.accent};margin-bottom:28px;display:flex;"></div>

  <!-- Corpo resumido -->
  ${corpoCurto ? `<p style="font-family:Poppins;font-size:22px;font-weight:400;color:${P.textSec};line-height:1.55;margin:0 0 32px 0;">${corpoCurto}</p>` : ""}

  <!-- Destaques como bullets -->
  <div style="display:flex;flex-direction:column;gap:16px;flex:1;">
    ${items.map(item => `
    <div style="display:flex;align-items:flex-start;gap:14px;">
      <div style="width:8px;height:8px;background:${P.primary};border-radius:50%;margin-top:8px;flex-shrink:0;display:flex;"></div>
      <span style="font-family:Poppins;font-size:21px;font-weight:400;color:${P.text};line-height:1.45;">${item}</span>
    </div>`).join("")}
  </div>

  <!-- Contador de slides -->
  <div style="display:flex;justify-content:flex-end;margin-top:24px;">
    <span style="font-family:Poppins;font-size:16px;color:${P.textSec};">${numero}/${total}</span>
  </div>
</div>`;
}

// ── Slide de DESTAQUE (frase de impacto) ──────────────
function slideDestaque({ frase, autor, temaKey }) {
  const P = getPaleta(temaKey);
  const fraseLimpa = String(frase || "").slice(0, 200);
  const autorLimpo = String(autor || "").toUpperCase();

  return `<div style="width:100%;height:100%;background:${P.primary};display:flex;flex-direction:column;justify-content:center;align-items:center;padding:80px;position:relative;">
  <!-- Aspas decorativas -->
  <span style="font-family:Anton;font-size:180px;font-weight:400;color:rgba(0,0,0,0.15);line-height:0.8;position:absolute;top:40px;left:48px;">"</span>

  <div style="display:flex;flex-direction:column;align-items:center;gap:32px;z-index:1;">
    <p style="font-family:Anton;font-size:54px;font-weight:400;color:#FFFFFF;text-align:center;line-height:1.25;margin:0;">${fraseLimpa}</p>
    <div style="width:64px;height:3px;background:rgba(255,255,255,0.5);display:flex;"></div>
    <span style="font-family:Poppins;font-size:20px;font-weight:600;color:rgba(255,255,255,0.85);letter-spacing:2px;">${autorLimpo}</span>
  </div>
</div>`;
}

// ── Slide final: CTA ──────────────────────────────────
function slideCTA({ titulo, instrucao, autor, temaKey }) {
  const P = getPaleta(temaKey);
  const titLimpo  = String(titulo || "Gostou do conteúdo?").slice(0, 80);
  const instrLimpo = String(instrucao || "Salve para não perder e compartilhe com quem precisa!").slice(0, 120);
  const autorLimpo = String(autor || "Nexus Digital").toUpperCase();

  return `<div style="width:100%;height:100%;background:${P.bg};display:flex;flex-direction:column;justify-content:center;align-items:center;padding:72px 64px;position:relative;">
  <!-- Linha accent topo -->
  <div style="position:absolute;top:0;left:0;right:0;height:5px;background:${P.primary};display:flex;"></div>
  <!-- Linha accent baixo -->
  <div style="position:absolute;bottom:0;left:0;right:0;height:5px;background:${P.accent};display:flex;"></div>

  <!-- Ícone seta circular decorativo -->
  <div style="width:80px;height:80px;border-radius:50%;border:3px solid ${P.primary};display:flex;justify-content:center;align-items:center;margin-bottom:40px;">
    <span style="font-family:Poppins;font-size:36px;color:${P.primary};">↑</span>
  </div>

  <h2 style="font-family:Anton;font-size:58px;font-weight:400;color:${P.text};text-align:center;line-height:1.2;margin:0 0 24px 0;">${titLimpo}</h2>

  <div style="width:56px;height:3px;background:${P.accent};margin-bottom:32px;display:flex;"></div>

  <p style="font-family:Poppins;font-size:24px;font-weight:400;color:${P.textSec};text-align:center;line-height:1.5;margin:0 0 48px 0;">${instrLimpo}</p>

  <!-- Ações sugeridas -->
  <div style="display:flex;gap:32px;">
    ${["💾 Salvar", "🔁 Compartilhar", "👆 Seguir"].map(a => `
    <div style="display:flex;flex-direction:column;align-items:center;gap:8px;">
      <span style="font-family:Poppins;font-size:22px;color:${P.text};">${a}</span>
    </div>`).join("")}
  </div>

  <span style="font-family:Poppins;font-size:18px;font-weight:600;color:${P.accent};letter-spacing:2px;margin-top:48px;">${autorLimpo}</span>
</div>`;
}

module.exports = { slideCapa, slideConteudo, slideDestaque, slideCTA, getPaleta };
