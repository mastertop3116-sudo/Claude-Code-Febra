#!/usr/bin/env node
// ============================================================
// RAIO-X DE ESCALA do Estúdio / MAX Criador
// Roda quando o Rodrigo pede pra "analisar a probabilidade de escala".
// Faz um diagnóstico HONESTO do que já aguenta e qual o próximo gargalo.
//   node scripts/check-escala.js
// Não gasta IA. Só lê o código + dá uma fungada no site no ar.
// ============================================================
'use strict';
const fs = require('fs');
const path = require('path');
const https = require('https');
const RAIZ = path.join(__dirname, '..');
const read = f => { try { return fs.readFileSync(path.join(RAIZ, f), 'utf8'); } catch (_) { return ''; } };
const has = (txt, re) => re.test(txt);

const pkg = (() => { try { return JSON.parse(read('package.json')); } catch (_) { return {}; } })();
const deps = Object.assign({}, pkg.dependencies, pkg.devDependencies);
const auth = read('auth.js');
const server = read('server.js');
const engine = read('departments/creative/engines/criador_engine.js');

// ── Checagens (cada uma: ok? + peso + dica) ─────────────────
const QUEUE_LIBS = ['bullmq', 'bull', 'bee-queue', 'p-queue', 'p-limit', 'fastq'];
const checks = [
  {
    nome: 'Usuários num BANCO DE DADOS (não em arquivo)',
    ok: !has(auth, /usuarios\.json/) || has(auth, /supabase|createClient|postgres|prisma/i),
    porque: 'Arquivo (usuarios.json) trava em centenas e some quando o servidor reinicia. Banco aguenta milhares.',
    fase: '1.000+',
  },
  {
    nome: 'FILA pra gerar os PDFs (não trava no pico)',
    ok: QUEUE_LIBS.some(l => deps[l]),
    porque: 'Sem fila, muita gente clicando junto derruba o servidor. Com fila, todo mundo espera uns segundos e sai.',
    fase: '1.000+',
  },
  {
    nome: 'Limite de quantos PDFs geram AO MESMO TEMPO',
    ok: has(server + engine, /p-limit|semaphore|MAX_CONCURREN|concorrenc|maxConcurren/i),
    porque: 'Sem trava, 20 pessoas gerando juntas estouram a memória. Com trava, vira fila ordenada.',
    fase: '1.000+',
  },
  {
    nome: 'Reuso de material já gerado (cache de PDF)',
    ok: has(server + engine, /cachePdf|pdfCache|reusa.*pdf|cache.*pdf/i),
    porque: 'Hoje todo clique gera do zero (gasta IA + força). Guardar o que repete economiza muito no volume.',
    fase: '10.000+',
  },
  {
    nome: 'Sessão sem estado (escala horizontal fácil)',
    ok: has(auth, /createHmac|assinar|cookie assinado|stateless/i),
    porque: 'Cookie assinado deixa ligar VÁRIOS servidores sem bagunçar o login. (Isso já está bom.)',
    fase: '1.000+',
  },
  {
    nome: 'Trava anti-abuso na geração (rate-limit)',
    ok: has(server, /loginBloqueado|rate|tentativas|_loginTent/i) && has(server, /MAX_OPUS_DIA|consumirOpus|limiteDiario/i),
    porque: 'Evita um abusador queimar custo/derrubar. Login já tem; geração tem teto diário de Opus.',
    fase: '100+',
  },
  {
    nome: 'Imagens de fontes que aguentam volume',
    ok: has(engine, /garantirImagemCapa/) && has(read('utils/imageLibrary.js'), /openverse|unsplash|pexels/i),
    porque: 'Banco de imagens grátis + cache. Ok pra escala (só cuidar de limite das APIs em pico extremo).',
    fase: '1.000+',
  },
];

// ── Fungada no site no ar (latência / se estava dormindo) ───
function probe() {
  return new Promise(resolve => {
    const t = Date.now();
    const req = https.get('https://claude-code-febra.onrender.com/login', r => {
      r.resume(); r.on('end', () => resolve({ status: r.statusCode, ms: Date.now() - t }));
    });
    req.on('error', () => resolve({ status: 0, ms: Date.now() - t }));
    req.setTimeout(70000, () => { req.destroy(); resolve({ status: 0, ms: Date.now() - t }); });
  });
}

(async () => {
  console.log('\n=============================================');
  console.log('   RAIO-X DE ESCALA — Estúdio / MAX Criador');
  console.log('   ' + new Date().toLocaleString('pt-BR'));
  console.log('=============================================\n');

  let pontos = 0;
  for (const c of checks) {
    console.log(`${c.ok ? '✅' : '⬜'}  ${c.nome}`);
    if (!c.ok) console.log(`      ↳ falta isto pra fase ${c.fase}: ${c.porque}`);
    if (c.ok) pontos++;
  }
  const total = checks.length;
  console.log(`\nPRONTIDÃO: ${pontos}/${total} peças no lugar.`);

  const p = await probe();
  const dormindo = p.ms > 8000;
  console.log(`\nSITE NO AR: ${p.status === 200 ? 'OK' : 'sem resposta (' + p.status + ')'} · respondeu em ${(p.ms / 1000).toFixed(1)}s${dormindo ? '  ⚠️ (parece que estava DORMINDO — plano grátis; pague pra ficar sempre ligado antes de mandar tráfego)' : ''}`);

  // Veredito por fase
  console.log('\n--- VEREDITO ---');
  const faltam1k = checks.filter(c => !c.ok && c.fase === '1.000+').length;
  console.log('• Até ~100 clientes (poucos gerando junto): ' + (pontos >= 3 ? 'DÁ, do jeito que está. 👍' : 'revisar o básico.'));
  console.log('• ~1.000 clientes / picos de lançamento: ' + (faltam1k === 0 ? 'PRONTO.' : `falta ligar ${faltam1k} peça(s) acima (banco + fila + limite de concorrência).`));
  console.log('• ~10.000 clientes: precisa de tudo acima + cache de PDF + vários servidores (autoscaling do Render).');
  console.log('\nPlano completo por fase: Obsidian → tecnologia/max-criador-plano-de-escala.md\n');
})();
