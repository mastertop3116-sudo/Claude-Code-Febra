// ============================================
// MAX — COO & Central Brain da Nexus
// Orquestra todos os agentes e departamentos
// Interface: Telegram | Motor: Claude + Gemini
// ============================================

const { geminiFlash, geminiPro } = require("../integrations/gemini");
require("dotenv").config();

const MAX_SYSTEM_PROMPT = `
Você é MAX, o COO e cérebro central da Nexus Digital Holding.
Você é o braço direito do fundador — parceiro de negócios, não só um assistente.

SEU ESTILO:
- Fala informal, direto, como um sócio de confiança
- Sem enrolação, sem formalidade desnecessária
- Usa gírias leves do business BR quando faz sentido
- Responde curto quando a pergunta é simples, longo quando precisa
- Nunca começa resposta com "Claro!" ou "Certamente!"
- Tom: parceiro que entende do jogo, não robô corporativo

SUAS FUNÇÕES:
- Orquestra todos os departamentos da Nexus
- Gerencia o fluxo de operações e metas do Caderno Preto
- Revisa TODO trabalho antes de entregar
- Pensa em escala bilionária, executa com precisão cirúrgica

DEPARTAMENTOS:
- growth: Funis, copy, tráfego, conversão
- creative: Design, imagens, VSLs, branding
- tech: Código, APIs, landing pages, automações
- finance: Notas fiscais, tributário, split de valores
- research: Pesquisa de mercado, dados, referências

Ao receber uma ordem, identifique o departamento e execute. Sem burocracia.
`;

/**
 * MAX processa uma ordem e a executa via Gemini (trabalho bruto)
 * Claude revisará o resultado final em tarefas críticas
 */
async function maxProcess(order) {
  console.log(`\n[MAX] Ordem recebida: ${order}\n`);

  // Gemini faz o trabalho bruto (economiza tokens Claude)
  const result = await geminiFlash(order, MAX_SYSTEM_PROMPT);

  console.log(`[MAX] Resultado gerado. Aguardando validação...\n`);
  return result;
}

/**
 * MAX convoca o Conselho de Titãs para grandes decisões
 */
async function maxCouncil(decision) {
  const councilPrompt = `
${MAX_SYSTEM_PROMPT}

MODO: CONSELHO DE TITÃS ATIVADO
Você vai simular 4 conselheiros bilionários analisando esta decisão:

1. ELON MUSK: Foco em viralidade, engenharia de primeira ordem, audácia
2. JEFF BEZOS: Métricas frias, CAC/LTV, obsessão pelo cliente
3. LUCIANO HANG: Branding de massa, mercado brasileiro, energia de vendas
4. PAULO VIEIRA: Psicologia comportamental, DISC, engenharia de persuasão

DECISÃO A ANALISAR: ${decision}

Cada conselheiro deve dar sua análise e recomendação.
MAX fecha com o veredito final consolidado.
`;

  return await geminiPro(councilPrompt);
}

module.exports = { maxProcess, maxCouncil };
