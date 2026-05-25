// Template: DICA DO TATAME — Dark Fighter
// Estética: fundo carvão/preto, texto branco, detalhe laranja neon, sem card branco

module.exports = function templateDica({ titulo, dica, destaque, resposta, cta }) {
  const linhas = (resposta || '').split('\n').map(l => l.trim()).filter(Boolean);
  const linhasHtml = linhas.map(l =>
    `<div style="display:flex;align-items:flex-start;gap:14px;margin-bottom:14px;">
      <div style="width:4px;height:100%;background:#f97316;border-radius:2px;flex-shrink:0;margin-top:4px;"></div>
      <span style="font-size:20px;color:#e2e8f0;line-height:1.5;">${l}</span>
    </div>`
  ).join('');

  return `
<div style="width:1080px;height:1080px;background:#0a0a0f;position:relative;overflow:hidden;display:flex;flex-direction:column;justify-content:center;padding:80px 88px;">

  <!-- Gradiente sutil no canto superior -->
  <div style="position:absolute;top:0;left:0;width:100%;height:340px;background:linear-gradient(180deg,rgba(249,115,22,0.12) 0%,transparent 100%);pointer-events:none;"></div>
  <!-- Gradiente sutil inferior -->
  <div style="position:absolute;bottom:0;right:0;width:500px;height:300px;background:radial-gradient(ellipse at bottom right,rgba(249,115,22,0.08) 0%,transparent 70%);pointer-events:none;"></div>

  <!-- Linha laranja topo -->
  <div style="position:absolute;top:0;left:0;width:100%;height:4px;background:linear-gradient(90deg,#f97316,#ea580c,transparent);"></div>

  <!-- Badge -->
  <div style="display:inline-flex;align-items:center;gap:10px;border:1.5px solid rgba(249,115,22,0.6);border-radius:4px;padding:8px 18px;margin-bottom:36px;width:fit-content;">
    <span style="font-size:16px;">🥋</span>
    <span style="font-size:12px;font-weight:800;color:#f97316;letter-spacing:3px;text-transform:uppercase;">Dica do Tatame</span>
  </div>

  <!-- Título principal -->
  <div style="font-size:62px;font-weight:900;color:#ffffff;line-height:1.0;letter-spacing:-2px;margin-bottom:32px;text-transform:uppercase;">${titulo}</div>

  <!-- Linha separadora -->
  <div style="width:60px;height:3px;background:#f97316;margin-bottom:28px;"></div>

  <!-- Texto da dica -->
  <div style="font-size:20px;color:#94a3b8;line-height:1.65;margin-bottom:36px;max-width:820px;">${dica}</div>

  <!-- Caixa de destaque -->
  <div style="border-left:4px solid #f97316;padding-left:24px;margin-bottom:28px;">
    <div style="font-size:13px;font-weight:800;color:#f97316;letter-spacing:2px;text-transform:uppercase;margin-bottom:16px;">▶ ${destaque}</div>
    ${linhasHtml}
  </div>

  <!-- CTA -->
  <div style="margin-top:8px;">
    <span style="font-size:18px;font-weight:700;color:#f97316;">${cta}</span>
  </div>

  <!-- Marca rodapé -->
  <div style="position:absolute;bottom:40px;right:88px;font-size:13px;font-weight:700;color:rgba(255,255,255,0.25);letter-spacing:2px;text-transform:uppercase;">Dinâmicas · Jiu-Jitsu</div>

</div>`;
};
