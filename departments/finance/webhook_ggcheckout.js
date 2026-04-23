// ============================================
// NEXUS — Webhook GG Checkout
// Recebe eventos de venda e salva no Supabase
// /financeiro mostra os dados ao fundador
// ============================================

const express = require("express");
const { salvarReport, atualizarMeta } = require("../../integrations/supabase");
require("dotenv").config();

const router = express.Router();

router.post("/ggcheckout", async (req, res) => {
  try {
    const payload = req.body;
    const evento = payload.event || payload.type || "desconhecido";

    console.log(`[Finance] Evento recebido: ${evento}`, payload);

    const produto = payload.product?.name || payload.product_name || payload.productName || payload.item_name || "Produto";
    const cliente = payload.customer?.name || payload.buyer_name || payload.customerName || payload.name || "—";

    // Valor: tenta vários campos (centavos ou reais)
    let valorNum = 0;
    const rawAmount = payload.amount ?? payload.price ?? payload.sale_price ?? payload.order_value ?? payload.value ?? payload.total;
    if (rawAmount !== undefined && rawAmount !== null) {
      valorNum = Number(rawAmount);
      // Se valor parecer estar em centavos (> 1000 para produto de R$10+), converte
      if (valorNum > 1000 && !String(rawAmount).includes(".")) {
        valorNum = valorNum / 100;
      }
    }
    // Se foi venda confirmada, salva no financeiro e atualiza metas
    const eVenda = ["pix_paid", "card_approved"].includes(evento);
    if (eVenda) {

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
