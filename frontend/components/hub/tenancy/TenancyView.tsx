import { useState } from "react";
import { CalendarDays, ChevronRight, CircleDollarSign, Info, KeyRound, MessageCircle, Pencil, Plus, Receipt, Wrench } from "lucide-react";
import HubLink from "../HubLink";
import { Button, ButtonLink } from "../ui/Button";
import { EmptyState, StatusBadge } from "../ui/Feedback";
import { Field, Input, Select, Textarea } from "../ui/Field";
import { Fact, Panel, Section } from "../ui/Layout";
import { Avatar, HomeImage } from "../ui/Media";
import { Dialog } from "../ui/Overlay";
import { useConfirm } from "../../ui/ConfirmDialog";
import { useToast } from "../../ui/Toast";
import MaintenanceForm, { EmergencyPanel } from "./MaintenanceForm";
import { hubApi, HubError } from "../../../lib/hub/api";
import { aud, day, relative } from "../../../lib/hub/format";
import { invalidate } from "../../../lib/hub/query";
import { MAINTENANCE_STATUS, URGENCY } from "../../../lib/hub/status";
import type { RentPayment, TenancyDetail } from "../../../lib/hub/types";
import { cn } from "../../../lib/cn";
import PendingReviews from "../reviews/PendingReviews";

const FREQ: Record<string, string> = { weekly: "weekly", fortnightly: "fortnightly", monthly: "monthly" };
const TENANCY_STATUS: Record<string, { label: string; tone: "info" | "success" | "neutral" | "warning" }> = {
  upcoming: { label: "Starting soon", tone: "info" },
  active: { label: "Current", tone: "success" },
  ended: { label: "Ended", tone: "neutral" },
  cancelled: { label: "Cancelled", tone: "neutral" },
};
const PAYMENT_STATUS: Record<RentPayment["status"], { label: string; tone: "info" | "success" | "neutral" | "warning" }> = {
  due: { label: "Due", tone: "neutral" },
  paid: { label: "Received", tone: "success" },
  partial: { label: "Part received", tone: "warning" },
  waived: { label: "Waived", tone: "neutral" },
};
const METHODS = [
  { value: "bank_transfer", label: "Bank transfer" },
  { value: "cash", label: "Cash" },
  { value: "other", label: "Other" },
];

function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/* ── Record a payment (owner) ───────────────────────────── */

