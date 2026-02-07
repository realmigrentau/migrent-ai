-- Migration 012: Add Airbnb-style profile verification and stats fields
-- Run this in Supabase SQL Editor

-- Add verification fields
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verified_date timestamptz;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verification_method text;

-- Add review/rating stats
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS reviews_count integer DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS average_rating numeric(3,2) DEFAULT 0;

-- Add hosting stats
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS months_hosting integer DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS response_rate integer DEFAULT 100;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS response_time text DEFAULT 'within 24h';

-- Add profile extras for the full profile page
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS languages text[] DEFAULT ARRAY['English'];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS work text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_photos text[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS social_twitter text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS social_facebook text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS social_linkedin text;

-- Index on verification status for fast queries
CREATE INDEX IF NOT EXISTS idx_profiles_is_verified ON profiles(is_verified);
