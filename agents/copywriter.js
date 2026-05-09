const { openaiJson } = require('../integrations/openai')

// Usado para tipos complexos (workbook, script_vsl) — estrutura rica, 400 palavras
const SYSTEM_PRO = `Copywriter infoprodutos BR. AIDA, PAS, StoryBrand. Voz do autor. Zero jargão.
REGRA CRÍTICA: Gere CONTEÚDO PRONTO para uso direto. O leitor copia, aplica, usa amanhã. Proibido: teoria sem aplicação, enrolação, introdução genérica.

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
REGRA CRÍTICA: Gere CONTEÚDO PRONTO para uso direto. O leitor copia, aplica, usa amanhã. Proibido: teoria abstrata, enrolação, introdução genérica.

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

// Usado para devocionais diários — gera o devocional de cada dia, não teoria
const SYSTEM_DEVOCIONAL = `Escritor cristão brasileiro. Linguagem calorosa, íntima e acessível. Profundidade espiritual sem academicismo.

CADA SEÇÃO É UM DEVOCIONAL COMPLETO PARA UM DIA. Estrutura OBRIGATÓRIA para cada seção:
1. **📖 Versículo do Dia** — cite o versículo bíblico completo com referência (ex: "Pois Deus amou o mundo de tal maneira... — João 3:16")
2. **Reflexão** — 3 a 4 parágrafos meditando o versículo e conectando com a vida real do leitor hoje
3. **🤔 Para pensar hoje:** — lista com 2 a 3 perguntas de reflexão pessoal
4. **🙏 Oração do Dia** — oração escrita em 1ª pessoa, íntima e direta, 1 a 2 parágrafos
5. **✅ Desafio do Dia** — 1 ação concreta e específica para praticar neste dia

NÃO escreva teoria sobre como fazer um devocional. NÃO explique o que é oração.
Escreva O DEVOCIONAL PRONTO — o leitor abre, lê e já está fazendo o devocional.
Mínimo 300 palavras por seção.

JSON APENAS:
{
  "secoes": [{"numero":1,"titulo":"string","gancho":"string (inspiração do dia em até 15 palavras)","conteudo":"string markdown mín 300 palavras","ponto_de_acao":"string (desafio do dia em 1 frase curta)"}],
  "copy_capa": "string (máx 10 palavras)",
  "copy_contracapa": "string (2-3 parágrafos + convite caloroso para a jornada de 7 dias)"
}`

// Usado para pregações prontas — gera sermões completos, não teoria
const SYSTEM_PREGACOES = `Pregador e escritor cristão brasileiro. Linguagem acessível por faixa etária. Zero jargão acadêmico.

CADA SEÇÃO É UMA PREGAÇÃO COMPLETA E PRONTA PARA USAR. Estrutura obrigatória:
1. Texto bíblico principal + versículos de apoio
2. Introdução impactante (2-3 parágrafos que prendem atenção)
3. **Ponto 1:** [título] — mínimo 3 parágrafos desenvolvidos
4. **Ponto 2:** [título] — mínimo 3 parágrafos desenvolvidos
5. **Ponto 3:** [título] — mínimo 3 parágrafos desenvolvidos
6. Conclusão com desafio prático (1-2 parágrafos)
7. Aplicação: o que o ouvinte deve fazer esta semana

NÃO gere teoria sobre como pregar. Gere a PREGAÇÃO PRONTA para ler e usar.
Use linguagem da faixa etária indicada no objetivo de cada seção.

JSON APENAS:
{
  "secoes": [{"numero":1,"titulo":"string","gancho":"string (benefício em até 15 palavras)","conteudo":"string markdown mín 400 palavras","ponto_de_acao":"string (desafio desta semana)"}],
  "copy_capa": "string (máx 10 palavras)",
  "copy_contracapa": "string (2-3 parágrafos + CTA)"
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

// Limite global: Gamma AI suporta max 12 cards → max 10 seções de conteúdo
const GAMMA_MAX_SECOES = 10

async function run({ estrategia, estrutura, autor, tipo, num_paginas }) {
  // Server-side cap: max 20 páginas alinhado ao Gamma
  const paginasNum = Math.min(parseInt(num_paginas) || 0, 20)
  // Devocional: 1 página = 1 dia; outros tipos: ~2 páginas por seção
  const maxSecoes = tipo === 'devocional'
    ? Math.min(paginasNum || 7, GAMMA_MAX_SECOES)
    : paginasNum > 0 ? Math.min(Math.max(3, Math.round(paginasNum / 2)), GAMMA_MAX_SECOES) : 7

  const key = _cacheKey(estrategia, estrutura, autor, tipo, maxSecoes)
  if (_cache.has(key)) {
    console.log('[copywriter] cache hit')
    return _cache.get(key)
  }

  const systemPrompt = tipo === 'devocional' ? SYSTEM_DEVOCIONAL
    : tipo === 'pregacoes' ? SYSTEM_PREGACOES
    : PRO_TYPES.has(tipo) ? SYSTEM_PRO
    : SYSTEM_FLASH

  // Limita o índice passado ao arquiteto para respeitar maxSecoes
  const indiceReduzido = estrutura?.indice
    ? { ...estrutura, indice: estrutura.indice.slice(0, maxSecoes) }
    : estrutura

  const extraDevocional = tipo === 'devocional'
    ? `\nIMPORTANTE: Escreva cada seção como um DEVOCIONAL COMPLETO para aquele dia específico. Inclua versículo, reflexão, perguntas, oração e desafio. NÃO escreva teoria sobre como fazer devocional.`
    : ''

  const prompt = `Autor: ${autor}\nTipo: ${tipo}\nNúmero máximo de seções: ${maxSecoes}\nEstratégia: ${JSON.stringify(estrategia)}\nEstrutura: ${JSON.stringify(indiceReduzido)}\nEscreva exatamente ${maxSecoes} seções (não mais que isso).${extraDevocional}`

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
