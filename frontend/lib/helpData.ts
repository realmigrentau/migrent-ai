/**
 * The Help centre's content: topics, articles and the common questions.
 *
 * Rewritten on 2026-09-29 to describe Migrent as it works today, with
 * Migrent Hub. The earlier text described a dashboard that no longer
 * exists and several things that never did (AI match scores, a Superhost
 * programme, visa checks through VEVO, refund percentages, owners paid
 * through Stripe). Rules for money and fees come from lib/siteIdentity.ts.
 *
 * Every article keeps its original address (/help/<slug>) and topic
 * address (/help/category/<slug>), so links that were shared still work.
 * General information about the law is written conservatively and points
 * to the government authority that decides; it is not legal advice.
 */

import { siteIdentity } from "./siteIdentity";

export interface StaticHelpCategory {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  articleCount: number;
}

export interface StaticHelpArticle {
  id: string;
  slug: string;
  title: string;
  category: string;
  categoryName: string;
  audience: "seeker" | "owner" | "both";
  tags: string[];
  readingTime: number;
  featured: boolean;
  type: "faq" | "guide" | "troubleshoot" | "policy" | "safety";
  summary: string;
  body: string;
  updatedAt: string;
}

const UPDATED = "2026-09-29";
const FEE = siteIdentity.fees.host.listingFee;
const SUPPORT = siteIdentity.emails.support;

const CATEGORY_DEFS: Omit<StaticHelpCategory, "articleCount">[] = [
  { id: "cat-1", slug: "getting-started", name: "Getting started", description: "What Migrent is, creating an account, and renting and hosting with one account.", icon: "Rocket" },
  { id: "cat-2", slug: "account-verification", name: "Your account and checks", description: "Your Rental Profile, ID checks, and keeping your sign-in secure.", icon: "ShieldCheck" },
  { id: "cat-3", slug: "search-matching", name: "Searching and applying", description: "Finding rooms, saving them, inspections and applications.", icon: "Search" },
  { id: "cat-4", slug: "listings-hosting", name: "Listing and hosting", description: "Creating a listing, photos, house rules, rent records and repairs.", icon: "Home" },
  { id: "cat-5", slug: "bookings-payments", name: "Stays and fees", description: "Stay bookings, instant book, cancelling, and what Migrent charges.", icon: "CreditCard" },
  { id: "cat-6", slug: "safety-reporting", name: "Safety and reporting", description: "Reporting a person or listing, and what to do if you feel unsafe.", icon: "AlertTriangle" },
  { id: "cat-7", slug: "legal-policies", name: "Your rights", description: "Bonds and renting rights in Australia, in plain words.", icon: "FileText" },
  { id: "cat-8", slug: "technical-issues", name: "Signing in", description: "Getting back into your account.", icon: "Wrench" },
];

type ArticleInput = Omit<StaticHelpArticle, "categoryName" | "updatedAt">;

