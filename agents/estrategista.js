const { GoogleGenerativeAI } = require('@google/generative-ai')
const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
const { openaiJson } = require('../integrations/openai')
const is429 = e => e?.message?.includes('429') || e?.message?.toLowerCase().includes('quota') || e?.message?.toLowerCase().includes('exceeded')

async function _retry(fn, tries = 3) {
  for (let i = 1; i <= tries; i++) {
    try { return await fn() } catch (e) {
      if (i < tries && (e.message?.includes('503') || e.message?.includes('overloaded') || e.message?.includes('high demand'))) {
        await new Promise(r => setTimeout(r, i * 4000))
      } else throw e
    }
  }
}

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
  const model = genai.getGenerativeModel({ model: 'gemini-2.5-flash', systemInstruction: SYSTEM })
  const contexto = relatorio
    ? `\nRelatório de mercado:\n${relatorio.slice(0, 3000)}`
    : "";
  const promptText = `Tipo: ${tipo}\nTítulo: ${titulo}\nSubtítulo: ${subtitulo || ''}\nNicho: ${nicho}\nAvatar: ${avatar_publico || ''}${contexto}`
  try {
    const r = await _retry(() => model.generateContent(promptText))
    return JSON.parse(r.response.text().replace(/```json\n?|\n?```/g, '').trim())
  } catch (e) {
    if (is429(e)) {
      console.warn('[estrategista] 429 quota — fallback OpenAI')
      return JSON.parse(await openaiJson(promptText, SYSTEM))
    }
    throw e
  }
}

module.exports = { run }
