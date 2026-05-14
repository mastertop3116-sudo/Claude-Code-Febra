const OpenAI = require('openai')

const MODEL = 'gpt-4o-mini'
let _client = null
function _getClient() {
  if (!_client) _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  return _client
}

async function openaiFlash(prompt, systemInstruction = null) {
  const messages = []
  if (systemInstruction) messages.push({ role: 'system', content: systemInstruction })
  messages.push({ role: 'user', content: prompt })
  const r = await _getClient().chat.completions.create({ model: MODEL, messages })
  return r.choices[0].message.content
}

async function openaiJson(prompt, systemInstruction = null) {
  const messages = []
  if (systemInstruction) messages.push({ role: 'system', content: systemInstruction })
  messages.push({ role: 'user', content: prompt })
  const r = await _getClient().chat.completions.create({
    model: MODEL,
    messages,
    response_format: { type: 'json_object' },
  })
  return r.choices[0].message.content
}

// Gera uma imagem via DALL-E 3 e retorna Buffer PNG
async function openaiImage(prompt, size = '1024x1024') {
  const r = await _getClient().images.generate({
    model: 'dall-e-3',
    prompt,
    n: 1,
    size,
    quality: 'standard',
  })
  const url = r.data[0].url
  if (!url) throw new Error('DALL-E não retornou URL')
  const res = await fetch(url)
  if (!res.ok) throw new Error(`fetch imagem HTTP ${res.status}: ${res.statusText}`)
  const buf = Buffer.from(await res.arrayBuffer())
  if (buf.length < 1000) throw new Error(`imagem muito pequena (${buf.length} bytes) — provavelmente erro`)
  // Validar magic bytes PNG: \x89PNG
  if (buf[0] !== 0x89 || buf[1] !== 0x50) throw new Error(`resposta não é PNG (bytes: ${buf[0]},${buf[1]})`)
  return buf
}

// Conversa com histórico completo de mensagens
async function openaiChat(messages) {
  const r = await _getClient().chat.completions.create({ model: MODEL, messages })
  return r.choices[0].message.content
}

module.exports = { openaiFlash, openaiJson, openaiImage, openaiChat }
