// ============================================
// NEXUS — Servidor Principal
// Bot Telegram (webhook mode) + GG Checkout
// ============================================

require("dotenv").config();
const express     = require("express");
const compression = require("compression");
const app = express();

app.use(compression());
app.use(express.json({ limit: "8mb", verify: (req, _, buf) => { req.rawBody = buf; } }));

// ──────────────────────────────────────────
// Bot do Telegram em modo webhook
// ──────────────────────────────────────────
const TelegramBot = require("node-telegram-bot-api");
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);

// Registra webhook no Telegram quando o servidor inicia
async function registerWebhook() {
  const url = process.env.RENDER_URL;
  if (!url) {
    // Sem URL pública: usa polling (desenvolvimento local)
    console.log("[Bot] Modo local: polling ativado");
    bot.startPolling();
    return;
  }
  const webhookUrl = `${url}/telegram`;
  await bot.setWebHook(webhookUrl);
  console.log(`[Bot] Webhook registrado: ${webhookUrl}`);
}

// Recebe updates do Telegram
app.post("/telegram", (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// Carrega os handlers do bot
require("./telegram/handlers")(bot);

// ──────────────────────────────────────────
// Webhook GG Checkout
// ──────────────────────────────────────────
const ggCheckout = require("./departments/finance/webhook_ggcheckout");
app.use("/webhook", ggCheckout);

// ──────────────────────────────────────────
// Gerador de Entregáveis (web + API com progresso SSE)
// ──────────────────────────────────────────
const path = require("path");
app.use(express.static(path.join(__dirname, "public"), { maxAge: "1h" }));
app.use("/fonts", express.static(path.join(__dirname, "assets/fonts"), { maxAge: "7d" }));

app.get("/criar", (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.sendFile(path.join(__dirname, "public", "criar.html"));
});

app.get("/kit-builder", (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.sendFile(path.join(__dirname, "public", "kit-builder.html"));
});

// Jobs em memória: jobId → { status, progress, message, result, error }
const criarJobs = new Map();
function limparJobsAntigos() {
  const limite = Date.now() - 30 * 60 * 1000; // 30 min (pdf fica disponível para fetch)
  for (const [id, job] of criarJobs.entries()) {
    if (job.criadoEm < limite) criarJobs.delete(id);
  }
}

// GET /api/produtos → lista produtos salvos (recentes primeiro)
app.get("/api/produtos", async (req, res) => {
  try {
    const { createClient } = require("@supabase/supabase-js");
    const _supa = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
    const { data, error } = await _supa
      .from("produtos")
      .select("id, nome, nicho, publico_alvo, preco, created_at")
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ produtos: data || [] });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/produto → salva produto + lançamento no Supabase
app.post("/api/produto", async (req, res) => {
  try {
    const { createClient } = require("@supabase/supabase-js");
    const _supa = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
    const { nome, nicho, publico_alvo, preco, relatorio, telegram_id } = req.body;
    if (!nome) return res.status(400).json({ error: "nome obrigatório" });

    const { data: produto, error: errP } = await _supa
      .from("produtos")
      .insert({ nome, nicho: nicho || null, publico_alvo: publico_alvo || null, preco: preco || null, telegram_id: telegram_id || "web" })
      .select()
      .single();
    if (errP) return res.status(500).json({ error: errP.message });

    let lancamento = null;
    if (relatorio) {
      const { data: lanc, error: errL } = await _supa
        .from("lancamentos")
        .insert({ produto_id: produto.id, telegram_id: telegram_id || "web", nome, relatorio_texto: relatorio.slice(0, 50000) })
        .select()
        .single();
      if (!errL) lancamento = lanc;
    }

    res.json({ produto, lancamento });
  } catch (e) {
    console.error("[/api/produto]", e.message);
    res.status(500).json({ error: e.message });
  }
});

// POST /api/wizard → gera campos do formulário via IA (3 perguntas → form preenchido)
app.post("/api/wizard", async (req, res) => {
  try {
    const { nicho, avatar, beneficio, tipo } = req.body;
    if (!nicho) return res.status(400).json({ error: "nicho obrigatório" });
    const { openaiJson } = require("./integrations/openai");
    const SYSTEM = `Você é especialista em criação de infoprodutos brasileiros de baixo ticket (R$17–R$97).
Gere campos otimizados para formulário de criação de produto digital. APENAS JSON:
{
  "titulo": "headline poderosa máx 10 palavras, sem ponto final — ex: 7 Segredos do Emagrecimento sem Sofrimento",
  "subtitulo": "complemento do título máx 15 palavras — reforça benefício principal",
  "nicho_refinado": "nicho específico com público e dor, máx 60 chars",
  "num_paginas": 15,
  "num_capitulos": 7,
  "tipo_sugerido": "ebook|workbook|checklist|planner|script_vsl|cheat_sheet|pregacoes"
}
IMPORTANTE: num_paginas deve ser entre 10 e 15 (máx 20). num_capitulos entre 5 e 8 (máx 10).`;
    const prompt = `Nicho: ${nicho}\nAvatar: ${avatar || "não informado"}\nBenefício principal: ${beneficio || "não informado"}\nTipo preferido: ${tipo || "automático"}`;
    const resultado = JSON.parse(await openaiJson(prompt, SYSTEM));
    res.json(resultado);
  } catch (e) {
    console.error("[/api/wizard]", e.message);
    res.status(500).json({ error: e.message });
  }
});

// POST /api/criar → inicia job, retorna jobId imediatamente
app.post("/api/criar", (req, res) => {
  limparJobsAntigos();
  const jobId = Math.random().toString(36).slice(2, 10);
  criarJobs.set(jobId, { status: "running", progress: 0, message: "Iniciando...", criadoEm: Date.now() });
  res.json({ jobId });

  // Killer de segurança: 15 minutos para ebooks/infoprodutos (30+ seções + Gamma polling podem somar >5 min)
  const tipoBody = req.body.tipo || "ebook";
  const INFOPRODUTOS = new Set(["ebook", "workbook", "script_vsl", "planner", "cheat_sheet", "certificado", "checklist", "pregacoes", "devocional", "atividade_desplugada", "plano_de_aula", "kit_dinamicas", "caderno_colorir"]);
  const jobTimeoutMs = INFOPRODUTOS.has(tipoBody) ? 15 * 60 * 1000 : 5 * 60 * 1000;
  const jobKiller = setTimeout(() => {
    const job = criarJobs.get(jobId);
    if (job && job.status === "running") {
      criarJobs.set(jobId, { status: "error", message: `Timeout: geração demorou mais de ${jobTimeoutMs / 60000} minutos.`, criadoEm: Date.now() });
      console.error(`[/api/criar] Job ${jobId} encerrado por timeout (${jobTimeoutMs / 1000}s)`);
    }
  }, jobTimeoutMs);

  const { createClient } = require("@supabase/supabase-js");
  const _supa = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

  const telegramId = req.body.telegram_id || "web";
  Promise.resolve()
    .then(() => {
      const { generate } = require("./departments/creative/deliverable_generator");
      return _supa.from("expert_dna").select("*").eq("telegram_id", telegramId).single()
        .then(({ data: dna }) => {
          const body = { ...req.body };
          if (dna) {
            body.autor  = body.autor  || dna.marca;
            body.nicho  = body.nicho  || dna.nicho;
            body.avatar_publico = body.avatar_publico || dna.avatar_publico;
          }
          return generate({
            ...body,
            onProgress: async (pct, msg) => {
              const job = criarJobs.get(jobId);
              if (job) { job.progress = pct; job.message = msg; }
            },
          });
        });
    })
    .then(resultado => {
      clearTimeout(jobKiller);
      criarJobs.set(jobId, {
        status: "done", progress: 100, message: "Pronto!", criadoEm: Date.now(),
        titulo: resultado.titulo,
        pdf: resultado.pdf ? resultado.pdf.toString("base64") : null,
        pdfFilename: resultado.pdfFilename,
        docx: resultado.docx ? resultado.docx.toString("base64") : null,
        docxFilename: resultado.docxFilename,
        gammaUrl: resultado.gammaUrl || null,
        gammaSource: resultado.gammaSource || false,
        gammaError: resultado.gammaError || null,
        copyContracapa: resultado.copyContracapa || "",
      });
    })
    .catch(e => {
      clearTimeout(jobKiller);
      console.error("[/api/criar]", e.message);
      criarJobs.set(jobId, { status: "error", message: e.message, criadoEm: Date.now() });
    });
});

// GET /api/criar/progress/:jobId → SSE stream de progresso em tempo real
app.get("/api/criar/progress/:jobId", (req, res) => {
  const { jobId } = req.params;
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const enviar = (data) => res.write(`data: ${JSON.stringify(data)}\n\n`);

  const tick = setInterval(() => {
    const job = criarJobs.get(jobId);
    if (!job) { enviar({ error: "Job não encontrado" }); clearInterval(tick); res.end(); return; }

    enviar({ progress: job.progress, message: job.message, status: job.status });

    if (job.status === "done") {
      // Envia só o sinal leve — payload pesado (pdf/docx base64) fica no job para fetch separado
      enviar({ done: true, titulo: job.titulo });
      clearInterval(tick);
      res.end();
      // NÃO deleta o job aqui — frontend busca via GET /api/criar/result/:jobId
    } else if (job.status === "error") {
      enviar({ error: job.message });
      clearInterval(tick);
      criarJobs.delete(jobId);
      res.end();
    }
  }, 600);

  req.on("close", () => clearInterval(tick));
});

// GET /api/criar/result/:jobId → retorna payload completo (pdf, docx, gammaUrl) após conclusão
app.get("/api/criar/result/:jobId", (req, res) => {
  const job = criarJobs.get(req.params.jobId);
  if (!job) return res.status(404).json({ error: "Resultado não encontrado ou expirado" });
  if (job.status !== "done") return res.status(202).json({ status: job.status, progress: job.progress, message: job.message || '' });
  const result = {
    titulo: job.titulo,
    pdf: job.pdf,
    pdfFilename: job.pdfFilename,
    docx: job.docx,
    docxFilename: job.docxFilename,
    gammaUrl: job.gammaUrl,
    gammaSource: job.gammaSource,
    gammaError: job.gammaError || null,
    copyContracapa: job.copyContracapa || "",
  };
  criarJobs.delete(req.params.jobId);
  res.json(result);
});

// ──────────────────────────────────────────
// Gerador de Carrosseis (SSE igual ao /api/criar)
// ──────────────────────────────────────────
const carouselJobs = new Map();
function limparCarouselJobs() {
  const limite = Date.now() - 10 * 60 * 1000;
  for (const [id, job] of carouselJobs.entries()) {
    if (job.criadoEm < limite) carouselJobs.delete(id);
  }
}

// POST /api/carousel → inicia job, retorna jobId
app.post("/api/carousel", (req, res) => {
  limparCarouselJobs();
  const jobId = Math.random().toString(36).slice(2, 10);
  carouselJobs.set(jobId, { status: "running", progress: 0, message: "Iniciando carrossel...", criadoEm: Date.now() });
  res.json({ jobId });

  const jobKiller = setTimeout(() => {
    const job = carouselJobs.get(jobId);
    if (job && job.status === "running") {
      carouselJobs.set(jobId, { status: "error", message: "Timeout: carrossel demorou mais de 3 minutos.", criadoEm: Date.now() });
    }
  }, 3 * 60 * 1000);

  const { gerarCarrossel } = require("./departments/creative/carousel_generator");
  const { gerarConteudoRico } = require("./departments/creative/content_specialist");

  (async () => {
    try {
      const setJob = (p, m) => { const j = carouselJobs.get(jobId); if (j) { j.progress = p; j.message = m; } };

      setJob(10, "Gerando conteúdo com Gemini Pro...");
      const conteudo = await gerarConteudoRico({
        tipo:       req.body.tipo       || "ebook",
        titulo:     req.body.titulo     || "Entregável",
        descricao:  req.body.descricao  || req.body.titulo,
        temaKey:    req.body.temaKey    || "produtividade",
        paginas:    parseInt(req.body.paginas) || 10,
        avatar:     req.body.avatar     || "",
        numCapitulos: req.body.numCapitulos,
      });

      setJob(60, "Renderizando slides...");
      const resultado = await gerarCarrossel({
        titulo:       req.body.titulo       || "Entregável",
        subtitulo:    req.body.subtitulo    || "",
        autor:        req.body.autor        || "Nexus Digital",
        temaKey:      req.body.temaKey      || "produtividade",
        formato:      req.body.formato      || "instagram_feed",
        maxSlides:    parseInt(req.body.maxSlides) || 6,
        fonteTitulo:  req.body.fonteTitulo  || "Anton",
        fonteCorpo:   req.body.fonteCorpo   || "Poppins",
      }, conteudo);

      clearTimeout(jobKiller);
      carouselJobs.set(jobId, {
        status: "done", progress: 100, message: "Carrossel pronto!", criadoEm: Date.now(),
        slides: resultado.buffers.map(b => b.toString("base64")),
        count:  resultado.count,
        formato: resultado.formato,
        titulo: req.body.titulo || "carrossel",
      });
    } catch (e) {
      clearTimeout(jobKiller);
      console.error("[/api/carousel]", e.message);
      carouselJobs.set(jobId, { status: "error", message: e.message, criadoEm: Date.now() });
    }
  })();
});

// GET /api/carousel/progress/:jobId → SSE stream
app.get("/api/carousel/progress/:jobId", (req, res) => {
  const { jobId } = req.params;
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const enviar = (data) => res.write(`data: ${JSON.stringify(data)}\n\n`);

  const tick = setInterval(() => {
    const job = carouselJobs.get(jobId);
    if (!job) { enviar({ error: "Job não encontrado" }); clearInterval(tick); res.end(); return; }

    enviar({ progress: job.progress, message: job.message, status: job.status });

    if (job.status === "done") {
      enviar({ done: true, slides: job.slides, count: job.count, formato: job.formato, titulo: job.titulo });
      clearInterval(tick);
      carouselJobs.delete(jobId);
      res.end();
    } else if (job.status === "error") {
      enviar({ error: job.message });
      clearInterval(tick);
      carouselJobs.delete(jobId);
      res.end();
    }
  }, 600);

  req.on("close", () => clearInterval(tick));
});

// ──────────────────────────────────────────
// Gerador de Roteiros + Edição (SSE)
// ──────────────────────────────────────────
const roteiroJobs = new Map();
function limparRoteiroJobs() {
  const limite = Date.now() - 10 * 60 * 1000;
  for (const [id, job] of roteiroJobs.entries()) {
    if (job.criadoEm < limite) roteiroJobs.delete(id);
  }
}

app.post("/api/roteiro", (req, res) => {
  limparRoteiroJobs();
  const jobId = Math.random().toString(36).slice(2, 10);
  roteiroJobs.set(jobId, { status: "running", progress: 0, message: "Iniciando...", criadoEm: Date.now() });
  res.json({ jobId });

  const jobKiller = setTimeout(() => {
    const job = roteiroJobs.get(jobId);
    if (job && job.status === "running") {
      roteiroJobs.set(jobId, { status: "error", message: "Timeout: roteiro demorou mais de 3 minutos.", criadoEm: Date.now() });
    }
  }, 3 * 60 * 1000);

  const { run: runRoteirista } = require("./agents/roteirista");
  const { run: runEditor } = require("./agents/editor");
  const { createClient } = require("@supabase/supabase-js");
  const _supR = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

  (async () => {
    try {
      const setJob = (p, m) => { const j = roteiroJobs.get(jobId); if (j) { j.progress = p; j.message = m; } };

      let produto = req.body.produto;
      if (!produto && req.body.produto_id) {
        setJob(5, "Buscando produto...");
        const { data } = await _supR.from("produtos").select("*").eq("id", req.body.produto_id).single();
        produto = data;
      }
      if (!produto) throw new Error("Produto não informado");

      let lancamento = null;
      if (req.body.lancamento_id) {
        const { data } = await _supR.from("lancamentos").select("*").eq("id", req.body.lancamento_id).single();
        lancamento = data;
      }

      setJob(20, "Criando roteiro...");
      const roteiro = await runRoteirista({
        produto,
        lancamento,
        modo: req.body.modo || "venda",
        plataforma: req.body.plataforma || "reels",
        duracao: req.body.duracao || "curto",
      });

      setJob(70, "Gerando instruções de edição...");
      const edicao = await runEditor({ roteiro, plataforma: req.body.plataforma || "reels" });

      setJob(90, "Salvando resultado...");
      await _supR.from("criativos").insert({
        tipo: "roteiro",
        produto_id: req.body.produto_id || null,
        lancamento_id: req.body.lancamento_id || null,
        telegram_id: req.body.telegram_id || null,
        plataforma: req.body.plataforma || "reels",
        modo: req.body.modo || "venda",
        roteiro,
        edicao,
      }).catch(e => console.warn("[/api/roteiro] Aviso ao salvar criativo:", e.message));

      clearTimeout(jobKiller);
      roteiroJobs.set(jobId, {
        status: "done", progress: 100, message: "Roteiro pronto!", criadoEm: Date.now(),
        roteiro,
        edicao,
      });
    } catch (e) {
      clearTimeout(jobKiller);
      console.error("[/api/roteiro]", e.message);
      roteiroJobs.set(jobId, { status: "error", message: e.message, criadoEm: Date.now() });
    }
  })();
});

app.get("/api/roteiro/progress/:jobId", (req, res) => {
  const { jobId } = req.params;
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const enviar = (data) => res.write(`data: ${JSON.stringify(data)}\n\n`);

  const tick = setInterval(() => {
    const job = roteiroJobs.get(jobId);
    if (!job) { enviar({ error: "Job não encontrado" }); clearInterval(tick); res.end(); return; }

    enviar({ progress: job.progress, message: job.message, status: job.status });

    if (job.status === "done") {
      enviar({ done: true, roteiro: job.roteiro, edicao: job.edicao });
      clearInterval(tick);
      roteiroJobs.delete(jobId);
      res.end();
    } else if (job.status === "error") {
      enviar({ error: job.message });
      clearInterval(tick);
      roteiroJobs.delete(jobId);
      res.end();
    }
  }, 600);

  req.on("close", () => clearInterval(tick));
});

// ──────────────────────────────────────────
// VSL Chat — coleta contexto e gera VSL long-form
// ──────────────────────────────────────────
app.post("/api/vsl/chat", async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "messages[] obrigatório" });
    }

    const { collectContext, generateVSL } = require("./agents/vsl");
    const result = await collectContext(messages);

    if (result.pronto && result.contexto) {
      // Contexto suficiente — gera a VSL
      const vslText = await generateVSL(result.contexto);
      return res.json({
        reply:      result.resposta || "VSL gerada com sucesso!",
        done:       true,
        vsl_text:   vslText,
        contexto:   result.contexto,
      });
    }

    // Ainda coletando — devolve próxima pergunta
    res.json({
      reply: result.resposta || result.pergunta || "Pode continuar.",
      done:  false,
    });
  } catch (e) {
    console.error("[/api/vsl/chat]", e.message);
    res.status(500).json({ error: e.message });
  }
});

