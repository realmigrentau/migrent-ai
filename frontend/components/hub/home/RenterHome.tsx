import { ArrowRight, CalendarDays, Compass, FileText, Heart, KeyRound, MessageCircle, Sparkles, UserRound, Wrench } from "lucide-react";
import { cn } from "../../../lib/cn";
import { firstName, greeting, perFrequency, whenLabel, day } from "../../../lib/hub/format";
import { useHubQuery } from "../../../lib/hub/query";
import type { NextAction, RenterHome as RenterHomeData } from "../../../lib/hub/types";
import { useHub } from "../../../lib/hub/session";
import HubLink from "../HubLink";
import { ApplicationCard, CardRail, HomeCard, InspectionCard, ThreadRow } from "../cards";
import { ButtonLink } from "../ui/Button";
import { CardSkeleton, EmptyState, ErrorState, ProgressRing, Skeleton } from "../ui/Feedback";
import { HomeImage } from "../ui/Media";
import { Panel, Reveal, Section, TextLink } from "../ui/Layout";

const ACTION_ICON: Record<string, typeof Compass> = {
  inspection: CalendarDays,
  application: FileText,
  messages: MessageCircle,
  profile: UserRound,
};

function NextActionCard({ action, lead }: { action: NextAction; lead?: boolean }) {
  const Icon = ACTION_ICON[action.kind] ?? Sparkles;
  const body = action.kind === "inspection" && action.starts_at ? `${whenLabel(action.starts_at, action.timezone)} · ${action.body ?? ""}` : action.body;
  return (
    <HubLink
      to={action.href}
      className={cn(
        "hub-lift group relative flex min-h-[112px] flex-col justify-between gap-4 overflow-hidden rounded-[20px] border p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]",
        lead ? "border-transparent bg-[var(--color-primary)] text-[color:var(--color-primary-fg)]" : "border-[var(--color-line)] bg-[var(--color-surface)]",
      )}
    >
      <span className={cn("flex h-9 w-9 items-center justify-center rounded-[11px]", lead ? "bg-white/18" : action.tone === "warning" ? "bg-[var(--color-warn-50)] text-[color:var(--color-warn-600)] dark:text-[color:var(--color-warn-500)]" : "bg-[var(--color-primary-soft)] text-[color:var(--color-primary)]")}>
        <Icon className="h-[18px] w-[18px]" strokeWidth={1.9} aria-hidden />
      </span>
      <div className="flex items-end justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <p className={cn("text-[15.5px] font-semibold leading-snug", lead ? "" : "text-[color:var(--color-ink)]")}>{action.title}</p>
          {body && <p className={cn("line-clamp-2 text-[13.5px]", lead ? "text-[color:var(--color-primary-fg)]" : "text-[color:var(--color-ink-2)]")}>{body}</p>}
        </div>
        <ArrowRight className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1" strokeWidth={1.75} aria-hidden />
      </div>
    </HubLink>
  );
}

function Greeting({ name, line }: { name: string; line: string }) {
  return (
    <Reveal className="flex flex-col gap-2 pb-8">
      <h1 className="hub-display text-[32px] leading-[1.1] text-[color:var(--color-ink)] sm:text-[36px]">
        {greeting()}
        {name ? `, ${name}` : ""}.
      </h1>
      <p className="max-w-[620px] text-[15.5px] text-[color:var(--color-ink-2)]">{line}</p>
    </Reveal>
  );
}

