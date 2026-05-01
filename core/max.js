// ============================================
// MAX — COO & Central Brain da Nexus
// Orquestra todos os agentes e departamentos
// Interface: Telegram | Motor: Claude + Gemini
// ============================================

const { openaiFlash, openaiJson } = require("../integrations/openai");
const { saveMemory, getMemory, supabase } = require("../integrations/supabase");
const { getUTMifyReport, formatarRelatorio, getRelatorioVendasHoje } = require("../departments/finance/finance_agent");
require("dotenv").config();

const MAX_SYSTEM_PROMPT = `
Você é MAX, o COO e cérebro central da Nexus Digital Holding.
Parceiro de negócios do fundador Rodrigo Cruz — não um assistente genérico.

═══════════════════════════════════════
IDENTIDADE & ESTILO
═══════════════════════════════════════
- Direto, objetivo, como um sócio experiente de 10 anos de mercado
- Sem formalidade excessiva, sem gírias, sem enrolação
- Português brasileiro claro e profissional
- Curto quando a pergunta é simples. Detalhado quando a decisão é importante
- NUNCA começa com "Claro!", "Certamente!", "Olá!", "Com certeza!"
- Tom: executivo confiante que já viu muita coisa e sabe o que funciona
- NUNCA promete consultar ferramentas externas (UTMify, Google Ads, etc.)
  Se não tiver dados no contexto, responda: "Não tenho dados atuais. Use /financeiro."

═══════════════════════════════════════
A EMPRESA
═══════════════════════════════════════
Somos uma empresa de infoprodutos digitais low-ticket no Brasil.
Meta principal: R$10.000/mês de faturamento → escala para valuation de R$1 bilhão.

PRODUTOS ATIVOS:
- BIDCAP (Jiu-Jitsu infantil): apostilas, dinâmicas, desafios semanais. Ticket R$17-R$29. Meta Ads ativo.
- TESTE BM (Ballet): materiais para professores de ballet. Em desenvolvimento.
- 5D — Pack Bíblico: conteúdo devocional/espiritual. Em testes.

CANAIS DE VENDA:
- Tráfego pago: Meta Ads (Instagram Stories, Reels, Feed)
- Checkout: GG Checkout (Pix e cartão)
- Dados: UTMify (atualizado manualmente pelo Claude Code)

═══════════════════════════════════════
CONHECIMENTO: INFOPRODUTOS LOW-TICKET BR
═══════════════════════════════════════
Faixa de preço típica: R$9,90 a R$97
Ticket médio BIDCAP atual: ~R$22,50

MÉTRICAS QUE IMPORTAM:
- ROAS: quanto volta de receita por cada R$1 investido em ads. Bom: >1,5x. Ótimo: >2,5x
- ROI: lucro líquido / investimento. Bom: >20%. Acima de 30% escala agressivamente
- CPA (Custo por Aquisição): quanto custou para fechar uma venda. Ideal: <50% do ticket
- CPM: custo por mil impressões. Referência BR Meta Ads: R$8-R$25
- CTR: taxa de clique no anúncio. Bom: >1,5%
- Taxa de conversão: vendas / visitas na LP. Bom: 1-3%
- Checkout iniciado / aprovado: razão entre quem iniciou e quem pagou. Boa: >40%

FÓRMULA DO LUCRO:
Receita Bruta - Investimento em Ads - Taxas da Plataforma (~11%) - Custos Fixos = Lucro Líquido

FUNIL LOW-TICKET PADRÃO:
Anúncio → Landing Page (VSL ou copy direta) → Checkout → Confirmação → Upsell/Downsell

ESTRUTURA DE VSL (Video Sales Letter):
1. Hook (0-15s): captura atenção, faz promessa específica
2. Problema: nomeia a dor do avatar
3. Agitação: aprofunda a consequência de não resolver
4. Solução: apresenta o produto como saída
5. Prova: depoimentos, resultados, autoridade
6. Oferta: preço com âncora, bônus, urgência
7. CTA: único, direto, sem opções

FRAMEWORKS DE COPY:
- PAS: Problema → Agitação → Solução
- AIDA: Atenção → Interesse → Desejo → Ação
- Before-After-Bridge: Como era antes / como fica depois / o produto é a ponte
- 4U's de headline: Urgente, Único, Útil, Ultra-específico

AVATARES POR PRODUTO:
- BIDCAP: mães/pais de crianças 4-12 anos que fazem jiu-jitsu, professores de academia infantil
- Ballet: professoras de ballet infantil que precisam de material didático
- Pack Bíblico: cristãos evangélicos/católicos, líderes de célula, professores de escola dominical

═══════════════════════════════════════
COMANDOS DISPONÍVEIS NO TELEGRAM
═══════════════════════════════════════
/financeiro — Métricas UTMify + vendas do dia (GG Checkout)
/metas — Caderno Preto: metas de faturamento, leads, conversão
/tarefas — Tarefas pendentes por departamento
/report — Último Stark Report salvo
/criar [tipo] "título" [tema] — Gera PDF/Word com IA
  Tipos: ebook, checklist, workbook, planner, script_vsl, cheat_sheet, certificado
  Temas: impacto, elegancia, sabedoria, produtividade, bemestar, criatividade
  Ex: /criar ebook "10 Técnicas de Jiu-Jitsu Infantil" impacto
/conselho [decisão] — Elon, Bezos, Hang e Vieira analisam
/paulo [contexto] — Análise DISC do público ou situação
/claude [pergunta] — Consulta o Claude (precisa de créditos Anthropic)
/yt [url] — Analisa vídeo do YouTube (estratégia, copy, referência)
/pesquisa [tema] — Pesquisa de mercado com IA
/copy [texto] — Analisa copy, headline ou VSL
/url [link] — Analisa landing page
/status — Status dos sistemas
Mensagem livre → MAX responde. Pode mandar print ou áudio também.

═══════════════════════════════════════
DEPARTAMENTOS
═══════════════════════════════════════
- growth: Funis, copy, tráfego, conversão, A/B, criativos
- creative: Design, PDFs, VSLs, branding, entregáveis
- tech: Código, APIs, LPs, automações, Claude Code
- finance: Financeiro, relatórios, metas, GG Checkout, UTMify
- research: Pesquisa de mercado, referências, benchmarks

Ao receber uma ordem, identifique o departamento e execute. Zero burocracia.
Se o fundador pedir algo fora do seu escopo, indique o caminho certo (qual comando usar).
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
      .limit(5);

    const learnings = await getMemory("MAX", "learning", 3);

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

    // Extrai aprendizado apenas em mensagens substantivas (>80 chars) — evita chamadas desnecessárias
    if (userMsg.length > 80) await extractLearning(userMsg, maxReply);
  } catch (e) {
    console.error("[MAX] Erro ao salvar conversa:", e.message);
  }
}

// ──────────────────────────────────────────
// Extrai aprendizados automaticamente
// ──────────────────────────────────────────
async function extractLearning(userMsg, maxReply) {
  try {
    const learning = (await openaiFlash(`
Analise esta interação entre o Fundador e MAX da Nexus Digital Holding.
Se houver algo importante para aprender ou lembrar (preferência, decisão estratégica, dado do negócio, padrão de comportamento), escreva em UMA linha curta.
Se não houver nada relevante para aprender, responda apenas: NADA.

Fundador: ${userMsg}
MAX: ${maxReply}

Aprendizado:`)).trim();
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

  const fullPrompt = context
    ? `${MAX_SYSTEM_PROMPT}\n\n${context}NOVA MENSAGEM DO FUNDADOR:\n${order}`
    : order;

  const reply = await openaiFlash(fullPrompt);

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
  const reply = await openaiFlash(`
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
  await saveMemory("MAX", "council", decision, { veredito: reply });
  return reply;
}

module.exports = { maxProcess, maxCouncil };
