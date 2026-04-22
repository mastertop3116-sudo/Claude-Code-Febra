// ============================================
// NEXUS — Handlers do Telegram Bot
// Todos os comandos e mensagens do MAX
// ============================================

const { maxProcess, maxCouncil } = require("../core/max");
const { getMetas, getTarefas, getReports, saveMemory } = require("../integrations/supabase");
const { analisarYoutube, pesquisarMercado, analisarCopy, analisarURL } = require("../departments/research/research_agent");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { geminiPro } = require("../integrations/gemini");
require("dotenv").config();

const AUTHORIZED_ID = process.env.TELEGRAM_CHAT_ID;

function isAuthorized(chatId) {
  if (!AUTHORIZED_ID) return true;
  return String(chatId) === String(AUTHORIZED_ID);
}

function deny(bot, chatId) {
  bot.sendMessage(chatId, "⛔ Acesso negado.");
}

function gerarBarra(pct) {
  const total = 10;
  const cheio = Math.round((pct / 100) * total);
  return "█".repeat(cheio) + "░".repeat(total - cheio);
}

module.exports = function registerHandlers(bot) {

  bot.onText(/\/start/, (msg) => {
    if (!isAuthorized(msg.chat.id)) return deny(bot, msg.chat.id);
    bot.sendMessage(msg.chat.id,
      `*NEXUS DIGITAL HOLDING — ONLINE*\n\n` +
      `Sou o *MAX*, seu COO digital.\n\n` +
      `*Comandos:*\n` +
      `/metas — Caderno Preto\n` +
      `/tarefas — Status dos departamentos\n` +
      `/report — Stark Report\n` +
      `/conselho [decisão] — Convocar os Titãs\n` +
      `/paulo [contexto] — Análise DISC\n` +
      `/claude [pergunta] — Falar com Claude\n` +
      `/yt [url] — Analisar vídeo YouTube\n` +
      `/pesquisa [tema] — Pesquisa de mercado\n` +
      `/copy [texto] — Analisar copy/VSL\n` +
      `/url [link] — Analisar landing page\n` +
      `/status — Status do sistema\n\n` +
      `Ou me dê uma ordem direta.`,
      { parse_mode: "Markdown" }
    );
  });

  bot.onText(/\/metas/, async (msg) => {
    if (!isAuthorized(msg.chat.id)) return deny(bot, msg.chat.id);
    try {
      const metas = await getMetas();
      if (!metas.length) return bot.sendMessage(msg.chat.id, "Caderno Preto vazio.");
      let texto = "*CADERNO PRETO — METAS ATIVAS*\n\n";
      for (const m of metas) {
        const pct = m.valor_alvo > 0 ? Math.round((m.valor_atual / m.valor_alvo) * 100) : 0;
        texto += `*${m.nome}*\n${gerarBarra(pct)} ${pct}%\n${m.valor_atual} / ${m.valor_alvo}\n\n`;
      }
      bot.sendMessage(msg.chat.id, texto, { parse_mode: "Markdown" });
    } catch (e) { bot.sendMessage(msg.chat.id, `Erro: ${e.message}`); }
  });

  bot.onText(/\/tarefas/, async (msg) => {
    if (!isAuthorized(msg.chat.id)) return deny(bot, msg.chat.id);
    try {
      const tarefas = await getTarefas(null, "pendente");
      if (!tarefas.length) return bot.sendMessage(msg.chat.id, "Nenhuma tarefa pendente.");
      let texto = "*TAREFAS PENDENTES*\n\n";
      for (const t of tarefas) texto += `[${t.departamento.toUpperCase()}] *${t.titulo}*\nPrioridade: ${t.prioridade}\n\n`;
      bot.sendMessage(msg.chat.id, texto, { parse_mode: "Markdown" });
    } catch (e) { bot.sendMessage(msg.chat.id, `Erro: ${e.message}`); }
  });

  bot.onText(/\/report/, async (msg) => {
    if (!isAuthorized(msg.chat.id)) return deny(bot, msg.chat.id);
    try {
      const reports = await getReports(1);
      if (!reports.length) return bot.sendMessage(msg.chat.id, "Nenhum relatório ainda.");
      const r = reports[0];
      const data = new Date(r.created_at).toLocaleDateString("pt-BR");
      bot.sendMessage(msg.chat.id,
        `*STARK REPORT — ${data}*\n\nReceita Bruta: R$ ${r.receita_bruta}\nCustos: R$ ${r.custos}\n*Lucro Líquido: R$ ${r.lucro_liquido}*\n\nConversões: ${r.conversoes}\nLeads: ${r.leads}\n\n${r.notas || ""}`,
        { parse_mode: "Markdown" }
      );
    } catch (e) { bot.sendMessage(msg.chat.id, `Erro: ${e.message}`); }
  });

  bot.onText(/\/conselho (.+)/, async (msg, match) => {
    if (!isAuthorized(msg.chat.id)) return deny(bot, msg.chat.id);
    bot.sendMessage(msg.chat.id, `Convocando o Conselho de Titãs...`, { parse_mode: "Markdown" });
    try {
      const resultado = await maxCouncil(match[1]);
      bot.sendMessage(msg.chat.id, resultado, { parse_mode: "Markdown" });
    } catch (e) { bot.sendMessage(msg.chat.id, `Erro: ${e.message}`); }
  });

  bot.onText(/\/claude (.+)/, async (msg, match) => {
    if (!isAuthorized(msg.chat.id)) return deny(bot, msg.chat.id);
    if (!process.env.ANTHROPIC_API_KEY) return bot.sendMessage(msg.chat.id, "Chave Anthropic não configurada.");
    bot.sendMessage(msg.chat.id, `Consultando Claude...`);
    try {
      const Anthropic = require("@anthropic-ai/sdk");
      const anthropic = new Anthropic.default({ apiKey: process.env.ANTHROPIC_API_KEY });
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 1024,
        system: `Você é Claude, integrado à Nexus Digital Holding. Revisor crítico e arquiteto estratégico. Responda em português brasileiro, direto e objetivo.`,
        messages: [{ role: "user", content: match[1] }],
      });
      const resposta = response.content[0].text;
      bot.sendMessage(msg.chat.id, `*[Claude]*\n\n${resposta}`, { parse_mode: "Markdown" });
      await saveMemory("claude", "conversation", match[1], { resposta });
    } catch (e) { bot.sendMessage(msg.chat.id, `Erro ao consultar Claude: ${e.message}`); }
  });

  bot.onText(/\/paulo (.+)/, async (msg, match) => {
    if (!isAuthorized(msg.chat.id)) return deny(bot, msg.chat.id);
    bot.sendMessage(msg.chat.id, `Paulo Vieira analisando...`);
    try {
      const resultado = await geminiPro(`Você é Paulo Vieira, especialista DISC.\nAnalise: ${match[1]}\n\n1. Perfil DISC do público\n2. Gatilhos emocionais\n3. Tom de comunicação\n4. Objeções e como quebrar`);
      bot.sendMessage(msg.chat.id, resultado, { parse_mode: "Markdown" });
    } catch (e) { bot.sendMessage(msg.chat.id, `Erro: ${e.message}`); }
  });

  bot.onText(/\/yt (.+)/, async (msg, match) => {
    if (!isAuthorized(msg.chat.id)) return deny(bot, msg.chat.id);
    bot.sendMessage(msg.chat.id, `Analisando vídeo...`);
    try {
      const resultado = await analisarYoutube(match[1]);
      bot.sendMessage(msg.chat.id, resultado, { parse_mode: "Markdown" });
    } catch (e) { bot.sendMessage(msg.chat.id, `Erro: ${e.message}`); }
  });

  bot.onText(/\/pesquisa (.+)/, async (msg, match) => {
    if (!isAuthorized(msg.chat.id)) return deny(bot, msg.chat.id);
    bot.sendMessage(msg.chat.id, `Pesquisando mercado de "${match[1]}"...`);
    try {
      const resultado = await pesquisarMercado(match[1]);
      bot.sendMessage(msg.chat.id, resultado, { parse_mode: "Markdown" });
    } catch (e) { bot.sendMessage(msg.chat.id, `Erro: ${e.message}`); }
  });

  bot.onText(/\/copy (.+)/, async (msg, match) => {
    if (!isAuthorized(msg.chat.id)) return deny(bot, msg.chat.id);
    bot.sendMessage(msg.chat.id, `Analisando copy...`);
    try {
      const resultado = await analisarCopy(match[1]);
      bot.sendMessage(msg.chat.id, resultado, { parse_mode: "Markdown" });
    } catch (e) { bot.sendMessage(msg.chat.id, `Erro: ${e.message}`); }
  });

  bot.onText(/\/url (.+)/, async (msg, match) => {
    if (!isAuthorized(msg.chat.id)) return deny(bot, msg.chat.id);
    bot.sendMessage(msg.chat.id, `Analisando página...`);
    try {
      const resultado = await analisarURL(match[1]);
      bot.sendMessage(msg.chat.id, resultado, { parse_mode: "Markdown" });
    } catch (e) { bot.sendMessage(msg.chat.id, `Erro: ${e.message}`); }
  });

  bot.onText(/\/status/, (msg) => {
    if (!isAuthorized(msg.chat.id)) return deny(bot, msg.chat.id);
    bot.sendMessage(msg.chat.id,
      `*NEXUS — STATUS*\n\nMAX: Online\nGemini: Ativo\nSupabase: Conectado\nTelegram: Online`,
      { parse_mode: "Markdown" }
    );
  });

  // Mensagens livres
  bot.on("message", async (msg) => {
    if (!isAuthorized(msg.chat.id)) return deny(bot, msg.chat.id);
    if (msg.text && msg.text.startsWith("/")) return;

    // Imagem/print
    if (msg.photo) {
      try {
        bot.sendChatAction(msg.chat.id, "typing");
        const fileUrl = await bot.getFileLink(msg.photo[msg.photo.length - 1].file_id);
        const caption = msg.caption || "Analise esta imagem. Se for print de negócio, dê insights acionáveis.";
        const buf = await downloadFile(fileUrl);
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent([
          { text: `Você é MAX, COO da Nexus Digital Holding. ${caption}` },
          { inlineData: { mimeType: "image/jpeg", data: buf.toString("base64") } },
        ]);
        bot.sendMessage(msg.chat.id, result.response.text(), { parse_mode: "Markdown" });
      } catch (e) { bot.sendMessage(msg.chat.id, `Erro ao analisar imagem: ${e.message}`); }
      return;
    }

    // Áudio/voz
    if (msg.voice || msg.audio) {
      try {
        bot.sendChatAction(msg.chat.id, "typing");
        const fileUrl = await bot.getFileLink(msg.voice ? msg.voice.file_id : msg.audio.file_id);
        const buf = await downloadFile(fileUrl);
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent([
          { inlineData: { mimeType: "audio/ogg", data: buf.toString("base64") } },
          { text: `Você é MAX, COO da Nexus. Transcreva o áudio e responda de forma direta e estratégica em português.` },
        ]);
        bot.sendMessage(msg.chat.id, result.response.text(), { parse_mode: "Markdown" });
      } catch (e) { bot.sendMessage(msg.chat.id, `Erro ao processar áudio: ${e.message}`); }
      return;
    }

    // Texto
    if (!msg.text) return;
    try {
      bot.sendChatAction(msg.chat.id, "typing");
      const resultado = await maxProcess(msg.text, msg.chat.id);
      bot.sendMessage(msg.chat.id, resultado, { parse_mode: "Markdown" });
    } catch (e) { bot.sendMessage(msg.chat.id, `Erro: ${e.message}`); }
  });

  console.log("NEXUS — MAX online. Aguardando ordens via Telegram...");
};

// Helper: baixa arquivo do Telegram
function downloadFile(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? require("https") : require("http");
    client.get(url, (res) => {
      const chunks = [];
      res.on("data", c => chunks.push(c));
      res.on("end", () => resolve(Buffer.concat(chunks)));
      res.on("error", reject);
    });
  });
}
