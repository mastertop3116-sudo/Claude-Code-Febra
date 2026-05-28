-- ============================================================
-- MAX Criador — Schema Supabase
-- Tabelas: entregas + erros_sistema
-- ============================================================

CREATE TABLE IF NOT EXISTS entregas (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo        TEXT        NOT NULL,
  nicho       TEXT,
  publico     TEXT,
  tema        TEXT,
  tom         TEXT        DEFAULT 'conversacional',
  extensao    TEXT        DEFAULT 'medio',
  autor       TEXT,
  titulo      TEXT,
  status      TEXT        DEFAULT 'gerando'
              CHECK (status IN ('gerando', 'pronto', 'erro')),
  paginas     INTEGER,
  parametros  JSONB,
  conteudo    JSONB,
  pdf_url     TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS erros_sistema (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  entrega_id  UUID        REFERENCES entregas(id) ON DELETE SET NULL,
  rota        TEXT,
  mensagem    TEXT        NOT NULL,
  stack       TEXT,
  contexto    JSONB,
  solucao     TEXT,
  resolvido   BOOLEAN     DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Aprendizados do Sistema — padrões, soluções e melhorias
-- ============================================================

CREATE TABLE IF NOT EXISTS aprendizados (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo      TEXT        NOT NULL,
  categoria   TEXT        NOT NULL,  -- 'bug_fix' | 'melhoria' | 'padrao' | 'prompt' | 'template'
  problema    TEXT,                  -- o que estava errado ou o desafio enfrentado
  solucao     TEXT        NOT NULL,  -- o que foi feito / como resolver
  contexto    JSONB,                 -- dados adicionais: arquivo, função, tipo de entregável...
  tags        TEXT[],                -- ex: ['checklist','puppeteer','pdf']
  fonte       TEXT,                  -- 'engine' | 'template' | 'server' | 'manual'
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_aprendizados_categoria ON aprendizados(categoria);
CREATE INDEX IF NOT EXISTS idx_aprendizados_tags      ON aprendizados USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_aprendizados_created   ON aprendizados(created_at DESC);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_entregas_status     ON entregas(status);
CREATE INDEX IF NOT EXISTS idx_entregas_tipo       ON entregas(tipo);
CREATE INDEX IF NOT EXISTS idx_entregas_created    ON entregas(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_erros_entrega_id    ON erros_sistema(entrega_id);
CREATE INDEX IF NOT EXISTS idx_erros_resolvido     ON erros_sistema(resolvido);
CREATE INDEX IF NOT EXISTS idx_erros_created       ON erros_sistema(created_at DESC);
