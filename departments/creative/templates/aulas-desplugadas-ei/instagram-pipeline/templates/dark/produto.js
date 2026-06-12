// Template: PRODUTO / OFERTA — Dark Fighter
// Estética: fundo escuro, contraste laranja agressivo, sem card branco
const { getTexture } = require('../../textures');

module.exports = function templateProduto({ gancho, problema, solucao, prova, cta, urgencia, textura = 'grunge' }) {
  return `
<div style="width:1080px;height:1080px;background:#0a0a0f;position:relative;overflow:hidden;display:flex;flex-direction:column;justify-content:center;padding:80px 88px;">

  ${getTexture(textura)}
  <div style="position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(10,10,15,0.60);z-index:1;pointer-events:none;"></div>

  <!-- Gradiente laranja superior -->
  <div style="position:absolute;top:0;right:0;width:600px;height:400px;background:radial-gradient(ellipse at top right,rgba(249,115,22,0.18) 0%,transparent 70%);pointer-events:none;z-index:2;"></div>
  <!-- Gradiente inferior esquerdo -->
  <div style="position:absolute;bottom:0;left:0;width:400px;height:300px;background:radial-gradient(ellipse at bottom left,rgba(249,115,22,0.10) 0%,transparent 70%);pointer-events:none;z-index:2;"></div>

  <!-- Linha laranja topo -->
  <div style="position:absolute;top:0;left:0;width:100%;height:4px;background:linear-gradient(90deg,#f97316,#ea580c,transparent);z-index:3;"></div>

  <div style="position:relative;z-index:4;display:flex;flex-direction:column;justify-content:center;">

    <!-- Badge topo -->
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:40px;">
      <div style="display:inline-flex;align-items:center;gap:10px;border:1.5px solid rgba(249,115,22,0.6);border-radius:4px;padding:8px 18px;">
        <span style="font-size:16px;">🥋</span>
        <span style="font-size:12px;font-weight:800;color:#f97316;letter-spacing:3px;text-transform:uppercase;">Para Senseis e Academias</span>
      </div>
      <div style="text-align:right;">
        <div style="font-size:13px;color:#475569;font-weight:600;text-decoration:line-through;">De R$97</div>
        <div style="font-size:52px;font-weight:900;color:#f97316;line-height:1;letter-spacing:-2px;">R$19,90</div>
      </div>
    </div>

    <!-- Gancho -->
    <div style="font-size:52px;font-weight:900;color:#ffffff;line-height:1.0;letter-spacing:-1.5px;margin-bottom:12px;text-transform:uppercase;">${gancho}</div>

    <!-- Linha -->
    <div style="width:60px;height:3px;background:#f97316;margin-bottom:36px;"></div>

    <!-- Antes / Depois -->
    <div style="display:flex;gap:20px;margin-bottom:32px;">
      <div style="flex:1;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:22px 24px;">
        <div style="font-size:11px;font-weight:800;color:#ef4444;letter-spacing:2px;text-transform:uppercase;margin-bottom:10px;">✕ ANTES</div>
        <div style="font-size:17px;color:#94a3b8;line-height:1.5;">${problema}</div>
      </div>
      <div style="display:flex;align-items:center;color:#334155;font-size:24px;flex-shrink:0;">→</div>
      <div style="flex:1;background:rgba(249,115,22,0.08);border:1px solid rgba(249,115,22,0.3);border-radius:8px;padding:22px 24px;">
        <div style="font-size:11px;font-weight:800;color:#f97316;letter-spacing:2px;text-transform:uppercase;margin-bottom:10px;">✓ DEPOIS</div>
        <div style="font-size:17px;color:#e2e8f0;line-height:1.5;">${solucao}</div>
      </div>
    </div>

    <!-- Prova -->
    <div style="border-left:4px solid #f97316;padding-left:20px;margin-bottom:28px;">
      <div style="font-size:18px;color:#94a3b8;line-height:1.6;">🏆 ${prova}</div>
    </div>

    <!-- Urgência + CTA -->
    <div style="display:flex;justify-content:space-between;align-items:center;">
      <span style="font-size:16px;color:#475569;font-weight:600;">${urgencia}</span>
      <div style="background:#f97316;border-radius:4px;padding:16px 36px;">
        <span style="font-size:17px;font-weight:900;color:#000000;letter-spacing:0.5px;">${cta}</span>
      </div>
    </div>

  </div>

  <!-- Marca rodapé -->
  <div style="position:absolute;bottom:40px;right:88px;font-size:13px;font-weight:700;color:rgba(255,255,255,0.2);letter-spacing:2px;text-transform:uppercase;z-index:4;">@jiujitsudinamicas</div>

</div>`;
};
