import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GlassCard, { StatusBadge } from "../ui/GlassCard";
import {
  User,
  Camera,
  MapPin,
  Pen,
  Hash,
  Wand2,
  Globe,
  Linkedin,
  Twitter,
  Gamepad2,
  Heart,
  X,
  Plus,
  Save,
  Image as ImageIcon,
} from "lucide-react";
import type { ProfileData } from "../../hooks/useSettingsData";

interface ProfileTabProps {
  profile: ProfileData | null;
  saving: boolean;
  updateProfile: (data: Record<string, any>) => Promise<boolean>;
  uploadPhoto: (file: File) => Promise<string | null>;
  showMessage: (text: string, type: "success" | "error" | "info") => void;
}

const INTEREST_OPTIONS = [
  "Travel", "Tech", "AI", "Music", "Cooking", "Fitness", "Gaming",
  "Photography", "Reading", "Surfing", "Yoga", "Hiking", "Art",
  "Movies", "Fashion", "Coffee", "Sustainability", "Languages",
  "Startups", "Design", "Sports", "Meditation", "Dance",
];

const AUSTRALIAN_LOCATIONS = [
  "Kellyville NSW 2155", "Baulkham Hills NSW 2153", "Surry Hills NSW 2010",
  "Bondi NSW 2026", "Manly NSW 2095", "Neutral Bay NSW 2089",
  "Chatswood NSW 2067", "Parramatta NSW 2150", "Penrith NSW 2750",
  "Melbourne VIC 3000", "Fitzroy VIC 3065", "Carlton VIC 3053",
  "Brisbane QLD 4000", "South Bank QLD 4101", "Perth WA 6000",
  "Adelaide SA 5000", "Sydney NSW 2000", "Newtown NSW 2042",
  "Marrickville NSW 2204", "Glebe NSW 2037", "Redfern NSW 2016",
];

