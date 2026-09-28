import { useRouter } from "next/router";
import HubShell from "../../../components/hub/HubShell";
import TenancyView from "../../../components/hub/tenancy/TenancyView";
import { CardSkeleton, EmptyState, ErrorState } from "../../../components/hub/ui/Feedback";
import { PageHeader } from "../../../components/hub/ui/Layout";
import { useHubQuery } from "../../../lib/hub/query";
import type { TenancyDetail } from "../../../lib/hub/types";

export default function TenancyPage() {
  const router = useRouter();
  const id = typeof router.query.id === "string" ? router.query.id : null;
  const { data, error, refetch } = useHubQuery<TenancyDetail>(id ? `/hub/tenancies/${id}` : null);
  const owner = data?.viewer === "owner";
  const title = data ? (owner ? `${data.renter?.name ?? "Tenancy"}${data.listing ? ` · ${data.listing.unit_label ? `${data.listing.unit_label}, ` : ""}${data.listing.title}` : ""}` : data.listing?.title ?? "My home") : "Tenancy";

  return (
    <HubShell title={data ? title : "Tenancy"}>
      <PageHeader title={data ? title : " "} back={owner || !data ? { to: "/tenancies", label: "Tenancies" } : { to: "/my-home", label: "My home" }} />
      {error ? (
        error.status === 404 ? (
          <EmptyState title="Tenancy not found" body="It may belong to a different account." />
        ) : (
          <ErrorState message={error.message} offline={error.offline} onRetry={() => void refetch()} />
        )
      ) : !data ? (
        <CardSkeleton />
      ) : (
        <TenancyView d={data} refetch={() => void refetch()} />
      )}
    </HubShell>
  );
}
