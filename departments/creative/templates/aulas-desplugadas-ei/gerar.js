const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const DIR = __dirname;
const ATIVIDADES = JSON.parse(fs.readFileSync(path.join(DIR, 'atividades.json')));
const TEMPLATE = fs.readFileSync(path.join(DIR, 'template.html'), 'utf-8');

const OUT_DIR = path.join(DIR, 'pdfs');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
['Maternal','Jardim','Pré-Escola'].forEach(f => {
  const d = path.join(OUT_DIR, f); if (!fs.existsSync(d)) fs.mkdirSync(d);
});

// --- ICONES POR FAIXA ---
const ICONS = { Maternal:'🧸', Jardim:'🌈', 'Pré-Escola':'📚' };

// --- CONSTRUTORES DE CONTEUDO HTML ---
function buildConteudo(at) {
  switch (at.tipo) {
    case 'galeria-emoji': return buildGaleria(at);
    case 'contagem': return buildContagem(at);
    case 'vogais': return buildVogais(at);
    case 'silabas': return buildSilabas(at);
    case 'adicao': return buildContas(at, '+');
    case 'subtracao': return buildContas(at, '-');
    case 'antes-depois': return buildAntesDe(at);
    case 'sequencia-numerica': return buildSeqNumerica(at);
    case 'rimas': return buildRimas(at);
    case 'comparar-numeros': return buildComparar(at);
    case 'completar-silaba': return buildCompSilaba(at);
    case 'associar': return buildAssociar(at);
    case 'grande-pequeno': return buildGrandePequeno(at);
    case 'igual-diferente': return buildIgualDif(at);
    case 'circule-correto': return buildCircule(at);
    case 'escrever-palavra': return buildEscrever(at);
    case 'labirinto': return buildLabirinto(at);
    case 'horas': return buildHoras(at);
    case 'partes-corpo': return buildCorpo(at);
    case 'alfabeto': return buildAlfabeto(at);
    case 'formas-geometricas': return buildFormas(at);
    case 'cores': return buildCores(at);
    case 'contar-simples': return buildContarSimples(at);
    case 'letra-inicial': return buildLetraInicial(at);
    case 'pares': return buildPares(at);
    case 'tracado': return buildTracado(at);
    case 'ligar-pontos': return buildLigarPontos(at);
    case 'colorir-formas': return buildColorirFormas(at);
    case 'ordenar-tamanho': return buildOrdenarTamanho(at);
    case 'sequencia': return buildSequencia(at);
    case 'associar-sombra': return buildAssociarSombra(at);
    case 'pintar-numero': return buildPintarNumero(at);
    case 'trace-numeros': return buildTraceNumeros(at);
    case 'dentro-fora': return buildDentroFora(at);
    case 'completar-desenho': return buildCompletarDesenho(at);
    case 'sete-diferencas': return buildSeteDif(at);
    default: return `<div style="text-align:center;font-size:40px;padding:60px;color:#ccc;">🎨</div>`;
  }
}

function buildGaleria(at) {
  const items = at.itens.map(i => `
    <div class="galeria-item">
      <div class="emoji">${i.emoji}</div>
      <div class="linha-nome"></div>
    </div>`).join('');
  return `<div class="galeria">${items}</div>`;
}

function buildContagem(at) {
  const rows = at.grupos.map(g => {
    const emojis = Array(g.qtd).fill(g.emoji).join(' ');
    return `<div class="contagem-linha">
      <div class="contagem-emojis">${emojis}</div>
      <div class="contagem-box"></div>
    </div>`;
  }).join('');
  return `<div class="contagem-grid">${rows}</div>`;
}

function buildVogais(at) {
  const rows = at.vogais.map(v => `
    <div class="vogal-linha">
      <div class="vogal-letra">${v.letra}</div>
      <div class="vogal-trace">${v.letra}</div>
      <div class="vogal-emoji">${v.emoji}</div>
      <div class="vogal-palavra">${v.palavra}</div>
    </div>`).join('');
  return `<div class="vogais-grid">${rows}</div>`;
}

function buildSilabas(at) {
  const items = at.palavras.map(p => `
    <div class="silaba-item">
      <div class="silaba-emoji">${p.emoji}</div>
      <div class="silaba-info">
        <div class="silaba-palavra">${p.palavra}</div>
        <div style="border-bottom:2.5px solid var(--cor);height:32px;margin-top:8px"></div>
      </div>
    </div>`).join('');
  return `<div class="silabas-grid">${items}</div>`;
}

