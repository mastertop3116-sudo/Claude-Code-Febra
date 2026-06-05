// Monta um PACK de 20 dinâmicas de jiu-jitsu infantil, organizado por faixa (progressão kids).
//   node gerar-pack.js          -> gera de verdade (usa Claude p/ o conteúdo) [gasta crédito]
//   node gerar-pack.js --dry    -> usa conteúdo salvo repetido, só p/ testar capa/sumário/junção [grátis]
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const { PDFDocument } = require('pdf-lib');
const eng = require('./departments/creative/engines/criador_engine');

const OUT = path.join(__dirname, 'audit-pdfs');
fs.mkdirSync(OUT, { recursive: true });
const DRY = process.argv.includes('--dry');

const NICHO   = 'jiu-jitsu infantil';
const AUTOR   = process.env.PACK_AUTOR || 'Mestre Bruno';
const PUBLICO = 'professores de jiu-jitsu que dão aula para crianças de 4 a 12 anos';
const POR_FAIXA = DRY ? 2 : 4;

const BELTS = [
  { chave:'branca',  rotulo:'Faixa Branca',  cor:'#64748b', cor2:'#cbd5e1', nivel:'iniciante absoluto: primeiro contato com o tatame, foco em adaptação, brincadeira, segurança e quedas amortecidas' },
  { chave:'cinza',   rotulo:'Faixa Cinza',   cor:'#6b7280', cor2:'#d1d5db', nivel:'iniciante: base de luta, pegadas na gola/manga, primeiras posições de guarda e montada de forma lúdica' },
  { chave:'amarela', rotulo:'Faixa Amarela', cor:'#ca8a04', cor2:'#fde047', nivel:'intermediário inicial: guarda fechada, fugas de quadril, manter e recuperar posição' },
  { chave:'laranja', rotulo:'Faixa Laranja', cor:'#ea580c', cor2:'#fdba74', nivel:'intermediário: passagens de guarda simples, raspagens básicas e transições entre posições' },
  { chave:'verde',   rotulo:'Faixa Verde',   cor:'#16a34a', cor2:'#86efac', nivel:'avançado kids: combinações, finalizações adaptadas para crianças e mini-treinos com regras' },
];

const esc = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const b64 = p => fs.existsSync(p) ? fs.readFileSync(p).toString('base64') : null;
const GAGALIN = b64(path.join(__dirname,'assets/fonts/Gagalin-Regular.otf'));

// ───────────────────── conteúdo (Claude, em lote por faixa) ─────────────────────
const SCHEMA = `Cada dinâmica é um objeto JSON com:
{
 "titulo": "nome criativo e chamativo da dinâmica (máx 6 palavras, sem ponto final)",
 "subtitulo": "uma linha curta dizendo o que treina, de um jeito convidativo",
 "faixa_etaria": "ex: 6 a 10 anos",
 "duracao": "ex: 15 a 20 min",
 "objetivo": "1 parágrafo (máx 3 frases): o que a criança desenvolve e por quê, ligado a um fundamento REAL do jiu-jitsu",
 "materiais": ["item curto","item curto","item curto"],
 "passo_a_passo": [ {"titulo":"título curto do passo","descricao":"1 a 2 frases, máx 30 palavras"} ],  // 4 a 5 passos
 "variacoes": [ {"contexto":"Mais fácil/Mais difícil/Em dupla...","descricao":"1 frase"} ],  // EXATAMENTE 3
 "dica_professor": "1 dica em 1ª pessoa começando com 'O que funciona pra mim' ou 'Eu costumo' (máx 2 frases)",
 "o_que_observar": ["ponto de observação curto","idem","idem"]
}`;

async function gerarDinamicas(belt) {
  const Anthropic = require('@anthropic-ai/sdk');
  const anthropic = new Anthropic.default({ apiKey: process.env.ANTHROPIC_API_KEY });
  const modelo = process.env.CRIADOR_MODELO || 'claude-sonnet-4-6';
  const sistema = `Você é um faixa-preta de jiu-jitsu e professor de crianças com 15 anos de experiência. Escreve fichas de dinâmica práticas, específicas e que SOAM HUMANAS (1ª pessoa nas dicas). PROIBIDO inventar depoimento, estatística ou nome de aluno. Nada de enchimento. Cada dinâmica deve ser DIFERENTE das outras (objetivos e mecânicas distintas).`;
  const prompt = `Crie ${POR_FAIXA} dinâmicas DIFERENTES de jiu-jitsu para crianças, todas no nível ${belt.rotulo} — ${belt.nivel}.
${SCHEMA}
Responda APENAS com JSON válido: {"dinamicas":[ ... ${POR_FAIXA} objetos ... ]}. Sem texto fora do JSON.`;
  const resp = await anthropic.messages.create({ model: modelo, max_tokens: 8000, temperature: 0.7, system: sistema, messages:[{role:'user',content:prompt}] });
  let raw = (resp.content||[]).map(b=>b.text||'').join('');
  raw = raw.replace(/```json/gi,'').replace(/```/g,'').trim();
  const i = raw.indexOf('{'), j = raw.lastIndexOf('}'); if (i>=0 && j>i) raw = raw.slice(i,j+1);
  const obj = JSON.parse(raw);
  return (obj.dinamicas||obj.dynamics||[]).slice(0, POR_FAIXA);
}

