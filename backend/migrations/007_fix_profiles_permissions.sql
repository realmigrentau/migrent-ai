-- Migration: 007_fix_profiles_permissions.sql
-- Fixes RLS and permissions for profiles table to allow updates when using anon key
-- This ensures profile data persists even when SERVICE_ROLE_KEY is not available

-- First, DISABLE RLS to fix policies cleanly
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Drop existing policies to start fresh
DROP POLICY IF EXISTS profiles_select ON profiles;
DROP POLICY IF EXISTS profiles_update ON profiles;
DROP POLICY IF EXISTS profiles_insert ON profiles;
DROP POLICY IF EXISTS profiles_delete ON profiles;

-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to SELECT their own profile
CREATE POLICY profiles_select ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Allow authenticated users to UPDATE their own profile
CREATE POLICY profiles_update ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow authenticated users to INSERT their own profile
CREATE POLICY profiles_insert ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Allow authenticated users to DELETE their own profile
CREATE POLICY profiles_delete ON profiles
  FOR DELETE
  USING (auth.uid() = id);

-- Grant explicit permissions to authenticated role at table level
GRANT SELECT ON profiles TO authenticated;
GRANT INSERT ON profiles TO authenticated;
GRANT UPDATE ON profiles TO authenticated;
GRANT DELETE ON profiles TO authenticated;

-- Grant to anon role for public profiles (read-only)
GRANT SELECT ON profiles TO anon;

-- Allow public access to specific columns via anon role
GRANT SELECT(id, name, preferred_name, about_me, most_useless_skill, interests, badges, custom_pfp, occupation, verified) ON profiles TO anon;
