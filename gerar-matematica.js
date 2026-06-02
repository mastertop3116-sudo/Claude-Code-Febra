// GERADOR DE ATIVIDADES DE MATEMÁTICA — +100 atividades printáveis pra anos iniciais.
// Atividades de NÚMERO de verdade (não caça-palavras): 100% programático, custo zero, com GABARITO.
// 6 tipos: somar, subtrair, multiplicar (tabuada), ligue a conta ao resultado, sequência, maior/menor/igual.
//   node gerar-matematica.js 100
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const { PDFDocument } = require('pdf-lib');

const QTD = parseInt(process.argv[2] || '100', 10);
const CFG = JSON.parse(fs.readFileSync(path.join(__dirname, 'nichos-atividades', 'matematica.json'), 'utf8'));
const OUT = path.join(__dirname, 'oferta-matematica');
fs.mkdirSync(OUT, { recursive: true });
const GAGALIN = fs.readFileSync(path.join(__dirname, 'assets/fonts/Gagalin-Regular.otf')).toString('base64');

const COR = CFG.cor || '#059669', COR2 = CFG.cor2 || '#34d399';
const esc = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

let _seed = 7;
const rnd = () => (_seed = (_seed*1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
const ri = (a,b) => a + Math.floor(rnd()*(b-a+1));
const shuffle = a => { a=a.slice(); for(let i=a.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; };

const CSS = `
@page{size:A4;margin:0} *{margin:0;padding:0;box-sizing:border-box}
@font-face{font-family:'Gagalin';src:url(data:font/otf;base64,${GAGALIN}) format('opentype')}
body{font-family:'Nunito','Segoe UI',Arial,sans-serif;color:#1a1a2e}
.page{width:210mm;height:297mm;position:relative;overflow:hidden;page-break-after:always;background:#fff}
.page:last-child{page-break-after:auto}
.top{background:linear-gradient(100deg,${COR},${COR2});padding:9mm 14mm 7mm;color:#fff;position:relative}
.kick{font-size:8.5pt;font-weight:800;letter-spacing:2px;text-transform:uppercase;opacity:.9}
.tt{font-family:'Gagalin';font-size:21pt;line-height:1.05;margin-top:1mm}
.ins{font-size:10.5pt;font-weight:700;color:rgba(255,255,255,.92);margin-top:1.5mm}
.area{padding:9mm 14mm;height:calc(297mm - 50mm);display:flex;flex-direction:column}
.foot{position:absolute;bottom:0;left:0;right:0;height:9mm;display:flex;align-items:center;justify-content:space-between;padding:0 14mm;background:${COR}0d;border-top:1.5px dashed ${COR}33}
.foot .a{font-size:7.5pt;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:${COR}}
.foot .n{font-family:'Gagalin';font-size:9pt;color:#8893a8}
.box{display:inline-block;min-width:14mm;height:9mm;border:2px solid ${COR}66;border-radius:7px;vertical-align:middle}
.qn{font-family:'Gagalin';color:${COR};font-size:11pt;margin-right:2mm}
`;

let _pg = 0;
function page(kicker, titulo, instr, areaHTML) {
  _pg++;
  return `<div class="page">
    <div class="top"><div class="kick">${esc(kicker)}</div><div class="tt">${esc(titulo)}</div><div class="ins">${instr}</div></div>
    <div class="area">${areaHTML}</div>
    <div class="foot"><span class="a">${esc(CFG.autor||'')}</span><span class="n">${_pg}</span></div>
  </div>`;
}

// duas colunas de problemas numerados com caixinha de resposta
function gridProblemas(probs) {
  const cell = (p,i) => `<div style="display:flex;align-items:center;gap:3mm;padding:3.2mm 0">
      <span class="qn">${i+1})</span>
      <span style="font-size:18pt;font-weight:800;color:#26334d;letter-spacing:1px">${p.q} =</span>
      <span class="box"></span></div>`;
  const half = Math.ceil(probs.length/2);
  const col = (arr,off) => `<div style="flex:1">${arr.map((p,i)=>cell(p,off+i)).join('')}</div>`;
  return `<div style="flex:1;display:flex;gap:12mm;justify-content:center;align-items:center">
      ${col(probs.slice(0,half),0)}${col(probs.slice(half),half)}</div>`;
}
const gabLista = probs => probs.map((p,i)=>`<b style="color:${COR}">${i+1})</b> ${p.a}`).join('&nbsp;&nbsp;·&nbsp;&nbsp;');

// ───────── ENGINES ─────────
function contas(sym, gen) {
  const probs = [];
  for (let i=0;i<14;i++){ const {a,b}=gen(); const r = sym==='+'?a+b : sym==='−'?a-b : a*b; probs.push({ q:`${a} ${sym} ${b}`, a:r }); }
  return { html: gridProblemas(probs), gab: gabLista(probs) };
}
function somar(){ return contas('+', ()=>({a:ri(2,49), b:ri(2,49)})); }
function subtrair(){ return contas('−', ()=>{ const a=ri(11,99), b=ri(2,a-1); return {a,b}; }); }
function multiplicar(){ return contas('×', ()=>({a:ri(2,9), b:ri(2,9)})); }

function ligue() {
  const probs=[];
  for(let i=0;i<7;i++){ if(rnd()<0.5){const a=ri(3,19),b=ri(2,15);probs.push({q:`${a} + ${b}`,a:a+b});} else {const a=ri(8,20),b=ri(2,a-1);probs.push({q:`${a} − ${b}`,a:a-b});} }
  const dir = shuffle(probs);
  const row = (left, right) => `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5.5mm">
    <div style="flex:0 0 40%;padding:3mm 4mm;border:2px solid ${COR}40;border-radius:10px;font-weight:800;font-size:15pt;color:#26334d;text-align:center">${left}</div>
    <div style="flex:0 0 auto;width:6mm;height:6mm;border-radius:50%;background:${COR}"></div>
    <div style="flex:0 0 auto;width:6mm;height:6mm;border-radius:50%;background:${COR2}"></div>
    <div style="flex:0 0 40%;padding:3mm 4mm;border:2px solid ${COR2};border-radius:10px;font-weight:800;font-size:15pt;color:#26334d;text-align:center">${right}</div>
  </div>`;
  const html = `<div style="flex:1;display:flex;flex-direction:column;justify-content:center">${probs.map((p,i)=>row(p.q, dir[i].a)).join('')}</div>`;
  const gab = probs.map(p=>`${p.q} = <b style="color:${COR}">${p.a}</b>`).join('&nbsp;&nbsp;|&nbsp;&nbsp;');
  return { html, gab };
}

function sequencia() {
  const linhas=[], gabs=[];
  for(let s=0;s<6;s++){
    const passo=[2,3,5,10][ri(0,3)], ini=ri(1,12);
    const full=[]; for(let k=0;k<7;k++) full.push(ini+passo*k);
    // esconde 2 posições (entre a 3ª e a 6ª pra ter pistas dos dois lados)
    const hide = shuffle([2,3,4,5]).slice(0,2);
    const faltam = [];
    const cels = full.map((v,idx)=>{
      if(hide.includes(idx)){ faltam.push(v); return `<span class="box" style="min-width:13mm"></span>`; }
      return `<span style="display:inline-block;min-width:13mm;text-align:center;font-size:16pt;font-weight:800;color:#26334d">${v}</span>`;
    });
    linhas.push(`<div style="display:flex;align-items:center;gap:2mm;padding:3.4mm 0;border-bottom:1px dashed ${COR}22"><span class="qn">${s+1})</span>${cels.join('<span style="color:#bcc">,</span>')}</div>`);
    gabs.push(`<b style="color:${COR}">${s+1})</b> ${faltam.sort((a,b)=>a-b).join(', ')}`);
  }
  return { html:`<div style="flex:1;display:flex;flex-direction:column;justify-content:center">${linhas.join('')}</div>`, gab: gabs.join('&nbsp;&nbsp;·&nbsp;&nbsp;') };
}

function comparar() {
  const linhas=[], gabs=[];
  for(let i=0;i<10;i++){
    const a=ri(1,99), b=ri(1,99);
    const sinal = a>b?'&gt;':a<b?'&lt;':'=';
    linhas.push(`<div style="display:flex;align-items:center;justify-content:center;gap:6mm;padding:3.4mm 0">
      <span class="qn">${i+1})</span>
      <span style="font-size:19pt;font-weight:800;color:#26334d;min-width:18mm;text-align:right">${a}</span>
      <span class="box" style="min-width:12mm"></span>
      <span style="font-size:19pt;font-weight:800;color:#26334d;min-width:18mm">${b}</span></div>`);
    gabs.push(`<b style="color:${COR}">${i+1})</b> ${sinal}`);
  }
  return { html:`<div style="flex:1;display:flex;flex-direction:column;justify-content:center">${linhas.join('')}</div>`, gab: gabs.join('&nbsp;&nbsp;·&nbsp;&nbsp;') };
}

// ───────── CAPA + GABARITO + ASSEMBLER ─────────
function capa(total) {
  return `<div class="page" style="background:radial-gradient(120% 80% at 50% 0%, ${COR} 0%, #06281f 70%)">
    <div style="height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;text-align:center;padding:20mm">
      <div style="font-family:'Gagalin';font-size:13pt;letter-spacing:4px;border:2px solid rgba(255,255,255,.35);border-radius:40px;padding:3mm 9mm">+${total} ATIVIDADES</div>
      <div style="font-family:'Gagalin';font-size:40pt;line-height:1.05;margin:8mm 0 4mm">${esc(CFG.titulo_pack)}</div>
      <div style="font-size:15pt;font-weight:700;color:rgba(255,255,255,.85);max-width:150mm">${esc(CFG.subtitulo_pack)}</div>
      <div style="font-size:11pt;font-weight:800;letter-spacing:2px;color:rgba(255,255,255,.7);margin-top:6mm;text-transform:uppercase">✓ Com gabarito completo</div>
      <div style="margin-top:auto;font-family:'Gagalin';font-size:15pt">por ${esc(CFG.autor||'')}</div>
    </div></div>`;
}
function gabCapa() {
  return `<div class="page" style="background:linear-gradient(135deg,${COR} 0%,#06281f 80%)">
    <div style="height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;text-align:center;padding:25mm">
      <div style="font-family:'Gagalin';font-size:36pt">GABARITO</div>
      <div style="font-size:14pt;font-weight:700;color:rgba(255,255,255,.85);margin-top:5mm;line-height:1.5">Respostas de todas as ${QTD} atividades.<br>Confira e corrija junto com a turma.</div>
    </div></div>`;
}
function gabPage(inner) {
  _pg++;
  return `<div class="page">
    <div class="top" style="padding:7mm 14mm 6mm"><div class="kick">Gabarito · Respostas</div><div class="tt" style="font-size:17pt">Respostas das Atividades</div></div>
    <div class="area" style="padding:8mm 12mm;justify-content:flex-start">${inner}</div>
    <div class="foot"><span class="a">${esc(CFG.autor||'')}</span><span class="n">${_pg}</span></div>
  </div>`;
}

(async () => {
  console.log(`>>> Gerando +${QTD} atividades de "${CFG.titulo_pack}" COM gabarito...`);
  const engines = [
    ()=>({k:'Somar', t:'Quanto dá?', i:'Resolva as continhas de somar e escreva o resultado na caixinha.', ...somar()}),
    ()=>({k:'Subtrair', t:'Quanto sobra?', i:'Resolva as continhas de subtrair e escreva o resultado na caixinha.', ...subtrair()}),
    ()=>({k:'Multiplicar', t:'Tabuada', i:'Resolva as multiplicações e escreva o resultado na caixinha.', ...multiplicar()}),
    ()=>({k:'Ligue a Conta', t:'Ligue ao Resultado', i:'Ligue cada conta ao número certo do outro lado.', ...ligue()}),
    ()=>({k:'Sequência', t:'Complete a Sequência', i:'Descubra o pulo dos números e preencha as caixinhas que faltam.', ...sequencia()}),
    ()=>({k:'Comparar', t:'Maior, Menor ou Igual', i:'Escreva na caixinha o sinal certo: maior (&gt;), menor (&lt;) ou igual (=).', ...comparar()}),
  ];
  let pages = [capa(QTD)];
  const gabs = [];
  for (let i=0;i<QTD;i++){
    _seed = (i+1)*131 + 17;
    const a = engines[i % engines.length]();
    pages.push(page(`Atividade ${i+1} · ${a.k}`, a.t, a.i, a.html));
    gabs.push({ n:i+1, k:a.k, gab:a.gab });
  }
  // GABARITO (tudo texto)
  pages.push(gabCapa());
  const perPage = 13;
  for (let s=0;s<gabs.length;s+=perPage){
    const rows = gabs.slice(s,s+perPage).map(it=>`<div style="margin-bottom:3.8mm;padding-bottom:2.6mm;border-bottom:1px dashed ${COR}22">
      <div style="font-weight:800;color:${COR};font-size:9pt;text-transform:uppercase;letter-spacing:.5px">Atividade ${it.n} · ${esc(it.k)}</div>
      <div style="font-size:11pt;color:#26334d;margin-top:1mm;line-height:1.5">${it.gab}</div></div>`).join('');
    pages.push(gabPage(rows));
  }

  const browser = await puppeteer.launch({ headless:'new', args:['--no-sandbox','--disable-setuid-sandbox'] });
  const LOTE = 40, buffers = [];
  for (let s=0; s<pages.length; s+=LOTE) {
    const chunk = pages.slice(s, s+LOTE);
    const pg = await browser.newPage();
    await pg.setContent(`<!DOCTYPE html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body>${chunk.join('')}</body></html>`, { waitUntil:'networkidle0', timeout:90000 });
    buffers.push(await pg.pdf({ format:'A4', printBackground:true, margin:{top:0,right:0,bottom:0,left:0} }));
    await pg.close();
    process.stdout.write(`  render ${Math.min(s+LOTE,pages.length)}/${pages.length}\r`);
  }
  await browser.close();
  const final = await PDFDocument.create();
  for (const b of buffers){ const src=await PDFDocument.load(b); (await final.copyPages(src, src.getPageIndices())).forEach(p=>final.addPage(p)); }
  const dest = path.join(OUT, `pack-matematica-${QTD}-atividades.pdf`);
  fs.writeFileSync(dest, await final.save());
  console.log(`\nPRONTO: ${dest}  (${final.getPageCount()} páginas, com gabarito)`);
  process.exit(0);
})().catch(e=>{ console.error('ERRO:', e.message); process.exit(1); });