// ──────────────────────────────────────────
// Forge Chat Universal — coleta contexto via chat
// ──────────────────────────────────────────
app.post("/api/forge-chat", async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0)
      return res.status(400).json({ error: "messages obrigatório" });

    const { collectContext, buildPayload } = require('./agents/forge_chat');
    const result = await collectContext(messages);

    if (result.pronto && result.contexto) {
      result.payload = buildPayload(result.contexto);
    }

    res.json(result);
  } catch (e) {
    console.error("[/api/forge-chat]", e.message);
    res.status(500).json({ error: e.message });
  }
});

// ──────────────────────────────────────────
// Gerador de Ilustrações via DALL-E 3
// ──────────────────────────────────────────
const ESTILOS_PROMPT = {
  colorir:    'black and white coloring book page, thick clean outlines, no shading, no gray, pure white background, simple and cute cartoon style, ready to print and color',
  cartoon:    'colorful cartoon illustration, vibrant colors, friendly and cute style, clean lines, white background, child-friendly',
  aquarela:   'watercolor illustration, soft pastel colors, gentle brushstrokes, white background, artistic and delicate style',
  realista:   'detailed digital illustration, professional artwork, clean white background, high quality, educational',
};

const FAIXA_PROMPT = {
  infantil_3:  'very simple shapes, extra large features, friendly animals or characters, age 3-6 children',
  infantil_7:  'moderate complexity, engaging details, age 7-12 children, educational style',
  teen:        'more detailed, modern style, age 12-16 teenagers',
  adulto:      'adult complexity, refined details, professional quality',
};

app.post("/api/gerar-imagens", async (req, res) => {
  try {
    const { tema, estilo = 'colorir', faixa = 'infantil_7', quantidade = 1, descricao = '' } = req.body;
    if (!tema) return res.status(400).json({ error: "tema obrigatório" });

    const { openaiImage } = require('./integrations/openai');
    const qtd = Math.min(Math.max(parseInt(quantidade) || 1, 1), 4);

    const estiloDesc = ESTILOS_PROMPT[estilo] || ESTILOS_PROMPT.colorir;
    const faixaDesc  = FAIXA_PROMPT[faixa]   || FAIXA_PROMPT.infantil_7;

    // Gera variações do mesmo tema para cada imagem
    const variacoes = [
      `${tema} — cena principal`,
      `${tema} — personagem em destaque`,
      `${tema} — ambiente e cenário`,
      `${tema} — ação e movimento`,
    ];

    const imagens = [];
    for (let i = 0; i < qtd; i++) {
      const variacao = variacoes[i % variacoes.length];
      const extraDesc = descricao ? `, ${descricao}` : '';
      const prompt = `${estiloDesc}, ${faixaDesc}, subject: ${variacao}${extraDesc}, single illustration, centered composition`;
      const b64 = await openaiImage(prompt, '1024x1024');
      imagens.push({ index: i + 1, variacao, b64 });
    }

    res.json({ imagens, tema, estilo, quantidade: qtd });
  } catch (e) {
    console.error("[/api/gerar-imagens]", e.message);
    res.status(500).json({ error: e.message });
  }
});

// ──────────────────────────────────────────
// Gerador de Criativo (imagem PNG para Meta Ads)
// ──────────────────────────────────────────
app.post("/api/criativo", async (req, res) => {
  try {
    const { headline, sub, cta, marca, temaKey = "impacto", formato = "instagram_feed" } = req.body;
    if (!headline) return res.status(400).json({ error: "headline obrigatória" });

    const { criarCriativoHTML, getDimensoes } = require("./departments/creative/criativo_template");
    const { renderSlide } = require("./departments/creative/render_engine");

    const htmlStr = criarCriativoHTML({ headline, sub, cta, marca, temaKey, formato });
    const [w, h]  = getDimensoes(formato);
    const buffer  = await renderSlide(htmlStr, w, h);

    res.json({
      image:    buffer.toString("base64"),
      formato,
      filename: headline.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 40) + "_criativo.png",
    });
  } catch (e) {
    console.error("[/api/criativo]", e.message);
    res.status(500).json({ error: e.message });
  }
});

// ──────────────────────────────────────────
// Gerador de Script VSL (roteiro escrito em PDF)
// ──────────────────────────────────────────
app.post("/api/script-vsl", async (req, res) => {
  try {
    const { titulo, descricao, avatar, autor, modo = "vsl", plataforma = "youtube" } = req.body;
    if (!titulo) return res.status(400).json({ error: "titulo obrigatório" });

    const { run: runRoteirista } = require("./agents/roteirista");
    const PDFDocument = require("pdfkit");

    const roteiro = await runRoteirista({
      produto: {
        nome: titulo,
        tipo: "vsl",
        nicho: descricao || titulo,
        publico_alvo: avatar || descricao || "",
        beneficio_principal: descricao || titulo,
        preco: "",
      },
      modo,
      plataforma,
      duracao: "vsl",
    });

    // Gera PDF do roteiro com PDFKit
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks = [];
    doc.on("data", c => chunks.push(c));
    await new Promise(resolve => {
      doc.on("end", resolve);

      // Capa
      doc.rect(0, 0, doc.page.width, 8).fill("#E63946");
      doc.moveDown(1);
      doc.fontSize(10).fillColor("#888888").text("ROTEIRO VSL — NEXUS FORGE", { align: "center" });
      doc.moveDown(0.5);
      doc.fontSize(26).fillColor("#111111").text(roteiro.titulo || titulo, { align: "center" });
      doc.moveDown(0.5);
      doc.fontSize(12).fillColor("#666666").text(
        `Formato: ${roteiro.formato || "VSL"}  ·  Duração estimada: ${roteiro.duracao_estimada || "3–5 min"}  ·  ${roteiro.framework || "AIDA"}`,
        { align: "center" }
      );
      doc.moveDown(0.5);
      doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).stroke("#DDDDDD");
      doc.moveDown(1.5);

      // Blocos do roteiro
      for (const bloco of (roteiro.blocos || [])) {
        if (!bloco.fala) continue;

        // Cabeçalho do bloco
        doc.rect(50, doc.y, doc.page.width - 100, 28).fill("#F5F5F5");
        doc.fontSize(11).fillColor("#E63946")
          .text(`BLOCO ${bloco.id} — ${bloco.nome}`, 58, doc.y - 22, { continued: true });
        doc.fillColor("#999999").text(`  (${bloco.tempo})`, { continued: false });
        doc.moveDown(0.8);

        // Narração
        doc.fontSize(10).fillColor("#333333").text("🎙 NARRAÇÃO:", { continued: false });
        doc.fontSize(12).fillColor("#111111").text(bloco.fala, { indent: 16, lineGap: 4 });
        doc.moveDown(0.5);

        // Tela (texto na tela)
        if (bloco.tela) {
          doc.fontSize(10).fillColor("#333333").text("📺 TELA:", { continued: false });
          doc.fontSize(11).fillColor("#555555").text(bloco.tela, { indent: 16, lineGap: 3 });
          doc.moveDown(0.5);
        }

        // Câmera
        if (bloco.camera) {
          doc.fontSize(10).fillColor("#333333").text("🎬 CÂMERA:", { continued: false });
          doc.fontSize(11).fillColor("#555555").text(bloco.camera, { indent: 16, lineGap: 3 });
          doc.moveDown(0.5);
        }

        doc.moveDown(0.5);
        doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).stroke("#EEEEEE");
        doc.moveDown(1);
      }

      // Legenda
      if (roteiro.legenda) {
        doc.addPage();
        doc.rect(0, 0, doc.page.width, 8).fill("#E63946");
        doc.moveDown(1);
        doc.fontSize(14).fillColor("#111111").text("LEGENDA / COPY DO VÍDEO", { align: "center" });
        doc.moveDown(1);
        doc.fontSize(11).fillColor("#333333").text(roteiro.legenda, { lineGap: 5 });
      }

      // Palavra gatilho
      if (roteiro.palavra_gatilho) {
        doc.moveDown(1.5);
        doc.fontSize(13).fillColor("#E63946").text(`Palavra gatilho: ${roteiro.palavra_gatilho}`);
        if (roteiro.resposta_automatica) {
          doc.moveDown(0.5);
          doc.fontSize(11).fillColor("#555555").text(`Resposta automática: ${roteiro.resposta_automatica}`);
        }
      }

      doc.end();
    });

    const pdfBuffer = Buffer.concat(chunks);
    const slug = titulo.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 40);
    res.json({
      pdf:         pdfBuffer.toString("base64"),
      pdfFilename: `${slug}_roteiro_vsl.pdf`,
      titulo:      roteiro.titulo || titulo,
      roteiro,
    });
  } catch (e) {
    console.error("[/api/script-vsl]", e.message);
    res.status(500).json({ error: e.message });
  }
});

