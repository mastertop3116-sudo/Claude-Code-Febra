// Protótipo: posts de NOITE com mascote, pelos estilos passados. Não posta.
const path = require('path');
const OUT = path.join(process.env.USERPROFILE || '.', 'Downloads', 'AMOSTRAS-INSTAGRAM-JIUJITSU', '07-noite-mascote');
process.env.IG_OUTPUT_DIR = OUT;
const fs = require('fs'); fs.mkdirSync(OUT, { recursive: true });
const { gerarPost } = require('./gerar-post');

const CONTEUDO = {
  motivacional: { frase: 'No tatame, construímos campeões e grandes pessoas', contexto: 'Cada treino ensina disciplina e respeito, moldando o caráter da criança para a vida toda.', cta: 'Compartilhe com um sensei! 🥋' },
  dica:         { titulo: 'Prenda a atenção da turma', dica: 'Crianças dispersam rápido quando a aula é só repetição. Veja como manter todo mundo ligado:', destaque: 'Aplique já na próxima aula', resposta: '🥋 Troque de atividade a cada 8 minutos\n⏱️ Use contagem regressiva nas trocas\n🏆 Dê uma missão pra cada dupla', cta: 'Salva pra não esquecer! 👊' },
  engajamento:  { pergunta: 'Qual o maior desafio ao ensinar crianças?', contexto: 'Cada turma tem sua dificuldade. Conta pra gente a sua!', opcoes: ['A) 🥋 Manter o foco', 'B) 🏆 Disciplina', 'C) 💪 Timidez'], cta: 'Comenta aí embaixo!' },
};
const FAIXA = { dark: 'preta', premium: 'marrom', color: 'laranja' };

(async () => {
  const estilos = (process.argv[2] || 'dark,premium,color').split(',');
  for (const estilo of estilos) {
    for (const tipo of ['motivacional', 'dica', 'engajamento']) {
      const caminho = await gerarPost({ tipo, estilo, faixa: FAIXA[estilo], fontes: ['bebas'], conteudo: CONTEUDO[tipo] }, null);
      const destino = path.join(OUT, `${estilo}-${tipo}.png`);
      fs.copyFileSync(caminho, destino); fs.unlinkSync(caminho);
      console.log('->', path.basename(destino));
    }
  }
  console.log('Pronto:', OUT);
})().catch(e => { console.error('ERRO:', e); process.exit(1); });
