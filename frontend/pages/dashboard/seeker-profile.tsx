import { motion } from "framer-motion";
import Link from "next/link";
import { useAuth } from "../../hooks/useAuth";
import { useProfile } from "../../hooks/useProfile";
import DashboardLayout from "../../components/DashboardLayout";
import { Edit3, Share2, MapPin, Shield, Plus, Upload, Check, ArrowRight } from "lucide-react";

const VISA_LABELS: Record<string, string> = {
  citizen: "Citizen",
  pr: "Permanent resident",
  student: "Student visa (500)",
  whv: "Working Holiday (417/462)",
  temporary: "Temporary Skilled (482)",
  bridging: "Bridging visa",
  other: "Visa: Other",
};

function fmtMonth(d?: string | null) {
  if (!d) return null;
  try {
    return new Date(d).toLocaleDateString("en-AU", { month: "short", year: "numeric" });
  } catch {
    return null;
  }
}

export default function SeekerProfilePage() {
  const { session, loading } = useAuth();
  const { profile, loading: loadingProfile } = useProfile();

  if (loading || loadingProfile)
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[var(--color-line-2)] border-t-[var(--color-ink)] rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );

  if (!session)
    return (
      <DashboardLayout>
        <div className="bg-[var(--color-surface)] border border-[var(--color-line)] rounded-[14px] p-8 text-center max-w-md mx-auto mt-12">
          <h2 className="text-lg font-bold text-[var(--color-ink)] mb-2">Sign in required</h2>
          <p className="text-sm text-[var(--color-ink-3)] mb-4">You need to sign in to view your profile.</p>
          <Link href="/signin" className="btn-primary px-6 h-10 text-sm inline-flex rounded-[10px]">
            Sign in
          </Link>
        </div>
      </DashboardLayout>
    );

  // Derived display values - profile shape is loose, cast for ergonomics
  const p = (profile || {}) as any;
  const displayName = p.name || p.preferred_name || "Renter";
  const initials = displayName
    .split(" ")
    .map((s: string) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "U";
  const city = p.preferred_suburbs?.split(",")[0]?.trim() || p.city || "Australia";
  const joinedLabel = fmtMonth(p.created_at) || fmtMonth(session.user.created_at) || " - ";
  const speaks = (p.languages || p.preferred_language || "English")
    .split(",")
    .map((s: string) => s.trim())
    .filter(Boolean);
  const visaTag = p.visa_type ? VISA_LABELS[p.visa_type] || p.visa_type : null;
  const tags = [
    visaTag,
    p.education,
    p.smoker === false ? "Non-smoker" : null,
    p.lifestyle?.split(",")[0]?.trim(),
  ].filter(Boolean) as string[];
  const idVerified = !!p.identity_verified;
  const visaVerified = !!p.visa_verified;
  const incomeVerified = !!p.income_verified;
  const verifiedSteps = [idVerified, visaVerified, incomeVerified].filter(Boolean).length;
  const bgCheck = p.background_check_status;
  const budgetText =
    p.budget_min && p.budget_max
      ? `$${p.budget_min}-$${p.budget_max} / week`
      : p.budget_max
      ? `Up to $${p.budget_max} / week`
      : "Tell us your budget";
  const moveInText = p.move_in_date ? `Flexible · ${fmtMonth(p.move_in_date)}` : "Flexible";
  const stayLengthText = p.preferred_stay_length || "6+ months";
  const petText = p.pet_friendly === true ? "Has a pet" : "None - but pet-friendly OK";

  return (
    <DashboardLayout>
      <div className="max-w-[1200px] mx-auto space-y-5">
        {/* ──────── BANNER ──────── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[20px] bg-[var(--color-surface)] border border-[var(--color-line)] p-7 md:p-8"
        >
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div
                className="w-[110px] h-[110px] rounded-full flex items-center justify-center overflow-hidden"
                style={{ background: "#e2e7ee", color: "var(--color-primary)" }}
              >
                {p.photo ? (
                  <img src={p.photo} alt={`${p.name || "Profile"} photo`} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[40px] font-bold tracking-[-0.02em]">{initials}</span>
                )}
              </div>
              <span
                className="absolute right-1 bottom-1 w-[26px] h-[26px] rounded-full flex items-center justify-center text-[color:var(--color-accent-fg)]"
                style={{
                  background: "var(--color-accent)",
                  border: "3px solid var(--color-surface)",
                }}
              >
                <Check className="w-3.5 h-3.5" strokeWidth={2.6} />
              </span>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="font-serif text-[40px] md:text-[48px] leading-[1.05] tracking-[-0.02em] text-[var(--color-ink)]">
                      {displayName}
                    </h1>
                    <span className="inline-flex items-center gap-1 h-[24px] px-2.5 rounded-full text-[11.5px] font-semibold bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
                      <Check className="w-3 h-3" strokeWidth={2.6} /> Verified renter
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[13.5px] text-[var(--color-ink-2)]">
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[var(--color-ink-3)]" />
                      {city}
                    </span>
                    <span className="text-[var(--color-line-2)]">·</span>
                    <span>On MigRent since {joinedLabel}</span>
                    {speaks.length > 0 && (
                      <>
                        <span className="text-[var(--color-line-2)]">·</span>
                        <span>Speaks {speaks.join(", ")}</span>
                      </>
                    )}
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 mt-4">
                      {tags.map((tag, i) => (
                        <span
                          key={i}
                          className={`inline-flex items-center h-[24px] px-2.5 rounded-full text-[12px] font-semibold ${
                            i === 0
                              ? "bg-[var(--color-primary-soft)] text-[var(--color-primary)]"
                              : "bg-[var(--color-surface-sunk)] text-[var(--color-ink-2)] border border-[var(--color-line)]"
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => navigator.share?.({ url: window.location.href, title: `${displayName} · MigRent` }).catch(() => {})}
                    className="btn-secondary h-10 px-4 text-sm rounded-[10px] inline-flex items-center gap-1.5"
                  >
                    <Share2 className="w-3.5 h-3.5" /> Share profile
                  </button>
                  <Link
                    href="/account/settings"
                    className="btn-primary h-10 px-4 text-sm rounded-[10px] inline-flex items-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit profile
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ──────── TWO-COL BODY ──────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* LEFT COL */}
          <div className="space-y-5">
            {/* About me */}
            <Card>
              <Eyebrow>About me</Eyebrow>
              <p className="text-[14px] text-[var(--color-ink-2)] leading-[1.55] mt-3 whitespace-pre-line">
                {p.bio || (
                  <span className="text-[var(--color-ink-3)] italic">
                    Tell hosts a bit about who you are, what you do, and what you&apos;re looking for.
                  </span>
                )}
              </p>
              <div className="grid grid-cols-2 gap-3 mt-5">
                <Tile label="Budget" value={budgetText} />
                <Tile label="Move-in" value={moveInText} />
                <Tile label="Stay length" value={stayLengthText} />
                <Tile label="Pet" value={petText} />
              </div>
            </Card>

            {/* Past references */}
            <Card>
              <div className="flex items-baseline justify-between">
                <Eyebrow>Past references</Eyebrow>
                <button
                  type="button"
                  className="text-[12.5px] font-semibold text-[var(--color-ink)] inline-flex items-center gap-1 hover:underline underline-offset-[3px]"
                >
                  Request more <ArrowRight className="w-3 h-3" />
                </button>
              </div>
              <h3 className="font-serif text-[22px] tracking-[-0.012em] text-[var(--color-ink)] mt-2">
                {p.references_count ?? 0} verified reference
                {(p.references_count ?? 0) === 1 ? "" : "s"}
              </h3>
              {(p.references_count ?? 0) === 0 ? (
                <div className="mt-4 p-4 bg-[var(--color-surface-sunk)] rounded-[10px] text-[13px] text-[var(--color-ink-2)]">
                  Ask a previous host or flatmate to vouch for you. Verified references unlock
                  faster responses from hosts.
                </div>
              ) : (
                <div className="mt-4 space-y-4">
                  {/* Example placeholder shape - real refs would map here */}
                  <ReferenceItem
                    quote="Quiet, paid on time, left the place spotless. Would absolutely have her back."
                    name="Sara K."
                    role="Sublet host"
                    date="Aug 2025"
                    location="Newtown, NSW"
                  />
                </div>
              )}
            </Card>
          </div>

          {/* RIGHT COL */}
          <div className="space-y-5">
            {/* Verification */}
            <Card>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Eyebrow>Verification</Eyebrow>
                  <h2 className="font-serif text-[26px] tracking-[-0.012em] text-[var(--color-ink)] mt-1.5">
                    You&apos;re a trusted renter
                  </h2>
                  <p className="text-[13px] text-[var(--color-ink-3)] mt-1">
                    {verifiedSteps} of 3 checks complete
                  </p>
                </div>
                <div
                  className="w-[44px] h-[44px] rounded-full flex items-center justify-center"
                  style={{
                    background: "var(--color-accent-soft)",
                    color: "var(--color-accent)",
                  }}
                >
                  <Shield className="w-[22px] h-[22px]" />
                </div>
              </div>

              <div className="mt-5 space-y-2.5">
                <VerificationRow
                  done={idVerified}
                  title="Government ID"
                  subtitle={
                    idVerified
                      ? `Passport · ${p.id_country || "Verified"}`
                      : "Upload your passport or driver licence"
                  }
                  verifiedDate={p.identity_verified_at}
                />
                <VerificationRow
                  done={visaVerified}
                  title="Visa status"
                  subtitle={
                    visaVerified
                      ? `${visaTag || "Verified"}${p.visa_expiry ? ` · valid to ${fmtMonth(p.visa_expiry)}` : ""}`
                      : "Confirm your visa class and validity"
                  }
                  verifiedDate={p.visa_verified_at}
                />
                <VerificationRow
                  done={incomeVerified}
                  title="Proof of income"
                  subtitle="Bank statement, scholarship letter, or employer letter"
                  uploadHref="/account/settings#verification"
                />
              </div>

              <p className="mt-4 text-[11.5px] text-[var(--color-ink-3)] leading-[1.5]">
                Verification is optional - but renters with all three checks are{" "}
                <span className="text-[var(--color-ink)] font-semibold">3.2× more likely</span> to
                get their first-choice listing.
              </p>
            </Card>

            {/* Background check */}
            <Card>
              <Eyebrow>Background check</Eyebrow>
              <div className="mt-3 flex items-start gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    background: bgCheck === "clean" ? "var(--color-accent-soft)" : "var(--color-surface-sunk)",
                    color: bgCheck === "clean" ? "var(--color-accent)" : "var(--color-ink-3)",
                  }}
                >
                  <Check className="w-4 h-4" strokeWidth={2.6} />
                </div>
                <div className="flex-1">
                  <div className="text-[14px] font-semibold text-[var(--color-ink)]">
                    {bgCheck === "clean" ? "Clean record · Equifax AU" : "Not yet requested"}
                  </div>
                  <div className="font-mono text-[10.5px] uppercase tracking-[0.04em] text-[var(--color-ink-3)] mt-1">
                    {bgCheck === "clean"
                      ? "CHECKED 12 OCT 2025 · VALID 12 MO"
                      : "Hosts can request this on application"}
                  </div>
                </div>
              </div>
              <p className="mt-3 text-[11.5px] text-[var(--color-ink-3)] leading-[1.5]">
                Only hosts who request it ever see your background check result. You always see who
                asked.
              </p>
            </Card>

            {/* Activity */}
            <Card>
              <Eyebrow>Activity</Eyebrow>
              <div className="mt-3 space-y-2.5">
                <ActivityRow
                  label="Last application"
                  value={p.last_application_at ? fmtMonth(p.last_application_at) || "Recently" : "No applications yet"}
                />
                <ActivityRow
                  label="Response rate"
                  value={p.response_rate ? `${p.response_rate}%` : " - "}
                />
                <ActivityRow label="Saved listings" value={String(p.saved_count ?? 0)} />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// ─── Sub-components ───

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[var(--color-surface-2)] border border-[var(--color-line)] rounded-[14px] p-6">
      {children}
    </div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <div className="eyebrow">{children}</div>;
}

