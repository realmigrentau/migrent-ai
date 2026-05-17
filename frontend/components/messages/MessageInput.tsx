import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Send,
  Smile,
  Bold,
  Italic,
  Strikethrough,
  Highlighter,
  Paperclip,
  Image as ImageIcon,
  FileText,
  X,
  Loader2,
  Mic,
  Sparkles,
} from "lucide-react";
import { AttachmentFile, formatRichText } from "../../hooks/useMessages";

// ── Emoji categories ────────────────────────────────────────
const EMOJI_CATEGORIES = [
  { label: "Smileys", emojis: ["😀","😂","🥹","😍","🤩","😎","🥳","😭","😤","🤔","😱","🫡","😈","💀","🤡","👻","🫠","🥺","😴","🤮"] },
  { label: "Gestures", emojis: ["👍","👎","👋","🤝","✌️","🤞","🫶","👏","🙏","💪","🫵","🖕","✋","🤙","👀","🫣","🤷","🙄","🤦","🫰"] },
  { label: "Hearts", emojis: ["❤️","🧡","💛","💚","💙","💜","🖤","🤍","💔","❤️‍🔥","💕","💞","💓","💗","💖","💘","💝","♥️","🫀","💟"] },
  { label: "Objects", emojis: ["🔥","⭐","✨","💫","🌈","💰","💎","🎁","🎉","🎊","🏆","🎯","💡","📌","🔑","🏠","🚗","✈️","🚀","⚡"] },
  { label: "Reactions", emojis: ["💯","✅","❌","⚠️","🚩","💤","💬","👑","🎵","🎶","📸","🔔","💌","🏳️","🎭","🃏","♟️","🧩","🪄","🫧"] },
];

// ── Quick response stickers ──────────────────────────────────
const MEME_STICKERS = [
  { label: "Sounds great!", value: "Sounds great! 👍" },
  { label: "Thank you", value: "Thank you so much! 🙏" },
  { label: "On my way", value: "On my way! 🚗" },
  { label: "Confirmed", value: "Confirmed, thank you! ✅" },
  { label: "Let me check", value: "Let me check and get back to you shortly." },
  { label: "Available", value: "Yes, it's still available! 🏠" },
  { label: "Interested", value: "I'm very interested! When can I view?" },
  { label: "Perfect", value: "Perfect, that works for me! ✨" },
  { label: "Will do", value: "Will do, thanks for letting me know!" },
  { label: "See you then", value: "See you then! Looking forward to it." },
  { label: "Noted", value: "Noted, I'll keep that in mind. 📝" },
  { label: "No worries", value: "No worries at all! Take your time." },
];

interface MessageInputProps {
  otherUserName: string;
  onSend: (text: string, html?: string, attachments?: AttachmentFile[]) => Promise<boolean>;
  sending: boolean;
  uploading: boolean;
  onTyping?: () => void;
  onStopTyping?: () => void;
  replyTo?: { id: string; text: string } | null;
  onCancelReply?: () => void;
  disabled?: boolean;
}

