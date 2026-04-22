// ============================================
// NEXUS — Notificações via Telegram
// Permite que Claude e MAX enviem mensagens
// proativamente para o dono da Holding
// ============================================

const https = require("https");
require("dotenv").config();

/**
 * Envia uma mensagem para o dono da Nexus via Telegram
 */
function notify(texto, parseMode = "Markdown") {
  return new Promise((resolve, reject) => {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    const body = JSON.stringify({ chat_id: chatId, text: texto, parse_mode: parseMode });

    const req = https.request({
      hostname: "api.telegram.org",
      path: `/bot${token}/sendMessage`,
      method: "POST",
      headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) },
    }, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => {
        const json = JSON.parse(data);
        json.ok ? resolve(json) : reject(new Error(json.description));
      });
    });

    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

/**
 * Envia um alerta de alta prioridade
 */
function alertar(titulo, mensagem) {
  return notify(`*ALERTA — ${titulo}*\n\n${mensagem}`);
}

/**
 * Envia o Stark Report formatado
 */
function starkReport(dados) {
  const texto =
    `*STARK REPORT*\n\n` +
    `Receita Bruta: R$ ${dados.receitaBruta || 0}\n` +
    `Custos: R$ ${dados.custos || 0}\n` +
    `*Lucro Líquido: R$ ${(dados.receitaBruta || 0) - (dados.custos || 0)}*\n\n` +
    `Conversões: ${dados.conversoes || 0}\n` +
    `Leads: ${dados.leads || 0}\n\n` +
    `_${dados.notas || ""}_`;
  return notify(texto);
}

module.exports = { notify, alertar, starkReport };
