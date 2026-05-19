const fs   = require('fs');
const path = require('path');

const conceitos = [
  { nome:'Algoritmo',    cor:'#0EA5E9', bg:'#E0F2FE', dark:'#0C4A6E' },
  { nome:'Lógica',       cor:'#8B5CF6', bg:'#EDE9FE', dark:'#4C1D95' },
  { nome:'Abstração',    cor:'#10B981', bg:'#D1FAE5', dark:'#064E3B' },
  { nome:'Decomposição', cor:'#F59E0B', bg:'#FEF3C7', dark:'#78350F' },
  { nome:'Padrão',       cor:'#EF4444', bg:'#FEE2E2', dark:'#7F1D1D' },
  { nome:'Variáveis',    cor:'#EC4899', bg:'#FCE7F3', dark:'#831843' },
];

const adaptDicas = {
  'Algoritmo':    'Peça que o aluno escreva o algoritmo em pseudocódigo ou fluxograma antes de executar. Varie o contexto: receitas, trajetos, redes sociais. Aumentar a complexidade gradualmente é mais eficaz do que saltar para casos difíceis.',
  'Lógica':       'Introduza tabelas-verdade com exemplos cotidianos (IF chovendo THEN guarda-chuva). Jogos de dedução (Clue, Sudoku) desenvolvem lógica proposicional de forma lúdica. Conecte com programação: operadores AND, OR, NOT.',
  'Abstração':    'Peça que o aluno identifique o que é essencial e o que pode ser ignorado em um problema. Mapas, ícones e memes são abstrações do cotidiano — use-os como ponto de partida para a discussão.',
  'Decomposição': 'Projetos reais funcionam bem: decompor um trabalho escolar, planejar um evento, criar um app imaginário. Ensine a criar subtarefas com dependências entre si — base para projetos de engenharia.',
  'Padrão':       'Dados de redes sociais, gráficos de tendência, sequências musicais — todos são padrões. Conecte com Matemática (funções, progressões) e com Ciências (DNA, cristais). Desafio: criar padrões com regras ocultas para o colega descobrir.',
  'Variáveis':    'Relacione com álgebra (x, y) e com programação real (nome, idade, pontos). Atividades de "substituição": o que muda se a variável mudar? Conecte com planilhas e com fórmulas matemáticas que já conhecem.',
};

