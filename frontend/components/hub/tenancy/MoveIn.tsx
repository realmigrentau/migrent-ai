import { useState, type ReactNode } from "react";
import { CheckCircle2, CreditCard, KeyRound, Landmark, Printer, ShieldCheck } from "lucide-react";
import { Button, ButtonLink } from "../ui/Button";
import { InlineAlert, StatusBadge } from "../ui/Feedback";
import { Fact, Panel } from "../ui/Layout";
import { useToast } from "../../ui/Toast";
import { hubApi, HubError } from "../../../lib/hub/api";
import { aud, day, relative } from "../../../lib/hub/format";
import { invalidate, useHubQuery } from "../../../lib/hub/query";
import { siteUrl } from "../../../lib/hub/routes";

/**
 * Move-in payments (backend/move_in.py). The renter pays the rent in
 * advance by card; Stripe sends it straight to the owner. When Stripe
 * confirms it, both sides get a green light and a receipt with a
 * 10-character security code, which Migrent's own receipt carries too.
 * The bond is never paid here.
 */

export interface MoveInPayment {
  id?: string;
  status: "not_started" | "pending" | "paid" | "refunded" | "cancelled";
  weeks?: number;
  amount?: number;
  card_fee?: number;
  to_owner?: number;
  paid_at?: string | null;
  green_light?: boolean;
  owner_confirmed_at?: string | null;
  renter_confirmed_at?: string | null;
  complete?: boolean;
  receipt_code?: string | null;
  fee_status?: "not_yet" | "not_due" | "charged" | "failed";
  fee?: number | null;
  fee_error?: string | null;
}

export interface OwnerSetup {
  enabled: boolean;
  payouts_ready?: boolean;
  payouts_started?: boolean;
  card_saved?: boolean;
  card_label?: string | null;
  fee?: number;
}

interface MoveInState {
  enabled: boolean;
  viewer?: "renter" | "owner";
  owner_ready?: boolean;
  quote?: { weeks: number; weekly: number; rent: number; card_fee: number; amount: number };
  payment?: MoveInPayment;
  owner_setup?: OwnerSetup | null;
}

export interface Receipt {
  role: "renter" | "owner" | "admin";
  receipt_code: string | null;
  issued_at: string | null;
  payment: { amount: number; weeks: number; weekly_rent: number; card_fee: number; to_owner: number; currency: string; paid_at: string | null; reference: string | null; status: string };
  tenancy: { start_date: string | null; end_date: string | null; rent_amount: number | null; rent_frequency: string | null };
  property: { title: string | null; address: string | null; unit_label: string | null };
  owner?: { name: string; email: string | null; phone: string | null; member_since: string | null; id_checked?: boolean };
  renter?: { name: string; email: string | null; phone: string | null; member_since: string | null };
  fee?: { status: string; amount: number | null; charged_at: string | null; reference?: string | null; error?: string | null };
  bond_note?: string;
  owner_confirmed_at?: string | null;
  renter_confirmed_at?: string | null;
  complete?: boolean;
  stripe?: { session: string | null; payment_intent: string | null };
}

const weeksText = (n?: number) => `${n ?? 1} week${n === 1 ? "" : "s"}`;

/** The code, large and spaced, as it is read aloud at the front door. */
export function SecurityCode({ code, note }: { code: string; note?: ReactNode }) {
  return (
    <div className="rounded-[16px] border-2 border-dashed border-[var(--color-primary)] px-4 py-4 text-center" data-testid="security-code">
      <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[color:var(--color-ink-3)]">Security code</p>
      <p className="mt-1 font-mono text-[26px] font-bold tracking-[0.28em] text-[color:var(--color-ink)]">{code}</p>
      <p className="mt-1 text-[13px] text-[color:var(--color-ink-2)]">{note ?? "The renter, the owner and Migrent have the same code. Check it matches when you meet."}</p>
    </div>
  );
}

