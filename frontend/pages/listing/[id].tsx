import { useRouter } from "next/router";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  MapPin,
  Star,
  CheckCircle,
  Shield,
  Send,
  Zap,
  Mail,
  CreditCard,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { getListingDetail } from "../../lib/api";
import { createBooking } from "../../lib/api";
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

import type { GetServerSideProps } from "next";

/**
 * Server-render the listing.
 *
 * This page was client-only: it fetched in useEffect and returned the loading
 * skeleton before SEOHead was ever reached, so the HTML Google and WhatsApp
 * received had no title, no description, no canonical, no Open Graph image and
 * no JSON-LD. For a rental marketplace these are the pages that carry the
 * organic traffic, and a shared link unfurled as a blank grey box.
 *
 * Only approved listings render here. An owner viewing their own unapproved
 * listing still gets it, but client-side after auth resolves, which is correct:
 * that view must never be cacheable or crawlable.
 */
export const getServerSideProps: GetServerSideProps = async ({ params, res }) => {
  const id = typeof params?.id === "string" ? params.id : null;
  if (!id) return { notFound: true };

  try {
    const r = await fetch(`${API_BASE_URL}/listings/${id}?include=reviews,similar`, {
      headers: { "Content-Type": "application/json" },
    });
    if (r.status === 404) return { notFound: true };
    if (!r.ok) {
      // Do not cache a failure, and do not 404 a listing that probably exists.
      return { props: { initialListing: null } };
    }
    const initialListing = await r.json();
    res.setHeader(
      "Cache-Control",
      "public, s-maxage=300, stale-while-revalidate=3600"
    );
    return { props: { initialListing } };
  } catch {
    return { props: { initialListing: null } };
  }
};

