const fs = require('fs');
const path = require('path');

const conceitos = [
  { nome:'Algoritmo',    cor:'#E84393', bg:'#FCE4EC', dark:'#880E4F' },
  { nome:'Sequência',    cor:'#FF6D00', bg:'#FFF3E0', dark:'#BF360C' },
  { nome:'Lógica',       cor:'#7B1FA2', bg:'#F3E5F5', dark:'#4A148C' },
  { nome:'Repetição',    cor:'#C62828', bg:'#FFEBEE', dark:'#7F0000' },
  { nome:'Padrão',       cor:'#2E7D32', bg:'#E8F5E9', dark:'#1B5E20' },
  { nome:'Decomposição', cor:'#F57F17', bg:'#FFF8E1', dark:'#E65100' },
];

const adaptDicas = {
  'Algoritmo':     'Divida em no máximo 3 passos por vez. Use imagens no lugar de texto. Demonstre o algoritmo completo antes de pedir que execute. Prefira situações do cotidiano concreto: escovar dentes, fazer lanche.',
  'Sequência':     'Reduza para 3–4 elementos no início. Numere cada cartão visualmente. Use fotos reais da rotina escolar — a familiaridade reduz a carga cognitiva.',
  'Lógica':        'Apenas afirmações literais e concretas — sem ironia, sem duplo sentido. Apresente uma condição por vez (SE... ENTÃO...) antes de combinar. Use objetos físicos para representar cada elemento.',
  'Repetição':     'Avise o número exato antes de começar: "Vamos fazer 4 vezes." Conte em voz alta. Nunca diga "mais um pouquinho" — seja preciso.',
  'Padrão':        'Use no máximo 2 elementos (2 cores ou 2 formas). Sempre em linha reta, nunca em grade. Alunos com TEA frequentemente se destacam aqui — use para construir confiança.',
  'Decomposição':  'Comece com objetos físicos reais. Limite a 4 partes identificáveis. Conecte com situações reais como organizar a mochila para criar autonomia.',
};

