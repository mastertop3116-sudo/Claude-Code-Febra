// Template: SLIDE DE CARROSSEL — Premium
// Preto #000000, tipografia limpa, detalhes finos de laranja. Elegante e minimalista.
// tipo: 'capa' | 'conteudo' | 'cta'

module.exports = function templateSlide({ tipo, titulo, texto, numero, total, badge = 'Dica do Tatame', emoji = '🥋' }) {

  // Detalhes laranja finos (linha vertical esquerda + risco horizontal no topo) — assinatura do Premium
  const detalhes = `
    <div style="position:absolute;left:0;top:0;width:3px;height:100%;background:linear-gradient(180deg,transparent 0%,#f97316 28%,#f97316 72%,transparent 100%);z-index:3;"></div>
    <div style="position:absolute;top:0;left:0;width:220px;height:2px;background:#f97316;z-index:3;"></div>`;

  const dots = (atual) => {
    const items = Array.from({ length: total }, (_, i) => {
      const ativo = i + 1 === atual;
      const w  = ativo ? '28px' : '6px';
      const bg = ativo ? '#f97316' : 'rgba(255,255,255,0.16)';
      return `<div style="width:${w};height:6px;border-radius:3px;background:${bg};"></div>`;
    }).join('');
    return `
    <div style="position:absolute;bottom:48px;left:104px;display:flex;align-items:center;gap:8px;z-index:5;">${items}</div>
    <div style="position:absolute;bottom:50px;right:104px;font-size:10px;font-weight:700;color:rgba(255,255,255,0.18);letter-spacing:3px;text-transform:uppercase;z-index:5;">Dinâmicas · Jiu-Jitsu</div>`;
  };

  // ── CAPA ───────────────────────────────────────────────────────────────────
  if (tipo === 'capa') {
    return `
<div style="width:1080px;height:1080px;background:#000000;position:relative;overflow:hidden;display:flex;flex-direction:column;justify-content:center;padding:0 104px;">
  ${detalhes}
  <div style="position:absolute;top:0;right:0;width:560px;height:560px;background:radial-gradient(ellipse at top right,rgba(249,115,22,0.14) 0%,transparent 62%);z-index:1;"></div>

  <!-- Label categoria -->
  <div style="font-size:12px;font-weight:700;color:#f97316;letter-spacing:5px;text-transform:uppercase;margin-bottom:46px;z-index:4;">${emoji}&nbsp;&nbsp;${badge}</div>

  <!-- Título -->
  <div style="font-size:78px;font-weight:900;color:#ffffff;line-height:0.98;letter-spacing:-2.5px;margin-bottom:40px;z-index:4;">${titulo}</div>

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
<div style="width:1080px;height:1080px;background:#000000;position:relative;overflow:hidden;display:flex;flex-direction:column;justify-content:center;padding:0 104px;">
  ${detalhes}

  <!-- Número decorativo gigante, bem suave -->
  <div style="position:absolute;top:50%;right:40px;transform:translateY(-50%);font-size:400px;font-weight:900;line-height:1;z-index:1;color:rgba(255,255,255,0.035);user-select:none;">${numero}</div>

  <!-- Passo -->
  <div style="display:flex;align-items:baseline;gap:16px;margin-bottom:30px;z-index:4;">
    <span style="font-size:30px;font-weight:900;color:#f97316;letter-spacing:1px;">${passoStr}</span>
    <span style="font-size:12px;font-weight:700;color:rgba(255,255,255,0.34);letter-spacing:3px;text-transform:uppercase;">de ${total - 2}</span>
  </div>

  <!-- Título -->
  <div style="font-size:68px;font-weight:900;color:#ffffff;line-height:0.98;letter-spacing:-2.5px;margin-bottom:32px;z-index:4;">${titulo}</div>

  <!-- Divisor fino -->
  <div style="width:60px;height:2px;background:#f97316;margin-bottom:36px;z-index:4;"></div>

  <!-- Corpo -->
  <div style="font-size:27px;color:#a1a1aa;line-height:1.65;max-width:840px;font-weight:400;z-index:4;">${texto}</div>

  ${dots(numero)}
</div>`;
  }

  // ── CTA ────────────────────────────────────────────────────────────────────
  if (tipo === 'cta') {
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
    <span style="font-size:27px;font-weight:900;color:#000000;letter-spacing:0.5px;">💾 Salva esse carrossel!</span>
  </div>

  ${dots(total)}
</div>`;
  }

  return '<div>Tipo de slide desconhecido</div>';
};
