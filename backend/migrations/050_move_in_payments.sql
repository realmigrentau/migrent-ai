-- ════════════════════════════════════════════════════════════════════════
-- 050: Move-in payments through Migrent (owner decision, 2 October 2026)
--
-- When Migrent finalises an application, the renter can pay the rent in
-- advance by card. Stripe sends it straight to the owner's own Stripe
-- account (a destination charge on behalf of the owner); Migrent never
-- holds it. The bond is never paid through Migrent: the Hub sends the
-- renter to their state's bond authority.
--
-- When Stripe confirms the payment, both sides get a green light and a
-- receipt. If this is the owner's first tenancy with this renter, the
-- owner's saved card is charged Migrent's AUD 99 fee automatically. The
-- owner confirms the money arrived and the renter confirms they moved in;
-- then Migrent's own receipt is complete. All three receipts carry the
-- same 10-character code, so renter and owner can check each other when
-- they meet.
--
-- Only the API (service role) reads or writes these columns and the table.
-- Additive: safe before the backend that uses it. Idempotent.
-- ════════════════════════════════════════════════════════════════════════

BEGIN;

-- Owners: where Stripe pays them, and the card Migrent's fee is charged to.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS stripe_account_id text,
  ADD COLUMN IF NOT EXISTS stripe_payouts_ready boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS stripe_customer_id text,
  ADD COLUMN IF NOT EXISTS fee_payment_method_id text,
  ADD COLUMN IF NOT EXISTS fee_card_label text;

CREATE TABLE IF NOT EXISTS public.move_in_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenancy_id uuid NOT NULL REFERENCES public.tenancies(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  renter_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  -- What the renter pays, frozen when the payment link is made.
  weeks smallint NOT NULL CHECK (weeks BETWEEN 1 AND 8),
  weekly_rent_cents integer NOT NULL CHECK (weekly_rent_cents > 0),
  amount_cents integer NOT NULL CHECK (amount_cents > 0),
  card_fee_cents integer NOT NULL DEFAULT 0 CHECK (card_fee_cents >= 0),
  currency text NOT NULL DEFAULT 'aud',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'refunded', 'cancelled')),
  stripe_session_id text,
  stripe_payment_intent text,
  stripe_charge_id text,
  paid_at timestamptz,
  -- The 10-character code on all three receipts.
  receipt_code text UNIQUE CHECK (receipt_code IS NULL OR receipt_code ~ '^[A-Z2-9]{10}$'),
  owner_confirmed_at timestamptz,
  renter_confirmed_at timestamptz,
  -- Migrent's AUD 99 fee to the owner: due only for a new renter.
  fee_status text NOT NULL DEFAULT 'not_yet' CHECK (fee_status IN ('not_yet', 'not_due', 'charged', 'failed')),
  fee_cents integer,
  fee_payment_intent text,
  fee_charged_at timestamptz,
  fee_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- One live move-in payment per tenancy.
CREATE UNIQUE INDEX IF NOT EXISTS move_in_one_per_tenancy ON public.move_in_payments (tenancy_id) WHERE status IN ('pending', 'paid');
CREATE INDEX IF NOT EXISTS idx_move_in_pair ON public.move_in_payments (owner_id, renter_id) WHERE status = 'paid';
CREATE INDEX IF NOT EXISTS idx_move_in_session ON public.move_in_payments (stripe_session_id);

ALTER TABLE public.move_in_payments ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.move_in_payments FROM anon, authenticated;

COMMIT;
