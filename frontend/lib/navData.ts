export interface NavLinkSimple {
  type: "link";
  href: string;
  labelKey: string;
}

export interface DropdownItem {
  href: string;
  iconPath: string;
  /** Heading of the column this item sits under in the desktop panel. The
   *  panel draws one titled column per group, in first-appearance order -
   *  the layout the Dropdown Navigation reference is built around. The
   *  mobile menu and the hero ignore it and read the list flat. */
  groupKey?: string;
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
  /** Literal label, used instead of labelKey (e.g. the product name "Migrent Hub"). */
  label?: string;
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
 * anywhere: Migrent's mentors are people who have made the same move and
 * will talk you through it, not licensed real-estate brokers, and labelling
 * them "Broker" promised a regulated service the product does not provide.
 *
 * Icons are drawn at one stroke weight and inherit --color-ink-2 from the
 * navbar; per-item colours were removed (the navbar never read them, and a
 * rainbow of rose/blue/green/purple/cyan/pink was the one place the site
 * still picked colours at random).
 *
 * ── The 2026-09-29 consolidation ──
 * Four entries, matching the pages that now exist:
 *
 *     Find a stay   search, suburb guides, how renting works, mentors
 *     For owners    why list with Migrent, pricing
 *     Guides        articles, rental laws and checklists (/guides)
 *     Help          answers and contact (/help)
 *
 * Mentors moved inside "Find a stay" (it is one part of settling in, not a
 * product of its own), and the three Resources hubs became Guides and Help.
 * Listing a property is the header's own button, so it is not repeated in
 * the For owners panel.
 */

const ICON = {
  search: "M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z",
  compass: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z",
  shield: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  route: "M13 10V3L4 14h7v7l9-11h-7z",
  home: "M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V10",
  tag: "M7 7h.01M3 6a1 1 0 011-1h5.586a1 1 0 01.707.293l8.414 8.414a1 1 0 010 1.414l-5.586 5.586a1 1 0 01-1.414 0L3.293 12.293A1 1 0 013 11.586V6z",
} as const;

export const navItems: NavItem[] = [
  {
    type: "dropdown",
    labelKey: "nav.findStay",
    id: "stay",
    matchPrefixes: ["/seeker/search", "/how-renting-works", "/suburbs", "/suburb", "/mentors", "/mentor", "/become-mentor"],
    items: [
      { href: "/seeker/search", iconPath: ICON.search, groupKey: "nav.group.search", titleKey: "nav.item.search.title", descKey: "nav.item.search.desc" },
      { href: "/suburbs", iconPath: ICON.compass, groupKey: "nav.group.search", titleKey: "nav.item.suburbs.title", descKey: "nav.item.suburbs.desc" },
      { href: "/how-renting-works", iconPath: ICON.shield, groupKey: "nav.group.beforeYouRent", titleKey: "nav.item.howItWorks.title", descKey: "nav.item.howItWorks.desc" },
      { href: "/mentors", iconPath: ICON.route, groupKey: "nav.group.beforeYouRent", titleKey: "nav.item.mentors.title", descKey: "nav.item.mentors.desc" },
    ],
  },
  {
    type: "dropdown",
    labelKey: "nav.forOwners",
    id: "owners",
    matchPrefixes: ["/for-owners", "/pricing"],
    items: [
      { href: "/for-owners", iconPath: ICON.home, groupKey: "nav.group.getStarted", titleKey: "nav.item.whyList.title", descKey: "nav.item.whyList.desc" },
      { href: "/pricing", iconPath: ICON.tag, groupKey: "nav.group.getStarted", titleKey: "nav.item.pricing.title", descKey: "nav.item.pricing.desc" },
    ],
  },
  { type: "link", href: "/guides", labelKey: "nav.guides" },
  { type: "link", href: "/help", labelKey: "nav.help" },
];

export interface DropdownGroup {
  titleKey: string | null;
  items: DropdownItem[];
}

/**
 * A dropdown's items as titled columns, in first-appearance order.
 * Items without a group share one untitled column, so a new item added
 * without a groupKey still shows up rather than disappearing.
 */
export function groupDropdownItems(items: DropdownItem[]): DropdownGroup[] {
  const groups: DropdownGroup[] = [];
  const byKey = new Map<string | null, DropdownGroup>();
  for (const item of items) {
    const key = item.groupKey ?? null;
    let group = byKey.get(key);
    if (!group) {
      group = { titleKey: key, items: [] };
      byKey.set(key, group);
      groups.push(group);
    }
    group.items.push(item);
  }
  return groups;
}
