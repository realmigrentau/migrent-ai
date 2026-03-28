-- Migration 033: Legal acceptance tracking + RLS gate
-- Required for AU compliance (ACCC explicit consent)
-- Run this in your Supabase SQL Editor

-- ============================================================
-- 1. Add legal_accepted_at timestamp to profiles
-- ============================================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS legal_accepted_at timestamptz;

-- ============================================================
-- 2. RLS policy - block listing creation if not legally accepted
-- Users must accept terms before they can create listings
-- ============================================================

-- Drop existing policy if it exists (safe to re-run)
DROP POLICY IF EXISTS "Users must accept legal terms to create listings" ON listings;

CREATE POLICY "Users must accept legal terms to create listings"
  ON listings
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.legal_accepted_at IS NOT NULL
    )
  );

-- Drop existing policy if it exists (safe to re-run)
DROP POLICY IF EXISTS "Users must accept legal terms to create bookings" ON bookings;

CREATE POLICY "Users must accept legal terms to create bookings"
  ON bookings
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.legal_accepted_at IS NOT NULL
    )
  );

-- ============================================================
-- 3. Function to set legal_accepted_at from user_metadata
-- This auto-populates when a new user signs up with consent
-- ============================================================

CREATE OR REPLACE FUNCTION public.sync_legal_acceptance()
RETURNS trigger AS $$
BEGIN
  -- If legal_accepted_at is being set for the first time
  IF NEW.legal_accepted_at IS NOT NULL AND (OLD.legal_accepted_at IS NULL OR OLD IS NULL) THEN
    -- Already being set directly, nothing to do
    RETURN NEW;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 4. Index for faster RLS policy checks
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_profiles_legal_accepted
  ON profiles (id)
  WHERE legal_accepted_at IS NOT NULL;