function buildContas(at, op) {
  const items = at.contas.map(c => {
    const b = op === '+' ? c.b : c.b;
    const res = op === '+' ? c.a + c.b : c.a - c.b;
    const emojisA = Array(c.a).fill(c.emoji).join('');
    const emojisB = op === '+' ? Array(c.b).fill(c.emoji).join('') : Array(c.b).fill('❌').join('');
    return `<div class="conta-card">
      <div class="conta-emojis">${emojisA} ${op === '-' ? '→ ' + emojisB : emojisB}</div>
      <div class="conta-expressao">${c.a} ${op} ${b} = <span class="conta-blank"></span></div>
    </div>`;
  }).join('');
  return `<div class="contas-grid">${items}</div>`;
}

function buildAntesDe(at) {
  const items = at.numeros.map(n => `
    <div class="ad-card">
      <div class="ad-box">__</div>
      <div class="ad-numero">${n}</div>
      <div class="ad-box">__</div>
    </div>`).join('');
  return `<div class="antes-depois-grid">${items}</div>`;
}

function buildSeqNumerica(at) {
  const rows = at.sequencias.map(seq => {
    const nums = seq.map(n => {
      if (n === '_') return `<div class="seq-num vazio">?</div>`;
      return `<div class="seq-num dado">${n}</div>`;
    }).join('');
    return `<div class="seq-linha">${nums}</div>`;
  }).join('');
  return `<div class="seq-grid">${rows}</div>`;
}

function buildRimas(at) {
  const esq = at.pares.map(p => `<div class="rima-item">${p.palavra}</div>`).join('');
  const dirShuffled = [...at.pares].sort(() => Math.random() - 0.5);
  const dir = dirShuffled.map(p => `<div class="rima-item">${p.rima}</div>`).join('');
  return `<div class="rimas-container">
    <div class="rimas-col">${esq}</div>
    <div style="display:flex;flex-direction:column;justify-content:space-around;padding:8px 0">
      ${at.pares.map(() => '<div style="width:60px;border-top:2px dashed #ccc;"></div>').join('')}
    </div>
    <div class="rimas-col">${dir}</div>
  </div>`;
}

function buildComparar(at) {
  const items = at.pares.map(([a, b]) => `
    <div class="comparar-card">
      <div class="comp-num">${a}</div>
      <div class="comp-sinal" style="border:2.5px dashed var(--cor);border-radius:8px;min-width:32px;height:32px;display:flex;align-items:center;justify-content:center;color:transparent">?</div>
      <div class="comp-num">${b}</div>
    </div>`).join('');
  return `<div class="comparar-grid">${items}</div>`;
}

function buildCompSilaba(at) {
  const items = at.itens.map(i => `
    <div class="comp-sil-item">
      <div class="comp-sil-emoji">${i.emoji}</div>
      <div>
        <div class="comp-sil-palavra">${i.palavra}</div>
        <div style="margin-top:6px;width:52px;height:36px;border:2.5px dashed var(--cor);border-radius:8px"></div>
      </div>
    </div>`).join('');
  return `<div class="comp-sil-grid">${items}</div>`;
}

function buildAssociar(at) {
  const esq = at.pares.map(p => `<div class="assoc-item"><span>${p.item}</span></div>`).join('');
  const dir = [...at.pares].sort(() => Math.random() - 0.5)
    .map(p => `<div class="assoc-item"><span class="cat">${p.categoria}</span></div>`).join('');
  return `<div class="associar-container">
    <div class="associar-col">${esq}</div>
    <div class="associar-col">${dir}</div>
  </div>`;
}

function buildGrandePequeno(at) {
  const items = at.pares.map(([a, b]) => `
    <div class="gp-card">
      <div class="gp-item">
        <div class="gp-emoji-big">${a}</div>
      </div>
      <div class="gp-item">
        <div class="gp-emoji-small">${b}</div>
      </div>
    </div>`).join('');
  return `<div class="gp-grid">${items}</div>`;
}

