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

// POST /api/criar → inicia job, retorna jobId imediatamente
app.post("/api/criar", (req, res) => {
  limparJobsAntigos();
  const jobId = Math.random().toString(36).slice(2, 10);
  criarJobs.set(jobId, { status: "running", progress: 0, message: "Iniciando...", criadoEm: Date.now() });
  res.json({ jobId });

  // Killer de segurança: 3 minutos máximo por job
  const jobKiller = setTimeout(() => {
    const job = criarJobs.get(jobId);
    if (job && job.status === "running") {
      criarJobs.set(jobId, { status: "error", message: "Timeout: geração demorou mais de 3 minutos.", criadoEm: Date.now() });
      console.error(`[/api/criar] Job ${jobId} encerrado por timeout`);
    }
  }, 3 * 60 * 1000);

  const { generate } = require("./departments/creative/deliverable_generator");
  generate({
    ...req.body,
    onProgress: async (pct, msg) => {
      const job = criarJobs.get(jobId);
      if (job) { job.progress = pct; job.message = msg; }
    },
  }).then(resultado => {
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
