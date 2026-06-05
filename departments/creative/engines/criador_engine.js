// ============================================================
// MAX Criador Engine
// Fluxo: params → conteúdo GPT-4o → PDF Puppeteer → resultado
// ============================================================

'use strict';

const path          = require('path');
const fs            = require('fs');
const OpenAI        = require('openai');
const aprendizados  = require('../../../utils/aprendizados');
const { buscarImagemCapa, popularNicho, garantirImagemCapa, gerarImagemIA } = require('../../../utils/imageLibrary');

const TEMPLATE_PATH      = path.join(__dirname, '../templates/criador-universal/index.html');
const TEMPLATE_KIDS_PATH = path.join(__dirname, '../templates/criador-kids/index.html');
const TIPOS_KIDS = ['atividade_infantil','plano_de_aula','receita','proposta','roteiro_live','ficha_dinamica'];

// ── Paletas por NICHO (sobrepõe paleta por tipo) ────────────
// Ordem importa: primeiro match vence. Nichos mais específicos vêm antes.
const PALETAS_NICHO = [
  // 1. Emagrecimento / Fitness / Saúde
  { palavras: ['emagrecimento','emagrecer','dieta','saúde','saudável','fitness','academia','nutrição','peso','corpo','metabolismo','barriga','gordo','magro','lowcarb','detox'], primaria: '#10b981', secundaria: '#34d399', bg: '#051a10' },

  // 2. Marketing Digital / Social Media / Tráfego
  { palavras: ['marketing digital','tráfego','reels','conteúdo','copywriting','funil','leads','social media','anúncios','stories','engajamento','copy','lançamento','afiliado'], primaria: '#f97316', secundaria: '#fdba74', bg: '#180a00' },

  // 3. Finanças / Renda Extra / Empreendedorismo
  { palavras: ['finanças','financeiro','dinheiro','renda','investimento','lucro','mei','empreendedor','negócio','vender','vendas','faturar','riqueza','orçamento','dívida','economizar','patrimônio'], primaria: '#f59e0b', secundaria: '#fcd34d', bg: '#181000' },

  // 4. Beleza / Skincare / Estética
  { palavras: ['beleza','cabelo','maquiagem','pele','estética','unhas','skincare','sobrancelha','cílios','depilação','procedimento','tratamento facial','coloração'], primaria: '#ec4899', secundaria: '#f9a8d4', bg: '#180710' },

  // 5. Moda / Estilo / Imagem Pessoal
  { palavras: ['moda','estilo','looks','roupas','consultoria de imagem','guarda-roupa','tendência','outfit','cápsula','visagismo','personal stylist'], primaria: '#c084fc', secundaria: '#e9d5ff', bg: '#120718' },

  // 6. Espiritualidade / Fé / Cristão / Devocional
  { palavras: ['espiritualidade','fé','bíblia','deus','oração','devocional','cristão','cristã','missão','igreja','evangelho','palavra','cura','ungido','profecia'], primaria: '#d97706', secundaria: '#fbbf24', bg: '#181000' },

  // 7. Desenvolvimento Pessoal / Mindset / Autoconhecimento
  { palavras: ['desenvolvimento pessoal','mindset','autoconhecimento','mentalidade','hábitos','disciplina','propósito','motivação','crescimento','evolução','alta performance','reprogramação'], primaria: '#7c3aed', secundaria: '#c4b5fd', bg: '#0d0718' },

  // 8. Relacionamentos / Amor / Psicologia Emocional
  { palavras: ['relacionamento','amor','namoro','casamento','família','psicologia','emoções','trauma','comunicação','separação','autoestima','ansiedade','depressão','apego'], primaria: '#db2777', secundaria: '#fbcfe8', bg: '#180710' },

  // 9a. Sono / Dormir / Insônia / Descanso — LUA, NOITE, ÍNDIGO
  { palavras: ['sono','dormir','insônia','insonia','descanso','noite','acordar','cama','qualidade do sono','higiene do sono','apneia'], primaria: '#818cf8', secundaria: '#c7d2fe', bg: '#06071a' },

  // 9b. Meditação / Mindfulness / Bem-estar — SPA, ZEN, TEAL PROFUNDO
  { palavras: ['meditação','mindfulness','bem-estar','estresse','respiração','yoga','equilíbrio','consciência','paz interior','gratidão','chakra','frequência','espiritualidade zen'], primaria: '#0d9488', secundaria: '#5eead4', bg: '#031412' },

  // 10. Produtividade / Organização / Planner
  { palavras: ['produtividade','organização','planner','rotina','agenda','gestão do tempo','foco','metas','planejamento','método','sistemática','bullet journal','kanban'], primaria: '#0ea5e9', secundaria: '#7dd3fc', bg: '#030f18' },

  // 10.5 Artes marciais / Luta (jiu-jitsu, judô, karatê) — cor dominante AZUL (tatame/faixa).
  // Vem ANTES da educação pra "jiu-jitsu infantil" pegar a cor da LUTA, não a de escola.
  { palavras: ['jiu-jitsu','jiu jitsu','jiujitsu','jiu','jitsu','bjj','judô','judo','karatê','karate','taekwondo','luta','lutas','tatame','faixa','marcial','grappling','wrestling','muay thai'], primaria: '#2563eb', secundaria: '#60a5fa', bg: '#0a1224' },

  // 11. Educação Infantil / Pedagogia / Professor
  { palavras: ['educação','professor','escola','bncc','criança','pedagogia','infantil','aula','plano de aula','alfabetização','ensino fundamental','maternal','creche','aluno','sala de aula'], primaria: '#3b82f6', secundaria: '#93c5fd', bg: '#070f18' },

  // 12. Concurso / Vestibular / ENEM / Estudo
  { palavras: ['concurso','vestibular','enem','redação','concurseiro','aprovação','reta final','simulado','faculdade','universidade','gabarito','questões','estudo dirigido'], primaria: '#4338ca', secundaria: '#a5b4fc', bg: '#060718' },

  // 13. Culinária / Confeitaria / Receitas / Gastronomia
  { palavras: ['confeitaria','bolo','doce','culinária','gastronomia','receita','cozinha','buffet','candy','fitfood','salgado','torta','brigadeiro','bolacha','sobremesa'], primaria: '#f43f5e', secundaria: '#fda4af', bg: '#180309' },

  // 14. Artesanato / Crochê / Costura / DIY — TERRACOTA, QUENTE, ARTESANAL
  { palavras: ['artesanato','crochê','costura','bordado','pintura','customização','patchwork','tricô','feltro','ateliê','handmade','diy','renda','macramê'], primaria: '#c2410c', secundaria: '#fdba74', bg: '#150503' },

  // 15. Pet / Animais / Adestramento — ÂMBAR CALOROSO, AMIGÁVEL
  { palavras: ['pet','cachorro','gato','animal','veterinário','adestramento','banho e tosa','raça','filhote','tutor','adoção','comportamento animal'], primaria: '#ca8a04', secundaria: '#fde68a', bg: '#130f00' },

  // 16. Esportes / Jiu-Jitsu / Luta / Atletismo
  { palavras: ['jiu','luta','esporte','marcial','atleta','competição','futebol','corrida','triathlon','crossfit','musculação','fisiculturismo','boxe','treino esportivo'], primaria: '#ef4444', secundaria: '#fca5a5', bg: '#180707' },

  // 17. Fotografia / Vídeo / Design / Arte Digital
  { palavras: ['fotografia','foto','câmera','vídeo','edição','design','criativo','arte','lightroom','premiere','canva','illustrator','audiovisual'], primaria: '#a855f7', secundaria: '#d8b4fe', bg: '#0f0718' },

  // 18. Coaching / Mentoria / Alta Performance
  { palavras: ['coaching','coach','mentoria','mentor','alta performance','liderança','gestão','lider'], primaria: '#7c3aed', secundaria: '#c4b5fd', bg: '#0d0718' },

  // 19. Maternidade / Gravidez / Bebê / Família com filhos
  { palavras: ['maternidade','gravidez','bebê','bebe','gestante','amamentação','parto','infantil gestação','mãe e filho','primeira infância'], primaria: '#f472b6', secundaria: '#fbcfe8', bg: '#190710' },

  // 20. Saúde Mental / Psicologia / Terapia / Ansiedade
  { palavras: ['saúde mental','terapia','terapeuta','psicologia','psicólogo','burnout','equilíbrio emocional','mente sã','bem-estar mental'], primaria: '#8b5cf6', secundaria: '#c4b5fd', bg: '#0c0718' },

  // 21. Idiomas / Inglês / Espanhol / Fluência
  { palavras: ['inglês','ingles','espanhol','francês','idioma','fluência','fluencia','bilingue','bilíngue','speaking','conversação'], primaria: '#0284c7', secundaria: '#7dd3fc', bg: '#03101a' },

  // 22. Cripto / Blockchain / Web3 / Investimento digital
  { palavras: ['cripto','crypto','bitcoin','blockchain','web3','nft','defi','token','criptomoeda'], primaria: '#f97316', secundaria: '#fdba74', bg: '#150800' },

  // 23. Imóveis / Corretagem / Mercado imobiliário
  { palavras: ['imóveis','imoveis','corretor','corretagem','imobiliária','imobiliaria','apartamento','venda de imóveis','lançamento imobiliário'], primaria: '#0f766e', secundaria: '#5eead4', bg: '#030f0d' },

  // 24. Política / Marketing Eleitoral / Gestão Pública — AZUL AUTORIDADE + OURO
  { palavras: ['política','politica','político','politico','eleição','eleicao','candidato','vereador','prefeito','deputado','senador','mandato','campanha eleitoral','marketing político','marketing politico','gestão pública','gestao publica','servidor público','servidor publico','administração pública','poder executivo','poder legislativo'], primaria: '#1d4ed8', secundaria: '#93c5fd', bg: '#020b1a' },

  // 25. Jurídico / Direito / OAB / Advocacia
  { palavras: ['direito','jurídico','juridico','advocacia','advogado','oab','contrato','lei','legislação','legislacao','processo','juridico','trabalhista','penal','civil','tributário'], primaria: '#475569', secundaria: '#cbd5e1', bg: '#0a0c10' },

  // 26. Música / Canto / Produção Musical / DJ
  { palavras: ['música','musica','canto','cantor','cantora','violão','guitarra','piano','produção musical','dj','beat','melodia','vocal','instrumento'], primaria: '#7e22ce', secundaria: '#e9d5ff', bg: '#0d0518' },
];

