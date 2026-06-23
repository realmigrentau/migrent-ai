import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import type { SettingsTab } from "../../hooks/useSettingsData";

interface SidebarNavProps {
  activeTab: SettingsTab;
  setActiveTab: (tab: SettingsTab) => void;
  isOwner: boolean;
  ticketCount?: number;
}

type GroupedTab = {
  id: SettingsTab;
  label: string;
};

type Group = {
  title: string;
  items: GroupedTab[];
};

const GROUPS: Group[] = [
  {
    title: "Account",
    items: [
      { id: "profile", label: "Profile" },
      { id: "verification", label: "Verification" },
      { id: "account", label: "Email & password" },
    ],
  },
  {
    title: "Renting",
    items: [
      { id: "preferences", label: "App preferences" },
      { id: "payments", label: "Payments & payout" },
    ],
  },
  {
    title: "Communicate",
    items: [{ id: "notifications", label: "Notifications" }],
  },
  {
    title: "Insights",
    items: [{ id: "analytics", label: "Analytics" }],
  },
  {
    title: "Help",
    items: [{ id: "support", label: "Support & tickets" }],
  },
];

export default function SidebarNav({
  activeTab,
  setActiveTab,
  isOwner,
  ticketCount = 0,
}: SidebarNavProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  // Filter analytics if not owner
  const filteredGroups = GROUPS.map((g) => ({
    ...g,
    items: g.items.filter((it) => !(it.id === "analytics" && !isOwner)),
  })).filter((g) => g.items.length > 0);

  // Active tab label for mobile pill
  const activeLabel = filteredGroups
    .flatMap((g) => g.items)
    .find((t) => t.id === activeTab)?.label;

  return (
    <>
      {/* Desktop sidebar - grouped style from design */}
      <motion.div
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="hidden lg:block lg:col-span-1"
      >
        <nav className="sticky top-24 flex flex-col gap-5 px-2">
          {filteredGroups.map((group) => (
            <div key={group.title}>
              <div className="eyebrow px-2 mb-1.5">{group.title}</div>
              <div className="flex flex-col gap-px">
                {group.items.map((item) => {
                  const active = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`flex items-center gap-2 px-2.5 py-[7px] rounded-[6px] text-[13.5px] text-left transition-colors ${
                        active
                          ? "bg-[var(--color-surface-sunk)] text-[var(--color-ink)] font-semibold"
                          : "text-[var(--color-ink-2)] font-medium hover:bg-[var(--color-surface-sunk)] hover:text-[var(--color-ink)]"
                      }`}
                    >
                      <span className="flex-1">{item.label}</span>
                      {item.id === "support" && ticketCount > 0 && (
                        <span className="font-mono text-[10.5px] font-bold text-[color:var(--color-primary-fg)] bg-[var(--color-primary)] rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                          {ticketCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </motion.div>

      {/* Mobile hamburger trigger */}
      <div className="lg:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="w-full flex items-center gap-2 px-4 py-2.5 rounded-[10px] bg-[var(--color-surface)] border border-[var(--color-line)] text-sm font-medium text-[var(--color-ink)]"
        >
          <Menu className="w-4 h-4" />
          <span>{activeLabel || "Settings"}</span>
          <span className="ml-auto eyebrow">Open</span>
        </button>
      </div>

      {/* Mobile bottom sheet */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/40 z-50 lg:hidden"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
            >
              <div className="bg-[var(--color-surface-2)] rounded-t-[20px] border-t border-[var(--color-line)] px-5 pt-4 pb-safe-bottom max-h-[75vh] overflow-y-auto">
                <div className="flex justify-center mb-4">
                  <div className="w-10 h-1 rounded-full bg-[var(--color-line-2)]" />
                </div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-serif text-[26px] text-[var(--color-ink)] tracking-[-0.012em]">
                    Settings
                  </h3>
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="p-2 rounded-full hover:bg-[var(--color-surface-sunk)]"
                  >
                    <X className="w-5 h-5 text-[var(--color-ink-2)]" />
                  </button>
                </div>
                <div className="flex flex-col gap-4 pb-6">
                  {filteredGroups.map((group) => (
                    <div key={group.title}>
                      <div className="eyebrow px-2 mb-1.5">{group.title}</div>
                      <div className="flex flex-col gap-px">
                        {group.items.map((item) => {
                          const active = activeTab === item.id;
                          return (
                            <button
                              key={item.id}
                              onClick={() => {
                                setActiveTab(item.id);
                                setMobileOpen(false);
                              }}
                              className={`flex items-center gap-2 px-3 py-3 rounded-[8px] text-[14.5px] text-left transition-colors ${
                                active
                                  ? "bg-[var(--color-surface-sunk)] text-[var(--color-ink)] font-semibold"
                                  : "text-[var(--color-ink-2)] hover:bg-[var(--color-surface-sunk)]"
                              }`}
                            >
                              <span className="flex-1">{item.label}</span>
                              {item.id === "support" && ticketCount > 0 && (
                                <span className="font-mono text-[10.5px] font-bold text-[color:var(--color-primary-fg)] bg-[var(--color-primary)] rounded-full px-1.5 py-0.5">
                                  {ticketCount}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
