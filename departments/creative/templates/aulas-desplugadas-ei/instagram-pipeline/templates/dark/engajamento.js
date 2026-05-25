// Template: ENGAJAMENTO — Dark Fighter
// Estética: fundo escuro, opções com bordas, linguagem direta de comunidade
const { getTexture } = require('../../textures');

module.exports = function templateEngajamento({ pergunta, opcoes, contexto, cta, textura = 'halftone', bgImage = null }) {
  const estilos = [
    { border: 'rgba(249,115,22,0.5)', bg: 'rgba(249,115,22,0.07)', letra: '#f97316', num: 'A' },
    { border: 'rgba(255,255,255,0.12)', bg: 'rgba(255,255,255,0.04)', letra: '#94a3b8', num: 'B' },
    { border: 'rgba(255,255,255,0.12)', bg: 'rgba(255,255,255,0.04)', letra: '#94a3b8', num: 'C' },
    { border: 'rgba(255,255,255,0.12)', bg: 'rgba(255,255,255,0.04)', letra: '#94a3b8', num: 'D' },
  ];

  const opcoesList = (opcoes || []).map((opcao, i) => {
    const e = estilos[i] || estilos[3];
    return `
      <div style="display:flex;align-items:center;gap:18px;background:${e.bg};border:1.5px solid ${e.border};border-radius:6px;padding:18px 24px;">
        <span style="font-size:15px;font-weight:900;color:${e.letra};width:24px;flex-shrink:0;">${e.num}</span>
        <span style="font-size:19px;color:#e2e8f0;font-weight:600;">${opcao}</span>
      </div>`;
  }).join('');

  const fundo = bgImage
    ? `<img src="data:image/png;base64,${bgImage}" style="position:absolute;top:0;left:0;width:1080px;height:1080px;object-fit:cover;z-index:0;">`
    : getTexture(textura);

  return `
<div style="width:1080px;height:1080px;background:#0a0a0f;position:relative;overflow:hidden;display:flex;flex-direction:column;justify-content:center;padding:80px 88px;">

  ${fundo}
  <div style="position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(10,10,15,0.60);z-index:1;pointer-events:none;"></div>

  <!-- Gradiente laranja sutil -->
  <div style="position:absolute;top:0;left:0;width:100%;height:400px;background:linear-gradient(180deg,rgba(249,115,22,0.09) 0%,transparent 100%);pointer-events:none;z-index:2;"></div>

  <!-- Linha laranja topo -->
  <div style="position:absolute;top:0;left:0;width:100%;height:4px;background:linear-gradient(90deg,#f97316,#ea580c,transparent);z-index:3;"></div>

  <div style="position:relative;z-index:4;display:flex;flex-direction:column;justify-content:center;">

    <!-- Badge -->
    <div style="display:inline-flex;align-items:center;gap:10px;border:1.5px solid rgba(249,115,22,0.5);border-radius:4px;padding:8px 18px;margin-bottom:36px;width:fit-content;">
      <span style="font-size:14px;">💬</span>
      <span style="font-size:12px;font-weight:800;color:#f97316;letter-spacing:3px;text-transform:uppercase;">Me Conta, Sensei</span>
    </div>

    <!-- Pergunta -->
    <div style="font-size:52px;font-weight:900;color:#ffffff;line-height:1.05;letter-spacing:-1.5px;margin-bottom:12px;text-transform:uppercase;">${pergunta}</div>

    <!-- Linha -->
    <div style="width:60px;height:3px;background:#f97316;margin-bottom:36px;"></div>

    <!-- Opções -->
    <div style="display:flex;flex-direction:column;gap:12px;margin-bottom:32px;">
      ${opcoesList}
    </div>

    <!-- Contexto + CTA -->
    <div style="border-left:4px solid rgba(249,115,22,0.4);padding-left:20px;">
      <div style="font-size:17px;color:#64748b;margin-bottom:8px;">${contexto}</div>
      <div style="font-size:17px;font-weight:800;color:#f97316;">${cta}</div>
    </div>

  </div>

  <!-- Marca rodapé -->
  <div style="position:absolute;bottom:40px;right:88px;font-size:13px;font-weight:700;color:rgba(255,255,255,0.2);letter-spacing:2px;text-transform:uppercase;z-index:4;">Dinâmicas · Jiu-Jitsu</div>

</div>`;
};
