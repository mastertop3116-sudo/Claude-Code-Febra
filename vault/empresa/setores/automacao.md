# Setor 5 — Engenharia & Automação

**Responsável:** Head de Automação (MAX)
**Objetivo:** Eliminar trabalho manual. Se algo se repete 3x, automatizar.

---

## Missão

Construir sistemas que trabalham 24h sem intervenção humana.

---

## Automações ativas

| Automação | Status | Descrição |
|-----------|--------|-----------|
| Geração de infoproduto via Forge | ✅ Ativo | POST /api/criar → PDF/DOCX |
| Geração de carrossel via Forge | ✅ Ativo | POST /api/carousel → PNGs |
| Geração de roteiro via Forge | ✅ Ativo | POST /api/roteiro → JSON |
| MAX no Telegram | ✅ Ativo | GPT-4o Mini responde 24h |
| Webhook GG Checkout | ✅ Ativo | Confirma vendas automaticamente |
| Webhook GitHub → Supabase | ✅ Ativo | Salva commits como memória |
| Extração de aprendizados (MAX) | ✅ Ativo | Automático após cada conversa >80 chars |
| Cache UTMify | ✅ Ativo | Dados de ads no Supabase |

---

## Automações planejadas (backlog)

| Automação | Prioridade | Complexidade |
|-----------|-----------|-------------|
| Pipeline: UTMify detecta nicho quente → MAX gera produto → campanha | Alta | Alta |
| Relatório semanal automático: CAC/LTV por produto | Alta | Média |
| Auto-geração de produto semanal por nicho | Média | Média |
| Wizard de produto (fluxo guiado sem relatório) | Média | Baixa |
| Dashboard Studio — histórico de criativos | Média | Média |
| Sistema de imagens para criativos (DALL-E 3) | Baixa | Alta |
| ElevenLabs — geração de narração de VSL | Baixa | Média |

---

## Stack técnica do setor

```
Node.js + Express 5 (servidor)
OpenAI GPT-4o Mini (IA principal)
Claude Sonnet 4.6 (via /claude)
Gamma API (PDF/slides)
Supabase (PostgreSQL + real-time)
Render (deploy automático via main branch)
GitHub webhook → Supabase
UTMify MCP → cache Supabase
GG Checkout webhook
```

---

## Regras de automação

1. **Nenhuma automação depende de intervenção manual** para rodar
2. **Jobs têm timeout** — ebooks 15min, carrossel/roteiro 3min
3. **Jobs expiram** em memória após 10min (cleanup automático)
4. **Erros são capturados e reportados** — nunca silenciosos
5. **Deploy zero-downtime** — merge em main aciona Render automaticamente

---

## Fluxo de deploy

```
1. Commit na branch: claude/add-system-status-rDb9J
2. git checkout main
3. git merge claude/add-system-status-rDb9J
4. git push origin main
→ Render detecta e faz deploy automático (~2–3min)
5. Voltar para branch dev
```

---

## Próxima automação a construir

**Pipeline UTMify → Produto Automático:**
```
UTMify identifica campanha com ROAS > 2x
→ MAX lê o nicho vencedor
→ Gera 3 ideias de produto complementar
→ Envia para aprovação do Presidente via Telegram
→ Presidente aprova com /sim ou /nao
→ Forge gera o produto
→ Campanha é criada automaticamente
```

---

## KPIs do setor

| Métrica | Meta |
|---------|------|
| Uptime do servidor | > 99% |
| Automações ativas | ≥ 8 |
| Tempo de deploy após commit | < 5min |
| Tarefas manuais eliminadas/mês | ≥ 2 |