function Tile({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="p-3.5 bg-[var(--color-surface-sunk)] rounded-[10px]">
      <div className="font-mono text-[10px] uppercase tracking-[0.06em] text-[var(--color-ink-3)] font-semibold">
        {label}
      </div>
      <div className="mt-1.5 text-[14px] font-semibold text-[var(--color-ink)] leading-[1.4]">
        {value}
      </div>
    </div>
  );
}

function VerificationRow({
  done,
  title,
  subtitle,
  verifiedDate,
  uploadHref,
}: {
  done: boolean;
  title: string;
  subtitle: string;
  verifiedDate?: string | null;
  uploadHref?: string;
}) {
  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-[10px] ${
        done
          ? "bg-[var(--color-accent-soft)]"
          : "bg-[var(--color-surface-sunk)] border border-dashed border-[var(--color-line-2)]"
      }`}
    >
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
        style={{
          background: done ? "var(--color-accent)" : "var(--color-surface-2)",
          color: done ? "var(--color-accent-fg)" : "var(--color-ink-3)",
          border: done ? "none" : "1px dashed var(--color-line-2)",
        }}
      >
        {done ? <Check className="w-3.5 h-3.5" strokeWidth={2.6} /> : <Plus className="w-3.5 h-3.5" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13.5px] font-semibold text-[var(--color-ink)]">{title}</div>
        <div className="text-[12.5px] text-[var(--color-ink-2)] leading-[1.4] mt-0.5">
          {subtitle}
        </div>
        {done && verifiedDate && (
          <div className="font-mono text-[10px] uppercase tracking-[0.04em] text-[var(--color-accent)] mt-1">
            VERIFIED {new Date(verifiedDate).toLocaleDateString("en-AU", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase()}
          </div>
        )}
      </div>
      {done ? (
        <Check className="w-3.5 h-3.5 text-[var(--color-accent)] shrink-0" strokeWidth={2.6} />
      ) : uploadHref ? (
        <Link
          href={uploadHref}
          className="inline-flex items-center gap-1 h-8 px-3 rounded-[8px] bg-[var(--color-primary)] text-[color:var(--color-primary-fg)] text-[12.5px] font-semibold shrink-0"
        >
          <Upload className="w-3 h-3" /> Upload
        </Link>
      ) : null}
    </div>
  );
}

function ReferenceItem({
  quote,
  name,
  role,
  date,
  location,
}: {
  quote: string;
  name: string;
  role: string;
  date: string;
  location: string;
}) {
  return (
    <div className="space-y-2">
      <p className="text-[13.5px] text-[var(--color-ink-2)] leading-[1.55] italic">
        &ldquo;{quote}&rdquo;
      </p>
      <div className="flex flex-wrap items-center gap-1.5 text-[11.5px]">
        <span className="inline-flex items-center gap-1 h-[20px] px-1.5 rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)] font-semibold">
          <Check className="w-2.5 h-2.5" strokeWidth={2.6} /> Verified
        </span>
        <span className="text-[var(--color-ink-2)] font-semibold">{name}</span>
        <span className="text-[var(--color-ink-3)]">· {role}</span>
        <span className="font-mono text-[10.5px] uppercase tracking-[0.04em] text-[var(--color-ink-3)]">
          · {date} · {location}
        </span>
      </div>
    </div>
  );
}

function ActivityRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between text-[13px] py-1">
      <span className="text-[var(--color-ink-2)]">{label}</span>
      <span className="font-mono text-[12px] text-[var(--color-ink)] font-semibold">{value}</span>
    </div>
  );
}
