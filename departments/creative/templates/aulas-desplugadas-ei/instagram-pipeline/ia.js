// Motor de IA com FALLBACK: tenta OpenAI (gpt-4o-mini); se cair (quota/billing/erro),
// usa o Claude (Anthropic) automaticamente. Mantém posts e robô funcionando mesmo
// com a OpenAI fora do ar. Chaves vêm do .env (OPENAI_API_KEY / ANTHROPIC_API_KEY).
const OpenAI    = require('openai');
const Anthropic = require('@anthropic-ai/sdk');

const openai    = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: 60000, maxRetries: 1 });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const CLAUDE_MODEL = process.env.CLAUDE_FALLBACK_MODEL || 'claude-haiku-4-5-20251001';

function extrairJSON(txt) {
  const i = txt.indexOf('{'), j = txt.lastIndexOf('}');
  return JSON.parse(i >= 0 && j > i ? txt.slice(i, j + 1) : txt);
}

// Gera um objeto JSON a partir do prompt (o prompt já deve pedir "retorne SOMENTE JSON")
async function gerarJSON(prompt, { temperature = 0.9 } = {}) {
  try {
    const r = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature,
    });
    return JSON.parse(r.choices[0].message.content);
  } catch (e) {
    console.warn(`[ia] OpenAI falhou (${e.status || e.message?.slice(0, 60)}) → usando Claude (${CLAUDE_MODEL})`);
    const r = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 2500,
      temperature,
      messages: [
        { role: 'user', content: prompt + '\n\nResponda APENAS com o JSON válido, sem nenhum texto antes ou depois.' },
        { role: 'assistant', content: '{' }, // prefill força o JSON
      ],
    });
    return extrairJSON('{' + r.content[0].text);
  }
}

// Gera texto livre curto (ex: resposta de comentário)
async function gerarTexto(prompt, { temperature = 0.8, maxTokens = 120 } = {}) {
  try {
    const r = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature, max_tokens: maxTokens,
    });
    return (r.choices[0].message.content || '').trim();
  } catch (e) {
    console.warn(`[ia] OpenAI falhou (${e.status || e.message?.slice(0, 60)}) → usando Claude (${CLAUDE_MODEL})`);
    const r = await anthropic.messages.create({
      model: CLAUDE_MODEL, max_tokens: maxTokens, temperature,
      messages: [{ role: 'user', content: prompt }],
    });
    return (r.content?.[0]?.text || '').trim();
  }
}

module.exports = { gerarJSON, gerarTexto };
