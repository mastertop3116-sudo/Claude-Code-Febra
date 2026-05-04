# MASTER — Nexus Digital Holding

> Fonte de verdade estrutural. Estado atual → [[estado_atual]]. Resumo rápido → [[RESUMO]]. Técnico → [[tecnologia/arquitetura]].

---

## Empresa

| Campo | Valor |
|-------|-------|
| Nome | Nexus Digital Holding |
| Sócios | Rodrigo Cruz + sócio |
| Meta empresa | Valuation US$1 bilhão |
| Meta Rodrigo | R$10k/mês recorrente → sair do CLT |
| Modelo | Fábrica de infoprodutos low-ticket com IA · Meta Ads · GG Checkout |

---

## Stack técnica (CORRIGIDA)

| Camada | Tecnologia |
|--------|------------|
| Backend | Node.js + Express 5 (Render) |
| Interface | Telegram Bot (webhook prod / polling local) |
| **IA principal** | **OpenAI GPT-4o Mini** — MAX + todos os agentes + Forge |
| IA Claude | Anthropic claude-sonnet-4-6 — **somente /claude no Telegram** |
| Gemini | `gemini.js` é shim — **redireciona para OpenAI** |
| Apresentações | Gamma API (PDF/slides premium) |
| Banco de dados | Supabase — produtos, conversas, memórias, criativos |
| Analytics | UTMify (MCP → cache Supabase) |
| Pagamentos | GG Checkout (webhook) |
| Deploy | Render (main branch = auto-deploy) |
| Repo | https://github.com/mastertop3116-sudo/Claude-Code-Febra |
| App | https://claude-code-febra.onrender.com |

> ⚠️ gemini.js NÃO usa Gemini — é wrapper de compatibilidade para openai.js

---

## Agentes ativos

| Agente | Arquivo | Função |
|--------|---------|--------|
| MAX | core/max.js | Orquestrador Telegram (GPT-4o Mini) |
| Conselho de Titãs | core/max.js | 4 personas estratégicas |
| Estrategista | agents/estrategista.js | Pesquisa de mercado |
| Arquiteto | agents/arquiteto.js | Estrutura de conteúdo |
| Copywriter | agents/copywriter.js | Copy e conversão |
| Roteirista | agents/roteirista.js | Roteiros de vídeo |
| Editor | agents/editor.js | Instruções de edição |
| Carrossel | agents/carrossel.js | Slides sociais |

---

## Comandos Telegram

`/criar` `/criar-web` `/roteiro` `/produtos` `/financeiro` `/conselho` `/mentor` `/pesquisa` `/copy` `/url` `/yt` `/metas` `/tarefas` `/report` `/claude` `/status`

---

## Nexus Forge — Modos de operação

| Modo (body.mode) | Função | Endpoint |
|------------------|--------|----------|
| `ent` | Infoprodutos (ebook/workbook/etc.) | POST /api/criar |
| `car` | Carrossel de slides | POST /api/carousel |
| `cri` | Criativo para Meta Ads | (integrado) |
| `conv` | Converter PDF↔DOCX | POST /api/convert |

---

## Temas visuais do Forge

| Key | Nome | Nicho |
|-----|------|-------|
| `impacto` | Impacto & Ação | Jiu-Jitsu, Fitness, Vendas |
| `elegancia` | Elegância & Harmonia | Ballet, Bem-estar feminino |
| `sabedoria` | Sabedoria & Tradição | Pack Bíblico, Espiritualidade |
| `produtividade` | Produtividade & Foco | Gestão, Finanças |
| `bemestar` | Bem-estar & Leveza | Meditação, Yoga, Saúde |
| `criatividade` | Criatividade & Inovação | Marketing, Design |

---

## Produtos ativos

| Produto | UTMify ID | Meta CA |
|---------|-----------|---------|
| BIDCAP (Jiu-Jitsu infantil) | 682e5acce4e4e7748bb669ae | CA01: 944536140536242 |
| TESTE BM (Ballet) | 69685cb9af5f797b4a89f7db | CA05: 926582643329275 |
| 5D (Pack Bíblico) | 69c1e3332cc7808546f6e544 | CA04 TESTE: 1331300275504489 |

---

## Funil padrão

```
Produto principal: R$17–R$47
  └── Order Bump: R$7–R$17
       └── Upsell 1: R$47–R$97
            └── Upsell 2: R$97–R$197
```

---

## Decisões estratégicas consolidadas

1. MAX usa GPT-4o Mini como motor (Claude/Gemini são módulos secondários)
2. UTMify integração via API MCP + cache Supabase
3. Guardrails: agente só promete o que pode entregar
4. Módulo DISC planejado: adaptar comunicação por perfil
5. Data warehouse: CAC/LTV por campanha em tempo real

---

*Atualizar apenas quando houver mudança estrutural.*
