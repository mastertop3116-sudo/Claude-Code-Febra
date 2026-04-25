-- ============================================================
-- NEXUS — Supabase Schema
-- Execute no SQL Editor do Supabase
-- ============================================================

-- Produtos digitais cadastrados
create table if not exists produtos (
  id            uuid primary key default gen_random_uuid(),
  telegram_id   text,
  nome          text not null,
  tipo          text default 'entregavel digital',
  nicho         text,
  publico_alvo  text,
  beneficio_principal text,
  preco         text,
  descricao     text,
  created_at    timestamptz default now()
);

-- Lançamentos (campanhas por produto)
create table if not exists lancamentos (
  id              uuid primary key default gen_random_uuid(),
  produto_id      uuid references produtos(id),
  telegram_id     text,
  nome            text,
  insights        jsonb,          -- resultado do estrategista/arquiteto
  relatorio_texto text,           -- texto bruto do relatório de mercado enviado
  status          text default 'ativo',
  created_at      timestamptz default now()
);

-- Criativos gerados (roteiros, entregáveis, carrosseis)
create table if not exists criativos (
  id            uuid primary key default gen_random_uuid(),
  tipo          text not null,    -- 'roteiro' | 'entregavel' | 'carrossel'
  produto_id    uuid references produtos(id),
  lancamento_id uuid references lancamentos(id),
  telegram_id   text,
  plataforma    text,
  modo          text,
  roteiro       jsonb,
  edicao        jsonb,
  created_at    timestamptz default now()
);

-- Índices para buscas comuns
create index if not exists idx_produtos_telegram on produtos(telegram_id);
create index if not exists idx_lancamentos_produto on lancamentos(produto_id);
create index if not exists idx_criativos_produto on criativos(produto_id);
create index if not exists idx_criativos_lancamento on criativos(lancamento_id);
create index if not exists idx_criativos_tipo on criativos(tipo);
