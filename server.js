// ============================================
// NEXUS — Servidor Principal
// Bot Telegram (webhook mode) + GG Checkout
// ============================================

require("dotenv").config();
const express     = require("express");
const compression = require("compression");
const app = express();

app.use(compression());
app.use(express.json({ limit: "8mb", verify: (req, _, buf) => { req.rawBody = buf; } }));

// ──────────────────────────────────────────
// Bot do Telegram em modo webhook
// ──────────────────────────────────────────
const TelegramBot = require("node-telegram-bot-api");
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);

// Registra webhook no Telegram quando o servidor inicia
async function registerWebhook() {
  const url = process.env.RENDER_URL;
  if (!url) {
    // Sem URL pública: usa polling (desenvolvimento local)
    console.log("[Bot] Modo local: polling ativado");
    bot.startPolling();
    return;
  }
  const webhookUrl = `${url}/telegram`;
  await bot.setWebHook(webhookUrl);
  console.log(`[Bot] Webhook registrado: ${webhookUrl}`);
}

// Recebe updates do Telegram
app.post("/telegram", (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// Carrega os handlers do bot
require("./telegram/handlers")(bot);

// ──────────────────────────────────────────
// Webhook GG Checkout
// ──────────────────────────────────────────
const ggCheckout = require("./departments/finance/webhook_ggcheckout");
app.use("/webhook", ggCheckout);

// ──────────────────────────────────────────
// Gerador de Entregáveis (web + API com progresso SSE)
// ──────────────────────────────────────────
const path = require("path");
app.use(express.static(path.join(__dirname, "public"), { maxAge: "1h" }));
app.use("/fonts", express.static(path.join(__dirname, "assets/fonts"), { maxAge: "7d" }));

app.get("/criar", (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.sendFile(path.join(__dirname, "public", "criar.html"));
});

// Jobs em memória: jobId → { status, progress, message, result, error }
const criarJobs = new Map();
function limparJobsAntigos() {
  const limite = Date.now() - 30 * 60 * 1000; // 30 min (pdf fica disponível para fetch)
  for (const [id, job] of criarJobs.entries()) {
    if (job.criadoEm < limite) criarJobs.delete(id);
  }
}

// GET /api/produtos → lista produtos salvos (recentes primeiro)
app.get("/api/produtos", async (req, res) => {
  try {
    const { createClient } = require("@supabase/supabase-js");
    const _supa = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
    const { data, error } = await _supa
      .from("produtos")
      .select("id, nome, nicho, publico_alvo, preco, created_at")
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ produtos: data || [] });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/produto → salva produto + lançamento no Supabase
app.post("/api/produto", async (req, res) => {
  try {
    const { createClient } = require("@supabase/supabase-js");
    const _supa = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
    const { nome, nicho, publico_alvo, preco, relatorio, telegram_id } = req.body;
    if (!nome) return res.status(400).json({ error: "nome obrigatório" });

    const { data: produto, error: errP } = await _supa
      .from("produtos")
      .insert({ nome, nicho: nicho || null, publico_alvo: publico_alvo || null, preco: preco || null, telegram_id: telegram_id || "web" })
      .select()
      .single();
    if (errP) return res.status(500).json({ error: errP.message });

    let lancamento = null;
    if (relatorio) {
      const { data: lanc, error: errL } = await _supa
        .from("lancamentos")
        .insert({ produto_id: produto.id, telegram_id: telegram_id || "web", nome, relatorio_texto: relatorio.slice(0, 50000) })
        .select()
        .single();
      if (!errL) lancamento = lanc;
    }

    res.json({ produto, lancamento });
  } catch (e) {
    console.error("[/api/produto]", e.message);
    res.status(500).json({ error: e.message });
  }
});

// POST /api/wizard → gera campos do formulário via IA (3 perguntas → form preenchido)
app.post("/api/wizard", async (req, res) => {
  try {
    const { nicho, avatar, beneficio, tipo } = req.body;
    if (!nicho) return res.status(400).json({ error: "nicho obrigatório" });
    const { openaiJson } = require("./integrations/openai");
    const SYSTEM = `Você é especialista em criação de infoprodutos brasileiros de baixo ticket (R$17–R$97).
Gere campos otimizados para formulário de criação de produto digital. APENAS JSON:
{
  "titulo": "headline poderosa máx 10 palavras, sem ponto final — ex: 7 Segredos do Emagrecimento sem Sofrimento",
  "subtitulo": "complemento do título máx 15 palavras — reforça benefício principal",
  "nicho_refinado": "nicho específico com público e dor, máx 60 chars",
  "num_paginas": 15,
  "num_capitulos": 7,
  "tipo_sugerido": "ebook|workbook|checklist|planner|script_vsl|cheat_sheet|pregacoes"
}
IMPORTANTE: num_paginas deve ser entre 10 e 15 (máx 20). num_capitulos entre 5 e 8 (máx 10).`;
    const prompt = `Nicho: ${nicho}\nAvatar: ${avatar || "não informado"}\nBenefício principal: ${beneficio || "não informado"}\nTipo preferido: ${tipo || "automático"}`;
    const resultado = JSON.parse(await openaiJson(prompt, SYSTEM));
    res.json(resultado);
  } catch (e) {
    console.error("[/api/wizard]", e.message);
    res.status(500).json({ error: e.message });
  }
});

// POST /api/criar → inicia job, retorna jobId imediatamente
app.post("/api/criar", (req, res) => {
  limparJobsAntigos();
  const jobId = Math.random().toString(36).slice(2, 10);
  criarJobs.set(jobId, { status: "running", progress: 0, message: "Iniciando...", criadoEm: Date.now() });
  res.json({ jobId });

  // Killer de segurança: 15 minutos para ebooks/infoprodutos (30+ seções + Gamma polling podem somar >5 min)
  const tipoBody = req.body.tipo || "ebook";
  const INFOPRODUTOS = new Set(["ebook", "workbook", "script_vsl", "planner", "cheat_sheet", "certificado", "checklist", "pregacoes"]);
  const jobTimeoutMs = INFOPRODUTOS.has(tipoBody) ? 15 * 60 * 1000 : 5 * 60 * 1000;
  const jobKiller = setTimeout(() => {
    const job = criarJobs.get(jobId);
    if (job && job.status === "running") {
      criarJobs.set(jobId, { status: "error", message: `Timeout: geração demorou mais de ${jobTimeoutMs / 60000} minutos.`, criadoEm: Date.now() });
      console.error(`[/api/criar] Job ${jobId} encerrado por timeout (${jobTimeoutMs / 1000}s)`);
    }
  }, jobTimeoutMs);

  const { createClient } = require("@supabase/supabase-js");
  const _supa = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

  const telegramId = req.body.telegram_id || "web";
  Promise.resolve()
    .then(() => {
      const { generate } = require("./departments/creative/deliverable_generator");
      return _supa.from("expert_dna").select("*").eq("telegram_id", telegramId).single()
        .then(({ data: dna }) => {
          const body = { ...req.body };
          if (dna) {
            body.autor  = body.autor  || dna.marca;
            body.nicho  = body.nicho  || dna.nicho;
            body.avatar_publico = body.avatar_publico || dna.avatar_publico;
          }
          return generate({
            ...body,
            onProgress: async (pct, msg) => {
              const job = criarJobs.get(jobId);
              if (job) { job.progress = pct; job.message = msg; }
            },
          });
        });
    })
    .then(resultado => {
      clearTimeout(jobKiller);
      criarJobs.set(jobId, {
        status: "done", progress: 100, message: "Pronto!", criadoEm: Date.now(),
        titulo: resultado.titulo,
        pdf: resultado.pdf ? resultado.pdf.toString("base64") : null,
        pdfFilename: resultado.pdfFilename,
        docx: resultado.docx ? resultado.docx.toString("base64") : null,
        docxFilename: resultado.docxFilename,
        gammaUrl: resultado.gammaUrl || null,
        gammaSource: resultado.gammaSource || false,
        gammaError: resultado.gammaError || null,
        copyContracapa: resultado.copyContracapa || "",
      });
    })
    .catch(e => {
      clearTimeout(jobKiller);
      console.error("[/api/criar]", e.message);
      criarJobs.set(jobId, { status: "error", message: e.message, criadoEm: Date.now() });
    });
});

// GET /api/criar/progress/:jobId → SSE stream de progresso em tempo real
app.get("/api/criar/progress/:jobId", (req, res) => {
  const { jobId } = req.params;
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const enviar = (data) => res.write(`data: ${JSON.stringify(data)}\n\n`);

  const tick = setInterval(() => {
    const job = criarJobs.get(jobId);
    if (!job) { enviar({ error: "Job não encontrado" }); clearInterval(tick); res.end(); return; }

    enviar({ progress: job.progress, message: job.message, status: job.status });

    if (job.status === "done") {
      // Envia só o sinal leve — payload pesado (pdf/docx base64) fica no job para fetch separado
      enviar({ done: true, titulo: job.titulo });
      clearInterval(tick);
      res.end();
      // NÃO deleta o job aqui — frontend busca via GET /api/criar/result/:jobId
    } else if (job.status === "error") {
      enviar({ error: job.message });
      clearInterval(tick);
      criarJobs.delete(jobId);
      res.end();
    }
  }, 600);

  req.on("close", () => clearInterval(tick));
});

// GET /api/criar/result/:jobId → retorna payload completo (pdf, docx, gammaUrl) após conclusão
app.get("/api/criar/result/:jobId", (req, res) => {
  const job = criarJobs.get(req.params.jobId);
  if (!job) return res.status(404).json({ error: "Resultado não encontrado ou expirado" });
  if (job.status !== "done") return res.status(202).json({ status: job.status, progress: job.progress });
  const result = {
    titulo: job.titulo,
    pdf: job.pdf,
    pdfFilename: job.pdfFilename,
    docx: job.docx,
    docxFilename: job.docxFilename,
    gammaUrl: job.gammaUrl,
    gammaSource: job.gammaSource,
    gammaError: job.gammaError || null,
    copyContracapa: job.copyContracapa || "",
  };
  criarJobs.delete(req.params.jobId);
  res.json(result);
});

// ──────────────────────────────────────────
// Gerador de Carrosseis (SSE igual ao /api/criar)
// ──────────────────────────────────────────
const carouselJobs = new Map();
function limparCarouselJobs() {
  const limite = Date.now() - 10 * 60 * 1000;
  for (const [id, job] of carouselJobs.entries()) {
    if (job.criadoEm < limite) carouselJobs.delete(id);
  }
}

// POST /api/carousel → inicia job, retorna jobId
app.post("/api/carousel", (req, res) => {
  limparCarouselJobs();
  const jobId = Math.random().toString(36).slice(2, 10);
  carouselJobs.set(jobId, { status: "running", progress: 0, message: "Iniciando carrossel...", criadoEm: Date.now() });
  res.json({ jobId });

  const jobKiller = setTimeout(() => {
    const job = carouselJobs.get(jobId);
    if (job && job.status === "running") {
      carouselJobs.set(jobId, { status: "error", message: "Timeout: carrossel demorou mais de 3 minutos.", criadoEm: Date.now() });
    }
  }, 3 * 60 * 1000);

  const { gerarCarrossel } = require("./departments/creative/carousel_generator");
  const { gerarConteudoRico } = require("./departments/creative/content_specialist");

  (async () => {
    try {
      const setJob = (p, m) => { const j = carouselJobs.get(jobId); if (j) { j.progress = p; j.message = m; } };

      setJob(10, "Gerando conteúdo com Gemini Pro...");
      const conteudo = await gerarConteudoRico({
        tipo:       req.body.tipo       || "ebook",
        titulo:     req.body.titulo     || "Entregável",
        descricao:  req.body.descricao  || req.body.titulo,
        temaKey:    req.body.temaKey    || "produtividade",
        paginas:    parseInt(req.body.paginas) || 10,
        avatar:     req.body.avatar     || "",
        numCapitulos: req.body.numCapitulos,
      });

      setJob(60, "Renderizando slides...");
      const resultado = await gerarCarrossel({
        titulo:       req.body.titulo       || "Entregável",
        subtitulo:    req.body.subtitulo    || "",
        autor:        req.body.autor        || "Nexus Digital",
        temaKey:      req.body.temaKey      || "produtividade",
        formato:      req.body.formato      || "instagram_feed",
        maxSlides:    parseInt(req.body.maxSlides) || 6,
        fonteTitulo:  req.body.fonteTitulo  || "Anton",
        fonteCorpo:   req.body.fonteCorpo   || "Poppins",
      }, conteudo);

      clearTimeout(jobKiller);
      carouselJobs.set(jobId, {
        status: "done", progress: 100, message: "Carrossel pronto!", criadoEm: Date.now(),
        slides: resultado.buffers.map(b => b.toString("base64")),
        count:  resultado.count,
        formato: resultado.formato,
        titulo: req.body.titulo || "carrossel",
      });
    } catch (e) {
      clearTimeout(jobKiller);
      console.error("[/api/carousel]", e.message);
      carouselJobs.set(jobId, { status: "error", message: e.message, criadoEm: Date.now() });
    }
  })();
});

// GET /api/carousel/progress/:jobId → SSE stream
app.get("/api/carousel/progress/:jobId", (req, res) => {
  const { jobId } = req.params;
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const enviar = (data) => res.write(`data: ${JSON.stringify(data)}\n\n`);

  const tick = setInterval(() => {
    const job = carouselJobs.get(jobId);
    if (!job) { enviar({ error: "Job não encontrado" }); clearInterval(tick); res.end(); return; }

    enviar({ progress: job.progress, message: job.message, status: job.status });

    if (job.status === "done") {
      enviar({ done: true, slides: job.slides, count: job.count, formato: job.formato, titulo: job.titulo });
      clearInterval(tick);
      carouselJobs.delete(jobId);
      res.end();
    } else if (job.status === "error") {
      enviar({ error: job.message });
      clearInterval(tick);
      carouselJobs.delete(jobId);
      res.end();
    }
  }, 600);

  req.on("close", () => clearInterval(tick));
});

// ──────────────────────────────────────────
// Gerador de Roteiros + Edição (SSE)
// ──────────────────────────────────────────
const roteiroJobs = new Map();
function limparRoteiroJobs() {
  const limite = Date.now() - 10 * 60 * 1000;
  for (const [id, job] of roteiroJobs.entries()) {
    if (job.criadoEm < limite) roteiroJobs.delete(id);
  }
}

app.post("/api/roteiro", (req, res) => {
  limparRoteiroJobs();
  const jobId = Math.random().toString(36).slice(2, 10);
  roteiroJobs.set(jobId, { status: "running", progress: 0, message: "Iniciando...", criadoEm: Date.now() });
  res.json({ jobId });

  const jobKiller = setTimeout(() => {
    const job = roteiroJobs.get(jobId);
    if (job && job.status === "running") {
      roteiroJobs.set(jobId, { status: "error", message: "Timeout: roteiro demorou mais de 3 minutos.", criadoEm: Date.now() });
    }
  }, 3 * 60 * 1000);

  const { run: runRoteirista } = require("./agents/roteirista");
  const { run: runEditor } = require("./agents/editor");
  const { createClient } = require("@supabase/supabase-js");
  const _supR = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

  (async () => {
    try {
      const setJob = (p, m) => { const j = roteiroJobs.get(jobId); if (j) { j.progress = p; j.message = m; } };

      let produto = req.body.produto;
      if (!produto && req.body.produto_id) {
        setJob(5, "Buscando produto...");
        const { data } = await _supR.from("produtos").select("*").eq("id", req.body.produto_id).single();
        produto = data;
      }
      if (!produto) throw new Error("Produto não informado");

      let lancamento = null;
      if (req.body.lancamento_id) {
        const { data } = await _supR.from("lancamentos").select("*").eq("id", req.body.lancamento_id).single();
        lancamento = data;
      }

      setJob(20, "Criando roteiro...");
      const roteiro = await runRoteirista({
        produto,
        lancamento,
        modo: req.body.modo || "venda",
        plataforma: req.body.plataforma || "reels",
        duracao: req.body.duracao || "curto",
      });

      setJob(70, "Gerando instruções de edição...");
      const edicao = await runEditor({ roteiro, plataforma: req.body.plataforma || "reels" });

      setJob(90, "Salvando resultado...");
      await _supR.from("criativos").insert({
        tipo: "roteiro",
        produto_id: req.body.produto_id || null,
        lancamento_id: req.body.lancamento_id || null,
        telegram_id: req.body.telegram_id || null,
        plataforma: req.body.plataforma || "reels",
        modo: req.body.modo || "venda",
        roteiro,
        edicao,
      }).catch(e => console.warn("[/api/roteiro] Aviso ao salvar criativo:", e.message));

      clearTimeout(jobKiller);
      roteiroJobs.set(jobId, {
        status: "done", progress: 100, message: "Roteiro pronto!", criadoEm: Date.now(),
        roteiro,
        edicao,
      });
    } catch (e) {
      clearTimeout(jobKiller);
      console.error("[/api/roteiro]", e.message);
      roteiroJobs.set(jobId, { status: "error", message: e.message, criadoEm: Date.now() });
    }
  })();
});

app.get("/api/roteiro/progress/:jobId", (req, res) => {
  const { jobId } = req.params;
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const enviar = (data) => res.write(`data: ${JSON.stringify(data)}\n\n`);

  const tick = setInterval(() => {
    const job = roteiroJobs.get(jobId);
    if (!job) { enviar({ error: "Job não encontrado" }); clearInterval(tick); res.end(); return; }

    enviar({ progress: job.progress, message: job.message, status: job.status });

    if (job.status === "done") {
      enviar({ done: true, roteiro: job.roteiro, edicao: job.edicao });
      clearInterval(tick);
      roteiroJobs.delete(jobId);
      res.end();
    } else if (job.status === "error") {
      enviar({ error: job.message });
      clearInterval(tick);
      roteiroJobs.delete(jobId);
      res.end();
    }
  }, 600);

  req.on("close", () => clearInterval(tick));
});

// ──────────────────────────────────────────
// VSL Chat — coleta contexto e gera VSL long-form
// ──────────────────────────────────────────
app.post("/api/vsl/chat", async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "messages[] obrigatório" });
    }

    const { collectContext, generateVSL } = require("./agents/vsl");
    const result = await collectContext(messages);

    if (result.pronto && result.contexto) {
      // Contexto suficiente — gera a VSL
      const vslText = await generateVSL(result.contexto);
      return res.json({
        reply:      result.resposta || "VSL gerada com sucesso!",
        done:       true,
        vsl_text:   vslText,
        contexto:   result.contexto,
      });
    }

    // Ainda coletando — devolve próxima pergunta
    res.json({
      reply: result.resposta || result.pergunta || "Pode continuar.",
      done:  false,
    });
  } catch (e) {
    console.error("[/api/vsl/chat]", e.message);
    res.status(500).json({ error: e.message });
  }
});

