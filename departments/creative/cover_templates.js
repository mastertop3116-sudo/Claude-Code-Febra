// ============================================
// NEXUS — Cover Templates (satori / A4)
// 3 layouts × 6 temas → PNG embutido no PDF
// Renderiza em 1190 × 1684 px (A4 @ 144dpi)
// ============================================

const PALETAS = {
  impacto: {
    bg: "#0D0D0D", primary: "#E63946", accent: "#FF6B35",
    text: "#F5F5F5", textSec: "rgba(245,245,245,0.6)",
  },
  elegancia: {
    bg: "#100B10", primary: "#C9A84C", accent: "#C2798A",
    text: "#F5EEF8", textSec: "rgba(245,238,248,0.58)",
  },
  sabedoria: {
    bg: "#0E0A03", primary: "#DAA520", accent: "#8B4513",
    text: "#FDF6E3", textSec: "rgba(253,246,227,0.58)",
  },
  produtividade: {
    bg: "#040810", primary: "#2979FF", accent: "#FF8F00",
    text: "#F0F4FF", textSec: "rgba(240,244,255,0.6)",
  },
  bemestar: {
    bg: "#060E06", primary: "#66BB6A", accent: "#F06292",
    text: "#F1F8E9", textSec: "rgba(241,248,233,0.6)",
  },
  criatividade: {
    bg: "#08061A", primary: "#9C6FFF", accent: "#00E5FF",
    text: "#F5F0FF", textSec: "rgba(245,240,255,0.6)",
  },
};

const LAYOUT_MAP = {
  impacto:       "geometric",
  elegancia:     "minimal",
  sabedoria:     "minimal",
  produtividade: "geometric",
  bemestar:      "hero",
  criatividade:  "hero",
};

function P(temaKey) {
  return PALETAS[temaKey] || PALETAS.produtividade;
}

// ── Layout MINIMAL — elegância, sabedoria ─────────────────────────
// Barra vertical esquerda · título no centro · rodapé com linha
function coverMinimal({ titulo, subtitulo, autor, tagline, temaKey, fontTitle, fontBody }) {
  const c = P(temaKey);
  const t = String(titulo  || "").slice(0, 80);
  const s = String(subtitulo || "").slice(0, 180);
  const a = String(autor   || "Nexus Digital").toUpperCase();
  const g = String(tagline || "").toUpperCase().slice(0, 70);

  return `<div style="width:100%;height:100%;background:${c.bg};display:flex;flex-direction:column;padding:144px 160px 120px;position:relative;">

  <!-- Barra vertical esquerda -->
  <div style="position:absolute;top:0;left:0;bottom:0;width:8px;background:${c.primary};display:flex;"></div>

  <!-- Espaço superior -->
  <div style="flex:1.2;display:flex;"></div>

  <!-- Bloco título -->
  <div style="display:flex;flex-direction:column;">
    <div style="width:88px;height:6px;background:${c.primary};margin-bottom:40px;display:flex;"></div>
    <h1 style="font-family:${fontTitle};font-size:108px;font-weight:400;color:${c.text};line-height:1.06;margin:0;letter-spacing:2px;">${t}</h1>
    <div style="width:120px;height:2px;background:${c.accent};opacity:0.5;margin-top:44px;margin-bottom:30px;display:flex;"></div>
    ${s ? `<p style="font-family:${fontBody};font-size:30px;font-weight:400;color:${c.textSec};line-height:1.6;margin:0;max-width:760px;">${s}</p>` : ""}
  </div>

  <!-- Espaço inferior -->
  <div style="flex:1.5;display:flex;"></div>

  <!-- Rodapé -->
  <div style="display:flex;justify-content:space-between;align-items:center;border-top:1px solid rgba(255,255,255,.1);padding-top:36px;">
    <span style="font-family:${fontBody};font-size:22px;font-weight:600;color:${c.primary};letter-spacing:4px;">${a}</span>
    ${g ? `<span style="font-family:${fontBody};font-size:20px;color:${c.textSec};letter-spacing:2px;">${g}</span>` : ""}
  </div>

</div>`;
}

