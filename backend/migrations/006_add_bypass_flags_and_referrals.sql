-- Migration 006: Add bypass detection flags and referral codes
-- Run this in your Supabase SQL Editor

-- ============================================================
-- 1. BYPASS FLAGS TABLE — tracks suspicious deal cancellations
-- ============================================================

CREATE TABLE IF NOT EXISTS bypass_flags (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id uuid REFERENCES deals(id),
  flagged_user_id uuid NOT NULL,
  owner_id uuid NOT NULL,
  seeker_id uuid NOT NULL,
  reason text,
  reviewed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bypass_flags_user ON bypass_flags(flagged_user_id);
CREATE INDEX IF NOT EXISTS idx_bypass_flags_deal ON bypass_flags(deal_id);

-- ============================================================
-- 2. REFERRALS TABLE — referral code tracking
-- ============================================================

CREATE TABLE IF NOT EXISTS referrals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id uuid NOT NULL,
  referral_code text UNIQUE NOT NULL,
  referred_user_id uuid,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'signed_up', 'verified', 'rewarded')),
  reward_type text DEFAULT 'free_verification',
  created_at timestamptz DEFAULT now(),
  used_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);

-- ============================================================
-- 3. PAYMENT EVENTS TABLE — if not already created
-- ============================================================

CREATE TABLE IF NOT EXISTS payment_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id uuid,
  fee_type text,
  stripe_session_id text,
  amount int,
  currency text DEFAULT 'aud',
  event_type text,
  created_at timestamptz DEFAULT now()
);
