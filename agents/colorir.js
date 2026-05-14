const { openaiJson } = require('../integrations/openai')
const { jsonrepair } = require('jsonrepair')

const SYSTEM = `Você é um especialista em cadernos de colorir infantis brasileiros.
Dado um tema/nicho e um número de páginas, gere a lista de OBJETOS/PERSONAGENS para cada página do caderno.

REGRAS:
- Cada item deve ser um objeto, animal ou personagem simples e reconhecível por crianças de 4-8 anos
- Varie entre: animais, objetos do dia a dia, natureza, veículos, alimentos, personagens temáticos
- Adapte ao tema/nicho fornecido (ex: tema esportivo → bola, troféu, tênis; tema natureza → borboleta, flor, árvore)
- Cada item tem: nome_pt (português, ex: "Cachorrinho"), nome_instrucao (frase curta, ex: "Pinte o cachorrinho!"), prompt_en (para DALL-E, em inglês, simples e descritivo)

FORMATO DO PROMPT_EN: "[animal/object], simple coloring book page, thick black outline, white background" — máx 15 palavras.

Responda APENAS em JSON:
{
  "titulo_capa": "string (título do caderno, máx 8 palavras)",
  "subtitulo_capa": "string (subtítulo motivador, máx 10 palavras)",
  "paginas": [
    {
      "numero": 1,
      "nome_pt": "Cachorrinho",
      "instrucao": "Pinte o cachorrinho e escreva o nome!",
      "prompt_en": "cute puppy dog, simple coloring book page, thick black outline, white background"
    }
  ]
}`

async function run({ titulo, nicho, publico, num_paginas = 10 }) {
  const maxPaginas = Math.min(parseInt(num_paginas) || 10, 12)
  const prompt = `Tema: ${nicho || titulo}\nPúblico: ${publico || 'crianças de 4 a 8 anos'}\nNúmero de páginas (objetos): ${maxPaginas}`
  const raw = await openaiJson(prompt, SYSTEM)
  try {
    const result = JSON.parse(raw)
    if (result.paginas?.length > maxPaginas) result.paginas = result.paginas.slice(0, maxPaginas)
    return result
  } catch (_) {
    return JSON.parse(jsonrepair(raw))
  }
}

module.exports = { run }
