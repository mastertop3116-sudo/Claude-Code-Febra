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

// ── Cores e labels por tipo ─────────────────────────────────
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
  "introducao": "texto de introdução envolvente (150 a 200 palavras)",
  "capitulos": [
    {
      "numero": 1,
      "titulo": "título do capítulo",
      "conteudo": "texto completo (${wpp} palavras) — rico em detalhes, exemplos e linguagem acessível",
      "pontos_chave": ["ponto 1", "ponto 2", "ponto 3"],
      "citacao": "frase de destaque impactante (máx 20 palavras)"
    }
  ],
  "conclusao": "conclusão motivadora (100 a 150 palavras)",
  "cta": "chamada para ação final (máx 50 palavras)"
}
OBRIGATÓRIO: gere de ${qtd} capítulos completos e detalhados`,

    workbook: `Retorne JSON com exatamente esta estrutura:
{
  "titulo": "título do workbook (máx 12 palavras)",
  "subtitulo": "resultado esperado após completar o workbook",
  "autor": "nome do autor",
  "introducao": "como usar este workbook e o que esperar (100 a 150 palavras)",
  "modulos": [
    {
      "numero": 1,
      "titulo": "nome do módulo",
      "objetivo": "objetivo de aprendizado (1 frase clara)",
      "teoria": "base conceitual do módulo (200 a 300 palavras)",
      "exercicios": [
        {
          "titulo": "nome do exercício",
          "instrucao": "instrução clara e específica (2 a 3 frases)",
          "linhas": 5
        }
      ]
    }
  ],
  "reflexao_final": "reflexão e comprometimento para fechamento (80 a 120 palavras)"
}
OBRIGATÓRIO: gere de ${qtd} módulos, cada um com 2 a 3 exercícios`,

    guia: `Retorne JSON com exatamente esta estrutura:
{
  "titulo": "título do guia passo a passo (máx 12 palavras)",
  "subtitulo": "promessa central do guia",
  "autor": "nome do autor",
  "introducao": "contexto e por que este guia é essencial (120 a 180 palavras)",
  "passos": [
    {
      "numero": 1,
      "titulo": "nome do passo",
      "descricao": "explicação detalhada e prática (300 a 500 palavras)",
      "acoes": ["ação concreta 1", "ação concreta 2", "ação concreta 3"],
      "dica": "dica prática ou erro comum a evitar"
    }
  ],
  "conclusao": "próximos passos e encorajamento (80 a 120 palavras)"
}
OBRIGATÓRIO: gere de ${qtd} passos detalhados`,

    checklist: `Retorne JSON com exatamente esta estrutura:
{
  "titulo": "título do checklist (máx 12 palavras)",
  "subtitulo": "para quem é e o que resolve",
  "autor": "nome do autor",
  "introducao": "por que usar este checklist e como ele ajuda (80 a 120 palavras)",
  "secoes": [
    {
      "titulo": "nome da seção (substantivo + contexto, ex: 'Preparação Inicial', 'Revisão Final')",
      "descricao": "contexto breve da seção em 1 frase direta",
      "itens": ["Verbo + ação específica + detalhes do nicho (ex: Verifique se o contrato tem cláusula de rescisão)"]
    }
  ],
  "dica_final": "dica para usar o checklist ao máximo (60 a 80 palavras)"
}
OBRIGATÓRIO: gere de 5 a 8 seções, cada uma com 5 a 8 itens
REGRA DE OURO para os itens: SEMPRE comece com verbo no imperativo (Verifique, Confirme, Liste, Revise, Defina, Teste, Documente, Calcule, Contate, Organize...) — nunca substantivos soltos. Cada item deve ser específico ao nicho, acionável e verificável`,

    desafio: `Retorne JSON com exatamente esta estrutura:
{
  "titulo": "nome do desafio (máx 12 palavras)",
  "subtitulo": "o que será transformado ao longo do desafio",
  "autor": "nome do autor",
  "duracao": 21,
  "introducao": "por que aceitar este desafio e o que esperar (100 a 150 palavras)",
  "semanas": [
    {
      "numero": 1,
      "tema": "tema central da semana",
      "descricao": "foco e objetivos desta semana (100 a 150 palavras)",
      "dias": [
        {
          "numero": 1,
          "titulo": "nome do dia",
          "tarefa": "tarefa específica e prática do dia (2 a 3 frases diretas)",
          "afirmacao": "afirmação poderosa relacionada ao dia"
        }
      ]
    }
  ],
  "manifesto": "manifesto do desafio — declaração de comprometimento (60 a 80 palavras)"
}
OBRIGATÓRIO: gere exatamente 3 semanas com 7 dias cada`,

    planner: `Retorne JSON com exatamente esta estrutura:
{
  "titulo": "nome do planner (máx 12 palavras)",
  "subtitulo": "período e foco principal do planner",
  "autor": "nome do autor",
  "introducao": "como usar este planner para máximos resultados (100 a 150 palavras)",
  "secoes": [
    {
      "titulo": "nome da seção",
      "descricao": "propósito desta seção (1 frase)",
      "campos": ["campo 1", "campo 2", "campo 3", "campo 4"]
    }
  ],
  "rituais": [
    {
      "tipo": "Ritual Matinal",
      "passos": ["passo 1", "passo 2", "passo 3", "passo 4", "passo 5"]
    }
  ],
  "citacao": "citação motivacional poderosa para o planner"
}
OBRIGATÓRIO: gere de 5 a 7 seções e 3 rituais (matinal, noturno, semanal)`,

    devocional: `Retorne JSON com exatamente esta estrutura:
{
  "titulo": "título do devocional (máx 12 palavras)",
  "subtitulo": "tema espiritual central",
  "autor": "nome do autor",
  "prefacio": "prefácio do devocional (100 a 150 palavras)",
  "dias": [
    {
      "numero": 1,
      "titulo": "título do dia",
      "versiculo_ref": "Referência bíblica (ex: João 3:16)",
      "versiculo": "texto completo do versículo (versão NVI ou NVT)",
      "reflexao": "reflexão devocional profunda (350 a 450 palavras) — tom conversacional e pessoal, como se estivesse falando diretamente com o leitor",
      "perguntas": ["pergunta reflexiva 1", "pergunta reflexiva 2"],
      "oracao": "oração curta e pessoal (5 a 8 linhas)"
    }
  ],
  "oracao_final": "oração de encerramento do devocional (60 a 80 palavras)"
}
OBRIGATÓRIO: gere exatamente 7 dias completos`,

    script_vsl: `Retorne JSON com exatamente esta estrutura:
{
  "titulo": "nome do produto sendo vendido",
  "autor": "nome do apresentador",
  "partes": [
    { "nome": "GANCHO",       "duracao_seg": 30,  "script": "texto completo (100 a 150 palavras) — abre com declaração ousada ou pergunta que paralisa. Use [pausa] para respiração, [olha para a câmera] para conexão direta" },
    { "nome": "PROBLEMA",     "duracao_seg": 60,  "script": "texto completo (150 a 200 palavras) — identifica dor específica com detalhes do nicho. Tom: empático, como quem viveu isso" },
    { "nome": "AGITAÇÃO",     "duracao_seg": 60,  "script": "texto completo (150 a 200 palavras) — aprofunda o problema, mostra o custo de não agir. Tom: [tom mais grave] urgência real, sem drama falso" },
    { "nome": "SOLUÇÃO",      "duracao_seg": 90,  "script": "texto completo (200 a 250 palavras) — apresenta o produto. [pausa 2s antes de revelar o nome] Tom: confiante, revelação estratégica" },
    { "nome": "AUTORIDADE",   "duracao_seg": 45,  "script": "texto completo (100 a 150 palavras) — história pessoal + credenciais. Tom: natural, sem soar arrogante. [gesticula ao mencionar resultados]" },
    { "nome": "PROVA SOCIAL", "duracao_seg": 60,  "script": "texto completo (150 a 200 palavras) — 2 a 3 histórias de clientes reais com resultado específico (números, tempo, transformação)" },
    { "nome": "OFERTA",       "duracao_seg": 90,  "script": "texto completo (200 a 250 palavras) — preço com ancoragem, bônus listados, garantia destacada. [mostra dedos ao contar bônus] Tom: animado mas controlado" },
    { "nome": "CTA",          "duracao_seg": 30,  "script": "texto completo (80 a 120 palavras) — urgência real, escassez justificada, instrução de ação em 1 passo. [aponta para a tela] Termine com frase de encorajamento" }
  ]
}
OBRIGATÓRIO: preencha TODAS as 8 partes. O script deve soar como fala, não como texto escrito — frases curtas, pausas marcadas, ritmo de quem está na câmera. Específico ao nicho em todos os blocos`,
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

  const sistema = `Você é um especialista em criação de infoprodutos digitais premium para o mercado brasileiro.
