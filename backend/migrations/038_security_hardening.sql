-- 038_security_hardening.sql
-- Closes the security findings from the 2026-07-25 launch scan.
--
-- PREREQUISITE: deploy the backend changes in the same commit first.
-- routes_deals.py, routes_support.py and routes_referrals.py were moved from
-- the anon client to get_supabase_admin(). The service role bypasses RLS, so
-- the deny-by-default posture below does not block any server-side write.
-- Applying this migration against the OLD backend would break the Stripe
-- webhook, the contact form and referral codes.


-- ══════════════════════════════════════════════════════════════
-- 1. Enable RLS on the six exposed tables
-- ══════════════════════════════════════════════════════════════
-- These are written only by the backend under the service role. No policies
-- are added on purpose: anon and authenticated get no access at all.
-- cross_device_tokens is the urgent one - it holds access_token and
-- refresh_token, which were readable by anyone holding the public anon key.

ALTER TABLE public.payment_events      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bypass_flags        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cross_device_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_tags         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_tag_links    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_requests    ENABLE ROW LEVEL SECURITY;

-- support_requests carried a policy while RLS was off, so the policy did
-- nothing. The contact form posts through the backend, never from the browser.
DROP POLICY IF EXISTS "Public can submit support" ON public.support_requests;


-- ══════════════════════════════════════════════════════════════
-- 2. Replace policies whose conditions were always true
-- ══════════════════════════════════════════════════════════════
-- Each of these was named for the service role but scoped to `public`, which
-- means anon and authenticated. The service role bypasses RLS regardless, so
-- dropping them costs nothing and closes real holes.

-- Anyone could read and write the admin audit trail.
DROP POLICY IF EXISTS "Admins can insert audit logs" ON public.admin_audit_log;
DROP POLICY IF EXISTS "Admins can read audit logs"   ON public.admin_audit_log;

-- Anyone could read and write moderation decisions.
DROP POLICY IF EXISTS "Service role can manage moderation events" ON public.moderation_events;

-- Anyone could push a notification to any user. The three user-scoped
-- policies on this table (select/update/delete own) are correct and stay.
DROP POLICY IF EXISTS "Service role can insert notifications" ON public.notifications;

-- Any authenticated user could update ANY referral row - a direct route to
-- referral-credit fraud. Scope it to the referrer who owns the row.
DROP POLICY IF EXISTS referrals_own_update ON public.referrals;

CREATE POLICY referrals_own_update ON public.referrals
  FOR UPDATE TO authenticated
  USING      ((auth.uid())::text = (referrer_id)::text)
  WITH CHECK ((auth.uid())::text = (referrer_id)::text);


-- ══════════════════════════════════════════════════════════════
-- 3. SECURITY DEFINER views
-- ══════════════════════════════════════════════════════════════
-- The two review-stat views only aggregate unflagged reviews, which
-- reviews_public_read already exposes to everyone. They have no reason to run
-- with the owner's privileges.

ALTER VIEW public.user_review_stats    SET (security_invoker = true);
ALTER VIEW public.listing_review_stats SET (security_invoker = true);

-- admin_users_view joins auth.users and must stay SECURITY DEFINER to read it,
-- but as written ANY authenticated user querying it received every user's
-- email address. The admin dashboard reads this view directly from the browser
-- (frontend/lib/adminApi.ts), so it cannot simply be revoked from
-- authenticated. Guard the view body instead: is_superadmin() checks
-- profiles.role for auth.uid(), so a non-superadmin now gets zero rows.
CREATE OR REPLACE VIEW public.admin_users_view AS
  SELECT p.id,
         p.role,
         p.verified,
         p.created_at,
         p.name,
         p.legal_name,
         u.email,
         (u.raw_user_meta_data ->> 'full_name'::text) AS google_name,
         (u.raw_user_meta_data ->> 'avatar_url'::text) AS avatar_url,
         u.last_sign_in_at,
         u.email_confirmed_at
    FROM (profiles p
      LEFT JOIN auth.users u ON ((p.id = u.id)))
   WHERE public.is_superadmin();

-- Signed-out visitors have no business here at all.
REVOKE ALL ON public.admin_users_view FROM anon;


-- ══════════════════════════════════════════════════════════════
-- 4. Pin search_path on every function
-- ══════════════════════════════════════════════════════════════
-- A mutable search_path lets a caller shadow the objects a function resolves,
-- which is a privilege-escalation vector. handle_new_user, is_superadmin and
-- sync_legal_acceptance are SECURITY DEFINER, so they matter most.

ALTER FUNCTION public.handle_new_user()                       SET search_path = public, pg_temp;
ALTER FUNCTION public.is_superadmin()                         SET search_path = public, pg_temp;
ALTER FUNCTION public.sync_legal_acceptance()                 SET search_path = public, pg_temp;
ALTER FUNCTION public.cleanup_expired_cross_device_tokens()   SET search_path = public, pg_temp;
ALTER FUNCTION public.set_updated_at()                        SET search_path = public, pg_temp;
ALTER FUNCTION public.update_updated_at_column()              SET search_path = public, pg_temp;
ALTER FUNCTION public.update_bookings_updated_at()            SET search_path = public, pg_temp;
ALTER FUNCTION public.update_mentor_updated_at()              SET search_path = public, pg_temp;
ALTER FUNCTION public.update_owner_verification_updated_at()  SET search_path = public, pg_temp;


-- ══════════════════════════════════════════════════════════════
-- 5. Storage: stop the public buckets being enumerable
-- ══════════════════════════════════════════════════════════════
-- listing-images had three identical SELECT policies and there were two
-- identical INSERT policies - policy drift from repeated dashboard edits.
--
-- A SELECT policy on storage.objects governs the list/metadata API, NOT the
-- public object URL. Public buckets serve /object/public/... without RLS, so
-- removing these keeps every image loading while blocking enumeration of files
-- belonging to unpublished or deleted listings. Verified: nothing in the
-- codebase calls storage .list(); the frontend uses upload() + getPublicUrl().

DROP POLICY IF EXISTS "Public read access"                   ON storage.objects;
DROP POLICY IF EXISTS "Public read access 1i0okip_0"         ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view listing images"       ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view avatars"              ON storage.objects;

-- Duplicate INSERT policy, identical to "Authenticated users can upload".
DROP POLICY IF EXISTS "Authenticated users can upload 1i0okip_0" ON storage.objects;

-- owner-id-docs is private and its owner-scoped policies are correct. Left alone.
