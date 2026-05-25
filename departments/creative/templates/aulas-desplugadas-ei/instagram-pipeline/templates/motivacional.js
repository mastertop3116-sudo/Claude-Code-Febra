// Template: MOTIVACIONAL — Dark Fighter
// Estética: fundo preto, frase em destaque enorme, detalhe laranja, impacto emocional

module.exports = function templateMotivacional({ frase, contexto, cta }) {
  return `
<div style="width:1080px;height:1080px;background:#0a0a0f;position:relative;overflow:hidden;display:flex;flex-direction:column;justify-content:center;padding:80px 88px;">

  <!-- Gradiente sutil central -->
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:800px;height:800px;background:radial-gradient(ellipse at center,rgba(249,115,22,0.07) 0%,transparent 70%);pointer-events:none;"></div>

  <!-- Linha laranja topo -->
  <div style="position:absolute;top:0;left:0;width:100%;height:4px;background:linear-gradient(90deg,#f97316,#ea580c,transparent);"></div>

  <!-- Badge -->
  <div style="display:inline-flex;align-items:center;gap:10px;border:1.5px solid rgba(249,115,22,0.5);border-radius:4px;padding:8px 18px;margin-bottom:52px;width:fit-content;">
    <span style="font-size:14px;">🥋</span>
    <span style="font-size:12px;font-weight:800;color:#f97316;letter-spacing:3px;text-transform:uppercase;">Para o Sensei</span>
  </div>

  <!-- Frase principal — enorme -->
  <div style="font-size:72px;font-weight:900;color:#ffffff;line-height:1.0;letter-spacing:-2.5px;margin-bottom:36px;text-transform:uppercase;">${frase}</div>

  <!-- Linha separadora laranja -->
  <div style="width:80px;height:4px;background:#f97316;margin-bottom:36px;"></div>

  <!-- Contexto -->
  <div style="font-size:22px;color:#64748b;line-height:1.7;max-width:800px;margin-bottom:56px;">${contexto}</div>

  <!-- CTA -->
  <div style="display:inline-flex;align-items:center;gap:12px;">
    <div style="width:40px;height:2px;background:#f97316;"></div>
    <span style="font-size:18px;font-weight:700;color:#f97316;">${cta}</span>
  </div>

  <!-- Marca rodapé -->
  <div style="position:absolute;bottom:40px;right:88px;font-size:13px;font-weight:700;color:rgba(255,255,255,0.2);letter-spacing:2px;text-transform:uppercase;">Dinâmicas · Jiu-Jitsu</div>

</div>`;
};
