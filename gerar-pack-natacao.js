// PACK principal de NATAÇÃO — 18 treinos prontos (6 por nível × 3 níveis), no nível do pack-jiujitsu-20.
// Conteúdo escrito à mão (sem API/custo). Mesma "cara" da ficha de jiu-jitsu. Mascote 3D HD por nível.
//   node gerar-pack-natacao.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const puppeteer = require('puppeteer');
const { PDFDocument } = require('pdf-lib');

const OUT = path.join(__dirname, 'oferta-natacao');
fs.mkdirSync(OUT, { recursive: true });
const TMP = path.join(OUT, '.tmp'); fs.mkdirSync(TMP, { recursive: true });

const AUTOR = process.env.NAT_AUTOR || 'Equipe Treinos de Natação';
const esc = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const b64 = p => fs.existsSync(p) ? fs.readFileSync(p).toString('base64') : null;
const GAGALIN = b64(path.join(__dirname,'assets/fonts/Gagalin-Regular.otf'));
const mascFile = chave => path.join(__dirname, `assets/natacao/nat-${chave}-transp.png`);
const masc = chave => { const p = mascFile(chave); const d = b64(p); return d ? `data:image/png;base64,${d}` : null; };

// ───────────────────── níveis (cor por nível, no lugar de faixa) ─────────────────────
const NIVEIS = {
  iniciante:     { rotulo:'Iniciante',     p:'#06b6d4', s:'#67e8f9' }, // ciano claro
  intermediario: { rotulo:'Intermediário', p:'#2563eb', s:'#60a5fa' }, // azul
  avancado:      { rotulo:'Avançado',      p:'#1e3a8a', s:'#3b82f6' }, // azul-marinho
};

