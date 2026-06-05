import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { Thread, formatMessageTime } from "../../hooks/useMessages";

interface ConversationListProps {
  threads: Thread[];
  loading: boolean;
  totalUnread: number;
  activeThreadId?: string;
  onSelectThread: (thread: Thread) => void;
  onNewMessage?: () => void;
}

type ChipKey = "all" | "hosts" | "support";

const CHIPS: { key: ChipKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "hosts", label: "Hosts" },
  { key: "support", label: "Support" },
];

// Tone palette for placeholder avatar tints (matches design's Avatar tones)
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

export default function ConversationList({
  threads,
  loading,
  totalUnread,
  activeThreadId,
  onSelectThread,
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [chip, setChip] = useState<ChipKey>("all");

  const filteredThreads = useMemo(() => {
    let result = threads;

    if (chip === "support") {
      result = result.filter(
        (t) =>
          /support|migrent/i.test(t.other_user_name || "") ||
          t.folder === "verification"
      );
    } else if (chip === "hosts") {
      result = result.filter(
        (t) => !/support|migrent/i.test(t.other_user_name || "")
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          (t.other_user_name || "").toLowerCase().includes(q) ||
          (t.last_message || "").toLowerCase().includes(q) ||
          (t.listing_title || "").toLowerCase().includes(q)
      );
    }

    return [...result].sort((a, b) => {
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      return 0;
    });
  }, [threads, chip, searchQuery]);

  return (
    <div className="flex flex-col h-full bg-[var(--color-surface)]">
      {/* Header */}
      <div className="px-4 pt-5 pb-3">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[22px] font-bold tracking-[-0.012em] text-[var(--color-ink)]">
            Inbox
          </h2>
          {totalUnread > 0 && (
            <span className="inline-flex items-center h-[22px] px-2 rounded-full text-[11.5px] font-semibold bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
              {totalUnread} new
            </span>
          )}
        </div>

        {/* Search */}
        <label className="block">
          <div className="flex items-center gap-2 h-9 px-3 bg-[var(--color-surface-2)] border border-[var(--color-line)] rounded-[10px] focus-within:border-[var(--color-ink)] transition-colors">
            <Search className="w-[14px] h-[14px] text-[var(--color-ink-3)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search messages"
              className="flex-1 bg-transparent outline-none border-none text-[13px] text-[var(--color-ink)] placeholder:text-[var(--color-ink-4)] p-0"
            />
          </div>
        </label>

        {/* Chips */}
        <div className="flex gap-1 mt-3">
          {CHIPS.map((c) => {
            const active = chip === c.key;
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => setChip(c.key)}
                className={`inline-flex items-center h-[26px] px-2.5 rounded-full text-[12px] font-medium border transition-colors ${
                  active
                    ? "bg-[var(--color-ink)] text-[var(--color-bg)] border-[var(--color-ink)]"
                    : "bg-[var(--color-surface-2)] text-[var(--color-ink-2)] border-[var(--color-line)] hover:border-[var(--color-line-2)]"
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Thread list */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="px-4 py-3 grid grid-cols-[40px_1fr] gap-3">
                <div className="w-10 h-10 rounded-full shimmer" />
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="w-24 h-3 shimmer rounded" />
                    <div className="w-10 h-3 shimmer rounded" />
                  </div>
                  <div className="w-32 h-2.5 shimmer rounded" />
                  <div className="w-40 h-3 shimmer rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredThreads.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-8 py-16 text-[var(--color-ink-3)]">
            <div className="font-mono text-[11px] uppercase tracking-[0.08em] mb-1.5">
              Empty
            </div>
            <div className="text-[13.5px] text-[var(--color-ink-2)]">
              {searchQuery ? `Nothing matching "${searchQuery}"` : "No conversations yet"}
            </div>
          </div>
        ) : (
          <div>
            {filteredThreads.map((thread) => (
              <ThreadItem
                key={`${thread.listing_id || "direct"}-${thread.other_user_id}`}
                thread={thread}
                isActive={activeThreadId === thread.other_user_id}
                onClick={() => onSelectThread(thread)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ThreadItem({
  thread,
  isActive,
  onClick,
}: {
  thread: Thread;
  isActive: boolean;
  onClick: () => void;
}) {
  const unread = thread.unread_count > 0;
  const [bg, fg] = avatarFor(thread.other_user_name || "U");
  const initial = (thread.other_user_name || "U").charAt(0).toUpperCase();
  const isSupport = /support|migrent/i.test(thread.other_user_name || "");
  const listingLine = thread.listing_title
    ? `${thread.listing_title}${thread.listing_id ? ` · MR-${String(thread.listing_id).slice(-4)}` : ""}`
    : isSupport
    ? "Verification · ID upload"
    : "Direct message";
  const status = isSupport
    ? "Support"
    : unread
    ? "New"
    : thread.is_pinned
    ? "Pinned"
    : "Open";
  const statusTone = isSupport
    ? "bg-[#dde4ec] dark:bg-[#182230] text-[var(--color-info-500)]"
    : unread
    ? "bg-[var(--color-primary-soft)] text-[var(--color-primary)]"
    : "bg-[var(--color-surface-sunk)] text-[var(--color-ink-2)] border border-[var(--color-line)]";

  return (
    <button
      onClick={onClick}
      className={`w-full grid grid-cols-[40px_1fr] gap-3 px-4 py-3 text-left transition-colors ${
        isActive
          ? "bg-[var(--color-surface-sunk)]"
          : "hover:bg-[var(--color-surface-sunk)]"
      }`}
      style={{
        borderLeft: `3px solid ${isActive ? "var(--color-ink)" : "transparent"}`,
      }}
    >
      {/* Avatar */}
      <div className="relative">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden"
          style={{ background: thread.other_user_pfp ? "var(--color-surface-sunk)" : bg, color: fg }}
        >
          {thread.other_user_pfp ? (
            <img src={thread.other_user_pfp} alt={`${thread.other_user_name || "Conversation partner"} profile photo`} className="w-full h-full object-cover" />
          ) : (
            <span className="font-bold text-[14px]">{initial}</span>
          )}
        </div>
        {/* Verified check */}
        {!isSupport && (
          <span
            className="absolute -right-0.5 -bottom-0.5 w-[14px] h-[14px] rounded-full flex items-center justify-center text-[var(--color-accent-fg)]"
            style={{ background: "var(--color-accent)", border: "2px solid var(--color-surface)" }}
          >
            <svg width="8" height="8" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="m4.5 10.5 3.5 3.5 7.5-7.5" />
            </svg>
          </span>
        )}
      </div>

      {/* Content */}
      <div className="min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span
            className={`text-[13.5px] truncate ${
              unread ? "font-bold text-[var(--color-ink)]" : "font-semibold text-[var(--color-ink)]"
            }`}
          >
            {thread.other_user_name}
          </span>
          <span className="text-[11px] text-[var(--color-ink-3)] shrink-0 font-mono">
            {formatMessageTime(thread.last_message_at)}
          </span>
        </div>

        <div className="text-[11px] text-[var(--color-ink-3)] mt-0.5 truncate font-mono">
          {listingLine}
        </div>

        <div
          className={`text-[12.5px] mt-1 truncate ${
            unread ? "text-[var(--color-ink-2)] font-medium" : "text-[var(--color-ink-3)]"
          }`}
        >
          {thread.last_message}
        </div>

        <div className="flex items-center gap-1.5 mt-1.5">
          <motion.span
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`inline-flex items-center h-[18px] px-1.5 rounded-full text-[10.5px] font-semibold ${statusTone}`}
          >
            {status}
          </motion.span>
          {unread && (
            <span className="ml-auto inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10.5px] font-bold text-[var(--color-primary-fg)] bg-[var(--color-primary)] tabular-nums">
              {thread.unread_count}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
