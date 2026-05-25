// Faz upload dos 6 slides e posta carrossel no Instagram
const { uploadImagem } = require('./upload');
const { postarCarrossel } = require('./instagram');

const SLIDES = [1,2,3,4,5,6].map(i =>
  `C:\\Users\\Rodrigo Cruz\\Downloads\\v4-slide-${i}.png`
);

const CAPTION = `📚 Você passa semanas escrevendo pareceres que poderiam ficar prontos em minutos.

Com o método certo, professoras de EI estão fechando bimestre sem virar noites.

Arraste para ver o sistema completo 👉

#professora #educacaoinfantil #parecerdescritivo #bncc #professoradeeducacaoinfantil #pedagogia #educação #planejamento #professoras #ensinofundamental`;

(async () => {
  try {
    console.log('Fazendo upload dos slides para Cloudinary...');
    const urls = [];
    for (let i = 0; i < SLIDES.length; i++) {
      const url = await uploadImagem(SLIDES[i]);
      urls.push(url);
      console.log(`  Slide ${i+1}/6 → ${url}`);
    }

    console.log('\nPostando carrossel no Instagram...');
    const postId = await postarCarrossel(urls, CAPTION);
    console.log(`\n✅ Carrossel publicado! ID: ${postId}`);
    console.log(`Ver em: https://www.instagram.com/jiujitsudinamicas/`);
  } catch (e) {
    console.error('Erro:', e.message);
    process.exit(1);
  }
})();
