import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import { useThreads, useChat, Thread, Message, getDateLabel } from "../hooks/useMessages";
import { useTypingIndicator } from "../hooks/useTypingIndicator";
import ConversationList from "../components/messages/ConversationList";
import ChatHeader from "../components/messages/ChatHeader";
import MessageBubble from "../components/messages/MessageBubble";
import MessageInput from "../components/messages/MessageInput";
import MediaGallery from "../components/messages/MediaGallery";
import QuickReplies from "../components/messages/QuickReplies";
import Link from "next/link";
import {
  MessageCircle,
  Sparkles,
  Send,
  ArrowRight,
  Shield,
  Zap,
  Heart,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════
// MESSAGES PAGE - WhatsApp-Level Unified Messaging Experience
// Split-pane: Conversation List (left) + Active Chat (right)
// Mobile: Full-screen transitions between list and chat
// ═══════════════════════════════════════════════════════════════

export default function MessagesPage() {
  const { session, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { userId: queryUserId } = router.query;

  // ── Active conversation state ──
  const [activeThread, setActiveThread] = useState<Thread | null>(null);
  const [showChat, setShowChat] = useState(false); // Mobile: show chat view
  const [replyTo, setReplyTo] = useState<{ id: string; text: string } | null>(null);

  // ── Media gallery state ──
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [showGallery, setShowGallery] = useState(false);

  // ── Hooks ──
  const { threads, loading: threadsLoading, totalUnread } = useThreads(user?.id);
  const {
    messages,
    loading: messagesLoading,
    sending,
    uploading,
    otherUser,
    sendMessage,
  } = useChat(user?.id, activeThread?.other_user_id);

  const { isOtherTyping, broadcastTyping, stopTyping } = useTypingIndicator(
    user?.id,
    activeThread?.other_user_id,
    user?.user_metadata?.name || user?.email?.split("@")[0]
  );

  // ── Refs ──
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // ── Auto-scroll to bottom on new messages ──
  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior });
    }, 50);
  }, []);

  useEffect(() => {
    if (messages.length > 0 && !messagesLoading) {
      scrollToBottom();
    }
  }, [messages.length, messagesLoading, scrollToBottom]);

  // ── Handle URL query param for direct navigation ──
  useEffect(() => {
    if (queryUserId && typeof queryUserId === "string" && threads.length > 0) {
      const found = threads.find((t) => t.other_user_id === queryUserId);
      if (found) {
        setActiveThread(found);
        setShowChat(true);
      } else {
        // Create a temporary thread for the user
        setActiveThread({
          other_user_id: queryUserId,
          other_user_name: "User",
          last_message: "",
          last_message_at: new Date().toISOString(),
          unread_count: 0,
          is_direct: true,
          folder: "active",
        });
        setShowChat(true);
      }
    }
  }, [queryUserId, threads]);

  // ── Thread selection handler ──
  const handleSelectThread = (thread: Thread) => {
    setActiveThread(thread);
    setShowChat(true);
    setReplyTo(null);
    // Update URL without full navigation
    window.history.replaceState(null, "", `/messages?userId=${thread.other_user_id}`);
  };

  // ── Back to list (mobile) ──
  const handleBack = () => {
    setShowChat(false);
    setActiveThread(null);
    setReplyTo(null);
    window.history.replaceState(null, "", "/messages");
  };

  // ── Send handler ──
  const handleSend = async (text: string, html?: string, attachments?: any[]) => {
    const success = await sendMessage(text, html, attachments, replyTo?.id);
    if (success) {
      setReplyTo(null);
      scrollToBottom();
    }
    return success;
  };

  // ── Quick reply handler ──
  const handleQuickReply = (text: string) => {
    handleSend(text);
  };

  // ── Image click → gallery ──
  const handleImageClick = (url: string) => {
    const allImages = messages
      .filter((m) => m.attachment_url && m.attachment_type?.startsWith("image/"))
      .map((m) => m.attachment_url!);
    const index = allImages.indexOf(url);
    setGalleryImages(allImages);
    setGalleryIndex(index >= 0 ? index : 0);
    setShowGallery(true);
  };

  // ── Group messages for bubble rendering ──
  const getMessageGroups = () => {
    return messages.map((msg, i) => {
      const prev = messages[i - 1];
      const next = messages[i + 1];
      const isMine = msg.sender_id === user?.id;

      // Date separator
      const showDate =
        i === 0 ||
        (prev &&
          new Date(msg.created_at).toDateString() !== new Date(prev.created_at).toDateString());

      // Group logic (same sender, within 2 minutes)
      const sameAsPrev =
        prev &&
        prev.sender_id === msg.sender_id &&
        new Date(msg.created_at).getTime() - new Date(prev.created_at).getTime() < 120000;
      const sameAsNext =
        next &&
        next.sender_id === msg.sender_id &&
        new Date(next.created_at).getTime() - new Date(msg.created_at).getTime() < 120000;

      return {
        message: msg,
        isMine,
        showDate,
        dateLabel: showDate ? getDateLabel(msg.created_at) : undefined,
        isFirstInGroup: !sameAsPrev,
        isLastInGroup: !sameAsNext,
      };
    });
  };

  // ── Auth loading ──
  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-[var(--color-line-2)] dark:border-[var(--color-primary-soft)] border-t-[var(--color-ink)] rounded-full animate-spin" />
      </div>
    );
  }

  // ── Not authenticated ──
  if (!session) {
    return (
      <div className="flex items-center justify-center py-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-sm w-full text-center"
        >
          <div className="w-20 h-20 mx-auto rounded-2xl bg-[var(--color-primary)] flex items-center justify-center mb-6">
            <MessageCircle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white mb-2">
            Sign in to Messages
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Connect with hosts and seekers securely.
          </p>
          <Link
            href="/signin?redirect=/messages"
            className="btn-primary py-3 px-8 rounded-xl text-sm inline-flex items-center gap-2"
          >
            Sign In <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    );
  }

  // ── Main layout ──
  return (
    <>
      <div className="flex rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden shadow-sm" style={{ height: "calc(100vh - 10rem)" }}>
        {/* ════════════════════════════════════════════════════════
            LEFT SIDEBAR - Conversation List
            ════════════════════════════════════════════════════════ */}
        <div
          className={`${
            showChat ? "hidden lg:flex" : "flex"
          } w-full lg:w-[380px] xl:w-[420px] flex-col border-r border-slate-200 dark:border-slate-800 shrink-0`}
        >
          <ConversationList
            threads={threads}
            loading={threadsLoading}
            totalUnread={totalUnread}
            activeThreadId={activeThread?.other_user_id}
            onSelectThread={handleSelectThread}
          />
        </div>

        {/* ════════════════════════════════════════════════════════
            RIGHT PANEL - Active Chat
            ════════════════════════════════════════════════════════ */}
        <div
          className={`${
            showChat ? "flex" : "hidden lg:flex"
          } flex-1 flex-col min-w-0`}
        >
          {activeThread ? (
            <>
              {/* Chat Header */}
              <ChatHeader
                userName={otherUser?.preferred_name || otherUser?.name || activeThread.other_user_name}
                userAvatar={otherUser?.custom_pfp || activeThread.other_user_pfp}
                userId={activeThread.other_user_id}
                isOnline={activeThread.is_online}
                isTyping={isOtherTyping}
                listingTitle={activeThread.listing_title}
                isPinned={activeThread.is_pinned}
                isMuted={activeThread.is_muted}
                onBack={handleBack}
                onViewProfile={() =>
                  router.push(`/profile/${activeThread.other_user_id}`)
                }
              />

              {/* Messages area */}
              <div
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto px-4 pt-4 pb-2 messages-scroll"
              >
                {messagesLoading ? (
                  <div className="flex flex-col items-center justify-center h-full gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                    <p className="text-xs text-slate-400">Loading messages...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <ChatEmpty
                    userName={otherUser?.preferred_name || otherUser?.name || activeThread.other_user_name}
                  />
                ) : (
                  <>
                    {/* Encryption notice */}
                    <div className="flex justify-center mb-6">
                      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500">
                        <Shield className="w-3 h-3" />
                        <span className="text-[10px] font-medium">
                          Messages are private between you and {activeThread.other_user_name}
                        </span>
                      </div>
                    </div>

                    {/* Message bubbles */}
                    {getMessageGroups().map(({ message, isMine, showDate, dateLabel, isFirstInGroup, isLastInGroup }) => (
                      <MessageBubble
                        key={message.id}
                        message={message}
                        isMine={isMine}
                        showDate={showDate}
                        dateLabel={dateLabel}
                        otherUserAvatar={otherUser?.custom_pfp || activeThread.other_user_pfp}
                        otherUserName={otherUser?.preferred_name || otherUser?.name || activeThread.other_user_name}
                        onReply={(msg) => setReplyTo({ id: msg.id, text: msg.message_text })}
                        onImageClick={handleImageClick}
                        isFirstInGroup={isFirstInGroup}
                        isLastInGroup={isLastInGroup}
                      />
                    ))}

                    {/* Typing indicator */}
                    <AnimatePresence>
                      {isOtherTyping && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          className="flex items-center gap-2 ml-9 mb-2"
                        >
                          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-bl-md px-4 py-2.5 shadow-sm">
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                            </div>
                          </div>
                          <span className="text-[10px] text-[var(--color-accent)] font-medium">
                            {activeThread.other_user_name} is typing
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Quick replies */}
              <QuickReplies onSelect={handleQuickReply} />

              {/* Message input */}
              <MessageInput
                otherUserName={
                  otherUser?.preferred_name || otherUser?.name || activeThread.other_user_name
                }
                onSend={handleSend}
                sending={sending}
                uploading={uploading}
                onTyping={broadcastTyping}
                onStopTyping={stopTyping}
                replyTo={replyTo}
                onCancelReply={() => setReplyTo(null)}
              />
            </>
          ) : (
            /* No chat selected - Welcome screen */
            <WelcomeScreen />
          )}
        </div>
      </div>

      {/* Media Gallery overlay */}
      <MediaGallery
        images={galleryImages}
        initialIndex={galleryIndex}
        isOpen={showGallery}
        onClose={() => setShowGallery(false)}
      />
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
// WELCOME SCREEN - Shown when no chat is selected (desktop)
// ═══════════════════════════════════════════════════════════════
function WelcomeScreen() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/20 px-8 rounded-r-2xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md"
      >
        {/* Animated icon cluster */}
        <div className="relative w-32 h-32 mx-auto mb-8">
          <motion.div
            animate={{ y: [0, -8, 0], rotate: [0, 3, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary)] flex items-center justify-center shadow-2xl shadow-[var(--color-primary)]/20 rotate-6">
              <MessageCircle className="w-12 h-12 text-white" />
            </div>
          </motion.div>
          <motion.div
            animate={{ y: [0, -4, 0], rotate: [0, -5, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
            className="absolute -top-2 -right-2"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent)] flex items-center justify-center shadow-lg shadow-emerald-500/20 -rotate-12">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
          </motion.div>
          <motion.div
            animate={{ y: [0, -6, 0], rotate: [0, 8, 0] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
            className="absolute -bottom-1 -left-3"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary)] flex items-center justify-center shadow-lg shadow-[var(--color-primary)]/500/20 rotate-12">
              <Heart className="w-5 h-5 text-white" />
            </div>
          </motion.div>
        </div>

        <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white mb-3">
          Your Messages
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8 max-w-sm mx-auto">
          Select a conversation to start messaging. Connect with hosts and seekers securely and instantly.
        </p>

        {/* Feature highlights */}
        <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto">
          {[
            { icon: Zap, label: "Instant", sublabel: "Real-time chat", color: "from-amber-400 to-orange-500" },
            { icon: Shield, label: "Secure", sublabel: "Private messages", color: "from-[var(--color-accent)] to-[var(--color-accent)]" },
            { icon: Send, label: "Rich", sublabel: "Files & media", color: "from-[var(--color-primary)] to-[var(--color-primary)]" },
          ].map(({ icon: Icon, label, sublabel, color }) => (
            <div key={label} className="text-center">
              <div className={`w-12 h-12 mx-auto mb-2 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{label}</p>
              <p className="text-[10px] text-slate-400">{sublabel}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// CHAT EMPTY - Shown when a chat has no messages yet
// ═══════════════════════════════════════════════════════════════
function ChatEmpty({ userName }: { userName: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xs"
      >
        <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-[var(--color-primary-soft)] to-[var(--color-accent-soft)] dark:from-[var(--color-primary)]/10 dark:to-[var(--color-accent)]/10 flex items-center justify-center rotate-3">
          <Send className="w-8 h-8 text-[var(--color-primary)] -rotate-3" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
          Start the conversation
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Say hi to <span className="font-semibold text-[var(--color-primary)]">{userName}</span> and get the conversation going!
        </p>
      </motion.div>
    </div>
  );
}
