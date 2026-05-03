// Script to rebuild criar.html with Nexus Forge rebranding
const fs = require('fs');

const orig = fs.readFileSync('C:/Users/Rodrigo Cruz/Claude-Code-Febra/public/_orig.html', 'utf8');

// Extract the JS block (unchanged)
const jsStart = orig.indexOf('<script>\n  // pvFocused');
const jsBlock = orig.slice(jsStart); // from <script> to </html>

const htmlHead = `<!DOCTYPE html>
<html lang="pt-br">
<head>
<meta charset="utf-8">
<title>Nexus Forge · Studio</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,300;12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,700;1,9..40,400&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="preload" href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,700;1,9..144,400&family=Anton&family=Bebas+Neue&family=Oswald:wght@300;400;600&family=Raleway:wght@400;600;700&family=Montserrat:wght@400;600;700&family=Poppins:wght@400;600;700&family=Nunito:wght@400;600;700&family=Bree+Serif&family=Lora:wght@400;700&family=Libre+Baskerville:wght@400;700&family=Playfair+Display:wght@400;700&family=Great+Vibes&family=Dancing+Script:wght@400;700&display=optional" as="style" onload="this.rel='stylesheet'">
<noscript><link href="https://fonts.googleapis.com/css2?family=Anton&family=Bebas+Neue&family=Oswald:wght@300;400;600&family=Poppins:wght@400;600;700&family=Nunito:wght@400;600;700&display=swap" rel="stylesheet"></noscript>
<style>@font-face{font-family:'Gagalin';src:url('/fonts/Gagalin-Regular.otf') format('opentype');font-weight:400;font-style:normal;font-display:swap}</style>`;

