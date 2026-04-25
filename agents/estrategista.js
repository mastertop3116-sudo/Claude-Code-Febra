const { GoogleGenerativeAI } = require('@google/generative-ai')
const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

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

async function run({ titulo, subtitulo, nicho, avatar_publico, tipo }) {
  const model = genai.getGenerativeModel({ model: 'gemini-2.0-flash', systemInstruction: SYSTEM })
  const r = await model.generateContent(`Tipo: ${tipo}\nTítulo: ${titulo}\nSubtítulo: ${subtitulo || ''}\nNicho: ${nicho}\nAvatar: ${avatar_publico || ''}`)
  return JSON.parse(r.response.text().replace(/```json\n?|\n?```/g, '').trim())
}

module.exports = { run }
