// Texturas procedurais para fundo dos posts — geradas via CSS/SVG inline
// Compatível com Puppeteer (sem arquivos externos)

const textures = {

  // ── HALFTONE AZUL ─────────────────────────────────────────────────────────
  // Grade diagonal de pontos azuis sobre fundo escuro (igual à imagem enviada)
  halftone: `
    <svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" style="position:absolute;top:0;left:0;width:100%;height:100%;z-index:0;">
      <defs>
        <pattern id="halftone" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="12" height="12" fill="#0a0e1f"/>
          <circle cx="6" cy="6" r="3.2" fill="#1a4fa8" opacity="0.85"/>
        </pattern>
        <filter id="hblur">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" result="noise"/>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G"/>
        </filter>
        <radialGradient id="hvignette" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stop-color="transparent"/>
          <stop offset="100%" stop-color="#000000" stop-opacity="0.6"/>
        </radialGradient>
      </defs>
      <rect width="1080" height="1080" fill="url(#halftone)" filter="url(#hblur)"/>
      <rect width="1080" height="1080" fill="url(#hvignette)"/>
    </svg>`,

  // ── CONCRETO ESCURO ────────────────────────────────────────────────────────
  // Ruído fractal tipo cimento/parede — cinza escuro com vinheta suave
  concrete: `
    <svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" style="position:absolute;top:0;left:0;width:100%;height:100%;z-index:0;">
      <defs>
        <filter id="cnoise" x="0%" y="0%" width="100%" height="100%" color-interpolation-filters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="4" seed="5" stitchTiles="stitch" result="noiseOut"/>
          <feColorMatrix type="matrix" values="0 0 0 0 0.13  0 0 0 0 0.13  0 0 0 0 0.14  0 0 0 1 0" in="noiseOut" result="colored"/>
          <feComposite operator="in" in="colored" in2="SourceGraphic"/>
        </filter>
        <radialGradient id="cvignette" cx="50%" cy="50%" r="65%">
          <stop offset="0%" stop-color="#2a2a2e" stop-opacity="0.4"/>
          <stop offset="100%" stop-color="#000000" stop-opacity="0.9"/>
        </radialGradient>
      </defs>
      <rect width="1080" height="1080" fill="#1a1a1e"/>
      <rect width="1080" height="1080" filter="url(#cnoise)" fill="#3a3a3e" opacity="0.9"/>
      <rect width="1080" height="1080" fill="url(#cvignette)"/>
    </svg>`,

  // ── GRUNGE / ARRANHADO ─────────────────────────────────────────────────────
  // Metal escuro com arranhões e imperfeições — estilo tatame pesado
  grunge: `
    <svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" style="position:absolute;top:0;left:0;width:100%;height:100%;z-index:0;">
      <defs>
        <filter id="gnoise" x="0%" y="0%" width="100%" height="100%" color-interpolation-filters="sRGB">
          <feTurbulence type="turbulence" baseFrequency="0.4 0.6" numOctaves="6" seed="12" stitchTiles="stitch" result="turb"/>
          <feColorMatrix type="matrix" values="0 0 0 0 0.06  0 0 0 0 0.06  0 0 0 0 0.06  0 0 0 3 -1.5" in="turb" result="scratched"/>
          <feComposite operator="in" in="scratched" in2="SourceGraphic"/>
        </filter>
        <filter id="glines" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence type="turbulence" baseFrequency="0.01 0.8" numOctaves="2" seed="7" result="lineturb"/>
          <feColorMatrix type="matrix" values="0 0 0 0 0.12  0 0 0 0 0.12  0 0 0 0 0.12  0 0 0 8 -5" in="lineturb"/>
        </filter>
        <radialGradient id="gvignette" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stop-color="#252525" stop-opacity="0.3"/>
          <stop offset="100%" stop-color="#000000" stop-opacity="0.95"/>
        </radialGradient>
      </defs>
      <rect width="1080" height="1080" fill="#111111"/>
      <rect width="1080" height="1080" filter="url(#gnoise)" fill="#888888" opacity="0.7"/>
      <rect width="1080" height="1080" filter="url(#glines)" fill="#cccccc" opacity="0.15"/>
      <rect width="1080" height="1080" fill="url(#gvignette)"/>
    </svg>`,

};

// Retorna o SVG de textura e a cor de fundo base para o container
function getTexture(nome) {
  return textures[nome] || textures.grunge;
}

module.exports = { getTexture, textures };
