# MigRent Community Tab - V1 Plan

A launch-safe plan for a Community tab inside the MigRent dashboard, with stronger profile and community-related functionality. Designed to feel useful, trustworthy, and migrant/student-aligned without becoming a noisy social network.

---

## SECTION 1 - COMMUNITY STRATEGY

**Why community can help a rental marketplace**
- Rentals are emotional and high-stakes, especially for migrants and international students arriving with little context. Listings alone do not answer "is this suburb safe at night?", "how do I open a bank account?", "what bond do I really need?".
- Peer answers from people who recently went through the same process are more trusted than marketing copy.
- A small, well-moderated community layer turns MigRent from a transactional listings site into a "soft landing" platform, which is the brand promise.

**Why it lifts trust, retention, and usefulness**
- Trust: real profiles with answered questions and verified migrant journeys reduce the "is this real?" feeling that international users have toward AU rental sites.
- Retention: people return between bookings (search -> booking is bursty). A tips feed and Q&A give a reason to return weekly, not only when looking.
- Usefulness: surfaces high-intent micro-decisions (suburb fit, transport, bond, visas, scams) that listings cannot answer.

**Why overbuilding backfires**
- Empty feeds look dead. A full forum, groups, threads, reactions, DMs, follows etc. on day one will be a graveyard.
- Heavy social UI invites spam, scams, and off-platform leakage (a real risk in rentals).
- Moderation cost grows non-linearly; a 2-3 person team cannot moderate a Reddit clone.
- Scope creep pulls focus from the core funnel: list -> match -> book.

**What a launch-safe lightweight community layer looks like**
- One inbox-style feed, not many.
- A small fixed set of categories (e.g. "Suburb advice", "Visa & arrival", "Scam alerts", "Roommate tips", "Owner tips").
- Founder/admin announcements pinned at the top so the tab is never empty.
- Q&A first; freeform posting second.
- Curated resources (guides, calculators, suburbs) embedded as cards so the tab is useful even if discussion is quiet.
- Hard caps: no DMs from community (use Messages), no follows, no reactions beyond a single helpful upvote, no public friend graph.

---

## SECTION 2 - COMMUNITY TAB V1 MODEL

The most practical V1 mix is a **"Helpful Feed + Ask the Community + Curated Resources"** model. Three lanes, one page.

1. **Announcements & guides (curated)** - admin-pinned posts, MigRent guides, suburb spotlights, scam alerts. Always populated, even week one.
2. **Ask the Community (Q&A)** - the active layer. Seekers and owners post short questions tagged by category and (optionally) suburb. Answers are threaded one level deep. One "Helpful" upvote per answer.
3. **Tips feed** - short tip-style posts from verified members ("Got my TFN in 3 days, here is how"). Posting is gated behind profile verification + a 24h cool-down between tips to keep noise low.

Deferred to V2: city/suburb groups (we tag instead), events/webinars, long-form articles, a separate roommate board.

---

## SECTION 3 - PROFILE / COMMUNITY FEATURES

Useful for V1:
- Display name + avatar (already exists)
- Short bio / intro (1-2 lines, 240 char cap)
- Role badge (Seeker / Owner / Mentor / Admin)
- City + suburb (optional, defaults to "Australia")
- Languages spoken (multi-select, max 5)
- Move-in timeline (Seeker only): "Looking now / 1-3 months / Just exploring"
- Verification indicators: ID-verified, email-verified, phone-verified, payment-verified
- Community badges (auto-awarded, not vanity): "Helpful" (3+ answers marked helpful), "Newcomer", "Mentor", "Verified owner"
- Privacy controls: show/hide suburb, show/hide languages, allow/deny appearing in community profile preview

Wait for V2:
- Interests, hobbies, lifestyle tags - these drift into dating-app territory and add moderation load.
- Public follower/following lists.
- Long-form "about me" pages.
- Reviews on profiles outside of bookings (we already have booking reviews).

---

## SECTION 4 - DASHBOARD IA / UX

