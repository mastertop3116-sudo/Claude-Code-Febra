// Gera imagem de fundo 3D cartoon via DALL-E 3
// Usada nos posts únicos (dica, motivacional, engajamento)

const OpenAI = require('openai');

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const CENAS_POR_TIPO = {
  motivacional: [
    'a determined jiu-jitsu sensei standing tall in a dojo, arms crossed, looking confident',
    'a young child in gi uniform bowing with discipline and pride on the tatame',
    'a jiu-jitsu belt being tied around a child waist, close-up dramatic angle',
    'a sensei and student fist-bumping after training, warm lighting',
    'children in jiu-jitsu uniforms standing in a line, focused and proud',
  ],
  dica: [
    'a cartoon jiu-jitsu sensei demonstrating a technique to a small group of children on the mat',
    'children practicing jiu-jitsu rolls on a blue tatame, overhead view',
    'a sensei writing on a whiteboard in a dojo while kids watch attentively',
    'close-up of small hands gripping a jiu-jitsu gi collar during training',
    'kids in gi uniforms laughing and learning on the tatame, energetic scene',
  ],
  engajamento: [
    'a group of animated jiu-jitsu kids raising their hands to answer a question in a dojo',
    'a sensei pointing to a decision board with jiu-jitsu kids debating',
    'cartoon kids in gi sitting in a circle on the tatame discussing something',
    'a jiu-jitsu sensei with a playful expression asking the class a question',
    'diverse group of young jiu-jitsu students in a line sparring match, dynamic energy',
  ],
};

function escolherCena(tipo) {
  const cenas = CENAS_POR_TIPO[tipo] || CENAS_POR_TIPO.motivacional;
  return cenas[Math.floor(Math.random() * cenas.length)];
}

async function gerarFundo(tipo) {
  const cena = escolherCena(tipo);

  const prompt = `3D cartoon render, ${cena}. Dark background (#0a0a0f), vibrant orange accent lighting, cinematic Pixar-like quality, modern athletic aesthetic, dramatic shadows, Brazilian jiu-jitsu style. NO text, NO watermarks, NO logos. Ultra HD.`;

  console.log(`[bg-ia] Gerando fundo 3D cartoon para tipo: ${tipo}...`);

  const resp = await client.images.generate({
    model: 'gpt-image-1',
    prompt,
    size:  '1024x1024',
    n:     1,
  });

  const base64 = resp.data[0].b64_json;
  console.log('[bg-ia] Fundo pronto.');
  return base64;
}

module.exports = { gerarFundo };
