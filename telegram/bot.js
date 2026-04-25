// ============================================
// NEXUS — Telegram Bot (Interface do MAX)
// Controle total da Nexus via Telegram
// ============================================

const TelegramBot = require("node-telegram-bot-api");
const { maxProcess, maxCouncil } = require("../core/max");
const { getMetas, getTarefas, getReports, saveMemory } = require("../integrations/supabase");
const { analisarYoutube, pesquisarMercado, analisarCopy, analisarURL } = require("../departments/research/research_agent");
require("dotenv").config();

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
const AUTHORIZED_ID = process.env.TELEGRAM_CHAT_ID;

// ──────────────────────────────────────────
// Segurança: apenas o dono pode usar o bot
// ──────────────────────────────────────────
function isAuthorized(chatId) {
  if (!AUTHORIZED_ID) return true; // se não configurado, permite (modo dev)
  return String(chatId) === String(AUTHORIZED_ID);
}

function deny(chatId) {
  bot.sendMessage(chatId, "⛔ Acesso negado.");
}

// ──────────────────────────────────────────
// /start — Iniciar MAX
// ──────────────────────────────────────────
bot.onText(/\/start/, (msg) => {
  if (!isAuthorized(msg.chat.id)) return deny(msg.chat.id);

  bot.sendMessage(
    msg.chat.id,
    `${process.env.BRAND_NAME ? '*' + process.env.BRAND_NAME + ' — ONLINE*' : '*MAX — ONLINE*'}\n\n` +
    `Olá. Sou o *MAX*, seu COO digital.\n\n` +
    `*Comandos disponíveis:*\n` +
    `/metas — Ver Caderno Preto\n` +
    `/tarefas — Status dos departamentos\n` +
    `/report — Stark Report\n` +
    `/conselho [decisão] — Convocar os Titãs\n` +
    `/mentor [contexto] — Análise DISC\n` +
    `/yt [url] — Analisar vídeo YouTube\n` +
    `/pesquisa [tema] — Pesquisa de mercado\n` +
    `/copy [texto] — Analisar copy/VSL\n` +
    `/url [link] — Analisar landing page\n` +
    `/status — Status do sistema\n\n` +
    `Ou simplesmente me dê uma ordem direta.`,
    { parse_mode: "Markdown" }
  );
});

// ──────────────────────────────────────────
// /metas — Caderno Preto
// ──────────────────────────────────────────
bot.onText(/\/metas/, async (msg) => {
  if (!isAuthorized(msg.chat.id)) return deny(msg.chat.id);

  try {
    const metas = await getMetas();
    if (!metas.length) {
      return bot.sendMessage(msg.chat.id, "Caderno Preto vazio. Adicione metas.");
    }

    let texto = "*CADERNO PRETO — METAS ATIVAS*\n\n";
    for (const m of metas) {
      const pct = m.valor_alvo > 0 ? Math.round((m.valor_atual / m.valor_alvo) * 100) : 0;
      const barra = gerarBarra(pct);
      texto += `*${m.nome}*\n${barra} ${pct}%\n${m.valor_atual} / ${m.valor_alvo}\n\n`;
    }

    bot.sendMessage(msg.chat.id, texto, { parse_mode: "Markdown" });
  } catch (e) {
    bot.sendMessage(msg.chat.id, `Erro ao buscar metas: ${e.message}`);
  }
});

// ──────────────────────────────────────────
// /tarefas — Status dos departamentos
// ──────────────────────────────────────────
bot.onText(/\/tarefas/, async (msg) => {
  if (!isAuthorized(msg.chat.id)) return deny(msg.chat.id);

  try {
    const tarefas = await getTarefas(null, "pendente");
    if (!tarefas.length) {
      return bot.sendMessage(msg.chat.id, "Nenhuma tarefa pendente. Sistema ocioso.");
    }

    let texto = "*TAREFAS PENDENTES*\n\n";
    for (const t of tarefas) {
      texto += `[${t.departamento.toUpperCase()}] *${t.titulo}*\nPrioridade: ${t.prioridade}\n\n`;
    }

    bot.sendMessage(msg.chat.id, texto, { parse_mode: "Markdown" });
  } catch (e) {
    bot.sendMessage(msg.chat.id, `Erro ao buscar tarefas: ${e.message}`);
  }
});

