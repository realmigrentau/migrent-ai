import { useEffect, useRef, useState, type ReactNode } from "react";
import { Camera, Check, Copy, Download, KeyRound, LogOut, Pencil, Plus, Smartphone, Trash2, Upload } from "lucide-react";
import HubShell from "../../components/hub/HubShell";
import { ThemeSegmented } from "../../components/hub/ThemeToggle";
import { Button, ButtonLink } from "../../components/hub/ui/Button";
import { ErrorState, InlineAlert, RowSkeleton, StatusBadge } from "../../components/hub/ui/Feedback";
import { ChoiceCard, Field, Input, Select, Switch, Textarea } from "../../components/hub/ui/Field";
import { PageHeader } from "../../components/hub/ui/Layout";
import { Avatar } from "../../components/hub/ui/Media";
import { Dialog } from "../../components/hub/ui/Overlay";
import { useConfirm } from "../../components/ui/ConfirmDialog";
import { useToast } from "../../components/ui/Toast";
import { hubApi, hubUploadWithProgress, HubError } from "../../lib/hub/api";
import { day } from "../../lib/hub/format";
import { invalidate, setQueryData, useHubQuery } from "../../lib/hub/query";
import { hubUrl, siteUrl } from "../../lib/hub/routes";
import { useHub } from "../../lib/hub/session";
import type { HubMe, Template } from "../../lib/hub/types";
import { supabase } from "../../lib/supabase";
import { cn } from "../../lib/cn";

/* ── Layout ─────────────────────────────────────────────── */

function Card({ id, title, description, children, aside }: { id: string; title: string; description?: ReactNode; children: ReactNode; aside?: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-24 rounded-[22px] border border-[var(--color-line)] bg-[var(--color-surface)] p-5 sm:p-7">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 id={`${id}-title`} className="text-[18px] font-semibold tracking-[-0.015em] text-[color:var(--color-ink)]">
            {title}
          </h2>
          {description && <p className="max-w-[580px] text-[14px] leading-relaxed text-[color:var(--color-ink-2)]">{description}</p>}
        </div>
        {aside}
      </div>
      {children}
    </section>
  );
}

