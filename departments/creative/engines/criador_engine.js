// ============================================================
// MAX Criador Engine
// Fluxo: params → conteúdo GPT-4o → PDF Puppeteer → resultado
// ============================================================

'use strict';

const path          = require('path');
const fs            = require('fs');
const OpenAI        = require('openai');
const aprendizados  = require('../../../utils/aprendizados');

const TEMPLATE_PATH = path.join(__dirname, '../templates/criador-universal/index.html');

// ── Paletas por NICHO (sobrepõe paleta por tipo) ────────────
const PALETAS_NICHO = [
  { palavras: ['emagrecimento','dieta','saúde','saudável','treino','fitness','academia','nutrição','peso','corpo'], primaria: '#10b981', secundaria: '#34d399', bg: '#051a10' },
  { palavras: ['finanças','financeiro','dinheiro','renda','investimento','lucro','mei','empreendedor','negócio','vender','vendas','marketing'], primaria: '#f59e0b', secundaria: '#fcd34d', bg: '#181000' },
  { palavras: ['beleza','cabelo','maquiagem','pele','estética','unhas','moda','skincare'], primaria: '#ec4899', secundaria: '#f9a8d4', bg: '#180710' },
  { palavras: ['espiritualidade','fé','bíblia','deus','oração','devocional','cristão','cristã','missão'], primaria: '#d97706', secundaria: '#fbbf24', bg: '#181000' },
  { palavras: ['fotografia','foto','câmera','imagem','vídeo','edição','design','criativo','arte','instagram'], primaria: '#a855f7', secundaria: '#d8b4fe', bg: '#0f0718' },
  { palavras: ['educação','professor','escola','bncc','criança','pedagogia','infantil','aula','plano'], primaria: '#3b82f6', secundaria: '#93c5fd', bg: '#070f18' },
  { palavras: ['jiu','luta','esporte','marcial','treino','atleta','competição'], primaria: '#ef4444', secundaria: '#fca5a5', bg: '#180707' },
  { palavras: ['confeitaria','bolo','doce','culinária','gastronomia','receita','cozinha','buffet'], primaria: '#f472b6', secundaria: '#fbcfe8', bg: '#180810' },
  { palavras: ['relacionamento','amor','namoro','casamento','autoestima','ansiedade','mental','psicologia'], primaria: '#8b5cf6', secundaria: '#c4b5fd', bg: '#0d0718' },
  { palavras: ['pet','cachorro','gato','animal','veterinário','adestramento'], primaria: '#22d3a5', secundaria: '#5eead4', bg: '#051812' },
];

