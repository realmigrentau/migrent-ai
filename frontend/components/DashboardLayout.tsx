"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import { useDashboard, UserRole } from "../hooks/useDashboard";
import { useOnboarding } from "../hooks/useOnboarding";

interface DashboardLayoutProps {
  children: ReactNode;
}

/**
 * DashboardLayout wraps all dashboard pages.
 * It provides:
 * - A sidebar with navigation links
 * - Auth protection (redirects to login if not signed in)
 * - Loading state while checking auth
 * - Mobile-friendly responsive design
 * - Blue theme for owners, rose theme for seekers
 */
export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const { signOut } = useAuth();
  const { role, displayName, isAuthenticated, loading, authLoading } =
    useDashboard();
  const { isCompleted: onboardingCompleted, isLoading: onboardingLoading } =
    useOnboarding();

  // Theme colors based on role
  const isOwner = role === "owner";
  const accentColor = isOwner ? "blue" : "rose";

  // Show loading spinner while checking auth
  if (authLoading || loading || onboardingLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className={`w-10 h-10 border-2 ${isOwner ? "border-blue-300 dark:border-blue-500/30 border-t-blue-500" : "border-rose-300 dark:border-rose-500/30 border-t-rose-500"} rounded-full animate-spin mx-auto`} />
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    if (typeof window !== "undefined") {
      router.replace("/signin?redirect=/dashboard");
    }
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-2 border-rose-300 dark:border-rose-500/30 border-t-rose-500 rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

  // Redirect to onboarding if not completed
  if (!onboardingCompleted && !onboardingLoading) {
    if (typeof window !== "undefined") {
      router.replace("/onboarding");
    }
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-2 border-rose-300 dark:border-rose-500/30 border-t-rose-500 rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Completing setup...
          </p>
        </div>
      </div>
    );
  }

  // Navigation items based on role
  const getNavItems = (currentRole: UserRole) => {
    const commonItems = [
      {
        href: "/dashboard",
        label: "Home",
        icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
      },
      {
        href: "/account/messages",
        label: "Messages",
        icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
      },
      {
        href: "/account/settings",
        label: "Settings",
        icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
      },
    ];

    if (currentRole === "seeker") {
      return [
        commonItems[0],
        {
          href: "/dashboard/seeker",
          label: "Seeker Hub",
          icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
        },
        {
          href: "/seeker/search",
          label: "Search Rooms",
          icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
        },
        {
          href: "/seeker/saved",
          label: "Saved",
          icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
        },
        {
          href: "/dashboard/seeker-profile",
          label: "My Profile",
          icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
        },
        ...commonItems.slice(1),
      ];
    }

    if (currentRole === "owner") {
      return [
        commonItems[0],
        {
          href: "/dashboard/owner",
          label: "Owner Hub",
          icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
        },
        {
          href: "/owner/listings/new",
          label: "Post a Room",
          icon: "M12 4v16m8-8H4",
        },
        {
          href: "/owner/listings",
          label: "My Listings",
          icon: "M4 6h16M4 10h16M4 14h16M4 18h16",
        },
        {
          href: "/dashboard/owner-profile",
          label: "My Profile",
          icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
        },
        ...commonItems.slice(1),
      ];
    }

    // No role set - just common items
    return commonItems;
  };

  const navItems = getNavItems(role);
  const currentPath = router.pathname;

  return (
    <div className="min-h-screen">
      {/* Mobile header */}
      <div className="lg:hidden mb-6">
        <div className="card-subtle p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${isOwner ? "from-blue-500 to-blue-600" : "from-rose-500 to-rose-600"} flex items-center justify-center text-white font-bold text-sm`}>
                {displayName?.charAt(0).toUpperCase() || "U"}
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white text-sm">
                  {displayName || "User"}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {role ? (
                    <span className="capitalize">{role}</span>
                  ) : (
                    "No role selected"
                  )}
                </p>
              </div>
            </div>
            <button
              onClick={signOut}
              className={`text-xs ${isOwner ? "text-blue-500 hover:text-blue-600 dark:hover:text-blue-400" : "text-rose-500 hover:text-rose-600 dark:hover:text-rose-400"} underline underline-offset-2`}
            >
              Sign out
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                currentPath === item.href
                  ? isOwner
                    ? "bg-blue-500 text-white"
                    : "bg-rose-500 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d={item.icon}
                />
              </svg>
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="lg:flex lg:gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="card p-6 rounded-2xl sticky top-24">
            {/* User info */}
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-200 dark:border-slate-700">
              <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${isOwner ? "from-blue-500 to-blue-600" : "from-rose-500 to-rose-600"} flex items-center justify-center text-white font-bold`}>
                {displayName?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 dark:text-white truncate">
                  {displayName || "User"}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {role ? (
                    <span className="inline-flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          role === "seeker" ? "bg-rose-500" : "bg-blue-500"
                        }`}
                      />
                      <span className="capitalize">{role}</span>
                    </span>
                  ) : (
                    "No role selected"
                  )}
                </p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = currentPath === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? isOwner
                          ? "bg-blue-500 text-white shadow-md"
                          : "bg-rose-500 text-white shadow-md"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d={item.icon}
                      />
                    </svg>
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Sign out */}
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={signOut}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 transition-all w-full"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Sign out
              </button>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
