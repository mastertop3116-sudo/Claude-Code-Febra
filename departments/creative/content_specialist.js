// ============================================
// NEXUS — Content Specialist Agent
// Gera conteúdo rico: títulos temáticos, atividades detalhadas,
// progressão lógica — calibrado na referência Manual de Dinâmicas
// ============================================

const { geminiJson, geminiPro } = require("../../integrations/gemini");

// Estilo de nomeação temática por nicho
const NICHE_STYLES = {
  impacto: {
    prefix: "O Caminho do",
    temas: ["Tigre","Leão","Águia","Dragão","Serpente","Falcão","Touro","Pantera","Lobo","Guerreiro"],
    intro_titulo: "A Filosofia do Mestre",
    atividade_label: "Dinâmica",
    especialista_label: "Dica do Sensei",
  },
  elegancia: {
    prefix: "A Arte da",
    temas: ["Graça","Postura","Expressão","Leveza","Fluidez","Precisão","Musicalidade","Presença","Beleza","Perfeição"],
    intro_titulo: "A Filosofia da Dança",
    atividade_label: "Exercício",
    especialista_label: "Dica da Professora",
  },
  sabedoria: {
    prefix: "Degrau",
    temas: ["01","02","03","04","05","06","07","08","09","10"],
    intro_titulo: "Como Usar Este Material",
    atividade_label: "Degrau",
    especialista_label: "A Visão do Mentor",
    formato: "degrau",
    eixos: [
      "EIXO 1: IDENTIDADE E MENTALIDADE",
      "EIXO 2: FÉ E CONFIANÇA EM DEUS",
      "EIXO 3: PROPÓSITO E VOCAÇÃO",
      "EIXO 4: RELACIONAMENTOS E FAMÍLIA",
      "EIXO 5: PROSPERIDADE E MORDOMIA",
      "EIXO 6: ORAÇÃO E VIDA ESPIRITUAL",
      "EIXO 7: CARÁTER E VIRTUDES",
      "EIXO 8: SAÚDE E CUIDADO DO TEMPLO",
    ],
  },
  produtividade: {
    prefix: "O Pilar da",
    temas: ["Disciplina","Foco","Clareza","Planejamento","Execução","Consistência","Prioridade","Energia","Resultado","Impacto"],
    intro_titulo: "Metodologia e Fundamentos",
    atividade_label: "Exercício Prático",
    especialista_label: "Dica do Especialista",
  },
  bemestar: {
    prefix: "A Prática do",
    temas: ["Equilíbrio","Respiração","Movimento","Descanso","Mindfulness","Nutrição","Autoconhecimento","Conexão","Vitalidade","Renovação"],
    intro_titulo: "Filosofia do Bem-Estar",
    atividade_label: "Prática",
    especialista_label: "Dica do Terapeuta",
  },
  criatividade: {
    prefix: "A Expressão do",
    temas: ["Cor","Forma","Ritmo","Narrativa","Inovação","Processo","Síntese","Visão","Experimento","Criação"],
    intro_titulo: "Método Criativo",
    atividade_label: "Desafio Criativo",
    especialista_label: "Insight do Criador",
  },
};