export default function RenterHome() {
  const { me } = useHub();
  const { data, error, refetch } = useHubQuery<RenterHomeData>("/hub/home");
  const name = firstName(me?.name);

  if (error) return <ErrorState message={error.message} offline={error.offline} onRetry={() => void refetch()} />;
  if (!data) {
    return (
      <div role="status" aria-busy="true" className="flex flex-col gap-8">
        <span className="sr-only">Loading your Hub</span>
        <Skeleton className="h-10 w-80 max-w-full" />
        <div className="grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-28 rounded-[20px]" />
          <Skeleton className="h-28 rounded-[20px]" />
          <Skeleton className="h-28 rounded-[20px]" />
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  const lead = data.applications.find((a) => a.status !== "draft");
  const line = data.tenancy
    ? `Everything for ${data.tenancy.listing?.title ?? "your home"} is here.`
    : lead
      ? `Your application for ${lead.listing?.title ?? "a home"} is ${lead.status === "migrent_review" ? "in Migrent's final review" : lead.status === "finalised" ? "finalised" : lead.status === "changes_requested" ? "waiting on you" : "with the owner"}.`
      : data.inspections[0]
        ? `Inspection ${whenLabel(data.inspections[0].slot.starts_at, data.inspections[0].listing?.timezone).toLowerCase()}.`
        : "Ready to find your next place?";

  const newcomer = !data.has_activity && !data.tenancy;

  return (
    <div className="flex flex-col">
      <Greeting name={name} line={line} />

      {newcomer ? (
        <Reveal delay={0.05}>
          <div className="relative overflow-hidden rounded-[24px] border border-[var(--color-line)] bg-[var(--color-surface)]">
            <div className="grid items-center gap-8 p-6 sm:p-10 lg:grid-cols-[1.1fr_1fr]">
              <div className="flex flex-col gap-5">
                <h2 className="text-[26px] font-semibold leading-tight tracking-[-0.02em] text-[color:var(--color-ink)] sm:text-[30px]">Find a place that feels right.</h2>
                <p className="max-w-[460px] text-[15.5px] leading-relaxed text-[color:var(--color-ink-2)]">
                  Search homes and rooms from ID-checked owners, save the ones you like, and apply with one Rental Profile - you fill it in once and reuse it for every application.
                </p>
                <div className="flex flex-wrap gap-3">
                  <ButtonLink to="/discover" size="lg" icon={<Compass className="h-5 w-5" strokeWidth={1.75} />}>
                    Explore homes
                  </ButtonLink>
                  <ButtonLink to="/profile" size="lg" variant="secondary">
                    Complete your Rental Profile
                  </ButtonLink>
                </div>
              </div>
              <ol className="grid gap-3 sm:grid-cols-2">
                {[
                  { n: 1, t: "Save homes", b: "Tap the heart on anything you like." },
                  { n: 2, t: "Book an inspection", b: "Pick a time the owner has opened." },
                  { n: 3, t: "Apply once", b: "Your Rental Profile fills in the form." },
                  { n: 4, t: "Track every step", b: "See exactly where your application is." },
                ].map((s) => (
                  <li key={s.n} className="flex gap-3 rounded-[16px] bg-[var(--color-surface-muted)] p-4">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-[13px] font-bold text-[color:var(--color-primary-fg)]">{s.n}</span>
                    <span className="flex flex-col">
                      <span className="text-[14.5px] font-semibold text-[color:var(--color-ink)]">{s.t}</span>
                      <span className="text-[13px] text-[color:var(--color-ink-2)]">{s.b}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </Reveal>
      ) : (
        data.next_actions.length > 0 && (
          <Reveal delay={0.05} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.next_actions.slice(0, 3).map((a, i) => (
              <NextActionCard key={`${a.kind}-${i}`} action={a} lead={i === 0} />
            ))}
          </Reveal>
        )
      )}

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex min-w-0 flex-col gap-12">
          {data.tenancy && (
            <Section title="Your home" action={<TextLink to="/my-home">Open</TextLink>}>
              <HubLink to="/my-home" className="hub-lift flex flex-col overflow-hidden rounded-[22px] border border-[var(--color-line)] bg-[var(--color-surface)] sm:flex-row">
                <HomeImage src={data.tenancy.listing?.image} alt="" className="aspect-[16/9] sm:aspect-auto sm:w-[42%]" rounded="rounded-none" />
                <div className="flex flex-1 flex-col gap-4 p-5">
                  <div>
                    <p className="text-[17px] font-semibold text-[color:var(--color-ink)]">{data.tenancy.listing?.title}</p>
                    <p className="text-[14px] text-[color:var(--color-ink-2)]">{data.tenancy.listing?.street_address ?? data.tenancy.listing?.display_address}</p>
                  </div>
                  <dl className="grid grid-cols-2 gap-4 text-[14px]">
                    <div>
                      <dt className="text-[12.5px] text-[color:var(--color-ink-3)]">Rent</dt>
                      <dd className="font-semibold text-[color:var(--color-ink)]">{perFrequency(data.tenancy.rent_amount, data.tenancy.rent_frequency)}</dd>
                    </div>
                    <div>
                      <dt className="text-[12.5px] text-[color:var(--color-ink-3)]">{data.tenancy.status === "upcoming" ? "Starts" : "Next rent due"}</dt>
                      <dd className="font-semibold text-[color:var(--color-ink)]">{data.tenancy.status === "upcoming" ? day(data.tenancy.start_date) : data.tenancy.next_payment ? day(data.tenancy.next_payment.due_date) : "Not scheduled"}</dd>
                    </div>
                  </dl>
                  <div className="mt-auto flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-[color:var(--color-primary)]">
                      <Wrench className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                      {data.tenancy.open_maintenance ? `${data.tenancy.open_maintenance} open request${data.tenancy.open_maintenance === 1 ? "" : "s"}` : "Report a repair"}
                    </span>
                  </div>
                </div>
              </HubLink>
            </Section>
          )}

          {data.applications.length > 0 && (
            <Section title="Applications" action={<TextLink to="/applications">All applications</TextLink>}>
              <div className="flex flex-col gap-3">
                {data.applications.slice(0, 3).map((a) => (
                  <ApplicationCard key={a.id} app={a} />
                ))}
              </div>
            </Section>
          )}

          {data.inspections.length > 0 && (
            <Section title="Upcoming inspections" action={<TextLink to="/inspections">All inspections</TextLink>}>
              <div className="grid gap-4 sm:grid-cols-2">
                {data.inspections.slice(0, 2).map((b) => (
                  <InspectionCard key={b.id} booking={b} />
                ))}
              </div>
            </Section>
          )}

          {data.saved.length > 0 && (
            <Section title="Saved homes" action={<TextLink to="/saved">All saved</TextLink>}>
              <CardRail>
                {data.saved.slice(0, 6).map((l) => (
                  <HomeCard key={l.id} listing={l} />
                ))}
              </CardRail>
            </Section>
          )}

          <Section
            title={data.saved.length || data.applications.length ? "You might also like" : "Homes to start with"}
            description="Picked from your budget, suburbs and saved searches. Nothing is ranked by anything else."
            action={<TextLink to="/discover">Explore</TextLink>}
          >
            {data.recommended.length ? (
              <CardRail>
                {data.recommended.slice(0, 6).map((l) => (
                  <HomeCard key={l.id} listing={l} />
                ))}
              </CardRail>
            ) : (
              <EmptyState
                icon={<Compass className="h-6 w-6" strokeWidth={1.75} />}
                title="No suggestions yet"
                body="Add a budget and a few suburbs to your Rental Profile, or save a search, and suggestions will appear here."
                action={<ButtonLink to="/discover">Explore homes</ButtonLink>}
                compact
              />
            )}
          </Section>
        </div>

        <aside className="flex flex-col gap-6">
          {!data.completion.complete && (
            <Panel>
              <div className="flex items-start gap-4">
                <ProgressRing value={data.completion.percent} label="Rental Profile complete" />
                <div className="flex flex-col gap-1">
                  <h2 className="text-[16px] font-semibold text-[color:var(--color-ink)]">Your Rental Profile</h2>
                  <p className="text-[13.5px] leading-snug text-[color:var(--color-ink-2)]">Owners see this when you apply. Fill it in once.</p>
                </div>
              </div>
              <ul className="mt-4 flex flex-col gap-2">
                {data.completion.items
                  .filter((i) => !i.done)
                  .slice(0, 3)
                  .map((i) => (
                    <li key={i.key} className="flex items-center gap-2 text-[13.5px] text-[color:var(--color-ink-2)]">
                      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]" />
                      {i.label}
                    </li>
                  ))}
              </ul>
              <ButtonLink to="/profile" variant="soft" size="sm" className="mt-4" block>
                Continue
              </ButtonLink>
            </Panel>
          )}

          <Panel padded={false}>
            <div className="flex items-center justify-between px-5 pb-2 pt-5">
              <h2 className="text-[16px] font-semibold text-[color:var(--color-ink)]">Messages</h2>
              <TextLink to="/messages" className="text-[13.5px]">
                Inbox
              </TextLink>
            </div>
            <div className="flex flex-col px-2 pb-2">
              {data.messages.length ? (
                data.messages.map((t) => <ThreadRow key={t.key} thread={t} />)
              ) : (
                <p className="px-3 pb-4 pt-1 text-[13.5px] leading-relaxed text-[color:var(--color-ink-3)]">When you message an owner, the conversation lives here with the home it is about.</p>
              )}
            </div>
          </Panel>

          <Panel className="flex flex-col gap-3">
            <h2 className="text-[16px] font-semibold text-[color:var(--color-ink)]">Shortcuts</h2>
            <div className="grid grid-cols-2 gap-2">
              {[
                { to: "/saved?tab=searches", label: "Saved searches", icon: Heart },
                { to: "/inspections", label: "Inspections", icon: CalendarDays },
                { to: "/profile#documents", label: "Documents", icon: FileText },
                { to: data.tenancy ? "/my-home" : "/discover", label: data.tenancy ? "My home" : "Discover", icon: data.tenancy ? KeyRound : Compass },
              ].map((s) => (
                <HubLink key={s.to} to={s.to} className="flex flex-col gap-2 rounded-[14px] bg-[var(--color-surface-muted)] p-3 text-[13.5px] font-semibold text-[color:var(--color-ink)] transition-colors hover:bg-[var(--color-surface-hover)]">
                  <s.icon className="h-4 w-4 text-[color:var(--color-primary)]" strokeWidth={1.9} aria-hidden />
                  {s.label}
                </HubLink>
              ))}
            </div>
          </Panel>
        </aside>
      </div>
    </div>
  );
}
