// Gera AMOSTRAS reais (com IA) dos 3 estilos + posts de noite, na pasta Downloads.
// Não posta nada. Só pra Rodrigo ver exemplares.
const path = require('path');
const fs   = require('fs');

const BASE = path.join(process.env.USERPROFILE || '.', 'Downloads', 'AMOSTRAS-INSTAGRAM-JIUJITSU');
const TMP  = path.join(BASE, '.tmp');
fs.mkdirSync(TMP, { recursive: true });
process.env.IG_OUTPUT_DIR = TMP; // antes de carregar config

const OpenAI = require('openai');
const { gerarCarrossel, gerarPost } = require('./gerar-post');
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function mkdir(p) { fs.mkdirSync(p, { recursive: true }); return p; }
function mover(de, para) { fs.copyFileSync(de, para); fs.unlinkSync(de); }

// ── conteúdo de carrossel via IA ───────────────────────────────────────────────
async function genCarrossel(temaInstrucao, badgeSugerido) {
  const prompt = `Você é FAIXA-PRETA de jiu-jitsu com 15 anos formando crianças de 4 a 12 anos. Crie um carrossel de Instagram sobre: ${temaInstrucao}.
PADRÃO: cada slide entrega UMA ideia aplicável JÁ na próxima aula, com MECANISMO concreto (nome de brincadeira, número, fala exata pro sensei entre aspas, ou cena real). PROIBIDO genérico ("seja paciente", "torne divertido" sem dizer como) e as palavras "simplesmente"/"revolucionário".
EXEMPLO BOM: "Quebre a aula em blocos de 8 minutos e troque técnica por brincadeira (ex: 'pega-pega de joelhos'). Anuncie com contagem regressiva — a turma volta a atenção na hora."
Retorne SOMENTE JSON:
{
 "badge":"rótulo curto (2-4 palavras, ex: '${badgeSugerido}')",
 "emoji":"1 emoji",
 "slides":[
   {"tipo":"capa","titulo":"título com NÚMERO + benefício específico que gera curiosidade","texto":"subtítulo que aumenta a curiosidade (máx 16 palavras)"},
   {"tipo":"conteudo","titulo":"título do ponto (4-7 palavras)","texto":"a dica COM mecanismo concreto (30 a 44 palavras)"},
   {"tipo":"conteudo","titulo":"...","texto":"... (mecanismo diferente)"},
   {"tipo":"conteudo","titulo":"...","texto":"... (mecanismo diferente)"},
   {"tipo":"conteudo","titulo":"...","texto":"... (mecanismo diferente)"},
   {"tipo":"conteudo","titulo":"...","texto":"... (mecanismo diferente)"},
   {"tipo":"cta","titulo":"chamada para ação (máx 8 palavras)","texto":"incentivo a salvar e marcar outro sensei (máx 18 palavras)"}
 ]
}
Gere 5 a 6 slides de conteúdo.`;
  const r = await client.chat.completions.create({
    model: 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' }, temperature: 0.9,
  });
  const g = JSON.parse(r.choices[0].message.content);
  const raw = g.slides || [];
  const capa = raw.find(s => s.tipo === 'capa') || raw[0];
  const cta  = raw.find(s => s.tipo === 'cta')  || raw[raw.length - 1];
  let cont   = raw.filter(s => s.tipo === 'conteudo').slice(0, 6);
  cont.forEach((s, i) => s.numero = i + 2);
  return { badge: g.badge || badgeSugerido, emoji: g.emoji || '🥋', slides: [capa, ...cont, cta].filter(Boolean) };
}

