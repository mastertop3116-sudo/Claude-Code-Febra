// ============================================================
// NexusPDF Engine — Motor Universal de Renderização PDF
// Elementos fluem verticalmente (ctx.y auto-incrementa)
// Paleta: "primary" | "accent" | "light" | "text" | "subtle" | "#hex"
// ============================================================
const PDFDocument = require("pdfkit");
const path = require("path");
const fs   = require("fs");

const FONTS_DIR = path.join(__dirname, "../../assets/fonts");

const FONT_MAP = {
  regular : "Nunito",
  bold    : "Nunito-Bold",
  display : "Raleway-Bold",
  serif   : "Lora",
  "serif-bold": "Lora-Bold",
  script  : "DancingScript-Bold",
  mono    : "Poppins",
  "mono-bold": "Poppins-Bold",
};

function registerFonts(doc) {
  const reg = (name, file) => {
    const p = path.join(FONTS_DIR, file);
    if (fs.existsSync(p)) doc.registerFont(name, p);
  };
  reg("Nunito",            "Nunito-Regular.ttf");
  reg("Nunito-Bold",       "Nunito-Bold.ttf");
  reg("Raleway-Bold",      "Raleway-Bold.ttf");
  reg("Lora",              "Lora-Regular.ttf");
  reg("Lora-Bold",         "Lora-Bold.ttf");
  reg("DancingScript-Bold","DancingScript-Bold.ttf");
  reg("Poppins",           "Poppins-Regular.ttf");
  reg("Poppins-Bold",      "Poppins-SemiBold.ttf");
}

function col(val, palette) {
  if (!val) return "#212121";
  if (val.startsWith("#")) return val;
  return palette[val] || "#212121";
}

function font(weight) {
  return FONT_MAP[weight] || FONT_MAP.regular;
}

// ── RENDERERS ─────────────────────────────────────────────

function renderBand(doc, el, ctx) {
  const { W, M, palette } = ctx;
  const h = el.h || 80;
  doc.rect(0, ctx.y, W, h).fill(col(el.color || "primary", palette));
  if (el.text) {
    doc.fillColor("#fff").font(font("bold")).fontSize(el.textSize || 8)
      .text(el.text, M, ctx.y + 14, { width: W - M * 2, align: el.textAlign || "left", characterSpacing: el.spacing || 0 });
  }
  if (el.title) {
    const off = el.badgeOffset || 0;
    doc.fillColor("#fff").font(font(el.weight || "bold")).fontSize(el.titleSize || 20)
      .text(el.title, M + off, ctx.y + 35, { width: W - M * 2 - off });
  }
  ctx.y += h;
}

function renderSpacer(doc, el, ctx) {
  ctx.y += el.h || 20;
}

function renderDivider(doc, el, ctx) {
  const { W, palette } = ctx;
  const w = el.width || 200;
  const x = (W - w) / 2;
  doc.moveTo(x, ctx.y).lineTo(x + w, ctx.y)
    .lineWidth(el.thick || 1).strokeColor(col(el.color || "accent", palette)).stroke();
  ctx.y += (el.gap || 12);
}

function renderText(doc, el, ctx) {
  const { W, M, palette } = ctx;
  const c    = col(el.color || "text", palette);
  const f    = font(el.weight || (el.type === "heading" ? "display" : "regular"));
  const size = el.size || (el.type === "heading" ? 28 : el.type === "subheading" ? 16 : 10);
  const align = el.align || "left";
  const w = el.width || W - M * 2;
  doc.fillColor(c).font(f).fontSize(size);
  doc.text(el.content || "", M, ctx.y, {
    width: w, align,
    characterSpacing: el.spacing || 0,
    lineGap: el.lineGap || 2,
  });
  ctx.y += doc.currentLineHeight(true) + (el.gap || 8);
}

function renderBadge(doc, el, ctx) {
  const { W, palette } = ctx;
  const cx = el.cx || W / 2;
  const r  = el.r || 36;
  const cy = ctx.y + r + 6;
  doc.circle(cx, cy, r + 6).fill(col(el.accent || "accent", palette));
  doc.circle(cx, cy, r).fill(col(el.primary || "primary", palette));
  doc.fillColor("#fff").font(font("bold")).fontSize(el.fontSize || 14)
    .text(el.abbr || "?", cx - r, cy - 9, { width: r * 2, align: "center" });
  ctx.y += (r + 6) * 2 + (el.gap || 12);
}