// ──────────────────────────────────────────
// Gerador de Relatório de Pesquisa de Mercado
// ──────────────────────────────────────────
app.post("/api/relatorio", async (req, res) => {
  try {
    const { nicho, publico, nome } = req.body;
    if (!nicho) return res.status(400).json({ error: "nicho obrigatório" });
    const { openaiFlash } = require("./integrations/openai");
    const prompt = `Você é um analista de mercado de infoprodutos brasileiros.
Gere um relatório de pesquisa de mercado CONCISO (máx 400 palavras) para:
- Produto: ${nome || nicho}
- Nicho: ${nicho}
- Público-alvo: ${publico || "não informado"}

Estruture em 4 blocos (sem cabeçalhos longos, texto direto):
1. DOR PRINCIPAL: a maior frustração desse público (2-3 frases)
2. OBJEÇÕES COMUNS: as 3 principais resistências de compra
3. CONCORRENTES: o que já existe no mercado e o que falta
4. ÂNGULO DE DIFERENCIAÇÃO: como se destacar (1 ideia forte)

Linguagem direta, sem rodeios. Fale como um estrategista experiente.`;
    const relatorio = await openaiFlash(prompt);
    res.json({ relatorio: relatorio.trim() });
  } catch (e) {
    console.error("[relatorio]", e.message);
    res.status(500).json({ error: e.message });
  }
});

// ──────────────────────────────────────────
// Gamma — Diagnóstico da API Key
// ──────────────────────────────────────────
app.get("/api/test-gamma", async (req, res) => {
  try {
    const key = process.env.GAMMA_API_KEY;
    if (!key) return res.json({ ok: false, error: "GAMMA_API_KEY não configurada no servidor" });
    const r = await fetch("https://public-api.gamma.app/v1.0/themes", {
      headers: { "X-API-KEY": key, "Content-Type": "application/json" },
    });
    const body = await r.text();
    if (r.ok) {
      // A API retorna { data: [...], hasMore, nextCursor } — não um array direto
      const parsed = JSON.parse(body);
      const temas = parsed.data || parsed;
      const totalTemas = Array.isArray(temas) ? temas.length : 0;
      res.json({ ok: true, status: r.status, message: "Gamma API key válida", themes: totalTemas });
    } else {
      res.json({ ok: false, status: r.status, error: body });
    }
  } catch (e) {
    res.json({ ok: false, error: e.message });
  }
});

// ──────────────────────────────────────────
// Gamma — Lista de temas disponíveis
// ──────────────────────────────────────────
app.get("/api/gamma-themes", async (req, res) => {
  try {
    const { listarTemasFormatados } = require("./integrations/gamma");
    const temas = await listarTemasFormatados();
    // Reescreve preview_url para usar nosso proxy (evita CORS)
    const temasyProxy = temas.map(t => ({
      ...t,
      preview_url: t.id ? `/api/gamma-theme-img/${encodeURIComponent(t.id)}` : '',
    }));
    res.json(temasyProxy);
  } catch (e) {
    console.error("[/api/gamma-themes]", e.message);
    res.status(500).json({ error: e.message });
  }
});

// Proxy de imagens de preview dos temas Gamma (evita CORS do assets.gamma.app)
app.get("/api/gamma-theme-img/:themeId", async (req, res) => {
  try {
    const { themeId } = req.params;
    const url = `https://assets.gamma.app/themes/${encodeURIComponent(themeId)}/preview.png`;
    const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!r.ok) return res.status(404).end();
    const buf = await r.arrayBuffer();
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.send(Buffer.from(buf));
  } catch (e) {
    res.status(502).end();
  }
});

// ──────────────────────────────────────────
// Gamma — Geração de Apresentações
// ──────────────────────────────────────────
app.post("/api/gamma", async (req, res) => {
  try {
    const { titulo, conteudo, numSlides = 10, exportar = 'pptx', themeId } = req.body;
    if (!titulo || !conteudo) return res.status(400).json({ error: "titulo e conteudo obrigatórios" });
    const { criarApresentacao } = require("./integrations/gamma");
    const resultado = await criarApresentacao({ titulo, conteudo, numSlides, exportar, themeId });
    res.json({
      url:         resultado.gammaUrl || resultado.url,
      exportUrl:   resultado.exportUrl || resultado.export_url,
      creditsUsed: resultado.creditsUsed,
    });
  } catch (e) {
    console.error("[/api/gamma]", e.message);
    res.status(500).json({ error: e.message });
  }
});

