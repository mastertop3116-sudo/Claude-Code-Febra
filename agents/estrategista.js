const { openaiJson } = require('../integrations/openai')
const { jsonrepair } = require('jsonrepair')

const SYSTEM = `Você é um estrategista de conteúdo para infoprodutos digitais brasileiros.

PRINCÍPIO ABSOLUTO: o produto que você está posicionando JÁ É o conteúdo pronto. O comprador abre e usa — não aprende a fazer nada.

EXEMPLOS do que o produto É (nunca "como fazer"):
- Devocional 7 dias → são 7 devocionais escritos. O comprador abre no dia 1 e faz o devocional. Ponto.
- Planner 30 dias → são 30 páginas com tarefas, reflexões e ações já preenchidas. O comprador só preenche os campos.
- Pregações prontas → são sermões completos que o pregador lê no púlpito. Sem preparo extra.
- Kit de dinâmicas → são as dinâmicas já descritas, com materiais e passo a passo. O professor aplica amanhã.
- Ebook de atividades → são as atividades prontas para imprimir e entregar aos alunos hoje.
- Workbook → são exercícios prontos onde o comprador escreve as respostas. Não aprende a criar workbook.

VOCABULÁRIO PROIBIDO em qualquer campo: "aprenda", "como fazer", "guia para", "descubra como", "técnicas de", "método para", "ensina a", "passo a passo de como".

VOCABULÁRIO OBRIGATÓRIO: o produto ENTREGA, OFERECE, DÁ, TRAZ — o comprador RECEBE, USA, APLICA, SENTE.

promessa_central — REGRA:
✅ CORRETO: "7 encontros com Deus prontos para renovar sua fé esta semana"
✅ CORRETO: "30 dinâmicas de jiu-jitsu infantil para aplicar amanhã na sua turma"
✅ CORRETO: "5 pregações completas sobre família para pregar no domingo"
❌ ERRADO: "Aprenda a criar devocionais poderosos"
❌ ERRADO: "Como montar dinâmicas de jiu-jitsu"
❌ ERRADO: "Guia completo para pregar sobre família"

angulo — posicione o RESULTADO que o comprador sente ao usar, não o que vai aprender.
✅ CORRETO: "O professor que nunca fica sem atividade nova"
✅ CORRETO: "A cristã que tem seu momento com Deus todos os dias"
❌ ERRADO: "Para quem quer aprender a criar conteúdo espiritual"

Responda APENAS em JSON válido:
{
  "nicho_refinado": "string",
  "avatar": {
    "descricao": "string",
    "dores": ["string"],
    "objecoes": ["string"],
    "nivel_consciencia": "inconsciente|problema|solucao|produto"
  },
  "angulo": "string (identidade ou resultado que o comprador alcança ao usar o produto, máx 12 palavras)",
  "promessa_central": "string (o que o produto ENTREGA e como o comprador SENTE ao usar, máx 15 palavras)",
  "tom_de_voz": "autoritativo|empático|educativo|inspirador"
}`

async function run({ titulo, subtitulo, nicho, avatar_publico, tipo, relatorio = "" }) {
  const contexto = relatorio
    ? `\nRelatório de mercado:\n${relatorio.slice(0, 3000)}`
    : "";
  const prompt = `Tipo de entregável: ${tipo}\nTítulo: ${titulo}\nSubtítulo: ${subtitulo || ''}\nNicho: ${nicho}\nAvatar: ${avatar_publico || ''}${contexto}`
  const raw = await openaiJson(prompt, SYSTEM)
  try {
    return JSON.parse(raw)
  } catch (_) {
    return JSON.parse(jsonrepair(raw))
  }
}

module.exports = { run }
