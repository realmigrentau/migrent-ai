-- ════════════════════════════════════════════════════════════════════════
-- 048: Phase C trust and safety (MIGRENT_MASTER_AUDIT.md MIG-011, MIG-033)
--
-- Reviews after real tenancies and stays (MIG-011). Reviews used to need a
-- completed "deal"; deals were retired, so none could ever be written. A
-- review now belongs to a tenancy or a stay booking, both ways (owner
-- decision, 2026-10-02):
--   * reviews.tenancy_id / reviews.booking_id, one review per person each.
--   * Hosts' reviews of renters must never be public, so the table and the
--     old stats views (which counted every review) are closed to the
--     browser; the API serves reviews under the rules in
--     backend/reviews_core.py.
--
-- Reports the system raises (MIG-033). A message with scam signs is
-- delivered with a warning and reported to Migrent's admins by the spam
-- check, which is not a person: reports.reporter_id may be empty and
-- reports.source says 'user' or 'system'.
--
-- Deploy order: after 046 (which adds the hide_review / restore_review
-- audit actions this release uses), together with the release backend:
-- that backend writes reviews.tenancy_id and reports.source. The columns
-- are additive, so the current backend is unaffected if this runs first.
-- Idempotent: safe to run twice.
-- ════════════════════════════════════════════════════════════════════════

BEGIN;

-- ──────────────────────────────────────────────────────────────
-- 1. Reviews on tenancies and stays
-- ──────────────────────────────────────────────────────────────
ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS tenancy_id uuid REFERENCES public.tenancies(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS booking_id uuid REFERENCES public.bookings(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS reviews_one_per_tenancy ON public.reviews (tenancy_id, reviewer_id) WHERE tenancy_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS reviews_one_per_booking ON public.reviews (booking_id, reviewer_id) WHERE booking_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_reviews_reviewed_type ON public.reviews (reviewed_user_id, review_type);

-- Only the API reads or writes reviews (service role).
DROP POLICY IF EXISTS "reviews_public_read" ON public.reviews;
DROP POLICY IF EXISTS "reviews_insert_own" ON public.reviews;
DROP POLICY IF EXISTS "reviews_update_own" ON public.reviews;
REVOKE ALL ON public.reviews FROM anon, authenticated;
REVOKE ALL ON public.listing_review_stats FROM anon, authenticated;
REVOKE ALL ON public.user_review_stats FROM anon, authenticated;

-- ──────────────────────────────────────────────────────────────
-- 2. Reports raised by the system
-- ──────────────────────────────────────────────────────────────
ALTER TABLE public.reports ALTER COLUMN reporter_id DROP NOT NULL;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'user';
ALTER TABLE public.reports DROP CONSTRAINT IF EXISTS reports_source_check;
ALTER TABLE public.reports ADD CONSTRAINT reports_source_check
  CHECK (source IN ('user', 'system') AND (source = 'system' OR reporter_id IS NOT NULL));

COMMIT;