const atividades = [
  { id:1,  c:0, nivel:'🟢 Fácil',   nome:'A Receita do Sanduíche',
    mat:['Cartões com figuras (pão, presunto, queijo)','Mesa plana'],
    ps:['Coloque os cartões embaralhados na mesa.','Ordene os cartões para montar o sanduíche na sequência certa.','Mostre a ordem final para a professora e diga cada passo em voz alta.'],
    dica:'Reduza para 3 cartões. Se necessário, deixe um modelo montado ao lado como referência visual.', bncc:'EF15CO01' },
  { id:2,  c:0, nivel:'🟢 Fácil',   nome:'Programando o Robô Humano',
    mat:['Fita crepe no chão (forma um caminho)','Folha com setas para preencher'],
    ps:['Olhe o caminho marcado no chão com a fita.','Escreva as setas (→ ↑ ↓) para guiar o robô do início até o X.','Teste o caminho caminhando e seguindo as setas que você escreveu.'],
    dica:'Marque cada passo com uma cor diferente de fita. Demonstre o percurso completo antes de pedir que faça.', bncc:'EF15CO01' },
  { id:3,  c:0, nivel:'🟡 Médio',   nome:'Algoritmo da Escovação',
    mat:['Folha em branco','Lápis','Imagens de boca e escova já recortadas'],
    ps:['Ordene as imagens para mostrar como escovar os dentes corretamente.','Numere cada imagem de 1 a 5 na ordem certa.','Troque com um colega: ele deve seguir seus passos e dizer se faria igual.'],
    dica:'Forneça as imagens já recortadas — o aluno só precisa ordenar, sem precisar desenhar ou recortar.', bncc:'EF15CO01' },
  { id:4,  c:0, nivel:'🟡 Médio',   nome:'A Máquina de Fazer Suco',
    mat:['Cartões de ação (lavar, cortar, espremer, coar, servir)','Folha de registro'],
    ps:['Ordene os 5 cartões para fazer o suco do começo ao fim.','Leia em voz alta cada passo na ordem escolhida.','Marque qual passo NÃO pode ser trocado de lugar com outro.'],
    dica:'Use imagens nos cartões, não só texto. Limite a 4 cartões se o aluno ainda está no início.', bncc:'EF15CO02' },
  { id:5,  c:0, nivel:'🔴 Desafio', nome:'Algoritmo dos Semáforos',
    mat:['Círculos coloridos (vermelho, amarelo, verde)','Folha de registro'],
    ps:['Monte o algoritmo: escreva qual cor acende depois de qual.','Escreva a regra: SE vermelho ENTÃO pare. SE verde ENTÃO ande.','Teste com um colega: um é o semáforo, o outro é o carro.'],
    dica:'Comece com apenas 2 estados (vermelho/verde). Inclua o amarelo somente depois.', bncc:'EF15CO03' },
  { id:6,  c:1, nivel:'🟢 Fácil',   nome:'Vestindo o Astronauta',
    mat:['Cartões com roupas (macacão, capacete, luvas, botas, cueca)','Mesa plana'],
    ps:['Pegue os 5 cartões embaralhados.','Coloque na ordem em que o astronauta precisa se vestir.','Explique por que o capacete não pode ser o primeiro item.'],
    dica:'Use figuras grandes e claras. Comece com 3 peças apenas: macacão, capacete, luvas.', bncc:'EF15CO01' },
  { id:7,  c:1, nivel:'🟢 Fácil',   nome:'A Sequência da Planta',
    mat:['4 cartões: semente, broto, planta pequena, planta grande','Cola e folha A4'],
    ps:['Olhe os 4 cartões fora de ordem.','Ordene do começo ao fim do crescimento da planta.','Cole na folha A4 na ordem certa, deixando espaço entre cada imagem.'],
    dica:'Numere levemente as costas dos cartões para que o aluno possa conferir sozinho sem precisar perguntar.', bncc:'EF15CO01' },
  { id:8,  c:1, nivel:'🟡 Médio',   nome:'Dançando em Sequência',
    mat:['Cartões com movimentos (palma, giro, pulo, agacha)','Espaço livre para movimentar'],
    ps:['A professora mostra uma sequência de 3 movimentos devagar contando em voz alta.','Repita a mesma sequência na mesma ordem.','Crie sua própria sequência de 3 movimentos e ensine para a professora.'],
    dica:'Sempre demonstre enquanto conta em voz alta. Evite música de fundo — foque apenas nos movimentos.', bncc:'EF15CO01' },
  { id:9,  c:1, nivel:'🟡 Médio',   nome:'A Fila da Cantina',
    mat:['6 cartões com situações da fila','Folha de registro'],
    ps:['Leia os 6 cartões com situações da fila da cantina.','Ordene do primeiro ao último da fila.','Marque qual situação quebra a sequência e escreva por que.'],
    dica:'Leia cada cartão em voz alta enquanto o aluno segura o cartão — o toque ajuda na fixação.', bncc:'EF15CO02' },
  { id:10, c:1, nivel:'🔴 Desafio', nome:'Sequência Quebrada',
    mat:['Tira de papel com 5 ações + 1 erro','Tesoura e cola'],
    ps:['Leia a sequência impressa na tira com atenção.','Encontre o passo que está fora da ordem correta.','Recorte e cole esse passo na posição certa da sequência.'],
    dica:'Sugira marcar com lápis o passo suspeito antes de recortar. Nunca imponha limite de tempo.', bncc:'EF15CO02' },
  { id:11, c:2, nivel:'🟢 Fácil',   nome:'Qual é o Intruso?',
    mat:['Cartões com 4 imagens (3 da mesma categoria + 1 diferente)'],
    ps:['Coloque os 4 cartões visíveis na mesa.','Aponte o cartão que é diferente dos outros 3.','Diga em voz alta uma palavra que explique por que ele é diferente.'],
    dica:'Use categorias visuais muito claras: 3 animais + 1 fruta. Um único critério de diferença — sem dupla interpretação.', bncc:'EF15CO03' },
  { id:12, c:2, nivel:'🟢 Fácil',   nome:'Verdadeiro ou Falso com Objetos',
    mat:['Objetos da sala (borracha, régua, lápis)','Cartões com V e F'],
    ps:['A professora diz uma frase sobre um objeto visível na mesa.','O aluno levanta o cartão V ou F.','O aluno explica com UMA palavra por que escolheu.'],
    dica:'Comece com afirmações óbvias e concretas: "A borracha é azul." Sem abstrações, sem negações duplas.', bncc:'EF15CO03' },
  { id:13, c:2, nivel:'🟡 Médio',   nome:'O Jogo das Pistas',
    mat:['3 cartões de pistas escritas simples','Imagem-resposta virada para baixo'],
    ps:['Leia a pista 1 em voz alta e pense no que pode ser.','Leia a pista 2. Tente adivinhar o objeto.','Leia a pista 3 para confirmar. Vire a imagem e veja se acertou.'],
    dica:'Mostre uma pista de cada vez — nunca as três juntas. Cada cartão separado evita sobrecarga de informação.', bncc:'EF15CO03' },
  { id:14, c:2, nivel:'🟡 Médio',   nome:'SE... ENTÃO com Semáforos',
    mat:['Cartões coloridos (vermelho e verde)','Situações impressas — uma por cartão'],
    ps:['Leia a situação impressa no cartão.','Complete mentalmente: SE [condição] ENTÃO [ação].','Levante o cartão verde se a ação é correta ou vermelho se é errada.'],
    dica:'Mantenha as frases curtas e simples. Sem condições compostas (SE...E...ENTÃO) nesta etapa.', bncc:'EF15CO03' },
  { id:15, c:2, nivel:'🔴 Desafio', nome:'Classificando por 2 Critérios',
    mat:['12 cartões com formas geométricas coloridas e de tamanhos variados','Espaço na mesa para 4 grupos'],
    ps:['Primeiro: separe os cartões apenas por cor — 2 pilhas.','Segundo: dentro de cada pilha, separe por tamanho — 4 grupos.','Conte os cartões em cada grupo e escreva o número.'],
    dica:'Faça passo a passo — primeiro só cor, depois refaça incluindo tamanho. Nunca os dois critérios ao mesmo tempo.', bncc:'EF15CO03' },
  { id:16, c:3, nivel:'🟢 Fácil',   nome:'O Carimbo Repetido',
    mat:['Carimbo simples (ou dedo com tinta)','Folha A4 branca','Tinta colorida'],
    ps:['Carimbe 1 vez no início da linha superior da folha.','Repita o mesmo carimbo 5 vezes seguidos na mesma linha.','Conte em voz alta: 1, 2, 3, 4, 5.'],
    dica:'Ofereça luvas descartáveis se o aluno tiver hipersensibilidade tátil. Prefira carimbo de cabo em vez de dedo.', bncc:'EF15CO02' },
  { id:17, c:3, nivel:'🟢 Fácil',   nome:'Repetindo o Movimento',
    mat:['Espaço livre — sem material adicional'],
    ps:['A professora faz um gesto simples (bater palma uma vez).','Repita o mesmo gesto 4 vezes contando em voz alta.','Invente um gesto novo e peça que a turma repita 3 vezes.'],
    dica:'Avise antes: "Vou mostrar um gesto. Você vai repetir 4 vezes. Pronto?" Confirme o número antes de começar.', bncc:'EF15CO02' },
  { id:18, c:3, nivel:'🟡 Médio',   nome:'A Corrente de Papel',
    mat:['Tiras de papel azul e vermelho (8 de cada)','Cola ou grampeador'],
    ps:['Faça um elo fechado com a tira azul.','Passe a tira vermelha pelo elo azul e feche.','Repita: azul, vermelho, azul, vermelho até usar todas as tiras.'],
    dica:'Monte o primeiro par junto com o aluno e deixe o modelo visual ao lado durante toda a atividade.', bncc:'EF15CO02' },
  { id:19, c:3, nivel:'🟡 Médio',   nome:'Loop da Rotina Escolar',
    mat:['Cartões com atividades diárias (chegada, aula, recreio, almoço, saída)','Relógio de papel'],
    ps:['Ordene os cartões da rotina escolar do começo ao fim do dia.','Aponte qual atividade se repete todos os dias sem exceção.','Escreva na folha: "Todo dia eu repito: _____".'],
    dica:'Use a rotina real da escola do aluno — a familiaridade com o conteúdo reduz ansiedade e aumenta engajamento.', bncc:'EF15CO02' },
  { id:20, c:3, nivel:'🔴 Desafio', nome:'Programando o Loop',
    mat:['Folha de registro','Lápis e régua'],
    ps:['Escreva na folha: REPITA 3 VEZES: [escreva a ação aqui].','Desenhe as 3 repetições da ação em 3 quadrinhos seguidos.','Mude para REPITA 5 VEZES e refaça — mostre os 5 quadrinhos.'],
    dica:'Desenhe uma seta circular ao lado de "repetir" para tornar o conceito mais visual e concreto.', bncc:'EF15CO02' },
  { id:21, c:4, nivel:'🟢 Fácil',   nome:'Copiando o Padrão de Cores',
    mat:['Blocos ou papéis coloridos: vermelho e azul (6 de cada)','Mesa plana'],
    ps:['Olhe a sequência na mesa: azul, vermelho, azul, vermelho...','Continue a sequência com as peças restantes.','Diga em voz alta qual cor vem depois da última peça colocada.'],
    dica:'Use apenas 2 cores no início. Alinhe as peças em linha reta — nunca em grade.', bncc:'EF15CO03' },
  { id:22, c:4, nivel:'🟢 Fácil',   nome:'Padrões no Corpo',
    mat:['Sem material — apenas espaço livre'],
    ps:['A professora bate o padrão: palma, joelho, palma, joelho.','Repita o padrão junto com a professora.','Diga em voz alta: o que vem depois de "joelho"?'],
    dica:'Se o barulho incomodar, substitua por movimentos silenciosos: levantar o braço direito, depois o esquerdo.', bncc:'EF15CO03' },
  { id:23, c:4, nivel:'🟡 Médio',   nome:'Padrão no Papel Quadriculado',
    mat:['Folha quadriculada','Lápis de cor azul e vermelho'],
    ps:['Pinte o quadrado 1 de azul e o quadrado 2 de vermelho.','Continue o padrão até o quadrado 10.','Diga qual seria a cor do quadrado 15 sem precisar pintar até lá.'],
    dica:'Numere os quadrados levemente com lápis antes de começar — facilita a contagem e reduz erros de posição.', bncc:'EF15CO03' },
  { id:24, c:4, nivel:'🟡 Médio',   nome:'Encontrando o Padrão Errado',
    mat:['Tira impressa com padrão de formas + 1 elemento errado','Lápis'],
    ps:['Olhe a tira com atenção e identifique o padrão que se repete.','Encontre o elemento que quebrou o padrão.','Circule com lápis e escreva ao lado o que deveria estar no lugar.'],
    dica:'Coloque a tira na frente do aluno e não dê dicas sobre onde está o erro. Dê tempo para processar.', bncc:'EF15CO03' },
  { id:25, c:4, nivel:'🔴 Desafio', nome:'Criando Meu Padrão',
    mat:['8 cartões em branco','Lápis de cor (2 cores à escolha)'],
    ps:['Escolha 2 formas ou 2 cores.','Crie um padrão usando os 8 cartões.','Apresente seu padrão para a professora e explique a regra.'],
    dica:'Se o trabalho em dupla causar ansiedade, faça individualmente — cada um cria e apresenta apenas para a professora.', bncc:'EF15CO03' },
  { id:26, c:5, nivel:'🟢 Fácil',   nome:'Desmontando o Sanduíche',
    mat:['Imagem de sanduíche completo','Cartões com cada ingrediente separado'],
    ps:['Olhe a imagem do sanduíche completo.','Separe os cartões de cada parte: pão, queijo, presunto, alface, tomate.','Conte em voz alta quantas partes o sanduíche tem.'],
    dica:'Use imagens reais de alimentos — mais fácil de identificar do que desenhos estilizados.', bncc:'EF15CO02' },
  { id:27, c:5, nivel:'🟢 Fácil',   nome:'As Partes da Escola',
    mat:['Planta simples da escola','Lápis de cor'],
    ps:['Olhe a planta da escola.','Escreva 4 partes que você consegue identificar (sala, banheiro, pátio, refeitório).','Circule a parte que você usa com mais frequência durante o dia.'],
    dica:'Se possível, faça uma breve visita antes da atividade — a memória visual do espaço real ajuda muito.', bncc:'EF15CO02' },
  { id:28, c:5, nivel:'🟡 Médio',   nome:'Decompondo a Tarefa de Casa',
    mat:['Uma tarefa de casa real do aluno','Lápis','4 post-its coloridos'],
    ps:['Leia a tarefa de casa completa com atenção.','Escreva cada parte menor da tarefa em um post-it separado.','Coloque os post-its na ordem em que você vai fazer cada parte.'],
    dica:'Limite a tarefas com no máximo 4 etapas identificáveis. Muito eficaz para criar autonomia no dia a dia.', bncc:'EF15CO02' },
  { id:29, c:5, nivel:'🟡 Médio',   nome:'Planejando a Festa',
    mat:['Folha de planejamento impressa com espaços para preencher','Lápis'],
    ps:['Leia o objetivo: "Organizar uma festa de aniversário simples".','Escreva 4 tarefas menores que precisam ser feitas para isso.','Marque qual tarefa precisa ser feita primeiro e por que.'],
    dica:'Use exemplos de festas que o aluno conhece — situações concretas e familiares eliminam a abstração.', bncc:'EF15CO02' },
  { id:30, c:5, nivel:'🔴 Desafio', nome:'Construindo o Robô por Partes',
    mat:['Folha com imagem de robô completo','Papel em branco','Lápis'],
    ps:['Olhe o robô completo e identifique 5 partes diferentes.','Escreva o nome de cada parte ao lado da imagem.','Desenhe cada parte separada na folha em branco.'],
    dica:'Forneça os nomes das partes por escrito ao lado da imagem — o aluno não precisa memorizar, apenas identificar.', bncc:'EF15CO02' },
];

