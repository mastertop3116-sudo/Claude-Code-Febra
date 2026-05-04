# Setor 4 — Lab de UX

**Responsável:** Head de UX (MAX)
**Objetivo:** Reduzir fricção em cada etapa — mais conversão, menos abandono.

---

## Missão

Cada tela, cada botão, cada palavra deve empurrar o usuário para a próxima ação.

---

## Sistemas sob responsabilidade

| Sistema | URL / Local | Última auditoria |
|---------|------------|-----------------|
| Nexus Forge (criar.html) | /criar | 2026-05-04 |
| Preview canvas | Embutido no Forge | 2026-05-04 |
| Sidebar de navegação | Forge — 4 modos | 2026-05-04 (corrigida) |
| Loading overlay | Forge — SSE progress | 2026-05-04 |

---

## Princípios UX da Nexus

1. **Zero fricção no caminho principal** — criar produto em < 3 cliques
2. **Feedback em tempo real** — progresso SSE, preview ao vivo
3. **Dark mode premium** — identidade visual coesa
4. **Mobile first** — usuário final usa celular; nós também
5. **Erro deve ser raro, e quando acontece, explicar claramente**

---

## Checklist de auditoria UX (rodar mensalmente)

### Nexus Forge
- [ ] Modo `ent`: formulário → geração → download funciona sem erro
- [ ] Modo `car`: carrossel gerado e exibido corretamente
- [ ] Modo `cri`: criativo gerado e disponível para download
- [ ] Modo `conv`: upload → conversão → download funciona
- [ ] Preview canvas atualiza ao digitar título e trocar tema
- [ ] Sidebar troca de modo sem recarregar a página
- [ ] Barra de progresso avança corretamente via SSE
- [ ] Overlay de sucesso mostra PDF real (via pdfjs)
- [ ] Botão de download PDF e DOCX funcionam
- [ ] "Abrir no Gamma" abre URL correta

### Performance
- [ ] Fontes carregando via split crítico/async
- [ ] Cache headers corretos (assets 1h, fontes 7d)
- [ ] Compressão ativa (compression middleware)

---

## Melhorias aprovadas (backlog UX)

| Melhoria | Prioridade | Status |
|---------|-----------|--------|
| Wizard de produto para usuários sem relatório | Alta | 📋 Planejado |
| Dashboard/Studio com histórico de produtos | Média | 📋 Planejado |
| Seletor de tema com preview visual de miniatura | Média | 📋 Planejado |
| Feedback sonoro ao concluir geração | Baixa | 💡 Ideia |

---

## Regras de identidade visual

| Elemento | Valor |
|----------|-------|
| Cor principal | `#a855f7` (roxo) |
| Acento | `#facc15` (amarelo) |
| Background | `#07070a` |
| Fonte display | Bricolage Grotesque |
| Fonte corpo | DM Sans |
| Fonte mono | DM Mono |
| Estilo | Dark mode premium · glassmorphism |

---

## KPIs do setor

| Métrica | Meta |
|---------|------|
| Taxa de conclusão de geração (sem erro) | > 90% |
| Tempo médio de geração de ebook | < 90s |
| Auditoria completa realizada | 1×/mês |
| Bugs críticos abertos | 0 |
