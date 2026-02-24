// ─────────────────────────────────────────────────────────────
// MigRent AI – Comprehensive Knowledge Base
// Sections 0–11 · ~200+ articles · User-facing help content
// ─────────────────────────────────────────────────────────────

export type KBCategory =
  | "Getting Started"
  | "Account & Profile"
  | "Listings & Hosting"
  | "Searching & Booking"
  | "Payments & Pricing"
  | "Verification & Safety"
  | "Dashboard & Settings"
  | "Emails & Notifications"
  | "Troubleshooting"
  | "Legal & Privacy"
  | "Tips & Guides";

export interface KBArticle {
  id: string;
  category: KBCategory;
  question: string;
  answer: string;
  keywords: string[];
}

const articles: KBArticle[] = [
  // ════════════════════════════════════════════════════════════
  // SECTION 1 – GETTING STARTED
  // ════════════════════════════════════════════════════════════

  {
    id: "gs-001",
    category: "Getting Started",
    question: "What is MigRent AI and who is it for?",
    answer:
      "MigRent AI is an Australian rental marketplace built specifically for migrants, international students, and working professionals who are relocating to Australia. Whether you have just arrived in the country, you are planning your move from overseas, or you are a local property owner looking to rent out a room or property, MigRent connects you in a safe, verified environment.\n\nFor seekers (tenants), MigRent makes it easy to search for rooms and properties across Australia, communicate with verified hosts, complete bookings, and pay securely — all from one platform. For owners (hosts), MigRent provides the tools to list your property, verify your identity, manage booking requests, receive payments, and earn a Superhost badge.\n\nMigRent AI operates exclusively in Australia and all transactions are in Australian Dollars (AUD). The platform is available in eight languages to help migrants feel at home from day one.",
    keywords: ["what is migrent", "about", "who is it for", "migrent ai", "rental marketplace", "migrants", "students", "australia"],
  },
  {
    id: "gs-002",
    category: "Getting Started",
    question: "How does MigRent work for seekers (tenants)?",
    answer:
      "As a seeker, your journey on MigRent looks like this:\n\n1. Create your account — Sign up with Google or your email address. It takes less than a minute.\n2. Complete your profile — Add your name, a photo, a short bio, and any details that help hosts understand who you are.\n3. Verify your identity — Complete email, phone, and optional government ID verification. Verified seekers are more likely to have their booking requests accepted.\n4. Browse listings — Use filters such as price range, suburb, nearest train station, amenities, and verification badges to find the perfect room.\n5. Send a booking request — Once you find a listing you like, choose your dates and send a request to the host. You can include a personal message and any special requirements.\n6. Wait for the host to respond — Hosts have 48 hours to accept or decline. You will be notified by email and in your dashboard.\n7. Confirm and pay — If the host accepts, complete your payment through Stripe. Your funds are secure.\n8. Move in — Coordinate with your host for key handover and enjoy your new home.\n\nThroughout this process, you can communicate with hosts inside the platform, track your bookings in your dashboard, and contact our support team at any time.",
    keywords: ["how it works", "seeker", "tenant", "renter", "find room", "booking process", "journey"],
  },
  {
    id: "gs-003",
    category: "Getting Started",
    question: "How does MigRent work for owners (hosts)?",
    answer:
      "As a property owner or host, MigRent helps you find reliable tenants for your rooms or properties:\n\n1. Create your account — Sign up and switch to the owner role using the role switcher in the navigation.\n2. Complete verification — Verify your email, phone number, and government ID. Verified hosts receive a trust badge on their listings.\n3. Create a listing — Fill in your property details: type, number of rooms, bathrooms, amenities, pricing, photos, house rules, and availability.\n4. Set your pricing — Choose a weekly rate and optionally offer discounts for longer stays.\n5. Receive booking requests — When a seeker sends a request, you will be notified by email and in your dashboard. Review the seeker's profile and verification status.\n6. Accept or decline — You have 48 hours to respond. Accepted bookings move to confirmed status.\n7. Get paid — Payments are processed securely through Stripe and deposited directly into your nominated bank account.\n8. Earn your Superhost badge — Maintain great reviews, a high response rate, and verified status to unlock the Superhost badge, which boosts your listing's visibility.\n\nYou can manage everything from your owner dashboard, including editing listings, tracking payments, and communicating with tenants.",
    keywords: ["how it works", "owner", "host", "landlord", "rent out", "list property", "hosting"],
  },
  {
    id: "gs-004",
    category: "Getting Started",
    question: "What locations and currencies does MigRent support?",
    answer:
      "MigRent AI operates exclusively within Australia. You can find and list properties in every state and territory, including New South Wales, Victoria, Queensland, South Australia, Western Australia, Tasmania, the Northern Territory, and the Australian Capital Territory.\n\nAll prices, payments, and payouts on MigRent are in Australian Dollars (AUD). If you are paying with an international credit or debit card, your bank may apply its own currency conversion fee — this is separate from MigRent and depends on your bank's policies.\n\nWe currently do not support listings outside of Australia. If you are planning to move to Australia and want to secure housing before you arrive, you can create an account and make bookings from overseas — the platform is fully accessible internationally.",
    keywords: ["location", "australia", "currency", "AUD", "states", "where", "international", "overseas"],
  },
  {
    id: "gs-005",
    category: "Getting Started",
    question: "How do I create a MigRent account?",
    answer:
      "Creating a MigRent account is free and takes less than a minute. You have several options:\n\nGoogle sign-in — Click the \"Sign in with Google\" button on the login page. This uses your existing Google account for quick, secure access. No password needed.\n\nEmail sign-up — Enter your email address and create a password. You will receive a verification email to confirm your address.\n\nMagic link — Enter your email address and we will send you a one-time login link. Click the link in your email to sign in — no password required. The link expires after one hour.\n\nOnce you are signed in for the first time, you will be guided through a brief onboarding process where you can set your role (seeker or owner), upload a profile photo, and start exploring the platform.\n\nYou can use the same account as both a seeker and an owner — simply switch roles from the navigation menu at any time.",
    keywords: ["create account", "sign up", "register", "google login", "magic link", "email signup", "join"],
  },
  {
    id: "gs-006",
    category: "Getting Started",
    question: "How do I understand my dashboard?",
    answer:
      "Your dashboard is your central hub on MigRent. It looks different depending on whether you are using the seeker or owner role.\n\nSeeker dashboard — At a glance, you will see your active bookings, pending booking requests, recent messages from hosts, and any action items such as completing verification or leaving a review. You will also see quick links to search for listings and manage your profile.\n\nOwner dashboard — You will see your active listings, incoming booking requests that need your response, confirmed bookings, recent messages from seekers, and payment summaries. Action items such as completing verification or responding to a request are highlighted at the top.\n\nBoth dashboards show verification status badges (email verified, phone verified, ID verified, Superhost) and any notifications that need your attention. You can access your dashboard at any time by clicking the Dashboard link in the bottom navigation bar.\n\nIf you use both roles, switch between the seeker and owner dashboards using the role switcher in the navigation.",
    keywords: ["dashboard", "home", "overview", "seeker dashboard", "owner dashboard", "navigation"],
  },
  {
    id: "gs-007",
    category: "Getting Started",
    question: "What is the verification system on MigRent?",
    answer:
      "MigRent uses a multi-level verification system to build trust between seekers and owners:\n\nEmail verification — When you sign up, we send a confirmation email to verify your address. This is required for all users.\n\nPhone verification — You can add and verify your phone number via a one-time SMS code. This adds a phone-verified badge to your profile.\n\nGovernment ID verification — Upload a valid government-issued ID such as a passport, driver's licence, or national ID card. For migrants, we also accept visa grant notices and ImmiCards. Verification is typically reviewed within 24 to 48 hours.\n\nOptional paid verification badge — Owners can complete a premium verification process (AUD 99) that includes additional property checks. Seekers can complete an optional verification (AUD 19) for an enhanced trust badge. These are trust signals, not legal guarantees.\n\nSuperhost badge — Hosts who maintain high ratings, fast response times, and verified status can earn the Superhost badge, which makes their listings stand out.\n\nVerification helps both parties feel confident, but it is not a replacement for your own due diligence. Always inspect properties and communicate within the platform.",
    keywords: ["verification", "verify", "trust", "badge", "email verify", "phone verify", "ID verify", "superhost", "verified"],
  },

  // ════════════════════════════════════════════════════════════
  // SECTION 2 – ACCOUNT & PROFILE MANAGEMENT
  // ════════════════════════════════════════════════════════════

  {
    id: "ap-001",
    category: "Account & Profile",
    question: "How do I create an account on MigRent?",
    answer:
      "You can create a MigRent account in three ways:\n\nGoogle sign-in — On the login page, click the \"Sign in with Google\" button. Authorise MigRent to access your basic Google profile (name and email). You will be signed in immediately.\n\nEmail and password — Click \"Sign up with email\", enter your email address and choose a secure password. We will send you a verification email — click the link inside to activate your account.\n\nMagic link (passwordless) — Enter your email address and click \"Send magic link\". Check your inbox for an email with a one-time login link. Click it to sign in. The link expires after one hour.\n\nAll three methods create the same type of account. You can switch between login methods later if needed (for example, linking your Google account after initially signing up with email).\n\nAfter your first login, you will be prompted to complete a short onboarding form: choose your role (seeker or owner), add a profile photo, and fill in basic details like your name and a short bio.",
    keywords: ["create account", "sign up", "register", "google", "magic link", "email", "password", "new account"],
  },
  {
    id: "ap-002",
    category: "Account & Profile",
    question: "How do I log in and log out of MigRent?",
    answer:
      "Logging in — Go to the MigRent homepage and click \"Sign in\" in the top navigation bar. Choose your login method: Google, email and password, or magic link. If you previously signed in with Google, use the Google button again.\n\nLogging out — Click your profile icon in the top-right corner of the page, then click \"Logout\" from the dropdown menu. On mobile, open the navigation menu and tap \"Logout\" at the bottom.\n\nDevice security tips — If you are using a shared or public computer, always log out when you are finished. Avoid saving your password in the browser on shared devices. MigRent sessions expire automatically after a period of inactivity for your security.\n\nIf you are logged in on multiple devices, logging out on one device does not affect your sessions on other devices. If you suspect someone else has accessed your account, change your password immediately and contact our support team.",
    keywords: ["login", "log in", "sign in", "logout", "log out", "sign out", "session", "device"],
  },
  {
    id: "ap-003",
    category: "Account & Profile",
    question: "What should I do if I lose access to my account?",
    answer:
      "If you cannot sign in to your MigRent account, try these steps:\n\nForgot your password — On the login page, click \"Forgot password\" and enter your email address. We will send a password reset link to your inbox. Check your spam or junk folder if you do not see it within a few minutes.\n\nMagic link not arriving — If you requested a magic link but it has not arrived, check your spam folder, wait a few minutes, and try again. Make sure you are using the same email address you signed up with.\n\nGoogle login not working — Make sure you are selecting the correct Google account. If your Google account password has changed, sign in to Google first, then try MigRent again.\n\nAccount locked — After multiple failed login attempts, your account may be temporarily locked for security. Wait 15 minutes and try again.\n\nStill cannot access your account — Contact our support team through the floating support button on the website. Provide the email address you used to sign up, and we will help you regain access.",
    keywords: ["lost access", "cant login", "locked out", "forgot password", "account recovery", "reset", "help"],
  },
  {
    id: "ap-004",
    category: "Account & Profile",
    question: "How do I complete and edit my profile?",
    answer:
      "A complete profile helps hosts trust you (if you are a seeker) or helps seekers feel confident booking with you (if you are a host).\n\nTo edit your profile, click your profile icon in the top-right corner and select \"Profile\" from the menu. You can update the following:\n\nProfile photo — Upload a clear, friendly photo of yourself. Profiles with photos receive significantly more engagement.\n\nLegal name — Your full name as it appears on your identification documents. Changing this after ID verification will require re-verification.\n\nPreferred name — The name you would like others to call you. This is displayed on your public profile.\n\nBio — A short paragraph about yourself. Seekers might mention their study or work plans. Owners might describe their property and what kind of tenant they are looking for.\n\nMost useless skill — A fun conversation starter that appears on your profile. It helps break the ice with hosts or seekers.\n\nInterests — Select your hobbies and interests from the available options. These help with matching and give others a sense of who you are.\n\nAll changes are saved immediately and are visible to other users on the platform.",
    keywords: ["profile", "edit profile", "photo", "bio", "name", "interests", "complete profile", "update profile"],
  },
  {
    id: "ap-005",
    category: "Account & Profile",
    question: "How do I change my email address or login method?",
    answer:
      "Changing your email — Go to Settings and look for the Email section. Enter your new email address and click \"Update\". You will receive a verification email at your new address — click the link to confirm the change. Your old email will no longer work for logging in.\n\nSwitching from email/password to Google — If you originally signed up with email and want to switch to Google sign-in, make sure your Google account uses the same email address. Then simply click \"Sign in with Google\" on the login page.\n\nNote about passwords — If you signed up with Google or magic link, you do not have a MigRent password. You sign in using your Google account or by requesting a fresh magic link each time. If you would like to set a password, use the \"Forgot password\" flow to create one.\n\nImportant: Changing your email does not affect your bookings, reviews, or verification status. However, make sure you have access to your new email address, as all notifications will be sent there going forward.",
    keywords: ["change email", "update email", "login method", "switch google", "password", "email address"],
  },
  {
    id: "ap-006",
    category: "Account & Profile",
    question: "How do I manage language and region settings?",
    answer:
      "MigRent supports eight languages to make the platform accessible to migrants from around the world. To change your language:\n\n1. Look for the language dropdown in the top navigation bar (it shows a globe icon or the name of your current language).\n2. Click the dropdown and select your preferred language.\n3. The interface will update immediately — no need to refresh the page.\n\nAvailable languages include English, Simplified Chinese, Hindi, Arabic, Spanish, Korean, Vietnamese, and Japanese. Translations cover all navigation, buttons, labels, and help text across the platform.\n\nNote: User-generated content such as listing descriptions, messages, and reviews are displayed in the language they were written in. MigRent does not automatically translate user content.\n\nRegion settings are set to Australia by default, and all prices are displayed in AUD. There is no need to change your region setting as MigRent currently operates exclusively in Australia.",
    keywords: ["language", "translate", "chinese", "hindi", "arabic", "spanish", "korean", "vietnamese", "japanese", "region", "language settings"],
  },
  {
    id: "ap-007",
    category: "Account & Profile",
    question: "How do I manage my notification preferences?",
    answer:
      "MigRent sends you email notifications for important events. You can manage which notifications you receive by going to Settings and looking for the Notification Preferences section.\n\nTypes of notifications you can control:\n\nBooking notifications — Alerts when a booking request is received, accepted, declined, or cancelled.\n\nPayment notifications — Confirmations when a payment is processed, a refund is issued, or a payout is sent.\n\nVerification notifications — Updates when your verification status changes (approved, pending, or additional documents needed).\n\nSupport notifications — Updates on your support tickets, including agent responses and status changes.\n\nMarketing emails — Occasional newsletters, tips, and platform updates. You can opt out of these at any time.\n\nTo update your preferences, toggle each notification type on or off. Changes take effect immediately. We recommend keeping booking and payment notifications turned on to stay informed about important activity on your account.\n\nYou can also unsubscribe from marketing emails by clicking the \"Unsubscribe\" link at the bottom of any marketing email.",
    keywords: ["notifications", "email alerts", "preferences", "unsubscribe", "notification settings", "email notifications"],
  },
  {
    id: "ap-008",
    category: "Account & Profile",
    question: "How do I delete my MigRent account?",
    answer:
      "If you would like to delete your MigRent account, please be aware of the following before proceeding:\n\nBefore deletion — You must resolve any active bookings (complete or cancel them). Any pending payments or refunds must be settled. If you are a host, all your active listings will be unpublished and removed.\n\nWhat gets deleted — Your profile information, booking history, messages, reviews you have written, and saved listings will be permanently removed. Your verification documents are securely deleted.\n\nWhat is retained — Certain data may be retained for legal and regulatory purposes as required by Australian law (for example, transaction records for tax compliance). Reviews left by others about you may be anonymised but not deleted.\n\nHow to delete — Go to Settings, scroll to the bottom, and click \"Delete Account\". You will be asked to confirm your decision. Account deletion is permanent and cannot be undone.\n\nWe recommend downloading a copy of your data before deletion. You can request a data export by contacting our support team.\n\nIf you are experiencing issues with the platform, consider contacting support first — we may be able to help resolve your concerns without account deletion.",
    keywords: ["delete account", "remove account", "close account", "deactivate", "cancel account", "data deletion"],
  },

  // ════════════════════════════════════════════════════════════
  // SECTION 3 – LISTINGS & HOSTING
  // ════════════════════════════════════════════════════════════

  {
    id: "lh-001",
    category: "Listings & Hosting",
    question: "What are the requirements to list a property on MigRent?",
    answer:
      "To list a room or property on MigRent, you need to meet the following requirements:\n\nVerified account — Your email and phone number must be verified. Government ID verification is strongly recommended, as listings from verified hosts receive more visibility and booking requests.\n\nProperty eligibility — You must be the owner, tenant with subletting rights, or authorised property manager. MigRent does not verify ownership documents at this time, but misrepresenting your authority to rent a property is a violation of our terms and may result in account suspension.\n\nAustralian property — The property must be located in Australia. We do not support international listings.\n\nAccurate information — All listing details must be truthful and accurate, including photos, descriptions, pricing, and amenities. Misleading listings may be reported and removed.\n\nThere is no limit to the number of listings you can create. However, each listing must represent a unique room or property — duplicate listings are not allowed.",
    keywords: ["requirements", "eligibility", "list property", "who can list", "host requirements", "listing rules"],
  },
  {
    id: "lh-002",
    category: "Listings & Hosting",
    question: "How do I create my first listing on MigRent?",
    answer:
      "Creating a listing is a step-by-step process. Here is what you will fill in:\n\n1. Property type — Select whether your listing is a house, apartment, studio, unit, townhouse, or other type.\n2. Place type — Choose whether you are offering an entire place, a private room, or a shared room.\n3. Guest capacity — How many guests can the space accommodate.\n4. Bedrooms and bathrooms — Specify the number of each.\n5. Location — Enter the property address. This is kept private until a booking is confirmed; only the general suburb and distance to the nearest train station are shown publicly.\n6. Highlights and amenities — Select from options such as Wi-Fi, air conditioning, parking, laundry, furnished, kitchen access, and more.\n7. Title — Write a short, attention-grabbing title for your listing (for example, \"Sunny private room near Strathfield Station\").\n8. Description — Write a detailed description of the space, the neighbourhood, and what tenants can expect. Be specific and honest.\n9. Photos — Upload at least three high-quality photos. Include the bedroom, bathroom, common areas, and any outdoor spaces.\n10. Pricing — Set your weekly rate in AUD. You can also add discounts for longer stays.\n11. Availability — Set your start and end dates, minimum stay duration, and any blocked-out dates.\n12. Safety details — Indicate whether the property has smoke alarms, a fire extinguisher, a first aid kit, and other safety features.\n13. Who else lives there — Describe the household (for example, \"A young professional couple and a cat\").\n14. House rules — Specify rules around noise, guests, smoking, pets, and anything else tenants should know.\n\nReview your listing carefully before publishing. Once published, it will be visible to seekers immediately.",
    keywords: ["create listing", "new listing", "list room", "hosting form", "publish listing", "property details", "how to list"],
  },
  {
    id: "lh-003",
    category: "Listings & Hosting",
    question: "How does pricing work for hosts on MigRent?",
    answer:
      "MigRent uses weekly rates as the standard pricing model. Here is how pricing works:\n\nSetting your rate — When creating or editing a listing, enter your price per week in AUD. This is the amount seekers will see on your listing card.\n\nDiscounts — You can offer discounts for longer stays. For example, you might offer 5% off for stays of 4 weeks or more, or 10% off for stays of 12 weeks or more. Discounts are optional but can make your listing more attractive.\n\nPromotional pricing — You can temporarily reduce your rate to attract more bookings. Promotional rates are highlighted on your listing with a special badge.\n\nWhat is included — Be clear about what your weekly rate includes. Common inclusions are utilities (electricity, water, gas), internet, and access to shared spaces. If certain costs are extra, mention this clearly in your listing description.\n\nPricing tips — Research similar listings in your area to set a competitive rate. Properties near train stations, universities, and city centres typically command higher rates. Verified hosts and Superhosts can often charge a premium.\n\nYou can change your pricing at any time, but changes only apply to new bookings — existing confirmed bookings keep their original rate.",
    keywords: ["pricing", "weekly rate", "price", "discounts", "promotions", "how much to charge", "rent price"],
  },
  {
    id: "lh-004",
    category: "Listings & Hosting",
    question: "How do availability and the calendar work?",
    answer:
      "Your listing calendar controls when your property is available for bookings:\n\nStart and end dates — When creating a listing, set the date range during which the property is available. Seekers can only book within this range.\n\nMinimum stay — Set the minimum number of weeks a seeker must book. For example, a minimum stay of 4 weeks means seekers cannot book for less than one month.\n\nBlocked dates — If certain dates are unavailable (for example, you have a guest visiting or the property needs maintenance), block those dates on your calendar. Blocked dates are not visible to seekers and cannot be booked.\n\nAutomatic updates — When a booking is confirmed, the booked dates are automatically marked as unavailable on your calendar. You do not need to manually block them.\n\nUpdating availability — You can update your calendar at any time by going to your listing and clicking \"Edit availability\". Changes take effect immediately.\n\nTip: Keep your calendar up to date to avoid declining booking requests due to scheduling conflicts. A high decline rate can affect your Superhost eligibility.",
    keywords: ["availability", "calendar", "dates", "minimum stay", "blocked dates", "schedule", "available dates"],
  },
  {
    id: "lh-005",
    category: "Listings & Hosting",
    question: "How do I edit, pause, or delete a listing?",
    answer:
      "Managing your listings is straightforward:\n\nEditing — Go to your owner dashboard, find the listing you want to update, and click \"Edit\". You can change any detail including title, description, photos, pricing, amenities, house rules, and availability. Changes are saved and published immediately.\n\nPausing (unlisting) — If you need to temporarily take your listing offline without deleting it, click \"Pause listing\". Paused listings are hidden from search results and cannot receive new booking requests. Existing confirmed bookings are not affected. You can reactivate a paused listing at any time.\n\nDeleting — If you no longer want to offer the property on MigRent, you can delete the listing permanently. Go to the listing, click \"Edit\", scroll to the bottom, and click \"Delete listing\". You must first resolve any active bookings associated with the listing. Deleted listings cannot be recovered.\n\nNote: Pausing is recommended over deleting if you might want to relist the property in the future, as it preserves your listing details, photos, and reviews.",
    keywords: ["edit listing", "pause listing", "delete listing", "remove listing", "update listing", "unpublish", "deactivate listing"],
  },
  {
    id: "lh-006",
    category: "Listings & Hosting",
    question: "How do Superhost and Verified Host badges work?",
    answer:
      "MigRent offers two trust badges for hosts:\n\nVerified Host badge — This badge appears when you have completed all verification steps: email verification, phone verification, and government ID verification. It tells seekers that your identity has been confirmed. There is no fee for the standard verified badge.\n\nSuperhost badge — This is an elevated status for hosts who consistently deliver excellent experiences. To qualify for Superhost, you need to meet these criteria:\n• Maintain an average rating of 4.5 or above across all reviews\n• Respond to 90% or more of booking requests within 24 hours\n• Have completed at least 3 bookings in the past 12 months\n• Have zero cancellations initiated by you as a host\n• Have completed full identity verification\n\nSuperhost benefits include:\n• A prominent Superhost badge on your profile and listings\n• Higher placement in search results\n• Access to Superhost-only support priority\n• Increased trust from seekers, leading to more bookings\n\nSuperhost status is reviewed quarterly. If you fall below the criteria, the badge is removed until you meet the requirements again.",
    keywords: ["superhost", "verified host", "badge", "host badge", "trust badge", "superhost requirements", "how to become superhost"],
  },
  {
    id: "lh-007",
    category: "Listings & Hosting",
    question: "What are the best practices for listing photos and descriptions?",
    answer:
      "Great photos and descriptions significantly increase your booking rate. Here are our top tips:\n\nPhotos:\n• Use natural lighting — open curtains and blinds before taking photos\n• Take photos during the day for the best results\n• Include at least 5 photos: bedroom, bathroom, kitchen or common area, any outdoor space, and the building exterior\n• Show the space from multiple angles\n• Make sure the room is clean and tidy before photographing\n• Avoid heavy filters — seekers want to see what the space actually looks like\n• Include a photo of the view from the window if it is appealing\n• Show the distance or route to the nearest train station or bus stop if possible\n\nDescriptions:\n• Start with the most appealing feature (for example, \"Bright corner room with city views\")\n• Be specific about what is included: furniture, appliances, internet speed, parking\n• Mention nearby transport, shops, universities, and hospitals\n• Describe the household: who else lives there, any pets, the general atmosphere\n• Be honest about any limitations (for example, \"Shared bathroom with one other person\")\n• Use short paragraphs and bullet points for easy reading\n• Mention if the property is suitable for specific groups (for example, \"Great for international students attending UNSW\")",
    keywords: ["photos", "pictures", "description", "listing tips", "best practices", "good listing", "how to write listing"],
  },
  {
    id: "lh-008",
    category: "Listings & Hosting",
    question: "What house rules can I set for my listing?",
    answer:
      "House rules help set clear expectations for tenants. You can specify rules in your listing that cover:\n\nNoise — Quiet hours (for example, \"Please keep noise to a minimum after 10pm on weekdays\").\n\nGuests — Whether overnight guests are allowed, how many, and how often.\n\nSmoking — Whether smoking is permitted anywhere on the property.\n\nPets — Whether tenants can bring pets, and any restrictions on type or size.\n\nParking — Whether a parking space is included and any restrictions.\n\nShared spaces — Rules about kitchen use, laundry schedules, cleaning responsibilities for common areas.\n\nClean-up — Expectations for keeping the room and shared spaces clean.\n\nMove-out — What condition the room should be in when the tenant leaves.\n\nBe reasonable and specific. Overly restrictive rules may deter potential tenants. State your rules clearly in the listing description, and reiterate them in your message to the seeker after they send a booking request.\n\nViolation of house rules is grounds for raising a dispute through MigRent, but we are not able to enforce rules directly — disputes between hosts and tenants are resolved through communication and, if necessary, through your state's tenancy tribunal.",
    keywords: ["house rules", "rules", "noise", "guests", "smoking", "pets", "cleaning", "tenant rules"],
  },
  {
    id: "lh-009",
    category: "Listings & Hosting",
    question: "How do I handle booking requests from seekers?",
    answer:
      "When a seeker sends you a booking request, here is what to do:\n\n1. You will receive an email notification and a notification in your owner dashboard.\n2. Click on the request to view the seeker's profile, including their verification status, bio, and any message they sent.\n3. Review the requested dates and make sure they work with your availability.\n4. You have 48 hours to respond. After 48 hours, the request automatically expires.\n\nTo accept — Click \"Accept\" and the booking will be confirmed. The seeker will be charged and you will receive your payout according to the standard schedule.\n\nTo decline — Click \"Decline\" and optionally provide a reason. Declining does not penalise you, but a high decline rate may affect your Superhost status.\n\nTo message the seeker — Before deciding, you can send the seeker a message through the platform to ask questions or discuss details.\n\nTips for a smooth process:\n• Respond as quickly as possible — seekers often send requests to multiple listings\n• Review the seeker's verification status and reviews from previous hosts\n• If you are unsure about a seeker, ask them to complete additional verification before accepting",
    keywords: ["booking request", "accept booking", "decline booking", "respond to request", "incoming booking", "handle request"],
  },
  {
    id: "lh-010",
    category: "Listings & Hosting",
    question: "What should I do if I need to cancel as a host?",
    answer:
      "While we understand that situations arise, host cancellations can be very disruptive for seekers — especially migrants who may have limited housing options. Here is what to know:\n\nBefore the seeker moves in — If you need to cancel a confirmed booking before the seeker's move-in date, contact the seeker through the platform as soon as possible to explain the situation. Then go to the booking in your dashboard and click \"Cancel booking\". The seeker will receive a full refund.\n\nAfter the seeker moves in — If you need the seeker to leave during an active tenancy, you must follow the legal process in your state. This typically involves providing written notice with the required notice period (which varies by state, usually 60 to 90 days). You cannot force a seeker to leave immediately unless there is a serious breach of the tenancy agreement.\n\nConsequences of host cancellations:\n• Your Superhost status may be affected\n• Frequent cancellations may result in a warning or account review\n• The seeker may leave a negative review\n\nIf you are cancelling due to an emergency (natural disaster, property damage, personal crisis), contact our support team. We handle emergency cancellations on a case-by-case basis and may waive penalties.",
    keywords: ["cancel as host", "host cancellation", "cancel booking", "need to cancel", "emergency cancel"],
  },

  // ════════════════════════════════════════════════════════════
  // SECTION 4 – SEARCHING, MATCHING & BOOKING (SEEKERS)
  // ════════════════════════════════════════════════════════════

  {
    id: "sb-001",
    category: "Searching & Booking",
    question: "How do I search for rooms on MigRent?",
    answer:
      "MigRent offers a powerful search experience to help you find the perfect room:\n\nBasic search — Enter a suburb, city, or postcode in the search bar on the homepage. Results will show available listings in that area.\n\nFilters — Refine your results using filters including:\n• Price range (minimum and maximum weekly rate)\n• Property type (house, apartment, studio, etc.)\n• Room type (entire place, private room, shared room)\n• Number of bedrooms and bathrooms\n• Nearest train station\n• Amenities (Wi-Fi, parking, air conditioning, furnished, etc.)\n• Verification badges (Verified Host, Superhost)\n• Availability dates\n\nSorting — Sort results by price (low to high or high to low), distance from a landmark or station, newest listings, or highest rated.\n\nMap view — Switch to the map view to see listings on a map and understand their location relative to transport, shops, and other points of interest.\n\nSave searches — Save your search criteria to receive email notifications when new matching listings are published.\n\nTip: The more specific your filters, the more relevant your results will be. Start broad and narrow down as you explore.",
    keywords: ["search", "find room", "browse", "filters", "search listings", "find accommodation", "search filters"],
  },
  {
    id: "sb-002",
    category: "Searching & Booking",
    question: "How does the AI-powered matching work?",
    answer:
      "MigRent uses intelligent matching to help connect you with listings that are a great fit for your needs. Here is how it works at a high level:\n\nProfile-based recommendations — Based on the information in your profile (such as your preferred location, budget, and lifestyle preferences), MigRent suggests listings that align with your needs.\n\nSearch-based learning — As you search and interact with listings (viewing details, saving favourites, sending booking requests), MigRent learns your preferences and refines its recommendations over time.\n\nSmart sorting — When you search, results are ranked not just by price or date, but by a relevance score that considers how well each listing matches your stated and observed preferences.\n\nNew user recommendations — If you are new to MigRent and have not yet interacted with many listings, recommendations are based on popular listings in your selected area and listings that similar seekers have booked.\n\nImportant: The matching system is designed to surface relevant options, not to make decisions for you. Always review listings carefully, check reviews, and communicate with hosts before booking.",
    keywords: ["AI matching", "smart matching", "recommendations", "suggested listings", "algorithm", "for you", "recommended"],
  },
  {
    id: "sb-003",
    category: "Searching & Booking",
    question: "How do I read and understand listing cards?",
    answer:
      "Each listing card in search results contains key information to help you decide quickly:\n\nTitle and primary photo — The listing title and main image give you a first impression of the space.\n\nPrice — Displayed as a weekly rate in AUD (for example, \"$280/week\"). If a discount is active, you will see the original price crossed out with the discounted rate.\n\nLocation — The suburb name and distance to the nearest train station (for example, \"Strathfield · 5 min walk to station\").\n\nRatings and reviews — A star rating (out of 5) and the number of reviews from previous tenants. Listings with no reviews yet will show \"New listing\".\n\nVerification badges — Look for icons indicating:\n• Verified Host (blue checkmark) — the host has completed identity verification\n• Superhost (gold star) — the host meets all Superhost criteria\n• Verified Listing — the property has undergone additional verification\n\nRoom type — Whether it is an entire place, private room, or shared room.\n\nKey amenities — Quick icons showing highlights like Wi-Fi, parking, air conditioning, or \"furnished\".\n\nClick on any listing card to see the full details page with all photos, the complete description, house rules, the host's profile, reviews, and a booking request form.",
    keywords: ["listing card", "search results", "what does listing show", "badges", "rating", "reviews", "how to read listing"],
  },
  {
    id: "sb-004",
    category: "Searching & Booking",
    question: "How do I send a booking request?",
    answer:
      "Once you have found a listing you like, here is how to send a booking request:\n\n1. Open the listing — Click on the listing card to view the full details page.\n2. Check availability — Review the calendar to make sure the dates you want are available.\n3. Select your dates — Choose your move-in date and the length of your stay (in weeks).\n4. Add a personal message — Write a brief message to the host introducing yourself. Mention your situation (for example, \"I am an international student starting at UTS in March\"). A personal message significantly increases your chances of acceptance.\n5. Add special requests — If you have any specific needs (early check-in, extra keys, dietary requirements for shared kitchens), mention them here.\n6. Review the total — Check the price breakdown including the weekly rate, number of weeks, any discounts, and fees.\n7. Submit the request — Click \"Send booking request\". Your payment method will be authorised but you will not be charged until the host accepts.\n\nWhat happens next:\n• The host receives your request and has 48 hours to respond\n• You will be notified by email and in your dashboard when the host accepts or declines\n• If accepted, your payment is processed and the booking is confirmed\n• If declined or expired (no response in 48 hours), no charge is made",
    keywords: ["booking request", "send request", "book room", "how to book", "reserve", "request booking", "apply"],
  },
  {
    id: "sb-005",
    category: "Searching & Booking",
    question: "What happens after I send a booking request?",
    answer:
      "After you submit a booking request, the process works as follows:\n\nPending status — Your request is now \"Pending\" and visible in your seeker dashboard under \"My Bookings\". The host has been notified by email and in their dashboard.\n\nHost review — The host reviews your profile, verification status, and any message you included. They may send you a message through the platform to ask questions.\n\n48-hour window — The host has 48 hours to respond. During this time:\n• Your payment method is authorised (a temporary hold) but not charged\n• You can still browse other listings, but avoid sending multiple requests for the same dates\n• You can cancel your pending request at any time with no charge\n\nIf accepted — Your booking is confirmed, your payment is processed, and you will receive a confirmation email with the host's contact details and next steps for move-in.\n\nIf declined — You will be notified and the payment hold is released. You can send a new request to a different listing.\n\nIf expired (no response) — After 48 hours, the request expires automatically, the hold is released, and you will be notified. Consider messaging hosts before booking to gauge their responsiveness.",
    keywords: ["after booking", "pending", "accepted", "declined", "expired", "booking status", "waiting", "host response"],
  },
  {
    id: "sb-006",
    category: "Searching & Booking",
    question: "What is the difference between Instant Booking and request-to-book?",
    answer:
      "MigRent supports two booking modes:\n\nRequest-to-book (standard) — You send a booking request and wait for the host to accept or decline within 48 hours. This is the most common mode and gives hosts the opportunity to review your profile before confirming.\n\nInstant Booking — Some hosts enable Instant Booking on their listings. When you book an Instant Booking listing, the booking is confirmed immediately — no waiting for host approval. Your payment is processed straight away.\n\nHow to identify Instant Booking listings — Look for the lightning bolt icon or \"Instant Book\" badge on the listing card and details page.\n\nWhen to use Instant Booking — This is particularly useful if you are arriving in Australia soon and need to secure housing quickly, or if you want to avoid the uncertainty of waiting for host approval.\n\nNote for hosts — You can enable Instant Booking in your listing settings. You are still notified of all bookings and can message the seeker. However, once confirmed, cancellations follow the standard host cancellation policy.",
    keywords: ["instant booking", "instant book", "request to book", "booking types", "quick booking", "lightning bolt"],
  },
  {
    id: "sb-007",
    category: "Searching & Booking",
    question: "How do I communicate with hosts safely?",
    answer:
      "MigRent provides an in-platform messaging system to keep your communications safe and documented:\n\nSending messages — You can message a host from their listing page (click \"Message host\") or from an active booking in your dashboard.\n\nSafety guidelines:\n• Always communicate through MigRent — messages within the platform are documented and can be referenced if a dispute arises\n• Never share personal financial information (bank details, credit card numbers) in messages\n• Be cautious if a host asks you to communicate outside the platform (WhatsApp, email, etc.) — this is not recommended as off-platform communication is not protected\n• Never agree to pay outside of MigRent's payment system\n• If a host asks for cash payments, deposits outside the platform, or pressures you to make quick decisions, report the conversation to our support team\n\nResponse expectations:\n• Most hosts respond within a few hours during business hours\n• If a host has not responded within 24 hours, consider messaging another host or sending a follow-up message\n• Check the host's response rate on their profile — Superhosts maintain a 90%+ response rate\n\nAll messages are stored securely and accessible from your dashboard.",
    keywords: ["message host", "communication", "chat", "safe messaging", "contact host", "in-app messaging"],
  },
  {
    id: "sb-008",
    category: "Searching & Booking",
    question: "How do I cancel a booking request or confirmed booking?",
    answer:
      "Cancellation policies depend on the status of your booking:\n\nCancelling a pending request — If the host has not yet responded, you can cancel your pending request at any time with no charge. Go to My Bookings, select the request, and click \"Cancel request\". The payment hold is released immediately.\n\nCancelling a confirmed booking before move-in — Cancellation fees depend on how far in advance you cancel:\n• 7 or more days before move-in: Full refund\n• Less than 7 days before move-in: Subject to the host's cancellation policy (may be partial refund or no refund on advance rent)\n• The bond is always fully refunded for pre-move-in cancellations\n\nCancelling during an active tenancy — If you need to leave early, provide the host with the notice period specified in your tenancy agreement (typically 14 to 28 days). Refunds for the remaining period depend on the agreement terms.\n\nHow to cancel — Go to My Bookings, select the booking, and click \"Cancel booking\". Follow the prompts to confirm. You will see the refund amount (if applicable) before confirming.\n\nNote: Refunds are processed within 5 to 7 business days to your original payment method.",
    keywords: ["cancel booking", "cancellation", "cancel request", "refund", "cancel policy", "cancel before", "leave early"],
  },

  // ════════════════════════════════════════════════════════════
  // SECTION 5 – PAYMENTS, PRICING & FEES
  // ════════════════════════════════════════════════════════════

  {
    id: "pp-001",
    category: "Payments & Pricing",
    question: "How do payments work on MigRent?",
    answer:
      "MigRent processes all payments securely through Stripe, a globally trusted payment processor. Here is how the payment flow works:\n\nFor seekers (tenants):\n• When you send a booking request, your payment method is authorised (a temporary hold is placed, but you are not charged)\n• When the host accepts your request, the payment is processed\n• For ongoing rent payments, you can set up automatic weekly or fortnightly payments\n• All transactions are in Australian Dollars (AUD)\n\nFor owners (hosts):\n• When a booking is confirmed and payment is processed, the funds are held briefly for security\n• Payouts are deposited into your nominated Australian bank account\n• You can track all payments and payouts in your owner dashboard\n\nPayment security:\n• All payment data is encrypted using bank-grade security (Stripe PCI Level 1)\n• MigRent never stores your full credit card number — this is handled entirely by Stripe\n• You will receive email confirmations for every transaction\n\nAccepted payment methods include Visa, Mastercard, and other major credit and debit cards. MigRent does not accept cash, cryptocurrency, or direct bank transfers for bookings.",
    keywords: ["payments", "how payments work", "stripe", "pay", "payment process", "secure payment", "payment security"],
  },
  {
    id: "pp-002",
    category: "Payments & Pricing",
    question: "What fees does MigRent charge?",
    answer:
      "MigRent charges the following fees:\n\nFor owners (hosts):\n• Listing and verification fee: AUD 99 — This is a one-time fee that covers enhanced verification and listing review. It helps ensure the quality and trustworthiness of listings on the platform. This fee does not guarantee bookings.\n\nFor seekers (tenants):\n• Optional verification fee: AUD 19 — Seekers can choose to complete an enhanced verification for a small fee. This adds a premium verified badge to your profile, signaling extra trustworthiness to hosts. This is entirely optional and is a trust signal, not a legal guarantee of any kind.\n\nImportant notes about fees:\n• These fees are separate from rent payments\n• They are non-refundable once the verification process begins\n• They do not constitute insurance, legal protection, or any form of guarantee\n• Standard booking and rent payments do not incur additional platform fees at this time (this may change in the future and will be clearly communicated)\n\nIf you are paying with an international card, your bank may apply its own currency conversion or foreign transaction fee. This is between you and your bank — MigRent does not control or receive any portion of these fees.",
    keywords: ["fees", "charges", "cost", "listing fee", "verification fee", "platform fee", "AUD 99", "AUD 19", "how much"],
  },
  {
    id: "pp-003",
    category: "Payments & Pricing",
    question: "When am I charged and when do hosts get paid?",
    answer:
      "Here is the timeline for payments:\n\nWhen seekers are charged:\n• When you send a booking request: Your payment method is authorised (temporary hold), but you are not charged yet\n• When the host accepts: The payment is processed and your card is charged\n• If the host declines or does not respond within 48 hours: The hold is released and you are not charged\n\nWhen hosts receive payouts:\n• After a booking is confirmed and payment is processed, funds are held briefly\n• Payouts are typically deposited into the host's bank account within 3 to 7 business days\n• For ongoing rent payments, payouts follow the same timeline after each payment is processed\n\nRecurring payments:\n• If you have set up automatic rent payments, you will be charged on the same day each week or fortnight\n• You will receive a notification 2 days before each automatic payment\n• A receipt is sent by email after each payment\n\nFailed payments:\n• If a payment fails (for example, due to an expired card or insufficient funds), you will be notified immediately\n• You will have a short grace period to update your payment method and retry\n• Continued payment failures may result in your booking being flagged",
    keywords: ["when charged", "when paid", "payout", "payment timeline", "host payout", "payment schedule", "charged when"],
  },
  {
    id: "pp-004",
    category: "Payments & Pricing",
    question: "How do refunds and cancellations work?",
    answer:
      "Refund eligibility depends on the timing and circumstances of the cancellation:\n\nCancellations before host acceptance:\n• If you cancel a pending request before the host responds, no charge is made and any hold is released immediately.\n\nCancellations after confirmation but before move-in:\n• 7 or more days before move-in: Full refund of any advance rent paid\n• Less than 7 days before move-in: Refund depends on the host's cancellation policy, which is displayed on the listing page. Partial refunds or no refund may apply.\n• Bond: Always fully refunded for pre-move-in cancellations.\n\nCancellations during an active tenancy:\n• Refunds for the remaining period depend on the terms of your tenancy agreement and state laws.\n\nRefund processing times:\n• Credit and debit cards: 5 to 7 business days\n• Bank transfers: 3 to 5 business days\n• Refunds are returned to the original payment method\n\nHow to request a refund — Go to My Bookings, select the booking, and click \"Cancel booking\". The refund amount (if applicable) is displayed before you confirm. For disputes or special circumstances, contact our support team.\n\nNote: MigRent's verification fees (AUD 99 for hosts, AUD 19 for seekers) are non-refundable once the verification process has begun.",
    keywords: ["refund", "cancellation refund", "money back", "refund policy", "get refund", "refund time", "cancel refund"],
  },
  {
    id: "pp-005",
    category: "Payments & Pricing",
    question: "What about currency and exchange rates for international cards?",
    answer:
      "All prices on MigRent are in Australian Dollars (AUD). If you are paying with a credit or debit card issued outside Australia:\n\nCurrency conversion — Your bank will convert the AUD amount to your home currency at the exchange rate they set. This rate may differ slightly from the mid-market rate.\n\nForeign transaction fees — Many banks charge a foreign transaction fee (typically 1% to 3%) on international purchases. Check with your bank for their specific fees.\n\nMigRent does not charge any additional fees for international card payments. The price you see on MigRent is the amount in AUD that is charged to your card.\n\nTips for international payments:\n• Consider opening an Australian bank account after arriving — many banks allow you to open an account online before arrival\n• Using an Australian card eliminates foreign transaction fees entirely\n• Some international banks offer travel-friendly cards with low or no foreign transaction fees\n• Keep track of exchange rate fluctuations, especially if you are paying rent over several months\n\nIf you see an unexpected amount on your bank statement, the difference is likely due to your bank's exchange rate and fees, not a MigRent charge.",
    keywords: ["currency", "exchange rate", "international card", "foreign transaction", "overseas payment", "AUD", "conversion"],
  },
  {
    id: "pp-006",
    category: "Payments & Pricing",
    question: "What should I do if my payment fails or my card is charged twice?",
    answer:
      "Payment failed:\n• You will receive an immediate notification if a payment fails\n• Common reasons: expired card, insufficient funds, card frozen by your bank, or incorrect card details\n• Go to Settings and update your payment method, then retry the payment\n• If the payment was for rent, you have a grace period to resolve the issue before late fees apply\n• Contact your bank if payments continue to fail — they may be blocking international or online transactions\n\nCharged twice:\n• In rare cases, a temporary hold (authorisation) and the actual charge may appear separately on your statement, making it look like a double charge\n• Temporary holds are automatically released within a few business days\n• If after 7 business days you still see a duplicate charge, contact our support team with your booking reference and a screenshot of the charges\n• We will investigate and issue a refund for any genuine duplicate charge within 3 to 5 business days\n\nTip: If you are unsure whether a charge is correct, check the payment history in your MigRent dashboard (go to Payments) — it shows all transactions with amounts, dates, and statuses.",
    keywords: ["payment failed", "card declined", "charged twice", "double charge", "payment error", "card not working", "failed payment"],
  },
  {
    id: "pp-007",
    category: "Payments & Pricing",
    question: "Where can I find my receipts and invoices?",
    answer:
      "All your payment receipts and invoices are available in your MigRent dashboard:\n\n1. Click on \"Payments\" in the navigation menu.\n2. You will see a list of all your transactions, including booking payments, rent payments, refunds, and fees.\n3. Click on any transaction to view the full details, including the amount, date, payment method, and booking reference.\n4. Click \"Download receipt\" to save a PDF copy for your records.\n\nEmail receipts — You also receive an email receipt for every payment. Check your inbox (and spam folder) for emails from MigRent.\n\nFor tax purposes — If you are a host, your payout history can be used for tax reporting. We recommend consulting an accountant for advice on rental income tax obligations in Australia.\n\nIf you cannot find a specific receipt or need a custom invoice, contact our support team with the transaction details and we will provide it within 1 to 2 business days.",
    keywords: ["receipt", "invoice", "payment history", "transaction history", "download receipt", "tax", "records"],
  },

  // ════════════════════════════════════════════════════════════
  // SECTION 6 – VERIFICATION, SAFETY & TRUST
  // ════════════════════════════════════════════════════════════

  {
    id: "vs-001",
    category: "Verification & Safety",
    question: "Why does MigRent have a verification system?",
    answer:
      "Verification exists to build trust between seekers and hosts. Renting a room to or from a stranger requires a baseline level of trust, and our verification system provides that foundation.\n\nFor seekers — Verification shows hosts that you are a real person with a confirmed identity. Verified seekers are significantly more likely to have their booking requests accepted, especially by Superhosts.\n\nFor hosts — Verification tells seekers that you are who you say you are and that your listing is legitimate. Verified hosts receive more visibility in search results and more booking requests.\n\nWhat verification is:\n• A trust-building measure that confirms identity through email, phone, and government ID\n• A signal to other users that you have taken steps to verify your identity\n\nWhat verification is NOT:\n• It is not a background check\n• It is not a guarantee of behaviour, honesty, or financial reliability\n• It is not a replacement for your own due diligence\n• It does not constitute legal advice or a legal guarantee of any kind\n\nWe strongly encourage all users to complete verification, but also to exercise their own judgment when booking or accepting bookings.",
    keywords: ["why verify", "verification purpose", "trust", "safety", "why verification", "identity check"],
  },
  {
    id: "vs-002",
    category: "Verification & Safety",
    question: "How do I complete each verification step?",
    answer:
      "MigRent offers multiple levels of verification:\n\nEmail verification:\n• This happens automatically when you sign up\n• If you signed up with Google, your email is verified instantly\n• If you signed up with email, click the verification link sent to your inbox\n• Status: A checkmark appears next to your email in Settings\n\nPhone verification:\n• Go to Settings and enter your mobile phone number\n• Click \"Send verification code\"\n• Enter the 6-digit code sent to your phone via SMS\n• Australian and international mobile numbers are accepted\n• Status: A checkmark appears next to your phone number in Settings\n\nGovernment ID verification:\n• Go to Settings and find the ID Verification section\n• Upload a clear photo or scan of your government-issued ID\n• Accepted documents: passport, Australian driver's licence, national ID card, visa grant notice, ImmiCard\n• Make sure the photo is clear, well-lit, and shows all four corners of the document\n• Verification is typically reviewed within 24 to 48 hours\n• You will receive an email when your verification is approved or if additional documents are needed\n\nOptional paid verification:\n• Hosts: AUD 99 for enhanced listing and identity verification\n• Seekers: AUD 19 for a premium verified badge\n• These are optional trust signals, not legal guarantees",
    keywords: ["how to verify", "verification steps", "email verify", "phone verify", "ID verify", "upload ID", "verification process"],
  },
  {
    id: "vs-003",
    category: "Verification & Safety",
    question: "What happens if my verification fails or is pending?",
    answer:
      "Verification pending:\n• Government ID verification typically takes 24 to 48 hours to review\n• During this time, your profile will show a \"Verification pending\" badge\n• You can still use the platform (browse listings, send messages) while verification is in progress\n• You may not be able to send booking requests or create listings until email and phone verification are complete\n\nVerification rejected:\n• If your ID verification is rejected, you will receive an email explaining the reason\n• Common reasons for rejection:\n  - The photo is blurry, cut off, or too dark\n  - The document is expired\n  - The document type is not accepted\n  - The name on the document does not match your profile name\n• You can resubmit with a corrected document — there is no limit on attempts\n\nWhat to do:\n• Read the rejection email carefully for specific instructions\n• Take a new, clear photo of your document in good lighting\n• Make sure your profile name matches the name on your ID exactly\n• If you believe the rejection was an error, contact our support team\n\nNote: Verification fees are non-refundable even if verification fails, as the review process has been completed.",
    keywords: ["verification failed", "verification pending", "rejected", "ID rejected", "verification status", "resubmit"],
  },
  {
    id: "vs-004",
    category: "Verification & Safety",
    question: "How do safety checks on listings and reviews work?",
    answer:
      "MigRent employs several measures to maintain listing quality and review integrity:\n\nListing safety checks:\n• All new listings are reviewed before being published to ensure they meet our basic quality standards\n• Listings must include accurate descriptions, real photos, and reasonable pricing\n• Listings that appear fraudulent, misleading, or incomplete may be flagged for review or removed\n• Users can report suspicious listings at any time using the \"Report\" button on the listing page\n\nReview system:\n• After a booking is completed, both the seeker and host can leave a review\n• Reviews include a star rating (1 to 5) and written feedback\n• Reviews are published after both parties have submitted theirs (or after 14 days, whichever comes first)\n• Reviews cannot be edited after publication\n• MigRent does not remove reviews unless they violate our content policy (contain hate speech, threats, or personal information)\n\nFraud detection:\n• We monitor for patterns that suggest fraudulent activity (fake reviews, listing manipulation, payment fraud)\n• Users who violate our terms may have their accounts suspended or permanently banned\n• If you suspect fraud, report it immediately — do not engage further with the suspicious user",
    keywords: ["listing safety", "review system", "fraud detection", "report listing", "fake review", "quality checks", "safety checks"],
  },
  {
    id: "vs-005",
    category: "Verification & Safety",
    question: "What guidance is there for in-person meetings, inspections, and key handover?",
    answer:
      "Meeting hosts or seekers in person is an important step. Here is how to stay safe:\n\nBefore the meeting:\n• Communicate through MigRent's messaging system so there is a record of all arrangements\n• Let someone you trust know where you are going and when\n• If possible, bring a friend to the inspection\n• Confirm the host's identity by checking their verification badges on the platform\n\nDuring property inspections:\n• Visit during daylight hours\n• Check that the property matches the listing photos and description\n• Test essential features: locks, lights, water, heating and cooling, internet\n• Take photos or video for your records\n• Ask about anything not covered in the listing (parking, storage, laundry access)\n• If anything feels wrong or the property is significantly different from the listing, do not proceed with the booking\n\nKey handover:\n• Agree on a specific date, time, and method for key collection\n• Count and document all keys received\n• Test all keys to make sure they work\n• Confirm emergency contacts for the property\n\nRed flags to watch for:\n• The host will not show the property before you commit\n• The host asks for cash or payment outside MigRent\n• The property address does not match what was listed\n• The host is evasive about who else lives in the property",
    keywords: ["inspection", "in person", "meeting", "keys", "key handover", "property inspection", "visit", "view property"],
  },
  {
    id: "vs-006",
    category: "Verification & Safety",
    question: "How do I report a safety concern or suspicious activity?",
    answer:
      "If you encounter something concerning on MigRent, here is how to report it:\n\nReport a listing — On the listing page, click the \"Report\" button (usually a flag icon). Select the reason for your report (suspected scam, inaccurate listing, safety concern, offensive content) and provide details. Our Trust and Safety team reviews all reports within 24 hours.\n\nReport a user — Go to the user's profile and click the \"Report\" button. Describe your concern and include screenshots if possible.\n\nReport a message — If you receive a threatening, abusive, or suspicious message, click the report icon within the conversation thread.\n\nContact support directly — Use the floating support button on any page to submit a support ticket. Choose \"Trust and Safety\" as the category for priority handling.\n\nFor emergencies — If you are in immediate danger, call 000 (Triple Zero) for police, fire, or ambulance. Do not rely on MigRent for emergency situations.\n\nAfter reporting:\n• You will receive a confirmation that your report has been received\n• Our team investigates and may take action including issuing warnings, suspending accounts, or removing content\n• We may contact you for additional information\n• Reports are confidential — the reported user will not see who made the report",
    keywords: ["report", "safety concern", "suspicious", "report user", "report listing", "trust safety", "flag", "concern"],
  },
  {
    id: "vs-007",
    category: "Verification & Safety",
    question: "What does MigRent NOT do?",
    answer:
      "It is important to understand the boundaries of what MigRent provides:\n\nMigRent does NOT:\n• Provide legal advice — We are not lawyers and cannot advise you on tenancy law, visa conditions, or legal disputes. If you need legal help, contact a tenancy advice service in your state or a migration lawyer.\n• Provide immigration advice — We do not give visa or immigration guidance. Contact the Department of Home Affairs or a registered migration agent for immigration matters.\n• Guarantee the quality of properties — While we review listings and verify hosts, we cannot physically inspect every property. Always inspect before committing.\n• Guarantee tenant or host behaviour — Verification confirms identity, not character. Exercise your own judgment.\n• Act as a property manager — MigRent is a marketplace that connects seekers and hosts. Day-to-day property management and dispute resolution between tenants and landlords are handled by the parties involved.\n• Provide insurance — MigRent does not offer rental insurance, contents insurance, or liability insurance. Consider obtaining your own coverage.\n• Enforce house rules — While house rules are part of the listing, enforcement is the host's responsibility. Disputes should be resolved through communication or your state's tribunal.\n\nMigRent IS:\n• A marketplace platform that connects renters with hosts\n• A secure payment processor\n• A verification and trust-building system\n• A communication platform with messaging and support\n• A resource for finding housing in Australia as a migrant",
    keywords: ["what migrent doesnt do", "limitations", "not legal advice", "not insurance", "not guarantee", "disclaimer"],
  },
  {
    id: "vs-008",
    category: "Verification & Safety",
    question: "Safety checklist for seekers",
    answer:
      "Use this checklist before and during your rental journey:\n\nBefore booking:\n• Complete all verification steps (email, phone, ID) to build your trust profile\n• Only communicate through MigRent's messaging system\n• Never send money outside of MigRent's payment system\n• Research the suburb: check public transport, safety ratings, and amenities\n• Read all reviews from previous tenants\n• Check the host's verification status and response rate\n\nBefore moving in:\n• Inspect the property in person or via video call\n• Compare the property to the listing photos and description\n• Test locks, lights, water, and internet\n• Take dated photos of every room for your records\n• Confirm the move-in date, time, and key collection method with the host\n• Read and understand the house rules and your tenancy agreement\n\nDuring your stay:\n• Keep paying rent through MigRent — never switch to cash or direct transfer\n• Document any issues with photos and report them to the host in writing through MigRent\n• Know your rights as a tenant in your state\n• Keep emergency numbers handy: 000 (police/fire/ambulance), your host's number, and your country's consulate\n\nWhen moving out:\n• Give proper notice as required by your agreement\n• Clean the property to the standard it was in when you moved in\n• Take dated photos after cleaning for bond return evidence\n• Return all keys and confirm with the host",
    keywords: ["safety checklist", "seeker safety", "tenant safety", "checklist", "before booking", "move in checklist"],
  },
  {
    id: "vs-009",
    category: "Verification & Safety",
    question: "Safety checklist for owners (hosts)",
    answer:
      "Use this checklist to protect yourself and provide a great experience:\n\nBefore listing:\n• Complete all verification steps to earn your Verified Host badge\n• Take honest, accurate photos of the property as it currently looks\n• Write a thorough description including any limitations or quirks\n• Set clear, reasonable house rules\n• Make sure the property complies with local safety regulations (smoke alarms, locks, fire extinguisher)\n• Check your insurance covers short-term or medium-term tenants\n\nWhen receiving booking requests:\n• Review the seeker's profile, verification status, and reviews\n• Message the seeker to learn more about their situation and needs\n• Respond to requests within 24 hours to maintain your response rate\n• Trust your instincts — if something feels off, it is okay to decline\n\nDuring a tenancy:\n• Provide proper notice before entering the property (24 to 48 hours, depending on your state)\n• Address maintenance requests promptly\n• Keep all communication through MigRent for documentation\n• Be responsive and professional\n\nAt the end of a tenancy:\n• Schedule a final inspection with the tenant present if possible\n• Compare the property condition to the move-in photos\n• Process the bond return promptly if there are no issues\n• Leave an honest review for the tenant\n• If there are damages, document them with photos and communicate through MigRent before making a bond claim",
    keywords: ["owner safety", "host checklist", "host safety", "landlord checklist", "protect yourself", "hosting safety"],
  },

  // ════════════════════════════════════════════════════════════
  // SECTION 7 – DASHBOARD, SETTINGS & NAVIGATION
  // ════════════════════════════════════════════════════════════

  {
    id: "ds-001",
    category: "Dashboard & Settings",
    question: "How do the owner and seeker dashboards differ?",
    answer:
      "MigRent provides a tailored dashboard experience depending on your active role:\n\nSeeker (tenant) dashboard:\n• Active bookings — See your current and upcoming rentals with move-in dates and payment status\n• Pending requests — Track booking requests you have sent that are waiting for host responses\n• Recent messages — Quick access to conversations with hosts\n• Action items — Reminders like \"Complete phone verification\" or \"Leave a review for your recent stay\"\n• Quick links — Search for listings, view saved favourites, manage your profile\n\nOwner (host) dashboard:\n• Active listings — Overview of all your published and paused listings with views and booking counts\n• Incoming requests — Booking requests from seekers that need your response (with the 48-hour countdown)\n• Confirmed bookings — Current tenants with payment tracking\n• Payment summary — Recent payouts and upcoming payments\n• Action items — Reminders like \"Respond to booking request\" or \"Update your listing calendar\"\n\nSwitching roles — If you use both roles, click the role switcher in the navigation to toggle between the seeker and owner dashboards. Your data, bookings, and listings are all tied to the same account.\n\nBoth dashboards prominently display your verification status badges so you can see at a glance which verification steps you have completed.",
    keywords: ["dashboard", "owner dashboard", "seeker dashboard", "role switcher", "my dashboard", "homepage"],
  },
  {
    id: "ds-002",
    category: "Dashboard & Settings",
    question: "How do I navigate the MigRent platform?",
    answer:
      "MigRent uses a clean, simple navigation structure:\n\nTop navigation bar:\n• MigRent logo — Click to go to the homepage\n• Search — Access the search and browse functionality\n• Language selector — Change the platform language (8 languages available)\n• Profile icon — Access your profile, settings, and logout\n\nBottom navigation (on dashboard pages):\n• Dashboard — Your central hub with bookings, requests, and action items\n• Listings — Browse listings (seekers) or manage your listings (hosts)\n• Profile — View and edit your public profile\n• Payments — View payment history, receipts, and payout details\n• Support — Access help articles and submit support tickets\n• Help — Browse the Help Center for guides and FAQs\n• Settings — Manage account settings, verification, and preferences\n• Logout — Sign out of your account\n\nFloating support button — The red circle in the bottom-right corner of every page opens the support widget where you can chat with our AI assistant or submit a support ticket.\n\nMobile navigation — On smaller screens, the navigation collapses into a hamburger menu. Tap the menu icon to access all navigation options.",
    keywords: ["navigation", "menu", "bottom nav", "top bar", "how to navigate", "find", "where is"],
  },
  {
    id: "ds-003",
    category: "Dashboard & Settings",
    question: "What settings can I manage on MigRent?",
    answer:
      "Your Settings page allows you to manage everything about your account:\n\nAccount settings:\n• Email address — Update your email (requires re-verification)\n• Password — Change your password (if you use email login)\n• Phone number — Add or update your phone number and verify via SMS\n\nProfile settings:\n• Legal name, preferred name, bio, photo, interests\n• Residential address — Your private address (not shown publicly)\n• Nearest train station — Helps with location-based features\n\nVerification:\n• View your verification status for email, phone, and government ID\n• Upload or re-upload verification documents\n• Purchase optional enhanced verification (AUD 99 for hosts, AUD 19 for seekers)\n\nNotification preferences:\n• Toggle email notifications for bookings, payments, verification updates, support tickets, and marketing\n\nLanguage:\n• Set your preferred interface language\n\nPayment methods:\n• Add, update, or remove credit and debit cards\n• Set your default payment method\n• For hosts: add or update your bank account for payouts\n\nAccount actions:\n• Download your data\n• Delete your account\n\nAll settings changes are saved immediately.",
    keywords: ["settings", "account settings", "manage account", "preferences", "configuration", "phone", "address", "station"],
  },
  {
    id: "ds-004",
    category: "Dashboard & Settings",
    question: "What do the status badges in my dashboard mean?",
    answer:
      "Your dashboard displays several badges and status indicators:\n\nVerification badges:\n• Email verified (checkmark) — Your email address has been confirmed\n• Phone verified (phone icon) — Your phone number has been verified via SMS\n• ID verified (shield icon) — Your government ID has been reviewed and approved\n• Superhost (gold star) — You meet all Superhost criteria (hosts only)\n• Premium verified (blue badge) — You have completed the optional paid verification\n\nBooking status indicators:\n• Pending (yellow) — A booking request is waiting for a response\n• Confirmed (green) — The booking has been accepted and payment processed\n• Active (blue) — The tenancy is currently in progress\n• Completed (grey) — The tenancy has ended\n• Cancelled (red) — The booking was cancelled by either party\n• Expired (grey, strikethrough) — The host did not respond within 48 hours\n\nPayment status:\n• Paid (green) — Payment has been processed successfully\n• Pending (yellow) — Payment is being processed\n• Failed (red) — Payment could not be processed\n• Refunded (blue) — A refund has been issued\n\nAction items:\n• Red dot or number badge — Indicates items that need your attention (unread messages, pending requests, incomplete verification)",
    keywords: ["badges", "status", "indicators", "what does badge mean", "colours", "pending", "confirmed", "verified badge"],
  },
  {
    id: "ds-005",
    category: "Dashboard & Settings",
    question: "How do I access support from my dashboard?",
    answer:
      "There are several ways to get help while using MigRent:\n\nFloating support widget — The red circle in the bottom-right corner of every page is your quickest access to support. Click it to:\n• Chat with our AI assistant for instant answers to common questions\n• Submit a support ticket for issues that need human attention\n\nHelp Center — Click \"Help\" in the navigation to browse our comprehensive library of help articles, guides, and FAQs. You can search by keyword or browse by category.\n\nSupport tickets — Go to the Support section in your navigation to:\n• View your ticket history and check the status of open tickets\n• Submit a new support ticket with details about your issue\n• Reply to messages from our support team\n\nEmail support — You can email us directly at support@migrent.ai for any issue. Include your account email and a description of the problem.\n\nResponse times:\n• AI assistant: Instant responses 24/7\n• Support tickets: Typically within 24 hours\n• Email: Within 24 to 48 hours\n\nWhen contacting support, provide as much detail as possible: your account email, the booking or listing in question, screenshots of any errors, and the steps you took before the issue occurred. This helps us resolve your issue faster.",
    keywords: ["support", "help", "contact support", "get help", "support ticket", "customer service", "help center"],
  },

  // ════════════════════════════════════════════════════════════
  // SECTION 8 – EMAILS, NOTIFICATIONS & AUTOMATIONS
  // ════════════════════════════════════════════════════════════

  {
    id: "en-001",
    category: "Emails & Notifications",
    question: "What types of emails does MigRent send?",
    answer:
      "MigRent sends the following types of emails to keep you informed:\n\nAccount emails:\n• Welcome email — Sent when you create your account, with a brief guide to getting started\n• Email verification — A link to confirm your email address\n• Password reset — A link to reset your password (if requested)\n• Magic link login — A one-time login link (if you use passwordless login)\n\nVerification emails:\n• Phone verification confirmation — Confirms your phone number has been verified\n• ID verification status — Notification when your ID is approved, rejected, or needs additional documents\n• Verification badge granted — Confirmation when you receive a paid verification badge\n\nBooking emails:\n• Booking request received — Sent to hosts when a seeker submits a request\n• Booking request sent — Confirmation to seekers that their request was submitted\n• Booking accepted — Sent to seekers when a host accepts their request\n• Booking declined — Sent to seekers when a host declines their request\n• Booking expired — Sent when a request expires after 48 hours with no response\n• Booking cancelled — Sent to both parties when a booking is cancelled\n\nPayment emails:\n• Payment confirmation — Receipt for every payment processed\n• Payout notification — Sent to hosts when a payout is deposited\n• Refund issued — Confirmation when a refund is processed\n• Payment reminder — Sent before an upcoming automatic payment\n\nSupport emails:\n• Ticket created — Confirmation that your support ticket was submitted\n• Ticket response — Notification when a support agent replies to your ticket\n• Ticket resolved — Notification when your ticket is marked as resolved",
    keywords: ["emails", "email types", "notifications", "what emails", "email from migrent", "email notifications"],
  },
  {
    id: "en-002",
    category: "Emails & Notifications",
    question: "What email address do MigRent emails come from?",
    answer:
      "All MigRent emails come from one of the following addresses:\n\n• support@migrent-ai.com — For support ticket updates and general support correspondence\n• noreply@migrent-ai.com — For automated notifications such as booking confirmations, payment receipts, and verification updates\n\nImportant:\n• We will never ask for your password, credit card number, or personal financial details via email\n• If you receive an email that appears to be from MigRent but asks for sensitive information, do not click any links — it may be a phishing attempt. Report it to support@migrent-ai.com\n• Legitimate MigRent emails will always address you by name and reference specific account activity\n\nTo make sure you receive our emails:\n• Add support@migrent-ai.com and noreply@migrent-ai.com to your email contacts\n• Check your spam or junk folder if you are not seeing our emails in your inbox\n• If you use Gmail, check the \"Promotions\" or \"Updates\" tabs",
    keywords: ["email address", "from address", "sender", "support email", "noreply", "email from"],
  },
  {
    id: "en-003",
    category: "Emails & Notifications",
    question: "I am not receiving emails from MigRent. What should I do?",
    answer:
      "If you are not receiving MigRent emails, try these steps in order:\n\n1. Check your spam or junk folder — MigRent emails sometimes end up there, especially if your email provider is unfamiliar with our sending address.\n\n2. Check all inbox tabs — If you use Gmail, check the \"Promotions\", \"Updates\", and \"Social\" tabs. MigRent emails may be filtered into one of these.\n\n3. Mark as \"Not spam\" — If you find a MigRent email in spam, open it and click \"Not spam\" or \"Report not junk\". This trains your email provider to deliver future emails to your inbox.\n\n4. Add us to your contacts — Add support@migrent-ai.com and noreply@migrent-ai.com to your email address book or contacts list.\n\n5. Check your notification settings — Go to Settings on MigRent and make sure the notification types you want are toggled on.\n\n6. Verify your email address — Go to Settings and confirm that the email address on your account is correct and spelled properly.\n\n7. Try a different email — If you continue to have issues, you can update your account email to a different provider (for example, switch from Outlook to Gmail).\n\n8. Contact support — If none of the above works, submit a support ticket through the floating support button on the website (which does not require email). Our team will investigate the issue.",
    keywords: ["not receiving emails", "no email", "missing email", "spam", "junk", "email not arriving", "email issues"],
  },

  // ════════════════════════════════════════════════════════════
  // SECTION 9 – TROUBLESHOOTING & COMMON ISSUES
  // ════════════════════════════════════════════════════════════

  {
    id: "ts-001",
    category: "Troubleshooting",
    question: "I cannot log in to my account. What should I do?",
    answer:
      "Here is a step-by-step guide to resolving login issues:\n\nIf you use email and password login:\n1. Make sure you are using the correct email address — try copying and pasting it to avoid typos\n2. Click \"Forgot password\" to reset your password. Check your email (including spam) for the reset link.\n3. The reset link expires after one hour. If it has expired, request a new one.\n4. Make sure your new password is at least 8 characters long.\n\nIf you use Google login:\n1. Make sure you are clicking \"Sign in with Google\" (not the email/password form)\n2. Select the correct Google account if you have multiple accounts\n3. If Google shows an error, sign out of Google first, then try again\n4. Clear your browser cookies for accounts.google.com and try again\n\nIf you use magic link:\n1. Check your email (including spam) for the magic link\n2. The link expires after one hour — request a new one if it has expired\n3. Make sure you are clicking the most recent magic link (older ones become invalid)\n\nGeneral troubleshooting:\n• Clear your browser cache and cookies, then try again\n• Try a different browser or incognito/private mode\n• Make sure your internet connection is stable\n• If your account is locked after too many failed attempts, wait 15 minutes\n\nStill cannot log in? Submit a support ticket through the floating support button (you do not need to be logged in to do this).",
    keywords: ["cant login", "login problem", "sign in error", "access denied", "login not working", "login help", "cant sign in"],
  },
  {
    id: "ts-002",
    category: "Troubleshooting",
    question: "I did not receive my verification email or SMS code.",
    answer:
      "Verification email not arriving:\n1. Check your spam, junk, and promotions folders\n2. Wait up to 5 minutes — emails can sometimes be delayed\n3. Make sure the email address on your account is correct (check for typos in Settings)\n4. Add noreply@migrent-ai.com to your contacts, then request a new verification email from Settings\n5. Try a different email provider if the issue persists\n\nSMS verification code not arriving:\n1. Make sure you entered your phone number correctly, including the country code (for example, +61 for Australia)\n2. Check that your phone has reception and can receive SMS messages\n3. Wait up to 2 minutes — SMS delivery can be delayed\n4. Some international carriers may block short code messages — try requesting the code again\n5. If you are using a new Australian SIM card, make sure it is activated and can receive messages\n6. Virtual phone numbers (VoIP numbers from Google Voice, Skype, etc.) may not work for SMS verification — use a real mobile number\n\nIf you have tried all of the above and still cannot receive your verification:\n• Submit a support ticket through the floating support button\n• Include the email address or phone number you are trying to verify\n• Our team will investigate and may offer alternative verification methods",
    keywords: ["verification email", "SMS code", "not received", "no code", "verification not working", "email not arriving", "SMS not arriving"],
  },
  {
    id: "ts-003",
    category: "Troubleshooting",
    question: "My payment failed. What should I do?",
    answer:
      "If your payment was declined or failed, follow these steps:\n\n1. Check your card details — Go to Settings and verify that your card number, expiry date, and CVV are correct.\n2. Check for sufficient funds — Make sure your card has enough available balance or credit limit for the payment amount.\n3. Check with your bank — Your bank may be blocking the transaction as a fraud prevention measure, especially if:\n   • It is an international transaction (non-Australian card)\n   • It is your first online payment to MigRent\n   • The amount is unusually large for your spending pattern\n   Contact your bank and let them know the payment is legitimate, then try again.\n4. Try a different card — If the issue persists, add a different credit or debit card in Settings and retry the payment.\n5. Check card expiry — If your card has recently expired, update it with your new card details.\n\nAfter resolving the issue:\n• Go to the failed payment in your dashboard\n• Click \"Retry payment\" to process it again\n• You will receive a confirmation email once the payment goes through\n\nIf payments continue to fail after trying all of the above, contact our support team with the error message you are seeing.",
    keywords: ["payment failed", "card declined", "payment error", "payment not working", "card rejected", "payment issue"],
  },
  {
    id: "ts-004",
    category: "Troubleshooting",
    question: "The host is not responding to my booking request or messages.",
    answer:
      "If a host has not responded, here is what to do:\n\nFor pending booking requests:\n• Hosts have 48 hours to respond. If it has been less than 48 hours, please wait a little longer.\n• After 48 hours, the request automatically expires and any payment hold is released. You are free to book another listing.\n\nFor messages:\n• Check the host's profile for their typical response time\n• Send a polite follow-up message if you have not heard back within 24 hours\n• Keep in mind that hosts may be in different time zones or may have limited availability\n\nIf the host is consistently unresponsive:\n• Consider looking at other listings with faster response times\n• Superhosts maintain a 90%+ response rate — prioritise Superhost listings for a better experience\n• If you have an active booking and the host is not responding to urgent messages about your tenancy, contact our support team for assistance\n\nNever try to contact a host outside of MigRent (through social media, calling unverified phone numbers, etc.) based on information found elsewhere. Always use the platform's messaging system.",
    keywords: ["host not responding", "no response", "waiting", "unresponsive", "host silent", "no reply"],
  },
  {
    id: "ts-005",
    category: "Troubleshooting",
    question: "A listing looks fake or suspicious. What should I do?",
    answer:
      "If a listing seems too good to be true or raises red flags, take these steps:\n\nCommon signs of a suspicious listing:\n• Rent is significantly below the market rate for the area\n• Photos look overly professional, stock-like, or stolen from another website\n• The description is vague, generic, or copy-pasted\n• The host has no reviews and minimal verification\n• The host asks you to pay outside of MigRent (cash, direct transfer, cryptocurrency)\n• The host refuses to allow an in-person inspection\n• The host pressures you to book immediately or claims there is \"one spot left\"\n• The listing address does not exist or is clearly wrong\n\nWhat to do:\n1. Do NOT send a booking request or make any payment\n2. Click the \"Report\" button on the listing page\n3. Select \"Suspected scam\" or \"Suspicious listing\" and provide details about what concerned you\n4. If you have already been communicating with the host, screenshot the conversation\n5. Our Trust and Safety team reviews all reports within 24 hours\n\nProtecting yourself:\n• Always verify the host's profile and badges\n• Read reviews from previous tenants\n• Inspect the property before committing\n• Never pay outside of MigRent\n• Trust your instincts — if something feels off, it probably is",
    keywords: ["fake listing", "suspicious", "scam listing", "too good to be true", "report listing", "fraud", "fake"],
  },
  {
    id: "ts-006",
    category: "Troubleshooting",
    question: "Something is broken on the site. How do I report a bug?",
    answer:
      "If you encounter a technical issue on MigRent, here is how to help us fix it:\n\nBefore reporting:\n1. Refresh the page — Sometimes a simple refresh solves the issue\n2. Clear your browser cache and cookies — Go to your browser settings and clear cached data\n3. Try incognito or private mode — This rules out browser extension conflicts\n4. Try a different browser — If it works in another browser, the issue may be specific to your current one\n5. Check your internet connection — Make sure you have a stable connection\n6. Try on a different device — Test on your phone or another computer\n\nIf the issue persists, report it:\n1. Click the floating support button (red circle, bottom right)\n2. Switch to the \"Contact Support\" tab\n3. Select \"Bug Report\" as the category\n4. Include the following information:\n   • What you were trying to do\n   • What happened instead\n   • The URL of the page where the issue occurred\n   • Your browser name and version (for example, Chrome 120, Safari 17)\n   • Your device type (for example, MacBook, iPhone 15, Windows laptop)\n   • Screenshots of the error if possible\n\nOur development team investigates all bug reports and prioritises fixes based on severity and impact.",
    keywords: ["bug", "broken", "error", "not working", "glitch", "technical issue", "report bug", "site problem"],
  },
  {
    id: "ts-007",
    category: "Troubleshooting",
    question: "I am having browser or device issues with MigRent.",
    answer:
      "MigRent works best on modern web browsers. Here is how to troubleshoot device and browser issues:\n\nSupported browsers:\n• Google Chrome (latest version)\n• Mozilla Firefox (latest version)\n• Safari (latest version)\n• Microsoft Edge (latest version)\n• Brave, Opera, and other Chromium-based browsers generally work well\n\nCommon fixes:\n1. Update your browser — Make sure you are using the latest version. Outdated browsers may have compatibility issues.\n2. Clear cache and cookies — Go to your browser settings and clear browsing data. This resolves most display and loading issues.\n3. Disable browser extensions — Some extensions (ad blockers, privacy tools) can interfere with MigRent. Try disabling them temporarily.\n4. Try incognito or private mode — This loads the site without extensions or cached data.\n5. Enable JavaScript — MigRent requires JavaScript to function. Make sure it is enabled in your browser settings.\n6. Check your internet speed — Slow connections can cause pages to load incorrectly. Try reloading on a stronger connection.\n\nMobile devices:\n• MigRent is designed to work on mobile browsers (Chrome, Safari)\n• Use your phone's default browser for the best experience\n• If the page looks broken on mobile, rotate your device to landscape mode to see if it helps, then rotate back\n\nIf issues persist after trying these steps, report the issue through the support widget.",
    keywords: ["browser", "device", "chrome", "safari", "mobile", "not loading", "display issue", "compatibility", "cache"],
  },
  {
    id: "ts-008",
    category: "Troubleshooting",
    question: "When and how should I contact human support?",
    answer:
      "While our AI assistant can answer many common questions instantly, some issues require a human touch. Contact our support team when:\n\n• You have a payment dispute or unexpected charge\n• You need to report a safety concern or suspicious activity\n• Your account has been locked or compromised\n• You have a dispute with a host or seeker that you cannot resolve\n• You need help with a complex verification issue\n• You are experiencing a bug that prevents you from using the platform\n• You need to request a data export or account deletion\n\nHow to contact us:\n1. Floating support button — Click the red circle in the bottom-right corner, switch to \"Contact Support\", and fill out the form. This creates a trackable ticket.\n2. Support tickets — Go to the Support section in your navigation to submit a detailed ticket.\n3. Email — Send an email to support@migrent.ai\n\nWhat to include in your request:\n• Your account email address\n• The specific issue you are experiencing\n• Steps you have already taken to resolve it\n• Screenshots of any error messages\n• The booking or listing ID (if applicable)\n\nResponse times:\n• Support tickets: Within 24 hours (typically faster)\n• Email: Within 24 to 48 hours\n• Superhost priority support: Within 12 hours",
    keywords: ["contact support", "human support", "talk to person", "support team", "help desk", "customer support", "live support"],
  },

  // ════════════════════════════════════════════════════════════
  // SECTION 10 – LEGAL, PRIVACY & DATA
  // ════════════════════════════════════════════════════════════

  {
    id: "lp-001",
    category: "Legal & Privacy",
    question: "What personal data does MigRent collect and why?",
    answer:
      "MigRent collects personal data to provide our services, ensure security, and improve your experience. Here is what we collect:\n\nAccount information:\n• Email address — For account creation, login, and communications\n• Name — To identify you on the platform and in bookings\n• Phone number — For verification and optional contact\n• Profile photo — To build trust with other users\n\nVerification data:\n• Government ID — To verify your identity (passport, driver's licence, etc.)\n• This data is securely encrypted and only used for verification purposes\n\nListing data (for hosts):\n• Property details, photos, and descriptions — To create and display your listing\n• Address — To show the general location (suburb) to seekers; the exact address is only shared after booking confirmation\n\nPayment data:\n• Credit card and bank account details — Processed and stored securely by Stripe (our payment processor). MigRent does not store your full card number.\n\nUsage data:\n• Pages visited, searches performed, interactions with listings — To improve our service, provide recommendations, and troubleshoot issues\n• Device and browser information — For security and compatibility\n\nWhy we collect this data:\n• To provide the marketplace service (connecting seekers with hosts)\n• To process payments securely\n• To verify identities and build trust\n• To send important notifications\n• To improve the platform based on how people use it\n• To comply with Australian legal requirements",
    keywords: ["data collection", "personal data", "privacy", "what data", "information collected", "why data"],
  },
  {
    id: "lp-002",
    category: "Legal & Privacy",
    question: "How is my data stored and protected?",
    answer:
      "MigRent takes data security seriously. Here is how we protect your information:\n\nData storage:\n• Your account data is stored on secure, encrypted servers\n• Our database uses industry-standard encryption for data at rest and in transit\n• Servers are hosted in secure data centres with physical and digital security controls\n\nPayment security:\n• All payment processing is handled by Stripe, which is PCI Level 1 certified (the highest level of payment security)\n• MigRent never sees or stores your full credit card number\n• All payment transactions use SSL/TLS encryption\n\nVerification documents:\n• Government ID images are encrypted and stored separately from other account data\n• Access to verification documents is restricted to authorised personnel\n• Documents are not shared with other users, hosts, or seekers\n\nBest practices we follow:\n• Regular security audits and updates\n• Access controls limiting who can view your data\n• Secure authentication with encrypted passwords and session tokens\n• Monitoring for suspicious activity\n\nYour responsibilities:\n• Use a strong, unique password for your MigRent account\n• Do not share your login credentials with anyone\n• Log out when using shared or public devices\n• Report any suspicious activity on your account immediately",
    keywords: ["data security", "data protection", "encryption", "secure", "how data stored", "data safety", "privacy protection"],
  },
  {
    id: "lp-003",
    category: "Legal & Privacy",
    question: "How long is my data kept and how can I request deletion or a copy?",
    answer:
      "Data retention:\n• Active account data is kept for as long as your account is active\n• After account deletion, most personal data is removed within 30 days\n• Certain data may be retained for longer periods as required by law (for example, financial transaction records must be kept for 7 years for tax compliance under Australian law)\n• Anonymised usage data may be retained indefinitely for analytics purposes\n\nRequesting a copy of your data:\n• You have the right to request a copy of all personal data MigRent holds about you\n• Contact our support team at support@migrent.ai with the subject line \"Data export request\"\n• Include the email address associated with your account\n• We will provide your data in a commonly used format (such as CSV or JSON) within 30 days\n\nRequesting data deletion:\n• You can delete your account and associated data through Settings (see \"How do I delete my MigRent account?\")\n• For specific data deletion requests without deleting your entire account, contact our support team\n• Deletion requests are processed within 30 days\n• As mentioned above, some data may be retained for legal compliance\n\nYour rights under Australian privacy law:\n• The Australian Privacy Act 1988 gives you the right to access and correct your personal information\n• You can lodge a complaint with the Office of the Australian Information Commissioner (OAIC) if you believe your data has been mishandled",
    keywords: ["data retention", "delete data", "data copy", "download data", "data request", "GDPR", "privacy rights", "how long data kept"],
  },
  {
    id: "lp-004",
    category: "Legal & Privacy",
    question: "What does \"verification is a trust signal, not a legal guarantee\" mean?",
    answer:
      "This is an important distinction that all MigRent users should understand:\n\nWhat verification IS:\n• A process that confirms a user's identity through document checks (email, phone, government ID)\n• A trust signal that tells other users: \"This person has taken steps to verify who they are\"\n• A way to reduce (but not eliminate) the risk of fraud and misrepresentation\n• An indication that MigRent has reviewed the submitted documents\n\nWhat verification is NOT:\n• It is not a background check (criminal, financial, or otherwise)\n• It is not a guarantee that the person will be a good tenant or a good host\n• It is not a guarantee that the property is exactly as described\n• It is not legal certification of any kind\n• It is not insurance against bad experiences\n• It does not create any legal obligation on MigRent's part regarding the behaviour of verified users\n\nWhy this matters:\n• Even verified users can behave unexpectedly\n• Even verified properties may have issues not visible during verification\n• You should always exercise your own judgment and take reasonable precautions\n• Inspect properties, communicate with hosts/seekers, check reviews, and follow the safety checklists provided in this Help Center\n\nVerification is one layer of trust. It works best when combined with your own due diligence.",
    keywords: ["trust signal", "not guarantee", "verification meaning", "what verification means", "disclaimer", "verification limit"],
  },
  {
    id: "lp-005",
    category: "Legal & Privacy",
    question: "What are my rights as a tenant in Australia?",
    answer:
      "As a tenant in Australia, you are protected by residential tenancy laws that apply regardless of your visa status, nationality, or immigration circumstances. Key rights include:\n\nYour fundamental rights:\n• A property that is clean, safe, and in reasonable repair\n• Quiet enjoyment of the property without unreasonable interference from the landlord\n• Proper written notice before the landlord enters your property (typically 24 to 48 hours)\n• Protection from unfair eviction — there are specific legal processes that must be followed\n• A written tenancy agreement outlining the terms of your rental\n• Your bond lodged with the relevant state authority\n• The right to request necessary repairs and have them completed in a reasonable timeframe\n• The right to challenge excessive rent increases through your state's tribunal\n\nState-specific bodies:\n• NSW: NSW Fair Trading\n• VIC: Consumer Affairs Victoria\n• QLD: Residential Tenancies Authority (RTA)\n• SA: Consumer and Business Services\n• WA: Consumer Protection\n• TAS: Consumer, Building and Occupational Services\n• NT: Consumer Affairs\n• ACT: Access Canberra\n\nEach state has its own specific legislation and processes. Visit your state's Fair Trading or Consumer Affairs website for detailed information relevant to your location.\n\nIf you experience discrimination based on your race, nationality, or visa status, you can lodge a complaint with the Australian Human Rights Commission.",
    keywords: ["tenant rights", "renter rights", "legal rights", "tenancy rights", "my rights", "eviction", "repairs", "landlord rights"],
  },
  {
    id: "lp-006",
    category: "Legal & Privacy",
    question: "Does my visa status affect my tenancy rights?",
    answer:
      "No. Your tenancy rights in Australia are the same regardless of your visa status. This is an important protection for all migrants:\n\nEqual protection under the law:\n• Australian residential tenancy laws apply equally to citizens, permanent residents, and temporary visa holders\n• Landlords and agents cannot legally refuse to rent to you based on your visa type, nationality, ethnicity, or immigration status\n• You have the same bond protection, repair rights, and eviction protections as any Australian citizen tenant\n\nCommon concerns for migrants:\n• \"Can my landlord evict me if my visa expires?\" — Tenancy agreements are separate from visa conditions. However, if you need to leave Australia, you should give proper notice as required by your agreement.\n• \"Can a landlord ask about my visa?\" — A landlord can ask for identification for verification purposes but cannot discriminate based on visa type.\n• \"What if I have a dispute with my landlord?\" — You can use your state's tenancy tribunal regardless of your visa status.\n\nIf you experience discrimination:\n• Lodge a complaint with the Australian Human Rights Commission\n• Contact your state's anti-discrimination body\n• Seek legal advice from a community legal centre — many offer free advice for tenancy matters\n\nResources for migrants:\n• Tenancy advice services exist in every state and many offer multilingual support\n• Community legal centres can provide free legal advice on tenancy matters\n• Your country's consulate or embassy may also be able to direct you to relevant support services",
    keywords: ["visa", "visa status", "immigration", "migrant rights", "student visa", "work visa", "visa tenancy", "discrimination"],
  },

  // ════════════════════════════════════════════════════════════
  // SECTION 11 – TIPS & GUIDES FOR MIGRANTS & OWNERS
  // ════════════════════════════════════════════════════════════

  {
    id: "tg-001",
    category: "Tips & Guides",
    question: "How can migrants new to Australia safely find housing?",
    answer:
      "Finding housing in a new country can feel overwhelming, but following these steps will help you find a safe, comfortable home:\n\nBefore you arrive:\n• Start your search early — at least 2 to 4 weeks before your arrival date\n• Create your MigRent account and complete as much verification as possible from overseas\n• Research suburbs near your workplace or university\n• Understand the general cost of rent in your target area\n• If possible, arrange temporary accommodation for your first 1 to 2 weeks (hostel, Airbnb, or a friend's place) so you are not pressured to make a quick decision\n\nWhen searching:\n• Focus on listings with verified hosts and Superhosts\n• Read reviews from other migrants — they often highlight important cultural context\n• Compare multiple listings before committing\n• Use filters for your budget, preferred suburb, and essential amenities\n• Prioritise listings near public transport if you do not have a car\n\nBefore committing:\n• Always inspect the property in person or via video call\n• Ask questions about utilities, internet, and what is included in the rent\n• Understand the bond amount and conditions for its return\n• Read the tenancy agreement carefully before signing\n• Never pay money outside of MigRent's secure payment system\n\nAfter moving in:\n• Take photos of every room on your first day for bond protection\n• Introduce yourself to housemates and neighbours\n• Learn about local services: closest supermarket, medical centre, public transport routes\n• Save emergency contacts: 000 (emergency), your host's number, your embassy or consulate",
    keywords: ["migrant housing", "new to australia", "finding housing", "first home", "arrive australia", "overseas", "relocating"],
  },
  {
    id: "tg-002",
    category: "Tips & Guides",
    question: "Understanding Australian rental norms and terminology",
    answer:
      "If you are new to Australia, here are key rental terms and norms you should know:\n\nKey terminology:\n• Bond (security deposit) — A refundable deposit (usually 4 weeks rent) held by a government authority. It protects the landlord against damage or unpaid rent.\n• Lease (tenancy agreement) — The legal contract between you and the landlord. It outlines rent, duration, rules, and responsibilities.\n• Fixed term vs periodic — A fixed-term lease has a set end date. A periodic (month-to-month) tenancy continues until either party gives notice.\n• Inspection — A scheduled visit by the landlord or agent to check the property's condition. You must be given proper notice (usually 7 days for routine inspections).\n• Fair wear and tear — Normal deterioration from everyday use. You are not responsible for fair wear and tear (for example, slight scuff marks on walls).\n\nCommon norms:\n• Rent is usually paid weekly or fortnightly, not monthly\n• Most rentals are unfurnished in the traditional market, but many MigRent rooms are furnished\n• Tenants are generally responsible for keeping the property clean and reporting maintenance issues promptly\n• Noise rules vary by state and local council, but generally, avoid excessive noise between 10pm and 7am\n• Shared housing is very common, especially in cities — you may share a kitchen, bathroom, and living area with other tenants\n• Pets are often restricted — always check the listing and discuss with the host before bringing a pet\n\nCultural tips:\n• Australians generally value punctuality — arrive on time for inspections and meetings\n• Communication is usually direct and friendly — do not hesitate to ask questions\n• It is normal to negotiate on rent, especially for longer stays\n• Recycling and rubbish disposal rules vary by council — ask your host or check your local council's website",
    keywords: ["rental norms", "australian rental", "bond", "lease", "tenancy", "inspection", "fair wear", "terminology"],
  },
  {
    id: "tg-003",
    category: "Tips & Guides",
    question: "Tips for writing a strong seeker profile to build trust with hosts",
    answer:
      "Your profile is your introduction to hosts. A strong profile significantly increases your chances of booking acceptance. Here is how to create one that stands out:\n\nProfile photo:\n• Use a clear, friendly photo of yourself (not a group photo, pet, or scenery)\n• A professional or casual headshot works best\n• Smile — it makes a great first impression\n• Avoid sunglasses or anything that hides your face\n\nBio:\n• Write 3 to 5 sentences about yourself\n• Mention your reason for being in Australia (studying, working, relocating)\n• Highlight your lifestyle: are you quiet, social, tidy, a morning person?\n• Mention if you have rented before and your experience\n• Keep it warm and genuine — hosts appreciate authenticity\n\nExample bio:\n\"Hi! I am Maya, a postgraduate student from India studying Data Science at the University of Melbourne. I am clean, respectful, and quiet — I love reading and cooking on weekends. I have experience sharing flats from my time in Mumbai and New Delhi. Looking for a welcoming home near public transport. Happy to provide references from previous landlords.\"\n\nVerification:\n• Complete all verification steps (email, phone, government ID)\n• Consider the optional AUD 19 enhanced verification for a premium badge\n• Verified seekers get significantly more booking acceptances\n\nPersonal message with booking requests:\n• Always include a personal message when sending a booking request\n• Mention specific things about the listing that appeal to you\n• Briefly introduce yourself and your situation\n• Mention your expected length of stay\n• Offer to provide references if available",
    keywords: ["seeker profile", "strong profile", "profile tips", "bio", "profile photo", "introduction", "build trust", "get accepted"],
  },
  {
    id: "tg-004",
    category: "Tips & Guides",
    question: "Tips for owners to attract quality tenants",
    answer:
      "Great tenants start with a great listing. Here is how to attract reliable, respectful seekers:\n\nListing quality:\n• Invest time in your photos — they are the first thing seekers see. Use natural light, clean the space, and include at least 5 photos covering the bedroom, bathroom, common areas, and exterior.\n• Write a detailed, honest description. Mention what makes your property special (proximity to transport, quiet street, garden, fast internet).\n• Be specific about what is included in the rent (utilities, internet, furniture, parking).\n• Mention the neighbourhood highlights: nearby cafes, supermarkets, parks, universities.\n\nPricing:\n• Research similar listings in your area to set a competitive rate\n• Consider offering discounts for longer stays — this attracts committed tenants\n• Be transparent about any additional costs\n\nCommunication:\n• Respond to booking requests and messages quickly — aim for within a few hours\n• Be friendly, welcoming, and professional\n• Answer questions thoroughly — seekers, especially migrants, may have many questions about the property and the area\n\nFlexibility:\n• Offer virtual inspections for overseas seekers who cannot visit in person\n• Be accommodating with move-in dates where possible\n• Clearly explain your house rules and expectations upfront — this prevents misunderstandings later\n\nVerification and trust:\n• Complete all verification steps to earn your Verified Host badge\n• Work towards Superhost status — it is the strongest trust signal available\n• Encourage happy tenants to leave reviews — positive reviews are your best marketing tool\n\nTreating tenants well:\n• Respond to maintenance requests promptly\n• Respect your tenant's privacy and provide proper notice before visits\n• Be understanding of cultural differences — your tenants may be adjusting to life in a new country",
    keywords: ["attract tenants", "owner tips", "host tips", "good listing", "quality tenants", "hosting tips", "better listing"],
  },
  {
    id: "tg-005",
    category: "Tips & Guides",
    question: "Dealing with cultural differences kindly and clearly",
    answer:
      "MigRent brings together people from many different cultural backgrounds. Here is how to navigate cultural differences with respect and clarity:\n\nFor hosts:\n• Remember that your tenant may be experiencing a completely new culture. Things that seem obvious to you (recycling rules, noise expectations, kitchen etiquette) may be unfamiliar.\n• Write clear, specific house rules rather than assuming things are \"common sense\". What is common in one culture may be different in another.\n• Be patient with language differences. Speak clearly, use simple language, and confirm understanding by asking the tenant to repeat back important information.\n• Respect dietary and religious practices. For example, some tenants may prefer not to have certain foods stored near theirs, or may need a quiet space for prayer.\n• Avoid making assumptions based on someone's country of origin.\n\nFor seekers:\n• Ask questions if you are unsure about any local customs or house rules. Most Australians are happy to explain.\n• Communicate openly about your needs and preferences. For example, if you cook food with strong aromas, discuss kitchen ventilation with your host.\n• Respect shared spaces and follow the house rules that were communicated to you.\n• Be open to learning about Australian customs while also sharing your own culture.\n\nGeneral principles:\n• Lead with kindness and assume good intentions\n• Address issues early and directly but politely — letting things build up often leads to bigger conflicts\n• If a misunderstanding occurs, talk it through calmly. Most issues arise from different expectations, not bad intentions.\n• Use MigRent's messaging system to keep important communications documented\n• If you cannot resolve a cultural misunderstanding, our support team is here to help mediate",
    keywords: ["cultural differences", "culture", "diversity", "communication", "misunderstanding", "respect", "international", "cultural tips"],
  },
  {
    id: "tg-006",
    category: "Tips & Guides",
    question: "Understanding bonds and how to protect yours",
    answer:
      "The bond (security deposit) is one of the most important financial aspects of renting in Australia. Here is everything you need to know:\n\nWhat is a bond?\n• A refundable security deposit paid at the start of your tenancy\n• Usually equal to 4 weeks rent (some states have maximum limits)\n• Held by a government bond authority, not by your landlord\n• Protects the landlord against unpaid rent or property damage\n\nOn MigRent:\n• Bond payments are processed securely through the platform\n• The bond amount is clearly shown in your booking confirmation\n\nHow to protect your bond:\n• Take dated photos and videos of every room when you move in — this is your most important protection\n• Note any existing damage on a condition report (if provided) or in writing to your host through MigRent\n• Keep the property clean and in good condition throughout your tenancy\n• Report maintenance issues promptly — if damage worsens because you did not report it, you may be held responsible\n• When moving out, clean the property to the standard it was in when you arrived\n• Take dated photos after your final clean for evidence\n\nGetting your bond back:\n• At the end of your tenancy, both you and the host agree on the bond return amount\n• If there are no issues, the full bond is returned within 5 to 10 business days\n• If the host claims part of the bond for damage or unpaid rent, they must provide evidence\n• If you disagree with a bond claim, you can dispute it through your state's bond authority or tribunal\n\nTip: Keep all your move-in photos, communication records, and receipts throughout your tenancy. These are invaluable if a bond dispute arises.",
    keywords: ["bond", "security deposit", "protect bond", "bond refund", "bond dispute", "deposit", "bond return", "bond claim"],
  },
  {
    id: "tg-007",
    category: "Tips & Guides",
    question: "How to handle common rental scams in Australia",
    answer:
      "Unfortunately, rental scams exist in Australia and often target migrants who may be unfamiliar with local practices. Here is how to protect yourself:\n\nCommon scam types:\n• Fake listings — Scammers post properties they do not own, often using photos stolen from real estate websites. They collect a deposit or bond and then disappear.\n• Advance fee scams — You are asked to pay fees before viewing the property (for \"application processing\", \"holding deposit\", or similar). Legitimate landlords in Australia do not charge application fees.\n• Impersonation — Someone pretends to be a real estate agent or property manager and collects money on behalf of the \"owner\".\n• Off-platform payments — A host on MigRent asks you to pay directly to their bank account instead of through the platform. This bypasses our payment protection.\n\nHow to stay safe:\n• Always pay through MigRent — never via direct bank transfer, cash, cryptocurrency, or Western Union\n• Never send money before inspecting a property (in person or via video call)\n• Be suspicious of prices significantly below market rate\n• Verify the host's identity through MigRent's verification badges and reviews\n• If a host asks you to move communication off-platform (to WhatsApp, email, etc.), proceed with caution\n• Research the property address to confirm it exists\n• Ask for a video tour if you cannot visit in person\n\nIf you have been scammed:\n• Report it to MigRent immediately through the support widget\n• File a report with your local police\n• Report to your state's Fair Trading or Consumer Affairs office\n• If you paid by card, contact your bank about a chargeback\n\nRemember: If it seems too good to be true, it probably is.",
    keywords: ["scam", "rental scam", "fraud", "avoid scam", "protect yourself", "common scam", "fake listing", "phishing"],
  },
];

