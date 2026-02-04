-- Migration 001: Add enhanced profile fields and deal customization columns
-- Run this in your Supabase SQL Editor

-- ============================================================
-- 1. PROFILES TABLE — new fields for profile customization
-- ============================================================

-- Add new profile fields (these are safe to run even if some columns exist)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS most_useless_skill text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS about_me text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS interests text[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS badges text[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS custom_pfp text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS occupation text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS age int;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS visa_type text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS budget_min numeric;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS budget_max numeric;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferred_suburbs text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS move_in_date date;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS lifestyle text[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS rooms_owned int DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS properties_owned int DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notify_email boolean DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notify_sms boolean DEFAULT false;

-- ============================================================
-- 2. LISTINGS TABLE — extended fields (if not already present)
-- ============================================================

ALTER TABLE listings ADD COLUMN IF NOT EXISTS title text;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS property_type text;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS place_type text;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS max_guests int DEFAULT 1;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS bedrooms int DEFAULT 1;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS beds int DEFAULT 1;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS bathrooms int DEFAULT 1;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS bathroom_type text DEFAULT 'shared';
ALTER TABLE listings ADD COLUMN IF NOT EXISTS who_else_lives_here text;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS total_other_people text;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS furnished boolean DEFAULT true;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS bills_included boolean DEFAULT false;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS parking boolean DEFAULT false;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS highlights text[] DEFAULT '{}';
ALTER TABLE listings ADD COLUMN IF NOT EXISTS weekly_discount numeric DEFAULT 0;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS monthly_discount numeric DEFAULT 0;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS bond text;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS no_smoking boolean DEFAULT true;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS quiet_hours text;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS tenant_prefs text;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS min_stay text;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS security_cameras boolean DEFAULT false;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS security_cameras_location text;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS weapons_on_property boolean DEFAULT false;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS weapons_explanation text;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS other_safety_details text;

-- ============================================================
-- 3. DEALS TABLE — deal customization fields
-- ============================================================

ALTER TABLE deals ADD COLUMN IF NOT EXISTS start_date date;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS end_date date;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS special_requests text;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS total_guests int DEFAULT 1;
