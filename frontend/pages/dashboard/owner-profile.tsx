import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";
import { getMyProfile, updateMyProfile, refreshBadges } from "../../lib/api";
import DashboardLayout from "../../components/DashboardLayout";

const OWNER_BADGES = [
  { id: "first_sale", label: "First Keys", desc: "Your first official rent to a person of a room/property", icon: "🔑", key: "Verified host" },
  { id: "property_mogul", label: "Property Mogul", desc: "Own more than 3 properties", icon: "🏘️", key: "property_mogul" },
  { id: "superhost", label: "Superhost", desc: "3+ published listings", icon: "⭐", key: "Superhost" },
  { id: "mega_host", label: "Mega Host", desc: "You have hosted for over a year", icon: "🏆", key: "mega_host" },
  { id: "the_trusted", label: "The Trusted", desc: "You have a 4.9-5 rating in reviews", icon: "🛡️", key: "the_trusted" },
  { id: "the_friendly", label: "The Friendly One", desc: "You offer discounts to users who have completed a requirement", icon: "🤝", key: "the_friendly" },
];

export default function OwnerProfilePage() {
  const { session, user, loading } = useAuth();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading && session && user?.user_metadata?.owner_account !== true) {
      router.replace("/owner/setup");
    }
  }, [loading, session, user, router]);

  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [roomsOpen, setRoomsOpen] = useState(false);
  const [propsOpen, setPropsOpen] = useState(false);

  const [profile, setProfile] = useState({
    name: "",
    bio: "",
    phone: "",
    uselessSkill: "",
    aboutMe: "",
    interests: [] as string[],
    profilePhoto: null as string | null,
    notifyEmail: true,
    notifySms: false,
    roomsOwned: 0,
    propertiesOwned: 0,
    badges: [] as string[],
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
              bio: data.bio || data.about_me || "",
              phone: data.phone || "",
              uselessSkill: data.most_useless_skill || "",
              aboutMe: data.about_me || "",
              interests: data.interests || [],
              profilePhoto: data.custom_pfp || null,
              notifyEmail: data.notify_email ?? true,
              notifySms: data.notify_sms ?? false,
              roomsOwned: data.rooms_owned || 0,
              propertiesOwned: data.properties_owned || 0,
              badges: data.badges || [],
            }));
          }
          // Refresh badges
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

  const update = (key: string, value: any) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
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
    if (!session?.access_token) return;
    setSaving(true);
    try {
      await updateMyProfile(session.access_token, {
        name: profile.name,
        about_me: profile.aboutMe || profile.bio,
        most_useless_skill: profile.uselessSkill || null,
        interests: profile.interests,
        phone: profile.phone || null,
        rooms_owned: profile.roomsOwned,
        properties_owned: profile.propertiesOwned,
        notify_email: profile.notifyEmail,
        notify_sms: profile.notifySms,
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
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Sign in to manage your owner profile.</p>
        <Link href="/signin" className="btn-primary py-3 px-6 rounded-xl text-sm inline-block">Sign in</Link>
      </div>
    );

  return (
    <DashboardLayout>
    <div className="max-w-2xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
          Owner <span className="gradient-text-accent">Profile</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          Your profile is shown to seekers when they view your listings.
        </p>
      </motion.div>

      {/* Profile photo + name + badges header */}
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
              className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-rose-500 flex items-center justify-center text-white font-bold text-3xl shrink-0 cursor-pointer overflow-hidden ring-2 ring-white dark:ring-slate-800 shadow-lg"
            >
              {profile.profilePhoto ? (
                <img src={profile.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                profile.name ? profile.name[0].toUpperCase() : "O"
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
            <p className="text-sm text-slate-500 dark:text-slate-400">Property owner</p>
            {/* Badges as pills */}
            {earnedBadgeKeys.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {earnedBadgeKeys.map((badge) => (
                  <span
                    key={badge}
                    className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20"
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

      {/* Verification status */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.07 }}
        className="card-subtle p-4 rounded-xl"
      >
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Verification badges</h3>
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
            ✓ Email verified
          </span>
          <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
            ✓ Identity verified
          </span>
          <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            ○ Property not verified
          </span>
        </div>
      </motion.section>

      {/* Owner Badges */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="card p-6 rounded-2xl space-y-4"
      >
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Badges</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Earn badges as you host on MigRent. Complete the requirements to unlock them.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {OWNER_BADGES.map((badge) => {
            const earned = earnedBadgeKeys.includes(badge.key);
            return (
              <div
                key={badge.id}
                className={`relative p-4 rounded-xl border text-center transition-all ${
                  earned
                    ? "bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20"
                    : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 opacity-50"
                }`}
              >
                <div className="text-2xl mb-1.5">{badge.icon}</div>
                <h4 className={`text-sm font-bold ${earned ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500"}`}>
                  {badge.label}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">{badge.desc}</p>
                {earned ? (
                  <div className="absolute top-2 right-2">
                    <span className="text-emerald-500 text-xs font-bold">✓</span>
                  </div>
                ) : (
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

      {/* About & useless skill */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.09 }}
        className="card p-6 rounded-2xl space-y-4"
      >
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">About me</h2>
        <textarea
          value={profile.aboutMe}
          onChange={(e) => update("aboutMe", e.target.value.slice(0, 200))}
          placeholder="Tell seekers about yourself as a host..."
          rows={3}
          className="input-field text-sm"
          maxLength={200}
        />
        <p className="text-xs text-slate-400">{profile.aboutMe.length}/200</p>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            My most useless skill
          </label>
          <input
            type="text"
            value={profile.uselessSkill}
            onChange={(e) => update("uselessSkill", e.target.value)}
            placeholder='e.g. "Can juggle 3 oranges"'
            className="input-field text-sm"
          />
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">A fun ice-breaker shown on your profile</p>
        </div>
      </motion.section>

      {/* My Properties / Rooms counter */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
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

      {/* Profile information */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        className="card p-6 rounded-2xl space-y-4"
      >
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Profile information</h2>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Display name</label>
          <input
            type="text"
            value={profile.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="Your name"
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Bio</label>
          <textarea
            value={profile.bio}
            onChange={(e) => update("bio", e.target.value)}
            placeholder="e.g. Local Surry Hills owner. I keep my properties well-maintained..."
            rows={3}
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Contact phone (optional)</label>
          <input
            type="tel"
            value={profile.phone}
            onChange={(e) => update("phone", e.target.value)}
            placeholder="e.g. 0412 345 678"
            className="input-field"
          />
        </div>
      </motion.section>

      {/* Past reviews (future) */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="card p-6 rounded-2xl"
      >
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Tenant reviews</h2>
        <div className="text-center py-6">
          <svg className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p className="text-sm text-slate-500 dark:text-slate-400">No reviews yet. Reviews will appear after completed deals.</p>
        </div>
      </motion.section>

      {/* Settings */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card p-6 rounded-2xl space-y-4"
      >
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Notification settings</h2>
        <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
          <span className="text-sm text-slate-700 dark:text-slate-300">Email notifications for new applicants</span>
          <input
            type="checkbox"
            checked={profile.notifyEmail}
            onChange={(e) => update("notifyEmail", e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-rose-500 focus:ring-rose-500"
          />
        </label>
        <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
          <span className="text-sm text-slate-700 dark:text-slate-300">SMS notifications (coming soon)</span>
          <input
            type="checkbox"
            checked={profile.notifySms}
            onChange={(e) => update("notifySms", e.target.checked)}
            disabled
            className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-rose-500 focus:ring-rose-500 opacity-50"
          />
        </label>
        <div className="card-subtle p-4 rounded-xl">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Payout details</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Payout setup via Stripe will be available for future deals. All rent is arranged directly between you and the tenant.
          </p>
        </div>
      </motion.section>

      {/* Save */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
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
        {saved && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-emerald-600 dark:text-emerald-400 mt-3"
          >
            Profile saved successfully.
          </motion.p>
        )}
      </motion.div>
    </div>
    </DashboardLayout>
  );
}
