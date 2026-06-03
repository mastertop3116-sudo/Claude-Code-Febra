'use strict';
// ============================================================
// CATÁLOGO DE IMAGENS — registra TODA imagem que a gente criou
// pra reusar sempre que fizer sentido (nunca desperdiçar uma imagem).
//
// - escanear()      → lê assets/ e devolve a lista catalogada (com tags)
// - buscarLocal()   → acha a melhor imagem nossa pra um nicho (base64) ou null
// - catalogar()     → gera o manifesto JSON + uma galeria HTML pra navegar
//
// O Criador usa buscarLocal() ANTES de baixar/gerar imagem nova.
// ============================================================
const fs = require('fs');
const path = require('path');

const RAIZ   = path.join(__dirname, '..');
const ASSETS = path.join(RAIZ, 'assets');
const SAIDA  = path.join(ASSETS, 'catalogo');

// pastas de assets que contêm imagens NOSSAS (criadas por nós)
const PASTAS = ['mascotes', 'natacao'];

const FAIXAS = { branca:'Faixa Branca', cinza:'Faixa Cinza', amarela:'Faixa Amarela', laranja:'Faixa Laranja', verde:'Faixa Verde', azul:'Faixa Azul', roxa:'Faixa Roxa', marrom:'Faixa Marrom', preta:'Faixa Preta', vermelha:'Faixa Vermelha' };
const NIVEIS = { iniciante:'Iniciante', intermediario:'Intermediário', avancado:'Avançado', professor:'Professor', kids:'Kids', podio:'Pódio' };

const norm = s => (s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,'');

// extrai metadados (nicho, variante, tags, chaves de busca) a partir da pasta+nome
function meta(pasta, file) {
  const base   = file.replace(/\.(png|jpe?g|webp)$/i, '');
  const transp = /-transp$/.test(base);
  const nome   = base.replace(/-transp$/, '');
  if (pasta === 'mascotes') {
    const cor = nome.replace(/^jj-/, '');
    return { nicho:'jiu-jitsu', variante: FAIXAS[cor] || cor, tipo:'mascote 3d', transparente:transp, fonte:'gpt-image-2',
      chaves:['jiujitsu','jiu','jitsu','bjj','tatame'],
      tags:['jiu-jitsu','infantil','kids','mascote','3d', 'faixa-'+cor] };
  }
  if (pasta === 'natacao') {
    const nv = nome.replace(/^nat-/, '');
    return { nicho:'natacao', variante: NIVEIS[nv] || nv, tipo:'mascote 3d', transparente:transp, fonte:'gpt-image-2',
      chaves:['natacao','natacão','swimming','nado','piscina'],
      tags:['natacao','infantil','kids','mascote','3d', nv] };
  }
  return { nicho:pasta, variante:nome, tipo:'imagem', transparente:transp, fonte:'?', chaves:[norm(pasta)], tags:[pasta] };
}