const atividades = [
  // ALGORITMO
  { id:1,  c:0, nivel:'🟢 Iniciante', nome:'O Algoritmo do Perfil',
    mat:['Ficha em branco','Caneta'],
    ps:['Escreva um algoritmo de 5 passos para criar um perfil perfeito em uma rede social.','Troque com um colega: ele deve seguir seus passos exatamente e avaliar se o resultado faz sentido.','Identifique qual passo é mais subjetivo e discuta como torná-lo mais preciso.'],
    dica:'Conecta com o cotidiano digital. Questione: o que torna um perfil "perfeito"? Esse questionamento abre debate sobre valores e algoritmos de recomendação.', bncc:'EF69CO01' },
  { id:2,  c:0, nivel:'🟢 Iniciante', nome:'Receita de Aprovação',
    mat:['Papel e caneta','Timer (celular)'],
    ps:['Escreva em 5 minutos o algoritmo completo de como você estuda para uma prova.','Compare com o algoritmo de um colega: quais passos são iguais? Quais são diferentes?','Crie um "super algoritmo de estudos" combinando os melhores passos dos dois.'],
    dica:'Ótima abertura de semestre. Revela hábitos de estudo reais. O "super algoritmo" pode virar um cartaz de sala.', bncc:'EF69CO01' },
  { id:3,  c:0, nivel:'🟡 Intermediário', nome:'Algoritmo de Busca na Mochila',
    mat:['Mochila com 10 itens variados','Lista de itens para encontrar'],
    ps:['Sem olhar, tente achar os 3 itens da lista o mais rápido possível (busca linear).','Agora organize os itens por categoria e repita. Meça o tempo de novo.','Explique por escrito: por que a busca ficou mais rápida? Qual algoritmo você usou?'],
    dica:'Introduz busca linear vs. busca em dados organizados. Conecta com binary search sem usar o nome técnico ainda.', bncc:'EF69CO02' },
  { id:4,  c:0, nivel:'🟡 Intermediário', nome:'Ordenando a Fila',
    mat:['Cartões com números de 1 a 10 (embaralhados)','Cronômetro'],
    ps:['Embaralhe os cartões e ordene-os do menor para o maior, descrevendo em voz alta cada decisão que você toma.','Tente ordenar de um jeito diferente — outra estratégia. Qual foi mais rápida?','Pesquise os nomes dos dois algoritmos de ordenação que você usou sem saber.'],
    dica:'Bubble sort e insertion sort surgem naturalmente. Conecta com CS sem assustar. Pode pedir que pesquisem em casa.', bncc:'EF69CO02' },
  { id:5,  c:0, nivel:'🔴 Desafio', nome:'O Algoritmo que Falhou',
    mat:['Impresso: 3 algoritmos com bugs propositais','Caneta vermelha'],
    ps:['Leia os 3 algoritmos impressos e identifique o erro em cada um (há exatamente 1 bug por algoritmo).','Corrija o bug e explique em uma frase por que aquele erro causaria um problema real.','Crie você mesmo um algoritmo com 1 bug proposital para um colega encontrar.'],
    dica:'Debugging é uma habilidade essencial. Erros propositais ensinam mais que exemplos perfeitos. Conecta direto com programação real.', bncc:'EF69CO03' },

  // LÓGICA
  { id:6,  c:1, nivel:'🟢 Iniciante', nome:'SE... ENTÃO no WhatsApp',
    mat:['Folha de registro'],
    ps:['Escreva 5 regras lógicas que você usa inconscientemente no WhatsApp (Ex.: SE mensagem enviada às 23h, ENTÃO não espere resposta rápida).','Converta cada regra para o formato: SE [condição] ENTÃO [ação] SENÃO [outra ação].','Identifique qual das suas regras tem mais exceções e discuta por que.'],
    dica:'Contextualiza lógica proposicional com comportamento real. Gera debate saudável sobre comunicação digital.', bncc:'EF69CO03' },
  { id:7,  c:1, nivel:'🟢 Iniciante', nome:'Detetive Lógico',
    mat:['Cartela de detetive (impressa)','Lápis'],
    ps:['Leia as 4 pistas impressas sobre um crime imaginário.','Use tabela de V/F para eliminar suspeitos com base nas pistas.','Apresente sua conclusão com a prova lógica: "O suspeito X é culpado PORQUE...".'],
    dica:'Lúdico e engajante. Treina raciocínio dedutivo. Pode criar variações temáticas (mistério na escola, roubo de snack).', bncc:'EF69CO03' },
  { id:8,  c:1, nivel:'🟡 Intermediário', nome:'Tabela-Verdade da Vida Real',
    mat:['Folha quadriculada','Lápis'],
    ps:['Crie uma tabela-verdade para a decisão: "Vou à festa?" (variáveis: tenho dinheiro, estão meus amigos, tem prova amanhã).','Adicione uma 4ª variável e observe como a tabela cresce. Quantas linhas tem agora?','Discuta: quando uma tabela-verdade fica grande demais para ser útil? O que fazemos nesse caso?'],
    dica:'Introduz explosão combinatória de forma natural. Conecta com tomada de decisão real e com álgebra booleana.', bncc:'EF69CO03' },
  { id:9,  c:1, nivel:'🟡 Intermediário', nome:'O Paradoxo do Mentiroso',
    mat:['Cartão com paradoxos impressos','Ficha de análise'],
    ps:['Leia o paradoxo: "Esta frase é falsa." Tente classificá-la como Verdadeira ou Falsa.','Discuta em dupla: por que a lógica tradicional falha nesse caso?','Pesquise outro paradoxo lógico e apresente para a turma em 2 minutos.'],
    dica:'Abre a mente para os limites da lógica formal. Conecta com Gödel, Russell e com as limitações dos sistemas computacionais.', bncc:'EF69CO03' },
  { id:10, c:1, nivel:'🔴 Desafio', nome:'Lógica dos Algoritmos de Feed',
    mat:['Impressão de 10 posts fictícios com engajamento variado'],
    ps:['Com base nos dados de curtidas/compartilhamentos, crie uma regra lógica para decidir qual post aparece primeiro no feed.','Teste sua regra nos 10 posts e ordene-os. Compare com o resultado de um colega.','Identifique 2 situações em que sua regra seria injusta. Como corrigir sem complicar demais?'],
    dica:'Introduz algoritmos de recomendação de forma crítica. Conecta com ética em IA e com economia de atenção.', bncc:'EF69CO03' },

  // ABSTRAÇÃO
  { id:11, c:2, nivel:'🟢 Iniciante', nome:'O Mapa Mental que Omite',
    mat:['Papel A4','Caneta colorida'],
    ps:['Desenhe um mapa do caminho de casa até a escola. Inclua apenas o que é necessário para não se perder.','Troque com um colega: ele consegue seguir seu mapa? O que estava faltando? O que era desnecessário?','Discuta: mapas omitem informações de propósito. Por que isso é útil?'],
    dica:'Abstração como simplificação intencional. Mapas, ícones e memes são exemplos do cotidiano. Conecta com UX design.', bncc:'EF69CO01' },
  { id:12, c:2, nivel:'🟢 Iniciante', nome:'Ícone Perfeito',
    mat:['Papel branco','Lápis'],
    ps:['Escolha um objeto complexo (avião, hospital, restaurante) e desenhe um ícone com no máximo 5 traços que qualquer pessoa entenda.','Mostre para 3 colegas sem dizer o que é: quantos acertaram?','Redesenhe o ícone incorporando o feedback até chegar a 100% de reconhecimento.'],
    dica:'Design de ícone é abstração pura. Conecta com UI design, comunicação visual e com como computadores representam conceitos.', bncc:'EF69CO01' },
  { id:13, c:2, nivel:'🟡 Intermediário', nome:'Abstração de Código',
    mat:['Cartões com funções em pseudocódigo','Folha de registro'],
    ps:['Leia 3 funções em pseudocódigo sem ver o nome delas. Adivinhe o que cada uma faz.','Agora leia o nome das funções: você estava certo? O que revelou ou escondeu o código?','Escreva sua própria função em pseudocódigo para um colega adivinhar.'],
    dica:'Introduz o conceito de função como abstração. Conecta direto com programação. Prepara para Python, JavaScript, etc.', bncc:'EF69CO02' },
  { id:14, c:2, nivel:'🟡 Intermediário', nome:'O Personagem Genérico',
    mat:['Descrição de 5 personagens de filmes diferentes','Folha de análise'],
    ps:['Leia as 5 descrições e identifique características em COMUM entre todos os personagens.','Crie um "personagem genérico" que representa o tipo de herói descrito, usando apenas os atributos comuns.','Compare seu personagem genérico com o de um colega. O que cada um escolheu abstrair?'],
    dica:'POO (Programação Orientada a Objetos) começa aqui: herói genérico = classe, personagem específico = objeto. Introduz sem assustar.', bncc:'EF69CO01' },
  { id:15, c:2, nivel:'🔴 Desafio', nome:'Abstraindo o Problema',
    mat:['Folha com 3 problemas complexos do cotidiano'],
    ps:['Leia os 3 problemas (Ex.: trânsito, fila de banco, escalação de time). Para cada um, identifique: qual é a essência do problema ignorando detalhes irrelevantes?','Reescreva cada problema em uma frase de até 15 palavras capturando apenas o essencial.','Mostre suas versões abstratas para um colega: ele reconhece o problema original? Houve perda de informação importante?'],
    dica:'Abstração como ferramenta de resolução de problemas. Conecta com modelagem matemática e com design thinking.', bncc:'EF69CO02' },

  // DECOMPOSIÇÃO
  { id:16, c:3, nivel:'🟢 Iniciante', nome:'Decompondo o TCC',
    mat:['Folha A4','Post-its coloridos'],
    ps:['Escolha um trabalho escolar grande que você tem ou já teve. Decomponha-o em todas as subtarefas que puder imaginar.','Organize as subtarefas em ordem de dependência: o que precisa ser feito antes do quê?','Estime quanto tempo cada subtarefa levaria. Qual é o tempo total? Surpreso?'],
    dica:'Gestão de projetos na prática. Conecta com metodologias ágeis (Scrum, Kanban) e com planejamento real de vida.', bncc:'EF69CO02' },
  { id:17, c:3, nivel:'🟢 Iniciante', nome:'Anatomia de um App',
    mat:['Impressão de tela inicial de um app popular','Caneta colorida'],
    ps:['Olhe a tela do app e liste todas as funcionalidades visíveis (botões, campos, menus).','Agrupe as funcionalidades por categoria/módulo. Dê um nome a cada grupo.','Estime: quantas pessoas trabalharam em cada módulo? Por que dividir o trabalho assim?'],
    dica:'Decomposição como base para trabalho em equipe e arquitetura de software. Conecta com como empresas de tech funcionam.', bncc:'EF69CO02' },
  { id:18, c:3, nivel:'🟡 Intermediário', nome:'A Receita Escalável',
    mat:['Receita simples impressa para 4 pessoas','Calculadora'],
    ps:['A festa vai ter 80 pessoas. Calcule todos os ingredientes na proporção certa.','Agora decomponha o preparo: quais tarefas podem acontecer ao mesmo tempo (paralelas)? Quais precisam ser sequenciais?','Desenhe um diagrama mostrando a ordem de preparo otimizada para o mínimo de tempo total.'],
    dica:'Introduz paralelismo e dependência de tarefas — conceitos centrais em sistemas distribuídos e em CPU multi-core.', bncc:'EF69CO02' },
  { id:19, c:3, nivel:'🟡 Intermediário', nome:'Bug Report Profissional',
    mat:['Descrição vaga de um problema de software','Formulário de bug report'],
    ps:['Leia a descrição vaga: "O app não funciona direito." Faça 5 perguntas que você precisaria responder para resolver o problema.','Reescreva o problema decomposto: quando acontece, em qual tela, o que você esperava, o que aconteceu de fato, como reproduzir.','Troque com um colega: ele consegue reproduzir o bug só com sua descrição?'],
    dica:'Bug report é decomposição aplicada. Conecta com desenvolvimento de software e com comunicação técnica precisa.', bncc:'EF69CO03' },
  { id:20, c:3, nivel:'🔴 Desafio', nome:'Planejando uma Startup',
    mat:['Folha de planejamento','Caneta'],
    ps:['Escolha uma ideia simples de app ou produto digital. Decomponha o projeto em: produto, tecnologia, marketing, finanças, operações.','Para cada área, liste 3 subtarefas do primeiro mês. Quais dependem de outras áreas?','Identifique o "caminho crítico": a sequência de tarefas que, se atrasar, atrasa tudo o mais.'],
    dica:'Caminho crítico é conceito de gestão de projetos (PERT/CPM). Conecta com empreendedorismo e com como startups planejam lançamentos.', bncc:'EF69CO03' },

  // PADRÃO
  { id:21, c:4, nivel:'🟢 Iniciante', nome:'Padrão nas Trending',
    mat:['Lista de 10 títulos de vídeos virais do YouTube','Folha de análise'],
    ps:['Leia os 10 títulos e identifique padrões de linguagem, números ou palavras que aparecem com frequência.','Crie uma "fórmula" para título viral usando os padrões que encontrou.','Teste a fórmula: crie 2 títulos usando ela. Ficaram convincentes?'],
    dica:'Reconhecimento de padrões em marketing digital. Conecta com copywriting, clickbait e com como algoritmos identificam conteúdo popular.', bncc:'EF69CO03' },
  { id:22, c:4, nivel:'🟢 Iniciante', nome:'Sequências do Cotidiano',
    mat:['Tabela com 5 sequências incompletas (preços, temperaturas, seguidores)','Lápis'],
    ps:['Complete cada sequência identificando o padrão (aritmético, geométrico, outro).','Para cada sequência, escreva a regra em palavras: "Cada termo é calculado...".','Crie uma sequência original com pelo menos 6 termos e uma regra não óbvia para um colega descobrir.'],
    dica:'Conecta com Progressão Aritmética e Geométrica da Matemática. Mostra que padrões aparecem em dados reais, não só em exercícios.', bncc:'EF69CO03' },
  { id:23, c:4, nivel:'🟡 Intermediário', nome:'Padrão no Código Musical',
    mat:['Cifra simples de uma música conhecida','Folha de análise'],
    ps:['Analise a progressão de acordes e identifique padrões que se repetem (refrão, verso, ponte).','Quantas vezes cada padrão aparece? Existe uma estrutura recorrente?','Crie a estrutura de uma nova música usando os mesmos padrões, com letras diferentes.'],
    dica:'Música é matemática auditiva. Progressões harmônicas são padrões. Conecta com síntese musical, compressão de dados e com estrutura narrativa.', bncc:'EF69CO03' },
  { id:24, c:4, nivel:'🟡 Intermediário', nome:'Reconhecimento de Fraude',
    mat:['Impressão com 12 transações financeiras fictícias','Caneta'],
    ps:['Analise as transações e identifique quais parecem fora do padrão normal.','Crie uma regra em linguagem natural para detectar automaticamente transações suspeitas.','Quantos falsos positivos sua regra gera? Como equilibrar segurança com conveniência?'],
    dica:'Machine learning e detecção de fraude começam aqui. Conecta com sistemas de antifraude de bancos e com o que os algoritmos de cartão de crédito fazem.', bncc:'EF69CO03' },
  { id:25, c:4, nivel:'🔴 Desafio', nome:'Cifrando com Padrões',
    mat:['Mensagem criptografada com cifra de César','Folha de análise'],
    ps:['Analise a frequência das letras na mensagem cifrada. Qual letra aparece mais? Em português, é provavelmente o "A" ou "E".','Use a análise de frequência para descobrir o deslocamento da cifra e decifrar a mensagem.','Cifre uma mensagem sua para um colega decifrar usando o mesmo método.'],
    dica:'Criptografia e análise de frequência — base da criptoanalysis. Conecta com segurança digital, história da WWII (Enigma) e com como HTTPS funciona.', bncc:'EF69CO03' },

  // VARIÁVEIS
  { id:26, c:5, nivel:'🟢 Iniciante', nome:'Variáveis da Minha Semana',
    mat:['Tabela de acompanhamento semanal','Caneta'],
    ps:['Escolha 3 variáveis da sua vida para medir durante 1 semana (horas de sono, exercício, tempo de tela).','No dia seguinte, registre os valores. Quais variáveis são numéricas? Quais são categóricas?','Preveja: se você mudar a variável X, como isso afeta as outras? Essa é a lógica de um experimento científico.'],
    dica:'Variáveis como conceito científico e computacional. Conecta com Biologia (variáveis em experimentos) e com dados de saúde.', bncc:'EF69CO01' },
  { id:27, c:5, nivel:'🟢 Iniciante', nome:'Planilha Mental',
    mat:['Tabela em branco','Calculadora'],
    ps:['Imagine uma planilha para controlar vendas de uma barraquinha. Quais colunas (variáveis) você criaria?','Defina o tipo de dado de cada variável: número, texto, data, verdadeiro/falso.','Crie uma fórmula em linguagem natural para calcular o lucro total usando as suas variáveis.'],
    dica:'Planilha é banco de dados visual. Tipos de dados são conceito fundamental de programação. Conecta Excel com conceitos de CS.', bncc:'EF69CO01' },
  { id:28, c:5, nivel:'🟡 Intermediário', nome:'Simulando com Variáveis',
    mat:['Cenário de simulação impresso (ex: crescimento de uma planta)','Calculadora'],
    ps:['Leia o cenário: uma planta cresce 2cm por semana se regada, e não cresce se não for. Calcule a altura após 8 semanas com diferentes padrões de rega.','Crie uma tabela com 3 cenários diferentes. Qual variável tem mais impacto no resultado?','Escreva em pseudocódigo o loop que simula o crescimento semana a semana.'],
    dica:'Simulações computacionais funcionam exatamente assim. Conecta com modelagem matemática, com jogos e com previsões climáticas.', bncc:'EF69CO02' },
  { id:29, c:5, nivel:'🟡 Intermediário', nome:'Depurando Variáveis',
    mat:['Pseudocódigo com erro de variável impressa'],
    ps:['Leia o pseudocódigo e execute mentalmente passo a passo, anotando o valor de cada variável a cada linha.','Identifique onde o valor de uma variável fica inesperado e explique o que causou o erro.','Corrija o código e verifique rodando passo a passo de novo.'],
    dica:'Debugging com rastreamento de variáveis — habilidade central em qualquer linguagem de programação. Prepara para Python, JavaScript, etc.', bncc:'EF69CO03' },
  { id:30, c:5, nivel:'🔴 Desafio', nome:'Design de API Simples',
    mat:['Folha de design','Caneta'],
    ps:['Imagine um serviço de previsão do tempo. Defina: quais variáveis de ENTRADA o sistema precisa? Quais variáveis de SAÍDA ele retorna?','Escreva em pseudocódigo a assinatura de 3 funções que o serviço ofereceria.','Discuta: por que esconder os detalhes internos do serviço é uma boa prática (abstração + variáveis bem nomeadas)?'],
    dica:'Introduz API design e encapsulamento. Conecta com como microsserviços funcionam. Base para qualquer carreira em tecnologia.', bncc:'EF69CO03' },
];

