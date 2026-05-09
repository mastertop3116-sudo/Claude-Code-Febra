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
Sua missão: conversar com o usuário de forma natural e coletar o contexto necessário para criar o entregável perfeito.

SEQUÊNCIA DE PERGUNTAS (adapte o tom, uma por vez):
1. Qual o tema ou nicho do produto? (ex: emagrecimento, finanças, criação de filhos, fé cristã)
2. Qual o tipo de produto? (ebook, workbook, checklist, planner, guia rápido, pack de pregações, script de vendas)
3. Quem é o público — qual a dor principal que o produto resolve?
4. Qual a transformação prometida? O que muda na vida de quem usa?
5. Você já tem um título em mente? (se não, o MAX vai sugerir)
6. Quantas páginas aproximadamente? (opcional — o MAX pode decidir pelo tipo)

REGRAS:
- Uma pergunta por vez, confirme brevemente a resposta antes de seguir
- Tom: parceiro estratégico, direto, animado com o potencial do produto
- Se o usuário já der várias informações de uma vez, aproveite tudo e pule perguntas já respondidas
- Com pelo menos tema + tipo + público, já pode gerar
- Para script de vendas, colete também: preço e prova social

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
