// Template: SLIDE DE CARROSSEL — Dark Fighter
// tipo: 'capa' | 'conteudo' | 'cta'
const { getTexture } = require('../../textures');

module.exports = function templateSlide({ tipo, titulo, texto, numero, total, textura = 'grunge', badge = 'Dica do Tatame', emoji = '🥋' }) {

  const overlay = (extra = '') => `
  ${getTexture(textura)}
  <div style="position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(10,10,15,0.46);z-index:1;pointer-events:none;"></div>
  <div style="position:absolute;top:0;left:0;width:100%;height:4px;background:linear-gradient(90deg,#f97316,#ea580c,transparent);z-index:3;"></div>
  ${extra}`;

  const dots = (atual) => {
    const items = Array.from({length: total}, (_, i) => {
      const ativo = i + 1 === atual;
      const w = ativo ? '32px' : '8px';
      const bg = ativo ? '#f97316' : 'rgba(255,255,255,0.18)';
      return `<div style="width:${w};height:8px;border-radius:4px;background:${bg};"></div>`;
    }).join('');
    return `
    <div style="position:absolute;bottom:44px;left:96px;display:flex;align-items:center;gap:8px;z-index:5;">${items}</div>
    <div style="position:absolute;bottom:48px;right:96px;font-size:11px;font-weight:700;color:rgba(255,255,255,0.15);letter-spacing:2.5px;text-transform:uppercase;z-index:5;">Dinâmicas · Jiu-Jitsu</div>`;
  };

  // ── CAPA ─────────────────────────────────────────────────────────────────
  if (tipo === 'capa') {
    return `
<div style="width:1080px;height:1080px;background:#0a0a0f;position:relative;overflow:hidden;">
  ${overlay(`
  <div style="position:absolute;top:0;right:0;width:680px;height:680px;background:radial-gradient(ellipse at top right,rgba(249,115,22,0.22) 0%,transparent 60%);z-index:2;pointer-events:none;"></div>
  `)}

  <div style="position:absolute;top:0;left:0;width:100%;height:calc(100% - 100px);z-index:4;display:flex;flex-direction:column;justify-content:center;padding:0 96px;">

    <!-- Badge -->
    <div style="display:inline-flex;align-items:center;gap:12px;border:1.5px solid rgba(249,115,22,0.7);border-radius:3px;padding:10px 24px;margin-bottom:52px;width:fit-content;">
      <span style="font-size:18px;">${emoji}</span>
      <span style="font-size:12px;font-weight:800;color:#f97316;letter-spacing:3.5px;text-transform:uppercase;">${badge}</span>
    </div>

    <!-- Título -->
    <div style="font-size:72px;font-weight:900;color:#ffffff;line-height:0.92;letter-spacing:-2.5px;margin-bottom:40px;text-transform:uppercase;">${titulo}</div>

    <!-- Divisor -->
    <div style="width:64px;height:4px;background:#f97316;margin-bottom:44px;"></div>

    <!-- Subtítulo -->
    <div style="font-size:28px;color:#94a3b8;line-height:1.6;max-width:800px;">${texto}</div>
  </div>

  <!-- ARRASTA -->
  <div style="position:absolute;bottom:96px;right:96px;display:flex;align-items:center;gap:14px;z-index:5;">
    <span style="font-size:13px;font-weight:800;color:#f97316;letter-spacing:3px;text-transform:uppercase;">Arrasta</span>
    <svg width="28" height="18" viewBox="0 0 28 18" fill="none">
      <path d="M0 9H24M24 9L16 1M24 9L16 17" stroke="#f97316" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </div>

  ${dots(1)}
</div>`;
  }

  // ── CONTEÚDO ──────────────────────────────────────────────────────────────
  if (tipo === 'conteudo') {
    const passo  = numero - 1;                // 1, 2, 3...
    const passoStr = String(passo).padStart(2, '0'); // "01", "02"...

    return `
<div style="width:1080px;height:1080px;background:#0a0a0f;position:relative;overflow:hidden;">
  ${overlay()}

  <!-- Número decorativo BRANCO transparente — centralizado verticalmente para equilíbrio -->
  <div style="position:absolute;top:50%;right:24px;transform:translateY(-50%);font-size:380px;font-weight:900;line-height:1;z-index:2;pointer-events:none;user-select:none;color:rgba(255,255,255,0.05);">${numero}</div>

  <!-- Gradiente laranja no canto inferior esquerdo — contrapeso ao número -->
  <div style="position:absolute;bottom:0;left:0;width:500px;height:400px;background:radial-gradient(ellipse at bottom left,rgba(249,115,22,0.10) 0%,transparent 65%);z-index:2;pointer-events:none;"></div>

  <!-- Conteúdo centralizado -->
  <div style="position:absolute;top:0;left:0;width:100%;height:calc(100% - 100px);z-index:4;display:flex;flex-direction:column;justify-content:center;padding:0 96px;">

    <!-- Badge de passo — laranja sólido -->
    <div style="display:inline-flex;align-items:center;gap:14px;margin-bottom:32px;width:fit-content;">
      <div style="background:#f97316;border-radius:3px;padding:8px 18px;">
        <span style="font-size:20px;font-weight:900;color:#000000;letter-spacing:1px;">${passoStr}</span>
      </div>
      <span style="font-size:12px;font-weight:800;color:rgba(255,255,255,0.35);letter-spacing:3px;text-transform:uppercase;">DE ${total - 2}</span>
    </div>

    <!-- Título -->
    <div style="font-size:66px;font-weight:900;color:#ffffff;line-height:0.95;letter-spacing:-2.5px;margin-bottom:32px;text-transform:uppercase;">${titulo}</div>

    <!-- Divisor -->
    <div style="width:56px;height:4px;background:#f97316;margin-bottom:40px;"></div>

    <!-- Corpo -->
    <div style="font-size:28px;color:#cbd5e1;line-height:1.65;max-width:840px;">${texto}</div>

  </div>

  ${dots(numero)}
</div>`;
  }

  // ── CTA ───────────────────────────────────────────────────────────────────
  if (tipo === 'cta') {
    return `
<div style="width:1080px;height:1080px;background:#0a0a0f;position:relative;overflow:hidden;">
  ${overlay(`
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:900px;height:900px;background:radial-gradient(ellipse at center,rgba(249,115,22,0.18) 0%,transparent 60%);z-index:2;pointer-events:none;"></div>
  `)}

  <div style="position:absolute;top:0;left:0;width:100%;height:calc(100% - 100px);z-index:4;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;padding:0 96px;">

    <!-- Label -->
    <div style="font-size:13px;font-weight:800;color:#f97316;letter-spacing:3.5px;text-transform:uppercase;margin-bottom:44px;">${emoji}  ${badge}</div>

    <!-- Título -->
    <div style="font-size:76px;font-weight:900;color:#ffffff;line-height:0.92;letter-spacing:-3px;margin-bottom:32px;text-transform:uppercase;">${titulo}</div>

    <!-- Divisor -->
    <div style="width:64px;height:4px;background:#f97316;margin-bottom:44px;"></div>

    <!-- Texto -->
    <div style="font-size:26px;color:#94a3b8;line-height:1.65;max-width:700px;margin-bottom:80px;">${texto}</div>

    <!-- Botão CTA — largura total da área de conteúdo -->
    <div style="background:#f97316;border-radius:4px;padding:30px 0;width:100%;display:flex;align-items:center;justify-content:center;">
      <span style="font-size:28px;font-weight:900;color:#000000;letter-spacing:0.5px;">💾 Salva esse carrossel!</span>
    </div>

  </div>

  ${dots(total)}
</div>`;
  }

  return '<div>Tipo de slide desconhecido</div>';
};
