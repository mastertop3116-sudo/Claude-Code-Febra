// GERADOR UNIVERSAL DE ATIVIDADES — mega-pack de +100 atividades printáveis de QUALQUER nicho.
// Niche-agnostic: troca o config (lista de termos do tema) → funciona pra jiu-jitsu, natação, gramática...
// Atividades 100% programáticas (sem IA, sem custo): caça-palavras, embaralhada, ligue, labirinto, código secreto.
// Gera SEMPRE com GABARITO completo no fim (respostas de tudo, pra corrigir mesmo sem dominar o tema).
//   node gerar-atividades.js jiu-jitsu 100
//   node gerar-atividades.js natacao 120
const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');
// Abre o Chrome certo: na nuvem (Render) usa @sparticuz/chromium; no PC usa o puppeteer normal.
async function launchBrowser(){
  const ARGS=['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage','--disable-gpu','--font-render-hinting=none'];
  if(process.env.NODE_ENV==='production'||process.env.RENDER){
    const chromium=require('@sparticuz/chromium');const pc=require('puppeteer-core');
    return pc.launch({args:[...chromium.args,...ARGS],executablePath:await chromium.executablePath(),headless:chromium.headless});
  }
  return require('puppeteer').launch({headless:'new',args:ARGS});
}

const NICHO = process.argv[2] || 'jiu-jitsu';
const QTD = parseInt(process.argv[3] || '100', 10);
const CFG = JSON.parse(fs.readFileSync(path.join(__dirname, 'nichos-atividades', NICHO + '.json'), 'utf8'));
const OUT = path.join(__dirname, 'oferta-' + NICHO);
fs.mkdirSync(OUT, { recursive: true });
const GAGALIN = fs.readFileSync(path.join(__dirname, 'assets/fonts/Gagalin-Regular.otf')).toString('base64');

const COR = CFG.cor || '#2563eb', COR2 = CFG.cor2 || '#60a5fa';
const esc = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const termos = CFG.termos;                 // [{p:"GUARDA", d:"controlar com as pernas"}]
const palavras = termos.map(t => t.p.toUpperCase().replace(/[^A-ZÇÃÕÁÉÍÓÚÂÊÔÀ]/g,''));

