import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import DashboardLayout from "../../components/DashboardLayout";
import { useDashboard } from "../../hooks/useDashboard";

/**
 * Main Dashboard Page (/dashboard)
 *
 * This is the central hub for all logged-in users.
 * - If the user hasn't chosen a role yet, show the role selection screen
 * - If they have a role, show role-specific shortcuts and quick links
 */
export default function DashboardHome() {
  const router = useRouter();
  const {
    role,
    displayName,
    isAuthenticated,
    loading,
    setRole,
    goToRoleDashboard,
  } = useDashboard();

  const [settingRole, setSettingRole] = useState(false);
  const [error, setError] = useState("");

  // Don't auto-redirect - let users stay on the main dashboard
  // They can click through to seeker/owner hubs if they want

  const handleSelectRole = async (selectedRole: "seeker" | "owner") => {
    setSettingRole(true);
    setError("");

    const success = await setRole(selectedRole);
    if (!success) {
      setError("Failed to save your choice. Please try again.");
      setSettingRole(false);
      return;
    }

    // Redirect to the appropriate profile page
    if (selectedRole === "seeker") {
      router.push("/dashboard/seeker-profile");
    } else {
      router.push("/dashboard/owner-profile");
    }
  };

  // Quick links for seekers
  const seekerQuickLinks = [
    {
      href: "/seeker/search",
      label: "Search Rooms",
      desc: "Find your perfect room",
      icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
      color: "rose",
    },
    {
      href: "/dashboard/seeker-profile",
      label: "Edit Profile",
      desc: "Update your tenant profile",
      icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
      color: "rose",
    },
    {
      href: "/seeker/saved",
      label: "Saved Rooms",
      desc: "View your saved listings",
      icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
      color: "rose",
    },
    {
      href: "/seeker/wishlist",
      label: "Wishlist",
      desc: "Rooms you want to visit",
      icon: "M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z",
      color: "rose",
    },
    {
      href: "/account/messages",
      label: "Messages",
      desc: "Chat with owners",
      icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
      color: "slate",
    },
    {
      href: "/account/settings",
      label: "Settings",
      desc: "Account & preferences",
      icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
      color: "slate",
    },
  ];

  // Quick links for owners
  const ownerQuickLinks = [
    {
      href: "/owner/listings/new",
      label: "Post a Room",
      desc: "Create a new listing",
      icon: "M12 4v16m8-8H4",
      color: "blue",
    },
    {
      href: "/owner/listings",
      label: "My Listings",
      desc: "Manage your properties",
      icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
      color: "blue",
    },
    {
      href: "/dashboard/owner-profile",
      label: "Edit Profile",
      desc: "Update your owner profile",
      icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
      color: "blue",
    },
    {
      href: "/account/messages",
      label: "Messages",
      desc: "Chat with seekers",
      icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
      color: "slate",
    },
    {
      href: "/account/settings",
      label: "Settings",
      desc: "Account & preferences",
      icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
      color: "slate",
    },
  ];

  const quickLinks = role === "seeker" ? seekerQuickLinks : ownerQuickLinks;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            {role ? (
              <>
                Welcome back,{" "}
                <span className="gradient-text">{displayName || "there"}</span>
              </>
            ) : (
              <>
                Welcome to{" "}
                <span className="gradient-text">MigRent</span>
              </>
            )}
          </h1>
          {role && (
            <p className="mt-2 text-slate-500 dark:text-slate-400">
              You&apos;re signed in as a{" "}
              <span
                className={`font-semibold ${
                  role === "seeker"
                    ? "text-rose-500"
                    : "text-blue-500"
                }`}
              >
                {role}
              </span>
              .{" "}
              <Link
                href="/dashboard"
                onClick={(e) => {
                  e.preventDefault();
                  // Reset role selection by showing the choice again
                  // This is handled by setting role to null temporarily
                }}
                className="underline underline-offset-2 hover:text-rose-500 transition-colors"
              >
                Switch role
              </Link>
            </p>
          )}
        </motion.div>

        {/* Role selection (if no role set) */}
        {!role && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            <div className="text-center max-w-xl mx-auto">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                How would you like to use MigRent?
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Choose the option that best describes you. You can always access
                features from both sides later.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {/* Seeker option */}
              <motion.button
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelectRole("seeker")}
                disabled={settingRole}
                className="card p-8 rounded-2xl text-left hover:shadow-xl dark:hover:shadow-2xl transition-all group disabled:opacity-50 border-2 border-transparent hover:border-rose-500/50"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <svg
                    className="w-8 h-8 text-white"
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
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  I am a seeker
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  I&apos;m looking for a room to rent. I want to search listings,
                  save favorites, and connect with owners.
                </p>
                <div className="mt-6 flex items-center text-rose-500 font-semibold text-sm">
                  Get started
                  <svg
                    className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </motion.button>

              {/* Owner option */}
              <motion.button
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelectRole("owner")}
                disabled={settingRole}
                className="card p-8 rounded-2xl text-left hover:shadow-xl dark:hover:shadow-2xl transition-all group disabled:opacity-50 border-2 border-transparent hover:border-blue-500/50"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <svg
                    className="w-8 h-8 text-white"
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
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  I want to be an owner
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  I have a room to rent out. I want to list my property and
                  connect with potential tenants.
                </p>
                <div className="mt-6 flex items-center text-blue-500 font-semibold text-sm">
                  Get started
                  <svg
                    className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </motion.button>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-sm text-red-500 dark:text-red-400"
              >
                {error}
              </motion.p>
            )}

            {settingRole && (
              <div className="flex justify-center">
                <div className="w-6 h-6 border-2 border-rose-300 dark:border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
              </div>
            )}
          </motion.section>
        )}

        {/* Quick links (if role is set) */}
        {role && (
          <>
            {/* Primary action card */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Link
                href={role === "seeker" ? "/dashboard/seeker" : "/dashboard/owner"}
                className="block"
              >
                <motion.div
                  whileHover={{ y: -4 }}
                  className={`card p-6 rounded-2xl bg-gradient-to-br ${
                    role === "seeker"
                      ? "from-rose-500 to-rose-600"
                      : "from-blue-500 to-blue-600"
                  } text-white hover:shadow-xl transition-all`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold mb-1">
                        {role === "seeker" ? "Seeker Hub" : "Owner Hub"}
                      </h2>
                      <p className="text-white/80 text-sm">
                        {role === "seeker"
                          ? "Find your perfect room and manage your search"
                          : "Manage your listings and connect with seekers"}
                      </p>
                    </div>
                    <svg
                      className="w-8 h-8 opacity-80"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </motion.div>
              </Link>
            </motion.section>

            {/* Quick links grid */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                Quick Links
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {quickLinks.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                  >
                    <Link href={link.href}>
                      <motion.div
                        whileHover={{ y: -3, scale: 1.02 }}
                        className="card p-5 rounded-2xl hover:shadow-md dark:hover:shadow-xl transition-all group h-full"
                      >
                        <svg
                          className={`w-8 h-8 mb-3 ${
                            link.color === "rose"
                              ? "text-rose-500"
                              : link.color === "blue"
                              ? "text-blue-500"
                              : "text-slate-500 dark:text-slate-400"
                          } group-hover:scale-110 transition-transform`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d={link.icon}
                          />
                        </svg>
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                          {link.label}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {link.desc}
                        </p>
                      </motion.div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.section>

            {/* Getting started checklist */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                Getting Started
              </h2>
              <div className="card p-6 rounded-2xl">
                <div className="space-y-4">
                  {(role === "seeker"
                    ? [
                        {
                          label: "Complete your profile",
                          href: "/dashboard/seeker-profile",
                          done: false,
                        },
                        {
                          label: "Search for rooms",
                          href: "/seeker/search",
                          done: false,
                        },
                        {
                          label: "Save rooms you like",
                          href: "/seeker/saved",
                          done: false,
                        },
                        {
                          label: "Message owners",
                          href: "/account/messages",
                          done: false,
                        },
                      ]
                    : [
                        {
                          label: "Complete your profile",
                          href: "/dashboard/owner-profile",
                          done: false,
                        },
                        {
                          label: "Post your first listing",
                          href: "/owner/listings/new",
                          done: false,
                        },
                        {
                          label: "Respond to enquiries",
                          href: "/account/messages",
                          done: false,
                        },
                      ]
                  ).map((item, i) => (
                    <Link
                      key={i}
                      href={item.href}
                      className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          item.done
                            ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                            : "bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500"
                        }`}
                      >
                        {item.done ? (
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        ) : (
                          <span className="text-sm font-medium">{i + 1}</span>
                        )}
                      </div>
                      <span
                        className={`text-sm font-medium ${
                          item.done
                            ? "text-slate-400 dark:text-slate-500 line-through"
                            : "text-slate-700 dark:text-slate-200 group-hover:text-rose-500 dark:group-hover:text-rose-400"
                        }`}
                      >
                        {item.label}
                      </span>
                      <svg
                        className="w-4 h-4 ml-auto text-slate-300 dark:text-slate-600 group-hover:text-rose-500 dark:group-hover:text-rose-400 transition-colors"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Link>
                  ))}
                </div>
              </div>
            </motion.section>

            {/* Support section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="card-subtle p-6 rounded-2xl"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                  <svg
                    className="w-5 h-5 text-slate-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
                    Need help?
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                    Check out our FAQ or contact support if you have questions.
                  </p>
                  <div className="flex gap-2">
                    <Link
                      href="/faq"
                      className="text-xs font-medium text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 underline underline-offset-2"
                    >
                      View FAQ
                    </Link>
                    <span className="text-slate-300 dark:text-slate-600">|</span>
                    <Link
                      href="/contact"
                      className="text-xs font-medium text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 underline underline-offset-2"
                    >
                      Contact Support
                    </Link>
                  </div>
                </div>
              </div>
            </motion.section>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
