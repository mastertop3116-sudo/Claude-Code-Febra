// Resolve o caminho do mascote 3D de jiu-jitsu (assets/mascotes) para usar nos posts.
// Versões -web são 820x820 transparentes (~400KB), ideais para compor via Puppeteer.
const path = require('path');
const fs   = require('fs');

// Sobe da pasta do pipeline até a raiz do repo e entra em assets/mascotes
const DIR = path.resolve(__dirname, '..', '..', '..', '..', '..', 'assets', 'mascotes');

const FAIXAS = ['branca', 'azul', 'roxa', 'marrom', 'preta', 'laranja', 'amarela', 'verde', 'vermelha', 'cinza'];

// Faixa "oficial" por estilo visual do post
const FAIXA_POR_ESTILO = {
  dark:    'preta',
  premium: 'preta',
  color:   'laranja',
};

// Todas as poses -web disponíveis de uma faixa: jj-laranja-web.png + jj-laranja-2-web.png...
function posesDaFaixa(faixa) {
  const lista = [];
  const principal = path.join(DIR, `jj-${faixa}-web.png`);
  if (fs.existsSync(principal)) lista.push(principal);
  for (let n = 2; n <= 9; n++) {
    const p = path.join(DIR, `jj-${faixa}-${n}-web.png`);
    if (fs.existsSync(p)) lista.push(p);
  }
  return lista;
}

// Escolhe uma pose da faixa (sorteia quando há mais de uma → variedade visual)
function caminho(faixa) {
  const poses = posesDaFaixa(faixa);
  if (!poses.length) return null;
  return poses[Math.floor(Math.random() * poses.length)];
}

// Retorna o mascote como data URI base64 (vai direto no src do <img>).
// É à prova de falha no Puppeteer (não depende de file:// nem de rede).
const _cache = {};
function urlMascote({ estilo, faixa } = {}) {
  const escolha = faixa || FAIXA_POR_ESTILO[estilo] || 'laranja';
  const c = caminho(escolha) || caminho('laranja') || caminho('preta');
  if (!c) return null;
  if (_cache[c]) return _cache[c];
  const b64 = fs.readFileSync(c).toString('base64');
  return (_cache[c] = `data:image/png;base64,${b64}`);
}

module.exports = { urlMascote, FAIXAS, FAIXA_POR_ESTILO, DIR };
