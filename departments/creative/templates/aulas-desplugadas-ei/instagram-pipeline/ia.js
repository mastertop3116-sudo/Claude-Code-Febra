// Motor de IA do texto dos posts e do robô de comentários.
// PRINCIPAL: Claude (claude-haiku-4-5) — barato e bom. RESERVA: OpenAI (gpt-4o-mini).
// Assim o crédito da OpenAI fica livre pra IMAGEM (Claude não gera imagem).
// Ordem configurável via IA_TEXTO_ORDEM (ex: "openai,claude"). Padrão: claude primeiro.
const OpenAI    = require('openai');
const Anthropic = require('@anthropic-ai/sdk');

const openai    = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: 60000, maxRetries: 1 });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const CLAUDE_MODEL = process.env.CLAUDE_MODEL || 'claude-haiku-4-5-20251001';
const ORDEM = (process.env.IA_TEXTO_ORDEM || 'claude,openai').split(',').map(s => s.trim());

function extrairJSON(txt) {
  const i = txt.indexOf('{'), j = txt.lastIndexOf('}');
  return JSON.parse(i >= 0 && j > i ? txt.slice(i, j + 1) : txt);
}

// ── JSON ────────────────────────────────────────────────────────────────────
async function claudeJSON(prompt, temperature) {
  const r = await anthropic.messages.create({
    model: CLAUDE_MODEL, max_tokens: 2500, temperature,
    messages: [
      { role: 'user', content: prompt + '\n\nResponda APENAS com o JSON válido, sem nenhum texto antes ou depois.' },
      { role: 'assistant', content: '{' }, // prefill força o JSON
    ],
  });
  return extrairJSON('{' + r.content[0].text);
}
async function openaiJSON(prompt, temperature) {
  const r = await openai.chat.completions.create({
    model: 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' }, temperature,
  });
  return JSON.parse(r.choices[0].message.content);
}

// ── Texto livre ───────────────────────────────────────────────────────────────
async function claudeTexto(prompt, temperature, maxTokens) {
  const r = await anthropic.messages.create({
    model: CLAUDE_MODEL, max_tokens: maxTokens, temperature,
    messages: [{ role: 'user', content: prompt }],
  });
  return (r.content?.[0]?.text || '').trim();
}
async function openaiTexto(prompt, temperature, maxTokens) {
  const r = await openai.chat.completions.create({
    model: 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }],
    temperature, max_tokens: maxTokens,
  });
  return (r.choices[0].message.content || '').trim();
}

// Tenta os provedores na ordem; usa o próximo se o atual falhar.
async function comFallback(fns) {
  let ultimoErro;
  for (const prov of ORDEM) {
    if (!fns[prov]) continue;
    try { return await fns[prov](); }
    catch (e) { ultimoErro = e; console.warn(`[ia] ${prov} falhou (${e.status || (e.message || '').slice(0, 60)}) → tentando próximo`); }
  }
  throw ultimoErro || new Error('nenhum provedor de IA disponível');
}

async function gerarJSON(prompt, { temperature = 0.9 } = {}) {
  return comFallback({
    claude: () => claudeJSON(prompt, temperature),
    openai: () => openaiJSON(prompt, temperature),
  });
}
async function gerarTexto(prompt, { temperature = 0.8, maxTokens = 120 } = {}) {
  return comFallback({
    claude: () => claudeTexto(prompt, temperature, maxTokens),
    openai: () => openaiTexto(prompt, temperature, maxTokens),
  });
}

module.exports = { gerarJSON, gerarTexto };
