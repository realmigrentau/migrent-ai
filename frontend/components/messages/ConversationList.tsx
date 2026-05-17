import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  MessageSquarePlus,
  Archive,
  CheckCheck,
  Inbox,
  ShieldCheck,
  AlertTriangle,
  Pin,
  Filter,
} from "lucide-react";
import { Thread, formatMessageTime } from "../../hooks/useMessages";

// ── Folder tabs ─────────────────────────────────────────────
const FOLDERS = [
  { key: "active", label: "Active", icon: Inbox },
  { key: "archived", label: "Archived", icon: Archive },
  { key: "verification", label: "Verification", icon: ShieldCheck },
] as const;

type FolderKey = (typeof FOLDERS)[number]["key"];

interface ConversationListProps {
  threads: Thread[];
  loading: boolean;
  totalUnread: number;
  activeThreadId?: string;
  onSelectThread: (thread: Thread) => void;
  onNewMessage?: () => void;
}

export default function ConversationList({
  threads,
  loading,
  totalUnread,
  activeThreadId,
  onSelectThread,
  onNewMessage,
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [activeFolder, setActiveFolder] = useState<FolderKey>("active");

  // Filter + search
  const filteredThreads = useMemo(() => {
    let result = threads.filter((t) => (t.folder || "active") === activeFolder);

    if (filter === "unread") {
      result = result.filter((t) => t.unread_count > 0);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.other_user_name.toLowerCase().includes(q) ||
          t.last_message.toLowerCase().includes(q) ||
          (t.listing_title && t.listing_title.toLowerCase().includes(q))
      );
    }

    // Pinned threads first
    return result.sort((a, b) => {
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      return 0;
    });
  }, [threads, filter, searchQuery, activeFolder]);

  const unreadCount = threads.filter((t) => t.unread_count > 0).length;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950">
      {/* ── Header ── */}
      <div className="px-4 pt-5 pb-3">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
              Messages
            </h1>
            {totalUnread > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary)] text-white shadow-lg shadow-[var(--color-primary)]/20"
              >
                {totalUnread}
              </motion.span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className={`p-2 rounded-xl transition-all ${
                showSearch
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
              }`}
            >
              <Search className="w-4.5 h-4.5" />
            </button>
            {onNewMessage && (
              <button
                onClick={onNewMessage}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
              >
                <MessageSquarePlus className="w-4.5 h-4.5" />
              </button>
            )}
          </div>
        </div>

        {/* ── Search bar ── */}
        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="relative mb-3">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search conversations, messages..."
                  autoFocus
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-[var(--color-ink)]/30 focus:border-transparent outline-none transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Folder tabs ── */}
        <div className="flex items-center gap-1 mb-3 overflow-x-auto scrollbar-hide">
          {FOLDERS.map((folder) => {
            const Icon = folder.icon;
            const count = folder.key === "active"
              ? threads.filter((t) => (t.folder || "active") === "active").length
              : threads.filter((t) => t.folder === folder.key).length;

            return (
              <button
                key={folder.key}
                onClick={() => setActiveFolder(folder.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  activeFolder === folder.key
                    ? "bg-[var(--color-primary-soft)] dark:bg-[var(--color-primary)]/20 text-[var(--color-primary)] dark:text-[var(--color-primary)]"
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {folder.label}
                {count > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    activeFolder === folder.key
                      ? "bg-[var(--color-primary-soft)] dark:bg-[var(--color-primary)]/30 text-[var(--color-primary)] dark:text-[var(--color-primary)]"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Filter pills ── */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              filter === "all"
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              filter === "unread"
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            Unread
            {unreadCount > 0 && (
              <span
                className={`w-4.5 h-4.5 flex items-center justify-center rounded-full text-[9px] font-black ${
                  filter === "unread" ? "bg-white/20 dark:bg-slate-900/20" : "bg-[var(--color-primary)] text-white"
                }`}
              >
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ── Thread list ── */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="space-y-0">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="px-4 py-3.5 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full shimmer shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="w-24 h-3.5 shimmer rounded" />
                    <div className="w-12 h-3 shimmer rounded" />
                  </div>
                  <div className="w-40 h-3 shimmer rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredThreads.length === 0 ? (
          <EmptyState filter={filter} searchQuery={searchQuery} />
        ) : (
          <div>
            {filteredThreads.map((thread, i) => (
              <ThreadItem
                key={`${thread.listing_id || "direct"}-${thread.other_user_id}`}
                thread={thread}
                isActive={activeThreadId === thread.other_user_id}
                index={i}
                onClick={() => onSelectThread(thread)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Footer count ── */}
      {!loading && threads.length > 0 && (
        <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800/50">
          <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center">
            {filteredThreads.length === threads.length
              ? `${threads.length} conversation${threads.length !== 1 ? "s" : ""}`
              : `${filteredThreads.length} of ${threads.length}`}
          </p>
        </div>
      )}
    </div>
  );
}

// ── ThreadItem ──────────────────────────────────────────────
function ThreadItem({
  thread,
  isActive,
  index,
  onClick,
}: {
  thread: Thread;
  isActive: boolean;
  index: number;
  onClick: () => void;
}) {
  const hasUnread = thread.unread_count > 0;

  return (
    <motion.button
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.3) }}
      onClick={onClick}
      className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-all relative ${
        isActive
          ? "bg-[var(--color-primary-soft)] dark:bg-[var(--color-primary)]/10 border-r-3 border-[var(--color-primary)]"
          : hasUnread
          ? "bg-[var(--color-primary-soft)]/40 dark:bg-[var(--color-primary)]/5 hover:bg-slate-50 dark:hover:bg-slate-800/50"
          : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
      }`}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center overflow-hidden ring-2 ring-white dark:ring-slate-950 ${
          thread.other_user_pfp ? "bg-slate-200 dark:bg-slate-700" : "bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)]"
        }`}>
          {thread.other_user_pfp ? (
            <img src={thread.other_user_pfp} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-lg font-bold text-white">
              {(thread.other_user_name || "U").charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        {/* Online dot */}
        {thread.is_online && (
          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[var(--color-accent-soft)]0 border-2 border-white dark:border-slate-950" />
        )}
        {/* Unread badge */}
        {hasUnread && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary)] flex items-center justify-center shadow-lg shadow-[var(--color-primary)]/20"
          >
            <span className="text-[9px] font-black text-white">
              {thread.unread_count > 99 ? "99+" : thread.unread_count}
            </span>
          </motion.div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            {thread.is_pinned && <Pin className="w-3 h-3 text-amber-500 shrink-0" />}
            <p
              className={`text-[14px] truncate ${
                hasUnread
                  ? "font-bold text-slate-900 dark:text-white"
                  : "font-semibold text-slate-700 dark:text-slate-200"
              }`}
            >
              {thread.other_user_name}
            </p>
          </div>
          <span
            className={`text-[11px] shrink-0 ${
              hasUnread
                ? "font-bold text-[var(--color-primary)] dark:text-[var(--color-primary)]"
                : "text-slate-400 dark:text-slate-500"
            }`}
          >
            {formatMessageTime(thread.last_message_at)}
          </span>
        </div>

        {/* Last message preview */}
        <p
          className={`text-[12.5px] truncate mt-0.5 leading-snug ${
            hasUnread
              ? "text-slate-700 dark:text-slate-300 font-medium"
              : "text-slate-500 dark:text-slate-400"
          }`}
        >
          {thread.last_message}
        </p>

        {/* Listing badge */}
        {thread.listing_title && (
          <div className="flex items-center gap-1.5 mt-1">
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[var(--color-primary)] dark:text-[var(--color-primary)] bg-[var(--color-primary-soft)] dark:bg-[var(--color-primary)]/10 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] inline-block" />
              {thread.listing_title}
            </span>
          </div>
        )}
        {!thread.listing_title && thread.is_direct && (
          <div className="flex items-center gap-1.5 mt-1">
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[var(--color-accent)] dark:text-[var(--color-accent)] bg-[var(--color-accent-soft)] dark:bg-[var(--color-accent-soft)]0/10 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent-soft)]0 inline-block" />
              Direct
            </span>
          </div>
        )}
      </div>

      {/* Listing thumbnail */}
      {thread.listing_image && (
        <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 ring-1 ring-slate-200 dark:ring-slate-700">
          <img src={thread.listing_image} alt="" className="w-full h-full object-cover" />
        </div>
      )}
    </motion.button>
  );
}

// ── EmptyState ──────────────────────────────────────────────
function EmptyState({
  filter,
  searchQuery,
}: {
  filter: "all" | "unread";
  searchQuery: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-8 py-16">
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--color-primary-soft)] to-[var(--color-accent-soft)] dark:from-[var(--color-primary)]/10 dark:to-[var(--color-accent)]/10 flex items-center justify-center mb-5 rotate-3">
        {filter === "unread" ? (
          <CheckCheck className="w-8 h-8 text-[var(--color-accent)]" />
        ) : searchQuery ? (
          <Search className="w-8 h-8 text-[var(--color-primary)]" />
        ) : (
          <MessageSquarePlus className="w-8 h-8 text-[var(--color-primary)]" />
        )}
      </div>
      <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">
        {filter === "unread"
          ? "All caught up!"
          : searchQuery
          ? "No results"
          : "No conversations yet"}
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-[240px]">
        {filter === "unread"
          ? "No unread messages. You're a messaging pro!"
          : searchQuery
          ? `Nothing matching "${searchQuery}"`
          : "Start a conversation from a listing or profile."}
      </p>
    </div>
  );
}
