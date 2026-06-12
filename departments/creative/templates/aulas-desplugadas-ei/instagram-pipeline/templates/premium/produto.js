// Template: PRODUTO — Premium (tipografia limpa, minimal, sem ruído)
module.exports = function templateProduto({ gancho, problema, solucao, prova, cta, urgencia }) {
  return `
<div style="width:1080px;height:1080px;background:#000000;position:relative;overflow:hidden;display:flex;flex-direction:column;justify-content:center;padding:96px 104px;">

  <!-- Detalhe laranja vertical esquerdo -->
  <div style="position:absolute;left:0;top:0;width:3px;height:100%;background:linear-gradient(180deg,transparent 0%,#f97316 30%,#f97316 70%,transparent 100%);"></div>
  <!-- Linha horizontal topo -->
  <div style="position:absolute;top:0;left:0;width:200px;height:2px;background:#f97316;"></div>

  <!-- Label categoria -->
  <div style="font-size:11px;font-weight:700;color:#f97316;letter-spacing:4px;text-transform:uppercase;margin-bottom:48px;">🥋  PARA SENSEIS E ACADEMIAS</div>

  <!-- Preço + gancho lado a lado -->
  <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:40px;gap:40px;">
    <div style="font-size:58px;font-weight:900;color:#ffffff;line-height:1.0;letter-spacing:-2px;flex:1;">${gancho}</div>
    <div style="text-align:right;flex-shrink:0;">
      <div style="font-size:12px;color:#3f3f46;font-weight:600;text-decoration:line-through;letter-spacing:1px;">DE R$97</div>
      <div style="font-size:64px;font-weight:900;color:#f97316;line-height:1;letter-spacing:-3px;">R$19,90</div>
    </div>
  </div>

  <!-- Divisor -->
  <div style="width:100%;height:1px;background:#1c1c1e;margin-bottom:36px;"></div>

  <!-- Antes / Depois compacto -->
  <div style="display:grid;grid-template-columns:1fr 40px 1fr;gap:0;margin-bottom:36px;align-items:stretch;">
    <div style="padding:24px 28px;border:1px solid #1c1c1e;">
      <div style="font-size:10px;font-weight:700;color:#ef4444;letter-spacing:3px;text-transform:uppercase;margin-bottom:12px;">ANTES</div>
      <div style="font-size:17px;color:#52525b;line-height:1.55;">${problema}</div>
    </div>
    <div style="display:flex;align-items:center;justify-content:center;color:#27272a;font-size:20px;">→</div>
    <div style="padding:24px 28px;border:1px solid rgba(249,115,22,0.25);background:rgba(249,115,22,0.04);">
      <div style="font-size:10px;font-weight:700;color:#f97316;letter-spacing:3px;text-transform:uppercase;margin-bottom:12px;">DEPOIS</div>
      <div style="font-size:17px;color:#a1a1aa;line-height:1.55;">${solucao}</div>
    </div>
  </div>

  <!-- Prova social -->
  <div style="font-size:16px;color:#52525b;line-height:1.6;margin-bottom:40px;padding-left:20px;border-left:1px solid #27272a;">🏆 ${prova}</div>

  <!-- CTA + urgência -->
  <div style="display:flex;align-items:center;justify-content:space-between;">
    <span style="font-size:14px;color:#3f3f46;font-weight:600;letter-spacing:0.5px;">${urgencia}</span>
    <div style="background:#f97316;padding:16px 40px;border-radius:2px;">
      <span style="font-size:16px;font-weight:900;color:#000000;letter-spacing:0.5px;">${cta}</span>
    </div>
  </div>

  <!-- Marca rodapé -->
  <div style="position:absolute;bottom:40px;right:104px;font-size:10px;font-weight:700;color:#27272a;letter-spacing:3px;text-transform:uppercase;">@jiujitsudinamicas</div>

</div>`;
};
