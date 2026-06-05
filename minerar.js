// MINERADOR DE OFERTAS — espiona a Biblioteca de Anúncios do Meta (pública, grátis) e salva um dossiê do nicho.
// Faz sozinho o que o Adsparo faz. Sinal de "escalado" = tempo rodando + nº de anúncios usando o mesmo criativo.
//   node minerar.js "jiu jitsu infantil"
//   node minerar.js "atividades para professores" BR
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const OUT = path.join(__dirname, 'inteligencia');
fs.mkdirSync(OUT, { recursive: true });

const nicho = process.argv[2] || 'jiu jitsu infantil';
const pais = (process.argv[3] || 'BR').toUpperCase();
const slug = nicho.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');

const URL = `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=${pais}` +
  `&q=${encodeURIComponent(nicho)}&search_type=keyword_unordered&media_type=all` +
  `&sort_data[mode]=total_impressions&sort_data[direction]=desc`;

// extrator (validado): lê o innerText e estrutura cada anúncio
function PARSER() {
  const t = document.body.innerText;
  const total = (t.match(/[~\d.]+\s*resultado/i) || [''])[0];
  const partes = t.split(/Identificação da biblioteca:/i).slice(1);
  const meses = 'jan fev mar abr mai jun jul ago set out nov dez'.split(' ');
  const hoje = new Date();
  const ads = [];
  for (const p of partes) {
    const mDate = p.match(/Veiculação iniciada em (\d+) de (\w+)\.? de (\d{4})/i);
    let dias = null, desde = null;
    if (mDate) {
      desde = `${mDate[1]} ${mDate[2]} ${mDate[3]}`;
      const mi = meses.indexOf(mDate[2].toLowerCase().slice(0,3));
      if (mi >= 0) dias = Math.round((hoje - new Date(+mDate[3], mi, +mDate[1])) / 86400000);
    }
    const mEsc = p.match(/(\d+) anúncios usam esse criativo/i);
    const mAn = p.match(/Ver (?:detalhes do anúncio|resumo)\s*\n([^\n]+)/i);
    const mCopy = p.match(/Patrocinado\s*\n([\s\S]{0,400})/i);
    const gancho = mCopy ? mCopy[1].replace(/\n+/g,' ').trim() : '';
    ads.push({
      dias, desde,
      criativos_repetidos: mEsc ? +mEsc[1] : 1,
      anunciante: mAn ? mAn[1].trim() : '?',
      gancho: gancho.slice(0, 320),
    });
  }
  return { total, ads };
}

(async () => {
  console.log(`>>> Minerando "${nicho}" (${pais}) na Biblioteca de Anúncios do Meta...`);
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox','--disable-setuid-sandbox','--lang=pt-BR'] });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36');
  await page.setViewport({ width: 1280, height: 1600 });
  await page.goto(URL, { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise(r => setTimeout(r, 5000));
  // rola pra carregar mais anúncios
  for (let i = 0; i < 8; i++) { await page.evaluate(() => window.scrollBy(0, 2400)); await new Promise(r => setTimeout(r, 1500)); }
  const dados = await page.evaluate(PARSER);
  await browser.close();

  // filtra anúncios válidos e ordena por "mais escalado" (tempo rodando + criativos repetidos)
  let ads = (dados.ads || []).filter(a => a.gancho && a.gancho.length > 25 && !/^API\.WHATSAPP/i.test(a.gancho));
  // dedup por gancho
  const seen = new Set();
  ads = ads.filter(a => { const k = a.gancho.slice(0,60); if (seen.has(k)) return false; seen.add(k); return true; });
  ads.sort((a,b) => (b.criativos_repetidos - a.criativos_repetidos) || ((b.dias||0) - (a.dias||0)));

  const dossie = { nicho, pais, total_no_meta: dados.total, minerado_em: new Date().toISOString().slice(0,10), qtd_capturada: ads.length, anuncios: ads.slice(0, 40) };
  const dest = path.join(OUT, `${slug}.json`);
  fs.writeFileSync(dest, JSON.stringify(dossie, null, 2));
  console.log(`OK — ${dados.total} no Meta, ${ads.length} capturados e salvos em:`);
  console.log('   ' + dest);
  console.log('\nTOP 5 (mais escalados/antigos):');
  ads.slice(0,5).forEach((a,i)=>console.log(`  ${i+1}. [${a.dias}d, ${a.criativos_repetidos}x] ${a.anunciante}: ${a.gancho.slice(0,90)}...`));
  process.exit(0);
})().catch(e => { console.error('ERRO:', e.message); process.exit(1); });
