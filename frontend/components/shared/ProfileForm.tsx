import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Camera, Pen, Wand2, Globe, Linkedin, Twitter,
  Gamepad2, Heart, X, Plus, Save, Briefcase,
} from "lucide-react";
import type { Profile } from "../../hooks/useProfile";

interface ProfileFormProps {
  profile: Profile | null;
  saving: boolean;
  onSave: (data: Record<string, any>) => Promise<boolean>;
  onUploadPhoto: (file: File) => Promise<string | null>;
  showMessage?: (text: string, type: "success" | "error" | "info") => void;
  /** Show the seeker-specific fields (budget, visa, lifestyle) */
  seekerMode?: boolean;
}

const INTEREST_OPTIONS = [
  "Travel", "Tech", "AI", "Music", "Cooking", "Fitness", "Gaming",
  "Photography", "Reading", "Surfing", "Yoga", "Hiking", "Art",
  "Movies", "Fashion", "Coffee", "Sustainability", "Languages",
  "Startups", "Design", "Sports", "Meditation", "Dance",
];

const LIFESTYLE_OPTIONS = [
  "Quiet", "Non-smoker", "Early riser", "Night owl", "Clean & tidy",
  "Social", "Student", "Professional", "No pets", "Pet-friendly",
  "Vegetarian/Vegan", "LGBTQ+ friendly",
];

