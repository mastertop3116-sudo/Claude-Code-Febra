// ============================================
// NEXUS — Render Engine
// HTML → SVG (satori) → PNG (resvg-js)
// Server-side, zero dependência de browser
// ============================================

const path = require("path");
const fs   = require("fs");

let satori, html, Resvg;
try {
  satori = require("satori").default;
  html   = require("satori-html").html;
  Resvg  = require("@resvg/resvg-js").Resvg;
} catch (e) {
  console.error("[Render Engine] Dependências não instaladas:", e.message);
}

const FONTS_DIR = path.join(__dirname, "../../assets/fonts");

// Fontes carregadas uma vez no escopo do módulo (não por request)
let FONTS = null;
function getFonts() {
  if (FONTS) return FONTS;
  FONTS = [
    {
      name: "Poppins",
      data: fs.readFileSync(path.join(FONTS_DIR, "Poppins-Regular.ttf")),
      weight: 400,
      style: "normal",
    },
    {
      name: "Poppins",
      data: fs.readFileSync(path.join(FONTS_DIR, "Poppins-SemiBold.ttf")),
      weight: 600,
      style: "normal",
    },
    {
      name: "Anton",
      data: fs.readFileSync(path.join(FONTS_DIR, "Anton-Regular.ttf")),
      weight: 400,
      style: "normal",
    },
  ];
  return FONTS;
}

// Formatos e dimensões suportados
const FORMATOS = {
  instagram_feed:     [1080, 1080],
  instagram_feed_4x5: [1080, 1350],
  instagram_story:    [1080, 1920],
  linkedin:           [1200, 627],
  youtube_thumb:      [1280, 720],
};

// Renderiza uma string HTML → Buffer PNG
async function renderSlide(htmlStr, w = 1080, h = 1080) {
  const vdom = html(htmlStr);
  const svg  = await satori(vdom, { width: w, height: h, fonts: getFonts() });
  const resvg = new Resvg(svg, { fitTo: { mode: "width", value: w } });
  return resvg.render().asPng();
}

// Renderiza múltiplos slides em paralelo → array de Buffers PNG
async function renderCarousel(slides, formato = "instagram_feed") {
  const [w, h] = FORMATOS[formato] || [1080, 1080];
  return Promise.all(slides.map(s => renderSlide(s, w, h)));
}

module.exports = { renderSlide, renderCarousel, FORMATOS };
