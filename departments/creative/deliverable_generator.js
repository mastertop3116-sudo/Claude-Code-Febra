// ============================================
// NEXUS — Gerador de Entregáveis em PDF/Word
// Powered by Gemini (conteúdo) + PDFKit (layout)
// ============================================

const PDFDocument = require("pdfkit");
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, Header, Footer, PageNumber,
  BorderStyle, WidthType, ShadingType, LevelFormat,
  PageBreak, TableOfContents, ImageRun,
} = require("docx");
const { geminiJson, geminiFlash, geminiImage } = require("../../integrations/gemini");
const { gerarConteudoRico } = require("./content_specialist");
const THEMES = require("./themes");
const { revisarCapaVisual, revisarConteudo } = require("./design_reviewer");
const path = require("path");
const fs   = require("fs");

const estrategista = require("../../agents/estrategista");
const arquiteto    = require("../../agents/arquiteto");
const copywriter   = require("../../agents/copywriter");
const capaAgent    = require("../../agents/capa");
const carrosselAgent = require("../../agents/carrossel");

const MAX_TENTATIVAS = 3;

const FONTS_DIR = path.join(__dirname, "../../assets/fonts");
const FONT_FILES = {
  Anton:            { reg: "Anton-Regular.ttf",              bold: "Anton-Regular.ttf" },
  Gagalin:          { reg: "Gagalin-Regular.otf",            bold: "Gagalin-Regular.otf" },
  BebasNeue:        { reg: "BebasNeue-Regular.ttf",          bold: "BebasNeue-Regular.ttf" },
  Oswald:           { reg: "Oswald-variable.ttf",            bold: "Oswald-variable.ttf" },
  Raleway:          { reg: "Raleway-Regular.ttf",            bold: "Raleway-Bold.ttf" },
  Montserrat:       { reg: "Montserrat-variable.ttf",        bold: "Montserrat-variable.ttf" },
  Poppins:          { reg: "Poppins-Regular.ttf",            bold: "Poppins-SemiBold.ttf" },
  Nunito:           { reg: "Nunito-Regular.ttf",             bold: "Nunito-Bold.ttf" },
  BreeSerif:        { reg: "BreeSerif-Regular.ttf",          bold: "BreeSerif-Regular.ttf" },
  Lora:             { reg: "Lora-Regular.ttf",               bold: "Lora-Bold.ttf" },
  PlayfairDisplay:  { reg: "PlayfairDisplay-variable.ttf",   bold: "PlayfairDisplay-variable.ttf" },
  LibreBaskerville: { reg: "LibreBaskerville-variable.ttf",  bold: "LibreBaskerville-variable.ttf" },
  GreatVibes:       { reg: "GreatVibes-Regular.ttf",         bold: "GreatVibes-Regular.ttf" },
  DancingScript:    { reg: "DancingScript-Regular.ttf",      bold: "DancingScript-Bold.ttf" },
};

// ──────────────────────────────────────────
// Extrai paleta de cores dominantes da imagem
// ──────────────────────────────────────────
async function extrairCoresDaImagem(imageBuffer) {
  try {
    const Vibrant = require("node-vibrant");
    const palette = await Vibrant.from(imageBuffer).getPalette();
    const hex = (s) => s ? (s.hex || "#000000") : null;

    const vibrant    = hex(palette.Vibrant);
    const dark       = hex(palette.DarkVibrant);
    const light      = hex(palette.LightVibrant);
    const darkMuted  = hex(palette.DarkMuted);

    return {
      primary:    vibrant   || "#E63946",
      secondary:  dark      || "#1D1D1D",
      accent:     light     || vibrant  || "#FF6B35",
      background: "#FFFFFF",
      text:       "#1A1A1A",
      coverBg:    darkMuted || dark     || "#1D1D1D",
      coverText:  "#FFFFFF",
      coverAccent: vibrant  || "#E63946",
    };
  } catch (e) {
    console.warn("[Creative] Extração de cores falhou:", e.message);
    return null;
  }
}

// ──────────────────────────────────────────
// Sanitiza e parseia JSON de forma robusta
// ──────────────────────────────────────────
function sanitizeAndParse(raw) {
  let text = raw.trim();

  // Remove blocos de markdown ```json ... ```
  text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "");

  // Extrai o bloco { ... } mais externo
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("Nenhum bloco JSON encontrado na resposta");
  text = text.slice(start, end + 1);

  // Remove caracteres de controle inválidos em JSON (exceto \n \r \t)
  text = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

  return JSON.parse(text);
}

// ──────────────────────────────────────────
// Gera capa com Nano Banana (gemini-2.5-flash-image)
// Prompt contextualizado por tema + tipo + título
// ──────────────────────────────────────────
const TEMA_VISUAL_PROMPTS = {
  impacto:      "bold dramatic sports energy, deep black and vivid red, strong geometric shapes, martial arts or athletics silhouette, powerful composition",
  elegancia:    "elegant feminine grace, soft rose pink and deep purple palette, ballet dancer silhouette, delicate floral elements, luxurious feel",
  sabedoria:    "spiritual sacred atmosphere, warm golden and deep brown tones, ancient book or cross motif, soft candle light, reverent calm",
  produtividade:"clean modern corporate, deep blue and white, geometric minimal design, professional executive aesthetic",
  bemestar:     "serene natural wellness, lush green and soft white, leaves or nature elements, calm light, organic texture",
  criatividade: "vibrant creative digital, deep purple and electric cyan, abstract geometric shapes, innovative modern design",
};

async function gerarCapaComGemini(tipo, titulo, descricao, temaKey, melhoriaHint = null) {
  const temaDesc = TEMA_VISUAL_PROMPTS[temaKey] || TEMA_VISUAL_PROMPTS.produtividade;
  const tipoLabel = { ebook: "ebook", checklist: "checklist guide", workbook: "workbook",
    planner: "planner", script_vsl: "video script guide", cheat_sheet: "quick reference card",
    certificado: "certificate" }[tipo] || "digital guide";

  const prompt = `Create a stunning professional ${tipoLabel} PDF cover image.
Title concept: "${titulo}"
Subject: ${descricao || titulo}
Visual style: ${temaDesc}
Requirements:
- Portrait A4 format, full bleed, no white borders
- NO text, numbers, or letters anywhere in the image
- Professional quality suitable for a Brazilian digital product market
- Rich, deep colors with strong contrast
- Cinematic lighting and depth${melhoriaHint ? `\nIMPROVEMENT REQUIRED: ${melhoriaHint}` : ""}`;

  try {
    const { buffer } = await geminiImage(prompt);
    console.log(`[Nano Banana] Capa gerada para "${titulo}": ${(buffer.length / 1024).toFixed(0)}KB`);
    return buffer;
  } catch (e) {
    console.warn("[Nano Banana] Geração de capa falhou:", e.message);
    return null;
  }
}

