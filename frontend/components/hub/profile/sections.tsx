import { useRef, useState, type ReactNode } from "react";
import { FileText, Paperclip, Plus, Trash2, Upload, UserRound } from "lucide-react";
import { cn } from "../../../lib/cn";
import { hubApi, hubUploadWithProgress, HubError } from "../../../lib/hub/api";
import { bytes } from "../../../lib/hub/format";
import type { DocumentMeta, Referee, RentalHistoryEntry, RentalProfile } from "../../../lib/hub/types";
import { useConfirm } from "../../ui/ConfirmDialog";
import { useToast } from "../../ui/Toast";
import { Button } from "../ui/Button";
import { Checkbox, Field, Input, Select, Stepper, Switch, Textarea } from "../ui/Field";
import { InlineAlert, ProgressBar } from "../ui/Feedback";

/**
 * The Rental Profile, section by section. The same editors appear on the
 * Rental Profile page and inside an application, so a renter fills each
 * one in once. Every section is controlled: it reports a patch and the page
 * decides when to save.
 */

export type ProfileDraft = RentalProfile & { display_name: string };
export type Patch = Partial<ProfileDraft>;

interface SectionProps {
  value: ProfileDraft;
  onChange: (patch: Patch) => void;
  errors?: Record<string, string | undefined>;
}

export function SectionCard({ title, description, children, id, aside }: { title: string; description?: ReactNode; children: ReactNode; id?: string; aside?: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 rounded-[22px] border border-[var(--color-line)] bg-[var(--color-surface)] p-5 sm:p-7">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-[19px] font-semibold tracking-[-0.015em] text-[color:var(--color-ink)]">{title}</h2>
          {description && <p className="max-w-[560px] text-[14px] leading-relaxed text-[color:var(--color-ink-2)]">{description}</p>}
        </div>
        {aside}
      </div>
      <div className="flex flex-col gap-5">{children}</div>
    </section>
  );
}

export function AboutSection({ value, onChange, errors = {} }: SectionProps) {
  const len = (value.intro || "").trim().length;
  return (
    <>
      <Field label="Your name" hint="As you'd like owners to see it." error={errors.display_name}>
        {({ id, describedBy, invalid }) => <Input id={id} autoComplete="name" value={value.display_name} onChange={(e) => onChange({ display_name: e.target.value })} aria-describedby={describedBy} aria-invalid={invalid} maxLength={80} />}
      </Field>
      <Field
        label="A short introduction"
        hint={`A few sentences about you and why you're moving. ${len < 40 ? `${40 - len} more characters to go.` : "Looks good."}`}
        error={errors.intro}
      >
        {({ id, describedBy, invalid }) => (
          <Textarea
            id={id}
            rows={5}
            value={value.intro || ""}
            onChange={(e) => onChange({ intro: e.target.value.slice(0, 1500) })}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            placeholder="For example: I'm a nurse starting at Westmead next month. I'm quiet, tidy and I cook a lot."
          />
        )}
      </Field>
      <InlineAlert tone="neutral">Only share what helps an owner understand you as a tenant. You never need to share your nationality, visa, religion or age.</InlineAlert>
    </>
  );
}

export function MovingSection({ value, onChange }: SectionProps) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Field label="When do you want to move?">
        {({ id }) => <Input id={id} type="date" value={value.preferred_move_date || ""} min={new Date().toISOString().slice(0, 10)} onChange={(e) => onChange({ preferred_move_date: e.target.value || null })} />}
      </Field>
      <Field label="How long do you want to stay?">
        {({ id }) => (
          <Select id={id} value={value.preferred_lease_months ?? ""} onChange={(e) => onChange({ preferred_lease_months: e.target.value ? Number(e.target.value) : null })}>
            <option value="">Choose</option>
            <option value="1">1 month</option>
            <option value="3">3 months</option>
            <option value="6">6 months</option>
            <option value="12">12 months</option>
            <option value="24">2 years or more</option>
          </Select>
        )}
      </Field>
      <Field label="Weekly budget" optional hint="Used to suggest homes. Owners don't see it.">
        {({ id, describedBy }) => <Input id={id} inputMode="numeric" prefix="$" value={value.budget_weekly ?? ""} onChange={(e) => onChange({ budget_weekly: e.target.value ? Number(e.target.value.replace(/\D/g, "").slice(0, 5)) : null })} aria-describedby={describedBy} />}
      </Field>
      <Field label="Suburbs you like" optional hint="Separate with commas. Used for suggestions only.">
        {({ id, describedBy }) => (
          <Input
            id={id}
            value={(value.preferred_suburbs || []).join(", ")}
            onChange={(e) => onChange({ preferred_suburbs: e.target.value.split(",").map((s) => s.trimStart()).slice(0, 10) })}
            onBlur={(e) => onChange({ preferred_suburbs: e.target.value.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 10) })}
            aria-describedby={describedBy}
          />
        )}
      </Field>
    </div>
  );
}

