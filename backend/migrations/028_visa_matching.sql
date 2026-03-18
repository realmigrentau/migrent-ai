-- Migration 028: Visa matching system
-- Adds visa_type to profiles, uni/cbd distance to listings, and seeds university locations

-- Ensure profiles has visa_type column (may already exist as text)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'visa_type'
  ) THEN
    ALTER TABLE profiles ADD COLUMN visa_type text;
  END IF;
END $$;

-- Add uni and CBD distance columns to listings
ALTER TABLE listings ADD COLUMN IF NOT EXISTS uni_distance_km float;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS cbd_distance_km float;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS near_uni boolean DEFAULT false;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS near_cbd boolean DEFAULT false;

-- Create visa_types reference table
CREATE TABLE IF NOT EXISTS visa_types (
  id text PRIMARY KEY,
  name text NOT NULL,
  uni_focus boolean DEFAULT false,
  cbd_focus boolean DEFAULT false,
  flexible boolean DEFAULT false,
  duration_weeks int DEFAULT 52
);

-- Seed visa types
INSERT INTO visa_types (id, name, uni_focus, cbd_focus, flexible, duration_weeks) VALUES
  ('student_500', 'Student Visa 500', true, false, false, 52),
  ('skilled_482', 'Skilled Work 482', false, true, false, 52),
  ('whv_417', 'Working Holiday 417', false, false, true, 26),
  ('graduate_485', 'Graduate 485', true, false, false, 26)
ON CONFLICT (id) DO NOTHING;

-- Create uni_locations reference table for distance calculations
CREATE TABLE IF NOT EXISTS uni_locations (
  id text PRIMARY KEY,
  name text NOT NULL,
  city text NOT NULL DEFAULT 'Sydney',
  latitude float NOT NULL,
  longitude float NOT NULL
);

-- Seed Sydney university locations
INSERT INTO uni_locations (id, name, city, latitude, longitude) VALUES
  ('uts', 'University of Technology Sydney', 'Sydney', -33.882, 151.207),
  ('unsw', 'University of New South Wales', 'Sydney', -33.917, 151.231),
  ('usyd', 'University of Sydney', 'Sydney', -33.888, 151.187),
  ('mq', 'Macquarie University', 'Sydney', -33.774, 151.113),
  ('wsu_parramatta', 'Western Sydney University - Parramatta', 'Sydney', -33.813, 151.003),
  ('uts_insearch', 'UTS Insearch', 'Sydney', -33.880, 151.206)
ON CONFLICT (id) DO NOTHING;

-- Seed Melbourne university locations
INSERT INTO uni_locations (id, name, city, latitude, longitude) VALUES
  ('monash_clayton', 'Monash University - Clayton', 'Melbourne', -37.912, 145.132),
  ('unimelb', 'University of Melbourne', 'Melbourne', -37.798, 144.961),
  ('rmit', 'RMIT University', 'Melbourne', -37.808, 144.963),
  ('deakin_burwood', 'Deakin University - Burwood', 'Melbourne', -37.849, 145.115)
ON CONFLICT (id) DO NOTHING;

-- Sydney CBD reference point: -33.8688, 151.2093
-- Melbourne CBD reference point: -37.8136, 144.9631

-- Update existing listings with uni/cbd distances using Haversine approximation
-- For each listing with lat/lng, compute distance to nearest uni and to CBD
UPDATE listings
SET
  uni_distance_km = (
    SELECT MIN(
      6371 * 2 * ASIN(SQRT(
        POWER(SIN(RADIANS(u.latitude - listings.latitude) / 2), 2) +
        COS(RADIANS(listings.latitude)) * COS(RADIANS(u.latitude)) *
        POWER(SIN(RADIANS(u.longitude - listings.longitude) / 2), 2)
      ))
    )
    FROM uni_locations u
  ),
  cbd_distance_km = LEAST(
    -- Distance to Sydney CBD
    6371 * 2 * ASIN(SQRT(
      POWER(SIN(RADIANS(-33.8688 - listings.latitude) / 2), 2) +
      COS(RADIANS(listings.latitude)) * COS(RADIANS(-33.8688)) *
      POWER(SIN(RADIANS(151.2093 - listings.longitude) / 2), 2)
    )),
    -- Distance to Melbourne CBD
    6371 * 2 * ASIN(SQRT(
      POWER(SIN(RADIANS(-37.8136 - listings.latitude) / 2), 2) +
      COS(RADIANS(listings.latitude)) * COS(RADIANS(-37.8136)) *
      POWER(SIN(RADIANS(144.9631 - listings.longitude) / 2), 2)
    ))
  )
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Set near_uni / near_cbd flags (within 5km)
UPDATE listings
SET
  near_uni = (uni_distance_km IS NOT NULL AND uni_distance_km <= 5),
  near_cbd = (cbd_distance_km IS NOT NULL AND cbd_distance_km <= 5)
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Enable RLS on new tables
ALTER TABLE visa_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE uni_locations ENABLE ROW LEVEL SECURITY;

-- Allow public read on reference tables
CREATE POLICY "Anyone can read visa_types" ON visa_types FOR SELECT USING (true);
CREATE POLICY "Anyone can read uni_locations" ON uni_locations FOR SELECT USING (true);
