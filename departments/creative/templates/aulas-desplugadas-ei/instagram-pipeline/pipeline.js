// Orquestrador principal do pipeline
// Executa: buscar conteúdo → gerar imagem(ns) → upload → postar (ou só gerar em dryRun)
// Períodos: 'manha' (carrossel) | 'noite' (post único)

const config    = require('./config');
const { gerarConteudo } = require('./gerar-conteudo-ia');
const { gerarPost, gerarCarrossel } = require('./gerar-post');
const { uploadImagem }              = require('./upload');
const { postar, postarCarrossel }   = require('./instagram');
const { gerarFundo, TIPOS_NOITE }   = require('./gerar-bg-ia');

const hashtags = config.marca.hashtags.join(' ');

function montarCaption(tipo, conteudo) {
  const intro = {
    dica:        `💡 ${conteudo.titulo || ''}\n\n${conteudo.dica || ''}`,
    produto:     `${conteudo.gancho || ''}\n\n${conteudo.solucao || ''}`,
    motivacional:`${conteudo.frase || ''}\n\n${conteudo.contexto || ''}`,
    engajamento: `${conteudo.pergunta || ''}\n\n${conteudo.contexto || ''}`,
  }[tipo] || '';

  const cta = conteudo.cta ? `\n\n${conteudo.cta}` : '';
  return `${intro}${cta}\n\n${hashtags}`;
}

function montarCaptionCarrossel(entrada) {
  const capa = entrada.slides[0];
  return `${capa.titulo}\n\n${capa.texto}\n\n💾 Salva esse carrossel e aplica na sua próxima aula!\n\n${hashtags}`;
}

async function executar(periodo, diaSemana) {
  const periodoLabel = periodo || 'manha';
  console.log(`\n========== PIPELINE [${periodoLabel.toUpperCase()}] — ${new Date().toLocaleString('pt-BR')} ==========`);

  // ── POST ÚNICO: texto e imagem gerados em paralelo ─────────────────────────
  if (periodoLabel === 'noite') {
    const dia = new Date().getDay();
    const tipoAntecipado = TIPOS_NOITE[dia];
    console.log(`[pipeline] Gerando conteúdo e fundo 3D em paralelo (tipo: ${tipoAntecipado})...`);

    const [entrada, bgBase64] = await Promise.all([
      gerarConteudo(periodoLabel),
      gerarFundo(tipoAntecipado).catch(e => {
        console.warn('[pipeline] Fundo 3D indisponível, usando textura padrão:', e.message);
        return null;
      }),
    ]);

    console.log(`[pipeline] Tipo confirmado: ${entrada.tipo}`);

    const caminho = await gerarPost(entrada, bgBase64);

    if (config.posting.dryRun) {
      console.log('[pipeline] DRY RUN — imagem gerada, NÃO postada.');
      console.log(`[pipeline] Arquivo: ${caminho}`);
      return;
    }

    const url     = await uploadImagem(caminho);
    const caption = montarCaption(entrada.tipo, entrada.conteudo);
    await postar(url, caption);

  // ── CARROSSEL (manhã) ──────────────────────────────────────────────────────
  } else {
    const entrada = await gerarConteudo(periodoLabel);
    console.log(`[pipeline] Tipo: ${entrada.tipo}`);

    const caminhos = await gerarCarrossel(entrada);

    if (config.posting.dryRun) {
      console.log('[pipeline] DRY RUN — slides gerados, NÃO postados.');
      caminhos.forEach(p => console.log('  ', p));
      return;
    }

    const urls = [];
    for (const caminho of caminhos) {
      const url = await uploadImagem(caminho);
      urls.push(url);
    }

    const caption = montarCaptionCarrossel(entrada);
    await postarCarrossel(urls, caption);
  }

  console.log('[pipeline] Concluído com sucesso!');
  console.log('='.repeat(60));
}

module.exports = { executar };

// Execução direta: node pipeline.js [manha|noite] [diaSemana 0-6]
if (require.main === module) {
  const periodo  = process.argv[2] || 'manha';
  const dia      = process.argv[3] !== undefined ? parseInt(process.argv[3]) : undefined;
  executar(periodo, dia).catch(err => {
    console.error('[pipeline] ERRO:', err.message);
    process.exit(1);
  });
}