// embaralha array (determinístico por semente simples pra variar entre páginas)
let _seed = 7;
const rnd = () => (_seed = (_seed*1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
const shuffle = a => { a=a.slice(); for(let i=a.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; };
const pick = (arr, n, off) => { const r=[]; for(let i=0;i<n;i++) r.push(arr[(off+i)%arr.length]); return r; };

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
.g{font-family:'Gagalin';color:${COR}}
`;

let _pg = 0;
function page(kicker, titulo, instr, areaHTML) {
  _pg++;
  return `<div class="page">
    <div class="top"><div class="kick">${esc(kicker)}</div><div class="tt">${esc(titulo)}</div><div class="ins">${esc(instr)}</div></div>
    <div class="area">${areaHTML}</div>
    <div class="foot"><span class="a">${esc(CFG.autor||'')}</span><span class="n">${_pg}</span></div>
  </div>`;
}

// ───────────────── ENGINE 1: CAÇA-PALAVRAS ─────────────────
// Retorna {html, gab} — gab = mini-grade com as palavras PINTADAS (gabarito).
function cacaPalavras(words) {
  const N = 13, grid = Array.from({length:N}, ()=>Array(N).fill(''));
  const dirs = [[0,1],[1,0],[1,1],[-1,1],[0,-1],[-1,0]];
  const usadas = [], sol = {};
  for (const w0 of words) {
    const w = w0.replace(/[^A-ZÇÃÕÁÉÍÓÚÂÊÔ]/g,'');
    if (w.length > N) continue;
    let ok=false;
    for (let tr=0; tr<60 && !ok; tr++) {
      const [dr,dc]=dirs[Math.floor(rnd()*dirs.length)];
      const r0=Math.floor(rnd()*N), c0=Math.floor(rnd()*N);
      const rE=r0+dr*(w.length-1), cE=c0+dc*(w.length-1);
      if (rE<0||rE>=N||cE<0||cE>=N) continue;
      let pode=true;
      for (let i=0;i<w.length;i++){const r=r0+dr*i,c=c0+dc*i; if(grid[r][c]&&grid[r][c]!==w[i]){pode=false;break;}}
      if(!pode) continue;
      for (let i=0;i<w.length;i++){const r=r0+dr*i,c=c0+dc*i; grid[r][c]=w[i]; sol[r+','+c]=1;}
      usadas.push(w0); ok=true;
    }
  }
  const AL='ABCDEFGHIJLMNOPRSTUVZ';
  for(let r=0;r<N;r++)for(let c=0;c<N;c++) if(!grid[r][c]) grid[r][c]=AL[Math.floor(rnd()*AL.length)];
  const tabela = `<table style="border-collapse:collapse;margin:0 auto">${grid.map(row=>`<tr>${row.map(ch=>`<td style="width:11mm;height:11mm;text-align:center;font-family:'Gagalin';font-size:13pt;color:#26334d;border:1px solid ${COR}22">${ch}</td>`).join('')}</tr>`).join('')}</table>`;
  const lista = `<div style="margin-top:7mm;display:flex;flex-wrap:wrap;gap:2.5mm 6mm;justify-content:center">${usadas.map(w=>`<span style="font-weight:800;font-size:11pt;color:${COR}">● ${esc(w)}</span>`).join('')}</div>`;
  const html = `<div style="flex:1;display:flex;flex-direction:column;justify-content:center">${tabela}${lista}</div>`;
  const gab = `<table style="border-collapse:collapse">${grid.map((row,r)=>`<tr>${row.map((ch,c)=>{const on=sol[r+','+c];return `<td style="width:4.3mm;height:4.3mm;text-align:center;font-family:'Gagalin';font-size:6pt;${on?`background:${COR};color:#fff`:'color:#d3d9e4'}">${ch}</td>`;}).join('')}</tr>`).join('')}</table>`;
  return { html, gab };
}

// ───────────────── ENGINE 2: PALAVRAS EMBARALHADAS ─────────────────
function embaralhadas(items) {
  const ans=[];
  const linhas = items.map(t=>{
    const w=t.p.toUpperCase();
    const emb=shuffle(w.split('')).join('');
    ans.push(`${emb} = ${w}`);
    return `<div style="display:flex;align-items:center;gap:5mm;padding:3.4mm 5mm;border:2px solid ${COR}33;border-radius:12px;margin-bottom:4mm">
      <div style="flex:0 0 auto;font-family:'Gagalin';font-size:17pt;letter-spacing:3px;color:${COR};min-width:55mm">${esc(emb)}</div>
      <div style="flex:1"><div style="font-size:9.5pt;color:#667;font-weight:600;margin-bottom:1mm">Dica: ${esc(t.d||'')}</div><div style="border-bottom:2px solid #ccd;height:6mm"></div></div>
    </div>`;
  }).join('');
  return { html:`<div style="flex:1;display:flex;flex-direction:column;justify-content:center">${linhas}</div>`, gab: ans.join('&nbsp;&nbsp;·&nbsp;&nbsp;') };
}

// ───────────────── ENGINE 3: LIGUE AS COLUNAS ─────────────────
function ligue(items) {
  const dir = shuffle(items);
  const row = (left, right) => `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5.5mm">
    <div style="flex:0 0 46%;padding:3mm 4mm;border:2px solid ${COR}40;border-radius:10px;font-weight:800;font-size:11.5pt;color:#26334d">${esc(left)}</div>
    <div style="flex:0 0 auto;width:6mm;height:6mm;border-radius:50%;background:${COR}"></div>
    <div style="flex:0 0 auto;width:6mm;height:6mm;border-radius:50%;background:${COR2}"></div>
    <div style="flex:0 0 46%;padding:3mm 4mm;border:2px solid ${COR2};border-radius:10px;font-weight:600;font-size:10pt;color:#334">${esc(right)}</div>
  </div>`;
  const html = `<div style="flex:1;display:flex;flex-direction:column;justify-content:center">${items.map((t,i)=>row(t.p, dir[i].d)).join('')}</div>`;
  const gab = items.map(t=>`<b style="color:${COR}">${esc(t.p)}</b> = ${esc(t.d)}`).join('&nbsp;&nbsp;|&nbsp;&nbsp;');
  return { html, gab };
}

// ───────────────── ENGINE 4: CÓDIGO SECRETO (cifra de números: A=1..Z=26) ─────────────────
function codigo(items) {
  const A='ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const num={}; A.forEach((l,i)=>num[l]=i+1);
  const cap = l => `<span style="display:inline-flex;flex-direction:column;align-items:center;min-width:9mm">
      <b style="font-family:'Gagalin';font-size:12pt;color:${COR};line-height:1">${num[l]}</b>
      <span style="font-size:8pt;font-weight:800;color:#26334d">${l}</span></span>`;
  const legenda=`<div style="display:flex;flex-wrap:wrap;gap:2.5mm 3mm;justify-content:center;padding:5mm 4mm;border:2px dashed ${COR}55;border-radius:12px;margin-bottom:7mm;background:${COR}08">${A.map(cap).join('')}</div>`;
  const ans=[];
  const desafios=items.map(t=>{
    const w=t.p.toUpperCase().replace(/[^A-Z]/g,'');
    ans.push(w);
    const cod=w.split('').map(c=>num[c]).join('<span style="color:#bcc;font-weight:400"> · </span>');
    return `<div style="margin-bottom:6mm">
      <div style="font-family:'Gagalin';font-size:16pt;letter-spacing:1px;color:${COR}">${cod}</div>
      <div style="display:flex;gap:2.5mm;margin-top:2.5mm">${w.split('').map(()=>`<span style="display:inline-block;width:8mm;border-bottom:2.5px solid ${COR}66">&nbsp;</span>`).join('')}</div>
      <div style="font-size:9pt;color:#778;margin-top:1.5mm;font-weight:600">Dica: ${esc(t.d||'')}</div></div>`;
  }).join('');
  return { html:`<div style="flex:1;display:flex;flex-direction:column;justify-content:center">${legenda}${desafios}</div>`, gab: ans.map(w=>esc(w)).join('&nbsp;&nbsp;·&nbsp;&nbsp;') };
}

// ───────────────── ENGINE 5: LABIRINTO ─────────────────
// Resolve o caminho (BFS) pra desenhar a solução no gabarito.
function mazePath(cells, N) {
  const key=(r,c)=>r*N+c, prev={}, seen={[key(0,0)]:1}, q=[[0,0]];
  const nb=[[-1,0,0],[0,1,1],[1,0,2],[0,-1,3]]; // dr,dc,wallIndex (top,right,bottom,left)
  while(q.length){
    const [r,c]=q.shift();
    if(r===N-1&&c===N-1) break;
    for(const [dr,dc,wi] of nb){
      const nr=r+dr,nc=c+dc;
      if(nr<0||nr>=N||nc<0||nc>=N) continue;
      if(cells[r][c].w[wi]) continue;        // parede fechada → não passa
      if(seen[key(nr,nc)]) continue;
      seen[key(nr,nc)]=1; prev[key(nr,nc)]=[r,c]; q.push([nr,nc]);
    }
  }
  const path=[[N-1,N-1]]; let cur=key(N-1,N-1);
  while(prev[cur]){ const [pr,pc]=prev[cur]; path.push([pr,pc]); cur=key(pr,pc); }
  return path.reverse();
}
function labirinto() {
  const N=15, cells=Array.from({length:N},()=>Array.from({length:N},()=>({v:false,w:[true,true,true,true]}))); // w: top,right,bottom,left
  const stack=[[0,0]]; cells[0][0].v=true;
  const dirs=[[-1,0,0,2],[0,1,1,3],[1,0,2,0],[0,-1,3,1]];
  while(stack.length){
    const [r,c]=stack[stack.length-1];
    const viz=dirs.map(([dr,dc,wi,ow])=>[r+dr,c+dc,wi,ow]).filter(([nr,nc])=>nr>=0&&nr<N&&nc>=0&&nc<N&&!cells[nr][nc].v);
    if(!viz.length){stack.pop();continue;}
    const [nr,nc,wi,ow]=viz[Math.floor(rnd()*viz.length)];
    cells[r][c].w[wi]=false; cells[nr][nc].w[ow]=false; cells[nr][nc].v=true; stack.push([nr,nc]);
  }
  const S=10, P=4, W=N*S, lines=[];
  for(let r=0;r<N;r++)for(let c=0;c<N;c++){const x=c*S,y=r*S,cw=cells[r][c].w;
    if(cw[0])lines.push(`<line x1="${x}" y1="${y}" x2="${x+S}" y2="${y}"/>`);
    if(cw[3])lines.push(`<line x1="${x}" y1="${y}" x2="${x}" y2="${y+S}"/>`);
    if(r===N-1&&cw[2])lines.push(`<line x1="${x}" y1="${y+S}" x2="${x+S}" y2="${y+S}"/>`);
    if(c===N-1&&cw[1])lines.push(`<line x1="${x+S}" y1="${y}" x2="${x+S}" y2="${y+S}"/>`);
  }
  const wallsSvg = lines.join('');
  const svg=`<svg viewBox="-${P} -${P} ${W+2*P} ${W+2*P}" style="width:158mm;height:158mm"><g stroke="${COR}" stroke-width="1.4" stroke-linecap="square">${wallsSvg}</g>
    <circle cx="${S/2}" cy="${S/2}" r="3" fill="${COR2}"/><circle cx="${W-S/2}" cy="${W-S/2}" r="3" fill="${COR}"/></svg>`;
  const html = `<div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center">
    <div style="display:flex;justify-content:space-between;width:158mm;margin-bottom:5mm;font-weight:800;font-size:12pt"><span style="color:${COR2}">● ${esc(CFG.labirinto_inicio||'INÍCIO')}</span><span style="color:${COR}">● ${esc(CFG.labirinto_fim||'CHEGADA')}</span></div>
    ${svg}</div>`;
  // gabarito: mini-labirinto com o caminho desenhado
  const pts = mazePath(cells, N).map(([r,c])=>`${c*S+S/2},${r*S+S/2}`).join(' ');
  const gab = `<svg viewBox="-${P} -${P} ${W+2*P} ${W+2*P}" style="width:46mm;height:46mm"><g stroke="#d3d9e4" stroke-width="1.4" stroke-linecap="square">${wallsSvg}</g>
    <polyline points="${pts}" fill="none" stroke="${COR}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="${S/2}" cy="${S/2}" r="4" fill="${COR2}"/><circle cx="${W-S/2}" cy="${W-S/2}" r="4" fill="${COR}"/></svg>`;
  return { html, gab };
}

// ───────────────── CAPA + GABARITO + ASSEMBLER ─────────────────
function capa(total) {
  return `<div class="page" style="background:radial-gradient(120% 80% at 50% 0%, ${COR} 0%, #0a1224 70%)">
    <div style="height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;text-align:center;padding:20mm">
      <div style="font-family:'Gagalin';font-size:13pt;letter-spacing:4px;border:2px solid rgba(255,255,255,.35);border-radius:40px;padding:3mm 9mm">+${total} ATIVIDADES</div>
      <div style="font-family:'Gagalin';font-size:40pt;line-height:1.05;margin:8mm 0 4mm">${esc(CFG.titulo_pack)}</div>
      <div style="font-size:15pt;font-weight:700;color:rgba(255,255,255,.85);max-width:150mm">${esc(CFG.subtitulo_pack||'Atividades prontas para imprimir e aplicar.')}</div>
      <div style="font-size:11pt;font-weight:800;letter-spacing:2px;color:rgba(255,255,255,.7);margin-top:6mm;text-transform:uppercase">✓ Com gabarito completo</div>
      <div style="margin-top:auto;font-family:'Gagalin';font-size:15pt">por ${esc(CFG.autor||'')}</div>
    </div></div>`;
}
function gabCapa() {
  return `<div class="page" style="background:linear-gradient(135deg,${COR} 0%,#0a1224 80%)">
    <div style="height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;text-align:center;padding:25mm">
      <div style="font-family:'Gagalin';font-size:36pt">GABARITO</div>
      <div style="font-size:14pt;font-weight:700;color:rgba(255,255,255,.85);margin-top:5mm;line-height:1.5">Respostas de todas as ${QTD} atividades.<br>Confira e corrija junto com a turma — mesmo sem dominar o tema.</div>
    </div></div>`;
}
function gabPage(titulo, inner) {
  _pg++;
  return `<div class="page">
    <div class="top" style="padding:7mm 14mm 6mm"><div class="kick">Gabarito · Respostas</div><div class="tt" style="font-size:17pt">${esc(titulo)}</div></div>
    <div class="area" style="padding:8mm 12mm;justify-content:flex-start">${inner}</div>
    <div class="foot"><span class="a">${esc(CFG.autor||'')}</span><span class="n">${_pg}</span></div>
  </div>`;
}
function gabTextPages(list, perPage, titulo) {
  const out=[];
  for(let s=0;s<list.length;s+=perPage){
    const rows=list.slice(s,s+perPage).map(it=>`<div style="margin-bottom:4.2mm;padding-bottom:3mm;border-bottom:1px dashed ${COR}22">
      <div style="font-weight:800;color:${COR};font-size:9pt;text-transform:uppercase;letter-spacing:.5px">Atividade ${it.n} · ${esc(it.k)}</div>
      <div style="font-size:10.5pt;color:#26334d;margin-top:1.2mm;line-height:1.45">${it.gab}</div></div>`).join('');
    out.push(gabPage(titulo, rows));
  }
  return out;
}
function gabVisPages(list, perPage, titulo) {
  const out=[];
  for(let s=0;s<list.length;s+=perPage){
    const cards=list.slice(s,s+perPage).map(it=>`<div style="display:flex;flex-direction:column;align-items:center;margin:3mm 4mm">
      <div style="font-weight:800;color:${COR};font-size:8.5pt;margin-bottom:1.5mm">Atividade ${it.n}</div>${it.gab}</div>`).join('');
    out.push(gabPage(titulo, `<div style="display:flex;flex-wrap:wrap;justify-content:center;align-items:flex-start">${cards}</div>`));
  }
  return out;
}

(async () => {
  console.log(`>>> Gerando +${QTD} atividades de "${CFG.titulo_pack}" (nicho: ${NICHO}) COM gabarito...`);
  const engines = [
    (off)=>{const r=cacaPalavras(shuffle(pick(palavras,8,off))); return {k:'Caça-Palavras', t:'Encontre as Palavras', i:'Procure as palavras escondidas (na horizontal, vertical e diagonal) e circule.', html:r.html, gab:r.gab};},
    (off)=>{const r=embaralhadas(pick(termos,7,off)); return {k:'Palavras Embaralhadas', t:'Desembaralhe', i:'Reorganize as letras e descubra a palavra certa. Use a dica!', html:r.html, gab:r.gab};},
    (off)=>{const r=ligue(pick(termos,7,off)); return {k:'Ligue as Colunas', t:'Ligue Certo', i:'Ligue cada palavra ao seu significado com uma linha.', html:r.html, gab:r.gab};},
    (off)=>{const r=codigo(pick(termos,6,off)); return {k:'Código Secreto', t:'Decifre o Código', i:'Use a legenda pra trocar cada número pela letra e descobrir a palavra.', html:r.html, gab:r.gab};},
    (off)=>{const r=labirinto(); return {k:'Labirinto', t:'Ache o Caminho', i:'Leve do início até a chegada sem bater nas paredes.', html:r.html, gab:r.gab};},
  ];
  let pages = [capa(QTD)];
  const gText=[], gCaca=[], gMaze=[];
  for (let i=0;i<QTD;i++){
    _seed = (i+1)*97 + 13;                       // semente por página = variação garantida
    const eng = engines[i % engines.length];
    const off = Math.floor(i/engines.length) * 3;
    const a = eng(off);
    pages.push(page(`Atividade ${i+1} · ${a.k}`, a.t, a.i, a.html));
    const n=i+1;
    if (a.k==='Caça-Palavras') gCaca.push({n, gab:a.gab});
    else if (a.k==='Labirinto') gMaze.push({n, gab:a.gab});
    else gText.push({n, k:a.k, gab:a.gab});
  }
  // GABARITO no fim
  pages.push(gabCapa());
  pages.push(...gabTextPages(gText, 11, 'Desembaralhe · Ligue · Código'));
  pages.push(...gabVisPages(gCaca, 9, 'Caça-Palavras (palavras em destaque)'));
  pages.push(...gabVisPages(gMaze, 9, 'Labirintos (caminho certo)'));

  // renderiza em blocos (Puppeteer aguenta, mas dividimos pra não estourar memória) e junta com pdf-lib
  const browser = await launchBrowser();
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
  const dest = path.join(OUT, `pack-${NICHO}-${QTD}-atividades.pdf`);
  fs.writeFileSync(dest, await final.save());
  console.log(`\nPRONTO: ${dest}  (${final.getPageCount()} páginas, com gabarito)`);
  process.exit(0);
})().catch(e=>{ console.error('ERRO:', e.message); process.exit(1); });
