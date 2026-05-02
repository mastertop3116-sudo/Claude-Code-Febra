# Nexus Digital Holding — Plano Estratégico
**Data:** 2026-05-02  
**Produto:** Nexus MAX — Plataforma de criação de infoprodutos digitais  
**Objetivo:** Valuation US$1B em infoprodutos low-ticket no Brasil

---

## PARTE 1 — CONSELHO DE TITÃS

### Elon Musk — First Principles & Velocidade

> "O que você mudaria primeiro nessa plataforma?"

**Análise:** A plataforma tem muito potencial mas está travada em fricção desnecessária. Existem 4 abas (DNA, Informações Básicas, Tema, Cabeçalho/Rodapé) antes do usuário conseguir gerar qualquer coisa. Isso viola first principles: o usuário quer ver resultado, não preencher formulários.

**O que eu faria primeiro:**
1. Implementar geração com 1 campo — título do produto. O resto é completado pela IA e editado depois.
2. Criar um "Modo Turbo": usuário digita o título, clica gerar, recebe o PDF em 30 segundos com defaults inteligentes. Configurações avançadas ficam ocultas por padrão.
3. Construir um loop viral nativo: ao baixar o PDF, o usuário vê "Compartilhe e ganhe 3 créditos". A distribuição orgânica é o melhor canal de aquisição para mercado brasileiro.
4. Eliminar qualquer etapa que não seja absolutamente necessária para a primeira geração.

**Princípio:** Se você pode descrever o fluxo em mais de 3 passos, está errado.

---

### Jeff Bezos — CAC/LTV, Dados e Obsessão pelo Cliente

> "O que você mudaria primeiro nessa plataforma?"

**Análise:** Não existe nenhum mecanismo de coleta de dados comportamentais. Não sabemos quais tipos de entregáveis têm maior taxa de conclusão, quais nichos geram mais retorno, quais etapas causam abandono. Sem dados, estamos navegando às cegas.

**O que eu faria primeiro:**
1. Instrumentar cada ação do usuário: qual tipo escolheu, qual tema, quanto tempo demorou, se baixou o PDF ou só gerou. Isso revela o funil de valor real.
2. Criar um sistema de créditos/assinatura com dados de uso: entender o LTV real de cada segmento de usuário.
3. Implementar NPS pós-geração: "Você venderia esse produto?" — essa pergunta revela intenção de compra e qualidade percebida.
4. Construir um dashboard de produto (não de métricas de vaidade): taxa de uso por feature, tempo médio até primeiro download, taxa de retorno.

**Princípio:** Dados são a vantagem competitiva. Cada interação que não é medida é uma oportunidade desperdiçada.

---

### Luciano Hang — Branding de Massa e Vendas para o Brasileiro

> "O que você mudaria primeiro nessa plataforma?"

**Análise:** A interface está muito técnica demais para o mercado de massa brasileiro. O nome "Nexus MAX", os termos em inglês (DNA, VSL, Workbook), o design escuro com terminal code — isso gera exclusão psicológica na maioria do público-alvo. O infoprodutor brasileiro não se sente representado.

**O que eu faria primeiro:**
1. Criar uma versão do copy 100% em português popular: "Crie seu ebook agora" ao invés de jargões técnicos. "Vender mais" ao invés de "LTV". 
2. Adicionar depoimentos reais de criadores brasileiros logo na tela inicial — prova social imediata.
3. Lançar uma campanha com influenciadores de nicho (fitness, finanças, espiritualidade) mostrando o produto sendo usado em tempo real no TikTok/Instagram.
4. Simplificar a proposta para uma frase: "Em 2 minutos você tem um ebook pronto para vender."
5. Criar preço âncora visível: mostrar o custo de um designer e comparar com o preço da plataforma.

**Princípio:** O Brasil compra quando confia, e confia quando vê alguém como ele usando e aprovando.

---

### Paulo Vieira — DISC, Persuasão e Transformação

> "O que você mudaria primeiro nessa plataforma?"

