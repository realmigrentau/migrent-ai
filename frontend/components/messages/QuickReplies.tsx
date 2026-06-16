import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, ChevronDown, ChevronUp, Settings, Plus, X } from "lucide-react";

// ── Default templates ───────────────────────────────────────
const DEFAULT_TEMPLATES = [
  { id: "1", label: "Room available", text: "Hi! The room is available. Would you like to schedule a viewing?" },
  { id: "2", label: "Send contract", text: "I'll prepare the rental agreement and send it over shortly." },
  { id: "3", label: "Need ID", text: "Could you please complete your ID verification? It helps both of us!" },
  { id: "4", label: "Payment received", text: "Payment received, thank you! Welcome to your new home." },
  { id: "5", label: "Schedule viewing", text: "Let's schedule a viewing! What times work best for you?" },
  { id: "6", label: "Not available", text: "Sorry, this room is no longer available. I can suggest similar listings!" },
  { id: "7", label: "Moved in", text: "Welcome! Please let me know if you need anything to settle in." },
  { id: "8", label: "Thanks!", text: "Thanks for your interest! I'll get back to you shortly." },
];

interface Template {
  id: string;
  label: string;
  text: string;
}

interface QuickRepliesProps {
  onSelect: (text: string) => void;
  expanded?: boolean;
}

export default function QuickReplies({ onSelect, expanded: initialExpanded }: QuickRepliesProps) {
  const [expanded, setExpanded] = useState(initialExpanded ?? false);
  const [templates, setTemplates] = useState<Template[]>(DEFAULT_TEMPLATES);
  const [showAll, setShowAll] = useState(false);

  const visibleTemplates = showAll ? templates : templates.slice(0, 4);

  return (
    <div className="px-3 pb-1">
      {/* Toggle button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--color-primary)] dark:text-[var(--color-primary)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] transition-colors mb-1.5 px-1"
      >
        <Zap className="w-3 h-3" />
        Quick replies
        {expanded ? (
          <ChevronUp className="w-3 h-3" />
        ) : (
          <ChevronDown className="w-3 h-3" />
        )}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap gap-1.5 mb-2">
              {visibleTemplates.map((template) => (
                <motion.button
                  key={template.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onSelect(template.text)}
                  className="px-3 py-1.5 rounded-full text-[11px] font-semibold bg-[var(--color-primary-soft)] dark:bg-[var(--color-primary)]/10 text-[var(--color-primary)] dark:text-[var(--color-primary)] hover:bg-[var(--color-primary-soft)] dark:hover:bg-[var(--color-primary)]/20 transition-all border border-[var(--color-primary-soft)]/50 dark:border-[var(--color-primary-soft)]"
                  title={template.text}
                >
                  {template.label}
                </motion.button>
              ))}

              {templates.length > 4 && (
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="px-3 py-1.5 rounded-full text-[11px] font-semibold text-[var(--color-ink-3)] hover:bg-[var(--color-surface-muted)] transition-all border border-[var(--color-line)]"
                >
                  {showAll ? "Show less" : `+${templates.length - 4} more`}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
