import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/router";
import { BadgeCheck, CalendarDays, Check, GitCompareArrows, Minus, X } from "lucide-react";
import HubShell from "../../components/hub/HubShell";
import HubLink from "../../components/hub/HubLink";
import { kindLabel } from "../../components/hub/cards";
import { ButtonLink } from "../../components/hub/ui/Button";
import { EmptyState, ErrorState, Skeleton } from "../../components/hub/ui/Feedback";
import { PageHeader } from "../../components/hub/ui/Layout";
import { HomeImage } from "../../components/hub/ui/Media";
import { useCompare } from "../../lib/hub/compare";
import { day, weekly } from "../../lib/hub/format";
import { useHubQuery } from "../../lib/hub/query";
import type { ListingCard } from "../../lib/hub/types";

type CompareHome = ListingCard & {
  min_stay_weeks: number | null;
  internet_included: boolean | null;
  air_conditioning: boolean | null;
  laundry: string | null;
  dishwasher: boolean | null;
  station_distance_min: number | null;
  bond: string | null;
  host_verification: "verified" | "pending" | "unverified";
  upcoming_inspections: number;
};

function Yes({ value }: { value: boolean | null | undefined }) {
  if (value === null || value === undefined) return <span className="text-[color:var(--color-ink-4)]">Not stated</span>;
  return value ? (
    <span className="inline-flex items-center gap-1.5 font-semibold text-[color:var(--color-ink)]">
      <Check className="h-4 w-4 text-[color:var(--color-success-500)]" strokeWidth={2.2} aria-hidden />
      Yes
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 text-[color:var(--color-ink-3)]">
      <Minus className="h-4 w-4" strokeWidth={2} aria-hidden />
      No
    </span>
  );
}

/**
 * Up to four homes side by side, on the rows that actually separate them.
 * The cheapest rent is marked; nothing else is ranked.
 */
