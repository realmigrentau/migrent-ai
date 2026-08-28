# Batch 1 deploy steps

Branch: `fix/batch-1-critical`

**The order matters.** The migration removes database permissions that the old
backend and old frontend rely on. Run it out of order and messaging, reviews,
the contact form and account deletion will break.

Do it in this order: **backend first, then frontend, then the migration.**

---

## Step 1 - Deploy the backend to Render

Push the branch, then let Render deploy it (or hit Manual Deploy).

Wait until Render shows **Live** before moving on.

Check it came up:

```bash
curl -s https://migrent-ai-backend.onrender.com/health
```

You want `{"status":"ok"}`.

---

## Step 2 - Deploy the frontend to Vercel

Same branch. Wait for the deployment to finish and go green.

Then load the site and check two things:

- The homepage loads and looks normal.
- Sign in works.

If either is broken, stop and tell me before running Step 3.

---

## Step 3 - Run the migration in Supabase

1. Open your Supabase project.
2. Left sidebar, click **SQL Editor**.
3. Click **New query**.
4. Open `backend/migrations/039_rls_lockdown.sql` on your computer, copy the
   whole file, paste it in.
5. Click **Run**.

It should finish with "Success. No rows returned."

**If you get an error, do not re-run it. Paste the error to me.** The file is
safe to run twice, so nothing is broken by stopping partway.

One error is expected and is not a bug: if the `bookings_no_overlap` line
fails, it means two accepted or paid bookings already cover the same room on
the same dates. That is a real double-booking that a person has to resolve.
The query to find them is written in a comment right above that line.

---

## Step 4 - Check the locks actually took

Still in the SQL Editor, run these three. Expected results are noted.

**a) No always-open policy left on profiles.** Should return **zero rows**.

```sql
SELECT policyname, qual FROM pg_policies
 WHERE tablename = 'profiles' AND qual = 'true';
```

**b) No write access for logged-out or logged-in users.** Should return
**zero rows**.

```sql
SELECT table_name, grantee, privilege_type
  FROM information_schema.role_table_grants
 WHERE table_schema = 'public'
   AND grantee IN ('anon', 'authenticated')
   AND privilege_type IN ('INSERT', 'UPDATE', 'DELETE')
   AND table_name IN ('listings','bookings','reviews','messages','deals',
                      'reports','referrals');
```

**c) The public profile view exists.** Should return **one row**.

```sql
SELECT table_name FROM information_schema.views
 WHERE table_schema = 'public' AND table_name = 'public_profiles';
```

---

## Step 5 - Click through these on the live site

Six things, about five minutes. Each one is something this batch changed.

1. **Messages.** Open a conversation, send a message. It should appear.
   Read receipts should still work.
2. **Public profile.** Open someone else's profile page. Name, photo and
   badges should show.
3. **Search.** Search for a room. Results should appear.
4. **Listing page.** Open a listing. It should load.
5. **Forgot password.** Go to `/forgot-password`, enter your email, submit.
   You should get a reset email. Follow it and set a new password.
6. **Notifications.** If you use push notifications, click Enable on the
   dashboard. This is the one most likely to be affected by the CSP change.

If **6** fails, open the browser console (right click, Inspect, Console tab).
A red line mentioning "Content Security Policy" means a host needs adding to
the list in `frontend/next.config.ts`. Send me the line and I will add it.

---

## If something breaks and you need it working right now

The CSP is the only change that can break the site without breaking the
database. To turn it off, in `frontend/next.config.ts` change:

```
{ key: "Content-Security-Policy", value: csp },
```

back to:

```
{ key: "Content-Security-Policy-Report-Only", value: csp },
```

and redeploy. That reverts to logging problems instead of blocking them.

To undo the database changes you would restore from a Supabase backup, so
check Step 4 before you rely on it.

---

## Still yours to do, not code

These were in the audit as launch blockers and I cannot do them from here:

- **Email sending domain.** `FROM_EMAIL` is a Gmail address. Gmail-from mail
  fails DMARC and lands in spam, which means password reset emails may not
  arrive. Verify a real sending domain in Resend and set `FROM_EMAIL` to it.
- **Stripe live keys.** Still on test keys, so no real payment can complete.
- **DNS for migrent.com.au.** Until it points at Vercel, every canonical URL
  and share link uses the `.vercel.app` domain.
