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
- conteudo: "[EIXO X: NOME DO EIXO] | A VISÃO DO MENTOR: [2-3 parágrafos de ensino profundo; com exegese do grego/hebraico se relevante; referências bíblicas contextuais; aplicação à vida moderna do cristão brasileiro]. Progressão: inicia do princípio teológico, passa pela realidade do leitor, chega à transformação prática"
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
- Máximo 480 caracteres por destaque

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
2. Cada capítulo: 5 destaques = 3 atividades/exercícios + 1 dica do especialista + 1 competências
3. Cada atividade: nome criativo; objetivo; duração; materiais; como executar em 2-3 passos
4. Progressão lógica: do básico ao avançado, do individual ao coletivo, do físico ao mental
5. Tom: envolvente, prático, vocabulário específico do nicho. Termos técnicos reais
6. NUNCA use conteúdo genérico ou placeholder

REGRAS DE JSON — OBRIGATÓRIO:
- Retorne APENAS JSON puro, sem markdown
- NUNCA aspas duplas dentro de strings — use aspas simples
- NUNCA quebras de linha dentro de valores — use ponto e vírgula
- Máximo 450 caracteres por destaque

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
      "conteudo": "parágrafo rico: foco do capítulo; o que o aluno aprende; progressão; conexão com desenvolvimento geral",
      "destaques": [
        "${style.atividade_label} 1: [nome criativo] — [como fazer em 2-3 passos]. Objetivo: [resultado]. Duração: [X-Y min]",
        "${style.atividade_label} 2: [nome criativo] — [descrição + execução]. Variação: [versão avançada]",
        "${style.atividade_label} 3: [nome criativo] — [descrição]. Materiais: [lista]. Como aplicar: [instruções]",
        "${style.especialista_label}: [dica específica que transforma a qualidade da execução]",
        "Competências desenvolvidas: [comp 1] • [comp 2] • [comp 3] • [comp 4]"
      ]
    }
  ],
  "conclusao": "conclusão motivacional com próximos passos e call-to-action forte",
  "sobre_autor": "texto profissional de 2-3 frases sobre o autor, credibilidade e missão"
}

Idioma: PORTUGUÊS BRASILEIRO. Crie exatamente ${totalCaps} seções com exatamente 5 destaques cada.`;
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
  const totalCaps = numCapitulos || Math.min(10, Math.max(5, Math.round(paginas / 2)));

  const isDegrau = style.formato === "degrau";
  const basePrompt = isDegrau
    ? buildPromptDegrau(titulo, descricao, avatar, totalCaps)
    : buildPromptCapitulo(titulo, descricao, avatar, totalCaps, tipo, style);
  const prompt = instrucaoMelhoria
    ? `${basePrompt}\n\nINSTRUÇÃO DE MELHORIA (aplique obrigatoriamente nesta regeneração):\n${instrucaoMelhoria}`
    : basePrompt;

  const MAX_TENTATIVAS = 3;
  let ultimoErro = null;

  for (let tentativa = 1; tentativa <= MAX_TENTATIVAS; tentativa++) {
    try {
      let raw;
      if (tentativa === MAX_TENTATIVAS) {
        console.log("[Content Specialist] Última tentativa — usando Gemini Pro");
        raw = await geminiPro(prompt);
      } else {
        raw = await geminiJson(prompt, tentativa === 2);
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