function buildIgualDif(at) {
  const items = at.pares.map(([a, b, ok]) => `
    <div class="ig-card">
      <div class="ig-emoji">${a}</div>
      <div class="ig-emoji">${b}</div>
      <div class="ig-box"></div>
    </div>`).join('');
  return `<div class="ig-grid">${items}</div>`;
}

function buildCircule(at) {
  const items = at.itens.map(i => `
    <div class="circule-item">
      <div class="circule-emoji">${i.emoji}</div>
      <div class="circule-nome">${i.nome}</div>
    </div>`).join('');
  return `<div class="circule-grid">${items}</div>`;
}

function buildEscrever(at) {
  const items = at.itens.map(i => `
    <div class="escrever-item">
      <div class="escrever-emoji">${i.emoji}</div>
      <div class="escrever-linhas">
        <div class="escrever-linha"></div>
        <div class="escrever-linha"></div>
      </div>
    </div>`).join('');
  return `<div class="escrever-grid">${items}</div>`;
}

function buildLabirinto(at) {
  // Maze: 0=path 1=wall, S=start E=end
  const mazes = {
    facil: [
      [1,1,1,1,1,1,1,1,1],
      [0,0,0,1,0,0,0,0,1],
      [1,1,0,1,0,1,1,0,1],
      [1,0,0,0,0,0,1,0,1],
      [1,0,1,1,1,0,1,0,1],
      [1,0,0,0,1,0,0,0,1],
      [1,1,1,0,1,1,1,0,1],
      [1,0,0,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,1,1],
    ],
    medio: [
      [1,1,1,1,1,1,1,1,1,1,1],
      [0,0,0,1,0,0,0,1,0,0,1],
      [1,1,0,1,0,1,0,0,0,1,1],
      [1,0,0,0,0,1,1,1,0,0,1],
      [1,0,1,1,0,0,0,1,1,0,1],
      [1,0,1,0,0,1,0,0,0,0,1],
      [1,0,1,0,1,1,1,1,1,0,1],
      [1,0,0,0,0,0,0,0,1,0,1],
      [1,1,1,1,1,0,1,0,0,0,1],
      [1,0,0,0,0,0,1,1,1,1,1],
      [1,1,1,1,1,1,1,1,1,1,1],
    ]
  };
  const maze = mazes[at.dificuldade] || mazes.facil;
  const rows = maze.length; const cols = maze[0].length;
  let cells = '';
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const v = maze[r][c];
      if (r === 1 && c === 0) cells += `<div class="mc emoji-cell">${at.inicio}</div>`;
      else if (r === rows-2 && c === cols-1) cells += `<div class="mc emoji-cell">${at.fim}</div>`;
      else cells += `<div class="mc ${v===1?'wall':'path'}"></div>`;
    }
  }
  return `<div class="labirinto-container">
    <div class="maze" style="grid-template-columns:repeat(${cols},44px)">${cells}</div>
  </div>`;
}

function clockSVG(h) {
  const [hh, mm] = h.split(':').map(Number);
  const toXY = (deg, len) => {
    const rad = (deg - 90) * Math.PI / 180;
    return { x: +(50 + Math.cos(rad) * len).toFixed(1), y: +(50 + Math.sin(rad) * len).toFixed(1) };
  };
  const mAngle = mm * 6;
  const hAngle = (hh % 12) * 30 + mm * 0.5;
  const mEnd = toXY(mAngle, 30);
  const hEnd = toXY(hAngle, 20);
  const ticks = Array.from({length:12}, (_, i) => {
    const p1 = toXY(i * 30, 40); const p2 = toXY(i * 30, 44);
    return `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="#ccc" stroke-width="2"/>`;
  }).join('');
  return `<svg width="88" height="88" viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="46" fill="white" stroke="var(--cor)" stroke-width="3"/>
    ${ticks}
    <line x1="50" y1="50" x2="${hEnd.x}" y2="${hEnd.y}" stroke="#444" stroke-width="5" stroke-linecap="round"/>
    <line x1="50" y1="50" x2="${mEnd.x}" y2="${mEnd.y}" stroke="var(--cor)" stroke-width="3" stroke-linecap="round"/>
    <circle cx="50" cy="50" r="3" fill="var(--cor)"/>
  </svg>`;
}

function buildHoras(at) {
  const items = at.horarios.map(h => `
    <div class="hora-card">
      <div class="relogio" style="border:none;background:none;width:auto;height:auto">${clockSVG(h)}</div>
      <div class="hora-linha"></div>
    </div>`).join('');
  return `<div class="horas-grid">${items}</div>`;
}

