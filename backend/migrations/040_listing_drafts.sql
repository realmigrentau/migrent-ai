-- 040_listing_drafts.sql
-- Batch 2: let owners build a listing before they finish ID verification.
--
-- Run this AFTER 039_rls_lockdown.sql. Safe to re-run.
--
-- Verification used to block creating a listing at all, so an owner had to
-- hand over a government ID before they had seen what listing involves. The
-- gate now sits on publishing instead: an unverified owner's listing is
-- created as 'draft' and moves to 'pending_approval' via
-- POST /listings/{id}/submit once they are verified.
--
-- Nothing about what the public can see changes. 'draft' is not 'approved', so
-- it is excluded by exactly the same rules that already hide unmoderated
-- listings: the listings_public_read policy from 039, the search filter in
-- routes_listings.search_listings, the detail endpoint, and create_booking.


-- ══════════════════════════════════════════════════════════════
-- 1. Allow the new status
-- ══════════════════════════════════════════════════════════════
-- Same introspection approach as 039: the original CHECK was declared inline
-- on ADD COLUMN in 029, so its generated name is not guaranteed.

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
  CHECK (moderation_status IN (
    'draft',
    'pending_approval',
    'approved',
    'rejected',
    'changes_requested',
    'deleted'
  ));


-- ══════════════════════════════════════════════════════════════
-- 2. Index the owner dashboard's actual query
-- ══════════════════════════════════════════════════════════════
-- "my listings, newest first, excluding deleted" is the query behind the owner
-- listings page and it now has drafts mixed in.

CREATE INDEX IF NOT EXISTS idx_listings_owner_status
  ON public.listings (owner_id, moderation_status);


-- ══════════════════════════════════════════════════════════════
-- 3. Verification
-- ══════════════════════════════════════════════════════════════
-- Confirm a draft is invisible to the public. Expect ZERO rows: the policy
-- from 039 only exposes 'approved'.
--
--   SELECT id FROM public.listings WHERE moderation_status = 'draft';
--   -- run as anon, e.g. from the browser with the publishable key
--
-- Confirm the constraint accepts the new value. Expect it to list all six:
--
--   SELECT pg_get_constraintdef(oid)
--     FROM pg_constraint
--    WHERE conname = 'listings_moderation_status_check';
