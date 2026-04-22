// ============================================
// NEXUS — Google Sheets Integration
// Stark Report automático em planilha
// ============================================

const https = require("https");
require("dotenv").config();

/**
 * Appenda uma linha na planilha do Stark Report
 * Requer GOOGLE_SHEETS_ID e GOOGLE_SHEETS_TOKEN no .env
 */
async function appendReport(dados) {
  const sheetId = process.env.GOOGLE_SHEETS_ID;
  const token = process.env.GOOGLE_SHEETS_TOKEN;

  if (!sheetId || !token) {
    console.log("[Sheets] Credenciais não configuradas — pulando Google Sheets.");
    return null;
  }

  const valores = [
    new Date().toLocaleDateString("pt-BR"),
    dados.receitaBruta || 0,
    dados.custos || 0,
    (dados.receitaBruta || 0) - (dados.custos || 0),
    dados.conversoes || 0,
    dados.leads || 0,
    dados.notas || "",
  ];

  const body = JSON.stringify({
    values: [valores],
  });

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: "sheets.googleapis.com",
      path: `/v4/spreadsheets/${sheetId}/values/Sheet1!A1:append?valueInputOption=USER_ENTERED`,
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body),
      },
    }, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => resolve(JSON.parse(data)));
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

module.exports = { appendReport };