function buildCorpo(at) {
  const items = at.partes.map(() => `
    <div class="corpo-item">
      <div class="corpo-seta">→</div>
      <div class="corpo-linha"></div>
    </div>`).join('');
  return `<div class="corpo-container">
    <div class="corpo-figura">🧍</div>
    <div class="corpo-lista">${items}</div>
  </div>`;
}

function buildAlfabeto(at) {
  const items = at.letras.map(l => `
    <div class="alfa-card">
      <div class="alfa-letra">${l}</div>
      <div class="alfa-trace">${l}</div>
      <div class="alfa-linha"></div>
    </div>`).join('');
  return `<div class="alfa-grid">${items}</div>`;
}

function buildFormas(at) {
  const shapes = at.formas.map(f => {
    let svg = '';
    if (f.forma === 'circulo') svg = `<svg width="80" height="80" viewBox="0 0 80 80"><circle cx="40" cy="40" r="35" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="6,4"/></svg>`;
    if (f.forma === 'quadrado') svg = `<svg width="80" height="80" viewBox="0 0 80 80"><rect x="10" y="10" width="60" height="60" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="6,4"/></svg>`;
    if (f.forma === 'triangulo') svg = `<svg width="80" height="80" viewBox="0 0 80 80"><polygon points="40,8 75,72 5,72" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="6,4"/></svg>`;
    if (f.forma === 'retangulo') svg = `<svg width="80" height="80" viewBox="0 0 80 80"><rect x="5" y="20" width="70" height="40" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="6,4"/></svg>`;
    return `<div class="galeria-item" style="color:var(--cor)">${svg}<div class="nome">${f.nome}</div></div>`;
  }).join('');
  return `<div class="galeria">${shapes}</div>`;
}

function buildCores(at) {
  const items = at.itens.map(i => `
    <div class="galeria-item">
      <div class="emoji">${i.emoji}</div>
      <div class="nome">${i.nome}</div>
    </div>`).join('');
  return `<div class="galeria">${items}</div>`;
}

function buildContarSimples(at) {
  const rows = at.grupos.map(g => {
    const emojis = Array(g.qtd).fill(g.emoji).join(' ');
    return `<div class="contagem-linha">
      <div class="contagem-emojis" style="font-size:36px">${emojis}</div>
      <div class="contagem-box"></div>
    </div>`;
  }).join('');
  return `<div class="contagem-grid">${rows}</div>`;
}

function buildLetraInicial(at) {
  const items = at.itens.map(i => `
    <div class="escrever-item">
      <div class="escrever-emoji">${i.emoji}</div>
      <div class="escrever-linhas">
        <div style="font-size:14px;font-weight:700;color:#666">${i.palavra}</div>
        <div style="margin-top:8px;display:flex;align-items:center;gap:8px">
          <span style="font-size:14px;color:#aaa">Começa com:</span>
          <div style="width:40px;height:40px;border:2.5px dashed var(--cor);border-radius:8px"></div>
        </div>
      </div>
    </div>`).join('');
  return `<div class="escrever-grid">${items}</div>`;
}

function buildPares(at) {
  const meio = Math.ceil(at.itens.length / 2);
  const esq = at.itens.slice(0, meio).map(e => `<div class="assoc-item" style="font-size:32px">${e}</div>`).join('');
  const dirItems = [...at.itens.slice(meio)].sort(() => Math.random() - 0.5);
  const dir = dirItems.map(e => `<div class="assoc-item" style="font-size:32px">${e}</div>`).join('');
  return `<div class="associar-container">
    <div class="associar-col">${esq}</div>
    <div class="associar-col">${dir}</div>
  </div>`;
}

function buildTracado(at) {
  const linhas = at.linhas.map((tipo, i) => {
    let path = '';
    if (tipo === 'reta') path = `<line x1="30" y1="50" x2="670" y2="50" stroke="#ddd" stroke-width="2.5" stroke-dasharray="8,6"/>`;
    if (tipo === 'curva') path = `<path d="M 30,30 Q 200,80 370,30 Q 540,80 670,30" fill="none" stroke="#ddd" stroke-width="2.5" stroke-dasharray="8,6"/>`;
    if (tipo === 'zigue-zague') path = `<polyline points="30,30 130,70 230,30 330,70 430,30 530,70 670,30" fill="none" stroke="#ddd" stroke-width="2.5" stroke-dasharray="8,6"/>`;
    return `<div style="margin-bottom:16px">
      <svg width="700" height="80" viewBox="0 0 700 80" style="display:block">${path}</svg>
    </div>`;
  }).join('');
  return `<div>${linhas}</div>`;
}