// ──────────────────────────────────────────
// Conversor de documentos PDF ↔ DOCX
// ──────────────────────────────────────────
app.post("/api/convert", async (req, res) => {
  try {
    const { arquivo, nome, direcao } = req.body;
    if (!arquivo || !direcao) return res.status(400).json({ error: "arquivo e direcao obrigatórios" });

    const buf = Buffer.from(arquivo, "base64");
    const { criarPDFDeTexto, criarDOCXDeTexto } = require("./departments/creative/deliverable_generator");

    if (direcao === "docx2pdf") {
      const mammoth = require("mammoth");
      const result = await mammoth.convertToHtml({ buffer: buf });
      const pdfBuf = await criarPDFDeTexto(result.value, (nome || "documento").replace(/\.docx$/i, ""));
      return res.json({
        arquivo: pdfBuf.toString("base64"),
        nome: (nome || "documento").replace(/\.docx$/i, ".pdf"),
        tipo: "application/pdf",
      });
    }

    if (direcao === "pdf2docx") {
      const pdfParse = require("pdf-parse");
      const data = await pdfParse(buf);
      const docxBuf = await criarDOCXDeTexto(data.text, (nome || "documento").replace(/\.pdf$/i, ""));
      return res.json({
        arquivo: docxBuf.toString("base64"),
        nome: (nome || "documento").replace(/\.pdf$/i, ".docx"),
        tipo: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
    }

    res.status(400).json({ error: "direcao inválida — use docx2pdf ou pdf2docx" });
  } catch (e) {
    console.error("[/api/convert]", e.message);
    res.status(500).json({ error: e.message });
  }
});

// ──────────────────────────────────────────
// Webhook GitHub → salva commits no Supabase
// ──────────────────────────────────────────
const crypto = require("crypto");
const { saveMemory: saveGithubMemory } = require("./integrations/supabase");

app.post("/api/github/webhook", async (req, res) => {
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  if (secret) {
    const sig = req.headers["x-hub-signature-256"];
    if (!sig) return res.status(401).json({ error: "Assinatura ausente" });
    const expected = "sha256=" + crypto.createHmac("sha256", secret).update(req.rawBody).digest("hex");
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
      return res.status(401).json({ error: "Assinatura inválida" });
    }
  }

  const event = req.headers["x-github-event"];
  if (event !== "push") return res.json({ ok: true, ignorado: true });

  const { ref, commits = [], repository, pusher } = req.body;
  const branch = ref?.replace("refs/heads/", "") || "unknown";
  const repo = repository?.full_name || "unknown";

  for (const commit of commits) {
    const arquivos = [
      ...(commit.added || []),
      ...(commit.modified || []),
      ...(commit.removed || []),
    ];
    await saveGithubMemory("github", "commit", commit.message.split("\n")[0], {
      sha: commit.id?.slice(0, 7),
      autor: commit.author?.name || pusher?.name || "unknown",
      branch,
      repo,
      timestamp: commit.timestamp,
      arquivos_alterados: arquivos.length,
      arquivos: arquivos.slice(0, 20),
    }).catch(e => console.error("[GitHub Webhook] Erro ao salvar:", e.message));
  }

  console.log(`[GitHub Webhook] ${commits.length} commit(s) de "${branch}" salvos no Supabase`);
  res.json({ ok: true, commits: commits.length });
});

// ──────────────────────────────────────────
// Gamma — diagnóstico rápido sem geração completa
// GET /api/gamma-test → lista temas e verifica conectividade
// ──────────────────────────────────────────
app.get("/api/gamma-test", async (req, res) => {
  const apiKey = process.env.GAMMA_API_KEY;
  if (!apiKey) return res.status(500).json({ ok: false, error: "GAMMA_API_KEY não configurada" });
  try {
    const r = await fetch("https://public-api.gamma.app/v1.0/themes", {
      headers: { "X-API-KEY": apiKey, "Content-Type": "application/json" },
    });
    if (!r.ok) {
      const body = await r.text();
      return res.status(r.status).json({ ok: false, status: r.status, error: body.slice(0, 300) });
    }
    const data = await r.json();
    const temas = (data.data || []).slice(0, 5).map(t => ({ id: t.id, nome: t.name }));
    res.json({ ok: true, key_prefix: apiKey.slice(0, 8) + "…", temas_sample: temas, total_temas: (data.data || []).length });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// ──────────────────────────────────────────
// Health check
// ──────────────────────────────────────────
app.get("/", (req, res) => res.json({ status: "NEXUS online", version: "1.0.0" }));

// ──────────────────────────────────────────
// ElevenLabs — Narração de texto
// ──────────────────────────────────────────
const ELEVEN_VOICES = {
  rodrigo:      "TX3LPaxmHKxFdv7VOQHJ", // Liam — masculino (estável)
  feminino:     "21m00Tcm4TlvDq8ikWAM", // Rachel — feminino (estável)
  profissional: "JBFqnCBsd6RMkjVDRZzb", // George — profissional (estável)
};

app.post("/api/narrar", async (req, res) => {
  const { texto, voz = "rodrigo" } = req.body;
  if (!texto || !texto.trim()) return res.status(400).json({ error: "texto obrigatório" });

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "ELEVENLABS_API_KEY não configurado no servidor" });

  const voiceId = ELEVEN_VOICES[voz] || ELEVEN_VOICES.rodrigo;
  const textoLimpo = texto.replace(/[*#_`~]/g, "").trim().slice(0, 5000);

  try {
    const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        "Accept": "audio/mpeg",
      },
      body: JSON.stringify({
        text: textoLimpo,
        model_id: "eleven_multilingual_v2",
        voice_settings: { stability: 0.45, similarity_boost: 0.80, style: 0.2, use_speaker_boost: true },
      }),
    });

    if (!r.ok) {
      const err = await r.json().catch(() => ({}));
      console.error("[/api/narrar] ElevenLabs error:", err);
      return res.status(r.status).json({ error: err?.detail?.message || "Erro na ElevenLabs" });
    }

    const buffer = Buffer.from(await r.arrayBuffer());
    try {
      const { logCost } = require('./integrations/supabase');
      logCost({
        service: 'elevenlabs', model: 'eleven_multilingual_v2',
        units: textoLimpo.length,
        cost_usd: textoLimpo.length * 0.0003,
      });
    } catch (_) {}
    res.json({ audio: buffer.toString("base64"), formato: "mp3" });
  } catch (e) {
    console.error("[/api/narrar]", e.message);
    res.status(500).json({ error: e.message });
  }
});

// ──────────────────────────────────────────
// Dashboard — Nexus Control Center
// ──────────────────────────────────────────

app.get('/dashboard', (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/editor', (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.sendFile(path.join(__dirname, 'public', 'editor.html'));
});

// ──────────────────────────────────────────
// Materiais Imprimíveis — Order Bumps Kit Despluga
// ──────────────────────────────────────────
app.post("/api/materiais", async (req, res) => {
  const { tipo } = req.body;
  const { gerarCertificados, gerarPassaporte, gerarFichas } = require("./departments/creative/materiais_generator");
  const map = {
    certificados: { fn: gerarCertificados, filename: "certificados-conquista.pdf" },
    passaporte:   { fn: gerarPassaporte,   filename: "passaporte-explorador.pdf"  },
    fichas:       { fn: gerarFichas,       filename: "fichas-acompanhamento.pdf"  },
  };
  if (!map[tipo]) return res.status(400).json({ error: "tipo inválido. Use: certificados | passaporte | fichas" });
  try {
    const buffer = await map[tipo].fn();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${map[tipo].filename}"`);
    res.send(buffer);
  } catch (e) {
    console.error("[/api/materiais]", e.message);
    res.status(500).json({ error: e.message });
  }
});

// ══════════════════════════════════════════
// NexusPDF — Motor Universal de PDF + IA
// POST /api/gerar-pdf
//   { prompt }         → MAX gera config → PDF
//   { config }         → direto → PDF
//   { prompt, config } → config tem prioridade
// ══════════════════════════════════════════
app.post("/api/gerar-pdf", async (req, res) => {
  try {
    const { render }         = require("./departments/creative/pdf_engine");
    const { generateConfig } = require("./departments/creative/pdf_ai");

    let config = req.body.config || null;

    if (!config) {
      const prompt = req.body.prompt;
      if (!prompt) return res.status(400).json({ error: "Envie 'prompt' ou 'config' no body." });
      config = await generateConfig(prompt);
    }

    const buffer   = await render(config);
    const template = config.template || "documento";
    const filename = `nexus-${template}-${Date.now()}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (e) {
    console.error("[/api/gerar-pdf]", e.message);
    res.status(500).json({ error: e.message });
  }
});

// ══════════════════════════════════════════
// NexusPDF Puppeteer — Templates HTML premium
// GET  /api/nexuspdf/templates  → lista
// POST /api/nexuspdf/gerar      → { templateId, vars } → PDF
// GET  /api/nexuspdf/stats      → custos e contagens
// ══════════════════════════════════════════
(function setupNexusPDF() {
  const { renderTemplate, listTemplates, getStats } = require("./departments/creative/pdf_puppeteer");

  // Middleware: CORS + API Key para todas as rotas /api/nexuspdf/*
  const nexusCors = (req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-api-key, Authorization");
    if (req.method === "OPTIONS") return res.sendStatus(204);
    // Rota pública — palavras não são dados sensíveis
    if (req.path === "/palavras-tema") return next();
    const expectedKey = process.env.NEXUS_API_KEY;
    if (expectedKey) {
      const provided = req.headers["x-api-key"] || req.headers["authorization"]?.replace("Bearer ", "");
      if (provided !== expectedKey) return res.status(401).json({ error: "Chave de API inválida." });
    }
    next();
  };
  app.use("/api/nexuspdf", nexusCors);

  app.get("/api/nexuspdf/templates", (req, res) => {
    try { res.json(listTemplates()); }
    catch (e) { res.status(500).json({ error: e.message }); }
  });

  app.post("/api/nexuspdf/gerar", async (req, res) => {
    try {
      const { templateId, vars = {} } = req.body;
      if (!templateId) return res.status(400).json({ error: "templateId obrigatório." });

      const { buffer, meta } = await renderTemplate(templateId, vars);
      const filename = `nexus-${templateId}-${Date.now()}.pdf`;

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.setHeader("X-Template-Name", meta.name || templateId);
      res.send(buffer);
    } catch (e) {
      console.error("[/api/nexuspdf/gerar]", e.message);
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/nexuspdf/stats", (req, res) => {
    try { res.json(getStats()); }
    catch (e) { res.status(500).json({ error: e.message }); }
  });

  // POST /api/nexuspdf/gerar-kit → { templateId, kitData } → PDF customizado
  app.post("/api/nexuspdf/gerar-kit", async (req, res) => {
    try {
      const { templateId = "kit-tea", kitData = {} } = req.body;
      const genPath = require("path").join(__dirname, "departments/creative/templates", templateId, "generate.js");
      const { buildHTML } = require(genPath);
      const html = buildHTML(kitData);

      const puppeteer = require("puppeteer");
      const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox","--disable-setuid-sandbox","--disable-dev-shm-usage"] });
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: "networkidle0", timeout: 30000 });
      const buffer = await page.pdf({ format: "A4", printBackground: true, margin: { top:0,right:0,bottom:0,left:0 } });
      await browser.close();

      const slug = (kitData.kitNome || templateId).replace(/\s+/g, "-").toLowerCase();
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${slug}-${Date.now()}.pdf"`);
      res.send(buffer);
    } catch (e) {
      console.error("[/api/nexuspdf/gerar-kit]", e.message);
      res.status(500).json({ error: e.message });
    }
  });

  // GET /api/nexuspdf/kit-data/:templateId → retorna defaultData do template
  app.get("/api/nexuspdf/kit-data/:templateId", (req, res) => {
    try {
      const genPath = require("path").join(__dirname, "departments/creative/templates", req.params.templateId, "generate.js");
      const { defaultData } = require(genPath);
      res.json(defaultData);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // ── AI Template Creator ─────────────────────────────────────────────────────
  // POST /api/nexuspdf/criar-template → { descricao } → { jobId }
  // GET  /api/nexuspdf/criar-template-progress/:jobId → SSE
  // POST /api/nexuspdf/ai-criar → { descricao } → { jobId }  (geração rápida sem salvar)
  // GET  /api/nexuspdf/ai-progress/:jobId → SSE
  // GET  /api/nexuspdf/ai-download/:jobId → PDF

  const aiPdfJobs = new Map();

  const SYSTEM_PROMPT_TEMPLATE = `Você é MAX, motor de criação de templates PDF premium da Nexus Digital.
Rodrigo Cruz usa você para criar infoprodutos que vende online. Qualidade é fundamental.

OBJETIVO: Gerar um template HTML premium de múltiplas páginas A4 para PDF vendável.

══ REQUISITOS TÉCNICOS OBRIGATÓRIOS ══
CSS base na tag <style>:
* { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: '[FONTE]', sans-serif; background: #f0f0f0; }
.pg { width: 794px; min-height: 1123px; background: #fff; position: relative; display: flex; flex-direction: column; overflow: hidden; page-break-after: always; margin: 0 auto 20px; }

Google Fonts CDN (escolha fontes adequadas ao nicho):
- Educação: Nunito + Fredoka One
- Saúde/Bem-estar: Poppins + Playfair Display
- Fitness: Oswald + Open Sans
- Negócios/Vendas: Outfit + JetBrains Mono
- Culinária: Lato + Merriweather
- Finanças: Outfit + JetBrains Mono

Variáveis {{duplas-chaves}} para campos personalizáveis (mín. 2 vars relevantes).
Conteúdo REAL e COMPLETO — jamais "Lorem ipsum" ou "[conteúdo aqui]".
Mínimo 8 páginas.

══ ESTRUTURA DAS PÁGINAS ══

PÁGINA 1 — CAPA (obrigatório):
- Fundo com gradiente escuro (NÃO branco)
- Padrão grid/textura sutil no background via CSS
- Título grande, ícone em destaque, subtítulo, chips de destaque, box de stats
- Rodapé com {{variavel}}

PÁGINAS INTERNAS:
- Header colorido em CADA página (gradiente do tema)
- SVG wave separator logo abaixo do header
- Conteúdo em CARDS (background colorido suave, border-radius, border-left colorida)
- Grids 2 colunas quando listar itens
- Boxes especiais para dicas e destaques
- Rodapé em cada página: {{variavel}} · título · N/TOTAL

ÚLTIMA PÁGINA:
- Visual diferenciado (fundo colorido), mensagem motivacional / CTA

══ ESTILOS POR NICHO ══
Educação → navy #1a3a5c, accent por conceito
Saúde/bem-estar → verde escuro #1a3a2a, tons naturais
Fitness → roxo escuro #1a1a2e, vermelho/laranja
Negócios/vendas → slate #0f172a, ciano elétrico
Culinária → marrom #2d1810, laranja quente
Finanças → azul royal #0a2240, verde/dourado

══ FORMATO DA RESPOSTA ══
Responda EXATAMENTE assim:
1. HTML completo (<!DOCTYPE html> até </html>)
2. Na linha seguinte: META:{"nome":"Nome","vars":[{"id":"v","label":"Label","default":"Valor"}],"paginas":N,"descricao":"Desc curta","icon":"emoji","category":"educacao"}

Sem explicações. Sem markdown. Apenas HTML + META.`;

  const templateJobs = new Map();

  app.post("/api/nexuspdf/criar-template", (req, res) => {
    const { descricao } = req.body;
    if (!descricao?.trim()) return res.status(400).json({ error: "Descrição obrigatória." });

    const jobId = Math.random().toString(36).slice(2, 10);
    templateJobs.set(jobId, { status: "running", progress: 0, message: "MAX está pensando...", criadoEm: Date.now() });
    res.json({ jobId });

    const set = (pct, msg) => { const j = templateJobs.get(jobId); if (j) { j.progress = pct; j.message = msg; } };
    const KILL = setTimeout(() => {
      const j = templateJobs.get(jobId);
      if (j?.status === "running") templateJobs.set(jobId, { ...j, status: "error", message: "Timeout após 5 minutos." });
    }, 5 * 60 * 1000);

    Promise.resolve().then(async () => {
      set(8, "MAX está analisando o nicho...");
      const OpenAI = require("openai");
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      set(15, "Gerando estrutura e design...");
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: SYSTEM_PROMPT_TEMPLATE },
          { role: "user", content: descricao.trim() }
        ],
        max_tokens: 16000,
        temperature: 0.65,
      });

      set(55, "Processando HTML gerado...");
      const raw = completion.choices[0].message.content.trim();

      // Extrai META: da última linha
      const metaMatch = raw.match(/META:(\{.*\})\s*$/m);
      if (!metaMatch) throw new Error("MAX não retornou o META do template. Tente novamente.");
      const meta = JSON.parse(metaMatch[1]);
      const html = raw.substring(0, raw.lastIndexOf("META:")).trim()
        .replace(/^```html\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/, "");

      // Gera slug único
      const slug = (meta.nome || "template")
        .toLowerCase()
        .normalize("NFD").replace(/[̀-ͯ]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 40) + "-" + Date.now().toString(36);

      set(65, "Salvando template...");
      const fs = require("fs");
      const tmplDir = require("path").join(__dirname, "departments/creative/templates", slug);
      fs.mkdirSync(tmplDir, { recursive: true });
      fs.writeFileSync(require("path").join(tmplDir, "index.html"), html, "utf8");
      fs.writeFileSync(require("path").join(tmplDir, "meta.json"), JSON.stringify({
        nome: meta.nome || descricao.slice(0, 50),
        name: meta.nome || descricao.slice(0, 50),
        nicho: meta.category || "geral",
        category: meta.category || "geral",
        icon: meta.icon || "📄",
        descricao: meta.descricao || descricao.slice(0, 100),
        description: meta.descricao || descricao.slice(0, 100),
        layout: "portrait",
        paginas: meta.paginas || 0,
        vars: meta.vars || [],
        criadoViaAI: true,
        criadoEm: new Date().toISOString(),
      }, null, 2), "utf8");

      set(80, "Renderizando preview do PDF...");
      const puppeteer = require("puppeteer");
      const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox","--disable-setuid-sandbox","--disable-dev-shm-usage"] });
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: "networkidle0", timeout: 30000 });
      const pageCount = await page.evaluate(() => document.querySelectorAll(".pg").length);
      const pdfBuf = await page.pdf({ format: "A4", printBackground: true, margin: { top:0,right:0,bottom:0,left:0 } });
      await browser.close();

      // Atualiza paginas no meta
      if (pageCount > 0) {
        const mPath = require("path").join(tmplDir, "meta.json");
        const m = JSON.parse(fs.readFileSync(mPath, "utf8"));
        m.paginas = pageCount;
        fs.writeFileSync(mPath, JSON.stringify(m, null, 2), "utf8");
      }

      set(100, "Template criado com sucesso!");
      const j = templateJobs.get(jobId);
      templateJobs.set(jobId, { ...j, status: "done", progress: 100, message: "Template pronto!",
        templateId: slug, meta: { ...meta, paginas: pageCount || meta.paginas },
        pdf: pdfBuf, descricao: descricao.trim().slice(0, 80) });
    })
    .catch(e => {
      const j = templateJobs.get(jobId);
      templateJobs.set(jobId, { ...j, status: "error", message: e.message });
    })
    .finally(() => clearTimeout(KILL));
  });

  app.get("/api/nexuspdf/criar-template-progress/:jobId", (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();
    const send = d => res.write(`data: ${JSON.stringify(d)}\n\n`);
    const iv = setInterval(() => {
      const j = templateJobs.get(req.params.jobId);
      if (!j) { send({ status: "error", message: "Job não encontrado." }); clearInterval(iv); res.end(); return; }
      send({ status: j.status, progress: j.progress, message: j.message,
        templateId: j.templateId, meta: j.meta, descricao: j.descricao });
      if (j.status !== "running") { clearInterval(iv); setTimeout(() => res.end(), 200); }
    }, 700);
    req.on("close", () => clearInterval(iv));
  });

  app.get("/api/nexuspdf/criar-template-download/:jobId", (req, res) => {
    const j = templateJobs.get(req.params.jobId);
    if (!j?.pdf) return res.status(404).json({ error: "PDF não disponível." });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${j.templateId || "nexus"}-${Date.now()}.pdf"`);
    res.send(j.pdf);
  });

  // ── AI PDF Creator (rápido, sem salvar) ──────────────────────────────────────

  app.post("/api/nexuspdf/ai-criar", (req, res) => {
    const { descricao } = req.body;
    if (!descricao || !descricao.trim()) return res.status(400).json({ error: "Descrição obrigatória." });

    const jobId = Math.random().toString(36).slice(2, 10);
    aiPdfJobs.set(jobId, { status: "running", progress: 0, message: "Iniciando MAX...", criadoEm: Date.now() });
    res.json({ jobId });

    const setProgress = (pct, msg) => {
      const j = aiPdfJobs.get(jobId);
      if (j) { j.progress = pct; j.message = msg; }
    };

    const TIMEOUT = setTimeout(() => {
      const j = aiPdfJobs.get(jobId);
      if (j && j.status === "running") aiPdfJobs.set(jobId, { ...j, status: "error", message: "Timeout: geração demorou mais de 5 minutos." });
    }, 5 * 60 * 1000);

    Promise.resolve()
      .then(async () => {
        setProgress(10, "MAX está pensando no layout...");
        const OpenAI = require("openai");
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        const systemPrompt = `Você é MAX, motor de criação de PDFs profissionais da Nexus Digital.
Gere HTML completo e auto-contido para PDF A4 renderizado pelo Puppeteer.

REGRAS TÉCNICAS OBRIGATÓRIAS:
1. Cada página A4: <div class="pg"> — CSS: width:794px; min-height:1123px; page-break-after:always; overflow:hidden
2. No <style>: * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; box-sizing:border-box; margin:0; padding:0; }
3. Google Fonts via CDN (link href — escolha fontes relevantes ao tema)
4. Zero JavaScript. Tudo em português brasileiro.
5. Conteúdo COMPLETO e REAL — nunca use "Lorem ipsum" ou placeholders
6. Mínimo 5 páginas, máximo 20 páginas

DESIGN:
- Capa: gradiente escuro impactante, título grande, emoji/ícone relevante, stats do conteúdo
- Páginas internas: branco ou levemente colorido, cards visuais, ícones, tipografia clara
- Paleta coerente com o tema (tons frios para tech, quentes para culinária, etc.)
- Bordas arredondadas, separadores, hierarquia visual clara — design profissional real

Responda APENAS com o HTML completo começando com <!DOCTYPE html> e terminando com </html>. Sem explicação.`;

        const completion = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: descricao.trim() }
          ],
          max_tokens: 16000,
          temperature: 0.7,
        });

        setProgress(60, "Renderizando PDF com Puppeteer...");
        const html = completion.choices[0].message.content.trim()
          .replace(/^```html\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/, "");

        const puppeteer = require("puppeteer");
        const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox","--disable-setuid-sandbox","--disable-dev-shm-usage"] });
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: "networkidle0", timeout: 30000 });
        const buffer = await page.pdf({ format: "A4", printBackground: true, margin: { top:0,right:0,bottom:0,left:0 } });
        const pageCount = await page.evaluate(() => document.querySelectorAll(".pg").length);
        await browser.close();

        setProgress(95, "Finalizando...");

        const j = aiPdfJobs.get(jobId);
        aiPdfJobs.set(jobId, { ...j, status: "done", progress: 100, message: "Pronto!", pdf: buffer, pageCount, descricao: descricao.trim().slice(0, 80) });
      })
      .catch(e => {
        const j = aiPdfJobs.get(jobId);
        aiPdfJobs.set(jobId, { ...j, status: "error", message: e.message });
      })
      .finally(() => clearTimeout(TIMEOUT));
  });

  app.get("/api/nexuspdf/ai-progress/:jobId", (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    const send = (data) => res.write(`data: ${JSON.stringify(data)}\n\n`);
    const iv = setInterval(() => {
      const j = aiPdfJobs.get(req.params.jobId);
      if (!j) { send({ status: "error", message: "Job não encontrado." }); clearInterval(iv); res.end(); return; }
      send({ status: j.status, progress: j.progress, message: j.message, pageCount: j.pageCount });
      if (j.status !== "running") { clearInterval(iv); setTimeout(() => res.end(), 200); }
    }, 600);

    req.on("close", () => clearInterval(iv));
  });

  app.get("/api/nexuspdf/ai-download/:jobId", (req, res) => {
    const j = aiPdfJobs.get(req.params.jobId);
    if (!j || j.status !== "done" || !j.pdf) return res.status(404).json({ error: "PDF não disponível." });
    const slug = (j.descricao || "nexus-ai").replace(/[^a-zA-Z0-9À-ɏ]/g, "-").slice(0, 40);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${slug}-${Date.now()}.pdf"`);
    res.send(j.pdf);
  });
})();

