const { openaiJson } = require('../integrations/openai')

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

// Cache em memória para evitar chamadas duplicadas na mesma sessão
const _cache = new Map()

function _cacheKey(estrategia, estrutura, autor, tipo, maxSecoes) {
  return JSON.stringify({ a: autor, t: tipo, n: estrategia?.nicho_refinado, p: estrategia?.promessa_central, idx: estrutura?.indice?.length, ms: maxSecoes })
}

// Tipos que exigem system prompt mais rico
const PRO_TYPES = new Set(['workbook', 'script_vsl'])

function _sanitizeJson(raw) {
  raw = raw.trim()
  raw = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '')
  const s = raw.indexOf('{'), e = raw.lastIndexOf('}')
  if (s !== -1 && e !== -1) raw = raw.slice(s, e + 1)
  raw = raw.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
  return raw
}

async function _callModel(systemPrompt, prompt) {
  const raw = _sanitizeJson(await openaiJson(prompt, systemPrompt))
  try {
    return JSON.parse(raw)
  } catch (_) {
    const { jsonrepair } = require('jsonrepair')
    return JSON.parse(jsonrepair(raw))
  }
}

async function run({ estrategia, estrutura, autor, tipo, num_paginas }) {
  // Limita número de seções para evitar timeouts em ebooks grandes (>15 páginas)
  // Regra: ~2 páginas por seção; máx 8 seções por chamada única
  const paginasNum = parseInt(num_paginas) || 0
  const maxSecoes = paginasNum > 0 ? Math.min(Math.max(3, Math.round(paginasNum / 2)), 8) : 8

  const key = _cacheKey(estrategia, estrutura, autor, tipo, maxSecoes)
  if (_cache.has(key)) {
    console.log('[copywriter] cache hit')
    return _cache.get(key)
  }

  const systemPrompt = PRO_TYPES.has(tipo) ? SYSTEM_PRO : SYSTEM_FLASH

  // Limita o índice passado ao arquiteto para respeitar maxSecoes
  const indiceReduzido = estrutura?.indice
    ? { ...estrutura, indice: estrutura.indice.slice(0, maxSecoes) }
    : estrutura

  const prompt = `Autor: ${autor}\nTipo: ${tipo}\nNúmero máximo de seções: ${maxSecoes}\nEstratégia: ${JSON.stringify(estrategia)}\nEstrutura: ${JSON.stringify(indiceReduzido)}\nEscreva exatamente ${maxSecoes} seções (não mais que isso).`

  console.log(`[copywriter] tipo=${tipo} maxSecoes=${maxSecoes} → OpenAI gpt-4o-mini`)
  const result = await _callModel(systemPrompt, prompt)

  // Garante que não ultrapassa maxSecoes mesmo se o modelo ignorar a instrução
  if (result.secoes && result.secoes.length > maxSecoes) {
    result.secoes = result.secoes.slice(0, maxSecoes)
  }

  _cache.set(key, result)
  return result
}

module.exports = { run }
