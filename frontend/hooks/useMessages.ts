import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../lib/supabase";
import { sendMessage as sendMessageApi, markMessagesRead } from "../lib/api";

/**
 * Reads and realtime still go straight to Supabase, which is fine: the RLS
 * SELECT policy on `messages` already scopes rows to the sender or receiver.
 * Writes do not. Every signed-in user used to hold INSERT and UPDATE on
 * `messages`, which meant message_html could be written without passing
 * through the server-side sanitiser. Those grants are gone as of migration
 * 039, so sends and read receipts go through the API instead.
 */
async function getAccessToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

// ── Types ───────────────────────────────────────────────────
export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  listing_id?: string;
  deal_id?: string;
  message_text: string;
  message_html?: string;
  attachment_url?: string;
  attachment_name?: string;
  attachment_type?: string;
  read_at?: string;
  created_at: string;
  updated_at?: string;
  // Client-side enrichment
  reactions?: MessageReaction[];
  reply_to_id?: string;
  reply_to_text?: string;
}

export interface MessageReaction {
  emoji: string;
  user_id: string;
  created_at: string;
}

export interface Thread {
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
  is_online?: boolean;
  is_pinned?: boolean;
  is_muted?: boolean;
  folder?: "active" | "archived" | "verification" | "spam";
}

export interface AttachmentFile {
  file: File;
  preview: string | null;
  id: string;
  uploading?: boolean;
  progress?: number;
}

