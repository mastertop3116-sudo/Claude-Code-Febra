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

async function openaiImage(prompt, size = '1024x1024', quality = 'medium') {
  // Modelo de imagem ATUAL da OpenAI (gpt-image-2). Fallback p/ gpt-image-1 se indisponível.
  let model = process.env.IMG_MODEL || 'gpt-image-2'
  let r
  try {
    r = await _getClient().images.generate({ model, prompt, n: 1, size, quality })
  } catch (e) {
    console.warn('[openai] ' + model + ' indisponível — tentando gpt-image-1:', String(e.message).slice(0, 80))
    model = 'gpt-image-1'
    r = await _getClient().images.generate({ model, prompt, n: 1, size, quality })
  }
  const d = r.data[0]
  let buf
  if (d.b64_json) {
    buf = Buffer.from(d.b64_json, 'base64')          // gpt-image-1 devolve base64
  } else if (d.url) {
    const res = await fetch(d.url)                   // dall-e devolve URL
    if (!res.ok) throw new Error(`fetch imagem HTTP ${res.status}`)
    buf = Buffer.from(await res.arrayBuffer())
  } else {
    throw new Error('imagem não retornada')
  }
  if (buf.length < 5000) throw new Error(`imagem suspeita: ${buf.length} bytes`)
  _logCost({ service: 'openai', model, units: 1, cost_usd: PRICE_IMG })
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
