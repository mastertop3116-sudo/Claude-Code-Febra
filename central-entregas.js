// CENTRAL DE ENTREGAS — módulo do dashboard Nexus (portado do painel da VPS em 27/07/2026).
// Mostra cada venda dos últimos 3 dias com o selo de entrega + acessos prontos pra copiar
// + saúde do Sessão Pronta (Netlify). Rota reservada por slug; dados em cache de 5 min.
// Chaves via ambiente: DOMINANCE_SB_URL, DOMINANCE_SB_KEY, NETLIFY_TOKEN_MAX.
const express = require("express");
const router = express.Router();

const CLINIC = "ccec725b-0fcb-4e13-b287-a5678f44e7d3";
const SLUG = process.env.CENTRAL_SLUG || "central-r7x2m9k4";
const SB = String(process.env.DOMINANCE_SB_URL || "").replace(/\/$/, "");
const KEY = process.env.DOMINANCE_SB_KEY || "";
const NTOK = process.env.NETLIFY_TOKEN_MAX || "";
const PAINEL = "https://feof-cloud-filing-emma.trycloudflare.com";

async function get(path) {
  const r = await fetch(`${SB}/rest/v1/${path}`, { headers: { apikey: KEY, Authorization: "Bearer " + KEY } });
  if (!r.ok) throw new Error(path + " HTTP " + r.status);
  return r.json();
}

async function coletarSessaoPronta() {
  const out = { ok: false };
  try {
    const SITE = "ee36f981-532b-41d5-9b74-a9ba9f2f0395";
    const H = { Authorization: "Bearer " + NTOK };
    const t0 = Date.now();
    const r = await fetch("https://sessao-pronta-to.netlify.app/");
    out.no_ar = r.ok; out.ms = Date.now() - t0;
    const contas = await (await fetch("https://api.netlify.com/api/v1/accounts", { headers: H })).json();
    const acc = contas[0];
    out.plano = acc.type_name; out.creditos_plano = acc.plan_credits;
    const bw = await (await fetch(`https://api.netlify.com/api/v1/accounts/${acc.id}/bandwidth`, { headers: H })).json();
    out.banda_mb = Math.round((bw.used || 0) / 1048576);
    out.creditos_banda = Math.round((bw.used || 0) / 1073741824 * 20 * 10) / 10;
    const forms = await (await fetch(`https://api.netlify.com/api/v1/sites/${SITE}/forms`, { headers: H })).json();
    const fo = (forms || []).find(x => x.name === "sugestoes");
    out.sugestoes = fo ? fo.submission_count : 0;
    if (fo && fo.submission_count) {
      const subs = await (await fetch(`https://api.netlify.com/api/v1/forms/${fo.id}/submissions?per_page=3`, { headers: H })).json();
      out.ultimas_sugestoes = subs.map(s => ({ tipo: s.data.tipo, msg: String(s.data.mensagem || "").slice(0, 90), tela: s.data.tela, quando: s.data.quando }));
    }
    out.ok = true;
  } catch (e) { out.erro = String(e).slice(0, 120); }
  return out;
}

const dig = s => String(s || "").replace(/\D/g, "");
const suf = s => dig(s).slice(-8);
const brt = iso => new Date(new Date(iso).getTime() - 3 * 3600000).toISOString().slice(5, 16).replace("T", " ").replace(/^(\d\d)-(\d\d)/, "$2/$1");

const BUMP_IDS = ["1wbaakv6xrXC3mlsu1v", "1VXu4dVbCUrt8BNyKES40", "1DNMCBSIeOxj8p2_-Jlcn", "1RmVKhidCHjrIwaIEAN", "1-lpn1dCbF5bthSk1g62", "1eFR5cZQ1XvpniBZmeP6", "1zc04-ujvS1wQZ11uJz", "1Bn7fk_Zket6-dpxOqL8", "1xCtwSpw-DiUaHRY6pBYfx", "10rpAqIoaCZzhGDE9KjHs", "1MwHLRWEfF83Nni532ubF"];
const PLANOS = {
  fisio: [1000, 1990, 2700], to: [1000, 1990, 2700], jiu: [1000, 1490, 1990],
  despluga: [1000, 1790, 2700], idosos: [1000, 1490, 1990],
};
function familia(nome) {
  const n = String(nome || "").toLowerCase();
  if (n.includes("fisioterapia")) return "fisio";
  if (n.includes("terapia ocupacional")) return "to";
  if (/jiu|jitsu|jutsu/.test(n)) return "jiu";
  if (n.includes("despluga")) return "despluga";
  if (n.includes("idosos")) return "idosos";
  return "outro";
}
const ENTREGA = {
  fisio: { basico: ["https://drive.google.com/drive/folders/1JYf7aMxEeen72YP9xHfjF8TPRDutY9H9", ""], area: ["https://area-fisioterapia.netlify.app", "2026"] },
  to: { basico: ["https://drive.google.com/drive/folders/16yMAwowteJbHnGl9LGCfaoBLD7b1EByc", ""], area: ["https://area-to-na-pratica.netlify.app", "2026"] },
  jiu: { basico: ["https://drive.google.com/drive/folders/1AKyB5DeGbGcxubLHkeewoc5GHRHpg7-y", ""], area: ["https://areadinamicas.netlify.app", "2026"] },
  despluga: { basico: ["https://drive.google.com/drive/folders/1qNEynpbyqq4Mje2Lma2s4IsRwOdgoj_g", ""], area: ["https://area-desplugadas.netlify.app", "2026"] },
  idosos: { basico: ["https://area-idosos-60.netlify.app", "2026"], area: ["https://area-idosos-60.netlify.app", "2026"] },
};
const NOME_PROD = { fisio: "+150 Atividades de Fisioterapia Infantil", to: "+150 Atividades de Terapia Ocupacional",
  jiu: "+500 Dinâmicas de Jiu-Jitsu", despluga: "Kit Aulas Desplugadas", idosos: "+1000 Atividades para Idosos" };
function msgCliente(nome, prod, url, senha) {
  const oi = nome ? `Oi ${nome.split(" ")[0]}! 😊` : "Oi! 😊";
  const abre = senha ? `\n\nÉ só abrir o link e digitar a senha — dá pra ver online ou baixar tudo.`
                     : `\n\nÉ só tocar no link que abre direto, sem senha — dá pra ver online ou baixar.`;
  return `${oi} Aqui está o seu acesso ao *${prod}*:\n\n🔗 ${url}` + (senha ? `\n🔑 Senha: ${senha}` : "") + abre + `\nQualquer dúvida me chama por aqui! 💜`;
}
function acessoDaVenda(fam, cents, nomeCliente) {
  const e = ENTREGA[fam]; if (!e) return null;
  const [url, senha] = cents <= 1000 ? e.basico : e.area;
  const prod = (NOME_PROD[fam] || "seu material") + (cents > 1000 && fam !== "idosos" ? " + Bônus" : "");
  return { msg: msgCliente(nomeCliente, prod, url, senha), link: url };
}
function labelLimpo(l) {
  return String(l).replace(/\s*[—-]\s*Terapia Ocupacional\s*\(([^)]+)\)/, ": $1")
                  .replace(/\s*\((Terapia Ocupacional|autistas)\)\s*$/i, "").trim();
}
function nomeBonito(n) {
  let x = String(n || "").trim();
  const m = x.toLowerCase().match(/^(.*?)(gmail|hotmail|outlook|yahoo|icloud)/);
  if (m && !x.includes(" ")) x = m[1].replace(/[._-]+/g, " ").trim();
  return x.split(/\s+/).slice(0, 2).map(w => w ? w[0].toUpperCase() + w.slice(1) : w).join(" ") || "(sem nome)";
}
const FAM_COR = { fisio: "#2e9fb3", to: "#e07a3e", jiu: "#4f7df0", despluga: "#9a6ae8", idosos: "#d0a03a", outro: "#6b7687" };
const FAM_EMOJI = { fisio: "🩺", to: "🧩", jiu: "🥋", despluga: "📚", idosos: "🌻", outro: "📦" };