function FeeLine({ p, tenancyId, onDone }: { p: MoveInPayment; tenancyId: string; onDone: () => void }) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  if (p.fee_status === "not_due") return <p className="text-[13.5px] text-[color:var(--color-ink-2)]">No Migrent fee: you've had this renter through Migrent before.</p>;
  if (p.fee_status === "charged") return <p className="text-[13.5px] text-[color:var(--color-ink-2)]">Migrent's {aud(p.fee ?? 99)} fee for a new renter was charged to your saved card.</p>;
  if (p.fee_status !== "failed") return null;
  return (
    <InlineAlert
      tone="warning"
      title="Migrent's fee didn't go through"
      action={
        <div className="flex flex-wrap gap-2">
          <ButtonLink to="/settings#payouts" size="sm" variant="secondary">
            Update card
          </ButtonLink>
          <Button
            size="sm"
            loading={busy}
            onClick={async () => {
              setBusy(true);
              try {
                const r = await hubApi.post<{ payment: MoveInPayment }>(`/hub/tenancies/${tenancyId}/move-in/fee`, {});
                if (r.payment.fee_status === "charged") toast.success("Fee paid. Thank you.");
                else toast.warning("The card was declined again", { description: r.payment.fee_error ?? undefined });
                onDone();
              } catch (e) {
                toast.error(e instanceof HubError ? e.message : "That didn't go through.");
              } finally {
                setBusy(false);
              }
            }}
          >
            Try again
          </Button>
        </div>
      }
    >
      {p.fee_error ? `${p.fee_error}. ` : ""}Update your card or try again.
    </InlineAlert>
  );
}

