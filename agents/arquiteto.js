const { openaiJson } = require('../integrations/openai')
const { jsonrepair } = require('jsonrepair')

const SYSTEM = `Você é um arquiteto de conteúdo para entregáveis digitais.
Recebe estratégia e tipo. Responda APENAS em JSON válido:
{
  "indice": [{ "numero": 1, "titulo": "string", "objetivo": "string", "tipo_pagina": "capitulo|exercicio|checklist|reflexao" }],
  "framework_transformacao": "string",
  "cta_principal": "string"
}`

const SYSTEM_PREGACOES = `Você é um arquiteto de conteúdo para packs de pregações cristãs brasileiras.
Crie um índice onde CADA item é UMA PREGAÇÃO COMPLETA E PRONTA PARA USAR — não um tópico sobre pregação.
Cada capítulo no índice é uma pregação diferente com título, texto bíblico e faixa etária indicada.
Responda APENAS em JSON válido:
{
  "indice": [{
    "numero": 1,
    "titulo": "Nome da pregação (ex: A Fé que Move Montanhas)",
    "objetivo": "Texto: [Versículo principal] · Faixa: [crianças 4-10 / adolescentes 11-14 / jovens 15-25 / adultos]",
    "tipo_pagina": "pregacao"
  }],
  "framework_transformacao": "string",
  "cta_principal": "string"
}`

function _parse(raw) {
  try {
    return JSON.parse(raw)
  } catch (_) {
    return JSON.parse(jsonrepair(raw))
  }
}

// Limite global: Gamma AI suporta max 12 cards → max 10 capítulos de conteúdo
const GAMMA_MAX_CAPS = 10

async function run({ estrategia, tipo, num_paginas, num_capitulos }) {
  if (tipo === 'pregacoes') {
    const numPrg = Math.min(num_capitulos || 6, GAMMA_MAX_CAPS)
    const prompt = `Tipo: pregações prontas\nNúmero de pregações: ${numPrg}\nPáginas: ${Math.min(parseInt(num_paginas) || 20, 20)}\nEstratégia: ${JSON.stringify(estrategia)}`
    return _parse(await openaiJson(prompt, SYSTEM_PREGACOES))
  }
  // Server-side cap: max 20 páginas alinhado ao Gamma
  const pags = Math.min(parseInt(num_paginas) || 15, 20)
  // Cada capítulo ≈ 2 páginas; cap em GAMMA_MAX_CAPS
  const capsCalc = num_capitulos
    ? Math.min(parseInt(num_capitulos), GAMMA_MAX_CAPS)
    : Math.min(Math.max(3, Math.round(pags / 2)), GAMMA_MAX_CAPS)
  const prompt = `Tipo: ${tipo}\nPáginas solicitadas: ${pags}\nNúmero EXATO de capítulos: ${capsCalc}\nGere EXATAMENTE ${capsCalc} entradas no índice — nem mais, nem menos.\nEstratégia: ${JSON.stringify(estrategia)}`
  return _parse(await openaiJson(prompt, SYSTEM))
}

module.exports = { run }
