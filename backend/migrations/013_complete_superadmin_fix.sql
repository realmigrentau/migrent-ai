-- Migration: 013_complete_superadmin_fix.sql
-- Complete fix for superadmin access - run this in Supabase SQL Editor

-- Step 1: Drop ALL existing role constraints
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check1;
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check2;

-- Step 2: Add the correct constraint with superadmin included
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('seeker', 'owner', 'user', 'superadmin'));

-- Step 3: Drop and recreate the is_superadmin function with SECURITY DEFINER
-- SECURITY DEFINER makes it bypass RLS
DROP FUNCTION IF EXISTS is_superadmin();
DROP FUNCTION IF EXISTS is_superadmin;

CREATE FUNCTION is_superadmin()
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Direct query that bypasses RLS because this function is SECURITY DEFINER
  SELECT role INTO user_role
  FROM profiles
  WHERE id = auth.uid();

  RETURN COALESCE(user_role = 'superadmin', FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Step 4: Drop ALL existing select policies on profiles
DROP POLICY IF EXISTS profiles_select ON profiles;
DROP POLICY IF EXISTS profiles_superadmin_select ON profiles;
DROP POLICY IF EXISTS "profiles_select" ON profiles;
DROP POLICY IF EXISTS "profiles_superadmin_select" ON profiles;

-- Step 5: Create a single unified select policy
CREATE POLICY profiles_select ON profiles
  FOR SELECT
  USING (
    auth.uid() = id  -- Users can read their own profile
    OR is_superadmin()  -- Superadmins can read all profiles
  );

-- Step 6: Now set the user as superadmin
-- Replace 'YOUR_USER_ID_HERE' with the actual user ID from auth.users
-- You can find this by running: SELECT id, email FROM auth.users WHERE email = 'tapasyawizardlore@gmail.com';

-- Uncomment and run this after finding the user ID:
-- UPDATE profiles SET role = 'superadmin' WHERE id = 'YOUR_USER_ID_HERE';

-- Step 7: Verify the setup
-- Run these to check:
-- SELECT id, email FROM auth.users WHERE email = 'tapasyawizardlore@gmail.com';
-- SELECT id, role FROM profiles WHERE id = (SELECT id FROM auth.users WHERE email = 'tapasyawizardlore@gmail.com');
