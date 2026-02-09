import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../../hooks/useAuth";
import { supabase } from "../../../lib/supabase";

// ── Popular emoji sets ──────────────────────────────────────
const EMOJI_CATEGORIES = [
  { label: "Smileys", emojis: ["😀","😂","🥹","😍","🤩","😎","🥳","😭","😤","🤔","😱","🫡","😈","💀","🤡","👻","🫠","🥺","😴","🤮"] },
  { label: "Gestures", emojis: ["👍","👎","👋","🤝","✌️","🤞","🫶","👏","🙏","💪","🫵","🖕","✋","🤙","👀","🫣","🤷","🙄","🤦","🫰"] },
  { label: "Hearts", emojis: ["❤️","🧡","💛","💚","💙","💜","🖤","🤍","💔","❤️‍🔥","💕","💞","💓","💗","💖","💘","💝","♥️","🫀","💟"] },
  { label: "Animals", emojis: ["🐶","🐱","🐻","🦊","🐼","🐨","🦁","🐮","🐷","🐸","🐵","🐔","🦄","🐝","🦋","🐢","🐍","🦈","🐙","🦑"] },
  { label: "Food", emojis: ["🍕","🍔","🌮","🍜","🍣","🍩","🍪","🎂","🍦","🍫","☕","🧋","🍺","🍷","🥂","🍾","🥤","🍿","🥑","🌶️"] },
  { label: "Objects", emojis: ["🔥","⭐","✨","💫","🌈","💰","💎","🎁","🎉","🎊","🏆","🎯","💡","📌","🔑","🏠","🚗","✈️","🚀","⚡"] },
  { label: "Reactions", emojis: ["💯","✅","❌","⚠️","🚩","💤","💬","👑","🎵","🎶","📸","🔔","💌","🏳️","🎭","🃏","♟️","🧩","🪄","🫧"] },
];

// ── Popular GIF/Meme stickers (text-based reactions) ────────
const MEME_STICKERS = [
  { label: "This is fine 🔥", value: "🔥 This is fine 🔥" },
  { label: "Bruh 💀", value: "💀 Bruh" },
  { label: "W", value: "🏆 W" },
  { label: "L", value: "📉 L" },
  { label: "No cap", value: "🧢 No cap fr fr" },
  { label: "Slay", value: "💅 Slay" },
  { label: "LMAO", value: "🤣 LMAOOO" },
  { label: "Oof", value: "😬 Oof" },
  { label: "Let's go!", value: "🚀 LET'S GOOO" },
  { label: "RIP", value: "⚰️ RIP" },
  { label: "Sheesh", value: "🥶 Sheeeesh" },
  { label: "GG", value: "🤝 GG" },
  { label: "Crying", value: "😭😭😭" },
  { label: "Respect", value: "🫡 Respect" },
  { label: "Noted", value: "📝 Noted" },
  { label: "Vibe check", value: "✨ Vibe check passed ✨" },
];

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

interface AttachmentFile {
  file: File;
  preview: string | null;
  id: string;
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

  // Multiple file attachments
  const [attachments, setAttachments] = useState<AttachmentFile[]>([]);

  // Popover states
  const [showEmoji, setShowEmoji] = useState(false);
  const [showMemes, setShowMemes] = useState(false);
  const [showPlus, setShowPlus] = useState(false);
  const [emojiCategory, setEmojiCategory] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const otherUserName = otherUser?.preferred_name || otherUser?.name || "User";

