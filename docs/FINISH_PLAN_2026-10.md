# Migrent finishing plan (October 2026)

A full scan of the live site, the code, the database and the emails on
2026-10-19, turned into 20 stages that are worked through in one go and
shipped together.

## What the scan found

- Live site: no runtime errors in 7 days, strong browser security headers,
  latest commit deployed. Design is polished; the weak spots are empty states
  (the homepage "rooms" section is one card and a large empty area).
- API: faking the `X-Forwarded-For` header gives unlimited attempts against
  every rate limit (66 requests passed with a faked IP; the limit fired at 61
  without). Only about 87 of 261 endpoints have a limit at all. API responses
  carry no security headers. Several endpoints send raw error text back.
- Dependencies: Next.js 16.3.6 has 6 known security advisories (fixed in
  16.4.x). Backend libraries with known advisories: Starlette 0.38.6 (via
  FastAPI 0.115), PyJWT 2.9.0, cryptography 43, Pillow 11.1, python-multipart
  0.0.12, python-dotenv 1.0.1.
- Database: grants are tight (signed-in users can only read, never write,
  directly). But the `public_profiles` view lets anyone list every account's
  name, bio and internal user ID, and it still shows suspended accounts.
  `is_superadmin()` can be called without signing in. 37 policies re-check the
  session per row (slow at scale), 24 duplicate policies, 22 foreign keys
  without an index, one duplicate index.
- Emails: two systems. The backend sends the new colourful design; the
  frontend still has the old react-email templates and sends a second welcome
  email from the sign-in page. Reports use a third path.
- Code: 118 lint warnings, the retired `/admin` console pages still ship
  (every URL redirects to the Hub), plus other unused files.

## The 20 stages

1. **API front door.** Rate-limit key that cannot be faked; a default limit on
   every endpoint; security headers on every API response; a request size cap.
2. **Patch dependencies.** Next.js 16.4.x, FastAPI/Starlette 1.x, PyJWT,
   cryptography, Pillow, python-multipart, python-dotenv, source-map-js.
3. **Database hardening.** Stop profile listing and hide internal IDs, drop
   suspended accounts from public views, lock admin functions, merge duplicate
   policies, make policies check the session once per query, index foreign
   keys, drop the duplicate index (migration 052).
4. **Error hygiene.** No raw exception text in API responses; errors go to the
   logs and Sentry, people get a plain message.
5. **Sign-in and sessions.** Review token checks, admin second factor, account
   enumeration on sign-up and reset, session expiry.
6. **Uploads.** File type sniffing, size limits, metadata stripping, private
   storage with short-lived links.
7. **Payments and webhooks.** Signature checks, replay safety, amounts set on
   the server only.
8. **One email system.** Every email from the backend design; retire the old
   frontend templates and the duplicate welcome email; plain-text versions;
   unsubscribe headers; copy review.
9. **Remove dead code.** Retired admin console, unused components and files.
10. **Code quality.** Clear the 118 lint warnings.
11. **Homepage.** A finished empty state for rooms and tighter sections.
12. **Search and listings.** Empty, loading and error states; filters on phone.
13. **Migrent Hub.** Consistent empty states and wording across screens.
14. **Accessibility.** Automated checks on key pages, keyboard and focus,
    contrast, reduced motion.
15. **Phone layout.** Every key page at 375 px wide with no sideways scroll.
16. **Search engines.** Titles, descriptions, share images, structured data,
    sitemap and robots.
17. **Speed.** Bundle size, images, fonts, Core Web Vitals.
18. **Copy, claims and legal.** Consumer-law claim check, no em dashes,
    consistent prices and wording.
19. **Monitoring and operations.** security.txt, dependency alerts, health
    checks, runbook updates.
20. **Ship.** All tests, production build, push to main, Vercel and Render
    deploy, migration applied, live checks.

## Owner tasks (things only the account owner can do)

Listed in the final report with step-by-step instructions.
