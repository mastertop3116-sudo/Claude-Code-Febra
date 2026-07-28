// E2E do dashboard NEXUS OS — como usuário DE VERDADE (fresh, sem nada guardado)
const puppeteer = require('/srv/nexus/max-criador-repo/node_modules/puppeteer');
const BASE = 'https://claude-code-febra.onrender.com';
const SENHA = process.env.SENHA || 'BRN2306';
let ok = 0; const falhas = [];
const t = (n, c) => { if (c) { ok++; console.log('  ✓', n); } else { falhas.push(n); console.log('  ✗ FALHOU:', n); } };
const espera = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({
    headless: 'shell',
    executablePath: '/home/nexus/.cache/puppeteer/chrome-headless-shell/linux-148.0.7778.167/chrome-headless-shell-linux64/chrome-headless-shell',
    args: ['--no-sandbox'],
  });

  // ═══ COMPUTADOR — usuário novo, nada guardado ═══
  console.log('— COMPUTADOR 1366×850 (usuário novo) —');
  const pg = await browser.newPage();
  const erros = [];
  pg.on('pageerror', e => erros.push(String(e)));
  await pg.setViewport({ width: 1366, height: 850 });

  await pg.goto(BASE + '/dashboard', { waitUntil: 'networkidle2', timeout: 120000 });
  await espera(1000);
  t('porta da frente aparece pra quem não tem senha', await pg.evaluate(() => !!document.getElementById('s')));

  // digitar a senha na tela, como o Rodrigo faria
  await pg.type('#s', SENHA);
  await pg.click('button');
  await pg.waitForSelector('.sb-nav', { timeout: 120000 });
  await espera(9000);

  t('entrou no painel após digitar a senha', await pg.evaluate(() => !!document.getElementById('sidebar') || !!document.querySelector('.sb-nav')));
  t('NÃO pede senha uma segunda vez', await pg.evaluate(() => !document.getElementById('s')));
  t('senha some da barra de endereço', !pg.url().includes(SENHA));
  t('carregou sem erro de script', erros.length === 0);

  // BRIEFING (financeiro) — o quadro tem que ter número, não 401
  const finTexto = await (async () => {
    const f = pg.frames().find(x => x.url().includes('financeiro'));
    return f ? await f.evaluate(() => document.body.innerText) : '';
  })();
  t('Briefing mostra o financeiro (não 401)', /Receita hoje/.test(finTexto) && !/senha/i.test(finTexto.slice(0, 200)));
  t('Briefing traz receita em R$', /R\$\s?\d/.test(finTexto));

  // CENTRAL
  await pg.evaluate(() => navigate('central')); await espera(7000);
  const centralTxt = await (async () => { const f = pg.frames().find(x => x.url().includes('central-')); return f ? await f.evaluate(() => document.body.innerText) : ''; })();
  t('Central de Entregas carrega as vendas', /venda/i.test(centralTxt) && /Entregues/i.test(centralTxt));

  // COPIE & COLE
  await pg.evaluate(() => navigate('acessos')); await espera(6000);
  const acessosOk = await (async () => { const f = pg.frames().find(x => x.url().includes('aba=acessos')); return f ? await f.evaluate(() => document.querySelectorAll('.ac').length) : 0; })();
  t('Copie & Cole lista os produtos (>10)', acessosOk > 10);

  // WHATSAPP
  await pg.evaluate(() => navigate('whats')); await espera(7000);
  const wf = pg.frames().find(x => x.url().includes('whats-'));
  const convs = wf ? await wf.evaluate(() => document.querySelectorAll('.conv').length) : 0;
  t('WhatsApp lista conversas (>5)', convs > 5);
  if (wf && convs) {
    await wf.click('.conv'); await espera(1200);
    t('abre a conversa com as mensagens', await wf.evaluate(() => document.querySelectorAll('.msg').length > 0));
    t('mostra caixa de resposta OU aviso de 24h', await wf.evaluate(() =>
      document.getElementById('composer').classList.contains('on') || document.getElementById('cx-aviso').classList.contains('on')));
  }

  // MÁQUINA
  await pg.evaluate(() => navigate('maquina')); await espera(6000);
  t('Máquina de Criativos abre o estúdio', await pg.evaluate(() => {
    const f = document.getElementById('maquinaFrame'); return !!f && !!f.getAttribute('src');
  }));

  // TEMA
  await pg.evaluate(() => navigate('briefing')); await espera(2000);
  t('tema claro é o padrão', await pg.evaluate(() => document.body.classList.contains('claro')));
  await pg.evaluate(() => window.alternarTemaNx ? alternarTemaNx() : document.getElementById('temaBtn').click()); await espera(1500);
  t('botão de tema alterna pro escuro', await pg.evaluate(() => !document.body.classList.contains('claro')));
  await pg.evaluate(() => window.alternarTemaNx ? alternarTemaNx() : document.getElementById('temaBtn').click());

  // menu sem itens mortos
  t('menu não tem telas removidas', await pg.evaluate(() => {
    const txt = document.querySelector('.sb-nav').innerText.toLowerCase();
    return !['métricas', 'radar', 'pipeline', 'biblioteca', 'cérebro', 'board', 'gastos de api', 'integrações', 'editor de vídeo'].some(x => txt.includes(x));
  }));

  // ═══ CELULAR ═══
  console.log('— CELULAR 391×844 —');
  const mb = await browser.newPage();
  const errosM = [];
  mb.on('pageerror', e => errosM.push(String(e)));
  await mb.setViewport({ width: 391, height: 844, isMobile: true, hasTouch: true });
  await mb.goto(BASE + '/dashboard', { waitUntil: 'networkidle2', timeout: 120000 });
  await espera(1200);
  if (await mb.$('#s')) {                       // porta pedida = digita; senão já entrou pelo cookie
    await mb.type('#s', SENHA); await mb.click('button');
  }
  await mb.waitForSelector('.sb-nav', { timeout: 120000 });
  await espera(9000);
  t('celular: entra e carrega sem erro', errosM.length === 0);
  t('celular: menu escondido (gaveta)', await mb.evaluate(() => {
    const s = document.getElementById('sidebar'); return s.getBoundingClientRect().left < -50;
  }));
  await mb.click('#menuBtn'); await espera(800);
  t('celular: botão ☰ abre a gaveta', await mb.evaluate(() => document.getElementById('sidebar').getBoundingClientRect().left >= -1));
  t('celular: sem rolagem horizontal', await mb.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 2));

  // ═══ SEGURANÇA ═══
  console.log('— SEGURANÇA —');
  const limpo = await browser.createBrowserContext();   // navegador zerado, sem cookie
  const nova = await limpo.newPage();
  const r1 = await nova.goto(BASE + '/dashboard', { waitUntil: 'domcontentloaded' });
  t('navegador novo sem senha: barrado', r1.status() === 401 || await nova.evaluate(() => !!document.getElementById('s')));
  const fonte = await (await fetch(BASE + '/dashboard?k=' + SENHA)).text();
  t('fonte não publica senhas de área', !/jiujitsu2026|nexus-primo-2026/.test(fonte));
  t('fonte não publica a senha do painel', !fonte.includes(SENHA));

  await browser.close();
  console.log(`\nRESULTADO: ${ok} passaram, ${falhas.length} falharam`);
  if (falhas.length) { console.log('FALHAS:', falhas.join(' | ')); process.exit(1); }
})().catch(e => { console.error('ERRO GERAL:', e.message); process.exit(1); });
