-- Remove a profile from public display when it may belong to someone under 18.
-- Reversible. Replace <PROFILE_ID> before running. Deletes nothing.
--
-- Effect: the public_profiles view still returns the row, but with the
-- name, photo and bio blanked, and every listing by that profile is paused.
-- The account itself is untouched so the person (or guardian) can respond.
-- See docs/policies/age-and-safeguarding.md.

BEGIN;
INSERT INTO public._backup_admin_actions (action, target_id, previous)
SELECT 'hide_profile', id, jsonb_build_object('name', name, 'preferred_name', preferred_name, 'custom_pfp', custom_pfp, 'about_me', about_me, 'bio', bio)
  FROM public.profiles WHERE id = '<PROFILE_ID>';

UPDATE public.profiles
   SET name = 'MigRent member', preferred_name = NULL, custom_pfp = NULL, about_me = NULL, bio = NULL
 WHERE id = '<PROFILE_ID>';

UPDATE public.listings
   SET moderation_status = 'paused', paused_at = now(), paused_by_admin = true,
       moderation_reason = 'Paused pending age and identity confirmation'
 WHERE owner_id = '<PROFILE_ID>' AND moderation_status IN ('approved', 'pending_approval');
COMMIT;

-- ROLLBACK:
-- UPDATE public.profiles p SET name = b.previous->>'name', preferred_name = b.previous->>'preferred_name',
--        custom_pfp = b.previous->>'custom_pfp', about_me = b.previous->>'about_me', bio = b.previous->>'bio'
--   FROM (SELECT * FROM public._backup_admin_actions WHERE action='hide_profile' AND target_id='<PROFILE_ID>' ORDER BY id DESC LIMIT 1) b
--  WHERE p.id = b.target_id;