export default function MessageInput({
  otherUserName,
  onSend,
  sending,
  uploading,
  onTyping,
  onStopTyping,
  replyTo,
  onCancelReply,
  disabled,
}: MessageInputProps) {
  const [text, setText] = useState("");
  const [attachments, setAttachments] = useState<AttachmentFile[]>([]);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showMemes, setShowMemes] = useState(false);
  const [showPlus, setShowPlus] = useState(false);
  const [showFormatBar, setShowFormatBar] = useState(false);
  const [emojiCategory, setEmojiCategory] = useState(0);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close popovers on click outside
  useEffect(() => {
    const handler = () => {
      setShowEmoji(false);
      setShowMemes(false);
      setShowPlus(false);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  // Auto-resize textarea
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
    onTyping?.();
  };

  const handleSend = async () => {
    if ((!text.trim() && attachments.length === 0) || sending) return;

    const { text: plainText, html } = formatRichText(text.trim());
    const success = await onSend(plainText, html, attachments.length > 0 ? attachments : undefined);

    if (success) {
      setText("");
      setAttachments([]);
      onStopTyping?.();
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // File handling
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const MAX_SIZE = 50 * 1024 * 1024;
    const MAX_FILES = 10;

    const valid = files.filter((f) => f.size <= MAX_SIZE).slice(0, MAX_FILES - attachments.length);

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
    e.target.value = "";
    // Reset accept attribute
    if (fileInputRef.current) fileInputRef.current.removeAttribute("accept");
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const insertText = (insert: string) => {
    const ta = textareaRef.current;
    if (ta) {
      const start = ta.selectionStart;
      const newVal = text.substring(0, start) + insert + text.substring(ta.selectionEnd);
      setText(newVal);
      setTimeout(() => {
        ta.selectionStart = ta.selectionEnd = start + insert.length;
        ta.focus();
      }, 0);
    } else {
      setText((prev) => prev + insert);
    }
  };

  const insertFormatting = (format: "bold" | "italic" | "strikethrough" | "highlight") => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const sel = text.substring(start, end);
    const wrappers: Record<string, string> = {
      bold: "**",
      italic: "*",
      strikethrough: "~~",
      highlight: "==",
    };
    const w = wrappers[format];
    const newText = text.substring(0, start) + w + (sel || "") + w + text.substring(end);
    setText(newText);
    setTimeout(() => {
      ta.selectionStart = ta.selectionEnd = sel ? end + w.length * 2 : start + w.length;
      ta.focus();
    }, 0);
  };

  const isDisabled = disabled || sending || uploading;
  const canSend = (text.trim() || attachments.length > 0) && !isDisabled;

  return (
    <div className="border-t border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl">
      {/* Reply preview */}
      <AnimatePresence>
        {replyTo && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pt-2.5 pb-1 flex items-center gap-2">
              <div className="flex-1 pl-3 border-l-2 border-[var(--color-primary)]">
                <p className="text-[11px] font-semibold text-[var(--color-primary)]">Replying to</p>
                <p className="text-[12px] text-slate-500 dark:text-slate-400 truncate">{replyTo.text}</p>
              </div>
              <button
                onClick={onCancelReply}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Attachment previews */}
      <AnimatePresence>
        {attachments.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pt-2 pb-1">
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                {attachments.map((att) => (
                  <div key={att.id} className="relative shrink-0 group/att">
                    {att.preview ? (
                      <img
                        src={att.preview}
                        alt=""
                        className="w-16 h-16 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center ring-1 ring-slate-200 dark:ring-slate-700">
                        <FileText className="w-5 h-5 text-slate-400" />
                        <span className="text-[9px] text-slate-400 mt-0.5 truncate max-w-[56px] px-1">
                          {att.file.name.split(".").pop()?.toUpperCase()}
                        </span>
                      </div>
                    )}
                    <button
                      onClick={() => removeAttachment(att.id)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover/att:opacity-100 transition-opacity shadow-lg"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                {attachments.length < 10 && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center text-slate-400 hover:border-[var(--color-line-2)] hover:text-[var(--color-primary)] transition-all shrink-0"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                )}
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                {attachments.length}/10 files
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Format toolbar */}
      <AnimatePresence>
        {showFormatBar && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="px-4 pt-2 pb-1 flex items-center gap-1">
              <button onClick={() => insertFormatting("bold")} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Bold **text**">
                <Bold className="w-4 h-4" />
              </button>
              <button onClick={() => insertFormatting("italic")} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Italic *text*">
                <Italic className="w-4 h-4" />
              </button>
              <button onClick={() => insertFormatting("strikethrough")} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Strikethrough ~~text~~">
                <Strikethrough className="w-4 h-4" />
              </button>
              <button onClick={() => insertFormatting("highlight")} className="p-1.5 rounded-lg text-slate-400 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-500/10 transition-colors" title="Highlight ==text==">
                <Highlighter className="w-4 h-4" />
              </button>
              <span className="text-[10px] text-slate-400 ml-2">Select text, then format</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main input row */}
      <div className="px-3 pb-3 pt-2 flex items-end gap-1.5">
        {/* Plus / attach */}
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => { setShowPlus(!showPlus); setShowEmoji(false); setShowMemes(false); }}
            className={`p-2 rounded-xl transition-all shrink-0 ${
              showPlus
                ? "bg-[var(--color-primary-soft)] dark:bg-[var(--color-primary)]/20 text-[var(--color-primary)] dark:text-[var(--color-primary)]"
                : "text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Plus className="w-5 h-5" />
          </button>

          <AnimatePresence>
            {showPlus && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                className="absolute bottom-12 left-0 w-56 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xl z-50 overflow-hidden py-1"
              >
                <button
                  onClick={() => { fileInputRef.current?.click(); setShowPlus(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-[var(--color-primary-soft)] dark:bg-[var(--color-primary)]/20 flex items-center justify-center">
                    <Paperclip className="w-4 h-4 text-[var(--color-primary)] dark:text-[var(--color-primary)]" />
                  </div>
                  Upload Files
                </button>
                <button
                  onClick={() => {
                    if (fileInputRef.current) fileInputRef.current.setAttribute("accept", "image/*");
                    fileInputRef.current?.click();
                    setShowPlus(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-[var(--color-accent-soft)] dark:bg-[var(--color-accent-soft)]0/20 flex items-center justify-center">
                    <ImageIcon className="w-4 h-4 text-[var(--color-accent)] dark:text-[var(--color-accent)]" />
                  </div>
                  Upload Photos
                </button>
                <button
                  onClick={() => {
                    if (fileInputRef.current) fileInputRef.current.setAttribute("accept", ".pdf,.doc,.docx");
                    fileInputRef.current?.click();
                    setShowPlus(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-[var(--color-primary-soft)] dark:bg-[var(--color-primary)]/20 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-[var(--color-primary)] dark:text-[var(--color-primary)]" />
                  </div>
                  Send Contract/PDF
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

        {/* Format toggle */}
        <button
          onClick={() => setShowFormatBar(!showFormatBar)}
          className={`p-2 rounded-xl transition-all shrink-0 ${
            showFormatBar
              ? "text-[var(--color-primary)] bg-[var(--color-primary-soft)] dark:bg-[var(--color-primary)]/10"
              : "text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
          title="Formatting"
        >
          <span className="text-xs font-bold leading-none">Aa</span>
        </button>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          placeholder={`Message ${otherUserName}...`}
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          rows={1}
          disabled={isDisabled}
          className="flex-1 resize-none rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white px-4 py-2.5 text-sm focus:ring-2 focus:ring-[var(--color-ink)]/30 focus:border-transparent placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none transition-all disabled:opacity-50"
          style={{ minHeight: "42px", maxHeight: "120px" }}
        />

        {/* Memes */}
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => { setShowMemes(!showMemes); setShowEmoji(false); setShowPlus(false); }}
            className={`p-2 rounded-xl transition-all shrink-0 ${
              showMemes
                ? "text-[var(--color-primary)] bg-[var(--color-primary-soft)] dark:bg-[var(--color-primary-soft)]0/10"
                : "text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
            title="Quick reactions"
          >
            <Sparkles className="w-5 h-5" />
          </button>

          <AnimatePresence>
            {showMemes && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                className="absolute bottom-12 right-0 w-64 max-h-72 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xl z-50 overflow-hidden"
              >
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700">
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Quick Responses</p>
                </div>
                <div className="overflow-y-auto max-h-56 p-2 grid grid-cols-2 gap-1">
                  {MEME_STICKERS.map((meme) => (
                    <button
                      key={meme.value}
                      onClick={() => { insertText(meme.value); setShowMemes(false); }}
                      className="text-left px-3 py-2 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-[var(--color-primary-soft)] dark:hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] transition-colors truncate"
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
            className={`p-2 rounded-xl transition-all shrink-0 ${
              showEmoji
                ? "bg-yellow-50 dark:bg-yellow-500/10"
                : "hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
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
                className="absolute bottom-12 right-0 w-80 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xl z-50 overflow-hidden"
              >
                <div className="flex gap-0.5 px-2 pt-2 pb-1 border-b border-slate-100 dark:border-slate-700 overflow-x-auto scrollbar-hide">
                  {EMOJI_CATEGORIES.map((cat, i) => (
                    <button
                      key={cat.label}
                      onClick={() => setEmojiCategory(i)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all ${
                        emojiCategory === i
                          ? "bg-[var(--color-primary-soft)] dark:bg-[var(--color-primary)]/20 text-[var(--color-primary)] dark:text-[var(--color-primary)]"
                          : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
                <div className="p-2 grid grid-cols-10 gap-0.5 max-h-48 overflow-y-auto">
                  {EMOJI_CATEGORIES[emojiCategory].emojis.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => insertText(emoji)}
                      className="w-8 h-8 flex items-center justify-center text-xl hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all hover:scale-110"
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
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleSend}
          disabled={!canSend}
          className={`p-2.5 rounded-xl transition-all shrink-0 shadow-lg ${
            canSend
              ? "bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary)] text-white hover:shadow-[var(--color-primary)]/20 hover:shadow-xl"
              : "bg-slate-200 dark:bg-slate-700 text-slate-400 shadow-none"
          }`}
        >
          {sending || uploading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </motion.button>
      </div>
    </div>
  );
}
