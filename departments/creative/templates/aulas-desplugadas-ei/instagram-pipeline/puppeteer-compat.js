// puppeteer-compat.js
// Lança o browser de forma compatível com produção (Render / VPS Coolify).
// Em produção usa puppeteer-core + @sparticuz/chromium (require CJS — evita o
// require('puppeteer') que quebra com o puppeteer@25, que virou ES Module).
// Em dev local (Windows) usa o puppeteer normal.
// Importante: NÃO faz require de puppeteer/puppeteer-core no topo — só dentro do
// launch() — pra carregar este módulo não disparar o erro de ESM no boot.
module.exports = {
  async launch(opts = {}) {
    if (process.env.NODE_ENV === 'production' || process.env.RENDER) {
      const chromium = require('@sparticuz/chromium');
      const pc = require('puppeteer-core');
      return pc.launch({
        ...opts,
        args: [...chromium.args, ...(opts.args || [])],
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
      });
    }
    const puppeteer = require('puppeteer');
    return puppeteer.launch(opts);
  },
};
