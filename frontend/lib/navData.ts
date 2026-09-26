import { RESOURCE_HUBS, RESOURCE_ICON } from "../data/resources";

export interface NavLinkSimple {
  type: "link";
  href: string;
  labelKey: string;
}

export interface DropdownItem {
  href: string;
  iconPath: string;
  /** Translated text. Used unless a literal `title` is given. */
  titleKey?: string;
  descKey?: string;
  /** Literal text, for items whose wording has a single source of truth
   *  elsewhere - the Resources hubs read theirs from data/resources.ts so
   *  the navbar and the pages cannot describe them differently. */
  title?: string;
  desc?: string;
}

export interface NavLinkDropdown {
  type: "dropdown";
  labelKey: string;
  id: string;
  /** One flat list. The navbar decides whether to draw it in one or two
   *  columns from the item count, which is what stopped the Resources
   *  panel needing an eight-cell grid to hold eight destinations. */
  items: DropdownItem[];
  /** Route prefixes that light this trigger up. Explicit, because the id
   *  is not always the first path segment ("stay" owns /seeker/search). */
  matchPrefixes: string[];
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
 *
 * ── On Resources ──
 * It used to carry eight items in a 520px two-column grid: Guides, Blog,
 * ROI calculator, Rental laws, FAQ, Help, Become a mentor and Careers. Two
 * of those were not resources at all, and four were two pairs of the same
 * thing (Guides/Blog, FAQ/Help) with descriptions too similar to choose
 * between. It is three destinations now, read from data/resources.ts:
 *
 *     Guides & Articles   /resources/guides
 *     Tools & Checklists  /resources/tools
 *     Help Centre         /resources/help
 *
 * Careers and Become a mentor did not go anywhere - both are still linked
 * from the footer, and Become a mentor from /mentors and the homepage.
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
} as const;

export const navItems: NavItem[] = [
  {
    type: "dropdown",
    labelKey: "nav.findStay",
    id: "stay",
    matchPrefixes: ["/seeker/search", "/for-seekers", "/suburbs", "/suburb", "/safety-verification"],
    items: [
      { href: "/seeker/search", iconPath: ICON.search, titleKey: "nav.item.search.title", descKey: "nav.item.search.desc" },
      { href: "/for-seekers", iconPath: ICON.route, titleKey: "nav.item.howItWorks.title", descKey: "nav.item.howItWorks.desc" },
      { href: "/suburbs", iconPath: ICON.compass, titleKey: "nav.item.suburbs.title", descKey: "nav.item.suburbs.desc" },
      { href: "/safety-verification", iconPath: ICON.shield, titleKey: "nav.item.safety.title", descKey: "nav.item.safety.desc" },
    ],
  },
  {
    type: "dropdown",
    labelKey: "nav.forOwners",
    id: "owners",
    matchPrefixes: ["/for-owners", "/owner/listings/new", "/pricing", "/features"],
    items: [
      { href: "/for-owners", iconPath: ICON.home, titleKey: "nav.item.whyList.title", descKey: "nav.item.whyList.desc" },
      { href: "/owner/listings/new", iconPath: ICON.plus, titleKey: "nav.item.listRoom.title", descKey: "nav.item.listRoom.desc" },
      { href: "/pricing", iconPath: ICON.tag, titleKey: "nav.item.pricing.title", descKey: "nav.item.pricing.desc" },
      { href: "/features", iconPath: ICON.spark, titleKey: "nav.item.features.title", descKey: "nav.item.features.desc" },
    ],
  },
  { type: "link", href: "/mentors", labelKey: "nav.mentors" },
  {
    type: "dropdown",
    labelKey: "nav.resources",
    id: "resources",
    /* The hub routes plus the detail routes that live under them, so the
       trigger still reads as current while you are inside a guide, a blog
       post or a help article. */
    matchPrefixes: ["/resources", "/guides", "/blog", "/help"],
    items: RESOURCE_HUBS.map((hub) => ({
      href: hub.href,
      iconPath: RESOURCE_ICON[hub.icon],
      title: hub.title,
      desc: hub.description,
    })),
  },
];