const ARTICLES: ArticleInput[] = [
  // ── Getting started ───────────────────────────────────────────────
  {
    id: "art-1",
    slug: "how-migrent-works",
    title: "How Migrent works",
    category: "getting-started",
    audience: "both",
    tags: ["overview", "platform", "how it works", "hub"],
    readingTime: 3,
    featured: true,
    type: "guide",
    summary: "Where you search, where you apply and host, and what Migrent does and does not do.",
    body: `## Two places, one account

**This website** is where you look: search rooms, read suburb guides and learn how renting works. You do not need an account to search.

**Migrent Hub** is where you act, once you sign in. Renters save homes, build a Rental Profile, book inspections, apply and message hosts. Hosts list properties, publish inspection times, review applicants and keep a record of rent and repairs.

## If you are renting

1. Search by suburb, budget and move-in date, then by what matters to you.
2. Build one Rental Profile in Migrent Hub instead of filling in a new form for every room.
3. Book an inspection time the host has published, and message them with questions.
4. Apply. The host reviews your application, and if they approve it, Migrent does a final review before the tenancy is set up.

## If you are hosting

1. List a room or a whole home with the listing wizard. It saves as you go.
2. A person at Migrent reviews your government ID once. Each listing is read before it is published.
3. Publish inspection times, answer messages and review applications.
4. After move-in, record rent as it is paid and handle repair requests.

## What Migrent does not do

Migrent is not a real estate agent. It does not collect rent, hold bonds, inspect properties or write tenancy agreements. You agree terms directly with each other. Read more in [How renting works](/how-renting-works).`,
  },
  {
    id: "art-2",
    slug: "create-your-account",
    title: "How to create your account",
    category: "getting-started",
    audience: "both",
    tags: ["sign up", "register", "account", "google"],
    readingTime: 2,
    featured: false,
    type: "guide",
    summary: "Sign up with your email or Google, and tell us whether you are renting, hosting or both.",
    body: `## Create your account

1. Choose **Sign in** in the menu, then **Create an account**.
2. Sign up with your email address and a password, or with Google.
3. Confirm your email address from the message we send you.

## Tell us what you are here for

When you first open Migrent Hub, choose whether you are renting, hosting, or managing properties for someone else. This decides what you see first. You can change it later in **Settings**.

## What to do next

- **Renting:** start your Rental Profile, then save homes and book inspections.
- **Hosting:** choose **List a property** and follow the listing wizard. You can save and finish later.`,
  },
  {
    id: "art-3",
    slug: "seeker-vs-owner",
    title: "Renting and hosting with one account",
    category: "getting-started",
    audience: "both",
    tags: ["renter", "owner", "host", "role", "switch", "property manager"],
    readingTime: 2,
    featured: false,
    type: "faq",
    summary: "How to switch between renting and hosting, and when you cannot.",
    body: `## One account, your choice

Your account is set up for renting, for hosting as an owner, or for hosting as a property manager. You chose this when you first opened Migrent Hub, and you can change it in **Settings**.

## When you cannot switch away from hosting

To make sure nothing is left stranded, you cannot switch from hosting to renting while:

- one of your listings is live or waiting for review, or
- one of your tenancies is active.

Pause or archive the listing, or end the tenancy, first.

## Property managers

If you list homes for someone else, choose property manager. When you add a property, you tell us your relationship to it.`,
  },

  // ── Your account and checks ─────────────────────────────────────────
  {
    id: "art-4",
    slug: "complete-your-profile",
    title: "Your Rental Profile",
    category: "account-verification",
    audience: "seeker",
    tags: ["rental profile", "application", "references", "documents", "income"],
    readingTime: 3,
    featured: true,
    type: "guide",
    summary: "One profile that goes with every application, and exactly what a host can see.",
    body: `## What it is

Your Rental Profile is one place in Migrent Hub for what hosts usually ask for: your work or study, your household, pets, your rental history if you have one, and your references. You fill it in once and use it for every application.

You do not need an Australian rental history. If you are renting here for the first time, say so, and let your work, study and references tell your story.

## What a host sees

When you apply, the host sees a **snapshot** of your profile taken at that moment, not your live profile. If you update your profile later, it does not change applications you have already sent.

- Your income is only included if you tick **share my income** on that application.
- Documents are shared per application, and the links to them expire.

## Keeping it up to date

Open **Profile** in Migrent Hub. The progress bar shows what is still missing.`,
  },
  {
    id: "art-5",
    slug: "verify-your-identity",
    title: "How ID checks work",
    category: "account-verification",
    audience: "both",
    tags: ["verify", "identity", "id", "badge", "host"],
    readingTime: 2,
    featured: false,
    type: "guide",
    summary: "What hosts are checked for, what the badge means, and what it does not mean.",
    body: `## Hosts

Before any of a host's rooms can be published, a person at Migrent reviews the host's government ID: a passport, driver's licence, visa or national ID. The host also confirms their email address. You can start a listing before the check is done; it waits as a draft until it is.

Hosts upload their ID in Migrent Hub under **Settings**.

## What the badge means

"ID-checked host" means Migrent has seen and approved that person's identity document.

## What it does not mean

Migrent has not inspected the property and does not certify that a room is safe, legal or as described. Always inspect before you pay anything.

## Renters

There is no paid ID check for renters at the moment. Your Rental Profile and references are what hosts look at.`,
  },
  {
    id: "art-6",
    slug: "change-email-or-password",
    title: "Change your email, password or two-step sign-in",
    category: "account-verification",
    audience: "both",
    tags: ["email", "password", "security", "two-step", "mfa", "authenticator"],
    readingTime: 2,
    featured: false,
    type: "guide",
    summary: "Where to change your sign-in details in Migrent Hub.",
    body: `## Your email address

In Migrent Hub, open **Settings** and choose **Change email**. We send a confirmation to the new address; the change applies once you confirm it.

## Your password

In **Settings**, under security, choose **Change password**.

## Two-step sign-in

Also under security, you can turn on two-step sign-in with an authenticator app. After that, signing in asks for a six-digit code as well as your password.

## Forgotten your password?

On the sign-in page, choose **Forgot password** and follow the link we email you.`,
  },

  // ── Searching and applying ─────────────────────────────────────────
  {
    id: "art-7",
    slug: "how-to-search-rooms",
    title: "How to search for rooms",
    category: "search-matching",
    audience: "seeker",
    tags: ["search", "filters", "suburb", "budget", "map"],
    readingTime: 2,
    featured: true,
    type: "guide",
    summary: "Search by place, budget and dates, then narrow it down by what matters to you.",
    body: `## Start with the basics

Choose **Search rooms**. Enter a suburb, city or postcode, your weekly budget, and when you want to move in. You do not need an account to search.

## Narrow it down

Open **More filters** for the things that decide whether a place works for you:

- whole place or a room, and how many bedrooms
- private bathroom, laundry at home, internet included
- no security cameras, a bedroom door that locks
- furnished, bills included, parking, air-con, pets allowed
- near a station

Every filter you set is shown above the results, and you can remove any of them with one tap.

## Try the house on the homepage

The house on the homepage is another way in: switch rooms and features on or off and choose **Show matching rooms**. It opens this search with those filters already set.

## Map and list

On a larger screen, results appear on a map beside the list. Addresses are shown as a suburb until you book an inspection.`,
  },
  {
    id: "art-8",
    slug: "save-and-compare-listings",
    title: "Save homes and searches",
    category: "search-matching",
    audience: "seeker",
    tags: ["save", "saved", "heart", "alerts", "saved search"],
    readingTime: 2,
    featured: false,
    type: "guide",
    summary: "Keep homes you like, and hear about new ones that match a search.",
    body: `## Saving a home

Tap the heart on any listing. You need to be signed in; saved homes are kept in Migrent Hub under **Saved**, on every device you use.

If you saved homes before signing in, they are added to your account when you sign in on the same device.

## Saving a search

In Migrent Hub, open **Discover**, search for a suburb and a budget, and choose **Save search**. Under **Saved**, you can choose how often to hear about new rooms that match it, or turn the alerts off.`,
  },
  {
    id: "art-9",
    slug: "how-matching-works",
    title: "How \"Best match\" ordering works",
    category: "search-matching",
    audience: "seeker",
    tags: ["best match", "ranking", "order", "matching"],
    readingTime: 2,
    featured: false,
    type: "faq",
    summary: "A plain set of rules that puts the rooms closest to what you asked for first.",
    body: `## What it is

When you are signed in, you can sort search results by **Best match**. It orders rooms by how closely they fit what you have told us: mainly location and budget, then move-in date, furnishing, bills, and a few other preferences.

## What it is not

It is not AI and it does not guess. It is a fixed set of rules applied to the information in your profile and in the listing. If a listing is missing information, it simply scores lower on that point.

## Why a room is shown

Where there is a clear reason a room fits, such as being in a suburb you chose or under your budget, the result says so.`,
  },
  {
    id: "art-21",
    slug: "apply-for-a-home",
    title: "Applying for a home",
    category: "search-matching",
    audience: "seeker",
    tags: ["apply", "application", "status", "approved", "final review"],
    readingTime: 3,
    featured: true,
    type: "guide",
    summary: "How to apply, what each status means, and what happens after a host says yes.",
    body: `## Sending an application

Open the room and choose **Apply**. Check your Rental Profile, add a note to the host if you like, choose which documents to share, and send it. Applying is free.

## What the statuses mean

- **Submitted:** the host has it.
- **Under review:** the host has opened it.
- **Shortlisted:** you are on the host's shortlist.
- **Changes requested:** the host or Migrent has asked you to add or fix something.
- **Approved by the host:** Migrent now does a final review.
- **Finalised:** the tenancy has been set up in Migrent Hub.
- **Declined** or **not proceeding:** it did not go ahead this time.

You can withdraw an application at any time before it is finalised.

## After it is finalised

You agree the tenancy terms directly with the host and lodge your bond with the bond authority in your state or territory. Your rent record and any repair requests then live in Migrent Hub.`,
  },
  {
    id: "art-22",
    slug: "book-an-inspection",
    title: "Booking an inspection",
    category: "search-matching",
    audience: "both",
    tags: ["inspection", "viewing", "open home", "calendar"],
    readingTime: 2,
    featured: false,
    type: "guide",
    summary: "Pick a time the host has published, and when you get the address.",
    body: `## For renters

On a listing, choose **Book an inspection** and pick one of the times the host has published. Times are shown in the property's own time zone.

Once you have booked, you can see the street address and add the inspection to your calendar. You can change or cancel your booking in Migrent Hub under **Inspections**.

## For hosts

In Migrent Hub, open the listing and add inspection times, with how many people can come to each. If you need to move a time, everyone booked on it is told. After the inspection you can mark who came.`,
  },

  // ── Listing and hosting ───────────────────────────────────────────
  {
    id: "art-10",
    slug: "create-your-first-listing",
    title: "How to create your first listing",
    category: "listings-hosting",
    audience: "owner",
    tags: ["listing", "create", "wizard", "publish", "review"],
    readingTime: 3,
    featured: true,
    type: "guide",
    summary: "The six steps of the listing wizard, and what happens before a listing goes live.",
    body: `## The listing wizard

Choose **List a property**. The wizard has six steps, and it saves as you go, so you can stop and come back:

1. **The property:** address, type and size.
2. **The space:** the whole place, a private room or a shared room, bedrooms and bathrooms.
3. **Details:** title, description, features, house rules and safety disclosures.
4. **Photos:** at least one; the first is the cover.
5. **Rent and dates:** weekly rent, bond, and when it is available.
6. **Review:** everything that is still missing is listed here, with a link to fix it.

If you started from the house on the homepage, the wizard is already filled in with what you chose. Check each step: your home may differ from the model.

## Before it goes live

Your government ID is reviewed once, and each listing is read by Migrent before it is published. Until then it waits safely as a draft or in review.

## More than one room

List each room on its own, or the whole home as one listing. Rooms in the same property are grouped together, and you can copy a listing when you have another room just like it.`,
  },
  {
    id: "art-11",
    slug: "add-photos-to-listing",
    title: "Photos that help renters decide",
    category: "listings-hosting",
    audience: "owner",
    tags: ["photos", "images", "upload", "cover"],
    readingTime: 2,
    featured: false,
    type: "guide",
    summary: "What to photograph, and how to order your photos.",
    body: `## What to show

- The room itself, in daylight, from the doorway and from the far corner.
- The bathroom the renter will use.
- The kitchen and living areas they will share.
- Anything the listing promises: a desk, a wardrobe, parking, outdoor space.

## Good habits

- Tidy up, open the blinds and turn the lights on.
- Take photos in landscape, holding the phone level.
- Show the home as it is. Photos that do not match what renters see at the inspection waste everyone's time.

## Ordering

The first photo is the cover shown in search. Drag photos in the wizard's **Photos** step to change the order. You can add up to twenty.`,
  },
  {
    id: "art-12",
    slug: "set-your-room-rules",
    title: "House rules and safety disclosures",
    category: "listings-hosting",
    audience: "owner",
    tags: ["rules", "house rules", "cameras", "safety", "disclosure", "lock"],
    readingTime: 2,
    featured: false,
    type: "guide",
    summary: "What to tell renters up front, including the questions every listing must answer.",
    body: `## House rules

In the **Details** step you can set smoking, quiet hours and who the home suits. Clear rules up front save awkward conversations later.

## Safety disclosures

Every listing answers these, and renters see the answers before they apply:

- **Security cameras:** whether there are any, and where. Cameras must never cover bedrooms or bathrooms.
- **Bedroom doors:** whether each rented bedroom has a lock the renter controls.
- **Firearms or weapons** on the property, with an explanation if there are.

Renters can search for homes with no cameras and with lockable doors, so accurate answers bring you the right people.`,
  },
  {
    id: "art-23",
    slug: "rent-record-and-repairs",
    title: "Rent records and repairs",
    category: "listings-hosting",
    audience: "both",
    tags: ["rent", "tenancy", "repairs", "maintenance", "emergency"],
    readingTime: 3,
    featured: false,
    type: "guide",
    summary: "Keeping track of rent, and handling repairs, including emergencies.",
    body: `## A record, not a payment

Migrent does not collect rent. The host sets up the rent dates from the lease in Migrent Hub and records each payment as it arrives. The renter sees the same record, so there is one shared view of what was due and what was paid.

## Asking for a repair

Renters choose **Request a repair** under **My home**, say what is wrong and how urgent it is, and can add photos.

- **Emergency** repairs (for example a burst pipe, a gas leak, no power or a serious security problem) show safety advice first, including when to call 000, and the contact for your state tenancy authority.
- The host moves the request from reported to scheduled to fixed, and both of you can add updates.

## For hosts

Emergencies are listed first. You can add private notes to a request that the renter never sees.`,
  },

  // ── Stays and fees ────────────────────────────────────────────────
  {
    id: "art-13",
    slug: "request-to-book",
    title: "Requesting a stay",
    category: "bookings-payments",
    audience: "seeker",
    tags: ["booking", "stay", "request", "dates", "short stay"],
    readingTime: 2,
    featured: false,
    type: "guide",
    summary: "How stay bookings work for listings that offer them.",
    body: `## Stays and tenancies

Some listings are offered for **stays** of a set number of weeks. For those, you can request dates instead of applying.

## Requesting dates

Choose your check-in and check-out dates and the number of guests. The listing's minimum and maximum stay, and how many guests it allows, are shown before you send the request.

## What happens next

The host accepts or declines your request, and you can follow it in Migrent Hub. Once the host has accepted and confirmed it, the booking is confirmed. Renters do not pay Migrent anything for a stay; how and when you pay the host is between you and them, so agree it in writing first.`,
  },
  {
    id: "art-14",
    slug: "instant-book-explained",
    title: "Instant book",
    category: "bookings-payments",
    audience: "both",
    tags: ["instant book", "booking", "stay"],
    readingTime: 1,
    featured: false,
    type: "faq",
    summary: "Stay listings that can be booked without waiting for the host to accept.",
    body: `## What it means

Some stay listings are marked **Instant book**: dates that fit the listing's rules can be booked without waiting for the host to accept each request. You can filter search to show only these.

## Before you book

Read the listing's minimum and maximum stay and its house rules, and message the host if anything is unclear.`,
  },
  {
    id: "art-15",
    slug: "how-payments-work",
    title: "What Migrent charges, and how",
    category: "bookings-payments",
    audience: "both",
    tags: ["fees", "payment", "stripe", "cost", "price", "refund"],
    readingTime: 2,
    featured: true,
    type: "faq",
    summary: `Renters search and apply for free. Hosts pay AUD $${FEE} once per property, and only for stays.`,
    body: `## Renters

Searching, messaging hosts, booking inspections and applying are free. Migrent never handles your rent or your bond.

The only thing a renter can pay Migrent for is a session with a mentor, if you choose to book one. Each mentor sets their own price, which is shown before you pay.

## Hosts

- Listing, editing and receiving applications are free.
- Taking a long-term tenant through an application: no fee.
- **Stay bookings:** a one-off fee of AUD $${FEE} per property, charged when the first stay booking at that property is confirmed. Later bookings at the same property are not charged again.

There is no subscription and no commission on rent.

## How the fee is paid

By card, through Stripe. Card details never reach Migrent's own servers, and Stripe emails a receipt.

## A question about a charge

Email ${SUPPORT}. See the [Terms of Service](/terms-of-service) for how refunds are handled.`,
  },
  {
    id: "art-16",
    slug: "cancel-a-booking",
    title: "Cancelling a stay request",
    category: "bookings-payments",
    audience: "seeker",
    tags: ["cancel", "cancellation", "booking", "stay"],
    readingTime: 1,
    featured: false,
    type: "faq",
    summary: "When you can cancel in Migrent Hub, and what to do after a stay is confirmed.",
    body: `## Before it is confirmed

While a request is waiting for the host, or has been accepted but not yet confirmed, you can cancel it yourself in Migrent Hub.

## After it is confirmed

Talk to the host first: any arrangement about money is between you and them. If you cannot sort it out, see [Dispute resolution](/support-disputes) or email ${SUPPORT}.`,
  },

  // ── Safety and reporting ───────────────────────────────────────────
  {
    id: "art-17",
    slug: "report-a-user",
    title: "Reporting a person or a listing",
    category: "safety-reporting",
    audience: "both",
    tags: ["report", "safety", "scam", "block", "unsafe"],
    readingTime: 2,
    featured: true,
    type: "safety",
    summary: "How to report something wrong, and what to do first if you feel unsafe.",
    body: `## If you feel unsafe

Call **000** first. Then tell us.

## Reporting

- **A listing:** use **Report** on the listing page.
- **A person or a conversation:** open the conversation in Migrent Hub and choose **Report**.
- **Anything else:** email ${SUPPORT}.

Say what happened and when. Screenshots help.

## Warning signs

- Being asked to pay a bond or rent before you have inspected the home or signed anything.
- Being asked to move the conversation to another app straight away.
- A price far below similar rooms nearby.
- A host who cannot show you the room.

Read more in [Safety and reporting](/safety-reporting).`,
  },

  // ── Your rights ─────────────────────────────────────────────────
  {
    id: "art-18",
    slug: "bond-and-deposit-rules",
    title: "Bonds in Australia",
    category: "legal-policies",
    audience: "both",
    tags: ["bond", "deposit", "rights", "tenancy", "authority"],
    readingTime: 3,
    featured: false,
    type: "policy",
    summary: "What a bond is, who holds it, and how you get it back.",
    body: `## What a bond is

A bond is money paid at the start of a tenancy as security against unpaid rent or damage beyond normal wear and tear. Each state and territory limits how much it can be and says how it must be held.

## Who holds it

In every state and in the ACT, the bond is lodged with a government bond authority, not kept by the host. In the Northern Territory, the landlord holds the security deposit under the territory's tenancy law. Either way, **Migrent never holds your bond**.

Ask for a receipt or a lodgement number, and check it with the authority.

## Getting it back

At the end of a tenancy, the bond is returned or a claim is made against it through the authority's process. If you disagree with a claim, your state or territory tenancy tribunal can decide.

## Check the rules where you live

Limits and time frames differ by state and change from time to time. The [rental laws guide](/guides/rental-laws) links to each state's authority. This is general information, not legal advice.`,
  },
  {
    id: "art-19",
    slug: "visa-and-housing-rights",
    title: "Your visa and your rights as a renter",
    category: "legal-policies",
    audience: "seeker",
    tags: ["visa", "rights", "discrimination", "student", "working holiday"],
    readingTime: 3,
    featured: false,
    type: "policy",
    summary: "Tenancy law protects renters whatever their visa, and some kinds of discrimination are against the law.",
    body: `## Tenancy law applies to you

The residential tenancy laws in each state and territory protect renters regardless of their visa. A landlord has to follow the proper legal process to end a tenancy.

## Discrimination

Under Australian law it is unlawful to refuse to rent to someone, or to treat them less favourably, because of their race, colour, nationality or ethnic origin. State and territory laws protect other attributes too, such as religion in some places. Asking about your ability to pay rent is generally allowed.

If you think you have been treated unfairly, the Australian Human Rights Commission (humanrights.gov.au) or your state's anti-discrimination body can help. Migrent's own rules are in the [Fair housing policy](/anti-discrimination).

## Practical tips

- Keep your visa grant notice handy; some hosts will ask about the length of your stay.
- A student visa does not stop you signing a lease; check that the lease length suits your course.
- Tenancy advice services in each state are free: see the [rental laws guide](/guides/rental-laws).

This is general information, not legal advice.`,
  },

  // ── Signing in ─────────────────────────────────────────────────
  {
    id: "art-20",
    slug: "troubleshoot-login-issues",
    title: "Can't sign in?",
    category: "technical-issues",
    audience: "both",
    tags: ["login", "sign in", "password", "google", "code", "locked"],
    readingTime: 2,
    featured: false,
    type: "troubleshoot",
    summary: "The usual reasons, and what to try.",
    body: `## Try these first

- **Wrong password:** choose **Forgot password** on the sign-in page and follow the emailed link.
- **You signed up with Google:** choose **Continue with Google** instead of typing a password.
- **Two-step sign-in code not accepted:** check the time on your phone is set automatically; codes depend on it.
- **No confirmation email:** check your spam folder, then ask for it again from the sign-in page.

## Still stuck?

Email ${SUPPORT} from the address you signed up with, and tell us what you see. ${siteIdentity.support.hours.charAt(0).toUpperCase()}${siteIdentity.support.hours.slice(1)}; we aim to reply ${siteIdentity.support.responseTarget}.`,
  },
];