**Where it lives**
- New top-level item in the dashboard sidebar named **Community**, placed between **Mentors** and **Suburbs** for both seekers and owners.
- Mobile bottom nav stays 5 items; Community is reachable via the dashboard home and the more menu, not the bottom bar.

**Page route**
- `/community` (canonical)
- `/community/ask` (compose Q&A)
- `/community/post/[id]` (single thread)
- `/community/guidelines` (rules)

**Page layout (top to bottom)**
1. Header: title + 1-line value prop ("Real advice from people who moved here too.") + primary CTA "Ask the community".
2. AnnouncementBanner (admin-controlled, dismissible per user).
3. ResourceShortcutGrid (3-4 cards: "Bond calculator", "Suburb guides", "Visa basics", "Scam alerts").
4. CommunityFeed - tabs: All / Questions / Tips / Announcements; filter chips for category and suburb.
5. Right rail (desktop only): "Community guidelines" card, "Top helpful members this month" (top 5, anonymisable), "Report a problem" link.

**Seeker vs Owner**
- Same page; tags differ. Owners see an extra filter chip "For owners" surfacing tenant-screening, listing, and tax-style tips. Compose dialog defaults the category based on role.

**Anti-clutter rules**
- Max 3 visual hierarchies on screen at once.
- No reaction emojis, no GIFs, no embedded media beyond a single image per post.
- Cards have generous whitespace; no badge soup on author rows.

---

## SECTION 5 - FEATURE SET

| Feature | V1 status | Notes |
|---|---|---|
| Admin announcements (pinned) | must-have V1 | Keeps tab non-empty |
| Curated resource shortcuts | must-have V1 | Useful even if quiet |
| Ask the Community (Q&A) | must-have V1 | Core engagement loop |
| Threaded replies (1 level deep) | must-have V1 | Avoid full nesting |
| Single "Helpful" upvote | must-have V1 | No like/love/laugh stack |
| Category tags (fixed list) | must-have V1 | Not user-created |
| Suburb tag (optional) | must-have V1 | Reuses suburb data |
| Reporting + moderation queue | must-have V1 | Trust is core |
| Saved posts | better V1 | Reuse wishlist pattern |
| Community guidelines page | must-have V1 | Linked everywhere |
| Tips feed (gated posting) | better V1 | Ship if mod capacity allows |
| Author profile preview popover | better V1 | Trust signal |
| Featured community spotlight (weekly) | better V1 | Founder-curated |
| Search within community | better V1 | Postgres FTS, not Algolia |
| Suburb / city groups (separate spaces) | V2 later | Premature; tag first |
| Events / webinars module | V2 later | Needs partnerships |
| Long-form articles / authoring tools | V2 later | Use Notion-backed guides for now |
| Reactions beyond Helpful | V2 later | Adds noise |
| DMs from community | V2 later (likely never) | Force into Messages with consent |
| Follows / followers | V2 later (likely never) | Off-strategy |
| Polls | V2 later | Not needed |
| Bounties / paid Q&A | V2 later | Out of scope |

---

## SECTION 6 - TRUST / MODERATION

This is the make-or-break layer. Rules:

- **Posting eligibility**: must have a verified email + completed profile (name, role, suburb-or-"Australia") to post. Reading is open to all signed-in users. Anonymous-to-public profiles can still post but show as "Verified migrant" without name.
- **Pre-publish checks**: server-side regex + keyword filter for phone numbers, WhatsApp / Telegram handles, off-platform payment terms ("Western Union", "wire", "bond cash"), URLs to non-allow-listed domains. Hits are held for review, not auto-rejected.
- **Rate limits**: max 3 posts/day, max 10 replies/day, max 1 tip/24h per user.
- **One-tap report**: ReportContentDialog with fixed reasons (Spam, Scam, Off-platform, Harassment, Misinformation, Other). Three reports auto-hide pending review.
- **Moderation queue**: an admin route `/admin/community` listing pending posts, reports, and rate-limit hits. Actions: approve, hide, warn, ban-from-community, escalate to account-level ban.
- **Founder/admin control**: ability to pin, unpin, lock comments, mark "Verified by MigRent", and feature a post in the spotlight slot.
- **Community guidelines**: a single short page (`/community/guidelines`) - "be kind, no scams, no off-platform deals, no agent ads, no discrimination". Linked from compose dialog and report dialog.
- **Anti-toxicity**: no public downvotes, no public report counts, no leaderboard of who is "winning" arguments. Visible counts are limited to "Helpful" upvotes and reply counts.
- **Anti-noise**: no notifications for community activity unless someone replies to your own post or marks your reply Helpful. No email digests in V1.
- **Audit trail**: every mod action logged in `community_moderation_log` with actor, target, reason, timestamp.

