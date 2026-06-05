// Gera os 3 ORDER BUMPS de jiu-jitsu infantil — versão ROBUSTA (conteúdo de verdade, muitas páginas).
// Conteúdo escrito à mão (sem API/custo), identidade visual do produto. Saída em ./oferta-jiu-jitsu/.
//   node gerar-bumps.js
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const ASSETS = path.join(__dirname, 'assets');
const OUT = path.join(__dirname, 'oferta-jiu-jitsu');
fs.mkdirSync(OUT, { recursive: true });
const b64 = p => fs.existsSync(p) ? fs.readFileSync(p).toString('base64') : '';
const GAGALIN = b64(path.join(ASSETS, 'fonts/Gagalin-Regular.otf'));
const masc = chave => `data:image/png;base64,${b64(path.join(ASSETS, `mascotes/jj-${chave}-transp.png`))}`;
const esc = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

const AUTOR = 'Mestre Bruno';
const AZUL = '#2563eb', AZUL2 = '#60a5fa', NAVY = '#0a1224';
const FAIXAS = { branca:'#64748b', cinza:'#6b7280', amarela:'#ca8a04', laranja:'#ea580c', verde:'#16a34a' };

const CSS = `
@page{size:A4;margin:0} *{margin:0;padding:0;box-sizing:border-box}
@font-face{font-family:'Gagalin';src:url(data:font/otf;base64,${GAGALIN}) format('opentype')}
body{font-family:'Nunito','Segoe UI',Arial,sans-serif;color:#1a1a2e}
.page{width:210mm;height:297mm;position:relative;overflow:hidden;page-break-after:always;
  background:linear-gradient(165deg, ${AZUL}12 0%, #ffffff 50%, ${AZUL2}1c 100%)}
.page:last-child{page-break-after:auto}
.bar{position:absolute;left:0;top:0;bottom:0;width:8mm;background:${AZUL};display:flex;align-items:center;justify-content:center;z-index:2}
.bar span{writing-mode:vertical-rl;transform:rotate(180deg);color:#fff;font-family:'Gagalin';font-size:8.5pt;letter-spacing:2px;text-transform:uppercase;white-space:nowrap}
.body{padding:13mm 13mm 14mm 17mm;height:100%;display:flex;flex-direction:column;position:relative;z-index:1}
.fill{flex:1;display:flex;flex-direction:column;justify-content:space-between;min-height:0}
.foot{position:absolute;bottom:0;left:0;right:0;height:9mm;display:flex;align-items:center;justify-content:space-between;
  padding:0 13mm 0 17mm;background:${AZUL}0d;border-top:1.5px dashed ${AZUL}3a}
.foot .a{font-size:7pt;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:${AZUL}}
.foot .n{font-family:'Gagalin';font-size:8.5pt;color:#7c8aa5}
.g{font-family:'Gagalin';color:${AZUL}}
.h1{font-family:'Gagalin';color:${AZUL};font-size:22pt;line-height:1.05}
.h1s{font-size:10.5pt;font-weight:700;color:#566;margin-top:1.5mm;margin-bottom:4mm}
.card{border:2px solid ${AZUL}3a;border-radius:14px;background:#fff;padding:4mm 5mm;margin-bottom:2mm;
  box-shadow:0 2px 0 ${AZUL}20, 0 4px 9px rgba(20,40,80,.06)}
.card h3{font-family:'Gagalin';font-size:12.5pt;color:${AZUL};text-transform:uppercase;letter-spacing:.4px;margin-bottom:2.4mm}
.row{display:flex;gap:3mm;align-items:flex-start;padding:1.7mm 0;font-size:10.7pt;font-weight:600;line-height:1.45}
.box{flex:0 0 auto;width:4mm;height:4mm;border:2px solid ${AZUL};border-radius:4px;margin-top:.5mm}
.dot{flex:0 0 auto;color:${AZUL};font-weight:900;margin-top:.2mm}
.num{flex:0 0 auto;width:7mm;height:7mm;border-radius:50%;background:${AZUL};color:#fff;font-family:'Gagalin';font-size:10pt;display:flex;align-items:center;justify-content:center}
.dica{background:${AZUL};border-radius:13px;color:#fff;padding:4.5mm 5.5mm;font-size:10.5pt;font-weight:600;line-height:1.55}
.dica b{display:block;font-family:'Gagalin';font-size:10.5pt;letter-spacing:.4px;margin-bottom:1.3mm;color:#fff;text-transform:uppercase}
`;

