-- 039_rls_lockdown.sql
-- Batch 1 of the 2026-08-29 audit: close the critical data-exposure and
-- privilege-escalation holes.
--
-- ══════════════════════════════════════════════════════════════
-- READ THIS BEFORE RUNNING
-- ══════════════════════════════════════════════════════════════
-- PREREQUISITE: deploy the backend in the same commit FIRST, then run this.
--
-- routes_messages.py, routes_reviews.py, routes_reports.py, routes_account.py
-- and routes_verification.py were still using the anon Supabase client for
-- their reads and writes. This migration removes the grants that made that
-- work, so running it against the OLD backend would break messaging, reviews,
-- reporting, account deletion and seeker verification.
--
-- The frontend in the same commit stops writing to `messages` directly and
-- reads profiles through the new `public_profiles` view. Running this against
-- an OLD frontend would break the messages page.
--
-- Everything here is idempotent and safe to re-run.


-- ══════════════════════════════════════════════════════════════
-- 1. profiles: stop publishing every user's private data
-- ══════════════════════════════════════════════════════════════
-- Migration 015 created `profiles_select ... USING (true)` with NO role
-- restriction and granted SELECT to anon. Migration 019 then added a second
-- always-true policy, profiles_public_read. RLS policies are OR'd, so the
-- permissive pair overrode the own-row-or-superadmin policy from 013 and the
-- effective posture became: anyone holding the publishable anon key can read
-- every column of every row. That includes phone, phones, residential_address,
-- emergency_contact, recovery_password_hash, identity_verification_url,
-- age, visa_type and budget range.
--
-- Ten migrations have rewritten these policies (003, 007, 008, 009, 010, 012,
-- 013, 015, 019, 036) and 008 disabled RLS outright. Rather than guess which
-- policy names survived, drop every policy on the table by introspection.

DO $$
DECLARE pol record;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
     WHERE schemaname = 'public' AND tablename = 'profiles'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', pol.policyname);
  END LOOP;
END $$;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- A user may read their own row in full.
CREATE POLICY profiles_select_own ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

-- Admins may read every row (the admin dashboard reads this from the browser).
CREATE POLICY profiles_select_admin ON public.profiles
  FOR SELECT TO authenticated
  USING (public.is_superadmin());

-- A user may update and insert only their own row. Which COLUMNS they may
-- change is constrained by the trigger in section 3 below - RLS alone cannot
-- express column-level rules.
CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY profiles_insert_own ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- No DELETE policy. Account deletion runs through the backend under the
-- service role (routes_account.py), which bypasses RLS.

-- Table-level grants. Note 007 granted a safe column subset to anon and 015
-- then granted the whole table; the table-wide grant wins, so revoke all of it
-- and re-grant only what is needed.
REVOKE ALL ON public.profiles FROM anon;
REVOKE ALL ON public.profiles FROM authenticated;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;


-- ══════════════════════════════════════════════════════════════
-- 2. public_profiles: the columns it is safe to show other people
-- ══════════════════════════════════════════════════════════════
-- Public profile pages, message threads and listing owner cards need to read
-- OTHER users' profiles. They need a name and an avatar, not a home address.
-- security_invoker stays off so the view can read past the policies above,
-- which is the entire point; the column list is the security boundary.

DROP VIEW IF EXISTS public.public_profiles;

-- Deliberately EXCLUDED, and why:
--   phone, phones, residential_address, emergency_contact   contact and home address
--   recovery_password_hash                                  credential material
--   identity_verification_url                               links to ID documents
--   budget_min, budget_max, move_in_date, preferred_suburbs  seeker search intent
--   visa_type                                               immigration status. Publishing
--     this on a profile page is a discrimination vector, and MigRent ships an
--     anti-discrimination policy. Nothing renders it today.
--   age                                                     not rendered; no reason to publish
--   is_admin, onboarding_completed, disabled_at             internal state
--   notify_email, notify_sms, timezone, preferred_currency  account settings

