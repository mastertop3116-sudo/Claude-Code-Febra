// Os 3 ORDER BUMPS de NATAÇÃO (espelham os bônus Premium do primo). Conteúdo à mão (sem API/custo).
// Cada bump = mini-produto ROBUSTO, com TODA página preenchendo a folha A4 inteira (.fill distribui).
// Capas ilustradas com as imagens 3D (professor / kids / pódio). Saída em ./oferta-natacao/.
//   node gerar-bumps-natacao.js
const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const puppeteer = require('puppeteer');

const ASSETS = path.join(__dirname, 'assets');
const OUT = path.join(__dirname, 'oferta-natacao');
fs.mkdirSync(OUT, { recursive: true });
const TMP = path.join(OUT, '.tmpb'); fs.mkdirSync(TMP, { recursive: true });
const b64 = p => fs.existsSync(p) ? fs.readFileSync(p).toString('base64') : '';
const GAGALIN = b64(path.join(ASSETS, 'fonts/Gagalin-Regular.otf'));
const esc = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
function img(nome) {
  const t = path.join(ASSETS, `natacao/nat-${nome}-transp.png`);
  const o = path.join(ASSETS, `natacao/nat-${nome}.png`);
  const p = fs.existsSync(t) ? t : o;
  const d = b64(p); return d ? `data:image/png;base64,${d}` : '';
}

const AUTOR = process.env.NAT_AUTOR || 'Equipe Treinos de Natação';
const AZUL = '#0284c7', AZUL2 = '#38bdf8', NAVY = '#07223a';
const NIV = { iniciante:'#06b6d4', intermediario:'#2563eb', avancado:'#1e3a8a' };

const CSS = `
@page{size:A4;margin:0} *{margin:0;padding:0;box-sizing:border-box}
@font-face{font-family:'Gagalin';src:url(data:font/otf;base64,${GAGALIN}) format('opentype')}
body{font-family:'Nunito','Segoe UI',Arial,sans-serif;color:#1a1a2e}
.page{width:210mm;height:297mm;position:relative;overflow:hidden;page-break-after:always;
  background:linear-gradient(165deg, ${AZUL}12 0%, #ffffff 50%, ${AZUL2}1c 100%)}
.page:last-child{page-break-after:auto}
.bar{position:absolute;left:0;top:0;bottom:0;width:8mm;background:${AZUL};display:flex;align-items:center;justify-content:center;z-index:2}
.bar span{writing-mode:vertical-rl;transform:rotate(180deg);color:#fff;font-family:'Gagalin';font-size:8.5pt;letter-spacing:2px;text-transform:uppercase;white-space:nowrap}
.body{padding:12mm 12mm 14mm 16mm;height:100%;display:flex;flex-direction:column;position:relative;z-index:1}
.fill{flex:1;display:flex;flex-direction:column;justify-content:space-between;padding-top:3mm}
.fill>*{margin-bottom:0 !important}
.foot{position:absolute;bottom:0;left:0;right:0;height:9mm;display:flex;align-items:center;justify-content:space-between;
  padding:0 12mm 0 16mm;background:${AZUL}0d;border-top:1.5px dashed ${AZUL}3a}
.foot .a{font-size:7pt;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:${AZUL}}
.foot .n{font-family:'Gagalin';font-size:8.5pt;color:#7c8aa5}
.g{font-family:'Gagalin';color:${AZUL}}
.h1{font-family:'Gagalin';color:${AZUL};font-size:22pt;line-height:1.05}
.h1s{font-size:10.5pt;font-weight:700;color:#566;margin-top:1.5mm}
.card{border:2px solid ${AZUL}3a;border-radius:14px;background:#fff;padding:3.4mm 4.4mm;
  box-shadow:0 2px 0 ${AZUL}20, 0 4px 9px rgba(20,40,80,.06)}
.card h3{font-family:'Gagalin';font-size:11.5pt;color:${AZUL};text-transform:uppercase;letter-spacing:.4px;margin-bottom:2mm}
.row{display:flex;gap:3mm;align-items:flex-start;padding:1.4mm 0;font-size:10pt;font-weight:600;line-height:1.42}
.box{flex:0 0 auto;width:4mm;height:4mm;border:2px solid ${AZUL};border-radius:4px;margin-top:.6mm}
.dot{flex:0 0 auto;color:${AZUL};font-weight:900;margin-top:.2mm}
.num{flex:0 0 auto;width:7.5mm;height:7.5mm;border-radius:50%;background:${AZUL};color:#fff;font-family:'Gagalin';font-size:11pt;display:flex;align-items:center;justify-content:center}
.dica{background:${AZUL};border-radius:13px;color:#fff;padding:4mm 5mm;font-size:10pt;font-weight:600;line-height:1.5;margin-top:3.5mm}
.dica b{display:block;font-family:'Gagalin';font-size:10.5pt;letter-spacing:.4px;margin-bottom:1.3mm;color:#fff;text-transform:uppercase}
`;