// ───────────────────── conteúdo (18 treinos, escrito à mão) ─────────────────────
const TREINOS = [
  // ════════ INICIANTE ════════
  { nivel:'iniciante', titulo:'Perdendo o Medo da Água', subtitulo:'Adaptação ao meio líquido, da borda ao primeiro mergulho', distancia:'~150 m', duracao:'30 min',
    objetivo:'O aluno cria confiança no meio líquido — entra, molha o rosto e descobre que a água sustenta o corpo. Sem conforto não existe aprendizado: é a base de tudo.',
    equipamentos:['Parte rasa / borda','Halteres de espuma (opc.)','Brinquedo afundável'],
    estrutura:[
      {fase:'Aquecimento (5 min)', set:'Entrar pela escada segurando na borda. Caminhar de um lado ao outro na parte rasa, água no peito, balançando os braços dentro d’água.'},
      {fase:'Familiarização (10 min)', set:'Molhar nuca, rosto e cabeça com as mãos. Soprar a água como quem apaga vela. Abaixar até o queixo encostar, depois até a boca.'},
      {fase:'Imersão (8 min)', set:'Em 5 tentativas, mergulhar até os olhos e voltar. Pegar um brinquedo do fundo raso. Comemorar cada tentativa.'},
      {fase:'Volta à calma (5 min)', set:'Flutuar segurando na borda, pernas relaxadas, respiração calma. Sair pela escada.'},
    ],
    variacoes:[
      {contexto:'Mais fácil', descricao:'Aluno muito inseguro fica na escada e só molha o rosto com as mãos nas primeiras aulas.'},
      {contexto:'Mais difícil', descricao:'Abrir os olhos debaixo d’água (com óculos) e contar os dedos da própria mão.'},
      {contexto:'Em grupo', descricao:'Roda de mãos dadas afundando juntos no "3, 2, 1, já" — o coletivo tira o medo.'},
    ],
    dica:'O que funciona pra mim é nunca empurrar a cabeça da criança pra dentro da água. Eu deixo ELA decidir quando afunda — no dia que faz sozinha, o medo vai embora pra sempre.',
    observar:['Se sopra na água ou prende a respiração e enrijece','Se relaxa os ombros ou levanta tudo de tensão','Se busca a borda com pânico ou já solta uma mão'] },

  { nivel:'iniciante', titulo:'Bolhas e Borbulhas', subtitulo:'Controle da respiração — expirar dentro da água', distancia:'~200 m', duracao:'30 min',
    objetivo:'A criança aprende o segredo que separa quem nada de quem se afoga: soltar o ar DEBAIXO da água e inspirar fora. A respiração é o motor de toda a natação.',
    equipamentos:['Óculos','Bola de pingue-pongue','Canudo (opc.)'],
    estrutura:[
      {fase:'Aquecimento (5 min)', set:'Caminhar na parte rasa soprando a água à frente, fazendo "vento" na superfície.'},
      {fase:'Bolhas na superfície (8 min)', set:'Boca na linha d’água, soprar bolhas por 3 segundos. Ritmo: inspira fora, sopra dentro.'},
      {fase:'Bolhas afundando (10 min)', set:'Afundar até os olhos soltando o ar pelo nariz e boca — 10 repetições. O ar saindo impede a água de entrar.'},
      {fase:'Jogo do barquinho (5 min)', set:'Soprar uma bola de pingue-pongue de um lado ao outro da raia, só com o sopro.'},
    ],
    variacoes:[
      {contexto:'Mais fácil', descricao:'Soprar bolhas só com a boca na superfície, sem afundar, até pegar o ritmo.'},
      {contexto:'Mais difícil', descricao:'Afundar e soltar o ar contando até 5 antes de subir — fôlego controlado.'},
      {contexto:'Em grupo', descricao:'Concurso de "quem faz mais bolhas" numa só imersão. Vira brincadeira séria.'},
    ],
    dica:'Eu costumo dizer pra criança "fala AAAH debaixo d’água" — quando ela vocaliza, solta o ar sem perceber e para de engasgar. Funciona melhor que mandar "assoprar".',
    observar:['Se solta o ar embaixo ou sobe segurando o fôlego (erro nº 1)','Se a inspiração é rápida, pela boca','Se não esfrega os olhos nem entra em pânico ao molhar o rosto'] },

  { nivel:'iniciante', titulo:'Estrela e Foguete', subtitulo:'Flutuação ventral e dorsal + o primeiro deslize', distancia:'~200 m', duracao:'35 min',
    objetivo:'O aluno descobre que a água o segura. Flutuar em estrela (relaxado) e deslizar como foguete (alinhado) é a base postural de TODOS os nados.',
    equipamentos:['Óculos','Parede da piscina','Prancha (opc.)'],
    estrutura:[
      {fase:'Aquecimento (5 min)', set:'Bolhas e imersões pra relembrar a respiração.'},
      {fase:'Estrela ventral (8 min)', set:'Rosto na água, braços e pernas abertos, flutuar soltando o ar devagar. Amparar a barriga nas primeiras.'},
      {fase:'Estrela dorsal (8 min)', set:'De costas, orelhas na água, barriga pra cima, olhar pro teto. O quadril sobe quando relaxa.'},
      {fase:'Foguete / deslize (8 min)', set:'Pés na parede, braços esticados colados nas orelhas, empurrar e deslizar reto até parar. Corpo de flecha.'},
    ],
    variacoes:[
      {contexto:'Mais fácil', descricao:'Flutuar segurando uma prancha à frente até confiar no equilíbrio.'},
      {contexto:'Mais difícil', descricao:'Deslize ventral mais longo, contando quantos metros desliza sem bater perna.'},
      {contexto:'Em grupo', descricao:'"Estrela coletiva" de mãos dadas em roda, todos boiando juntos.'},
    ],
    dica:'Eu sempre falo: "a água é uma cama, deita nela". O erro é flutuar com força — quanto mais a criança relaxa e enche o peito de ar, mais ela sobe sozinha.',
    observar:['Se o quadril afunda (tensão ou cabeça muito alta)','Se mantém os braços colados nas orelhas no deslize','Se relaxa de costas sem pânico'] },

  { nivel:'iniciante', titulo:'A Primeira Batida de Pernas', subtitulo:'Pernada de crawl com prancha — o motor do nado', distancia:'~300 m', duracao:'35 min',
    objetivo:'Construir a pernada de crawl: batida contínua a partir do quadril, joelho quase reto, pé solto (chinelo). É a propulsão que sustenta o corpo na horizontal.',
    equipamentos:['Prancha (kickboard)','Óculos'],
    estrutura:[
      {fase:'Aquecimento (5 min)', set:'Deslizes de foguete pra alinhar o corpo.'},
      {fase:'Pernada na borda (5 min)', set:'Sentado na borda, bater as pernas na água — movimento curto e rápido do quadril, pé esticado.'},
      {fase:'Pernada com prancha (12 min)', set:'6 a 8 idas de meia-piscina segurando a prancha, rosto fora, batendo pernas. Respingos pequenos, não pedalada.'},
      {fase:'Pernada com bolhas (6 min)', set:'Mesma coisa, rosto na água soprando bolhas e levantando pra respirar.'},
    ],
    variacoes:[
      {contexto:'Mais fácil', descricao:'Segurar a prancha com os braços esticados e bater devagar, só pra manter a horizontal.'},
      {contexto:'Mais difícil', descricao:'Pernada sem prancha, braços esticados à frente (streamline), respirando de lado.'},
      {contexto:'Em grupo', descricao:'"Corrida das pranchas" de meia-piscina — quem chega primeiro só com a pernada.'},
    ],
    dica:'O que funciona pra mim é pôr a mão na água atrás dos pés da criança: ela tem que "molhar minha mão" com o respingo. Isso corrige na hora o joelho dobrado demais.',
    observar:['Se a batida sai do quadril ou só do joelho (pedalada)','Se o pé está solto/esticado ou rígido','Se os respingos são pequenos e contínuos'] },

  { nivel:'iniciante', titulo:'Costas sem Afundar', subtitulo:'Pernada e flutuação de costas — respirar fica fácil', distancia:'~300 m', duracao:'35 min',
    objetivo:'No nado costas o rosto fica fora d’água o tempo todo — é o mais confortável pra respirar. O aluno mantém o quadril alto e a batida contínua de costas.',
    equipamentos:['Prancha (sobre a barriga, opc.)','Óculos'],
    estrutura:[
      {fase:'Aquecimento (5 min)', set:'Estrela dorsal pra reencontrar o equilíbrio de costas.'},
      {fase:'Pernada com apoio (8 min)', set:'De costas, prancha sobre a barriga abraçada, bater pernas atravessando a piscina. Quadril pra cima.'},
      {fase:'Pernada braços ao lado (8 min)', set:'Sem prancha, braços colados ao corpo, olhar pro teto, batida contínua. Joelhos não saem da água.'},
      {fase:'Deslize dorsal (6 min)', set:'Empurrar a parede de costas, braços esticados atrás (streamline dorsal) e deslizar.'},
    ],
    variacoes:[
      {contexto:'Mais fácil', descricao:'Manter a prancha na barriga o tempo todo até confiar no equilíbrio dorsal.'},
      {contexto:'Mais difícil', descricao:'Um braço esticado atrás da cabeça, trocando a cada 6 batidas.'},
      {contexto:'Em grupo', descricao:'Atravessar de costas em fila, "trenzinho", sem encostar nas linhas.'},
    ],
    dica:'Eu costumo apoiar a cabeça do aluno com 2 dedos nas primeiras idas. O medo de costas é não ver pra onde vai — quando confia que a água segura, larga sozinho.',
    observar:['Se o quadril afunda (cabeça muito pra trás ou tensão)','Se os joelhos furam a superfície (pedalada)','Se mantém o olhar pro teto sem levantar a cabeça'] },

  { nivel:'iniciante', titulo:'Meus Primeiros 25 Metros', subtitulo:'Juntando braço, perna e respiração no crawl', distancia:'~250 m', duracao:'40 min',
    objetivo:'A grande conquista do iniciante: coordenar braçada, pernada e respiração lateral pra atravessar a piscina de crawl sem parar. Tudo que treinou vira nado.',
    equipamentos:['Óculos','Prancha (para revisão)'],
    estrutura:[
      {fase:'Aquecimento (6 min)', set:'Pernada com prancha + bolhas, pra ligar respiração e propulsão.'},
      {fase:'Braçada parado (6 min)', set:'Em pé na parte rasa, simular a braçada: mão entra esticada, "puxa a água" até a coxa, recupera por fora. Alternar.'},
      {fase:'Crawl com respiração lateral (10 min)', set:'Nadar curto (10–15 m), virando o rosto pra inspirar quando o braço recupera, soprando bolhas com o rosto na água.'},
      {fase:'Os 25 metros (8 min)', set:'Tentar a piscina inteira sem parar, ritmo calmo. Pode respirar a cada braçada. Comemorar a travessia!'},
    ],
    variacoes:[
      {contexto:'Mais fácil', descricao:'Atravessar com uma prancha à frente, só respirando de lado e batendo perna.'},
      {contexto:'Mais difícil', descricao:'Fazer os 25 m com respiração a cada 3 braçadas (bilateral inicial).'},
      {contexto:'Em grupo', descricao:'Cada um faz sua travessia enquanto a turma "torce" — a plateia motiva.'},
    ],
    dica:'O que funciona pra mim é não cobrar técnica perfeita nos primeiros 25 m. Deixo bagunçado de propósito: o que importa é a criança descobrir que CONSEGUE. A técnica eu lapido depois.',
    observar:['Se respira girando o corpo, sem parar o nado pra levantar a cabeça à frente','Se a braçada empurra água até a coxa','Se mantém a pernada ligada enquanto braceja'] },

  { nivel:'iniciante', titulo:'Mergulho do Patinho', subtitulo:'Imersão completa e pegar objetos no fundo', distancia:'~200 m', duracao:'35 min',
    objetivo:'O aluno vence o último resquício de medo: afundar o corpo inteiro, abrir os olhos e pegar objetos no fundo raso. Imersão tranquila é pré-requisito pra tudo que vem depois.',
    equipamentos:['Óculos','Argolas / brinquedos afundáveis'],
    estrutura:[
      {fase:'Aquecimento (5 min)', set:'Bolhas e imersão até os olhos pra relembrar a respiração.'},
      {fase:'Patinho que mergulha (10 min)', set:'Em pé, afundar até sentar no fundo raso soltando o ar, e voltar. 8 a 10 vezes.'},
      {fase:'Caça ao tesouro (12 min)', set:'Pegar argolas do fundo raso, uma por vez, abrindo os olhos com óculos. Aumentar a profundidade aos poucos.'},
      {fase:'Volta à calma (5 min)', set:'Flutuação em estrela respirando calmo.'},
    ],
    variacoes:[
      {contexto:'Mais fácil', descricao:'Pegar objeto na altura da cintura, sem submergir a cabeça toda.'},
      {contexto:'Mais difícil', descricao:'Pegar 2 argolas numa só descida, contando o tempo embaixo.'},
      {contexto:'Em grupo', descricao:'"Caça coletiva" — a turma junta recolhe todas as argolas do fundo.'},
    ],
    dica:'Eu espalho argolas coloridas e deixo a criança ESCOLHER a cor que vai buscar. Quando ela mergulha por vontade própria atrás da favorita, esquece que tinha medo de afundar.',
    observar:['Se solta o ar ao afundar (não prende o fôlego)','Se abre os olhos embaixo, sem apertar a cara','Se desce relaxado ou ainda se empurra com pânico'] },

  { nivel:'iniciante', titulo:'Deslize com Pernada', subtitulo:'Juntando o foguete com o motor das pernas', distancia:'~300 m', duracao:'35 min',
    objetivo:'Conectar o deslize alinhado (streamline) com a pernada de crawl: empurra a parede em flecha e SÓ DEPOIS começa a bater perna, indo mais longe com menos esforço. É o esqueleto do nado.',
    equipamentos:['Óculos','Prancha (revisão)'],
    estrutura:[
      {fase:'Aquecimento (6 min)', set:'Deslizes de foguete contando até onde chega só com o impulso.'},
      {fase:'Deslize + pernada (12 min)', set:'Empurra a parede em streamline, desliza 2 segundos e começa a pernada com os braços esticados nas orelhas. Atravessa meia-piscina.'},
      {fase:'Pernada de lado (8 min)', set:'Um braço esticado à frente, outro na coxa, rolando pra respirar. Prepara a respiração lateral.'},
      {fase:'Soltura (5 min)', set:'Flutuação.'},
    ],
    variacoes:[
      {contexto:'Mais fácil', descricao:'Segurar a prancha esticada à frente e só ligar a pernada após o deslize.'},
      {contexto:'Mais difícil', descricao:'Streamline + pernada submersa por 5 metros antes de emergir.'},
      {contexto:'Em grupo', descricao:'"Quem desliza mais longe" antes de bater a 1ª perna.'},
    ],
    dica:'O que funciona pra mim é a regra do "conta até dois antes de bater perna". A criança sempre quer pedalar na hora — quando aprende a deslizar primeiro, descobre que a água é rápida de graça.',
    observar:['Se mantém os braços colados nas orelhas (cabeça escondida entre eles)','Se a pernada só começa depois do deslize','Se o corpo fica reto, sem zigue-zague'] },

  { nivel:'iniciante', titulo:'Os Primeiros Braços de Crawl', subtitulo:'A braçada de crawl, um braço de cada vez', distancia:'~300 m', duracao:'40 min',
    objetivo:'Construir a braçada de crawl isolada: entrada esticada, puxada até a coxa e recuperação por fora, usando a prancha como apoio. Sem pressa de juntar tudo — primeiro o braço aprende sozinho.',
    equipamentos:['Prancha','Óculos'],
    estrutura:[
      {fase:'Aquecimento (6 min)', set:'Deslize + pernada pra alinhar o corpo.'},
      {fase:'Braço único com prancha (12 min)', set:'Uma mão na prancha à frente, o outro braço faz a braçada completa (entra-puxa-recupera). Trocar de braço a cada meia-piscina.'},
      {fase:'Coordenação leve (10 min)', set:'Solta a prancha e alterna os braços devagar, pernada ligada, sem cobrar respiração ainda.'},
      {fase:'Soltura (6 min)', set:'Flutuação e deslizes.'},
    ],
    variacoes:[
      {contexto:'Mais fácil', descricao:'Fazer o gesto da braçada em pé, na parte rasa, antes de ir pra prancha.'},
      {contexto:'Mais difícil', descricao:'Soltar a prancha e fazer "catch-up" (uma mão espera a outra à frente).'},
      {contexto:'Em grupo', descricao:'De frente um pro outro, imitando a braçada como num espelho.'},
    ],
    dica:'Eu sempre faço o aluno "arranhar a coxa" no fim de cada braçada. Esse detalhe garante que ele empurrou a água até o fim — quase todo iniciante para a braçada no meio e perde metade da força.',
    observar:['Se a mão entra esticada, sem bater na água com a palma','Se puxa a água até a coxa (não para no meio)','Se a pernada continua ligada enquanto o braço trabalha'] },

  { nivel:'iniciante', titulo:'Flutuar, Virar e Respirar', subtitulo:'Rolar de bruços pra costas — a virada que salva', distancia:'~200 m', duracao:'35 min',
    objetivo:'Habilidade de segurança essencial: estar de bruços, rolar pra posição de costas, respirar tranquilo e voltar. O aluno que sabe virar pra respirar nunca entra em pânico — pode descansar na água.',
    equipamentos:['Óculos'],
    estrutura:[
      {fase:'Aquecimento (5 min)', set:'Estrela ventral e dorsal pra relembrar as duas flutuações.'},
      {fase:'A virada (10 min)', set:'De bruços flutuando, rolar pra ficar de costas (barriga pra cima), respirar 3 vezes calmo e rolar de volta. Os dois lados.'},
      {fase:'Pernada + virada (10 min)', set:'Nadar pernada de bruços alguns metros, rolar pra costas pra respirar e seguir. Mostra que dá pra "descansar" no meio do nado.'},
      {fase:'Soltura (5 min)', set:'Boiar de costas respirando fundo.'},
    ],
    variacoes:[
      {contexto:'Mais fácil', descricao:'Fazer a virada com apoio do professor na lombar nas primeiras vezes.'},
      {contexto:'Mais difícil', descricao:'Nadar 15 m alternando 3 batidas de bruços e virada pra costas pra respirar.'},
      {contexto:'Em grupo', descricao:'Em fila, todos rolam pra costas ao mesmo comando — vira coreografia.'},
    ],
    dica:'O que funciona pra mim é ensinar essa virada cedo, antes mesmo do crawl completo. É o que faz a criança (e os pais) confiarem: se cansar no meio, ela sabe virar, boiar e respirar. Segurança vem antes de velocidade.',
    observar:['Se rola o corpo todo (não só a cabeça) pra ficar de costas','Se respira calmo de costas, sem afobar','Se consegue voltar pra posição ventral sozinho'] },

  // ════════ INTERMEDIÁRIO ════════
  { nivel:'intermediario', titulo:'Respiração dos Dois Lados', subtitulo:'Respiração bilateral no crawl — equilíbrio e fôlego', distancia:'700 m', duracao:'45 min',
    objetivo:'Sair de respirar só de um lado pra respirar dos dois (a cada 3 braçadas). Corrige o nado torto, equilibra a musculatura e dobra as opções em prova.',
    equipamentos:['Óculos','Prancha','Pull buoy (opc.)'],
    estrutura:[
      {fase:'Aquecimento (200 m)', set:'100 m crawl leve + 100 m pernada com prancha.'},
      {fase:'Educativo (8×25 m)', set:'25 m respirando a cada 3 braçadas (bilateral), 25 m só do lado "fraco". Soprar todo o ar antes de virar.'},
      {fase:'Principal (6×50 m)', set:'Crawl bilateral (respiração 3-3) em ritmo confortável, descanso 20 s. Manter o padrão mesmo cansando.'},
      {fase:'Soltura (100 m)', set:'Costas leve, respirando solto.'},
    ],
    variacoes:[
      {contexto:'Mais fácil', descricao:'Respirar a cada 2 braçadas, alternando o lado a cada 25 m.'},
      {contexto:'Mais difícil', descricao:'Padrão 3-5-3-5 (alongar a apneia) em alguns 25 m.'},
      {contexto:'Em grupo', descricao:'Na mesma raia, sair de 5 em 5 segundos, mantendo distância sem encostar.'},
    ],
    dica:'Eu costumo dizer que o lado "ruim" melhora em 2 semanas se a pessoa nadar mais nele do que no bom. O cérebro só precisa de repetição — insista no lado fraco.',
    observar:['Se sopra todo o ar antes de virar pra inspirar','Se gira o corpo (rolagem) em vez de só virar a cabeça','Se mantém uma mão esticada à frente na hora de respirar'] },

  { nivel:'intermediario', titulo:'Cotovelo Alto, Braçada Longa', subtitulo:'Técnica de braçada de crawl com rolagem de corpo', distancia:'750 m', duracao:'45 min',
    objetivo:'Transformar braçada curta e fraca em braçada longa e eficiente: entrada esticada, pegada de cotovelo alto, empurrão até a coxa e rolagem do corpo. Menos braçadas, mais distância.',
    equipamentos:['Óculos','Pull buoy','Palmar (opc.)'],
    estrutura:[
      {fase:'Aquecimento (200 m)', set:'150 m crawl leve + 50 m deslizes contando braçadas por piscina.'},
      {fase:'Educativos (8×50 m)', set:'Alternar: "ponta de dedo arrastando" na recuperação, "catch-up" (uma mão espera a outra à frente) e pegada de cotovelo alto.'},
      {fase:'Principal (5×100 m)', set:'Crawl tentando reduzir o nº de braçadas por piscina (nadar "longo"), descanso 25 s.'},
      {fase:'Soltura (100 m)', set:'Nado à escolha, relaxado.'},
    ],
    variacoes:[
      {contexto:'Mais fácil', descricao:'Educativos com pull buoy (tira a perna da conta, foca só no braço).'},
      {contexto:'Mais difícil', descricao:'Palmares nos 100 m pra sentir a pegada e exigir mais do braço.'},
      {contexto:'Em grupo', descricao:'Desafio "menor número de braçadas" — cada um tenta bater o próprio recorde.'},
    ],
    dica:'O que funciona pra mim é o aluno contar as braçadas de uma piscina e tentar tirar UMA na próxima. Quando ele "economiza" braçada, alonga e melhora a técnica sozinho — sem teoria.',
    observar:['Se a mão entra esticada à frente, sem cruzar a linha do centro','Se o cotovelo fica alto na puxada, mão apontando pro fundo','Se o corpo rola junto com o braço'] },

  { nivel:'intermediario', titulo:'A Virada que Não Para o Treino', subtitulo:'Virada de crawl — chegou na parede, voltou nadando', distancia:'600 m', duracao:'45 min',
    objetivo:'Aprender a virada/rolamento de crawl pra não parar a cada piscina: vira na parede, empurra em streamline e segue. É o que separa o nado de treino do nado de lazer.',
    equipamentos:['Óculos','Parede com marca de fundo'],
    estrutura:[
      {fase:'Aquecimento (200 m)', set:'Crawl + pernada, terminando cada piscina com um deslize forte na parede.'},
      {fase:'Cambalhota solta (10 min)', set:'No meio da piscina, cambalhotas pra frente soltando ar pelo nariz, sem encostar na parede. Achar o eixo.'},
      {fase:'Virada na parede (10×)', set:'Nadar 4–5 braçadas, cambalhota encostando os pés na parede, empurrar e girar pra posição ventral, deslizando em streamline.'},
      {fase:'Principal (4×50 m)', set:'Crawl com virada real em cada parede, sem parar.'},
    ],
    variacoes:[
      {contexto:'Mais fácil', descricao:'Virada "aberta" (toca com a mão, gira e empurra) antes da cambalhota.'},
      {contexto:'Mais difícil', descricao:'Cronometrar 4×50 m e tentar manter o tempo — virada rápida economiza segundos.'},
      {contexto:'Em grupo', descricao:'Cada um mostra a virada e a turma dá nota de 1 a 5 pro deslize.'},
    ],
    dica:'Eu ensino a cambalhota LONGE da parede primeiro. Quando o aluno domina o giro soltando ar pelo nariz, aí levo pra parede. Junto demais cedo, ele engole água e cria trauma.',
    observar:['Se solta ar pelo nariz na cambalhota (não engole água)','Se os pés batem firmes na parede','Se sai em streamline (flecha), sem desmontar o corpo'] },

  { nivel:'intermediario', titulo:'Peito: Puxa, Respira, Desliza', subtitulo:'Coordenação e tempo do nado peito', distancia:'650 m', duracao:'45 min',
    objetivo:'Domar o nado mais técnico: o tempo certo é "puxa o braço → respira → pernada de rã → desliza". Errar a ordem trava o nado. Aqui o aluno acerta o ritmo.',
    equipamentos:['Óculos','Prancha (para a pernada)'],
    estrutura:[
      {fase:'Aquecimento (200 m)', set:'Crawl e costas leve.'},
      {fase:'Pernada com prancha (8×25 m)', set:'Pernada de rã: calcanhar no bumbum, abre os PÉS pra fora (não os joelhos), chuta em círculo e junta. Desliza entre cada.'},
      {fase:'Braçada + tempo (8 min)', set:'Em pé, treinar a sequência "puxa-respira-chuta-desliza". Mãos puxam pra fora e pra dentro, sobe pra respirar, dispara à frente.'},
      {fase:'Principal (6×50 m)', set:'Peito completo, 1 deslize entre cada braçada (não emendar). Descanso 25 s.'},
    ],
    variacoes:[
      {contexto:'Mais fácil', descricao:'Separar: uma piscina só de pernada, uma só de braçada, depois junta.'},
      {contexto:'Mais difícil', descricao:'1 braçada pra 2 pernadas, alongando o deslize ("peito de prova longa").'},
      {contexto:'Em grupo', descricao:'Em fila com 1 segundo de deslize obrigatório — quem emenda braçada "leva falta".'},
    ],
    dica:'O que funciona pra mim é o mantra em voz alta na borda: "PUXA, RESPIRA, CHUTA, DESLIZA". O peito é o único nado em que a pressa atrapalha — quem desliza nada mais rápido com menos esforço.',
    observar:['Se a pernada é de rã (pés pra fora), não tesoura/bicicleta','Se há deslize de verdade entre as braçadas','Se a cabeça sobe pra respirar e volta a olhar pra baixo no disparo'] },

  { nivel:'intermediario', titulo:'Costas Reta como uma Régua', subtitulo:'Técnica e alinhamento do nado costas', distancia:'750 m', duracao:'45 min',
    objetivo:'Refinar o costas: corpo alinhado, rolagem de ombros, braço entrando esticado (dedo mínimo primeiro) e quadril alto. Sem isso o aluno "senta" na água e zigue-zagueia.',
    equipamentos:['Óculos','Pull buoy (opc.)','Objeto p/ equilibrar na testa (opc.)'],
    estrutura:[
      {fase:'Aquecimento (200 m)', set:'Pernada dorsal + costas leve.'},
      {fase:'Educativos (8×50 m)', set:'"Braço único" (um esticado, outro nada), "pausa na coxa" (para a mão e rola antes de recuperar), pernada dorsal com um braço esticado.'},
      {fase:'Equilíbrio (6 min)', set:'Pernada dorsal com um copinho na testa sem deixar cair — força cabeça parada e quadril alto.'},
      {fase:'Principal (5×100 m)', set:'Costas contínuo: entrar a mão esticada atrás da cabeça e rolar o ombro. Descanso 25 s.'},
    ],
    variacoes:[
      {contexto:'Mais fácil', descricao:'Pull buoy pra manter o quadril alto e focar só nos braços.'},
      {contexto:'Mais difícil', descricao:'Costas com contagem de braçadas, tentando alongar (rolar mais).'},
      {contexto:'Em grupo', descricao:'Atravessar olhando uma referência fixa no teto pra nadar reto, sem bater na raia.'},
    ],
    dica:'Eu coloco uma fita no teto na linha da raia. O aluno de costas se perde porque não tem referência — com um ponto pra seguir, o nado fica reto na hora.',
    observar:['Se a cabeça fica parada e firme (não balança com a braçada)','Se o braço entra esticado atrás, alinhado ao ombro','Se o quadril está alto, sem "sentar" na água'] },

  { nivel:'intermediario', titulo:'Resistência: 400 sem Parar', subtitulo:'Base aeróbica — nadar contínuo e econômico', distancia:'700 m', duracao:'45 min',
    objetivo:'Construir fôlego e economia: nadar 400 m contínuos em ritmo confortável. É o tijolo da resistência — quem aguenta 400 leves evolui pra qualquer prova.',
    equipamentos:['Óculos','Relógio de parede / cronômetro'],
    estrutura:[
      {fase:'Aquecimento (200 m)', set:'100 m crawl + 100 m costas, soltos.'},
      {fase:'Construção (4×100 m)', set:'Crawl em ritmo constante, descanso 20 s, mantendo o mesmo tempo nos quatro (controle de ritmo).'},
      {fase:'O desafio (400 m)', set:'Crawl contínuo, sem parar, ritmo de conversa. O objetivo é terminar inteiro, não rápido.'},
      {fase:'Soltura (100 m)', set:'Nado à escolha, bem leve.'},
    ],
    variacoes:[
      {contexto:'Mais fácil', descricao:'Quebrar em 2×200 m com 30 s de descanso antes de tentar os 400 direto.'},
      {contexto:'Mais difícil', descricao:'400 m em "negative split" — a segunda metade um pouco mais rápida.'},
      {contexto:'Em grupo', descricao:'Revezamento: a turma soma metros até bater uma meta coletiva (ex.: 2000 m juntos).'},
    ],
    dica:'O que funciona pra mim é mandar nadar "no ritmo em que daria pra conversar". Quase todo iniciante de resistência começa rápido demais e morre na metade. Devagar e inteiro vence rápido e quebrado.',
    observar:['Se mantém o ritmo constante ou dispara e afunda no fim','Se a respiração fica controlada do início ao fim','Se a técnica não desmonta com o cansaço'] },

  { nivel:'intermediario', titulo:'Borboleta sem Medo', subtitulo:'Introdução ao nado borboleta, por partes', distancia:'600 m', duracao:'50 min',
    objetivo:'Desmistificar o nado mais temido: a borboleta nasce da ondulação do corpo + pernada de golfinho, e só depois entra a braçada. Construída por partes, deixa de ser bicho de sete cabeças.',
    equipamentos:['Óculos','Prancha','Nadadeira (opc.)'],
    estrutura:[
      {fase:'Aquecimento (200 m)', set:'Crawl e costas leve + deslizes ondulando o corpo.'},
      {fase:'Ondulação (8×25 m)', set:'Pernada de golfinho com a prancha à frente, ondulando do PEITO (não só das pernas). Achar o "chicote".'},
      {fase:'Braçada por partes (8×15 m)', set:'1 braçada de borboleta a cada 3 pernadas de golfinho, saindo pra respirar à frente. Sem pressa.'},
      {fase:'Junção + soltura (4×15 m + 100 m)', set:'Borboleta completa curta (3–4 braçadas) respirando à frente; depois 100 m crawl leve.'},
    ],
    variacoes:[
      {contexto:'Mais fácil', descricao:'Usar nadadeira pra facilitar a ondulação e sentir o movimento certo.'},
      {contexto:'Mais difícil', descricao:'25 m de borboleta contínua, respirando a cada braçada.'},
      {contexto:'Em grupo', descricao:'Treinar a ondulação em fila, todos "golfinhos" atravessando juntos.'},
    ],
    dica:'Eu nunca começo a borboleta pelos braços. Construo a ondulação primeiro — quando o aluno sente o corpo fazer "onda" do peito ao pé, a braçada entra fácil. Quem aprende pelo braço aprende borboleta de afogado.',
    observar:['Se a ondulação sai do peito/quadril, não só das pernas','Se a respiração é rápida e à frente, queixo na água','Se mantém o ritmo (2 pernadas por braçada)'] },

  { nivel:'intermediario', titulo:'Pernada de Peito Afiada', subtitulo:'Consertando o erro nº 1 do nado peito', distancia:'650 m', duracao:'45 min',
    objetivo:'A pernada de peito mal feita (pés pra dentro, joelhos abertos) trava o nado inteiro. Aqui o aluno conserta: calcanhar no bumbum, PÉS pra fora, chute circular e junta. É a propulsão de todo o peito.',
    equipamentos:['Prancha','Óculos','Parede'],
    estrutura:[
      {fase:'Aquecimento (200 m)', set:'Crawl + costas leve.'},
      {fase:'Pernada na parede (8 min)', set:'Segurando a borda de bruços, pernada de rã devagar; conferir o pé virado pra fora.'},
      {fase:'Pernada com prancha (8×25 m)', set:'Pernada de peito com a prancha, deslizando entre cada uma. Foco no pé "de pato" e no chute pra trás.'},
      {fase:'Pernada de costas + soltura (4×25 m + 100 m)', set:'Pernada de peito de costas (fácil de ver o movimento) pra fixar o padrão; depois 100 m solto.'},
    ],
    variacoes:[
      {contexto:'Mais fácil', descricao:'Pernada segurando a borda até o pé "virar" sozinho pra fora.'},
      {contexto:'Mais difícil', descricao:'Pernada de peito com as mãos esticadas à frente, contando o deslize.'},
      {contexto:'Em grupo', descricao:'Em duplas, um confere o pé do outro fora d’água, na borda.'},
    ],
    dica:'O que funciona pra mim é a imagem do "pé de pato": o impulso vem da SOLA empurrando a água pra trás. Quem chuta com a ponta esticada não sai do lugar — é o erro que trava 9 em cada 10 alunos.',
    observar:['Se os pés viram pra fora (de pato) antes do chute','Se o impulso vem da sola empurrando pra trás','Se os joelhos não abrem demais (abre o PÉ, não o joelho)'] },

  { nivel:'intermediario', titulo:'Circuito de Educativos', subtitulo:'Uma série de drills pra lapidar a técnica de crawl', distancia:'800 m', duracao:'50 min',
    objetivo:'Juntar os principais educativos de crawl num circuito que ataca cada parte da braçada: pegada, rolagem, alinhamento e timing. É o treino que transforma nado bruto em nado bonito.',
    equipamentos:['Óculos','Pull buoy','Palmar (opc.)','Snorkel frontal (opc.)'],
    estrutura:[
      {fase:'Aquecimento (200 m)', set:'Crawl leve + pernada.'},
      {fase:'Circuito de drills (8×50 m)', set:'Rodízio: "catch-up", "ponta de dedo arrastando", "punho fechado" (sente o antebraço) e "3 braçadas e desliza de lado".'},
      {fase:'Aplicação (4×100 m)', set:'Crawl normal levando o que sentiu nos drills (mão que "agarra", corpo que rola). Descanso 20 s.'},
      {fase:'Soltura (100 m)', set:'Nado à escolha.'},
    ],
    variacoes:[
      {contexto:'Mais fácil', descricao:'Cada drill com pull buoy pra focar só nos braços.'},
      {contexto:'Mais difícil', descricao:'Acrescentar palmar nos 100 m de aplicação pra exigir a pegada.'},
      {contexto:'Em grupo', descricao:'Cada aluno escolhe o drill do seu ponto fraco e ensina aos colegas.'},
    ],
    dica:'Eu uso muito o "punho fechado": nadar 1 piscina de mão fechada, abrir na seguinte. Quando o aluno volta a abrir a mão, sente a água na palma como nunca — é o jeito mais rápido de ensinar a "agarrar" a água.',
    observar:['Se transfere o aprendizado do drill pro nado normal','Se a mão "agarra" a água em vez de escorregar','Se o corpo rola de um lado ao outro com a braçada'] },

  { nivel:'intermediario', titulo:'O Gostinho da Velocidade', subtitulo:'Primeiros tiros — nadar rápido sem perder a técnica', distancia:'700 m', duracao:'45 min',
    objetivo:'Apresentar o aluno à velocidade de forma controlada: tiros curtos com descanso, mantendo a técnica construída. É a ponte do "nadar bonito" pro "nadar rápido", sem virar braçada de pânico.',
    equipamentos:['Óculos','Cronômetro'],
    estrutura:[
      {fase:'Aquecimento (200 m)', set:'150 m crawl leve + 4×25 m progressivos (cada um um pouco mais forte).'},
      {fase:'Frequência (4×25 m)', set:'Crawl acelerando a frequência da braçada nos últimos 10 m, sem encurtar a braçada.'},
      {fase:'Tiros (8×25 m)', set:'Crawl forte (~85%), descanso 30–40 s, mantendo a braçada longa. Não é máximo — é "forte e bonito".'},
      {fase:'Soltura (100 m)', set:'Crawl/costas bem leve.'},
    ],
    variacoes:[
      {contexto:'Mais fácil', descricao:'6×25 m a 80%, descanso de 45 s, focando só em não desmontar a técnica.'},
      {contexto:'Mais difícil', descricao:'8×25 m alternando 1 forte / 1 leve, sentindo a diferença de marcha.'},
      {contexto:'Em grupo', descricao:'Largadas de tempos em tempos pra criar o clima de "corrida" leve.'},
    ],
    dica:'O que funciona pra mim é repetir "rápido é braçada longa e ligeira, não curta e desesperada". O intermediário, ao acelerar, encolhe a braçada e afunda. Velocidade de verdade é manter a técnica em alta rotação.',
    observar:['Se a braçada continua longa ao acelerar (não encurta)','Se respira sem levantar a cabeça e frear','Se mantém a técnica do 1º ao último tiro'] },

  // ════════ AVANÇADO ════════
  { nivel:'avancado', titulo:'Tiros de 25: Pura Velocidade', subtitulo:'Treino de velocidade e potência (anaeróbico)', distancia:'1.150 m', duracao:'50 min',
    objetivo:'Desenvolver velocidade máxima e potência de braçada com tiros curtos e descanso longo. Treina a marcha alta — explosão, frequência e força, sem deixar a técnica desmontar.',
    equipamentos:['Óculos','Cronômetro','Palmar (opc.)'],
    estrutura:[
      {fase:'Aquecimento (400 m)', set:'200 m crawl leve + 4×50 m progressivos (cada um mais forte) + 100 m solto.'},
      {fase:'Ativação (4×15 m)', set:'Saídas explosivas com deslize submerso forte, frequência alta, descanso completo (30 s parado).'},
      {fase:'Principal (10×25 m máx.)', set:'Tiro de 25 m a ~95%, saindo a cada 1 min (descanso ~40 s). Técnica afiada, sem "afogar" a braçada.'},
      {fase:'Soltura (200 m)', set:'Crawl/costas bem leve pra limpar o lactato.'},
    ],
    variacoes:[
      {contexto:'Mais fácil', descricao:'6×25 m a 90%, descanso de 1 min completo entre cada.'},
      {contexto:'Mais difícil', descricao:'8×25 m + 4×12,5 m em velocidade máxima (sprint puro), descanso total.'},
      {contexto:'Em grupo', descricao:'Pareados por nível, "corrida" de 25 m de tempos em tempos — a disputa puxa o tempo.'},
    ],
    dica:'Eu sempre dou descanso LONGO nos tiros de velocidade. Parece contraintuitivo, mas velocidade se treina descansado — descanso curto vira treino aeróbico e o aluno nunca aprende a nadar realmente rápido.',
    observar:['Se mantém a técnica em alta velocidade (não vira "cachorrinho")','Se a saída/deslize submerso é explosivo','Se aguenta tempo parecido do 1º ao último tiro'] },

  { nivel:'avancado', titulo:'No Limiar', subtitulo:'Treino de limiar — o ritmo forte sustentável', distancia:'1.300 m', duracao:'55 min',
    objetivo:'Treinar no limiar (o ritmo forte que dá pra segurar sem estourar). É a zona que mais melhora provas de meio-fundo: séries longas, descanso curto, ritmo firme e controlado.',
    equipamentos:['Óculos','Cronômetro'],
    estrutura:[
      {fase:'Aquecimento (400 m)', set:'200 m solto + 6×50 m crescente + 100 m leve.'},
      {fase:'Calibragem (4×50 m)', set:'No ritmo de limiar (forte mas controlado), descanso 15 s, pra acertar o pace.'},
      {fase:'Principal (6×100 m)', set:'No limiar, saindo a cada 1′45 (descanso ~15–20 s). Ritmo constante nos seis — não é tiro, é "forte sustentado".'},
      {fase:'Bônus + soltura (4×50 m + 200 m)', set:'4×50 m no mesmo ritmo, descanso 10 s; depois 200 m leve.'},
    ],
    variacoes:[
      {contexto:'Mais fácil', descricao:'5×100 m saindo a cada 2 min (mais descanso) antes de apertar o intervalo.'},
      {contexto:'Mais difícil', descricao:'8×100 m ou reduzir a saída pra cada 1′40.'},
      {contexto:'Em grupo', descricao:'Mesma raia, sair de 10 em 10 s; o pace do grupo segura quem tende a explodir.'},
    ],
    dica:'O que funciona pra mim é definir o limiar pelo teste do "100 m que dá pra repetir 6 vezes igual". Se o aluno faz o 1º muito rápido e despenca, o pace tava errado. Limiar é o ritmo que ele odeia mas CONSEGUE manter.',
    observar:['Se os tempos dos 100 m ficam parecidos (controle de pace)','Se a respiração é forte mas controlada','Se a braçada se mantém longa na fadiga'] },

  { nivel:'avancado', titulo:'Pace de Prova: O Cronômetro Manda', subtitulo:'Controle de ritmo e split — nadar pelo relógio', distancia:'1.250 m', duracao:'55 min',
    objetivo:'Ensinar o atleta a sentir e controlar o pace: dividir o esforço (split), fazer negative split e bater tempos-alvo. Vencer prova é distribuir energia, não só ter fôlego.',
    equipamentos:['Óculos','Cronômetro','Quadro de tempos'],
    estrutura:[
      {fase:'Aquecimento (400 m)', set:'200 m solto + 4×50 m progressivo + 100 m leve.'},
      {fase:'Calibragem (4×50 m)', set:'No pace-alvo de prova, anotando cada tempo. Aprender a "sentir" o ritmo certo.'},
      {fase:'Principal (5×100 m negative split)', set:'Cada 100 m com a 2ª metade mais rápida que a 1ª (anotar os dois 50 m). Descanso 30 s.'},
      {fase:'Simulado + soltura (2×150 m + 150 m)', set:'2×150 m no pace de prova mantendo o split; depois 150 m leve.'},
    ],
    variacoes:[
      {contexto:'Mais fácil', descricao:'Trabalhar só 50 m com split (25+25), focando em acelerar o final.'},
      {contexto:'Mais difícil', descricao:'"Broken 200" — 200 m no pace de prova quebrado em 4×50 com 10 s, somando o tempo-alvo.'},
      {contexto:'Em grupo', descricao:'Cada um anuncia o tempo-alvo; a turma confere quem chega mais perto. Precisão vira jogo.'},
    ],
    dica:'Eu treino o atleta a SABER o tempo dele antes de olhar o relógio. Pergunto "quanto você fez?" e comparo com o real. Quando ele acerta de cabeça, ganhou controle de pace — e aí controla a prova.',
    observar:['Se a 2ª metade sai mesmo mais rápida (negative split real)','Se acerta o tempo-alvo com pouca variação','Se não estoura no começo levado pela adrenalina'] },

  { nivel:'avancado', titulo:'Saída de Bloco e Primeiros 15m', subtitulo:'Saída, deslize submerso e golfinho subaquático', distancia:'1.100 m', duracao:'50 min',
    objetivo:'A prova começa fora d’água. Treinar a saída do bloco, a entrada limpa (furar um buraco só), o deslize submerso em streamline e a pernada de golfinho até os 15 m. Os primeiros metros decidem corridas.',
    equipamentos:['Bloco de saída','Óculos','Cronômetro'],
    estrutura:[
      {fase:'Aquecimento (400 m)', set:'Solto + alguns deslizes submersos com pernada de golfinho.'},
      {fase:'Golfinho subaquático (8×15 m)', set:'Da parede em streamline, ondular do peito, contar quantas pernadas até emergir. Buscar distância submersa.'},
      {fase:'Saída do bloco (8×)', set:'Posição de garra, reação ao sinal, voo, entrada num "buraco só", deslize e 3–4 golfinhos antes da 1ª braçada.'},
      {fase:'Saída + 25 m (4×) + soltura', set:'Saída completa + nado forte até 25 m (cronometrar os 15 m). Depois 200 m leve.'},
    ],
    variacoes:[
      {contexto:'Mais fácil', descricao:'Treinar a saída sentado na borda / em pé na borda antes do bloco alto.'},
      {contexto:'Mais difícil', descricao:'Saída + 15 m máximo cronometrado, buscando reação + subaquático.'},
      {contexto:'Em grupo', descricao:'"Quem emerge mais longe" no subaquático — vira disputa de deslize.'},
    ],
    dica:'O que funciona pra mim é filmar a entrada com o celular. O atleta acha que entra limpo, mas quase sempre "senta" e freia. Ver o próprio splash corrige a entrada em uma aula.',
    observar:['Se entra num ponto só (mãos abrem o buraco, corpo passa por ele)','Se mantém streamline apertado, sem abrir braços','Se respeita os 15 m e não emerge cedo demais'] },

  { nivel:'avancado', titulo:'VO2: A Caixa Vermelha', subtitulo:'Intervalado de alta intensidade — potência aeróbica', distancia:'1.500 m', duracao:'60 min',
    objetivo:'Elevar o teto aeróbico (VO2máx) com séries intensas e intervalos que não deixam recuperar totalmente. É o treino que dói e que faz o atleta nadar forte por mais tempo nas provas.',
    equipamentos:['Óculos','Cronômetro'],
    estrutura:[
      {fase:'Aquecimento (500 m)', set:'300 m variado + 6×50 m progressivo + 100 m leve.'},
      {fase:'Ativação (4×25 m)', set:'Fortes, descanso 20 s, pra entrar na zona.'},
      {fase:'Principal (8×75 m)', set:'Forte (90–95%), saindo a cada 1′30 (descanso ~15–20 s). Alta intensidade com pouca recuperação — "na caixa vermelha".'},
      {fase:'Finalização + soltura (4×50 m + 300 m)', set:'4×50 m fortes (descanso 20 s), depois 300 m bem leve — recuperação faz parte.'},
    ],
    variacoes:[
      {contexto:'Mais fácil', descricao:'6×75 m saindo a cada 1′45 (mais descanso) antes de apertar.'},
      {contexto:'Mais difícil', descricao:'10×75 m ou intervalo a cada 1′20 — menos recuperação ainda.'},
      {contexto:'Em grupo', descricao:'Saídas sincronizadas; o grupo segura o ritmo alto e ninguém "alivia".'},
    ],
    dica:'Eu não dou esse treino mais de 1–2× por semana. VO2 é poderoso mas desgasta — quem abusa fica estagnado e lesionado. Qualidade na zona certa vale mais que volume sofrido todo dia.',
    observar:['Se sustenta a intensidade do 1º ao último (sem despencar)','Se a recuperação curta não destrói a técnica','Se a soltura final é levada a sério'] },

  { nivel:'avancado', titulo:'Simulado de Prova: 100m Pra Valer', subtitulo:'Preparação de prova — afiar e competir contra o relógio', distancia:'1.350 m', duracao:'60 min',
    objetivo:'Juntar tudo num simulado: aquecimento de prova, saída de bloco, pace planejado, virada rápida e final forte. Ensaiar o dia da competição pra chegar pronto, sem surpresas.',
    equipamentos:['Bloco de saída','Óculos','Cronômetro'],
    estrutura:[
      {fase:'Aquecimento de prova (600 m)', set:'300 m solto + 4×50 m progressivo + 4×25 m de ativação + 100 m leve. Rotina pré-prova.'},
      {fase:'Preparação (4×50 m)', set:'No pace-alvo do 100 m, com saída e virada, descanso completo.'},
      {fase:'O simulado (1×100 m máx.)', set:'Saída de bloco, prova completa no melhor esforço, cronometrada. Anotar o split de cada 50 m.'},
      {fase:'Repetição + soltura (1×100 m + 300 m)', set:'Repetir corrigindo o que falhou (descanso 8–10 min); depois 300 m leve.'},
    ],
    variacoes:[
      {contexto:'Mais fácil', descricao:'Simular 50 m antes de partir pro 100 m completo.'},
      {contexto:'Mais difícil', descricao:'Simulado de 200 m ou dois 100 m com pouco descanso (resistência de prova).'},
      {contexto:'Em grupo', descricao:'Baterias com 2–3 atletas por raia, como numa competição real — a disputa puxa o tempo.'},
    ],
    dica:'O que funciona pra mim é fazer o aquecimento de prova IGUALZINHO em todo simulado. No dia da competição, o corpo reconhece a rotina e o nervosismo cai. Prova se ganha no hábito, não na sorte.',
    observar:['Se executa a rotina de aquecimento completa, sem pular etapas','Se os splits batem com o pace planejado','Se o final é forte (sobrou energia pro último 25 m?)'] },

  { nivel:'avancado', titulo:'O Longão Aeróbico', subtitulo:'Volume contínuo — a base que sustenta tudo', distancia:'2.000 m', duracao:'65 min',
    objetivo:'Construir a base aeróbica profunda (zona A2) com volume contínuo e econômico. É o treino menos glamouroso e mais importante: amplia o "motor" que permite treinar forte o resto da semana.',
    equipamentos:['Óculos','Cronômetro'],
    estrutura:[
      {fase:'Aquecimento (400 m)', set:'300 m solto + 4×25 m progressivo.'},
      {fase:'Série longa (1×800 m)', set:'Crawl contínuo em ritmo aeróbico confortável, respiração estável, técnica longa. O ritmo "que dá pra manter o dia todo".'},
      {fase:'Série quebrada (6×100 m)', set:'No mesmo ritmo, descanso curto 15 s, segurando o pace sem acelerar.'},
      {fase:'Soltura (200 m)', set:'Costas/crawl leve.'},
    ],
    variacoes:[
      {contexto:'Mais fácil', descricao:'Trocar o 800 m por 2×400 m com 20 s, antes de encarar o contínuo.'},
      {contexto:'Mais difícil', descricao:'1×1000 m contínuo + 6×100 m, ou incluir 200 m de pernada longa.'},
      {contexto:'Em grupo', descricao:'Pelotão na mesma raia em ritmo aeróbico, revezando quem "puxa" a cada 100 m.'},
    ],
    dica:'Eu insisto no longão porque é onde a economia de nado é construída. Atleta que só treina tiro fica rápido por 50 m e morre. A base aeróbica é o tanque de combustível — sem ela, nenhuma velocidade dura a prova inteira.',
    observar:['Se mantém o ritmo do começo ao fim, sem acelerar e quebrar','Se a técnica se mantém longa mesmo no tédio do volume','Se a respiração é estável o tempo todo'] },

  { nivel:'avancado', titulo:'Medley: Domando os 4 Estilos', subtitulo:'Treino de medley e transições entre os nados', distancia:'1.400 m', duracao:'60 min',
    objetivo:'Trabalhar os 4 estilos em sequência (borboleta, costas, peito, crawl) e, principalmente, as VIRADAS de transição entre eles — onde o medley se ganha ou se perde. Exige domínio técnico completo.',
    equipamentos:['Óculos','Cronômetro'],
    estrutura:[
      {fase:'Aquecimento (400 m)', set:'200 m crawl + 100 m costas + 100 m de estilos (25 m cada) bem leve.'},
      {fase:'Por estilo (8×50 m)', set:'2×50 m de cada nado (borboleta, costas, peito, crawl), foco na técnica de cada um, descanso 20 s.'},
      {fase:'Transições (4×100 m medley)', set:'100 m IM (25 de cada), atenção total nas viradas entre estilos (regras de toque e giro). Descanso 30 s.'},
      {fase:'Soltura (200 m)', set:'Crawl leve.'},
    ],
    variacoes:[
      {contexto:'Mais fácil', descricao:'Reduzir a borboleta a 25 m e nadar 4×50 m medley (½ de cada par).'},
      {contexto:'Mais difícil', descricao:'200 m medley contínuo cronometrado, com saída e final forte.'},
      {contexto:'Em grupo', descricao:'Revezamento medley em equipe (cada um um estilo) — a transição vira disputa.'},
    ],
    dica:'O que funciona pra mim é treinar as VIRADAS de transição isoladas: borboleta→costas e costas→peito são as que mais derrubam atleta por falta. Quem domina as transições nada o medley tranquilo e ganha segundos de graça.',
    observar:['Se respeita as regras de toque/virada de cada transição','Se mantém a técnica de cada estilo, não só "passa" por ele','Se distribui o esforço (não estoura na borboleta inicial)'] },

  { nivel:'avancado', titulo:'Força na Água: Palmar e Pull', subtitulo:'Treino de força específica de natação', distancia:'1.300 m', duracao:'55 min',
    objetivo:'Desenvolver força específica de braçada com palmares, pull buoy e nado resistido. Mais força aplicada na água = braçada mais potente. Usado com critério, sem virar sobrecarga no ombro.',
    equipamentos:['Óculos','Palmar (paddle)','Pull buoy','Cronômetro'],
    estrutura:[
      {fase:'Aquecimento (400 m)', set:'300 m solto + 4×50 m progressivo (sem palmar, pra preparar o ombro).'},
      {fase:'Pull com palmar (6×100 m)', set:'Crawl com pull buoy + palmar, braçada longa e potente, sentindo a pegada. Descanso 25 s.'},
      {fase:'Nado resistido (4×50 m)', set:'Crawl forte com mais resistência (camiseta velha), foco em "agarrar" e empurrar. Descanso 30 s.'},
      {fase:'Soltura (200 m)', set:'Crawl SEM equipamento, soltando o ombro.'},
    ],
    variacoes:[
      {contexto:'Mais fácil', descricao:'Só pull buoy (sem palmar), pra quem ainda tem braçada instável.'},
      {contexto:'Mais difícil', descricao:'Palmar maior ou somar pernada presa (mini-buoy) pra isolar mais o braço.'},
      {contexto:'Em grupo', descricao:'Comparar a contagem de braçadas com e sem palmar — sentir o ganho de pegada.'},
    ],
    dica:'Eu só dou palmar pra quem JÁ tem técnica boa. Palmar em braçada torta multiplica o erro e machuca o ombro. E sempre termino sem equipamento, soltando — o ombro agradece e dura a temporada toda.',
    observar:['Se a técnica se mantém com a palmar (não vira braçada forçada)','Se sente a pegada e empurra a água, não só arrasta o palmar','Se não há dor no ombro (sinal de excesso)'] },

  { nivel:'avancado', titulo:'Tolerância ao Lactato: Os 50 Bravos', subtitulo:'Velocidade de prova sob fadiga — o treino que dói', distancia:'1.400 m', duracao:'60 min',
    objetivo:'Treinar a capacidade de manter velocidade alta mesmo com o corpo cheio de lactato (o "ardume" do fim da prova). Séries de 50 m fortes com descanso decrescente ensinam o atleta a sofrer e não desmontar.',
    equipamentos:['Óculos','Cronômetro'],
    estrutura:[
      {fase:'Aquecimento (500 m)', set:'300 m variado + 6×50 m progressivo + 100 m leve.'},
      {fase:'Ativação (4×25 m)', set:'Fortes, descanso completo, pra acordar a velocidade.'},
      {fase:'Os 50 bravos (8×50 m)', set:'Forte (90–95%), descanso DECRESCENTE (30 s, 25 s, 20 s, 15 s...). O lactato acumula — segurar o tempo é a missão.'},
      {fase:'Recuperação + soltura (4×50 m leve + 200 m)', set:'Bem leve — essencial pra limpar o lactato.'},
    ],
    variacoes:[
      {contexto:'Mais fácil', descricao:'6×50 m com descanso fixo de 30 s antes de encarar o decrescente.'},
      {contexto:'Mais difícil', descricao:'10×50 m ou descanso ainda menor (começar em 20 s).'},
      {contexto:'Em grupo', descricao:'Largadas juntas; o grupo segura o ritmo e ninguém alivia nos últimos.'},
    ],
    dica:'O que funciona pra mim é avisar antes: "os últimos 50 vão arder, e tá tudo certo". Tolerância ao lactato é metade física, metade mental. Quem mantém a técnica enquanto dói é o que não morre nos últimos 15 m da prova.',
    observar:['Se segura o tempo dos 50 m mesmo com o descanso caindo','Se a técnica resiste à fadiga (braçada não encurta no ardume)','Se leva a recuperação final a sério'] },
];

