// ============================================
// NEXUS — Agente Financeiro
// Lê métricas UTMify (cache Supabase) + GG Checkout
// ============================================

const { supabase, saveMemory, getMemory } = require("../../integrations/supabase");

// Dashboards conhecidos
const DASHBOARDS = {
  "682e5acce4e4e7748bb669ae": { nome: "BIDCAP", nicho: "Jiu-Jitsu" },
  "69685cb9af5f797b4a89f7db": { nome: "TESTE BM", nicho: "Ballet" },
  "69c1e3332cc7808546f6e544": { nome: "5D", nicho: "Pack Bíblico" },
};

// Busca o relatório UTMify mais recente do Supabase
async function getUTMifyReport(dashboardId = null) {
  try {
    const category = dashboardId ? `utmify_${dashboardId}` : "utmify_summary";
    const rows = await getMemory("utmify", category, 1);
    if (!rows || !rows.length) return null;
    return rows[0];
  } catch (e) {
    console.error("[Finance] Erro ao buscar UTMify cache:", e.message);
    return null;
  }
}

// Salva dados do UTMify no Supabase (chamado pelo Claude Code após query MCP)
async function saveUTMifyReport(dashboardId, data) {
  const category = dashboardId ? `utmify_${dashboardId}` : "utmify_summary";
  const label = DASHBOARDS[dashboardId]?.nome || dashboardId;
  await saveMemory("utmify", category, `Relatório ${label}`, data);
}

// Salva relatório consolidado de todos os dashboards
async function saveUTMifySummary(relatorios) {
  await saveMemory("utmify", "utmify_summary", "Relatório Consolidado", {
    dashboards: relatorios,
    atualizadoEm: new Date().toISOString(),
  });
}

// Formata relatório financeiro para Telegram
function formatarRelatorio(rows) {
  if (!rows || !rows.length) {
    return "Nenhum dado UTMify em cache. Me peça para atualizar as métricas aqui no Claude Code.";
  }

  const entry = rows[0];
  const data = entry.context || entry.data || {};
  const atualizadoEm = data.atualizadoEm
    ? new Date(data.atualizadoEm).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })
    : "—";

  let texto = `*FINANCEIRO — NEXUS*\n_Atualizado: ${atualizadoEm}_\n\n`;

  if (data.dashboards && Array.isArray(data.dashboards)) {
    for (const d of data.dashboards) {
      const info = DASHBOARDS[d.dashboardId] || { nome: d.nome || d.dashboardId, nicho: "" };
      const receita = formatReal(d.receita || d.revenueCents / 100 || 0);
      const investimento = formatReal(d.investimento || d.adSpendCents / 100 || 0);
      const lucro = (d.receita || 0) - (d.investimento || 0);
      const roi = d.investimento > 0 ? (((d.receita || 0) - d.investimento) / d.investimento * 100).toFixed(1) : "—";
      const vendas = d.vendas || d.ordersCount?.approved || 0;

      texto += `*${info.nome}* (${info.nicho})\n`;
      texto += `Receita: R$ ${receita} | Invest: R$ ${investimento}\n`;
      texto += `Lucro: R$ ${formatReal(lucro)} | ROI: ${roi}%\n`;
      texto += `Vendas: ${vendas}\n\n`;
    }
  } else if (data.receita !== undefined) {
    // Relatório de dashboard único
    const receita = formatReal(data.receita || 0);
    const invest = formatReal(data.investimento || 0);
    const lucro = (data.receita || 0) - (data.investimento || 0);
    const roi = data.investimento > 0 ? ((lucro / data.investimento) * 100).toFixed(1) : "—";

    texto += `Receita: R$ ${receita}\n`;
    texto += `Investimento: R$ ${invest}\n`;
    texto += `Lucro: R$ ${formatReal(lucro)} | ROI: ${roi}%\n`;
    texto += `Vendas: ${data.vendas || 0}\n`;
  } else {
    texto += "_Formato de dados não reconhecido. Solicite atualização._";
  }

  texto += `\n_Para atualizar os dados: me peça no Claude Code_`;
  return texto;
}

function formatReal(valor) {
  return Number(valor).toFixed(2).replace(".", ",");
}

// Busca vendas recentes do GG Checkout (Supabase stark_reports)
async function getVendasRecentes(limite = 5) {
  const { data, error } = await supabase
    .from("stark_reports")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limite);
  if (error) throw error;
  return data || [];
}

// Gera relatório de vendas do dia (GG Checkout)
async function getRelatorioVendasHoje() {
  const hoje = new Date();
  const inicioHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()).toISOString();

  const { data, error } = await supabase
    .from("stark_reports")
    .select("*")
    .gte("created_at", inicioHoje)
    .order("created_at", { ascending: false });

  if (error) throw error;
  const vendas = data || [];

  const totalReceita = vendas.reduce((s, v) => s + (v.receita_bruta || 0), 0);
  const totalConversoes = vendas.reduce((s, v) => s + (v.conversoes || 0), 0);

  return { vendas, totalReceita, totalConversoes };
}

module.exports = {
  getUTMifyReport,
  saveUTMifyReport,
  saveUTMifySummary,
  formatarRelatorio,
  getVendasRecentes,
  getRelatorioVendasHoje,
  DASHBOARDS,
};
