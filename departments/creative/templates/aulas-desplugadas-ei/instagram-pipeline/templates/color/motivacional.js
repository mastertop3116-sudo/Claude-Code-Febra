// Template: MOTIVACIONAL — Color (paleta da marca: laranja quente + card branco)
module.exports = function templateMotivacional({ frase, contexto, cta }) {
  return `
<div style="width:1080px;height:1080px;background:linear-gradient(135deg,#fb923c 0%,#f97316 42%,#ea580c 78%,#9a3412 100%);position:relative;overflow:hidden;display:flex;flex-direction:column;justify-content:center;align-items:center;padding:52px;">
  <div style="position:absolute;top:-100px;right:-80px;width:420px;height:420px;border-radius:50%;background:rgba(255,255,255,0.10);"></div>
  <div style="position:absolute;bottom:-160px;left:-80px;width:500px;height:500px;border-radius:50%;background:rgba(0,0,0,0.06);"></div>
  <div style="position:absolute;top:60px;left:68px;font-size:44px;opacity:0.85;transform:rotate(-8deg);">🥋</div>
  <div style="position:absolute;top:72px;right:72px;font-size:38px;opacity:0.8;transform:rotate(10deg);">🏆</div>
  <div style="position:absolute;bottom:72px;left:72px;font-size:36px;opacity:0.75;transform:rotate(6deg);">💪</div>
  <div style="position:absolute;bottom:80px;right:68px;font-size:40px;opacity:0.8;transform:rotate(-8deg);">⭐</div>
  <div style="background:rgba(255,255,255,0.97);border-radius:28px;padding:60px 64px;width:100%;max-width:940px;box-shadow:0 24px 72px rgba(0,0,0,0.4);position:relative;z-index:1;text-align:center;">
    <div style="font-size:72px;margin-bottom:24px;line-height:1;">🥋</div>
    <div style="display:inline-flex;align-items:center;gap:10px;background:linear-gradient(135deg,#f97316,#ea580c);border-radius:50px;padding:10px 24px;margin-bottom:32px;">
      <span style="font-size:14px;">💪</span>
      <span style="font-size:13px;font-weight:800;color:white;letter-spacing:2px;text-transform:uppercase;">Para o Sensei</span>
    </div>
    <div style="font-size:48px;font-weight:900;color:#1c1917;line-height:1.1;letter-spacing:-1px;margin-bottom:28px;">${frase}</div>
    <div style="width:80px;height:4px;background:linear-gradient(135deg,#f97316,#ea580c);border-radius:2px;margin:0 auto 28px;"></div>
    <div style="font-size:20px;color:#57534e;line-height:1.75;margin-bottom:36px;padding:0 20px;">${contexto}</div>
    <div style="display:inline-flex;align-items:center;gap:10px;background:linear-gradient(135deg,#1c1917,#ea580c,#f97316);border-radius:50px;padding:16px 36px;">
      <span style="font-size:17px;font-weight:900;color:white;">${cta}</span>
    </div>
    <div style="margin-top:28px;font-size:13px;font-weight:700;color:#bbb;letter-spacing:1px;">Dinâmicas de Jiu-Jitsu 🥋</div>
  </div>
</div>`;
};
