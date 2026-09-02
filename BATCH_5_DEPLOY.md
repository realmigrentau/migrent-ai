# Batch 5 deploy steps: production-readiness overhaul

Branch: `fix/batch-1-critical` (batches 1 to 4 must go out with this; they
were never deployed).

**The order matters.** The frontend reads database views that migration 042
creates, and the migration removes a permission the old frontend relied on.

Do it in this order: **environment variables, backend, frontend, migration,
admin script, cron jobs.**

---

## Step 0 - Environment variables (before anything deploys)

Render (backend service):

| Variable | Value |
|---|---|
| `CRON_SECRET` | run `openssl rand -hex 32` and paste the output |
| `FEE_MODEL` | `per_property` |
| `SEEKER_VERIFICATION_ENABLED` | `false` |
| `MAPTILER_API_KEY` | your MapTiler key (server-side geocoding) |

Vercel (frontend project, "Server" scope, not `NEXT_PUBLIC_`):

| Variable | Value |
|---|---|
| `INTERNAL_EMAIL_SECRET` | `openssl rand -hex 32` |
| `NEXT_PUBLIC_MAPTILER_KEY` | your MapTiler browser key (was hard-coded in source; now required) |
| `NEXT_PUBLIC_ENABLED_LOCALES` | `en` |

Confirm `ADMIN_USERNAME` and `ADMIN_PASSWORD` are already set on Vercel.

## Step 1 - Deploy the backend to Render

Push the branch, let Render deploy, wait for **Live**.

```bash
curl -s https://migrent-ai-backend.onrender.com/health
```

Expect `{"status":"ok"}`. Then confirm the public contract:

```bash
curl -s "https://migrent-ai-backend.onrender.com/listings/search?limit=1" | grep -c '"latitude"'
```

Expect `0`.

## Step 2 - Deploy the frontend to Vercel

Same branch. Wait for green. Load the homepage, run a search, open a listing.

## Step 3 - Run migration 042 in Supabase

SQL Editor > New query > paste `backend/migrations/042_verification_lifecycle_public_contract.sql` > Run.

Expected: "Success. No rows returned." Then the checks at the bottom of the file:

- no profile badge contains "verif"
- `anon` has no grant on `listings`
- `public_listings` has no `latitude`, `longitude`, `owner_id`, `address` columns

If it errors, do not re-run; paste the error. It is safe to run twice.

## Step 4 - Quarantine the Kellyville listing

SQL Editor > paste `backend/scripts/admin/quarantine_listing_eb203751.sql` > Run.

Then confirm the public page is gone:

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://migrent-ai-backend.onrender.com/listings/eb203751-acdf-43e3-9d22-2a1eeafd5479
```

Expect `404`. The owner receives an email listing what must change. Rollback SQL is in the same file.

## Step 5 - Scheduled jobs

Follow `docs/runbooks/scheduled-jobs.md` (two Render cron jobs).

## Step 6 - Click through

1. Search with the map: results, then map. Hide/show map. Filters update the URL; back button restores them.
2. Search in a browser with hardware acceleration off (Chrome: Settings > System): results still show, "Map unavailable" panel appears.
3. Homepage: pick a move-in date, search; the date is in the URL and filters results.
4. Open a listing: no street address, "approximate area" map, host card shows "Not yet verified" / "ID verified host" correctly.
5. Sign in with a wrong password: field errors are announced; Enter submits.
6. `/admin/overview` as a non-admin account: 404. As the admin account: passphrase gate, then dashboard.
7. Stripe test booking end to end: host accepts, pays $99 in test mode, booking-success page shows "confirmed" only after the webhook fires.

---

## Rollback

- Frontend: Vercel > Deployments > previous deployment > Promote to Production.
- Backend: Render > Manual Deploy > previous commit.
- Migration 042: no destructive statements. To undo the visibility change run
  `GRANT SELECT ON public.listings TO anon;` and recreate the previous
  `listings_public_read` policy from migration 039. Triggers can be dropped by
  name (`listings_require_verified_owner`, `profiles_guard_badges`,
  `owner_verification_audit`, `owner_verification_sync_profile`).
- Quarantine: rollback block at the bottom of the admin script.

## Still yours to do, not code

See `docs/legal/identity-and-claims.md`: legal entity and location, custom
domain DNS and mailboxes, Stripe live keys and a live webhook secret, Resend
sending domain, counsel review of terms/privacy/consent, fee-model
confirmation, real author and testimonial consent, suburb data sources.
