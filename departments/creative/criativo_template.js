// ============================================
// NEXUS — Criativo Template
// Gera imagem PNG 1080px pronta para Meta Ads
// Satori HTML — inline styles apenas, flexbox only
// ============================================

const PALETAS = {
  impacto: {
    bg1: "#0D0D0D", bg2: "#1a0505",
    primary: "#E63946", accent: "#FF6B35",
    text: "#FFFFFF", textSec: "rgba(255,255,255,0.75)",
  },
  elegancia: {
    bg1: "#0F0A14", bg2: "#1A0F1E",
    primary: "#C9A84C", accent: "#C2798A",
    text: "#F5EEF8", textSec: "rgba(245,238,248,0.7)",
  },
  sabedoria: {
    bg1: "#0D0A05", bg2: "#1A1205",
    primary: "#DAA520", accent: "#8B4513",
    text: "#FDF6E3", textSec: "rgba(253,246,227,0.7)",
  },
  produtividade: {
    bg1: "#03070F", bg2: "#060C1A",
    primary: "#2979FF", accent: "#FF8F00",
    text: "#F0F4FF", textSec: "rgba(240,244,255,0.7)",
  },
  bemestar: {
    bg1: "#04090A", bg2: "#081410",
    primary: "#66BB6A", accent: "#F06292",
    text: "#F1F8E9", textSec: "rgba(241,248,233,0.7)",
  },
  criatividade: {
    bg1: "#07050F", bg2: "#0D0A18",
    primary: "#9C6FFF", accent: "#00E5FF",
    text: "#F5F0FF", textSec: "rgba(245,240,255,0.7)",
  },
};

function getPaleta(temaKey) {
  return PALETAS[temaKey] || PALETAS.impacto;
}

// Dimensões por formato
const DIMENSOES = {
  instagram_feed:     [1080, 1080],
  instagram_feed_4x5: [1080, 1350],
  instagram_story:    [1080, 1920],
  linkedin:           [1200, 627],
};

function getDimensoes(formato) {
  return DIMENSOES[formato] || [1080, 1080];
}

// Limita string para evitar overflow
function clamp(str, max) {
  const s = String(str || "");
  return s.length > max ? s.slice(0, max - 1) + "…" : s;
}

// ── Template principal: Meta Ad Creative ──
function criarCriativoHTML({ headline, sub, cta, marca, temaKey, formato }) {
  const P = getPaleta(temaKey);
  const [W, H] = getDimensoes(formato);

  const headlineLimpa = clamp(headline, 80);
  const subLimpa      = clamp(sub, 120);
  const ctaLimpo      = clamp(cta || "Clique aqui", 40);
  const marcaLimpa    = clamp(marca || "NEXUS", 24).toUpperCase();

  const isStory   = H > W;
  const isLandsc  = W > H;

  const headFontSize  = isStory ? 72 : isLandsc ? 52 : 68;
  const subFontSize   = isStory ? 34 : isLandsc ? 26 : 30;
  const paddingV      = isStory ? 100 : 80;
  const paddingH      = isStory ? 80  : 80;

  return `<div style="width:${W}px;height:${H}px;background:linear-gradient(145deg,${P.bg1},${P.bg2});display:flex;flex-direction:column;justify-content:space-between;padding:${paddingV}px ${paddingH}px;position:relative;overflow:hidden;">

  <!-- Faixa de acento topo -->
  <div style="position:absolute;top:0;left:0;right:0;height:8px;background:${P.primary};display:flex;"></div>

  <!-- Ruído visual superior direito -->
  <div style="position:absolute;top:-80px;right:-80px;width:400px;height:400px;border-radius:50%;background:radial-gradient(circle,${P.primary}22 0%,transparent 70%);display:flex;"></div>

  <!-- Ruído visual inferior esquerdo -->
  <div style="position:absolute;bottom:-60px;left:-60px;width:300px;height:300px;border-radius:50%;background:radial-gradient(circle,${P.accent}18 0%,transparent 70%);display:flex;"></div>

  <!-- Topo: marca -->
  <div style="display:flex;align-items:center;gap:14px;z-index:1;">
    <div style="width:8px;height:40px;background:${P.primary};border-radius:4px;display:flex;"></div>
    <span style="font-family:Anton,sans-serif;font-size:22px;color:${P.primary};letter-spacing:3px;">${marcaLimpa}</span>
  </div>

  <!-- Centro: headline + sub -->
  <div style="display:flex;flex-direction:column;gap:${isStory ? 32 : 24}px;z-index:1;flex:1;justify-content:center;">
    <!-- Linha accent antes da headline -->
    <div style="width:80px;height:4px;background:${P.primary};border-radius:2px;display:flex;"></div>

    <!-- Headline principal -->
    <div style="font-family:Anton,sans-serif;font-size:${headFontSize}px;color:${P.text};line-height:1.1;letter-spacing:-1px;max-width:${W - paddingH * 2}px;display:flex;flex-wrap:wrap;">${headlineLimpa}</div>

    <!-- Sub-headline -->
    ${subLimpa ? `<div style="font-family:Poppins,sans-serif;font-size:${subFontSize}px;color:${P.textSec};line-height:1.45;max-width:${Math.round((W - paddingH * 2) * 0.85)}px;display:flex;flex-wrap:wrap;">${subLimpa}</div>` : ''}
  </div>

  <!-- Rodapé: CTA button -->
  <div style="display:flex;align-items:center;justify-content:space-between;z-index:1;">
    <div style="background:${P.primary};border-radius:14px;padding:18px 40px;display:flex;align-items:center;">
      <span style="font-family:Anton,sans-serif;font-size:${isStory ? 30 : 26}px;color:#FFFFFF;letter-spacing:1px;">${ctaLimpo.toUpperCase()}</span>
    </div>

    <!-- Seta decorativa -->
    <div style="width:56px;height:56px;border-radius:50%;border:2px solid ${P.primary}60;display:flex;align-items:center;justify-content:center;">
      <div style="font-family:Anton,sans-serif;font-size:28px;color:${P.primary};display:flex;">→</div>
    </div>
  </div>

  <!-- Faixa de acento rodapé -->
  <div style="position:absolute;bottom:0;left:0;right:0;height:4px;background:${P.accent};display:flex;"></div>
</div>`;
}

module.exports = { criarCriativoHTML, getDimensoes, DIMENSOES };