function detectarPaletaNicho(nicho) {
  const n = (nicho || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  for (const p of PALETAS_NICHO) {
    if (p.palavras.some(w => n.includes(w.normalize('NFD').replace(/[̀-ͯ]/g, '')))) {
      return { primaria: p.primaria, secundaria: p.secundaria, bg: p.bg };
    }
  }
  return null; // sem match — usa paleta por tipo
}

// ── Paletas padrão por tipo ──────────────────────────────────
const CORES = {
  ebook:      { primaria: '#6366f1', secundaria: '#818cf8', bg: '#0f0e1f' },
  workbook:   { primaria: '#10b981', secundaria: '#34d399', bg: '#071810' },
  guia:       { primaria: '#f59e0b', secundaria: '#fcd34d', bg: '#180f00' },
  checklist:  { primaria: '#22d3a5', secundaria: '#5eead4', bg: '#071812' },
  desafio:    { primaria: '#ef4444', secundaria: '#fca5a5', bg: '#180707' },
  planner:    { primaria: '#a855f7', secundaria: '#d8b4fe', bg: '#0f0718' },
  devocional: { primaria: '#d97706', secundaria: '#fbbf24', bg: '#181000' },
  script_vsl: { primaria: '#3b82f6', secundaria: '#93c5fd', bg: '#070f18' },
};

const LABELS = {
  ebook:      'E-book',
  workbook:   'Workbook',
  guia:       'Guia',
  checklist:  'Checklist',
  desafio:    'Desafio',
  planner:    'Planner',
  devocional: 'Devocional',
  script_vsl: 'Script VSL',
};

// ── Schemas JSON por tipo ───────────────────────────────────
function getPromptSchema(tipo, extensao) {
  const qtd = extensao === 'longo' ? '10 a 12' : extensao === 'medio' ? '7 a 9' : '5 a 6';
  const wpp  = extensao === 'longo' ? '800 a 1000' : extensao === 'medio' ? '600 a 800' : '400 a 550';

  const schemas = {
    ebook: `Retorne JSON com exatamente esta estrutura:
{
  "titulo": "título poderoso e específico (máx 12 palavras, sem ponto final)",
  "subtitulo": "subtítulo que reforça o benefício principal (máx 20 palavras)",
  "autor": "nome do autor",
  "introducao": "introdução em 1ª pessoa — comece com 'Quando eu...' ou 'Eu lembro de...' — conte por que o autor criou este material, inclua 1 situação concreta com número ou resultado (150 a 200 palavras)",
  "capitulos": [
    {
      "numero": 1,
      "titulo": "título do capítulo — direto, sem rodeios",
      "conteudo": "texto completo (${wpp} palavras) — ESTRUTURA OBRIGATÓRIA: (1) PROBLEMA: abra com uma dor real e específica do nicho; (2) HISTÓRIA: 'Eu vi isso acontecer com [Nome], [idade] anos, [contexto] — ela/ele [situação concreta com número]'; (3) SOLUÇÃO: o que realmente funciona, com passo específico; (4) AÇÃO: 'Sua tarefa agora: [verbo imperativo] [número] [coisa concreta] em [prazo]'. PROIBIDO: 'você pode', 'é possível', 'considere', 'pense em', 'busque', 'talvez'.",
      "pontos_chave": ["ponto direto e específico ao nicho — começa com verbo ou número", "idem", "idem"],
      "citacao": "frase de impacto em 1ª pessoa do autor — algo que ele diria (máx 20 palavras)"
    }
  ],
  "conclusao": "conclusão em 1ª pessoa — o que o autor quer que o leitor faça HOJE, com 1 ação concreta e numerada (100 a 150 palavras)",
  "cta": "chamada para ação direta e específica — diz exatamente o que fazer agora (máx 50 palavras)"
}
OBRIGATÓRIO: gere de ${qtd} capítulos completos`,

    workbook: `Retorne JSON com exatamente esta estrutura:
{
  "titulo": "título do workbook (máx 12 palavras)",
  "subtitulo": "resultado concreto e mensurável que o leitor terá ao completar",
  "autor": "nome do autor",
  "introducao": "em 1ª pessoa — conte como o autor descobriu que precisava criar este workbook, inclua 1 resultado real ou estimado ('Quem aplica esse método em 30 dias costuma...') (100 a 150 palavras)",
  "modulos": [
    {
      "numero": 1,
      "titulo": "nome do módulo",
      "objetivo": "o que o leitor será capaz de fazer — começa com verbo de ação forte (ex: Calcular, Eliminar, Criar, Mapear)",
      "teoria": "em 1ª pessoa (200 a 300 palavras) — comece com 'Quando eu comecei a trabalhar com isso...' ou 'Uma vez, acompanhei [Nome], [perfil] que...'; mostre o problema, a descoberta e a solução com número ou prazo concreto; termine com: 'Então aqui está o que funciona de verdade:'",
      "exercicios": [
        {
          "titulo": "nome curto do exercício — verbo + objeto específico do nicho",
          "instrucao": "tarefa específica que só faz sentido para quem está neste nicho — use pergunta direta com número: 'Liste EXATAMENTE [N] [coisa do nicho] que você [situação]. Para cada um, escreva [o quê].' (2 a 3 frases)",
          "linhas": 6
        }
      ]
    }
  ],
  "reflexao_final": "em 1ª pessoa — o autor faz uma pergunta direta ao leitor e pede 1 compromisso com prazo específico (80 a 120 palavras)"
}
OBRIGATÓRIO: gere de ${qtd} módulos, cada um com 2 a 3 exercícios`,

    guia: `Retorne JSON com exatamente esta estrutura:
{
  "titulo": "título do guia passo a passo (máx 12 palavras)",
  "subtitulo": "promessa central — resultado esperado em [prazo]",
  "autor": "nome do autor",
  "introducao": "em 1ª pessoa — por que o autor criou este guia, 1 caso concreto de quem aplicou ('Um aluno meu, [Nome], fez isso em [tempo] e conseguiu [resultado com número]') (120 a 180 palavras)",
  "passos": [
    {
      "numero": 1,
      "titulo": "nome do passo — verbo imperativo + o quê",
      "descricao": "em 1ª pessoa (300 a 500 palavras) — ESTRUTURA: 'A maioria das pessoas erra aqui porque [erro específico].' → 'Eu mesmo errei isso quando...' → 'O que realmente funciona é [solução com detalhe]' → 'Na prática, [Nome real ou fictício plausível] fez assim: [situação concreta]' → termine com: 'Sua tarefa neste passo: [ação + número + prazo]'",
      "acoes": ["ação concreta com verbo imperativo + número ou critério de conclusão", "idem", "idem"],
      "dica": "dica do autor em 1ª pessoa: 'Quando eu faço isso, presto atenção em [detalhe específico]...' ou 'O erro que eu via todo mundo cometendo era...'"
    }
  ],
  "conclusao": "em 1ª pessoa — o autor diz exatamente o que o leitor deve fazer nas próximas 24h (80 a 120 palavras)"
}
OBRIGATÓRIO: gere de ${qtd} passos detalhados`,

    checklist: `Retorne JSON com exatamente esta estrutura:
{
  "titulo": "título do checklist (máx 12 palavras)",
  "subtitulo": "para quem é e o resultado de usá-lo",
  "autor": "nome do autor",
  "introducao": "em 1ª pessoa — o autor conta a situação que o fez criar este checklist ('Eu criei isso depois de ver [situação específica acontecer X vezes]...') (80 a 120 palavras)",
  "secoes": [
    {
      "titulo": "nome da seção (substantivo + contexto direto)",
      "descricao": "1 frase direta sobre o que esta seção previne ou garante",
      "itens": ["Verbo imperativo + ação específica ao nicho + detalhe concreto (ex: Confirme que o contrato tem multa de X% por rescisão antecipada)"]
    }
  ],
  "dica_final": "em 1ª pessoa — dica do autor sobre como usar o checklist, com 1 situação concreta onde ele salvou alguém (60 a 80 palavras)"
}
OBRIGATÓRIO: gere de 5 a 8 seções, cada uma com 5 a 8 itens
REGRA DOS ITENS: SEMPRE verbo imperativo (Verifique, Confirme, Liste, Calcule, Documente...) + detalhe específico do nicho + critério mensurável quando possível. PROIBIDO: itens genéricos que funcionariam para qualquer nicho`,

    desafio: `Retorne JSON com exatamente esta estrutura:
{
  "titulo": "nome do desafio (máx 12 palavras)",
  "subtitulo": "transformação concreta e mensurável em X dias",
  "autor": "nome do autor",
  "duracao": 21,
  "introducao": "em 1ª pessoa — o autor conta por que criou este desafio, qual transformação ele próprio viveu ou viu ('Eu criei este desafio porque vi [N] pessoas tentando [resultado] e travando em [ponto específico]') — inclua 1 resultado estimado de quem completa (100 a 150 palavras)",
  "semanas": [
    {
      "numero": 1,
      "tema": "tema central da semana — substantivo de ação",
      "descricao": "o que muda nesta semana, em 1ª pessoa — 'Na semana 1, eu quero que você [ação concreta]. A maioria das pessoas pula essa parte e por isso [consequência específica].' (100 a 150 palavras)",
      "dias": [
        {
          "numero": 1,
          "titulo": "nome do dia — verbo + objeto direto",
          "tarefa": "tarefa específica com número ou critério: '[Verbo] [N] [coisa concreta do nicho]. Leva [tempo estimado] e você vai perceber [resultado imediato].' (2 a 3 frases)",
          "afirmacao": "afirmação em 1ª pessoa do participante — começa com 'Eu [verbo presente]...' — específica ao nicho"
        }
      ]
    }
  ],
  "manifesto": "declaração em 1ª pessoa do participante — compromisso específico com prazo e número (60 a 80 palavras)"
}
OBRIGATÓRIO: gere exatamente 3 semanas com 7 dias cada`,

    planner: `Retorne JSON com exatamente esta estrutura:
{
  "titulo": "nome do planner (máx 12 palavras)",
  "subtitulo": "período e resultado concreto ao final",
  "autor": "nome do autor",
  "introducao": "em 1ª pessoa — o autor explica como usa este planner na própria rotina, com 1 hábito concreto e resultado mensurável ('Desde que comecei a usar esse método, eu [resultado específico]') (100 a 150 palavras)",
  "secoes": [
    {
      "titulo": "nome da seção",
      "descricao": "propósito em 1 frase — o que esta seção resolve ou garante",
      "campos": ["campo específico do nicho — não genérico"]
    }
  ],
  "rituais": [
    {
      "tipo": "Ritual Matinal",
      "passos": ["passo com tempo estimado e ação concreta do nicho"]
    }
  ],
  "citacao": "frase do próprio autor em 1ª pessoa — algo que ele diz para seus alunos (não citação famosa)"
}
OBRIGATÓRIO: gere de 5 a 7 seções e 3 rituais (matinal, noturno, semanal). Campos devem ser específicos ao nicho.`,

    devocional: `Retorne JSON com exatamente esta estrutura:
{
  "titulo": "título do devocional (máx 12 palavras)",
  "subtitulo": "tema espiritual central",
  "autor": "nome do autor",
  "prefacio": "em 1ª pessoa — o autor conta o momento de vida que o levou a escrever este devocional, inclui 1 situação concreta ('Eu estava em um período de...') (100 a 150 palavras)",
  "dias": [
    {
      "numero": 1,
      "titulo": "título do dia — direto, provoca curiosidade",
      "versiculo_ref": "Referência bíblica (ex: João 3:16)",
      "versiculo": "texto completo do versículo (versão NVI ou NVT)",
      "reflexao": "em 1ª pessoa (350 a 450 palavras) — ESTRUTURA: comece com 'Eu lembro de um dia em que...' ou 'Quando eu li esse versículo pela primeira vez...'; mostre a luta humana real por trás da passagem; conecte com uma situação cotidiana concreta ('Talvez você também esteja em um daqueles dias que...'); termine com 1 ação prática para o dia — específica e com critério ('Hoje, antes de dormir, escreva [número] coisas que...'). PROIBIDO: 'você pode', 'é possível', 'talvez queira', 'considere'",
      "perguntas": ["pergunta reflexiva que força honestidade — não tem resposta óbvia", "idem"],
      "oracao": "oração em 1ª pessoa do leitor — pessoal, específica ao tema do dia, como se o leitor estivesse realmente orando agora (5 a 8 linhas)"
    }
  ],
  "oracao_final": "oração de encerramento em 1ª pessoa do leitor — menciona a jornada dos 7 dias, específica ao tema (60 a 80 palavras)"
}
OBRIGATÓRIO: gere exatamente 7 dias completos`,

    script_vsl: `Retorne JSON com exatamente esta estrutura:
{
  "titulo": "nome do produto sendo vendido",
  "autor": "nome do apresentador",
  "partes": [
    { "nome": "GANCHO", "duracao_seg": 30, "script": "em 1ª pessoa — comece com declaração ousada baseada em experiência real: 'Eu descobri que [afirmação contraintuitiva específica ao nicho].' ou pergunta que paralisa: '[Situação específica e dolorosa do nicho]? Eu sei exatamente o que você está sentindo.' [olha para a câmera] (100 a 150 palavras)" },
    { "nome": "PROBLEMA", "duracao_seg": 60, "script": "em 1ª pessoa — 'Quando eu comecei no [nicho], eu também [erro/dor específica].' Descreva a dor com detalhes do nicho: números, situações reais, consequências concretas. Tom: empático, quem viveu isso (150 a 200 palavras)" },
    { "nome": "AGITAÇÃO", "duracao_seg": 60, "script": "em 1ª pessoa — 'E o pior é que, enquanto você não resolve isso, [consequência específica acontece].' Mostre o custo concreto de não agir: 'Em [prazo], isso vai custar [número/resultado]. Eu vi isso acontecer com [perfil de pessoa] mais de [N] vezes.' [tom mais grave] (150 a 200 palavras)" },
    { "nome": "SOLUÇÃO", "duracao_seg": 90, "script": "em 1ª pessoa — 'Foi aí que eu desenvolvi [nome do método/produto].' [pausa 2s] Apresente o produto como descoberta pessoal: 'Depois de [N anos/meses] trabalhando com [nicho], eu percebi que o que realmente funciona é...' Tom: revelação, não venda (200 a 250 palavras)" },
    { "nome": "AUTORIDADE", "duracao_seg": 45, "script": "em 1ª pessoa — história pessoal real com números: 'Eu comecei no [nicho] em [situação difícil]. Em [prazo], eu [resultado concreto].' Credenciais naturais: 'Desde então, ajudei mais de [N] pessoas a [resultado].' [gesticula ao mencionar resultados] (100 a 150 palavras)" },
    { "nome": "PROVA SOCIAL", "duracao_seg": 60, "script": "histórias em 1ª pessoa DE CLIENTES — 'A [Nome feminino], [idade], [profissão], me disse: [citação direta com resultado]. Ela foi de [situação antes] para [situação depois] em [prazo].' Repita com 2 perfis diferentes. [⚠️ ATENÇÃO: substitua por depoimentos reais antes de usar] (150 a 200 palavras)" },
    { "nome": "OFERTA", "duracao_seg": 90, "script": "em 1ª pessoa — 'Eu poderia cobrar [SEU_PRECO_ORIGINAL] por isso, porque [justificativa concreta de valor].' Lista bônus com valor unitário. 'Mas hoje, como [razão para desconto], você tem acesso a tudo por apenas [SEU_PRECO_OFERTA].' Garantia clara com prazo. [mostra dedos ao contar bônus] (200 a 250 palavras)" },
    { "nome": "CTA", "duracao_seg": 30, "script": "em 1ª pessoa — urgência real e justificada: 'Eu só consigo atender [N] pessoas nesta turma porque [razão real].' Instrução de ação em 1 passo. Termine: 'Eu te vejo do outro lado.' [aponta para a tela] (80 a 120 palavras)" }
  ]
}
OBRIGATÓRIO: preencha TODAS as 8 partes. Script como fala — frases curtas, pausas marcadas. 1ª pessoa em todos os blocos. PROIBIDO: 'você pode', 'é possível', 'considere', 'talvez'`,
  };

  return schemas[tipo] || schemas.ebook;
}

// ── Geração de conteúdo via GPT-4o ─────────────────────────
async function gerarConteudo(params) {
  const { tipo, nicho, publico, tema, tom, extensao, autor } = params;

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const TONS = {
    profissional:   'formal, com autoridade e linguagem de especialista',
    conversacional: 'direto, próximo, como um amigo especialista falando ao leitor',
    inspirador:     'motivacional, energético, que eleva a autoestima e impulsiona à ação',
    educativo:      'didático, claro, com muitos exemplos e analogias acessíveis',
  };

  const sistema = `Você é ${autor}, criador de infoprodutos digitais premium para o mercado brasileiro.
Escreva na SUA voz — primeira pessoa, histórias reais ou plausíveis, descobertas pessoais.
Tom: ${TONS[tom] || TONS.conversacional}

REGRAS DE OURO (inegociáveis):
• PRIMEIRA PESSOA: "Quando eu comecei...", "Eu aprendi isso do jeito difícil...", "Uma vez, acompanhei a [Nome] que...", "Comigo, a virada aconteceu quando..."
• PERSONAGENS REAIS: exemplos com nome brasileiro, idade, cidade, número concreto. "A Juliana, 28 anos, de BH, saiu de R$ 4.200 de dívida para zero em 6 meses."
• ZERO VAGUEZA: BANIDO como frase principal: "você pode", "é possível", "considere", "pense em", "busque", "talvez" — troque por ações diretas e afirmações concretas
• VARIAÇÃO NARRATIVA: cada seção/capítulo deve ter abertura diferente — às vezes inicia com história, às vezes com dado impactante, às vezes com pergunta cortante — nunca padrão idêntico
• ANCORAGEM COM NÚMEROS: prazos, percentuais, valores estimados, quantidades — o leitor precisa sentir o chão sob os pés
• AÇÃO AO FINAL: toda seção longa termina com 1 tarefa concreta: "[Verbo imperativo] [número] [coisa] [prazo]"
Retorne SOMENTE JSON válido. Sem markdown. Sem menção a IA ou ChatGPT.`;

  const schema = getPromptSchema(tipo, extensao);

  const prompt = `Crie um ${LABELS[tipo] || tipo} completo e premium sobre:

Nicho: ${nicho}
Público-alvo: ${publico}
Tema central: ${tema || nicho}
Tom: ${tom}
Extensão: ${extensao}
Autor: ${autor}

${schema}

RETORNE SOMENTE O JSON COMPLETO E VÁLIDO.`;

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: sistema },
      { role: 'user',   content: prompt  },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.8,
  });

  const raw = response.choices[0].message.content;

  try {
    return JSON.parse(raw);
  } catch (_) {
    const { jsonrepair } = require('jsonrepair');
    const reparado = JSON.parse(jsonrepair(raw));
    aprendizados.salvar({
      titulo: `JSON malformado reparado — tipo: ${tipo}`,
      categoria: 'bug_fix',
      problema: `GPT-4o retornou JSON inválido para tipo "${tipo}" (${nicho}). JSON.parse falhou.`,
      solucao: 'jsonrepair aplicado com sucesso. Considerar prompt mais explícito sobre estrutura JSON se recorrente neste tipo.',
      contexto: { tipo, nicho, extensao, raw_inicio: raw.slice(0, 120) },
      tags: ['json', 'gpt4o', tipo, 'jsonrepair'],
      fonte: 'engine',
    });
    return reparado;
  }
}

