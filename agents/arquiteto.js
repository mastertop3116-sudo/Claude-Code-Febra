const { openaiJson } = require('../integrations/openai')

const SYSTEM = `Você é um arquiteto de conteúdo para entregáveis digitais.
Recebe estratégia e tipo. Responda APENAS em JSON válido:
{
  "indice": [{ "numero": 1, "titulo": "string", "objetivo": "string", "tipo_pagina": "capitulo|exercicio|checklist|reflexao" }],
  "framework_transformacao": "string",
  "cta_principal": "string"
}`

async function run({ estrategia, tipo, num_paginas, num_capitulos }) {
  const prompt = `Tipo: ${tipo}\nPáginas: ${num_paginas || 'auto'}\nCapítulos: ${num_capitulos || 'auto'}\nEstratégia: ${JSON.stringify(estrategia)}`
  return JSON.parse(await openaiJson(prompt, SYSTEM))
}

module.exports = { run }
