import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import DashboardLayout from "../../components/DashboardLayout";
import { useDashboard } from "../../hooks/useDashboard";
import ListingCard from "../../components/ListingCard";
import { getMatches, createVerificationSession } from "../../lib/api";

/**
 * Seeker Hub (/dashboard/seeker)
 *
 * The main seeker-specific dashboard with:
 * - Quick search functionality
 * - Recent matches
 * - Profile verification
 * - Seeker-specific tips and info
 */
export default function SeekerDashboard() {
  const router = useRouter();
  const { role, displayName, session, loading, setRole } = useDashboard();

  const [postcode, setPostcode] = useState("");
  const [matches, setMatches] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  // Set role to seeker if not already
  useEffect(() => {
    if (!loading && session && role !== "seeker") {
      // User navigated here explicitly, set their role to seeker
      setRole("seeker");
    }
  }, [loading, session, role, setRole]);

  const handleSearch = async () => {
    if (!postcode || !session) return;
    setSearching(true);
    const data = await getMatches(session.access_token, postcode);
    setMatches(Array.isArray(data) ? data : data?.matches ?? []);
    setSearching(false);
  };

  const handleVerify = async () => {
    if (!session) return;
    const data = await createVerificationSession(session.access_token, "basic");
    if (data?.url) {
      window.location.href = data.url;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            Seeker <span className="gradient-text">Hub</span>
          </h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Find your perfect room and manage your search
          </p>
        </motion.div>

        {/* Quick actions */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid sm:grid-cols-3 gap-4"
        >
          {[
            {
              href: "/seeker/search",
              label: "Search Rooms",
              desc: "Browse all listings",
              icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
            },
            {
              href: "/seeker/profile",
              label: "My Profile",
              desc: "Edit your tenant profile",
              icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
            },
            {
              href: "/seeker/saved",
              label: "Saved & Apps",
              desc: "Your saved rooms",
              icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
            },
          ].map((card) => (
            <motion.a
              key={card.href}
              href={card.href}
              whileHover={{ y: -3, scale: 1.01 }}
              transition={{ duration: 0.15 }}
              className="card p-5 rounded-2xl hover:shadow-md dark:hover:shadow-2xl group cursor-pointer block"
            >
              <svg
                className="w-8 h-8 text-rose-500 mb-3 group-hover:scale-110 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d={card.icon}
                />
              </svg>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                {card.label}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {card.desc}
              </p>
            </motion.a>
          ))}
        </motion.section>

        {/* Quick search */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
            Quick Search
          </h2>
          <div className="card p-6 rounded-2xl">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Enter postcode (e.g. 2000)"
                value={postcode}
                onChange={(e) => setPostcode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="input-field flex-1"
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSearch}
                disabled={searching || !postcode}
                className="btn-primary py-3 px-6 rounded-xl text-sm disabled:opacity-50 shrink-0"
              >
                {searching ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Searching...
                  </span>
                ) : (
                  "Find Matches"
                )}
              </motion.button>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-3">
              Enter an Australian postcode to find rooms in that area
            </p>
          </div>
        </motion.section>

        {/* Search results */}
        {matches.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Matches ({matches.length})
              </h2>
              <Link
                href="/seeker/search"
                className="text-sm text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 font-medium"
              >
                View all
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {matches.slice(0, 4).map((m: any, i: number) => {
                const l = m.listing || m;
                return (
                  <ListingCard
                    key={i}
                    address={l.address}
                    city={l.city}
                    postcode={l.postcode}
                    weeklyPrice={l.weekly_price ?? l.weeklyPrice}
                    description={l.description}
                    matchScore={m.match_score ?? m.matchScore}
                  />
                );
              })}
            </div>
          </motion.section>
        )}

        {/* Why MigRent */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
            Why use MigRent as a seeker
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
            MigRent is built for new migrants, students, and professionals. It
            reduces the noise of random classifieds and offers optional
            verification and clear rules so owners can trust you, even without
            Australian rental history.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              "Faster discovery and safer options vs random classifieds.",
              "Built for new arrivals with limited rental history.",
              "Verification and trust signals can help you stand out.",
              "Completing matches on MigRent builds a stronger profile.",
            ].map((text, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="flex gap-2 items-start text-sm text-slate-600 dark:text-slate-300"
              >
                <span className="text-rose-500 mt-0.5 shrink-0">&#x2713;</span>
                {text}
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Profile verification */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="card p-6 rounded-2xl"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center shrink-0">
              <svg
                className="w-6 h-6 text-emerald-600 dark:text-emerald-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-900 dark:text-white mb-1">
                Profile Verification
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                Verification can help owners trust you more. It is optional, but
                recommended. Complete a quick ID check via Stripe.
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleVerify}
                className="btn-primary py-2.5 px-5 rounded-xl text-sm"
              >
                Verify Profile
              </motion.button>
            </div>
          </div>
        </motion.section>

        {/* Platform fee info */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="card-subtle p-5 rounded-2xl text-sm text-slate-500 dark:text-slate-400"
        >
          <p>
            When you successfully secure a place through MigRent, a small
            one-time platform fee of AUD 19 may be offered. This fee is optional
            at this stage and will always be shown clearly before you pay.
          </p>
        </motion.section>

        {/* Disclaimers */}
        <section className="text-xs text-slate-400 dark:text-slate-500 space-y-2 pb-4">
          <p>
            Match scores and any suggestions are assistive only and do not
            constitute advice or guarantees.
          </p>
          <p>
            Seekers must inspect properties and arrange agreements directly with
            owners.
          </p>
        </section>
      </div>
    </DashboardLayout>
  );
}
