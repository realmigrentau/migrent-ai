# Retention, export and deletion

| Data | Retention | How |
|---|---|---|
| Account, profile, preferences | until the user deletes the account | `DELETE /account/delete` removes profile, listings, messages, bookings, reviews, reports and the auth user |
| Data export | on request | `GET /profiles/me/export` returns the caller's own rows as JSON (no other user's private data) |
| Government ID documents | proposal: delete the file 30 days after the review decision, keep only the decision and audit row | **not yet automated**; counsel to confirm the period |
| Verification audit log | 7 years (proposal) | `verification_audit_log`, service role only |
| Payment events | 7 years (tax) | `payment_events`; card data never touches MigRent |
| Messages | until either party deletes their account | soft; attachments in a private bucket with signed URLs |
| Moderation events | retained with the listing | `moderation_events` |
| Server logs | Render default (7 days) | redacted at write time |

Open items: automate ID-document deletion; add a scheduled purge of `cross_device_tokens` (function exists, not scheduled); confirm periods with counsel.