// ── Ilustrações por nicho (SVGs locais) ─────────────────────
const ILUST_DIR = path.join(__dirname, '../../../public/assets/illus');
const ILUSTRACOES_NICHO = [
  { palavras: ['sono','insônia','dormir','noite','descanso','cama'], arquivo: 'sono.svg' },
  { palavras: ['meditação','relaxamento','mindfulness','yoga','chakra','respiração','ansiedade','bem-estar','paz'], arquivo: 'meditacao.svg' },
  { palavras: ['natureza','jardinagem','equilíbrio','tranquilo'], arquivo: 'bem-estar.svg' },
  { palavras: ['produtividade','rotina','manhã','organização','agenda','planner','hábito'], arquivo: 'manha-produtiva.svg' },
  { palavras: ['fitness','academia','exercício','treino','musculação','corrida','emagrecer','dieta','corpo'], arquivo: 'fitness.svg' },
  { palavras: ['finanças','financeiro','orçamento','dívida','economizar','poupança','riqueza'], arquivo: 'financas.svg' },
  { palavras: ['crescimento','resultado','performance','métricas','análise','dados','renda extra'], arquivo: 'crescimento.svg' },
  { palavras: ['dinheiro','renda','lucro','faturar','vendas','mei','empreendedor'], arquivo: 'renda.svg' },
  { palavras: ['marketing digital','instagram','reels','stories','conteúdo','copywriting','funil','leads','afiliado'], arquivo: 'marketing.svg' },
  { palavras: ['apresentação','comunicação','palestra','oratória','liderança','público'], arquivo: 'apresentacao.svg' },
  { palavras: ['negócio','empreendimento','startup','plano','estratégia','empresa'], arquivo: 'negocios.svg' },
  { palavras: ['propósito','caminho','direção','descoberta','desenvolvimento pessoal','mindset','hábitos'], arquivo: 'proposito.svg' },
  { palavras: ['sonho','desejo','conquista','objetivo','meta','realização','meta'], arquivo: 'sonho.svg' },
  { palavras: ['educação','professor','escola','bncc','criança','pedagogia','estudo','aprender','enem','concurso'], arquivo: 'educacao.svg' },
  { palavras: ['relacionamento','amor','namoro','casamento','família','casal','comunicação'], arquivo: 'relacionamento.svg' },
  { palavras: ['equipe','parceria','trabalho','colaboração','grupo'], arquivo: 'equipe.svg' },
  { palavras: ['design','arte','fotografia','câmera','criativo','canva','edição','audiovisual'], arquivo: 'criativo.svg' },
  { palavras: ['podcast','áudio','música','conteúdo digital','gravação','live'], arquivo: 'conteudo.svg' },
  { palavras: ['pet','cachorro','gato','animal','veterinário','adestramento'], arquivo: 'pet.svg' },
  { palavras: ['checklist','verificação','lista','protocolo','processo','passo a passo'], arquivo: 'checklist.svg' },
  { palavras: ['viagem','aventura','lifestyle','moda','estilo','looks'], arquivo: 'lifestyle.svg' },
  { palavras: ['tecnologia','digital','ia','inteligência artificial','programação','software'], arquivo: 'tecnologia.svg' },
  { palavras: ['contrato','documento','proposta','acordo','assinatura','jurídico'], arquivo: 'documentos.svg' },
];

function detectarIlustracao(nicho, tema) {
  const txt = ((nicho||'') + ' ' + (tema||'')).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
  for (const il of ILUSTRACOES_NICHO) {
    if (il.palavras.some(w => txt.includes(w.normalize('NFD').replace(/[̀-ͯ]/g,'')))) {
      const filePath = path.join(ILUST_DIR, il.arquivo);
      if (fs.existsSync(filePath)) return fs.readFileSync(filePath, 'utf8');
    }
  }
  // fallback: pegar aleatório baseado no hash do nicho
  const files = fs.existsSync(ILUST_DIR) ? fs.readdirSync(ILUST_DIR).filter(f=>f.endsWith('.svg')) : [];
  if (!files.length) return null;
  const idx = txt.split('').reduce((a,c)=>a+c.charCodeAt(0),0) % files.length;
  return fs.readFileSync(path.join(ILUST_DIR, files[idx]), 'utf8');
}

