import { AlertTriangle, ArrowRight, BadgeCheck, Building2, CalendarDays, ClipboardCheck, FilePenLine, KeyRound, Plus, Wrench } from "lucide-react";
import { cn } from "../../../lib/cn";
import { firstName, greeting, plural, whenLabel, day } from "../../../lib/hub/format";
import { useHubQuery } from "../../../lib/hub/query";
import { siteUrl } from "../../../lib/hub/routes";
import type { NextAction, OwnerHome as OwnerHomeData, PropertySummary } from "../../../lib/hub/types";
import { useHub } from "../../../lib/hub/session";
import HubLink from "../HubLink";
import { ApplicationCard, ThreadRow } from "../cards";
import { ButtonLink } from "../ui/Button";
import { ErrorState, Skeleton } from "../ui/Feedback";
import { HomeImage } from "../ui/Media";
import { Panel, Reveal, Section, TextLink } from "../ui/Layout";

const ATTENTION_ICON: Record<string, typeof Wrench> = {
  verification: BadgeCheck,
  listing: FilePenLine,
  applications: ClipboardCheck,
  maintenance: Wrench,
  tenancy: KeyRound,
  draft: FilePenLine,
};

const toneRing: Record<string, string> = {
  danger: "bg-[var(--color-danger-50)] text-[color:var(--color-danger-600)] dark:text-[color:var(--color-danger-500)]",
  warning: "bg-[var(--color-warn-50)] text-[color:var(--color-warn-600)] dark:text-[color:var(--color-warn-500)]",
  info: "bg-[var(--color-primary-soft)] text-[color:var(--color-primary)]",
  neutral: "bg-[var(--color-surface-muted)] text-[color:var(--color-ink-2)]",
  success: "bg-[var(--color-success-50)] text-[color:var(--color-success-600)]",
};

function AttentionRow({ item }: { item: NextAction }) {
  const Icon = ATTENTION_ICON[item.kind] ?? AlertTriangle;
  return (
    <HubLink to={item.href} className="group flex items-center gap-4 rounded-[16px] p-3 transition-colors hover:bg-[var(--color-surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]">
      <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px]", toneRing[item.tone] ?? toneRing.neutral)}>
        <Icon className="h-[18px] w-[18px]" strokeWidth={1.9} aria-hidden />
      </span>
      <div className="flex min-w-0 flex-1 flex-col">
        <p className="text-[14.5px] font-semibold text-[color:var(--color-ink)]">{item.title}</p>
        {item.body && <p className="line-clamp-1 text-[13.5px] text-[color:var(--color-ink-2)]">{item.body}</p>}
      </div>
      <ArrowRight className="h-4 w-4 shrink-0 text-[color:var(--color-ink-4)] transition-transform group-hover:translate-x-0.5" strokeWidth={1.75} aria-hidden />
    </HubLink>
  );
}

/**
 * Portfolio at a glance, drawn as one bar rather than six tiles: how many
 * units are occupied, available, in review or still drafts.
 */
