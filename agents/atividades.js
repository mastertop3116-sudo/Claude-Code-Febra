// ============================================
// NEXUS — Agente de Atividades Educacionais
// Gera atividades desplugadas, planos de aula
// e kits de dinâmicas para educação básica
// ============================================

const { geminiJson, geminiFlash } = require('../integrations/gemini')
const { jsonrepair } = require('jsonrepair')

const SYSTEM_ATIVIDADE = `Você é pedagogo especialista em Pensamento Computacional e educação básica brasileira.
Crie atividades desplugadas (sem computador) alinhadas à BNCC, com linguagem lúdica e prática para professores.
Cada atividade deve ser CONCRETA e aplicável em sala de aula imediatamente.

Responda APENAS em JSON válido:
{
  "titulo": "título do kit",
  "atividades": [{
    "numero": 1,
    "titulo": "nome da atividade",
    "objetivo": "o que o aluno aprende de concreto",
    "ano_escolar": "1o ano",
    "bncc": "EF01MA04 — Identificacao de padroes",
    "duracao": "45 min",
    "materiais": ["item 1", "item 2", "item 3"],
    "passos": ["Distribuir os materiais para cada aluno", "Pedir que identifiquem um padrao", "Cada aluno completa a sequencia"],
    "campos_resposta": ["O que voce observou?", "Desenhe ou escreva sua resposta:"],
    "dica_professor": "orientacao pratica para o professor"
  }]
}`

const SYSTEM_PLANO = `Você é pedagogo especialista em elaborar planos de aula para educação básica brasileira.
Crie planos detalhados, prontos para usar, alinhados à BNCC.
Cada aula deve ter uma sequência didática clara: sensibilização, desenvolvimento e encerramento.

Responda APENAS em JSON válido:
{
  "titulo": "titulo do conjunto de planos",
  "aulas": [{
    "numero": 1,
    "titulo": "titulo da aula",
    "ano_escolar": "1o ano",
    "disciplina": "nome da disciplina",
    "bncc": ["EF01CO01", "EF01CO02"],
    "duracao": "50 min",
    "objetivo_geral": "objetivo principal da aula",
    "objetivos_especificos": ["objetivo 1", "objetivo 2"],
    "materiais": ["item 1", "item 2"],
    "introducao": "como iniciar a aula com sensibilizacao (10 min)",
    "desenvolvimento": "atividades principais e condução (30 min)",
    "encerramento": "fechamento e avaliacao informal (10 min)",
    "avaliacao": "criterios de avaliacao formal",
    "dica": "dica extra para o professor"
  }]
}`

const SYSTEM_DINAMICA = `Você é educador especialista em dinâmicas pedagógicas lúdicas para educação básica.
Crie dinâmicas interativas, jogos e atividades em grupo para a sala de aula.
Cada dinâmica deve ser energizante, inclusiva e fácil de conduzir.

Responda APENAS em JSON válido:
{
  "titulo": "titulo do kit",
  "atividades": [{
    "numero": 1,
    "titulo": "nome da dinamica",
    "objetivo": "o que a dinamica desenvolve nos alunos",
    "ano_escolar": "1o ao 5o ano",
    "bncc": "competencia relacionada",
    "duracao": "30 min",
    "materiais": ["item 1", "item 2"],
    "passos": ["Como conduzir — passo 1", "Passo 2 detalhado", "Passo 3 de encerramento"],
    "campos_resposta": ["Reflexao pos-atividade para o aluno escrever"],
    "dica_professor": "como adaptar para diferentes turmas e tamanhos"
  }]
}`

function _parse(raw) {
  const cleaned = raw.trim().replace(/^```json?\s*/i, '').replace(/\s*```$/, '')
  try { return JSON.parse(cleaned) }
  catch { return JSON.parse(jsonrepair(cleaned)) }
}

async function run({ tipo, titulo, tema, publico, num_atividades, ano_escolar }) {
  const num = Math.min(num_atividades || 5, 10)
  const isPlano = tipo === 'plano_de_aula'

  const prompt = `Tema/nicho: ${tema || titulo}
Publico-alvo: ${publico || 'professores de educacao basica'}
Ano escolar alvo: ${ano_escolar || '1o ao 5o ano do Ensino Fundamental'}
Numero de ${isPlano ? 'aulas' : 'atividades'}: ${num}
Idioma: portugues brasileiro
Tom: acessivel, ludico, pratico para professores`

  const system = tipo === 'plano_de_aula' ? SYSTEM_PLANO
    : tipo === 'kit_dinamicas' ? SYSTEM_DINAMICA
    : SYSTEM_ATIVIDADE

  let raw
  try {
    raw = await geminiJson(prompt, system)
  } catch (_) {
    raw = await geminiFlash(prompt + '\n\nResponda em JSON valido conforme a estrutura definida.')
  }
  return _parse(raw)
}

module.exports = { run }