CREATE VIEW public.public_profiles AS
  SELECT id,
         name,
         preferred_name,
         about_me,
         bio,
         custom_pfp,
         occupation,
         work,
         location,
         interests,
         lifestyle,
         badges,
         languages,
         most_useless_skill,
         profile_photos,
         social_twitter,
         social_facebook,
         social_linkedin,
         role,
         verified,
         is_verified,
         identity_verified,
         verified_date,
         verification_method,
         average_rating,
         reviews_count,
         months_hosting,
         response_rate,
         response_time,
         rooms_owned,
         properties_owned,
         created_at
    FROM public.profiles;

ALTER VIEW public.public_profiles SET (security_invoker = false);

GRANT SELECT ON public.public_profiles TO anon, authenticated;


-- ══════════════════════════════════════════════════════════════
-- 3. Block self-promotion to admin
-- ══════════════════════════════════════════════════════════════
-- profiles_update_own lets a user update their own row, and RLS cannot
-- restrict which columns. profiles_role_check permits 'superadmin', so any
-- signed-up account could run
--     supabase.from('profiles').update({ role: 'superadmin' }).eq('id', me)
-- and gain everything is_superadmin() unlocks.
--
-- Switching between 'seeker' and 'owner' is a legitimate user action - that is
-- a UI mode, not a privilege - so allow those and block only the admin roles
-- and the trust flags. The service role bypasses triggers only if they check
-- for it explicitly, so do that.

-- Deliberately NOT security definer. This function must see the CALLER's role
-- in current_user so it can wave the backend through; under SECURITY DEFINER
-- current_user would be the function owner and the check would never match.
-- It needs no elevated privilege of its own: it only compares OLD and NEW.
--
-- Column names are compared through to_jsonb rather than as identifiers, so a
-- column that does not exist on this database is skipped instead of raising at
-- runtime. profiles has been reshaped by ten migrations; this keeps the guard
-- working regardless of which of them actually applied.

CREATE OR REPLACE FUNCTION public.guard_profile_privilege_columns()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
  protected CONSTANT text[] := ARRAY[
    'role', 'is_admin',
    'verified', 'is_verified', 'identity_verified', 'identity_verification_url',
    'average_rating', 'reviews_count'
  ];
  col     text;
  old_row jsonb := to_jsonb(OLD);
  new_row jsonb := to_jsonb(NEW);
BEGIN
  -- The backend connects as service_role and is trusted to set these.
  -- postgres / supabase_admin cover the dashboard SQL editor and migrations.
  IF current_user IN ('service_role', 'postgres', 'supabase_admin') THEN
    RETURN NEW;
  END IF;

  FOREACH col IN ARRAY protected LOOP
    IF (old_row ? col) AND (new_row -> col) IS DISTINCT FROM (old_row -> col) THEN
      RAISE EXCEPTION
        'column "%" cannot be set directly; it is managed by the MigRent API', col
        USING ERRCODE = 'insufficient_privilege';
    END IF;
  END LOOP;

  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS profiles_guard_privilege_columns ON public.profiles;
CREATE TRIGGER profiles_guard_privilege_columns
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.guard_profile_privilege_columns();


-- ══════════════════════════════════════════════════════════════
-- 4. Revoke the write grants that made the backend optional
-- ══════════════════════════════════════════════════════════════
-- Migration 019 granted authenticated direct INSERT/UPDATE/DELETE on
-- listings, deals, messages, reports and referrals; 021 on reviews; 024 on
-- bookings. Every rule the FastAPI layer enforces therefore had a PostgREST
-- bypass. Concretely, before this migration a signed-in user could:
--
--   * set their own booking to status='PAID' without paying (bookings UPDATE)
--   * insert unlimited fake reviews about anyone (reviews INSERT, deal_id is
--     nullable so the UNIQUE(deal_id, reviewer_id) constraint did not bite)
--   * insert a listing with moderation_status='approved', skipping owner
--     verification, spam scoring and moderation entirely (listings INSERT)
--   * write arbitrary message_html, which the frontend rendered through
--     dangerouslySetInnerHTML (messages INSERT)
--
-- All writes now go through the backend, which already performs these checks
-- correctly and runs as service_role. Reads are left alone.

REVOKE INSERT, UPDATE, DELETE ON public.listings  FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.bookings  FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.reviews   FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.messages  FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.deals     FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.reports   FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.referrals FROM anon, authenticated;

