// ============================================================
// NEXUS — Gerador de Materiais Imprimíveis para Sala de Aula
// PDFKit direto — sem IA, conteúdo 100% curado e específico
// NOTA: Emojis não renderizam em PDFKit — usar formas geométricas
// ============================================================

const PDFDocument = require("pdfkit");
const path = require("path");
const fs   = require("fs");

const FONTS_DIR = path.join(__dirname, "../../assets/fonts");

const COLORS = {
  white    : "#FFFFFF",
  offwhite : "#FFFDF4",
  dark     : "#1A1A2E",
  gray     : "#616161",
  lightgray: "#EEEEEE",
};

const CERT_PALETTES = [
  { primary: "#6C3FC5", accent: "#F5A623", abbr: "ALG" },
  { primary: "#00838F", accent: "#FFD740", abbr: "PAD" },
  { primary: "#2E7D32", accent: "#AED581", abbr: "DEC" },
  { primary: "#AD1457", accent: "#F48FB1", abbr: "ABS" },
  { primary: "#E65100", accent: "#FFB74D", abbr: "KIT" },
  { primary: "#1565C0", accent: "#90CAF9", abbr: "EXP" },
  { primary: "#4A148C", accent: "#CE93D8", abbr: "LOG" },
  { primary: "#004D40", accent: "#80CBC4", abbr: "CRI" },
];

// ── Helpers de fonte ───────────────────────────────────────
function registerFonts(doc) {
  const reg = (name, file) => {
    const p = path.join(FONTS_DIR, file);
    if (fs.existsSync(p)) doc.registerFont(name, p);
  };
  reg("Nunito",          "Nunito-Regular.ttf");
  reg("Nunito-Bold",     "Nunito-Bold.ttf");
  reg("DancingScript",   "DancingScript-Regular.ttf");
  reg("DancingScript-Bold", "DancingScript-Bold.ttf");
  reg("GreatVibes",      "GreatVibes-Regular.ttf");
  reg("Raleway",         "Raleway-Regular.ttf");
  reg("Raleway-Bold",    "Raleway-Bold.ttf");
  reg("Poppins",         "Poppins-Regular.ttf");
  reg("Poppins-Bold",    "Poppins-SemiBold.ttf");
  reg("Lora",            "Lora-Regular.ttf");
  reg("Lora-Bold",       "Lora-Bold.ttf");
}

// ── Badge circular com sigla (substitui emojis nos certificados) ──
function drawSkillBadge(doc, cx, cy, abbr, primary, accent) {
  // Anel externo (accent)
  doc.circle(cx, cy, 36).fill(accent);
  // Círculo interno (primary)
  doc.circle(cx, cy, 30).fill(primary);
  // Texto da sigla
  doc.fillColor(COLORS.white).font("Nunito-Bold").fontSize(14)
    .text(abbr, cx - 30, cy - 9, { width: 60, align: "center" });
}

// ── Estrelas decorativas (substitui ⭐) ───────────────────
function drawStars(doc, cx, y, n, color, r = 7) {
  const gap = r * 2 + 10;
  const totalW = n * (r * 2) + (n - 1) * 10;
  let sx = cx - totalW / 2 + r;
  for (let i = 0; i < n; i++) {
    doc.circle(sx, y, r).fill(color);
    // Ponto interno branco para dar efeito de estrela
    doc.circle(sx, y, r * 0.38).fill(COLORS.white);
    sx += gap;
  }
}

// ── Marcador de seção colorido (substitui emojis de seção) ──
function drawSectionDot(doc, x, y, color) {
  doc.circle(x + 6, y + 6, 5).fill(color);
  return x + 18; // retorna x para o texto começar
}

// ── Borda decorativa do certificado ──────────────────────
function drawCertBorder(doc, W, H, primary, accent) {
  doc.rect(0, 0, W, H).fill(COLORS.offwhite);
  doc.rect(12, 12, W - 24, H - 24).lineWidth(5).strokeColor(primary).stroke();
  doc.rect(20, 20, W - 40, H - 40).lineWidth(1.5).strokeColor(accent).stroke();

  const cs = 14;
  for (const [x, y] of [[12,12],[W-12-cs,12],[12,H-12-cs],[W-12-cs,H-12-cs]]) {
    doc.rect(x, y, cs, cs).fill(primary);
    doc.rect(x+2, y+2, cs-4, cs-4).fill(accent);
  }

  doc.rect(12, 12, W - 24, 5).fill(primary);
  doc.rect(12, H - 17, W - 24, 5).fill(primary);
}

// ── Linha de assinatura ──────────────────────────────────
function signLine(doc, x, y, w, label, color = COLORS.gray) {
  doc.moveTo(x, y).lineTo(x + w, y).lineWidth(0.8).strokeColor(color).stroke();
  doc.fillColor(color).font("Nunito").fontSize(8)
    .text(label, x, y + 3, { width: w, align: "center" });
}

// ═══════════════════════════════════════════════════════════
//  BUMP 1 — CERTIFICADOS DE CONQUISTA (8 certificados A4 hor.)
// ═══════════════════════════════════════════════════════════
const CERTIFICATES = [
  {
    titulo:    "Mestre dos Algoritmos",
    conquista: "Completou as atividades de Algoritmos",
    descricao: "Demonstrou habilidade em criar sequências ordenadas\nde passos para resolver problemas — assim como um programador!",
    habilidade: "EF15CO01",
  },
  {
    titulo:    "Detetive de Padrões",
    conquista: "Identificou padrões e sequências",
    descricao: "Encontrou regularidades escondidas em sequências e desafios,\nmostrando um olhar atento e investigador!",
    habilidade: "EF15CO03",
  },
  {
    titulo:    "Engenheiro Desplugado",
    conquista: "Dominou a Decomposição de Problemas",
    descricao: "Provou que problemas grandes ficam pequenos\nquando divididos em partes — um verdadeiro engenheiro!",
    habilidade: "EF15CO02",
  },
  {
    titulo:    "Pensador Abstrato",
    conquista: "Praticou Abstração com Excelência",
    descricao: "Aprendeu a identificar o que é essencial em um problema,\nfocando no que realmente importa!",
    habilidade: "EF15CO04",
  },
  {
    titulo:    "Super Programador Sem Computador",
    conquista: "Concluiu o Kit Despluga Pro Completo",
    descricao: "Completou todas as atividades de Pensamento Computacional\ne provou que a tecnologia começa na mente!",
    habilidade: "EF15CO01–CO05",
  },
  {
    titulo:    "Explorador Digital",
    conquista: "Participou das Dinâmicas Desplugadas",
    descricao: "Explorou o mundo do Pensamento Computacional\ncom curiosidade, coragem e muita criatividade!",
    habilidade: "EF15CO01–CO05",
  },
  {
    titulo:    "Campeão da Lógica",
    conquista: "Resolveu Desafios de Raciocínio Lógico",
    descricao: "Mostrou raciocínio afiado ao resolver desafios\nque exigem lógica, sequência e organização de ideias!",
    habilidade: "EF15CO01",
  },
  {
    titulo:    "Criador de Soluções",
    conquista: "Resolveu Problemas com Criatividade",
    descricao: "Encontrou soluções únicas e criativas para desafios,\nmostrando que o Pensamento Computacional inspira a inovação!",
    habilidade: "EF15CO02–CO04",
  },
];

