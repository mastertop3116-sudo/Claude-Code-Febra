// Agendador diário — 2 posts por dia
// Manhã: carrossel  (horario configurado em config.posting.horarioManha, padrão 09:00)
// Noite: post único (horario configurado em config.posting.horarioNoite,  padrão 19:00)

const cron     = require('node-cron');
const config   = require('./config');
const { executar } = require('./pipeline');

function agendarPeriodo(horario, periodo) {
  const [hora, minuto] = horario.split(':');
  const expressao      = `${minuto} ${hora} * * *`;

  console.log(`[agendar] ${periodo.toUpperCase()} → ${horario} | cron: ${expressao}`);

  cron.schedule(expressao, () => {
    executar(periodo).catch(err => {
      console.error(`[agendar] ERRO (${periodo}):`, err.message);
    });
  }, { timezone: config.posting.timezone });
}

const horarioManha = config.posting.horarioManha || config.posting.horario || '09:00';
const horarioNoite = config.posting.horarioNoite || '19:00';

agendarPeriodo(horarioManha, 'manha');
agendarPeriodo(horarioNoite, 'noite');

if (config.posting.dryRun) {
  console.log('[agendar] MODO DRY RUN — só gera imagens, sem postar.');
}

console.log('[agendar] Aguardando os horários... (Ctrl+C para parar)');
