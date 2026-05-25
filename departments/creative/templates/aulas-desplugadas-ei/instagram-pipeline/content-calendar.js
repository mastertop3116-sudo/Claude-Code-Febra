// ─────────────────────────────────────────────────────────────────────────────
// CALENDÁRIO EDITORIAL — Dinâmicas de Jiu-Jitsu Infantil
// Estrutura: cada dia tem `manha` (carrossel) e `noite` (post único)
// manha → sempre carrossel Dark Fighter
// noite → post único (dica, motivacional, engajamento ou produto)
// CTA de venda só aparece nos dias marcados (não em todo post)
// ─────────────────────────────────────────────────────────────────────────────

const calendario = {

  // ── SEGUNDA ──────────────────────────────────────────────────────────────
  1: {
    manha: {
      tipo:    'carrossel',
      estilo:  'dark',
      fontes:  ['anton'],
      textura: 'grunge',
      badge:   'Dica do Tatame',
      emoji:   '🥋',
      slides: [
        {
          tipo:   'capa',
          titulo: '3 formas de manter a atenção das crianças no tatame',
          texto:  'Crianças de 4 a 8 anos têm janela de atenção de 5 a 10 minutos. Veja o que fazer.',
        },
        {
          tipo:   'conteudo',
          numero: 2,
          titulo: 'Troque o estímulo a cada 8 minutos',
          texto:  'Se a atividade não muda nesse intervalo, você perde a turma — e aí vira só gritaria. Tenha sempre a próxima dinâmica pronta.',
        },
        {
          tipo:   'conteudo',
          numero: 3,
          titulo: 'Use dinâmicas com nome e regra simples',
          texto:  'Criança que entende a brincadeira em 30 segundos entra de cabeça. Complique a regra e ela trava — e trava os outros junto.',
        },
        {
          tipo:   'conteudo',
          numero: 4,
          titulo: 'Celebre cada acerto, por menor que seja',
          texto:  'Não espere o movimento perfeito pra elogiar. O elogio específico no momento certo cria o hábito de querer melhorar.',
        },
        {
          tipo:   'cta',
          titulo: 'Aplica hoje mesmo na sua aula!',
          texto:  'Essas 3 estratégias funcionam da primeira aula em diante. Salva esse carrossel e compartilha com outros senseis.',
        },
      ],
    },
    noite: {
      tipo:    'motivacional',
      estilo:  'dark',
      fontes:  ['bebas'],
      textura: 'grunge',
      conteudo: {
        frase:    'Sensei não ensina só golpe. Ensina caráter.',
        contexto: 'A criança vai esquecer a posição de guarda. Mas nunca vai esquecer o professor que acreditou nela quando ela caiu — e ensinou a levantar.',
        cta:      '🥋 Marca aquele sensei que transforma vidas dentro e fora do tatame!',
      },
    },
  },

  // ── TERÇA ─────────────────────────────────────────────────────────────────
  2: {
    manha: {
      tipo:    'carrossel',
      estilo:  'dark',
      fontes:  ['gagalin'],
      textura: 'halftone',
      badge:   'Erro Comum',
      emoji:   '⚠️',
      slides: [
        {
          tipo:   'capa',
          titulo: '5 erros que fazem as crianças abandonar o jiu-jitsu',
          texto:  'A maioria dos senseis comete pelo menos 3 desses. Veja se você está nessa lista.',
        },
        {
          tipo:   'conteudo',
          numero: 2,
          titulo: 'Aula sem progressão percebida',
          texto:  'A criança precisa sentir que evoluiu toda aula — não só na hora da faixa. Mini conquistas diárias seguram a turma.',
        },
        {
          tipo:   'conteudo',
          numero: 3,
          titulo: 'Repetição sem variação',
          texto:  'Fazer a mesma sequência toda semana mata a curiosidade. Dinâmicas diferentes mantêm o interesse aceso.',
        },
        {
          tipo:   'conteudo',
          numero: 4,
          titulo: 'Ignorar a fase da criança',
          texto:  'Uma aula para 5 anos não pode ser igual à de 12. Respeitar o desenvolvimento muda tudo na retenção.',
        },
        {
          tipo:   'conteudo',
          numero: 5,
          titulo: 'Comparar crianças entre si',
          texto:  'Cada criança tem seu tempo. Comparação pública cria frustração — e o pai retira da academia na semana seguinte.',
        },
        {
          tipo:   'cta',
          titulo: 'Quantos você comete?',
          texto:  'Comenta aqui o número. Sem julgamento — todo sensei passou por isso.',
        },
      ],
    },
    noite: {
      tipo:    'engajamento',
      estilo:  'color',
      fontes:  ['gagalin'],
      conteudo: {
        pergunta: 'Qual é o maior desafio nas suas aulas de jiu-jitsu infantil?',
        opcoes:   ['Manter a atenção 😩', 'Falta de material pronto 📋', 'Turma muito agitada 🌪️', 'Pais exigentes demais 😅'],
        contexto: 'Me conta nos comentários! Quero entender o que mais trava os senseis na hora de ensinar os pequenos.',
        cta:      '💬 Comenta aqui embaixo — sua resposta pode ajudar outros senseis!',
      },
    },
  },

  // ── QUARTA ────────────────────────────────────────────────────────────────
  3: {
    manha: {
      tipo:    'carrossel',
      estilo:  'dark',
      fontes:  ['bebas'],
      textura: 'concrete',
      badge:   'Método na Prática',
      emoji:   '🎯',
      slides: [
        {
          tipo:   'capa',
          titulo: 'Como criar uma aula infantil que a criança pede pra voltar',
          texto:  'Não é sobre o golpe perfeito. É sobre a experiência que você cria no tatame.',
        },
        {
          tipo:   'conteudo',
          numero: 2,
          titulo: 'Começa com um ritual de entrada',
          texto:  'Um cumprimento especial, uma frase da turma, um gesto do grupo. Ritual cria pertencimento — e pertencimento cria fidelidade.',
        },
        {
          tipo:   'conteudo',
          numero: 3,
          titulo: 'Usa desafios com nome próprio',
          texto:  '"Desafio da Rolada", "Batalha do Equilíbrio". Nome cria identidade. Identidade cria memória. Memória cria volta.',
        },
        {
          tipo:   'conteudo',
          numero: 4,
          titulo: 'Termina com celebração coletiva',
          texto:  'Os últimos 5 minutos definem o que a criança lembra da aula. Termine com energia positiva — não com correção.',
        },
        {
          tipo:   'cta',
          titulo: 'Qual ritual você usa na sua aula?',
          texto:  'Conta nos comentários. Vou responder todos.',
        },
      ],
    },
    noite: {
      tipo:    'dica',
      estilo:  'dark',
      fontes:  ['barlow'],
      textura: 'concrete',
      conteudo: {
        titulo:   'Por que as crianças abandonam as aulas de jiu-jitsu?',
        dica:     'Não é falta de interesse. É falta de progressão percebida. A criança precisa sentir que está evoluindo — toda aula, não só na hora da faixa.',
        destaque: 'Como criar essa sensação de evolução:',
        resposta: '✅ Mini desafios com nome ("Desafio da Rolada")\n✅ Registro visual do que aprendeu hoje\n✅ Elogio específico, não genérico ("Você melhorou a postura no solo!")',
        cta:      '🏆 Salva e compartilha com os senseis da sua academia!',
      },
    },
  },

  // ── QUINTA ────────────────────────────────────────────────────────────────
  4: {
    manha: {
      tipo:    'carrossel',
      estilo:  'dark',
      fontes:  ['barlow'],
      textura: 'grunge',
      badge:   'Dinâmica Pronta',
      emoji:   '🏆',
      slides: [
        {
          tipo:   'capa',
          titulo: 'Dinâmica do Caranguejo — testa equilíbrio e gera caos controlado',
          texto:  'Funciona de 4 a 12 anos. Não precisa de equipamento. Pode aplicar hoje.',
        },
        {
          tipo:   'conteudo',
          numero: 2,
          titulo: 'O que é',
          texto:  'As crianças se movem em posição de caranguejo (barriga pra cima, apoio nas mãos e pés) tentando derrubar o adversário sem cair.',
        },
        {
          tipo:   'conteudo',
          numero: 3,
          titulo: 'Por que funciona',
          texto:  'Treina equilíbrio, força de quadril e visão periférica — tudo que o jiu-jitsu exige — em formato de brincadeira. A criança não percebe que está treinando.',
        },
        {
          tipo:   'conteudo',
          numero: 4,
          titulo: 'Como aplicar',
          texto:  'Divide em duplas. 3 rounds de 45 segundos. Quem sair da posição perde o ponto. Semifinal e final com os vencedores.',
        },
        {
          tipo:   'cta',
          titulo: 'Testou na aula? Me conta!',
          texto:  'Comenta aqui como foi. Toda semana posto uma dinâmica nova pronta pra usar.',
        },
      ],
    },
    noite: {
      tipo:    'produto',
      estilo:  'color',
      fontes:  ['gagalin'],
      conteudo: {
        gancho:   'Você improvisa demais e planeja de menos nas aulas infantis?',
        problema: 'Turma dispersa em 5 min. Você pedindo silêncio o tempo todo. Concorrente lotado.',
        solucao:  '+250 dinâmicas prontas pra aplicar no tatame — ainda hoje.',
        prova:    'Alinhado à BNCC. Funciona de 4 a 14 anos. Resultado na primeira aula.',
        cta:      '👇 Link na bio — garanta agora com bônus exclusivos!',
        urgencia: '🔥 Oferta por tempo limitado',
      },
    },
  },

  // ── SEXTA ─────────────────────────────────────────────────────────────────
  5: {
    manha: {
      tipo:    'carrossel',
      estilo:  'dark',
      fontes:  ['anton'],
      textura: 'halftone',
      badge:   'Verdade Dura',
      emoji:   '💡',
      slides: [
        {
          tipo:   'capa',
          titulo: 'O que separa um sensei mediano de um sensei inesquecível',
          texto:  'Não é o cinturão. Não é o tempo de academia. É isso aqui.',
        },
        {
          tipo:   'conteudo',
          numero: 2,
          titulo: 'Ele sabe o nome de cada criança no primeiro dia',
          texto:  'Parece óbvio. Mas poucos fazem questão de memorizar. O nome é a primeira forma de respeito.',
        },
        {
          tipo:   'conteudo',
          numero: 3,
          titulo: 'Ele elogia o esforço, não o resultado',
          texto:  '"Você tentou mais vezes hoje" vale mais que "você ganhou". Esforço é o que a criança pode controlar.',
        },
        {
          tipo:   'conteudo',
          numero: 4,
          titulo: 'Ele tem aula planejada — sempre',
          texto:  'Improvisar uma vez por semana? Os alunos percebem. A turma sente quando o sensei chegou preparado.',
        },
        {
          tipo:   'cta',
          titulo: 'Qual desses você já faz?',
          texto:  'Comenta A, B ou C — sem pressão. Cada passo conta.',
        },
      ],
    },
    noite: {
      tipo:    'motivacional',
      estilo:  'color',
      fontes:  ['bebas'],
      conteudo: {
        frase:    'O tatame ensina o que a sala de aula não consegue.',
        contexto: 'Cair e levantar. Perder e tentar de novo. Respeitar quem é diferente. Isso não está no livro didático — está no tatame com você, sensei.',
        cta:      '🥋 Compartilha com quem precisa ler isso hoje.',
      },
    },
  },

  // ── SÁBADO ────────────────────────────────────────────────────────────────
  6: {
    manha: {
      tipo:    'carrossel',
      estilo:  'dark',
      fontes:  ['gagalin'],
      textura: 'concrete',
      badge:   'Sábado de Treino',
      emoji:   '🥋',
      slides: [
        {
          tipo:   'capa',
          titulo: 'Aula de sábado: como aproveitar o melhor dia da semana',
          texto:  'Sábado é o dia que a criança mais quer estar no tatame. Não desperdice essa energia.',
        },
        {
          tipo:   'conteudo',
          numero: 2,
          titulo: 'Comece com uma disputa rápida',
          texto:  'Nos primeiros 10 minutos, coloque a turma em competição amistosa. A energia do sábado pede movimento imediato — não alongamento estático.',
        },
        {
          tipo:   'conteudo',
          numero: 3,
          titulo: 'Reserve tempo para o jogo livre supervisionado',
          texto:  'Deixe as crianças aplicarem o que aprenderam na semana em situação real. É onde o aprendizado se consolida.',
        },
        {
          tipo:   'conteudo',
          numero: 4,
          titulo: 'Termine com a "estrela da semana"',
          texto:  'Escolha uma criança que se destacou na semana — não pelo golpe, mas pela atitude. Reconhecimento público cria referência positiva.',
        },
        {
          tipo:   'cta',
          titulo: 'Bom treino, sensei!',
          texto:  'Salva esse carrossel pra usar na aula de hoje.',
        },
      ],
    },
    noite: {
      tipo:    'produto',
      estilo:  'dark',
      fontes:  ['gagalin'],
      textura: 'concrete',
      conteudo: {
        gancho:   'Sábado é dia de treino. Mas a sua aula infantil está pronta?',
        problema: 'Se você chega no tatame sem plano, a turma percebe — e a bagunça começa.',
        solucao:  '+250 Dinâmicas de Jiu-Jitsu Infantil. Acesso imediato, aplica hoje.',
        prova:    'Certificado de Jiu-Jiteiro + Jogos de Luta + 100 Exercícios de bônus grátis.',
        cta:      '👇 Link na bio. Garantia de 7 dias ou dinheiro de volta.',
        urgencia: '🥋 Já são centenas de academias usando',
      },
    },
  },

  // ── DOMINGO ───────────────────────────────────────────────────────────────
  0: {
    manha: {
      tipo:    'carrossel',
      estilo:  'dark',
      fontes:  ['poppins'],
      textura: 'grunge',
      badge:   'Reflexão',
      emoji:   '🌟',
      slides: [
        {
          tipo:   'capa',
          titulo: 'Por que você escolheu ensinar jiu-jitsu para crianças?',
          texto:  'Não precisa ser uma resposta perfeita. Mas precisa ser honesta. Domingo é dia de lembrar.',
        },
        {
          tipo:   'conteudo',
          numero: 2,
          titulo: 'Você transforma vidas sem perceber',
          texto:  'A criança tímida que chegou há 6 meses já faz apresentação na frente da turma. Você fez isso acontecer.',
        },
        {
          tipo:   'conteudo',
          numero: 3,
          titulo: 'Seu tatame é um lugar seguro',
          texto:  'Para muitas crianças, a academia é o único lugar onde erraram e não foram punidas por isso. Onde o esforço é celebrado.',
        },
        {
          tipo:   'conteudo',
          numero: 4,
          titulo: 'Isso vai além do esporte',
          texto:  'Daqui a 20 anos, essas crianças vão lembrar de você. Não da chave de braço — de você.',
        },
        {
          tipo:   'cta',
          titulo: 'Obrigado por ser esse sensei.',
          texto:  'Descansa. Semana que vem tem mais tatame.',
        },
      ],
    },
    noite: {
      tipo:    'motivacional',
      estilo:  'color',
      fontes:  ['poppins'],
      conteudo: {
        frase:    'O tatame é onde as crianças aprendem a não ter medo de cair.',
        contexto: 'E isso vale pra vida inteira. Obrigado por ser o sensei que faz essa diferença todos os dias.',
        cta:      '🌟 Descansa, sensei. Semana que vem tem mais tatame!',
      },
    },
  },

};

function getConteudoHoje(periodo, diaSemana) {
  const dia = diaSemana !== undefined ? diaSemana : new Date().getDay();
  const diaCalendario = calendario[dia];
  if (!diaCalendario) return null;
  if (periodo === 'manha') return diaCalendario.manha;
  if (periodo === 'noite') return diaCalendario.noite;
  return diaCalendario;
}

function getConteudoSemana() {
  return calendario;
}

module.exports = { getConteudoHoje, getConteudoSemana, calendario };
