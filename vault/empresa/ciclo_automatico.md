# Ciclo Automático da Empresa

> Rodar semanalmente. MAX executa, Presidente aprova.

---

## O Ciclo (7 etapas)

```
SEGUNDA-FEIRA → Etapas 1–2 (Produto + Oferta)
QUARTA-FEIRA  → Etapas 3–4 (Conteúdo + Copy)
SEXTA-FEIRA   → Etapas 5–7 (Roteiro + Melhorias + Memória)
```

---

## Etapa 1 — Criar ideia de produto

**Quem executa:** MAX (Setor Produto)
**Ferramenta:** `/pesquisa [nicho]` + análise UTMify

```
1. MAX analisa dados UTMify — qual nicho tem mais conversão?
2. Gera 3 ideias de produto para esse nicho
3. Para cada ideia: título + tipo + ticket + dor que resolve
4. Envia para aprovação do Presidente
```

**Entrega ao Presidente:**
```
💡 IDEIAS DE PRODUTO — SEMANA [X]

1. [Título] — [Tipo] — R$[Ticket]
   Dor: [dor principal]
   
2. [Título] — [Tipo] — R$[Ticket]
   Dor: [dor principal]

3. [Título] — [Tipo] — R$[Ticket]
   Dor: [dor principal]

Qual aprovar? Responda o número.
```

---

## Etapa 2 — Criar oferta

**Quem executa:** MAX (Setor Monetização)
**Trigger:** Presidente aprovou a ideia

```
1. Definir produto principal + preço
2. Criar order bump complementar + preço
3. Criar upsell 1 + preço
4. Gerar headline com formato: [N] [Benefício] sem [Objeção]
5. Gerar sub-headline com prova social
6. Gerar CTA de urgência
```

**Entrega ao Presidente:**
```
🛍️ OFERTA — [Nome do Produto]

Produto: [Título] — R$[Preço]
Bump: [Complementar] — R$[Preço]
Upsell: [Versão avançada] — R$[Preço]

Headline: [headline]
Sub: [sub-headline]
CTA: [CTA]

✅ Aprovar oferta?
```

---

## Etapa 3 — Criar conteúdo base

**Quem executa:** MAX (Setor Conteúdo)
**Ferramenta:** Nexus Forge (`/api/criar`)

```
1. Gerar produto no Forge com o tema aprovado
2. Gerar carrossel relacionado ao mesmo tema
3. Extrair 3 ganchos do conteúdo para posts orgânicos
```

---

## Etapa 4 — Criar copies

**Quem executa:** MAX (copywriter.js)
**Ferramenta:** Prompt de copy do [[prompts/padroes]]

```
1. Copy do anúncio principal (Facebook/Instagram)
2. Legenda do carrossel orgânico
3. Copy do bump (1 frase de 8 palavras)
4. Copy do upsell (benefício + urgência)
```

**Entrega ao Presidente:**
```
✍️ COPIES — [Produto]

ANÚNCIO PRINCIPAL:
[copy]

LEGENDA ORGÂNICA:
[copy]

BUMP (checkout):
[1 frase]

✅ Aprovar copies?
```

---

## Etapa 5 — Criar roteiros

**Quem executa:** MAX (roteirista.js + editor.js)
**Ferramenta:** `/api/roteiro`

```
1. Roteiro Reels modo "venda" — curto (30–60s)
2. Roteiro Reels modo "autoridade" — médio (60–90s)
3. Instruções de edição para ambos
```

---

## Etapa 6 — Sugerir melhorias no sistema

**Quem executa:** MAX (Head de UX + Engenharia)

```
1. Revisar logs de erro da semana (Render)
2. Identificar 1 melhoria de UX prioritária
3. Identificar 1 automação a construir
4. Propor ao Presidente
```

**Entrega:**
```
⚙️ MELHORIAS DA SEMANA

UX: [melhoria específica]
Automação: [o que automatizar]

✅ Aprovar desenvolvimento?
```

---

## Etapa 7 — Atualizar memória

**Quem executa:** MAX (automaticamente)

```
1. Atualizar estado_atual.md com o que foi produzido
2. Registrar decisão do Presidente em conselho/decisoes.md
3. Salvar aprendizado relevante no Supabase
4. Atualizar backlog de produtos em setores/produto.md
```

---

## Primeiro ciclo — executado em 2026-05-04

**Resultado:**
- ✅ Estrutura de 6 setores criada
- ✅ Conselho de 4 Titãs documentado com frameworks
- ✅ Ciclo automático definido
- ✅ Vault Obsidian com 20+ arquivos
- ✅ Sistema operacional completo e pronto para uso

**Próximo ciclo:** Segunda-feira, 2026-05-11