function PaymentDialog({ payment, tenancyId, onClose, onSaved }: { payment: RentPayment | null; tenancyId: string; onClose: () => void; onSaved: () => void }) {
  const toast = useToast();
  const [status, setStatus] = useState<RentPayment["status"]>("paid");
  const [amount, setAmount] = useState("");
  const [paidOn, setPaidOn] = useState(todayIso());
  const [method, setMethod] = useState("bank_transfer");
  const [reference, setReference] = useState("");
  const [busy, setBusy] = useState(false);
  const [shownFor, setShownFor] = useState<string | null>(null);

  // Fresh form each time a different payment is opened.
  if (payment && shownFor !== payment.id) {
    setShownFor(payment.id);
    setStatus(payment.status === "due" ? "paid" : payment.status);
    setAmount(String(payment.amount_paid || payment.amount_due));
    setPaidOn(payment.paid_on || todayIso());
    setMethod(payment.method || "bank_transfer");
    setReference(payment.reference || "");
  }

  async function save() {
    if (!payment) return;
    setBusy(true);
    try {
      await hubApi.post(`/hub/tenancies/${tenancyId}/payments/${payment.id}`, {
        status,
        amount_paid: status === "paid" || status === "partial" ? Number(amount) : undefined,
        paid_on: status === "paid" || status === "partial" ? paidOn : undefined,
        method: status === "paid" || status === "partial" ? method : undefined,
        reference: reference.trim() || undefined,
      });
      onSaved();
      onClose();
      toast.success("Rent record updated");
    } catch (e) {
      toast.error(e instanceof HubError ? e.message : "That didn't save.");
    } finally {
      setBusy(false);
    }
  }

  const received = status === "paid" || status === "partial";
  const amountOk = !received || (Number(amount) > 0 && Number.isFinite(Number(amount)));

  return (
    <Dialog
      open={!!payment}
      onClose={onClose}
      title={payment ? `Rent due ${day(payment.due_date, { weekday: true })}` : "Rent"}
      description={payment ? `${aud(payment.amount_due, { cents: true })} due. This is your record only - Migrent doesn't move money.` : undefined}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={busy} disabled={!amountOk} onClick={() => void save()}>
            Save
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Field label="Status">
          {({ id }) => (
            <Select id={id} value={status} onChange={(e) => setStatus(e.target.value as RentPayment["status"])}>
              <option value="paid">Received in full</option>
              <option value="partial">Part received</option>
              <option value="waived">Waived</option>
              <option value="due">Not received yet</option>
            </Select>
          )}
        </Field>
        {received && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Amount received" error={!amountOk ? "Enter the amount" : undefined}>
              {({ id, describedBy, invalid }) => <Input id={id} inputMode="decimal" prefix="$" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))} aria-describedby={describedBy} aria-invalid={invalid} />}
            </Field>
            <Field label="Received on">
              {({ id }) => <Input id={id} type="date" value={paidOn} max={todayIso()} onChange={(e) => setPaidOn(e.target.value)} />}
            </Field>
            <Field label="How">
              {({ id }) => (
                <Select id={id} value={method} onChange={(e) => setMethod(e.target.value)}>
                  {METHODS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
            <Field label="Reference" optional>
              {({ id }) => <Input id={id} value={reference} maxLength={120} onChange={(e) => setReference(e.target.value)} />}
            </Field>
          </div>
        )}
      </div>
    </Dialog>
  );
}

/* ── Edit / end (owner) ─────────────────────────────────── */

