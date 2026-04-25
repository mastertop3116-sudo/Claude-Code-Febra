const Anthropic = require('@anthropic-ai/sdk')
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

async function run({ copy, estrategia, autor, formato = 'instagram_feed' }) {
  const msg = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 3000,
    system: `Especialista em carrosséis para Instagram e LinkedIn. Máx 10 palavras por slide de conteúdo. Gancho no slide 1. CTA no último. Responda APENAS em JSON: { "slides": [{ "tipo": "capa|conteudo|cta", "titulo": "string", "corpo": "string", "numero": 1 }] }`,
    messages: [{ role: 'user', content: `Autor: ${autor}\nFormato: ${formato}\nGanchos do conteúdo:\n${copy.secoes.slice(0,4).map(s => `- ${s.gancho}`).join('\n')}\nPromessa central: ${estrategia.promessa_central}\nGere 7 slides.` }]
  })
  return JSON.parse(msg.content[0].text.replace(/```json\n?|\n?```/g, '').trim()).slides
}

module.exports = { run }
