// ============================================================
// NEXUS — Gerador de Materiais Imprimíveis para Sala de Aula
// PDFKit direto — sem IA, conteúdo 100% curado e específico
// ============================================================

const PDFDocument = require("pdfkit");
const path = require("path");
const fs   = require("fs");

const FONTS_DIR = path.join(__dirname, "../../assets/fonts");

// ── Paletas por tipo ───────────────────────────────────────
const COLORS = {
  purple : "#6C3FC5",
  gold   : "#F5A623",
  green  : "#2E7D32",
  teal   : "#00838F",
  red    : "#C62828",
  blue   : "#1565C0",
  orange : "#E65100",
  pink   : "#AD1457",
  white  : "#FFFFFF",
  offwhite: "#FAFAFA",
  dark   : "#1A1A2E",
  gray   : "#616161",
  lightgray: "#EEEEEE",
};

// Paleta por certificado
const CERT_PALETTES = [
  { primary: "#6C3FC5", accent: "#F5A623", label: "Algoritmos"   },
  { primary: "#00838F", accent: "#FFD740", label: "Padrões"       },
  { primary: "#2E7D32", accent: "#AED581", label: "Decomposição"  },
  { primary: "#AD1457", accent: "#F48FB1", label: "Abstração"     },
  { primary: "#E65100", accent: "#FFB74D", label: "Kit Completo"  },
  { primary: "#1565C0", accent: "#90CAF9", label: "Explorador"    },
  { primary: "#4A148C", accent: "#CE93D8", label: "Lógica"        },
  { primary: "#004D40", accent: "#80CBC4", label: "Criatividade"  },
];

// ── Helpers de fonte ───────────────────────────────────────
function registerFonts(doc) {
  const reg = (name, file) => {
    const p = path.join(FONTS_DIR, file);
    if (fs.existsSync(p)) doc.registerFont(name, p);
  };
  reg("Nunito",         "Nunito-Regular.ttf");
  reg("Nunito-Bold",    "Nunito-Bold.ttf");
  reg("DancingScript",  "DancingScript-Regular.ttf");
  reg("DancingScript-Bold", "DancingScript-Bold.ttf");
  reg("GreatVibes",     "GreatVibes-Regular.ttf");
  reg("Raleway",        "Raleway-Regular.ttf");
  reg("Raleway-Bold",   "Raleway-Bold.ttf");
  reg("Poppins",        "Poppins-Regular.ttf");
  reg("Poppins-Bold",   "Poppins-SemiBold.ttf");
  reg("Lora",           "Lora-Regular.ttf");
  reg("Lora-Bold",      "Lora-Bold.ttf");
}

// ── Stars helper ──────────────────────────────────────────
function drawStar(doc, cx, cy, r, color) {
  const pts = 5;
  const inner = r * 0.4;
  doc.save();
  doc.fillColor(color);
  let path_d = "";
  for (let i = 0; i < pts * 2; i++) {
    const angle = (i * Math.PI) / pts - Math.PI / 2;
    const rad = i % 2 === 0 ? r : inner;
    const x = cx + rad * Math.cos(angle);
    const y = cy + rad * Math.sin(angle);
    path_d += (i === 0 ? "M" : "L") + `${x},${y}`;
  }
  path_d += "Z";
  // Draw stars as circles (PDFKit doesn't parse SVG path strings this way — use circles as fallback)
  doc.circle(cx, cy, r * 0.6).fill();
  doc.restore();
}

// ── Decorative border ─────────────────────────────────────
function drawCertBorder(doc, W, H, primary, accent) {
  // Outer fill
  doc.rect(0, 0, W, H).fill("#FFFDF4");

  // Thick outer border
  doc.rect(12, 12, W - 24, H - 24).lineWidth(5).strokeColor(primary).stroke();
  // Thin inner border
  doc.rect(20, 20, W - 40, H - 40).lineWidth(1.5).strokeColor(accent).stroke();

  // Corner decorations — filled squares
  const cs = 14;
  for (const [x, y] of [[12,12],[W-12-cs,12],[12,H-12-cs],[W-12-cs,H-12-cs]]) {
    doc.rect(x, y, cs, cs).fill(primary);
    doc.rect(x+2, y+2, cs-4, cs-4).fill(accent);
  }

  // Top decorative bar
  doc.rect(12, 12, W - 24, 5).fill(primary);
  doc.rect(12, H - 17, W - 24, 5).fill(primary);
}

