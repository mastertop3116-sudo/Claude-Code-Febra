// ============================================
// NEXUS — Integração Gemini (Trabalho Bruto)
// Motor principal para geração em massa
// Economiza tokens do Claude para tarefas críticas
// ============================================

const { GoogleGenerativeAI } = require("@google/generative-ai");
const { GoogleGenAI }        = require("@google/genai");
require("dotenv").config();

const genAI    = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const genAINew = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const FLASH_MODEL = "gemini-2.5-flash";
const PRO_MODEL   = "gemini-2.5-pro";

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
// Tenta Imagen 4 uma vez; se falhar, tenta Gemini Flash Image uma vez.
// Planos gratuitos não têm acesso à Imagen — o caller usa satori como fallback.
// Retorna { buffer, mimeType }.
async function geminiImage(prompt) {
  // ── Tentativa 1: Imagen 4 Fast (plano pago) ──
  try {
    const response = await withTimeout(
      genAINew.models.generateImages({
        model: "imagen-4.0-generate-preview-05-20",
        prompt,
        config: { numberOfImages: 1, aspectRatio: "3:4" },
      }),
      60_000, "imagen-4"
    );
    const imgBytes = response.generatedImages?.[0]?.image?.imageBytes;
    if (imgBytes) {
      console.log("[Nano Banana] Imagen 4 OK");
      return { buffer: Buffer.from(imgBytes, "base64"), mimeType: "image/png" };
    }
  } catch (e) {
    console.warn(`[Nano Banana] Imagen 4 falhou: ${e.message}`);
  }

  // ── Tentativa 2: Gemini Flash Image (disponível em planos gratuitos) ──
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-preview-image-generation",
      generationConfig: { responseModalities: ["IMAGE", "TEXT"] },
    });
    const result = await withTimeout(model.generateContent(prompt), 60_000, "geminiFlashImage");
    const parts = result.response.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData?.mimeType?.startsWith("image/")) {
        console.log("[Nano Banana] Flash Image OK");
        return { buffer: Buffer.from(part.inlineData.data, "base64"), mimeType: part.inlineData.mimeType };
      }
    }
  } catch (e) {
    console.warn(`[Nano Banana] Flash Image falhou: ${e.message}`);
  }

  throw new Error("Nano Banana: imagem não disponível — usando satori");
}

module.exports = { geminiFlash, geminiPro, geminiChat, geminiJson, geminiImage };
