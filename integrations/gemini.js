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
// Nano Banana: Imagen 4 (primário) → Gemini Flash (fallback via responseModalities)
const IMAGEN_MODELS = [
  "imagen-4.0-generate-preview-05-20",
  "imagen-3.0-generate-002",
];
const IMAGE_MODELS_FALLBACK = [
  "gemini-2.0-flash-preview-image-generation",
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
// Fase 1: tenta Imagen 4 / Imagen 3 via novo SDK @google/genai
// Fase 2: fallback via responseModalities (gemini-2.0-flash-preview-image-generation)
// Retorna { buffer, mimeType }.
async function geminiImage(prompt) {
  let ultimoErro = null;

  // ── Fase 1: Imagen 4 / Imagen 3 (qualidade máxima) ──
  for (const modelName of IMAGEN_MODELS) {
    try {
      const response = await withTimeout(
        genAINew.models.generateImages({
          model: modelName,
          prompt,
          config: { numberOfImages: 1, aspectRatio: "3:4" },
        }),
        90_000, `imagen(${modelName})`
      );
      const imgBytes = response.generatedImages?.[0]?.image?.imageBytes;
      if (imgBytes) {
        console.log(`[Nano Banana] Imagen OK: ${modelName}`);
        return { buffer: Buffer.from(imgBytes, "base64"), mimeType: "image/png" };
      }
      ultimoErro = new Error(`${modelName}: resposta sem imagem`);
    } catch (e) {
      console.warn(`[Nano Banana] ${modelName} falhou: ${e.message}`);
      ultimoErro = e;
    }
  }

  // ── Fase 2: Fallback Gemini Flash com responseModalities ──
  for (const modelName of IMAGE_MODELS_FALLBACK) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: { responseModalities: ["IMAGE", "TEXT"] },
      });
      const result = await withTimeout(
        model.generateContent(prompt), 60_000, `geminiFlashImage(${modelName})`
      );
      const parts = result.response.candidates?.[0]?.content?.parts || [];
      for (const part of parts) {
        if (part.inlineData?.mimeType?.startsWith("image/")) {
          console.log(`[Nano Banana] Fallback OK: ${modelName}`);
          return { buffer: Buffer.from(part.inlineData.data, "base64"), mimeType: part.inlineData.mimeType };
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