function Row({ title, detail, action }: { title: ReactNode; detail?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 border-t border-[var(--color-line)] py-4 first:border-0 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-col gap-0.5">
        <p className="text-[15px] font-medium text-[color:var(--color-ink)]">{title}</p>
        {detail && <p className="text-[13.5px] leading-snug text-[color:var(--color-ink-3)]">{detail}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

function errMsg(e: unknown, fallback: string) {
  if (e instanceof HubError) return e.message;
  if (e && typeof e === "object" && "message" in e && typeof (e as { message: unknown }).message === "string") return (e as { message: string }).message;
  return fallback;
}

/* ── Profile ────────────────────────────────────────────── */

function ProfileCard({ me }: { me: HubMe }) {
  const toast = useToast();
  const [name, setName] = useState(me.name);
  const [saving, setSaving] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const file = useRef<HTMLInputElement>(null);

  async function saveName() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const res = await hubApi.patch<HubMe>("/hub/settings", { name: name.trim() });
      setQueryData("/hub/me", res);
      toast.success("Name saved");
    } catch (e) {
      toast.error(errMsg(e, "Your name didn't save."));
    } finally {
      setSaving(false);
    }
  }

  async function uploadPhoto(f: File) {
    if (!/^image\/(jpeg|png|webp)$/.test(f.type)) return toast.error("Use a JPEG, PNG or WebP photo.");
    if (f.size > 5 * 1024 * 1024) return toast.error("Photos can be up to 5MB.");
    setPhotoBusy(true);
    try {
      const form = new FormData();
      form.append("file", f, f.name);
      await hubUploadWithProgress("/profiles/me/photo", form, () => {});
      invalidate("/hub/me");
      toast.success("Photo updated");
    } catch (e) {
      toast.error(errMsg(e, "The photo didn't upload."));
    } finally {
      setPhotoBusy(false);
      if (file.current) file.current.value = "";
    }
  }

  return (
    <Card id="profile" title="Profile" description="How you appear to owners and renters on Migrent.">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Avatar name={me.name || me.email} src={me.avatar_url} size={72} />
          <div className="flex flex-col gap-2">
            <input ref={file} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" id="settings-photo" onChange={(e) => e.target.files?.[0] && void uploadPhoto(e.target.files[0])} />
            <Button variant="secondary" size="sm" loading={photoBusy} icon={<Camera className="h-4 w-4" strokeWidth={1.75} />} onClick={() => file.current?.click()}>
              {me.avatar_url ? "Change photo" : "Add a photo"}
            </Button>
            <p className="text-[12.5px] text-[color:var(--color-ink-3)]">A clear photo of your face helps people trust who they're talking to.</p>
          </div>
        </div>
        <form
          className="flex flex-col gap-3 sm:flex-row sm:items-end"
          onSubmit={(e) => {
            e.preventDefault();
            void saveName();
          }}
        >
          <Field label="Name" className="flex-1" error={!name.trim() ? "Add your name" : undefined}>
            {({ id, describedBy, invalid }) => <Input id={id} value={name} maxLength={80} autoComplete="name" onChange={(e) => setName(e.target.value)} aria-describedby={describedBy} aria-invalid={invalid} />}
          </Field>
          <Button type="submit" variant="secondary" loading={saving} disabled={!name.trim() || name.trim() === me.name}>
            Save
          </Button>
        </form>
        <Row
          title="Email"
          detail={
            <>
              {me.email} · used to sign in{me.member_since ? ` · member since ${day(me.member_since)}` : ""}
            </>
          }
          action={
            <Button variant="ghost" size="sm" onClick={() => setEmailOpen(true)}>
              Change
            </Button>
          }
        />
      </div>
      <ChangeEmailDialog open={emailOpen} onClose={() => setEmailOpen(false)} current={me.email} />
    </Card>
  );
}

function ChangeEmailDialog({ open, onClose, current }: { open: boolean; onClose: () => void; current: string | null }) {
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  async function submit() {
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ email: email.trim() }, { emailRedirectTo: `${window.location.origin}${hubUrl("/auth/callback")}?next=${encodeURIComponent("/settings")}` });
    setBusy(false);
    if (error) return toast.error(error.message);
    setSent(true);
  }

  return (
    <Dialog
      open={open}
      onClose={() => {
        onClose();
        setSent(false);
        setEmail("");
      }}
      title="Change your email"
      description={sent ? undefined : `You'll sign in with the new address. We'll send a confirmation link to it, and a notice to ${current ?? "your current address"}.`}
      footer={
        sent ? (
          <Button onClick={onClose}>Done</Button>
        ) : (
          <>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button loading={busy} disabled={!valid || email.trim().toLowerCase() === (current ?? "").toLowerCase()} onClick={() => void submit()}>
              Send confirmation
            </Button>
          </>
        )
      }
    >
      {sent ? (
        <p className="text-[15px] leading-relaxed text-[color:var(--color-ink-2)]">
          Check <span className="font-semibold text-[color:var(--color-ink)]">{email.trim()}</span> for a confirmation link. Your email changes once you open it.
        </p>
      ) : (
        <Field label="New email">
          {({ id }) => <Input id={id} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />}
        </Field>
      )}
    </Dialog>
  );
}

/* ── Account type ───────────────────────────────────────── */

