export type BlogCategory = "Guide" | "Market" | "Safety" | "News" | "Tips";

export interface ContentBlock {
  type: "paragraph" | "heading" | "list" | "callout";
  content: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: BlogCategory;
  date: string;
  readTime: string;
  author: string;
  authorRole: string;
  content: ContentBlock[];
  tags: string[];
}

const blogPosts: BlogPost[] = [
  {
    slug: "5-tips-first-time-migrants",
    title: "5 Tips for First-Time Migrants Finding Housing in Sydney",
    excerpt:
      "Navigating the Sydney rental market can feel overwhelming when you first arrive. Here are five practical tips to help you secure safe, affordable housing as a newcomer to Australia.",
    category: "Guide",
    date: "Feb 2026",
    readTime: "7 min read",
    author: "Priya Sharma",
    authorRole: "Housing Expert",
    content: [
      {
        type: "paragraph",
        content:
          "Moving to a new country is exciting, but finding a place to live in Sydney can quickly become one of the most stressful parts of the journey. Competition for rentals is fierce, lease terms can be confusing, and without a local rental history it can feel like the odds are stacked against you. The good news is that thousands of migrants successfully find great housing every year, and with the right approach you can too.",
      },
      {
        type: "heading",
        content: "1. Start Your Search Before You Arrive",
      },
      {
        type: "paragraph",
        content:
          "One of the biggest mistakes first-time migrants make is waiting until they land in Australia to begin looking for accommodation. Ideally, you should start researching suburbs, average rents, and transport links at least four to six weeks before your arrival date. Platforms like MigRent let you browse verified listings, connect with migrant-friendly hosts, and even arrange virtual inspections from overseas so you can hit the ground running.",
      },
      {
        type: "heading",
        content: "2. Understand the Different Housing Options",
      },
      {
        type: "paragraph",
        content:
          "Sydney offers a wide range of housing types and it helps to know what each one means. A 'studio' or 'bedsit' is a single-room apartment with a small kitchen area. A 'granny flat' is a self-contained unit on the grounds of a larger property. Share houses are common for students and young professionals, where you rent a private bedroom and share common areas. Knowing these terms will help you filter listings more effectively and avoid surprises at inspection.",
      },
      {
        type: "heading",
        content: "3. Prepare Your Documents in Advance",
      },
      {
        type: "list",
        content:
          "A valid passport and visa confirmation\nProof of employment or an offer letter, or your university enrolment\nBank statements showing sufficient funds (typically 3-6 months of rent)\nA reference letter from a previous landlord or employer, translated into English if necessary\n100 points of identification (passport, bank card, and a utility bill or government letter usually suffice)",
      },
      {
        type: "paragraph",
        content:
          "Having these documents ready in a single PDF folder means you can submit applications immediately after an inspection. Speed matters in Sydney, where popular properties can receive dozens of applications within hours.",
      },
      {
        type: "heading",
        content: "4. Know Your Rights as a Tenant",
      },
      {
        type: "paragraph",
        content:
          "Australian tenancy law provides strong protections for renters regardless of visa status. In New South Wales, landlords cannot refuse to rent to you solely because you are a migrant or on a temporary visa. Your bond (security deposit) is held by a government body called NSW Fair Trading, not by the landlord. You are entitled to a condition report at the start of the tenancy, and the landlord must give proper notice before entering the property or raising the rent.",
      },
      {
        type: "callout",
        content:
          "Never pay a bond or holding deposit directly to a landlord's personal bank account. Legitimate bonds in NSW are lodged with the Rental Bond Board. If someone asks you to transfer money outside this system, it is likely a scam.",
      },
      {
        type: "heading",
        content: "5. Use Migrant-Focused Platforms and Communities",
      },
      {
        type: "paragraph",
        content:
          "General listing sites can be overwhelming and they do not always cater to the unique needs of newcomers. Migrant-focused platforms like MigRent verify hosts, offer multilingual support, and connect you with a community of people who understand exactly what you are going through. Local migrant resource centres, Facebook groups for your nationality, and university housing offices are also excellent sources of leads and advice.",
      },
      {
        type: "paragraph",
        content:
          "Finding your first home in Sydney takes patience and persistence, but it is absolutely achievable. Start early, stay organised, know your rights, and lean on the communities and tools designed to help newcomers. Welcome to Australia.",
      },
    ],
    tags: [
      "housing",
      "sydney",
      "first-time renters",
      "migrant tips",
      "tenant rights",
    ],
  },
  {
    slug: "sydney-rental-market-2026",
    title: "Sydney Rental Market Update: What Migrants Need to Know in 2026",
    excerpt:
      "The Sydney rental market is shifting in 2026. With new housing supply coming online and policy changes on the horizon, here is what migrants should expect when searching for a home this year.",
    category: "Market",
    date: "Jan 2026",
    readTime: "8 min read",
    author: "David Chen",
    authorRole: "Property Analyst",
    content: [
      {
        type: "paragraph",
        content:
          "After several years of historically low vacancy rates and steep rent increases, the Sydney rental market is showing early signs of rebalancing in 2026. New apartment completions, government incentives for build-to-rent developments, and a slight easing in net migration numbers are all contributing to a market that, while still competitive, is no longer quite as punishing for tenants as it was in 2024 and 2025.",
      },
      {
        type: "heading",
        content: "Vacancy Rates Are Slowly Climbing",
      },
      {
        type: "paragraph",
        content:
          "Sydney's residential vacancy rate hovered around 1.1 percent through much of 2025, well below the 3 percent benchmark considered healthy for tenants. Early 2026 data from SQM Research suggests the rate has edged up to approximately 1.5 percent citywide. While this is still tight, the direction of travel is positive. Inner-city suburbs such as Haymarket, Ultimo, and Zetland are seeing the most improvement thanks to a wave of new apartment completions.",
      },
      {
        type: "heading",
        content: "Where Rents Are Headed",
      },
      {
        type: "paragraph",
        content:
          "Median weekly rents for a two-bedroom apartment in Sydney currently sit around $680, up roughly 4 percent year-on-year. That growth rate is significantly slower than the double-digit increases seen in 2023 and 2024. Outer suburbs like Parramatta, Liverpool, and Bankstown continue to offer more affordable options, with median two-bedroom rents in the $480 to $540 range. For migrants on tighter budgets, these western suburbs also benefit from strong public transport links and established multicultural communities.",
      },
      {
        type: "heading",
        content: "Policy Changes to Watch",
      },
      {
        type: "list",
        content:
          "The NSW Government's portable bond scheme, expected to launch mid-2026, will allow tenants to transfer their bond from one property to the next without needing to front a second deposit during the overlap period\nNew minimum standards for rental properties will come into effect in July 2026, requiring landlords to ensure adequate ventilation, functioning locks, and weatherproofing\nThe federal government has increased funding for the National Rental Affordability Scheme, which subsidises below-market rents for eligible tenants including some visa holders",
      },
      {
        type: "heading",
        content: "Best Suburbs for Migrants in 2026",
      },
      {
        type: "paragraph",
        content:
          "Choosing where to live depends on your priorities, but several suburbs consistently rank well for newcomers. Parramatta offers a thriving multicultural hub with excellent transport, medical facilities, and a growing jobs market. Burwood and Strathfield are popular with East Asian and South Asian communities and sit on major train lines. Lakemba and Auburn provide affordable rents and a strong sense of community. For those working in the CBD, Mascot and Wolli Creek offer relatively affordable apartments with quick train access to the city centre.",
      },
      {
        type: "callout",
        content:
          "If you are an international student, check whether your university has partnerships with local accommodation providers. Many universities negotiate discounted rates or guaranteed allocations for incoming students, which can save you both time and money.",
      },
      {
        type: "heading",
        content: "Tips for Competing in a Tight Market",
      },
      {
        type: "paragraph",
        content:
          "Even with improving conditions, Sydney remains a landlord-friendly market in most suburbs. To give yourself the best chance, attend inspections in person where possible, submit your application on the same day, and include a brief cover letter introducing yourself and explaining your situation. Landlords and agents appreciate applicants who are organised and communicative.",
      },
      {
        type: "paragraph",
        content:
          "Offering to pay several weeks of rent in advance can sometimes help, but be cautious. Under NSW law a landlord cannot demand more than two weeks rent in advance, though you are permitted to voluntarily offer more. Never feel pressured into paying large lump sums upfront, especially before signing a lease.",
      },
      {
        type: "heading",
        content: "Looking Ahead",
      },
      {
        type: "paragraph",
        content:
          "The overall trajectory for 2026 is cautiously optimistic for renters. More supply, moderating rent growth, and progressive policy reforms are all moving in the right direction. Migrants arriving this year will still face competition, but the extreme conditions of recent years are beginning to ease. Stay informed, be prepared, and use every resource available to you.",
      },
    ],
    tags: [
      "rental market",
      "sydney",
      "2026",
      "vacancy rates",
      "rent prices",
      "suburbs",
    ],
  },
  {
    slug: "spot-rental-scams",
    title: "How to Spot Rental Scams: A Migrant's Guide to Safe Housing",
    excerpt:
      "Rental scams cost Australian tenants millions every year, and migrants are disproportionately targeted. Learn the warning signs and how to protect yourself from fraudulent listings.",
    category: "Safety",
    date: "Jan 2026",
    readTime: "9 min read",
    author: "MigRent Team",
    authorRole: "MigRent Editorial",
    content: [
      {
        type: "paragraph",
        content:
          "Every year, rental scams cost Australians tens of millions of dollars and cause enormous emotional distress. Migrants and international students are particularly vulnerable because they are often searching for housing from overseas, may be unfamiliar with local norms, and can feel pressure to secure a place quickly. Understanding the most common scam tactics is the single best way to protect yourself.",
      },
      {
        type: "heading",
        content: "Why Migrants Are Targeted",
      },
      {
        type: "paragraph",
        content:
          "Scammers deliberately target people who are new to Australia because they know newcomers may not recognise the warning signs. If you are searching from overseas, you cannot easily inspect a property in person, which makes it harder to verify that a listing is legitimate. Language barriers, unfamiliarity with Australian tenancy law, and the urgency of needing a home before you arrive all play into the scammer's hands.",
      },
      {
        type: "heading",
        content: "Red Flag 1: The Price Is Too Good to Be True",
      },
      {
        type: "paragraph",
        content:
          "If a listing advertises a modern two-bedroom apartment in Bondi for $250 per week, something is wrong. Before responding to any listing, spend a few minutes checking comparable rents in the same suburb on established platforms. If the advertised rent is significantly below the local median, treat it with extreme caution. Scammers use below-market pricing to generate a flood of interest and create a sense of urgency.",
      },
      {
        type: "heading",
        content: "Red Flag 2: You Are Asked to Pay Before Viewing",
      },
      {
        type: "callout",
        content:
          "No legitimate landlord or agent in Australia will ask you to transfer money before you have inspected the property, either in person or via a verified live video tour. If someone asks for a deposit, bond, or 'holding fee' before you have seen the property and signed a lease, walk away immediately.",
      },
      {
        type: "heading",
        content: "Red Flag 3: Communication Is Evasive or Off-Platform",
      },
      {
        type: "paragraph",
        content:
          "Scammers often try to move the conversation away from the listing platform as quickly as possible, typically to email or WhatsApp. They may refuse phone calls or video calls, provide vague answers about the property's exact address, or claim they are 'overseas' and cannot do an inspection. Legitimate landlords and agents are happy to answer detailed questions and will provide a verifiable business address or licence number.",
      },
      {
        type: "heading",
        content: "Red Flag 4: Pressure to Act Immediately",
      },
      {
        type: "paragraph",
        content:
          "Phrases like 'another tenant is about to sign' or 'this offer expires today' are classic pressure tactics. While Sydney's rental market is competitive and genuine properties do get snapped up quickly, a legitimate landlord will never pressure you into sending money without giving you adequate time to review the lease and inspect the property.",
      },
      {
        type: "heading",
        content: "Red Flag 5: The Listing Uses Stolen Photos",
      },
      {
        type: "paragraph",
        content:
          "Scammers frequently copy photos from real estate websites or social media and use them in fake listings. You can check this by doing a reverse image search on Google. If the same photos appear in a completely different listing or on a different website, the listing you are looking at is almost certainly fraudulent.",
      },
      {
        type: "heading",
        content: "How to Protect Yourself",
      },
      {
        type: "list",
        content:
          "Always inspect the property in person or via a live video call before paying anything\nVerify the landlord or agent's identity by checking the NSW Fair Trading licence register\nNever send money via wire transfer, cryptocurrency, or gift cards\nUse platforms like MigRent that verify hosts and listings before they go live\nInsist on a written lease agreement before handing over any money\nLodge your bond through the official Rental Bond Board, never into a personal bank account\nTrust your instincts: if something feels off, it probably is",
      },
      {
        type: "heading",
        content: "What to Do If You Have Been Scammed",
      },
      {
        type: "paragraph",
        content:
          "If you believe you have fallen victim to a rental scam, act quickly. Contact your bank immediately to attempt to reverse the transaction. Report the scam to the Australian Competition and Consumer Commission via Scamwatch (scamwatch.gov.au), report it to your local police, and notify the platform where you found the listing. If you are on a student visa, your university's welfare office can provide free support and advice.",
      },
      {
        type: "paragraph",
        content:
          "Staying vigilant is not about being paranoid; it is about being prepared. The vast majority of rental listings in Australia are legitimate, and by knowing what to look for you can navigate the market with confidence.",
      },
    ],
    tags: [
      "scams",
      "safety",
      "rental fraud",
      "tenant protection",
      "migrant safety",
    ],
  },
  {
    slug: "superhost-program-launch",
    title: "MigRent Launches New Superhost Program",
    excerpt:
      "We are excited to announce the MigRent Superhost Program, a new initiative that recognises and rewards hosts who go above and beyond to provide outstanding experiences for migrant tenants.",
    category: "News",
    date: "Dec 2025",
    readTime: "5 min read",
    author: "MigRent Team",
    authorRole: "MigRent Editorial",
    content: [
      {
        type: "paragraph",
        content:
          "At MigRent, we believe that great housing is about more than four walls and a roof. For someone arriving in a new country, a welcoming host can make the difference between feeling lost and feeling at home. That is why we are launching the MigRent Superhost Program, a new badge and benefits system designed to recognise hosts who consistently deliver exceptional experiences for migrant tenants.",
      },
      {
        type: "heading",
        content: "What Is a Superhost?",
      },
      {
        type: "paragraph",
        content:
          "A Superhost is a property host on MigRent who has demonstrated a sustained commitment to quality, responsiveness, and cultural sensitivity. The designation is not something you can buy; it is earned through consistently positive tenant reviews, fast response times, well-maintained properties, and a genuine willingness to help newcomers settle in.",
      },
      {
        type: "heading",
        content: "How the Program Works",
      },
      {
        type: "paragraph",
        content:
          "Every quarter, our system evaluates all active hosts against a set of clear, transparent criteria. Hosts who meet or exceed the thresholds receive the Superhost badge, which appears on all of their listings and their profile page. The badge signals to prospective tenants that this host has a proven track record of providing an excellent experience.",
      },
      {
        type: "heading",
        content: "Eligibility Criteria",
      },
      {
        type: "list",
        content:
          "An overall rating of 4.8 or above across all reviews in the assessment period\nA response rate of 90 percent or higher, with an average response time under 12 hours\nZero confirmed policy violations or unresolved disputes\nAt least three completed tenancies on the MigRent platform\nA verified property listing with accurate photos and descriptions",
      },
      {
        type: "heading",
        content: "Benefits for Superhosts",
      },
      {
        type: "list",
        content:
          "A prominent Superhost badge displayed on all listings and profile pages\nPriority placement in search results, increasing visibility to prospective tenants\nAccess to an exclusive Superhost support line with faster response times\nInvitations to quarterly Superhost networking events and webinars\nEarly access to new MigRent features and tools",
      },
      {
        type: "heading",
        content: "Benefits for Tenants",
      },
      {
        type: "paragraph",
        content:
          "For migrants searching for housing, the Superhost badge provides an immediate signal of trust and quality. You can filter search results to show only Superhost properties, giving you confidence that the listing is accurate, the host is responsive, and previous tenants have had positive experiences. In a market where newcomers often lack local references and networks, this kind of verified trust marker is invaluable.",
      },
      {
        type: "callout",
        content:
          "Starting in January 2026, you can filter listings by Superhost status directly from the MigRent search page. Look for the gold shield icon next to the host's name.",
      },
      {
        type: "heading",
        content: "Our Commitment to Quality",
      },
      {
        type: "paragraph",
        content:
          "The Superhost Program is part of our broader commitment to making the rental experience safer and more transparent for migrants in Australia. We will continue to invest in verification tools, community features, and support services that help both hosts and tenants build meaningful, positive housing relationships.",
      },
      {
        type: "paragraph",
        content:
          "If you are a host on MigRent, check your dashboard to see your current metrics and how close you are to earning Superhost status. If you are a tenant, keep an eye out for the Superhost badge when browsing listings. We are excited to see this program grow and to celebrate the hosts who make Australia feel like home.",
      },
    ],
    tags: [
      "superhost",
      "platform update",
      "hosts",
      "quality",
      "migrent news",
    ],
  },
  {
    slug: "budgeting-rent-students",
    title:
      "Budgeting for Rent in Australia: A Complete Guide for International Students",
    excerpt:
      "Managing rent on a student budget in Australia requires careful planning. This guide breaks down typical costs, smart saving strategies, and financial support options available to international students.",
    category: "Tips",
    date: "Nov 2025",
    readTime: "10 min read",
    author: "Priya Sharma",
    authorRole: "Housing Expert",
    content: [
      {
        type: "paragraph",
        content:
          "For many international students, rent is by far the largest monthly expense in Australia. Getting your housing budget right from the start can mean the difference between a comfortable, focused study experience and constant financial stress. This guide walks you through everything you need to know about budgeting for rent as an international student in 2025 and 2026.",
      },
      {
        type: "heading",
        content: "Understanding Typical Rent Costs",
      },
      {
        type: "paragraph",
        content:
          "Rent varies dramatically depending on the city and suburb. In Sydney, expect to pay between $200 and $350 per week for a room in a share house, or $350 to $550 for a studio apartment. Melbourne is slightly more affordable, with share house rooms typically ranging from $180 to $300 per week. Brisbane, Adelaide, and Perth offer even lower rents, making them attractive options for budget-conscious students. Purpose-built student accommodation generally falls in the $280 to $450 per week range and often includes utilities and internet.",
      },
      {
        type: "heading",
        content: "The True Cost of Renting",
      },
      {
        type: "paragraph",
        content:
          "Your weekly rent figure does not tell the whole story. Before signing a lease, make sure you understand and budget for all associated costs. These hidden extras can add up quickly if you are not prepared.",
      },
      {
        type: "list",
        content:
          "Bond: Typically four weeks rent, refundable at the end of your lease if the property is in good condition\nRent in advance: Usually two weeks paid upfront at lease signing\nUtilities: Electricity, gas, water, and internet can add $30 to $60 per week in a share house\nContents insurance: Optional but recommended, roughly $15 to $25 per month\nMoving costs: Budget for a small removalist or van hire if you have furniture",
      },
      {
        type: "heading",
        content: "The 30 Percent Rule",
      },
      {
        type: "paragraph",
        content:
          "A widely used guideline is that your rent should not exceed 30 percent of your gross income. For international students on a student visa, your work is capped at 48 hours per fortnight during semester (unlimited during breaks). If you are earning around $25 per hour and working the maximum allowed hours, your fortnightly income is approximately $1,200, which means a target rent of no more than $180 per week. This is tight in Sydney but achievable in a share house in the western suburbs.",
      },
      {
        type: "heading",
        content: "Smart Strategies to Reduce Rent",
      },
      {
        type: "list",
        content:
          "Share with more housemates: A four-person share house is significantly cheaper per person than a two-person arrangement\nLook beyond the inner city: Suburbs 30 to 45 minutes from campus by public transport often offer rents 30 to 40 percent lower\nConsider homestay: Living with an Australian family typically includes meals and utilities, and can cost less than renting independently\nNegotiate longer leases: Some landlords offer a small discount for tenants willing to sign a 12-month lease rather than a 6-month one\nTime your search: The market is less competitive in winter (June to August), which can work in your favour if your course starts mid-year",
      },
      {
        type: "heading",
        content: "Financial Support Options",
      },
      {
        type: "paragraph",
        content:
          "Several forms of financial assistance may be available to you. Many universities offer emergency housing grants or interest-free loans for students experiencing financial hardship. Some state governments provide rental assistance or bond loan schemes that are open to temporary visa holders. Community organisations such as the Salvation Army and St Vincent de Paul can also provide short-term financial support in urgent situations.",
      },
      {
        type: "callout",
        content:
          "Check with your university's student services team as soon as you arrive. Many institutions maintain lists of affordable accommodation, offer financial counselling, and can connect you with emergency support if you need it. These services are free and confidential.",
      },
      {
        type: "heading",
        content: "Building a Monthly Budget",
      },
      {
        type: "paragraph",
        content:
          "Sit down before you arrive and create a realistic monthly budget. List all your expected income sources (part-time work, family support, savings, scholarships) and all your expected expenses (rent, utilities, groceries, transport, phone, health insurance, study materials, and a small amount for social activities). Use a free budgeting app to track your actual spending against this plan. The students who manage their money most successfully are the ones who plan ahead and review their budget regularly.",
      },
      {
        type: "paragraph",
        content:
          "Renting in Australia on a student budget is challenging but entirely manageable with the right preparation. Start early, be realistic about what you can afford, explore all your options, and do not hesitate to ask for help when you need it. Your university, your community, and platforms like MigRent are all here to support you.",
      },
    ],
    tags: [
      "students",
      "budgeting",
      "international students",
      "rent costs",
      "financial tips",
    ],
  },
  {
    slug: "bond-rights-migrants",
    title: "Understanding Your Bond Rights as a Migrant Renter",
    excerpt:
      "Your rental bond is protected by law in Australia, regardless of your visa status. Learn how bond lodgement works, what deductions are lawful, and how to get your full bond back at the end of your tenancy.",
    category: "Guide",
    date: "Oct 2025",
    readTime: "8 min read",
    author: "David Chen",
    authorRole: "Property Analyst",
    content: [
      {
        type: "paragraph",
        content:
          "The rental bond is one of the first large sums of money you will hand over when renting in Australia, and it is also one of the most common sources of disputes between tenants and landlords. As a migrant renter, understanding exactly how the bond system works is essential to protecting your money and your rights. The good news is that Australian law provides robust safeguards for tenants, and these protections apply equally to citizens, permanent residents, and temporary visa holders.",
      },
      {
        type: "heading",
        content: "What Is a Rental Bond?",
      },
      {
        type: "paragraph",
        content:
          "A rental bond is a security deposit paid at the start of your tenancy. It is designed to protect the landlord against unpaid rent or damage to the property beyond normal wear and tear. In most Australian states, the maximum bond a landlord can charge is four weeks rent. For example, if your weekly rent is $500, your bond will be $2,000. This money is not a fee or a payment to the landlord; it is your money held in trust, and you are entitled to get it back at the end of your lease provided you meet your obligations.",
      },
      {
        type: "heading",
        content: "How Bond Lodgement Works",
      },
      {
        type: "paragraph",
        content:
          "In every Australian state and territory, your bond must be lodged with a government authority, not held by the landlord or agent personally. In New South Wales, the bond is lodged with the Rental Bond Board. In Victoria, it goes to the Residential Tenancies Bond Authority. Your landlord or agent is legally required to lodge the bond within a set timeframe (usually 10 to 14 days) and you should receive a receipt confirming the lodgement. Keep this receipt in a safe place.",
      },
      {
        type: "callout",
        content:
          "If your landlord or agent asks you to pay the bond directly into their personal bank account and says they will 'sort out the lodgement later', this is a serious red flag. Insist that the bond is lodged through the proper government channel, and keep a copy of the lodgement receipt.",
      },
      {
        type: "heading",
        content: "The Condition Report Is Your Best Friend",
      },
      {
        type: "paragraph",
        content:
          "At the start of your tenancy, the landlord or agent must provide you with a condition report. This document records the state of the property when you move in, including any existing damage, marks, or wear. Go through this report carefully, take your own dated photos of every room, and note anything that is already damaged or dirty. Return the signed report within the required timeframe (usually 3 to 7 days). This report is your primary evidence if there is a dispute about the condition of the property when you move out.",
      },
      {
        type: "heading",
        content: "What Can a Landlord Deduct From Your Bond?",
      },
      {
        type: "list",
        content:
          "Unpaid rent or other charges owed under the lease\nThe cost of repairing damage that goes beyond normal wear and tear\nCleaning costs if the property is not left in a reasonably clean condition\nReplacement of lost keys or security devices",
      },
      {
        type: "paragraph",
        content:
          "Critically, a landlord cannot deduct money for normal wear and tear. Scuff marks on walls from furniture, minor carpet wear in high-traffic areas, and faded curtains from sunlight are all examples of normal wear and tear. If your landlord tries to charge you for these, you have the right to dispute the claim.",
      },
      {
        type: "heading",
        content: "Getting Your Bond Back",
      },
      {
        type: "paragraph",
        content:
          "When your tenancy ends, you and the landlord or agent will do a final inspection. If both parties agree on the condition of the property, a bond refund form is signed and submitted to the relevant bond authority. The refund is typically processed within 7 to 14 business days. If there is a disagreement, either party can apply to the state's civil and administrative tribunal (such as NCAT in NSW or VCAT in Victoria) for a binding decision. Importantly, you do not need a lawyer for a tribunal hearing and the process is designed to be accessible to everyone.",
      },
      {
        type: "heading",
        content: "Tips for Getting Your Full Bond Back",
      },
      {
        type: "list",
        content:
          "Complete the condition report thoroughly at the start of your tenancy and keep a copy\nTake dated photos of every room when you move in and again when you move out\nClean the property thoroughly before the final inspection, or hire a professional end-of-lease cleaner\nRepair any damage you caused during the tenancy before the inspection\nReturn all keys, remotes, and security devices\nEnsure all rent and utility payments are up to date",
      },
      {
        type: "paragraph",
        content:
          "Your bond is your money, and the law is on your side. Do not let anyone tell you that migrants have fewer rights when it comes to bond refunds. If you encounter any issues, contact your state's tenancy advice service for free, confidential help. In NSW, the Tenants' Union offers a free advice line. In Victoria, contact Tenants Victoria. These services are available to all renters regardless of visa status.",
      },
    ],
    tags: [
      "bond",
      "tenant rights",
      "security deposit",
      "legal rights",
      "renting tips",
    ],
  },
];

export function getAllPosts(): BlogPost[] {
  return blogPosts;
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}

export function getPostsByCategory(category: BlogCategory): BlogPost[] {
  return blogPosts.filter((post) => post.category === category);
}