// ──────────────────────────────────────────
// Gerador de Criativo (imagem PNG para Meta Ads)
// ──────────────────────────────────────────
app.post("/api/criativo", async (req, res) => {
  try {
    const { headline, sub, cta, marca, temaKey = "impacto", formato = "instagram_feed" } = req.body;
    if (!headline) return res.status(400).json({ error: "headline obrigatória" });

    const { criarCriativoHTML, getDimensoes } = require("./departments/creative/criativo_template");
    const { renderSlide } = require("./departments/creative/render_engine");

    const htmlStr = criarCriativoHTML({ headline, sub, cta, marca, temaKey, formato });
    const [w, h]  = getDimensoes(formato);
    const buffer  = await renderSlide(htmlStr, w, h);

    res.json({
      image:    buffer.toString("base64"),
      formato,
      filename: headline.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 40) + "_criativo.png",
    });
  } catch (e) {
    console.error("[/api/criativo]", e.message);
    res.status(500).json({ error: e.message });
  }
});

// ──────────────────────────────────────────
// Gerador de Script VSL (roteiro escrito em PDF)
// ──────────────────────────────────────────
app.post("/api/script-vsl", async (req, res) => {
  try {
    const { titulo, descricao, avatar, autor, modo = "vsl", plataforma = "youtube" } = req.body;
    if (!titulo) return res.status(400).json({ error: "titulo obrigatório" });

    const { run: runRoteirista } = require("./agents/roteirista");
    const PDFDocument = require("pdfkit");

    const roteiro = await runRoteirista({
      produto: {
        nome: titulo,
        tipo: "vsl",
        nicho: descricao || titulo,
        publico_alvo: avatar || descricao || "",
        beneficio_principal: descricao || titulo,
        preco: "",
      },
      modo,
      plataforma,
      duracao: "vsl",
    });

    // Gera PDF do roteiro com PDFKit
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks = [];
    doc.on("data", c => chunks.push(c));
    await new Promise(resolve => {
      doc.on("end", resolve);

      // Capa
      doc.rect(0, 0, doc.page.width, 8).fill("#E63946");
      doc.moveDown(1);
      doc.fontSize(10).fillColor("#888888").text("ROTEIRO VSL — NEXUS FORGE", { align: "center" });
      doc.moveDown(0.5);
      doc.fontSize(26).fillColor("#111111").text(roteiro.titulo || titulo, { align: "center" });
      doc.moveDown(0.5);
      doc.fontSize(12).fillColor("#666666").text(
        `Formato: ${roteiro.formato || "VSL"}  ·  Duração estimada: ${roteiro.duracao_estimada || "3–5 min"}  ·  ${roteiro.framework || "AIDA"}`,
        { align: "center" }
      );
      doc.moveDown(0.5);
      doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).stroke("#DDDDDD");
      doc.moveDown(1.5);

      // Blocos do roteiro
      for (const bloco of (roteiro.blocos || [])) {
        if (!bloco.fala) continue;

        // Cabeçalho do bloco
        doc.rect(50, doc.y, doc.page.width - 100, 28).fill("#F5F5F5");
        doc.fontSize(11).fillColor("#E63946")
          .text(`BLOCO ${bloco.id} — ${bloco.nome}`, 58, doc.y - 22, { continued: true });
        doc.fillColor("#999999").text(`  (${bloco.tempo})`, { continued: false });
        doc.moveDown(0.8);

        // Narração
        doc.fontSize(10).fillColor("#333333").text("🎙 NARRAÇÃO:", { continued: false });
        doc.fontSize(12).fillColor("#111111").text(bloco.fala, { indent: 16, lineGap: 4 });
        doc.moveDown(0.5);

        // Tela (texto na tela)
        if (bloco.tela) {
          doc.fontSize(10).fillColor("#333333").text("📺 TELA:", { continued: false });
          doc.fontSize(11).fillColor("#555555").text(bloco.tela, { indent: 16, lineGap: 3 });
          doc.moveDown(0.5);
        }

        // Câmera
        if (bloco.camera) {
          doc.fontSize(10).fillColor("#333333").text("🎬 CÂMERA:", { continued: false });
          doc.fontSize(11).fillColor("#555555").text(bloco.camera, { indent: 16, lineGap: 3 });
          doc.moveDown(0.5);
        }

        doc.moveDown(0.5);
        doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).stroke("#EEEEEE");
        doc.moveDown(1);
      }

      // Legenda
      if (roteiro.legenda) {
        doc.addPage();
        doc.rect(0, 0, doc.page.width, 8).fill("#E63946");
        doc.moveDown(1);
        doc.fontSize(14).fillColor("#111111").text("LEGENDA / COPY DO VÍDEO", { align: "center" });
        doc.moveDown(1);
        doc.fontSize(11).fillColor("#333333").text(roteiro.legenda, { lineGap: 5 });
      }

      // Palavra gatilho
      if (roteiro.palavra_gatilho) {
        doc.moveDown(1.5);
        doc.fontSize(13).fillColor("#E63946").text(`Palavra gatilho: ${roteiro.palavra_gatilho}`);
        if (roteiro.resposta_automatica) {
          doc.moveDown(0.5);
          doc.fontSize(11).fillColor("#555555").text(`Resposta automática: ${roteiro.resposta_automatica}`);
        }
      }

      doc.end();
    });

    const pdfBuffer = Buffer.concat(chunks);
    const slug = titulo.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 40);
    res.json({
      pdf:         pdfBuffer.toString("base64"),
      pdfFilename: `${slug}_roteiro_vsl.pdf`,
      titulo:      roteiro.titulo || titulo,
      roteiro,
    });
  } catch (e) {
    console.error("[/api/script-vsl]", e.message);
    res.status(500).json({ error: e.message });
  }
});

