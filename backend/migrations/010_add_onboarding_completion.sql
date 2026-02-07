-- Migration: 010_add_onboarding_completion.sql
-- Adds onboarding completion tracking to profiles table

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMP DEFAULT NULL;

-- Create index for faster onboarding status queries
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_completed ON profiles(onboarding_completed);
