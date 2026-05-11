// ============================================
// NEXUS — Agente Forge Chat Universal
// Coleta contexto via conversa e monta payload
// para qualquer tipo de entregável do Forge
// ============================================

const { openaiJson } = require('../integrations/openai')
const { jsonrepair }  = require('jsonrepair')

const TIPOS_VALIDOS = {
  ebook:       { label: 'Ebook / Guia Completo',             paginas: 15 },
  workbook:    { label: 'Workbook / Caderno de Exercícios',  paginas: 30 },
  checklist:   { label: 'Checklist',                         paginas: 8  },
  planner:     { label: 'Planner / Organizador',             paginas: 30 },
  cheat_sheet: { label: 'Guia de Consulta Rápida',           paginas: 8  },
  pregacoes:   { label: 'Pack de Pregações Prontas',         paginas: 15 },
  devocional:  { label: 'Devocional Diário',                 paginas: 7  },
  script_vsl:  { label: 'Script de Vendas (narração em áudio)', paginas: null },
}

const SYSTEM_COLLECT = `Você é o MAX, especialista em criação de infoprodutos digitais brasileiros da Nexus.
Sua missão: coletar o contexto mínimo necessário para criar o entregável e GERAR IMEDIATAMENTE quando tiver o suficiente.

REGRA #1 — GERAÇÃO IMEDIATA:
Se na PRIMEIRA mensagem o usuário já forneceu (mesmo que de forma implícita) tema + tipo + público-alvo, você DEVE marcar pronto=true IMEDIATAMENTE sem fazer nenhuma pergunta adicional. Deduza título, transformação e outros campos a partir do contexto fornecido. Não peça confirmação — gere.

REGRA #2 — UMA PERGUNTA POR VEZ:
Se faltarem informações essenciais, faça UMA única pergunta por resposta. Nunca liste várias perguntas de uma vez.

REGRA #3 — MÍNIMO NECESSÁRIO:
Tema + tipo + público = suficiente para gerar. Título, transformação e páginas são opcionais — o MAX decide sozinho se não forem mencionados.

REGRA #4 — NÃO REPITA O QUE JÁ FOI DITO:
Leia todo o histórico da conversa antes de perguntar. Se já foi respondido, não pergunte de novo.

TIPOS DISPONÍVEIS: ebook, workbook, checklist, planner, cheat_sheet, pregacoes, devocional, script_vsl
- Para script_vsl: colete também preço e prova social se não mencionados

TOM: parceiro estratégico, direto, confiante — celebre brevemente o que o usuário trouxe e siga em frente.

RESPONDA SEMPRE EM JSON — nunca em texto puro:

Se precisar de mais contexto:
{ "pronto": false, "resposta": "sua mensagem aqui" }

Se tiver contexto suficiente:
{
  "pronto": true,
  "resposta": "Perfeito! Tenho tudo que preciso. Montando seu [tipo]...",
  "contexto": {
    "tipo": "ebook|workbook|checklist|planner|cheat_sheet|pregacoes|devocional|script_vsl",
    "titulo": "título sugerido ou fornecido",
    "subtitulo": "subtítulo complementar",
    "tema": "nicho/tema do produto",
    "publico": "descrição do público-alvo",
    "dor": "dor principal que o produto resolve",
    "transformacao": "o que muda na vida de quem usa",
    "paginas": 15,
    "autor": "nome do autor se mencionado, senão vazio",
    "preco": "preço se mencionado, senão vazio",
    "prova_social": "depoimentos/resultados se mencionado, senão vazio"
  }
}`

function _parseJson(raw) {
  const cleaned = raw.trim().replace(/^```json?\s*/i, '').replace(/\s*```$/, '')
  try { return JSON.parse(cleaned) }
  catch { return JSON.parse(jsonrepair(cleaned)) }
}

// messages: [{ role: 'user'|'assistant', content: string }]
async function collectContext(messages) {
  const transcript = messages
    .map(m => `${m.role === 'user' ? 'Usuário' : 'MAX'}: ${m.content}`)
    .join('\n')

  const raw = await openaiJson(transcript, SYSTEM_COLLECT)
  return _parseJson(raw)
}

// Normaliza contexto coletado para o payload de geração do Forge
function buildPayload(contexto) {
  const tipoInfo = TIPOS_VALIDOS[contexto.tipo] || TIPOS_VALIDOS.ebook
  return {
    tipo:       contexto.tipo      || 'ebook',
    titulo:     contexto.titulo    || 'Sem título',
    subtitulo:  contexto.subtitulo || '',
    tema:       contexto.tema      || '',
    publico:    contexto.publico   || '',
    dor:        contexto.dor       || '',
    transformacao: contexto.transformacao || '',
    paginas:    contexto.paginas   || tipoInfo.paginas || 15,
    autor:      contexto.autor     || '',
    preco:      contexto.preco     || '',
    prova_social: contexto.prova_social || '',
  }
}

module.exports = { collectContext, buildPayload, TIPOS_VALIDOS }