const roteiros = [
  { id:1,  c:0, nome:'Receita do Sanduíche',   ps:[{i:'🃏',l:'Pegar cartões'},{i:'🔀',l:'Embaralhar'},{i:'🔢',l:'Ordenar'},{i:'✅',l:'Conferir'},{i:'🗣️',l:'Apresentar'}] },
  { id:2,  c:0, nome:'Robô Humano',            ps:[{i:'👀',l:'Ver o caminho'},{i:'✏️',l:'Desenhar setas'},{i:'🚶',l:'Caminhar'},{i:'✅',l:'Conferir'}] },
  { id:3,  c:2, nome:'Qual é o Intruso?',      ps:[{i:'🃏',l:'Ver os 4 cartões'},{i:'🔍',l:'Comparar'},{i:'👆',l:'Apontar o diferente'},{i:'🗣️',l:'Explicar'}] },
  { id:4,  c:3, nome:'Carimbo Repetido',       ps:[{i:'🖐️',l:'Preparar'},{i:'1️⃣',l:'Carimbar 1x'},{i:'🔄',l:'Repetir 5x'},{i:'🔢',l:'Contar alto'}] },
  { id:5,  c:1, nome:'Sequência da Planta',    ps:[{i:'🃏',l:'Pegar cartões'},{i:'👀',l:'Observar'},{i:'🔢',l:'Ordenar 1→4'},{i:'🖊️',l:'Colar na folha'}] },
  { id:6,  c:1, nome:'Astronauta se Veste',    ps:[{i:'🃏',l:'Pegar 5 cartões'},{i:'🤔',l:'Pensar a ordem'},{i:'🔢',l:'Ordenar'},{i:'🗣️',l:'Explicar'}] },
  { id:7,  c:2, nome:'Verdadeiro ou Falso',    ps:[{i:'👂',l:'Ouvir a frase'},{i:'🤔',l:'Pensar'},{i:'🃏',l:'Levantar V ou F'},{i:'🗣️',l:'Explicar'}] },
  { id:8,  c:5, nome:'Sanduíche por Partes',   ps:[{i:'🥪',l:'Ver o sanduíche'},{i:'🃏',l:'Pegar cartões'},{i:'🔀',l:'Separar partes'},{i:'🔢',l:'Contar'}] },
  { id:9,  c:4, nome:'Padrão de Cores',        ps:[{i:'👀',l:'Ver a sequência'},{i:'🧠',l:'Identificar padrão'},{i:'➕',l:'Continuar'},{i:'🗣️',l:'Dizer próxima'}] },
  { id:10, c:3, nome:'Loop da Rotina',         ps:[{i:'🃏',l:'Ordenar rotina'},{i:'🔍',l:'Achar repetição'},{i:'✏️',l:'Escrever o loop'},{i:'✅',l:'Conferir'}] },
];

