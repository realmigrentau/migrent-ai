import { useState } from "react";
import { Wallet } from "lucide-react";
import AdminPanelShell from "../../../components/hub/admin/AdminPanel";
import { ReceiptView, type MoveInPayment, type Receipt } from "../../../components/hub/tenancy/MoveIn";
import { EmptyState, ErrorState, RowSkeleton, StatusBadge } from "../../../components/hub/ui/Feedback";
import { PageHeader } from "../../../components/hub/ui/Layout";
import { Dialog } from "../../../components/hub/ui/Overlay";
import { aud, relative } from "../../../lib/hub/format";
import { useHubQuery } from "../../../lib/hub/query";
import type { Person } from "../../../lib/hub/types";

type Row = MoveInPayment & { tenancy_id: string; renter: Person | null; owner: Person | null; created_at: string };

const FEE: Record<string, { label: string; tone: "success" | "warning" | "neutral" | "danger" }> = {
  charged: { label: "Fee charged", tone: "success" },
  not_due: { label: "No fee (returning renter)", tone: "neutral" },
  failed: { label: "Fee failed", tone: "danger" },
  not_yet: { label: "Fee not yet", tone: "neutral" },
};

function MoveInReceipt({ id, onClose }: { id: string | null; onClose: () => void }) {
  const { data, error } = useHubQuery<Receipt>(id ? `/hub/admin/move-ins/${id}` : null);
  return (
    <Dialog open={!!id} onClose={onClose} size="lg" title="Migrent's receipt">
      {error ? <p role="alert">{error.message}</p> : !data ? <RowSkeleton rows={3} /> : <ReceiptView r={data} />}
    </Dialog>
  );
}

/**
 * Admin > Move-ins: every rent-in-advance payment through Migrent, its fee
 * and whether both sides have confirmed. Migrent's receipt carries the same
 * security code as the renter's and the owner's.
 */
function MoveInsContent() {
  const { data, error, loading, refetch } = useHubQuery<{ move_ins: Row[]; enabled: boolean }>("/hub/admin/move-ins");
  const [open, setOpen] = useState<string | null>(null);
  if (error) return <ErrorState message={error.message} offline={error.offline} onRetry={() => void refetch()} />;
  if (loading || !data) return <RowSkeleton rows={4} />;
  return (
    <>
      <PageHeader
        title="Move-ins"
        description={`Rent in advance paid through Migrent, straight to owners. ${data.enabled ? "" : "Switched off: set MOVE_IN_PAYMENTS_ENABLED=true on the server once Stripe Connect is on."}`}
      />
      {data.move_ins.length === 0 ? (
        <EmptyState icon={<Wallet className="h-6 w-6" strokeWidth={1.75} />} title="No move-in payments yet" body="They appear here when a renter starts paying." />
      ) : (
        <ul className="flex flex-col overflow-hidden rounded-[20px] border border-[var(--color-line)] bg-[var(--color-surface)]" data-testid="admin-move-ins">
          {data.move_ins.map((m) => (
            <li key={m.id} className="border-t border-[var(--color-line)] first:border-0">
              <button type="button" disabled={m.status === "pending"} onClick={() => setOpen(m.id ?? null)} className="flex w-full flex-wrap items-center gap-3 px-4 py-3.5 text-left hover:bg-[var(--color-surface-hover)] disabled:cursor-default sm:px-5">
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-semibold text-[color:var(--color-ink)]">
                    {m.renter?.name ?? "Renter"} paid {m.owner?.name ?? "owner"} {aud(m.amount, { cents: true })}
                  </span>
                  <span className="block text-[13px] text-[color:var(--color-ink-3)]">
                    {m.receipt_code ? <span className="font-mono">{m.receipt_code}</span> : "Not paid yet"} · {relative(m.paid_at ?? m.created_at)}
                  </span>
                </span>
                <StatusBadge tone={m.status === "paid" ? "success" : "neutral"} icon={false}>
                  {m.status === "paid" ? (m.complete ? "Both confirmed" : "Paid") : m.status === "pending" ? "Waiting for payment" : "Refunded"}
                </StatusBadge>
                {m.fee_status && m.status !== "pending" && (
                  <StatusBadge tone={FEE[m.fee_status]?.tone ?? "neutral"} icon={false}>
                    {FEE[m.fee_status]?.label ?? m.fee_status}
                  </StatusBadge>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
      <MoveInReceipt id={open} onClose={() => setOpen(null)} />
    </>
  );
}

export default function AdminMoveInsPage() {
  return (
    <AdminPanelShell title="Move-ins">
      <MoveInsContent />
    </AdminPanelShell>
  );
}
