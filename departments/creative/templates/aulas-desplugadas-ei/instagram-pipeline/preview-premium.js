const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const { getFontStyle } = require('./fonts');

const outputDir = 'C:/Users/Rodrigo Cruz/Downloads/instagram-posts';
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

const posts = [
  {
    nome: 'premium-dica',
    template: require('./templates/premium/dica'),
    fontes: ['poppins-black'],
    conteudo: {
      titulo: '3 formas de manter a atenção das crianças no tatame',
      dica: 'Crianças entre 4 e 8 anos têm janela de atenção de 5 a 10 minutos. Se sua aula não muda o estímulo nesse intervalo, você perde a turma.',
      destaque: 'O que fazer na prática:',
      resposta: '🥋 Troque a atividade a cada 8 minutos\n🎯 Use dinâmicas com nome e regra simples\n🏆 Celebre cada acerto, por menor que seja',
      cta: '💾 Salva esse post e aplica hoje mesmo!',
    },
  },
  {
    nome: 'premium-produto',
    template: require('./templates/premium/produto'),
    fontes: ['poppins-black'],
    conteudo: {
      gancho: 'Você improvisa demais e planeja de menos?',
      problema: 'Turma dispersa em 5 min. Você pedindo silêncio o tempo todo. Concorrente lotado.',
      solucao: '+250 dinâmicas prontas pra aplicar no tatame — ainda hoje.',
      prova: 'Alinhado à BNCC. Funciona de 4 a 14 anos. Resultado na primeira aula.',
      cta: '👇 LINK NA BIO',
      urgencia: '🔥 Oferta por tempo limitado',
    },
  },
  {
    nome: 'premium-motivacional',
    template: require('./templates/premium/motivacional'),
    fontes: ['poppins-black'],
    conteudo: {
      frase: 'Sensei não ensina só golpe. Ensina caráter.',
      contexto: 'A criança vai esquecer a posição de guarda. Mas nunca vai esquecer o professor que acreditou nela quando ela caiu.',
      cta: '🥋 Marca aquele sensei que transforma vidas!',
    },
  },
  {
    nome: 'premium-engajamento',
    template: require('./templates/premium/engajamento'),
    fontes: ['poppins-black'],
    conteudo: {
      pergunta: 'Qual é o maior desafio nas suas aulas?',
      opcoes: ['Manter a atenção 😩', 'Falta de material pronto 📋', 'Turma muito agitada 🌪️', 'Pais exigentes demais 😅'],
      contexto: 'Me conta nos comentários!',
      cta: '💬 Comenta aqui embaixo!',
    },
  },
];

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  for (const p of posts) {
    const bodyHtml = p.template(p.conteudo);
    const fontStyle = getFontStyle(p.fontes);
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">${fontStyle}<style>* { box-sizing:border-box; margin:0; padding:0; font-family:'Poppins-black',Arial,sans-serif; } body { width:1080px; height:1080px; overflow:hidden; }</style></head><body>${bodyHtml}</body></html>`;
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1080 });
    await page.setContent(html, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 600));
    const out = path.join(outputDir, p.nome + '.png');
    await page.screenshot({ path: out, type: 'png' });
    await page.close();
    console.log('OK:', out);
  }
  await browser.close();
})();