**Análise:** A plataforma trata todos os usuários da mesma forma. Não existe personalização da jornada baseada no perfil psicológico ou nível de maturidade do criador. Um iniciante com perfil S (estabilidade) precisa de uma experiência completamente diferente de um D (dominância) experiente.

**O que eu faria primeiro:**
1. Criar um onboarding de 3 perguntas para identificar o perfil do criador: "Você já vendeu algum infoproduto?", "Qual é seu nicho?", "O que te trava hoje?" — e personalizar a experiência com base nisso.
2. Adicionar uma camada de transformação: não mostrar apenas "Gerar PDF" mas "Esse é o primeiro passo para você ter sua própria fonte de renda digital." A venda é emocional antes de ser racional.
3. Implementar microconquistas: após cada etapa concluída, mostrar uma mensagem de progresso. "Ótimo! Você já está a 60% do seu primeiro produto."
4. Criar uma "Jornada do Criador": do primeiro ebook ao primeiro R$1.000 — gamificação da progressão do usuário.

**Princípio:** Pessoas não compram ferramentas, elas compram a versão delas mesmas que usa a ferramenta com maestria.

---

## PARTE 2 — 5 IDEIAS CONCRETAS PARA CRIAR.HTML

### Ideia 1: Modo Express (1-Click Generation)

**Problema que resolve:** Atualmente o usuário precisa preencher ~12 campos antes de gerar. Isso mata a conversão de novos usuários que querem ver o produto funcionando primeiro.

**Como implementar:**
- Adicionar botão "Gerar agora com IA" logo abaixo do campo de título (seção 01)
- Ao clicar com apenas o título preenchido, os demais campos são preenchidos com defaults inteligentes baseados no nicho detectado pelo título
- Criar endpoint `/api/criar/express` que usa um prompt simplificado
- Mostrar um modal "Express vs Completo" explicando as diferenças
- Após gerar no modo express, oferecer "Personalizar" que abre o formulário completo com os valores já preenchidos

**Impacto esperado:** Redução de 70% no tempo até primeira geração. Aumento de 40% na taxa de conversão do primeiro uso.

---

### Ideia 2: Galeria de Templates com Preview Real

**Problema que resolve:** O seletor de temas atual mostra previews de 96px com texto genérico "Título". O usuário não consegue visualizar como ficará seu conteúdo real no PDF antes de gerar.

**Como implementar:**
- Substituir o grid de temas por um modal "Escolher estilo" com previews em 300px de largura
- Usar o título e subtítulo já digitados para renderizar o preview via API (`/api/preview-capa`)
- Adicionar thumbnails de páginas internas (ex: seção de capítulo, callout box) para cada tema
- Implementar lazy loading dos previews com skeleton loading
- Adicionar filtros: "Mais vendidos", "Para emagrecimento", "Para finanças"

**Impacto esperado:** Redução de 35% no abandono após escolha de tema. Aumento de satisfação percebida com o resultado final.

---

### Ideia 3: Assistente de Título com IA (live)

**Problema que resolve:** Muitos usuários travam no campo "Título do entregável" — é o campo mais importante e o que mais gera insegurança. Os chips atuais são genéricos ("O Guia Definitivo de…").

**Como implementar:**
- Quando o usuário preenche "Nicho" e "Público-alvo" no DNA, acionar automaticamente uma chamada à API Gemini (debounced 1.5s)
- Retornar 5 sugestões de título específicas para aquele nicho+público
- Mostrar os títulos em uma lista suspensa abaixo do campo com animação de entrada
- Cada sugestão exibe uma badge de "Score de conversão" (calculado por fórmulas simples de copywriting: número ímpar, promessa de resultado, urgência)
- Ao clicar, preenche o campo e dispara o syncDNA()

**Impacto esperado:** Redução de 60% no tempo de preenchimento do título. Qualidade do conteúdo gerado aumenta porque o título é mais específico.

---

### Ideia 4: Histórico e Biblioteca de Entregáveis

**Problema que resolve:** Cada geração começa do zero. Não existe biblioteca de entregáveis gerados, impossibilitando reaproveitamento, comparação de versões ou criação de séries.

