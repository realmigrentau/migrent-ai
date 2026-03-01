-- ══════════════════════════════════════════════════════════════
-- Migration 019: Security RLS Fixes
-- Enables RLS on all tables that were missing it.
-- Run this in Supabase SQL Editor.
-- ══════════════════════════════════════════════════════════════

-- ── 1. RE-ENABLE RLS on profiles ──────────────────────────────
-- Migration 008 disabled it for testing. This re-enables it with proper policies.
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop all existing conflicting policies on profiles
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_own" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "profiles_public_read" ON profiles;
DROP POLICY IF EXISTS "Public profiles are readable" ON profiles;
DROP POLICY IF EXISTS "Allow authenticated read" ON profiles;
DROP POLICY IF EXISTS "Allow authenticated insert" ON profiles;
DROP POLICY IF EXISTS "Allow authenticated update" ON profiles;
DROP POLICY IF EXISTS "Allow authenticated delete" ON profiles;

-- Users can read their own profile
CREATE POLICY "profiles_select_own" ON profiles
    FOR SELECT TO authenticated
    USING (auth.uid() = id);

-- Public profiles: anyone authenticated can read limited columns
-- (The backend controls which columns are returned via the query)
CREATE POLICY "profiles_public_read" ON profiles
    FOR SELECT TO authenticated
    USING (true);

-- Users can update their own profile only
CREATE POLICY "profiles_update_own" ON profiles
    FOR UPDATE TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Users can insert their own profile only
CREATE POLICY "profiles_insert_own" ON profiles
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = id);

-- Users can delete their own profile only
CREATE POLICY "profiles_delete_own" ON profiles
    FOR DELETE TO authenticated
    USING (auth.uid() = id);

-- Grant permissions to authenticated role
GRANT SELECT, INSERT, UPDATE, DELETE ON profiles TO authenticated;
GRANT ALL ON profiles TO service_role;


-- ── 2. ENABLE RLS on listings ─────────────────────────────────
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "listings_public_read" ON listings;
DROP POLICY IF EXISTS "listings_owner_insert" ON listings;
DROP POLICY IF EXISTS "listings_owner_update" ON listings;
DROP POLICY IF EXISTS "listings_owner_delete" ON listings;

-- Anyone can read listings (public marketplace)
CREATE POLICY "listings_public_read" ON listings
    FOR SELECT TO authenticated
    USING (true);

-- Only owner can insert their own listings
CREATE POLICY "listings_owner_insert" ON listings
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid()::text = owner_id::text);

-- Only owner can update their own listings
CREATE POLICY "listings_owner_update" ON listings
    FOR UPDATE TO authenticated
    USING (auth.uid()::text = owner_id::text);

-- Only owner can delete their own listings
CREATE POLICY "listings_owner_delete" ON listings
    FOR DELETE TO authenticated
    USING (auth.uid()::text = owner_id::text);

GRANT SELECT, INSERT, UPDATE, DELETE ON listings TO authenticated;
GRANT ALL ON listings TO service_role;


-- ── 3. ENABLE RLS on deals ────────────────────────────────────
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "deals_participant_select" ON deals;
DROP POLICY IF EXISTS "deals_owner_insert" ON deals;
DROP POLICY IF EXISTS "deals_participant_update" ON deals;

-- Only owner or seeker can see their deals
CREATE POLICY "deals_participant_select" ON deals
    FOR SELECT TO authenticated
    USING (auth.uid()::text = owner_id::text OR auth.uid()::text = seeker_id::text);

-- Owner can create deals
CREATE POLICY "deals_owner_insert" ON deals
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid()::text = owner_id::text);

-- Participants can update deals
CREATE POLICY "deals_participant_update" ON deals
    FOR UPDATE TO authenticated
    USING (auth.uid()::text = owner_id::text OR auth.uid()::text = seeker_id::text);

-- Participants can delete deals (for account cleanup)
CREATE POLICY "deals_participant_delete" ON deals
    FOR DELETE TO authenticated
    USING (auth.uid()::text = owner_id::text OR auth.uid()::text = seeker_id::text);

GRANT SELECT, INSERT, UPDATE, DELETE ON deals TO authenticated;
GRANT ALL ON deals TO service_role;


