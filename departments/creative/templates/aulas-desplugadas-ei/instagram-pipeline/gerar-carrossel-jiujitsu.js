// Carrossel Jiu-Jitsu — Dark Fighter
// Usa o template slide.js existente (preto #0a0a0f + laranja #f97316)
// Conteúdo: produto +250 Dinâmicas de Jiu-Jitsu | R$10 básico / R$27 premium

const puppeteer = require('puppeteer');
const templateSlide = require('./templates/dark/slide');

const TOTAL = 6;

const slides = [

  // 1 — CAPA
  templateSlide({
    tipo: 'capa',
    titulo: 'Sua turma sai do controle em 5 minutos?',
    texto: 'Veja o sistema que senseis usam para manter crianças engajadas do aquecimento ao fim da aula.',
    badge: 'Para Senseis e Instrutores',
    emoji: '🥋',
    numero: 1,
    total: TOTAL,
    textura: 'grunge',
  }),

  // 2 — PROBLEMA
  templateSlide({
    tipo: 'conteudo',
    titulo: 'Improvisar cansa. E não funciona.',
    texto: 'Aula sem dinâmica = criança dispersa = pai insatisfeito = aluno que cancela. Você merece uma solução pronta.',
    badge: 'O Problema',
    emoji: '😤',
    numero: 2,
    total: TOTAL,
    textura: 'grunge',
  }),

  // 3 — SOLUÇÃO
  templateSlide({
    tipo: 'conteudo',
    titulo: '+250 dinâmicas prontas para o tatame.',
    texto: 'Jogos de luta, drills de agilidade, aquecimentos temáticos — tudo categorizado. Abre, aplica, a turma engaja.',
    badge: 'A Solução',
    emoji: '📚',
    numero: 3,
    total: TOTAL,
    textura: 'concrete',
  }),

  // 4 — COMO USAR
  templateSlide({
    tipo: 'conteudo',
    titulo: 'Abre. Escolhe. Aplica.',
    texto: 'Funciona offline no celular ou tablet. Sem precisar de internet no tatame. Resultado na primeira aula.',
    badge: 'Como Usar',
    emoji: '📱',
    numero: 4,
    total: TOTAL,
    textura: 'halftone',
  }),

  // 5 — BÔNUS
  templateSlide({
    tipo: 'conteudo',
    titulo: '3 bônus grátis no premium.',
    texto: 'Certificado de Jiu-Jiteiro (R$27) + 20 Jogos de Luta (R$37) + 100 Exercícios de Preparação (R$33). Hoje tudo incluso.',
    badge: 'Bônus Exclusivos',
    emoji: '🎁',
    numero: 5,
    total: TOTAL,
    textura: 'grunge',
  }),

  // 6 — CTA
  templateSlide({
    tipo: 'cta',
    titulo: 'Transforme sua aula hoje.',
    texto: 'Básico R$10 · Premium R$27 · Garantia de 7 dias · Link na bio.',
    badge: 'Oferta Especial',
    emoji: '🥋',
    numero: TOTAL,
    total: TOTAL,
    textura: 'grunge',
  }),

];

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1080 });

  for (let i = 0; i < slides.length; i++) {
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
      <style>* { box-sizing:border-box; margin:0; padding:0; font-family:Arial,Helvetica,sans-serif; }</style>
    </head><body style="width:1080px;height:1080px;overflow:hidden;">${slides[i]}</body></html>`;

    await page.setContent(html, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: `C:\\Users\\Rodrigo Cruz\\Downloads\\jj-slide-${i+1}.png` });
    console.log(`Slide ${i+1}/${TOTAL} ok`);
  }

  await browser.close();
  console.log('Pronto! Slides em C:\\Users\\Rodrigo Cruz\\Downloads\\jj-slide-*.png');
})();