**Como implementar:**
- Criar tabela `entregaveis` no Supabase: `id, produto_id, tipo, titulo, tema, formato, pdf_url, docx_url, created_at`
- Ao finalizar a geração, salvar automaticamente os metadados (sem o binário do PDF — apenas referência ou base64 pequeno da capa)
- Criar painel `/historico` ou modal "Meus entregáveis" acessível pelo nav (que hoje mostra toast "em breve")
- Mostrar capa em miniatura, tipo, data e botões "Baixar" e "Duplicar e editar"
- O botão "Duplicar e editar" preenche o formulário com todos os dados da geração anterior

**Impacto esperado:** Aumenta a retenção (usuários voltam para reeditar). Cria uma percepção de valor acumulado ("minha biblioteca").

---

### Ideia 5: Score de Qualidade do Produto (Product Score)

**Problema que resolve:** O usuário não sabe se o que está preenchendo vai gerar um produto bom ou ruim. Não há feedback durante o preenchimento — só ao final após 90+ segundos.

**Como implementar:**
- Criar um widget lateral (acima do botão "Gerar") com um score de 0-100 que atualiza em tempo real
- Critérios calculados no front-end sem chamada de API:
  - Título tem mais de 5 palavras? +15
  - Subtítulo preenchido? +10
  - Avatar preenchido com mais de 30 chars? +20
  - DNA preenchido (nicho + público)? +15
  - Número de páginas entre 10-30? +10
  - Tema selecionado (não default)? +10
  - Fonte personalizada? +10
  - Imagem de capa? +10
- Exibir badge colorida: Básico (0-40, vermelho), Bom (41-70, amarelo), Premium (71-100, verde)
- Mensagem contextual explicando o que falta: "Adicionar o avatar aumenta muito a qualidade do conteúdo"

**Impacto esperado:** Aumento de 45% no preenchimento do campo Avatar (hoje subutilizado). Melhora a qualidade média do conteúdo gerado. Reduz rejeições e pedidos de regerar.

---

## PARTE 3 — AUDITORIA UX — PROBLEMAS ENCONTRADOS

### Críticos (bloqueiam fluxo ou causam perda de dados)

**UX-001: Botão "Cancelar e tentar novamente" não cancela de verdade**
- Localização: `#btn-cancelar` na overlay de progresso (linha ~1561)
- Problema: O botão fecha o overlay mas não cancela o job no servidor (EventSource ainda ativo). A requisição SSE continua rodando. Se o usuário clica em "Gerar" novamente, há dois EventSources concorrentes.
- Solução: Armazenar referência ao EventSource em variável global e chamar `.close()` no cancelamento.

**UX-002: restoreRascunho usa seletores inexistentes**
- Localização: função `restoreRascunho()` linhas ~2551-2560
- Problema: O código tenta fazer `document.querySelector('.type-card[data-type]')`, `.theme-card[data-theme]` e `.fmt-card[data-fmt]` — classes que não existem no HTML (os elementos reais têm `.theme[data-v]`, `.fmt[data-v]`). O tipo, tema e formato nunca são restaurados do localStorage.
- Solução: Corrigir os seletores para `.theme[data-v="${data._tema}"]` e equivalentes.

**UX-003: Modo Conversor não tem tratamento de erro visual**
- Localização: seção conversor (linha ~1122)
- Problema: Se o upload falhar ou o servidor retornar erro na conversão, o `.conv-status-msg` pode ficar com mensagem antiga. Não há estado de erro distinto do estado de sucesso — ambos usam texto simples.
- Solução: Adicionar classe `.error` ao container com cor vermelha e ícone de erro.

**UX-004: Overlay de sucesso não limpa estado ao fechar e reabrir**
- Localização: função `showSuccess()` e `resetForm()`
- Problema: `resetForm()` remove a overlay mas não reseta `_pdfDoc` nem o canvas do preview. Se o usuário gerar outro produto, o canvas antigo pode aparecer brevemente antes do novo.
- Solução: No início de `showSuccess()`, já resetar canvas e `_pdfDoc = null`.

---

### Altos (degradam experiência significativamente)

