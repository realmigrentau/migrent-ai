import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Reply,
  Forward,
  Copy,
  Trash2,
  MoreHorizontal,
  Check,
  CheckCheck,
  Download,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import { Message, getDateLabel } from "../../hooks/useMessages";

// ── Quick reactions ─────────────────────────────────────────
const QUICK_REACTIONS = ["❤️", "👍", "😂", "🔥", "😮"];

interface MessageBubbleProps {
  message: Message;
  isMine: boolean;
  showDate: boolean;
  dateLabel?: string;
  otherUserAvatar?: string;
  otherUserName?: string;
  onReply?: (msg: Message) => void;
  onForward?: (msg: Message) => void;
  onImageClick?: (url: string) => void;
  isLastInGroup?: boolean;
  isFirstInGroup?: boolean;
}

export default function MessageBubble({
  message,
  isMine,
  showDate,
  dateLabel,
  otherUserAvatar,
  otherUserName,
  onReply,
  onForward,
  onImageClick,
  isLastInGroup,
  isFirstInGroup,
}: MessageBubbleProps) {
  const [showActions, setShowActions] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  const hasHtml = !!message.message_html;
  const isImage = message.attachment_type?.startsWith("image/");
  const isAttachmentOnly = message.attachment_url && message.message_text.startsWith("📎");

  // Long press for mobile reactions
  const handleTouchStart = () => {
    longPressTimer.current = setTimeout(() => {
      setShowReactions(true);
    }, 500);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };

  const handleReaction = (emoji: string) => {
    setSelectedReaction(emoji === selectedReaction ? null : emoji);
    setShowReactions(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message.message_text);
    setShowActions(false);
  };

  return (
    <>
      {/* Date separator */}
      {showDate && dateLabel && (
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700/50 to-transparent" />
          <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-900 px-3 py-1 rounded-full">
            {dateLabel}
          </span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700/50 to-transparent" />
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 6, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.15 }}
        className={`flex ${isMine ? "justify-end" : "justify-start"} ${
          isLastInGroup ? "mb-2.5" : "mb-0.5"
        } group relative`}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => { setShowActions(false); setShowReactions(false); }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Other user avatar (only on last in group) */}
        {!isMine && (
          <div className="w-7 mr-2 shrink-0">
            {isLastInGroup && (
              <div className={`w-7 h-7 rounded-full flex items-center justify-center overflow-hidden mt-auto ${
                otherUserAvatar ? "bg-slate-200 dark:bg-slate-700" : "bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)]"
              }`}>
                {otherUserAvatar ? (
                  <img src={otherUserAvatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[10px] font-bold text-white">
                    {(otherUserName || "U").charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        <div className="max-w-[72%] sm:max-w-sm relative">
          {/* Reaction bar (floating) */}
          <AnimatePresence>
            {(showReactions || showActions) && (
              <motion.div
                initial={{ opacity: 0, y: 4, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.9 }}
                className={`absolute ${isMine ? "right-0" : "left-0"} -top-10 z-30 flex items-center gap-0.5 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 shadow-xl px-1 py-0.5`}
              >
                {QUICK_REACTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleReaction(emoji)}
                    className={`w-8 h-8 flex items-center justify-center rounded-full text-base transition-all hover:scale-125 ${
                      selectedReaction === emoji ? "bg-slate-100 dark:bg-slate-700 scale-110" : ""
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
                <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-0.5" />
                {onReply && (
                  <button
                    onClick={() => { onReply(message); setShowActions(false); }}
                    className="w-7 h-7 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                  >
                    <Reply className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={handleCopy}
                  className="w-7 h-7 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Reply reference */}
          {message.reply_to_text && (
            <div
              className={`text-[11px] px-3 py-1.5 mb-0.5 rounded-t-2xl border-l-2 ${
                isMine
                  ? "bg-[var(--color-primary)]/10 border-[var(--color-line-2)] text-[var(--color-primary)] ml-auto"
                  : "bg-slate-100 dark:bg-slate-800 border-emerald-400 text-slate-500 dark:text-slate-400"
              }`}
            >
              <span className="font-medium">Reply</span>
              <p className="truncate">{message.reply_to_text}</p>
            </div>
          )}

          {/* Image attachment */}
          {message.attachment_url && isImage && (
            <motion.div
              whileHover={{ scale: 1.02 }}
              className={`mb-0.5 rounded-2xl overflow-hidden cursor-pointer shadow-md ${
                isMine ? "ml-auto" : ""
              }`}
              onClick={() => onImageClick?.(message.attachment_url!)}
            >
              <img
                src={message.attachment_url}
                alt={message.attachment_name || ""}
                className="max-w-full max-h-72 rounded-2xl object-cover"
                loading="lazy"
              />
            </motion.div>
          )}

          {/* File attachment (non-image) */}
          {message.attachment_url && !isImage && (
            <a
              href={message.attachment_url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl mb-0.5 transition-all hover:shadow-md ${
                isMine
                  ? "bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary)] text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  isMine ? "bg-white/20" : "bg-slate-200 dark:bg-slate-700"
                }`}
              >
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{message.attachment_name || "File"}</p>
                <p className={`text-xs ${isMine ? "text-white/70" : "text-slate-400"}`}>
                  Tap to download
                </p>
              </div>
              <Download className={`w-4 h-4 shrink-0 ${isMine ? "text-white/50" : "text-slate-400"}`} />
            </a>
          )}

          {/* Text bubble */}
          {message.message_text && !isAttachmentOnly && (
            <div
              className={`rounded-2xl px-4 py-2.5 ${
                isMine
                  ? `bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary)] text-white shadow-md shadow-[var(--color-primary)]/20 ${
                      isLastInGroup ? "rounded-br-md" : ""
                    }`
                  : `bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700/50 shadow-sm ${
                      isLastInGroup ? "rounded-bl-md" : ""
                    }`
              }`}
            >
              {hasHtml ? (
                <div
                  className="text-[14px] leading-relaxed break-words [&_strong]:font-bold [&_em]:italic [&_s]:line-through [&_mark]:rounded-sm"
                  dangerouslySetInnerHTML={{ __html: message.message_html! }}
                />
              ) : (
                <p className="text-[14px] leading-relaxed break-words whitespace-pre-wrap">
                  {message.message_text}
                </p>
              )}
            </div>
          )}

          {/* Selected reaction display */}
          {selectedReaction && (
            <motion.div
              initial={{ scale: 0, y: 8 }}
              animate={{ scale: 1, y: 0 }}
              className={`${isMine ? "text-right" : "text-left"} -mt-1.5 relative z-10`}
            >
              <span className="inline-block text-base bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full px-1.5 py-0.5 shadow-sm cursor-pointer hover:scale-110 transition-transform">
                {selectedReaction}
              </span>
            </motion.div>
          )}

          {/* Time + read receipts */}
          <p
            className={`text-[10px] mt-0.5 px-1 ${
              isMine ? "text-right" : "text-left"
            } text-slate-400 dark:text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity`}
          >
            {new Date(message.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
            {isMine && message.read_at && (
              <span className="ml-1 text-[var(--color-primary)] inline-flex items-center">
                <CheckCheck className="w-3 h-3" />
              </span>
            )}
            {isMine && !message.read_at && (
              <span className="ml-1 inline-flex items-center">
                <Check className="w-3 h-3" />
              </span>
            )}
          </p>
        </div>
      </motion.div>
    </>
  );
}
