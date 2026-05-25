// Wrapper para a Instagram Graph API
// Fluxo post único:    criar container → aguardar → publicar
// Fluxo carrossel:     criar child containers → criar carousel container → aguardar → publicar

const axios  = require('axios');
const config = require('./config');

const BASE = 'https://graph.facebook.com/v19.0';

async function criarContainer(imageUrl, caption) {
  const { data } = await axios.post(
    `${BASE}/${config.instagram.accountId}/media`,
    null,
    {
      params: {
        image_url:    imageUrl,
        caption:      caption,
        access_token: config.instagram.accessToken,
      },
    }
  );
  console.log(`[instagram] Container criado: ${data.id}`);
  return data.id;
}

async function criarChildContainer(imageUrl) {
  const { data } = await axios.post(
    `${BASE}/${config.instagram.accountId}/media`,
    null,
    {
      params: {
        image_url:         imageUrl,
        is_carousel_item:  true,
        access_token:      config.instagram.accessToken,
      },
    }
  );
  console.log(`[instagram] Child container criado: ${data.id}`);
  return data.id;
}

async function criarCarouselContainer(childIds, caption) {
  const { data } = await axios.post(
    `${BASE}/${config.instagram.accountId}/media`,
    null,
    {
      params: {
        media_type:   'CAROUSEL',
        children:     childIds.join(','),
        caption:      caption,
        access_token: config.instagram.accessToken,
      },
    }
  );
  console.log(`[instagram] Carousel container criado: ${data.id}`);
  return data.id;
}

async function aguardarContainer(containerId, tentativas = 15, intervaloMs = 3000) {
  for (let i = 0; i < tentativas; i++) {
    const { data } = await axios.get(`${BASE}/${containerId}`, {
      params: {
        fields:       'status_code',
        access_token: config.instagram.accessToken,
      },
    });
    if (data.status_code === 'FINISHED') return;
    if (data.status_code === 'ERROR') throw new Error('Container falhou no processamento.');
    await new Promise(r => setTimeout(r, intervaloMs));
  }
  throw new Error('Timeout aguardando container.');
}

async function publicar(containerId) {
  const { data } = await axios.post(
    `${BASE}/${config.instagram.accountId}/media_publish`,
    null,
    {
      params: {
        creation_id:  containerId,
        access_token: config.instagram.accessToken,
      },
    }
  );
  console.log(`[instagram] Post publicado! ID: ${data.id}`);
  return data.id;
}

async function postar(imageUrl, caption) {
  const containerId = await criarContainer(imageUrl, caption);
  await aguardarContainer(containerId);
  return publicar(containerId);
}

async function postarCarrossel(imageUrls, caption) {
  // 1. Criar um child container por slide
  const childIds = [];
  for (const url of imageUrls) {
    const id = await criarChildContainer(url);
    childIds.push(id);
    await new Promise(r => setTimeout(r, 1000)); // pequeno delay entre criações
  }

  // 2. Criar container do carrossel
  const carouselId = await criarCarouselContainer(childIds, caption);

  // 3. Aguardar processamento
  await aguardarContainer(carouselId);

  // 4. Publicar
  return publicar(carouselId);
}

module.exports = { postar, postarCarrossel };
