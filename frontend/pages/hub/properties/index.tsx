import { useMemo, useState } from "react";
import { Building2, Pause, Pencil, Play, Plus, RefreshCw, Search, Trash2 } from "lucide-react";
import HubShell from "../../../components/hub/HubShell";
import HubLink from "../../../components/hub/HubLink";
import { PropertyTile } from "../../../components/hub/home/OwnerHome";
import UnitRow from "../../../components/hub/owner/UnitRow";
import { Button, ButtonLink, IconButton } from "../../../components/hub/ui/Button";
import { Checkbox, Input, Select } from "../../../components/hub/ui/Field";
import { CardSkeleton, EmptyState, ErrorState, StatusBadge } from "../../../components/hub/ui/Feedback";
import { PageHeader, Section } from "../../../components/hub/ui/Layout";
import { HomeImage } from "../../../components/hub/ui/Media";
import { useConfirm } from "../../../components/ui/ConfirmDialog";
import { useToast } from "../../../components/ui/Toast";
import { hubApi, HubError } from "../../../lib/hub/api";
import { relative } from "../../../lib/hub/format";
import { WIZARD_STEPS } from "../../../lib/hub/listingDraft";
import { setQueryData, useHubQuery } from "../../../lib/hub/query";
import type { ListingCard, Portfolio, PropertySummary } from "../../../lib/hub/types";

const STATUS_FILTERS = [
  { value: "", label: "Any status" },
  { value: "approved", label: "Live" },
  { value: "paused", label: "Paused" },
  { value: "pending_approval", label: "In review" },
  { value: "expired", label: "Expired" },
  { value: "draft", label: "Draft" },
];
const STATUS_LABEL: Record<string, string> = { approved: "Live", paused: "Paused", pending_approval: "In review", expired: "Expired", draft: "Draft", changes_requested: "Changes asked", rejected: "Not approved", flagged: "In review", hidden: "Hidden" };

function matches(text: string, ...fields: (string | null | undefined)[]) {
  const t = text.trim().toLowerCase();
  return !t || fields.some((f) => (f ?? "").toLowerCase().includes(t));
}

/**
 * Many listings at once, for property managers (MIGRENT_MASTER_AUDIT
 * MIG-026): find by address or title, filter by status, and pause, bring
 * back or renew a selection. Each listing goes through the same rules as on
 * its own page (POST /hub/listings/bulk); any that can't change are named.
 */
