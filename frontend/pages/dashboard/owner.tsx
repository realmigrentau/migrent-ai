import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import DashboardLayout from "../../components/DashboardLayout";
import { useDashboard } from "../../hooks/useDashboard";
import ListingCard from "../../components/ListingCard";
import { getListings } from "../../lib/api";

/**
 * Owner Hub (/dashboard/owner)
 *
 * The main owner-specific dashboard with:
 * - Quick actions for posting listings
 * - Recent listings overview
 * - Owner-specific tips and info
 */
export default function OwnerDashboard() {
  const router = useRouter();
  const { role, displayName, session, user, loading } = useDashboard();

  const [listings, setListings] = useState<any[]>([]);
  const [loadingListings, setLoadingListings] = useState(true);

  // Redirect if not an owner
  useEffect(() => {
    if (!loading && role && role !== "owner") {
      router.replace("/dashboard/seeker");
    }
  }, [loading, role, router]);

  // Check if owner setup is complete
  useEffect(() => {
    if (!loading && session && user?.user_metadata?.owner_account !== true) {
      // Redirect to owner setup if not completed
      router.replace("/owner/setup");
    }
  }, [loading, session, user, router]);

  // Fetch listings
  useEffect(() => {
    async function fetchListings() {
      if (!session) return;
      setLoadingListings(true);
      const data = await getListings(session.access_token);
      setListings(Array.isArray(data) ? data : data?.listings ?? []);
      setLoadingListings(false);
    }

    if (session) {
      fetchListings();
    }
  }, [session]);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            Owner <span className="gradient-text-accent">Hub</span>
          </h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Manage your listings and connect with seekers
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
              href: "/owner/listings/new",
              label: "Post a Room",
              desc: "Create a new listing",
              icon: "M12 4v16m8-8H4",
            },
            {
              href: "/owner/listings",
              label: "My Listings",
              desc: "Manage your listings",
              icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
            },
            {
              href: "/owner/profile",
              label: "My Profile",
              desc: "Edit your owner profile",
              icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
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
                className="w-8 h-8 text-blue-500 mb-3 group-hover:scale-110 transition-transform"
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

        {/* Listings overview */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Your Listings
            </h2>
            <Link
              href="/owner/listings"
              className="text-sm text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 font-medium"
            >
              View all
            </Link>
          </div>

          {loadingListings ? (
            <div className="card p-8 rounded-2xl flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-blue-300 dark:border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
            </div>
          ) : listings.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {listings.slice(0, 4).map((l: any, i: number) => (
                <ListingCard
                  key={i}
                  address={l.address}
                  city={l.city}
                  postcode={l.postcode}
                  weeklyPrice={l.weeklyPrice ?? l.weekly_price}
                  description={l.description}
                />
              ))}
            </div>
          ) : (
            <div className="card p-8 rounded-2xl text-center">
              <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-blue-500"
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
              <h3 className="font-bold text-slate-900 dark:text-white mb-2">
                No listings yet
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                Get started by posting your first room listing
              </p>
              <Link href="/owner/listings/new">
                <motion.span
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-primary py-2.5 px-5 rounded-xl text-sm inline-block"
                >
                  Post a Room
                </motion.span>
              </Link>
            </div>
          )}
        </motion.section>

        {/* Stats (placeholder) */}
        {listings.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4"
          >
            {[
              { label: "Active Listings", value: listings.length, color: "blue" },
              { label: "Total Views", value: "—", color: "slate" },
              { label: "Messages", value: "—", color: "slate" },
              { label: "Deals", value: "—", color: "slate" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="card p-4 rounded-xl text-center"
              >
                <p
                  className={`text-2xl font-bold ${
                    stat.color === "blue"
                      ? "text-blue-500"
                      : "text-slate-400 dark:text-slate-500"
                  }`}
                >
                  {stat.value}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {stat.label}
                </p>
              </div>
            ))}
          </motion.section>
        )}

        {/* Why MigRent */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
            Why use MigRent as an owner
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
            MigRent brings more serious, better-fit enquiries through simple
            profiles and optional verification. AI-assisted matching means less
            time filtering. You only pay a one-time AUD 99 fee on successful
            matches and keep all ongoing rent.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              "Better-fit tenants faster, instead of random low-quality enquiries.",
              "One-time AUD 99 platform fee, no ongoing commission; you keep all rent.",
              "Verification and trust signals to help you assess seekers.",
              "Control over who you accept, with the option for MigRent to suspend abusive accounts.",
              "Completing deals on-platform helps you build a positive track record.",
            ].map((text, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="flex gap-2 items-start text-sm text-slate-600 dark:text-slate-300"
              >
                <span className="text-blue-500 mt-0.5 shrink-0">&#x2713;</span>
                {text}
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Platform fee explanation */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="card-subtle p-6 rounded-2xl space-y-3 text-sm text-slate-500 dark:text-slate-400"
        >
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            MigRent AI ABN: 22 669 566 941
          </div>
          <p>
            <strong className="text-slate-700 dark:text-slate-300">
              Platform fee:
            </strong>{" "}
            MigRent charges a one-time AUD 99 platform fee to owners when you
            successfully match with a tenant via the platform.
          </p>
          <p>
            All future rent payments are arranged directly between you and the
            tenant, outside of MigRent.
          </p>
          <p>
            You agree not to bypass MigRent in order to avoid this fee. MigRent
            may suspend accounts that attempt to circumvent fees.
          </p>
        </motion.section>

        {/* Disclaimers */}
        <section className="text-xs text-slate-400 dark:text-slate-500 space-y-2 pb-4">
          <p>
            Match scores and any suggestions are assistive only and do not
            constitute advice or guarantees.
          </p>
          <p>
            Owners must verify tenant information and arrange agreements
            directly with seekers.
          </p>
        </section>
      </div>
    </DashboardLayout>
  );
}
