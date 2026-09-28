import { useRef, useState } from "react";
import { AlertTriangle, ExternalLink, ImagePlus, Phone, X } from "lucide-react";
import { useHubNavigate } from "../HubLink";
import { Button } from "../ui/Button";
import { InlineAlert } from "../ui/Feedback";
import { ChoiceCard, Field, Input, Select, Textarea } from "../ui/Field";
import { Dialog } from "../ui/Overlay";
import { useToast } from "../../ui/Toast";
import { hubApi, hubUploadWithProgress, HubError } from "../../../lib/hub/api";
import { invalidate } from "../../../lib/hub/query";
import { MAINTENANCE_CATEGORIES } from "../../../lib/hub/status";
import type { EmergencyGuidance, MaintenanceSummary } from "../../../lib/hub/types";

export function EmergencyPanel({ g, compact }: { g: EmergencyGuidance; compact?: boolean }) {
  return (
    <div role="note" className="flex flex-col gap-3 rounded-[16px] border border-[color:color-mix(in_oklab,var(--color-danger-500)_35%,transparent)] bg-[color:color-mix(in_oklab,var(--color-danger-500)_8%,var(--color-surface))] p-4">
      <p className="flex items-center gap-2 text-[14.5px] font-semibold text-[color:var(--color-ink)]">
        <AlertTriangle className="h-4 w-4 text-[color:var(--color-danger-500)]" strokeWidth={2} aria-hidden />
        In an emergency
      </p>
      <ul className="flex list-disc flex-col gap-1.5 pl-5 text-[13.5px] leading-snug text-[color:var(--color-ink-2)]">
        {g.lines.map((l) => (
          <li key={l}>{l}</li>
        ))}
      </ul>
      {!compact && (
        <div className="flex flex-wrap gap-2">
          <a href="tel:000" className="inline-flex h-9 items-center gap-2 rounded-full bg-[var(--color-danger-500)] px-4 text-[13.5px] font-semibold text-white">
            <Phone className="h-4 w-4" strokeWidth={2} aria-hidden />
            Call 000
          </a>
          {g.authority_url && (
            <a href={g.authority_url} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[var(--color-line-2)] bg-[var(--color-surface)] px-4 text-[13.5px] font-semibold text-[color:var(--color-ink)]">
              Urgent repairs: {g.authority_name}
              <ExternalLink className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
            </a>
          )}
        </div>
      )}
    </div>
  );
}

const URGENCIES = [
  { value: "routine", title: "Routine", description: "Needs fixing, but it can wait a few days." },
  { value: "urgent", title: "Urgent", description: "No hot water, a broken lock, a leaking roof, an appliance for cooking or heating that has stopped." },
  { value: "emergency", title: "Emergency", description: "Danger to people or serious damage right now: gas, fire, flooding, live wiring." },
] as const;

