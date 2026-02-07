-- Migration: 010_superadmin_read_all.sql
-- Allow superadmins to read all profiles and listings

-- Create a function to check if user is superadmin
CREATE OR REPLACE FUNCTION is_superadmin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'superadmin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add superadmin read policy for profiles
DROP POLICY IF EXISTS profiles_superadmin_select ON profiles;
CREATE POLICY profiles_superadmin_select ON profiles
  FOR SELECT
  USING (
    auth.uid() = id
    OR is_superadmin()
  );

-- Update existing select policy to include superadmin check
DROP POLICY IF EXISTS profiles_select ON profiles;
CREATE POLICY profiles_select ON profiles
  FOR SELECT
  USING (
    auth.uid() = id
    OR is_superadmin()
  );

-- Add superadmin read policy for listings
DROP POLICY IF EXISTS listings_superadmin_select ON listings;
CREATE POLICY listings_superadmin_select ON listings
  FOR SELECT
  USING (
    owner_id = auth.uid()
    OR is_superadmin()
    OR status = 'active'
  );