function detectarPaletaNicho(nicho) {
  const n = (nicho || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  for (const p of PALETAS_NICHO) {
    if (p.palavras.some(w => n.includes(w.normalize('NFD').replace(/[̀-ͯ]/g, '')))) {
      return { primaria: p.primaria, secundaria: p.secundaria, bg: p.bg };
    }
  }
  return null; // sem match — usa paleta por tipo
}

// ── Paletas padrão por tipo ──────────────────────────────────
const CORES = {
  // ── Template Universal (adultos) ──
  ebook:             { primaria: '#6366f1', secundaria: '#818cf8', bg: '#0f0e1f' },
  workbook:          { primaria: '#10b981', secundaria: '#34d399', bg: '#071810' },
  guia:              { primaria: '#f59e0b', secundaria: '#fcd34d', bg: '#180f00' },
  checklist:         { primaria: '#22d3a5', secundaria: '#5eead4', bg: '#071812' },
  desafio:           { primaria: '#ef4444', secundaria: '#fca5a5', bg: '#180707' },
  planner:           { primaria: '#a855f7', secundaria: '#d8b4fe', bg: '#0f0718' },
  devocional:        { primaria: '#d97706', secundaria: '#fbbf24', bg: '#181000' },
  script_vsl:        { primaria: '#3b82f6', secundaria: '#93c5fd', bg: '#070f18' },
  // ── Template Kids (educacional/infantil) ──
  atividade_infantil:{ primaria: '#FF6B6B', secundaria: '#FFD93D', bg: '#fff' },
  plano_de_aula:     { primaria: '#4D96FF', secundaria: '#93c5fd', bg: '#fff' },
  receita:           { primaria: '#FF9F43', secundaria: '#ffd0a0', bg: '#fff' },
  proposta:          { primaria: '#6BCB77', secundaria: '#a7f3d0', bg: '#fff' },
  roteiro_live:      { primaria: '#C77DFF', secundaria: '#e9d5ff', bg: '#fff' },
  ficha_dinamica:    { primaria: '#16a34a', secundaria: '#86efac', bg: '#fff' },
  debate_politico:   { primaria: '#1d4ed8', secundaria: '#93c5fd', bg: '#020b1a' },
};

// ── Cores por FAIXA (graduação) — pinta a página inteira na cor da faixa ──
// Cada entrada: primaria (cor forte p/ títulos/destaques), secundaria (clara p/ degradês), rotulo (nome exibido).
const PALETAS_FAIXA = {
  branca:   { primaria: '#64748b', secundaria: '#cbd5e1', bg: '#fff', rotulo: 'Faixa Branca'  },
  cinza:    { primaria: '#6b7280', secundaria: '#d1d5db', bg: '#fff', rotulo: 'Faixa Cinza'   },
  amarela:  { primaria: '#ca8a04', secundaria: '#fde047', bg: '#fff', rotulo: 'Faixa Amarela' },
  laranja:  { primaria: '#ea580c', secundaria: '#fdba74', bg: '#fff', rotulo: 'Faixa Laranja' },
  verde:    { primaria: '#16a34a', secundaria: '#86efac', bg: '#fff', rotulo: 'Faixa Verde'   },
  azul:     { primaria: '#2563eb', secundaria: '#93c5fd', bg: '#fff', rotulo: 'Faixa Azul'    },
  roxa:     { primaria: '#7c3aed', secundaria: '#c4b5fd', bg: '#fff', rotulo: 'Faixa Roxa'    },
  marrom:   { primaria: '#92400e', secundaria: '#d6b48c', bg: '#fff', rotulo: 'Faixa Marrom'  },
  preta:    { primaria: '#1f2937', secundaria: '#9ca3af', bg: '#fff', rotulo: 'Faixa Preta'   },
  vermelha: { primaria: '#dc2626', secundaria: '#fca5a5', bg: '#fff', rotulo: 'Faixa Vermelha'},
};
// Aceita 'azul', 'Faixa Azul', 'faixa-azul', 'blue' etc.
function paletaFaixa(faixa) {
  if (!faixa) return null;
  const f = String(faixa).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const map = { white:'branca', grey:'cinza', gray:'cinza', yellow:'amarela', orange:'laranja',
                green:'verde', blue:'azul', purple:'roxa', brown:'marrom', black:'preta', red:'vermelha' };
  for (const chave of Object.keys(PALETAS_FAIXA)) if (f.includes(chave)) return { ...PALETAS_FAIXA[chave], chave };
  for (const en of Object.keys(map)) if (f.includes(en)) return { ...PALETAS_FAIXA[map[en]], chave: map[en] };
  return null;
}

const LABELS = {
  ebook:             'E-book',
  workbook:          'Workbook',
  guia:              'Guia',
  checklist:         'Checklist',
  desafio:           'Desafio',
  planner:           'Planner',
  devocional:        'Devocional',
  script_vsl:        'Script VSL',
  atividade_infantil:'Atividade Infantil',
  plano_de_aula:     'Plano de Aula',
  receita:           'Receita',
  proposta:          'Proposta',
  roteiro_live:      'Roteiro de Live',
  ficha_dinamica:    'Ficha de Dinâmica',
  debate_politico:   'Debate Político',
};

// ── Tom por tipo: autoral (1ª pessoa) ou objetivo (técnico/direto) ──
// Conselho especialista low ticket BR: plano de aula, receita, proposta, checklist
// devem ser objetivos e diretos — professor/comprador quer usar, não ouvir história pessoal
const TOM_TIPO = {
  autoral:   ['ebook','workbook','guia','desafio','planner','devocional','script_vsl','roteiro_live'],
  objetivo:  ['checklist','plano_de_aula','receita','proposta','atividade_infantil','ficha_dinamica'],
};
function isTipoObjetivo(tipo) { return TOM_TIPO.objetivo.includes(tipo); }

// ── Schemas JSON por tipo ───────────────────────────────────
function getPromptSchema(tipo, extensao, params = {}) {
  const qtd = extensao === 'longo' ? '10 a 12' : extensao === 'medio' ? '7 a 9' : '5 a 6';
  const wpp  = extensao === 'longo' ? '800 a 1000' : extensao === 'medio' ? '600 a 800' : '400 a 550';

  const schemas = {
    ebook: `Retorne JSON com exatamente esta estrutura:
{
  "titulo": "título poderoso e específico (máx 12 palavras, sem ponto final)",
  "subtitulo": "subtítulo que reforça o benefício principal (máx 20 palavras)",
  "autor": "nome do autor",
  "introducao": "em 1ª pessoa — ESTRUTURA OBRIGATÓRIA: (1) abra com cena específica vivida pelo autor ('Quando eu tinha X anos e...', ou 'Num domingo às 23h, eu...'); (2) descreva o momento de virada com detalhe sensorial; (3) apresente o problema central do nicho com número; (4) explique o que este e-book entrega e por que é diferente; (5) cite 1 caso real com nome brasileiro, resultado com número e prazo. (220 a 300 palavras — NUNCA menos que 200)",
  "capitulos": [
    {
      "numero": 1,
      "titulo": "título do capítulo — direto, sem rodeios",
      "conteudo": "texto corrido (${wpp} palavras) — ESTRUTURA: (1) PROBLEMA: dor real do nicho; (2) SOLUÇÃO com passo específico; (3) desenvolva o conteúdo principal. REGRA CULTURAL: se o tema/nicho envolver técnicas milenares, ancestrais, orientais ou históricas — mencione a origem real da técnica (nome nativo, civilização, período) e como ela era praticada originalmente antes de conectar ao contexto moderno. SEM incluir a dica, exemplo e ação aqui — eles aparecem nos campos abaixo.",
      "dica": "dica prática do autor em 1ª pessoa — 1 frase curta e direta, começa com 'Quando eu...' ou 'O que funcionou pra mim foi...' (máx 2 linhas)",
      "exemplo_real": "história concreta: '[Nome brasileiro], [idade] anos, [cidade] — [situação com número real]. Em [prazo], ela/ele [resultado mensurável].' (máx 3 linhas)",
      "acao_pratica": "tarefa que o leitor faz AGORA: '[Verbo imperativo] [número] [objeto concreto do nicho] em [prazo curto]. [Por que isso funciona em 1 frase.]' (máx 2 linhas)",
      "atencao": "erro comum neste ponto que arruína o resultado — 1 frase direta, começa com 'O erro mais comum aqui é...' (opcional, omita se não há erro relevante)",
      "pontos_chave": ["ponto direto e específico ao nicho — começa com verbo ou número", "idem", "idem"],
      "citacao": "frase de impacto em 1ª pessoa do autor — algo que ele diria (máx 20 palavras)",
      "contraste": { "label_a": "label do lado negativo (ex: Sem Método, O Problema, Antes)", "label_b": "label do lado positivo (ex: Com Método, A Solução, Depois)", "itens_a": ["item negativo específico ao nicho (3–8 palavras)"], "itens_b": ["item positivo correspondente (3–8 palavras)"] },
      "equacao": { "a": "fator 1 (2–5 palavras)", "sub_a": "legenda opcional do fator 1", "b": "fator 2 (2–5 palavras)", "sub_b": "legenda opcional", "resultado": "resultado final (2–5 palavras)", "sub_r": "legenda do resultado" },
      "steps_visuais": ["passo 1 em 4–8 palavras", "passo 2", "passo 3"]
    }
  ],
  "conclusao": "conclusão em 1ª pessoa — o que o autor quer que o leitor faça HOJE, com 1 ação concreta e numerada (100 a 150 palavras)",
  "cta": "chamada para ação direta e específica — diz exatamente o que fazer agora (máx 50 palavras)"
}
OBRIGATÓRIO: gere de ${qtd} capítulos completos
REGRA DOS BLOCOS VISUAIS: use contraste, equacao e steps_visuais com parcimônia — no máximo 1 de cada por capítulo, apenas quando o conteúdo do capítulo tem uma comparação clara (contraste), uma fórmula de 3 elementos (equacao) ou uma sequência de passos (steps_visuais). Se não se encaixar naturalmente, omita o campo.`,

    workbook: `Retorne JSON com exatamente esta estrutura:
{
  "titulo": "título do workbook (máx 12 palavras)",
  "subtitulo": "resultado concreto e mensurável que o leitor terá ao completar",
  "autor": "nome do autor",
  "introducao": "em 1ª pessoa — ESTRUTURA OBRIGATÓRIA: (1) abra com a situação frustrante que o autor viveu antes de criar o método; (2) descreva a descoberta que mudou tudo com detalhe específico; (3) explique como este workbook estrutura o método passo a passo; (4) cite 1 resultado estimado ou real de quem completou ('Quem termina todos os exercícios costuma...') com número. (180 a 250 palavras — NUNCA menos que 160)",
  "modulos": [
    {
      "numero": 1,
      "titulo": "nome do módulo",
      "objetivo": "o que o leitor será capaz de fazer — começa com verbo de ação forte (ex: Calcular, Eliminar, Criar, Mapear)",
      "teoria": "em 1ª pessoa (180 a 250 palavras) — comece com 'Quando eu comecei a trabalhar com isso...' ou 'Uma vez, acompanhei [Nome], [perfil] que...'; mostre o problema, a descoberta e a solução com número concreto.",
      "dica": "dica do autor em 1ª pessoa — o detalhe que faz diferença neste módulo (1-2 linhas)",
      "exemplo_real": "história de alguém que aplicou este módulo: '[Nome], [idade], [cidade] — fez [ação] e obteve [resultado com número] em [prazo]' (máx 3 linhas)",
      "contraste": { "label_a": "estado antes (ex: Sem Sistema, O Problema)", "label_b": "estado depois (ex: Com Sistema, A Solução)", "itens_a": ["item negativo (3–7 palavras)"], "itens_b": ["item positivo (3–7 palavras)"] },
      "steps_visuais": ["passo do módulo em 4–8 palavras", "passo 2", "passo 3"],
      "exercicios": [
        {
          "titulo": "nome curto do exercício — verbo + objeto específico do nicho",
          "instrucao": "tarefa específica que só faz sentido para quem está neste nicho — use pergunta direta com número: 'Liste EXATAMENTE [N] [coisa do nicho] que você [situação]. Para cada um, escreva [o quê].' (2 a 3 frases)",
          "linhas": 6
        }
      ]
    }
  ],
  "reflexao_final": "em 1ª pessoa — o autor faz uma pergunta direta ao leitor e pede 1 compromisso com prazo específico (80 a 120 palavras)"
}
OBRIGATÓRIO: gere de ${qtd} módulos, cada um com 2 a 3 exercícios`,

    guia: `Retorne JSON com exatamente esta estrutura:
{
  "titulo": "título do guia passo a passo (máx 12 palavras)",
  "subtitulo": "promessa central — resultado esperado em [prazo]",
  "autor": "nome do autor",
  "introducao": "em 1ª pessoa — ESTRUTURA OBRIGATÓRIA: (1) abra com 1 situação concreta vivida pelo autor ou vista por ele, com detalhe específico ('Quando eu tinha [problema], ou Na noite em que atendi [Nome]...'); (2) apresente o problema central do nicho com dado ou número; (3) explique por que este guia existe e o que ele entrega; (4) cite 1 caso real de quem aplicou com nome brasileiro, idade, cidade e resultado mensurável. (200 a 280 palavras — NUNCA menos que 180)",
  "passos": [
    {
      "numero": 1,
      "titulo": "nome do passo — verbo imperativo + o quê",
      "descricao": "em 1ª pessoa (300 a 500 palavras). REGRA CULTURAL: se o tema/nicho envolver técnicas milenares, ancestrais, orientais, asiáticas, ayurvédicas, chinesas, japonesas, egípcias, indígenas ou de qualquer civilização/período histórico — OBRIGATÓRIO abrir com a origem real da técnica: nome original no idioma nativo (ex: 'Yoga Nidra', 'Pranayama', '4-7-8 do Pranayama indiano', 'Yoga-nidra dos Upanishads', 'técnica do sono militar do Exército dos EUA') + civilização/período + por que surgiu + como era praticada originalmente. Só então conecte com a aplicação moderna. Para temas sem origem histórica: 'A maioria erra aqui porque [erro].' → 'Eu mesmo errei quando...' → 'O que funciona: [solução com detalhe]'. SEM incluir dica, exemplo e ação aqui — ficam nos campos abaixo.",
      "acoes": ["ação concreta com verbo imperativo + critério de conclusão", "idem", "idem"],
      "contraste": { "label_a": "estado sem aplicar o passo (ex: Sem este passo)", "label_b": "estado com o passo aplicado", "itens_a": ["consequência negativa (3–7 palavras)"], "itens_b": ["benefício concreto (3–7 palavras)"] },
      "equacao": { "a": "elemento 1 (2–5 palavras)", "sub_a": "legenda", "b": "elemento 2 (2–5 palavras)", "sub_b": "legenda", "resultado": "resultado (2–5 palavras)", "sub_r": "legenda" },
      "steps_visuais": ["sub-passo em 4–8 palavras", "sub-passo 2", "sub-passo 3"],
      "dica": "dica do autor em 1ª pessoa — detalhe que não é óbvio neste passo (1-2 linhas)",
      "exemplo_real": "pessoa real que executou este passo: '[Nome], [perfil] — fez [ação] em [prazo] e conseguiu [resultado]' (máx 3 linhas)",
      "acao_pratica": "o que o leitor faz AGORA neste passo: '[Verbo] [número] [coisa] em [prazo]. Critério: [como saber se concluiu].' (máx 2 linhas)"
    }
  ],
  "conclusao": "em 1ª pessoa — o autor diz exatamente o que o leitor deve fazer nas próximas 24h (80 a 120 palavras)"
}
OBRIGATÓRIO: gere de ${qtd} passos detalhados
REGRA DOS BLOCOS VISUAIS: use contraste, equacao e steps_visuais com parcimônia — no máximo 1 de cada por passo, apenas quando o conteúdo pede naturalmente. Se não se encaixar, omita o campo.`,

    checklist: `Retorne JSON com exatamente esta estrutura:
{
  "titulo": "título do checklist (máx 12 palavras)",
  "subtitulo": "para quem é e o resultado de usá-lo",
  "autor": "nome do autor",
  "introducao": "em 1ª pessoa — o autor conta a situação que o fez criar este checklist ('Eu criei isso depois de ver [situação específica acontecer X vezes]...') (80 a 120 palavras)",
  "secoes": [
    {
      "titulo": "nome da seção (substantivo + contexto direto)",
      "descricao": "1 frase direta sobre o que esta seção previne ou garante",
      "itens": ["Verbo imperativo + ação específica ao nicho + detalhe concreto (ex: Confirme que o contrato tem multa de X% por rescisão antecipada)"]
    }
  ],
  "dica_final": "em 1ª pessoa — dica do autor sobre como usar o checklist, com 1 situação concreta onde ele salvou alguém (60 a 80 palavras)"
}
OBRIGATÓRIO: gere de 5 a 8 seções, cada uma com 5 a 8 itens
REGRA DOS ITENS: SEMPRE verbo imperativo (Verifique, Confirme, Liste, Calcule, Documente...) + detalhe específico do nicho + critério mensurável quando possível. PROIBIDO: itens genéricos que funcionariam para qualquer nicho`,

    desafio: `Retorne JSON com exatamente esta estrutura:
{
  "titulo": "nome do desafio (máx 12 palavras)",
  "subtitulo": "transformação concreta e mensurável em X dias",
  "autor": "nome do autor",
  "duracao": 21,
  "introducao": "em 1ª pessoa — o autor conta por que criou este desafio, qual transformação ele próprio viveu ou viu ('Eu criei este desafio porque vi [N] pessoas tentando [resultado] e travando em [ponto específico]') — inclua 1 resultado estimado de quem completa (100 a 150 palavras)",
  "semanas": [
    {
      "numero": 1,
      "tema": "tema central da semana — substantivo de ação",
      "descricao": "o que muda nesta semana, em 1ª pessoa — 'Na semana 1, eu quero que você [ação concreta]. A maioria das pessoas pula essa parte e por isso [consequência específica].' (100 a 150 palavras)",
      "dias": [
        {
          "numero": 1,
          "titulo": "nome do dia — verbo + objeto direto",
          "tarefa": "tarefa específica com número ou critério: '[Verbo] [N] [coisa concreta do nicho]. Leva [tempo estimado] e você vai perceber [resultado imediato].' (2 a 3 frases)",
          "afirmacao": "afirmação em 1ª pessoa do participante — começa com 'Eu [verbo presente]...' — específica ao nicho"
        }
      ]
    }
  ],
  "manifesto": "declaração em 1ª pessoa do participante — compromisso específico com prazo e número (60 a 80 palavras)"
}
OBRIGATÓRIO: gere exatamente 3 semanas com 7 dias cada`,

    planner: `Retorne JSON com exatamente esta estrutura:
{
  "titulo": "nome do planner (máx 12 palavras)",
  "subtitulo": "período e resultado concreto ao final",
  "autor": "nome do autor",
  "introducao": "em 1ª pessoa — o autor explica como usa este planner na própria rotina, com 1 hábito concreto e resultado mensurável ('Desde que comecei a usar esse método, eu [resultado específico]') (100 a 150 palavras)",
  "secoes": [
    {
      "titulo": "nome da seção",
      "descricao": "propósito em 1 frase — o que esta seção resolve ou garante",
      "campos": ["campo específico do nicho — não genérico"]
    }
  ],
  "rituais": [
    {
      "tipo": "Ritual Matinal",
      "passos": ["passo com tempo estimado e ação concreta do nicho"]
    }
  ],
  "citacao": "frase do próprio autor em 1ª pessoa — algo que ele diz para seus alunos (não citação famosa)"
}
OBRIGATÓRIO: gere de 5 a 7 seções e 3 rituais (matinal, noturno, semanal). Campos devem ser específicos ao nicho.`,

    devocional: `Retorne JSON com exatamente esta estrutura:
{
  "titulo": "título do devocional (máx 12 palavras)",
  "subtitulo": "tema espiritual central",
  "autor": "nome do autor",
  "prefacio": "em 1ª pessoa — o autor conta o momento de vida que o levou a escrever este devocional, inclui 1 situação concreta ('Eu estava em um período de...') (100 a 150 palavras)",
  "dias": [
    {
      "numero": 1,
      "titulo": "título do dia — direto, provoca curiosidade",
      "versiculo_ref": "Referência bíblica (ex: João 3:16)",
      "versiculo": "texto completo do versículo (versão NVI ou NVT)",
      "reflexao": "em 1ª pessoa (350 a 450 palavras) — ESTRUTURA: comece com 'Eu lembro de um dia em que...' ou 'Quando eu li esse versículo pela primeira vez...'; mostre a luta humana real por trás da passagem; conecte com uma situação cotidiana concreta ('Talvez você também esteja em um daqueles dias que...'); termine com 1 ação prática para o dia — específica e com critério ('Hoje, antes de dormir, escreva [número] coisas que...'). PROIBIDO: 'você pode', 'é possível', 'talvez queira', 'considere'",
      "perguntas": ["pergunta reflexiva que força honestidade — não tem resposta óbvia", "idem"],
      "oracao": "oração em 1ª pessoa do leitor — pessoal, específica ao tema do dia, como se o leitor estivesse realmente orando agora (5 a 8 linhas)"
    }
  ],
  "oracao_final": "oração de encerramento em 1ª pessoa do leitor — menciona a jornada dos 7 dias, específica ao tema (60 a 80 palavras)"
}
OBRIGATÓRIO: gere exatamente 7 dias completos`,

    script_vsl: `Retorne JSON com exatamente esta estrutura:
{
  "titulo": "nome do produto sendo vendido",
  "autor": "nome do apresentador",
  "partes": [
    { "nome": "GANCHO", "duracao_seg": 30, "script": "em 1ª pessoa — comece com declaração ousada baseada em experiência real: 'Eu descobri que [afirmação contraintuitiva específica ao nicho].' ou pergunta que paralisa: '[Situação específica e dolorosa do nicho]? Eu sei exatamente o que você está sentindo.' [olha para a câmera] (100 a 150 palavras)" },
    { "nome": "PROBLEMA", "duracao_seg": 60, "script": "em 1ª pessoa — 'Quando eu comecei no [nicho], eu também [erro/dor específica].' Descreva a dor com detalhes do nicho: números, situações reais, consequências concretas. Tom: empático, quem viveu isso (150 a 200 palavras)" },
    { "nome": "AGITAÇÃO", "duracao_seg": 60, "script": "em 1ª pessoa — 'E o pior é que, enquanto você não resolve isso, [consequência específica acontece].' Mostre o custo concreto de não agir: 'Em [prazo], isso vai custar [número/resultado]. Eu vi isso acontecer com [perfil de pessoa] mais de [N] vezes.' [tom mais grave] (150 a 200 palavras)" },
    { "nome": "SOLUÇÃO", "duracao_seg": 90, "script": "em 1ª pessoa — 'Foi aí que eu desenvolvi [nome do método/produto].' [pausa 2s] Apresente o produto como descoberta pessoal: 'Depois de [N anos/meses] trabalhando com [nicho], eu percebi que o que realmente funciona é...' Tom: revelação, não venda (200 a 250 palavras)" },
    { "nome": "AUTORIDADE", "duracao_seg": 45, "script": "em 1ª pessoa — história pessoal real com números: 'Eu comecei no [nicho] em [situação difícil]. Em [prazo], eu [resultado concreto].' Credenciais naturais: 'Desde então, ajudei mais de [N] pessoas a [resultado].' [gesticula ao mencionar resultados] (100 a 150 palavras)" },
    { "nome": "PROVA SOCIAL", "duracao_seg": 60, "script": "histórias em 1ª pessoa DE CLIENTES — 'A [Nome feminino], [idade], [profissão], me disse: [citação direta com resultado]. Ela foi de [situação antes] para [situação depois] em [prazo].' Repita com 2 perfis diferentes. [⚠️ ATENÇÃO: substitua por depoimentos reais antes de usar] (150 a 200 palavras)" },
    { "nome": "OFERTA", "duracao_seg": 90, "script": "em 1ª pessoa — 'Eu poderia cobrar [SEU_PRECO_ORIGINAL] por isso, porque [justificativa concreta de valor].' Lista bônus com valor unitário. 'Mas hoje, como [razão para desconto], você tem acesso a tudo por apenas [SEU_PRECO_OFERTA].' Garantia clara com prazo. [mostra dedos ao contar bônus] (200 a 250 palavras)" },
    { "nome": "CTA", "duracao_seg": 30, "script": "em 1ª pessoa — urgência real e justificada: 'Eu só consigo atender [N] pessoas nesta turma porque [razão real].' Instrução de ação em 1 passo. Termine: 'Eu te vejo do outro lado.' [aponta para a tela] (80 a 120 palavras)" }
  ]
}
OBRIGATÓRIO: preencha TODAS as 8 partes. Script como fala — frases curtas, pausas marcadas. 1ª pessoa em todos os blocos. PROIBIDO: 'você pode', 'é possível', 'considere', 'talvez'`,

    plano_de_aula: `Retorne JSON com exatamente esta estrutura:
{
  "titulo": "título do plano de aula (máx 10 palavras)",
  "componente": "componente curricular (ex: Língua Portuguesa, Matemática)",
  "ano_escolar": "faixa de ano (ex: 3º ao 5º ano do Ensino Fundamental)",
  "duracao": "duração estimada (ex: 50 minutos)",
  "habilidade_bncc": "código e descrição da habilidade BNCC principal",
  "objetivo": "o que o aluno será capaz de fazer ao final — começa com verbo (máx 2 linhas)",
  "materiais": ["material necessário com quantidade se aplicável"],
  "desenvolvimento": [
    {
      "fase": "Abertura / Desenvolvimento / Encerramento",
      "duracao": "tempo estimado (ex: 10 min)",
      "descricao": "o que o professor faz e o que o aluno faz — objetivo e específico (150 a 250 palavras)",
      "instrucoes": ["instrução direta para o professor — verbo imperativo + ação específica"]
    }
  ],
  "avaliacao": "como o professor avalia se o objetivo foi alcançado — critério mensurável e específico",
  "adaptacoes": "adaptações para alunos com necessidades especiais (1-2 sugestões concretas)",
  "dica_professor": "dica prática de quem já aplicou esta aula — 1 detalhe que faz diferença (1-2 linhas)"
}
OBRIGATÓRIO: 3 fases (Abertura, Desenvolvimento, Encerramento), cada uma com 2 a 3 instruções`,

    atividade_infantil: `Retorne JSON com exatamente esta estrutura:
{
  "titulo": "título da atividade (máx 8 palavras, lúdico e direto)",
  "componente": "componente curricular",
  "ano_escolar": "faixa etária/ano escolar",
  "duracao": "tempo estimado",
  "habilidade_bncc": "código BNCC",
  "objetivo": "o que o aluno aprende com esta atividade",
  "instrucao_professor": "como o professor apresenta a atividade para os alunos (2-3 frases simples)",
  "atividades": [
    {
      "tipo": "ligar_colunas | verdadeiro_falso | completar | sequencia | caca_palavras | colorir | responder",
      "titulo": "nome curto da atividade",
      "enunciado": "instrução para o aluno — linguagem simples, direta, para a faixa etária",
      "dados": {}
    }
  ]
}
REGRAS por tipo de atividade:
- ligar_colunas: dados = { "coluna_a": ["item1","item2",...], "coluna_b": ["correspondente1","correspondente2",...] } — mínimo 4 pares
- verdadeiro_falso: dados = { "itens": [{"texto":"afirmação","resposta":"V"},{"texto":"afirmação","resposta":"F"},...] } — mínimo 5 itens
- completar: dados = { "texto": "frase com ___lacuna___ para preencher", "banco_palavras": ["palavra1","palavra2",...] }
- sequencia: dados = { "itens": ["passo 1","passo 2","passo 3","passo 4"] }
- caca_palavras: dados = { "palavras": ["PALAVRA1","PALAVRA2","PALAVRA3","PALAVRA4","PALAVRA5"] }
- colorir: dados = { "instrucoes": ["Pinte o sol de amarelo","Pinte a árvore de verde",...] }
- responder: dados = { "perguntas": ["Pergunta 1?","Pergunta 2?","Pergunta 3?"], "linhas_resposta": 3 }
OBRIGATÓRIO: gere de 3 a 5 atividades variando os tipos`,

    ficha_dinamica: `Retorne JSON com exatamente esta estrutura — uma FICHA DE DINÂMICA prática e lúdica, pronta pro professor aplicar na aula (estilo ficha de atividade esportiva infantil):
{
  "titulo": "nome da dinâmica (curto, lúdico e marcante — ex: 'Ginga dos Animais', 'Guerra dos Cones', 'Pega-Pega da Base')",
  "subtitulo": "uma linha curta de contexto do nicho + 'Kids • Aula prática e lúdica' (ex: 'Jiu-Jitsu Kids - Aula prática e lúdica')",
  "faixa_etaria": "faixa etária recomendada (ex: '4 a 8 anos', '6 a 12 anos')",
  "duracao": "duração estimada (ex: '30 a 45 min')",
  "objetivo": "o que a dinâmica desenvolve na criança — 1 a 2 frases, começa com verbo no infinitivo (ex: 'Trabalhar coordenação, base e atenção de forma divertida')",
  "materiais": ["material com quantidade (ou 'Espaço livre no tatame' / 'Nenhum' se não precisar)"],
  "passo_a_passo": [
    { "titulo": "nome curto do passo (3 a 5 palavras)", "descricao": "instrução CURTA e direta do que fazer — no MÁXIMO 2 frases / 30 palavras. É uma ficha de aplicar na hora, não um texto. Específico do nicho, zero vaguidão." }
  ],
  "variacoes": [
    { "contexto": "ex: 'Para os menores', 'Turmas grandes', 'Para desafiar'", "descricao": "como adaptar — 1 frase curta" }
  ],
  "dica_professor": "dica de quem JÁ APLICOU — o detalhe que faz diferença, em 1ª pessoa ('O que funciona pra mim é...'). 1 a 2 linhas curtas.",
  "o_que_observar": ["sinal/comportamento concreto que mostra se está funcionando — frase curta de até 8 palavras"]
}
ESTILO FICHA (CRÍTICO): é uma ficha de UMA PÁGINA pra professor aplicar na hora — TUDO curto, escaneável, direto. NADA de parágrafo longo. Pense em bullet, não em texto.
OBRIGATÓRIO: 4 a 5 passos no passo_a_passo (cada descrição com no máx 2 frases); exatamente 3 variações (menores / turmas grandes / desafio); 3 a 4 itens em materiais e em o_que_observar. Tudo ESPECÍFICO do nicho.`,

    receita: `Retorne JSON com exatamente esta estrutura:
{
  "titulo": "nome da receita (máx 8 palavras, apetitoso)",
  "subtitulo": "para quem é e qual o diferencial (ex: fit, vegana, rápida)",
  "autor": "nome do criador",
  "descricao": "descrição curta e irresistível da receita (2-3 linhas)",
  "informacoes": {
    "tempo_preparo": "ex: 15 min",
    "tempo_forno": "ex: 35 min (ou null se não usa forno)",
    "porcoes": "ex: 12 unidades",
    "dificuldade": "Fácil / Médio / Avançado",
    "calorias": "estimativa por porção (opcional)"
  },
  "ingredientes": [
    { "grupo": "nome do grupo (ex: Massa, Recheio — ou null para receita simples)", "itens": ["quantidade + unidade + ingrediente"] }
  ],
  "modo_preparo": [
    { "passo": 1, "titulo": "nome curto do passo (ex: Misture a base)", "descricao": "instrução objetiva e clara (2-3 linhas)" }
  ],
  "dica_chef": "dica do autor que faz a receita ficar ainda melhor — específica, não óbvia (1-2 linhas)",
  "variacao": "como adaptar a receita (ex: versão sem glúten, versão mais econômica) — 1 sugestão",
  "como_servir": "sugestão de apresentação e combinações (1-2 linhas)"
}
OBRIGATÓRIO: ingredientes organizados por grupo, mínimo 5 passos no modo de preparo`,

    proposta: `Retorne JSON com exatamente esta estrutura:
{
  "titulo": "título da proposta — claro e objetivo (máx 10 palavras)",
  "subtitulo": "resultado ou transformação entregue (máx 15 palavras)",
  "autor": "nome do profissional / empresa",
  "cliente": "nome do cliente ou perfil-alvo",
  "data_validade": "válido por X dias",
  "resumo_executivo": "visão geral da proposta em 3-4 linhas — problema, solução, resultado esperado",
  "problema": "descrição do problema ou necessidade do cliente (100 a 150 palavras) — objetivo, sem jargão",
  "solucao": "descrição da solução proposta (150 a 200 palavras) — o que será entregue, como, em quanto tempo",
  "entregas": [
    { "item": "nome do entregável", "descricao": "o que inclui — 1-2 linhas", "prazo": "quando será entregue" }
  ],
  "investimento": {
    "descricao": "forma de pagamento e condições",
    "itens": [{ "servico": "descrição do serviço", "valor": "R$ X.XXX,00" }],
    "total": "R$ X.XXX,00",
    "condicoes": "condições de pagamento (ex: 50% na assinatura, 50% na entrega)"
  },
  "diferenciais": ["diferencial concreto e verificável — não genérico"],
  "proximos_passos": ["passo 1 — ação específica com prazo", "passo 2", "passo 3"],
  "validade": "esta proposta é válida por X dias a partir de [data]"
}
OBRIGATÓRIO: mínimo 3 entregas, 3 diferenciais, 3 próximos passos`,

    roteiro_live: `Retorne JSON com exatamente esta estrutura:
{
  "titulo": "tema da live (máx 10 palavras)",
  "autor": "nome do apresentador",
  "duracao_total": "duração estimada (ex: 60 min)",
  "objetivo": "o que o espectador vai aprender ou conseguir ao final",
  "checklist_pre": ["verificação técnica antes de começar — específica"],
  "blocos": [
    {
      "nome": "nome do bloco (ex: ABERTURA, CONTEÚDO, OFERTA)",
      "duracao": "ex: 5 min",
      "objetivo_bloco": "o que acontece neste bloco",
      "script": "em 1ª pessoa — o que o apresentador diz, natural e conversacional (150 a 250 palavras). Inclua marcações: [MOSTRAR TELA], [PERGUNTA PARA O CHAT], [PAUSA], [MOSTRAR PRODUTO]",
      "interacao_chat": "como engajar o chat neste bloco (ex: 'Pergunte: quem aqui já tentou X?')"
    }
  ],
  "cta_principal": "chamada para ação principal da live — direta, com link/ação específica",
  "respostas_objecoes": [
    { "objecao": "objeção comum do público", "resposta": "resposta natural em 1ª pessoa (2-3 linhas)" }
  ]
}
OBRIGATÓRIO: mínimo 5 blocos (ABERTURA, CONTEÚDO x2, OFERTA, ENCERRAMENTO), 3 objeções`,

    debate_politico: (perspectiva) => {
      const qtdSecoes = extensao === 'longo' ? 7 : extensao === 'medio' ? 5 : 4;
      const qtdArgs   = extensao === 'longo' ? 7 : extensao === 'medio' ? 6 : 5;
      const labels = {
        critico_esquerda: 'argumentos baseados em dados que criticam políticas e governos de esquerda no Brasil (PT, Lula, Dilma — use fatos documentados, dados do IBGE/TCU/TSE/Banco Central)',
        critico_direita:  'argumentos baseados em dados que criticam políticas e governos de direita no Brasil (Bolsonaro, governo 2019-2022 — use fatos documentados, dados do IBGE/TCU/TSE/Banco Central)',
        balanceado:       'argumentos dos dois lados (esquerda e direita) com dados verificáveis — o leitor recebe munição para qualquer debate',
      };
      return `Retorne JSON com exatamente esta estrutura:
{
  "titulo": "título chamativo com número (ex: '47 Argumentos com Dados que Encerram Qualquer Debate')",
  "subtitulo": "subtítulo posicionador (ex: 'Fatos verificáveis que a mídia não coloca em pauta')",
  "introducao": "por que dados vencem opiniões em debates políticos — 150 a 200 palavras, direto, sem lado político",
  "secoes": [
    {
      "tema": "Economia",
      "icone": "💰",
      "argumentos": [
        {
          "numero": 1,
          "afirmacao": "Afirmação direta baseada em dado real (1-2 frases impactantes)",
          "dado": "Estatística específica com ano — ex: 'Inflação acumulada: 26,3% entre jan/2020 e dez/2022 (IPCA/IBGE)'",
          "fonte": "Instituição + ano (IBGE 2023, TSE 2022, Banco Central, TCU, PNAD...)",
          "como_usar": "Como apresentar esse argumento num debate sem parecer panfletário (1 frase)"
        }
      ]
    }
  ],
  "como_usar_no_debate": "guia rápido: 3 táticas para usar dados em discussões sem perder a calma (200 palavras)",
  "aviso_legal": "frase curta: 'Verifique as fontes antes de usar. Dados políticos mudam — consulte sempre a fonte original.'"
}
PERSPECTIVA: ${labels[perspectiva] || labels.critico_direita}
OBRIGATÓRIO: exatamente ${qtdSecoes} seções temáticas (Economia, Segurança Pública, Educação, Saúde, Corrupção/Transparência, Meio Ambiente, Direitos e Democracia — adapte conforme relevância), cada seção com exatamente ${qtdArgs} argumentos.
USE SOMENTE dados de fontes verificáveis e públicas. NUNCA invente estatísticas. Se não tiver dado concreto, use dados relacionados verificáveis.`;
    },
  };

  return typeof schemas[tipo] === 'function'
    ? schemas[tipo](params.perspectiva)
    : (schemas[tipo] || schemas.ebook);
}

// ── Geração de conteúdo via GPT-4o ─────────────────────────
async function gerarConteudo(params) {
  const { tipo, nicho, publico, tema, tom, extensao, autor } = params;

  // Idioma do material (e-book na gringa). Default português.
  const _LANGS = ['pt', 'en', 'es', 'de', 'fr', 'it'];
  const idioma = _LANGS.includes(params.idioma) ? params.idioma : 'pt';
  const _IDI_NOME = { pt: 'português do Brasil', en: 'inglês (English, US)', es: 'espanhol (Español de España)', de: 'alemão (Deutsch)', fr: 'francês (Français)', it: 'italiano (Italiano)' }[idioma];
  const IDIOMA_INSTR = idioma === 'pt' ? '' :
    `\n\n⚠️ IDIOMA OBRIGATÓRIO: escreva ABSOLUTAMENTE TODO o conteúdo dos VALORES do JSON em ${_IDI_NOME} — título, subtítulo, textos, exemplos, listas, citações, CTA, TUDO. Use nomes de pessoas, cidades, moeda e referências culturais coerentes com esse idioma/país. NÃO escreva NADA em português. As CHAVES do JSON continuam exatamente como no schema; só os VALORES mudam de idioma. ⚠️ CRÍTICO: entregue EXATAMENTE a mesma QUANTIDADE de capítulos/itens e toda a estrutura COMPLETA exigida no schema acima (ex: 7 a 9 capítulos cheios) — NÃO resuma, NÃO encurte, NÃO entregue menos capítulos só porque mudou o idioma. Um e-book em ${_IDI_NOME} tem o MESMO tamanho de um em português.`;

  const TONS = {
    profissional:   'formal, com autoridade e linguagem de especialista',
    conversacional: 'direto, próximo, como um amigo especialista falando ao leitor',
    inspirador:     'motivacional, energético, que eleva a autoestima e impulsiona à ação',
    educativo:      'didático, claro, com muitos exemplos e analogias acessíveis',
  };

  // Regras universais de VALOR: o que faz um entregável de referência converter —
  // profundidade técnica real, contexto cultural do nicho, zero fabricação, zero enchimento.
  const REGRAS_VALOR = `O QUE ENTREGAR (pra valer o dinheiro):
• PROFUNDIDADE REAL DE ESPECIALISTA: ensine o COMO exato. Técnicas/métodos NOMEADOS, mecânica precisa, passo a passo, parâmetros e números concretos do nicho. O leitor tem que aprender algo específico que ele NÃO sabia — nunca conselho óbvio ("seja consistente", "use jogos", "tenha paciência").
• ERRO COMUM em cada parte importante: o erro exato que a maioria comete, POR QUE acontece, e o certo a fazer no lugar.
• CONTEXTO CULTURAL DO NICHO: use a linguagem, os termos técnicos, as referências e os exemplos REAIS desse universo (${nicho}). Quem é do meio tem que reconhecer "isso é de quem entende de verdade".
• AÇÃO CONCRETA ao fim de cada seção: um passo prático (verbo imperativo + o quê + como saber que deu certo).

NUNCA FAÇA (mata a credibilidade e entrega que é robô/IA):
• NÃO invente estatística nem pesquisa ("estudos mostram que 73%...", "uma pesquisa recente revelou..."). Sem fonte real, não cite número de pesquisa.
• NUNCA invente aluno/cliente/pessoa com NOME PRÓPRIO + idade + resultado ("o Rafael, 9 anos, de Curitiba, virou campeão"). ZERO exceções — nem UM personagem nomeado inventado no material inteiro. As SUAS histórias em 1ª pessoa (o que VOCÊ viveu ou viu de verdade, sem nome+idade+cidade), sim. Quando precisar exemplificar um aluno, use genérico e plausível: "tinha um aluno meu que...", "uma criança da turma...", sem nome próprio nem número de resultado fabricado.
• NÃO encha com história de origem genérica ("surgiu no Japão feudal", "os antigos mestres...") nem frase de efeito vazia. Cada linha entrega.
• NÃO use "você pode", "considere", "é possível", "talvez" como frase principal — seja direto.

Retorne SOMENTE JSON válido. Sem markdown. Sem mencionar IA, ChatGPT ou Claude.`;

  // Voz HUMANA em 1ª pessoa — cria identificação com o leitor, não parece texto de IA.
  const VOZ_HUMANA = `COMO ESCREVER (pra soar HUMANO e criar IDENTIFICAÇÃO — isto é tão importante quanto o conteúdo):
• VOZ EM 1ª PESSOA, de verdade: abra trechos com coisas como "Quando eu comecei...", "Eu aprendi isso errando feio...", "Demorei pra entender que...", "Confesso que no início eu...". O leitor tem que SENTIR que uma pessoa que JÁ VIVEU isso está falando com ele — nunca um manual frio.
• IDENTIFICAÇÃO COM A DOR: mostre que você entende quem lê ("você já passou por aquela aula em que nada funcionava?"). Fale a língua dele.
• NATURAL, nunca formuláico: varie as aberturas (uma cena, uma pergunta cortante, uma frase curta de impacto, uma confissão). Nada de padrão repetido seção após seção.`;

  const sistema = isTipoObjetivo(tipo)
    ? `Você é ${autor}, um(a) ESPECIALISTA DE VERDADE em ${nicho} — nível mestre, anos de prática real. Crie um ${LABELS[tipo] || tipo} premium, direto e prático para o mercado brasileiro, no nível de quem domina o assunto e está passando o ouro. Escreva como GENTE, não como IA.
Tom: ${TONS[tom] || TONS.educativo}

${REGRAS_VALOR}`
    : `Você é ${autor}, um(a) ESPECIALISTA DE VERDADE em ${nicho} com anos de prática real, escrevendo um ${LABELS[tipo] || tipo} premium que vai ser VENDIDO. Escreva como GENTE — um mestre do assunto conversando com o leitor — de um jeito que cria identificação e NÃO pareça texto de robô/IA.
Tom: ${TONS[tom] || TONS.conversacional}

${VOZ_HUMANA}

${REGRAS_VALOR}`;

  const schema = getPromptSchema(tipo, extensao, params);

  const prompt = tipo === 'debate_politico'
    ? `Crie um Arsenal de Argumentos Políticos completo para o nicho: ${nicho}.\nPúblico-alvo: ${publico || 'debatedores políticos brasileiros'}.\n${tema ? `Foco especial em: ${tema}.\n` : ''}Perspectiva: ${params.perspectiva || 'critico_direita'}.\n\n${schema}`
    : `Crie um ${LABELS[tipo] || tipo} completo e premium sobre:

Nicho: ${nicho}
Público-alvo: ${publico}
Tema central: ${tema || nicho}
Tom: ${tom}
Extensão: ${extensao}
Autor: ${autor}

${schema}${IDIOMA_INSTR}

RETORNE SOMENTE O JSON COMPLETO E VÁLIDO.`;

  // PRINCIPAL: Claude (melhor pra conteúdo). Se falhar (ex: sem crédito Anthropic),
  // cai automaticamente no GPT-4o — assim o produto NUNCA para. Mesmo prompt nos dois.
  let raw;
  // Modelo escolhido na tela: 'gpt' (custo menor) | 'opus' (custo REAL, melhor) | padrão (sonnet).
  const _escolha = (params && params.modelo) || '';
  // Pediram GPT mas o servidor não tem chave da OpenAI? Cai no Claude (Sonnet, barato)
  // em vez de quebrar — assim o e-book NUNCA falha por falta de chave no servidor.
  const _usarGpt = _escolha === 'gpt' && !!process.env.OPENAI_API_KEY;
  try {
    if (_usarGpt) throw new Error('modelo GPT escolhido na tela');
    const Anthropic = require('@anthropic-ai/sdk');
    const anthropic = new Anthropic.default({ apiKey: process.env.ANTHROPIC_API_KEY });
    const MODELO_CLAUDE = _escolha === 'opus' ? 'claude-opus-4-8' : (process.env.CRIADOR_MODELO || 'claude-sonnet-4-6');
    const response = await anthropic.messages.create({
      model: MODELO_CLAUDE,
      max_tokens: 16000,
      temperature: 0.7,
      system: sistema,
      messages: [
        { role: 'user', content: prompt + '\n\nIMPORTANTE: responda APENAS com o JSON, começando em { e terminando em }. Nada de texto antes ou depois.' },
      ],
    });
    raw = (response.content || []).map(b => b.text || '').join('');
    console.log(`[criador] conteúdo gerado pelo Claude (${MODELO_CLAUDE})`);
  } catch (claudeErr) {
    console.warn(`[criador] Claude indisponível (${String(claudeErr.message).slice(0, 90)}) → usando GPT-4o`);
    const OpenAI = require('openai');
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: sistema },
        { role: 'user',   content: prompt  },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.8,
      max_tokens: 14000,
    });
    raw = response.choices[0].message.content;
  }
  raw = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
  // extrai só o bloco JSON (do primeiro { ao último }) — robusto contra preâmbulo
  const _i = raw.indexOf('{'), _j = raw.lastIndexOf('}');
  if (_i > 0 && _j > _i) raw = raw.slice(_i, _j + 1);

  try {
    return JSON.parse(raw);
  } catch (_) {
    const { jsonrepair } = require('jsonrepair');
    const reparado = JSON.parse(jsonrepair(raw));
    aprendizados.salvar({
      titulo: `JSON malformado reparado — tipo: ${tipo}`,
      categoria: 'bug_fix',
      problema: `GPT-4o retornou JSON inválido para tipo "${tipo}" (${nicho}). JSON.parse falhou.`,
      solucao: 'jsonrepair aplicado com sucesso. Considerar prompt mais explícito sobre estrutura JSON se recorrente neste tipo.',
      contexto: { tipo, nicho, extensao, raw_inicio: raw.slice(0, 120) },
      tags: ['json', 'gpt4o', tipo, 'jsonrepair'],
      fonte: 'engine',
    });
    return reparado;
  }
}