/** On the tenancy page, for the renter and the owner. */
export function MoveInPanel({ tenancyId }: { tenancyId: string }) {
  const toast = useToast();
  const key = `/hub/tenancies/${tenancyId}/move-in`;
  const { data, refetch } = useHubQuery<MoveInState>(key);
  const [busy, setBusy] = useState(false);
  if (!data?.enabled || !data.payment) return null;
  const p = data.payment;
  const renter = data.viewer === "renter";
  const refresh = () => {
    invalidate(key);
    invalidate(`/hub/tenancies/${tenancyId}`);
    void refetch();
  };

  async function pay() {
    setBusy(true);
    try {
      const r = await hubApi.post<{ url: string }>(`/hub/tenancies/${tenancyId}/move-in/checkout`, {});
      window.location.assign(r.url);
    } catch (e) {
      toast.error(e instanceof HubError ? e.message : "The payment page didn't open.");
      setBusy(false);
    }
  }

  async function confirmIt() {
    setBusy(true);
    try {
      await hubApi.post(`/hub/tenancies/${tenancyId}/move-in/confirm`, {});
      toast.success(renter ? "Thanks. Enjoy your new home." : "Thanks for confirming.");
      refresh();
    } catch (e) {
      toast.error(e instanceof HubError ? e.message : "That didn't save.");
    } finally {
      setBusy(false);
    }
  }

  const bond = (
    <p className="flex gap-2 text-[13.5px] leading-relaxed text-[color:var(--color-ink-2)]">
      <Landmark className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--color-ink-3)]" strokeWidth={1.75} aria-hidden />
      <span>
        The bond is not paid through Migrent. It goes to your state&apos;s bond authority, which holds it until you move out.{" "}
        <a href={siteUrl("/guides/getting-your-bond-back")} className="font-semibold text-[color:var(--color-primary)] hover:underline">
          How bonds work
        </a>
      </span>
    </p>
  );

  // The green light.
  if (p.status === "paid" && p.green_light) {
    const mine = renter ? p.renter_confirmed_at : p.owner_confirmed_at;
    const theirs = renter ? p.owner_confirmed_at : p.renter_confirmed_at;
    return (
      <div data-testid="move-in-green-light">
      <Panel className="flex flex-col gap-4 border-[color:var(--color-success-500,#16a34a)]">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-success-50,#e8f7ee)] text-[color:var(--color-success-600,#15803d)]">
            <CheckCircle2 className="h-6 w-6" strokeWidth={2} aria-hidden />
          </span>
          <div>
            <p className="text-[17px] font-semibold text-[color:var(--color-ink)]">{renter ? "Payment sent to the owner" : "Your renter's payment is on its way"}</p>
            <p className="mt-1 text-[14px] text-[color:var(--color-ink-2)]">
              {aud(p.to_owner, { cents: true })} rent in advance ({weeksText(p.weeks)}), paid {relative(p.paid_at)}.{" "}
              {renter ? `It went straight to the owner's account. You paid ${aud(p.amount, { cents: true })} including the ${aud(p.card_fee, { cents: true })} card fee.` : "The full rent goes to your Stripe account; the renter paid the card fee."}
            </p>
          </div>
        </div>
        {p.receipt_code && <SecurityCode code={p.receipt_code} />}
        {!renter && <FeeLine p={p} tenancyId={tenancyId} onDone={refresh} />}
        <div className="flex flex-wrap items-center gap-2">
          {!mine ? (
            <Button loading={busy} icon={renter ? <KeyRound className="h-4 w-4" strokeWidth={1.75} /> : <ShieldCheck className="h-4 w-4" strokeWidth={1.75} />} onClick={() => void confirmIt()}>
              {renter ? "I've moved in and have the keys" : "I've received the payment"}
            </Button>
          ) : (
            <StatusBadge tone="success">{renter ? "You confirmed you moved in" : "You confirmed the payment arrived"}</StatusBadge>
          )}
          <StatusBadge tone={theirs ? "success" : "neutral"} icon={false}>
            {renter ? (theirs ? "Owner confirmed the payment" : "Waiting for the owner to confirm") : theirs ? "Renter confirmed they moved in" : "Waiting for the renter to confirm"}
          </StatusBadge>
          <ButtonLink to={`/tenancies/${tenancyId}/receipt`} variant="secondary" icon={<Printer className="h-4 w-4" strokeWidth={1.75} />}>
            Receipt
          </ButtonLink>
        </div>
        {renter && bond}
      </Panel>
      </div>
    );
  }

  if (p.status === "refunded") {
    return (
      <InlineAlert tone="info" title="The move-in payment was refunded">
        The money went back to the card it came from.
      </InlineAlert>
    );
  }

  // Not paid yet.
  if (renter) {
    return (
      <div data-testid="move-in-pay">
      <Panel className="flex flex-col gap-4">
        <div>
          <p className="text-[17px] font-semibold text-[color:var(--color-ink)]">Pay your rent in advance</p>
          <p className="mt-1 text-[14px] text-[color:var(--color-ink-2)]">
            {weeksText(data.quote?.weeks)} at {aud(data.quote?.weekly)} a week. You pay by card and it goes straight to the owner. You both get a receipt with a security code.
          </p>
        </div>
        <dl className="m-0 max-w-[360px] text-[14px]" data-testid="move-in-quote">
          <div className="flex justify-between py-1">
            <dt className="text-[color:var(--color-ink-2)]">Rent in advance</dt>
            <dd className="m-0">{aud(data.quote?.rent, { cents: true })}</dd>
          </div>
          <div className="flex justify-between py-1">
            <dt className="text-[color:var(--color-ink-2)]">Card fee</dt>
            <dd className="m-0">{aud(data.quote?.card_fee, { cents: true })}</dd>
          </div>
          <div className="flex justify-between border-t border-[var(--color-line)] py-1 font-semibold">
            <dt>Total</dt>
            <dd className="m-0">{aud(data.quote?.amount, { cents: true })}</dd>
          </div>
        </dl>
        {data.owner_ready ? (
          <Button className="w-fit" loading={busy} icon={<CreditCard className="h-4 w-4" strokeWidth={1.75} />} onClick={() => void pay()}>
            Pay {aud(data.quote?.amount, { cents: true })}
          </Button>
        ) : (
          <InlineAlert tone="info">The owner is finishing their payment setup. You&apos;ll be able to pay here as soon as it&apos;s done.</InlineAlert>
        )}
        {bond}
      </Panel>
      </div>
    );
  }

  const s = data.owner_setup;
  const ready = Boolean(s?.payouts_ready && s?.card_saved);
  return (
    <div data-testid="move-in-owner">
    <Panel className="flex flex-col gap-3">
      <p className="text-[17px] font-semibold text-[color:var(--color-ink)]">Rent in advance through Migrent</p>
      {ready ? (
        <p className="text-[14px] text-[color:var(--color-ink-2)]">
          Your renter can pay {aud(data.quote?.rent, { cents: true })} ({weeksText(data.quote?.weeks)}) by card, straight to your Stripe account. They pay the card fee, so you receive the full rent. We&apos;ll tell you the moment it&apos;s paid.
        </p>
      ) : (
        <InlineAlert
          tone="warning"
          title="Finish payment setup so your renter can pay"
          action={
            <ButtonLink to="/settings#payouts" size="sm">
              Set up payments
            </ButtonLink>
          }
        >
          Connect your bank through Stripe and save a card for Migrent&apos;s {aud(s?.fee ?? 99)} fee (charged once for each new renter).
        </InlineAlert>
      )}
    </Panel>
    </div>
  );
}