// ──────────────────────────────────────────
// Prompt formato DEGRAU (nicho sabedoria/cristão)
// Calibrado na referência: Pack Mentoria 80 Tópicos Cristãos
// Estrutura: Eixo → Degrau → Versículo → Visão do Mentor → Chave de Ativação → Treino do Dia
// ──────────────────────────────────────────
function buildPromptDegrau(titulo, descricao, avatar, totalDegraus) {
  const eixos = NICHE_STYLES.sabedoria.eixos;
  const degrausPorEixo = Math.ceil(totalDegraus / eixos.length);
  const eixosExemplo = eixos.slice(0, 3).join("; ");

  return `Você é um mentor cristão de alto nível e especialista em produtos digitais de transformação espiritual.
Crie um programa de mentoria cristã chamado "${titulo}".

Contexto: ${descricao}
Público-alvo: ${avatar || "cristãos adultos que buscam transformação espiritual e de mentalidade"}
Total de degraus (seções): ${totalDegraus}
Eixos temáticos disponíveis: ${eixos.join("; ")}

MISSÃO: Replicar e SUPERAR a qualidade do "Pack Mentoria 80 Tópicos Cristãos" — cada degrau deve ter profundidade teológica real, exegese bíblica genuína, e aplicação prática transformadora. NADA genérico.

ESTRUTURA OBRIGATÓRIA POR DEGRAU (seção):
- titulo: "DEGRAU [numero] — [TÍTULO DRAMÁTICO EM CAIXA ALTA: descrição do tema]"
  Exemplo: "DEGRAU 01 — A CHAVE MESTRA DA IDENTIDADE: ROMPENDO RÓTULOS E ASSUMINDO O GOVERNO COMO NOVA CRIATURA"
- conteudo: "[EIXO X: NOME DO EIXO] | A VISÃO DO MENTOR: [5 parágrafos profundos separados por ponto e vírgula — total 600-800 chars. Estrutura: (1) fundamento bíblico com exegese do grego/hebraico quando relevante; (2) contexto histórico ou teológico que dá peso à verdade; (3) realidade do cristão brasileiro de hoje — onde a maioria erra ou sofre neste ponto; (4) o caminho de transformação — o que Deus diz e como é vivido na prática; (5) o resultado de quem aplica — transformação concreta e já experimentada por outros]"
- destaques: exatamente 5 itens:
  [0] "VERSÍCULO: '[texto literal do versículo]' — [Livro Cap:Verso]"
  [1] "CHAVE DE ATIVAÇÃO: [declaração de fé em 1ª pessoa, presente, que o leitor vai declarar em voz alta. Ex: Hoje, eu escolho viver a partir da minha identidade em Cristo, não dos rótulos que o mundo tentou me impor.]"
  [2] "TREINO DO DIA 1: [ação prática e específica — deve ser realizável hoje mesmo. Ex: Liste três rótulos negativos que você carrega e escreva ao lado a verdade bíblica correspondente.]"
  [3] "TREINO DO DIA 2: [segunda ação prática diferente da primeira — pode ser leitura, oração, comportamento, declaração]"
  [4] "TREINO DO DIA 3: [terceira ação transformadora — pode ser uma mudança de hábito, uma renúncia, ou um exercício espiritual]"

REGRAS DE QUALIDADE:
1. Versículos: use referências bíblicas REAIS e corretas — não invente capítulos/versos
2. Visão do Mentor: 2-3 parágrafos separados por ponto e vírgula; tom de mentor que já viveu isso; profundidade sem ser acadêmico demais
3. Chave de Ativação: declaração poderosa, em 1ª pessoa, afirmativa, presente — não negativa
4. Treinos: ações concretas, não vagas. "Ore por 5 minutos" é vago. "Escreva uma lista de 3 pessoas que você precisa perdoar e ore nominalmente por cada uma por 2 minutos" é específico
5. Distribuição pelos eixos: divida os ${totalDegraus} degraus equilibradamente entre os eixos disponíveis
6. Progressão: cada degrau deve ser mais profundo que o anterior dentro do mesmo eixo

REGRAS DE JSON — OBRIGATÓRIO:
- Retorne APENAS JSON puro, sem markdown
- NUNCA use aspas duplas dentro de strings — use aspas simples
- NUNCA coloque quebras de linha dentro de valores — use ponto e vírgula
- Máximo 600 caracteres por destaque

ESTRUTURA JSON:
{
  "capa": {
    "titulo": "${titulo}",
    "subtitulo": "${totalDegraus} Degraus de Transformação Espiritual e Mentalidade de Reino",
    "tagline": "Fé • Identidade • Propósito",
    "badge_publico": "Para Cristãos que Querem Viver Acima das Circunstâncias",
    "badge_valor": "${totalDegraus} Degraus de Mentoria",
    "badge_extra": "Treinos Diários Incluídos"
  },
  "introducao": "texto de boas-vindas explicando a jornada dos ${totalDegraus} degraus; como usar o material (1 degrau por dia); o que o leitor vai experimentar ao completar; a filosofia do programa; versículo âncora do programa inteiro",
  "secoes": [ ... ${totalDegraus} seções no formato acima ... ],
  "conclusao": "conclusão da jornada: parabeniza o leitor; relembra a transformação vivida; convida para o próximo nível; declaração final poderosa",
  "sobre_autor": "apresentação do mentor/produto com credibilidade e missão"
}

Idioma: PORTUGUÊS BRASILEIRO. Crie EXATAMENTE ${totalDegraus} seções. CADA seção deve ter EXATAMENTE 5 destaques.`;
}

