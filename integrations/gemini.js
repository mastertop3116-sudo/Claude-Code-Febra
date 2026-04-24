// ============================================
// NEXUS — Integração Gemini (Trabalho Bruto)
// Motor principal para geração em massa
// Economiza tokens do Claude para tarefas críticas
// ============================================

const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const FLASH_MODEL = "gemini-2.5-flash";
const PRO_MODEL   = "gemini-2.5-pro";
// Nano Banana: imagem via responseModalities — tenta modelos em cascata
const IMAGE_MODELS = [
  "gemini-2.0-flash",
  "gemini-2.0-flash-exp",
];

// Timeout universal — evita travamentos infinitos
function withTimeout(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout (${ms / 1000}s) em ${label}`)), ms)
    ),
  ]);
}

async function geminiFlash(prompt, systemInstruction = null) {
  const model = genAI.getGenerativeModel({
    model: FLASH_MODEL,
    ...(systemInstruction && { systemInstruction }),
  });
  const result = await withTimeout(model.generateContent(prompt), 90_000, "geminiFlash");
  return result.response.text();
}

async function geminiPro(prompt, systemInstruction = null) {
  const model = genAI.getGenerativeModel({
    model: PRO_MODEL,
    ...(systemInstruction && { systemInstruction }),
  });
  const result = await withTimeout(model.generateContent(prompt), 120_000, "geminiPro");
  return result.response.text();
}

function geminiChat(systemInstruction = null, usePro = false) {
  const model = genAI.getGenerativeModel({
    model: usePro ? PRO_MODEL : FLASH_MODEL,
    ...(systemInstruction && { systemInstruction }),
  });
  return model.startChat({ history: [] });
}

async function geminiJson(prompt, usePro = false) {
  const model = genAI.getGenerativeModel({
    model: usePro ? PRO_MODEL : FLASH_MODEL,
    generationConfig: { responseMimeType: "application/json" },
  });
  const result = await withTimeout(model.generateContent(prompt), 90_000, "geminiJson");
  return result.response.text();
}

// Nano Banana — geração de imagens
// Tenta cada modelo da lista até um funcionar. Retorna { buffer, mimeType }.
async function geminiImage(prompt) {
  let ultimoErro = null;

  for (const modelName of IMAGE_MODELS) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: { responseModalities: ["IMAGE", "TEXT"] },
      });

      const result = await withTimeout(
        model.generateContent(prompt), 60_000, `geminiImage(${modelName})`
      );
      const parts = result.response.candidates?.[0]?.content?.parts || [];

      for (const part of parts) {
        if (part.inlineData?.mimeType?.startsWith("image/")) {
          console.log(`[Nano Banana] Modelo OK: ${modelName}`);
          return {
            buffer: Buffer.from(part.inlineData.data, "base64"),
            mimeType: part.inlineData.mimeType,
          };
        }
      }
      ultimoErro = new Error(`${modelName}: resposta sem imagem`);
    } catch (e) {
      console.warn(`[Nano Banana] ${modelName} falhou: ${e.message}`);
      ultimoErro = e;
    }
  }

  throw ultimoErro || new Error("Nano Banana: todos os modelos falharam");
}

module.exports = { geminiFlash, geminiPro, geminiChat, geminiJson, geminiImage };
