import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ChevronRight, Check, Heart } from "lucide-react";
import { useBookings, type Booking } from "../../hooks/useBookings";
import type { ProfileData } from "../../hooks/useDashboardData";

interface SeekerOverviewProps {
  profile: ProfileData | null;
}

// Map booking status -> a step (1-4) and a badge tone/label, matching the design
function statusMeta(status: Booking["status"]): {
  label: string;
  step: number;
  tone: "warn" | "info" | "neutral" | "success";
} {
  switch (status) {
    case "PENDING_OWNER":
      return { label: "Awaiting host", step: 2, tone: "warn" };
    case "OWNER_ACCEPTED":
      return { label: "Accepted · pay to confirm", step: 3, tone: "info" };
    case "PAID":
      return { label: "Booked", step: 4, tone: "success" };
    case "COMPLETED":
      return { label: "Completed", step: 4, tone: "success" };
    case "OWNER_DECLINED":
      return { label: "Declined", step: 1, tone: "neutral" };
    case "SEEKER_CANCELLED":
      return { label: "Cancelled", step: 1, tone: "neutral" };
    case "EXPIRED":
      return { label: "Expired", step: 1, tone: "neutral" };
    default:
      return { label: "Application sent", step: 1, tone: "neutral" };
  }
}

const TONE_CLASS: Record<string, string> = {
  warn: "bg-[#f4e4cf] dark:bg-[#2c1e10] text-[var(--color-warn-500)]",
  info: "bg-[#dde4ec] dark:bg-[#182230] text-[var(--color-info-500)]",
  success: "bg-[var(--color-accent-soft)] text-[var(--color-accent)]",
  neutral: "bg-[var(--color-surface-sunk)] text-[var(--color-ink-2)] border border-[var(--color-line)]",
};

function shortId(id: string) {
  return `MR-${id.slice(-4).toUpperCase()}`;
}

