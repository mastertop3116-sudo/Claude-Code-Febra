require("dotenv").config();
const fs = require("fs");
const { generate } = require("./departments/creative/deliverable_generator");

const progress = (pct, msg) => process.stdout.write(`\r${pct}% ${msg}        `);

(async () => {
  console.log("Gerando ebook com pregações prontas...\n");
  try {
    const r = await generate({
      tipo: "ebook",
      titulo: "Pack de Pregações Prontas",
      subtitulo: "Pregações completas para crianças, adolescentes e jovens — abre, adapta e prega",
      autor: "Pr. Maximus",
      nicho: "pregações cristãs prontas por faixa etária — crianças (4-10 anos), adolescentes (11-14) e jovens (15-25)",
      avatar_publico: "pastores, líderes e professores de EBD que precisam de pregações completas prontas para usar domingo, com texto bíblico, introdução, 3 pontos desenvolvidos e aplicação prática — sem ter que preparar do zero",
      num_paginas: 20,
      num_capitulos: 6,
      temaKey: "sabedoria",
      produto: {
        relatorio: `
          Este ebook É uma coleção de pregações prontas. Não é um guia sobre como pregar.
          Cada seção/capítulo deve conter UMA PREGAÇÃO COMPLETA e pronta para usar.

          ESTRUTURA DE CADA PREGAÇÃO:
          - Título da pregação
          - Faixa etária indicada (crianças 4-10, adolescentes 11-14, ou jovens 15-25)
          - Texto bíblico principal + versículos de apoio
          - Introdução impactante (2-3 parágrafos que prendem a atenção)
          - Ponto 1 com desenvolvimento (mínimo 3 parágrafos)
          - Ponto 2 com desenvolvimento (mínimo 3 parágrafos)
          - Ponto 3 com desenvolvimento (mínimo 3 parágrafos)
          - Conclusão com desafio prático
          - Aplicação: o que o ouvinte deve fazer esta semana

          TEMAS SUGERIDOS POR FAIXA:
          Crianças: Identidade em Cristo, Deus cuida de mim, A fé de Davi, Jesus ama as crianças
          Adolescentes: Propósito de vida, Pressão dos amigos, Redes sociais e fé, Quem sou eu em Cristo
          Jovens: Chamado e missão, Relacionamentos saudáveis, Fé no trabalho, Identidade vs. aprovação

          Tom: linguagem acessível por faixa etária, bíblico, prático, sem jargão acadêmico teológico.
          O conteúdo deve ser PREGAÇÕES PRONTAS, não teoria sobre como pregar.
        `
      },
      onProgress: progress,
    });

    const out = "C:/temp/ebook_pregacoes_prontas.pdf";
    fs.writeFileSync(out, r.pdf);
    console.log(`\n\nOK! ${Math.round(r.pdf.length / 1024)}KB → ${out}`);
  } catch (e) {
    console.error("\nERRO:", e.message);
    process.exit(1);
  }
})();
