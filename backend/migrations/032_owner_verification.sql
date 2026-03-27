-- Migration 032: Owner Verification System
-- 3-step verification: Email (existing) + Phone OTP + Government ID upload
-- Only fully verified owners can list rooms.
-- Run this in Supabase SQL Editor.

-- ─── 1. Owner verification profiles table ────────────────────────
CREATE TABLE IF NOT EXISTS owner_verification (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Step 1: Email (already handled by Supabase Auth - we just read it)
  email_verified boolean NOT NULL DEFAULT false,

  -- Step 2: Phone OTP
  phone text,
  phone_verified boolean NOT NULL DEFAULT false,
  phone_otp_code text,            -- hashed 6-digit code
  phone_otp_expires_at timestamptz,
  phone_verified_at timestamptz,

  -- Step 3: Government ID
  id_document_type text CHECK (id_document_type IN ('passport', 'drivers_licence', 'visa', 'national_id')),
  id_file_path text,              -- path in Supabase Storage (private bucket)
  id_status text NOT NULL DEFAULT 'not_submitted' CHECK (id_status IN ('not_submitted', 'pending', 'approved', 'rejected')),
  id_rejection_reason text,
  id_submitted_at timestamptz,
  id_reviewed_at timestamptz,
  id_reviewed_by uuid,            -- admin who reviewed

  -- Overall
  fully_verified boolean NOT NULL DEFAULT false,  -- true when all 3 steps done
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  UNIQUE(user_id)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_owner_verification_user ON owner_verification(user_id);
CREATE INDEX IF NOT EXISTS idx_owner_verification_status ON owner_verification(id_status);
CREATE INDEX IF NOT EXISTS idx_owner_verification_fully ON owner_verification(fully_verified);

-- ─── 2. RLS Policies ─────────────────────────────────────────────
ALTER TABLE owner_verification ENABLE ROW LEVEL SECURITY;

-- Owners can read their own verification record
CREATE POLICY "Users can read own verification"
  ON owner_verification FOR SELECT
  USING (auth.uid() = user_id);

-- Owners can insert their own record
CREATE POLICY "Users can insert own verification"
  ON owner_verification FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Owners can update their own record (phone, id upload)
CREATE POLICY "Users can update own verification"
  ON owner_verification FOR UPDATE
  USING (auth.uid() = user_id);

-- Service role (backend) bypasses RLS automatically

-- ─── 3. Private storage bucket for ID documents ──────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('owner-id-docs', 'owner-id-docs', false)
ON CONFLICT (id) DO NOTHING;

-- Only the owner can upload to their own folder
CREATE POLICY "Owners upload own ID docs"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'owner-id-docs'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Only the owner can read their own docs
CREATE POLICY "Owners read own ID docs"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'owner-id-docs'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Admins read all ID docs (via service role - no policy needed, bypasses RLS)

-- ─── 4. Auto-update updated_at ───────────────────────────────────
CREATE OR REPLACE FUNCTION update_owner_verification_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER owner_verification_updated_at
  BEFORE UPDATE ON owner_verification
  FOR EACH ROW
  EXECUTE FUNCTION update_owner_verification_updated_at();
