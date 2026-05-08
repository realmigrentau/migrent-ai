// ─── Guide content data for MigRent AI ────────────────────────────────────
// Full content for MigRent guides. See docs/GUIDES_STRATEGY.md for the
// content template, structure rules, and governance process.

export type CalloutVariant = "tip" | "info" | "warning" | "critical" | "success";

export interface GuideCallout {
  variant: CalloutVariant;
  title?: string;
  body: string;
}

export interface GuideSection {
  id: string;
  title: string;
  content: string[]; // paragraphs
  tip?: string;
  callouts?: GuideCallout[];
  checklist?: string[];
}

export interface OfficialResource {
  label: string;
  url: string;
  region?: string;
}

export type GuideCategory = "seeker" | "owner" | "legal" | "money" | "safety" | "newcomer";

export interface GuideContent {
  id: string;
  title: string;
  description: string;
  whoFor?: string;
  whyItMatters?: string;
  quickAnswer?: string;
  icon: string; // SVG path string used by the existing icon renderer
  gradient: string; // tailwind gradient classes
  color: string; // text color class
  bgColor: string; // bg color class
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  readTime: string;
  category: GuideCategory;
  lastUpdated?: string; // YYYY-MM-DD
  disclaimer?: string;
  sections: GuideSection[];
  commonMistakes?: string[];
  officialResources?: OfficialResource[];
  relatedGuides: string[]; // IDs of related guides
}

const LEGAL_DISCLAIMER =
  "This guide is general information for migrants and students renting in Australia. It is not legal advice. Tenancy law varies by state and territory. For your specific situation, contact your state's Fair Trading body or a free community legal centre.";

