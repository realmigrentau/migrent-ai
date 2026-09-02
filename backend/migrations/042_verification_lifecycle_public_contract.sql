-- 042_verification_lifecycle_public_contract.sql
-- One authoritative verification model, a full listing lifecycle, and a
-- public data contract enforced in the database (not only in the API).
--
-- ══════════════════════════════════════════════════════════════
-- READ THIS BEFORE RUNNING
-- ══════════════════════════════════════════════════════════════
-- PREREQUISITE: deploy the backend and frontend from the same commit FIRST.
--   * The backend reads the new columns (public_id, listing_fee_paid_at,
--     paused_at, attachment_path, payment_events.stripe_event_id).
--   * The frontend reads `public_listings` and the rebuilt `public_profiles`.
--   Running this against an OLD frontend breaks the homepage "top listings"
--   strip and public profile pages, because anon can no longer read
--   `listings` directly.
--
-- Everything here is idempotent and safe to re-run. It does not delete
-- rows. The only data it rewrites is profiles.badges (trust words removed),
-- and the previous values are copied to _backup_042_profile_badges first.
--
-- Run 039, 040 and 041 before this one.

CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- ══════════════════════════════════════════════════════════════
-- 1. Listing lifecycle columns and the complete status set
-- ══════════════════════════════════════════════════════════════
-- 037 allowed flagged/hidden/delete_requested; 039 and 040 re-created the
-- constraint without them, so the spam system's writes have been failing
-- silently ever since. This is the union, plus paused and expired.

ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS paused_at           timestamptz,
  ADD COLUMN IF NOT EXISTS paused_by_admin     boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS expired_at          timestamptz,
  ADD COLUMN IF NOT EXISTS expiry_notified_at  timestamptz,
  ADD COLUMN IF NOT EXISTS listing_fee_paid_at timestamptz;

DO $$
DECLARE con record;
BEGIN
  FOR con IN
    SELECT conname FROM pg_constraint
     WHERE conrelid = 'public.listings'::regclass AND contype = 'c'
       AND pg_get_constraintdef(oid) ILIKE '%moderation_status%'
  LOOP
    EXECUTE format('ALTER TABLE public.listings DROP CONSTRAINT %I', con.conname);
  END LOOP;
END $$;

ALTER TABLE public.listings ADD CONSTRAINT listings_moderation_status_check
  CHECK (moderation_status IN (
    'draft', 'pending_approval', 'changes_requested', 'approved',
    'paused', 'expired', 'rejected', 'flagged', 'hidden',
    'delete_requested', 'deleted'
  ));

CREATE INDEX IF NOT EXISTS idx_listings_available_to ON public.listings (available_to);
CREATE INDEX IF NOT EXISTS idx_listings_public
  ON public.listings (moderation_status, available_to) WHERE hidden_at IS NULL;

-- moderation_events: the lifecycle emits more event types than 037 knew.
ALTER TABLE public.moderation_events DROP CONSTRAINT IF EXISTS moderation_events_event_type_check;
ALTER TABLE public.moderation_events ADD CONSTRAINT moderation_events_event_type_check
  CHECK (event_type IN (
    'spam_scan', 'flagged', 'hidden', 'approved', 'rejected', 'changes_requested',
    'delete_requested', 'delete_approved', 'unflagged', 'owner_edited', 'score_updated',
    'submitted', 'paused', 'unpaused', 'expired', 'renewed', 'archived', 'published'
  ));

-- admin_audit_log: new actions and the owner_verification target used by
-- routes_owner_verification (which was violating the old CHECK).
ALTER TABLE public.admin_audit_log DROP CONSTRAINT IF EXISTS admin_audit_log_action_check;
ALTER TABLE public.admin_audit_log ADD CONSTRAINT admin_audit_log_action_check
  CHECK (action IN (
    'approve', 'reject', 'request_changes', 'suspend_user', 'unsuspend_user',
    'flag', 'hide', 'unflag', 'request_delete', 'confirm_delete',
    'pause', 'unpause', 'approve_id', 'reject_id'
  ));
ALTER TABLE public.admin_audit_log DROP CONSTRAINT IF EXISTS admin_audit_log_target_type_check;
ALTER TABLE public.admin_audit_log ADD CONSTRAINT admin_audit_log_target_type_check
  CHECK (target_type IN ('listing', 'user', 'owner_verification'));


-- ══════════════════════════════════════════════════════════════
-- 2. Profiles: opaque public id, adults-only confirmation
-- ══════════════════════════════════════════════════════════════

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS public_id             text,
  ADD COLUMN IF NOT EXISTS over_18_confirmed_at  timestamptz;

