import { useMemo, useState } from "react";
import { useRouter } from "next/router";
import { BadgeCheck, ClipboardCheck, Compass, FileText, GitCompareArrows, Search } from "lucide-react";
import HubShell from "../../../components/hub/HubShell";
import { ApplicationCard } from "../../../components/hub/cards";
import StayRequests from "../../../components/hub/applications/StayRequests";
import ApplicantCompare from "../../../components/hub/applications/ApplicantCompare";
import { Button, ButtonLink } from "../../../components/hub/ui/Button";
import { EmptyState, ErrorState, RowSkeleton } from "../../../components/hub/ui/Feedback";
import { Checkbox, Select } from "../../../components/hub/ui/Field";
import { PageHeader, Tabs } from "../../../components/hub/ui/Layout";
import { useToast } from "../../../components/ui/Toast";
import { cn } from "../../../lib/cn";
import { useHubQuery } from "../../../lib/hub/query";
import { isClosed } from "../../../lib/hub/status";
import { useHub } from "../../../lib/hub/session";
import type { ApplicationSummary } from "../../../lib/hub/types";

type OwnerTab = "new" | "shortlisted" | "waiting" | "decided";
const OWNER_TABS: Record<OwnerTab, ApplicationSummary["status"][]> = {
  new: ["submitted", "under_review"],
  shortlisted: ["shortlisted"],
  waiting: ["changes_requested", "migrent_review", "owner_approved"],
  decided: ["finalised", "declined", "withdrawn", "not_proceeding"],
};

function RenterApplications({ apps }: { apps: ApplicationSummary[] }) {
  const [tab, setTab] = useState<"active" | "past">("active");
  const active = apps.filter((a) => !isClosed(a.status));
  const past = apps.filter((a) => isClosed(a.status));
  const list = tab === "active" ? active : past;
  if (!apps.length) {
    return (
      <EmptyState
        icon={<FileText className="h-6 w-6" strokeWidth={1.75} />}
        title="No applications yet"
        body="When you find a home you like, apply from its page. Your Rental Profile fills in most of it."
        action={<ButtonLink to="/discover" icon={<Compass className="h-4 w-4" strokeWidth={1.9} />}>Explore homes</ButtonLink>}
        secondary={<ButtonLink to="/profile" variant="secondary">Complete your Rental Profile</ButtonLink>}
      />
    );
  }
  return (
    <div className="flex flex-col gap-6">
      <Tabs label="Applications" value={tab} onChange={setTab} tabs={[{ value: "active", label: "Active", count: active.length }, { value: "past", label: "Past", count: past.length }]} />
      {list.length ? (
        <div className="flex flex-col gap-3">
          {list.map((a) => (
            <ApplicationCard key={a.id} app={a} />
          ))}
        </div>
      ) : (
        <EmptyState compact title={tab === "active" ? "Nothing active right now" : "No past applications"} body={tab === "active" ? "Applications you've sent and ones in progress show here." : "Withdrawn and closed applications show here."} />
      )}
    </div>
  );
}

