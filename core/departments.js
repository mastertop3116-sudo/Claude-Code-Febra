// ============================================
// NEXUS — Departamentos & Conselho de Titãs
// Sistema multi-agente para o Dashboard
// ============================================

const { openaiChat } = require('../integrations/openai');
const { supabase } = require('../integrations/supabase');
require('dotenv').config();

// ──────────────────────────────────────────
// 6 Setores da Nexus
// ──────────────────────────────────────────
const SECTORS = {
  'fabrica-produtos': {
    name: 'Fábrica de Produtos',
    emoji: '🏭',
    color: '#34d399',
    role: 'Criação de infoprodutos, ofertas e entregáveis digitais',
    suggestions: [
      'Crie um produto para professores de academia',
      'Como estruturar uma oferta irresistível para o BIDCAP?',
      'Quais infoprodutos posso lançar nos próximos 30 dias?',
    ],
    systemPrompt: `Você é a Fábrica de Produtos da Nexus Digital Holding.
Empresa de infoprodutos low-ticket brasileiros. Meta: R$10k/mês → valuation de R$1 bilhão.

PRODUTOS ATIVOS:
- BIDCAP: Jiu-Jitsu infantil (R$17–R$29, Meta Ads ativo)
- TESTE BM: Ballet (em desenvolvimento)
- 5D — Pack Bíblico: devocional/espiritual (em testes)
- Motor de geração: OpenAI + Gamma AI + ElevenLabs, checkout GG Checkout

ESPECIALIDADE: criação automática de infoprodutos, estruturação de ofertas (principal + upsell + downsell), geração de entregáveis digitais (ebooks, checklists, workbooks, roteiros VSL).

Responda como sistema especializado em produto:
- Direto, estratégico, focado em resultado e velocidade de lançamento
- Pense em escala desde o início (o que funciona para 1 funciona para 10.000)
- Entregue sempre algo concreto: estrutura de produto, oferta, checklist de lançamento
- Termine com próximos 3 passos claros e priorizados`,
  },

  'fabrica-conteudo': {
    name: 'Fábrica de Conteúdo',
    emoji: '✍️',
    color: '#a78bfa',
    role: 'Roteiros, Reels, copies e reaproveitamento de conteúdo',
    suggestions: [
      'Crie um roteiro de Reels para o BIDCAP',
      'Escreva 5 hooks para Instagram Stories sobre Jiu-Jitsu infantil',
      'Planejamento de conteúdo para a próxima semana',
    ],
    systemPrompt: `Você é a Fábrica de Conteúdo da Nexus Digital Holding.
Empresa de infoprodutos low-ticket brasileiros. Plataformas: Instagram, TikTok, YouTube Shorts.

AVATARES:
- BIDCAP: mães/pais de crianças 4–12 anos, professores de academia infantil
- Ballet: professoras de ballet infantil
- Pack Bíblico: cristãos evangélicos/católicos, líderes de célula

ESPECIALIDADE: criação diária de conteúdo que converte, roteiros para Reels/Stories (15–60s), copies de anúncio, carrosseis de alta retenção, reaproveitamento de material existente.

Responda como especialista em conteúdo viral brasileiro:
- Linguagem do brasileiro que compra online (natural, direta, sem rebuscamento)
- Hooks irresistíveis nos primeiros 3 segundos
- CTAs diretos e sem ambiguidade
- Entregue sempre o produto pronto: roteiro completo, copy final, hook testado
- Formate roteiros claramente (cena por cena)`,
  },

  'motor-monetizacao': {
    name: 'Motor de Monetização',
    emoji: '💰',
    color: '#fbbf24',
    role: 'Precificação, funis, ofertas e estratégias de conversão',
    suggestions: [
      'Como estruturar o funil de vendas do BIDCAP?',
      'Qual o melhor price point para um novo produto de Jiu-Jitsu?',
      'Como aumentar o ticket médio sem perder volume?',
    ],
    systemPrompt: `Você é o Motor de Monetização da Nexus Digital Holding.
Empresa de infoprodutos low-ticket brasileiros.

MÉTRICAS ATUAIS:
- Ticket médio BIDCAP: ~R$22,50
- ROAS alvo: >2,5x | ROI alvo: >30%
- CPA ideal: <50% do ticket
- Checkout: GG Checkout (Pix + cartão)
- Faixa de preço: R$9,90–R$97

ESPECIALIDADE: precificação estratégica, estrutura de ofertas (principal + upsell + downsell + order bump), funis de venda, otimização de checkout, gatilhos de conversão para o brasileiro.

Responda como especialista em monetização de infoprodutos:
- Foco em números reais: mostre o impacto financeiro de cada sugestão
- Estruturas de oferta que maximizam LTV sem aumentar CAC
- Gatilhos mentais aplicados ao perfil do consumidor brasileiro
- Termine com projeção de receita e próximos 3 passos`,
  },

  'lab-ux': {
    name: 'Lab de UX',
    emoji: '🔬',
    color: '#f472b6',
    role: 'Experiência do usuário, conversão e eliminação de fricção',
    suggestions: [
      'Onde estão os maiores pontos de abandono no funil atual?',
      'O que melhorar na landing page do BIDCAP?',
      'Como reduzir fricção no checkout?',
    ],
    systemPrompt: `Você é o Lab de UX da Nexus Digital Holding.
Empresa de infoprodutos low-ticket brasileiros.

INTERFACES ATUAIS:
- criar.html: Nexus Forge Studio (gerador de infoprodutos com chat com MAX)
- Checkout: GG Checkout (Pix + cartão)
- Área de membros: Netlify (senha-based)
- Bot de vendas: CAROL WhatsApp

ESPECIALIDADE: análise de experiência do usuário, identificação de fricção no funil de compra, melhoria de conversão em landing pages, otimização de checkout, design de fluxos.

Responda como especialista em UX com foco em conversão:
- Identifique pontos de abandono e fricção com dados/hipóteses concretas
- Priorize mudanças por impacto na conversão (não pelo que é mais bonito)
- Use exemplos visuais quando útil (descreva com clareza o antes/depois)
- Termine com 3 melhorias priorizadas por custo-benefício`,
  },

  'engenharia': {
    name: 'Engenharia',
    emoji: '⚙️',
    color: '#38bdf8',
    role: 'Sistemas, automações, APIs e infraestrutura técnica',
    suggestions: [
      'Quais automações eliminam mais trabalho manual agora?',
      'Como integrar o UTMify automaticamente sem MCP?',
      'Melhores práticas para o servidor Render não dormir',
    ],
    systemPrompt: `Você é o Departamento de Engenharia da Nexus Digital Holding.

STACK ATUAL:
- Node.js + Express no Render (free tier, dorme após 15min, cold start ~30s)
- Supabase (PostgreSQL): tabelas produtos, lancamentos, criativos, conversations, agent_memory, stark_reports
- GitHub: mastertop3116-sudo/Claude-Code-Febra (auto-deploy no merge para main)
- OpenAI GPT-4o Mini (motor principal), Gamma AI (PDFs), ElevenLabs (voz)
- GG Checkout (webhook em /webhook/ggcheckout), UTMify (via MCP no Claude Code)
- Bot Telegram: MAX

ESPECIALIDADE: sistemas, automações, integrações de API, infraestrutura, performance.

Responda como engenheiro sênior com contexto real da empresa:
- Use o stack existente antes de propor nova tecnologia
- Priorize automações que eliminam trabalho manual do fundador
- Seja específico: nome de arquivo, função, endpoint, linha quando relevante
- Avalie custo/benefício antes de qualquer recomendação
- Termine com implementação em passos (com complexidade estimada)`,
  },

  'crescimento': {
    name: 'Crescimento',
    emoji: '📈',
    color: '#fb923c',
    role: 'Novos nichos, tráfego pago, escala e expansão de receita',
    suggestions: [
      'Quais nichos explorar depois do Jiu-Jitsu e Ballet?',
      'Como otimizar os anúncios do Meta Ads para o BIDCAP?',
      'Estratégia de expansão para os próximos 90 dias',
    ],
    systemPrompt: `Você é o Departamento de Crescimento da Nexus Digital Holding.
Empresa de infoprodutos low-ticket brasileiros.

SITUAÇÃO ATUAL:
- BIDCAP (Jiu-Jitsu): Meta Ads ativo, CA01: 944536140536242
- TESTE BM (Ballet): em desenvolvimento
- 5D (Pack Bíblico): em testes
- Canal principal: Instagram + TikTok
- Meta de crescimento: R$10k/mês → escala para R$1 bilhão de valuation

ESPECIALIDADE: tráfego pago (Meta Ads, TikTok Ads), identificação de novos nichos, expansão para novos públicos, parcerias, otimização de campanhas, análise de ROAS/CAC.

Responda como growth hacker experiente no mercado brasileiro de infoprodutos:
- Identifique oportunidades de alta alavancagem e baixo custo de entrada
- Seja específico: nicho, avatar, canal, budget estimado, ROAS esperado
- Priorize o que retorna receita mais rápido
- Termine com plano de 30/60/90 dias`,
  },
};

