import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../lib/supabase";

interface Thread {
  listing_id?: string;
  other_user_id: string;
  other_user_name: string;
  other_user_pfp?: string;
  last_message: string;
  last_message_at: string;
  unread_count: number;
  is_direct?: boolean;
  listing_title?: string;
  listing_image?: string;
}

export default function MessagesPage() {
  const { session, user, loading } = useAuth();
  const router = useRouter();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loadingThreads, setLoadingThreads] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    if (session && user?.id) fetchThreads();
  }, [session, user?.id]);

  const fetchThreads = async () => {
    if (!user?.id) return;
    setLoadingThreads(true);
    try {
      const { data: messages, error } = await supabase
        .from("messages")
        .select("*")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (error || !messages || messages.length === 0) {
        setThreads([]);
        return;
      }

      // Group into threads by other user
      const threadMap: Record<string, Thread> = {};
      for (const msg of messages) {
        const otherId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
        const key = `${msg.listing_id || "direct"}_${otherId}`;

        if (!threadMap[key]) {
          threadMap[key] = {
            listing_id: msg.listing_id,
            other_user_id: otherId,
            other_user_name: "User",
            other_user_pfp: undefined,
            last_message: msg.message_text,
            last_message_at: msg.created_at,
            unread_count: 0,
            is_direct: !msg.listing_id,
          };
        }
        if (msg.receiver_id === user.id && !msg.read_at) {
          threadMap[key].unread_count++;
        }
      }

      // Fetch names for all other users
      const otherIds = [...new Set(Object.values(threadMap).map((t) => t.other_user_id))];
      if (otherIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, name, preferred_name, custom_pfp")
          .in("id", otherIds);

        if (profiles) {
          const profileMap = Object.fromEntries(profiles.map((p: any) => [p.id, p]));
          for (const thread of Object.values(threadMap)) {
            const p = profileMap[thread.other_user_id];
            if (p) {
              thread.other_user_name = p.preferred_name || p.name || "User";
              thread.other_user_pfp = p.custom_pfp;
            }
          }
        }
      }

      // Fetch listing info for threads with listing_id
      const listingIds = [...new Set(
        Object.values(threadMap)
          .filter((t) => t.listing_id)
          .map((t) => t.listing_id!)
      )];
      if (listingIds.length > 0) {
        const { data: listings } = await supabase
          .from("listings")
          .select("id, title, images")
          .in("id", listingIds);

        if (listings) {
          const listingMap = Object.fromEntries(listings.map((l: any) => [l.id, l]));
          for (const thread of Object.values(threadMap)) {
            if (thread.listing_id) {
              const l = listingMap[thread.listing_id];
              if (l) {
                thread.listing_title = l.title;
                const imgs = Array.isArray(l.images) ? l.images : [];
                thread.listing_image = imgs[0] || undefined;
              }
            }
          }
        }
      }

      setThreads(Object.values(threadMap));
    } catch (err) {
      console.error("Failed to fetch threads:", err);
    } finally {
      setLoadingThreads(false);
    }
  };

  // Filtered threads
  const filteredThreads = useMemo(() => {
    let result = threads;
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
    return result;
  }, [threads, filter, searchQuery]);

  const handleThreadClick = (thread: Thread) => {
    router.push(`/account/messages/${thread.other_user_id}`);
  };

  if (loading) {
    return (
      <>
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-rose-300 dark:border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
        </div>
      </>
    );
  }

  if (!session) {
    return (
      <>
        <div className="max-w-md mx-auto px-4 py-20">
          <div className="card p-8 rounded-2xl text-center">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Sign in required</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Sign in to access messages.</p>
            <Link href="/signin" className="btn-primary py-3 px-6 rounded-xl text-sm inline-block">Sign in</Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* ── Header row ── */}
          <div className="flex items-center justify-between mb-5">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Messages
            </h1>
            <div className="flex items-center gap-1">
              {/* Search toggle */}
              <button
                onClick={() => setShowSearch(!showSearch)}
                className={`p-2.5 rounded-full transition-colors ${
                  showSearch
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                    : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                }`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </button>
              {/* Settings */}
              <button className="p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
          </div>

          {/* ── Search bar (animated) ── */}
          <AnimatePresence>
            {showSearch && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="relative mb-4">
                  <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search messages..."
                    autoFocus
                    className="w-full pl-10 pr-4 py-3 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Filter pills (All / Unread) ── */}
          <div className="flex items-center gap-2 mb-5">
            <button
              onClick={() => setFilter("all")}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                filter === "all"
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                filter === "unread"
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              Unread
              {threads.filter((t) => t.unread_count > 0).length > 0 && (
                <span className={`ml-1.5 w-5 h-5 inline-flex items-center justify-center rounded-full text-[10px] font-bold ${
                  filter === "unread" ? "bg-white/20 dark:bg-slate-900/20" : "bg-rose-500 text-white"
                }`}>
                  {threads.filter((t) => t.unread_count > 0).length}
                </span>
              )}
            </button>
          </div>
        </motion.div>

        {/* ── Thread list ── */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          {loadingThreads ? (
            <div className="space-y-0">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-4 border-b border-slate-100 dark:border-slate-800 last:border-b-0 flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full shimmer shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="w-28 h-4 shimmer rounded" />
                      <div className="w-16 h-3 shimmer rounded" />
                    </div>
                    <div className="w-48 h-3 shimmer rounded" />
                    <div className="w-32 h-3 shimmer rounded" />
                  </div>
                  <div className="w-12 h-12 rounded-xl shimmer shrink-0" />
                </div>
              ))}
            </div>
          ) : filteredThreads.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-800/50 flex items-center justify-center mb-5">
                {filter === "unread" ? (
                  <svg className="w-9 h-9 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : searchQuery ? (
                  <svg className="w-9 h-9 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                ) : (
                  <svg className="w-9 h-9 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                )}
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">
                {filter === "unread"
                  ? "You're all caught up!"
                  : searchQuery
                  ? "No results found"
                  : "No conversations yet"}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                {filter === "unread"
                  ? "You have no unread messages. Nice work!"
                  : searchQuery
                  ? `No messages matching "${searchQuery}"`
                  : "Start a conversation by messaging someone from their profile or a listing."}
              </p>
            </div>
          ) : (
            <div>
              {filteredThreads.map((thread, i) => (
                <motion.button
                  key={`${thread.listing_id || "direct"}-${thread.other_user_id}`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => handleThreadClick(thread)}
                  className={`w-full p-4 text-left border-b border-slate-100 dark:border-slate-800 last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-start gap-3 ${
                    thread.unread_count > 0 ? "bg-rose-50/30 dark:bg-rose-500/5" : ""
                  }`}
                >
                  {/* Avatar — stacked if listing exists */}
                  <div className="relative shrink-0">
                    <div className="w-14 h-14 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
                      {thread.other_user_pfp ? (
                        <img src={thread.other_user_pfp} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xl font-bold text-slate-500 dark:text-slate-300">
                          {(thread.other_user_name || "U").charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    {/* Online indicator dot */}
                    {thread.unread_count > 0 && (
                      <div className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-rose-500 border-2 border-white dark:border-slate-900 flex items-center justify-center">
                        <span className="text-[8px] font-bold text-white">{thread.unread_count > 9 ? "9+" : thread.unread_count}</span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 py-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-[15px] truncate ${
                        thread.unread_count > 0
                          ? "font-bold text-slate-900 dark:text-white"
                          : "font-semibold text-slate-700 dark:text-slate-200"
                      }`}>
                        {thread.other_user_name}
                      </p>
                      <span className={`text-xs shrink-0 ${
                        thread.unread_count > 0
                          ? "font-semibold text-slate-900 dark:text-white"
                          : "text-slate-400 dark:text-slate-500"
                      }`}>
                        {formatTime(thread.last_message_at)}
                      </span>
                    </div>

                    {/* Last message preview */}
                    <p className={`text-[13px] truncate mt-0.5 ${
                      thread.unread_count > 0
                        ? "text-slate-700 dark:text-slate-300 font-medium"
                        : "text-slate-500 dark:text-slate-400"
                    }`}>
                      {thread.last_message}
                    </p>

                    {/* Listing badge or Enquiry tag */}
                    {thread.listing_title && (
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block" />
                          {thread.listing_title}
                        </span>
                      </div>
                    )}
                    {!thread.listing_title && thread.is_direct && (
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
                          Direct message
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Listing thumbnail */}
                  {thread.listing_image && (
                    <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800">
                      <img src={thread.listing_image} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                </motion.button>
              ))}
            </div>
          )}
        </div>

        {/* Total thread count */}
        {!loadingThreads && threads.length > 0 && (
          <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-4">
            {filteredThreads.length === threads.length
              ? `${threads.length} conversation${threads.length !== 1 ? "s" : ""}`
              : `Showing ${filteredThreads.length} of ${threads.length} conversation${threads.length !== 1 ? "s" : ""}`}
          </p>
        )}
      </div>
    </>
  );
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = diff / (1000 * 60 * 60);

  if (hours < 1) return "Just now";
  if (hours < 24) return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (hours < 48) return "Yesterday";
  if (hours < 168) return date.toLocaleDateString([], { weekday: "short" });
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}
