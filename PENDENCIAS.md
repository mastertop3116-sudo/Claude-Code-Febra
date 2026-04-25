# NEXUS — Pendências para Rodrigo

> Consulte este arquivo no início de cada sessão.
> Marque com ✅ quando concluir.

---

## ✅ Bloqueantes resolvidos

### 1. ✅ Tabelas criadas no Supabase (2026-04-25)
Tabelas `produtos`, `lancamentos` e `criativos` criadas via Management API.
PAT e service_role key salvas no `.env` local.

---

## ✅ Concluído

### 2. Finalizar redesign de `public/criar.html`
Implementado nos commits do Carlinhos (`6e039d8`, `a03f38b`):
- ✅ `data-showon="ent"` nas seções 03 e 04
- ✅ Seção antiga de carrossel removida (substituída pelo novo modo)
- ✅ JS de troca de modo (Entregável / Carrossel) + atualização do botão/preview
- ✅ Preview sticky no CSS

### 5. Varredura de linguagem proibida (`687be2f`)
- ✅ `public/criar.html` — "substitui IA" → "substitui geração"
- ✅ `departments/creative/content_specialist.js` — "IA especializada" → "Motor de criação especializado"
- ✅ `departments/creative/design_reviewer.js` — "erros de IA visíveis" → "erros de geração visíveis"

---

## 🟢 Melhorias futuras (próximas sessões)

### 3. DNA de Lançamento — Upload de relatório de mercado
- Campo de upload de PDF/texto na página `/criar`
- Parser que extrai insights do relatório e salva em `lancamentos.relatorio_texto`
- Alimenta automaticamente os agentes roteirista/editor com contexto do lançamento

### 4. Wizard de produto (para usuários sem relatório)
- Fluxo guiado: nome do produto → nicho → público → benefício → preço
- O próprio sistema pesquisa mercado (agente `pesquisarMercado` já existe)
- Salva resultado em `produtos` e `lancamentos` no Supabase

### 6. Comando `/roteiro` com produto do Supabase
- Atualmente o `/roteiro` no Telegram recebe dados inline (nome|nicho|modo...)
- Permitir `/roteiro [produto_id]` para buscar dados salvos na tabela `produtos`

### 7. Dashboard/Studio (sessão dedicada)
- Seletor de produto cadastrado
- Histórico de criativos gerados por produto
- Visualizador de roteiro + instruções de edição lado a lado

---

## ℹ️ Referências rápidas

| Item | Valor |
|------|-------|
| Branch de desenvolvimento | `claude/add-system-status-rDb9J` |
| Render (deploy automático) | https://claude-code-febra.onrender.com |
| Supabase projeto | `vzuaglghjbowhkogqlfk` |
| Schema SQL | `supabase/schema.sql` |
| Agentes novos | `agents/roteirista.js`, `agents/editor.js` |
| Endpoint roteiro | `POST /api/roteiro` + `GET /api/roteiro/progress/:jobId` |
| Comando Telegram | `/roteiro nome \| nicho \| modo \| plataforma \| duracao` |