-- Drop the write policies too, so the intent is visible in pg_policies rather
-- than only in the grant table.
DROP POLICY IF EXISTS listings_owner_insert         ON public.listings;
DROP POLICY IF EXISTS listings_owner_update         ON public.listings;
DROP POLICY IF EXISTS listings_owner_delete         ON public.listings;
DROP POLICY IF EXISTS "Owners can update own listings" ON public.listings;
DROP POLICY IF EXISTS bookings_insert_seeker        ON public.bookings;
DROP POLICY IF EXISTS bookings_update_owner         ON public.bookings;
DROP POLICY IF EXISTS reviews_insert_own            ON public.reviews;
DROP POLICY IF EXISTS reviews_update_own            ON public.reviews;
DROP POLICY IF EXISTS messages_sender_insert        ON public.messages;
DROP POLICY IF EXISTS messages_receiver_update      ON public.messages;
DROP POLICY IF EXISTS messages_participant_delete   ON public.messages;
DROP POLICY IF EXISTS messages_sender_update        ON public.messages;
DROP POLICY IF EXISTS deals_owner_insert            ON public.deals;
DROP POLICY IF EXISTS deals_participant_update      ON public.deals;
DROP POLICY IF EXISTS deals_participant_delete      ON public.deals;
DROP POLICY IF EXISTS reports_own_insert            ON public.reports;
DROP POLICY IF EXISTS reports_own_delete            ON public.reports;
DROP POLICY IF EXISTS referrals_own_insert          ON public.referrals;
DROP POLICY IF EXISTS referrals_own_update          ON public.referrals;

-- blocked_users is written from the browser via lib/api.ts and its policies are
-- correctly self-scoped, so it keeps its grants.


-- ══════════════════════════════════════════════════════════════
-- 5. listings: only approved rows are public
-- ══════════════════════════════════════════════════════════════
-- listings_public_read was USING (true), so unapproved, rejected and
-- soft-deleted listings were readable by anyone who had the id.

DROP POLICY IF EXISTS listings_public_read       ON public.listings;
DROP POLICY IF EXISTS listings_superadmin_select ON public.listings;

CREATE POLICY listings_public_read ON public.listings
  FOR SELECT TO anon, authenticated
  USING (moderation_status = 'approved');

CREATE POLICY listings_owner_read ON public.listings
  FOR SELECT TO authenticated
  USING (auth.uid()::text = owner_id::text);

CREATE POLICY listings_admin_read ON public.listings
  FOR SELECT TO authenticated
  USING (public.is_superadmin());


-- ══════════════════════════════════════════════════════════════
-- 6. Soft delete, and stop cascading over paid bookings
-- ══════════════════════════════════════════════════════════════
-- routes_listings.py:556 already reads `moderation_status <> 'deleted'`, but
-- 'deleted' was missing from the CHECK constraint, so that write could never
-- have succeeded.

-- 029 declared the CHECK inline on ADD COLUMN, so its generated name is not
-- guaranteed. Find any CHECK on the table that mentions moderation_status and
-- drop it by its real name before adding ours.
DO $$
DECLARE con record;
BEGIN
  FOR con IN
    SELECT conname
      FROM pg_constraint
     WHERE conrelid = 'public.listings'::regclass
       AND contype = 'c'
       AND pg_get_constraintdef(oid) ILIKE '%moderation_status%'
  LOOP
    EXECUTE format('ALTER TABLE public.listings DROP CONSTRAINT %I', con.conname);
  END LOOP;
END $$;

ALTER TABLE public.listings ADD CONSTRAINT listings_moderation_status_check
  CHECK (moderation_status IN ('pending_approval','approved','rejected','changes_requested','deleted'));

-- bookings.listing_id and messages.listing_id were ON DELETE CASCADE, so one
-- owner deleting a listing destroyed every booking on it - including PAID ones
-- with a real Stripe charge behind them - and the entire message history that
-- would settle a dispute. The backend now soft-deletes; these constraints stop
-- a stray hard DELETE from doing the damage anyway.

ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_listing_id_fkey;
ALTER TABLE public.bookings ADD CONSTRAINT bookings_listing_id_fkey
  FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE RESTRICT;

ALTER TABLE public.messages ALTER COLUMN listing_id DROP NOT NULL;
ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_listing_id_fkey;
ALTER TABLE public.messages ADD CONSTRAINT messages_listing_id_fkey
  FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE SET NULL;

