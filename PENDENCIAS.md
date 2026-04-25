# NEXUS — Pendências para Rodrigo

> Consulte este arquivo no início de cada sessão.
> Marque com ✅ quando concluir.

---

## 🔴 Bloqueantes (fazer antes de usar em produção)

### 1. Rodar SQL das tabelas no Supabase
As tabelas `produtos`, `lancamentos` e `criativos` ainda não existem no banco.
O arquivo SQL já está no repositório em `supabase/schema.sql`.

**Opção A (recomendada):**
- Supabase → SQL Editor → cole o conteúdo de `supabase/schema.sql` → Run

**Opção B (automatizar futuro):**
- Me forneça a `service_role` key (Supabase → Settings → API) ou a Connection String (Settings → Database → URI)
- Com isso consigo rodar SQL diretamente sem copiar e colar

---

## 🟡 UX / Frontend (aprovado, aguardando implementação)

### 2. Finalizar redesign de `public/criar.html`
O commit `28df6c0` tem o início do redesign mas está incompleto:
- [ ] Adicionar `data-showon="ent"` nas seções 03 e 04 (entregável)
- [ ] Remover seção antiga de carrossel (substituída pelo novo modo)
- [ ] Adicionar JS de troca de modo (Entregável / Carrossel / Ambos)
- [ ] Preview sticky: testar após as alterações acima

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

### 5. Varredura de linguagem proibida
- Substituir todas as ocorrências de "IA / Inteligência Artificial" nos textos de interface
- Termos aprovados: "Motor de criação", "Sistema", "Processo", "Engenheiro de criação"
- Verificar: `public/criar.html`, `telegram/handlers.js`, `README` (se houver)

### 6. Comando `/roteiro` com produto do Supabase
- Atualmente o `/roteiro` no Telegram recebe dados inline (nome|nicho|modo...)
- Após tabela `produtos` existir: permitir `/roteiro [produto_id]` para buscar dados salvos

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
