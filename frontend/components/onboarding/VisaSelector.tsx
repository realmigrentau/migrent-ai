import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getVisaTypes, type VisaType } from "../../lib/api";

interface VisaSelectorProps {
  value: string;
  onChange: (visaType: string) => void;
}

const VISA_ICONS: Record<string, string> = {
  student_500: "🎓",
  skilled_482: "💼",
  whv_417: "🌏",
  graduate_485: "🎯",
};

const VISA_DESCRIPTIONS: Record<string, string> = {
  student_500: "Studying at an Australian university or college",
  skilled_482: "Sponsored by an employer for skilled work",
  whv_417: "Travelling and working across Australia",
  graduate_485: "Recently graduated from an Australian institution",
};

export default function VisaSelector({ value, onChange }: VisaSelectorProps) {
  const [visaTypes, setVisaTypes] = useState<VisaType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getVisaTypes()
      .then((types) => {
        if (types.length > 0) {
          setVisaTypes(types);
        } else {
          // Fallback if API fails
          setVisaTypes([
            { id: "student_500", name: "Student Visa 500", uni_focus: true, cbd_focus: false, flexible: false, duration_weeks: 52 },
            { id: "skilled_482", name: "Skilled Work 482", uni_focus: false, cbd_focus: true, flexible: false, duration_weeks: 52 },
            { id: "whv_417", name: "Working Holiday 417", uni_focus: false, cbd_focus: false, flexible: true, duration_weeks: 26 },
            { id: "graduate_485", name: "Graduate 485", uni_focus: true, cbd_focus: false, flexible: false, duration_weeks: 26 },
          ]);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-16 rounded-xl shimmer" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {visaTypes.map((visa, i) => {
        const selected = value === visa.id;
        return (
          <motion.button
            key={visa.id}
            type="button"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => onChange(selected ? "" : visa.id)}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
              selected
                ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)] dark:bg-[var(--color-primary)]/10 shadow-sm"
                : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{VISA_ICONS[visa.id] || "📋"}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${
                  selected
                    ? "text-[var(--color-primary)] dark:text-[var(--color-primary)]"
                    : "text-slate-800 dark:text-slate-100"
                }`}>
                  {visa.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {VISA_DESCRIPTIONS[visa.id] || `Up to ${visa.duration_weeks} weeks`}
                </p>
              </div>
              {selected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-6 h-6 rounded-full bg-[var(--color-primary)] flex items-center justify-center shrink-0"
                >
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
              )}
            </div>
          </motion.button>
        );
      })}

      <button
        type="button"
        onClick={() => onChange("")}
        className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
          !value
            ? "border-slate-400 dark:border-slate-500 bg-slate-50 dark:bg-slate-800/50"
            : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600"
        }`}
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">🏠</span>
          <div>
            <p className={`text-sm font-semibold ${
              !value
                ? "text-slate-700 dark:text-slate-200"
                : "text-slate-800 dark:text-slate-100"
            }`}>
              Prefer not to say / Other
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Skip visa-based recommendations
            </p>
          </div>
        </div>
      </button>
    </div>
  );
}
