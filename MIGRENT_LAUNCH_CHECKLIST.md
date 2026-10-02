# MIGRENT LAUNCH CHECKLIST

1 October 2026. Legend: `[ ]` fix required · `[x]` already working properly · `[~]` works but should improve. IDs refer to [MIGRENT_MASTER_AUDIT.md](MIGRENT_MASTER_AUDIT.md).

---

## Owner-only actions (nobody else can do these)

- [ ] Rotate the Supabase keys that were committed to git (move to new API keys, disable legacy JWT keys) and the Mailjet, Stripe test/webhook and Pinecone secrets; confirm whether the GitHub repo was ever public (MIG-003)
- [ ] Point migrent.com.au at Vercel (DNS), set up mailboxes (support@, privacy@, legal@), verify the domain with one email provider (SPF, DKIM, DMARC), set `FROM_EMAIL` (MIG-014)
- [ ] Set `NEXT_PUBLIC_SITE_ORIGIN`, `FRONTEND_URL`, `HUB_BASE_URL`; add the domain to Supabase redirect URLs (MIG-014)
- [ ] Enable Vercel Web Analytics on the project; add `SENTRY_DSN` (Render) and `NEXT_PUBLIC_SENTRY_DSN` (Vercel); create an uptime monitor for `/health` (MIG-015)
- [ ] Confirm the four Render cron jobs and `CRON_SECRET` exist (MIG-042)
- [ ] Confirm the Render start command includes `--proxy-headers --forwarded-allow-ips="*"`; consider a paid plan in Singapore (MIG-046, MIG-029)
- [ ] Supabase Auth: enable leaked-password protection; confirm captcha enforcement (MIG-036, MIG-020)
- [ ] Enable Stripe Connect on the live account before mentors can be paid (MIG-018)
- [ ] Restrict the MapTiler key (it is public in the page bundle by design) to Migrent's domains in the MapTiler dashboard
- [ ] Decide the host-fee model (per property at first stay vs per listing; long-term free?) (MIG-006)
- [ ] Confirm the legal entity and have Australian counsel review Terms, Privacy, Disclaimer, retention and rental-law content (MIG-006, MIG-016, MIG-035)
- [ ] Recruit founding hosts: 25-50 real listings in 2-3 Sydney suburbs before public launch (MIG-005)

---

## RENTER CHECKLIST

**Discovery**
- [ ] Real listings exist to find (MIG-005)
- [~] Homepage explains the offer in 5 seconds; make "for people new to Australia" and "rooms and leases" explicit in the hero
- [ ] Homepage "Available now" shows rooms or is hidden (MIG-005, MIG-021)
- [ ] Search empty state is honest and offers an alert (MIG-022)
- [ ] Suburb autocomplete in hero and search location fields (MIG-039)
- [x] Search filters: price, room type, property type, furnished, bills, pets, parking, air con, couples, near station, private bathroom, lockable door, no cameras, verified owner, min bedrooms, min stay
- [ ] Lease-type filter (short stay vs lease) and "newcomers welcome" filter (MIG-045)
- [~] Guest/infant wording replaced with "people moving in" (MIG-040)
- [x] Sorting and pagination
- [x] URL-synced filters; malformed URLs handled safely
- [~] Map with WebGL fallback (verify with real listings and a production MapTiler key)

**Listing**
- [x] Photos, gallery, full-screen view
- [x] Suburb and postcode; approximate area; street address only after booking
- [x] Weekly price
- [ ] Bond, rent in advance and total move-in cost shown (MIG-017)
- [~] Bills: shows included/not included; add an estimate
- [x] Bedrooms, bathrooms, furnished, amenities, availability, minimum stay
- [~] Lease type, house rules, who lives there, safety items: collected, not shown on the public page (MIG-043)
- [x] Host card with honest ID-check explanation
- [ ] Host card "Message" button works (MIG-008)
- [ ] Report this listing on the public page (MIG-009)
- [ ] "Never pay before you inspect" warning on the public page (MIG-009)
- [ ] Share on the public page (MIG-043)
- [ ] Reviews are real or hidden (MIG-011)
- [x] Apply, Book an inspection, Message, Save go through sign-in and keep the intent
- [~] Transport shows the mode ("walk") (MIG-055)
- [x] Expired listing shows an honest 410 state; removed listing 404

**Account and onboarding**
- [x] Sign up with email and password (10+ characters, letters and a number)
- [x] Google sign-in and magic link
- [x] Validation and non-enumerating errors
- [x] Forgot password and reset
- [x] Email confirmation
- [ ] Welcome email (MIG-056)
- [~] Sign-up loads slowly on mobile (MIG-028)
- [x] Welcome step: role, name, 18+, terms
- [x] Sign out (one tap; ends the session)
- [x] Session persistence and redirect back to the original page

