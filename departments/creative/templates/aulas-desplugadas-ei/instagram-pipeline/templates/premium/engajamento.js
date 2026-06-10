// Template: ENGAJAMENTO — Premium (opções limpas, sem ruído, editorial)
module.exports = function templateEngajamento({ pergunta, opcoes, contexto, cta, mascote = null }) {
  const letras = ['A', 'B', 'C', 'D'];

  const opcoesList = (opcoes || []).map((opcao, i) => {
    const isFirst = i === 0;
    return `
    <div style="display:flex;align-items:center;gap:24px;padding:20px 0;border-bottom:1px solid #1c1c1e;">
      <span style="font-size:13px;font-weight:900;color:${isFirst ? '#f97316' : '#3f3f46'};width:20px;flex-shrink:0;letter-spacing:1px;">${letras[i]}</span>
      <span style="font-size:20px;color:${isFirst ? '#ffffff' : '#71717a'};font-weight:${isFirst ? '700' : '400'};">${opcao}</span>
    </div>`;
  }).join('');

  return `
<div style="width:1080px;height:1080px;background:#000000;position:relative;overflow:hidden;display:flex;flex-direction:column;justify-content:center;padding:96px 104px;">

  <!-- Detalhe laranja vertical esquerdo -->
  <div style="position:absolute;left:0;top:0;width:3px;height:100%;background:linear-gradient(180deg,transparent 0%,#f97316 30%,#f97316 70%,transparent 100%);"></div>
  <!-- Linha horizontal topo -->
  <div style="position:absolute;top:0;left:0;width:200px;height:2px;background:#f97316;"></div>

  ${mascote ? `<img src="${mascote}" style="position:absolute;bottom:16px;right:-18px;height:410px;z-index:1;filter:drop-shadow(0 12px 28px rgba(0,0,0,0.6));">` : ''}

  <!-- Label -->
  <div style="font-size:11px;font-weight:700;color:#f97316;letter-spacing:4px;text-transform:uppercase;margin-bottom:48px;position:relative;z-index:2;">💬  ME CONTA, SENSEI</div>

  <!-- Pergunta -->
  <div style="font-size:60px;font-weight:900;color:#ffffff;line-height:1.0;letter-spacing:-2px;margin-bottom:8px;text-transform:uppercase;position:relative;z-index:2;max-width:${mascote ? '720px' : 'none'};">${pergunta}</div>

  <!-- Linha laranja -->
  <div style="width:60px;height:2px;background:#f97316;margin-bottom:44px;"></div>

  <!-- Opções estilo lista editorial -->
  <div style="border-top:1px solid #1c1c1e;margin-bottom:36px;position:relative;z-index:2;max-width:${mascote ? '700px' : 'none'};">
    ${opcoesList}
  </div>

  <!-- Contexto + CTA -->
  <div style="display:flex;flex-direction:column;gap:8px;">
    <div style="font-size:16px;color:#3f3f46;line-height:1.6;">${contexto}</div>
    <div style="font-size:16px;font-weight:800;color:#f97316;letter-spacing:0.5px;">${cta}</div>
  </div>

  <!-- Marca rodapé -->
  <div style="position:absolute;bottom:40px;right:104px;font-size:10px;font-weight:700;color:#27272a;letter-spacing:3px;text-transform:uppercase;">@jiujitsudinamicas</div>

</div>`;
};