// ── conteúdo de post de noite via IA ───────────────────────────────────────────
async function genNoite(tipo) {
  const schemas = {
    motivacional: `{"frase":"frase de impacto (máx 12 palavras)","contexto":"desenvolvimento ligando tatame e caráter (máx 35 palavras)","cta":"cta com emoji (máx 15 palavras)"}`,
    dica:         `{"titulo":"título (máx 10 palavras)","dica":"contexto do problema (máx 25 palavras)","destaque":"frase de destaque (máx 6 palavras)","resposta":"3 itens separados por \\n, cada um com emoji (máx 16 palavras)","cta":"cta com emoji (máx 12 palavras)"}`,
    engajamento:  `{"pergunta":"pergunta provocante (máx 12 palavras)","contexto":"situação curta (máx 30 palavras)","opcoes":["A) 🥋 opção","B) 🏆 opção","C) 💪 opção"],"cta":"incentivo a comentar (máx 10 palavras)"}`,
    produto:      `{"gancho":"gancho sobre a dor de montar aula do zero (máx 12 palavras)","problema":"a dor antes (máx 14 palavras)","solucao":"como fica depois (máx 14 palavras)","prova":"prova concreta, ex +250 dinâmicas (máx 14 palavras)","urgencia":"urgência/bônus (máx 10 palavras)","cta":"cta curto (máx 6 palavras)"}`,
  };
  const prompt = `Você é um sensei de jiu-jitsu infantil criando um post (${tipo}) para Instagram. Específico e útil, sem clichê.
Retorne SOMENTE JSON: ${schemas[tipo]}`;
  const r = await client.chat.completions.create({
    model: 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' }, temperature: 0.9,
  });
  return JSON.parse(r.choices[0].message.content);
}

async function fazerCarrossel(pasta, estilo, tema, badge, fontes, textura) {
  const destino = mkdir(path.join(BASE, pasta));
  console.log(`\n>> Carrossel ${estilo} — ${tema}`);
  const c = await genCarrossel(tema, badge);
  const caminhos = await gerarCarrossel({ estilo, fontes, textura, badge: c.badge, emoji: c.emoji, slides: c.slides });
  caminhos.forEach((p, i) => mover(p, path.join(destino, `slide-${String(i + 1).padStart(2, '0')}.png`)));
  console.log(`   ${caminhos.length} telas -> ${pasta}`);
}

async function fazerNoite(destino, nome, estilo, tipo, fontes) {
  console.log(`\n>> Post noite ${estilo}/${tipo}`);
  const conteudo = await genNoite(tipo);
  const caminho = await gerarPost({ tipo, estilo, fontes, conteudo }, null);
  mover(caminho, path.join(destino, `${nome}.png`));
  console.log(`   -> ${nome}.png`);
}

(async () => {
  // 3 carrosséis — um por estilo, cada um com um ângulo diferente
  await fazerCarrossel('01-carrossel-DARK',    'dark',    'curiosidades surpreendentes sobre jiu-jitsu infantil que poucos pais conhecem', 'Você Sabia?',      ['bebas'],  'grunge');
  await fazerCarrossel('02-carrossel-PREMIUM', 'premium', 'erros comuns que senseis cometem ao ensinar crianças e como corrigir',          'Erros Comuns',     ['anton'],  'halftone');
  await fazerCarrossel('03-carrossel-COLOR',   'color',   'soluções práticas para problemas reais do tatame (criança tímida, agitada, sem foco)', 'Resolve no Tatame', ['gagalin'], 'noise');

  // posts de noite — variedade de tipo e estilo
  const noite = mkdir(path.join(BASE, '04-posts-noite'));
  await fazerNoite(noite, 'motivacional-DARK',  'dark',    'motivacional', ['bebas']);
  await fazerNoite(noite, 'dica-PREMIUM',       'premium', 'dica',         ['anton']);
  await fazerNoite(noite, 'engajamento-COLOR',  'color',   'engajamento',  ['gagalin']);
  await fazerNoite(noite, 'produto-COLOR',      'color',   'produto',      ['oswald']);

  // leia-me
  fs.writeFileSync(path.join(BASE, 'LEIA-ME.txt'),
`AMOSTRAS — Instagram @jiujitsudinamicas
Geradas em ${new Date().toLocaleString('pt-BR')}

01-carrossel-DARK     -> carrossel completo no estilo Dark (preto + laranja)
02-carrossel-PREMIUM  -> carrossel completo no estilo Premium (preto elegante)
03-carrossel-COLOR    -> carrossel completo no estilo Color (laranja + card branco)
04-posts-noite        -> posts unicos da noite (motivacional, dica, engajamento, produto)

O robo reveza esses 3 estilos sozinho, um por dia. O conteudo muda todo dia (8 temas diferentes).
Estas sao amostras de exemplo - o robo gera conteudo novo a cada post.
`, 'utf8');

  try { fs.rmSync(TMP, { recursive: true, force: true }); } catch (e) {}
  console.log(`\n✅ Amostras prontas em: ${BASE}`);
})().catch(e => { console.error('ERRO:', e); process.exit(1); });
