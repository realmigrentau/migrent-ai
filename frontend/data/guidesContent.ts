// ─── Guide content data for MigRent AI ────────────────────────────────────
// Full content for all 8 guides, used by individual guide detail pages.

export interface GuideSection {
  id: string;
  title: string;
  content: string[]; // paragraphs
  tip?: string;
}

export interface GuideContent {
  id: string;
  title: string;
  description: string;
  icon: string; // SVG path
  gradient: string; // tailwind gradient classes
  color: string; // text color class
  bgColor: string; // bg color class
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  readTime: string;
  category: "seeker" | "owner" | "legal";
  sections: GuideSection[];
  relatedGuides: string[]; // IDs of related guides
}

const guidesContent: GuideContent[] = [
  // ────────────────────────────────────────────────────────────────────────
  // 1. Host Your First Room
  // ────────────────────────────────────────────────────────────────────────
  {
    id: "host-first",
    title: "Host Your First Room",
    description:
      "A step-by-step walkthrough to get your spare room listed on MigRent AI and welcome your very first seeker.",
    icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    gradient: "from-blue-500 to-indigo-500",
    color: "text-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-500/10",
    difficulty: "Beginner",
    readTime: "5 min read",
    category: "owner",
    relatedGuides: ["list-property", "superhost", "earnings"],
    sections: [
      {
        id: "create-listing",
        title: "Create Your Listing",
        content: [
          "Getting started on MigRent AI is straightforward. Navigate to your dashboard and click the \"List a Room\" button to begin. You will be guided through a simple form that asks for your property address, the type of room you are offering (private room, shared room, or entire unit), and a short headline that will appear in search results.",
          "Take your time filling out the description field. Seekers on MigRent AI are often newly arrived migrants who may not be familiar with Australian suburbs, so mention nearby public transport stops, supermarkets, universities, or employment hubs. A clear, honest description builds trust and reduces the number of back-and-forth messages before a booking.",
          "Once you have completed the basic details, MigRent AI will auto-generate a preview of your listing card so you can see exactly how it will appear to seekers browsing the platform.",
        ],
        tip: "Include the distance to the nearest train or bus stop in your listing title. Seekers searching from overseas rank transport access as one of their top priorities.",
      },
      {
        id: "add-photos",
        title: "Add Photos That Stand Out",
        content: [
          "Listings with at least five high-quality photos receive up to three times more enquiries than those with only one or two images. Use natural daylight wherever possible and photograph each room from the doorway to give a sense of the full space. Include shots of the bedroom, bathroom, kitchen, any common living areas, and the front of the property.",
          "Avoid using heavy filters or wide-angle lenses that distort the room size. Seekers appreciate accuracy, and misleading photos are the leading cause of disputes on rental platforms in Australia. If the room is furnished, make the bed and remove personal clutter before photographing.",
        ],
        tip: "Photograph the view from the bedroom window. Many seekers are relocating from abroad and want to visualise the neighbourhood before they arrive.",
      },
      {
        id: "set-pricing",
        title: "Set Competitive Pricing",
        content: [
          "MigRent AI provides a suburb-level pricing guide based on recent rental data from across Australia. When you enter your suburb, you will see the median weekly rent for comparable room types in your area. We recommend pricing within ten percent of the median to attract seekers quickly while ensuring fair returns.",
          "You can choose between weekly or fortnightly billing cycles. Most seekers on working holiday or student visas prefer weekly payments because they align with casual pay cycles. If you offer a discount for longer stays (for example, a reduced rate for bookings of twelve weeks or more), make sure to toggle the long-stay discount option in your pricing settings.",
          "Remember that MigRent AI charges a small service fee on each booking. This fee covers payment processing, dispute resolution support, and platform maintenance. The fee is displayed transparently before you publish your listing so there are no surprises.",
        ],
        tip: "Offering your first two weeks at a slight discount can help you secure an initial booking and start building reviews quickly.",
      },
      {
        id: "house-rules",
        title: "Define House Rules",
        content: [
          "Clear house rules prevent misunderstandings and protect both you and your seeker. MigRent AI provides a template with common rules covering quiet hours, guest policies, smoking, pets, shared kitchen etiquette, and laundry schedules. You can customise each rule or add your own.",
          "Be specific rather than vague. Instead of writing \"keep the kitchen clean,\" specify expectations such as \"wash and put away dishes within two hours of use\" or \"wipe down the stovetop after cooking.\" Seekers from different cultural backgrounds will appreciate the clarity, and it gives everyone a fair reference point if any issues arise.",
        ],
        tip: "Translate your house rules into the languages most common among your expected seekers. MigRent AI can auto-translate rules into over 40 languages with one click.",
      },
      {
        id: "welcome-seeker",
        title: "Welcome Your First Seeker",
        content: [
          "Once a seeker books your room, you will receive a notification with their verified profile, expected arrival date, and any messages they have sent. Respond promptly to confirm check-in logistics such as key collection, access codes, and parking details.",
          "First impressions matter enormously. Consider leaving a welcome pack with essentials such as a small bottle of milk, tea bags, a local area map, and a card with your Wi-Fi password and emergency contact number. These small gestures consistently earn five-star reviews and are mentioned in the majority of positive feedback on the platform.",
          "After your seeker has settled in, check in with them after a day or two to make sure everything is comfortable. Early communication helps resolve minor issues before they become complaints and shows your commitment to a positive hosting experience.",
        ],
        tip: "Add a printed list of nearby essential services (GP clinic, pharmacy, grocery store, bank) to your welcome pack. Newly arrived migrants will find this incredibly helpful.",
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────────────
  // 2. Find Rentals Fast
  // ────────────────────────────────────────────────────────────────────────
  {
    id: "find-fast",
    title: "Find Rentals Fast",
    description:
      "Learn how to use MigRent AI's smart filters, alerts, and one-click apply to find the perfect room before you even land in Australia.",
    icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
    gradient: "from-rose-500 to-pink-500",
    color: "text-rose-500",
    bgColor: "bg-rose-50 dark:bg-rose-500/10",
    difficulty: "Beginner",
    readTime: "4 min read",
    category: "seeker",
    relatedGuides: ["verify-profile", "visas", "disputes"],
    sections: [
      {
        id: "smart-filters",
        title: "Set Up Smart Filters",
        content: [
          "MigRent AI's search engine is built specifically for migrants, so the filters go beyond basic price and location. Start by selecting your preferred city or region, then narrow down by suburb, room type (private, shared, or entire unit), and weekly budget. You can also filter by furnished or unfurnished, bills-included listings, and proximity to specific universities or employment zones.",
          "The platform also offers lifestyle filters that are especially relevant for international arrivals. These include vegetarian-friendly kitchens, female-only households, pet-friendly properties, and listings where the host speaks your language. Combining these filters helps you find a home that genuinely fits your needs rather than just your budget.",
          "Once you have configured your ideal filter set, click \"Save Search\" to store it. You can create up to five saved searches, each with different criteria, and switch between them from your dashboard at any time.",
        ],
        tip: "If you are arriving on a student visa, use the \"Near University\" filter and enter your institution's name. MigRent AI will automatically surface rooms within a thirty-minute commute.",
      },
      {
        id: "enable-alerts",
        title: "Enable Instant Alerts",
        content: [
          "The Australian rental market moves quickly, and rooms in popular suburbs can be booked within hours of being listed. To stay ahead, enable instant alerts for each of your saved searches. You can choose to receive notifications via email, push notification, or both.",
          "When a new listing matches your criteria, MigRent AI sends you an alert within minutes. The notification includes a summary card with the room photo, price, suburb, and host rating so you can make a fast decision without even opening the app. From the alert, you can tap \"View\" to see full details or \"Quick Apply\" to submit your interest immediately.",
        ],
        tip: "Set alerts for off-peak hours as well. Many hosts publish new listings in the evening after work, so a 7 pm to 10 pm alert window can catch fresh rooms before the morning rush.",
      },
      {
        id: "save-suburbs",
        title: "Save Your Favourite Suburbs",
        content: [
          "If you are researching areas from overseas, the suburb-saving feature lets you build a shortlist of neighbourhoods you are interested in. Each saved suburb comes with a live snapshot showing the average room price, number of active listings, walkability score, and public transport rating.",
          "You can compare up to four suburbs side by side on the comparison screen, which is especially useful if you are weighing trade-offs between affordability and commute time. MigRent AI also provides a brief neighbourhood profile for each suburb covering demographics, popular cuisines, safety ratings, and community vibe.",
        ],
        tip: "Use the \"Migrant Community\" tag on suburb profiles to find areas with established communities from your home country. Having a familiar support network nearby can make the transition much smoother.",
      },
      {
        id: "one-click-apply",
        title: "Apply with One Click",
        content: [
          "Once your MigRent AI profile is complete and verified, you unlock the one-click apply feature. This sends the host a standardised application that includes your verified name, profile photo, trust badge status, a short bio, and your preferred move-in date. There is no need to write a custom message for every listing.",
          "Hosts see your application in their inbox ranked by profile completeness and verification status. Verified seekers with a trust badge are shown first, which means completing your profile verification dramatically increases your chances of hearing back.",
          "You can track all your active applications from the \"My Applications\" tab on your dashboard. Each application shows its current status: sent, viewed by host, shortlisted, accepted, or declined. If a host has not responded within 48 hours, MigRent AI sends them a gentle reminder on your behalf.",
        ],
        tip: "Write a short, friendly bio in your profile that mentions your occupation or study area, your home country, and one hobby or interest. Hosts are more likely to accept seekers they feel a personal connection with.",
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────────────
  // 3. Verify Your Profile
  // ────────────────────────────────────────────────────────────────────────
  {
    id: "verify-profile",
    title: "Verify Your Profile",
    description:
      "Complete MigRent AI's identity verification process to earn your trust badge and unlock priority features.",
    icon: "M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2",
    gradient: "from-green-500 to-emerald-500",
    color: "text-green-500",
    bgColor: "bg-green-50 dark:bg-green-500/10",
    difficulty: "Beginner",
    readTime: "3 min read",
    category: "seeker",
    relatedGuides: ["find-fast", "visas", "disputes"],
    sections: [
      {
        id: "id-upload",
        title: "Upload Your ID",
        content: [
          "MigRent AI accepts a range of identity documents to accommodate migrants at different stages of their Australian journey. You can upload your passport, Australian driver's licence, state-issued photo ID, or ImmiCard. If you have recently arrived and only have your passport, that is perfectly fine as a starting point.",
          "When uploading, make sure the document is clearly legible with no glare, blur, or cropped edges. The system uses optical character recognition to extract your name, date of birth, and document number. If the automatic scan cannot read your document, you will be prompted to re-upload or manually enter the details for verification.",
        ],
        tip: "If your name on your passport uses non-Latin characters, upload both the photo page and the machine-readable zone page. This ensures the system can match your name accurately.",
      },
      {
        id: "selfie-match",
        title: "Take a Selfie for Matching",
        content: [
          "After uploading your ID, you will be asked to take a live selfie using your device's camera. This step confirms that the person creating the account is the same person shown on the identity document. The process takes less than ten seconds.",
          "Position your face within the on-screen oval guide, ensure you are in a well-lit area, and remove sunglasses or hats. The system compares your selfie against the photo on your uploaded ID using privacy-preserving facial matching technology. Your selfie is encrypted during transmission and is never shared with hosts or other users.",
          "If the match confidence is below the threshold, you will be asked to try again. Common issues include poor lighting, wearing a mask, or significant changes in appearance since the ID photo was taken. You can attempt the selfie match up to three times before being directed to manual review.",
        ],
        tip: "Use front-facing natural light for the clearest selfie. Avoid standing with a window behind you, as the backlight can make your face appear too dark for the matching algorithm.",
      },
      {
        id: "address-confirmation",
        title: "Confirm Your Address",
        content: [
          "Address confirmation is optional but recommended. If you already have an Australian address, you can verify it by uploading a utility bill, bank statement, or government letter dated within the last three months that shows your name and address.",
          "For seekers who have not yet arrived in Australia, you can skip this step initially and complete it after you have settled into your accommodation. Your trust badge will still be granted based on your ID and selfie verification, and you can add address verification later to increase your profile completeness score.",
        ],
        tip: "A confirmed Australian address boosts your profile completeness to 100% and can increase your application acceptance rate by up to 40% according to MigRent AI platform data.",
      },
      {
        id: "trust-badge",
        title: "Earn Your Trust Badge",
        content: [
          "Once your ID and selfie verification are approved, you receive a green trust badge that is displayed on your profile and alongside every application you submit. This badge tells hosts that your identity has been independently confirmed, significantly increasing the likelihood that they will respond to your enquiry.",
          "The trust badge also unlocks premium platform features including one-click apply, priority placement in host inboxes, access to exclusive verified-only listings, and the ability to message hosts directly before applying. These features are designed to give verified seekers a meaningful advantage in competitive rental markets like Sydney and Melbourne.",
          "Verification is a one-time process and your badge remains active for the duration of your MigRent AI account. If you update your identity document (for example, after receiving a new visa or permanent residency), you may be asked to re-verify to keep your badge current.",
        ],
        tip: "Hosts on MigRent AI are three times more likely to accept applications from seekers with a trust badge. Completing verification before you start applying is well worth the five minutes it takes.",
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────────────
  // 4. List a Property
  // ────────────────────────────────────────────────────────────────────────
  {
    id: "list-property",
    title: "List a Property",
    description:
      "A comprehensive guide to creating a standout property listing with professional photos, smart pricing, and optimised availability settings.",
    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01",
    gradient: "from-purple-500 to-violet-500",
    color: "text-purple-500",
    bgColor: "bg-purple-50 dark:bg-purple-500/10",
    difficulty: "Intermediate",
    readTime: "6 min read",
    category: "owner",
    relatedGuides: ["host-first", "superhost", "earnings"],
    sections: [
      {
        id: "room-details",
        title: "Enter Room Details",
        content: [
          "The room details section is where you describe exactly what your seeker will be renting. Start by selecting the room type: private bedroom, shared bedroom, studio, or entire apartment or house. Then specify the bed type (single, double, queen, or king), whether the room is furnished, and the total floor area in square metres if you know it.",
          "Next, fill out the amenities checklist. MigRent AI provides a comprehensive list including Wi-Fi, air conditioning, heating, built-in wardrobe, desk and chair, ensuite bathroom, shared bathroom, laundry access, parking, and bicycle storage. Tick everything that applies because seekers frequently filter by these amenities.",
          "Finally, describe any unique features in the free-text field. Perhaps the room has a balcony, city views, direct garden access, or is on the ground floor with wheelchair accessibility. These details help your listing stand out from similar properties in the same suburb.",
        ],
        tip: "Mention the internet speed in your description if you have a fast connection. Remote workers and online students consider reliable Wi-Fi a top-three priority when choosing accommodation.",
      },
      {
        id: "photo-best-practices",
        title: "Photo Best Practices",
        content: [
          "Professional-looking photos do not require a professional camera. A modern smartphone in good lighting conditions is more than sufficient. The key principles are: shoot in landscape orientation, use natural daylight by opening curtains and blinds, turn on all room lights for a warm ambience, and avoid including people or pets in the frame.",
          "Upload at least six photos in the following order: bedroom (wide angle from doorway), bedroom (detail shot of desk or storage), bathroom, kitchen, common living area, and exterior or street view. MigRent AI uses the first photo as the listing thumbnail, so make it your strongest and most inviting shot.",
          "If you are listing multiple rooms in the same property, photograph each room individually and clearly label which photos belong to which room. Seekers can get confused when photos from different rooms are mixed together, and this confusion often leads to lower engagement with the listing.",
        ],
        tip: "Declutter every surface before photographing. Remove personal items like toiletries, chargers, and paperwork. A clean, minimal space looks larger and more inviting in photos.",
      },
      {
        id: "pricing-strategy",
        title: "Pricing Strategy",
        content: [
          "MigRent AI's pricing recommendation engine analyses thousands of comparable listings across Australia to suggest an optimal weekly price for your room. The algorithm considers your suburb, room type, amenities, proximity to transport, and current market demand. You can accept the suggested price or override it with your own.",
          "Consider implementing seasonal pricing if your area experiences demand fluctuations. University suburbs often see higher demand from January to March (start of academic year) and July (mid-year intake), while holiday destinations peak during December and January. MigRent AI lets you set different rates for up to four seasonal periods per year.",
          "Offering a bills-included price can simplify the experience for seekers and make your listing more attractive compared to properties that charge utilities separately. Calculate your average monthly utility cost, divide it by four, and add that amount to your weekly rate. Many seekers, especially those new to Australia, prefer the predictability of a single all-inclusive price.",
        ],
        tip: "Check the MigRent AI earnings calculator before setting your price. It shows you how your rate compares to the suburb median and estimates your annual income based on an average occupancy rate.",
      },
      {
        id: "availability-settings",
        title: "Availability Settings",
        content: [
          "Your availability calendar controls when your room can be booked. You can set a minimum stay length (MigRent AI recommends at least four weeks for the best host and seeker experience), a maximum stay length, and specific date ranges when the room is unavailable.",
          "If you want to review every booking request manually, enable the \"Request to Book\" mode. This means seekers submit a request and you have 24 hours to accept or decline before it expires. Alternatively, if you want to maximise bookings with minimal effort, enable \"Instant Book\" which automatically confirms any booking from a verified seeker that meets your minimum stay requirement.",
          "Keep your calendar up to date. Stale availability is one of the most common frustrations for seekers and can negatively affect your host rating. If your room becomes unavailable unexpectedly, pause the listing immediately from your dashboard rather than leaving it active and declining requests.",
        ],
        tip: "Enable Instant Book for verified seekers to increase your booking rate. Data from MigRent AI shows that Instant Book listings receive 60% more confirmed bookings than Request to Book listings.",
      },
      {
        id: "publish-go-live",
        title: "Publish and Go Live",
        content: [
          "Before publishing, MigRent AI runs a completeness check on your listing. This review ensures you have filled in all required fields, uploaded the minimum number of photos, and set a price within a reasonable range for your suburb. If anything is missing, you will see specific prompts to fix each issue.",
          "Once your listing passes the completeness check, click \"Publish\" to make it live. Your listing will appear in search results within minutes and will be eligible for the \"New Listing\" badge for its first seven days. This badge gives new listings a temporary visibility boost to help you get your first booking.",
        ],
        tip: "Share your new listing link on social media or community groups relevant to migrants in your area. Many seekers research housing options through community networks before they arrive.",
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────────────
  // 5. Become a Superhost
  // ────────────────────────────────────────────────────────────────────────
  {
    id: "superhost",
    title: "Become a Superhost",
    description:
      "Unlock the prestigious Superhost badge by meeting MigRent AI's quality benchmarks for ratings, response time, reliability, and booking volume.",
    icon: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z",
    gradient: "from-amber-500 to-orange-500",
    color: "text-amber-500",
    bgColor: "bg-amber-50 dark:bg-amber-500/10",
    difficulty: "Advanced",
    readTime: "4 min read",
    category: "owner",
    relatedGuides: ["host-first", "list-property", "earnings"],
    sections: [
      {
        id: "rating-maintenance",
        title: "Maintain a 4.8+ Rating",
        content: [
          "Your overall rating is the single most important factor in earning and retaining Superhost status. MigRent AI calculates your rating as a rolling average of your last twenty reviews. To qualify as a Superhost, you need an average rating of 4.8 out of 5.0 or higher.",
          "The rating is based on five dimensions: accuracy (does the room match the listing), cleanliness, communication, check-in experience, and value for money. Focus on accuracy and cleanliness as these two categories carry the highest weight and are the most common reasons for low scores.",
          "If you receive a review below 4.0, respond to it professionally and publicly. Acknowledge any valid concerns, explain what you have done to address the issue, and invite the seeker to stay again. A thoughtful response to a negative review can actually build trust with future seekers who read it.",
        ],
        tip: "Send a short message to your seeker the day before checkout asking if there is anything you can improve. This gives them a chance to raise minor issues privately rather than in a public review.",
      },
      {
        id: "response-time",
        title: "Respond Within One Hour",
        content: [
          "MigRent AI tracks your average response time to new messages and booking requests. To maintain Superhost status, your median response time must be under one hour during your active hours. Active hours are defined as the window you set in your host settings (for example, 8 am to 10 pm).",
          "Enable push notifications on your phone and set up the MigRent AI quick-reply templates to respond faster. The platform provides pre-written responses for common enquiries such as check-in instructions, transport directions, and house rules summaries. You can customise these templates and send them with a single tap.",
          "If you know you will be unavailable for an extended period (holiday, work travel), set your listing to \"Paused\" or assign a co-host to respond on your behalf. Unanswered messages during active hours will count against your response time metric.",
        ],
        tip: "Set up auto-reply for after-hours messages. A simple note saying \"Thanks for your message, I will reply first thing in the morning\" sets expectations and shows seekers you are attentive.",
      },
      {
        id: "zero-cancellations",
        title: "Zero Cancellation Policy",
        content: [
          "Superhost status requires zero host-initiated cancellations over a rolling twelve-month period. Cancelling a confirmed booking is one of the most disruptive experiences for a seeker, especially one who may be arriving from overseas with no backup accommodation arranged.",
          "To avoid cancellations, only accept bookings for dates you are fully confident the room will be available. If your personal circumstances change, try to find the seeker an alternative room through MigRent AI's host network before cancelling. The platform provides a \"Transfer Booking\" tool that lets you recommend your seeker to another verified host in your area.",
          "In genuine emergencies (property damage, family crisis), MigRent AI's support team can process an extenuating circumstances cancellation that does not count against your Superhost record. However, this exemption is reviewed on a case-by-case basis and is not guaranteed.",
        ],
        tip: "Block out dates on your calendar well in advance if you have any personal events or property maintenance planned. Prevention is always better than a last-minute cancellation.",
      },
      {
        id: "booking-milestones",
        title: "Complete 10+ Bookings",
        content: [
          "The final Superhost requirement is a minimum of ten completed bookings within the past twelve months. This threshold ensures that Superhosts have a meaningful track record of hosting experience. A completed booking means the seeker checked in, stayed for the agreed duration, and checked out normally.",
          "If you are working towards your first ten bookings, focus on shorter minimum stays (four to six weeks) to accumulate bookings more quickly. Once you have earned Superhost status, you can adjust your minimum stay upwards if you prefer longer-term seekers.",
          "Superhost status is evaluated quarterly. If you meet all four criteria at the time of evaluation, you receive the gold Superhost badge for the next three months. The badge is displayed prominently on your listing and profile, and Superhost listings receive a ranking boost in search results.",
        ],
        tip: "Superhosts on MigRent AI earn an average of 20% more per booking compared to standard hosts, thanks to higher visibility and the trust premium that comes with the badge.",
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────────────
  // 6. Earnings Calculator
  // ────────────────────────────────────────────────────────────────────────
  {
    id: "earnings",
    title: "Earnings Calculator",
    description:
      "Use MigRent AI's data-driven earnings calculator to estimate your rental income based on your suburb, room type, and occupancy assumptions.",
    icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    gradient: "from-emerald-500 to-teal-500",
    color: "text-emerald-500",
    bgColor: "bg-emerald-50 dark:bg-emerald-500/10",
    difficulty: "Beginner",
    readTime: "3 min read",
    category: "owner",
    relatedGuides: ["host-first", "list-property", "superhost"],
    sections: [
      {
        id: "using-calculator",
        title: "Using the Earnings Calculator",
        content: [
          "The MigRent AI earnings calculator is a free tool available to all registered hosts. You can access it from the main navigation bar or from your host dashboard. No listing is required to use the calculator, making it an ideal starting point if you are still deciding whether to host.",
          "To generate an estimate, enter your suburb name or postcode, select the room type you plan to offer (private room, shared room, or entire unit), and indicate whether the room is furnished. The calculator instantly generates a weekly, monthly, and annual income estimate based on real-time platform data and assumed occupancy rates.",
          "You can adjust the occupancy slider to model different scenarios. The default setting is 85% occupancy, which reflects the average across MigRent AI's host network. If you are in a high-demand suburb near a university or major employer, you may realistically achieve 90 to 95% occupancy. For more regional areas, 70 to 80% may be more accurate.",
        ],
        tip: "Run the calculator for several room types to see which configuration maximises your return. In some suburbs, two shared rooms earn more than one private room.",
      },
      {
        id: "suburb-rent-data",
        title: "Understanding Suburban Rent Data",
        content: [
          "The calculator draws on MigRent AI's proprietary rental data, which aggregates listing prices and actual booking values across the platform. For each suburb, you will see the median weekly price, the 25th percentile (budget end), and the 75th percentile (premium end) for each room type.",
          "This data updates weekly, so it reflects current market conditions rather than historical averages. If a new university campus opens in a suburb or a major employer moves in, you will see the impact in the data within a few weeks. This responsiveness makes the calculator significantly more useful than annual government rental reports.",
          "Keep in mind that the data reflects MigRent AI's specific market, which focuses on migrants and temporary residents. These renters may have different price sensitivities compared to the broader market, so the figures may differ slightly from general rental platforms.",
        ],
        tip: "Compare the MigRent AI median with general rental data from Domain or Realestate.com.au. If the MigRent AI median is higher, it suggests strong demand from the migrant segment in that suburb.",
      },
      {
        id: "room-type-comparison",
        title: "Room Type Comparisons",
        content: [
          "The calculator includes a comparison view that shows estimated earnings side by side for different room configurations. For example, if you have a three-bedroom house, you can compare the income from renting one private room versus two private rooms versus the entire property as a single listing.",
          "Each configuration shows the estimated weekly income, annual income, and the implied return on investment if you enter your mortgage or ownership costs. This feature is particularly useful for investors evaluating whether to convert a property into multi-room share accommodation or keep it as a single tenancy.",
          "The comparison also factors in MigRent AI's service fee for each scenario, so the earnings shown are your net take-home amounts. Higher room counts generally yield higher total income but come with additional hosting responsibilities, so weigh the financial benefit against the time commitment.",
        ],
        tip: "Factor in the cost of furnishing when comparing room types. Furnished private rooms command a premium of 15 to 25% over unfurnished, but the upfront furniture investment typically pays for itself within three to four months of bookings.",
      },
      {
        id: "tax-considerations",
        title: "Tax Considerations for Hosts",
        content: [
          "Income earned through MigRent AI is assessable income under Australian tax law and must be declared in your annual tax return. The earnings calculator includes an optional tax estimate feature that approximates your after-tax income based on your marginal tax rate.",
          "As a host, you may be eligible to claim deductions for expenses related to your rental activity. These can include a portion of your mortgage interest or rent, council rates, insurance, utilities, internet, cleaning supplies, furniture depreciation, and MigRent AI service fees. MigRent AI provides an annual income summary that you can share directly with your accountant or use for your own tax filing.",
        ],
        tip: "Keep receipts for all hosting-related expenses throughout the year. MigRent AI's income summary combined with your expense records makes tax time significantly easier. Consider consulting a tax professional familiar with share accommodation income.",
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────────────
  // 7. Migrant Visa Guide
  // ────────────────────────────────────────────────────────────────────────
  {
    id: "visas",
    title: "Migrant Visa Guide",
    description:
      "Understand how your visa type affects your housing rights in Australia, including tenancy protections, bond rules, and what to watch out for.",
    icon: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    gradient: "from-indigo-500 to-blue-500",
    color: "text-indigo-500",
    bgColor: "bg-indigo-50 dark:bg-indigo-500/10",
    difficulty: "Intermediate",
    readTime: "7 min read",
    category: "legal",
    relatedGuides: ["verify-profile", "find-fast", "disputes"],
    sections: [
      {
        id: "student-visa-500",
        title: "Student Visa (Subclass 500)",
        content: [
          "The Student Visa (subclass 500) is one of the most commonly held visa types among MigRent AI users. As a student visa holder, you have the same residential tenancy rights as any other renter in Australia. This means you are protected by the Residential Tenancies Act in your state or territory, and landlords cannot discriminate against you based on your visa status.",
          "Student visa holders can sign residential leases, pay bonds, and have their bond lodged with the relevant state bond authority just like Australian residents. If you are renting a room through MigRent AI, the platform handles bond collection and holds it securely until the end of your stay, following the same principles as state bond schemes.",
          "Be aware that your student visa has conditions around work hours (generally limited to 48 hours per fortnight during semester and unlimited during scheduled breaks). This affects your income capacity and therefore your rental budget. MigRent AI's affordability filter takes this into account if you specify your visa type in your profile.",
        ],
        tip: "Many universities offer emergency accommodation support if you lose your housing unexpectedly. Register with your university's student services department as soon as you arrive so you know who to contact if anything goes wrong.",
      },
      {
        id: "working-holiday-417-462",
        title: "Working Holiday Visa (Subclass 417 / 462)",
        content: [
          "Working holiday visa holders (subclass 417 for first-category countries, 462 for second-category countries) typically need flexible, shorter-term accommodation as they move between cities and regional areas during their stay. MigRent AI is well-suited for this lifestyle because listings offer weekly bookings with minimum stays as short as four weeks.",
          "Your housing rights on a working holiday visa are identical to those of any other renter. However, because working holiday makers often do not sign long-term leases, they may find themselves in informal or verbal rental arrangements. We strongly advise against informal arrangements with no written agreement. MigRent AI provides a standardised booking agreement for every stay, which protects both you and your host.",
          "If you are planning to do regional work to qualify for a second or third-year visa extension, research accommodation in regional areas before you arrive. Regional housing stock can be limited, and MigRent AI's coverage in regional centres is growing but may not yet match capital city availability. Set up alerts for your target regional areas well in advance.",
        ],
        tip: "Keep digital copies of all your accommodation agreements and receipts. If you apply for a second-year working holiday visa, you may need to demonstrate that you lived in a specified regional area for the required period.",
      },
      {
        id: "skilled-worker-482",
        title: "Temporary Skill Shortage Visa (Subclass 482)",
        content: [
          "The subclass 482 visa (formerly the 457 visa) is held by skilled workers sponsored by an Australian employer. As a 482 visa holder, you generally have stable income and longer-term housing needs, which means you are well-positioned to negotiate favourable rental terms.",
          "Your tenancy rights are the same as any Australian resident under your state's residential tenancies legislation. You can sign standard lease agreements, and your landlord must provide you with a condition report, comply with minimum property standards, and follow proper notice periods for any changes or termination of your tenancy.",
          "One consideration specific to 482 visa holders is that your visa is tied to your employer. If you change jobs or your sponsorship is cancelled, your visa conditions change and this may affect your ability to maintain your rental commitment. MigRent AI's flexible booking model (with stays as short as four weeks) can be advantageous if your employment situation is in transition.",
        ],
        tip: "If your employer offers a relocation package, ask whether it includes a housing allowance. Some sponsors will cover the first four to eight weeks of accommodation costs while you settle in.",
      },
      {
        id: "housing-rights",
        title: "Housing Rights for All Visa Holders",
        content: [
          "Regardless of your visa type, Australian law provides you with fundamental tenancy protections. Your landlord or host cannot charge more than four weeks rent as a bond (or two weeks for rooms priced under a certain threshold in some states). The bond must be lodged with the state bond authority and returned to you at the end of your tenancy minus any legitimate deductions for damage beyond normal wear and tear.",
          "Discrimination based on nationality, race, or visa status is illegal under the Australian Human Rights Commission Act and state anti-discrimination laws. If a host or landlord refuses to rent to you because of your country of origin or visa type, you can lodge a complaint with the relevant state tribunal. MigRent AI has a zero-tolerance policy for discrimination and will permanently ban any host found to be engaging in discriminatory practices.",
          "You are also protected against retaliatory eviction. If you report a maintenance issue or exercise a legal right, your landlord cannot evict you in retaliation. If you believe you are being unfairly treated, MigRent AI's dispute resolution process and free legal referral service can help you understand your options.",
        ],
        tip: "Familiarise yourself with the tenancy tribunal in your state: NSW Fair Trading, VCAT in Victoria, RTA in Queensland, or equivalent in other states. These tribunals resolve rental disputes at no cost and are designed to be accessible without a lawyer.",
      },
      {
        id: "bond-rules",
        title: "Bond Rules and Your Money",
        content: [
          "In Australia, bonds (also called security deposits) are strictly regulated. The maximum bond a landlord can charge varies by state but is typically four weeks rent. Some states cap the bond at a lower amount for rooming or share accommodation. MigRent AI clearly displays the bond amount on every listing and collects it securely at the time of booking.",
          "Your bond must be held in a government-authorised bond scheme or, in the case of MigRent AI bookings, in MigRent AI's regulated trust account. The bond is not the host's money to spend. At the end of your stay, the bond is returned to you in full unless the host makes a valid claim for damages. Any disputed claims go through MigRent AI's mediation process before any deductions are made.",
          "When you move in, always complete the condition report thoroughly. Photograph every room, note any existing damage (marks on walls, stains on carpet, scratches on furniture), and submit the report through the MigRent AI app within the first 48 hours. This documentation is your primary evidence if there is a bond dispute at the end of your stay.",
        ],
        tip: "Never pay a bond directly to a host's personal bank account outside the MigRent AI platform. All legitimate bond payments are processed through the platform and protected by MigRent AI's secure holding system.",
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────────────
  // 8. Dispute Resolution
  // ────────────────────────────────────────────────────────────────────────
  {
    id: "disputes",
    title: "Dispute Resolution",
    description:
      "Learn how to file a dispute, gather evidence, and navigate MigRent AI's mediation process to reach a fair resolution.",
    icon: "M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3",
    gradient: "from-red-500 to-rose-500",
    color: "text-red-500",
    bgColor: "bg-red-50 dark:bg-red-500/10",
    difficulty: "Intermediate",
    readTime: "5 min read",
    category: "legal",
    relatedGuides: ["visas", "verify-profile", "find-fast"],
    sections: [
      {
        id: "filing-dispute",
        title: "Filing a Dispute",
        content: [
          "If you encounter an issue during your stay that you cannot resolve directly with your host or seeker, MigRent AI's dispute resolution system is available to help. Common disputes include bond deductions, property condition disagreements, early termination requests, noise complaints, and breaches of house rules.",
          "To file a dispute, navigate to the booking in question from your dashboard, click the \"Report Issue\" button, and select the category that best describes your concern. You will then be guided through a short form where you describe the issue in detail, specify the outcome you are seeking (for example, full bond refund, partial compensation, or apology), and upload any supporting evidence.",
          "Disputes should be filed within 14 days of the issue occurring or within 14 days of your checkout date for bond-related matters. Filing promptly ensures that evidence is fresh and both parties can recall the details accurately. MigRent AI acknowledges all dispute submissions within 24 hours.",
        ],
        tip: "Before filing a formal dispute, try sending a direct message to the other party through MigRent AI's messaging system. Many issues can be resolved through a calm, written conversation and it demonstrates good faith if the matter does escalate.",
      },
      {
        id: "evidence-collection",
        title: "Collecting Evidence",
        content: [
          "Strong evidence is the foundation of a successful dispute resolution. The most valuable types of evidence include timestamped photographs (use the MigRent AI app's photo feature which automatically adds date and location metadata), screenshots of relevant messages exchanged through the platform, your move-in condition report, and any receipts related to your claim.",
          "If the dispute involves property damage, photograph the damage from multiple angles and include a wider shot that shows the context of where the damage is located within the room. If possible, also include photos from your move-in condition report showing the same area in its original state.",
          "For disputes about behaviour or house rule violations, keep a written log with dates, times, and descriptions of each incident. If other housemates witnessed the incidents, ask them if they would be willing to provide a brief written statement. MigRent AI's mediation team gives significant weight to contemporaneous records over recollections shared long after the fact.",
        ],
        tip: "Take photos of every room on both your move-in and move-out days. These before-and-after comparisons are the single most effective form of evidence in bond disputes.",
      },
      {
        id: "mediation-steps",
        title: "The Mediation Process",
        content: [
          "Once a dispute is filed and evidence has been submitted by both parties, MigRent AI assigns a trained mediator to the case. The mediator is an independent team member who has no prior relationship with either party. Their role is to facilitate a fair resolution, not to advocate for one side.",
          "The mediation process typically follows four stages. First, the mediator reviews all submitted evidence and correspondence from both parties. Second, the mediator may ask clarifying questions to either party via the platform's secure messaging system. Third, the mediator proposes a resolution based on the evidence and MigRent AI's community guidelines. Fourth, both parties are invited to accept or reject the proposed resolution.",
          "Most disputes are resolved within five to seven business days. For straightforward bond disputes where the evidence is clear, resolution may come in as little as two business days. More complex matters involving multiple incidents or significant financial claims may take up to fourteen business days.",
        ],
        tip: "Respond to mediator questions promptly and thoroughly. Delays in your responses extend the resolution timeline for both parties.",
      },
      {
        id: "resolution-outcomes",
        title: "Resolution Outcomes",
        content: [
          "MigRent AI's mediation can result in several outcomes depending on the nature of the dispute. For bond disputes, the mediator may order a full refund to the seeker, a partial refund, or validate the host's claim and authorise a deduction. For behavioural disputes, outcomes may include a formal warning, a requirement to follow specific corrective actions, or in serious cases, removal from the platform.",
          "If both parties accept the mediator's proposed resolution, it is considered binding and the relevant financial adjustments (bond refunds, compensation payments) are processed automatically through MigRent AI's payment system within three business days.",
          "If either party rejects the mediation outcome, MigRent AI provides information about external escalation options. These include your state's residential tenancy tribunal (such as NCAT in NSW, VCAT in Victoria, or QCAT in Queensland), local community legal centres that offer free advice, and the Australian Human Rights Commission for discrimination-related complaints. MigRent AI will provide a summary of the dispute and all evidence to support your external complaint if requested.",
        ],
        tip: "State tenancy tribunals are free to use and designed to be accessible without legal representation. If your dispute is not resolved to your satisfaction through MigRent AI mediation, do not hesitate to escalate to the relevant tribunal.",
      },
      {
        id: "preventing-disputes",
        title: "Preventing Disputes Before They Happen",
        content: [
          "The best dispute is one that never happens. Both hosts and seekers can take proactive steps to minimise the risk of conflict. For hosts, this means maintaining accurate and up-to-date listing descriptions, completing a thorough condition report before every new seeker arrives, setting clear house rules, and communicating responsively.",
          "For seekers, prevention starts with reading the listing description and house rules carefully before booking, completing the condition report within 48 hours of moving in, raising any maintenance issues promptly through the app rather than letting them escalate, and respecting the shared spaces and agreed-upon rules.",
          "Both parties should communicate through the MigRent AI platform rather than personal messaging apps. In-platform messages are time-stamped, stored securely, and can be referenced if a dispute arises. Messages sent outside the platform cannot be verified and carry much less weight in mediation.",
        ],
        tip: "Schedule a five-minute check-in conversation between host and seeker at the end of the first week. Addressing small concerns early prevents them from growing into formal disputes later.",
      },
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

export default guidesContent;
