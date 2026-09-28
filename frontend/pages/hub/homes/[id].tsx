import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import {
  AirVent,
  BadgeCheck,
  Bath,
  BedDouble,
  CalendarDays,
  Car,
  Check,
  Flag,
  GitCompareArrows,
  Images,
  Info,
  MapPin,
  MessageCircle,
  PawPrint,
  Share2,
  Shirt,
  Sofa,
  TrainFront,
  Wifi,
  Zap,
} from "lucide-react";
import HubShell from "../../../components/hub/HubShell";
import HubLink, { useHubNavigate } from "../../../components/hub/HubLink";
import InspectionPicker from "../../../components/hub/listing/InspectionPicker";
import EnquiryDialog from "../../../components/hub/listing/EnquiryDialog";
import ReportDialog from "../../../components/hub/ReportDialog";
import { CardRail, HomeCard, kindLabel, SaveButton } from "../../../components/hub/cards";
import { Button, ButtonLink } from "../../../components/hub/ui/Button";
import { EmptyState, ErrorState, InlineAlert, Skeleton, StatusBadge } from "../../../components/hub/ui/Feedback";
import { Avatar, HomeImage } from "../../../components/hub/ui/Media";
import { Dialog } from "../../../components/hub/ui/Overlay";
import { Panel, Section } from "../../../components/hub/ui/Layout";
import { useToast } from "../../../components/ui/Toast";
import { API_BASE_URL } from "../../../lib/apiBase";
import type { PublicListing } from "../../../lib/api";
import { accessToken, trackListingView } from "../../../lib/hub/api";
import { useCompare } from "../../../lib/hub/compare";
import { day, weekly } from "../../../lib/hub/format";
import { useSavedHomes } from "../../../lib/hub/saved";
import { useHub } from "../../../lib/hub/session";
import { siteUrl } from "../../../lib/hub/routes";
import { cn } from "../../../lib/cn";

type Load = { state: "loading" } | { state: "ready"; listing: PublicListing } | { state: "gone"; listing?: PublicListing } | { state: "missing" } | { state: "error"; offline: boolean };

function useListing(id: string | undefined) {
  const [load, setLoad] = useState<Load>({ state: "loading" });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!id) return;
    let alive = true;
    setLoad({ state: "loading" });
    (async () => {
      const token = await accessToken();
      try {
        const res = await fetch(`${API_BASE_URL}/listings/${encodeURIComponent(id)}?include=similar`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
        if (!alive) return;
        if (res.status === 404) return setLoad({ state: "missing" });
        if (res.status === 410) return setLoad({ state: "gone", listing: await res.json().catch(() => undefined) });
        if (!res.ok) return setLoad({ state: "error", offline: false });
        setLoad({ state: "ready", listing: await res.json() });
      } catch {
        if (alive) setLoad({ state: "error", offline: typeof navigator !== "undefined" && !navigator.onLine });
      }
    })();
    return () => {
      alive = false;
    };
  }, [id, attempt]);
  return { load, retry: () => setAttempt((a) => a + 1) };
}

function Amenity({ icon: Icon, label }: { icon: typeof Wifi; label: string }) {
  return (
    <li className="flex items-center gap-3 text-[14.5px] text-[color:var(--color-ink)]">
      <Icon className="h-5 w-5 shrink-0 text-[color:var(--color-ink-2)]" strokeWidth={1.6} aria-hidden />
      {label}
    </li>
  );
}

