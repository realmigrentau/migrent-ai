-- Migration: 002_add_messages_and_extended_profiles.sql
-- Adds messaging system, extended profile fields, and geo support

-- 1. Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
  message_text TEXT NOT NULL,
  read_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT messages_distinct_users CHECK (sender_id != receiver_id)
);

-- Create indexes for fast lookups
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_receiver ON messages(receiver_id);
CREATE INDEX idx_messages_listing ON messages(listing_id);
CREATE INDEX idx_messages_deal ON messages(deal_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_messages_thread ON messages(listing_id, sender_id, receiver_id);

-- 2. Extend profiles table with new fields
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS legal_name TEXT,
  ADD COLUMN IF NOT EXISTS preferred_name TEXT,
  ADD COLUMN IF NOT EXISTS phones TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS residential_address JSONB,
  ADD COLUMN IF NOT EXISTS emergency_contact JSONB,
  ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS preferred_currency TEXT DEFAULT 'AUD',
  ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Australia/Sydney',
  ADD COLUMN IF NOT EXISTS wishlist TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS identity_verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS identity_verification_url TEXT,
  ADD COLUMN IF NOT EXISTS disabled_at TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS recovery_password_hash TEXT DEFAULT NULL;

-- 3. Extend listings table with geolocation
ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS latitude NUMERIC(9,6),
  ADD COLUMN IF NOT EXISTS longitude NUMERIC(9,6);

-- 4. Enable PostGIS for geo queries (if not already enabled)
CREATE EXTENSION IF NOT EXISTS postgis;

-- 5. Create spatial index for listings
CREATE INDEX IF NOT EXISTS idx_listings_geom ON listings USING GIST(
  ST_MakePoint(longitude, latitude)
);

-- 6. Set up RLS policies for messages table
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Allow users to select messages they sent or received
CREATE POLICY IF NOT EXISTS messages_sender_select ON messages
  FOR SELECT USING (
    auth.uid() = sender_id OR auth.uid() = receiver_id
  );

-- Allow authenticated users to insert messages (as sender only)
CREATE POLICY IF NOT EXISTS messages_sender_insert ON messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id
  );

-- Allow marking messages as read (both sender and receiver)
CREATE POLICY IF NOT EXISTS messages_sender_update ON messages
  FOR UPDATE USING (
    auth.uid() = sender_id OR auth.uid() = receiver_id
  )
  WITH CHECK (
    auth.uid() = sender_id OR auth.uid() = receiver_id
  );

-- 7. Update RLS for profiles to allow reading/updating extended fields
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to select own profile and public fields of others
CREATE POLICY IF NOT EXISTS profiles_select ON profiles
  FOR SELECT USING (true); -- Public read on basic fields

-- Allow users to update their own profile
CREATE POLICY IF NOT EXISTS profiles_update ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow authenticated to read profiles
GRANT SELECT, INSERT, UPDATE ON messages TO authenticated;
GRANT SELECT, UPDATE ON profiles TO authenticated;