// ── FUNÇÕES ──────────────────────────────────────────────────────────────────
function nivelStyle(n) {
  if (n.includes('Fácil'))  return 'background:#C6F6D5;color:#276749';
  if (n.includes('Médio'))  return 'background:#FEF3C7;color:#92400E';
  return 'background:#FED7D7;color:#9B2C2C';
}

function card(a) {
  const c = conceitos[a.c];
  return `
<div class="atividade-card">
  <div class="atividade-topo">
    <div class="atividade-num" style="background:${c.cor}">${a.id}</div>
    <div class="atividade-info">
      <div class="atividade-nome">${a.nome}</div>
      <div class="atividade-meta">
        <span class="atividade-tag" style="${nivelStyle(a.nivel)}">${a.nivel}</span>
        <span class="atividade-tag" style="background:${c.bg};color:${c.dark}">${c.nome}</span>
      </div>
    </div>
  </div>
  <div class="atividade-corpo">
    <div class="atividade-col">
      <div class="atividade-secao-titulo">📌 Material necessário</div>
      <div class="material-lista">${a.mat.map(m=>`<div class="material-item">${m}</div>`).join('')}</div>
      <div class="bncc-tag" style="margin-top:auto">📚 BNCC: ${a.bncc}</div>
    </div>
    <div class="atividade-col">
      <div class="atividade-secao-titulo">📋 Passos (máx. 3)</div>
      ${a.ps.map((p,i)=>`<div class="passo-ativ"><div class="passo-ativ-num" style="background:${c.cor}">${i+1}</div><div class="passo-ativ-texto">${p}</div></div>`).join('')}
      <div class="dica-tea-box"><div><span class="dica-tea-label">💛 Dica TEA</span><div class="dica-tea-texto">${a.dica}</div></div></div>
    </div>
  </div>
</div>`;
}

