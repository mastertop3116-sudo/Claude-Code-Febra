// ============================================
// NEXUS — Gerador de Entregáveis em PDF/Word
// Powered by Gemini (conteúdo) + PDFKit (layout)
// ============================================

const PDFDocument = require("pdfkit");
const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = require("docx");
const { geminiJson, geminiFlash } = require("../../integrations/gemini");
const THEMES = require("./themes");

const MAX_TENTATIVAS = 3;

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
// Gerar PDF — Design profissional v2
// ──────────────────────────────────────────
function gerarPDF(config, conteudo) {
  return new Promise((resolve, reject) => {
    const tema = config.tema || THEMES.produtividade;
    const C = config.cores ? { ...tema.colors, ...config.cores } : tema.colors;
    const F = config.fontes ? { ...tema.fonts, ...config.fontes } : tema.fonts;
    const cabAtivo = config.cabecalho?.ativo !== false;
    const rodAtivo = config.rodape?.ativo !== false;
    const cabTexto = config.cabecalho?.texto || config.autor || "Nexus Digital";
    const rodTexto = config.rodape?.texto || `© ${new Date().getFullYear()} ${config.autor || ""}`;
    const showPagNum = config.rodape?.numeroPagina !== false;

    const doc = new PDFDocument({ size: "A4", margin: 0, autoFirstPage: false,
      info: { Title: config.titulo, Author: config.autor || "Nexus Digital Holding", Creator: "Nexus MAX" },
    });
    const chunks = [];
    doc.on("data", c => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // ── Dimensões ──
    const W = 595.28, H = 841.89;
    const ML = 52, MR = 52;
    const CW = W - ML - MR;
    const TOP_STRIPE = 6;
    const HEADER_H = cabAtivo ? 34 : 0;
    const FOOTER_H = rodAtivo ? 36 : 0;
    const CT = TOP_STRIPE + HEADER_H + 10;   // content top
    const CB = H - FOOTER_H - 10;             // content bottom

    let pageNum = 0;
    let cy = CT;  // current Y — manual tracker

    // ── Chrome (cabeçalho/rodapé) de cada página ──
    function drawChrome() {
      // Stripe topo
      doc.rect(0, 0, W, TOP_STRIPE).fill(C.primary);

      if (cabAtivo) {
        doc.rect(0, TOP_STRIPE, W, HEADER_H).fill(C.headerBg || "#F4F4F4");
        // Linha separadora sutil
        doc.save().opacity(0.15)
          .rect(0, TOP_STRIPE + HEADER_H - 1, W, 1).fill(C.primary)
          .restore();
        doc.fillColor(C.primary).font(F.body).fontSize(8.5)
          .text(cabTexto, ML, TOP_STRIPE + 11, { width: CW * 0.55 });
        if (pageNum > 1) {
          doc.fillColor("#999999").font(F.body).fontSize(8)
            .text(config.titulo, ML, TOP_STRIPE + 11, { width: CW, align: "right" });
        }
      }

      if (rodAtivo) {
        const fy = H - FOOTER_H;
        // Linha separadora rodapé
        doc.save().opacity(0.12)
          .rect(ML, fy + 2, CW, 1).fill(C.primary)
          .restore();
        if (rodTexto.trim()) {
          doc.fillColor("#AAAAAA").font(F.body).fontSize(7.5)
            .text(rodTexto, ML, fy + 10, { width: CW - 36 });
        }
        if (showPagNum) {
          // Círculo com número de página
          const cx = W - ML - 12, cy2 = fy + 17;
          doc.circle(cx, cy2, 13).fill(C.primary);
          doc.fillColor("#FFFFFF").font(F.title).fontSize(8)
            .text(String(pageNum), cx - 13, cy2 - 5, { width: 26, align: "center" });
        }
      }
    }

    function newPage() {
      pageNum++;
      doc.addPage({ size: "A4", margin: 0 });
      doc.rect(0, 0, W, H).fill(C.background || "#FFFFFF");
      drawChrome();
      cy = CT;
    }

    // ── Cabeçalho de seção (banda colorida) ──
    function sectionBand(titulo, numStr = null) {
      const BH = 78;
      // Fundo da banda
      doc.rect(0, cy, W, BH).fill(C.primary);
      // Círculo decorativo direita
      doc.save().opacity(0.10)
        .circle(W - 55, cy + BH / 2, 62).fill("#FFFFFF")
        .restore();
      // Número grande fantasma
      if (numStr) {
        doc.save().opacity(0.18)
          .fillColor("#FFFFFF").font(F.title).fontSize(58)
          .text(numStr, W - 130, cy + 4, { width: 90, align: "right" })
          .restore();
      }
      // Título
      doc.fillColor("#FFFFFF").font(F.title).fontSize(21)
        .text(titulo, ML, cy + (BH / 2) - 13, { width: CW - 100 });
      cy += BH + 22;
    }

    // ── Texto corrido ──
    function writeBody(text) {
      if (!text) return;
      const parts = String(text).split(/;\s*/).filter(p => p.trim());
      for (const part of parts) {
        if (cy + 28 > CB) { newPage(); }
        doc.fillColor(C.text || "#2C2C2C").font(F.body).fontSize(11)
          .text(part.trim(), ML, cy, { width: CW, lineGap: 5 });
        cy = doc.y + 10;
      }
    }

    // ── Callout / destaque ──
    function writeCallout(text) {
      const BH = 46;
      if (cy + BH + 8 > CB) { newPage(); }
      // Background suave
      doc.save().opacity(0.07)
        .roundedRect(ML, cy, CW, BH, 5).fill(C.primary)
        .restore();
      // Borda esquerda
      doc.roundedRect(ML, cy, 5, BH, 2).fill(C.accent || C.primary);
      // Seta/bullet
      doc.fillColor(C.accent || C.primary).font(F.title).fontSize(13)
        .text("›", ML + 12, cy + 15, { width: 14 });
      // Texto
      doc.fillColor(C.text || "#2C2C2C").font(F.title).fontSize(9.5)
        .text(text.trim(), ML + 30, cy + 14, { width: CW - 40, lineGap: 3 });
      cy += BH + 10;
    }

    // ── Divisor ──
    function writeDivider() {
      if (cy + 18 > CB) return;
      doc.save().opacity(0.18)
        .moveTo(ML + CW * 0.25, cy + 9).lineTo(ML + CW * 0.75, cy + 9)
        .strokeColor(C.primary).lineWidth(1).stroke()
        .restore();
      doc.save().opacity(0.4)
        .circle(W / 2, cy + 9, 3).fill(C.primary)
        .restore();
      cy += 22;
    }

    // ════════════════════════════════════════
    // CAPA
    // ════════════════════════════════════════
    pageNum++;
    doc.addPage({ size: "A4", margin: 0 });
    doc.rect(0, 0, W, H).fill(C.coverBg || C.secondary || "#1D1D1D");

    // Círculo grande canto superior direito
    doc.save().opacity(0.09)
      .circle(W + 20, -40, 240).fill(C.primary)
      .restore();
    // Círculo médio canto inferior esquerdo
    doc.save().opacity(0.13)
      .circle(-30, H + 20, 160).fill(C.coverAccent || C.accent || C.primary)
      .restore();
    // Triângulo/banda diagonal decorativa (simulado com rect inclinado estreito)
    doc.save().opacity(0.08)
      .rect(0, H * 0.48, W * 0.4, H * 0.54).fill(C.coverAccent || C.accent || C.primary)
      .restore();
    // Banda horizontal accent
    const bY = H * 0.63;
    doc.rect(0, bY, W, 5).fill(C.coverAccent || C.accent || C.primary);
    // Linha fina adicional
    doc.save().opacity(0.25)
      .rect(0, bY - 3, W * 0.55, 1.5).fill(C.coverText || "#FFFFFF")
      .restore();

    // Título
    const tY = H * 0.25;
    doc.fillColor(C.coverText || "#FFFFFF").font(F.title).fontSize(38)
      .text(conteudo.capa.titulo || config.titulo, ML, tY, {
        width: CW, align: "center", lineGap: 8,
      });

    let afterT = doc.y + 18;

    // Separador sob título
    const lw = CW * 0.32;
    doc.save().opacity(0.45)
      .rect((W - lw) / 2, afterT, lw, 2).fill(C.coverAccent || C.accent || "#FFFFFF")
      .restore();

    // Subtítulo
    if (conteudo.capa.subtitulo) {
      doc.save().opacity(0.82)
        .fillColor(C.coverText || "#FFFFFF").font(F.body).fontSize(14)
        .text(conteudo.capa.subtitulo, ML, afterT + 14, { width: CW, align: "center" })
        .restore();
      afterT = doc.y + 8;
    }

    // Tagline
    if (conteudo.capa.tagline) {
      doc.fillColor(C.coverAccent || C.accent || "#E0E0E0").font(F.body).fontSize(11)
        .text(conteudo.capa.tagline, ML, afterT + 12, { width: CW, align: "center" });
    }

    // Autor
    if (config.autor) {
      doc.save().opacity(0.6)
        .fillColor(C.coverText || "#FFFFFF").font(F.body).fontSize(10)
        .text(config.autor, ML, H - 72, { width: CW, align: "center" })
        .restore();
    }
    doc.save().opacity(0.3)
      .fillColor(C.coverText || "#FFFFFF").font(F.body).fontSize(8)
      .text(String(new Date().getFullYear()), ML, H - 54, { width: CW, align: "center" })
      .restore();

    // ════════════════════════════════════════
    // INTRODUÇÃO
    // ════════════════════════════════════════
    newPage();
    sectionBand("Introdução");
    writeBody(conteudo.introducao);

    // ════════════════════════════════════════
    // SEÇÕES
    // ════════════════════════════════════════
    for (let i = 0; i < (conteudo.secoes || []).length; i++) {
      const secao = conteudo.secoes[i];
      newPage();
      sectionBand(secao.titulo, String(i + 1).padStart(2, "0"));
      writeBody(secao.conteudo);
      if (secao.destaques?.length) {
        cy += 8;
        writeDivider();
        for (const d of secao.destaques) writeCallout(d);
      }
    }

    // ════════════════════════════════════════
    // CONCLUSÃO
    // ════════════════════════════════════════
    newPage();
    sectionBand("Conclusão & Próximos Passos");
    writeBody(conteudo.conclusao);

    // ════════════════════════════════════════
    // SOBRE O AUTOR
    // ════════════════════════════════════════
    if (conteudo.sobre_autor) {
      if (cy + 110 > CB) newPage();
      cy += 20;
      writeDivider();
      const boxH = 82;
      // Box estilizado
      doc.save().opacity(0.06)
        .roundedRect(ML, cy, CW, boxH, 6).fill(C.primary)
        .restore();
      doc.roundedRect(ML, cy, 6, boxH, 3).fill(C.primary);
      doc.fillColor(C.primary).font(F.title).fontSize(12)
        .text("Sobre o Autor", ML + 18, cy + 10, { width: CW - 28 });
      doc.fillColor(C.text || "#333").font(F.body).fontSize(10)
        .text(conteudo.sobre_autor, ML + 18, cy + 30, { width: CW - 28, lineGap: 4 });
      cy += boxH + 16;
    }

    doc.end();
  });
}

// ──────────────────────────────────────────
// Gerar DOCX
// ──────────────────────────────────────────
async function gerarDOCX(config, conteudo) {
  const tema = config.tema || THEMES.produtividade;
  const children = [];

  const hexColor = (hex) => hex.replace("#", "");

  // Capa
  children.push(
    new Paragraph({
      text: conteudo.capa.titulo || config.titulo,
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { before: 800, after: 200 },
    }),
    new Paragraph({
      children: [new TextRun({ text: conteudo.capa.subtitulo || "", italics: true, size: 28 })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),
    new Paragraph({
      children: [new TextRun({ text: config.autor || "", size: 22 })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 800 },
    }),
    new Paragraph({ text: "", pageBreakBefore: true }),
  );

  // Introdução
  children.push(
    new Paragraph({ text: "Introdução", heading: HeadingLevel.HEADING_1 }),
    new Paragraph({ text: conteudo.introducao || "", spacing: { after: 200 } }),
    new Paragraph({ text: "", pageBreakBefore: true }),
  );

  // Seções
  for (const secao of (conteudo.secoes || [])) {
    children.push(
      new Paragraph({ text: secao.titulo, heading: HeadingLevel.HEADING_1 }),
      new Paragraph({ text: secao.conteudo || "", spacing: { after: 200 } }),
    );
    for (const d of (secao.destaques || [])) {
      children.push(new Paragraph({
        children: [new TextRun({ text: `▸ ${d}`, bold: true })],
        spacing: { before: 100, after: 100 },
      }));
    }
    children.push(new Paragraph({ text: "", pageBreakBefore: true }));
  }

  // Conclusão
  children.push(
    new Paragraph({ text: "Conclusão & Próximos Passos", heading: HeadingLevel.HEADING_1 }),
    new Paragraph({ text: conteudo.conclusao || "", spacing: { after: 200 } }),
  );

  // Sobre o autor
  if (conteudo.sobre_autor) {
    children.push(
      new Paragraph({ text: "Sobre o Autor", heading: HeadingLevel.HEADING_2, spacing: { before: 400 } }),
      new Paragraph({ text: conteudo.sobre_autor }),
    );
  }

  const doc = new Document({
    sections: [{ properties: {}, children }],
  });

  return Packer.toBuffer(doc);
}

// ──────────────────────────────────────────
// Função principal
// ──────────────────────────────────────────
async function generate(config) {
  const temaKey = config.temaKey || "produtividade";
  const temaBase = THEMES[temaKey] || THEMES.produtividade;

  const finalConfig = {
    tipo: config.tipo || "ebook",
    titulo: config.titulo || "Meu Entregável",
    subtitulo: config.subtitulo || "",
    autor: config.autor || "Nexus Digital Holding",
    paginas: parseInt(config.paginas) || 10,
    descricao: config.descricao || config.titulo,
    tema: temaBase,
    temaKey,
    cores: config.cores ? { ...temaBase.colors, ...config.cores } : temaBase.colors,
    fontes: config.fontes ? { ...temaBase.fonts, ...config.fontes } : temaBase.fonts,
    cabecalho: config.cabecalho !== undefined ? config.cabecalho : {
      ativo: true,
      texto: config.autor || "Nexus Digital",
    },
    rodape: config.rodape !== undefined ? config.rodape : {
      ativo: true,
      texto: "",
      numeroPagina: true,
    },
    formato: config.formato || "pdf",
  };

  const conteudo = await gerarConteudo(
    finalConfig.tipo,
    finalConfig.titulo,
    finalConfig.descricao,
    finalConfig.paginas,
  );

  const resultado = { titulo: finalConfig.titulo, conteudo };

  if (finalConfig.formato === "pdf" || finalConfig.formato === "ambos") {
    resultado.pdf = await gerarPDF(finalConfig, conteudo);
    resultado.pdfFilename = `${finalConfig.titulo.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;
  }

  if (finalConfig.formato === "docx" || finalConfig.formato === "ambos") {
    resultado.docx = await gerarDOCX(finalConfig, conteudo);
    resultado.docxFilename = `${finalConfig.titulo.replace(/[^a-zA-Z0-9]/g, "_")}.docx`;
  }

  return resultado;
}

module.exports = { generate, gerarConteudo, gerarPDF, gerarDOCX, THEMES };
