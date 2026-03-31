-- Migration 034: Email verification codes + optional 2FA
-- Run this in your Supabase SQL Editor

-- ============================================================
-- 1. Verification codes table (for signup + 2FA)
-- ============================================================

CREATE TABLE IF NOT EXISTS verification_codes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  code text NOT NULL,
  purpose text NOT NULL CHECK (purpose IN ('signup', '2fa')),
  expires_at timestamptz NOT NULL,
  used boolean DEFAULT false,
  attempts int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_verification_codes_email_purpose
  ON verification_codes (email, purpose, used)
  WHERE used = false;

-- Auto-cleanup: delete expired codes older than 1 hour
-- (Can be run as a cron job or Supabase edge function)

-- ============================================================
-- 2. Add two_factor_enabled to profiles (optional per user)
-- ============================================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS two_factor_enabled boolean DEFAULT false;

-- ============================================================
-- 3. Add email_verified flag to profiles
-- ============================================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_verified boolean DEFAULT false;

-- ============================================================
-- 4. RLS policies for verification_codes
-- ============================================================

ALTER TABLE verification_codes ENABLE ROW LEVEL SECURITY;

-- Only the backend (service role) can read/write verification codes
-- No direct client access
DROP POLICY IF EXISTS "Service role only for verification_codes" ON verification_codes;

CREATE POLICY "Service role only for verification_codes"
  ON verification_codes
  FOR ALL
  USING (false)
  WITH CHECK (false);
