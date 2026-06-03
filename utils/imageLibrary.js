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
const fs      = require('fs');
const path    = require('path');
const { URL } = require('url');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const UNSPLASH_KEY = process.env.UNSPLASH_ACCESS_KEY;
const PEXELS_KEY   = process.env.PEXELS_API_KEY;   // 2ª fonte grátis (opcional)
const BUCKET       = 'criador-images';

// Cache LOCAL de imagens baixadas/criadas, por tema — alimenta o Catálogo do site
// e faz o próximo documento do mesmo tema "já nascer com imagem".
const AUTO_DIR = path.join(__dirname, '..', 'assets', 'catalogo-auto');

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
  'jiu':           'brazilian jiu jitsu martial arts gi',
  'jitsu':         'brazilian jiu jitsu martial arts gi',
  'bjj':           'brazilian jiu jitsu grappling',
  'tatame':        'jiu jitsu martial arts mat training',
  'luta':          'martial arts fighting training',
  'judo':          'judo martial arts throw',
  'karate':        'karate martial arts kick',
  'capoeira':      'capoeira brazilian martial art',
  'marcial':       'martial arts training dojo',
  'esporte':       'sport athletic training competition',
  'fotografia':    'photography camera creative studio',
  'design':        'design creative graphic art',
  'tecnologia':    'technology laptop code digital',
  'negocios':      'business office meeting professional',
  'empreendedor':  'entrepreneur startup office success',
  'vendas':        'sales business success handshake',
};

const NICHO_KIDS = /(infantil|crian|kids|pequenos|filho|maternal|creche)/;
function keywordsEn(nicho, tema) {
  const slug     = slugify(nicho);
  const temaSlug = slugify(tema || '');
  // Escolhe o termo que aparece MAIS CEDO no nicho (o ASSUNTO vem primeiro:
  // "jiu-jitsu infantil para professores" → assunto é jiu-jitsu, não professor).
  let best = null, bestPos = Infinity;
  for (const [pt, en] of Object.entries(KEYWORDS_EN)) {
    const pn = slug.indexOf(pt);
    const pt2 = temaSlug.indexOf(pt);
    const pos = pn >= 0 ? pn : (pt2 >= 0 ? 1000 + pt2 : -1);
    if (pos >= 0 && pos < bestPos) { bestPos = pos; best = en; }
  }
  let kw = best || [nicho, tema].filter(Boolean).join(' ');
  // Nicho infantil → foca em crianças (evita foto de adulto fora de contexto).
  if (NICHO_KIDS.test(slug + ' ' + temaSlug) && !/kids|children/.test(kw)) kw += ' kids children';
  return kw;
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
// timeoutMs: corta a conexão se demorar — assim a geração NUNCA trava esperando imagem.
function httpGet(urlStr, headers = {}, timeoutMs = 9000) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(urlStr);
    const lib    = parsed.protocol === 'https:' ? https : http;
    const opts   = {
      hostname: parsed.hostname,
      path:     parsed.pathname + parsed.search,
      headers:  { 'User-Agent': 'MAX-Criador/1.0', ...headers },
    };
    const req = lib.get(opts, res => {
      if ([301, 302, 307, 308].includes(res.statusCode)) {
        return httpGet(res.headers.location, headers, timeoutMs).then(resolve).catch(reject);
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end',  () => resolve({
        status:  res.statusCode,
        body:    Buffer.concat(chunks),
        headers: res.headers,
      }));
    });
    req.on('error', reject);
    req.setTimeout(timeoutMs, () => { req.destroy(new Error('timeout')); });
  });
}