function renderNameLine(doc, el, ctx) {
  const { W, palette } = ctx;
  const c = col(el.color || "primary", palette);
  const w = el.width || 400;
  const x = (W - w) / 2;
  doc.moveTo(x, ctx.y).lineTo(x + w, ctx.y)
    .lineWidth(el.thick || 1.5).strokeColor(c).stroke();
  if (el.hint) {
    doc.fillColor("#9E9E9E").font(font("regular")).fontSize(9)
      .text(el.hint, x, ctx.y + 4, { width: w, align: "center" });
    ctx.y += 20;
  }
  ctx.y += (el.gap || 16);
}

function renderPill(doc, el, ctx) {
  const { W, palette } = ctx;
  const c  = col(el.color || "accent", palette);
  const pw = el.width || 200;
  const ph = el.h || 22;
  const px = (W - pw) / 2;
  doc.roundedRect(px, ctx.y, pw, ph, ph / 2).fill(c);
  doc.fillColor(col(el.textColor || "text", palette)).font(font("bold")).fontSize(el.size || 8.5)
    .text(el.content || "", px, ctx.y + 6, { width: pw, align: "center" });
  ctx.y += ph + (el.gap || 10);
}

function renderBorder(doc, el, ctx) {
  const { W, H, palette } = ctx;
  const p = col(el.primary || "primary", palette);
  const a = col(el.accent  || "accent",  palette);
  doc.rect(12, 12, W - 24, H - 24).lineWidth(5).strokeColor(p).stroke();
  doc.rect(20, 20, W - 40, H - 40).lineWidth(1.5).strokeColor(a).stroke();
  const cs = 14;
  for (const [x, y] of [[12,12],[W-12-cs,12],[12,H-12-cs],[W-12-cs,H-12-cs]]) {
    doc.rect(x, y, cs, cs).fill(p);
    doc.rect(x+2, y+2, cs-4, cs-4).fill(a);
  }
  doc.rect(12, 12, W - 24, 5).fill(p);
  doc.rect(12, H - 17, W - 24, 5).fill(p);
}

function renderFields(doc, el, ctx) {
  const { M, W, palette } = ctx;
  const maxX = W - M;
  let x = M;
  for (const field of (el.items || [])) {
    if (x + (field.labelW || 70) >= maxX) break;
    const lw = field.labelW || 70;
    const availW = Math.min(field.w, maxX - x);
    doc.fillColor(col(el.labelColor || "text", palette)).font(font("bold")).fontSize(el.labelSize || 9)
      .text(field.label, x, ctx.y, { width: lw });
    const lx = x + lw + 4;
    const fw = availW - lw - 4;
    if (fw > 0) {
      doc.moveTo(lx, ctx.y + 11).lineTo(lx + fw, ctx.y + 11)
        .lineWidth(0.8).strokeColor(col(el.color || "subtle", palette)).stroke();
    }
    x += availW + (el.gap || 8);
  }
  ctx.y += (el.rowH || 22) + (el.vgap || 4);
}

function renderTable(doc, el, ctx) {
  const { M, palette } = ctx;
  const headerColor  = col(el.headerColor  || "primary", palette);
  const evenColor    = col(el.evenColor    || "light",   palette);
  const borderColor  = col(el.borderColor  || "subtle",  palette);
  const cols   = el.columns || [];
  const totalW = cols.reduce((s, c) => s + c.w, 0);
  const headerH = el.headerH || 26;
  const rowH    = el.rowH    || 20;
  const nRows   = el.rows    || 20;

  let cx = M;
  doc.rect(M, ctx.y, totalW, headerH).fill(headerColor);
  for (const c of cols) {
    doc.fillColor("#fff").font(font("bold")).fontSize(el.headerSize || 7.5)
      .text(c.label, cx + 3, ctx.y + (c.label.includes("\n") ? 5 : (headerH/2 - 5)),
        { width: c.w - 6, align: c.align || "center" });
    cx += c.w;
  }
  ctx.y += headerH;

  for (let r = 0; r < nRows; r++) {
    const bg = r % 2 === 0 ? evenColor : "#fff";
    doc.rect(M, ctx.y, totalW, rowH).fill(bg);
    doc.rect(M, ctx.y, totalW, rowH).lineWidth(0.3).strokeColor(borderColor).stroke();

    cx = M;
    for (const c of cols) {
      if (c.type === "number") {
        doc.fillColor("#616161").font(font("regular")).fontSize(8)
          .text(String(r + 1), cx, ctx.y + 6, { width: c.w, align: "center" });
      } else if (c.type === "checkbox_yn") {
        const bx = cx + c.w / 2 - 13;
        const by = ctx.y + rowH / 2 - 4.5;
        const bs = 9;
        doc.rect(bx, by, bs, bs).lineWidth(0.6).strokeColor(borderColor).stroke();
        doc.fillColor("#9E9E9E").font(font("regular")).fontSize(7).text("S", bx + bs + 2, by + 1);
        doc.rect(bx + 17, by, bs, bs).lineWidth(0.6).strokeColor(borderColor).stroke();
        doc.fillColor("#9E9E9E").font(font("regular")).fontSize(7).text("N", bx + bs + 19, by + 1);
      } else if (c.type === "checkbox_abc") {
        const opts = c.options || ["A","B","C"];
        for (let o = 0; o < opts.length; o++) {
          const bx = cx + 3 + o * 15;
          const by = ctx.y + rowH / 2 - 5;
          const lbl = opts[o].length > 2 ? opts[o][0].toUpperCase() : opts[o];
          doc.rect(bx, by, 10, 10).lineWidth(0.6).strokeColor(borderColor).stroke();
          doc.fillColor("#9E9E9E").font(font("regular")).fontSize(6).text(lbl, bx, by + 2, { width: 10, align: "center" });
        }
      }
      cx += c.w;
    }
    ctx.y += rowH;
  }
  ctx.y += (el.gap || 10);
}

