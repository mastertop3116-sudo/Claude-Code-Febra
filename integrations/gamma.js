const BASE = 'https://public-api.gamma.app/v1.0'

function _headers() {
  return { 'X-API-KEY': process.env.GAMMA_API_KEY, 'Content-Type': 'application/json' }
}

async function _fetch(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, { headers: _headers(), ...opts })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`[Gamma] ${res.status} ${path}: ${body}`)
  }
  return res.json()
}

async function criarApresentacao({ titulo, conteudo, numSlides = 10, idioma = 'pt', exportar = 'pptx' }) {
  const inputText = `# ${titulo}\n\n${conteudo}`
  const data = await _fetch('/generations', {
    method: 'POST',
    body: JSON.stringify({
      inputText,
      textMode: 'generate',
      format: 'presentation',
      numCards: numSlides,
      cardSplit: 'auto',
      exportAs: exportar,
      textOptions: { amount: 'detailed', language: idioma, tone: 'professional' },
    }),
  })
  return data.generationId
}

async function aguardarGeracao(generationId, timeoutMs = 180_000) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    const data = await _fetch(`/generations/${generationId}`)
    if (data.status === 'completed') return data
    if (data.status === 'failed') throw new Error('[Gamma] Geração falhou')
    await new Promise(r => setTimeout(r, 5000))
  }
  throw new Error('[Gamma] Timeout após 3 minutos')
}

async function listarTemas() {
  return _fetch('/themes')
}

module.exports = { criarApresentacao, aguardarGeracao, listarTemas }