// ── Validação de conteúdo gerado ───────────────────────────
function validarConteudo(conteudo, tipo, extensao) {
  const mins = { curto: 4, medio: 6, longo: 9 };
  const min  = mins[extensao] || 6;

  const checks = {
    ebook:      () => {
      if (!Array.isArray(conteudo.capitulos) || conteudo.capitulos.length < min)
        throw new Error(`E-book com apenas ${conteudo.capitulos?.length || 0} capítulos — mínimo ${min} para extensão "${extensao}"`);
      conteudo.capitulos.forEach((c, i) => {
        if (!c.conteudo || c.conteudo.length < 150)
          throw new Error(`Capítulo ${i+1} com conteúdo insuficiente (${c.conteudo?.length || 0} chars)`);
      });
    },
    workbook:   () => {
      if (!Array.isArray(conteudo.modulos) || conteudo.modulos.length < min)
        throw new Error(`Workbook com apenas ${conteudo.modulos?.length || 0} módulos — mínimo ${min}`);
      conteudo.modulos.forEach((m, i) => {
        if (!Array.isArray(m.exercicios) || m.exercicios.length < 2)
          throw new Error(`Módulo ${i+1} com menos de 2 exercícios`);
      });
    },
    guia:       () => {
      if (!Array.isArray(conteudo.passos) || conteudo.passos.length < min)
        throw new Error(`Guia com apenas ${conteudo.passos?.length || 0} passos — mínimo ${min}`);
    },
    checklist:  () => {
      if (!Array.isArray(conteudo.secoes) || conteudo.secoes.length < 4)
        throw new Error(`Checklist com apenas ${conteudo.secoes?.length || 0} seções — mínimo 4`);
      conteudo.secoes.forEach((s, i) => {
        if (!Array.isArray(s.itens) || s.itens.length < 3)
          throw new Error(`Seção ${i+1} do checklist com menos de 3 itens`);
      });
    },
    script_vsl: () => {
      if (!Array.isArray(conteudo.partes) || conteudo.partes.length < 8)
        throw new Error(`Script VSL com apenas ${conteudo.partes?.length || 0}/8 partes`);
      conteudo.partes.forEach((p, i) => {
        if (!p.script || p.script.length < 50)
          throw new Error(`Parte ${i+1} do VSL sem script ou muito curta`);
      });
    },
  };

  if (checks[tipo]) checks[tipo]();
}

