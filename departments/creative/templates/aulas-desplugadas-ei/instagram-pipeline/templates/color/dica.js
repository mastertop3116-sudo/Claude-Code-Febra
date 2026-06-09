// Template: DICA DO TATAME — Color (paleta da marca: laranja quente + card branco)
module.exports = function templateDica({ titulo, dica, destaque, resposta, cta, mascote = null }) {
  const m = !!mascote;
  const linhas = (resposta || '').split('\n').map(l => l.trim()).filter(Boolean);
  const linhasHtml = linhas.map(l =>
    `<div style="font-size:17px;color:#57534e;line-height:1.6;margin-bottom:10px;">• ${l}</div>`
  ).join('');
  return `
<div style="width:1080px;height:1080px;background:linear-gradient(135deg,#fb923c 0%,#f97316 42%,#ea580c 78%,#9a3412 100%);position:relative;overflow:hidden;display:flex;flex-direction:column;justify-content:center;align-items:${m ? 'flex-start' : 'center'};padding:52px;">
  <div style="position:absolute;top:-100px;left:-100px;width:400px;height:400px;border-radius:50%;background:rgba(255,255,255,0.10);"></div>
  <div style="position:absolute;bottom:-140px;right:-80px;width:480px;height:480px;border-radius:50%;background:rgba(0,0,0,0.06);"></div>
  ${m ? '' : `<div style="position:absolute;top:60px;left:68px;font-size:44px;opacity:0.85;transform:rotate(-8deg);">🥋</div>
  <div style="position:absolute;top:72px;right:72px;font-size:38px;opacity:0.8;transform:rotate(10deg);">🏆</div>
  <div style="position:absolute;bottom:72px;left:72px;font-size:36px;opacity:0.75;transform:rotate(6deg);">💪</div>
  <div style="position:absolute;bottom:80px;right:68px;font-size:40px;opacity:0.8;transform:rotate(-8deg);">🎯</div>
  <div style="position:absolute;top:220px;right:52px;font-size:30px;opacity:0.65;transform:rotate(15deg);">⚡</div>`}
  ${m ? `<img src="${mascote}" style="position:absolute;bottom:-8px;right:0;height:760px;z-index:2;filter:drop-shadow(0 16px 30px rgba(0,0,0,0.32));">` : ''}
  <div style="background:rgba(255,255,255,0.97);border-radius:28px;padding:${m ? '48px 52px' : '52px 56px'};width:100%;max-width:${m ? '620px' : '940px'};box-shadow:0 24px 72px rgba(0,0,0,0.4);position:relative;z-index:3;">
    <div style="display:inline-flex;align-items:center;gap:10px;background:linear-gradient(135deg,#f97316,#ea580c);border-radius:50px;padding:10px 22px;margin-bottom:26px;">
      <span style="font-size:16px;">🥋</span>
      <span style="font-size:13px;font-weight:800;color:white;letter-spacing:2px;text-transform:uppercase;">Dica do Tatame</span>
    </div>
    <div style="font-size:${m ? '40px' : '46px'};font-weight:900;color:#1c1917;line-height:1.05;letter-spacing:-1px;margin-bottom:20px;">${titulo}</div>
    <div style="font-size:18px;color:#57534e;line-height:1.65;margin-bottom:24px;padding-left:16px;border-left:4px solid #f97316;">${dica}</div>
    <div style="background:linear-gradient(135deg,#fff7ed,#fef3c7);border:2px solid #fed7aa;border-radius:18px;padding:24px 28px;margin-bottom:28px;">
      <div style="font-size:15px;font-weight:800;color:#ea580c;margin-bottom:12px;text-transform:uppercase;letter-spacing:1px;">📌 ${destaque}</div>
      ${linhasHtml}
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;">
      <div style="font-size:17px;font-weight:700;color:#f97316;">${cta}</div>
      <div style="font-size:13px;font-weight:700;color:#a8a29e;text-align:right;">Dinâmicas de<br>Jiu-Jitsu 🥋</div>
    </div>
  </div>
</div>`;
};
