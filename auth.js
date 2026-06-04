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
const COOKIE = 'max_sessao';
const VALIDADE_DIAS = 30;
// COTA MENSAL por cliente (controla o custo e garante lucro). Reseta todo mês.
// Padrão equilibrado pelo CUSTO: Opus custa ~2x o GPT, então a cota de Opus é menor.
//   Opus 15/mês (~R$ 9 de custo) + GPT 50/mês (~R$ 15 de custo) = ~R$ 24 no MÁXIMO por cliente.
// Admin (Rodrigo) = ilimitado. Ajustável por env e por usuário (admin define na tela).
const LIM_OPUS_MES = parseInt(process.env.LIM_OPUS_MES) || 15;
const LIM_GPT_MES  = parseInt(process.env.LIM_GPT_MES)  || 50;

// ── PERSISTÊNCIA no Supabase (banco que NÃO some entre publicações) ──────────
// Antes os usuários ficavam só em data/usuarios.json — que zera a cada deploy no
// Render (filesystem efêmero), fazendo clientes pagantes sumirem. Agora ficam na
// tabela criador_usuarios do Supabase, acessada SÓ pelo servidor (service_role;
// o RLS bloqueia o anon). Um cache em memória mantém as funções abaixo síncronas:
// toda escrita atualiza o cache E grava no banco. O arquivo vira só backup local.
let _sb = null;
try {
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    _sb = require('@supabase/supabase-js').createClient(
      process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } }
    );
  }
} catch (_) { _sb = null; }
const TABELA_USERS = 'criador_usuarios';
let _cache = null;   // array de usuários em memória (fonte rápida; o Supabase é a durável)

// ── SEGREDO da sessão ───────────────────────────────────────
// Se não vier por env (SESSION_SECRET), NÃO usar um segredo fixo conhecido
// (isso deixaria qualquer um forjar um cookie de admin). Geramos um aleatório
// e guardamos em data/.session_secret, reusado entre reinícios.
const SECRET = (function () {
  if (process.env.SESSION_SECRET && process.env.SESSION_SECRET.length >= 16) return process.env.SESSION_SECRET;
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    const f = path.join(DATA_DIR, '.session_secret');
    if (fs.existsSync(f)) { const s = fs.readFileSync(f, 'utf8').trim(); if (s.length >= 16) return s; }
    const novo = crypto.randomBytes(32).toString('hex');
    fs.writeFileSync(f, novo);
    console.warn('[auth] SESSION_SECRET não definido — gerei um aleatório (data/.session_secret). Defina SESSION_SECRET no servidor para manter a sessão entre publicações.');
    return novo;
  } catch (_) {
    return 'max-' + crypto.randomBytes(16).toString('hex'); // último recurso (só em memória)
  }
})();
function hojeStr() { return new Date().toISOString().slice(0, 10); }
function mesStr()  { return new Date().toISOString().slice(0, 7); }   // 'YYYY-MM'

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

