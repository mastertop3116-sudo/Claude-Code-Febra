// ============================================
// NEXUS — Handlers do Telegram Bot
// Todos os comandos e mensagens do MAX
// ============================================

const { maxProcess, maxCouncil } = require("../core/max");
const { getMetas, getTarefas, getReports, saveMemory } = require("../integrations/supabase");
const { getUTMifyReport, formatarRelatorio, getRelatorioVendasHoje } = require("../departments/finance/finance_agent");
const { analisarYoutube, pesquisarMercado, analisarCopy, analisarURL } = require("../departments/research/research_agent");
const { openaiFlash } = require("../integrations/openai");
require("dotenv").config();

// Sócios com acesso total (separados por vírgula no .env)
// Ex: TELEGRAM_AUTHORIZED=1515555638,987654321
const AUTHORIZED_IDS = process.env.TELEGRAM_AUTHORIZED
  ? process.env.TELEGRAM_AUTHORIZED.split(",").map(id => id.trim())
  : [process.env.TELEGRAM_CHAT_ID];

function isAuthorized(chatId) {
  if (!AUTHORIZED_IDS[0]) return true;
  return AUTHORIZED_IDS.includes(String(chatId));
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
    const url = process.env.RENDER_URL || "http://localhost:3000";
    bot.sendMessage(msg.chat.id,
      `${process.env.BRAND_NAME ? '*' + process.env.BRAND_NAME + ' — ONLINE*' : '*NEXUS MAX — ONLINE*'}\n\n` +
      `Sou o *MAX*, seu COO digital. Powered by OpenAI GPT-4o Mini + Gamma.\n\n` +
      `*📦 Produção:*\n` +
      `/criar — Gerar ebook/workbook/checklist via bot\n` +
      `/criar-web — Abrir painel completo (recomendado)\n` +
      `/roteiro — Roteiro Reels/TikTok\n\n` +
      `*📊 Inteligência:*\n` +
      `/financeiro — Métricas em tempo real\n` +
      `/conselho [decisão] — Convocar os Titãs\n` +
      `/mentor [contexto] — Análise DISC\n` +
      `/pesquisa [tema] — Pesquisa de mercado\n` +
      `/copy [texto] — Analisar copy/VSL\n` +
      `/url [link] — Analisar landing page\n` +
      `/yt [url] — Analisar YouTube\n\n` +
      `*⚙️ Gestão:*\n` +
      `/metas — Caderno Preto\n` +
      `/tarefas — Pendências\n` +
      `/report — Stark Report\n` +
      `/produtos — Meus produtos\n` +
      `/claude [pergunta] — Consultar Claude\n` +
      `/status — Status do sistema\n\n` +
      `Ou me dê uma ordem direta.`,
      { parse_mode: "Markdown" }
    );
  });

  bot.onText(/\/criar-web/, (msg) => {
    if (!isAuthorized(msg.chat.id)) return deny(bot, msg.chat.id);
    const url = process.env.RENDER_URL || "http://localhost:3000";
    bot.sendMessage(msg.chat.id,
      `*NEXUS FORGE — PAINEL COMPLETO*\n\n` +
      `Acesse o estúdio completo para criar entregáveis com:\n` +
      `• Seletor de temas visuais\n` +
      `• Upload de imagem de capa\n` +
      `• Preview em tempo real\n` +
      `• Download PDF + Word\n\n` +
      `👉 ${url}/criar`,
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

  bot.onText(/\/financeiro/, async (msg) => {
    if (!isAuthorized(msg.chat.id)) return deny(bot, msg.chat.id);
    bot.sendChatAction(msg.chat.id, "typing");
    try {
      // Métricas UTMify (cache Supabase)
      const rows = await getUTMifyReport();
      const textoUTM = formatarRelatorio(rows ? [rows] : null);

      // Vendas do dia via GG Checkout
      const { totalReceita, totalConversoes } = await getRelatorioVendasHoje();
      const textoGG = totalConversoes > 0
        ? `\n*VENDAS HOJE (GG Checkout)*\nVendas confirmadas: ${totalConversoes}\nReceita: R$ ${totalReceita.toFixed(2)}`
        : "";

      bot.sendMessage(msg.chat.id, textoUTM + textoGG, { parse_mode: "Markdown" });
    } catch (e) { bot.sendMessage(msg.chat.id, `Erro ao buscar financeiro: ${e.message}`); }
  });

  bot.onText(/\/conselho(.*)/, async (msg, match) => {
    if (!isAuthorized(msg.chat.id)) return deny(bot, msg.chat.id);
    const tema = (match[1] || "").trim();
    if (!tema) {
      return bot.sendMessage(msg.chat.id,
        `*CONSELHO DE TITÃS*\n\nMe diga qual decisão ou questão quer levar ao conselho.\n\nEx: \`/conselho Devo escalar o orçamento do BIDCAP esta semana?\``,
        { parse_mode: "Markdown" }
      );
    }
    bot.sendMessage(msg.chat.id, `Convocando o Conselho de Titãs...`, { parse_mode: "Markdown" });
    try {
      const resultado = await maxCouncil(tema);
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

  bot.onText(/\/mentor (.+)/, async (msg, match) => {
    if (!isAuthorized(msg.chat.id)) return deny(bot, msg.chat.id);
    bot.sendMessage(msg.chat.id, `Analisando perfil comportamental...`);
    try {
      const resultado = await openaiFlash(`Você é um especialista em psicologia comportamental e perfil DISC.\nAnalise: ${match[1]}\n\n1. Perfil DISC do público\n2. Gatilhos emocionais\n3. Tom de comunicação\n4. Objeções e como quebrar`);
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

  // /criar [tipo] "titulo" [tema]
  // Ex: /criar ebook "Fundamentos do Jiu-Jitsu" impacto
  bot.onText(/\/criar(.*)/, async (msg, match) => {
    if (!isAuthorized(msg.chat.id)) return deny(bot, msg.chat.id);
    const args = (match[1] || "").trim();

    if (!args) {
      return bot.sendMessage(msg.chat.id,
        `*GERADOR DE ENTREGÁVEIS*\n\n` +
        `Uso: \`/criar [tipo] "título" [tema]\`\n\n` +
        `*Tipos:*\nebook, checklist, workbook, planner, script_vsl, cheat_sheet, certificado\n\n` +
        `*Temas:*\nimpacto, elegancia, sabedoria, produtividade, bemestar, criatividade\n\n` +
        `*Exemplos:*\n` +
        `/criar ebook "10 Fundamentos do Jiu-Jitsu" impacto\n` +
        `/criar checklist "Rotina Matinal Bíblica" sabedoria\n` +
        `/criar workbook "Ballet para Iniciantes" elegancia\n\n` +
        `Ou acesse: ${process.env.RENDER_URL || "http://localhost:3000"}/criar`,
        { parse_mode: "Markdown" }
      );
    }

    // Extrai tipo, título entre aspas, e tema
    const tipoMatch = args.match(/^(\w+)/);
    const tituloMatch = args.match(/"([^"]+)"/);
    const temaMatch = args.match(/"[^"]+"\s+(\w+)/) || args.match(/(\w+)\s*$/);

    if (!tituloMatch) {
      return bot.sendMessage(msg.chat.id, `⚠ Coloque o título entre aspas.\nEx: /criar ebook *"Título do Entregável"* impacto`, { parse_mode: "Markdown" });
    }

    const tipo = tipoMatch ? tipoMatch[1] : "ebook";
    const titulo = tituloMatch[1];
    const temaKey = (temaMatch && temaMatch[1] !== tipo) ? temaMatch[1] : "impacto";

    // ── Barra de progresso em tempo real ──
    function barraProgresso(pct) {
      const cheio = Math.round(pct / 10);
      return "█".repeat(cheio) + "░".repeat(10 - cheio);
    }
    function textoProgresso(pct, etapa) {
      return `⚙️ *Gerando "${titulo}"*\n\`[${barraProgresso(pct)}] ${pct}%\`\n_${etapa}_`;
    }

    const progressMsg = await bot.sendMessage(
      msg.chat.id,
      textoProgresso(0, "Iniciando..."),
      { parse_mode: "Markdown" }
    );
    const editProgress = async (pct, etapa) => {
      try {
        await bot.editMessageText(textoProgresso(pct, etapa), {
          chat_id: msg.chat.id, message_id: progressMsg.message_id, parse_mode: "Markdown",
        });
      } catch (_) {}
    };

    // Mantém o indicador "enviando arquivo" ativo a cada 4s
    const actionInterval = setInterval(() => {
      bot.sendChatAction(msg.chat.id, "upload_document").catch(() => {});
    }, 4000);

    try {
      const { generate: gerarEntregavel } = require("../departments/creative/deliverable_generator");
      const { revisarEntregavel, formatarReview } = require("../departments/creative/design_reviewer");

      const resultado = await gerarEntregavel({
        tipo, titulo, temaKey, paginas: 10, descricao: titulo, formato: "pdf",
        onProgress: editProgress,
      });

      clearInterval(actionInterval);
      await bot.deleteMessage(msg.chat.id, progressMsg.message_id).catch(() => {});

      await bot.sendDocument(
        msg.chat.id,
        resultado.pdf,
        {
          caption: `✅ *${titulo}*\nTema: ${temaKey} | Seções: ${resultado.conteudo?.secoes?.length || "?"}`,
          parse_mode: "Markdown",
        },
        { filename: resultado.pdfFilename, contentType: "application/pdf" }
      );

      revisarEntregavel(tipo, titulo, resultado.conteudo, resultado.coverImageBuffer).then(review => {
        bot.sendMessage(msg.chat.id, formatarReview(review, titulo), { parse_mode: "Markdown" });
      }).catch(() => {});
    } catch (e) {
      clearInterval(actionInterval);
      await bot.editMessageText(`❌ Erro ao gerar "${titulo}":\n${e.message}`, {
        chat_id: msg.chat.id, message_id: progressMsg.message_id,
      }).catch(() => bot.sendMessage(msg.chat.id, `❌ Erro: ${e.message}`));
    }
  });

  // /criar com FOTO — envia foto com legenda: /criar ebook "Título" tema
  // A imagem vira o wallpaper da capa + cores extraídas automaticamente

  // /roteiro [produto_id] ou /roteiro [nome] | [nicho] | [modo] | [plataforma] | [duracao]
  bot.onText(/\/roteiro(.*)/, async (msg, match) => {
    if (!isAuthorized(msg.chat.id)) return deny(bot, msg.chat.id);
    const args = (match[1] || "").trim();
    const { supabase } = require("../integrations/supabase");

    if (!args) {
      return bot.sendMessage(msg.chat.id,
        `*GERADOR DE ROTEIRO*\n\n` +
        `*Opção 1 — por ID salvo:*\n\`/roteiro [produto_id]\`\n` +
        `Use /produtos para ver seus produtos salvos.\n\n` +
        `*Opção 2 — inline:*\n\`/roteiro [nome] | [nicho] | [modo] | [plataforma] | [duracao]\`\n\n` +
        `*Modos:* venda, engajamento, autoridade, vsl\n` +
        `*Plataformas:* reels, tiktok, shorts\n` +
        `*Duração:* ultra_curto, curto, medio, vsl\n\n` +
        `*Exemplo:*\n` +
        `/roteiro Meditação em 7 Dias | bem-estar | venda | reels | curto`,
        { parse_mode: "Markdown" }
      );
    }

    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    let produto, modo, plataforma, duracao;

    if (UUID_RE.test(args)) {
      // — busca produto pelo ID salvo no Supabase
      const { data, error } = await supabase.from("produtos").select("*").eq("id", args).single();
      if (error || !data) {
        return bot.sendMessage(msg.chat.id, `❌ Produto \`${args}\` não encontrado.`, { parse_mode: "Markdown" });
      }
      produto    = data;
      modo       = "venda";
      plataforma = "reels";
      duracao    = "curto";
    } else {
      // — inline: nome | nicho | modo | plataforma | duracao
      const partes = args.split("|").map(p => p.trim());
      const nome   = partes[0] || "Produto";
      const nicho  = partes[1] || "desenvolvimento pessoal";
      modo         = partes[2] || "venda";
      plataforma   = partes[3] || "reels";
      duracao      = partes[4] || "curto";
      produto      = { nome, nicho, tipo: "entregavel digital", publico_alvo: nicho, beneficio_principal: nicho, preco: "link na bio" };
    }

    const nomeProduto = produto.nome || "Produto";
    const barraFn = (pct) => "█".repeat(Math.round(pct / 10)) + "░".repeat(10 - Math.round(pct / 10));
    const progressMsg = await bot.sendMessage(msg.chat.id,
      `⚙️ *Gerando roteiro para "${nomeProduto}"*\n\`[${barraFn(0)}] 0%\`\n_Iniciando..._`,
      { parse_mode: "Markdown" }
    );
    const editProgress = async (pct, etapa) => {
      try {
        await bot.editMessageText(
          `⚙️ *Gerando roteiro para "${nomeProduto}"*\n\`[${barraFn(pct)}] ${pct}%\`\n_${etapa}_`,
          { chat_id: msg.chat.id, message_id: progressMsg.message_id, parse_mode: "Markdown" }
        );
      } catch (_) {}
    };

    try {
      const { run: runRoteirista } = require("../agents/roteirista");
      const { run: runEditor }     = require("../agents/editor");

      await editProgress(20, "Criando roteiro...");
      const roteiro = await runRoteirista({ produto, modo, plataforma, duracao });

      await editProgress(70, "Gerando instruções de edição...");
      const edicao = await runEditor({ roteiro, plataforma });

      await bot.deleteMessage(msg.chat.id, progressMsg.message_id).catch(() => {});

      const blocos = (roteiro.blocos || []).map(b =>
        `*[${b.id}] ${b.nome}* (${b.tempo})\n${b.fala || "_sem fala_"}`
      ).join("\n\n");

      const texto =
        `✅ *ROTEIRO — ${roteiro.titulo || nomeProduto}*\n\n` +
        `📱 ${(roteiro.plataforma || plataforma).toUpperCase()} | ${roteiro.formato || ""} | ${roteiro.duracao_estimada || ""}\n` +
        `🎯 Modo: ${modo} | Framework: ${roteiro.framework || ""}\n\n` +
        `${blocos}\n\n` +
        `*Palavra-gatilho:* ${roteiro.palavra_gatilho ? `"${roteiro.palavra_gatilho}"` : "N/A"}\n\n` +
        `*Edição — Prioridades:*\n${(edicao.prioridades || []).map((p, i) => `${i + 1}. ${p}`).join("\n")}`;

      await bot.sendMessage(msg.chat.id, texto.slice(0, 4096), { parse_mode: "Markdown" });

      if (roteiro.legenda) {
        await bot.sendMessage(msg.chat.id, `📝 *LEGENDA PRONTA:*\n\n${roteiro.legenda}`.slice(0, 4096), { parse_mode: "Markdown" });
      }
    } catch (e) {
      await bot.editMessageText(`❌ Erro ao gerar roteiro:\n${e.message}`, {
        chat_id: msg.chat.id, message_id: progressMsg.message_id,
      }).catch(() => bot.sendMessage(msg.chat.id, `❌ Erro: ${e.message}`));
    }
  });

  // /produtos — lista produtos salvos do usuário
  bot.onText(/\/produtos/, async (msg) => {
    if (!isAuthorized(msg.chat.id)) return deny(bot, msg.chat.id);
    const { supabase } = require("../integrations/supabase");
    const telegramId = String(msg.chat.id);

    const { data, error } = await supabase
      .from("produtos")
      .select("id, nome, nicho, preco, created_at")
      .eq("telegram_id", telegramId)
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) return bot.sendMessage(msg.chat.id, `❌ Erro ao buscar produtos: ${error.message}`);
    if (!data || data.length === 0) {
      return bot.sendMessage(msg.chat.id,
        `📦 *Nenhum produto salvo ainda.*\n\nUse o painel web para cadastrar produtos.`,
        { parse_mode: "Markdown" }
      );
    }

    const lista = data.map((p, i) => {
      const data_br = new Date(p.created_at).toLocaleDateString("pt-BR");
      return `*${i + 1}. ${p.nome}*\n` +
             `   Nicho: ${p.nicho || "–"} | Preço: ${p.preco || "–"}\n` +
             `   ID: \`${p.id}\`\n` +
             `   📅 ${data_br}`;
    }).join("\n\n");

    await bot.sendMessage(msg.chat.id,
      `📦 *SEUS PRODUTOS* (${data.length})\n\n${lista}\n\n` +
      `Para gerar roteiro: /roteiro [ID]`,
      { parse_mode: "Markdown" }
    );
  });

  bot.onText(/\/status/, async (msg) => {
    if (!isAuthorized(msg.chat.id)) return deny(bot, msg.chat.id);
    const uptime = process.uptime();
    const h = Math.floor(uptime / 3600);
    const m = Math.floor((uptime % 3600) / 60);
    const gammaKey = process.env.GAMMA_API_KEY ? "✅ Configurada" : "❌ Não configurada";
    const openaiKey = process.env.OPENAI_API_KEY ? "✅ Configurada" : "❌ Não configurada";
    bot.sendMessage(msg.chat.id,
      `*NEXUS — STATUS DO SISTEMA*\n\n` +
      `🟢 MAX: Online\n` +
      `🤖 OpenAI GPT-4o Mini: Ativo\n` +
      `✦ Gamma API: ${gammaKey}\n` +
      `🗄 Supabase: Conectado\n` +
      `📱 Telegram: Online\n\n` +
      `⏱ Uptime: ${h}h ${m}m\n` +
      `🌐 Painel: ${process.env.RENDER_URL || "localhost:3000"}/criar`,
      { parse_mode: "Markdown" }
    );
  });

  // Mensagens livres
  bot.on("message", async (msg) => {
    if (!isAuthorized(msg.chat.id)) return deny(bot, msg.chat.id);
    if (msg.text && msg.text.startsWith("/")) return;

    // Imagem/print
    if (msg.photo) {
      const caption = (msg.caption || "").trim();

      // Prioridade: /criar com imagem → gera entregável com wallpaper
      if (caption.match(/^\/criar/i)) {
        const match = caption.match(/\/criar\s+(\w+)\s+"([^"]+)"\s*(\w+)?/i);
        if (!match) {
          bot.sendMessage(msg.chat.id,
            `📸 *Envie a foto com legenda no formato:*\n\`/criar ebook "Título" tema\`\n\nEx: \`/criar ebook "Guia de Ballet" elegancia\``,
            { parse_mode: "Markdown" }
          );
          return;
        }
        const [, tipo, titulo, temaKey = "impacto"] = match;

        function barraFoto(pct) { return "█".repeat(Math.round(pct/10)) + "░".repeat(10-Math.round(pct/10)); }
        const pMsgFoto = await bot.sendMessage(msg.chat.id,
          `⚙️ *Gerando "${titulo}"*\n\`[${barraFoto(5)}] 5%\`\n_Processando imagem..._`,
          { parse_mode: "Markdown" });
        const editFoto = async (pct, etapa) => {
          try { await bot.editMessageText(`⚙️ *Gerando "${titulo}"*\n\`[${barraFoto(pct)}] ${pct}%\`\n_${etapa}_`,
            { chat_id: msg.chat.id, message_id: pMsgFoto.message_id, parse_mode: "Markdown" }); } catch(_) {}
        };
        const fotoInterval = setInterval(() => bot.sendChatAction(msg.chat.id, "upload_document").catch(()=>{}), 4000);

        try {
          const { generate: gerarEntregavel } = require("../departments/creative/deliverable_generator");
          const { revisarEntregavel, formatarReview } = require("../departments/creative/design_reviewer");
          const fileUrl = await bot.getFileLink(msg.photo[msg.photo.length - 1].file_id);
          const imageBuffer = await downloadFile(fileUrl);

          const resultado = await gerarEntregavel({
            tipo, titulo, temaKey, paginas: 10, descricao: titulo,
            formato: "pdf", capaImagem: imageBuffer, extrairCores: true,
            onProgress: editFoto,
          });

          clearInterval(fotoInterval);
          await bot.deleteMessage(msg.chat.id, pMsgFoto.message_id).catch(() => {});

          await bot.sendDocument(
            msg.chat.id,
            resultado.pdf,
            { caption: `✅ *${titulo}*\nTema: ${temaKey} + cores da imagem`, parse_mode: "Markdown" },
            { filename: resultado.pdfFilename, contentType: "application/pdf" }
          );

          revisarEntregavel(tipo, titulo, resultado.conteudo, resultado.coverImageBuffer).then(review => {
            bot.sendMessage(msg.chat.id, formatarReview(review, titulo), { parse_mode: "Markdown" });
          }).catch(() => {});
        } catch (e) {
          clearInterval(fotoInterval);
          await bot.editMessageText(`❌ Erro ao gerar "${titulo}":\n${e.message}`, {
            chat_id: msg.chat.id, message_id: pMsgFoto.message_id,
          }).catch(() => bot.sendMessage(msg.chat.id, `❌ Erro: ${e.message}`));
        }
        return;
      }

      // Análise genérica de imagem via OpenAI
      try {
        bot.sendChatAction(msg.chat.id, "typing");
        const prompt = caption || "Analise esta imagem. Se for print de negócio, dê insights acionáveis.";
        const resposta = await openaiFlash(`Você é MAX, COO da Nexus Digital Holding. ${prompt}\n[Nota: imagem recebida via Telegram — descreva o que foi solicitado com base no contexto da legenda]`);
        bot.sendMessage(msg.chat.id, resposta, { parse_mode: "Markdown" });
      } catch (e) { bot.sendMessage(msg.chat.id, `Erro ao analisar imagem: ${e.message}`); }
      return;
    }

    // Áudio/voz
    if (msg.voice || msg.audio) {
      try {
        bot.sendChatAction(msg.chat.id, "typing");
        const resposta = await openaiFlash(`Você é MAX, COO da Nexus. [Nota: áudio recebido via Telegram — processamento de áudio indisponível nesta integração. Informe ao fundador e sugira enviar o conteúdo por escrito.]\nResponda em português.`);
        bot.sendMessage(msg.chat.id, resposta, { parse_mode: "Markdown" });
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
