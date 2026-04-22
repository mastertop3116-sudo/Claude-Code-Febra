// ============================================
// NEXUS — Servidor Principal
// Bot Telegram (webhook mode) + GG Checkout
// ============================================

require("dotenv").config();
const express = require("express");
const app = express();

app.use(express.json({ limit: "8mb" }));

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
// Gerador de Entregáveis (web + API)
// ──────────────────────────────────────────
const path = require("path");
app.use(express.static(path.join(__dirname, "public")));

app.get("/criar", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "criar.html"));
});

app.post("/api/criar", async (req, res) => {
  try {
    const { generate } = require("./departments/creative/deliverable_generator");
    const resultado = await generate(req.body);
    const resposta = { titulo: resultado.titulo };
    if (resultado.pdf) {
      resposta.pdf = resultado.pdf.toString("base64");
      resposta.pdfFilename = resultado.pdfFilename;
    }
    if (resultado.docx) {
      resposta.docx = resultado.docx.toString("base64");
      resposta.docxFilename = resultado.docxFilename;
    }
    res.json(resposta);
  } catch (e) {
    console.error("[/api/criar]", e.message);
    res.status(500).json({ error: e.message });
  }
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
