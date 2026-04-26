const { GoogleGenerativeAI } = require('@google/generative-ai')
const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

const SYSTEM = `Especialista em carrosséis para Instagram e LinkedIn. Máx 10 palavras por slide de conteúdo. Gancho no slide 1. CTA no último. Responda APENAS em JSON: { "slides": [{ "tipo": "capa|conteudo|cta", "titulo": "string", "corpo": "string", "numero": 1 }] }`

async function run({ copy, estrategia, autor, formato = 'instagram_feed' }) {
  const model = genai.getGenerativeModel({
    model: 'gemini-2.5-pro',
    systemInstruction: SYSTEM,
    generationConfig: { responseMimeType: 'application/json' },
  })
  const r = await model.generateContent(`Autor: ${autor}\nFormato: ${formato}\nGanchos do conteúdo:\n${copy.secoes.slice(0,4).map(s => `- ${s.gancho}`).join('\n')}\nPromessa central: ${estrategia.promessa_central}\nGere 7 slides.`)
  return JSON.parse(r.response.text().trim()).slides
}

module.exports = { run }