/** A renter reporting a repair. Emergencies get the right advice first. */
export default function MaintenanceForm({ open, onClose, tenancyId, emergency }: { open: boolean; onClose: () => void; tenancyId: string; emergency: EmergencyGuidance }) {
  const toast = useToast();
  const navigate = useHubNavigate();
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [urgency, setUrgency] = useState<"routine" | "urgent" | "emergency">("routine");
  const [access, setAccess] = useState("");
  const [files, setFiles] = useState<{ file: File; url: string }[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const errors = {
    category: !category ? "Choose what it's about" : undefined,
    title: title.trim().length < 3 ? "Say in a few words what's wrong" : undefined,
    description: description.trim().length < 3 ? "Describe the problem" : undefined,
  };
  const valid = !errors.category && !errors.title && !errors.description;

  function reset() {
    setCategory("");
    setTitle("");
    setDescription("");
    setUrgency("routine");
    setAccess("");
    files.forEach((f) => URL.revokeObjectURL(f.url));
    setFiles([]);
    setTouched(false);
  }

  function addFiles(list: FileList | null) {
    if (!list) return;
    const picked = Array.from(list).filter((f) => /^image\/(jpeg|png|webp|heic|heif)$/.test(f.type) && f.size <= 10 * 1024 * 1024);
    if (picked.length < list.length) toast.warning("Some files were skipped. Photos can be JPEG, PNG or WebP, up to 10MB each.");
    setFiles((xs) => [...xs, ...picked.slice(0, 8 - xs.length).map((file) => ({ file, url: URL.createObjectURL(file) }))]);
  }

  async function submit() {
    setTouched(true);
    if (!valid) return;
    setBusy("Sending");
    try {
      const res = await hubApi.post<{ request: MaintenanceSummary }>(`/hub/tenancies/${tenancyId}/maintenance`, {
        category,
        title: title.trim(),
        description: description.trim(),
        urgency,
        access_notes: access.trim() || undefined,
      });
      let failed = 0;
      for (let i = 0; i < files.length; i++) {
        setBusy(`Adding photo ${i + 1} of ${files.length}`);
        const form = new FormData();
        form.append("file", files[i].file, files[i].file.name);
        try {
          await hubUploadWithProgress(`/hub/maintenance/${res.request.id}/photos`, form, () => {});
        } catch {
          failed++;
        }
      }
      invalidate(`/hub/tenancies/${tenancyId}`);
      invalidate("/hub/maintenance");
      invalidate("/hub/home");
      toast.success("Request sent", { description: failed ? `${failed} photo${failed === 1 ? "" : "s"} didn't upload - you can add them on the request.` : "The owner has been notified." });
      reset();
      onClose();
      void navigate(`/maintenance/${res.request.id}`);
    } catch (e) {
      toast.error(e instanceof HubError ? e.message : "The request didn't send.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={() => !busy && onClose()}
      title="Request a repair"
      description="The owner is notified straight away and can reply here."
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={!!busy}>
            Cancel
          </Button>
          <Button loading={!!busy} onClick={() => void submit()}>
            {busy ?? "Send request"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <fieldset className="flex flex-col gap-2.5">
          <legend className="mb-2 text-[14px] font-semibold text-[color:var(--color-ink)]">How urgent is it?</legend>
          <div className="grid gap-2.5 sm:grid-cols-3">
            {URGENCIES.map((u) => (
              <ChoiceCard key={u.value} name="urgency" value={u.value} selected={urgency === u.value} onSelect={() => setUrgency(u.value)} title={u.title} description={u.description} />
            ))}
          </div>
        </fieldset>
        {urgency === "emergency" && <EmergencyPanel g={emergency} />}
        {urgency === "urgent" && (
          <InlineAlert tone="warning">
            For urgent repairs, phone the owner too.{" "}
            {emergency.authority_url ? (
              <a href={emergency.authority_url} target="_blank" rel="noopener noreferrer" className="font-semibold underline">
                {emergency.authority_name}
              </a>
            ) : (
              emergency.authority_name
            )}{" "}
            explains what counts as urgent and what you can do if no one responds.
          </InlineAlert>
        )}
        <div className="grid gap-4 sm:grid-cols-[220px_minmax(0,1fr)]">
          <Field label="What's it about?" error={touched ? errors.category : undefined}>
            {({ id, describedBy, invalid }) => (
              <Select id={id} value={category} onChange={(e) => setCategory(e.target.value)} aria-describedby={describedBy} aria-invalid={invalid}>
                <option value="">Choose</option>
                {MAINTENANCE_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field label="In a few words" error={touched ? errors.title : undefined}>
            {({ id, describedBy, invalid }) => <Input id={id} value={title} maxLength={120} placeholder="e.g. Kitchen tap is leaking" onChange={(e) => setTitle(e.target.value)} aria-describedby={describedBy} aria-invalid={invalid} />}
          </Field>
        </div>
        <Field label="What's happening?" hint="When it started, what you've tried, and anything the tradesperson should know." error={touched ? errors.description : undefined}>
          {({ id, describedBy, invalid }) => <Textarea id={id} rows={4} value={description} maxLength={3000} onChange={(e) => setDescription(e.target.value)} aria-describedby={describedBy} aria-invalid={invalid} />}
        </Field>
        <Field label="Access" optional hint="When someone can come in, pets, parking or a key arrangement.">
          {({ id, describedBy }) => <Input id={id} value={access} maxLength={500} onChange={(e) => setAccess(e.target.value)} aria-describedby={describedBy} />}
        </Field>
        <div className="flex flex-col gap-2">
          <p className="text-[14px] font-semibold text-[color:var(--color-ink)]">
            Photos <span className="font-normal text-[color:var(--color-ink-3)]">(optional, up to 8)</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {files.map((f, i) => (
              <span key={f.url} className="relative h-20 w-20 overflow-hidden rounded-[12px] bg-[var(--color-surface-muted)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={f.url} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
                <button type="button" aria-label={`Remove photo ${i + 1}`} onClick={() => {
                    URL.revokeObjectURL(f.url);
                    setFiles((xs) => xs.filter((_, j) => j !== i));
                  }} className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white">
                  <X className="h-3.5 w-3.5" strokeWidth={2.2} />
                </button>
              </span>
            ))}
            {files.length < 8 && (
              <button type="button" onClick={() => input.current?.click()} className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-[12px] border border-dashed border-[var(--color-line-2)] text-[12px] font-semibold text-[color:var(--color-ink-2)] hover:border-[var(--color-primary)] hover:text-[color:var(--color-primary)]">
                <ImagePlus className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                Add
              </button>
            )}
          </div>
          <input
            ref={input}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="sr-only"
            onChange={(e) => {
              addFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </div>
      </div>
    </Dialog>
  );
}
