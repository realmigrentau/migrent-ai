# Migrent operations guide

Where Migrent runs, how it is deployed, what to check when something breaks, and what has to change before launch. Last checked against the live services on 2026-11-01. Secrets are covered in [security/secrets-and-environments.md](security/secrets-and-environments.md), scheduled jobs in [runbooks/scheduled-jobs.md](runbooks/scheduled-jobs.md), and Hub environment variables in [hub.md](hub.md#environment-variables).

## Where it runs

| Part | Service | Address | Notes |
|---|---|---|---|
| Website and Hub | Vercel, project `migrent-ai` (Next.js, Pages Router) | https://migrent.vercel.app | Functions run in Sydney (`syd1`, `frontend/vercel.json`). Production builds use webpack (`next build --webpack`): Turbopack's inline script breaks the hash-based CSP. |
| API | Render (FastAPI) | https://migrent-ai-backend.onrender.com | Singapore region, behind Cloudflare. `/health` answers `{"status":"ok"}`. API docs are hidden in production. |
| Database, sign-in, storage | Supabase project `Migrent AU` (`nsnwwfbidishftlrimer`) | ap-southeast-2 (Sydney) | Postgres 17. The browser reads only `public_listings` and `get_public_profile`; everything else goes through the API ([security/public-data-contract.md](security/public-data-contract.md)). |
| Rate limits | Upstash Redis (Singapore) | `RATE_LIMIT_STORAGE_URI` on Render | Falls back to per-process memory if Redis is unreachable. |
| Payments | Stripe (live since 2026-10-01) | dashboard.stripe.com | Nothing is charged at launch: short stays and mentors are switched off ([hub.md, Launch scope](hub.md#launch-scope-owner-decision-1-november-2026)). |
| Email | Gmail relay (`backend/gmail_relay`, Apps Script in the Migrent Gmail account) | - | About 100 emails a day, and it fails DMARC, so mail can land in spam. To be replaced before launch (below). |
| Errors | Sentry (optional) | `SENTRY_DSN` on Render, `NEXT_PUBLIC_SENTRY_DSN` on Vercel | The site's CSP allows Sentry. Confirm a test error arrives. |
| Domain | none yet | - | `migrent.com.au` is not registered (auDA, 2026-11-01). |

### How the API picks an email route

`backend/email_bookings.py` uses the first one that is configured:

1. `GMAIL_RELAY_URL` + `GMAIL_RELAY_SECRET` (today)
2. `SMTP_HOST` + `SMTP_USER` + `SMTP_PASSWORD` (`SMTP_PORT` 465 or 587)
3. `MAILJET_API_KEY` + `MAILJET_SECRET_KEY`

So moving to a real provider means setting the `SMTP_*` values and `FROM_EMAIL`, then **removing** `GMAIL_RELAY_URL`. Render's free plan blocks outbound SMTP, which is why the relay exists. A paid Render plan allows it.

## Plans: what is on, and what launch needs

| Service | Now | Before launch | Why |
|---|---|---|---|
| Vercel | Hobby | Pro | Hobby is for personal, non-commercial use, and it can't deploy a private repository owned by a GitHub organisation. Upgrade **before** making the repo private. |
| Supabase | Free | Pro | Free has no daily backups and pauses an idle project. Pro also unlocks leaked-password protection. |
| Render | Free (per the October commit notes) | Starter or higher | Free sleeps after about 15 idle minutes (the next visitor waits 30 to 60 s) and blocks SMTP. |

## Deploying

- **Both apps deploy from `main`.** A push to `main` builds Vercel production and redeploys the Render service. Vercel builds previews for other branches, except `dependabot/**`.
- **Order for a change that touches the database:** apply the migration only when the code that needs it is live, unless the migration says otherwise. Migrations are in `backend/migrations/`, numbered.
- **Rollback:** Vercel > Deployments > pick the previous production deployment > Promote. Render > the service > Manual Deploy > choose the earlier commit. A migration is rolled back by a new migration, never by editing an applied one.
- **CI** (GitHub Actions) must be green before `main` moves: secret scan (gitleaks), backend tests and `pip-audit --strict`, and frontend npm audit, lint, typecheck, unit tests, build and Playwright e2e.

## Backups

- **Today there are none.** The Supabase free plan takes no backups. Until Pro is on, take a manual dump before any risky change:
  ```bash
  npx supabase db dump --db-url "$SUPABASE_DB_URL" -f backup_$(date +%Y%m%d).sql
  ```
  The connection string is in Supabase > Project Settings > Database. Keep the file somewhere private and never commit it.
- **On Supabase Pro:** daily backups with 7 days kept, under Database > Backups. Consider point-in-time recovery once there is real traffic.
- **Restore** a dump into a new project first and check it there, before touching production.

## Monitoring

- **Uptime:** set up a free monitor (UptimeRobot or Better Stack) on `https://migrent.vercel.app/` and `https://migrent-ai-backend.onrender.com/health`, with alerts to a phone.
- **Errors:** Vercel > migrent-ai > Observability (runtime errors), Render > Logs, and Sentry once its DSN is confirmed. Vercel Hobby keeps logs for only an hour.
- **Database:** Supabase > Advisors (security and performance). The warnings listed as accepted in [security/public-data-contract.md](security/public-data-contract.md) are deliberate.
- **Scheduled jobs:** four Render cron jobs call `/internal/cron/*` with `CRON_SECRET` ([runbooks/scheduled-jobs.md](runbooks/scheduled-jobs.md)). If saved-search alerts or listing-expiry emails stop, check those first.

## When something breaks

### The site is down
1. Status pages: vercel-status.com, status.render.com, status.supabase.com.
2. `curl https://migrent-ai-backend.onrender.com/health`. A slow first answer on the free plan is the instance waking up.
3. Vercel runtime errors, then Render logs.
4. If the latest deploy caused it, roll back (above) and fix forward on a branch.

### Sign-in fails
1. Supabase > Authentication > Logs.
2. Check Authentication > URL Configuration still lists the site's address and `/**` redirect paths.
3. For Google sign-in, check the Google Cloud OAuth client's authorised domains and redirect URIs.

### Email is not arriving
1. Render logs for the send attempt.
2. The relay's daily quota (about 100) is the usual cause today.
3. After moving to a provider, check its dashboard and the domain's SPF, DKIM and DMARC.

### A payment looks wrong
1. Stripe > Developers > Webhooks: the delivery for that event, and its response.
2. `payment_events` in the database (idempotent per Stripe event id).
3. `STRIPE_WEBHOOK_SECRET` on Render must match the live endpoint's signing secret.

## Security checklist (keep true)

- No secrets in git. `.env` files are ignored, and the gitleaks job scans every push.
- The browser has no grant on any private table, and every read and write is authorised by the API.
- Two-step sign-in is required for the admin panel, and on every request for anyone who has set it up.
- Rate limits key on the real client IP (`CF-Connecting-IP`, then the rightmost `X-Forwarded-For`).
- CORS allows only the site's own origins (`backend/main.py`).
- Uploads go through the API, which checks the file bytes, not the name.
- Captcha: sign-up, sign-in, forgot password and "send the email again" send an hCaptcha token. The password check on Archive listing runs on the server, which has no token, so it signs in with the service key on a throwaway client (`routes_listings._require_correct_password`). Any new server-side sign-in needs the same treatment, or captcha protection will refuse it.

Open owner items (legacy Supabase keys, repo visibility, captcha enforcement, email confirmation) are tracked in the private launch plan, not here, because this repository is public.