// ── usuários (cache em memória + Supabase) ──────────────────
function _lerArquivo() {
  try { return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8')); } catch (_) { return null; }
}
function lerUsuarios() { return _cache; }
function salvarUsuarios(lista) {
  _cache = lista;
  // backup local (efêmero no Render, mas ajuda em dev e como rede de segurança)
  try { fs.mkdirSync(DATA_DIR, { recursive: true }); fs.writeFileSync(USERS_FILE, JSON.stringify(lista, null, 2)); } catch (_) {}
  // grava no banco durável (fire-and-forget; loga se falhar — não trava o request)
  if (_sb) {
    const rows = lista.map(u => ({ id: u.id, login: u.login, dados: u, updated_at: new Date().toISOString() }));
    _sb.from(TABELA_USERS).upsert(rows, { onConflict: 'id' })
      .then(({ error }) => { if (error) console.error('[auth] falha ao gravar usuários no Supabase:', error.message); })
      .catch(e => console.error('[auth] erro Supabase ao gravar:', e.message));
  }
}
function novoUsuario(nome, login, senha, papel, senhaPadrao = false) {
  const { salt, hash } = hashSenha(senha);
  return {
    id: crypto.randomBytes(6).toString('hex'),
    nome, login: login.toLowerCase().trim(), papel, salt, hash,
    senhaPadrao: !!senhaPadrao,   // true = ainda está com a senha padrão (mostra aviso pra trocar)
    // permissões — estrutura pronta; Rodrigo detalha depois.
    permissoes: papel === 'admin'
      ? { criar: true, atividades: true, matematica: true, usarOpus: true, gerenciarUsuarios: true, verCustos: true }
      : { criar: true, atividades: true, matematica: true, usarOpus: false, gerenciarUsuarios: false, verCustos: false },
    criadoEm: new Date().toISOString().slice(0, 10),
  };
}
function semeie() {
  // senhaPadrao = true quando NÃO veio senha por env (sinaliza pro usuário trocar).
  const lista = [
    novoUsuario('Rodrigo', 'rodrigo', process.env.RODRIGO_SENHA || 'rodrigo123', 'admin',   !process.env.RODRIGO_SENHA),
    novoUsuario('Bruno',   'bruno',   process.env.BRUNO_SENHA   || 'bruno123',   'usuario', !process.env.BRUNO_SENHA),
  ];
  salvarUsuarios(lista);
  return lista;
}
function usuarios() {
  if (_cache) return _cache;
  const arq = _lerArquivo();              // fallback síncrono se o boot ainda não carregou
  if (arq && arq.length) { _cache = arq; return _cache; }
  return semeie();                        // 1ª vez: cria Rodrigo + Bruno (e grava no banco)
}
// Carrega os usuários do banco pro cache. Chamar NO BOOT, antes de servir requests.
async function iniciar() {
  if (!_sb) { usuarios(); return { fonte: 'arquivo' }; }
  try {
    const { data, error } = await _sb.from(TABELA_USERS).select('dados');
    if (error) throw error;
    if (data && data.length) {
      _cache = data.map(r => r.dados).filter(Boolean);
      console.log(`[auth] ${_cache.length} usuário(s) carregado(s) do Supabase.`);
      return { fonte: 'supabase', total: _cache.length };
    }
    semeie();                             // banco vazio → semeia Rodrigo + Bruno lá
    console.log('[auth] banco vazio — semeei Rodrigo + Bruno no Supabase.');
    return { fonte: 'supabase', total: _cache ? _cache.length : 0, semeado: true };
  } catch (e) {
    console.error('[auth] Supabase falhou no boot — usando arquivo local:', e.message);
    usuarios();
    return { fonte: 'arquivo-fallback', erro: e.message };
  }
}
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

// ── COTA MENSAL (controla custo e garante lucro) ────────────
// Cada cliente tem uma cota POR MÊS de Opus (caro) e de GPT (barato), que reseta
// virou o mês. Admin (Rodrigo) = ilimitado. Limites ajustáveis por usuário.
function limiteMes(u, modelo) {
  if (u && u.papel === 'admin') return -1;                       // admin ilimitado
  if (u && u.limites && typeof u.limites[modelo] === 'number') return u.limites[modelo]; // override
  return modelo === 'opus' ? LIM_OPUS_MES : LIM_GPT_MES;
}
function _usoDoMes(u) {
  const mes = mesStr();
  return (u && u.usoMes && u.usoMes.mes === mes) ? u.usoMes : { mes, opus: 0, gpt: 0 };
}
// Quanto o usuário já usou e quanto resta no mês (Opus e GPT)
function usoMensal(u) {
  const uso = _usoDoMes(u);
  const linha = (modelo) => {
    const lim = limiteMes(u, modelo), usado = uso[modelo] || 0;
    return { ilimitado: lim < 0, limite: lim, usado, restantes: lim < 0 ? null : Math.max(0, lim - usado) };
  };
  return { mes: uso.mes, opus: linha('opus'), gpt: linha('gpt') };
}
// "gasta" 1 geração do modelo escolhido (server-side, não dá pra burlar). Reseta no mês novo.
function consumirGeracao(userId, modelo) {
  modelo = modelo === 'opus' ? 'opus' : 'gpt';
  const lista = usuarios();
  const u = lista.find(x => x.id === userId);
  if (!u) return { ok: false, error: 'usuário não encontrado' };
  const mes = mesStr();
  const uso = (u.usoMes && u.usoMes.mes === mes) ? u.usoMes : { mes, opus: 0, gpt: 0 };
  const lim = limiteMes(u, modelo);
  if (lim >= 0 && (uso[modelo] || 0) >= lim) return { ok: false, esgotado: true, modelo, limite: lim };
  if (lim >= 0) { uso[modelo] = (uso[modelo] || 0) + 1; u.usoMes = uso; salvarUsuarios(lista); }
  const restantes = lim < 0 ? null : lim - (uso[modelo] || 0);
  return { ok: true, modelo, ilimitado: lim < 0, limite: lim, usado: uso[modelo] || 0, restantes };
}
// admin define a cota MENSAL de um usuário ({opus, gpt})
function definirLimites(userId, { opus, gpt } = {}) {
  const lista = usuarios();
  const u = lista.find(x => x.id === userId);
  if (!u) return { ok: false, error: 'Usuário não encontrado.' };
  u.limites = u.limites || {};
  if (opus != null && !isNaN(parseInt(opus)) && parseInt(opus) >= 0) u.limites.opus = parseInt(opus);
  if (gpt  != null && !isNaN(parseInt(gpt))  && parseInt(gpt)  >= 0) u.limites.gpt  = parseInt(gpt);
  salvarUsuarios(lista);
  return { ok: true, limites: u.limites, uso: usoMensal(u) };
}

// ── gerenciar senhas/usuários (pelo próprio site) ───────────
function trocarSenha(userId, novaSenha) {
  if (!novaSenha || String(novaSenha).length < 4) return { ok: false, error: 'A senha precisa de pelo menos 4 caracteres.' };
  const lista = usuarios();
  const u = lista.find(x => x.id === userId);
  if (!u) return { ok: false, error: 'Usuário não encontrado.' };
  const { salt, hash } = hashSenha(novaSenha);
  u.salt = salt; u.hash = hash;
  u.senhaPadrao = false;   // trocou a senha → some o aviso
  salvarUsuarios(lista);
  return { ok: true };
}
function criarUsuarioPersistido(nome, login, senha, papel) {
  if (!nome || !login || !senha) return { ok: false, error: 'Preencha nome, usuário e senha.' };
  if (String(senha).length < 4) return { ok: false, error: 'A senha precisa de pelo menos 4 caracteres.' };
  const lista = usuarios();
  const lg = String(login).toLowerCase().trim();
  if (lista.some(u => u.login === lg)) return { ok: false, error: 'Já existe um usuário com esse login.' };
  const u = novoUsuario(nome, lg, senha, papel === 'admin' ? 'admin' : 'usuario');
  lista.push(u); salvarUsuarios(lista);
  return { ok: true, usuario: publico(u) };
}
function removerUsuario(userId) {
  const lista = usuarios();
  if (!lista.find(x => x.id === userId)) return { ok: false, error: 'Usuário não encontrado.' };
  salvarUsuarios(lista.filter(x => x.id !== userId));
  // upsert não apaga sozinho — remove explicitamente do banco
  if (_sb) _sb.from(TABELA_USERS).delete().eq('id', userId)
    .then(({ error }) => { if (error) console.error('[auth] falha ao remover no Supabase:', error.message); })
    .catch(e => console.error('[auth] erro Supabase ao remover:', e.message));
  return { ok: true };
}

// ── usuário "público" (sem segredos) ────────────────────────
function publico(u) {
  return u && { id: u.id, nome: u.nome, login: u.login, papel: u.papel, permissoes: u.permissoes, uso: usoMensal(u), limites: u.limites || null, senhaPadrao: !!u.senhaPadrao };
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
  iniciar,
  usuarios, acharPorLogin, conferirSenha, criarToken, lerToken,
  setCookieSessao, limparCookie, exigirLogin, exigirAdmin, usuarioDaReq,
  publico, novoUsuario, salvarUsuarios, hashSenha,
  usoMensal, consumirGeracao, definirLimites, limiteMes, LIM_OPUS_MES, LIM_GPT_MES,
  trocarSenha, criarUsuarioPersistido, removerUsuario,
};
