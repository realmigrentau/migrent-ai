import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";
import Link from "next/link";

interface SeekerProfile {
  name: string;
  age: string;
  occupation: string;
  visaType: string;
  budgetMin: string;
  budgetMax: string;
  preferredSuburbs: string;
  moveInDate: string;
  lifestyle: string[];
  bio: string;
}

const LIFESTYLE_OPTIONS = [
  "Quiet",
  "Non-smoker",
  "Early riser",
  "Night owl",
  "Clean & tidy",
  "Social",
  "Student",
  "Professional",
  "No pets",
  "Pet-friendly",
  "Vegetarian/Vegan",
  "LGBTQ+ friendly",
];

export default function SeekerProfilePage() {
  const { session, user, loading, signOut } = useAuth();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState<SeekerProfile>({
    name: "",
    age: "",
    occupation: "",
    visaType: "",
    budgetMin: "150",
    budgetMax: "350",
    preferredSuburbs: "",
    moveInDate: "",
    lifestyle: ["Quiet", "Non-smoker"],
    bio: "",
  });

  useEffect(() => {
    if (user) {
      setProfile((prev) => ({
        ...prev,
        name: user.user_metadata?.full_name || user.email?.split("@")[0] || "",
      }));
    }
  }, [user]);

  const update = (key: keyof SeekerProfile, value: any) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const toggleLifestyle = (item: string) => {
    setProfile((prev) => ({
      ...prev,
      lifestyle: prev.lifestyle.includes(item)
        ? prev.lifestyle.filter((l) => l !== item)
        : [...prev.lifestyle, item],
    }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    // In production: PUT /api/user/profile
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    setSaved(true);
  };

  if (loading)
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-rose-300 dark:border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
      </div>
    );

  if (!session)
    return (
      <div className="card p-8 rounded-2xl text-center max-w-md mx-auto mt-12">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Sign in required</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          You need to sign in to edit your profile.
        </p>
        <Link href="/signin" className="btn-primary py-3 px-6 rounded-xl text-sm inline-block">
          Sign in
        </Link>
      </div>
    );

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
          My <span className="gradient-text">Profile</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          Build your tenant profile to stand out to owners.
        </p>
      </motion.div>

      {/* Verification status */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="card-subtle p-4 rounded-xl"
      >
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Verification status</h3>
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
            ✓ Email verified
          </span>
          <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            ○ ID not verified
          </span>
          <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            ○ Income not verified
          </span>
        </div>
      </motion.section>

      {/* Personal section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card p-6 rounded-2xl space-y-4"
      >
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Personal information</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Full name</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Your name"
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Age</label>
            <input
              type="number"
              value={profile.age}
              onChange={(e) => update("age", e.target.value)}
              placeholder="e.g. 25"
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Occupation</label>
            <input
              type="text"
              value={profile.occupation}
              onChange={(e) => update("occupation", e.target.value)}
              placeholder="e.g. Software Developer, Student"
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Visa type</label>
            <select
              value={profile.visaType}
              onChange={(e) => update("visaType", e.target.value)}
              className="input-field"
            >
              <option value="">Select visa type</option>
              <option value="citizen">Australian Citizen</option>
              <option value="pr">Permanent Resident</option>
              <option value="student">Student Visa (500)</option>
              <option value="whv">Working Holiday (417/462)</option>
              <option value="temporary">Temporary Skilled (482)</option>
              <option value="bridging">Bridging Visa</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">About me</label>
          <textarea
            value={profile.bio}
            onChange={(e) => update("bio", e.target.value)}
            placeholder="Tell owners a bit about yourself..."
            rows={3}
            className="input-field"
          />
        </div>
      </motion.section>

      {/* Preferences section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="card p-6 rounded-2xl space-y-4"
      >
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Preferences</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Budget range ($/wk)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={profile.budgetMin}
                onChange={(e) => update("budgetMin", e.target.value)}
                placeholder="150"
                className="input-field"
              />
              <span className="text-slate-400">–</span>
              <input
                type="number"
                value={profile.budgetMax}
                onChange={(e) => update("budgetMax", e.target.value)}
                placeholder="350"
                className="input-field"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Move-in date</label>
            <input
              type="date"
              value={profile.moveInDate}
              onChange={(e) => update("moveInDate", e.target.value)}
              className="input-field"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Preferred suburbs
          </label>
          <input
            type="text"
            value={profile.preferredSuburbs}
            onChange={(e) => update("preferredSuburbs", e.target.value)}
            placeholder="e.g. Surry Hills, Redfern, Newtown"
            className="input-field"
          />
        </div>
      </motion.section>

      {/* Lifestyle section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card p-6 rounded-2xl space-y-4"
      >
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Lifestyle</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Select tags that describe you.</p>
        <div className="flex flex-wrap gap-2">
          {LIFESTYLE_OPTIONS.map((item) => {
            const active = profile.lifestyle.includes(item);
            return (
              <button
                key={item}
                onClick={() => toggleLifestyle(item)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  active
                    ? "bg-rose-500 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-rose-300 dark:hover:border-rose-500/30"
                }`}
              >
                {active ? "✓ " : ""}{item}
              </button>
            );
          })}
        </div>
      </motion.section>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          disabled={saving}
          className="btn-primary py-3 px-8 rounded-xl text-sm font-bold disabled:opacity-50"
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving...
            </span>
          ) : saved ? (
            "✓ Saved"
          ) : (
            "Save profile"
          )}
        </motion.button>
        <button
          disabled
          className="btn-secondary py-3 px-8 rounded-xl text-sm opacity-50 cursor-not-allowed"
          title="Coming soon"
        >
          Download PDF (coming soon)
        </button>
      </motion.div>

      {saved && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 p-3 rounded-xl"
        >
          Profile saved successfully.
        </motion.p>
      )}
    </div>
  );
}
