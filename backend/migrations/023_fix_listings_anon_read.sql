-- Migration 023: Fix listings RLS to allow anon reads
-- Listings are public marketplace data - both anon and authenticated should read them

DROP POLICY IF EXISTS "listings_public_read" ON listings;
CREATE POLICY "listings_public_read" ON listings
    FOR SELECT TO anon, authenticated
    USING (true);

GRANT SELECT ON listings TO anon;