function OwnerApplications({ apps }: { apps: ApplicationSummary[] }) {
  const router = useRouter();
  const toast = useToast();
  const tab = (Object.keys(OWNER_TABS).includes(String(router.query.tab)) ? router.query.tab : "new") as OwnerTab;
  const [q, setQ] = useState("");
  const [home, setHome] = useState(typeof router.query.listing === "string" ? router.query.listing : "");
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [comparing, setComparing] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(router.query.verified === "1");

  const homes = useMemo(() => {
    const m = new Map<string, string>();
    for (const a of apps) if (a.listing) m.set(a.listing.id, `${a.listing.unit_label ? `${a.listing.unit_label} · ` : ""}${a.listing.title}`);
    return Array.from(m.entries());
  }, [apps]);

  const counts = Object.fromEntries((Object.keys(OWNER_TABS) as OwnerTab[]).map((t) => [t, apps.filter((a) => OWNER_TABS[t].includes(a.status)).length])) as Record<OwnerTab, number>;
  const needle = q.trim().toLowerCase();
  const list = apps.filter((a) => OWNER_TABS[tab].includes(a.status) && (!home || a.listing?.id === home) && (!verifiedOnly || a.id_verified) && (!needle || (a.person?.name || "").toLowerCase().includes(needle) || (a.listing?.title || "").toLowerCase().includes(needle)));
  const setTab = (t: OwnerTab) => {
    const params = new URLSearchParams();
    if (t !== "new") params.set("tab", t);
    if (home) params.set("listing", home);
    const qs = params.toString();
    void router.replace({ pathname: router.pathname, query: Object.fromEntries(params) }, `${router.asPath.split("?")[0]}${qs ? `?${qs}` : ""}`, { shallow: true, scroll: false });
  };

  if (!apps.length) {
    return (
      <EmptyState
        icon={<ClipboardCheck className="h-6 w-6" strokeWidth={1.75} />}
        title="No applications yet"
        body="When renters apply for one of your homes, you'll review them here - side by side, with everything they chose to share."
        action={<ButtonLink to="/properties">Your properties</ButtonLink>}
        secondary={<ButtonLink to="/inspections" variant="secondary">Open inspection times</ButtonLink>}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Tabs
        label="Applications"
        value={tab}
        onChange={setTab}
        tabs={[
          { value: "new", label: "To review", count: counts.new },
          { value: "shortlisted", label: "Shortlisted", count: counts.shortlisted },
          { value: "waiting", label: "In progress", count: counts.waiting },
          { value: "decided", label: "Decided", count: counts.decided },
        ]}
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-[320px]">
          <label htmlFor="apps-q" className="sr-only">
            Search applications
          </label>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--color-ink-3)]" strokeWidth={1.9} aria-hidden />
          <input
            id="apps-q"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search applications"
            className="h-10 w-full rounded-full border border-[var(--color-line-2)] bg-[var(--color-surface)] pl-10 pr-4 text-[14.5px] text-[color:var(--color-ink)] placeholder:text-[color:var(--color-ink-4)] focus:border-[var(--color-primary)] focus:outline-none"
          />
        </div>
        {homes.length > 1 && (
          <Select aria-label="Filter by home" value={home} onChange={(e) => setHome(e.target.value)} className="h-10 w-auto rounded-full pr-10 text-[14px] sm:min-w-[220px]">
            <option value="">All homes</option>
            {homes.map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </Select>
        )}
        <button
          type="button"
          aria-pressed={verifiedOnly}
          onClick={() => setVerifiedOnly((v) => !v)}
          className={cn(
            "inline-flex h-10 items-center gap-1.5 whitespace-nowrap rounded-full border px-4 text-[14px] font-medium transition-colors",
            verifiedOnly ? "border-[#86EFAC] bg-[#DCFCE7] text-[#166534] dark:border-[#166534] dark:bg-[#14532D] dark:text-[#BBF7D0]" : "border-[var(--color-line-2)] bg-[var(--color-surface)] text-[color:var(--color-ink-2)] hover:bg-[var(--color-surface-hover)]",
          )}
        >
          <BadgeCheck className="h-4 w-4" strokeWidth={2} aria-hidden />
          Only ID-verified
        </button>
        <Button
          variant={selecting ? "soft" : "ghost"}
          icon={<GitCompareArrows className="h-4 w-4" strokeWidth={1.75} />}
          onClick={() => {
            setSelecting((s) => !s);
            setSelected([]);
          }}
          className="sm:ml-auto"
        >
          {selecting ? "Cancel compare" : "Compare applicants"}
        </Button>
      </div>
      {selecting && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[16px] bg-[var(--color-primary-soft)] px-4 py-3">
          <p className="text-[14px] text-[color:var(--color-ink)]">Choose two or three applicants for the same home.</p>
          <Button size="sm" disabled={selected.length < 2} onClick={() => setComparing(true)}>
            Compare {selected.length || ""}
          </Button>
        </div>
      )}
      {list.length ? (
        <div className="flex flex-col gap-3">
          {list.map((a) =>
            selecting ? (
              <div key={a.id} className="flex items-center gap-3">
                <Checkbox
                  checked={selected.includes(a.id)}
                  onChange={(v) => {
                    if (v && selected.length >= 3) return toast.info("Compare up to three at a time.");
                    setSelected(v ? [...selected, a.id] : selected.filter((x) => x !== a.id));
                  }}
                  label={<span className="sr-only">Select {a.person?.name}</span>}
                />
                <div className="min-w-0 flex-1">
                  <ApplicationCard app={a} side="owner" />
                </div>
              </div>
            ) : (
              <ApplicationCard key={a.id} app={a} side="owner" />
            ),
          )}
        </div>
      ) : (
        <EmptyState compact title="Nothing here" body={verifiedOnly ? "No ID-verified applicants here yet. Turn off \"Only ID-verified\" to see everyone." : needle || home ? "No applications match that search." : tab === "new" ? "You're all caught up." : "Applications move here as you make decisions."} />
      )}
      <ApplicantCompare open={comparing} ids={selected} onClose={() => setComparing(false)} />
    </div>
  );
}

export default function Applications() {
  const { role } = useHub();
  const { data, error, loading, refetch } = useHubQuery<{ role: string; applications: ApplicationSummary[] }>("/hub/applications");
  const owner = role === "owner";
  return (
    <HubShell title="Applications">
      <PageHeader
        title="Applications"
        description={owner ? "Review applicants fairly: every decision is yours, then Migrent checks it before anything is final." : "Every application you've started or sent, and exactly where each one is."}
      />
      <div className="flex flex-col gap-12">
        {error ? (
          <ErrorState message={error.message} offline={error.offline} onRetry={() => void refetch()} />
        ) : loading || !data ? (
          <RowSkeleton rows={4} />
        ) : owner ? (
          <OwnerApplications apps={data.applications} />
        ) : (
          <RenterApplications apps={data.applications} />
        )}
        <StayRequests />
      </div>
    </HubShell>
  );
}
