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
// Retorna { gammaId, gammaUrl, exportUrl, credits }
// Bug corrigido: language era 'pt', mas a API exige 'pt-br'
async function gerarEntregavel(inputText, { formato = 'document', numCards = 10, exportar = 'pdf', themeId } = {}) {
  const payload = {
    inputText,
    textMode: 'preserve',
    format: formato,
    numCards,
    cardSplit: 'auto',
    exportAs: exportar,
    textOptions: { amount: 'detailed', language: 'pt-br', tone: 'professional' },
  }

  // Só inclui themeId se fornecido
  if (themeId) payload.themeId = themeId

  console.log(`[Gamma] Iniciando geração — formato: ${formato}, cards: ${numCards}, exportar: ${exportar}${themeId ? ', tema: ' + themeId : ''}`)

  const data = await _fetch('/generations', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  const generationId = data.generationId
  if (!generationId) throw new Error('[Gamma] Resposta sem generationId: ' + JSON.stringify(data))

  if (data.warnings) console.log(`[Gamma] Avisos da API: ${data.warnings}`)
  console.log(`[Gamma] Geração iniciada — ID: ${generationId}`)

  // Timeout de 120s para aguardar geração (documentos podem demorar mais)
  const start = Date.now()
  while (Date.now() - start < 120_000) {
    const status = await _fetch(`/generations/${generationId}`)

    if (status.status === 'completed') {
      // Log completo para diagnóstico — verificar no Render se exportUrl está presente
      console.log(`[Gamma] Geração concluída — resposta completa: ${JSON.stringify(status)}`)

      // Tentar extrair exportUrl de múltiplos campos possíveis
      let exportUrl = status.exportUrl || status.export_url || status.pdfUrl || status.pdf_url || null

      // Se exportUrl não veio na primeira resposta "completed", o Gamma pode estar
      // ainda gerando o arquivo de exportação de forma assíncrona.
      // Fazemos até 4 GETs adicionais com intervalo de 7s para aguardar o exportUrl.
      if (!exportUrl) {
        console.warn('[Gamma] ⚠️ exportUrl ausente na resposta inicial de completed. Campos: ' + Object.keys(status).join(', '))
        console.log('[Gamma] Aguardando exportUrl (até 4 tentativas × 7s)...')
        for (let retry = 1; retry <= 4 && !exportUrl; retry++) {
          await new Promise(r => setTimeout(r, 7000))
          try {
            const retryStatus = await _fetch(`/generations/${generationId}`)
            exportUrl = retryStatus.exportUrl || retryStatus.export_url || retryStatus.pdfUrl || retryStatus.pdf_url || null
            if (exportUrl) {
              console.log(`[Gamma] ✅ exportUrl obtido na tentativa ${retry}: ${exportUrl}`)
              // Atualiza status com dados mais recentes
              Object.assign(status, retryStatus)
            } else {
              console.log(`[Gamma] Tentativa ${retry}/4 — exportUrl ainda ausente. Campos: ${Object.keys(retryStatus).join(', ')}`)
            }
          } catch (retryErr) {
            console.warn(`[Gamma] Tentativa ${retry}/4 falhou: ${retryErr.message}`)
          }
        }
        if (!exportUrl) {
          console.warn('[Gamma] ⚠️ exportUrl não disponível após 4 tentativas — conta pode não ter permissão de exportação ou formato não suporta export direto. gammaUrl disponível para acesso online.')
        }
      }

      return {
        generationId: status.generationId,
        gammaId:      status.gammaId,
        gammaUrl:     status.gammaUrl,
        exportUrl,
        url:          status.gammaUrl,
        export_url:   exportUrl,
        credits:      status.credits,
        creditsUsed:  status.credits?.deducted,
      }
    }

    if (status.status === 'failed') {
      throw new Error(`[Gamma] Geração falhou — ID: ${generationId}`)
    }

    console.log(`[Gamma] Status: ${status.status} — aguardando...`)
    await new Promise(r => setTimeout(r, 5000))
  }

  throw new Error('[Gamma] Timeout após 120 segundos aguardando geração')
}

// Endpoint /api/gamma — cria apresentação a partir de título + conteúdo livre
async function criarApresentacao({ titulo, conteudo, numSlides = 10, exportar = 'pptx', themeId }) {
  return gerarEntregavel(`# ${titulo}\n\n${conteudo}`, { formato: 'presentation', numCards: numSlides, exportar, themeId })
}

// Lista temas disponíveis — retorna objeto com { data: [...], hasMore, nextCursor }
// A resposta da API é { data: [...] }, NÃO um array direto
async function listarTemas() {
  return _fetch('/themes')
}

// Retorna lista formatada de temas para uso no frontend
// [ { id, nome, tipo, preview_url, cores, palavrasChave } ]
async function listarTemasFormatados() {
  const resp = await _fetch('/themes')
  const temas = resp.data || []

  return temas
    .filter(t => t.type === 'standard') // só temas built-in (não os custom do usuário)
    .map(t => ({
      id:          t.id,
      nome:        t.name,
      tipo:        t.type,
      preview_url: `https://assets.gamma.app/themes/${t.id}/preview.png`,
      cores:       t.colorKeywords || [],
      tom:         t.toneKeywords  || [],
    }))
}

module.exports = { gerarEntregavel, criarApresentacao, listarTemas, listarTemasFormatados }