export default function HubHome() {
  const router = useRouter();
  const navigate = useHubNavigate();
  const toast = useToast();
  const { me, role } = useHub();
  const id = typeof router.query.id === "string" ? router.query.id : undefined;
  const { load, retry } = useListing(id);
  const compare = useCompare();
  const { toggle: toggleSaved, ids: savedIds } = useSavedHomes();
  const [photosOpen, setPhotosOpen] = useState(false);
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const handledIntent = useRef(false);
  const tracked = useRef(false);

  const listing = load.state === "ready" ? load.listing : null;
  const isOwner = Boolean(listing?.viewer?.is_owner);

  // Finish what the person was doing before they had to sign in.
  useEffect(() => {
    if (!listing || !router.isReady || handledIntent.current || !me) return;
    const intent = router.query.intent;
    if (!intent) return;
    handledIntent.current = true;
    if (intent === "save" && !savedIds.has(listing.id)) {
      void toggleSaved(listing.id, true).then(() => toast.success("Saved", { description: "It's in your Saved homes." })).catch(() => toast.error("That home could not be saved."));
    }
    if (intent === "message") setEnquiryOpen(true);
    if (intent === "inspect") document.getElementById("inspections")?.scrollIntoView({ behavior: "smooth" });
    if (intent === "apply") void navigate(`/apply/${listing.id}`, { replace: true });
    void router.replace({ pathname: router.pathname, query: { id: listing.id } }, router.asPath.split("?")[0], { shallow: true, scroll: false });
  }, [listing, router, me, savedIds, toggleSaved, toast, navigate]);

  useEffect(() => {
    if (listing && !tracked.current && !isOwner) {
      tracked.current = true;
      trackListingView(listing.id, "hub");
    }
  }, [listing, isOwner]);

  const share = async () => {
    const url = `${window.location.origin}${siteUrl(`/listing/${id}`)}`;
    try {
      if (navigator.share) await navigator.share({ title: listing?.title ?? "A home on Migrent", url });
      else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied");
      }
    } catch {
      /* dismissed */
    }
  };

  if (load.state === "loading") {
    return (
      <HubShell title="Home">
        <div className="flex flex-col gap-6" role="status" aria-busy="true">
          <span className="sr-only">Loading this home</span>
          <Skeleton className="aspect-[16/7] w-full rounded-[24px]" />
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      </HubShell>
    );
  }
  if (load.state === "error") {
    return (
      <HubShell title="Home">
        <ErrorState message="This home could not load. Check your connection and try again." offline={load.offline} onRetry={retry} />
      </HubShell>
    );
  }
  if (load.state === "missing" || load.state === "gone") {
    return (
      <HubShell title="Home">
        <EmptyState
          icon={<Info className="h-6 w-6" strokeWidth={1.75} />}
          title={load.state === "gone" ? "This listing has ended" : "This home isn't available"}
          body={load.state === "gone" ? "The owner is no longer taking enquiries for it. Similar homes are still out there." : "It may have been taken down or the link may be wrong."}
          action={<ButtonLink to="/discover">Find similar homes</ButtonLink>}
          secondary={<ButtonLink to="/saved" variant="secondary">Saved homes</ButtonLink>}
        />
      </HubShell>
    );
  }

  const l = listing!;
  const images = l.images ?? [];
  const card = {
    id: l.id,
    title: l.title || "Home",
    place_type: l.place_type === "private" ? "private_room" : l.place_type === "entire" ? "entire_place" : l.place_type,
    property_type: l.property_type,
  } as Parameters<typeof kindLabel>[0];
  const verified = l.host_verification?.status === "verified";
  const amenities: { icon: typeof Wifi; label: string }[] = [];
  if (l.furnished) amenities.push({ icon: Sofa, label: "Furnished" });
  if (l.bills_included) amenities.push({ icon: Zap, label: "Bills included" });
  if (l.internet_included) amenities.push({ icon: Wifi, label: l.internet_speed ? `Internet (${l.internet_speed})` : "Internet included" });
  if (l.air_conditioning) amenities.push({ icon: AirVent, label: "Air conditioning" });
  if (l.parking) amenities.push({ icon: Car, label: "Parking" });
  if (l.laundry) amenities.push({ icon: Shirt, label: l.laundry.length < 30 ? `Laundry: ${l.laundry}` : "Laundry" });
  if (l.pets_allowed) amenities.push({ icon: PawPrint, label: "Pets considered" });
  for (const h of (l.highlights ?? []).slice(0, 6)) amenities.push({ icon: Check, label: h });

  const canApply = !isOwner && role !== "owner" && l.public_state === "published";

  const actions = (
    <div className="flex flex-col gap-2.5">
      {isOwner ? (
        <ButtonLink to={`/listings/${l.id}`} size="lg" block>
          Manage this listing
        </ButtonLink>
      ) : (
        <>
          {canApply && (
            <ButtonLink to={`/apply/${l.id}`} size="lg" block>
              Apply for this home
            </ButtonLink>
          )}
          <Button variant="secondary" size="lg" block icon={<MessageCircle className="h-5 w-5" strokeWidth={1.75} />} onClick={() => setEnquiryOpen(true)}>
            Message the owner
          </Button>
          <Button variant="ghost" block icon={<CalendarDays className="h-5 w-5" strokeWidth={1.75} />} onClick={() => document.getElementById("inspections")?.scrollIntoView({ behavior: "smooth" })}>
            See inspection times
          </Button>
        </>
      )}
      {role === "owner" && !isOwner && <p className="text-center text-[12.5px] text-[color:var(--color-ink-3)]">Applications are made from a renter account.</p>}
    </div>
  );

  return (
    <HubShell title={l.title || "Home"}>
      <div className="flex flex-col gap-8 pb-24 lg:pb-0">
        <div className="flex items-center justify-between gap-3">
          <HubLink to="/discover" className="text-[13.5px] font-medium text-[color:var(--color-ink-3)] hover:text-[color:var(--color-ink)]">
            ← Back to Discover
          </HubLink>
          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="sm" icon={<Share2 className="h-4 w-4" strokeWidth={1.75} />} onClick={() => void share()}>
              Share
            </Button>
            {!isOwner && (
              <Button
                variant="ghost"
                size="sm"
                aria-pressed={compare.has(l.id)}
                icon={<GitCompareArrows className="h-4 w-4" strokeWidth={1.75} />}
                onClick={() => {
                  if (!compare.has(l.id) && compare.full) return toast.info("You can compare up to four homes. Remove one first.");
                  compare.toggle(l.id);
                }}
              >
                {compare.has(l.id) ? "Comparing" : "Compare"}
              </Button>
            )}
            {!isOwner && <SaveButton listingId={l.id} title={l.title || "this home"} tone="plain" />}
          </div>
        </div>

        {isOwner && (
          <InlineAlert tone="info" title="This is your listing" action={<ButtonLink to={`/listings/${l.id}`} size="sm" variant="secondary">Manage it</ButtonLink>}>
            You're seeing it as renters do.
          </InlineAlert>
        )}

        {/* Gallery */}
        <div className="relative">
          <div className="hidden gap-2 overflow-hidden rounded-[24px] sm:grid sm:grid-cols-4 sm:grid-rows-2" style={{ height: "clamp(320px, 42vw, 520px)" }}>
            <button type="button" onClick={() => setPhotosOpen(true)} className="col-span-2 row-span-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-primary)]" aria-label="Open photo 1">
              <HomeImage src={images[0]} alt={l.title || "Home"} className="h-full w-full" rounded="rounded-none" priority sizes="(max-width: 1200px) 60vw, 700px" />
            </button>
            {[1, 2, 3, 4].map((i) => (
              <button key={i} type="button" onClick={() => setPhotosOpen(true)} className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-primary)]" aria-label={`Open photo ${i + 1}`}>
                <HomeImage src={images[i]} alt="" className="h-full w-full" rounded="rounded-none" sizes="300px" />
              </button>
            ))}
          </div>
          <div className="hub-scroll-x -mx-4 flex gap-2 overflow-x-auto px-4 sm:hidden">
            {(images.length ? images : [null]).map((src, i) => (
              <HomeImage key={i} src={src} alt={i === 0 ? l.title || "Home" : ""} className="aspect-[4/3] w-[88%] shrink-0" priority={i === 0} sizes="90vw" />
            ))}
          </div>
          {images.length > 1 && (
            <span className="absolute bottom-4 right-4 hidden sm:block">
              <Button variant="secondary" size="sm" icon={<Images className="h-4 w-4" strokeWidth={1.75} />} onClick={() => setPhotosOpen(true)}>
              All {images.length} photos
            </Button>
            </span>
          )}
        </div>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="flex min-w-0 flex-col gap-10">
            <header className="flex flex-col gap-3">
              <p className="text-[13.5px] font-semibold text-[color:var(--color-primary)]">{kindLabel(card)}</p>
              <h1 className="text-[28px] font-semibold leading-tight tracking-[-0.02em] text-[color:var(--color-ink)] sm:text-[32px]">{l.title}</h1>
              <p className="flex items-center gap-1.5 text-[15px] text-[color:var(--color-ink-2)]">
                <MapPin className="h-4 w-4 text-[color:var(--color-ink-3)]" strokeWidth={1.75} aria-hidden />
                {l.display_address}
              </p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {l.bedrooms ? <li className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-surface-muted)] px-3 py-1.5 text-[13.5px] font-medium text-[color:var(--color-ink)]"><BedDouble className="h-4 w-4" strokeWidth={1.75} aria-hidden />{l.bedrooms} bedroom{l.bedrooms === 1 ? "" : "s"}</li> : null}
                {l.bathrooms ? <li className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-surface-muted)] px-3 py-1.5 text-[13.5px] font-medium text-[color:var(--color-ink)]"><Bath className="h-4 w-4" strokeWidth={1.75} aria-hidden />{l.bathrooms} bathroom{l.bathrooms === 1 ? "" : "s"}{l.bathroom_type ? ` (${l.bathroom_type})` : ""}</li> : null}
                {l.parking ? <li className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-surface-muted)] px-3 py-1.5 text-[13.5px] font-medium text-[color:var(--color-ink)]"><Car className="h-4 w-4" strokeWidth={1.75} aria-hidden />Parking</li> : null}
                {l.nearest_transport ? <li className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-surface-muted)] px-3 py-1.5 text-[13.5px] font-medium text-[color:var(--color-ink)]"><TrainFront className="h-4 w-4" strokeWidth={1.75} aria-hidden />{l.nearest_transport}</li> : null}
              </ul>
            </header>

            {l.description && (
              <Section title="About this home">
                <p className="whitespace-pre-line text-[15.5px] leading-[1.7] text-[color:var(--color-ink-2)]">{l.description}</p>
              </Section>
            )}

            {amenities.length > 0 && (
              <Section title="What's included">
                <ul className="grid gap-4 sm:grid-cols-2">
                  {amenities.map((a) => (
                    <Amenity key={a.label} icon={a.icon} label={a.label} />
                  ))}
                </ul>
              </Section>
            )}

            {(l.who_else_lives_here || l.no_smoking || l.quiet_hours || l.tenant_prefs || l.min_stay_weeks) && (
              <Section title="Living here">
                <dl className="grid gap-4 sm:grid-cols-2">
                  {l.who_else_lives_here && (
                    <div>
                      <dt className="text-[13px] text-[color:var(--color-ink-3)]">Who else lives here</dt>
                      <dd className="text-[15px] text-[color:var(--color-ink)]">{l.who_else_lives_here}{l.total_other_people ? ` (${l.total_other_people})` : ""}</dd>
                    </div>
                  )}
                  {l.min_stay_weeks ? (
                    <div>
                      <dt className="text-[13px] text-[color:var(--color-ink-3)]">Minimum stay</dt>
                      <dd className="text-[15px] text-[color:var(--color-ink)]">{l.min_stay_weeks >= 52 ? `${Math.round(l.min_stay_weeks / 52)} year` : `${l.min_stay_weeks} weeks`}</dd>
                    </div>
                  ) : null}
                  {l.no_smoking && (
                    <div>
                      <dt className="text-[13px] text-[color:var(--color-ink-3)]">Smoking</dt>
                      <dd className="text-[15px] text-[color:var(--color-ink)]">Not inside the home</dd>
                    </div>
                  )}
                  {l.quiet_hours && (
                    <div>
                      <dt className="text-[13px] text-[color:var(--color-ink-3)]">Quiet hours</dt>
                      <dd className="text-[15px] text-[color:var(--color-ink)]">{l.quiet_hours}</dd>
                    </div>
                  )}
                  {l.tenant_prefs && (
                    <div className="sm:col-span-2">
                      <dt className="text-[13px] text-[color:var(--color-ink-3)]">From the owner</dt>
                      <dd className="text-[15px] text-[color:var(--color-ink)]">{l.tenant_prefs}</dd>
                    </div>
                  )}
                </dl>
                {(l.security_cameras || l.other_safety_details) && (
                  <InlineAlert tone="neutral" title="Safety disclosures">
                    {l.security_cameras ? `Security cameras: ${l.security_cameras_location || "disclosed by the owner"}. ` : ""}
                    {l.other_safety_details ?? ""}
                  </InlineAlert>
                )}
              </Section>
            )}

            <Section id="inspections" title="Inspection times" className="scroll-mt-24">
              <InspectionPicker listingId={l.id} title={l.title || "Home"} isOwner={isOwner} />
            </Section>

            <Section title="Where it is">
              <Panel className="flex flex-col gap-2">
                <p className="text-[15px] font-semibold text-[color:var(--color-ink)]">{l.display_address}</p>
                <p className="text-[14px] leading-relaxed text-[color:var(--color-ink-2)]">
                  The exact address is shared with you when you book an inspection. Until then, the map shows the area within about 400 metres.
                </p>
                {l.suburb && (
                  <a href={siteUrl(`/suburbs?q=${encodeURIComponent(l.suburb)}`)} className="text-[14px] font-semibold text-[color:var(--color-primary)] hover:underline">
                    About {l.suburb}
                  </a>
                )}
              </Panel>
            </Section>

            {l.owner && (
              <Section title={isOwner ? "How renters see you" : "Your host"}>
                <Panel className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  <Avatar name={l.owner.name} src={l.owner.avatar_url} size={56} />
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-[16px] font-semibold text-[color:var(--color-ink)]">{l.owner.name}</p>
                      {verified ? <StatusBadge tone="info">ID checked</StatusBadge> : <StatusBadge tone="neutral" icon={false}>ID not checked yet</StatusBadge>}
                    </div>
                    {l.owner.member_since && <p className="text-[13.5px] text-[color:var(--color-ink-3)]">On Migrent since {day(l.owner.member_since)}</p>}
                    {l.owner.bio && <p className="text-[14.5px] leading-relaxed text-[color:var(--color-ink-2)]">{l.owner.bio}</p>}
                    <p className="flex items-start gap-2 text-[12.5px] leading-snug text-[color:var(--color-ink-3)]">
                      <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
                      <span>
                        {l.host_verification?.disclaimer}{" "}
                        <a href={siteUrl(l.host_verification?.explainer_url || "/safety-verification")} className="font-semibold text-[color:var(--color-primary)] hover:underline">
                          What we check
                        </a>
                      </span>
                    </p>
                  </div>
                </Panel>
              </Section>
            )}

            {!isOwner && (
              <button type="button" onClick={() => setReportOpen(true)} className="inline-flex w-fit items-center gap-2 rounded-[8px] text-[13.5px] font-medium text-[color:var(--color-ink-3)] hover:text-[color:var(--color-ink)]">
                <Flag className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                Report this listing
              </button>
            )}
          </div>

          {/* Sticky action card */}
          <aside className="hidden lg:block">
            <div className="sticky top-10 flex flex-col gap-5 rounded-[22px] border border-[var(--color-line)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-card)]">
              <div>
                <p className="text-[28px] font-bold tracking-[-0.02em] text-[color:var(--color-ink)]">{weekly(l.weekly_price)}</p>
                {l.bond && <p className="text-[13.5px] text-[color:var(--color-ink-3)]">Bond: {l.bond}</p>}
              </div>
              <dl className="grid grid-cols-2 gap-3 rounded-[14px] bg-[var(--color-surface-muted)] p-3.5 text-[13.5px]">
                <div>
                  <dt className="text-[color:var(--color-ink-3)]">Available</dt>
                  <dd className="font-semibold text-[color:var(--color-ink)]">{l.available_from && l.available_from > new Date().toISOString().slice(0, 10) ? day(l.available_from, { year: false }) : "Now"}</dd>
                </div>
                <div>
                  <dt className="text-[color:var(--color-ink-3)]">Listed until</dt>
                  <dd className="font-semibold text-[color:var(--color-ink)]">{l.available_to ? day(l.available_to, { year: false }) : "Open"}</dd>
                </div>
              </dl>
              {actions}
              <p className="text-[12.5px] leading-snug text-[color:var(--color-ink-3)]">Renters pay Migrent nothing. Never pay rent or a deposit before you have inspected and signed.</p>
            </div>
          </aside>
        </div>

        {(l.similar_listings?.length ?? 0) > 0 && (
          <Section title="Similar homes">
            <CardRail>
              {l.similar_listings!.slice(0, 3).map((s) => (
                <HomeCard
                  key={s.id}
                  listing={{ id: s.id, title: s.title || "Home", suburb: s.suburb ?? null, city: s.city ?? null, postcode: s.postcode ?? null, state: null, timezone: "Australia/Sydney", display_address: s.display_address, weekly_price: s.weekly_price, image: s.images?.[0] ?? null, images: s.images ?? [], property_type: s.property_type ?? null, place_type: s.place_type ?? null, bedrooms: s.bedrooms ?? null, bathrooms: s.bathrooms ?? null, parking: s.parking ?? null, furnished: s.furnished ?? null, bills_included: s.bills_included ?? null, pets_allowed: s.pets_allowed ?? null, available_from: s.available_from ?? null, available_to: s.available_to ?? null, public_state: s.public_state, unit_label: null, listing_purpose: "long_term" }}
                />
              ))}
            </CardRail>
          </Section>
        )}
      </div>

      {/* Phone action bar */}
      <div className="fixed inset-x-0 bottom-[calc(84px+env(safe-area-inset-bottom))] z-30 px-3 lg:hidden">
        <div className="flex items-center justify-between gap-3 rounded-[20px] border border-[var(--color-glass-line)] bg-[var(--color-glass)] px-4 py-3 shadow-[var(--shadow-pop)] backdrop-blur-xl">
          <div>
            <p className="text-[17px] font-bold text-[color:var(--color-ink)]">{weekly(l.weekly_price)}</p>
            <button type="button" onClick={() => setEnquiryOpen(true)} className={cn("text-[13px] font-semibold text-[color:var(--color-primary)]", isOwner && "hidden")}>
              Message the owner
            </button>
          </div>
          {isOwner ? (
            <ButtonLink to={`/listings/${l.id}`}>Manage</ButtonLink>
          ) : canApply ? (
            <ButtonLink to={`/apply/${l.id}`}>Apply</ButtonLink>
          ) : (
            <Button onClick={() => document.getElementById("inspections")?.scrollIntoView({ behavior: "smooth" })}>Inspections</Button>
          )}
        </div>
      </div>

      {compare.ids.length > 0 && (
        <div className="fixed bottom-[calc(160px+env(safe-area-inset-bottom))] right-4 z-30 lg:bottom-8 lg:right-8">
          <ButtonLink to={`/compare?ids=${compare.ids.join(",")}`} variant="secondary" className="rounded-full shadow-[var(--shadow-pop)]" icon={<GitCompareArrows className="h-4 w-4" strokeWidth={1.75} />}>
            Compare {compare.ids.length}
          </ButtonLink>
        </div>
      )}

      <Dialog open={photosOpen} onClose={() => setPhotosOpen(false)} title={`Photos (${images.length})`} size="lg">
        <div className="flex flex-col gap-3 pb-4">
          {images.map((src, i) => (
            <HomeImage key={src + i} src={src} alt={`Photo ${i + 1} of ${images.length}`} className="aspect-[3/2] w-full" sizes="760px" />
          ))}
        </div>
      </Dialog>
      <EnquiryDialog open={enquiryOpen} onClose={() => setEnquiryOpen(false)} listingId={l.id} title={l.title || "this home"} ownerName={l.owner?.name} />
      <ReportDialog open={reportOpen} onClose={() => setReportOpen(false)} itemType="listing" itemId={l.id} subject="this listing" />
    </HubShell>
  );
}