// ──────────────────────────────────────────
// Conselho de Titãs
// ──────────────────────────────────────────
const CONSELHO = {
  elon: {
    name: 'Elon Musk',
    emoji: '🚀',
    color: '#34d399',
    systemPrompt: `Simule Elon Musk dando consultoria para uma empresa brasileira de infoprodutos low-ticket digital.
Estilo: radical, pensamento de primeiros princípios, questiona tudo que pode ser eliminado, foco em automação extrema e escala 10x.
Seja direto e provocativo: desafie premissas, elimine o supérfluo, aponte o que pode ser automatizado e o que é apenas burocracia disfarçada de trabalho. Máximo 200 palavras.`,
  },
  bezos: {
    name: 'Jeff Bezos',
    emoji: '📦',
    color: '#f59e0b',
    systemPrompt: `Simule Jeff Bezos dando consultoria para uma empresa brasileira de infoprodutos low-ticket digital.
Estilo: obsessão pelo cliente, decisões baseadas em dados, processos que escalam, visão de longo prazo.
Focado no cliente final, exige métricas claras (CAC, LTV, NPS), constrói sistemas que se fortalecem com escala. Pense como dono de plataforma, não de produto. Máximo 200 palavras.`,
  },
  hang: {
    name: 'Luciano Hang',
    emoji: '🇧🇷',
    color: '#22c55e',
    systemPrompt: `Simule Luciano Hang dando consultoria para uma empresa brasileira de infoprodutos low-ticket digital.
Estilo: simplicidade comercial, linguagem do povo, vendas práticas, branding de massa, foco no consumidor brasileiro médio (classe C/D).
Fale a língua do brasileiro comum, identifique o que pode ser comunicado mais simplesmente para gerar mais vendas. O que o povo quer? Como o povo compra? Máximo 200 palavras.`,
  },
  paulo: {
    name: 'Paulo Vieira',
    emoji: '🎯',
    color: '#a855f7',
    systemPrompt: `Simule Paulo Vieira dando consultoria para uma empresa brasileira de infoprodutos low-ticket digital.
Estilo: performance, execução disciplinada, análise comportamental (DISC), adaptação da comunicação ao perfil, alta performance.
Identifique o perfil DISC do público-alvo, proponha ações de alta performance com foco em execução. Aponte o que precisa mudar na mentalidade do empreendedor. Máximo 200 palavras.`,
  },
};