export function HouseholdSection({ value, onChange }: SectionProps) {
  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <span className="text-[13.5px] font-semibold text-[color:var(--color-ink)]">Adults (including you)</span>
          <Stepper label="Adults" value={value.household_adults || 1} min={1} max={20} onChange={(v) => onChange({ household_adults: v })} />
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-[13.5px] font-semibold text-[color:var(--color-ink)]">Children</span>
          <Stepper label="Children" value={value.household_children || 0} min={0} max={20} onChange={(v) => onChange({ household_children: v })} />
        </div>
      </div>
      <Switch checked={Boolean(value.has_pets)} onChange={(v) => onChange({ has_pets: v, pet_details: v ? value.pet_details : null })} label="I have pets" />
      {value.has_pets && (
        <Field label="Tell owners about them">
          {({ id }) => <Input id={id} value={value.pet_details || ""} onChange={(e) => onChange({ pet_details: e.target.value.slice(0, 300) })} placeholder="For example: one desexed indoor cat, 6 years old" />}
        </Field>
      )}
      <Field label="Anything else about your household" optional>
        {({ id }) => <Textarea id={id} rows={3} value={value.household_notes || ""} onChange={(e) => onChange({ household_notes: e.target.value.slice(0, 500) })} placeholder="For example: my partner and I both work from home two days a week" />}
      </Field>
    </>
  );
}

const EMPLOYMENT = [
  { value: "employed", label: "Employed" },
  { value: "self_employed", label: "Self-employed" },
  { value: "student", label: "Studying" },
  { value: "looking", label: "Looking for work" },
  { value: "retired", label: "Retired" },
  { value: "other", label: "Something else" },
];