function pgAtiv(a1, a2, pg) {
  const label = a1.c === a2.c ? conceitos[a1.c].nome : conceitos[a1.c].nome + ' & ' + conceitos[a2.c].nome;
  return `
<div class="pg pg-atividades">
  <div class="atividades-header">
    <div><div class="atividades-header-titulo">🎯 Atividades Adaptadas para TEA</div>
    <div class="atividades-header-sub">Máx. 3 passos · Linguagem direta · Sequência previsível</div></div>
    <div class="atividades-bloco-tag">${label}</div>
  </div>
  <div class="atividades-corpo">${card(a1)}${card(a2)}</div>
  <div class="pg-footer"><span>{{escola}} · {{professor}}</span><span>Kit TEA — Atividades Adaptadas</span><span>${pg} / 27</span></div>
</div>`;
}

function pgRoteiros(r1, r2, pg) {
  function rc(r) {
    const c = conceitos[r.c];
    return `<div class="roteiro-card">
  <div class="roteiro-topo">
    <div class="roteiro-num" style="color:${c.cor}">Roteiro ${r.id}</div>
    <div class="roteiro-nome">${r.nome}</div>
    <div class="roteiro-tipo" style="background:${c.bg};color:${c.dark}">${c.nome}</div>
  </div>
  <div class="roteiro-passos">
    ${r.ps.map((p,i)=>`${i>0?'<div class="roteiro-arrow">›</div>':''}<div class="roteiro-step"><div class="roteiro-step-icon" style="background:${c.bg};border-color:${c.cor}">${p.i}</div><div class="roteiro-step-num">Passo ${i+1}</div><div class="roteiro-step-label">${p.l}</div></div>`).join('')}
  </div>
</div>`;
  }
  return `
<div class="pg pg-roteiros">
  <div class="atividades-header">
    <div><div class="atividades-header-titulo">🗺️ Roteiros Visuais</div>
    <div class="atividades-header-sub">Mostre este roteiro ao aluno antes de iniciar a atividade</div></div>
    <div class="atividades-bloco-tag">Roteiros ${r1.id} e ${r2.id}</div>
  </div>
  <div class="roteiros-corpo">${rc(r1)}${rc(r2)}</div>
  <div class="pg-footer"><span>{{escola}} · {{professor}}</span><span>Kit TEA — Roteiros Visuais</span><span>${pg} / 27</span></div>
</div>`;
}