// ── Upload do PDF para Supabase Storage ────────────────────
async function uploadArquivo(buffer, filename) {
  try {
    const { createClient } = require('@supabase/supabase-js');
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
    const supa = createClient(process.env.SUPABASE_URL, key);
    const isJpeg = filename.endsWith('.jpg') || filename.endsWith('.jpeg');
    const contentType = isJpeg ? 'image/jpeg' : 'application/pdf';
    const { error } = await supa.storage
      .from('criador-pdfs')
      .upload(filename, Buffer.from(buffer), { contentType, upsert: true });
    if (error) return null;
    const { data: urlData } = supa.storage.from('criador-pdfs').getPublicUrl(filename);
    return urlData?.publicUrl || null;
  } catch (_) {
    return null;
  }
}
// Alias para compatibilidade com chamadas existentes
const uploadPDF = uploadArquivo;

// ── Renderização PDF via Puppeteer ──────────────────────────
async function renderizarPDF(conteudo, params) {
  const { tipo, nicho } = params;
  const cores = detectarPaletaNicho(nicho) || CORES[tipo] || CORES.ebook;

  const templateHtml = fs.readFileSync(TEMPLATE_PATH, 'utf8');

  const data = {
    ...conteudo,
    tipo,
    cores,
    label_tipo:  LABELS[tipo] || tipo,
    autor:       conteudo.autor || params.autor || 'Autor',
    nicho:       params.nicho   || '',
    ano:         new Date().getFullYear(),
  };

  const html = templateHtml.replace(
    '/* __CRIADOR_DATA__ */',
    `window.__D = ${JSON.stringify(data)};`
  );

  const isProd = !!(process.env.NODE_ENV === 'production' || process.env.RENDER);

  let browser;
  const ARGS = ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--font-render-hinting=none'];

  if (isProd) {
    const chromium      = require('@sparticuz/chromium');
    const puppeteerCore = require('puppeteer-core');
    browser = await puppeteerCore.launch({
      args: [...chromium.args, ...ARGS],
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });
  } else {
    const puppeteer = require('puppeteer');
    browser = await puppeteer.launch({ headless: 'new', args: ARGS });
  }

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 60000 });
    await new Promise(r => setTimeout(r, 1500));

    const rawBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });

    // Gera thumbnail PNG da capa (primeira página visível)
    let thumbnailBuffer = null;
    try {
      await page.setViewport({ width: 794, height: 1123 }); // A4 em 96dpi
      thumbnailBuffer = await page.screenshot({ type: 'jpeg', quality: 80, clip: { x: 0, y: 0, width: 794, height: 500 } });
    } catch (_) {}

    await page.close();

    // Injeta metadados internos no PDF (Author, Title, Subject)
    try {
      const { PDFDocument } = require('pdf-lib');
      const pdfDoc = await PDFDocument.load(rawBuffer);
      const titulo = conteudo?.titulo || params?.nicho || 'Produto Digital';
      const autor  = conteudo?.autor  || params?.autor  || 'Autor';
      pdfDoc.setTitle(titulo);
      pdfDoc.setAuthor(autor);
      pdfDoc.setSubject(params?.nicho || '');
      pdfDoc.setCreator('MAX Criador — Powered by GPT-4o');
      pdfDoc.setProducer('MAX Criador');
      const pdfBytes = await pdfDoc.save();
      return { pdfBuffer: Buffer.from(pdfBytes), thumbnailBuffer };
    } catch (_) {
      return { pdfBuffer: rawBuffer, thumbnailBuffer };
    }
  } finally {
    await browser.close();
  }
}

