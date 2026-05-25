const { uploadImagem } = require('./upload');
const { postarCarrossel } = require('./instagram');

const SLIDES = [1,2,3,4,5,6].map(i =>
  `C:\\Users\\Rodrigo Cruz\\Downloads\\jj-slide-${i}.png`
);

const CAPTION = `Sua turma sai do controle em 5 minutos? 😤

Isso acontece porque improvisar cansa — e não funciona.

Com +250 dinâmicas prontas você mantém as crianças engajadas do aquecimento ao fim da aula. Sem improvisar. Sem estresse.

Arraste para ver como funciona 👉

🥋 Básico: R$10 | Premium R$27 (+ 3 bônus grátis)
🔗 Link na bio para garantir o seu

#jiujitsu #jiujitsuinfantil #sensei #professor #tatame #artesmarciais #jiujitsubrasil #aulainfantil #academia #treinador #jiujitsulife #educacaofisica #bncc #dinamicas #jiujitsukids`;

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
