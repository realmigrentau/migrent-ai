import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  Mail,
  Shield,
  Home,
  Bell,
  CreditCard,
  BarChart3,
  Settings,
  MessageCircle,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import type { SettingsTab } from "../../hooks/useSettingsData";

interface SidebarNavProps {
  activeTab: SettingsTab;
  setActiveTab: (tab: SettingsTab) => void;
  isOwner: boolean;
  ticketCount?: number;
}

const tabs: Array<{
  id: SettingsTab;
  label: string;
  icon: any;
  emoji: string;
  color: string;
  activeColor: string;
}> = [
  {
    id: "account",
    label: "Account & Security",
    icon: Mail,
    emoji: "📧",
    color: "text-blue-500",
    activeColor: "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/30",
  },
  {
    id: "verification",
    label: "Verification",
    icon: Shield,
    emoji: "📱",
    color: "text-emerald-500",
    activeColor: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30",
  },
  {
    id: "profile",
    label: "Profile & Address",
    icon: Home,
    emoji: "🏠",
    color: "text-purple-500",
    activeColor: "bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-500/30",
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: Bell,
    emoji: "🔔",
    color: "text-amber-500",
    activeColor: "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30",
  },
  {
    id: "payments",
    label: "Payments & Payouts",
    icon: CreditCard,
    emoji: "💳",
    color: "text-pink-500",
    activeColor: "bg-pink-50 dark:bg-pink-500/10 text-pink-700 dark:text-pink-400 border-pink-200 dark:border-pink-500/30",
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: BarChart3,
    emoji: "📈",
    color: "text-cyan-500",
    activeColor: "bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-500/30",
  },
  {
    id: "preferences",
    label: "App Preferences",
    icon: Settings,
    emoji: "🔧",
    color: "text-slate-500",
    activeColor: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700",
  },
  {
    id: "support",
    label: "Support & Tickets",
    icon: MessageCircle,
    emoji: "💬",
    color: "text-rose-500",
    activeColor: "bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/30",
  },
];

export default function SidebarNav({ activeTab, setActiveTab, isOwner, ticketCount = 0 }: SidebarNavProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const filteredTabs = tabs.filter((tab) => {
    if (tab.id === "analytics" && !isOwner) return false;
    return true;
  });

  const activeTabData = filteredTabs.find((t) => t.id === activeTab);

  return (
    <>
      {/* Desktop sidebar */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="hidden lg:block lg:col-span-1"
      >
        <div className="backdrop-blur-xl bg-white/90 dark:bg-slate-900/90 rounded-2xl shadow-lg dark:shadow-2xl border border-white/20 dark:border-slate-700/50 overflow-hidden p-2 space-y-1 sticky top-24">
          <div className="px-3 py-2 mb-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Settings
            </p>
          </div>
          {filteredTabs.map((tab, i) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <motion.button
                key={tab.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left border
                  ${isActive
                    ? tab.activeColor
                    : "border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200"
                  }
                `}
              >
                <span className="text-base">{tab.emoji}</span>
                <span className="flex-1 truncate">{tab.label}</span>
                {tab.id === "support" && ticketCount > 0 && (
                  <span className="bg-rose-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {ticketCount}
                  </span>
                )}
                {isActive && (
                  <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                )}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Mobile hamburger */}
      <div className="lg:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl backdrop-blur-xl bg-white/90 dark:bg-slate-900/90 border border-white/20 dark:border-slate-700/50 shadow-lg text-sm font-medium text-slate-700 dark:text-slate-300 w-full"
        >
          <Menu className="w-4 h-4" />
          <span className="text-base">{activeTabData?.emoji}</span>
          <span>{activeTabData?.label || "Settings"}</span>
          <ChevronRight className="w-4 h-4 ml-auto opacity-40" />
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
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 lg:hidden"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
            >
              <div className="backdrop-blur-xl bg-white/95 dark:bg-slate-900/95 rounded-t-3xl shadow-2xl border-t border-white/20 dark:border-slate-700/50 px-4 pt-3 pb-safe-bottom max-h-[75vh] overflow-y-auto">
                {/* Handle bar */}
                <div className="flex justify-center mb-3">
                  <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                </div>

                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Settings</h3>
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <X className="w-5 h-5 text-slate-500" />
                  </button>
                </div>

                <div className="space-y-1 pb-4">
                  {filteredTabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id);
                          setMobileOpen(false);
                        }}
                        className={`
                          w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all text-left border
                          ${isActive
                            ? tab.activeColor
                            : "border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                          }
                        `}
                      >
                        <span className="text-lg">{tab.emoji}</span>
                        <span className="flex-1">{tab.label}</span>
                        {tab.id === "support" && ticketCount > 0 && (
                          <span className="bg-rose-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                            {ticketCount}
                          </span>
                        )}
                        {isActive && <ChevronRight className="w-4 h-4 opacity-40" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
