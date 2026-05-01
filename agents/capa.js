const { openaiFlash } = require('../integrations/openai')
const OpenAI = require('openai')

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
  const prompt = `Abstract digital art for ebook cover. Visual style: ${TEMA_MAP[temaKey]}. Topic concept: ${nicho}. STRICT RULES: absolutely no text, no letters, no numbers, no words. Pure abstract shapes, colors, and textures only. No faces, no people. Dark rich background. High-end editorial art direction.`

  let _client = null
  function _getClient() {
    if (!_client) _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    return _client
  }

  const response = await _getClient().images.generate({
    model: 'dall-e-3',
    prompt,
    size: '1024x1792',
    quality: 'standard',
    n: 1,
  })

  const imageUrl = response.data[0].url
  const res = await fetch(imageUrl)
  return Buffer.from(await res.arrayBuffer())
}

module.exports = { run }
