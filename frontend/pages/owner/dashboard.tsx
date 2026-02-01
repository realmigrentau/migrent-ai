import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../hooks/useAuth";
import SignInButton from "../../components/SignInButton";
import ListingCard from "../../components/ListingCard";
import { createListing, getListings } from "../../lib/api";
import { motion } from "framer-motion";

export default function OwnerDashboard() {
  const { session, user, loading, signOut } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  const [address, setAddress] = useState("");
  const [listPostcode, setListPostcode] = useState("");
  const [weeklyPrice, setWeeklyPrice] = useState("");
  const [description, setDescription] = useState("");
  const [formMsg, setFormMsg] = useState("");

  const [listings, setListings] = useState<any[]>([]);

  useEffect(() => {
    if (session) fetchListings();
  }, [session]);

  const fetchListings = async () => {
    if (!session) return;
    const data = await getListings(session.access_token);
    setListings(Array.isArray(data) ? data : data?.listings ?? []);
  };

  const handleRegister = async () => {
    setAuthError("");
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { type: "owner" } },
    });
    if (error) setAuthError(error.message);
  };

  const handleLogin = async () => {
    setAuthError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setAuthError(error.message);
  };

  const handleMagicLink = async () => {
    setAuthError("");
    if (!email) {
      setAuthError("Enter your email first.");
      return;
    }
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) setAuthError(error.message);
    else setAuthError("Check your email for a login link.");
  };

  const handleCreate = async () => {
    setFormMsg("");
    if (!session || !address || !listPostcode || !weeklyPrice) {
      setFormMsg("Please fill in all required fields.");
      return;
    }
    const result = await createListing(session.access_token, {
      address,
      postcode: listPostcode,
      weeklyPrice: Number(weeklyPrice),
      description,
    });
    if (result) {
      setFormMsg("Listing created.");
      setAddress("");
      setListPostcode("");
      setWeeklyPrice("");
      setDescription("");
      fetchListings();
    } else {
      setFormMsg("Failed to create listing.");
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-rose-300 dark:border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="space-y-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
          Owner <span className="gradient-text-accent">Dashboard</span>
        </h1>
      </motion.div>

      {/* Auth */}
      {!session ? (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6 rounded-2xl max-w-md"
        >
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Sign in or register</h2>
          <div className="space-y-3">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
            />
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLogin}
                className="flex-1 btn-primary py-2.5 rounded-xl text-sm"
              >
                Log in
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleRegister}
                className="flex-1 btn-secondary py-2.5 rounded-xl text-sm"
              >
                Register
              </motion.button>
            </div>
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-700" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 rounded-full">or</span>
              </div>
            </div>
            <SignInButton redirectTo={typeof window !== "undefined" ? window.location.href : undefined} />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleMagicLink}
              className="w-full btn-secondary py-2.5 rounded-xl text-sm"
            >
              Send login link to email
            </motion.button>
            {authError && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`text-sm p-3 rounded-xl ${
                  authError.includes("Check your email")
                    ? "bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                    : "bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400"
                }`}
              >
                {authError}
              </motion.p>
            )}
          </div>
        </motion.section>
      ) : (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card-subtle p-4 rounded-xl flex items-center gap-3"
        >
          <div className="pulse-dot" />
          <span className="text-sm text-slate-600 dark:text-slate-300">
            Signed in as <strong className="text-slate-900 dark:text-white">{user?.email}</strong>
          </span>
          <Link href="/account/settings" className="text-slate-500 hover:text-rose-500 text-sm transition-colors ml-auto">
            Settings
          </Link>
          <button onClick={signOut} className="text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 text-sm underline underline-offset-2 transition-colors">
            Sign out
          </button>
        </motion.section>
      )}

      {/* Quick nav cards */}
      {session && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid sm:grid-cols-3 gap-4"
        >
          {[
            { href: "/owner/listings/new", label: "Post a room", desc: "Create a new listing", icon: "M12 4v16m8-8H4" },
            { href: "/owner/listings", label: "My listings", desc: "Manage your listings", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
            { href: "/owner/profile", label: "My profile", desc: "Edit your owner profile", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
          ].map((card) => (
            <motion.a
              key={card.href}
              href={card.href}
              whileHover={{ y: -3, scale: 1.01 }}
              transition={{ duration: 0.15 }}
              className="card p-5 rounded-2xl hover:shadow-md dark:hover:shadow-2xl group cursor-pointer block"
            >
              <svg className="w-8 h-8 text-orange-500 mb-3 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={card.icon} />
              </svg>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">{card.label}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{card.desc}</p>
            </motion.a>
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
            "Completing deals on-platform helps you build a positive track record and may increase visibility.",
          ].map((text, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="flex gap-2 items-start text-sm text-slate-600 dark:text-slate-300"
            >
              <span className="text-orange-500 mt-0.5 shrink-0">&#x2713;</span>
              {text}
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Create listing */}
      {session && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Create a listing</h2>
          <div className="card p-6 rounded-2xl max-w-md space-y-4">
            <input
              type="text"
              placeholder="Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="input-field"
            />
            <input
              type="text"
              placeholder="Postcode"
              value={listPostcode}
              onChange={(e) => setListPostcode(e.target.value)}
              className="input-field"
            />
            <input
              type="number"
              placeholder="Weekly price (AUD)"
              value={weeklyPrice}
              onChange={(e) => setWeeklyPrice(e.target.value)}
              className="input-field"
            />
            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="input-field"
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCreate}
              className="btn-primary py-3 px-6 rounded-xl text-sm"
            >
              Create Listing
            </motion.button>
            {formMsg && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`text-sm p-3 rounded-xl ${
                  formMsg.includes("created")
                    ? "bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                    : "bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-600 dark:text-amber-400"
                }`}
              >
                {formMsg}
              </motion.p>
            )}
          </div>
        </motion.section>
      )}

      {/* Listings */}
      {session && listings.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Your listings</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {listings.map((l: any, i: number) => (
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
        </section>
      )}

      {/* Owner fee explanation */}
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
          <strong className="text-slate-700 dark:text-slate-300">Platform fee:</strong> MigRent charges a one-time AUD 99
          platform fee to owners when you successfully match with a tenant via
          the platform.
        </p>
        <p>
          All future rent payments are arranged directly between you and the
          tenant, outside of MigRent.
        </p>
        <p>
          You agree not to bypass MigRent in order to avoid this fee. MigRent
          may suspend accounts that attempt to circumvent fees.
        </p>
        <p>
          Using MigRent to find a tenant and then deliberately moving the
          agreement entirely off-platform to avoid the AUD 99 platform fee is a
          breach of our Rules and Terms, and may lead to suspension or removal
          of your account.
        </p>
      </motion.section>
    </div>
  );
}
