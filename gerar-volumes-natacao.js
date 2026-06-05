// Monta os 3 VOLUMES de natação (Iniciante / Intermediário / Avançado), 50 treinos cada = 150.
// Reaproveita a ficha e os helpers de gerar-pack-natacao.js. Conteúdo em gerar-pack + dados-extras (à mão).
//   node gerar-volumes-natacao.js                 -> os 3 volumes
//   node gerar-volumes-natacao.js iniciante        -> só um volume
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const puppeteer = require('puppeteer');
const { PDFDocument } = require('pdf-lib');
const base = require('./gerar-pack-natacao');
const { EXTRAS } = require('./dados-extras-natacao');
const { NIVEIS, htmlFicha, htmlToPdf, swapHD, mascFile, masc, GAGALIN, esc, AUTOR } = base;

const OUT = path.join(__dirname, 'oferta-natacao');
fs.mkdirSync(OUT, { recursive: true });
const ALL = [...base.TREINOS, ...EXTRAS];

// grupo (foco) dos 30 treinos originais, que não têm o campo "grupo"
const GRUPO30 = {
  'Perdendo o Medo da Água':'Adaptação & Segurança', 'Bolhas e Borbulhas':'Respiração',
  'Estrela e Foguete':'Flutuação & Deslize', 'A Primeira Batida de Pernas':'Pernada',
  'Costas sem Afundar':'Costas', 'Meus Primeiros 25 Metros':'Primeiros Nados & Desafios',
  'Mergulho do Patinho':'Adaptação & Segurança', 'Deslize com Pernada':'Flutuação & Deslize',
  'Os Primeiros Braços de Crawl':'Braçada & Coordenação', 'Flutuar, Virar e Respirar':'Adaptação & Segurança',
  'Respiração dos Dois Lados':'Respiração & Viradas', 'Cotovelo Alto, Braçada Longa':'Técnica de Crawl',
  'A Virada que Não Para o Treino':'Respiração & Viradas', 'Peito: Puxa, Respira, Desliza':'Peito',
  'Costas Reta como uma Régua':'Costas', 'Resistência: 400 sem Parar':'Resistência & Base',
  'Borboleta sem Medo':'Borboleta', 'Pernada de Peito Afiada':'Peito',
  'Circuito de Educativos':'Técnica de Crawl', 'O Gostinho da Velocidade':'Velocidade (intro)',
  'Tiros de 25: Pura Velocidade':'Velocidade & Potência', 'No Limiar':'Limiar & Resistência',
  'Pace de Prova: O Cronômetro Manda':'Prova & Pace', 'Saída de Bloco e Primeiros 15m':'Saídas & Viradas',
  'VO2: A Caixa Vermelha':'VO2 & Intervalado', 'Simulado de Prova: 100m Pra Valer':'Prova & Pace',
  'O Longão Aeróbico':'Limiar & Resistência', 'Medley: Domando os 4 Estilos':'Técnica & Medley',
  'Força na Água: Palmar e Pull':'Força & Específico', 'Tolerância ao Lactato: Os 50 Bravos':'VO2 & Intervalado',
};
const grupoDe = t => t.grupo || GRUPO30[t.titulo] || 'Treinos';

const ORDEM = {
  iniciante:     ['Adaptação & Segurança','Respiração','Flutuação & Deslize','Pernada','Braçada & Coordenação','Costas','Primeiros Nados & Desafios'],
  intermediario: ['Técnica de Crawl','Costas','Peito','Borboleta','Respiração & Viradas','Resistência & Base','Velocidade (intro)'],
  avancado:      ['Velocidade & Potência','Limiar & Resistência','VO2 & Intervalado','Prova & Pace','Saídas & Viradas','Técnica & Medley','Força & Específico'],
};
const VOLS = {
  iniciante:     { num:1, rotulo:'Iniciante',     sub:'Do primeiro contato com a água ao primeiro nado — 50 treinos pra construir a base, vencer o medo e formar um nadador.' },
  intermediario: { num:2, rotulo:'Intermediário', sub:'Os 4 nados, técnica, viradas e resistência — 50 treinos pra transformar quem já nada num nadador completo.' },
  avancado:      { num:3, rotulo:'Avançado',      sub:'Velocidade, limiar, VO2, prova e força — 50 treinos pra levar o atleta ao desempenho de competição.' },
};

