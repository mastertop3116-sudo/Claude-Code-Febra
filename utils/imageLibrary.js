'use strict';

// ============================================================
// Image Library — Supabase Storage + Unsplash auto-populate
//
// Fluxo:
//   1. buscarImagemCapa(nicho) → verifica Supabase Storage
//   2. Se não tem → retorna null + dispara popularNicho() em bg
//   3. popularNicho() → Unsplash API → salva no Supabase
//   4. Próxima geração do mesmo nicho → já tem foto
// ============================================================

const https   = require('https');
const http    = require('http');
const { URL } = require('url');

const SUPABASE_URL      = process.env.SUPABASE_URL;
const SUPABASE_KEY      = process.env.SUPABASE_SERVICE_ROLE_KEY;
const UNSPLASH_KEY      = process.env.UNSPLASH_ACCESS_KEY; // opcional
const BUCKET            = 'criador-images';

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

function keywords(nicho, tema) {
  const slug = slugify(nicho);
  const temaSlug = slugify(tema || '');

  // Tenta match exato
  for (const [pt, en] of Object.entries(KEYWORDS_EN)) {
    if (slug.includes(pt) || temaSlug.includes(pt)) return en;
  }

  // Fallback: usa o próprio texto (Unsplash entende inglês melhor)
  const raw = [nicho, tema].filter(Boolean).join(' ');
  return encodeURIComponent(raw);
}

// ── HTTP helper genérico ─────────────────────────────────────
function httpGet(urlStr, headers = {}) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(urlStr);
    const lib = parsed.protocol === 'https:' ? https : http;
    const opts = {
      hostname: parsed.hostname,
      path:     parsed.pathname + parsed.search,
      headers:  { 'User-Agent': 'MAX-Criador/1.0', ...headers },
    };
    lib.get(opts, res => {
      // Seguir redirect
      if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307) {
        return httpGet(res.headers.location, headers).then(resolve).catch(reject);
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end',  () => resolve({ status: res.statusCode, body: Buffer.concat(chunks), headers: res.headers }));
    }).on('error', reject);
  });
}

// ── Supabase Storage helpers ─────────────────────────────────
async function listarFotos(nichoSlug) {
  const url = `${SUPABASE_URL}/storage/v1/object/list/${BUCKET}`;
  const body = JSON.stringify({ prefix: `nichos/${nichoSlug}/`, limit: 20 });
  return new Promise((resolve) => {
    const parsed = new URL(url);
    const opts = {
      hostname: parsed.hostname,
      path:     parsed.pathname,
      method:   'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'apikey':        SUPABASE_KEY,
        'Content-Length': Buffer.byteLength(body),
      },
    };
    const req = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve(JSON.parse(d)); } catch { resolve([]); }
      });
    });
    req.on('error', () => resolve([]));
    req.write(body);
    req.end();
  });
}

async function uploadFoto(nichoSlug, filename, buffer, mimeType) {
  const path = `nichos/${nichoSlug}/${filename}`;
  const url  = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`;
  return new Promise((resolve) => {
    const parsed = new URL(url);
    const opts = {
      hostname: parsed.hostname,
      path:     parsed.pathname,
      method:   'POST',
      headers: {
        'Content-Type':  mimeType || 'image/jpeg',
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'apikey':        SUPABASE_KEY,
        'Content-Length': buffer.length,
        'x-upsert':      'false',
      },
    };
    const req = https.request(opts, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve(res.statusCode < 300));
    });
    req.on('error', () => resolve(false));
    req.write(buffer);
    req.end();
  });
}

function getPublicUrl(nichoSlug, filename) {
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/nichos/${nichoSlug}/${filename}`;
}

// ── Buscar foto no Supabase ──────────────────────────────────
async function buscarImagemCapa(nicho) {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;
  try {
    const slug  = slugify(nicho);
    const files = await listarFotos(slug);
    if (!Array.isArray(files) || files.length === 0) return null;

    // Escolhe aleatoriamente entre as disponíveis
    const fotos  = files.filter(f => f.name && f.name !== '.emptyFolderPlaceholder');
    if (!fotos.length) return null;
    const escolha = fotos[Math.floor(Math.random() * fotos.length)];
    const url = getPublicUrl(slug, escolha.name);

    // Converte para base64 (embedding inline no HTML → Puppeteer não precisa de rede)
    const { status, body, headers: h } = await httpGet(url);
    if (status !== 200) return null;
    const mime = h['content-type'] || 'image/jpeg';
    return `data:${mime};base64,${body.toString('base64')}`;
  } catch (e) {
    console.error('[imageLibrary] buscarImagemCapa:', e.message);
    return null;
  }
}

// ── Popular nicho via Unsplash (fire and forget) ─────────────
async function popularNicho(nicho, tema) {
  if (!UNSPLASH_KEY) {
    // Sem chave: silencia, tenta de novo quando a chave for adicionada
    return;
  }
  try {
    const slug = slugify(nicho);
    const kw   = keywords(nicho, tema);

    // Checar se já tem fotos (evitar duplicar)
    const existentes = await listarFotos(slug);
    const fotos = Array.isArray(existentes) ? existentes.filter(f => f.name && f.name !== '.emptyFolderPlaceholder') : [];
    if (fotos.length >= 3) return; // já tem suficiente

    const qtd = 5 - fotos.length;
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
        if (s !== 200) continue;
        const mime = h['content-type'] || 'image/jpeg';
        const ext  = mime.includes('png') ? 'png' : 'jpg';
        const nome = `${Date.now()}-${salvos}.${ext}`;
        const ok   = await uploadFoto(slug, nome, imgBuffer, mime);
        if (ok) salvos++;
      } catch (_) {}
    }
    if (salvos > 0) console.log(`[imageLibrary] ${salvos} fotos salvas para nicho: ${nicho}`);
  } catch (e) {
    console.error('[imageLibrary] popularNicho:', e.message);
  }
}

module.exports = { buscarImagemCapa, popularNicho, slugify };
