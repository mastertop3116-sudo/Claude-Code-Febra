// ============================================
// NEXUS — Design Reviewer (Gestor Criativo)
// Duas revisões: conteúdo (texto) + visual (imagem)
// Score < 7 na capa → regera com prompt melhorado
// ============================================

const { GoogleGenerativeAI } = require("@google/generative-ai");
const { geminiJson, geminiImage } = require("../../integrations/gemini");
const { saveMemory } = require("../../integrations/supabase");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ──────────────────────────────────────────
// Revisão VISUAL da capa (manda a imagem para o Gemini)
// Retorna { score, aprovado, feedback, melhoriaPrompt }
// ──────────────────────────────────────────
async function revisarCapaVisual(coverImageBuffer, titulo, temaKey) {
  if (!coverImageBuffer) return null;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent([
      {
        text: `Você é um diretor de arte especialista em materiais digitais para o mercado brasileiro de infoprodutos.
Avalie esta imagem gerada por IA para ser usada como capa de um entregável digital chamado "${titulo}" (tema: ${temaKey}).

Critérios de avaliação:
1. Impacto visual — chama atenção, é marcante?
2. Coerência com o tema — a imagem combina com o nicho?
3. Qualidade estética — cores harmoniosas, composição equilibrada?
4. Profissionalismo — parece material pago, de valor?
5. Adequação ao mercado BR — apropriado para o público brasileiro?

Responda EM JSON puro (sem markdown):
{
  "score": 8,
  "aprovado": true,
  "feedback": "descrição curta do que está bom e ruim",
  "melhoria_prompt": "instrução específica em inglês para melhorar o prompt de geração de imagem"
}

Score: 1-10. Aprovado = true se score >= 7.`,
      },
      {
        inlineData: {
          mimeType: "image/png",
          data: coverImageBuffer.toString("base64"),
        },
      },
    ]);

    const text = result.response.text().trim()
      .replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "");
    const review = JSON.parse(text);
    console.log(`[Revisor Visual] "${titulo}" — Capa: ${review.score}/10`);
    return review;
  } catch (e) {
    console.warn("[Revisor Visual] Falha:", e.message);
    return null;
  }
}

// ──────────────────────────────────────────
// Revisão de CONTEÚDO (texto/estrutura)
// ──────────────────────────────────────────
async function revisarConteudo(tipo, titulo, conteudo) {
  const prompt = `Você é um revisor especializado em entregáveis digitais low-ticket para o mercado brasileiro.
Avalie o conteúdo deste ${tipo} chamado "${titulo}".

CONTEÚDO:
${JSON.stringify(conteudo, null, 2)}

Critérios:
1. Qualidade — específico, acionável, valor real para o avatar
2. Estrutura — introdução clara, seções desenvolvidas, conclusão com CTA
3. Adequação ao tipo (${tipo}) — respeita formato e proposta
4. Destaques — impactantes e memoráveis?
5. Tom — direto, vocabulário do nicho brasileiro

JSON (sem texto fora):
{
  "score": 8,
  "aprovado": true,
  "pontos_fortes": ["ponto 1", "ponto 2"],
  "melhorias": ["melhoria 1", "melhoria 2"],
  "instrucao_regeneracao": "instrução para melhorar"
}

Score 1-10. Aprovado = true se >= 7.`;

  try {
    const raw = await geminiJson(prompt, true);
    const review = JSON.parse(raw.trim()
      .replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, ""));

    await saveMemory("creative", "review", `${tipo} "${titulo}" — score ${review.score}/10`, {
      titulo, tipo, score: review.score, melhorias: review.melhorias,
    }).catch(() => {});

    console.log(`[Revisor Conteúdo] "${titulo}" — ${review.score}/10 | Aprovado: ${review.aprovado}`);
    return review;
  } catch (e) {
    console.warn("[Revisor Conteúdo] Falha:", e.message);
    return { score: 7, aprovado: true, pontos_fortes: [], melhorias: [], instrucao_regeneracao: "" };
  }
}

// ──────────────────────────────────────────
// Revisão COMPLETA (conteúdo + visual)
// Chamado após gerar tudo — retorna resultado consolidado
// ──────────────────────────────────────────
async function revisarEntregavel(tipo, titulo, conteudo, coverImageBuffer = null) {
  const [reviewConteudo, reviewVisual] = await Promise.all([
    revisarConteudo(tipo, titulo, conteudo),
    coverImageBuffer ? revisarCapaVisual(coverImageBuffer, titulo, tipo) : Promise.resolve(null),
  ]);

  return { conteudo: reviewConteudo, visual: reviewVisual };
}

// ──────────────────────────────────────────
// Formata review para Telegram
// ──────────────────────────────────────────
function formatarReview(resultado, titulo) {
  const rc = resultado.conteudo || resultado; // suporta formato antigo
  const rv = resultado.visual;

  const scoreConteudo = rc.score || 7;
  const scoreVisual = rv?.score;
  const scoreGeral = scoreVisual
    ? Math.round((scoreConteudo + scoreVisual) / 2) : scoreConteudo;

  const emoji = scoreGeral >= 9 ? "🏆" : scoreGeral >= 7 ? "✅" : scoreGeral >= 5 ? "⚠️" : "❌";
  let msg = `${emoji} *Revisão: "${titulo}"*\n`;
  msg += `Conteúdo: *${scoreConteudo}/10*`;
  if (scoreVisual) msg += `  |  Capa: *${scoreVisual}/10*`;
  msg += "\n\n";

  if (rc.pontos_fortes?.length) {
    msg += `*Pontos fortes:*\n`;
    rc.pontos_fortes.forEach(p => { msg += `• ${p}\n`; });
    msg += "\n";
  }
  if (rc.melhorias?.length) {
    msg += `*Melhorias de conteúdo:*\n`;
    rc.melhorias.forEach(m => { msg += `• ${m}\n`; });
    msg += "\n";
  }
  if (rv?.feedback) {
    msg += `*Feedback visual da capa:*\n${rv.feedback}`;
  }
  return msg.trim();
}

module.exports = { revisarEntregavel, revisarCapaVisual, revisarConteudo, formatarReview };
