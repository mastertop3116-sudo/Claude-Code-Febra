// Post avulso — Curiosidade sobre Jiu-Jitsu
// Uso: node postar-curiosidade.js

const config              = require('./config');
const { gerarPost }       = require('./gerar-post');
const { uploadImagem }    = require('./upload');
const { postar }          = require('./instagram');

const entrada = {
  tipo:    'dica',
  estilo:  'dark',
  fontes:  ['anton'],
  textura: 'grunge',
  conteudo: {
    titulo:   '🥋 Você sabia? O Jiu-Jitsu tem mais de 2.500 anos de história',
    dica:     'A arte suave nasceu no Japão feudal como sistema de combate desarmado para samurais. Foi trazida ao Brasil por Mitsuyo Maeda em 1914 — e os irmãos Gracie transformaram o jiu-jitsu num estilo próprio que conquistou o mundo.',
    destaque: '3 curiosidades que poucos sabem:',
    resposta: '🏯 O nome significa literalmente "arte suave" — vencer sem força bruta\n🇧🇷 O Brasil é o único país com estilo próprio reconhecido mundialmente\n🥋 Hoje é ensinado em mais de 150 países e tem mais de 2 milhões de praticantes',
    cta:      '💬 Comenta aqui: faz quanto tempo você pratica jiu-jitsu?',
  },
};

const hashtags = config.marca.hashtags.join(' ');
const caption  = `🥋 Você sabia? O Jiu-Jitsu tem mais de 2.500 anos de história

A arte suave nasceu no Japão feudal como sistema de combate desarmado para samurais. Foi trazida ao Brasil por Mitsuyo Maeda em 1914 — e os irmãos Gracie transformaram o jiu-jitsu num estilo próprio que conquistou o mundo.

3 curiosidades que poucos sabem:
🏯 O nome significa literalmente "arte suave" — vencer sem força bruta
🇧🇷 O Brasil é o único país com estilo próprio reconhecido mundialmente
🌍 Hoje é praticado em mais de 150 países com milhões de atletas

💬 Comenta aqui: faz quanto tempo você pratica jiu-jitsu?

${hashtags}`;

(async () => {
  try {
    console.log('[curiosidade] Gerando imagem...');
    const caminho = await gerarPost(entrada);
    console.log('[curiosidade] Imagem gerada:', caminho);

    console.log('[curiosidade] Fazendo upload para Cloudinary...');
    const url = await uploadImagem(caminho);
    console.log('[curiosidade] URL:', url);

    console.log('[curiosidade] Postando no Instagram...');
    await postar(url, caption);
    console.log('[curiosidade] ✅ Post publicado com sucesso!');
  } catch (e) {
    console.error('[curiosidade] ERRO:', e.message);
    process.exit(1);
  }
})();