// ── Buscar foto no Supabase Storage (SDK) ───────────────────
async function buscarImagemCapa(nicho) {
  try {
    // 1º) CATÁLOGO local — reusa uma imagem que A GENTE já criou (nunca desperdiçar).
    try {
      const { buscarLocal } = require('./catalogoImagens');
      const local = buscarLocal(nicho, { transparente: false });
      if (local) {
        console.log(`[imageLibrary] usando imagem do CATÁLOGO local: ${local.item.arquivo} (nicho ${local.item.nicho})`);
        return local.dataUri;
      }
    } catch (e) { /* catálogo é opcional — segue pro Supabase */ }

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

// ── Cache LOCAL (assets/catalogo-auto/<slug>/) ──────────────
function salvarLocal(slug, buffer, ext, origem) {
  try {
    const dir = path.join(AUTO_DIR, slug);
    fs.mkdirSync(dir, { recursive: true });
    const nome = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext || 'jpg'}`;
    fs.writeFileSync(path.join(dir, nome), buffer);
    // marca a origem (banco grátis x IA) num arquivinho ao lado, pro catálogo mostrar
    try { fs.writeFileSync(path.join(dir, '.origem'), origem || 'banco'); } catch (_) {}
    return path.join(dir, nome);
  } catch (_) { return null; }
}
function buscarLocalAuto(slug) {
  try {
    const dir = path.join(AUTO_DIR, slug);
    if (!fs.existsSync(dir)) return null;
    const fotos = fs.readdirSync(dir).filter(f => /\.(jpe?g|png|webp)$/i.test(f));
    if (!fotos.length) return null;
    const esc = fotos[Math.floor(Math.random() * fotos.length)];
    const buf = fs.readFileSync(path.join(dir, esc));
    const ext = path.extname(esc).slice(1).toLowerCase();
    const mime = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
    return `data:${mime};base64,${buf.toString('base64')}`;
  } catch (_) { return null; }
}

// ── Uma foto de banco GRÁTIS (sem custo): Unsplash → Pexels ──
async function fetchBancoGratis(nicho, tema) {
  const kw = keywordsEn(nicho, tema);
  // 1) Unsplash (se tiver chave)
  if (UNSPLASH_KEY) {
    try {
      const apiUrl = `https://api.unsplash.com/photos/random?query=${encodeURIComponent(kw)}&orientation=portrait`;
      const { status, body } = await httpGet(apiUrl, { 'Authorization': `Client-ID ${UNSPLASH_KEY}`, 'Accept-Version': 'v1' }, 8000);
      if (status === 200) {
        const j = JSON.parse(body.toString());
        const url = j?.urls?.regular || j?.urls?.small;
        if (url) { const img = await httpGet(url, {}, 9000); if (img.status === 200 && img.body.length) return { buffer: img.body, mime: img.headers['content-type'] || 'image/jpeg', origem: 'unsplash' }; }
      }
    } catch (_) {}
  }
  // 2) Pexels (se tiver chave) — 2ª fonte grátis
  if (PEXELS_KEY) {
    try {
      const apiUrl = `https://api.pexels.com/v1/search?query=${encodeURIComponent(kw)}&orientation=portrait&per_page=10`;
      const { status, body } = await httpGet(apiUrl, { 'Authorization': PEXELS_KEY }, 8000);
      if (status === 200) {
        const j = JSON.parse(body.toString());
        const arr = (j && j.photos) || [];
        if (arr.length) {
          const p = arr[Math.floor(Math.random() * arr.length)];
          const url = p?.src?.large || p?.src?.medium || p?.src?.original;
          if (url) { const img = await httpGet(url, {}, 9000); if (img.status === 200 && img.body.length) return { buffer: img.body, mime: 'image/jpeg', origem: 'pexels' }; }
        }
      }
    } catch (_) {}
  }
  // 3) Openverse (imagens Creative Commons, SEM CHAVE NENHUMA) — funciona em qualquer
  // servidor, mesmo sem Unsplash/Pexels configurados. É o que garante foto no ar.
  try {
    const apiUrl = `https://api.openverse.org/v1/images/?q=${encodeURIComponent(kw)}&page_size=8&mature=false`;
    const { status, body } = await httpGet(apiUrl, { 'Accept': 'application/json' }, 8000);
    if (status === 200) {
      const arr = (JSON.parse(body.toString()).results || []);
      for (const cand of arr.slice(0, 4)) {   // tenta algumas (URL às vezes está fora do ar)
        const url = cand && cand.url;
        if (!url) continue;
        try {
          const img = await httpGet(url, {}, 9000);
          const mime = (img.headers['content-type'] || 'image/jpeg').split(';')[0];
          if (img.status === 200 && img.body.length > 3000 && /image\/(jpe?g|png|webp)/.test(mime)) {
            return { buffer: img.body, mime, origem: 'openverse' };
          }
        } catch (_) {}
      }
    }
  } catch (_) {}
  return null;
}

