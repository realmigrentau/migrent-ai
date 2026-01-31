import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../hooks/useAuth";
import SignInButton from "../../components/SignInButton";
import ListingCard from "../../components/ListingCard";
import { getMatches, createVerificationSession } from "../../lib/api";
import { motion } from "framer-motion";

export default function SeekerDashboard() {
  const { session, user, loading, signOut } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  const [postcode, setPostcode] = useState("");
  const [matches, setMatches] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  const handleRegister = async () => {
    setAuthError("");
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { type: "seeker" } },
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
          Seeker <span className="gradient-text">Dashboard</span>
        </h1>
      </motion.div>

      {/* Auth section */}
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
          <button onClick={signOut} className="text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 text-sm underline underline-offset-2 ml-auto transition-colors">
            Sign out
          </button>
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
            "Completing matches on MigRent builds a stronger profile and trust signal.",
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

      {/* Match search */}
      {session && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Find matches</h2>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md">
            <input
              type="text"
              placeholder="Postcode (e.g. 2000)"
              value={postcode}
              onChange={(e) => setPostcode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="input-field flex-1"
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSearch}
              disabled={searching}
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
          {matches.length > 0 && (
            <div className="grid sm:grid-cols-2 gap-4 mt-6">
              {matches.map((m: any, i: number) => (
                <ListingCard
                  key={i}
                  address={m.address}
                  city={m.city}
                  postcode={m.postcode}
                  weeklyPrice={m.weeklyPrice ?? m.weekly_price}
                  description={m.description}
                  matchScore={m.matchScore ?? m.match_score}
                />
              ))}
            </div>
          )}
        </motion.section>
      )}

      {/* Verification */}
      {session && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Profile verification</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Verification can help owners trust you more. It is optional, but
            recommended.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleVerify}
            className="btn-primary py-3 px-6 rounded-xl text-sm font-bold"
          >
            Verify Profile (via Stripe)
          </motion.button>
        </motion.section>
      )}

      {/* Optional seeker fee */}
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
        <p>
          Any verification badges, match scores, and future protection features
          apply only to deals confirmed and recorded on MigRent; if you choose
          to arrange everything completely off-platform, you will not receive
          these benefits.
        </p>
      </section>
    </div>
  );
}
