import { useState } from "react";
import { useRouter } from "next/router";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { BellRing, Compass, GitCompareArrows, Heart, Pencil, Search, Trash2 } from "lucide-react";
import HubShell from "../../components/hub/HubShell";
import { useHubNavigate } from "../../components/hub/HubLink";
import { HomeCard } from "../../components/hub/cards";
import { Button, ButtonLink } from "../../components/hub/ui/Button";
import { CardSkeleton, Chip, EmptyState, ErrorState, RowSkeleton } from "../../components/hub/ui/Feedback";
import { Field, Input, Select } from "../../components/hub/ui/Field";
import { Dialog } from "../../components/hub/ui/Overlay";
import { PageHeader, Tabs } from "../../components/hub/ui/Layout";
import { HomeImage } from "../../components/hub/ui/Media";
import { useConfirm } from "../../components/ui/ConfirmDialog";
import { useToast } from "../../components/ui/Toast";
import { hubApi, HubError } from "../../lib/hub/api";
import { useCompare } from "../../lib/hub/compare";
import { relative } from "../../lib/hub/format";
import { invalidate, setQueryData, useHubQuery } from "../../lib/hub/query";
import { describeSearch, discoverPath } from "../../lib/hub/searchLinks";
import type { ListingCard, SavedSearch } from "../../lib/hub/types";
import { cn } from "../../lib/cn";

const ALERTS = [
  { value: "instant", label: "As soon as they're listed" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "off", label: "Off" },
];

