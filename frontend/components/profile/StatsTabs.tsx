import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface StatsTabsProps {
  tabs: { key: string; label: string; icon?: string; count?: number }[];
  activeTab: string;
  onTabChange: (key: string) => void;
}

export default function StatsTabs({ tabs, activeTab, onTabChange }: StatsTabsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <motion.button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              whileTap={{ scale: 0.97 }}
              className={`relative shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                isActive
                  ? "bg-[var(--color-ink)] text-[var(--color-bg)]"
                  : "bg-[var(--color-surface)] text-[var(--color-ink-2)] border border-[var(--color-line)] hover:border-[var(--color-line-2)]"
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  isActive
                    ? "bg-[var(--color-bg)]/20 text-[var(--color-bg)]"
                    : "bg-[var(--color-surface-muted)] text-[var(--color-ink-3)]"
                }`}>
                  {tab.count}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