Você escreve conteúdo excepcional, específico, prático e de alto valor real.
Tom de escrita: ${TONS[tom] || TONS.conversacional}
Autor do produto: ${autor}

REGRAS ABSOLUTAS:
- Escreva SEMPRE em português do Brasil
- Seja ESPECÍFICO ao nicho — zero conteúdo genérico
- Conteúdo rico, denso, com exemplos práticos do nicho
- Linguagem natural, fluida, sem rebuscamentos
- NUNCA mencione IA, ChatGPT, Claude ou tecnologia similar
- Retorne SOMENTE o JSON válido, sem markdown, sem texto extra`;

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

// ── Renderização PDF via Puppeteer ──────────────────────────
async function renderizarPDF(conteudo, params) {
  const { tipo } = params;
  const cores = CORES[tipo] || CORES.ebook;

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

    const buffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });

    await page.close();
    return buffer;
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
    const conteudo = await gerarConteudo({ tipo, nicho, publico, tema, tom, extensao, autor });

    onProgress(68, 'Renderizando PDF profissional...');
    const pdfBuffer = await renderizarPDF(conteudo, { tipo, nicho, autor });

    onProgress(92, 'Salvando resultado...');
    const titulo = conteudo.titulo || tema || nicho || tipo;

    if (entregaId) {
      await supa.from('entregas').update({
        status: 'pronto',
        titulo,
        conteudo,
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

    return {
      pdf:         pdfBuffer,
      titulo,
      tipo,
      conteudo,
      pdfFilename: `${tipo}-${titulo.slice(0, 45).toLowerCase().replace(/[^\w]/g, '-').replace(/-+/g, '-')}.pdf`,
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
