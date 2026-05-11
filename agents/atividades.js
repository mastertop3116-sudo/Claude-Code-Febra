// ============================================
// NEXUS — Agente de Atividades Educacionais
// Gera atividades desplugadas, planos de aula
// e kits de dinâmicas para educação básica
// ============================================

const { geminiFlash } = require('../integrations/gemini')
const { jsonrepair } = require('jsonrepair')

const SYSTEM_ATIVIDADE = `Voce e pedagogo especialista em Pensamento Computacional e educacao basica brasileira.
Crie atividades desplugadas (sem computador) alinhadas a BNCC, com linguagem ludica e pratica para professores.
Cada atividade deve ser CONCRETA e aplicavel em sala de aula imediatamente.

Para o campo tipo_visual escolha UM dos seguintes com base no conteudo da atividade:
- labirinto: atividades de caminho, navegacao, algoritmo de rotas
- sequencia: atividades de ordenar etapas, algoritmos passo a passo
- padrao: atividades de reconhecimento de padrao, repeticao, sequencias visuais
- cifra: atividades de codigo secreto, substituicao de simbolos, criptografia
- ordenar: atividades de classificacao, ordenacao de numeros ou objetos

Responda APENAS em JSON valido sem caracteres especiais nos valores de string:
{
  "titulo": "titulo do kit",
  "atividades": [{
    "numero": 1,
    "titulo": "nome da atividade",
    "objetivo": "o que o aluno aprende de concreto",
    "ano_escolar": "1o ano",
    "bncc": "EF01MA04",
    "duracao": "45 min",
    "materiais": ["item 1", "item 2", "item 3"],
    "passos": ["Passo 1 descricao clara", "Passo 2 descricao clara", "Passo 3 descricao clara"],
    "tipo_visual": "labirinto",
    "instrucao_visual": "instrucao curta do que o aluno deve fazer com o elemento visual",
    "dica_professor": "orientacao pratica para o professor"
  }]
}`

const SYSTEM_PLANO = `Voce e pedagogo especialista em elaborar planos de aula para educacao basica brasileira.
Crie planos detalhados, prontos para usar, alinhados a BNCC.
Cada aula deve ter uma sequencia didatica clara: sensibilizacao, desenvolvimento e encerramento.

Responda APENAS em JSON valido:
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
    "introducao": "como iniciar a aula com sensibilizacao 10 min",
    "desenvolvimento": "atividades principais e conducao 30 min",
    "encerramento": "fechamento e avaliacao informal 10 min",
    "avaliacao": "criterios de avaliacao formal",
    "dica": "dica extra para o professor"
  }]
}`

const SYSTEM_DINAMICA = `Voce e educador especialista em dinamicas pedagogicas ludicas para educacao basica.
Crie dinamicas interativas, jogos e atividades em grupo para a sala de aula.
Cada dinamica deve ser energizante, inclusiva e facil de conduzir.

Para o campo tipo_visual escolha UM dos seguintes:
- sequencia: dinamicas de ordenar, passos de jogo
- padrao: dinamicas de reconhecimento visual, padroes de movimentos
- ordenar: dinamicas de classificacao em grupos
- labirinto: dinamicas de navegacao, percursos
- cifra: dinamicas com codigos, mensagens secretas

Responda APENAS em JSON valido:
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
    "passos": ["Como conduzir passo 1", "Passo 2 detalhado", "Passo 3 encerramento"],
    "tipo_visual": "sequencia",
    "instrucao_visual": "instrucao do que o aluno faz com o visual",
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
Tom: acessivel, ludico, pratico para professores
IMPORTANTE: preencha TODOS os campos do JSON incluindo tipo_visual e instrucao_visual`

  const system = tipo === 'plano_de_aula' ? SYSTEM_PLANO
    : tipo === 'kit_dinamicas' ? SYSTEM_DINAMICA
    : SYSTEM_ATIVIDADE

  let raw
  try {
    raw = await geminiFlash(prompt, system)
  } catch (_) {
    raw = await geminiFlash(prompt + '\n\nResponda em JSON valido com todos os campos incluindo tipo_visual.')
  }
  return _parse(raw)
}

module.exports = { run }
