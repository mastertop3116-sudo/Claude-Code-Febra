const OpenAI = require('openai')

const MODEL = 'gpt-4o-mini'
// Preços em USD por token (gpt-4o-mini, mai/2025)
const PRICE_IN  = 0.15  / 1_000_000  // $0.15 por 1M tokens de entrada
const PRICE_OUT = 0.60  / 1_000_000  // $0.60 por 1M tokens de saída
const PRICE_IMG = 0.040              // $0.040 por imagem DALL-E 3 standard 1024x1024

let _client = null
function _getClient() {
  if (!_client) _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  return _client
}

function _logCost(data) {
  try { require('./supabase').logCost(data) } catch (_) {}
}

async function openaiFlash(prompt, systemInstruction = null) {
  const messages = []
  if (systemInstruction) messages.push({ role: 'system', content: systemInstruction })
  messages.push({ role: 'user', content: prompt })
  const r = await _getClient().chat.completions.create({ model: MODEL, messages })
  const u = r.usage || {}
  _logCost({
    service: 'openai', model: MODEL,
    tokens_in: u.prompt_tokens, tokens_out: u.completion_tokens,
    cost_usd: (u.prompt_tokens || 0) * PRICE_IN + (u.completion_tokens || 0) * PRICE_OUT,
  })
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
  const u = r.usage || {}
  _logCost({
    service: 'openai', model: MODEL,
    tokens_in: u.prompt_tokens, tokens_out: u.completion_tokens,
    cost_usd: (u.prompt_tokens || 0) * PRICE_IN + (u.completion_tokens || 0) * PRICE_OUT,
  })
  return r.choices[0].message.content
}

async function openaiImage(prompt, size = '1024x1024') {
  // Try DALL-E 3 first; fall back to DALL-E 2 if the model isn't available on this key
  let model = 'dall-e-3'
  let effectiveSize = size
  let r
  try {
    r = await _getClient().images.generate({ model, prompt, n: 1, size: effectiveSize, quality: 'standard' })
  } catch (e) {
    if (/does not exist/i.test(e.message) || e.status === 400) {
      console.warn('[openai] DALL-E 3 indisponível — usando DALL-E 2 como fallback')
      model = 'dall-e-2'
      effectiveSize = '1024x1024'
      r = await _getClient().images.generate({ model, prompt: prompt.slice(0, 1000), n: 1, size: effectiveSize })
    } else {
      throw e
    }
  }
  const url = r.data[0].url
  if (!url) throw new Error('DALL-E não retornou URL')
  const res = await fetch(url)
  if (!res.ok) throw new Error(`fetch imagem HTTP ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  if (buf.length < 5000) throw new Error(`imagem suspeita: ${buf.length} bytes`)
  _logCost({ service: 'openai', model, units: 1, cost_usd: model === 'dall-e-3' ? PRICE_IMG : 0.018 })
  return buf
}

// Conversa com histórico completo de mensagens
async function openaiChat(messages) {
  const r = await _getClient().chat.completions.create({ model: MODEL, messages })
  const u = r.usage || {}
  _logCost({
    service: 'openai', model: MODEL,
    tokens_in: u.prompt_tokens, tokens_out: u.completion_tokens,
    cost_usd: (u.prompt_tokens || 0) * PRICE_IN + (u.completion_tokens || 0) * PRICE_OUT,
  })
  return r.choices[0].message.content
}

module.exports = { openaiFlash, openaiJson, openaiImage, openaiChat }
