# MigRent Operations & Backup Guide

## Architecture Overview

| Component | Service | URL |
|-----------|---------|-----|
| Frontend | Vercel (Next.js) | migrent-ai.vercel.app |
| Backend API | Render (FastAPI) | render deploy |
| Database | Supabase (Postgres) | supabase.com dashboard |
| Payments | Stripe | dashboard.stripe.com |
| Email | Resend | resend.com |
| DNS/Domain | Vercel | — |

## Environment Variables

### Backend (Render)
- `SUPABASE_URL` – Supabase project URL
- `SUPABASE_ANON_KEY` – Supabase anon/public key
- `STRIPE_SECRET_KEY` – Stripe secret key
- `STRIPE_WEBHOOK_SECRET` – Stripe webhook signing secret
- `RESEND_API_KEY` – Resend email API key
- `SUPPORT_EMAIL` – Admin email for notifications
- `FRONTEND_URL` – Production frontend URL for CORS

### Frontend (Vercel)
- `NEXT_PUBLIC_API_URL` – Backend API base URL
- `NEXT_PUBLIC_SUPABASE_URL` – Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` – Supabase anon key
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` – Stripe publishable key
- `NEXT_PUBLIC_HCAPTCHA_SITE_KEY` – hCaptcha site key

## Database Backups

### Automatic (Supabase)
Supabase Pro plan includes daily automated backups with 7-day retention. Check the Supabase dashboard under **Settings → Database → Backups**.

### Manual Backup
```bash
# Export via Supabase CLI
npx supabase db dump -f backup_$(date +%Y%m%d).sql

# Or via pg_dump (get connection string from Supabase dashboard)
pg_dump "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" > backup_$(date +%Y%m%d).sql
```

### Restore
```bash
psql "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" < backup_YYYYMMDD.sql
```

## Deployment

### Frontend (Vercel)
- Auto-deploys on push to `main` branch
- Preview deploys on PRs
- Rollback: Vercel Dashboard → Deployments → select previous → Promote

### Backend (Render)
- Auto-deploys on push to `main` branch
- Rollback: Render Dashboard → select service → Manual Deploy → choose previous commit

## Monitoring

### Vercel Analytics
- Page views, web vitals, and custom events
- Dashboard: vercel.com → Project → Analytics

### Supabase
- Database health, API usage, auth metrics
- Dashboard: supabase.com → Project → Reports

### Stripe
- Payment volume, failed charges, disputes
- Dashboard: dashboard.stripe.com

## Incident Response

### Site Down
1. Check Vercel status: vercel.com/status
2. Check Render status: render.com/status
3. Check Supabase status: status.supabase.com
4. Check browser console / network tab for specific errors
5. Review Render logs: Dashboard → Service → Logs

### Payment Issues
1. Check Stripe Dashboard for failed events
2. Review webhook logs: Stripe → Developers → Webhooks
3. Verify `STRIPE_WEBHOOK_SECRET` matches in Render env

### Database Issues
1. Check Supabase dashboard → Database → Health
2. Review slow queries: SQL Editor → `select * from pg_stat_activity`
3. Check connection pool: Supabase → Settings → Database → Connection Pooling

## Security Checklist

- [ ] All env vars set in Vercel and Render (not committed to git)
- [ ] Supabase RLS policies enabled on all tables
- [ ] Stripe webhook secret rotated quarterly
- [ ] Admin route uses obfuscated path
- [ ] Rate limiting active on all public endpoints
- [ ] hCaptcha enabled on auth and contact forms
- [ ] CORS restricted to known frontend origins
- [ ] No secrets in client-side code (NEXT_PUBLIC_ prefix only for public keys)

## Supabase Tables

| Table | Purpose |
|-------|---------|
| profiles | User profiles (seeker/owner/admin) |
| listings | Room listings with details |
| deals | Booking deals between seekers and owners |
| support_requests | Contact form submissions |
| reports | Listing reports from users |

### Required SQL for Reports Table
```sql
CREATE TABLE IF NOT EXISTS reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID REFERENCES auth.users(id),
  listing_id UUID REFERENCES listings(id),
  reason TEXT NOT NULL,
  details TEXT DEFAULT '',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'actioned', 'dismissed')),
  reviewed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create reports"
  ON reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Admins can view all reports"
  ON reports FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update reports"
  ON reports FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
```
