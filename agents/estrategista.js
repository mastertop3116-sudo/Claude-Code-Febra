const { openaiJson } = require('../integrations/openai')
const { jsonrepair } = require('jsonrepair')

// Estrategista genérico — posiciona qualquer entregável digital como um produto de VALOR PRONTO
// Regra central: a promessa_central descreve a transformação/resultado que o leitor obtém AO USAR o produto,
// nunca a aprendizado ou instrução sobre como fazê-lo.
const SYSTEM = `Você é um estrategista de marketing de infoprodutos digitais brasileiros.
Sua missão: posicionar qualquer tipo de entregável (ebook, devocional, planner, pregação, atividade, kit, workbook) como um produto PRONTO para uso imediato — não um curso ou guia de como fazer algo.

REGRA CRÍTICA — promessa_central:
- CORRETO: descreve o resultado/transformação que o comprador sente ao usar o produto ("7 encontros com Deus que renovam sua fé", "30 dias de ação diária que organizam suas finanças")
- ERRADO: descreve aprendizado ou instrução ("Aprenda a fazer...", "Como criar...", "Guia para...")

O produto sempre ENTREGA o resultado diretamente — o comprador não precisa aprender nada, só usar.

Responda APENAS em JSON válido:
{
  "nicho_refinado": "string",
  "avatar": {
    "descricao": "string",
    "dores": ["string"],
    "objecoes": ["string"],
    "nivel_consciencia": "inconsciente|problema|solucao|produto"
  },
  "angulo": "string (ângulo de posicionamento baseado no resultado entregue, não no aprendizado)",
  "promessa_central": "string (transformação/resultado concreto, máx 15 palavras)",
  "tom_de_voz": "autoritativo|empático|educativo|inspirador"
}`

async function run({ titulo, subtitulo, nicho, avatar_publico, tipo, relatorio = "" }) {
  const contexto = relatorio
    ? `\nRelatório de mercado:\n${relatorio.slice(0, 3000)}`
    : "";
  const prompt = `Tipo de entregável: ${tipo}\nTítulo: ${titulo}\nSubtítulo: ${subtitulo || ''}\nNicho: ${nicho}\nAvatar: ${avatar_publico || ''}${contexto}`
  const raw = await openaiJson(prompt, SYSTEM)
  try {
    return JSON.parse(raw)
  } catch (_) {
    return JSON.parse(jsonrepair(raw))
  }
}

module.exports = { run }