// ─────────────────────────────────────────────────────────────
// Helper functions
// ─────────────────────────────────────────────────────────────

export function getAllArticles(): KBArticle[] {
  return articles;
}

export function getArticlesByCategory(category: KBCategory): KBArticle[] {
  return articles.filter((a) => a.category === category);
}

export function getAllCategories(): KBCategory[] {
  const cats = new Set(articles.map((a) => a.category));
  return Array.from(cats) as KBCategory[];
}

export function searchArticles(query: string): KBArticle[] {
  const normalizedQuery = query.toLowerCase().trim();
  if (!normalizedQuery) return [];

  const queryWords = normalizedQuery.split(/\s+/);

  // Score each article by relevance
  const scored = articles.map((article) => {
    const questionLower = article.question.toLowerCase();
    const answerLower = article.answer.toLowerCase();
    const keywordsJoined = article.keywords.join(" ").toLowerCase();

    let score = 0;

    for (const word of queryWords) {
      // Exact keyword match (highest weight)
      if (article.keywords.some((k) => k.toLowerCase() === word)) score += 10;
      // Keyword contains the word
      else if (keywordsJoined.includes(word)) score += 5;
      // Question contains the word
      if (questionLower.includes(word)) score += 3;
      // Answer contains the word
      if (answerLower.includes(word)) score += 1;
    }

    return { article, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((s) => s.article);
}