// ──────────────────────────────────────────
// /report — Stark Report
// ──────────────────────────────────────────
bot.onText(/\/report/, async (msg) => {
  if (!isAuthorized(msg.chat.id)) return deny(msg.chat.id);

  try {
    const reports = await getReports(1);
    if (!reports.length) {
      return bot.sendMessage(msg.chat.id, "Nenhum relatório gerado ainda.");
    }

    const r = reports[0];
    const data = new Date(r.created_at).toLocaleDateString("pt-BR");

    const texto =
      `*STARK REPORT — ${data}*\n\n` +
      `Receita Bruta: R$ ${r.receita_bruta}\n` +
      `Custos: R$ ${r.custos}\n` +
      `*Lucro Líquido: R$ ${r.lucro_liquido}*\n\n` +
      `Conversões: ${r.conversoes}\n` +
      `Leads: ${r.leads}\n\n` +
      `${r.notas || ""}`;

    bot.sendMessage(msg.chat.id, texto, { parse_mode: "Markdown" });
  } catch (e) {
    bot.sendMessage(msg.chat.id, `Erro ao buscar report: ${e.message}`);
  }
});

// ──────────────────────────────────────────
// /conselho — Convocar o Conselho de Titãs
// ──────────────────────────────────────────
bot.onText(/\/conselho (.+)/, async (msg, match) => {
  if (!isAuthorized(msg.chat.id)) return deny(msg.chat.id);

  const decisao = match[1];
  bot.sendMessage(msg.chat.id, `Convocando o Conselho de Titãs...\n\n_"${decisao}"_`, { parse_mode: "Markdown" });

  try {
    const resultado = await maxCouncil(decisao);
    bot.sendMessage(msg.chat.id, resultado, { parse_mode: "Markdown" });
    await saveMemory("MAX", "council", resultado, { decisao });
  } catch (e) {
    bot.sendMessage(msg.chat.id, `Erro no conselho: ${e.message}`);
  }
});

// ──────────────────────────────────────────
// /claude — Fala direto comigo (Claude/Anthropic)
// ──────────────────────────────────────────
bot.onText(/\/claude (.+)/, async (msg, match) => {
  if (!isAuthorized(msg.chat.id)) return deny(msg.chat.id);

  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!anthropicKey) {
    return bot.sendMessage(msg.chat.id, "Chave da Anthropic não configurada. Adicione ANTHROPIC_API_KEY no .env.");
  }

  const pergunta = match[1];
  bot.sendMessage(msg.chat.id, `Consultando Claude...`);

  try {
    const Anthropic = require("@anthropic-ai/sdk");
    const anthropic = new Anthropic.default({ apiKey: anthropicKey });

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: `Você é Claude, da Anthropic, integrado à Nexus Digital Holding como arquiteto e revisor crítico.
Você trabalha ao lado do MAX (Gemini) — enquanto ele executa o trabalho bruto, você cuida da revisão estratégica, decisões críticas e respostas que exigem raciocínio profundo.
Responda em português brasileiro, de forma direta e objetiva.`,
      messages: [{ role: "user", content: pergunta }],
    });

    const resposta = response.content[0].text;
    bot.sendMessage(msg.chat.id, `*[Claude]*\n\n${resposta}`, { parse_mode: "Markdown" });
    await saveMemory("claude", "conversation", pergunta, { resposta });
  } catch (e) {
    bot.sendMessage(msg.chat.id, `Erro ao consultar Claude: ${e.message}`);
  }
});

