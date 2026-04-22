// ============================================
// NEXUS — Integração Gemini (Trabalho Bruto)
// Motor principal para geração em massa
// Economiza tokens do Claude para tarefas críticas
// ============================================

const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Modelo padrão: Flash (mais rápido e barato)
const FLASH_MODEL = "gemini-2.5-flash";
// Modelo premium: Pro (para tarefas que exigem mais raciocínio)
const PRO_MODEL = "gemini-2.5-pro";
// Nano Banana — geração de imagens (Gemini com visão criativa)
const IMAGE_MODEL = "gemini-2.5-flash-image";

/**
 * Geração de texto com Gemini Flash (trabalho bruto)
 * Use para: copys, rascunhos, pesquisas, resumos, geração em massa
 */
async function geminiFlash(prompt, systemInstruction = null) {
  const model = genAI.getGenerativeModel({
    model: FLASH_MODEL,
    ...(systemInstruction && { systemInstruction }),
  });

  const result = await model.generateContent(prompt);
  return result.response.text();
}

/**
 * Geração com Gemini Pro (tarefas complexas)
 * Use para: análises estratégicas, quando Flash não for suficiente
 */
async function geminiPro(prompt, systemInstruction = null) {
  const model = genAI.getGenerativeModel({
    model: PRO_MODEL,
    ...(systemInstruction && { systemInstruction }),
  });

  const result = await model.generateContent(prompt);
  return result.response.text();
}

/**
 * Chat multi-turno com Gemini (para agentes com memória de sessão)
 */
function geminiChat(systemInstruction = null, usePro = false) {
  const model = genAI.getGenerativeModel({
    model: usePro ? PRO_MODEL : FLASH_MODEL,
    ...(systemInstruction && { systemInstruction }),
  });

  return model.startChat({ history: [] });
}

/**
 * Geração em modo JSON — força output JSON válido via responseMimeType
 * Use para: qualquer geração onde o resultado precisa ser parseado como JSON
 */
async function geminiJson(prompt, usePro = false) {
  const model = genAI.getGenerativeModel({
    model: usePro ? PRO_MODEL : FLASH_MODEL,
    generationConfig: { responseMimeType: "application/json" },
  });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

/**
 * Geração de imagem com Nano Banana (gemini-2.5-flash-image)
 * Retorna { buffer: Buffer, mimeType: string }
 * Use para: capas de entregáveis, banners, ilustrações
 */
async function geminiImage(prompt) {
  const model = genAI.getGenerativeModel({
    model: IMAGE_MODEL,
    generationConfig: { responseModalities: ["IMAGE", "TEXT"] },
  });

  const result = await model.generateContent(prompt);
  const parts = result.response.candidates?.[0]?.content?.parts || [];

  for (const part of parts) {
    if (part.inlineData?.mimeType?.startsWith("image/")) {
      return {
        buffer: Buffer.from(part.inlineData.data, "base64"),
        mimeType: part.inlineData.mimeType,
      };
    }
  }
  throw new Error("Nano Banana não retornou imagem");
}

module.exports = { geminiFlash, geminiPro, geminiChat, geminiJson, geminiImage };