-- reviews.listing_id had no foreign key at all, so reviews orphaned silently.
-- Any row already pointing at a listing that no longer exists would block the
-- constraint, so null those out first.
UPDATE public.reviews r
   SET listing_id = NULL
 WHERE r.listing_id IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM public.listings l WHERE l.id = r.listing_id);

ALTER TABLE public.reviews DROP CONSTRAINT IF EXISTS reviews_listing_id_fkey;
ALTER TABLE public.reviews ADD CONSTRAINT reviews_listing_id_fkey
  FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE SET NULL;


-- ══════════════════════════════════════════════════════════════
-- 7. Stop two people paying for the same room on the same dates
-- ══════════════════════════════════════════════════════════════
-- The backend now checks for overlaps before inserting, but the check and the
-- insert are not atomic, so two simultaneous requests can both pass. This
-- constraint is the actual guarantee.

CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_no_overlap;

-- If live data already contains overlapping accepted/paid bookings the ADD
-- below will fail, which is the correct outcome: it means real double-bookings
-- exist and a human has to decide which one stands. This query lists them.
-- Run it first if the ALTER errors:
--
--   SELECT a.id, b.id, a.listing_id, a.check_in_date, a.check_out_date
--     FROM bookings a JOIN bookings b
--       ON a.listing_id = b.listing_id AND a.id < b.id
--      AND daterange(a.check_in_date, a.check_out_date, '[)')
--       && daterange(b.check_in_date, b.check_out_date, '[)')
--    WHERE a.status IN ('OWNER_ACCEPTED','PAID')
--      AND b.status IN ('OWNER_ACCEPTED','PAID');

ALTER TABLE public.bookings ADD CONSTRAINT bookings_no_overlap
  EXCLUDE USING gist (
    listing_id WITH =,
    daterange(check_in_date, check_out_date, '[)') WITH &&
  )
  WHERE (status IN ('OWNER_ACCEPTED', 'PAID'));


-- ══════════════════════════════════════════════════════════════
-- 8. Stripe webhook idempotency
-- ══════════════════════════════════════════════════════════════
-- Stripe retries deliveries. Without this, a retry re-sent the booking
-- confirmation emails and inserted a duplicate payment_events row.

DELETE FROM public.payment_events a
 USING public.payment_events b
 WHERE a.ctid < b.ctid
   AND a.stripe_session_id = b.stripe_session_id
   AND a.stripe_session_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS payment_events_stripe_session_id_key
  ON public.payment_events (stripe_session_id)
  WHERE stripe_session_id IS NOT NULL;


-- ══════════════════════════════════════════════════════════════
-- 9. Indexes for the columns every search actually filters on
-- ══════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_listings_suburb       ON public.listings (lower(suburb));
CREATE INDEX IF NOT EXISTS idx_listings_city         ON public.listings (city);
CREATE INDEX IF NOT EXISTS idx_listings_weekly_price ON public.listings (weekly_price);
CREATE INDEX IF NOT EXISTS idx_listings_owner        ON public.listings (owner_id);


-- ══════════════════════════════════════════════════════════════
-- 10. Verification
-- ══════════════════════════════════════════════════════════════
-- Run these afterwards. Expected results are in the comments.

-- Should return ZERO rows: no always-true policy left on profiles.
--   SELECT policyname, qual FROM pg_policies
--    WHERE tablename='profiles' AND qual='true';

-- Should return ZERO rows: anon and authenticated hold no write grants.
--   SELECT table_name, grantee, privilege_type
--     FROM information_schema.role_table_grants
--    WHERE table_schema='public'
--      AND grantee IN ('anon','authenticated')
--      AND privilege_type IN ('INSERT','UPDATE','DELETE')
--      AND table_name IN ('listings','bookings','reviews','messages','deals',
--                         'reports','referrals','profiles');
--   (profiles legitimately keeps INSERT/UPDATE - the trigger guards the
--    columns that matter, so exclude it from the expectation.)

-- Should FAIL with 'role may not be changed to or from an admin role'
-- when run as a normal signed-in user:
--   UPDATE profiles SET role='superadmin' WHERE id = auth.uid();
