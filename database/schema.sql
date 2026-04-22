-- ============================================
-- NEXUS DIGITAL HOLDING — Schema Supabase
-- Cole este SQL no Supabase > SQL Editor > Run
-- ============================================

-- 1. MEMÓRIA DOS AGENTES
-- Armazena contexto, aprendizados e histórico de cada agente
CREATE TABLE IF NOT EXISTS agent_memory (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent       TEXT NOT NULL,           -- ex: 'MAX', 'growth', 'tech'
  type        TEXT NOT NULL,           -- ex: 'context', 'learning', 'result'
  content     TEXT NOT NULL,
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_agent_memory_agent ON agent_memory(agent);
CREATE INDEX idx_agent_memory_type  ON agent_memory(type);

-- 2. CADERNO PRETO (Metas)
-- Metas financeiras e de negócio monitoradas pelo MAX
CREATE TABLE IF NOT EXISTS caderno_preto (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome        TEXT NOT NULL UNIQUE,    -- ex: 'Faturamento Mensal', 'Leads'
  valor_alvo  NUMERIC NOT NULL,
  valor_atual NUMERIC DEFAULT 0,
  prazo       DATE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TAREFAS DOS DEPARTAMENTOS
-- Fila de trabalho de cada departamento
CREATE TABLE IF NOT EXISTS tasks (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  departamento  TEXT NOT NULL,         -- 'growth', 'creative', 'tech', 'finance', 'research'
  titulo        TEXT NOT NULL,
  descricao     TEXT,
  prioridade    TEXT DEFAULT 'media',  -- 'alta', 'media', 'baixa'
  status        TEXT DEFAULT 'pendente', -- 'pendente', 'em_andamento', 'concluida', 'cancelada'
  resultado     TEXT,                  -- output do agente após conclusão
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tasks_departamento ON tasks(departamento);
CREATE INDEX idx_tasks_status       ON tasks(status);

-- 4. STARK REPORTS (Relatórios financeiros automáticos)
CREATE TABLE IF NOT EXISTS stark_reports (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  receita_bruta NUMERIC DEFAULT 0,
  custos        NUMERIC DEFAULT 0,
  lucro_liquido NUMERIC GENERATED ALWAYS AS (receita_bruta - custos) STORED,
  conversoes    INTEGER DEFAULT 0,
  leads         INTEGER DEFAULT 0,
  notas         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 5. HISTÓRICO DE CONVERSAS (MAX <> Usuário via Telegram)
CREATE TABLE IF NOT EXISTS conversations (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  telegram_id TEXT,
  role        TEXT NOT NULL,           -- 'user' ou 'assistant'
  content     TEXT NOT NULL,
  agent       TEXT DEFAULT 'MAX',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_conversations_telegram ON conversations(telegram_id);

-- ============================================
-- DADOS INICIAIS — Caderno Preto (exemplos)
-- ============================================
INSERT INTO caderno_preto (nome, valor_alvo, prazo) VALUES
  ('Faturamento Mensal (R$)', 10000,  '2025-07-01'),
  ('Leads por Mês',           500,    '2025-07-01'),
  ('Conversão de Vendas (%)', 3,      '2025-07-01'),
  ('Produtos Lançados',       2,      '2025-07-01')
ON CONFLICT (nome) DO NOTHING;