UPDATE public.profiles SET public_id = encode(gen_random_bytes(6), 'hex') WHERE public_id IS NULL;
ALTER TABLE public.profiles ALTER COLUMN public_id SET DEFAULT encode(gen_random_bytes(6), 'hex');
ALTER TABLE public.profiles ALTER COLUMN public_id SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS profiles_public_id_key ON public.profiles (public_id);

-- public_id is routing identity, not something a user should be able to
-- rewrite to impersonate another profile's URL. Add it to the guarded set.
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
    'average_rating', 'reviews_count'
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
        'column "%" cannot be set directly; it is managed by the MigRent API', col
        USING ERRCODE = 'insufficient_privilege';
    END IF;
  END LOOP;
  RETURN NEW;
END $$;


-- ══════════════════════════════════════════════════════════════
-- 3. Badges are not trust. Strip trust words, then forbid them.
-- ══════════════════════════════════════════════════════════════
-- POST /profiles/badges/refresh used to award "Verified host" to anyone
-- with a listing. The public listing page rendered that string as a badge
-- next to identity_verified = false.

CREATE TABLE IF NOT EXISTS public._backup_042_profile_badges (
  id uuid PRIMARY KEY,
  badges text[],
  backed_up_at timestamptz DEFAULT now()
);
INSERT INTO public._backup_042_profile_badges (id, badges)
SELECT id, badges FROM public.profiles
 WHERE badges IS NOT NULL
   AND EXISTS (SELECT 1 FROM unnest(badges) b WHERE lower(b) ~ '(verif|identity|id check|trusted|vetted|checked|safe)')
ON CONFLICT (id) DO NOTHING;

UPDATE public.profiles
   SET badges = ARRAY(SELECT b FROM unnest(badges) b WHERE lower(b) !~ '(verif|identity|id check|trusted|vetted|checked|safe)')
 WHERE badges IS NOT NULL
   AND EXISTS (SELECT 1 FROM unnest(badges) b WHERE lower(b) ~ '(verif|identity|id check|trusted|vetted|checked|safe)');

CREATE OR REPLACE FUNCTION public.guard_profile_badges()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE b text;
BEGIN
  IF NEW.badges IS NULL THEN RETURN NEW; END IF;
  FOREACH b IN ARRAY NEW.badges LOOP
    IF lower(b) ~ '(verif|identity|id check|trusted|vetted|checked|safe)' THEN
      RAISE EXCEPTION 'badge "%" reads as a trust claim; verification state comes from owner_verification only', b
        USING ERRCODE = 'check_violation';
    END IF;
  END LOOP;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS profiles_guard_badges ON public.profiles;
CREATE TRIGGER profiles_guard_badges
  BEFORE INSERT OR UPDATE OF badges ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.guard_profile_badges();


-- ══════════════════════════════════════════════════════════════
-- 4. Verification: one source of truth, mirrored and audited
-- ══════════════════════════════════════════════════════════════
-- owner_verification is authoritative. profiles.identity_verified is kept
-- in sync by trigger for legacy readers, and every change is audited with
-- actor, before, after and reason.

