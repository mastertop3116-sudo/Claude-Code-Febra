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
    // GGCheckout manda "card.paid"/"pix.paid"; outras plataformas usam "card_approved"/"pix_paid".
    // Normaliza (tira pontos/underscores/traços) pra reconhecer qualquer formato de venda paga.
    const evNorm = String(evento).toLowerCase().replace(/[._-]/g, "");
    const eVenda = ["cardpaid", "pixpaid", "cardapproved", "pixapproved", "purchaseapproved"].includes(evNorm);
    if (eVenda) {
      const { supabase } = require("../../integrations/supabase");

      // Registro financeiro (SECUNDÁRIO): se falhar, loga mas NÃO derruba a entrega do acesso.
      try {
        await salvarReport({
          receitaBruta: valorNum,
          custos: 0,
          conversoes: 1,
          leads: 0,
          notas: `${produto} — ${cliente}`,
        });
        const { data: meta } = await supabase
          .from("caderno_preto")
          .select("valor_atual")
          .eq("nome", "Faturamento Mensal (R$)")
          .single();
        if (meta) {
          await atualizarMeta("Faturamento Mensal (R$)", Number(meta.valor_atual) + valorNum);
        }
      } catch (e) {
        console.error("[Finance] erro no registro financeiro (segue pra entrega do acesso):", e.message);
      }

      // ── PlanIA: gerar token de acesso automaticamente ─────
      const nomeProduto = produto.toLowerCase();
      const ePlania = nomeProduto.includes("plania") || nomeProduto.includes("plano de aula");
      if (ePlania) {
        try {
          const email = payload.customer?.email || payload.buyer_email || payload.email || "";
          // PlanIA vendido a R$47,90 (Pix ~R$45,50) como VITALÍCIO. Teto R$40 cobre os dois
          // (e ainda dá 30 dias caso um dia venda algo bem mais barato). Ajustável por env.
          const tipo  = valorNum >= (Number(process.env.PLANIA_VITALICIO_MIN) || 40) ? "vitalicio" : "30dias";
          const token = Math.random().toString(36).substring(2, 7).toUpperCase()
                      + "-" + Math.random().toString(36).substring(2, 7).toUpperCase();
          const expira_em = tipo === "vitalicio"
            ? null
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

          await supabase.from("plania_acessos").insert({ token, email, tipo, expira_em, planos_gerados: 0 });

          console.log(`[PlanIA] Token gerado: ${token} → ${email} (${tipo})`);
        } catch (e) {
          console.error("[PlanIA] Erro ao gerar token:", e.message);
        }
      }

      // ── MAX Criador: credita o pacote de créditos automaticamente na compra ──
      const eCriador = nomeProduto.includes("criador") || nomeProduto.includes("estúdio") || nomeProduto.includes("estudio");
      if (eCriador) {
        try {
          const auth = require("../../auth");
          const email = payload.customer?.email || payload.buyer_email || payload.email || "";
          const nome  = payload.customer?.name || payload.buyer_name || cliente || "";
          // créditos do pacote: acha "N créditos" no nome do produto (robusto contra cupom); senão, pelo valor cheio.
          const mCred = nomeProduto.match(/(\d+)\s*cr[eé]dito/i);
          const creditos = mCred ? parseInt(mCred[1]) : null;
          const pacote = creditos ? null : auth.pacotePorValor(valorNum);
          const r = auth.creditarCompra({ nome, email, creditos, pacote });
          if (r.ok) {
            const base = process.env.RENDER_EXTERNAL_URL || "https://claude-code-febra.onrender.com";
            console.log(`[Criador] +${creditos || (pacote && auth.PACOTES[pacote] && auth.PACOTES[pacote].creditos)} créditos p/ ${email} → saldo ${r.creditos} (${r.novo ? "conta nova" : "somado"})${r.token ? ` · ativar em ${base}/bem-vindo (token ${r.token})` : ""}`);
          } else {
            console.error("[Criador] Falha ao creditar:", r.error);
          }
        } catch (e) {
          console.error("[Criador] Erro:", e.message);
        }
      }
    }

    res.status(200).json({ ok: true });
  } catch (e) {
    console.error("[Finance] Erro no webhook:", e.message);
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
