// VISTORIA E2E — dashboard NEXUS OS em vários tamanhos + contraste + Máquina sem 2º login
const puppeteer = require('/srv/nexus/max-criador-repo/node_modules/puppeteer');
const BASE = 'https://claude-code-febra.onrender.com';
const SENHA = process.env.SENHA || 'BRN2306';
let ok = 0; const falhas = [];
const t = (n, c) => { if (c) { ok++; console.log('  ✓', n); } else { falhas.push(n); console.log('  ✗ FALHOU:', n); } };
const espera = ms => new Promise(r => setTimeout(r, ms));

// contraste WCAG entre duas cores rgb
function lum(c) {
  const [r, g, b] = c.map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function razao(c1, c2) { const a = lum(c1), b = lum(c2); return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05); }
const rgb = s => (s.match(/\d+/g) || [0, 0, 0]).slice(0, 3).map(Number);

const TELAS = [
  { nome: 'Notebook 1366×768', w: 1366, h: 768, mobile: false },
  { nome: 'Monitor 1920×1080', w: 1920, h: 1080, mobile: false },
  { nome: 'Tablet 1024×768', w: 1024, h: 768, mobile: false },
  { nome: 'Celular 391×844', w: 391, h: 844, mobile: true },
  { nome: 'Celular pequeno 360×640', w: 360, h: 640, mobile: true },
];

(async () => {
  const browser = await puppeteer.launch({
    headless: 'shell',
    executablePath: '/home/nexus/.cache/puppeteer/chrome-headless-shell/linux-148.0.7778.167/chrome-headless-shell-linux64/chrome-headless-shell',
    args: ['--no-sandbox'],
  });

  for (const tela of TELAS) {
    console.log(`\n— ${tela.nome} —`);
    const ctx = await browser.createBrowserContext();   // sessão limpa a cada tamanho
    const p = await ctx.newPage();
    const erros = [];
    p.on('pageerror', e => erros.push(String(e)));
    await p.setViewport({ width: tela.w, height: tela.h, isMobile: tela.mobile, hasTouch: tela.mobile });

    await p.goto(BASE + '/dashboard', { waitUntil: 'networkidle2', timeout: 120000 });
    await espera(900);
    await p.type('#s', SENHA);
    await p.click('button');
    await p.waitForSelector('.sb-nav', { timeout: 120000 });
    await espera(9000);

    t(`${tela.nome}: entra e carrega sem erro`, erros.length === 0);
    t(`${tela.nome}: sem rolagem horizontal`, await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 2));

    // CONTRASTE do menu (o que o Rodrigo reclamou)
    const contrastes = await p.evaluate(() => {
      const out = [];
      const fundo = getComputedStyle(document.querySelector('#sidebar') || document.body).backgroundColor;
      document.querySelectorAll('.sb-label').forEach(el => out.push({ txt: el.textContent.trim(), cor: getComputedStyle(el).color, fundo }));
      const g = document.querySelector('.sb-group-label');
      if (g) out.push({ txt: 'GRUPO:' + g.textContent.trim(), cor: getComputedStyle(g).color, fundo });
      const td = document.querySelector('.topbar-desc');
      if (td) out.push({ txt: 'SUBTÍTULO', cor: getComputedStyle(td).color, fundo: getComputedStyle(document.querySelector('.topbar')).backgroundColor });
      return out;
    });
    const ruins = contrastes.filter(c => razao(rgb(c.cor), rgb(c.fundo)) < 4.5);
    t(`${tela.nome}: textos do menu legíveis (contraste ≥4,5)`, ruins.length === 0);
    if (ruins.length) console.log('     ilegíveis:', ruins.map(r => `${r.txt} (${razao(rgb(r.cor), rgb(r.fundo)).toFixed(1)})`).join(', '));

    // MÁQUINA sem segundo login
    await p.evaluate(() => navigate('maquina'));
    await espera(9000);
    const mf = p.frames().find(f => f.url().includes('estudio') || f.url().includes('ir-maquina'));
    const txtMaquina = mf ? await mf.evaluate(() => document.body.innerText).catch(() => '') : '';
    t(`${tela.nome}: Máquina abre SEM pedir login`, !!txtMaquina && !/acesso restrito|senha|usuário/i.test(txtMaquina.slice(0, 400)));

    // telas principais respondem
    for (const [v, marca] of [['central', /Entregues/i], ['acessos', /copiar|senha/i], ['whats', /conversa|Sofia|leitura/i], ['briefing', /Receita hoje/i]]) {
      await p.evaluate(x => navigate(x), v);
      await espera(6500);
      const fr = p.frames().filter(f => f !== p.mainFrame());
      let achou = false;
      for (const f of fr) { try { const s = await f.evaluate(() => document.body.innerText); if (marca.test(s)) { achou = true; break; } } catch (e) {} }
      t(`${tela.nome}: tela ${v} carregou com conteúdo`, achou);
    }

    await ctx.close();
  }

  await browser.close();
  console.log(`\nRESULTADO DA VISTORIA: ${ok} passaram, ${falhas.length} falharam`);
  if (falhas.length) { console.log('FALHAS:', falhas.join(' | ')); process.exit(1); }
})().catch(e => { console.error('ERRO GERAL:', e.message); process.exit(1); });