/** Settings > Payments, for owners. */
export function PayoutsCard() {
  const toast = useToast();
  const { data, refetch } = useHubQuery<OwnerSetup>("/hub/payouts?refresh=true");
  const [busy, setBusy] = useState<string | null>(null);
  if (!data?.enabled) return null;

  async function go(path: string, what: string) {
    setBusy(what);
    try {
      const r = await hubApi.post<{ url: string }>(path, {});
      window.location.assign(r.url);
    } catch (e) {
      toast.error(e instanceof HubError ? e.message : "Stripe didn't open.");
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-col gap-4" data-testid="payouts-card">
      <p className="text-[14px] leading-relaxed text-[color:var(--color-ink-2)]">
        Renters can pay their rent in advance by card, straight to your bank through Stripe. Migrent never holds it, and the renter pays the card fee, so you receive the full rent. Migrent charges {aud(data.fee ?? 99)} once for each new renter, to the card you save here. The bond is never paid through Migrent.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-2 rounded-[16px] border border-[var(--color-line)] p-4">
          <Fact icon={<Landmark className="h-4 w-4" strokeWidth={1.75} />} label="1. Get paid" value={data.payouts_ready ? "Bank connected" : data.payouts_started ? "Not finished" : "Not set up"} />
          <Button size="sm" variant={data.payouts_ready ? "secondary" : "primary"} className="w-fit" loading={busy === "payouts"} onClick={() => void go("/hub/payouts/onboard", "payouts")}>
            {data.payouts_ready ? "Update bank details" : data.payouts_started ? "Finish with Stripe" : "Connect your bank"}
          </Button>
        </div>
        <div className="flex flex-col gap-2 rounded-[16px] border border-[var(--color-line)] p-4">
          <Fact icon={<CreditCard className="h-4 w-4" strokeWidth={1.75} />} label="2. Card for Migrent's fee" value={data.card_saved ? data.card_label ?? "Card saved" : "No card yet"} />
          <Button size="sm" variant={data.card_saved ? "secondary" : "primary"} className="w-fit" loading={busy === "card"} onClick={() => void go("/hub/payouts/card", "card")}>
            {data.card_saved ? "Change card" : "Save a card"}
          </Button>
        </div>
      </div>
      {data.payouts_ready && data.card_saved ? (
        <InlineAlert tone="success">You&apos;re set up. Renters can pay you through Migrent.</InlineAlert>
      ) : (
        <button type="button" className="w-fit text-[13px] font-semibold text-[color:var(--color-primary)] hover:underline" onClick={() => void refetch()}>
          I&apos;ve finished in Stripe: check again
        </button>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-t border-[var(--color-line)] py-2.5 text-[14px] first:border-0">
      <dt className="text-[color:var(--color-ink-3)]">{label}</dt>
      <dd className="m-0 text-right font-medium text-[color:var(--color-ink)]">{value ?? "-"}</dd>
    </div>
  );
}

/** A receipt, printable. The same code on the renter's, the owner's and Migrent's. */
export function ReceiptView({ r }: { r: Receipt }) {
  const pay = r.payment;
  const title = r.role === "renter" ? "Renter's receipt" : r.role === "owner" ? "Owner's receipt" : "Migrent's receipt";
  return (
    <article className="mx-auto flex max-w-[640px] flex-col gap-5 rounded-[22px] border border-[var(--color-line)] bg-[var(--color-surface)] p-6 print:border-0 print:p-0" data-testid="receipt">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[color:var(--color-ink-3)]">Migrent · {title}</p>
          <h2 className="mt-1 text-[22px] font-semibold text-[color:var(--color-ink)]">{r.property.title ?? "Rent in advance"}</h2>
          <p className="text-[14px] text-[color:var(--color-ink-2)]">{r.property.address}</p>
        </div>
        <StatusBadge tone={pay.status === "paid" ? "success" : "neutral"}>{pay.status === "paid" ? "Paid" : "Refunded"}</StatusBadge>
      </header>

      <section>
        <h3 className="mb-1 text-[14px] font-semibold text-[color:var(--color-ink)]">Payment</h3>
        <dl className="m-0">
          <Row label="Rent" value={aud(pay.to_owner, { cents: true })} />
          <Row label="For" value={`${weeksText(pay.weeks)} rent in advance at ${aud(pay.weekly_rent, { cents: true })} a week`} />
          <Row label="Card fee (paid by the renter)" value={aud(pay.card_fee, { cents: true })} />
          <Row label={r.role === "owner" ? "Total the renter paid" : "Total paid"} value={aud(pay.amount, { cents: true })} />
          {r.role !== "renter" && <Row label="The owner receives" value={aud(pay.to_owner, { cents: true })} />}
          <Row label="Paid on" value={pay.paid_at ? day(pay.paid_at, { year: true }) : "-"} />
          <Row label="Payment reference" value={<span className="font-mono text-[12.5px]">{pay.reference}</span>} />
          <Row label="Move in" value={r.tenancy.start_date ? day(r.tenancy.start_date, { year: true }) : "-"} />
        </dl>
      </section>

      {r.owner && (
        <section>
          <h3 className="mb-1 text-[14px] font-semibold text-[color:var(--color-ink)]">Owner</h3>
          <dl className="m-0">
            <Row label="Name" value={r.owner.name} />
            <Row label="Email" value={r.owner.email} />
            <Row label="Phone" value={r.owner.phone} />
            {r.owner.id_checked !== undefined && <Row label="ID checked by Migrent" value={r.owner.id_checked ? "Yes" : "No"} />}
          </dl>
        </section>
      )}
      {r.renter && (
        <section>
          <h3 className="mb-1 text-[14px] font-semibold text-[color:var(--color-ink)]">Renter</h3>
          <dl className="m-0">
            <Row label="Name" value={r.renter.name} />
            <Row label="Email" value={r.renter.email} />
            <Row label="Phone" value={r.renter.phone} />
            <Row label="On Migrent since" value={r.renter.member_since ? day(r.renter.member_since, { year: true }) : "-"} />
          </dl>
        </section>
      )}
      {r.fee && (
        <section>
          <h3 className="mb-1 text-[14px] font-semibold text-[color:var(--color-ink)]">Migrent fee</h3>
          <dl className="m-0">
            <Row label="Status" value={{ charged: "Charged", not_due: "Not due (returning renter)", failed: "Not paid yet", not_yet: "Not yet" }[r.fee.status] ?? r.fee.status} />
            {r.fee.amount ? <Row label="Amount" value={aud(r.fee.amount, { cents: true })} /> : null}
            {r.fee.reference && <Row label="Reference" value={<span className="font-mono text-[12.5px]">{r.fee.reference}</span>} />}
          </dl>
        </section>
      )}
      {r.role === "admin" && (
        <section>
          <h3 className="mb-1 text-[14px] font-semibold text-[color:var(--color-ink)]">Both sides</h3>
          <dl className="m-0">
            <Row label="Owner confirmed the payment" value={r.owner_confirmed_at ? relative(r.owner_confirmed_at) : "Not yet"} />
            <Row label="Renter confirmed they moved in" value={r.renter_confirmed_at ? relative(r.renter_confirmed_at) : "Not yet"} />
            <Row label="Complete" value={r.complete ? "Yes" : "No"} />
          </dl>
        </section>
      )}

      {r.receipt_code && <SecurityCode code={r.receipt_code} />}
      {r.bond_note && <p className="text-[13px] text-[color:var(--color-ink-3)]">{r.bond_note}</p>}
      <div className="print:hidden">
        <Button variant="secondary" icon={<Printer className="h-4 w-4" strokeWidth={1.75} />} onClick={() => window.print()}>
          Print or save as PDF
        </Button>
      </div>
      <p className="text-[12px] text-[color:var(--color-ink-4)]">
        Questions about this payment?{" "}
        <a href={siteUrl("/contact")} className="font-semibold text-[color:var(--color-primary)] hover:underline">
          Contact Migrent
        </a>{" "}
        and quote the security code.
      </p>
    </article>
  );
}
