const { openaiJson } = require('../integrations/openai')
const { jsonrepair } = require('jsonrepair')

const SYSTEM = `Você é um estrategista de marketing de infoprodutos brasileiros.
Analise nicho, título e avatar. Responda APENAS em JSON válido:
{
  "nicho_refinado": "string",
  "avatar": {
    "descricao": "string",
    "dores": ["string"],
    "objecoes": ["string"],
    "nivel_consciencia": "inconsciente|problema|solucao|produto"
  },
  "angulo": "string",
  "promessa_central": "string",
  "tom_de_voz": "autoritativo|empático|educativo|inspirador"
}`

async function run({ titulo, subtitulo, nicho, avatar_publico, tipo, relatorio = "" }) {
  const contexto = relatorio
    ? `\nRelatório de mercado:\n${relatorio.slice(0, 3000)}`
    : "";
  const prompt = `Tipo: ${tipo}\nTítulo: ${titulo}\nSubtítulo: ${subtitulo || ''}\nNicho: ${nicho}\nAvatar: ${avatar_publico || ''}${contexto}`
  const raw = await openaiJson(prompt, SYSTEM)
  try {
    return JSON.parse(raw)
  } catch (_) {
    return JSON.parse(jsonrepair(raw))
  }
}

module.exports = { run }
