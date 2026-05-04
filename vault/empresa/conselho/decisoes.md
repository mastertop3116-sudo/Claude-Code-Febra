# Decisões do Conselho Estratégico

> Toda decisão importante passa pelo Conselho antes de ir ao Presidente.
> Formato: Data · Decisão · Análise dos 4 · Veredito · Status.

---

## Como funciona

```
1. MAX apresenta a decisão ao Conselho
2. Cada conselheiro analisa pelo seu framework
3. MAX consolida o veredito final
4. Presidente aprova ou veta
5. Decisão registrada aqui com status
```

**Comando Telegram:** `/conselho [decisão]`

---

## Modelo de registro

```markdown
### [DATA] — [TÍTULO DA DECISÃO]

**Contexto:** [o que está sendo decidido]

**Musk:** [análise + recomendação]
**Bezos:** [análise + recomendação]  
**Hang:** [análise + recomendação]
**Paulo Vieira:** [análise + recomendação]

**Veredito MAX:** [decisão consolidada]
**Presidente:** ✅ Aprovado / ❌ Vetado / 🔄 Revisão necessária
**Status:** Executado / Aguardando / Cancelado
```

---

## Decisões registradas

### 2026-04-22 — Arquitetura do sistema de agentes

**Contexto:** Como estruturar Claude e Gemini dentro do MAX?

**Veredito:** Nexus Core Agent trata Claude/Gemini como módulos intercambiáveis. MAX orquestra, agentes executam.

**Presidente:** ✅ Aprovado
**Status:** ✅ Executado — GPT-4o Mini como motor principal, Claude via /claude

---

### 2026-04-22 — Integração UTMify

**Contexto:** Sincronização manual ou automática dos dados de tráfego?

**Veredito:** Eliminar sync manual. Integração direta via API key + cache no Supabase.

**Presidente:** ✅ Aprovado
**Status:** ✅ Executado

---

### 2026-05-01 — Otimização radical de tokens

**Contexto:** Custo crescente com Gemini/OpenAI nas gerações de conteúdo.

**Musk:** Eliminar desperdício. Tokens são recursos. Otimize ou mate o processo.
**Bezos:** Medir primeiro. Qual geração custa mais? Atacar o maior custo.
**Veredito:** Flash em todos os agentes, histórico 10→5, aprendizados 5→3. Meta -80% custo.

**Presidente:** ✅ Aprovado
**Status:** ✅ Executado — estimativa -80% custo Gemini, +60% throughput

---

### 2026-05-04 — Sistema de memória persistente (Obsidian)

**Contexto:** Como dar continuidade de contexto entre sessões de Claude Code?

**Veredito:** Vault Obsidian como segunda memória. SYSTEM.md → MASTER.md → RESUMO.md como protocolo de leitura.

**Presidente:** ✅ Aprovado
**Status:** ✅ Executado — vault em C:\Users\Rodrigo Cruz\Documents\Obsidian Vault

---

## Próximas decisões pendentes

| Decisão | Urgência | Status |
|---------|---------|--------|
| Pipeline UTMify → produto automático (arquitetura) | Alta | 📋 Aguardando conselho |
| DALL-E 3 vs alternativa para imagens de criativos | Média | 📋 Aguardando conselho |
| Escalar BIDCAP ou diversificar portfólio primeiro? | Alta | 📋 Aguardando conselho |
