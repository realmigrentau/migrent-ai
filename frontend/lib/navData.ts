export interface NavLinkSimple {
  type: "link";
  href: string;
  labelKey: string;
}

export interface DropdownItem {
  href: string;
  iconPath: string;
  titleKey: string;
  descKey: string;
}

export interface NavLinkDropdown {
  type: "dropdown";
  labelKey: string;
  id: string;
  columns: DropdownItem[][];
}

export type NavItem = NavLinkSimple | NavLinkDropdown;

/**
 * Primary navigation.
 *
 * The information architecture is audience-first, because that is the first
 * decision a visitor actually makes: I need somewhere to live, or I have a
 * room. The previous shape (Home / Features / Pricing / Resources) was
 * product-first and buried both /seeker/search and /for-owners - the two
 * pages the whole site exists to send people to - inside a Features
 * dropdown.
 *
 * Every label names its destination. In particular there is no "Broker"
 * anywhere: MigRent's mentors are people who have made the same move and
 * will talk you through it, not licensed real-estate brokers, and labelling
 * them "Broker" promised a regulated service the product does not provide.
 *
 * Icons are drawn at one stroke weight and inherit --color-ink-2 from the
 * navbar; per-item colours were removed (the navbar never read them, and a
 * rainbow of rose/blue/green/purple/cyan/pink was the one place the site
 * still picked colours at random).
 */

const ICON = {
  search: "M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z",
  compass: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z",
  shield: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  route: "M13 10V3L4 14h7v7l9-11h-7z",
  home: "M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V10",
  plus: "M12 4v16m8-8H4",
  tag: "M7 7h.01M3 6a1 1 0 011-1h5.586a1 1 0 01.707.293l8.414 8.414a1 1 0 010 1.414l-5.586 5.586a1 1 0 01-1.414 0L3.293 12.293A1 1 0 013 11.586V6z",
  spark: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z",
  book: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
  article: "M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z",
  calculator: "M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z",
  scales: "M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3",
  question: "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  lifebuoy: "M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z",
  people: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
  briefcase: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
} as const;

export const navItems: NavItem[] = [
  {
    type: "dropdown",
    labelKey: "nav.findStay",
    id: "stay",
    columns: [
      [
        { href: "/seeker/search", iconPath: ICON.search, titleKey: "nav.item.search.title", descKey: "nav.item.search.desc" },
        { href: "/for-seekers", iconPath: ICON.route, titleKey: "nav.item.howItWorks.title", descKey: "nav.item.howItWorks.desc" },
      ],
      [
        { href: "/suburbs", iconPath: ICON.compass, titleKey: "nav.item.suburbs.title", descKey: "nav.item.suburbs.desc" },
        { href: "/safety-verification", iconPath: ICON.shield, titleKey: "nav.item.safety.title", descKey: "nav.item.safety.desc" },
      ],
    ],
  },
  {
    type: "dropdown",
    labelKey: "nav.forOwners",
    id: "owners",
    columns: [
      [
        { href: "/for-owners", iconPath: ICON.home, titleKey: "nav.item.whyList.title", descKey: "nav.item.whyList.desc" },
        { href: "/owner/listings/new", iconPath: ICON.plus, titleKey: "nav.item.listRoom.title", descKey: "nav.item.listRoom.desc" },
      ],
      [
        { href: "/pricing", iconPath: ICON.tag, titleKey: "nav.item.pricing.title", descKey: "nav.item.pricing.desc" },
        { href: "/features", iconPath: ICON.spark, titleKey: "nav.item.features.title", descKey: "nav.item.features.desc" },
      ],
    ],
  },
  { type: "link", href: "/mentors", labelKey: "nav.mentors" },
  {
    type: "dropdown",
    labelKey: "nav.resources",
    id: "resources",
    columns: [
      [
        { href: "/guides", iconPath: ICON.book, titleKey: "nav.guides", descKey: "guides.hostFirst.navDesc" },
        { href: "/blog", iconPath: ICON.article, titleKey: "resources.blog.title", descKey: "resources.blog.desc" },
        { href: "/resources/roi-calculator", iconPath: ICON.calculator, titleKey: "resources.calculator.title", descKey: "resources.calculator.desc" },
        { href: "/resources/rental-laws", iconPath: ICON.scales, titleKey: "resources.rentalLaws.title", descKey: "resources.rentalLaws.desc" },
      ],
      [
        { href: "/faq", iconPath: ICON.question, titleKey: "footer.faq", descKey: "guides.findFast.navDesc" },
        { href: "/help", iconPath: ICON.lifebuoy, titleKey: "features.support.title", descKey: "features.support.navDesc" },
        { href: "/become-mentor", iconPath: ICON.people, titleKey: "nav.item.becomeMentor.title", descKey: "nav.item.becomeMentor.desc" },
        { href: "/careers", iconPath: ICON.briefcase, titleKey: "resources.careers.title", descKey: "resources.careers.desc" },
      ],
    ],
  },
];
