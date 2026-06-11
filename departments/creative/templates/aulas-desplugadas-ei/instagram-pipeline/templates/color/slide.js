// Template: SLIDE DE CARROSSEL — Color (paleta da marca: laranja quente + card branco)
// tipo: 'capa' | 'conteudo' | 'cta'

const { destacar, limpar } = require('../../destaque');

module.exports = function templateSlide({ tipo, titulo, texto, numero, total, badge = 'Dica do Tatame', emoji = '🥋', mascote = null }) {
  titulo = destacar(titulo, { fallback: true }); // palavra-chave marcada com *asteriscos* vira laranja
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
    return `
<div style="width:1080px;height:1080px;background:${BG};position:relative;overflow:hidden;display:flex;flex-direction:column;justify-content:center;align-items:${temMascote ? 'flex-start' : 'center'};padding:80px 60px;">
  ${decor}
  ${temMascote ? `<div style="position:absolute;bottom:0;left:0;width:100%;height:200px;background:linear-gradient(180deg,transparent 0%,rgba(120,40,0,0.16) 100%);z-index:0;"></div><div style="position:absolute;bottom:30px;left:648px;width:350px;height:52px;background:radial-gradient(ellipse at center,rgba(0,0,0,0.30) 0%,transparent 70%);z-index:4;filter:blur(3px);"></div><img src="${mascote}" style="position:absolute;bottom:28px;right:-78px;height:650px;z-index:5;filter:drop-shadow(-12px 16px 20px rgba(0,0,0,0.22));">` : ''}
  <div style="background:rgba(255,255,255,0.97);border-radius:32px;padding:64px 64px;width:100%;max-width:${temMascote ? '660px' : '940px'};box-shadow:0 24px 72px rgba(0,0,0,0.4);position:relative;z-index:3;">
    <div style="display:inline-flex;align-items:center;gap:10px;background:linear-gradient(135deg,#f97316,#ea580c);border-radius:50px;padding:11px 24px;margin-bottom:34px;">
      <span style="font-size:18px;">${emoji}</span>
      <span style="font-size:13px;font-weight:800;color:white;letter-spacing:2.5px;text-transform:uppercase;">${badge}</span>
    </div>
    <div style="font-size:${temMascote ? '56px' : '66px'};font-weight:900;color:#1c1917;line-height:1.0;letter-spacing:-2px;margin-bottom:30px;">${titulo}</div>
    <div style="width:72px;height:5px;background:#f97316;border-radius:3px;margin-bottom:34px;"></div>
    <div style="font-size:${temMascote ? '24px' : '27px'};color:#57534e;line-height:1.6;margin-bottom:40px;">${texto}</div>
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
      return `
<div style="width:1080px;height:1080px;background:${BG};position:relative;overflow:hidden;display:flex;flex-direction:column;justify-content:center;align-items:flex-start;padding:80px 60px;">
  ${decor}
  <div style="position:absolute;bottom:0;left:0;width:100%;height:200px;background:linear-gradient(180deg,transparent 0%,rgba(120,40,0,0.16) 100%);z-index:0;"></div><div style="position:absolute;bottom:30px;left:648px;width:350px;height:52px;background:radial-gradient(ellipse at center,rgba(0,0,0,0.30) 0%,transparent 70%);z-index:4;filter:blur(3px);"></div><img src="${mascote}" style="position:absolute;bottom:28px;right:-78px;height:650px;z-index:5;filter:drop-shadow(-12px 16px 20px rgba(0,0,0,0.22));">
  <div style="background:rgba(255,255,255,0.97);border-radius:32px;padding:60px 60px;width:100%;max-width:640px;box-shadow:0 24px 72px rgba(0,0,0,0.4);position:relative;z-index:3;">
    <div style="font-size:13px;font-weight:800;color:#f97316;letter-spacing:3px;text-transform:uppercase;margin-bottom:22px;">${badge}</div>
    <div style="font-size:50px;font-weight:900;color:#1c1917;line-height:1.04;letter-spacing:-1.5px;margin-bottom:24px;">${titulo}</div>
    <div style="width:64px;height:5px;background:#f97316;border-radius:3px;margin-bottom:28px;"></div>
    <div style="font-size:23px;color:#57534e;line-height:1.6;margin-bottom:36px;">${texto}</div>
    <div style="display:inline-flex;align-items:center;gap:16px;background:linear-gradient(135deg,#f97316,#ea580c);border-radius:50px;padding:22px 40px;width:fit-content;box-shadow:0 12px 28px rgba(234,88,12,0.35);">
      <span style="font-size:26px;font-weight:900;color:white;letter-spacing:0.5px;">Salva esse carrossel</span>
      <svg width="28" height="18" viewBox="0 0 28 18" fill="none"><path d="M0 9H24M24 9L16 1M24 9L16 17" stroke="#ffffff" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </div>
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
