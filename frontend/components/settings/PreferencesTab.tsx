import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GlassCard, { ToggleSwitch } from "../ui/GlassCard";
import {
  Moon,
  Sun,
  Monitor,
  Globe,
  MapPin,
  Palette,
  Keyboard,
  Clock,
  DollarSign,
  X,
  Check,
  Save,
} from "lucide-react";

interface PreferencesTabProps {
  theme: string;
  setTheme: (t: "light" | "dark") => void;
  toggleTheme: () => void;
  profile: any;
  saving: boolean;
  updateProfile: (data: Record<string, any>) => Promise<boolean>;
  showMessage: (text: string, type: "success" | "error" | "info") => void;
}

const LANGUAGES = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "es", name: "Spanish", flag: "🇪🇸" },
  { code: "fr", name: "French", flag: "🇫🇷" },
  { code: "de", name: "German", flag: "🇩🇪" },
  { code: "ja", name: "Japanese", flag: "🇯🇵" },
  { code: "zh", name: "Mandarin", flag: "🇨🇳" },
  { code: "hi", name: "Hindi", flag: "🇮🇳" },
  { code: "ar", name: "Arabic", flag: "🇸🇦" },
  { code: "ko", name: "Korean", flag: "🇰🇷" },
  { code: "pt", name: "Portuguese", flag: "🇧🇷" },
  { code: "vi", name: "Vietnamese", flag: "🇻🇳" },
  { code: "th", name: "Thai", flag: "🇹🇭" },
];

const TIMEZONES = [
  { value: "Australia/Sydney", label: "Sydney (AEDT)", city: "Sydney" },
  { value: "Australia/Melbourne", label: "Melbourne (AEDT)", city: "Melbourne" },
  { value: "Australia/Brisbane", label: "Brisbane (AEST)", city: "Brisbane" },
  { value: "Australia/Adelaide", label: "Adelaide (ACDT)", city: "Adelaide" },
  { value: "Australia/Perth", label: "Perth (AWST)", city: "Perth" },
  { value: "Australia/Hobart", label: "Hobart (AEDT)", city: "Hobart" },
  { value: "Australia/Darwin", label: "Darwin (ACST)", city: "Darwin" },
];

const REGIONS = [
  { value: "sydney", label: "Sydney", emoji: "🌊" },
  { value: "melbourne", label: "Melbourne", emoji: "☕" },
  { value: "brisbane", label: "Brisbane", emoji: "☀️" },
  { value: "perth", label: "Perth", emoji: "🌅" },
  { value: "adelaide", label: "Adelaide", emoji: "🍷" },
];

