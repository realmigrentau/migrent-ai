-- Migration: 012_fix_superadmin_check.sql
-- Fix superadmin role constraint and RLS check

-- 1. First, fix the role column constraint to include 'superadmin'
-- Drop the existing check constraint on role
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Add new constraint that includes superadmin
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('seeker', 'owner', 'user', 'superadmin'));

-- 2. Create/update the SECURITY DEFINER function that bypasses RLS
DROP FUNCTION IF EXISTS is_superadmin();

CREATE OR REPLACE FUNCTION is_superadmin()
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Direct query bypassing RLS since this is SECURITY DEFINER
  SELECT role INTO user_role
  FROM profiles
  WHERE id = auth.uid();

  RETURN user_role = 'superadmin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Recreate the profiles select policy
DROP POLICY IF EXISTS profiles_select ON profiles;
DROP POLICY IF EXISTS profiles_superadmin_select ON profiles;

CREATE POLICY profiles_select ON profiles
  FOR SELECT
  USING (
    auth.uid() = id
    OR is_superadmin()
  );
