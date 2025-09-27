-- ===== Integrations (placeholders – OAuth can come later) =====
CREATE TABLE IF NOT EXISTS notion_tokens (
  user_id TEXT PRIMARY KEY,
  workspace_name TEXT,
  access_token TEXT,
  connected_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS google_tokens (
  user_id TEXT PRIMARY KEY,
  account_email TEXT,
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ,
  connected_at TIMESTAMPTZ DEFAULT now()
);

-- ===== Knowledge: files + tool mapping =====
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS knowledge_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  title TEXT,
  source_type TEXT CHECK (source_type IN ('upload','url','notion_page','notion_db','gdrive')) NOT NULL,
  source_url TEXT,
  mime TEXT,
  size_bytes INTEGER DEFAULT 0,
  chunks INTEGER DEFAULT 0,
  enable_citations BOOLEAN NOT NULL DEFAULT FALSE,
  content TEXT, -- optional: small text uploads / pasted snippets
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_kf_user_time ON knowledge_files(user_id, uploaded_at DESC);

-- File -> Tool mapping (tool_key is free-form; you can later point it to a real tools table)
CREATE TABLE IF NOT EXISTS knowledge_file_tools (
  file_id UUID NOT NULL REFERENCES knowledge_files(id) ON DELETE CASCADE,
  tool_key TEXT NOT NULL,
  PRIMARY KEY(file_id, tool_key)
);

-- ===== Users data =====
-- Optional user profile & credits; id is your NextAuth user id (email in your current setup)
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id TEXT PRIMARY KEY,
  name TEXT,
  image TEXT,
  plan TEXT DEFAULT 'starter',
  spent_cents INTEGER DEFAULT 0,
  remaining_credits INTEGER DEFAULT 0,
  current_uses INTEGER DEFAULT 0,
  extra_uses INTEGER DEFAULT 0,
  active_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User memories / instructions (Admin -> Users -> "User Memory" tab)
CREATE TABLE IF NOT EXISTS user_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  goal TEXT,
  prompt TEXT,
  mode TEXT CHECK (mode IN ('inactive','collect','collect_use','collect_use_display')) NOT NULL DEFAULT 'inactive',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Optional: feedback table (counts show in Manage Users)
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  thread_id UUID,
  rating INTEGER,
  text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
