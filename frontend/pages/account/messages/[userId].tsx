import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "../../../components/Layout";
import { useAuth } from "../../../hooks/useAuth";
import { supabase } from "../../../lib/supabase";
import { getPublicProfile } from "../../../lib/api";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  listing_id?: string;
  message_text: string;
  message_html?: string;
  attachment_url?: string;
  attachment_name?: string;
  attachment_type?: string;
  read_at?: string;
  created_at: string;
}

interface OtherUser {
  id: string;
  name: string;
  preferred_name?: string;
  custom_pfp?: string;
}

export default function DirectMessagePage() {
  const router = useRouter();
  const { userId } = router.query;
  const { session, user, loading: authLoading } = useAuth();

  const [otherUser, setOtherUser] = useState<OtherUser | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);

  // Rich text state
  const [isBold, setIsBold] = useState(false);
  const [isHighlight, setIsHighlight] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const otherUserName = otherUser?.preferred_name || otherUser?.name || "User";

  // Fetch other user profile
  useEffect(() => {
    if (!userId) return;
    async function fetchUser() {
      const data = await getPublicProfile(userId as string);
      if (data) {
        setOtherUser({
          id: data.id || (userId as string),
          name: data.name || "User",
          preferred_name: data.preferred_name,
          custom_pfp: data.custom_pfp,
        });
      }
    }
    fetchUser();
  }, [userId]);

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    if (!session || !userId) return;
    setLoadingMessages(true);
    try {
      const res = await fetch(`${BASE_URL}/messages/direct/${userId}?limit=100`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    } finally {
      setLoadingMessages(false);
    }
  }, [session, userId]);

  useEffect(() => {
    if (session && userId) fetchMessages();
  }, [session, userId, fetchMessages]);

  // Real-time subscription
  useEffect(() => {
    if (!session || !userId || !user) return;

    const channel = supabase
      .channel(`dm:${user.id}:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const newMsg = payload.new as Message;
          // Only add if it's part of this conversation
          if (
            (newMsg.sender_id === user.id && newMsg.receiver_id === userId) ||
            (newMsg.sender_id === userId && newMsg.receiver_id === user.id)
          ) {
            setMessages((prev) => {
              // Avoid duplicates
              if (prev.some((m) => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session, userId, user]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Upload file to Supabase Storage
  const uploadFile = async (file: File): Promise<{ url: string; name: string; type: string } | null> => {
    try {
      const ext = file.name.split(".").pop();
      const path = `messages/${user!.id}/${Date.now()}.${ext}`;

      const { data, error } = await supabase.storage
        .from("attachments")
        .upload(path, file, { cacheControl: "3600", upsert: false });

      if (error) {
        console.error("Upload error:", error);
        // Fallback: try public bucket
        const { data: pubData, error: pubError } = await supabase.storage
          .from("public")
          .upload(`attachments/${path}`, file, { cacheControl: "3600", upsert: false });

        if (pubError) {
          console.error("Public upload error:", pubError);
          return null;
        }

        const { data: urlData } = supabase.storage
          .from("public")
          .getPublicUrl(`attachments/${path}`);
        return { url: urlData.publicUrl, name: file.name, type: file.type };
      }

      const { data: urlData } = supabase.storage
        .from("attachments")
        .getPublicUrl(path);
      return { url: urlData.publicUrl, name: file.name, type: file.type };
    } catch (err) {
      console.error("Upload failed:", err);
      return null;
    }
  };

  // Apply rich text formatting to message
  const formatMessage = (text: string): { text: string; html: string } => {
    let html = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Convert **bold** to <strong>
    html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    // Convert ==highlight== to <mark>
    html = html.replace(/==(.*?)==/g, '<mark style="background-color:#fef08a;padding:0 2px;border-radius:2px;">$1</mark>');
    // Newlines to <br>
    html = html.replace(/\n/g, "<br>");

    return { text, html };
  };

  const handleSend = async () => {
    if ((!messageText.trim() && !attachmentFile) || !user || !userId) return;

    setSending(true);
    try {
      let attachData: { url: string; name: string; type: string } | null = null;

      // Upload attachment if present
      if (attachmentFile) {
        setUploading(true);
        attachData = await uploadFile(attachmentFile);
        setUploading(false);
      }

      const { text, html } = formatMessage(messageText.trim());

      const payload: Record<string, any> = {
        sender_id: user.id,
        receiver_id: userId,
        message_text: text || (attachData ? `📎 ${attachData.name}` : ""),
      };

      // Only include html if there's formatting
      if (html !== text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>")) {
        payload.message_html = html;
      }

      if (attachData) {
        payload.attachment_url = attachData.url;
        payload.attachment_name = attachData.name;
        payload.attachment_type = attachData.type;
      }

      const res = await fetch(`${BASE_URL}/messages/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session!.access_token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setMessageText("");
        setAttachmentFile(null);
        setAttachmentPreview(null);
        setIsBold(false);
        setIsHighlight(false);
        // Fetch messages to ensure we have the latest
        await fetchMessages();
      } else {
        const errData = await res.text().catch(() => "");
        console.error("Send failed:", errData);
      }
    } catch (err) {
      console.error("Send error:", err);
    } finally {
      setSending(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 10MB limit
    if (file.size > 10 * 1024 * 1024) {
      alert("File must be under 10MB");
      return;
    }

    setAttachmentFile(file);

    // Create preview for images
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setAttachmentPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setAttachmentPreview(null);
    }
  };

  const insertFormatting = (format: "bold" | "highlight") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = messageText.substring(start, end);

    let wrapper = "";
    if (format === "bold") wrapper = "**";
    if (format === "highlight") wrapper = "==";

    if (selectedText) {
      const newText =
        messageText.substring(0, start) +
        wrapper +
        selectedText +
        wrapper +
        messageText.substring(end);
      setMessageText(newText);
    } else {
      const newText =
        messageText.substring(0, start) +
        wrapper +
        wrapper +
        messageText.substring(end);
      setMessageText(newText);
      // Place cursor between wrappers
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + wrapper.length;
        textarea.focus();
      }, 0);
    }
  };

  // Render a single message bubble
  const renderMessage = (msg: Message) => {
    const isMine = msg.sender_id === user?.id;
    const hasHtml = msg.message_html;
    const isImage = msg.attachment_type?.startsWith("image/");

    return (
      <motion.div
        key={msg.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex ${isMine ? "justify-end" : "justify-start"}`}
      >
        <div className={`max-w-[75%] sm:max-w-md`}>
          {/* Attachment */}
          {msg.attachment_url && (
            <div className={`mb-1 rounded-xl overflow-hidden ${isMine ? "ml-auto" : ""}`}>
              {isImage ? (
                <img
                  src={msg.attachment_url}
                  alt={msg.attachment_name || "Attachment"}
                  className="max-w-full max-h-64 rounded-xl object-cover cursor-pointer"
                  onClick={() => window.open(msg.attachment_url, "_blank")}
                />
              ) : (
                <a
                  href={msg.attachment_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm ${
                    isMine
                      ? "bg-rose-400 text-white hover:bg-rose-300"
                      : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600"
                  } transition-colors`}
                >
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  {msg.attachment_name || "Download file"}
                </a>
              )}
            </div>
          )}

          {/* Text bubble */}
          {msg.message_text && !(msg.attachment_url && msg.message_text.startsWith("📎")) && (
            <div
              className={`rounded-2xl px-4 py-2.5 ${
                isMine
                  ? "bg-rose-500 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white"
              }`}
            >
              {hasHtml ? (
                <div
                  className="text-sm break-words [&_strong]:font-bold [&_mark]:rounded-sm"
                  dangerouslySetInnerHTML={{ __html: msg.message_html! }}
                />
              ) : (
                <p className="text-sm break-words whitespace-pre-wrap">{msg.message_text}</p>
              )}
            </div>
          )}

          {/* Time */}
          <p className={`text-[10px] mt-1 ${isMine ? "text-right" : "text-left"} text-slate-400 dark:text-slate-500`}>
            {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            {isMine && msg.read_at && (
              <span className="ml-1 text-blue-400">✓✓</span>
            )}
          </p>
        </div>
      </motion.div>
    );
  };

  if (authLoading) {
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
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Sign in to send messages.</p>
            <Link href="/signin" className="btn-primary py-3 px-6 rounded-xl text-sm inline-block">Sign in</Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="card rounded-2xl overflow-hidden flex flex-col" style={{ height: "calc(100vh - 160px)" }}>

          {/* ── Header ── */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
            <Link
              href="/account/messages"
              className="p-2 -ml-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <svg className="w-5 h-5 text-slate-500 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </Link>

            <Link href={`/users/profile/${userId}`} className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                {otherUser?.custom_pfp ? (
                  <img src={otherUser.custom_pfp} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-lg font-bold text-slate-500 dark:text-slate-300">
                    {otherUserName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <h2 className="font-bold text-slate-900 dark:text-white truncate">{otherUserName}</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Tap to view profile</p>
              </div>
            </Link>
          </div>

          {/* ── Messages area ── */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loadingMessages ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className={`h-12 w-2/3 rounded-xl shimmer ${i % 2 === 0 ? "ml-auto" : ""}`} />
                ))}
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center mb-3">
                  <svg className="w-8 h-8 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No messages yet</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Say hello to {otherUserName}!</p>
              </div>
            ) : (
              <>
                {/* Date header for first message */}
                <div className="text-center">
                  <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-3 py-1 rounded-full">
                    {new Date(messages[0]?.created_at).toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" })}
                  </span>
                </div>
                {messages.map(renderMessage)}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* ── Attachment preview ── */}
          <AnimatePresence>
            {attachmentFile && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-slate-100 dark:border-slate-800 px-4 py-2 flex items-center gap-3"
              >
                {attachmentPreview ? (
                  <img src={attachmentPreview} alt="" className="w-12 h-12 rounded-lg object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{attachmentFile.name}</p>
                  <p className="text-xs text-slate-400">{(attachmentFile.size / 1024).toFixed(0)} KB</p>
                </div>
                <button
                  onClick={() => { setAttachmentFile(null); setAttachmentPreview(null); }}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Formatting toolbar ── */}
          <div className="border-t border-slate-100 dark:border-slate-800 px-4 pt-2 flex items-center gap-1">
            <button
              onClick={() => insertFormatting("bold")}
              className={`p-1.5 rounded-md text-xs font-bold transition-colors ${
                isBold
                  ? "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
              title="Bold (wrap text with **)"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z" />
              </svg>
            </button>
            <button
              onClick={() => insertFormatting("highlight")}
              className={`p-1.5 rounded-md text-xs transition-colors ${
                isHighlight
                  ? "bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-300"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
              title="Highlight (wrap text with ==)"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 14V8a6 6 0 00-12 0v6l-2 4h16l-2-4zm-6 8c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2z" />
              </svg>
            </button>

            <div className="flex-1" />

            <span className="text-[10px] text-slate-400 dark:text-slate-500">
              **bold** · ==highlight==
            </span>
          </div>

          {/* ── Input area ── */}
          <div className="px-4 pb-4 pt-2 flex items-end gap-2">
            {/* File attach button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
              title="Attach file"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*,.pdf,.doc,.docx,.txt,.csv,.xlsx"
              onChange={handleFileSelect}
            />

            {/* Message input */}
            <textarea
              ref={textareaRef}
              placeholder={`Message ${otherUserName}...`}
              value={messageText}
              onChange={(e) => {
                setMessageText(e.target.value);
                // Auto-resize
                e.target.style.height = "auto";
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (!sending) handleSend();
                }
              }}
              rows={1}
              className="flex-1 resize-none rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white px-4 py-2.5 text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent placeholder:text-slate-400 dark:placeholder:text-slate-500"
              disabled={sending}
              style={{ minHeight: "42px", maxHeight: "120px" }}
            />

            {/* Send button */}
            <button
              onClick={handleSend}
              disabled={sending || uploading || (!messageText.trim() && !attachmentFile)}
              className="p-2.5 rounded-xl bg-rose-500 text-white hover:bg-rose-600 transition-colors disabled:opacity-40 disabled:hover:bg-rose-500 shrink-0"
            >
              {sending || uploading ? (
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
