import { Suspense, lazy } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useSettingsData } from "../../hooks/useSettingsData";
import type { SettingsTab } from "../../hooks/useSettingsData";

// Components
import HeroStatus from "../../components/settings/HeroStatus";
import SidebarNav from "../../components/settings/SidebarNav";
import AccountSecurityTab from "../../components/settings/AccountSecurityTab";
import VerificationTab from "../../components/settings/VerificationTab";
import ProfileTab from "../../components/settings/ProfileTab";
import NotificationsTab from "../../components/settings/NotificationsTab";
import PaymentsTab from "../../components/settings/PaymentsTab";
import AnalyticsTab from "../../components/settings/AnalyticsTab";
import PreferencesTab from "../../components/settings/PreferencesTab";
import SupportTab from "../../components/settings/SupportTab";

// ─── Shimmer Skeleton ────────────────────────────────────────────
function SettingsSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Hero skeleton */}
      <div className="shimmer h-56 rounded-3xl" />
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Sidebar skeleton */}
        <div className="hidden lg:block lg:col-span-1">
          <div className="space-y-2">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="shimmer h-10 rounded-xl" />
            ))}
          </div>
        </div>
        {/* Content skeleton */}
        <div className="lg:col-span-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="shimmer h-32 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Message Toast ──────────────────────────────────────────────
function MessageToast({ text, type }: { text: string; type: "success" | "error" | "info" }) {
  if (!text) return null;

  const styles = {
    success:
      "bg-[var(--color-accent-soft)] text-[var(--color-accent)] border-transparent",
    error:
      "bg-[#f1d8d4] dark:bg-[#2b1614] text-[var(--color-danger-500)] border-transparent",
    info: "bg-[var(--color-primary-soft)] text-[var(--color-info-500)] border-transparent",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] max-w-md w-full mx-4"
    >
      <div
        className={`
          flex items-center gap-2 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-xl text-sm font-medium
          ${styles[type]}
        `}
      >
        {type === "success" && "✅"}
        {type === "error" && "❌"}
        {type === "info" && "ℹ️"}
        {text}
      </div>
    </motion.div>
  );
}

// ─── Tab Content Wrapper ─────────────────────────────────────────
function TabContent({ tabId, children }: { tabId: string; children: React.ReactNode }) {
  return (
    <motion.div
      key={tabId}
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {children}
    </motion.div>
  );
}