**UX-005: Carousel progress overlay menciona "OpenAI GPT-4o Mini"**
- Localização: linha 1595 — `<div class="ov-sub">OpenAI GPT-4o Mini criando o conteúdo…`
- Problema: Inconsistência de branding grave. O projeto usa Gemini (memory: `feedback_gemini_pro_instability.md`). Mencionar OpenAI confunde o usuário e expõe stack tecnológico incorreto.
- Solução: Alterar para "Gemini criando o conteúdo · Satori renderizando os slides."

**UX-006: Temas compartilhados entre Infoproduto e Carrossel causam estado inconsistente**
- Localização: event listeners `.theme` e `.theme[data-car-theme]`
- Problema: Há dois grids de temas (`#themes` para ebook e `#themes-car` para carrossel) mas o listener de click em `.theme` seleciona todos — ao trocar de aba, o tema ativo pode não corresponder ao modo atual.
- Solução: Separar os listeners por contexto usando os atributos `data-showon` ou filtrar pelo modo atual.

**UX-007: Botão "Gerar" permanece habilitado durante modo Conversor**
- Localização: modo-tabs switching, linha ~2775
- Problema: Quando o usuário entra no modo "Conversor", o botão "Gerar Infoproduto" da sidebar deveria ficar oculto ou disabled — mas o código apenas omite a lógica para esse modo (`else if (currentMode === 'conv') { // apenas limpa o estado }`). O botão fica visível e funcional, podendo disparar geração de infoproduto acidentalmente.
- Solução: Adicionar `btnGerar.style.display = currentMode === 'conv' ? 'none' : ''` na lógica de troca.

**UX-008: Campo "Nº de páginas" aceita valores absurdos**
- Localização: `#inp-paginas` — `min="1" max="80"` no HTML mas sem validação no JS
- Problema: O HTML limita a 80, mas se digitado manualmente aceita valores como 0 ou 500. O servidor pode travar tentando gerar 500 páginas.
- Solução: Adicionar validação no handler do botão Gerar, clamping `Math.min(80, Math.max(1, paginas))`.

**UX-009: Chips de sugestão duplicam contexto com campos do DNA**
- Localização: seções 01 (campos inp-titulo, inp-descricao, inp-avatar) e DNA
- Problema: O campo "Nicho" existe tanto no DNA (`#dna-nicho`) quanto nas Informações Básicas (`#inp-descricao`). O usuário precisa preencher o mesmo dado duas vezes, mesmo que o `syncDNA()` tente sincronizar (só funciona se o campo destino estiver vazio).
- Solução: Ocultar o campo `#inp-descricao` quando `#dna-nicho` estiver preenchido, ou fundir visualmente as duas seções.

**UX-010: Preview de capa não atualiza ao trocar tema no carrossel**
- Localização: `.theme[data-car-theme]` não chama `updatePreviewColors()`
- Problema: Os temas do carrossel só atualizam `updateSlidePreviewColors()` mas não sincronizam o `selectedTheme` corretamente — o tema selecionado na parte de carrossel pode não corresponder ao que será enviado no payload.
- Solução: Garantir que `selectedTheme` seja atualizado tanto pelo grid de infoproduto quanto pelo grid de carrossel.

---

### Médios (afetam usabilidade mas têm workaround)

**UX-011: Dropdown "Tipo de entregável" não fecha ao pressionar Escape**
- Localização: listener em `typeTrigger`
- Solução: Adicionar listener `keydown` no document para fechar com Escape.

**UX-012: Labels dos campos sem atributo `for` associado ao input**
- Localização: Todos os `<label class="lbl">` no HTML
- Problema: As labels usam `display:block` mas não têm `for="id"` associando ao input. Clicar na label não foca o campo. Isso é também um problema de acessibilidade (screen readers).

**UX-013: `autosave-badge` fica fixo no canto esquerdo sobrepondo outros elementos em mobile**
- Localização: `.autosave-badge` CSS — `position:fixed; bottom:18px; left:18px`
- Problema: Em mobile, conflita com o `err-box` que também é `position:fixed; bottom:16px`.