function PortfolioBar({ data }: { data: OwnerHomeData }) {
  const t = data.portfolio.totals;
  const units = t.units || 0;
  const inReview = [...data.portfolio.properties.flatMap((p) => p.units), ...data.portfolio.unassigned].filter((u) => ["pending_approval", "changes_requested", "flagged", "hidden"].includes(u.moderation_status ?? "")).length;
  const segments = [
    { key: "occupied", label: "Occupied", value: t.occupied, cls: "bg-[var(--color-ink)] dark:bg-[var(--color-ink-2)]" },
    { key: "available", label: "Available", value: t.available, cls: "bg-[var(--color-primary)]" },
    { key: "review", label: "In review", value: inReview, cls: "bg-[var(--color-sky-300)]" },
    { key: "draft", label: "Drafts", value: t.drafts, cls: "bg-[var(--color-line-2)]" },
  ];
  const other = Math.max(0, units - segments.reduce((s, x) => s + x.value, 0));
  return (
    <Panel className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[color:var(--color-ink-3)]">Portfolio</p>
          <p className="mt-1 text-[22px] font-semibold tracking-[-0.02em] text-[color:var(--color-ink)]">
            {plural(t.properties, "property", "properties")} · {plural(units, "unit")}
          </p>
        </div>
        <div className="flex gap-6">
          <HubLink to="/applications" className="flex flex-col rounded-[10px]">
            <span className="text-[22px] font-semibold tabular-nums text-[color:var(--color-ink)]">{t.applications}</span>
            <span className="text-[13px] text-[color:var(--color-ink-3)]">applications waiting</span>
          </HubLink>
          <HubLink to="/inspections" className="flex flex-col rounded-[10px]">
            <span className="text-[22px] font-semibold tabular-nums text-[color:var(--color-ink)]">{t.inspections}</span>
            <span className="text-[13px] text-[color:var(--color-ink-3)]">upcoming inspections</span>
          </HubLink>
        </div>
      </div>
      {units > 0 && (
        <>
          <div className="flex h-3 w-full gap-1 overflow-hidden rounded-full" role="img" aria-label={segments.map((s) => `${s.value} ${s.label.toLowerCase()}`).join(", ")}>
            {segments
              .filter((s) => s.value > 0)
              .map((s) => (
                <span key={s.key} className={cn("h-full rounded-full transition-[flex-grow] duration-700", s.cls)} style={{ flexGrow: s.value }} />
              ))}
            {other > 0 && <span className="h-full rounded-full bg-[var(--color-surface-muted)]" style={{ flexGrow: other }} />}
          </div>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {segments.map((s) => (
              <li key={s.key} className="flex items-center gap-2 text-[13.5px] text-[color:var(--color-ink-2)]">
                <span aria-hidden className={cn("h-2.5 w-2.5 rounded-full", s.cls)} />
                <span className="font-semibold tabular-nums text-[color:var(--color-ink)]">{s.value}</span> {s.label.toLowerCase()}
              </li>
            ))}
          </ul>
        </>
      )}
    </Panel>
  );
}

export function PropertyTile({ p }: { p: PropertySummary }) {
  const name = p.nickname || p.street_address;
  return (
    <HubLink to={`/properties/${p.id}`} className="hub-lift hub-card-link group flex flex-col overflow-hidden rounded-[22px] border border-[var(--color-line)] bg-[var(--color-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]">
      <HomeImage src={p.cover_image} alt={name} className="aspect-[16/10]" rounded="rounded-none" sizes="(max-width: 640px) 90vw, 380px" />
      <div className="flex flex-col gap-3 p-4">
        <div>
          <p className="truncate text-[15.5px] font-semibold text-[color:var(--color-ink)]">{name}</p>
          <p className="truncate text-[13.5px] text-[color:var(--color-ink-2)]">{[p.suburb, p.state, p.postcode].filter(Boolean).join(" ")}</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {p.units.slice(0, 4).map((u) => (
            <span
              key={u.id}
              className={cn(
                "inline-flex h-6 items-center gap-1.5 rounded-full px-2 text-[12px] font-semibold",
                u.status?.tone === "success" ? "bg-[var(--color-success-50)] text-[color:var(--color-success-600)] dark:text-[color:var(--color-success-500)]" : u.status?.tone === "warning" ? "bg-[var(--color-warn-50)] text-[color:var(--color-warn-600)] dark:text-[color:var(--color-warn-500)]" : u.status?.tone === "info" ? "bg-[var(--color-primary-soft)] text-[color:var(--color-primary)]" : "bg-[var(--color-surface-muted)] text-[color:var(--color-ink-2)]",
              )}
            >
              {u.unit_label || (p.units.length === 1 ? "Whole place" : "Unit")}: {u.status?.label}
            </span>
          ))}
          {p.units.length > 4 && <span className="text-[12px] font-semibold text-[color:var(--color-ink-3)]">+{p.units.length - 4} more</span>}
          {p.units.length === 0 && <span className="text-[13px] text-[color:var(--color-ink-3)]">No listings yet</span>}
        </div>
      </div>
    </HubLink>
  );
}

