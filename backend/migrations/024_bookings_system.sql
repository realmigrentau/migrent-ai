-- Migration 024: Seeker-initiated booking system
-- Adds bookings table and listing fields for request-to-book + instant book flow

-- Add booking-related fields to listings
ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS instant_book_enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS min_stay_weeks int DEFAULT 1,
  ADD COLUMN IF NOT EXISTS max_stay_weeks int DEFAULT 52;

-- Create booking type enum
DO $$ BEGIN
  CREATE TYPE booking_type AS ENUM ('REQUEST_TO_BOOK', 'INSTANT_BOOK');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Create booking status enum
DO $$ BEGIN
  CREATE TYPE booking_status AS ENUM (
    'PENDING_OWNER',
    'OWNER_ACCEPTED',
    'OWNER_DECLINED',
    'SEEKER_CANCELLED',
    'PAID',
    'COMPLETED',
    'EXPIRED'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL REFERENCES auth.users(id),
  seeker_id uuid NOT NULL REFERENCES auth.users(id),
  booking_type booking_type NOT NULL DEFAULT 'REQUEST_TO_BOOK',
  status booking_status NOT NULL DEFAULT 'PENDING_OWNER',
  check_in_date date NOT NULL,
  check_out_date date NOT NULL,
  guests int NOT NULL DEFAULT 1,
  weekly_price_at_time numeric(10, 2) NOT NULL,
  total_price numeric(10, 2) NOT NULL,
  owner_fee numeric(10, 2) NOT NULL DEFAULT 99.00,
  seeker_fee numeric(10, 2) NOT NULL DEFAULT 19.00,
  stripe_session_id text,
  message_to_owner text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  CONSTRAINT check_dates CHECK (check_out_date > check_in_date),
  CONSTRAINT check_guests CHECK (guests >= 1 AND guests <= 20),
  CONSTRAINT check_prices CHECK (weekly_price_at_time >= 0 AND total_price >= 0)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_bookings_listing_id ON bookings(listing_id);
CREATE INDEX IF NOT EXISTS idx_bookings_owner_id ON bookings(owner_id);
CREATE INDEX IF NOT EXISTS idx_bookings_seeker_id ON bookings(seeker_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at DESC);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_bookings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS bookings_updated_at ON bookings;
CREATE TRIGGER bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_bookings_updated_at();

-- RLS policies
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Seekers can create bookings
CREATE POLICY bookings_insert_seeker ON bookings
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = seeker_id);

-- Owners and seekers can view their own bookings
CREATE POLICY bookings_select_own ON bookings
  FOR SELECT TO authenticated
  USING (auth.uid() = owner_id OR auth.uid() = seeker_id);

-- Owners can update bookings they own (accept/decline)
CREATE POLICY bookings_update_owner ON bookings
  FOR UPDATE TO authenticated
  USING (auth.uid() = owner_id OR auth.uid() = seeker_id);

-- Service role can do anything (for webhooks)
CREATE POLICY bookings_service_all ON bookings
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON bookings TO authenticated;
GRANT ALL ON bookings TO service_role;