---

## SECTION 7 - FRONTEND IMPLEMENTATION (Next.js + Tailwind + shadcn)

**Routes**
```
frontend/pages/community/index.tsx           # Feed
frontend/pages/community/ask.tsx              # Compose
frontend/pages/community/post/[id].tsx        # Thread
frontend/pages/community/guidelines.tsx       # Rules
frontend/pages/admin/community.tsx            # Mod queue (admin-gated)
```

**Reusable components** (under `frontend/components/community/`)
- `CommunityFeed.tsx` - list + tab + filter state container.
- `CommunityCard.tsx` - one post in the feed (question / tip / announcement variants via prop).
- `AskCommunityCard.tsx` - inline composer card on the feed; opens a dialog on mobile.
- `CityGroupCard.tsx` - shipped as a "filter chip card" in V1 (suburb chips), kept as a component name for V2 group pages.
- `AnnouncementBanner.tsx` - dismissible, persisted per-user in localStorage + server flag.
- `CommunityProfilePreview.tsx` - hover/tap popover with avatar, role, languages, badges, "View profile" link.
- `ResourceShortcutGrid.tsx` - grid of 3-4 resource cards.
- `ReportContentDialog.tsx` - shadcn `Dialog` with `RadioGroup` for reasons + optional note.
- `HelpfulButton.tsx` - one-tap toggle, optimistic update.
- `PostComposer.tsx` - shared by `/community/ask` and the inline composer.
- `ReplyThread.tsx` - one level of replies with author preview.

**State / data layer**
- `frontend/hooks/useCommunity.ts` - thin wrapper over `fetch` to FastAPI endpoints. Mirrors the pattern in `useDashboard` / `useSeekerData`.
- All write actions go through FastAPI, never direct Supabase from the client, to keep RLS + moderation rules server-side.

**Dashboard nav wiring**
- Add a single entry in `DashboardLayout.tsx` for both roles:
  ```ts
  { href: "/community", label: "Community", icon: <Users className="w-5 h-5" /> }
  ```
  Place between Mentors and Suburbs.
- `CommunityHighlights.tsx` already exists in `frontend/components/dashboard/` - rewire it to pull the latest 3 admin-pinned posts via `useCommunity` and link to `/community`.

**Cleanest dashboard UI structure**
- Page is two columns on desktop (`lg:grid-cols-[1fr_320px]`), single column below `lg`.
- Feed cards use the same `rounded-2xl`, `border-slate-200/70`, `bg-white` pattern already used by the dashboard so it does not feel like a separate app.

---

## SECTION 8 - DATA MODEL (Supabase, V1)

Lightweight schema. Single posts table with a type discriminator beats four tables.