async function montar() {
  const desde = new Date(Date.now() - 72 * 3600000).toISOString();
  let acervo = [];
  try {
    const cl = await get(`clinic_clinics?id=eq.${CLINIC}&select=settings`);
    const pa = cl[0]?.settings?.product_access || {};
    acervo = Object.entries(pa)
      .filter(([k, v]) => v?.url && !k.startsWith("auto_"))
      .map(([k, v]) => ({ chave: k, label: String(v.label || k).trim(), url: v.url, senha: v.senha || "", bump: v.is_bump === true }));
    const vistos = new Set();
    acervo = acervo.filter(a => { const id = a.url + "|" + a.senha; if (vistos.has(id)) return false; vistos.add(id); return true; });
    const porNome = {};
    acervo.forEach(a => { const k = a.label.toLowerCase().replace(/\s*\+\s*b[ôo]nus/, ""); porNome[k] = (porNome[k] || 0) + 1; });
    acervo.forEach(a => { const k = a.label.toLowerCase().replace(/\s*\+\s*b[ôo]nus/, "");
      if (porNome[k] > 1) a.label += a.url.includes("drive.google") ? " · pasta (básico)" : " · área completa"; });
  } catch (_) {}

  const vendas = await get(`clinic_checkouts?clinic_id=eq.${CLINIC}&paid_at=gte.${desde}&select=paid_at,amount_cents,product_name,buyer_name,buyer_phone&order=paid_at.desc&limit=300`);
  const msgs = await get(`conversation_messages?clinic_id=eq.${CLINIC}&direction=eq.out&created_at=gte.${desde}&select=clinic_patient_id,text,created_at&order=created_at.asc&limit=1000`);
  const ids = [...new Set(msgs.map(m => m.clinic_patient_id).filter(Boolean))];
  const pacientes = [];
  for (let i = 0; i < ids.length; i += 50) {
    const lote = ids.slice(i, i + 50).join(",");
    pacientes.push(...await get(`clinic_patients?id=in.(${lote})&select=id,phone`));
  }
  const fonePorPaciente = Object.fromEntries(pacientes.map(p => [p.id, suf(p.phone)]));

  const linhas = vendas.map(v => {
    const s = suf(v.buyer_phone);
    const depois = msgs.filter(m => fonePorPaciente[m.clinic_patient_id] === s && m.created_at >= v.paid_at);
    const txt = depois.map(m => m.text || "").join("\n");
    const fam = familia(v.product_name);
    const temArea = /netlify\.app/.test(txt);
    const temPasta = /drive\.google\.com\/drive\/folders|drive\.google\.com\/open\?id=/.test(txt);
    const temDominance = /dominancestudio\.com\.br\/membros/.test(txt);
    const bumpEntregue = BUMP_IDS.some(id => txt.includes(id)) || /material extra que você garantiu/i.test(txt);
    const planos = PLANOS[fam] || [];
    const temBumpNoPedido = planos.length > 0 && !planos.includes(v.amount_cents);

    let selo, cor;
    if (!dig(v.buyer_phone)) {
      selo = "📧 entregue pelo e-mail do GG (pedido veio sem WhatsApp)"; cor = "#2e6fb3";
      return { hora: brt(v.paid_at), nome: nomeBonito(v.buyer_name), fam, produto: v.product_name, valor: (v.amount_cents / 100).toFixed(2).replace(".", ","), cents: v.amount_cents, selo, cor, bump: "",
               acesso: acessoDaVenda(fam, v.amount_cents, nomeBonito(v.buyer_name)) };
    }
    if (temArea || temPasta) { selo = "✅ ENTREGUE — nossa área/pasta"; cor = "#1a7a3a"; }
    else if (temDominance) { selo = "🟡 entregue no login antigo"; cor = "#8a6d1a"; }
    else if (depois.length > 0) { selo = "🟠 respondida, conferir link"; cor = "#a05a1a"; }
    else { selo = "❌ SEM ENTREGA"; cor = "#b02525"; }

    let bump = "";
    if (temBumpNoPedido) bump = bumpEntregue ? "🎁 bump entregue ✓" : "🎁 bump PENDENTE ⚠️";
    else if (bumpEntregue) bump = "🎁 bump entregue ✓";

    const nome = nomeBonito(v.buyer_name);
    return { hora: brt(v.paid_at), nome, fam, produto: v.product_name, valor: (v.amount_cents / 100).toFixed(2).replace(".", ","), cents: v.amount_cents, selo, cor, bump,
             acesso: acessoDaVenda(fam, v.amount_cents, nome) };
  });

  const total = linhas.length;
  const ok = linhas.filter(l => l.selo.startsWith("✅") || l.selo.startsWith("📧")).length;
  const antigas = linhas.filter(l => l.selo.startsWith("🟡")).length;
  const semEntrega = linhas.filter(l => l.selo.startsWith("❌") || l.selo.startsWith("🟠")).length;
  const bumpsPend = linhas.filter(l => l.bump.includes("PENDENTE")).length;
  const _a = new Date(Date.now() - 3 * 3600000).toISOString();
  const atualizado = _a.slice(8, 10) + "/" + _a.slice(5, 7) + " às " + _a.slice(11, 16) + " · Brasília";

  const hojeBrt = new Date(Date.now() - 3 * 3600000).toISOString().slice(5, 10).split("-").reverse().join("/");
  const vHoje = linhas.filter(l => l.hora.startsWith(hojeBrt));
  const vAntes = linhas.filter(l => !l.hora.startsWith(hojeBrt));
  const receitaHoje = (vHoje.reduce((s, l) => s + (l.cents || 0), 0) / 100).toFixed(2).replace(".", ",");
  const dataLonga = new Date(Date.now() - 3 * 3600000).toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

  const cardVenda = l => `<details class="venda" data-n="${(l.nome + " " + l.produto).toLowerCase()}" style="border-left-color:${l.cor}">
<summary><span class="dot" style="background:${l.cor}"></span><b>${l.nome}</b><span class="famchip" style="background:${FAM_COR[l.fam]}33;color:${FAM_COR[l.fam]}">${FAM_EMOJI[l.fam]} ${({ fisio: "Fisio", to: "TO", jiu: "Jiu", despluga: "Desplug.", idosos: "60+" })[l.fam] || "—"}</span><span class="mini">R$ ${l.valor} · ${l.hora.slice(6)}</span></summary>
<div class="corpo"><div class="prod">${l.produto}</div>
<div class="selo" style="color:${l.cor}">${l.selo}</div>
${l.bump ? `<div class="bump">${l.bump}</div>` : ""}
${l.acesso ? `<div style="display:flex;gap:6px"><button class="cp" style="flex:1" onclick="cop(this,'${l.acesso.msg.replace(/'/g, "\\'")}')">📋 mensagem c/ nome</button><button class="cp" style="flex:1" onclick="cop(this,'${l.acesso.link}')">🔗 só o link</button></div>` : ""}
</div></details>`;
  const cardAcesso = (a, cor) => {
    let lb = labelLimpo(a.label).replace(/^[^\wÀ-ú+]+\s*/, "");
    if (lb === lb.toUpperCase() && lb.length > 8) lb = lb.toLowerCase().replace(/(^|\s)\S/g, c => c.toUpperCase()).replace(/\bDe\b/g, "de");
    return `<div class="ac" style="border-left:4px solid ${cor}" data-b="${(lb + " " + a.chave).toLowerCase()}">
