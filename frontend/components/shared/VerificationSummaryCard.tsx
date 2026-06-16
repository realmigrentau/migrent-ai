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
        <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-soft)] from-[var(--color-accent)] to-[var(--color-primary)] flex items-center justify-center shadow-lg shrink-0">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-[var(--color-ink)]">Verification Status</h3>
          <p className="text-xs text-[var(--color-ink-3)]">{done}/{checks.length} completed - {pct}%</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-[var(--color-surface-muted)] rounded-full mb-4 overflow-hidden">
        <div
          className="h-full bg-[var(--color-primary)] from-[var(--color-accent)] to-[var(--color-primary)] rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="space-y-2">
        {checks.map((c) => (
          <div key={c.label} className="flex items-center gap-2 text-sm">
            {c.done ? (
              <CheckCircle2 className="w-4 h-4 text-[var(--color-accent)]" />
            ) : (
              <XCircle className="w-4 h-4 text-[var(--color-ink-4)]" />
            )}
            <span className={c.done ? "text-[var(--color-ink-2)]" : "text-[var(--color-ink-3)]"}>
              {c.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
