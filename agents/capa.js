const { GoogleGenAI } = require('@google/genai')
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

const TEMA_MAP = {
  impacto:      'bold red orange energy dynamic',
  elegancia:    'gold luxury minimal sophisticated',
  sabedoria:    'deep green forest ancient wisdom',
  produtividade:'blue steel sharp focus corporate',
  bemestar:     'soft green natural calm organic',
  criatividade: 'purple violet abstract creative flow',
}

async function run({ titulo, nicho, tema }) {
  const temaKey = Object.keys(TEMA_MAP).find(k => tema?.toLowerCase().includes(k)) || 'elegancia'
  const prompt = `Professional ebook cover background. Topic: "${nicho}". Visual style: ${TEMA_MAP[temaKey]}. Abstract minimal composition, no text, no faces, no people. Dark background. High-end editorial photography quality.`

  const response = await ai.models.generateImages({
    model: 'imagen-4.0-generate-preview-05-20',
    prompt,
    config: { numberOfImages: 1, aspectRatio: '3:4', personGeneration: 'dont_allow' }
  })

  return Buffer.from(response.generatedImages[0].image.imageBytes, 'base64')
}

module.exports = { run }