const css = `
<style>
  :root{
    --bg-0:#050811;--bg-1:#080D18;--bg-2:#0E1528;
    --card:rgba(10,15,35,0.75);--card-hi:rgba(14,20,45,0.88);
    --border:rgba(99,215,255,0.07);--border-hi:rgba(99,215,255,0.18);
    --text:#EFF3FF;--text-2:#8B96B8;--text-3:#3E4B6E;
    --accent:#C8FF47;--accent-2:#9ECC35;--accent-3:#00F5A0;
    --brand:#FF4757;--ok:#00F5A0;--warn:#FFB547;--radius:12px;
  }
  *{box-sizing:border-box}html,body{margin:0;padding:0}
  body{min-height:100vh;background:var(--bg-0);color:var(--text);font-family:"DM Sans",system-ui,-apple-system,"Segoe UI",sans-serif;font-feature-settings:"ss01","cv11";-webkit-font-smoothing:antialiased;letter-spacing:-.01em;overflow-x:hidden}
  ::selection{background:var(--accent);color:#050811}
  #matrix-canvas{position:fixed;inset:0;z-index:0;pointer-events:none;opacity:.07}
  .bg{position:fixed;inset:0;z-index:1;pointer-events:none;overflow:hidden}
  .bg::before{content:"";position:absolute;inset:-20%;background:radial-gradient(50% 40% at 20% 10%, rgba(200,255,71,.06), transparent 70%),radial-gradient(60% 50% at 85% 0%, rgba(0,245,160,.04), transparent 70%),radial-gradient(50% 50% at 50% 100%, rgba(99,215,255,.05), transparent 70%);filter:blur(20px)}
  .bg::after{content:"";position:absolute;inset:0;background-image:linear-gradient(rgba(99,215,255,.018) 1px, transparent 1px),linear-gradient(90deg, rgba(99,215,255,.018) 1px, transparent 1px);background-size:56px 56px;mask-image:radial-gradient(ellipse 70% 60% at 50% 30%, #000 30%, transparent 80%)}
  .noise{position:fixed;inset:0;z-index:2;pointer-events:none;opacity:.35;mix-blend-mode:overlay;background-image:radial-gradient(rgba(255,255,255,.04) 1px, transparent 1px);background-size:3px 3px}
  nav.top{position:relative;z-index:10;display:flex;align-items:center;justify-content:space-between;padding:22px 40px;max-width:1440px;margin:0 auto}
  .logo{display:flex;align-items:center;gap:10px;font-weight:700;font-size:17px;letter-spacing:-.02em;font-family:"Bricolage Grotesque",sans-serif}
  .logo .mark{width:28px;height:28px;border-radius:8px;background:radial-gradient(circle at 30% 30%, rgba(255,255,255,.35), transparent 50%),linear-gradient(135deg, #C8FF47, #9ECC35 60%, #00F5A0);box-shadow:0 0 0 1px rgba(200,255,71,.3), 0 8px 24px -6px rgba(200,255,71,.4)}
  .logo .nexus{color:var(--accent);font-weight:800}
  .logo .forge{color:var(--text-2);font-weight:400}
  .logo small{font-family:"DM Mono",monospace;font-weight:400;font-size:11px;color:var(--text-3);margin-left:2px;letter-spacing:0}
  .nav-mid{display:flex;gap:28px}
  .nav-mid a{color:var(--text-2);text-decoration:none;font-size:14px;font-weight:500;transition:color .15s}
  .nav-mid a:hover{color:var(--accent)}
  .nav-end{display:flex;align-items:center;gap:14px}
  .nav-end a{color:var(--text-2);text-decoration:none;font-size:14px;font-weight:500}
  .btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:10px 18px;border-radius:10px;border:1px solid var(--border-hi);font-size:14px;font-weight:600;color:var(--text);background:rgba(255,255,255,.04);cursor:pointer;text-decoration:none;letter-spacing:-.01em;transition:background .15s,border-color .15s,transform .1s}
  .btn:hover{background:rgba(255,255,255,.08);border-color:rgba(200,255,71,.25)}
  .btn:active{transform:translateY(1px)}
  .btn.primary{background:linear-gradient(180deg, rgba(200,255,71,.9), var(--accent) 60%, var(--accent-2));border-color:rgba(255,255,255,.15);box-shadow:0 1px 0 rgba(255,255,255,.2) inset,0 -1px 0 rgba(0,0,0,.3) inset,0 10px 30px -10px rgba(200,255,71,.4);color:#050811}
  .btn.primary:hover{filter:brightness(1.06)}
  main{position:relative;z-index:2;max-width:1280px;margin:0 auto;padding:10px 40px 60px}
  .head{display:flex;align-items:end;justify-content:space-between;gap:32px;margin:20px 0 34px}
  .head-left .pill{display:inline-flex;align-items:center;gap:8px;padding:6px 12px;border-radius:999px;background:rgba(200,255,71,.08);border:1px solid rgba(200,255,71,.22);font-size:12px;color:var(--accent);font-weight:500;margin-bottom:18px}
  .head-left .pill .dot{width:6px;height:6px;border-radius:50%;background:var(--accent);box-shadow:0 0 10px var(--accent)}
  .head h1{font-size:56px;line-height:1.02;letter-spacing:-.035em;font-weight:800;margin:0;max-width:780px;font-family:"Bricolage Grotesque",sans-serif}
  .head h1 .grad{background:linear-gradient(90deg, var(--accent) 0%, #9EFF1A 40%, var(--accent-3) 80%);-webkit-background-clip:text;background-clip:text;color:transparent}
  .head p{margin:18px 0 0;color:var(--text-2);font-size:16px;line-height:1.55;max-width:620px}
  .head-right{display:flex;flex-direction:column;align-items:flex-end;gap:10px;font-family:"DM Mono",monospace;font-size:11px;color:var(--text-3);padding-bottom:4px}
  .head-right .row{display:flex;align-items:center;gap:8px}
  .head-right .led{width:7px;height:7px;border-radius:50%;background:var(--ok);box-shadow:0 0 8px var(--ok)}
  .grid{display:grid;grid-template-columns:1fr 380px;gap:24px}
  .col{display:flex;flex-direction:column;gap:22px}
  .col:first-child{align-self:start}
  .card{background:linear-gradient(180deg, rgba(99,215,255,.03), rgba(99,215,255,0) 40%), var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:26px;position:relative;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-left:2px solid rgba(200,255,71,.15);transition:border-color .2s,box-shadow .2s}
  .card:hover{box-shadow:0 0 0 1px rgba(200,255,71,.12)}
  .card::before{content:"";position:absolute;inset:0;border-radius:var(--radius);padding:1px;background:linear-gradient(180deg, rgba(99,215,255,.1), transparent 40%);-webkit-mask:linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none}
  .card h2{display:flex;align-items:center;gap:10px;margin:0 0 18px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.12em;color:var(--text-3);font-family:"DM Mono",monospace}
  .card h2 .n{display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:6px;background:rgba(200,255,71,.1);border:1px solid rgba(200,255,71,.25);color:var(--accent);font-size:11px;font-weight:700;letter-spacing:0;font-family:"DM Mono",monospace}
  .card h2 .hint{margin-left:auto;color:var(--text-3);font-weight:400;text-transform:none;letter-spacing:0;font-family:"DM Sans",sans-serif;font-size:12px}
  .card[data-sec-num]{overflow:visible}
  .card[data-sec-num]::after{content:attr(data-sec-num);position:absolute;top:-10px;right:16px;font-size:120px;font-weight:800;line-height:1;color:var(--text);opacity:.04;pointer-events:none;font-family:"Bricolage Grotesque",sans-serif;letter-spacing:-.05em;user-select:none;z-index:0}
  .row2{display:grid;grid-template-columns:1.4fr .6fr;gap:14px}
  .row2.eq{grid-template-columns:1fr 1fr}
  label.lbl{display:block;font-size:13px;color:var(--text);font-weight:500;margin-bottom:8px}
  label.lbl .opt{color:var(--text-3);font-weight:400;margin-left:6px}
  .input,.textarea{width:100%;padding:13px 14px;border-radius:10px;background:rgba(5,8,17,.7);border:1px solid var(--border);color:var(--text);font-size:14px;font-family:inherit;transition:border-color .15s,background .15s,box-shadow .15s;outline:none}
  .input::placeholder,.textarea::placeholder{color:var(--text-3)}
  .input:hover,.textarea:hover{border-color:var(--border-hi)}
  .input:focus,.textarea:focus{border-color:var(--accent);box-shadow:0 0 0 3px rgba(200,255,71,.12);background:rgba(8,13,24,.9)}
  .stack{display:flex;flex-direction:column;gap:16px}
  .type-select{position:relative}
  .type-select .trigger{display:flex;align-items:center;gap:12px;padding:13px 14px;border-radius:10px;background:rgba(5,8,17,.6);border:1px solid var(--border-hi);cursor:pointer;font-size:14px}
  .type-select .trigger .ico{width:24px;height:24px;border-radius:6px;background:linear-gradient(135deg,var(--accent),var(--accent-2));display:flex;align-items:center;justify-content:center;font-size:13px;box-shadow:0 0 0 1px rgba(255,255,255,.1) inset}
  .type-select .trigger .chev{margin-left:auto;color:var(--text-3);font-size:11px}
  .type-menu{margin-top:10px;border:1px solid var(--border);border-radius:12px;background:rgba(8,13,24,.97);backdrop-filter:blur(12px);overflow:hidden}
  .type-menu .opt{display:flex;align-items:center;gap:12px;padding:12px 14px;font-size:14px;color:var(--text);border-top:1px solid var(--border);cursor:pointer;transition:background .12s}
  .type-menu .opt:first-child{border-top:none}
  .type-menu .opt:hover{background:rgba(200,255,71,.06)}
  .type-menu .opt.active{background:rgba(200,255,71,.1);color:#fff}
  .type-menu .opt .ico{width:22px;height:22px;border-radius:6px;background:rgba(255,255,255,.05);border:1px solid var(--border-hi);display:flex;align-items:center;justify-content:center;font-size:12px}
  .type-menu .opt.active .ico{background:linear-gradient(135deg,var(--accent),var(--accent-2));border-color:transparent}
  .type-menu .opt .meta{margin-left:auto;color:var(--text-3);font-size:11px;font-family:"DM Mono",monospace}
  .themes{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
  .theme{cursor:pointer;border-radius:12px;border:2px solid var(--border);overflow:hidden;transition:border-color .2s,transform .12s,box-shadow .2s;background:var(--bg-2)}
  .theme:hover{border-color:var(--border-hi);transform:translateY(-2px);box-shadow:0 12px 30px -10px rgba(0,0,0,.7)}
  .theme.active{border-color:var(--accent);box-shadow:0 0 0 1px var(--accent),0 10px 32px -10px rgba(200,255,71,.35)}
  .theme-mini{height:96px;position:relative;overflow:hidden;display:flex;flex-direction:column}
  .mini-stripe{height:3px;width:100%;flex-shrink:0}
  .mini-body{flex:1;padding:9px 12px;display:flex;flex-direction:column;justify-content:center;gap:4px}
  .mini-line{width:22px;height:2px;border-radius:1px;margin-bottom:3px}
  .mini-title{font-size:15px;font-weight:800;color:#fff;letter-spacing:-.02em;line-height:1}
  .mini-sub{font-size:10px;color:rgba(255,255,255,.5);line-height:1.3}
  .theme-label{padding:8px 12px;display:flex;align-items:center;justify-content:space-between;background:rgba(5,8,17,.65);border-top:1px solid rgba(255,255,255,.05)}
  .theme-label .t{font-size:12px;font-weight:600;color:var(--text);letter-spacing:-.01em}
  .theme .check{width:16px;height:16px;border-radius:50%;border:1.5px solid rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;font-size:9px;color:transparent;flex-shrink:0}
  .theme.active .check{background:var(--accent);border-color:var(--accent);color:#050811;box-shadow:0 0 10px rgba(200,255,71,.5)}
  .toggle-row{display:flex;align-items:center;gap:14px;padding:14px;border:1px solid var(--border);border-radius:12px;background:rgba(5,8,17,.4)}
  .toggle-row .tag{width:34px;height:34px;border-radius:9px;background:linear-gradient(135deg,rgba(200,255,71,.2),rgba(200,255,71,.04));border:1px solid rgba(200,255,71,.25);display:flex;align-items:center;justify-content:center;font-size:16px}
  .toggle-row .txt{flex:1;min-width:0}
  .toggle-row .txt b{font-size:14px;font-weight:600;display:block}
  .toggle-row .txt span{font-size:12px;color:var(--text-3);display:block;margin-top:2px;line-height:1.4}
  .switch{position:relative;width:44px;height:24px;border-radius:999px;background:rgba(255,255,255,.08);border:1px solid var(--border-hi);cursor:pointer;transition:background .2s;flex-shrink:0}
  .switch::after{content:"";position:absolute;top:2px;left:2px;width:18px;height:18px;border-radius:50%;background:#fff;transition:left .2s,background .2s;box-shadow:0 2px 6px rgba(0,0,0,.4)}
  .switch.on{background:var(--accent);border-color:var(--accent)}
  .switch.on::after{left:22px;background:#050811}
  .slider-wrap{padding:0 4px;margin-top:8px}
  .slider-wrap .top{display:flex;justify-content:space-between;font-size:12px;color:var(--text-3);margin-bottom:10px;font-family:"DM Mono",monospace}
  .slider-wrap .top b{color:var(--text);font-weight:600}
  input[type=range]{-webkit-appearance:none;appearance:none;width:100%;height:6px;background:transparent;outline:none}
  input[type=range]::-webkit-slider-runnable-track{height:6px;border-radius:999px;background:linear-gradient(90deg,var(--accent) 0%,var(--accent) var(--val,25%),rgba(255,255,255,.07) var(--val,25%),rgba(255,255,255,.07) 100%)}
  input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;background:var(--accent);margin-top:-6px;box-shadow:0 0 0 3px rgba(200,255,71,.25),0 2px 8px rgba(0,0,0,.4);cursor:pointer}
  input[type=range]::-moz-range-track{height:6px;border-radius:999px;background:rgba(255,255,255,.07)}
  input[type=range]::-moz-range-thumb{width:18px;height:18px;border-radius:50%;background:var(--accent);border:none;box-shadow:0 0 0 3px rgba(200,255,71,.25)}
  .check-row{display:flex;align-items:center;gap:10px;padding:11px 14px;border:1px solid var(--border);border-radius:10px;background:rgba(5,8,17,.35);cursor:pointer;font-size:13px;transition:border-color .15s}
  .check-row:hover{border-color:var(--border-hi)}
  .check-row .chk{width:16px;height:16px;border-radius:4px;border:1.5px solid var(--border-hi);display:flex;align-items:center;justify-content:center;font-size:10px;color:transparent}
  .check-row.on .chk{background:var(--accent);border-color:var(--accent);color:#050811}
  .check-row .meta{margin-left:auto;color:var(--text-3);font-size:11px;font-family:"DM Mono",monospace}
  .formats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
  .fmt{display:flex;align-items:center;gap:10px;padding:14px 16px;border:1px solid var(--border);border-radius:12px;background:rgba(5,8,17,.45);cursor:pointer;transition:all .15s}
  .fmt:hover{border-color:var(--border-hi);background:rgba(14,20,45,.7)}
  .fmt.active{border-color:var(--accent);background:linear-gradient(180deg,rgba(200,255,71,.1),rgba(200,255,71,.02));box-shadow:0 0 0 3px rgba(200,255,71,.1)}
  .fmt .ico{width:28px;height:28px;border-radius:7px;background:rgba(255,255,255,.05);border:1px solid var(--border-hi);display:flex;align-items:center;justify-content:center;font-size:14px}
  .fmt.active .ico{background:linear-gradient(135deg,var(--accent),var(--accent-2));border-color:transparent}
  .fmt b{font-size:14px;font-weight:600}
  .fmt span{font-size:11px;color:var(--text-3);display:block;font-family:"DM Mono",monospace;margin-top:1px}
  .sticky{position:sticky;top:24px}
  .preview{aspect-ratio:3/4;border-radius:12px;overflow:hidden;position:relative;background:radial-gradient(ellipse 70% 22% at 22% 7%, rgba(255,255,255,.08), transparent 55%),radial-gradient(80% 50% at 50% 20%,rgba(200,255,71,.15),transparent 70%),linear-gradient(180deg,#0E1528,#080D18);border:1px solid rgba(200,255,71,.2);box-shadow:0 1px 0 rgba(255,255,255,.1) inset,0 -1px 0 rgba(0,0,0,.5) inset,0 0 0 1px rgba(200,255,71,.05) inset,0 40px 100px -20px rgba(0,0,0,.9);display:flex;flex-direction:column;justify-content:space-between;padding:18px}
  .preview .brand{font-family:"DM Mono",monospace;font-size:10px;color:var(--accent);letter-spacing:.14em;text-transform:uppercase}
  .preview .ttl{font-size:26px;font-weight:800;line-height:1;letter-spacing:-.02em;font-family:"Bricolage Grotesque",sans-serif;background:linear-gradient(180deg,#fff,var(--accent));-webkit-background-clip:text;background-clip:text;color:transparent}
  .preview .sub{font-size:12px;color:rgba(200,255,71,.65);margin-top:6px}
  .preview .foot{display:flex;justify-content:space-between;font-family:"DM Mono",monospace;font-size:9px;color:rgba(200,255,71,.5);letter-spacing:.12em;text-transform:uppercase}
  .summary-list{display:flex;flex-direction:column;gap:1px;border-top:1px solid var(--border);margin-top:18px}
  .summary-list .r{display:flex;justify-content:space-between;align-items:center;padding:11px 0;font-size:13px;border-bottom:1px solid var(--border)}
  .summary-list .r .k{color:var(--text-3)}
  .summary-list .r .v{color:var(--text);font-weight:500;max-width:55%;text-align:right;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .generate{margin-top:18px;width:100%;padding:16px;font-size:15px;font-weight:700;border-radius:12px;background:linear-gradient(180deg,rgba(255,100,100,.18),rgba(255,71,87,0) 50%),linear-gradient(90deg,var(--brand),#FF2742);border:1px solid rgba(255,100,100,.25);color:#fff;cursor:pointer;letter-spacing:-.01em;font-family:"Bricolage Grotesque",sans-serif;box-shadow:0 1px 0 rgba(255,255,255,.15) inset,0 20px 40px -10px rgba(255,71,87,.4);transition:transform .1s,filter .15s}
  .generate:hover{filter:brightness(1.08)}
  .generate:active{transform:translateY(1px)}
  .generate:disabled{opacity:.5;cursor:not-allowed;filter:none;transform:none}
  .small-note{margin-top:10px;font-size:11px;color:var(--text-3);text-align:center;font-family:"DM Mono",monospace}
  .mode-tabs{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:4px}
  .mode-tab{display:flex;flex-direction:column;align-items:center;gap:4px;padding:16px 10px;border:2px solid var(--border);border-radius:12px;cursor:pointer;background:rgba(5,8,17,.4);transition:all .15s;text-align:center}
  .mode-tab:hover{border-color:var(--border-hi);background:rgba(14,20,45,.7)}
  .mode-tab.active{border-color:var(--accent);background:linear-gradient(180deg,rgba(200,255,71,.1),rgba(200,255,71,.02));box-shadow:0 0 0 3px rgba(200,255,71,.1)}
  .mode-tab .mico{font-size:24px;line-height:1}
  .mode-tab b{font-size:13px;font-weight:600;color:var(--text);display:block;margin-top:4px}
  .mode-tab small{font-size:11px;color:var(--text-3);font-family:"DM Mono",monospace;display:block;margin-top:2px}
  .post-types{display:grid;grid-template-columns:1fr 1fr;gap:10px}
  [data-showon="car"]{display:none}[data-showon="conv"]{display:none}
  body.mode-car [data-showon="ent"]{display:none}body.mode-car [data-showon="car"]{display:block}
  body.mode-conv [data-showon="ent"]{display:none}body.mode-conv [data-showon="car"]{display:none}body.mode-conv [data-showon="conv"]{display:block}
  .expand-panel{overflow:hidden;max-height:0;transition:max-height .45s ease,opacity .2s;opacity:0}
  .expand-panel.open{max-height:1000px;opacity:1}
  .cpick-list{display:flex;flex-direction:column;gap:8px;padding-top:14px}
  .cpick-item{display:flex;align-items:center;gap:14px;background:rgba(5,8,17,.5);border:1px solid var(--border);border-radius:12px;padding:12px 14px;transition:border-color .15s}
  .cpick-item:focus-within{border-color:var(--accent)}
  .cpick-swatch{width:52px;height:52px;border-radius:10px;flex-shrink:0;position:relative;overflow:hidden;cursor:pointer;transition:transform .12s,box-shadow .15s;box-shadow:0 3px 12px -3px rgba(0,0,0,.6),0 0 0 1px rgba(255,255,255,.07) inset}
  .cpick-swatch:hover{transform:scale(1.06)}
  .cpick-swatch input[type=color]{opacity:0;position:absolute;inset:0;width:100%;height:100%;cursor:pointer;border:none;padding:0}
  .cpick-info{flex:1;min-width:0}
  .cpick-info label{display:block;font-size:12px;font-weight:500;color:var(--text-2);margin-bottom:6px}
  .cpick-info small{display:block;font-size:11px;color:var(--text-3);margin-top:5px}
  .cpick-hex-wrap{display:flex;align-items:center;background:rgba(5,8,17,.6);border:1px solid var(--border);border-radius:8px;overflow:hidden;transition:border-color .15s}
  .cpick-hex-wrap:focus-within{border-color:var(--accent)}
  .cpick-hex-pre{padding:7px 10px;font-family:"DM Mono",monospace;font-size:12px;color:var(--text-3);border-right:1px solid var(--border);background:rgba(255,255,255,.02);user-select:none}
  .cpick-hex-input{flex:1;background:none;border:none;color:var(--text);font-size:13px;font-family:"DM Mono",monospace;padding:7px 10px;outline:none;min-width:0;text-transform:uppercase}
  .fpick-section{padding-top:14px;display:flex;flex-direction:column;gap:20px}
  .fpick-group{display:flex;flex-direction:column;gap:0}
  .fpick-group-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}
  .fpick-group-label{font-size:11px;font-weight:600;color:var(--text-3);text-transform:uppercase;letter-spacing:.06em;display:block}
  .fpick-clear{background:none;border:none;color:var(--text-3);font-size:11px;cursor:pointer;padding:2px 6px;border-radius:4px;transition:color .12s,background .12s}
  .fpick-clear:hover{color:var(--text);background:rgba(255,255,255,.06)}
  .fpick-live{background:rgba(5,8,17,.55);border:1px solid var(--border);border-radius:10px;padding:12px 16px;margin-bottom:14px;min-height:52px;display:flex;align-items:center;gap:14px;transition:border-color .2s}
  .fpick-live-name{font-size:10px;font-family:"DM Mono",monospace;color:var(--text-3);white-space:nowrap;min-width:80px}
  .fpick-live-text{font-size:20px;color:var(--text);flex:1;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;transition:font-family .15s}
  .fpick-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}
  .fpick-card{border-radius:10px;border:1.5px solid var(--border);background:var(--bg-2);cursor:pointer;padding:10px 10px 8px;transition:border-color .15s,background .15s,transform .1s;text-align:center;position:relative}
  .fpick-card:hover{border-color:var(--border-hi);background:var(--card-hi);transform:translateY(-1px)}
  .fpick-card.active{border-color:var(--accent);background:rgba(200,255,71,.08)}
  .fpick-card.active::after{content:"✓";position:absolute;top:4px;right:5px;font-size:9px;color:var(--accent)}
  .fpick-name{font-size:13px;font-weight:600;color:var(--text);line-height:1.2;margin-bottom:3px}
  .fpick-sample{font-size:9px;color:var(--text-3);letter-spacing:.02em}
  .drop-zone{border:2px dashed var(--border);border-radius:12px;padding:22px;text-align:center;cursor:pointer;transition:border-color .2s;position:relative;margin-top:14px}
  .drop-zone:hover,.drop-zone.over{border-color:var(--accent)}
  .drop-zone.has-img{border-color:var(--accent);border-style:solid;padding:0;overflow:hidden}
  .drop-zone .prompt{color:var(--text-3);font-size:13px}
  .drop-zone .prompt small{display:block;font-size:11px;margin-top:4px;color:var(--text-3)}
  #preview-img{width:100%;max-height:180px;object-fit:cover;border-radius:10px;display:block}
  #change-img{position:absolute;top:8px;right:8px;background:rgba(0,0,0,.65);color:#fff;border:none;border-radius:8px;padding:4px 10px;font-size:12px;cursor:pointer}
  .overlay{display:none;position:fixed;inset:0;z-index:100;background:rgba(5,8,17,.94);backdrop-filter:blur(16px);align-items:center;justify-content:center}
  .overlay.show{display:flex}
  .overlay-box{width:480px;max-width:calc(100vw - 40px);background:var(--card);border:1px solid var(--border);border-radius:18px;padding:36px;border-left:2px solid rgba(200,255,71,.2)}
  .ov-spinner{width:44px;height:44px;border:3px solid rgba(200,255,71,.1);border-top-color:var(--accent);border-radius:50%;animation:spin .8s linear infinite;margin:0 auto 22px}
  @keyframes spin{to{transform:rotate(360deg)}}
  .ov-title{font-size:18px;font-weight:700;text-align:center;margin-bottom:6px;font-family:"Bricolage Grotesque",sans-serif}
  .ov-sub{font-size:13px;color:var(--text-3);text-align:center;margin-bottom:24px}
  .prog-bar{background:rgba(255,255,255,.07);border-radius:999px;height:8px;overflow:hidden;margin-bottom:12px}
  .prog-fill{height:100%;background:linear-gradient(90deg,var(--accent),var(--accent-3));border-radius:999px;transition:width .5s ease;width:0%}
  .prog-meta{display:flex;justify-content:space-between;align-items:center}
  .prog-pct{font-size:24px;font-weight:800;color:var(--accent);font-family:"Bricolage Grotesque",sans-serif}
  .prog-msg{font-size:12px;color:var(--text-3);font-style:italic;max-width:300px;text-align:right}
  .ov-check{width:54px;height:54px;border-radius:50%;background:linear-gradient(135deg,var(--ok),#00C87A);display:flex;align-items:center;justify-content:center;font-size:26px;margin:0 auto 20px;box-shadow:0 0 30px rgba(0,245,160,.35)}
  .dl-row{display:flex;gap:12px;justify-content:center;margin-top:22px}
  .dl-btn{display:inline-flex;align-items:center;gap:8px;padding:13px 22px;border-radius:12px;font-size:14px;font-weight:600;text-decoration:none;cursor:pointer;border:none;transition:filter .15s,transform .1s;font-family:"DM Sans",sans-serif}
  .dl-btn:active{transform:translateY(1px)}
  .dl-btn.pdf{background:linear-gradient(135deg,var(--accent),var(--accent-2));color:#050811;box-shadow:0 8px 24px -6px rgba(200,255,71,.35)}
  .dl-btn.pdf:hover{filter:brightness(1.08)}
  .dl-btn.docx{background:rgba(255,255,255,.07);border:1px solid var(--border-hi);color:var(--text)}
  .dl-btn.docx:hover{background:rgba(255,255,255,.12)}
  .dl-btn.reset{background:transparent;border:1px solid var(--border);color:var(--text-2);font-size:13px;padding:10px 18px;margin-top:8px}
  .dl-btn.reset:hover{border-color:var(--border-hi);color:var(--text)}
  #overlay-ok .overlay-box{width:560px;max-height:90vh;overflow-y:auto}
  @keyframes revealCover{from{opacity:0;transform:translateY(12px) scale(.96)}to{opacity:1;transform:translateY(0) scale(1)}}
  .pdf-preview-wrap{background:linear-gradient(155deg,rgba(200,255,71,.07),rgba(158,204,53,.04));border:1px solid rgba(200,255,71,.1);border-radius:16px;padding:24px 20px 16px;margin:4px 0 20px}
  .pdf-preview-label{font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:var(--text-3);margin-bottom:14px}
  #pdf-cover-canvas{display:none;max-width:300px;width:100%;border-radius:8px;margin:0 auto;box-shadow:0 16px 48px rgba(0,0,0,.65),0 2px 8px rgba(0,0,0,.4);animation:revealCover .4s cubic-bezier(.22,.68,0,1.2) both}
  .pdf-nav{display:flex;align-items:center;justify-content:center;gap:16px;margin-top:14px}
  .pdf-nav-btn{background:rgba(255,255,255,.07);border:1px solid var(--border);color:var(--text-2);border-radius:8px;padding:6px 14px;font-size:13px;cursor:pointer;transition:background .15s}
  .pdf-nav-btn:hover{background:rgba(255,255,255,.13)}
  .pdf-nav-btn:disabled{opacity:.25;cursor:default}
  .pdf-page-info{font-size:12px;color:var(--text-3);min-width:50px;text-align:center;font-family:"DM Mono",monospace}
  #err-box{display:none;position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:200;background:#1a0810;color:#ff8a80;border:1px solid #4a1520;border-radius:12px;padding:14px 20px;font-size:13px;max-width:520px;width:calc(100vw - 40px);box-shadow:0 8px 32px rgba(0,0,0,.5)}
  .field-disabled{opacity:.35;pointer-events:none;transition:opacity .2s}
  .preview [contenteditable]{outline:none;cursor:text;border-radius:4px;transition:background .15s}
  .preview [contenteditable]:hover{background:rgba(255,255,255,.06)}
  .preview [contenteditable]:focus{background:rgba(255,255,255,.1);box-shadow:0 0 0 1px rgba(200,255,71,.25)}
  .pv-edit-bar{display:flex;align-items:center;gap:10px;margin-top:12px;padding:10px 14px;background:rgba(5,8,17,.5);border:1px solid var(--border);border-radius:10px;font-size:12px;color:var(--text-3);flex-wrap:wrap}
  .pv-edit-bar .pv-hint{flex:1;min-width:0}
  .pv-btn{background:rgba(255,255,255,.07);border:1px solid var(--border-hi);color:var(--text);border-radius:6px;padding:4px 10px;cursor:pointer;font-size:13px;font-weight:700;transition:background .12s;line-height:1.4}
  .pv-btn:hover{background:rgba(255,255,255,.14)}
  .dna-upload-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
  .dna-file-btn{display:inline-flex;align-items:center;gap:7px;padding:10px 16px;border-radius:10px;border:1px solid var(--border-hi);background:rgba(255,255,255,.04);color:var(--text);font-size:13px;font-weight:500;cursor:pointer;transition:background .15s,border-color .15s;white-space:nowrap}
  .dna-file-btn:hover{background:rgba(255,255,255,.09);border-color:rgba(200,255,71,.25)}
  .dna-chars{font-family:"DM Mono",monospace;font-size:11px;color:var(--text-3);margin-left:auto}
  .dna-save-btn{padding:9px 18px;border-radius:10px;border:1px solid var(--border-hi);background:rgba(255,255,255,.05);color:var(--text);font-size:13px;font-weight:500;cursor:pointer;transition:background .15s,border-color .15s}
  .dna-save-btn:hover{background:rgba(255,255,255,.10);border-color:rgba(200,255,71,.25)}
  .dna-save-btn:disabled{opacity:.45;cursor:default}
  .dna-save-status{font-size:12px;color:var(--text-3);font-family:"DM Mono",monospace}
  .dna-load-item{padding:10px 14px;cursor:pointer;border-bottom:1px solid var(--border);transition:background .12s;display:flex;justify-content:space-between;align-items:center;gap:8px}
  .dna-load-item:last-child{border-bottom:none}
  .dna-load-item:hover{background:rgba(200,255,71,.04)}
  .dna-load-item .li-nome{font-size:13px;font-weight:600;color:var(--text)}
  .dna-load-item .li-meta{font-size:11px;color:var(--text-3);font-family:"DM Mono",monospace}
  .autosave-badge{position:fixed;bottom:18px;left:18px;background:rgba(8,13,24,.9);border:1px solid var(--border);border-radius:8px;padding:6px 12px;font-size:11px;color:var(--text-3);font-family:"DM Mono",monospace;opacity:0;transition:opacity .4s;pointer-events:none;z-index:50}
  .ctype-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
  .ctype-card{display:flex;align-items:center;gap:12px;padding:14px 16px;border:1px solid var(--border);border-radius:12px;background:rgba(5,8,17,.45);cursor:pointer;transition:all .15s}
  .ctype-card:hover{border-color:var(--border-hi);background:rgba(14,20,45,.7)}
  .ctype-card.active{border-color:var(--accent);background:linear-gradient(180deg,rgba(200,255,71,.1),rgba(200,255,71,.02));box-shadow:0 0 0 3px rgba(200,255,71,.1)}
  .ctype-card .ctc-ico{width:34px;height:34px;border-radius:9px;flex-shrink:0;background:rgba(255,255,255,.05);border:1px solid var(--border-hi);display:flex;align-items:center;justify-content:center;font-size:17px}
  .ctype-card.active .ctc-ico{background:linear-gradient(135deg,var(--accent),var(--accent-2));border-color:transparent}
  .ctype-card b{font-size:13px;font-weight:600;display:block;line-height:1.2}
  .ctype-card small{font-size:11px;color:var(--text-3);font-family:"DM Mono",monospace;margin-top:2px;display:block}
  .gancho-wrap{position:relative}
  .gancho-wrap .textarea{padding-right:90px;min-height:72px;resize:none}
  .btn-sugerir{position:absolute;bottom:10px;right:10px;background:rgba(200,255,71,.12);border:1px solid rgba(200,255,71,.25);color:var(--accent);border-radius:8px;padding:5px 12px;font-size:12px;font-weight:600;cursor:pointer;transition:background .15s;white-space:nowrap}
  .btn-sugerir:hover{background:rgba(200,255,71,.22)}
  .preview-slide{display:none;aspect-ratio:1;border-radius:12px;overflow:hidden;position:relative;background:linear-gradient(160deg,#0E1528,#080D18);border:1px solid rgba(200,255,71,.15);box-shadow:0 1px 0 rgba(255,255,255,.1) inset,0 40px 100px -20px rgba(0,0,0,.9);flex-direction:column;align-items:center;justify-content:center;padding:24px 20px;text-align:center}
  body.mode-car .preview{display:none}body.mode-car .preview-slide{display:flex}
  body.mode-conv aside{display:none}body.mode-conv .grid{grid-template-columns:1fr}
  body.mode-conv .card:not([data-showon="conv"]):not(#sec-mode){display:none}
  .slide-dots{display:flex;gap:6px;margin-bottom:22px}
  .slide-dot{width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,.2);transition:all .2s}
  .slide-dot.active{width:20px;border-radius:3px;background:var(--accent)}
  .slide-hook-pv{font-size:20px;font-weight:800;color:#fff;line-height:1.25;letter-spacing:-.025em;outline:none;cursor:text;border-radius:6px;padding:4px 6px;transition:background .15s;min-height:1em;font-family:"Bricolage Grotesque",sans-serif}
  .slide-hook-pv:hover{background:rgba(255,255,255,.07)}
  .slide-hook-pv:focus{background:rgba(255,255,255,.1);box-shadow:0 0 0 1px rgba(200,255,71,.2)}
  .slide-hook-pv:empty::before{content:attr(data-placeholder);color:rgba(255,255,255,.25);font-style:italic;pointer-events:none}
  .slide-brand-pv{margin-top:22px;font-size:10px;color:rgba(200,255,71,.5);font-family:"DM Mono",monospace;letter-spacing:.14em;text-transform:uppercase}
  .pv-elem{position:relative}
  .drag-handle{position:absolute;top:-9px;right:-9px;width:20px;height:20px;border-radius:50%;background:rgba(200,255,71,.85);border:1.5px solid rgba(255,255,255,.4);display:flex;align-items:center;justify-content:center;font-size:11px;cursor:move;opacity:0;transition:opacity .15s;user-select:none;z-index:20;color:#050811}
  .pv-elem:hover .drag-handle{opacity:1}
  .pv-elem.dragging{opacity:.75}
  .r.car-row{display:none}body.mode-car .r.ent-row{display:none}body.mode-car .r.car-row{display:flex}
  .toast{position:fixed;bottom:24px;right:24px;z-index:300;background:rgba(8,13,24,.97);border:1px solid var(--border-hi);border-radius:12px;padding:13px 18px;font-size:13px;color:var(--text);box-shadow:0 8px 32px rgba(0,0,0,.5);backdrop-filter:blur(12px);transform:translateY(16px);opacity:0;transition:transform .25s ease,opacity .25s ease;max-width:320px;pointer-events:none;display:flex;align-items:center;gap:10px}
  .toast.show{transform:translateY(0);opacity:1}
  .toast .ti{font-size:16px}
  .cformats{display:grid;grid-template-columns:repeat(5,1fr);gap:8px}
  .carousel-slides-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:16px}
  .slide-thumb-wrap{position:relative;cursor:pointer;border-radius:10px;overflow:hidden;border:1.5px solid var(--border);transition:border-color .15s,transform .12s;aspect-ratio:1}
  .slide-thumb-wrap:hover{border-color:var(--accent);transform:scale(1.02)}
  .slide-thumb-wrap img{width:100%;height:100%;object-fit:cover;display:block}
  .slide-thumb-dl{position:absolute;inset:0;background:rgba(0,0,0,.55);border:none;color:#fff;font-size:13px;font-weight:600;cursor:pointer;opacity:0;transition:opacity .15s;display:flex;align-items:center;justify-content:center;gap:6px}
  .slide-thumb-wrap:hover .slide-thumb-dl{opacity:1}
  .slide-num{position:absolute;top:6px;left:8px;font-size:11px;font-weight:700;color:rgba(255,255,255,.7);font-family:"DM Mono",monospace;pointer-events:none}
  .btn-carousel{margin-top:4px;width:100%;padding:15px;font-size:14px;font-weight:700;border-radius:12px;background:linear-gradient(180deg,rgba(255,255,255,.1),rgba(255,255,255,0) 50%),linear-gradient(90deg,var(--brand),#FF2742);border:1px solid rgba(255,100,100,.2);color:#fff;cursor:pointer;letter-spacing:-.01em;box-shadow:0 1px 0 rgba(255,255,255,.15) inset,0 16px 32px -10px rgba(255,71,87,.35);transition:transform .1s,filter .15s;font-family:"Bricolage Grotesque",sans-serif}
  .btn-carousel:hover{filter:brightness(1.08)}
  .btn-carousel:active{transform:translateY(1px)}
  .btn-carousel:disabled{opacity:.4;cursor:not-allowed;filter:none;transform:none}
  @media(max-width:900px){.grid{grid-template-columns:1fr}.head h1{font-size:38px}nav.top{padding:18px 20px}main{padding:10px 20px 60px}.sticky{position:static}}
  @media(max-width:640px){.themes{grid-template-columns:1fr 1fr}.formats{grid-template-columns:1fr}.row2,.row2.eq{grid-template-columns:1fr}.nav-mid{display:none}.head{flex-direction:column;gap:12px}.head h1{font-size:28px}.head-right{align-items:flex-start}.head p{font-size:14px}.overlay-box{padding:24px 18px;width:calc(100vw - 24px)}.dl-row{flex-direction:column;align-items:stretch}.dl-btn{justify-content:center}.prog-meta{flex-direction:column;align-items:flex-start;gap:4px}.prog-msg{max-width:100%;text-align:left}.generate{padding:15px;font-size:14px}.card{padding:18px}.summary-list .r .v{max-width:60%}}
  @media(max-width:480px){.head h1{font-size:22px;line-height:1.1}nav.top{padding:14px 16px}.nav-end a:not(.btn){display:none}.btn{font-size:13px;padding:8px 14px}main{padding:8px 14px 50px}.head-left .pill{font-size:11px}#err-box{bottom:16px;left:12px;right:12px;transform:none;width:auto}.toast{right:12px;left:12px;max-width:none;bottom:16px}}
  .field-chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
  .chip{display:inline-flex;align-items:center;padding:5px 11px;border-radius:999px;background:rgba(200,255,71,.06);border:1px solid rgba(200,255,71,.15);color:var(--text-2);font-size:12px;cursor:pointer;transition:background .15s,border-color .15s,color .15s;user-select:none;white-space:nowrap}
  .chip:hover{background:rgba(200,255,71,.14);border-color:rgba(200,255,71,.3);color:var(--accent)}
  .chip:active{transform:scale(.97)}
  .chip-label{font-size:11px;color:var(--text-3);font-family:"DM Mono",monospace;display:block;margin-bottom:6px}
  .card h2.display{font-family:"Fraunces",Georgia,serif;font-size:16px;font-weight:700;text-transform:none;letter-spacing:-.02em;color:var(--text)}
  .card h2.display .n{font-family:"DM Mono",monospace;font-size:11px}
  .conv-drop{border:2px dashed var(--border);border-radius:16px;padding:0;transition:border-color .2s,background .2s;position:relative;min-height:220px;display:flex;align-items:center;justify-content:center;margin-top:18px;cursor:pointer}
  .conv-drop:hover,.conv-drop.over{border-color:var(--accent);background:rgba(200,255,71,.03)}
  .conv-drop.has-file{border-style:solid;border-color:rgba(200,255,71,.4)}
  .conv-drop-inner{text-align:center;padding:36px 24px;pointer-events:none;width:100%}
  .conv-big-icon{font-size:52px;line-height:1;margin-bottom:16px;display:block;filter:drop-shadow(0 4px 12px rgba(200,255,71,.2))}
  .conv-drop-title{font-size:18px;font-weight:700;color:var(--text);margin:0 0 6px;letter-spacing:-.02em;font-family:"Bricolage Grotesque",sans-serif}
  .conv-drop-sub{font-size:13px;color:var(--text-3);margin:0 0 18px}
  .conv-file-badge{display:inline-flex;align-items:center;gap:10px;background:rgba(200,255,71,.08);border:1px solid rgba(200,255,71,.2);border-radius:10px;padding:10px 16px;margin-top:8px;font-size:13px;font-weight:600;color:var(--accent)}
  .conv-file-badge .rm{background:none;border:none;color:var(--text-3);cursor:pointer;padding:0 0 0 6px;font-size:14px;transition:color .12s;pointer-events:all}
  .conv-file-badge .rm:hover{color:var(--text)}
  .conv-dir-cards{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:20px}
  .conv-dir-card{display:flex;flex-direction:column;align-items:center;gap:8px;padding:20px 14px;border:2px solid var(--border);border-radius:14px;background:rgba(5,8,17,.45);cursor:pointer;transition:all .15s;text-align:center}
  .conv-dir-card:hover{border-color:var(--border-hi);background:rgba(14,20,45,.7);transform:translateY(-2px)}
  .conv-dir-card.active{border-color:var(--accent);background:linear-gradient(180deg,rgba(200,255,71,.1),rgba(200,255,71,.02));box-shadow:0 0 0 3px rgba(200,255,71,.1)}
  .conv-dir-card .dico{font-size:32px;line-height:1}
  .conv-dir-card b{font-size:13px;font-weight:700;color:var(--text);display:block}
  .conv-dir-card small{font-size:11px;color:var(--text-3);font-family:"DM Mono",monospace}
  .conv-result{text-align:center;padding:24px 0 8px}
  .conv-result h3{font-size:20px;font-weight:700;margin:12px 0 6px;color:var(--text);font-family:"Bricolage Grotesque",sans-serif}
  .conv-result p{font-size:13px;color:var(--text-3);margin:0 0 20px}
  .conv-progress{margin:16px 0;background:rgba(255,255,255,.07);border-radius:999px;height:6px;overflow:hidden}
  .conv-progress-fill{height:100%;width:0%;border-radius:999px;background:linear-gradient(90deg,var(--accent),var(--accent-3));transition:width .4s ease}
  .conv-status-msg{font-size:12px;color:var(--text-3);font-style:italic;text-align:center;margin-top:8px;min-height:18px}
</style>
<script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
<script>if(window.pdfjsLib)pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';</script>
</head>`;