// ──────────────────────────────────────────
// /mentor — Análise DISC
// ──────────────────────────────────────────
bot.onText(/\/mentor (.+)/, async (msg, match) => {
  if (!isAuthorized(msg.chat.id)) return deny(msg.chat.id);

  const contexto = match[1];
  bot.sendMessage(msg.chat.id, `Analisando perfil comportamental...`, { parse_mode: "Markdown" });

  const prompt = `
Você é um especialista em psicologia comportamental e perfil DISC.
Analise o seguinte contexto e forneça:
1. Perfil DISC provável do público/cliente
2. Gatilhos emocionais mais efetivos
3. Tom de comunicação recomendado
4. Objeções prováveis e como quebrá-las

CONTEXTO: ${contexto}
`;

  try {
    const { geminiPro } = require("../integrations/gemini");
    const resultado = await geminiPro(prompt);
    bot.sendMessage(msg.chat.id, resultado, { parse_mode: "Markdown" });
  } catch (e) {
    bot.sendMessage(msg.chat.id, `Erro na análise: ${e.message}`);
  }
});

// ──────────────────────────────────────────
// /yt — Analisar vídeo do YouTube
// ──────────────────────────────────────────
bot.onText(/\/yt (.+)/, async (msg, match) => {
  if (!isAuthorized(msg.chat.id)) return deny(msg.chat.id);
  const url = match[1];
  bot.sendMessage(msg.chat.id, `Analisando vídeo... aguarda.`);
  try {
    const resultado = await analisarYoutube(url);
    bot.sendMessage(msg.chat.id, resultado, { parse_mode: "Markdown" });
  } catch (e) {
    bot.sendMessage(msg.chat.id, `Erro: ${e.message}`);
  }
});

// ──────────────────────────────────────────
// /pesquisa — Pesquisa de mercado
// ──────────────────────────────────────────
bot.onText(/\/pesquisa (.+)/, async (msg, match) => {
  if (!isAuthorized(msg.chat.id)) return deny(msg.chat.id);
  const tema = match[1];
  bot.sendMessage(msg.chat.id, `Pesquisando mercado de "${tema}"... aguarda.`);
  try {
    const resultado = await pesquisarMercado(tema);
    bot.sendMessage(msg.chat.id, resultado, { parse_mode: "Markdown" });
  } catch (e) {
    bot.sendMessage(msg.chat.id, `Erro: ${e.message}`);
  }
});

// ──────────────────────────────────────────
// /copy — Analisar copy/VSL
// ──────────────────────────────────────────
bot.onText(/\/copy (.+)/, async (msg, match) => {
  if (!isAuthorized(msg.chat.id)) return deny(msg.chat.id);
  const texto = match[1];
  bot.sendMessage(msg.chat.id, `Analisando copy...`);
  try {
    const resultado = await analisarCopy(texto);
    bot.sendMessage(msg.chat.id, resultado, { parse_mode: "Markdown" });
  } catch (e) {
    bot.sendMessage(msg.chat.id, `Erro: ${e.message}`);
  }
});

// ──────────────────────────────────────────
// /url — Analisar landing page/site
// ──────────────────────────────────────────
bot.onText(/\/url (.+)/, async (msg, match) => {
  if (!isAuthorized(msg.chat.id)) return deny(msg.chat.id);
  const url = match[1];
  bot.sendMessage(msg.chat.id, `Analisando página...`);
  try {
    const resultado = await analisarURL(url);
    bot.sendMessage(msg.chat.id, resultado, { parse_mode: "Markdown" });
  } catch (e) {
    bot.sendMessage(msg.chat.id, `Erro: ${e.message}`);
  }
});

// ──────────────────────────────────────────
// /status — Status do sistema
// ──────────────────────────────────────────
bot.onText(/\/status/, (msg) => {
  if (!isAuthorized(msg.chat.id)) return deny(msg.chat.id);

  bot.sendMessage(
    msg.chat.id,
    `*NEXUS — STATUS DO SISTEMA*\n\n` +
    `MAX: Online\n` +
    `Gemini Flash: Ativo\n` +
    `Gemini Pro: Ativo\n` +
    `Supabase: Conectado\n` +
    `Telegram: Online\n\n` +
    `_Todos os sistemas operacionais._`,
    { parse_mode: "Markdown" }
  );
});

