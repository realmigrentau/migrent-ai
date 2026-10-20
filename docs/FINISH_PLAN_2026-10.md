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

## Status after the run (2026-10-20)

Released to main as one series of commits; migration 052 applied after the
new frontend went live.

| Stage | Result |
|---|---|
| 1 API front door | Done. Rate-limit key from the edge header, never the caller's X-Forwarded-For; default limit on every route (an app-wide dependency, because FastAPI 0.140+ hides nested routes from slowapi's middleware); security headers; 16 MB body cap; /health/ip. |
| 2 Dependencies | Done. pip-audit and npm audit both report none. |
| 3 Database | Done. Migration 052 (profiles cannot be listed, no browser reads of private tables, storage uploads only through the API, indexes). |
| 4 Errors | Done. Crashes answer plain JSON from inside CORS; no exception text in answers. |
| 5 Sign-in | Reviewed, no change needed. |
| 6 Uploads | Fixed: decompression bombs refused from the header. |
| 7 Payments | Reviewed, no change needed. |
| 8 Emails | Done. One system, sent in the background, plain-text copy, report alerts fixed. |
| 9 Dead code | Done. Old admin console and 28 unused files removed. Old admin API routes kept: the Hub's Admin panel calls their handlers and they need admin + authenticator code + panel password. |
| 10 Lint | 0 errors (was going to be 11 after the Next upgrade); 118 warnings down to 53. The rest are react-hooks/set-state-in-effect in data-loading effects across 44 screens, left for a dedicated pass. |
| 11-13 Design | Honest empty states on the homepage and search; taller search map; review carousel dots; small copy and type fixes. |
| 14 Accessibility | axe checks pass on all tested pages in light and dark; focus return fixed in the email help dialog. |
| 15 Phone | No sideways scroll on any of 16 key pages at Pixel 7 size. |
| 16 Search engines | Already sound; llms.txt added. |
| 17 Speed | Production builds use webpack (Turbopack's inline script broke the CSP); budget passes on 5 of 6 pages, search LCP 2.8 s (was 5.8 s). |
| 18 Claims | Already sound; invented-feature posts were already hidden and redirect away. |
| 19 Operations | Dependabot, strict pip-audit in CI, README current. |
| 20 Ship | See the commit history and the live checks in the session report. |

### Known limits

- Emails sent through the Gmail relay (Apps Script) cannot carry the
  List-Unsubscribe header; SMTP and Mailjet do. Moving to a sending domain
  (migrent.com.au) fixes this and the ~100 a day relay limit.
- The 53 remaining lint warnings (see stage 10).
