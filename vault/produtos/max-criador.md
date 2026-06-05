# MAX Criador — Gerador Unificado de Entregáveis

**Status:** ✅ Live em produção  
**URL:** https://claude-code-febra.onrender.com/criador  
**Dashboard:** Sidebar → ✨ MAX Criador

---

## O que é

Produto unificado que combina geração de conteúdo (GPT-4o) + renderização de PDF (Puppeteer) em um único fluxo. O usuário descreve o que quer, o sistema entrega um PDF pronto para vender — em qualquer nicho.

## Tipos de produto suportados

| Tipo | Descrição |
|------|-----------|
| E-book | Livro digital com capítulos + pontos-chave + citações |
| Workbook | Módulos com teoria + exercícios com linhas de resposta |
| Guia | Passo a passo detalhado com ações práticas + dicas |
| Checklist | Seções com itens de verificação checkboxes |
| Desafio | 3 semanas × 7 dias com tarefa + afirmação diária |
| Planner | Seções com campos + rituais matinal/noturno/semanal |
| Devocional | 7 dias versículo + reflexão + perguntas + oração |
| Script VSL | 8 blocos persuasivos (gancho → oferta → CTA) |

## Arquitetura técnica

```
criador.html (wizard 3 passos)
    → POST /api/criador/iniciar
    → criador_engine.js
        → GPT-4o (gpt-4o, response_format: json_object)
        → Puppeteer → criador-universal/index.html
        → PDF Buffer
    → SSE /api/criador/progresso/:jobId
    → GET /api/criador/resultado/:jobId (PDF base64)
```

## Arquivos

| Arquivo | Função |
|---------|--------|
| `departments/creative/engines/criador_engine.js` | Motor principal (IA + Puppeteer) |
| `departments/creative/templates/criador-universal/index.html` | Template PDF premium (Playfair Display + Lato) |
| `public/criador.html` | UI wizard — 3 passos |
| `supabase/criador_schema.sql` | Tabelas `entregas` + `erros_sistema` |
| Rotas em `server.js` | `/criador`, `/api/criador/*` |

## Banco de dados (Supabase)

- **`entregas`** — registro de cada produto gerado (tipo, nicho, publico, titulo, status, conteudo JSON)
- **`erros_sistema`** — todo erro salvo com solução automática detectada (timeout, JSON malformado, Puppeteer, OpenAI, Supabase)

## Design do PDF

- Fontes: Playfair Display (títulos/citações) + Lato (corpo)
- Capa: gradiente escuro + título grande + badge de tipo
- Páginas de conteúdo: header colorido + número grande + body justificado
- Pull quotes, pontos-chave, caixas de dica, linhas de exercício, checkboxes
- Rodapé: autor + número de página
- Contracapa: fundo escuro com gradiente

## Testes realizados (2026-05-27)

- ✅ Checklist "produtividade empreendedores" → 764 KB
- ✅ E-book "educação financeira iniciantes" → 1 MB
- ✅ Tabelas Supabase criadas e gravando
- ✅ Erros com solução automática salvos no banco

## Parâmetros de geração

| Parâmetro | Opções |
|-----------|--------|
| `tom` | conversacional · inspirador · educativo · profissional |
| `extensao` | curto (5-6) · médio (7-9) · longo (10-12) |

## Próximas melhorias possíveis

- Preview do PDF antes do download
- Re-download de gerações anteriores via histórico
- Modo "marca própria" (logo + cores customizadas)
- Novos tipos: roteiro email, proposta comercial, mini-curso