function buildLigarPontos(at) {
  const positions = [
    {x:200,y:60},{x:360,y:30},{x:520,y:60},{x:560,y:200},{x:380,y:260}
  ];
  const circles = positions.slice(0, at.pontos).map((p, i) => `
    <circle cx="${p.x}" cy="${p.y}" r="20" fill="white" stroke="var(--cor)" stroke-width="3"/>
    <text x="${p.x}" y="${p.y+7}" text-anchor="middle" font-size="16" font-weight="900" fill="var(--cor)">${i+1}</text>
  `).join('');
  return `<div style="text-align:center">
    <svg width="700" height="320" viewBox="0 0 700 320" style="max-width:100%">
      <text x="350" y="160" text-anchor="middle" font-size="80">${at.resultado}</text>
      ${circles}
    </svg>
    <div style="font-size:14px;color:#aaa;margin-top:8px">Ligue os pontos na ordem: 1 → 2 → 3 → 4 → 5</div>
  </div>`;
}

function buildColorirFormas(at) {
  const circles = at.formas.map((_, i) => `
    <div style="width:100px;height:100px;border-radius:50%;border:3px dashed var(--cor);margin:8px;display:inline-block;"></div>
  `).join('');
  return `<div style="text-align:center;padding:20px">${circles}</div>`;
}

function buildOrdenarTamanho(at) {
  const series = at.series.map(s => {
    const items = s.emojis.map((e, i) => `
      <div style="text-align:center;display:inline-block;margin:0 12px">
        <div style="font-size:${24+i*12}px">${e}</div>
        <div style="width:36px;height:36px;border:2.5px dashed var(--cor);border-radius:8px;margin:8px auto;"></div>
        <div style="font-size:12px;color:#777">${s.nomes[i]}</div>
      </div>`).join('');
    return `<div style="background:#fafafa;border-radius:14px;padding:16px;border:2.5px solid #eee;text-align:center;margin-bottom:16px">${items}</div>`;
  }).join('');
  return `<div>${series}</div>`;
}

function buildSequencia(at) {
  const SHAPES = {
    circulo: `<svg width="48" height="48"><circle cx="24" cy="24" r="20" fill="var(--cor)" opacity="0.7"/></svg>`,
    quadrado: `<svg width="48" height="48"><rect x="4" y="4" width="40" height="40" fill="var(--cor)" opacity="0.7"/></svg>`,
    triangulo: `<svg width="48" height="48"><polygon points="24,4 44,44 4,44" fill="var(--cor)" opacity="0.7"/></svg>`,
    '?': `<svg width="48" height="48"><rect x="4" y="4" width="40" height="40" fill="none" stroke="var(--cor)" stroke-width="3" stroke-dasharray="6,4"/><text x="24" y="32" text-anchor="middle" font-size="22" font-weight="900" fill="var(--cor)">?</text></svg>`
  };
  const rows = at.sequencias.map(seq => {
    const items = seq.map(s => `<div style="display:inline-block;margin:4px">${SHAPES[s]||SHAPES['?']}</div>`).join('');
    return `<div style="background:#fafafa;border-radius:12px;padding:12px 16px;border:2px solid #eee;margin-bottom:12px;display:flex;align-items:center;gap:4px">${items}</div>`;
  }).join('');
  return `<div>${rows}</div>`;
}

function buildAssociarSombra(at) {
  const esq = at.itens.map(i => `<div class="assoc-item" style="font-size:40px">${i.emoji}</div>`).join('');
  const dir = [...at.itens].sort(() => 0.5 - Math.random())
    .map(i => `<div class="assoc-item" style="font-size:40px"><span style="filter:brightness(0)">${i.emoji}</span></div>`).join('');
  return `<div class="associar-container">
    <div class="associar-col">${esq}</div>
    <div style="font-size:14px;font-weight:700;color:#aaa;align-self:center">Ligue →</div>
    <div class="associar-col">${dir}</div>
  </div>`;
}

