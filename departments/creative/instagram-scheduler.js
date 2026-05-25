// Instagram Pipeline Scheduler — inicia junto com o servidor Render
// Posts automáticos @jiujitsudinamicas: 09h (carrossel) e 19h (post único)

const cron = require('node-cron');

let iniciado = false;

function iniciar() {
  if (iniciado) return;
  iniciado = true;

  let config, executar;
  try {
    config  = require('./templates/aulas-desplugadas-ei/instagram-pipeline/config');
    const pipeline = require('./templates/aulas-desplugadas-ei/instagram-pipeline/pipeline');
    executar = pipeline.executar;
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

  if (config.posting.dryRun) {
    console.log('[instagram-scheduler] MODO DRY RUN — gera imagens mas não posta.');
  }
}

module.exports = { iniciar };
