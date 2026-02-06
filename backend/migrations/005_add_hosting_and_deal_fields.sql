-- Migration 005: Add hosting form fields and deal customization fields
-- Run this in your Supabase SQL Editor

-- ============================================================
-- 1. LISTINGS TABLE — hosting/availability fields
-- ============================================================

-- Availability
ALTER TABLE listings ADD COLUMN IF NOT EXISTS available_from date;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS available_to date;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS instant_book boolean DEFAULT false;

-- Internet
ALTER TABLE listings ADD COLUMN IF NOT EXISTS internet_included boolean DEFAULT false;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS internet_speed text;          -- e.g. "50 Mbps NBN"

-- Pet policy
ALTER TABLE listings ADD COLUMN IF NOT EXISTS pets_allowed boolean DEFAULT false;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS pet_details text;             -- e.g. "Small dogs OK, no cats"

-- Amenities (extended)
ALTER TABLE listings ADD COLUMN IF NOT EXISTS air_conditioning boolean DEFAULT false;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS laundry text;                 -- "in-unit", "shared", "none"
ALTER TABLE listings ADD COLUMN IF NOT EXISTS dishwasher boolean DEFAULT false;

-- Transport / location
ALTER TABLE listings ADD COLUMN IF NOT EXISTS nearest_transport text;       -- e.g. "Central Station 5 min walk"
ALTER TABLE listings ADD COLUMN IF NOT EXISTS neighbourhood_vibe text;      -- e.g. "Quiet residential, cafes nearby"

-- Gender preference
ALTER TABLE listings ADD COLUMN IF NOT EXISTS gender_preference text;       -- "any", "female", "male"

-- Couple friendly
ALTER TABLE listings ADD COLUMN IF NOT EXISTS couples_ok boolean DEFAULT false;

-- ============================================================
-- 2. DEALS TABLE — extended customization fields
-- ============================================================

ALTER TABLE deals ADD COLUMN IF NOT EXISTS move_in_date date;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS move_out_date date;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS number_of_guests int DEFAULT 1;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS guest_names text;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS deal_notes text;