// ── Validação de conteúdo gerado ───────────────────────────
function validarConteudo(conteudo, tipo, extensao) {
  const mins = { curto: 4, medio: 6, longo: 9 };
  const min  = mins[extensao] || 6;

  const checks = {
    ebook:      () => {
      if (!Array.isArray(conteudo.capitulos) || conteudo.capitulos.length < min)
        throw new Error(`E-book com apenas ${conteudo.capitulos?.length || 0} capítulos — mínimo ${min} para extensão "${extensao}"`);
      conteudo.capitulos.forEach((c, i) => {
        if (!c.conteudo || c.conteudo.length < 150)
          throw new Error(`Capítulo ${i+1} com conteúdo insuficiente (${c.conteudo?.length || 0} chars)`);
      });
    },
    workbook:   () => {
      if (!Array.isArray(conteudo.modulos) || conteudo.modulos.length < min)
        throw new Error(`Workbook com apenas ${conteudo.modulos?.length || 0} módulos — mínimo ${min}`);
      conteudo.modulos.forEach((m, i) => {
        if (!Array.isArray(m.exercicios) || m.exercicios.length < 2)
          throw new Error(`Módulo ${i+1} com menos de 2 exercícios`);
      });
    },
    guia:       () => {
      if (!Array.isArray(conteudo.passos) || conteudo.passos.length < min)
        throw new Error(`Guia com apenas ${conteudo.passos?.length || 0} passos — mínimo ${min}`);
    },
    checklist:  () => {
      if (!Array.isArray(conteudo.secoes) || conteudo.secoes.length < 4)
        throw new Error(`Checklist com apenas ${conteudo.secoes?.length || 0} seções — mínimo 4`);
      conteudo.secoes.forEach((s, i) => {
        if (!Array.isArray(s.itens) || s.itens.length < 3)
          throw new Error(`Seção ${i+1} do checklist com menos de 3 itens`);
      });
    },
    script_vsl: () => {
      if (!Array.isArray(conteudo.partes) || conteudo.partes.length < 8)
        throw new Error(`Script VSL com apenas ${conteudo.partes?.length || 0}/8 partes`);
      conteudo.partes.forEach((p, i) => {
        if (!p.script || p.script.length < 50)
          throw new Error(`Parte ${i+1} do VSL sem script ou muito curta`);
      });
    },
    debate_politico: () => {
      const minSecoes = extensao === 'longo' ? 5 : extensao === 'medio' ? 4 : 3;
      if (!Array.isArray(conteudo.secoes) || conteudo.secoes.length < minSecoes)
        throw new Error(`Debate com apenas ${conteudo.secoes?.length || 0} seções — mínimo ${minSecoes}`);
      conteudo.secoes.forEach((s, i) => {
        if (!Array.isArray(s.argumentos) || s.argumentos.length < 3)
          throw new Error(`Seção ${i+1} do debate com menos de 3 argumentos`);
      });
    },
  };

  if (checks[tipo]) checks[tipo]();
}