function ManyListings({ rows, onChanged }: { rows: { unit: ListingCard; property: PropertySummary | null }[]; onChanged: () => void }) {
  const toast = useToast();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [until, setUntil] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const ids = rows.map((r) => r.unit.id);
  const allOn = ids.length > 0 && ids.every((i) => selected.has(i));

  async function run(action: "pause" | "resume" | "renew") {
    const listing_ids = ids.filter((i) => selected.has(i));
    if (!listing_ids.length) return;
    if (action === "renew" && !until) return toast.warning("Choose the new last day first.");
    setBusy(action);
    try {
      const res = await hubApi.post<{ results: { id: string; ok: boolean; error?: string }[]; changed: number }>("/hub/listings/bulk", { listing_ids, action, available_to: action === "renew" ? until : undefined });
      const failed = res.results.filter((r) => !r.ok);
      if (res.changed) toast.success(`${res.changed} listing${res.changed === 1 ? "" : "s"} updated`);
      if (failed.length) {
        const title = (id: string) => rows.find((r) => r.unit.id === id)?.unit.title ?? "A listing";
        toast.warning(`${failed.length} couldn't change`, { description: failed.slice(0, 3).map((f) => `${title(f.id)}: ${f.error}`).join(" ") });
      }
      setSelected(new Set(failed.map((f) => f.id)));
      onChanged();
    } catch (e) {
      toast.error(e instanceof HubError ? e.message : "That didn't save.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-col gap-3" data-testid="many-listings">
      <div className="flex flex-wrap items-center gap-2 rounded-[16px] border border-[var(--color-line)] bg-[var(--color-surface-muted)] p-3">
        <Checkbox label={allOn ? "Clear selection" : "Select all shown"} checked={allOn} onChange={(on) => setSelected(on ? new Set(ids) : new Set())} />
        <span className="text-[13px] text-[color:var(--color-ink-3)]">{selected.size} selected</span>
        <span className="flex-1" />
        <Button size="sm" variant="secondary" loading={busy === "pause"} disabled={!selected.size} icon={<Pause className="h-4 w-4" strokeWidth={1.75} />} onClick={() => void run("pause")}>
          Pause
        </Button>
        <Button size="sm" variant="secondary" loading={busy === "resume"} disabled={!selected.size} icon={<Play className="h-4 w-4" strokeWidth={1.75} />} onClick={() => void run("resume")}>
          Bring back
        </Button>
        <span className="flex items-center gap-2">
          <Button size="sm" variant="secondary" loading={busy === "renew"} disabled={!selected.size} icon={<RefreshCw className="h-4 w-4" strokeWidth={1.75} />} onClick={() => void run("renew")}>
            Renew until
          </Button>
          <span className="w-[150px]">
            <label className="sr-only" htmlFor="bulk-until">
              New last day
            </label>
            <Input id="bulk-until" type="date" value={until} onChange={(e) => setUntil(e.target.value)} className="h-9 text-[13.5px]" />
          </span>
        </span>
      </div>
      <ul className="flex flex-col overflow-hidden rounded-[20px] border border-[var(--color-line)] bg-[var(--color-surface)]">
        {rows.map(({ unit: u, property: p }) => (
          <li key={u.id} className="flex items-center gap-3 border-t border-[var(--color-line)] px-4 py-3 first:border-0">
            <Checkbox
              label={<span className="sr-only">Select {u.title}</span>}
              checked={selected.has(u.id)}
              onChange={(on) =>
                setSelected((prev) => {
                  const next = new Set(prev);
                  if (on) next.add(u.id);
                  else next.delete(u.id);
                  return next;
                })
              }
            />
            <div className="min-w-0 flex-1">
              <HubLink to={`/listings/${u.id}`} className="block truncate text-[14.5px] font-semibold text-[color:var(--color-ink)] hover:underline">
                {u.unit_label ? `${u.unit_label} · ` : ""}
                {u.title}
              </HubLink>
              <p className="truncate text-[12.5px] text-[color:var(--color-ink-3)]">{p ? p.nickname || p.street_address : "Not linked to a property"}</p>
            </div>
            <StatusBadge tone={u.moderation_status === "approved" ? "success" : u.moderation_status === "paused" || u.moderation_status === "draft" ? "neutral" : "warning"} icon={false}>
              {STATUS_LABEL[u.moderation_status ?? ""] ?? u.moderation_status ?? "Unknown"}
            </StatusBadge>
          </li>
        ))}
      </ul>
    </div>
  );
}

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
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");

  // Search and status apply to the property tiles and the listing list alike.
  const rows = useMemo(() => {
    if (!data) return [];
    const all = [...data.properties.flatMap((p) => p.units.map((unit) => ({ unit, property: p as PropertySummary | null }))), ...data.unassigned.map((unit) => ({ unit, property: null }))];
    return all.filter(({ unit, property }) => (!status || unit.moderation_status === status) && matches(q, unit.title, unit.unit_label, property?.nickname, property?.street_address, property?.suburb, unit.suburb));
  }, [data, q, status]);
  const filtering = Boolean(q.trim() || status);
  const shownProperties = (data?.properties ?? []).filter((p) => !filtering || rows.some((r) => r.property?.id === p.id));
  const unitCount = data ? data.properties.reduce((n, p) => n + p.units.length, 0) + data.unassigned.length : 0;

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

          {unitCount > 1 && (
            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_220px]" role="search" aria-label="Find listings">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--color-ink-3)]" strokeWidth={1.9} aria-hidden />
                <Input aria-label="Search by address, suburb or title" placeholder="Search by address, suburb or title" value={q} onChange={(e) => setQ(e.target.value)} className="pl-10" />
              </div>
              <Select aria-label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
                {STATUS_FILTERS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </Select>
            </div>
          )}

          {shownProperties.length > 0 && (
            <Section title="Your properties">
              <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {shownProperties.map((p) => (
                  <li key={p.id}>
                    <PropertyTile p={p} />
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {unitCount > 1 && (
            <Section title="Manage several listings" description={filtering ? `${rows.length} match your search.` : "Select listings to pause, bring back or renew together."}>
              {rows.length ? <ManyListings rows={rows} onChanged={() => void refetch()} /> : <p className="text-[14px] text-[color:var(--color-ink-3)]">No listings match.</p>}
            </Section>
          )}

          {data.unassigned.length > 0 && !filtering && (
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