export default function PreferencesTab({
  theme,
  setTheme,
  toggleTheme,
  profile,
  saving,
  updateProfile,
  showMessage,
}: PreferencesTabProps) {
  const [language, setLanguage] = useState(profile?.preferred_language || "en");
  const [timezone, setTimezone] = useState(profile?.timezone || "Australia/Sydney");
  const [region, setRegion] = useState("sydney");
  const [showShortcuts, setShowShortcuts] = useState(false);

  const handleSave = async () => {
    await updateProfile({
      preferred_language: language,
      timezone: timezone,
    });
  };

  const shortcuts = [
    { keys: ["⌘", "K"], action: "Quick Search" },
    { keys: ["⌘", "B"], action: "Toggle Sidebar" },
    { keys: ["⌘", ","], action: "Open Settings" },
    { keys: ["⌘", "D"], action: "Toggle Dark Mode" },
    { keys: ["⌘", "N"], action: "New Listing" },
    { keys: ["Esc"], action: "Close Modal" },
    { keys: ["⌘", "/"], action: "Show Shortcuts" },
  ];

  return (
    <div className="space-y-6">
      {/* Appearance mode */}
      <GlassCard delay={0.05}>
        <div className="flex items-start gap-4 mb-4">
          <div className="w-10 h-10 rounded-[10px] bg-[var(--color-surface-sunk)] flex items-center justify-center shrink-0 text-[var(--color-ink-2)]">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-[var(--color-ink)] tracking-[-0.005em]">Appearance mode</h3>
            <p className="text-xs text-[var(--color-ink-3)]">Pick how MigRent looks. Switch any time.</p>
          </div>
        </div>

        <div className="ml-14">
          <div className="grid grid-cols-3 gap-3">
            {(
              [
                { value: "light", label: "Light", icon: Sun },
                { value: "dark", label: "Dark", icon: Moon },
                { value: "auto", label: "Auto", icon: Monitor },
              ] as const
            ).map((option) => {
              const Icon = option.icon;
              const isActive =
                option.value === "auto"
                  ? false
                  : theme === option.value;

              return (
                <button
                  key={option.value}
                  onClick={() => {
                    if (option.value !== "auto") {
                      setTheme(option.value as "light" | "dark");
                    }
                  }}
                  className={`flex flex-col items-center gap-2 p-4 rounded-[10px] border-2 transition-colors ${
                    isActive
                      ? "border-[var(--color-ink)] bg-[var(--color-surface-sunk)]"
                      : "border-[var(--color-line)] hover:border-[var(--color-line-2)]"
                  } ${option.value === "auto" ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <div className="w-10 h-10 rounded-[10px] bg-[var(--color-surface-sunk)] flex items-center justify-center text-[var(--color-ink-2)]">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold text-[var(--color-ink)]">{option.label}</span>
                  {isActive && <Check className="w-3.5 h-3.5 text-[var(--color-ink)]" />}
                </button>
              );
            })}
          </div>
        </div>
      </GlassCard>


      {/* Region & Timezone */}
      <GlassCard delay={0.15}>
        <div className="flex items-start gap-4 mb-4">
          <div className="w-10 h-10 rounded-[10px] bg-[var(--color-surface-sunk)] flex items-center justify-center shrink-0 text-[var(--color-ink-2)]">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">Region & Timezone</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Set your local preferences</p>
          </div>
        </div>

        <div className="ml-14 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Region</label>
            <div className="flex flex-wrap gap-2">
              {REGIONS.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setRegion(r.value)}
                  className={`
                    flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-all
                    ${region === r.value
                      ? "border-[var(--color-line-2)] bg-[var(--color-primary-soft)] dark:bg-[var(--color-primary)]/10 text-[var(--color-primary)] dark:text-[var(--color-primary)]"
                      : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                    }
                  `}
                >
                  {r.emoji} {r.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Timezone</label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="input-field"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Currency</label>
            <select value="AUD" disabled className="input-field bg-slate-50 dark:bg-slate-800/50 cursor-not-allowed">
              <option>AUD (Australian Dollar)</option>
            </select>
            <p className="text-[10px] text-slate-400 mt-1">All transactions are in AUD</p>
          </div>
        </div>
      </GlassCard>

      {/* Keyboard Shortcuts */}
      <GlassCard delay={0.2}>
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-[10px] bg-[var(--color-surface-sunk)] flex items-center justify-center shrink-0 text-[var(--color-ink-2)]">
            <Keyboard className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">Keyboard Shortcuts</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Navigate faster with hotkeys</p>
              </div>
              <button
                onClick={() => setShowShortcuts(!showShortcuts)}
                className="text-xs text-[var(--color-primary)] hover:text-[var(--color-primary)] font-medium"
              >
                {showShortcuts ? "Hide" : "Show All"}
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {showShortcuts && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="ml-14 mt-4 space-y-2">
                {shortcuts.map((shortcut, i) => (
                  <motion.div
                    key={shortcut.action}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-center justify-between py-1.5"
                  >
                    <span className="text-sm text-slate-600 dark:text-slate-400">{shortcut.action}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, j) => (
                        <kbd
                          key={j}
                          className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-mono text-slate-600 dark:text-slate-300 shadow-sm"
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>

      {/* Save Preferences */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="sticky bottom-4 z-10"
      >
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full btn-primary py-3.5 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 shadow-xl shadow-[var(--color-primary)]/20 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save Preferences"}
        </button>
      </motion.div>
    </div>
  );
}
