import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { ReactNode } from "react";

interface AccordionItem {
  title: string;
  icon?: ReactNode;
  content: ReactNode;
}

interface StateLawAccordionProps {
  items: AccordionItem[];
  defaultOpenIndex?: number;
}

export default function StateLawAccordion({
  items,
  defaultOpenIndex = 0,
}: StateLawAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(defaultOpenIndex);

  return (
    <div className="space-y-2">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={index}
            className="card rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700/50"
          >
            <button
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {item.icon && (
                  <span className="text-rose-500 flex-shrink-0">{item.icon}</span>
                )}
                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                  {item.title}
                </span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="px-5 pb-5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-3">
                    {item.content}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
