-- Migration 016: Add onboarding address fields
-- Adds suburb_city and nearest_station columns to profiles table

-- Add new columns for the redesigned onboarding
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS suburb_city TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS nearest_station TEXT;

-- Add index on suburb_city for lookups
CREATE INDEX IF NOT EXISTS idx_profiles_suburb_city ON profiles (suburb_city);

COMMENT ON COLUMN profiles.suburb_city IS 'Format: Suburb/City e.g. Kellyville/Sydney';
COMMENT ON COLUMN profiles.nearest_station IS 'Auto-populated nearest train station';
