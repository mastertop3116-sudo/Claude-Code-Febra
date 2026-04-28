// ============================================
// NEXUS — Servidor Principal
// Bot Telegram (webhook mode) + GG Checkout
// ============================================

require("dotenv").config();
const express = require("express");
const app = express();

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
app.use(express.static(path.join(__dirname, "public")));
app.use("/fonts", express.static(path.join(__dirname, "assets/fonts")));

app.get("/criar", (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.sendFile(path.join(__dirname, "public", "criar.html"));
});

// Jobs em memória: jobId → { status, progress, message, result, error }
const criarJobs = new Map();
function limparJobsAntigos() {
  const limite = Date.now() - 10 * 60 * 1000; // 10 min
  for (const [id, job] of criarJobs.entries()) {
    if (job.criadoEm < limite) criarJobs.delete(id);
  }
}

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

// POST /api/criar → inicia job, retorna jobId imediatamente
app.post("/api/criar", (req, res) => {
  limparJobsAntigos();
  const jobId = Math.random().toString(36).slice(2, 10);
  criarJobs.set(jobId, { status: "running", progress: 0, message: "Iniciando...", criadoEm: Date.now() });
  res.json({ jobId });

  // Killer de segurança: 5 minutos máximo por job (designer review + Nano Banana podem somar ~4 min)
  const jobKiller = setTimeout(() => {
    const job = criarJobs.get(jobId);
    if (job && job.status === "running") {
      criarJobs.set(jobId, { status: "error", message: "Timeout: geração demorou mais de 5 minutos.", criadoEm: Date.now() });
      console.error(`[/api/criar] Job ${jobId} encerrado por timeout`);
    }
  }, 5 * 60 * 1000);

  const { generate } = require("./departments/creative/deliverable_generator");
  const { createClient } = require("@supabase/supabase-js");
  const _supa = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

  const telegramId = req.body.telegram_id || "web";
  _supa.from("expert_dna").select("*").eq("telegram_id", telegramId).single()
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
    });
  }).catch(e => {
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
      enviar({ done: true, titulo: job.titulo, pdf: job.pdf, pdfFilename: job.pdfFilename,
        docx: job.docx, docxFilename: job.docxFilename });
      clearInterval(tick);
      criarJobs.delete(jobId);
      res.end();
    } else if (job.status === "error") {
      enviar({ error: job.message });
      clearInterval(tick);
      criarJobs.delete(jobId);
      res.end();
    }
  }, 600);

  req.on("close", () => clearInterval(tick));
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
// Gerador de Relatório de Pesquisa de Mercado
// ──────────────────────────────────────────
app.post("/api/relatorio", async (req, res) => {
  try {
    const { nicho, publico, nome } = req.body;
    if (!nicho) return res.status(400).json({ error: "nicho obrigatório" });
    const { GoogleGenerativeAI } = require("@google/generative-ai");
    const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genai.getGenerativeModel({ model: "gemini-2.5-flash" });
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
    const r = await model.generateContent(prompt);
    res.json({ relatorio: r.response.text().trim() });
  } catch (e) {
    console.error("[relatorio]", e.message);
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
// Health check
// ──────────────────────────────────────────
app.get("/", (req, res) => res.json({ status: "NEXUS online", version: "1.0.0" }));

// ──────────────────────────────────────────
// Inicia servidor
// ──────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`NEXUS — Servidor rodando na porta ${PORT}`);
  await registerWebhook();
});
