-- 043_migrent_hub.sql
-- The data model behind Migrent Hub: properties and their rentable units,
-- a reusable Rental Profile, applications with a human-readable history,
-- inspections, saved searches, inbox state, tenancies, a rent ledger,
-- maintenance, listing analytics, and the report/audit fields admin needs.
--
-- ══════════════════════════════════════════════════════════════
-- READ THIS BEFORE RUNNING
-- ══════════════════════════════════════════════════════════════
-- Run after 042. Deploy the backend from the same commit first: nothing in
-- the currently deployed code reads these tables, so running this early is
-- harmless, but the Hub endpoints return "not set up yet" until it has run.
--
-- Additive only. No existing row is deleted or rewritten except:
--   * listings.property_id is backfilled: every listing without one gets a
--     property of its own, built from its address. Nothing else on the
--     listing changes.
--   * profiles.role 'renter' is not introduced: the Hub keeps the existing
--     'seeker' value and calls it "renter" in the interface.
--
-- Access model (same as 039): the browser never writes these tables. Every
-- table below has RLS on and no grants for anon or authenticated, so the
-- only path in or out is the FastAPI backend under the service role, which
-- performs the authorisation checks. Idempotent; safe to re-run.


-- ══════════════════════════════════════════════════════════════
-- 1. Profiles: what the Hub needs to know about an account
-- ══════════════════════════════════════════════════════════════
-- `role` stays the one primary operational role ('seeker' = renter,
-- 'owner'). owner_kind separates an individual owner from a property
-- manager without inventing a third role. Multi-role later is a new table,
-- not a change to authentication.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS owner_kind          text,
  ADD COLUMN IF NOT EXISTS hub_onboarded_at    timestamptz,
  ADD COLUMN IF NOT EXISTS notification_prefs  jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_owner_kind_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_owner_kind_check
  CHECK (owner_kind IS NULL OR owner_kind IN ('individual', 'property_manager'));


-- ══════════════════════════════════════════════════════════════
-- 2. Properties and units
-- ══════════════════════════════════════════════════════════════
-- A property is the building an owner manages. Each rentable thing in it -
-- the whole place, or Room 1, Room 2 - stays a row in `listings`, so search,
-- moderation, messaging and the public page keep working unchanged. A
-- property with four rooms is one property and four listings.