// ──────────────────────────────────────────
// Mensagens livres → MAX processa
// ──────────────────────────────────────────
bot.on("message", async (msg) => {
  if (!isAuthorized(msg.chat.id)) return deny(msg.chat.id);
  if (msg.text && msg.text.startsWith("/")) return;

  // Imagens/prints — analisa via Gemini Vision
  if (msg.photo) {
    try {
      bot.sendChatAction(msg.chat.id, "typing");
      const photo = msg.photo[msg.photo.length - 1]; // maior resolução
      const fileUrl = await bot.getFileLink(photo.file_id);
      const caption = msg.caption || "Analise esta imagem e me diga o que vê. Se for um print de negócio, métricas ou estratégia, dê insights acionáveis.";

      const https = require("https");
      const http = require("http");
      const client = fileUrl.startsWith("https") ? https : http;

      const imageBuffer = await new Promise((resolve, reject) => {
        client.get(fileUrl, (res) => {
          const chunks = [];
          res.on("data", chunk => chunks.push(chunk));
          res.on("end", () => resolve(Buffer.concat(chunks)));
          res.on("error", reject);
        });
      });

      const { GoogleGenerativeAI } = require("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const result = await model.generateContent([
        { text: `Você é MAX, COO da Nexus Digital Holding. ${caption}` },
        { inlineData: { mimeType: "image/jpeg", data: imageBuffer.toString("base64") } },
      ]);

      const resposta = result.response.text();
      bot.sendMessage(msg.chat.id, resposta, { parse_mode: "Markdown" });
      await saveMemory("MAX", "image_analysis", caption, { resposta });
    } catch (e) {
      bot.sendMessage(msg.chat.id, `Erro ao analisar imagem: ${e.message}`);
    }
    return;
  }

  // Áudio/voz — transcreve via Gemini
  if (msg.voice || msg.audio) {
    try {
      bot.sendChatAction(msg.chat.id, "typing");
      const fileId = msg.voice ? msg.voice.file_id : msg.audio.file_id;
      const fileUrl = await bot.getFileLink(fileId);

      const https = require("https");
      const http = require("http");
      const client = fileUrl.startsWith("https") ? https : http;

      const audioBuffer = await new Promise((resolve, reject) => {
        client.get(fileUrl, (res) => {
          const chunks = [];
          res.on("data", chunk => chunks.push(chunk));
          res.on("end", () => resolve(Buffer.concat(chunks)));
          res.on("error", reject);
        });
      });

      const { GoogleGenerativeAI } = require("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const result = await model.generateContent([
        {
          inlineData: {
            mimeType: "audio/ogg",
            data: audioBuffer.toString("base64"),
          },
        },
        `Você é MAX, COO da Nexus Digital Holding.
Primeiro transcreva o áudio. Depois responda ao que foi dito de forma direta e estratégica.
Responda em português brasileiro.`,
      ]);

      const resposta = result.response.text();
      bot.sendMessage(msg.chat.id, resposta, { parse_mode: "Markdown" });
      await saveMemory("MAX", "voice", "[áudio]", { resposta });
    } catch (e) {
      bot.sendMessage(msg.chat.id, `Erro ao processar áudio: ${e.message}`);
    }
    return;
  }

  // Mensagem de texto
  if (!msg.text) return;

  try {
    bot.sendChatAction(msg.chat.id, "typing");
    const resultado = await maxProcess(msg.text, msg.chat.id);
    bot.sendMessage(msg.chat.id, resultado, { parse_mode: "Markdown" });
  } catch (e) {
    bot.sendMessage(msg.chat.id, `Erro ao processar: ${e.message}`);
  }
});

// ──────────────────────────────────────────
// Helper: barra de progresso
// ──────────────────────────────────────────
function gerarBarra(pct) {
  const total = 10;
  const cheio = Math.round((pct / 100) * total);
  return "█".repeat(cheio) + "░".repeat(total - cheio);
}

console.log("NEXUS — MAX online. Aguardando ordens via Telegram...");