function AccountTypeCard({ me }: { me: HubMe }) {
  const toast = useToast();
  const confirm = useConfirm();
  const [busy, setBusy] = useState<string | null>(null);
  const role = me.role;

  async function switchTo(target: "renter" | "owner") {
    const ok = await confirm({
      title: target === "owner" ? "Switch to listing homes?" : "Switch to renting?",
      description:
        target === "owner"
          ? "Migrent Hub will show your properties, applicants and tenancies instead of homes to rent. Your Rental Profile and saved homes are kept, and you can switch back."
          : "Migrent Hub will show homes to rent and your applications instead of your properties. You can switch back.",
      confirmLabel: "Switch",
    });
    if (!ok) return;
    setBusy(target);
    try {
      const res = await hubApi.post<HubMe>("/hub/role", { role: target });
      setQueryData("/hub/me", res);
      invalidate("/hub/");
      toast.success(target === "owner" ? "You're set up to list homes" : "You're set up to rent");
    } catch (e) {
      toast.error(errMsg(e, "That didn't switch."));
    } finally {
      setBusy(null);
    }
  }

  async function setKind(kind: "individual" | "property_manager") {
    setBusy(kind);
    try {
      const res = await hubApi.patch<HubMe>("/hub/settings", { owner_kind: kind });
      setQueryData("/hub/me", res);
    } catch (e) {
      toast.error(errMsg(e, "That didn't save."));
    } finally {
      setBusy(null);
    }
  }

  return (
    <Card id="account-type" title="What you use Migrent for" description="Your account has one main role. It decides what Migrent Hub shows you first.">
      <div className="grid gap-3 sm:grid-cols-2">
        <ChoiceCard name="role" value="renter" selected={role === "renter"} onSelect={() => role !== "renter" && void switchTo("renter")} title="Renting" description="Find homes, apply and manage where you live." />
        <ChoiceCard name="role" value="owner" selected={role === "owner"} onSelect={() => role !== "owner" && void switchTo("owner")} title="Listing homes" description="List properties, choose renters and manage tenancies." />
      </div>
      {busy && (busy === "renter" || busy === "owner") && <p className="mt-3 text-[13px] text-[color:var(--color-ink-3)]">Switching...</p>}
      {role === "owner" && (
        <div className="mt-6 flex flex-col gap-3">
          <p className="text-[14px] font-semibold text-[color:var(--color-ink)]">You list homes as</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <ChoiceCard name="owner-kind" value="individual" selected={me.owner_kind !== "property_manager"} onSelect={() => void setKind("individual")} title="The owner" description="Homes or rooms you own." />
            <ChoiceCard name="owner-kind" value="property_manager" selected={me.owner_kind === "property_manager"} onSelect={() => void setKind("property_manager")} title="A property manager" description="Homes you manage for their owners." />
          </div>
        </div>
      )}
    </Card>
  );
}

/* ── Owner ID check ─────────────────────────────────────── */

const ID_TYPES = [
  { value: "passport", label: "Passport" },
  { value: "drivers_licence", label: "Driver licence" },
  { value: "national_id", label: "National ID card" },
  { value: "visa", label: "Visa grant notice" },
];

