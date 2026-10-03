-- ════════════════════════════════════════════════════════════════════════
-- 051: The paid renter ID check (owner decision, 3 October 2026)
--
-- A renter pays AUD 19, then Stripe Identity checks their photo ID is
-- genuine and that a live selfie matches it. The fee covers up to three
-- tries and is not refunded if none pass. A passed check
-- gives the renter a green "ID verified" badge that owners see on
-- applications and messages. Owners can show only verified applicants, and
-- can set a listing to accept applications from verified renters only.
--
-- renter_verifications existed (043) but nothing wrote to it. This adds
-- what the check needs. Stripe keeps the document and selfie; Migrent keeps
-- only the name on the ID, the document type and country, and Stripe's
-- reference, so it can help if something goes wrong after a tenancy.
--
-- Only the API (service role) reads or writes renter_verifications (043
-- revoked anon and authenticated). Additive and idempotent.
-- ════════════════════════════════════════════════════════════════════════

BEGIN;

ALTER TABLE public.renter_verifications
  ADD COLUMN IF NOT EXISTS checkout_session_id text,
  ADD COLUMN IF NOT EXISTS payment_intent text,
  ADD COLUMN IF NOT EXISTS paid_at timestamptz,
  ADD COLUMN IF NOT EXISTS refunded_at timestamptz,
  -- Failed checks so far (3 are included in the fee).
  ADD COLUMN IF NOT EXISTS failed_checks smallint NOT NULL DEFAULT 0,
  -- Times the renter opened Stripe's check (abandoned ones included).
  ADD COLUMN IF NOT EXISTS checks_started smallint NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_error text,
  ADD COLUMN IF NOT EXISTS verified_name text,
  ADD COLUMN IF NOT EXISTS document_type text,
  ADD COLUMN IF NOT EXISTS document_country text,
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

-- 'retry': a check failed and tries are left.
ALTER TABLE public.renter_verifications DROP CONSTRAINT IF EXISTS renter_verifications_status_check;
ALTER TABLE public.renter_verifications ADD CONSTRAINT renter_verifications_status_check
  CHECK (status IN ('not_started', 'pending', 'retry', 'verified', 'rejected', 'expired'));

CREATE INDEX IF NOT EXISTS idx_renter_verifications_verified
  ON public.renter_verifications (user_id) WHERE status = 'verified';
CREATE UNIQUE INDEX IF NOT EXISTS idx_renter_verifications_checkout
  ON public.renter_verifications (checkout_session_id) WHERE checkout_session_id IS NOT NULL;

-- Owners: "Only ID-verified renters can apply" on a listing.
ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS require_verified_renters boolean NOT NULL DEFAULT false;

COMMIT;