async function gerarCertificados() {
  const doc = new PDFDocument({ size: "A4", layout: "landscape", margin: 0, autoFirstPage: false });
  registerFonts(doc);

  const W = 841.89, H = 595.28;
  const CX = W / 2;

  for (let i = 0; i < CERTIFICATES.length; i++) {
    const cert = CERTIFICATES[i];
    const pal  = CERT_PALETTES[i];

    doc.addPage();
    drawCertBorder(doc, W, H, pal.primary, pal.accent);

    // Badge circular com sigla (substitui emoji)
    drawSkillBadge(doc, CX, 80, pal.abbr, pal.primary, pal.accent);

    // Label "CERTIFICADO DE CONQUISTA"
    doc.fillColor(pal.primary).font("Raleway-Bold").fontSize(11)
      .text("C  E  R  T  I  F  I  C  A  D  O   D  E   C  O  N  Q  U  I  S  T  A",
        30, 128, { width: W - 60, align: "center" });

    // Divider
    const lineY = 146;
    doc.moveTo(CX - 160, lineY).lineTo(CX + 160, lineY).lineWidth(1).strokeColor(pal.accent).stroke();

    // Título do certificado
    doc.fillColor(pal.primary).font("Nunito-Bold").fontSize(30)
      .text(cert.titulo, 30, 158, { width: W - 60, align: "center" });

    // "Concedido a"
    doc.fillColor(COLORS.gray).font("Lora").fontSize(12)
      .text("Concedido a", 30, 205, { width: W - 60, align: "center" });

    // Linha do nome do aluno
    const nameLineY = 245;
    doc.moveTo(CX - 200, nameLineY).lineTo(CX + 200, nameLineY).lineWidth(1.5).strokeColor(pal.primary).stroke();
    doc.fillColor(COLORS.gray).font("Nunito").fontSize(9)
      .text("(nome do aluno)", CX - 100, nameLineY + 4, { width: 200, align: "center" });

    // Conquista
    doc.fillColor(COLORS.dark).font("Poppins-Bold").fontSize(13)
      .text(cert.conquista, 30, 268, { width: W - 60, align: "center" });

    // Descrição
    doc.fillColor(COLORS.gray).font("Lora").fontSize(10.5)
      .text(cert.descricao, 80, 295, { width: W - 160, align: "center", lineGap: 3 });

    // Badge BNCC
    const badgeW = 170, badgeH = 20, badgeX = CX - badgeW / 2, badgeY = 348;
    doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 10).fill(pal.accent);
    doc.fillColor(COLORS.dark).font("Nunito-Bold").fontSize(8.5)
      .text(`Habilidade BNCC: ${cert.habilidade}`, badgeX, badgeY + 5, { width: badgeW, align: "center" });

    // Linhas de assinatura
    const sigY = 398;
    signLine(doc, 80, sigY, 200, "Professora / Escola", pal.primary);
    signLine(doc, CX - 50, sigY, 100, "Data", pal.primary);
    signLine(doc, W - 280, sigY, 200, "Observação especial", pal.primary);

    // Decoração de estrelas no rodapé (círculos coloridos)
    drawStars(doc, CX, 428, 5, pal.accent, 8);

    // Rodapé
    doc.fillColor(COLORS.lightgray).font("Nunito").fontSize(7.5)
      .text("Kit Despluga Pro — Atividades Desplugadas de Pensamento Computacional | Resolução BNCC CNE/CP nº 2/2022",
        30, H - 36, { width: W - 60, align: "center" });
  }

  return bufferFromDoc(doc);
}

// ═══════════════════════════════════════════════════════════
//  BUMP 2 — PASSAPORTE DO EXPLORADOR DESPLUGADO (8 páginas A4)
// ═══════════════════════════════════════════════════════════
const PASSPORT_SKILLS = [
  {
    nome: "Algoritmos",
    codigo: "EF15CO01",
    descricao_crianca: "É como uma receita! Uma lista de passos em ordem certa para fazer algo.",
    exemplo: "Atividade: dite os passos para um amigo montar um sanduíche — sem deixar o amigo perguntar nada!",
    cor: "#6C3FC5",
    corLight: "#EDE7F6",
    abbr: "ALG",
  },
  {
    nome: "Padrões",
    codigo: "EF15CO03",
    descricao_crianca: "Padrões são repetições! Quando algo segue uma regra que se repete.",
    exemplo: "Atividade: descubra a regra escondida na sequência de cartas e complete o padrão!",
    cor: "#00838F",
    corLight: "#E0F7FA",
    abbr: "PAD",
  },
  {
    nome: "Decomposição",
    codigo: "EF15CO02",
    descricao_crianca: "Dividir um problema grande em partes menores para resolver mais fácil!",
    exemplo: "Atividade: cada grupo faz uma parte do robô — depois montamos todos juntos!",
    cor: "#2E7D32",
    corLight: "#E8F5E9",
    abbr: "DEC",
  },
  {
    nome: "Abstração",
    codigo: "EF15CO04",
    descricao_crianca: "Focar só no que importa! Ignorar os detalhes que não ajudam.",
    exemplo: "Atividade: desenhe a escola usando SÓ 5 elementos essenciais!",
    cor: "#AD1457",
    corLight: "#FCE4EC",
    abbr: "ABS",
  },
];

