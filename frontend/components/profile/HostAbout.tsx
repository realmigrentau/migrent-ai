import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserProfile } from "../../hooks/useUserProfile";

interface HostAboutProps {
  profile: UserProfile;
}

const lifestyleIcons: Record<string, string> = {
  "Quiet": "🤫", "Non-smoker": "🚭", "Early riser": "🌅", "Night owl": "🦉",
  "Clean & tidy": "✨", "Social": "🎉", "Student": "📚", "Professional": "💼",
  "No pets": "🚫", "Pet-friendly": "🐾", "Vegetarian/Vegan": "🥗", "LGBTQ+ friendly": "🏳️‍🌈",
};

const interestIcons: Record<string, string> = {
  "Cooking": "🍳", "Gaming": "🎮", "Fitness": "💪", "Reading": "📖",
  "Music": "🎵", "Photography": "📷", "Travel": "✈️", "Art": "🎨",
  "Hiking": "🥾", "Movies": "🎬", "Coding": "💻", "Yoga": "🧘",
  "Sports": "⚽", "Dancing": "💃", "Gardening": "🌱", "Coffee": "☕",
};

export default function HostAbout({ profile }: HostAboutProps) {
  const [expanded, setExpanded] = useState(false);
  const displayName = profile.preferred_name || profile.name || "User";
  const bio = profile.about_me || profile.bio;
  const isLongBio = bio && bio.length > 300;

  return (
    <div className="space-y-6">
      {/* Greeting + Bio */}
      {bio && (
        <div>
          <h3 className="text-lg font-bold text-[var(--color-ink)] mb-3">
            About {displayName}
          </h3>
          <div className="relative">
            <p className={`text-[15px] text-[var(--color-ink-2)] leading-relaxed whitespace-pre-line ${
              !expanded && isLongBio ? "line-clamp-4" : ""
            }`}>
              {bio}
            </p>
            {isLongBio && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="mt-2 text-sm font-semibold text-[var(--color-ink)] underline underline-offset-4 hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] transition-colors"
              >
                {expanded ? "Show less" : "Read more"}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Quick info pills */}
      <div className="flex flex-wrap gap-2">
        {profile.occupation && (
          <InfoPill icon="💼" label={`My work: ${profile.occupation}`} />
        )}
        {profile.languages.length > 0 && (
          <InfoPill icon="🌐" label={`Speaks ${profile.languages.join(", ")}`} />
        )}
        {profile.location && (
          <InfoPill icon="📍" label={`Lives in ${profile.location}`} />
        )}
        {profile.member_since_label && (
          <InfoPill icon="📅" label={`Joined ${profile.member_since_label}`} />
        )}
      </div>

      {/* Useless skill */}
      {profile.most_useless_skill && (
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="flex items-start gap-3 p-4 rounded-2xl bg-[var(--color-primary-soft)] dark:bg-[var(--color-primary)]/10 border border-purple-100 dark:border-[var(--color-primary)]/20"
        >
          <span className="text-2xl">🎯</span>
          <div>
            <p className="text-xs font-semibold text-[var(--color-primary)] dark:text-[var(--color-primary)] uppercase tracking-wider">Most useless skill</p>
            <p className="text-sm text-primary-700 dark:text-purple-300 mt-0.5">{profile.most_useless_skill}</p>
          </div>
        </motion.div>
      )}

      {/* Lifestyle */}
      {profile.lifestyle.length > 0 && (
        <div>
          <h4 className="text-sm font-bold text-[var(--color-ink)] mb-2.5">Lifestyle</h4>
          <div className="flex flex-wrap gap-2">
            {profile.lifestyle.map((item) => (
              <span key={item} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-[var(--color-surface-muted)] text-[var(--color-ink-2)] border border-[var(--color-line)]">
                <span>{lifestyleIcons[item] || "•"}</span>
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Interests */}
      {profile.interests.length > 0 && (
        <div>
          <h4 className="text-sm font-bold text-[var(--color-ink)] mb-2.5">Interests</h4>
          <div className="flex flex-wrap gap-2">
            {profile.interests.map((item) => (
              <motion.span
                key={item}
                whileHover={{ scale: 1.05, y: -1 }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-[var(--color-primary-soft)] dark:bg-[var(--color-primary)]/10 text-[var(--color-primary)] dark:text-[var(--color-primary)] border border-[var(--color-primary-soft)] dark:border-[var(--color-primary-soft)] cursor-default"
              >
                <span>{interestIcons[item] || "•"}</span>
                {item}
              </motion.span>
            ))}
          </div>
        </div>
      )}

      {/* Social links */}
      {(profile.social_twitter || profile.social_facebook || profile.social_linkedin) && (
        <div>
          <h4 className="text-sm font-bold text-[var(--color-ink)] mb-2.5">Connect</h4>
          <div className="flex items-center gap-3">
            {profile.social_twitter && (
              <a href={profile.social_twitter} target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-line)] flex items-center justify-center text-[var(--color-ink-3)] hover:text-sky-500 hover:border-sky-200 dark:hover:border-sky-500/30 hover:scale-110 transition-all">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
              </a>
            )}
            {profile.social_facebook && (
              <a href={profile.social_facebook} target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-line)] flex items-center justify-center text-[var(--color-ink-3)] hover:text-[var(--color-primary)] hover:border-[var(--color-primary-100)] dark:hover:border-blue-500/30 hover:scale-110 transition-all">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
              </a>
            )}
            {profile.social_linkedin && (
              <a href={profile.social_linkedin} target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-line)] flex items-center justify-center text-[var(--color-ink-3)] hover:text-[var(--color-primary-700)] hover:border-[var(--color-primary-100)] dark:hover:border-blue-500/30 hover:scale-110 transition-all">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function InfoPill({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-line)]">
      <span className="text-base">{icon}</span>
      <span className="text-sm text-[var(--color-ink-2)]">{label}</span>
    </div>
  );
}