// ── Salva erro no Supabase com solução automática ───────────
async function registrarErro(entregaId, rota, erro, contexto) {
  try {
    const { createClient } = require('@supabase/supabase-js');
    const supa = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

    const msg = (erro.message || '').toLowerCase();
    let solucao = null;
    if (msg.includes('timeout'))                       solucao = 'Aumentar timeout do Puppeteer ou usar extensão mais curta';
    else if (msg.includes('json') || msg.includes('parse')) solucao = 'GPT retornou JSON malformado — jsonrepair aplicado automaticamente; se persistir, verificar schema do prompt';
    else if (msg.includes('openai') || msg.includes('rate')) solucao = 'Verificar OPENAI_API_KEY e quota disponível na conta OpenAI';
    else if (msg.includes('chromium') || msg.includes('puppeteer') || msg.includes('browser')) solucao = 'Verificar instalação do Chromium/Puppeteer no ambiente — em produção precisa do @sparticuz/chromium';
    else if (msg.includes('supabase') || msg.includes('network'))  solucao = 'Verificar variáveis SUPABASE_URL e SUPABASE_ANON_KEY no .env';
    else if (msg.includes('memory') || msg.includes('heap'))       solucao = 'Reduzir extensão do produto ou aumentar memória do servidor';
    else solucao = 'Investigar stack trace e contexto para diagnóstico específico';

    await supa.from('erros_sistema').insert({
      entrega_id: entregaId || null,
      rota,
      mensagem:   (erro.message || '').slice(0, 500),
      stack:      (erro.stack   || '').slice(0, 2000),
      contexto:   contexto || null,
      solucao,
    });
  } catch (_) {}
}