// ───────────────────── ficha (HTML, 1 página A4) ─────────────────────
function htmlFicha(t, pagina) {
  const N = NIVEIS[t.nivel];
  const mImg = masc(t.nivel);
  const blocoF = (titulo, inner, hl) => `<div style="border:2px solid color-mix(in srgb, var(--p) 26%, #fff);border-radius:16px;background:${hl?'color-mix(in srgb, var(--p) 10%, #fff)':'#fff'};padding:4mm 4.8mm;break-inside:avoid;box-shadow:0 2px 0 color-mix(in srgb, var(--p) 15%, #fff), 0 5px 11px rgba(20,40,80,0.07)"><div style="font-family:'Gagalin','Nunito',sans-serif;font-size:11pt;font-weight:900;letter-spacing:0.5px;text-transform:uppercase;color:var(--p);margin-bottom:2.2mm">${titulo}</div>${inner}</div>`;
  const oObjetivo = blocoF('🎯 Objetivo', `<div style="font-size:9.5pt;font-weight:600;color:#1a1a2e;line-height:1.45">${esc(t.objetivo)}</div>`);
  const oEquip = blocoF('🏊 Equipamentos', (t.equipamentos||[]).map(m=>`<div style="display:flex;gap:1.5mm;padding:1mm 0;font-size:9pt;font-weight:600;line-height:1.35"><span style="color:var(--p);font-weight:900">✓</span><span>${esc(m)}</span></div>`).join(''));
  const oEstrutura = blocoF('🌊 Estrutura do Treino', (t.estrutura||[]).map((p,i)=>`<div style="display:flex;gap:2.5mm;padding:1.8mm 0;${i<t.estrutura.length-1?'border-bottom:1px solid #eef0f6':''}"><div style="flex:0 0 auto;width:6mm;height:6mm;border-radius:50%;background:var(--p);color:#fff;font-weight:900;font-size:9pt;display:flex;align-items:center;justify-content:center">${i+1}</div><div style="flex:1"><div style="font-size:9.5pt;font-weight:800;color:#1a1a2e;margin-bottom:0.3mm">${esc(p.fase)}</div><div style="font-size:9pt;font-weight:500;color:#444;line-height:1.4">${esc(p.set)}</div></div></div>`).join(''), true);
  const oVar = blocoF('⭐ Variações', (t.variacoes||[]).map(v=>`<div style="padding:1.3mm 0;font-size:9pt;line-height:1.4"><span style="font-weight:800;color:var(--p)">${esc(v.contexto)}:</span> <span style="font-weight:500;color:#444">${esc(v.descricao)}</span></div>`).join(''));
  const oObs = blocoF('✅ O Que Observar', (t.observar||[]).map(o=>`<div style="display:flex;gap:1.5mm;padding:0.8mm 0;font-size:9pt;font-weight:600;color:#1a1a2e;line-height:1.35"><span style="color:var(--p);font-weight:900">✓</span><span>${esc(o)}</span></div>`).join(''));
  const oDica = `<div style="break-inside:avoid;padding:3.2mm 4.2mm;background:var(--p);border-radius:12px;color:#fff;font-size:9.5pt;font-weight:600;line-height:1.45"><strong style="display:block;margin-bottom:1mm;font-family:'Gagalin','Nunito',sans-serif;font-size:10.5pt;font-weight:900;letter-spacing:0.5px;text-transform:uppercase;color:rgba(255,255,255,0.92)">💡 Dica do Técnico</strong>${esc(t.dica)}</div>`;
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    @page{size:A4;margin:0} *{margin:0;padding:0;box-sizing:border-box}
    @font-face{font-family:'Gagalin';src:url(data:font/otf;base64,${GAGALIN}) format('opentype')}
    body{--p:${N.p};--s:${N.s};font-family:'Nunito','Segoe UI',Arial,sans-serif}
  </style></head><body>
    <div style="width:210mm;height:297mm;position:relative;overflow:hidden;background:linear-gradient(165deg, color-mix(in srgb, var(--p) 13%, #fff) 0%, #ffffff 52%, color-mix(in srgb, var(--s) 16%, #fff) 100%)">
      <div style="position:absolute;inset:0;background-image:radial-gradient(circle, var(--p) 1.6px, transparent 1.6px),radial-gradient(circle, var(--s) 1.4px, transparent 1.4px);background-size:44px 44px,62px 62px;background-position:0 0,22px 20px;opacity:0.06;z-index:0"></div>
      <div style="position:absolute;left:0;top:0;bottom:0;width:8mm;background:var(--p);display:flex;align-items:center;justify-content:center;z-index:2"><div style="writing-mode:vertical-rl;transform:rotate(180deg);white-space:nowrap;color:#fff;font-family:'Gagalin','Nunito',sans-serif;font-weight:900;font-size:9.5pt;letter-spacing:2px;text-transform:uppercase">Treino de Natação</div></div>
      <div style="padding:10mm 12mm 16mm 16mm;position:relative;z-index:1;height:100%;display:flex;flex-direction:column;gap:4mm;justify-content:space-between">
        <div style="position:relative;overflow:hidden;background:linear-gradient(135deg, var(--p) 0%, color-mix(in srgb, var(--p) 55%, var(--s)) 100%);border-radius:20px;padding:7mm 7.5mm;display:flex;align-items:center;gap:5mm;box-shadow:0 5px 16px color-mix(in srgb, var(--p) 32%, transparent)">
          <div style="flex:1;min-width:0">
            <div style="display:inline-block;background:rgba(255,255,255,0.22);border:1.5px solid rgba(255,255,255,0.45);border-radius:20px;padding:0.6mm 3.5mm;font-family:'Gagalin','Nunito',sans-serif;font-size:7.5pt;letter-spacing:1.5px;color:#fff;text-transform:uppercase;margin-bottom:2mm">🏊 Nível ${esc(N.rotulo)}</div>
            <div style="font-family:'Gagalin','Nunito',sans-serif;font-size:27pt;color:#fff;line-height:1.0;letter-spacing:0.5px;text-shadow:0 2px 6px rgba(0,0,0,0.18)">${esc(t.titulo)}</div>
            <div style="font-size:10pt;font-weight:700;color:rgba(255,255,255,0.92);margin-top:1.5mm">${esc(t.subtitulo)}</div>
            <div style="display:flex;gap:2mm;margin-top:2.5mm;flex-wrap:wrap">
              <span style="display:inline-flex;align-items:center;gap:1.5mm;padding:1.1mm 3.5mm;background:rgba(255,255,255,0.92);border-radius:20px;font-size:9pt;font-weight:800;color:#0e7490">📏 ${esc(t.distancia)}</span>
              <span style="display:inline-flex;align-items:center;gap:1.5mm;padding:1.1mm 3.5mm;background:rgba(255,255,255,0.92);border-radius:20px;font-size:9pt;font-weight:800;color:#1d4ed8">⏱ ${esc(t.duracao)}</span>
            </div>
          </div>
          ${mImg?`<img src="${mImg}" style="flex:0 0 auto;width:43mm;height:43mm;object-fit:contain;filter:drop-shadow(0 5px 7px rgba(0,0,0,0.32))"/>`:''}
        </div>
        <div style="display:flex;gap:4mm;align-items:stretch">
          <div style="flex:1;min-width:0">${oObjetivo}</div>
          <div style="flex:1;min-width:0">${oEquip}</div>
        </div>
        <div style="display:flex;gap:5mm;align-items:flex-start">
          <div style="flex:1.4;min-width:0">${oEstrutura}</div>
          <div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:4mm">${oVar}${oObs}</div>
        </div>
        ${oDica}
      </div>
      <div style="position:absolute;bottom:0;left:0;right:0;height:9mm;display:flex;align-items:center;justify-content:space-between;padding:0 12mm 0 16mm;background:color-mix(in srgb, var(--p) 6%, #fff);border-top:1.5px dashed color-mix(in srgb, var(--p) 30%, #fff)">
        <span style="font-size:7pt;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:var(--p)">${esc(AUTOR)}</span>
        <span style="font-family:'Gagalin','Nunito',sans-serif;font-size:8.5pt;color:#7c8aa5">${pagina}</span>
      </div>
    </div>
  </body></html>`;
}

// ───────────────────── capa + sumário ─────────────────────
function htmlCapa() {
  const ms = ['iniciante','intermediario','avancado'].map(masc);
  const leg = Object.entries(NIVEIS).map(([k,v])=>`<span><span style="display:inline-block;width:3mm;height:3mm;border-radius:50%;margin-right:1mm;vertical-align:middle;background:${v.p}"></span>${esc(v.rotulo)}</span>`).join('');
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    @page{size:A4;margin:0} *{margin:0;padding:0;box-sizing:border-box}
    @font-face{font-family:'Gagalin';src:url(data:font/otf;base64,${GAGALIN}) format('opentype')}
    body{width:210mm;height:297mm;font-family:'Nunito','Segoe UI',Arial,sans-serif;color:#fff;
      background:radial-gradient(120% 80% at 50% 0%, #0e7490 0%, #0c4a6e 45%, #07223a 100%);
      display:flex;flex-direction:column;align-items:center;justify-content:space-between;padding:26mm 18mm 16mm;overflow:hidden;position:relative}
    .dots{position:absolute;inset:0;background-image:radial-gradient(circle,#fff 1.5px,transparent 1.5px);background-size:46px 46px;opacity:0.05}
    .wave{position:absolute;left:-5%;right:-5%;height:60mm;opacity:.13;background:radial-gradient(70% 100% at 50% 0,#67e8f9,transparent)}
    .badge{font-family:'Gagalin';font-size:11pt;letter-spacing:3px;background:rgba(255,255,255,.12);border:1.5px solid rgba(255,255,255,.3);border-radius:30px;padding:3mm 8mm;text-transform:uppercase}
    .titulo{font-family:'Gagalin';font-size:46pt;line-height:1.02;text-align:center;margin:6mm 0 3mm;text-shadow:0 4px 16px rgba(0,0,0,.4)}
    .sub{font-size:14.5pt;font-weight:700;color:rgba(255,255,255,.88);text-align:center;max-width:155mm;line-height:1.4}
    .mascotes{display:flex;gap:4mm;align-items:flex-end;justify-content:center;width:100%}
    .mascotes img{width:48mm;height:48mm;object-fit:contain;filter:drop-shadow(0 8px 10px rgba(0,0,0,.45))}
    .rodape{font-family:'Gagalin';font-size:16pt;letter-spacing:1px}
    .niv-leg{display:flex;gap:6mm;justify-content:center;margin-top:2mm;font-size:10pt;font-weight:800;color:rgba(255,255,255,.8)}
  </style></head><body>
    <div class="dots"></div><div class="wave" style="bottom:30mm"></div>
    <div style="z-index:1;display:flex;flex-direction:column;align-items:center">
      <div class="badge">🏊 30 Treinos Prontos</div>
      <div class="titulo">Treinos de<br>Natação</div>
      <div class="sub">Do primeiro mergulho à prova — 30 treinos prontos, do iniciante ao avançado. É só chegar na borda e aplicar.</div>
    </div>
    <div class="mascotes" style="z-index:1">${ms.map(m=>m?`<img src="${m}"/>`:'').join('')}</div>
    <div style="z-index:1;text-align:center">
      <div class="niv-leg">${leg}</div>
      <div class="rodape" style="margin-top:5mm">por ${esc(AUTOR)}</div>
    </div>
  </body></html>`;
}

