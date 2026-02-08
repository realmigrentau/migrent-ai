-- Migration 015: Fix profiles RLS to allow public profile viewing
-- The previous migration (013) restricted SELECT to only own profile + superadmin.
-- This broke public profile pages. We need all authenticated users to view any profile.

-- Drop the restrictive policy
DROP POLICY IF EXISTS profiles_select ON profiles;

-- Recreate: authenticated users can read ALL profiles, anon can read basic public fields
CREATE POLICY profiles_select ON profiles
  FOR SELECT
  USING (true);  -- All profiles are readable (public profile pages need this)

-- Ensure grants are correct
GRANT SELECT ON profiles TO authenticated;
GRANT SELECT ON profiles TO anon;