// ══════════════════════════════════════════
// NexusPDF Dinâmico — Folhinhas com variantes
// POST /api/nexuspdf/gerar-dinamico → { escola, professor, ano, nivel, tema_id } → PDF
// GET  /api/nexuspdf/variantes      → lista temas e níveis disponíveis
// POST /api/nexuspdf/sugestao       → { sugestao, email? } → salva sugestão
// GET  /api/nexuspdf/sugestoes      → lista sugestões (admin)
// ══════════════════════════════════════════
(function setupFolhinhasDinamico() {
  const fs   = require("fs");
  const path = require("path");
  const { renderTemplate } = require("./departments/creative/pdf_puppeteer");

  const VARIANTS_FILE = path.join(__dirname, "departments/creative/templates/kit-worksheet-dinamico/variants.json");
  const SUGESTOES_FILE = path.join(__dirname, "data/sugestoes.json");
  const BASE_TMPL = path.join(__dirname, "departments/creative/templates/kit-worksheet-dinamico/base.html");

  function loadVariants() { return JSON.parse(fs.readFileSync(VARIANTS_FILE, "utf8")); }

  // Mapeia uuid → nome-desejado.pdf para o endpoint de download
  const downloadMap = new Map();
  function loadSugestoes() {
    try { return JSON.parse(fs.readFileSync(SUGESTOES_FILE, "utf8")); } catch { return []; }
  }

  // Middleware API Key
  const authMw = (req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-api-key, Authorization");
    if (req.method === "OPTIONS") return res.sendStatus(204);
    const key = req.headers["x-api-key"] || (req.headers["authorization"] || "").replace("Bearer ", "");
    if (key !== process.env.NEXUS_API_KEY) return res.status(401).json({ error: "Chave inválida." });
    next();
  };

  // GET /api/nexuspdf/palavras-tema?tema_id=X&nivel=N  (público — palavras não são sensíveis)
  app.get("/api/nexuspdf/palavras-tema", (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    const { tema_id, nivel } = req.query;
    if (!tema_id) return res.status(400).json({ error: "tema_id obrigatório" });
    const variants = loadVariants();
    let pool = variants.filter(v => v.tema_id === tema_id);
    if (nivel) {
      const nivelN = parseInt(nivel);
      const sub = pool.filter(v => v.nivel === nivelN);
      if (sub.length) pool = sub;
    }
    if (!pool.length) return res.status(404).json({ error: "Tema não encontrado" });
    res.json({ palavras: pool[0].palavras, tema_id, nivel: pool[0].nivel });
  });

  // GET /api/nexuspdf/variantes
  app.get("/api/nexuspdf/variantes", authMw, (req, res) => {
    const variants = loadVariants();
    const temas = {};
    for (const v of variants) {
      if (!temas[v.tema_id]) temas[v.tema_id] = { tema_id: v.tema_id, label: v.label, icon: v.icon, sazonal: v.sazonal, mes: v.mes, niveis: [] };
      temas[v.tema_id].niveis.push(v.nivel);
    }
    res.json(Object.values(temas));
  });

  // Helper: gera um PDF do base.html com os dados fornecidos e salva no tmp
  async function gerarFolhinhasPdf({ escola, professor, ano, variant, gabarito = false, pb = false, palavras = null, atividades = null, nomePdf }) {
    let baseHtml = fs.readFileSync(BASE_TMPL, "utf8");
    const data = { escola, professor, ano, variant };
    if (gabarito) data.gabarito = true;
    if (pb) data.pb = true;
    if (palavras && Array.isArray(palavras)) data.palavras = palavras;
    if (atividades && Array.isArray(atividades) && atividades.length) data.atividades = atividades;
    const dataScript = `<script>window.__DATA__ = ${JSON.stringify(data)};</script>`;
    baseHtml = baseHtml.replace("<script>", dataScript + "\n<script>");

    const pdf = await renderInlineHtml(baseHtml);
    const suffix = gabarito ? '-gabarito' : '';
    const base = nomePdf || `folhinhas-${variant.tema_id}-n${variant.nivel}`;
    const slug = (base + suffix).replace(/[^a-zA-Z0-9À-ÿ\s\-_]/g, '').replace(/\s+/g, '-').slice(0, 80);
    const fname = slug + '.pdf';

    const tmpDir = path.join(__dirname, 'public', 'folhinhas-tmp');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

    // Limpa arquivos com mais de 2 horas
    try {
      const agora = Date.now();
      fs.readdirSync(tmpDir).forEach(f => {
        const fpath = path.join(tmpDir, f);
        if (agora - fs.statSync(fpath).mtimeMs > 2 * 60 * 60 * 1000) fs.unlinkSync(fpath);
      });
    } catch {}

    const uuid = require('crypto').randomUUID();
    const filepath = path.join(tmpDir, uuid + '.pdf');
    fs.writeFileSync(filepath, pdf);
    downloadMap.set(uuid, fname);
    return { uuid, fname, url: `/folhinhas-dl/${uuid}` };
  }

  // POST /api/nexuspdf/gerar-dinamico
  app.post("/api/nexuspdf/gerar-dinamico", authMw, async (req, res) => {
    const { escola, professor, ano, nivel, tema_id, gabarito, pb, palavras, atividades, nomePdf } = req.body;
    if (!escola || !professor || !ano) return res.status(400).json({ error: "escola, professor e ano são obrigatórios." });
    if (!tema_id) return res.status(400).json({ error: "tema_id é obrigatório." });

    const variants = loadVariants();
    let pool = variants.filter(v => v.tema_id === tema_id);
    if (!pool.length) return res.status(404).json({ error: `Tema "${tema_id}" não encontrado.` });

    if (nivel) {
      const nivelN = parseInt(nivel);
      const sub = pool.filter(v => v.nivel === nivelN);
      if (sub.length) pool = sub;
    }

    // Sorteia variante aleatória
    const variant = pool[Math.floor(Math.random() * pool.length)];

    try {
      const args = { escola, professor, ano, variant, pb: !!pb, palavras, atividades, nomePdf };
      const [alunoResult, gabaritoResult] = await Promise.all([
        gerarFolhinhasPdf({ ...args, gabarito: false }),
        gabarito ? gerarFolhinhasPdf({ ...args, gabarito: true }) : Promise.resolve(null),
      ]);

      res.json({
        ok: true,
        url: alunoResult.url,
        fname: alunoResult.fname,
        ...(gabaritoResult ? { gabaritoUrl: gabaritoResult.url, gabaritoFname: gabaritoResult.fname } : {}),
      });
    } catch (e) {
      console.error("[/api/nexuspdf/gerar-dinamico]", e.message);
      res.status(500).json({ error: "Erro ao gerar PDF: " + e.message });
    }
  });

  // Renderiza HTML puro (sem arquivo de template)
  async function renderInlineHtml(html) {
    let browser;
    const LAUNCH_ARGS = ["--no-sandbox","--disable-setuid-sandbox","--disable-dev-shm-usage","--disable-gpu","--font-render-hinting=none"];
    if (process.env.NODE_ENV === "production" || process.env.RENDER) {
      const chromium = require("@sparticuz/chromium");
      const puppeteerCore = require("puppeteer-core");
      browser = await puppeteerCore.launch({ args: [...chromium.args, ...LAUNCH_ARGS], executablePath: await chromium.executablePath(), headless: chromium.headless });
    } else {
      const puppeteer = require("puppeteer");
      browser = await puppeteer.launch({ headless: "new", args: LAUNCH_ARGS });
    }
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    await page.waitForFunction(() => document.body.children.length > 1, { timeout: 30000 });
    const pdf = await page.pdf({ format: "A4", printBackground: true, margin: { top: "0", right: "0", bottom: "0", left: "0" } });
    await browser.close();
    return pdf;
  }

  // GET /folhinhas-dl/:uuid — público, usa res.download() para forçar nome correto
  app.get("/folhinhas-dl/:uuid", (req, res) => {
    const { uuid } = req.params;
    const tmpDir = path.join(__dirname, 'public', 'folhinhas-tmp');
    const filepath = path.join(tmpDir, uuid + '.pdf');
    if (!fs.existsSync(filepath)) return res.status(404).json({ error: "Arquivo não encontrado." });
    const fname = downloadMap.get(uuid) || `folhinhas-${uuid.slice(0,8)}.pdf`;
    res.download(filepath, fname);
  });

  // POST /api/nexuspdf/sugestao
  app.post("/api/nexuspdf/sugestao", (req, res) => {
    const { sugestao, email, escola } = req.body;
    if (!sugestao || sugestao.trim().length < 3) return res.status(400).json({ error: "Sugestão muito curta." });
    const lista = loadSugestoes();
    const nova = { id: Date.now(), sugestao: sugestao.trim(), email: email || null, escola: escola || null, votos: 1, data: new Date().toISOString() };
    lista.unshift(nova);
    fs.writeFileSync(SUGESTOES_FILE, JSON.stringify(lista, null, 2));
    res.json({ ok: true, id: nova.id });
  });

  // POST /api/nexuspdf/sugestao/:id/voto
  app.post("/api/nexuspdf/sugestao/:id/voto", (req, res) => {
    const lista = loadSugestoes();
    const item = lista.find(s => s.id === parseInt(req.params.id));
    if (!item) return res.status(404).json({ error: "Sugestão não encontrada." });
    item.votos = (item.votos || 0) + 1;
    fs.writeFileSync(SUGESTOES_FILE, JSON.stringify(lista, null, 2));
    res.json({ ok: true, votos: item.votos });
  });

  // GET /api/nexuspdf/sugestoes
  app.get("/api/nexuspdf/sugestoes", (req, res) => {
    const lista = loadSugestoes().sort((a,b) => (b.votos||0) - (a.votos||0));
    res.json(lista);
  });

  console.log("[NexusPDF Dinâmico] Endpoints registrados.");
})();

