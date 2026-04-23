// ============================================
// NEXUS — Design Reviewer (Gestor Criativo)
// Duas revisões: conteúdo (texto) + visual (imagem)
// Score < 8 na capa → regera com prompt melhorado
// Critérios específicos por nicho
// ============================================

const { GoogleGenerativeAI } = require("@google/generative-ai");
const { geminiJson, geminiImage } = require("../../integrations/gemini");
const { saveMemory } = require("../../integrations/supabase");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Critérios visuais específicos por nicho/tema
const NICHE_VISUAL_CRITERIA = {
  impacto: `
- Energia dinâmica: a imagem transmite força, movimento, poder marcial?
- Paleta: tons profundos (preto, vermelho, dourado) — evita cores pastéis ou suaves
- Elemento central: silhueta ou figura de lutador/atleta reconhecível
- Para público infantil: personagem estilizado (sticker-art) com expressão de foco e determinação
- Ausência de elementos femininos ou delicados — é esportivo, intenso, masculino`,
  elegancia: `
- Refinamento: a imagem tem leveza, fluidez e beleza estética?
- Paleta: rosa, lilás, dourado ou branco — tons suaves e sofisticados
- Elemento central: silhueta de bailarina ou pose de dança reconhecível
- Textura: fundo com elementos delicados (flores, véu, luzes suaves)
- Ausência de elementos agressivos, escuros ou rústicos`,
  sabedoria: `
- Atmosfera: reverência, espiritualidade, paz e propósito
- Paleta: dourado, sépia, marrom profundo, creme
- Elementos: cruz, livro aberto, raios de luz, natureza serena
- Composição: equilibrada, centralizada, transmite autoridade espiritual
- Ausência de elementos profanos, modernos ou destoantes`,
  produtividade: `
- Clareza: design limpo, moderno, corporativo e inspirador
- Paleta: azul profundo, branco, cinza — identidade executiva
- Elementos: formas geométricas, gráficos, ícones minimalistas
- Composição: organizada, hierárquica, transmite competência
- Ausência de elementos orgânicos ou artísticos demais`,
  bemestar: `
- Serenidade: a imagem transmite calma, saúde, equilíbrio?
- Paleta: verde natural, branco, azul suave — orgânico e limpo
- Elementos: natureza (folhas, água, luz), corpo humano em movimento suave
- Composição: aberta, com respiro, sem excessos visuais
- Ausência de elementos violentos, escuros ou industriais`,
  criatividade: `
- Inovação: a imagem é surpreendente, única, visualmente estimulante?
- Paleta: vibrante — roxo + ciano, laranja + azul, ou combinação ousada
- Elementos: formas abstratas, geometria dinâmica, texturas digitais
- Composição: assimétrica, moderna, que faz o olho explorar
- Ausência de clichês fotográficos ou designs convencionais`,
};

// ──────────────────────────────────────────
// Revisão VISUAL da capa (manda a imagem para o Gemini)
// Retorna { score, aprovado, feedback, melhoriaPrompt }
// ──────────────────────────────────────────
async function revisarCapaVisual(coverImageBuffer, titulo, temaKey) {
  if (!coverImageBuffer) return null;

  const critEspecificos = NICHE_VISUAL_CRITERIA[temaKey] || NICHE_VISUAL_CRITERIA.produtividade;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent([
      {
        text: `Você é um diretor de arte RIGOROSO especialista em capas de produtos digitais para o mercado brasileiro de infoprodutos.
Avalie esta imagem para ser usada como capa do entregável "${titulo}" (nicho: ${temaKey}).

CRITÉRIOS GERAIS (peso 50%):
1. Impacto visual imediato — em 3 segundos chama atenção e comunica o valor?
2. Profissionalismo — parece produto pago de alto valor (R$47-R$97+)?
3. Hierarquia visual — composição clara com foco bem definido?
4. Qualidade técnica — sem artefatos, desfoque, ou erros de IA visíveis?
5. Ausência de texto na imagem — imagem pura, sem letras ou números?

CRITÉRIOS ESPECÍFICOS DO NICHO "${temaKey}" (peso 50%):
${critEspecificos}

Responda EM JSON puro (sem markdown):
{
  "score": 8,
  "aprovado": true,
  "feedback": "feedback específico sobre os critérios do nicho — o que está correto e o que falhou",
  "melhoria_prompt": "instrução detalhada em inglês para melhorar a imagem no próximo prompt de geração"
}

Score: 1-10. Aprovado = true APENAS se score >= 8. Seja rigoroso — score 8+ significa produto competitivo no mercado atual.`,
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

Score 1-10. Aprovado = true APENAS se >= 8. Seja criterioso — qualidade de mercado.`;

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