<span class="lb">${lb}</span>
${a.bump ? '<span class="tag tb">bump</span>' : ""}${a.senha ? `<span class="tag">senha ${a.senha}</span>` : ""}
<button class="cp" onclick="cop(this,'${a.url}')">copiar link</button></div>`;
  };
  const fams = [["fisio", "🩺 Fisioterapia", "#2e9fb3"], ["to_", "🧩 Terapia Ocupacional", "#e07a3e"], ["jj", "🥋 Jiu-Jitsu", "#4f7df0"], ["dp", "📚 Desplugadas", "#9a6ae8"], ["idosos", "🌻 Idosos", "#d0a03a"]];
  const usado = new Set();
  const grupos = fams.map(([pref, titulo, cor]) => {
    const its = acervo.filter(a => a.chave.startsWith(pref) || (pref === "to_" && a.chave.startsWith("to")))
      .sort((x, y) => (x.bump === y.bump) ? 0 : x.bump ? 1 : -1);
    its.forEach(a => usado.add(a.chave));
    return { titulo, its, cor };
  });
  grupos.push({ titulo: "📦 Outros", its: acervo.filter(a => !usado.has(a.chave)), cor: "#6b7687" });

  const sp = await coletarSessaoPronta();
  const spBloco = sp.ok ? `