// ── Upload do PDF para Supabase Storage ────────────────────
async function uploadArquivo(buffer, filename) {
  try {
    const { createClient } = require('@supabase/supabase-js');
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
    const supa = createClient(process.env.SUPABASE_URL, key);
    const isJpeg = filename.endsWith('.jpg') || filename.endsWith('.jpeg');
    const contentType = isJpeg ? 'image/jpeg' : 'application/pdf';
    const { error } = await supa.storage
      .from('criador-pdfs')
      .upload(filename, Buffer.from(buffer), { contentType, upsert: true });
    if (error) return null;
    const { data: urlData } = supa.storage.from('criador-pdfs').getPublicUrl(filename);
    return urlData?.publicUrl || null;
  } catch (_) {
    return null;
  }
}
// Alias para compatibilidade com chamadas existentes
const uploadPDF = uploadArquivo;

// ── Renderização PDF via Puppeteer ──────────────────────────
async function renderizarPDF(conteudo, params) {
  const { tipo, nicho } = params;
  // FAIXA tem prioridade: se vier uma faixa (param ou conteúdo), a página inteira usa a cor dela.
  const _faixa = paletaFaixa(params.faixa || conteudo.faixa);
  const cores = _faixa || detectarPaletaNicho(nicho) || CORES[tipo] || CORES.ebook;

  const templateFile = TIPOS_KIDS.includes(tipo) ? TEMPLATE_KIDS_PATH : TEMPLATE_PATH;
  const templateHtml = fs.readFileSync(templateFile, 'utf8');

  const ilustracaoSvg = !TIPOS_KIDS.includes(tipo) ? detectarIlustracao(params.nicho, params.tema) : null;

  // Imagem de capa: o tema "nasce com imagem". Usa o que já temos (catálogo nosso,
  // cache local, Supabase) ou baixa 1 de banco GRÁTIS na hora (com timeout, custo zero)
  // e guarda pra próxima vez. Se nada vier, o template cai na ilustração SVG.
  let imagemCapa = null;
  if (!TIPOS_KIDS.includes(tipo) && params.nicho) {
    imagemCapa = await garantirImagemCapa(params.nicho, params.tema).catch(() => null);
    // (opcional, COM CUSTO) só gera com a nossa IA se foi pedido de propósito
    if (!imagemCapa && params.imagemIA) {
      imagemCapa = await gerarImagemIA(params.nicho, params.tema).catch(() => null);
    }
  }

  // Ficha de dinâmica: usa o mascote 3D salvo da FAIXA (recortado, sem gastar geração).
  let ilustracaoFicha = conteudo.ilustracao || null;
  let mascoteFile = null;   // caminho do PNG original (2048) p/ trocar no PDF em alta resolução
  if (tipo === 'ficha_dinamica' && !ilustracaoFicha) {
    const _p = require('path');
    const chave = _faixa && _faixa.chave;
    // 1) mascote salvo da faixa: preferir versão recortada (-transp), senão a com fundo branco
    const candidatos = [];
    if (chave) candidatos.push(`jj-${chave}-transp.png`, `jj-${chave}.png`);
    candidatos.push('jj-azul-transp.png', 'jj-azul.png'); // fallback genérico
    for (const nome of candidatos) {
      const fp = _p.join(__dirname, '../../../assets/mascotes', nome);
      try { if (fs.existsSync(fp)) { ilustracaoFicha = 'data:image/png;base64,' + fs.readFileSync(fp).toString('base64'); mascoteFile = fp; break; } } catch (e) {}
    }
    // 2) fallback final: gera com gpt-image-2 só se não houver nenhum mascote salvo
    if (!ilustracaoFicha) {
      try {
        const { openaiImage } = require('../../../integrations/openai');
        const promptImg = `A cute 3D rendered cartoon character, Pixar style, of a happy little kid practicing ${nicho}, wearing a white jiu-jitsu gi. Glossy 3D render, full body, centered, plain solid white background, no text.`;
        const buf = await openaiImage(promptImg, '1024x1024', 'high');
        ilustracaoFicha = 'data:image/png;base64,' + buf.toString('base64');
      } catch (e) { console.warn('[criador] ilustração da ficha falhou (segue sem):', e.message); }
    }
  }

  const data = {
    ...conteudo,
    tipo,
    cores,
    faixa_rotulo:  _faixa ? _faixa.rotulo : null,   // ex: 'Faixa Azul' — pinta o selo do topo
    pagina:        params.pagina != null ? params.pagina : null,   // nº da página no pack (senão usa o interno)
    label_tipo:    LABELS[tipo] || tipo,
    autor:         conteudo.autor || params.autor || 'Autor',
    nicho:         params.nicho   || '',
    ano:           new Date().getFullYear(),
    perspectiva:   params.perspectiva || null,
    imagem_capa:   imagemCapa   || null,   // foto realista (base64) ou null
    ilustracao:    tipo === 'ficha_dinamica'
                     ? (ilustracaoFicha || null)
                     : (imagemCapa ? null : (ilustracaoSvg || null)),
  };

  // Fonte Gagalin (títulos/rótulos da ficha) embutida em base64 — setContent não resolve arquivos locais.
  let fontStyle = '';
  try {
    const fontPath = require('path').join(__dirname, '../../../assets/fonts/Gagalin-Regular.otf');
    const fontB64 = fs.readFileSync(fontPath).toString('base64');
    fontStyle = `<style>@font-face{font-family:'Gagalin';src:url(data:font/otf;base64,${fontB64}) format('opentype');font-weight:normal;font-style:normal;font-display:block;}</style>`;
  } catch (e) { console.warn('[criador] fonte Gagalin não embutida (segue sem):', e.message); }

  const html = templateHtml
    .replace('/* __CRIADOR_DATA__ */', `window.__D = ${JSON.stringify(data)};`)
    .replace('</head>', fontStyle + '</head>');

  const isProd = !!(process.env.NODE_ENV === 'production' || process.env.RENDER);

  let browser;
  // Densidade de renderização: 3x faz o Chromium guardar as imagens em ALTA resolução no PDF
  // (sem isso ele encolhe as imagens, ex: mascote 2048 virava 576px no PDF).
  const DSF = Number(process.env.PDF_DSF || 1);
  const ARGS = ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--font-render-hinting=none', `--force-device-scale-factor=${DSF}`];

  if (isProd) {
    const chromium      = require('@sparticuz/chromium');
    const puppeteerCore = require('puppeteer-core');
    browser = await puppeteerCore.launch({
      args: [...chromium.args, ...ARGS],
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });
  } else {
    const puppeteer = require('puppeteer');
    browser = await puppeteer.launch({ headless: 'new', args: ARGS });
  }

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: DSF });
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 60000 });
    await new Promise(r => setTimeout(r, 1500));

    const rawBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });

    // Gera thumbnail PNG da capa (primeira página visível)
    let thumbnailBuffer = null;
    try {
      await page.setViewport({ width: 794, height: 1123 }); // A4 em 96dpi
      thumbnailBuffer = await page.screenshot({ type: 'jpeg', quality: 80, clip: { x: 0, y: 0, width: 794, height: 500 } });
    } catch (_) {}

    await page.close();

    // Injeta metadados internos no PDF (Author, Title, Subject)
    let outBuffer = rawBuffer;
    try {
      const { PDFDocument } = require('pdf-lib');
      const pdfDoc = await PDFDocument.load(rawBuffer);
      const titulo = conteudo?.titulo || params?.nicho || 'Produto Digital';
      const autor  = conteudo?.autor  || params?.autor  || 'Autor';
      pdfDoc.setTitle(titulo);
      pdfDoc.setAuthor(autor);
      pdfDoc.setSubject(params?.nicho || '');
      pdfDoc.setCreator('MAX Criador');
      pdfDoc.setProducer('MAX Criador');
      outBuffer = Buffer.from(await pdfDoc.save());
    } catch (_) {}

    // Ficha: troca o mascote encolhido pelo navegador pela imagem 2048 ORIGINAL (mesmo lugar).
    if (mascoteFile) {
      try {
        const cp = require('child_process'), os = require('os'), _p = require('path');
        const tmpIn  = _p.join(os.tmpdir(), `ficha_${Date.now()}_${Math.random().toString(36).slice(2)}.pdf`);
        const tmpOut = tmpIn.replace('.pdf', '_hd.pdf');
        const script = _p.join(__dirname, '../../../replace-mascote.py');
        fs.writeFileSync(tmpIn, outBuffer);
        let ok = false;
        for (const py of [process.env.PYTHON_BIN, 'python', 'python3'].filter(Boolean)) {
          try { cp.execFileSync(py, [script, tmpIn, mascoteFile, tmpOut], { stdio: 'ignore', timeout: 30000 }); ok = true; break; } catch (e) {}
        }
        if (ok && fs.existsSync(tmpOut)) outBuffer = fs.readFileSync(tmpOut);
        try { fs.unlinkSync(tmpIn); } catch (_) {}
        try { fs.unlinkSync(tmpOut); } catch (_) {}
      } catch (e) { console.warn('[criador] mascote HD falhou (segue normal):', e.message); }
    }
    return { pdfBuffer: outBuffer, thumbnailBuffer };
  } finally {
    await browser.close();
  }
}

