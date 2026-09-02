# Listing lifecycle

| Public name | `moderation_status` | Visible in search / sitemap / homepage | Bookable | Who moves it here |
|---|---|---|---|---|
| draft | `draft` | no | no | owner creates before ID verification |
| pending review | `pending_approval`, `changes_requested`, `flagged` | no | no | owner submits; admin requests changes; spam scanner flags |
| published | `approved` (and `available_to` is today or later, and not hidden) | yes | yes | admin approves |
| paused | `paused` | no | no | owner (reversible by owner) or admin (`paused_by_admin`, owner cannot resume) |
| expired | `expired`, or `approved` with a past `available_to` | no | no | nightly `expire_listings()` (pg_cron) or `POST /internal/cron/expire-listings`; read paths exclude by date regardless |
| rejected | `rejected` | no | no | admin |
| quarantined | `hidden` | no | no | spam scanner or admin |
| archived | `deleted` | no | no | owner delete (soft; never hard-deleted) |

Rules enforced in the database (migration 042):

- `listings_require_verified_owner`: a row cannot enter `pending_approval` or `approved` unless the owner's `owner_verification.fully_verified` is true and the owner confirmed they are 18+.
- `approved` additionally requires at least one photo and an `available_to` that has not passed.
- Every transition writes a `moderation_events` row (`old_status`, `new_status`, actor, notes) and admin actions also write `admin_audit_log`.

Owner endpoints: `POST /listings/{id}/submit`, `/renew` (extend dates; an expired listing goes back to review), `/pause`, `/resume`. Admin: `/admin/listings/{id}/approve|reject|request-changes|pause|unpause`.

Expiry reminders: `POST /internal/cron/expiry-reminders` emails owners 7 days before `available_to` (once, tracked by `expiry_notified_at`). Schedule both cron endpoints from Render Cron Jobs or GitHub Actions with the `X-Cron-Secret` header.

Public URL of an expired listing: HTTP 410 with an honest "no longer available" page (`pages/listing/[id].tsx`), `noindex`.
