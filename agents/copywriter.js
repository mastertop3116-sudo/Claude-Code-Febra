const { GoogleGenerativeAI } = require('@google/generative-ai')
const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

const SYSTEM = `Copywriter especialista em infoprodutos brasileiros. Frameworks: AIDA, PAS, StoryBrand.
Escreva na voz do autor. Parágrafos curtos. Linguagem direta. Zero jargão corporativo.
Responda APENAS em JSON válido:
{
  "secoes": [{
    "numero": 1,
    "titulo": "string",
    "gancho": "string",
    "conteudo": "string (markdown)",
    "ponto_de_acao": "string"
  }],
  "copy_capa": "string (máx 10 palavras)",
  "copy_contracapa": "string (1 parágrafo)"
}`

async function run({ estrategia, estrutura, autor, tipo }) {
  const model = genai.getGenerativeModel({
    model: 'gemini-2.5-pro',
    systemInstruction: SYSTEM,
    generationConfig: { responseMimeType: 'application/json' },
  })
  const r = await model.generateContent(`Autor: ${autor}\nTipo: ${tipo}\nEstratégia: ${JSON.stringify(estrategia)}\nEstrutura: ${JSON.stringify(estrutura)}\nEscreva todas as seções.`)
  return JSON.parse(r.response.text().trim())
}

module.exports = { run }