// ── Salva erro no Supabase com solução automática ───────────
async function registrarErro(entregaId, rota, erro, contexto) {
  try {
    // Supabase desativado temporariamente no engine para evitar EFATAL
    return;
    const { createClient } = require('@supabase/supabase-js');
    const supa = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

    const msg = (erro.message || '').toLowerCase();
    let solucao = null;
    if (msg.includes('timeout'))                       solucao = 'Aumentar timeout do Puppeteer ou usar extensão mais curta';
    else if (msg.includes('json') || msg.includes('parse')) solucao = 'GPT retornou JSON malformado — jsonrepair aplicado automaticamente; se persistir, verificar schema do prompt';
    else if (msg.includes('openai') || msg.includes('rate')) solucao = 'Verificar OPENAI_API_KEY e quota disponível na conta OpenAI';
    else if (msg.includes('chromium') || msg.includes('puppeteer') || msg.includes('browser')) solucao = 'Verificar instalação do Chromium/Puppeteer no ambiente — em produção precisa do @sparticuz/chromium';
    else if (msg.includes('supabase') || msg.includes('network'))  solucao = 'Verificar variáveis SUPABASE_URL e SUPABASE_ANON_KEY no .env';
    else if (msg.includes('memory') || msg.includes('heap'))       solucao = 'Reduzir extensão do produto ou aumentar memória do servidor';
    else solucao = 'Investigar stack trace e contexto para diagnóstico específico';

    await supa.from('erros_sistema').insert({
      entrega_id: entregaId || null,
      rota,
      mensagem:   (erro.message || '').slice(0, 500),
      stack:      (erro.stack   || '').slice(0, 2000),
      contexto:   contexto || null,
      solucao,
    });
  } catch (_) {}
}

