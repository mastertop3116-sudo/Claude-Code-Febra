// ============================================
// MAX — COO & Central Brain da Nexus
// Orquestra todos os agentes e departamentos
// Interface: Telegram | Motor: Claude + Gemini
// ============================================

const { GoogleGenerativeAI } = require("@google/generative-ai");
const { saveMemory, getMemory, supabase } = require("../integrations/supabase");
const { getUTMifyReport, formatarRelatorio, getRelatorioVendasHoje } = require("../departments/finance/finance_agent");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const MAX_SYSTEM_PROMPT = `
Você é MAX, o COO e cérebro central da Nexus Digital Holding.
Você é o braço direito do fundador — parceiro de negócios, não só um assistente.

SEU ESTILO:
- Direto e objetivo, como um sócio experiente
- Sem formalidade excessiva, mas sem gírias
- Linguagem clara e profissional em português brasileiro
- Responde curto quando a pergunta é simples, detalhado quando necessário
- Nunca começa resposta com "Claro!", "Certamente!" ou "Olá!"
- Tom: executivo confiante, não robô e não vendedor de curso
- NUNCA prometa consultar ferramentas externas (UTMify, Google, etc.) — use apenas o que está no contexto. Se não tiver dados, diga: "Não tenho dados atualizados. Use /financeiro para ver as métricas."

SUAS FUNÇÕES:
- Orquestra todos os departamentos da Nexus
- Gerencia o fluxo de operações e metas do Caderno Preto
- Revisa TODO trabalho antes de entregar
- Pensa em escala bilionária, executa com precisão cirúrgica
- Aprende continuamente com cada conversa e decisão tomada

DEPARTAMENTOS:
- growth: Funis, copy, tráfego, conversão
- creative: Design, imagens, VSLs, branding
- tech: Código, APIs, landing pages, automações
- finance: Notas fiscais, tributário, split de valores
- research: Pesquisa de mercado, dados, referências

Ao receber uma ordem, identifique o departamento e execute. Sem burocracia.
`;

// ──────────────────────────────────────────
// Detecta se a mensagem é sobre finanças/métricas
// ──────────────────────────────────────────
function isFinanceQuery(order) {
  const keywords = ["utmify", "vendas", "receita", "faturamento", "roi", "investimento",
    "tráfego", "métricas", "financeiro", "resultado", "lucro", "custo", "campanha",
    "bidcap", "ballet", "bíblico", "5d", "teste bm", "quanto", "como estamos"];
  const lower = order.toLowerCase();
  return keywords.some(k => lower.includes(k));
}

// ──────────────────────────────────────────
// Busca histórico + memórias + dados UTMify
// ──────────────────────────────────────────
async function buildContext(telegramId, order = "") {
  try {
    const { data: history } = await supabase
      .from("conversations")
      .select("role, content, created_at")
      .eq("telegram_id", String(telegramId))
      .order("created_at", { ascending: false })
      .limit(10);

    const learnings = await getMemory("MAX", "learning", 5);

    let context = "";

    if (learnings && learnings.length > 0) {
      context += "APRENDIZADOS ANTERIORES:\n";
      learnings.forEach(l => { context += `- ${l.content}\n`; });
      context += "\n";
    }

    // Injeta dados financeiros se a pergunta for sobre métricas/vendas
    if (isFinanceQuery(order)) {
      try {
        const utmRow = await getUTMifyReport();
        const { totalReceita, totalConversoes } = await getRelatorioVendasHoje();

        context += "DADOS FINANCEIROS ATUAIS (use para responder):\n";
        if (utmRow) {
          const d = utmRow.context || utmRow.data || {};
          const atualizado = d.atualizadoEm
            ? new Date(d.atualizadoEm).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })
            : "sem data";
          context += `UTMify (atualizado ${atualizado}):\n`;
          if (d.dashboards) {
            for (const dash of d.dashboards) {
              context += `- ${dash.nome || dash.dashboardId}: Receita R$${(dash.receita||0).toFixed(2)}, Investimento R$${(dash.investimento||0).toFixed(2)}, Vendas ${dash.vendas||0}\n`;
            }
          }
        } else {
          context += "UTMify: sem dados em cache. Oriente o fundador a pedir atualização.\n";
        }
        context += `GG Checkout (hoje): ${totalConversoes} venda(s) confirmada(s), R$ ${totalReceita.toFixed(2)}\n`;
        context += "\n";
      } catch (_) {}
    }

    if (history && history.length > 0) {
      context += "HISTÓRICO RECENTE DA CONVERSA:\n";
      [...history].reverse().forEach(h => {
        context += `${h.role === "user" ? "Fundador" : "MAX"}: ${h.content}\n`;
      });
      context += "\n";
    }

    return context;
  } catch (e) {
    console.error("[MAX] Erro ao buscar contexto:", e.message);
    return "";
  }
}

