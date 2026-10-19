-- 052: finishing hardening (2026-10-19)
--
-- 1. Public profiles can no longer be listed. Until now anyone with the
--    public anon key could read every row of public_profiles: every
--    account's name, bio, photos and internal user id (which
--    docs/security/public-data-contract.md says is never public), including
--    suspended accounts. Now:
--      * the view leaves out suspended accounts (disabled_at set);
--      * anon and authenticated lose SELECT on it;
--      * get_public_profile(lookup) returns ONE profile for a known public id
--        (or, for old links, a known UUID). The internal id is only included
--        for a signed-in caller, who needs it to message or report.
--
-- 2. Signed-in users lose direct SELECT on private tables. The site reads
--    them only through the API (service role); the browser reads nothing but
--    public_listings and get_public_profile. Taking the grant away means a
--    mistake in a row policy can no longer expose anything, and the tables
--    drop out of the GraphQL schema. The row policies that only existed for
--    those grants (and the write policies left over from before 046 revoked
--    every write grant) are dropped with them.
--
-- 3. Functions: is_superadmin() and the token cleanup cannot be called
--    without signing in.
--
-- 4. Performance: indexes for the 22 unindexed foreign keys, and one of the
--    two identical unique indexes on favorites goes.
--
-- 5. Storage: no direct uploads from the browser. "Authenticated users can
--    upload" let any signed-in account put any file at any path in the public
--    listing-images bucket, skipping the API's checks (file type from the
--    bytes, re-encoding, location data stripped from photos). Every upload
--    already goes through the API with the service key, which these policies
--    do not affect.
--
-- Backend: no change needed (service role). Frontend: hooks/useUserProfile.ts
-- and pages/users/profile/[id].tsx call get_public_profile. Apply after the
-- frontend that calls get_public_profile is deployed; before that, public
-- profile pages show "not found" for anonymous visitors.

BEGIN;

-- ── 1. Public profiles ──────────────────────────────────────

CREATE OR REPLACE VIEW public.public_profiles AS
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
        CASE
            WHEN COALESCE(v.fully_verified, false) THEN 'verified'::text
            WHEN (v.government_id_status = 'pending'::text) THEN 'pending'::text
            ELSE 'unverified'::text
        END AS verification_status,
    COALESCE(v.email_verified, false) AS email_verified,
    COALESCE(v.phone_verified, false) AS phone_verified,
    COALESCE(v.government_id_status, 'not_submitted'::text) AS government_id_status,
    p.average_rating,
    p.reviews_count,
    p.months_hosting,
    p.rooms_owned,
    p.properties_owned,
    p.created_at,
        CASE
            WHEN (s.conversations >= 3) THEN s.response_rate
            ELSE NULL::numeric
        END AS response_rate,
        CASE
            WHEN (s.conversations >= 3) THEN s.median_reply_hours
            ELSE NULL::double precision
        END AS median_reply_hours,
    COALESCE(s.conversations, (0)::bigint) AS response_sample_size
   FROM ((public.profiles p
     LEFT JOIN public.public_verification v ON ((v.user_id = p.id)))
     LEFT JOIN public.user_response_stats s ON ((s.user_id = p.id)))
  WHERE p.disabled_at IS NULL;

