// Pré-gera fundos 3D cartoon por tipo e salva no Cloudinary
// Rodar manualmente: node gerar-fundos-cache.js
// Ou via endpoint: GET /instagram-gerar-fundos?secret=...

const OpenAI    = require('openai');
const cloudinary = require('cloudinary').v2;
const fs        = require('fs');
const path      = require('path');
const os        = require('os');

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dpzqkzyj9',
  api_key:    process.env.CLOUDINARY_API_KEY    || '416524232429621',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'MEdpU-cPTaAmCpG3OgRl6-HiGMk',
});

const CACHE_PATH = path.join(__dirname, 'fundos-cache.json');

// Cenas por tipo — combinam com o tom de cada post
const CENAS = {
  motivacional: [
    'a confident jiu-jitsu sensei standing tall with arms crossed in a dark dojo, dramatic orange spotlight from above, powerful stance',
    'a young child in white gi receiving their first belt from a proud sensei, emotional moment, dark background with orange light rays',
    'a row of focused jiu-jitsu children in gi uniforms bowing together in unison, discipline and respect, cinematic dark setting',
    'a jiu-jitsu child raising their fist in victory after winning a match, celebration, dark background, orange and gold energy particles',
    'a sensei and student fist-bumping after an intense training session, bond and trust, warm orange glow in a dark dojo',
  ],
  dica: [
    'a jiu-jitsu sensei demonstrating a technical move step by step to attentive children, instructional close-up, dark background',
    'children carefully practicing a jiu-jitsu guard position on a blue tatame, focused learning, overhead angle, dark gym lighting',
    'a sensei pointing to a whiteboard with jiu-jitsu diagrams while kids pay attention, teaching moment, warm classroom light',
    'close-up of small hands practicing grip on a jiu-jitsu gi sleeve, detailed technique, dark background with orange accent light',
    'a sensei showing the correct posture while a child mirrors it, side-by-side comparison, dark dojo, orange rim lighting',
  ],
  engajamento: [
    'a group of diverse jiu-jitsu children sitting in a circle on the tatame, lively discussion, bright-eyed and engaged, dark gym',
    'a jiu-jitsu sensei asking a question with hand raised while kids eagerly raise their hands to answer, energetic classroom moment',
    'two jiu-jitsu kids debating a technique with big smiles, animated conversation, dark background with orange accent lighting',
    'a group of children in gi uniforms laughing and high-fiving after class, community and fun, warm dark background',
    'a sensei holding up two options on signs while kids point and choose, fun decision game, vibrant dark dojo setting',
  ],
};

async function gerarImagem(cena) {
  const prompt = `3D cartoon render, ${cena}. Pixar-like quality, vibrant orange accents on dark background (#0a0a0f), cinematic shadows, Brazilian jiu-jitsu style. NO text, NO watermarks, NO logos.`;

  const resp = await client.images.generate({
    model: 'gpt-image-1',
    prompt,
    size:  '1024x1024',
    n:     1,
  });

  return resp.data[0].b64_json;
}

async function uploadParaCloudinary(b64, publicId) {
  const tempFile = path.join(os.tmpdir(), `fundo-${Date.now()}.png`);
  fs.writeFileSync(tempFile, Buffer.from(b64, 'base64'));

  const resultado = await cloudinary.uploader.upload(tempFile, {
    public_id: publicId,
    folder:    'jiujitsu-fundos',
    overwrite: true,
  });

  fs.unlinkSync(tempFile);
  return resultado.secure_url;
}

async function gerarTodos() {
  const cache = { motivacional: [], dica: [], engajamento: [] };

  for (const tipo of ['motivacional', 'dica', 'engajamento']) {
    const cenas = CENAS[tipo];
    console.log(`\n[fundos] Gerando ${cenas.length} fundos para tipo: ${tipo}...`);

    for (let i = 0; i < cenas.length; i++) {
      try {
        console.log(`  [${i + 1}/${cenas.length}] Gerando imagem...`);
        const b64 = await gerarImagem(cenas[i]);

        console.log(`  [${i + 1}/${cenas.length}] Enviando para Cloudinary...`);
        const url = await uploadParaCloudinary(b64, `${tipo}-${i + 1}`);

        cache[tipo].push(url);
        console.log(`  [${i + 1}/${cenas.length}] ✅ ${url}`);
      } catch (e) {
        console.error(`  [${i + 1}/${cenas.length}] ❌ Erro: ${e.message}`);
      }
    }
  }

  fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));
  console.log(`\n[fundos] Cache salvo em ${CACHE_PATH}`);
  console.log(`[fundos] Total: ${Object.values(cache).flat().length} imagens`);
  return cache;
}

module.exports = { gerarTodos, CACHE_PATH };

if (require.main === module) {
  require('dotenv').config({ path: path.join(__dirname, '../../../../.env') });
  gerarTodos().catch(e => { console.error(e.message); process.exit(1); });
}