**UX-014: `err-box` sem botão de fechar manual**
- Localização: `#err-box` — só fecha por timeout (10s) ou se for timeout de servidor
- Problema: Mensagens de erro não relacionadas a timeout ficam 10 segundos na tela sem opção de fechar. Em mobile isso bloqueia conteúdo.
- Solução: Adicionar botão `×` no `err-box`.

**UX-015: Drag handles dos elementos do preview não funcionam em touch (mobile)**
- Localização: `makeDraggable()` usa apenas `mousedown/mousemove/mouseup`
- Problema: Em dispositivos touch, os handles são inutilizáveis.
- Solução: Adicionar handlers `touchstart/touchmove/touchend` equivalentes.

**UX-016: Texto "Meu Entregável" no preview não corresponde ao estado de carrossel**
- Localização: `#pv-title` default text
- Problema: Ao mudar para modo carrossel, o preview de infoproduto some (`.preview{display:none}`), mas o estado do título no preview fica "Meu Entregável" — se o usuário voltar para o modo infoproduto sem digitar nada, a preview mostra o texto antigo.

**UX-017: Campo "Gancho" do carrossel não tem limite de caracteres visível**
- Localização: `#inp-gancho` textarea
- Problema: O gancho é o texto do primeiro slide. Slides têm limite real de ~120 caracteres legíveis. Sem contador, o usuário pode digitar um texto imenso que será truncado ou comprimido no slide.

**UX-018: Slider de escurecimento não tem feedback visual em tempo real na preview**
- Localização: `#darken` slider → `updateCapaStatus()` e `updatePreviewColors()`
- Problema: `updatePreviewColors()` é chamado mas só afeta a preview quando a imagem foi carregada. Se nenhuma imagem for carregada, o slider parece não fazer nada.

---

### Acessibilidade

**UX-019: Botões de ação sem `aria-label` descritivo**
- `pv-font-up` e `pv-font-down` têm apenas texto "A+" e "A−" sem `aria-label`
- Switches (`#sw-head`, `#sw-foot`) sem `role="switch"` e `aria-checked`
- Overlays de progresso não têm `role="dialog"` e `aria-modal="true"`

**UX-020: Contraste insuficiente em elementos com `--text-3`**
- Cor `--text-3: #6E6050` sobre fundo `--bg-0: #0B0906`
- Ratio de contraste aproximado: 3.1:1 (mínimo WCAG AA para texto normal é 4.5:1)
- Afeta: hints de campos, labels de chips, metadados do sumário

**UX-021: Sem skip link para navegação por teclado**
- Usuários de teclado precisam tab por todo o nav antes de chegar ao conteúdo principal.

---

### Mobile Específicos

**UX-022: Grid de fontes com 4 colunas em mobile (`.fpick-grid`)**
- Em telas de 375px, cada card de fonte fica com ~80px de largura — nome da fonte truncado e quase ilegível.
- Solução: `@media(max-width:480px) { .fpick-grid { grid-template-columns: repeat(2,1fr); } }`

**UX-023: Overlay de sucesso com scroll interno em mobile**
- `#overlay-ok .overlay-box` tem `max-height:90vh;overflow-y:auto` mas em iOS o scroll interno não funciona sem `-webkit-overflow-scrolling:touch`.

**UX-024: Preview card (`.preview`) com `aspect-ratio:3/4` em tela estreita**
- Em mobile com grid de 1 coluna, a preview ocupa ~320px × 427px — muito alto, empurra o botão "Gerar" para fora da tela visível inicial.
- Solução: Reduzir `aspect-ratio` para `2/3` ou `16/9` em mobile.

---

## PARTE 4 — PROBLEMAS DE SOBREPOSIÇÃO NO PDF

### Análise do código `deliverable_generator.js`

Foram identificados os seguintes elementos de layout que causam ou podem causar sobreposição no PDF:

---

**PDF-001: Ghost Number do `drawChapterBanner` sobrepõe o cabeçalho**
- Localização: função `drawChapterBanner()`, linha ~549
- Código problemático:
  ```js
  doc.fillColor(C.primary).fillOpacity(0.05)
    .font(F.title).fontSize(210)
    .text(numStr, W - 215, CT - 26, { width: 240, align: "right", lineBreak: false });
  ```