CREATE TABLE IF NOT EXISTS public.verification_audit_log (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                  uuid NOT NULL,
  actor_id                 uuid,
  actor_type               text NOT NULL CHECK (actor_type IN ('owner', 'admin', 'system')),
  previous_status          text,
  new_status               text,
  previous_fully_verified  boolean,
  new_fully_verified       boolean,
  reason                   text,
  created_at               timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_verification_audit_user ON public.verification_audit_log (user_id, created_at DESC);
ALTER TABLE public.verification_audit_log ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.verification_audit_log FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.audit_owner_verification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_actor uuid;
  v_actor_type text;
BEGIN
  IF TG_OP = 'UPDATE'
     AND OLD.id_status IS NOT DISTINCT FROM NEW.id_status
     AND OLD.fully_verified IS NOT DISTINCT FROM NEW.fully_verified THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' AND NEW.id_reviewed_by IS DISTINCT FROM OLD.id_reviewed_by AND NEW.id_reviewed_by IS NOT NULL THEN
    v_actor := NEW.id_reviewed_by; v_actor_type := 'admin';
  ELSIF auth.uid() IS NOT NULL THEN
    v_actor := auth.uid(); v_actor_type := 'owner';
  ELSE
    v_actor := NEW.user_id; v_actor_type := CASE WHEN current_user = 'service_role' THEN 'system' ELSE 'owner' END;
  END IF;

  INSERT INTO public.verification_audit_log
    (user_id, actor_id, actor_type, previous_status, new_status, previous_fully_verified, new_fully_verified, reason)
  VALUES (
    NEW.user_id, v_actor, v_actor_type,
    CASE WHEN TG_OP = 'UPDATE' THEN OLD.id_status END, NEW.id_status,
    CASE WHEN TG_OP = 'UPDATE' THEN OLD.fully_verified END, NEW.fully_verified,
    NEW.id_rejection_reason
  );
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS owner_verification_audit ON public.owner_verification;
CREATE TRIGGER owner_verification_audit
  AFTER INSERT OR UPDATE ON public.owner_verification
  FOR EACH ROW EXECUTE FUNCTION public.audit_owner_verification();

-- Mirror into profiles for legacy readers. SECURITY DEFINER so the profiles
-- privilege guard sees a trusted role.
CREATE OR REPLACE FUNCTION public.sync_profile_verification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE public.profiles
     SET identity_verified   = (NEW.id_status = 'approved' AND NEW.email_verified),
         verified_date       = CASE WHEN NEW.id_status = 'approved' THEN COALESCE(NEW.id_reviewed_at, now()) ELSE NULL END,
         verification_method = CASE WHEN NEW.id_status = 'approved' THEN NEW.id_document_type ELSE NULL END
   WHERE id = NEW.user_id;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS owner_verification_sync_profile ON public.owner_verification;
CREATE TRIGGER owner_verification_sync_profile
  AFTER INSERT OR UPDATE ON public.owner_verification
  FOR EACH ROW EXECUTE FUNCTION public.sync_profile_verification();

-- Backfill: profiles.identity_verified must agree with owner_verification.
UPDATE public.profiles p
   SET identity_verified = COALESCE(v.ok, false)
  FROM (SELECT user_id, (id_status = 'approved' AND email_verified) AS ok FROM public.owner_verification) v
 WHERE v.user_id = p.id AND p.identity_verified IS DISTINCT FROM COALESCE(v.ok, false);
UPDATE public.profiles p
   SET identity_verified = false
 WHERE identity_verified IS TRUE
   AND NOT EXISTS (SELECT 1 FROM public.owner_verification v WHERE v.user_id = p.id AND v.id_status = 'approved' AND v.email_verified);

-- The public trust surface. Booleans and states only: no phone numbers,
-- no document paths, no reviewer identities.
CREATE OR REPLACE VIEW public.public_verification AS
  SELECT user_id,
         email_verified,
         phone_verified,
         (id_status = 'approved') AS government_id_verified,
         CASE WHEN id_status IN ('approved', 'pending', 'rejected') THEN id_status ELSE 'not_submitted' END AS government_id_status,
         (fully_verified AND id_status = 'approved' AND email_verified) AS fully_verified,
         CASE WHEN fully_verified AND id_status = 'approved' THEN id_reviewed_at END AS verified_at
    FROM public.owner_verification;
ALTER VIEW public.public_verification SET (security_invoker = false);
GRANT SELECT ON public.public_verification TO anon, authenticated;


-- ══════════════════════════════════════════════════════════════
-- 5. A listing cannot be published unless its owner is verified
-- ══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.guard_listing_publish()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.moderation_status IN ('pending_approval', 'approved') THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.owner_verification v
       WHERE v.user_id = NEW.owner_id AND v.fully_verified AND v.id_status = 'approved'
    ) THEN
      RAISE EXCEPTION 'listing % cannot be % because its owner has not completed identity verification',
        NEW.id, NEW.moderation_status USING ERRCODE = 'check_violation';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = NEW.owner_id AND p.over_18_confirmed_at IS NOT NULL) THEN
      RAISE EXCEPTION 'listing % cannot be published: owner has not confirmed they are 18 or older', NEW.id
        USING ERRCODE = 'check_violation';
    END IF;
  END IF;
  IF NEW.moderation_status = 'approved' THEN
    IF COALESCE(jsonb_array_length(to_jsonb(NEW.images)), 0) = 0 THEN
      RAISE EXCEPTION 'listing % cannot be approved without photos', NEW.id USING ERRCODE = 'check_violation';
    END IF;
    IF NEW.available_to IS NOT NULL AND NEW.available_to < current_date THEN
      RAISE EXCEPTION 'listing % cannot be approved: available_to % has passed', NEW.id, NEW.available_to
        USING ERRCODE = 'check_violation';
    END IF;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS listings_require_verified_owner ON public.listings;
CREATE TRIGGER listings_require_verified_owner
  BEFORE INSERT OR UPDATE OF moderation_status ON public.listings
  FOR EACH ROW EXECUTE FUNCTION public.guard_listing_publish();