// ── Hook: useThreads ────────────────────────────────────────
export function useThreads(userId?: string) {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchThreads = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);

    try {
      const { data: messages, error: fetchErr } = await supabase
        .from("messages")
        .select("*")
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order("created_at", { ascending: false });

      if (fetchErr) throw fetchErr;
      if (!messages || messages.length === 0) {
        setThreads([]);
        return;
      }

      // Group into threads by other user + listing
      const threadMap: Record<string, Thread> = {};
      for (const msg of messages) {
        const otherId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
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
            folder: "active",
          };
        }
        if (msg.receiver_id === userId && !msg.read_at) {
          threadMap[key].unread_count++;
        }
      }

      // Fetch user profiles
      const otherIds = [...new Set(Object.values(threadMap).map((t) => t.other_user_id))];
      if (otherIds.length > 0) {
        const { data: profiles } = await supabase
          .from("public_profiles")
          .select("id, name, preferred_name, custom_pfp")
          .in("id", otherIds);

        if (profiles) {
          const profileMap = Object.fromEntries(profiles.map((p: any) => [p.id, p]));
          for (const thread of Object.values(threadMap)) {
            const p = profileMap[thread.other_user_id];
            if (p) {
              thread.other_user_name = p.preferred_name || p.name || "User";
              thread.other_user_pfp = p.custom_pfp && typeof p.custom_pfp === "string" && p.custom_pfp.startsWith("http") ? p.custom_pfp : undefined;
            }
          }
        }
      }

      // Fetch listing info
      const listingIds = [...new Set(
        Object.values(threadMap).filter((t) => t.listing_id).map((t) => t.listing_id!)
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

      // Sort by last message time
      const sorted = Object.values(threadMap).sort(
        (a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
      );
      setThreads(sorted);
    } catch (err: any) {
      console.error("Failed to fetch threads:", err);
      setError(err.message || "Failed to load conversations");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Initial fetch
  useEffect(() => {
    if (userId) fetchThreads();
  }, [userId, fetchThreads]);

  // Real-time subscription for new messages (updates thread list)
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`threads:${userId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages",
      }, (payload) => {
        const msg = payload.new as Message;
        if (msg.sender_id === userId || msg.receiver_id === userId) {
          // Refresh threads when any message involves this user
          fetchThreads();
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId, fetchThreads]);

  const totalUnread = threads.reduce((sum, t) => sum + t.unread_count, 0);

  return { threads, loading, error, totalUnread, refetch: fetchThreads };
}

// ── Hook: useChat ───────────────────────────────────────────
export function useChat(currentUserId?: string, otherUserId?: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [otherUser, setOtherUser] = useState<{
    id: string;
    name: string;
    preferred_name?: string;
    custom_pfp?: string;
  } | null>(null);
  const hasMoreRef = useRef(true);
  const pageRef = useRef(0);
  const PAGE_SIZE = 50;

  // Fetch other user profile
  useEffect(() => {
    if (!otherUserId) return;
    (async () => {
      const { data } = await supabase
        .from("public_profiles")
        .select("id, name, preferred_name, custom_pfp")
        .eq("id", otherUserId)
        .maybeSingle();
      if (data) {
        const validPfp = data.custom_pfp && typeof data.custom_pfp === "string" && data.custom_pfp.startsWith("http") ? data.custom_pfp : undefined;
        setOtherUser({
          id: data.id || otherUserId,
          name: data.name || "User",
          preferred_name: data.preferred_name,
          custom_pfp: validPfp,
        });
      }
    })();
  }, [otherUserId]);

  // Fetch messages
  const fetchMessages = useCallback(async (reset = false) => {
    if (!currentUserId || !otherUserId) return;
    if (reset) {
      pageRef.current = 0;
      hasMoreRef.current = true;
    }
    setLoading(true);

    try {
      const from = pageRef.current * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(
          `and(sender_id.eq.${currentUserId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${currentUserId})`
        )
        .order("created_at", { ascending: true })
        .range(from, to);

      if (!error && data) {
        if (reset) {
          setMessages(data);
        } else {
          setMessages((prev) => {
            const ids = new Set(prev.map((m) => m.id));
            const newMsgs = data.filter((m: any) => !ids.has(m.id));
            return [...prev, ...newMsgs];
          });
        }
        hasMoreRef.current = data.length === PAGE_SIZE;
        pageRef.current++;

        // Mark unread messages as read
        const unreadIds = data
          .filter((m: any) => m.receiver_id === currentUserId && !m.read_at)
          .map((m: any) => m.id);
        if (unreadIds.length > 0) {
          const token = await getAccessToken();
          if (token) await markMessagesRead(token, unreadIds);
        }
      }
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    } finally {
      setLoading(false);
    }
  }, [currentUserId, otherUserId]);

  // Initial fetch
  useEffect(() => {
    if (currentUserId && otherUserId) fetchMessages(true);
  }, [currentUserId, otherUserId, fetchMessages]);

  // Real-time subscription
  useEffect(() => {
    if (!currentUserId || !otherUserId) return;

    const channel = supabase
      .channel(`dm:${currentUserId}:${otherUserId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages",
      }, (payload) => {
        const newMsg = payload.new as Message;
        if (
          (newMsg.sender_id === currentUserId && newMsg.receiver_id === otherUserId) ||
          (newMsg.sender_id === otherUserId && newMsg.receiver_id === currentUserId)
        ) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          // Mark as read if it's from the other user
          if (newMsg.sender_id === otherUserId) {
            void getAccessToken().then((token) => {
              if (token) markMessagesRead(token, [newMsg.id]);
            });
          }
        }
      })
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "messages",
      }, (payload) => {
        const updated = payload.new as Message;
        setMessages((prev) => prev.map((m) => m.id === updated.id ? { ...m, ...updated } : m));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [currentUserId, otherUserId]);

  // Upload file to Supabase Storage
  const uploadFile = async (file: File): Promise<{ url: string; name: string; type: string } | null> => {
    try {
      const ext = file.name.split(".").pop();
      const path = `messages/${currentUserId}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("attachments").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (error) {
        const pubPath = `attachments/${path}`;
        const { error: pubErr } = await supabase.storage.from("public").upload(pubPath, file, {
          cacheControl: "3600",
          upsert: false,
        });
        if (pubErr) return null;
        const { data: urlData } = supabase.storage.from("public").getPublicUrl(pubPath);
        return { url: urlData.publicUrl, name: file.name, type: file.type };
      }
      const { data: urlData } = supabase.storage.from("attachments").getPublicUrl(path);
      return { url: urlData.publicUrl, name: file.name, type: file.type };
    } catch {
      return null;
    }
  };

  // Send message
  const sendMessage = async (
    text: string,
    // Retained for call-site compatibility. Neither is sent:
    // - `html` was a stored-XSS vector, see the note below.
    // - `replyToId` targeted a `reply_to_id` column that no migration ever
    //   created, so including it made PostgREST reject the whole insert and
    //   the message vanished. No caller passes it today. Threaded replies need
    //   the column added before this can do anything.
    html?: string,
    attachments?: AttachmentFile[],
    replyToId?: string
  ) => {
    void html;
    void replyToId;
    if (!currentUserId || !otherUserId) return false;
    setSending(true);

    try {
      const token = await getAccessToken();
      if (!token) {
        console.error("Send error: no active session");
        return false;
      }

      // `html` is intentionally not forwarded. Rich-text message bodies were
      // rendered by MessageBubble through dangerouslySetInnerHTML, which made
      // any crafted markup a stored XSS against the recipient. The column is
      // no longer written or rendered; message_text carries the content.
      let ok = true;

      if (text.trim()) {
        const sent = await sendMessageApi(token, {
          sender_id: currentUserId,
          receiver_id: otherUserId,
          message_text: text.trim(),
        });
        if (!sent) ok = false;
      }

      // Upload & send attachments
      if (attachments && attachments.length > 0) {
        setUploading(true);
        for (const att of attachments) {
          const uploaded = await uploadFile(att.file);
          if (uploaded) {
            const sent = await sendMessageApi(token, {
              sender_id: currentUserId,
              receiver_id: otherUserId,
              message_text: `📎 ${uploaded.name}`,
              attachment_url: uploaded.url,
              attachment_name: uploaded.name,
              attachment_type: uploaded.type,
            });
            if (!sent) ok = false;
          } else {
            ok = false;
          }
        }
        setUploading(false);
      }

      return ok;
    } catch (err) {
      console.error("Send error:", err);
      return false;
    } finally {
      setSending(false);
    }
  };

  return {
    messages,
    loading,
    sending,
    uploading,
    otherUser,
    sendMessage,
    refetch: () => fetchMessages(true),
    hasMore: hasMoreRef.current,
  };
}

// ── Utilities ───────────────────────────────────────────────
export function formatMessageTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const mins = diff / (1000 * 60);
  const hours = diff / (1000 * 60 * 60);

  if (mins < 1) return "Now";
  if (mins < 60) return `${Math.floor(mins)}m`;
  if (hours < 24) return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (hours < 48) return "Yesterday";
  if (hours < 168) return date.toLocaleDateString([], { weekday: "short" });
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

export function getDateLabel(dateStr: string): string {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" });
}

export function formatRichText(text: string): { text: string; html: string } {
  let html = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
  html = html.replace(/~~(.*?)~~/g, "<s>$1</s>");
  html = html.replace(/==(.*?)==/g, '<mark style="background-color:#fef08a;padding:0 2px;border-radius:2px;">$1</mark>');
  html = html.replace(/\n/g, "<br>");
  return { text, html };
}