export function WorkSection({ value, onChange, errors = {}, shareIncome, onShareIncome }: SectionProps & { shareIncome?: boolean; onShareIncome?: (v: boolean) => void }) {
  const employed = value.employment_status === "employed" || value.employment_status === "self_employed";
  return (
    <>
      <Field label="What best describes you right now?" error={errors.employment_status}>
        {({ id, describedBy, invalid }) => (
          <Select id={id} value={value.employment_status || ""} onChange={(e) => onChange({ employment_status: e.target.value || null })} aria-describedby={describedBy} aria-invalid={invalid}>
            <option value="">Choose</option>
            {EMPLOYMENT.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        )}
      </Field>
      {(employed || value.employment_status === "student") && (
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={value.employment_status === "student" ? "Where you study" : "Employer"} error={errors.employer}>
            {({ id, describedBy, invalid }) => <Input id={id} autoComplete="organization" value={value.employer || ""} onChange={(e) => onChange({ employer: e.target.value.slice(0, 120) })} aria-describedby={describedBy} aria-invalid={invalid} />}
          </Field>
          <Field label={value.employment_status === "student" ? "Course" : "Job title"} optional>
            {({ id }) => <Input id={id} autoComplete="organization-title" value={value.job_title || ""} onChange={(e) => onChange({ job_title: e.target.value.slice(0, 120) })} />}
          </Field>
          <Field label="Since" optional>
            {({ id }) => <Input id={id} type="month" value={(value.employment_since || "").slice(0, 7)} onChange={(e) => onChange({ employment_since: e.target.value ? `${e.target.value}-01` : null })} />}
          </Field>
        </div>
      )}
      <Field label="Weekly income before tax" optional hint="Only shared with an owner if you choose to, application by application.">
        {({ id, describedBy }) => <Input id={id} inputMode="numeric" prefix="$" value={value.income_weekly ?? ""} onChange={(e) => onChange({ income_weekly: e.target.value ? Number(e.target.value.replace(/\D/g, "").slice(0, 6)) : null })} aria-describedby={describedBy} />}
      </Field>
      {onShareIncome && value.income_weekly ? (
        <Checkbox checked={Boolean(shareIncome)} onChange={onShareIncome} label="Share my income with this owner" description="Owners often ask. If you leave this off, they'll see everything else." />
      ) : null}
    </>
  );
}

const emptyEntry: RentalHistoryEntry = { suburb: "", from_month: "", to_month: "", weekly_rent: null, landlord_name: "", reason_for_leaving: "", country: "Australia" };

export function HistorySection({ value, onChange }: SectionProps) {
  const list = value.rental_history || [];
  const set = (i: number, patch: Partial<RentalHistoryEntry>) => onChange({ rental_history: list.map((e, j) => (j === i ? { ...e, ...patch } : e)) });
  return (
    <>
      <Checkbox
        checked={Boolean(value.first_time_renter)}
        onChange={(v) => onChange({ first_time_renter: v })}
        label="This is my first rental in Australia"
        description="Common for new arrivals and students. Saying so counts as complete; add past homes overseas if you like."
      />
      {list.map((e, i) => (
        <div key={i} className="flex flex-col gap-4 rounded-[16px] border border-[var(--color-line)] p-4">
          <div className="flex items-center justify-between">
            <p className="text-[14px] font-semibold text-[color:var(--color-ink)]">Previous home {i + 1}</p>
            <Button variant="ghost" size="sm" icon={<Trash2 className="h-4 w-4" strokeWidth={1.75} />} onClick={() => onChange({ rental_history: list.filter((_, j) => j !== i) })}>
              Remove
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Suburb or city">{({ id }) => <Input id={id} value={e.suburb} onChange={(ev) => set(i, { suburb: ev.target.value.slice(0, 120) })} placeholder="Brunswick VIC" />}</Field>
            <Field label="Country">{({ id }) => <Input id={id} autoComplete="country-name" value={e.country || ""} onChange={(ev) => set(i, { country: ev.target.value.slice(0, 60) })} />}</Field>
            <Field label="From">{({ id }) => <Input id={id} type="month" value={e.from_month || ""} onChange={(ev) => set(i, { from_month: ev.target.value })} />}</Field>
            <Field label="To">{({ id }) => <Input id={id} type="month" value={e.to_month || ""} onChange={(ev) => set(i, { to_month: ev.target.value })} />}</Field>
            <Field label="Weekly rent" optional>{({ id }) => <Input id={id} inputMode="numeric" prefix="$" value={e.weekly_rent ?? ""} onChange={(ev) => set(i, { weekly_rent: ev.target.value ? Number(ev.target.value.replace(/\D/g, "").slice(0, 5)) : null })} />}</Field>
            <Field label="Landlord or agency" optional>{({ id }) => <Input id={id} value={e.landlord_name || ""} onChange={(ev) => set(i, { landlord_name: ev.target.value.slice(0, 120) })} />}</Field>
          </div>
          <Field label="Why you left" optional>{({ id }) => <Input id={id} value={e.reason_for_leaving || ""} onChange={(ev) => set(i, { reason_for_leaving: ev.target.value.slice(0, 300) })} />}</Field>
        </div>
      ))}
      {list.length < 10 && (
        <Button variant="secondary" icon={<Plus className="h-4 w-4" strokeWidth={1.9} />} onClick={() => onChange({ rental_history: [...list, { ...emptyEntry }] })} className="w-fit">
          Add a previous home
        </Button>
      )}
    </>
  );
}

export function RefereesSection({ value, onChange, errors = {} }: SectionProps) {
  const list = value.referees || [];
  const set = (i: number, patch: Partial<Referee>) => onChange({ referees: list.map((r, j) => (j === i ? { ...r, ...patch } : r)) });
  return (
    <>
      {list.length === 0 && <p className="text-[14px] text-[color:var(--color-ink-2)]">A past landlord, a manager or a teacher who can vouch for you. Let them know an owner may get in touch.</p>}
      {list.map((r, i) => (
        <div key={i} className="flex flex-col gap-4 rounded-[16px] border border-[var(--color-line)] p-4">
          <div className="flex items-center justify-between">
            <p className="inline-flex items-center gap-2 text-[14px] font-semibold text-[color:var(--color-ink)]">
              <UserRound className="h-4 w-4 text-[color:var(--color-ink-3)]" strokeWidth={1.75} aria-hidden />
              Referee {i + 1}
            </p>
            <Button variant="ghost" size="sm" icon={<Trash2 className="h-4 w-4" strokeWidth={1.75} />} onClick={() => onChange({ referees: list.filter((_, j) => j !== i) })}>
              Remove
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" error={errors[`referee_${i}_name`]}>{({ id, invalid }) => <Input id={id} value={r.name} onChange={(e) => set(i, { name: e.target.value.slice(0, 120) })} aria-invalid={invalid} />}</Field>
            <Field label="How they know you" error={errors[`referee_${i}_relationship`]}>{({ id, invalid }) => <Input id={id} value={r.relationship} onChange={(e) => set(i, { relationship: e.target.value.slice(0, 80) })} placeholder="Former landlord" aria-invalid={invalid} />}</Field>
            <Field label="Email" optional error={errors[`referee_${i}_email`]}>{({ id, invalid }) => <Input id={id} type="email" inputMode="email" value={r.email || ""} onChange={(e) => set(i, { email: e.target.value.slice(0, 200) })} aria-invalid={invalid} />}</Field>
            <Field label="Phone" optional>{({ id }) => <Input id={id} type="tel" inputMode="tel" value={r.phone || ""} onChange={(e) => set(i, { phone: e.target.value.slice(0, 40) })} />}</Field>
          </div>
        </div>
      ))}
      {list.length < 5 && (
        <Button variant="secondary" icon={<Plus className="h-4 w-4" strokeWidth={1.9} />} onClick={() => onChange({ referees: [...list, { name: "", relationship: "", email: "", phone: "" }] })} className="w-fit">
          Add a referee
        </Button>
      )}
    </>
  );
}

export function refereeErrors(list: Referee[]): Record<string, string> {
  const errs: Record<string, string> = {};
  list.forEach((r, i) => {
    if (!r.name.trim() || r.name.trim().length < 2) errs[`referee_${i}_name`] = "Add their name.";
    if (!r.relationship.trim() || r.relationship.trim().length < 2) errs[`referee_${i}_relationship`] = "Say how they know you.";
    if (r.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.email.trim())) errs[`referee_${i}_email`] = "That email doesn't look right.";
  });
  return errs;
}

