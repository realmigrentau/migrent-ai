-- ════════════════════════════════════════════════════════════════════════
-- 049: Phase D property managers (MIGRENT_MASTER_AUDIT.md MIG-026)
--
-- A property manager lists homes for their owners. Renters should see who
-- they are dealing with: the agency's name and, where the state licenses
-- agents, its licence number. Both are set in Hub > Settings by an account
-- whose owner_kind is 'property_manager', and shown on the listing's owner
-- card (backend/public_dto.to_public_owner).
--
-- Additive only, safe in any order and before the backend (which reads
-- these columns when they exist and does without them when they do not).
-- Idempotent: safe to run twice.
-- ════════════════════════════════════════════════════════════════════════

BEGIN;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS agency_name text,
  ADD COLUMN IF NOT EXISTS agency_licence text;

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_agency_name_length;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_agency_name_length
  CHECK (agency_name IS NULL OR char_length(agency_name) <= 120);
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_agency_licence_length;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_agency_licence_length
  CHECK (agency_licence IS NULL OR char_length(agency_licence) <= 60);

COMMIT;