// ── Linha para assinar/preencher ──────────────────────────
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
    emoji:     "🤖",
    conquista: "Completou as atividades de Algoritmos",
    descricao: "Demonstrou habilidade em criar sequências ordenadas\nde passos para resolver problemas — assim como um programador!",
    habilidade: "EF15CO01",
  },
  {
    titulo:    "Detetive de Padrões",
    emoji:     "🔍",
    conquista: "Identificou padrões e sequências",
    descricao: "Encontrou regularidades escondidas em sequências e desafios,\nmostrando um olhar atento e investigador!",
    habilidade: "EF15CO03",
  },
  {
    titulo:    "Engenheiro Desplugado",
    emoji:     "🧩",
    conquista: "Dominou a Decomposição de Problemas",
    descricao: "Provou que problemas grandes ficam pequenos\nquando divididos em partes — um verdadeiro engenheiro!",
    habilidade: "EF15CO02",
  },
  {
    titulo:    "Pensador Abstrato",
    emoji:     "🌐",
    conquista: "Praticou Abstração com Excelência",
    descricao: "Aprendeu a identificar o que é essencial em um problema,\nfocando no que realmente importa!",
    habilidade: "EF15CO04",
  },
  {
    titulo:    "Super Programador Sem Computador",
    emoji:     "🏆",
    conquista: "Concluiu o Kit Despluga Pro Completo",
    descricao: "Completou todas as atividades de Pensamento Computacional\ne provou que a tecnologia começa na mente!",
    habilidade: "EF15CO01–CO05",
  },
  {
    titulo:    "Explorador Digital",
    emoji:     "🧭",
    conquista: "Participou das Dinâmicas Desplugadas",
    descricao: "Explorou o mundo do Pensamento Computacional\ncom curiosidade, coragem e muita criatividade!",
    habilidade: "EF15CO01–CO05",
  },
  {
    titulo:    "Campeão da Lógica",
    emoji:     "⚡",
    conquista: "Resolveu Desafios de Raciocínio Lógico",
    descricao: "Mostrou raciocínio afiado ao resolver desafios\nque exigem lógica, sequência e organização de ideias!",
    habilidade: "EF15CO01",
  },
  {
    titulo:    "Criador de Soluções",
    emoji:     "💡",
    conquista: "Resolveu Problemas com Criatividade",
    descricao: "Encontrou soluções únicas e criativas para desafios\nmostrando que o Pensamento Computacional inspira a inovação!",
    habilidade: "EF15CO02–CO04",
  },
];

async function gerarCertificados() {
  // A4 landscape: 841.89 x 595.28
  const doc = new PDFDocument({ size: "A4", layout: "landscape", margin: 0, autoFirstPage: false });
  registerFonts(doc);

  const W = 841.89, H = 595.28;
  const CX = W / 2;

  for (let i = 0; i < CERTIFICATES.length; i++) {
    const cert = CERTIFICATES[i];
    const pal = CERT_PALETTES[i];

    doc.addPage();
    drawCertBorder(doc, W, H, pal.primary, pal.accent);

    // Emoji grande como elemento visual
    doc.fillColor(pal.primary).font("Nunito-Bold").fontSize(52)
      .text(cert.emoji, CX - 50, 40, { width: 100, align: "center" });

    // Label "CERTIFICADO DE CONQUISTA"
    doc.fillColor(pal.primary).font("Raleway-Bold").fontSize(11)
      .text("C  E  R  T  I  F  I  C  A  D  O  D  E  C  O  N  Q  U  I  S  T  A", 30, 120, { width: W - 60, align: "center", characterSpacing: 1 });

    // Divider line
    const lineY = 138;
    doc.moveTo(CX - 160, lineY).lineTo(CX + 160, lineY).lineWidth(1).strokeColor(pal.accent).stroke();

    // Título do certificado
    doc.fillColor(pal.primary).font("Nunito-Bold").fontSize(32)
      .text(cert.titulo, 30, 150, { width: W - 60, align: "center" });

    // "Concedido a" text
    doc.fillColor(COLORS.gray).font("Lora").fontSize(12)
      .text("Concedido a", 30, 200, { width: W - 60, align: "center" });

    // Nome do aluno — linha para preencher
    const nameLineY = 240;
    doc.moveTo(CX - 200, nameLineY).lineTo(CX + 200, nameLineY).lineWidth(1.5).strokeColor(pal.primary).stroke();
    doc.fillColor(COLORS.gray).font("Nunito").fontSize(9)
      .text("(nome do aluno)", CX - 100, nameLineY + 4, { width: 200, align: "center" });

    // Conquista
    doc.fillColor(COLORS.dark).font("Poppins-Bold").fontSize(13)
      .text(cert.conquista, 30, 265, { width: W - 60, align: "center" });

    // Descrição
    doc.fillColor(COLORS.gray).font("Lora").fontSize(10.5)
      .text(cert.descricao, 80, 293, { width: W - 160, align: "center", lineGap: 3 });

    // Habilidade BNCC
    const badgeW = 160, badgeH = 18, badgeX = CX - badgeW / 2, badgeY = 345;
    doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 9).fill(pal.accent);
    doc.fillColor(COLORS.dark).font("Nunito-Bold").fontSize(8)
      .text(`Habilidade BNCC: ${cert.habilidade}`, badgeX, badgeY + 4, { width: badgeW, align: "center" });

    // Assinaturas e data — linha base y=400
    const sigY = 395;
    // Professora (esquerda)
    signLine(doc, 80, sigY, 200, "Professora / Escola", pal.primary);
    // Data (centro)
    signLine(doc, CX - 50, sigY, 100, "Data", pal.primary);
    // Nota / obs (direita)
    signLine(doc, W - 280, sigY, 200, "Observação especial", pal.primary);

    // Stars decorativos no rodapé
    const stars = ["⭐", "⭐", "⭐", "⭐", "⭐"];
    doc.fillColor(pal.accent).font("Nunito").fontSize(18)
      .text(stars.join("  "), 30, 418, { width: W - 60, align: "center" });

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
    emoji: "🤖",
    codigo: "EF15CO01",
    descricao_crianca: "É como uma receita! Uma lista de passos em ordem certa para fazer algo.",
    exemplo: "Algoritmo do Sanduíche: dite os passos para um amigo montar o lanche!",
    cor: "#6C3FC5",
    corLight: "#EDE7F6",
  },
  {
    nome: "Padrões",
    emoji: "🔍",
    codigo: "EF15CO03",
    descricao_crianca: "Padrões são repetições! Quando algo segue uma regra que se repete.",
    exemplo: "Caça ao Padrão: descubra a regra escondida na sequência de cartas!",
    cor: "#00838F",
    corLight: "#E0F7FA",
  },
  {
    nome: "Decomposição",
    emoji: "🧩",
    codigo: "EF15CO02",
    descricao_crianca: "Dividir um problema grande em partes menores para resolver mais fácil!",
    exemplo: "Monte o Robô: cada grupo faz uma parte — depois montamos juntos!",
    cor: "#2E7D32",
    corLight: "#E8F5E9",
  },
  {
    nome: "Abstração",
    emoji: "🌐",
    codigo: "EF15CO04",
    descricao_crianca: "Focar só no que importa! Ignorar os detalhes que não ajudam.",
    exemplo: "Mapa Essencial: desenhe a escola usando SÓ 5 elementos essenciais!",
    cor: "#AD1457",
    corLight: "#FCE4EC",
  },
];

