// Gerador de conteúdo via GPT-4o Mini
// Chamado pelo pipeline antes de gerar imagem — evita repetição, sempre fresco
// Revezа 3 estilos visuais (dark/premium/color) e MUITOS ângulos de conteúdo.

const OpenAI = require('openai');

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function carregarInsights() {
  try { return require('./insights'); } catch (e) { return null; }
}

// ── Rotações ──────────────────────────────────────────────────────────────────
const FONTES_POR_DIA   = [['bebas'], ['anton'], ['gagalin'], ['oswald'], ['bebas'], ['anton'], ['gagalin']];
const TEXTURAS_POR_DIA = ['grunge', 'halftone', 'noise', 'grunge', 'halftone', 'noise', 'grunge'];
const ESTILOS_POR_DIA  = ['dark', 'premium', 'color', 'dark', 'premium', 'color', 'dark']; // revezamento visual

// Tipos de post da noite (post único) — varia o formato visual
const TIPOS_NOITE = ['motivacional', 'dica', 'engajamento', 'dica', 'motivacional', 'produto', 'engajamento'];

// Ângulos de conteúdo do CARROSSEL (manhã) — gira por dia-do-ano (não repete em sequência)
const ANGULOS_CARROSSEL = [
  { tema: 'curiosidades surpreendentes sobre o jiu-jitsu infantil que a maioria dos pais e senseis não conhece', badge: 'Você Sabia?',      formato: 'cada slide traz uma curiosidade real e específica (com o porquê)' },
  { tema: 'erros comuns que senseis cometem ao ensinar crianças e como corrigir cada um na prática',             badge: 'Erros Comuns',     formato: 'cada slide: o erro + como corrigir de forma simples' },
  { tema: 'uma dinâmica/brincadeira passo a passo pronta pra aplicar na próxima aula de jiu-jitsu infantil',     badge: 'Na Prática',       formato: 'cada slide é um passo claro e executável da dinâmica' },
  { tema: 'soluções práticas para problemas reais do tatame: criança tímida, bagunça, falta de foco, medo de cair', badge: 'Resolve no Tatame', formato: 'cada slide: um problema comum + a solução testada' },
  { tema: 'sugestões de jogos e brincadeiras que ensinam técnica de jiu-jitsu brincando',                        badge: 'Brincando se Aprende', formato: 'cada slide: uma brincadeira + o que ela desenvolve' },
  { tema: 'dicas de pedagogia para prender a atenção e manter a disciplina de uma turma de crianças',            badge: 'Domine a Turma',   formato: 'cada slide: uma técnica de gestão de turma com exemplo' },
  { tema: 'mitos e verdades sobre o jiu-jitsu para crianças, para tranquilizar os pais e atrair matrículas',     badge: 'Mito ou Verdade?', formato: 'cada slide: uma afirmação marcada como MITO ou VERDADE + explicação' },
  { tema: 'benefícios reais do jiu-jitsu no desenvolvimento da criança: foco, disciplina, respeito, autoconfiança', badge: 'Muito Além do Tatame', formato: 'cada slide: um benefício + como ele aparece no dia a dia da criança' },
];

// Focos de conteúdo do post único da NOITE — gira por dia-do-ano
const FOCOS_DICA = [
  'uma dica prática de pedagogia para aplicar no tatame já na próxima aula',
  'uma curiosidade surpreendente sobre jiu-jitsu infantil (algo que poucos sabem)',
  'um mito muito comum sobre crianças no jiu-jitsu — e a verdade por trás dele',
  'a solução para um problema frequente: criança dispersa, tímida ou agitada demais',
];
const FOCOS_MOTIV = [
  'superação: cada queda é uma chance de levantar mais forte',
  'disciplina e respeito construídos no tatame',
  'como o jiu-jitsu vence a timidez e constrói confiança',
  'foco e presença: a criança aprende a se concentrar',
  'amizade, equipe e pertencimento dentro do dojo',
];
const FOCOS_ENGAJ = [
  'o maior desafio ao ensinar jiu-jitsu para crianças',
  'a idade ideal para a criança começar no jiu-jitsu',
  'como lidar com pais ansiosos ou superprotetores',
  'a brincadeira que mais funciona pra prender a atenção da turma',
  'o que não pode faltar numa boa aula infantil',
];

function diaDoAno(d) {
  const inicio = new Date(d.getFullYear(), 0, 0);
  return Math.floor((d - inicio) / 86400000);
}

