# Estado Atual — Nexus (atualizar sempre)

> Este arquivo muda com frequência. Reflete o que está acontecendo AGORA.

---

## Foco atual

**Semana de 2026-05-04**
Estabilizar o Nexus Forge e preparar primeiros lançamentos escaláveis.

---

## Projetos ativos

| Projeto | Status | Próxima ação |
|---------|--------|--------------|
| Nexus Forge — Gamma PDF (retry fix) | ✅ Deployado | Verificar logs no Render após próxima geração |
| Nexus Forge — Preview canvas ao vivo | ✅ Deployado | Confirmar visual no browser |
| Sidebar clicável | ✅ Corrigida | — |
| Obsidian como memória persistente | ✅ Estrutura completa | Usar ativamente e manter atualizado |
| Auditoria UX completa do Forge | 🔄 Em andamento | Testar todos os 4 modos (ent/car/cri/conv) |
| Remoção código PDFKit legado | ⏳ Aguardando | Confirmar Gamma estável por 1 semana |
| Pipeline UTMify → auto-produto | 📋 Planejado | Aguarda produtos ativos gerando dados |
| Dashboard/Studio web | 📋 Planejado | Sessão dedicada |
| Wizard de produto (sem relatório) | 📋 Planejado | Fluxo guiado: nome → nicho → público |
| Sistema de imagens para Criativos | 📋 Planejado | Explorar DALL-E 3 / Imagen 4 |

---

## Prioridades desta semana

1. **Validar Gamma end-to-end** — gerar 1 produto real, confirmar PDF entregue
2. **Auditoria UX** — testar todos os 4 modos do Forge
3. **Primeiro produto escalável** — criar ebook em nicho quente com Forge
4. **Campanha teste** — subir no Meta Ads e medir CAC dos produtos ativos

---

## Bloqueadores conhecidos

- Gemini Pro instável neste ambiente → já resolvido (gemini.js é shim para OpenAI)
- Gamma exportUrl demora após `completed` → retry 4×7s (já corrigido)
- Chave GEMINI_API_KEY local com erro 403 → verificar no Google AI Studio (não crítico, OpenAI é o motor)
- Ebook de pregações: agente gera manual metodológico em vez de pregações prontas → ajustar prompts estrategista/arquiteto

---

## Pendências do PENDENCIAS.md (não concluídas)

| # | Tarefa | Observação |
|---|--------|------------|
| 4 | Wizard de produto | Fluxo guiado sem precisar de relatório |
| 12 | Sistema de imagens profissionais para Criativos | DALL-E 3 ou Imagen 4 |
| 13 | Renovar GEMINI_API_KEY local | Não crítico (OpenAI é o motor) |
| 16 | Corrigir ebook de pregações | Ajustar prompts do estrategista/arquiteto |
| 7 | Dashboard/Studio | Sessão dedicada — seletor de produto + histórico |

---

## Aprendizados recentes

- **Motor de IA real é GPT-4o Mini**, não Claude ou Gemini. `gemini.js` é wrapper vazio.
- Sidebar com `display:none!important` não responde a `.click()` → reescrever sem depender de elemento oculto
- Gamma API: `exportUrl` chega após `completed` — retry 4×7s resolve
- Preview canvas com 15 elementos visuais replica fielmente o PDF gerado
- MAX limita histórico a 5 mensagens e 3 aprendizados (otimização de tokens mai/2026)

---

## Produtos em teste (Meta Ads)

| Produto | CA | Status |
|---------|-----|--------|
| BIDCAP (Jiu-Jitsu infantil) | CA01 | Em análise |
| TESTE BM (Ballet) | CA05 | Em análise |
| 5D (Pack Bíblico) | CA04 TESTE | Em análise |

---

## Git — branch atual

- **Dev:** `claude/add-system-status-rDb9J`
- **Prod:** `main` (auto-deploy Render)

---

*Atualizar a cada sessão relevante de trabalho.*