export default function ProfileForm({
  profile,
  saving,
  onSave,
  onUploadPhoto,
  showMessage,
  seekerMode = false,
}: ProfileFormProps) {
  const [aboutMe, setAboutMe] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [mostUselessSkill, setMostUselessSkill] = useState("");
  const [socialTwitter, setSocialTwitter] = useState("");
  const [socialLinkedin, setSocialLinkedin] = useState("");
  const [socialDiscord, setSocialDiscord] = useState("");
  const [occupation, setOccupation] = useState("");
  const [lifestyle, setLifestyle] = useState<string[]>([]);
  const [bio, setBio] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [showInterestsModal, setShowInterestsModal] = useState(false);
  const [showLifestyleModal, setShowLifestyleModal] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync form state from profile when it loads
  useEffect(() => {
    if (!profile) return;
    setAboutMe(profile.about_me || profile.bio || "");
    setInterests(profile.interests || []);
    setMostUselessSkill(profile.most_useless_skill || "");
    setSocialTwitter(profile.social_twitter || "");
    setSocialLinkedin(profile.social_linkedin || "");
    setSocialDiscord(profile.social_discord || "");
    setOccupation(profile.occupation || "");
    setLifestyle(profile.lifestyle || []);
    setBio(profile.bio || profile.about_me || "");
  }, [profile]);

  // Track changes
  useEffect(() => {
    if (!profile) return;
    const changed =
      aboutMe !== (profile.about_me || profile.bio || "") ||
      JSON.stringify(interests) !== JSON.stringify(profile.interests || []) ||
      mostUselessSkill !== (profile.most_useless_skill || "") ||
      socialTwitter !== (profile.social_twitter || "") ||
      socialLinkedin !== (profile.social_linkedin || "") ||
      socialDiscord !== (profile.social_discord || "") ||
      occupation !== (profile.occupation || "") ||
      JSON.stringify(lifestyle) !== JSON.stringify(profile.lifestyle || "") ||
      bio !== (profile.bio || profile.about_me || "");
    setHasChanges(changed);
  }, [profile, aboutMe, interests, mostUselessSkill, socialTwitter, socialLinkedin, socialDiscord, occupation, lifestyle, bio]);

  const handlePhotoSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
      const url = await onUploadPhoto(file);
      if (url) {
        showMessage?.("Photo updated!", "success");
      } else {
        showMessage?.("Failed to upload photo", "error");
      }
    },
    [onUploadPhoto, showMessage]
  );

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const toggleLifestyle = (item: string) => {
    setLifestyle((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleSave = async () => {
    const data: Record<string, any> = {};
    if (aboutMe !== (profile?.about_me || "")) data.about_me = aboutMe;
    if (bio !== (profile?.bio || "")) data.bio = bio;
    if (JSON.stringify(interests) !== JSON.stringify(profile?.interests || [])) data.interests = interests;
    if (mostUselessSkill !== (profile?.most_useless_skill || "")) data.most_useless_skill = mostUselessSkill;
    if (socialTwitter !== (profile?.social_twitter || "")) data.social_twitter = socialTwitter;
    if (socialLinkedin !== (profile?.social_linkedin || "")) data.social_linkedin = socialLinkedin;
    if (socialDiscord !== (profile?.social_discord || "")) data.social_discord = socialDiscord;
    if (occupation !== (profile?.occupation || "")) data.occupation = occupation;
    if (seekerMode && JSON.stringify(lifestyle) !== JSON.stringify(profile?.lifestyle || [])) data.lifestyle = lifestyle;

    if (Object.keys(data).length === 0) {
      showMessage?.("No changes to save", "info");
      return;
    }

    const ok = await onSave(data);
    if (ok) {
      showMessage?.("Profile saved!", "success");
      setHasChanges(false);
    } else {
      showMessage?.("Failed to save changes", "error");
    }
  };

  const avatarUrl = photoPreview || profile?.custom_pfp;

  return (
    <div className="space-y-6">
      {/* Profile Photo & Name */}
      <div className="card p-5 rounded-2xl">
        <div className="flex flex-col sm:flex-row items-center gap-5">
          <div className="relative group">
            <div className="w-24 h-24 rounded-2xl overflow-hidden bg-[var(--color-primary-soft)] from-[var(--color-primary)] to-[var(--color-primary)] shadow-xl">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-10 h-10 text-white/80" />
                </div>
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[var(--color-surface-2)] border-2 border-white dark:border-slate-900 shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
            >
              <Camera className="w-4 h-4 text-[var(--color-ink-2)]" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoSelect}
              className="hidden"
            />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-xl font-bold text-[var(--color-ink)]">
              {profile?.preferred_name || profile?.legal_name || profile?.name || "Your Name"}
            </h2>
            {profile?.legal_name && profile.legal_name !== profile.preferred_name && (
              <p className="text-sm text-[var(--color-ink-3)]">
                Legal: {profile.legal_name}
              </p>
            )}
            <p className="text-xs text-[var(--color-ink-3)] mt-1">
              Name is set during onboarding
            </p>
          </div>
        </div>
      </div>

      {/* About Me */}
      <div className="card p-5 rounded-2xl">
        <div className="flex items-start gap-4 mb-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-soft)] from-[var(--color-primary)] to-[var(--color-primary)] flex items-center justify-center shadow-lg shrink-0">
            <Pen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-[var(--color-ink)]">About Me</h3>
            <p className="text-xs text-[var(--color-ink-3)]">Tell others about yourself</p>
          </div>
        </div>
        <div className="ml-14">
          <textarea
            value={aboutMe}
            onChange={(e) => setAboutMe(e.target.value)}
            placeholder="Tell potential housemates about yourself..."
            rows={4}
            maxLength={500}
            className="input-field resize-none"
          />
          <div className="flex justify-between mt-1.5">
            <p className="text-[10px] text-[var(--color-ink-3)]">Markdown supported</p>
            <p className="text-[10px] text-[var(--color-ink-3)]">{aboutMe.length}/500</p>
          </div>
        </div>
      </div>

      {/* Occupation */}
      <div className="card p-5 rounded-2xl">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-soft)] from-cyan-400 to-[var(--color-primary)] flex items-center justify-center shadow-lg shrink-0">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-[var(--color-ink)]">Occupation</h3>
            <p className="text-xs text-[var(--color-ink-3)] mb-2">What do you do?</p>
            <input
              type="text"
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
              placeholder="e.g. Software Engineer, Student, Nurse"
              maxLength={100}
              className="input-field"
            />
          </div>
        </div>
      </div>

      {/* Interests */}
      <div className="card p-5 rounded-2xl">
        <div className="flex items-start gap-4 mb-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-soft)] from-[var(--color-accent)] to-[var(--color-primary)] flex items-center justify-center shadow-lg shrink-0">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-[var(--color-ink)]">Interests</h3>
                <p className="text-xs text-[var(--color-ink-3)]">Help us find your perfect match</p>
              </div>
              <button
                onClick={() => setShowInterestsModal(true)}
                className="flex items-center gap-1 text-xs text-[var(--color-primary)] hover:text-[var(--color-primary)] font-medium"
              >
                <Plus className="w-3.5 h-3.5" /> Edit
              </button>
            </div>
          </div>
        </div>
        <div className="ml-14 flex flex-wrap gap-2">
          {interests.length > 0 ? (
            interests.map((interest) => (
              <span
                key={interest}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-[var(--color-primary)] from-[var(--color-primary-soft)] to-[var(--color-primary-50)] dark:from-[var(--color-primary)]/10 dark:to-[var(--color-primary)]/10 text-[var(--color-primary)] dark:text-[var(--color-primary)] border border-[var(--color-primary-soft)] dark:border-[var(--color-primary-soft)]"
              >
                {interest}
                <button onClick={() => toggleInterest(interest)} className="hover:text-rose-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))
          ) : (
            <p className="text-sm text-[var(--color-ink-3)] italic">No interests added yet</p>
          )}
        </div>
      </div>

      {/* Lifestyle - seeker only */}
      {seekerMode && (
        <div className="card p-5 rounded-2xl">
          <div className="flex items-start gap-4 mb-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-soft)] from-[var(--color-warn-500)] to-[var(--color-warn-500)] flex items-center justify-center shadow-lg shrink-0">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-[var(--color-ink)]">Lifestyle</h3>
                  <p className="text-xs text-[var(--color-ink-3)]">Help owners know what to expect</p>
                </div>
                <button
                  onClick={() => setShowLifestyleModal(true)}
                  className="flex items-center gap-1 text-xs text-[var(--color-primary)] hover:text-[var(--color-primary)] font-medium"
                >
                  <Plus className="w-3.5 h-3.5" /> Edit
                </button>
              </div>
            </div>
          </div>
          <div className="ml-14 flex flex-wrap gap-2">
            {lifestyle.length > 0 ? (
              lifestyle.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-[var(--color-primary)] from-[var(--color-warn-50)] to-[var(--color-warn-50)] dark:from-[var(--color-warn-500)]/10 dark:to-[var(--color-warn-500)]/10 text-[var(--color-warn-600)] dark:text-[var(--color-warn-500)] border border-[var(--color-line-2)] dark:border-[var(--color-warn-500)]/20"
                >
                  {item}
                  <button onClick={() => toggleLifestyle(item)} className="hover:text-[var(--color-warn-600)]">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))
            ) : (
              <p className="text-sm text-[var(--color-ink-3)] italic">No lifestyle tags added yet</p>
            )}
          </div>
        </div>
      )}

      {/* Most Useless Skill */}
      <div className="card p-5 rounded-2xl">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-soft)] from-yellow-400 to-[var(--color-warn-500)] flex items-center justify-center shadow-lg shrink-0">
            <Wand2 className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-[var(--color-ink)]">Most Useless Skill</h3>
            <p className="text-xs text-[var(--color-ink-3)] mb-2">The sillier the better</p>
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
      </div>

      {/* Social Links */}
      <div className="card p-5 rounded-2xl">
        <div className="flex items-start gap-4 mb-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-soft)] from-sky-400 to-[var(--color-primary)] flex items-center justify-center shadow-lg shrink-0">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-[var(--color-ink)]">Social Links</h3>
            <p className="text-xs text-[var(--color-ink-3)]">Connect your social profiles</p>
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
      </div>

      {/* Unsaved Changes Bar + Save Button */}
      <div className="sticky bottom-4 z-10">
        {hasChanges && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-2 text-center"
          >
            <span className="text-xs text-[var(--color-warn-600)] dark:text-[var(--color-warn-500)] bg-[var(--color-warn-50)] dark:bg-[var(--color-warn-500)]/10 px-3 py-1 rounded-full border border-[var(--color-line-2)] dark:border-[var(--color-warn-500)]/20">
              You have unsaved changes
            </span>
          </motion.div>
        )}
        <button
          onClick={handleSave}
          disabled={saving || !hasChanges}
          className="w-full btn-primary py-3.5 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 shadow-xl shadow-[var(--color-primary)]/20 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save Profile Changes"}
        </button>
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
              <div className="backdrop-blur-xl bg-white/95 dark:bg-[var(--color-surface)]/95 rounded-2xl shadow-2xl border border-white/20 dark:border-[var(--color-line)]/50 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-[var(--color-ink)]">Select Interests</h3>
                  <button onClick={() => setShowInterestsModal(false)} className="p-1.5 rounded-lg hover:bg-[var(--color-surface-muted)]">
                    <X className="w-4 h-4 text-[var(--color-ink-3)]" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 max-h-[40vh] overflow-y-auto">
                  {INTEREST_OPTIONS.map((opt) => {
                    const selected = interests.includes(opt);
                    return (
                      <button
                        key={opt}
                        onClick={() => toggleInterest(opt)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                          selected
                            ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-md"
                            : "bg-[var(--color-surface-2)] text-[var(--color-ink-2)] border-[var(--color-line)] hover:border-[var(--color-line-2)] dark:hover:border-[var(--color-primary)]/30"
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-[var(--color-ink-3)] mt-3">{interests.length} selected</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Lifestyle Modal */}
      <AnimatePresence>
        {showLifestyleModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLifestyleModal(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-x-4 top-[15%] sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[480px] z-50"
            >
              <div className="backdrop-blur-xl bg-white/95 dark:bg-[var(--color-surface)]/95 rounded-2xl shadow-2xl border border-white/20 dark:border-[var(--color-line)]/50 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-[var(--color-ink)]">Select Lifestyle Tags</h3>
                  <button onClick={() => setShowLifestyleModal(false)} className="p-1.5 rounded-lg hover:bg-[var(--color-surface-muted)]">
                    <X className="w-4 h-4 text-[var(--color-ink-3)]" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 max-h-[40vh] overflow-y-auto">
                  {LIFESTYLE_OPTIONS.map((opt) => {
                    const selected = lifestyle.includes(opt);
                    return (
                      <button
                        key={opt}
                        onClick={() => toggleLifestyle(opt)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                          selected
                            ? "bg-[var(--color-warn-500)] text-white border-amber-500 shadow-md"
                            : "bg-[var(--color-surface-2)] text-[var(--color-ink-2)] border-[var(--color-line)] hover:border-amber-300 dark:hover:border-amber-500/30"
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-[var(--color-ink-3)] mt-3">{lifestyle.length} selected</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