// ── Motor principal ─────────────────────────────────────────
async function executar(params, onProgress = () => {}) {
  const {
    tipo        = 'ebook',
    nicho       = '',
    publico     = '',
    tema        = '',
    tom         = 'conversacional',
    extensao    = 'medio',
    autor       = 'Autor',
    perspectiva = 'critico_direita',
  } = params;

  // Analytics de entrega removido do engine — evita EFATAL Supabase que derruba o processo

  try {
    onProgress(8,  'Preparando estrutura do produto...');

    onProgress(20, `Gerando ${LABELS[tipo] || tipo} com IA — aguarde (30–90s)...`);
    let conteudo = await gerarConteudo({ tipo, nicho, publico, tema, tom, extensao, autor, perspectiva });

    // Valida conteúdo — retry automático se insuficiente
    try {
      validarConteudo(conteudo, tipo, extensao);
    } catch (validErr) {
      onProgress(45, 'Conteúdo incompleto — regenerando com mais detalhe...');
      aprendizados.salvar({
        titulo: `Validação falhou — retry automático — ${tipo}`,
        categoria: 'bug_fix',
        problema: validErr.message,
        solucao: 'Retry automático com mesmo prompt. Se persistir, revisar schema do prompt.',
        contexto: { tipo, nicho, extensao },
        tags: [tipo, 'validacao', 'retry'],
        fonte: 'engine',
      });
      conteudo = await gerarConteudo({ tipo, nicho, publico, tema, tom, extensao, autor });
      validarConteudo(conteudo, tipo, extensao); // lança se ainda inválido após retry
    }

    // Corrige número de argumentos no título do debate_politico
    if (tipo === 'debate_politico' && Array.isArray(conteudo.secoes)) {
      const totalReal = conteudo.secoes.reduce((s, sec) => s + (sec.argumentos?.length || 0), 0);
      if (totalReal > 0 && conteudo.titulo) {
        conteudo.titulo = conteudo.titulo.replace(/^\d+/, totalReal);
      }
      if (conteudo.introducao) {
        conteudo.introducao = conteudo.introducao.replace(
          /\b\d+\s+(argumentos|ARGUMENTOS)\b/g,
          `${totalReal} argumentos`
        );
      }
    }

    onProgress(68, 'Renderizando PDF profissional...');
    const { pdfBuffer, thumbnailBuffer } = await renderizarPDF(conteudo, { tipo, nicho, autor, perspectiva });

    onProgress(92, 'Salvando resultado...');
    const titulo = conteudo.titulo || tema || nicho || tipo;
    const pdfFilename = `${Date.now()}-${tipo}.pdf`;

    // Upload PDF e thumbnail para Storage
    const pdfUrl = await uploadPDF(pdfBuffer, pdfFilename);
    let thumbUrl = null;
    if (thumbnailBuffer) {
      thumbUrl = await uploadPDF(thumbnailBuffer, pdfFilename.replace('.pdf', '-thumb.jpg'));
    }

    onProgress(100, 'Pronto!');

    // Registra padrão de sucesso para aprendizado futuro
    const pdfKb = Math.round(Buffer.from(pdfBuffer).length / 1024);
    aprendizados.salvar({
      titulo: `Geração bem-sucedida — ${LABELS[tipo]} · ${nicho}`,
      categoria: 'padrao',
      solucao: `${LABELS[tipo]} gerado com sucesso. Tom: ${tom}, Extensão: ${extensao}, PDF: ${pdfKb}KB.`,
      contexto: { tipo, nicho, publico, tom, extensao, pdfKb, titulo },
      tags: [tipo, tom, extensao, 'sucesso'],
      fonte: 'engine',
    });

    const slugTitulo = titulo.slice(0, 45)
      .toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '') // remove acentos
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    return {
      pdf:         pdfBuffer,
      pdf_url:     pdfUrl,
      thumb_url:   thumbUrl,
      titulo,
      tipo,
      conteudo,
      pdfFilename: `${tipo}-${slugTitulo}.pdf`,
    };

  } catch (erro) {
    console.error('[criador_engine]', erro.message);
    const _entregaId = (params && params.entregaId) || null;
    await registrarErro(_entregaId, '/api/criador', erro, params);

    if (_entregaId) {
      try {
        await supa.from('entregas').update({ status: 'erro' }).eq('id', _entregaId);
      } catch (_) {}
    }
    throw erro;
  }
}

