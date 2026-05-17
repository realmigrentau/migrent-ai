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
  color: string;
}

export interface NavLinkDropdown {
  type: "dropdown";
  labelKey: string;
  id: string;
  columns: DropdownItem[][];
}

export type NavItem = NavLinkSimple | NavLinkDropdown;

export const navItems: NavItem[] = [
  { type: "link", href: "/", labelKey: "nav.home" },
  {
    type: "dropdown",
    labelKey: "nav.features",
    id: "features",
    columns: [
      [
        {
          href: "/features#ai-matching",
          iconPath:
            "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
          titleKey: "features.aiMatching.title",
          descKey: "features.aiMatching.navDesc",
          color: "text-rose-500",
        },
        {
          href: "/features#verified-hosts",
          iconPath:
            "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
          titleKey: "features.verifiedHosts.title",
          descKey: "features.verifiedHosts.navDesc",
          color: "text-blue-500",
        },
        {
          href: "/features#instant-booking",
          iconPath:
            "M13 10V3L4 14h7v7l9-11h-7z",
          titleKey: "features.instantBooking.title",
          descKey: "features.instantBooking.navDesc",
          color: "text-green-500",
        },
        {
          href: "/features#suburb-reports",
          iconPath:
            "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z",
          titleKey: "features.suburbs.title",
          descKey: "features.suburbs.navDesc",
          color: "text-teal-500",
        },
      ],
      [
        {
          href: "/features#smart-filters",
          iconPath:
            "M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z",
          titleKey: "features.smartFilters.title",
          descKey: "features.smartFilters.navDesc",
          color: "text-purple-500",
        },
        {
          href: "/features#superhost",
          iconPath:
            "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z",
          titleKey: "features.superhost.title",
          descKey: "features.superhost.navDesc",
          color: "text-amber-500",
        },
        {
          href: "/features#support",
          iconPath:
            "M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z",
          titleKey: "features.support.title",
          descKey: "features.support.navDesc",
          color: "text-cyan-500",
        },
        {
          href: "/features#mentor-network",
          iconPath:
            "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
          titleKey: "features.mentorNetwork.title",
          descKey: "features.mentorNetwork.navDesc",
          color: "text-pink-500",
        },
      ],
    ],
  },
  { type: "link", href: "/pricing", labelKey: "nav.pricing" },
  {
    type: "dropdown",
    labelKey: "nav.resources",
    id: "resources",
    columns: [
      [
        {
          href: "/guides",
          iconPath:
            "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
          titleKey: "nav.guides",
          descKey: "guides.hostFirst.navDesc",
          color: "text-[var(--color-ink-2)]",
        },
        {
          href: "/blog",
          iconPath:
            "M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z",
          titleKey: "resources.blog.title",
          descKey: "resources.blog.desc",
          color: "text-[var(--color-ink-2)]",
        },
        {
          href: "/resources/roi-calculator",
          iconPath:
            "M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z",
          titleKey: "resources.calculator.title",
          descKey: "resources.calculator.desc",
          color: "text-[var(--color-ink-2)]",
        },
        {
          href: "/resources/api-docs",
          iconPath: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4",
          titleKey: "resources.apiDocs.title",
          descKey: "resources.apiDocs.desc",
          color: "text-[var(--color-ink-2)]",
        },
      ],
      [
        {
          href: "/resources/rental-laws",
          iconPath:
            "M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3",
          titleKey: "resources.rentalLaws.title",
          descKey: "resources.rentalLaws.desc",
          color: "text-[var(--color-ink-2)]",
        },
        {
          href: "/resources/discord",
          iconPath:
            "M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z",
          titleKey: "resources.discord.title",
          descKey: "resources.discord.desc",
          color: "text-[var(--color-ink-2)]",
        },
        {
          href: "/careers",
          iconPath:
            "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
          titleKey: "resources.careers.title",
          descKey: "resources.careers.desc",
          color: "text-[var(--color-ink-2)]",
        },
        {
          href: "/faq",
          iconPath:
            "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
          titleKey: "footer.faq",
          descKey: "guides.findFast.navDesc",
          color: "text-[var(--color-ink-2)]",
        },
      ],
    ],
  },
];
