import { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import { useDashboard, UserRole } from "../hooks/useDashboard";
import { useOnboarding } from "../hooks/useOnboarding";
import {
  LayoutDashboard,
  Search,
  Building2,
  Heart,
  User,
  MessageCircle,
  Settings,
  LogOut,
  Plus,
  ListOrdered,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Users,
  Map,
  Bell,
} from "lucide-react";
import NotificationBell from "./notifications/NotificationBell";
import { useNotificationCenter } from "../hooks/useNotificationCenter";

interface DashboardLayoutProps {
  children: ReactNode;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const { signOut } = useAuth();
  const { role, displayName, profilePhoto, isAuthenticated, loading, authLoading } =
    useDashboard();
  const { isCompleted: onboardingCompleted, isLoading: onboardingLoading } =
    useOnboarding();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { unreadCount } = useNotificationCenter();

  const isOwner = role === "owner";

  // All useEffect hooks MUST be before any early returns (React Rules of Hooks)
  useEffect(() => {
    if (!authLoading && !loading && !isAuthenticated) {
      router.replace("/signin?redirect=/dashboard");
    }
  }, [authLoading, loading, isAuthenticated, router]);

  useEffect(() => {
    if (!onboardingLoading && !onboardingCompleted && isAuthenticated) {
      router.replace("/onboarding");
    }
  }, [onboardingLoading, onboardingCompleted, isAuthenticated, router]);

  // Loading state
  if (authLoading || loading || onboardingLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-2 border-[var(--color-line-2)] border-t-[var(--color-ink)] rounded-full animate-spin mx-auto" />
          <p className="text-sm text-[var(--color-ink-3)]">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-2 border-[var(--color-line-2)] border-t-[var(--color-ink)] rounded-full animate-spin mx-auto" />
          <p className="text-sm text-[var(--color-ink-3)]">
            Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

  if (!onboardingCompleted && !onboardingLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-2 border-[var(--color-line-2)] border-t-[var(--color-ink)] rounded-full animate-spin mx-auto" />
          <p className="text-sm text-[var(--color-ink-3)]">
            Completing setup...
          </p>
        </div>
      </div>
    );
  }

  // Navigation groups (Renting / Communicate / Account)
  type NavGroup = { title: string; items: NavItem[] };

  const getNavGroups = (currentRole: UserRole): NavGroup[] => {
    if (currentRole === "owner") {
      return [
        {
          title: "Hosting",
          items: [
            { href: "/dashboard", label: "Overview", icon: <LayoutDashboard className="w-[18px] h-[18px]" /> },
            { href: "/dashboard/owner", label: "Owner Hub", icon: <Building2 className="w-[18px] h-[18px]" /> },
            { href: "/owner/listings", label: "Listings", icon: <ListOrdered className="w-[18px] h-[18px]" /> },
            { href: "/owner/listings/new", label: "Post a room", icon: <Plus className="w-[18px] h-[18px]" /> },
          ],
        },
        {
          title: "Communicate",
          items: [
            { href: "/messages", label: "Messages", icon: <MessageCircle className="w-[18px] h-[18px]" /> },
            { href: "/mentors", label: "Mentors", icon: <Users className="w-[18px] h-[18px]" /> },
          ],
        },
        {
          title: "Account",
          items: [
            { href: "/dashboard/owner-profile", label: "Profile", icon: <User className="w-[18px] h-[18px]" /> },
            { href: "/help", label: "Help Centre", icon: <HelpCircle className="w-[18px] h-[18px]" /> },
            { href: "/account/settings", label: "Settings", icon: <Settings className="w-[18px] h-[18px]" /> },
          ],
        },
      ];
    }

    if (currentRole === "seeker") {
      return [
        {
          title: "Renting",
          items: [
            { href: "/dashboard", label: "Overview", icon: <LayoutDashboard className="w-[18px] h-[18px]" /> },
            { href: "/seeker/search", label: "Search", icon: <Search className="w-[18px] h-[18px]" /> },
            { href: "/seeker/wishlist", label: "Saved listings", icon: <Heart className="w-[18px] h-[18px]" /> },
            { href: "/suburb/kellyville", label: "Suburbs", icon: <Map className="w-[18px] h-[18px]" /> },
          ],
        },
        {
          title: "Communicate",
          items: [
            { href: "/messages", label: "Messages", icon: <MessageCircle className="w-[18px] h-[18px]" /> },
            { href: "/mentors", label: "Mentors", icon: <Users className="w-[18px] h-[18px]" /> },
          ],
        },
        {
          title: "Account",
          items: [
            { href: "/dashboard/seeker-profile", label: "Profile", icon: <User className="w-[18px] h-[18px]" /> },
            { href: "/help", label: "Help Centre", icon: <HelpCircle className="w-[18px] h-[18px]" /> },
            { href: "/account/settings", label: "Settings", icon: <Settings className="w-[18px] h-[18px]" /> },
          ],
        },
      ];
    }

    return [
      {
        title: "Account",
        items: [
          { href: "/dashboard", label: "Overview", icon: <LayoutDashboard className="w-[18px] h-[18px]" /> },
          { href: "/messages", label: "Messages", icon: <MessageCircle className="w-[18px] h-[18px]" /> },
          { href: "/help", label: "Help Centre", icon: <HelpCircle className="w-[18px] h-[18px]" /> },
          { href: "/account/settings", label: "Settings", icon: <Settings className="w-[18px] h-[18px]" /> },
        ],
      },
    ];
  };

  // Flattened for legacy code paths if needed
  const getNavItems = (currentRole: UserRole): NavItem[] =>
    getNavGroups(currentRole).flatMap((g) => g.items);

  // Mobile bottom nav items (5 max)
  const getMobileNav = (currentRole: UserRole): NavItem[] => {
    if (currentRole === "owner") {
      return [
        { href: "/dashboard", label: "Home", icon: <LayoutDashboard className="w-5 h-5" /> },
        { href: "/owner/listings", label: "Listings", icon: <ListOrdered className="w-5 h-5" /> },
        { href: "/dashboard/owner-profile", label: "Profile", icon: <User className="w-5 h-5" /> },
        { href: "/messages", label: "Messages", icon: <MessageCircle className="w-5 h-5" /> },
        { href: "/help", label: "Support", icon: <HelpCircle className="w-5 h-5" /> },
      ];
    }

    return [
      { href: "/dashboard", label: "Home", icon: <LayoutDashboard className="w-5 h-5" /> },
      { href: "/seeker/search", label: "Search", icon: <Search className="w-5 h-5" /> },
      { href: "/dashboard/seeker-profile", label: "Profile", icon: <User className="w-5 h-5" /> },
      { href: "/messages", label: "Messages", icon: <MessageCircle className="w-5 h-5" /> },
      { href: "/help", label: "Support", icon: <HelpCircle className="w-5 h-5" /> },
    ];
  };

  const navGroups = getNavGroups(role);
  const navItems = getNavItems(role);
  const mobileNavItems = getMobileNav(role);
  const currentPath = router.pathname;

  void navItems; // keep the helper exported for any future consumers

  return (
    <div className="min-h-screen pb-20 lg:pb-0">
      <div className="lg:flex lg:gap-0">
        {/* Desktop sidebar */}
        <aside
          className={`hidden lg:block shrink-0 transition-all duration-300 ${
            sidebarCollapsed ? "w-[72px]" : "w-64"
          }`}
        >
          <div className="bg-[var(--color-surface)] border border-[var(--color-line)] p-4 rounded-[14px] sticky top-24 overflow-hidden">
            {/* User info */}
            {!sidebarCollapsed && (
              <div className="flex items-center gap-3 mb-5 pb-5 border-b border-[var(--color-line)]">
                <div
                  className={`w-10 h-10 rounded-[10px] flex items-center justify-center text-[var(--color-primary-fg)] font-semibold text-sm overflow-hidden shrink-0 ${
                    profilePhoto
                      ? ""
                      : isOwner ? "bg-[var(--color-accent)]" : "bg-[var(--color-primary)]"
                  }`}
                >
                  {profilePhoto ? (
                    <img
                      src={profilePhoto}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    displayName?.charAt(0).toUpperCase() || "U"
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[var(--color-ink)] text-sm truncate">
                    {displayName || "User"}
                  </p>
                  <p className="text-xs text-[var(--color-ink-3)] flex items-center gap-1.5">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isOwner ? "bg-[var(--color-accent)]" : "bg-[var(--color-primary)]"
                      }`}
                    />
                    <span className="capitalize">{role || "No role"}</span>
                  </p>
                </div>
              </div>
            )}

            {/* Collapsed: just avatar */}
            {sidebarCollapsed && (
              <div className="flex justify-center mb-4 pb-4 border-b border-[var(--color-line)]">
                <div
                  className={`w-9 h-9 rounded-[10px] flex items-center justify-center text-[var(--color-primary-fg)] font-semibold text-xs overflow-hidden ${
                    profilePhoto
                      ? ""
                      : isOwner ? "bg-[var(--color-accent)]" : "bg-[var(--color-primary)]"
                  }`}
                >
                  {profilePhoto ? (
                    <img
                      src={profilePhoto}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    displayName?.charAt(0).toUpperCase() || "U"
                  )}
                </div>
              </div>
            )}

            {/* Navigation - grouped */}
            <nav className="flex flex-col gap-4">
              {navGroups.map((group) => (
                <div key={group.title}>
                  {!sidebarCollapsed && (
                    <div className="eyebrow px-3 mb-1.5">{group.title}</div>
                  )}
                  <div className="flex flex-col gap-0.5">
                    {group.items.map((item) => {
                      const isActive =
                        currentPath === item.href ||
                        (item.href !== "/dashboard" && currentPath.startsWith(item.href));
                      return (
                        <Link key={item.href} href={item.href}>
                          <motion.div
                            whileHover={{ x: 1 }}
                            className={`flex items-center gap-2.5 rounded-[8px] text-[13.5px] transition-colors cursor-pointer ${
                              sidebarCollapsed
                                ? "justify-center px-2 py-2"
                                : "px-3 py-[7px]"
                            } ${
                              isActive
                                ? "bg-[var(--color-surface-sunk)] text-[var(--color-ink)] font-semibold"
                                : "text-[var(--color-ink-2)] font-medium hover:bg-[var(--color-surface-sunk)] hover:text-[var(--color-ink)]"
                            }`}
                            title={sidebarCollapsed ? item.label : undefined}
                          >
                            <span className={isActive ? "text-[var(--color-ink)]" : "text-[var(--color-ink-3)]"}>
                              {item.icon}
                            </span>
                            {!sidebarCollapsed && item.label}
                          </motion.div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>

            {/* Notification bell */}
            <div className="mt-3 pt-3 border-t border-[var(--color-line)]">
              <NotificationBell unreadCount={unreadCount} collapsed={sidebarCollapsed} />
            </div>

            {/* Sign out */}
            <div className="mt-2 pt-2 border-t border-[var(--color-line)]">
              <button
                onClick={signOut}
                className={`flex items-center gap-3 rounded-[8px] text-[13.5px] font-medium text-[var(--color-ink-3)] hover:bg-[#f1d8d4] dark:hover:bg-[#2b1614] hover:text-[var(--color-danger-500)] transition-colors w-full ${
                  sidebarCollapsed
                    ? "justify-center px-2 py-2.5"
                    : "px-3 py-2"
                }`}
                title={sidebarCollapsed ? "Sign out" : undefined}
              >
                <LogOut className="w-5 h-5" />
                {!sidebarCollapsed && "Sign out"}
              </button>
            </div>

            {/* Collapse toggle */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="mt-3 w-full flex items-center justify-center py-1.5 text-[var(--color-ink-4)] hover:text-[var(--color-ink-2)] transition-colors"
            >
              {sidebarCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 lg:pl-6">
          {children}
        </main>
      </div>

      {/* Mobile notification bell - floating */}
      <div className="lg:hidden fixed top-4 right-4 z-50">
        <NotificationBell unreadCount={unreadCount} collapsed={true} />
      </div>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[var(--color-surface-2)]/97 backdrop-blur-xl border-t border-[var(--color-line)] pb-safe-bottom">
        <div className="flex items-center justify-around px-2 py-2">
          {mobileNavItems.map((item) => {
            const isActive =
              currentPath === item.href ||
              (item.href !== "/dashboard" && currentPath.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} className="flex-1">
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className={`flex flex-col items-center gap-0.5 py-1 rounded-[6px] transition-colors ${
                    isActive
                      ? "text-[var(--color-ink)]"
                      : "text-[var(--color-ink-3)]"
                  }`}
                >
                  {item.icon}
                  <span className="text-[10px] font-semibold">{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="mobile-nav-indicator"
                      className="w-1 h-1 rounded-full bg-[var(--color-ink)]"
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
