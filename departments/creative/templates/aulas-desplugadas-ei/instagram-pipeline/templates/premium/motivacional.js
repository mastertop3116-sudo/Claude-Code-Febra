// Template: MOTIVACIONAL — Premium (tipografia maximalista, fundo preto puro, respiro)
module.exports = function templateMotivacional({ frase, contexto, cta }) {
  return `
<div style="width:1080px;height:1080px;background:#000000;position:relative;overflow:hidden;display:flex;flex-direction:column;justify-content:center;padding:96px 104px;">

  <!-- Detalhe laranja vertical esquerdo -->
  <div style="position:absolute;left:0;top:0;width:3px;height:100%;background:linear-gradient(180deg,transparent 0%,#f97316 30%,#f97316 70%,transparent 100%);"></div>
  <!-- Linha horizontal topo -->
  <div style="position:absolute;top:0;left:0;width:200px;height:2px;background:#f97316;"></div>

  <!-- Aspas decorativas grandes -->
  <div style="position:absolute;top:60px;right:80px;font-size:240px;color:#0d0d0d;font-weight:900;line-height:1;font-family:Georgia,serif;pointer-events:none;user-select:none;">"</div>

  <!-- Label -->
  <div style="font-size:11px;font-weight:700;color:#f97316;letter-spacing:4px;text-transform:uppercase;margin-bottom:64px;">🥋  PARA O SENSEI</div>

  <!-- Frase principal -->
  <div style="font-size:80px;font-weight:900;color:#ffffff;line-height:0.95;letter-spacing:-3px;margin-bottom:56px;text-transform:uppercase;position:relative;z-index:1;">${frase}</div>

  <!-- Linha laranja -->
  <div style="width:80px;height:3px;background:#f97316;margin-bottom:44px;"></div>

  <!-- Contexto -->
  <div style="font-size:22px;color:#52525b;line-height:1.75;max-width:820px;margin-bottom:64px;">${contexto}</div>

  <!-- CTA -->
  <div style="display:inline-flex;align-items:center;gap:16px;">
    <div style="width:48px;height:1px;background:#f97316;"></div>
    <span style="font-size:17px;font-weight:700;color:#f97316;letter-spacing:0.5px;">${cta}</span>
  </div>

  <!-- Marca rodapé -->
  <div style="position:absolute;bottom:40px;right:104px;font-size:10px;font-weight:700;color:#27272a;letter-spacing:3px;text-transform:uppercase;">Dinâmicas · Jiu-Jitsu</div>

</div>`;
};
