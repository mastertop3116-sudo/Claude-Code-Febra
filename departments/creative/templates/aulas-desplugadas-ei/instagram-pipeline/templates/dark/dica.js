// Template: DICA DO TATAME — Dark Fighter com textura de fundo
const { getTexture } = require('../../textures');

module.exports = function templateDica({ titulo, dica, destaque, resposta, cta, textura = 'grunge' }) {
  const linhas = (resposta || '').split('\n').map(l => l.trim()).filter(Boolean);
  const linhasHtml = linhas.map(l =>
    `<div style="display:flex;align-items:flex-start;gap:14px;margin-bottom:14px;">
      <div style="width:4px;min-height:20px;background:#f97316;border-radius:2px;flex-shrink:0;margin-top:4px;"></div>
      <span style="font-size:20px;color:#e2e8f0;line-height:1.5;">${l}</span>
    </div>`
  ).join('');

  return `
<div style="width:1080px;height:1080px;background:#0a0a0f;position:relative;overflow:hidden;display:flex;flex-direction:column;justify-content:center;padding:80px 88px;">

  ${getTexture(textura)}

  <div style="position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(10,10,15,0.55);z-index:1;pointer-events:none;"></div>
  <div style="position:absolute;top:0;right:0;width:500px;height:350px;background:radial-gradient(ellipse at top right,rgba(249,115,22,0.2) 0%,transparent 70%);z-index:2;pointer-events:none;"></div>
  <div style="position:absolute;top:0;left:0;width:100%;height:4px;background:linear-gradient(90deg,#f97316,#ea580c,transparent);z-index:3;"></div>

  <div style="position:relative;z-index:4;display:flex;flex-direction:column;justify-content:center;">

    <div style="display:inline-flex;align-items:center;gap:10px;border:1.5px solid rgba(249,115,22,0.7);border-radius:4px;padding:8px 18px;margin-bottom:36px;width:fit-content;">
      <span style="font-size:16px;">🥋</span>
      <span style="font-size:12px;font-weight:800;color:#f97316;letter-spacing:3px;text-transform:uppercase;">Dica do Tatame</span>
    </div>

    <div style="font-size:60px;font-weight:900;color:#ffffff;line-height:1.0;letter-spacing:-2px;margin-bottom:28px;text-transform:uppercase;">${titulo}</div>
    <div style="width:60px;height:3px;background:#f97316;margin-bottom:28px;"></div>
    <div style="font-size:19px;color:#94a3b8;line-height:1.65;margin-bottom:32px;max-width:820px;">${dica}</div>

    <div style="border-left:4px solid #f97316;padding-left:24px;margin-bottom:24px;">
      <div style="font-size:12px;font-weight:800;color:#f97316;letter-spacing:2px;text-transform:uppercase;margin-bottom:16px;">▶ ${destaque}</div>
      ${linhasHtml}
    </div>

    <div><span style="font-size:18px;font-weight:700;color:#f97316;">${cta}</span></div>

  </div>

  <div style="position:absolute;bottom:40px;right:88px;font-size:12px;font-weight:700;color:rgba(255,255,255,0.2);letter-spacing:2px;text-transform:uppercase;z-index:4;">Dinâmicas · Jiu-Jitsu</div>
</div>`;
};
