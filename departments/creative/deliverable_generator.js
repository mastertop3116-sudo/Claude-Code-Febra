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
// Gerar PDF
// ──────────────────────────────────────────
function gerarPDF(config, conteudo) {
  return new Promise((resolve, reject) => {
    const tema = config.tema || THEMES.produtividade;
    const cores = config.cores || tema.colors;
    const fontes = config.fontes || tema.fonts;
    const cabecalho = config.cabecalho || { ativo: true, texto: config.autor || "Nexus Digital" };
    const rodape = config.rodape || { ativo: true, texto: "", numeroPagina: true };

    const doc = new PDFDocument({
      size: "A4",
      margin: 0,
      autoFirstPage: false,
      info: {
        Title: config.titulo,
        Author: config.autor || "Nexus Digital Holding",
        Creator: "Nexus MAX",
      },
    });

    const chunks = [];
    doc.on("data", c => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const PAGE_W = 595.28;
    const PAGE_H = 841.89;
    const MARGIN = 50;
    const CONTENT_W = PAGE_W - MARGIN * 2;
    const HEADER_H = cabecalho.ativo ? 40 : 0;
    const FOOTER_H = rodape.ativo ? 35 : 0;
    const CONTENT_TOP = MARGIN + HEADER_H;
    const CONTENT_BOTTOM = PAGE_H - MARGIN - FOOTER_H;

    let pageNum = 0;

    function hexToRgb(hex) {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return [r, g, b];
    }

    function addHeader(title) {
      if (!cabecalho.ativo) return;
      doc.rect(0, MARGIN, PAGE_W, HEADER_H).fill(cores.headerBg || cores.primary);
      doc.fillColor(cores.headerText || "#FFFFFF")
        .font(fontes.body)
        .fontSize(9)
        .text(cabecalho.texto || title, MARGIN, MARGIN + 14, {
          width: CONTENT_W - 60,
          align: "left",
        });
      if (pageNum > 1) {
        doc.fillColor(cores.headerText || "#FFFFFF")
          .font(fontes.body)
          .fontSize(9)
          .text(config.titulo, 0, MARGIN + 14, { width: PAGE_W - MARGIN, align: "right" });
      }
    }

    function addFooter() {
      if (!rodape.ativo) return;
      const y = PAGE_H - MARGIN - FOOTER_H;
      doc.moveTo(MARGIN, y + 6).lineTo(PAGE_W - MARGIN, y + 6)
        .strokeColor(cores.primary).lineWidth(0.5).stroke();
      const footerText = rodape.texto || (config.autor ? `© ${new Date().getFullYear()} ${config.autor}` : "");
      if (footerText) {
        doc.fillColor(cores.text).font(fontes.body).fontSize(8)
          .text(footerText, MARGIN, y + 12, { width: CONTENT_W - 60, align: "left" });
      }
      if (rodape.numeroPagina !== false) {
        doc.fillColor(cores.text).font(fontes.body).fontSize(8)
          .text(`${pageNum}`, 0, y + 12, { width: PAGE_W - MARGIN, align: "right" });
      }
    }

    function newPage() {
      pageNum++;
      doc.addPage({ size: "A4", margin: 0 });
      doc.rect(0, 0, PAGE_W, PAGE_H).fill(cores.background);
      addHeader(config.titulo);
      addFooter();
      doc.y = CONTENT_TOP + 10;
    }

    function writeTitle(text, level = 1) {
      const sizes = { 1: 22, 2: 16, 3: 13 };
      const size = sizes[level] || 13;
      const font = level === 1 ? fontes.title : fontes.body;
      const color = level === 1 ? cores.primary : cores.secondary || cores.primary;

      if (doc.y + size * 2.5 > CONTENT_BOTTOM) newPage();
      doc.fillColor(color).font(font).fontSize(size)
        .text(text, MARGIN, doc.y, { width: CONTENT_W });
      doc.y += level === 1 ? 12 : 8;
    }

    function writeText(text) {
      if (!text) return;
      const lines = text.split("\n");
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) { doc.y += 6; continue; }
        if (doc.y + 30 > CONTENT_BOTTOM) newPage();
        doc.fillColor(cores.text).font(fontes.body).fontSize(10.5)
          .text(trimmed, MARGIN, doc.y, { width: CONTENT_W, lineGap: 3 });
        doc.y += 6;
      }
    }

    function writeHighlight(text) {
      if (doc.y + 40 > CONTENT_BOTTOM) newPage();
      const boxY = doc.y;
      doc.rect(MARGIN, boxY, CONTENT_W, 32).fill(cores.primary + "18");
      doc.moveTo(MARGIN, boxY).lineTo(MARGIN, boxY + 32)
        .strokeColor(cores.accent || cores.primary).lineWidth(3).stroke();
      doc.fillColor(cores.text).font(fontes.title).fontSize(9.5)
        .text(`  ${text}`, MARGIN + 10, boxY + 10, { width: CONTENT_W - 20 });
      doc.y = boxY + 38;
    }

    // ── CAPA ──────────────────────────────
    pageNum++;
    doc.addPage({ size: "A4", margin: 0 });
    doc.rect(0, 0, PAGE_W, PAGE_H).fill(cores.coverBg || cores.secondary);

    // Barra decorativa
    doc.rect(0, PAGE_H * 0.55, PAGE_W, 6).fill(cores.coverAccent || cores.accent || cores.primary);

    // Título na capa
    doc.fillColor(cores.coverText || "#FFFFFF")
      .font(fontes.title).fontSize(32)
      .text(conteudo.capa.titulo || config.titulo, MARGIN, PAGE_H * 0.28, {
        width: CONTENT_W, align: "center",
      });

    if (conteudo.capa.subtitulo) {
      doc.fillColor((cores.coverText || "#FFFFFF") + "CC")
        .font(fontes.body).fontSize(15)
        .text(conteudo.capa.subtitulo, MARGIN, doc.y + 16, {
          width: CONTENT_W, align: "center",
        });
    }

    if (conteudo.capa.tagline) {
      doc.fillColor(cores.coverAccent || cores.accent || "#FFFFFF")
        .font(fontes.body).fontSize(11)
        .text(conteudo.capa.tagline, MARGIN, doc.y + 20, {
          width: CONTENT_W, align: "center",
        });
    }

    if (config.autor) {
      doc.fillColor((cores.coverText || "#FFFFFF") + "AA")
        .font(fontes.body).fontSize(10)
        .text(config.autor, MARGIN, PAGE_H - 80, { width: CONTENT_W, align: "center" });
    }

    // ── INTRODUÇÃO ──────────────────────────
    newPage();
    writeTitle("Introdução", 1);
    writeText(conteudo.introducao);

    // ── SEÇÕES ──────────────────────────────
    for (const secao of (conteudo.secoes || [])) {
      newPage();
      writeTitle(secao.titulo, 1);
      writeText(secao.conteudo);
      if (secao.destaques && secao.destaques.length) {
        doc.y += 6;
        for (const d of secao.destaques) writeHighlight(d);
      }
    }

    // ── CONCLUSÃO ──────────────────────────
    newPage();
    writeTitle("Conclusão & Próximos Passos", 1);
    writeText(conteudo.conclusao);

    // ── SOBRE O AUTOR ──────────────────────
    if (conteudo.sobre_autor) {
      doc.y += 20;
      if (doc.y + 80 > CONTENT_BOTTOM) newPage();
      doc.rect(MARGIN, doc.y, CONTENT_W, 2).fill(cores.primary);
      doc.y += 10;
      writeTitle("Sobre o Autor", 2);
      writeText(conteudo.sobre_autor);
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