// ──────────────────────────────────────────
// Prompt formato VSL SCRIPT
// ──────────────────────────────────────────
function buildPromptVSL(titulo, descricao, avatar) {
  return `Você é o melhor copywriter de vídeos de vendas do Brasil — especialista em VSL (Video Sales Letter).
Crie um script de VSL COMPLETO e PERSUASIVO para o produto "${titulo}".
Nicho/produto: ${descricao}
Público-alvo: ${avatar || "adultos brasileiros interessados no tema"}

REGRAS DE JSON — OBRIGATÓRIO:
- Retorne APENAS JSON puro, sem markdown
- NUNCA aspas duplas dentro de strings — use aspas simples
- NUNCA quebras de linha — use ponto e vírgula

ESTRUTURA JSON:
{
  "capa": {
    "titulo": "${titulo}",
    "subtitulo": "Script VSL Completo — Pronto para Gravar",
    "tagline": "Hook • Prova • Conversão"
  },
  "introducao": "Visão geral do script: duração estimada, estrutura das etapas e instrução de uso para o produtor",
  "secoes": [
    { "titulo": "ETAPA 1 — HOOK (0:00–0:45)", "conteudo": "FUNDAMENTO: o que o espectador sente ao ver este gancho; APLICAÇÃO: frase exata de abertura + as 3 primeiras perguntas retóricas; PROGRESSÃO: como esta abertura cria tensão e mantém o espectador assistindo", "destaques": ["Hook principal: [frase de abertura impactante — começa com uma promessa ou dor visceral]", "Promessa da transformação: [o que o espectador vai descobrir nos próximos minutos]", "Quebra de padrão: [elemento surpresa ou declaração controversa que prende atenção]", "Prova de credibilidade inicial: [resultado de aluno ou dado numérico que valida o que vem a seguir]", "Transição para a história: [frase de ponte natural para o próximo bloco]"] },
    { "titulo": "ETAPA 2 — HISTÓRIA E IDENTIFICAÇÃO (0:45–2:00)", "conteudo": "FUNDAMENTO: por que a história pessoal cria conexão e confiança; APLICAÇÃO: estrutura exata da história (situação antes → evento de virada → descoberta); PROGRESSÃO: como a história posiciona o apresentador como guia, não herói", "destaques": ["Situação antes (o problema): [dor específica que o apresentador ou aluno vivia — detalhes emocionais reais]", "O momento de virada: [o evento, descoberta ou decisão que mudou tudo — com data ou contexto]", "A jornada da transformação: [os obstáculos enfrentados e como foram superados — 3 marcos]", "O resultado concreto: [números reais ou prova visual da transformação obtida]", "Identificação com o avatar: [frase que conecta a história à dor do espectador]"] },
    { "titulo": "ETAPA 3 — PROBLEMA E AGITAÇÃO (2:00–3:30)", "conteudo": "FUNDAMENTO: aprofundar a dor antes de apresentar a solução aumenta o valor percebido; APLICAÇÃO: listar os 3 maiores problemas do avatar com linguagem visceral; PROGRESSÃO: cada problema leva naturalmente ao próximo, criando urgência crescente", "destaques": ["Problema 1 — a dor visível: [o problema que o avatar reconhece conscientemente — com exemplos do dia a dia]", "Problema 2 — a causa raiz: [o motivo real por trás do problema superficial — que ele ainda não percebeu]", "Problema 3 — o custo de não resolver: [o que continua acontecendo se ele não agir agora — consequências reais]", "Agitação emocional: [pergunta retórica ou cena mental que amplifica a dor e cria desconforto]", "Ponte para a solução: [frase que apresenta que existe uma saída — sem revelar ainda]"] },
    { "titulo": "ETAPA 4 — SOLUÇÃO E APRESENTAÇÃO DO PRODUTO (3:30–5:30)", "conteudo": "FUNDAMENTO: apresentar a solução como descoberta, não como venda; APLICAÇÃO: revelar o método ou produto de forma estruturada (nome + pilares + diferenciais); PROGRESSÃO: cada pilar resolve um dos problemas levantados na etapa anterior", "destaques": ["Revelação da solução: [como o produto/método foi criado e por que é diferente de tudo que existe]", "Pilar 1 do método: [nome do pilar + o que ele resolve + resultado esperado]", "Pilar 2 do método: [nome do pilar + benefício específico + prova ou dado]", "Pilar 3 do método: [nome do pilar + transformação que ele provoca]", "O diferencial único: [por que este produto funciona quando outros falharam — mecanismo exclusivo]"] },
    { "titulo": "ETAPA 5 — PROVA SOCIAL E RESULTADOS (5:30–7:00)", "conteudo": "FUNDAMENTO: depoimentos e números reduzem objeções e criam prova social; APLICAÇÃO: apresentar 3 tipos de prova (resultado rápido, resultado profundo, perfil diferente); PROGRESSÃO: cada prova ataca uma objeção comum do avatar", "destaques": ["Depoimento 1 — resultado rápido: [aluno que viu resultado em menos de 30 dias — com números e contexto]", "Depoimento 2 — transformação profunda: [aluno com mudança de vida — antes e depois emocionalmente rico]", "Depoimento 3 — perfil diferente: [aluno que duvidava ou tinha o mesmo ceticismo do espectador]", "Dado/estatística de resultados: [número de alunos, percentual de sucesso ou métrica de impacto]", "Posicionamento de autoridade: [credenciais, mídia, certificações ou reconhecimentos do apresentador]"] },
    { "titulo": "ETAPA 6 — OFERTA E GARANTIA (7:00–9:00)", "conteudo": "FUNDAMENTO: empilhar valor antes de revelar preço torna a oferta irresistível; APLICAÇÃO: listar todos os bônus, calcular valor total e revelar preço com ancoragem; PROGRESSÃO: cada elemento da oferta remove uma objeção específica", "destaques": ["Produto principal: [nome + o que inclui + valor percebido em R$]", "Bônus 1: [nome + benefício direto + valor em R$]", "Bônus 2: [nome + por que ele acelera o resultado + valor em R$]", "Ancoragem de preço: [valor total de tudo + preço real com desconto justificado]", "Garantia: [prazo + o que cobre + como solicitar — linguagem que elimina o risco do comprador]"] },
    { "titulo": "ETAPA 7 — CTA E URGÊNCIA (9:00–10:30)", "conteudo": "FUNDAMENTO: o CTA precisa criar urgência real e eliminar a última hesitação; APLICAÇÃO: frase exata de chamada para ação + 2 elementos de escassez/urgência; PROGRESSÃO: recapitular a transformação prometida e encerrar com comando direto", "destaques": ["Frase de CTA principal: [comando direto, ação específica, onde clicar — ex: 'Clique no botão abaixo agora e garanta seu acesso imediato']", "Urgência 1 — escassez real: [vagas limitadas, bônus por tempo ou preço promocional com prazo]", "Urgência 2 — custo da inação: [o que ele perde se não agir hoje — coloca em perspectiva o investimento]", "Recapitulação da transformação: [3 resultados principais em uma frase poderosa]", "Encerramento: [frase final motivacional + repetição do CTA]"] }
  ],
  "conclusao": "Notas de produção: ritmo de fala recomendado, pausas dramáticas sugeridas, elementos visuais que reforçam cada etapa e dicas de tonalidade para cada bloco",
  "sobre_autor": "Roteiro criado por Nexus MAX — Motor de criação especializado em copywriting de alta conversão para o mercado digital brasileiro"
}

Crie EXATAMENTE o JSON acima com conteúdo real, específico e poderoso para "${titulo}" no nicho "${descricao}". Idioma: PORTUGUÊS BRASILEIRO.`;
}

