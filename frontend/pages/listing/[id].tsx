import { useRouter } from "next/router";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Star, CheckCircle, Send, Zap, BadgeCheck, Wallet, Mail } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { getListingDetail, createBooking, type PublicListing } from "../../lib/api";
import RequestToBookForm from "../../components/bookings/RequestToBookForm";
import ListingHero from "../../components/listings/ListingHero";
import OwnerCard from "../../components/listings/OwnerCard";
import KeyDetails from "../../components/listings/KeyDetails";
import ReviewsSection from "../../components/listings/ReviewsSection";
import SimilarListings from "../../components/listings/SimilarListings";
import ModerationStatusBanner from "../../components/listings/ModerationStatusBanner";
import TrueCostBadge from "../../components/listings/TrueCostBadge";
import SEOHead from "../../components/SEOHead";
import { API_BASE_URL } from "../../lib/apiBase";
import { siteIdentity, supportPromise } from "../../lib/siteIdentity";

import type { GetServerSideProps } from "next";

/**
 * Server-render the listing.
 *
 * Only listings the public may see are rendered here. The API returns the
 * public data contract (no street address, no exact pin, no owner UUID, no
 * moderation internals). A listing whose availability has ended comes back
 * with public_state = "expired" and HTTP 410, and this page says so plainly
 * instead of 404ing or pretending the room is still on offer.
 */
export const getServerSideProps: GetServerSideProps = async ({ params, res }) => {
  const id = typeof params?.id === "string" ? params.id : null;
  if (!id || !/^[0-9a-f-]{20,40}$/i.test(id)) return { notFound: true };

  try {
    const r = await fetch(`${API_BASE_URL}/listings/${encodeURIComponent(id)}?include=reviews,similar`, {
      headers: { Accept: "application/json" },
    });
    if (r.status === 404) return { notFound: true };
    if (r.status === 410) {
      const expired = await r.json();
      res.statusCode = 410;
      res.setHeader("Cache-Control", "public, s-maxage=600, stale-while-revalidate=3600");
      return { props: { initialListing: expired } };
    }
    if (!r.ok) {
      // Do not cache a failure, and do not 404 a listing that probably exists.
      return { props: { initialListing: null } };
    }
    const initialListing = await r.json();
    res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=3600");
    return { props: { initialListing } };
  } catch {
    return { props: { initialListing: null } };
  }
};

function formatDate(value?: string | null) {
  if (!value) return "";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" });
}