  // Close popovers on click outside
  useEffect(() => {
    const handler = () => { setShowEmoji(false); setShowMemes(false); setShowPlus(false); };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  // Fetch other user profile directly from Supabase
  useEffect(() => {
    if (!userId) return;
    async function fetchUser() {
      const { data } = await supabase
        .from("profiles")
        .select("id, name, preferred_name, custom_pfp")
        .eq("id", userId as string)
        .maybeSingle();
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

  // Fetch messages directly from Supabase
  const fetchMessages = useCallback(async () => {
    if (!user || !userId) return;
    setLoadingMessages(true);
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${user.id})`
        )
        .order("created_at", { ascending: true })
        .limit(200);

      if (!error && data) {
        setMessages(data);
        const unreadIds = data
          .filter((m: any) => m.receiver_id === user.id && !m.read_at)
          .map((m: any) => m.id);
        if (unreadIds.length > 0) {
          await supabase
            .from("messages")
            .update({ read_at: new Date().toISOString() })
            .in("id", unreadIds);
        }
      }
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    } finally {
      setLoadingMessages(false);
    }
  }, [user, userId]);

  useEffect(() => {
    if (user && userId) fetchMessages();
  }, [user, userId, fetchMessages]);

  // Real-time subscription
  useEffect(() => {
    if (!session || !userId || !user) return;
    const channel = supabase
      .channel(`dm:${user.id}:${userId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        const newMsg = payload.new as Message;
        if (
          (newMsg.sender_id === user.id && newMsg.receiver_id === userId) ||
          (newMsg.sender_id === userId && newMsg.receiver_id === user.id)
        ) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [session, userId, user]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Upload file to Supabase Storage
  const uploadFile = async (file: File): Promise<{ url: string; name: string; type: string } | null> => {
    try {
      const ext = file.name.split(".").pop();
      const path = `messages/${user!.id}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("attachments").upload(path, file, { cacheControl: "3600", upsert: false });
      if (error) {
        // Fallback to public bucket
        const pubPath = `attachments/${path}`;
        const { error: pubErr } = await supabase.storage.from("public").upload(pubPath, file, { cacheControl: "3600", upsert: false });
        if (pubErr) return null;
        const { data: urlData } = supabase.storage.from("public").getPublicUrl(pubPath);
        return { url: urlData.publicUrl, name: file.name, type: file.type };
      }
      const { data: urlData } = supabase.storage.from("attachments").getPublicUrl(path);
      return { url: urlData.publicUrl, name: file.name, type: file.type };
    } catch { return null; }
  };

  // Rich text formatting
  const formatMessage = (text: string): { text: string; html: string } => {
    let html = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
    html = html.replace(/~~(.*?)~~/g, "<s>$1</s>");
    html = html.replace(/==(.*?)==/g, '<mark style="background-color:#fef08a;padding:0 2px;border-radius:2px;">$1</mark>');
    html = html.replace(/\n/g, "<br>");
    return { text, html };
  };

  const handleSend = async () => {
    if ((!messageText.trim() && attachments.length === 0) || !user || !userId) return;
    setSending(true);
    try {
      // Upload all attachments first
      if (attachments.length > 0) {
        setUploading(true);
        for (const att of attachments) {
          const uploaded = await uploadFile(att.file);
          if (uploaded) {
            // Send each attachment as its own message
            await supabase.from("messages").insert({
              sender_id: user.id,
              receiver_id: userId as string,
              message_text: `📎 ${uploaded.name}`,
              attachment_url: uploaded.url,
              attachment_name: uploaded.name,
              attachment_type: uploaded.type,
            });
          }
        }
        setUploading(false);
      }

      // Send text message if there is one
      if (messageText.trim()) {
        const { text, html } = formatMessage(messageText.trim());
        const msgData: Record<string, any> = {
          sender_id: user.id,
          receiver_id: userId as string,
          message_text: text,
        };
        const plainHtml = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");
        if (html !== plainHtml) msgData.message_html = html;
        await supabase.from("messages").insert(msgData);
      }

      setMessageText("");
      setAttachments([]);
      await fetchMessages();
    } catch (err) {
      console.error("Send error:", err);
    } finally {
      setSending(false);
    }
  };

  // Multi-file select
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const MAX_SIZE = 50 * 1024 * 1024; // 50MB per file
    const MAX_FILES = 10;

    const valid = files.filter((f) => f.size <= MAX_SIZE).slice(0, MAX_FILES - attachments.length);
    if (valid.length < files.length) {
      alert(`Max 50MB per file, max ${MAX_FILES} files at once.`);
    }

    for (const file of valid) {
      const id = Math.random().toString(36).slice(2);
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          setAttachments((prev) => [...prev, { file, preview: ev.target?.result as string, id }]);
        };
        reader.readAsDataURL(file);
      } else {
        setAttachments((prev) => [...prev, { file, preview: null, id }]);
      }
    }
    // Reset input so same file can be selected again
    e.target.value = "";
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const insertText = (text: string) => {
    const ta = textareaRef.current;
    if (ta) {
      const start = ta.selectionStart;
      const newVal = messageText.substring(0, start) + text + messageText.substring(ta.selectionEnd);
      setMessageText(newVal);
      setTimeout(() => { ta.selectionStart = ta.selectionEnd = start + text.length; ta.focus(); }, 0);
    } else {
      setMessageText((prev) => prev + text);
    }
  };

  const insertFormatting = (format: "bold" | "italic" | "strikethrough" | "highlight") => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const sel = messageText.substring(start, end);
    const wrappers: Record<string, string> = { bold: "**", italic: "*", strikethrough: "~~", highlight: "==" };
    const w = wrappers[format];
    const newText = messageText.substring(0, start) + w + (sel || "") + w + messageText.substring(end);
    setMessageText(newText);
    setTimeout(() => { ta.selectionStart = ta.selectionEnd = sel ? end + w.length * 2 : start + w.length; ta.focus(); }, 0);
  };

  // Group messages by date
  const getDateLabel = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return "Today";
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return d.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" });
  };

  // Render message
  const renderMessage = (msg: Message, index: number) => {
    const isMine = msg.sender_id === user?.id;
    const hasHtml = msg.message_html;
    const isImage = msg.attachment_type?.startsWith("image/");
    const isAttachmentOnly = msg.attachment_url && msg.message_text.startsWith("📎");

    // Date separator
    const showDate = index === 0 || getDateLabel(msg.created_at) !== getDateLabel(messages[index - 1].created_at);

    return (
      <div key={msg.id}>
        {showDate && (
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700/50" />
            <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 px-2">{getDateLabel(msg.created_at)}</span>
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700/50" />
          </div>
        )}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
          className={`flex ${isMine ? "justify-end" : "justify-start"} mb-1 group`}
        >
          {/* Other user avatar */}
          {!isMine && (
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden shrink-0 mr-2 mt-auto">
              {otherUser?.custom_pfp ? (
                <img src={otherUser.custom_pfp} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs font-bold text-slate-500 dark:text-slate-300">{otherUserName.charAt(0).toUpperCase()}</span>
              )}
            </div>
          )}

          <div className="max-w-[70%] sm:max-w-sm">
            {/* Image attachment */}
            {msg.attachment_url && isImage && (
              <div className={`mb-1 rounded-2xl overflow-hidden cursor-pointer ${isMine ? "ml-auto" : ""}`} onClick={() => window.open(msg.attachment_url, "_blank")}>
                <img src={msg.attachment_url} alt={msg.attachment_name || ""} className="max-w-full max-h-72 rounded-2xl object-cover hover:opacity-90 transition-opacity" />
              </div>
            )}

            {/* File attachment (non-image) */}
            {msg.attachment_url && !isImage && (
              <a href={msg.attachment_url} target="_blank" rel="noopener noreferrer"
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl mb-1 transition-colors ${
                  isMine ? "bg-rose-500/90 text-white hover:bg-rose-600" : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isMine ? "bg-white/20" : "bg-slate-200 dark:bg-slate-700"}`}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{msg.attachment_name || "File"}</p>
                  <p className={`text-xs ${isMine ? "text-white/70" : "text-slate-400"}`}>Tap to download</p>
                </div>
              </a>
            )}

            {/* Text bubble */}
            {msg.message_text && !isAttachmentOnly && (
              <div className={`rounded-2xl px-4 py-2.5 ${
                isMine
                  ? "bg-rose-500 text-white rounded-br-md"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-bl-md"
              }`}>
                {hasHtml ? (
                  <div className="text-[14px] leading-relaxed break-words [&_strong]:font-bold [&_em]:italic [&_s]:line-through [&_mark]:rounded-sm"
                    dangerouslySetInnerHTML={{ __html: msg.message_html! }} />
                ) : (
                  <p className="text-[14px] leading-relaxed break-words whitespace-pre-wrap">{msg.message_text}</p>
                )}
              </div>
            )}

            {/* Time + read */}
            <p className={`text-[10px] mt-0.5 px-1 ${isMine ? "text-right" : "text-left"} text-slate-400 dark:text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity`}>
              {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              {isMine && msg.read_at && <span className="ml-1 text-blue-400">✓✓</span>}
              {isMine && !msg.read_at && <span className="ml-1">✓</span>}
            </p>
          </div>
        </motion.div>
      </div>
    );
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-rose-300 dark:border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="max-w-md mx-auto px-4 py-20">
        <div className="card p-8 rounded-2xl text-center">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Sign in required</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Sign in to send messages.</p>
          <Link href="/signin" className="btn-primary py-3 px-6 rounded-xl text-sm inline-block">Sign in</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col" style={{ height: "calc(100vh - 140px)" }}>

        {/* ── Header (Airbnb-style) ── */}
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <Link href="/account/messages" className="p-1.5 -ml-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>

          <Link href={`/users/profile/${userId}`} className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden shrink-0 ring-2 ring-white dark:ring-slate-900">
              {otherUser?.custom_pfp ? (
                <img src={otherUser.custom_pfp} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-lg font-bold text-slate-500 dark:text-slate-300">{otherUserName.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-slate-900 dark:text-white truncate text-[15px]">{otherUserName}</h2>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">Tap to view profile</p>
            </div>
          </Link>

          {/* Search / info button */}
          <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
            </svg>
          </button>
        </div>

        {/* ── Messages area ── */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {loadingMessages ? (
            <div className="space-y-3 py-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}>
                  <div className={`h-10 rounded-2xl shimmer ${i % 2 === 0 ? "w-40" : "w-52"}`} />
                </div>
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-rose-100 to-rose-50 dark:from-rose-500/10 dark:to-rose-500/5 flex items-center justify-center mb-4">
                <span className="text-4xl">👋</span>
              </div>
              <p className="text-base font-semibold text-slate-700 dark:text-slate-200">Start a conversation</p>
              <p className="text-sm text-slate-400 dark:text-slate-500 mt-1 max-w-xs">
                Say hello to {otherUserName}! Messages are private between you two.
              </p>
            </div>
          ) : (
            messages.map((msg, i) => renderMessage(msg, i))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* ── Attachment previews ── */}
        <AnimatePresence>
          {attachments.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-slate-100 dark:border-slate-800 px-4 py-2 overflow-hidden"
            >
              <div className="flex gap-2 overflow-x-auto pb-1">
                {attachments.map((att) => (
                  <div key={att.id} className="relative shrink-0 group/att">
                    {att.preview ? (
                      <img src={att.preview} alt="" className="w-16 h-16 rounded-xl object-cover" />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center">
                        <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                        <span className="text-[9px] text-slate-400 mt-0.5 truncate max-w-[56px] px-1">{att.file.name.split(".").pop()?.toUpperCase()}</span>
                      </div>
                    )}
                    <button
                      onClick={() => removeAttachment(att.id)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover/att:opacity-100 transition-opacity"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}

                {/* Add more files button */}
                {attachments.length < 10 && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center text-slate-400 hover:border-rose-400 hover:text-rose-400 transition-colors shrink-0"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                  </button>
                )}
              </div>
              <p className="text-[10px] text-slate-400 mt-1">{attachments.length}/10 files &middot; Max 50MB each</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Discord-style input bar ── */}
        <div className="border-t border-slate-100 dark:border-slate-800">
          {/* Formatting toolbar */}
          <div className="px-3 pt-2 pb-1 flex items-center gap-0.5">
            <button onClick={() => insertFormatting("bold")} className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Bold **text**">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z" /></svg>
            </button>
            <button onClick={() => insertFormatting("italic")} className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Italic *text*">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z" /></svg>
            </button>
            <button onClick={() => insertFormatting("strikethrough")} className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Strikethrough ~~text~~">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M10 19h4v-3h-4v3zM5 4v3h5v3h4V7h5V4H5zM3 14h18v-2H3v2z" /></svg>
            </button>
            <button onClick={() => insertFormatting("highlight")} className="p-1.5 rounded-md text-slate-400 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-500/10 transition-colors" title="Highlight ==text==">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18 14V8a6 6 0 00-12 0v6l-2 4h16l-2-4zm-6 8c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2z" /></svg>
            </button>

            <div className="flex-1" />

            <span className="text-[10px] text-slate-400 dark:text-slate-600 hidden sm:inline">
              **bold** &middot; *italic* &middot; ~~strike~~ &middot; ==highlight==
            </span>
          </div>

          {/* Main input row */}
          <div className="px-3 pb-3 flex items-end gap-1.5">
            {/* Plus button (file menu) */}
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => { setShowPlus(!showPlus); setShowEmoji(false); setShowMemes(false); }}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </button>

              <AnimatePresence>
                {showPlus && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    className="absolute bottom-12 left-0 w-56 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl z-50 overflow-hidden"
                  >
                    <button onClick={() => { fileInputRef.current?.click(); setShowPlus(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                      <svg className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                      </svg>
                      Upload Files
                    </button>
                    <button onClick={() => { fileInputRef.current?.setAttribute("accept", "image/*"); fileInputRef.current?.click(); setShowPlus(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border-t border-slate-100 dark:border-slate-700">
                      <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25a2.25 2.25 0 00-2.25-2.25H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                      </svg>
                      Upload Photos
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*,.pdf,.doc,.docx,.txt,.csv,.xlsx,.zip,.rar,.mp4,.mp3"
              multiple
              onChange={handleFileSelect}
            />

            {/* Message textarea */}
            <textarea
              ref={textareaRef}
              placeholder={`Message ${otherUserName}...`}
              value={messageText}
              onChange={(e) => {
                setMessageText(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (!sending) handleSend(); }
              }}
              rows={1}
              className="flex-1 resize-none rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white px-4 py-2.5 text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent placeholder:text-slate-400 dark:placeholder:text-slate-500"
              disabled={sending}
              style={{ minHeight: "42px", maxHeight: "120px" }}
            />

            {/* Meme/sticker button */}
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => { setShowMemes(!showMemes); setShowEmoji(false); setShowPlus(false); }}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
                title="Stickers & Reactions"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
                </svg>
              </button>

              <AnimatePresence>
                {showMemes && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    className="absolute bottom-12 right-0 w-64 max-h-72 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl z-50 overflow-hidden"
                  >
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700">
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Quick Reactions</p>
                    </div>
                    <div className="overflow-y-auto max-h-56 p-2 grid grid-cols-2 gap-1">
                      {MEME_STICKERS.map((meme) => (
                        <button
                          key={meme.value}
                          onClick={() => { insertText(meme.value); setShowMemes(false); }}
                          className="text-left px-3 py-2 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 transition-colors truncate"
                        >
                          {meme.label}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Emoji picker */}
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => { setShowEmoji(!showEmoji); setShowMemes(false); setShowPlus(false); }}
                className="p-2 rounded-xl text-slate-400 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-500/10 transition-colors shrink-0"
                title="Emoji"
              >
                <span className="text-lg leading-none">😊</span>
              </button>

              <AnimatePresence>
                {showEmoji && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    className="absolute bottom-12 right-0 w-80 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl z-50 overflow-hidden"
                  >
                    {/* Category tabs */}
                    <div className="flex gap-0.5 px-2 pt-2 pb-1 border-b border-slate-100 dark:border-slate-700 overflow-x-auto">
                      {EMOJI_CATEGORIES.map((cat, i) => (
                        <button
                          key={cat.label}
                          onClick={() => setEmojiCategory(i)}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-colors ${
                            emojiCategory === i
                              ? "bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400"
                              : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                    {/* Emoji grid */}
                    <div className="p-2 grid grid-cols-10 gap-0.5 max-h-48 overflow-y-auto">
                      {EMOJI_CATEGORIES[emojiCategory].emojis.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => { insertText(emoji); }}
                          className="w-8 h-8 flex items-center justify-center text-xl hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Send button */}
            <button
              onClick={handleSend}
              disabled={sending || uploading || (!messageText.trim() && attachments.length === 0)}
              className="p-2.5 rounded-xl bg-rose-500 text-white hover:bg-rose-600 transition-all disabled:opacity-30 shrink-0"
            >
              {sending || uploading ? (
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