```sql
-- Categories are a fixed enum, not a table.
create type community_post_type as enum ('question', 'tip', 'announcement');
create type community_category as enum (
  'suburb_advice', 'visa_arrival', 'scams', 'roommate', 'owner_tips', 'general'
);
create type community_mod_status as enum ('published', 'pending', 'hidden', 'removed');

create table community_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id) on delete cascade,
  type community_post_type not null,
  category community_category not null default 'general',
  suburb_slug text,                         -- nullable, references existing suburbs
  title text,                               -- required for question/announcement, null for tip
  body text not null,
  is_pinned boolean not null default false,
  is_locked boolean not null default false,
  helpful_count integer not null default 0,
  reply_count integer not null default 0,
  status community_mod_status not null default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table community_replies (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references community_posts(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  helpful_count integer not null default 0,
  is_marked_helpful boolean not null default false, -- author-of-post can mark one as the answer
  status community_mod_status not null default 'published',
  created_at timestamptz not null default now()
);

create table community_helpful (
  user_id uuid not null references auth.users(id) on delete cascade,
  target_type text not null check (target_type in ('post', 'reply')),
  target_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (user_id, target_type, target_id)
);

create table community_saved (
  user_id uuid not null references auth.users(id) on delete cascade,
  post_id uuid not null references community_posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, post_id)
);

create table community_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users(id) on delete cascade,
  target_type text not null check (target_type in ('post', 'reply')),
  target_id uuid not null,
  reason text not null,
  note text,
  status text not null default 'open' check (status in ('open', 'resolved', 'dismissed')),
  created_at timestamptz not null default now()
);

create table community_moderation_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references auth.users(id),
  action text not null,                     -- 'hide', 'remove', 'pin', 'lock', 'warn', 'ban'
  target_type text not null,
  target_id uuid not null,
  reason text,
  created_at timestamptz not null default now()
);

create table community_resources (         -- featured resource shortcuts
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  href text not null,
  icon text,
  position integer not null default 0,
  is_active boolean not null default true
);

-- Profile additions (extend the existing profiles table)
alter table profiles add column if not exists languages text[] default '{}';
alter table profiles add column if not exists move_in_timeline text;       -- 'now' | '1_3m' | 'exploring'
alter table profiles add column if not exists community_visible boolean default true;
alter table profiles add column if not exists badges text[] default '{}';  -- denormalised cache
```

RLS notes:
- Read on `community_posts` / `community_replies`: any authenticated user, where `status = 'published'`.
- Insert: authenticated users with `email_verified = true` and no active community ban.
- Update / delete: author within 30 minutes, or admin role.
- All mutations should ideally route through FastAPI so server-side rate limits and content filters run before the insert.

---

## SECTION 9 - UX COPY / TONE

Tone principles: warm, plainspoken, respectful of the reader's intelligence, never childish, never corporate, never ironic about migration. Australian English. Avoid emoji in product surfaces; reserve a single hand-wave for the welcome screen if at all.

Sample microcopy:

- **Empty state (feed)**
  > "Nothing here yet. Be the first to ask a question - someone who has just moved here will probably know."

- **Welcome message (first visit)**
  > "Welcome to the MigRent Community. This is a quiet, moderated space to ask real questions about renting, suburbs, visas, and settling in. Read the [community guidelines](/community/guidelines) before you post."

- **Ask a question prompt (composer placeholder)**
  > "What is your question? Keep it specific - 'Is Kellyville safe to walk at night?' works better than 'Tell me about Sydney'."

- **Moderation notice (held post)**
  > "Thanks for posting. We are doing a quick check - your post will appear shortly. We do this to keep scams and spam out."

- **Report action confirmation**
  > "Thanks for flagging this. We have sent it to the MigRent team. You will not see this post in your feed for now."

- **Community guidelines reminder (above composer)**
  > "Be kind. No scams, no off-platform payments, no agent ads. Real questions and real answers only."

- **After Helpful tap**
  > "Marked helpful - the author will see this."

- **Posting blocked (rate limit)**
  > "You have hit today's posting limit. This keeps the feed useful. Try again tomorrow."

- **Posting blocked (incomplete profile)**
  > "Add a name and verify your email before posting. It takes about a minute."

---

## SECTION 10 - QA CHECKLIST

