import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Reply,
  Copy,
  Paperclip,
  Download,
  Check,
  CheckCheck,
} from "lucide-react";
import { Message } from "../../hooks/useMessages";

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
  onReply,
  onImageClick,
  isLastInGroup,
}: MessageBubbleProps) {
  const [showActions, setShowActions] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  const hasHtml = !!message.message_html;
  const isImage = message.attachment_type?.startsWith("image/");
  const isAttachmentOnly = message.attachment_url && message.message_text.startsWith("📎");

  const handleTouchStart = () => {
    longPressTimer.current = setTimeout(() => setShowReactions(true), 500);
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

  const timeLabel = new Date(message.created_at).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const dayLabel = new Date(message.created_at)
    .toLocaleDateString("en-AU", { weekday: "short" })
    .slice(0, 3)
    .toUpperCase();

  // Bubble border-radius matches design's asymmetric shape
  const bubbleRadius = isMine
    ? "14px 14px 4px 14px"
    : "14px 14px 14px 4px";

  return (
    <>
      {/* Date separator pill */}
      {showDate && dateLabel && (
        <div className="text-center my-3">
          <span className="inline-block px-2.5 py-1 rounded-full bg-[var(--color-surface-sunk)] text-[11px] text-[var(--color-ink-3)] font-semibold uppercase tracking-[0.04em]">
            {dateLabel}
          </span>
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.12 }}
        className={`flex ${isMine ? "justify-end" : "justify-start"} mb-3.5 group relative`}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => {
          setShowActions(false);
          setShowReactions(false);
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="max-w-[70%] flex flex-col gap-1"
          style={{ alignItems: isMine ? "flex-end" : "flex-start" }}
        >
          {/* Reaction toolbar */}
          <AnimatePresence>
            {(showReactions || showActions) && (
              <motion.div
                initial={{ opacity: 0, y: 4, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.95 }}
                className={`absolute ${isMine ? "right-0" : "left-0"} -top-9 z-30 flex items-center gap-0.5 bg-[var(--color-surface-2)] rounded-full border border-[var(--color-line)] shadow-[var(--shadow-pop)] px-1 py-0.5`}
              >
                {QUICK_REACTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleReaction(emoji)}
                    className="w-7 h-7 flex items-center justify-center rounded-full text-base hover:scale-125 transition-transform"
                  >
                    {emoji}
                  </button>
                ))}
                <div className="w-px h-4 bg-[var(--color-line)] mx-0.5" />
                {onReply && (
                  <button
                    onClick={() => {
                      onReply(message);
                      setShowActions(false);
                    }}
                    className="w-6 h-6 flex items-center justify-center rounded-full text-[var(--color-ink-3)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-sunk)] transition-colors"
                  >
                    <Reply className="w-3 h-3" />
                  </button>
                )}
                <button
                  onClick={handleCopy}
                  className="w-6 h-6 flex items-center justify-center rounded-full text-[var(--color-ink-3)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-sunk)] transition-colors"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Reply quote */}
          {message.reply_to_text && (
            <div
              className="text-[11px] px-3 py-1.5 rounded-[6px] border-l-2 max-w-full truncate"
              style={{
                background: isMine ? "var(--color-primary-soft)" : "var(--color-surface-sunk)",
                borderLeftColor: "var(--color-accent)",
                color: "var(--color-ink-2)",
              }}
            >
              <div className="font-semibold">Reply</div>
              <div className="truncate">{message.reply_to_text}</div>
            </div>
          )}

          {/* Image attachment (preview above bubble) */}
          {message.attachment_url && isImage && (
            <motion.button
              whileHover={{ scale: 1.01 }}
              type="button"
              onClick={() => onImageClick?.(message.attachment_url!)}
              className="rounded-[12px] overflow-hidden cursor-pointer"
            >
              <img
                src={message.attachment_url}
                alt={message.attachment_name || ""}
                className="max-w-full max-h-72 object-cover block"
                loading="lazy"
              />
            </motion.button>
          )}

          {/* Text bubble */}
          {message.message_text && !isAttachmentOnly && (
            <div
              className="text-[14px] leading-[1.5]"
              style={{
                padding: "10px 14px",
                background: isMine ? "var(--color-primary)" : "var(--color-surface)",
                color: isMine ? "var(--color-primary-fg)" : "var(--color-ink)",
                border: isMine ? "none" : "1px solid var(--color-line)",
                borderRadius: bubbleRadius,
                maxWidth: "100%",
              }}
            >
              {hasHtml ? (
                <div
                  className="break-words [&_strong]:font-bold [&_em]:italic [&_s]:line-through [&_mark]:rounded-sm"
                  dangerouslySetInnerHTML={{ __html: message.message_html! }}
                />
              ) : (
                <span className="break-words whitespace-pre-wrap">{message.message_text}</span>
              )}

              {/* Inline file attachment chip (non-image) */}
              {message.attachment_url && !isImage && (
                <a
                  href={message.attachment_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 flex items-center gap-2 px-2.5 py-2 rounded-[6px] bg-[var(--color-surface-2)] border border-[var(--color-line)] text-[var(--color-ink)] hover:border-[var(--color-line-2)] transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Paperclip className="w-3.5 h-3.5 text-[var(--color-ink-3)]" />
                  <span className="flex-1 text-[12.5px] font-semibold truncate">
                    {message.attachment_name || "Attachment"}
                  </span>
                  <Download className="w-3 h-3 text-[var(--color-ink-3)]" />
                </a>
              )}
            </div>
          )}

          {/* File attachment alone (no text bubble) */}
          {message.attachment_url && !isImage && isAttachmentOnly && (
            <a
              href={message.attachment_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2.5 rounded-[10px] bg-[var(--color-surface)] border border-[var(--color-line)] hover:border-[var(--color-line-2)] transition-colors max-w-[280px]"
            >
              <Paperclip className="w-3.5 h-3.5 text-[var(--color-ink-3)]" />
              <span className="flex-1 text-[12.5px] font-semibold text-[var(--color-ink)] truncate">
                {message.attachment_name || "Attachment"}
              </span>
              <Download className="w-3 h-3 text-[var(--color-ink-3)]" />
            </a>
          )}

          {/* Reaction badge */}
          {selectedReaction && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-[11px] bg-[var(--color-surface-2)] border border-[var(--color-line)] rounded-full px-1.5 py-0.5"
            >
              {selectedReaction}
            </motion.span>
          )}

          {/* Mono timestamp + receipts */}
          <span className="font-mono text-[10.5px] text-[var(--color-ink-3)] flex items-center gap-1">
            {dayLabel} · {timeLabel}
            {isMine && message.read_at && (
              <CheckCheck className="w-2.5 h-2.5 text-[var(--color-accent)]" />
            )}
            {isMine && !message.read_at && isLastInGroup && (
              <Check className="w-2.5 h-2.5" />
            )}
          </span>
        </div>
      </motion.div>
    </>
  );
}
