// Template: SLIDE DE CARROSSEL — Color (paleta da marca: laranja quente + card branco)
// tipo: 'capa' | 'conteudo' | 'cta'

const { destacar, limpar } = require('../../destaque');

// Tipografia oversized: o título se adapta ao comprimento pra dominar o quadro
function tamanhoTitulo(t) {
  const len = String(t || '').replace(/<[^>]+>/g, '').length;
  if (len > 48) return 70;
  if (len > 32) return 84;
  return 96;
}

module.exports = function templateSlide({ tipo, titulo, texto, numero, total, badge = 'Dica do Tatame', emoji = '🥋', mascote = null }) {
  const tituloRaw = titulo;
  titulo = destacar(titulo, { fallback: true }); // destaque laranja (telas com card branco)
  // Nas telas hero (fundo laranja), o destaque é PRETO pra contrastar
  const tituloHero = destacar(tituloRaw, { cor: '#1c1917', fallback: true });
  texto  = limpar(texto);

  const BG = 'linear-gradient(135deg,#fb923c 0%,#f97316 42%,#ea580c 78%,#9a3412 100%)';

  const decor = `
    <div style="position:absolute;top:-110px;right:-90px;width:440px;height:440px;border-radius:50%;background:rgba(255,255,255,0.10);"></div>
    <div style="position:absolute;bottom:-150px;left:-80px;width:500px;height:500px;border-radius:50%;background:rgba(0,0,0,0.06);"></div>
    <div style="position:absolute;top:54px;left:60px;font-size:42px;opacity:0.85;transform:rotate(-9deg);">🥋</div>
    <div style="position:absolute;top:64px;right:66px;font-size:36px;opacity:0.8;transform:rotate(11deg);">🏆</div>
    <div style="position:absolute;bottom:64px;left:64px;font-size:34px;opacity:0.75;transform:rotate(7deg);">💪</div>`;

  const dots = (atual) => {
    const items = Array.from({ length: total }, (_, i) => {
      const ativo = i + 1 === atual;
      const w  = ativo ? '30px' : '8px';
      const bg = ativo ? '#ffffff' : 'rgba(255,255,255,0.4)';
      return `<div style="width:${w};height:8px;border-radius:4px;background:${bg};"></div>`;
    }).join('');
    return `
    <div style="position:absolute;bottom:42px;left:0;width:100%;display:flex;justify-content:center;align-items:center;gap:8px;z-index:5;">${items}</div>
    <div style="position:absolute;bottom:38px;left:52px;font-size:12px;font-weight:800;color:rgba(255,255,255,0.55);letter-spacing:1.5px;z-index:5;">@jiujitsudinamicas</div>`;
  };

  // ── CAPA ───────────────────────────────────────────────────────────────────
  if (tipo === 'capa') {
    const temMascote = !!mascote;
    if (temMascote) {
      const tam = tamanhoTitulo(tituloRaw);
      return `
<div style="width:1080px;height:1080px;background:${BG};position:relative;overflow:hidden;">
  <div style="position:absolute;top:-110px;right:-90px;width:440px;height:440px;border-radius:50%;background:rgba(255,255,255,0.10);"></div>
  <div style="position:absolute;bottom:-150px;left:-80px;width:500px;height:500px;border-radius:50%;background:rgba(0,0,0,0.07);"></div>
  <div style="position:absolute;top:175px;right:70px;width:140px;height:140px;border:3px solid rgba(255,255,255,0.30);border-radius:50%;z-index:1;"></div>
  <div style="position:absolute;bottom:390px;left:60px;width:90px;height:90px;border:2px solid rgba(255,255,255,0.22);border-radius:50%;z-index:1;"></div>

  <!-- PALCO: glow claro central atrás do mascote -->
  <div style="position:absolute;bottom:-300px;left:50%;transform:translateX(-50%);width:1020px;height:1020px;background:radial-gradient(circle at center,rgba(255,236,210,0.55) 0%,rgba(255,236,210,0.18) 44%,transparent 70%);z-index:1;pointer-events:none;"></div>

  <!-- TÍTULO GIGANTE centralizado (branco, destaque preto) -->
  <div style="position:absolute;top:192px;left:50px;width:980px;z-index:2;font-size:${tam}px;font-weight:900;color:#ffffff;line-height:0.96;letter-spacing:-3px;text-transform:uppercase;text-align:center;text-shadow:0 12px 36px rgba(120,40,0,0.45);">${tituloHero}</div>

  <!-- MASCOTE central -->
  <img src="${mascote}" style="position:absolute;bottom:6px;left:50%;transform:translateX(-50%);height:712px;z-index:4;filter:drop-shadow(0 18px 40px rgba(120,40,0,0.45));">

  <!-- SELO branco rotacionado -->
  <div style="position:absolute;top:88px;left:64px;transform:rotate(-3deg);background:#ffffff;border-radius:6px;padding:13px 28px;z-index:5;box-shadow:0 12px 30px rgba(120,40,0,0.30);">
    <span style="font-size:16px;font-weight:900;color:#ea580c;letter-spacing:3px;text-transform:uppercase;">${emoji}  ${badge}</span>
  </div>

  <!-- @ no topo direito -->
  <div style="position:absolute;top:104px;right:64px;font-size:14px;font-weight:800;color:rgba(255,255,255,0.75);letter-spacing:2px;z-index:5;">@jiujitsudinamicas</div>

  <!-- SUBTÍTULO em card branco -->
  <div style="position:absolute;bottom:150px;left:64px;max-width:330px;background:rgba(255,255,255,0.96);border-radius:16px;padding:22px 26px;z-index:5;box-shadow:0 14px 34px rgba(120,40,0,0.28);">
    <span style="font-size:24px;color:#44403c;line-height:1.5;font-weight:600;">${texto}</span>
  </div>

  <!-- ARRASTA -->
  <div style="position:absolute;bottom:160px;right:64px;display:flex;align-items:center;gap:14px;z-index:5;background:rgba(255,255,255,0.18);border:2px solid rgba(255,255,255,0.75);border-radius:50px;padding:16px 28px;">
    <span style="font-size:15px;font-weight:900;color:#ffffff;letter-spacing:3px;text-transform:uppercase;">Arrasta</span>
    <svg width="30" height="19" viewBox="0 0 28 18" fill="none">
      <path d="M0 9H24M24 9L16 1M24 9L16 17" stroke="#ffffff" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </div>

  ${dots(1)}
</div>`;
    }
    return `
<div style="width:1080px;height:1080px;background:${BG};position:relative;overflow:hidden;display:flex;flex-direction:column;justify-content:center;align-items:center;padding:80px 60px;">
  ${decor}
  <div style="background:rgba(255,255,255,0.97);border-radius:32px;padding:64px 64px;width:100%;max-width:940px;box-shadow:0 24px 72px rgba(0,0,0,0.4);position:relative;z-index:3;">
    <div style="display:inline-flex;align-items:center;gap:10px;background:linear-gradient(135deg,#f97316,#ea580c);border-radius:50px;padding:11px 24px;margin-bottom:34px;">
      <span style="font-size:18px;">${emoji}</span>
      <span style="font-size:13px;font-weight:800;color:white;letter-spacing:2.5px;text-transform:uppercase;">${badge}</span>
    </div>
    <div style="font-size:66px;font-weight:900;color:#1c1917;line-height:1.0;letter-spacing:-2px;margin-bottom:30px;">${titulo}</div>
    <div style="width:72px;height:5px;background:#f97316;border-radius:3px;margin-bottom:34px;"></div>
    <div style="font-size:27px;color:#57534e;line-height:1.6;margin-bottom:40px;">${texto}</div>
    <div style="display:flex;align-items:center;justify-content:flex-end;gap:12px;">
      <span style="font-size:13px;font-weight:800;color:#f97316;letter-spacing:3px;text-transform:uppercase;">Arrasta</span>
      <svg width="28" height="18" viewBox="0 0 28 18" fill="none">
        <path d="M0 9H24M24 9L16 1M24 9L16 17" stroke="#f97316" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
  </div>
  ${dots(1)}
</div>`;
  }

  // ── CONTEÚDO ───────────────────────────────────────────────────────────────
  if (tipo === 'conteudo') {
    const passoStr = String(numero - 1).padStart(2, '0');
    return `
<div style="width:1080px;height:1080px;background:${BG};position:relative;overflow:hidden;display:flex;flex-direction:column;justify-content:center;align-items:center;padding:80px 60px;">
  ${decor}
  <div style="background:rgba(255,255,255,0.97);border-radius:32px;padding:60px 64px;width:100%;max-width:940px;box-shadow:0 24px 72px rgba(0,0,0,0.4);position:relative;z-index:1;overflow:hidden;">
    <div style="position:absolute;top:-30px;right:10px;font-size:280px;font-weight:900;line-height:1;color:rgba(249,115,22,0.08);user-select:none;z-index:0;">${numero}</div>
    <div style="position:relative;z-index:1;">
      <div style="display:inline-flex;align-items:center;gap:14px;margin-bottom:28px;">
        <div style="background:linear-gradient(135deg,#f97316,#ea580c);border-radius:8px;padding:8px 18px;">
          <span style="font-size:20px;font-weight:900;color:white;letter-spacing:1px;">${passoStr}</span>
        </div>
        <span style="font-size:13px;font-weight:800;color:#a8a29e;letter-spacing:2.5px;text-transform:uppercase;">de ${total - 2}</span>
      </div>
      <div style="font-size:58px;font-weight:900;color:#1c1917;line-height:1.02;letter-spacing:-1.5px;margin-bottom:28px;">${titulo}</div>
      <div style="width:60px;height:5px;background:#f97316;border-radius:3px;margin-bottom:32px;"></div>
      <div style="font-size:27px;color:#57534e;line-height:1.6;">${texto}</div>
    </div>
  </div>
  ${dots(numero)}
</div>`;
  }

  // ── CTA ────────────────────────────────────────────────────────────────────
  if (tipo === 'cta') {
    if (mascote) {
      const tam = tamanhoTitulo(tituloRaw);
      return `
<div style="width:1080px;height:1080px;background:${BG};position:relative;overflow:hidden;">
  <div style="position:absolute;top:-110px;right:-90px;width:440px;height:440px;border-radius:50%;background:rgba(255,255,255,0.10);"></div>
  <div style="position:absolute;bottom:-150px;left:-80px;width:500px;height:500px;border-radius:50%;background:rgba(0,0,0,0.07);"></div>
  <div style="position:absolute;top:175px;right:70px;width:140px;height:140px;border:3px solid rgba(255,255,255,0.30);border-radius:50%;z-index:1;"></div>
  <div style="position:absolute;bottom:390px;left:60px;width:90px;height:90px;border:2px solid rgba(255,255,255,0.22);border-radius:50%;z-index:1;"></div>

  <!-- PALCO: glow claro central -->
  <div style="position:absolute;bottom:-300px;left:50%;transform:translateX(-50%);width:1020px;height:1020px;background:radial-gradient(circle at center,rgba(255,236,210,0.55) 0%,rgba(255,236,210,0.18) 44%,transparent 70%);z-index:1;pointer-events:none;"></div>

  <!-- TÍTULO GIGANTE centralizado -->
  <div style="position:absolute;top:192px;left:50px;width:980px;z-index:2;font-size:${tam}px;font-weight:900;color:#ffffff;line-height:0.96;letter-spacing:-3px;text-transform:uppercase;text-align:center;text-shadow:0 12px 36px rgba(120,40,0,0.45);">${tituloHero}</div>

  <!-- MASCOTE central -->
  <img src="${mascote}" style="position:absolute;bottom:6px;left:50%;transform:translateX(-50%);height:712px;z-index:4;filter:drop-shadow(0 18px 40px rgba(120,40,0,0.45));">

  <!-- SELO branco rotacionado -->
  <div style="position:absolute;top:88px;left:64px;transform:rotate(-3deg);background:#ffffff;border-radius:6px;padding:13px 28px;z-index:5;box-shadow:0 12px 30px rgba(120,40,0,0.30);">
    <span style="font-size:16px;font-weight:900;color:#ea580c;letter-spacing:3px;text-transform:uppercase;">${emoji}  ${badge}</span>
  </div>

  <!-- @ no topo direito -->
  <div style="position:absolute;top:104px;right:64px;font-size:14px;font-weight:800;color:rgba(255,255,255,0.75);letter-spacing:2px;z-index:5;">@jiujitsudinamicas</div>

  <!-- TEXTO em card branco -->
  <div style="position:absolute;bottom:150px;left:64px;max-width:330px;background:rgba(255,255,255,0.96);border-radius:16px;padding:22px 26px;z-index:5;box-shadow:0 14px 34px rgba(120,40,0,0.28);">
    <span style="font-size:24px;color:#44403c;line-height:1.5;font-weight:600;">${texto}</span>
  </div>

  <!-- BOTÃO herói (branco, texto laranja) -->
  <div style="position:absolute;bottom:150px;right:64px;display:inline-flex;align-items:center;gap:16px;background:#ffffff;border-radius:50px;padding:24px 36px;z-index:5;box-shadow:0 16px 40px rgba(120,40,0,0.35);">
    <span style="font-size:25px;font-weight:900;color:#ea580c;letter-spacing:0.5px;">Salva esse carrossel</span>
    <svg width="30" height="20" viewBox="0 0 28 18" fill="none"><path d="M0 9H24M24 9L16 1M24 9L16 17" stroke="#ea580c" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
  </div>

  ${dots(total)}
</div>`;
    }
    return `
<div style="width:1080px;height:1080px;background:${BG};position:relative;overflow:hidden;display:flex;flex-direction:column;justify-content:center;align-items:center;padding:80px 60px;">
  ${decor}
  <div style="background:rgba(255,255,255,0.97);border-radius:32px;padding:64px 64px;width:100%;max-width:940px;box-shadow:0 24px 72px rgba(0,0,0,0.4);position:relative;z-index:1;text-align:center;">
    <div style="font-size:64px;margin-bottom:24px;line-height:1;">🥋</div>
    <div style="font-size:13px;font-weight:800;color:#f97316;letter-spacing:3px;text-transform:uppercase;margin-bottom:24px;">${badge}</div>
    <div style="font-size:56px;font-weight:900;color:#1c1917;line-height:1.05;letter-spacing:-1.5px;margin-bottom:24px;">${titulo}</div>
    <div style="width:72px;height:5px;background:#f97316;border-radius:3px;margin:0 auto 28px;"></div>
    <div style="font-size:24px;color:#57534e;line-height:1.6;margin-bottom:40px;">${texto}</div>
    <div style="background:linear-gradient(135deg,#f97316,#ea580c);border-radius:50px;padding:22px 0;">
      <span style="font-size:26px;font-weight:900;color:white;letter-spacing:0.5px;">Salva esse carrossel ➜</span>
    </div>
  </div>
  ${dots(total)}
</div>`;
  }

  return '<div>Tipo de slide desconhecido</div>';
};
