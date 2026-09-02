# Secrets, environments and rotation

## Where secrets live

| Secret | Lives in | Never in |
|---|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Render (backend) env only | frontend, Vercel, git, laptops beyond a gitignored `.env` |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Render env; live values only in the production service | test values in preview/staging |
| `CRON_SECRET`, `INTERNAL_EMAIL_SECRET` | Render + Vercel (server-side only) | `NEXT_PUBLIC_*` |
| `ADMIN_USERNAME/PASSWORD/LOCKOUT_PASSWORD` | Vercel server env | client bundle |
| `MAPTILER_API_KEY` (server) | Render | client |
| `NEXT_PUBLIC_MAPTILER_KEY` (browser) | Vercel; restrict to allowed origins in the MapTiler console | hard-coded in source (the previous literal was removed) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public by design; RLS is the boundary | n/a |

`backend/.env` on the development laptop currently holds a Pinecone key and a service-role key. Pinecone is unused: delete the key at Pinecone. Rotate the service-role key in Supabase (Settings > API > "Generate new service role key"), update Render, restart.

## Rotation procedure

1. Generate the new value at the provider (Supabase, Stripe, MapTiler, Resend).
2. Add it to the environment (Render or Vercel) as a new value; redeploy.
3. Verify (backend `/health`, one search, one sign-in).
4. Revoke the old value at the provider.
5. Record the date in this file's changelog below.

Stripe webhook: create a **live** endpoint at `https://migrent-ai-backend.onrender.com/webhooks/stripe` subscribed to `checkout.session.completed`, `checkout.session.expired`, `charge.refunded`; copy its signing secret into `STRIPE_WEBHOOK_SECRET`. Test-mode secrets do not verify live events.

## Environment separation

- **Production**: Vercel production + Render production + Supabase project `nsnwwfbidishftlrimer`. Live Stripe keys.
- **Preview**: every Vercel preview deployment should be protected (Vercel > Settings > Deployment Protection > "Standard Protection" or Vercel Authentication) so unreviewed builds are not public. Point previews at a staging backend with test Stripe keys; never at production data.
- **Local**: `.env.local` / `backend/.env`, test keys, and the mock API (`frontend/tests/e2e/mock-api.mjs`) for UI work.

## Logging and monitoring

- Backend logs are JSON and pass through a redactor (`backend/logging_config.py`) that masks emails, bearer tokens, Stripe keys, JWTs and phone numbers.
- Sentry (both sides) is inert until a DSN is set; `sendDefaultPii` is false. Map failures are reported with a feature tag and no user data.

## Changelog

- 2026-09-03: hard-coded MapTiler browser key removed from source; email relay locked behind `INTERNAL_EMAIL_SECRET`; admin verify requires a session.
