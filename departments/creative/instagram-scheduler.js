// Instagram Pipeline Scheduler — inicia junto com o servidor Render
// Posts automáticos @jiujitsudinamicas: 09h (carrossel) e 19h (post único)

const cron = require('node-cron');

let iniciado = false;

function iniciar() {
  if (iniciado) return;
  iniciado = true;

  let config, executar, responderComentarios;
  try {
    config  = require('./templates/aulas-desplugadas-ei/instagram-pipeline/config');
    const pipeline = require('./templates/aulas-desplugadas-ei/instagram-pipeline/pipeline');
    executar = pipeline.executar;
    responderComentarios = require('./templates/aulas-desplugadas-ei/instagram-pipeline/responder-comentarios').responder;
  } catch (e) {
    console.warn('[instagram-scheduler] Dependência não encontrada — scheduler desabilitado:', e.message);
    return;
  }

  if (!config.instagram.accessToken || config.instagram.accessToken.length < 20) {
    console.warn('[instagram-scheduler] INSTAGRAM_ACCESS_TOKEN não configurado — scheduler desabilitado.');
    return;
  }

  function agendar(horario, periodo) {
    const [hora, minuto] = horario.split(':');
    const expr = `${minuto} ${hora} * * *`;
    cron.schedule(expr, () => {
      console.log(`[instagram-scheduler] Disparando pipeline ${periodo.toUpperCase()}...`);
      executar(periodo).catch(err => {
        console.error(`[instagram-scheduler] ERRO (${periodo}):`, err.message);
      });
    }, { timezone: 'America/Sao_Paulo' });
    console.log(`[instagram-scheduler] ${periodo.toUpperCase()} agendado → ${horario} (America/Sao_Paulo)`);
  }

  const horarioManha = config.posting.horarioManha || '09:00';
  const horarioNoite = config.posting.horarioNoite || '19:00';

  agendar(horarioManha, 'manha');
  agendar(horarioNoite, 'noite');

  // Robô de comentários — responde automaticamente a cada 30 minutos.
  // LIGADO por padrão desde 2026-06-11 (autorizado pelo Rodrigo). Desliga com IG_COMENTARIOS_AUTO=false.
  const comentariosAuto = process.env.IG_COMENTARIOS_AUTO !== 'false';
  if (responderComentarios && comentariosAuto) {
    cron.schedule('*/30 * * * *', () => {
      console.log('[instagram-scheduler] Rodando robô de comentários...');
      responderComentarios().catch(err => {
        console.error('[instagram-scheduler] ERRO (comentários):', err.message);
      });
    }, { timezone: 'America/Sao_Paulo' });
    console.log('[instagram-scheduler] Robô de comentários agendado → a cada 30 min');
  } else {
    console.log('[instagram-scheduler] Robô de comentários PRONTO mas desligado (IG_COMENTARIOS_AUTO != true).');
  }

  // Coleta de métricas — 1x/dia às 22h. Alimenta o dashboard e os "top performers"
  // que a IA usa pra escrever conteúdo parecido com o que mais engaja.
  cron.schedule('0 22 * * *', () => {
    console.log('[instagram-scheduler] Coletando métricas diárias...');
    try {
      const { coletarEsalvar } = require('./templates/aulas-desplugadas-ei/instagram-pipeline/insights');
      coletarEsalvar().catch(err => console.error('[instagram-scheduler] ERRO (métricas):', err.message));
    } catch (e) {
      console.warn('[instagram-scheduler] Métricas indisponíveis:', e.message);
    }
  }, { timezone: 'America/Sao_Paulo' });
  console.log('[instagram-scheduler] Métricas diárias agendadas → 22:00 (America/Sao_Paulo)');

  if (config.posting.dryRun) {
    console.log('[instagram-scheduler] MODO DRY RUN — gera imagens mas não posta.');
  }
}

module.exports = { iniciar };
