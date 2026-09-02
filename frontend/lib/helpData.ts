// Static Help Center content for MigRent V1.
// This file is the primary source of truth for help categories, articles, FAQs,
// and popular searches. All content is hardcoded so the Help Center works
// immediately without backend seeding.

export interface StaticHelpCategory {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  gradient: string;
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

export interface QuickFAQ {
  question: string;
  answer: string;
  category: string;
}

export const HELP_CATEGORIES: StaticHelpCategory[] = [
  {
    id: "cat-1",
    slug: "getting-started",
    name: "Getting Started",
    description: "New to MigRent? Start here to understand how the platform works for seekers and owners.",
    icon: "Rocket",
    gradient: "from-blue-500 to-indigo-600",
    articleCount: 3,
  },
  {
    id: "cat-2",
    slug: "account-verification",
    name: "Account & Verification",
    description: "Manage your profile, verify your identity, and keep your account secure.",
    icon: "ShieldCheck",
    gradient: "from-indigo-500 to-purple-600",
    articleCount: 3,
  },
  {
    id: "cat-3",
    slug: "search-matching",
    name: "Search & Matching",
    description: "Find the right room or tenant faster with smart search and AI matching.",
    icon: "Search",
    gradient: "from-emerald-500 to-teal-600",
    articleCount: 3,
  },
  {
    id: "cat-4",
    slug: "listings-hosting",
    name: "Listings & Hosting",
    description: "Create, manage, and optimise your room listings to attract quality tenants.",
    icon: "Home",
    gradient: "from-amber-500 to-orange-600",
    articleCount: 3,
  },
  {
    id: "cat-5",
    slug: "bookings-payments",
    name: "Bookings & Payments",
    description: "Understand how booking requests, instant book, and Stripe payments work.",
    icon: "CreditCard",
    gradient: "from-rose-500 to-pink-600",
    articleCount: 4,
  },
  {
    id: "cat-6",
    slug: "safety-reporting",
    name: "Safety & Reporting",
    description: "Stay safe on MigRent. Learn how to report issues, block users, and get help.",
    icon: "AlertTriangle",
    gradient: "from-orange-500 to-red-600",
    articleCount: 1,
  },
  {
    id: "cat-7",
    slug: "legal-policies",
    name: "Legal & Policies",
    description: "Rental law basics, bond rules, visa rights, and MigRent's own policies.",
    icon: "FileText",
    gradient: "from-purple-500 to-violet-600",
    articleCount: 2,
  },
  {
    id: "cat-8",
    slug: "technical-issues",
    name: "Technical Issues",
    description: "Can't log in? Page not loading? Fix common technical problems here.",
    icon: "Wrench",
    gradient: "from-cyan-500 to-blue-600",
    articleCount: 1,
  },
];

export const POPULAR_SEARCHES = [
  "verify identity",
  "cancel booking",
  "how to list a room",
  "payment not received",
  "bond deposit",
  "instant book",
  "report a user",
  "visa rights",
  "change email",
  "photos upload",
];

export const QUICK_FAQS: QuickFAQ[] = [
  {
    question: "How does MigRent work?",
    answer:
      "MigRent connects migrants and students in Australia with verified room owners. Seekers browse listings, request bookings, and pay securely through the platform. Owners list their rooms, review applicants, and receive payments directly to their bank account via Stripe.",
    category: "getting-started",
  },
  {
    question: "Is MigRent free to use?",
    answer:
      "Creating an account and browsing listings is completely free. A small service fee applies when a booking is confirmed. Owners do not pay to list - the fee is charged to the platform on successful bookings.",
    category: "getting-started",
  },
  {
    question: "How do I verify my identity?",
    answer:
      "Go to your profile settings and select Verification. You can upload a government-issued ID (passport, driver's licence) and optionally complete a selfie check. Verified profiles get a blue badge and are shown higher in search results.",
    category: "account-verification",
  },
  {
    question: "What happens if I need to cancel a booking?",
    answer:
      "Cancellation policies vary by listing. Most listings follow a standard policy: cancel 48 hours before move-in for a full refund, 24 hours for 50%, and no refund within 24 hours. Always check the listing's cancellation terms before booking.",
    category: "bookings-payments",
  },
  {
    question: "How do payments work?",
    answer:
      "All payments are processed securely through Stripe. When a booking is confirmed, your card is charged. Owners receive payment directly to their Stripe-connected bank account, typically within 2-5 business days.",
    category: "bookings-payments",
  },
  {
    question: "Can I use MigRent on any visa?",
    answer:
      "Yes. MigRent is designed for migrants and students on any visa type - student, skilled worker, working holiday, partner, and more. Listings are Australia-wide and do not discriminate by visa status.",
    category: "legal-policies",
  },
];

export const HELP_ARTICLES: StaticHelpArticle[] = [
  // GETTING STARTED
  {
    id: "art-1",
    slug: "how-migrent-works",
    title: "How MigRent works",
    category: "getting-started",
    categoryName: "Getting Started",
    audience: "both",
    tags: ["overview", "platform", "how-it-works"],
    readingTime: 3,
    featured: true,
    type: "guide",
    summary: "A complete overview of the MigRent platform - how seekers find rooms and owners list properties.",
    body: `## Welcome to MigRent

MigRent is Australia's rental marketplace built specifically for migrants, international students, and newcomers. We connect people looking for rooms with owners who welcome tenants from all backgrounds.

## For seekers

As a seeker, you can browse room listings across Australia from hosts whose ID has been checked. Use our smart search to filter by suburb, price, move-in date, and room type. When you find a listing you like, you can either request a booking (the owner reviews and approves) or use Instant Book (confirm immediately without waiting).

Once your booking is confirmed, payment is processed securely via Stripe. You'll receive a digital booking confirmation you can show at move-in.

## For owners

As an owner, you create a listing for your room or property. You set your own price, availability, house rules, and whether to allow Instant Book. When a seeker requests a booking, you'll receive a notification and have 24 hours to accept or decline. Payment goes straight to your Stripe account.

## Verification and trust

Both seekers and owners can verify their identity through our verification system. Verified profiles get a blue badge and appear higher in search results. This creates a safer, more trusted community for everyone.

## Support

If you ever need help, you're in the right place. Browse the Help Center for articles, or contact our support team directly from the Contact Support page.`,
    updatedAt: "2026-04-01",
  },
  {
    id: "art-2",
    slug: "create-your-account",
    title: "How to create your account",
    category: "getting-started",
    categoryName: "Getting Started",
    audience: "both",
    tags: ["signup", "registration", "account"],
    readingTime: 2,
    featured: false,
    type: "guide",
    summary: "Step-by-step guide to signing up for MigRent as a seeker or owner.",
    body: `## Creating your MigRent account

Getting started on MigRent takes less than two minutes. Here's how:

## Step 1 - Sign up

Go to migrent.com.au and click Sign Up. Enter your email address and create a secure password. You can also sign up with Google for faster access.

## Step 2 - Choose your role

After signing up, you'll be asked whether you're a Seeker (looking for a room) or an Owner (listing a property). You can switch roles later from your dashboard at any time.

## Step 3 - Complete your profile

Fill in your name, a profile photo, a short bio, and your move-in preferences (if you're a seeker) or property details (if you're an owner). A complete profile gets 3x more responses.

## Step 4 - Verify your identity

Head to Settings > Verification to upload your ID. This is optional but strongly recommended - verified users get a trust badge and appear higher in search results.

## Step 5 - Start using MigRent

Seekers can now browse listings and send booking requests. Owners can post their first room listing. Check your dashboard for personalised recommendations and next steps.`,
    updatedAt: "2026-04-01",
  },
  {
    id: "art-3",
    slug: "seeker-vs-owner",
    title: "Seeker vs Owner - what's the difference?",
    category: "getting-started",
    categoryName: "Getting Started",
    audience: "both",
    tags: ["role", "seeker", "owner"],
    readingTime: 2,
    featured: false,
    type: "faq",
    summary: "Understand the difference between a Seeker and Owner account on MigRent.",
    body: `## What is a Seeker?

A Seeker is someone looking for a room to rent. As a seeker you can:

- Browse all available listings
- Search by suburb, price, room type, and dates
- Save listings to your wishlist
- Send booking requests or use Instant Book
- Message owners directly
- Leave reviews after your stay

## What is an Owner?

An Owner is someone who has a room or property to rent out. As an owner you can:

- Create and manage room listings
- Set your own price, availability, and house rules
- Review and accept or decline booking requests
- Enable Instant Book for faster bookings
- Receive payments via Stripe
- View analytics on your listing performance

## Can I be both?

Yes. You can switch between Seeker and Owner roles from your dashboard at any time. Your profile, messages, and booking history are linked to your account, not just one role.

## Which role should I choose?

Choose Seeker if you are looking for a place to rent. Choose Owner if you have a room available and want to find a tenant. If you're not sure yet, start as a Seeker - you can always add a listing later.`,
    updatedAt: "2026-04-01",
  },

  // ACCOUNT & VERIFICATION
  {
    id: "art-4",
    slug: "complete-your-profile",
    title: "How to complete your profile",
    category: "account-verification",
    categoryName: "Account & Verification",
    audience: "both",
    tags: ["profile", "setup", "photo"],
    readingTime: 2,
    featured: false,
    type: "guide",
    summary: "A complete profile increases your chances of getting bookings or responses by 3x.",
    body: `## Why your profile matters

Your profile is how owners and seekers decide whether to trust you. A complete profile with a real photo and bio gets 3x more responses than an incomplete one.

## What to include

### Profile photo

Use a clear, recent photo of your face. Listings and messages with profile photos get significantly more engagement. Avoid using logos, cartoons, or group photos.

### Display name

Use your real first name, or first name and last initial. This builds trust with the other party.

### Bio

Write 2-4 sentences about yourself. If you're a seeker, mention your occupation or studies, lifestyle (quiet, social, etc), and what you're looking for. If you're an owner, mention what makes your place great and what kind of tenant you're looking for.

### Verification badge

Upload your ID in Settings > Verification. Verified users appear with a blue badge on their profile and in search results.

## How to edit your profile

- Go to Dashboard > Profile
- Click Edit Profile
- Update your photo, name, bio, and preferences
- Click Save Changes

Changes are reflected immediately across the platform.`,
    updatedAt: "2026-04-01",
  },
  {
    id: "art-5",
    slug: "verify-your-identity",
    title: "How to verify your identity",
    category: "account-verification",
    categoryName: "Account & Verification",
    audience: "both",
    tags: ["verification", "ID", "trust badge", "identity"],
    readingTime: 3,
    featured: true,
    type: "guide",
    summary: "Verify your identity to get a trust badge and appear higher in search results.",
    body: `## Why verify?

Verified users get a blue trust badge on their profile. This signals to other users that you are who you say you are. Verified seekers are more likely to get their booking requests accepted. Verified owners get more inquiries.

Verification is optional but strongly recommended.

## What you'll need

- A government-issued photo ID (passport, Australian driver's licence, or national ID card)
- A clear selfie (taken at time of verification)
- A device with a camera

## Step-by-step

### Step 1 - Go to Verification

Open your Dashboard and go to Settings > Verification, or click the Verification tab in your profile.

### Step 2 - Upload your ID

Click Upload ID and take a clear photo of the front of your document. Make sure all four corners are visible and the text is legible. Accepted documents:

- Australian or international passport
- Australian driver's licence
- National identity card

### Step 3 - Take a selfie

After uploading your ID, you'll be prompted to take a selfie. Hold your phone at eye level and make sure your face is fully visible. This is used to confirm the photo on your ID matches you.

### Step 4 - Wait for review

Verification is usually processed within 24 hours. You'll receive an email and in-app notification when your badge is approved.

## Privacy note

Your ID documents are encrypted and stored securely. They are used only for identity verification and are not shared with other users or third parties.`,
    updatedAt: "2026-04-01",
  },
  {
    id: "art-6",
    slug: "change-email-or-password",
    title: "How to change your email or password",
    category: "account-verification",
    categoryName: "Account & Verification",
    audience: "both",
    tags: ["email", "password", "security", "account settings"],
    readingTime: 2,
    featured: false,
    type: "guide",
    summary: "Update your login email or password from your account settings.",
    body: `## Changing your email

To update the email address on your account:

- Go to Settings > Account Security
- Click Change Email
- Enter your new email address and confirm with your current password
- Check your new email inbox for a verification link
- Click the link to confirm the change

Your old email will remain active until you confirm the new one.

## Changing your password

- Go to Settings > Account Security
- Click Change Password
- Enter your current password, then your new password twice
- Your new password must be at least 8 characters and include a number or symbol
- Click Save - you'll be logged out and asked to sign in again with your new password

## Forgot your password?

If you've forgotten your password, go to the sign-in page and click Forgot password. Enter your email address and we'll send you a reset link within a few minutes.

If you don't receive the email within 10 minutes, check your spam folder or contact support.

## Account security tips

- Use a unique password not used on any other site
- Enable two-factor authentication when it becomes available
- Never share your login credentials with anyone, including MigRent staff`,
    updatedAt: "2026-04-01",
  },

  // SEARCH & MATCHING
  {
    id: "art-7",
    slug: "how-to-search-rooms",
    title: "How to search for rooms",
    category: "search-matching",
    categoryName: "Search & Matching",
    audience: "seeker",
    tags: ["search", "filter", "find room", "suburb"],
    readingTime: 3,
    featured: true,
    type: "guide",
    summary: "Use smart filters, map view, and suburb pages to find your ideal room in Australia.",
    body: `## Starting your search

From your Seeker Hub or the Search page, you can browse all available listings across Australia. Here's how to search effectively:

## Using filters

Click the Filter button to narrow results by:

- Location - suburb, city, or postcode
- Price - set a minimum and maximum weekly rent
- Room type - private room, studio, shared room, or entire place
- Move-in date - set when you need to move in
- Features - ensuite, furnished, bills included, pet-friendly, and more

## Map view

Toggle to Map View to see listings on a map. This is helpful for understanding commute distances and neighbourhood context. Click any pin to see a preview of the listing.

## Suburb pages

Browse suburb-specific pages (e.g. /suburb/kellyville) for a curated overview of average rents, nearby transport, and available rooms in that area.

## Saved searches

Not ready to book yet? Save your search filters and get notified by email when new listings match your criteria. Look for the Save Search button at the top of the results page.

## AI recommendations

The platform suggests listings based on your preferences, move-in date, and budget. Check the Recommended section in your Seeker Hub for personalised picks.

## Tips for better results

- Be flexible on move-in date to see more listings
- Start broad with suburb and narrow down later
- Save listings you like to your wishlist to compare later
- Check the verified badge on listings - these have been reviewed by our team`,
    updatedAt: "2026-04-01",
  },
  {
    id: "art-8",
    slug: "save-and-compare-listings",
    title: "How to save and compare listings",
    category: "search-matching",
    categoryName: "Search & Matching",
    audience: "seeker",
    tags: ["wishlist", "save", "compare", "favourites"],
    readingTime: 2,
    featured: false,
    type: "guide",
    summary: "Save listings to your wishlist and compare them side-by-side before booking.",
    body: `## Saving a listing

On any listing page, click the heart icon (top right of the listing card) to save it to your wishlist. You can save as many listings as you like - there's no limit.

## Viewing your wishlist

Go to Dashboard > Saved (or click the heart icon in the sidebar) to see all your saved listings. They're shown with current availability and price so you always see up-to-date information.

## Removing a listing from your wishlist

Click the heart icon again on a saved listing, or open your Saved page and click the remove button. The listing will be removed from your wishlist immediately.

## Tips for comparing listings

When comparing two or more listings, consider:

- Total weekly cost (including bills if not included)
- Distance to your workplace or university
- Move-in date flexibility
- House rules (guests, pets, quiet hours)
- Reviews from previous tenants
- Whether the owner has a verified badge

## What happens when a saved listing is booked?

If a listing you've saved gets taken before you book, it will show as Unavailable in your wishlist with the dates it was booked. You'll get a notification so you can continue your search.`,
    updatedAt: "2026-04-01",
  },
  {
    id: "art-9",
    slug: "how-matching-works",
    title: "How AI matching works",
    category: "search-matching",
    categoryName: "Search & Matching",
    audience: "seeker",
    tags: ["AI", "matching", "recommendations", "smart search"],
    readingTime: 2,
    featured: false,
    type: "guide",
    summary: "Understand how MigRent's AI matching engine finds the best listings for your needs.",
    body: `## What is AI matching?

MigRent uses an AI-powered matching engine to suggest the most relevant listings for each seeker. Rather than just showing all available listings, we rank and surface the ones most likely to be a great fit for you.

## How it works

The matching engine considers:

- Your preferred suburbs and distance to work or university
- Your budget and preferred room type
- Your move-in date and minimum stay duration
- Your lifestyle preferences (quiet vs social, pets, etc)
- Owner response rates and listing quality scores
- Reviews and ratings from previous tenants

## Where matches appear

Your personalised matches appear in:

- The Seeker Hub homepage under Recommended for You
- Search results (matched listings are ranked higher for you)
- Email digests when new matching listings are posted

## Improving your matches

The more complete your profile, the better your matches. Make sure you've set:

- Your preferred move-in date
- Your maximum budget
- Your preferred suburbs (up to 5)
- Your lifestyle preferences in Settings > Preferences

## AI matching vs regular search

Regular search returns all listings matching your filter criteria. AI matching re-ranks those results based on your personal profile and behaviour on the platform. Use both together for the best results.`,
    updatedAt: "2026-04-01",
  },

  // LISTINGS & HOSTING
  {
    id: "art-10",
    slug: "create-your-first-listing",
    title: "How to create your first listing",
    category: "listings-hosting",
    categoryName: "Listings & Hosting",
    audience: "owner",
    tags: ["listing", "post room", "create", "publish"],
    readingTime: 4,
    featured: true,
    type: "guide",
    summary: "Step-by-step guide to creating and publishing your first room listing on MigRent.",
    body: `## Before you start

Make sure you have the following ready before creating your listing:

- At least 5 clear photos of the room and common areas
- The weekly rent amount and bond amount
- Move-in availability date
- Any house rules you want to set

## Step 1 - Go to Post Room

From your Owner Hub or the sidebar, click Post Room. This opens the listing creation form.

## Step 2 - Add basic details

Enter:

- Room title (e.g. "Bright private room with ensuite in Chatswood")
- Property type (room, studio, or entire place)
- Address (shown only as suburb to seekers for privacy)
- Room size and features (ensuite, furnished, air conditioning, etc)

## Step 3 - Set your price

Enter your weekly rent. You can also set:

- Bond amount (typically 4 weeks rent)
- Whether bills are included
- Minimum stay duration
- Maximum stay duration

## Step 4 - Upload photos

Upload at least 5 photos. Include:

- The bedroom from two angles
- Any ensuite or shared bathroom
- Common areas (kitchen, living room)
- Outdoor space if available

Good photos get 2x more inquiries. Use natural light and tidy the room before shooting.

## Step 5 - Set house rules

Set clear house rules to attract the right tenants. Common rules include:

- No smoking inside
- No pets
- Quiet hours (e.g. 10pm - 8am)
- Couples welcome or not
- Maximum guests overnight

## Step 6 - Set availability

Choose your move-in date and whether to enable Instant Book. Instant Book allows seekers to confirm bookings immediately without waiting for your approval.

## Step 7 - Publish

Review your listing and click Publish. Your listing will be live within a few minutes and visible to seekers across Australia.`,
    updatedAt: "2026-04-01",
  },
  {
    id: "art-11",
    slug: "add-photos-to-listing",
    title: "How to add great photos to your listing",
    category: "listings-hosting",
    categoryName: "Listings & Hosting",
    audience: "owner",
    tags: ["photos", "listing", "images", "upload"],
    readingTime: 2,
    featured: false,
    type: "guide",
    summary: "Great photos are the biggest factor in getting more inquiries. Here's how to take and upload them.",
    body: `## Why photos matter

Listings with 5 or more high-quality photos receive 2x more inquiries than listings with fewer or lower-quality photos. Your photos are the first thing seekers see.

## What photos to include

At minimum, include:

- The bedroom (at least 2 angles)
- The bathroom (shared or ensuite)
- The kitchen
- The living or common area

Bonus photos that help:

- The front of the building or house
- The backyard or balcony
- The neighbourhood or street

## Tips for great photos

- Shoot in daylight - open blinds and turn on all lights
- Tidy and clean the room before shooting
- Remove personal items and clutter
- Shoot from corners to show the full room
- Use landscape orientation (horizontal)
- Minimum resolution: 1200 x 900 pixels

## How to upload photos

- Go to Owner Hub > Listings > [Your listing] > Edit
- Scroll to the Photos section
- Click Add Photos and select your files
- Drag to reorder - the first photo is the cover image

## Photo requirements

- File types: JPG, PNG, WEBP
- Maximum file size: 10MB per photo
- Minimum: 5 photos to publish
- Maximum: 30 photos per listing

## Can I use stock photos?

No. All photos must be real photos of your actual property. Listings with stock or misleading photos may be removed and your account may be suspended.`,
    updatedAt: "2026-04-01",
  },
  {
    id: "art-12",
    slug: "set-your-room-rules",
    title: "How to set your house rules",
    category: "listings-hosting",
    categoryName: "Listings & Hosting",
    audience: "owner",
    tags: ["house rules", "rules", "owner", "tenant rules"],
    readingTime: 2,
    featured: false,
    type: "guide",
    summary: "Set clear house rules to attract the right tenants and avoid misunderstandings.",
    body: `## Why house rules matter

Clear house rules set expectations before a tenant moves in. They reduce disputes and help you attract tenants who are a good fit for your household.

## Common house rules to consider

- Smoking policy (no smoking inside, outdoor smoking only, or no smoking)
- Pet policy (no pets, cats only, pets allowed with approval)
- Guest policy (no overnight guests, guests allowed, couples welcome)
- Quiet hours (e.g. 10pm to 8am on weekdays)
- Cleaning responsibilities (shared common areas, individual rooms)
- Kitchen usage (no cooking after 10pm, etc)
- Parking (one car bay available, no visitor parking)

## Rules that are not allowed

House rules must not discriminate on the basis of:

- Race, nationality, or ethnicity
- Religion or religious dress
- Visa type or country of origin
- Gender or gender identity
- Disability

These are prohibited under Australian anti-discrimination law. Listings with discriminatory rules will be removed.

## How to set house rules

- Go to Owner Hub > Listings > [Your listing] > Edit
- Scroll to House Rules
- Toggle on/off the preset options
- Add any custom rules in the text field

## Communicating rules to tenants

Even if your rules are set in the listing, we recommend:

- Confirming them in your welcome message when accepting a booking
- Posting a printed copy in the common area
- Discussing them in person on move-in day`,
    updatedAt: "2026-04-01",
  },

  // BOOKINGS & PAYMENTS
  {
    id: "art-13",
    slug: "request-to-book",
    title: "How to request a booking",
    category: "bookings-payments",
    categoryName: "Bookings & Payments",
    audience: "seeker",
    tags: ["booking", "request", "apply", "rent"],
    readingTime: 3,
    featured: true,
    type: "guide",
    summary: "Learn how to send a booking request and what happens after the owner responds.",
    body: `## What is a booking request?

A booking request is how you tell an owner you want to rent their room. The owner then has 24 hours to accept or decline. If accepted, your payment is processed and the booking is confirmed.

## Before you request

Make sure you have:

- Completed your profile (photo, bio, preferences)
- Verified your identity (recommended)
- Read the listing's house rules
- Confirmed the move-in date and duration work for you

## How to send a request

- Open the listing you want to book
- Click Request to Book
- Choose your move-in date and how long you'd like to stay
- Add a personalised message to the owner (recommended)
- Review the total cost including the service fee
- Enter your payment details and click Send Request

Your card will not be charged until the owner accepts.

## Writing a good intro message

A personalised message to the owner dramatically increases your acceptance rate. Include:

- A brief intro about yourself (who you are, what you do or study)
- Why you're moving to the area
- Your lifestyle (quiet, respectful, clean)
- Any questions about the property

Example: "Hi, I'm Priya, a grad student at UNSW starting in February. I'm quiet, clean, and looking for a safe, welcoming home. Your listing looks perfect - could you tell me more about the parking situation?"

## What happens next?

- The owner reviews your request and has 24 hours to respond
- You'll receive a notification when they accept or decline
- If accepted, your payment is processed automatically
- If declined or no response after 24 hours, you are not charged

## Instant Book

If the listing has Instant Book enabled, your booking is confirmed immediately without waiting. Payment is processed right away.`,
    updatedAt: "2026-04-01",
  },
  {
    id: "art-14",
    slug: "instant-book-explained",
    title: "Instant Book explained",
    category: "bookings-payments",
    categoryName: "Bookings & Payments",
    audience: "both",
    tags: ["instant book", "booking", "confirm"],
    readingTime: 2,
    featured: false,
    type: "faq",
    summary: "Instant Book lets seekers confirm bookings immediately without owner approval.",
    body: `## What is Instant Book?

Instant Book is a feature that lets seekers confirm a booking immediately, without waiting for the owner to manually accept. When you book an Instant Book listing, the booking is confirmed and payment is processed right away.

## For seekers

Listings with Instant Book have a lightning bolt icon. When you book one:

- Your card is charged immediately on confirmation
- You receive a booking confirmation email and in-app notification
- There is no waiting period - the room is yours from the agreed move-in date

Instant Book listings tend to go faster. If you find a listing you love with Instant Book, act quickly.

## For owners

You can enable Instant Book on any of your listings in Listings > [Your listing] > Edit > Booking Settings.

When Instant Book is on:

- Seekers can confirm bookings without your approval
- You are notified immediately when a booking is made
- The booking is binding - cancellations follow the standard policy
- You can set requirements (e.g. verified ID only) before Instant Book becomes available

## Can I turn off Instant Book?

Yes. Owners can turn off Instant Book at any time from their listing settings. All pending requests will still need manual approval.

## Is Instant Book safer?

Instant Book does not bypass identity checks. Seekers still need a complete profile and can be required to have verified ID before Instant Book is available. Contact support if you have a concern about a confirmed Instant Book guest.`,
    updatedAt: "2026-04-01",
  },
  {
    id: "art-15",
    slug: "how-payments-work",
    title: "How payments work on MigRent",
    category: "bookings-payments",
    categoryName: "Bookings & Payments",
    audience: "both",
    tags: ["payment", "stripe", "money", "bank", "payout"],
    readingTime: 3,
    featured: false,
    type: "guide",
    summary: "Understand how MigRent handles payments securely for both seekers and owners.",
    body: `## Payment processing

All payments on MigRent are processed by Stripe, one of the world's most trusted payment platforms. Your card details are never stored on MigRent's servers.

## For seekers

When you confirm a booking:

- Your card is authorised at the time of request
- Payment is only captured when the owner accepts (or immediately for Instant Book)
- You receive a payment receipt via email
- The weekly rent is charged according to the payment schedule set in the booking

Accepted payment methods:

- Visa and Mastercard (credit and debit)
- Apple Pay and Google Pay

## For owners

To receive payments, you need to connect your bank account via Stripe:

- Go to Settings > Payments > Connect Bank Account
- Follow the Stripe onboarding steps
- Enter your bank BSB and account number
- Verify your identity with Stripe (required by Australian law)

Once connected, payouts are typically transferred within 2-5 business days after a booking payment is processed.

## Service fees

MigRent charges a small service fee on successful bookings. This fee is shown transparently at checkout before you confirm. The fee covers platform costs, payment processing, and support.

## Payment disputes

If you believe you've been charged incorrectly, contact support within 7 days of the charge. Include your booking ID and a description of the issue. We aim to resolve all payment disputes within 3-5 business days.`,
    updatedAt: "2026-04-01",
  },
  {
    id: "art-16",
    slug: "cancel-a-booking",
    title: "How to cancel a booking",
    category: "bookings-payments",
    categoryName: "Bookings & Payments",
    audience: "both",
    tags: ["cancel", "cancellation", "refund", "booking"],
    readingTime: 3,
    featured: false,
    type: "guide",
    summary: "Learn how to cancel a booking and understand the refund policy.",
    body: `## Cancellation policy

Cancellation policies vary by listing. The policy is always shown on the listing page and at checkout before you confirm. Standard policies on MigRent:

### Flexible

- Cancel up to 48 hours before move-in: full refund
- Cancel within 48 hours: 50% refund
- Cancel within 24 hours: no refund

### Moderate

- Cancel up to 5 days before move-in: full refund
- Cancel 2-5 days before move-in: 50% refund
- Cancel within 48 hours: no refund

### Strict

- Cancel 7 or more days before move-in: 50% refund
- Cancel within 7 days: no refund

## How to cancel - seekers

- Go to Dashboard > Bookings
- Find the booking and click Cancel Booking
- Select your reason for cancellation
- Review the refund amount based on the policy
- Confirm the cancellation

Your refund (if applicable) will be returned to your original payment method within 5-10 business days.

## How to cancel - owners

- Go to Owner Hub > Bookings
- Find the booking and click Cancel Booking
- Select your reason for cancellation

Owner cancellations are penalised under our Reliable Host Policy. Excessive cancellations may result in your listing being demoted or removed. If you must cancel due to an emergency, contact support before cancelling.

## What if a booking was fraudulent?

If you believe a booking was made fraudulently, do not cancel it yourself. Contact support immediately with your booking ID and details.`,
    updatedAt: "2026-04-01",
  },

  // SAFETY & REPORTING
  {
    id: "art-17",
    slug: "report-a-user",
    title: "How to report a user or listing",
    category: "safety-reporting",
    categoryName: "Safety & Reporting",
    audience: "both",
    tags: ["report", "safety", "block", "scam", "abuse"],
    readingTime: 3,
    featured: false,
    type: "safety",
    summary: "Report suspicious users, scam listings, or abusive behaviour directly from MigRent.",
    body: `## Your safety is our priority

MigRent has a zero-tolerance policy for scams, harassment, discrimination, and fraudulent listings. We take all reports seriously and investigate within 24 hours.

## How to report a listing

If you see a listing that looks suspicious, misleading, or discriminatory:

- Open the listing page
- Scroll to the bottom and click Report this listing
- Choose a reason (scam, misleading photos, discriminatory rules, other)
- Add any details that might help our team
- Submit the report

Reported listings are reviewed by our moderation team within 24 hours. If the listing violates our policies, it will be removed.

## How to report a user

If a user has sent you an abusive, threatening, or suspicious message:

- Open the message thread
- Click the three-dot menu at the top right
- Select Report User
- Choose a reason and add details
- Submit

You can also block a user from the same menu. Blocking prevents them from messaging you or seeing your profile.

## Emergency situations

If you are in immediate danger, contact Australian emergency services: call 000.

If you have been scammed financially, report to:

- Australian Cyber Security Centre: cyber.gov.au
- Scamwatch: scamwatch.gov.au
- Your bank's fraud line

Then contact MigRent support with your case reference number.

## What we do with reports

All reports are reviewed by a human moderator. We may:

- Remove the listing or account
- Warn the user
- Permanently ban the user
- Share information with law enforcement if required

We do not share your identity with the person you report.`,
    updatedAt: "2026-04-01",
  },

  // LEGAL & POLICIES
  {
    id: "art-18",
    slug: "bond-and-deposit-rules",
    title: "Bond and deposit rules in Australia",
    category: "legal-policies",
    categoryName: "Legal & Policies",
    audience: "both",
    tags: ["bond", "deposit", "legal", "tenancy", "rental"],
    readingTime: 3,
    featured: false,
    type: "policy",
    summary: "Understand how bonds work in Australia and what rights you have as a tenant or owner.",
    body: `## What is a bond?

A bond (also called a security deposit) is money paid by a tenant at the start of a tenancy. It protects the owner against damage, unpaid rent, or cleaning costs. In most Australian states, the bond is lodged with a government authority - not held by the owner.

## Bond limits by state

Maximum bond amounts vary by state. Common limits:

- NSW: 4 weeks rent (for rent above a threshold: no limit)
- VIC: 1 month rent
- QLD: 4 weeks rent
- WA: 4 weeks rent
- SA: 4 weeks rent
- TAS: 4 weeks rent

Always check the current rules with your state's tenancy authority, as laws can change.

## Bond lodgement

In most states, the owner must lodge your bond with the relevant authority within a set number of days. You should receive a receipt. If you don't receive one, contact your state tenancy authority.

- NSW: NSW Fair Trading
- VIC: Residential Tenancies Bond Authority (RTBA)
- QLD: Residential Tenancies Authority (RTA)
- WA: Bond Administrator
- SA: Consumer and Business Services

## Getting your bond back

At the end of your tenancy, the owner has a set period to either return your bond or make a claim for deductions. Common reasons for deductions:

- Damage beyond normal wear and tear
- Unpaid rent
- Excessive cleaning costs
- Removal of items left by the tenant

If you disagree with a deduction, you can apply to your state's tenancy tribunal for a bond dispute resolution.

## MigRent and bonds

MigRent does not hold bonds on behalf of owners or seekers. Bond payments should be made directly between tenant and owner and lodged as required by law. Always get a receipt.`,
    updatedAt: "2026-04-01",
  },
  {
    id: "art-19",
    slug: "visa-and-housing-rights",
    title: "Visa types and your housing rights",
    category: "legal-policies",
    categoryName: "Legal & Policies",
    audience: "seeker",
    tags: ["visa", "rights", "student visa", "housing", "discrimination"],
    readingTime: 3,
    featured: false,
    type: "policy",
    summary: "Know your housing rights in Australia regardless of your visa status.",
    body: `## Your rights as a tenant in Australia

All tenants in Australia - regardless of visa status - have legal rights under residential tenancy law. Landlords cannot discriminate against you based on your visa type, nationality, or country of origin.

## Common visa types and renting

### Student visa (subclass 500)

Students on a student visa can rent privately. You have full tenancy rights. Some landlords may ask for a larger bond or a guarantor letter from your institution - this is legal if applied equally to all applicants.

### Working holiday visa (subclass 417 / 462)

Working holiday makers can rent privately. Given the temporary nature of the visa, you may prefer shorter-term rentals. MigRent has many listings with flexible durations of 1-6 months.

### Skilled and employer-sponsored visas

Visa holders in this category have the same rights as permanent residents for tenancy purposes.

### Partner and family visas

Full tenancy rights apply. If your visa is bridging while you wait for a decision, you still have housing rights.

### Undocumented or visa-expired residents

Even if your visa has expired, you have basic housing rights. Landlords cannot evict you without going through the proper legal process.

## Discrimination is illegal

Under Australian law, it is illegal for a landlord to refuse to rent to you based on:

- Race, nationality, or ethnicity
- Religion
- Visa status or country of origin

If you believe you have been discriminated against, you can lodge a complaint with the Australian Human Rights Commission (humanrights.gov.au) or your state anti-discrimination body.

## Resources

- Fair Work Australia: fairwork.gov.au
- Australian Human Rights Commission: humanrights.gov.au
- Tenants Union of NSW: tenants.org.au
- Tenants Victoria: tenantsvic.org.au`,
    updatedAt: "2026-04-01",
  },

  // TECHNICAL ISSUES
  {
    id: "art-20",
    slug: "troubleshoot-login-issues",
    title: "Troubleshoot login and account access issues",
    category: "technical-issues",
    categoryName: "Technical Issues",
    audience: "both",
    tags: ["login", "password", "access", "technical", "sign in"],
    readingTime: 3,
    featured: false,
    type: "troubleshoot",
    summary: "Can't sign in? Use this guide to diagnose and fix the most common login problems.",
    body: `## Can't sign in?

Start with these common fixes before contacting support:

## Check your email and password

- Make sure you're using the email address you signed up with
- Passwords are case-sensitive - check Caps Lock is off
- If you signed up with Google, use Sign in with Google instead of email/password

## Reset your password

If you've forgotten your password:

- Go to the sign-in page and click Forgot password
- Enter your email address
- Check your inbox (and spam folder) for a reset link
- The link expires after 1 hour - request a new one if needed

## Account not found

If you see "no account with this email", you may have signed up with a different email address. Try:

- Your work or university email
- A Gmail or Outlook alternative
- Signing in with Google if you originally used that

## Email verification required

If you signed up recently and haven't verified your email, check your inbox for a verification email from no-reply@migrent.com.au. Click the link inside to activate your account.

If you can't find it, contact support and we can resend the verification.

## Two-factor authentication

If you have 2FA enabled and can't access your authentication app:

- Use one of your backup codes (saved when you set up 2FA)
- If you don't have backup codes, contact support - we'll need to verify your identity before resetting 2FA

## Still can't get in?

Contact support with:

- The email address on your account
- A brief description of what happens when you try to sign in
- Any error messages you see

We typically respond within 4 business hours.`,
    updatedAt: "2026-04-01",
  },
];

// Seeker-featured articles (3 shown on help homepage for seekers)
export const SEEKER_FEATURED_SLUGS = [
  "how-migrent-works",
  "how-to-search-rooms",
  "request-to-book",
];

// Owner-featured articles (3 shown on help homepage for owners)
export const OWNER_FEATURED_SLUGS = [
  "how-migrent-works",
  "create-your-first-listing",
  "how-payments-work",
];

export function getArticleBySlug(slug: string): StaticHelpArticle | undefined {
  return HELP_ARTICLES.find((a) => a.slug === slug);
}

export function getArticlesByCategory(categorySlug: string): StaticHelpArticle[] {
  return HELP_ARTICLES.filter((a) => a.category === categorySlug);
}

export function getCategoryBySlug(slug: string): StaticHelpCategory | undefined {
  return HELP_CATEGORIES.find((c) => c.slug === slug);
}

export function searchArticles(query: string): StaticHelpArticle[] {
  const q = query.toLowerCase().trim();
  if (!q) return HELP_ARTICLES;
  return HELP_ARTICLES.filter(
    (a) =>
      a.title.toLowerCase().includes(q) ||
      a.summary.toLowerCase().includes(q) ||
      a.tags.some((t) => t.toLowerCase().includes(q)) ||
      a.categoryName.toLowerCase().includes(q)
  );
}

export function getFeaturedArticles(role: "seeker" | "owner" | null): StaticHelpArticle[] {
  const slugs = role === "owner" ? OWNER_FEATURED_SLUGS : SEEKER_FEATURED_SLUGS;
  return slugs.map((s) => getArticleBySlug(s)).filter(Boolean) as StaticHelpArticle[];
}

export function getRelatedArticles(article: StaticHelpArticle, limit = 3): StaticHelpArticle[] {
  return HELP_ARTICLES.filter(
    (a) =>
      a.slug !== article.slug &&
      (a.category === article.category ||
        a.tags.some((t) => article.tags.includes(t)))
  ).slice(0, limit);
}
