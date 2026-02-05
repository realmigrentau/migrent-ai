# MigRent Unified Dashboard Setup Guide

This guide explains how to set up and deploy your new unified dashboard. Written for non-technical founders.

---

## What Was Created

### New Files Added

| File | Purpose |
|------|---------|
| `frontend/pages/dashboard/index.tsx` | Main dashboard page with role selection |
| `frontend/pages/dashboard/seeker.tsx` | Seeker-specific dashboard hub |
| `frontend/pages/dashboard/owner.tsx` | Owner-specific dashboard hub |
| `frontend/components/DashboardLayout.tsx` | Shared layout with sidebar navigation |
| `frontend/hooks/useDashboard.ts` | Hook for managing dashboard state & role |
| `backend/migrations/003_add_dashboard_role.sql` | Database migration for role field |

### Files Modified

| File | Change |
|------|--------|
| `frontend/pages/signin/index.tsx` | Added redirect support (redirects to dashboard after login) |
| `frontend/middleware.ts` | Updated to include dashboard routes |
| `backend/models.py` | Added `role` field to ProfileUpdate model |

---

## Step-by-Step Setup Instructions

### Step 1: Add the Role Column to Your Database

The dashboard needs to store each user's role choice (seeker or owner) in the database. You need to run a SQL command in Supabase.

1. **Open Supabase Dashboard**
   - Go to [supabase.com](https://supabase.com) and log in
   - Select your MigRent project

2. **Open the SQL Editor**
   - In the left sidebar, click "SQL Editor"
   - Click "New query" button

3. **Run the Migration**
   - Copy and paste this SQL code:

   ```sql
   -- Add role column to profiles table
   ALTER TABLE profiles
     ADD COLUMN IF NOT EXISTS role TEXT CHECK (role IN ('seeker', 'owner'));

   -- Create index for fast queries
   CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
   ```

   - Click the "Run" button (or press Cmd+Enter)
   - You should see "Success. No rows returned" - this means it worked!

### Step 2: Test Locally

1. **Open your terminal** (Terminal app on Mac)

2. **Navigate to your project folder**
   ```bash
   cd /Users/anesh/Desktop/migrent-ai/frontend
   ```

3. **Install any new dependencies** (if needed)
   ```bash
   npm install
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   - Go to: `http://localhost:3000/dashboard`
   - If you're not logged in, you'll be redirected to the sign-in page
   - After signing in, you'll land on the dashboard

### Step 3: Deploy to Vercel

1. **Commit your changes** (if using Git)
   ```bash
   cd /Users/anesh/Desktop/migrent-ai
   git add .
   git commit -m "Add unified dashboard"
   git push
   ```

2. **Vercel Auto-Deploys**
   - If your project is connected to Vercel, it will automatically deploy when you push to GitHub
   - Check your Vercel dashboard at [vercel.com](https://vercel.com) for deployment status

3. **Manual Deploy** (if not using Git)
   - Go to your Vercel project dashboard
   - Click "Deployments" tab
   - Click "Redeploy" on the latest deployment

### Step 4: Verify Everything Works

After deployment, run through this checklist:

---

## Verification Checklist

Test these scenarios to make sure everything is working:

### Authentication Tests
- [ ] **1. Visit /dashboard when logged out** → Should redirect to /signin
- [ ] **2. Sign in with an existing account** → Should land on /dashboard
- [ ] **3. Sign out from dashboard** → Should return to home page

### Role Selection Tests
- [ ] **4. New user visits /dashboard** → Should see role selection buttons ("I am a seeker" / "I want to be an owner")
- [ ] **5. Click "I am a seeker"** → Role saves, redirects to seeker hub
- [ ] **6. Click "I want to be an owner"** → Role saves, redirects to owner hub (may redirect to /owner/setup first)

### Navigation Tests
- [ ] **7. Seeker can navigate** → All sidebar links work (Search, Profile, Saved, etc.)
- [ ] **8. Owner can navigate** → All sidebar links work (Post Room, Listings, Profile, etc.)
- [ ] **9. Mobile navigation works** → On mobile, horizontal scroll nav appears

### Data Tests
- [ ] **10. Role persists after refresh** → Refresh the page; your role should still be set

---

## Environment Variables

Make sure these are set in your Vercel project settings:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous/public key |
| `NEXT_PUBLIC_API_BASE_URL` | Your backend API URL |

To check/add these in Vercel:
1. Go to your project on vercel.com
2. Click "Settings" tab
3. Click "Environment Variables" in the sidebar
4. Verify all three variables exist

---

## How It Works

### Dashboard Flow

```
User visits /dashboard
        ↓
   Logged in? ─── No ──→ Redirect to /signin
        ↓ Yes
   Has role? ─── No ──→ Show role selection screen
        ↓ Yes
   Show dashboard with role-specific content
```

### Role Storage

- When a user selects "I am a seeker" or "I want to be an owner", their choice is saved to the `profiles` table in Supabase
- The `role` column stores either `seeker` or `owner`
- This role is loaded on each visit to determine which dashboard view to show

### Sidebar Navigation

The sidebar shows different links based on the user's role:

**Seeker sees:**
- Home
- Seeker Hub
- Search Rooms
- Saved
- My Profile
- Messages
- Settings

**Owner sees:**
- Home
- Owner Hub
- Post a Room
- My Listings
- My Profile
- Messages
- Settings

---

## Troubleshooting

### "Role not saving"
- Check the Supabase SQL Editor for errors
- Make sure the `role` column exists in the `profiles` table
- Check the browser console (F12 → Console tab) for API errors

### "Dashboard shows blank"
- Check that all environment variables are set correctly
- Try clearing your browser cache and refreshing
- Check the browser console for JavaScript errors

### "Redirect not working"
- Make sure you're visiting `/dashboard`, not just `/`
- Check that the signin page is receiving the `?redirect=/dashboard` parameter

### "Styling looks wrong"
- Run `npm install` to make sure all dependencies are installed
- Check that Tailwind CSS is building correctly

---

## What's Next

Now that your dashboard is set up, you might want to:

1. **Customize the Getting Started checklist** - Edit `pages/dashboard/index.tsx` to track actual completion status
2. **Add analytics** - Track which role users choose, dashboard engagement
3. **Connect more features** - Add deals overview, recent activity, etc.
4. **Migrate to server-side auth** - For better security, migrate to `@supabase/ssr` with cookie-based sessions

---

## File Locations Reference

```
frontend/
├── pages/
│   ├── dashboard/
│   │   ├── index.tsx      ← Main dashboard (role selection + quick links)
│   │   ├── seeker.tsx     ← Seeker hub
│   │   └── owner.tsx      ← Owner hub
│   └── signin/
│       └── index.tsx      ← Updated with redirect support
├── components/
│   └── DashboardLayout.tsx ← Sidebar + navigation
├── hooks/
│   └── useDashboard.ts    ← Role management hook
└── middleware.ts          ← Route protection

backend/
├── models.py              ← Added role field
└── migrations/
    └── 003_add_dashboard_role.sql ← Database migration
```

---

## Questions?

If you have any issues, check:
1. Browser console for errors (F12 → Console)
2. Vercel deployment logs
3. Supabase logs (in the Supabase dashboard)

The dashboard is designed to work with your existing authentication - no changes needed to your current signin/signup flow!