function buildPintarNumero(at) {
  const codigo = at.codigo.map(c => `
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
      <div style="width:32px;height:32px;background:${c.hex};border-radius:6px;border:2px solid #ddd"></div>
      <span style="font-size:16px;font-weight:700">${c.numero} = ${c.cor}</span>
    </div>`).join('');
  return `<div style="display:flex;gap:32px;align-items:flex-start">
    <div style="background:#fafafa;border-radius:14px;padding:20px;border:2.5px solid #eee;min-width:200px">
      <div style="font-size:14px;font-weight:800;color:#555;margin-bottom:12px">🎨 Código de Cores</div>
      ${codigo}
    </div>
    <div style="flex:1;background:#fafafa;border-radius:14px;padding:20px;border:2.5px solid #eee;display:flex;align-items:center;justify-content:center">
      <svg width="320" height="280" viewBox="0 0 320 280" style="max-width:100%">
        <!-- Telhado (1) -->
        <polygon points="160,20 300,130 20,130" fill="white" stroke="#555" stroke-width="2.5"/>
        <text x="160" y="100" text-anchor="middle" font-size="22" font-weight="900" fill="#555">1</text>
        <!-- Parede (2) -->
        <rect x="50" y="130" width="220" height="120" fill="white" stroke="#555" stroke-width="2.5"/>
        <text x="100" y="210" text-anchor="middle" font-size="22" font-weight="900" fill="#555">2</text>
        <text x="230" y="210" text-anchor="middle" font-size="22" font-weight="900" fill="#555">2</text>
        <!-- Porta (3) -->
        <rect x="130" y="170" width="60" height="80" fill="white" stroke="#555" stroke-width="2.5"/>
        <text x="160" y="220" text-anchor="middle" font-size="22" font-weight="900" fill="#555">3</text>
        <!-- Chão / grama (4) -->
        <rect x="0" y="250" width="320" height="30" rx="4" fill="white" stroke="#555" stroke-width="2.5"/>
        <text x="160" y="270" text-anchor="middle" font-size="18" font-weight="900" fill="#555">4</text>
      </svg>
    </div>
  </div>`;
}

function buildTraceNumeros(at) {
  const items = at.numeros.map(n => `
    <div style="background:#fafafa;border-radius:14px;padding:16px;border:2.5px solid #eee;text-align:center">
      <div style="font-size:72px;font-weight:900;color:#ddd;margin-bottom:8px">${n}</div>
      <div style="font-size:13px;color:#aaa;margin-bottom:8px">Trace o número ${n}</div>
      <div style="border-bottom:2.5px solid var(--cor);height:28px;margin:0 16px"></div>
    </div>`).join('');
  return `<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:12px">${items}</div>`;
}

function buildDentroFora(at) {
  const items = at.cenas.map(c => `
    <div style="background:#fafafa;border-radius:14px;padding:16px;border:2.5px solid #eee;text-align:center">
      <div style="font-size:48px">${c.emoji}</div>
      <div style="font-size:13px;color:#666;margin:8px 0">${c.contexto}</div>
      <div style="width:48px;height:48px;border:2.5px dashed var(--cor);border-radius:10px;margin:0 auto"></div>
    </div>`).join('');
  return `<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px">${items}</div>`;
}

