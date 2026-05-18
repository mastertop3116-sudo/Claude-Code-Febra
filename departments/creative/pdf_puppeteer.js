// ============================================================
// NexusPDF Puppeteer Engine — HTML → PDF de alta qualidade
// ============================================================
const puppeteer = require("puppeteer");
const fs        = require("fs");
const path      = require("path");

const TEMPLATES_DIR = path.join(__dirname, "templates");
const LOG_FILE      = path.join(__dirname, "../../data/nexuspdf_log.json");

// ── BROWSER POOL (reutiliza instância) ─────────────────────
let _browser = null;
async function getBrowser() {
  if (_browser) {
    try { await _browser.version(); return _browser; } catch {}
    _browser = null;
  }
  const executablePath = await puppeteer.executablePath().catch(() => undefined);
  _browser = await puppeteer.launch({
    headless: "new",
    ...(executablePath ? { executablePath } : {}),
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--font-render-hinting=none",
      "--disable-extensions",
    ],
  });
  return _browser;
}

// ── RENDER TEMPLATE ────────────────────────────────────────
async function renderTemplate(templateId, vars = {}) {
  const tmplDir = path.join(TEMPLATES_DIR, templateId);
  if (!fs.existsSync(tmplDir)) throw new Error(`Template "${templateId}" não encontrado.`);

  const meta = JSON.parse(fs.readFileSync(path.join(tmplDir, "meta.json"), "utf8"));
  let html   = fs.readFileSync(path.join(tmplDir, "index.html"), "utf8");

  // Substituir variáveis {{var}}
  for (const [k, v] of Object.entries(vars)) {
    html = html.replaceAll(`{{${k}}}`, escHtml(String(v ?? "")));
  }
  // Preencher defaults para vars não fornecidas
  for (const varDef of (meta.vars || [])) {
    html = html.replaceAll(`{{${varDef.id}}}`, escHtml(String(varDef.default ?? "")));
  }

  const browser = await getBrowser();
  const page    = await browser.newPage();

  try {
    await page.setContent(html, { waitUntil: "networkidle0", timeout: 30000 });
    const isLandscape = (meta.layout || "portrait") === "landscape";
    const buffer = await page.pdf({
      format: "A4",
      landscape: isLandscape,
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });

    logGeneration({ templateId, model: null, cost: 0 });
    return { buffer, meta };

  } finally {
    await page.close();
  }
}

// ── LIST TEMPLATES ─────────────────────────────────────────
function listTemplates() {
  if (!fs.existsSync(TEMPLATES_DIR)) return [];
  return fs.readdirSync(TEMPLATES_DIR)
    .filter(d => fs.statSync(path.join(TEMPLATES_DIR, d)).isDirectory())
    .map(id => {
      try {
        const meta = JSON.parse(fs.readFileSync(path.join(TEMPLATES_DIR, id, "meta.json"), "utf8"));
        return { id, ...meta };
      } catch { return null; }
    })
    .filter(Boolean);
}

// ── COST LOG ───────────────────────────────────────────────
function logGeneration(entry) {
  try {
    const dir = path.dirname(LOG_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const log = fs.existsSync(LOG_FILE)
      ? JSON.parse(fs.readFileSync(LOG_FILE, "utf8"))
      : [];
    log.push({ ts: Date.now(), ...entry });
    if (log.length > 2000) log.splice(0, log.length - 2000);
    fs.writeFileSync(LOG_FILE, JSON.stringify(log));
  } catch {}
}

function getStats() {
  try {
    if (!fs.existsSync(LOG_FILE)) return { today: 0, month: 0, total: 0, cost_today: 0, cost_month: 0, log: [] };
    const log   = JSON.parse(fs.readFileSync(LOG_FILE, "utf8"));
    const now   = Date.now();
    const day   = 86400000;
    const month = day * 30;
    const todayEntries = log.filter(e => now - e.ts < day);
    const monthEntries = log.filter(e => now - e.ts < month);
    return {
      today:      todayEntries.length,
      month:      monthEntries.length,
      total:      log.length,
      cost_today:  todayEntries.reduce((s, e) => s + (e.cost || 0), 0),
      cost_month:  monthEntries.reduce((s, e) => s + (e.cost || 0), 0),
      log: log.slice(-20).reverse(),
    };
  } catch { return { today: 0, month: 0, total: 0, cost_today: 0, cost_month: 0, log: [] }; }
}

// ── HELPERS ────────────────────────────────────────────────
function escHtml(s) {
  return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

module.exports = { renderTemplate, listTemplates, getStats, logGeneration };
