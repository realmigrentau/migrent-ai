-- ════════════════════════════════════════════════════════════════════════
-- 046: Phase A lockdown (MIGRENT_MASTER_AUDIT.md MIG-001, MIG-002, MIG-018,
--      MIG-019, MIG-036, MIG-065, and the mentor checks)
--
-- The browser never writes Migrent's tables: every change goes through the
-- FastAPI backend under the service role, which does the authorisation
-- (docs/hub.md, "The browser never writes Hub tables"). Older RLS policies
-- and Supabase's default grants still let a signed-in user write some tables
-- directly through the REST API with the public anon key, bypassing every
-- check the API makes:
--   * owner_verification: a user could mark their own government ID as
--     approved, which shows "ID-checked host" and passes the publish gate.
--   * profiles: a suspended user could clear disabled_at; badges and
--     response statistics shown to renters were self-editable.
--   * mentors / mentor_sessions / mentor_reviews: ratings, "verified",
--     session status and amounts were self-editable.
--   * tickets: anyone, signed in or not, could insert tickets directly.
-- This migration removes those paths, and:
--   * hides a suspended owner's listings from public_listings,
--   * adds user_mfa_enrolled() so the API can insist on two-step sign-in,
--   * adds the mentor review columns (a mentor is listed only after an ID
--     check and Migrent's approval),
--   * moves Contact-form messages (support_requests, which no screen reads)
--     into the Support queue,
--   * drops admin_users_view and cross_device_tokens (nothing uses them).
--
-- Deploy order: backend first (it already writes only with the service role
-- and tolerates this migration being absent), then this migration.
-- Idempotent: safe to run twice.
-- ════════════════════════════════════════════════════════════════════════

BEGIN;

-- ──────────────────────────────────────────────────────────────
-- 1. No direct writes from the browser
-- ──────────────────────────────────────────────────────────────
-- TRUNCATE ignores RLS entirely; nothing client-side needs it, TRIGGER or
-- REFERENCES either.
REVOKE TRUNCATE, TRIGGER, REFERENCES ON ALL TABLES IN SCHEMA public FROM anon, authenticated;

-- Signed-out visitors write nothing directly.
REVOKE INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public FROM anon;

-- Signed-in users write nothing directly either. Blocking, the last
-- browser write, now goes through the Hub API (/hub/blocks, MIG-032), so
-- blocked_users has no exception.
REVOKE INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public FROM authenticated;

-- Signed-out visitors read only the three public contract views
-- (frontend/hooks/useProfileData.ts, useUserProfile.ts,
-- lib/suburbs/listings.server.ts). The views are SECURITY DEFINER, so they
-- still read their base tables.
REVOKE SELECT ON ALL TABLES IN SCHEMA public FROM anon;
GRANT SELECT ON public.public_listings, public.public_profiles, public.public_verification TO anon, authenticated;


-- ──────────────────────────────────────────────────────────────
-- 2. owner_verification: Migrent staff only (MIG-001)
-- ──────────────────────────────────────────────────────────────
REVOKE ALL ON public.owner_verification FROM anon, authenticated;
DROP POLICY IF EXISTS "Users can insert own verification" ON public.owner_verification;
DROP POLICY IF EXISTS "Users can update own verification" ON public.owner_verification;
DROP POLICY IF EXISTS "Users can read own verification" ON public.owner_verification;

-- Belt and braces: even a role that gains a grant later cannot change it.
CREATE OR REPLACE FUNCTION public.guard_owner_verification()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  IF current_user IN ('service_role', 'postgres', 'supabase_admin', 'supabase_auth_admin') THEN
    RETURN NEW;
  END IF;
  RAISE EXCEPTION 'owner_verification is managed by the Migrent API'
    USING ERRCODE = 'insufficient_privilege';
END $$;

DROP TRIGGER IF EXISTS owner_verification_guard ON public.owner_verification;
CREATE TRIGGER owner_verification_guard
  BEFORE INSERT OR UPDATE ON public.owner_verification
  FOR EACH ROW EXECUTE FUNCTION public.guard_owner_verification();


-- ──────────────────────────────────────────────────────────────
-- 3. profiles: system columns (MIG-002)
-- ──────────────────────────────────────────────────────────────
-- Section 1 already removed direct writes. The guard also covers any role
-- other than the service role, and now includes suspension, badges, the
-- response statistics renters see, and the onboarding/terms/MFA markers.
CREATE OR REPLACE FUNCTION public.guard_profile_privilege_columns()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
  protected CONSTANT text[] := ARRAY[
    'role', 'is_admin', 'public_id', 'over_18_confirmed_at',
    'verified', 'is_verified', 'identity_verified', 'identity_verification_url',
    'verified_date', 'verification_method',
    'average_rating', 'reviews_count',
    'disabled_at', 'badges', 'response_rate', 'response_time', 'months_hosting',
    'email_verified', 'two_factor_enabled', 'onboarding_completed', 'onboarding_completed_at',
    'hub_onboarded_at', 'legal_accepted_at', 'owner_kind', 'wishlist', 'recovery_password_hash'
  ];
  col     text;
  old_row jsonb := to_jsonb(OLD);
  new_row jsonb := to_jsonb(NEW);
BEGIN
  IF current_user IN ('service_role', 'postgres', 'supabase_admin') THEN
    RETURN NEW;
  END IF;
  FOREACH col IN ARRAY protected LOOP
    IF (old_row ? col) AND (new_row -> col) IS DISTINCT FROM (old_row -> col) THEN
      RAISE EXCEPTION
        'column "%" cannot be set directly; it is managed by the Migrent API', col
        USING ERRCODE = 'insufficient_privilege';
    END IF;
  END LOOP;
  RETURN NEW;
END $$;


-- ──────────────────────────────────────────────────────────────
-- 4. Mentors: API-only writes, listed only after review (MIG-018)
-- ──────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can insert their own mentor profile" ON public.mentors;
DROP POLICY IF EXISTS "Users can update their own mentor profile" ON public.mentors;
DROP POLICY IF EXISTS "Seekers can create sessions" ON public.mentor_sessions;
DROP POLICY IF EXISTS "Participants can update sessions" ON public.mentor_sessions;
DROP POLICY IF EXISTS "Seekers can write reviews" ON public.mentor_reviews;

ALTER TABLE public.mentors ADD COLUMN IF NOT EXISTS review_status text NOT NULL DEFAULT 'pending';
ALTER TABLE public.mentors ADD COLUMN IF NOT EXISTS reviewed_at timestamptz;
ALTER TABLE public.mentors ADD COLUMN IF NOT EXISTS reviewed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.mentors ADD COLUMN IF NOT EXISTS review_reason text;
ALTER TABLE public.mentors DROP CONSTRAINT IF EXISTS mentors_review_status_check;
ALTER TABLE public.mentors ADD CONSTRAINT mentors_review_status_check
  CHECK (review_status IN ('pending', 'approved', 'rejected'));
CREATE INDEX IF NOT EXISTS idx_mentors_review_status ON public.mentors (review_status) WHERE review_status = 'pending';

-- Nobody was approved under the old flow: every existing mentor waits for
-- review (there is one, inactive, in production on 2026-10-01).
UPDATE public.mentors SET review_status = 'pending', verified = false
 WHERE review_status IS DISTINCT FROM 'approved' AND reviewed_at IS NULL;

DROP POLICY IF EXISTS "Anyone can view active mentors" ON public.mentors;
CREATE POLICY "Anyone can view approved mentors" ON public.mentors
  FOR SELECT USING (active = true AND review_status = 'approved');


-- ──────────────────────────────────────────────────────────────
-- 5. Two-step verification lookup for the API (MIG-019)
-- ──────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.user_mfa_enrolled(uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.mfa_factors f
     WHERE f.user_id = uid AND f.status = 'verified'::auth.factor_status
  );
$$;
REVOKE ALL ON FUNCTION public.user_mfa_enrolled(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.user_mfa_enrolled(uuid) TO service_role;


-- ──────────────────────────────────────────────────────────────
-- 6. A suspended owner's listings are not public (MIG-002)
-- ──────────────────────────────────────────────────────────────
-- Same columns as migration 042; only the WHERE clause gains the owner's
-- suspension. Mirrors listing_lifecycle.public_filter in the API.
CREATE OR REPLACE VIEW public.public_listings AS
 SELECT l.id,
    l.title,
    l.suburb,
    l.city,
    l.postcode,
    l.weekly_price,
    l.daily_price,
    l.description,
    l.images,
    l.property_type,
    l.place_type,
    l.room_type,
    l.bedrooms,
    l.beds,
    l.bathrooms,
    l.bathroom_type,
    l.max_guests,
    l.furnished,
    l.bills_included,
    l.parking,
    l.air_conditioning,
    l.pets_allowed,
    l.pet_details,
    l.couples_ok,
    l.gender_preference,
    l.instant_book,
    l.instant_book_enabled,
    l.internet_included,
    l.internet_speed,
    l.laundry,
    l.dishwasher,
    l.available_from,
    l.available_to,
    l.min_stay,
    l.min_stay_weeks,
    l.max_stay_weeks,
    l.nearest_transport,
    l.station_distance_min,
    l.neighbourhood_vibe,
    l.highlights,
    l.no_smoking,
    l.quiet_hours,
    l.tenant_prefs,
    l.security_cameras,
    l.security_cameras_location,
    l.other_safety_details,
    l.who_else_lives_here,
    l.total_other_people,
    l.weekly_discount,
    l.monthly_discount,
    l.bond,
    l.created_at,
    l.updated_at,
    (COALESCE(l.suburb, l.city, ''::text) || ' '::text) || COALESCE(l.postcode::text, ''::text) AS display_address,
    p.public_id AS owner_public_id,
        CASE
            WHEN l.latitude IS NULL THEN NULL::numeric
            ELSE round(l.latitude + ((abs(hashtext(l.id::text || 'lat'::text)) % 1000)::numeric / 1000.0 - 0.5) * 0.007, 3)
        END AS approx_lat,
        CASE
            WHEN l.longitude IS NULL THEN NULL::numeric
            ELSE round(l.longitude + ((abs(hashtext(l.id::text || 'lng'::text)) % 1000)::numeric / 1000.0 - 0.5) * 0.008, 3)
        END AS approx_lng
   FROM listings l
     LEFT JOIN profiles p ON p.id = l.owner_id
  WHERE l.moderation_status = 'approved'::text
    AND l.hidden_at IS NULL
    AND (l.available_to IS NULL OR l.available_to >= CURRENT_DATE)
    AND p.disabled_at IS NULL;


-- ──────────────────────────────────────────────────────────────
-- 7. Things nothing uses any more (MIG-036, MIG-020)
-- ──────────────────────────────────────────────────────────────
-- admin_users_view exposed auth.users (filtered to superadmins, but with
-- write grants to every signed-in user); only the retired /admin pages
-- read it.
DROP VIEW IF EXISTS public.admin_users_view;
-- The cross-device sign-in relay (removed from the API) kept live session
-- tokens here. Empty on 2026-10-01.
DROP TABLE IF EXISTS public.cross_device_tokens;

-- Trigger functions run from their triggers; nobody needs to call them over
-- the REST API (/rest/v1/rpc/...).
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.audit_owner_verification() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.sync_legal_acceptance() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.sync_profile_verification() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.guard_owner_verification() FROM PUBLIC, anon, authenticated;


-- ──────────────────────────────────────────────────────────────
-- 8. Admin audit log: mentor reviews
-- ──────────────────────────────────────────────────────────────
ALTER TABLE public.admin_audit_log DROP CONSTRAINT IF EXISTS admin_audit_log_action_check;
ALTER TABLE public.admin_audit_log ADD CONSTRAINT admin_audit_log_action_check
  CHECK (action IN (
    'approve', 'reject', 'request_changes', 'suspend_user', 'unsuspend_user',
    'flag', 'hide', 'unflag', 'request_delete', 'confirm_delete',
    'pause', 'unpause', 'approve_id', 'reject_id',
    'finalise_application', 'stop_application', 'request_application_corrections',
    'view_as_start', 'view_as_end',
    'assign_report', 'resolve_report', 'dismiss_report', 'change_role',
    'admin_panel_unlock', 'admin_panel_failed', 'admin_panel_lockout', 'admin_panel_password_changed',
    'approve_mentor', 'reject_mentor', 'hide_review', 'restore_review', 'view_conversation'
  ));
ALTER TABLE public.admin_audit_log DROP CONSTRAINT IF EXISTS admin_audit_log_target_type_check;
ALTER TABLE public.admin_audit_log ADD CONSTRAINT admin_audit_log_target_type_check
  CHECK (target_type IN ('listing', 'user', 'owner_verification', 'application', 'report', 'tenancy', 'property', 'mentor', 'review'));


-- ──────────────────────────────────────────────────────────────
-- 9. Contact-form messages into the Support queue (MIG-065)
-- ──────────────────────────────────────────────────────────────
-- /support/contact now creates a ticket like the help button does. Earlier
-- messages sat in support_requests, which no admin screen reads; copy them
-- across with their original dates (same ids, so this runs once).
INSERT INTO public.tickets (id, user_id, email, name, status, priority, category, source, subject, created_at, updated_at)
SELECT sr.id, NULL, sr.email, sr.name, 'open', 'normal', 'feedback', 'contact_form',
       'Contact form: ' || left(regexp_replace(coalesce(sr.message, ''), '\s+', ' ', 'g'), 80),
       sr.created_at, sr.created_at
  FROM public.support_requests sr
 WHERE NOT EXISTS (SELECT 1 FROM public.tickets t WHERE t.id = sr.id);

INSERT INTO public.ticket_messages (ticket_id, sender_id, sender_type, body, is_internal, created_at)
SELECT sr.id, NULL, 'user',
       coalesce(sr.message, '') || E'\n\n(Sent from the Contact page as "' || coalesce(sr.role, 'unknown') || '")',
       false, sr.created_at
  FROM public.support_requests sr
 WHERE NOT EXISTS (SELECT 1 FROM public.ticket_messages m WHERE m.ticket_id = sr.id);

COMMIT;