// ──────────────────────────────────────────
// Prompt formato CHEAT SHEET (guia rápido)
// ──────────────────────────────────────────
function buildPromptCheatSheet(titulo, descricao, avatar, totalCaps) {
  return `Você é especialista em criar materiais de referência rápida de alta qualidade.
Crie um Cheat Sheet COMPLETO e DENSO chamado "${titulo}".
Nicho: ${descricao}
Público: ${avatar || "profissionais e estudantes do tema"}
Número de seções (tópicos): ${totalCaps}

REGRAS DE JSON — OBRIGATÓRIO: JSON puro sem markdown; aspas simples dentro de strings; sem quebras de linha.

ESTRUTURA — cada seção é um bloco de referência rápida com informações densas:
{
  "capa": { "titulo": "${titulo}", "subtitulo": "Guia de Referência Rápida — ${descricao}", "tagline": "Consulta Rápida • Alta Densidade • Pronto para Usar" },
  "introducao": "Como usar este cheat sheet: estrutura, símbolos utilizados e dica de uso no dia a dia",
  "secoes": [
    {
      "titulo": "[TÓPICO EM MAIÚSCULAS — ex: POSIÇÕES FUNDAMENTAIS, REGRAS ESSENCIAIS, ERROS COMUNS]",
      "conteudo": "CONCEITO: [definição direta e objetiva do tópico em 1-2 frases]; QUANDO USAR: [contexto de aplicação imediata]; ATENÇÃO: [armadilha ou erro mais comum neste tópico]",
      "destaques": [
        "▸ [item de referência 1 — formato ultra-conciso: nome → definição ou regra em até 20 palavras]",
        "▸ [item de referência 2]",
        "▸ [item de referência 3]",
        "▸ [item de referência 4]",
        "▸ [item de referência 5]",
        "⚡ Dica rápida: [insight prático que diferencia iniciante de especialista neste tópico]"
      ]
    }
  ],
  "conclusao": "Próximos passos: onde aprofundar cada tópico e como usar este guia como base para prática diária",
  "sobre_autor": "Guia criado com curadoria especializada no nicho ${descricao}"
}

Crie ${totalCaps} seções com conteúdo REAL e ESPECÍFICO para "${titulo}". Idioma: PORTUGUÊS BRASILEIRO.`;
}

