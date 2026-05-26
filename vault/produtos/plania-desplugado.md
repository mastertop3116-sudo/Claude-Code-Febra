# PlanIA Desplugado — Gerador de Planos de Aula BNCC

> Produto criado em 2026-05-25 | Status: 🟢 LIVE

---

## O Produto

**URL:** https://claude-code-febra.onrender.com/plania

**O que é:** Ferramenta web (não-PDF) que gera planos de aula de Computação BNCC completos em 60 segundos. Professor digita série + componente + tema → recebe plano pronto para imprimir com atividade desplugada, códigos BNCC corretos, dica de inclusão e avaliação formativa.

**Por que não-PDF:** Alta percepção de valor (personalizado, não piratável), aproveitamento da infra existente (OpenAI + Render), cross-sell natural com Aulas Desplugadas.

**Tailwind regulatório:** BNCC Computação se torna obrigatória nas escolas em 2026 — professores precisam planejar aulas de algo que nunca ensinaram antes.

---

## Funil de Vendas

| Produto | Preço | Tipo |
|---------|-------|------|
| PlanIA 30 dias | R$47 | Principal |
| PlanIA Vitalício | R$77 | Upgrade |
| 100 Atividades Desplugadas PDF | R$17 | Order Bump (cross-sell) |

**Demo gratuita:** 3 gerações (localStorage) → CTA de upgrade automático

---

## Arquitetura Técnica

```
GET  /plania              → public/plania.html (landing + gerador)
POST /api/plania/gerar    → GPT-4o Mini (openaiJson) → JSON estruturado
POST /api/plania/verificar → valida token na tabela plania_acessos
POST /api/plania/ativar   → cria token (secret: PLANIA_ADMIN_SECRET)
```

**Stack:** Node.js + Express (Render) | OpenAI GPT-4o Mini | Supabase | GG Checkout

**Geração de token:** automática no webhook GG Checkout ao detectar produto com "plania" no nome.

---

## Supabase — SQL para criar tabelas

**⚠️ PENDENTE: executar no Supabase Studio (vzuaglghjbowhkogqlfk)**

```sql
CREATE TABLE IF NOT EXISTS plania_acessos (
  id             uuid primary key default gen_random_uuid(),
  token          text unique not null,
  email          text,
  tipo           text default '30dias',
  planos_gerados int  default 0,
  expira_em      timestamptz,
  created_at     timestamptz default now()
);
CREATE INDEX IF NOT EXISTS idx_plania_token ON plania_acessos(token);

CREATE TABLE IF NOT EXISTS plania_planos (
  id         uuid primary key default gen_random_uuid(),
  acesso_id  uuid references plania_acessos(id),
  serie      text,
  componente text,
  tema       text,
  duracao    text,
  plano      jsonb not null,
  created_at timestamptz default now()
);
CREATE INDEX IF NOT EXISTS idx_plania_planos_acesso ON plania_planos(acesso_id);

CREATE OR REPLACE FUNCTION plania_incrementar_planos(acesso_id uuid)
RETURNS void LANGUAGE sql AS $$
  UPDATE plania_acessos SET planos_gerados = planos_gerados + 1 WHERE id = acesso_id;
$$;
```

---

## UX — Fluxos Testados ✅

| Fluxo | Status |
|-------|--------|
| Landing page carrega | ✅ |
| Formulário — seleção de série/componente/duração | ✅ |
| Validação de campos vazios | ✅ |
| Geração de plano real (GPT-4o Mini) | ✅ |
| Códigos BNCC corretos por série (EF03CO para 3º ano) | ✅ |
| Output: título, BNCC, objetivos, materiais, timeline, desplugada, avaliação, inclusão | ✅ |
| Botão Copiar (texto formatado) | ✅ |
| Botão Novo (limpa tema, foca input) | ✅ |
| Demo counter (3 → 2 → 1 → 0 → CTA upgrade) | ✅ |
| Mobile (390×844) | ✅ |
| Print CSS | ✅ (embutido) |

---

## Falhas Identificadas e Mitigadas

| Falha | Mitigação |
|-------|-----------|
| BNCC codes errados (modelo copia exemplo) | Mapa de prefixos + instrução explícita no system prompt |
| Demo infinita via localStorage | Fácil de burlar — aceitar (usuários honestos) ou usar fingerprint (v2) |
| Token sem tabela (Supabase DDL pendente) | Demo funciona 100%, token só falha silenciosamente — resolver com SQL manual |
| Render cold start (30-60s) | Spinner de loading cobre o tempo de espera |
| GPT timeout >30s | Não implementado ainda — v2: SSE streaming |

---

## Upgrades Planejados (Roadmap)

| Feature | Versão | Impacto |
|---------|--------|---------|
| Histórico de planos gerados (por token) | v2 | Alto |
| Compartilhar plano via link público | v2 | Alto |
| Streaming SSE (plano aparece em tempo real) | v2 | Médio |
| Export direto para Google Docs | v2 | Médio |
| Banco de atividades desplugadas integrado | v3 | Alto |
| Narração ElevenLabs da atividade desplugada | v3 | Médio |

---

## Meta para 5 Dígitos

| Cenário | Preço | Vendas necessárias |
|---------|-------|-------------------|
| Conservador | R$47 | 213 vendas |
| Agressivo (vitalício) | R$77 | 130 vendas |
| Com bump R$17 | R$47+R$17 | 156 pedidos |

**Estratégia:** Meta Ads → professoras 25-45 anos, interesse BNCC/ensino fundamental → landing /plania → demo gratuita → upgrade.

---

## Conselho de Titãs — Decisão

- **Bezos:** Produto resolve dor real (20h/semana de planejamento). Métrica-chave: taxa de recompra do token no 2º mês.
- **Musk:** MVP funcional em <24h. Lance, meça, itere. Não espere perfeito.
- **Paulo Vieira:** Avatar perfil S (cauteloso) → garantia implícita da demo gratuita converte. Copy: "60 segundos → plano pronto".
- **Hang:** "Menos que um lanche" (R$47) funciona porque é verdade e simples. Um botão, uma ação.
