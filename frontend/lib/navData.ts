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
      ],
    ],
  },
  {
    type: "dropdown",
    labelKey: "nav.guides",
    id: "guides",
    columns: [
      [
        {
          href: "/guides#host-first",
          iconPath:
            "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
          titleKey: "guides.hostFirst.title",
          descKey: "guides.hostFirst.navDesc",
          color: "text-blue-500",
        },
        {
          href: "/guides#find-fast",
          iconPath: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
          titleKey: "guides.findFast.title",
          descKey: "guides.findFast.navDesc",
          color: "text-rose-500",
        },
        {
          href: "/guides#verify-profile",
          iconPath:
            "M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2",
          titleKey: "guides.verifyProfile.title",
          descKey: "guides.verifyProfile.navDesc",
          color: "text-green-500",
        },
        {
          href: "/guides#list-property",
          iconPath:
            "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01",
          titleKey: "guides.listProperty.title",
          descKey: "guides.listProperty.navDesc",
          color: "text-purple-500",
        },
      ],
      [
        {
          href: "/guides#superhost",
          iconPath:
            "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z",
          titleKey: "guides.superhost.title",
          descKey: "guides.superhost.navDesc",
          color: "text-amber-500",
        },
        {
          href: "/guides#earnings",
          iconPath:
            "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
          titleKey: "guides.earnings.title",
          descKey: "guides.earnings.navDesc",
          color: "text-emerald-500",
        },
        {
          href: "/guides#visas",
          iconPath:
            "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
          titleKey: "guides.visas.title",
          descKey: "guides.visas.navDesc",
          color: "text-indigo-500",
        },
        {
          href: "/guides#disputes",
          iconPath:
            "M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3",
          titleKey: "guides.disputes.title",
          descKey: "guides.disputes.navDesc",
          color: "text-red-500",
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
          href: "/resources#blog",
          iconPath:
            "M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z",
          titleKey: "resources.blog.title",
          descKey: "resources.blog.desc",
          color: "text-rose-500",
        },
        {
          href: "/resources#calculator",
          iconPath:
            "M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z",
          titleKey: "resources.calculator.title",
          descKey: "resources.calculator.desc",
          color: "text-green-500",
        },
        {
          href: "/resources#api-docs",
          iconPath:
            "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4",
          titleKey: "resources.apiDocs.title",
          descKey: "resources.apiDocs.desc",
          color: "text-blue-500",
        },
        {
          href: "/resources#discord",
          iconPath:
            "M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z",
          titleKey: "resources.discord.title",
          descKey: "resources.discord.desc",
          color: "text-indigo-500",
        },
      ],
      [
        {
          href: "/careers",
          iconPath:
            "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
          titleKey: "resources.careers.title",
          descKey: "resources.careers.desc",
          color: "text-amber-500",
        },
        {
          href: "/resources#rental-laws",
          iconPath:
            "M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3",
          titleKey: "resources.rentalLaws.title",
          descKey: "resources.rentalLaws.desc",
          color: "text-cyan-500",
        },
        {
          href: "/resources#owner-roi",
          iconPath:
            "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
          titleKey: "resources.ownerROI.title",
          descKey: "resources.ownerROI.desc",
          color: "text-purple-500",
        },
      ],
    ],
  },
];
