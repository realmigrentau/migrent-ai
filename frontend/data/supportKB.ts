export interface KBArticle {
  id: string;
  category: "Booking" | "Account" | "Safety" | "Payments" | "Legal";
  question: string;
  answer: string;
  keywords: string[];
}

const articles: KBArticle[] = [
  // ── Booking ──────────────────────────────────────────────
  {
    id: "bk-001",
    category: "Booking",
    question: "How do I cancel a booking?",
    answer:
      "To cancel a booking, go to My Bookings, select the booking you want to cancel, and click the Cancel Booking button. If you cancel more than 7 days before your check-in date, you will receive a full refund of any rent paid in advance. Cancellations within 7 days of check-in are subject to the host's cancellation policy, which is displayed on the listing page. Your bond will always be refunded in full for cancellations made before check-in.",
    keywords: ["cancel", "cancellation", "cancel booking", "undo booking"],
  },
  {
    id: "bk-002",
    category: "Booking",
    question: "Can I get a refund if I cancel?",
    answer:
      "Refund eligibility depends on when you cancel relative to your check-in date. Cancellations made 7 or more days before check-in receive a full refund. Cancellations within 7 days are subject to the host's cancellation policy, which may offer a partial refund or no refund on advance rent. Bond payments are always fully refundable for pre-check-in cancellations. Refunds are processed within 5-7 business days to your original payment method.",
    keywords: ["refund", "money back", "cancel refund", "get refund"],
  },
  {
    id: "bk-003",
    category: "Booking",
    question: "How do I change my booking dates?",
    answer:
      "To modify your booking dates, go to My Bookings, select the booking, and click Modify Dates. You can extend or shorten your stay subject to availability. If the new dates result in a higher total, you will be charged the difference. If the total is lower, a refund will be issued for the difference. The host must approve date changes within 48 hours; otherwise, the modification request expires and your original dates remain.",
    keywords: ["change dates", "modify booking", "extend stay", "shorten stay", "reschedule"],
  },
  {
    id: "bk-004",
    category: "Booking",
    question: "What is Instant Booking?",
    answer:
      "Instant Booking allows you to confirm a reservation immediately without waiting for host approval. Listings with the Instant Booking badge can be booked right away, which is particularly useful if you need housing quickly upon arriving in Australia. The host is still notified and can contact you, but the booking is confirmed the moment you complete payment. Not all listings offer Instant Booking; it depends on the host's preference.",
    keywords: ["instant booking", "instant", "quick booking", "immediate booking", "fast booking"],
  },
  {
    id: "bk-005",
    category: "Booking",
    question: "How long does a host have to respond to my booking request?",
    answer:
      "Hosts have 48 hours to accept or decline a standard booking request. If the host does not respond within 48 hours, the request automatically expires and any payment hold on your account is released. You can then book another listing. We recommend messaging the host before booking to increase the chance of quick acceptance. Instant Booking listings do not require host approval.",
    keywords: ["host response", "waiting", "pending", "host accept", "how long", "response time"],
  },
  {
    id: "bk-006",
    category: "Booking",
    question: "Can I book a room before arriving in Australia?",
    answer:
      "Yes, you can book a room from overseas before arriving in Australia. We recommend booking at least 2-4 weeks before your arrival date. You can complete the entire booking process online, including identity verification and payment. Make sure to communicate your arrival details with the host so they can arrange key handover. We strongly recommend only booking listings with verified hosts and checking reviews from other migrant tenants.",
    keywords: ["book overseas", "before arriving", "international", "book from abroad", "pre-arrival"],
  },

  // ── Account ──────────────────────────────────────────────
  {
    id: "ac-001",
    category: "Account",
    question: "How do I verify my identity?",
    answer:
      "To verify your identity, go to Settings > Verification and upload a valid government-issued ID (passport, driver's license, or national ID card). For migrant renters, we also accept visa grant notices and ImmiCards. Verification typically takes 24-48 hours. Once verified, your profile receives a verified badge which increases trust with hosts and improves your chances of booking acceptance. All documents are securely encrypted and stored in compliance with Australian privacy laws.",
    keywords: ["verify", "verification", "identity", "ID", "passport", "document"],
  },
  {
    id: "ac-002",
    category: "Account",
    question: "How do I reset my password?",
    answer:
      "To reset your password, click the 'Forgot Password' link on the login page. Enter the email address associated with your account and we will send you a password reset link. The link expires after 1 hour. If you do not receive the email, check your spam folder or contact support. If you use social login (Google, Apple), you do not have a MigRent password and should sign in using the same social provider.",
    keywords: ["password", "reset password", "forgot password", "change password", "login problem"],
  },
  {
    id: "ac-003",
    category: "Account",
    question: "How do I update my profile information?",
    answer:
      "Go to Settings > Profile to update your personal information including your name, phone number, profile photo, and bio. Your email address can be changed under Settings > Account. If you have already verified your identity, changing your legal name will require re-verification. Profile updates are saved immediately and visible to hosts when you make booking requests.",
    keywords: ["update profile", "edit profile", "change name", "change email", "profile photo"],
  },
  {
    id: "ac-004",
    category: "Account",
    question: "How do I delete my account?",
    answer:
      "To delete your account, go to Settings > Account > Delete Account. You must first resolve any active bookings and ensure there are no pending payments or refunds. Account deletion is permanent and cannot be undone. All your personal data will be removed in accordance with our Privacy Policy and the Australian Privacy Act. If you have any active listings, they will be unpublished and removed. We recommend downloading your data before deletion.",
    keywords: ["delete account", "remove account", "close account", "deactivate"],
  },
  {
    id: "ac-005",
    category: "Account",
    question: "Can I have both a tenant and host account?",
    answer:
      "Yes, a single MigRent account can function as both a tenant and a host. You can switch between roles using the role switcher in the navigation menu. As a tenant, you can search and book listings. As a host, you can create and manage listings. All your bookings, reviews, and verification status are shared across both roles.",
    keywords: ["tenant host", "both roles", "switch role", "dual account", "host and tenant"],
  },

  // ── Safety ───────────────────────────────────────────────
  {
    id: "sf-001",
    category: "Safety",
    question: "How do I report a scam listing?",
    answer:
      "If you suspect a listing is a scam, click the Report button on the listing page and select 'Suspected scam'. Provide as much detail as possible about why you believe the listing is fraudulent. Our Trust & Safety team reviews all reports within 24 hours. Common scam signs include: prices that seem too low for the area, requests to pay outside the platform, reluctance to show the property, and pressure to pay immediately. Never transfer money outside of MigRent.",
    keywords: ["scam", "report scam", "fake listing", "fraud", "suspicious", "report"],
  },
  {
    id: "sf-002",
    category: "Safety",
    question: "What should I do in an emergency at my rental property?",
    answer:
      "In a life-threatening emergency, call 000 (Triple Zero) immediately for police, fire, or ambulance. For non-life-threatening issues, contact your host or property manager. You can also use the MigRent Emergency button in the app to quickly access emergency contacts and report urgent property issues. For maintenance emergencies like burst pipes or gas leaks, contact your host and if they are unresponsive, you can arrange emergency repairs up to $500 and deduct the cost from rent (check your state's rental laws for specific limits).",
    keywords: ["emergency", "danger", "unsafe", "000", "police", "fire", "ambulance", "urgent"],
  },
  {
    id: "sf-003",
    category: "Safety",
    question: "How do I report an unsafe living condition?",
    answer:
      "If your rental property has unsafe conditions (mould, structural issues, faulty wiring, etc.), first notify your host in writing through the MigRent messaging system. Document the issue with photos and keep copies of all communication. If the host does not address the issue within a reasonable time, you can contact your state's Fair Trading or Consumer Affairs office. In the MigRent app, go to My Bookings > select your booking > Report Issue to create an official record.",
    keywords: ["unsafe", "mould", "mold", "repairs", "maintenance", "condition", "hazard", "health"],
  },
  {
    id: "sf-004",
    category: "Safety",
    question: "How does MigRent verify hosts?",
    answer:
      "MigRent verifies hosts through a multi-step process: identity verification (government ID), email and phone verification, property ownership or management documentation, and ongoing review monitoring. Verified hosts display a blue verification badge on their profile and listings. We also cross-reference property details with public records where available. However, we always recommend inspecting a property in person or via video call before completing a booking.",
    keywords: ["verified host", "host verification", "trust", "safe host", "badge"],
  },
  {
    id: "sf-005",
    category: "Safety",
    question: "What are common rental scams targeting migrants?",
    answer:
      "Common scams include: fake listings using stolen photos (reverse image search can help detect these), requests to wire money overseas before viewing the property, fake agents asking for upfront fees, phishing emails pretending to be from MigRent, and bait-and-switch where the actual room differs from photos. To protect yourself: always use MigRent's secure payment system, never pay before inspecting the property, verify the host's identity and reviews, and be cautious of deals that seem too good to be true.",
    keywords: ["scam", "common scams", "migrant scam", "fraud", "protect", "phishing", "fake"],
  },

  // ── Payments ─────────────────────────────────────────────
  {
    id: "py-001",
    category: "Payments",
    question: "How does the bond (security deposit) work?",
    answer:
      "The bond is a security deposit paid at the start of your tenancy, typically equal to 4 weeks rent. On MigRent, the bond is held securely in a trust account in compliance with Australian state regulations. The bond protects the host against unpaid rent or damage beyond fair wear and tear. At the end of your tenancy, the bond is refunded provided the property is returned in good condition. Bond disputes can be raised through MigRent or your state's tribunal. Processing times for bond refunds are typically 5-10 business days after both parties agree.",
    keywords: ["bond", "security deposit", "deposit", "bond refund", "bond return"],
  },
  {
    id: "py-002",
    category: "Payments",
    question: "What payment methods are accepted?",
    answer:
      "MigRent accepts the following payment methods: Visa and Mastercard credit/debit cards, Australian bank transfer (direct debit), PayID, and Apple Pay/Google Pay. International cards are accepted for initial bookings. For ongoing rent payments, we recommend setting up an Australian bank account and using direct debit for convenience. All payments are processed securely using bank-grade encryption. We do not accept cash, cryptocurrency, or wire transfers.",
    keywords: ["payment methods", "credit card", "bank transfer", "pay", "PayID", "Apple Pay", "Google Pay"],
  },
  {
    id: "py-003",
    category: "Payments",
    question: "How long does a refund take to process?",
    answer:
      "Refund processing times depend on the payment method: credit/debit card refunds take 5-7 business days, bank transfers take 3-5 business days, and PayID refunds are typically processed within 1-2 business days. The refund will appear on the same payment method used for the original transaction. You will receive an email confirmation when the refund is initiated and another when it is completed. If you have not received your refund within the expected timeframe, contact our support team.",
    keywords: ["refund", "refund time", "how long refund", "processing", "refund status"],
  },
  {
    id: "py-004",
    category: "Payments",
    question: "How do I set up automatic rent payments?",
    answer:
      "To set up automatic rent payments, go to My Bookings > select your active booking > Payment Settings > Enable Auto-Pay. You can choose to pay weekly or fortnightly. Auto-pay is processed on the same day each week or fortnight. You will receive a notification 2 days before each payment and a receipt after. You can cancel auto-pay at any time, but you must still pay rent by the due date. A failed auto-pay will be retried once after 24 hours before marking the payment as missed.",
    keywords: ["auto pay", "automatic payment", "recurring payment", "rent payment", "direct debit", "setup"],
  },
  {
    id: "py-005",
    category: "Payments",
    question: "Can I pay rent from an overseas bank account?",
    answer:
      "Yes, you can pay rent using an international credit or debit card (Visa or Mastercard). However, international transaction fees may apply depending on your bank. For the best experience and to avoid fees, we recommend opening an Australian bank account once you arrive. Many Australian banks offer accounts that can be opened online before you arrive in the country. MigRent does not charge any additional fees for international card payments.",
    keywords: ["overseas", "international", "foreign card", "overseas payment", "international bank"],
  },
  {
    id: "py-006",
    category: "Payments",
    question: "What happens if I miss a rent payment?",
    answer:
      "If a rent payment is missed, you will receive an immediate notification and have a 3-day grace period to make the payment without penalty. After the grace period, a late fee may apply as specified in your tenancy agreement. If rent remains unpaid for 14 days, the host may begin the formal notice process under your state's tenancy laws. We strongly recommend contacting your host and MigRent support as soon as possible if you are having difficulty making a payment, as early communication can often resolve the situation.",
    keywords: ["missed payment", "late payment", "overdue", "unpaid rent", "late fee", "arrears"],
  },

  // ── Legal ────────────────────────────────────────────────
  {
    id: "lg-001",
    category: "Legal",
    question: "What are my rights as a tenant in Australia?",
    answer:
      "As a tenant in Australia, you have the right to: a property that is clean and in reasonable repair, quiet enjoyment without unreasonable interference, proper notice before the landlord enters (typically 24-48 hours), protection from unfair eviction, a written tenancy agreement, have your bond lodged with the relevant state authority, request necessary repairs, and challenge excessive rent increases. These rights apply to all tenants, including those on temporary visas. Each state has specific legislation; visit your state's Fair Trading website for detailed information.",
    keywords: ["tenant rights", "rights", "renter rights", "legal rights", "tenancy rights"],
  },
  {
    id: "lg-002",
    category: "Legal",
    question: "Do I need to sign a lease agreement?",
    answer:
      "While verbal agreements can be legally binding in Australia, we strongly recommend always having a written lease (also called a residential tenancy agreement). A written lease protects both you and the landlord by clearly setting out the terms including rent amount, payment schedule, bond, duration, and house rules. On MigRent, a digital tenancy agreement is generated for every booking, which both parties sign electronically. This agreement complies with the relevant state's residential tenancy legislation.",
    keywords: ["lease", "agreement", "contract", "sign lease", "tenancy agreement", "written agreement"],
  },
  {
    id: "lg-003",
    category: "Legal",
    question: "How do I dispute a bond claim?",
    answer:
      "If your landlord claims part or all of your bond and you disagree, you can dispute it. First, try to negotiate directly with the landlord through MigRent's messaging system. If you cannot reach an agreement, you can lodge a dispute with your state's bond authority (e.g., NSW Fair Trading, VIC RTBA, QLD RTA). The authority will attempt mediation, and if that fails, the matter goes to your state's tribunal (e.g., NCAT, VCAT, QCAT). Always take dated photos of the property at move-in and move-out to support your case.",
    keywords: ["bond dispute", "bond claim", "dispute bond", "unfair bond", "bond deduction"],
  },
  {
    id: "lg-004",
    category: "Legal",
    question: "Does my visa status affect my tenancy rights?",
    answer:
      "No, your tenancy rights are the same regardless of your visa status. Australian residential tenancy laws apply equally to citizens, permanent residents, and temporary visa holders. Landlords and agents cannot legally discriminate against you based on your visa type, nationality, or immigration status. If you experience discrimination, you can lodge a complaint with the Australian Human Rights Commission or your state's anti-discrimination body. Your visa status does not affect your right to a fair lease, bond protection, or dispute resolution.",
    keywords: ["visa", "visa status", "immigration", "temporary visa", "student visa", "work visa", "migrant rights"],
  },
  {
    id: "lg-005",
    category: "Legal",
    question: "Can my landlord increase the rent during my lease?",
    answer:
      "During a fixed-term lease, rent can only be increased if the lease agreement specifically allows it and only at the intervals specified (typically no more than once every 12 months in most states). For periodic (month-to-month) tenancies, the landlord must give proper written notice (usually 60 days) before increasing rent. Any rent increase must not be excessive; if you believe an increase is unreasonable, you can apply to your state's tribunal to have it reviewed. On MigRent, all rent changes are documented and both parties are notified.",
    keywords: ["rent increase", "raise rent", "rent going up", "rent hike", "expensive", "rent review"],
  },
  {
    id: "lg-006",
    category: "Legal",
    question: "What is the process for ending a tenancy?",
    answer:
      "To end a fixed-term tenancy, you typically need to give notice before the end date (the notice period varies by state, usually 14-30 days). For periodic tenancies, tenants generally need to give 14-21 days written notice. Before moving out, clean the property to the same standard as when you moved in, complete a final inspection with the host, return all keys, and provide your forwarding address for the bond refund. On MigRent, you can initiate the move-out process through My Bookings > End Tenancy, which guides you through each step.",
    keywords: ["end tenancy", "move out", "leaving", "notice period", "terminate lease", "break lease"],
  },
  {
    id: "lg-007",
    category: "Legal",
    question: "What can I do if my landlord is not making necessary repairs?",
    answer:
      "If your landlord is not making repairs, follow these steps: 1) Send a written repair request through MigRent's messaging system, describing the issue and including photos. 2) Allow a reasonable time for non-urgent repairs (usually 14 days) and 24 hours for urgent repairs. 3) If the landlord does not respond, send a formal breach notice (templates available on your state's Fair Trading website). 4) If the issue remains unresolved, apply to your state's tribunal for an order requiring the repairs. For urgent repairs affecting health or safety, you may be able to arrange repairs yourself and seek reimbursement.",
    keywords: ["repairs", "maintenance", "broken", "fix", "landlord not fixing", "repair request"],
  },
  {
    id: "lg-008",
    category: "Legal",
    question: "Am I covered by Australian consumer protection laws?",
    answer:
      "Yes, Australian consumer protection laws apply to all residents. The Australian Consumer Law (ACL) and state-specific residential tenancy legislation protect you when renting. This includes protection against misleading or deceptive conduct by landlords or agents, unfair contract terms in lease agreements, and discrimination in housing. Additionally, each state has a Fair Trading or Consumer Affairs body that can assist with complaints. MigRent's terms of service are designed to complement these protections and provide additional safeguards for migrant renters.",
    keywords: ["consumer protection", "consumer law", "ACL", "fair trading", "legal protection", "rights"],
  },
];

export function getAllArticles(): KBArticle[] {
  return articles;
}

export function getArticlesByCategory(
  category: "Booking" | "Account" | "Safety" | "Payments" | "Legal"
): KBArticle[] {
  return articles.filter((a) => a.category === category);
}

export function searchArticles(query: string): KBArticle[] {
  const normalizedQuery = query.toLowerCase().trim();
  const queryWords = normalizedQuery.split(/\s+/);

  return articles.filter((article) => {
    const questionLower = article.question.toLowerCase();
    const keywordsJoined = article.keywords.join(" ").toLowerCase();
    const searchText = `${questionLower} ${keywordsJoined}`;

    return queryWords.some((word) => searchText.includes(word));
  });
}
