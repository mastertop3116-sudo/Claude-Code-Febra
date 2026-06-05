const puppeteer = require('puppeteer');
const fs = require('fs');

const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<style>
  * { box-sizing:border-box; margin:0; padding:0; font-family:Arial,Helvetica,sans-serif; }
  body { width:1080px; height:1080px; overflow:hidden; }
</style>
</head><body>

<!--
  DESIGN: Estética real da professora de EI brasileira.
  Fundo: gradiente quente vibrante (roxo → coral → amarelo).
  Elementos decorativos: estrelinhas, corações, lápis, livro — a identidade visual dela.
  Copy: linguagem de colega professora que entende a dor, não de produto tech.
  Cores: alegres, quentes, educativas. Nada de dark mode.
-->

<div style="width:1080px;height:1080px;background:linear-gradient(135deg,#7c3aed 0%,#c026d3 28%,#f43f5e 55%,#f97316 78%,#facc15 100%);position:relative;overflow:hidden;display:flex;flex-direction:column;justify-content:space-between;padding:60px 68px;">

  <!-- ── ELEMENTOS DECORATIVOS espalhados ── -->

  <!-- Círculos de fundo grandes (opacidade baixa) -->
  <div style="position:absolute;top:-140px;right:-140px;width:520px;height:520px;border-radius:50%;background:rgba(255,255,255,0.07);pointer-events:none;"></div>
  <div style="position:absolute;bottom:-180px;left:-100px;width:580px;height:580px;border-radius:50%;background:rgba(255,255,255,0.06);pointer-events:none;"></div>

  <!-- Estrelinhas decorativas -->
  <div style="position:absolute;top:80px;right:220px;font-size:36px;opacity:0.7;transform:rotate(15deg);">⭐</div>
  <div style="position:absolute;top:160px;right:120px;font-size:22px;opacity:0.6;transform:rotate(-10deg);">✨</div>
  <div style="position:absolute;top:60px;left:460px;font-size:28px;opacity:0.65;transform:rotate(8deg);">⭐</div>
  <div style="position:absolute;bottom:280px;right:80px;font-size:30px;opacity:0.6;transform:rotate(-5deg);">🌟</div>
  <div style="position:absolute;bottom:180px;right:200px;font-size:20px;opacity:0.55;transform:rotate(20deg);">✨</div>

  <!-- Ícones da professora / EI -->
  <div style="position:absolute;top:96px;right:64px;font-size:48px;opacity:0.75;transform:rotate(8deg);">📚</div>
  <div style="position:absolute;bottom:220px;left:64px;font-size:40px;opacity:0.65;transform:rotate(-12deg);">✏️</div>
  <div style="position:absolute;top:420px;right:52px;font-size:36px;opacity:0.65;transform:rotate(6deg);">🎨</div>
  <div style="position:absolute;bottom:100px;right:84px;font-size:34px;opacity:0.6;transform:rotate(-8deg);">💛</div>
  <div style="position:absolute;top:300px;left:52px;font-size:32px;opacity:0.6;transform:rotate(14deg);">🍎</div>

  <!-- ══ CARTÃO CENTRAL BRANCO — conteúdo principal ══ -->
  <div style="position:relative;z-index:2;background:rgba(255,255,255,0.95);border-radius:28px;padding:52px 60px;display:flex;flex-direction:column;gap:0;box-shadow:0 24px 80px rgba(0,0,0,0.18);">

    <!-- Topo: badge + preço -->
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:32px;">

      <div style="display:flex;align-items:center;gap:10px;background:linear-gradient(135deg,#7c3aed,#c026d3);border-radius:50px;padding:10px 22px;">
        <span style="font-size:16px;">👩‍🏫</span>
        <span style="font-size:13px;font-weight:800;color:white;letter-spacing:1.5px;text-transform:uppercase;">Para Professoras de EI</span>
      </div>

      <div style="text-align:right;">
        <div style="font-size:13px;color:#aaa;font-weight:600;text-decoration:line-through;">De R$197</div>
        <div style="font-size:42px;font-weight:900;line-height:1;color:#7c3aed;letter-spacing:-1px;">R$<span style="color:#f43f5e;">97</span></div>
      </div>
    </div>

    <!-- Headline -->
    <div style="font-size:13px;font-weight:800;color:#f43f5e;text-transform:uppercase;letter-spacing:2.5px;margin-bottom:12px;">✏️ Pareceres Descritivos · BNCC</div>

    <div style="font-size:58px;font-weight:900;color:#1a1a2e;line-height:0.95;letter-spacing:-1.5px;margin-bottom:18px;">
      Chega de virar<br>noites por<br><span style="color:#7c3aed;">pareceres.</span> 💜
    </div>

    <div style="font-size:19px;color:#555;line-height:1.6;margin-bottom:32px;max-width:680px;">
      Você <strong style="color:#1a1a2e;">observa, ama e conhece cada criança.</strong><br>
      Mas escrever do zero, 20 ou 30 vezes, todo bimestre — isso esgota.<br>
      <strong style="color:#7c3aed;">200 blocos descritivos prontos</strong> pra você combinar e finalizar em 10 minutinhos. 🌟
    </div>

    <!-- Stats coloridos -->
    <div style="display:flex;gap:14px;margin-bottom:32px;">

      <div style="flex:1;background:linear-gradient(135deg,#f0e7ff,#fce7f3);border:2px solid #e9d5ff;border-radius:18px;padding:18px 16px;text-align:center;">
        <div style="font-size:36px;font-weight:900;color:#7c3aed;line-height:1;">200</div>
        <div style="font-size:12px;font-weight:800;color:#9333ea;text-transform:uppercase;letter-spacing:1px;margin-top:4px;">blocos prontos</div>
        <div style="font-size:11px;color:#aaa;margin-top:3px;">5 Campos de Exp.</div>
      </div>

      <div style="flex:1;background:linear-gradient(135deg,#fff0e7,#ffe7ea);border:2px solid #fecaca;border-radius:18px;padding:18px 16px;text-align:center;">
        <div style="font-size:36px;font-weight:900;color:#f43f5e;line-height:1;">10<span style="font-size:20px;">min</span></div>
        <div style="font-size:12px;font-weight:800;color:#e11d48;text-transform:uppercase;letter-spacing:1px;margin-top:4px;">por aluno</div>
        <div style="font-size:11px;color:#aaa;margin-top:3px;">antes: 3 a 4 horas</div>
      </div>

      <div style="flex:1;background:linear-gradient(135deg,#fffbeb,#fef3c7);border:2px solid #fde68a;border-radius:18px;padding:18px 16px;text-align:center;">
        <div style="font-size:36px;font-weight:900;color:#d97706;line-height:1;">140<span style="font-size:20px;">h</span></div>
        <div style="font-size:12px;font-weight:800;color:#b45309;text-transform:uppercase;letter-spacing:1px;margin-top:4px;">economizadas</div>
        <div style="font-size:11px;color:#aaa;margin-top:3px;">por ano letivo</div>
      </div>

      <div style="flex:1;background:linear-gradient(135deg,#ecfdf5,#d1fae5);border:2px solid #6ee7b7;border-radius:18px;padding:18px 16px;text-align:center;">
        <div style="font-size:36px;font-weight:900;color:#059669;line-height:1;">R$<span style="font-size:22px;">0,70</span></div>
        <div style="font-size:12px;font-weight:800;color:#047857;text-transform:uppercase;letter-spacing:1px;margin-top:4px;">por hora</div>
        <div style="font-size:11px;color:#aaa;margin-top:3px;">recuperada 🎉</div>
      </div>

    </div>

    <!-- Rodapé do card -->
    <div style="display:flex;justify-content:space-between;align-items:center;">
      <div style="display:flex;gap:8px;">
        ${['📱 Offline','📄 PDF','✅ BNCC','🔁 Vitalício'].map(t =>
          `<div style="background:#f5f5f5;border-radius:50px;padding:8px 16px;font-size:13px;color:#666;font-weight:700;">${t}</div>`
        ).join('')}
      </div>
      <div style="background:linear-gradient(135deg,#7c3aed,#c026d3,#f43f5e);border-radius:50px;padding:15px 36px;flex-shrink:0;">
        <span style="font-size:17px;font-weight:900;color:white;">👇 Link na bio</span>
      </div>
    </div>

  </div>

  <!-- Tag marca fora do card -->
  <div style="position:relative;z-index:2;text-align:center;">
    <span style="font-size:15px;font-weight:700;color:rgba(255,255,255,0.8);letter-spacing:1px;">Atividades e Dinâmicas ✨</span>
  </div>

</div>
</body></html>`;

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1080 });
  await page.setContent(html, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({
    path: 'C:\\Users\\Rodrigo Cruz\\Downloads\\imagem-produto-pareceres.png',
    type: 'png'
  });
  await browser.close();
  console.log('Imagem salva!');
})();
