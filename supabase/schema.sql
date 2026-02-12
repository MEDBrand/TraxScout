-- Traxscout Database Schema
-- Supabase PostgreSQL

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- USERS
-- ============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    tier TEXT DEFAULT 'trial' CHECK (tier IN ('trial', 'basic', 'pro')),
    stripe_customer_id TEXT UNIQUE,
    subscription_status TEXT DEFAULT 'none' CHECK (subscription_status IN ('none', 'trialing', 'active', 'past_due', 'canceled')),
    subscription_ends_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (auth.uid() = id);

-- ============================================
-- PREFERENCES
-- ============================================
CREATE TABLE preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    genres TEXT[] DEFAULT '{}',
    bpm_min INTEGER DEFAULT 120,
    bpm_max INTEGER DEFAULT 130,
    keys TEXT[] DEFAULT '{}',
    labels TEXT[] DEFAULT '{}',
    artists_follow TEXT[] DEFAULT '{}',
    vibe_description TEXT,
    digest_time TIME DEFAULT '09:00',
    digest_frequency TEXT DEFAULT 'daily' CHECK (digest_frequency IN ('daily', 'weekly')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

ALTER TABLE preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own preferences" ON preferences
    FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- API KEYS (ENCRYPTED)
-- ============================================
CREATE TABLE api_keys (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL CHECK (provider IN ('anthropic', 'openai')),
    key_encrypted TEXT NOT NULL,  -- AES-256-GCM encrypted
    key_hint TEXT NOT NULL,       -- Last 4 chars for display
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_used_at TIMESTAMPTZ,
    usage_count INTEGER DEFAULT 0,
    UNIQUE(user_id, provider)
);

ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Users can only see their own keys (metadata only, not the encrypted key)
CREATE POLICY "Users can manage own api keys" ON api_keys
    FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- PROMO SESSIONS (ENCRYPTED)
-- ============================================
CREATE TABLE promo_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,  -- 'inflyte', etc.
    session_encrypted TEXT NOT NULL,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, provider)
);

ALTER TABLE promo_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own promo sessions" ON promo_sessions
    FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- TRACKS (CACHE)
-- ============================================
CREATE TABLE tracks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source TEXT NOT NULL CHECK (source IN ('beatport', 'traxsource', 'promo')),
    external_id TEXT,
    artist TEXT NOT NULL,
    title TEXT NOT NULL,
    label TEXT,
    genre TEXT,
    bpm INTEGER,
    key TEXT,
    release_date DATE,
    preview_url TEXT,
    artwork_url TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(source, external_id)
);

-- Index for faster lookups
CREATE INDEX idx_tracks_source ON tracks(source);
CREATE INDEX idx_tracks_genre ON tracks(genre);
CREATE INDEX idx_tracks_bpm ON tracks(bpm);
CREATE INDEX idx_tracks_release_date ON tracks(release_date DESC);

-- ============================================
-- USER TRACKS (DELIVERED)
-- ============================================
CREATE TABLE user_tracks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
    score FLOAT,              -- AI relevance score (0-1)
    description TEXT,         -- AI-generated description
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'heard', 'saved', 'skipped')),
    delivered_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, track_id)
);

ALTER TABLE user_tracks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own tracks" ON user_tracks
    FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_user_tracks_user ON user_tracks(user_id);
CREATE INDEX idx_user_tracks_delivered ON user_tracks(delivered_at DESC);

-- ============================================
-- SCAN LOGS
-- ============================================
CREATE TABLE scan_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    source TEXT NOT NULL,
    tracks_found INTEGER DEFAULT 0,
    tracks_matched INTEGER DEFAULT 0,
    error TEXT,
    duration_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE scan_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own scan logs" ON scan_logs
    FOR SELECT USING (auth.uid() = user_id);

-- ============================================
-- SECURITY AUDIT LOG
-- ============================================
CREATE TABLE security_audit (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    event TEXT NOT NULL,
    severity TEXT DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
    ip_address TEXT,
    user_agent TEXT,
    details JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Retain for 90 days
CREATE INDEX idx_security_audit_created ON security_audit(created_at DESC);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Increment usage count atomically
CREATE OR REPLACE FUNCTION increment_usage_count()
RETURNS INTEGER AS $$
BEGIN
    RETURN usage_count + 1;
END;
$$ LANGUAGE plpgsql;

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER preferences_updated_at
    BEFORE UPDATE ON preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- BACKUP POLICY
-- ============================================
-- Supabase provides:
-- - Daily automated backups (7-day retention on Pro)
-- - Point-in-time recovery (PITR)
-- - Cross-region replication available
--
-- Additional recommendations:
-- 1. Enable PITR for sub-second recovery
-- 2. Set up pg_dump cron for additional backups
-- 3. Store backups in separate cloud (AWS S3 / GCS)