function cover({ kicker, titulo, sub, ilustracao, paginas }) {
  return `<div class="page" style="background:radial-gradient(120% 80% at 50% 0%, #0e7490 0%, ${NAVY} 62%, #051726 100%)">
    <div style="position:absolute;inset:0;background-image:radial-gradient(circle,#fff 1.5px,transparent 1.5px);background-size:46px 46px;opacity:.05"></div>
    <div style="height:100%;display:flex;flex-direction:column;align-items:center;justify-content:space-between;padding:24mm 18mm 16mm;position:relative;z-index:1;color:#fff;text-align:center">
      <div style="display:flex;flex-direction:column;align-items:center">
        <div style="font-family:'Gagalin';font-size:11pt;letter-spacing:3px;background:rgba(255,255,255,.12);border:1.5px solid rgba(255,255,255,.3);border-radius:30px;padding:3mm 8mm;text-transform:uppercase">🏊 ${esc(kicker)}</div>
        <div style="font-family:'Gagalin';font-size:33pt;line-height:1.05;margin:7mm 0 4mm;text-shadow:0 4px 16px rgba(0,0,0,.4)">${esc(titulo)}</div>
        <div style="font-size:13pt;font-weight:700;color:rgba(255,255,255,.88);max-width:155mm;line-height:1.4">${esc(sub)}</div>
        ${paginas?`<div style="margin-top:5mm;font-size:10pt;font-weight:800;letter-spacing:2px;color:${AZUL2};text-transform:uppercase">${esc(paginas)}</div>`:''}
      </div>
      ${ilustracao?`<img src="${ilustracao}" style="width:88mm;height:88mm;object-fit:contain;filter:drop-shadow(0 8px 12px rgba(0,0,0,.45))"/>`:''}
      <div style="font-family:'Gagalin';font-size:14pt;letter-spacing:1px">por ${esc(AUTOR)}</div>
    </div>
  </div>`;
}

let _pg = 0, _label = '';
function content(inner) {
  _pg++;
  return `<div class="page"><div class="bar"><span>${esc(_label)}</span></div>
    <div class="body">${inner}<div class="foot"><span class="a">${esc(AUTOR)}</span><span class="n">${_pg}</span></div></div></div>`;
}
const head = (t, s) => `<div class="h1">${esc(t)}</div>${s?`<div class="h1s">${esc(s)}</div>`:''}`;
const fill = (...items) => `<div class="fill">${items.filter(Boolean).join('')}</div>`;
const card = (t, inner) => `<div class="card">${t?`<h3>${esc(t)}</h3>`:''}${inner}</div>`;
const chk = a => a.map(t=>`<div class="row"><div class="box"></div><div>${t}</div></div>`).join('');
const bull = a => a.map(t=>`<div class="row"><div class="dot">›</div><div>${t}</div></div>`).join('');
const numered = a => a.map((x,i)=>`<div class="card" style="display:flex;gap:3.5mm;align-items:flex-start"><div class="num">${i+1}</div><div style="flex:1"><div class="g" style="font-size:11pt;text-transform:uppercase;letter-spacing:.3px;margin-bottom:.8mm">${esc(x[0])}</div><div style="font-size:9.7pt;font-weight:600;line-height:1.45;color:#333">${x[1]}</div></div></div>`).join('');
const dica = t => `<div class="dica"><b>💡 Dica do Técnico</b>${t}</div>`;
const bloco = (tempo, t, d) => `<div class="card" style="display:flex;gap:4mm;align-items:flex-start">
  <div style="flex:0 0 auto;background:${AZUL};color:#fff;border-radius:11px;padding:2.4mm 3mm;text-align:center;min-width:20mm">
    <div style="font-family:'Gagalin';font-size:12.5pt;line-height:1">${esc(tempo)}</div><div style="font-size:6.5pt;font-weight:800;letter-spacing:1px;opacity:.85">MIN</div></div>
  <div style="flex:1"><div class="g" style="font-size:11pt;text-transform:uppercase;margin-bottom:1mm">${esc(t)}</div><div style="font-size:9.8pt;font-weight:600;line-height:1.45;color:#333">${d}</div></div></div>`;
const nivelRow = (chave, rotulo, txt) => `<div class="card" style="display:flex;gap:3.5mm;align-items:center;border-left:6px solid ${NIV[chave]}">
  <div style="flex:0 0 auto;width:30mm;font-family:'Gagalin';font-size:11pt;color:${NIV[chave]};text-transform:uppercase">${esc(rotulo)}</div>
  <div style="flex:1;font-size:9.8pt;font-weight:600;line-height:1.42;color:#333">${txt}</div></div>`;
const nivelCard = (chave, rot, bullets) => `<div class="card" style="border-left:6px solid ${NIV[chave]}"><h3 style="color:${NIV[chave]}">${esc(rot)}</h3>${bull(bullets)}</div>`;
const fala = (sit, t, nota) => `<div class="card"><h3>${esc(sit)}</h3><div style="font-size:9.8pt;font-weight:600;line-height:1.5;color:#333;font-style:italic">"${t}"</div>${nota?`<div style="margin-top:1.6mm;padding-top:1.4mm;border-top:1px dashed ${AZUL}33;font-size:8.6pt;font-weight:800;color:${AZUL};text-transform:uppercase;letter-spacing:.3px">👉 ${esc(nota)}</div>`:''}</div>`;