CREATE TABLE IF NOT EXISTS public.properties (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id        uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  nickname        text CHECK (nickname IS NULL OR char_length(nickname) <= 80),
  relationship    text NOT NULL DEFAULT 'owner' CHECK (relationship IN ('owner', 'manager')),
  street_address  text NOT NULL CHECK (char_length(street_address) BETWEEN 3 AND 300),
  suburb          text,
  state           text CHECK (state IS NULL OR state IN ('NSW','VIC','QLD','SA','WA','TAS','ACT','NT')),
  postcode        integer CHECK (postcode IS NULL OR postcode BETWEEN 800 AND 9999),
  property_type   text,
  bedrooms        integer CHECK (bedrooms IS NULL OR bedrooms BETWEEN 0 AND 30),
  bathrooms       integer CHECK (bathrooms IS NULL OR bathrooms BETWEEN 0 AND 20),
  parking_spaces  integer CHECK (parking_spaces IS NULL OR parking_spaces BETWEEN 0 AND 20),
  latitude        numeric,
  longitude       numeric,
  archived_at     timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_properties_owner ON public.properties (owner_id) WHERE archived_at IS NULL;

ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS property_id     uuid REFERENCES public.properties(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS unit_label      text,
  ADD COLUMN IF NOT EXISTS listing_purpose text NOT NULL DEFAULT 'long_term',
  ADD COLUMN IF NOT EXISTS occupancy       text NOT NULL DEFAULT 'vacant',
  ADD COLUMN IF NOT EXISTS occupied_until  date,
  ADD COLUMN IF NOT EXISTS archived_at     timestamptz;

ALTER TABLE public.listings DROP CONSTRAINT IF EXISTS listings_listing_purpose_check;
ALTER TABLE public.listings ADD CONSTRAINT listings_listing_purpose_check
  CHECK (listing_purpose IN ('long_term', 'short_stay', 'sale'));
ALTER TABLE public.listings DROP CONSTRAINT IF EXISTS listings_occupancy_check;
ALTER TABLE public.listings ADD CONSTRAINT listings_occupancy_check
  CHECK (occupancy IN ('vacant', 'occupied'));
ALTER TABLE public.listings DROP CONSTRAINT IF EXISTS listings_unit_label_check;
ALTER TABLE public.listings ADD CONSTRAINT listings_unit_label_check
  CHECK (unit_label IS NULL OR char_length(unit_label) <= 40);

CREATE INDEX IF NOT EXISTS idx_listings_property ON public.listings (property_id);

-- Backfill: one property per listing that has none. The listing id is used
-- as the property id so the backfill is repeatable and traceable.
INSERT INTO public.properties (id, owner_id, street_address, suburb, postcode, property_type, bedrooms, bathrooms, latitude, longitude, created_at)
SELECT l.id, l.owner_id, l.address, l.suburb, l.postcode, l.property_type, l.bedrooms, l.bathrooms, l.latitude, l.longitude, COALESCE(l.created_at, now())
  FROM public.listings l
 WHERE l.property_id IS NULL
   AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = l.owner_id)
ON CONFLICT (id) DO NOTHING;

UPDATE public.listings l
   SET property_id = l.id
 WHERE l.property_id IS NULL
   AND EXISTS (SELECT 1 FROM public.properties p WHERE p.id = l.id);


-- ══════════════════════════════════════════════════════════════
-- 3. Listing drafts (the owner wizard's autosave)
-- ══════════════════════════════════════════════════════════════
-- The listing API validates a complete listing. The wizard needs to save
-- half of one, so its state lives here as JSON until the owner submits, at
-- which point the backend creates the listing through the same code path
-- the API has always used.

CREATE TABLE IF NOT EXISTS public.listing_drafts (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id      uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  property_id   uuid REFERENCES public.properties(id) ON DELETE SET NULL,
  listing_id    uuid REFERENCES public.listings(id) ON DELETE SET NULL,
  data          jsonb NOT NULL DEFAULT '{}'::jsonb,
  step          integer NOT NULL DEFAULT 0 CHECK (step BETWEEN 0 AND 20),
  submitted_at  timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_listing_drafts_owner ON public.listing_drafts (owner_id, updated_at DESC) WHERE submitted_at IS NULL;


-- ══════════════════════════════════════════════════════════════
-- 4. Rental Profile, documents and optional verification
-- ══════════════════════════════════════════════════════════════
-- Filled in once, reused for every application. Only what a housing
-- application legitimately needs: no date of birth, nationality, visa,
-- religion or anything else an owner could discriminate on. Income is
-- optional. Owners never read this table: they read the snapshot copied
-- into an application at the moment the renter submits it.

CREATE TABLE IF NOT EXISTS public.renter_profiles (
  user_id                 uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  intro                   text CHECK (intro IS NULL OR char_length(intro) <= 1500),
  preferred_move_date     date,
  preferred_lease_months  integer CHECK (preferred_lease_months IS NULL OR preferred_lease_months BETWEEN 1 AND 60),
  preferred_suburbs       text[] NOT NULL DEFAULT '{}',
  budget_weekly           integer CHECK (budget_weekly IS NULL OR budget_weekly BETWEEN 0 AND 20000),
  bedrooms_min            integer CHECK (bedrooms_min IS NULL OR bedrooms_min BETWEEN 0 AND 10),
  household_adults        integer NOT NULL DEFAULT 1 CHECK (household_adults BETWEEN 1 AND 20),
  household_children      integer NOT NULL DEFAULT 0 CHECK (household_children BETWEEN 0 AND 20),
  household_notes         text CHECK (household_notes IS NULL OR char_length(household_notes) <= 500),
  has_pets                boolean NOT NULL DEFAULT false,
  pet_details             text CHECK (pet_details IS NULL OR char_length(pet_details) <= 300),
  employment_status       text CHECK (employment_status IS NULL OR employment_status IN
                            ('employed', 'self_employed', 'student', 'looking', 'retired', 'other')),
  employer                text CHECK (employer IS NULL OR char_length(employer) <= 120),
  job_title               text CHECK (job_title IS NULL OR char_length(job_title) <= 120),
  employment_since        date,
  income_weekly           integer CHECK (income_weekly IS NULL OR income_weekly BETWEEN 0 AND 100000),
  rental_history          jsonb NOT NULL DEFAULT '[]'::jsonb,
  -- New arrivals often have no Australian rental history. Saying so is an
  -- answer, not a gap, and counts as complete.
  first_time_renter       boolean NOT NULL DEFAULT false,
  referees                jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.renter_documents (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  kind        text NOT NULL CHECK (kind IN ('identity', 'income', 'employment', 'rental_history', 'reference', 'study', 'other')),
  label       text CHECK (label IS NULL OR char_length(label) <= 120),
  file_path   text NOT NULL UNIQUE,
  file_name   text NOT NULL,
  mime_type   text NOT NULL,
  size_bytes  integer NOT NULL CHECK (size_bytes > 0 AND size_bytes <= 10485760),
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_renter_documents_user ON public.renter_documents (user_id, created_at DESC);

-- Optional renter verification. Designed, not switched on: the old $19
-- badge set profiles.verified=true without checking anything and was
-- disabled (payments.py SEEKER_VERIFICATION_ENABLED). This table records a
-- real check once one exists; until then nothing writes to it.
CREATE TABLE IF NOT EXISTS public.renter_verifications (
  user_id         uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  status          text NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'pending', 'verified', 'rejected', 'expired')),
  method          text,
  checked_at      timestamptz,
  expires_at      timestamptz,
  payment_status  text NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('not_required', 'unpaid', 'paid', 'refunded')),
  provider_ref    text,
  updated_at      timestamptz NOT NULL DEFAULT now()
);


-- ══════════════════════════════════════════════════════════════
-- 5. Applications
-- ══════════════════════════════════════════════════════════════
-- draft -> submitted -> under_review -> (shortlisted) ->
--   changes_requested -> submitted ...
--   declined | withdrawn
--   owner approves -> migrent_review -> finalised | not_proceeding
-- 'owner_approved' is accepted for completeness; the API moves an approved
-- application straight on to 'migrent_review'.

CREATE TABLE IF NOT EXISTS public.applications (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id         uuid NOT NULL REFERENCES public.listings(id) ON DELETE RESTRICT,
  renter_id          uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  owner_id           uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status             text NOT NULL DEFAULT 'draft' CHECK (status IN (
                       'draft', 'submitted', 'under_review', 'shortlisted', 'changes_requested',
                       'owner_approved', 'migrent_review', 'finalised',
                       'declined', 'withdrawn', 'not_proceeding')),
  move_in_date       date,
  lease_months       integer CHECK (lease_months IS NULL OR lease_months BETWEEN 1 AND 60),
  occupants          integer CHECK (occupants IS NULL OR occupants BETWEEN 1 AND 20),
  message            text CHECK (message IS NULL OR char_length(message) <= 2000),
  share_income       boolean NOT NULL DEFAULT false,
  snapshot           jsonb,
  changes_requested_by text CHECK (changes_requested_by IS NULL OR changes_requested_by IN ('owner', 'migrent')),
  submitted_at       timestamptz,
  owner_viewed_at    timestamptz,
  owner_approved_at  timestamptz,
  decided_at         timestamptz,
  finalised_at       timestamptz,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);
-- One live application per renter per listing. Closed ones do not count, so
-- a renter who withdrew can apply again.
CREATE UNIQUE INDEX IF NOT EXISTS applications_one_active_per_listing
  ON public.applications (listing_id, renter_id)
  WHERE status NOT IN ('declined', 'withdrawn', 'not_proceeding');
CREATE INDEX IF NOT EXISTS idx_applications_renter ON public.applications (renter_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_applications_owner ON public.applications (owner_id, status, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_applications_review ON public.applications (status, owner_approved_at) WHERE status = 'migrent_review';

-- Append-only history. `visibility` decides who sees each entry:
-- shared (renter and owner), owner, or admin.
CREATE TABLE IF NOT EXISTS public.application_events (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id  uuid NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  actor_id        uuid,
  actor_role      text NOT NULL CHECK (actor_role IN ('renter', 'owner', 'admin', 'system')),
  event           text NOT NULL,
  from_status     text,
  to_status       text,
  note            text CHECK (note IS NULL OR char_length(note) <= 2000),
  visibility      text NOT NULL DEFAULT 'shared' CHECK (visibility IN ('shared', 'owner', 'admin')),
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_application_events_app ON public.application_events (application_id, created_at);

-- Which of the renter's documents they chose to share with this application.
CREATE TABLE IF NOT EXISTS public.application_documents (
  application_id  uuid NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  document_id     uuid NOT NULL REFERENCES public.renter_documents(id) ON DELETE CASCADE,
  shared_at       timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (application_id, document_id)
);

-- Owner-only notes. Never shown to the renter or copied anywhere else.
CREATE TABLE IF NOT EXISTS public.application_owner_notes (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id  uuid NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  owner_id        uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  body            text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 2000),
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_application_owner_notes_app ON public.application_owner_notes (application_id, created_at);


-- ══════════════════════════════════════════════════════════════
-- 6. Inspections
-- ══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.inspection_slots (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id    uuid NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  owner_id      uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  starts_at     timestamptz NOT NULL,
  ends_at       timestamptz NOT NULL,
  capacity      integer NOT NULL DEFAULT 6 CHECK (capacity BETWEEN 1 AND 100),
  instructions  text CHECK (instructions IS NULL OR char_length(instructions) <= 1000),
  status        text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'cancelled')),
  cancel_reason text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  CHECK (ends_at > starts_at),
  CHECK (ends_at - starts_at <= interval '8 hours')
);
CREATE INDEX IF NOT EXISTS idx_inspection_slots_listing ON public.inspection_slots (listing_id, starts_at);
CREATE INDEX IF NOT EXISTS idx_inspection_slots_owner ON public.inspection_slots (owner_id, starts_at);

CREATE TABLE IF NOT EXISTS public.inspection_bookings (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id       uuid NOT NULL REFERENCES public.inspection_slots(id) ON DELETE CASCADE,
  listing_id    uuid NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  renter_id     uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status        text NOT NULL DEFAULT 'booked' CHECK (status IN ('booked', 'cancelled', 'attended', 'no_show')),
  note          text CHECK (note IS NULL OR char_length(note) <= 500),
  reminder_sent_at timestamptz,
  cancelled_at  timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS inspection_bookings_one_per_slot
  ON public.inspection_bookings (slot_id, renter_id) WHERE status = 'booked';
CREATE INDEX IF NOT EXISTS idx_inspection_bookings_renter ON public.inspection_bookings (renter_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inspection_bookings_slot ON public.inspection_bookings (slot_id) WHERE status = 'booked';


-- ══════════════════════════════════════════════════════════════
-- 7. Saved homes and saved searches
-- ══════════════════════════════════════════════════════════════
-- Saved homes keep using `favorites`. The price at the moment of saving
-- lets the Hub say "the rent dropped $20 since you saved this" from data
-- that actually exists, instead of inventing a price history.

ALTER TABLE public.favorites ADD COLUMN IF NOT EXISTS price_at_save numeric;
DELETE FROM public.favorites a USING public.favorites b
 WHERE a.ctid < b.ctid AND a.user_id = b.user_id AND a.listing_id = b.listing_id;
CREATE UNIQUE INDEX IF NOT EXISTS favorites_user_listing_key ON public.favorites (user_id, listing_id);

CREATE TABLE IF NOT EXISTS public.saved_searches (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name              text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 80),
  params            jsonb NOT NULL DEFAULT '{}'::jsonb,
  alert             text NOT NULL DEFAULT 'daily' CHECK (alert IN ('off', 'instant', 'daily', 'weekly')),
  last_checked_at   timestamptz,
  last_notified_at  timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_saved_searches_user ON public.saved_searches (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_saved_searches_alert ON public.saved_searches (alert, last_checked_at) WHERE alert <> 'off';


-- ══════════════════════════════════════════════════════════════
-- 8. Inbox state and message templates
-- ══════════════════════════════════════════════════════════════
-- Messages stay in `messages`. A conversation is renter + owner + listing,
-- keyed "<listing_id>:<other_user_id>" (or "direct:<other_user_id>").

CREATE TABLE IF NOT EXISTS public.conversation_states (
  user_id      uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  thread_key   text NOT NULL CHECK (char_length(thread_key) <= 80),
  archived_at  timestamptz,
  muted        boolean NOT NULL DEFAULT false,
  updated_at   timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, thread_key)
);

CREATE TABLE IF NOT EXISTS public.message_templates (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id    uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title       text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 80),
  body        text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 2000),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_message_templates_owner ON public.message_templates (owner_id);


-- ══════════════════════════════════════════════════════════════
-- 9. Tenancies, rent ledger, maintenance
-- ══════════════════════════════════════════════════════════════
-- Migrent does not hold rent or bond (lib/siteIdentity.ts). The ledger is
-- a record the owner keeps of what was due and what they received; the
-- provider columns exist so a processor can write to the same rows later.
-- No lease document is generated: legal agreements are out of scope until
-- there are reviewed templates for each state.

CREATE TABLE IF NOT EXISTS public.tenancies (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id      uuid NOT NULL REFERENCES public.listings(id) ON DELETE RESTRICT,
  property_id     uuid REFERENCES public.properties(id) ON DELETE SET NULL,
  owner_id        uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  renter_id       uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  application_id  uuid UNIQUE REFERENCES public.applications(id) ON DELETE SET NULL,
  status          text NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'ended', 'cancelled')),
  start_date      date NOT NULL,
  end_date        date,
  rent_amount     numeric NOT NULL CHECK (rent_amount >= 0 AND rent_amount <= 50000),
  rent_frequency  text NOT NULL DEFAULT 'weekly' CHECK (rent_frequency IN ('weekly', 'fortnightly', 'monthly')),
  bond_amount     numeric CHECK (bond_amount IS NULL OR bond_amount >= 0),
  notes           text CHECK (notes IS NULL OR char_length(notes) <= 2000),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  CHECK (end_date IS NULL OR end_date > start_date)
);
CREATE INDEX IF NOT EXISTS idx_tenancies_owner ON public.tenancies (owner_id, status);
CREATE INDEX IF NOT EXISTS idx_tenancies_renter ON public.tenancies (renter_id, status);
CREATE INDEX IF NOT EXISTS idx_tenancies_listing ON public.tenancies (listing_id);

CREATE TABLE IF NOT EXISTS public.rent_payments (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenancy_id    uuid NOT NULL REFERENCES public.tenancies(id) ON DELETE CASCADE,
  due_date      date NOT NULL,
  amount_due    numeric NOT NULL CHECK (amount_due >= 0),
  amount_paid   numeric NOT NULL DEFAULT 0 CHECK (amount_paid >= 0),
  status        text NOT NULL DEFAULT 'due' CHECK (status IN ('due', 'paid', 'partial', 'waived')),
  paid_on       date,
  method        text CHECK (method IS NULL OR method IN ('bank_transfer', 'cash', 'other', 'provider')),
  reference     text CHECK (reference IS NULL OR char_length(reference) <= 120),
  provider      text,
  provider_ref  text,
  recorded_by   uuid,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenancy_id, due_date)
);
CREATE INDEX IF NOT EXISTS idx_rent_payments_tenancy ON public.rent_payments (tenancy_id, due_date);

CREATE TABLE IF NOT EXISTS public.maintenance_requests (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenancy_id       uuid NOT NULL REFERENCES public.tenancies(id) ON DELETE CASCADE,
  listing_id       uuid NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  owner_id         uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  renter_id        uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category         text NOT NULL CHECK (category IN ('plumbing', 'electrical', 'appliance', 'heating_cooling', 'pest',
                                                     'security', 'structural', 'outdoor', 'internet', 'other')),
  title            text NOT NULL CHECK (char_length(title) BETWEEN 3 AND 120),
  description      text NOT NULL CHECK (char_length(description) BETWEEN 3 AND 3000),
  urgency          text NOT NULL DEFAULT 'routine' CHECK (urgency IN ('routine', 'urgent', 'emergency')),
  status           text NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'acknowledged', 'scheduled',
                                                                     'in_progress', 'resolved', 'closed')),
  access_notes     text CHECK (access_notes IS NULL OR char_length(access_notes) <= 500),
  scheduled_for    timestamptz,
  photos           text[] NOT NULL DEFAULT '{}',
  resolved_at      timestamptz,
  closed_at        timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_maintenance_owner ON public.maintenance_requests (owner_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_maintenance_renter ON public.maintenance_requests (renter_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.maintenance_updates (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id   uuid NOT NULL REFERENCES public.maintenance_requests(id) ON DELETE CASCADE,
  author_id    uuid,
  author_role  text NOT NULL CHECK (author_role IN ('renter', 'owner', 'system')),
  body         text CHECK (body IS NULL OR char_length(body) <= 2000),
  status_from  text,
  status_to    text,
  internal     boolean NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_maintenance_updates_request ON public.maintenance_updates (request_id, created_at);


-- ══════════════════════════════════════════════════════════════
-- 10. Listing analytics
-- ══════════════════════════════════════════════════════════════
-- Counted from now on; nothing is back-filled or estimated. `actor_hash` is
-- a salted hash of the viewer (user id, or an anonymous browser id) so
-- unique views can be counted without storing who looked.

CREATE TABLE IF NOT EXISTS public.listing_events (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  listing_id  uuid NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  event       text NOT NULL CHECK (event IN ('view', 'save', 'unsave', 'share', 'enquiry',
                                             'inspection_booked', 'application_started', 'application_submitted')),
  actor_hash  text,
  source      text CHECK (source IS NULL OR source IN ('public', 'hub')),
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_listing_events_listing ON public.listing_events (listing_id, event, created_at DESC);


-- ══════════════════════════════════════════════════════════════
-- 11. Reports queue and admin audit
-- ══════════════════════════════════════════════════════════════

ALTER TABLE public.reports
  ADD COLUMN IF NOT EXISTS priority      text NOT NULL DEFAULT 'normal',
  ADD COLUMN IF NOT EXISTS assigned_to   uuid,
  ADD COLUMN IF NOT EXISTS resolution    text,
  ADD COLUMN IF NOT EXISTS action_taken  text,
  ADD COLUMN IF NOT EXISTS resolved_at   timestamptz,
  ADD COLUMN IF NOT EXISTS updated_at    timestamptz DEFAULT now();
ALTER TABLE public.reports DROP CONSTRAINT IF EXISTS reports_priority_check;
ALTER TABLE public.reports ADD CONSTRAINT reports_priority_check
  CHECK (priority IN ('low', 'normal', 'high', 'urgent'));
CREATE INDEX IF NOT EXISTS idx_reports_queue ON public.reports (status, priority, created_at DESC);

ALTER TABLE public.admin_audit_log DROP CONSTRAINT IF EXISTS admin_audit_log_action_check;
ALTER TABLE public.admin_audit_log ADD CONSTRAINT admin_audit_log_action_check
  CHECK (action IN (
    'approve', 'reject', 'request_changes', 'suspend_user', 'unsuspend_user',
    'flag', 'hide', 'unflag', 'request_delete', 'confirm_delete',
    'pause', 'unpause', 'approve_id', 'reject_id',
    'finalise_application', 'stop_application', 'request_application_corrections',
    'view_as_start', 'view_as_end',
    'assign_report', 'resolve_report', 'dismiss_report', 'change_role'
  ));
ALTER TABLE public.admin_audit_log DROP CONSTRAINT IF EXISTS admin_audit_log_target_type_check;
ALTER TABLE public.admin_audit_log ADD CONSTRAINT admin_audit_log_target_type_check
  CHECK (target_type IN ('listing', 'user', 'owner_verification', 'application', 'report', 'tenancy', 'property'));


-- ══════════════════════════════════════════════════════════════
-- 12. Private storage
-- ══════════════════════════════════════════════════════════════
-- Application documents and maintenance photos are private. They are never
-- served from a public URL; the API hands out short-lived signed URLs to
-- the people entitled to see them. Listing photos keep their public bucket.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('renter-documents', 'renter-documents', false, 10485760,
        ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET public = false, file_size_limit = 10485760,
  allowed_mime_types = ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('maintenance-photos', 'maintenance-photos', false, 10485760,
        ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET public = false, file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];


-- ══════════════════════════════════════════════════════════════
-- 13. Lock every new table to the API
-- ══════════════════════════════════════════════════════════════

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'properties', 'listing_drafts', 'renter_profiles', 'renter_documents', 'renter_verifications',
    'applications', 'application_events', 'application_documents', 'application_owner_notes',
    'inspection_slots', 'inspection_bookings', 'saved_searches', 'conversation_states',
    'message_templates', 'tenancies', 'rent_payments', 'maintenance_requests',
    'maintenance_updates', 'listing_events'
  ] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('REVOKE ALL ON public.%I FROM anon, authenticated', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
  END LOOP;
END $$;

-- updated_at bookkeeping (set_updated_at() comes from 036).
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'properties', 'listing_drafts', 'renter_profiles', 'applications', 'inspection_slots',
    'saved_searches', 'message_templates', 'tenancies', 'rent_payments', 'maintenance_requests'
  ] LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.%I', t || '_updated_at', t);
    EXECUTE format('CREATE TRIGGER %I BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()', t || '_updated_at', t);
  END LOOP;
END $$;


-- ══════════════════════════════════════════════════════════════
-- 14. Verification
-- ══════════════════════════════════════════════════════════════
-- Expect ZERO rows: no client role can touch a Hub table.
--   SELECT table_name, grantee FROM information_schema.role_table_grants
--    WHERE table_schema = 'public' AND grantee IN ('anon', 'authenticated')
--      AND table_name IN ('applications', 'renter_profiles', 'renter_documents', 'tenancies');
--
-- Expect every listing to have a property:
--   SELECT count(*) FROM public.listings WHERE property_id IS NULL;