export default function OwnerHome() {
  const { me } = useHub();
  const { data, error, refetch } = useHubQuery<OwnerHomeData>("/hub/home");
  const name = firstName(me?.name);

  if (error) return <ErrorState message={error.message} offline={error.offline} onRetry={() => void refetch()} />;
  if (!data) {
    return (
      <div role="status" aria-busy="true" className="flex flex-col gap-8">
        <span className="sr-only">Loading your portfolio</span>
        <Skeleton className="h-10 w-80 max-w-full" />
        <Skeleton className="h-36 rounded-[22px]" />
        <div className="grid gap-5 sm:grid-cols-3">
          <Skeleton className="h-60 rounded-[22px]" />
          <Skeleton className="h-60 rounded-[22px]" />
          <Skeleton className="h-60 rounded-[22px]" />
        </div>
      </div>
    );
  }

  const t = data.portfolio.totals;
  const empty = t.units === 0 && data.drafts === 0;

  return (
    <div className="flex flex-col">
      <Reveal className="flex flex-col gap-4 pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="hub-display text-[32px] leading-[1.1] text-[color:var(--color-ink)] sm:text-[36px]">
            {greeting()}
            {name ? `, ${name}` : ""}.
          </h1>
          <p className="text-[15.5px] text-[color:var(--color-ink-2)]">
            {empty
              ? "Let's get your first property listed."
              : data.attention.length
                ? `${plural(data.attention.length, "thing")} to look at today.`
                : "Everything in your portfolio is up to date."}
          </p>
        </div>
        <ButtonLink to="/properties/new" icon={<Plus className="h-5 w-5" strokeWidth={1.9} />} className="hidden sm:inline-flex">
          List a property
        </ButtonLink>
      </Reveal>

      {empty ? (
        <Reveal delay={0.05}>
          <div className="overflow-hidden rounded-[24px] border border-[var(--color-line)] bg-[var(--color-surface)]">
            <div className="grid items-center gap-8 p-6 sm:p-10 lg:grid-cols-[1.2fr_1fr]">
              <div className="flex flex-col gap-5">
                <h2 className="text-[28px] font-semibold leading-tight tracking-[-0.02em] text-[color:var(--color-ink)]">List your first property.</h2>
                <p className="max-w-[480px] text-[15.5px] leading-relaxed text-[color:var(--color-ink-2)]">
                  A whole home or a single room. The listing saves as you go, you can preview it exactly as renters will see it, and nothing goes live until it has been reviewed.
                </p>
                <div className="flex flex-wrap gap-3">
                  <ButtonLink to="/properties/new" size="lg" icon={<Plus className="h-5 w-5" strokeWidth={1.9} />}>
                    Create a listing
                  </ButtonLink>
                  <ButtonLink to={siteUrl("/for-owners")} external size="lg" variant="secondary">
                    How Migrent works
                  </ButtonLink>
                </div>
              </div>
              <ul className="flex flex-col gap-3">
                {[
                  { icon: Building2, t: "Properties and rooms", b: "One property, as many rentable rooms as it has." },
                  { icon: CalendarDays, t: "Inspections", b: "Open times; renters book themselves in." },
                  { icon: ClipboardCheck, t: "Applications", b: "Compare applicants side by side, fairly." },
                  { icon: KeyRound, t: "Tenancies", b: "Rent record and repairs once someone moves in." },
                ].map((s) => (
                  <li key={s.t} className="flex items-start gap-3 rounded-[16px] bg-[var(--color-surface-muted)] p-4">
                    <s.icon className="mt-0.5 h-5 w-5 shrink-0 text-[color:var(--color-primary)]" strokeWidth={1.75} aria-hidden />
                    <span className="flex flex-col">
                      <span className="text-[14.5px] font-semibold text-[color:var(--color-ink)]">{s.t}</span>
                      <span className="text-[13px] text-[color:var(--color-ink-2)]">{s.b}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      ) : (
        <Reveal delay={0.05}>
          <PortfolioBar data={data} />
        </Reveal>
      )}

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex min-w-0 flex-col gap-12">
          {data.attention.length > 0 && (
            <Section title="Needs your attention">
              <Panel padded={false} className="p-2">
                {data.attention.map((a, i) => (
                  <AttentionRow key={`${a.kind}-${i}`} item={a} />
                ))}
              </Panel>
            </Section>
          )}

          {data.portfolio.properties.length > 0 && (
            <Section title="Properties" action={<TextLink to="/properties">All properties</TextLink>}>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {data.portfolio.properties.slice(0, 6).map((p) => (
                  <PropertyTile key={p.id} p={p} />
                ))}
              </div>
            </Section>
          )}

          {data.applications.length > 0 && (
            <Section title="Applications to review" action={<TextLink to="/applications">All applications</TextLink>}>
              <div className="flex flex-col gap-3">
                {data.applications.map((a) => (
                  <ApplicationCard key={a.id} app={a} side="owner" />
                ))}
              </div>
            </Section>
          )}
        </div>

        <aside className="flex flex-col gap-6">
          <Panel>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[16px] font-semibold text-[color:var(--color-ink)]">Upcoming inspections</h2>
              <TextLink to="/inspections" className="text-[13.5px]">
                Manage
              </TextLink>
            </div>
            {data.inspections.length ? (
              <ul className="flex flex-col gap-3">
                {data.inspections.slice(0, 4).map((s) => (
                  <li key={s.id} className="flex items-center gap-3">
                    <span className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-[12px] bg-[var(--color-primary-soft)] text-[color:var(--color-primary)]">
                      <CalendarDays className="h-4 w-4" strokeWidth={1.9} aria-hidden />
                    </span>
                    <div className="flex min-w-0 flex-col">
                      <p className="text-[14px] font-semibold text-[color:var(--color-ink)]">{whenLabel(s.starts_at, s.listing?.timezone)}</p>
                      <p className="truncate text-[13px] text-[color:var(--color-ink-2)]">
                        {s.listing?.unit_label ? `${s.listing.unit_label} · ` : ""}
                        {s.listing?.title} · {s.booked}/{s.capacity} booked
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[13.5px] leading-relaxed text-[color:var(--color-ink-3)]">No inspection times open. Open a few and renters can book themselves in.</p>
            )}
          </Panel>

          <Panel padded={false}>
            <div className="flex items-center justify-between px-5 pb-2 pt-5">
              <h2 className="text-[16px] font-semibold text-[color:var(--color-ink)]">Messages</h2>
              <TextLink to="/messages" className="text-[13.5px]">
                Inbox
              </TextLink>
            </div>
            <div className="flex flex-col px-2 pb-2">
              {data.messages.length ? (
                data.messages.map((th) => <ThreadRow key={th.key} thread={th} />)
              ) : (
                <p className="px-3 pb-4 pt-1 text-[13.5px] text-[color:var(--color-ink-3)]">Enquiries about your homes arrive here, each with the home it is about.</p>
              )}
            </div>
          </Panel>

          <Panel>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[16px] font-semibold text-[color:var(--color-ink)]">Last 30 days</h2>
              <TextLink to="/insights" className="text-[13.5px]">
                Insights
              </TextLink>
            </div>
            {data.insights.tracking_since ? (
              <dl className="grid grid-cols-2 gap-4">
                {(
                  [
                    ["view", "Listing views"],
                    ["save", "Saves"],
                    ["enquiry", "Enquiries"],
                    ["application_submitted", "Applications"],
                  ] as const
                ).map(([k, label]) => (
                  <div key={k}>
                    <dt className="text-[12.5px] text-[color:var(--color-ink-3)]">{label}</dt>
                    <dd className="text-[20px] font-semibold tabular-nums text-[color:var(--color-ink)]">{data.insights.totals[k] ?? 0}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="text-[13.5px] leading-relaxed text-[color:var(--color-ink-3)]">Views, saves and enquiries are counted from the day a listing goes live. Nothing is estimated.</p>
            )}
            {data.insights.tracking_since && <p className="mt-3 text-[12px] text-[color:var(--color-ink-4)]">Counting since {day(data.insights.tracking_since)}</p>}
          </Panel>
        </aside>
      </div>
    </div>
  );
}
