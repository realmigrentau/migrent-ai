import { motion } from "framer-motion";
import {
  ArrowLeft,
  Phone,
  Video,
  MoreVertical,
  Pin,
  BellOff,
  Ban,
  Flag,
  Star,
  ExternalLink,
  Search,
  Info,
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

export default function ChatHeader({
  userName,
  userAvatar,
  userId,
  isOnline,
  isTyping,
  lastSeen,
  rating,
  listingTitle,
  onBack,
  onViewProfile,
  onPin,
  onMute,
  onBlock,
  onReport,
  isPinned,
  isMuted,
}: ChatHeaderProps) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Status text
  const getStatusText = () => {
    if (isTyping) return "typing...";
    if (isOnline) return "Online";
    if (lastSeen) return `Last seen ${lastSeen}`;
    return "Offline";
  };

  const getStatusColor = () => {
    if (isTyping) return "text-emerald-500";
    if (isOnline) return "text-emerald-500";
    return "text-slate-400 dark:text-slate-500";
  };

  return (
    <div className="sticky top-0 z-20 backdrop-blur-xl bg-white/90 dark:bg-slate-950/90 border-b border-slate-200/80 dark:border-slate-800/80 shadow-sm">
      <div className="px-3 py-2.5 flex items-center gap-2.5">
        {/* Back button */}
        <button
          onClick={onBack}
          className="p-1.5 -ml-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors lg:hidden"
        >
          <ArrowLeft className="w-5 h-5 text-slate-500" />
        </button>

        {/* User avatar + info (clickable) */}
        <button
          onClick={onViewProfile}
          className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-80 transition-opacity text-left"
        >
          <div className="relative shrink-0">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center overflow-hidden ring-2 ring-white dark:ring-slate-950 shadow-md ${
              userAvatar ? "bg-slate-200 dark:bg-slate-700" : "bg-gradient-to-br from-indigo-500 to-emerald-500"
            }`}>
              {userAvatar ? (
                <img src={userAvatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-base font-bold text-white">
                  {userName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            {isOnline && (
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-950 shadow-sm" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-slate-900 dark:text-white truncate text-[15px]">
                {userName}
              </h2>
              {rating && (
                <span className="flex items-center gap-0.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-1.5 py-0.5 rounded-full shrink-0">
                  <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                  {rating}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <p className={`text-[11px] font-medium ${getStatusColor()}`}>
                {isTyping && (
                  <span className="inline-flex items-center gap-1">
                    <span className="typing-dots">
                      <span className="dot" />
                      <span className="dot" />
                      <span className="dot" />
                    </span>
                    typing...
                  </span>
                )}
                {!isTyping && getStatusText()}
              </p>
              {listingTitle && (
                <>
                  <span className="text-slate-300 dark:text-slate-600">|</span>
                  <span className="text-[11px] text-indigo-500 dark:text-indigo-400 font-medium truncate">
                    {listingTitle}
                  </span>
                </>
              )}
            </div>
          </div>
        </button>

        {/* Action buttons */}
        <div className="flex items-center gap-0.5 shrink-0">
          <button
            onClick={onViewProfile}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            title="View profile"
          >
            <Info className="w-4.5 h-4.5" />
          </button>

          {/* More menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className={`p-2 rounded-xl transition-colors ${
                showMenu
                  ? "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              }`}
            >
              <MoreVertical className="w-4.5 h-4.5" />
            </button>

            {showMenu && (
              <motion.div
                initial={{ opacity: 0, y: 4, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="absolute right-0 top-full mt-1 w-52 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl z-50 overflow-hidden py-1"
              >
                {onViewProfile && (
                  <MenuButton
                    icon={<ExternalLink className="w-4 h-4" />}
                    label="View Profile"
                    onClick={() => { onViewProfile(); setShowMenu(false); }}
                  />
                )}
                {onPin && (
                  <MenuButton
                    icon={<Pin className="w-4 h-4" />}
                    label={isPinned ? "Unpin Chat" : "Pin Chat"}
                    onClick={() => { onPin(); setShowMenu(false); }}
                  />
                )}
                {onMute && (
                  <MenuButton
                    icon={<BellOff className="w-4 h-4" />}
                    label={isMuted ? "Unmute" : "Mute Notifications"}
                    onClick={() => { onMute(); setShowMenu(false); }}
                  />
                )}
                <div className="my-1 h-px bg-slate-100 dark:bg-slate-700" />
                {onBlock && (
                  <MenuButton
                    icon={<Ban className="w-4 h-4" />}
                    label="Block User"
                    onClick={() => { onBlock(); setShowMenu(false); }}
                    danger
                  />
                )}
                {onReport && (
                  <MenuButton
                    icon={<Flag className="w-4 h-4" />}
                    label="Report"
                    onClick={() => { onReport(); setShowMenu(false); }}
                    danger
                  />
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── MenuButton ──────────────────────────────────────────────
function MenuButton({
  icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
        danger
          ? "text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
          : "text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
