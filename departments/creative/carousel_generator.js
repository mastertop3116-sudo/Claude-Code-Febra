// ============================================
// NEXUS — Carousel Generator
// Transforma conteúdo do entregável em slides PNG
// para Instagram, LinkedIn, YouTube Thumbnail
// ============================================

const { renderCarousel } = require("./render_engine");
const { slideCapa, slideConteudo, slideDestaque, slideCTA } = require("./carousel_templates");

// Extrai uma frase de impacto da conclusão ou dos destaques
function extrairFraseDestaque(conteudo) {
  const conclusao = String(conteudo.conclusao || "");
  const partes = conclusao.split(";").map(p => p.trim()).filter(p => p.length > 40 && p.length < 200);
  if (partes.length > 0) return partes[0];

  // fallback: primeiro destaque de qualquer seção
  for (const sec of (conteudo.secoes || [])) {
    const d = (sec.destaques || []).find(d => d.length > 40 && d.length < 200);
    if (d) return d;
  }
  return null;
}

// Seleciona as melhores seções para virar slides (máx maxSlides)
function selecionarSecoes(secoes, maxSlides) {
  if (!secoes || secoes.length === 0) return [];
  // Prioriza seções com mais destaques (conteúdo mais rico)
  const sorted = [...secoes].sort((a, b) => (b.destaques?.length || 0) - (a.destaques?.length || 0));
  return sorted.slice(0, maxSlides);
}

// config: { tipo, titulo, subtitulo, autor, temaKey, formato, maxSlides, fonteTitulo, fonteCorpo }
// conteudo: objeto retornado por gerarConteudoRico
// Retorna: array de Buffers PNG
async function gerarCarrossel(config, conteudo) {
  const {
    titulo      = "Entregável",
    subtitulo   = "",
    autor       = "Nexus Digital",
    temaKey     = "produtividade",
    formato     = "instagram_feed",
    maxSlides   = 6,
    fonteTitulo = "Anton",
    fonteCorpo  = "Poppins",
  } = config;

  const fonteOpts = { fontTitle: fonteTitulo, fontBody: fonteCorpo };
  const slideHtmls = [];

  // 1. Slide capa
  slideHtmls.push(slideCapa({
    titulo,
    subtitulo: conteudo.capa?.subtitulo || subtitulo,
    autor,
    temaKey,
    badge: conteudo.capa?.tagline || "",
    ...fonteOpts,
  }));

  // 2. Slides de conteúdo (seções selecionadas)
  const secoesEscolhidas = selecionarSecoes(conteudo.secoes, maxSlides - 2);
  const total = secoesEscolhidas.length;

  for (let i = 0; i < secoesEscolhidas.length; i++) {
    const sec = secoesEscolhidas[i];
    slideHtmls.push(slideConteudo({
      titulo:    sec.titulo,
      corpo:     sec.conteudo,
      destaques: sec.destaques,
      numero:    i + 1,
      total,
      temaKey,
      ...fonteOpts,
    }));
  }

  // 3. Slide de destaque (frase de impacto), se houver
  const frase = extrairFraseDestaque(conteudo);
  if (frase) {
    slideHtmls.push(slideDestaque({ frase, autor, temaKey, ...fonteOpts }));
  }

  // 4. Slide CTA final
  slideHtmls.push(slideCTA({
    titulo:    "Gostou do conteúdo?",
    instrucao: "Salve este carrossel e compartilhe com quem precisa deste conteúdo!",
    autor,
    temaKey,
    ...fonteOpts,
  }));

  // Renderiza todos em paralelo com as fontes selecionadas
  const buffers = await renderCarousel(slideHtmls, formato, { fonteTitulo, fonteCorpo });

  return {
    buffers,
    count: buffers.length,
    formato,
  };
}

module.exports = { gerarCarrossel };