// Extract HTML body (everything between </head> and the start of the JS script)
const bodyStart = orig.indexOf('<body>');
const jsStartIdx = orig.indexOf('<script>\n  // pvFocused');
const bodyMiddle = orig.slice(bodyStart, jsStartIdx);

// Patch the body: update logo, nav, header copy, footer, matrix colors
let patchedBody = bodyMiddle
  // Logo
  .replace(
    'Nexus Max <small>1.0</small>',
    '<span class="nexus">NEXUS</span><span class="forge">&nbsp;FORGE</span> <small>studio</small>'
  )
  // Pill text
  .replace('Nexus Max · editor', 'Nexus Forge · studio')
  // H1 text
  .replace(
    'Transforme qualquer ideia em um <span class="grad">entregável completo</span>',
    'Forge seu <span class="grad">infoproduto premium</span>'
  )
  // Head description
  .replace(
    'Ebooks, workbooks, checklists, planners, scripts de VSL, guias e certificados — com layout profissional automático. Preencha, clique, exporte.',
    'Ebooks, workbooks, checklists, planners, scripts VSL e certificados — layout profissional automático. Precisão de estúdio, velocidade de IA.'
  )
  // Section numbered cards — add data-sec-num attribute to sections 01, 02, 03, 04
  .replace(
    '<section class="card" data-showon="ent">\n        <h2><span class="n">01</span>',
    '<section class="card" data-showon="ent" data-sec-num="01">\n        <h2><span class="n">01</span>'
  )
  .replace(
    '<section class="card" data-showon="ent">\n        <h2><span class="n">02</span>',
    '<section class="card" data-showon="ent" data-sec-num="02">\n        <h2><span class="n">02</span>'
  )
  .replace(
    '<section class="card" data-showon="ent">\n        <h2><span class="n">03</span>',
    '<section class="card" data-showon="ent" data-sec-num="03">\n        <h2><span class="n">03</span>'
  )
  .replace(
    '<section class="card" data-showon="ent">\n        <h2><span class="n">04</span>',
    '<section class="card" data-showon="ent" data-sec-num="04">\n        <h2><span class="n">04</span>'
  )
  // Success overlay check mark style — use brand color
  .replace(
    'style="background:linear-gradient(135deg,#D97706,#B45309);box-shadow:0 0 32px rgba(217,119,6,.55)"',
    'style="background:linear-gradient(135deg,var(--brand),#FF2742);box-shadow:0 0 32px rgba(255,71,87,.45)"'
  )
  // Carousel success overlay style
  .replace(
    'style="background:linear-gradient(135deg,#F59E0B,#D97706);box-shadow:0 0 30px rgba(217,119,6,.5)"',
    'style="background:linear-gradient(135deg,var(--accent),var(--accent-2));box-shadow:0 0 30px rgba(200,255,71,.4)"'
  )
  // Footer
  .replace(
    "font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.08em",
    "font-family:'DM Mono',monospace;font-size:11px;letter-spacing:.08em"
  )
  .replace(
    '© Nexus Max · 2026',
    '© Nexus Forge · 2026'
  )
  // Preview brand default text
  .replace(
    '>Nexus Max · Ebook<',
    '>Nexus Forge · Ebook<'
  )
  // toggle-row tag colors: update amber to accent tones
  .replace(
    'background:linear-gradient(135deg,rgba(217,119,6,.25),rgba(217,119,6,.05));border-color:rgba(217,119,6,.35)',
    'background:linear-gradient(135deg,rgba(200,255,71,.2),rgba(200,255,71,.04));border-color:rgba(200,255,71,.25)'
  )
  .replace(
    'background:linear-gradient(135deg,rgba(34,211,238,.25),rgba(34,211,238,.05));border-color:rgba(34,211,238,.35)',
    'background:linear-gradient(135deg,rgba(0,245,160,.2),rgba(0,245,160,.04));border-color:rgba(0,245,160,.25)'
  )
  // Tip card gradient
  .replace(
    'background:linear-gradient(135deg,var(--accent),var(--accent-2));display:flex;align-items:center;justify-content:center;font-size:16px">',
    'background:linear-gradient(135deg,rgba(200,255,71,.25),rgba(200,255,71,.08));border:1px solid rgba(200,255,71,.2);display:flex;align-items:center;justify-content:center;font-size:16px">'
  )
  // matrix canvas fade bg colour — update amber to dark navy
  ;