const roteiros = [
  { id:1,  c:0, nome:'Criando um Algoritmo',     ps:[{i:'🎯',l:'Definir objetivo'},{i:'📝',l:'Listar passos'},{i:'🔍',l:'Revisar lógica'},{i:'🧪',l:'Testar'}] },
  { id:2,  c:0, nome:'Depurando um Erro',         ps:[{i:'🔎',l:'Ler o erro'},{i:'🗺️',l:'Rastrear fluxo'},{i:'🐛',l:'Encontrar bug'},{i:'✅',l:'Corrigir e testar'}] },
  { id:3,  c:1, nome:'Resolução Lógica',           ps:[{i:'📋',l:'Ler o problema'},{i:'🔗',l:'Mapear condições'},{i:'⚖️',l:'Avaliar V/F'},{i:'💡',l:'Concluir'}] },
  { id:4,  c:2, nome:'Aplicando Abstração',        ps:[{i:'🔍',l:'Analisar problema'},{i:'🗑️',l:'Eliminar detalhes'},{i:'📦',l:'Definir essencial'},{i:'✏️',l:'Modelar'}] },
  { id:5,  c:3, nome:'Decompondo um Projeto',      ps:[{i:'🎯',l:'Definir meta'},{i:'✂️',l:'Dividir em partes'},{i:'🔗',l:'Ordenar dependências'},{i:'📅',l:'Planejar prazos'}] },
  { id:6,  c:4, nome:'Reconhecendo Padrões',       ps:[{i:'📊',l:'Coletar dados'},{i:'👀',l:'Observar repetições'},{i:'📐',l:'Formular regra'},{i:'🔮',l:'Prever próximo'}] },
  { id:7,  c:5, nome:'Trabalhando com Variáveis',  ps:[{i:'🏷️',l:'Nomear variável'},{i:'📦',l:'Definir tipo'},{i:'💾',l:'Atribuir valor'},{i:'♻️',l:'Usar no cálculo'}] },
  { id:8,  c:1, nome:'Tabela-Verdade',             ps:[{i:'📋',l:'Listar variáveis'},{i:'⚡',l:'Combinar valores'},{i:'✅',l:'Avaliar resultado'},{i:'🔍',l:'Encontrar padrão'}] },
  { id:9,  c:2, nome:'Criando uma Função',         ps:[{i:'🎯',l:'Definir objetivo'},{i:'📥',l:'Definir entradas'},{i:'⚙️',l:'Escrever lógica'},{i:'📤',l:'Definir saída'}] },
  { id:10, c:3, nome:'Análise de Complexidade',    ps:[{i:'🔢',l:'Contar operações'},{i:'📈',l:'Ver crescimento'},{i:'⚖️',l:'Comparar soluções'},{i:'🏆',l:'Escolher melhor'}] },
];

