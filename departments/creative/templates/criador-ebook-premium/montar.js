/* E-BOOK PREMIUM (padrão aprovado): fundo branco, Nunito+Gagalin, cor de faixa, mascote,
   blocos coloridos (Passo a Passo, O Que Observar, etc.), avatares por gesto, destaques coloridos,
   fundo alternado por capítulo, fontes EMBUTIDAS, A4 SEMPRE CHEIA (paginador que mede no navegador).
   Exporta montarHtml(conteudo, opts) → string HTML self-contained (o motor faz o Puppeteer). */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '../../../..');

// Paleta por FAIXA (igual PALETAS_FAIXA do motor) + rótulo
const PALETAS = {
  branca:   { p:'#64748b', s:'#cbd5e1', rotulo:'Faixa Branca'  },
  cinza:    { p:'#6b7280', s:'#d1d5db', rotulo:'Faixa Cinza'   },
  amarela:  { p:'#ca8a04', s:'#fde047', rotulo:'Faixa Amarela' },
  laranja:  { p:'#ea580c', s:'#fdba74', rotulo:'Faixa Laranja' },
  verde:    { p:'#16a34a', s:'#86efac', rotulo:'Faixa Verde'   },
  azul:     { p:'#2563eb', s:'#93c5fd', rotulo:'Faixa Azul'    },
  roxa:     { p:'#7c3aed', s:'#c4b5fd', rotulo:'Faixa Roxa'    },
  marrom:   { p:'#92400e', s:'#d6b48c', rotulo:'Faixa Marrom'  },
  preta:    { p:'#1f2937', s:'#9ca3af', rotulo:'Faixa Preta'   },
  vermelha: { p:'#dc2626', s:'#fca5a5', rotulo:'Faixa Vermelha'},
};

// GAGALIN embutida (fonte NOSSA, não existe no Google → tem que ir no arquivo). Nunito vem do
// Google via <link> (fonte super comum; o Chromium subseta UMA vez → PDF pequeno, em vez de
// embutir a fonte por página = arquivo gigante). Cache em módulo.
let _FONT_FACE = null;
function fontFace() {
  if (_FONT_FACE != null) return _FONT_FACE;
  let ff = '';
  try {
    const g = fs.readFileSync(path.join(ROOT, 'assets/fonts/Gagalin-Regular.otf')).toString('base64');
    ff = `@font-face{font-family:'Gagalin';src:url(data:font/otf;base64,${g}) format('opentype');font-weight:normal;font-display:block;}`;
  } catch (_) {}
  _FONT_FACE = ff;
  return ff;
}