function VerificationCard({ me }: { me: HubMe }) {
  const toast = useToast();
  const v = me.owner_verification;
  const [docType, setDocType] = useState("passport");
  const [picked, setPicked] = useState<File | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const file = useRef<HTMLInputElement>(null);
  const gid = v?.checks.government_id ?? "not_submitted";

  async function upload() {
    if (!picked) return;
    const form = new FormData();
    form.append("file", picked, picked.name);
    form.append("document_type", docType);
    setProgress(0);
    try {
      await hubUploadWithProgress("/owner-verification/id/upload", form, setProgress);
      setPicked(null);
      invalidate("/hub/me");
      toast.success("Sent for review", { description: "We usually check IDs within one working day." });
    } catch (e) {
      toast.error(errMsg(e, "The upload didn't finish."));
    } finally {
      setProgress(null);
    }
  }

  return (
    <Card
      id="verification"
      title="ID check"
      description="Renters see a mark on your listings once Migrent has checked your photo ID. Your document is never shown to anyone."
      aside={<StatusBadge tone={v?.status === "verified" ? "info" : v?.status === "pending" ? "warning" : "neutral"}>{v?.status === "verified" ? "Checked" : v?.status === "pending" ? "In review" : "Not checked"}</StatusBadge>}
    >
      <div className="flex flex-col">
        <Row title="Email confirmed" detail={v?.checks.email_confirmed ? "Done" : "Open the confirmation email we sent you."} action={v?.checks.email_confirmed ? <Check className="h-5 w-5 text-[color:var(--color-primary)]" strokeWidth={2} aria-label="Done" /> : undefined} />
        <Row
          title="Photo ID"
          detail={gid === "approved" ? "Checked by Migrent" : gid === "pending" ? "We're reviewing it, usually within one working day." : gid === "rejected" ? "We couldn't accept the last one. Please upload a clearer photo of a current ID." : "A passport, driver licence, national ID card or visa grant notice."}
          action={gid === "approved" ? <Check className="h-5 w-5 text-[color:var(--color-primary)]" strokeWidth={2} aria-label="Done" /> : undefined}
        />
      </div>
      {(gid === "not_submitted" || gid === "rejected") && (
        <div className="mt-5 flex flex-col gap-4 rounded-[16px] bg-[var(--color-surface-muted)] p-4 sm:p-5">
          <Field label="Document">
            {({ id }) => (
              <Select id={id} value={docType} onChange={(e) => setDocType(e.target.value)}>
                {ID_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <input
            ref={file}
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            className="sr-only"
            id="id-file"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              if (f.size > 10 * 1024 * 1024) return toast.error("Files can be up to 10MB.");
              setPicked(f);
            }}
          />
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="secondary" icon={<Upload className="h-4 w-4" strokeWidth={1.75} />} onClick={() => file.current?.click()}>
              {picked ? "Choose a different file" : "Choose a photo or PDF"}
            </Button>
            {picked && <span className="truncate text-[13.5px] text-[color:var(--color-ink-2)]">{picked.name}</span>}
          </div>
          {picked && (
            <Button loading={progress !== null} onClick={() => void upload()} className="w-fit">
              {progress !== null ? `Uploading ${Math.round(progress * 100)}%` : "Send for review"}
            </Button>
          )}
          <p className="text-[12.5px] leading-snug text-[color:var(--color-ink-3)]">Stored privately and only seen by the Migrent team member who checks it. {v?.disclaimer}</p>
        </div>
      )}
    </Card>
  );
}

/* ── Reply templates (owners) ───────────────────────────── */

function TemplatesCard() {
  const toast = useToast();
  const confirm = useConfirm();
  const q = useHubQuery<{ templates: Template[] }>("/hub/templates");
  const [editing, setEditing] = useState<{ id?: string; title: string; body: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const mine = q.data?.templates.filter((t) => !t.builtin) ?? [];
  const builtin = q.data?.templates.filter((t) => t.builtin) ?? [];

  async function save() {
    if (!editing) return;
    setBusy(true);
    try {
      if (editing.id) await hubApi.patch(`/hub/templates/${editing.id}`, { title: editing.title.trim(), body: editing.body.trim() });
      else await hubApi.post("/hub/templates", { title: editing.title.trim(), body: editing.body.trim() });
      setEditing(null);
      void q.refetch();
      toast.success("Template saved");
    } catch (e) {
      toast.error(errMsg(e, "The template didn't save."));
    } finally {
      setBusy(false);
    }
  }

  async function remove(t: Template) {
    if (!(await confirm({ title: `Delete "${t.title}"?`, description: "This only removes the template. Messages you've sent aren't affected.", confirmLabel: "Delete", tone: "danger" }))) return;
    try {
      await hubApi.del(`/hub/templates/${t.id}`);
      void q.refetch();
    } catch (e) {
      toast.error(errMsg(e, "That didn't delete."));
    }
  }

  return (
    <Card
      id="templates"
      title="Reply templates"
      description="Saved replies you can drop into any conversation and edit before sending."
      aside={
        <Button variant="secondary" size="sm" icon={<Plus className="h-4 w-4" strokeWidth={1.9} />} onClick={() => setEditing({ title: "", body: "" })}>
          New
        </Button>
      }
    >
      {q.error ? (
        <ErrorState message={q.error.message} onRetry={() => void q.refetch()} />
      ) : !q.data ? (
        <RowSkeleton rows={2} />
      ) : (
        <div className="flex flex-col">
          {mine.map((t) => (
            <Row
              key={t.id}
              title={t.title}
              detail={<span className="line-clamp-2">{t.body}</span>}
              action={
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" icon={<Pencil className="h-4 w-4" strokeWidth={1.75} />} onClick={() => setEditing({ id: t.id, title: t.title, body: t.body })}>
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" icon={<Trash2 className="h-4 w-4" strokeWidth={1.75} />} onClick={() => void remove(t)} aria-label={`Delete ${t.title}`}>
                    Delete
                  </Button>
                </div>
              }
            />
          ))}
          {builtin.map((t) => (
            <Row
              key={t.id}
              title={
                <>
                  {t.title} <span className="ml-1 text-[12.5px] font-medium text-[color:var(--color-ink-4)]">Built in</span>
                </>
              }
              detail={<span className="line-clamp-2">{t.body}</span>}
              action={
                <Button variant="ghost" size="sm" icon={<Copy className="h-4 w-4" strokeWidth={1.75} />} onClick={() => setEditing({ title: `${t.title} (mine)`, body: t.body })}>
                  Make a copy
                </Button>
              }
            />
          ))}
        </div>
      )}
      <Dialog
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id ? "Edit template" : "New template"}
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button loading={busy} disabled={!editing?.title.trim() || !editing?.body.trim()} onClick={() => void save()}>
              Save
            </Button>
          </>
        }
      >
        {editing && (
          <div className="flex flex-col gap-4">
            <Field label="Name" hint="Only you see this.">
              {({ id, describedBy }) => <Input id={id} value={editing.title} maxLength={80} onChange={(e) => setEditing({ ...editing, title: e.target.value })} aria-describedby={describedBy} autoFocus />}
            </Field>
            <Field label="Message" hint={`${editing.body.length}/2000`}>
              {({ id, describedBy }) => <Textarea id={id} rows={6} value={editing.body} maxLength={2000} onChange={(e) => setEditing({ ...editing, body: e.target.value })} aria-describedby={describedBy} />}
            </Field>
          </div>
        )}
      </Dialog>
    </Card>
  );
}