function renderChecklist(doc, el, ctx) {
  const { M, W, palette } = ctx;
  const c = col(el.color || "primary", palette);
  for (const item of (el.items || [])) {
    const bs = 11;
    doc.roundedRect(M, ctx.y + 2, bs, bs, 2).lineWidth(0.7).strokeColor(c).stroke();
    doc.fillColor(col(el.textColor || "text", palette)).font(font("regular")).fontSize(el.size || 10)
      .text(item, M + 18, ctx.y + 1, { width: ctx.W - M * 2 - 18 - (el.rating ? 120 : 0) });
    if (el.rating) {
      const n = el.ratingCount || 5;
      for (let s = 0; s < n; s++) {
        doc.circle(W - M - n * 20 + s * 20 + 10, ctx.y + 7, 7).lineWidth(1).strokeColor(c).stroke();
      }
    }
    ctx.y += (el.itemH || 22);
  }
  ctx.y += (el.gap || 8);
}

function renderWriteLines(doc, el, ctx) {
  const { M, W, palette } = ctx;
  const c     = col(el.color || "subtle", palette);
  const count = el.count || 5;
  const gap   = el.gap   || 28;
  const w     = el.width || W - M * 2;
  for (let i = 0; i < count; i++) {
    doc.moveTo(M, ctx.y).lineTo(M + w, ctx.y)
      .lineWidth(el.thick || 0.6).strokeColor(c).stroke();
    ctx.y += gap;
  }
  ctx.y += (el.vgap || 8);
}

function renderDrawArea(doc, el, ctx) {
  const { M, W, H, palette } = ctx;
  const c      = col(el.color  || "light",   palette);
  const border = col(el.border || "primary", palette);
  const w = el.width || W - M * 2;
  const h = el.h || Math.max(60, H - ctx.y - 50);
  doc.roundedRect(M, ctx.y, w, h, el.radius || 8).fill(c);
  doc.roundedRect(M, ctx.y, w, h, el.radius || 8).lineWidth(1.5).strokeColor(border).stroke();
  if (el.hint) {
    doc.fillColor(border).font(font("regular")).fontSize(11).opacity(0.35)
      .text(el.hint, M, ctx.y + h / 2 - 10, { width: w, align: "center" });
    doc.opacity(1);
  }
  ctx.y += h + (el.gap || 10);
}

function renderStamps(doc, el, ctx) {
  const { W, palette } = ctx;
  const c     = col(el.color || "primary", palette);
  const light = col(el.light || "light",   palette);
  const count = el.count   || 5;
  const size  = el.size    || 74;
  const gap   = el.spacing || 14;
  const totalW = count * size + (count - 1) * gap;
  let sx = (W - totalW) / 2;
  for (let s = 0; s < count; s++) {
    doc.roundedRect(sx, ctx.y, size, size, 10).fill(light);
    doc.roundedRect(sx, ctx.y, size, size, 10).lineWidth(2).strokeColor(c).stroke();
    doc.circle(sx + size / 2, ctx.y + 16, 13).fill(c);
    doc.fillColor("#fff").font(font("bold")).fontSize(11)
      .text(String(s + 1), sx + size / 2 - 13, ctx.y + 10, { width: 26, align: "center" });
    doc.fillColor(c).font(font("regular")).fontSize(8)
      .text(el.label || "Missão", sx, ctx.y + size - 18, { width: size, align: "center" });
    sx += size + gap;
  }
  ctx.y += size + (el.gap || 16);
}

