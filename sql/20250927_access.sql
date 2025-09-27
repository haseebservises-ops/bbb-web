-- ACCESS-related fields on studio_settings
ALTER TABLE studio_settings
  ADD COLUMN IF NOT EXISTS site_visibility TEXT CHECK (site_visibility IN ('public','private')) DEFAULT 'public',
  ADD COLUMN IF NOT EXISTS stripe_account_id TEXT,
  ADD COLUMN IF NOT EXISTS collect_tax_id BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS collect_billing_address BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS upgrade_target TEXT CHECK (upgrade_target IN ('none','pricing','home','external')) DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS upgrade_link_text TEXT,
  ADD COLUMN IF NOT EXISTS upgrade_custom_message TEXT,
  ADD COLUMN IF NOT EXISTS upgrade_external_url TEXT,
  ADD COLUMN IF NOT EXISTS denied_title TEXT,
  ADD COLUMN IF NOT EXISTS denied_body TEXT,
  ADD COLUMN IF NOT EXISTS guests_free_credits INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS guests_tools_scope TEXT CHECK (guests_tools_scope IN ('unlocked','all')) DEFAULT 'unlocked',
  ADD COLUMN IF NOT EXISTS login_email_password BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS login_google BOOLEAN DEFAULT FALSE;

-- Optional: simple products table if you don't have one yet
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  price_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_products_user ON products(user_id, active, name);
