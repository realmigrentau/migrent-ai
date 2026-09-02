import Link from "next/link";
import { ShieldCheck, Clock, ShieldOff } from "lucide-react";
import type { VerificationSummary } from "../lib/api";

/**
 * The only way a "verified" signal is rendered anywhere on the site.
 *
 * It takes the server-computed verification summary (derived from
 * owner_verification, never from a badge string or the paid `verified`
 * flag) and shows exactly one of three states. It never says "safe": the
 * disclaimer line comes from the API and is always rendered next to the
 * verified state.
 */

interface Props {
  verification: VerificationSummary | null | undefined;
  /** "pill" for cards, "panel" for the listing page owner card. */
  variant?: "pill" | "panel";
  className?: string;
}

const LABELS: Record<VerificationSummary["status"], string> = {
  verified: "ID verified host",
  pending: "Verification pending",
  unverified: "Not yet verified",
};

export default function VerificationBadge({ verification, variant = "pill", className = "" }: Props) {
  const status = verification?.status ?? "unverified";
  const label = LABELS[status];
  const Icon = status === "verified" ? ShieldCheck : status === "pending" ? Clock : ShieldOff;
  const tone =
    status === "verified"
      ? "bg-[var(--color-trust-soft)] text-[var(--color-trust)]"
      : status === "pending"
        ? "bg-[var(--color-warn-50)] text-[var(--color-warn-600)]"
        : "bg-[var(--color-surface-muted)] text-[var(--color-ink-2)]";

  if (variant === "pill") {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${tone} ${className}`}
        data-verification-status={status}
      >
        <Icon className="w-3 h-3" aria-hidden="true" />
        {label}
      </span>
    );
  }

  const checks = verification?.checks;
  const items: { key: string; label: string; done: boolean; detail: string }[] = [
    { key: "email", label: "Email confirmed", done: Boolean(checks?.email_confirmed), detail: checks?.email_confirmed ? "Confirmed" : "Not confirmed" },
    { key: "phone", label: "Phone confirmed", done: Boolean(checks?.phone_confirmed), detail: checks?.phone_confirmed ? "Confirmed" : "Not confirmed" },
    {
      key: "id",
      label: "Government ID checked",
      done: checks?.government_id === "approved",
      detail:
        checks?.government_id === "approved"
          ? `Checked${verification?.verified_at ? ` ${new Date(verification.verified_at).toLocaleDateString("en-AU", { month: "short", year: "numeric" })}` : ""}`
          : checks?.government_id === "pending"
            ? "Submitted, awaiting review"
            : checks?.government_id === "rejected"
              ? "Last submission not accepted"
              : "Not submitted",
    },
  ];

  return (
    <div className={`rounded-xl border border-[var(--color-line)] p-4 ${className}`} data-verification-status={status}>
      <div className="flex items-center gap-2">
        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${tone}`}>
          <Icon className="w-4 h-4" aria-hidden="true" />
        </span>
        <p className="text-sm font-semibold text-[var(--color-ink)]">{label}</p>
      </div>
      <ul className="mt-3 space-y-1.5 text-[13px]">
        {items.map((item) => (
          <li key={item.key} className="flex items-start justify-between gap-3">
            <span className={item.done ? "text-[var(--color-ink)]" : "text-[var(--color-ink-3)]"}>{item.label}</span>
            <span className={`font-mono text-[11px] ${item.done ? "text-[var(--color-trust)]" : "text-[var(--color-ink-3)]"}`}>{item.detail}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[12px] leading-[1.5] text-[var(--color-ink-3)]">
        {verification?.disclaimer ?? "Verification confirms documents were checked. It is not a guarantee of safety or suitability."}{" "}
        <Link href={verification?.explainer_url ?? "/safety-verification"} className="underline underline-offset-2 text-[var(--color-primary)]">
          How verification works
        </Link>
      </p>
    </div>
  );
}
