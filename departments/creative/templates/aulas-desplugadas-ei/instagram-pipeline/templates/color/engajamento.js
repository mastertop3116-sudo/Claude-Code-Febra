// Template: ENGAJAMENTO — Color (paleta da marca: laranja quente + card branco, sem azul)
module.exports = function templateEngajamento({ pergunta, opcoes, contexto, cta, mascote = null }) {
  const m = !!mascote;
  const cores = [
    { bg: 'linear-gradient(135deg,#fff7ed,#ffedd5)', border: '#fed7aa', texto: '#ea580c', emoji: '🟠' },
    { bg: 'linear-gradient(135deg,#fffbeb,#fef3c7)', border: '#fde68a', texto: '#ca8a04', emoji: '🟡' },
    { bg: 'linear-gradient(135deg,#fef2f2,#fee2e2)', border: '#fecaca', texto: '#dc2626', emoji: '🔴' },
    { bg: 'linear-gradient(135deg,#fafaf9,#f5f5f4)', border: '#e7e5e4', texto: '#44403c', emoji: '⚫' },
  ];
  const opcoesList = (opcoes || []).map((opcao, i) => {
    const cor = cores[i % cores.length];
    return `<div style="background:${cor.bg};border:2px solid ${cor.border};border-radius:16px;padding:16px 24px;display:flex;align-items:center;gap:14px;">
      <span style="font-size:24px;">${cor.emoji}</span>
      <span style="font-size:17px;font-weight:700;color:${cor.texto};">${opcao}</span>
    </div>`;
  }).join('');
  return `
<div style="width:1080px;height:1080px;background:linear-gradient(135deg,#fb923c 0%,#f97316 42%,#ea580c 78%,#9a3412 100%);position:relative;overflow:hidden;display:flex;flex-direction:column;justify-content:center;align-items:${m ? 'flex-start' : 'center'};padding:52px;">
  <div style="position:absolute;top:-80px;right:-80px;width:380px;height:380px;border-radius:50%;background:rgba(255,255,255,0.10);"></div>
  <div style="position:absolute;bottom:-140px;left:-60px;width:460px;height:460px;border-radius:50%;background:rgba(0,0,0,0.06);"></div>
  ${m ? `<div style="position:absolute;bottom:0;left:0;width:100%;height:200px;background:linear-gradient(180deg,transparent 0%,rgba(120,40,0,0.16) 100%);z-index:0;"></div>` : ''}
  ${m ? '' : `<div style="position:absolute;top:60px;left:68px;font-size:44px;opacity:0.85;transform:rotate(-10deg);">🥋</div>
  <div style="position:absolute;top:72px;right:72px;font-size:38px;opacity:0.8;transform:rotate(12deg);">💬</div>
  <div style="position:absolute;bottom:72px;left:72px;font-size:36px;opacity:0.75;transform:rotate(8deg);">🏆</div>
  <div style="position:absolute;bottom:80px;right:68px;font-size:40px;opacity:0.8;transform:rotate(-8deg);">💪</div>`}
  ${m ? `<div style="position:absolute;bottom:30px;left:648px;width:350px;height:52px;background:radial-gradient(ellipse at center,rgba(0,0,0,0.30) 0%,transparent 70%);z-index:4;filter:blur(3px);"></div>
  <img src="${mascote}" style="position:absolute;bottom:28px;right:-78px;height:650px;z-index:5;filter:drop-shadow(-12px 16px 20px rgba(0,0,0,0.22));">` : ''}
  <div style="background:rgba(255,255,255,0.97);border-radius:28px;padding:${m ? '44px 50px' : '48px 56px'};width:100%;max-width:${m ? '640px' : '940px'};box-shadow:0 24px 72px rgba(0,0,0,0.4);position:relative;z-index:3;">
    <div style="display:inline-flex;align-items:center;gap:10px;background:linear-gradient(135deg,#1c1917,#f97316);border-radius:50px;padding:10px 22px;margin-bottom:24px;">
      <span style="font-size:15px;">💬</span>
      <span style="font-size:13px;font-weight:800;color:white;letter-spacing:2px;text-transform:uppercase;">Me Conta, Sensei!</span>
    </div>
    <div style="font-size:${m ? '36px' : '40px'};font-weight:900;color:#1c1917;line-height:1.1;letter-spacing:-1px;margin-bottom:24px;">${pergunta}</div>
    <div style="display:flex;flex-direction:column;gap:12px;margin-bottom:24px;">${opcoesList}</div>
    <div style="background:linear-gradient(135deg,#fff7ed,#fef3c7);border:2px solid #fed7aa;border-radius:16px;padding:18px 24px;">
      <div style="font-size:16px;color:#92400e;font-weight:600;line-height:1.6;margin-bottom:10px;">${contexto}</div>
      <div style="font-size:16px;font-weight:800;color:#f97316;">${cta}</div>
    </div>
  </div>
</div>`;
};
