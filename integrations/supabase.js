// ============================================
// NEXUS — Integração Supabase
// Memória de longo prazo de todos os agentes
// ============================================

const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// ──────────────────────────────────────────
// MEMÓRIA DOS AGENTES
// ──────────────────────────────────────────

/** Salva uma memória de agente */
async function saveMemory(agent, type, content, metadata = {}) {
  const { data, error } = await supabase
    .from("agent_memory")
    .insert({ agent, type, content, metadata });

  if (error) throw new Error(`[Supabase] Erro ao salvar memória: ${error.message}`);
  return data;
}

/** Busca memórias de um agente por tipo */
async function getMemory(agent, type = null, limit = 20) {
  let query = supabase
    .from("agent_memory")
    .select("*")
    .eq("agent", agent)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (type) query = query.eq("type", type);

  const { data, error } = await query;
  if (error) throw new Error(`[Supabase] Erro ao buscar memória: ${error.message}`);
  return data;
}

// ──────────────────────────────────────────
// CADERNO PRETO (Metas)
// ──────────────────────────────────────────

/** Cria ou atualiza uma meta */
async function upsertMeta(nome, valorAlvo, valorAtual = 0, prazo = null) {
  const { data, error } = await supabase
    .from("caderno_preto")
    .upsert({ nome, valor_alvo: valorAlvo, valor_atual: valorAtual, prazo }, { onConflict: "nome" });

  if (error) throw new Error(`[Supabase] Erro ao salvar meta: ${error.message}`);
  return data;
}

/** Lista todas as metas do Caderno Preto */
async function getMetas() {
  const { data, error } = await supabase
    .from("caderno_preto")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) throw new Error(`[Supabase] Erro ao buscar metas: ${error.message}`);
  return data;
}

/** Atualiza o valor atual de uma meta */
async function atualizarMeta(nome, valorAtual) {
  const { data, error } = await supabase
    .from("caderno_preto")
    .update({ valor_atual: valorAtual, updated_at: new Date().toISOString() })
    .eq("nome", nome);

  if (error) throw new Error(`[Supabase] Erro ao atualizar meta: ${error.message}`);
  return data;
}

// ──────────────────────────────────────────
// TAREFAS DOS DEPARTAMENTOS
// ──────────────────────────────────────────

/** Cria uma nova tarefa */
async function criarTarefa(departamento, titulo, descricao, prioridade = "media") {
  const { data, error } = await supabase
    .from("tasks")
    .insert({ departamento, titulo, descricao, prioridade, status: "pendente" });

  if (error) throw new Error(`[Supabase] Erro ao criar tarefa: ${error.message}`);
  return data;
}

/** Atualiza o status de uma tarefa */
async function atualizarTarefa(id, status, resultado = null) {
  const { data, error } = await supabase
    .from("tasks")
    .update({ status, resultado, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(`[Supabase] Erro ao atualizar tarefa: ${error.message}`);
  return data;
}

/** Lista tarefas por departamento e/ou status */
async function getTarefas(departamento = null, status = null) {
  let query = supabase
    .from("tasks")
    .select("*")
    .order("created_at", { ascending: false });

  if (departamento) query = query.eq("departamento", departamento);
  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) throw new Error(`[Supabase] Erro ao buscar tarefas: ${error.message}`);
  return data;
}

// ──────────────────────────────────────────
// STARK REPORT (Relatórios financeiros)
// ──────────────────────────────────────────

/** Salva um Stark Report */
async function salvarReport(dados) {
  const { data, error } = await supabase
    .from("stark_reports")
    .insert({
      receita_bruta: dados.receitaBruta || 0,
      custos: dados.custos || 0,
      lucro_liquido: dados.lucroLiquido || 0,
      conversoes: dados.conversoes || 0,
      leads: dados.leads || 0,
      notas: dados.notas || "",
    });

  if (error) throw new Error(`[Supabase] Erro ao salvar report: ${error.message}`);
  return data;
}

/** Busca os últimos N relatórios */
async function getReports(limit = 10) {
  const { data, error } = await supabase
    .from("stark_reports")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(`[Supabase] Erro ao buscar reports: ${error.message}`);
  return data;
}

module.exports = {
  supabase,
  saveMemory,
  getMemory,
  upsertMeta,
  getMetas,
  atualizarMeta,
  criarTarefa,
  atualizarTarefa,
  getTarefas,
  salvarReport,
  getReports,
};
