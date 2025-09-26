-- Enable extensions (Neon supports these)
create extension if not exists vector;
create extension if not exists pgcrypto;

-- Bots (config)
create table if not exists bots (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  system_prompt text not null default '',
  model text not null default 'llama-3.1-8b-instant',
  temperature real not null default 0.7,
  max_output integer not null default 512,
  profile_image_url text,
  chat_icon text default 'bot',          -- 'bot' | 'human' | 'logo'
  placeholder text default '',
  use_words text[] default '{}',
  avoid_words text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Knowledge docs
create table if not exists kb_docs (
  id uuid primary key default gen_random_uuid(),
  bot_id uuid not null references bots(id) on delete cascade,
  name text not null,
  created_at timestamptz default now()
);

-- Knowledge chunks (768 dims for bge-base)
create table if not exists kb_chunks (
  id bigserial primary key,
  doc_id uuid not null references kb_docs(id) on delete cascade,
  bot_id uuid not null references bots(id) on delete cascade,
  chunk text not null,
  embedding vector(768) not null
);

-- Add index for faster similarity searches (if using vector)
create index if not exists kb_chunks_embedding_idx on kb_chunks using hnsw (embedding vector_cosine_ops);

-- Actions (webhooks etc.)
create table if not exists actions (
  id uuid primary key default gen_random_uuid(),
  bot_id uuid not null references bots(id) on delete cascade,
  kind text not null,          -- 'webhook' | 'ghl' | ...
  config jsonb not null default '{}'::jsonb
);