// ──────────────────────────────────────────
// Gerador de Relatório de Pesquisa de Mercado
// ──────────────────────────────────────────
app.post("/api/relatorio", async (req, res) => {
  try {
    const { nicho, publico, nome } = req.body;
    if (!nicho) return res.status(400).json({ error: "nicho obrigatório" });
    const { openaiFlash } = require("./integrations/openai");
    const prompt = `Você é um analista de mercado de infoprodutos brasileiros.
Gere um relatório de pesquisa de mercado CONCISO (máx 400 palavras) para:
- Produto: ${nome || nicho}
- Nicho: ${nicho}
- Público-alvo: ${publico || "não informado"}

Estruture em 4 blocos (sem cabeçalhos longos, texto direto):
1. DOR PRINCIPAL: a maior frustração desse público (2-3 frases)
2. OBJEÇÕES COMUNS: as 3 principais resistências de compra
3. CONCORRENTES: o que já existe no mercado e o que falta
4. ÂNGULO DE DIFERENCIAÇÃO: como se destacar (1 ideia forte)

Linguagem direta, sem rodeios. Fale como um estrategista experiente.`;
    const relatorio = await openaiFlash(prompt);
    res.json({ relatorio: relatorio.trim() });
  } catch (e) {
    console.error("[relatorio]", e.message);
    res.status(500).json({ error: e.message });
  }
});

