const { GoogleGenerativeAI } = require('@google/generative-ai')
const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

// Usado para tipos complexos (workbook, script_vsl) — estrutura rica, 400 palavras
const SYSTEM_PRO = `Copywriter infoprodutos BR. AIDA, PAS, StoryBrand. Voz do autor. Zero jargão.

Cada seção: mínimo 400 palavras. Estrutura:
1. Abertura impactante (2-3 parágrafos: problema + solução)
2. ## 3-4 técnicas NUMERADAS (mínimo 80 palavras cada)
3. ## "Exemplo Prático:" (caso real, mínimo 100 palavras)
4. ## "Como Aplicar Hoje:" (4 passos numerados)
5. Fechamento com CTA implícito (1-2 parágrafos)

Markdown: ## subtítulos, **negrito**, listas numeradas, \n\n entre parágrafos.

JSON APENAS:
{
  "secoes": [{"numero":1,"titulo":"string","gancho":"string (benefício em até 15 palavras)","conteudo":"string markdown mín 400 palavras","ponto_de_acao":"string (ação mensurável hoje)"}],
  "copy_capa": "string (máx 10 palavras)",
  "copy_contracapa": "string (2-3 parágrafos persuasivos + CTA)"
}`

// Usado para tipos padrão (ebook, checklist, planner, etc.) — lean, 250 palavras
const SYSTEM_FLASH = `Copywriter infoprodutos BR. AIDA, PAS. Direto, zero jargão.

Cada seção: mínimo 250 palavras. Estrutura:
1. Abertura (1-2 parágrafos: problema + solução)
2. ## 3 técnicas NUMERADAS (mínimo 50 palavras cada)
3. ## "Como Aplicar:" (3 passos numerados)
4. Fechamento com CTA implícito (1 parágrafo)

Markdown: ## subtítulos, **negrito**, listas, \n\n entre parágrafos.

JSON APENAS:
{
  "secoes": [{"numero":1,"titulo":"string","gancho":"string (benefício em até 15 palavras)","conteudo":"string markdown mín 250 palavras","ponto_de_acao":"string (ação hoje)"}],
  "copy_capa": "string (máx 10 palavras)",
  "copy_contracapa": "string (2 parágrafos + CTA)"
}`

const { openaiJson } = require('../integrations/openai')
const is429 = e => e?.message?.includes('429') || e?.message?.toLowerCase().includes('quota') || e?.message?.toLowerCase().includes('exceeded')

// Cache em memória para evitar chamadas duplicadas na mesma sessão
const _cache = new Map()

function _cacheKey(estrategia, estrutura, autor, tipo) {
  return JSON.stringify({ a: autor, t: tipo, n: estrategia?.nicho_refinado, p: estrategia?.promessa_central, idx: estrutura?.indice?.length })
}

// Tipos que exigem Pro: copy complexa, VSL, conteúdo longo/persuasivo
const PRO_TYPES = new Set(['workbook', 'script_vsl'])

function _sanitizeJson(raw) {
  raw = raw.trim()
  raw = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '')
  const s = raw.indexOf('{'), e = raw.lastIndexOf('}')
  if (s !== -1 && e !== -1) raw = raw.slice(s, e + 1)
  raw = raw.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
  return raw
}

async function _callModel(modelName, systemPrompt, prompt) {
  const model = genai.getGenerativeModel({
    model: modelName,
    systemInstruction: systemPrompt,
    generationConfig: { responseMimeType: 'application/json' },
  })
  const is503 = e => e?.message?.includes('503') || e?.message?.includes('overloaded') || e?.message?.includes('high demand')
  let r
  for (let i = 1; i <= 3; i++) {
    try { r = await model.generateContent(prompt); break }
    catch (e) {
      if (i < 3 && is503(e)) { await new Promise(x => setTimeout(x, i * 4000)) }
      else if (is429(e)) {
        console.warn('[copywriter] 429 quota — fallback OpenAI')
        return JSON.parse(await openaiJson(prompt, systemPrompt))
      }
      else throw e
    }
  }
  const raw = _sanitizeJson(r.response.text())
  try {
    return JSON.parse(raw)
  } catch (_) {
    const { jsonrepair } = require('jsonrepair')
    return JSON.parse(jsonrepair(raw))
  }
}

async function run({ estrategia, estrutura, autor, tipo }) {
  const key = _cacheKey(estrategia, estrutura, autor, tipo)
  if (_cache.has(key)) {
    console.log('[copywriter] cache hit — tokens economizados')
    return _cache.get(key)
  }

  // PRO_TYPES recebem system prompt mais rico; Flash em todos os casos
  const systemPrompt = PRO_TYPES.has(tipo) ? SYSTEM_PRO : SYSTEM_FLASH
  const prompt = `Autor: ${autor}\nTipo: ${tipo}\nEstratégia: ${JSON.stringify(estrategia)}\nEstrutura: ${JSON.stringify(estrutura)}\nEscreva todas as seções.`

  console.log(`[copywriter] tipo=${tipo} → modelo: Flash`)
  const result = await _callModel('gemini-2.5-flash', systemPrompt, prompt)

  _cache.set(key, result)
  return result
}

module.exports = { run }
