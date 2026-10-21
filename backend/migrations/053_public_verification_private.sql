-- 053: public_verification cannot be listed (2026-10-20)
--
-- The view maps every account's internal user id to its email / phone / ID
-- check state, and anon could read all of it. Nothing outside the database
-- reads it: public_profiles (and so get_public_profile, migration 052) uses
-- it as the view owner, and the API uses the service role. Same reasoning as
-- 052 for public_profiles.

REVOKE SELECT ON public.public_verification FROM anon, authenticated;
NOTIFY pgrst, 'reload schema';