/* ── Email notifications ────────────────────────────────── */

function NotificationsCard({ me }: { me: HubMe }) {
  const toast = useToast();
  const counts = useHubQuery<{ tenancies: number }>("/hub/counts");
  const [pending, setPending] = useState<Record<string, boolean> | null>(null);
  const local = pending ?? me.notification_prefs?.email ?? {};
  const owner = me.role === "owner";
  const hasHome = (counts.data?.tenancies ?? 0) > 0;

  const groups: { key: string; title: string; detail: string }[] = [
    { key: "messages", title: "Messages", detail: "When someone sends you a message." },
    { key: "applications", title: "Applications", detail: owner ? "New applications, and when Migrent finalises one." : "When an owner responds, asks for something, or your application is finalised." },
    { key: "inspections", title: "Inspections", detail: owner ? "Bookings, cancellations and reminders for your open times." : "Confirmations, changes and a reminder the day before." },
    ...(!owner && me.role !== "admin" ? [{ key: "saved_searches", title: "Saved search alerts", detail: "New homes matching a saved search. Choose how often on each search." }] : []),
    ...(owner || hasHome ? [{ key: "maintenance", title: "Maintenance", detail: owner ? "New repair requests and updates." : "Updates on repair requests you've made." }] : []),
    ...(owner ? [{ key: "listings", title: "Listings", detail: "When a listing is approved, needs changes or is about to expire." }] : []),
  ];

  async function toggle(key: string, value: boolean) {
    const next = { ...local, [key]: value };
    setPending(next);
    try {
      const res = await hubApi.patch<HubMe>("/hub/settings", { notification_prefs: { email: next } });
      setQueryData("/hub/me", res);
    } catch (e) {
      toast.error(errMsg(e, "That didn't save."));
    } finally {
      setPending(null);
    }
  }

  return (
    <Card id="notifications" title="Email notifications" description="Everything also appears under Activity in Migrent Hub. Security and account emails are always sent.">
      <div className="flex flex-col">
        {groups.map((g) => (
          <div key={g.key} className="border-t border-[var(--color-line)] py-3.5 first:border-0 first:pt-0 last:pb-0">
            <Switch checked={local[g.key] !== false} onChange={(v) => void toggle(g.key, v)} label={g.title} description={g.detail} />
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ── Security ───────────────────────────────────────────── */

interface Factor {
  id: string;
  friendly_name?: string;
  factor_type: string;
  status: string;
  created_at: string;
}

function TwoStep() {
  const toast = useToast();
  const confirm = useConfirm();
  const [factors, setFactors] = useState<Factor[] | null>(null);
  const [enroll, setEnroll] = useState<{ id: string; qr: string; secret: string } | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [version, setVersion] = useState(0);
  const load = () => setVersion((v) => v + 1);
  useEffect(() => {
    let alive = true;
    supabase.auth.mfa.listFactors().then(({ data, error: err }) => {
      if (alive) setFactors(err ? [] : ((data?.all ?? []) as Factor[]).filter((f) => f.factor_type === "totp"));
    });
    return () => {
      alive = false;
    };
  }, [version]);

  const verified = factors?.filter((f) => f.status === "verified") ?? [];

  async function start() {
    setBusy(true);
    setError(null);
    // Clear out an abandoned, unverified set-up first.
    for (const f of factors ?? []) if (f.status !== "verified") await supabase.auth.mfa.unenroll({ factorId: f.id });
    const { data, error: err } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: `Authenticator ${new Date().toISOString().slice(0, 10)}` });
    setBusy(false);
    if (err || !data) return toast.error(err?.message || "Two-step verification couldn't start.");
    setEnroll({ id: data.id, qr: data.totp.qr_code, secret: data.totp.secret });
    setCode("");
  }

  async function finish() {
    if (!enroll) return;
    setBusy(true);
    setError(null);
    const { error: err } = await supabase.auth.mfa.challengeAndVerify({ factorId: enroll.id, code: code.trim() });
    setBusy(false);
    if (err) return setError("That code didn't match. Codes change every 30 seconds - try the current one.");
    setEnroll(null);
    toast.success("Two-step verification is on");
    load();
  }

  async function remove(f: Factor) {
    if (!(await confirm({ title: "Turn off two-step verification?", description: "You'll sign in with just your password or Google. You can turn it back on at any time.", confirmLabel: "Turn off", tone: "danger" }))) return;
    const { error: err } = await supabase.auth.mfa.unenroll({ factorId: f.id });
    if (err) return toast.error(err.message);
    toast.info("Two-step verification is off");
    load();
  }

  return (
    <>
      <Row
        title={
          <span className="flex items-center gap-2">
            Two-step verification {verified.length > 0 && <StatusBadge tone="info">On</StatusBadge>}
          </span>
        }
        detail={verified.length ? `A code from your authenticator app is needed when you sign in. Added ${day(verified[0].created_at)}.` : "Ask for a code from an authenticator app (like 1Password, Google Authenticator or Authy) when you sign in."}
        action={
          factors === null ? null : verified.length ? (
            <Button variant="ghost" size="sm" onClick={() => void remove(verified[0])}>
              Turn off
            </Button>
          ) : (
            <Button variant="secondary" size="sm" loading={busy && !enroll} icon={<Smartphone className="h-4 w-4" strokeWidth={1.75} />} onClick={() => void start()}>
              Set up
            </Button>
          )
        }
      />
      <Dialog
        open={!!enroll}
        onClose={() => setEnroll(null)}
        title="Set up two-step verification"
        description="Scan the code with your authenticator app, then enter the six-digit code it shows."
        footer={
          <>
            <Button variant="ghost" onClick={() => setEnroll(null)}>
              Cancel
            </Button>
            <Button loading={busy} disabled={!/^\d{6}$/.test(code.trim())} onClick={() => void finish()}>
              Turn on
            </Button>
          </>
        }
      >
        {enroll && (
          <form
            className="flex flex-col items-center gap-5"
            onSubmit={(e) => {
              e.preventDefault();
              if (/^\d{6}$/.test(code.trim())) void finish();
            }}
          >
            <div className="rounded-[16px] bg-white p-3 shadow-[0_0_0_1px_var(--color-line)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={enroll.qr} alt="QR code for your authenticator app" width={184} height={184} />
            </div>
            <details className="w-full text-center text-[13px] text-[color:var(--color-ink-3)]">
              <summary className="cursor-pointer font-semibold text-[color:var(--color-ink-2)]">Can't scan it?</summary>
              <p className="mt-2">Enter this key in your app instead:</p>
              <code className="mt-1 block select-all break-all rounded-[10px] bg-[var(--color-surface-muted)] px-3 py-2 font-mono text-[13px] text-[color:var(--color-ink)]">{enroll.secret}</code>
            </details>
            <Field label="Six-digit code" error={error ?? undefined} className="w-full">
              {({ id, describedBy, invalid }) => (
                <Input id={id} inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} aria-describedby={describedBy} aria-invalid={invalid} className="text-center font-mono text-[20px] tracking-[0.4em]" autoFocus />
              )}
            </Field>
          </form>
        )}
      </Dialog>
    </>
  );
}

function PasswordDialog({ open, onClose, hasPassword }: { open: boolean; onClose: () => void; hasPassword: boolean }) {
  const toast = useToast();
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState(false);
  const tooShort = pw.length > 0 && pw.length < 10;
  const mismatch = pw2.length > 0 && pw !== pw2;

  async function submit() {
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) return toast.error(/reauth/i.test(error.message) ? "For your security, sign out and back in, then change your password." : error.message);
    toast.success(hasPassword ? "Password changed" : "Password set");
    setPw("");
    setPw2("");
    onClose();
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={hasPassword ? "Change password" : "Set a password"}
      description={hasPassword ? undefined : "You sign in with Google now. A password lets you sign in with your email too."}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={busy} disabled={pw.length < 10 || pw !== pw2} onClick={() => void submit()}>
            Save password
          </Button>
        </>
      }
    >
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (pw.length >= 10 && pw === pw2) void submit();
        }}
      >
        <Field label="New password" hint="At least 10 characters." error={tooShort ? "Use at least 10 characters" : undefined}>
          {({ id, describedBy, invalid }) => <Input id={id} type="password" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} aria-describedby={describedBy} aria-invalid={invalid} autoFocus />}
        </Field>
        <Field label="Type it again" error={mismatch ? "The passwords don't match" : undefined}>
          {({ id, describedBy, invalid }) => <Input id={id} type="password" autoComplete="new-password" value={pw2} onChange={(e) => setPw2(e.target.value)} aria-describedby={describedBy} aria-invalid={invalid} />}
        </Field>
      </form>
    </Dialog>
  );
}

