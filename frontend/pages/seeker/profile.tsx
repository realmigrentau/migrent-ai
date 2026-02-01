import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  uselessSkill: string;
  interests: string[];
  profilePhoto: string | null;
  roomsOwned: number;
  propertiesOwned: number;
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
  { id: "first_place", label: "Nest Egg", desc: "Your first place", icon: "🏠", threshold: 1 },
  { id: "fifth_place", label: "Frequent Flyer", desc: "Your 5th place", icon: "✈️", threshold: 5 },
  { id: "five_destinations", label: "Wanderlust", desc: "Stayed at over 5 destinations", icon: "🌍", threshold: 5 },
  { id: "ten_destinations", label: "Globe Trotter", desc: "Stayed at over 10 destinations", icon: "🗺️", threshold: 10 },
  { id: "long_stay", label: "Home Bird", desc: "Stayed at a place for 14+ days", icon: "🐦", threshold: 14 },
];

export default function SeekerProfilePage() {
  const { session, user, loading, signOut } = useAuth();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [roomsOpen, setRoomsOpen] = useState(false);
  const [propsOpen, setPropsOpen] = useState(false);
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
    roomsOwned: 0,
    propertiesOwned: 0,
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

  const toggleInterest = (item: string) => {
    setProfile((prev) => ({
      ...prev,
      interests: prev.interests.includes(item)
        ? prev.interests.filter((i) => i !== item)
        : [...prev.interests, item],
    }));
    setSaved(false);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      update("profilePhoto", url);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    setSaved(true);
  };

  // Mock data for badges — in production this comes from backend
  const destinations = 3;
  const placesStayed = 1;
  const longestStay = 21;

  const earnedBadges = SEEKER_BADGES.filter((b) => {
    if (b.id === "first_place") return placesStayed >= 1;
    if (b.id === "fifth_place") return placesStayed >= 5;
    if (b.id === "five_destinations") return destinations >= 5;
    if (b.id === "ten_destinations") return destinations >= 10;
    if (b.id === "long_stay") return longestStay >= 14;
    return false;
  });

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

      {/* Profile photo + name header */}
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
              className="w-20 h-20 rounded-full bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center text-white font-bold text-3xl shrink-0 cursor-pointer overflow-hidden ring-2 ring-white dark:ring-slate-800 shadow-lg"
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
          onChange={(e) => update("bio", e.target.value)}
          placeholder="Tell owners about yourself — what brings you to Australia, your hobbies, what you're like to live with..."
          rows={4}
          className="input-field text-sm"
        />
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
        <p className="text-sm text-slate-500 dark:text-slate-400">Pick what you enjoy — helps find like-minded housemates.</p>
        <div className="flex flex-wrap gap-2">
          {INTEREST_OPTIONS.map((item) => {
            const active = profile.interests.includes(item);
            return (
              <button
                key={item}
                onClick={() => toggleInterest(item)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  active
                    ? "bg-rose-500 text-white shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-rose-300 dark:hover:border-rose-500/30"
                }`}
              >
                {active ? "✓ " : ""}{item}
              </button>
            );
          })}
        </div>
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
            const earned = earnedBadges.some((b) => b.id === badge.id);
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

      {/* My Properties / Rooms counter */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.14 }}
        className="card p-6 rounded-2xl space-y-4"
      >
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">My Properties</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Track how many properties and rooms you own or manage.</p>

        {/* Rooms */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <button
            onClick={() => setRoomsOpen(!roomsOpen)}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <div>
                <span className="text-sm font-semibold text-slate-900 dark:text-white">Rooms</span>
                <span className="ml-2 text-xs text-slate-400 dark:text-slate-500">({profile.roomsOwned})</span>
              </div>
            </div>
            <svg className={`w-4 h-4 text-slate-400 transition-transform ${roomsOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <AnimatePresence>
            {roomsOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 flex items-center gap-4">
                  <p className="text-sm text-slate-500 dark:text-slate-400 flex-1">How many rooms do you have?</p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => update("roomsOwned", Math.max(0, profile.roomsOwned - 1))}
                      className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-lg font-medium"
                    >
                      −
                    </button>
                    <span className="w-10 text-center text-lg font-bold text-slate-900 dark:text-white">{profile.roomsOwned}</span>
                    <button
                      onClick={() => update("roomsOwned", profile.roomsOwned + 1)}
                      className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-lg font-medium"
                    >
                      +
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Properties */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <button
            onClick={() => setPropsOpen(!propsOpen)}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <span className="text-sm font-semibold text-slate-900 dark:text-white">Properties</span>
                <span className="ml-2 text-xs text-slate-400 dark:text-slate-500">({profile.propertiesOwned})</span>
              </div>
            </div>
            <svg className={`w-4 h-4 text-slate-400 transition-transform ${propsOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <AnimatePresence>
            {propsOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 flex items-center gap-4">
                  <p className="text-sm text-slate-500 dark:text-slate-400 flex-1">How many properties do you own?</p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => update("propertiesOwned", Math.max(0, profile.propertiesOwned - 1))}
                      className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-lg font-medium"
                    >
                      −
                    </button>
                    <span className="w-10 text-center text-lg font-bold text-slate-900 dark:text-white">{profile.propertiesOwned}</span>
                    <button
                      onClick={() => update("propertiesOwned", profile.propertiesOwned + 1)}
                      className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-lg font-medium"
                    >
                      +
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
  );
}
