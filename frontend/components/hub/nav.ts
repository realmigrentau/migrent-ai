import {
  Activity,
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
  KeyRound,
  LayoutGrid,
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
 */
export function navFor(role: HubRole | null, opts: { hasHome?: boolean } = {}) {
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
    const tabs: NavItem[] = [
      { label: "Home", to: "/", icon: Home },
      { label: "Properties", to: "/properties", icon: Building2, match: ["/listings"] },
      { label: "Messages", to: "/messages", icon: MessageCircle, count: "messages" },
      { label: "Activity", to: "/activity", icon: Bell, count: "notifications" },
      { label: "Profile", to: "/me", icon: UserRound, match: ["/settings", "/profile", "/applications", "/inspections", "/tenancies", "/insights", "/maintenance"] },
    ];
    return { primary, tabs };
  }
  if (role === "admin") {
    const primary: NavItem[] = [
      { label: "Operations", to: "/", icon: LayoutGrid },
      { label: "Final reviews", to: "/admin/reviews", icon: ShieldCheck },
      { label: "Reports", to: "/admin/reports", icon: Flag },
      { label: "People", to: "/admin/people", icon: Users },
      { label: "Audit log", to: "/admin/audit", icon: ScrollText },
      { label: "Discover", to: "/discover", icon: Compass, match: ["/homes"] },
      { label: "Messages", to: "/messages", icon: MessageCircle, count: "messages" },
    ];
    const tabs: NavItem[] = [
      { label: "Home", to: "/", icon: LayoutGrid },
      { label: "Reviews", to: "/admin/reviews", icon: ShieldCheck },
      { label: "Reports", to: "/admin/reports", icon: Flag },
      { label: "Activity", to: "/activity", icon: Bell, count: "notifications" },
      { label: "Profile", to: "/me", icon: UserRound, match: ["/settings", "/admin/people", "/admin/audit"] },
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
  const tabs: NavItem[] = [
    { label: "Home", to: "/", icon: Home },
    { label: "Discover", to: "/discover", icon: Compass, match: ["/homes", "/compare"] },
    { label: "Messages", to: "/messages", icon: MessageCircle, count: "messages" },
    { label: "Activity", to: "/activity", icon: Bell, count: "notifications" },
    {
      label: "Profile",
      to: "/me",
      icon: UserRound,
      match: ["/profile", "/settings", "/saved", "/applications", "/apply", "/inspections", "/my-home", "/tenancies", "/maintenance"],
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