function cover({ kicker, titulo, sub, mascote, paginas }) {
  return `<div class="page" style="background:radial-gradient(120% 80% at 50% 0%, #1e3a8a 0%, ${NAVY} 62%, #060a17 100%)">
    <div style="position:absolute;inset:0;background-image:radial-gradient(circle,#fff 1.5px,transparent 1.5px);background-size:46px 46px;opacity:.04"></div>
    <div style="height:100%;display:flex;flex-direction:column;align-items:center;justify-content:space-between;padding:28mm 18mm 18mm;position:relative;z-index:1;color:#fff;text-align:center">
      <div style="display:flex;flex-direction:column;align-items:center">
        <div style="font-family:'Gagalin';font-size:11pt;letter-spacing:3px;background:rgba(255,255,255,.12);border:1.5px solid rgba(255,255,255,.3);border-radius:30px;padding:3mm 8mm;text-transform:uppercase">🥋 ${esc(kicker)}</div>
        <div style="font-family:'Gagalin';font-size:34pt;line-height:1.05;margin:7mm 0 4mm;text-shadow:0 4px 16px rgba(0,0,0,.4)">${esc(titulo)}</div>
        <div style="font-size:13.5pt;font-weight:700;color:rgba(255,255,255,.85);max-width:150mm;line-height:1.4">${esc(sub)}</div>
        ${paginas?`<div style="margin-top:5mm;font-size:10pt;font-weight:800;letter-spacing:2px;color:${AZUL2};text-transform:uppercase">${esc(paginas)}</div>`:''}
      </div>
      <img src="${mascote}" style="width:54mm;height:54mm;object-fit:contain;filter:drop-shadow(0 8px 10px rgba(0,0,0,.45))"/>
      <div style="font-family:'Gagalin';font-size:14pt;letter-spacing:1px">por ${esc(AUTOR)}</div>
    </div>
  </div>`;
}

let _pg = 0, _label = '';
function content(inner) {
  _pg++;
  return `<div class="page"><div class="bar"><span>${esc(_label)}</span></div>
    <div class="body"><div class="fill">${inner}</div><div class="foot"><span class="a">${esc(AUTOR)}</span><span class="n">${_pg}</span></div></div></div>`;
}
const head = (t, s) => `<div style="flex:0 0 auto"><div class="h1">${esc(t)}</div>${s?`<div class="h1s">${esc(s)}</div>`:''}</div>`;
const card = (t, inner) => `<div class="card">${t?`<h3>${esc(t)}</h3>`:''}${inner}</div>`;
const chk = a => a.map(t=>`<div class="row"><div class="box"></div><div>${t}</div></div>`).join('');
const bull = a => a.map(t=>`<div class="row"><div class="dot">›</div><div>${t}</div></div>`).join('');
const numered = a => a.map((x,i)=>`<div class="card" style="display:flex;gap:3.5mm;align-items:flex-start;padding:3mm 4mm;margin-bottom:2.6mm"><div class="num">${i+1}</div><div style="flex:1"><div class="g" style="font-size:11pt;text-transform:uppercase;letter-spacing:.3px;margin-bottom:.8mm">${esc(x[0])}</div><div style="font-size:9.7pt;font-weight:600;line-height:1.45;color:#333">${x[1]}</div></div></div>`).join('');
const dica = t => `<div class="dica"><b>💡 Dica do Mestre</b>${t}</div>`;
const bloco = (tempo, t, d) => `<div class="card" style="display:flex;gap:4mm;align-items:flex-start;margin-bottom:3mm">
  <div style="flex:0 0 auto;background:${AZUL};color:#fff;border-radius:11px;padding:2.2mm 3mm;text-align:center;min-width:19mm">
    <div style="font-family:'Gagalin';font-size:12pt;line-height:1">${esc(tempo)}</div><div style="font-size:6.5pt;font-weight:800;letter-spacing:1px;opacity:.85">MIN</div></div>
  <div style="flex:1"><div class="g" style="font-size:11pt;text-transform:uppercase;margin-bottom:1mm">${esc(t)}</div><div style="font-size:9.7pt;font-weight:600;line-height:1.45;color:#333">${d}</div></div></div>`;