/** Clean empty rows out before saving, so a half-added referee never blocks a save. */
export function cleanForSave(d: ProfileDraft): Patch {
  return {
    ...d,
    preferred_suburbs: (d.preferred_suburbs || []).map((s) => s.trim()).filter(Boolean),
    rental_history: (d.rental_history || []).filter((e) => e.suburb.trim().length >= 2).map((e) => ({ ...e, weekly_rent: e.weekly_rent || null })),
    referees: (d.referees || []).filter((r) => r.name.trim().length >= 2 && r.relationship.trim().length >= 2),
  };
}

const DOC_KINDS = [
  { value: "identity", label: "Proof of identity" },
  { value: "income", label: "Proof of income" },
  { value: "employment", label: "Employment letter or contract" },
  { value: "rental_history", label: "Rental ledger or reference" },
  { value: "reference", label: "Written reference" },
  { value: "study", label: "Enrolment confirmation" },
  { value: "other", label: "Other" },
];

export const docKindLabel = (k: string) => DOC_KINDS.find((d) => d.value === k)?.label ?? "Document";

/**
 * Private documents. Stored in a private bucket; only people you share an
 * application with can open them, through links that expire in minutes.
 */
export function DocumentsSection({ documents, onUploaded, onDeleted, selectable, selected, onSelect }: { documents: DocumentMeta[]; onUploaded: (d: DocumentMeta) => void; onDeleted?: (id: string) => void; selectable?: boolean; selected?: string[]; onSelect?: (ids: string[]) => void }) {
  const toast = useToast();
  const confirm = useConfirm();
  const input = useRef<HTMLInputElement>(null);
  const [kind, setKind] = useState("income");
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  async function upload(file: File) {
    setError(null);
    if (file.size > 10 * 1024 * 1024) return setError("That file is larger than 10MB.");
    if (!/^(application\/pdf|image\/(jpeg|png|webp))$/.test(file.type)) return setError("Upload a PDF, JPEG, PNG or WebP file.");
    const form = new FormData();
    form.append("file", file, file.name);
    form.append("kind", kind);
    setProgress(0);
    try {
      const doc = await hubUploadWithProgress<DocumentMeta>("/hub/documents", form, setProgress);
      onUploaded(doc);
      if (selectable && onSelect) onSelect([...(selected ?? []), doc.id]);
      toast.success("Document added");
    } catch (e) {
      setError(e instanceof HubError ? e.message : "The upload did not finish.");
    } finally {
      setProgress(null);
      if (input.current) input.current.value = "";
    }
  }

  async function open(id: string) {
    try {
      const { url } = await hubApi.get<{ url: string }>(`/hub/documents/${id}/url`);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (e) {
      toast.error(e instanceof HubError ? e.message : "That document could not be opened.");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {documents.length > 0 && (
        <ul className="flex flex-col divide-y divide-[var(--color-line)] rounded-[16px] border border-[var(--color-line)]">
          {documents.map((d) => (
            <li key={d.id} className="flex items-center gap-3 px-4 py-3">
              {selectable ? (
                <Checkbox
                  checked={Boolean(selected?.includes(d.id))}
                  onChange={(v) => onSelect?.(v ? [...(selected ?? []), d.id] : (selected ?? []).filter((x) => x !== d.id))}
                  label={<span className="font-semibold">{d.label || docKindLabel(d.kind)}</span>}
                  description={`${d.file_name} · ${bytes(d.size_bytes)}`}
                />
              ) : (
                <>
                  <FileText className="h-5 w-5 shrink-0 text-[color:var(--color-ink-3)]" strokeWidth={1.75} aria-hidden />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <p className="truncate text-[14.5px] font-semibold text-[color:var(--color-ink)]">{d.label || docKindLabel(d.kind)}</p>
                    <p className="truncate text-[12.5px] text-[color:var(--color-ink-3)]">
                      {d.file_name} · {bytes(d.size_bytes)}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => void open(d.id)}>
                    View
                  </Button>
                  {onDeleted && (
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label={`Delete ${d.file_name}`}
                      icon={<Trash2 className="h-4 w-4" strokeWidth={1.75} />}
                      onClick={async () => {
                        const ok = await confirm({ title: "Delete this document?", description: "It will also be removed from any application you shared it with.", confirmLabel: "Delete", tone: "danger" });
                        if (!ok) return;
                        try {
                          await hubApi.del(`/hub/documents/${d.id}`);
                          onDeleted(d.id);
                        } catch (e) {
                          toast.error(e instanceof HubError ? e.message : "That did not delete.");
                        }
                      }}
                    />
                  )}
                </>
              )}
            </li>
          ))}
        </ul>
      )}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const f = e.dataTransfer.files?.[0];
          if (f) void upload(f);
        }}
        className={cn(
          "flex flex-col gap-4 rounded-[18px] border-2 border-dashed p-5 transition-colors sm:flex-row sm:items-end",
          dragging ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)]" : "border-[var(--color-line-2)]",
        )}
      >
        <Field label="What is it?" className="flex-1">
          {({ id }) => (
            <Select id={id} value={kind} onChange={(e) => setKind(e.target.value)}>
              {DOC_KINDS.map((k) => (
                <option key={k.value} value={k.value}>
                  {k.label}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <input ref={input} type="file" aria-label="Upload a document" tabIndex={-1} accept="application/pdf,image/jpeg,image/png,image/webp" className="sr-only" id="hub-doc-upload" onChange={(e) => e.target.files?.[0] && void upload(e.target.files[0])} />
        <Button variant="secondary" icon={<Upload className="h-4 w-4" strokeWidth={1.9} />} onClick={() => input.current?.click()} loading={progress !== null}>
          Choose a file
        </Button>
      </div>
      <p className="flex items-start gap-2 text-[12.5px] leading-snug text-[color:var(--color-ink-3)]">
        <Paperclip className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
        PDF or photo, up to 10MB. Drag a file here or choose one. Cover your passport or licence number if an owner doesn't need it - a name and photo is usually enough.
      </p>
      {progress !== null && <ProgressBar value={progress * 100} label="Upload progress" />}
      {error && <InlineAlert tone="danger">{error}</InlineAlert>}
    </div>
  );
}