// varre os assets e devolve a lista catalogada
function escanear() {
  const itens = [];
  for (const pasta of PASTAS) {
    const dir = path.join(ASSETS, pasta);
    if (!fs.existsSync(dir)) continue;
    for (const file of fs.readdirSync(dir).sort()) {
      if (!/\.(png|jpe?g|webp)$/i.test(file)) continue;
      const abs = path.join(dir, file);
      let bytes = 0; try { bytes = fs.statSync(abs).size; } catch (_) {}
      itens.push({ arquivo:file, pasta, rel:`assets/${pasta}/${file}`, abs, bytes, ...meta(pasta, file) });
    }
  }
  // AUTO-CATÁLOGO: imagens que o Criador baixou de banco grátis / criou com IA, por tema.
  // É isto que faz o catálogo do site "se alimentar sozinho".
  const autoRoot = path.join(ASSETS, 'catalogo-auto');
  if (fs.existsSync(autoRoot)) {
    for (const slug of fs.readdirSync(autoRoot).sort()) {
      const dir = path.join(autoRoot, slug);
      let st; try { st = fs.statSync(dir); } catch (_) { continue; }
      if (!st.isDirectory()) continue;
      let origem = 'banco'; try { origem = (fs.readFileSync(path.join(dir, '.origem'), 'utf8').trim() || 'banco'); } catch (_) {}
      const ehIA = origem === 'ia';
      for (const file of fs.readdirSync(dir).sort()) {
        if (!/\.(png|jpe?g|webp)$/i.test(file)) continue;
        const abs = path.join(dir, file);
        let bytes = 0; try { bytes = fs.statSync(abs).size; } catch (_) {}
        itens.push({
          arquivo:file, pasta:`catalogo-auto/${slug}`, rel:`assets/catalogo-auto/${slug}/${file}`, abs, bytes,
          nicho:slug, variante: ehIA ? 'Criada pela nossa IA' : 'Foto de banco grátis',
          tipo: ehIA ? 'imagem IA' : 'foto', transparente:false, fonte:origem,
          chaves:[norm(slug)], tags:[slug, ehIA ? 'ia' : 'banco-gratis'],
        });
      }
    }
  }
  return itens;
}

// acha a melhor imagem NOSSA pra um nicho → { dataUri, item } ou null
// opts.transparente: true (prefere recortada) | false (prefere fundo, boa p/ capa)
function buscarLocal(nicho, opts = {}) {
  const alvo = norm(nicho);
  if (!alvo) return null;
  let itens = escanear().filter(it => it.chaves.some(c => c.length >= 3 && alvo.includes(c)));
  if (!itens.length) return null;
  if (opts.transparente === true)  { const t = itens.filter(i=>i.transparente);  if (t.length) itens = t; }
  if (opts.transparente === false) { const f = itens.filter(i=>!i.transparente); if (f.length) itens = f; }
  const esc = itens[Math.floor(Math.random() * itens.length)];
  try {
    const buf = fs.readFileSync(esc.abs);
    const ext = path.extname(esc.abs).slice(1).toLowerCase();
    const mime = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
    return { dataUri:`data:${mime};base64,${buf.toString('base64')}`, item:esc };
  } catch (_) { return null; }
}

// gera o manifesto JSON + a galeria HTML
function catalogar() {
  fs.mkdirSync(SAIDA, { recursive: true });
  const itens = escanear();
  const manifesto = {
    gerado_em: new Date().toISOString().slice(0,10),
    total: itens.length,
    por_nicho: itens.reduce((a,i)=>{ a[i.nicho]=(a[i.nicho]||0)+1; return a; }, {}),
    imagens: itens.map(({abs, ...resto}) => resto),
  };
  fs.writeFileSync(path.join(SAIDA, 'catalogo-imagens.json'), JSON.stringify(manifesto, null, 2));
  fs.writeFileSync(path.join(SAIDA, 'index.html'), galeriaHTML(itens, manifesto));
  return manifesto;
}