const categoryName = (slug: string) => CATEGORY_DEFS.find((c) => c.slug === slug)?.name ?? "Help";

export const HELP_ARTICLES: StaticHelpArticle[] = ARTICLES.map((a) => ({
  ...a,
  categoryName: categoryName(a.category),
  updatedAt: UPDATED,
}));

export const HELP_CATEGORIES: StaticHelpCategory[] = CATEGORY_DEFS.map((c) => ({
  ...c,
  articleCount: HELP_ARTICLES.filter((a) => a.category === c.slug).length,
}));

/* ── Common questions, shown on /help ─────────────────────────────── */

export interface HelpFaq {
  id: string;
  q: string;
  a: string;
}

export interface HelpFaqGroup {
  id: string;
  title: string;
  items: HelpFaq[];
}

export const HELP_FAQ: HelpFaqGroup[] = [
  {
    id: "start",
    title: "Getting started",
    items: [
      { id: "what", q: "What is Migrent?", a: "Migrent helps migrants, students and new arrivals find rooms and homes in Australia, and helps owners and property managers let them. You search on this site; everything you do with an account happens in Migrent Hub." },
      { id: "agent", q: "Is Migrent a real estate agent?", a: "No. Migrent is an online introduction service. You deal directly with the host or renter, and Migrent does not collect rent, hold bonds or write tenancy agreements." },
      { id: "where", q: "Where can I rent through Migrent?", a: "Hosts can list anywhere in Australia, and the suburb guides cover every suburb. How many rooms there are depends on the area; search shows exactly what is available now." },
      { id: "both", q: "Can I rent and host with the same account?", a: "Yes. Change it in Settings in Migrent Hub. You cannot switch away from hosting while a listing is live or in review, or while a tenancy is active." },
    ],
  },
  {
    id: "renting",
    title: "Renting",
    items: [
      { id: "save", q: "How do I hear about new rooms?", a: "In Migrent Hub, search in Discover and choose Save search. Under Saved you choose how often we tell you about new matches." },
      { id: "history", q: "Do I need an Australian rental history?", a: "No. You apply with your Rental Profile: your work or study, your household and your references. A local rental ledger is not required." },
      { id: "cost", q: "What does it cost to rent through Migrent?", a: "Nothing to search, message hosts, book inspections or apply. The only paid option is a session with a mentor, if you choose one; the mentor sets the price." },
      { id: "address", q: "When do I see the street address?", a: "Once you book an inspection. Until then, listings show the suburb." },
      { id: "after", q: "What happens after a host approves my application?", a: "Migrent does a final review. Once it is finalised, you agree the terms with the host, lodge your bond with the bond authority, and your rent record and repairs live in Migrent Hub." },
    ],
  },
  {
    id: "hosting",
    title: "Hosting",
    items: [
      { id: "free", q: "Is listing free?", a: `Yes. Listing, editing and receiving applications are free, and long-term tenancies through applications have no fee. Stay bookings cost a one-off AUD $${FEE} per property, when the first one is confirmed.` },
      { id: "live", q: "How long until my listing is live?", a: "Your government ID is reviewed once, and each listing is read before it is published. You can save your listing as a draft while you wait." },
      { id: "choose", q: "How do I choose a renter?", a: "Review applications in Migrent Hub: each one shows a snapshot of the renter's profile, and you can keep private notes and a shortlist. When you approve someone, Migrent does a final review before the tenancy is set up." },
      { id: "rent", q: "Does Migrent collect the rent for me?", a: "No. Rent is paid to you the way you agree with your tenant. Migrent Hub keeps a shared record of what was due and what was paid." },
    ],
  },
  {
    id: "money",
    title: "Bonds and safety",
    items: [
      { id: "bond", q: "Who holds my bond?", a: "In every state and the ACT, a government bond authority. In the Northern Territory, the landlord holds the security deposit under territory law. Migrent never holds bonds." },
      { id: "checked", q: "What does \"ID-checked host\" mean?", a: "A person at Migrent has reviewed that host's government ID. It does not mean Migrent has inspected the property, so always inspect before you pay anything." },
      { id: "unsafe", q: "What should I do if I feel unsafe?", a: "Call 000 first. Then report it: use Report on the listing or conversation, or email us." },
    ],
  },
  {
    id: "account",
    title: "Your account",
    items: [
      { id: "delete", q: "How do I delete my account?", a: "In Migrent Hub, open Settings and go to your data. If you have a live listing or an active tenancy, you will be asked to close those first. The Privacy Policy explains what is kept and why." },
      { id: "email", q: "How do I change my email address?", a: "In Migrent Hub, open Settings and choose Change email. The change applies once you confirm the new address." },
      { id: "support", q: "How do I contact support?", a: `Email ${SUPPORT}, or use the contact form. ${siteIdentity.support.hours.charAt(0).toUpperCase()}${siteIdentity.support.hours.slice(1)}; we aim to reply ${siteIdentity.support.responseTarget}.` },
    ],
  },
];

/* ── Lookups ──────────────────────────────────────────────────────── */

export function getArticleBySlug(slug: string): StaticHelpArticle | undefined {
  return HELP_ARTICLES.find((a) => a.slug === slug);
}

export function getArticlesByCategory(categorySlug: string): StaticHelpArticle[] {
  return HELP_ARTICLES.filter((a) => a.category === categorySlug);
}

export function getCategoryBySlug(slug: string): StaticHelpCategory | undefined {
  return HELP_CATEGORIES.find((c) => c.slug === slug);
}

export function getFeaturedArticles(): StaticHelpArticle[] {
  return HELP_ARTICLES.filter((a) => a.featured);
}

export function getRelatedArticles(article: StaticHelpArticle, limit = 3): StaticHelpArticle[] {
  return HELP_ARTICLES.filter(
    (a) => a.slug !== article.slug && (a.category === article.category || a.tags.some((t) => article.tags.includes(t))),
  ).slice(0, limit);
}