// ──────────────────────────────────────────
// Geração de conteúdo via Gemini (com retries)
// ──────────────────────────────────────────
async function gerarConteudo(tipo, titulo, descricao, paginas = 10) {
  const tipoMap = {
    ebook: "ebook/guia completo",
    workbook: "workbook/caderno de exercícios",
    checklist: "checklist/lista de verificação",
    planner: "planner/organizador",
    script_vsl: "script de VSL (vídeo de vendas)",
    cheat_sheet: "guia de consulta rápida",
    certificado: "certificado de conclusão",
  };

  const numSecoes = Math.min(Math.max(3, Math.round(paginas / 2)), 8);

  // Prompt defensivo: strings curtas e sem caracteres especiais
  const prompt = `Crie conteúdo para um ${tipoMap[tipo] || tipo} chamado "${titulo}".
Nicho: ${descricao}
Número de seções: ${numSecoes}

REGRAS OBRIGATÓRIAS:
- Retorne APENAS JSON válido, sem markdown, sem texto antes ou depois
- Strings não podem conter aspas duplas internas — use aspas simples se necessário
- Não use quebras de linha dentro de valores de string — use ponto e vírgula para separar ideias
- Cada string deve ter no máximo 500 caracteres

JSON com exatamente esta estrutura:
{
  "capa": {
    "titulo": "titulo aqui",
    "subtitulo": "subtitulo aqui",
    "tagline": "frase de impacto"
  },
  "introducao": "texto corrido sem quebras de linha",
  "secoes": [
    {
      "titulo": "nome da secao",
      "conteudo": "conteudo da secao sem quebras de linha",
      "destaques": ["destaque 1", "destaque 2", "destaque 3"]
    }
  ],
  "conclusao": "texto de conclusao com call-to-action",
  "sobre_autor": "texto sobre o autor"
}

Idioma: português brasileiro. Tom: direto e prático.`;

  let ultimoErro = null;

  for (let tentativa = 1; tentativa <= MAX_TENTATIVAS; tentativa++) {
    try {
      // Tentativa 1 e 2: modo JSON nativo (mais confiável)
      // Tentativa 3: fallback para geminiFlash com sanitização mais agressiva
      let raw;
      if (tentativa < MAX_TENTATIVAS) {
        raw = await geminiJson(prompt);
      } else {
        console.log("[Creative] Última tentativa — usando fallback com sanitização");
        raw = await geminiFlash(prompt);
      }

      const conteudo = sanitizeAndParse(raw);

      // Valida estrutura mínima
      if (!conteudo.capa || !conteudo.secoes || !Array.isArray(conteudo.secoes)) {
        throw new Error("JSON retornado não tem a estrutura esperada (capa/secoes)");
      }

      if (tentativa > 1) {
        console.log(`[Creative] Sucesso na tentativa ${tentativa}`);
      }
      return conteudo;

    } catch (err) {
      ultimoErro = err;
      console.error(`[Creative] Tentativa ${tentativa}/${MAX_TENTATIVAS} falhou: ${err.message}`);

      // Aprende com o erro — salva no Supabase de forma assíncrona
      try {
        const { saveMemory } = require("../../integrations/supabase");
        await saveMemory("creative", "json_error", `Erro tentativa ${tentativa}: ${err.message}`, {
          tipo, titulo, tentativa, erro: err.message, timestamp: new Date().toISOString(),
        });
      } catch (_) {}

      if (tentativa < MAX_TENTATIVAS) {
        // Espera crescente entre tentativas
        await new Promise(r => setTimeout(r, tentativa * 1000));
      }
    }
  }

  throw new Error(`Falha após ${MAX_TENTATIVAS} tentativas. Último erro: ${ultimoErro?.message}`);
}

