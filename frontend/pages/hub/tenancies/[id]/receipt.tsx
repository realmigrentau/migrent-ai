import { useRouter } from "next/router";
import HubShell from "../../../../components/hub/HubShell";
import { ReceiptView, type Receipt } from "../../../../components/hub/tenancy/MoveIn";
import { CardSkeleton, EmptyState, ErrorState } from "../../../../components/hub/ui/Feedback";
import { PageHeader } from "../../../../components/hub/ui/Layout";
import { useHubQuery } from "../../../../lib/hub/query";

/** The renter's or the owner's move-in receipt (backend/move_in.py). */
export default function MoveInReceiptPage() {
  const router = useRouter();
  const id = typeof router.query.id === "string" ? router.query.id : null;
  const { data, error, refetch } = useHubQuery<Receipt>(id ? `/hub/tenancies/${id}/receipt` : null);
  return (
    <HubShell title="Receipt">
      <PageHeader title="Receipt" back={id ? { to: `/tenancies/${id}`, label: "Tenancy" } : undefined} />
      {error ? (
        error.status === 404 ? (
          <EmptyState title="No receipt yet" body="The receipt appears as soon as the move-in payment is made." />
        ) : (
          <ErrorState message={error.message} offline={error.offline} onRetry={() => void refetch()} />
        )
      ) : !data ? (
        <CardSkeleton />
      ) : (
        <ReceiptView r={data} />
      )}
    </HubShell>
  );
}
