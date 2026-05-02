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

// Gera um entregável (documento ou apresentação) e aguarda o resultado
// Retorna { gammaUrl, exportUrl, creditsUsed }
async function gerarEntregavel(inputText, { formato = 'document', numCards = 10, exportar = 'pdf' } = {}) {
  const { generationId } = await _fetch('/generations', {
    method: 'POST',
    body: JSON.stringify({
      inputText,
      textMode: 'preserve',
      format: formato,
      numCards,
      cardSplit: 'auto',
      exportAs: exportar,
      textOptions: { amount: 'detailed', language: 'pt', tone: 'professional' },
    }),
  })

  // Timeout de 60s: falhar rápido para ativar o fallback PDFKit no deliverable_generator
  const start = Date.now()
  while (Date.now() - start < 60_000) {
    const data = await _fetch(`/generations/${generationId}`)
    if (data.status === 'completed') return data
    if (data.status === 'failed') throw new Error('[Gamma] Geração falhou')
    await new Promise(r => setTimeout(r, 5000))
  }
  throw new Error('[Gamma] Timeout após 60 segundos — usando fallback PDFKit')
}

// Endpoint /api/gamma — cria apresentação a partir de título + conteúdo livre
async function criarApresentacao({ titulo, conteudo, numSlides = 10, exportar = 'pptx' }) {
  return gerarEntregavel(`# ${titulo}\n\n${conteudo}`, { formato: 'presentation', numCards: numSlides, exportar })
}

async function listarTemas() {
  return _fetch('/themes')
}

module.exports = { gerarEntregavel, criarApresentacao, listarTemas }