function buildCompletarDesenho(at) {
  const svgs = {
    rosto: `<svg width="140" height="140" viewBox="0 0 200 200">
      <defs><clipPath id="ch-l"><rect x="0" y="0" width="100" height="200"/></clipPath></defs>
      <circle cx="100" cy="100" r="75" fill="none" stroke="#ddd" stroke-width="2" stroke-dasharray="5,4"/>
      <circle cx="100" cy="100" r="75" fill="none" stroke="#555" stroke-width="3" clip-path="url(#ch-l)"/>
      <circle cx="68" cy="82" r="10" fill="#555" clip-path="url(#ch-l)"/>
      <path d="M56,66 Q68,59 80,63" fill="none" stroke="#555" stroke-width="3" stroke-linecap="round" clip-path="url(#ch-l)"/>
      <path d="M100,92 L88,118 Q92,123 98,121" fill="none" stroke="#888" stroke-width="2.5" stroke-linecap="round" clip-path="url(#ch-l)"/>
      <path d="M100,138 Q83,152 70,145" fill="none" stroke="#555" stroke-width="3" stroke-linecap="round" clip-path="url(#ch-l)"/>
      <line x1="100" y1="12" x2="100" y2="188" stroke="#ccc" stroke-width="1.5" stroke-dasharray="5,4"/>
    </svg>`,
    casa: `<svg width="140" height="140" viewBox="0 0 200 200">
      <defs><clipPath id="ch-c"><rect x="0" y="0" width="100" height="200"/></clipPath></defs>
      <polygon points="100,15 185,90 15,90" fill="none" stroke="#ddd" stroke-width="2" stroke-dasharray="5,4"/>
      <rect x="15" y="90" width="170" height="95" fill="none" stroke="#ddd" stroke-width="2" stroke-dasharray="5,4"/>
      <polygon points="100,15 185,90 15,90" fill="#FFF0E0" stroke="#555" stroke-width="3" clip-path="url(#ch-c)"/>
      <rect x="15" y="90" width="170" height="95" fill="#fafafa" stroke="#555" stroke-width="3" clip-path="url(#ch-c)"/>
      <rect x="28" y="105" width="35" height="28" fill="white" stroke="#555" stroke-width="2" clip-path="url(#ch-c)"/>
      <line x1="28" y1="119" x2="63" y2="119" stroke="#555" stroke-width="1.5" clip-path="url(#ch-c)"/>
      <line x1="45" y1="105" x2="45" y2="133" stroke="#555" stroke-width="1.5" clip-path="url(#ch-c)"/>
      <rect x="82" y="130" width="18" height="55" fill="#ddd" stroke="#555" stroke-width="2" clip-path="url(#ch-c)"/>
      <line x1="100" y1="12" x2="100" y2="188" stroke="#ccc" stroke-width="1.5" stroke-dasharray="5,4"/>
    </svg>`,
    borboleta: `<svg width="140" height="140" viewBox="0 0 200 200">
      <defs><clipPath id="ch-b"><rect x="0" y="0" width="100" height="200"/></clipPath></defs>
      <ellipse cx="140" cy="80" rx="52" ry="48" fill="none" stroke="#ddd" stroke-width="2" stroke-dasharray="5,4"/>
      <ellipse cx="135" cy="138" rx="38" ry="32" fill="none" stroke="#ddd" stroke-width="2" stroke-dasharray="5,4"/>
      <ellipse cx="60" cy="80" rx="52" ry="48" fill="#FFE8F5" stroke="#555" stroke-width="3" clip-path="url(#ch-b)"/>
      <ellipse cx="65" cy="138" rx="38" ry="32" fill="#FFE8F5" stroke="#555" stroke-width="3" clip-path="url(#ch-b)"/>
      <circle cx="55" cy="74" r="10" fill="none" stroke="#555" stroke-width="2.5" clip-path="url(#ch-b)"/>
      <circle cx="72" cy="92" r="7" fill="none" stroke="#555" stroke-width="2" clip-path="url(#ch-b)"/>
      <ellipse cx="100" cy="110" rx="7" ry="48" fill="#555"/>
      <path d="M96,62 Q84,38 79,22" fill="none" stroke="#555" stroke-width="2.5" stroke-linecap="round" clip-path="url(#ch-b)"/>
      <circle cx="79" cy="22" r="4" fill="#555" clip-path="url(#ch-b)"/>
      <line x1="100" y1="8" x2="100" y2="192" stroke="#ccc" stroke-width="1.5" stroke-dasharray="5,4"/>
    </svg>`
  };
  const items = at.figuras.map(f => `
    <div style="background:#fafafa;border-radius:14px;padding:16px;border:2.5px solid #eee;text-align:center">
      ${svgs[f] || svgs.rosto}
      <div style="font-size:12px;color:#aaa;margin-top:8px;font-weight:700">Complete o lado direito</div>
    </div>`).join('');
  return `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px">${items}</div>`;
}

