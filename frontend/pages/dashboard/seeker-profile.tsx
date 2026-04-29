import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useAuth } from "../../hooks/useAuth";
import { useProfile } from "../../hooks/useProfile";
import DashboardLayout from "../../components/DashboardLayout";
import ProfileForm from "../../components/shared/ProfileForm";
import VerificationSummaryCard from "../../components/shared/VerificationSummaryCard";

const SEEKER_BADGES = [
  { id: "first_place", label: "Nest Egg", desc: "Your first place", icon: "🏠", key: "Purchased 1+ homes" },
  { id: "fifth_place", label: "Frequent Flyer", desc: "Your 5th place", icon: "✈️", key: "frequent_flyer" },
  { id: "five_destinations", label: "Wanderlust", desc: "Stayed at over 5 destinations", icon: "🌍", key: "wanderlust" },
  { id: "ten_destinations", label: "Globe Trotter", desc: "Stayed at over 10 destinations", icon: "🗺️", key: "globe_trotter" },
  { id: "long_stay", label: "Home Bird", desc: "Stayed at a place for 14+ days", icon: "🐦", key: "home_bird" },
];

const VISA_OPTIONS = [
  { value: "", label: "Select visa type" },
  { value: "citizen", label: "Australian Citizen" },
  { value: "pr", label: "Permanent Resident" },
  { value: "student", label: "Student Visa (500)" },
  { value: "whv", label: "Working Holiday (417/462)" },
  { value: "temporary", label: "Temporary Skilled (482)" },
  { value: "bridging", label: "Bridging Visa" },
  { value: "other", label: "Other" },
];

export default function SeekerProfilePage() {
  const { session, loading } = useAuth();
  const { profile, loading: loadingProfile, saving, update, uploadPhoto } = useProfile();
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" | "info" }>({ text: "", type: "info" });

  // Local state for seeker-specific fields not in shared ProfileForm
  const [age, setAge] = useState("");
  const [visaType, setVisaType] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [preferredSuburbs, setPreferredSuburbs] = useState("");
  const [moveInDate, setMoveInDate] = useState("");
  const [seekerFieldsLoaded, setSeekerFieldsLoaded] = useState(false);

  // Sync seeker-specific fields when profile loads
  if (profile && !seekerFieldsLoaded) {
    setAge(profile.age?.toString() || "");
    setVisaType(profile.visa_type || "");
    setBudgetMin(profile.budget_min?.toString() || "");
    setBudgetMax(profile.budget_max?.toString() || "");
    setPreferredSuburbs(profile.preferred_suburbs || "");
    setMoveInDate(profile.move_in_date || "");
    setSeekerFieldsLoaded(true);
  }

  const showMessage = (text: string, type: "success" | "error" | "info") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "info" }), 4000);
  };

  const handleSaveSeekerFields = async () => {
    const data: Record<string, any> = {};
    if (age) data.age = Number(age);
    if (visaType) data.visa_type = visaType;
    if (budgetMin) data.budget_min = Number(budgetMin);
    if (budgetMax) data.budget_max = Number(budgetMax);
    if (preferredSuburbs) data.preferred_suburbs = preferredSuburbs;
    if (moveInDate) data.move_in_date = moveInDate;

    if (Object.keys(data).length === 0) {
      showMessage("No changes to save", "info");
      return;
    }

    const ok = await update(data);
    if (ok) {
      showMessage("Seeker details saved!", "success");
    } else {
      showMessage("Failed to save", "error");
    }
  };

  const earnedBadgeKeys = profile?.badges || [];

  if (loading || loadingProfile)
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-rose-300 dark:border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
      </div>
    );

  if (!session)
    return (
      <div className="card p-8 rounded-2xl text-center max-w-md mx-auto mt-12">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Sign in required</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">You need to sign in to edit your profile.</p>
        <Link href="/signin" className="btn-primary py-3 px-6 rounded-xl text-sm inline-block">Sign in</Link>
      </div>
    );

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">
            My Profile
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Build your tenant profile to stand out to owners.
          </p>
        </motion.div>

        {/* Toast */}
        <AnimatePresence>
          {message.text && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`p-3 rounded-xl text-sm border ${
                message.type === "success"
                  ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-600"
                  : message.type === "error"
                  ? "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-600"
                  : "bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20 text-blue-600"
              }`}
            >
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Verification Summary */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <VerificationSummaryCard profile={profile} />
        </motion.div>

        {/* Seeker Badges */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="card p-6 rounded-2xl space-y-4"
        >
          <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">Badges</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Earn badges as you use MigRent.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {SEEKER_BADGES.map((badge) => {
              const earned = earnedBadgeKeys.includes(badge.key);
              return (
                <div
                  key={badge.id}
                  className={`relative p-4 rounded-xl border text-center transition-all ${
                    earned
                      ? "bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20"
                      : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 opacity-50"
                  }`}
                >
                  <div className="text-2xl mb-1.5">{badge.icon}</div>
                  <h4 className={`text-sm font-semibold ${earned ? "text-rose-600 dark:text-rose-400" : "text-slate-400 dark:text-slate-500"}`}>
                    {badge.label}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{badge.desc}</p>
                  {earned && (
                    <div className="absolute top-2 right-2">
                      <span className="text-emerald-500 text-xs font-bold">✓</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.section>

        {/* Seeker-specific fields: visa, budget, move-in */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6 rounded-2xl space-y-4"
        >
          <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">Seeker Details</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="e.g. 25"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Visa type</label>
              <select value={visaType} onChange={(e) => setVisaType(e.target.value)} className="input-field">
                {VISA_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Budget range ($/wk)
              </label>
              <div className="flex items-center gap-2">
                <input type="number" value={budgetMin} onChange={(e) => setBudgetMin(e.target.value)} placeholder="150" className="input-field" />
                <span className="text-slate-400">-</span>
                <input type="number" value={budgetMax} onChange={(e) => setBudgetMax(e.target.value)} placeholder="350" className="input-field" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Move-in date</label>
              <input type="date" value={moveInDate} onChange={(e) => setMoveInDate(e.target.value)} className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Preferred suburbs</label>
            <input
              type="text"
              value={preferredSuburbs}
              onChange={(e) => setPreferredSuburbs(e.target.value)}
              placeholder="e.g. Surry Hills, Redfern, Newtown"
              className="input-field"
            />
          </div>
          <button
            onClick={handleSaveSeekerFields}
            disabled={saving}
            className="btn-primary py-2.5 px-6 rounded-xl text-sm font-semibold disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Seeker Details"}
          </button>
        </motion.section>

        {/* Shared Profile Form - same data as settings */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
          <ProfileForm
            profile={profile}
            saving={saving}
            onSave={update}
            onUploadPhoto={uploadPhoto}
            showMessage={showMessage}
            seekerMode={true}
          />
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