// ──────────────────────────────────────────
// Gamma — Diagnóstico da API Key
// ──────────────────────────────────────────
app.get("/api/test-gamma", async (req, res) => {
  try {
    const key = process.env.GAMMA_API_KEY;
    if (!key) return res.json({ ok: false, error: "GAMMA_API_KEY não configurada no servidor" });
    const r = await fetch("https://public-api.gamma.app/v1.0/themes", {
      headers: { "X-API-KEY": key, "Content-Type": "application/json" },
    });
    const body = await r.text();
    if (r.ok) {
      // A API retorna { data: [...], hasMore, nextCursor } — não um array direto
      const parsed = JSON.parse(body);
      const temas = parsed.data || parsed;
      const totalTemas = Array.isArray(temas) ? temas.length : 0;
      res.json({ ok: true, status: r.status, message: "Gamma API key válida", themes: totalTemas });
    } else {
      res.json({ ok: false, status: r.status, error: body });
    }
  } catch (e) {
    res.json({ ok: false, error: e.message });
  }
});

// ──────────────────────────────────────────
// Gamma — Lista de temas disponíveis
// ──────────────────────────────────────────
app.get("/api/gamma-themes", async (req, res) => {
  try {
    const { listarTemasFormatados } = require("./integrations/gamma");
    const temas = await listarTemasFormatados();
    // Reescreve preview_url para usar nosso proxy (evita CORS)
    const temasyProxy = temas.map(t => ({
      ...t,
      preview_url: t.id ? `/api/gamma-theme-img/${encodeURIComponent(t.id)}` : '',
    }));
    res.json(temasyProxy);
  } catch (e) {
    console.error("[/api/gamma-themes]", e.message);
    res.status(500).json({ error: e.message });
  }
});

