// Template: DICA DO TATAME — Premium (fundo preto, tipografia limpa, detalhe laranja fino)
module.exports = function templateDica({ titulo, dica, destaque, resposta, cta, mascote = null }) {
  const linhas = (resposta || '').split('\n').map(l => l.trim()).filter(Boolean);
  const linhasHtml = linhas.map(l =>
    `<div style="display:flex;align-items:baseline;gap:16px;margin-bottom:18px;">
      <div style="width:6px;height:6px;border-radius:50%;background:#f97316;flex-shrink:0;margin-top:8px;"></div>
      <span style="font-size:21px;color:#a1a1aa;line-height:1.55;font-weight:400;">${l}</span>
    </div>`
  ).join('');
  return `
<div style="width:1080px;height:1080px;background:#000000;position:relative;overflow:hidden;display:flex;flex-direction:column;justify-content:center;padding:96px 104px;">

  <!-- Detalhe laranja vertical esquerdo -->
  <div style="position:absolute;left:0;top:0;width:3px;height:100%;background:linear-gradient(180deg,transparent 0%,#f97316 30%,#f97316 70%,transparent 100%);"></div>

  <!-- Linha laranja horizontal topo -->
  <div style="position:absolute;top:0;left:0;width:200px;height:2px;background:#f97316;"></div>

  ${mascote ? `<img src="${mascote}" style="position:absolute;bottom:16px;right:-14px;height:440px;z-index:1;filter:drop-shadow(0 12px 28px rgba(0,0,0,0.6));">` : ''}

  <!-- Label categoria -->
  <div style="font-size:11px;font-weight:700;color:#f97316;letter-spacing:4px;text-transform:uppercase;margin-bottom:48px;position:relative;z-index:2;">🥋  DICA DO TATAME</div>

  <!-- Título -->
  <div style="font-size:${mascote ? '56px' : '64px'};font-weight:900;color:#ffffff;line-height:1.0;letter-spacing:-2px;margin-bottom:40px;position:relative;z-index:2;max-width:${mascote ? '640px' : 'none'};">${titulo}</div>

  <!-- Texto da dica -->
  <div style="font-size:21px;color:#71717a;line-height:1.7;margin-bottom:44px;max-width:${mascote ? '560px' : '760px'};border-left:1px solid #27272a;padding-left:24px;position:relative;z-index:2;">${dica}</div>

  <!-- Destaque -->
  <div style="margin-bottom:28px;position:relative;z-index:2;max-width:${mascote ? '600px' : 'none'};">
    <div style="font-size:11px;font-weight:700;color:#f97316;letter-spacing:3px;text-transform:uppercase;margin-bottom:20px;">${destaque}</div>
    ${linhasHtml}
  </div>

  <!-- CTA + marca -->
  <div style="position:absolute;bottom:96px;left:104px;right:104px;display:flex;justify-content:space-between;align-items:center;">
    <span style="font-size:17px;font-weight:600;color:#f97316;">${cta}</span>
    <span style="font-size:11px;font-weight:700;color:#3f3f46;letter-spacing:3px;text-transform:uppercase;">Dinâmicas · Jiu-Jitsu</span>
  </div>

</div>`;
};
