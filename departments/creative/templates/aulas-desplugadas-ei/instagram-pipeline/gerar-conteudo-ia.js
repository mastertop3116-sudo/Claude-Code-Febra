// Gerador de conteúdo via GPT-4o Mini
// Chamado pelo pipeline antes de gerar imagem — evita repetição, sempre fresco

const OpenAI = require('openai');

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const FONTES_POR_DIA   = [['bebas'], ['anton'], ['gagalin'], ['oswald'], ['bebas'], ['anton'], ['gagalin']];
const TEXTURAS_POR_DIA = ['grunge', 'halftone', 'noise', 'grunge', 'halftone', 'noise', 'grunge'];
const TIPOS_NOITE      = ['motivacional', 'dica', 'motivacional', 'engajamento', 'dica', 'motivacional', 'engajamento'];

async function gerarManha(dia, dataStr) {
  const fonteIdx   = dia % FONTES_POR_DIA.length;
  const texturaIdx = dia % TEXTURAS_POR_DIA.length;

  const prompt = `Você é especialista em jiu-jitsu infantil e criação de conteúdo educativo para Instagram.
Crie um carrossel para senseis que ensinam jiu-jitsu para crianças de 4 a 12 anos.
Data: ${dataStr}.

Retorne SOMENTE JSON com esta estrutura exata:
{
  "badge": "rótulo do carrossel (3-4 palavras, ex: 'Dica do Tatame', 'Erro Comum', 'Na Prática')",
  "emoji": "emoji relevante ao tema",
  "slides": [
    {"tipo":"capa","titulo":"título com número (ex: '3 formas de...' ou '5 erros que...')","texto":"subtítulo curto gerando curiosidade (máx 15 palavras)"},
    {"tipo":"conteudo","numero":2,"titulo":"título da dica 1 (5-7 palavras)","texto":"explicação prática e direta (máx 25 palavras)"},
    {"tipo":"conteudo","numero":3,"titulo":"título da dica 2 (5-7 palavras)","texto":"explicação prática e direta (máx 25 palavras)"},
    {"tipo":"conteudo","numero":4,"titulo":"título da dica 3 (5-7 palavras)","texto":"explicação prática e direta (máx 25 palavras)"},
    {"tipo":"cta","titulo":"chamada para ação (máx 8 palavras)","texto":"incentivo a salvar e compartilhar (máx 20 palavras)"}
  ]
}

Tema: pedagogia do jiu-jitsu infantil (atenção, disciplina, técnica, pais, turma difícil, primeiras aulas...).
Tom: direto, prático, experiente. Evite clichês. Use situações reais do tatame.`;

  const resp  = await client.chat.completions.create({
    model:           'gpt-4o-mini',
    messages:        [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature:     0.85,
  });

  const g = JSON.parse(resp.choices[0].message.content);
  return {
    tipo:    'carrossel',
    estilo:  'dark',
    fontes:  FONTES_POR_DIA[fonteIdx],
    textura: TEXTURAS_POR_DIA[texturaIdx],
    badge:   g.badge,
    emoji:   g.emoji,
    slides:  g.slides,
  };
}

async function gerarNoite(dia, dataStr) {
  const tipo   = TIPOS_NOITE[dia];
  const fontes = FONTES_POR_DIA[dia];
  const textura = TEXTURAS_POR_DIA[dia];

  let schema = '';
  if (tipo === 'motivacional') {
    schema = `{
  "frase": "frase de impacto curta sem aspas (máx 12 palavras)",
  "contexto": "desenvolvimento conectando tatame com formação de caráter (máx 35 palavras)",
  "cta": "chamada para ação com emoji (máx 15 palavras)"
}`;
  } else if (tipo === 'dica') {
    schema = `{
  "titulo": "título da dica (máx 10 palavras)",
  "dica": "contexto do problema que a dica resolve (máx 25 palavras)",
  "destaque": "frase de destaque curta (máx 6 palavras)",
  "resposta": "3 itens separados por \\n, cada um com emoji no início (máx 15 palavras cada)",
  "cta": "chamada para ação com emoji (máx 12 palavras)"
}`;
  } else {
    schema = `{
  "pergunta": "pergunta direta e provocante (máx 12 palavras)",
  "contexto": "contexto ou situação curta que justifica a pergunta (máx 30 palavras)",
  "opcoes": "2-3 opções separadas por \\n com letra e emoji (ex: A) 🥋 opção aqui)",
  "cta": "incentivo para responder nos comentários (máx 10 palavras)"
}`;
  }

  const prompt = `Você é especialista em jiu-jitsu infantil e criação de conteúdo para Instagram.
Tipo de post: ${tipo}. Data: ${dataStr}.

Crie conteúdo para senseis que ensinam crianças de 4 a 12 anos.
Retorne SOMENTE JSON com esta estrutura exata:
${schema}

Tom: autêntico, direto, vindo de quem vive o tatame todo dia. Evite frases genéricas.`;

  const resp  = await client.chat.completions.create({
    model:           'gpt-4o-mini',
    messages:        [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature:     0.85,
  });

  const g = JSON.parse(resp.choices[0].message.content);
  return { tipo, estilo: 'dark', fontes, textura, conteudo: g };
}

async function gerarConteudo(periodo) {
  const agora   = new Date();
  const dia     = agora.getDay(); // 0=dom … 6=sab
  const dataStr = agora.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  console.log(`[ia] Gerando conteúdo ${periodo} para ${dataStr}...`);
  const entrada = periodo === 'manha'
    ? await gerarManha(dia, dataStr)
    : await gerarNoite(dia, dataStr);

  console.log(`[ia] Conteúdo gerado — tipo: ${entrada.tipo}`);
  return entrada;
}

module.exports = { gerarConteudo };
