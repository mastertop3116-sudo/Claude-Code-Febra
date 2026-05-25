// Template: PRODUTO — Color (azul + laranja, card branco)
module.exports = function templateProduto({ gancho, problema, solucao, prova, cta, urgencia }) {
  return `
<div style="width:1080px;height:1080px;background:linear-gradient(135deg,#0f172a 0%,#1e3a5f 30%,#f97316 70%,#ea580c 100%);position:relative;overflow:hidden;display:flex;flex-direction:column;justify-content:center;align-items:center;padding:52px;">
  <div style="position:absolute;top:-120px;right:-120px;width:480px;height:480px;border-radius:50%;background:rgba(255,255,255,0.06);"></div>
  <div style="position:absolute;bottom:-160px;left:-80px;width:520px;height:520px;border-radius:50%;background:rgba(255,255,255,0.05);"></div>
  <div style="position:absolute;top:60px;left:68px;font-size:44px;opacity:0.8;transform:rotate(-10deg);">🥋</div>
  <div style="position:absolute;top:72px;right:72px;font-size:38px;opacity:0.75;transform:rotate(12deg);">🏆</div>
  <div style="position:absolute;bottom:72px;left:72px;font-size:36px;opacity:0.7;transform:rotate(8deg);">💪</div>
  <div style="position:absolute;bottom:80px;right:68px;font-size:40px;opacity:0.75;transform:rotate(-6deg);">🎯</div>
  <div style="background:rgba(255,255,255,0.97);border-radius:28px;padding:48px 56px;width:100%;max-width:940px;box-shadow:0 24px 72px rgba(0,0,0,0.4);position:relative;z-index:1;">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:28px;">
      <div style="display:inline-flex;align-items:center;gap:10px;background:linear-gradient(135deg,#1e3a5f,#f97316);border-radius:50px;padding:10px 22px;">
        <span style="font-size:15px;">🥋</span>
        <span style="font-size:13px;font-weight:800;color:white;letter-spacing:2px;text-transform:uppercase;">Para Senseis e Academias</span>
      </div>
      <div style="text-align:right;">
        <div style="font-size:12px;color:#bbb;text-decoration:line-through;font-weight:600;">De R$97</div>
        <div style="font-size:44px;font-weight:900;color:#1e3a5f;line-height:1;letter-spacing:-1px;">R$<span style="color:#f97316;">27</span></div>
      </div>
    </div>
    <div style="font-size:42px;font-weight:900;color:#0f172a;line-height:1.05;letter-spacing:-1px;margin-bottom:18px;">${gancho}</div>
    <div style="display:flex;gap:16px;margin-bottom:22px;">
      <div style="flex:1;background:#fff7ed;border:2px solid #fed7aa;border-radius:16px;padding:18px 20px;">
        <div style="font-size:12px;font-weight:800;color:#ea580c;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:8px;">😩 Antes</div>
        <div style="font-size:15px;color:#555;line-height:1.5;">${problema}</div>
      </div>
      <div style="display:flex;align-items:center;font-size:28px;color:#ccc;flex-shrink:0;">→</div>
      <div style="flex:1;background:#f0f9ff;border:2px solid #bae6fd;border-radius:16px;padding:18px 20px;">
        <div style="font-size:12px;font-weight:800;color:#0369a1;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:8px;">✅ Depois</div>
        <div style="font-size:15px;color:#555;line-height:1.5;">${solucao}</div>
      </div>
    </div>
    <div style="background:linear-gradient(135deg,#fff7ed,#fef3c7);border:2px solid #fed7aa;border-radius:16px;padding:18px 24px;margin-bottom:22px;">
      <div style="font-size:16px;color:#ea580c;font-weight:700;line-height:1.6;">🏆 ${prova}</div>
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;">
      <div style="font-size:16px;color:#555;font-weight:600;">${urgencia}</div>
      <div style="background:linear-gradient(135deg,#f97316,#ea580c);border-radius:50px;padding:14px 32px;">
        <span style="font-size:17px;font-weight:900;color:white;">${cta}</span>
      </div>
    </div>
  </div>
</div>`;
};