// ──────────────────────────────────────────
// Salva conversa e extrai aprendizados
// ──────────────────────────────────────────
async function saveConversation(telegramId, userMsg, maxReply) {
  try {
    // Salva mensagem do usuário
    await supabase.from("conversations").insert({
      telegram_id: String(telegramId),
      role: "user",
      content: userMsg,
      agent: "MAX",
    });

    // Salva resposta do MAX
    await supabase.from("conversations").insert({
      telegram_id: String(telegramId),
      role: "assistant",
      content: maxReply,
      agent: "MAX",
    });

    // Extrai aprendizado se a conversa tiver conteúdo relevante
    await extractLearning(userMsg, maxReply);
  } catch (e) {
    console.error("[MAX] Erro ao salvar conversa:", e.message);
  }
}

// ──────────────────────────────────────────
// Extrai aprendizados automaticamente
// ──────────────────────────────────────────
async function extractLearning(userMsg, maxReply) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent(`
Analise esta interação entre o Fundador e MAX da Nexus Digital Holding.
Se houver algo importante para aprender ou lembrar (preferência, decisão estratégica, dado do negócio, padrão de comportamento), escreva em UMA linha curta.
Se não houver nada relevante para aprender, responda apenas: NADA.

Fundador: ${userMsg}
MAX: ${maxReply}

Aprendizado:`);

    const learning = result.response.text().trim();
    if (learning && learning !== "NADA" && !learning.includes("NADA")) {
      await saveMemory("MAX", "learning", learning, { origem: "conversa" });
      console.log(`[MAX] Aprendizado registrado: ${learning}`);
    }
  } catch (e) {
    // Silencioso — aprendizado é secundário
  }
}

// ──────────────────────────────────────────
// maxProcess — Processa ordem com memória
// ──────────────────────────────────────────
async function maxProcess(order, telegramId = null) {
  console.log(`\n[MAX] Ordem recebida: ${order}\n`);

  const context = telegramId ? await buildContext(telegramId, order) : "";

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const fullPrompt = context
    ? `${MAX_SYSTEM_PROMPT}\n\n${context}NOVA MENSAGEM DO FUNDADOR:\n${order}`
    : order;

  const result = await model.generateContent(fullPrompt);
  const reply = result.response.text();

  // Salva no Supabase e aprende
  if (telegramId) {
    await saveConversation(telegramId, order, reply);
  }

  return reply;
}

// ──────────────────────────────────────────
// maxCouncil — Conselho de Titãs
// ──────────────────────────────────────────
async function maxCouncil(decision) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

  const result = await model.generateContent(`
${MAX_SYSTEM_PROMPT}

MODO: CONSELHO DE TITÃS ATIVADO
Você vai simular 4 conselheiros bilionários analisando esta decisão:

1. ELON MUSK: Foco em viralidade, engenharia de primeira ordem, audácia
2. JEFF BEZOS: Métricas frias, CAC/LTV, obsessão pelo cliente
3. LUCIANO HANG: Branding de massa, mercado brasileiro, energia de vendas
4. PAULO VIEIRA: Psicologia comportamental, DISC, engenharia de persuasão

DECISÃO A ANALISAR: ${decision}

Cada conselheiro deve dar sua análise e recomendação.
MAX fecha com o veredito final consolidado.
`);

  const reply = result.response.text();
  await saveMemory("MAX", "council", decision, { veredito: reply });
  return reply;
}

module.exports = { maxProcess, maxCouncil };
