const { openaiJson } = require('../integrations/openai')

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

async function run({ estrategia, tipo, num_paginas, num_capitulos }) {
  if (tipo === 'pregacoes') {
    const prompt = `Tipo: pregações prontas\nNúmero de pregações: ${num_capitulos || 6}\nPáginas: ${num_paginas || 20}\nEstratégia: ${JSON.stringify(estrategia)}`
    return JSON.parse(await openaiJson(prompt, SYSTEM_PREGACOES))
  }
  const prompt = `Tipo: ${tipo}\nPáginas: ${num_paginas || 'auto'}\nCapítulos: ${num_capitulos || 'auto'}\nEstratégia: ${JSON.stringify(estrategia)}`
  return JSON.parse(await openaiJson(prompt, SYSTEM))
}

module.exports = { run }