// ──────────────────────────────────────────
// Prompt formato CHECKLIST
// ──────────────────────────────────────────
function buildPromptChecklist(titulo, descricao, avatar, totalCaps) {
  return `Você é especialista em criar checklists profissionais de alta qualidade.
Crie um Checklist COMPLETO e ACIONÁVEL chamado "${titulo}".
Nicho: ${descricao}
Público: ${avatar || "profissionais e praticantes do tema"}
Número de categorias/seções: ${totalCaps}

REGRAS DE JSON: JSON puro sem markdown; aspas simples; sem quebras de linha.

{
  "capa": { "titulo": "${titulo}", "subtitulo": "Lista Completa de Verificação — ${descricao}", "tagline": "Verificação • Consistência • Resultados" },
  "introducao": "Como usar este checklist: frequência recomendada, como marcar os itens, dica de implementação gradual e o que esperar ao completar todos os pontos",
  "secoes": [
    {
      "titulo": "[CATEGORIA — ex: PRÉ-TREINO, EQUIPAMENTOS, SEGURANÇA, PROGRESSÃO]",
      "conteudo": "OBJETIVO: [o que esta categoria garante quando concluída]; FREQUÊNCIA: [quando verificar estes itens — diário/semanal/por sessão]; PRIORIDADE: [crítico/importante/recomendado]",
      "destaques": [
        "☐ [item de checklist 1 — ação específica e verificável, não vaga]",
        "☐ [item de checklist 2]",
        "☐ [item de checklist 3]",
        "☐ [item de checklist 4]",
        "☐ [item de checklist 5]",
        "☐ [item de checklist 6 — o mais frequentemente esquecido nesta categoria]"
      ]
    }
  ],
  "conclusao": "Revisão semanal: como usar o checklist para avaliar progresso, identificar gaps e ajustar rotina",
  "sobre_autor": "Checklist desenvolvido com base nas melhores práticas de ${descricao}"
}

Crie ${totalCaps} categorias com itens REAIS e VERIFICÁVEIS para "${titulo}". Idioma: PORTUGUÊS BRASILEIRO.`;
}

