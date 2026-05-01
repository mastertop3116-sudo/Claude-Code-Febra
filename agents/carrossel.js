const { openaiJson } = require('../integrations/openai')

const SYSTEM = `Especialista em carrosséis para Instagram e LinkedIn. Máx 10 palavras por slide de conteúdo. Gancho no slide 1. CTA no último. Responda APENAS em JSON: { "slides": [{ "tipo": "capa|conteudo|cta", "titulo": "string", "corpo": "string", "numero": 1 }] }`

async function run({ copy, estrategia, autor, formato = 'instagram_feed' }) {
  const prompt = `Autor: ${autor}\nFormato: ${formato}\nGanchos do conteúdo:\n${copy.secoes.slice(0,4).map(s => `- ${s.gancho}`).join('\n')}\nPromessa central: ${estrategia.promessa_central}\nGere 7 slides.`
  const result = JSON.parse(await openaiJson(prompt, SYSTEM))
  return result.slides
}

module.exports = { run }
