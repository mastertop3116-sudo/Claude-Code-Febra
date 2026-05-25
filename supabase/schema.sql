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

-- ============================================================
-- PlanIA Desplugado — Gerador de Planos de Aula BNCC
-- ============================================================

-- Acessos comprados (token = código de acesso)
create table if not exists plania_acessos (
  id             uuid primary key default gen_random_uuid(),
  token          text unique not null,
  email          text,
  tipo           text default '30dias', -- '30dias' | 'vitalicio'
  planos_gerados int  default 0,
  expira_em      timestamptz,           -- null = vitalício
  created_at     timestamptz default now()
);

create index if not exists idx_plania_token on plania_acessos(token);

-- Planos gerados (histórico por acesso)
create table if not exists plania_planos (
  id         uuid primary key default gen_random_uuid(),
  acesso_id  uuid references plania_acessos(id),
  serie      text,
  componente text,
  tema       text,
  duracao    text,
  plano      jsonb not null,
  created_at timestamptz default now()
);

create index if not exists idx_plania_planos_acesso on plania_planos(acesso_id);

-- Função RPC para incrementar planos_gerados com segurança
create or replace function plania_incrementar_planos(acesso_id uuid)
returns void language sql as $$
  update plania_acessos set planos_gerados = planos_gerados + 1 where id = acesso_id;
$$;

-- ============================================================

-- Índices para buscas comuns
create index if not exists idx_produtos_telegram on produtos(telegram_id);
create index if not exists idx_lancamentos_produto on lancamentos(produto_id);
create index if not exists idx_criativos_produto on criativos(produto_id);
create index if not exists idx_criativos_lancamento on criativos(lancamento_id);
create index if not exists idx_criativos_tipo on criativos(tipo);

-- Conversas do Dashboard (setores, conselho, histórico)
create table if not exists dashboard_conversations (
  id            uuid primary key default gen_random_uuid(),
  session_id    text not null,
  sector        text not null,
  role          text not null,
  content       text not null,
  created_at    timestamptz default now()
);

create index if not exists idx_dash_conv_session on dashboard_conversations(session_id, sector);
create index if not exists idx_dash_conv_created on dashboard_conversations(created_at);
