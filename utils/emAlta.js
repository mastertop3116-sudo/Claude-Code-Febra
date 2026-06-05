'use strict';
// ============================================================
// EM ALTA — ranking de nichos "quentes" pro Estúdio.
// Pensado pro ICP: EMPREENDEDOR que cria pra VENDER. Os temas são os
// que VENDEM bem como pack de atividade (mercado-fim BR), não currículo.
//
// Combina 3 sinais (honesto — NÚMERO só aparece se for de verdade):
//   1) Sazonal/curado — lista curada, com janela de temporada
//      (Festa Junina sobe em jun, Natal em dez...).
//   2) Uso real        — o que a galera mais cria (utils/demanda).
//      Vira número na tela só quando passa do PISO de criações reais.
//   3) Trends (futuro) — data/trends.json (robô semanal). Lido se existir.
//
//   ranking(limite) → { geradoEm, mes, itens:[{nome,emoji,tag,n,acao,novo}] }
// ============================================================
const fs = require('fs');
const path = require('path');
const demanda = require('./demanda');

const PISO  = 5;   // só mostra "N criadores" com pelo menos isso de uso REAL
const BOOST = 42;  // empurrão de quem está na temporada do mês
const W_USO = 6;   // peso de cada criação real no score

// Curadoria. meses = quando a temporada SOBE (1-12). evergreen = vende o ano todo.
// match = palavras-chave pra casar com o que a galera digita (radar de uso).
// acao  = 'matematica' manda o clique pro card de Matemática (em vez do de palavras).
const CURADOS = [
  { nome:'Autismo / TEA',        emoji:'🧩',  base:96, evergreen:true, match:['autis','tea','espectro'] },
  { nome:'Alfabetização',        emoji:'✏️',  base:93, evergreen:true, match:['alfabetiz','aprender a ler','silab','vogai'] },
  { nome:'Coordenação Motora',   emoji:'✋',  base:82, evergreen:true, match:['coordena','motora','traceja','pontilha','pré-escrita','pre-escrita'] },
  { nome:'Inglês Kids',          emoji:'🔤',  base:80, evergreen:true, match:['inglês','ingles','english','kids'] },
  { nome:'Tabuada',              emoji:'✖️',  base:78, evergreen:true, acao:'matematica', match:['tabuada','matemát','matemat','conta'] },
  { nome:'Caligrafia / Cursiva', emoji:'🖊️',  base:76, evergreen:true, match:['caligraf','cursiv','letra bonita'] },
  { nome:'Atividades Cristãs',   emoji:'✝️',  base:74, evergreen:true, match:['crist','bíblic','biblic','jesus','evangel'] },
  { nome:'Educação Especial',    emoji:'🧠',  base:72, evergreen:true, match:['tdah','dislex','inclus','especial'] },
  { nome:'Atividades de Férias', emoji:'🏖️',  base:70, meses:[1,7,12], match:['férias','ferias'] },
  { nome:'Festa Junina',         emoji:'🎉',  base:58, meses:[5,6],    match:['junina','são joão','sao joao','quadrilha'] },
  { nome:'Volta às Aulas',       emoji:'🎒',  base:56, meses:[1,2,7,8],match:['volta às aulas','volta as aulas','acolhi'] },
  { nome:'Dia das Crianças',     emoji:'🧒',  base:52, meses:[9,10],   match:['dia das crianças','dia das criancas'] },
  { nome:'Folclore',             emoji:'🪅',  base:52, meses:[7,8],    match:['folclore','saci','lenda','curupira'] },
  { nome:'Natal',                emoji:'🎄',  base:52, meses:[11,12],  match:['natal','natalin'] },
  { nome:'Páscoa',               emoji:'🐣',  base:50, meses:[2,3,4],  match:['páscoa','pascoa','coelho da páscoa'] },
  { nome:'Dia das Mães',         emoji:'💐',  base:50, meses:[4,5],    match:['dia das mães','dia das maes'] },
  { nome:'Dia dos Pais',         emoji:'👔',  base:48, meses:[7,8],    match:['dia dos pais'] },
  { nome:'Independência',        emoji:'🇧🇷',  base:46, meses:[8,9],    match:['independ','7 de setembro','pátria','patria'] },
  { nome:'Consciência Negra',    emoji:'✊🏾',  base:46, meses:[10,11],  match:['consciência negra','consciencia negra','zumbi'] },
];

function mesAtual(){ return new Date().getMonth() + 1; }

function lerTrends(){
  try { return JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'trends.json'), 'utf8')) || {}; }
  catch (_) { return {}; }
}

// Sinais de uso REAL via radar de demanda: total geral + nos últimos 7 dias.
function sinaisDeUso(){
  let r; try { r = demanda.resumo(); } catch (_) { r = {}; }
  const temas = r.temas || [];          // [{k,v}]  k=tema minúsculo, v=total
  const recentes = r.recentes || [];    // [{tema,em:'YYYY-MM-DD HH:MM'}]
  const lim = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const total7 = {};
  for (const it of recentes) {
    const k = String(it.tema || '').toLowerCase();
    const t = Date.parse(String(it.em || '').replace(' ', 'T') + ':00');
    if (k && !isNaN(t) && t >= lim) total7[k] = (total7[k] || 0) + 1;
  }
  return { temas, total7 };
}

function casa(keys, alvo){ return keys.some(k => alvo.includes(k)); }

function ranking(limite = 8){
  const mes = mesAtual();
  const { temas, total7 } = sinaisDeUso();
  const trends = lerTrends();
  const usados = new Set();

  const itens = CURADOS.map(c => {
    const keys = c.match || [c.nome.toLowerCase()];
    let usoTotal = 0, uso7 = 0;
    for (const { k, v } of temas)        if (casa(keys, k)) { usoTotal += v; usados.add(k); }
    for (const k of Object.keys(total7)) if (casa(keys, k)) uso7 += total7[k];
    const naTemporada = Array.isArray(c.meses) && c.meses.includes(mes);
    const trendScore = Number(trends[c.nome]) || 0;
    const score = c.base + (naTemporada ? BOOST : 0) + usoTotal * W_USO + trendScore;

    // tag honesta + número só quando real
    let tag, n = null;
    if (uso7 >= PISO)          { tag = 'em_alta'; n = uso7; }
    else if (naTemporada)      { tag = 'temporada'; }
    else if (c.base >= 90)     { tag = 'campeao'; }
    else                       { tag = 'quente'; }

    return { nome: c.nome, emoji: c.emoji, tag, n, acao: c.acao || null, novo: false, _s: score };
  });

  // EMERGENTES: temas reais (do uso) que não casaram com nenhum curado.
  for (const { k, v } of temas) {
    if (usados.has(k) || v < PISO) continue;
    const uso7 = total7[k] || 0;
    const nome = k.replace(/\b\w/g, ch => ch.toUpperCase());
    itens.push({ nome, emoji: '✨', tag: uso7 >= PISO ? 'em_alta' : 'novo', n: uso7 >= PISO ? uso7 : null, acao: null, novo: true, _s: 62 + v * W_USO });
  }

  itens.sort((a, b) => b._s - a._s);
  return { geradoEm: new Date().toISOString(), mes, itens: itens.slice(0, limite).map(({ _s, ...r }) => r) };
}

module.exports = { ranking };
