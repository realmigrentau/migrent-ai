import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "../../components/Layout";
import { useAuth } from "../../hooks/useAuth";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

interface Thread {
  listing_id?: string;
  other_user_id: string;
  other_user_name: string;
  other_user_pfp?: string;
  last_message: string;
  last_message_at: string;
  unread_count: number;
  is_direct?: boolean;
}

export default function MessagesPage() {
  const { session, user, loading } = useAuth();
  const router = useRouter();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loadingThreads, setLoadingThreads] = useState(false);

  useEffect(() => {
    if (session && user?.id) fetchThreads();
  }, [session, user?.id]);

  const fetchThreads = async () => {
    setLoadingThreads(true);
    try {
      const res = await fetch(`${BASE_URL}/messages/threads`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setThreads(data.threads || []);
      }
    } catch (err) {
      console.error("Failed to fetch threads:", err);
    } finally {
      setLoadingThreads(false);
    }
  };

  const handleThreadClick = (thread: Thread) => {
    // For direct messages or all threads, go to the conversation page
    router.push(`/account/messages/${thread.other_user_id}`);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-rose-300 dark:border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!session) {
    return (
      <Layout>
        <div className="max-w-md mx-auto px-4 py-20">
          <div className="card p-8 rounded-2xl text-center">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Sign in required</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Sign in to access messages.</p>
            <Link href="/signin" className="btn-primary py-3 px-6 rounded-xl text-sm inline-block">Sign in</Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Messages
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-6">
            Your conversations with other users.
          </p>
        </motion.div>

        <div className="card rounded-2xl overflow-hidden">
          {loadingThreads ? (
            <div className="space-y-0">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full shimmer shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="w-24 h-4 shimmer rounded" />
                    <div className="w-40 h-3 shimmer rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : threads.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">No conversations yet</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Start a conversation by messaging someone from their profile.
              </p>
            </div>
          ) : (
            <AnimatePresence>
              {threads.map((thread, i) => (
                <motion.button
                  key={`${thread.listing_id || "direct"}-${thread.other_user_id}`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => handleThreadClick(thread)}
                  className="w-full p-4 text-left border-b border-slate-100 dark:border-slate-800 last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-center gap-3"
                >
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                    {thread.other_user_pfp ? (
                      <img src={thread.other_user_pfp} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-lg font-bold text-slate-500 dark:text-slate-300">
                        {(thread.other_user_name || "U").charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                        {thread.other_user_name}
                      </p>
                      <span className="text-xs text-slate-400 dark:text-slate-500 shrink-0">
                        {formatTime(thread.last_message_at)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {thread.last_message}
                      </p>
                      {thread.unread_count > 0 && (
                        <span className="shrink-0 w-5 h-5 flex items-center justify-center rounded-full bg-rose-500 text-white text-[10px] font-bold">
                          {thread.unread_count}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Chevron */}
                  <svg className="w-4 h-4 text-slate-300 dark:text-slate-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </motion.button>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </Layout>
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