-- ══════════════════════════════════════════════════════════════
-- 6. Public data contract in the database
-- ══════════════════════════════════════════════════════════════
-- Anon no longer reads `listings` at all. The browser reads
-- `public_listings`: the allow-listed columns of approved, unhidden,
-- still-available rows, with an approximate map point instead of the pin.
-- Keep this column list identical to PUBLIC_LISTING_FIELDS in
-- backend/public_dto.py.

CREATE OR REPLACE VIEW public.public_listings AS
  SELECT l.id, l.title, l.suburb, l.city, l.postcode, l.weekly_price, l.daily_price,
         l.description, l.images, l.property_type, l.place_type, l.room_type,
         l.bedrooms, l.beds, l.bathrooms, l.bathroom_type, l.max_guests,
         l.furnished, l.bills_included, l.parking, l.air_conditioning,
         l.pets_allowed, l.pet_details, l.couples_ok, l.gender_preference,
         l.instant_book, l.instant_book_enabled, l.internet_included, l.internet_speed,
         l.laundry, l.dishwasher, l.available_from, l.available_to,
         l.min_stay, l.min_stay_weeks, l.max_stay_weeks,
         l.nearest_transport, l.station_distance_min, l.neighbourhood_vibe,
         l.highlights, l.no_smoking, l.quiet_hours, l.tenant_prefs,
         l.security_cameras, l.security_cameras_location, l.other_safety_details,
         l.who_else_lives_here, l.total_other_people, l.weekly_discount, l.monthly_discount,
         l.bond, l.created_at, l.updated_at,
         (COALESCE(l.suburb, l.city, '') || ' ' || COALESCE(l.postcode::text, '')) AS display_address,
         p.public_id AS owner_public_id,
         CASE WHEN l.latitude IS NULL THEN NULL
              ELSE round((l.latitude + ((abs(hashtext(l.id::text || 'lat')) % 1000) / 1000.0 - 0.5) * 0.007)::numeric, 3) END AS approx_lat,
         CASE WHEN l.longitude IS NULL THEN NULL
              ELSE round((l.longitude + ((abs(hashtext(l.id::text || 'lng')) % 1000) / 1000.0 - 0.5) * 0.008)::numeric, 3) END AS approx_lng
    FROM public.listings l
    LEFT JOIN public.profiles p ON p.id = l.owner_id
   WHERE l.moderation_status = 'approved'
     AND l.hidden_at IS NULL
     AND (l.available_to IS NULL OR l.available_to >= current_date);
ALTER VIEW public.public_listings SET (security_invoker = false);
GRANT SELECT ON public.public_listings TO anon, authenticated;

REVOKE SELECT ON public.listings FROM anon;
DROP POLICY IF EXISTS listings_public_read ON public.listings;
-- authenticated keeps listings_owner_read and listings_admin_read from 039.

-- public_profiles: add public_id, derive trust from owner_verification,
-- and stop exposing the paid `verified` flag as if it meant something.
DROP VIEW IF EXISTS public.public_profiles;
CREATE VIEW public.public_profiles AS
  SELECT p.id,
         p.public_id,
         p.name,
         p.preferred_name,
         p.about_me,
         p.bio,
         p.custom_pfp,
         p.occupation,
         p.work,
         p.location,
         p.interests,
         p.lifestyle,
         p.badges,
         p.languages,
         p.most_useless_skill,
         p.profile_photos,
         p.social_twitter,
         p.social_facebook,
         p.social_linkedin,
         COALESCE(v.fully_verified, false) AS identity_verified,
         v.verified_at AS verified_date,
         CASE WHEN COALESCE(v.fully_verified, false) THEN 'verified'
              WHEN v.government_id_status = 'pending' THEN 'pending'
              ELSE 'unverified' END AS verification_status,
         COALESCE(v.email_verified, false) AS email_verified,
         COALESCE(v.phone_verified, false) AS phone_verified,
         COALESCE(v.government_id_status, 'not_submitted') AS government_id_status,
         p.average_rating,
         p.reviews_count,
         p.months_hosting,
         p.rooms_owned,
         p.properties_owned,
         p.created_at,
         CASE WHEN s.conversations >= 3 THEN s.response_rate END AS response_rate,
         CASE WHEN s.conversations >= 3 THEN s.median_reply_hours END AS median_reply_hours,
         COALESCE(s.conversations, 0) AS response_sample_size
    FROM public.profiles p
    LEFT JOIN public.public_verification v ON v.user_id = p.id
    LEFT JOIN public.user_response_stats s ON s.user_id = p.id;
