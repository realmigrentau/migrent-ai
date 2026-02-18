# Magic Auth Link Implementation Plan

## Architecture Decision: Supabase-Native Magic Links (Simplified)

**Key insight:** The current codebase already uses `supabase.auth.signInWithOtp({ email })` on both signin and signup pages. Supabase natively handles magic link emails, token generation, and verification. Rather than building a parallel Resend-based system, we should **leverage Supabase's built-in magic link system** and create dedicated pages with better UX.

**Why NOT use custom Resend emails for auth:**
- Supabase already sends magic link emails with proper token handling
- Custom token generation + verification would require reimplementing secure auth flows
- Supabase handles token expiry, replay protection, and session creation automatically
- Resend is already integrated for support emails — auth emails are a separate concern best handled by Supabase

**What we WILL do:**
- Create dedicated magic link pages with beautiful UX (not a button buried in signin/signup)
- Configure Supabase email templates to use branded MigRent HTML
- Create a proper `/auth/callback` page that handles the redirect after email click
- Update signin/signup pages to link to magic link pages instead of inline buttons
- Add rate limiting via the existing slowapi setup

---

## Changes Overview

### Frontend (5 files)

#### 1. NEW: `pages/magic-link-signup/index.tsx`
- Standalone page with email input
- Calls `supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } })`
- Beautiful branded UI matching existing auth page style (rose gradient like signup)
- Shows success state: "Check your email! We sent a magic link to [email]"
- Link back to regular signup and signin

#### 2. NEW: `pages/magic-link-login/index.tsx`
- Standalone page with email input
- Calls `supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false } })`
- Blue gradient matching signin page style
- Shows success state with email confirmation
- Link back to regular signin

#### 3. NEW: `pages/auth/callback/index.tsx`
- Handles Supabase magic link redirect (Supabase appends `#access_token=...&type=magiclink` to the URL)
- Parses the hash fragment, calls `supabase.auth.getSession()` to pick up the session
- Shows loading spinner during verification
- On success → redirect to `/onboarding` (for new users) or `/dashboard` (for existing)
- On error → shows error message with link to try again

#### 4. EDIT: `pages/signin/index.tsx`
- Remove the inline `handleMagicLink` function
- Replace "Send login link to email" button with a Link to `/magic-link-login`
- Text: "Sign in with magic link" → links to dedicated page

#### 5. EDIT: `pages/signup/index.tsx`
- Remove the inline `handleMagicLink` function
- Replace "Send login link to email" button with a Link to `/magic-link-signup`
- Text: "Sign up with magic link" → links to dedicated page

### Backend (1 file)

#### 6. NEW: `backend/routes_magic_auth.py`
- `POST /auth/magic-signup` — rate limited (3/minute per IP)
  - Accepts `{ email }`, calls `sb.auth.sign_in_with_otp({ email, options: { should_create_user: True } })`
  - Returns `{ status: "ok", message: "Magic link sent" }`
- `POST /auth/magic-login` — rate limited (3/minute per IP)
  - Accepts `{ email }`, calls `sb.auth.sign_in_with_otp({ email, options: { should_create_user: False } })`
  - Returns `{ status: "ok", message: "Magic link sent" }`
- Register in `main.py`

> **Note:** These backend endpoints provide server-side rate limiting as an additional security layer. The frontend pages call Supabase directly for the actual OTP send (matching the existing pattern), but these backend endpoints can be used as an alternative entry point with IP-based rate limiting.

### Supabase Configuration (Instructions)

#### 7. Supabase Dashboard Settings
- Auth → URL Configuration → Add redirect URL: `https://migrent-ai.vercel.app/auth/callback`
- Auth → Email Templates → Customize the magic link email template with MigRent branding
- Provide the branded HTML template for the magic link email

---

## File-by-File Details

### `pages/magic-link-signup/index.tsx`
```
- Email input with validation
- "Send magic link" button
- Loading state with spinner
- Success state: green banner "Check your email for a sign-up link"
- Error state: red banner with message
- Links: "Already have an account? Sign in" + "Use password instead → /signup"
- Uses existing design patterns (motion, card, floating shapes)
```

### `pages/magic-link-login/index.tsx`
```
- Same structure as signup but with login-specific copy
- Blue gradient theme (matching signin)
- shouldCreateUser: false (won't create new accounts)
- Links: "Don't have an account? Sign up" + "Use password instead → /signin"
```

### `pages/auth/callback/index.tsx`
```
- useEffect on mount:
  1. supabase.auth.getSession() — picks up session from URL hash
  2. If session exists → redirect to /onboarding
  3. If no session after 3s → show error
- Loading UI: MigRent logo + spinner + "Verifying your email..."
- Error UI: "Link expired or invalid" + retry links
```

### Backend `routes_magic_auth.py`
```python
POST /auth/magic-signup:
  - Rate limit: 3/minute
  - Input: { email: EmailStr }
  - Uses get_supabase().auth.sign_in_with_otp()
  - Returns { status, message }

POST /auth/magic-login:
  - Rate limit: 3/minute
  - Input: { email: EmailStr }
  - Same but should_create_user=False
```

---

## What This Does NOT Change
- Google OAuth flow (untouched)
- Email/password signin/signup (untouched, just removes magic link button)
- useAuth hook (already handles magic link sessions via onAuthStateChange)
- Backend auth routes `/auth/register` and `/auth/login` (untouched)
- Resend integration for support emails (untouched)
