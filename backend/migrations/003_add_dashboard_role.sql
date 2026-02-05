-- Migration: 003_add_dashboard_role.sql
-- Adds role field to profiles for dashboard role selection (seeker/owner)

-- Add role column to profiles table
-- This stores the user's dashboard preference: 'seeker' or 'owner'
-- Users can be both, but this field determines their primary dashboard view
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS role TEXT CHECK (role IN ('seeker', 'owner'));

-- Create index for fast role-based queries
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Add comment for documentation
COMMENT ON COLUMN profiles.role IS 'Dashboard role preference: seeker (looking for rooms) or owner (listing rooms)';