function SavedHomes() {
  const { data, error, loading, refetch } = useHubQuery<{ homes: ListingCard[] }>("/hub/saved");
  const compare = useCompare();
  const toast = useToast();
  const reduce = useReducedMotion();
  if (error) return <ErrorState message={error.message} offline={error.offline} onRetry={() => void refetch()} />;
  if (loading || !data) {
    return (
      <div className="grid gap-x-5 gap-y-9 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }
  if (!data.homes.length) {
    return (
      <EmptyState
        icon={<Heart className="h-6 w-6" strokeWidth={1.75} />}
        title="No saved homes yet"
        body="Tap the heart on any home to keep it here. We'll show you if the rent changes."
        action={<ButtonLink to="/discover" icon={<Compass className="h-4 w-4" strokeWidth={1.9} />}>Explore homes</ButtonLink>}
      />
    );
  }
  const available = data.homes.filter((h) => h.public_state === "published");
  const gone = data.homes.filter((h) => h.public_state !== "published");
  return (
    <div className="flex flex-col gap-12">
      <div className="grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence initial={false}>
          {available.map((h) => {
            const inCompare = compare.has(h.id);
            return (
              <motion.div key={h.id} layout={!reduce} exit={reduce ? undefined : { opacity: 0, scale: 0.96 }} transition={{ duration: 0.22 }}>
                <HomeCard
                  listing={h}
                  footer={
                    <button
                      type="button"
                      aria-pressed={inCompare}
                      onClick={() => {
                        if (!inCompare && compare.full) return toast.info("You can compare up to four homes. Remove one first.");
                        compare.toggle(h.id);
                      }}
                      className={cn(
                        "hub-press inline-flex h-9 w-fit items-center gap-2 rounded-full border px-3 text-[13px] font-semibold transition-colors",
                        inCompare ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)] text-[color:var(--color-ink)]" : "border-[var(--color-line-2)] text-[color:var(--color-ink-2)] hover:border-[var(--color-ink-4)]",
                      )}
                    >
                      <GitCompareArrows className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                      {inCompare ? "In comparison" : "Compare"}
                    </button>
                  }
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      {gone.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="text-[17px] font-semibold text-[color:var(--color-ink)]">No longer available</h2>
          <div className="grid gap-x-5 gap-y-8 opacity-80 sm:grid-cols-2 lg:grid-cols-4">
            {gone.map((h) => (
              <HomeCard key={h.id} listing={h} saveable={false} size="sm" />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function SavedSearches() {
  const toast = useToast();
  const confirm = useConfirm();
  const navigate = useHubNavigate();
  const { data, error, loading, refetch } = useHubQuery<{ searches: SavedSearch[] }>("/hub/searches");
  const [editing, setEditing] = useState<SavedSearch | null>(null);
  const [name, setName] = useState("");

  async function update(id: string, patch: Partial<SavedSearch>) {
    setQueryData<{ searches: SavedSearch[] }>("/hub/searches", (prev) => ({ searches: (prev?.searches ?? []).map((s) => (s.id === id ? { ...s, ...patch } : s)) }));
    try {
      await hubApi.patch(`/hub/searches/${id}`, patch);
    } catch (e) {
      toast.error(e instanceof HubError ? e.message : "That did not save.");
      void refetch();
    }
  }

  if (error) return <ErrorState message={error.message} offline={error.offline} onRetry={() => void refetch()} />;
  if (loading || !data) return <RowSkeleton rows={3} />;
  if (!data.searches.length) {
    return (
      <EmptyState
        icon={<BellRing className="h-6 w-6" strokeWidth={1.75} />}
        title="No saved searches"
        body="Search for a suburb and a budget in Discover, then choose Save search. We'll tell you when new homes match."
        action={<ButtonLink to="/discover" icon={<Search className="h-4 w-4" strokeWidth={1.9} />}>Search homes</ButtonLink>}
      />
    );
  }
  return (
    <div className="flex flex-col gap-4">
      {data.searches.map((s) => (
        <article key={s.id} className="flex flex-col gap-4 rounded-[22px] border border-[var(--color-line)] bg-[var(--color-surface)] p-5 lg:flex-row lg:items-center">
          <div className="flex min-w-0 flex-1 flex-col gap-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-[17px] font-semibold text-[color:var(--color-ink)]">{s.name}</h3>
              {s.new_count > 0 && <span className="rounded-full bg-[var(--color-primary)] px-2 py-0.5 text-[12px] font-bold text-[color:var(--color-primary-fg)]">{s.new_count} new</span>}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {describeSearch(s.params).map((c) => (
                <Chip key={c}>{c}</Chip>
              ))}
            </div>
            <p className="text-[13px] text-[color:var(--color-ink-3)]">
              {s.match_count} home{s.match_count === 1 ? "" : "s"} match today · saved {relative(s.created_at)}
            </p>
          </div>
          {s.preview.length > 0 && (
            <div className="flex -space-x-3" aria-hidden>
              {s.preview.slice(0, 3).map((p) => (
                <HomeImage key={p.id} src={p.image} alt="" className="h-14 w-14 ring-4 ring-[var(--color-surface)]" rounded="rounded-[14px]" sizes="56px" />
              ))}
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <label className="flex items-center gap-2 text-[13px] text-[color:var(--color-ink-3)]">
              Alerts
              <Select value={s.alert} onChange={(e) => void update(s.id, { alert: e.target.value as SavedSearch["alert"] })} className="h-9 w-auto rounded-[10px] pr-9 text-[13.5px]" aria-label={`Alerts for ${s.name}`}>
                {ALERTS.map((a) => (
                  <option key={a.value} value={a.value}>
                    {a.label}
                  </option>
                ))}
              </Select>
            </label>
            <Button
              size="sm"
              onClick={() => {
                void hubApi.post(`/hub/searches/${s.id}/seen`).catch(() => {});
                invalidate("/hub/searches");
                void navigate(discoverPath(s.params));
              }}
            >
              Open
            </Button>
            <Button
              size="sm"
              variant="ghost"
              aria-label={`Rename ${s.name}`}
              icon={<Pencil className="h-4 w-4" strokeWidth={1.75} />}
              onClick={() => {
                setEditing(s);
                setName(s.name);
              }}
            />
            <Button
              size="sm"
              variant="ghost"
              aria-label={`Delete ${s.name}`}
              icon={<Trash2 className="h-4 w-4" strokeWidth={1.75} />}
              onClick={async () => {
                const ok = await confirm({ title: `Delete "${s.name}"?`, description: "You'll stop hearing about new homes for it.", confirmLabel: "Delete search", tone: "danger" });
                if (!ok) return;
                setQueryData<{ searches: SavedSearch[] }>("/hub/searches", (prev) => ({ searches: (prev?.searches ?? []).filter((x) => x.id !== s.id) }));
                try {
                  await hubApi.del(`/hub/searches/${s.id}`);
                  toast.info("Saved search deleted");
                } catch {
                  void refetch();
                }
              }}
            />
          </div>
        </article>
      ))}
      <Dialog
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title="Rename search"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (editing && name.trim()) void update(editing.id, { name: name.trim() });
                setEditing(null);
              }}
            >
              Save
            </Button>
          </>
        }
      >
        <div className="pb-3">
          <Field label="Name">{({ id }) => <Input id={id} value={name} onChange={(e) => setName(e.target.value)} maxLength={80} data-autofocus />}</Field>
        </div>
      </Dialog>
    </div>
  );
}

export default function Saved() {
  const router = useRouter();
  const tab = router.query.tab === "searches" ? "searches" : "homes";
  const compare = useCompare();
  const homes = useHubQuery<{ homes: ListingCard[] }>("/hub/saved");
  const searches = useHubQuery<{ searches: SavedSearch[] }>("/hub/searches");
  const setTab = (t: "homes" | "searches") => void router.replace({ pathname: router.pathname, query: t === "homes" ? {} : { tab: t } }, `${router.asPath.split("?")[0]}${t === "homes" ? "" : `?tab=${t}`}`, { shallow: true, scroll: false });

  return (
    <HubShell title="Saved">
      <PageHeader title="Saved" description="Homes you've kept, and the searches we watch for you." />
      <Tabs
        label="Saved"
        value={tab}
        onChange={setTab}
        tabs={[
          { value: "homes", label: "Homes", count: homes.data?.homes.length },
          { value: "searches", label: "Searches", count: searches.data?.searches.reduce((n, s) => n + (s.new_count ? 1 : 0), 0) },
        ]}
        className="mb-8"
      />
      {tab === "homes" ? <SavedHomes /> : <SavedSearches />}
      {tab === "homes" && compare.ids.length > 0 && (
        <div className="hub-sticky-bar mt-10 flex justify-center">
          <div className="flex items-center gap-3 rounded-full border border-[var(--color-glass-line)] bg-[var(--color-glass)] py-2 pl-5 pr-2 shadow-[var(--shadow-pop)] backdrop-blur-xl">
            <span className="text-[14px] font-semibold text-[color:var(--color-ink)]">{compare.ids.length} of 4 selected</span>
            <Button variant="ghost" size="sm" onClick={compare.clear}>
              Clear
            </Button>
            <ButtonLink to={`/compare?ids=${compare.ids.join(",")}`} size="sm" className="rounded-full" icon={<GitCompareArrows className="h-4 w-4" strokeWidth={1.75} />}>
              Compare
            </ButtonLink>
          </div>
        </div>
      )}
    </HubShell>
  );
}
