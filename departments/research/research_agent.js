// ============================================
// NEXUS — Departamento de Pesquisa
// O Bibliotecário — Mineração de dados
// YouTube, PDFs, URLs, mercado e concorrentes
// ============================================

const { openaiFlash } = require("../../integrations/openai");
const { saveMemory } = require("../../integrations/supabase");
require("dotenv").config();

const BIBLIOTECARIO_PROMPT = `
Você é O Bibliotecário, gestor do Departamento de Pesquisa da Nexus Digital Holding.
Seu trabalho é minerar informações e transformar dados em insights acionáveis para o negócio.

SUAS ESPECIALIDADES:
- Análise de vídeos do YouTube (concorrentes, tendências, VSLs)
- Pesquisa de mercado e nicho
- Análise de copy e estratégias de venda
- Identificação de oportunidades e gaps de mercado
- Resumo executivo de qualquer conteúdo

FORMATO DE ENTREGA:
- Direto ao ponto, sem enrolação
- Sempre termina com "INSIGHTS ACIONÁVEIS:" com 3-5 pontos práticos
- Foca no que importa para infoprodutos e marketing digital
`;

/**
 * Analisa um vídeo do YouTube via Gemini
 * Gemini consegue processar YouTube URLs diretamente
 */
async function analisarYoutube(url, foco = null) {
  const prompt = foco
    ? `Analise este vídeo com foco em: ${foco}\n\nURL: ${url}`
    : `Analise este vídeo e extraia:\n1. Estratégia de conteúdo usada\n2. Ângulo de vendas/copy\n3. Pontos fortes e fracos\n4. O que podemos usar na Nexus\n\nURL: ${url}`;

  const resposta = await openaiFlash(`${BIBLIOTECARIO_PROMPT}\n\n${prompt}`);
  await saveMemory("research", "youtube", url, { foco, resposta });
  return resposta;
}

/**
 * Pesquisa de mercado sobre um nicho ou tema
 */
async function pesquisarMercado(tema) {
  const resposta = await openaiFlash(`${BIBLIOTECARIO_PROMPT}

Faça uma pesquisa de mercado completa sobre: "${tema}"

Inclua:
1. Tamanho e potencial do mercado
2. Principais players e concorrentes
3. Dores e desejos do público
4. Oportunidades de infoprodutos Low Ticket
5. Melhores canais de aquisição
6. Faixa de preço que converte melhor
7. Objeções mais comuns

INSIGHTS ACIONÁVEIS para a Nexus:`);
  await saveMemory("research", "market", tema, { resposta });
  return resposta;
}

/**
 * Analisa copy/VSL de um concorrente
 */
async function analisarCopy(texto) {
  return await openaiFlash(`${BIBLIOTECARIO_PROMPT}

Analise esta copy/VSL como um especialista em persuasão e vendas:

${texto}

Extraia:
1. Estrutura do funil usada
2. Gatilhos mentais identificados
3. Perfil DISC do público-alvo
4. Headline e ângulo principal
5. Promessa central e prova
6. O que replicar e o que melhorar`);
}

/**
 * Analisa uma URL (landing page, site de concorrente)
 */
async function analisarURL(url) {
  return await openaiFlash(`${BIBLIOTECARIO_PROMPT}

Analise esta página web como estrategista de marketing digital:
URL: ${url}

Foque em:
1. Proposta de valor e posicionamento
2. Estrutura da página e fluxo
3. Chamadas para ação (CTAs)
4. Estratégia de copy
5. O que roubar de inspiração para a Nexus`);
}

module.exports = { analisarYoutube, pesquisarMercado, analisarCopy, analisarURL };