function galeriaHTML(itens, m) {
  const nichos = Object.keys(m.por_nicho).sort();
  const card = it => `
    <figure class="card ${it.transparente?'is-transp':''}" data-nicho="${it.nicho}" data-transp="${it.transparente}">
      <div class="thumb"><img loading="lazy" src="/catalogo-assets/${it.pasta}/${encodeURIComponent(it.arquivo)}" alt="${it.variante}"></div>
      <figcaption>
        <strong>${it.variante}</strong>
        <span class="nicho">${it.nicho}</span>
        ${it.transparente?'<span class="badge">fundo recortado</span>':'<span class="badge alt">com fundo</span>'}
        <code>${it.arquivo}</code>
      </figcaption>
    </figure>`;
  const chips = ['todos', ...nichos].map((n,i)=>`<button class="chip${i===0?' on':''}" data-f="${n}">${n}${n!=='todos'?` · ${m.por_nicho[n]}`:''}</button>`).join('');
  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Catálogo de Imagens · MAX</title>
<style>
  :root{--bg:#0d1117;--card:#161b22;--line:#262d38;--txt:#e6edf3;--mut:#8b97a8;--ac:#f97316}
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:var(--bg);color:var(--txt);font-family:'Segoe UI',system-ui,Arial,sans-serif;padding:28px 22px 60px}
  header{max-width:1200px;margin:0 auto 18px}
  h1{font-size:24px;letter-spacing:.3px}h1 span{color:var(--ac)}
  p.sub{color:var(--mut);margin-top:5px;font-size:14px}
  .chips{display:flex;flex-wrap:wrap;gap:8px;margin:18px auto 0;max-width:1200px}
  .chip{background:var(--card);color:var(--mut);border:1px solid var(--line);border-radius:999px;padding:6px 14px;font-size:13px;font-weight:600;cursor:pointer;text-transform:capitalize}
  .chip.on{background:var(--ac);color:#1a1206;border-color:var(--ac)}
  .grid{max-width:1200px;margin:22px auto 0;display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:16px}
  .card{background:var(--card);border:1px solid var(--line);border-radius:14px;overflow:hidden;display:flex;flex-direction:column}
  .thumb{aspect-ratio:1;display:flex;align-items:center;justify-content:center;padding:10px;background:#0b0f14}
  .card.is-transp .thumb{background:conic-gradient(#20262f 0 25%,#171c23 0 50%) 0 0/22px 22px}
  .thumb img{max-width:100%;max-height:100%;object-fit:contain}
  figcaption{padding:10px 11px 12px;display:flex;flex-direction:column;gap:4px;border-top:1px solid var(--line)}
  figcaption strong{font-size:14px}
  .nicho{color:var(--ac);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.6px}
  .badge{align-self:flex-start;font-size:10px;font-weight:700;background:#13351f;color:#3fd07f;padding:2px 7px;border-radius:6px}
  .badge.alt{background:#2a2030;color:#c79bf0}
  figcaption code{color:var(--mut);font-size:10px;word-break:break-all}
  footer{max-width:1200px;margin:30px auto 0;color:var(--mut);font-size:12px;text-align:center}
</style></head><body>
<header>
  <h1>Catálogo de <span>Imagens</span></h1>
  <p class="sub">${m.total} imagens que a gente criou · atualizado em ${m.gerado_em}. Clique nos filtros pra ver por nicho. Reusadas automaticamente pelo Criador quando o nicho bate.</p>
  <div class="chips">${chips}</div>
</header>
${itens.length === 0 ? `<div style="max-width:620px;margin:60px auto;text-align:center;color:var(--mut);line-height:1.6">
  <div style="font-size:42px;margin-bottom:14px">🖼️</div>
  <h2 style="color:var(--txt);font-size:19px;margin-bottom:8px">O catálogo ainda está vazio</h2>
  <p>Toda vez que você criar um material com IA sobre um tema novo, o sistema busca uma imagem grátis (ou cria com a nossa IA) e <b>guarda aqui automaticamente</b>. Crie seu primeiro e-book e volte aqui — as imagens daquele tema vão aparecer.</p>
</div>` : `<main class="grid">${itens.map(card).join('')}</main>`}
<footer>Gerado por <b>gerar-catalogo.js</b> · as imagens ficam em <code>assets/mascotes</code> e <code>assets/natacao</code></footer>
<script>
  const chips=document.querySelectorAll('.chip'), cards=document.querySelectorAll('.card');
  chips.forEach(c=>c.onclick=()=>{chips.forEach(x=>x.classList.remove('on'));c.classList.add('on');
    const f=c.dataset.f; cards.forEach(k=>k.style.display=(f==='todos'||k.dataset.nicho===f)?'':'none');});
</script>
</body></html>`;
}

module.exports = { escanear, buscarLocal, catalogar, SAIDA };
