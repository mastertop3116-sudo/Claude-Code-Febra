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
// Gerar PDF — Design profissional v3
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
    const ML = 52, MR = 52, CW = W - ML - MR;
    const STRIPE = 5;
    const CAB_H  = cabAtivo ? 32 : 0;
    const ROD_H  = rodAtivo ? 34 : 0;
    const CT = STRIPE + CAB_H + 16;
    const CB = H - ROD_H - 12;

    // Cor de fundo das páginas de conteúdo: usa o background do tema
    const PAGE_BG = C.background || "#FFFFFF";
    // Cor sólida para callout (branca com borda) — sempre legível
    const CALLOUT_BG = "#FFFFFF";
    const TEXT_DARK  = "#1A1A1A";
    const TEXT_MID   = "#555555";

    let pageNum = 0;
    let cy = CT;

    // ── Chrome de cada página de conteúdo ──
    function drawChrome() {
      // Fundo completo da página
      doc.rect(0, 0, W, H).fill(PAGE_BG);
      // Stripe topo
      doc.rect(0, 0, W, STRIPE).fill(C.primary);

      if (cabAtivo) {
        // Fundo cabeçalho branco
        doc.rect(0, STRIPE, W, CAB_H).fill("#FFFFFF");
        // Linha divisória leve
        doc.rect(0, STRIPE + CAB_H - 1, W, 1).fill("#E8E8E8");
        // Texto marca (cor primária)
        doc.fillColor(C.primary).font(F.title).fontSize(8)
          .text(cabTexto.toUpperCase(), ML, STRIPE + 10, { width: CW * 0.6, characterSpacing: 0.5 });
        // Título doc (cinza, alinhado à direita)
        if (pageNum > 1) {
          doc.fillColor("#AAAAAA").font(F.body).fontSize(7.5)
            .text(config.titulo, ML, STRIPE + 11, { width: CW, align: "right" });
        }
      }

      if (rodAtivo) {
        const fy = H - ROD_H;
        // Linha topo do rodapé
        doc.rect(0, fy, W, 1).fill("#E8E8E8");
        // Fundo rodapé branco
        doc.rect(0, fy + 1, W, ROD_H).fill("#FFFFFF");
        if (rodTexto.trim()) {
          doc.fillColor("#BBBBBB").font(F.body).fontSize(7.5)
            .text(rodTexto, ML, fy + 12, { width: CW - 40 });
        }
        if (showPagNum) {
          const pcx = W - ML - 13, pcy = fy + 17;
          doc.circle(pcx, pcy, 13).fill(C.primary);
          doc.fillColor("#FFFFFF").font(F.title).fontSize(8.5)
            .text(String(pageNum), pcx - 13, pcy - 6, { width: 26, align: "center" });
        }
      }
    }

    function newPage() {
      pageNum++;
      doc.addPage({ size: "A4", margin: 0 });
      drawChrome();
      cy = CT;
    }

    // ── Título de seção (inline, sem forçar nova página) ──
    function sectionTitle(titulo, numStr) {
      // Se não tiver espaço suficiente para o título + algum conteúdo, nova página
      if (cy + 80 > CB) newPage();

      // Barra lateral esquerda colorida
      const barH = 38;
      doc.rect(ML, cy, 5, barH).fill(C.primary);

      // Número pequeno acima do título
      if (numStr) {
        doc.fillColor(C.accent || C.primary).font(F.title).fontSize(9)
          .text(numStr, ML + 14, cy + 2, { width: 30, characterSpacing: 1 });
      }

      // Título principal
      const titleY = numStr ? cy + 13 : cy + 8;
      doc.fillColor(C.primary).font(F.title).fontSize(18)
        .text(titulo, ML + 14, titleY, { width: CW - 18 });

      cy = doc.y + 14;
    }

    // ── Texto corrido ──
    function writeBody(text) {
      if (!text) return;
      // Divide por ponto-e-vírgula (separador seguro do Gemini) ou por ponto seguido de espaço
      const parts = String(text)
        .replace(/([.!?])\s+/g, "$1|")
        .split(/[;|]/)
        .map(p => p.trim())
        .filter(Boolean);

      for (const part of parts) {
        if (cy + 26 > CB) newPage();
        doc.fillColor(TEXT_DARK).font(F.body).fontSize(11)
          .text(part, ML, cy, { width: CW, lineGap: 4, paragraphGap: 0 });
        cy = doc.y + 8;
      }
    }

    // ── Callout box (branco + borda sólida = sempre legível) ──
    function writeCallout(text) {
      if (!text) return;
      const est = doc.heightOfString(text, { width: CW - 50, fontSize: 10 });
      const boxH = Math.max(40, est + 24);
      if (cy + boxH + 6 > CB) newPage();

      // Fundo branco
      doc.rect(ML, cy, CW, boxH).fill(CALLOUT_BG);
      // Borda externa sutil
      doc.rect(ML, cy, CW, boxH).lineWidth(0.5).strokeColor("#DDDDDD").stroke();
      // Borda esquerda colorida sólida
      doc.rect(ML, cy, 5, boxH).fill(C.accent || C.primary);
      // Marcador
      doc.fillColor(C.accent || C.primary).font(F.title).fontSize(12)
        .text("▸", ML + 12, cy + (boxH / 2) - 7, { width: 14 });
      // Texto sempre escuro
      doc.fillColor(TEXT_DARK).font(F.body).fontSize(10)
        .text(text.trim(), ML + 30, cy + 12, { width: CW - 42, lineGap: 3 });
      cy = doc.y + 12;
    }

    // ── Divisor leve ──
    function writeDivider() {
      if (cy + 14 > CB) return;
      doc.rect(ML + CW * 0.3, cy + 6, CW * 0.4, 1).fill(C.primary + "55");
      doc.circle(W / 2, cy + 6, 3).fill(C.primary);
      cy += 18;
    }

    // ════════════════════════════════════════
    // CAPA — fundo escuro + decoração geométrica
    // ════════════════════════════════════════
    pageNum++;
    doc.addPage({ size: "A4", margin: 0 });
    const COV = C.coverBg || C.secondary || "#1D1D1D";
    const COV_TEXT = C.coverText || "#FFFFFF";
    const COV_ACC  = C.coverAccent || C.accent || C.primary;

    doc.rect(0, 0, W, H).fill(COV);

    // Retângulo de acento no canto superior esquerdo
    doc.rect(0, 0, W * 0.45, 8).fill(COV_ACC);

    // Bloco de cor no terço inferior (faz a capa "partir" em 2 zonas)
    doc.rect(0, H * 0.72, W, H * 0.28).fill(COV_ACC);

    // Círculo decorativo grande (direita, meio)
    doc.circle(W + 30, H * 0.38, 210).fill(COV_ACC + "22");

    // Área do título: fundo semi-sólido para garantir contraste
    doc.rect(ML - 10, H * 0.28, CW + 20, 200).fill(COV + "CC");

    // Linha accent antes do título
    doc.rect(ML, H * 0.29, 48, 4).fill(COV_ACC);

    // Título
    doc.fillColor(COV_TEXT).font(F.title).fontSize(34)
      .text(conteudo.capa.titulo || config.titulo, ML, H * 0.31,
        { width: CW, lineGap: 6 });

    const afterTitle = doc.y + 16;

    // Linha separadora
    doc.rect(ML, afterTitle, CW * 0.28, 2).fill(COV_ACC);

    // Subtítulo
    if (conteudo.capa.subtitulo) {
      doc.fillColor(COV_TEXT + "CC").font(F.body).fontSize(13)
        .text(conteudo.capa.subtitulo, ML, afterTitle + 14, { width: CW });
    }

    // Tagline (na faixa inferior colorida)
    if (conteudo.capa.tagline) {
      doc.fillColor(COV).font(F.body).fontSize(11)
        .text(conteudo.capa.tagline, ML, H * 0.745, { width: CW, align: "center" });
    }

    // Autor
    if (config.autor) {
      doc.fillColor(COV).font(F.title).fontSize(10)
        .text(config.autor.toUpperCase(), ML, H * 0.81,
          { width: CW, align: "center", characterSpacing: 1 });
    }
    doc.fillColor(COV + "AA").font(F.body).fontSize(8)
      .text(String(new Date().getFullYear()), ML, H * 0.84,
        { width: CW, align: "center" });

    // ════════════════════════════════════════
    // INTRODUÇÃO
    // ════════════════════════════════════════
    newPage();
    sectionTitle("Introdução", null);
    writeBody(conteudo.introducao);

    // ════════════════════════════════════════
    // SEÇÕES — fluem na mesma página se houver espaço
    // ════════════════════════════════════════
    for (let i = 0; i < (conteudo.secoes || []).length; i++) {
      const secao = conteudo.secoes[i];
      // Só nova página se restar menos de 200pt de espaço
      if (cy + 200 > CB) newPage();
      else cy += 20; // espaço entre seções na mesma página
      sectionTitle(secao.titulo, String(i + 1).padStart(2, "0"));
      writeBody(secao.conteudo);
      if (secao.destaques?.length) {
        cy += 6;
        writeDivider();
        for (const d of secao.destaques) writeCallout(d);
      }
    }

    // ════════════════════════════════════════
    // CONCLUSÃO
    // ════════════════════════════════════════
    if (cy + 200 > CB) newPage();
    else cy += 20;
    sectionTitle("Conclusão & Próximos Passos", null);
    writeBody(conteudo.conclusao);

    // ════════════════════════════════════════
    // SOBRE O AUTOR
    // ════════════════════════════════════════
    if (conteudo.sobre_autor) {
      if (cy + 110 > CB) newPage();
      cy += 18;
      writeDivider();
      // Box "Sobre o Autor" com fundo branco e borda primária
      const sobreH = Math.max(76, doc.heightOfString(conteudo.sobre_autor, { width: CW - 32, fontSize: 10 }) + 36);
      doc.rect(ML, cy, CW, sobreH).fill("#FFFFFF");
      doc.rect(ML, cy, CW, sobreH).lineWidth(0.5).strokeColor("#DDDDDD").stroke();
      doc.rect(ML, cy, 5, sobreH).fill(C.primary);
      doc.fillColor(C.primary).font(F.title).fontSize(11)
        .text("Sobre o Autor", ML + 16, cy + 10, { width: CW - 26 });
      doc.fillColor(TEXT_DARK).font(F.body).fontSize(10)
        .text(conteudo.sobre_autor, ML + 16, cy + 30, { width: CW - 26, lineGap: 4 });
      cy = doc.y + 16;
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
