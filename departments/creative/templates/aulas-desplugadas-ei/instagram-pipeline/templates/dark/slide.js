// Template: SLIDE DE CARROSSEL — Dark Fighter
// tipo: 'capa' | 'conteudo' | 'cta'
const { getTexture } = require('../../textures');
const { destacar, limpar } = require('../../destaque');

// Tipografia oversized: o título se adapta ao comprimento pra dominar o quadro
function tamanhoTitulo(t) {
  const len = String(t || '').replace(/<[^>]+>/g, '').length;
  if (len > 48) return 76;
  if (len > 32) return 92;
  return 108;
}

module.exports = function templateSlide({ tipo, titulo, texto, numero, total, textura = 'grunge', badge = 'Dica do Tatame', emoji = '🥋', mascote = null }) {
  titulo = destacar(titulo, { fallback: true }); // palavra-chave marcada com *asteriscos* vira laranja
  texto  = limpar(texto);

  const overlay = (extra = '') => `
  ${getTexture(textura)}
  <div style="position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(10,10,15,0.46);z-index:1;pointer-events:none;"></div>
  <div style="position:absolute;top:0;left:0;width:100%;height:4px;background:linear-gradient(90deg,#f97316,#ea580c,transparent);z-index:3;"></div>
  ${extra}`;

  const dots = (atual, comMarca = true) => {
    const items = Array.from({length: total}, (_, i) => {
      const ativo = i + 1 === atual;
      const w = ativo ? '32px' : '8px';
      const bg = ativo ? '#f97316' : 'rgba(255,255,255,0.18)';
      return `<div style="width:${w};height:8px;border-radius:4px;background:${bg};"></div>`;
    }).join('');
    return `
    <div style="position:absolute;bottom:44px;left:96px;display:flex;align-items:center;gap:8px;z-index:5;">${items}</div>
    ${comMarca ? '<div style="position:absolute;bottom:48px;right:96px;font-size:12px;font-weight:700;color:rgba(255,255,255,0.45);letter-spacing:2px;z-index:5;">@jiujitsudinamicas</div>' : ''}`;
  };

  // ── CAPA ─────────────────────────────────────────────────────────────────
  if (tipo === 'capa') {
    const temMascote = !!mascote;
    if (temMascote) {
      const tam = tamanhoTitulo(titulo);
      return `
<div style="width:1080px;height:1080px;background:#0a0a0f;position:relative;overflow:hidden;">
  ${overlay()}

  <!-- PALCO: glow laranja central atrás do mascote -->
  <div style="position:absolute;bottom:-300px;left:50%;transform:translateX(-50%);width:1040px;height:1040px;background:radial-gradient(circle at center,rgba(249,115,22,0.40) 0%,rgba(249,115,22,0.13) 44%,transparent 70%);z-index:2;pointer-events:none;"></div>
  <!-- Formas decorativas -->
  <div style="position:absolute;top:170px;right:64px;width:150px;height:150px;border:3px solid rgba(249,115,22,0.30);border-radius:50%;z-index:2;"></div>
  <div style="position:absolute;bottom:300px;right:120px;width:54px;height:54px;background:rgba(249,115,22,0.20);border-radius:50%;z-index:2;"></div>
  <div style="position:absolute;bottom:380px;left:54px;width:100px;height:100px;border:2px solid rgba(255,255,255,0.10);border-radius:50%;z-index:2;"></div>

  <!-- TÍTULO GIGANTE centralizado (o mascote cobre só o miolo da última linha) -->
  <div style="position:absolute;top:192px;left:50px;width:980px;z-index:3;font-size:${tam}px;font-weight:900;color:#ffffff;line-height:0.96;letter-spacing:-3px;text-transform:uppercase;text-align:center;text-shadow:0 10px 40px rgba(0,0,0,0.55);">${titulo}</div>

  <!-- MASCOTE central, na frente do título -->
  <img src="${mascote}" style="position:absolute;bottom:6px;left:50%;transform:translateX(-50%);height:712px;z-index:4;filter:drop-shadow(0 18px 44px rgba(0,0,0,0.65));">

  <!-- SELO rotacionado (badge) -->
  <div style="position:absolute;top:88px;left:96px;transform:rotate(-3deg);background:#f97316;border-radius:6px;padding:13px 28px;z-index:5;box-shadow:0 12px 30px rgba(249,115,22,0.38);">
    <span style="font-size:16px;font-weight:900;color:#000000;letter-spacing:3px;text-transform:uppercase;">${emoji}  ${badge}</span>
  </div>

  <!-- @ no topo direito -->
  <div style="position:absolute;top:104px;right:96px;font-size:14px;font-weight:700;color:rgba(255,255,255,0.45);letter-spacing:2px;z-index:5;">@jiujitsudinamicas</div>

  <!-- SUBTÍTULO em pílula de vidro (camada da frente) -->
  <div style="position:absolute;bottom:150px;left:64px;max-width:330px;background:rgba(20,20,28,0.55);border:1px solid rgba(255,255,255,0.16);border-radius:16px;padding:22px 26px;z-index:5;backdrop-filter:blur(3px);">
    <span style="font-size:24px;color:#e2e8f0;line-height:1.5;">${texto}</span>
  </div>

  <!-- ARRASTA -->
  <div style="position:absolute;bottom:160px;right:84px;display:flex;align-items:center;gap:14px;z-index:5;background:rgba(249,115,22,0.14);border:1.5px solid rgba(249,115,22,0.55);border-radius:50px;padding:16px 28px;">
    <span style="font-size:15px;font-weight:800;color:#f97316;letter-spacing:3px;text-transform:uppercase;">Arrasta</span>
    <svg width="30" height="19" viewBox="0 0 28 18" fill="none">
      <path d="M0 9H24M24 9L16 1M24 9L16 17" stroke="#f97316" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </div>

  ${dots(1, false)}
</div>`;
    }
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
    <div style="font-size:72px;font-weight:900;color:#ffffff;line-height:0.92;letter-spacing:-2.5px;margin-bottom:36px;text-transform:uppercase;">${titulo}</div>

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

  <!-- Número decorativo BRANCO transparente — preenche a direita -->
  <div style="position:absolute;top:50%;right:8px;transform:translateY(-50%);font-size:500px;font-weight:900;line-height:1;z-index:2;pointer-events:none;user-select:none;color:rgba(255,255,255,0.055);">${numero}</div>

  <!-- Gradiente laranja no canto inferior esquerdo — contrapeso ao número -->
  <div style="position:absolute;bottom:0;left:0;width:520px;height:430px;background:radial-gradient(ellipse at bottom left,rgba(249,115,22,0.12) 0%,transparent 65%);z-index:2;pointer-events:none;"></div>

  <!-- Conteúdo distribuído de cima a baixo (preenche o quadro) -->
  <div style="position:absolute;top:0;left:0;width:100%;height:calc(100% - 100px);z-index:4;display:flex;flex-direction:column;justify-content:space-between;padding:120px 96px 34px;">

    <!-- TOPO: badge de passo — laranja sólido -->
    <div style="display:inline-flex;align-items:center;gap:14px;width:fit-content;">
      <div style="background:#f97316;border-radius:3px;padding:9px 20px;">
        <span style="font-size:22px;font-weight:900;color:#000000;letter-spacing:1px;">${passoStr}</span>
      </div>
      <span style="font-size:13px;font-weight:800;color:rgba(255,255,255,0.35);letter-spacing:3px;text-transform:uppercase;">DE ${total - 2}</span>
    </div>

    <!-- MEIO: título + corpo -->
    <div>
      <div style="font-size:74px;font-weight:900;color:#ffffff;line-height:0.95;letter-spacing:-2.5px;margin-bottom:30px;text-transform:uppercase;">${titulo}</div>
      <div style="width:60px;height:4px;background:#f97316;margin-bottom:34px;"></div>
      <div style="font-size:31px;color:#cbd5e1;line-height:1.6;max-width:780px;">${texto}</div>
    </div>

    <!-- BASE: assinatura -->
    <div style="display:flex;align-items:center;gap:14px;">
      <div style="width:46px;height:4px;background:#f97316;"></div>
      <span style="font-size:17px;font-weight:800;color:rgba(255,255,255,0.34);letter-spacing:1.5px;">@jiujitsudinamicas</span>
    </div>

  </div>

  ${dots(numero, false)}
</div>`;
  }

  // ── CTA ───────────────────────────────────────────────────────────────────
  if (tipo === 'cta') {
    if (mascote) {
      const tam = tamanhoTitulo(titulo);
      return `
<div style="width:1080px;height:1080px;background:#0a0a0f;position:relative;overflow:hidden;">
  ${overlay()}

  <!-- PALCO: glow laranja central -->
  <div style="position:absolute;bottom:-300px;left:50%;transform:translateX(-50%);width:1040px;height:1040px;background:radial-gradient(circle at center,rgba(249,115,22,0.40) 0%,rgba(249,115,22,0.13) 44%,transparent 70%);z-index:2;pointer-events:none;"></div>
  <div style="position:absolute;top:170px;right:64px;width:150px;height:150px;border:3px solid rgba(249,115,22,0.30);border-radius:50%;z-index:2;"></div>
  <div style="position:absolute;bottom:380px;left:54px;width:100px;height:100px;border:2px solid rgba(255,255,255,0.10);border-radius:50%;z-index:2;"></div>

  <!-- TÍTULO GIGANTE centralizado -->
  <div style="position:absolute;top:192px;left:50px;width:980px;z-index:3;font-size:${tam}px;font-weight:900;color:#ffffff;line-height:0.96;letter-spacing:-3px;text-transform:uppercase;text-align:center;text-shadow:0 10px 40px rgba(0,0,0,0.55);">${titulo}</div>

  <!-- MASCOTE central -->
  <img src="${mascote}" style="position:absolute;bottom:6px;left:50%;transform:translateX(-50%);height:712px;z-index:4;filter:drop-shadow(0 18px 44px rgba(0,0,0,0.65));">

  <!-- SELO rotacionado -->
  <div style="position:absolute;top:88px;left:96px;transform:rotate(-3deg);background:#f97316;border-radius:6px;padding:13px 28px;z-index:5;box-shadow:0 12px 30px rgba(249,115,22,0.38);">
    <span style="font-size:16px;font-weight:900;color:#000000;letter-spacing:3px;text-transform:uppercase;">${emoji}  ${badge}</span>
  </div>

  <!-- @ no topo direito -->
  <div style="position:absolute;top:104px;right:96px;font-size:14px;font-weight:700;color:rgba(255,255,255,0.45);letter-spacing:2px;z-index:5;">@jiujitsudinamicas</div>

  <!-- TEXTO em pílula de vidro -->
  <div style="position:absolute;bottom:150px;left:64px;max-width:330px;background:rgba(20,20,28,0.55);border:1px solid rgba(255,255,255,0.16);border-radius:16px;padding:22px 26px;z-index:5;backdrop-filter:blur(3px);">
    <span style="font-size:24px;color:#e2e8f0;line-height:1.5;">${texto}</span>
  </div>

  <!-- BOTÃO herói -->
  <div style="position:absolute;bottom:150px;right:64px;display:inline-flex;align-items:center;gap:16px;background:#f97316;border-radius:50px;padding:24px 36px;z-index:5;box-shadow:0 16px 40px rgba(249,115,22,0.45);">
    <span style="font-size:25px;font-weight:900;color:#000000;letter-spacing:0.5px;">Salva esse carrossel</span>
    <svg width="30" height="20" viewBox="0 0 28 18" fill="none"><path d="M0 9H24M24 9L16 1M24 9L16 17" stroke="#000000" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
  </div>

  ${dots(total, false)}
</div>`;
    }
    return `
<div style="width:1080px;height:1080px;background:#0a0a0f;position:relative;overflow:hidden;">
  ${overlay(`
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:900px;height:900px;background:radial-gradient(ellipse at center,rgba(249,115,22,0.18) 0%,transparent 60%);z-index:2;pointer-events:none;"></div>
  `)}

  <!-- Conteúdo central: ocupa do topo até antes do botão -->
  <div style="position:absolute;top:0;left:0;width:100%;height:780px;z-index:4;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;padding:0 96px;">

    <!-- Label -->
    <div style="font-size:13px;font-weight:800;color:#f97316;letter-spacing:3.5px;text-transform:uppercase;margin-bottom:36px;">${emoji}  ${badge}</div>

    <!-- Título (fonte menor para não transbordar) -->
    <div style="font-size:62px;font-weight:900;color:#ffffff;line-height:0.95;letter-spacing:-2.5px;margin-bottom:28px;text-transform:uppercase;max-height:260px;overflow:hidden;">${titulo}</div>

    <!-- Divisor -->
    <div style="width:64px;height:4px;background:#f97316;margin-bottom:36px;"></div>

    <!-- Texto -->
    <div style="font-size:24px;color:#94a3b8;line-height:1.6;max-width:700px;max-height:160px;overflow:hidden;">${texto}</div>

  </div>

  <!-- Botão CTA fixo no fundo — nunca some -->
  <div style="position:absolute;bottom:100px;left:96px;right:96px;z-index:5;background:#f97316;border-radius:4px;padding:30px 0;display:flex;align-items:center;justify-content:center;">
    <span style="font-size:28px;font-weight:900;color:#000000;letter-spacing:0.5px;">Salva esse carrossel ➜</span>
  </div>

  ${dots(total)}
</div>`;
  }

  return '<div>Tipo de slide desconhecido</div>';
};
