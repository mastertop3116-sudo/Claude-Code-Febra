// Gera as imagens 3D cartoon (Pixar style) da oferta de NATAÇÃO com gpt-image-2.
// 3 mascotes (1 por nível) + professor + turma de kids + pódio. Fundo branco puro (recorta depois com rembg).
//   node gerar-imgs-natacao.js                 -> gera todas
//   node gerar-imgs-natacao.js iniciante prof  -> só as escolhidas
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const OUT = path.join(__dirname, 'assets', 'natacao');
fs.mkdirSync(OUT, { recursive: true });

const MODEL = process.env.IMG_MODEL || 'gpt-image-2';
const SIZE  = process.env.IMG_SIZE  || '2048x2048';   // alta resolução (zoom pesado sem quadricular)

// Base de estilo comum (mesma "cara" do reference: 3D Pixar, brilhante, vibrante, fundo branco)
const STYLE = `Cute 3D rendered cartoon, Pixar / Disney Animation movie style, glossy polished render, smooth rounded shapes, big expressive friendly eyes, vibrant saturated colors, soft studio lighting, subtle soft shadow. Plain solid pure white background (#ffffff), no text, no words, no letters, no logo, no watermark.`;

const IMGS = {
  // ── 1 mascote por NÍVEL (criança nadadora) ──
  iniciante: `${STYLE} A happy little kid beginner swimmer, around 6 years old, wearing a light cyan swim cap and cyan swimming goggles on the forehead, bright orange inflatable arm floaties (water wings) and a colorful kickboard (swim board) hugged to the chest. Standing at the edge of a pool, excited and a little nervous, big joyful smile. Full body, centered.`,
  intermediario: `${STYLE} A confident kid swimmer, around 9 years old, wearing a royal blue swim cap and blue swimming goggles, dynamic mid-freestyle swimming pose with one arm reaching forward, splashing water droplets around, cheerful focused expression. Full body, centered.`,
  avancado: `${STYLE} A competitive kid swimmer athlete, around 11 years old, wearing a dark navy blue swim cap and sleek racing goggles, athletic ready-to-race crouched start pose, a shiny gold medal around the neck, determined confident smile. Full body, centered.`,

  // ── 3 ilustrações (capas dos bônus + capa do pack) ──
  professor: `${STYLE} A friendly adult swimming coach / instructor, fit and approachable, wearing a royal blue coach polo shirt, a silver whistle on a lanyard around the neck, swimming goggles resting on the head, holding a clipboard with a pencil, giving a thumbs up, warm big smile. Full body, centered.`,
  kids: `${STYLE} A joyful group of five diverse little kids swimmers together in a swimming pool, wearing colorful swim caps (pink, yellow, cyan, green) and goggles, splashing water happily, laughing, having fun, pool noodles and a rubber duck floating nearby. Group composition, centered.`,
  podio: `${STYLE} A three-step winners podium for kids: the lowest step is green, the middle step is yellow, the tallest step is dark navy blue. A cute cartoon kid swimmer (swim cap + goggles) celebrating happily on each step, arms raised. A shiny gold trophy on top. Colorful, fun, no numbers, no text. Centered composition.`,
};

(async () => {
  const alvo = process.argv.slice(2);
  const nomes = alvo.length ? alvo : Object.keys(IMGS);
  console.log(`>>> Gerando ${nomes.length} imagem(ns) de natação (${MODEL}, ${SIZE}, quality high)`);
  for (const nome of nomes) {
    const prompt = IMGS[nome];
    if (!prompt) { console.log('  desconhecida:', nome); continue; }
    process.stdout.write(`  ${nome}... `);
    try {
      const r = await client.images.generate({ model: MODEL, prompt, n: 1, size: SIZE, quality: 'high' });
      const buf = Buffer.from(r.data[0].b64_json, 'base64');
      fs.writeFileSync(path.join(OUT, `nat-${nome}.png`), buf);
      console.log('OK', Math.round(buf.length / 1024) + 'KB');
    } catch (e) { console.log('ERRO:', e.message); }
  }
  console.log('Pronto. Pasta:', OUT);
  try { require('./utils/catalogoImagens').catalogar(); console.log('Catálogo de imagens atualizado.'); } catch (_) {}
})();