**Hub**
- [x] Home with next actions
- [x] Rental Profile (first-rental friendly, income private by default, documents private)
- [x] Saved homes with price changes; unavailable homes separated
- [x] Saved searches with alert cadence
- [~] Saved-search alerts actually send (cron unverified, MIG-042)
- [x] Applications with timeline
- [x] Inspections: book, move, cancel; address released on booking
- [x] Messages with home and application context; Archive, Mute, Report
- [ ] Block from inside a conversation (MIG-032)
- [ ] Scam warnings in messages (MIG-033)
- [x] Tenancy: lease, rent record, repairs with emergency guidance
- [x] Notifications (Activity) and email preferences
- [x] Password change, MFA, sign out other devices
- [x] Download your data
- [~] Delete account (leaves files; erases the other side's messages) (MIG-016)
- [ ] Contact Migrent and get a tracked reply (MIG-065)
- [ ] Rent and host from one account (MIG-047)

---

## LANDLORD CHECKLIST

- [x] Obvious that owners can list (nav, hero switch, owners page)
- [~] Fees clear: "free to list, $99 per property for stays" but "stays" undefined (MIG-040) and legal pages disagree (MIG-006)
- [x] Sign-up with "I own it / I manage it"
- [x] Six-step wizard with autosave and free navigation
- [x] Review step lists missing items with links
- [x] Search-card preview before sending
- [x] Photos validated (type sniffing, size, minimum dimensions) and stripped of location data
- [ ] Suburb / state / postcode consistency checked; suburb autocomplete (MIG-023)
- [ ] Bond structured and required for leases; checked against state limits (MIG-017)
- [~] Price validation (0 < price <= 50,000 per week); consider a sanity warning for outliers vs the suburb median
- [x] Title (80) and description (5,000) limits
- [x] ID check before going live (human review, document link expires in 5 minutes)
- [ ] ID check cannot be forged (MIG-001)
- [x] Draft, submit for review, published, paused, expired, renewed states
- [ ] Edits to a live listing are re-reviewed (MIG-010)
- [x] Pause, resume, renew, archive property
- [x] Inspection slots with capacity; attendance
- [x] Applications side by side with private notes; shortlist; request changes
- [x] Inbox per home with reply templates
- [x] Insights from recorded events only, with "counting since"
- [x] Pay the $99 fee when accepting the first stay (retry button exists)
- [ ] Obligations checklist by state (bond lodgement, condition report, minimum standards)
- [~] Listing expiry reminders (cron unverified, MIG-042)
- [ ] Email notifications reliably delivered from the Migrent domain (MIG-014)

---

## PROPERTY MANAGER CHECKLIST

- [x] Can choose "I manage it" at onboarding and in Settings
- [x] Several properties with rooms grouped under each
- [x] Copy a listing
- [ ] Agency name and licence number on the profile and listings (MIG-026)
- [ ] Team members with roles and a shared inbox (MIG-026)
- [ ] Portfolio search, filters, sort and pagination (MIG-026)
- [ ] Bulk pause, renew and edit (MIG-026)
- [~] Applications search and status filter (exists); add filter by property
- [ ] CSV import/export of listings and applicants (MIG-026)
- [ ] Record of the landlord's authority for each managed property (MIG-026)
- [~] Portfolio insights (Hub home 30-day totals only)

---

## ADMIN CHECKLIST

- [x] Admin rights come from the database, never from the user
- [x] Admin APIs protected server-side (403 for non-admins, 423 until the panel is unlocked)
- [x] Non-admins get 404 on old `/admin` URLs
- [ ] MFA required for admins and enforced by the API (MIG-019)
- [~] Panel password shared by all admins (replace with per-admin MFA) (MIG-019)
- [~] 30-second idle lock with siren (MIG-025)
- [x] Overview with queue counts
- [x] Listings: to review, flagged, hidden, removal pending, paused, all; search; reasons required; two-step removal
- [ ] Queue for listings edited after approval (MIG-010)
- [ ] Bulk moderation and canned reasons (MIG-024)
- [x] ID checks: view document, approve, reject with reason
- [x] Final application reviews
- [~] Reports: priority, take, close with reason; no inline actions (MIG-024)
- [x] Support tickets: reply, internal notes, status, priority
- [ ] Contact-form messages appear in Support (MIG-065)
- [~] People: search, view as (reason, read-only, 60 minutes), suspend/reinstate with reason; no browse list or person detail (MIG-024)
- [ ] Suspension actually blocks the account everywhere and hides listings (MIG-002)
- [x] Audit log of every consequential action
- [ ] Metrics: signups, listings, enquiries, applications over time (MIG-015, MIG-024)
- [ ] Email a user from the panel (MIG-024)

---

## SECURITY CHECKLIST

- [ ] `owner_verification` cannot be written by users (MIG-001)
- [ ] `profiles` admin/system columns cannot be written by users (`disabled_at`, `badges`, response stats, ...) (MIG-002)
- [ ] `mentors` and `mentor_sessions` cannot be written by users (MIG-018)
- [ ] Legacy raw-listing endpoints removed (MIG-004)
- [ ] Legacy auth and cross-device endpoints removed; `cross_device_tokens` dropped (MIG-020)
- [ ] Leaked secrets rotated (MIG-003)
- [ ] Suspension enforced in every write route (MIG-002)
- [ ] MFA enforced server-side (MIG-019)
- [ ] Account deletion removes Storage files; evidence retained per policy (MIG-016)
- [ ] Guest ticket endpoint rate-limited, escaped, captcha-protected (MIG-041)
- [~] Supabase grants and SECURITY DEFINER functions tightened; leaked-password protection on (MIG-036)
- [~] Shared, persistent rate limits (MIG-046)
- [x] RLS enabled on all 56 tables
- [x] CSP with script hashes, HSTS preload, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy
- [x] CORS restricted to Migrent origins
- [x] API docs hidden in production
- [x] Admin claim from the database; admin sessions re-checked live
- [x] Hub record-level authorisation (applications, documents, tenancies, inbox)
- [x] Public listing contract strips address, exact coordinates, owner ID
- [x] Upload type sniffing, size limits, EXIF stripping, private buckets with signed URLs
- [x] Stripe webhook signature, idempotency and amount checks
- [x] Safe redirects (`next`/`return` must be same-origin relative paths)
- [x] Messages stored and rendered as plain text
- [x] 0 known npm vulnerabilities
- [ ] Secret scanning in CI (MIG-003)

---

## MOBILE CHECKLIST

- [x] No horizontal overflow at 320 px on 22 public pages
- [x] iPhone (WebKit) renders key pages without errors, light and dark
- [x] Hub phone tab bar and one-tap sign out
- [ ] Support panel fits the screen (MIG-012)
- [ ] Help bubble does not cover the search field or chips (MIG-012)
- [ ] Location search visible on the first screen of the homepage and search page (MIG-039)
- [~] Footer tap targets at least 24 px (MIG-053)
- [x] Filters as a drawer on phones
- [x] Forms use correct input types (email, numeric) and autocomplete hints
- [~] Sign-up speed on mid-range phones (MIG-028)
- [ ] Test on a physical iPhone and a Samsung Android before launch

---

## ACCESSIBILITY CHECKLIST

- [x] axe WCAG 2.2 AA clean on 32 public pages in light and dark, except one chip (MIG-052)
- [ ] Fix chip contrast 4.16:1 (MIG-052)
- [x] Skip link, logical focus order, visible focus
- [x] Labels associated with every input; errors announced; `aria-invalid`
- [x] Icon-only buttons have accessible names
- [x] Reduced motion respected
- [x] Hub screens pass axe in light and dark (e2e)
- [~] Doll's house rooms not keyboard operable (equivalent controls exist) (MIG-064)
- [~] Move focus to the first invalid field on submit (MIG-063)
- [~] Small footer targets (MIG-053)
- [ ] Screen-reader pass with VoiceOver on iOS on the main renter journey

---

## SEO CHECKLIST

- [x] Unique titles and descriptions on every public page
- [x] Canonical URLs
- [x] Open Graph and Twitter cards
- [x] JSON-LD on listings, suburbs, help, articles
- [ ] Organization and WebSite JSON-LD on the homepage (MIG-051)
- [x] `robots.txt` and sitemaps with real dates
- [ ] Listing sitemap paginated beyond 100 (MIG-037)
- [ ] Indexable "rooms in [suburb]" landing pages linked from suburb guides (MIG-037)
- [~] `/seeker/search` at least `noindex,follow` (MIG-037)
- [ ] Soft 404s return 404 (MIG-050)
- [ ] Move canonical domain to migrent.com.au with 301s from `*.vercel.app` (MIG-014)
- [ ] Google Search Console verified and sitemaps submitted
- [~] Guides content depth (MIG-044)
- [~] Server-render `/become-mentor` (MIG-051)

---

## PERFORMANCE CHECKLIST

- [x] Public pages LCP about 2.3-2.7 s on throttled mobile; CLS near zero
- [x] Sydney Vercel functions; static/ISR pages with 28-63 ms TTFB
- [x] Self-hosted fonts; two preloaded
- [x] AVIF/WebP images via `next/image`
- [x] Supabase, Sentry and hCaptcha not shipped on public pages
- [ ] Sign-up LCP 3.9 s and 3.7 s long tasks (MIG-028)
- [ ] API region and plan (MIG-029)
- [ ] Search sort hydration mismatch (MIG-027)
- [~] Supabase performance advisors: per-row `auth.uid()` in 45 policies, 20 unindexed foreign keys, duplicate index (MIG-036)
- [~] Owner insights read up to 20,000 events into Python per request; move aggregation into SQL as data grows
- [x] Production build clean
