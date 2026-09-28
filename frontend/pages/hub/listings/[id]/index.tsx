import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Archive, CalendarClock, CalendarPlus, Copy, ExternalLink, FileText, Link2, MoreHorizontal, Pause, Pencil, Play, Send, ShieldCheck } from "lucide-react";
import HubShell from "../../../../components/hub/HubShell";
import { useHubNavigate } from "../../../../components/hub/HubLink";
import { FUNNEL_STEPS } from "../../../../components/hub/owner/FunnelTable";
import { Button, ButtonLink, IconButton } from "../../../../components/hub/ui/Button";
import { CardSkeleton, EmptyState, ErrorState, InlineAlert, StatusBadge } from "../../../../components/hub/ui/Feedback";
import { Field, Input, Switch } from "../../../../components/hub/ui/Field";
import { Fact, PageHeader, Panel, Section } from "../../../../components/hub/ui/Layout";
import { HomeImage } from "../../../../components/hub/ui/Media";
import { Dialog, Menu } from "../../../../components/hub/ui/Overlay";
import { useToast } from "../../../../components/ui/Toast";
import { hubApi, HubError } from "../../../../lib/hub/api";
import { day, placeTypeLabel, propertyTypeLabel, weekly } from "../../../../lib/hub/format";
import { invalidate, setQueryData, useHubQuery } from "../../../../lib/hub/query";
import { siteUrl } from "../../../../lib/hub/routes";
import type { OwnerListing } from "../../../../lib/hub/types";
import { supabase } from "../../../../lib/supabase";