// ── GARANTE uma imagem de capa pro tema, "nascendo com imagem" ──
// Ordem: catálogo nosso (mascotes/natação) → cache local → Supabase →
//        baixa 1 de banco grátis AGORA (com timeout) e guarda pra próxima vez.
// Se tudo falhar, devolve null e o template usa a ilustração SVG. NUNCA trava.
async function garantirImagemCapa(nicho, tema) {
  // 1) o que já temos (rápido, sem rede)
  const jaTem = await buscarImagemCapa(nicho).catch(() => null);
  if (jaTem) return jaTem;
  const slug = slugify(nicho);
  const local = buscarLocalAuto(slug);
  if (local) return local;

  // 2) não temos nada → baixa 1 de banco grátis AGORA (custo zero)
  try {
    const foto = await fetchBancoGratis(nicho, tema);
    if (foto && foto.buffer && foto.buffer.length) {
      const ext = (foto.mime || '').includes('png') ? 'png' : 'jpg';
      salvarLocal(slug, foto.buffer, ext, foto.origem);          // alimenta o catálogo + reuso local
      try { await salvarNoSupabase(slug, foto.buffer, foto.mime); } catch (_) {} // persiste entre publicações
      // em background, busca mais algumas pra encher o tema
      popularNicho(nicho, tema).catch(() => {});
      return `data:${foto.mime || 'image/jpeg'};base64,${foto.buffer.toString('base64')}`;
    }
  } catch (_) {}
  // 3) ainda assim tenta encher em background pra próxima geração já ter
  popularNicho(nicho, tema).catch(() => {});
  return null;
}

// salva um buffer no Supabase Storage (persistência entre deploys)
async function salvarNoSupabase(slug, buffer, mime) {
  const supa = getSupa();
  if (!supa) return;
  const ext = (mime || '').includes('png') ? 'png' : 'jpg';
  const nome = `${Date.now()}-${Math.random().toString(36).slice(2, 5)}.${ext}`;
  try { await supa.storage.from(BUCKET).upload(`nichos/${slug}/${nome}`, buffer, { contentType: mime || 'image/jpeg', upsert: false }); } catch (_) {}
}

// ── (OPCIONAL, TEM CUSTO) Cria a imagem com a nossa IA no estilo 3D cartoon ──
// Só roda quando explicitamente pedido (gasta dinheiro). Guarda no catálogo pra reusar.
async function gerarImagemIA(nicho, tema) {
  try {
    const { openaiImage } = require('../integrations/openai');
    const assunto = [tema, nicho].filter(Boolean).join(', ');
    const prompt = `A cute 3D rendered cartoon illustration, Pixar/Disney style, glossy soft lighting, about "${assunto}". Friendly, colorful, centered composition, plain soft solid background, no text, no words, high quality render.`;
    const buf = await openaiImage(prompt, '1024x1024', 'high');
    if (buf && buf.length) {
      const slug = slugify(nicho);
      salvarLocal(slug, buf, 'png', 'ia');
      try { await salvarNoSupabase(slug, buf, 'image/png'); } catch (_) {}
      return 'data:image/png;base64,' + buf.toString('base64');
    }
  } catch (e) { console.warn('[imageLibrary] gerarImagemIA falhou:', e.message); }
  return null;
}

module.exports = { buscarImagemCapa, popularNicho, slugify, garantirImagemCapa, gerarImagemIA, buscarLocalAuto, AUTO_DIR };