function SecurityCard() {
  const toast = useToast();
  const confirm = useConfirm();
  const [pwOpen, setPwOpen] = useState(false);
  const [providers, setProviders] = useState<string[] | null>(null);
  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => {
      const ids = (data.user?.identities ?? []).map((i) => i.provider);
      setProviders(ids.length ? ids : ["email"]);
    });
  }, []);
  const hasPassword = providers?.includes("email") ?? true;

  async function signOutOthers() {
    if (!(await confirm({ title: "Sign out everywhere else?", description: "Other phones and computers will need to sign in again. You'll stay signed in here.", confirmLabel: "Sign out others" }))) return;
    const { error } = await supabase.auth.signOut({ scope: "others" });
    if (error) return toast.error(error.message);
    toast.success("Signed out of your other devices");
  }

  return (
    <Card id="security" title="Sign-in and security">
      <div className="flex flex-col">
        <Row
          title="Password"
          detail={providers === null ? " " : hasPassword ? "Used with your email to sign in." : "You sign in with Google."}
          action={
            <Button variant="ghost" size="sm" icon={<KeyRound className="h-4 w-4" strokeWidth={1.75} />} onClick={() => setPwOpen(true)}>
              {hasPassword ? "Change" : "Set a password"}
            </Button>
          }
        />
        {providers?.includes("google") && <Row title="Google" detail="You can sign in with your Google account." action={<Check className="h-5 w-5 text-[color:var(--color-primary)]" strokeWidth={2} aria-label="Connected" />} />}
        <TwoStep />
        <Row
          title="Other devices"
          detail="Sign out of Migrent on every other phone and computer."
          action={
            <Button variant="ghost" size="sm" icon={<LogOut className="h-4 w-4" strokeWidth={1.75} />} onClick={() => void signOutOthers()}>
              Sign out others
            </Button>
          }
        />
      </div>
      <PasswordDialog open={pwOpen} onClose={() => setPwOpen(false)} hasPassword={hasPassword} />
    </Card>
  );
}

