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

### 9. ✅ Redesign completo do gerador de PDF v4 (2026-04-27)
- ✅ `drawChapterBanner` + `writeGanchoBox` — novo visual de abertura de capítulo
- ✅ `writeNumberedItem` — badge desenhado após texto (bug de overflow corrigido)
- ✅ `writeBody` — split por `\n` (era `;`)
- ✅ 6 bugs de `heightOfString` corrigidos em todos os boxes (lineGap matching)
- ✅ "Sobre o Autor" com círculo de foto placeholder
- ✅ Página de encerramento "Obrigado" dark + painel central
- ✅ Capa vetorial nativa (fallback de alta qualidade, sem depender de imagem AI)
- ✅ Páginas de transição entre capítulos (ebooks ≥15 páginas) — recomendação Conselho
- ✅ Fontes padrão → Oswald + Nunito — recomendação Conselho
- ✅ Espaçamento aumentado entre parágrafos e bullets

### 10. ✅ Agentes reescritos (2026-04-27)
- ✅ `copywriter.js` — SYSTEM_PRO/Flash, PRO_TYPES auto-seleção, cache em memória, jsonrepair fallback
- ✅ `capa.js` — Imagen 4 fast, prompt anti-texto reforçado
- ✅ `carrossel.js` — migrado para Flash
- ✅ `cover_templates.js` — slices expandidos (titulo:80, subtitulo:180)

### 11. ✅ UX da página de criação (2026-04-27)
- ✅ "02 Tema visual" oculto no carrossel/converter (`data-showon="ent"`)
- ✅ Seletor de tema compacto no carrossel
- ✅ "Relatório de pesquisa" gerado por IA (`/api/relatorio`)
- ✅ Chips de sugestão em todos os campos
- ✅ Modo Econômico removido — sistema auto-seleciona modelo por tipo

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

### 13. Renovar/verificar chave GEMINI_API_KEY local
- A chave local no `.env` recebeu erro 403 "Your project has been denied access"
- Render funciona (chave do ambiente de produção está ok)
- Verificar no Google AI Studio se a chave local expirou ou projeto foi suspenso
- Gerar nova chave e atualizar o `.env` local

### 12. Sistema de imagens profissionais para Criativos em Imagem
- Geração de imagens de alta qualidade para uso em criativos (posts, banners, capas)
- Integrar com o fluxo de Criativos existente
- Explorar: Imagen 4, Gemini Flash Image, ou pipeline próprio
- Qualidade profissional: proporções corretas por plataforma (feed, stories, YouTube thumb)

### 14. ✅ Otimização radical de tokens Gemini (2026-05-01)
- ✅ roteirista.js + editor.js: Pro → Flash (3-4x mais barato)
- ✅ design_reviewer.js + content_specialist.js: Pro → Flash
- ✅ copywriter.js: Flash em todos; word minimums 600→400 (PRO_TYPES), 350→250 (padrão)
- ✅ gemini.js: geminiImage() de até 9 chamadas → 2 tentativas lineares
- ✅ max.js: histórico 10→5, aprendizados 5→3, extractLearning condicional (>80 chars)
- ✅ server.js: compression middleware + cache headers (assets 1h, fontes 7d)
- ✅ criar.html: fontes Google split crítico/async (13 famílias carregam pós-render)
- Estimativa: -80% custo Gemini, +60% throughput servidor

### 15. Integração API Gamma (próxima sessão)
- Conectar API Gamma para geração de apresentações/slides
- Criar endpoint `/api/gamma` e comando `/apresentacao`
- Integrar no fluxo de criação junto com PDF/Word

### 16. Corrigir conteúdo ebook de pregações (PENDENTE)
- O agente gera manual metodológico em vez de pregações prontas
- Ajustar prompts de estrategista/arquiteto para gerar pregações completas
  (texto bíblico + intro + 3 pontos + aplicação + conclusão)

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