function renderCards(doc, el, ctx) {
  const { M, W, palette } = ctx;
  const CW   = W - M * 2;
  const cols  = el.cols  || 2;
  const cardH = el.cardH || 55;
  const cardW = (CW - (cols - 1) * 15) / cols;
  const items = el.items || [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const cx = M + (i % cols) * (cardW + 15);
    const cy = ctx.y + Math.floor(i / cols) * (cardH + 12);
    const c  = col(item.color || "primary", palette);
    doc.roundedRect(cx, cy, cardW, cardH, 8).fill(col(el.bgColor || "light", palette));
    doc.rect(cx, cy, 5, cardH).fill(c);
    doc.circle(cx + 22, cy + 16, 11).fill(c);
    doc.fillColor("#fff").font(font("bold")).fontSize(8)
      .text(item.abbr || "??", cx + 11, cy + 12, { width: 22, align: "center" });
    doc.fillColor(col("text", palette)).font(font("bold")).fontSize(9)
      .text(item.label, cx + 40, cy + 8, { width: cardW - 50 });
    doc.moveTo(cx + 14, cy + 36).lineTo(cx + cardW - 14, cy + 36).lineWidth(1).strokeColor(c).stroke();
    doc.fillColor("#9E9E9E").font(font("regular")).fontSize(8)
      .text(item.hint || "Preencher:", cx + 14, cy + 40, { width: cardW - 24 });
  }
  const rows = Math.ceil(items.length / cols);
  ctx.y += rows * (cardH + 12) + (el.gap || 14);
}

function renderSection(doc, el, ctx) {
  const { M, W, palette } = ctx;
  const c = col(el.color || "primary", palette);
  doc.circle(M + 8, ctx.y + 8, 6).fill(c);
  doc.fillColor(c).font(font("bold")).fontSize(el.size || 12)
    .text(el.content || el.label || "", M + 20, ctx.y + 1, { width: W - M * 2 - 20 });
  ctx.y += (el.h || 18) + (el.gap || 4);
}

function renderInfoBox(doc, el, ctx) {
  const { M, W, palette } = ctx;
  const c      = col(el.color  || "light",   palette);
  const border = col(el.border || "primary", palette);
  const h = el.h || 58;
  const w = el.width || W - M * 2;
  doc.roundedRect(M, ctx.y, w, h, el.radius || 8).fill(c);
  doc.roundedRect(M, ctx.y, w, h, el.radius || 8).lineWidth(1).strokeColor(border).stroke();
  const ox = el.icon ? M + 32 : M + 12;
  if (el.icon) {
    doc.circle(M + 15, ctx.y + 16, 9).fill(border);
    doc.fillColor("#fff").font(font("bold")).fontSize(9).text(el.icon, M + 11, ctx.y + 11, { width: 8, align: "center" });
  }
  if (el.label) {
    doc.fillColor(border).font(font("bold")).fontSize(el.labelSize || 10)
      .text(el.label, ox, ctx.y + 9, { width: w - ox + M - 10 });
  }
  if (el.content) {
    doc.fillColor(col("text", palette)).font(font("regular")).fontSize(el.contentSize || 10)
      .text(el.content, ox, ctx.y + (el.label ? 26 : 16), { width: w - ox + M - 10, lineGap: 1 });
  }
  ctx.y += h + (el.gap || 12);
}

function renderSignatures(doc, el, ctx) {
  const { W, palette } = ctx;
  const c     = col(el.color || "primary", palette);
  const items = el.items || [];
  const totalW = items.reduce((s, i) => s + i.w, 0) + (items.length - 1) * (el.gap || 20);
  let x = (W - totalW) / 2;
  for (const item of items) {
    doc.moveTo(x, ctx.y).lineTo(x + item.w, ctx.y).lineWidth(0.8).strokeColor(c).stroke();
    doc.fillColor("#9E9E9E").font(font("regular")).fontSize(8)
      .text(item.label, x, ctx.y + 3, { width: item.w, align: "center" });
    x += item.w + (el.gap || 20);
  }
  ctx.y += (el.h || 20) + (el.vgap || 10);
}

function renderStars(doc, el, ctx) {
  const { W, palette } = ctx;
  const c = col(el.color || "accent", palette);
  const n = el.count || 5;
  const r = el.r || 7;
  const totalW = n * (r * 2) + (n - 1) * 10;
  let sx = (W - totalW) / 2 + r;
  for (let i = 0; i < n; i++) {
    doc.circle(sx, ctx.y + r, r).fill(c);
    doc.circle(sx, ctx.y + r, r * 0.38).fill("#fff");
    sx += r * 2 + 10;
  }
  ctx.y += r * 2 + (el.gap || 12);
}