export default function ProfileTab({
  profile,
  saving,
  updateProfile,
  uploadPhoto,
  showMessage,
}: ProfileTabProps) {
  // Form state
  const [aboutMe, setAboutMe] = useState(profile?.about_me || profile?.bio || "");
  const [interests, setInterests] = useState<string[]>(profile?.interests || []);
  const [mostUselessSkill, setMostUselessSkill] = useState(profile?.most_useless_skill || "");
  const [socialTwitter, setSocialTwitter] = useState(profile?.social_twitter || "");
  const [socialLinkedin, setSocialLinkedin] = useState(profile?.social_linkedin || "");
  const [socialDiscord, setSocialDiscord] = useState(profile?.social_discord || "");

  // Address
  const [residentialAddress, setResidentialAddress] = useState(
    typeof profile?.residential_address === "string"
      ? profile.residential_address
      : profile?.residential_address?.address || ""
  );
  const [addressSuggestions, setAddressSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Photo
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [showInterestsModal, setShowInterestsModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Address autocomplete
  const handleAddressChange = (value: string) => {
    setResidentialAddress(value);
    if (value.length < 2) {
      setAddressSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const lower = value.toLowerCase();
    const filtered = AUSTRALIAN_LOCATIONS.filter((loc) =>
      loc.toLowerCase().includes(lower)
    ).slice(0, 5);
    setAddressSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
  };

  // Photo upload
  const handlePhotoSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Preview
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);

      // Upload
      await uploadPhoto(file);
    },
    [uploadPhoto]
  );

  // Toggle interest
  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  // Save all profile fields
  const handleSaveProfile = async () => {
    const data: Record<string, any> = {};
    if (aboutMe !== (profile?.about_me || "")) data.about_me = aboutMe;
    if (JSON.stringify(interests) !== JSON.stringify(profile?.interests || [])) data.interests = interests;
    if (mostUselessSkill !== (profile?.most_useless_skill || "")) data.most_useless_skill = mostUselessSkill;
    if (socialTwitter !== (profile?.social_twitter || "")) data.social_twitter = socialTwitter;
    if (socialLinkedin !== (profile?.social_linkedin || "")) data.social_linkedin = socialLinkedin;
    if (socialDiscord !== (profile?.social_discord || "")) data.social_discord = socialDiscord;

    if (Object.keys(data).length === 0) {
      showMessage("No changes to save", "info");
      return;
    }

    await updateProfile(data);
  };

  const avatarUrl = photoPreview || profile?.custom_pfp;

  return (
    <div className="space-y-6">
      {/* Profile Photo & Name */}
      <GlassCard delay={0.05} gradient="indigo">
        <div className="flex flex-col sm:flex-row items-center gap-5">
          {/* Avatar */}
          <div className="relative group">
            <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gradient-to-br from-rose-400 to-indigo-500 shadow-xl">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-10 h-10 text-white/80" />
                </div>
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white dark:bg-slate-800 border-2 border-white dark:border-slate-900 shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
            >
              <Camera className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoSelect}
              className="hidden"
            />
          </div>

          {/* Name section */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center gap-2 justify-center sm:justify-start mb-1">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {profile?.preferred_name || profile?.legal_name || "Your Name"}
              </h2>
              {profile?.identity_verified && (
                <StatusBadge status="verified" label="Verified" />
              )}
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {profile?.legal_name && profile.legal_name !== profile.preferred_name
                ? `Legal: ${profile.legal_name}`
                : ""}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Name changes are managed during onboarding
            </p>
          </div>
        </div>
      </GlassCard>

      {/* About Me */}
      <GlassCard delay={0.1}>
        <div className="flex items-start gap-4 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center shadow-lg shrink-0">
            <Pen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">About Me</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Tell others about yourself</p>
          </div>
        </div>
        <div className="ml-14">
          <textarea
            value={aboutMe}
            onChange={(e) => setAboutMe(e.target.value)}
            placeholder="I'm a tech enthusiast who loves exploring Sydney..."
            rows={4}
            maxLength={500}
            className="input-field resize-none"
          />
          <div className="flex justify-between mt-1.5">
            <p className="text-[10px] text-slate-400">Markdown supported</p>
            <p className="text-[10px] text-slate-400">{aboutMe.length}/500</p>
          </div>
        </div>
      </GlassCard>

      {/* Interests */}
      <GlassCard delay={0.15}>
        <div className="flex items-start gap-4 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shrink-0">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">Interests</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Help us find your perfect match</p>
              </div>
              <button
                onClick={() => setShowInterestsModal(true)}
                className="flex items-center gap-1 text-xs text-rose-500 hover:text-rose-600 font-medium"
              >
                <Plus className="w-3.5 h-3.5" /> Edit
              </button>
            </div>
          </div>
        </div>

        <div className="ml-14 flex flex-wrap gap-2">
          {interests.length > 0 ? (
            interests.map((interest) => (
              <motion.span
                key={interest}
                layout
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-500/10 dark:to-pink-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20"
              >
                {interest}
                <button onClick={() => toggleInterest(interest)} className="hover:text-rose-900">
                  <X className="w-3 h-3" />
                </button>
              </motion.span>
            ))
          ) : (
            <p className="text-sm text-slate-400 dark:text-slate-500 italic">No interests added yet</p>
          )}
        </div>

        {/* Interests Modal */}
        <AnimatePresence>
          {showInterestsModal && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowInterestsModal(false)}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="fixed inset-x-4 top-[15%] sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[480px] z-50"
              >
                <div className="backdrop-blur-xl bg-white/95 dark:bg-slate-900/95 rounded-2xl shadow-2xl border border-white/20 dark:border-slate-700/50 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-900 dark:text-white">Select Interests</h3>
                    <button
                      onClick={() => setShowInterestsModal(false)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <X className="w-4 h-4 text-slate-500" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 max-h-[40vh] overflow-y-auto">
                    {INTEREST_OPTIONS.map((opt) => {
                      const selected = interests.includes(opt);
                      return (
                        <button
                          key={opt}
                          onClick={() => toggleInterest(opt)}
                          className={`
                            px-3 py-1.5 rounded-full text-xs font-medium border transition-all
                            ${selected
                              ? "bg-rose-500 text-white border-rose-500 shadow-md"
                              : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-rose-300 dark:hover:border-rose-500/30"
                            }
                          `}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-3">{interests.length} selected</p>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </GlassCard>

      {/* Most Useless Skill */}
      <GlassCard delay={0.2}>
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg shrink-0">
            <Wand2 className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-slate-900 dark:text-white">Most Useless Skill 🤪</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">The sillier the better</p>
            <input
              type="text"
              value={mostUselessSkill}
              onChange={(e) => setMostUselessSkill(e.target.value)}
              placeholder='e.g. "Can name every Sydney train station in order"'
              maxLength={100}
              className="input-field"
            />
          </div>
        </div>
      </GlassCard>

      {/* Location */}
      <GlassCard delay={0.25}>
        <div className="flex items-start gap-4 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-lg shrink-0">
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">Location</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Your residential address (only visible to verified users)</p>
          </div>
        </div>
        <div className="ml-14">
          <div className="relative">
            <input
              type="text"
              value={residentialAddress}
              disabled
              placeholder="e.g. Bondi NSW 2026"
              className="input-field bg-slate-50 dark:bg-slate-800/50 cursor-not-allowed text-slate-600 dark:text-slate-300"
              autoComplete="off"
            />
            {showSuggestions && addressSuggestions.length > 0 && (
              <ul className="absolute left-0 right-0 top-12 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                {addressSuggestions.map((suggestion, idx) => (
                  <li key={idx}>
                    <button
                      type="button"
                      onClick={() => {
                        setResidentialAddress(suggestion);
                        setShowSuggestions(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      {suggestion}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Address is set during onboarding</p>
        </div>
      </GlassCard>

      {/* Social Links */}
      <GlassCard delay={0.3}>
        <div className="flex items-start gap-4 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center shadow-lg shrink-0">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">Social Links</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Connect your social profiles</p>
          </div>
        </div>
        <div className="ml-14 space-y-3">
          <div className="flex items-center gap-3">
            <Linkedin className="w-4 h-4 text-[#0A66C2] shrink-0" />
            <input
              type="url"
              value={socialLinkedin}
              onChange={(e) => setSocialLinkedin(e.target.value)}
              placeholder="linkedin.com/in/yourprofile"
              className="input-field"
            />
          </div>
          <div className="flex items-center gap-3">
            <Twitter className="w-4 h-4 text-[#1DA1F2] shrink-0" />
            <input
              type="text"
              value={socialTwitter}
              onChange={(e) => setSocialTwitter(e.target.value)}
              placeholder="@yourhandle"
              className="input-field"
            />
          </div>
          <div className="flex items-center gap-3">
            <Gamepad2 className="w-4 h-4 text-[#5865F2] shrink-0" />
            <input
              type="text"
              value={socialDiscord}
              onChange={(e) => setSocialDiscord(e.target.value)}
              placeholder="yourname#1234"
              className="input-field"
            />
          </div>
        </div>
      </GlassCard>

      {/* Sticky Save Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="sticky bottom-4 z-10"
      >
        <button
          onClick={handleSaveProfile}
          disabled={saving}
          className="w-full btn-primary py-3.5 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 shadow-xl shadow-rose-500/20 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save Profile Changes"}
        </button>
      </motion.div>
    </div>
  );
}