<div class="painel" style="border-left:3px solid #E07A3E">
<h4>🧩 Sessão Pronta — saúde do produto</h4>
<div class="prod" style="margin:5px 0 0" id="spLinha">${sp.no_ar ? "🟢 no ar" : "🔴 FORA DO AR"} · resposta ${sp.ms}ms · plano ${sp.plano} · banda do ciclo: ${sp.banda_mb} MB (≈${sp.creditos_banda} de ${sp.creditos_plano} créditos) · 💡 sugestões de clientes: ${sp.sugestoes}</div>
${(sp.ultimas_sugestoes || []).map(s => `<div class="prod" style="margin-top:4px">↳ ${s.tipo === "problema" ? "🐞" : "💡"} [${s.tela || "?"} · ${s.quando || ""}] ${s.msg}</div>`).join("")}
</div>` : `<div class="painel"><h4>🧩 Sessão Pronta</h4><div class="pd">sem leitura agora ${sp.erro ? "(" + sp.erro + ")" : ""}</div></div>`;

  const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Central de Entregas — NEXUS OS</title>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Bricolage+Grotesque:wght@800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
<style>
:root{--bg:#04040a;--surface:#090914;--elevated:#0e0e1c;--overlay:#13132a;
--border:rgba(255,255,255,0.09);--border-md:rgba(255,255,255,0.15);
--text:#eeeef8;--text-2:#8888b0;--text-3:#44445e;
--nexus:#6366f1;--nexus-dim:rgba(99,102,241,0.14);--brn:#10b981;
--ok:#34d399;--warn:#fbbf24;--bad:#ef4444;--statusbar-h:42px;--sidebar-w:196px}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Outfit',sans-serif;background:var(--bg);color:var(--text);font-size:15px;-webkit-font-smoothing:antialiased}
body::after{content:'';position:fixed;inset:0;z-index:9990;pointer-events:none;opacity:0.04;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}
::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:var(--border-md);border-radius:2px}
#statusbar{position:fixed;top:0;left:0;right:0;height:var(--statusbar-h);background:rgba(8,8,18,0.97);border-bottom:1px solid rgba(99,102,241,0.20);display:flex;align-items:center;padding:0 16px;gap:14px;backdrop-filter:blur(16px);z-index:100;box-shadow:0 1px 24px rgba(99,102,241,0.08)}
#statusbar::after{content:'';position:absolute;bottom:-1px;left:0;width:30%;height:1px;background:linear-gradient(90deg,var(--nexus),transparent)}
.sb-logo{font-family:'Bricolage Grotesque',sans-serif;font-size:14px;font-weight:800;letter-spacing:2px;background:linear-gradient(135deg,#F2F2F2,#ABABAB 55%,#6A6A6A);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.sb-title{font-size:12px;color:var(--text-3);flex:1;letter-spacing:.3px}
.sb-clock{font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--text-3)}
.sb-online{display:flex;align-items:center;gap:5px;font-size:11px;color:var(--brn)}
.sb-pulse{width:6px;height:6px;border-radius:50%;background:var(--brn);animation:pulse 2s infinite}
@keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(16,185,129,.4)}50%{box-shadow:0 0 0 5px rgba(16,185,129,0)}}
.sb-rev{font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--warn);background:rgba(251,191,36,0.08);border:1px solid rgba(251,191,36,0.2);border-radius:20px;padding:2px 10px;white-space:nowrap}
#shell{display:flex;padding-top:var(--statusbar-h);min-height:100vh}
#sidebar{width:var(--sidebar-w);flex-shrink:0;background:var(--surface);border-right:1px solid var(--border);padding:16px 10px 12px;position:fixed;top:var(--statusbar-h);bottom:0;overflow-y:auto}
.sd-logo{font-family:'Bricolage Grotesque',sans-serif;font-size:13px;font-weight:800;letter-spacing:3px;color:var(--text);padding:0 8px 14px;display:flex;align-items:center;gap:8px}
.sd-logo::before{content:'📦';font-size:15px}
.sd-sec{font-size:9px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;color:var(--text-3);padding:12px 8px 6px}
.nav{display:flex;align-items:center;gap:9px;padding:8px 10px;border-radius:9px;font-size:13px;font-weight:500;color:var(--text-2);cursor:pointer;text-decoration:none;transition:all .15s;border:1px solid transparent;margin-bottom:2px}
.nav:hover{background:var(--elevated);color:var(--text)}
.nav.on{background:var(--nexus-dim);color:#fff;border-color:rgba(99,102,241,0.35)}
.sd-rodape{margin-top:14px;padding:10px 8px;border-top:1px solid var(--border);font-size:10px;color:var(--text-3);line-height:1.5}
#conteudo{flex:1;margin-left:var(--sidebar-w);padding:26px 28px 60px;max-width:1180px}
.hero h1{font-family:'Bricolage Grotesque',sans-serif;font-size:clamp(1.7rem,4vw,2.6rem);font-weight:800;letter-spacing:-1px;background:linear-gradient(135deg,#fff,#b9b9d6);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.hero .data{color:var(--text-3);font-size:.82rem;margin-top:4px;text-transform:capitalize}
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin:22px 0}
.stat{background:var(--elevated);border:1px solid var(--border);border-radius:14px;padding:18px 18px 14px;position:relative;overflow:hidden;transition:border-color .2s}
.stat:hover{border-color:var(--border-md)}
.stat::before{content:'';position:absolute;top:0;left:0;right:0;height:2px}
.stat b{display:block;font-family:'JetBrains Mono',monospace;font-size:1.55rem;letter-spacing:-.5px;line-height:1.1}
.stat span{font-size:.72rem;color:var(--text-2);font-weight:500}
.s-ind::before{background:var(--nexus)}.s-ind b{color:#818cf8}
.s-grn::before{background:var(--ok)}.s-grn b{color:var(--ok)}
.s-red::before{background:var(--bad)}.s-red b{color:var(--bad)}
.s-amb::before{background:var(--warn)}.s-amb b{color:var(--warn)}
.cols{display:grid;grid-template-columns:1fr 340px;gap:18px;align-items:start}
.painel{background:var(--elevated);border:1px solid var(--border);border-radius:14px;padding:15px 16px;margin-bottom:14px}
.painel h4{font-size:.78rem;font-weight:700;display:flex;align-items:center;gap:8px;margin-bottom:8px}
.painel .pd{font-size:.74rem;color:var(--text-2);line-height:1.55}
h3{font-size:.68rem;color:var(--text-2);margin:16px 0 8px;text-transform:uppercase;letter-spacing:.14em;font-weight:700}
.venda{background:var(--elevated);border-radius:12px;margin-bottom:8px;border:1px solid var(--border);border-left:4px solid #333;transition:border-color .2s}
.venda:hover{border-color:var(--border-md)}
.venda summary{display:flex;align-items:center;gap:8px;padding:11px 13px;cursor:pointer;list-style:none;font-size:.88rem;font-weight:500}
.venda summary::-webkit-details-marker{display:none}
.venda .mini{margin-left:auto;color:var(--text-2);font-size:.72rem;white-space:nowrap;font-family:'JetBrains Mono',monospace}
.dot{width:9px;height:9px;border-radius:99px;flex:none}
.famchip{flex:none;font-size:.62rem;font-weight:700;border-radius:6px;padding:3px 8px;white-space:nowrap}
.corpo{padding:0 13px 12px}.prod{color:var(--text-2);font-size:.76rem;margin-bottom:5px}
.selo{font-size:.82rem;font-weight:600}.bump{font-size:.78rem;margin-top:3px;color:#c3c6e8}
.cp{margin-top:8px;background:var(--nexus-dim);color:#c9cbff;border:1px solid rgba(99,102,241,0.4);border-radius:9px;padding:8px 15px;font-size:.79rem;font-weight:600;cursor:pointer;transition:all .15s;font-family:'Outfit',sans-serif}
.cp:hover{box-shadow:0 0 14px rgba(99,102,241,0.25)}.cp:active{transform:scale(.96)}
.busca{width:100%;background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:11px 14px;color:var(--text);font-size:.9rem;margin-bottom:10px;font-family:'Outfit',sans-serif;outline:none;transition:border-color .2s}
.busca:focus{border-color:rgba(99,102,241,0.5)}
.ac{display:flex;align-items:center;gap:8px;background:var(--elevated);border:1px solid var(--border);border-radius:11px;padding:11px 13px;margin-bottom:6px}
.ac .lb{font-size:.82rem;flex:1;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;line-height:1.35}
.ac .cp{margin:0;padding:6px 12px;flex:none;font-size:.72rem}
.tag{flex:none;font-size:.68rem;background:var(--overlay);color:var(--text-2);border-radius:6px;padding:3px 8px;white-space:nowrap}
.tag.tb{background:rgba(167,139,250,0.15);color:#c4b5fd}
.grp{margin-bottom:5px}.grp summary{padding:10px 13px;background:var(--surface);border:1px solid var(--border);border-radius:10px;font-weight:700;font-size:.86rem;cursor:pointer;list-style:none;margin-bottom:6px}
.grp summary::-webkit-details-marker{display:none}
#tAcessos{display:none}body.ac-on #tVendas{display:none}body.ac-on .col-side{display:none}body.ac-on #tAcessos{display:block}
.vazio{color:var(--text-2);text-align:center;padding:18px;font-size:.85rem}
body.claro{--bg:#f3f4f9;--surface:#fff;--elevated:#fff;--overlay:#eef0f7;--border:rgba(20,25,50,.10);--border-md:rgba(20,25,50,.18);--text:#1b2032;--text-2:#5b6178;--text-3:#9aa0b5;--nexus-dim:rgba(99,102,241,.10)}
body.claro::after{opacity:.02}
body.claro #statusbar,body.claro #sidebar,body.claro #mob{background:rgba(255,255,255,.97)}
body.claro .hero h1{background:linear-gradient(135deg,#232840,#5b6178);-webkit-background-clip:text}
body.claro .cp{color:#4649c9}
body.claro .venda,body.claro .stat,body.claro .painel,body.claro .ac{box-shadow:0 2px 12px rgba(20,25,50,.05)}
#mob{display:none}
body.embed #statusbar,body.embed #sidebar,body.embed #mob{display:none !important}
body.embed #shell{padding-top:0}
body.embed #conteudo{margin-left:0;padding:16px 20px 40px;max-width:none}
body.embed .hero{display:none}
@media(max-width:980px){
  #sidebar{display:none}
  #conteudo{margin-left:0;padding:18px 14px 84px}
  .stats{grid-template-columns:1fr 1fr;gap:10px}
  .cols{grid-template-columns:1fr}
  .sb-title{display:none}
  #mob{display:flex;position:fixed;left:0;right:0;bottom:0;background:rgba(8,8,18,0.97);border-top:1px solid var(--border);z-index:100;backdrop-filter:blur(16px)}
  #mob a{flex:1;text-align:center;padding:11px 4px 13px;color:var(--text-2);font-size:.66rem;font-weight:700;text-decoration:none;letter-spacing:.04em}
  #mob a.on{color:#c9cbff}
  #mob a i{display:block;font-style:normal;font-size:1.15rem;margin-bottom:2px}
}
</style></head><body>
<div id="statusbar">
  <span class="sb-logo">M&nbsp;A&nbsp;X</span>
  <span class="sb-title">Central de Entregas</span>
  <span class="sb-clock" id="sbClock">--:--:--</span>
  <span class="sb-online"><span class="sb-pulse"></span>Online</span>
  <span class="sb-rev" id="sbRev">R$ ${receitaHoje} hoje</span>
</div>
<div id="shell">
<aside id="sidebar">
  <div class="sd-logo">NEXUS OS</div>
  <div class="sd-sec">Entregas</div>
  <a class="nav on" id="nvV" onclick="aba(0)">🛒 Vendas</a>
  <a class="nav" id="nvA" onclick="aba(1)">🗂️ Acessos</a>
  <a class="nav" href="${PAINEL}/revisar/catalogo-k4m8p2/">🖼️ Imagens</a>
  <div class="sd-sec">Produtos</div>
  <a class="nav" href="https://sessao-pronta-to.netlify.app" target="_blank">🧩 Sessão Pronta</a>
  <div class="sd-sec">Nexus</div>
  <a class="nav" href="/dashboard">↩ Voltar ao dashboard</a>
  <div class="sd-rodape">dados ao vivo do banco<br><span id="qnd">${atualizado}</span></div>
</aside>
<main id="conteudo">
<div class="hero"><h1 id="oi">Olá, Rodrigo</h1><div class="data">${dataLonga}</div></div>
<div class="stats">
  <div class="stat s-ind"><b>R$ ${receitaHoje}</b><span>Receita hoje</span></div>
  <div class="stat s-grn"><b>${ok}</b><span>Entregues (3 dias)</span></div>
  <div class="stat s-red"><b>${semEntrega}</b><span>Sem entrega</span></div>
  <div class="stat s-amb"><b>${bumpsPend}</b><span>Bumps pendentes</span></div>
</div>
<div class="cols">
<div>
<div id="tVendas">
<input class="busca" placeholder="🔍 buscar cliente pelo nome…" oninput="filV(this.value)">
<h3>Hoje · ${vHoje.length} ${vHoje.length === 1 ? "venda" : "vendas"}</h3>
${vHoje.map(cardVenda).join("\n") || '<div class="vazio">nenhuma venda ainda hoje</div>'}
<details class="grp" id="grpAntes"><summary>📅 Dias anteriores · ${vAntes.length} ${vAntes.length === 1 ? "venda" : "vendas"} — toque pra abrir</summary>
${(() => { let dia = ""; return vAntes.map(l => { const d = l.hora.slice(0, 5); const cab = d !== dia ? `<h3>${d}</h3>` : ""; dia = d; return cab + cardVenda(l); }).join("\n"); })()}</details>
<div class="pd" style="margin-top:10px;font-size:.72rem;color:var(--text-3)">Toque numa venda pra ver e copiar o acesso. ✅/📧 entregue · 🟠 conferir — o Max é avisado sozinho.</div>
</div>
<div id="tAcessos">
<input class="busca" placeholder="🔍 buscar produto ou bump…" oninput="fil(this.value)">
${grupos.map(g => g.its.length ? `<details class="grp" open><summary style="border-left:4px solid ${g.cor}">${g.titulo} · ${g.its.length}</summary>${g.its.map(a => cardAcesso(a, g.cor)).join("\n")}</details>` : "").join("\n")}
<div class="pd" style="font-size:.72rem;color:var(--text-3)">📋 copia link + senha prontos pra colar no WhatsApp do cliente.</div>
</div>
</div>
<aside class="col-side">
${spBloco}
<div class="painel">
<h4>⚡ Atalhos</h4>
<div class="pd">🖼️ <a href="${PAINEL}/revisar/catalogo-k4m8p2/" style="color:#c9cbff">Catálogo de imagens</a><br>🧩 <a href="https://sessao-pronta-to.netlify.app" target="_blank" style="color:#c9cbff">Abrir o Sessão Pronta</a><br>💡 <a href="${PAINEL}/revisar/fotos-sessao-pronta/" style="color:#c9cbff">Galeria de revisões</a></div>
</div>
</aside>
</div>
</main>
</div>
<nav id="mob">
<a class="on" id="mbV" onclick="aba(0)"><i>🛒</i>Vendas</a>
<a id="mbA" onclick="aba(1)"><i>🗂️</i>Acessos</a>
<a href="${PAINEL}/revisar/catalogo-k4m8p2/"><i>🖼️</i>Imagens</a>
<a href="https://sessao-pronta-to.netlify.app" target="_blank"><i>🧩</i>S. Pronta</a>
</nav>
<script>
function cop(b,t){const x=t.replace(/\\\\n/g,'\\n');navigator.clipboard.writeText(x).then(()=>{const o=b.textContent;b.textContent='✓ copiado!';setTimeout(()=>b.textContent=o,1400)}).catch(()=>{window.prompt('Copie aqui (Ctrl+C / segurar e copiar):',x)})}
function aba(i){document.body.classList.toggle('ac-on',i===1);
['nvV','mbV'].forEach(id=>{const e=document.getElementById(id);if(e)e.classList.toggle('on',i===0)});
['nvA','mbA'].forEach(id=>{const e=document.getElementById(id);if(e)e.classList.toggle('on',i===1)})}
function fil(v){v=v.toLowerCase();document.querySelectorAll('.ac').forEach(e=>e.style.display=e.dataset.b.includes(v)?'flex':'none')}
function filV(v){v=v.toLowerCase();const tem=v.length>0;if(tem)document.getElementById('grpAntes').setAttribute('open','');let vis=0;document.querySelectorAll('details.venda').forEach(e=>{const m=(e.dataset.n||'').includes(v);e.style.display=m?'block':'none';if(m)vis++});
document.querySelectorAll('#tVendas h3').forEach(h=>{let n=h.nextElementSibling,acha=false;while(n&&n.tagName!=='H3'){if(n.matches&&n.matches('details.venda')&&n.style.display!=='none'){acha=true;break}if(n.querySelector){const c=[...n.querySelectorAll('details.venda')].some(x=>x.style.display!=='none');if(c){acha=true;break}}n=n.nextElementSibling}h.style.display=(!tem||acha)?'block':'none'});
let z=document.getElementById('zero');if(!z){z=document.createElement('div');z.id='zero';z.className='vazio';z.textContent='nenhuma venda com esse nome nos últimos 3 dias — pede pro Max conferir';document.getElementById('tVendas').appendChild(z)}z.style.display=(tem&&vis===0)?'block':'none'}
if(localStorage.getItem('nx-tema')!=='escuro')document.body.classList.add('claro');
setInterval(()=>{const d=new Date(Date.now()-3*3600000);document.getElementById('sbClock').textContent=d.toISOString().slice(11,19)},1000);
(function(){const hh=new Date(Date.now()-3*3600000).getUTCHours();document.getElementById('oi').textContent=(hh<12?'Bom dia':hh<18?'Boa tarde':'Boa noite')+', Rodrigo'})();
setTimeout(()=>location.reload(), 600000);
</script>
</body></html>`;

  return { html, dados: { gerado: new Date().toISOString(), placar: { total, entregues: ok, login_antigo: antigas, sem_entrega: semEntrega, bumps_pendentes: bumpsPend }, receita_hoje: receitaHoje, vendas_hoje: vHoje.length, sessao_pronta: sp, vendas: linhas } };
}