// ───────────────────── capa + sumário (HTML → PDF) ─────────────────────
function htmlCapa() {
  const mascotes = BELTS.map(b=>`data:image/png;base64,${b64(path.join(__dirname,`assets/mascotes/jj-${b.chave}-transp.png`))}`);
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
  @page{size:A4;margin:0} *{margin:0;padding:0;box-sizing:border-box}
  @font-face{font-family:'Gagalin';src:url(data:font/otf;base64,${GAGALIN}) format('opentype')}
  body{width:210mm;height:297mm;font-family:'Nunito Sans',Arial,sans-serif;color:#fff;
    background:radial-gradient(120% 80% at 50% 0%, #1e3a8a 0%, #0a1224 60%, #060a17 100%);
    display:flex;flex-direction:column;align-items:center;justify-content:space-between;padding:26mm 18mm 16mm;overflow:hidden;position:relative}
  .dots{position:absolute;inset:0;background-image:radial-gradient(circle,#fff 1.5px,transparent 1.5px);background-size:46px 46px;opacity:0.04}
  .badge{font-family:'Gagalin';font-size:11pt;letter-spacing:3px;background:rgba(255,255,255,.12);border:1.5px solid rgba(255,255,255,.3);
    border-radius:30px;padding:3mm 8mm;text-transform:uppercase}
  .titulo{font-family:'Gagalin';font-size:46pt;line-height:1.02;text-align:center;margin:6mm 0 3mm;text-shadow:0 4px 16px rgba(0,0,0,.4)}
  .sub{font-size:15pt;font-weight:700;color:rgba(255,255,255,.85);text-align:center;max-width:150mm;line-height:1.4}
  .mascotes{display:flex;gap:2mm;align-items:flex-end;justify-content:center;width:100%}
  .mascotes img{width:36mm;height:36mm;object-fit:contain;filter:drop-shadow(0 6px 8px rgba(0,0,0,.45))}
  .rodape{font-family:'Gagalin';font-size:16pt;letter-spacing:1px}
  .faixas-leg{display:flex;gap:4mm;justify-content:center;margin-top:2mm;font-size:9pt;font-weight:800;color:rgba(255,255,255,.7)}
  .pip{display:inline-block;width:3mm;height:3mm;border-radius:50%;margin-right:1mm;vertical-align:middle}
  </style></head><body>
    <div class="dots"></div>
    <div style="z-index:1;display:flex;flex-direction:column;align-items:center">
      <div class="badge">🥋 20 Dinâmicas</div>
      <div class="titulo">Dinâmicas de<br>Jiu-Jitsu Infantil</div>
      <div class="sub">Da Faixa Branca à Verde — uma progressão pronta de 20 dinâmicas lúdicas para as suas aulas com crianças.</div>
    </div>
    <div class="mascotes" style="z-index:1">${mascotes.map(m=>`<img src="${m}"/>`).join('')}</div>
    <div style="z-index:1;text-align:center">
      <div class="faixas-leg">${BELTS.map(b=>`<span><span class="pip" style="background:${b.cor}"></span>${esc(b.rotulo)}</span>`).join('')}</div>
      <div class="rodape" style="margin-top:5mm">por ${esc(AUTOR)}</div>
    </div>
  </body></html>`;
}

function htmlSumario(indice) {
  // indice: [{belt, itens:[{titulo, pagina}]}]
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
  @page{size:A4;margin:0} *{margin:0;padding:0;box-sizing:border-box}
  @font-face{font-family:'Gagalin';src:url(data:font/otf;base64,${GAGALIN}) format('opentype')}
  body{width:210mm;height:297mm;font-family:'Nunito Sans',Arial,sans-serif;color:#1a1a2e;padding:13mm 16mm;background:#fff;overflow:hidden}
  h1{font-family:'Gagalin';font-size:22pt;color:#0a1224;margin-bottom:4mm}
  .sec{margin-bottom:2.4mm;break-inside:avoid}
  .sec-h{display:flex;align-items:center;gap:3mm;font-family:'Gagalin';font-size:11.5pt;color:#fff;padding:1.4mm 5mm;border-radius:9px}
  .lin{display:flex;align-items:baseline;justify-content:space-between;padding:1mm 2mm 1mm 8mm;border-bottom:1px dotted #ccd}
  .lin .t{font-size:10pt;font-weight:700;color:#23304a}
  .lin .pg{font-family:'Gagalin';font-size:10pt;color:#64748b}
  </style></head><body>
    <h1>Sumário</h1>
    ${indice.map(s=>`<div class="sec">
      <div class="sec-h" style="background:linear-gradient(90deg,${s.belt.cor},${s.belt.cor2})">🥋 ${esc(s.belt.rotulo)}</div>
      ${s.itens.map(it=>`<div class="lin"><span class="t">${esc(it.titulo)}</span><span class="pg">${it.pagina}</span></div>`).join('')}
    </div>`).join('')}
  </body></html>`;
}

async function htmlToPdf(browser, html) {
  const page = await browser.newPage();
  await page.setViewport({ width:794, height:1123 });
  await page.setContent(html, { waitUntil:'networkidle0', timeout:60000 });
  await new Promise(r=>setTimeout(r,400));
  const buf = await page.pdf({ format:'A4', printBackground:true, margin:{top:0,right:0,bottom:0,left:0} });
  await page.close();
  return buf;
}

// ───────────────────── montagem ─────────────────────
(async () => {
  console.log(`>>> Montando pack (${DRY?'DRY/teste':'real'}) — ${POR_FAIXA} por faixa × ${BELTS.length} faixas`);
  // 1) conteúdo (salva em pack-conteudo.json; --reuse reaproveita sem gastar Claude)
  const REUSE = process.argv.includes('--reuse');
  const savePath = path.join(OUT, 'pack-conteudo.json');
  let fichas = []; // {conteudo, belt}
  if (REUSE && fs.existsSync(savePath)) {
    fichas = JSON.parse(fs.readFileSync(savePath,'utf8'));
    console.log(`  reusando conteúdo salvo: ${fichas.length} dinâmicas`);
  } else {
    const conteudoSalvo = (() => { try { return JSON.parse(fs.readFileSync(path.join(OUT,'ficha_conteudo.json'),'utf8')); } catch(_) { return null; } })();
    for (const belt of BELTS) {
      let lista;
      if (DRY) { lista = Array.from({length:POR_FAIXA}, (_,k)=>({ ...conteudoSalvo, titulo:`${conteudoSalvo.titulo} ${belt.chave} ${k+1}` })); }
      else { process.stdout.write(`  gerando ${belt.rotulo}... `); lista = await gerarDinamicas(belt); console.log(`${lista.length} dinâmicas`); }
      lista.forEach(c => fichas.push({ conteudo:c, belt }));
    }
    if (!DRY) fs.writeFileSync(savePath, JSON.stringify(fichas, null, 2));
    console.log(`  total: ${fichas.length} dinâmicas (conteúdo salvo p/ reuso)`);
  }

  // 2) índice (pág: capa=1, sumário=2, fichas começam em 3)
  const PRIM = 3;
  const indiceMap = {};
  fichas.forEach((f,i)=>{ (indiceMap[f.belt.chave] = indiceMap[f.belt.chave]||{belt:f.belt,itens:[]}).itens.push({ titulo:f.conteudo.titulo||`Dinâmica ${i+1}`, pagina: PRIM+i }); });
  const indice = BELTS.map(b=>indiceMap[b.chave]).filter(Boolean);

  // 3) renderiza tudo
  const browser = await puppeteer.launch({ headless:'new', args:['--no-sandbox','--disable-setuid-sandbox'] });
  console.log('  renderizando capa + sumário...');
  const capaPdf = await htmlToPdf(browser, htmlCapa());
  const sumPdf  = await htmlToPdf(browser, htmlSumario(indice));
  await browser.close();

  const fichaPdfs = [];
  for (let i=0;i<fichas.length;i++) {
    const { conteudo, belt } = fichas[i];
    process.stdout.write(`  ficha ${i+1}/${fichas.length} (${belt.chave})... `);
    const r = await eng.renderizarPDF(conteudo, { tipo:'ficha_dinamica', nicho:NICHO, faixa:belt.chave, autor:AUTOR, publico:PUBLICO, pagina:PRIM+i });
    fichaPdfs.push(r.pdfBuffer);
    console.log('ok');
  }

  // 4) junta tudo
  console.log('  juntando PDF...');
  const final = await PDFDocument.create();
  for (const buf of [capaPdf, sumPdf, ...fichaPdfs]) {
    const src = await PDFDocument.load(buf);
    const pgs = await final.copyPages(src, src.getPageIndices());
    pgs.forEach(p=>final.addPage(p));
  }
  const bytes = await final.save();
  const dest = path.join(OUT, 'pack-jiujitsu-20.pdf');
  fs.writeFileSync(dest, bytes);
  // compacta: junta as imagens repetidas (mesmo mascote em várias páginas) sem perder qualidade
  try {
    const cp = require('child_process');
    const tmp = dest.replace('.pdf','_otim.pdf');
    const py = 'import fitz,sys; d=fitz.open(sys.argv[1]); d.save(sys.argv[2], garbage=4, deflate=True, clean=True)';
    for (const bin of [process.env.PYTHON_BIN,'python','python3'].filter(Boolean)) {
      try { cp.execFileSync(bin, ['-c', py, dest, tmp], { stdio:'ignore', timeout:90000 }); fs.renameSync(tmp, dest); break; } catch(e){}
    }
  } catch(_){}
  const fim = fs.statSync(dest).size;
  console.log(`\nPRONTO: ${dest}  (${final.getPageCount()} páginas, ${Math.round(fim/1024/1024*10)/10}MB)`);
  process.exit(0);
})().catch(e=>{ console.error('ERRO:', e.message); process.exit(1); });
