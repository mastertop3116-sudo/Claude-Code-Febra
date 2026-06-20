// puppeteer-compat.js
// Lança o browser de forma compatível com produção (Render / VPS Coolify).
// puppeteer@25 E puppeteer-core@25 são ES Modules — require() quebra nos dois.
// Por isso usamos import() DINÂMICO (funciona pra ESM a partir de CommonJS).
// Em produção: puppeteer-core + @sparticuz/chromium (mesmo caminho do NexusPDF/Criador).
// Em dev local: puppeteer normal.
// Nada é importado no topo — só dentro do launch() — pra carregar este módulo
// não disparar nada (o instagram-scheduler exige isso no boot).
module.exports = {
  async launch(opts = {}) {
    if (process.env.NODE_ENV === 'production' || process.env.RENDER) {
      const chromium = (await import('@sparticuz/chromium')).default;
      const pc = (await import('puppeteer-core')).default;
      return pc.launch({
        ...opts,
        args: [...chromium.args, ...(opts.args || [])],
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
      });
    }
    const puppeteer = (await import('puppeteer')).default;
    return puppeteer.launch(opts);
  },
};
