'use strict';
// ============================================================
// LOGIN / USUÁRIOS — autenticação simples e segura pro Criador.
// Sem bibliotecas novas: usa só o 'crypto' nativo do Node.
//
// - Senhas guardadas com hash (scrypt + salt), nunca em texto puro.
// - Sessão = cookie assinado (HMAC). Sobrevive a reinício do servidor.
// - 2 papéis: 'admin' (Rodrigo, permissão avançada) e 'usuario' (Bruno).
// - Usuários ficam em data/usuarios.json; se não existir, cria do zero
//   com Rodrigo (admin) e Bruno (usuario). Senhas iniciais via env
//   (RODRIGO_SENHA / BRUNO_SENHA) ou o padrão abaixo — TROCAR depois.
// ============================================================
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'usuarios.json');
const SECRET = process.env.SESSION_SECRET || 'max-criador-segredo-troque-em-producao-2026';
const COOKIE = 'max_sessao';
const VALIDADE_DIAS = 30;

// ── hash de senha (scrypt) ──────────────────────────────────
function hashSenha(senha, salt = crypto.randomBytes(16).toString('hex')) {
  const dk = crypto.scryptSync(String(senha), salt, 64).toString('hex');
  return { salt, hash: dk };
}
function conferirSenha(senha, salt, hash) {
  try {
    const dk = crypto.scryptSync(String(senha), salt, 64).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(dk), Buffer.from(hash));
  } catch (_) { return false; }
}

// ── usuários (arquivo) ──────────────────────────────────────
function lerUsuarios() {
  try { return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8')); } catch (_) { return null; }
}
function salvarUsuarios(lista) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(USERS_FILE, JSON.stringify(lista, null, 2));
}
function novoUsuario(nome, login, senha, papel) {
  const { salt, hash } = hashSenha(senha);
  return {
    id: crypto.randomBytes(6).toString('hex'),
    nome, login: login.toLowerCase().trim(), papel, salt, hash,
    // permissões — estrutura pronta; Rodrigo detalha depois.
    permissoes: papel === 'admin'
      ? { criar: true, atividades: true, matematica: true, usarOpus: true, gerenciarUsuarios: true, verCustos: true }
      : { criar: true, atividades: true, matematica: true, usarOpus: false, gerenciarUsuarios: false, verCustos: false },
    criadoEm: new Date().toISOString().slice(0, 10),
  };
}
function semeie() {
  const lista = [
    novoUsuario('Rodrigo', 'rodrigo', process.env.RODRIGO_SENHA || 'rodrigo123', 'admin'),
    novoUsuario('Bruno',   'bruno',   process.env.BRUNO_SENHA   || 'bruno123',   'usuario'),
  ];
  salvarUsuarios(lista);
  return lista;
}
function usuarios() { return lerUsuarios() || semeie(); }
function acharPorLogin(login) {
  return usuarios().find(u => u.login === String(login || '').toLowerCase().trim());
}
function acharPorId(id) { return usuarios().find(u => u.id === id); }

// ── sessão (cookie assinado, stateless) ─────────────────────
function assinar(payloadStr) {
  return crypto.createHmac('sha256', SECRET).update(payloadStr).digest('base64url');
}
function criarToken(userId) {
  const payload = Buffer.from(JSON.stringify({ uid: userId, exp: Date.now() + VALIDADE_DIAS * 864e5 })).toString('base64url');
  return `${payload}.${assinar(payload)}`;
}
function lerToken(token) {
  if (!token || !token.includes('.')) return null;
  const [payload, sig] = token.split('.');
  if (assinar(payload) !== sig) return null;
  try {
    const dados = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (!dados.exp || dados.exp < Date.now()) return null;
    return acharPorId(dados.uid) || null;
  } catch (_) { return null; }
}
function lerCookie(req, nome) {
  const raw = req.headers.cookie || '';
  for (const par of raw.split(';')) {
    const i = par.indexOf('=');
    if (i > -1 && par.slice(0, i).trim() === nome) return decodeURIComponent(par.slice(i + 1));
  }
  return null;
}
function setCookieSessao(res, token) {
  const partes = [`${COOKIE}=${token}`, 'HttpOnly', 'Path=/', 'SameSite=Lax', `Max-Age=${VALIDADE_DIAS * 86400}`];
  if (process.env.NODE_ENV === 'production') partes.push('Secure');
  res.setHeader('Set-Cookie', partes.join('; '));
}
function limparCookie(res) {
  res.setHeader('Set-Cookie', `${COOKIE}=; HttpOnly; Path=/; Max-Age=0`);
}

// ── LIMITE DE USO DO OPUS (porque o Opus tem custo REAL) ────
// admin (Rodrigo) = ilimitado (-1). Demais (Bruno) = 3 criações no Opus.
function limiteOpus(u) {
  if (u && typeof u.limiteOpus === 'number') return u.limiteOpus; // override por usuário (Rodrigo ajusta depois)
  return u && u.papel === 'admin' ? -1 : 3;
}
function opusInfo(u) {
  const lim = limiteOpus(u), usado = (u && u.opusUsado) || 0;
  return { ilimitado: lim < 0, limite: lim, usado, restantes: lim < 0 ? null : Math.max(0, lim - usado) };
}
// "gasta" 1 crédito de Opus do usuário (server-side, não dá pra burlar)
function consumirOpus(userId) {
  const lista = usuarios();
  const u = lista.find(x => x.id === userId);
  if (!u) return { ok: false, error: 'usuário não encontrado' };
  const lim = limiteOpus(u);
  if (lim < 0) return { ok: true, ilimitado: true };
  const usado = u.opusUsado || 0;
  if (usado >= lim) return { ok: false, esgotado: true, limite: lim, usado };
  u.opusUsado = usado + 1;
  salvarUsuarios(lista);
  return { ok: true, limite: lim, usado: u.opusUsado, restantes: lim - u.opusUsado };
}

// ── usuário "público" (sem segredos) ────────────────────────
function publico(u) {
  return u && { id: u.id, nome: u.nome, login: u.login, papel: u.papel, permissoes: u.permissoes, opus: opusInfo(u) };
}

// ── middlewares ─────────────────────────────────────────────
function usuarioDaReq(req) {
  return lerToken(lerCookie(req, COOKIE));
}
function exigirLogin(req, res, next) {
  const u = usuarioDaReq(req);
  if (!u) {
    if (req.path.startsWith('/api/')) return res.status(401).json({ error: 'Faça login.' });
    return res.redirect('/login?next=' + encodeURIComponent(req.originalUrl));
  }
  req.usuario = u;
  next();
}
function exigirAdmin(req, res, next) {
  const u = usuarioDaReq(req);
  if (!u || u.papel !== 'admin') return res.status(403).json({ error: 'Só o admin pode fazer isso.' });
  req.usuario = u;
  next();
}

module.exports = {
  usuarios, acharPorLogin, conferirSenha, criarToken, lerToken,
  setCookieSessao, limparCookie, exigirLogin, exigirAdmin, usuarioDaReq,
  publico, novoUsuario, salvarUsuarios, hashSenha,
  limiteOpus, opusInfo, consumirOpus,
};
