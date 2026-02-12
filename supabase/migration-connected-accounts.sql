-- Migration: Connected Accounts
-- User-auth model — each user connects their own platform accounts
-- Run this in Supabase SQL Editor

-- ============================================
-- CONNECTED ACCOUNTS
-- ============================================
CREATE TABLE IF NOT EXISTS connected_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_id TEXT NOT NULL, -- 'beatport', 'traxsource', 'inflyte', 'trackstack'
  status TEXT NOT NULL DEFAULT 'connected' CHECK (status IN ('connected', 'expired', 'error')),
  credentials_encrypted TEXT NOT NULL, -- AES-256 encrypted JSON (tokens or email/pass)
  last_sync_at TIMESTAMPTZ,
  last_error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- One connection per user per source
  UNIQUE(user_id, source_id)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_connected_accounts_user ON connected_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_connected_accounts_source ON connected_accounts(source_id);

-- RLS: users can only see their own connections
ALTER TABLE connected_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own connections"
  ON connected_accounts FOR SELECT
  USING (auth.uid() = user_id);

-- Service role handles inserts/updates/deletes (via server actions)
-- No direct client-side writes allowed

-- Also add source column values to tracks table if not present
-- (tracks may come from any connected source)
DO $$
BEGIN
  -- Ensure tracks table accepts new source types
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tracks' AND column_name = 'source') THEN
    -- Drop the old check constraint if it exists and recreate with new values
    ALTER TABLE tracks DROP CONSTRAINT IF EXISTS tracks_source_check;
    ALTER TABLE tracks ADD CONSTRAINT tracks_source_check
      CHECK (source IN ('beatport', 'traxsource', 'inflyte', 'trackstack', 'trackscout', 'promo'));
  END IF;
END
$$;

-- Update users table to support 'elite' tier
DO $$
BEGIN
  ALTER TABLE users DROP CONSTRAINT IF EXISTS users_tier_check;
  ALTER TABLE users ADD CONSTRAINT users_tier_check
    CHECK (tier IN ('free', 'basic', 'pro', 'elite'));
EXCEPTION WHEN OTHERS THEN
  NULL;
END
$$;