function buildSeteDif(at) {
  const s1 = ['📚','✏️','📐','🎨','✂️','🏫','📌','🔔','🍎','🖊️','📏','🗑️'];
  const s2 = [...s1];
  [[0,'📓'],[2,'📍'],[4,'🖍️'],[6,'📎'],[8,'🍌'],[9,'📋'],[11,'🗂️']].forEach(([i,v]) => { s2[i]=v; });
  const grid = items => items.map(e =>
    `<div style="font-size:26px;padding:8px;text-align:center;border:1px solid #f0f0f0">${e}</div>`
  ).join('');
  return `<div style="display:flex;gap:12px;align-items:flex-start">
    <div style="flex:1">
      <div style="font-size:11px;font-weight:800;color:#666;text-align:center;margin-bottom:6px;text-transform:uppercase;letter-spacing:1px">Imagem 1</div>
      <div style="background:#fafafa;border-radius:12px;padding:8px;border:2.5px solid #eee;display:grid;grid-template-columns:repeat(4,1fr)">${grid(s1)}</div>
    </div>
    <div style="flex:1">
      <div style="font-size:11px;font-weight:800;color:#666;text-align:center;margin-bottom:6px;text-transform:uppercase;letter-spacing:1px">Imagem 2</div>
      <div style="background:#fafafa;border-radius:12px;padding:8px;border:2.5px solid #eee;display:grid;grid-template-columns:repeat(4,1fr)">${grid(s2)}</div>
    </div>
  </div>
  <div style="display:flex;gap:10px;justify-content:center;margin-top:14px">
    ${Array(7).fill(0).map((_,i) => `<div style="width:30px;height:30px;border:2.5px solid var(--cor);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:900;color:var(--cor)">${i+1}</div>`).join('')}
  </div>`;
}

// Extrai apenas o bloco <style>...</style> e os links do <head> do template
const HEAD_ASSETS = TEMPLATE.match(/(<link[^>]+>[\s\S]*?)?<style>[\s\S]*?<\/style>/)[0];

function buildPaginaHTML(at) {
  const icon = ICONS[at.faixa] || '📄';
  const conteudo = buildConteudo(at);
  return `<div class="pagina" style="--cor:${at.cor}">
  <div class="header">
    <div class="header-left">
      <div class="header-icon">${icon}</div>
      <div class="header-title">${at.titulo}</div>
    </div>
    <div class="header-faixa">${at.faixa} · ${at.idade}</div>
  </div>
  <div class="instrucao-box">
    <div class="instrucao-icon">👉</div>
    <div class="instrucao-text">${at.instrucao}</div>
  </div>
  <div class="conteudo">${conteudo}</div>
  <div class="footer">
    <div class="footer-marca">Aulas Desplugadas</div>
    <div>Nome: <span class="nome-linha"></span></div>
    <div class="footer-faixa">${at.faixa}</div>
  </div>
</div>`;
}

// --- MAIN ---
async function main() {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 794, height: 1123 });

  const faixas = ['Maternal', 'Jardim', 'Pré-Escola'];
  const nomes = { 'Maternal': 'Maternal (2-3 anos)', 'Jardim': 'Jardim (4-5 anos)', 'Pré-Escola': 'Pré-Escola (5-6 anos)' };

  for (const faixa of faixas) {
    const grupo = ATIVIDADES.filter(a => a.faixa === faixa);
    const paginas = grupo.map(buildPaginaHTML).join('\n');

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
${HEAD_ASSETS}
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: 'Nunito', 'Noto Color Emoji', sans-serif; background:#fff; }
  .pagina {
    width: 794px; height: 1123px;
    padding: 32px 36px;
    display: flex; flex-direction: column;
    page-break-after: always;
    break-after: page;
  }
  .pagina:last-child { page-break-after: avoid; break-after: avoid; }
</style>
</head>
<body>${paginas}</body>
</html>`;

    await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await new Promise(r => setTimeout(r, 800));

    const fname = `Aulas Desplugadas — ${nomes[faixa]}.pdf`;
    await page.pdf({
      path: path.join(OUT_DIR, fname),
      width: '794px', height: '1123px',
      printBackground: true,
      pageRanges: ''
    });
    console.log(`✅ ${fname} (${grupo.length} páginas)`);
  }

  await browser.close();
  console.log(`\n🎉 3 PDFs gerados em: ${OUT_DIR}`);
}

if (require.main === module) {
  main().catch(e => { console.error(e); process.exit(1); });
}

module.exports = { buildConteudo, buildPaginaHTML, ICONS, ATIVIDADES, HEAD_ASSETS };
