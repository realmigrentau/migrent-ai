-- Add verified boolean to profiles table for seeker verification badge.
-- Default false; set to true after successful Stripe verification payment.
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS verified BOOLEAN NOT NULL DEFAULT FALSE;
