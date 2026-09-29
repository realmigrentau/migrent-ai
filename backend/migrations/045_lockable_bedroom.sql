-- 045_lockable_bedroom.sql
--
-- One new listing answer: does the renter's bedroom door lock?
--
-- The homepage house lets a renter ask for "my bedroom door locks" and a host
-- say "bedroom doors lock". Both need a real field, or the toggle would be a
-- control that does nothing. It is asked in the Hub listing wizard under
-- "Safety disclosures", shown on the listing page, and filterable in search
-- (routes_listings.search_listings: lockable_bedroom=true).
--
-- Nullable on purpose: existing listings never answered, and "not answered"
-- must not read as "no". Search only matches an explicit true.
--
-- Additive and idempotent. Apply BEFORE deploying the backend that writes it:
-- create_listing and the draft submit both insert this column.

ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS lockable_bedroom boolean;

COMMENT ON COLUMN public.listings.lockable_bedroom IS
  'Host answer: each rented bedroom has a lock the renter controls. NULL = not answered.';

-- Partial index for the one query that reads it: public search for true.
CREATE INDEX IF NOT EXISTS idx_listings_lockable_bedroom
  ON public.listings (lockable_bedroom)
  WHERE lockable_bedroom IS TRUE;
