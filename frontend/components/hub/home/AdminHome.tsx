import { ArrowRight, BadgeCheck, Flag, HandHeart, Inbox, ListChecks, ShieldCheck, Siren } from "lucide-react";
import { useHubQuery } from "../../../lib/hub/query";
import { firstName, greeting } from "../../../lib/hub/format";
import { useHub } from "../../../lib/hub/session";
import HubLink from "../HubLink";
import { ErrorState, Skeleton } from "../ui/Feedback";
import { Reveal } from "../ui/Layout";

interface Overview {
  final_reviews: number;
  open_reports: number;
  listings_in_review: number;
  id_checks_waiting: number;
  /** Absent on a server older than the mentor review queue. */
  mentors_waiting?: number;
  open_emergencies: number;
  tickets_waiting: number;
  accounts: number;
  approved_listings: number;
}

const QUEUES = [
  { key: "listings_in_review", label: "Listings to moderate", body: "New listings, and anything the spam check flagged.", icon: ListChecks, to: "/admin/listings" },
  { key: "id_checks_waiting", label: "ID checks waiting", body: "Hosts and mentors who uploaded an identity document.", icon: BadgeCheck, to: "/admin/id-checks" },
  { key: "mentors_waiting", label: "Mentors to review", body: "Mentor sign-ups waiting to be read and approved.", icon: HandHeart, to: "/admin/mentors" },
  { key: "final_reviews", label: "Final application reviews", body: "Owner-approved applications waiting for Migrent.", icon: ShieldCheck, to: "/admin/reviews" },
  { key: "open_reports", label: "Open reports", body: "Listings, people and messages reported by users.", icon: Flag, to: "/admin/reports" },
  { key: "tickets_waiting", label: "Support tickets to answer", body: "Questions sent from the help button.", icon: Inbox, to: "/admin/support" },
  { key: "open_emergencies", label: "Open emergency repairs", body: "Emergency repairs where work has not started yet.", icon: Siren, to: "/admin/reports?tab=emergencies" },
] as const;

/** What is waiting on Migrent, with a way into each queue. */
export default function AdminHome() {
  const { me } = useHub();
  const { data, error, refetch } = useHubQuery<Overview>("/hub/admin/overview");
  if (error) return <ErrorState message={error.message} onRetry={() => void refetch()} />;
  return (
    <div className="flex flex-col">
      <Reveal className="flex flex-col gap-2 pb-8">
        <h1 className="hub-display text-[32px] leading-[1.1] text-[color:var(--color-ink)] sm:text-[36px]">
          {greeting()}
          {me?.name ? `, ${firstName(me.name)}` : ""}.
        </h1>
        <p className="text-[15.5px] text-[color:var(--color-ink-2)]">
          What is waiting on Migrent right now.
          {data ? ` ${data.accounts.toLocaleString("en-AU")} accounts and ${data.approved_listings.toLocaleString("en-AU")} approved listings so far.` : ""}
        </p>
      </Reveal>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {QUEUES.map((q) => (
          <HubLink
            key={q.key}
            to={q.to}
            className="hub-lift group flex min-h-[148px] flex-col justify-between gap-4 rounded-[20px] border border-[var(--color-line)] bg-[var(--color-surface)] p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
          >
            <div className="flex items-start justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[var(--color-primary-soft)] text-[color:var(--color-primary)]">
                <q.icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
              </span>
              {data ? <span className="text-[30px] font-semibold tabular-nums text-[color:var(--color-ink)]">{data[q.key] ?? 0}</span> : <Skeleton className="h-8 w-10" />}
            </div>
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-[15px] font-semibold text-[color:var(--color-ink)]">{q.label}</p>
                <p className="text-[13.5px] text-[color:var(--color-ink-2)]">{q.body}</p>
              </div>
              <ArrowRight className="h-5 w-5 shrink-0 text-[color:var(--color-ink-3)] transition-transform group-hover:translate-x-1" strokeWidth={1.75} aria-hidden />
            </div>
          </HubLink>
        ))}
      </div>
    </div>
  );
}