function renderDayGrid(doc, el, ctx) {
  const { M, W, palette } = ctx;
  const CW    = W - M * 2;
  const days  = el.days   || ["Segunda","Terça","Quarta","Quinta","Sexta"];
  const dayW  = CW / days.length;
  const dayH  = el.dayH  || 24;
  const c     = col(el.color   || "primary", palette);
  const evenBg = col(el.evenBg || "light",   palette);
  const subtle = col("subtle", palette);
  const fields = el.fields || [];
  const sectionH = fields.reduce((s, f) => s + f.h, 0) + 10;

  for (let d = 0; d < days.length; d++) {
    const dx = M + d * dayW;
    doc.rect(dx, ctx.y, dayW - 2, dayH).fill(c);
    doc.fillColor("#fff").font(font("bold")).fontSize(el.daySize || 10)
      .text(days[d], dx, ctx.y + 6, { width: dayW - 2, align: "center" });
  }
  ctx.y += dayH;

  for (let d = 0; d < days.length; d++) {
    const dx = M + d * dayW;
    doc.rect(dx, ctx.y, dayW - 2, sectionH).fill(d % 2 === 0 ? evenBg : "#fff");
    doc.rect(dx, ctx.y, dayW - 2, sectionH).lineWidth(0.5).strokeColor(subtle).stroke();
    let fy = ctx.y + 6;
    for (const field of fields) {
      doc.fillColor(c).font(font("bold")).fontSize(7)
        .text(field.label, dx + 4, fy, { width: dayW - 10, lineGap: 0 });
      const lineY = fy + field.h - 8;
      doc.moveTo(dx + 4, lineY).lineTo(dx + dayW - 6, lineY).lineWidth(0.5).strokeColor(subtle).stroke();
      if (field.h >= 42) {
        doc.moveTo(dx + 4, lineY - 16).lineTo(dx + dayW - 6, lineY - 16).lineWidth(0.3).strokeColor(subtle).stroke();
      }
      fy += field.h;
    }
  }
  ctx.y += sectionH + (el.gap || 14);
}

function renderFooter(doc, el, ctx) {
  const { M, W, H, palette } = ctx;
  doc.fillColor(col(el.color || "subtle", palette)).font(font("regular")).fontSize(el.size || 8)
    .text(el.content || "", M, H - (el.bottom || 30), { width: W - M * 2, align: el.align || "center" });
}

// ── DISPATCH ──────────────────────────────────────────────

const RENDERERS = {
  band       : renderBand,
  spacer     : renderSpacer,
  divider    : renderDivider,
  heading    : renderText,
  subheading : renderText,
  body       : renderText,
  label      : renderText,
  badge      : renderBadge,
  name_line  : renderNameLine,
  pill       : renderPill,
  border     : renderBorder,
  fields     : renderFields,
  table      : renderTable,
  checklist  : renderChecklist,
  writelines : renderWriteLines,
  drawarea   : renderDrawArea,
  stamps     : renderStamps,
  cards      : renderCards,
  section    : renderSection,
  infobox    : renderInfoBox,
  signatures : renderSignatures,
  stars      : renderStars,
  daygrid    : renderDayGrid,
  footer     : renderFooter,
};

// ── MAIN ──────────────────────────────────────────────────

async function render(config) {
  const isLandscape = (config.layout || "portrait") === "landscape";
  const doc = new PDFDocument({
    size: "A4",
    layout: isLandscape ? "landscape" : "portrait",
    margin: 0,
    autoFirstPage: false,
  });
  registerFonts(doc);

  const W = isLandscape ? 841.89 : 595.28;
  const H = isLandscape ? 595.28 : 841.89;
  const M = 36;

  const palette = {
    primary : "#1565C0",
    accent  : "#FFD740",
    light   : "#E3F2FD",
    text    : "#212121",
    subtle  : "#757575",
    white   : "#FFFFFF",
    ...config.palette,
  };

  for (const page of (config.pages || [])) {
    doc.addPage();
    doc.rect(0, 0, W, H).fill(page.background || "#FFFFFF");
    const ctx = { W, H, M, palette, y: M };
    for (const el of (page.elements || [])) {
      const renderer = RENDERERS[el.type];
      if (renderer) renderer(doc, el, ctx);
    }
  }

  return bufferFromDoc(doc);
}

function bufferFromDoc(doc) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    doc.on("data",  c => chunks.push(c));
    doc.on("end",   () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
    doc.end();
  });
}

module.exports = { render };
