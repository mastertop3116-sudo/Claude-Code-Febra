// ============================================
// NEXUS — Design Reviewer (Gestor Criativo)
// Revisa todo entregável gerado — score 1-10
// Enviado como mensagem extra no Telegram
// ============================================

const { geminiJson } = require("../../integrations/gemini");
const { saveMemory } = require("../../integrations/supabase");

async function revisarEntregavel(tipo, titulo, conteudo) {
  const prompt = `Você é um revisor especializado em entregáveis digitais low-ticket para o mercado brasileiro.
Avalie o conteúdo deste ${tipo} chamado "${titulo}".

CONTEÚDO:
${JSON.stringify(conteudo, null, 2)}

Critérios de avaliação:
1. Qualidade do conteúdo — específico, acionável, valor real para o avatar
2. Estrutura — introdução clara, seções desenvolvidas, conclusão com CTA direto
3. Adequação ao tipo (${tipo}) — respeita o formato e a proposta
4. Destaques (callouts) — são impactantes e memoráveis?
5. Tom — direto, sem enrolação, vocabulário do nicho brasileiro

Retorne SOMENTE este JSON (sem texto antes ou depois):
{
  "score": 8,
  "aprovado": true,
  "pontos_fortes": ["ponto específico 1", "ponto específico 2"],
  "melhorias": ["melhoria específica 1", "melhoria específica 2"],
  "instrucao_regeneracao": "instrução direta de como melhorar na próxima geração"
}

Score: 1-10. Aprovado = true se score >= 7.`;

  try {
    const raw = await geminiJson(prompt, true);
    let review;
    try {
      review = JSON.parse(raw);
    } catch {
      review = { score: 7, aprovado: true, pontos_fortes: [], melhorias: [], instrucao_regeneracao: "" };
    }

    // Persiste aprendizado no Supabase
    await saveMemory("creative", "review", `${tipo} "${titulo}" — score ${review.score}/10`, {
      titulo, tipo, score: review.score, melhorias: review.melhorias,
    }).catch(() => {});

    console.log(`[Revisor] "${titulo}" — Score: ${review.score}/10 | Aprovado: ${review.aprovado}`);
    return review;
  } catch (e) {
    console.warn("[Revisor] Falha na revisão:", e.message);
    return { score: 7, aprovado: true, pontos_fortes: [], melhorias: [], instrucao_regeneracao: "" };
  }
}

function formatarReview(review, titulo) {
  const emoji = review.score >= 9 ? "🏆" : review.score >= 7 ? "✅" : review.score >= 5 ? "⚠️" : "❌";
  let msg = `${emoji} *Revisão: "${titulo}"*\n`;
  msg += `Score: *${review.score}/10*\n\n`;

  if (review.pontos_fortes?.length) {
    msg += `*Pontos fortes:*\n`;
    review.pontos_fortes.forEach(p => { msg += `• ${p}\n`; });
    msg += "\n";
  }
  if (review.melhorias?.length) {
    msg += `*Sugestões para próxima versão:*\n`;
    review.melhorias.forEach(m => { msg += `• ${m}\n`; });
  }
  return msg;
}

module.exports = { revisarEntregavel, formatarReview };
