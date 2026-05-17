import { CheckCircle2, XCircle, Shield } from "lucide-react";
import type { Profile } from "../../hooks/useProfile";

interface VerificationSummaryCardProps {
  profile: Profile | null;
}

export default function VerificationSummaryCard({ profile }: VerificationSummaryCardProps) {
  if (!profile) return null;

  const checks = [
    { label: "Email", done: !!profile.email_verified || !!profile.email },
    { label: "Phone", done: !!profile.phone_verified || !!(profile.phones?.length || profile.phone) },
    { label: "Profile Photo", done: !!profile.custom_pfp },
    { label: "About Me", done: !!(profile.about_me || profile.bio) },
    { label: "Government ID", done: !!profile.gov_id_verified || !!profile.identity_verified },
    { label: "Address", done: !!profile.residential_address },
  ];

  const done = checks.filter((c) => c.done).length;
  const pct = Math.round((done / checks.length) * 100);

  return (
    <div className="card p-5 rounded-2xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-accent)] to-teal-500 flex items-center justify-center shadow-lg shrink-0">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white">Verification Status</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">{done}/{checks.length} completed - {pct}%</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full mb-4 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[var(--color-accent)] to-teal-500 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="space-y-2">
        {checks.map((c) => (
          <div key={c.label} className="flex items-center gap-2 text-sm">
            {c.done ? (
              <CheckCircle2 className="w-4 h-4 text-[var(--color-accent)]" />
            ) : (
              <XCircle className="w-4 h-4 text-slate-300 dark:text-slate-600" />
            )}
            <span className={c.done ? "text-slate-700 dark:text-slate-300" : "text-slate-400 dark:text-slate-500"}>
              {c.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