// ───────────────────── capa do volume ─────────────────────
function htmlCapaVol(chave) {
  const N = NIVEIS[chave], V = VOLS[chave], m = masc(chave);
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    @page{size:A4;margin:0} *{margin:0;padding:0;box-sizing:border-box}
    @font-face{font-family:'Gagalin';src:url(data:font/otf;base64,${GAGALIN}) format('opentype')}
    body{width:210mm;height:297mm;font-family:'Nunito','Segoe UI',Arial,sans-serif;color:#fff;
      background:radial-gradient(120% 80% at 50% 0%, ${N.p} 0%, #0c2840 55%, #06121f 100%);
      display:flex;flex-direction:column;align-items:center;justify-content:space-between;padding:24mm 18mm 16mm;overflow:hidden;position:relative}
    .dots{position:absolute;inset:0;background-image:radial-gradient(circle,#fff 1.5px,transparent 1.5px);background-size:46px 46px;opacity:.05}
    .vol{font-family:'Gagalin';font-size:12pt;letter-spacing:4px;background:${N.p};border-radius:30px;padding:2.5mm 9mm;text-transform:uppercase;box-shadow:0 4px 14px rgba(0,0,0,.35)}
    .badge{font-size:10pt;font-weight:800;letter-spacing:3px;color:rgba(255,255,255,.8);text-transform:uppercase;margin-top:4mm}
    .titulo{font-family:'Gagalin';font-size:40pt;line-height:1.02;text-align:center;margin:5mm 0 2mm;text-shadow:0 4px 16px rgba(0,0,0,.4)}
    .nivel{font-family:'Gagalin';font-size:30pt;color:${N.s};text-shadow:0 3px 12px rgba(0,0,0,.4)}
    .sub{font-size:13.5pt;font-weight:700;color:rgba(255,255,255,.86);text-align:center;max-width:155mm;line-height:1.4;margin-top:4mm}
    .masc{width:96mm;height:96mm;object-fit:contain;filter:drop-shadow(0 10px 14px rgba(0,0,0,.5))}
    .rodape{font-family:'Gagalin';font-size:16pt;letter-spacing:1px}
  </style></head><body>
    <div class="dots"></div>
    <div style="z-index:1;display:flex;flex-direction:column;align-items:center">
      <div class="vol">Volume ${V.num}</div>
      <div class="titulo">Treinos de<br>Natação</div>
      <div class="nivel">Nível ${esc(V.rotulo)}</div>
      <div class="sub">${esc(V.sub)}</div>
    </div>
    ${m?`<img class="masc" src="${m}"/>`:''}
    <div style="z-index:1;text-align:center">
      <div class="badge">🏊 50 Treinos Prontos</div>
      <div class="rodape" style="margin-top:4mm">por ${esc(AUTOR)}</div>
    </div>
  </body></html>`;
}

// ───────────────────── manual do volume (1 página) ─────────────────────
function htmlManualVol(chave) {
  const N = NIVEIS[chave], V = VOLS[chave];
  const card = (t, inner) => `<div style="border:2px solid color-mix(in srgb, ${N.p} 30%, #fff);border-radius:14px;background:#fff;padding:3.4mm 4.4mm;box-shadow:0 2px 0 color-mix(in srgb, ${N.p} 18%, #fff),0 4px 9px rgba(20,40,80,.06)"><div style="font-family:'Gagalin','Nunito',sans-serif;font-size:11.5pt;color:${N.p};text-transform:uppercase;letter-spacing:.4px;margin-bottom:2mm">${t}</div>${inner}</div>`;
  const bull = a => a.map(t=>`<div style="display:flex;gap:3mm;padding:1.4mm 0;font-size:9.7pt;font-weight:600;line-height:1.45;color:#333"><span style="color:${N.p};font-weight:900">›</span><div>${t}</div></div>`).join('');
  const linha = (rot,d)=>`<div style="display:flex;gap:3mm;padding:1.5mm 0;border-bottom:1px solid #eef0f6"><div style="flex:0 0 auto;width:40mm;font-family:'Gagalin','Nunito',sans-serif;font-size:9pt;color:${N.p};text-transform:uppercase">${rot}</div><div style="flex:1;font-size:9.3pt;font-weight:600;color:#444;line-height:1.4">${d}</div></div>`;
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    @page{size:A4;margin:0} *{margin:0;padding:0;box-sizing:border-box}
    @font-face{font-family:'Gagalin';src:url(data:font/otf;base64,${GAGALIN}) format('opentype')}
    body{width:210mm;height:297mm;font-family:'Nunito','Segoe UI',Arial,sans-serif;color:#1a1a2e;padding:13mm 15mm 14mm;background:linear-gradient(165deg, color-mix(in srgb, ${N.p} 13%, #fff) 0%, #fff 55%, color-mix(in srgb, ${N.s} 16%, #fff) 100%);overflow:hidden;display:flex;flex-direction:column}
    h1{font-family:'Gagalin';font-size:22pt;color:${N.p}}
    .hs{font-size:10.5pt;font-weight:700;color:#566;margin-top:1mm}
    .flow{flex:1;display:flex;flex-direction:column;justify-content:space-between;padding-top:4mm}
  </style></head><body>
    <h1>Volume ${V.num} — Nível ${esc(V.rotulo)}</h1>
    <div class="hs">Como usar estes 50 treinos</div>
    <div class="flow">
      ${card('O que tem neste volume', bull([
        `<b>50 treinos prontos</b> do nível ${V.rotulo}, cada um em 1 página — é só levar pra beira da piscina e aplicar.`,
        'Organizados por <b>foco de treino</b> (veja o Sumário na próxima página): cada bloco trabalha uma habilidade.',
        'Fazem parte da coleção de 3 volumes: Iniciante, Intermediário e Avançado.',
      ]))}
      ${card('Como ler uma ficha de treino',
        linha('🎯 Objetivo','O que o treino desenvolve e por quê.') +
        linha('🏊 Equipamentos','O que separar antes (prancha, pull buoy, palmar...).') +
        linha('🌊 Estrutura','Aquecimento → parte principal → soltura, com as séries.') +
        linha('⭐ Variações','Como deixar mais fácil, mais difícil ou em grupo.') +
        linha('✅ O que observar','Os pontos pra corrigir enquanto o aluno nada.') +
        linha('💡 Dica do técnico','O macete prático de quem já deu muita aula.')
      )}
      ${card('Como aproveitar melhor', bull([
        'Siga a ordem do Sumário pra ter uma progressão, ou escolha pelo foco do dia.',
        '<b>Sempre aqueça e faça a soltura</b> — previnem lesão e fixam a técnica.',
        '<b>Segurança sempre:</b> nunca tire o olho de aluno na água; respeite a profundidade de cada nível.',
        'Repita cada treino algumas vezes antes de avançar — a evolução vem da constância.',
      ]))}
    </div>
  </body></html>`;
}

// ───────────────────── sumário do volume (por foco, 2 colunas) ─────────────────────
function htmlSumarioVol(chave, grupos) {
  const N = NIVEIS[chave], V = VOLS[chave];
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    @page{size:A4;margin:0} *{margin:0;padding:0;box-sizing:border-box}
    @font-face{font-family:'Gagalin';src:url(data:font/otf;base64,${GAGALIN}) format('opentype')}
    body{width:210mm;height:297mm;font-family:'Nunito','Segoe UI',Arial,sans-serif;color:#1a1a2e;padding:13mm 14mm;background:#fff;overflow:hidden}
    h1{font-family:'Gagalin';font-size:22pt;color:${N.p};margin-bottom:1mm}
    .leg{font-size:9pt;font-weight:700;color:#64748b;margin-bottom:3mm}
    .cols{column-count:2;column-gap:8mm}
    .sec{break-inside:avoid;margin-bottom:2.6mm}
    .sh{font-family:'Gagalin';font-size:9.5pt;color:#fff;padding:1mm 3mm;border-radius:7px;background:linear-gradient(90deg,${N.p},${N.s});text-transform:uppercase;letter-spacing:.3px}
    .lin{display:flex;align-items:baseline;justify-content:space-between;padding:.7mm 1mm .7mm 3mm;border-bottom:1px dotted #ccd}
    .lin .t{font-size:8.6pt;font-weight:700;color:#23304a;line-height:1.2}
    .lin .pg{font-family:'Gagalin';font-size:8.4pt;color:${N.p};padding-left:2mm}
  </style></head><body>
    <h1>Sumário — Volume ${V.num}</h1>
    <div class="leg">Os 50 treinos do nível ${esc(V.rotulo)}, organizados por foco de treino</div>
    <div class="cols">
      ${grupos.map(g=>`<div class="sec">
        <div class="sh">${esc(g.grupo)} · ${g.itens.length}</div>
        ${g.itens.map(it=>`<div class="lin"><span class="t">${esc(it.titulo)}</span><span class="pg">${it.pagina}</span></div>`).join('')}
      </div>`).join('')}
    </div>
  </body></html>`;
}

// ───────────────────── monta 1 volume ─────────────────────
async function montarVolume(browser, chave) {
  const V = VOLS[chave];
  const ordem = ORDEM[chave];
  const treinos = ALL.filter(t => t.nivel === chave)
    .sort((a,b) => (ordem.indexOf(grupoDe(a)) - ordem.indexOf(grupoDe(b))));
  // páginas: capa(1) manual(2) sumário(3) treinos(4..)
  const PRIM = 4;
  const gmap = {};
  treinos.forEach((t,i) => { (gmap[grupoDe(t)] = gmap[grupoDe(t)] || { grupo:grupoDe(t), itens:[] }).itens.push({ titulo:t.titulo, pagina:PRIM+i }); });
  const grupos = ordem.map(g => gmap[g]).filter(Boolean);

  console.log(`\n>>> Volume ${V.num} — ${V.rotulo} (${treinos.length} treinos)`);
  const capaPdf = swapHD(await htmlToPdf(browser, htmlCapaVol(chave)), mascFile(chave));
  const manPdf  = await htmlToPdf(browser, htmlManualVol(chave));
  const sumPdf  = await htmlToPdf(browser, htmlSumarioVol(chave, grupos));

  const fichaPdfs = [];
  for (let i=0;i<treinos.length;i++) {
    const t = treinos[i];
    process.stdout.write(`  ficha ${i+1}/${treinos.length}... `);
    let buf = await htmlToPdf(browser, htmlFicha(t, PRIM+i));
    buf = swapHD(buf, mascFile(chave));
    fichaPdfs.push(buf);
    console.log('ok');
  }

  const final = await PDFDocument.create();
  for (const buf of [capaPdf, manPdf, sumPdf, ...fichaPdfs]) {
    const src = await PDFDocument.load(buf);
    const pgs = await final.copyPages(src, src.getPageIndices());
    pgs.forEach(p => final.addPage(p));
  }
  const dest = path.join(OUT, `volume-${V.num}-${chave}.pdf`);
  fs.writeFileSync(dest, await final.save());
  // compacta (junta as imagens repetidas do mascote)
  try {
    const tmp = dest.replace('.pdf','_o.pdf');
    const py = 'import fitz,sys; d=fitz.open(sys.argv[1]); d.save(sys.argv[2], garbage=4, deflate=True, clean=True)';
    for (const bin of [process.env.PYTHON_BIN,'python','python3'].filter(Boolean)) {
      try { cp.execFileSync(bin, ['-c', py, dest, tmp], { stdio:'ignore', timeout:120000 }); fs.renameSync(tmp, dest); break; } catch(e){}
    }
  } catch(_){}
  const mb = Math.round(fs.statSync(dest).size/1024/1024*10)/10;
  console.log(`PRONTO: ${path.basename(dest)} (${final.getPageCount()} páginas, ${mb}MB)`);
}

(async () => {
  const alvo = process.argv.slice(2).filter(a => NIVEIS[a]);
  const chaves = alvo.length ? alvo : ['iniciante','intermediario','avancado'];
  const browser = await puppeteer.launch({ headless:'new', args:['--no-sandbox','--disable-setuid-sandbox'] });
  for (const c of chaves) await montarVolume(browser, c);
  await browser.close();
  try { fs.rmSync(path.join(OUT,'.tmp'), { recursive:true, force:true }); } catch(_){}
  console.log('\n=== TODOS OS VOLUMES PRONTOS ===  Pasta:', OUT);
  process.exit(0);
})().catch(e => { console.error('ERRO:', e.message); process.exit(1); });