// AUTOPREENCHIMENTO: dado o nome de um tema, a IA sugere ~12 palavras com dica
// (pro Pack de Atividades). Barato e rápido (Sonnet); cai no GPT se o Claude falhar.
async function sugerirPalavras(tema, idioma = 'pt') {
  const t = String(tema || '').trim().slice(0, 80);
  if (t.length < 2) return [];
  const lng = idioma === 'en' ? 'inglês' : idioma === 'es' ? 'espanhol' : 'português';
  const sistema = 'Você cria listas de palavras para atividades infantis impressas (caça-palavras, ligue, código). Responda SEMPRE só com JSON válido.';
  const prompt = `Tema: "${t}".\nGere 14 palavras para uma atividade educativa de caça-palavras, em ${lng}.\nREGRAS OBRIGATÓRIAS:\n- Cada palavra: UMA só (sem espaços, sem hífen), de 3 a 11 letras.\n- Use SEMPRE o termo CORRETO e adequado ao tema (ex.: num tema de anatomia/corpo humano, use os nomes corretos das partes do corpo).\n- NUNCA use gírias, palavrões ou palavras de duplo sentido vulgar (ex.: nada de "pica", "pau", "rola"); se o tema pedir, use o termo correto/científico.\n- Substantivos simples e claros, sem palavras compostas ou abreviadas.\n- Cada palavra com uma dica curta (até 6 palavras).\nResponda APENAS: {"palavras":[{"p":"PALAVRA","d":"dica"}]} com 14 itens.`;
  let raw;
  try {
    const Anthropic = require('@anthropic-ai/sdk');
    const anthropic = new Anthropic.default({ apiKey: process.env.ANTHROPIC_API_KEY });
    const r = await anthropic.messages.create({
      model: process.env.CRIADOR_MODELO || 'claude-sonnet-4-6',
      max_tokens: 1500, temperature: 0.7, system: sistema,
      messages: [{ role: 'user', content: prompt + '\n\nResponda APENAS o JSON, começando em { e terminando em }.' }],
    });
    raw = (r.content || []).map(b => b.text || '').join('');
  } catch (claudeErr) {
    const OpenAI = require('openai');
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const r = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: sistema }, { role: 'user', content: prompt }],
      response_format: { type: 'json_object' }, temperature: 0.7, max_tokens: 1200,
    });
    raw = r.choices[0].message.content;
  }
  raw = String(raw).replace(/```json/gi, '').replace(/```/g, '').trim();
  const i = raw.indexOf('{'), j = raw.lastIndexOf('}');
  if (i >= 0 && j > i) raw = raw.slice(i, j + 1);
  let arr = [];
  try { arr = JSON.parse(raw).palavras || []; }
  catch (_) { try { const { jsonrepair } = require('jsonrepair'); arr = JSON.parse(jsonrepair(raw)).palavras || []; } catch (__) { arr = []; } }
  // PENEIRA: barra SÓ gíria/palavrão vulgar (que nunca é educativo). NÃO barra os termos
  // CORRETOS (PÊNIS, VAGINA, ÂNUS...) — esses DEVEM vir num tema de anatomia/corpo humano.
  const BLOCK = new Set(['PICA','PAU','ROLA','CARALHO','PORRA','BOSTA','MERDA','CU','CUZAO','CUZÃO','BUCETA','BOCETA','XOXOTA','XANA','XERECA','PIROCA','PERERECA','PUTA','PUTO','PUTARIA','VIADO','BICHA','FODA','FODER','GOZADA','PUNHETA','PERIGUETE','VAGABUNDA']);
  return (Array.isArray(arr) ? arr : []).map(o => ({
    p: String(o.p || o.palavra || '').toUpperCase().replace(/[^A-ZÇÃÕÁÉÍÓÚÂÊÔÀÜÑ]/g, '').slice(0, 14),
    d: String(o.d || o.dica || '').trim().slice(0, 60),
  })).filter(o => o.p.length >= 3 && !BLOCK.has(o.p)).slice(0, 12);
}

module.exports = { executar, renderizarPDF, gerarConteudo, sugerirPalavras, CORES, LABELS };
