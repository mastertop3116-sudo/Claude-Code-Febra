const OpenAI = require('openai')

let _client = null
function _getClient() {
  if (!_client) _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  return _client
}

// Visual style per theme — maps to DALL-E art direction
const TEMA_MAP = {
  impacto:      'bold martial arts energy, red and black, dynamic movement, powerful',
  elegancia:    'gold luxury minimal sophisticated, soft light, refined editorial',
  sabedoria:    'deep green ancient wisdom, forest light, philosophical depth',
  produtividade:'blue steel sharp focus corporate, clean geometric, modern minimal',
  bemestar:     'soft green natural calm organic, serene light, wellness spa',
  criatividade: 'purple violet abstract creative flow, vibrant dynamic digital art',
  espiritual:   'divine golden light, soft rays through clouds, cross or open bible, sacred and peaceful atmosphere, warm sepia tones',
  infantil:     'playful bright colors, cartoon sticker-art style, friendly characters, cheerful and energetic, child-safe aesthetic',
  esportivo:    'athletic energy, dynamic movement blur, sport equipment silhouette, powerful dark background with electric accent',
  saude:        'fresh green and white, natural organic, human silhouette in motion, clean medical minimal aesthetic',
  financas:     'dark green gold wealth, abstract money flow, premium finance editorial, sharp geometric lines',
  educacao:     'warm knowledge amber, open books, light of discovery, academic but approachable, inspiring',
}

// Type-specific visual framing added to the base prompt
const TIPO_FRAME = {
  devocional:          'spiritual devotional book cover, single radiant light source, contemplative atmosphere, warm golden tones, faith and prayer',
  pregacoes:           'sermon book cover, pulpit or open bible, divine light rays, authoritative and inspiring, church aesthetic',
  planner:             'productivity planner cover, clean grid or calendar pattern, motivational energy, structured and elegant',
  checklist:           'action checklist cover, bold tick marks, clear decisive energy, high contrast minimal',
  ebook:               'digital ebook cover, editorial book design, premium publishing aesthetic',
  workbook:            'interactive workbook cover, hand-written feel, warm study desk atmosphere, creative and approachable',
  kit_dinamicas:       'dynamic activities kit cover, playful movement, group energy, colorful and vibrant',
  atividade_desplugada:'unplugged activity pack cover, paper crafts aesthetic, creative hands-on feel, fun and educational',
  plano_de_aula:       'lesson plan cover, classroom energy, organized and professional, teacher-focused design',
  script_vsl:          'video sales letter, camera lens or stage light, persuasive bold energy, dark cinematic',
}

// Infer theme from nicho keywords
function _inferTema(nicho = '', tipo = '') {
  const n = (nicho + ' ' + tipo).toLowerCase()
  if (/bíbli|devoc|pregaç|cristã|espirit|fé|oraç|jesus|deus|igreja|celula/i.test(n)) return 'espiritual'
  if (/jiu.jitsu|luta|boxe|karatê|ballet|dança|futebol|esport|atleta|academia/i.test(n)) return 'esportivo'
  if (/infanti|criança|bebê|pré.escol|maternal|escola|professor|aluno|sala de aula/i.test(n)) return 'infantil'
  if (/saúde|nutriç|emagrecer|dieta|fitness|bem.estar|mental|ansied/i.test(n)) return 'bemestar'
  if (/finanç|investim|dinheiro|renda|lucro|vendas|negócio/i.test(n)) return 'financas'
  if (/produtiv|gestão|organiz|planner|agenda|hábito/i.test(n)) return 'produtividade'
  if (/criativ|design|arte|escrit|conteúdo|social media/i.test(n)) return 'criatividade'
  if (/educa|aprend|conhecim|curso|formação/i.test(n)) return 'educacao'
  if (/impacto|força|poder|energia|transform/i.test(n)) return 'impacto'
  return 'elegancia'
}

async function run({ titulo, nicho, tema, tipo }) {
  const temaKey = tema
    ? (Object.keys(TEMA_MAP).find(k => tema.toLowerCase().includes(k)) || _inferTema(nicho, tipo))
    : _inferTema(nicho, tipo)

  const baseStyle = TEMA_MAP[temaKey] || TEMA_MAP.elegancia
  const tipoFrame = TIPO_FRAME[tipo] || ''

  const prompt = [
    'Abstract digital art for a premium Brazilian digital infoproduct cover.',
    tipoFrame ? `Product type: ${tipoFrame}.` : '',
    `Visual style: ${baseStyle}.`,
    `Topic concept: ${nicho || titulo}.`,
    'STRICT RULES: absolutely no text, no letters, no numbers, no words anywhere in the image.',
    'Pure abstract composition with shapes, light, colors and textures only.',
    'No faces, no realistic people.',
    'High-end editorial art direction, premium quality, fit for a paid digital product cover.',
  ].filter(Boolean).join(' ')

  const response = await _getClient().images.generate({
    model: 'dall-e-3',
    prompt,
    size: '1024x1792',
    quality: 'standard',
    n: 1,
  })

  const imageUrl = response.data[0].url
  const res = await fetch(imageUrl)
  return { buffer: Buffer.from(await res.arrayBuffer()), temaKey }
}

module.exports = { run, _inferTema }
