import {
  Activity,
  BadgeCheck,
  BarChart3,
  Bell,
  Building2,
  CalendarClock,
  ClipboardCheck,
  Compass,
  FileText,
  Flag,
  Heart,
  Home,
  Inbox,
  KeyRound,
  LayoutGrid,
  LockKeyhole,
  ListChecks,
  MessageCircle,
  ScrollText,
  Search,
  Settings,
  ShieldCheck,
  UserRound,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { HubCounts, HubRole } from "../../lib/hub/types";

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  /** Also active for these path prefixes. */
  match?: string[];
  count?: keyof HubCounts;
  external?: boolean;
}

/**
 * Information architecture, per role. Desktop shows `primary` in the rail;
 * phones show `tabs` (five, thumb-reachable) and put the rest under
 * Profile. Every destination is reachable on both.
 *
 * Admins use a renter or owner account like anyone else; `isAdmin` adds the
 * Admin panel (which asks for its own password) to it.
 */
const ADMIN_PANEL: NavItem = { label: "Admin panel", to: "/admin", icon: LockKeyhole };

export function navFor(role: HubRole | null, opts: { hasHome?: boolean; isAdmin?: boolean } = {}) {
  if (role === "owner") {
    const primary: NavItem[] = [
      { label: "Home", to: "/", icon: Home },
      { label: "Properties", to: "/properties", icon: Building2, match: ["/listings"] },
      { label: "Applications", to: "/applications", icon: ClipboardCheck, count: "applications" },
      { label: "Inspections", to: "/inspections", icon: CalendarClock },
      { label: "Messages", to: "/messages", icon: MessageCircle, count: "messages" },
      { label: "Tenancies", to: "/tenancies", icon: KeyRound, match: ["/maintenance"], count: "maintenance" },
      { label: "Insights", to: "/insights", icon: BarChart3 },
    ];
    if (opts.isAdmin) primary.push(ADMIN_PANEL);
    const tabs: NavItem[] = [
      { label: "Home", to: "/", icon: Home },
      { label: "Properties", to: "/properties", icon: Building2, match: ["/listings"] },
      { label: "Messages", to: "/messages", icon: MessageCircle, count: "messages" },
      { label: "Activity", to: "/activity", icon: Bell, count: "notifications" },
      { label: "Profile", to: "/me", icon: UserRound, match: ["/settings", "/profile", "/applications", "/inspections", "/tenancies", "/insights", "/maintenance", "/admin"] },
    ];
    return { primary, tabs };
  }
  if (role === "admin") {
    const primary: NavItem[] = [
      { label: "Operations", to: "/", icon: LayoutGrid },
      { label: "Listings", to: "/admin/listings", icon: ListChecks },
      { label: "ID checks", to: "/admin/id-checks", icon: BadgeCheck },
      { label: "Final reviews", to: "/admin/reviews", icon: ShieldCheck },
      { label: "Reports", to: "/admin/reports", icon: Flag },
      { label: "Support", to: "/admin/support", icon: Inbox },
      { label: "People", to: "/admin/people", icon: Users },
      { label: "Numbers", to: "/admin/numbers", icon: BarChart3 },
      { label: "Audit log", to: "/admin/audit", icon: ScrollText },
      { label: "Discover", to: "/discover", icon: Compass, match: ["/homes"] },
      { label: "Messages", to: "/messages", icon: MessageCircle, count: "messages" },
    ];
    const tabs: NavItem[] = [
      { label: "Home", to: "/", icon: LayoutGrid },
      { label: "Listings", to: "/admin/listings", icon: ListChecks },
      { label: "Reviews", to: "/admin/reviews", icon: ShieldCheck },
      { label: "Reports", to: "/admin/reports", icon: Flag },
      { label: "Profile", to: "/me", icon: UserRound, match: ["/settings", "/activity", "/admin/id-checks", "/admin/support", "/admin/people", "/admin/numbers", "/admin/audit"] },
    ];
    return { primary, tabs };
  }
  const primary: NavItem[] = [
    { label: "Home", to: "/", icon: Home },
    { label: "Discover", to: "/discover", icon: Compass, match: ["/homes", "/compare"] },
    { label: "Saved", to: "/saved", icon: Heart },
    { label: "Applications", to: "/applications", icon: FileText, match: ["/apply"], count: "applications" },
    { label: "Inspections", to: "/inspections", icon: CalendarClock },
    { label: "Messages", to: "/messages", icon: MessageCircle, count: "messages" },
  ];
  if (opts.hasHome) primary.push({ label: "My home", to: "/my-home", icon: KeyRound, match: ["/tenancies", "/maintenance"] });
  primary.push({ label: "Rental Profile", to: "/profile", icon: UserRound });
  if (opts.isAdmin) primary.push(ADMIN_PANEL);
  const tabs: NavItem[] = [
    { label: "Home", to: "/", icon: Home },
    { label: "Discover", to: "/discover", icon: Compass, match: ["/homes", "/compare"] },
    { label: "Messages", to: "/messages", icon: MessageCircle, count: "messages" },
    { label: "Activity", to: "/activity", icon: Bell, count: "notifications" },
    {
      label: "Profile",
      to: "/me",
      icon: UserRound,
      match: ["/profile", "/settings", "/saved", "/applications", "/apply", "/inspections", "/my-home", "/tenancies", "/maintenance", "/admin"],
    },
  ];
  return { primary, tabs };
}

export const footerNav: NavItem[] = [
  { label: "Activity", to: "/activity", icon: Activity, count: "notifications" },
  { label: "Settings", to: "/settings", icon: Settings },
];

export function isActive(item: NavItem, hubPath: string): boolean {
  const path = hubPath.split("?")[0].split("#")[0] || "/";
  if (item.to === "/") return path === "/" || path === "";
  const prefixes = [item.to, ...(item.match ?? [])];
  return prefixes.some((p) => path === p || path.startsWith(`${p}/`));
}

export const commandIcons = { Search, Settings, Heart, Building2, Wrench };
