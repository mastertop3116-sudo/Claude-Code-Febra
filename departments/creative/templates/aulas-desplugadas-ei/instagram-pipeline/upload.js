// Faz upload de uma imagem local para o Cloudinary
// Retorna a URL pública da imagem

const cloudinary = require('cloudinary').v2;
const config     = require('./config');

cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key:    config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

async function uploadImagem(caminhoLocal) {
  const resultado = await cloudinary.uploader.upload(caminhoLocal, {
    folder:       'instagram-posts',
    resource_type: 'image',
  });
  console.log(`[upload] Imagem enviada: ${resultado.secure_url}`);
  return resultado.secure_url;
}

module.exports = { uploadImagem };
