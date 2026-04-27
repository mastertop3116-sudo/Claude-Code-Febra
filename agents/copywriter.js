const { GoogleGenerativeAI } = require('@google/generative-ai')
const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

const SYSTEM = `Copywriter especialista em infoprodutos brasileiros. Frameworks: AIDA, PAS, StoryBrand.
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
- Parágrafos separados por linha em branco (\\n\\n)

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

async function run({ estrategia, estrutura, autor, tipo }) {
  const model = genai.getGenerativeModel({
    model: 'gemini-2.5-pro',
    systemInstruction: SYSTEM,
    generationConfig: { responseMimeType: 'application/json' },
  })
  const r = await model.generateContent(`Autor: ${autor}\nTipo: ${tipo}\nEstratégia: ${JSON.stringify(estrategia)}\nEstrutura: ${JSON.stringify(estrutura)}\nEscreva todas as seções.`)
  return JSON.parse(r.response.text().trim())
}

module.exports = { run }