// ── CARROSSEL (manhã) — conteúdo rico e variado ────────────────────────────────
async function gerarManha(dia, doAno, dataStr, contextoIA = '') {
  const fonteIdx   = dia % FONTES_POR_DIA.length;
  const texturaIdx = dia % TEXTURAS_POR_DIA.length;
  const ang        = ANGULOS_CARROSSEL[doAno % ANGULOS_CARROSSEL.length];

  const prompt = `Você é um sensei experiente de jiu-jitsu infantil (crianças de 4 a 12 anos) e especialista em conteúdo para Instagram.
Crie um carrossel RICO e ESPECÍFICO para senseis, instrutores e donos de academia. Data: ${dataStr}.

ÂNGULO DE HOJE: ${ang.tema}.
FORMATO: ${ang.formato}.

Regras de qualidade (MUITO IMPORTANTE):
- Conteúdo REAL e ÚTIL, com exemplos concretos do tatame. NADA de frase genérica, óbvia ou repetida.
- Seja específico: nomes de situações, faixas etárias, falas que o sensei pode usar, exemplos práticos.
- Cada slide de conteúdo deve ENTREGAR algo aplicável, não só "seja paciente".

Retorne SOMENTE JSON com esta estrutura exata:
{
  "badge": "rótulo curto do carrossel (2-4 palavras, ex: '${ang.badge}')",
  "emoji": "1 emoji relevante ao tema",
  "slides": [
    {"tipo":"capa","titulo":"título forte com número quando fizer sentido (ex: '6 curiosidades que...', '5 erros que...')","texto":"subtítulo curto que gera curiosidade (máx 16 palavras)"},
    {"tipo":"conteudo","titulo":"título do ponto 1 (4-7 palavras)","texto":"explicação prática, específica e com exemplo (28 a 42 palavras)"},
    {"tipo":"conteudo","titulo":"título do ponto 2 (4-7 palavras)","texto":"explicação prática, específica e com exemplo (28 a 42 palavras)"},
    {"tipo":"conteudo","titulo":"título do ponto 3 (4-7 palavras)","texto":"explicação prática, específica e com exemplo (28 a 42 palavras)"},
    {"tipo":"conteudo","titulo":"título do ponto 4 (4-7 palavras)","texto":"explicação prática, específica e com exemplo (28 a 42 palavras)"},
    {"tipo":"conteudo","titulo":"título do ponto 5 (4-7 palavras)","texto":"explicação prática, específica e com exemplo (28 a 42 palavras)"},
    {"tipo":"cta","titulo":"chamada para ação (máx 8 palavras)","texto":"incentivo a salvar e compartilhar com outros senseis (máx 18 palavras)"}
  ]
}

Gere de 5 a 6 slides de conteúdo (não menos que 5). Tom: direto, experiente, de quem vive o tatame.${contextoIA}`;

  const resp  = await client.chat.completions.create({
    model:           'gpt-4o-mini',
    messages:        [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature:     0.9,
  });

  const g = JSON.parse(resp.choices[0].message.content);

  // Monta a lista garantindo capa única, cta única e numeração correta
  const raw       = Array.isArray(g.slides) ? g.slides : [];
  const capa      = raw.find(s => s.tipo === 'capa')  || raw[0];
  const cta       = raw.find(s => s.tipo === 'cta')   || raw[raw.length - 1];
  let   conteudos = raw.filter(s => s.tipo === 'conteudo').slice(0, 6);
  conteudos.forEach((s, i) => { s.numero = i + 2; }); // 2,3,4...
  const slides = [capa, ...conteudos, cta].filter(Boolean);

  return {
    tipo:    'carrossel',
    estilo:  ESTILOS_POR_DIA[dia % ESTILOS_POR_DIA.length],
    fontes:  FONTES_POR_DIA[fonteIdx],
    textura: TEXTURAS_POR_DIA[texturaIdx],
    badge:   g.badge || ang.badge,
    emoji:   g.emoji || '🥋',
    slides,
  };
}

// ── POST ÚNICO (noite) — varia formato E conteúdo ──────────────────────────────
async function gerarNoite(dia, doAno, dataStr, contextoIA = '') {
  const tipo    = TIPOS_NOITE[dia % TIPOS_NOITE.length];
  const fontes  = FONTES_POR_DIA[dia % FONTES_POR_DIA.length];
  const textura = TEXTURAS_POR_DIA[dia % TEXTURAS_POR_DIA.length];
  const estilo  = ESTILOS_POR_DIA[dia % ESTILOS_POR_DIA.length];

  let schema = '', foco = '';
  if (tipo === 'motivacional') {
    foco   = FOCOS_MOTIV[doAno % FOCOS_MOTIV.length];
    schema = `{
  "frase": "frase de impacto curta sem aspas (máx 12 palavras)",
  "contexto": "desenvolvimento conectando tatame com formação de caráter (máx 35 palavras)",
  "cta": "chamada para ação com emoji (máx 15 palavras)"
}`;
  } else if (tipo === 'dica') {
    foco   = FOCOS_DICA[doAno % FOCOS_DICA.length];
    schema = `{
  "titulo": "título chamativo do tema (máx 10 palavras)",
  "dica": "contexto do problema/assunto que o post resolve (máx 25 palavras)",
  "destaque": "frase de destaque curta (máx 6 palavras)",
  "resposta": "3 itens separados por \\n, cada um começa com emoji e é específico e aplicável (máx 16 palavras cada)",
  "cta": "chamada para ação com emoji (máx 12 palavras)"
}`;
  } else if (tipo === 'produto') {
    foco   = 'apresentar o produto "+250 Dinâmicas de Jiu-Jitsu Infantil" como solução pra quem quer aulas prontas e organizadas';
    schema = `{
  "gancho": "gancho forte que fala da dor de montar aula do zero (máx 12 palavras)",
  "problema": "a dor antes (máx 14 palavras)",
  "solucao": "como fica depois com as dinâmicas prontas (máx 14 palavras)",
  "prova": "prova/benefício concreto (ex: +250 dinâmicas por faixa etária) (máx 14 palavras)",
  "urgencia": "frase curta de urgência ou bônus (máx 10 palavras)",
  "cta": "chamada para ação curta (máx 6 palavras, ex: 'Garanta o seu')"
}`;
  } else { // engajamento
    foco   = FOCOS_ENGAJ[doAno % FOCOS_ENGAJ.length];
    schema = `{
  "pergunta": "pergunta direta e provocante (máx 12 palavras)",
  "contexto": "contexto ou situação curta que justifica a pergunta (máx 30 palavras)",
  "opcoes": ["A) 🥋 opção", "B) 🏆 opção", "C) 💪 opção"],
  "cta": "incentivo para responder nos comentários (máx 10 palavras)"
}`;
  }

  const prompt = `Você é um sensei experiente de jiu-jitsu infantil e criador de conteúdo para Instagram.
Tipo de post: ${tipo}. Data: ${dataStr}.
FOCO DE HOJE: ${foco}.

Crie conteúdo ESPECÍFICO e ÚTIL para senseis que ensinam crianças de 4 a 12 anos.
Evite o óbvio e o genérico — traga exemplos reais do tatame.
Retorne SOMENTE JSON com esta estrutura exata:
${schema}

Tom: autêntico, direto, de quem vive o tatame todo dia.${contextoIA}`;

  const resp  = await client.chat.completions.create({
    model:           'gpt-4o-mini',
    messages:        [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature:     0.9,
  });

  const g = JSON.parse(resp.choices[0].message.content);
  return { tipo, estilo, fontes, textura, conteudo: g };
}

async function gerarConteudo(periodo) {
  const agora   = new Date();
  const dia     = agora.getDay();      // 0=dom … 6=sab
  const doAno   = diaDoAno(agora);     // 0..365 — gira os ângulos de conteúdo
  const dataStr = agora.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  // Busca top performers para dar contexto à IA (silencioso se falhar)
  let contextoIA = '';
  try {
    const ins = carregarInsights();
    if (ins) {
      const topPosts = await ins.buscarTopPerformers(5);
      contextoIA = ins.formatarContextoIA(topPosts);
      if (contextoIA) console.log('[ia] Contexto de performance carregado.');
    }
  } catch (e) {
    console.log('[ia] Sem contexto de performance (insights indisponíveis).');
  }

  console.log(`[ia] Gerando conteúdo ${periodo} para ${dataStr}...`);
  const entrada = periodo === 'manha'
    ? await gerarManha(dia, doAno, dataStr, contextoIA)
    : await gerarNoite(dia, doAno, dataStr, contextoIA);

  console.log(`[ia] Conteúdo gerado — tipo: ${entrada.tipo} | estilo: ${entrada.estilo}`);
  return entrada;
}

module.exports = { gerarConteudo };