function isoPlusDays(n: number, from?: string | null) {
  const base = from ? new Date(`${from}T12:00:00`) : new Date();
  const now = new Date();
  const d = base < now ? now : base;
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function RenewDialog({ l, open, onClose, onDone }: { l: OwnerListing; open: boolean; onClose: () => void; onDone: () => void }) {
  const toast = useToast();
  const [to, setTo] = useState(isoPlusDays(60, l.available_to));
  const [busy, setBusy] = useState(false);
  const live = l.moderation_status === "approved" && l.public_state === "published";

  async function save() {
    setBusy(true);
    try {
      const res = await hubApi.post<{ moderation_status: string }>(`/listings/${l.id}/renew`, { available_to: to });
      onDone();
      onClose();
      toast.success(res.moderation_status === "pending_approval" ? "Sent for review" : "Dates extended", { description: res.moderation_status === "pending_approval" ? "Migrent checks listings that have been offline before they go live again." : undefined });
    } catch (e) {
      toast.error(e instanceof HubError ? e.message : "That didn't save.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={live ? "Keep it open longer" : "Renew the listing"}
      description={live ? "The listing stays live." : "It goes back through a quick review before it's live again."}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={busy} disabled={!to} onClick={() => void save()}>
            {live ? "Extend" : "Renew"}
          </Button>
        </>
      }
    >
      <Field label="Open until" hint="Up to 18 months ahead.">
        {({ id, describedBy }) => <Input id={id} type="date" value={to} min={isoPlusDays(0)} onChange={(e) => setTo(e.target.value)} aria-describedby={describedBy} />}
      </Field>
    </Dialog>
  );
}

function ArchiveDialog({ l, open, onClose, onDone }: { l: OwnerListing; open: boolean; onClose: () => void; onDone: () => void }) {
  const toast = useToast();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [emailUser, setEmailUser] = useState<boolean | null>(null);

  useEffect(() => {
    if (!open) return;
    let alive = true;
    supabase.auth.getUser().then(({ data }) => {
      if (alive) setEmailUser(((data.user?.app_metadata?.provider as string | undefined) ?? "email") === "email");
    });
    return () => {
      alive = false;
    };
  }, [open]);

  async function archive() {
    setBusy(true);
    try {
      await hubApi.del(`/listings/${l.id}`, emailUser ? { password } : { oauth_confirmed: true });
      onDone();
      toast.success("Listing archived");
    } catch (e) {
      toast.error(e instanceof HubError ? e.message : "That didn't archive.");
      setBusy(false);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Archive this listing?"
      description="It comes off Migrent for good, and anyone who saved it sees it's no longer available. Applications and messages are kept. To take it down for a while instead, pause it."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" loading={busy} disabled={emailUser === null || (emailUser && !password)} onClick={() => void archive()}>
            Archive listing
          </Button>
        </>
      }
    >
      {emailUser && (
        <Field label="Your password" hint="To confirm it's you.">
          {({ id, describedBy }) => <Input id={id} type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} aria-describedby={describedBy} />}
        </Field>
      )}
    </Dialog>
  );
}

function OccupancyCard({ l, onChange }: { l: OwnerListing; onChange: (patch: Partial<OwnerListing>) => void }) {
  const toast = useToast();
  const occupied = l.occupancy === "occupied";
  const [until, setUntil] = useState(l.occupied_until ?? "");

  async function save(next: "occupied" | "vacant", date?: string) {
    try {
      const res = await hubApi.post<{ occupancy: "occupied" | "vacant"; occupied_until: string | null }>(`/hub/listings/${l.id}/occupancy`, { occupancy: next, occupied_until: date || undefined });
      onChange({ occupancy: res.occupancy, occupied_until: res.occupied_until });
    } catch (e) {
      toast.error(e instanceof HubError ? e.message : "That didn't save.");
    }
  }

  return (
    <Panel className="flex flex-col gap-4">
      <Switch checked={occupied} onChange={(v) => void save(v ? "occupied" : "vacant", until)} label="Someone lives here now" description="Occupied listings don't show in search. Tenancies finalised through Migrent set this for you." />
      {occupied && (
        <Field label="Until" optional hint="When it's free again, if you know.">
          {({ id, describedBy }) => <Input id={id} type="date" value={until} onChange={(e) => setUntil(e.target.value)} onBlur={() => until !== (l.occupied_until ?? "") && void save("occupied", until)} aria-describedby={describedBy} />}
        </Field>
      )}
    </Panel>
  );
}

export default function ListingPage() {
  const router = useRouter();
  const navigate = useHubNavigate();
  const toast = useToast();
  const id = typeof router.query.id === "string" ? router.query.id : null;
  const key = id ? `/hub/listings/${id}` : null;
  const { data, error, refetch } = useHubQuery<{ listing: OwnerListing }>(key);
  const [busy, setBusy] = useState<string | null>(null);
  const [renewing, setRenewing] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const l = data?.listing;

  const refresh = () => {
    invalidate("/hub/properties");
    invalidate("/hub/home");
    void refetch();
  };

  async function act(action: "submit" | "pause" | "resume", done: string) {
    if (!l) return;
    setBusy(action);
    try {
      await hubApi.post(`/listings/${l.id}/${action}`, {});
      refresh();
      toast.success(done);
    } catch (e) {
      toast.error(e instanceof HubError ? e.message : "That didn't go through.");
    } finally {
      setBusy(null);
    }
  }

  async function duplicate() {
    if (!l) return;
    try {
      const res = await hubApi.post<{ draft: { id: string } }>("/hub/listing-drafts", { from_listing_id: l.id });
      void navigate(`/properties/new?draft=${res.draft.id}&step=space`);
    } catch (e) {
      toast.error(e instanceof HubError ? e.message : "That didn't copy.");
    }
  }

  async function copyLink() {
    if (!l) return;
    const href = siteUrl(`/listing/${l.id}`);
    const url = href.startsWith("http") ? href : `${window.location.origin}${href}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    } catch {
      toast.info(url);
    }
  }

  if (error) {
    return (
      <HubShell title="Listing">
        <PageHeader title="Listing" back={{ to: "/properties", label: "Properties" }} />
        {error.status === 404 ? <EmptyState title="Listing not found" body="It may have been archived, or it belongs to a different account." /> : <ErrorState message={error.message} offline={error.offline} onRetry={() => void refetch()} />}
      </HubShell>
    );
  }
  if (!l) {
    return (
      <HubShell title="Listing">
        <CardSkeleton />
      </HubShell>
    );
  }

  const s = l.moderation_status;
  const live = s === "approved" && l.public_state === "published";
  const expired = s === "expired" || (s === "approved" && l.public_state === "expired");
  const perf = l.performance.totals;
  const title = l.title || "Untitled listing";

  const status = (() => {
    if (s === "draft")
      return l.owner_verified
        ? { tone: "info" as const, title: "Not sent yet", body: "It's saved as a draft. Send it for review when it's ready.", action: <Button loading={busy === "submit"} icon={<Send className="h-4 w-4" strokeWidth={1.9} />} onClick={() => void act("submit", "Sent for review")}>Send for review</Button> }
        : { tone: "info" as const, title: "Waiting for your ID check", body: "Migrent only publishes listings from owners whose ID has been checked. Once it's done, send this for review.", action: <ButtonLink to="/settings#verification" icon={<ShieldCheck className="h-4 w-4" strokeWidth={1.75} />}>Check my ID</ButtonLink> };
    if (s === "pending_approval") return { tone: "info" as const, title: "In review", body: "Migrent reviews every listing before it goes live, usually within a working day. We'll email you." };
    if (s === "changes_requested")
      return { tone: "warning" as const, title: "Changes requested", body: l.moderation_notes || "Migrent asked for a few changes before this can go live.", action: <div className="flex flex-wrap gap-2"><ButtonLink to={`/listings/${l.id}/edit`} variant="secondary" icon={<Pencil className="h-4 w-4" strokeWidth={1.75} />}>Edit listing</ButtonLink><Button loading={busy === "submit"} onClick={() => void act("submit", "Sent for review")}>Send for review again</Button></div> };
    if (s === "rejected") return { tone: "danger" as const, title: "Not approved", body: l.moderation_notes || l.moderation_reason || "This listing wasn't approved.", action: <ButtonLink to={`/listings/${l.id}/edit`} variant="secondary">Edit and try again</ButtonLink> };
    if (s === "paused") return { tone: "neutral" as const, title: "Paused", body: `Hidden from search${l.paused_at ? ` since ${day(l.paused_at)}` : ""}. Saved searches and links show it as unavailable.`, action: <Button loading={busy === "resume"} icon={<Play className="h-4 w-4" strokeWidth={1.9} />} onClick={() => void act("resume", "Listing is live again")}>Resume</Button> };
    if (expired) return { tone: "warning" as const, title: "Expired", body: `The dates ran out${l.available_to ? ` on ${day(l.available_to)}` : ""}. Renew to list it again.`, action: <Button icon={<CalendarPlus className="h-4 w-4" strokeWidth={1.75} />} onClick={() => setRenewing(true)}>Renew</Button> };
    if (live) return { tone: "success" as const, title: l.occupancy === "occupied" ? "Live, marked as occupied" : "Live on Migrent", body: l.available_to ? `Open until ${day(l.available_to)}.` : "Open with no end date.", action: undefined };
    return { tone: "warning" as const, title: "Under review by Migrent", body: "Something about this listing is being looked at. Contact support if you have questions." };
  })();

  return (
    <HubShell title={title}>
      <PageHeader
        eyebrow={l.unit_label || placeTypeLabel(l.place_type) || undefined}
        title={title}
        back={l.property_id ? { to: `/properties/${l.property_id}`, label: "Property" } : { to: "/properties", label: "Properties" }}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <StatusBadge tone={l.status.tone}>{l.status.label}</StatusBadge>
            <span className="text-[14px] text-[color:var(--color-ink-2)]">{l.street_address || l.display_address}</span>
          </span>
        }
        actions={
          <>
            <ButtonLink to={`/listings/${l.id}/edit`} variant="secondary" icon={<Pencil className="h-4 w-4" strokeWidth={1.75} />}>
              Edit
            </ButtonLink>
            <Menu
              label="Listing options"
              trigger={(t) => (
                <IconButton {...t} label="Listing options">
                  <MoreHorizontal className="h-5 w-5" strokeWidth={1.75} />
                </IconButton>
              )}
              items={[
                ...(live ? [{ label: "View on Migrent", icon: <ExternalLink className="h-4 w-4" strokeWidth={1.75} />, onSelect: () => window.open(siteUrl(`/listing/${l.id}`), "_blank", "noopener") }] : []),
                ...(live ? [{ label: "Copy link", icon: <Link2 className="h-4 w-4" strokeWidth={1.75} />, onSelect: () => void copyLink() }] : []),
                ...(live ? [{ label: "Keep it open longer", icon: <CalendarPlus className="h-4 w-4" strokeWidth={1.75} />, onSelect: () => setRenewing(true) }] : []),
                ...(live ? [{ label: "Pause listing", icon: <Pause className="h-4 w-4" strokeWidth={1.75} />, onSelect: () => void act("pause", "Listing paused") }] : []),
                { label: "Duplicate as a new listing", icon: <Copy className="h-4 w-4" strokeWidth={1.75} />, onSelect: () => void duplicate() },
                { label: "Archive listing", icon: <Archive className="h-4 w-4" strokeWidth={1.75} />, danger: true, onSelect: () => setArchiving(true) },
              ]}
            />
          </>
        }
      />

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex min-w-0 flex-col gap-10">
          <InlineAlert tone={status.tone === "neutral" ? "info" : status.tone} title={status.title} action={status.action}>
            {status.body}
          </InlineAlert>

          <div className="grid gap-3 sm:grid-cols-2">
            <ButtonLink to={`/applications?listing=${l.id}`} variant="secondary" block icon={<FileText className="h-4 w-4" strokeWidth={1.75} />}>
              {l.pending_applications ? `${l.pending_applications} application${l.pending_applications === 1 ? "" : "s"} to review` : "Applications"}
            </ButtonLink>
            <ButtonLink to={`/inspections?new=1&listing=${l.id}`} variant="secondary" block icon={<CalendarClock className="h-4 w-4" strokeWidth={1.75} />}>
              {l.upcoming_inspections ? `${l.upcoming_inspections} open time${l.upcoming_inspections === 1 ? "" : "s"} · add more` : "Open inspection times"}
            </ButtonLink>
          </div>

          <Section title="Last 30 days" description={l.performance.tracking_since ? `Counted since ${day(l.performance.tracking_since)}. Your own visits aren't counted.` : "Nothing recorded yet. Activity appears once the listing is live."}>
            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {FUNNEL_STEPS.map((f) => (
                <div key={f.key} className="rounded-[16px] border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-3">
                  <dt className="text-[12.5px] text-[color:var(--color-ink-3)]">{f.label}</dt>
                  <dd className="text-[22px] font-semibold tabular-nums tracking-[-0.02em] text-[color:var(--color-ink)]">{perf[f.key as keyof typeof perf] ?? 0}</dd>
                </div>
              ))}
            </dl>
            {perf.view > 0 && <p className="text-[13px] text-[color:var(--color-ink-3)]">{perf.unique_views} different people viewed it.</p>}
          </Section>

          <Section title="The listing" action={<ButtonLink to={`/listings/${l.id}/edit`} variant="ghost" size="sm">Edit</ButtonLink>}>
            <Panel className="flex flex-col gap-5">
              {(l.images ?? []).length > 0 && (
                <div className="hub-scroll-x -mx-1 flex gap-2 overflow-x-auto px-1">
                  {(l.images ?? []).map((src, i) => (
                    <HomeImage key={src} src={src} alt={`Photo ${i + 1}`} className="h-24 w-36 shrink-0" rounded="rounded-[12px]" sizes="144px" />
                  ))}
                </div>
              )}
              <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <Fact label="Rent" value={weekly(l.weekly_price)} />
                <Fact label="Kind" value={[propertyTypeLabel(l.property_type), placeTypeLabel(l.place_type)].filter(Boolean).join(" · ") || "-"} />
                <Fact label="Available" value={l.available_from ? `From ${day(l.available_from)}` : "-"} />
                {l.bedrooms != null && <Fact label="Bedrooms" value={l.bedrooms} />}
                {l.bathrooms != null && <Fact label="Bathrooms" value={l.bathrooms} />}
                {l.bond && <Fact label="Bond" value={l.bond} />}
              </dl>
              {l.description && <p className="line-clamp-6 whitespace-pre-wrap text-[14.5px] leading-relaxed text-[color:var(--color-ink-2)]">{l.description}</p>}
            </Panel>
          </Section>
        </div>

        <aside className="flex flex-col gap-5 lg:sticky lg:top-10 lg:self-start">
          <OccupancyCard l={l} onChange={(patch) => setQueryData<{ listing: OwnerListing }>(key!, (prev) => (prev ? { listing: { ...prev.listing, ...patch } } : prev!))} />
          <Panel padded={false} className="overflow-hidden">
            <HomeImage src={l.images?.[0] ?? null} alt="" className="aspect-[4/3] w-full" rounded="rounded-none" sizes="340px" />
            <div className="p-4 text-[13px] leading-relaxed text-[color:var(--color-ink-3)]">Renters see {l.display_address} and an approximate area on the map. The street address is shared once they book an inspection.</div>
          </Panel>
        </aside>
      </div>

      <RenewDialog l={l} open={renewing} onClose={() => setRenewing(false)} onDone={refresh} />
      <ArchiveDialog
        l={l}
        open={archiving}
        onClose={() => setArchiving(false)}
        onDone={() => {
          setArchiving(false);
          invalidate("/hub/properties");
          invalidate("/hub/home");
          void navigate(l.property_id ? `/properties/${l.property_id}` : "/properties");
        }}
      />
    </HubShell>
  );
}