// ── MONTAR PÁGINAS 4–27 ──────────────────────────────────────────────────────
let extra = '';
// Pgs 4–18: atividades
for (let i = 0; i < 30; i += 2) extra += pgAtiv(atividades[i], atividades[i+1], 4 + i/2);

// Pgs 19–20: guia de adaptação
extra += `
<div class="pg pg-adaptacao">
  <div class="adapt-intro">
    <div class="adapt-intro-titulo">🔧 Guia de Adaptação das 500 Atividades</div>
    <div class="adapt-intro-desc">Como adaptar qualquer atividade do Kit Despluga Pro para alunos com TEA em 3 passos simples.</div>
  </div>
  <svg class="wave-sep" viewBox="0 0 794 32" preserveAspectRatio="none"><path d="M0,0 L794,0 L794,16 Q596,36 397,20 Q198,4 0,24 Z" fill="#1A202C"/><path d="M0,24 Q198,4 397,20 Q596,36 794,16 L794,32 L0,32 Z" fill="#ffffff"/></svg>
  <div class="adapt-corpo">
    <div class="adapt-3-passos">
      <div class="adapt-3-titulo">⚡ Os 3 Passos para Adaptar Qualquer Atividade</div>
      <div class="adapt-3-grid">
        <div class="adapt-passo-card"><div class="adapt-passo-num">1</div><div class="adapt-passo-titulo">Reduza os elementos</div><div class="adapt-passo-desc">Se a atividade tem 6 itens, comece com 3. Se tem 5 passos, dê 2 de cada vez. Menos estímulos = mais foco.</div></div>
        <div class="adapt-passo-card"><div class="adapt-passo-num">2</div><div class="adapt-passo-titulo">Torne visual</div><div class="adapt-passo-desc">Substitua instruções verbais por imagens ou demonstrações. Mostre sempre antes de pedir que faça.</div></div>
        <div class="adapt-passo-card"><div class="adapt-passo-num">3</div><div class="adapt-passo-titulo">Dê tempo</div><div class="adapt-passo-desc">Remova limite de tempo. Aguarde a resposta — o processamento pode levar mais alguns segundos. Isso é normal.</div></div>
      </div>
    </div>
    <div><div class="adapt-tabela-titulo" style="margin-bottom:10px">📊 O que funciona, o que adaptar e o que evitar no Kit Despluga Pro</div>
    <table class="adapt-tabela">
      <thead><tr><th>Tipo de Atividade</th><th>Status</th><th>O que fazer</th></tr></thead>
      <tbody>
        <tr><td>Atividades de sequência com cartões</td><td><span class="tag-funciona">✅ Funciona</span></td><td>Use como está. Reduza para 3–4 cartões inicialmente.</td></tr>
        <tr><td>Atividades de padrão visual</td><td><span class="tag-funciona">✅ Funciona</span></td><td>Excelente para TEA. Comece com 2 elementos antes de avançar.</td></tr>
        <tr><td>Atividades com analogias e metáforas</td><td><span class="tag-adaptar">⚠️ Adaptar</span></td><td>Substitua a metáfora por situação concreta e literal da vida do aluno.</td></tr>
        <tr><td>Atividades em grupo não estruturado</td><td><span class="tag-adaptar">⚠️ Adaptar</span></td><td>Defina o papel de cada aluno com clareza antes de começar.</td></tr>
        <tr><td>Atividades com timer visível</td><td><span class="tag-adaptar">⚠️ Adaptar</span></td><td>Substitua por avisos verbais: "faltam 5 minutos" a cada etapa.</td></tr>
        <tr><td>Atividades com música de fundo</td><td><span class="tag-evitar">🚫 Evitar</span></td><td>Retire o som. O silêncio facilita o processamento sensorial.</td></tr>
        <tr><td>Atividades com muitas cores na folha</td><td><span class="tag-evitar">🚫 Evitar</span></td><td>Use versão PB ou simplifique para 2 cores máximo por folha.</td></tr>
      </tbody>
    </table></div>
  </div>
  <div class="pg-footer"><span>{{escola}} · {{professor}}</span><span>Kit TEA — Guia de Adaptação</span><span>19 / 27</span></div>
</div>

<div class="pg pg-adaptacao">
  <div class="adapt-intro">
    <div class="adapt-intro-titulo">📖 Dicas por Conceito</div>
    <div class="adapt-intro-desc">Orientações específicas para cada conceito de Pensamento Computacional ao trabalhar com alunos com TEA.</div>
  </div>
  <svg class="wave-sep" viewBox="0 0 794 32" preserveAspectRatio="none"><path d="M0,0 L794,0 L794,16 Q596,36 397,20 Q198,4 0,24 Z" fill="#1A202C"/><path d="M0,24 Q198,4 397,20 Q596,36 794,16 L794,32 L0,32 Z" fill="#ffffff"/></svg>
  <div class="adapt-corpo">
    ${conceitos.map(c=>`
    <div style="background:${c.bg};border:2px solid ${c.cor}55;border-radius:14px;padding:12px 16px;display:flex;gap:14px;align-items:flex-start">
      <div style="width:8px;background:${c.cor};border-radius:4px;align-self:stretch;flex-shrink:0"></div>
      <div style="flex:1"><div style="font-size:13px;font-weight:800;color:${c.dark};margin-bottom:4px">${c.nome}</div>
      <div style="font-size:12px;color:#2D3748;line-height:1.5">${adaptDicas[c.nome]}</div></div>
    </div>`).join('')}
  </div>
  <div class="pg-footer"><span>{{escola}} · {{professor}}</span><span>Kit TEA — Dicas por Conceito</span><span>20 / 27</span></div>
</div>`;

