-- Quarantine the current public listing "Beautiful Rooms in Kellyville NSW"
-- (id eb203751-acdf-43e3-9d22-2a1eeafd5479).
--
-- WHY (audit 2026-09-02 of the live site):
--   * availability ended 2026-04-25 but the page still offered booking
--   * photos are unrelated gaming/video thumbnails, not the property
--   * copy has misspellings ("Beutiful", "Proffessional"), duplicated
--     location text, unclear per-room pricing for a 3-bedroom property,
--     and a vague camera disclosure ("Everywhere except Private Areas")
--   * the owner (186c8f37-b23f-409b-bbce-fdfe9f7c1452) has no approved ID
--     yet the page rendered "Verified host"
--   * the pin (-33.6778, 151.3018) is ~30 km from Kellyville, offshore
--
-- WHAT THIS DOES: sets the listing to 'paused' (admin), records the reason,
-- writes the audit rows, and removes the false badge. It deletes nothing.
-- Run migration 042 first. Run in the Supabase SQL editor as postgres.
--
-- ROLLBACK: the block at the bottom, which restores the previous status.

BEGIN;

-- Keep the previous state for rollback.
CREATE TABLE IF NOT EXISTS public._backup_admin_actions (
  id bigserial PRIMARY KEY,
  action text NOT NULL,
  target_id uuid NOT NULL,
  previous jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);
INSERT INTO public._backup_admin_actions (action, target_id, previous)
SELECT 'quarantine_listing', id,
       jsonb_build_object('moderation_status', moderation_status, 'moderation_reason', moderation_reason,
                          'moderation_notes', moderation_notes, 'paused_at', paused_at, 'paused_by_admin', paused_by_admin)
  FROM public.listings WHERE id = 'eb203751-acdf-43e3-9d22-2a1eeafd5479';

UPDATE public.listings
   SET moderation_status = 'paused',
       paused_at = now(),
       paused_by_admin = true,
       moderation_reason = 'Paused pending genuine property photos, current availability dates, room-level pricing, proof of right to list, corrected location and a clear camera disclosure. Owner identity verification is also incomplete.',
       moderation_notes = E'Upload real photos of the property\nSet available_from / available_to to current dates\nState the weekly price per room and how many rooms are free\nProvide proof you own or may list the property\nConfirm the address so the map pin lands in Kellyville\nSay exactly where cameras are; none in bedrooms or bathrooms\nComplete government ID verification',
       moderated_at = now()
 WHERE id = 'eb203751-acdf-43e3-9d22-2a1eeafd5479';

INSERT INTO public.moderation_events (listing_id, actor_type, event_type, old_status, new_status, notes)
SELECT id, 'admin', 'paused', (SELECT previous->>'moderation_status' FROM public._backup_admin_actions WHERE target_id = l.id ORDER BY id DESC LIMIT 1), 'paused',
       'Quarantined per 2026-09-02 audit: stale availability, unrelated photos, unverified owner, wrong pin'
  FROM public.listings l WHERE id = 'eb203751-acdf-43e3-9d22-2a1eeafd5479';

-- The false trust badge (migration 042 also strips it; harmless if already gone).
UPDATE public.profiles
   SET badges = array_remove(badges, 'Verified host')
 WHERE id = '186c8f37-b23f-409b-bbce-fdfe9f7c1452';

COMMIT;

-- Verify: expect 'paused' and true.
-- SELECT moderation_status, paused_by_admin FROM listings WHERE id = 'eb203751-acdf-43e3-9d22-2a1eeafd5479';
-- Public API must now return 404: curl -s https://migrent-ai-backend.onrender.com/listings/eb203751-acdf-43e3-9d22-2a1eeafd5479

-- ── ROLLBACK (run only if the pause must be reversed) ──────────────────
-- BEGIN;
-- UPDATE public.listings l
--    SET moderation_status = b.previous->>'moderation_status',
--        moderation_reason = b.previous->>'moderation_reason',
--        moderation_notes  = b.previous->>'moderation_notes',
--        paused_at = NULL, paused_by_admin = false
--   FROM (SELECT * FROM public._backup_admin_actions
--          WHERE action = 'quarantine_listing' AND target_id = 'eb203751-acdf-43e3-9d22-2a1eeafd5479'
--          ORDER BY id DESC LIMIT 1) b
--  WHERE l.id = b.target_id;
-- INSERT INTO public.moderation_events (listing_id, actor_type, event_type, old_status, new_status, notes)
-- VALUES ('eb203751-acdf-43e3-9d22-2a1eeafd5479', 'admin', 'unpaused', 'paused', 'approved', 'Rollback of 2026-09-02 quarantine');
-- COMMIT;
-- NOTE: restoring 'approved' will be refused by the listings_require_verified_owner
-- trigger until the owner's ID is approved; that is intended.
