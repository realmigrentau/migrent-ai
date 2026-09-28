import { ArrowRight, BadgeCheck, Flag, ListChecks, ShieldCheck, Siren } from "lucide-react";
import { useHubQuery } from "../../../lib/hub/query";
import { firstName, greeting } from "../../../lib/hub/format";
import { siteUrl } from "../../../lib/hub/routes";
import { useHub } from "../../../lib/hub/session";
import HubLink from "../HubLink";
import { ErrorState, Skeleton } from "../ui/Feedback";
import { Reveal } from "../ui/Layout";

interface Overview {
  final_reviews: number;
  open_reports: number;
  listings_in_review: number;
  id_checks_waiting: number;
  open_emergencies: number;
}

/** What is waiting on Migrent, with a way into each queue. */
export default function AdminHome() {
  const { me } = useHub();
  const { data, error, refetch } = useHubQuery<Overview>("/hub/admin/overview");
  if (error) return <ErrorState message={error.message} onRetry={() => void refetch()} />;
  const queues = [
    { key: "final_reviews", label: "Final application reviews", body: "Owner-approved applications waiting for Migrent.", icon: ShieldCheck, to: "/admin/reviews", internal: true },
    { key: "open_reports", label: "Open reports", body: "Listings, people and messages reported by users.", icon: Flag, to: "/admin/reports", internal: true },
    { key: "listings_in_review", label: "Listings to moderate", body: "New and edited listings in the moderation queue.", icon: ListChecks, to: siteUrl("/admin/moderation"), internal: false },
    { key: "id_checks_waiting", label: "ID checks waiting", body: "Owners who uploaded identity documents.", icon: BadgeCheck, to: siteUrl("/admin/verification"), internal: false },
    { key: "open_emergencies", label: "Open emergency repairs", body: "Emergency repairs where work has not started yet.", icon: Siren, to: "/admin/reports?tab=emergencies", internal: true },
  ] as const;
  return (
    <div className="flex flex-col">
      <Reveal className="flex flex-col gap-2 pb-8">
        <h1 className="hub-display text-[32px] leading-[1.1] text-[color:var(--color-ink)] sm:text-[36px]">
          {greeting()}
          {me?.name ? `, ${firstName(me.name)}` : ""}.
        </h1>
        <p className="text-[15.5px] text-[color:var(--color-ink-2)]">What is waiting on Migrent right now.</p>
      </Reveal>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {queues.map((q) => {
          const value = data?.[q.key as keyof Overview];
          const inner = (
            <>
              <div className="flex items-start justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[var(--color-primary-soft)] text-[color:var(--color-primary)]">
                  <q.icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                </span>
                {data ? <span className="text-[30px] font-semibold tabular-nums text-[color:var(--color-ink)]">{value}</span> : <Skeleton className="h-8 w-10" />}
              </div>
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-[15px] font-semibold text-[color:var(--color-ink)]">{q.label}</p>
                  <p className="text-[13.5px] text-[color:var(--color-ink-2)]">{q.body}</p>
                </div>
                <ArrowRight className="h-5 w-5 shrink-0 text-[color:var(--color-ink-3)] transition-transform group-hover:translate-x-1" strokeWidth={1.75} aria-hidden />
              </div>
            </>
          );
          const cls = "hub-lift group flex min-h-[148px] flex-col justify-between gap-4 rounded-[20px] border border-[var(--color-line)] bg-[var(--color-surface)] p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]";
          return q.internal ? (
            <HubLink key={q.key} to={q.to} className={cls}>
              {inner}
            </HubLink>
          ) : (
            <a key={q.key} href={q.to} className={cls}>
              {inner}
            </a>
          );
        })}
      </div>
    </div>
  );
}
