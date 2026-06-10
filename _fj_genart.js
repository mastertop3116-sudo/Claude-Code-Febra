require('dotenv').config();
const fs = require('fs'); const path = require('path');
const OpenAI = require('openai');
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: 180000, maxRetries: 5 });
const DIR = path.join(__dirname, 'assets/festa-junina');
fs.mkdirSync(DIR, { recursive: true });

const STYLE = " Warm vintage rustic Brazilian 'festa junina' (June country festival) style, charming hand-crafted flat illustration with subtle paper texture, warm earthy palette (barn red, mustard yellow, kraft tan, olive green, warm brown). Clean professional, cohesive.";
const ART = [
  ['textura-kraft', false, "A seamless high-resolution warm vintage kraft paper background texture, aged beige and tan tones, subtle paper fibers and gentle stains, soft even lighting, NO objects, NO text — just the paper texture filling the whole frame."],
  ['textura-madeira', false, "A seamless high-resolution rustic wooden planks background texture, warm brown reclaimed wood boards arranged horizontally, cozy country style, soft even lighting, NO objects, NO text."],
  ['girassois', true, "A charming cluster of three bright sunflowers with green leaves, arranged as a corner decoration." + STYLE],
  ['fogueira', true, "A cute stylized bonfire campfire with stacked wooden logs and warm orange flames." + STYLE],
  ['balao', true, "A single colorful traditional Brazilian festa junina paper hot-air balloon (balão de São João) with decorative stripes." + STYLE],
  ['casal-caipira', true, "A cute caipira country couple, a boy and a girl, wearing checkered plaid clothes, straw hats and with freckles, smiling, full body, standing side by side." + STYLE],
  ['milho', true, "A cute smiling corn cob (espiga de milho) with green husk leaves, a face optional, friendly mascot." + STYLE],
  ['sanfona', true, "A traditional accordion (sanfona) musical instrument, the soul of forró music." + STYLE],
  ['chapeu-palha', true, "A country straw hat (chapéu de palha caipira) with a colorful ribbon band." + STYLE],
  ['lampiao', true, "A rustic vintage oil lantern (lampião) glowing warm, country style." + STYLE],
];

async function gen(name, transp, prompt) {
  const opts = { model: 'gpt-image-1', prompt, n: 1, size: '1024x1024', quality: 'high' };
  if (transp) opts.background = 'transparent';
  for (let t = 1; t <= 3; t++) {
    try {
      const r = await client.images.generate(opts);
      const d = r.data[0];
      const buf = d.b64_json ? Buffer.from(d.b64_json, 'base64') : Buffer.from(await (await fetch(d.url)).arrayBuffer());
      fs.writeFileSync(path.join(DIR, name + '.png'), buf);
      console.log('  ✓', name, Math.round(buf.length / 1024) + 'KB');
      return;
    } catch (e) { console.error('  tent', t, name, e.status || '', String(e.message).slice(0, 80)); }
  }
  console.error('  ✗ DESISTI', name);
}
(async () => { for (const [n, tr, p] of ART) await gen(n, tr, p); console.log('FIM arte'); })();
