// Gera mascotes 3D cartoon (uma por faixa) com gpt-image-2 e salva em assets/mascotes/.
//   node gerar-mascotes.js azul          -> só a azul (teste)
//   node gerar-mascotes.js               -> todas as faixas
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const OUT = path.join(__dirname, 'assets', 'mascotes');
fs.mkdirSync(OUT, { recursive: true });

const FAIXAS = {
  branca: 'a white belt', cinza: 'a grey belt', amarela: 'a yellow belt', laranja: 'an orange belt',
  verde: 'a green belt', azul: 'a blue belt', roxa: 'a purple belt', marrom: 'a brown belt',
  preta: 'a black belt', vermelha: 'a red belt',
};
const MODEL = process.env.IMG_MODEL || 'gpt-image-2';
const SIZE = process.env.IMG_SIZE || '2048x2048';   // alta resolução nativa (4x mais pixels que 1024)

const prompt = (beltEn) => `A cute 3D rendered cartoon character, Pixar / Disney Animation movie style, of a happy little kid practicing Brazilian jiu-jitsu. The kid wears a clean white gi (jiu-jitsu kimono) tied with ${beltEn} at the waist. Big friendly smile, confident and playful ready stance. Soft studio lighting, glossy polished 3D render, smooth rounded shapes, vibrant colors, subtle soft shadow. Full body, centered, plain solid pure white background (#ffffff), no text, no words, no logo.`;

(async () => {
  const alvo = process.argv.slice(2);
  const faixas = alvo.length ? alvo : Object.keys(FAIXAS);
  for (const fx of faixas) {
    const beltEn = FAIXAS[fx];
    if (!beltEn) { console.log('faixa desconhecida:', fx); continue; }
    process.stdout.write(`gerando ${fx} (${beltEn})... `);
    try {
      const r = await client.images.generate({
        model: MODEL, prompt: prompt(beltEn), n: 1, size: SIZE,
        quality: 'high',
      });
      const buf = Buffer.from(r.data[0].b64_json, 'base64');
      fs.writeFileSync(path.join(OUT, `jj-${fx}.png`), buf);
      console.log('OK', Math.round(buf.length / 1024) + 'KB');
    } catch (e) { console.log('ERRO:', e.message); }
  }
  console.log('Pronto. Pasta:', OUT);
  try { require('./utils/catalogoImagens').catalogar(); console.log('Catálogo de imagens atualizado.'); } catch (_) {}
})();
