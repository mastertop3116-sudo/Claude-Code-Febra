'use strict';

// ============================================================
// Image Library — Supabase Storage + Unsplash auto-populate
//
// Fluxo:
//   1. buscarImagemCapa(nicho) → Supabase Storage (SDK)
//   2. Se não tem → retorna null + dispara popularNicho() em bg
//   3. popularNicho() → Unsplash API → salva no Supabase
//   4. Próxima geração do mesmo nicho → já tem foto
// ============================================================

const https   = require('https');
const http    = require('http');
const { URL } = require('url');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const UNSPLASH_KEY = process.env.UNSPLASH_ACCESS_KEY;
const BUCKET       = 'criador-images';

// ── Normaliza nicho para slug de pasta ──────────────────────
function slugify(texto) {
  return (texto || '')
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 60);
}

// ── Tradução PT → EN para busca no Unsplash ─────────────────
const KEYWORDS_EN = {
  'emagrecimento': 'weight loss fitness healthy body',
  'fitness':       'fitness workout gym exercise',
  'saude':         'health wellness healthy lifestyle',
  'nutricao':      'nutrition healthy food diet',
  'marketing':     'digital marketing social media content creator',
  'trafego':       'digital marketing instagram ads',
  'copywriting':   'marketing copywriting laptop coffee',
  'financas':      'finance money savings investment',
  'dinheiro':      'money finance wealth',
  'renda':         'passive income money laptop',
  'investimento':  'investment stock market finance',
  'beleza':        'beauty makeup skincare woman',
  'cabelo':        'hair beauty salon woman',
  'skincare':      'skincare beauty face woman',
  'moda':          'fashion style outfit woman',
  'sono':          'sleep bedroom night relaxation',
  'meditacao':     'meditation mindfulness yoga zen',
  'bem-estar':     'wellness relaxation nature peace',
  'yoga':          'yoga meditation flexible woman',
  'espiritualidade':'spirituality faith meditation light',
  'crista':        'faith christian bible prayer',
  'devocional':    'faith prayer devotional light',
  'desenvolvimento':'personal growth mindset motivation',
  'mindset':       'mindset motivation success goal',
  'habitos':       'habits routine morning productive',
  'relacionamento':'couple love relationship happy',
  'familia':       'family happy home love',
  'educacao':      'education learning students classroom',
  'professor':     'teacher classroom education school',
  'crianca':       'children kids learning fun',
  'enem':          'study books student desk',
  'concurso':      'study books notebook pen',
  'produtividade': 'productivity workspace laptop planner',
  'organizacao':   'organized planner desk workspace',
  'culinaria':     'cooking kitchen food chef',
  'confeitaria':   'pastry cake baking dessert',
  'receita':       'food cooking recipe kitchen',
  'artesanato':    'handmade craft sewing creative',
  'croche':        'crochet handmade yarn craft',
  'pet':           'dog cat pet happy',
  'cachorro':      'dog puppy cute happy',
  'gato':          'cat kitten cute',
  'jiu':           'martial arts fight training',
  'esporte':       'sport athletic training competition',
  'fotografia':    'photography camera creative studio',
  'design':        'design creative graphic art',
  'tecnologia':    'technology laptop code digital',
  'negocios':      'business office meeting professional',
  'empreendedor':  'entrepreneur startup office success',
  'vendas':        'sales business success handshake',
};

function keywordsEn(nicho, tema) {
  const slug     = slugify(nicho);
  const temaSlug = slugify(tema || '');
  for (const [pt, en] of Object.entries(KEYWORDS_EN)) {
    if (slug.includes(pt) || temaSlug.includes(pt)) return en;
  }
  return [nicho, tema].filter(Boolean).join(' ');
}

// ── Supabase client lazy ─────────────────────────────────────
let _supa = null;
function getSupa() {
  if (_supa) return _supa;
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;
  const { createClient } = require('@supabase/supabase-js');
  _supa = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false },
  });
  return _supa;
}

// ── HTTP helper (para Unsplash e download de imagens) ────────
function httpGet(urlStr, headers = {}) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(urlStr);
    const lib    = parsed.protocol === 'https:' ? https : http;
    const opts   = {
      hostname: parsed.hostname,
      path:     parsed.pathname + parsed.search,
      headers:  { 'User-Agent': 'MAX-Criador/1.0', ...headers },
    };
    lib.get(opts, res => {
      if ([301, 302, 307, 308].includes(res.statusCode)) {
        return httpGet(res.headers.location, headers).then(resolve).catch(reject);
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end',  () => resolve({
        status:  res.statusCode,
        body:    Buffer.concat(chunks),
        headers: res.headers,
      }));
    }).on('error', reject);
  });
}