// ─── Main Settings Page ──────────────────────────────────────────
export default function SettingsPage() {
  const {
    // Auth
    session,
    user,
    authLoading,
    signOut,
    // Theme
    theme,
    setTheme,
    toggleTheme,
    // Profile
    profile,
    loadingProfile,
    saving,
    message,
    fetchProfile,
    updateProfile,
    uploadPhoto,
    // Tab
    activeTab,
    setActiveTab,
    // Computed
    verificationProgress,
    isOwner,
    displayName,
    // Security
    changePassword,
    setNewPassword,
    deleteAccount,
    googleConnected,
    isGoogleOnlyUser,
    hasPassword,
    sessions,
    // Notifications
    notifPrefs,
    updateNotifPrefs,
    // Tickets
    tickets,
    ticketsLoading,
    fetchTickets,
    // Verification
    startIdVerification,
    // Show message
    showMessage,
  } = useSettingsData();

  // ─── Loading state ──────────────────────────────────────────
  if (authLoading) {
    return <SettingsSkeleton />;
  }

  // ─── Not signed in ─────────────────────────────────────────
  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--color-surface)] border border-[var(--color-line)] rounded-[14px] p-8 text-center max-w-md mx-4"
        >
          <div className="w-16 h-16 rounded-[14px] bg-[var(--color-surface-sunk)] flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🔒</span>
          </div>
          <h2 className="text-xl font-semibold tracking-tight text-[var(--color-ink)] mb-2">Sign in required</h2>
          <p className="text-sm text-[var(--color-ink-3)] mb-6">
            Sign in to access your account settings and personalise your experience.
          </p>
          <Link
            href="/signin"
            className="btn-primary py-3 px-8 rounded-xl text-sm inline-block"
          >
            Sign in to continue
          </Link>
        </motion.div>
      </div>
    );
  }

  // ─── Profile loading ──────────────────────────────────────
  if (loadingProfile) {
    return <SettingsSkeleton />;
  }

  // Count open tickets for badge
  const openTicketCount = tickets.filter(
    (t) => t.status === "open" || t.status === "new" || t.status === "pending"
  ).length;

  // ─── Tab renderer ──────────────────────────────────────────
  const renderTab = () => {
    switch (activeTab) {
      case "account":
        return (
          <TabContent tabId="account">
            <AccountSecurityTab
              user={user}
              profile={profile}
              googleConnected={googleConnected}
              isGoogleOnlyUser={isGoogleOnlyUser}
              hasPassword={hasPassword}
              sessions={sessions}
              saving={saving}
              changePassword={changePassword}
              setNewPassword={setNewPassword}
              deleteAccount={deleteAccount}
              signOut={signOut}
              showMessage={showMessage}
            />
          </TabContent>
        );
      case "verification":
        return (
          <TabContent tabId="verification">
            <VerificationTab
              profile={profile}
              verificationProgress={verificationProgress}
              saving={saving}
              startIdVerification={startIdVerification}
              showMessage={showMessage}
            />
          </TabContent>
        );
      case "profile":
        return (
          <TabContent tabId="profile">
            <ProfileTab
              profile={profile}
              saving={saving}
              updateProfile={updateProfile}
              uploadPhoto={uploadPhoto}
              showMessage={showMessage}
            />
          </TabContent>
        );
      case "notifications":
        return (
          <TabContent tabId="notifications">
            <NotificationsTab
              notifPrefs={notifPrefs}
              updateNotifPrefs={updateNotifPrefs}
              showMessage={showMessage}
            />
          </TabContent>
        );
      case "payments":
        return (
          <TabContent tabId="payments">
            <PaymentsTab
              profile={profile}
              isOwner={isOwner}
              showMessage={showMessage}
            />
          </TabContent>
        );
      case "analytics":
        return (
          <TabContent tabId="analytics">
            <AnalyticsTab profile={profile} />
          </TabContent>
        );
      case "preferences":
        return (
          <TabContent tabId="preferences">
            <PreferencesTab
              theme={theme}
              setTheme={setTheme}
              toggleTheme={toggleTheme}
              profile={profile}
              saving={saving}
              updateProfile={updateProfile}
              showMessage={showMessage}
            />
          </TabContent>
        );
      case "support":
        return (
          <TabContent tabId="support">
            <SupportTab
              tickets={tickets}
              ticketsLoading={ticketsLoading}
              session={session}
              fetchTickets={fetchTickets}
              showMessage={showMessage}
            />
          </TabContent>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-8 space-y-6 pb-20">
      {/* Message Toast */}
      <AnimatePresence>
        {message.text && <MessageToast text={message.text} type={message.type} />}
      </AnimatePresence>

      {/* Hero Section */}
      <HeroStatus
        displayName={displayName}
        profile={profile}
        verificationProgress={verificationProgress}
        isOwner={isOwner}
        setActiveTab={setActiveTab}
      />

      {/* Main Layout: Sidebar + Content */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Sidebar Navigation */}
        <SidebarNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isOwner={isOwner}
          ticketCount={openTicketCount}
        />

        {/* Tab Content */}
        <div className="lg:col-span-4">
          <AnimatePresence mode="wait">{renderTab()}</AnimatePresence>
        </div>
      </div>

      {/* Sign out link */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center pt-4 pb-8"
      >
        <button
          onClick={signOut}
          className="text-sm text-[var(--color-danger-500)] hover:opacity-80 underline underline-offset-4 transition-colors"
        >
          Sign out of MigRent
        </button>
      </motion.div>
    </div>
  );
}