function montarHtml(d, opts = {}) {
  // Cor vem do NICHO (cores passadas pelo motor) — NÃO da faixa. Genérico p/ qualquer cliente.
  const faixa = opts.faixa ? String(opts.faixa).toLowerCase() : null;   // faixa = só pra jiu-jitsu (mascote)
  const _c = opts.cores || (faixa && PALETAS[faixa]) || PALETAS.azul;
  const P = _c.primaria || _c.p, S = _c.secundaria || _c.s;
  const nicho = opts.nicho || '';
  const autor = d.autor || opts.autor || 'Autor';
  const ano = new Date().getFullYear();
  const paraQuem = (d.para_quem || opts.publico || '').toString().trim();
  const fecho = (d.fecho || '').toString().trim() || 'Agora é com você.';

  // HERÓI da capa: mascote de jiu-jitsu SÓ se faixa escolhida; senão, uma PESSOA/especialista genérica.
  let mascB64 = '';
  if (faixa) for (const nome of [`jj-${faixa}-web.png`, `jj-${faixa}-transp.png`]) {
    try { mascB64 = 'data:image/png;base64,' + fs.readFileSync(path.join(ROOT, `assets/mascotes/${nome}`)).toString('base64'); break; } catch (_) {}
  }
  // retrato de capa (pessoa) — escolhido por hash do título (varia o elenco). Gestos acolhedores.
  let pessoaB64 = '';
  if (!mascB64) {
    const COVER = ['saudacao-mulher','aprovacao-homem','explicando-mulher','recomendacao-homem','saudacao-homem','aprovacao-mulher','explicando-homem','recomendacao-mulher'];
    let h = 0; for (const ch of String(d.titulo || nicho || 'x')) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    const key = COVER[h % COVER.length];
    try { pessoaB64 = fs.readFileSync(path.join(ROOT, `assets/catalogo-auto/pessoas-${key}/cover.b64`), 'utf8').trim(); } catch (_) {}
  }
  const heroImg = mascB64 || pessoaB64;

  // Avatares de pessoas por gesto (cast misto). Some o chip se não achar o arquivo.
  const AVATAR_MAP = { dica:'mulher', explicando:'homem', acao:'homem', atencao:'mulher', recomendacao:'homem', curiosidade:'mulher', reflexao:'homem', aprovacao:'mulher', pergunta:'homem' };
  const AV = {};
  for (const [g, gen] of Object.entries(AVATAR_MAP)) {
    for (const fn of [`pessoas-${g}-${gen}/avatar-round.b64`, `pessoas-${g}-${gen}/avatar.b64`]) {   // redondo (deduplicável) primeiro
      try { AV[g] = fs.readFileSync(path.join(ROOT, `assets/catalogo-auto/${fn}`), 'utf8').trim(); break; } catch (_) {}
    }
  }
  // avatar = <img> (o Chromium DEDUPLICA <img> igual; background-image CSS ele duplica = PDF gigante)
  const psn = (gesto, extra='') => AV[gesto] ? `<div class="psn ${extra}"><img src="${AV[gesto]}"></div>` : '';

  const esc = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const splitParas = t => String(t||'').split(/\n+/).map(s=>s.trim()).filter(p=>p.length>2);
  const marcarDestaques = raw => esc(raw).replace(/'[^']{1,45}'/g, m => m.split(' ').map(w => `<b>${w}</b>`).join(' '));
  const PEQ = new Set(['para','com','e','de','da','do','das','dos','na','no','nas','nos','em','a','o','as','os','que','sem','sob','sobre','ao','aos','à','às']);
  const tituloCase = t => String(t||'').split(' ').map((w,i)=> (i>0 && PEQ.has(w.toLowerCase())) ? w.toLowerCase() : w).join(' ');

  const IC = {
    dica:    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a7 7 0 0 1 7 7c0 3-1.8 5.6-4.5 6.7V17H9.5v-1.3C6.8 14.6 5 12 5 9a7 7 0 0 1 7-7zm-1 18h2v2h-2z"/></svg>',
    exemplo: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1 15l-5-5 1.4-1.4L11 14.2l6.6-6.6L19 9z"/></svg>',
    acao:    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L4.1 13.4c-.4.5 0 1.1.6 1.1H11l-1 8 8.9-11.4c.4-.5 0-1.1-.6-1.1H12z"/></svg>',
    atencao: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2zm0-4h-2v-4h2z"/></svg>',
    pontos:  '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/></svg>',
    passo:   '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 5h2v2H3zm0 6h2v2H3zm0 6h2v2H3zM8 5h13v2H8zm0 6h13v2H8zm0 6h13v2H8z"/></svg>',
    olho:    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 5c-5 0-9 4.5-10 7 1 2.5 5 7 10 7s9-4.5 10-7c-1-2.5-5-7-10-7zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm0-2a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/></svg>',
  };

  const blocos = [];
  const B = (cls, html, opt={}) => blocos.push({ cls, html, knext: !!opt.knext, newpage: !!opt.newpage });
  const T = (text, opt={}) => blocos.push({ text:true, lead:!!opt.lead, raw:text, knext:!!opt.knext });
  const cardH = (icon, label, gesto) => `<div class="card-h"><div class="card-h-lab">${icon}<span>${label}</span></div>${psn(gesto)}</div>`;

  // Introdução
  B('sec-eyebrow', `<span class="dot"></span>Introdução`);
  B('sec-titulo', esc(d.titulo), { knext:true });
  splitParas(d.introducao).forEach((p,i)=>T(p, { lead:i===0, knext:i===0 }));

  // Capítulos
  (d.capitulos||[]).forEach((c, idx) => {
    const n = String(c.numero||idx+1).padStart(2,'0');
    B('cap-open', `
      <div class="cap-open-num">${n}</div>
      <div class="cap-open-txt">
        <div class="cap-open-rot">Capítulo ${c.numero||idx+1}</div>
        <div class="cap-open-tit">${esc(c.titulo||'')}</div>
      </div>
      ${mascB64?`<img class="cap-open-masc" src="${mascB64}">`:''}`, { knext:true });
    splitParas(c.conteudo).forEach((p,i)=>T(p, { knext:i===0 }));
    if (c.contraste && Array.isArray(c.contraste.itens_a) && c.contraste.itens_a.length) {
      const ct = c.contraste;
      const col = (cls, cab, itens) => `<div class="ct-col ${cls}"><div class="ct-cab">${esc(cab)}</div>${(itens||[]).map(x=>`<div class="ct-item">${esc(x)}</div>`).join('')}</div>`;
      B('card card-contraste', cardH(IC.exemplo,'Mude a Chave','curiosidade') +
        `<div class="contraste">${col('ct-antiga', ct.label_a||'Antes', ct.itens_a)}<div class="ct-seta">&rarr;</div>${col('ct-nova', ct.label_b||'Depois', ct.itens_b)}</div>`);
    }
    if (c.citacao) B('card-quote', `<div class="q-mark">&ldquo;</div><div class="q-txt">${esc(c.citacao)}</div>${psn('reflexao','q-psn')}`);
    if (c.dica) B('card card-dica', cardH(IC.dica,'Dica do Professor','dica')+`<div class="card-b">${marcarDestaques(c.dica)}</div>`);
    if (c.exemplo_real) B('card card-ex', cardH(IC.exemplo,'Na Prática','explicando')+`<div class="card-b">${marcarDestaques(c.exemplo_real)}</div>`);
    if (c.acao_pratica) B('card card-acao', cardH(IC.acao,'Faça Agora','acao')+`<div class="card-b">${marcarDestaques(c.acao_pratica)}</div>`);
    const passo = c.passo_a_passo || c.steps_visuais;
    if (Array.isArray(passo) && passo.length) {
      B('card card-passo', cardH(IC.passo,'Passo a Passo','aprovacao') +
        `<div class="passo-list">${passo.map((p,i)=>`<div class="passo-item"><span class="passo-n">${i+1}</span><span>${esc(String(p).replace(/^\s*\d+[\.\)\-]\s*/,''))}</span></div>`).join('')}</div>`);
    }
    if (c.atencao) B('card card-aten', cardH(IC.atencao,'Atenção','atencao')+`<div class="card-b">${marcarDestaques(c.atencao)}</div>`);
    if (Array.isArray(c.o_que_observar) && c.o_que_observar.length) {
      B('card card-observar', cardH(IC.olho,'O Que Observar','pergunta') +
        c.o_que_observar.map(o=>`<div class="obs-item">${IC.olho}<span>${esc(o)}</span></div>`).join(''));
    }
    if (Array.isArray(c.pontos_chave) && c.pontos_chave.length) {
      B('card card-pontos', cardH(IC.pontos,'Pontos-chave','recomendacao') +
        c.pontos_chave.map(p=>`<div class="pt-item">${IC.pontos}<span>${esc(p)}</span></div>`).join(''));
    }
  });

  // Conclusão (só se a máquina escreveu)
  if (d.conclusao && d.conclusao.trim()) {
    B('sec-eyebrow', `<span class="dot"></span>Conclusão`, { knext:true });
    B('sec-titulo', esc(d.titulo_conclusao || 'Pra Fechar'), { knext:true });
    splitParas(d.conclusao).forEach((p,i)=>T(p, { lead:i===0, knext:i===0 }));
  }

  const FLOW = blocos.map(b=> b.text
    ? `<div class="blk bk${b.lead?' bk-lead':''}" data-text="1" ${b.lead?'data-lead="1"':''} ${b.knext?'data-knext="1"':''}>${marcarDestaques(b.raw)}</div>`
    : `<div class="blk ${b.cls}" ${b.knext?'data-knext="1"':''} ${b.newpage?'data-newpage="1"':''}>${b.html}</div>`
  ).join('');

  const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet">