// Proxy de imagens de preview dos temas Gamma (evita CORS do assets.gamma.app)
app.get("/api/gamma-theme-img/:themeId", async (req, res) => {
  try {
    const { themeId } = req.params;
    const url = `https://assets.gamma.app/themes/${encodeURIComponent(themeId)}/preview.png`;
    const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!r.ok) return res.status(404).end();
    const buf = await r.arrayBuffer();
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.send(Buffer.from(buf));
  } catch (e) {
    res.status(502).end();
  }
});

// ──────────────────────────────────────────
// Gamma — Geração de Apresentações
// ──────────────────────────────────────────
app.post("/api/gamma", async (req, res) => {
  try {
    const { titulo, conteudo, numSlides = 10, exportar = 'pptx', themeId } = req.body;
    if (!titulo || !conteudo) return res.status(400).json({ error: "titulo e conteudo obrigatórios" });
    const { criarApresentacao } = require("./integrations/gamma");
    const resultado = await criarApresentacao({ titulo, conteudo, numSlides, exportar, themeId });
    res.json({
      url:         resultado.gammaUrl || resultado.url,
      exportUrl:   resultado.exportUrl || resultado.export_url,
      creditsUsed: resultado.creditsUsed,
    });
  } catch (e) {
    console.error("[/api/gamma]", e.message);
    res.status(500).json({ error: e.message });
  }
});