export default function ListingDetailPage({ initialListing }: { initialListing?: PublicListing | null }) {
  const router = useRouter();
  const { id } = router.query;
  const { session, refreshing } = useAuth();

  const [listing, setListing] = useState<PublicListing | null>(initialListing ?? null);
  const [loading, setLoading] = useState(!initialListing);
  const [loadError, setLoadError] = useState<"not-found" | "network" | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState("");

  const bookingFormRef = useRef<HTMLDivElement>(null);
  const [showMobileCTA, setShowMobileCTA] = useState(false);

  useEffect(() => {
    if (!id || typeof id !== "string") return;
    if (refreshing) return;

    // The server rendered the public view. Refetch only when there is
    // something the server could not know: a session (the owner may see
    // more), a failed server fetch, or an explicit retry.
    const needsClientFetch = !initialListing || Boolean(session?.access_token) || retryCount > 0;
    if (!needsClientFetch) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    if (!listing) setLoading(true);
    setLoadError(null);

    getListingDetail(id, session?.access_token).then((result) => {
      if (cancelled) return;
      if (result.ok) {
        setListing(result.listing);
      } else if (!initialListing) {
        setListing(null);
        setLoadError(result.reason);
      }
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, session?.access_token, refreshing, retryCount, initialListing]);

  useEffect(() => {
    if (!bookingFormRef.current) return;
    const observer = new IntersectionObserver(([entry]) => setShowMobileCTA(!entry.isIntersecting), { threshold: 0.1 });
    observer.observe(bookingFormRef.current);
    return () => observer.disconnect();
  }, [listing]);

  const handleBooking = async (data: { listing_id: string; check_in: string; check_out: string; guests: number; message_to_owner?: string }) => {
    if (!session) {
      void router.push(`/signin?redirect=${encodeURIComponent(router.asPath)}`);
      return;
    }
    setBookingLoading(true);
    setBookingError("");
    try {
      // Renters are never sent to Stripe. The host is invoiced separately.
      await createBooking(session.access_token, data);
      setBookingSuccess(true);
    } catch (err) {
      setBookingError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      throw err;
    } finally {
      setBookingLoading(false);
    }
  };

  const scrollToBooking = () => bookingFormRef.current?.scrollIntoView({ behavior: "smooth" });

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)]" aria-busy="true">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="aspect-[16/9] md:aspect-[2/1] rounded-2xl bg-[var(--color-surface-muted)] animate-pulse" />
          <div className="grid lg:grid-cols-3 gap-8 mt-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-8 w-3/4 bg-[var(--color-surface-muted)] rounded animate-pulse" />
              <div className="h-4 w-1/2 bg-[var(--color-surface-muted)] rounded animate-pulse" />
              <div className="h-32 bg-[var(--color-surface-muted)] rounded-2xl animate-pulse" />
            </div>
            <div className="h-80 bg-[var(--color-surface-muted)] rounded-2xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    const isNetwork = loadError === "network";
    return (
      <>
        <SEOHead title={isNetwork ? "Could not load this room" : "Room no longer listed"} noIndex />
        <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center px-4">
          <div className="text-center max-w-[42ch]">
            <h1 className="font-serif text-[28px] tracking-[-0.015em] text-[var(--color-ink)] mb-2">
              {isNetwork ? "We could not load this room" : "This room is no longer listed"}
            </h1>
            <p className="text-[14.5px] text-[var(--color-ink-2)] leading-[1.6] mb-6">
              {isNetwork
                ? "Something went wrong on our side, not yours. The listing is probably still there."
                : "It may have been rented, or the host may have taken it down."}
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              {isNetwork && (
                <button type="button" onClick={() => setRetryCount((n) => n + 1)} className="btn-primary h-[44px] px-5 rounded-[10px] text-[14px]">
                  Try again
                </button>
              )}
              <Link href="/seeker/search" className="btn-secondary h-[44px] px-5 rounded-[10px] text-[14px] inline-flex items-center">
                Browse other rooms
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  const images = listing.images || [];
  const owner = listing.owner;
  const reviewStats = listing.review_stats;
  const similarListings = listing.similar_listings || [];
  const isInstantBook = Boolean(listing.instant_book_enabled || listing.instant_book);
  const isOwner = Boolean(listing.viewer?.is_owner);
  const canModerate = Boolean(listing.viewer?.can_moderate);
  const title = listing.title || listing.display_address;
  const isExpired = listing.public_state === "expired";
  const isPublished = listing.public_state === "published";
  const locality = listing.suburb || listing.city || "Australia";

  // ── Expired: honest, indexable-as-gone page ──
  if (isExpired && !isOwner && !canModerate) {
    return (
      <>
        <SEOHead title={`${title} (no longer available)`} description={`This room in ${locality} is no longer available on MigRent.`} noIndex />
        <div className="min-h-screen bg-[var(--color-bg)]">
          <div className="max-w-3xl mx-auto px-4 py-10">
            <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-6 md:p-8" role="status">
              <p className="eyebrow mb-2">No longer available</p>
              <h1 className="font-serif text-[28px] md:text-[36px] tracking-[-0.02em] leading-[1.05] text-[var(--color-ink)]">{title}</h1>
              <p className="mt-3 text-[15px] text-[var(--color-ink-2)] leading-[1.6]">
                The host listed this room in {locality} as available until{" "}
                <strong className="text-[var(--color-ink)]">{formatDate(listing.available_to)}</strong>. That date has passed, so it cannot be booked
                and no longer appears in search. If the host renews it, it will be reviewed before it comes back.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href={`/seeker/search?suburb=${encodeURIComponent(listing.suburb || listing.city || "")}`} className="btn-primary h-[44px] px-5 rounded-[10px] text-[14px] inline-flex items-center">
                  See rooms in {locality}
                </Link>
                <Link href="/seeker/search" className="btn-secondary h-[44px] px-5 rounded-[10px] text-[14px] inline-flex items-center">
                  Search everywhere
                </Link>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHead
        title={`${title}, ${locality}`}
        description={listing.description?.slice(0, 160) || `A room in ${locality} for $${listing.weekly_price} a week.`}
        ogImage={images[0]}
        noIndex={!isPublished}
        listing={{
          address: title,
          city: locality,
          weeklyPrice: listing.weekly_price,
          description: listing.description ?? undefined,
          images,
          availableFrom: listing.available_from ?? undefined,
          availableTo: listing.available_to ?? undefined,
          available: isPublished,
        }}
      />

      <div className="min-h-screen bg-[var(--color-bg)]">
        <div className="sticky top-0 z-30 bg-[var(--color-surface)]/80 backdrop-blur-lg border-b border-[var(--color-line)]">
          <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-3">
            <button type="button" onClick={() => router.back()} aria-label="Go back" className="w-11 h-11 inline-flex items-center justify-center rounded-full hover:bg-[var(--color-surface-muted)] transition-colors">
              <ArrowLeft className="w-5 h-5 text-[var(--color-ink-2)]" aria-hidden="true" />
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[var(--color-ink)] truncate">{title}</p>
              <div className="flex items-center gap-2 text-xs text-[var(--color-ink-3)]">
                <span>{locality}</span>
                {reviewStats && reviewStats.review_count > 0 && (
                  <span className="flex items-center gap-0.5">
                    <Star className="w-3 h-3 text-[var(--color-warn-500)] fill-[var(--color-warn-500)]" aria-hidden="true" />
                    {Number(reviewStats.avg_rating).toFixed(1)}
                    <span className="sr-only"> out of 5 from </span>
                    <span className="text-[var(--color-ink-3)]">({reviewStats.review_count}<span className="sr-only"> reviews</span>)</span>
                  </span>
                )}
              </div>
            </div>
            <div className="hidden sm:block">
              <span className="text-lg font-semibold text-[var(--color-ink)] tabular-nums">
                ${listing.weekly_price}
                <span className="text-xs font-normal text-[var(--color-ink-3)]">/wk</span>
              </span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6">
          {(isOwner || canModerate) && (
            <>
              <ModerationStatusBanner status={listing.moderation_status ?? "pending_approval"} moderationNotes={listing.moderation_notes ?? undefined} moderationReason={listing.moderation_reason ?? undefined} />
              {!isPublished && (
                <p className="-mt-3 mb-6 text-[13px] text-[var(--color-ink-3)]">
                  {isExpired ? "This listing's availability has ended. Only you can see this page." : "Only you can see this page while it is in review."}{" "}
                  <Link href={`/owner/listings/edit/${listing.id}`} className="text-[var(--color-primary)] font-semibold hover:underline underline-offset-[3px]">
                    {isExpired ? "Update the dates to renew it" : "Edit this listing"}
                  </Link>
                </p>
              )}
            </>
          )}

          <ListingHero images={images} title={title} instantBook={isInstantBook} verification={listing.host_verification} />

          <div className="mt-6">
            <h1 className="font-serif text-[28px] md:text-[40px] tracking-[-0.02em] leading-[1.05] text-[var(--color-ink)]">{title}</h1>
            <div className="flex items-center gap-2 mt-2 text-sm text-[var(--color-ink-3)]">
              <MapPin className="w-4 h-4" aria-hidden="true" />
              <span>{isOwner && listing.street_address ? `${listing.street_address}, ` : ""}{listing.display_address}</span>
            </div>
            {!isOwner && <p className="mt-1 text-xs text-[var(--color-ink-3)]">Street address is shared once a booking is agreed.</p>}
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mt-8">
            <div className="lg:col-span-2 space-y-8">
              <section aria-labelledby="about-heading">
                <h2 id="about-heading" className="font-serif text-[22px] tracking-[-0.01em] text-[var(--color-ink)] mb-2">About this place</h2>
                <p className="text-sm text-[var(--color-ink-2)] leading-relaxed whitespace-pre-line">{listing.description}</p>
              </section>

              <TrueCostBadge weeklyRent={listing.weekly_price} billsIncluded={Boolean(listing.bills_included)} listingLat={listing.location?.approx_lat} listingLng={listing.location?.approx_lng} />

              <KeyDetails
                listing={{
                  ...listing,
                  bills_included: listing.bills_included ?? undefined,
                  furnished: listing.furnished ?? undefined,
                  internet_included: listing.internet_included ?? undefined,
                  internet_speed: listing.internet_speed ?? undefined,
                  parking: listing.parking ?? undefined,
                  air_conditioning: listing.air_conditioning ?? undefined,
                  laundry: listing.laundry ?? undefined,
                  dishwasher: listing.dishwasher ?? undefined,
                  pets_allowed: listing.pets_allowed ?? undefined,
                  pet_details: listing.pet_details ?? undefined,
                  couples_ok: listing.couples_ok ?? undefined,
                  nearest_transport: listing.nearest_transport ?? undefined,
                  neighbourhood_vibe: listing.neighbourhood_vibe ?? undefined,
                  available_from: listing.available_from ?? undefined,
                  available_to: listing.available_to ?? undefined,
                  min_stay_weeks: listing.min_stay_weeks ?? undefined,
                  max_stay_weeks: listing.max_stay_weeks ?? undefined,
                  property_type: listing.property_type ?? undefined,
                  place_type: listing.place_type ?? undefined,
                  bedrooms: listing.bedrooms ?? undefined,
                  bathrooms: listing.bathrooms ?? undefined,
                  bathroom_type: listing.bathroom_type ?? undefined,
                  max_guests: listing.max_guests ?? undefined,
                  no_smoking: listing.no_smoking ?? undefined,
                  quiet_hours: listing.quiet_hours ?? undefined,
                  tenant_prefs: listing.tenant_prefs ?? undefined,
                  gender_preference: listing.gender_preference ?? undefined,
                  security_cameras: listing.security_cameras ?? undefined,
                  security_cameras_location: listing.security_cameras_location ?? undefined,
                  other_safety_details: listing.other_safety_details ?? undefined,
                  highlights: listing.highlights ?? undefined,
                }}
              />

              {owner && <OwnerCard owner={owner} listingId={listing.id} />}

              <ReviewsSection listingId={listing.id} initialStats={reviewStats} />

              {similarListings.length > 0 && (
                <SimilarListings
                  listings={similarListings.map((s) => ({
                    id: s.id,
                    title: s.title ?? undefined,
                    address: s.display_address,
                    suburb: s.suburb ?? undefined,
                    city: s.city ?? undefined,
                    postcode: s.postcode ?? undefined,
                    weekly_price: s.weekly_price,
                    images: s.images,
                    instant_book_enabled: Boolean(s.instant_book_enabled),
                  }))}
                  currentSuburb={listing.suburb ?? undefined}
                />
              )}

              {/* What MigRent actually does. No guarantees, no invented support hours. */}
              <div className="border-t border-[var(--color-line)] pt-8 pb-4">
                <ul className="grid grid-cols-1 sm:grid-cols-3 gap-4 list-none p-0 m-0">
                  <li className="flex items-start gap-3 p-4 rounded-xl bg-[var(--color-surface)]">
                    <BadgeCheck className="w-7 h-7 text-[var(--color-accent)] shrink-0" aria-hidden="true" />
                    <div>
                      <p className="text-sm font-semibold text-[var(--color-ink)]">Host verification</p>
                      <p className="text-xs text-[var(--color-ink-3)]">
                        Government ID checked before a room goes live.{" "}
                        <Link href="/safety-verification" className="underline underline-offset-2">What that does and does not mean</Link>
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3 p-4 rounded-xl bg-[var(--color-surface)]">
                    <Wallet className="w-7 h-7 text-[var(--color-primary)] shrink-0" aria-hidden="true" />
                    <div>
                      <p className="text-sm font-semibold text-[var(--color-ink)]">Renters pay $0</p>
                      <p className="text-xs text-[var(--color-ink-3)]">MigRent never holds your rent or bond. Hosts pay a fee to MigRent; renters do not.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3 p-4 rounded-xl bg-[var(--color-surface)]">
                    <Mail className="w-7 h-7 text-[var(--color-accent)] shrink-0" aria-hidden="true" />
                    <div>
                      <p className="text-sm font-semibold text-[var(--color-ink)]">Support by email</p>
                      <p className="text-xs text-[var(--color-ink-3)]">
                        {supportPromise()} <a href={`mailto:${siteIdentity.emails.support}`} className="underline underline-offset-2">{siteIdentity.emails.support}</a>
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            <div className="lg:col-span-1" ref={bookingFormRef}>
              <div className="sticky top-20">
                {bookingSuccess ? (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card p-6 text-center border-[var(--color-accent)]" role="status">
                    <CheckCircle className="w-12 h-12 mx-auto text-[var(--color-accent)] mb-3" aria-hidden="true" />
                    <h3 className="font-serif text-[22px] tracking-[-0.01em] text-[var(--color-ink)] mb-2">Request sent</h3>
                    <ol className="text-left text-[13.5px] text-[var(--color-ink-2)] leading-[1.6] space-y-2 mb-4">
                      <li className="flex gap-2.5"><span className="font-mono text-[11px] text-[var(--color-ink-3)] mt-0.5">1</span><span>The host has been emailed. Most reply within a day or two.</span></li>
                      <li className="flex gap-2.5"><span className="font-mono text-[11px] text-[var(--color-ink-3)] mt-0.5">2</span><span>We will email you either way, and it will show up under your bookings.</span></li>
                      <li className="flex gap-2.5"><span className="font-mono text-[11px] text-[var(--color-ink-3)] mt-0.5">3</span><span>Nothing is booked and you owe nothing yet. Keep looking at other rooms in the meantime.</span></li>
                    </ol>
                    <p className="text-[12.5px] text-[var(--color-ink-3)] border-t border-[var(--color-line)] pt-3 mb-4">
                      MigRent never asks renters for money. If anyone asks you to pay a deposit to hold this room, tell us before you pay.
                    </p>
                    <div className="flex flex-wrap gap-3 justify-center">
                      <Link href="/dashboard/seeker" className="btn-primary h-[44px] px-4 rounded-[10px] text-[13.5px] inline-flex items-center">View your requests</Link>
                      <Link href="/seeker/search" className="btn-secondary h-[44px] px-4 rounded-[10px] text-[13.5px] inline-flex items-center">Keep looking</Link>
                    </div>
                  </motion.div>
                ) : isOwner ? (
                  <div className="card p-6 rounded-2xl text-center border border-[var(--color-line)]">
                    <p className="text-sm text-[var(--color-ink-3)]">
                      This is your listing. Manage it from your{" "}
                      <Link href="/dashboard/owner" className="text-[var(--color-primary)] font-semibold">owner dashboard</Link>.
                    </p>
                  </div>
                ) : !isPublished ? (
                  <div className="card p-6 rounded-2xl text-center border border-[var(--color-line)]">
                    <p className="text-sm text-[var(--color-ink-3)]">This room is not currently open for booking.</p>
                  </div>
                ) : !session && !refreshing ? (
                  <div className="card p-6 rounded-2xl text-center border border-[var(--color-line)] space-y-4">
                    <p className="text-sm text-[var(--color-ink-2)]">Sign in to request a booking</p>
                    <Link href={`/signin?redirect=${encodeURIComponent(router.asPath)}`} className="block w-full btn-primary py-3 px-6 rounded-xl text-sm font-semibold text-center">Sign in</Link>
                    <p className="text-xs text-[var(--color-ink-3)]">
                      New to MigRent? <Link href="/signup" className="text-[var(--color-primary)] hover:opacity-80">Create an account</Link>
                    </p>
                  </div>
                ) : (
                  <>
                    <RequestToBookForm
                      listing={{
                        id: listing.id,
                        title: listing.title ?? undefined,
                        address: listing.display_address,
                        weekly_price: listing.weekly_price,
                        instant_book_enabled: Boolean(listing.instant_book_enabled),
                        instant_book: Boolean(listing.instant_book),
                        min_stay_weeks: listing.min_stay_weeks ?? undefined,
                        max_stay_weeks: listing.max_stay_weeks ?? undefined,
                        max_guests: listing.max_guests ?? undefined,
                        available_from: listing.available_from ?? undefined,
                        available_to: listing.available_to ?? undefined,
                      }}
                      onSubmit={handleBooking}
                      loading={bookingLoading}
                      disabled={refreshing}
                    />
                    {bookingError && <p role="alert" className="mt-2 text-sm text-[var(--color-danger-500)]">{bookingError}</p>}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {showMobileCTA && !isOwner && !bookingSuccess && isPublished && (
          <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-[var(--color-surface)]/95 backdrop-blur-lg border-t border-[var(--color-line)] px-4 py-3 safe-area-pb">
            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="text-lg font-semibold text-[var(--color-ink)] tabular-nums">${listing.weekly_price}</span>
                <span className="text-sm text-[var(--color-ink-3)]"> / week</span>
              </div>
              {session ? (
                <button type="button" onClick={scrollToBooking} className="btn-primary min-h-[44px] px-6 rounded-xl text-sm font-semibold flex items-center gap-2">
                  {isInstantBook ? <><Zap className="w-4 h-4" aria-hidden="true" />Instant book</> : <><Send className="w-4 h-4" aria-hidden="true" />Request to book</>}
                </button>
              ) : (
                <Link href={`/signin?redirect=${encodeURIComponent(router.asPath)}`} className="btn-primary min-h-[44px] px-6 rounded-xl text-sm font-semibold inline-flex items-center">Sign in to book</Link>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