export default function SeekerOverview({ profile }: SeekerOverviewProps) {
  const { bookings, loading } = useBookings("seeker");

  const active = bookings.filter(
    (b) => !["SEEKER_CANCELLED", "EXPIRED", "OWNER_DECLINED"].includes(b.status)
  );
  const applications = active.slice(0, 3);

  // Upcoming tours/move-ins from accepted/paid bookings
  const schedule = active
    .filter((b) => ["OWNER_ACCEPTED", "PAID"].includes(b.status))
    .slice(0, 3);

  // Verification steps from profile
  const checks = [
    { label: "ID verified", done: !!(profile as any)?.idVerified || !!(profile as any)?.identity_verified },
    { label: "Background check", done: !!(profile as any)?.backgroundChecked || !!(profile as any)?.background_check_status },
    { label: "Proof of income", done: !!(profile as any)?.incomeVerified || !!(profile as any)?.income_verified },
  ];
  const doneCount = checks.filter((c) => c.done).length;
  const pct = Math.round((doneCount / checks.length) * 100);
  const r = 20;
  const c = 2 * Math.PI * r;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-5">
      {/* LEFT COLUMN */}
      <div className="space-y-5">
        {/* Your applications */}
        <Panel>
          <PanelHeader
            title="Your applications"
            action={
              <Link href="/seeker/dashboard" className="text-[12.5px] font-semibold text-[var(--color-ink)] inline-flex items-center gap-1 hover:underline underline-offset-[3px]">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            }
          />
          {loading ? (
            <div className="space-y-2 mt-1">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-[68px] shimmer rounded-[10px]" />
              ))}
            </div>
          ) : applications.length === 0 ? (
            <EmptyRow
              text="No applications yet."
              cta={{ href: "/seeker/search", label: "Find a room" }}
            />
          ) : (
            <div className="flex flex-col">
              {applications.map((b, i) => {
                const meta = statusMeta(b.status);
                const title =
                  b.listing?.title || b.listing?.address || "Listing";
                const host = b.other_party?.name ? ` · ${b.other_party.name}` : "";
                return (
                  <Link
                    key={b.id}
                    href="/seeker/dashboard"
                    className={`grid grid-cols-[52px_1fr_170px_28px] gap-3.5 items-center py-3 ${
                      i > 0 ? "border-t border-[var(--color-line)]" : ""
                    }`}
                  >
                    <div className="photo-placeholder h-11 rounded-[6px]" style={{ height: 44 }} />
                    <div className="min-w-0">
                      <div className="font-mono text-[10.5px] text-[var(--color-ink-3)]">{shortId(b.listing_id)}</div>
                      <div className="text-[14px] font-semibold text-[var(--color-ink)] truncate">
                        {title}{host}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <span className={`inline-flex w-fit items-center h-[18px] px-1.5 rounded-full text-[10.5px] font-semibold ${TONE_CLASS[meta.tone]}`}>
                        {meta.label}
                      </span>
                      <div className="flex gap-[3px]">
                        {[1, 2, 3, 4].map((s) => (
                          <div
                            key={s}
                            className="flex-1 h-[3px] rounded-[1px]"
                            style={{ background: s <= meta.step ? "var(--color-primary)" : "var(--color-line)" }}
                          />
                        ))}
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-[var(--color-ink-3)] justify-self-end" />
                  </Link>
                );
              })}
            </div>
          )}
        </Panel>

        {/* Recently saved */}
        <Panel>
          <PanelHeader
            title="Recently saved"
            action={
              <Link href="/seeker/wishlist" className="text-[12.5px] font-semibold text-[var(--color-ink)] inline-flex items-center gap-1 hover:underline underline-offset-[3px]">
                All saved <ArrowRight className="w-3 h-3" />
              </Link>
            }
          />
          <SavedList />
        </Panel>
      </div>

      {/* RIGHT COLUMN */}
      <div className="space-y-5">
        {/* Trust profile */}
        <Panel>
          <div className="flex items-start justify-between">
            <div>
              <div className="eyebrow">Trust profile</div>
              <div className="text-[15px] font-semibold text-[var(--color-ink)] mt-1">
                {doneCount} of {checks.length} complete
              </div>
            </div>
            <div className="relative w-12 h-12">
              <svg width="48" height="48" viewBox="0 0 48 48">
                <circle cx="24" cy="24" r={r} fill="none" stroke="var(--color-line)" strokeWidth="4" />
                <circle
                  cx="24"
                  cy="24"
                  r={r}
                  fill="none"
                  stroke="var(--color-accent)"
                  strokeWidth="4"
                  strokeDasharray={`${(pct / 100) * c} ${c}`}
                  strokeLinecap="round"
                  transform="rotate(-90 24 24)"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-[12px] font-bold text-[var(--color-ink)] tabular-nums">
                {pct}%
              </div>
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-2">
            {checks.map((check) => (
              <div key={check.label} className="flex items-center gap-2.5 py-1">
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    background: check.done ? "var(--color-accent)" : "var(--color-surface-sunk)",
                    color: check.done ? "var(--color-accent-fg)" : "var(--color-ink-3)",
                    border: check.done ? "none" : "1px dashed var(--color-line-2)",
                  }}
                >
                  {check.done && <Check className="w-3 h-3" strokeWidth={2.6} />}
                </span>
                <span
                  className={`flex-1 text-[13.5px] ${
                    check.done ? "text-[var(--color-ink-2)] line-through" : "text-[var(--color-ink)]"
                  }`}
                >
                  {check.label}
                </span>
                {!check.done && (
                  <Link href="/account/settings#verification" className="text-[12.5px] font-semibold text-[var(--color-primary)] hover:underline underline-offset-[3px]">
                    Add
                  </Link>
                )}
              </div>
            ))}
          </div>
        </Panel>

        {/* This week */}
        <Panel>
          <div className="eyebrow">This week</div>
          {schedule.length === 0 ? (
            <p className="mt-3 text-[13px] text-[var(--color-ink-3)]">
              No tours or move-ins scheduled yet. Accepted applications appear here.
            </p>
          ) : (
            <div className="mt-3.5 flex flex-col gap-3">
              {schedule.map((b) => {
                const d = new Date(b.check_in_date);
                return (
                  <div key={b.id} className="grid grid-cols-[52px_1fr] gap-3 items-center">
                    <div className="bg-[var(--color-surface-sunk)] rounded-[6px] p-1.5 text-center">
                      <div className="font-mono text-[9.5px] font-semibold text-[var(--color-ink-3)] uppercase">
                        {d.toLocaleDateString("en-AU", { weekday: "short" }).slice(0, 3)}
                      </div>
                      <div className="font-serif text-[22px] leading-none mt-0.5 text-[var(--color-ink)]">
                        {d.getDate()}
                      </div>
                    </div>
                    <div>
                      <div className="text-[13.5px] font-semibold text-[var(--color-ink)]">
                        {b.status === "PAID" ? "Move-in" : "Tour"} · {b.listing?.title || b.listing?.address || "Listing"}
                      </div>
                      <div className="text-[12px] text-[var(--color-ink-3)]">
                        {b.other_party?.name ? `with ${b.other_party.name}` : "Details in messages"}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Panel>

        {/* Recent messages link */}
        <Panel>
          <PanelHeader
            title="Recent messages"
            action={
              <Link href="/messages" className="text-[12.5px] font-semibold text-[var(--color-ink)] inline-flex items-center gap-1 hover:underline underline-offset-[3px]">
                Inbox <ArrowRight className="w-3 h-3" />
              </Link>
            }
          />
          <Link
            href="/messages"
            className="mt-1 flex items-center gap-3 p-3 rounded-[10px] bg-[var(--color-surface-sunk)] hover:bg-[var(--color-line)] transition-colors"
          >
            <span className="w-9 h-9 rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary)] flex items-center justify-center text-[13px] font-bold">
              MR
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold text-[var(--color-ink)]">Open your inbox</div>
              <div className="text-[12px] text-[var(--color-ink-3)] truncate">
                Reply to hosts and keep your applications moving.
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-[var(--color-ink-3)]" />
          </Link>
        </Panel>
      </div>
    </div>
  );
}

// ─── Sub-components ───

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="bg-[var(--color-surface)] border border-[var(--color-line)] rounded-[14px] p-5"
    >
      {children}
    </motion.div>
  );
}

function PanelHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between mb-3.5">
      <div className="text-[15px] font-semibold text-[var(--color-ink)]">{title}</div>
      {action}
    </div>
  );
}