// ── Buscar foto no Supabase Storage (SDK) ───────────────────
async function buscarImagemCapa(nicho) {
  try {
    const supa = getSupa();
    if (!supa) {
      console.log('[imageLibrary] getSupa() null — SUPABASE_URL:', !!process.env.SUPABASE_URL, 'KEY:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
      return null;
    }

    const slug = slugify(nicho);
    console.log(`[imageLibrary] buscando nicho="${nicho}" slug="${slug}"`);

    const { data: files, error } = await supa.storage
      .from(BUCKET)
      .list(`nichos/${slug}`, { limit: 20, sortBy: { column: 'name', order: 'asc' } });

    if (error) {
      console.log(`[imageLibrary] erro ao listar: ${error.message}`);
      return null;
    }
    if (!files || files.length === 0) {
      console.log(`[imageLibrary] pasta vazia ou inexistente: nichos/${slug}`);
      return null;
    }

    const fotos = files.filter(f => f.name && !f.name.startsWith('.'));
    console.log(`[imageLibrary] ${fotos.length} foto(s) encontrada(s) para ${slug}`);
    if (!fotos.length) return null;

    // Escolhe aleatoriamente
    const escolha = fotos[Math.floor(Math.random() * fotos.length)];
    const { data: urlData } = supa.storage
      .from(BUCKET)
      .getPublicUrl(`nichos/${slug}/${escolha.name}`);

    const publicUrl = urlData?.publicUrl;
    if (!publicUrl) {
      console.log('[imageLibrary] publicUrl nulo');
      return null;
    }

    // Converte para base64 inline (Puppeteer não precisa de rede)
    const { status, body, headers: h } = await httpGet(publicUrl);
    if (status !== 200 || !body.length) {
      console.log(`[imageLibrary] download falhou: status=${status} size=${body?.length}`);
      return null;
    }

    const mime = h['content-type'] || 'image/jpeg';
    console.log(`[imageLibrary] foto carregada: ${escolha.name} (${body.length} bytes)`);
    return `data:${mime};base64,${body.toString('base64')}`;

  } catch (e) {
    console.error('[imageLibrary] buscarImagemCapa:', e.message);
    return null;
  }
}

// ── Popular nicho via Unsplash (background) ─────────────────
async function popularNicho(nicho, tema) {
  if (!UNSPLASH_KEY) return;
  try {
    const supa = getSupa();
    if (!supa) return;

    const slug = slugify(nicho);

    // Verificar quantas fotos já tem
    const { data: existentes } = await supa.storage
      .from(BUCKET)
      .list(`nichos/${slug}`, { limit: 20 });

    const qtdAtual = (existentes || []).filter(f => f.name && !f.name.startsWith('.')).length;
    if (qtdAtual >= 3) return; // já tem suficiente

    const qtd = Math.min(5 - qtdAtual, 5);
    const kw  = keywordsEn(nicho, tema);
    const apiUrl = `https://api.unsplash.com/photos/random?query=${encodeURIComponent(kw)}&count=${qtd}&orientation=portrait`;

    const { status, body } = await httpGet(apiUrl, {
      'Authorization': `Client-ID ${UNSPLASH_KEY}`,
      'Accept-Version': 'v1',
    });

    if (status !== 200) return;
    const resultados = JSON.parse(body.toString());
    if (!Array.isArray(resultados)) return;

    let salvos = 0;
    for (const foto of resultados) {
      try {
        const imgUrl = foto.urls?.regular || foto.urls?.small;
        if (!imgUrl) continue;

        const { status: s, body: imgBuffer, headers: h } = await httpGet(imgUrl);
        if (s !== 200 || !imgBuffer.length) continue;

        const mime = h['content-type'] || 'image/jpeg';
        const ext  = mime.includes('png') ? 'png' : 'jpg';
        const nome = `${Date.now()}-${salvos}.${ext}`;

        const { error } = await supa.storage
          .from(BUCKET)
          .upload(`nichos/${slug}/${nome}`, imgBuffer, {
            contentType: mime,
            upsert: false,
          });

        if (!error) salvos++;
      } catch (_) {}
    }

    if (salvos > 0) {
      console.log(`[imageLibrary] ${salvos} foto(s) salva(s) para nicho: ${nicho}`);
    }
  } catch (e) {
    console.error('[imageLibrary] popularNicho:', e.message);
  }
}

module.exports = { buscarImagemCapa, popularNicho, slugify };
