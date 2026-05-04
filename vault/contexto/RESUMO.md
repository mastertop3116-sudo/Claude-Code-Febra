# RESUMO — Nexus Digital Holding (leitura rápida)

> Versão condensada. Ler junto com [[MASTER]]. Detalhes técnicos → [[tecnologia/arquitetura]].

---

## NEGÓCIO

- **O que é:** fábrica de infoprodutos low-ticket com IA
- **Canal:** Meta Ads → LP → GG Checkout → Upsell
- **Receita:** R$17–R$97/produto · volume alto · CAC baixo
- **Meta:** R$10k/mês recorrente (Rodrigo) → valuation US$1B (empresa)
- **Gerador:** Nexus Forge — ebook/workbook/carrossel em segundos

---

## PÚBLICO

- Adultos 25–45 anos, Brasil, classes C/D/E, celular primeiro
- Decisão emocional/impulsiva — prova social + urgência convertem
- Produtos ativos: **BIDCAP** (Jiu-Jitsu infantil) · **Ballet em Casa** · **Pack Bíblico (5D)**

---

## PRODUTO (NEXUS FORGE)

- **URL:** https://claude-code-febra.onrender.com/criar
- **Tipos:** Ebook · Workbook · Checklist · Planner · Script VSL · Cheat Sheet
- **Motor de IA:** OpenAI GPT-4o Mini (MAX + todos os agentes)
- **Output:** PDF via Gamma API (retry fix ativo) + DOCX local
- **Temas:** impacto · elegância · sabedoria · produtividade · bem-estar · criatividade
- **Modos UI:** `ent` (infoproduto) · `car` (carrossel) · `cri` (criativo) · `conv` (converter)

---

## STACK (CORRIGIDA)

```
Telegram → MAX (GPT-4o Mini) → Supabase (memória)
Forge → GPT-4o Mini (conteúdo) → Gamma API (PDF)
/claude no Telegram → Claude Sonnet 4.6 (Anthropic)
gemini.js = SHIM → redireciona para openai.js
```

> **Atenção:** o sistema NÃO usa Gemini em produção. `gemini.js` é wrapper vazio.

---

## ESTRATÉGIA

- Criar produtos em massa por nicho → testar com Meta Ads → escalar o que roda
- Pipeline alvo: UTMify detecta nicho quente → MAX gera produto → campanha automática
- Funil: produto R$27 + bump R$7 + upsell R$47 + upsell R$97

---

*Atualizar quando mudar estratégia, produto ou resultado relevante.*
*Última atualização: 2026-05-04*
