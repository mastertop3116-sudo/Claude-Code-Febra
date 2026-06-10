// Destaque de palavra-chave nos títulos dos posts.
// A IA marca a expressão mais importante entre *asteriscos*;
// destacar() pinta de laranja no HTML, limpar() remove os asteriscos (p/ legenda).
// Com { fallback: true }, se a IA esquecer de marcar, pinta as 2 últimas palavras
// (só em títulos com 4+ palavras) — garante que todo título tenha o toque laranja.

const COR_PADRAO = '#f97316';

function destacar(texto, { cor = COR_PADRAO, fallback = false } = {}) {
  if (!texto) return '';
  const s = String(texto);
  if (/\*[^*]+\*/.test(s)) {
    return s.replace(/\*([^*]+)\*/g, `<span style="color:${cor};">$1</span>`);
  }
  if (!fallback) return s;
  const palavras = s.trim().split(/\s+/);
  if (palavras.length < 4) return s;
  const inicio = palavras.slice(0, -2).join(' ');
  const fim    = palavras.slice(-2).join(' ');
  return `${inicio} <span style="color:${cor};">${fim}</span>`;
}

function limpar(texto) {
  return String(texto || '').replace(/\*/g, '');
}

module.exports = { destacar, limpar };
