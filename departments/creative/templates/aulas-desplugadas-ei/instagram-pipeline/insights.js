// Coleta métricas dos posts via Instagram Graph API
// Salva no Supabase e retorna os top performers para alimentar a IA

const axios        = require('axios');
const { createClient } = require('@supabase/supabase-js');
const config       = require('./config');

const BASE = 'https://graph.facebook.com/v19.0';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Busca os últimos N posts da conta
async function buscarPosts(limite = 20) {
  const { data } = await axios.get(`${BASE}/${config.instagram.accountId}/media`, {
    params: {
      fields:       'id,caption,media_type,timestamp,like_count,comments_count',
      limit:        limite,
      access_token: config.instagram.accessToken,
    },
  });
  return data.data || [];
}

// Busca insights de um post específico (reach, saved, impressions)
async function buscarInsightsPost(mediaId, mediaType) {
  const metrics = mediaType === 'CAROUSEL_ALBUM'
    ? 'reach,saved,impressions,follows,profile_visits'
    : 'reach,saved,impressions,follows,profile_visits';

  try {
    const { data } = await axios.get(`${BASE}/${mediaId}/insights`, {
      params: {
        metric:       metrics,
        access_token: config.instagram.accessToken,
      },
    });
    const resultado = {};
    (data.data || []).forEach(m => { resultado[m.name] = m.values?.[0]?.value ?? m.value ?? 0; });
    return resultado;
  } catch (e) {
    // Permissão não concedida ou post muito antigo
    return { reach: 0, saved: 0, impressions: 0, follows: 0, profile_visits: 0 };
  }
}

// Calcula score de engajamento ponderado
function calcularScore(post) {
  const likes    = post.like_count     || 0;
  const comments = post.comments_count || 0;
  const saved    = post.saved          || 0;
  const reach    = post.reach          || 1;
  // Salva vale 3x (intenção alta), comentário vale 2x, curtida vale 1x
  return ((likes * 1) + (comments * 2) + (saved * 3)) / reach * 100;
}

// Extrai tema/tipo do caption para dar ao GPT contexto de o que funcionou
function extrairTema(caption = '') {
  const linhas = caption.split('\n').filter(l => l.trim());
  return linhas[0]?.slice(0, 120) || '';
}

// Coleta métricas de todos os posts recentes e salva no Supabase
async function coletarEsalvar() {
  console.log('[insights] Coletando métricas dos posts...');
  const posts = await buscarPosts(20);
  console.log(`[insights] ${posts.length} posts encontrados.`);

  const registros = [];

  for (const post of posts) {
    const ins = await buscarInsightsPost(post.id, post.media_type);
    const score = calcularScore({ ...post, ...ins });

    registros.push({
      post_id:       post.id,
      media_type:    post.media_type,
      timestamp:     post.timestamp,
      like_count:    post.like_count    || 0,
      comments:      post.comments_count || 0,
      reach:         ins.reach          || 0,
      saved:         ins.saved          || 0,
      impressions:   ins.impressions    || 0,
      follows:       ins.follows        || 0,
      engagement_score: parseFloat(score.toFixed(4)),
      tema:          extrairTema(post.caption),
      updated_at:    new Date().toISOString(),
    });
  }

  // Upsert no Supabase (cria tabela se não existir via seed)
  const { error } = await supabase
    .from('ig_post_insights')
    .upsert(registros, { onConflict: 'post_id' });

  if (error) throw new Error(`Supabase upsert error: ${error.message}`);

  console.log(`[insights] ${registros.length} registros salvos.`);
  return registros;
}

// Retorna os top N posts por score para alimentar a IA
async function buscarTopPerformers(limite = 5) {
  const { data, error } = await supabase
    .from('ig_post_insights')
    .select('media_type, tema, like_count, comments, saved, reach, engagement_score')
    .order('engagement_score', { ascending: false })
    .limit(limite);

  if (error) throw new Error(`Supabase query error: ${error.message}`);
  return data || [];
}

// Resumo legível para passar como contexto ao GPT
function formatarContextoIA(topPosts) {
  if (!topPosts.length) return '';

  const linhas = topPosts.map((p, i) => {
    const tipo = p.media_type === 'CAROUSEL_ALBUM' ? 'carrossel' : 'post único';
    return `${i + 1}. [${tipo}] Score ${p.engagement_score} — ${p.tema.slice(0, 80)}`;
  });

  return `\n\nCONTEXTO DE PERFORMANCE (posts que mais engajaram recentemente):\n${linhas.join('\n')}\nUse esses temas e formatos como inspiração, mas crie algo novo e diferente.`;
}

module.exports = { coletarEsalvar, buscarTopPerformers, formatarContextoIA };
