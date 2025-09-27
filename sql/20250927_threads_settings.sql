-- Enable UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Conversation threads
CREATE TABLE IF NOT EXISTS threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  title TEXT,
  archived BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_threads_user_time ON threads (user_id, updated_at DESC);

-- Messages in a thread
CREATE TABLE IF NOT EXISTS messages (
  id BIGSERIAL PRIMARY KEY,
  thread_id UUID NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('system','user','assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_messages_thread_time ON messages (thread_id, created_at ASC);

-- Per-user studio settings
CREATE TABLE IF NOT EXISTS studio_settings (
  user_id TEXT PRIMARY KEY,
  studio_name TEXT,
  profile_image_url TEXT,
  language TEXT DEFAULT 'en',
  mail_handler TEXT,
  collect_history BOOLEAN NOT NULL DEFAULT TRUE,
  custom_domain TEXT,
  code_header TEXT,
  code_footer TEXT,
  code_confirm_header TEXT,
  code_confirm_footer TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