// ── Motor principal ─────────────────────────────────────────
async function executar(params, onProgress = () => {}) {
  const {
    tipo      = 'ebook',
    nicho     = '',
    publico   = '',
    tema      = '',
    tom       = 'conversacional',
    extensao  = 'medio',
    autor     = 'Autor',
  } = params;

  const { createClient } = require('@supabase/supabase-js');
  const supa = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

  // Registra a entrega no Supabase
  let entregaId = null;
  try {
    const { data } = await supa
      .from('entregas')
      .insert({ tipo, nicho, publico, tema, tom, extensao, autor, parametros: params, status: 'gerando' })
      .select('id')
      .single();
    entregaId = data?.id || null;
  } catch (_) {}

  try {
    onProgress(8,  'Preparando estrutura do produto...');

    onProgress(20, `Gerando ${LABELS[tipo] || tipo} com IA — aguarde (30–90s)...`);
    let conteudo = await gerarConteudo({ tipo, nicho, publico, tema, tom, extensao, autor });

    // Valida conteúdo — retry automático se insuficiente
    try {
      validarConteudo(conteudo, tipo, extensao);
    } catch (validErr) {
      onProgress(45, 'Conteúdo incompleto — regenerando com mais detalhe...');
      aprendizados.salvar({
        titulo: `Validação falhou — retry automático — ${tipo}`,
        categoria: 'bug_fix',
        problema: validErr.message,
        solucao: 'Retry automático com mesmo prompt. Se persistir, revisar schema do prompt.',
        contexto: { tipo, nicho, extensao },
        tags: [tipo, 'validacao', 'retry'],
        fonte: 'engine',
      });
      conteudo = await gerarConteudo({ tipo, nicho, publico, tema, tom, extensao, autor });
      validarConteudo(conteudo, tipo, extensao); // lança se ainda inválido após retry
    }

    onProgress(68, 'Renderizando PDF profissional...');
    const { pdfBuffer, thumbnailBuffer } = await renderizarPDF(conteudo, { tipo, nicho, autor });

    onProgress(92, 'Salvando resultado...');
    const titulo = conteudo.titulo || tema || nicho || tipo;
    const pdfFilename = `${entregaId || Date.now()}-${tipo}.pdf`;

    // Upload PDF e thumbnail para Storage
    const pdfUrl = await uploadPDF(pdfBuffer, pdfFilename);
    let thumbUrl = null;
    if (thumbnailBuffer) {
      thumbUrl = await uploadPDF(thumbnailBuffer, pdfFilename.replace('.pdf', '-thumb.jpg'));
    }

    if (entregaId) {
      await supa.from('entregas').update({
        status: 'pronto',
        titulo,
        conteudo,
        pdf_url:   pdfUrl,
        thumb_url: thumbUrl,
      }).eq('id', entregaId);
    }

    onProgress(100, 'Pronto!');

    // Registra padrão de sucesso para aprendizado futuro
    const pdfKb = Math.round(Buffer.from(pdfBuffer).length / 1024);
    aprendizados.salvar({
      titulo: `Geração bem-sucedida — ${LABELS[tipo]} · ${nicho}`,
      categoria: 'padrao',
      solucao: `${LABELS[tipo]} gerado com sucesso. Tom: ${tom}, Extensão: ${extensao}, PDF: ${pdfKb}KB.`,
      contexto: { tipo, nicho, publico, tom, extensao, pdfKb, titulo },
      tags: [tipo, tom, extensao, 'sucesso'],
      fonte: 'engine',
    });

    const slugTitulo = titulo.slice(0, 45)
      .toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '') // remove acentos
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    return {
      pdf:         pdfBuffer,
      pdf_url:     pdfUrl,
      thumb_url:   thumbUrl,
      titulo,
      tipo,
      conteudo,
      pdfFilename: `${tipo}-${slugTitulo}.pdf`,
    };

  } catch (erro) {
    console.error('[criador_engine]', erro.message);
    await registrarErro(entregaId, '/api/criador', erro, params);

    if (entregaId) {
      try {
        await supa.from('entregas').update({ status: 'erro' }).eq('id', entregaId);
      } catch (_) {}
    }
    throw erro;
  }
}

module.exports = { executar, CORES, LABELS };