export default function Compare() {
  const router = useRouter();
  const compare = useCompare();
  const idsParam = typeof router.query.ids === "string" ? router.query.ids : "";
  const ids = idsParam ? idsParam.split(",").filter(Boolean).slice(0, 4) : compare.ids;
  const key = ids.length >= 2 ? `/hub/compare?ids=${ids.join(",")}` : null;
  const { data, error, loading, refetch } = useHubQuery<{ homes: CompareHome[] }>(key);

  // Keep the address in step with the tray, so the page can be shared.
  useEffect(() => {
    if (!router.isReady || idsParam || compare.ids.length < 2) return;
    void router.replace({ pathname: router.pathname, query: { ids: compare.ids.join(",") } }, `${router.asPath.split("?")[0]}?ids=${compare.ids.join(",")}`, { shallow: true });
  }, [router, idsParam, compare.ids]);

  if (!router.isReady) return <HubShell title="Compare">{null}</HubShell>;

  if (ids.length < 2) {
    return (
      <HubShell title="Compare">
        <PageHeader title="Compare homes" back={{ to: "/saved", label: "Saved" }} />
        <EmptyState
          icon={<GitCompareArrows className="h-6 w-6" strokeWidth={1.75} />}
          title="Choose at least two homes"
          body="Tap Compare on a home in Saved or on its page. You can compare up to four."
          action={<ButtonLink to="/saved">Go to Saved</ButtonLink>}
        />
      </HubShell>
    );
  }

  const homes = data?.homes ?? [];
  const cheapest = homes.length ? Math.min(...homes.map((h) => h.weekly_price ?? Infinity)) : null;
  const rows: { label: string; render: (h: CompareHome) => ReactNode }[] = [
    { label: "Rent", render: (h) => <span className="font-bold text-[color:var(--color-ink)]">{weekly(h.weekly_price)}{h.weekly_price === cheapest && homes.length > 1 ? <span className="ml-2 rounded-full bg-[var(--color-success-50)] px-2 py-0.5 text-[11.5px] font-bold text-[color:var(--color-success-600)] dark:text-[color:var(--color-success-500)]">Lowest</span> : null}</span> },
    { label: "Bond", render: (h) => h.bond || <span className="text-[color:var(--color-ink-4)]">Not stated</span> },
    { label: "Where", render: (h) => h.display_address },
    { label: "Type", render: (h) => kindLabel(h) },
    { label: "Bedrooms", render: (h) => h.bedrooms ?? "-" },
    { label: "Bathrooms", render: (h) => h.bathrooms ?? "-" },
    { label: "Available", render: (h) => (h.available_from && h.available_from > new Date().toISOString().slice(0, 10) ? day(h.available_from) : "Now") },
    { label: "Minimum stay", render: (h) => (h.min_stay_weeks ? `${h.min_stay_weeks} weeks` : "Not stated") },
    { label: "Furnished", render: (h) => <Yes value={h.furnished} /> },
    { label: "Bills included", render: (h) => <Yes value={h.bills_included} /> },
    { label: "Internet", render: (h) => <Yes value={h.internet_included} /> },
    { label: "Air conditioning", render: (h) => <Yes value={h.air_conditioning} /> },
    { label: "Parking", render: (h) => <Yes value={h.parking} /> },
    { label: "Pets", render: (h) => <Yes value={h.pets_allowed} /> },
    { label: "Station", render: (h) => (h.station_distance_min ? `${h.station_distance_min} min walk` : h.nearest_transport || "Not stated") },
    {
      label: "Owner ID check",
      render: (h) =>
        h.host_verification === "verified" ? (
          <span className="inline-flex items-center gap-1.5 font-semibold text-[color:var(--color-trust)]">
            <BadgeCheck className="h-4 w-4" strokeWidth={1.9} aria-hidden />
            Checked
          </span>
        ) : (
          <span className="text-[color:var(--color-ink-3)]">{h.host_verification === "pending" ? "In progress" : "Not yet"}</span>
        ),
    },
    {
      label: "Inspections",
      render: (h) => (
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays className="h-4 w-4 text-[color:var(--color-ink-3)]" strokeWidth={1.75} aria-hidden />
          {h.upcoming_inspections ? `${h.upcoming_inspections} time${h.upcoming_inspections === 1 ? "" : "s"} open` : "None open"}
        </span>
      ),
    },
  ];

  return (
    <HubShell title="Compare">
      <PageHeader title="Compare homes" description="The details that tell them apart. Nothing here is ranked except the rent." back={{ to: "/saved", label: "Saved" }} />
      {error ? (
        <ErrorState message={error.message} offline={error.offline} onRetry={() => void refetch()} />
      ) : loading || !data ? (
        <div className="grid grid-cols-2 gap-5 lg:grid-cols-4" aria-busy="true">
          {ids.map((id) => (
            <Skeleton key={id} className="h-72 rounded-[20px]" />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[22px] border border-[var(--color-line)] bg-[var(--color-surface)]">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <caption className="sr-only">Comparison of {homes.length} homes</caption>
            <thead>
              <tr>
                <th scope="col" className="w-[160px] p-4 align-bottom text-[12.5px] font-semibold uppercase tracking-[0.06em] text-[color:var(--color-ink-3)]">
                  <span className="sr-only">Detail</span>
                </th>
                {homes.map((h) => (
                  <th key={h.id} scope="col" className="min-w-[180px] p-4 align-top">
                    <div className="flex flex-col gap-3">
                      <div className="relative">
                        <HomeImage src={h.image} alt="" className="aspect-[4/3] w-full" rounded="rounded-[14px]" sizes="260px" />
                        <button
                          type="button"
                          aria-label={`Remove ${h.title} from comparison`}
                          onClick={() => {
                            compare.remove(h.id);
                            const next = ids.filter((x) => x !== h.id);
                            void router.replace({ pathname: router.pathname, query: next.length ? { ids: next.join(",") } : {} }, `${router.asPath.split("?")[0]}${next.length ? `?ids=${next.join(",")}` : ""}`, { shallow: true });
                          }}
                          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-glass)] text-[color:var(--color-ink)] backdrop-blur hover:bg-[var(--color-surface)]"
                        >
                          <X className="h-4 w-4" strokeWidth={2} />
                        </button>
                      </div>
                      <HubLink to={`/homes/${h.id}`} className="line-clamp-2 text-[15px] font-semibold text-[color:var(--color-ink)] hover:underline">
                        {h.title}
                      </HubLink>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.label} className={i % 2 ? "" : "bg-[var(--color-surface-cool)]"}>
                  <th scope="row" className="p-4 text-[13.5px] font-medium text-[color:var(--color-ink-3)]">
                    {r.label}
                  </th>
                  {homes.map((h) => (
                    <td key={h.id} className="p-4 text-[14.5px] text-[color:var(--color-ink-2)]">
                      {r.render(h)}
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                <th scope="row" className="p-4">
                  <span className="sr-only">Next step</span>
                </th>
                {homes.map((h) => (
                  <td key={h.id} className="p-4">
                    <ButtonLink to={`/homes/${h.id}`} variant="secondary" size="sm" block>
                      View home
                    </ButtonLink>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </HubShell>
  );
}
