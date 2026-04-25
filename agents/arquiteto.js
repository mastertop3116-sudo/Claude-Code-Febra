const { GoogleGenerativeAI } = require('@google/generative-ai')
const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

const SYSTEM = `Você é um arquiteto de conteúdo para entregáveis digitais.
Recebe estratégia e tipo. Responda APENAS em JSON válido:
{
  "indice": [{ "numero": 1, "titulo": "string", "objetivo": "string", "tipo_pagina": "capitulo|exercicio|checklist|reflexao" }],
  "framework_transformacao": "string",
  "cta_principal": "string"
}`

async function run({ estrategia, tipo, num_paginas, num_capitulos }) {
  const model = genai.getGenerativeModel({ model: 'gemini-2.0-flash', systemInstruction: SYSTEM })
  const r = await model.generateContent(`Tipo: ${tipo}\nPáginas: ${num_paginas || 'auto'}\nCapítulos: ${num_capitulos || 'auto'}\nEstratégia: ${JSON.stringify(estrategia)}`)
  return JSON.parse(r.response.text().replace(/```json\n?|\n?```/g, '').trim())
}

module.exports = { run }
