import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";
import { useDashboard } from "../../hooks/useDashboard";
import { getMyProfile, updateMyProfile, refreshBadges } from "../../lib/api";
import Link from "next/link";
import DashboardLayout from "../../components/DashboardLayout";

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
  uselessSkill: string;
  interests: string[];
  profilePhoto: string | null;
  badges: string[];
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

const INTEREST_OPTIONS = [
  "Cooking",
  "Gaming",
  "Fitness",
  "Reading",
  "Music",
  "Photography",
  "Travel",
  "Art",
  "Hiking",
  "Movies",
  "Coding",
  "Yoga",
  "Sports",
  "Dancing",
  "Gardening",
  "Coffee",
];

const SEEKER_BADGES = [
  { id: "first_place", label: "Nest Egg", desc: "Your first place", icon: "🏠", key: "Purchased 1+ homes" },
  { id: "fifth_place", label: "Frequent Flyer", desc: "Your 5th place", icon: "✈️", key: "frequent_flyer" },
  { id: "five_destinations", label: "Wanderlust", desc: "Stayed at over 5 destinations", icon: "🌍", key: "wanderlust" },
  { id: "ten_destinations", label: "Globe Trotter", desc: "Stayed at over 10 destinations", icon: "🗺️", key: "globe_trotter" },
  { id: "long_stay", label: "Home Bird", desc: "Stayed at a place for 14+ days", icon: "🐦", key: "home_bird" },
];