export default function ListingDetailPage({
  initialListing,
}: {
  initialListing?: any;
}) {
  const router = useRouter();
  const { id } = router.query;
  const { session, user, refreshing } = useAuth();

  const [listing, setListing] = useState<any>(initialListing ?? null);
  // Already rendered on the server, so no skeleton on first paint.
  const [loading, setLoading] = useState(!initialListing);
  const [loadError, setLoadError] = useState<"not-found" | "network" | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Track if booking form is in viewport (for mobile sticky CTA)
  const bookingFormRef = useRef<HTMLDivElement>(null);
  const [showMobileCTA, setShowMobileCTA] = useState(false);

  useEffect(() => {
    if (!id || typeof id !== "string") return;
    // Wait for the session to settle before fetching. Only approved listings
    // are public, so an owner opening their own pending listing needs the
    // token attached or the API correctly returns 404.
    if (refreshing) return;

    // The server already rendered this page for signed-out visitors. Refetch
    // only when there is something the server could not know: a session (the
    // owner may be allowed to see a listing the public cannot), a failed
    // server fetch, or an explicit retry.
    const needsClientFetch =
      !initialListing || Boolean(session?.access_token) || retryCount > 0;
    if (!needsClientFetch) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    // Never drop back to the skeleton once something is on screen.
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
    // `listing` is deliberately not a dependency: including it would refetch
    // every time the fetch resolves.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, session?.access_token, refreshing, retryCount, initialListing]);

  // Intersection observer for mobile sticky CTA
  useEffect(() => {
    if (!bookingFormRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowMobileCTA(!entry.isIntersecting),
      { threshold: 0.1 }
    );
    observer.observe(bookingFormRef.current);
    return () => observer.disconnect();
  }, [listing]);

  const handleBooking = async (data: {
    listing_id: string;
    check_in: string;
    check_out: string;
    guests: number;
    message_to_owner?: string;
  }) => {
    if (!session) {
      router.push("/signin");
      return;
    }
    setBookingLoading(true);
    try {
      // No redirect to Stripe. Renters pay MigRent nothing, so the API no
      // longer returns a checkout URL to the seeker - it used to hand them a
      // $118 session carrying the host's $99 fee. The host is invoiced their
      // listing fee separately and confirms from their own dashboard.
      await createBooking(session.access_token, data);
      setBookingSuccess(true);
    } finally {
      setBookingLoading(false);
    }
  };

  const scrollToBooking = () => {
    bookingFormRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const isOwner = user && listing && user.id === listing.owner_id;

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)]">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Hero skeleton */}
          <div className="aspect-[16/9] md:aspect-[2/1] rounded-2xl bg-[var(--color-surface-muted)] animate-pulse" />
          <div className="flex gap-2 mt-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-20 h-14 rounded-lg bg-[var(--color-surface-muted)] animate-pulse"
              />
            ))}
          </div>
          <div className="grid lg:grid-cols-3 gap-8 mt-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-8 w-3/4 bg-[var(--color-surface-muted)] rounded animate-pulse" />
              <div className="h-4 w-1/2 bg-[var(--color-surface-muted)] rounded animate-pulse" />
              <div className="h-32 bg-[var(--color-surface-muted)] rounded-2xl animate-pulse" />
              <div className="h-48 bg-[var(--color-surface-muted)] rounded-2xl animate-pulse" />
            </div>
            <div className="h-80 bg-[var(--color-surface-muted)] rounded-2xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    // A network failure and a genuine 404 used to render identically, so an
    // outage told people the room they were looking at had been taken down.
    const isNetwork = loadError === "network";
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center px-4">
        <div className="text-center max-w-[42ch]">
          <h1 className="font-serif text-[28px] tracking-[-0.015em] text-[var(--color-ink)] mb-2">
            {isNetwork ? "We could not load this room" : "This room is no longer listed"}
          </h1>
          <p className="text-[14.5px] text-[var(--color-ink-2)] leading-[1.6] mb-6">
            {isNetwork
              ? "Something went wrong on our side, not yours. The listing is probably still there."
              : "It may have been rented, or the host may have taken it down. Plenty of others are still available."}
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            {isNetwork && (
              <button
                onClick={() => setRetryCount((n) => n + 1)}
                className="btn-primary h-[42px] px-5 rounded-[10px] text-[14px]"
              >
                Try again
              </button>
            )}
            <Link
              href="/seeker/search"
              className="btn-secondary h-[42px] px-5 rounded-[10px] text-[14px] inline-flex items-center"
            >
              Browse other rooms
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const images = listing.images || [];
  const ownerProfile = listing.owner_profile || {};
  const reviewStats = listing.review_stats;
  const similarListings = listing.similar_listings || [];
  const isInstantBook = listing.instant_book_enabled || listing.instant_book;

  return (
    <>
      <SEOHead
        title={`${listing.title || listing.address} - MigRent`}
        description={
          listing.description?.slice(0, 160) ||
          `A room in ${listing.suburb || listing.city || "Australia"} for $${listing.weekly_price} a week.`
        }
        ogImage={listing.images?.[0]}
        listing={{
          address: listing.title || listing.address,
          city: listing.suburb || listing.city,
          weeklyPrice: listing.weekly_price,
          description: listing.description,
          images: listing.images,
        }}
      />

      <div className="min-h-screen bg-[var(--color-bg)]">
        {/* Sticky top bar */}
        <div className="sticky top-0 z-30 bg-[var(--color-surface)]/80 backdrop-blur-lg border-b border-[var(--color-line)]">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-full hover:bg-[var(--color-surface-muted)] transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-[var(--color-ink-2)]" />
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[var(--color-ink)] truncate">
                {listing.title || listing.address}
              </p>
              <div className="flex items-center gap-2 text-xs text-[var(--color-ink-3)]">
                <span>{listing.suburb || listing.city || "Australia"}</span>
                {reviewStats && reviewStats.review_count > 0 && (
                  <>
                    <span>-</span>
                    <span className="flex items-center gap-0.5">
                      <Star className="w-3 h-3 text-[var(--color-warn-500)] fill-[var(--color-warn-500)]" />
                      {Number(reviewStats.avg_rating).toFixed(1)}
                      <span className="text-[var(--color-ink-3)]">
                        ({reviewStats.review_count})
                      </span>
                    </span>
                  </>
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
          {/* Owners see what is actually happening with their listing. Without
              this, an owner whose listing is pending or rejected opens this
              page and sees something that looks live, with no hint that no
              seeker can find it. The banner renders nothing when approved. */}
          {isOwner && (
            <>
              <ModerationStatusBanner
                status={listing.moderation_status}
                moderationNotes={listing.moderation_notes}
                moderationReason={listing.moderation_reason}
              />
              {listing.moderation_status !== "approved" && (
                <p className="-mt-3 mb-6 text-[13px] text-[var(--color-ink-3)]">
                  Only you can see this page while it is in review.{" "}
                  <Link
                    href={`/owner/listings/edit/${listing.id}`}
                    className="text-[var(--color-primary)] font-semibold hover:underline underline-offset-[3px]"
                  >
                    Edit this listing
                  </Link>
                </p>
              )}
            </>
          )}

          {/* Hero */}
          <ListingHero
            images={images}
            title={listing.title || listing.address}
            instantBook={isInstantBook}
            verified={ownerProfile.verified}
          />

          {/* Title + address */}
          <div className="mt-6">
            <h1 className="font-serif text-[28px] md:text-[40px] tracking-[-0.02em] leading-[1.05] text-[var(--color-ink)]">
              {listing.title || listing.address}
            </h1>
            <div className="flex items-center gap-2 mt-2 text-sm text-[var(--color-ink-3)]">
              <MapPin className="w-4 h-4" />
              <span>
                {listing.address}
                {listing.suburb && `, ${listing.suburb}`}
                {listing.city && `, ${listing.city}`} {listing.postcode}
              </span>
            </div>
          </div>

          {/* Two-column layout */}
          <div className="grid lg:grid-cols-3 gap-8 mt-8">
            {/* Left column - Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              <div>
                <h2 className="font-serif text-[22px] tracking-[-0.01em] text-[var(--color-ink)] mb-2">
                  About this place
                </h2>
                <p className="text-sm text-[var(--color-ink-2)] leading-relaxed whitespace-pre-line">
                  {listing.description}
                </p>
              </div>

              {/* True Cost Calculator */}
              <TrueCostBadge
                weeklyRent={listing.weekly_price}
                billsIncluded={listing.bills_included}
                listingLat={listing.lat}
                listingLng={listing.lng}
              />

              {/* Key Details (amenities, map, availability, rules) */}
              <KeyDetails listing={listing} />

              {/* Owner card */}
              {ownerProfile.name && (
                <OwnerCard
                  profile={ownerProfile}
                  ownerId={listing.owner_id}
                  listingId={listing.id}
                />
              )}

              {/* Reviews */}
              <ReviewsSection
                listingId={listing.id}
                initialStats={reviewStats}
              />

              {/* Similar Listings */}
              {similarListings.length > 0 && (
                <SimilarListings
                  listings={similarListings}
                  currentSuburb={listing.suburb}
                />
              )}

              {/* Trust footer */}
              <div className="border-t border-[var(--color-line)] pt-8 pb-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-[var(--color-surface)]">
                    <Shield className="w-8 h-8 text-[var(--color-accent)]" />
                    <div>
                      <p className="text-sm font-semibold text-[var(--color-ink)]">
                        MigRent Guarantee
                      </p>
                      <p className="text-xs text-[var(--color-ink-3)]">
                        Verified listings you can trust
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-[var(--color-surface)]">
                    <CreditCard className="w-8 h-8 text-[var(--color-primary)]" />
                    <div>
                      <p className="text-sm font-semibold text-[var(--color-ink)]">
                        Secure Payments
                      </p>
                      <p className="text-xs text-[var(--color-ink-3)]">
                        Protected by Stripe
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-[var(--color-surface)]">
                    <Mail className="w-8 h-8 text-[var(--color-accent)]" />
                    <div>
                      <p className="text-sm font-semibold text-[var(--color-ink)]">
                        24h Support
                      </p>
                      <p className="text-xs text-[var(--color-ink-3)]">
                        migrentau@gmail.com
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right column - Booking form (sticky) */}
            <div className="lg:col-span-1" ref={bookingFormRef}>
              <div className="sticky top-20">
                {bookingSuccess ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="card p-6 text-center border-[var(--color-accent)]"
                  >
                    <CheckCircle className="w-12 h-12 mx-auto text-[var(--color-accent)] mb-3" />
                    <h3 className="font-serif text-[22px] tracking-[-0.01em] text-[var(--color-ink)] mb-2">
                      Request sent
                    </h3>
                    {/* Say what happens next, by when, and what it costs.
                        This used to be two vague lines, which is the point at
                        which someone new to renting here starts worrying they
                        have committed to something. */}
                    <ol className="text-left text-[13.5px] text-[var(--color-ink-2)] leading-[1.6] space-y-2 mb-4">
                      <li className="flex gap-2.5">
                        <span className="font-mono text-[11px] text-[var(--color-ink-3)] mt-0.5">1</span>
                        <span>
                          The host has been emailed. Most reply within a day or two.
                        </span>
                      </li>
                      <li className="flex gap-2.5">
                        <span className="font-mono text-[11px] text-[var(--color-ink-3)] mt-0.5">2</span>
                        <span>
                          We will email you either way, and it will show up under your bookings.
                        </span>
                      </li>
                      <li className="flex gap-2.5">
                        <span className="font-mono text-[11px] text-[var(--color-ink-3)] mt-0.5">3</span>
                        <span>
                          Nothing is booked and you owe nothing yet. Keep looking at other rooms in the meantime.
                        </span>
                      </li>
                    </ol>
                    <p className="text-[12.5px] text-[var(--color-ink-3)] border-t border-[var(--color-line)] pt-3 mb-4">
                      MigRent never asks renters for money. If anyone asks you to
                      pay a deposit to hold this room, tell us before you pay.
                    </p>
                    <div className="flex flex-wrap gap-3 justify-center">
                      <Link
                        href="/dashboard/seeker"
                        className="btn-primary h-[40px] px-4 rounded-[10px] text-[13.5px] inline-flex items-center"
                      >
                        View your requests
                      </Link>
                      <Link
                        href="/seeker/search"
                        className="btn-secondary h-[40px] px-4 rounded-[10px] text-[13.5px] inline-flex items-center"
                      >
                        Keep looking
                      </Link>
                    </div>
                  </motion.div>
                ) : isOwner ? (
                  <div className="card p-6 rounded-2xl text-center border border-[var(--color-line)]">
                    <p className="text-sm text-[var(--color-ink-3)]">
                      This is your listing. You can manage it from your{" "}
                      <Link
                        href="/dashboard/owner"
                        className="text-[var(--color-primary)] font-semibold hover:text-[var(--color-primary)]"
                      >
                        owner dashboard
                      </Link>
                      .
                    </p>
                  </div>
                ) : !session && !refreshing ? (
                  <div className="card p-6 rounded-2xl text-center border border-[var(--color-line)] space-y-4">
                    <p className="text-sm text-[var(--color-ink-2)]">
                      Sign in to request a booking
                    </p>
                    <Link
                      href="/signin"
                      className="block w-full btn-primary py-3 px-6 rounded-xl text-sm font-semibold text-center"
                    >
                      Sign in
                    </Link>
                    <p className="text-xs text-[var(--color-ink-3)]">
                      New to MigRent?{" "}
                      <Link
                        href="/signup"
                        className="text-[var(--color-primary)] hover:opacity-80"
                      >
                        Create an account
                      </Link>
                    </p>
                  </div>
                ) : (
                  <RequestToBookForm
                    listing={listing}
                    onSubmit={handleBooking}
                    loading={bookingLoading}
                    disabled={refreshing}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile sticky CTA */}
        {showMobileCTA && !isOwner && !bookingSuccess && (
          <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-[var(--color-surface)]/95 backdrop-blur-lg border-t border-[var(--color-line)] px-4 py-3 safe-area-pb">
            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="text-lg font-semibold text-[var(--color-ink)] tabular-nums">
                  ${listing.weekly_price}
                </span>
                <span className="text-sm text-[var(--color-ink-3)]">
                  {" "}
                  / week
                </span>
              </div>
              {session ? (
                <button
                  onClick={scrollToBooking}
                  className="btn-primary py-2.5 px-6 rounded-xl text-sm font-semibold flex items-center gap-2"
                >
                  {isInstantBook ? (
                    <>
                      <Zap className="w-4 h-4" />
                      Instant Book
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Request to Book
                    </>
                  )}
                </button>
              ) : (
                <Link
                  href="/signin"
                  className="btn-primary py-2.5 px-6 rounded-xl text-sm font-semibold"
                >
                  Sign in to book
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