<style>
${fontFace()}
@page { size: A4; margin: 0; }
*,*::before,*::after{ box-sizing:border-box; margin:0; padding:0; }
:root{ --p:${P}; --s:${S}; --ink:#1d2433; --muted:#5a6473; --y:#FFC83D; }
body{ font-family:'Nunito',sans-serif; color:var(--ink); background:#fff; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
.page{ width:210mm; height:297mm; position:relative; overflow:hidden; background:#fff; page-break-after:always; }
.page:last-child{ page-break-after:auto; }
/* confete: alpha BAIXO direto na cor (NUNCA 'opacity' no elemento full-page — vira raster da página inteira = PDF gigante) */
.confetti{ position:absolute; inset:0; pointer-events:none;
  background-image:radial-gradient(circle, color-mix(in srgb,var(--p) 11%,transparent) 2px, transparent 2.5px),radial-gradient(circle, color-mix(in srgb,var(--y) 11%,transparent) 1.6px, transparent 2px),radial-gradient(circle, color-mix(in srgb,var(--s) 11%,transparent) 2px, transparent 2.5px);
  background-size:42px 42px,60px 60px,52px 52px; background-position:0 0,22px 20px,12px 34px; }
.cv-faixa{ position:relative; min-height:158mm; padding:20mm 16mm 20mm;
  background:linear-gradient(140deg, var(--p) 0%, color-mix(in srgb, var(--p) 55%, var(--s)) 100%);
  clip-path:polygon(0 0,100% 0,100% 86%,0 100%); display:flex; flex-direction:column; justify-content:center; overflow:hidden; }
.cv-faixa .confetti{ background-image:radial-gradient(circle, rgba(255,255,255,.16) 2px, transparent 2.5px),radial-gradient(circle, rgba(255,255,255,.12) 1.6px, transparent 2px),radial-gradient(circle, rgba(255,255,255,.14) 2px, transparent 2.5px); }
.cv-badge{ align-self:flex-start; background:rgba(255,255,255,.22); border:2px solid rgba(255,255,255,.55); border-radius:40px;
  padding:2.5mm 6mm; font-family:'Nunito'; font-weight:800; font-size:8.5pt; letter-spacing:2px; text-transform:uppercase; color:#fff; margin-bottom:7mm; }
.cv-titulo{ font-family:'Nunito'; font-weight:900; font-size:29pt; line-height:1.1; color:#fff; text-shadow:0 2px 10px rgba(0,0,0,.18); max-width:100mm; }
.cv-sub{ font-family:'Nunito'; font-weight:700; font-size:12pt; color:rgba(255,255,255,.92); line-height:1.45; margin-top:6mm; max-width:98mm; }
.cv-masc{ position:absolute; right:4mm; bottom:70mm; width:92mm; filter:drop-shadow(0 14px 26px rgba(0,0,0,.32)); z-index:3; }
/* retrato de pessoa na capa (e-book genérico) — só 1 instância, clipe/sombra OK */
.cv-pessoa{ position:absolute; right:11mm; bottom:96mm; width:62mm; height:62mm; border-radius:50%; overflow:hidden; z-index:3;
  border:2mm solid #fff; box-shadow:0 10px 26px rgba(0,0,0,.28), 0 0 0 1.2mm color-mix(in srgb,var(--p) 70%,#fff); background:#eef1f5; }
.cv-pessoa img{ width:100%; height:100%; object-fit:cover; object-position:center top; display:block; }
.cv-bottom{ position:absolute; left:0; right:0; bottom:0; height:74mm; padding:0 16mm; display:flex; flex-direction:column; justify-content:center; gap:6mm; }
.cv-obj{ background:linear-gradient(135deg, color-mix(in srgb,var(--p) 8%,#fff), color-mix(in srgb,var(--s) 10%,#fff));
  border:2.5px solid color-mix(in srgb,var(--p) 26%,#fff); border-radius:16px; padding:6mm 7mm; max-width:120mm; }
.cv-obj-rot{ font-family:'Nunito'; font-weight:800; font-size:8pt; letter-spacing:1.5px; text-transform:uppercase; color:var(--p); margin-bottom:1.5mm; }
.cv-obj-txt{ font-weight:700; font-size:11pt; line-height:1.5; color:var(--ink); }
.cv-assina{ display:flex; align-items:center; gap:3mm; }
.cv-assina .bar{ width:9mm; height:1mm; background:var(--p); border-radius:1mm; }
.cv-assina .au{ font-family:'Nunito'; font-weight:800; font-size:10.5pt; color:var(--muted); letter-spacing:.5px; }
.pg-head{ height:13mm; padding:0 14mm; display:flex; align-items:center; justify-content:space-between;
  background:linear-gradient(90deg, var(--p), color-mix(in srgb,var(--p) 55%,var(--s))); }
.pg-head .ttl{ font-family:'Nunito'; font-weight:800; font-size:8pt; letter-spacing:1.5px; text-transform:uppercase; color:rgba(255,255,255,.95); }
.pg-head .sec{ font-family:'Nunito'; font-weight:700; font-size:7.5pt; letter-spacing:1px; color:rgba(255,255,255,.78); }
.pg-content{ position:absolute; top:13mm; bottom:11mm; left:0; right:0; padding:9mm 14mm; overflow:hidden; }
.pg-foot{ position:absolute; left:0; right:0; bottom:0; height:11mm; padding:0 14mm; display:flex; align-items:center; justify-content:space-between;
  background:color-mix(in srgb,var(--p) 6%,#fff); border-top:1.5px dashed color-mix(in srgb,var(--p) 28%,#eee); }
.pg-foot .au{ font-family:'Nunito'; font-weight:800; font-size:7pt; letter-spacing:1px; text-transform:uppercase; color:color-mix(in srgb,var(--p) 55%,#999); }
.pg-foot .pg{ font-family:'Nunito'; font-weight:800; font-size:8pt; color:#fff; background:var(--p); border-radius:20px; padding:1mm 3.5mm; }
.bk{ font-size:10.5pt; line-height:1.72; color:#33384a; margin-bottom:3.2mm; text-align:justify; }
.bk-lead{ font-size:11.5pt; }
.bk-lead::first-letter{ font-family:'Nunito'; font-weight:900; font-size:30pt; line-height:.8; float:left; color:var(--p); margin:1mm 2.5mm 0 0; }
.sec-eyebrow{ display:flex; align-items:center; gap:2.5mm; font-family:'Nunito'; font-weight:800; font-size:9pt; letter-spacing:2px; text-transform:uppercase; color:var(--p); margin-bottom:3mm; }
.sec-eyebrow .dot{ width:7mm; height:1.4mm; background:var(--p); border-radius:1mm; }
.sec-titulo{ font-family:'Nunito'; font-weight:900; font-size:23pt; line-height:1.12; color:var(--ink); margin-bottom:5mm; }
.cap-open{ position:relative; display:flex; align-items:center; gap:5mm; margin:1mm 0 6mm; padding:6mm 7mm; min-height:30mm;
  background:linear-gradient(135deg, color-mix(in srgb,var(--p) 10%,#fff), color-mix(in srgb,var(--s) 14%,#fff));
  border:2.5px solid color-mix(in srgb,var(--p) 22%,#fff); border-radius:18px; overflow:hidden; }
.cap-open-num{ font-family:'Nunito'; font-weight:900; font-size:30pt; color:#fff; background:var(--p);
  width:20mm; height:20mm; min-width:20mm; border-radius:14px; display:flex; align-items:center; justify-content:center;
  box-shadow:0 4px 10px color-mix(in srgb,var(--p) 35%,transparent); }
.cap-open-rot{ font-family:'Nunito'; font-weight:800; font-size:8.5pt; letter-spacing:2px; text-transform:uppercase; color:var(--p); margin-bottom:1mm; }
.cap-open-tit{ font-family:'Nunito'; font-weight:900; font-size:17pt; line-height:1.12; color:var(--ink); max-width:120mm; }
.cap-open-masc{ position:absolute; right:-4mm; bottom:-6mm; width:34mm; }
.card{ border-radius:16px; padding:5mm 6mm; margin:4mm 0; border:2px solid; }
.card-h{ display:flex; align-items:center; justify-content:space-between; gap:3mm; font-family:'Nunito'; font-weight:800; font-size:9.5pt; letter-spacing:.5px; text-transform:uppercase; margin-bottom:2.5mm; }
.card-h-lab{ display:flex; align-items:center; gap:2.5mm; }
.card-h svg{ width:5mm; height:5mm; }
.card-b{ font-size:10pt; line-height:1.62; color:#33384a; }
/* avatar = PNG REDONDO com anel+sombra ASSADOS → <img> PURO, ZERO efeito CSS (qualquer clipe/sombra/borda
   faz o Chromium rasterizar 1 cópia por card = PDF gigante; img puro ele DEDUPLICA). */
.psn{ width:18mm; height:18mm; flex-shrink:0; margin:-1.5mm 0; }
.psn img{ width:100%; height:100%; display:block; }
.card-dica{ background:color-mix(in srgb,var(--p) 6%,#fff); border-color:color-mix(in srgb,var(--p) 28%,#fff); }
.card-dica .card-h{ color:var(--p); }
.card-ex{ background:#f0fbf3; border-color:#bfe8cc; } .card-ex .card-h{ color:#15924a; }
.card-acao{ background:#fff6ec; border-color:#ffd9af; } .card-acao .card-h{ color:#e07a17; }
.card-aten{ background:#fef0f0; border-color:#f8c4c4; } .card-aten .card-h{ color:#d63d3d; }
.card-pontos{ background:color-mix(in srgb,var(--s) 16%,#fff); border-color:color-mix(in srgb,var(--p) 22%,#fff); }
.card-pontos .card-h{ color:var(--p); }
.pt-item{ display:flex; align-items:flex-start; gap:2.5mm; font-size:10pt; line-height:1.5; font-weight:600; color:#2b3142; margin-top:2mm; }
.pt-item svg{ width:4mm; height:4mm; color:var(--p); margin-top:.6mm; flex-shrink:0; }
.card-contraste{ background:#fff; border-color:color-mix(in srgb,var(--p) 18%,#eee); }
.card-contraste .card-h{ color:var(--p); }
.contraste{ display:flex; align-items:stretch; gap:3mm; }
.ct-col{ flex:1; border-radius:12px; padding:4mm 4.5mm; border:2px solid; }
.ct-antiga{ background:#fef2f2; border-color:#f6c9c9; }
.ct-nova{ background:#f0fbf3; border-color:#bfe8cc; }
.ct-cab{ font-family:'Nunito'; font-weight:800; font-size:8.5pt; letter-spacing:.5px; text-transform:uppercase; margin-bottom:2.5mm; }
.ct-antiga .ct-cab{ color:#d63d3d; } .ct-nova .ct-cab{ color:#15924a; }
.ct-item{ font-size:9.3pt; line-height:1.4; font-weight:600; color:#3a4050; padding-left:4mm; position:relative; margin-top:1.8mm; }
.ct-item::before{ content:''; position:absolute; left:0; top:2mm; width:2mm; height:2mm; border-radius:50%; }
.ct-antiga .ct-item::before{ background:#d63d3d; } .ct-nova .ct-item::before{ background:#15924a; }
.ct-seta{ align-self:center; font-family:'Nunito'; font-weight:900; font-size:16pt; color:var(--p); flex-shrink:0; }
.card-passo{ background:color-mix(in srgb,var(--p) 5%,#fff); border-color:color-mix(in srgb,var(--p) 26%,#fff); }
.card-passo .card-h{ color:var(--p); }
.passo-list{ display:flex; flex-direction:column; gap:2.6mm; }
.passo-item{ display:flex; align-items:flex-start; gap:3mm; font-size:10pt; line-height:1.45; font-weight:600; color:#33384a; }
.passo-n{ flex-shrink:0; width:6.5mm; height:6.5mm; border-radius:50%; background:var(--p); color:#fff; font-family:'Nunito'; font-weight:800; font-size:8.5pt; display:flex; align-items:center; justify-content:center; margin-top:.2mm; }
.card-observar{ background:#faf6ff; border-color:#e2cdf6; }
.card-observar .card-h{ color:#8a4fc7; }
.obs-item{ display:flex; align-items:flex-start; gap:2.5mm; font-size:10pt; line-height:1.45; font-weight:600; color:#3a4050; margin-top:2mm; }
.obs-item svg{ width:4.3mm; height:4.3mm; color:#8a4fc7; flex-shrink:0; margin-top:.5mm; }
.page.pg-tint{ background:color-mix(in srgb, var(--s) 13%, #fff); }
.card-quote{ position:relative; margin:5mm 0; padding:6mm 8mm 6mm 16mm; display:flex; align-items:center; gap:5mm;
  background:color-mix(in srgb,var(--p) 5%,#fff); border-left:5px solid var(--p); border-radius:0 14px 14px 0; }
.q-mark{ position:absolute; left:5mm; top:1mm; font-family:'Nunito'; font-weight:900; font-size:40pt; color:color-mix(in srgb,var(--p) 35%,#fff); line-height:1; }
.q-txt{ flex:1; font-family:'Nunito'; font-weight:700; font-style:italic; font-size:13pt; line-height:1.45; color:var(--ink); }
.q-psn{ width:22mm; height:22mm; margin:-1.5mm 0; }
.cc{ background:linear-gradient(160deg, color-mix(in srgb,var(--p) 6%,#fff), color-mix(in srgb,var(--s) 12%,#fff)); display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:24mm 22mm; }
.cc-masc{ width:66mm; filter:drop-shadow(0 10px 20px rgba(0,0,0,.18)); margin-bottom:5mm; }
.cc-pessoa{ width:54mm; height:54mm; border-radius:50%; overflow:hidden; margin-bottom:6mm;
  border:2mm solid #fff; box-shadow:0 8px 20px rgba(0,0,0,.20), 0 0 0 1.2mm color-mix(in srgb,var(--p) 65%,#fff); background:#eef1f5; }
.cc-pessoa img{ width:100%; height:100%; object-fit:cover; object-position:center top; display:block; }
.cc-tit{ font-family:'Nunito'; font-weight:900; font-size:21pt; line-height:1.15; color:var(--ink); max-width:150mm; }
.cc-line{ width:22mm; height:1.4mm; background:var(--p); border-radius:1mm; margin:5mm 0; }
.cc-txt{ font-size:11.5pt; line-height:1.55; color:var(--muted); max-width:130mm; font-weight:600; }
.cc-cta{ margin-top:8mm; padding:6mm 8mm; border-radius:16px; max-width:140mm; text-align:left; color:#fff;
  background:linear-gradient(135deg, var(--p), color-mix(in srgb,var(--p) 55%,var(--s))); box-shadow:0 6px 16px color-mix(in srgb,var(--p) 30%,transparent); }
.cc-cta-rot{ font-family:'Nunito'; font-weight:800; font-size:8.5pt; letter-spacing:1.5px; text-transform:uppercase; color:rgba(255,255,255,.9); margin-bottom:2mm; }
.cc-cta-txt{ font-family:'Nunito'; font-weight:800; font-size:11.5pt; line-height:1.45; }
.cc-au{ margin-top:8mm; font-family:'Nunito'; font-weight:800; font-size:10pt; letter-spacing:1px; color:var(--p); text-transform:uppercase; }
.cv-titulo, .cap-open-tit, .cap-open-num, .sec-titulo, .cc-tit{ font-family:'Gagalin','Nunito',sans-serif; font-weight:normal; }
.cv-titulo{ letter-spacing:.4px; line-height:1.14; }
.cap-open-tit{ letter-spacing:.3px; line-height:1.12; }
.sec-titulo{ letter-spacing:.4px; }
.cc-tit{ letter-spacing:.4px; }
.bk b, .card-b b, .cv-sub b{ color:var(--p); font-weight:800; font-style:normal; }
.pg-tint .bk b{ color:color-mix(in srgb, var(--p) 86%, #000); }
</style></head>
<body>
<div class="page">
  <div class="cv-faixa">
    <div class="confetti"></div>
    <div class="cv-badge">E-book${nicho?` &middot; ${esc(nicho)}`:''}${faixa?` &middot; ${esc(PALETAS[faixa].rotulo)}`:''}</div>
    <div class="cv-titulo">${esc(tituloCase(d.titulo))}</div>
    <div class="cv-sub">${esc(d.subtitulo||'')}</div>
  </div>
  ${mascB64 ? `<img class="cv-masc" src="${mascB64}">` : (pessoaB64 ? `<div class="cv-pessoa"><img src="${pessoaB64}"></div>` : '')}
  <div class="cv-bottom">
    ${paraQuem?`<div class="cv-obj"><div class="cv-obj-rot">Pra quem é este e-book</div><div class="cv-obj-txt">${esc(paraQuem)}</div></div>`:''}
    <div class="cv-assina"><span class="bar"></span><span class="au">por ${esc(autor)} &middot; ${ano}</span></div>
  </div>
</div>
<div id="flow">${FLOW}</div>
<div class="page cc" id="contracapa">
  <div class="confetti"></div>
  ${mascB64 ? `<img class="cc-masc" src="${mascB64}">` : (pessoaB64 ? `<div class="cc-pessoa"><img src="${pessoaB64}"></div>` : '')}
  <div class="cc-tit">${esc(fecho)}</div>
  <div class="cc-line"></div>
  <div class="cc-txt">Você chegou até aqui porque acredita nisso. Agora é colocar em prática — um passo de cada vez.</div>
  ${d.cta && d.cta.trim() ? `<div class="cc-cta"><div class="cc-cta-rot">&#9654; Seu próximo passo</div><div class="cc-cta-txt">${esc(d.cta)}</div></div>` : ''}
  <div class="cc-au">${esc(autor)} &middot; ${ano}</div>
</div>
<script>
(function(){
 function run(){
  var flow = document.getElementById('flow');
  var cc = document.getElementById('contracapa');
  var blocks = Array.prototype.slice.call(flow.children);
  flow.parentNode.removeChild(flow);
  var TITULO = ${JSON.stringify(d.titulo||'')};
  var AUTOR  = ${JSON.stringify(autor)};
  function escH(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;'); }
  var pageNum = 0, pages = [], content = null, curSec = 'Introdução', curCap = 0;
  function novaPagina(){
    pageNum++;
    var pg = document.createElement('div'); pg.className = (curCap>0 && curCap%2===0) ? 'page pg-tint' : 'page';
    pg.innerHTML = '<div class="confetti"></div>'+
      '<div class="pg-head"><span class="ttl">'+escH(TITULO)+'</span><span class="sec" data-sec></span></div>'+
      '<div class="pg-content"></div>'+
      '<div class="pg-foot"><span class="au">'+escH(AUTOR)+'</span><span class="pg">'+pageNum+'</span></div>';
    document.body.insertBefore(pg, cc); pages.push(pg);
    return pg.querySelector('.pg-content');
  }
  function fits(){ return content.scrollHeight <= content.clientHeight + 1; }
  function setSec(){ var h = content.parentNode.querySelector('[data-sec]'); if (h) h.textContent = curSec; }
  function secDe(el){
    if (el.classList && el.classList.contains('sec-eyebrow')) return el.textContent.trim();
    var r = el.querySelector && el.querySelector('.cap-open-rot'); if (r) return r.textContent.trim();
    return null;
  }
  content = novaPagina();
  function usadoPx(){ var ks = content.children; return ks.length ? (ks[ks.length-1].offsetTop + ks[ks.length-1].offsetHeight - ks[0].offsetTop) : 0; }
  function colocarAtomico(el){
    var s = secDe(el); if (s) curSec = s;
    if (el.classList && el.classList.contains('cap-open')){ var rot = el.querySelector('.cap-open-rot'); var mm = rot && rot.textContent.match(/(\\d+)/); if (mm) curCap = parseInt(mm[1],10); }
    if (el.getAttribute('data-newpage')==='1' && content.children.length>0){ content = novaPagina(); }
    content.appendChild(el);
    var bad = !fits();
    if (!bad && el.getAttribute('data-knext')==='1'){
      var thr = el.classList.contains('cap-open') ? 0.16 : 0.09;
      if ((content.clientHeight - usadoPx()) < content.clientHeight*thr) bad = true;
    }
    if (bad){ content.removeChild(el); content = novaPagina(); var s2 = secDe(el); if (s2) curSec = s2; content.appendChild(el); }
    content.parentNode.classList.toggle('pg-tint', curCap>0 && curCap%2===0);
    setSec();
  }
  function colocarTexto(htmlRaw, lead){
    var words = String(htmlRaw).split(/\\s+/).filter(Boolean);
    var start = 0;
    while (start < words.length){
      var para = document.createElement('div');
      para.className = 'blk bk' + (lead && start===0 ? ' bk-lead' : '');
      content.appendChild(para); para.innerHTML = words[start];
      if (!fits()){ content.removeChild(para); content = novaPagina(); content.appendChild(para); para.innerHTML = words[start]; }
      var end = start + 1;
      while (end < words.length){
        para.innerHTML = words.slice(start, end+1).join(' ');
        if (!fits()){ para.innerHTML = words.slice(start, end).join(' '); break; }
        end++;
      }
      start = end;
      if (start < words.length){ content = novaPagina(); }
      setSec();
    }
  }
  for (var i=0;i<blocks.length;i++){
    var b = blocks[i];
    if (b.getAttribute('data-text')==='1') colocarTexto(b.innerHTML, b.getAttribute('data-lead')==='1');
    else colocarAtomico(b);
  }
  var total = pages.length;
  pages.forEach(function(pg,idx){ pg.querySelector('.pg').textContent = (idx+1)+'/'+total; });
  var ult = pages[pages.length-1].querySelector('.pg-content');
  var kids = ult.children;
  var usado = kids.length ? (kids[kids.length-1].offsetTop + kids[kids.length-1].offsetHeight - kids[0].offsetTop) : 0;
  if (usado < ult.clientHeight*0.78){ ult.style.display='flex'; ult.style.flexDirection='column'; ult.style.justifyContent='center'; }
  document.body.setAttribute('data-paginado','1');
 }
 if (document.fonts && document.fonts.ready) { document.fonts.ready.then(run); } else { run(); }
})();
</script>
</body></html>`;
  return html;
}

module.exports = { montarHtml, PALETAS };
