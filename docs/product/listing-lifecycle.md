# Listing lifecycle

| Public name | `moderation_status` | Visible in search / sitemap / homepage | Bookable | Who moves it here |
|---|---|---|---|---|
| draft | `draft` | no | no | owner creates before ID verification |
| pending review | `pending_approval`, `changes_requested`, `flagged` | no | no | owner submits; owner changes a live listing's substance (below); admin requests changes; spam scanner flags |
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

Changes to a live listing (`PATCH /listings/{id}`, `routes_listings.material_changes`): new photos, title, description, address, suburb, postcode, bond or rent in advance, or a weekly rent more than 15% higher or lower, send an `approved` listing back to `pending_approval` (event `submitted`, metadata `reason: material_edit`), so it is offline until Migrent approves it again. Dates, features and small rent changes stay live. The spam rescan on an edit now flags or hides exactly as on a new listing. The Hub's edit page warns before saving such a change.

A suspended owner's listings are excluded from every public read (`listing_lifecycle.public_filter`, `mark_suspended_owners`, the `public_listings` view from migration 046) without changing their status.

Owner endpoints: `POST /listings/{id}/submit`, `/renew` (extend dates; an expired listing goes back to review), `/pause`, `/resume`. Admin: Hub > Listings (`POST /hub/admin/listings/{id}/action`), which runs the same handlers as `/admin/listings/{id}/approve|reject|request-changes|pause|unpause` and `/admin/spam/{id}/*`.

Expiry reminders: `POST /internal/cron/expiry-reminders` emails owners 7 days before `available_to` (once, tracked by `expiry_notified_at`). Schedule both cron endpoints from Render Cron Jobs or GitHub Actions with the `X-Cron-Secret` header.

Public URL of an expired listing: HTTP 410 with an honest "no longer available" page (`pages/listing/[id].tsx`), `noindex`.