REVOKE SELECT ON public.public_profiles FROM anon, authenticated;
REVOKE SELECT ON public.user_response_stats FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_public_profile(lookup text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  found jsonb;
BEGIN
  IF lookup IS NULL THEN
    RETURN NULL;
  ELSIF lookup ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
    SELECT to_jsonb(v) INTO found FROM public.public_profiles v WHERE v.id = lookup::uuid;
  ELSIF lookup ~ '^[A-Za-z0-9_-]{4,40}$' THEN
    SELECT to_jsonb(v) INTO found FROM public.public_profiles v WHERE v.public_id = lookup;
  ELSE
    RETURN NULL;
  END IF;
  IF found IS NULL THEN
    RETURN NULL;
  END IF;
  -- The internal id is for signed-in people (messaging, reporting) only.
  IF auth.uid() IS NULL THEN
    found := found - 'id';
  END IF;
  RETURN found;
END;
$$;

REVOKE ALL ON FUNCTION public.get_public_profile(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_profile(text) TO anon, authenticated, service_role;

-- ── 2. Private tables: no direct reads from the browser ─────

REVOKE SELECT ON
  public.admin_audit_log,
  public.blocked_users,
  public.bookings,
  public.bypass_flags,
  public.deals,
  public.favorites,
  public.listings,
  public.mentor_reviews,
  public.mentor_sessions,
  public.mentors,
  public.messages,
  public.moderation_events,
  public.notification_subscriptions,
  public.notifications,
  public.payment_events,
  public.profiles,
  public.referrals,
  public.reports,
  public.support_events,
  public.support_requests,
  public.ticket_messages,
  public.ticket_tag_links,
  public.ticket_tags,
  public.tickets,
  public.verification_codes
FROM anon, authenticated;

DROP POLICY IF EXISTS "Users can delete their own blocks" ON public.blocked_users;
DROP POLICY IF EXISTS "Users can insert their own blocks" ON public.blocked_users;
DROP POLICY IF EXISTS "Users can view their own blocks" ON public.blocked_users;
DROP POLICY IF EXISTS "Users must accept legal terms to create bookings" ON public.bookings;
DROP POLICY IF EXISTS bookings_select_own ON public.bookings;
DROP POLICY IF EXISTS deals_participant_select ON public.deals;
DROP POLICY IF EXISTS "Users can manage own favorites" ON public.favorites;
DROP POLICY IF EXISTS help_articles_admin_all ON public.help_articles;
DROP POLICY IF EXISTS "Users must accept legal terms to create listings" ON public.listings;
DROP POLICY IF EXISTS listings_admin_read ON public.listings;
DROP POLICY IF EXISTS listings_owner_read ON public.listings;
DROP POLICY IF EXISTS "Service role full access mentor_reviews" ON public.mentor_reviews;
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.mentor_reviews;
DROP POLICY IF EXISTS "Service role full access mentor_sessions" ON public.mentor_sessions;
DROP POLICY IF EXISTS "Mentors can view their sessions" ON public.mentor_sessions;
DROP POLICY IF EXISTS "Service role full access mentors" ON public.mentors;
DROP POLICY IF EXISTS "Anyone can view approved mentors" ON public.mentors;
DROP POLICY IF EXISTS "Users can send messages as themselves" ON public.messages;
DROP POLICY IF EXISTS "Users can see their own messages" ON public.messages;
DROP POLICY IF EXISTS messages_participant_select ON public.messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can delete their own tokens" ON public.notification_subscriptions;
DROP POLICY IF EXISTS "Users can insert their own tokens" ON public.notification_subscriptions;
DROP POLICY IF EXISTS "Users can view their own tokens" ON public.notification_subscriptions;
DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS profiles_insert_own ON public.profiles;
DROP POLICY IF EXISTS profiles_select_admin ON public.profiles;
DROP POLICY IF EXISTS profiles_select_own ON public.profiles;
DROP POLICY IF EXISTS profiles_update_own ON public.profiles;
DROP POLICY IF EXISTS referrals_own_select ON public.referrals;
DROP POLICY IF EXISTS "Users can insert reports" ON public.reports;
DROP POLICY IF EXISTS reports_own_select ON public.reports;
DROP POLICY IF EXISTS "Users can view own reports" ON public.reports;
DROP POLICY IF EXISTS support_events_agent_select ON public.support_events;
DROP POLICY IF EXISTS ticket_messages_insert ON public.ticket_messages;
DROP POLICY IF EXISTS ticket_messages_select ON public.ticket_messages;
DROP POLICY IF EXISTS tickets_user_insert ON public.tickets;
DROP POLICY IF EXISTS tickets_user_select ON public.tickets;
DROP POLICY IF EXISTS tickets_agent_update ON public.tickets;
DROP POLICY IF EXISTS "Service role only for verification_codes" ON public.verification_codes;
DROP POLICY IF EXISTS bookings_service_all ON public.bookings;

-- ── 3. Functions ────────────────────────────────────────────

-- Nothing anonymous needs the admin check.
REVOKE EXECUTE ON FUNCTION public.is_superadmin() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.cleanup_expired_cross_device_tokens() FROM PUBLIC, anon, authenticated;

-- ── 4. Indexes ──────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_admin_panel_settings_updated_by ON public.admin_panel_settings (updated_by);
CREATE INDEX IF NOT EXISTS idx_application_documents_document ON public.application_documents (document_id);
CREATE INDEX IF NOT EXISTS idx_application_owner_notes_owner ON public.application_owner_notes (owner_id);
CREATE INDEX IF NOT EXISTS idx_favorites_listing ON public.favorites (listing_id);
CREATE INDEX IF NOT EXISTS idx_inspection_bookings_listing ON public.inspection_bookings (listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_drafts_listing ON public.listing_drafts (listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_drafts_property ON public.listing_drafts (property_id);
CREATE INDEX IF NOT EXISTS idx_listings_moderator ON public.listings (moderator_id);
CREATE INDEX IF NOT EXISTS idx_listings_reviewed_by ON public.listings (reviewed_by);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_listing ON public.maintenance_requests (listing_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_tenancy ON public.maintenance_requests (tenancy_id);
CREATE INDEX IF NOT EXISTS idx_mentor_reviews_seeker ON public.mentor_reviews (seeker_id);
CREATE INDEX IF NOT EXISTS idx_mentors_reviewed_by ON public.mentors (reviewed_by);
CREATE INDEX IF NOT EXISTS idx_moderation_events_actor ON public.moderation_events (actor_id);
CREATE INDEX IF NOT EXISTS idx_move_in_payments_renter ON public.move_in_payments (renter_id);
CREATE INDEX IF NOT EXISTS idx_payment_events_deal ON public.payment_events (deal_id);
CREATE INDEX IF NOT EXISTS idx_reports_reporter ON public.reports (reporter_id);
CREATE INDEX IF NOT EXISTS idx_support_events_actor ON public.support_events (actor_id);
CREATE INDEX IF NOT EXISTS idx_tenancies_property ON public.tenancies (property_id);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_sender ON public.ticket_messages (sender_id);
CREATE INDEX IF NOT EXISTS idx_ticket_tag_links_tag ON public.ticket_tag_links (tag_id);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned_to ON public.tickets (assigned_to);

-- favorites_user_id_listing_id_key (the UNIQUE constraint) stays.
DROP INDEX IF EXISTS public.favorites_user_listing_key;

-- ── 5. Storage: uploads only through the API ───────────────

DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload listing images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own listing images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Owners upload own ID docs" ON storage.objects;
DROP POLICY IF EXISTS "Owners read own ID docs" ON storage.objects;

COMMIT;