// ── FUNÇÕES ──────────────────────────────────────────────────────────────────
function nivelStyle(n) {
  if (n.includes('Iniciante'))     return 'background:#DCFCE7;color:#166534';
  if (n.includes('Intermediário')) return 'background:#FEF9C3;color:#854D0E';
  return 'background:#FEE2E2;color:#991B1B';
}

function buildCard(a, conceitos) {
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
      <div class="atividade-secao-titulo">📋 Passos</div>
      ${a.ps.map((p,i)=>`<div class="passo-ativ"><div class="passo-ativ-num" style="background:${c.cor}">${i+1}</div><div class="passo-ativ-texto">${p}</div></div>`).join('')}
      <div class="dica-tea-box"><div><span class="dica-tea-label">💡 Dica do Professor</span><div class="dica-tea-texto">${a.dica}</div></div></div>
    </div>
  </div>
</div>`;
}

function buildPgAtiv(a1, a2, pg, conceitos, kitNome, total) {
  const label = a1.c === a2.c ? conceitos[a1.c].nome : conceitos[a1.c].nome + ' & ' + conceitos[a2.c].nome;
  return `
<div class="pg pg-atividades">
  <div class="atividades-header">
    <div><div class="atividades-header-titulo">🎯 Atividades Desplugadas Avançadas</div>
    <div class="atividades-header-sub">Pensamento Computacional · 6° ano ao Ensino Médio</div></div>
    <div class="atividades-bloco-tag">${label}</div>
  </div>
  <div class="atividades-corpo">${buildCard(a1,conceitos)}${buildCard(a2,conceitos)}</div>
  <div class="pg-footer"><span>{{escola}} · {{professor}}</span><span>${kitNome} — Atividades</span><span>${pg} / ${total}</span></div>
</div>`;
}

function buildPgRoteiros(r1, r2, pg, conceitos, kitNome, total) {
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
    <div class="atividades-header-sub">Mostre este roteiro no início da atividade</div></div>
    <div class="atividades-bloco-tag">Roteiros ${r1.id} e ${r2.id}</div>
  </div>
  <div class="roteiros-corpo">${rc(r1)}${rc(r2)}</div>
  <div class="pg-footer"><span>{{escola}} · {{professor}}</span><span>${kitNome} — Roteiros</span><span>${pg} / ${total}</span></div>
</div>`;
}