const PIN = process.env.CENTRAL_PIN || "";
// Sem senha configurada = NEGA (antes liberava — furo apontado pelo Clone 28/07)
function comPin(req) {
  if (!PIN) return false;                                  // sem senha configurada = NEGA
  const cook = (req.headers.cookie || "").match(/nxk=([^;]+)/);
  return req.query.k === PIN || req.headers["x-pin"] === PIN || (cook && cook[1] === PIN);
}
function pedeSenha(res) {
  res.status(401).send(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font-family:sans-serif;background:#f5f6fa;display:flex;align-items:center;justify-content:center;height:100vh;margin:0}form{background:#fff;padding:28px;border-radius:16px;box-shadow:0 10px 40px rgba(0,0,0,.10);text-align:center}input{padding:12px;border:1.5px solid #ddd;border-radius:10px;font-size:16px;text-align:center;letter-spacing:.3em}button{margin-top:10px;padding:12px 22px;border:0;border-radius:10px;background:#6366f1;color:#fff;font-weight:700;font-size:15px;cursor:pointer;display:block;width:100%}</style></head><body><form onsubmit="event.preventDefault();location.href=location.pathname+'?k='+encodeURIComponent(document.getElementById('s').value)">🔒<br><br><input id="s" type="password" placeholder="senha"/><button>Entrar</button></form></body></html>`);
}

let cache = { t: 0, html: "", dados: null };
async function fresco() {
  if (Date.now() - cache.t > 5 * 60000 || !cache.html) {
    const m = await montar();
    cache = { t: Date.now(), html: m.html, dados: m.dados };
  }
  return cache;
}

router.get("/" + SLUG, async (req, res) => {
  if (!comPin(req)) return pedeSenha(res);
  try {
    let h = (await fresco()).html;
    if (req.query.embed) h = h.replace("<body>", '<body class="embed">');
    if (req.query.aba === "acessos") h = h.replace("</body>", "<script>aba(1)</script></body>");
    res.set("Cache-Control", "no-cache").send(h);
  }
  catch (e) { res.status(500).send("Central indisponível agora: " + String(e).slice(0, 120)); }
});
router.get("/" + SLUG + "/dados.json", async (req, res) => {
  if (!comPin(req)) return res.status(401).json({ erro: "senha" });
  try { res.json((await fresco()).dados); }
  catch (e) { res.status(500).json({ erro: String(e).slice(0, 120) }); }
});

// ═══ WHATSAPP · SOFIA (leitura) — conversas direto do banco, sem mexer na Sofia ═══
async function montarWhats() {
  const desde = new Date(Date.now() - 72 * 3600000).toISOString();
  const msgs = await get(`conversation_messages?clinic_id=eq.${CLINIC}&created_at=gte.${desde}&select=clinic_patient_id,direction,text,created_at&order=created_at.asc&limit=1000`);
  const ids = [...new Set(msgs.map(m => m.clinic_patient_id).filter(Boolean))];
  const pacientes = [];
  for (let i = 0; i < ids.length; i += 50) {
    const lote = ids.slice(i, i + 50).join(",");
    pacientes.push(...await get(`clinic_patients?id=in.(${lote})&select=id,name,phone`));
  }
  const porId = Object.fromEntries(pacientes.map(p => [p.id, p]));
  const conversas = {};
  for (const m of msgs) {
    if (!m.clinic_patient_id) continue;
    (conversas[m.clinic_patient_id] = conversas[m.clinic_patient_id] || []).push(
      { d: m.direction, t: String(m.text || "").slice(0, 1200), h: m.created_at });
  }
  const lista = Object.entries(conversas).map(([id, ms]) => ({
    id, nome: nomeBonito(porId[id]?.name), fone: "…" + suf(porId[id]?.phone),
    ultima: ms[ms.length - 1], total: ms.length, ms,
  })).sort((a, b) => (a.ultima.h < b.ultima.h ? 1 : -1));
  const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const DADOS = JSON.stringify(lista.map(c => ({ ...c, ms: c.ms.map(m => ({ ...m, t: esc(m.t) })), nome: esc(c.nome) })));

  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>WhatsApp · Sofia — NEXUS OS</title>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet">
<style>
:root{--bg:#04040a;--surface:#090914;--elevated:#0e0e1c;--border:rgba(255,255,255,0.09);--border-md:rgba(255,255,255,0.15);
--text:#eeeef8;--text-2:#8888b0;--text-3:#44445e;--nexus:#6366f1;--brn:#10b981}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Outfit',sans-serif;background:var(--bg);color:var(--text);font-size:14px;height:100vh;display:flex;flex-direction:column}
.aviso{padding:9px 16px;background:rgba(99,102,241,0.10);border-bottom:1px solid var(--border);font-size:.72rem;color:var(--text-2)}
#duo{flex:1;display:flex;min-height:0}
#lista{width:320px;border-right:1px solid var(--border);overflow-y:auto;background:var(--surface);flex-shrink:0}
.conv{padding:11px 14px;border-bottom:1px solid var(--border);cursor:pointer;transition:background .15s}
.conv:hover{background:var(--elevated)}
.conv.on{background:rgba(99,102,241,0.12);border-left:3px solid var(--nexus)}
.conv b{font-size:.86rem;display:flex;justify-content:space-between;gap:8px}
.conv b span{font-family:'JetBrains Mono',monospace;font-size:.62rem;color:var(--text-3);font-weight:500}
.conv .prev{font-size:.72rem;color:var(--text-2);margin-top:3px;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden}
#chat{flex:1;display:flex;flex-direction:column;min-width:0}
#chat-head{padding:11px 16px;border-bottom:1px solid var(--border);background:var(--surface);font-weight:700;font-size:.9rem;display:none}
#voltar{display:none;background:none;border:1px solid var(--border);color:var(--text-2);border-radius:8px;padding:4px 10px;margin-right:10px;cursor:pointer;font-family:'Outfit',sans-serif}
#msgs{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:8px}
.msg{max-width:72%;padding:9px 13px;border-radius:14px;font-size:.82rem;line-height:1.5;white-space:pre-wrap;word-break:break-word}
.msg.out{align-self:flex-end;background:rgba(16,185,129,0.14);border:1px solid rgba(16,185,129,0.25);border-bottom-right-radius:4px}
.msg.in{align-self:flex-start;background:var(--elevated);border:1px solid var(--border);border-bottom-left-radius:4px}
.msg .hh{display:block;font-family:'JetBrains Mono',monospace;font-size:.6rem;color:var(--text-3);margin-top:4px;text-align:right}
.vazio{color:var(--text-2);text-align:center;margin:auto;font-size:.85rem}
@media(max-width:860px){#lista{width:100%}body.aberto #lista{display:none}#chat{display:none}body.aberto #chat{display:flex}body.aberto #voltar{display:inline-block}}
#composer{display:none;border-top:1px solid var(--border);background:var(--surface);padding:10px 12px;gap:8px;align-items:center}
#composer.on{display:flex}
#composer button.ferramenta{background:none;border:1px solid var(--border);color:var(--text-3);border-radius:9px;width:38px;height:38px;cursor:not-allowed;font-size:1rem}
#cx-texto{flex:1;background:var(--elevated);border:1px solid var(--border);border-radius:20px;padding:10px 16px;color:var(--text);font-size:.88rem;font-family:'Outfit',sans-serif;outline:none}
#cx-texto:focus{border-color:rgba(37,211,102,.5)}
#cx-enviar{background:#25D366;border:0;color:#04140a;border-radius:50%;width:40px;height:40px;font-size:1.1rem;cursor:pointer;font-weight:900}
#cx-enviar:disabled{opacity:.4;cursor:not-allowed}
#cx-aviso{display:none;border-top:1px solid var(--border);background:var(--surface);padding:10px 14px;font-size:.74rem;color:var(--text-2)}
#cx-aviso.on{display:block}
#cx-aviso .chip{display:inline-block;border:1px dashed var(--border-md);border-radius:8px;padding:4px 10px;margin:4px 6px 0 0;color:var(--text-3);font-size:.7rem}
body.claro{--bg:#f3f4f9;--surface:#fff;--elevated:#f6f7fb;--border:rgba(20,25,50,.10);--border-md:rgba(20,25,50,.18);--text:#1b2032;--text-2:#5b6178;--text-3:#9aa0b5}
body.claro .msg.out{background:#d8f7e5;border-color:#b4ecc9;color:#0c3d22}
body.claro .msg.in{background:#fff;border-color:rgba(20,25,50,.12)}
body.claro .aviso{background:#eef0fb}
</style></head><body>
<div class="aviso">👁 Modo leitura — a Sofia continua atendendo sozinha. Quando ela for só nossa, este é o lugar de responder. Atualiza a cada 2 min.</div>
<div id="duo">
<div id="lista"></div>
<div id="chat"><div id="chat-head"><button id="voltar" onclick="document.body.classList.remove('aberto')">←</button><span id="chat-nome"></span></div>
<div id="msgs"><div class="vazio">👈 escolha uma conversa</div></div>
<div id="composer">
  <button class="ferramenta" title="Anexos (imagem, áudio, arquivo) chegam na próxima atualização — porta nova pedida ao time técnico" disabled>📎</button>
  <input id="cx-texto" placeholder="Responder como Sofia…" onkeydown="if(event.key==='Enter')enviar()"/>
  <button id="cx-enviar" onclick="enviar()">➤</button>
</div>
<div id="cx-aviso"></div>
</div>
</div>
<script>
const CONVAS = ${DADOS};
const limpo = s => { const d=document.createElement('div'); d.innerHTML=String(s); return (d.textContent||'').replace(/[<>]/g,''); };
const hh = iso => new Date(new Date(iso).getTime()-3*3600000).toISOString().slice(11,16);
const dd = iso => new Date(new Date(iso).getTime()-3*3600000).toISOString().slice(5,10).split('-').reverse().join('/');
document.getElementById('lista').innerHTML = CONVAS.map((c,i)=>
  \`<div class="conv" id="cv-\${i}" onclick="abrir(\${i})"><b>\${c.nome} <span>\${dd(c.ultima.h)} \${hh(c.ultima.h)}</span></b>
  <div class="prev">\${c.ultima.d==='out'?'🤖 ':''}\${limpo(c.ultima.t).slice(0,90)}</div></div>\`).join('') || '<div class="vazio" style="margin:30px">nenhuma conversa nas últimas 72h</div>';
function abrir(i){
  document.querySelectorAll('.conv').forEach(e=>e.classList.remove('on'));
  document.getElementById('cv-'+i).classList.add('on');
  const c = CONVAS[i];
  document.getElementById('chat-head').style.display='flex';
  document.getElementById('chat-nome').textContent = c.nome + ' · ' + c.fone;
  document.getElementById('msgs').innerHTML = c.ms.map(m=>
    \`<div class="msg \${m.d==='out'?'out':'in'}">\${m.t}<span class="hh">\${dd(m.h)} \${hh(m.h)}</span></div>\`).join('');
  const box=document.getElementById('msgs'); box.scrollTop=box.scrollHeight;
  document.body.classList.add('aberto');
}
if(localStorage.getItem('nx-tema')!=='escuro')document.body.classList.add('claro');
const K = new URLSearchParams(location.search).get('k')||'';
let ATUAL = null;
function janelaAberta(c){
  const ult = [...c.ms].reverse().find(m=>m.d==='in');
  return ult ? (Date.now()-new Date(ult.h).getTime()) < 24*3600000 : false;
}
const _abrir = abrir;
abrir = function(i){
  _abrir(i); ATUAL = i;
  const c = CONVAS[i], ok = janelaAberta(c);
  document.getElementById('composer').classList.toggle('on', ok);
  const av = document.getElementById('cx-aviso');
  av.classList.toggle('on', !ok);
  if(!ok) av.innerHTML = '⏳ <b>Conversa fora da janela de 24h do WhatsApp</b> — mensagem livre não é permitida pela Meta. O envio de MODELOS aprovados por aqui chega na próxima atualização (porta nova já pedida ao time técnico):<br>'+
    ['cart_recovery_t1','cart_recovery_t2','cart_recovery_t3'].map(t=>'<span class="chip">📄 '+t+'</span>').join('');
};
async function enviar(){
  const cx = document.getElementById('cx-texto'), bt = document.getElementById('cx-enviar');
  const texto = cx.value.trim();
  if(!texto || ATUAL==null) return;
  bt.disabled = true;
  try{
    const r = await fetch(location.pathname + '/enviar?k=' + encodeURIComponent(K), {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ patient_id: CONVAS[ATUAL].id, text: texto })
    });
    const d = await r.json().catch(()=>({}));
    if(r.ok){
      cx.value='';
      const box = document.getElementById('msgs');
      box.insertAdjacentHTML('beforeend', '<div class="msg out">'+texto.replace(/&/g,'&amp;').replace(/</g,'&lt;')+'<span class="hh">agora · ✓ enviada pela Sofia</span></div>');
      box.scrollTop = box.scrollHeight;
    } else { alert('Não foi: ' + (d.erro || r.status)); }
  } catch(e){ alert('Falha de rede — tenta de novo'); }
  bt.disabled = false;
}
setTimeout(()=>location.reload(), 180000);
</script></body></html>`;
}
let cacheW = { t: 0, html: "" };
router.get("/whats-" + SLUG.replace("central-", ""), async (req, res) => {
  if (!comPin(req)) return pedeSenha(res);
  try {
    if (Date.now() - cacheW.t > 2 * 60000 || !cacheW.html) cacheW = { t: Date.now(), html: await montarWhats() };
    res.set("Cache-Control", "no-cache").send(cacheW.html);
  } catch (e) { res.status(500).send("WhatsApp indisponível: " + String(e).slice(0, 120)); }
});

// envio de texto livre PELA SOFIA (mesma porta dos robôs do plantão)
router.post("/whats-" + SLUG.replace("central-", "") + "/enviar", express.json(), async (req, res) => {
  if (!comPin(req)) return res.status(401).json({ erro: "senha" });
  const { patient_id, text } = req.body || {};
  if (!patient_id || !String(text || "").trim()) return res.status(400).json({ erro: "faltou mensagem ou destinatário" });
  try {
    const r = await fetch("https://www.dominancestudio.com.br/api/v1/agent/send", {
      method: "POST",
      headers: { Authorization: "Bearer " + (process.env.SOFIA_TOKEN || ""), "Content-Type": "application/json" },
      body: JSON.stringify({ patient_id, text: String(text).trim() }),
    });
    const corpo = await r.json().catch(() => ({}));
    cacheW.t = 0; // conversa muda: próxima carga vem fresca
    res.status(r.ok ? 200 : 502).json(r.ok ? { ok: true } : { erro: corpo.error || ("Meta recusou (" + r.status + ")") });
  } catch (e) { res.status(502).json({ erro: String(e).slice(0, 100) }); }
});

// ═══ FINANCEIRO DO DIA — banco de vendas × UTMify (gastos) × imposto ═══
const UTMIFY_URL = process.env.UTMIFY_MCP_URL || "";
const PAINEIS_UTM = { "682e5acce4e4e7748bb669ae": "TO", "69685cb9af5f797b4a89f7db": "Desplugadas", "69c1e3332cc7808546f6e544": "Jiu-Jitsu" };
const IMPOSTO_PCT = parseFloat(process.env.IMPOSTO_PCT || "10");
async function utmify(nome, args) {
  const r = await fetch(UTMIFY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json, text/event-stream", "User-Agent": "curl/8.5.0" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name: nome, arguments: args } }),
  });
  const d = await r.json();
  const t = d?.result?.content?.[0]?.text || "{}";
  if (d?.result?.isError) throw new Error(String(t).slice(0, 150));
  return JSON.parse(t);
}
async function gastosUtmify(deDias) {
  const hoje = new Date(Date.now() - 3 * 3600000);
  const fmt = x => x.toISOString().slice(0, 10);
  // janela exata: hoje = só hoje; 7 dias = hoje e os 6 anteriores (nunca o futuro)
  const faixa = { from: fmt(new Date(hoje.getTime() - Math.max(0, deDias - (deDias ? 1 : 0)) * 86400000)), to: fmt(hoje) };
  const paineis = [];
  for (const [dash, nome] of Object.entries(PAINEIS_UTM)) {
    try {
      const camps = (await utmify("get_meta_ad_objects", { dashboardId: dash, dateRange: faixa, level: "campaign" })).results || [];
      let gasto = 0, receitaUtm = 0, vendas = 0;
      for (const c of camps) {
        gasto += (c.totalSpent || c.spend || 0) / 100;      // UTMify manda em centavos
        receitaUtm += (c.revenue || 0) / 100;
        vendas += c.approvedOrdersCount || 0;
      }
      paineis.push({ nome, gasto: +gasto.toFixed(2), receita_utm: +receitaUtm.toFixed(2), vendas, roas: gasto ? +(receitaUtm / gasto).toFixed(2) : null });
    } catch (e) { paineis.push({ nome, erro: String(e).slice(0, 80) }); }
  }
  const gastoTotal = paineis.reduce((s, p) => s + (p.gasto || 0), 0);
  return { faixa, paineis, gasto_total: +gastoTotal.toFixed(2) };
}
async function montarFinanceiro() {
  const [dHoje, u1, u7] = await Promise.all([fresco(), gastosUtmify(0), gastosUtmify(7)]);
  const dd = dHoje.dados;
  const receita = parseFloat(String(dd.receita_hoje).replace(",", ".")) || 0;
  const gasto = u1.gasto_total;
  const imposto = +(receita * IMPOSTO_PCT / 100).toFixed(2);
  const falhos = u1.paineis.filter(p => p.erro);
  const gastoCompleto = falhos.length === 0;
  const lucro = gastoCompleto ? +(receita - gasto - imposto).toFixed(2) : null;
  const fmtR = v => "R$ " + (v == null ? "—" : v.toFixed(2).replace(".", ","));
  const receita7 = null; // banco: janela da central é 3 dias; 7d fica por conta da UTMify
  const linhaPainel = p => p.erro
    ? `<tr><td>${p.nome}</td><td colspan="4" style="color:var(--text-3)">sem leitura (${p.erro})</td></tr>`
    : `<tr><td><b>${p.nome}</b></td><td>${fmtR(p.gasto)}</td><td>${fmtR(p.receita_utm)}</td><td>${p.vendas}</td><td>${p.roas ?? "—"}</td></tr>`;
  const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Financeiro do Dia — NEXUS OS</title>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Bricolage+Grotesque:wght@800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
<style>
:root{--bg:#04040a;--surface:#090914;--elevated:#0e0e1c;--border:rgba(255,255,255,0.09);--border-md:rgba(255,255,255,0.15);
--text:#eeeef8;--text-2:#8888b0;--text-3:#44445e;--nexus:#6366f1;--ok:#34d399;--warn:#fbbf24;--bad:#ef4444}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Outfit',sans-serif;background:var(--bg);color:var(--text);font-size:15px;padding:22px 26px 50px}
body.claro{--bg:#f3f4f9;--surface:#fff;--elevated:#fff;--border:rgba(20,25,50,.10);--border-md:rgba(20,25,50,.18);--text:#1b2032;--text-2:#5b6178;--text-3:#9aa0b5}
.hero h1{font-family:'Bricolage Grotesque',sans-serif;font-size:clamp(1.5rem,3.6vw,2.3rem);font-weight:800;letter-spacing:-1px}
.hero .data{color:var(--text-3);font-size:.8rem;margin-top:3px;text-transform:capitalize}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:13px;margin:20px 0}
.stat{background:var(--elevated);border:1px solid var(--border);border-radius:14px;padding:16px 16px 13px;position:relative;overflow:hidden}
.stat::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:var(--cor,#6366f1)}
.stat b{display:block;font-family:'JetBrains Mono',monospace;font-size:1.4rem;letter-spacing:-.5px;color:var(--cor,#818cf8)}
.stat span{font-size:.7rem;color:var(--text-2);font-weight:500}
.stat .sub{display:block;font-size:.62rem;color:var(--text-3);margin-top:3px}
.painel{background:var(--elevated);border:1px solid var(--border);border-radius:14px;padding:15px 16px;margin-top:14px}
.painel h4{font-size:.76rem;font-weight:700;margin-bottom:9px;text-transform:uppercase;letter-spacing:.1em;color:var(--text-2)}
table{width:100%;border-collapse:collapse;font-size:.82rem}
td,th{padding:8px 8px;border-bottom:1px solid var(--border);text-align:left}
th{font-size:.64rem;text-transform:uppercase;letter-spacing:.08em;color:var(--text-3)}
td b{font-weight:700}
.nota{font-size:.7rem;color:var(--text-3);margin-top:10px;line-height:1.5}
</style></head><body>
<div class="hero"><h1 id="oi">Resumo do dia</h1><div class="data">${new Date(Date.now() - 3 * 3600000).toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" })} · imposto estimado em ${IMPOSTO_PCT}%</div></div>
<div class="stats">
  <div class="stat" style="--cor:#818cf8"><b>${fmtR(receita)}</b><span>Receita hoje (banco de vendas)</span><span class="sub">${dd.vendas_hoje} vendas · fonte: GG/Dominance</span></div>
  <div class="stat" style="--cor:${gastoCompleto ? "#fb923c" : "#ef4444"}"><b>${gastoCompleto ? fmtR(gasto) : "⚠️ incompleto"}</b><span>Gasto em anúncios hoje</span><span class="sub">${gastoCompleto ? `fonte: UTMify (${u1.paineis.length}/${u1.paineis.length} painéis)` : `FALHOU em ${falhos.length} de ${u1.paineis.length} painéis — número não confiável`}</span></div>
  <div class="stat" style="--cor:#fbbf24"><b>${fmtR(imposto)}</b><span>Imposto estimado (${IMPOSTO_PCT}%)</span><span class="sub">ajustável — me diga a alíquota real</span></div>
  <div class="stat" style="--cor:${!gastoCompleto ? "#ef4444" : (lucro >= 0 ? "#34d399" : "#ef4444")}"><b>${gastoCompleto ? fmtR(lucro) : "— sem número"}</b><span>Lucro líquido estimado hoje</span><span class="sub">${gastoCompleto ? "receita − anúncios − imposto" : "🚫 NÃO calculo lucro com gasto incompleto — decisão de verba precisa de dado inteiro"}</span></div>
</div>
<div class="painel"><h4>Por painel de tráfego · HOJE</h4>
<table><tr><th>Oferta</th><th>Gasto</th><th>Receita (UTMify)</th><th>Vendas</th><th>ROAS</th></tr>
${u1.paineis.map(linhaPainel).join("")}</table></div>
<div class="painel"><h4>Últimos 7 dias (UTMify)</h4>
<table><tr><th>Oferta</th><th>Gasto</th><th>Receita (UTMify)</th><th>Vendas</th><th>ROAS</th></tr>
${u7.paineis.map(linhaPainel).join("")}
<tr><td><b>TOTAL</b></td><td><b>${fmtR(u7.gasto_total)}</b></td><td><b>${fmtR(u7.paineis.reduce((s,p)=>s+(p.receita_utm||0),0))}</b></td><td><b>${u7.paineis.reduce((s,p)=>s+(p.vendas||0),0)}</b></td><td></td></tr></table></div>
<div class="nota">⚠️ A receita da UTMify subdimensiona (não soma todos os bumps) — o número OFICIAL de receita é o do banco (primeiro cartão). Gasto cobre os painéis TO, Desplugadas e Jiu; se houver tráfego fora deles (ex.: Fisio em painel próprio), me avisa que eu adiciono. Atualiza a cada 5 min.</div>
<script>
if(localStorage.getItem('nx-tema')!=='escuro')document.body.classList.add('claro');
(function(){const hh=new Date(Date.now()-3*3600000).getUTCHours();document.getElementById('oi').textContent=(hh<12?'Bom dia':hh<18?'Boa tarde':'Boa noite')+', Rodrigo — resumo do dia'})();
setTimeout(()=>location.reload(), 300000);
</script></body></html>`;
  return { html, dados: { receita_hoje: receita, gasto_hoje: gasto, gasto_completo: gastoCompleto, imposto, lucro, paineis_hoje: u1.paineis, sete_dias: u7 } };
}
let cacheF = { t: 0, html: "", dados: null };
async function frescoFin() {
  if (Date.now() - cacheF.t > 5 * 60000 || !cacheF.html) { const m = await montarFinanceiro(); cacheF = { t: Date.now(), html: m.html, dados: m.dados }; }
  return cacheF;
}
router.get("/financeiro-" + SLUG.replace("central-", ""), async (req, res) => {
  if (!comPin(req)) return pedeSenha(res);
  try { res.set("Cache-Control", "no-cache").send((await frescoFin()).html); }
  catch (e) { res.status(500).send("Financeiro indisponível: " + String(e).slice(0, 140)); }
});
router.get("/financeiro-" + SLUG.replace("central-", "") + "/dados.json", async (req, res) => {
  if (!comPin(req)) return res.status(401).json({ erro: "senha" });
  try { res.json((await frescoFin()).dados); } catch (e) { res.status(500).json({ erro: String(e).slice(0, 140) }); }
});

module.exports = router;