- [ ] Community appears in dashboard sidebar for both seeker and owner roles, between Mentors and Suburbs.
- [ ] `/community` loads in under 1.5s on a cold session and renders the announcement, resources, and feed without layout shift.
- [ ] Empty feed shows the supportive empty state, not a blank box.
- [ ] At least 3 admin-pinned posts and 4 resource cards exist on launch day.
- [ ] Compose dialog enforces character limits, requires category selection, and blocks submission for unverified emails.
- [ ] Server-side filter holds posts containing phone numbers, WhatsApp/Telegram handles, or non-allow-listed URLs.
- [ ] Rate limits: 3 posts/day, 10 replies/day, 1 tip/24h enforced and tested with seeded data.
- [ ] Reporting flow: 3 reports on a single post auto-hides it; admin can restore.
- [ ] Moderation queue shows pending, reported, and rate-limited items with audit log entries.
- [ ] Helpful upvote is idempotent (one per user per target) and updates optimistically.
- [ ] Saved posts appear in a "Saved" filter and survive sign-out/in.
- [ ] Profile preview popover shows only fields the user has not hidden via privacy controls.
- [ ] Community feed filter by suburb returns correct results and degrades gracefully when no posts exist.
- [ ] Mobile layout: feed is single column, composer opens as a full-screen dialog, no horizontal scroll.
- [ ] Dark mode parity with the rest of the dashboard.
- [ ] No fake counters anywhere ("1.2k members" etc.). All numbers reflect real data.
- [ ] No notifications fire on community activity unless someone replied to the user or marked their reply helpful.
- [ ] `community_moderation_log` writes on every admin action.
- [ ] RLS verified: an unauthenticated user cannot read or write; a banned user cannot post but can still read.
- [ ] Accessibility: composer + report dialog keyboard-navigable, focus-trapped, labels read by VoiceOver.

---

## SECTION 11 - V1 / V2 SPLIT

**Must-have V1**
- Community tab in dashboard nav (`/community`)
- AnnouncementBanner + admin-pinned posts
- ResourceShortcutGrid (3-4 curated cards)
- CommunityFeed with tabs: All / Questions / Announcements
- Ask the Community (PostComposer + ReplyThread, 1-level deep)
- Single Helpful upvote
- Fixed categories + optional suburb tag
- Reporting + moderation queue + audit log
- Community guidelines page
- Profile additions: languages, move_in_timeline, community_visible toggle, verification badges
- Posting eligibility (verified email + complete profile) + rate limits + content filter

**Better V1 (ship if mod capacity and time allow)**
- Tips feed with gated posting
- Saved posts
- Author profile preview popover
- Founder-curated weekly community spotlight
- Postgres full-text search inside community
- Owner-specific filter chip and category routing

**V2 later**
- Suburb / city groups as their own spaces
- Events and webinars module
- Long-form articles / authoring tools
- Reactions beyond Helpful, polls
- Notification digests / email summaries
- Mentor Q&A office hours

**Likely never (off-strategy)**
- DMs from community surfaces (route to Messages with consent)
- Public follower/following graph
- Public downvotes or report counts
- Leaderboards of "top posters"

---

## APPENDIX A - V1 WIREFRAME (TEXT)

```
+--------------------------------------------------------------------------+
| Sidebar (desktop)              |  Community                              |
|  Dashboard                     |  Real advice from people who moved here.|
|  Search                        |  [ Ask the community ]                  |
|  Saved                         |                                         |
|  Mentors                       |  +-----------------------------------+  |
|  > Community                   |  | Pinned: Welcome to MigRent (...)  |  |
|  Suburbs                       |  +-----------------------------------+  |
|  Profile                       |                                         |
|  Messages                      |  Resources                              |
|  Help Centre                   |  [Bond calc] [Suburbs] [Visa] [Scams]   |
|  Settings                      |                                         |
|                                |  [ All ] [ Questions ] [ Tips ] [ News ]|
|                                |  Filters: Category v   Suburb v         |
|                                |                                         |
|                                |  +---------------------------------+    |
|                                |  | Q  Is Kellyville safe at night? |    |
|                                |  |    Asked by Priya - Seeker      |    |
|                                |  |    Suburb: Kellyville - 3 replies|   |
|                                |  |    [Helpful 4]      [Save] [...]|    |
|                                |  +---------------------------------+    |
|                                |  +---------------------------------+    |
|                                |  | Tip How I got my TFN in 3 days  |    |
|                                |  |     by Min - Verified migrant   |    |
|                                |  |     [Helpful 12]    [Save] [...]|    |
|                                |  +---------------------------------+    |
|                                |  ...                                     |
|                                |                                         |
|                                |   Right rail (desktop):                  |
|                                |   - Community guidelines                 |
|                                |   - Top helpful members this month       |
|                                |   - Report a problem                     |
+--------------------------------------------------------------------------+
```