// ──────────────────────────────────────────
// Prompt formato PLANNER
// ──────────────────────────────────────────
function buildPromptPlanner(titulo, descricao, avatar, totalCaps) {
  return `Você é especialista em criar planners e organizadores de alta performance.
Crie um Planner COMPLETO chamado "${titulo}".
Nicho: ${descricao}
Público: ${avatar || "praticantes e profissionais do tema"}
Número de módulos de planejamento: ${totalCaps}

REGRAS DE JSON: JSON puro sem markdown; aspas simples; sem quebras de linha.

{
  "capa": { "titulo": "${titulo}", "subtitulo": "Planner de Alta Performance — ${descricao}", "tagline": "Planejamento • Execução • Resultados" },
  "introducao": "Metodologia do planner: filosofia de organização, como preencher cada seção, ritmo recomendado (diário/semanal/mensal) e como transformar intenção em hábito",
  "secoes": [
    {
      "titulo": "[MÓDULO — ex: PLANEJAMENTO SEMANAL, METAS DO MÊS, REVISÃO DE PROGRESSO, ROTINA DIÁRIA]",
      "conteudo": "OBJETIVO: [o que este módulo organiza e por que é importante]; QUANDO PREENCHER: [horário e frequência recomendados]; COMO USAR: [instrução prática de preenchimento — passo a passo simples]",
      "destaques": [
        "📌 Meta principal do período: [espaço e instrução para definir o objetivo central]",
        "✅ Ações prioritárias: [lista das 3 ações de maior impacto para este período]",
        "⏰ Blocos de tempo: [como distribuir as horas disponíveis nas tarefas principais]",
        "📊 Indicadores de progresso: [métricas específicas do nicho para acompanhar evolução]",
        "⚡ Hábito-âncora do período: [o único hábito que, se feito, garante os demais]",
        "🔄 Revisão e ajuste: [perguntas de reflexão para avaliar o que funcionou e o que precisa melhorar]"
      ]
    }
  ],
  "conclusao": "Sistema de revisão: como fazer a revisão mensal, analisar padrões e recalibrar objetivos para o próximo ciclo",
  "sobre_autor": "Planner desenvolvido com metodologia comprovada para o nicho ${descricao}"
}

Crie ${totalCaps} módulos com conteúdo REAL e PRÁTICO para "${titulo}". Idioma: PORTUGUÊS BRASILEIRO.`;
}

// ──────────────────────────────────────────
// Prompt formato CERTIFICADO
// ──────────────────────────────────────────
function buildPromptCertificado(titulo, descricao) {
  return `Crie o conteúdo para um certificado digital profissional chamado "${titulo}".
Contexto do curso/programa: ${descricao}

REGRAS DE JSON: JSON puro sem markdown; aspas simples; sem quebras de linha.

{
  "capa": {
    "titulo": "${titulo}",
    "subtitulo": "Certificado de Conclusão",
    "tagline": "Excelência • Dedicação • Conquista"
  },
  "introducao": "Este certificado atesta a conclusão com êxito do programa '${titulo}'. O portador demonstrou dedicação, comprometimento e domínio das competências desenvolvidas ao longo do programa.",
  "secoes": [
    {
      "titulo": "Competências Desenvolvidas",
      "conteudo": "ÁREA: ${descricao}; RECONHECIMENTO: conclusão com aproveitamento total do programa; VALIDADE: este certificado é válido como comprovante de formação complementar",
      "destaques": [
        "Competência 1: [habilidade técnica específica desenvolvida no programa]",
        "Competência 2: [habilidade prática ou metodológica desenvolvida]",
        "Competência 3: [habilidade comportamental ou de mentalidade desenvolvida]",
        "Carga horária estimada: [X horas de conteúdo e prática]",
        "Metodologia: [abordagem pedagógica utilizada no programa]",
        "Próximos passos recomendados: [como aplicar e aprofundar o que foi aprendido]"
      ]
    }
  ],
  "conclusao": "Parabéns pela conquista. O conhecimento adquirido é seu para sempre. Aplique, ensine e transforme.",
  "sobre_autor": "Emitido por ${descricao} — comprometidos com excelência e transformação real"
}

Retorne APENAS o JSON. Idioma: PORTUGUÊS BRASILEIRO.`;
}