// Pgs 21–25: roteiros visuais
for (let i = 0; i < 10; i += 2) extra += pgRoteiros(roteiros[i], roteiros[i+1], 21 + i/2);

// Pg 26: ficha
extra += `
<div class="pg pg-ficha">
  <div class="secao-header"><div class="secao-header-sub">Registro Individual</div><div class="secao-header-titulo"><span>📋</span> Ficha de Observação do Aluno</div></div>
  <svg class="wave-sep" viewBox="0 0 794 32" preserveAspectRatio="none"><path d="M0,0 L794,0 L794,16 Q596,36 397,20 Q198,4 0,24 Z" fill="#0f2540"/><path d="M0,24 Q198,4 397,20 Q596,36 794,16 L794,32 L0,32 Z" fill="#ffffff"/></svg>
  <div class="ficha-corpo">
    <div style="font-size:12px;color:#718096;font-style:italic">Esta ficha é aceita pela coordenação e pode ser anexada ao laudo escolar. Preencha uma ficha por aluno, por atividade.</div>
    <div class="ficha-card">
      <div class="ficha-card-header"><div class="ficha-card-titulo">Dados do Aluno e da Atividade</div><div class="ficha-card-sub">Ficha N°: ______</div></div>
      <div class="ficha-aluno-grid">
        <div class="ficha-campo"><div class="ficha-campo-label">Nome do Aluno</div><div class="ficha-campo-linha"></div></div>
        <div class="ficha-campo"><div class="ficha-campo-label">Data</div><div class="ficha-campo-linha"></div></div>
        <div class="ficha-campo"><div class="ficha-campo-label">Atividade Realizada</div><div class="ficha-campo-linha"></div></div>
        <div class="ficha-campo"><div class="ficha-campo-label">Professora</div><div class="ficha-campo-linha"></div></div>
        <div class="ficha-campo"><div class="ficha-campo-label">Ano / Turma</div><div class="ficha-campo-linha"></div></div>
        <div class="ficha-campo"><div class="ficha-campo-label">Conceito Trabalhado</div><div class="ficha-campo-linha"></div></div>
      </div>
      <div class="ficha-corpo-interna">
        <div class="ficha-secao">
          <div class="ficha-secao-titulo">📊 Engajamento (1–5)</div>
          <div class="ficha-escala">
            <div class="ficha-escala-item"><div class="ficha-escala-num">1</div><div class="ficha-escala-label">Não participou</div></div>
            <div class="ficha-escala-item"><div class="ficha-escala-num">2</div><div class="ficha-escala-label">Pouco</div></div>
            <div class="ficha-escala-item"><div class="ficha-escala-num">3</div><div class="ficha-escala-label">Parcial</div></div>
            <div class="ficha-escala-item"><div class="ficha-escala-num">4</div><div class="ficha-escala-label">Engajado</div></div>
            <div class="ficha-escala-item"><div class="ficha-escala-num">5</div><div class="ficha-escala-label">Muito</div></div>
          </div>
          <div class="ficha-secao-titulo" style="margin-top:10px">🧩 Habilidade Observada</div>
          <div class="ficha-checkboxes">
            <div class="ficha-check">Identificou a sequência correta</div>
            <div class="ficha-check">Seguiu os 3 passos sem ajuda</div>
            <div class="ficha-check">Reconheceu padrão ou repetição</div>
            <div class="ficha-check">Decompôs o problema em partes</div>
            <div class="ficha-check">Aplicou raciocínio lógico</div>
            <div class="ficha-check">Comunicou o resultado</div>
          </div>
        </div>
        <div class="ficha-secao">
          <div class="ficha-secao-titulo">🔧 Adaptação Utilizada</div>
          <div class="ficha-checkboxes">
            <div class="ficha-check">Reduziu número de elementos</div>
            <div class="ficha-check">Usou roteiro visual</div>
            <div class="ficha-check">Removeu limite de tempo</div>
            <div class="ficha-check">Substituiu metáfora por literal</div>
            <div class="ficha-check">Fez atividade individualmente</div>
            <div class="ficha-check">Outra: __________________</div>
          </div>
          <div class="ficha-secao-titulo" style="margin-top:10px">📝 Próximo Passo</div>
          <div class="ficha-linha-escrita"></div><div class="ficha-linha-escrita"></div><div class="ficha-linha-escrita"></div>
          <div class="ficha-secao-titulo" style="margin-top:6px">💬 Observações Livres</div>
          <div class="ficha-linha-escrita"></div><div class="ficha-linha-escrita"></div>
        </div>
      </div>
      <div class="ficha-rodape-nota">📌 Esta ficha integra o portfólio de Pensamento Computacional do aluno. Guarde junto com o laudo ou relatório pedagógico.</div>
    </div>
  </div>
  <div class="pg-footer"><span>{{escola}} · {{professor}}</span><span>Kit TEA — Ficha de Observação</span><span>26 / 27</span></div>
</div>`;

