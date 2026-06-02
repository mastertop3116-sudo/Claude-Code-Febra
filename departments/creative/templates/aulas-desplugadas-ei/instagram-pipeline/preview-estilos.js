// Prévia local dos 3 estilos de carrossel (sem postar, sem IA) — só renderiza PNGs
const path = require('path');
const fs   = require('fs');

const OUT = process.env.PREVIEW_DIR || path.join(process.env.USERPROFILE || '.', 'Downloads', 'avanca-leitor', '__MACOSX');
process.env.IG_OUTPUT_DIR = OUT; // precisa ser setado ANTES de carregar o config

const { gerarCarrossel } = require('./gerar-post');

// Conteúdo de exemplo RICO (testa imagem cheia + overflow)
const slides = [
  { tipo: 'capa', titulo: '6 Erros Que Afastam Crianças do Tatame', texto: 'O 3º acontece em quase toda aula e ninguém percebe a tempo.' },
  { tipo: 'conteudo', numero: 2, titulo: 'Corrigir na Frente da Turma', texto: 'Expor o erro da criança na frente dos colegas faz ela travar e perder a vontade de tentar. Chame de lado, fale baixo e mostre o movimento certo com ela. Em segundos você recupera a confiança.' },
  { tipo: 'conteudo', numero: 3, titulo: 'Aula Longa Demais', texto: 'Criança de 5 anos não segura 50 minutos de foco. Quebre a aula em blocos de 8 a 10 minutos, alternando técnica e brincadeira, e a atenção dispara.' },
  { tipo: 'cta', titulo: 'Salva e Aplica Amanhã', texto: 'Manda pra um sensei que precisa ver isso e salva pra não esquecer na próxima aula.' },
];

const base = { fontes: ['bebas'], textura: 'grunge', badge: 'Erros Comuns', emoji: '🥋', slides };

(async () => {
  for (const estilo of ['dark', 'premium', 'color']) {
    process.env.IG_OUTPUT_DIR = OUT; // gerarCarrossel usa config.posting.outputDir
    console.log(`\n=== Renderizando estilo: ${estilo} ===`);
    const caminhos = await gerarCarrossel({ ...base, estilo });
    // renomeia pra ficar claro
    caminhos.forEach((p, i) => {
      const nome = path.join(OUT, `preview-${estilo}-${i + 1}.png`);
      fs.copyFileSync(p, nome);
      fs.unlinkSync(p);
      console.log('  ->', nome);
    });
  }
  console.log('\nPronto.');
})().catch(e => { console.error('ERRO:', e); process.exit(1); });
