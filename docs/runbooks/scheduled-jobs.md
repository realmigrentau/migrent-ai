# Scheduled jobs

Two idempotent endpoints on the backend, both guarded by the `X-Cron-Secret`
header (value of `CRON_SECRET` on Render):

| Endpoint | Cadence | Effect |
|---|---|---|
| `POST /internal/cron/expire-listings` | daily, 00:15 AEST (14:15 UTC) | `approved` listings whose `available_to` has passed become `expired`; a `moderation_events` row is written |
| `POST /internal/cron/expiry-reminders` | daily, 09:00 AEST | owners whose listing expires within 7 days get one email; `expiry_notified_at` prevents repeats |

Migration 042 also schedules `expire_listings()` in-database with pg_cron
when the extension is enabled on the Supabase project (Database > Extensions
> pg_cron). If pg_cron is on, the HTTP expire job is a harmless duplicate.

## Render Cron Job (recommended)

Render Dashboard > New > Cron Job, same repo, command:

```bash
curl -fsS -X POST -H "X-Cron-Secret: $CRON_SECRET" https://migrent-ai-backend.onrender.com/internal/cron/expire-listings
```

Schedule `15 14 * * *`. Add a second job for `expiry-reminders` at `0 23 * * *` (09:00 AEST). Set `CRON_SECRET` in the cron job's environment to the same value as the web service.

## Verify

```bash
curl -s -X POST -H "X-Cron-Secret: $CRON_SECRET" https://migrent-ai-backend.onrender.com/internal/cron/expire-listings
# {"expired":[...],"ran_at":"..."}
```
A wrong or missing secret returns 401.