- O `y = CT - 26` posiciona o ghost number 26px ACIMA do content top (`CT`). Com `fontSize(210)`, o caractere pode se estender para cima, sobrepondo o cabeçalho (`CAB_H = 36`). O stripe de cor (`STRIPE_H = 6`) e o cabeçalho ficam cobertos pelo número fantasma gigante.
- **Correção sugerida:** Usar `CT` como y mínimo, ou reduzir o tamanho para 160px no máximo.

---

**PDF-002: Ghost Number da `drawTransitionPage` pode sobrepor badge de capítulo**
- Localização: função `drawTransitionPage()`, linha ~594
- Código problemático:
  ```js
  doc.fillColor(tAcc).fillOpacity(0.07).font(F.title).fontSize(380)
    .text(numStr, W * 0.18, H * 0.08, { lineBreak: false });
  ```
- O badge do capítulo é posicionado em `H * 0.36` (linha ~601) e o título em `H * 0.42`. Com `fontSize(380)`, o ghost number pode se estender verticalmente por ~500 unidades PDF (~17cm) — completamente sobre o badge e o título.
- **Correção sugerida:** Reduzir para `fontSize(240)` e ajustar o `y` para `H * 0.05`.

---

**PDF-003: Ghost "SUMÁRIO" causa sobreposição por causa da rotação**
- Localização: bloco do sumário, linha ~751
- Código problemático:
  ```js
  doc.translate(ML - 8, CT + 160);
  doc.rotate(-90);
  doc.fillColor(C.primary).fillOpacity(0.035).font(F.title).fontSize(120)
    .text("SUMÁRIO", 0, 0, { lineBreak: false });
  ```
- O `translate` + `rotate(-90)` é feito sem `doc.save()` antes e `doc.restore()` depois. O PDFKit não reseta o transform automaticamente. Isso pode afetar elementos desenhados depois se o `save/restore` não estiver corretamente balanceado.
- **Correção sugerida:** Envolver todo o bloco com `doc.save()` ... `doc.restore()`.

---

**PDF-004: Barra lateral esquerda do sumário sobrepõe conteúdo da tabela**
- Localização: linha ~759
- Código problemático:
  ```js
  doc.rect(ML, CT, 4, CB - CT).fill(C.primary);
  ```
- A barra é desenhada DEPOIS dos itens do sumário já terem sido posicionados, mas a barra lateral vai do topo ao fundo da área de conteúdo (do `CT` ao `CB`). Como cada item do sumário tem `ML + 18` como x de início, o primeiro `rect` do item (linha ~778) começa em `ML + 18` — mas os itens sem número usam `ML + 18` também. Se um item ocupa `ML` a `ML+4`, ele é coberto pela barra. Na prática, os números do sumário (`ML + 18`) ficam acima da barra, mas o posicionamento `ML` da barra sobrepõe qualquer texto que comece exatamente em `ML`.

---

**PDF-005: `writeNumberedItem` — badge de número desenhado DEPOIS do texto**
- Localização: função `writeNumberedItem()`, linhas ~509-522
- Código problemático:
  ```js
  // texto é renderizado ANTES do badge
  doc.fillColor(TEXT_DARK).font(F.body).fontSize(11)
    .text(text, ML + 38, startY + 13, { width: CW - 52, lineGap: 3 });
  // depois disso, o badge é desenhado sobre a área esquerda
  doc.rect(ML, startY, 30, realH).fill(C.primary);
  ```
- Isso é intencional (o badge precisa cobrir a margem), mas o problema é que o texto começa em `ML + 38` e o badge vai até `ML + 30`. Há 8px de sobreposição entre o badge (`ML` a `ML+30`) e o início do texto (`ML+38`). Se o usuário usa uma fonte large (ex: Anton em 11px), as letras com descenders podem se estender para a esquerda dos 8px e ficar sobre o badge.
- **Correção sugerida:** Aumentar o offset do texto para `ML + 44`.

---