// Also update Dica do MAX title inline style references that use JetBrains Mono
// (footer already handled above, handle any remaining inline font refs in body)
patchedBody = patchedBody.replace(/font-family:'JetBrains Mono',monospace/g, "font-family:'DM Mono',monospace");

// Update pv-brand default content reference
patchedBody = patchedBody.replace(
  "document.getElementById('pv-brand').textContent = 'Nexus Max · ' + typeLabel.textContent",
  "document.getElementById('pv-brand').textContent = 'Nexus Forge · ' + typeLabel.textContent"
);

// Patch JS block — update matrix rain colors to match new palette
let patchedJS = jsBlock
  .replace("const COLOR_HEAD  = '#FCD34D';    // bright amber — leading character (head of each stream)", "const COLOR_HEAD  = '#C8FF47';    // chartreuse — leading character (head of each stream)")
  .replace("const COLOR_TRAIL = '#D97706';    // mid amber — trail body", "const COLOR_TRAIL = '#9ECC35';    // mid chartreuse — trail body")
  .replace("const COLOR_FADE  = '#92400E';    // dark amber — fading tail", "const COLOR_FADE  = '#3E4B6E';    // deep slate — fading tail")
  .replace("ctx.fillStyle = 'rgba(11,9,6,.18)';", "ctx.fillStyle = 'rgba(5,8,17,.18)';")
  // Update pv-brand text in typeMenu click handler
  .replace(
    "'Nexus Max · ' + typeLabel.textContent.split('/')[0].trim()",
    "'Nexus Forge · ' + typeLabel.textContent.split('/')[0].trim()"
  )
  // chip feedback color
  .replace(
    "chip.style.background = 'rgba(217,119,6,.35)';",
    "chip.style.background = 'rgba(200,255,71,.25)';"
  );