// ──────────────────────────────────────────
// Prompt formato CAPÍTULO (demais nichos)
// ──────────────────────────────────────────
function buildPromptCapitulo(titulo, descricao, avatar, totalCaps, tipo, style) {
  const tipoDesc = {
    ebook: "ebook completo com atividades práticas por capítulo",
    workbook: "caderno de exercícios interativo com práticas guiadas",
    checklist: "guia de verificação completo com orientações detalhadas",
    planner: "organizador prático com técnicas e rotinas",
    script_vsl: "script de vídeo de vendas estruturado e persuasivo",
    cheat_sheet: "guia de referência rápida com técnicas e exemplos",
    certificado: "certificado de conclusão",
  }[tipo] || tipo;

  return `Você é o melhor especialista em criação de produtos digitais educacionais do Brasil.
Crie um ${tipoDesc} EXCEPCIONAL chamado "${titulo}".

Contexto/nicho: ${descricao}
Público-alvo (avatar): ${avatar || "adultos e pais brasileiros"}
Total de capítulos/seções: ${totalCaps}
Estilo de nomenclatura: ${style.prefix} [Palavra]

MISSÃO PRINCIPAL: Criar conteúdo NO NÍVEL de "Manual de Dinâmicas de Kung Fu — +150 Jogos" — profundo, prático, temático, com atividades reais. Cada capítulo deve ENSINAR algo concreto, não apenas descrever.

REGRAS DE EXCELÊNCIA:
1. Títulos = temáticos e marcantes usando o estilo "${style.prefix}"
2. Cada capítulo: 6 destaques = 3 atividades/exercícios detalhados + 1 dica do especialista + 1 fato/dado científico + 1 habilidades formadas
3. Cada atividade: 3-4 passos detalhados; objetivo mensurável; duração; materiais; variação avançada
4. conteudo: OBRIGATÓRIO 3 parágrafos rotulados separados por ponto e vírgula (FUNDAMENTO / APLICAÇÃO / PROGRESSÃO), total 500-700 chars
5. Progressão lógica: do básico ao avançado, do individual ao coletivo, do físico ao mental
6. Tom: envolvente, prático, vocabulário específico do nicho. Termos técnicos reais
7. NUNCA use conteúdo genérico ou placeholder
8. Cada destaque: mínimo 80 palavras, máximo 600 caracteres

REGRAS DE JSON — OBRIGATÓRIO:
- Retorne APENAS JSON puro, sem markdown
- NUNCA aspas duplas dentro de strings — use aspas simples
- NUNCA quebras de linha dentro de valores — use ponto e vírgula
- Máximo 600 caracteres por destaque

ESTRUTURA JSON:
{
  "capa": {
    "titulo": "título principal",
    "subtitulo": "subtítulo com proposta de valor (ex: +${totalCaps * 10} ${style.atividade_label}s Práticos)",
    "tagline": "3 palavras-chave separadas por • ",
    "badge_publico": "para quem é este material",
    "badge_valor": "+${totalCaps * 10} ${style.atividade_label}s",
    "badge_extra": "Pronto para Imprimir"
  },
  "introducao": "texto rico explicando metodologia, filosofia e como usar o material",
  "secoes": [
    {
      "titulo": "título temático usando o estilo ${style.prefix}",
      "conteudo": "FUNDAMENTO: [contexto, importância e base teórica do capítulo em 2-3 frases ricas]; APLICAÇÃO: [como funciona na prática com exemplos reais e terminologia específica do nicho em 2-3 frases]; PROGRESSÃO: [como este capítulo se conecta com os anteriores e prepara para os próximos — cria sensação de jornada em 2 frases]",
      "destaques": [
        "${style.atividade_label} 1: [NOME CRIATIVO] — Objetivo: [resultado mensurável]. Duração: [X min]. Execução: [passo 1 com detalhe técnico]; [passo 2 — o que observar e ajustar]; [passo 3 — como finalizar e avaliar]. Variação avançada: [como aumentar dificuldade ou profundidade]",
        "${style.atividade_label} 2: [NOME CRIATIVO] — Objetivo: [resultado]. Materiais: [lista do que precisa]. Como executar: [passo 1]; [passo 2 com técnica correta]; [passo 3]. Adaptação em grupo: [como escalar para mais pessoas ou turma inteira]",
        "${style.atividade_label} 3: [NOME CRIATIVO] — Objetivo: [resultado]. Duração: [X-Y min]. Passo a passo: [1 — ação específica e detalhada]; [2 — ação com variações]; [3 — como finalizar e registrar o resultado obtido]",
        "${style.especialista_label}: [insight técnico ou científico — explica O QUÊ fazer, COMO fazer corretamente e POR QUÊ funciona (base fisiológica, psicológica ou técnica do nicho). Inclui o erro mais comum neste ponto e como identificá-lo e corrigi-lo]",
        "FATO/DADO: [estatística, estudo científico ou dado histórico relevante ao tema do capítulo. Contextualize a pesquisa ou fonte, o que ela revelou e por que isso importa para o praticante — mínimo 80 palavras de explicação]",
        "Habilidades formadas: [habilidade 1 — como se manifesta na prática diária] • [habilidade 2 — benefício observável em semanas] • [habilidade 3 — resultado de longo prazo no desenvolvimento] • [habilidade 4 — aplicação fora do contexto de treino/aula]"
      ]
    }
  ],
  "conclusao": "conclusão motivacional com próximos passos e call-to-action forte",
  "sobre_autor": "texto profissional de 2-3 frases sobre o autor, credibilidade e missão"
}

Idioma: PORTUGUÊS BRASILEIRO. Crie exatamente ${totalCaps} seções com exatamente 6 destaques cada. Máximo 600 caracteres por destaque.`;
}