const guidesContent: GuideContent[] = [
  // ────────────────────────────────────────────────────────────────────────
  // NEW V1 - 1. Master guide: How to rent in Australia as a new migrant
  // ────────────────────────────────────────────────────────────────────────
  {
    id: "rent-as-new-migrant",
    title: "How to Rent in Australia as a New Migrant",
    description:
      "The full path from arrival to keys in your hand, written for migrants and international students renting in Australia for the first time.",
    whoFor: "International students, working holiday makers, skilled-visa holders, and family migrants renting for the first time in Australia.",
    whyItMatters:
      "Most newcomers waste money in their first month because no one explained how Australian rentals actually work. This guide covers the full journey end-to-end.",
    quickAnswer:
      "Plan for around 4 to 6 weeks rent in upfront cost (bond plus first 1-2 weeks). Verify your MigRent profile, prepare ID and proof of income or visa, inspect rooms before paying, and never send money outside the platform. Bond is held in trust and returned at move-out if you leave the room as you found it.",
    icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    gradient: "from-blue-500 to-indigo-500",
    color: "text-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-500/10",
    difficulty: "Beginner",
    readTime: "9 min read",
    category: "newcomer",
    lastUpdated: "2026-05-09",
    disclaimer: LEGAL_DISCLAIMER,
    relatedGuides: ["documents-to-rent", "how-bond-works", "avoid-rental-scams", "first-week-checklist"],
    sections: [
      {
        id: "understand-the-market",
        title: "Understand How Australian Rentals Work",
        content: [
          "In Australia, rent is usually quoted weekly, not monthly. A room advertised at $300 per week will cost roughly $1,300 per month. Most landlords or share-house hosts ask for a security deposit called bond, which is normally up to four weeks of rent. Bond is not income for the host. It is held in trust and returned to you when you move out, minus any agreed deductions for damage beyond normal wear and tear.",
          "Rentals come in three broad shapes. Whole apartments through a real estate agent are usually 12-month leases and require Australian rental history. Share rooms in someone's home (the typical MigRent listing) are weekly or fortnightly and accept newcomers. Purpose-built student accommodation is often more expensive but has the lowest barrier to entry.",
        ],
        callouts: [
          {
            variant: "info",
            body: "Australian terms cheat sheet: bond = security deposit, condition report = move-in damage record, REA = real estate agent, share house = renting one room in a home with housemates.",
          },
        ],
      },
      {
        id: "what-you-need-ready",
        title: "What You Need Before You Apply",
        content: [
          "Most newcomers do not have an Australian rental history, an Australian bank account, or an Australian phone number on day one. That is fine. MigRent hosts who list to migrants and students expect this. What they want instead is identity verification, proof you can pay, and a short bio that helps them feel comfortable.",
        ],
        checklist: [
          "Passport (photo page)",
          "Visa grant notice (PDF from VEVO or your immigration email)",
          "Confirmation of Enrolment (CoE) if you are a student",
          "Employer offer letter or recent payslips if you are working",
          "Bank statement or evidence of savings if you are not yet working",
          "A short profile bio: who you are, what you study or do, when you arrive",
          "A clear profile photo",
        ],
        tip: "If you do not have an Australian bank account yet, host platforms like MigRent accept international cards for the first payment. Open a local account in your first week so weekly rent is easier.",
      },
      {
        id: "search-and-shortlist",
        title: "Search Smart and Shortlist",
        content: [
          "Rental demand is highest in late January, February, June and July (the start of academic terms). Plan to start your search at least four weeks before you need a room. Search by suburb, public transport access, and distance to your campus or workplace. Read each listing fully. Look for: price clarity (is the bond stated, are bills included), photos of the actual room, and a host with a verified profile.",
        ],
        callouts: [
          {
            variant: "warning",
            title: "If a listing is unusually cheap, slow down",
            body: "Scammers price rooms 20-30% below market to attract panicked newcomers. The cheapest listing in a popular suburb is rarely a real listing. See our scam guide for the patterns to watch.",
          },
        ],
      },
      {
        id: "inspect-before-paying",
        title: "Always Inspect Before You Pay",
        content: [
          "If you are still overseas, ask for a video walk-through on a video call (not a pre-recorded clip). The host should be able to show you the room live, the bathroom, the kitchen, and the front of the building with a current newspaper or today's date visible. If you are already in Australia, visit in person.",
        ],
        checklist: [
          "Confirm the room matches the photos",
          "Check water pressure and that hot water works",
          "Test Wi-Fi speed (use fast.com on the host's network)",
          "Look for signs of mould, water damage, or pest activity",
          "Open windows and doors to check airflow and locks",
          "Confirm what is included (bills, furniture, kitchenware)",
        ],
      },
      {
        id: "pay-and-protect",
        title: "Pay Safely and Get Everything in Writing",
        content: [
          "Pay through MigRent. Bond is held in trust and only released to the host if you both agree, or after a mediation outcome. Never send rent or bond directly to a host's personal bank account, never use Western Union or wire transfer, and never pay before you have inspected (in person or by live video).",
          "Within the first 48 hours of moving in, complete a condition report. Photograph every room, note any damage, and submit it through the platform. This single step protects your bond at move-out more than anything else.",
        ],
        callouts: [
          {
            variant: "critical",
            title: "Never pay outside the platform",
            body: "Anyone asking you to pay by gift card, cryptocurrency, Western Union, or wire transfer is running a scam. Stop, do not pay, and report the listing inside MigRent.",
          },
        ],
      },
      {
        id: "after-move-in",
        title: "After You Move In",
        content: [
          "Set up your local bank account, register your address with your bank, your university, and your visa-related contact information. Open a local SIM. Save the contact details of your nearest GP, your housemates, and the local council. Read our 'First Week Checklist' for the full list.",
        ],
      },
    ],
    commonMistakes: [
      "Paying bond before inspecting (in person or via live video).",
      "Sending money outside MigRent because the host promised a discount.",
      "Skipping the condition report in the first 48 hours.",
      "Signing nothing in writing, then having no proof of what was agreed.",
      "Searching only one week before arrival in February or July.",
    ],
    officialResources: [
      { label: "VEVO - Visa Entitlement Verification Online", url: "https://immi.homeaffairs.gov.au/visas/already-have-a-visa/check-visa-details-and-conditions/check-conditions-online", region: "AU" },
      { label: "NSW Fair Trading - Renting", url: "https://www.nsw.gov.au/housing-and-construction/renting-a-place-to-live", region: "NSW" },
      { label: "Consumer Affairs Victoria - Renting", url: "https://www.consumer.vic.gov.au/housing/renting", region: "VIC" },
      { label: "Residential Tenancies Authority", url: "https://www.rta.qld.gov.au/", region: "QLD" },
    ],
  },

  // ────────────────────────────────────────────────────────────────────────
  // NEW V1 - 2. Documents you need
  // ────────────────────────────────────────────────────────────────────────
  {
    id: "documents-to-rent",
    title: "Documents You Need to Rent in Australia",
    description:
      "The exact paperwork hosts and agents look for, organised for students, working holiday makers, and skilled visa holders.",
    whoFor: "Anyone preparing their first MigRent application or first Australian rental application.",
    whyItMatters:
      "Most rejections come from incomplete applications, not bad applicants. Having the right documents ready triples your acceptance rate.",
    quickAnswer:
      "Have your passport, visa grant notice (or VEVO check), proof of why you are here (CoE for students, offer letter for workers), proof you can pay (bank statement, scholarship letter, or payslips), and a short personal bio. Keep them as PDFs in one folder.",
    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
    gradient: "from-cyan-500 to-blue-500",
    color: "text-cyan-500",
    bgColor: "bg-cyan-50 dark:bg-cyan-500/10",
    difficulty: "Beginner",
    readTime: "5 min read",
    category: "newcomer",
    lastUpdated: "2026-05-09",
    relatedGuides: ["rent-as-new-migrant", "verify-profile", "questions-before-booking"],
    sections: [
      {
        id: "core-identity",
        title: "Core Identity Documents",
        content: [
          "Every host or agent will ask for identity documents. The standard set in Australia is your passport plus one other ID. If you only have your passport, that is enough for most MigRent listings.",
        ],
        checklist: [
          "Passport photo page (high-quality scan, no glare)",
          "Australian driver licence if you have one",
          "ImmiCard if you arrived as a refugee or humanitarian entrant",
          "Australian visa grant notice (the email PDF from Home Affairs)",
        ],
        callouts: [
          {
            variant: "info",
            body: "VEVO is a free government service that lets you (and a host) confirm your visa is current. Run a check before you start applying so you have the printable confirmation ready.",
          },
        ],
      },
      {
        id: "proof-of-purpose",
        title: "Proof of Why You Are in Australia",
        content: [
          "Hosts care less about your salary than about your stability. A document that shows you have a reason to stay reassures them you are not a flight risk.",
        ],
        checklist: [
          "Students: Confirmation of Enrolment (CoE) from your provider",
          "Workers: Employment offer letter or last 2 payslips",
          "Working holiday makers: visa grant + planned location for first month",
          "Skilled migrants: nomination letter or sponsorship details",
          "Family visa: relationship visa grant document",
        ],
      },
      {
        id: "proof-of-funds",
        title: "Proof You Can Pay",
        content: [
          "You do not need an Australian bank statement. An overseas bank statement showing 3-6 months of rent and bond in savings is acceptable. Scholarship letters and sponsor letters also count.",
        ],
        checklist: [
          "Bank statement showing balance equal to bond + 8 weeks rent",
          "Scholarship letter (students)",
          "Recent payslips (3 months) for working applicants",
          "Sponsor letter (sponsored workers or family migrants)",
        ],
        tip: "If your bank statement is in another language, include both the original and a clear English translation. A dated screenshot with your full name visible is acceptable for most hosts.",
      },
      {
        id: "rental-history-substitutes",
        title: "If You Have No Australian Rental History",
        content: [
          "Most newcomers do not. Substitute it with: a reference letter from your previous landlord overseas (translated), a reference from a current employer or university, or a character reference from a community or religious leader. MigRent's verified profile badge counts as a strong signal in itself.",
        ],
      },
      {
        id: "your-bio",
        title: "Your Bio Matters",
        content: [
          "Hosts read 50 applications a week. A 4-line bio that says who you are, what you do, where you are from, and when you arrive will win you bookings over an empty profile.",
        ],
        callouts: [
          {
            variant: "tip",
            body: "Example bio: 'Hi, I'm Aisha. I am starting a Master of Public Health at UNSW in February. I have been renting in shared homes in Lagos for three years. I am quiet, tidy, and looking for a long-term home.'",
          },
        ],
      },
    ],
    commonMistakes: [
      "Sending blurry photos of documents instead of clean PDFs.",
      "Not running a VEVO check before applying.",
      "Listing visa expiry but not visa start date.",
      "Empty bio.",
    ],
    officialResources: [
      { label: "VEVO online check", url: "https://immi.homeaffairs.gov.au/visas/already-have-a-visa/check-visa-details-and-conditions/check-conditions-online", region: "AU" },
      { label: "Home Affairs - visa subclasses", url: "https://immi.homeaffairs.gov.au/visas/getting-a-visa", region: "AU" },
    ],
  },

  // ────────────────────────────────────────────────────────────────────────
  // NEW V1 - 3. How rental bond works
  // ────────────────────────────────────────────────────────────────────────
  {
    id: "how-bond-works",
    title: "Rental Bond in Australia: How It Works and How to Get It Back",
    description:
      "What bond is, how much you pay, who holds it, and the exact steps to recover every dollar at move-out.",
    whoFor: "Anyone paying their first Australian rental bond, especially newcomers unfamiliar with the system.",
    whyItMatters:
      "Bond is usually the largest single payment you make. Knowing how it works protects up to four weeks of rent at move-out.",
    quickAnswer:
      "Bond is a security deposit, usually up to four weeks of rent. It is held in trust by your state's bond authority or by MigRent on behalf of both parties. You get it back in full at move-out if the room is returned in the same condition (minus normal wear). The condition report you complete at move-in is your strongest protection.",
    icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    gradient: "from-emerald-500 to-teal-500",
    color: "text-emerald-500",
    bgColor: "bg-emerald-50 dark:bg-emerald-500/10",
    difficulty: "Beginner",
    readTime: "6 min read",
    category: "money",
    lastUpdated: "2026-05-09",
    disclaimer: LEGAL_DISCLAIMER,
    relatedGuides: ["rent-as-new-migrant", "moving-in-checklist", "renter-rights-basics"],
    sections: [
      {
        id: "what-is-bond",
        title: "What Bond Is",
        content: [
          "Bond is a refundable security deposit. It is not pre-paid rent and it is not income for the host. It exists to cover the cost of damage you may cause during your stay (beyond normal wear and tear) or unpaid rent if you leave early.",
          "Across Australia, bond is generally limited to four weeks of rent. Some states cap it lower for low-rent or rooming-style accommodation. MigRent always shows the bond amount clearly before you book.",
        ],
      },
      {
        id: "who-holds-it",
        title: "Who Holds Your Bond",
        content: [
          "In a formal lease through a real estate agent, your bond is lodged with your state's bond authority within a set number of business days (for example, the Rental Bonds Online service in NSW or the RTBA in Victoria).",
          "On MigRent, the platform holds bond in a regulated trust account. The host cannot withdraw it on their own. At move-out, the bond is released back to you within a few business days unless the host raises a claim, in which case the dispute process begins.",
        ],
        callouts: [
          {
            variant: "critical",
            title: "Never pay bond into a personal account",
            body: "If a host asks you to deposit bond into their personal bank account or via a third-party app, that is the single biggest red flag in Australian rental scams. Stop and report the listing.",
          },
        ],
      },
      {
        id: "condition-report",
        title: "The Condition Report Saves Your Bond",
        content: [
          "The condition report is a written and photographic record of the state of the property when you move in. Anything you do not record is assumed to be your damage at move-out. Spend 30 minutes on this. It is the difference between a full refund and an argument.",
        ],
        checklist: [
          "Photograph each room with the door open and lights on",
          "Photograph corners of carpets, walls, and bathrooms in detail",
          "Note all marks, scratches, stains, dents, and odours in writing",
          "Check that all appliances work (stove, fridge, washing machine)",
          "Photograph furniture from multiple angles",
          "Note any damaged or missing fly screens, blinds, locks, or keys",
          "Submit the report to MigRent within 48 hours of move-in",
        ],
      },
      {
        id: "getting-it-back",
        title: "Getting Your Bond Back at Move-Out",
        content: [
          "Two weeks before move-out, give your host written notice of your departure date. On move-out day, repeat your condition report from the move-in photos. Clean the room to the same standard you found it. Take final photos.",
        ],
        callouts: [
          {
            variant: "success",
            title: "Bond-return formula",
            body: "Move-in photos + 48-hour condition report + clean handover + dated move-out photos = full bond back, in almost every case.",
          },
        ],
      },
      {
        id: "if-disputed",
        title: "If the Host Disputes the Bond",
        content: [
          "Hosts can claim part or all of the bond for damage beyond normal wear, unpaid rent, or unpaid bills owed to them. If you disagree, do not panic. Submit your move-in photos, the condition report, and your move-out photos through MigRent's dispute system. A mediator reviews both sides and decides.",
          "If you are not satisfied with mediation, you can escalate to your state's tenancy tribunal (NCAT, VCAT, QCAT, or equivalent). These tribunals are free or low-cost and designed to be used without a lawyer.",
        ],
      },
    ],
    commonMistakes: [
      "Skipping the condition report in the first 48 hours.",
      "Cleaning hastily and leaving small marks that get charged at full repair rates.",
      "Throwing out boxed receipts that prove items were already damaged.",
      "Paying bond outside the platform.",
    ],
    officialResources: [
      { label: "NSW Rental Bonds Online", url: "https://www.nsw.gov.au/housing-and-construction/renting-a-place-to-live/rental-bonds", region: "NSW" },
      { label: "VIC Residential Tenancies Bond Authority", url: "https://www.consumer.vic.gov.au/housing/renting/bonds", region: "VIC" },
      { label: "QLD RTA - Bonds", url: "https://www.rta.qld.gov.au/forms-resources/forms/bond-forms", region: "QLD" },
    ],
  },

  // ────────────────────────────────────────────────────────────────────────
  // NEW V1 - 4. Avoid rental scams
  // ────────────────────────────────────────────────────────────────────────
  {
    id: "avoid-rental-scams",
    title: "How to Spot a Rental Scam (and What to Do Next)",
    description:
      "The exact patterns scammers use to target migrants and students, and how to stop a scam before you lose money.",
    whoFor: "Anyone searching for a rental online, especially before they have arrived in Australia.",
    whyItMatters:
      "Migrants and students are the single most-targeted group for rental scams in Australia. Most losses are preventable in under 60 seconds.",
    quickAnswer:
      "If a listing is far cheaper than similar rooms, asks for payment outside the platform, refuses a live video tour, or pressures you to pay today, it is a scam. Pay only through MigRent. Inspect (in person or live video) before paying. Reverse-image search any photo that feels too good to be true.",
    icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
    gradient: "from-red-500 to-rose-500",
    color: "text-red-500",
    bgColor: "bg-red-50 dark:bg-red-500/10",
    difficulty: "Beginner",
    readTime: "6 min read",
    category: "safety",
    lastUpdated: "2026-05-09",
    relatedGuides: ["rent-as-new-migrant", "report-suspicious-listing", "questions-before-booking"],
    sections: [
      {
        id: "scam-patterns",
        title: "The Five Most Common Scam Patterns",
        content: [
          "Australian rental scams targeting newcomers follow a small number of repeatable scripts. If you can recognise the script, you cannot be caught by it.",
        ],
        checklist: [
          "Price 20-40% below comparable rooms in the same suburb",
          "'Owner is overseas, key will be sent by courier after deposit'",
          "Refusal to do a live video walk-through (only sends pre-recorded clips)",
          "Pressure: 'three other people want this, pay today to lock in'",
          "Asks for payment by Western Union, gift card, crypto, or personal bank transfer",
        ],
        callouts: [
          {
            variant: "critical",
            title: "If two of these are true, it is a scam",
            body: "You do not need to be sure. Two matching signs is enough to walk away. Real hosts will not pressure you and will gladly do a live video tour.",
          },
        ],
      },
      {
        id: "verify-the-listing",
        title: "Verify the Listing in 60 Seconds",
        content: [
          "Right-click the main photo in the listing and choose 'Search image with Google'. If the same photo appears on Realestate.com.au, Domain, or a different city's listing, the photo is stolen and the listing is fake.",
          "Search the street address in Google Maps. Confirm the building exists and matches the photos. Ask the host to send a current photo of the front door with today's date written on a piece of paper. A real host will do this in two minutes. A scammer will refuse or stall.",
        ],
      },
      {
        id: "verify-the-host",
        title: "Verify the Host",
        content: [
          "On MigRent, look for the verified badge, the host's profile age, and at least one review or completed booking. New hosts can be legitimate, but a brand-new host with no reviews who is asking you to pay outside the platform is the scam template.",
        ],
        callouts: [
          {
            variant: "info",
            body: "Government and university websites publish lists of impersonated agencies and known scams. A 30-second search of the agency name plus the word 'scam' often exposes a problem.",
          },
        ],
      },
      {
        id: "what-to-do",
        title: "What to Do If You Spot a Scam",
        content: [
          "Stop messaging the lister immediately. Do not send any more documents or photos of yourself. Inside MigRent, tap 'Report listing' and choose 'Suspected scam'. Take screenshots of the conversation in case the listing is removed.",
          "Report it to Scamwatch (run by the ACCC) and to the police if you have already paid. If you paid by card, contact your bank within 24 hours and request a chargeback.",
        ],
      },
      {
        id: "if-you-paid",
        title: "If You Have Already Paid",
        content: [
          "Do not delete the messages. Do not pay any 'recovery fee' someone claims will get your money back; that is a follow-up scam. Contact your bank, file a Scamwatch report, and reach MigRent support. We will work with the bank and authorities where we can.",
        ],
      },
    ],
    commonMistakes: [
      "Treating low price as a deal instead of a warning.",
      "Accepting a pre-recorded video as proof.",
      "Paying outside the platform because the host offered a 'discount'.",
      "Sending copies of your passport before verifying the listing.",
    ],
    officialResources: [
      { label: "Scamwatch (ACCC)", url: "https://www.scamwatch.gov.au/types-of-scams/buying-or-selling/rental-and-real-estate-scams", region: "AU" },
      { label: "ReportCyber", url: "https://www.cyber.gov.au/report-and-recover/report", region: "AU" },
      { label: "Reverse image search", url: "https://images.google.com/", region: "AU" },
    ],
  },

  // ────────────────────────────────────────────────────────────────────────
  // NEW V1 - 5. Inspect a room or house
  // ────────────────────────────────────────────────────────────────────────
  {
    id: "inspect-room-house",
    title: "How to Inspect a Room or House Before You Book",
    description:
      "A complete inspection checklist for both in-person visits and live video tours, plus the questions that reveal hidden problems.",
    whoFor: "Anyone about to view or video-call a rental for the first time.",
    whyItMatters:
      "Photos hide everything important: water pressure, smell, noise, damp, and how clean the kitchen really is. Five minutes of inspection saves 50 weeks of regret.",
    quickAnswer:
      "Inspect every room with all lights on and curtains open. Run all taps, flush the toilet, test Wi-Fi speed, sniff for mould, check window locks, and ask to see the actual bed and storage you will use. Take photos. If you cannot visit, request a live (not pre-recorded) video tour.",
    icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
    gradient: "from-rose-500 to-pink-500",
    color: "text-rose-500",
    bgColor: "bg-rose-50 dark:bg-rose-500/10",
    difficulty: "Beginner",
    readTime: "6 min read",
    category: "safety",
    lastUpdated: "2026-05-09",
    relatedGuides: ["questions-before-booking", "moving-in-checklist", "avoid-rental-scams"],
    sections: [
      {
        id: "before-you-go",
        title: "Before You Go",
        content: [
          "Charge your phone. Bring a measuring tape if furniture matters to you. Note the weather forecast: a rainy inspection day is the best moment to spot leaks and damp.",
        ],
      },
      {
        id: "the-room",
        title: "Inspect the Bedroom",
        content: [
          "The bedroom is your sanctuary. Spend the most time here.",
        ],
        checklist: [
          "Door closes and locks properly",
          "Bed is the size advertised (single, double, queen)",
          "Mattress is clean, no stains, no smell",
          "Storage: wardrobe space, drawers, hangers",
          "Power points: at least two working sockets",
          "Light switch and ceiling light work",
          "Windows open and close, lock, have screens",
          "No mould around windows or in corners",
          "Wall and skirting damage photographed",
        ],
      },
      {
        id: "kitchen-bathroom",
        title: "Inspect the Kitchen and Bathroom",
        content: [
          "These are the rooms where hidden problems hide. Slow drainage, weak hot water, and pest signs all live here.",
        ],
        checklist: [
          "Hot water reaches the kitchen tap within 30 seconds",
          "Shower has both hot and good water pressure",
          "Toilet flushes and refills cleanly",
          "All hotplates and oven turn on",
          "Fridge is clean and cold",
          "No droppings, ants, or insect trails under sinks",
          "Bins, mop, vacuum, or cleaning supplies present if shared",
        ],
      },
      {
        id: "common-areas",
        title: "Common Areas and the Building",
        content: [
          "Walk the entire flat. Check the entry, stairwell, and street access. Look for: working hallway lighting, working smoke alarms (press and test if allowed), secure front door, and any signs of damp on shared walls.",
        ],
        callouts: [
          {
            variant: "warning",
            title: "Smoke alarms are mandatory",
            body: "By law, every Australian rental must have working smoke alarms. If they are missing or have no battery, that is a serious sign the host is not maintaining the property.",
          },
        ],
      },
      {
        id: "video-tour",
        title: "If You Cannot Visit in Person",
        content: [
          "Insist on a live video call (WhatsApp, Zoom, Google Meet, FaceTime). Ask the host to walk through the entire property in one take. Have them open every door, run the kitchen tap, show the front of the building, and hold up a piece of paper with today's date.",
          "A pre-recorded video is not enough. Scammers re-use the same recording to sell the same fake room ten times.",
        ],
        callouts: [
          {
            variant: "critical",
            body: "If a host refuses a live video tour, do not book. Real hosts know newcomers cannot visit and will happily spend ten minutes showing the place live.",
          },
        ],
      },
      {
        id: "questions-to-ask",
        title: "Five Questions That Reveal Hidden Problems",
        content: [
          "Ask all five. Listen for hesitation as much as the answer.",
        ],
        checklist: [
          "How long has the current housemate lived here?",
          "What is the rent breakdown - is internet, electricity, gas, water included?",
          "Are there any planned building works, inspections, or open homes?",
          "What is the noise like at night and on weekends?",
          "How does bond return work and have any past tenants had deductions?",
        ],
      },
    ],
    commonMistakes: [
      "Visiting only at daytime and missing how loud the place is at night.",
      "Not running the shower because it felt awkward.",
      "Only photographing your future room and forgetting common spaces.",
      "Accepting a pre-recorded video instead of a live tour.",
    ],
  },

  // ────────────────────────────────────────────────────────────────────────
  // NEW V1 - 6. Renter rights basics
  // ────────────────────────────────────────────────────────────────────────
  {
    id: "renter-rights-basics",
    title: "Renter Rights for Migrants and International Students",
    description:
      "A plain-English summary of your rights as a renter in Australia, regardless of your visa type.",
    whoFor: "Anyone renting in Australia who wants to understand the basic protections the law gives them.",
    whyItMatters:
      "You have the same core rights as any Australian renter. Knowing what they are is what stops a host from taking advantage.",
    quickAnswer:
      "You have the right to a safe home, your bond returned at move-out, written notice before any change, no discrimination based on nationality or visa, and access to a free state tribunal if a dispute escalates. These rights apply on every visa type.",
    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
    gradient: "from-indigo-500 to-blue-500",
    color: "text-indigo-500",
    bgColor: "bg-indigo-50 dark:bg-indigo-500/10",
    difficulty: "Intermediate",
    readTime: "7 min read",
    category: "legal",
    lastUpdated: "2026-05-09",
    disclaimer: LEGAL_DISCLAIMER,
    relatedGuides: ["how-bond-works", "host-rule-breach", "rent-as-new-migrant"],
    sections: [
      {
        id: "rights-summary",
        title: "Your Core Rights",
        content: [
          "Tenancy law in Australia is set at the state and territory level, but the core protections are similar everywhere. They apply whether you are on a student visa, a working holiday visa, a 482, a partner visa, or PR.",
        ],
        checklist: [
          "Right to a safe, clean, and reasonable home",
          "Right to have your bond held in trust and returned in full at move-out, minus only valid claims",
          "Right to written notice before changes (rent rises, inspections, ending the tenancy)",
          "Right to privacy: hosts and landlords must give notice before entering",
          "Right to repairs within reasonable time (urgent repairs are usually 24-48 hours)",
          "Right to take a dispute to a free state tribunal",
          "Right not to be discriminated against based on nationality, race, or visa status",
        ],
      },
      {
        id: "what-host-cannot-do",
        title: "What a Host or Landlord Cannot Do",
        content: [
          "Some practices are illegal under Australian law and trump anything written into a contract.",
        ],
        callouts: [
          {
            variant: "critical",
            title: "Always illegal",
            body: "Holding your passport, refusing to return bond as 'punishment', cutting off your power or water, changing locks without notice, or evicting you in retaliation for a complaint. If any of these happen, contact your state's Fair Trading immediately.",
          },
        ],
      },
      {
        id: "discrimination",
        title: "Discrimination Is Illegal",
        content: [
          "Refusing to rent to you because of your nationality, religion, race, or visa status is illegal under Commonwealth and state anti-discrimination laws. MigRent has a zero-tolerance policy and bans hosts found doing this.",
          "If you experience discrimination, you can lodge a complaint with the Australian Human Rights Commission or your state's anti-discrimination body. You can also report the host inside MigRent.",
        ],
      },
      {
        id: "tribunal-help",
        title: "Free State Tribunals",
        content: [
          "Every state has a tribunal that handles rental disputes. They are designed to be used without a lawyer. They are free or low-cost and they can order bond refunds, repairs, or compensation.",
        ],
      },
    ],
    commonMistakes: [
      "Believing you have fewer rights because you are on a temporary visa. You do not.",
      "Letting a host hold your passport. This is never required and is illegal.",
      "Paying for repairs that are the host's responsibility without first asking.",
    ],
    officialResources: [
      { label: "Australian Human Rights Commission", url: "https://humanrights.gov.au/our-work/employers/complaints-guides/discrimination-and-human-rights-complaints", region: "AU" },
      { label: "NSW Fair Trading", url: "https://www.nsw.gov.au/departments-and-agencies/fair-trading", region: "NSW" },
      { label: "Consumer Affairs Victoria", url: "https://www.consumer.vic.gov.au/", region: "VIC" },
      { label: "Tenants Queensland", url: "https://tenantsqld.org.au/", region: "QLD" },
      { label: "Tenants' Union of NSW", url: "https://www.tenants.org.au/", region: "NSW" },
    ],
  },

  // ────────────────────────────────────────────────────────────────────────
  // NEW V1 - 7. Rent and bills
  // ────────────────────────────────────────────────────────────────────────
  {
    id: "rent-and-bills",
    title: "Rent, Bills, and What \"All Inclusive\" Really Means",
    description:
      "The full breakdown of what is and is not included in a typical Australian rent, with realistic monthly cost estimates.",
    whoFor: "Anyone planning a rental budget for the first time.",
    whyItMatters:
      "The advertised weekly rent is rarely the full cost. Knowing what 'bills included' actually covers is the difference between a workable budget and a stressful month.",
    quickAnswer:
      "Rent in Australia is quoted weekly. 'Bills included' usually means electricity, gas, water, and Wi-Fi - but always confirm in writing. Add roughly $30-50 per week per person for bills if they are not included. Budget for a one-off bond up to four weeks rent at move-in.",
    icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
    gradient: "from-amber-500 to-orange-500",
    color: "text-amber-500",
    bgColor: "bg-amber-50 dark:bg-amber-500/10",
    difficulty: "Beginner",
    readTime: "5 min read",
    category: "money",
    lastUpdated: "2026-05-09",
    relatedGuides: ["how-bond-works", "questions-before-booking", "rent-as-new-migrant"],
    sections: [
      {
        id: "what-is-included",
        title: "What 'Bills Included' Actually Covers",
        content: [
          "There is no single legal definition of 'bills included'. Some hosts mean only electricity, others mean everything including streaming subscriptions. Always ask for a written breakdown before paying.",
        ],
        checklist: [
          "Electricity",
          "Gas (cooking and hot water)",
          "Water and sewerage",
          "Internet (Wi-Fi)",
          "Council rates (usually the host's cost, but worth confirming)",
          "Body corporate / strata fees (usually the host's cost)",
          "Streaming services or shared subscriptions (usually NOT included)",
        ],
      },
      {
        id: "if-not-included",
        title: "Cost Estimates if Bills Are Separate",
        content: [
          "If your rent does not include bills, expect roughly:",
        ],
        callouts: [
          {
            variant: "info",
            title: "Typical share-house bills (per person, per week)",
            body: "Electricity: $10-20. Gas: $5-10. Water: $5-8. Internet: $10-15 split between housemates. These are rough estimates and vary by season and household size.",
          },
        ],
      },
      {
        id: "upfront-costs",
        title: "Upfront Costs at Move-In",
        content: [
          "Plan for a single payment that covers up to four weeks of rent (bond) plus one to two weeks of rent in advance. On a $300 per week room, that is $1,200 bond + $300-600 advance = $1,500-1,800.",
          "On MigRent, this is a single transparent payment. There are no agency fees, no application fees, and no 'reservation fees'.",
        ],
      },
      {
        id: "rent-rises",
        title: "Rent Rises",
        content: [
          "Rent in Australia can be increased, but not without notice. Most states require at least 60 days written notice and limit how often rent can rise (usually no more than once every 6 or 12 months). On MigRent, weekly bookings have a fixed rate for the duration of the booking.",
        ],
        callouts: [
          {
            variant: "warning",
            body: "If a host raises rent mid-stay without proper notice, that is a breach. Save the message and contact MigRent support or your state's Fair Trading body.",
          },
        ],
      },
    ],
    commonMistakes: [
      "Assuming 'bills included' includes Wi-Fi.",
      "Forgetting to budget for bond as a separate upfront cost.",
      "Overlooking electricity costs in winter (heating triples bills in colder cities).",
    ],
  },

  // ────────────────────────────────────────────────────────────────────────
  // NEW V1 - 8. Questions to ask before you book
  // ────────────────────────────────────────────────────────────────────────
  {
    id: "questions-before-booking",
    title: "Questions to Ask Before You Book a Room",
    description:
      "The 15 questions that protect you from surprise rules, hidden costs, and bad housemate fits.",
    whoFor: "Anyone messaging a host before sending a booking request.",
    whyItMatters:
      "A 5-minute conversation before booking prevents the most common move-in regrets: hidden bills, strict rules, and incompatible housemates.",
    quickAnswer:
      "Ask about cost (bills, bond, deposits), rules (guests, smoking, noise), housemates (who else lives there), the room itself (storage, internet, light), and what happens if something goes wrong. Save the answers in writing.",
    icon: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z",
    gradient: "from-violet-500 to-purple-500",
    color: "text-violet-500",
    bgColor: "bg-violet-50 dark:bg-violet-500/10",
    difficulty: "Beginner",
    readTime: "4 min read",
    category: "newcomer",
    lastUpdated: "2026-05-09",
    relatedGuides: ["inspect-room-house", "rent-and-bills", "avoid-rental-scams"],
    sections: [
      {
        id: "money-questions",
        title: "Money Questions",
        content: [
          "Get every cost in writing before you commit.",
        ],
        checklist: [
          "What is the weekly rent and the bond amount?",
          "Are electricity, gas, water, and internet included?",
          "How and when is rent paid (weekly or fortnightly)?",
          "Is there any extra deposit beyond the bond?",
          "What is the minimum stay and is there an early-leave fee?",
        ],
      },
      {
        id: "rules-questions",
        title: "Rules and Lifestyle Questions",
        content: [
          "These reveal whether the home actually fits your life.",
        ],
        checklist: [
          "What are the house rules around guests, overnight visitors, and parties?",
          "Is smoking, vaping, or alcohol allowed?",
          "Are pets allowed?",
          "Are there quiet hours or shared schedules (cleaning rotas, kitchen times)?",
          "Is the kitchen vegetarian, halal, or any specific food preference?",
        ],
      },
      {
        id: "housemate-questions",
        title: "Housemate Questions",
        content: [
          "Who you live with shapes your daily life more than the room itself.",
        ],
        checklist: [
          "How many people live in the property?",
          "What do the other housemates do (study, work, age range)?",
          "Are housemates open to socialising or prefer quiet co-existence?",
          "Has anyone moved out recently and why?",
        ],
      },
      {
        id: "room-questions",
        title: "Room and Property Questions",
        content: [
          "Specifics that photos do not show.",
        ],
        checklist: [
          "What is the actual internet speed (Mbps)?",
          "Is the bedroom carpeted, or is there storage in the wardrobe?",
          "Which direction does the bedroom face (light and warmth)?",
          "Is parking included if I have a car or bike?",
          "Are there working smoke alarms?",
        ],
      },
      {
        id: "if-something-goes-wrong",
        title: "What If Something Goes Wrong",
        content: [
          "Great hosts answer these clearly. Vague answers are a red flag.",
        ],
        checklist: [
          "Who do I contact for repairs and how fast?",
          "What is the bond-return process at move-out?",
          "If I need to leave early, what is the policy?",
          "If a housemate behaves badly, how is it handled?",
        ],
        callouts: [
          {
            variant: "tip",
            body: "Always ask for answers in writing through MigRent's chat. If a host insists on phone-only conversations, that is a sign they may not want a record.",
          },
        ],
      },
    ],
    commonMistakes: [
      "Asking about price but not about rules.",
      "Not asking who else lives there.",
      "Trusting a verbal agreement instead of a written reply.",
    ],
  },

  // ────────────────────────────────────────────────────────────────────────
  // NEW V1 - 9. First week in Australia housing checklist
  // ────────────────────────────────────────────────────────────────────────
  {
    id: "first-week-checklist",
    title: "Your First Week in Australia: Housing Checklist",
    description:
      "A day-by-day checklist for the seven days after you arrive, focused on locking in housing, money, and essentials.",
    whoFor: "Anyone arriving in Australia for the first time and needing to settle quickly.",
    whyItMatters:
      "Your first week sets up the next year. Get bank, SIM, address, and rental sorted in the first seven days and everything else gets easier.",
    quickAnswer:
      "Day 1-2: short-term accommodation, SIM card, bank account. Day 3-4: rental search and inspections. Day 5: pay bond and move into your room. Day 6-7: register your address, set up a Tax File Number, locate your nearest GP and grocery store.",
    icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
    gradient: "from-teal-500 to-cyan-500",
    color: "text-teal-500",
    bgColor: "bg-teal-50 dark:bg-teal-500/10",
    difficulty: "Beginner",
    readTime: "6 min read",
    category: "newcomer",
    lastUpdated: "2026-05-09",
    relatedGuides: ["rent-as-new-migrant", "moving-in-checklist", "documents-to-rent"],
    sections: [
      {
        id: "day-1-2",
        title: "Day 1-2: Land and Stabilise",
        content: [
          "Stay in short-term accommodation for the first 2-7 nights. Hostels, university short-stay, or short MigRent bookings work. Do not commit to a long-term room from the airport.",
        ],
        checklist: [
          "Buy a local SIM (Telstra, Optus, Vodafone, or low-cost MVNOs like Boost or Amaysim)",
          "Open an Australian bank account (Commonwealth, ANZ, NAB, Westpac, ING all open accounts in branch with passport + visa)",
          "Set up your phone with the new SIM and bank app",
          "Save emergency contacts: 000 (police, fire, ambulance), nearest hospital, your university or employer",
        ],
      },
      {
        id: "day-3-4",
        title: "Day 3-4: Find a Rental",
        content: [
          "Now that you have a local SIM and bank account, hosts will respond faster. Run a fresh MigRent search with your verified profile. Schedule 3-4 inspections in one afternoon, in the same area, to compare back-to-back.",
        ],
      },
      {
        id: "day-5",
        title: "Day 5: Move In",
        content: [
          "Pay through MigRent. Complete your condition report on the same day. Photograph every room. Ask for the Wi-Fi password, key arrangements, and the host's preferred contact.",
        ],
        callouts: [
          {
            variant: "success",
            title: "Save your move-in receipt",
            body: "Your booking confirmation is also your proof of address for some services. Keep it accessible in your email.",
          },
        ],
      },
      {
        id: "day-6-7",
        title: "Day 6-7: Lock In the Essentials",
        content: [
          "Register your new address with your bank, university, and employer. Apply for a Tax File Number (TFN) through the ATO website if you will be working. Register with Medicare if you are eligible. Locate your nearest GP, pharmacy, and grocery store.",
        ],
        checklist: [
          "Update address with your bank",
          "Update address with your university or employer",
          "Apply for a Tax File Number (free, online via ATO)",
          "Register with Medicare if eligible",
          "Locate nearest GP, pharmacy, and supermarket",
          "Test the public transport route to your campus or workplace",
        ],
      },
    ],
    commonMistakes: [
      "Committing to a room from the airport without inspecting.",
      "Skipping the TFN application; you will be taxed at the highest rate without it.",
      "Forgetting Medicare registration in the first month.",
    ],
    officialResources: [
      { label: "ATO - Apply for a Tax File Number", url: "https://www.ato.gov.au/individuals-and-families/tax-file-number/apply-for-a-tfn", region: "AU" },
      { label: "Medicare - Enrolling", url: "https://www.servicesaustralia.gov.au/medicare", region: "AU" },
    ],
  },

  // ────────────────────────────────────────────────────────────────────────
  // NEW V1 - 10. Report a suspicious listing
  // ────────────────────────────────────────────────────────────────────────
  {
    id: "report-suspicious-listing",
    title: "A Listing Feels Off: How to Report It Safely",
    description:
      "What to do if a listing or host on MigRent or anywhere else triggers your instincts. Including how to keep evidence and stay safe.",
    whoFor: "Anyone who has just spotted a listing or behaviour that does not feel right.",
    whyItMatters:
      "Reporting a bad listing protects you and every other newcomer who would have seen it next.",
    quickAnswer:
      "Stop replying. Take screenshots of the listing and the conversation. Inside MigRent, tap 'Report listing' and choose the closest reason. If you have already paid, contact your bank within 24 hours. Report to Scamwatch and police if money has been lost.",
    icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
    gradient: "from-orange-500 to-red-500",
    color: "text-orange-500",
    bgColor: "bg-orange-50 dark:bg-orange-500/10",
    difficulty: "Beginner",
    readTime: "4 min read",
    category: "safety",
    lastUpdated: "2026-05-09",
    relatedGuides: ["avoid-rental-scams", "questions-before-booking", "renter-rights-basics"],
    sections: [
      {
        id: "trust-the-feeling",
        title: "Trust the Feeling",
        content: [
          "If something feels wrong, treat it as a signal. Most successful scams rely on the victim ignoring an early warning to avoid feeling rude. You owe a stranger online no politeness. Walk away.",
        ],
      },
      {
        id: "preserve-evidence",
        title: "Preserve the Evidence",
        content: [
          "Before you do anything else, screenshot. Capture the full listing page, every message, payment requests, and any phone numbers or off-platform links. Save the host's profile name and ID.",
        ],
        checklist: [
          "Screenshot the full listing page (scroll through and capture all)",
          "Screenshot every message in the chat thread",
          "Screenshot any external links the host sent",
          "Note the date and time of the conversation",
          "Save copies in your email or cloud drive",
        ],
      },
      {
        id: "report-on-migrent",
        title: "Report Inside MigRent",
        content: [
          "Open the listing. Tap the menu and choose 'Report listing'. Select 'Suspected scam', 'Discriminatory', 'Misleading photos or price', or 'Inappropriate behaviour'. Add a short description and attach screenshots if possible.",
          "MigRent's trust team reviews reports within one business day. We do not share your name with the reported host.",
        ],
      },
      {
        id: "if-money-is-lost",
        title: "If You Have Already Paid",
        content: [
          "Contact your bank or card issuer within 24 hours. Ask for a chargeback. File a Scamwatch report. If you paid by direct deposit and the bank cannot recover the funds, contact your local police station to file a report and obtain a reference number.",
        ],
        callouts: [
          {
            variant: "warning",
            title: "Beware of recovery scams",
            body: "After a scam, you may be contacted by someone offering to recover your money for a fee. This is always a follow-up scam. Banks, MigRent, and police never charge fees to investigate.",
          },
        ],
      },
    ],
    officialResources: [
      { label: "Scamwatch", url: "https://www.scamwatch.gov.au/report-a-scam", region: "AU" },
      { label: "ReportCyber", url: "https://www.cyber.gov.au/report-and-recover/report", region: "AU" },
    ],
  },

  // ────────────────────────────────────────────────────────────────────────
  // EXISTING - kept (lightly enriched with metadata) - Host Your First Room
  // ────────────────────────────────────────────────────────────────────────
  {
    id: "host-first",
    title: "Host Your First Room",
    description:
      "A step-by-step walkthrough to get your spare room listed on MigRent and welcome your very first seeker.",
    whoFor: "Property owners and lead tenants listing a room on MigRent for the first time.",
    whyItMatters:
      "Your first listing sets your reputation. The choices you make in the first hour shape your bookings for the year.",
    quickAnswer:
      "Take five well-lit photos, write a clear description that mentions the nearest train or bus stop, set a price within 10% of the suburb median, and write house rules in plain language. Your first booking usually arrives within a week.",
    icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    gradient: "from-blue-500 to-indigo-500",
    color: "text-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-500/10",
    difficulty: "Beginner",
    readTime: "5 min read",
    category: "owner",
    lastUpdated: "2026-05-09",
    relatedGuides: ["list-property", "superhost", "earnings"],
    sections: [
      {
        id: "create-listing",
        title: "Create Your Listing",
        content: [
          "Getting started on MigRent is straightforward. Navigate to your dashboard and click the \"List a Room\" button to begin. You will be guided through a simple form that asks for your property address, the type of room you are offering (private room, shared room, or entire unit), and a short headline that will appear in search results.",
          "Take your time filling out the description field. Seekers on MigRent are often newly arrived migrants who may not be familiar with Australian suburbs, so mention nearby public transport stops, supermarkets, universities, or employment hubs. A clear, honest description builds trust and reduces the number of back-and-forth messages before a booking.",
          "Once you have completed the basic details, MigRent will auto-generate a preview of your listing card so you can see exactly how it will appear to seekers browsing the platform.",
        ],
        tip: "Include the distance to the nearest train or bus stop in your listing title. Seekers searching from overseas rank transport access as one of their top priorities.",
      },
      {
        id: "add-photos",
        title: "Add Photos That Stand Out",
        content: [
          "Listings with at least five high-quality photos receive more enquiries than those with only one or two images. Use natural daylight wherever possible and photograph each room from the doorway to give a sense of the full space. Include shots of the bedroom, bathroom, kitchen, any common living areas, and the front of the property.",
          "Avoid using heavy filters or wide-angle lenses that distort the room size. Seekers appreciate accuracy, and misleading photos are the leading cause of disputes on rental platforms in Australia. If the room is furnished, make the bed and remove personal clutter before photographing.",
        ],
        tip: "Photograph the view from the bedroom window. Many seekers are relocating from abroad and want to visualise the neighbourhood before they arrive.",
      },
      {
        id: "set-pricing",
        title: "Set Competitive Pricing",
        content: [
          "MigRent provides a suburb-level pricing guide based on recent rental data from across Australia. When you enter your suburb, you will see the median weekly rent for comparable room types in your area. We recommend pricing within ten percent of the median to attract seekers quickly while ensuring fair returns.",
          "You can choose between weekly or fortnightly billing cycles. Most seekers on working holiday or student visas prefer weekly payments because they align with casual pay cycles. If you offer a discount for longer stays, toggle the long-stay discount option in your pricing settings.",
        ],
        tip: "Offering your first two weeks at a slight discount can help you secure an initial booking and start building reviews quickly.",
      },
      {
        id: "house-rules",
        title: "Define House Rules",
        content: [
          "Clear house rules prevent misunderstandings and protect both you and your seeker. MigRent provides a template with common rules covering quiet hours, guest policies, smoking, pets, shared kitchen etiquette, and laundry schedules. You can customise each rule or add your own.",
          "Be specific rather than vague. Instead of writing \"keep the kitchen clean,\" specify expectations such as \"wash and put away dishes within two hours of use\" or \"wipe down the stovetop after cooking.\" Seekers from different cultural backgrounds will appreciate the clarity, and it gives everyone a fair reference point if any issues arise.",
        ],
        tip: "Translate your house rules into the languages most common among your expected seekers. MigRent can auto-translate rules into multiple languages with one click.",
      },
      {
        id: "welcome-seeker",
        title: "Welcome Your First Seeker",
        content: [
          "Once a seeker books your room, you will receive a notification with their verified profile, expected arrival date, and any messages they have sent. Respond promptly to confirm check-in logistics such as key collection, access codes, and parking details.",
          "First impressions matter. Consider leaving a welcome pack with essentials such as a small bottle of milk, tea bags, a local area map, and a card with your Wi-Fi password and emergency contact number. These small gestures consistently earn five-star reviews.",
        ],
        tip: "Add a printed list of nearby essential services (GP clinic, pharmacy, grocery store, bank) to your welcome pack. Newly arrived migrants will find this incredibly helpful.",
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────────────
  // EXISTING - Find Rentals Fast (kept lightly enriched)
  // ────────────────────────────────────────────────────────────────────────
  {
    id: "find-fast",
    title: "Find Rentals Fast",
    description:
      "Use MigRent's smart filters, alerts, and one-click apply to find a room quickly even before you land in Australia.",
    whoFor: "Seekers searching from overseas or in their first weeks in Australia.",
    quickAnswer:
      "Save your search with up to five filter sets, turn on instant alerts, complete profile verification to unlock one-click apply, and apply within minutes of a new listing going live.",
    icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
    gradient: "from-rose-500 to-pink-500",
    color: "text-rose-500",
    bgColor: "bg-rose-50 dark:bg-rose-500/10",
    difficulty: "Beginner",
    readTime: "4 min read",
    category: "seeker",
    lastUpdated: "2026-05-09",
    relatedGuides: ["verify-profile", "questions-before-booking", "rent-as-new-migrant"],
    sections: [
      {
        id: "smart-filters",
        title: "Set Up Smart Filters",
        content: [
          "MigRent's search engine is built specifically for migrants, so the filters go beyond basic price and location. Start by selecting your preferred city or region, then narrow down by suburb, room type (private, shared, or entire unit), and weekly budget. You can also filter by furnished or unfurnished, bills-included listings, and proximity to specific universities or employment zones.",
          "The platform also offers lifestyle filters that are especially relevant for international arrivals. These include vegetarian-friendly kitchens, female-only households, pet-friendly properties, and listings where the host speaks your language. Combining these filters helps you find a home that genuinely fits your needs rather than just your budget.",
        ],
        tip: "If you are arriving on a student visa, use the \"Near University\" filter and enter your institution's name. MigRent will surface rooms within a thirty-minute commute.",
      },
      {
        id: "enable-alerts",
        title: "Enable Instant Alerts",
        content: [
          "The Australian rental market moves quickly. Enable instant alerts for each saved search. Notifications can come via email or push.",
          "When a new listing matches your criteria, MigRent sends you an alert. The notification includes a summary card so you can decide fast.",
        ],
        tip: "Set alerts for evening hours too. Many hosts publish new listings in the evening after work.",
      },
      {
        id: "save-suburbs",
        title: "Save Your Favourite Suburbs",
        content: [
          "Build a shortlist of neighbourhoods you are interested in. Each saved suburb shows the average room price, number of active listings, and public transport rating.",
          "Compare up to four suburbs side by side, especially useful when weighing affordability against commute time.",
        ],
      },
      {
        id: "one-click-apply",
        title: "Apply with One Click",
        content: [
          "Once your MigRent profile is complete and verified, you unlock one-click apply. This sends the host a standardised application that includes your verified name, profile photo, trust badge status, a short bio, and your preferred move-in date.",
          "Hosts see your application ranked by profile completeness and verification status. Verified seekers are shown first.",
        ],
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────────────
  // EXISTING - Verify Your Profile
  // ────────────────────────────────────────────────────────────────────────
  {
    id: "verify-profile",
    title: "Verify Your Profile",
    description:
      "Complete MigRent's identity verification to earn your trust badge and unlock priority features.",
    whoFor: "Any seeker who wants higher application acceptance rates.",
    quickAnswer:
      "Upload your passport or ID, take a live selfie, and (optionally) confirm your Australian address. Verified seekers are accepted more often than unverified ones.",
    icon: "M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2",
    gradient: "from-green-500 to-emerald-500",
    color: "text-green-500",
    bgColor: "bg-green-50 dark:bg-green-500/10",
    difficulty: "Beginner",
    readTime: "3 min read",
    category: "seeker",
    lastUpdated: "2026-05-09",
    relatedGuides: ["find-fast", "documents-to-rent", "rent-as-new-migrant"],
    sections: [
      {
        id: "id-upload",
        title: "Upload Your ID",
        content: [
          "MigRent accepts a range of identity documents to accommodate migrants at different stages of their Australian journey. You can upload your passport, Australian driver's licence, state-issued photo ID, or ImmiCard.",
          "When uploading, make sure the document is clearly legible with no glare, blur, or cropped edges.",
        ],
        tip: "If your passport uses non-Latin characters, upload both the photo page and the machine-readable zone page.",
      },
      {
        id: "selfie-match",
        title: "Take a Selfie for Matching",
        content: [
          "After uploading your ID, take a live selfie using your device's camera. The process takes less than ten seconds.",
          "Position your face in the on-screen oval, ensure you are in a well-lit area, and remove sunglasses or hats. Your selfie is encrypted and never shared with hosts.",
        ],
        tip: "Use front-facing natural light. Avoid standing with a window behind you.",
      },
      {
        id: "address-confirmation",
        title: "Confirm Your Address",
        content: [
          "Address confirmation is optional. If you have an Australian address, verify it with a utility bill, bank statement, or government letter dated within the last three months.",
          "If you have not yet arrived in Australia, you can add this later.",
        ],
      },
      {
        id: "trust-badge",
        title: "Earn Your Trust Badge",
        content: [
          "Once your ID and selfie verification are approved, you receive a green trust badge. This badge tells hosts that your identity has been independently confirmed.",
          "The trust badge unlocks one-click apply, priority placement in host inboxes, and access to exclusive verified-only listings.",
        ],
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────────────
  // EXISTING - List a Property
  // ────────────────────────────────────────────────────────────────────────
  {
    id: "list-property",
    title: "List a Property",
    description:
      "A comprehensive guide to creating a standout property listing with professional photos, smart pricing, and optimised availability.",
    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01",
    gradient: "from-purple-500 to-violet-500",
    color: "text-purple-500",
    bgColor: "bg-purple-50 dark:bg-purple-500/10",
    difficulty: "Intermediate",
    readTime: "6 min read",
    category: "owner",
    lastUpdated: "2026-05-09",
    relatedGuides: ["host-first", "superhost", "earnings"],
    sections: [
      {
        id: "room-details",
        title: "Enter Room Details",
        content: [
          "Start by selecting the room type: private bedroom, shared bedroom, studio, or entire apartment or house. Then specify the bed type, whether the room is furnished, and the total floor area in square metres if you know it.",
          "Tick everything that applies on the amenities checklist (Wi-Fi, air conditioning, heating, wardrobe, desk, ensuite, parking, bicycle storage). Seekers filter by these.",
          "Describe any unique features in the free-text field: balcony, city views, ground floor with wheelchair access. These help your listing stand out.",
        ],
        tip: "Mention internet speed if you have a fast connection. Remote workers and online students rate Wi-Fi highly.",
      },
      {
        id: "photo-best-practices",
        title: "Photo Best Practices",
        content: [
          "Use a smartphone in good lighting. Shoot in landscape, open curtains, turn on lights, and avoid people or pets in shots.",
          "Upload at least six photos: bedroom (wide), bedroom (detail), bathroom, kitchen, common area, exterior. The first photo is your thumbnail.",
        ],
        tip: "Declutter every surface. Minimal spaces look larger and more inviting.",
      },
      {
        id: "pricing-strategy",
        title: "Pricing Strategy",
        content: [
          "MigRent's pricing recommendation engine analyses comparable listings to suggest a weekly price. You can accept the suggestion or set your own.",
          "Consider seasonal pricing if your area sees demand fluctuations. University suburbs see peaks in January-March and July.",
          "A bills-included price simplifies the experience for seekers and is often more attractive than a base rate plus utilities.",
        ],
      },
      {
        id: "availability-settings",
        title: "Availability Settings",
        content: [
          "Set a minimum stay (we recommend at least four weeks), a maximum stay, and any unavailable date ranges.",
          "Use \"Request to Book\" to review every request, or \"Instant Book\" to auto-confirm verified seekers who meet your minimum stay.",
          "Keep your calendar accurate. Stale availability hurts your rating.",
        ],
      },
      {
        id: "publish-go-live",
        title: "Publish and Go Live",
        content: [
          "MigRent runs a completeness check before publishing. Once you pass, your listing appears in search results within minutes and is eligible for the New Listing badge for seven days.",
        ],
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────────────
  // EXISTING - Become a Superhost
  // ────────────────────────────────────────────────────────────────────────
  {
    id: "superhost",
    title: "Become a Superhost",
    description:
      "Unlock the Superhost badge by meeting MigRent's quality benchmarks for ratings, response time, reliability, and booking volume.",
    icon: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z",
    gradient: "from-amber-500 to-orange-500",
    color: "text-amber-500",
    bgColor: "bg-amber-50 dark:bg-amber-500/10",
    difficulty: "Advanced",
    readTime: "4 min read",
    category: "owner",
    lastUpdated: "2026-05-09",
    relatedGuides: ["host-first", "list-property", "earnings"],
    sections: [
      {
        id: "rating-maintenance",
        title: "Maintain a 4.8+ Rating",
        content: [
          "Your overall rating is the single most important factor. MigRent calculates it as a rolling average of your last twenty reviews.",
          "Focus on accuracy and cleanliness as these carry the highest weight.",
          "Respond to negative reviews professionally. A thoughtful response builds trust with future seekers.",
        ],
      },
      {
        id: "response-time",
        title: "Respond Within One Hour",
        content: [
          "Median response time must be under one hour during your active hours. Enable push notifications and use the quick-reply templates to respond faster.",
          "Set your listing to Paused or assign a co-host if you will be unavailable.",
        ],
      },
      {
        id: "zero-cancellations",
        title: "Zero Cancellation Policy",
        content: [
          "Superhost status requires zero host-initiated cancellations over a rolling twelve-month period.",
          "If your circumstances change, use the Transfer Booking tool to recommend the seeker to another verified host before cancelling.",
          "Genuine emergencies can be reviewed for an extenuating circumstances exemption.",
        ],
      },
      {
        id: "booking-milestones",
        title: "Complete 10+ Bookings",
        content: [
          "A minimum of ten completed bookings within the past twelve months is required.",
          "Superhost status is evaluated quarterly. The badge is displayed on your listing and gives you a search ranking boost.",
        ],
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────────────
  // EXISTING - Earnings Calculator
  // ────────────────────────────────────────────────────────────────────────
  {
    id: "earnings",
    title: "Earnings Calculator",
    description:
      "Use MigRent's earnings calculator to estimate your rental income based on suburb, room type, and occupancy.",
    icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    gradient: "from-emerald-500 to-teal-500",
    color: "text-emerald-500",
    bgColor: "bg-emerald-50 dark:bg-emerald-500/10",
    difficulty: "Beginner",
    readTime: "3 min read",
    category: "owner",
    lastUpdated: "2026-05-09",
    disclaimer:
      "Earnings estimates are based on platform-wide averages and are not a guarantee. Tax outcomes depend on your circumstances; speak to a registered accountant.",
    relatedGuides: ["host-first", "list-property", "superhost"],
    sections: [
      {
        id: "using-calculator",
        title: "Using the Earnings Calculator",
        content: [
          "The calculator is free for all hosts. Access it from the navigation bar or your host dashboard. No listing required.",
          "Enter your suburb or postcode, select the room type, and indicate whether the room is furnished. Adjust the occupancy slider to model different scenarios.",
        ],
      },
      {
        id: "suburb-rent-data",
        title: "Understanding Suburban Rent Data",
        content: [
          "For each suburb you see the median weekly price plus the 25th and 75th percentile bands. Data updates weekly to reflect current market conditions.",
        ],
      },
      {
        id: "room-type-comparison",
        title: "Room Type Comparisons",
        content: [
          "Compare estimated earnings side by side. Higher room counts generally yield higher total income but come with more hosting work.",
        ],
      },
      {
        id: "tax-considerations",
        title: "Tax Considerations for Hosts",
        content: [
          "Rental income earned through MigRent is assessable income under Australian tax law and must be declared in your annual tax return.",
          "You may be able to claim deductions for expenses like utilities, internet, cleaning supplies, furniture depreciation, and platform fees. Speak to a registered tax agent for your situation.",
        ],
      },
    ],
    officialResources: [
      { label: "ATO - Renting out part or all of your home", url: "https://www.ato.gov.au/individuals-and-families/investments-and-assets/residential-rental-properties/renting-out-part-or-all-of-your-home", region: "AU" },
    ],
  },

  // ────────────────────────────────────────────────────────────────────────
  // EXISTING - Migrant Visa Guide
  // ────────────────────────────────────────────────────────────────────────
  {
    id: "visas",
    title: "Migrant Visa Guide",
    description:
      "Understand how your visa type affects your housing rights in Australia.",
    icon: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    gradient: "from-indigo-500 to-blue-500",
    color: "text-indigo-500",
    bgColor: "bg-indigo-50 dark:bg-indigo-500/10",
    difficulty: "Intermediate",
    readTime: "7 min read",
    category: "legal",
    lastUpdated: "2026-05-09",
    disclaimer: LEGAL_DISCLAIMER,
    relatedGuides: ["renter-rights-basics", "rent-as-new-migrant", "documents-to-rent"],
    sections: [
      {
        id: "student-visa-500",
        title: "Student Visa (Subclass 500)",
        content: [
          "Student visa holders have the same residential tenancy rights as any other renter in Australia. Landlords cannot discriminate based on visa status.",
          "You can sign leases, pay bonds, and use state bond schemes. On MigRent, bond is held in trust and follows the same principles.",
          "Be aware of work-hour limits (generally 48 hours per fortnight during semester). This affects your rental budget.",
        ],
      },
      {
        id: "working-holiday-417-462",
        title: "Working Holiday Visa (Subclass 417 / 462)",
        content: [
          "Working holiday visa holders typically need flexible, shorter-term accommodation. MigRent suits this with weekly bookings and minimum stays as short as four weeks.",
          "Avoid informal rental arrangements with no written agreement. MigRent provides a standardised booking agreement that protects both sides.",
          "If you plan to do regional work for a visa extension, research regional accommodation early.",
        ],
      },
      {
        id: "skilled-worker-482",
        title: "Temporary Skill Shortage Visa (Subclass 482)",
        content: [
          "482 visa holders generally have stable income and longer-term housing needs.",
          "Tenancy rights are identical to those of Australian residents under your state's residential tenancies law.",
          "Your visa is tied to your employer. If your employment changes, MigRent's flexible booking model can help during a transition.",
        ],
      },
      {
        id: "housing-rights",
        title: "Housing Rights for All Visa Holders",
        content: [
          "Bond is generally limited to four weeks of rent and must be held in a regulated scheme.",
          "Discrimination based on nationality, race, or visa status is illegal under Commonwealth and state law.",
          "You are protected against retaliatory eviction. If you exercise a legal right, your landlord cannot evict you in retaliation.",
        ],
      },
      {
        id: "bond-rules",
        title: "Bond Rules and Your Money",
        content: [
          "Bonds are strictly regulated. Maximum bond varies by state but is typically four weeks rent.",
          "Bond must be held in a government-authorised scheme or, on MigRent, in MigRent's regulated trust account.",
          "Always complete the condition report at move-in and submit it within 48 hours.",
        ],
      },
    ],
    officialResources: [
      { label: "Home Affairs - Student visa (500)", url: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500", region: "AU" },
      { label: "Home Affairs - Working Holiday (417)", url: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/work-holiday-417", region: "AU" },
      { label: "Home Affairs - Work and Holiday (462)", url: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/work-holiday-462", region: "AU" },
      { label: "Home Affairs - TSS (482)", url: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/temporary-skill-shortage-482", region: "AU" },
    ],
  },

  // ────────────────────────────────────────────────────────────────────────
  // EXISTING - Dispute Resolution
  // ────────────────────────────────────────────────────────────────────────
  {
    id: "disputes",
    title: "Dispute Resolution",
    description:
      "Learn how to file a dispute, gather evidence, and navigate MigRent's mediation process to reach a fair resolution.",
    icon: "M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3",
    gradient: "from-red-500 to-rose-500",
    color: "text-red-500",
    bgColor: "bg-red-50 dark:bg-red-500/10",
    difficulty: "Intermediate",
    readTime: "5 min read",
    category: "legal",
    lastUpdated: "2026-05-09",
    disclaimer: LEGAL_DISCLAIMER,
    relatedGuides: ["renter-rights-basics", "how-bond-works", "host-rule-breach"],
    sections: [
      {
        id: "filing-dispute",
        title: "Filing a Dispute",
        content: [
          "If you cannot resolve an issue with your host or seeker directly, MigRent's dispute resolution system is available. Common disputes include bond deductions, property condition, early termination, noise, and house rule breaches.",
          "Click \"Report Issue\" on the booking, choose a category, describe the issue, specify the outcome you are seeking, and upload evidence.",
          "File within 14 days of the issue or 14 days of checkout for bond matters.",
        ],
      },
      {
        id: "evidence-collection",
        title: "Collecting Evidence",
        content: [
          "Use timestamped photos (the MigRent app adds metadata), screenshots of in-platform messages, your move-in condition report, and any receipts.",
          "Photograph property damage from multiple angles, including a wider shot for context.",
          "Keep a written log of any rule violations with dates, times, and descriptions.",
        ],
      },
      {
        id: "mediation-steps",
        title: "The Mediation Process",
        content: [
          "An independent mediator reviews evidence, asks clarifying questions, proposes a resolution, and invites both parties to accept or reject.",
          "Most disputes resolve within five to seven business days. Simple bond disputes can resolve in two days.",
        ],
      },
      {
        id: "resolution-outcomes",
        title: "Resolution Outcomes",
        content: [
          "Bond disputes can result in full refund, partial refund, or validated host claim. Behavioural disputes can result in warnings or platform removal.",
          "Accepted resolutions are binding and processed automatically.",
          "If you reject, you can escalate to your state's tenancy tribunal (NCAT, VCAT, QCAT, or equivalent) which is free or low-cost.",
        ],
      },
      {
        id: "preventing-disputes",
        title: "Preventing Disputes Before They Happen",
        content: [
          "Hosts: keep listings accurate, complete condition reports, set clear rules, communicate fast.",
          "Seekers: read the listing and rules carefully, do the move-in condition report, raise issues early through the app.",
          "Always communicate through MigRent rather than personal messaging apps. In-platform messages are time-stamped and can be referenced in mediation.",
        ],
      },
    ],
    officialResources: [
      { label: "NSW Civil and Administrative Tribunal (NCAT)", url: "https://www.ncat.nsw.gov.au/case-types/tenancy-disputes.html", region: "NSW" },
      { label: "VIC Civil and Administrative Tribunal (VCAT)", url: "https://www.vcat.vic.gov.au/case-types/residential-tenancies", region: "VIC" },
      { label: "QLD Civil and Administrative Tribunal (QCAT)", url: "https://www.qcat.qld.gov.au/matter-types/residential-tenancy-disputes", region: "QLD" },
    ],
  },

  // ────────────────────────────────────────────────────────────────────────
  // STUB ENTRY referenced by relatedGuides for future expansion
  // ────────────────────────────────────────────────────────────────────────
  {
    id: "moving-in-checklist",
    title: "Moving-In Day: Step-by-Step Checklist",
    description:
      "A clear move-in checklist for your first 48 hours: condition report, keys, Wi-Fi, bills, and how to introduce yourself to housemates.",
    whoFor: "Anyone moving into their first MigRent room.",
    quickAnswer:
      "Photograph every room within 48 hours, submit your condition report, get the Wi-Fi password, save the host's contact, set up bills if separate, and introduce yourself to housemates the same day.",
    icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    gradient: "from-sky-500 to-blue-500",
    color: "text-sky-500",
    bgColor: "bg-sky-50 dark:bg-sky-500/10",
    difficulty: "Beginner",
    readTime: "5 min read",
    category: "newcomer",
    lastUpdated: "2026-05-09",
    relatedGuides: ["how-bond-works", "first-week-checklist", "rent-and-bills"],
    sections: [
      {
        id: "before-arrival",
        title: "Before You Arrive",
        content: [
          "Confirm key collection arrangements 24 hours before. Confirm the Wi-Fi password is ready and that house rules have been shared in writing.",
        ],
      },
      {
        id: "first-48-hours",
        title: "Your First 48 Hours",
        content: [
          "This window is the most important for protecting your bond and starting strong with housemates.",
        ],
        checklist: [
          "Photograph every room with lights on",
          "Submit the condition report through MigRent",
          "Confirm Wi-Fi works and run a speed test",
          "Save the host's phone number and emergency contact",
          "Locate smoke alarms and confirm they work",
          "Find the meter box, fuse box, and water shut-off (just in case)",
          "Introduce yourself to each housemate",
          "Buy basic supplies: toilet paper, washing detergent, hand soap",
        ],
      },
      {
        id: "settling-in",
        title: "Settling In",
        content: [
          "If bills are not included, set up your share of utilities or confirm with the host how they will be split. If you need a desk lamp or a bedside lamp, get them in the first week. Comfort matters more than you think when adjusting to a new country.",
        ],
      },
    ],
  },

  // STUB - Move-out and bond return
  {
    id: "host-rule-breach",
    title: "When Your Host Breaks the Rules: Your Options",
    description:
      "What to do if a host enters without notice, withholds bond unfairly, or treats you unfairly. The escalation path step by step.",
    whoFor: "Any seeker dealing with a host who is breaching the agreement or the law.",
    quickAnswer:
      "Document everything in writing, message the host through MigRent first, then report the issue to MigRent support. If unresolved, contact your state's Fair Trading body or tenancy tribunal. You are not alone and these services are free.",
    icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
    gradient: "from-pink-500 to-rose-500",
    color: "text-pink-500",
    bgColor: "bg-pink-50 dark:bg-pink-500/10",
    difficulty: "Intermediate",
    readTime: "6 min read",
    category: "legal",
    lastUpdated: "2026-05-09",
    disclaimer: LEGAL_DISCLAIMER,
    relatedGuides: ["renter-rights-basics", "disputes", "how-bond-works"],
    sections: [
      {
        id: "what-counts-as-a-breach",
        title: "What Counts as a Breach",
        content: [
          "Common breaches include: entering your room without proper notice, harassment or intimidation, refusing to do urgent repairs, withholding bond unfairly, and trying to evict you in retaliation for raising a concern.",
        ],
        callouts: [
          {
            variant: "critical",
            title: "Always illegal regardless of any contract",
            body: "Holding your passport, cutting off your power or water, or changing the locks without notice are illegal under Australian law and unenforceable in any contract.",
          },
        ],
      },
      {
        id: "step-1-document",
        title: "Step 1: Document",
        content: [
          "Move all communication into MigRent's chat. Restate any verbal conversation in writing. Save screenshots, dates, times, and witnesses.",
        ],
      },
      {
        id: "step-2-platform",
        title: "Step 2: Use the Platform",
        content: [
          "Open the booking, tap 'Report issue', and explain. MigRent's trust team responds within one business day for safety concerns. Many issues are resolved here without needing escalation.",
        ],
      },
      {
        id: "step-3-fair-trading",
        title: "Step 3: Fair Trading or Tribunal",
        content: [
          "If unresolved, your state's Fair Trading body offers free advice and dispute support. The state tenancy tribunal (NCAT, VCAT, QCAT) handles disputes for free or low cost. You do not need a lawyer.",
        ],
      },
    ],
    officialResources: [
      { label: "NSW Fair Trading - Tenants", url: "https://www.nsw.gov.au/housing-and-construction/renting-a-place-to-live/help-with-rental-issues", region: "NSW" },
      { label: "Consumer Affairs Victoria - Renting disputes", url: "https://www.consumer.vic.gov.au/housing/renting/repairs-alterations-safety-and-pets/maintenance-and-non-urgent-repairs", region: "VIC" },
      { label: "Tenants Queensland", url: "https://tenantsqld.org.au/", region: "QLD" },
    ],
  },
];

// ─── Helper Functions ──────────────────────────────────────────────────────

/**
 * Get a single guide by its ID.
 */
export function getGuideById(id: string): GuideContent | undefined {
  return guidesContent.find((guide) => guide.id === id);
}

/**
 * Get all guides.
 */
export function getAllGuides(): GuideContent[] {
  return guidesContent;
}

/**
 * Get guides filtered by category.
 */
export function getGuidesByCategory(category: GuideCategory): GuideContent[] {
  return guidesContent.filter((g) => g.category === category);
}

export default guidesContent;
