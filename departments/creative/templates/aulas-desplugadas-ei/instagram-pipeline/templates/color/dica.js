// Template: DICA DO TATAME — Color (azul escuro + laranja vibrante)
module.exports = function templateDica({ titulo, dica, destaque, resposta, cta }) {
  const linhas = (resposta || '').split('\n').map(l => l.trim()).filter(Boolean);
  const linhasHtml = linhas.map(l =>
    `<div style="font-size:17px;color:#555;line-height:1.6;margin-bottom:10px;">• ${l}</div>`
  ).join('');
  return `
<div style="width:1080px;height:1080px;background:linear-gradient(135deg,#0f172a 0%,#1e3a5f 40%,#1d4ed8 80%,#0369a1 100%);position:relative;overflow:hidden;display:flex;flex-direction:column;justify-content:center;align-items:center;padding:52px;">
  <div style="position:absolute;top:-100px;left:-100px;width:400px;height:400px;border-radius:50%;background:rgba(249,115,22,0.12);"></div>
  <div style="position:absolute;bottom:-140px;right:-80px;width:480px;height:480px;border-radius:50%;background:rgba(249,115,22,0.08);"></div>
  <div style="position:absolute;top:60px;left:68px;font-size:44px;opacity:0.8;transform:rotate(-8deg);">🥋</div>
  <div style="position:absolute;top:72px;right:72px;font-size:38px;opacity:0.75;transform:rotate(10deg);">🏆</div>
  <div style="position:absolute;bottom:72px;left:72px;font-size:36px;opacity:0.7;transform:rotate(6deg);">💪</div>
  <div style="position:absolute;bottom:80px;right:68px;font-size:40px;opacity:0.75;transform:rotate(-8deg);">🎯</div>
  <div style="position:absolute;top:220px;right:52px;font-size:30px;opacity:0.6;transform:rotate(15deg);">⚡</div>
  <div style="background:rgba(255,255,255,0.97);border-radius:28px;padding:52px 56px;width:100%;max-width:940px;box-shadow:0 24px 72px rgba(0,0,0,0.4);position:relative;z-index:1;">
    <div style="display:inline-flex;align-items:center;gap:10px;background:linear-gradient(135deg,#f97316,#ea580c);border-radius:50px;padding:10px 22px;margin-bottom:28px;">
      <span style="font-size:16px;">🥋</span>
      <span style="font-size:13px;font-weight:800;color:white;letter-spacing:2px;text-transform:uppercase;">Dica do Tatame</span>
    </div>
    <div style="font-size:46px;font-weight:900;color:#0f172a;line-height:1.05;letter-spacing:-1px;margin-bottom:20px;">${titulo}</div>
    <div style="font-size:18px;color:#444;line-height:1.65;margin-bottom:24px;padding-left:16px;border-left:4px solid #f97316;">${dica}</div>
    <div style="background:linear-gradient(135deg,#fff7ed,#fef3c7);border:2px solid #fed7aa;border-radius:18px;padding:24px 28px;margin-bottom:28px;">
      <div style="font-size:15px;font-weight:800;color:#ea580c;margin-bottom:12px;text-transform:uppercase;letter-spacing:1px;">📌 ${destaque}</div>
      ${linhasHtml}
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;">
      <div style="font-size:17px;font-weight:700;color:#f97316;">${cta}</div>
      <div style="font-size:13px;font-weight:700;color:#aaa;text-align:right;">Dinâmicas de<br>Jiu-Jitsu 🥋</div>
    </div>
  </div>
</div>`;
};