// ──────────────────────────────────────────
// Conversão WebM → MP4 (server-side FFmpeg)
// ──────────────────────────────────────────
(function setupVideoConvert() {
  const multer = require('multer');
  const ffmpeg = require('fluent-ffmpeg');
  const ffmpegPath = require('ffmpeg-static');
  const os = require('os');
  const fs = require('fs');
  ffmpeg.setFfmpegPath(ffmpegPath);

  const upload = multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => cb(null, os.tmpdir()),
      filename: (req, file, cb) => cb(null, `nexus_${Date.now()}_${file.fieldname}.webm`),
    }),
    limits: { fileSize: 500 * 1024 * 1024 }, // 500MB máx
  });

  app.post('/api/convert-mp4', upload.single('video'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado' });

    const inputPath  = req.file.path;
    const outputPath = inputPath.replace('.webm', '.mp4');

    ffmpeg(inputPath)
      .outputOptions([
        '-c:v', 'libx264',
        '-crf', '23',
        '-preset', 'veryfast',
        '-pix_fmt', 'yuv420p',
        '-c:a', 'aac',
        '-b:a', '128k',
        '-movflags', '+faststart',
      ])
      .output(outputPath)
      .on('end', () => {
        res.setHeader('Content-Type', 'video/mp4');
        res.setHeader('Content-Disposition', `attachment; filename="nexus-criativo-${Date.now()}.mp4"`);
        const stream = fs.createReadStream(outputPath);
        stream.pipe(res);
        stream.on('close', () => {
          fs.unlink(inputPath, () => {});
          fs.unlink(outputPath, () => {});
        });
      })
      .on('error', (err) => {
        console.error('[convert-mp4]', err.message);
        fs.unlink(inputPath, () => {});
        res.status(500).json({ error: 'Falha na conversão: ' + err.message });
      })
      .run();
  });
})();

app.get('/api/dashboard/config', (req, res) => {
  const { SECTORS, CONSELHO } = require('./core/departments');
  res.json({ sectors: SECTORS, conselho: CONSELHO });
});