function htmlSumario(indice) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    @page{size:A4;margin:0} *{margin:0;padding:0;box-sizing:border-box}
    @font-face{font-family:'Gagalin';src:url(data:font/otf;base64,${GAGALIN}) format('opentype')}
    body{width:210mm;height:297mm;font-family:'Nunito','Segoe UI',Arial,sans-serif;color:#1a1a2e;padding:13mm 15mm;background:#fff;overflow:hidden}
    h1{font-family:'Gagalin';font-size:22pt;color:#0c4a6e;margin-bottom:1mm}
    .leg{font-size:9.5pt;font-weight:700;color:#64748b;margin-bottom:4mm}
    .sec{margin-bottom:2.6mm;break-inside:avoid}
    .sec-h{display:flex;align-items:center;gap:3mm;font-family:'Gagalin';font-size:11pt;color:#fff;padding:1.3mm 5mm;border-radius:8px}
    .lin{display:flex;align-items:baseline;justify-content:space-between;padding:0.9mm 2mm 0.9mm 8mm;border-bottom:1px dotted #ccd}
    .lin .t{font-size:9.5pt;font-weight:700;color:#23304a}
    .lin .pg{font-family:'Gagalin';font-size:9.5pt;color:#64748b}
  </style></head><body>
    <h1>Sumário</h1>
    <div class="leg">Os 30 treinos, organizados pela progressão de nível</div>
    ${indice.map(s=>`<div class="sec">
      <div class="sec-h" style="background:linear-gradient(90deg,${s.niv.p},${s.niv.s})">🏊 Nível ${esc(s.niv.rotulo)} · ${s.itens.length} treinos</div>
      ${s.itens.map(it=>`<div class="lin"><span class="t">${esc(it.titulo)}</span><span class="pg">${it.pagina}</span></div>`).join('')}
    </div>`).join('')}
  </body></html>`;
}

// índice cruzado: por OBJETIVO de treino (cada treino aparece pela página)
const OBJETIVOS = [
  { icone:'🌊', nome:'Adaptação & Segurança', desc:'Vencer o medo, respirar, flutuar e estar seguro na água',
    titulos:['Perdendo o Medo da Água','Bolhas e Borbulhas','Estrela e Foguete','Mergulho do Patinho','Flutuar, Virar e Respirar'] },
  { icone:'🎯', nome:'Técnica & Estilos', desc:'Aprender e lapidar crawl, costas, peito e borboleta',
    titulos:['A Primeira Batida de Pernas','Costas sem Afundar','Deslize com Pernada','Os Primeiros Braços de Crawl','Cotovelo Alto, Braçada Longa','Peito: Puxa, Respira, Desliza','Costas Reta como uma Régua','Borboleta sem Medo','Pernada de Peito Afiada','Circuito de Educativos','Medley: Domando os 4 Estilos'] },
  { icone:'🫁', nome:'Respiração & Coordenação', desc:'Juntar braço, perna e respiração num nado contínuo',
    titulos:['Meus Primeiros 25 Metros','Respiração dos Dois Lados','A Virada que Não Para o Treino','Saída de Bloco e Primeiros 15m'] },
  { icone:'💪', nome:'Resistência & Base', desc:'Fôlego, volume aeróbico e economia de nado',
    titulos:['Resistência: 400 sem Parar','No Limiar','O Longão Aeróbico','Força na Água: Palmar e Pull'] },
  { icone:'⚡', nome:'Velocidade & Prova', desc:'Tiros, pace, lactato e simulado de competição',
    titulos:['O Gostinho da Velocidade','Tiros de 25: Pura Velocidade','Pace de Prova: O Cronômetro Manda','VO2: A Caixa Vermelha','Simulado de Prova: 100m Pra Valer','Tolerância ao Lactato: Os 50 Bravos'] },
];
function htmlIndice(pagPorTitulo) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    @page{size:A4;margin:0} *{margin:0;padding:0;box-sizing:border-box}
    @font-face{font-family:'Gagalin';src:url(data:font/otf;base64,${GAGALIN}) format('opentype')}
    body{width:210mm;height:297mm;font-family:'Nunito','Segoe UI',Arial,sans-serif;color:#1a1a2e;padding:13mm 15mm;background:#fff;overflow:hidden}
    h1{font-family:'Gagalin';font-size:22pt;color:#0c4a6e;margin-bottom:1mm}
    .leg{font-size:9.5pt;font-weight:700;color:#64748b;margin-bottom:4mm}
    .grupo{margin-bottom:2.4mm;break-inside:avoid;border:1.5px solid #0284c733;border-radius:11px;padding:2.4mm 4mm;background:#fff}
    .gh{font-family:'Gagalin';font-size:11pt;color:#0284c7;text-transform:uppercase;letter-spacing:.3px}
    .gd{font-size:8.5pt;font-weight:700;color:#7c8aa5;margin-bottom:1.4mm}
    .item{display:inline-flex;align-items:baseline;gap:1.5mm;margin:0.6mm 4mm 0.6mm 0;font-size:9pt;font-weight:700;color:#23304a}
    .item .pg{font-family:'Gagalin';font-size:8.5pt;color:#0284c7}
  </style></head><body>
    <h1>Índice por Objetivo</h1>
    <div class="leg">Precisa de um treino com foco específico? Ache por aqui — pula direto pra página.</div>
    ${OBJETIVOS.map(g=>`<div class="grupo">
      <div class="gh">${g.icone} ${esc(g.nome)}</div>
      <div class="gd">${esc(g.desc)}</div>
      <div>${g.titulos.map(t=>`<span class="item">${esc(t)} <span class="pg">p.${pagPorTitulo[t]||'—'}</span></span>`).join('')}</div>
    </div>`).join('')}
  </body></html>`;
}

// manual de uso (2 páginas)
function htmlManual1() {
  const passo = (n,t,d)=>`<div style="display:flex;gap:4mm;align-items:flex-start;margin-bottom:3mm"><div style="flex:0 0 auto;width:9mm;height:9mm;border-radius:50%;background:#0284c7;color:#fff;font-family:'Gagalin';font-size:12pt;display:flex;align-items:center;justify-content:center">${n}</div><div style="flex:1"><div style="font-family:'Gagalin';font-size:11pt;color:#0284c7;text-transform:uppercase;margin-bottom:.5mm">${esc(t)}</div><div style="font-size:9.7pt;font-weight:600;color:#333;line-height:1.45">${d}</div></div></div>`;
  const bloco = (rot,d)=>`<div style="display:flex;gap:3mm;padding:1.6mm 0;border-bottom:1px solid #eef0f6"><div style="flex:0 0 auto;width:42mm;font-family:'Gagalin';font-size:9pt;color:#0284c7;text-transform:uppercase">${esc(rot)}</div><div style="flex:1;font-size:9.3pt;font-weight:600;color:#444;line-height:1.4">${d}</div></div>`;
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    @page{size:A4;margin:0} *{margin:0;padding:0;box-sizing:border-box}
    @font-face{font-family:'Gagalin';src:url(data:font/otf;base64,${GAGALIN}) format('opentype')}
    body{width:210mm;height:297mm;font-family:'Nunito','Segoe UI',Arial,sans-serif;color:#1a1a2e;padding:14mm 15mm;background:linear-gradient(165deg,#0284c712 0%,#fff 55%,#38bdf81c 100%);overflow:hidden}
    h1{font-family:'Gagalin';font-size:22pt;color:#0284c7}
    h1s{font-size:10.5pt;font-weight:700;color:#566}
    .card{border:2px solid #0284c73a;border-radius:14px;background:#fff;padding:3.4mm 4.4mm;margin-top:4mm;box-shadow:0 2px 0 #0284c720,0 4px 9px rgba(20,40,80,.06)}
    .ch{font-family:'Gagalin';font-size:11.5pt;color:#0284c7;text-transform:uppercase;letter-spacing:.4px;margin-bottom:2mm}
  </style></head><body>
    <h1>Como Usar Este Pack</h1>
    <div style="font-size:10.5pt;font-weight:700;color:#566;margin-top:1mm">Um guia rápido pra tirar o máximo dos 30 treinos</div>
    <div class="card">
      <div class="ch">Como o pack é organizado</div>
      <div style="font-size:9.8pt;font-weight:600;color:#333;line-height:1.55">São <b>30 treinos prontos</b>, divididos em 3 níveis de <b>10 treinos cada</b>. Cada nível tem sua cor: <b style="color:#06b6d4">Iniciante (ciano)</b>, <b style="color:#2563eb">Intermediário (azul)</b> e <b style="color:#1e3a8a">Avançado (azul-marinho)</b>. Use o <b>Sumário</b> pra navegar por nível e o <b>Índice por Objetivo</b> pra achar um treino com foco específico (técnica, resistência, velocidade...).</div>
    </div>
    <div class="card">
      <div class="ch">Passo a passo</div>
      ${passo(1,'Identifique o nível do aluno','Na dúvida, comece no nível abaixo. É melhor reforçar a base do que pular etapa (veja o bônus "Guia de Progressão").')}
      ${passo(2,'Escolha o treino','Pelo Sumário (por nível) ou pelo Índice por Objetivo, conforme o foco do dia.')}
      ${passo(3,'Leve a ficha pra beira da piscina','Cada treino cabe em 1 página. Imprima ou abra no celular — é só seguir a estrutura.')}
      ${passo(4,'Ajuste com as Variações','Toda ficha traz "mais fácil", "mais difícil" e "em grupo". Adapte ao aluno na hora.')}
    </div>
    <div class="card">
      <div class="ch">Como ler uma ficha de treino</div>
      ${bloco('🎯 Objetivo','O que aquele treino desenvolve e por quê.')}
      ${bloco('🏊 Equipamentos','O que separar antes (prancha, pull buoy, óculos...).')}
      ${bloco('🌊 Estrutura do Treino','O passo a passo: aquecimento → parte principal → soltura, com as séries.')}
      ${bloco('⭐ Variações','Como deixar mais fácil, mais difícil ou em grupo.')}
      ${bloco('✅ O Que Observar','Os pontos pra corrigir enquanto o aluno nada.')}
      ${bloco('💡 Dica do Técnico','O macete prático de quem já deu muita aula.')}
    </div>
  </body></html>`;
}
function htmlManual2() {
  const semanaRow = (nivel, cor, dias) => `<div style="display:flex;gap:3mm;align-items:center;padding:2mm 0;border-bottom:1px solid #eef0f6">
    <div style="flex:0 0 auto;width:30mm;font-family:'Gagalin';font-size:9.5pt;color:${cor};text-transform:uppercase">${esc(nivel)}</div>
    <div style="flex:1;font-size:9.3pt;font-weight:600;color:#444;line-height:1.4">${dias}</div></div>`;
  const termo = (t,d)=>`<div style="padding:1.3mm 0;font-size:9.2pt;line-height:1.4"><b style="color:#0284c7">${esc(t)}:</b> <span style="font-weight:600;color:#444">${d}</span></div>`;
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    @page{size:A4;margin:0} *{margin:0;padding:0;box-sizing:border-box}
    @font-face{font-family:'Gagalin';src:url(data:font/otf;base64,${GAGALIN}) format('opentype')}
    body{width:210mm;height:297mm;font-family:'Nunito','Segoe UI',Arial,sans-serif;color:#1a1a2e;padding:14mm 15mm;background:linear-gradient(165deg,#0284c712 0%,#fff 55%,#38bdf81c 100%);overflow:hidden}
    h1{font-family:'Gagalin';font-size:22pt;color:#0284c7}
    .card{border:2px solid #0284c73a;border-radius:14px;background:#fff;padding:3.4mm 4.4mm;margin-top:4mm;box-shadow:0 2px 0 #0284c720,0 4px 9px rgba(20,40,80,.06)}
    .ch{font-family:'Gagalin';font-size:11.5pt;color:#0284c7;text-transform:uppercase;letter-spacing:.4px;margin-bottom:2mm}
    .dica{background:#0284c7;border-radius:13px;color:#fff;padding:4mm 5mm;font-size:9.8pt;font-weight:600;line-height:1.5;margin-top:4mm}
    .dica b{display:block;font-family:'Gagalin';font-size:10.5pt;margin-bottom:1.3mm;text-transform:uppercase}
  </style></head><body>
    <h1>Montando a Semana de Treinos</h1>
    <div style="font-size:10.5pt;font-weight:700;color:#566;margin-top:1mm">Sugestões de quantos treinos por semana, por nível</div>
    <div class="card">
      <div class="ch">Quantas vezes por semana</div>
      ${semanaRow('Iniciante','#06b6d4','2 aulas/semana. Repita cada treino 2–3 vezes antes de avançar — criança e adulto iniciante aprendem por repetição.')}
      ${semanaRow('Intermediário','#2563eb','2 a 3 aulas/semana. Alterne foco técnico e foco de resistência ao longo da semana.')}
      ${semanaRow('Avançado','#1e3a8a','4 a 6 sessões/semana. Regra de ouro: no máximo 1–2 treinos fortes (VO2/lactato) por semana; o resto é base e técnica.')}
    </div>
    <div class="card">
      <div class="ch">Regras de ouro pra qualquer treino</div>
      <div style="font-size:9.7pt;font-weight:600;color:#333;line-height:1.6">• <b>Sempre aqueça e faça a soltura</b> — elas não são opcionais, previnem lesão e fixam a técnica.<br>• <b>Técnica antes de velocidade</b> — nadar bonito vem antes de nadar rápido.<br>• <b>Segurança sempre</b> — nunca tire o olho de aluno na água; respeite a profundidade certa pra cada nível.<br>• <b>Hidrate</b> — sim, dá sede dentro da água. Tenha uma pausa pra água no treino.</div>
    </div>
    <div class="card">
      <div class="ch">Glossário rápido</div>
      <div style="display:flex;gap:6mm"><div style="flex:1">
        ${termo('Crawl','Nado livre, de bruços, braçadas alternadas')}
        ${termo('Streamline','Posição de flecha: corpo alinhado, braços esticados')}
        ${termo('Pernada','Batida das pernas (o "motor" do nado)')}
        ${termo('Prancha','Flutuador pra isolar a pernada')}
        ${termo('Pull buoy','Flutuador entre as pernas pra isolar a braçada')}
        ${termo('Palmar','Palmar/paddle: prancheta na mão, mais força')}
      </div><div style="flex:1">
        ${termo('Educativo / drill','Exercício que treina uma parte do nado')}
        ${termo('Pace','Ritmo de nado (tempo por distância)')}
        ${termo('Split','Tempo parcial de cada trecho da prova')}
        ${termo('Limiar','Ritmo forte que dá pra sustentar')}
        ${termo('VO2 máx.','Intensidade máxima aeróbica (treino que "dói")')}
        ${termo('Negative split','2ª metade mais rápida que a 1ª')}
      </div></div>
    </div>
    <div class="dica"><b>💡 Dica final</b>Não precisa seguir os treinos em ordem fechada. Monte a semana misturando objetivos (um dia técnica, outro resistência) e use o Índice por Objetivo como cardápio. O importante é a constância.</div>
  </body></html>`;
}

// ───────────────────── render helpers ─────────────────────
async function htmlToPdf(browser, html) {
  const page = await browser.newPage();
  await page.setViewport({ width:794, height:1123 });
  await page.setContent(html, { waitUntil:'networkidle0', timeout:60000 });
  await new Promise(r=>setTimeout(r,300));
  const buf = await page.pdf({ format:'A4', printBackground:true, margin:{top:0,right:0,bottom:0,left:0} });
  await page.close();
  return buf;
}
// troca a mascote encolhida pela PNG HD (mesma da página); silencioso se faltar python
function swapHD(pdfBuf, pngPath) {
  if (!fs.existsSync(pngPath)) return pdfBuf;
  const inP = path.join(TMP, 'in.pdf'), outP = path.join(TMP, 'out.pdf');
  fs.writeFileSync(inP, pdfBuf);
  for (const bin of [process.env.PYTHON_BIN,'python','python3'].filter(Boolean)) {
    try { cp.execFileSync(bin, [path.join(__dirname,'replace-mascote.py'), inP, pngPath, outP], { stdio:'ignore', timeout:60000 });
      const r = fs.readFileSync(outP); fs.unlinkSync(inP); fs.unlinkSync(outP); return r; } catch(e){}
  }
  try { fs.unlinkSync(inP); } catch(_){}
  return pdfBuf;
}

// reaproveitável por gerar-volumes-natacao.js
module.exports = { NIVEIS, TREINOS, htmlFicha, htmlToPdf, swapHD, mascFile, masc, GAGALIN, esc, b64, AUTOR };

if (require.main === module) (async () => {
  console.log(`>>> Montando pack de natação — ${TREINOS.length} treinos`);
  // ordem das páginas: capa(1) · manual(2,3) · sumário(4) · índice(5) · treinos(6..)
  const PRIM = 6;
  const indiceMap = {};
  const pagPorTitulo = {};
  TREINOS.forEach((t,i)=>{ (indiceMap[t.nivel] = indiceMap[t.nivel]||{niv:NIVEIS[t.nivel],itens:[]}).itens.push({ titulo:t.titulo, pagina:PRIM+i }); pagPorTitulo[t.titulo] = PRIM+i; });
  const indice = Object.keys(NIVEIS).map(k=>indiceMap[k]).filter(Boolean);

  const browser = await puppeteer.launch({ headless:'new', args:['--no-sandbox','--disable-setuid-sandbox'] });
  console.log('  capa + manual + sumário + índice...');
  const capaPdf = await htmlToPdf(browser, htmlCapa());
  const man1Pdf = await htmlToPdf(browser, htmlManual1());
  const man2Pdf = await htmlToPdf(browser, htmlManual2());
  const sumPdf  = await htmlToPdf(browser, htmlSumario(indice));
  const idxPdf  = await htmlToPdf(browser, htmlIndice(pagPorTitulo));

  const fichaPdfs = [];
  for (let i=0;i<TREINOS.length;i++) {
    const t = TREINOS[i];
    process.stdout.write(`  treino ${i+1}/${TREINOS.length} (${t.nivel})... `);
    let buf = await htmlToPdf(browser, htmlFicha(t, PRIM+i));
    buf = swapHD(buf, mascFile(t.nivel));   // mascote HD dentro do PDF
    fichaPdfs.push(buf);
    console.log('ok');
  }
  await browser.close();

  console.log('  juntando PDF...');
  const final = await PDFDocument.create();
  for (const buf of [capaPdf, man1Pdf, man2Pdf, sumPdf, idxPdf, ...fichaPdfs]) {
    const src = await PDFDocument.load(buf);
    const pgs = await final.copyPages(src, src.getPageIndices());
    pgs.forEach(p=>final.addPage(p));
  }
  const dest = path.join(OUT, 'pack-natacao-30-treinos.pdf');
  fs.writeFileSync(dest, await final.save());
  // compacta (junta imagens repetidas sem perder qualidade)
  try {
    const tmp = dest.replace('.pdf','_otim.pdf');
    const py = 'import fitz,sys; d=fitz.open(sys.argv[1]); d.save(sys.argv[2], garbage=4, deflate=True, clean=True)';
    for (const bin of [process.env.PYTHON_BIN,'python','python3'].filter(Boolean)) {
      try { cp.execFileSync(bin, ['-c', py, dest, tmp], { stdio:'ignore', timeout:120000 }); fs.renameSync(tmp, dest); break; } catch(e){}
    }
  } catch(_){}
  try { fs.rmSync(TMP, { recursive:true, force:true }); } catch(_){}
  const mb = Math.round(fs.statSync(dest).size/1024/1024*10)/10;
  console.log(`\nPRONTO: ${dest}  (${final.getPageCount()} páginas, ${mb}MB)`);
  process.exit(0);
})().catch(e=>{ console.error('ERRO:', e.message); process.exit(1); });
