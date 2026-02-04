import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../lib/supabase";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

interface Thread {
  listing_id: string;
  other_user_id: string;
  other_user_name: string;
  other_user_pfp?: string;
  last_message: string;
  last_message_at: string;
  unread_count: number;
}

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  listing_id: string;
  deal_id?: string;
  message_text: string;
  read_at?: string;
  created_at: string;
}

export default function MessagesPage() {
  const { session, user, loading } = useAuth();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loadingThreads, setLoadingThreads] = useState(false);
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch threads on mount
  useEffect(() => {
    if (session && user?.id) {
      fetchThreads();
    }
  }, [session, user?.id]);

  // Fetch messages when thread is selected
  useEffect(() => {
    if (selectedThread && session && user?.id) {
      fetchMessages(selectedThread.listing_id, selectedThread.other_user_id);
    }
  }, [selectedThread, session, user?.id]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Real-time subscription for new messages
  useEffect(() => {
    if (!selectedThread || !session) return;

    const channel = supabase
      .channel(`messages:${selectedThread.listing_id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `listing_id=eq.${selectedThread.listing_id}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => [...prev, newMsg]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedThread, session]);

  const fetchThreads = async () => {
    setLoadingThreads(true);
    try {
      const res = await fetch(`${BASE_URL}/messages/threads`, {
        method: "GET",
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

  const fetchMessages = async (listingId: string, otherUserId: string) => {
    setLoadingMessages(true);
    try {
      const res = await fetch(
        `${BASE_URL}/messages/thread/${listingId}/${otherUserId}?limit=50`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token}`,
          },
        }
      );
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedThread || !user?.id) return;

    setSendingMessage(true);
    try {
      const res = await fetch(`${BASE_URL}/messages/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          sender_id: user.id,
          receiver_id: selectedThread.other_user_id,
          listing_id: selectedThread.listing_id,
          message_text: newMessage,
        }),
      });

      if (res.ok) {
        setNewMessage("");
        await fetchMessages(
          selectedThread.listing_id,
          selectedThread.other_user_id
        );
      }
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setSendingMessage(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-rose-300 dark:border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="card p-8 rounded-2xl text-center max-w-md mx-auto mt-12">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
          Sign in required
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Sign in to access messages.
        </p>
        <Link
          href="/signin"
          className="btn-primary py-3 px-6 rounded-xl text-sm inline-block"
        >
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
          Messages
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          Connect with owners and seekers about listings and deals.
        </p>
      </motion.div>

      {/* Messages layout */}
      <div className="grid lg:grid-cols-4 gap-6 h-[calc(100vh-250px)]">
        {/* Threads list */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1 card rounded-2xl overflow-hidden flex flex-col"
        >
          <div className="p-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="font-bold text-slate-900 dark:text-white text-sm">
              Conversations
            </h2>
          </div>

          {loadingThreads ? (
            <div className="space-y-3 p-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 rounded-lg shimmer" />
              ))}
            </div>
          ) : threads.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="text-center">
                <svg
                  className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  No conversations yet
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              <AnimatePresence>
                {threads.map((thread, i) => (
                  <motion.button
                    key={`${thread.listing_id}-${thread.other_user_id}`}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setSelectedThread(thread)}
                    className={`w-full p-3 text-left border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                      selectedThread?.listing_id === thread.listing_id &&
                      selectedThread?.other_user_id === thread.other_user_id
                        ? "bg-rose-50 dark:bg-rose-500/10"
                        : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                          {thread.other_user_name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {thread.last_message}
                        </p>
                      </div>
                      {thread.unread_count > 0 && (
                        <span className="shrink-0 px-2 py-0.5 rounded-full bg-rose-500 text-white text-xs font-bold">
                          {thread.unread_count}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                      {new Date(thread.last_message_at).toLocaleDateString()}
                    </p>
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>

        {/* Chat window */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-3 card rounded-2xl overflow-hidden flex flex-col"
        >
          {selectedThread ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {selectedThread.other_user_pfp && (
                    <img
                      src={selectedThread.other_user_pfp}
                      alt={selectedThread.other_user_name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">
                      {selectedThread.other_user_name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Active now
                    </p>
                  </div>
                </div>
                <Link
                  href={`/seeker/room/${selectedThread.listing_id}`}
                  className="text-sm text-rose-500 hover:text-rose-600 underline"
                >
                  View listing
                </Link>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loadingMessages ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-12 w-3/4 rounded-lg shimmer"
                      />
                    ))}
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Start the conversation
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${
                        msg.sender_id === user?.id
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs rounded-2xl px-4 py-2 ${
                          msg.sender_id === user?.id
                            ? "bg-rose-500 text-white"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white"
                        }`}
                      >
                        <p className="text-sm break-words">{msg.message_text}</p>
                        <p
                          className={`text-xs mt-1 ${
                            msg.sender_id === user?.id
                              ? "text-rose-100"
                              : "text-slate-500 dark:text-slate-400"
                          }`}
                        >
                          {new Date(msg.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </motion.div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !sendingMessage) {
                      handleSendMessage();
                    }
                  }}
                  className="input-field flex-1"
                  disabled={sendingMessage}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={sendingMessage || !newMessage.trim()}
                  className="btn-primary px-6 rounded-xl text-sm disabled:opacity-50"
                >
                  {sendingMessage ? (
                    <svg
                      className="w-4 h-4 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <svg
                  className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <p className="text-sm font-medium text-slate-400 dark:text-slate-500">
                  Select a conversation
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