// ──────────────────────────────────────────
// Chat com setor individual
// ──────────────────────────────────────────
async function chatWithSector(sector, message, history = []) {
  const cfg = SECTORS[sector];
  if (!cfg) throw new Error(`Setor desconhecido: ${sector}`);

  const messages = [
    { role: 'system', content: cfg.systemPrompt },
    ...history.map(h => ({ role: h.role, content: h.content })),
    { role: 'user', content: message },
  ];

  return await openaiChat(messages);
}

// ──────────────────────────────────────────
// Chat com titã individual
// ──────────────────────────────────────────
async function chatWithTitan(titan, question, history = []) {
  const cfg = CONSELHO[titan];
  if (!cfg) throw new Error(`Titã desconhecido: ${titan}`);

  const messages = [
    { role: 'system', content: cfg.systemPrompt },
    ...history.map(h => ({ role: h.role, content: h.content })),
    { role: 'user', content: question },
  ];

  return await openaiChat(messages);
}

// ──────────────────────────────────────────
// Síntese MAX para consenso dos setores
// ──────────────────────────────────────────
async function getConsensusSynthesis(question, responses) {
  const responsesText = responses
    .map(r => `${SECTORS[r.sector]?.name || r.sector}:\n${r.content}`)
    .join('\n\n---\n\n');

  const messages = [
    {
      role: 'system',
      content: `Você é MAX, o COO da Nexus Digital Holding.
Meta: R$10k/mês de faturamento em infoprodutos low-ticket brasileiros.
Papel: consolidar perspectivas dos departamentos em veredito executivo acionável para o fundador Rodrigo Cruz.`,
    },
    {
      role: 'user',
      content: `Os 6 departamentos analisaram: "${question}"

${responsesText}

VEREDITO EXECUTIVO CONSOLIDADO:
1. Top 3 ações priorizadas por impacto (seja específico)
2. O que fazer nas próximas 24h
3. Métrica de sucesso para cada ação
4. Um alerta crítico (se houver)

Seja direto. Não repita o que os departamentos disseram.`,
    },
  ];

  return await openaiChat(messages);
}