async function gerarPassaporte() {
  const doc = new PDFDocument({ size: "A4", margin: 0, autoFirstPage: false });
  registerFonts(doc);
  const W = 595.28, H = 841.89;
  const CX = W / 2;
  const M = 36;

  // ── CAPA ──────────────────────────────────────────────────
  doc.addPage();

  doc.rect(0, 0, W, 280).fill("#1A237E");
  doc.rect(0, 265, W, 30).fill("#283593");
  doc.rect(0, 280, W, H - 280).fill("#FAFAFA");

  doc.fillColor(COLORS.white).font("Nunito-Bold").fontSize(11)
    .text("K I T   D E S P L U G A   P R O", M, 48, { width: W - M*2, align: "center", characterSpacing: 2 });

  doc.fillColor("#FFD740").font("Nunito-Bold").fontSize(38)
    .text("PASSAPORTE DO", M, 76, { width: W - M*2, align: "center" });
  doc.fillColor(COLORS.white).font("Nunito-Bold").fontSize(38)
    .text("EXPLORADOR", M, 116, { width: W - M*2, align: "center" });
  doc.fillColor("#FFD740").font("Nunito-Bold").fontSize(28)
    .text("DESPLUGADO", M, 158, { width: W - M*2, align: "center" });

  // Estrela decorativa ao lado do título (círculos)
  drawStars(doc, CX, 196, 5, "#FFD740", 6);

  doc.fillColor("#B3C0F7").font("Nunito").fontSize(10.5)
    .text("Meu registro de missões de Pensamento Computacional", M, 218, { width: W - M*2, align: "center" });

  // Caixa dados do aluno
  const boxY = 295, boxH = 200, boxX = M + 10;
  const boxW = W - (M + 10) * 2;
  doc.roundedRect(boxX, boxY, boxW, boxH, 12).fill(COLORS.white);
  doc.roundedRect(boxX, boxY, boxW, boxH, 12).lineWidth(2).strokeColor("#1A237E").stroke();

  // Header da caixa com ponto colorido
  doc.circle(boxX + 18, boxY + 22, 7).fill("#1A237E");
  doc.fillColor("#1A237E").font("Nunito-Bold").fontSize(12)
    .text("DADOS DO EXPLORADOR", boxX + 32, boxY + 15, { width: boxW - 44 });

  // Placeholder de foto
  const fotoX = W - M - 10 - 100, fotoY = boxY + 16;
  doc.roundedRect(fotoX, fotoY, 95, 120, 8).fill("#EEF0FF");
  doc.roundedRect(fotoX, fotoY, 95, 120, 8).lineWidth(1).strokeColor("#9FA8DA").stroke();
  doc.fillColor("#9FA8DA").font("Nunito").fontSize(9)
    .text("Cole sua\nfoto aqui", fotoX, fotoY + 50, { width: 95, align: "center" });

  const photoEndY = fotoY + 120;
  const fields = ["Nome:", "Turma:", "Escola:", "Professora:"];
  let fy = boxY + 50;
  for (const label of fields) {
    const lineEnd = (fy + 12 < photoEndY) ? fotoX - 8 : boxX + boxW - 20;
    doc.fillColor("#616161").font("Nunito-Bold").fontSize(10).text(label, boxX + 20, fy, { width: 80 });
    doc.moveTo(boxX + 105, fy + 12).lineTo(lineEnd, fy + 12).lineWidth(0.8).strokeColor("#9FA8DA").stroke();
    fy += 32;
  }

  // Minhas Missões
  const progY = boxY + boxH + 20;
  drawStars(doc, M + 16, progY + 6, 1, "#FFD740", 6);
  doc.fillColor("#1A237E").font("Nunito-Bold").fontSize(13)
    .text("Minhas Missões", M + 28, progY, { width: W - M*2 - 28 });

  const missions = [
    { nome: "Algoritmos",   cor: "#E8EAF6", abbr: "ALG" },
    { nome: "Padrões",      cor: "#E8EAF6", abbr: "PAD" },
    { nome: "Decomposição", cor: "#F3E5F5", abbr: "DEC" },
    { nome: "Abstração",    cor: "#F3E5F5", abbr: "ABS" },
    { nome: "Automação",    cor: "#E8F5E9", abbr: "AUT" },
  ];
  const cols = 2, mW = (W - M*2 - 20) / cols;
  for (let i = 0; i < missions.length; i++) {
    const isLast = i === missions.length - 1 && missions.length % 2 !== 0;
    const cardW = isLast ? W - M*2 : mW;
    const mx = isLast ? M : M + (i % cols) * (mW + 20);
    const my = progY + 30 + Math.floor(i / cols) * 50;
    doc.roundedRect(mx, my, cardW, 38, 6).fill(missions[i].cor);
    doc.circle(mx + 14, my + 10, 8).fill("#1A237E");
    doc.fillColor(COLORS.white).font("Nunito-Bold").fontSize(6)
      .text(missions[i].abbr, mx + 6, my + 7, { width: 16, align: "center" });
    doc.fillColor("#1A237E").font("Nunito-Bold").fontSize(10).text(missions[i].nome, mx + 28, my + 5, { width: cardW - 36 });
    doc.fillColor("#9E9E9E").font("Nunito").fontSize(8).text("Missões concluídas: ___ / 5", mx + 28, my + 20, { width: cardW - 36 });
  }

  doc.fillColor("#9E9E9E").font("Nunito").fontSize(8)
    .text("Kit Despluga Pro • Pensamento Computacional Desplugado • BNCC 2022", M, H - 30, { width: W - M*2, align: "center" });

  // ── PÁGINAS DE HABILIDADE ──────────────────────────────────
  for (const skill of PASSPORT_SKILLS) {
    doc.addPage();

    // Header colorido — 175px para acomodar badge inteiro
    doc.rect(0, 0, W, 175).fill(skill.cor);

    // Badge circular dentro do header (cy=88 = centro do header)
    drawSkillBadge(doc, M + 28, 88, skill.abbr, skill.cor, skill.corLight);

    // Textos alinhados à direita do badge
    doc.fillColor(COLORS.white).font("Nunito").fontSize(9)
      .text(`HABILIDADE BNCC: ${skill.codigo}`, M + 76, 22, { width: W - M - 76, characterSpacing: 1 });
    doc.fillColor(COLORS.white).font("Nunito-Bold").fontSize(34)
      .text(skill.nome, M + 76, 46, { width: W - M - 76 });
    doc.fillColor(skill.corLight).font("Nunito").fontSize(12)
      .text(skill.descricao_crianca, M + 76, 108, { width: W - M*2 - 76, lineGap: 2 });

    // Exemplo de atividade — começa logo após o header
    const exY = 190;
    doc.roundedRect(M, exY, W - M*2, 58, 8).fill(skill.corLight);
    doc.roundedRect(M, exY, W - M*2, 58, 8).lineWidth(1).strokeColor(skill.cor).stroke();
    doc.circle(M + 15, exY + 16, 9).fill(skill.cor);
    doc.fillColor(COLORS.white).font("Nunito-Bold").fontSize(9)
      .text("!", M + 11, exY + 11, { width: 8, align: "center" });
    doc.fillColor(skill.cor).font("Nunito-Bold").fontSize(10)
      .text("ATIVIDADE DE EXEMPLO:", M + 32, exY + 9, { width: W - M*2 - 32 });
    doc.fillColor("#424242").font("Nunito").fontSize(10)
      .text(skill.exemplo, M + 32, exY + 26, { width: W - M*2 - 32, lineGap: 1 });

    // Zona de carimbos/missões
    const stampY = 263;
    doc.circle(M + 8, stampY + 7, 6).fill(skill.cor);
    doc.fillColor(skill.cor).font("Nunito-Bold").fontSize(12)
      .text("MISSÕES CONCLUÍDAS — Cole seu carimbo ou desenhe uma estrela!", M + 20, stampY, { width: W - M*2 - 20 });

    const stampsPerRow = 5, stampSize = 74, stampGap = 14;
    const totalStampW = stampsPerRow * stampSize + (stampsPerRow - 1) * stampGap;
    const startX = (W - totalStampW) / 2;
    for (let s = 0; s < stampsPerRow; s++) {
      const sx = startX + s * (stampSize + stampGap);
      const sy = stampY + 24;
      doc.roundedRect(sx, sy, stampSize, stampSize, 10).fill(skill.corLight);
      doc.roundedRect(sx, sy, stampSize, stampSize, 10).lineWidth(2).strokeColor(skill.cor).stroke();
      doc.circle(sx + stampSize / 2, sy + 16, 13).fill(skill.cor);
      doc.fillColor(COLORS.white).font("Nunito-Bold").fontSize(11)
        .text(String(s + 1), sx + stampSize / 2 - 13, sy + 10, { width: 26, align: "center" });
      doc.fillColor(skill.cor).font("Nunito").fontSize(8)
        .text("Missão", sx, sy + stampSize - 18, { width: stampSize, align: "center" });
    }

    // O que aprendi — 5 linhas
    const learnY = 375;
    doc.circle(M + 8, learnY + 7, 6).fill(skill.cor);
    doc.fillColor(skill.cor).font("Nunito-Bold").fontSize(12)
      .text("O QUE EU APRENDI:", M + 20, learnY, { width: W - M*2 - 20 });
    for (let ln = 0; ln < 5; ln++) {
      doc.moveTo(M, learnY + 26 + ln * 30).lineTo(W - M, learnY + 26 + ln * 30).lineWidth(0.6).strokeColor("#BDBDBD").stroke();
    }

    // Área de desenho — preenche até o final da página
    const drawY = learnY + 178; // 26 + 5*30 + 2 de gap
    doc.circle(M + 8, drawY + 7, 6).fill(skill.cor);
    doc.fillColor(skill.cor).font("Nunito-Bold").fontSize(12)
      .text("MINHA ILUSTRAÇÃO DA ATIVIDADE:", M + 20, drawY, { width: W - M*2 - 20 });
    const drawBoxH = H - 42 - (drawY + 22); // preenche até 42px do final (footer)
    doc.roundedRect(M, drawY + 22, W - M*2, drawBoxH, 8).fill(skill.corLight);
    doc.roundedRect(M, drawY + 22, W - M*2, drawBoxH, 8).lineWidth(1.5).strokeColor(skill.cor).stroke();
    doc.fillColor(skill.cor).font("Nunito").fontSize(11).opacity(0.35)
      .text("Desenhe aqui o que você fez na atividade!", M, drawY + 22 + drawBoxH / 2 - 10, { width: W - M*2, align: "center" });
    doc.opacity(1);

    doc.fillColor("#9E9E9E").font("Nunito").fontSize(8)
      .text(`Kit Despluga Pro  •  ${skill.nome}  •  ${skill.codigo}`, M, H - 26, { width: W - M*2, align: "center" });
  }

  // ── MINHAS CONQUISTAS ──────────────────────────────────────
  doc.addPage();
  doc.rect(0, 0, W, 80).fill("#37474F");

  // Troféu desenhado: círculo + retângulo (substitui 🏆)
  const trofY = 28;
  doc.circle(M + 20, trofY + 14, 14).fill("#FFD740");
  doc.rect(M + 13, trofY + 22, 14, 5).fill("#FF8F00");

  doc.fillColor(COLORS.white).font("Nunito-Bold").fontSize(26)
    .text("MINHAS CONQUISTAS", M + 44, 26, { width: W - M - 44, align: "center" });

  const congY = 100;
  doc.fillColor("#37474F").font("Nunito-Bold").fontSize(11)
    .text("Escreva, cole adesivos ou desenhe suas conquistas em cada espaço:", M, congY, { width: W - M*2 });

  const conqLabels = [
    "Atividade que eu mais gostei:",
    "Algo novo que aprendi:",
    "Como ajudei um colega:",
    "Desafio que superei:",
    "Habilidade que desenvolvi:",
    "O que quero aprender mais:",
  ];
  const cols2 = 2, rows2 = 3, cW2 = (W - M*2 - 20) / cols2, cH2 = (H - congY - 60) / rows2 - 12;
  for (let i = 0; i < cols2 * rows2; i++) {
    const cx2 = M + (i % cols2) * (cW2 + 20);
    const cy2 = congY + 28 + Math.floor(i / cols2) * (cH2 + 12);
    doc.roundedRect(cx2, cy2, cW2, cH2, 8).fill("#ECEFF1");
    doc.roundedRect(cx2, cy2, cW2, cH2, 8).lineWidth(0.8).strokeColor("#B0BEC5").stroke();
    doc.circle(cx2 + 16, cy2 + 16, 11).fill("#37474F");
    doc.fillColor(COLORS.white).font("Nunito-Bold").fontSize(9)
      .text(String(i + 1), cx2 + 5, cy2 + 12, { width: 22, align: "center" });
    doc.fillColor("#546E7A").font("Nunito-Bold").fontSize(9)
      .text(conqLabels[i], cx2 + 34, cy2 + 10, { width: cW2 - 44 });
    // Linhas de escrita dentro da caixa
    for (let ln = 1; ln <= 3; ln++) {
      const lineY = cy2 + 30 + ln * ((cH2 - 40) / 4);
      doc.moveTo(cx2 + 10, lineY).lineTo(cx2 + cW2 - 10, lineY).lineWidth(0.5).strokeColor("#B0BEC5").stroke();
    }
  }

  doc.fillColor("#9E9E9E").font("Nunito").fontSize(8)
    .text("Kit Despluga Pro • Pensamento Computacional Desplugado", M, H - 30, { width: W - M*2, align: "center" });

  // ── ATIVIDADE FAVORITA ─────────────────────────────────────
  doc.addPage();
  doc.rect(0, 0, W, 80).fill("#F57F17");
  drawStars(doc, M + 26, 38, 1, "#FFCA28", 12);
  doc.fillColor(COLORS.white).font("Nunito-Bold").fontSize(24)
    .text("MINHA ATIVIDADE FAVORITA", M + 48, 28, { width: W - M - 48, align: "center" });

  doc.fillColor("#F57F17").font("Nunito-Bold").fontSize(12)
    .text("Qual atividade você mais gostou? Escreva e desenhe aqui:", M, 100, { width: W - M*2 });

  const favFields = ["Nome da atividade:", "Por que eu gostei:", "O que aprendi:"];
  let ffY = 124;
  for (const f of favFields) {
    doc.fillColor("#424242").font("Nunito-Bold").fontSize(10).text(f, M, ffY, { width: 180 });
    doc.moveTo(M + 185, ffY + 11).lineTo(W - M, ffY + 11).lineWidth(0.8).strokeColor("#FFB300").stroke();
    ffY += 35;
  }

  doc.circle(M + 8, ffY + 17, 6).fill("#F57F17");
  doc.fillColor("#F57F17").font("Nunito-Bold").fontSize(12)
    .text("ESPACO PARA DESENHAR:", M + 20, ffY + 10, { width: W - M*2 - 20 });
  const favDrawH = 340;
  doc.roundedRect(M, ffY + 32, W - M*2, favDrawH, 8).fill("#FFF8E1");
  doc.roundedRect(M, ffY + 32, W - M*2, favDrawH, 8).lineWidth(1.5).strokeColor("#FFB300").stroke();
  doc.fillColor("#FFB300").font("Nunito").fontSize(11).opacity(0.5)
    .text("Solte a criatividade!", M, ffY + 32 + favDrawH / 2 - 10, { width: W - M*2, align: "center" });
  doc.opacity(1);

  doc.fillColor("#9E9E9E").font("Nunito").fontSize(8)
    .text("Kit Despluga Pro • Pensamento Computacional Desplugado", M, H - 30, { width: W - M*2, align: "center" });

  return bufferFromDoc(doc);
}