async function render(htmlPages, file) {
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body>${htmlPages.join('')}</body></html>`;
  const browser = await puppeteer.launch({ headless:'new', args:['--no-sandbox','--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width:794, height:1123 });
  await page.setContent(html, { waitUntil:'networkidle0', timeout:60000 });
  await new Promise(r=>setTimeout(r,300));
  const pdf = await page.pdf({ format:'A4', printBackground:true, margin:{top:0,right:0,bottom:0,left:0} });
  await browser.close();
  let buf = pdf;
  const transp = fs.existsSync(path.join(ASSETS,`natacao/nat-${file.hd}-transp.png`)) ? path.join(ASSETS,`natacao/nat-${file.hd}-transp.png`) : path.join(ASSETS,`natacao/nat-${file.hd}.png`);
  if (file.hd && fs.existsSync(transp)) {
    const inP = path.join(TMP,'i.pdf'), outP = path.join(TMP,'o.pdf'); fs.writeFileSync(inP, pdf);
    for (const bin of [process.env.PYTHON_BIN,'python','python3'].filter(Boolean)) {
      try { cp.execFileSync(bin, [path.join(__dirname,'replace-mascote.py'), inP, transp, outP], { stdio:'ignore', timeout:60000 }); buf = fs.readFileSync(outP); break; } catch(e){}
    }
    try { fs.unlinkSync(inP); fs.unlinkSync(outP); } catch(_){}
  }
  fs.writeFileSync(path.join(OUT, file.name), buf);
  console.log('OK', file.name, Math.round(buf.length/1024)+'KB', `(${htmlPages.length} pág.)`);
}

// ════════════ BUMP 1 — PLANILHA DE AVALIAÇÃO DO ALUNO ════════════
function bump1() {
  _pg = 0; _label = 'Planilha de Avaliação';
  const criterio = (n,t,bullets,teste,alerta)=>`<div class="card"><h3>${n}. ${esc(t)}</h3>${bull(bullets)}<div style="margin-top:1.5mm;font-size:9pt;font-weight:700;color:${AZUL};font-style:italic">💧 Como testar: ${esc(teste)}</div><div style="margin-top:1.5mm;padding-top:1.5mm;border-top:1px dashed ${AZUL}33;font-size:9pt;font-weight:800;color:#dc2626">🚩 Sinal de alerta: ${esc(alerta)}</div></div>`;
  const escalaRow = (n, rot, txt, cor) => `<div class="card" style="display:flex;gap:3.5mm;align-items:center;border-left:6px solid ${cor}">
    <div style="flex:0 0 auto;width:9mm;height:9mm;border-radius:50%;background:${cor};color:#fff;font-family:'Gagalin';font-size:12pt;display:flex;align-items:center;justify-content:center">${n}</div>
    <div style="flex:0 0 auto;width:34mm;font-family:'Gagalin';font-size:11pt;color:${cor};text-transform:uppercase">${esc(rot)}</div>
    <div style="flex:1;font-size:9.7pt;font-weight:600;line-height:1.4;color:#333">${txt}</div></div>`;

  const pgs = [cover({ kicker:'Bônus 1', titulo:'Planilha de\nAvaliação do Aluno', sub:'Saiba exatamente o que medir em cada nível — e prove a evolução pros pais com clareza.', ilustracao:img('professor'), paginas:'7 páginas + planilha imprimível' })];

  // P1 — por que e como avaliar
  pgs.push(content(head('Por Que Avaliar o Aluno','Avaliar é o que transforma "acho que tá indo bem" em prova de evolução') +
    fill(
      card('O que você ganha avaliando', bull([
        '<b>Sabe o que treinar:</b> a nota baixa de hoje é o foco da próxima aula.',
        '<b>Prova a evolução pros pais:</b> número que sobe segura matrícula e gera indicação.',
        '<b>Motiva o aluno:</b> ver o próprio avanço é o melhor combustível pra continuar.',
        '<b>Decide a progressão sem achismo:</b> a planilha diz a hora exata de subir de nível.',
      ])),
      card('As 3 regras da boa avaliação', bull([
        '<b>Avalie SEMPRE nadando</b>, nunca parado na borda. Habilidade se vê na água.',
        '<b>Reavalie a cada 4 a 6 semanas.</b> A comparação entre duas datas é a prova viva.',
        '<b>Registre por escrito</b> na planilha (última página). O que não é anotado vira achismo.',
      ])),
      card('Quando avaliar (a rotina)', bull([
        '<b>Na 1ª aula:</b> uma avaliação-diagnóstico pra saber de onde o aluno parte.',
        '<b>Uma vez por mês:</b> a avaliação completa dos 7 pontos, com calma.',
        '<b>Toda aula:</b> uma anotação rápida do que saltou aos olhos (bom ou ruim).',
      ])),
      card('Os 7 pontos que você vai medir', bull([
        'Entrada na água · Respiração · Flutuação & equilíbrio · Pernada',
        'Braçada · Coordenação · Segurança & autonomia',
        'Cada um recebe uma nota de 1 a 4 — detalhada nas próximas páginas.',
      ])),
    ) +
    dica('Não precisa avaliar tudo todo dia. Faça a avaliação completa 1 vez por mês, com calma, olhando cada aluno nadar. Nas outras aulas, anote só o que saltar aos olhos.')));

  // P2 — pontos 1 a 4
  pgs.push(content(head('Os 7 Pontos em Detalhe','O que observar, como testar e o sinal de alerta pra corrigir') +
    fill(
      criterio(1,'Entrada na água',['Entra com segurança pelo método do nível (escada, sentado, de cabeça)','Submerge o rosto sem hesitar','Não depende do professor pra entrar'],'peça pra entrar e dar uma volta sozinho na parte rasa.','Trava na borda; só entra no colo ou chorando.'),
      criterio(2,'Respiração',['Expira DEBAIXO da água, pelo nariz e boca','Inspira rápido fora, sem prender o fôlego','Mantém o ritmo respiratório enquanto nada'],'peça 5 bolhas seguidas afundando — o ar sai contínuo?','Sobe segurando o ar e engole água (o erro nº 1).'),
      criterio(3,'Flutuação & equilíbrio',['Flutua em estrela ventral e dorsal, relaxado','Mantém o quadril alto e o corpo alinhado','Faz o deslize (streamline) reto e longo'],'peça a estrela ventral por 5 segundos sem apoio.','O quadril afunda e o corpo "senta" na água.'),
      criterio(4,'Pernada',['Batida a partir do quadril, contínua','Pé solto (chinelo), joelho quase reto','Sustenta o corpo na horizontal'],'1 piscina de pernada com prancha — respingo pequeno e contínuo?','Pedala (dobra muito o joelho) e não sai do lugar.'),
    )));

  // P3 — pontos 5 a 7 + juntando + dica
  pgs.push(content(head('Os 7 Pontos em Detalhe','continuação') +
    fill(
      criterio(5,'Braçada',['Mão entra esticada à frente, sem cruzar o centro','Empurra a água até a coxa (puxada completa)','Cotovelo alto na puxada; corpo rola junto'],'conte as braçadas numa piscina — a mão empurra até a coxa?','Braçada curta que para no meio e escorrega.'),
      criterio(6,'Coordenação',['Junta braço + perna + respiração sem travar','Nada contínuo a distância do nível (25 m, 100 m, 400 m...)','Mantém a técnica do início ao fim'],'peça a distância do nível sem parar e observe o nado inteiro.','Desmonta o nado todo quando vai respirar.'),
      criterio(7,'Segurança & autonomia',['Sabe parar, ficar em pé e voltar à borda sozinho','Vira pra respirar / descansar se cansa no meio','Entende e respeita os comandos e as regras'],'peça pra parar no meio, ficar em pé e voltar com calma.','Entra em pânico se perde o pé ou se cansa.'),
      card('📋 Juntando os 7 pontos', bull([
        'Olhe o conjunto: o aluno está mais perto de qual nível?',
        'Os pontos com nota 1 ou 2 viram o plano das próximas 4 semanas.',
        'Refaça a avaliação sempre na mesma ordem, pra comparar com justiça.',
      ])),
    ) +
    dica('Uma nota baixa não é problema — é o mapa do que treinar. A planilha não julga o aluno, ela guia o seu trabalho e mostra pra família que existe um plano por trás de cada aula.')));

  // P4 — escala 1 a 4
  pgs.push(content(head('A Escala de Domínio','Dê uma nota de 1 a 4 pra cada ponto — objetivo, sem "acho que sim"') +
    fill(
      escalaRow('1','Não faz','Ainda não executa, ou só com muito apoio e insegurança. É o foco do trabalho agora.','#dc2626'),
      escalaRow('2','Em desenvolvimento','Já tenta e às vezes consegue, mas inconstante e com erros grosseiros.','#ea580c'),
      escalaRow('3','Faz com ajustes','Executa sozinho na maioria das vezes; falta só refinar detalhes.','#ca8a04'),
      escalaRow('4','Domina','Faz com naturalidade e constância, mesmo cansado. Pronto pra subir o nível.','#16a34a'),
      card('Como usar a nota na prática', bull([
        'Dê a nota observando o aluno NADAR, não parado na borda.',
        'O aluno só sobe de nível com nota <b>3 ou 4 em TODOS os 7 pontos</b>.',
        'Qualquer nota 1 ou 2 vira automaticamente o foco das próximas aulas.',
      ])),
    ) +
    dica('Anote a DATA de cada avaliação. Quando você mostra pros pais que em 6 semanas a respiração foi de nota 2 pra 4, a renovação da matrícula acontece sozinha.')));

  // P5 — o que cobrar por nível
  pgs.push(content(head('O Que Cobrar em Cada Nível','A régua de competências esperadas — o aluno domina tudo antes de subir') +
    fill(
      nivelCard('iniciante','Iniciante (ciano)',['Entra na água sem medo e submerge o rosto','Sopra bolhas e respira com ritmo','Flutua em estrela e desliza alinhado','Pernada de crawl contínua com prancha','Atravessa 25 m de crawl com respiração lateral','Vira pra respirar e volta à borda sozinho']),
      nivelCard('intermediario','Intermediário (azul)',['Nada os 4 estilos com técnica reconhecível','Respiração bilateral confortável no crawl','Braçada longa, cotovelo alto e rolagem de corpo','Virada de crawl sem parar o nado','Nada 400 m contínuos controlando o ritmo']),
      nivelCard('avancado','Avançado (azul-marinho)',['Saída de bloco e deslize submerso','Controle de pace e split de prova','Virada rápida e tiros de velocidade','Mantém a técnica firme mesmo na fadiga','Faz simulado de prova com estratégia']),
    ) +
    dica('Cole esta página na parede da sua área de trabalho. Bate o olho e você sabe na hora o que cada aluno ainda precisa pra subir de nível — sem depender da memória.')));

  // P6 — planilha imprimível (preenche a folha)
  _pg++;
  const criterios = ['Entrada na água','Respiração','Flutuação & equilíbrio','Pernada','Braçada','Coordenação','Segurança & autonomia'];
  const circ = `<span style="display:inline-block;width:6mm;height:6mm;border:1.7px solid ${AZUL};border-radius:50%;margin:0 .8mm"></span>`;
  const linhaP = (c) => `<div style="display:flex;align-items:center;border-bottom:1px solid ${AZUL}25;padding:2.9mm 0">
      <div style="flex:1;font-size:10pt;font-weight:700;color:#23304a">${esc(c)}</div>
      <div style="flex:0 0 auto;display:flex;align-items:center">${circ}${circ}${circ}${circ}</div></div>`;
  const linhaEscrita = (n=1) => Array(n).fill(`<div style="border-bottom:1px solid #ccd;height:7mm"></div>`).join('');
  pgs.push(`<div class="page"><div class="bar"><span>${esc(_label)}</span></div><div class="body">
    ${head('Planilha de Avaliação','Imprima uma por aluno e arquive — a cada avaliação, uma folha nova')}
    <div class="fill">
      <div class="card">
        <div style="display:flex;gap:4mm;margin-bottom:2.4mm;font-size:9.5pt;font-weight:800;color:${AZUL}">
          <div style="flex:1.5">Aluno: ____________________________</div><div style="flex:1">Nível: __________</div><div style="flex:0 0 auto">Idade: ____</div>
        </div>
        <div style="display:flex;gap:4mm;font-size:9.5pt;font-weight:800;color:${AZUL}">
          <div style="flex:1">Data: ____ /____ /______</div><div style="flex:1.4">Professor(a): ____________________</div>
        </div>
      </div>
      <div class="card" style="background:${AZUL}0d;padding:2.6mm 4.4mm">
        <div style="font-size:8.8pt;font-weight:700;color:#334;line-height:1.4">Legenda da nota — <b>1</b> Não faz · <b>2</b> Em desenvolvimento · <b>3</b> Faz com ajustes · <b>4</b> Domina</div>
      </div>
      <div class="card" style="padding:1.5mm 5mm">
        <div style="display:flex;align-items:center;border-bottom:2px solid ${AZUL};padding:1.6mm 0">
          <div style="flex:1;font-family:'Gagalin';font-size:9.5pt;color:${AZUL};text-transform:uppercase">Critério</div>
          <div style="flex:0 0 auto;font-family:'Gagalin';font-size:9pt;color:${AZUL};text-transform:uppercase">Marque a nota (1 · 2 · 3 · 4)</div>
        </div>
        ${criterios.map(linhaP).join('')}
      </div>
      <div class="card"><h3>🎯 Metas para a próxima avaliação</h3>${linhaEscrita(2)}</div>
      <div class="card"><h3>📝 Observações</h3>${linhaEscrita(2)}</div>
    </div>
    <div class="foot"><span class="a">${esc(AUTOR)}</span><span class="n">${_pg}</span></div>
  </div></div>`);

  // P7 — falando com os pais
  pgs.push(content(head('Mostrando a Evolução pros Pais','A planilha na mão + a frase certa = matrícula renovada') +
    fill(
      fala('Comparando duas avaliações', 'Olha aqui: há 6 semanas o(a) [nome] tinha nota 2 em respiração, hoje está em 4. Foi exatamente o que a gente trabalhou — e dá pra ver na água.', 'use na conversa mensal, com a planilha na mão'),
      fala('Explicando por que ainda não subiu', 'O(a) [nome] já domina quase tudo do nível. Falta firmar [ponto específico] — em 2 a 3 semanas sobe com segurança. Subir cedo demais cria buraco lá na frente.', 'quando o pai pergunta "quando muda de turma?"'),
      fala('Quando acham que está devagar', 'Natação é base. O que parece "devagar" agora é o alicerce que evita medo e vício de movimento depois. Olha a planilha: a evolução está toda aqui, ponto por ponto.', 'quando comparam com vídeo da internet'),
      fala('Comemorando uma conquista', 'Conquista do mês: o(a) [nome] atravessou os 25 metros sem parar pela primeira vez! É o marco que mostra que a base está sólida.', 'mande no grupo/particular no dia que acontecer'),
      fala('Quando o aluno quer desistir', 'É normal nessa fase do aprendizado. Me dê mais 3 aulas: a planilha mostra que ele(a) está a um passo de destravar [ponto] — e é aí que a natação fica divertida.', 'quando a criança reclama de ir à aula'),
    ) +
    dica('Nunca diga só "está indo bem". Aponte o NÚMERO que subiu na planilha. Evolução medida é evolução que o pai enxerga, valoriza e paga — e que vira indicação pra novos alunos.')));
  return pgs;
}

// ════════════ BUMP 2 — TREINOS PARA TURMAS INFANTIS ════════════
function bump2() {
  _pg = 0; _label = 'Treinos Infantis';
  const pgs = [cover({ kicker:'Bônus 2', titulo:'Treinos para\nTurmas Infantis', sub:'Aula de criança é com brincadeira: 35 jogos que ensinam a nadar sem ela perceber.', ilustracao:img('kids'), paginas:'35 jogos lúdicos + estrutura da aula' })];

  // P1 — a aula infantil ideal
  pgs.push(content(head('A Aula Infantil Ideal','O método de 5 blocos que prende a criança na piscina do começo ao fim') +
    fill(
      card('Antes de mergulhar: 3 regras de ouro', bull([
        '<b>Olho na turma SEMPRE</b> — 1 adulto pra poucas crianças, nunca de costas pra água.',
        '<b>Profundidade certa</b> — criança com o pé no chão e água no máximo no peito.',
        '<b>Combinado de segurança</b> — sinal claro de "entra", "para" e "sai da água".',
      ])),
      bloco('2–3','Ritual de Entrada','Chamada divertida, 1 regra de segurança e o "combinado" do dia. Marca que a aula começou.'),
      bloco('5–8','Aquecimento Brincando','Um jogo que já trabalha adaptação ou respiração sem a criança perceber que está treinando.'),
      bloco('8–12','Foco do Dia','UMA habilidade (flutuar, soprar bolhas, pernada). Demonstra com alegria, exige pouco, repete pouco.'),
      bloco('8–10','Jogo Aplicado','Uma brincadeira que usa a habilidade recém-treinada. É aqui que ela "gruda" de verdade.'),
      bloco('3–5','Ritual de Saída','Brincadeira calma, "o que foi mais legal hoje?" e elogio individual. Termina sempre querendo voltar.'),
    ) +
    dica('Criança não foca mais que 8–12 min seguidos — é fisiologia. Alternar agito (jogo) e calma (habilidade) segura a turma sem precisar gritar. E nunca tire o olho da turma na água.')));

  const cats = [
    ['Perder o Medo & Adaptação', 'iniciante', [
      ['Chuveirinho','Cada um joga água na própria cabeça e no colega (de leve), virando chuva.','aceitar o rosto molhado'],
      ['Caça ao Tesouro Raso','Argolas e brinquedos no fundo raso pra pegar, uma de cada vez.','submersão sem medo'],
      ['Trenzinho na Borda','Em fila, mãos no ombro do colega, andam pela parte rasa cantando.','confiança em grupo'],
      ['Toca o Queixo','Ao comando, encostam o queixo, depois a boca, depois o nariz na água.','adaptação progressiva'],
      ['Elevador','Segurando a borda, descem e sobem o corpo na água como um elevador.','imersão controlada'],
      ['Estátua Molhada','Andam pela água e, ao sinal, "congelam" molhando até o ombro.','perder o medo brincando'],
      ['Pula da Borda','Pulam sentados (depois em pé) na parte rasa segurando a mão do professor.','coragem e entrada na água'],
    ]],
    ['Respiração & Bolhas', 'iniciante', [
      ['Sopra a Bolinha','Soprar uma bolinha de pingue-pongue pela raia, só com o ar.','sopro forte e contínuo'],
      ['Vulcão de Bolhas','Afundar até a boca e fazer o "maior vulcão" de bolhas que conseguir.','expirar dentro d’água'],
      ['Sino que Toca','Afundam e fazem "blub-blub" como um sino, soltando ar pelo nariz e boca.','expiração pelo nariz'],
      ['Quem Apaga a Vela','Soprar a água como quem apaga velinha de aniversário, cada vez mais longe.','controle do sopro'],
      ['Mergulho do Aro','Passar por dentro de um arco submerso soltando o ar no caminho.','expirar embaixo nadando'],
      ['Corrida das Bolhas','Atravessar a parte rasa fazendo bolhas o tempo todo, sem parar de soprar.','ritmo de respiração'],
      ['Telefone de Bolhas','Falam uma palavra embaixo soltando bolhas; o colega tenta adivinhar.','expirar relaxado, sem medo'],
    ]],
    ['Flutuação & Deslize', 'intermediario', [
      ['Estrelinha do Mar','Boiar em estrela (ventral e dorsal) o mais relaxado possível. Quem fica mais tempo "brilha".','flutuação relaxada'],
      ['Foguete pra Lua','Empurrar a parede e deslizar reto como foguete, contando até onde chega.','alinhamento do corpo'],
      ['Boia Humana','De costas, boiar contando estrelas no teto, bem tranquilo.','vencer o medo de costas'],
      ['Pizza e Bolinha','"Pizza" = aberto boiando; "bolinha" = encolhido afundando. Troca no comando.','equilíbrio e flutuação'],
      ['Águas-vivas','Boiam moles como água-viva, relaxando cada parte do corpo ao comando.','relaxamento na água'],
      ['Deslize do Túnel','Deslizar passando por baixo de um arco ou das pernas abertas de um colega.','deslize alinhado'],
      ['Cama de Gato','De costas, de mãos dadas em roda, boiam juntos sem deixar ninguém afundar.','confiança de costas em grupo'],
    ]],
    ['Pernada & Propulsão', 'intermediario', [
      ['Corrida de Pranchas','De meia-piscina, só com a pernada segurando a prancha. Quem chega com respingo pequeno.','pernada contínua'],
      ['Liquidificador','Pernada bem rápida fazendo "espuma" na superfície, depois devagar.','controle da batida'],
      ['Motorzinho de Barco','Pernada contínua atravessando, fazendo "barulho de motor".','batida a partir do quadril'],
      ['Rabo de Sereia','Pernada de golfinho ondulando o corpo como uma sereia ou tubarão.','ondulação do corpo'],
      ['Pega o Pato','Pernada perseguindo um patinho de borracha empurrado pela água.','propulsão com objetivo'],
      ['Foguete Turbo','Deslize da parede + pernada forte, medindo até onde o "foguete" chega.','propulsão de pernas'],
      ['Caça ao Tubarão','Pernada perseguindo o "tubarão" (professor com prancha) pela piscina.','pernada com ritmo de jogo'],
    ]],
    ['Pura Diversão & Coletivos', 'avancado', [
      ['Vivo ou Morto Aquático','"Vivo" = em pé; "morto" = agachado submerso. Quem erra o comando, sai.','escuta e imersão'],
      ['Pega-pega Submarino','Pega-pega em que quem afunda fica "salvo" por alguns segundos.','imersão sem medo'],
      ['Estátua Flutuante','Boiam e congelam quando a música para. Solta energia e treina flutuar.','flutuação no comando'],
      ['Revezamento das Argolas','Times levam argolas do fundo até a borda, um de cada vez.','mergulho + equipe'],
      ['Túnel das Pernas','Em fila, pernas abertas; um por vez passa por baixo, como um túnel.','imersão e confiança'],
      ['Polo Maluco','Em times, passar uma bola sem deixá-la afundar e levar até o "gol".','nado + trabalho em equipe'],
      ['Estafeta Maluca','Revezamento atravessando do jeito sorteado (pernada, deslize ou boia).','revisar tudo se divertindo'],
    ]],
  ];
  for (const [titulo, nivel, jogos] of cats) {
    const cor = NIV[nivel];
    const cards = jogos.map((j,i)=>`<div class="card" style="border-left:6px solid ${cor};display:flex;gap:3.5mm;align-items:flex-start">
        <div style="flex:0 0 auto;width:7.5mm;height:7.5mm;border-radius:50%;background:${cor};color:#fff;font-family:'Gagalin';font-size:11pt;display:flex;align-items:center;justify-content:center">${i+1}</div>
        <div style="flex:1"><div class="g" style="font-size:11pt;text-transform:uppercase;letter-spacing:.3px;margin-bottom:.5mm">${esc(j[0])}</div>
          <div style="font-size:9.6pt;font-weight:600;line-height:1.4;color:#333">${esc(j[1])}</div>
          <div style="margin-top:.9mm;font-size:8.3pt;font-weight:800;color:${cor};text-transform:uppercase;letter-spacing:.3px">🎯 Trabalha: ${esc(j[2])}</div></div></div>`).join('');
    pgs.push(content(head(titulo,'Brincadeira que já ensina um fundamento da natação') + fill(cards)));
  }

  // P final — erros comuns na aula infantil
  pgs.push(content(head('7 Erros na Aula Infantil','O que esvazia a turma — e como evitar') +
    fill(numered([
      ['Cobrar técnica perfeita cedo demais','Com criança, primeiro vem o prazer e a confiança. Técnica fina vem depois — senão ela cria trauma e desiste.'],
      ['Aula sem brincadeira','Criança aprende brincando. Sem o jogo, a habilidade não fixa e a aula vira sofrimento.'],
      ['Fila parada esperando a vez','Criança parada sente frio e perde o foco. Mantenha todos em movimento (jogo em paralelo).'],
      ['Ignorar o medo da água','Empurrar quem tem medo piora tudo. Respeite o tempo de cada um — o medo vai embora com confiança, não na marra.'],
      ['Esquecer de elogiar','Um elogio individual no fim de cada aula é o que faz a criança AMAR a natação e os pais renovarem.'],
      ['Turma grande sem ajuda','Mais crianças que você consegue olhar é risco de segurança. Diminua a turma ou peça um auxiliar.'],
      ['Mudar a rotina toda aula','Criança gosta de previsibilidade. Mantenha os rituais de entrada e saída — eles dão segurança.'],
    ])) +
    dica('Toda aula infantil deveria terminar com a criança rindo e querendo voltar. Se ela sai feliz, os pais mantêm a matrícula. Diversão não é o contrário de aprender — é o caminho.')));
  return pgs;
}

// ════════════ BUMP 3 — GUIA DE PROGRESSÃO POR NÍVEL ════════════
function bump3() {
  _pg = 0; _label = 'Guia de Progressão';
  const pgs = [cover({ kicker:'Bônus 3', titulo:'Guia de\nProgressão por Nível', sub:'Saiba EXATAMENTE quando subir o aluno — sem pular etapa, sem segurar quem já pode.', ilustracao:img('podio'), paginas:'Critérios + checklist por nível' })];

  // P1 — a régua
  pgs.push(content(head('A Régua da Progressão','Os 3 níveis e a regra de ouro pra subir de um pro outro') +
    fill(
      nivelCard('iniciante','Iniciante (ciano)',['Adaptação ao meio líquido e fim do medo','Respiração: soprar embaixo e inspirar fora','Flutuação, deslize e pernada de crawl','Os primeiros 25 m de crawl coordenados']),
      nivelCard('intermediario','Intermediário (azul)',['Os 4 nados com técnica reconhecível','Respiração bilateral e virada de crawl','Braçada longa com rolagem de corpo','Resistência: 400 m contínuos']),
      nivelCard('avancado','Avançado (azul-marinho)',['Saída de bloco e deslize submerso','Pace, split e controle de prova','Velocidade, limiar e VO2','Técnica firme mesmo na fadiga']),
      card('⏳ Quanto tempo em cada nível?', bull([
        'Não existe prazo fixo — depende da frequência e da idade. Em média, alguns meses por nível.',
        'O que manda é o DOMÍNIO, não o calendário: tempo de piscina não é o mesmo que evolução.',
        'Criança costuma levar mais tempo no Iniciante (medo e coordenação) — e tudo bem.',
      ])),
    ) +
    dica('A regra de ouro: nível novo só quando o aluno domina o atual de olhos fechados. Não tenha pressa de subir, e não segure quem já está pronto. As próximas páginas dão o checklist exato de cada passagem.')));

  // P2 — iniciante -> intermediário
  pgs.push(content(head('Iniciante → Intermediário','Só sobe quando marca TODOS estes itens') +
    fill(
      card('Pré-requisitos (tem que dominar)', chk(['Entra na água sem medo e submerge o rosto tranquilo','Expira embaixo d’água e inspira fora, com ritmo','Flutua em estrela (ventral e dorsal) relaxado','Pernada de crawl contínua, a partir do quadril','Atravessa 25 m de crawl sem parar, respirando de lado','Fica em pé, recupera o equilíbrio e volta à borda sozinho'])),
      card('✅ Sinais de que está pronto', bull(['Pede pra "nadar de verdade" e acha o raso fácil','Não engole água nem entra em pânico ao respirar nadando','Sustenta o corpo na horizontal sem afundar o quadril'])),
      card('⚠️ O que costuma travar', bull(['<b>A respiração lateral</b> — é o item que mais segura a passagem.','Como destravar: insista na respiração de lado com prancha e no "sopra embaixo, vira e inspira", todo dia.'])),
      card('🎯 Metas pra trabalhar agora', bull(['Respiração lateral rítmica (comece por um lado só, depois bilateral)','25 m de crawl coordenado, sem parar','Introduzir o nado costas pra ganhar conforto e variar'])),
    ) +
    dica('Não espere o aluno acertar 100% pra avançar no que ele já domina. Trave só no item que falta (quase sempre a respiração) e siga construindo o resto — assim ele não estaciona nem se frustra.')));

  // P3 — intermediário -> avançado
  pgs.push(content(head('Intermediário → Avançado','A passagem mais exigente — só sobe quem tem base sólida') +
    fill(
      card('Pré-requisitos (tem que dominar)', chk(['Nada os 4 estilos com técnica reconhecível','Respiração bilateral confortável no crawl','Virada de crawl sem parar o nado','Braçada longa, cotovelo alto e rolagem de corpo','Nada 400 m contínuos controlando o ritmo','Entende e mantém um pace pedido pelo professor'])),
      card('✅ Sinais de que está pronto', bull(['Aguenta séries com descanso curto sem desmontar a técnica','Tem fôlego sobrando ao fim de 400 m leves','Quer treinar tempo, virada e saída — busca desempenho'])),
      card('⚠️ O que costuma travar', bull(['<b>A técnica que desmonta na fadiga</b> — nada bonito descansado, feio cansado.','Como destravar: séries técnicas com cansaço controlado, exigindo manter a braçada longa.'])),
      card('🎯 Metas pra trabalhar agora', bull(['Reduzir o número de braçadas por piscina (nadar mais longo)','Segurar um pace pedido em 4×100 m','Virada de crawl automática, sem pensar'])),
    ) +
    dica('Avançado é volume e intensidade. Se a base do intermediário está sólida, a transição é natural; se a técnica ainda quebra no cansaço, segure mais um pouco — pressa aqui vira lesão de ombro lá na frente.')));

  // P4 — 7 erros
  pgs.push(content(head('7 Erros ao Promover de Nível','O que derruba a evolução do aluno — e como evitar') +
    fill(numered([
      ['Subir cedo demais pra agradar','Nível novo sem base vira frustração e medo. Cobre os pré-requisitos, não a vontade dos pais.'],
      ['Segurar quem já está pronto','O aluno que domina tudo e não sobe, desanima e desiste. Avalie e promova na hora certa.'],
      ['Avaliar parado, não nadando','Habilidade se vê na água. Nota dada na borda não vale — observe nadando, cansado, em série.'],
      ['Pular a respiração','Quase todo travamento de nível é respiração mal resolvida. É o primeiro item a firmar, sempre.'],
      ['Não registrar a evolução','Sem planilha, a promoção vira "achismo". Meça os 7 pontos e deixe a régua decidir por você.'],
      ['Comparar um aluno com o outro','Cada criança tem seu tempo na água. Comparar desmotiva — acompanhe a evolução de cada um.'],
      ['Mudar de nível sem preparar','Avise o aluno e os pais, explique o que muda. Transição combinada é transição sem ansiedade.'],
    ]))));

  // P5 — checklist imprimível
  const checkNivel = (chave, rot, itens) => `<div class="card" style="border-left:6px solid ${NIV[chave]}"><h3 style="color:${NIV[chave]}">${esc(rot)}</h3>${chk(itens)}</div>`;
  _pg++;
  pgs.push(`<div class="page"><div class="bar"><span>${esc(_label)}</span></div><div class="body">
    ${head('Checklist de Progressão','Imprima e marque por aluno — quando tudo estiver ✓, é hora de subir')}
    <div class="card" style="background:${AZUL}0d;padding:2.6mm 4.4mm;margin-bottom:0">
      <div style="font-size:9.3pt;font-weight:800;color:${AZUL}">Aluno: __________________________   Reavaliar em: ____ /____ /______</div>
    </div>
    <div class="fill">
      ${checkNivel('iniciante','Pronto para o Intermediário', ['Entra sem medo e submerge tranquilo','Expira embaixo, inspira fora, com ritmo','Flutua relaxado (estrela e deslize)','Pernada de crawl contínua','25 m de crawl com respiração lateral'])}
      ${checkNivel('intermediario','Pronto para o Avançado', ['Os 4 nados com técnica reconhecível','Respiração bilateral confortável','Virada de crawl sem parar','400 m contínuos com ritmo controlado','Mantém um pace pedido'])}
      ${checkNivel('avancado','Metas do Avançado', ['Saída de bloco e deslize submerso','Pace e split de prova sob controle','Virada rápida e tiros de velocidade','Técnica firme na fadiga','Simulado de prova com estratégia'])}
    </div>
    ${dica('Reavalie a cada 4 a 6 semanas e guarde as folhas antigas. A sequência de checklists vira a história da evolução do aluno — e a melhor ferramenta de retenção que você tem.')}
    <div class="foot"><span class="a">${esc(AUTOR)}</span><span class="n">${_pg}</span></div>
  </div></div>`);

  // P6 — conversando com os pais sobre progressão
  pgs.push(content(head('Conversando com os Pais','A progressão explicada do jeito certo segura o aluno na escola') +
    fill(
      fala('Quando o aluno SOBE de nível', 'Conquista! O(a) [nome] dominou tudo do nível e está subindo pro [próximo]. É o resultado direto do trabalho e da constância dele(a).', 'comemore na frente da criança — motiva muito'),
      fala('Quando ainda NÃO é a hora', 'Falta firmar [ponto]. Subir agora criaria um buraco lá na frente. Me dê 2 a 3 semanas que ele(a) sobe com a base sólida — e isso vale muito mais.', 'quando perguntam "quando muda de turma?"'),
      fala('Quando comparam com outra criança', 'Cada criança tem seu tempo na água. Comparar atrapalha; o que importa é a evolução dele(a) — e ela está toda aqui, registrada na planilha.', 'quando citam o colega que "já passou"'),
      fala('Quando acham caro ou demorado', 'Natação é uma base que dura a vida inteira. Cada nível bem feito hoje evita medo, lesão e vício de movimento amanhã. É investimento, não gasto.', 'na hora da renovação da matrícula'),
      fala('Apresentando o plano do nível', 'Neste nível o foco do(a) [nome] vai ser [objetivo]. Quando ele(a) dominar estes pontos aqui da planilha, sobe pro próximo — você vai acompanhar tudo.', 'no início de cada nível, alinhando expectativa'),
    ) +
    dica('Progressão bem comunicada é matrícula que não cai. O pai que entende ONDE o filho está e PRA ONDE vai, confia no seu trabalho e indica a escola pros amigos.')));
  return pgs;
}

(async () => {
  console.log('>>> Gerando os 3 order bumps de natação ROBUSTOS (grátis)...');
  await render(bump1(), { name:'bump1-planilha-de-avaliacao.pdf', hd:'professor' });
  await render(bump2(), { name:'bump2-treinos-infantis.pdf',       hd:'kids' });
  await render(bump3(), { name:'bump3-guia-de-progressao.pdf',      hd:'podio' });
  try { fs.rmSync(TMP, { recursive:true, force:true }); } catch(_){}
  console.log('\nPRONTO! Pasta:', OUT);
  process.exit(0);
})().catch(e => { console.error('ERRO:', e.message); process.exit(1); });
