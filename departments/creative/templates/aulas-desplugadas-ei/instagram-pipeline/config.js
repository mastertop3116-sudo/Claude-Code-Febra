// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURAÇÕES DO PIPELINE — env vars têm prioridade (Render), fallback local
// ─────────────────────────────────────────────────────────────────────────────
const os   = require('os');
const path = require('path');

// outputDir: /tmp no Linux (Render), Downloads no Windows
const defaultOutputDir = process.platform === 'win32'
  ? 'C:\\Users\\Rodrigo Cruz\\Downloads\\instagram-posts'
  : path.join(os.tmpdir(), 'instagram-posts');

module.exports = {

  // ── INSTAGRAM GRAPH API ──────────────────────────────────────────────────
  instagram: {
    accessToken:  process.env.INSTAGRAM_ACCESS_TOKEN  || 'EAAodUhJRoXUBRnRqxA8ZAIJtOU94s8t0f4cg6ZBdPTgGhxrf3bEZBKjwMPWsHujVTZBi1GWDXPzrZAwZAy5fDQ9DDHbXppgiA46IYpkzJ7hnWaJ9TttZAZBuwhhYK6KqZBymusyMeesjLTHHr2mvzshDS3XhO6ilZAN4eodybxBE1B1vgepikiwypkVWZCXBJvL',
    accountId:    process.env.INSTAGRAM_ACCOUNT_ID    || '17841442922223376',
    appId:        process.env.INSTAGRAM_APP_ID        || '2846988098969973',
    appSecret:    process.env.INSTAGRAM_APP_SECRET    || '83fd013af3383e7891bb95f4359a8a91',
  },

  // ── CLOUDINARY (hospedagem de imagens) ──────────────────────────────────
  cloudinary: {
    cloudName:  process.env.CLOUDINARY_CLOUD_NAME  || 'dpzqkzyj9',
    apiKey:     process.env.CLOUDINARY_API_KEY     || '416524232429621',
    apiSecret:  process.env.CLOUDINARY_API_SECRET  || 'MEdpU-cPTaAmCpG3OgRl6-HiGMk',
  },

  // ── CONFIGURAÇÕES DE POSTAGEM ────────────────────────────────────────────
  posting: {
    horarioManha: process.env.IG_HORARIO_MANHA || '09:00',
    horarioNoite: process.env.IG_HORARIO_NOITE || '19:00',
    timezone:     'America/Sao_Paulo',
    outputDir:    process.env.IG_OUTPUT_DIR || defaultOutputDir,
    dryRun:       process.env.IG_DRY_RUN === 'true' ? true : false,
  },

  // ── CONTA / MARCA ─────────────────────────────────────────────────────────
  marca: {
    nome:     'Dinâmicas de Jiu-Jitsu',
    nicho:    'Jiu-Jitsu Infantil · BNCC',
    hashtags: [
      '#jiujitsu', '#jiujitsuinfantil', '#sensei',
      '#tatame', '#artesuave', '#jiujitsubrasil',
      '#jiujitsuparacrianças', '#academia', '#faixa',
      '#BNCC', '#educacaofisica', '#jiujitsulife',
    ],
  },

};
