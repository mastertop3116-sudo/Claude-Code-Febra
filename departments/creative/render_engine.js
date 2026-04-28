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

const FONT_FILES = {
  Anton:            { reg: "Anton-Regular.ttf",              bold: "Anton-Regular.ttf" },
  Gagalin:          { reg: "Gagalin-Regular.otf",            bold: "Gagalin-Regular.otf" },
  BebasNeue:        { reg: "BebasNeue-Regular.ttf",          bold: "BebasNeue-Regular.ttf" },
  Oswald:           { reg: "BebasNeue-Regular.ttf",          bold: "BebasNeue-Regular.ttf" },
  Raleway:          { reg: "Raleway-Regular.ttf",            bold: "Raleway-Bold.ttf" },
  Montserrat:       { reg: "Poppins-Regular.ttf",            bold: "Poppins-SemiBold.ttf" },
  Poppins:          { reg: "Poppins-Regular.ttf",            bold: "Poppins-SemiBold.ttf" },
  Nunito:           { reg: "Nunito-Regular.ttf",             bold: "Nunito-Bold.ttf" },
  BreeSerif:        { reg: "BreeSerif-Regular.ttf",          bold: "BreeSerif-Regular.ttf" },
  Lora:             { reg: "Lora-Regular.ttf",               bold: "Lora-Bold.ttf" },
  PlayfairDisplay:  { reg: "Lora-Regular.ttf",               bold: "Lora-Bold.ttf" },
  LibreBaskerville: { reg: "Lora-Regular.ttf",               bold: "Lora-Bold.ttf" },
  GreatVibes:       { reg: "GreatVibes-Regular.ttf",         bold: "GreatVibes-Regular.ttf" },
  DancingScript:    { reg: "DancingScript-Regular.ttf",      bold: "DancingScript-Bold.ttf" },
};

// Cache by "fonteTitulo|fonteCorpo" key
const FONTS_CACHE = new Map();

function loadFontEntries(name, files) {
  const entries = [];
  const regPath = path.join(FONTS_DIR, files.reg);
  if (!fs.existsSync(regPath)) return entries;
  const regData = fs.readFileSync(regPath);
  entries.push({ name, data: regData, weight: 400, style: "normal" });
  if (files.bold === files.reg) {
    // Single-weight font: register as bold too so font-weight:600 resolves correctly
    entries.push({ name, data: regData, weight: 600, style: "normal" });
  } else {
    const boldPath = path.join(FONTS_DIR, files.bold);
    if (fs.existsSync(boldPath)) {
      entries.push({ name, data: fs.readFileSync(boldPath), weight: 600, style: "normal" });
    }
  }
  return entries;
}

function getFonts(fonteTitulo = "Anton", fonteCorpo = "Poppins") {
  const key = `${fonteTitulo}|${fonteCorpo}`;
  if (FONTS_CACHE.has(key)) return FONTS_CACHE.get(key);

  const list = [];

  // Poppins always loaded as UI fallback
  list.push(...loadFontEntries("Poppins", FONT_FILES.Poppins));

  // Title font (skip if it's Poppins, already loaded)
  if (fonteTitulo && fonteTitulo !== "Poppins" && FONT_FILES[fonteTitulo]) {
    list.push(...loadFontEntries(fonteTitulo, FONT_FILES[fonteTitulo]));
  }

  // Body font (skip if already loaded as Poppins or same as title)
  if (fonteCorpo && fonteCorpo !== "Poppins" && fonteCorpo !== fonteTitulo && FONT_FILES[fonteCorpo]) {
    list.push(...loadFontEntries(fonteCorpo, FONT_FILES[fonteCorpo]));
  }

  FONTS_CACHE.set(key, list);
  return list;
}

// Formatos e dimensões suportados
const FORMATOS = {
  instagram_feed:     [1080, 1080],
  instagram_feed_4x5: [1080, 1350],
  instagram_story:    [1080, 1920],
  linkedin:           [1200, 627],
  youtube_thumb:      [1280, 720],
};

// A4 @ 144dpi — qualidade de tela+impressão, embutido em PDFKit a 595×842pt
const A4_W = 1190;
const A4_H = 1684;

// Renderiza uma string HTML → Buffer PNG
async function renderSlide(htmlStr, w = 1080, h = 1080, fonts = null) {
  const vdom = html(htmlStr);
  const svg  = await satori(vdom, { width: w, height: h, fonts: fonts || getFonts() });
  const resvg = new Resvg(svg, { fitTo: { mode: "width", value: w } });
  return resvg.render().asPng();
}

// Renderiza capa A4 → Buffer PNG (1190×1684 @ 144dpi)
// config: { temaKey, titulo, subtitulo, autor, tagline, fonteTitulo, fonteCorpo }
async function renderCover(config = {}) {
  const { getCoverHTML } = require("./cover_templates");
  const fonteTitulo = config.fonteTitulo || "Anton";
  const fonteCorpo  = config.fonteCorpo  || "Poppins";
  const fonts = getFonts(fonteTitulo, fonteCorpo);
  const htmlStr = getCoverHTML({
    temaKey:   config.temaKey   || "produtividade",
    titulo:    config.titulo    || "",
    subtitulo: config.subtitulo || "",
    autor:     config.autor     || "Nexus Digital",
    tagline:   config.tagline   || "",
    fontTitle: fonteTitulo,
    fontBody:  fonteCorpo,
  });
  return renderSlide(htmlStr, A4_W, A4_H, fonts);
}

// Renderiza múltiplos slides em paralelo → array de Buffers PNG
// fontes: { fonteTitulo, fonteCorpo }
async function renderCarousel(slides, formato = "instagram_feed", fontes = {}) {
  const [w, h] = FORMATOS[formato] || [1080, 1080];
  const fonts  = getFonts(fontes.fonteTitulo || "Anton", fontes.fonteCorpo || "Poppins");
  return Promise.all(slides.map(s => renderSlide(s, w, h, fonts)));
}

module.exports = { renderSlide, renderCarousel, renderCover, FORMATOS };