const finalHTML = htmlHead + css + '\n' + patchedBody + patchedJS;

fs.writeFileSync('C:/Users/Rodrigo Cruz/Claude-Code-Febra/public/criar.html', finalHTML, 'utf8');
console.log('Done! Final size:', finalHTML.length);

// Verify key IDs present
const ids = ['btn-gerar','inp-titulo','overlay-prog','overlay-ok','overlay-carousel-prog','overlay-carousel-ok','prog-fill','prog-pct','prog-msg','btn-cancelar','dna-nome','dna-nicho','dna-publico','dna-preco','dna-relatorio','inp-subtitulo','inp-autor','inp-descricao','inp-avatar','inp-paginas','inp-caps','sw-head','sw-foot','inp-cab','inp-rod','inp-copyright','ck-numpag','ck-img','ck-cor','ck-extract','type-trigger','type-menu','themes','formats','pv-title','pv-sub','pv-autor','pv-brand','pv-meta','pv-hook','pdf-cover-canvas','dl-row','ok-title','ok-msg','err-box','autosave-badge','carousel-prog-fill','carousel-prog-pct','carousel-slides-grid','btn-dl-all-slides','conv-btn','conv-drop','conv-result','conv-download-btn','conv-reset-btn'];
const missing = ids.filter(id => !finalHTML.includes('id="' + id + '"'));
if (missing.length) {
  console.log('MISSING IDs:', missing);
} else {
  console.log('All', ids.length, 'IDs verified present.');
}
