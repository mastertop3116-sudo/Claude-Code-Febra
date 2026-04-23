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
    prefix: "O Ensinamento de",
    temas: ["Fé","Amor","Esperança","Graça","Perdão","Sabedoria","Coragem","Paz","Propósito","Gratidão"],
    intro_titulo: "Como Usar Este Material",
    atividade_label: "Reflexão",
    especialista_label: "Palavra do Pastor",
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
  } = config;

  const style = NICHE_STYLES[temaKey] || NICHE_STYLES.produtividade;
  const totalCaps = numCapitulos || Math.min(10, Math.max(5, Math.round(paginas / 2)));
  const temasUsados = style.temas.slice(0, totalCaps).join(", ");

  const tipoDesc = {
    ebook: "ebook completo com atividades práticas por capítulo",
    workbook: "caderno de exercícios interativo com práticas guiadas",
    checklist: "guia de verificação completo com orientações detalhadas",
    planner: "organizador prático com técnicas e rotinas",
    script_vsl: "script de vídeo de vendas estruturado e persuasivo",
    cheat_sheet: "guia de referência rápida com técnicas e exemplos",
    certificado: "certificado de conclusão",
  }[tipo] || tipo;

  const prompt = `Você é o melhor especialista em criação de produtos digitais educacionais do Brasil.
Crie um ${tipoDesc} EXCEPCIONAL chamado "${titulo}".

Contexto/nicho: ${descricao}
Público-alvo (avatar): ${avatar || "adultos e pais brasileiros"}
Total de capítulos/seções: ${totalCaps}
Estilo de nomenclatura: ${style.prefix} [Palavra] (exemplos: ${temasUsados})

MISSÃO PRINCIPAL: Criar conteúdo NO NÍVEL de "Manual de Dinâmicas de Kung Fu — +150 Jogos" — profundo, prático, temático, com atividades reais. Cada capítulo deve ENSINAR algo concreto, não apenas descrever.

REGRAS DE EXCELÊNCIA:
1. Títulos dos capítulos = temáticos e marcantes (usa o estilo "${style.prefix}")
2. Cada capítulo: 5 itens nos destaques = 3 atividades/exercícios + 1 dica do especialista + 1 lista de competências desenvolvidas
3. Cada atividade nos destaques deve ter: nome criativo; objetivo claro; duração estimada; materiais (se aplicável); como executar em 2-3 passos
4. Progressão lógica entre capítulos: do básico ao avançado, do individual ao coletivo, do físico ao mental
5. Tom: envolvente, prático, vocabulário específico do nicho. Use termos técnicos reais
6. Introdução: explica a metodologia, a filosofia e como usar o material
7. NUNCA use conteúdo genérico ou placeholder. Seja específico ao nicho

REGRAS DE JSON — OBRIGATÓRIO:
- Retorne APENAS JSON puro, sem markdown, sem texto antes ou depois
- NUNCA use aspas duplas dentro de strings — use aspas simples se precisar
- NUNCA coloque quebras de linha dentro de valores de string — use ponto e vírgula para separar ideias
- Máximo 450 caracteres por string de destaque

ESTRUTURA JSON OBRIGATÓRIA:
{
  "capa": {
    "titulo": "título principal do produto",
    "subtitulo": "subtítulo com proposta de valor clara (ex: +${totalCaps * 10} ${style.atividade_label}s Práticos Para Transformar Resultados)",
    "tagline": "3 palavras-chave separadas por • (ex: Foco • Disciplina • Resultado)",
    "badge_publico": "frase de público-alvo (ex: Para Crianças de 4 a 12 Anos)",
    "badge_valor": "quantidade de valor (ex: +${totalCaps * 10} ${style.atividade_label}s)",
    "badge_extra": "diferencial (ex: Pronto para Imprimir / Aplicação Imediata)"
  },
  "introducao": "texto rico de introdução explicando a metodologia, a filosofia do material e como o leitor deve usar cada capítulo para obter o máximo de resultado",
  "secoes": [
    {
      "titulo": "título temático usando o estilo ${style.prefix}",
      "conteudo": "parágrafo rico descrevendo o foco do capítulo; o que o aluno vai aprender; por que esta progressão é importante; como as atividades se conectam com o desenvolvimento geral",
      "destaques": [
        "${style.atividade_label} 1: [nome criativo] — [o que é e como fazer em 2-3 passos]. Objetivo: [resultado esperado]. Duração: [X-Y min]",
        "${style.atividade_label} 2: [nome criativo] — [descrição + como executar]. Variação: [versão mais desafiadora para alunos avançados]",
        "${style.atividade_label} 3: [nome criativo] — [descrição]. Materiais: [lista de materiais se necessário]. Como aplicar: [instruções práticas]",
        "${style.especialista_label}: [dica prática e específica que só um especialista real daria — algo que transforma a qualidade da execução]",
        "Competências desenvolvidas neste capítulo: [competência 1] • [competência 2] • [competência 3] • [competência 4]"
      ]
    }
  ],
  "conclusao": "conclusão motivacional com próximos passos concretos e call-to-action forte para o leitor continuar praticando",
  "sobre_autor": "texto profissional de 2-3 frases sobre o autor ou produto, destacando credibilidade e missão"
}

Idioma: PORTUGUÊS BRASILEIRO. Crie exatamente ${totalCaps} seções. Cada seção deve ter exatamente 5 destaques seguindo o padrão acima.`;

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