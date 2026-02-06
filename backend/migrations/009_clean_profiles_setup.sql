-- Migration: 009_clean_profiles_setup.sql
-- Final profile table setup with proper RLS and permissions
-- This is a comprehensive cleanup that ensures all profile operations work

-- 1. Ensure profiles table has all necessary columns
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS legal_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferred_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phones TEXT[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS residential_address JSONB;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS emergency_contact JSONB;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'en';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferred_currency TEXT DEFAULT 'AUD';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Australia/Sydney';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS wishlist TEXT[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS identity_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS identity_verification_url TEXT;

-- 2. Disable RLS to start fresh
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 3. Drop all old policies
DROP POLICY IF EXISTS profiles_select ON profiles;
DROP POLICY IF EXISTS profiles_update ON profiles;
DROP POLICY IF EXISTS profiles_insert ON profiles;
DROP POLICY IF EXISTS profiles_delete ON profiles;

-- 4. Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 5. Create simple, correct RLS policies
-- Users can SELECT their own profile
CREATE POLICY profiles_select ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Users can UPDATE their own profile
CREATE POLICY profiles_update ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can INSERT their own profile
CREATE POLICY profiles_insert ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can DELETE their own profile
CREATE POLICY profiles_delete ON profiles
  FOR DELETE
  USING (auth.uid() = id);

-- 6. Grant explicit table-level permissions to authenticated role
-- This ensures the service role key can perform operations
GRANT SELECT, INSERT, UPDATE, DELETE ON profiles TO authenticated;

-- 7. Grant read-only access to anon role (for public profiles)
GRANT SELECT ON profiles TO anon;

-- 8. Create helpful indexes for common queries
CREATE INDEX IF NOT EXISTS idx_profiles_id ON profiles(id);
CREATE INDEX IF NOT EXISTS idx_profiles_legal_name ON profiles(legal_name) WHERE legal_name IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_verified ON profiles(identity_verified) WHERE identity_verified = TRUE;

-- 9. Add any missing columns to profiles if they don't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT CHECK (role IN ('seeker', 'owner', 'user')) DEFAULT 'user';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS badges TEXT[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS custom_pfp TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS about_me TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS most_useless_skill TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS occupation TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS age INT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS visa_type TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS budget_min NUMERIC;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS budget_max NUMERIC;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferred_suburbs TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS move_in_date TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS lifestyle TEXT[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS rooms_owned INT DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS properties_owned INT DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notify_email BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notify_sms BOOLEAN DEFAULT FALSE;
