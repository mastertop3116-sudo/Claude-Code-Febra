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

### 3. ✅ DNA de Lançamento — Upload de relatório de mercado
- ✅ Upload de PDF/txt/md/csv na página `/criar` (extração de texto via pdfjs)
- ✅ `POST /api/produto` salva em `produtos` + `lancamentos.relatorio_texto`
- ✅ `relatorio` injetado nos agentes: estrategista e content_specialist
- ✅ Botão "Salvar produto" com feedback de ID no painel web

### 4. Wizard de produto (para usuários sem relatório)
- Fluxo guiado: nome do produto → nicho → público → benefício → preço
- O próprio sistema pesquisa mercado (agente `pesquisarMercado` já existe)
- Salva resultado em `produtos` e `lancamentos` no Supabase

### 6. ✅ Comando `/roteiro` com produto do Supabase
- ✅ `/roteiro [uuid]` busca produto direto da tabela `produtos`
- ✅ `/produtos` lista os produtos salvos do usuário com IDs
- ✅ Modo inline (`nome|nicho|modo|plataforma|duracao`) mantido como fallback

### 8. ✅ Preview fiel à capa do entregável (`b06e570`)
- `pdfjs-dist` 3.11 via CDN renderiza a página 1 do PDF gerado num `<canvas>` no overlay de sucesso
- Zero mudança no servidor — usa o base64 que já chega no browser

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