Mobile: stack everything vertically. Composer is a sticky "Ask" button at bottom-right of the feed area, opening a full-screen dialog. Right rail collapses into a single "About this community" card at the bottom.

---

## APPENDIX B - MOST USEFUL FIRST COMMUNITY MODULES

In order of value-per-week-of-build:

1. **Admin announcements + curated resource shortcuts** - cheap, makes the page never feel empty.
2. **Ask the Community Q&A with single-level replies** - the engagement loop.
3. **Reporting + moderation queue + content filter** - non-negotiable trust layer.
4. **Profile expansion (languages, move-in timeline, badges, visibility toggle)** - powers the profile preview and trust signals.
5. **Helpful upvote + Saved posts** - low-cost retention hooks.
6. **Tips feed (gated)** - ship when mod capacity is proven.

---

## APPENDIX C - SAFE ROLLOUT ORDER

1. **Week 0 - Schema + admin tools.** Ship migrations for `community_*` tables and profile columns. Build `/admin/community` first so moderators can post and pin before any user sees the tab.
2. **Week 0-1 - Read-only launch (internal).** Tab visible to staff only via a feature flag. Seed 3 announcements and 4 resources.
3. **Week 1 - Closed beta.** Tab visible to a small allow-list of verified seekers and owners. Posting allowed. Mod queue staffed daily.
4. **Week 2 - Public V1.** Flag flipped for all signed-in users. Banner explaining what the space is. Posting requires verified email + complete profile.
5. **Week 3 - Add Saved + profile preview popover.**
6. **Week 4 - Add Tips feed if mod load is sustainable.**
7. **Week 6+ - Evaluate suburb groups, search, spotlight cadence based on real metrics: weekly active posters, helpful-rate per post, time-to-first-answer, report-rate.**

Kill switch: a single env flag `COMMUNITY_ENABLED` on the FastAPI side and a corresponding flag on the Next.js nav so the tab can be hidden in under a minute if abuse spikes.

---

## APPENDIX D - BIGGEST MISTAKES TO AVOID

1. **Launching with an empty feed.** Always seed announcements and resources before flipping the flag.
2. **Treating it like a forum.** Threads of threads, follows, reactions, DMs - all of these have failed for marketplaces and they will fail here.
3. **Allowing free-form categories.** Lock the taxonomy. User-created tags become a mess in two weeks.
4. **Skipping the content filter.** Phone numbers and WhatsApp handles are how off-platform scams start in rentals. This is the single most important guard.
5. **Public counts of negative actions.** Report counts, downvotes, and ban lists destroy tone fast.
6. **Driving notifications too hard.** A noisy community tab will tank dashboard NPS. Default to quiet.
7. **Making moderation a side job.** Assign one named owner per day to clear the queue, even if it is the founder for now.
8. **Showing fake activity.** No "1.2k members" placeholders, no fake avatars, no seeded "Anna - 2 hours ago" posts.
9. **Coupling Community to Messages.** Community is public + moderated; Messages is private. Do not let users DM from a post - link to "Request to book" or the listing instead, where consent and the booking flow apply.
10. **Building V2 features in V1.** Groups, events, long-form, polls. Resist. Ship the small thing, watch the data, then earn the right to expand.
