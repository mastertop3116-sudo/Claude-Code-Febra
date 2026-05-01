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

const SYSTEM = `Você é um arquiteto de conteúdo para entregáveis digitais.
Recebe estratégia e tipo. Responda APENAS em JSON válido:
{
  "indice": [{ "numero": 1, "titulo": "string", "objetivo": "string", "tipo_pagina": "capitulo|exercicio|checklist|reflexao" }],
  "framework_transformacao": "string",
  "cta_principal": "string"
}`

async function run({ estrategia, tipo, num_paginas, num_capitulos }) {
  const model = genai.getGenerativeModel({ model: 'gemini-2.5-flash', systemInstruction: SYSTEM })
  const promptText = `Tipo: ${tipo}\nPáginas: ${num_paginas || 'auto'}\nCapítulos: ${num_capitulos || 'auto'}\nEstratégia: ${JSON.stringify(estrategia)}`
  try {
    const r = await _retry(() => model.generateContent(promptText))
    return JSON.parse(r.response.text().replace(/```json\n?|\n?```/g, '').trim())
  } catch (e) {
    if (is429(e)) {
      console.warn('[arquiteto] 429 quota — fallback OpenAI')
      return JSON.parse(await openaiJson(promptText, SYSTEM))
    }
    throw e
  }
}

module.exports = { run }