/* ── Privacy and data ───────────────────────────────────── */

function DataCard({ me }: { me: HubMe }) {
  const toast = useToast();
  const { signOut } = useHub();
  const [exporting, setExporting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [deleting, setDeleting] = useState(false);

  async function exportData() {
    setExporting(true);
    try {
      const data = await hubApi.get<unknown>("/profiles/me/export");
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `migrent-data-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      toast.error(errMsg(e, "Your data couldn't be exported."));
    } finally {
      setExporting(false);
    }
  }

  async function deleteAccount() {
    setDeleting(true);
    try {
      await hubApi.del("/account/delete");
      await signOut();
      window.location.href = siteUrl("/?account=deleted");
    } catch (e) {
      toast.error(errMsg(e, "The account couldn't be deleted."));
      setDeleting(false);
    }
  }

  return (
    <Card id="data" title="Privacy and your data">
      <div className="flex flex-col">
        <Row
          title="Download your data"
          detail="Everything Migrent holds about you, as a file."
          action={
            <Button variant="ghost" size="sm" loading={exporting} icon={<Download className="h-4 w-4" strokeWidth={1.75} />} onClick={() => void exportData()}>
              Download
            </Button>
          }
        />
        <Row title="Privacy policy" detail="How Migrent collects, uses and protects your information." action={<ButtonLink to={siteUrl("/privacy-policy")} external variant="ghost" size="sm">Read</ButtonLink>} />
        {!me.is_admin && (
          <Row
            title="Delete your account"
            detail="Removes your profile, listings, applications and messages. This can't be undone."
            action={
              <Button variant="danger" size="sm" icon={<Trash2 className="h-4 w-4" strokeWidth={1.75} />} onClick={() => setDeleteOpen(true)}>
                Delete account
              </Button>
            }
          />
        )}
      </div>
      <Dialog
        open={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
          setTyped("");
        }}
        title="Delete your account?"
        description="Your profile, Rental Profile, documents, listings, applications, saved homes and messages are permanently removed. If you have a tenancy or an application in progress, finish those first."
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteOpen(false)}>
              Keep my account
            </Button>
            <Button variant="danger" loading={deleting} disabled={typed.trim().toUpperCase() !== "DELETE"} onClick={() => void deleteAccount()}>
              Delete permanently
            </Button>
          </>
        }
      >
        <InlineAlert tone="warning" className="mb-4">
          Download your data first if you want a copy.
        </InlineAlert>
        <Field label='Type "DELETE" to confirm'>
          {({ id }) => <Input id={id} value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" />}
        </Field>
      </Dialog>
    </Card>
  );
}

/* ── Page ───────────────────────────────────────────────── */

export default function SettingsPage() {
  const { me, role } = useHub();
  const [active, setActive] = useState("profile");

  const sections = [
    { id: "profile", label: "Profile" },
    ...(role !== "admin" ? [{ id: "account-type", label: "Account type" }] : []),
    ...(role === "owner" ? [{ id: "verification", label: "ID check" }, { id: "templates", label: "Reply templates" }] : []),
    { id: "notifications", label: "Email notifications" },
    { id: "appearance", label: "Appearance" },
    { id: "security", label: "Sign-in and security" },
    { id: "data", label: "Privacy and data" },
  ];

  useEffect(() => {
    const els = sections.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        const top = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (top) setActive(top.target.id);
      },
      { rootMargin: "-15% 0px -70% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [role]); // eslint-disable-line react-hooks/exhaustive-deps

  // Deep links (#templates, #notifications) land after the page renders.
  useEffect(() => {
    if (!me) return;
    const hash = window.location.hash.slice(1);
    if (hash) window.setTimeout(() => document.getElementById(hash)?.scrollIntoView({ block: "start" }), 50);
  }, [!!me]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <HubShell title="Settings">
      <PageHeader title="Settings" description={me?.viewing_as ? "You're viewing someone else's account. Nothing here can be changed." : undefined} />
      {me && (
        <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)] xl:gap-12">
          <nav aria-label="Settings sections" className="hidden lg:sticky lg:top-10 lg:block lg:self-start">
            <ol className="flex flex-col gap-0.5">
              {sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    aria-current={active === s.id ? "location" : undefined}
                    className={cn(
                      "flex h-10 items-center rounded-[10px] px-3 text-[14px] font-medium transition-colors",
                      active === s.id ? "bg-[var(--color-surface)] text-[color:var(--color-ink)] shadow-[0_0_0_1px_var(--color-line)]" : "text-[color:var(--color-ink-2)] hover:bg-[var(--color-surface-hover)]",
                    )}
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
          <div className="flex min-w-0 flex-col gap-6">
            <ProfileCard key={me.name} me={me} />
            {role !== "admin" && <AccountTypeCard me={me} />}
            {role === "owner" && <VerificationCard me={me} />}
            {role === "owner" && <TemplatesCard />}
            <NotificationsCard me={me} />
            <Card id="appearance" title="Appearance" description="Migrent Hub follows your device unless you choose. The public site has its own setting.">
              <ThemeSegmented />
            </Card>
            <SecurityCard />
            <DataCard me={me} />
          </div>
        </div>
      )}
    </HubShell>
  );
}