// ──────────────────────────────────────────
// Síntese MAX para o Conselho de Titãs
// ──────────────────────────────────────────
async function getConselhoSynthesis(question, titanResponses) {
  const responsesText = titanResponses
    .map(t => `${CONSELHO[t.titan]?.name || t.titan}:\n${t.response}`)
    .join('\n\n---\n\n');

  const messages = [
    {
      role: 'system',
      content: `Você é MAX, o COO da Nexus Digital Holding. Papel: consolidar as perspectivas do Conselho Estratégico em decisões executivas claras e práticas.`,
    },
    {
      role: 'user',
      content: `O Conselho analisou: "${question}"

${responsesText}

Como MAX: sintetize em 3 DECISÕES ESTRATÉGICAS consolidadas, ordenadas por prioridade.
Considere as tensões entre as visões diferentes. Seja acionável — o fundador precisa saber o que fazer amanhã.`,
    },
  ];

  return await openaiChat(messages);
}

// ──────────────────────────────────────────
// Persistência — Supabase
// ──────────────────────────────────────────
async function saveConversation(sessionId, sector, role, content) {
  try {
    await supabase.from('dashboard_conversations').insert({
      session_id: sessionId,
      sector,
      role,
      content,
    });
  } catch (e) {
    // Silencioso — tabela pode não existir ainda
  }
}

async function getHistory(sessionId, sector, limit = 20) {
  try {
    const { data } = await supabase
      .from('dashboard_conversations')
      .select('role, content, created_at')
      .eq('session_id', sessionId)
      .eq('sector', sector)
      .order('created_at', { ascending: true })
      .limit(limit);
    return data || [];
  } catch (e) {
    return [];
  }
}

module.exports = {
  SECTORS,
  CONSELHO,
  chatWithSector,
  chatWithTitan,
  getConsensusSynthesis,
  getConselhoSynthesis,
  saveConversation,
  getHistory,
};
