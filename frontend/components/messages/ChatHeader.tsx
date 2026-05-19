import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  MoreHorizontal,
  Calendar,
  Pin,
  BellOff,
  Flag,
  ExternalLink,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface ChatHeaderProps {
  userName: string;
  userAvatar?: string;
  userId?: string;
  isOnline?: boolean;
  isTyping?: boolean;
  lastSeen?: string;
  rating?: number;
  listingTitle?: string;
  onBack: () => void;
  onViewProfile?: () => void;
  onPin?: () => void;
  onMute?: () => void;
  onBlock?: () => void;
  onReport?: () => void;
  isPinned?: boolean;
  isMuted?: boolean;
}

const AVATAR_TONES = [
  ["#dfe8e0", "#2d6a4f"],
  ["#e2e7ee", "#0e2237"],
  ["#f4e4cf", "#7a4a1a"],
  ["#f1d8d4", "#7a2a25"],
  ["#e8e2d4", "#44494f"],
];

function avatarFor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffffff;
  return AVATAR_TONES[Math.abs(h) % AVATAR_TONES.length];
}

export default function ChatHeader({
  userName,
  userAvatar,
  isOnline,
  isTyping,
  listingTitle,
  onBack,
  onViewProfile,
  onPin,
  onMute,
  onReport,
  isPinned,
  isMuted,
}: ChatHeaderProps) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [bg, fg] = avatarFor(userName || "U");
  const initial = (userName || "U").charAt(0).toUpperCase();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="bg-[var(--color-surface)] border-b border-[var(--color-line)]">
      <div className="px-6 py-4 flex items-center gap-3">
        {/* Back button (mobile) */}
        <button
          onClick={onBack}
          className="p-1.5 -ml-1 rounded-[6px] hover:bg-[var(--color-surface-sunk)] transition-colors lg:hidden"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5 text-[var(--color-ink-2)]" />
        </button>

        {/* Avatar + name + meta */}
        <button
          onClick={onViewProfile}
          className="flex items-center gap-3 flex-1 min-w-0 text-left"
        >
          <div className="relative shrink-0">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center overflow-hidden"
              style={{ background: userAvatar ? "var(--color-surface-sunk)" : bg, color: fg }}
            >
              {userAvatar ? (
                <img src={userAvatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="font-bold text-[13px]">{initial}</span>
              )}
            </div>
            <span
              className="absolute -right-0.5 -bottom-0.5 w-[14px] h-[14px] rounded-full flex items-center justify-center text-[var(--color-accent-fg)]"
              style={{
                background: "var(--color-accent)",
                border: "2px solid var(--color-surface)",
              }}
            >
              <svg width="8" height="8" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="m4.5 10.5 3.5 3.5 7.5-7.5" />
              </svg>
            </span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[15px] font-bold text-[var(--color-ink)] truncate">
                {userName}
              </span>
              <span className="inline-flex items-center gap-1 h-[18px] px-1.5 rounded-full text-[10.5px] font-semibold bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
                <svg width="9" height="9" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m4.5 10.5 3.5 3.5 7.5-7.5" />
                </svg>
                Verified
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5 text-[12px] text-[var(--color-ink-3)]">
              {listingTitle && (
                <>
                  <span className="font-mono truncate max-w-[300px]">{listingTitle}</span>
                  <span>·</span>
                </>
              )}
              <span className="inline-flex items-center gap-1">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    background: isOnline || isTyping ? "var(--color-accent)" : "var(--color-ink-4)",
                  }}
                />
                {isTyping ? "Typing..." : isOnline ? "Online · replies in ~2h" : "Replies in ~2h"}
              </span>
            </div>
          </div>
        </button>

        {/* Schedule tour button */}
        <button
          type="button"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 h-9 rounded-[8px] text-[13px] font-semibold text-[var(--color-ink)] hover:bg-[var(--color-surface-sunk)] transition-colors"
        >
          <Calendar className="w-3.5 h-3.5" /> Schedule tour
        </button>

        {/* More menu */}
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="w-9 h-9 inline-flex items-center justify-center rounded-[8px] text-[var(--color-ink-2)] hover:bg-[var(--color-surface-sunk)] transition-colors"
            aria-label="More"
          >
            <MoreHorizontal className="w-[18px] h-[18px]" />
          </button>
          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.97 }}
                transition={{ duration: 0.12 }}
                className="absolute right-0 mt-1.5 w-48 rounded-[10px] bg-[var(--color-surface-2)] border border-[var(--color-line)] shadow-[var(--shadow-pop)] overflow-hidden z-50"
              >
                {onPin && (
                  <button
                    onClick={() => { onPin(); setShowMenu(false); }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] text-[var(--color-ink-2)] hover:bg-[var(--color-surface-sunk)] hover:text-[var(--color-ink)] transition-colors"
                  >
                    <Pin className="w-3.5 h-3.5" />
                    {isPinned ? "Unpin conversation" : "Pin conversation"}
                  </button>
                )}
                {onMute && (
                  <button
                    onClick={() => { onMute(); setShowMenu(false); }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] text-[var(--color-ink-2)] hover:bg-[var(--color-surface-sunk)] hover:text-[var(--color-ink)] transition-colors"
                  >
                    <BellOff className="w-3.5 h-3.5" />
                    {isMuted ? "Unmute" : "Mute notifications"}
                  </button>
                )}
                {onViewProfile && (
                  <button
                    onClick={() => { onViewProfile(); setShowMenu(false); }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] text-[var(--color-ink-2)] hover:bg-[var(--color-surface-sunk)] hover:text-[var(--color-ink)] transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    View profile
                  </button>
                )}
                {onReport && (
                  <button
                    onClick={() => { onReport(); setShowMenu(false); }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] text-[var(--color-danger-500)] hover:bg-[var(--color-surface-sunk)] transition-colors border-t border-[var(--color-line)]"
                  >
                    <Flag className="w-3.5 h-3.5" />
                    Report
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
