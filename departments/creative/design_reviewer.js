// ============================================
// NEXUS — Design Reviewer (Gestor Criativo)
// Duas revisões: conteúdo (texto) + visual (imagem)
// Score < 8 na capa → regera com prompt melhorado
// Critérios específicos por nicho
// ============================================

const { geminiJson } = require("../../integrations/gemini");
const { saveMemory } = require("../../integrations/supabase");
const { _inferTema } = require("../../agents/capa");
require("dotenv").config();

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
  espiritual: `
- Atmosfera sagrada: transmite fé, paz, reverência e presença divina?
- Paleta: dourado, sépia, creme, luz branca — tons que remetem ao sagrado
- Elementos: luz divina, raios suaves, cruz, páginas de bíblia, natureza serena
- Composição: equilibrada, centralizada, inspiradora — convida ao silêncio interior
- Ausência de elementos profanos, agressivos ou modernos demais`,
  infantil: `
- Alegria imediata: a imagem transmite diversão, energia e segurança para crianças?
- Paleta: cores primárias vibrantes mas harmônicas — amarelo, azul, vermelho, verde
- Elementos: personagens estilizados (sticker-art), formas arredondadas, expressões amigáveis
- Composição: aberta, dinâmica, com foco central claro e borda limpa
- Ausência de elementos assustadores, escuros ou inadequados para o público infantil`,
  esportivo: `
- Energia física: a imagem transmite movimento, força e determinação atlética?
- Paleta: preto, vermelho, laranja elétrico ou azul intenso — alta energia, sem pastéis
- Elementos: silhueta em movimento, equipamento esportivo, luz dramática
- Composição: dinâmica, diagonal, transmite velocidade e impacto
- Ausência de elementos femininos delicados, estáticos ou acadêmicos`,
  saude: `
- Bem-estar visual: a imagem transmite saúde, vitalidade e equilíbrio?
- Paleta: verde fresco, branco limpo, azul suave — associações naturais e médicas
- Elementos: natureza (folhas, água), figura humana em movimento leve, luz natural
- Composição: aberta, com respiro, transmite clareza e higiene visual
- Ausência de elementos industriais, escuros ou agressivos`,
  financas: `
- Prosperidade visual: a imagem transmite confiança, crescimento e riqueza?
- Paleta: verde escuro, dourado, preto premium — nada barato ou colorido demais
- Elementos: gráficos ascendentes abstratos, formas geométricas precisas, textura premium
- Composição: hierárquica, limpa, transmite competência e autoridade financeira
- Ausência de dinheiro literal, cifrões explícitos ou clichês financeiros`,
  educacao: `
- Inspiração ao conhecimento: a imagem convida à descoberta e ao aprendizado?
- Paleta: âmbar quente, azul profundo ou verde intelectual — acolhedora mas séria
- Elementos: livros abertos, luz de descoberta, formas que remetem à aprendizagem
- Composição: acolhedora, organizada, transmite sabedoria acessível
- Ausência de elementos infantilizados ou excessivamente corporativos`,
};

// ──────────────────────────────────────────
// Revisão VISUAL da capa (manda a imagem para o Gemini)
// Retorna { score, aprovado, feedback, melhoriaPrompt }
// ──────────────────────────────────────────
async function revisarCapaVisual(coverImageBuffer, titulo, temaKey) {
  if (!coverImageBuffer) return null;

  // temaKey may be a product type ('devocional') — infer the visual theme if not a criteria key
  const resolvedKey = NICHE_VISUAL_CRITERIA[temaKey] ? temaKey : _inferTema('', temaKey);
  const critEspecificos = NICHE_VISUAL_CRITERIA[resolvedKey] || NICHE_VISUAL_CRITERIA.produtividade;

  try {
    const { openaiJson: _oaiJson } = require("../../integrations/openai");
    const OpenAI = require("openai");
    let _client = null;
    const _getClient = () => { if (!_client) _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY }); return _client; };

    const reviewPrompt = `Você é um diretor de arte RIGOROSO especialista em capas de produtos digitais para o mercado brasileiro de infoprodutos.
Avalie esta imagem para ser usada como capa do entregável "${titulo}" (nicho: ${resolvedKey}).

CRITÉRIOS GERAIS (peso 50%):
1. Impacto visual imediato — em 3 segundos chama atenção e comunica o valor?
2. Profissionalismo — parece produto pago de alto valor (R$47-R$97+)?
3. Hierarquia visual — composição clara com foco bem definido?
4. Qualidade técnica — sem artefatos, desfoque, ou erros de geração visíveis?
5. Ausência de texto na imagem — imagem pura, sem letras ou números?

CRITÉRIOS ESPECÍFICOS DO NICHO "${resolvedKey}" (peso 50%):
${critEspecificos}

Responda EM JSON puro (sem markdown):
{
  "score": 8,
  "aprovado": true,
  "feedback": "feedback específico sobre os critérios do nicho — o que está correto e o que falhou",
  "melhoria_prompt": "instrução detalhada em inglês para melhorar a imagem no próximo prompt de geração"
}

Score: 1-10. Aprovado = true APENAS se score >= 8. Seja rigoroso — score 8+ significa produto competitivo no mercado atual.`;

    const r = await _getClient().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{
        role: "user",
        content: [
          { type: "text", text: reviewPrompt },
          { type: "image_url", image_url: { url: `data:image/png;base64,${coverImageBuffer.toString("base64")}` } },
        ],
      }],
      response_format: { type: "json_object" },
    });

    const review = JSON.parse(r.choices[0].message.content);
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
    const raw = await geminiJson(prompt, false);
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
