// Compatibilidade: todas as chamadas agora usam OpenAI internamente
const { openaiFlash, openaiJson } = require("./openai");

async function geminiFlash(prompt, systemInstruction = null) {
  return openaiFlash(prompt, systemInstruction);
}

async function geminiPro(prompt, systemInstruction = null) {
  return openaiFlash(prompt, systemInstruction);
}

async function geminiJson(prompt, usePro = false) {
  return openaiJson(prompt);
}

function geminiChat(systemInstruction = null, usePro = false) {
  const { openaiFlash: _flash } = require("./openai");
  return {
    sendMessage: async (msg) => ({
      response: { text: () => _flash(msg, systemInstruction) }
    })
  };
}

async function geminiImage(prompt) {
  throw new Error("Geração de imagem via Gemini removida. Use DALL-E 3.");
}

module.exports = { geminiFlash, geminiPro, geminiChat, geminiJson, geminiImage };