ALTER VIEW public.public_profiles SET (security_invoker = false);
GRANT SELECT ON public.public_profiles TO anon, authenticated;


-- ══════════════════════════════════════════════════════════════
-- 7. Payments: idempotency, reconciliation, refunds
-- ══════════════════════════════════════════════════════════════

ALTER TABLE public.payment_events
  ADD COLUMN IF NOT EXISTS stripe_event_id       text,
  ADD COLUMN IF NOT EXISTS stripe_payment_intent text,
  ADD COLUMN IF NOT EXISTS booking_id            uuid,
  ADD COLUMN IF NOT EXISTS payer                 text,
  ADD COLUMN IF NOT EXISTS raw_status            text,
  ADD COLUMN IF NOT EXISTS notes                 text;
CREATE UNIQUE INDEX IF NOT EXISTS payment_events_stripe_event_id_key
  ON public.payment_events (stripe_event_id) WHERE stripe_event_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_payment_events_booking ON public.payment_events (booking_id);

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS paid_at               timestamptz,
  ADD COLUMN IF NOT EXISTS refunded_at           timestamptz,
  ADD COLUMN IF NOT EXISTS stripe_payment_intent text,
  ADD COLUMN IF NOT EXISTS fee_waived            boolean NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS idx_bookings_stripe_session ON public.bookings (stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_intent ON public.bookings (stripe_payment_intent);

ALTER TYPE public.booking_status ADD VALUE IF NOT EXISTS 'REFUNDED';


-- ══════════════════════════════════════════════════════════════
-- 8. Message attachments move to a private bucket
-- ══════════════════════════════════════════════════════════════

ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS attachment_path text;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('message-attachments', 'message-attachments', false, 10485760,
        ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'])
ON CONFLICT (id) DO UPDATE SET public = false, file_size_limit = 10485760;
-- No storage policies on purpose: only the backend (service role) reads or
-- writes this bucket, and readers receive 10-minute signed URLs.


-- ══════════════════════════════════════════════════════════════
-- 9. Expiry job and admin RPC for the edge middleware
-- ══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.expire_listings()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE n integer;
BEGIN
  WITH moved AS (
    UPDATE public.listings
       SET moderation_status = 'expired', expired_at = now()
     WHERE moderation_status = 'approved'
       AND available_to IS NOT NULL
       AND available_to < current_date
    RETURNING id, owner_id, available_to
  )
  INSERT INTO public.moderation_events (listing_id, actor_type, event_type, old_status, new_status, notes)
  SELECT id, 'system', 'expired', 'approved', 'expired', 'available_to ' || available_to::text || ' passed'
    FROM moved;
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n;
END $$;
REVOKE ALL ON FUNCTION public.expire_listings() FROM public, anon, authenticated;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    BEGIN
      PERFORM cron.unschedule('migrent-expire-listings');
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    -- 14:15 UTC is 00:15 AEST, just after the day changes in Sydney.
    PERFORM cron.schedule('migrent-expire-listings', '15 14 * * *', $cron$SELECT public.expire_listings()$cron$);
  END IF;
END $$;

-- Used by frontend/proxy.ts to gate /admin at the edge with the caller's
-- own JWT. Reads the database, never user_metadata.
CREATE OR REPLACE FUNCTION public.current_user_is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
     WHERE id = auth.uid()
       AND (COALESCE(is_admin, false) OR role IN ('admin', 'superadmin'))
  );
$$;
REVOKE ALL ON FUNCTION public.current_user_is_admin() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.current_user_is_admin() TO authenticated;


-- ══════════════════════════════════════════════════════════════
-- 10. Verification
-- ══════════════════════════════════════════════════════════════
-- Expect ZERO rows: no profile carries a trust word as a badge.
--   SELECT id, badges FROM profiles
--    WHERE EXISTS (SELECT 1 FROM unnest(badges) b WHERE lower(b) ~ 'verif');
--
-- Expect ZERO rows: anon has no grant on listings.
--   SELECT grantee, privilege_type FROM information_schema.role_table_grants
--    WHERE table_name = 'listings' AND grantee = 'anon';
--
-- Expect the view to hide the pin: no latitude/longitude columns.
--   SELECT column_name FROM information_schema.columns
--    WHERE table_name = 'public_listings' AND column_name IN ('latitude','longitude','owner_id','address');
--
-- Expect an error when approving a listing whose owner is unverified:
--   UPDATE listings SET moderation_status = 'approved' WHERE id = '<unverified owner listing>';
