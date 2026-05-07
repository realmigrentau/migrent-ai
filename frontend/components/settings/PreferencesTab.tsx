import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
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
  Languages,
  X,
  Check,
  Save,
  ChevronRight,
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
  const handleSave = async () => {
    await updateProfile({
      preferred_language: language,
      timezone: timezone,
    });
  };

  return (
    <div className="space-y-6">
      {/* Theme */}
      <GlassCard delay={0.05}>
        <div className="flex items-start gap-4 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center shadow-lg shrink-0">
            <Palette className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">Appearance</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Customise your visual experience</p>
          </div>
        </div>

        <div className="ml-14">
          <div className="grid grid-cols-3 gap-3">
            {(
              [
                { value: "light", label: "Light", icon: Sun, gradient: "from-amber-300 to-yellow-400" },
                { value: "dark", label: "Dark", icon: Moon, gradient: "from-indigo-500 to-purple-600" },
                { value: "auto", label: "Auto", icon: Monitor, gradient: "from-slate-400 to-slate-500" },
              ] as const
            ).map((option) => {
              const Icon = option.icon;
              const isActive =
                option.value === "auto"
                  ? false // auto not implemented yet
                  : theme === option.value;

              return (
                <button
                  key={option.value}
                  onClick={() => {
                    if (option.value !== "auto") {
                      setTheme(option.value as "light" | "dark");
                    }
                  }}
                  className={`
                    flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all
                    ${isActive
                      ? "border-rose-400 dark:border-rose-500 bg-rose-50/50 dark:bg-rose-500/10 shadow-md"
                      : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                    }
                    ${option.value === "auto" ? "opacity-50 cursor-not-allowed" : ""}
                  `}
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${option.gradient} flex items-center justify-center shadow-md`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{option.label}</span>
                  {isActive && <Check className="w-3.5 h-3.5 text-rose-500" />}
                </button>
              );
            })}
          </div>
        </div>
      </GlassCard>

      {/* Language */}
      <GlassCard delay={0.1}>
        <div className="flex items-start gap-4 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center shadow-lg shrink-0">
            <Languages className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">Language</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Choose your preferred language</p>
          </div>
        </div>

        <div className="ml-14">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`
                  flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium border transition-all
                  ${language === lang.code
                    ? "border-rose-400 dark:border-rose-500 bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400"
                    : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600"
                  }
                `}
              >
                <span className="text-base">{lang.flag}</span>
                {lang.name}
              </button>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Region & Timezone */}
      <GlassCard delay={0.15}>
        <div className="flex items-start gap-4 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shrink-0">
            <MapPin className="w-5 h-5 text-white" />
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
                      ? "border-rose-400 bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400"
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
        <Link
          href="/account/settings/keyboard"
          className="flex items-center gap-4 group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shrink-0">
            <Keyboard className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-slate-900 dark:text-white">Keyboard Shortcuts</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage shortcuts and view the cheatsheet
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors" />
        </Link>
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
          className="w-full btn-primary py-3.5 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 shadow-xl shadow-rose-500/20 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save Preferences"}
        </button>
      </motion.div>
    </div>
  );
}