async function render(htmlPages, file) {
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body>${htmlPages.join('')}</body></html>`;
  const browser = await puppeteer.launch({ headless:'new', args:['--no-sandbox','--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width:794, height:1123 });
  await page.setContent(html, { waitUntil:'networkidle0', timeout:60000 });
  await new Promise(r=>setTimeout(r,300));
  const pdf = await page.pdf({ format:'A4', printBackground:true, margin:{top:0,right:0,bottom:0,left:0} });
  await browser.close();
  fs.writeFileSync(path.join(OUT, file), pdf);
  console.log('OK', file, Math.round(pdf.length/1024)+'KB');
}

// ════════════ BUMP 1 — KIT DO PROFESSOR ════════════
function bump1() {
  _pg = 0; _label = 'Kit do Professor';
  const pgs = [cover({ kicker:'Bônus 1', titulo:'Kit do Professor\nde Jiu-Jitsu Kids', sub:'Tudo o que você precisa pra conduzir uma turma de criança do começo ao fim, sem improviso.', mascote:masc('azul'), paginas:'Guia com 7 ferramentas' })];

  pgs.push(content(head('Checklist da Aula', 'Confira em toda aula — do tatame ao recado pros pais') +
    card('1. Antes da aula', chk(['Tatame limpo, encaixado e sem frestas','Lista de presença e contatos dos pais em mãos','Kimonos: faixa amarrada, unhas cortadas, sem brinco/relógio','Água disponível e ponto de pausa definido','1 objetivo claro pra aula de hoje (escrito)'])) +
    card('2. Aquecimento (5 a 8 min)', chk(['Começar com jogo de deslocamento (sem técnica ainda)','Incluir rolamento/queda de forma lúdica','Subir a intensidade aos poucos, observando quem cansa'])) +
    card('3. Durante a aula', chk(['UMA técnica por vez — demonstrar devagar, dos dois lados','Corrigir só 1 detalhe por criança','Alternar duplas pra todos sentirem que evoluem']))));

  pgs.push(content(head('Checklist da Aula (continuação)') +
    card('4. Disciplina e segurança', chk(['Regra de ouro: bater no tatame = solta na hora','Sem força excessiva — controle vale mais que vencer','Sinal claro de "começa" e "para" (apito ou palavra)','Nunca de costas pro grupo'])) +
    card('5. Fim da aula', chk(['Ritual de saída: alongamento + roda de conversa','Elogio individual (1 acerto de cada criança)','Recado pros pais (evolução, próximo objetivo)','Anotar faltas e o que treinar na próxima'])) +
    dica('Imprima este checklist e cole na parede. Em 2 semanas vira automático e a aula nunca mais começa bagunçada.')));

  pgs.push(content(head('A Rotina Ideal de Aula', 'O método de 5 blocos que prende a atenção da criança') +
    bloco('2–3','Ritual de Entrada','Cumprimento em fila, foco, e a regra/objetivo do dia em 1 frase. Marca o "agora é treino".') +
    bloco('5–8','Aquecimento com Propósito','Um jogo que JÁ treina um fundamento (base, queda, pegada) sem a criança perceber.') +
    bloco('8–12','Bloco Técnico Curto','UMA técnica. Demonstra em câmera lenta, dos dois lados, repete pouco. Menos é mais.') +
    bloco('8–10','Jogo Aplicado','Um jogo/competição leve que usa a técnica recém-aprendida. É aqui que ela "gruda".') +
    bloco('3–5','Ritual de Saída','Alongamento, roda de conversa e elogio individual. Termina sempre querendo voltar.') +
    dica('Criança não foca mais que 8–12 min seguidos — é fisiologia. Alternar energia (jogo) e calma (técnica) é o que segura a turma sem precisar gritar.')));

  const faixaRow = (chave, rotulo, txt) => `<div class="card" style="display:flex;gap:3.5mm;align-items:center;padding:2.6mm 4mm;margin-bottom:2.4mm;border-left:6px solid ${FAIXAS[chave]}">
    <div style="flex:0 0 auto;width:22mm;font-family:'Gagalin';font-size:10pt;color:${FAIXAS[chave]};text-transform:uppercase">${esc(rotulo)}</div>
    <div style="flex:1;font-size:9.7pt;font-weight:600;line-height:1.4;color:#333">${txt}</div></div>`;
  pgs.push(content(head('Progressão por Faixa', 'O que ensinar em cada nível (graduação infantil do jiu-jitsu)') +
    faixaRow('branca','Branca','Adaptação ao tatame, perder o medo de cair, quedas seguras (ukemi), base de luta e muita brincadeira.') +
    faixaRow('cinza','Cinza','Pegadas na gola e manga, guarda fechada, montada básica e como manter posição.') +
    faixaRow('amarela','Amarela','Fuga de quadril, recuperar a guarda, primeiras raspagens e a ideia de "não deixar passar".') +
    faixaRow('laranja','Laranja','Passagens de guarda simples, raspagens e transições entre posições com fluidez.') +
    faixaRow('verde','Verde','Finalizações adaptadas pra criança, combinações e mini-competições com regras.') +
    dica('Não tenha pressa de subir a faixa. Faixa nova só vale quando a criança domina o nível atual de olhos fechados.')));

  pgs.push(content(head('7 Erros Comuns', 'O que derruba o professor iniciante — e como corrigir') +
    numered([
      ['Ensinar muita coisa de uma vez','Escolha 1 técnica por aula. A criança aprende profundidade, não quantidade.'],
      ['Demonstrar rápido demais','Mostre em câmera lenta e dos dois lados. O que é óbvio pra você é novo pra ela.'],
      ['Corrigir tudo ao mesmo tempo','1 detalhe por criança. Corrigir demais paralisa e desanima.'],
      ['Aula sem jogo','Criança aprende brincando. Sem o jogo aplicado, a técnica não fixa.'],
      ['Deixar sempre o mesmo par','Troque as duplas. Mesmo par = o mais forte sempre ganha e o outro desiste.'],
      ['Esquecer os pais','Um recado de 10 segundos no fim da aula segura matrícula e gera indicação.'],
      ['Aula sem ritual','Começo e fim sempre iguais dão segurança. Criança gosta de previsibilidade.'],
    ])));

  const scriptCard = (sit, fala) => `<div class="card"><h3>${esc(sit)}</h3><div style="font-size:9.8pt;font-weight:600;line-height:1.5;color:#333;font-style:italic">"${fala}"</div></div>`;
  pgs.push(content(head('Falando com os Pais', 'Frases prontas pra cada situação — copie e adapte') +
    scriptCard('Elogiando a evolução', 'Hoje o(a) [nome] conseguiu [acerto específico]. Tá evoluindo bem no [fundamento] — daqui a pouco já passa pro próximo nível.') +
    scriptCard('Falando de um comportamento', 'Notei que o(a) [nome] [comportamento] hoje. Aqui eu vou [o que você fará]. Em casa, ajuda se vocês [sugestão simples].') +
    scriptCard('Recado de segurança (turma)', 'Pessoal, lembrete importante: kimono lavado e unhas cortadas. É segurança da turma inteira, não só do seu filho.') +
    scriptCard('Quando a criança quer desistir', 'É normal nessa fase. O(a) [nome] tá só no momento difícil do aprendizado. Me deem 3 aulas que a virada acontece — sempre acontece.')));

  const regra = (n, t) => `<div style="display:flex;gap:5mm;align-items:center;margin-bottom:5mm"><div style="flex:0 0 auto;width:13mm;height:13mm;border-radius:50%;background:#fff;color:${AZUL};font-family:'Gagalin';font-size:15pt;display:flex;align-items:center;justify-content:center">${n}</div><div style="font-family:'Gagalin';font-size:15pt;color:#fff;text-transform:uppercase;letter-spacing:.5px;line-height:1.1">${esc(t)}</div></div>`;
  pgs.push(`<div class="page" style="background:radial-gradient(120% 90% at 50% 0%, #1e3a8a 0%, ${NAVY} 70%)"><div class="bar"><span>${esc(_label)}</span></div>
    <div style="padding:20mm 16mm 16mm 22mm;height:100%;color:#fff;position:relative;z-index:1">
      <div style="font-family:'Gagalin';font-size:26pt;margin-bottom:3mm">Regras de Ouro</div>
      <div style="font-size:11pt;font-weight:700;color:${AZUL2};margin-bottom:9mm;text-transform:uppercase;letter-spacing:1px">Imprima e cole na parede da academia</div>
      ${regra(1,'Respeito sempre — ao mestre e aos colegas')}
      ${regra(2,'Bateu no tatame? Solta na hora')}
      ${regra(3,'Técnica vale mais que força')}
      ${regra(4,'Sem kimono e unha cortada, sem treino')}
      ${regra(5,'Perdeu? Aperta a mão e tenta de novo')}
      ${regra(6,'Tatame é lugar de aprender, não de machucar')}
    </div></div>`);
  _pg++;
  return pgs;
}

// ════════════ BUMP 2 — 4 PRIMEIRAS AULAS ════════════
function bump2() {
  _pg = 0; _label = '4 Primeiras Aulas';
  const pgs = [cover({ kicker:'Bônus 2', titulo:'O Plano das 4\nPrimeiras Aulas', sub:'Roteiro pronto, minuto a minuto, pra transformar criança que nunca treinou em aluno fiel.', mascote:masc('branca'), paginas:'4 aulas completas + bônus' })];

  pgs.push(content(head('Aula 1 — Adaptação', 'Objetivo: perder o medo e querer voltar (NÃO é ensinar técnica)') +
    bloco('0–5','Ritual de Entrada','Cumprimento, 2 regras (respeito e segurança) e "o que é jiu-jitsu" em 1 frase: defender-se com técnica, não força.') +
    bloco('5–12','Aquecimento Lúdico','Pega-pega no tatame e rolamento brincando. Meta: a criança se divertir e perder o medo de cair.') +
    bloco('12–22','Base + Queda Segura','Ensine SÓ a base (pés na largura dos ombros) e a queda amortecida. Devagar, repetindo pouco.') +
    bloco('22–32','Jogo: Rei do Tatame','Mantém a base sem ser desequilibrado. Vira competição divertida com o que acabou de aprender.') +
    bloco('32–40','Ritual de Saída','Alongamento, roda ("o que foi mais difícil?") e elogio individual.')));

  pgs.push(content(head('Aula 2 — Pegada e Guarda', 'Objetivo: as primeiras "ferramentas" do jiu-jitsu') +
    bloco('0–5','Entrada + Revisão','Relembra a base da aula 1 em 1 minuto. Reforça a regra de bater no tatame.') +
    bloco('5–12','Aquecimento de Pegada','Cabo de guerra com a faixa: treina a pegada firme que vão usar na guarda.') +
    bloco('12–24','Pegada na Gola + Guarda Fechada','Como segurar a gola e fechar a guarda (pernas na cintura). A primeira posição "de verdade".') +
    bloco('24–33','Jogo: Segura a Guarda','Um tenta manter a guarda fechada por 20s enquanto o outro tenta abrir. Trocam.') +
    bloco('33–40','Ritual de Saída','Alongamento, roda e elogio. Recado de evolução pros pais.')));

  pgs.push(content(head('Aula 3 — Montada e Fuga', 'Objetivo: posição de cima e como escapar dela') +
    bloco('0–5','Entrada + Revisão','Relembra pegada e guarda. Pergunta o que aprenderam (fixa a memória).') +
    bloco('5–12','Aquecimento de Quadril','Corrida do caranguejo e fuga de quadril no chão. Ativa o movimento-chave.') +
    bloco('12–24','Montada + Como Sair','Ensine a montada (sentar na barriga, base larga) e a fuga de quadril pra escapar.') +
    bloco('24–33','Jogo: Montou-Escapou','Um monta e segura; o outro tenta escapar em 15s. Pontos pra quem consegue. Trocam.') +
    bloco('33–40','Ritual de Saída','Alongamento, roda e elogio individual.')));

  pgs.push(content(head('Aula 4 — Primeira Mini-Luta', 'Objetivo: juntar tudo num "treininho" controlado e seguro') +
    bloco('0–5','Entrada + Combinado','Explica as regras da mini-luta: SÓ posição (sem finalização), bateu = para na hora.') +
    bloco('5–12','Aquecimento Completo','Mistura deslocamento, queda e pegada — revisa as 3 aulas brincando.') +
    bloco('12–20','Revisão Relâmpago','2 min em cada: base, guarda, montada. Confirma que todos lembram antes de lutar.') +
    bloco('20–33','Mini-Luta Posicional','Duplas equilibradas, rounds de 60s, só buscando posição. Você arbitra de perto.') +
    bloco('33–40','Premiação Simbólica','Todos ganham (esforço, evolução, fair-play). Roda final e foto da turma.')));

  const fala = (aula, t) => `<div class="card"><h3>${esc(aula)}</h3><div style="font-size:9.8pt;font-weight:600;line-height:1.5;color:#333;font-style:italic">"${t}"</div></div>`;
  pgs.push(content(head('O Que Falar pros Pais', 'Um recado de 10 segundos no fim de cada aula = matrícula que não cai') +
    fala('Fim da Aula 1', 'Hoje foi adaptação. O(a) [nome] já tá perdendo o medo de cair e se divertindo — é exatamente o que a gente quer no começo.') +
    fala('Fim da Aula 2', 'Hoje ele(a) aprendeu as primeiras posições de verdade: pegada e guarda. Já é jiu-jitsu pra valer.') +
    fala('Fim da Aula 3', 'Trabalhamos posição de cima e como escapar. O(a) [nome] tá pegando rápido a parte de movimento.') +
    fala('Fim da Aula 4', 'Hoje teve a primeira mini-luta controlada — e ele(a) mandou bem! Tá pronto pra seguir evoluindo com a turma.')));

  pgs.push(content(head('Checklist de Evolução', 'O que a criança deve dominar ao fim do 1º mês') +
    card('', chk(['Cai e rola sem medo (ukemi básico)','Fica em base firme sem desequilibrar fácil','Segura a gola e a manga com pegada firme','Fecha e mantém a guarda por alguns segundos','Senta na montada e sabe a ideia de escapar','Conhece e respeita a regra de bater no tatame','Segue o ritual de início e fim sem precisar de aviso'])) +
    dica('Se a criança marca 5 dos 7, está pronta pra seguir. Os 2 que faltam viram o foco do mês seguinte. Simples assim.')));

  _pg++;
  return pgs;
}

// ════════════ BUMP 3 — 30 BRINCADEIRAS ════════════
function bump3() {
  _pg = 0; _label = '30 Brincadeiras';
  const cats = [
    ['Deslocamento & Base', 'azul', [
      ['Pega-pega Agachado','Pega-pega normal, mas todos andam em base agachada. Treina deslocamento e base.'],
      ['Estátua do Lutador','Ao sinal, congelam numa base firme. Quem desequilibra, sai. Equilíbrio e postura.'],
      ['Corrida do Caranguejo','Andar de barriga pra cima de um lado ao outro. Ativa quadril e coordenação.'],
      ['Urso e Foca','Atravessam o tatame imitando urso (4 apoios) e foca (arrastando). Força e mobilidade.'],
      ['Ilha que Encolhe','Ficam dentro de uma área que diminui. Treina controle de espaço e leveza nos pés.'],
    ]],
    ['Quedas & Rolamento', 'cinza', [
      ['Rolamento Maluco','Rolamentos pra frente em sequência, devagar. Aquece e treina o ukemi.'],
      ['Saco de Batata','Caem amortecendo (batendo a mão no tatame) ao sinal. Treina a queda segura.'],
      ['Sino','Sentados, rolam pra trás e voltam à base. Trabalha coluna e retorno rápido.'],
      ['Tartaruga que Rola','De quatro apoios, fazem rolamento e voltam. Liga queda com posição.'],
      ['Cambalhota Guiada','Rolamento sobre o ombro com você segurando. Confiança pra cair certo.'],
    ]],
    ['Pegada & Força', 'amarela', [
      ['Cabo de Guerra com Faixa','Em duplas, puxam a faixa pra sua zona. Pegada firme e tração.'],
      ['Rouba-rabo','Faixa na cintura como rabo; pegam o do colega sem perder o seu. Agilidade e pegada.'],
      ['Segura o Tesouro','Um segura um objeto, o outro tenta tirar em 10s. Força de mão e grip.'],
      ['Braço de Ferro Deitado','Deitados, disputam o braço de ferro. Diverte e fortalece punho/antebraço.'],
      ['Sobe na Corda (faixa)','Puxam-se pela faixa presa em algo firme. Pegada e força de costas.'],
    ]],
    ['Reação & Atenção', 'laranja', [
      ['Espelho do Mestre','Imitam seus movimentos o mais rápido possível. Atenção e tempo de reação.'],
      ['Vivo ou Morto do Jiu','"Vivo" = base em pé; "morto" = guarda deitada. Escuta e transição.'],
      ['Sinal de Trânsito','Verde corre, amarelo anda em base, vermelho congela. Controle e foco.'],
      ['Toca e Foge','Tocam um ponto e voltam à base antes do sinal. Explosão e atenção.'],
      ['Número-Comando','Cada número = um movimento (1 base, 2 queda...). Memória e reação.'],
    ]],
    ['Controle & Espaço', 'verde', [
      ['Rei do Tatame','Mantêm a base sem ser empurrados pra fora. Controle e equilíbrio.'],
      ['Sumô das Linhas','Numa área pequena, tentam tirar o colega da linha. Base e empurrão controlado.'],
      ['Empurra Sentado','Sentados de frente, empurram as mãos pra desequilibrar. Tronco e base.'],
      ['Defende a Base','Um tenta derrubar (leve) e o outro mantém a base por 15s. Resistência postural.'],
      ['Pega o Cone','Em base, disputam quem pega o cone do meio primeiro. Reação e deslocamento.'],
    ]],
    ['Pura Diversão', 'azul', [
      ['Sapinho Saltador','Agachados, saltam como sapo de um ponto a outro. Explosão de perna.'],
      ['Dança Congela','Dançam e congelam quando a música para. Solta a energia e treina parar no comando.'],
      ['Guerra de Almofada','Com almofadas macias, "duelo" sem machucar. Diverte e gasta energia.'],
      ['Pega-bandeira do Dojo','Dois times tentam pegar a faixa do campo adversário. Estratégia e velocidade.'],
      ['Corrida de Três Pernas','Em duplas com as pernas amarradas (faixa), atravessam o tatame. Cooperação e risada.'],
    ]],
  ];
  const pgs = [cover({ kicker:'Bônus 3', titulo:'30 Brincadeiras\nde Aquecimento', sub:'Pra turma chegar ligada e já entrar treinando jiu-jitsu — sem aquecimento chato.', mascote:masc('verde'), paginas:'30 jogos em 6 categorias' })];
  for (const [titulo, cor, jogos] of cats) {
    const inner = head(titulo, 'Aquecimento que já treina um fundamento do jiu-jitsu') +
      jogos.map((j,i)=>`<div class="card" style="display:flex;gap:3.5mm;align-items:flex-start;padding:2.8mm 4mm;margin-bottom:2.6mm;border-left:6px solid ${FAIXAS[cor]||AZUL}">
        <div style="flex:0 0 auto;width:7mm;height:7mm;border-radius:50%;background:${FAIXAS[cor]||AZUL};color:#fff;font-family:'Gagalin';font-size:10pt;display:flex;align-items:center;justify-content:center">${i+1}</div>
        <div style="flex:1"><div class="g" style="font-size:11pt;text-transform:uppercase;letter-spacing:.3px;margin-bottom:.6mm">${esc(j[0])}</div><div style="font-size:9.6pt;font-weight:600;line-height:1.4;color:#333">${esc(j[1])}</div></div></div>`).join('');
    pgs.push(content(inner));
  }
  return pgs;
}

(async () => {
  console.log('>>> Gerando os 3 order bumps ROBUSTOS de jiu-jitsu (grátis)...');
  await render(bump1(), 'bump1-kit-do-professor.pdf');
  await render(bump2(), 'bump2-4-primeiras-aulas.pdf');
  await render(bump3(), 'bump3-30-brincadeiras.pdf');
  console.log('\nPRONTO! Pasta:', OUT);
  process.exit(0);
})().catch(e => { console.error('ERRO:', e.message); process.exit(1); });