// ── Layout GEOMETRIC — impacto, produtividade ─────────────────────
// Faixa accent topo · título grande upper · bloco cor inferior
function coverGeometric({ titulo, subtitulo, autor, tagline, temaKey, fontTitle, fontBody }) {
  const c = P(temaKey);
  const t = String(titulo  || "").slice(0, 80);
  const s = String(subtitulo || "").slice(0, 180);
  const a = String(autor   || "Nexus Digital").toUpperCase();
  const g = String(tagline || "").toUpperCase().slice(0, 70);

  return `<div style="width:100%;height:100%;background:${c.bg};display:flex;flex-direction:column;position:relative;">

  <!-- Faixa accent topo -->
  <div style="width:100%;height:12px;background:${c.primary};display:flex;flex-shrink:0;"></div>

  <!-- Retângulo decorativo canto superior direito -->
  <div style="position:absolute;top:80px;right:0;width:240px;height:420px;background:${c.primary};opacity:0.07;display:flex;"></div>
  <div style="position:absolute;top:80px;right:0;width:6px;height:420px;background:${c.primary};opacity:0.35;display:flex;"></div>

  <!-- Área de conteúdo: título centralizado verticalmente -->
  <div style="flex:1;display:flex;flex-direction:column;justify-content:center;padding:80px 144px;">
    <h1 style="font-family:${fontTitle};font-size:116px;font-weight:400;color:${c.text};line-height:1.04;margin:0;letter-spacing:3px;max-width:900px;">${t}</h1>
    <div style="width:160px;height:8px;background:${c.primary};margin-top:48px;display:flex;"></div>
    ${s ? `<p style="font-family:${fontBody};font-size:30px;font-weight:400;color:${c.textSec};line-height:1.6;margin:40px 0 0;max-width:720px;">${s}</p>` : ""}
  </div>

  <!-- Bloco inferior colorido -->
  <div style="background:${c.primary};padding:64px 144px;display:flex;justify-content:space-between;align-items:center;flex-shrink:0;">
    <div style="display:flex;flex-direction:column;gap:10px;">
      <span style="font-family:${fontTitle};font-size:28px;font-weight:400;color:${c.bg};letter-spacing:5px;">${a}</span>
      ${g ? `<span style="font-family:${fontBody};font-size:20px;color:${c.bg};opacity:0.65;letter-spacing:2px;">${g}</span>` : ""}
    </div>
    <!-- Círculo decorativo -->
    <div style="width:72px;height:72px;border-radius:50%;background:rgba(0,0,0,0.18);display:flex;align-items:center;justify-content:center;">
      <div style="width:36px;height:36px;border-radius:50%;background:${c.bg};opacity:0.6;display:flex;"></div>
    </div>
  </div>

</div>`;
}

// ── Layout HERO — bemestar, criatividade ──────────────────────────
// Fundo escuro · blobs de cor · conteúdo centralizado + badge
function coverHero({ titulo, subtitulo, autor, tagline, temaKey, fontTitle, fontBody }) {
  const c = P(temaKey);
  const t = String(titulo  || "").slice(0, 80);
  const s = String(subtitulo || "").slice(0, 180);
  const a = String(autor   || "Nexus Digital").toUpperCase();
  const g = String(tagline || "").toUpperCase().slice(0, 70);

  return `<div style="width:100%;height:100%;background:${c.bg};display:flex;flex-direction:column;justify-content:center;align-items:center;padding:160px;position:relative;">

  <!-- Blob 1 topo-direita -->
  <div style="position:absolute;top:-120px;right:-120px;width:700px;height:700px;border-radius:50%;background:${c.primary};opacity:0.10;display:flex;"></div>

  <!-- Blob 2 inferior-esquerda -->
  <div style="position:absolute;bottom:-100px;left:-100px;width:540px;height:540px;border-radius:50%;background:${c.accent};opacity:0.07;display:flex;"></div>

  <!-- Anel decorativo topo-direita (menor) -->
  <div style="position:absolute;top:100px;right:100px;width:180px;height:180px;border-radius:50%;border:2px solid ${c.primary};opacity:0.18;display:flex;"></div>

  <!-- Conteúdo centralizado -->
  <div style="display:flex;flex-direction:column;align-items:center;gap:36px;">

    <!-- Badge nicho -->
    ${g ? `<div style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:200px;padding:16px 40px;display:flex;">
      <span style="font-family:${fontBody};font-size:20px;color:${c.primary};letter-spacing:4px;">${g}</span>
    </div>` : ""}

    <!-- Título -->
    <h1 style="font-family:${fontTitle};font-size:112px;font-weight:400;color:${c.text};text-align:center;line-height:1.08;margin:0;max-width:900px;">${t}</h1>

    <!-- Divisor -->
    <div style="width:80px;height:4px;background:${c.primary};display:flex;"></div>

    <!-- Subtítulo -->
    ${s ? `<p style="font-family:${fontBody};font-size:28px;font-weight:400;color:${c.textSec};text-align:center;line-height:1.65;margin:0;max-width:740px;">${s}</p>` : ""}

    <!-- Autor -->
    <span style="font-family:${fontBody};font-size:22px;font-weight:600;color:${c.textSec};letter-spacing:4px;margin-top:8px;">${a}</span>

  </div>

  <!-- Linha accent inferior -->
  <div style="position:absolute;bottom:0;left:0;right:0;height:6px;background:${c.primary};display:flex;"></div>

</div>`;
}

// ── Dispatcher ────────────────────────────────────────────────────
function getCoverHTML(config) {
  const defaults = { fontTitle: "Anton", fontBody: "Poppins" };
  const cfg = { ...defaults, ...config };
  const layout = LAYOUT_MAP[cfg.temaKey] || "geometric";
  const fn = { minimal: coverMinimal, geometric: coverGeometric, hero: coverHero };
  return fn[layout](cfg);
}

module.exports = { getCoverHTML };
