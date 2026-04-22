// ============================================
// NEXUS — Servidor Principal
// Roda o bot do Telegram + webhooks juntos
// ============================================

const express = require("express");
const app = express();

app.use(express.json());

// Webhook GG Checkout
const ggCheckout = require("./departments/finance/webhook_ggcheckout");
app.use("/webhook", ggCheckout);

// Health check (Railway usa isso para saber se está vivo)
app.get("/", (req, res) => res.json({ status: "NEXUS online", version: "1.0.0" }));

// Inicia o bot do Telegram
require("./telegram/bot");

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`NEXUS — Servidor rodando na porta ${PORT}`);
  console.log(`Webhook GG Checkout: POST /webhook/ggcheckout`);
});