// ──────────────────────────────────────────
// Gerar PDF — Design profissional v4
// ──────────────────────────────────────────
async function gerarPDF(config, conteudo) {
  let coverPng = null;
  if (!config.capaImagem) {
    try {
      const { renderCover } = require("./render_engine");
      coverPng = await renderCover({
        temaKey:     config.temaKey     || "produtividade",
        titulo:      conteudo.capa?.titulo    || config.titulo    || "",
        subtitulo:   conteudo.capa?.subtitulo || config.subtitulo || "",
        autor:       config.autor       || "Nexus Digital",
        tagline:     conteudo.capa?.tagline   || "",
        fonteTitulo: config.fonteTitulo || "Anton",
        fonteCorpo:  config.fonteCorpo  || "Poppins",
      });
    } catch (e) {
      console.warn("[capa satori]", e.message);
    }
  }

  return new Promise((resolve, reject) => {
    const tema = config.tema || THEMES.produtividade;
    const C = config.cores ? { ...tema.colors, ...config.cores } : tema.colors;
    const F = config.fontes ? { ...tema.fonts, ...config.fontes } : tema.fonts;
    const cabAtivo  = config.cabecalho?.ativo !== false;
    const rodAtivo  = config.rodape?.ativo !== false;
    const cabTexto  = config.cabecalho?.texto || config.autor || "Nexus Digital";
    const rodTexto  = config.rodape?.texto || `© ${new Date().getFullYear()} ${config.autor || ""}`;
    const showPagNum = config.rodape?.numeroPagina !== false;

    const doc = new PDFDocument({
      size: "A4", margin: 0, autoFirstPage: false,
      info: { Title: config.titulo, Author: config.autor || "Nexus Digital Holding", Creator: "Nexus MAX" },
    });
    const chunks = [];
    doc.on("data", c => chunks.push(c));
    doc.on("end",  () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // ── Fontes customizadas ──
    if (config.fonteTitulo && FONT_FILES[config.fonteTitulo]) {
      const boldPath = path.join(FONTS_DIR, FONT_FILES[config.fonteTitulo].bold);
      if (fs.existsSync(boldPath)) { doc.registerFont("f-title", boldPath); F.title = "f-title"; }
    }
    if (config.fonteCorpo && FONT_FILES[config.fonteCorpo]) {
      const regPath  = path.join(FONTS_DIR, FONT_FILES[config.fonteCorpo].reg);
      const boldPath = path.join(FONTS_DIR, FONT_FILES[config.fonteCorpo].bold);
      if (fs.existsSync(regPath))  { doc.registerFont("f-body",      regPath);  F.body     = "f-body"; }
      if (fs.existsSync(boldPath)) { doc.registerFont("f-body-bold", boldPath); F.bodyBold = "f-body-bold"; }
    }
    if (config.fonteSubtitulo && FONT_FILES[config.fonteSubtitulo]) {
      const subPath = path.join(FONTS_DIR, FONT_FILES[config.fonteSubtitulo].reg);
      if (fs.existsSync(subPath)) { doc.registerFont("f-subtitle", subPath); F.subtitle = "f-subtitle"; }
    }
    if (!F.subtitle) F.subtitle = F.body;
    if (!F.bodyBold) F.bodyBold = F.title;

    // ── Dimensões ──
    const W  = 595.28, H = 841.89;
    const ML = 56, MR = 56, CW = W - ML - MR;
    const STRIPE_H = 6;
    const CAB_H    = cabAtivo ? 36 : 0;
    const ROD_H    = rodAtivo ? 36 : 0;
    const CT = STRIPE_H + CAB_H + 22;
    const CB = H - ROD_H - 14;

    const PAGE_BG    = C.background || "#FFFFFF";
    const TEXT_DARK  = "#1A1A1A";
    const TEXT_LIGHT = "#888888";

    let pageNum  = 0;
    let cy       = CT;
    let secAtual = "";

    // ── Chrome: cabeçalho + rodapé ──
    function drawChrome() {
      doc.rect(0, 0, W, H).fill(PAGE_BG);
      doc.rect(0, 0, W, STRIPE_H).fill(C.primary);

      if (cabAtivo) {
        doc.rect(0, STRIPE_H, W, CAB_H).fill("#F9F9F9");
        doc.rect(0, STRIPE_H + CAB_H - 0.5, W, 0.5).fill("#E0E0E0");
        doc.fillColor(C.primary).font(F.title).fontSize(7.5)
          .text(cabTexto.toUpperCase(), ML, STRIPE_H + 13, { width: CW * 0.6, characterSpacing: 1.2 });
        if (pageNum > 2 && secAtual) {
          doc.fillColor(TEXT_LIGHT).font(F.body).fontSize(7)
            .text(secAtual.toUpperCase(), ML, STRIPE_H + 14, { width: CW, align: "right", characterSpacing: 0.5 });
        }
      }

      if (rodAtivo) {
        const fy = H - ROD_H;
        doc.rect(0, fy, W, ROD_H).fill("#F9F9F9");
        doc.rect(0, fy, W, 0.5).fill("#E0E0E0");
        doc.rect(0, H - 2, W, 2).fill(C.primary);
        if (rodTexto.trim()) {
          doc.fillColor(TEXT_LIGHT).font(F.body).fontSize(7)
            .text(rodTexto, ML, fy + 14, { width: CW - 54 });
        }
        if (showPagNum) {
          const bw = 30, bh = 18;
          const px = W - ML, py = fy + 9;
          doc.rect(px - bw, py, bw, bh).fill(C.primary);
          doc.fillColor("#FFFFFF").font(F.title).fontSize(9)
            .text(String(pageNum), px - bw, py + 4, { width: bw, align: "center" });
        }
      }
    }

    function newPage(novaSecao = null) {
      pageNum++;
      if (novaSecao !== null) secAtual = novaSecao;
      doc.addPage({ size: "A4", margin: 0 });
      drawChrome();
      cy = CT;
    }

    // ── Título de seção ──
    function sectionTitle(titulo, numStr) {
      if (cy + 90 > CB) newPage(titulo);

      doc.rect(ML, cy, 48, 3).fill(C.primary);
      cy += 10;

      if (numStr) {
        doc.fillColor("#F0F0F0").font(F.title).fontSize(68)
          .text(numStr, W - ML - 88, cy - 18, { width: 88, align: "right" });
      }

      doc.fillColor(C.primary).font(F.title).fontSize(20)
        .text(titulo.toUpperCase(), ML, cy, { width: numStr ? CW - 88 : CW, characterSpacing: 0.5 });
      cy = doc.y + 16;

      doc.save();
      doc.fillOpacity(0.12);
      doc.rect(ML, cy - 4, CW, 0.5).fill(C.primary);
      doc.restore();
      cy += 4;
    }

    // ── Detecta tipo de linha ──
    function getLineType(line) {
      const l = line.trim();
      if (/^\[\s*[xX✓]?\s*\]/.test(l))           return "checkbox";
      if (/^[-*•]\s+/.test(l))                     return "bullet";
      if (/^▸\s*/.test(l))                          return "action";
      if (/^#{1,3}\s+/.test(l))                     return "heading";
      if (/^(FATO\/DADO|FATO|DADO)\s*:/i.test(l)) return "fact";
      return "paragraph";
    }

    // ── Checkbox visual ──
    function writeChecklistItem(line) {
      const checked   = /^\[\s*[xX✓]\s*\]/.test(line.trim());
      const cleanText = line.replace(/^\[\s*[xX✓]?\s*\]\s*/, "").replace(/\*\*/g, "").trim();
      if (!cleanText) return;
      const est  = doc.heightOfString(cleanText, { width: CW - 30, fontSize: 11 });
      const boxH = Math.max(20, est);
      if (cy + boxH + 8 > CB) newPage();
      const bx = ML + 2, by = cy + (boxH / 2) - 7;
      doc.rect(bx, by, 13, 13).lineWidth(1).strokeColor(checked ? C.primary : "#AAAAAA").stroke();
      if (checked) {
        doc.moveTo(bx + 2, by + 6).lineTo(bx + 5, by + 9).lineTo(bx + 11, by + 3)
          .lineWidth(1.5).strokeColor(C.primary).stroke();
      }
      doc.fillColor(TEXT_DARK).font(F.body).fontSize(11)
        .text(cleanText, ML + 22, cy, { width: CW - 26, lineGap: 3 });
      cy = doc.y + 8;
    }

    // ── Bullet point ──
    function writeBulletItem(line) {
      const cleanText = line.replace(/^[-*•]\s+/, "").replace(/\*\*/g, "").trim();
      if (!cleanText) return;
      if (cy + 18 > CB) newPage();
      doc.circle(ML + 7, cy + 6, 2.5).fill(C.accent || C.primary);
      doc.fillColor(TEXT_DARK).font(F.body).fontSize(11)
        .text(cleanText, ML + 20, cy, { width: CW - 24, lineGap: 3 });
      cy = doc.y + 7;
    }

    // ── Ponto de ação (▸) ──
    function writeActionPoint(line) {
      const cleanText = line.replace(/^▸\s*/, "").replace(/\*\*/g, "").trim();
      if (!cleanText) return;
      const est  = doc.heightOfString(cleanText, { width: CW - 46, fontSize: 10.5 });
      const boxH = Math.max(38, est + 22);
      if (cy + boxH + 8 > CB) newPage();
      doc.save();
      doc.fillOpacity(0.07);
      doc.rect(ML, cy, CW, boxH).fill(C.primary);
      doc.restore();
      doc.rect(ML, cy, 4, boxH).fill(C.accent || C.primary);
      doc.fillColor(C.accent || C.primary).font(F.title).fontSize(10)
        .text("▸", ML + 12, cy + Math.floor(boxH / 2) - 6, { width: 16 });
      doc.fillColor(TEXT_DARK).font(F.body).fontSize(10.5)
        .text(cleanText, ML + 32, cy + 11, { width: CW - 46, lineGap: 3 });
      cy = doc.y + 14;
    }

    // ── Heading inline (##) ──
    function writeInlineHeading(line) {
      const cleanText = line.replace(/^#{1,3}\s+/, "").trim();
      if (!cleanText) return;
      if (cy + 28 > CB) newPage();
      cy += 6;
      doc.fillColor(C.primary).font(F.title).fontSize(13)
        .text(cleanText.toUpperCase(), ML, cy, { width: CW, characterSpacing: 0.5 });
      cy = doc.y + 8;
    }

    // ── Parágrafo normal ──
    function writeParagraph(line) {
      const cleanText = line.replace(/\*\*/g, "").trim();
      if (!cleanText) return;
      if (cy + 18 > CB) newPage();
      doc.fillColor(TEXT_DARK).font(F.body).fontSize(11)
        .text(cleanText, ML, cy, { width: CW, lineGap: 5 });
      cy = doc.y + 10;
    }

    // ── Dispatcher de linha ──
    function dispatchLine(line) {
      const l = line.trim();
      if (!l) return;
      switch (getLineType(l)) {
        case "checkbox": writeChecklistItem(l); break;
        case "bullet":   writeBulletItem(l);   break;
        case "action":   writeActionPoint(l);  break;
        case "heading":  writeInlineHeading(l); break;
        case "fact":     writeFactBox(l);       break;
        default:         writeParagraph(l);     break;
      }
    }

    // ── Corpo principal ──
    function writeBody(text) {
      if (!text) return;
      const segments = String(text).split(";").map(p => p.trim()).filter(Boolean);
      for (const seg of segments) {
        const lines = seg.split(/\n/).map(l => l.trim()).filter(Boolean);
        if (lines.length === 0) continue;
        if (lines.length === 1) dispatchLine(lines[0]);
        else for (const line of lines) dispatchLine(line);
      }
    }

    // ── Callout box ──
    function writeCallout(text) {
      if (!text) return;
      const t = text.trim();
      if (/^▸/.test(t))                              { writeActionPoint(t); return; }
      if (/^(FATO\/DADO|FATO|DADO)\s*:/i.test(t))   { writeFactBox(t);     return; }
      const cleanText = t.replace(/\*\*/g, "");
      const est  = doc.heightOfString(cleanText, { width: CW - 50, fontSize: 10.5 });
      const boxH = Math.max(44, est + 28);
      if (cy + boxH + 8 > CB) newPage();
      doc.save();
      doc.fillOpacity(0.06);
      doc.rect(ML, cy, CW, boxH).fill(C.primary);
      doc.restore();
      doc.rect(ML, cy, CW, boxH).lineWidth(0.5).strokeColor("#DDDDDD").stroke();
      doc.rect(ML, cy, 5, boxH).fill(C.accent || C.primary);
      const mx = ML + 18, my = cy + Math.floor(boxH / 2);
      doc.fillColor(C.accent || C.primary)
        .moveTo(mx, my - 5).lineTo(mx + 5, my).lineTo(mx, my + 5).lineTo(mx - 5, my).closePath().fill();
      doc.fillColor(TEXT_DARK).font(F.body).fontSize(10.5)
        .text(cleanText, ML + 32, cy + 14, { width: CW - 44, lineGap: 3.5 });
      cy = doc.y + 14;
    }

    // ── Fact box ──
    function writeFactBox(text) {
      if (!text) return;
      const cleanText = text.replace(/^(FATO\/DADO|FATO|DADO|Fato\/Dado)\s*:\s*/i, "").replace(/\*\*/g, "").trim();
      const est  = doc.heightOfString(cleanText, { width: CW - 70, fontSize: 10.5 });
      const boxH = Math.max(58, est + 32);
      if (cy + boxH + 8 > CB) newPage();
      doc.rect(ML, cy, CW, boxH).fill("#EEF4FF");
      doc.rect(ML, cy, CW, boxH).lineWidth(0.5).strokeColor("#C0D4F8").stroke();
      doc.rect(ML, cy, 5, boxH).fill("#3B7BF0");
      doc.rect(ML + 14, cy + 10, 40, 16).fill("#3B7BF0");
      doc.fillColor("#FFFFFF").font(F.title).fontSize(7.5)
        .text("DADO", ML + 14, cy + 14, { width: 40, align: "center", characterSpacing: 0.5 });
      doc.fillColor("#1A2B4A").font(F.body).fontSize(10.5)
        .text(cleanText, ML + 62, cy + 12, { width: CW - 74, lineGap: 3.5 });
      cy = doc.y + 16;
    }

    // ── Divisor ──
    function writeDivider() {
      if (cy + 18 > CB) return;
      cy += 6;
      const dX = ML + CW * 0.25, dW = CW * 0.5;
      doc.save();
      doc.fillOpacity(0.12);
      doc.rect(dX, cy + 7, dW, 1).fill(C.primary);
      doc.restore();
      const mx = W / 2, my = cy + 7;
      doc.save();
      doc.fillColor(C.primary).fillOpacity(0.45)
        .moveTo(mx, my - 4).lineTo(mx + 4, my).lineTo(mx, my + 4).lineTo(mx - 4, my).closePath().fill();
      doc.restore();
      cy += 22;
    }

    // ════════════════════════════════════════
    // CAPA
    // ════════════════════════════════════════
    pageNum++;
    doc.addPage({ size: "A4", margin: 0 });
    const COV     = C.coverBg || C.secondary || "#1D1D1D";
    const COV_ACC = C.coverAccent || C.accent || C.primary;

    if (coverPng) {
      doc.image(coverPng, 0, 0, { width: W, height: H });
    } else if (config.capaImagem) {
      try {
        doc.image(config.capaImagem, 0, 0, { cover: [W, H], align: "center", valign: "center" });
      } catch (_) { doc.rect(0, 0, W, H).fill("#1A1A1A"); }
      const opacidade = config.capaImagemOpacidade !== undefined ? config.capaImagemOpacidade : 0.40;
      doc.save();
      doc.fillOpacity(opacidade).fillColor("#000000").rect(0, 0, W, H).fill();
      doc.restore();
      doc.save();
      doc.fillOpacity(0.72).fillColor("#000000").rect(0, H * 0.65, W, H * 0.35).fill();
      doc.restore();
      doc.rect(0, 0, W, 5).fill(COV_ACC);
      doc.rect(ML, H * 0.28, 44, 4).fill(COV_ACC);
      doc.fillColor("#FFFFFF").font(F.title).fontSize(34)
        .text(conteudo.capa.titulo || config.titulo, ML, H * 0.30, { width: CW, lineGap: 5 });
      const aft = doc.y + 14;
      doc.rect(ML, aft, CW * 0.22, 2).fill(COV_ACC);
      if (conteudo.capa.subtitulo) {
        doc.save();
        doc.fillOpacity(0.82).fillColor("#FFFFFF").font(F.subtitle).fontSize(13)
          .text(conteudo.capa.subtitulo, ML, aft + 14, { width: CW });
        doc.restore();
      }
      if (conteudo.capa.tagline)
        doc.fillColor("#FFFFFF").font(F.body).fontSize(11)
          .text(conteudo.capa.tagline, ML, H * 0.74, { width: CW, align: "center" });
      if (config.autor)
        doc.fillColor(COV_ACC).font(F.title).fontSize(10)
          .text(config.autor.toUpperCase(), ML, H * 0.82, { width: CW, align: "center", characterSpacing: 1.2 });
      doc.save();
      doc.fillOpacity(0.5).fillColor("#FFFFFF").font(F.body).fontSize(8)
        .text(String(new Date().getFullYear()), ML, H * 0.855, { width: CW, align: "center" });
      doc.restore();
    } else {
      doc.rect(0, 0, W, H).fill(COV);
      doc.rect(0, 0, W, 6).fill(COV_ACC);
      doc.rect(0, H * 0.82, W, H * 0.18).fill(COV_ACC);
      doc.fillColor(C.coverText || "#FFFFFF").font(F.title).fontSize(36)
        .text(conteudo.capa.titulo || config.titulo, ML, H * 0.28, { width: CW * 0.72 });
      if (config.autor)
        doc.fillColor(COV).font(F.title).fontSize(11)
          .text(config.autor.toUpperCase(), ML, H * 0.855, { width: CW, align: "center" });
    }

    // ════════════════════════════════════════
    // SUMÁRIO
    // ════════════════════════════════════════
    newPage("Sumário");
    doc.fillColor(C.primary).font(F.title).fontSize(24)
      .text("SUMÁRIO", ML, cy, { width: CW, characterSpacing: 4 });
    cy = doc.y + 6;
    doc.rect(ML, cy, 60, 3).fill(C.primary);
    cy += 22;

    const indiceItens = [{ num: null, nome: "Introdução" }];
    for (let i = 0; i < (conteudo.secoes || []).length; i++)
      indiceItens.push({ num: String(i + 1).padStart(2, "0"), nome: conteudo.secoes[i].titulo });
    indiceItens.push({ num: null, nome: "Conclusão & Próximos Passos" });

    for (const item of indiceItens) {
      if (cy + 36 > CB) newPage("Sumário");
      if (item.num) {
        doc.rect(ML, cy + 2, 28, 22).fill(C.primary);
        doc.fillColor("#FFFFFF").font(F.title).fontSize(10)
          .text(item.num, ML, cy + 7, { width: 28, align: "center" });
      } else {
        doc.rect(ML, cy + 2, 28, 22).fill("#EEEEEE");
        doc.fillColor("#999999").font(F.title).fontSize(10)
          .text("—", ML, cy + 7, { width: 28, align: "center" });
      }
      doc.fillColor(TEXT_DARK).font(F.body).fontSize(12)
        .text(item.nome, ML + 38, cy + 7, { width: CW - 38 });
      cy = doc.y + 10;
      doc.save();
      doc.fillOpacity(0.08);
      doc.rect(ML + 38, cy - 4, CW - 38, 0.5).fill(C.primary);
      doc.restore();
    }

    // ════════════════════════════════════════
    // INTRODUÇÃO
    // ════════════════════════════════════════
    newPage("Introdução");
    sectionTitle("Introdução", null);
    writeBody(conteudo.introducao);

    // ════════════════════════════════════════
    // SEÇÕES
    // ════════════════════════════════════════
    for (let i = 0; i < (conteudo.secoes || []).length; i++) {
      const secao  = conteudo.secoes[i];
      const numStr = String(i + 1).padStart(2, "0");
      newPage(secao.titulo);
      sectionTitle(secao.titulo, numStr);
      writeBody(secao.conteudo);
      if (secao.destaques?.length) {
        cy += 8;
        writeDivider();
        for (const d of secao.destaques) {
          if (/^(FATO\/DADO|FATO|DADO|Fato\/Dado)\s*:/i.test(d)) writeFactBox(d);
          else writeCallout(d);
        }
      }
    }

    // ════════════════════════════════════════
    // CONCLUSÃO
    // ════════════════════════════════════════
    newPage("Conclusão");
    sectionTitle("Conclusão & Próximos Passos", null);
    writeBody(conteudo.conclusao);

    // ════════════════════════════════════════
    // SOBRE O AUTOR
    // ════════════════════════════════════════
    if (conteudo.sobre_autor) {
      if (cy + 120 > CB) newPage();
      cy += 20;
      writeDivider();
      const sobreText = String(conteudo.sobre_autor);
      const sobreH    = Math.max(80, doc.heightOfString(sobreText, { width: CW - 36, fontSize: 10.5 }) + 44);
      doc.rect(ML, cy, CW, sobreH).fill("#F8F8F8");
      doc.rect(ML, cy, CW, sobreH).lineWidth(0.5).strokeColor("#E0E0E0").stroke();
      doc.rect(ML, cy, 5, sobreH).fill(C.primary);
      doc.fillColor(C.primary).font(F.title).fontSize(10)
        .text("SOBRE O AUTOR", ML + 18, cy + 14, { width: CW - 28, characterSpacing: 1 });
      doc.fillColor(TEXT_DARK).font(F.body).fontSize(10.5)
        .text(sobreText, ML + 18, cy + 34, { width: CW - 28, lineGap: 4 });
      cy = doc.y + 16;
    }

    doc.end();
  });
}

// ──────────────────────────────────────────
// Gerar DOCX — versão profissional com tema visual completo
// ──────────────────────────────────────────
async function gerarDOCX(config, conteudo) {
  const cores  = config.cores  || {};
  const fontes = config.fontes || {};

  // Cores do tema — strip '#' para docx
  const hex  = (c) => (c || "#2563EB").replace("#", "");
  const cPrimary  = hex(cores.primary  || "#2563EB");
  const cAccent   = hex(cores.accent   || "#F59E0B");
  const cBg       = hex(cores.background || "#FFFFFF");
  const cCoverBg  = hex(cores.coverBg  || cores.secondary || "#1D2D50");

  // Fontes
  const fTitulo = config.fonteTitulo || fontes.titulo || "Calibri";
  const fCorpo  = config.fonteCorpo  || fontes.corpo  || "Calibri";

  // Tamanhos DXA (A4: 11906 x 16838, margens 1134 = 2cm)
  const PAGE_W   = 11906;
  const MARGIN   = 1134;
  const CONTENT  = PAGE_W - MARGIN * 2;  // 9638 DXA

  // Borda decorativa para callouts
  const calloutBorder = (color) => ({
    top:    { style: BorderStyle.SINGLE, size: 1, color },
    bottom: { style: BorderStyle.SINGLE, size: 1, color },
    right:  { style: BorderStyle.SINGLE, size: 1, color },
    left:   { style: BorderStyle.THICK,  size: 8, color },
  });

  // Helper: parágrafo de corpo com fonte configurada
  const bodyPara = (text, opts = {}) => new Paragraph({
    spacing: { before: 0, after: 220, line: 336, lineRule: "auto" },
    ...opts,
    children: [new TextRun({
      text: text || "",
      font: fCorpo,
      size: 24,  // 12pt
      ...(opts.runOpts || {}),
    })],
  });

  // Helper: linha separadora fina com cor do tema
  const divider = () => new Paragraph({
    spacing: { before: 120, after: 120 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: cPrimary, space: 1 } },
    children: [],
  });

  // Processa texto de seção — quebra em parágrafos por '\n'
  const textoParagrafos = (texto, opts = {}) => {
    if (!texto) return [];
    return texto.split(/\n+/).filter(t => t.trim()).map(t => bodyPara(t.trim(), opts));
  };

  // Callout box com destaque lateral
  const calloutBox = (texto, color = cAccent) => new Table({
    width: { size: CONTENT, type: WidthType.DXA },
    columnWidths: [CONTENT],
    borders: {
      top:    { style: BorderStyle.NONE },
      bottom: { style: BorderStyle.NONE },
      left:   { style: BorderStyle.NONE },
      right:  { style: BorderStyle.NONE },
      insideH:{ style: BorderStyle.NONE },
      insideV:{ style: BorderStyle.NONE },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: CONTENT, type: WidthType.DXA },
            borders: calloutBorder(color),
            shading: { fill: cBg === "FFFFFF" ? "F8F9FA" : cBg, type: ShadingType.CLEAR },
            margins: { top: 100, bottom: 100, left: 200, right: 120 },
            children: [new Paragraph({
              spacing: { before: 60, after: 60 },
              children: [new TextRun({ text: texto || "", font: fCorpo, size: 22, italics: true })],
            })],
          }),
        ],
      }),
    ],
  });

  // ── PÁGINA DE CAPA ────────────────────────────────────────────────────────
  const capaTitulo    = conteudo.capa?.titulo    || config.titulo    || "Entregável";
  const capaSubtitulo = conteudo.capa?.subtitulo || config.subtitulo || "";
  const capaTagline   = conteudo.capa?.tagline   || "";
  const autorNome     = config.autor || "";

  const coverChildren = [
    // Barra accent no topo da capa
    new Paragraph({
      spacing: { before: 0, after: 0 },
      border: { bottom: { style: BorderStyle.THICK, size: 48, color: cAccent, space: 1 } },
      children: [],
    }),

    // Espaço proporcional antes do título (~30% da altura da página)
    new Paragraph({ spacing: { before: 3200, after: 0 }, children: [] }),

    // Título principal — grande, ocupa espaço
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { before: 0, after: 240 },
      children: [new TextRun({
        text: capaTitulo,
        font: fTitulo,
        size: 80,
        bold: true,
        color: cPrimary,
      })],
    }),

    // Subtítulo
    ...(capaSubtitulo ? [new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { before: 0, after: 320 },
      children: [new TextRun({
        text: capaSubtitulo,
        font: fCorpo,
        size: 32,
        color: "555555",
        italics: true,
      })],
    })] : []),

    // Tagline
    ...(capaTagline ? [new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { before: 0, after: 0 },
      children: [new TextRun({
        text: capaTagline,
        font: fCorpo,
        size: 24,
        color: "888888",
      })],
    })] : []),

    // Empurra o autor para baixo (~35% de altura restante)
    new Paragraph({ spacing: { before: 3600, after: 0 }, children: [] }),

    // Linha + autor na base da capa
    new Paragraph({
      spacing: { before: 0, after: 120 },
      border: { top: { style: BorderStyle.SINGLE, size: 6, color: cPrimary, space: 6 } },
      children: [new TextRun({
        text: autorNome ? `Por ${autorNome}` : "",
        font: fCorpo,
        size: 26,
        bold: true,
        color: cPrimary,
      })],
    }),

    // Tipo do entregável
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { before: 0, after: 0 },
      children: [new TextRun({
        text: (config.tipo || "ebook").toUpperCase().replace("_", " "),
        font: fCorpo,
        size: 18,
        color: "AAAAAA",
        allCaps: true,
      })],
    }),

    // Quebra para próxima seção
    new Paragraph({ children: [new PageBreak()] }),
  ];

  // ── SUMÁRIO ───────────────────────────────────────────────────────────────
  const tocChildren = [
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 0, after: 200 },
      children: [new TextRun({ text: "Sumário", font: fTitulo, size: 36, bold: true, color: cPrimary })],
    }),
    new TableOfContents("Sumário", {
      hyperlink: true,
      headingStyleRange: "1-2",
    }),
    new Paragraph({ children: [new PageBreak()] }),
  ];

  // ── CONTEÚDO PRINCIPAL ───────────────────────────────────────────────────
  const mainChildren = [];

  // Introdução — sem PageBreak forçado, flui para o próximo capítulo
  mainChildren.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 0, after: 160 },
      children: [new TextRun({ text: "Introdução", font: fTitulo, size: 36, bold: true, color: cPrimary })],
    }),
    divider(),
    ...textoParagrafos(conteudo.introducao),
  );

  // Seções — quebra de página ANTES do capítulo (não depois do conteúdo)
  for (const [i, secao] of (conteudo.secoes || []).entries()) {
    mainChildren.push(
      // Label de capítulo — sempre inicia nova página
      new Paragraph({
        pageBreakBefore: true,
        spacing: { before: 0, after: 40 },
        children: [new TextRun({
          text: `CAPÍTULO ${String(i + 1).padStart(2, "0")}`,
          font: fTitulo, size: 18, bold: true,
          color: cAccent, allCaps: true,
        })],
      }),
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 0, after: 160 },
        keepNext: true,
        children: [new TextRun({ text: secao.titulo || "", font: fTitulo, size: 36, bold: true, color: cPrimary })],
      }),
      divider(),
    );

    // Corpo da seção
    mainChildren.push(...textoParagrafos(secao.conteudo));

    // Destaques — callouts logo após o conteúdo, sem espaço extra vazio
    if (secao.destaques?.length) {
      for (const destaque of secao.destaques) {
        mainChildren.push(
          new Paragraph({ spacing: { before: 160, after: 0 }, children: [] }),
          calloutBox(destaque, cAccent),
          new Paragraph({ spacing: { before: 80, after: 0 }, children: [] }),
        );
      }
    }
    // SEM PageBreak depois — conteúdo flui naturalmente
  }

  // Conclusão — nova página antes, conteúdo flui
  mainChildren.push(
    new Paragraph({
      pageBreakBefore: true,
      spacing: { before: 0, after: 160 },
      children: [new TextRun({
        text: "ENCERRAMENTO",
        font: fTitulo, size: 18, bold: true, color: cAccent, allCaps: true,
      })],
    }),
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 0, after: 160 },
      keepNext: true,
      children: [new TextRun({ text: "Conclusão & Próximos Passos", font: fTitulo, size: 36, bold: true, color: cPrimary })],
    }),
    divider(),
    ...textoParagrafos(conteudo.conclusao),
  );

  // Sobre o Autor
  if (autorNome || conteudo.sobre_autor) {
    mainChildren.push(
      new Paragraph({ children: [new PageBreak()] }),
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 0, after: 200 },
        children: [new TextRun({ text: "Sobre o Autor", font: fTitulo, size: 30, bold: true, color: cPrimary })],
      }),
      divider(),
      new Table({
        width: { size: CONTENT, type: WidthType.DXA },
        columnWidths: [CONTENT],
        borders: {
          top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
          left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
          insideH: { style: BorderStyle.NONE }, insideV: { style: BorderStyle.NONE },
        },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: CONTENT, type: WidthType.DXA },
                shading: { fill: "F8F9FA", type: ShadingType.CLEAR },
                borders: {
                  top:    { style: BorderStyle.THICK, size: 6, color: cPrimary },
                  bottom: { style: BorderStyle.SINGLE, size: 2, color: "DDDDDD" },
                  left:   { style: BorderStyle.SINGLE, size: 2, color: "DDDDDD" },
                  right:  { style: BorderStyle.SINGLE, size: 2, color: "DDDDDD" },
                },
                margins: { top: 200, bottom: 200, left: 240, right: 240 },
                children: [
                  new Paragraph({
                    spacing: { before: 40, after: 80 },
                    children: [new TextRun({ text: autorNome, font: fTitulo, size: 28, bold: true, color: cPrimary })],
                  }),
                  ...textoParagrafos(conteudo.sobre_autor || ""),
                ],
              }),
            ],
          }),
        ],
      }),
    );
  }

  // ── CABEÇALHO & RODAPÉ ───────────────────────────────────────────────────
  const cabAtivo = config.cabecalho?.ativo !== false;
  const rodAtivo = config.rodape?.ativo    !== false;
  const cabTexto = config.cabecalho?.texto || autorNome || config.titulo || "";
  const rodTexto = config.rodape?.texto    || "";

  const headerSection = cabAtivo ? {
    default: new Header({
      children: [
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: cPrimary, space: 4 } },
          spacing: { before: 0, after: 120 },
          children: [new TextRun({ text: cabTexto, font: fCorpo, size: 18, color: "888888" })],
        }),
      ],
    }),
  } : {};

  const footerSection = rodAtivo ? {
    default: new Footer({
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          border: { top: { style: BorderStyle.SINGLE, size: 4, color: cPrimary, space: 4 } },
          spacing: { before: 120, after: 0 },
          children: [
            ...(rodTexto ? [new TextRun({ text: `${rodTexto}  ·  `, font: fCorpo, size: 16, color: "AAAAAA" })] : []),
            new TextRun({ children: [PageNumber.CURRENT], font: fCorpo, size: 16, color: cPrimary, bold: true }),
          ],
        }),
      ],
    }),
  } : {};

  // ── MONTAR DOCUMENTO ─────────────────────────────────────────────────────
  const doc = new Document({
    styles: {
      default: {
        document: { run: { font: fCorpo, size: 24, color: "333333" } },
      },
      paragraphStyles: [
        {
          id: "Heading1", name: "Heading 1",
          basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 36, bold: true, font: fTitulo, color: cPrimary },
          paragraph: { spacing: { before: 360, after: 240 }, outlineLevel: 0 },
        },
        {
          id: "Heading2", name: "Heading 2",
          basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 30, bold: true, font: fTitulo, color: cPrimary },
          paragraph: { spacing: { before: 280, after: 180 }, outlineLevel: 1 },
        },
      ],
    },
    numbering: {
      config: [
        {
          reference: "bullets",
          levels: [{
            level: 0,
            format: LevelFormat.BULLET,
            text: "•",
            alignment: AlignmentType.LEFT,
            style: {
              run: { font: "Arial", color: cAccent, bold: true },
              paragraph: { indent: { left: 720, hanging: 360 }, spacing: { before: 60, after: 60 } },
            },
          }],
        },
      ],
    },
    sections: [
      // Seção 1 — Capa (sem header/footer)
      {
        properties: {
          page: {
            size: { width: PAGE_W, height: 16838 },
            margin: { top: MARGIN, right: MARGIN, bottom: MARGIN, left: MARGIN },
          },
        },
        children: coverChildren,
      },
      // Seção 2 — Sumário + Conteúdo (com header/footer)
      {
        properties: {
          page: {
            size: { width: PAGE_W, height: 16838 },
            margin: { top: 1440, right: MARGIN, bottom: 1440, left: MARGIN },
          },
        },
        headers: headerSection,
        footers: footerSection,
        children: [...tocChildren, ...mainChildren],
      },
    ],
  });

  return Packer.toBuffer(doc);
}