function EditTenancyDialog({ d, open, onClose, onSaved }: { d: TenancyDetail; open: boolean; onClose: () => void; onSaved: () => void }) {
  const toast = useToast();
  const t = d.tenancy;
  const [form, setForm] = useState({ start_date: t.start_date, end_date: t.end_date ?? "", rent_amount: String(t.rent_amount), rent_frequency: t.rent_frequency, bond_amount: t.bond_amount != null ? String(t.bond_amount) : "", notes: t.notes ?? "" });
  const [busy, setBusy] = useState(false);
  const endBad = form.end_date && form.end_date <= form.start_date;

  async function save() {
    setBusy(true);
    try {
      await hubApi.patch(`/hub/tenancies/${t.id}`, {
        start_date: form.start_date,
        end_date: form.end_date || null,
        rent_amount: Number(form.rent_amount),
        rent_frequency: form.rent_frequency,
        bond_amount: form.bond_amount ? Number(form.bond_amount) : null,
        notes: form.notes.trim() || null,
      });
      onSaved();
      onClose();
      toast.success("Tenancy updated");
    } catch (e) {
      toast.error(e instanceof HubError ? e.message : "That didn't save.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Tenancy details"
      description="What you agreed in the lease. The renter sees these details."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={busy} disabled={!!endBad || !(Number(form.rent_amount) > 0)} onClick={() => void save()}>
            Save
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Starts">{({ id }) => <Input id={id} type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />}</Field>
        <Field label="Ends" optional hint="Leave empty for a periodic lease." error={endBad ? "Must be after the start" : undefined}>
          {({ id, describedBy, invalid }) => <Input id={id} type="date" value={form.end_date} min={form.start_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} aria-describedby={describedBy} aria-invalid={invalid} />}
        </Field>
        <Field label="Rent a week">{({ id }) => <Input id={id} inputMode="decimal" prefix="$" value={form.rent_amount} onChange={(e) => setForm({ ...form, rent_amount: e.target.value.replace(/[^\d.]/g, "") })} />}</Field>
        <Field label="Paid">
          {({ id }) => (
            <Select id={id} value={form.rent_frequency} onChange={(e) => setForm({ ...form, rent_frequency: e.target.value as typeof form.rent_frequency })}>
              <option value="weekly">Weekly</option>
              <option value="fortnightly">Fortnightly</option>
              <option value="monthly">Monthly</option>
            </Select>
          )}
        </Field>
        <Field label="Bond" optional hint="Lodged with your state's bond authority, not Migrent.">
          {({ id, describedBy }) => <Input id={id} inputMode="decimal" prefix="$" value={form.bond_amount} onChange={(e) => setForm({ ...form, bond_amount: e.target.value.replace(/[^\d.]/g, "") })} aria-describedby={describedBy} />}
        </Field>
        <div className="sm:col-span-2">
          <Field label="Notes" optional hint="Visible to you and the renter.">
            {({ id, describedBy }) => <Textarea id={id} rows={3} value={form.notes} maxLength={2000} onChange={(e) => setForm({ ...form, notes: e.target.value })} aria-describedby={describedBy} />}
          </Field>
        </div>
      </div>
    </Dialog>
  );
}

/* ── View ───────────────────────────────────────────────── */

export default function TenancyView({ d, refetch }: { d: TenancyDetail; refetch: () => void }) {
  const toast = useToast();
  const confirm = useConfirm();
  const [repairOpen, setRepairOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [paying, setPaying] = useState<RentPayment | null>(null);
  const [scheduling, setScheduling] = useState(false);
  const [showAllPayments, setShowAllPayments] = useState(false);
  const t = d.tenancy;
  const l = d.listing;
  const owner = d.viewer === "owner";
  const other = owner ? d.renter : d.owner;
  const live = t.status === "active" || t.status === "upcoming";
  const st = TENANCY_STATUS[t.status] ?? TENANCY_STATUS.active;

  const refresh = () => {
    invalidate(`/hub/tenancies/${t.id}`);
    invalidate("/hub/tenancies");
    invalidate("/hub/home");
    refetch();
  };

  async function buildSchedule() {
    setScheduling(true);
    try {
      const res = await hubApi.post<{ added: number }>(`/hub/tenancies/${t.id}/schedule`, {});
      refresh();
      toast.success(res.added ? `${res.added} rent dates added` : "The schedule is already up to date");
    } catch (e) {
      toast.error(e instanceof HubError ? e.message : "The schedule couldn't be set up.");
    } finally {
      setScheduling(false);
    }
  }

  async function endTenancy() {
    const upcoming = t.status === "upcoming";
    const ok = await confirm({
      title: upcoming ? "Cancel this tenancy?" : "End this tenancy?",
      description: upcoming
        ? "Use this if the renter won't be moving in. The home shows as vacant again."
        : `The home shows as vacant again and ${d.renter?.name?.split(" ")[0] ?? "the renter"} can no longer request repairs. The rent record is kept.`,
      confirmLabel: upcoming ? "Cancel tenancy" : "End tenancy",
      tone: "danger",
    });
    if (!ok) return;
    try {
      const today = todayIso();
      await hubApi.patch(`/hub/tenancies/${t.id}`, upcoming ? { status: "cancelled" } : { status: "ended", ...(!t.end_date || t.end_date > today ? { end_date: today > t.start_date ? today : undefined } : {}) });
      refresh();
      toast.success(upcoming ? "Tenancy cancelled" : "Tenancy ended");
    } catch (e) {
      toast.error(e instanceof HubError ? e.message : "That didn't go through.");
    }
  }

  const payments = d.payments;
  const today = todayIso();
  const upcomingPayments = payments.filter((p) => p.due_date >= today || p.status === "due" || p.status === "partial");
  const visiblePayments = showAllPayments ? payments : [...payments.filter((p) => p.due_date < today && (p.status === "paid" || p.status === "waived")).slice(-3), ...upcomingPayments.slice(0, 6)];
  // "Next" is the first unpaid date from today on. Anything earlier and
  // still unpaid is overdue and called out on its own, never as "next".
  const overdue = payments.filter((p) => p.due_date < today && (p.status === "due" || p.status === "partial"));
  const next = payments.find((p) => p.due_date >= today && (p.status === "due" || p.status === "partial")) ?? null;
  const openRepairs = d.maintenance.filter((m) => m.status !== "resolved" && m.status !== "closed");

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="flex min-w-0 flex-col gap-10">
        {/* The home */}
        <Panel padded={false} className="overflow-hidden">
          <div className="flex flex-col sm:flex-row">
            <HomeImage src={l?.image ?? null} alt="" className="aspect-[16/10] w-full sm:aspect-auto sm:h-auto sm:w-[260px]" rounded="rounded-none" sizes="(max-width: 640px) 100vw, 260px" />
            <div className="flex flex-1 flex-col gap-4 p-5 sm:p-6">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge tone={st.tone}>{st.label}</StatusBadge>
                {l?.unit_label && <span className="text-[13px] font-semibold text-[color:var(--color-ink-3)]">{l.unit_label}</span>}
              </div>
              <div>
                <h2 className="text-[21px] font-semibold tracking-[-0.015em] text-[color:var(--color-ink)]">{l?.title ?? "Your home"}</h2>
                <p className="mt-1 text-[14px] text-[color:var(--color-ink-2)]">{l?.street_address || l?.display_address}</p>
              </div>
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Fact icon={<CalendarDays className="h-4 w-4" strokeWidth={1.75} />} label="Lease" value={`${day(t.start_date)} - ${t.end_date ? day(t.end_date) : "ongoing"}`} />
                <Fact icon={<CircleDollarSign className="h-4 w-4" strokeWidth={1.75} />} label="Rent" value={`${aud(t.rent_amount)} a week, paid ${FREQ[t.rent_frequency]}`} />
                {t.bond_amount != null && <Fact icon={<KeyRound className="h-4 w-4" strokeWidth={1.75} />} label="Bond" value={aud(t.bond_amount)} />}
              </dl>
              {t.notes && <p className="rounded-[12px] bg-[var(--color-surface-muted)] px-3.5 py-2.5 text-[13.5px] leading-relaxed text-[color:var(--color-ink-2)]">{t.notes}</p>}
            </div>
          </div>
        </Panel>

        <PendingReviews only={t.id} title="Review this tenancy" />

        {/* Rent */}
        <Section
          title="Rent"
          description={d.payments_note}
          action={
            owner && live ? (
              <Button variant="secondary" size="sm" loading={scheduling} icon={<CalendarDays className="h-4 w-4" strokeWidth={1.75} />} onClick={() => void buildSchedule()}>
                {payments.length ? "Extend schedule" : "Set up rent dates"}
              </Button>
            ) : undefined
          }
        >
          {payments.length === 0 ? (
            <EmptyState
              compact
              icon={<Receipt className="h-6 w-6" strokeWidth={1.75} />}
              title={owner ? "No rent dates yet" : "No rent record yet"}
              body={owner ? "Set up the rent dates from the lease, then tick off each payment as it arrives." : "When the owner sets up the rent dates, you'll see what's due and what they've recorded as received."}
            />
          ) : (
            <div className="flex flex-col gap-4">
              {overdue.length > 0 && (
                <p className="rounded-[12px] bg-[color:color-mix(in_oklab,var(--color-warn-500)_12%,var(--color-surface))] px-4 py-3 text-[13.5px] text-[color:var(--color-ink)]">
                  {overdue.length} rent date{overdue.length === 1 ? " has" : "s have"} passed without a payment recorded{owner ? ". Record it once it arrives, or waive it." : ". If you've paid, let the owner know so they can record it."}
                </p>
              )}
              <div className="overflow-x-auto rounded-[18px] border border-[var(--color-line)]">
                <table className="w-full min-w-[300px] text-left text-[14px]">
                  <caption className="sr-only">Rent record</caption>
                  <thead className="bg-[var(--color-surface-muted)] text-[12.5px] font-semibold text-[color:var(--color-ink-3)]">
                    <tr>
                      <th scope="col" className="px-4 py-2.5">
                        Due
                      </th>
                      <th scope="col" className="px-4 py-2.5 text-right">
                        Amount
                      </th>
                      <th scope="col" className="hidden px-4 py-2.5 sm:table-cell">
                        Received
                      </th>
                      <th scope="col" className="px-4 py-2.5">
                        Status
                      </th>
                      {owner && (
                        <th scope="col" className="px-2 py-2.5">
                          <span className="sr-only">Actions</span>
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-line)] bg-[var(--color-surface)]">
                    {visiblePayments.map((p) => {
                      const ps = PAYMENT_STATUS[p.status];
                      const late = p.due_date < today && (p.status === "due" || p.status === "partial");
                      return (
                        <tr key={p.id} className={cn(next?.id === p.id && "bg-[var(--color-primary-soft)]/40")}>
                          <td className="px-4 py-3 text-[color:var(--color-ink)]">
                            {day(p.due_date, { weekday: true, year: false })}
                            {next?.id === p.id && <span className="ml-2 text-[12px] font-semibold text-[color:var(--color-primary)]">Next</span>}
                          </td>
                          <td className="px-4 py-3 text-right tabular-nums text-[color:var(--color-ink)]">{aud(p.amount_due, { cents: true })}</td>
                          <td className="hidden px-4 py-3 text-[color:var(--color-ink-2)] sm:table-cell">{p.amount_paid ? `${aud(p.amount_paid, { cents: true })}${p.paid_on ? ` on ${day(p.paid_on, { year: false })}` : ""}` : "-"}</td>
                          <td className="px-4 py-3">
                            <StatusBadge tone={late ? "warning" : ps.tone} icon={false}>
                              {late && p.status === "due" ? "Not recorded" : ps.label}
                            </StatusBadge>
                          </td>
                          {owner && (
                            <td className="px-2 py-3 text-right">
                              {!p.provider && (
                                <Button variant="ghost" size="sm" onClick={() => setPaying(p)} aria-label={`Record rent due ${day(p.due_date)}`}>
                                  Record
                                </Button>
                              )}
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 text-[13.5px] text-[color:var(--color-ink-3)]">
                <span>Recorded as received so far: {aud(d.ledger.recorded_paid, { cents: true })}</span>
                {payments.length > visiblePayments.length || showAllPayments ? (
                  <button type="button" onClick={() => setShowAllPayments((v) => !v)} className="font-semibold text-[color:var(--color-primary)] hover:underline">
                    {showAllPayments ? "Show fewer" : `Show all ${payments.length}`}
                  </button>
                ) : null}
              </div>
            </div>
          )}
        </Section>

        {/* Repairs */}
        <Section
          title="Repairs"
          action={
            !owner && live ? (
              <Button size="sm" icon={<Plus className="h-4 w-4" strokeWidth={1.9} />} onClick={() => setRepairOpen(true)}>
                Request a repair
              </Button>
            ) : undefined
          }
        >
          {d.maintenance.length === 0 ? (
            <EmptyState compact icon={<Wrench className="h-6 w-6" strokeWidth={1.75} />} title="No repair requests" body={owner ? "When the renter reports something, it appears here and you'll get an email." : "Something broken? Request a repair and the owner is notified straight away."} />
          ) : (
            <ul className="flex flex-col overflow-hidden rounded-[18px] border border-[var(--color-line)] bg-[var(--color-surface)]">
              {d.maintenance.map((m) => (
                <li key={m.id} className="border-t border-[var(--color-line)] first:border-0">
                  <HubLink to={`/maintenance/${m.id}`} className="flex items-center gap-4 px-4 py-3.5 hover:bg-[var(--color-surface-hover)] sm:px-5">
                    <span aria-hidden className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[var(--color-surface-muted)] text-[color:var(--color-ink-2)]">
                      <Wrench className="h-[18px] w-[18px]" strokeWidth={1.75} />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-[14.5px] font-semibold text-[color:var(--color-ink)]">{m.title}</span>
                      <span className="text-[12.5px] text-[color:var(--color-ink-3)]">Reported {relative(m.created_at)}</span>
                    </span>
                    {m.urgency !== "routine" && (
                      <span className="hidden sm:block">
                        <StatusBadge tone={URGENCY[m.urgency].tone} icon={false}>
                          {URGENCY[m.urgency].label}
                        </StatusBadge>
                      </span>
                    )}
                    <StatusBadge tone={MAINTENANCE_STATUS[m.status].tone} icon={false}>
                      {MAINTENANCE_STATUS[m.status].label}
                    </StatusBadge>
                    <ChevronRight className="h-4 w-4 shrink-0 text-[color:var(--color-ink-4)]" strokeWidth={2} aria-hidden />
                  </HubLink>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>

      {/* Side */}
      <aside className="flex flex-col gap-5 lg:sticky lg:top-10 lg:self-start">
        {other && (
          <Panel className="flex flex-col gap-4">
            <p className="text-[12.5px] font-semibold uppercase tracking-[0.08em] text-[color:var(--color-ink-3)]">{owner ? "Renter" : "Owner"}</p>
            <div className="flex items-center gap-3">
              <Avatar name={other.name} src={other.avatar_url} size={48} />
              <p className="text-[16px] font-semibold text-[color:var(--color-ink)]">{other.name}</p>
            </div>
            {l && (
              <ButtonLink to={`/messages/${l.id}_${other.id}`} variant="secondary" block icon={<MessageCircle className="h-4 w-4" strokeWidth={1.75} />}>
                Message {other.name.split(" ")[0]}
              </ButtonLink>
            )}
          </Panel>
        )}
        {next && live && (
          <Panel className="flex flex-col gap-1">
            <p className="text-[13px] font-medium text-[color:var(--color-ink-3)]">Next rent</p>
            <p className="text-[22px] font-semibold tabular-nums tracking-[-0.01em] text-[color:var(--color-ink)]">{aud(next.amount_due - (next.amount_paid || 0), { cents: true })}</p>
            <p className="text-[14px] text-[color:var(--color-ink-2)]">Due {day(next.due_date, { weekday: true })}</p>
          </Panel>
        )}
        {!owner && live && openRepairs.length === 0 && <EmergencyPanel g={d.emergency} />}
        {owner && live && (
          <Panel className="flex flex-col gap-2">
            <Button variant="secondary" icon={<Pencil className="h-4 w-4" strokeWidth={1.75} />} onClick={() => setEditOpen(true)} block>
              Edit tenancy details
            </Button>
            <Button variant="ghost" onClick={() => void endTenancy()} block>
              {t.status === "upcoming" ? "Cancel tenancy" : "End tenancy"}
            </Button>
          </Panel>
        )}
        {t.application_id && (
          <HubLink to={`/applications/${t.application_id}`} className="flex items-center gap-2 px-1 text-[13.5px] font-semibold text-[color:var(--color-primary)] hover:underline">
            <Info className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            The application this came from
          </HubLink>
        )}
      </aside>

      {!owner && <MaintenanceForm open={repairOpen} onClose={() => setRepairOpen(false)} tenancyId={t.id} emergency={d.emergency} />}
      {owner && <PaymentDialog payment={paying} tenancyId={t.id} onClose={() => setPaying(null)} onSaved={refresh} />}
      {owner && editOpen && <EditTenancyDialog d={d} open={editOpen} onClose={() => setEditOpen(false)} onSaved={refresh} />}
    </div>
  );
}