// ── buildHTML ────────────────────────────────────────────────────────────────
function buildHTML(data) {
  const _conceitos  = data.conceitos  || conceitos;
  const _atividades = data.atividades || atividades;
  const _roteiros   = data.roteiros   || roteiros;
  const _adaptDicas = data.adaptDicas || adaptDicas;
  const _kitNome    = data.kitNome    || 'Despluga Avançado';
  const _vars       = data.vars       || {};
  const _familiaConceitos = data.familiaConceitos || [
    {emoji:'🔵',nome:'Algoritmo', cor:'#0EA5E9',bg:'#E0F2FE',def:'Uma sequência precisa de passos para resolver um problema.',casa:'Pergunte: "Como você vai estudar para a prova?" Peça que explique o plano passo a passo.'},
    {emoji:'🟣',nome:'Lógica',    cor:'#8B5CF6',bg:'#EDE9FE',def:'Pensar de forma clara e estruturada para tomar decisões.',casa:'"SE você terminar o dever de casa, ENTÃO pode usar o celular." Decisões com condições claras.'},
    {emoji:'🟢',nome:'Abstração', cor:'#10B981',bg:'#D1FAE5',def:'Focar no essencial e ignorar o que não importa no momento.',casa:'Ao planejar algo, pergunte: "O que é realmente necessário? O que podemos simplificar?"'},
    {emoji:'🟡',nome:'Decomposição',cor:'#F59E0B',bg:'#FEF3C7',def:'Dividir um problema grande em partes menores e manejáveis.',casa:'Projetos escolares grandes: divida em etapas com datas. Uma etapa por vez.'},
  ];
  const _familiaIntroDesc = data.familiaIntroDesc || 'Seu filho está aprendendo <strong>Pensamento Computacional</strong> — habilidades que engenheiros, cientistas e empreendedores usam todo dia para resolver problemas complexos. E o melhor: aprendemos isso <strong>sem computador</strong>, desenvolvendo raciocínio que serve para qualquer área da vida.';
  const _familiaFrase = data.familiaFrase || '"Pensamento Computacional não é só para programadores.<br>É para quem quer pensar melhor."';
  const TOTAL = 3 + Math.ceil(_atividades.length/2) + 2 + Math.ceil(_roteiros.length/2) + 2;

  let base = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  const marker = '<!-- GENERATED_PAGES_START -->';
  const cutIdx = base.indexOf(marker);
  base = cutIdx !== -1 ? base.substring(0, cutIdx) : base.replace(/(<\/body>[\s\S]*)$/i, '');
  for (const [k,v] of Object.entries(_vars)) base = base.replaceAll(`{{${k}}}`, v);

  let extra = '';

  for (let i = 0; i < _atividades.length; i += 2) {
    if (_atividades[i] && _atividades[i+1])
      extra += buildPgAtiv(_atividades[i], _atividades[i+1], 4+i/2, _conceitos, _kitNome, TOTAL);
  }

  const pgAdapt1 = 4 + Math.ceil(_atividades.length/2);
  const pgAdapt2 = pgAdapt1 + 1;
  extra += `
<div class="pg pg-adaptacao">
  <div class="adapt-intro">
    <div class="adapt-intro-titulo">⚡ Como Aplicar este Kit</div>
    <div class="adapt-intro-desc">Estratégias para tornar o Pensamento Computacional relevante e desafiador para turmas do 6° ano ao Ensino Médio.</div>
  </div>
  <svg class="wave-sep" viewBox="0 0 794 32" preserveAspectRatio="none"><path d="M0,0 L794,0 L794,16 Q596,36 397,20 Q198,4 0,24 Z" fill="#0c1a2e"/><path d="M0,24 Q198,4 397,20 Q596,36 794,16 L794,32 L0,32 Z" fill="#ffffff"/></svg>
  <div class="adapt-corpo">
    <div class="adapt-3-passos">
      <div class="adapt-3-titulo">🎯 Os 3 Princípios para Turmas Avançadas</div>
      <div class="adapt-3-grid">
        <div class="adapt-passo-card"><div class="adapt-passo-num">1</div><div class="adapt-passo-titulo">Contextualize com o real</div><div class="adapt-passo-desc">Conecte cada atividade com tecnologia que os alunos já usam. Algoritmo do TikTok, lógica do WhatsApp, padrões do Spotify tornam o abstrato concreto.</div></div>
        <div class="adapt-passo-card"><div class="adapt-passo-num">2</div><div class="adapt-passo-titulo">Valorize o processo</div><div class="adapt-passo-desc">Para alunos mais velhos, o raciocínio importa mais que a resposta certa. Peça que expliquem como chegaram à solução — isso é o verdadeiro aprendizado.</div></div>
        <div class="adapt-passo-card"><div class="adapt-passo-num">3</div><div class="adapt-passo-titulo">Conecte com carreiras</div><div class="adapt-passo-desc">Mostre onde cada habilidade é usada profissionalmente. Decomposição = gerente de projetos. Abstração = designer. Algoritmo = desenvolvedor. Lógica = advogado.</div></div>
      </div>
    </div>
    <div><div class="adapt-tabela-titulo" style="margin-bottom:10px">📊 Sequência sugerida por série</div>
    <table class="adapt-tabela">
      <thead><tr><th>Série</th><th>Foco Principal</th><th>Atividades Recomendadas</th></tr></thead>
      <tbody>
        <tr><td>6° e 7° Ano</td><td><span class="tag-funciona">Algoritmo e Sequência</span></td><td>IDs 1–5: contextos simples e cotidianos. Priorize as atividades Iniciante.</td></tr>
        <tr><td>8° e 9° Ano</td><td><span class="tag-funciona">Lógica e Decomposição</span></td><td>IDs 6–20: conecta com Matemática e Ciências. Misture Iniciante e Intermediário.</td></tr>
        <tr><td>1° EM</td><td><span class="tag-adaptar">Abstração e Padrão</span></td><td>IDs 11–25: projetos mais longos e análise crítica. Todos os níveis.</td></tr>
        <tr><td>2° e 3° EM</td><td><span class="tag-adaptar">Variáveis e Sistemas</span></td><td>IDs 26–30: preparação para vestibular e mercado de trabalho. Foco em Desafio.</td></tr>
        <tr><td>Todas as séries</td><td><span class="tag-evitar">Em duplas ou grupos</span></td><td>Trabalho colaborativo acelera o aprendizado. Debate as soluções diferentes.</td></tr>
      </tbody>
    </table></div>
  </div>
  <div class="pg-footer"><span>{{escola}} · {{professor}}</span><span>${_kitNome} — Guia de Aplicação</span><span>${pgAdapt1} / ${TOTAL}</span></div>
</div>

<div class="pg pg-adaptacao">
  <div class="adapt-intro">
    <div class="adapt-intro-titulo">📖 Dicas por Conceito</div>
    <div class="adapt-intro-desc">Como aprofundar cada conceito e conectar com outras disciplinas e com o mercado de trabalho.</div>
  </div>
  <svg class="wave-sep" viewBox="0 0 794 32" preserveAspectRatio="none"><path d="M0,0 L794,0 L794,16 Q596,36 397,20 Q198,4 0,24 Z" fill="#0c1a2e"/><path d="M0,24 Q198,4 397,20 Q596,36 794,16 L794,32 L0,32 Z" fill="#ffffff"/></svg>
  <div class="adapt-corpo">
    ${_conceitos.map(c=>`
    <div style="background:${c.bg};border:2px solid ${c.cor}55;border-radius:14px;padding:12px 16px;display:flex;gap:14px;align-items:flex-start">
      <div style="width:8px;background:${c.cor};border-radius:4px;align-self:stretch;flex-shrink:0"></div>
      <div style="flex:1"><div style="font-size:13px;font-weight:800;color:${c.dark};margin-bottom:4px">${c.nome}</div>
      <div style="font-size:12px;color:#2D3748;line-height:1.5">${_adaptDicas[c.nome]||''}</div></div>
    </div>`).join('')}
  </div>
  <div class="pg-footer"><span>{{escola}} · {{professor}}</span><span>${_kitNome} — Dicas por Conceito</span><span>${pgAdapt2} / ${TOTAL}</span></div>
</div>`;

  const pgRoteiroBase = pgAdapt2 + 1;
  for (let i = 0; i < _roteiros.length; i += 2) {
    if (_roteiros[i] && _roteiros[i+1])
      extra += buildPgRoteiros(_roteiros[i], _roteiros[i+1], pgRoteiroBase+i/2, _conceitos, _kitNome, TOTAL);
  }

  const pgFicha = pgRoteiroBase + Math.ceil(_roteiros.length/2);
  extra += `
<div class="pg pg-ficha">
  <div class="secao-header"><div class="secao-header-sub">Avaliação de Processo</div><div class="secao-header-titulo"><span>📋</span> Ficha de Avaliação do Aluno</div></div>
  <svg class="wave-sep" viewBox="0 0 794 32" preserveAspectRatio="none"><path d="M0,0 L794,0 L794,16 Q596,36 397,20 Q198,4 0,24 Z" fill="#0c1a2e"/><path d="M0,24 Q198,4 397,20 Q596,36 794,16 L794,32 L0,32 Z" fill="#ffffff"/></svg>
  <div class="ficha-corpo">
    <div style="font-size:12px;color:#718096;font-style:italic">Avaliação formativa: registre o desenvolvimento do raciocínio, não apenas a resposta final.</div>
    <div class="ficha-card">
      <div class="ficha-card-header"><div class="ficha-card-titulo">Dados do Aluno e da Atividade</div><div class="ficha-card-sub">Ficha N°: ______</div></div>
      <div class="ficha-aluno-grid">
        <div class="ficha-campo"><div class="ficha-campo-label">Nome do Aluno</div><div class="ficha-campo-linha"></div></div>
        <div class="ficha-campo"><div class="ficha-campo-label">Data</div><div class="ficha-campo-linha"></div></div>
        <div class="ficha-campo"><div class="ficha-campo-label">Atividade Realizada</div><div class="ficha-campo-linha"></div></div>
        <div class="ficha-campo"><div class="ficha-campo-label">Professor(a)</div><div class="ficha-campo-linha"></div></div>
        <div class="ficha-campo"><div class="ficha-campo-label">Série / Turma</div><div class="ficha-campo-linha"></div></div>
        <div class="ficha-campo"><div class="ficha-campo-label">Conceito Trabalhado</div><div class="ficha-campo-linha"></div></div>
      </div>
      <div class="ficha-corpo-interna">
        <div class="ficha-secao">
          <div class="ficha-secao-titulo">📊 Nível de Desenvolvimento (1–5)</div>
          <div class="ficha-escala">
            <div class="ficha-escala-item"><div class="ficha-escala-num">1</div><div class="ficha-escala-label">Não demonstrou</div></div>
            <div class="ficha-escala-item"><div class="ficha-escala-num">2</div><div class="ficha-escala-label">Iniciando</div></div>
            <div class="ficha-escala-item"><div class="ficha-escala-num">3</div><div class="ficha-escala-label">Em desenvolvimento</div></div>
            <div class="ficha-escala-item"><div class="ficha-escala-num">4</div><div class="ficha-escala-label">Consolidado</div></div>
            <div class="ficha-escala-item"><div class="ficha-escala-num">5</div><div class="ficha-escala-label">Avançado</div></div>
          </div>
          <div class="ficha-secao-titulo" style="margin-top:10px">🧠 Habilidades Demonstradas</div>
          <div class="ficha-checkboxes">
            <div class="ficha-check">Identificou o problema corretamente</div>
            <div class="ficha-check">Propôs solução estruturada</div>
            <div class="ficha-check">Justificou o raciocínio com clareza</div>
            <div class="ficha-check">Identificou erros e os corrigiu</div>
            <div class="ficha-check">Conectou com situações reais</div>
            <div class="ficha-check">Colaborou de forma produtiva</div>
          </div>
        </div>
        <div class="ficha-secao">
          <div class="ficha-secao-titulo">💬 Observações do Professor</div>
          <div class="ficha-linha-escrita"></div><div class="ficha-linha-escrita"></div><div class="ficha-linha-escrita"></div>
          <div class="ficha-secao-titulo" style="margin-top:10px">📝 Próximo Passo</div>
          <div class="ficha-linha-escrita"></div><div class="ficha-linha-escrita"></div>
          <div class="ficha-secao-titulo" style="margin-top:6px">🌟 Destaque da Atividade</div>
          <div class="ficha-linha-escrita"></div><div class="ficha-linha-escrita"></div>
        </div>
      </div>
      <div class="ficha-rodape-nota">📌 Esta ficha integra o portfólio de Pensamento Computacional do aluno e pode ser usada em avaliações por competência.</div>
    </div>
  </div>
  <div class="pg-footer"><span>{{escola}} · {{professor}}</span><span>${_kitNome} — Ficha de Avaliação</span><span>${pgFicha} / ${TOTAL}</span></div>
</div>`;

  const pgFamilia = pgFicha + 1;
  extra += `
<div class="pg pg-familia">
  <div class="secao-header" style="background:linear-gradient(135deg,#0c1a2e,#0ea5e9)">
    <div class="secao-header-sub">Para compartilhar com os responsáveis</div>
    <div class="secao-header-titulo"><span>👨‍👩‍👧</span> Guia para a Família</div>
  </div>
  <svg class="wave-sep" viewBox="0 0 794 32" preserveAspectRatio="none"><path d="M0,0 L794,0 L794,16 Q596,36 397,20 Q198,4 0,24 Z" fill="#0ea5e9"/><path d="M0,24 Q198,4 397,20 Q596,36 794,16 L794,32 L0,32 Z" fill="#f0f9ff"/></svg>
  <div class="familia-corpo">
    <div class="familia-intro">
      <div class="familia-intro-icon">💻</div>
      <div>
        <div class="familia-intro-titulo">O que estamos aprendendo?</div>
        <div class="familia-intro-desc">${_familiaIntroDesc}</div>
      </div>
    </div>
    <div class="familia-conceitos">
      ${_familiaConceitos.map(fc=>`<div class="familia-conceito-card" style="background:${fc.bg};border-color:${fc.cor};padding:0;overflow:hidden"><div style="background:${fc.cor};padding:8px 14px;display:flex;align-items:center;gap:8px"><span style="font-size:22px">${fc.emoji}</span><span style="font-family:'Fredoka One',cursive;font-size:16px;color:#fff">${fc.nome}</span></div><div style="padding:12px 14px"><div class="familia-conceito-def">${fc.def}</div><div class="familia-conceito-brincadeira"><strong>Em casa:</strong> ${fc.casa}</div></div></div>`).join('')}
    </div>
    <div class="familia-frase-final">${_familiaFrase}</div>
  </div>
  <div class="pg-footer" style="background:transparent;border-color:rgba(14,165,233,0.2)"><span>{{escola}} · {{professor}}</span><span>${_kitNome} — Guia para a Família</span><span>${pgFamilia} / ${TOTAL}</span></div>
</div>
</body>
</html>`;

  return base + extra;
}

module.exports = { buildHTML, defaultData: { conceitos, atividades, roteiros, adaptDicas } };

if (require.main === module) {
  const html = buildHTML({ conceitos, atividades, roteiros, adaptDicas });
  fs.writeFileSync(path.join(__dirname, 'index.html'), html, 'utf8');
  console.log('Despluga Avançado gerado: 27 páginas, 30 atividades, 10 roteiros.');
}
