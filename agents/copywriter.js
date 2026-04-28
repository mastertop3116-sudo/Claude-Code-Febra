const { GoogleGenerativeAI } = require('@google/generative-ai')
const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

const SYSTEM_PRO = `Copywriter especialista em infoprodutos brasileiros. Frameworks: AIDA, PAS, StoryBrand.
Escreva na voz do autor. Linguagem direta e envolvente. Zero jargão corporativo.

REGRA CRÍTICA: Cada seção DEVE ter MÍNIMO 600 palavras. Use esta estrutura obrigatória:

1. Parágrafo de abertura impactante (3-4 parágrafos contextualizando o problema e a solução)
2. ## seguido de subtítulo com 3 a 5 técnicas ou estratégias NUMERADAS (mínimo 100 palavras cada técnica)
3. ## seguido de "Exemplo Prático:" com 1 caso de uso detalhado e contextualizado (mínimo 150 palavras)
4. ## seguido de "Como Aplicar Hoje:" com 4 a 5 passos acionáveis em lista numerada
5. Parágrafo de fechamento reflexivo com call-to-action implícito (2-3 parágrafos)

Use markdown rico obrigatoriamente:
- ## Subtítulos para separar as partes
- **negrito** para conceitos, números e afirmações importantes
- Listas numeradas: 1. 2. 3. para técnicas e passos
- Parágrafos separados por linha em branco (\n\n)

Responda APENAS em JSON válido:
{
  "secoes": [{
    "numero": 1,
    "titulo": "string",
    "gancho": "string (1 frase poderosa — o maior benefício desta seção em até 15 palavras)",
    "conteudo": "string em markdown rico com MÍNIMO 600 palavras",
    "ponto_de_acao": "string (ação específica e mensurável que o leitor pode fazer hoje mesmo)"
  }],
  "copy_capa": "string (máx 10 palavras de alto impacto)",
  "copy_contracapa": "string (3 parágrafos persuasivos com benefícios claros e call-to-action)"
}`

const SYSTEM_FLASH = `Copywriter de infoprodutos brasileiros. AIDA, PAS, StoryBrand.
Linguagem direta, zero jargão corporativo.

Cada seção: mínimo 350 palavras, estrutura:
1. Abertura (2 parágrafos: problema + solução)
2. ## 3 técnicas NUMERADAS (mínimo 60 palavras cada)
3. ## "Exemplo Prático:" (1 caso de uso, mínimo 80 palavras)
4. ## "Como Aplicar Hoje:" (3-4 passos numerados)
5. Fechamento (1-2 parágrafos com CTA implícito)

Markdown: ## subtítulos, **negrito**, 1. listas, \n\n entre parágrafos.

JSON APENAS:
{
  "secoes": [{
    "numero": 1,
    "titulo": "string",
    "gancho": "string (benefício principal em até 15 palavras)",
    "conteudo": "string markdown mínimo 350 palavras",
    "ponto_de_acao": "string (ação mensurável para hoje)"
  }],
  "copy_capa": "string (máx 10 palavras)",
  "copy_contracapa": "string (2 parágrafos persuasivos + CTA)"
}`

// Cache em memória para evitar chamadas duplicadas na mesma sessão
const _cache = new Map()

function _cacheKey(estrategia, estrutura, autor, tipo) {
  return JSON.stringify({ a: autor, t: tipo, n: estrategia?.nicho_refinado, p: estrategia?.promessa_central, idx: estrutura?.indice?.length })
}

// Tipos que exigem Pro: copy complexa, VSL, conteúdo longo/persuasivo
const PRO_TYPES = new Set(['ebook', 'workbook', 'script_vsl'])

async function run({ estrategia, estrutura, autor, tipo }) {
  const key = _cacheKey(estrategia, estrutura, autor, tipo)
  if (_cache.has(key)) {
    console.log('[copywriter] cache hit — tokens economizados')
    return _cache.get(key)
  }

  const usePro = PRO_TYPES.has(tipo)
  const model = genai.getGenerativeModel({
    model: usePro ? 'gemini-2.5-pro' : 'gemini-2.5-flash',
    systemInstruction: usePro ? SYSTEM_PRO : SYSTEM_FLASH,
    generationConfig: { responseMimeType: 'application/json' },
  })

  console.log(`[copywriter] tipo=${tipo} → modelo: ${usePro ? 'Pro' : 'Flash'}`)

  const r = await model.generateContent(
    `Autor: ${autor}\nTipo: ${tipo}\nEstratégia: ${JSON.stringify(estrategia)}\nEstrutura: ${JSON.stringify(estrutura)}\nEscreva todas as seções.`
  )

  let raw = r.response.text().trim()
  raw = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '')
  const s = raw.indexOf('{'), e = raw.lastIndexOf('}')
  if (s !== -1 && e !== -1) raw = raw.slice(s, e + 1)
  raw = raw.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')

  let result
  try {
    result = JSON.parse(raw)
  } catch (_) {
    const { jsonrepair } = require('jsonrepair')
    result = JSON.parse(jsonrepair(raw))
  }

  _cache.set(key, result)
  return result
}

module.exports = { run }