-- ── 4. ENABLE RLS on messages ─────────────────────────────────
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "messages_participant_select" ON messages;
DROP POLICY IF EXISTS "messages_sender_insert" ON messages;
DROP POLICY IF EXISTS "messages_receiver_update" ON messages;
DROP POLICY IF EXISTS "messages_participant_delete" ON messages;

-- Only sender or receiver can read messages
CREATE POLICY "messages_participant_select" ON messages
    FOR SELECT TO authenticated
    USING (auth.uid()::text = sender_id::text OR auth.uid()::text = receiver_id::text);

-- Only sender can create messages
CREATE POLICY "messages_sender_insert" ON messages
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid()::text = sender_id::text);

-- Receiver can update (mark as read)
CREATE POLICY "messages_receiver_update" ON messages
    FOR UPDATE TO authenticated
    USING (auth.uid()::text = receiver_id::text);

-- Participants can delete (for account cleanup)
CREATE POLICY "messages_participant_delete" ON messages
    FOR DELETE TO authenticated
    USING (auth.uid()::text = sender_id::text OR auth.uid()::text = receiver_id::text);

GRANT SELECT, INSERT, UPDATE, DELETE ON messages TO authenticated;
GRANT ALL ON messages TO service_role;


-- ── 5. ENABLE RLS on reports ──────────────────────────────────
ALTER TABLE IF EXISTS reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reports_own_select" ON reports;
DROP POLICY IF EXISTS "reports_own_insert" ON reports;
DROP POLICY IF EXISTS "reports_own_delete" ON reports;

-- Users can see their own reports
CREATE POLICY "reports_own_select" ON reports
    FOR SELECT TO authenticated
    USING (auth.uid()::text = reporter_id::text);

-- Users can create reports
CREATE POLICY "reports_own_insert" ON reports
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid()::text = reporter_id::text);

-- Users can delete their own reports (for account cleanup)
CREATE POLICY "reports_own_delete" ON reports
    FOR DELETE TO authenticated
    USING (auth.uid()::text = reporter_id::text);

GRANT SELECT, INSERT, UPDATE, DELETE ON reports TO authenticated;
GRANT ALL ON reports TO service_role;


-- ── 6. ENABLE RLS on referrals ────────────────────────────────
ALTER TABLE IF EXISTS referrals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "referrals_own_select" ON referrals;
DROP POLICY IF EXISTS "referrals_own_insert" ON referrals;
DROP POLICY IF EXISTS "referrals_own_update" ON referrals;

-- Users can see their own referrals
CREATE POLICY "referrals_own_select" ON referrals
    FOR SELECT TO authenticated
    USING (auth.uid()::text = referrer_id::text OR auth.uid()::text = referred_user_id::text);

-- Users can create referrals
CREATE POLICY "referrals_own_insert" ON referrals
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid()::text = referrer_id::text);

-- Users can update referrals (to use a code)
CREATE POLICY "referrals_own_update" ON referrals
    FOR UPDATE TO authenticated
    USING (true);

GRANT SELECT, INSERT, UPDATE ON referrals TO authenticated;
GRANT ALL ON referrals TO service_role;


-- ── 7. ENABLE RLS on matches (only if table exists) ──────────
DO $$ BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'matches') THEN
        ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "matches_own_select" ON matches;
        DROP POLICY IF EXISTS "matches_own_insert" ON matches;
        DROP POLICY IF EXISTS "matches_own_delete" ON matches;

        CREATE POLICY "matches_own_select" ON matches
            FOR SELECT TO authenticated
            USING (auth.uid()::text = seeker_id::text OR auth.uid()::text = owner_id::text);

        CREATE POLICY "matches_own_insert" ON matches
            FOR INSERT TO authenticated
            WITH CHECK (auth.uid()::text = seeker_id::text);

        CREATE POLICY "matches_own_delete" ON matches
            FOR DELETE TO authenticated
            USING (auth.uid()::text = seeker_id::text OR auth.uid()::text = owner_id::text);

        GRANT SELECT, INSERT, DELETE ON matches TO authenticated;
        GRANT ALL ON matches TO service_role;
    END IF;
END $$;