// ──────────────────────────────────────────
// Conversor de documentos PDF ↔ DOCX
// ──────────────────────────────────────────
app.post("/api/convert", async (req, res) => {
  try {
    const { arquivo, nome, direcao } = req.body;
    if (!arquivo || !direcao) return res.status(400).json({ error: "arquivo e direcao obrigatórios" });

    const buf = Buffer.from(arquivo, "base64");
    const { criarPDFDeTexto, criarDOCXDeTexto } = require("./departments/creative/deliverable_generator");

    if (direcao === "docx2pdf") {
      const mammoth = require("mammoth");
      const result = await mammoth.convertToHtml({ buffer: buf });
      const pdfBuf = await criarPDFDeTexto(result.value, (nome || "documento").replace(/\.docx$/i, ""));
      return res.json({
        arquivo: pdfBuf.toString("base64"),
        nome: (nome || "documento").replace(/\.docx$/i, ".pdf"),
        tipo: "application/pdf",
      });
    }

    if (direcao === "pdf2docx") {
      const pdfParse = require("pdf-parse");
      const data = await pdfParse(buf);
      const docxBuf = await criarDOCXDeTexto(data.text, (nome || "documento").replace(/\.pdf$/i, ""));
      return res.json({
        arquivo: docxBuf.toString("base64"),
        nome: (nome || "documento").replace(/\.pdf$/i, ".docx"),
        tipo: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
    }

    res.status(400).json({ error: "direcao inválida — use docx2pdf ou pdf2docx" });
  } catch (e) {
    console.error("[/api/convert]", e.message);
    res.status(500).json({ error: e.message });
  }
});

// ──────────────────────────────────────────
// Webhook GitHub → salva commits no Supabase
// ──────────────────────────────────────────
const crypto = require("crypto");
const { saveMemory: saveGithubMemory } = require("./integrations/supabase");

app.post("/api/github/webhook", async (req, res) => {
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  if (secret) {
    const sig = req.headers["x-hub-signature-256"];
    if (!sig) return res.status(401).json({ error: "Assinatura ausente" });
    const expected = "sha256=" + crypto.createHmac("sha256", secret).update(req.rawBody).digest("hex");
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
      return res.status(401).json({ error: "Assinatura inválida" });
    }
  }

  const event = req.headers["x-github-event"];
  if (event !== "push") return res.json({ ok: true, ignorado: true });

  const { ref, commits = [], repository, pusher } = req.body;
  const branch = ref?.replace("refs/heads/", "") || "unknown";
  const repo = repository?.full_name || "unknown";

  for (const commit of commits) {
    const arquivos = [
      ...(commit.added || []),
      ...(commit.modified || []),
      ...(commit.removed || []),
    ];
    await saveGithubMemory("github", "commit", commit.message.split("\n")[0], {
      sha: commit.id?.slice(0, 7),
      autor: commit.author?.name || pusher?.name || "unknown",
      branch,
      repo,
      timestamp: commit.timestamp,
      arquivos_alterados: arquivos.length,
      arquivos: arquivos.slice(0, 20),
    }).catch(e => console.error("[GitHub Webhook] Erro ao salvar:", e.message));
  }

  console.log(`[GitHub Webhook] ${commits.length} commit(s) de "${branch}" salvos no Supabase`);
  res.json({ ok: true, commits: commits.length });
});

// ──────────────────────────────────────────
// Gamma — diagnóstico rápido sem geração completa
// GET /api/gamma-test → lista temas e verifica conectividade
// ──────────────────────────────────────────
app.get("/api/gamma-test", async (req, res) => {
  const apiKey = process.env.GAMMA_API_KEY;
  if (!apiKey) return res.status(500).json({ ok: false, error: "GAMMA_API_KEY não configurada" });
  try {
    const r = await fetch("https://public-api.gamma.app/v1.0/themes", {
      headers: { "X-API-KEY": apiKey, "Content-Type": "application/json" },
    });
    if (!r.ok) {
      const body = await r.text();
      return res.status(r.status).json({ ok: false, status: r.status, error: body.slice(0, 300) });
    }
    const data = await r.json();
    const temas = (data.data || []).slice(0, 5).map(t => ({ id: t.id, nome: t.name }));
    res.json({ ok: true, key_prefix: apiKey.slice(0, 8) + "…", temas_sample: temas, total_temas: (data.data || []).length });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// ──────────────────────────────────────────
// Health check
// ──────────────────────────────────────────
app.get("/", (req, res) => res.json({ status: "NEXUS online", version: "1.0.0" }));

// ──────────────────────────────────────────
// ElevenLabs — Narração de texto
// ──────────────────────────────────────────
const ELEVEN_VOICES = {
  rodrigo:      "TX3LPaxmHKxFdv7VOQHJ", // Liam — masculino (estável)
  feminino:     "21m00Tcm4TlvDq8ikWAM", // Rachel — feminino (estável)
  profissional: "JBFqnCBsd6RMkjVDRZzb", // George — profissional (estável)
};

app.post("/api/narrar", async (req, res) => {
  const { texto, voz = "rodrigo" } = req.body;
  if (!texto || !texto.trim()) return res.status(400).json({ error: "texto obrigatório" });

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "ELEVENLABS_API_KEY não configurado no servidor" });

  const voiceId = ELEVEN_VOICES[voz] || ELEVEN_VOICES.rodrigo;
  const textoLimpo = texto.replace(/[*#_`~]/g, "").trim().slice(0, 5000);

  try {
    const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        "Accept": "audio/mpeg",
      },
      body: JSON.stringify({
        text: textoLimpo,
        model_id: "eleven_multilingual_v2",
        voice_settings: { stability: 0.45, similarity_boost: 0.80, style: 0.2, use_speaker_boost: true },
      }),
    });

    if (!r.ok) {
      const err = await r.json().catch(() => ({}));
      console.error("[/api/narrar] ElevenLabs error:", err);
      return res.status(r.status).json({ error: err?.detail?.message || "Erro na ElevenLabs" });
    }

    const buffer = Buffer.from(await r.arrayBuffer());
    res.json({ audio: buffer.toString("base64"), formato: "mp3" });
  } catch (e) {
    console.error("[/api/narrar]", e.message);
    res.status(500).json({ error: e.message });
  }
});

// ──────────────────────────────────────────
// Inicia servidor
// ──────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`NEXUS — Servidor rodando na porta ${PORT}`);
  console.log(`[Gamma] API KEY: ${process.env.GAMMA_API_KEY ? "✅ configurada" : "❌ NÃO CONFIGURADA — geração PDF usará apenas PDFKit"}`);
  await registerWebhook();
});
