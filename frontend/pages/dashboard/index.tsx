import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "../../components/DashboardLayout";
import { useDashboard } from "../../hooks/useDashboard";
import { useDashboardData } from "../../hooks/useDashboardData";
import HeroSection from "../../components/dashboard/HeroSection";
import MetricsCards from "../../components/dashboard/MetricsCards";
import RecentActivity from "../../components/dashboard/RecentActivity";
import OwnerView from "../../components/dashboard/OwnerView";
import SeekerView from "../../components/dashboard/SeekerView";
import ProfileCompleteness from "../../components/dashboard/ProfileCompleteness";
import CommunityHighlights from "../../components/dashboard/CommunityHighlights";
import type confettiType from "canvas-confetti";

/**
 * Main Dashboard Page (/dashboard)
 *
 * Modern SaaS dashboard with:
 * - Hero section with quick stats (loads instantly)
 * - Role toggle (Owner <> Seeker)
 * - Metrics cards with shimmer loading
 * - Recent activity feed
 * - Role-specific views (Owner: listings table, Seeker: search/recommendations)
 * - Keyboard shortcuts
 * - Confetti on first visit
 */
export default function DashboardHome() {
  const router = useRouter();
  const {
    role,
    displayName,
    isAuthenticated,
    loading: profileLoading,
    setRole,
  } = useDashboard();

  const { data, loading: dataLoading, refetch } = useDashboardData();

  const [roleChanging, setRoleChanging] = useState(false);

  // First-visit confetti (dynamic import, no delay)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const key = "migrent_dashboard_confetti_seen";
    if (!localStorage.getItem(key) && isAuthenticated && !profileLoading) {
      localStorage.setItem(key, "1");
      import("canvas-confetti").then((mod) => {
        mod.default({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.3 },
          colors: ["#6366f1", "#ec4899", "#10b981", "#f59e0b"],
        });
      });
    }
  }, [isAuthenticated, profileLoading]);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case "l":
          router.push("/owner/listings/new");
          break;
        case "s":
          router.push("/seeker/search");
          break;
        case "n":
          router.push("/messages");
          break;
        case "p":
          router.push(
            role === "owner"
              ? "/dashboard/owner-profile"
              : "/dashboard/seeker-profile"
          );
          break;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router, role]);

  const handleRoleToggle = useCallback(
    async (newRole: "seeker" | "owner") => {
      if (newRole === role || roleChanging) return;

      setRoleChanging(true);
      await setRole(newRole);
      refetch();
      setRoleChanging(false);
    },
    [role, roleChanging, setRole, refetch, router]
  );

  const handleSelectRole = async (selectedRole: "seeker" | "owner") => {
    setRoleChanging(true);
    const success = await setRole(selectedRole);
    if (!success) {
      setRoleChanging(false);
      return;
    }
    setRoleChanging(false);
    refetch();
  };

  // If no role selected, show role selection
  if (!role && !profileLoading) {
    return (
      <DashboardLayout>
        <RoleSelectionScreen
          onSelect={handleSelectRole}
          loading={roleChanging}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Hero Section - loads instantly (no data fetch) */}
        <HeroSection
          displayName={displayName}
          role={role}
          metrics={data?.metrics || null}
          profile={data?.profile || null}
          onRoleToggle={handleRoleToggle}
          roleChanging={roleChanging}
        />

        {/* Metrics Cards - with shimmer loading */}
        <MetricsCards
          metrics={data?.metrics || null}
          loading={dataLoading}
          role={role}
        />

        {/* Two-column layout: Activity + Role View */}
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Left column: Activity + Profile Completeness */}
          <div className="lg:col-span-2 space-y-6">
            <RecentActivity
              activity={data?.activity || []}
              loading={dataLoading}
            />
            <ProfileCompleteness
              profile={data?.profile || null}
              role={role}
              loading={dataLoading}
            />
            {role === "seeker" && <CommunityHighlights />}
          </div>

          {/* Role-specific view - right column */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {role === "owner" ? (
                <motion.div
                  key="owner"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <OwnerView
                    listings={data?.listings || []}
                    loading={dataLoading}
                    profile={data?.profile || null}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="seeker"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <SeekerView
                    loading={dataLoading}
                    profile={data?.profile || null}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Keyboard shortcuts hint */}
        <div className="hidden lg:flex items-center justify-center gap-4 py-4 text-xs text-slate-400 dark:text-slate-500">
          <span>Keyboard shortcuts:</span>
          {[
            { key: "L", label: "New Listing" },
            { key: "S", label: "Search" },
            { key: "N", label: "Messages" },
            { key: "P", label: "Profile" },
          ].map((shortcut) => (
            <span key={shortcut.key} className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[10px] font-semibold">
                {shortcut.key}
              </kbd>
              {shortcut.label}
            </span>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

// ── Role Selection Screen ──
function RoleSelectionScreen({
  onSelect,
  loading,
}: {
  onSelect: (role: "seeker" | "owner") => void;
  loading: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto py-8"
    >
      <div className="text-center mb-10">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white mb-2">
          How will you use MigRent?
        </h1>
        <p className="text-[15px] text-slate-600 dark:text-slate-400">
          Choose your primary role. You can switch anytime from the dashboard.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* Owner option */}
        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => onSelect("owner")}
          disabled={loading}
          className="bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 hover:border-[var(--color-line-2)] dark:hover:border-[var(--color-primary)]/40 rounded-2xl p-7 text-left transition-colors disabled:opacity-50"
        >
          <div className="w-12 h-12 rounded-xl bg-[var(--color-primary-soft)] dark:bg-[var(--color-primary)]/10 flex items-center justify-center mb-5">
            <svg
              className="w-6 h-6 text-[var(--color-primary)] dark:text-[var(--color-primary)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1.5 tracking-tight">
            I&apos;m an owner
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            List rooms, manage properties, and connect with verified tenants.
          </p>
          <div className="mt-5 flex items-center text-[var(--color-primary)] dark:text-[var(--color-primary)] font-medium text-sm">
            Get started
            <svg
              className="w-4 h-4 ml-1.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </motion.button>

        {/* Seeker option */}
        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => onSelect("seeker")}
          disabled={loading}
          className="bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 hover:border-[var(--color-line-2)] dark:hover:border-[var(--color-primary)]/40 rounded-2xl p-7 text-left transition-colors disabled:opacity-50"
        >
          <div className="w-12 h-12 rounded-xl bg-[var(--color-primary-soft)] dark:bg-[var(--color-primary)]/10 flex items-center justify-center mb-5">
            <svg
              className="w-6 h-6 text-[var(--color-primary)] dark:text-[var(--color-primary)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1.5 tracking-tight">
            I&apos;m a seeker
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Search rooms, save favorites, and get AI-powered match recommendations.
          </p>
          <div className="mt-5 flex items-center text-[var(--color-primary)] dark:text-[var(--color-primary)] font-medium text-sm">
            Get started
            <svg
              className="w-4 h-4 ml-1.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </motion.button>
      </div>

      {loading && (
        <div className="flex justify-center mt-6">
          <div className="w-6 h-6 border-2 border-[var(--color-line-2)] dark:border-[var(--color-primary-soft)] border-t-[var(--color-ink)] rounded-full animate-spin" />
        </div>
      )}
    </motion.div>
  );
}