**PDF-006: `writeCallout` — texto iniciado em posição que pode ser coberta pela borda lateral**
- Localização: `writeCallout()`, linha ~458
- O rect de acento lateral `doc.rect(ML, cy, 5, boxH)` tem 5px. O texto começa em `ML + 32`. Há 27px de margem — adequado. Mas o problema é que a estimativa de altura `boxH` usa um multiplicador `* 1.4`, e o texto é renderizado com `cy + 14` como offset superior. Se o texto real tiver mais linhas que o estimado (PDFKit pode calcular diferente em runtime), o texto vai além do `cy + boxH`, mas o retângulo de fundo não acompanha. Isso cria texto sem background, quebrando visualmente o callout.
- **Correção sugerida:** Renderizar o texto primeiro em uma posição temporária (ou usar `doc.y` depois), depois desenhar o rect com a altura real.

---

**PDF-007: Página de encerramento — aspas decorativas com y negativo**
- Localização: bloco de encerramento, linha ~885
- Código problemático:
  ```js
  doc.fillColor("#FFFFFF").fillOpacity(0.06).font(F.title).fontSize(180)
    .text(""", ML + 14, panY - 28, { lineBreak: false });
  ```
- `panY - 28` com `fontSize(180)` significa que as aspas começam 28px acima do painel e se estendem para cima. Se `panY` for pequeno (página com pouco conteúdo), as aspas podem se estender para fora da área do painel ou sobrepor o conteúdo acima.
- **Correção sugerida:** Usar `Math.max(panY - 28, CT)` como y, ou reduzir para `fontSize(120)`.

---

**PDF-008: `drawChrome` — número de página pode sobrepor texto do rodapé**
- Localização: `drawChrome()`, linha ~293
- Código problemático:
  ```js
  const bw = 30, bh = 18;
  const px = W - ML, py = fy + 9;
  doc.rect(px - bw, py, bw, bh).fill(C.primary);
  doc.fillColor("#FFFFFF").font(F.title).fontSize(9)
    .text(String(pageNum), px - bw, py + 4, { width: bw, align: "center" });
  ```
- O texto do rodapé (`rodTexto`) usa `width: CW - 54` mas começa em `ML`. A largura total seria `ML + (CW - 54) = ML + W - ML - 112 - 54 = W - 166`. O badge do número começa em `W - ML - 30 = W - 86`. Há sobreposição de 80px entre o texto do rodapé e o badge do número quando o rodapé tem muito texto.
- **Correção sugerida:** Reduzir `width` do rodTexto para `CW - 70` ou mais.

---

## PARTE 5 — ROADMAP PRIORIZADO

### Semana 1 — Correções Críticas (antes de qualquer marketing)
1. Corrigir `restoreRascunho` (seletores quebrados) — UX-002
2. Corrigir referência ao EventSource no cancelamento — UX-001
3. Corrigir menção ao "OpenAI" na overlay — UX-005
4. Aplicar `doc.save()/restore()` no ghost do sumário — PDF-003
5. Reduzir fontSize dos ghost numbers para evitar sobreposição — PDF-001, PDF-002

### Semana 2 — Features de Conversão
1. Implementar Score de Qualidade do Produto (Ideia 5) — alto impacto, zero custo de backend
2. Implementar Assistente de Título com IA (Ideia 3)
3. Corrigir acessibilidade básica: labels, aria, contraste — UX-012, UX-019, UX-020

### Semana 3 — Retenção e Viralizacao
1. Implementar Histórico de Entregáveis (Ideia 4) — Supabase já disponível
2. Implementar Modo Express / 1-Click (Ideia 1)

### Mês 2 — Escala
1. Galeria de Templates com Preview Real (Ideia 2)
2. Onboarding com perfil DISC (recomendação Paulo Vieira)
3. Sistema de créditos/assinatura com analytics de uso (recomendação Bezos)
4. Internacionalização do copy para "português popular" (recomendação Luciano Hang)

---

*Documento gerado em 2026-05-02 por Claude Code para Nexus Digital Holding*
*Repositório: https://github.com/mastertop3116-sudo/Claude-Code-Febra*