// Pg 27: família
extra += `
<div class="pg pg-familia">
  <div class="secao-header" style="background:linear-gradient(135deg,#276749,#22543d)">
    <div class="secao-header-sub">Para enviar no grupo da turma</div>
    <div class="secao-header-titulo"><span>👨‍👩‍👧</span> Mini Guia para a Família</div>
  </div>
  <svg class="wave-sep" viewBox="0 0 794 32" preserveAspectRatio="none"><path d="M0,0 L794,0 L794,16 Q596,36 397,20 Q198,4 0,24 Z" fill="#22543d"/><path d="M0,24 Q198,4 397,20 Q596,36 794,16 L794,32 L0,32 Z" fill="#f0fff4"/></svg>
  <div class="familia-corpo">
    <div class="familia-intro">
      <div class="familia-intro-icon">🧩</div>
      <div>
        <div class="familia-intro-titulo">O que estamos fazendo na escola?</div>
        <div class="familia-intro-desc">Estamos trabalhando <strong>Pensamento Computacional</strong> — uma forma de pensar que ajuda seu filho a organizar ideias, resolver problemas e seguir sequências. E o melhor: fazemos isso <strong>sem computador</strong>, com atividades práticas, papel e movimento.</div>
      </div>
    </div>
    <div class="familia-conceitos">
      <div class="familia-conceito-card" style="background:#FFF0F6;border-color:#E84393"><div class="familia-conceito-icon">🍰</div><div class="familia-conceito-nome">Algoritmo</div><div class="familia-conceito-def">Uma sequência de passos para chegar a um resultado.</div><div class="familia-conceito-brincadeira"><strong>Em casa:</strong> Peça para ele explicar os passos de escovar os dentes — um passo de cada vez.</div></div>
      <div class="familia-conceito-card" style="background:#FFF8F0;border-color:#FF6D00"><div class="familia-conceito-icon">👕</div><div class="familia-conceito-nome">Sequência</div><div class="familia-conceito-def">Fazer as coisas na ordem certa — porque a ordem importa.</div><div class="familia-conceito-brincadeira"><strong>Em casa:</strong> Na hora de se vestir, pergunte: "O que precisa vir primeiro?" Deixe ele descobrir.</div></div>
      <div class="familia-conceito-card" style="background:#FAF0FF;border-color:#7B1FA2"><div class="familia-conceito-icon">🎲</div><div class="familia-conceito-nome">Lógica</div><div class="familia-conceito-def">Pensar com clareza para tomar a decisão certa.</div><div class="familia-conceito-brincadeira"><strong>Em casa:</strong> "SE está chovendo, ENTÃO o que você coloca para sair?" Perguntas simples de causa e efeito.</div></div>
      <div class="familia-conceito-card" style="background:#FFF5F5;border-color:#C62828"><div class="familia-conceito-icon">🔄</div><div class="familia-conceito-nome">Repetição</div><div class="familia-conceito-def">Quando a mesma ação se repete várias vezes seguidas.</div><div class="familia-conceito-brincadeira"><strong>Em casa:</strong> "Quantas vezes você escova os dentes por dia?" Mostre que a rotina é um loop que se repete.</div></div>
    </div>
    <div class="familia-frase-final">"Inclusão não é só colocar o aluno na sala.<br>É garantir que ele <em>participa de verdade</em>."</div>
  </div>
  <div class="pg-footer" style="background:transparent;border-color:rgba(39,103,73,0.2)"><span>{{escola}} · {{professor}}</span><span>Kit TEA — Guia para a Família</span><span>27 / 27</span></div>
</div>
</body>
</html>`;

// ── MERGE COM BASE ───────────────────────────────────────────────────────────
let base = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
// Remove qualquer coisa após o </body> da versão atual
base = base.replace(/(<\/body>[\s\S]*)$/i, '');
const final = base + extra;
fs.writeFileSync(path.join(__dirname, 'index.html'), final, 'utf8');
console.log('Kit TEA gerado: 27 páginas, 30 atividades, 10 roteiros visuais.');
