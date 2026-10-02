-- ════════════════════════════════════════════════════════════════════════
-- 047: Phase B listing costs and fit (MIGRENT_MASTER_AUDIT.md MIG-017, MIG-045)
--
-- Bond used to be free text ("4 weeks", "$1,200", anything), so it could not
-- be checked against a limit or added up into what a renter pays on day one.
-- It becomes whole weeks, capped by Migrent in every state (owner decision,
-- 2026-10-01; see backend/listing_rules.py):
--   * bond_weeks             0 to 4 weeks' rent
--   * rent_in_advance_weeks  0 to 2 weeks' rent
--   * bills_estimate_weekly  the host's estimate when bills are not included
-- and hosts can say a home welcomes people without Australian rental
-- history (newcomer_friendly), which renters can search for.
--
-- The old bond column stays (read-only) so nothing that still reads it
-- breaks; plain "N weeks" values are copied across.
--
-- Additive only: no view or policy changes, so it can be applied before the
-- release (the current backend ignores these columns) and in either order
-- with 046. Apply it no later than the backend in the same release, which
-- reads and writes these columns.
-- Idempotent: safe to run twice.
-- ════════════════════════════════════════════════════════════════════════

BEGIN;

ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS bond_weeks smallint,
  ADD COLUMN IF NOT EXISTS rent_in_advance_weeks smallint,
  ADD COLUMN IF NOT EXISTS bills_estimate_weekly integer,
  ADD COLUMN IF NOT EXISTS newcomer_friendly boolean NOT NULL DEFAULT false;

ALTER TABLE public.listings DROP CONSTRAINT IF EXISTS listings_bond_weeks_check;
ALTER TABLE public.listings ADD CONSTRAINT listings_bond_weeks_check
  CHECK (bond_weeks IS NULL OR bond_weeks BETWEEN 0 AND 4);
ALTER TABLE public.listings DROP CONSTRAINT IF EXISTS listings_rent_in_advance_weeks_check;
ALTER TABLE public.listings ADD CONSTRAINT listings_rent_in_advance_weeks_check
  CHECK (rent_in_advance_weeks IS NULL OR rent_in_advance_weeks BETWEEN 0 AND 2);
ALTER TABLE public.listings DROP CONSTRAINT IF EXISTS listings_bills_estimate_weekly_check;
ALTER TABLE public.listings ADD CONSTRAINT listings_bills_estimate_weekly_check
  CHECK (bills_estimate_weekly IS NULL OR bills_estimate_weekly BETWEEN 0 AND 1000);

-- "4 weeks", "2 wks", "3w" and the like. A dollar amount or anything over
-- the cap is left empty for the host to restate.
UPDATE public.listings
   SET bond_weeks = substring(lower(btrim(bond)) from '^([0-4])')::smallint
 WHERE bond_weeks IS NULL
   AND lower(btrim(bond)) ~ '^[0-4]\s*(weeks?|wks?|w)\y';

COMMIT;
