import { Building2, Pencil, Plus, Trash2 } from "lucide-react";
import HubShell from "../../../components/hub/HubShell";
import HubLink from "../../../components/hub/HubLink";
import { PropertyTile } from "../../../components/hub/home/OwnerHome";
import UnitRow from "../../../components/hub/owner/UnitRow";
import { ButtonLink, IconButton } from "../../../components/hub/ui/Button";
import { CardSkeleton, EmptyState, ErrorState } from "../../../components/hub/ui/Feedback";
import { PageHeader, Section } from "../../../components/hub/ui/Layout";
import { HomeImage } from "../../../components/hub/ui/Media";
import { useConfirm } from "../../../components/ui/ConfirmDialog";
import { useToast } from "../../../components/ui/Toast";
import { hubApi, HubError } from "../../../lib/hub/api";
import { relative } from "../../../lib/hub/format";
import { WIZARD_STEPS } from "../../../lib/hub/listingDraft";
import { setQueryData, useHubQuery } from "../../../lib/hub/query";
import type { Portfolio } from "../../../lib/hub/types";

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-[18px] border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-3.5">
      <span className="text-[24px] font-semibold tabular-nums tracking-[-0.02em] text-[color:var(--color-ink)]">{value}</span>
      <span className="text-[13px] text-[color:var(--color-ink-3)]">{label}</span>
    </div>
  );
}

export default function PropertiesPage() {
  const toast = useToast();
  const confirm = useConfirm();
  const { data, error, refetch } = useHubQuery<Portfolio>("/hub/properties");

  async function removeDraft(id: string, title: string) {
    if (!(await confirm({ title: `Delete "${title}"?`, description: "This unfinished listing and its photos are removed. It was never published.", confirmLabel: "Delete", tone: "danger" }))) return;
    try {
      await hubApi.del(`/hub/listing-drafts/${id}`);
      setQueryData<Portfolio>("/hub/properties", (prev) => (prev ? { ...prev, drafts: (prev.drafts ?? []).filter((d) => d.id !== id) } : prev!));
    } catch (e) {
      toast.error(e instanceof HubError ? e.message : "That didn't delete.");
    }
  }

  const fab = (
    <ButtonLink to="/properties/new" icon={<Plus className="h-5 w-5" strokeWidth={1.9} />} className="rounded-full shadow-[var(--shadow-pop)]">
      List a property
    </ButtonLink>
  );

  return (
    <HubShell title="Properties" fab={fab}>
      <PageHeader
        title="Properties"
        description="Every property you list, and the rooms or units in each."
        actions={
          <span className="hidden sm:block">
            <ButtonLink to="/properties/new" icon={<Plus className="h-4 w-4" strokeWidth={1.9} />}>
              List a property
            </ButtonLink>
          </span>
        }
      />
      {error ? (
        <ErrorState message={error.message} offline={error.offline} onRetry={() => void refetch()} />
      ) : !data ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : data.properties.length === 0 && data.unassigned.length === 0 && !(data.drafts ?? []).length ? (
        <EmptyState
          icon={<Building2 className="h-6 w-6" strokeWidth={1.75} />}
          title="List your first property"
          body="Add the address once, then list the whole place or each room in it. It takes about ten minutes, and it saves as you go."
          action={<ButtonLink to="/properties/new">List a property</ButtonLink>}
        />
      ) : (
        <div className="flex flex-col gap-12">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label={data.totals.properties === 1 ? "Property" : "Properties"} value={data.totals.properties} />
            <Stat label="Listed" value={data.totals.units} />
            <Stat label="Available now" value={data.totals.available} />
            <Stat label="Occupied" value={data.totals.occupied} />
          </div>

          {(data.drafts ?? []).length > 0 && (
            <Section title="Unfinished" description="Saved as you went. Pick up where you left off.">
              <ul className="flex flex-col overflow-hidden rounded-[20px] border border-[var(--color-line)] bg-[var(--color-surface)]">
                {(data.drafts ?? []).map((d) => (
                  <li key={d.id} className="flex items-center gap-4 border-t border-[var(--color-line)] px-4 py-3.5 first:border-0 sm:px-5">
                    <HomeImage src={d.image} alt="" className="h-14 w-20 shrink-0" rounded="rounded-[12px]" sizes="80px" />
                    <HubLink to={`/properties/new?draft=${d.id}&step=${WIZARD_STEPS[Math.min(d.step, WIZARD_STEPS.length - 1)].key}`} className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-[15px] font-semibold text-[color:var(--color-ink)] hover:underline">{d.title}</span>
                      <span className="text-[13px] text-[color:var(--color-ink-3)]">
                        Step {Math.min(d.step + 1, WIZARD_STEPS.length)} of {WIZARD_STEPS.length} · saved {relative(d.updated_at)}
                      </span>
                    </HubLink>
                    <ButtonLink to={`/properties/new?draft=${d.id}&step=${WIZARD_STEPS[Math.min(d.step, WIZARD_STEPS.length - 1)].key}`} variant="secondary" size="sm" icon={<Pencil className="h-4 w-4" strokeWidth={1.75} />}>
                      Continue
                    </ButtonLink>
                    <IconButton label={`Delete ${d.title}`} size="sm" onClick={() => void removeDraft(d.id, d.title)}>
                      <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                    </IconButton>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {data.properties.length > 0 && (
            <Section title="Your properties">
              <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {data.properties.map((p) => (
                  <li key={p.id}>
                    <PropertyTile p={p} />
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {data.unassigned.length > 0 && (
            <Section title="Other listings" description="Listings not linked to a property yet. Link them from each listing's page.">
              <ul className="flex flex-col overflow-hidden rounded-[20px] border border-[var(--color-line)] bg-[var(--color-surface)]">
                {data.unassigned.map((u) => (
                  <li key={u.id} className="border-t border-[var(--color-line)] first:border-0">
                    <UnitRow u={u} />
                  </li>
                ))}
              </ul>
            </Section>
          )}
        </div>
      )}
    </HubShell>
  );
}
