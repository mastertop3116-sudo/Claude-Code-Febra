'use strict';
// ============================================================
// RADAR DE DEMANDA — registra o que a galera está criando.
// Cada geração (e-book, pack...) alimenta um ranking de temas/nichos/
// idiomas/tipos. Serve pra descobrir o que produzir e vender sob medida.
//
//   registrar({ tipo, tema, nicho, idioma, modelo })  → conta +1
//   resumo()  → rankings (top temas, nichos, idiomas, tipos) + recentes
//
// Guarda agregado em data/demanda.json (leve). No Render é efêmero —
// quando for vender, migrar pro Supabase pra não perder os dados (ver Obsidian).
// ============================================================
const fs = require('fs');
const path = require('path');
const FILE = path.join(__dirname, '..', 'data', 'demanda.json');

function vazio() { return { total: 0, desde: new Date().toISOString().slice(0, 10), tipos: {}, nichos: {}, idiomas: {}, modelos: {}, temas: {}, recentes: [] }; }
function ler() { try { return JSON.parse(fs.readFileSync(FILE, 'utf8')); } catch (_) { return vazio(); } }
function salvar(d) { try { fs.mkdirSync(path.dirname(FILE), { recursive: true }); fs.writeFileSync(FILE, JSON.stringify(d)); } catch (_) {} }
function norm(s) { return String(s || '').trim().replace(/\s+/g, ' ').slice(0, 80); }
function chave(s) { return norm(s).toLowerCase(); }

function registrar(info = {}) {
  try {
    const d = ler();
    d.total = (d.total || 0) + 1;
    const inc = (o, k) => { k = chave(k); if (k) o[k] = (o[k] || 0) + 1; };
    inc(d.tipos, info.tipo);
    inc(d.nichos, info.nicho || info.tema);
    inc(d.idiomas, info.idioma || 'pt');
    inc(d.modelos, info.modelo);
    inc(d.temas, info.tema || info.nicho);
    d.recentes = d.recentes || [];
    d.recentes.unshift({ tema: norm(info.tema || info.nicho), tipo: info.tipo || '', idioma: info.idioma || 'pt', em: new Date().toISOString().slice(0, 16).replace('T', ' ') });
    d.recentes = d.recentes.slice(0, 80);
    salvar(d);
  } catch (_) {}
}

function top(obj, n) {
  return Object.entries(obj || {}).sort((a, b) => b[1] - a[1]).slice(0, n).map(([k, v]) => ({ k, v }));
}

function resumo() {
  const d = ler();
  return {
    total: d.total || 0,
    desde: d.desde || null,
    temas: top(d.temas, 12),
    nichos: top(d.nichos, 10),
    idiomas: top(d.idiomas, 6),
    tipos: top(d.tipos, 8),
    modelos: top(d.modelos, 3),
    recentes: (d.recentes || []).slice(0, 20),
  };
}

module.exports = { registrar, resumo };
