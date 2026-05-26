// Seleciona fundo 3D cartoon do cache (Cloudinary) por tipo de post
// Cache gerado por gerar-fundos-cache.js

const fs   = require('fs');
const path = require('path');
const https = require('https');
const http  = require('http');

const CACHE_PATH   = path.join(__dirname, 'fundos-cache.json');
const TIPOS_NOITE  = ['motivacional', 'dica', 'motivacional', 'engajamento', 'dica', 'motivacional', 'engajamento'];

function carregarCache() {
  if (!fs.existsSync(CACHE_PATH)) return null;
  try { return JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8')); }
  catch (e) { return null; }
}

function escolherUrlAleatoria(cache, tipo) {
  const lista = cache[tipo];
  if (!lista || !lista.length) return null;
  return lista[Math.floor(Math.random() * lista.length)];
}

function baixarComoBase64(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    lib.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return baixarComoBase64(res.headers.location).then(resolve).catch(reject);
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks).toString('base64')));
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function gerarFundo(tipo) {
  const cache = carregarCache();
  if (!cache) throw new Error('Cache de fundos não encontrado. Execute /instagram-gerar-fundos primeiro.');

  const url = escolherUrlAleatoria(cache, tipo);
  if (!url) throw new Error(`Nenhum fundo disponível para tipo: ${tipo}`);

  console.log(`[bg] Usando fundo do cache para tipo "${tipo}": ${url.slice(0, 60)}...`);
  const base64 = await baixarComoBase64(url);
  console.log(`[bg] Fundo carregado (${Math.round(base64.length / 1024)}KB).`);
  return base64;
}

module.exports = { gerarFundo, TIPOS_NOITE };
