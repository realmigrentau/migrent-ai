-- Migration: 003_fix_profiles_rls.sql
-- Fixes RLS policies for profiles table to allow users to update their own profiles

-- Drop existing policies if they exist
DROP POLICY IF EXISTS profiles_select ON profiles;
DROP POLICY IF EXISTS profiles_update ON profiles;
DROP POLICY IF EXISTS profiles_insert ON profiles;

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to select their own profile and public profiles
CREATE POLICY profiles_select ON profiles
  FOR SELECT USING (
    auth.uid() = id OR true  -- Allow all for now, since we want to be able to read profiles
  );

-- Allow users to update their own profile
CREATE POLICY profiles_update ON profiles
  FOR UPDATE USING (
    auth.uid() = id
  )
  WITH CHECK (
    auth.uid() = id
  );

-- Allow users to insert their own profile
CREATE POLICY profiles_insert ON profiles
  FOR INSERT WITH CHECK (
    auth.uid() = id
  );

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON profiles TO authenticated;