// ──────────────────────────────────────────
// Função principal
// config.onProgress(pct, msg) — callback opcional para progresso em tempo real
// ──────────────────────────────────────────
async function generate(params) {
  const {
    titulo, subtitulo, autor, nicho, avatar_publico, tipo,
    num_paginas, num_capitulos, tema, gerar_carrossel, formato_carrossel, onProgress,
    capaImagem, capaImagemOpacidade, formato, cores, fontes,
    fonteTitulo, fonteCorpo, cabecalho, rodape,
    temaKey: temaKeyParam, descricao, paginas, avatar,
    produto,
  } = params;
  const relatorio = produto?.relatorio || "";

  const progress = typeof onProgress === "function" ? onProgress : () => {};
  const temaKey  = temaKeyParam || tema || "produtividade";
  const temaBase = THEMES[temaKey] || THEMES.produtividade;
  const nichoFinal = nicho || descricao || titulo;

  await progress(5, "Mapeando mercado...");
  const estrategia = await estrategista.run({ titulo, subtitulo, nicho: nichoFinal, avatar_publico: avatar_publico || avatar, tipo, relatorio });

  await progress(20, "Estruturando conteúdo...");
  const estrutura = await arquiteto.run({ estrategia, tipo, num_paginas: num_paginas || paginas, num_capitulos });

  await progress(45, "Escrevendo copy...");
  const copy = await copywriter.run({ estrategia, estrutura, autor: autor || "", tipo });

  await progress(70, "Gerando capa...");
  let capaBuffer = null;
  if (capaImagem) {
    capaBuffer = typeof capaImagem === "string" ? Buffer.from(capaImagem, "base64") : capaImagem;
  } else {
    try {
      capaBuffer = await capaAgent.run({ titulo, nicho: nichoFinal, tema: temaKey });
    } catch (e) {
      console.warn("[capa] Nano Banana falhou, usando capa satori:", e.message);
    }
  }

  let slides = null;
  if (gerar_carrossel) {
    await progress(82, "Gerando carrossel...");
    slides = await carrosselAgent.run({ copy, estrategia, autor: autor || "", formato: formato_carrossel });
  }

  const conteudo = {
    capa: {
      titulo: titulo || "Entregável",
      subtitulo: subtitulo || estrategia.promessa_central || "",
      tagline: copy.copy_capa || "",
    },
    introducao: estrategia.promessa_central || "",
    secoes: (copy.secoes || []).map(s => ({
      titulo: s.titulo,
      conteudo: s.conteudo,
      destaques: s.ponto_de_acao ? [s.ponto_de_acao] : [],
    })),
    conclusao: copy.copy_contracapa || "",
    sobre_autor: autor || "",
  };

  const finalConfig = {
    tipo: tipo || "ebook",
    titulo: titulo || "Meu Entregável",
    subtitulo: subtitulo || "",
    autor: autor || "",
    paginas: parseInt(num_paginas || paginas) || 10,
    descricao: nichoFinal,
    tema: temaBase,
    temaKey,
    cores: {
      ...temaBase.colors,
      ...(cores || {}),
      ...(cores?.secondary && { coverBg: cores.secondary }),
      ...(cores?.accent    && { coverAccent: cores.accent }),
    },
    fontes: fontes ? { ...temaBase.fonts, ...fontes } : temaBase.fonts,
    cabecalho: cabecalho !== undefined ? cabecalho : { ativo: true, texto: autor || "" },
    rodape:    rodape    !== undefined ? rodape    : { ativo: true, texto: "", numeroPagina: true },
    formato:   formato || "pdf",
    capaImagem: capaBuffer,
    capaImagemOpacidade,
    fonteTitulo: fonteTitulo || "Poppins",
    fonteCorpo:  fonteCorpo  || "Poppins",
  };

  await progress(90, "Montando PDF...");
  const resultado = { titulo: finalConfig.titulo, conteudo, coverImageBuffer: capaBuffer };

  if (finalConfig.formato === "pdf" || finalConfig.formato === "ambos") {
    resultado.pdf = await gerarPDF(finalConfig, conteudo);
    resultado.pdfFilename = `${finalConfig.titulo.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;
  }

  if (finalConfig.formato === "docx" || finalConfig.formato === "ambos") {
    resultado.docx = await gerarDOCX(finalConfig, conteudo);
    resultado.docxFilename = `${finalConfig.titulo.replace(/[^a-zA-Z0-9]/g, "_")}.docx`;
  }

  await progress(100, "Pronto.");
  return { ...resultado, slides };
}

module.exports = { generate, gerarConteudo, gerarPDF, gerarDOCX, extrairCoresDaImagem, THEMES };