// ──────────────────────────────────────────
// Geração de conteúdo RICO com estrutura profunda
// Retorna objeto compatível com gerarPDF()
// ──────────────────────────────────────────
async function gerarConteudoRico(config) {
  const {
    tipo = "ebook",
    titulo,
    descricao,
    temaKey = "produtividade",
    paginas = 15,
    avatar = "",
    numCapitulos,
    instrucaoMelhoria = "",
  } = config;

  const style = NICHE_STYLES[temaKey] || NICHE_STYLES.produtividade;

  // Caps máximos por tipo — tipos concisos têm menos seções
  const capsMax = { script_vsl: 7, cheat_sheet: 8, checklist: 8, certificado: 1, planner: 8 };
  const capsMin = { script_vsl: 7, cheat_sheet: 4, checklist: 5, certificado: 1, planner: 4 };
  const defaultCaps = Math.min(20, Math.max(8, paginas - 3));
  const totalCaps = numCapitulos || Math.min(
    capsMax[tipo] ?? 20,
    Math.max(capsMin[tipo] ?? 8, tipo === "script_vsl" ? 7 : defaultCaps)
  );

  const isDegrau = style.formato === "degrau";
  let basePrompt;
  if (isDegrau) {
    basePrompt = buildPromptDegrau(titulo, descricao, avatar, totalCaps);
  } else if (tipo === "script_vsl") {
    basePrompt = buildPromptVSL(titulo, descricao, avatar);
  } else if (tipo === "cheat_sheet") {
    basePrompt = buildPromptCheatSheet(titulo, descricao, avatar, totalCaps);
  } else if (tipo === "checklist") {
    basePrompt = buildPromptChecklist(titulo, descricao, avatar, totalCaps);
  } else if (tipo === "planner") {
    basePrompt = buildPromptPlanner(titulo, descricao, avatar, totalCaps);
  } else if (tipo === "certificado") {
    basePrompt = buildPromptCertificado(titulo, descricao);
  } else {
    basePrompt = buildPromptCapitulo(titulo, descricao, avatar, totalCaps, tipo, style);
  }
  const prompt = instrucaoMelhoria
    ? `${basePrompt}\n\nINSTRUÇÃO DE MELHORIA (aplique obrigatoriamente nesta regeneração):\n${instrucaoMelhoria}`
    : basePrompt;

  const MAX_TENTATIVAS = 3;
  let ultimoErro = null;

  for (let tentativa = 1; tentativa <= MAX_TENTATIVAS; tentativa++) {
    try {
      let raw;
      if (tentativa === MAX_TENTATIVAS) {
        console.log("[Content Specialist] Última tentativa — texto puro com Gemini Pro");
        raw = await geminiPro(prompt);
      } else {
        raw = await geminiJson(prompt, true); // sempre Pro para qualidade máxima
      }

      let text = raw.trim()
        .replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "");
      const start = text.indexOf("{");
      const end = text.lastIndexOf("}");
      if (start === -1 || end === -1) throw new Error("Nenhum bloco JSON encontrado");
      text = text.slice(start, end + 1).replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

      const conteudo = JSON.parse(text);
      if (!conteudo.capa || !conteudo.secoes || !Array.isArray(conteudo.secoes)) {
        throw new Error("Estrutura JSON inválida (falta capa ou secoes)");
      }
      if (conteudo.secoes.length === 0) throw new Error("Nenhuma seção gerada");

      console.log(`[Content Specialist] "${titulo}" — ${conteudo.secoes.length} capítulos gerados ✓`);
      return conteudo;

    } catch (err) {
      ultimoErro = err;
      console.error(`[Content Specialist] Tentativa ${tentativa}/${MAX_TENTATIVAS}: ${err.message}`);
      if (tentativa < MAX_TENTATIVAS) await new Promise(r => setTimeout(r, tentativa * 1500));
    }
  }

  throw new Error(`Content Specialist falhou após ${MAX_TENTATIVAS} tentativas: ${ultimoErro?.message}`);
}

module.exports = { gerarConteudoRico, NICHE_STYLES };