async function gerarPassaporte() {
  const doc = new PDFDocument({ size: "A4", margin: 0, autoFirstPage: false });
  registerFonts(doc);
  const W = 595.28, H = 841.89;
  const CX = W / 2;
  const M = 36; // margin

  // ── CAPA ──────────────────────────────────────────────────
  doc.addPage();

  // Background gradient effect (top stripe)
  doc.rect(0, 0, W, 280).fill("#1A237E");
  doc.rect(0, 280, W, H - 280).fill("#FAFAFA");

  // Wave divider (simplified — rectangle with curve illusion)
  doc.rect(0, 265, W, 30).fill("#283593");

  // Título
  doc.fillColor("#FFFFFF").font("Nunito-Bold").fontSize(11)
    .text("K I T   D E S P L U G A   P R O", M, 55, { width: W - M*2, align: "center", characterSpacing: 2 });

  doc.fillColor("#FFD740").font("Nunito-Bold").fontSize(36)
    .text("PASSAPORTE DO", M, 80, { width: W - M*2, align: "center" });
  doc.fillColor("#FFFFFF").font("Nunito-Bold").fontSize(36)
    .text("EXPLORADOR", M, 118, { width: W - M*2, align: "center" });
  doc.fillColor("#FFD740").font("Nunito-Bold").fontSize(26)
    .text("DESPLUGADO 🧭", M, 155, { width: W - M*2, align: "center" });

  // Subtitle
  doc.fillColor("#B3C0F7").font("Nunito").fontSize(10.5)
    .text("Meu registro de missões de Pensamento Computacional", M, 205, { width: W - M*2, align: "center" });

  // Caixa de dados do aluno
  const boxY = 295, boxH = 200, boxX = M + 10;
  doc.roundedRect(boxX, boxY, W - (M+10)*2, boxH, 12).fill("#FFFFFF");
  doc.roundedRect(boxX, boxY, W - (M+10)*2, boxH, 12).lineWidth(2).strokeColor("#1A237E").stroke();

  doc.fillColor("#1A237E").font("Nunito-Bold").fontSize(12)
    .text("📋  DADOS DO EXPLORADOR", boxX + 20, boxY + 18, { width: W - (M+10)*2 - 40 });

  // Foto placeholder
  const fotoX = W - M - 10 - 100, fotoY = boxY + 18;
  doc.roundedRect(fotoX, fotoY, 95, 120, 8).fill("#EEF0FF").stroke();
  doc.fillColor("#9FA8DA").font("Nunito").fontSize(9)
    .text("📸 Cole sua\nfoto aqui", fotoX, fotoY + 48, { width: 95, align: "center" });

  const fieldW = fotoX - boxX - 40;
  const fields = [
    ["Nome:", ""],
    ["Turma:", ""],
    ["Escola:", ""],
    ["Professora:", ""],
  ];
  let fy = boxY + 50;
  for (const [label] of fields) {
    doc.fillColor("#616161").font("Nunito-Bold").fontSize(10).text(label, boxX + 20, fy, { width: 80 });
    doc.moveTo(boxX + 105, fy + 12).lineTo(boxX + 105 + fieldW, fy + 12).lineWidth(0.8).strokeColor("#9FA8DA").stroke();
    fy += 32;
  }

  // Progresso das missões
  const progY = boxY + boxH + 20;
  doc.fillColor("#1A237E").font("Nunito-Bold").fontSize(13)
    .text("⭐ Minhas Missões", M, progY, { width: W - M*2, align: "center" });

  const missions = ["Algoritmos 🤖", "Padrões 🔍", "Decomposição 🧩", "Abstração 🌐"];
  const cols = 2, mW = (W - M*2 - 20) / cols;
  for (let i = 0; i < missions.length; i++) {
    const mx = M + (i % cols) * (mW + 20);
    const my = progY + 30 + Math.floor(i / cols) * 50;
    doc.roundedRect(mx, my, mW, 38, 6).fill(i < 2 ? "#E8EAF6" : "#F3E5F5");
    doc.fillColor("#1A237E").font("Nunito-Bold").fontSize(10).text(missions[i], mx + 8, my + 6, { width: mW - 16 });
    doc.fillColor("#9E9E9E").font("Nunito").fontSize(8).text("Missões concluídas: ___ / 5", mx + 8, my + 22, { width: mW - 16 });
  }

  // Rodapé
  doc.fillColor("#9E9E9E").font("Nunito").fontSize(8)
    .text("Kit Despluga Pro • Pensamento Computacional Desplugado • BNCC 2022", M, H - 30, { width: W - M*2, align: "center" });

  // ── PÁGINAS DE HABILIDADE (4 páginas) ─────────────────────
  for (const skill of PASSPORT_SKILLS) {
    doc.addPage();

    // Header colorido
    doc.rect(0, 0, W, 130).fill(skill.cor);
    doc.fillColor("#FFFFFF").font("Nunito").fontSize(10)
      .text(`HABILIDADE BNCC: ${skill.codigo}`, M, 20, { width: W - M*2, characterSpacing: 1 });
    doc.fillColor("#FFFFFF").font("Nunito-Bold").fontSize(34)
      .text(`${skill.emoji}  ${skill.nome}`, M, 45, { width: W - M*2 });
    doc.fillColor(skill.corLight).font("Lora").fontSize(11)
      .text(skill.descricao_crianca, M, 95, { width: W - M*2 });

    // Exemplo de atividade
    const exY = 150;
    doc.roundedRect(M, exY, W - M*2, 50, 8).fill(skill.corLight);
    doc.fillColor(skill.cor).font("Nunito-Bold").fontSize(10)
      .text("💡 ATIVIDADE DE EXEMPLO:", M + 12, exY + 10, { width: W - M*2 - 24 });
    doc.fillColor("#424242").font("Nunito").fontSize(10)
      .text(skill.exemplo, M + 12, exY + 26, { width: W - M*2 - 24 });

    // Stamps de missões completadas
    const stampY = 220;
    doc.fillColor(skill.cor).font("Nunito-Bold").fontSize(13)
      .text("🏅 MISSÕES CONCLUÍDAS — Cole seu carimbo ou desenhe uma estrela!", M, stampY, { width: W - M*2 });

    const stampsPerRow = 5, stampSize = 70, stampGap = 18;
    const totalW = stampsPerRow * stampSize + (stampsPerRow - 1) * stampGap;
    const startX = (W - totalW) / 2;
    for (let s = 0; s < stampsPerRow; s++) {
      const sx = startX + s * (stampSize + stampGap);
      const sy = stampY + 28;
      doc.roundedRect(sx, sy, stampSize, stampSize, 10).fill(skill.corLight).stroke();
      doc.roundedRect(sx, sy, stampSize, stampSize, 10).lineWidth(1.5).strokeColor(skill.cor).stroke();
      doc.fillColor(skill.cor).font("Nunito-Bold").fontSize(8)
        .text(`Missão ${s + 1}`, sx, sy + stampSize - 16, { width: stampSize, align: "center" });
    }

    // Seção "O que aprendi"
    const learnY = 330;
    doc.fillColor(skill.cor).font("Nunito-Bold").fontSize(12)
      .text("✏️ O QUE EU APRENDI:", M, learnY, { width: W - M*2 });
    doc.moveTo(M, learnY + 28).lineTo(W - M, learnY + 28).lineWidth(0.6).strokeColor("#BDBDBD").stroke();
    doc.moveTo(M, learnY + 58).lineTo(W - M, learnY + 58).lineWidth(0.6).strokeColor("#BDBDBD").stroke();
    doc.moveTo(M, learnY + 88).lineTo(W - M, learnY + 88).lineWidth(0.6).strokeColor("#BDBDBD").stroke();

    // Mini espaço para desenhar
    const drawY = learnY + 110;
    doc.fillColor(skill.cor).font("Nunito-Bold").fontSize(12)
      .text("🎨 MINHA ILUSTRAÇÃO DA ATIVIDADE:", M, drawY, { width: W - M*2 });
    const drawBoxH = 220;
    doc.roundedRect(M, drawY + 22, W - M*2, drawBoxH, 8).fill(skill.corLight);
    doc.roundedRect(M, drawY + 22, W - M*2, drawBoxH, 8).lineWidth(1).strokeColor(skill.cor).stroke();
    doc.fillColor(skill.cor).font("Nunito").fontSize(10).opacity(0.4)
      .text("Desenhe aqui o que você fez na atividade 😊", M, drawY + 22 + drawBoxH/2 - 10, { width: W - M*2, align: "center" });
    doc.opacity(1);

    // Page footer
    doc.fillColor("#9E9E9E").font("Nunito").fontSize(8)
      .text(`Kit Despluga Pro • ${skill.nome} • ${skill.codigo}`, M, H - 30, { width: W - M*2, align: "center" });
  }

  // ── PÁGINA MINHAS CONQUISTAS ───────────────────────────────
  doc.addPage();
  doc.rect(0, 0, W, 80).fill("#37474F");
  doc.fillColor("#FFFFFF").font("Nunito-Bold").fontSize(28)
    .text("🏆 MINHAS CONQUISTAS", M, 25, { width: W - M*2, align: "center" });

  const congY = 100;
  doc.fillColor("#37474F").font("Nunito-Bold").fontSize(11)
    .text("Cole aqui seus certificados, adesivos ou escreva suas conquistas:", M, congY, { width: W - M*2 });

  // 6 caixas para conquistas
  const cols2 = 2, rows2 = 3, cW = (W - M*2 - 20) / cols2, cH = 120;
  for (let i = 0; i < cols2 * rows2; i++) {
    const cx = M + (i % cols2) * (cW + 20);
    const cy = congY + 28 + Math.floor(i / cols2) * (cH + 12);
    doc.roundedRect(cx, cy, cW, cH, 8).fill("#ECEFF1").stroke();
    doc.fillColor("#B0BEC5").font("Nunito").fontSize(9)
      .text(`Conquista ${i + 1}`, cx + 8, cy + cH - 20, { width: cW - 16 });
  }
  doc.fillColor("#9E9E9E").font("Nunito").fontSize(8)
    .text("Kit Despluga Pro • Pensamento Computacional Desplugado", M, H - 30, { width: W - M*2, align: "center" });

  // ── PÁGINA ATIVIDADE FAVORITA ──────────────────────────────
  doc.addPage();
  doc.rect(0, 0, W, 80).fill("#F57F17");
  doc.fillColor("#FFFFFF").font("Nunito-Bold").fontSize(26)
    .text("⭐ MINHA ATIVIDADE FAVORITA", M, 27, { width: W - M*2, align: "center" });

  doc.fillColor("#F57F17").font("Nunito-Bold").fontSize(12)
    .text("Qual atividade você mais gostou? Escreva e desenhe aqui:", M, 100, { width: W - M*2 });

  const favFields = ["Nome da atividade:", "Por que eu gostei:", "O que aprendi:"];
  let ffY = 125;
  for (const f of favFields) {
    doc.fillColor("#424242").font("Nunito-Bold").fontSize(10).text(f, M, ffY, { width: 180 });
    doc.moveTo(M + 185, ffY + 11).lineTo(W - M, ffY + 11).lineWidth(0.8).strokeColor("#FFB300").stroke();
    ffY += 35;
  }

  // Espaço para desenho
  doc.fillColor("#F57F17").font("Nunito-Bold").fontSize(12)
    .text("🎨 DESENHO DA MINHA ATIVIDADE FAVORITA:", M, ffY + 10, { width: W - M*2 });
  const favDrawH = 340;
  doc.roundedRect(M, ffY + 32, W - M*2, favDrawH, 8).fill("#FFF8E1");
  doc.roundedRect(M, ffY + 32, W - M*2, favDrawH, 8).lineWidth(1.5).strokeColor("#FFB300").stroke();

  doc.fillColor("#FFB300").font("Nunito").fontSize(11).opacity(0.5)
    .text("✏️ Solte a criatividade!", M, ffY + 32 + favDrawH/2 - 10, { width: W - M*2, align: "center" });
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
  // Header
  doc.rect(0, 0, W, 70).fill("#1565C0");
  doc.fillColor("#FFFFFF").font("Nunito-Bold").fontSize(8)
    .text("KIT DESPLUGA PRO — FICHAS DE ACOMPANHAMENTO", M, 14, { width: CW, characterSpacing: 1 });
  doc.fillColor("#FFFFFF").font("Nunito-Bold").fontSize(20)
    .text("📋 Ficha 1 — Registro de Turma", M, 34, { width: CW });

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
    { label: "Nº", w: 28 },
    { label: "Nome do Aluno", w: 165 },
    { label: "Participou?", w: 65 },
    { label: "Concluiu a Atividade?", w: 95 },
    { label: "Dificuldade", w: 65 },
    { label: "Conceito\n(A/B/C)", w: 48 },
    { label: "Observações", w: 57 },
  ];
  const totalColW = cols.reduce((s, c) => s + c.w, 0);
  const rowH = 20, headerH = 28, nRows = 25;

  // Header da tabela
  let cx = M;
  doc.rect(M, y, totalColW, headerH).fill("#1565C0");
  for (const col of cols) {
    doc.fillColor("#FFFFFF").font("Nunito-Bold").fontSize(7.5)
      .text(col.label, cx + 3, y + (col.label.includes("\n") ? 5 : 9), { width: col.w - 6, align: "center" });
    cx += col.w;
  }

  // Rows
  for (let r = 0; r < nRows; r++) {
    const ry = y + headerH + r * rowH;
    const bg = r % 2 === 0 ? "#EEF5FB" : "#FFFFFF";
    doc.rect(M, ry, totalColW, rowH).fill(bg);
    // Row lines
    doc.rect(M, ry, totalColW, rowH).lineWidth(0.3).strokeColor("#BBDEFB").stroke();

    // Número da linha
    doc.fillColor("#616161").font("Nunito").fontSize(8)
      .text(String(r + 1), M, ry + 6, { width: cols[0].w, align: "center" });

    // Checkboxes em "Participou" e "Concluiu"
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
  }

  // Rodapé
  const footY = y + headerH + nRows * rowH + 10;
  doc.fillColor("#9E9E9E").font("Nunito").fontSize(8)
    .text("A = Avançado  •  B = Em Desenvolvimento  •  C = Iniciando  |  Kit Despluga Pro — Fichas de Acompanhamento", M, footY, { width: CW, align: "center" });

  // ── FICHA 2: ACOMPANHAMENTO SEMANAL ────────────────────────
  doc.addPage();
  doc.rect(0, 0, W, 70).fill("#2E7D32");
  doc.fillColor("#FFFFFF").font("Nunito-Bold").fontSize(8)
    .text("KIT DESPLUGA PRO — FICHAS DE ACOMPANHAMENTO", M, 14, { width: CW, characterSpacing: 1 });
  doc.fillColor("#FFFFFF").font("Nunito-Bold").fontSize(20)
    .text("📅 Ficha 2 — Planner Semanal de Atividades", M, 34, { width: CW });

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
  const sectionFields = ["Turma(s):", "Atividade\nUsada:", "Habilidade\nBNCC:", "Tempo:", "Materiais:", "Observações:"];
  const sectionH = 22 * sectionFields.length + 10;

  // Day headers
  for (let d = 0; d < days.length; d++) {
    const dx = M + d * dayW;
    doc.rect(dx, y, dayW - 3, 22).fill("#2E7D32");
    doc.fillColor("#FFFFFF").font("Nunito-Bold").fontSize(10)
      .text(days[d], dx, y + 5, { width: dayW - 3, align: "center" });
  }
  y += 22;

  for (let d = 0; d < days.length; d++) {
    const dx = M + d * dayW;
    doc.rect(dx, y, dayW - 3, sectionH).fill(d % 2 === 0 ? "#E8F5E9" : "#F1F8E9");
    doc.rect(dx, y, dayW - 3, sectionH).lineWidth(0.4).strokeColor("#A5D6A7").stroke();

    let fy2 = y + 6;
    for (const field of sectionFields) {
      doc.fillColor("#388E3C").font("Nunito-Bold").fontSize(7)
        .text(field, dx + 4, fy2, { width: dayW - 10, lineGap: 0 });
      const fh = field.includes("\n") ? 24 : 12;
      doc.moveTo(dx + 4, fy2 + fh).lineTo(dx + dayW - 8, fy2 + fh).lineWidth(0.4).strokeColor("#C8E6C9").stroke();
      fy2 += 22;
    }
  }

  y += sectionH + 14;

  // Meta da semana
  doc.fillColor("#2E7D32").font("Nunito-Bold").fontSize(12)
    .text("🎯 Meta da Semana", M, y, { width: CW });
  y += 18;
  doc.moveTo(M, y).lineTo(W - M, y).lineWidth(0.7).strokeColor("#A5D6A7").stroke(); y += 22;
  doc.moveTo(M, y).lineTo(W - M, y).lineWidth(0.7).strokeColor("#A5D6A7").stroke(); y += 22;

  doc.fillColor("#2E7D32").font("Nunito-Bold").fontSize(12)
    .text("📝 Reflexão da Semana", M, y + 4, { width: CW });
  y += 26;
  for (let i = 0; i < 4; i++) {
    doc.moveTo(M, y).lineTo(W - M, y).lineWidth(0.7).strokeColor("#A5D6A7").stroke();
    y += 22;
  }

  doc.fillColor("#9E9E9E").font("Nunito").fontSize(8)
    .text("Kit Despluga Pro — Fichas de Acompanhamento | Resolução BNCC CNE/CP nº 2/2022", M, H - 30, { width: CW, align: "center" });

  // ── FICHA 3: AVALIAÇÃO INDIVIDUAL DO ALUNO ─────────────────
  doc.addPage();
  doc.rect(0, 0, W, 70).fill("#6A1B9A");
  doc.fillColor("#FFFFFF").font("Nunito-Bold").fontSize(8)
    .text("KIT DESPLUGA PRO — FICHAS DE ACOMPANHAMENTO", M, 14, { width: CW, characterSpacing: 1 });
  doc.fillColor("#FFFFFF").font("Nunito-Bold").fontSize(20)
    .text("👤 Ficha 3 — Avaliação Individual do Aluno", M, 34, { width: CW });

  y = 85;
  // Dados do aluno
  const alunoFields = [
    ["Nome do Aluno:", 250], ["Turma:", 100], ["Data:", 120],
  ];
  ix = M;
  for (const [label, fw] of alunoFields) {
    doc.fillColor("#424242").font("Nunito-Bold").fontSize(9).text(label, ix, y, { width: 110 });
    doc.moveTo(ix + 112, y + 11).lineTo(ix + fw, y + 11).lineWidth(0.7).strokeColor("#CE93D8").stroke();
    ix += fw + 10;
  }

  y += 26;
  doc.fillColor("#6A1B9A").font("Nunito-Bold").fontSize(12)
    .text("🧠 Habilidades de Pensamento Computacional", M, y);
  y += 18;

  const habilidades = [
    ["EF15CO01", "Algoritmos", "Cria sequências ordenadas de passos para resolver problemas"],
    ["EF15CO02", "Decomposição", "Divide problemas grandes em partes menores"],
    ["EF15CO03", "Padrões", "Identifica regularidades e sequências"],
    ["EF15CO04", "Abstração", "Foca nos aspectos essenciais, ignora detalhes desnecessários"],
    ["EF15CO05", "Automação", "Compreende como instruções repetidas realizam tarefas"],
  ];

  // Header tabela
  const hCols = [55, 90, 220, 50, 50, 50];
  const hLabels = ["Código", "Habilidade", "Descrição", "Iniciando", "Desenvolvendo", "Avançado"];
  cx = M;
  doc.rect(M, y, hCols.reduce((s, c) => s + c, 0), 22).fill("#6A1B9A");
  for (let k = 0; k < hLabels.length; k++) {
    doc.fillColor("#FFFFFF").font("Nunito-Bold").fontSize(7.5)
      .text(hLabels[k], cx + 3, y + 7, { width: hCols[k] - 6, align: "center" });
    cx += hCols[k];
  }
  y += 22;

  for (let h = 0; h < habilidades.length; h++) {
    const [cod, nome, desc] = habilidades[h];
    const bg = h % 2 === 0 ? "#F3E5F5" : "#FFFFFF";
    const hRow = 28;
    doc.rect(M, y, hCols.reduce((s, c) => s + c, 0), hRow).fill(bg);
    cx = M;
    const rowData = [cod, nome, desc];
    for (let k = 0; k < rowData.length; k++) {
      doc.fillColor("#424242").font(k < 2 ? "Nunito-Bold" : "Nunito").fontSize(8)
        .text(rowData[k], cx + 3, y + (k < 2 ? 9 : 5), { width: hCols[k] - 6, align: k === 0 ? "center" : "left", lineGap: 1 });
      cx += hCols[k];
    }
    // Checkboxes para níveis
    for (let n = 0; n < 3; n++) {
      const bSize = 12, bx = cx + (hCols[3 + n] - bSize) / 2, by = y + (hRow - bSize) / 2;
      doc.roundedRect(bx, by, bSize, bSize, 2).lineWidth(0.7).strokeColor("#9C27B0").stroke();
      cx += hCols[3 + n];
    }
    doc.rect(M, y, hCols.reduce((s, c) => s + c, 0), hRow).lineWidth(0.3).strokeColor("#CE93D8").stroke();
    y += hRow;
  }

  y += 14;
  // Comportamento em grupo
  doc.fillColor("#6A1B9A").font("Nunito-Bold").fontSize(12).text("👥 Comportamento e Participação em Grupo", M, y);
  y += 18;
  const compItems = ["Participa ativamente das atividades", "Colabora com os colegas", "Respeita as regras da dinâmica", "Demonstra autonomia na resolução"];
  for (const item of compItems) {
    const bx = M, by = y + 2, bSize = 11;
    doc.roundedRect(bx, by, bSize, bSize, 2).lineWidth(0.7).strokeColor("#9C27B0").stroke();
    doc.fillColor("#424242").font("Nunito").fontSize(9).text(item, M + 18, y + 1, { width: 280 });

    // Mini rating
    for (let s = 0; s < 5; s++) {
      doc.fillColor(s < 3 ? "#FFD740" : "#E0E0E0").circle(M + 330 + s * 20, y + 7, 7).fill();
    }
    doc.fillColor("#9E9E9E").font("Nunito").fontSize(7).text("(preencher)", M + 435, y + 3, { width: 80 });
    y += 22;
  }

  y += 10;
  doc.fillColor("#6A1B9A").font("Nunito-Bold").fontSize(12).text("📝 Observações e Próximos Passos:", M, y);
  y += 18;
  for (let i = 0; i < 4; i++) {
    doc.moveTo(M, y).lineTo(W - M, y).lineWidth(0.6).strokeColor("#CE93D8").stroke();
    y += 22;
  }

  doc.fillColor("#9E9E9E").font("Nunito").fontSize(8)
    .text("Kit Despluga Pro — Fichas de Acompanhamento | Resolução BNCC CNE/CP nº 2/2022", M, H - 30, { width: CW, align: "center" });

  // ── FICHA 4: RELATÓRIO MENSAL ──────────────────────────────
  doc.addPage();
  doc.rect(0, 0, W, 70).fill("#E65100");
  doc.fillColor("#FFFFFF").font("Nunito-Bold").fontSize(8)
    .text("KIT DESPLUGA PRO — FICHAS DE ACOMPANHAMENTO", M, 14, { width: CW, characterSpacing: 1 });
  doc.fillColor("#FFFFFF").font("Nunito-Bold").fontSize(20)
    .text("📊 Ficha 4 — Relatório Mensal Simplificado", M, 34, { width: CW });

  y = 85;
  doc.fillColor("#424242").font("Nunito-Bold").fontSize(9).text("Mês/Ano:", M, y);
  doc.moveTo(M + 60, y + 11).lineTo(M + 180, y + 11).lineWidth(0.7).strokeColor("#FFAB91").stroke();
  doc.fillColor("#424242").font("Nunito-Bold").fontSize(9).text("Professora:", M + 200, y);
  doc.moveTo(M + 264, y + 11).lineTo(W - M, y + 11).lineWidth(0.7).strokeColor("#FFAB91").stroke();

  y += 24;

  // Cards de resumo
  const cards = [
    { label: "Total de Atividades Realizadas", icon: "📚", color: "#E65100" },
    { label: "Habilidades BNCC Trabalhadas", icon: "🎯", color: "#1565C0" },
    { label: "Turmas Atendidas", icon: "👥", color: "#2E7D32" },
    { label: "% da Turma com Conceito A", icon: "⭐", color: "#6A1B9A" },
  ];
  const cardW = (CW - 15) / 2, cardH = 55;
  for (let c = 0; c < cards.length; c++) {
    const card = cards[c];
    const cx2 = M + (c % 2) * (cardW + 15);
    const cy2 = y + Math.floor(c / 2) * (cardH + 12);
    doc.roundedRect(cx2, cy2, cardW, cardH, 8).fill("#FFF3E0");
    doc.rect(cx2, cy2, 5, cardH).fill(card.color);
    doc.fillColor("#424242").font("Nunito-Bold").fontSize(9).text(`${card.icon}  ${card.label}`, cx2 + 14, cy2 + 8, { width: cardW - 24 });
    doc.moveTo(cx2 + 14, cy2 + 32).lineTo(cx2 + cardW - 14, cy2 + 32).lineWidth(1).strokeColor(card.color).stroke();
    doc.fillColor("#9E9E9E").font("Nunito").fontSize(8).text("Preencher:", cx2 + 14, cy2 + 36, { width: cardW - 24 });
  }

  y += 2 * (cardH + 12) + 14;

  // Habilidades BNCC trabalhadas
  doc.fillColor("#E65100").font("Nunito-Bold").fontSize(12).text("✅ Quais Habilidades BNCC foram trabalhadas neste mês?", M, y);
  y += 18;
  const bnccItems = ["EF15CO01 — Algoritmos", "EF15CO02 — Decomposição", "EF15CO03 — Padrões", "EF15CO04 — Abstração", "EF15CO05 — Automação"];
  const bncCols = 3, bncW = CW / bncCols;
  for (let b = 0; b < bnccItems.length; b++) {
    const bx2 = M + (b % bncCols) * bncW;
    const by2 = y + Math.floor(b / bncCols) * 22;
    doc.roundedRect(bx2, by2 + 2, 12, 12, 2).lineWidth(0.8).strokeColor("#FF8A65").stroke();
    doc.fillColor("#424242").font("Nunito").fontSize(9).text(bnccItems[b], bx2 + 18, by2 + 4, { width: bncW - 20 });
  }
  y += Math.ceil(bnccItems.length / bncCols) * 22 + 12;

  // Destaques e dificuldades
  doc.fillColor("#E65100").font("Nunito-Bold").fontSize(12).text("🌟 Destaques do Mês", M, y); y += 18;
  for (let i = 0; i < 3; i++) { doc.moveTo(M, y).lineTo(W - M, y).lineWidth(0.6).strokeColor("#FFAB91").stroke(); y += 22; }

  y += 4;
  doc.fillColor("#E65100").font("Nunito-Bold").fontSize(12).text("⚠️ Dificuldades Observadas", M, y); y += 18;
  for (let i = 0; i < 3; i++) { doc.moveTo(M, y).lineTo(W - M, y).lineWidth(0.6).strokeColor("#FFAB91").stroke(); y += 22; }

  y += 4;
  doc.fillColor("#E65100").font("Nunito-Bold").fontSize(12).text("📌 Planejamento do Próximo Mês", M, y); y += 18;
  for (let i = 0; i < 3; i++) { doc.moveTo(M, y).lineTo(W - M, y).lineWidth(0.6).strokeColor("#FFAB91").stroke(); y += 22; }

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

// ── Exports ────────────────────────────────────────────────
module.exports = { gerarCertificados, gerarPassaporte, gerarFichas };
