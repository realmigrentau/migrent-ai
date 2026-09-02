import { useState, useEffect } from "react";
import SEOHead from "../components/SEOHead";
import { useRouter } from "next/router";
import Head from "next/head";
import { motion } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../components/ui/Toast";
import {
  Heart,
  MapPin,
  Globe,
  DollarSign,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Users,
  Star,
  Shield,
} from "lucide-react";

import { API_BASE_URL as BASE_URL } from "../lib/apiBase";
const SPECIALTIES = [
  "Suburb orientation",
  "Public transport",
  "Shopping & groceries",
  "Healthcare & Medicare",
  "Banking setup",
  "School enrollment",
  "Local community groups",
  "Restaurant & food spots",
  "Safety tips",
  "Cultural guidance",
];

const LANGUAGES = [
  "English", "Mandarin", "Hindi", "Arabic", "Korean",
  "Vietnamese", "Tagalog", "Spanish", "Japanese", "Cantonese",
  "Tamil", "Urdu", "Thai", "Indonesian", "Nepali",
];

export default function BecomeMentorPage() {
  const router = useRouter();
  const { session } = useAuth();
  const toast = useToast();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [existingMentor, setExistingMentor] = useState<any>(null);
  const [checkingExisting, setCheckingExisting] = useState(true);
  const [success, setSuccess] = useState(false);

  // Form state
  const [suburb, setSuburb] = useState("");
  const [postcode, setPostcode] = useState("");
  const [languages, setLanguages] = useState<string[]>(["English"]);
  const [bio, setBio] = useState("");
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [hourlyRate, setHourlyRate] = useState(25); // dollars

  // Check if already a mentor
  useEffect(() => {
    if (!session?.access_token) {
      setCheckingExisting(false);
      return;
    }

    fetch(`${BASE_URL}/mentors/me/profile`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.mentor) setExistingMentor(data.mentor);
      })
      .catch(() => {})
      .finally(() => setCheckingExisting(false));
  }, [session]);

  // Handle Stripe return
  useEffect(() => {
    if (router.query.stripe === "complete") {
      setSuccess(true);
    }
  }, [router.query]);

  const toggleLanguage = (lang: string) => {
    setLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  };

  const toggleSpecialty = (spec: string) => {
    setSpecialties((prev) =>
      prev.includes(spec) ? prev.filter((s) => s !== spec) : [...prev, spec]
    );
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!session?.access_token) {
      router.push("/signin?redirect=/become-mentor");
      return;
    }
    if (!suburb.trim()) {
      setStep(1);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/mentors`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          suburb,
          postcode: postcode ? parseInt(postcode) : null,
          languages,
          bio,
          specialties,
          hourly_rate: hourlyRate * 100, // convert to cents
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.detail || "We couldn't create your mentor profile. Please try again.");
        return;
      }

      setSuccess(true);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const startStripeOnboarding = async () => {
    if (!session?.access_token) return;
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/mentors/stripe-onboard`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.url) window.location.href = data.url;
      } else {
        toast.error("We couldn't start payment setup. Please try again.");
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (checkingExisting) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[var(--color-line-2)] border-t-[var(--color-ink)] rounded-full animate-spin" />
      </div>
    );
  }

  // Already a mentor
  if (existingMentor && !success) {
    return (
      <>
        <Head>
          <title key="title">Mentor Dashboard - MigRent</title>
        </Head>
        <div className="max-w-2xl mx-auto px-4 py-12 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-[var(--color-accent-soft)] dark:bg-[var(--color-accent)]/20 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-[var(--color-accent)] dark:text-[var(--color-accent)]" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-ink)]">
            You are a registered mentor
          </h1>
          <p className="text-[var(--color-ink-2)]">
            Suburb: {existingMentor.suburb} - Rate: ${(existingMentor.hourly_rate / 100).toFixed(0)}/session
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            {!existingMentor.stripe_onboarding_complete && (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={startStripeOnboarding}
                disabled={loading}
                className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-500)] text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50"
              >
                <DollarSign className="w-4 h-4 inline mr-1" />
                {loading ? "Loading..." : "Set Up Payouts"}
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.03 }}
              onClick={() => router.push("/mentors")}
              className="bg-[var(--color-surface-muted)] text-[var(--color-ink-2)] font-semibold px-6 py-2.5 rounded-xl text-sm"
            >
              View Mentor Directory
            </motion.button>
          </div>
        </div>
      </>
    );
  }

  // Success state
  if (success) {
    return (
      <>
        <Head>
          <title key="title">Welcome, Mentor! - MigRent</title>
        </Head>
        <div className="max-w-2xl mx-auto px-4 py-12 text-center space-y-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="w-20 h-20 rounded-2xl bg-[var(--color-primary-soft)] from-[var(--color-accent)] to-[var(--color-primary)] flex items-center justify-center mx-auto"
          >
            <CheckCircle2 className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-2xl font-bold text-[var(--color-ink)]">
            Welcome to the Mentor Network!
          </h1>
          <p className="text-[var(--color-ink-2)] max-w-md mx-auto">
            Your mentor profile is live. New arrivals in your suburb can now find and book sessions with you.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <motion.button
              whileHover={{ scale: 1.03 }}
              onClick={startStripeOnboarding}
              disabled={loading}
              className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-500)] text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50"
            >
              <DollarSign className="w-4 h-4 inline mr-1" />
              {loading ? "Loading..." : "Set Up Payouts (Stripe)"}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              onClick={() => router.push("/mentors")}
              className="bg-[var(--color-surface-muted)] text-[var(--color-ink-2)] font-semibold px-6 py-2.5 rounded-xl text-sm"
            >
              View Directory
            </motion.button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHead title="Become a Mentor - MigRent" description="Help new arrivals settle into your suburb. Earn $20-30 per session as a MigRent local mentor." />

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3"
        >
          <div className="w-16 h-16 rounded-2xl bg-[var(--color-primary-soft)] from-[var(--color-primary)] to-[var(--color-primary)] flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-[var(--color-ink)]">
            Become a Local Mentor
          </h1>
          <p className="text-[var(--color-ink-2)]">
            Help newcomers settle in. Earn $20-$30 per session. Make a difference.
          </p>
        </motion.div>

        {/* Benefits */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: <DollarSign className="w-5 h-5" />, label: "Earn $20-30/session", color: "text-[var(--color-accent)]" },
            { icon: <Users className="w-5 h-5" />, label: "Help your community", color: "text-[var(--color-primary)]" },
            { icon: <Star className="w-5 h-5" />, label: "Build your reputation", color: "text-[var(--color-warn-500)]" },
          ].map((item) => (
            <div key={item.label} className="card p-3 text-center">
              <div className={`${item.color} mx-auto mb-1`}>{item.icon}</div>
              <p className="text-xs font-medium text-[var(--color-ink-2)]">{item.label}</p>
            </div>
          ))}
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex-1 flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  step >= s
                    ? "bg-[var(--color-primary)] text-white"
                    : "bg-[var(--color-line)] text-[var(--color-ink-3)]"
                }`}
              >
                {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
              </div>
              {s < 3 && (
                <div className={`flex-1 h-0.5 rounded ${step > s ? "bg-[var(--color-primary)]" : "bg-[var(--color-line)]"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Location */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card p-6 space-y-4"
          >
            <h2 className="text-lg font-bold text-[var(--color-ink)] flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[var(--color-primary)]" />
              Your Location
            </h2>

            <div>
              <label htmlFor="mentor-suburb" className="block text-sm font-medium text-[var(--color-ink-2)] mb-1">
                Suburb <span aria-hidden="true">*</span><span className="sr-only">(required)</span>
              </label>
              <input
                id="mentor-suburb"
                name="suburb"
                type="text"
                required
                autoComplete="address-level2"
                value={suburb}
                onChange={(e) => setSuburb(e.target.value)}
                placeholder="e.g. Kellyville"
                className="w-full px-4 py-2.5 bg-[var(--color-surface)] border border-[var(--color-line)] rounded-xl text-sm focus:ring-2 focus:ring-[var(--color-ink)]/30 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label htmlFor="mentor-postcode" className="block text-sm font-medium text-[var(--color-ink-2)] mb-1">
                Postcode
              </label>
              <input
                id="mentor-postcode"
                name="postcode"
                type="text"
                inputMode="numeric"
                pattern="[0-9]{4}"
                autoComplete="postal-code"
                value={postcode}
                onChange={(e) => setPostcode(e.target.value)}
                placeholder="e.g. 2155"
                maxLength={4}
                className="w-full px-4 py-2.5 bg-[var(--color-surface)] border border-[var(--color-line)] rounded-xl text-sm focus:ring-2 focus:ring-[var(--color-ink)]/30 focus:border-transparent outline-none"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (!suburb.trim()) { toast.warning("Please enter your suburb to continue."); return; }
                setStep(2);
              }}
              className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-500)] text-white font-semibold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </motion.div>
        )}

        {/* Step 2: Languages & Specialties */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card p-6 space-y-5"
          >
            <h2 className="text-lg font-bold text-[var(--color-ink)] flex items-center gap-2">
              <Globe className="w-5 h-5 text-[var(--color-primary)]" />
              Languages & Expertise
            </h2>

            <div>
              <label className="block text-sm font-medium text-[var(--color-ink-2)] mb-2">
                Languages you speak *
              </label>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => toggleLanguage(lang)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      languages.includes(lang)
                        ? "bg-[var(--color-primary)] text-white"
                        : "bg-[var(--color-surface-muted)] text-[var(--color-ink-2)] hover:bg-[var(--color-surface-muted)]"
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-ink-2)] mb-2">
                What can you help with?
              </label>
              <div className="flex flex-wrap gap-2">
                {SPECIALTIES.map((spec) => (
                  <button
                    key={spec}
                    onClick={() => toggleSpecialty(spec)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      specialties.includes(spec)
                        ? "bg-[var(--color-accent)] text-white"
                        : "bg-[var(--color-surface-muted)] text-[var(--color-ink-2)] hover:bg-[var(--color-surface-muted)]"
                    }`}
                  >
                    {spec}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={() => setStep(1)}
                className="flex-1 bg-[var(--color-surface-muted)] text-[var(--color-ink-2)] font-semibold py-3 rounded-xl text-sm"
              >
                Back
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (languages.length === 0) { toast.warning("Pick at least one language so we can match you."); return; }
                  setStep(3);
                }}
                className="flex-1 bg-[var(--color-primary)] hover:bg-[var(--color-primary-500)] text-white font-semibold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Bio & Rate */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card p-6 space-y-4"
          >
            <h2 className="text-lg font-bold text-[var(--color-ink)] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[var(--color-primary)]" />
              About You & Pricing
            </h2>

            <div>
              <label htmlFor="mentor-bio" className="block text-sm font-medium text-[var(--color-ink-2)] mb-1">
                Bio - tell new arrivals about yourself
              </label>
              <textarea
                id="mentor-bio"
                name="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="e.g. I've lived in Kellyville for 10 years. I know every cafe, park, and shortcut. Originally from India, I speak Hindi and English fluently."
                rows={4}
                maxLength={2000}
                className="w-full px-4 py-2.5 bg-[var(--color-surface)] border border-[var(--color-line)] rounded-xl text-sm focus:ring-2 focus:ring-[var(--color-ink)]/30 focus:border-transparent outline-none resize-none"
              />
            </div>

            <div>
              <label htmlFor="mentor-rate" className="block text-sm font-medium text-[var(--color-ink-2)] mb-1">
                Session rate (AUD) - you keep 70%
              </label>
              <div className="flex items-center gap-4">
                <input
                  id="mentor-rate"
                  name="hourly_rate"
                  aria-valuetext={`$${hourlyRate} per session`}
                  type="range"
                  min={15}
                  max={100}
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(parseInt(e.target.value))}
                  className="flex-1 accent-[var(--color-primary)]"
                />
                <div className="bg-[var(--color-primary)] text-white font-bold text-lg px-4 py-1.5 rounded-xl min-w-[80px] text-center">
                  ${hourlyRate}
                </div>
              </div>
              <div className="flex justify-between text-xs text-[var(--color-ink-3)] mt-1">
                <span>You earn: ${Math.round(hourlyRate * 0.7)}</span>
                <span>Platform fee: ${Math.round(hourlyRate * 0.3)}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={() => setStep(2)}
                className="flex-1 bg-[var(--color-surface-muted)] text-[var(--color-ink-2)] font-semibold py-3 rounded-xl text-sm"
              >
                Back
              </motion.button>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={loading}
                aria-busy={loading}
                className="flex-1 bg-[var(--color-primary)] text-white font-semibold py-3 rounded-xl text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Heart className="w-4 h-4" />
                    Create Mentor Profile
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </>
  );
}
