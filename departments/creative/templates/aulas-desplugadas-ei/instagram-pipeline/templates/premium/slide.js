// Template: SLIDE DE CARROSSEL — Premium
// Preto #000000, tipografia limpa, detalhes finos de laranja. Elegante e minimalista.
// tipo: 'capa' | 'conteudo' | 'cta'
const { destacar, limpar } = require('../../destaque');

// Tipografia oversized: o título se adapta ao comprimento pra dominar o quadro
function tamanhoTitulo(t) {
  const len = String(t || '').replace(/<[^>]+>/g, '').length;
  if (len > 48) return 76;
  if (len > 32) return 90;
  return 106;
}

module.exports = function templateSlide({ tipo, titulo, texto, numero, total, badge = 'Dica do Tatame', emoji = '🥋', mascote = null }) {
  titulo = destacar(titulo, { fallback: true }); // palavra-chave marcada com *asteriscos* vira laranja
  texto  = limpar(texto);

  // Detalhes laranja finos (linha vertical esquerda + risco horizontal no topo) — assinatura do Premium
  const detalhes = `
    <div style="position:absolute;left:0;top:0;width:3px;height:100%;background:linear-gradient(180deg,transparent 0%,#f97316 28%,#f97316 72%,transparent 100%);z-index:3;"></div>
    <div style="position:absolute;top:0;left:0;width:220px;height:2px;background:#f97316;z-index:3;"></div>`;

  const dots = (atual, comMarca = true) => {
    const items = Array.from({ length: total }, (_, i) => {
      const ativo = i + 1 === atual;
      const w  = ativo ? '28px' : '6px';
      const bg = ativo ? '#f97316' : 'rgba(255,255,255,0.16)';
      return `<div style="width:${w};height:6px;border-radius:3px;background:${bg};"></div>`;
    }).join('');
    return `
    <div style="position:absolute;bottom:48px;left:104px;display:flex;align-items:center;gap:8px;z-index:5;">${items}</div>
    ${comMarca ? '<div style="position:absolute;bottom:50px;right:104px;font-size:12px;font-weight:700;color:rgba(255,255,255,0.45);letter-spacing:2px;z-index:5;">@jiujitsudinamicas</div>' : ''}`;
  };

  // ── CAPA ───────────────────────────────────────────────────────────────────
  if (tipo === 'capa') {
    const temMascote = !!mascote;
    if (temMascote) {
      const tam = tamanhoTitulo(titulo);
      return `
<div style="width:1080px;height:1080px;background:#000000;position:relative;overflow:hidden;">
  ${detalhes}

  <!-- PALCO: glow laranja central, contido (linguagem premium) -->
  <div style="position:absolute;bottom:-320px;left:50%;transform:translateX(-50%);width:1000px;height:1000px;background:radial-gradient(circle at center,rgba(249,115,22,0.30) 0%,rgba(249,115,22,0.10) 44%,transparent 70%);z-index:1;pointer-events:none;"></div>
  <div style="position:absolute;top:175px;right:70px;width:140px;height:140px;border:2px solid rgba(249,115,22,0.28);border-radius:50%;z-index:1;"></div>
  <div style="position:absolute;bottom:390px;left:60px;width:90px;height:90px;border:1.5px solid rgba(255,255,255,0.10);border-radius:50%;z-index:1;"></div>

  <!-- TÍTULO GIGANTE centralizado -->
  <div style="position:absolute;top:192px;left:50px;width:980px;z-index:2;font-size:${tam}px;font-weight:900;color:#ffffff;line-height:0.98;letter-spacing:-3px;text-align:center;text-shadow:0 10px 40px rgba(0,0,0,0.55);">${titulo}</div>

  <!-- MASCOTE central -->
  <img src="${mascote}" style="position:absolute;bottom:6px;left:50%;transform:translateX(-50%);height:712px;z-index:3;filter:drop-shadow(0 18px 44px rgba(0,0,0,0.65));">

  <!-- SELO premium (borda fina) -->
  <div style="position:absolute;top:88px;left:104px;transform:rotate(-3deg);border:1.5px solid #f97316;border-radius:6px;padding:13px 28px;z-index:5;background:rgba(249,115,22,0.10);">
    <span style="font-size:15px;font-weight:800;color:#f97316;letter-spacing:4px;text-transform:uppercase;">${emoji}  ${badge}</span>
  </div>

  <!-- @ no topo direito -->
  <div style="position:absolute;top:104px;right:104px;font-size:14px;font-weight:700;color:rgba(255,255,255,0.45);letter-spacing:2px;z-index:5;">@jiujitsudinamicas</div>

  <!-- SUBTÍTULO em pílula de vidro -->
  <div style="position:absolute;bottom:150px;left:64px;max-width:330px;background:rgba(20,20,28,0.55);border:1px solid rgba(255,255,255,0.16);border-radius:16px;padding:22px 26px;z-index:5;backdrop-filter:blur(3px);">
    <span style="font-size:24px;color:#d4d4d8;line-height:1.5;">${texto}</span>
  </div>

  <!-- ARRASTA -->
  <div style="position:absolute;bottom:160px;right:84px;display:flex;align-items:center;gap:14px;z-index:5;background:rgba(249,115,22,0.12);border:1.5px solid rgba(249,115,22,0.5);border-radius:50px;padding:16px 28px;">
    <span style="font-size:14px;font-weight:700;color:#f97316;letter-spacing:4px;text-transform:uppercase;">Arrasta</span>
    <svg width="30" height="19" viewBox="0 0 28 18" fill="none">
      <path d="M0 9H24M24 9L16 1M24 9L16 17" stroke="#f97316" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </div>

  ${dots(1, false)}
</div>`;
    }
    return `
<div style="width:1080px;height:1080px;background:#000000;position:relative;overflow:hidden;display:flex;flex-direction:column;justify-content:center;padding:0 104px;">
  ${detalhes}
  <div style="position:absolute;top:0;right:0;width:560px;height:560px;background:radial-gradient(ellipse at top right,rgba(249,115,22,0.14) 0%,transparent 62%);z-index:1;"></div>

  <!-- Label categoria -->
  <div style="font-size:12px;font-weight:700;color:#f97316;letter-spacing:5px;text-transform:uppercase;margin-bottom:46px;z-index:4;">${emoji}&nbsp;&nbsp;${badge}</div>

  <!-- Título -->
  <div style="font-size:78px;font-weight:900;color:#ffffff;line-height:0.98;letter-spacing:-2.5px;margin-bottom:36px;z-index:4;">${titulo}</div>

  <!-- Divisor fino -->
  <div style="width:72px;height:2px;background:#f97316;margin-bottom:42px;z-index:4;"></div>

  <!-- Subtítulo -->
  <div style="font-size:27px;color:#a1a1aa;line-height:1.6;max-width:820px;font-weight:400;z-index:4;">${texto}</div>

  <!-- ARRASTA -->
  <div style="position:absolute;bottom:104px;right:104px;display:flex;align-items:center;gap:14px;z-index:5;">
    <span style="font-size:12px;font-weight:700;color:#f97316;letter-spacing:4px;text-transform:uppercase;">Arrasta</span>
    <svg width="28" height="16" viewBox="0 0 28 18" fill="none">
      <path d="M0 9H24M24 9L16 1M24 9L16 17" stroke="#f97316" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </div>

  ${dots(1)}
</div>`;
  }

  // ── CONTEÚDO ───────────────────────────────────────────────────────────────
  if (tipo === 'conteudo') {
    const passoStr = String(numero - 1).padStart(2, '0');
    return `
<div style="width:1080px;height:1080px;background:#000000;position:relative;overflow:hidden;display:flex;flex-direction:column;justify-content:space-between;padding:120px 104px 128px;">
  ${detalhes}

  <!-- Número decorativo gigante -->
  <div style="position:absolute;top:50%;right:8px;transform:translateY(-50%);font-size:540px;font-weight:900;line-height:1;z-index:1;color:rgba(255,255,255,0.05);user-select:none;">${numero}</div>

  <!-- TOPO: passo -->
  <div style="display:flex;align-items:baseline;gap:16px;z-index:4;">
    <span style="font-size:36px;font-weight:900;color:#f97316;letter-spacing:1px;">${passoStr}</span>
    <span style="font-size:13px;font-weight:700;color:rgba(255,255,255,0.34);letter-spacing:3px;text-transform:uppercase;">de ${total - 2}</span>
  </div>

  <!-- MEIO: título + corpo -->
  <div style="z-index:4;">
    <div style="font-size:74px;font-weight:900;color:#ffffff;line-height:0.98;letter-spacing:-2.5px;margin-bottom:30px;">${titulo}</div>
    <div style="width:64px;height:3px;background:#f97316;margin-bottom:34px;"></div>
    <div style="font-size:31px;color:#a1a1aa;line-height:1.62;max-width:780px;font-weight:400;">${texto}</div>
  </div>

  <!-- BASE: assinatura -->
  <div style="display:flex;align-items:center;gap:14px;z-index:4;">
    <div style="width:46px;height:3px;background:#f97316;"></div>
    <span style="font-size:17px;font-weight:700;color:#71717a;letter-spacing:1.5px;">@jiujitsudinamicas</span>
  </div>

  ${dots(numero, false)}
</div>`;
  }

  // ── CTA ────────────────────────────────────────────────────────────────────
  if (tipo === 'cta') {
    if (mascote) {
      const tam = tamanhoTitulo(titulo);
      return `
<div style="width:1080px;height:1080px;background:#000000;position:relative;overflow:hidden;">
  ${detalhes}

  <!-- PALCO: glow laranja central -->
  <div style="position:absolute;bottom:-320px;left:50%;transform:translateX(-50%);width:1000px;height:1000px;background:radial-gradient(circle at center,rgba(249,115,22,0.30) 0%,rgba(249,115,22,0.10) 44%,transparent 70%);z-index:1;pointer-events:none;"></div>
  <div style="position:absolute;top:175px;right:70px;width:140px;height:140px;border:2px solid rgba(249,115,22,0.28);border-radius:50%;z-index:1;"></div>
  <div style="position:absolute;bottom:390px;left:60px;width:90px;height:90px;border:1.5px solid rgba(255,255,255,0.10);border-radius:50%;z-index:1;"></div>

  <!-- TÍTULO GIGANTE centralizado -->
  <div style="position:absolute;top:192px;left:50px;width:980px;z-index:2;font-size:${tam}px;font-weight:900;color:#ffffff;line-height:0.98;letter-spacing:-3px;text-align:center;text-shadow:0 10px 40px rgba(0,0,0,0.55);">${titulo}</div>

  <!-- MASCOTE central -->
  <img src="${mascote}" style="position:absolute;bottom:6px;left:50%;transform:translateX(-50%);height:712px;z-index:3;filter:drop-shadow(0 18px 44px rgba(0,0,0,0.65));">

  <!-- SELO premium -->
  <div style="position:absolute;top:88px;left:104px;transform:rotate(-3deg);border:1.5px solid #f97316;border-radius:6px;padding:13px 28px;z-index:5;background:rgba(249,115,22,0.10);">
    <span style="font-size:15px;font-weight:800;color:#f97316;letter-spacing:4px;text-transform:uppercase;">${emoji}  ${badge}</span>
  </div>

  <!-- @ no topo direito -->
  <div style="position:absolute;top:104px;right:104px;font-size:14px;font-weight:700;color:rgba(255,255,255,0.45);letter-spacing:2px;z-index:5;">@jiujitsudinamicas</div>

  <!-- TEXTO em pílula de vidro -->
  <div style="position:absolute;bottom:150px;left:64px;max-width:330px;background:rgba(20,20,28,0.55);border:1px solid rgba(255,255,255,0.16);border-radius:16px;padding:22px 26px;z-index:5;backdrop-filter:blur(3px);">
    <span style="font-size:24px;color:#d4d4d8;line-height:1.5;">${texto}</span>
  </div>

  <!-- BOTÃO herói -->
  <div style="position:absolute;bottom:150px;right:64px;display:inline-flex;align-items:center;gap:16px;background:#f97316;border-radius:50px;padding:24px 36px;z-index:5;box-shadow:0 16px 40px rgba(249,115,22,0.40);">
    <span style="font-size:25px;font-weight:900;color:#000000;letter-spacing:0.5px;">Salva esse carrossel</span>
    <svg width="30" height="20" viewBox="0 0 28 18" fill="none"><path d="M0 9H24M24 9L16 1M24 9L16 17" stroke="#000000" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
  </div>

  ${dots(total, false)}
</div>`;
    }
    return `
<div style="width:1080px;height:1080px;background:#000000;position:relative;overflow:hidden;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;padding:0 104px;">
  ${detalhes}
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:820px;height:820px;background:radial-gradient(ellipse at center,rgba(249,115,22,0.10) 0%,transparent 60%);z-index:1;"></div>

  <!-- Label -->
  <div style="font-size:12px;font-weight:700;color:#f97316;letter-spacing:5px;text-transform:uppercase;margin-bottom:34px;z-index:4;">${emoji}&nbsp;&nbsp;${badge}</div>

  <!-- Título -->
  <div style="font-size:64px;font-weight:900;color:#ffffff;line-height:1.0;letter-spacing:-2px;margin-bottom:30px;max-height:280px;overflow:hidden;z-index:4;">${titulo}</div>

  <!-- Divisor -->
  <div style="width:72px;height:2px;background:#f97316;margin-bottom:34px;z-index:4;"></div>

  <!-- Texto -->
  <div style="font-size:24px;color:#a1a1aa;line-height:1.6;max-width:720px;max-height:160px;overflow:hidden;z-index:4;">${texto}</div>

  <!-- Botão CTA -->
  <div style="position:absolute;bottom:104px;left:104px;right:104px;z-index:5;background:#f97316;border-radius:3px;padding:28px 0;display:flex;align-items:center;justify-content:center;">
    <span style="font-size:27px;font-weight:900;color:#000000;letter-spacing:0.5px;">Salva esse carrossel ➜</span>
  </div>

  ${dots(total)}
</div>`;
  }

  return '<div>Tipo de slide desconhecido</div>';
};
