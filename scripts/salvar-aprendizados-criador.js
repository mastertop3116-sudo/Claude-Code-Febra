/**
 * Salva todos os aprendizados do teste UX/UI/PDF do MAX Criador (2026-05-28)
 * Rode com: node scripts/salvar-aprendizados-criador.js
 */

require('dotenv').config();
const { salvar } = require('../utils/aprendizados');

const aprendizados = [
  {
    titulo: 'text-shadow em CSS duplica texto na estrutura interna do PDF (Puppeteer/Chromium)',
    categoria: 'bug_fix',
    problema: 'O CSS text-shadow aplicado ao .capa-titulo gerava um segundo layer de texto no PDF produzido pelo Chromium (Puppeteer). pypdf extraía o texto duas vezes: "TítuloTítulo". Visualmente parece OK no viewer, mas quebra extração, busca, acessibilidade e leitores de PDF.',
    solucao: 'Remover text-shadow do elemento de texto. Branco 34pt em fundo escuro é legível sem shadow. Nunca usar text-shadow em elementos de texto que serão renderizados para PDF — usar elementos decorativos separados (div overlay) se quiser efeito visual.',
    contexto: { arquivo: 'templates/criador-universal/index.html', classe: '.capa-titulo', puppeteer_version: '22+' },
    tags: ['pdf', 'puppeteer', 'text-shadow', 'chromium', 'duplicacao-texto'],
    fonte: 'template',
  },
  {
    titulo: 'data:application/pdf;base64 não funciona para download no Safari iOS',
    categoria: 'bug_fix',
    problema: 'O botão "Baixar PDF" no resultado usava pdfB64 (base64 em memória) como href do link. No Safari iOS (iPhone/iPad), o browser bloqueia download via data: URI — o arquivo simplesmente não abre ou não baixa. Afeta 40-60% dos usuários mobile.',
    solucao: 'Usar a pdf_url do Supabase Storage como href do botão de download, não o base64. O histórico já usava o link correto. Unificar: botão de resultado também deve usar a URL pública do Supabase. Guardar a pdf_url no state da página e usar no onclick do botão de download.',
    contexto: { arquivo: 'public/criador.html', funcao: 'baixar()', plataforma: 'Safari iOS' },
    tags: ['safari', 'ios', 'download', 'pdf', 'base64', 'mobile'],
    fonte: 'server',
  },
  {
    titulo: 'Nome do arquivo PDF é UUID ilegível — prejudica percepção de produto premium',
    categoria: 'melhoria',
    problema: 'O PDF baixado tem nome como "8af2eb7d-5db7-4f35-a7d6-cb09811bd6e4-workbook.pdf". Quando o comprador salva ou compartilha o arquivo, o nome comunica descaso com o produto. Um infoproduto premium precisa de nome descritivo.',
    solucao: 'Gerar slug do título na geração: slugify(d.titulo) + "-" + tipo + ".pdf". Exemplo: "separacao-de-financas-pessoais-workbook.pdf". Fazer isso no criador_engine.js ao fazer upload para o Supabase Storage e salvar o nome amigável no campo pdf_url ou em campo separado.',
    contexto: { arquivo: 'departments/creative/engines/criador_engine.js', funcao: 'uploadPDF' },
    tags: ['ux', 'download', 'nome-arquivo', 'slug', 'produto-premium'],
    fonte: 'engine',
  },
  {
    titulo: 'PDFs gerados sem metadados internos (Author, Title, Subject)',
    categoria: 'melhoria',
    problema: 'Os PDFs gerados pelo Puppeteer não têm Author, Title, Subject nos metadados. Quando o usuário abre no smartphone, o visualizador mostra o UUID como nome do arquivo. Metadados melhoram SEO do PDF, acessibilidade e percepção profissional.',
    solucao: 'Ao chamar page.pdf() no Puppeteer, não há opção nativa para metadados PDF. Solução: usar qpdf ou ghostscript pós-geração para injetar metadados, OU usar uma biblioteca Node.js como pdf-lib para fazer merge de metadados após a geração do Puppeteer.',
    contexto: { arquivo: 'departments/creative/engines/criador_engine.js', biblioteca_sugerida: 'pdf-lib' },
    tags: ['pdf', 'metadados', 'puppeteer', 'acessibilidade', 'pdf-lib'],
    fonte: 'engine',
  },
  {
    titulo: 'Sem rate limiting na geração de produtos — risco de abuso e custo OpenAI ilimitado',
    categoria: 'padrao',
    problema: 'Qualquer pessoa com o link /criador pode gerar centenas de produtos em sequência sem qualquer bloqueio. Cada geração chama GPT-4o (~$0.05-0.15) + Puppeteer. Sem autenticação ou rate limit, o sistema é vulnerável a abuso.',
    solucao: 'Implementar rate limiting por IP (ex: max 5 gerações por hora por IP) usando express-rate-limit no server.js na rota /api/criador/iniciar. Para produção real, adicionar autenticação JWT ou session-based antes de liberar acesso ao /criador.',
    contexto: { arquivo: 'server.js', rota: '/api/criador/iniciar', biblioteca: 'express-rate-limit' },
    tags: ['seguranca', 'rate-limit', 'openai', 'custo', 'autenticacao'],
    fonte: 'server',
  },
  {
    titulo: 'Usuário não vê preview do PDF antes de baixar — reduz confiança e aumenta frustrações',
    categoria: 'melhoria',
    problema: 'Após a geração, o usuário vê apenas o título e badges. Não tem nenhuma visualização do PDF gerado. Se ficou ruim, só descobre depois de baixar. Isso cria fricção e desconfiança, especialmente para primeiro uso.',
    solucao: 'Duas abordagens: (1) Gerar thumbnail da primeira página do PDF usando Puppeteer screenshot e salvar no Storage ao lado do PDF — exibir como preview no card de resultado. (2) Abrir o PDF em um iframe ou modal inline na página. Abordagem 1 é mais leve.',
    contexto: { arquivo: 'departments/creative/engines/criador_engine.js', sugestao: 'page.screenshot() da capa após page.pdf()' },
    tags: ['ux', 'preview', 'thumbnail', 'confianca', 'puppeteer-screenshot'],
    fonte: 'engine',
  },
  {
    titulo: 'Script VSL gera preço fictício sem avisar o usuário que deve personalizar',
    categoria: 'melhoria',
    problema: 'O GPT inventa valores na seção OFERTA do VSL (ex: R$997 → R$497). O usuário não é alertado sobre isso e pode usar o script sem perceber que o preço é um placeholder inventado pela IA.',
    solucao: 'Duas ações: (1) No prompt do Script VSL, instruir o GPT a usar [SEU_PREÇO] como placeholder explícito onde aparecer um preço, para deixar óbvio que precisa substituir. (2) Na tela de resultado do VSL, mostrar um aviso: "⚠ Personalize o preço e os dados da oferta antes de usar o script."',
    contexto: { arquivo: 'departments/creative/engines/criador_engine.js', prompt: 'vslPrompt', tipo: 'script_vsl' },
    tags: ['vsl', 'prompt', 'preco', 'placeholder', 'aviso-usuario'],
    fonte: 'engine',
  },
  {
    titulo: 'Capa dos PDFs usa paleta única por tipo independente do nicho — todos parecem o mesmo produto',
    categoria: 'melhoria',
    problema: 'Todos os produtos do mesmo tipo ficam com a mesma cor de capa (todos E-books com a mesma cor, todos Guias com a mesma cor etc.). Um E-book de confeitaria e um de CLT ficam visualmente idênticos. Isso reduz a percepção de produto único e personalizado.',
    solucao: 'Criar um mapa de cores por categoria de nicho (bem-estar=verde, finanças=azul/verde escuro, criativo/arte=roxo/rosa, negócios=azul, saúde=verde/teal, etc.) e detectar no criador_engine.js a qual categoria o nicho pertence para passar a paleta correta para o template via CSS vars.',
    contexto: { arquivo: 'departments/creative/engines/criador_engine.js', variaveis_css: '--p, --s, --bg' },
    tags: ['design', 'capa', 'paleta', 'personalizacao', 'nicho', 'template'],
    fonte: 'template',
  },
  {
    titulo: 'Sem feedback visual em campos obrigatórios vazios — usuário não sabe por que o botão não funciona',
    categoria: 'bug_fix',
    problema: 'Ao clicar "Gerar produto" sem preencher o campo Nicho, o código apenas fazia focus() no campo e retornava. Sem borda vermelha, mensagem de erro ou animação, o usuário não entende o que aconteceu — parece que o botão está quebrado.',
    solucao: 'Adicionar: (1) Classe input-error com borda vermelha no campo vazio. (2) Animação CSS shake no campo. (3) Mensagem de erro visível abaixo do campo. Limpar o estado de erro quando o usuário começar a digitar. Pattern aplicável a qualquer formulário da plataforma.',
    contexto: { arquivo: 'public/criador.html', funcao: 'iniciar()', campo: '#f-nicho' },
    tags: ['ux', 'validacao', 'form', 'feedback-visual', 'acessibilidade'],
    fonte: 'server',
  },
  {
    titulo: 'Abrir link externo sem target="_blank" em href Supabase Storage prende o usuário na página',
    categoria: 'padrao',
    problema: 'Links de download de PDFs precisam ter target="_blank" para abrir em nova aba. Sem isso, o browser pode navegar para a URL do arquivo e o usuário perde o contexto da página atual.',
    solucao: 'Sempre usar target="_blank" rel="noopener" em links de download de arquivos externos. Adicionalmente, o atributo download sugere ao browser salvar o arquivo em vez de abrir no viewer.',
    contexto: { arquivo: 'public/criador.html', elemento: 'a.hist-dl' },
    tags: ['ux', 'download', 'target-blank', 'seguranca', 'noopener'],
    fonte: 'server',
  },
];

(async () => {
  console.log(`Salvando ${aprendizados.length} aprendizados...\n`);
  for (const a of aprendizados) {
    await salvar(a);
    console.log(`✅ ${a.titulo.slice(0, 60)}...`);
  }
  console.log('\n✨ Todos os aprendizados salvos no Supabase e no Obsidian!');
})();