app.get('/api/dashboard/metrics', async (req, res) => {
  try {
    const { getUTMifyReport, getRelatorioVendasHoje } = require('./departments/finance/finance_agent');
    const [utmRow, vendasHoje] = await Promise.all([
      getUTMifyReport(),
      getRelatorioVendasHoje().catch(() => ({ totalReceita: 0, totalConversoes: 0, vendas: [] })),
    ]);
    res.json({
      utmify: utmRow?.context || utmRow?.data || null,
      vendasHoje: { totalReceita: vendasHoje.totalReceita, totalConversoes: vendasHoje.totalConversoes },
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/dashboard/chat', async (req, res) => {
  try {
    const { sector, message, session_id } = req.body;
    if (!sector || !message || !session_id) return res.status(400).json({ error: 'Parâmetros incompletos' });
    const { chatWithSector, saveConversation, getHistory } = require('./core/departments');
    const history = await getHistory(session_id, sector, 12);
    await saveConversation(session_id, sector, 'user', message);
    const reply = await chatWithSector(sector, message, history);
    await saveConversation(session_id, sector, 'assistant', reply);
    res.json({ reply });
  } catch (e) {
    console.error('[/api/dashboard/chat]', e.message);
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/dashboard/consensus-stream', async (req, res) => {
  const { question, session_id } = req.query;
  if (!question || !session_id) return res.status(400).json({ error: 'Parâmetros incompletos' });

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const { SECTORS, chatWithSector, getConsensusSynthesis, saveConversation, getHistory } = require('./core/departments');

  const sectorKeys = Object.keys(SECTORS);
  const responses = [];

  await Promise.all(sectorKeys.map(async (sector) => {
    try {
      const history = await getHistory(session_id, sector, 6);
      await saveConversation(session_id, sector, 'user', question);
      const content = await chatWithSector(sector, question, history);
      await saveConversation(session_id, sector, 'assistant', content);
      responses.push({ sector, content });
      res.write(`data: ${JSON.stringify({ type: 'sector', sector, content })}\n\n`);
    } catch (e) {
      res.write(`data: ${JSON.stringify({ type: 'sector', sector, content: `Erro: ${e.message}` })}\n\n`);
    }
  }));

  try {
    const synthesis = await getConsensusSynthesis(question, responses);
    res.write(`data: ${JSON.stringify({ type: 'synthesis', content: synthesis })}\n\n`);
  } catch (e) {
    res.write(`data: ${JSON.stringify({ type: 'synthesis', content: `Erro na síntese: ${e.message}` })}\n\n`);
  }

  res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
  res.end();
});

// ── BLOCO DE NOTAS — salvar e listar notas do Presidente ──────────────────────
app.post('/api/dashboard/notes', async (req, res) => {
  try {
    const { content, session_id } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: 'Conteúdo vazio' });
    const { supabase } = require('./integrations/supabase');
    const { data, error } = await supabase.from('nexus_notas').insert({
      content: content.trim(),
      session_id: session_id || '',
      created_at: new Date().toISOString(),
    }).select().single();
    if (error) throw error;
    res.json({ ok: true, nota: data });
  } catch (e) {
    console.error('[/api/dashboard/notes POST]', e.message);
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/dashboard/notes', async (req, res) => {
  try {
    const { supabase } = require('./integrations/supabase');
    const { data, error } = await supabase
      .from('nexus_notas')
      .select('id, content, created_at')
      .order('created_at', { ascending: false })
      .limit(20);
    if (error) throw error;
    res.json({ notas: data || [] });
  } catch (e) {
    res.json({ notas: [] });
  }
});

app.delete('/api/dashboard/notes/:id', async (req, res) => {
  try {
    const { supabase } = require('./integrations/supabase');
    await supabase.from('nexus_notas').delete().eq('id', req.params.id);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/dashboard/conselho', async (req, res) => {
  try {
    const { question, session_id } = req.body;
    if (!question || !session_id) return res.status(400).json({ error: 'Parâmetros incompletos' });
    const { CONSELHO, chatWithTitan, getConselhoSynthesis } = require('./core/departments');

    const titanKeys = Object.keys(CONSELHO);
    const titanResponses = await Promise.all(titanKeys.map(async (titan) => {
      const response = await chatWithTitan(titan, question);
      return { titan, response };
    }));

    const synthesis = await getConselhoSynthesis(question, titanResponses);
    res.json({ titans: titanResponses, synthesis });
  } catch (e) {
    console.error('[/api/dashboard/conselho]', e.message);
    res.status(500).json({ error: e.message });
  }
});

// ──────────────────────────────────────────
// MAX Assistente — IA pessoal Jarvis-level com memória persistente
// ──────────────────────────────────────────
app.post('/api/dashboard/assistant', async (req, res) => {
  try {
    const { message, session_id } = req.body;
    if (!message || !session_id) return res.status(400).json({ error: 'Parâmetros incompletos' });

    const { saveConversation, getHistory } = require('./core/departments');
    const { supabase } = require('./integrations/supabase');
    const OpenAI = require('openai');
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // 1. Carrega memórias salvas
    const { data: memories } = await supabase
      .from('max_memory')
      .select('key, value')
      .order('updated_at', { ascending: false })
      .limit(60);

    const memoryBlock = memories?.length
      ? memories.map(m => `• ${m.key}: ${m.value}`).join('\n')
      : 'Nenhuma memória registrada ainda.';

    // 3. Carrega histórico da conversa (últimas 40 mensagens)
    const history = await getHistory(session_id, 'max-assistant', 40);

    // 4. Sistema Jarvis
    const systemPrompt = `Você é MAX — a inteligência artificial pessoal de Rodrigo Cruz. Pense no J.A.R.V.I.S. do Homem de Ferro: inteligente, proativo, direto, confiante e totalmente dedicado ao sucesso do seu dono.

═══ QUEM É RODRIGO ═══
- Empreendedor digital, fundador da Nexus Digital Holding
- Especialidade: infoprodutos low-ticket brasileiros em escala
- Parceiro de negócios: Bruno (BRN VENDAS) — nunca chame de "primo"
- Meta imediata: R$10.000/mês. Visão de longo prazo: valuation de R$1 bilhão

═══ PRODUTOS ATIVOS ═══
- BIDCAP / Jiu-Jitsu infantil: R$17–R$29, Meta Ads ativo, avatares: pais/mães de crianças 4–12 anos e professores de academia
- Kit Despluga Pro: +500 atividades desplugadas BNCC, avatar: professoras do Ensino Fundamental
- Stack de criação: OpenAI + Gamma AI + ElevenLabs + GG Checkout + UTMify

═══ MEMÓRIAS APRENDIDAS ═══
${memoryBlock}

═══ DASHBOARD NEXUS OS ═══
Você está integrado ao dashboard. Seções disponíveis: Briefing, Métricas, Radar de Oportunidades, Pipeline, Board de Ofertas, Biblioteca, 6 setores de IA (Fábrica de Produtos, Fábrica de Conteúdo, Motor de Monetização, Lab de UX, Engenharia, Crescimento), Conselho de Titãs (Elon, Bezos, Hang, Paulo Vieira), BRN VENDAS, Integrações.

═══ COMO VOCÊ DEVE AGIR ═══
- Perguntas simples → respostas simples e diretas
- Estratégia / negócio → profundo, concreto, com próximos 3 passos claros
- Nunca invente métricas ou dados que Rodrigo não informou
- Chame de "Rodrigo" quando fizer sentido contextual (não em toda frase)
- Humor leve e inteligência situacional são bem-vindos
- Responda sempre em português brasileiro
- Se uma ação no dashboard foi solicitada, confirme brevemente que foi executada

═══ SISTEMA DE MEMÓRIA ═══
Quando aprender algo novo e relevante sobre Rodrigo, seus produtos, metas, preferências ou decisões, adicione ao FINAL da resposta (linha separada, máximo 2 por resposta):
[M: chave_sem_espacos → valor curto e descritivo]
Exemplos válidos:
[M: produto_prioritario → BIDCAP Jiu-Jitsu, Meta Ads ativo]
[M: meta_lancamento → 3 produtos novos em outubro]
[M: preferencia_resposta → direto, sem enrolação]`;

    // 5. Salva mensagem do usuário
    await saveConversation(session_id, 'max-assistant', 'user', message);

    // 6. Chama GPT-4o (melhor qualidade para o assistente pessoal)
    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.map(h => ({ role: h.role, content: h.content })),
      { role: 'user', content: message }
    ];

    const completion = await client.chat.completions.create({
      model: 'gpt-4o',
      messages,
      max_tokens: 1000,
      temperature: 0.7,
    });

    const rawReply = completion.choices[0].message.content;

    // 7. Extrai e salva memórias novas
    const memMatches = [...rawReply.matchAll(/\[M:\s*(.+?)\s*→\s*(.+?)\]/g)];
    const cleanReply = rawReply.replace(/\[M:.*?\]\n?/g, '').trim();

    for (const [, key, value] of memMatches) {
      const k = key.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
      if (!k || !value.trim()) continue;
      try {
        await supabase.from('max_memory').upsert(
          { key: k, value: value.trim(), updated_at: new Date().toISOString() },
          { onConflict: 'key' }
        );
      } catch (_) {}
    }

    // 8. Salva resposta no histórico
    await saveConversation(session_id, 'max-assistant', 'assistant', cleanReply);

    res.json({ reply: cleanReply });
  } catch (e) {
    console.error('[/api/dashboard/assistant]', e.message);
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/dashboard/history/:sector', async (req, res) => {
  try {
    const { sector } = req.params;
    const { session_id } = req.query;
    if (!session_id) return res.status(400).json({ error: 'session_id obrigatório' });
    const { getHistory } = require('./core/departments');
    const history = await getHistory(session_id, sector, 50);
    res.json({ history });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ──────────────────────────────────────────
// Gastos de API — forge_costs
// ──────────────────────────────────────────

// ── CÉREBRO — Base de Conhecimento ───────────────────────────────────────
app.get('/api/dashboard/cerebro', async (req, res) => {
  try {
    const { searchCerebro } = require('./integrations/supabase');
    const items = await searchCerebro({ query: req.query.q || '', limit: 100 });
    res.json(items);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/dashboard/cerebro', async (req, res) => {
  try {
    const { tipo, titulo, conteudo } = req.body;
    if (!conteudo?.trim()) return res.status(400).json({ error: 'Conteúdo vazio' });
    const { saveCerebro } = require('./integrations/supabase');
    await saveCerebro({ tipo, titulo, conteudo });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/dashboard/cerebro/:id', async (req, res) => {
  try {
    const { deleteCerebro } = require('./integrations/supabase');
    await deleteCerebro(req.params.id);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/dashboard/costs', async (req, res) => {
  try {
    const days = parseInt(req.query.days || '30', 10);
    const { getCosts } = require('./integrations/supabase');
    const rows = await getCosts({ days });

    // Agrupa por serviço
    const byService = {};
    for (const r of rows) {
      if (!byService[r.service]) byService[r.service] = 0;
      byService[r.service] += Number(r.cost_usd) || 0;
    }

    // Agrupa por dia (YYYY-MM-DD) e serviço
    const byDay = {};
    for (const r of rows) {
      const day = r.created_at.slice(0, 10);
      if (!byDay[day]) byDay[day] = {};
      byDay[day][r.service] = (byDay[day][r.service] || 0) + (Number(r.cost_usd) || 0);
    }

    const totalUsd = Object.values(byService).reduce((a, b) => a + b, 0);
    const usdBrl = 5.10; // taxa aproximada para exibição
    res.json({ byService, byDay, totalUsd, totalBrl: totalUsd * usdBrl, days });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ──────────────────────────────────────────
// MCP Server — Integração com Claude Code externo
// ──────────────────────────────────────────

const mcpSessions = new Map();

const MCP_TOOLS = [
  {
    name: 'nexus_chat',
    description: 'Conversa com um dos 6 setores da Nexus Digital Holding e recebe uma resposta especializada.',
    inputSchema: {
      type: 'object',
      properties: {
        setor: {
          type: 'string',
          enum: ['fabrica-produtos','fabrica-conteudo','motor-monetizacao','lab-ux','engenharia','crescimento'],
          description: 'Qual setor consultar'
        },
        mensagem: { type: 'string', description: 'Sua pergunta ou pedido para o setor' }
      },
      required: ['setor','mensagem']
    }
  },
  {
    name: 'nexus_consenso',
    description: 'Envia uma pergunta para todos os 6 setores ao mesmo tempo. MAX sintetiza o veredito final.',
    inputSchema: {
      type: 'object',
      properties: {
        pergunta: { type: 'string', description: 'A questão para todos os setores analisarem' }
      },
      required: ['pergunta']
    }
  },
  {
    name: 'nexus_conselho',
    description: 'Consulta o Conselho de Titãs: Elon Musk, Jeff Bezos, Luciano Hang e Paulo Vieira.',
    inputSchema: {
      type: 'object',
      properties: {
        pergunta: { type: 'string', description: 'A decisão estratégica para o Conselho analisar' }
      },
      required: ['pergunta']
    }
  },
  {
    name: 'nexus_metricas',
    description: 'Retorna as métricas atuais da Nexus: receita, vendas, ROAS (UTMify e GG Checkout).',
    inputSchema: { type: 'object', properties: {} }
  },
  {
    name: 'nexus_produtos_brn',
    description: 'Lista os produtos ativos da BRN VENDAS com preços, links de compra e credenciais da área de membros.',
    inputSchema: { type: 'object', properties: {} }
  },
  {
    name: 'nexus_forge',
    description: 'Gera um infoproduto completo (ebook, workbook, checklist, planner, pack de pregações, devocional) usando o Nexus Forge com Gamma AI + OpenAI. Retorna o link do documento e a copy da contracapa.',
    inputSchema: {
      type: 'object',
      properties: {
        tipo: {
          type: 'string',
          enum: ['ebook','workbook','checklist','planner','cheat_sheet','pregacoes','devocional'],
          description: 'Tipo do infoproduto'
        },
        titulo:    { type: 'string', description: 'Título do produto' },
        descricao: { type: 'string', description: 'Nicho, tema e público-alvo do produto' },
        paginas:   { type: 'number', description: 'Número de páginas (máx 20, padrão 15)' },
        autor:     { type: 'string', description: 'Nome do autor ou marca (opcional)' }
      },
      required: ['tipo','titulo','descricao']
    }
  },
  {
    name: 'nexus_max',
    description: 'Conversa com o MAX Assistente — IA executiva da Nexus com memória persistente da empresa. Use para consultas estratégicas, tarefas, relatórios e decisões que precisam de contexto completo do negócio.',
    inputSchema: {
      type: 'object',
      properties: {
        mensagem: { type: 'string', description: 'Sua pergunta, pedido ou tarefa para o MAX' }
      },
      required: ['mensagem']
    }
  },
];

async function executeMcpTool(name, args) {
  const deps = require('./core/departments');
  const { chatWithSector, chatWithTitan, getConsensusSynthesis, getConselhoSynthesis, SECTORS, CONSELHO } = deps;

  if (name === 'nexus_chat') {
    return await chatWithSector(args.setor, args.mensagem);
  }

  if (name === 'nexus_consenso') {
    const sectorKeys = Object.keys(SECTORS);
    const responses = await Promise.all(sectorKeys.map(async sector => {
      const content = await chatWithSector(sector, args.pergunta);
      return { sector, content };
    }));
    const synthesis = await getConsensusSynthesis(args.pergunta, responses);
    const parts = responses.map(r => `**${SECTORS[r.sector]?.name}:**\n${r.content}`).join('\n\n---\n\n');
    return `${parts}\n\n---\n\n**VEREDITO MAX:**\n${synthesis}`;
  }

  if (name === 'nexus_conselho') {
    const titanKeys = Object.keys(CONSELHO);
    const titanResponses = await Promise.all(titanKeys.map(async titan => {
      const response = await chatWithTitan(titan, args.pergunta);
      return { titan, response };
    }));
    const synthesis = await getConselhoSynthesis(args.pergunta, titanResponses);
    const parts = titanResponses.map(t => `**${CONSELHO[t.titan]?.name}:**\n${t.response}`).join('\n\n---\n\n');
    return `${parts}\n\n---\n\n**DECISÕES ESTRATÉGICAS (MAX):**\n${synthesis}`;
  }

  if (name === 'nexus_metricas') {
    try {
      const { getRelatorioVendasHoje } = require('./departments/finance/finance_agent');
      const vendas = await getRelatorioVendasHoje().catch(() => ({ totalReceita: 0, totalConversoes: 0 }));
      return `**Métricas Nexus — Hoje**\n- Receita (GG Checkout): R$${Number(vendas.totalReceita||0).toFixed(2)}\n- Conversões: ${vendas.totalConversoes||0}`;
    } catch (e) {
      return `Erro ao buscar métricas: ${e.message}`;
    }
  }

  if (name === 'nexus_produtos_brn') {
    return `**Produtos BRN VENDAS**\n\n🥋 **Dinâmicas de Jiu-Jitsu** (+250 dinâmicas)\n- Premium R$27: https://ggcheckout.com.br/checkout/v5/wS3VUYi7LXGVN1gaDkzz\n- Recuperação R$19,90: https://www.ggcheckout.com/checkout/v5/lgLfIj546p8rnNxbyemz\n- Básico R$10: https://www.ggcheckout.com/checkout/v5/U5cywWzxZVWT5yxnZoCo\n- Área de membros: https://areadinamicas.netlify.app/ | Senha: jiujitsu2026\n\n📚 **Kit Despluga Pro** (+500 atividades BNCC)\n- Premium R$27: https://ggcheckout.app/checkout/v5/Nxbc5ow9sG4bxjZaYT1i\n- Recuperação R$17,90: https://ggcheckout.app/checkout/v5/LpRmHzX7GSv9qlS0zKdw\n- Básico R$10: https://ggcheckout.app/checkout/v5/d3reJiARwhAh5TJH7YFK\n- Área de membros: https://areadespluga.netlify.app/area/ | Senha: 2026`;
  }

  if (name === 'nexus_forge') {
    const { generate } = require('./departments/creative/deliverable_generator');
    const resultado = await generate({
      tipo:      args.tipo || 'ebook',
      titulo:    args.titulo,
      subtitulo: '',
      autor:     args.autor || '',
      descricao: args.descricao || '',
      avatar:    '',
      paginas:   Math.min(parseInt(args.paginas) || 15, 20),
      temaKey:   'bemestar',
      formato:   'pdf',
      cabecalho: { ativo: false, texto: '' },
      rodape:    { ativo: false, texto: '', numeroPagina: true, copyright: '' },
      produto: {
        nome:         args.titulo,
        nicho:        args.descricao || '',
        publico_alvo: '',
        preco:        '',
        relatorio:    '',
      },
      onProgress: () => {},
    });

    let msg = `✅ **"${resultado.titulo}"** gerado com sucesso!\n\n`;
    if (resultado.gammaUrl)       msg += `📄 **Abrir no Gamma:** ${resultado.gammaUrl}\n`;
    if (resultado.gammaSource)    msg += `✦ Gerado com Gamma AI\n`;
    if (resultado.gammaError)     msg += `⚠ Gamma indisponível — gerado via PDFKit\n`;
    if (resultado.copyContracapa) msg += `\n**Copy da contracapa:**\n${resultado.copyContracapa}`;
    return msg;
  }

  if (name === 'nexus_max') {
    const { openaiChat } = require('./integrations/openai');
    const { createClient } = require('@supabase/supabase-js');
    const _supa = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY);

    let memoriaCtx = '';
    try {
      const { data: mems } = await _supa.from('max_memory').select('key,value').order('updated_at', { ascending: false }).limit(40);
      if (mems?.length) memoriaCtx = '\n\nMemória da empresa:\n' + mems.map(m => `- ${m.key}: ${m.value}`).join('\n');
    } catch (_) {}

    const system = `Você é o MAX, assistente executivo da Nexus Digital Holding. Presidente: Rodrigo Cruz. Parceiro BRN: Bruno.
Você tem acesso à memória persistente da empresa e responde com profundidade estratégica.
Ao aprender algo importante, registre com [M: chave → valor].${memoriaCtx}`;

    const resposta = await openaiChat([
      { role: 'system', content: system },
      { role: 'user', content: args.mensagem },
    ]);

    const matches = [...resposta.matchAll(/\[M:\s*([^\]→]+?)\s*→\s*([^\]]+?)\]/g)];
    for (const [, key, value] of matches) {
      const k = key.trim().replace(/\s+/g, '_').toLowerCase();
      try { await _supa.from('max_memory').upsert({ key: k, value: value.trim() }, { onConflict: 'key' }); } catch (_) {}
    }

    return resposta;
  }

  throw new Error(`Ferramenta desconhecida: ${name}`);
}

// MCP SSE endpoint — cousin's Claude Code connects here
app.get('/mcp/sse', (req, res) => {
  const key = req.headers['x-api-key'] || req.query.key;
  const validKey = process.env.MCP_API_KEY || 'nexus-primo-2026';
  if (key !== validKey) return res.status(401).json({ error: 'Chave de acesso inválida' });

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'x-api-key, content-type');

  const sessionId = 'mcp_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
  mcpSessions.set(sessionId, res);

  const baseUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${process.env.PORT || 3000}`;
  res.write(`event: endpoint\ndata: ${JSON.stringify({ uri: `${baseUrl}/mcp/messages?sessionId=${sessionId}` })}\n\n`);

  const ping = setInterval(() => res.write(': ping\n\n'), 25000);
  req.on('close', () => { clearInterval(ping); mcpSessions.delete(sessionId); });
});

app.options('/mcp/messages', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'x-api-key, content-type');
  res.sendStatus(204);
});

app.post('/mcp/messages', async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { sessionId } = req.query;
  const sseRes = mcpSessions.get(sessionId);
  if (!sseRes) return res.status(404).json({ error: 'Sessão não encontrada' });

  const { jsonrpc, id, method, params } = req.body || {};
  res.status(200).send();

  if (!id) return; // notification — no response needed

  let result;
  try {
    if (method === 'initialize') {
      result = {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {} },
        serverInfo: { name: 'Nexus Control MCP', version: '1.0.0' },
      };
    } else if (method === 'tools/list') {
      result = { tools: MCP_TOOLS };
    } else if (method === 'tools/call') {
      const text = await executeMcpTool(params.name, params.arguments || {});
      result = { content: [{ type: 'text', text }] };
    } else if (method === 'ping') {
      result = {};
    } else {
      result = {};
    }
  } catch (e) {
    const error = { code: -32000, message: e.message };
    sseRes.write(`event: message\ndata: ${JSON.stringify({ jsonrpc: '2.0', id, error })}\n\n`);
    return;
  }

  sseRes.write(`event: message\ndata: ${JSON.stringify({ jsonrpc: '2.0', id, result })}\n\n`);
});

// ──────────────────────────────────────────
// Dashboard — Integrações
// ──────────────────────────────────────────

app.get('/api/dashboard/integrations', async (req, res) => {
  const baseUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${process.env.PORT || 3000}`;

  // Test Supabase
  let supabaseOk = false;
  try {
    const { supabase } = require('./integrations/supabase');
    const { error } = await supabase.from('produtos').select('id').limit(1);
    supabaseOk = !error;
  } catch {}

  // UTMify cache check
  let utmifyLastSync = null;
  try {
    const { supabase } = require('./integrations/supabase');
    const { data } = await supabase
      .from('agent_memory')
      .select('updated_at')
      .eq('key', 'utmify_report')
      .single();
    utmifyLastSync = data?.updated_at || null;
  } catch {}

  // Recent GG Checkout webhook events
  let recentSales = [];
  try {
    const { supabase } = require('./integrations/supabase');
    const { data } = await supabase
      .from('stark_reports')
      .select('id,created_at,data')
      .order('created_at', { ascending: false })
      .limit(5);
    recentSales = data || [];
  } catch {}

  res.json({
    utmify: {
      connected: !!process.env.UTMIFY_API_KEY,
      webhookUrl: `${baseUrl}/webhook/utmify`,
      lastSync: utmifyLastSync,
    },
    ggcheckout: {
      connected: true,
      webhookUrl: `${baseUrl}/webhook/ggcheckout`,
      recentSales,
    },
    openai: {
      connected: !!process.env.OPENAI_API_KEY,
      model: 'gpt-4o-mini',
    },
    elevenlabs: {
      connected: !!process.env.ELEVENLABS_API_KEY,
    },
    supabase: {
      connected: supabaseOk,
      projectId: (process.env.SUPABASE_URL || '').replace('https://','').split('.')[0],
    },
  });
});

app.post('/api/dashboard/integrations/test/:service', async (req, res) => {
  const { service } = req.params;
  try {
    if (service === 'openai') {
      const { openaiFlash } = require('./integrations/openai');
      const r = await openaiFlash('Responda apenas: OK');
      return res.json({ ok: true, message: r.trim() });
    }
    if (service === 'supabase') {
      const { supabase } = require('./integrations/supabase');
      const { error } = await supabase.from('produtos').select('id').limit(1);
      return res.json({ ok: !error, message: error ? error.message : 'Conexão OK' });
    }
    if (service === 'elevenlabs') {
      const apiKey = process.env.ELEVENLABS_API_KEY;
      if (!apiKey) return res.json({ ok: false, message: 'API key não configurada' });
      const r = await fetch('https://api.elevenlabs.io/v1/voices', {
        headers: { 'xi-api-key': apiKey }
      });
      return res.json({ ok: r.ok, message: r.ok ? `${(await r.json()).voices?.length || 0} vozes disponíveis` : 'Erro na API' });
    }
    if (service === 'utmify') {
      const apiKey = process.env.UTMIFY_API_KEY;
      if (!apiKey) return res.json({ ok: false, message: 'API key não configurada' });
      return res.json({ ok: true, message: 'Chave configurada no servidor' });
    }
    if (service === 'ggcheckout') {
      return res.json({ ok: true, message: 'Webhook ativo e aguardando eventos' });
    }
    res.status(404).json({ error: 'Serviço não encontrado' });
  } catch (e) {
    res.json({ ok: false, message: e.message });
  }
});

// ══════════════════════════════════════════
// PlanIA Desplugado — Gerador de Planos de Aula BNCC
// GET  /plania              → página web
// POST /api/plania/gerar    → gera plano via OpenAI
// POST /api/plania/verificar → valida token de acesso
// POST /api/plania/ativar   → ativa token (chamado pelo webhook GG)
// ══════════════════════════════════════════

app.get('/plania', (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.sendFile(path.join(__dirname, 'public', 'plania.html'));
});

app.post('/api/plania/verificar', async (req, res) => {
  const { token } = req.body;
  if (!token) return res.json({ valido: false, motivo: 'Token não informado' });

  try {
    const { supabase } = require('./integrations/supabase');
    const { data, error } = await supabase
      .from('plania_acessos')
      .select('id, tipo, email, planos_gerados, expira_em')
      .eq('token', token.trim().toUpperCase())
      .single();

    if (error || !data) return res.json({ valido: false, motivo: 'Token inválido ou não encontrado' });
    if (data.expira_em && new Date(data.expira_em) < new Date()) {
      return res.json({ valido: false, motivo: 'Acesso expirado. Renove em nexus-febra.com/plania' });
    }
    res.json({ valido: true, tipo: data.tipo, planos_gerados: data.planos_gerados, email: data.email });
  } catch (e) {
    res.status(500).json({ valido: false, motivo: 'Erro interno. Tente novamente.' });
  }
});

app.post('/api/plania/ativar', async (req, res) => {
  const { email, tipo = '30dias', secret } = req.body;
  if (secret !== (process.env.PLANIA_ADMIN_SECRET || 'nexus-plania-2026')) {
    return res.status(403).json({ error: 'Não autorizado' });
  }
  if (!email) return res.status(400).json({ error: 'email obrigatório' });

  const { supabase } = require('./integrations/supabase');
  const token = Math.random().toString(36).substring(2, 7).toUpperCase() +
                '-' + Math.random().toString(36).substring(2, 7).toUpperCase();
  const expira_em = tipo === 'vitalicio' ? null
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const { error } = await supabase.from('plania_acessos').insert({
    token, email, tipo, expira_em, planos_gerados: 0,
  });

  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true, token, email, tipo, expira_em });
});

app.post('/api/plania/gerar', async (req, res) => {
  const { serie, componente, tema, duracao, turma, token } = req.body;

  if (!serie || !componente || !tema?.trim()) {
    return res.status(400).json({ error: 'Preencha série, componente e tema.' });
  }
  if (tema.trim().length < 3) {
    return res.status(400).json({ error: 'Tema muito curto. Descreva melhor o assunto.' });
  }

  let acessoId = null;
  let modoDemo = true;

  if (token) {
    try {
      const { supabase } = require('./integrations/supabase');
      const { data } = await supabase
        .from('plania_acessos')
        .select('id, tipo, expira_em, planos_gerados')
        .eq('token', token.trim().toUpperCase())
        .single();

      if (!data) return res.status(403).json({ error: 'Token inválido. Verifique e tente novamente.' });
      if (data.expira_em && new Date(data.expira_em) < new Date()) {
        return res.status(403).json({ error: 'Seu acesso expirou. Renove para continuar gerando planos.' });
      }
      acessoId = data.id;
      modoDemo = false;
    } catch (e) {
      return res.status(500).json({ error: 'Erro ao verificar token.' });
    }
  }

  // Mapa de prefixos BNCC por série para guiar o modelo
  const BNCC_PREFIXO = serie.includes('Infantil') ? 'EI'
    : serie.includes('1º') ? 'EF01'
    : serie.includes('2º') ? 'EF02'
    : serie.includes('3º') ? 'EF03'
    : serie.includes('4º') ? 'EF04'
    : serie.includes('5º') ? 'EF05'
    : 'EF';

  const BNCC_EXEMPLOS = serie.includes('Infantil')
    ? 'EI03ET06, EI03EF09'
    : `${BNCC_PREFIXO}CO01, ${BNCC_PREFIXO}CO02, ${BNCC_PREFIXO}CO03`;

  const SYSTEM = `Você é Dr. Plano — o maior especialista em planejamento educacional BNCC do Brasil.
Você conhece TODOS os códigos reais da BNCC 2024, especialmente Computação (BNCC/Computação, resolução CNE/CP 2/2022).
REGRA CRÍTICA: Os códigos BNCC devem ser EXATAMENTE do ano/série solicitado.
- 1º ano → EF01CO0X  | 2º ano → EF02CO0X  | 3º ano → EF03CO0X
- 4º ano → EF04CO0X  | 5º ano → EF05CO0X  | Ed. Infantil → EI0XET0X / EI0XEF0X
Nunca misture códigos de anos diferentes. Nunca invente códigos.
Cria planos rigorosos, práticos, com atividade DESPLUGADA obrigatória (zero computador/internet).
Responda APENAS com JSON válido, sem markdown, sem texto fora do JSON.`;

  const PROMPT = `Crie um plano de aula COMPLETO para:
- Série/Ano: ${serie}
- Componente Curricular: ${componente}
- Tema: ${tema}
- Duração: ${duracao || '50 minutos'}
- Tamanho da turma: ${turma || 'até 30 alunos'}

ATENÇÃO: A série é "${serie}". Os códigos BNCC DEVEM começar com "${BNCC_PREFIXO}".
Exemplos de códigos corretos para esta série: ${BNCC_EXEMPLOS}

Retorne JSON com EXATAMENTE esta estrutura (substitua os placeholders com conteúdo real):
{
  "titulo": "título criativo e motivador para a aula",
  "serie": "${serie}",
  "componente": "${componente}",
  "duracao": "${duracao || '50 minutos'}",
  "bncc_codigos": ["${BNCC_PREFIXO}CO01", "${BNCC_PREFIXO}CO02"],
  "bncc_habilidades": ["descrição real da habilidade para o 1º código", "descrição real para o 2º código"],
  "objetivos": ["objetivo de aprendizagem específico 1", "objetivo específico 2", "objetivo específico 3"],
  "materiais": ["material concreto necessário 1", "material necessário 2", "material necessário 3"],
  "atividade_desplugada": {
    "nome": "nome criativo da dinâmica sem computador",
    "descricao": "o que é essa atividade, como funciona e por que desenvolve o pensamento computacional",
    "passo_a_passo": ["Passo 1: instrução clara", "Passo 2: instrução clara", "Passo 3: instrução clara", "Passo 4: instrução clara", "Passo 5: instrução clara"]
  },
  "desenvolvimento": {
    "aquecimento": { "tempo": "10 min", "descricao": "atividade de engajamento e conexão com o tema" },
    "principal": { "tempo": "30 min", "descricao": "desenvolvimento detalhado da atividade principal, passo a passo" },
    "encerramento": { "tempo": "10 min", "descricao": "síntese dos aprendizados e reflexão coletiva" }
  },
  "avaliacao_formativa": "como o professor observa e avalia a aprendizagem durante a aula",
  "dica_inclusao": "adaptação concreta para alunos com necessidades especiais, TEA ou dificuldades específicas",
  "para_casa": "atividade simples e divertida para fazer em casa sem nenhuma tecnologia"
}`;

  try {
    const { openaiJson } = require('./integrations/openai');
    const resposta = await openaiJson(PROMPT, SYSTEM);
    const plano = JSON.parse(resposta);

    if (acessoId) {
      const { supabase } = require('./integrations/supabase');
      await supabase.rpc('plania_incrementar_planos', { acesso_id: acessoId });
      await supabase.from('plania_planos').insert({
        acesso_id: acessoId, serie, componente, tema,
        duracao: duracao || '50 minutos',
        plano,
      });
    }

    res.json({ ok: true, plano, demo: modoDemo });
  } catch (e) {
    console.error('[/api/plania/gerar]', e.message);
    res.status(500).json({ error: 'Erro ao gerar o plano. Tente novamente em alguns segundos.' });
  }
});

// ──────────────────────────────────────────
// Inicia servidor
// ──────────────────────────────────────────
const PORT = process.env.PORT || 3000;
async function runMigrations() {
  try {
    const { createClient } = require('@supabase/supabase-js');
    const _supa = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY);
    // Tenta inserir e apagar um registro de teste para forçar a detecção da tabela
    // A tabela nexus_notas deve ser criada manualmente no Supabase Studio se não existir
    const { error } = await _supa.from('nexus_notas').select('id').limit(1);
    if (error && error.code === 'PGRST205') {
      console.log('[migrations] Tabela nexus_notas não encontrada — crie no Supabase Studio com: CREATE TABLE nexus_notas (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, content TEXT NOT NULL, session_id TEXT DEFAULT \'\', created_at TIMESTAMPTZ DEFAULT NOW());');
    } else {
      console.log('[migrations] nexus_notas ✅');
    }

    // Tabela de insights do Instagram
    const { error: igErr } = await _supa.from('ig_post_insights').select('post_id').limit(1);
    if (igErr && igErr.code === 'PGRST205') {
      console.log('[migrations] Tabela ig_post_insights não encontrada — crie no Supabase Studio:\nCREATE TABLE ig_post_insights (\n  post_id TEXT PRIMARY KEY,\n  media_type TEXT,\n  timestamp TIMESTAMPTZ,\n  like_count INT DEFAULT 0,\n  comments INT DEFAULT 0,\n  reach INT DEFAULT 0,\n  saved INT DEFAULT 0,\n  impressions INT DEFAULT 0,\n  follows INT DEFAULT 0,\n  engagement_score NUMERIC(8,4) DEFAULT 0,\n  tema TEXT DEFAULT \'\',\n  updated_at TIMESTAMPTZ DEFAULT NOW()\n);');
    } else {
      console.log('[migrations] ig_post_insights ✅');
    }
  } catch (e) {
    console.log('[migrations] Aviso:', e.message);
  }
}

// ── INSTAGRAM INSIGHTS ENDPOINT ──────────────────────────────────────────────
app.get('/instagram-insights', async (req, res) => {
  const secret = req.query.secret;
  if (secret !== process.env.INSTAGRAM_APP_SECRET) {
    return res.status(401).json({ erro: 'Não autorizado' });
  }
  try {
    const { coletarEsalvar, buscarTopPerformers } = require('./departments/creative/templates/aulas-desplugadas-ei/instagram-pipeline/insights');
    const registros = await coletarEsalvar();
    const top = await buscarTopPerformers(5);
    res.json({ coletados: registros.length, top_performers: top });
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
});

// ── INSTAGRAM IMAGE TEST ─────────────────────────────────────────────────────
app.get('/instagram-img-test', async (req, res) => {
  if (req.query.secret !== process.env.INSTAGRAM_APP_SECRET) return res.status(401).end();
  try {
    const { gerarFundo } = require('./departments/creative/templates/aulas-desplugadas-ei/instagram-pipeline/gerar-bg-ia');
    const b64 = await gerarFundo('motivacional');
    res.json({ ok: true, tamanho_kb: Math.round(b64.length / 1024) });
  } catch (e) {
    res.status(500).json({ ok: false, erro: e.message });
  }
});

// ── INSTAGRAM TEST ENDPOINT ──────────────────────────────────────────────────
app.get('/instagram-test/:periodo', async (req, res) => {
  const secret  = req.query.secret;
  const periodo = req.params.periodo; // 'manha' | 'noite'
  if (secret !== process.env.INSTAGRAM_APP_SECRET) {
    return res.status(401).json({ erro: 'Não autorizado' });
  }
  try {
    const { executar } = require('./departments/creative/templates/aulas-desplugadas-ei/instagram-pipeline/pipeline');
    res.json({ status: 'disparando', periodo });
    executar(periodo).then(() => console.log(`[instagram-test] ${periodo} concluído`))
                     .catch(err => console.error(`[instagram-test] ERRO: ${err.message}`));
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
});

app.listen(PORT, async () => {
  console.log(`NEXUS — Servidor rodando na porta ${PORT}`);
  console.log(`[Gamma] API KEY: ${process.env.GAMMA_API_KEY ? "✅ configurada" : "❌ NÃO CONFIGURADA — geração PDF usará apenas PDFKit"}`);
  await runMigrations();
  await registerWebhook();

  // Instagram pipeline — posts automáticos @jiujitsudinamicas
  try {
    const { iniciar } = require('./departments/creative/instagram-scheduler');
    iniciar();
  } catch (e) {
    console.warn('[instagram-scheduler] Não iniciado:', e.message);
  }
});
