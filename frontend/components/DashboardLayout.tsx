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
} from "lucide-react";

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
          <div className="w-10 h-10 border-2 border-indigo-300 dark:border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-500 dark:text-slate-400">
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
          <div className="w-10 h-10 border-2 border-indigo-300 dark:border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-500 dark:text-slate-400">
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
          <div className="w-10 h-10 border-2 border-indigo-300 dark:border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Completing setup...
          </p>
        </div>
      </div>
    );
  }

  // Navigation items
  const getNavItems = (currentRole: UserRole): NavItem[] => {
    const common: NavItem[] = [
      { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    ];

    if (currentRole === "owner") {
      return [
        ...common,
        { href: "/dashboard/owner", label: "Owner Hub", icon: <Building2 className="w-5 h-5" /> },
        { href: "/owner/listings/new", label: "Post Room", icon: <Plus className="w-5 h-5" /> },
        { href: "/owner/listings", label: "Listings", icon: <ListOrdered className="w-5 h-5" /> },
        { href: "/mentors", label: "Mentors", icon: <Users className="w-5 h-5" /> },
        { href: "/suburb/kellyville", label: "Suburbs", icon: <Map className="w-5 h-5" /> },
        { href: "/dashboard/owner-profile", label: "Profile", icon: <User className="w-5 h-5" /> },
        { href: "/messages", label: "Messages", icon: <MessageCircle className="w-5 h-5" /> },
        { href: "/guides", label: "Help Centre", icon: <HelpCircle className="w-5 h-5" /> },
        { href: "/account/settings", label: "Settings", icon: <Settings className="w-5 h-5" /> },
      ];
    }

    if (currentRole === "seeker") {
      return [
        ...common,
        { href: "/dashboard/seeker", label: "Seeker Hub", icon: <Search className="w-5 h-5" /> },
        { href: "/seeker/search", label: "Search", icon: <Search className="w-5 h-5" /> },
        { href: "/seeker/wishlist", label: "Saved", icon: <Heart className="w-5 h-5" /> },
        { href: "/mentors", label: "Mentors", icon: <Users className="w-5 h-5" /> },
        { href: "/suburb/kellyville", label: "Suburbs", icon: <Map className="w-5 h-5" /> },
        { href: "/dashboard/seeker-profile", label: "Profile", icon: <User className="w-5 h-5" /> },
        { href: "/messages", label: "Messages", icon: <MessageCircle className="w-5 h-5" /> },
        { href: "/guides", label: "Help Centre", icon: <HelpCircle className="w-5 h-5" /> },
        { href: "/account/settings", label: "Settings", icon: <Settings className="w-5 h-5" /> },
      ];
    }

    return [
      ...common,
      { href: "/messages", label: "Messages", icon: <MessageCircle className="w-5 h-5" /> },
      { href: "/guides", label: "Help Centre", icon: <HelpCircle className="w-5 h-5" /> },
      { href: "/account/settings", label: "Settings", icon: <Settings className="w-5 h-5" /> },
    ];
  };

  // Mobile bottom nav items (5 max)
  const getMobileNav = (currentRole: UserRole): NavItem[] => {
    if (currentRole === "owner") {
      return [
        { href: "/dashboard", label: "Home", icon: <LayoutDashboard className="w-5 h-5" /> },
        { href: "/owner/listings", label: "Listings", icon: <ListOrdered className="w-5 h-5" /> },
        { href: "/dashboard/owner-profile", label: "Profile", icon: <User className="w-5 h-5" /> },
        { href: "/messages", label: "Messages", icon: <MessageCircle className="w-5 h-5" /> },
        { href: "/guides", label: "Support", icon: <HelpCircle className="w-5 h-5" /> },
      ];
    }

    return [
      { href: "/dashboard", label: "Home", icon: <LayoutDashboard className="w-5 h-5" /> },
      { href: "/seeker/search", label: "Search", icon: <Search className="w-5 h-5" /> },
      { href: "/dashboard/seeker-profile", label: "Profile", icon: <User className="w-5 h-5" /> },
      { href: "/messages", label: "Messages", icon: <MessageCircle className="w-5 h-5" /> },
      { href: "/guides", label: "Support", icon: <HelpCircle className="w-5 h-5" /> },
    ];
  };

  const navItems = getNavItems(role);
  const mobileNavItems = getMobileNav(role);
  const currentPath = router.pathname;

  return (
    <div className="min-h-screen pb-20 lg:pb-0">
      <div className="lg:flex lg:gap-0">
        {/* Desktop sidebar */}
        <aside
          className={`hidden lg:block shrink-0 transition-all duration-300 ${
            sidebarCollapsed ? "w-[72px]" : "w-64"
          }`}
        >
          <div className="glass-card p-4 rounded-2xl sticky top-24 overflow-hidden">
            {/* User info */}
            {!sidebarCollapsed && (
              <div className="flex items-center gap-3 mb-5 pb-5 border-b border-slate-200/50 dark:border-slate-700/50">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm overflow-hidden shrink-0 ${
                    profilePhoto
                      ? ""
                      : "bg-gradient-to-br from-indigo-500 to-pink-500"
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
                  <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                    {displayName || "User"}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isOwner ? "bg-indigo-500" : "bg-pink-500"
                      }`}
                    />
                    <span className="capitalize">{role || "No role"}</span>
                  </p>
                </div>
              </div>
            )}

            {/* Collapsed: just avatar */}
            {sidebarCollapsed && (
              <div className="flex justify-center mb-4 pb-4 border-b border-slate-200/50 dark:border-slate-700/50">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-xs overflow-hidden ${
                    profilePhoto
                      ? ""
                      : "bg-gradient-to-br from-indigo-500 to-pink-500"
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

            {/* Navigation */}
            <nav className="space-y-0.5">
              {navItems.map((item) => {
                const isActive =
                  currentPath === item.href ||
                  (item.href !== "/dashboard" && currentPath.startsWith(item.href));
                return (
                  <Link key={item.href} href={item.href}>
                    <motion.div
                      whileHover={{ x: 2 }}
                      className={`flex items-center gap-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                        sidebarCollapsed
                          ? "justify-center px-2 py-2.5"
                          : "px-3 py-2.5"
                      } ${
                        isActive
                          ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                          : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      }`}
                      title={sidebarCollapsed ? item.label : undefined}
                    >
                      <span className={isActive ? "text-indigo-600 dark:text-indigo-400" : ""}>
                        {item.icon}
                      </span>
                      {!sidebarCollapsed && item.label}
                    </motion.div>
                  </Link>
                );
              })}
            </nav>

            {/* Sign out */}
            <div className="mt-4 pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
              <button
                onClick={signOut}
                className={`flex items-center gap-3 rounded-xl text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 transition-all w-full ${
                  sidebarCollapsed
                    ? "justify-center px-2 py-2.5"
                    : "px-3 py-2.5"
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
              className="mt-3 w-full flex items-center justify-center py-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
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

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 pb-safe-bottom">
        <div className="flex items-center justify-around px-2 py-2">
          {mobileNavItems.map((item) => {
            const isActive =
              currentPath === item.href ||
              (item.href !== "/dashboard" && currentPath.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} className="flex-1">
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className={`flex flex-col items-center gap-0.5 py-1 rounded-lg transition-colors ${
                    isActive
                      ? "text-indigo-600 dark:text-indigo-400"
                      : "text-slate-400 dark:text-slate-500"
                  }`}
                >
                  {item.icon}
                  <span className="text-[10px] font-medium">{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="mobile-nav-indicator"
                      className="w-1 h-1 rounded-full bg-indigo-500"
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