// ═══════════════════════════════════════════════════════════
//  BUMP 3 — FICHAS DE ACOMPANHAMENTO DE TURMA (4 fichas A4)
// ═══════════════════════════════════════════════════════════
async function gerarFichas() {
  const doc = new PDFDocument({ size: "A4", margin: 0, autoFirstPage: false });
  registerFonts(doc);
  const W = 595.28, H = 841.89;
  const M = 36;
  const CW = W - M * 2;

  // ── FICHA 1: REGISTRO DE TURMA ────────────────────────────
  doc.addPage();
  doc.rect(0, 0, W, 70).fill("#1565C0");
  doc.fillColor(COLORS.white).font("Nunito-Bold").fontSize(8)
    .text("KIT DESPLUGA PRO — FICHAS DE ACOMPANHAMENTO", M, 14, { width: CW, characterSpacing: 1 });
  // Badge número da ficha
  doc.roundedRect(M, 33, 24, 22, 4).fill(COLORS.white);
  doc.fillColor("#1565C0").font("Nunito-Bold").fontSize(13).text("1", M, 37, { width: 24, align: "center" });
  doc.fillColor(COLORS.white).font("Nunito-Bold").fontSize(18)
    .text("Ficha 1 — Registro de Turma", M + 32, 36, { width: CW - 32 });

  // Info da aula
  let y = 85;
  const infoFields = [["Professora:", 160], ["Turma:", 90], ["Data:", 90], ["Atividade:", 210]];
  let ix = M;
  for (const [label, fw] of infoFields) {
    doc.fillColor("#424242").font("Nunito-Bold").fontSize(9).text(label, ix, y, { width: 70 });
    doc.moveTo(ix + 72, y + 11).lineTo(ix + fw, y + 11).lineWidth(0.7).strokeColor("#90CAF9").stroke();
    ix += fw + 8;
  }
  y += 22;
  doc.fillColor("#424242").font("Nunito-Bold").fontSize(9).text("Habilidade BNCC:", M, y, { width: 110 });
  doc.moveTo(M + 115, y + 11).lineTo(M + 380, y + 11).lineWidth(0.7).strokeColor("#90CAF9").stroke();
  doc.fillColor("#424242").font("Nunito-Bold").fontSize(9).text("Tempo:", M + 390, y, { width: 50 });
  doc.moveTo(M + 443, y + 11).lineTo(W - M, y + 11).lineWidth(0.7).strokeColor("#90CAF9").stroke();

  // Tabela
  y += 24;
  const cols = [
    { label: "N", w: 28 },
    { label: "Nome do Aluno", w: 158 },
    { label: "Participou?", w: 58 },
    { label: "Concluiu a Atividade?", w: 95 },
    { label: "Dificuldade", w: 65 },
    { label: "Conceito\n(A/B/C)", w: 48 },
    { label: "Observações", w: 57 },
  ];
  const totalColW = cols.reduce((s, c) => s + c.w, 0);
  const rowH = 20, headerH = 28, nRows = 25;

  let cx = M;
  doc.rect(M, y, totalColW, headerH).fill("#1565C0");
  for (const col of cols) {
    doc.fillColor(COLORS.white).font("Nunito-Bold").fontSize(7.5)
      .text(col.label, cx + 3, y + (col.label.includes("\n") ? 5 : 9), { width: col.w - 6, align: "center" });
    cx += col.w;
  }

  for (let r = 0; r < nRows; r++) {
    const ry = y + headerH + r * rowH;
    const bg = r % 2 === 0 ? "#EEF5FB" : COLORS.white;
    doc.rect(M, ry, totalColW, rowH).fill(bg);
    doc.rect(M, ry, totalColW, rowH).lineWidth(0.3).strokeColor("#BBDEFB").stroke();
    doc.fillColor("#616161").font("Nunito").fontSize(8)
      .text(String(r + 1), M, ry + 6, { width: cols[0].w, align: "center" });

    // Colunas Participou e Concluiu — checkboxes S/N
    let ccx = M + cols[0].w + cols[1].w;
    for (let k = 0; k < 2; k++) {
      const boxS = 9;
      const bx = ccx + cols[k + 2].w / 2 - 14;
      const by = ry + rowH / 2 - boxS / 2;
      doc.rect(bx, by, boxS, boxS).lineWidth(0.6).strokeColor("#90CAF9").stroke();
      doc.fillColor("#9E9E9E").font("Nunito").fontSize(7).text("S", bx + boxS + 2, by + 1);
      doc.rect(bx + 18, by, boxS, boxS).lineWidth(0.6).strokeColor("#90CAF9").stroke();
      doc.fillColor("#9E9E9E").font("Nunito").fontSize(7).text("N", bx + boxS + 20, by + 1);
      ccx += cols[k + 2].w;
    }

    // Coluna Dificuldade — checkboxes B / M / A
    const difColX = M + cols[0].w + cols[1].w + cols[2].w + cols[3].w;
    const difOpts = ["B", "M", "A"];
    for (let o = 0; o < 3; o++) {
      const bxD = difColX + 4 + o * 19;
      const byD = ry + rowH / 2 - 5;
      doc.rect(bxD, byD, 10, 10).lineWidth(0.6).strokeColor("#90CAF9").stroke();
      doc.fillColor("#9E9E9E").font("Nunito").fontSize(6).text(difOpts[o], bxD + 1, byD + 2);
    }

    // Coluna Conceito — checkboxes A / B / C
    const conColX = difColX + cols[4].w;
    const conOpts = ["A", "B", "C"];
    for (let o = 0; o < 3; o++) {
      const bxC = conColX + 2 + o * 14;
      const byC = ry + rowH / 2 - 5;
      doc.rect(bxC, byC, 10, 10).lineWidth(0.6).strokeColor("#90CAF9").stroke();
      doc.fillColor("#9E9E9E").font("Nunito").fontSize(6).text(conOpts[o], bxC + 2, byC + 2);
    }
  }

  const footY = y + headerH + nRows * rowH + 10;
  doc.fillColor("#9E9E9E").font("Nunito").fontSize(8)
    .text("B = Baixa  •  M = Média  •  A = Alta dificuldade  |  Conceito: A = Avançado  •  B = Em Desenvolvimento  •  C = Iniciando  |  Kit Despluga Pro", M, footY, { width: CW, align: "center" });

  // ── FICHA 2: PLANNER SEMANAL ───────────────────────────────
  doc.addPage();
  doc.rect(0, 0, W, 70).fill("#2E7D32");
  doc.fillColor(COLORS.white).font("Nunito-Bold").fontSize(8)
    .text("KIT DESPLUGA PRO — FICHAS DE ACOMPANHAMENTO", M, 14, { width: CW, characterSpacing: 1 });
  doc.roundedRect(M, 33, 24, 22, 4).fill(COLORS.white);
  doc.fillColor("#2E7D32").font("Nunito-Bold").fontSize(13).text("2", M, 37, { width: 24, align: "center" });
  doc.fillColor(COLORS.white).font("Nunito-Bold").fontSize(18)
    .text("Ficha 2 — Planner Semanal de Atividades", M + 32, 36, { width: CW - 32 });

  y = 85;
  doc.fillColor("#424242").font("Nunito-Bold").fontSize(9).text("Semana:", M, y);
  doc.moveTo(M + 58, y + 11).lineTo(M + 200, y + 11).lineWidth(0.7).strokeColor("#A5D6A7").stroke();
  doc.fillColor("#424242").font("Nunito-Bold").fontSize(9).text("de:", M + 210, y);
  doc.moveTo(M + 230, y + 11).lineTo(M + 320, y + 11).lineWidth(0.7).strokeColor("#A5D6A7").stroke();
  doc.fillColor("#424242").font("Nunito-Bold").fontSize(9).text("a:", M + 330, y);
  doc.moveTo(M + 348, y + 11).lineTo(M + 440, y + 11).lineWidth(0.7).strokeColor("#A5D6A7").stroke();

  y += 24;
  const days = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];
  const dayW = CW / days.length;
  // Cada campo com altura generosa para escrever
  const sectionFields = [
    { label: "Turma(s):",      h: 32 },
    { label: "Atividade:",     h: 48 },
    { label: "Habilidade\nBNCC:", h: 38 },
    { label: "Tempo:",         h: 28 },
    { label: "Materiais:",     h: 42 },
    { label: "Observações:",   h: 48 },
  ];
  const sectionH = sectionFields.reduce((s, f) => s + f.h, 0) + 10;

  for (let d = 0; d < days.length; d++) {
    const dx = M + d * dayW;
    doc.rect(dx, y, dayW - 3, 24).fill("#2E7D32");
    doc.fillColor(COLORS.white).font("Nunito-Bold").fontSize(10)
      .text(days[d], dx, y + 6, { width: dayW - 3, align: "center" });
  }
  y += 24;

  for (let d = 0; d < days.length; d++) {
    const dx = M + d * dayW;
    doc.rect(dx, y, dayW - 3, sectionH).fill(d % 2 === 0 ? "#E8F5E9" : "#F1F8E9");
    doc.rect(dx, y, dayW - 3, sectionH).lineWidth(0.5).strokeColor("#A5D6A7").stroke();
    let fy2 = y + 6;
    for (const field of sectionFields) {
      doc.fillColor("#388E3C").font("Nunito-Bold").fontSize(7)
        .text(field.label, dx + 4, fy2, { width: dayW - 10, lineGap: 0 });
      const lineY = fy2 + field.h - 8;
      doc.moveTo(dx + 4, lineY).lineTo(dx + dayW - 8, lineY).lineWidth(0.5).strokeColor("#C8E6C9").stroke();
      // Segunda linha de escrita para campos maiores
      if (field.h >= 42) {
        doc.moveTo(dx + 4, lineY - 16).lineTo(dx + dayW - 8, lineY - 16).lineWidth(0.3).strokeColor("#C8E6C9").stroke();
      }
      fy2 += field.h;
    }
  }
  y += sectionH + 14;

  // Meta da semana
  doc.circle(M + 8, y + 8, 6).fill("#2E7D32");
  doc.fillColor("#2E7D32").font("Nunito-Bold").fontSize(12)
    .text("Meta da Semana", M + 20, y + 1, { width: CW - 20 });
  y += 18;
  for (let i = 0; i < 4; i++) {
    doc.moveTo(M, y).lineTo(W - M, y).lineWidth(0.7).strokeColor("#A5D6A7").stroke(); y += 26;
  }

  doc.circle(M + 8, y + 10, 6).fill("#2E7D32");
  doc.fillColor("#2E7D32").font("Nunito-Bold").fontSize(12)
    .text("Reflexão da Semana", M + 20, y + 4, { width: CW - 20 });
  y += 26;
  for (let i = 0; i < 9; i++) {
    doc.moveTo(M, y).lineTo(W - M, y).lineWidth(0.7).strokeColor("#A5D6A7").stroke();
    y += 26;
  }

  doc.fillColor("#9E9E9E").font("Nunito").fontSize(8)
    .text("Kit Despluga Pro — Fichas de Acompanhamento | Resolução BNCC CNE/CP nº 2/2022", M, H - 30, { width: CW, align: "center" });

  // ── FICHA 3: AVALIAÇÃO INDIVIDUAL ─────────────────────────
  doc.addPage();
  doc.rect(0, 0, W, 70).fill("#6A1B9A");
  doc.fillColor(COLORS.white).font("Nunito-Bold").fontSize(8)
    .text("KIT DESPLUGA PRO — FICHAS DE ACOMPANHAMENTO", M, 14, { width: CW, characterSpacing: 1 });
  doc.roundedRect(M, 33, 24, 22, 4).fill(COLORS.white);
  doc.fillColor("#6A1B9A").font("Nunito-Bold").fontSize(13).text("3", M, 37, { width: 24, align: "center" });
  doc.fillColor(COLORS.white).font("Nunito-Bold").fontSize(18)
    .text("Ficha 3 — Avaliação Individual do Aluno", M + 32, 36, { width: CW - 32 });

  y = 85;
  const alunoFields = [["Nome do Aluno:", 250], ["Turma:", 100], ["Data:", 120]];
  ix = M;
  for (const [label, fw] of alunoFields) {
    doc.fillColor("#424242").font("Nunito-Bold").fontSize(9).text(label, ix, y, { width: 110 });
    doc.moveTo(ix + 112, y + 11).lineTo(ix + fw, y + 11).lineWidth(0.7).strokeColor("#CE93D8").stroke();
    ix += fw + 10;
  }

  y += 26;
  doc.circle(M + 8, y + 8, 6).fill("#6A1B9A");
  doc.fillColor("#6A1B9A").font("Nunito-Bold").fontSize(12)
    .text("Habilidades de Pensamento Computacional", M + 20, y + 1);
  y += 18;

  const habilidades = [
    ["EF15CO01", "Algoritmos",    "Cria sequências ordenadas de passos para resolver problemas"],
    ["EF15CO02", "Decomposição",  "Divide problemas grandes em partes menores"],
    ["EF15CO03", "Padrões",       "Identifica regularidades e sequências"],
    ["EF15CO04", "Abstração",     "Foca nos aspectos essenciais, ignora detalhes desnecessários"],
    ["EF15CO05", "Automação",     "Compreende como instruções repetidas realizam tarefas"],
  ];

  const hCols = [55, 90, 220, 50, 50, 50];
  const hLabels = ["Código", "Habilidade", "Descrição", "Iniciando", "Desenvolvendo", "Avançado"];
  cx = M;
  doc.rect(M, y, hCols.reduce((s, c) => s + c, 0), 22).fill("#6A1B9A");
  for (let k = 0; k < hLabels.length; k++) {
    doc.fillColor(COLORS.white).font("Nunito-Bold").fontSize(7.5)
      .text(hLabels[k], cx + 3, y + 7, { width: hCols[k] - 6, align: "center" });
    cx += hCols[k];
  }
  y += 22;

  for (let h = 0; h < habilidades.length; h++) {
    const [cod, nome, desc] = habilidades[h];
    const bg = h % 2 === 0 ? "#F3E5F5" : COLORS.white;
    const hRow = 28;
    doc.rect(M, y, hCols.reduce((s, c) => s + c, 0), hRow).fill(bg);
    cx = M;
    const rowData = [cod, nome, desc];
    for (let k = 0; k < rowData.length; k++) {
      doc.fillColor("#424242").font(k < 2 ? "Nunito-Bold" : "Nunito").fontSize(8)
        .text(rowData[k], cx + 3, y + (k < 2 ? 9 : 5), { width: hCols[k] - 6, align: k === 0 ? "center" : "left", lineGap: 1 });
      cx += hCols[k];
    }
    for (let n = 0; n < 3; n++) {
      const bSize = 12, bx = cx + (hCols[3 + n] - bSize) / 2, by = y + (hRow - bSize) / 2;
      doc.roundedRect(bx, by, bSize, bSize, 2).lineWidth(0.7).strokeColor("#9C27B0").stroke();
      cx += hCols[3 + n];
    }
    doc.rect(M, y, hCols.reduce((s, c) => s + c, 0), hRow).lineWidth(0.3).strokeColor("#CE93D8").stroke();
    y += hRow;
  }

  y += 14;
  doc.circle(M + 8, y + 8, 6).fill("#6A1B9A");
  doc.fillColor("#6A1B9A").font("Nunito-Bold").fontSize(12).text("Comportamento e Participação em Grupo", M + 20, y + 1);
  y += 18;
  const compItems = [
    "Participa ativamente das atividades",
    "Colabora com os colegas",
    "Respeita as regras da dinâmica",
    "Demonstra autonomia na resolução",
  ];
  for (const item of compItems) {
    const bSize = 11;
    doc.roundedRect(M, y + 2, bSize, bSize, 2).lineWidth(0.7).strokeColor("#9C27B0").stroke();
    doc.fillColor("#424242").font("Nunito").fontSize(9).text(item, M + 18, y + 1, { width: 280 });
    // 5 círculos vazios para a professora preencher
    for (let s = 0; s < 5; s++) {
      doc.circle(M + 330 + s * 20, y + 7, 7).lineWidth(1).strokeColor("#9C27B0").stroke();
    }
    doc.fillColor("#9E9E9E").font("Nunito").fontSize(7).text("(preencher)", M + 435, y + 3, { width: 80 });
    y += 22;
  }

  y += 10;
  doc.circle(M + 8, y + 8, 6).fill("#6A1B9A");
  doc.fillColor("#6A1B9A").font("Nunito-Bold").fontSize(12).text("Observações e Próximos Passos:", M + 20, y + 1);
  y += 18;
  for (let i = 0; i < 14; i++) {
    doc.moveTo(M, y).lineTo(W - M, y).lineWidth(0.6).strokeColor("#CE93D8").stroke();
    y += 24;
  }

  doc.fillColor("#9E9E9E").font("Nunito").fontSize(8)
    .text("Kit Despluga Pro — Fichas de Acompanhamento | Resolução BNCC CNE/CP nº 2/2022", M, H - 30, { width: CW, align: "center" });

  // ── FICHA 4: RELATÓRIO MENSAL ──────────────────────────────
  doc.addPage();
  doc.rect(0, 0, W, 70).fill("#E65100");
  doc.fillColor(COLORS.white).font("Nunito-Bold").fontSize(8)
    .text("KIT DESPLUGA PRO — FICHAS DE ACOMPANHAMENTO", M, 14, { width: CW, characterSpacing: 1 });
  doc.roundedRect(M, 33, 24, 22, 4).fill(COLORS.white);
  doc.fillColor("#E65100").font("Nunito-Bold").fontSize(13).text("4", M, 37, { width: 24, align: "center" });
  doc.fillColor(COLORS.white).font("Nunito-Bold").fontSize(18)
    .text("Ficha 4 — Relatório Mensal Simplificado", M + 32, 36, { width: CW - 32 });

  y = 85;
  doc.fillColor("#424242").font("Nunito-Bold").fontSize(9).text("Mês/Ano:", M, y);
  doc.moveTo(M + 60, y + 11).lineTo(M + 180, y + 11).lineWidth(0.7).strokeColor("#FFAB91").stroke();
  doc.fillColor("#424242").font("Nunito-Bold").fontSize(9).text("Professora:", M + 200, y);
  doc.moveTo(M + 264, y + 11).lineTo(W - M, y + 11).lineWidth(0.7).strokeColor("#FFAB91").stroke();

  y += 24;

  // Cards de resumo (sem emojis — usa círculo colorido com letra)
  const cards = [
    { label: "Total de Atividades Realizadas", abbr: "AT", color: "#E65100" },
    { label: "Habilidades BNCC Trabalhadas",   abbr: "BC", color: "#1565C0" },
    { label: "Turmas Atendidas",               abbr: "TU", color: "#2E7D32" },
    { label: "% Turma com Conceito A",         abbr: "A+", color: "#6A1B9A" },
  ];
  const cardW = (CW - 15) / 2, cardH = 55;
  for (let c = 0; c < cards.length; c++) {
    const card = cards[c];
    const cx2 = M + (c % 2) * (cardW + 15);
    const cy2 = y + Math.floor(c / 2) * (cardH + 12);
    doc.roundedRect(cx2, cy2, cardW, cardH, 8).fill("#FFF3E0");
    doc.rect(cx2, cy2, 5, cardH).fill(card.color);
    // Mini badge com abbr
    doc.circle(cx2 + 22, cy2 + 16, 11).fill(card.color);
    doc.fillColor(COLORS.white).font("Nunito-Bold").fontSize(8)
      .text(card.abbr, cx2 + 11, cy2 + 12, { width: 22, align: "center" });
    doc.fillColor("#424242").font("Nunito-Bold").fontSize(9)
      .text(card.label, cx2 + 40, cy2 + 8, { width: cardW - 50 });
    doc.moveTo(cx2 + 14, cy2 + 36).lineTo(cx2 + cardW - 14, cy2 + 36).lineWidth(1).strokeColor(card.color).stroke();
    doc.fillColor("#9E9E9E").font("Nunito").fontSize(8).text("Preencher:", cx2 + 14, cy2 + 40, { width: cardW - 24 });
  }

  y += 2 * (cardH + 12) + 14;

  // Habilidades BNCC
  doc.circle(M + 8, y + 8, 6).fill("#E65100");
  doc.fillColor("#E65100").font("Nunito-Bold").fontSize(12)
    .text("Quais Habilidades BNCC foram trabalhadas neste mês?", M + 20, y + 1, { width: CW - 20 });
  y += 18;
  const bnccItems = [
    "EF15CO01 — Algoritmos",   "EF15CO02 — Decomposição",
    "EF15CO03 — Padrões",      "EF15CO04 — Abstração",    "EF15CO05 — Automação",
  ];
  const bncCols = 3, bncW = CW / bncCols;
  for (let b = 0; b < bnccItems.length; b++) {
    const bx2 = M + (b % bncCols) * bncW;
    const by2 = y + Math.floor(b / bncCols) * 22;
    doc.roundedRect(bx2, by2 + 2, 12, 12, 2).lineWidth(0.8).strokeColor("#FF8A65").stroke();
    doc.fillColor("#424242").font("Nunito").fontSize(9).text(bnccItems[b], bx2 + 18, by2 + 4, { width: bncW - 20 });
  }
  y += Math.ceil(bnccItems.length / bncCols) * 22 + 12;

  // Seções de texto
  const sections = [
    { label: "Destaques do Mês", color: "#E65100" },
    { label: "Dificuldades Observadas", color: "#C62828" },
    { label: "Planejamento do Próximo Mês", color: "#E65100" },
  ];
  for (const sec of sections) {
    doc.circle(M + 8, y + 8, 6).fill(sec.color);
    doc.fillColor(sec.color).font("Nunito-Bold").fontSize(12).text(sec.label, M + 20, y + 1); y += 18;
    for (let i = 0; i < 6; i++) {
      doc.moveTo(M, y).lineTo(W - M, y).lineWidth(0.6).strokeColor("#FFAB91").stroke(); y += 22;
    }
    y += 4;
  }

  doc.fillColor("#9E9E9E").font("Nunito").fontSize(8)
    .text("Kit Despluga Pro — Fichas de Acompanhamento | Resolução BNCC CNE/CP nº 2/2022", M, H - 30, { width: CW, align: "center" });

  return bufferFromDoc(doc);
}

// ── Helper: doc → Buffer ───────────────────────────────────
function bufferFromDoc(doc) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    doc.on("data", c => chunks.push(c));
    doc.on("end",  () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
    doc.end();
  });
}

module.exports = { gerarCertificados, gerarPassaporte, gerarFichas };
