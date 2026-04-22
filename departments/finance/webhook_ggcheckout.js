// ============================================
// NEXUS — Webhook GG Checkout
// Recebe eventos de venda em tempo real
// Notifica via Telegram e salva no Supabase
// ============================================

const express = require("express");
const { notify } = require("../../integrations/notify");
const { salvarReport, atualizarMeta } = require("../../integrations/supabase");
require("dotenv").config();

const router = express.Router();

// Mapa de eventos para mensagens
const EVENTOS = {
  "pix_paid":       { emoji: "✅", label: "PIX PAGO — VENDA CONFIRMADA" },
  "pix_generated":  { emoji: "⏳", label: "PIX GERADO" },
  "pix_expired":    { emoji: "❌", label: "PIX EXPIRADO" },
  "card_approved":  { emoji: "💳", label: "CARTÃO APROVADO — VENDA CONFIRMADA" },
  "card_declined":  { emoji: "🚫", label: "CARTÃO RECUSADO" },
  "refund":         { emoji: "↩️", label: "REEMBOLSO SOLICITADO" },
  "chargeback":     { emoji: "⚠️", label: "CHARGEBACK" },
};

router.post("/ggcheckout", async (req, res) => {
  try {
    const payload = req.body;
    const evento = payload.event || payload.type || "desconhecido";
    const info = EVENTOS[evento] || { emoji: "📦", label: evento.toUpperCase() };

    console.log(`[Finance] Evento recebido: ${evento}`, payload);

    // Monta mensagem para o Telegram
    const produto = payload.product?.name || payload.product_name || "Produto";
    const valor   = payload.amount ? `R$ ${(payload.amount / 100).toFixed(2)}` : "—";
    const cliente = payload.customer?.name || payload.buyer_name || "—";
    const email   = payload.customer?.email || payload.buyer_email || "—";

    const mensagem =
      `${info.emoji} *${info.label}*\n\n` +
      `Produto: ${produto}\n` +
      `Valor: *${valor}*\n` +
      `Cliente: ${cliente}\n` +
      `Email: ${email}`;

    // Notifica o fundador via Telegram
    await notify(mensagem);

    // Se foi venda confirmada, salva no financeiro e atualiza metas
    const eVenda = ["pix_paid", "card_approved"].includes(evento);
    if (eVenda) {
      const valorNum = payload.amount ? payload.amount / 100 : 0;

      await salvarReport({
        receitaBruta: valorNum,
        custos: 0,
        conversoes: 1,
        leads: 0,
        notas: `${produto} — ${cliente}`,
      });

      // Atualiza meta de faturamento no Caderno Preto
      // (incrementa o valor atual)
      const { supabase } = require("../../integrations/supabase");
      const { data: meta } = await supabase
        .from("caderno_preto")
        .select("valor_atual")
        .eq("nome", "Faturamento Mensal (R$)")
        .single();

      if (meta) {
        await atualizarMeta(
          "Faturamento Mensal (R$)",
          Number(meta.valor_atual) + valorNum
        );
      }
    }

    res.status(200).json({ ok: true });
  } catch (e) {
    console.error("[Finance] Erro no webhook:", e.message);
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