export default function SeekerProfilePage() {
  const { session, user, loading, signOut } = useAuth();
  const { updateProfilePhoto } = useDashboard();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);

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
    uselessSkill: "",
    interests: ["Travel", "Coffee"],
    profilePhoto: null,
    badges: [],
  });

  // Load profile from backend
  useEffect(() => {
    if (session?.access_token) {
      (async () => {
        try {
          const data = await getMyProfile(session.access_token);
          if (data) {
            setProfile((prev) => ({
              ...prev,
              name: data.name || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "",
              age: data.age?.toString() || "",
              occupation: data.occupation || "",
              visaType: data.visa_type || "",
              budgetMin: data.budget_min?.toString() || "150",
              budgetMax: data.budget_max?.toString() || "350",
              preferredSuburbs: data.preferred_suburbs || "",
              moveInDate: data.move_in_date || "",
              lifestyle: data.lifestyle || ["Quiet", "Non-smoker"],
              bio: data.about_me || data.bio || "",
              uselessSkill: data.most_useless_skill || "",
              interests: data.interests || ["Travel", "Coffee"],
              profilePhoto: data.custom_pfp || null,
              badges: data.badges || [],
            }));
          }
          // Also refresh badges
          const badgeData = await refreshBadges(session.access_token);
          if (badgeData?.badges) {
            setProfile((prev) => ({ ...prev, badges: badgeData.badges }));
          }
        } catch (err) {
          console.error("Failed to load profile:", err);
        } finally {
          setLoadingProfile(false);
        }
      })();
    } else if (!loading) {
      setLoadingProfile(false);
    }
  }, [session, user, loading]);

  useEffect(() => {
    if (user && !profile.name) {
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

  const toggleInterest = (item: string) => {
    setProfile((prev) => {
      const has = prev.interests.includes(item);
      if (has) return { ...prev, interests: prev.interests.filter((i) => i !== item) };
      if (prev.interests.length >= 5) return prev;
      return { ...prev, interests: [...prev.interests, item] };
    });
    setSaved(false);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      update("profilePhoto", url);
      // Update sidebar avatar immediately
      updateProfilePhoto(url);
    }
  };

  const handleSave = async () => {
    if (!session?.access_token) return;
    setSaving(true);
    try {
      await updateMyProfile(session.access_token, {
        name: profile.name,
        about_me: profile.bio,
        most_useless_skill: profile.uselessSkill,
        interests: profile.interests,
        occupation: profile.occupation,
        age: profile.age ? Number(profile.age) : null,
        visa_type: profile.visaType || null,
        budget_min: profile.budgetMin ? Number(profile.budgetMin) : null,
        budget_max: profile.budgetMax ? Number(profile.budgetMax) : null,
        preferred_suburbs: profile.preferredSuburbs || null,
        move_in_date: profile.moveInDate || null,
        lifestyle: profile.lifestyle,
        custom_pfp: profile.profilePhoto || null,
      });
      setSaved(true);
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setSaving(false);
    }
  };

  const earnedBadgeKeys = profile.badges || [];

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
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          You need to sign in to edit your profile.
        </p>
        <Link href="/signin" className="btn-primary py-3 px-6 rounded-xl text-sm inline-block">
          Sign in
        </Link>
      </div>
    );

  return (
    <DashboardLayout>
    <div className="max-w-2xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
          My <span className="gradient-text">Profile</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          Build your tenant profile to stand out to owners.
        </p>
      </motion.div>

      {/* Profile photo + name header + badges */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="card p-6 rounded-2xl"
      >
        <div className="flex items-center gap-5">
          <div className="relative group">
            <div
              onClick={() => fileRef.current?.click()}
              className={`w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-3xl shrink-0 cursor-pointer overflow-hidden ring-2 ring-white dark:ring-slate-800 shadow-lg ${
                profile.profilePhoto ? "" : "bg-gradient-to-br from-rose-400 to-rose-600"
              }`}
            >
              {profile.profilePhoto ? (
                <img src={profile.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                profile.name ? profile.name[0].toUpperCase() : "S"
              )}
            </div>
            <div
              onClick={() => fileRef.current?.click()}
              className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{profile.name || "Your Name"}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{profile.occupation || "Add your occupation"}</p>
            {/* Badges as pills */}
            {earnedBadgeKeys.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {earnedBadgeKeys.map((badge) => (
                  <span
                    key={badge}
                    className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            )}
            {/* Useless skill fun badge */}
            {profile.uselessSkill && (
              <span className="inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20">
                {profile.uselessSkill}
              </span>
            )}
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Click photo to change</p>
          </div>
        </div>
      </motion.section>

      {/* About me */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="card p-6 rounded-2xl space-y-4"
      >
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">About me</h2>
        <textarea
          value={profile.bio}
          onChange={(e) => update("bio", e.target.value.slice(0, 200))}
          placeholder="Tell owners about yourself — what brings you to Australia, your hobbies, what you're like to live with..."
          rows={4}
          className="input-field text-sm"
          maxLength={200}
        />
        <p className="text-xs text-slate-400 dark:text-slate-500">{profile.bio.length}/200</p>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            My most useless skill
          </label>
          <input
            type="text"
            value={profile.uselessSkill}
            onChange={(e) => update("uselessSkill", e.target.value)}
            placeholder="e.g. I can solve a Rubik's cube blindfolded, I can name every country backwards..."
            className="input-field text-sm"
          />
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">This is a fun ice-breaker that owners love</p>
        </div>
      </motion.section>

      {/* Interests */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card p-6 rounded-2xl space-y-4"
      >
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Interests</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Pick what you enjoy (max 5) — helps find like-minded housemates.</p>
        <div className="flex flex-wrap gap-2">
          {INTEREST_OPTIONS.map((item) => {
            const active = profile.interests.includes(item);
            return (
              <button
                key={item}
                onClick={() => toggleInterest(item)}
                disabled={!active && profile.interests.length >= 5}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  active
                    ? "bg-rose-500 text-white shadow-sm"
                    : profile.interests.length >= 5
                    ? "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 cursor-not-allowed"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-rose-300 dark:hover:border-rose-500/30"
                }`}
              >
                {active ? "✓ " : ""}{item}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-slate-400">{profile.interests.length}/5 selected</p>
      </motion.section>

      {/* Badges */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        className="card p-6 rounded-2xl space-y-4"
      >
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Badges</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Earn badges as you use MigRent. They show on your profile to owners.</p>
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
                <h4 className={`text-sm font-bold ${earned ? "text-rose-600 dark:text-rose-400" : "text-slate-400 dark:text-slate-500"}`}>
                  {badge.label}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{badge.desc}</p>
                {earned && (
                  <div className="absolute top-2 right-2">
                    <span className="text-emerald-500 text-xs font-bold">✓</span>
                  </div>
                )}
                {!earned && (
                  <div className="absolute top-2 right-2">
                    <svg className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </motion.section>

      {/* Verification status */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.16 }}
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
        transition={{ delay: 0.18 }}
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
      </motion.section>

      {/* Preferences section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
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
        transition={{ delay: 0.22 }}
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
    </DashboardLayout>
  );
}