function EmptyRow({ text, cta }: { text: string; cta?: { href: string; label: string } }) {
  return (
    <div className="mt-1 p-4 rounded-[10px] bg-[var(--color-surface-sunk)] flex items-center justify-between gap-3">
      <span className="text-[13px] text-[var(--color-ink-2)]">{text}</span>
      {cta && (
        <Link
          href={cta.href}
          className="text-[12.5px] font-semibold text-[var(--color-primary)] inline-flex items-center gap-1 shrink-0 hover:underline underline-offset-[3px]"
        >
          {cta.label} <ArrowRight className="w-3 h-3" />
        </Link>
      )}
    </div>
  );
}

function SavedList() {
  // Saved listings hook may exist; keep it light - link out to wishlist.
  return (
    <Link
      href="/seeker/wishlist"
      className="flex items-center gap-3 p-3 rounded-[10px] bg-[var(--color-surface-sunk)] hover:bg-[var(--color-line)] transition-colors"
    >
      <span className="w-9 h-9 rounded-[8px] bg-[var(--color-surface-2)] border border-[var(--color-line)] flex items-center justify-center text-[var(--color-coral-500)]">
        <Heart className="w-4 h-4" />
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-semibold text-[var(--color-ink)]">Your saved listings</div>
        <div className="text-[12px] text-[var(--color-ink-3)] truncate">
          Rooms you&apos;ve hearted, ready to compare and apply.
        </div>
      </div>
      <ChevronRight className="w-3.5 h-3.5 text-[var(--color-ink-3)]" />
    </Link>
  );
}
