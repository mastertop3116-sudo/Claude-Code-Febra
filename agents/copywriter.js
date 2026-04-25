const Anthropic = require('@anthropic-ai/sdk')
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

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
  const msg = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 8000,
    system: SYSTEM,
    messages: [{ role: 'user', content: `Autor: ${autor}\nTipo: ${tipo}\nEstratégia: ${JSON.stringify(estrategia)}\nEstrutura: ${JSON.stringify(estrutura)}\nEscreva todas as seções.` }]
  })
  return JSON.parse(msg.content[0].text.replace(/```json\n?|\n?```/g, '').trim())
}

module.exports = { run }
