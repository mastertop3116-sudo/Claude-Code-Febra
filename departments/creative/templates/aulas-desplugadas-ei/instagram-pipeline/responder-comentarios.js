// Robô de comentários — responde automaticamente os comentários dos posts
// Usa a permissão instagram_manage_comments do token. NÃO mexe em DM/direct.
// Travas: não responde a si mesmo, não responde 2x o mesmo comentário,
// limite por rodada, e só comentários dos últimos N dias.

const axios  = require('axios');
const OpenAI = require('openai');
const config = require('./config');

const BASE = 'https://graph.facebook.com/v19.0';
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const TOKEN = () => config.instagram.accessToken;
const ACCT  = () => config.instagram.accountId;

// Palavras que indicam interesse de compra → resposta com CTA pro link da bio
const INTENCAO_COMPRA = /(pre[çc]o|valor|quanto|qto|qnt|quanto custa|comprar|adquirir|onde compr|link|quero|tenho interesse|me interess|como fa[çc]o|vendas?)/i;

// Resposta pronta pra quem demonstra interesse de compra
function respostaCompra(username) {
  const nome = username ? `@${username} ` : '';
  return `${nome}que massa seu interesse! 🥋 São +250 dinâmicas prontas — Básico R$10 e Premium R$19,90 (com 3 bônus). O link tá na nossa bio. Qualquer dúvida, é só chamar! 👊`;
}

// Cartão de conhecimento do negócio — tudo que o robô pode afirmar com segurança
const CONHECIMENTO = `SOBRE O NEGÓCIO (use só quando o comentário pedir; nunca invente além disso):
- Produto: "+250 Dinâmicas de Jiu-Jitsu Infantil" — atividades e brincadeiras prontas pra aulas de jiu-jitsu com crianças de 4 a 12 anos, organizadas por faixa etária.
- Preços: Básico R$10 · Premium R$19,90 (vem com 3 bônus). Compra pelo LINK NA BIO.
- Entrega: acesso à ÁREA DE MEMBROS com todo o manual, liberado logo após a compra (dados de acesso chegam por e-mail). Garantia de 7 dias.
- Público: senseis, instrutores, donos de academia e pais.
- Idade pra começar no jiu-jitsu: em geral a partir dos 4 anos, sempre com aula adaptada e lúdica.
- Benefícios que podemos citar: disciplina, foco, confiança, defesa pessoal sem violência, ajuda contra bullying.
- IMPORTANTE: não somos academia e não damos aulas (nem online) — vendemos o MATERIAL pronto pra quem dá as aulas.
- NUNCA: prometer resultado garantido, dar conselho médico, falar mal de concorrente, passar link no comentário (sempre "link na bio").`;

// Resposta amigável e contextual via IA (curta), com fallback se a IA falhar
async function respostaIA(comentario, legenda) {
  try {
    const prompt = `Você é o social media da página @jiujitsudinamicas (jiu-jitsu infantil, para senseis, instrutores e pais).
Responda o comentário abaixo de forma curta (máx 2 frases), calorosa, simpática e no tom de quem entende de tatame.
Use no máximo 1 emoji. Não use hashtags. Não invente nada além do cartão abaixo. Em português do Brasil.

${CONHECIMENTO}

Legenda do post: "${(legenda || '').slice(0, 200)}"
Comentário: "${comentario}"

Escreva só a resposta, sem aspas.`;
    const resp = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
      max_tokens: 90,
    });
    let txt = (resp.choices[0].message.content || '').trim().replace(/^["']|["']$/g, '');
    return txt.slice(0, 240) || 'Valeu pelo comentário! 🥋';
  } catch (e) {
    return 'Valeu demais pelo comentário! 🥋👊';
  }
}

async function buscarMedia(limite = 12) {
  const { data } = await axios.get(`${BASE}/${ACCT()}/media`, {
    params: { fields: 'id,caption,timestamp,comments_count', limit: limite, access_token: TOKEN() },
  });
  return (data.data || []).filter(m => (m.comments_count || 0) > 0);
}

async function buscarComentarios(mediaId) {
  const { data } = await axios.get(`${BASE}/${mediaId}/comments`, {
    params: {
      fields: 'id,text,username,timestamp,replies{id,username,text}',
      limit: 50,
      access_token: TOKEN(),
    },
  });
  return data.data || [];
}

async function postarResposta(commentId, mensagem) {
  await axios.post(`${BASE}/${commentId}/replies`, null, {
    params: { message: mensagem, access_token: TOKEN() },
  });
}

// Já respondemos esse comentário? (algum reply é da nossa conta)
function jaRespondido(comentario, nossoUser) {
  const replies = comentario.replies?.data || [];
  return replies.some(r => (r.username || '').toLowerCase() === nossoUser);
}

async function descobrirUsername() {
  try {
    const { data } = await axios.get(`${BASE}/${ACCT()}`, {
      params: { fields: 'username', access_token: TOKEN() },
    });
    return (data.username || 'jiujitsudinamicas').toLowerCase();
  } catch (e) {
    return 'jiujitsudinamicas';
  }
}

// Roda uma rodada de respostas. dryRun = só mostra o que responderia, sem postar.
async function responder({ limiteMedia = 12, maxRespostas = 20, diasJanela = 7, dryRun = false } = {}) {
  console.log(`[comentarios] Iniciando rodada de respostas${dryRun ? ' (MODO TESTE — não posta)' : ''}...`);
  const nossoUser = await descobrirUsername();
  const medias = await buscarMedia(limiteMedia);
  console.log(`[comentarios] ${medias.length} posts com comentários.`);

  const limite = Date.now() - diasJanela * 86400000;
  let respondidos = 0;
  const detalhes = [];

  for (const media of medias) {
    if (respondidos >= maxRespostas) break;
    let comentarios = [];
    try { comentarios = await buscarComentarios(media.id); }
    catch (e) { console.warn(`[comentarios] erro ao ler comentários do post ${media.id}: ${e.message}`); continue; }

    for (const c of comentarios) {
      if (respondidos >= maxRespostas) break;
      const user = (c.username || '').toLowerCase();
      if (!c.text) continue;
      if (user === nossoUser) continue;                       // não responde a si mesmo
      if (jaRespondido(c, nossoUser)) continue;               // já respondido
      if (c.timestamp && new Date(c.timestamp).getTime() < limite) continue; // fora da janela

      const msg = INTENCAO_COMPRA.test(c.text)
        ? respostaCompra(c.username)
        : await respostaIA(c.text, media.caption);

      try {
        if (!dryRun) await postarResposta(c.id, msg);
        respondidos++;
        detalhes.push({ post: media.id, de: c.username, comentario: c.text, resposta: msg });
        console.log(`[comentarios] ${dryRun ? '🔎 [teste] responderia' : '✅ respondeu'} @${c.username}: "${msg.slice(0, 60)}..."`);
      } catch (e) {
        console.warn(`[comentarios] falha ao responder comentário ${c.id}: ${e.response?.data?.error?.message || e.message}`);
      }
    }
  }

  console.log(`[comentarios] Rodada concluída — ${respondidos} respostas.`);
  return { respondidos, detalhes };
}

module.exports = { responder };

// Execução direta: node responder-comentarios.js
if (require.main === module) {
  responder().then(r => { console.log(JSON.stringify(r, null, 2)); }).catch(e => { console.error(e); process.exit(1); });
}
