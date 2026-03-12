import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  MapPin,
  Bed,
  Bath,
  Users,
  Wifi,
  Car,
  Snowflake,
  Shield,
  Star,
  CheckCircle,
  Home,
  Zap,
  Calendar,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { getListingById } from "../../lib/api";
import RequestToBookForm from "../../components/bookings/RequestToBookForm";
import { createBooking } from "../../lib/api";
import SEOHead from "../../components/SEOHead";

export default function ListingDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { session, user, refreshing } = useAuth();

  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(0);

  useEffect(() => {
    if (!id || typeof id !== "string") return;
    setLoading(true);
    getListingById(id).then((data) => {
      setListing(data);
      setLoading(false);
    });
  }, [id]);

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
      const result = await createBooking(session.access_token, data);
      if (result.checkout_url) {
        window.location.href = result.checkout_url;
      } else {
        setBookingSuccess(true);
      }
    } finally {
      setBookingLoading(false);
    }
  };

  const isOwner = user && listing && user.id === listing.owner_id;

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-rose-200 border-t-rose-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Listing not found
          </h1>
          <Link
            href="/seeker/search"
            className="text-rose-500 hover:text-rose-600 text-sm font-medium"
          >
            Back to search
          </Link>
        </div>
      </div>
    );
  }

  const images = listing.images || [];
  const ownerProfile = listing.owner_profile || {};

  return (
    <>
      <SEOHead
        title={`${listing.title || listing.address} - MigRent`}
        description={listing.description?.slice(0, 160)}
      />

      <div className="min-h-screen bg-white dark:bg-slate-950">
        {/* Top bar */}
        <div className="sticky top-0 z-20 bg-white/80 dark:bg-slate-950/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                {listing.title || listing.address}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {listing.city || "Australia"}
              </p>
            </div>
            <span className="text-lg font-black text-slate-900 dark:text-white">
              ${listing.weekly_price}
              <span className="text-xs font-normal text-slate-400">/wk</span>
            </span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left column - Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Photo gallery */}
              {images.length > 0 && (
                <div>
                  <div className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-3">
                    <img
                      src={images[selectedPhoto] || images[0]}
                      alt={listing.title || "Listing photo"}
                      className="w-full h-full object-cover"
                    />
                    {(listing.instant_book_enabled || listing.instant_book) && (
                      <span className="absolute top-4 left-4 flex items-center gap-1 text-xs font-semibold text-amber-800 bg-amber-100 px-3 py-1.5 rounded-full">
                        <Zap className="w-3 h-3" />
                        Instant Book
                      </span>
                    )}
                  </div>
                  {images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {images.map((img: string, i: number) => (
                        <button
                          key={i}
                          onClick={() => setSelectedPhoto(i)}
                          className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-colors ${
                            selectedPhoto === i
                              ? "border-rose-500"
                              : "border-transparent opacity-70 hover:opacity-100"
                          }`}
                        >
                          <img
                            src={img}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Title & address */}
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">
                  {listing.title || listing.address}
                </h1>
                <div className="flex items-center gap-2 mt-2 text-sm text-slate-500 dark:text-slate-400">
                  <MapPin className="w-4 h-4" />
                  <span>
                    {listing.address}, {listing.city} {listing.postcode}
                  </span>
                </div>
              </div>

              {/* Key specs */}
              <div className="flex flex-wrap gap-4">
                {listing.property_type && (
                  <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
                    <Home className="w-4 h-4 text-slate-400" />
                    {listing.property_type}
                    {listing.place_type && ` - ${listing.place_type}`}
                  </div>
                )}
                {listing.bedrooms && (
                  <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
                    <Bed className="w-4 h-4 text-slate-400" />
                    {listing.bedrooms} bed{listing.bedrooms !== 1 ? "s" : ""}
                  </div>
                )}
                {listing.bathrooms && (
                  <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
                    <Bath className="w-4 h-4 text-slate-400" />
                    {listing.bathrooms} bath
                    {listing.bathroom_type && ` (${listing.bathroom_type})`}
                  </div>
                )}
                {listing.max_guests && (
                  <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
                    <Users className="w-4 h-4 text-slate-400" />
                    Max {listing.max_guests} guest{listing.max_guests !== 1 ? "s" : ""}
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  About this place
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {listing.description}
                </p>
              </div>

              {/* Highlights */}
              {listing.highlights?.length > 0 && (
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">
                    Highlights
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {listing.highlights.map((h: string, i: number) => (
                      <span
                        key={i}
                        className="text-xs font-medium px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                      >
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Key details */}
              <div className="grid sm:grid-cols-2 gap-4">
                {listing.furnished !== undefined && (
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle
                      className={`w-4 h-4 ${
                        listing.furnished ? "text-emerald-500" : "text-slate-300"
                      }`}
                    />
                    <span className="text-slate-600 dark:text-slate-300">
                      {listing.furnished ? "Furnished" : "Unfurnished"}
                    </span>
                  </div>
                )}
                {listing.bills_included !== undefined && (
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle
                      className={`w-4 h-4 ${
                        listing.bills_included ? "text-emerald-500" : "text-slate-300"
                      }`}
                    />
                    <span className="text-slate-600 dark:text-slate-300">
                      {listing.bills_included ? "Bills included" : "Bills not included"}
                    </span>
                  </div>
                )}
                {listing.internet_included !== undefined && (
                  <div className="flex items-center gap-2 text-sm">
                    <Wifi
                      className={`w-4 h-4 ${
                        listing.internet_included ? "text-emerald-500" : "text-slate-300"
                      }`}
                    />
                    <span className="text-slate-600 dark:text-slate-300">
                      {listing.internet_included
                        ? `WiFi included${listing.internet_speed ? ` (${listing.internet_speed})` : ""}`
                        : "No WiFi included"}
                    </span>
                  </div>
                )}
                {listing.parking !== undefined && (
                  <div className="flex items-center gap-2 text-sm">
                    <Car
                      className={`w-4 h-4 ${
                        listing.parking ? "text-emerald-500" : "text-slate-300"
                      }`}
                    />
                    <span className="text-slate-600 dark:text-slate-300">
                      {listing.parking ? "Parking available" : "No parking"}
                    </span>
                  </div>
                )}
                {listing.air_conditioning !== undefined && (
                  <div className="flex items-center gap-2 text-sm">
                    <Snowflake
                      className={`w-4 h-4 ${
                        listing.air_conditioning ? "text-emerald-500" : "text-slate-300"
                      }`}
                    />
                    <span className="text-slate-600 dark:text-slate-300">
                      {listing.air_conditioning ? "Air conditioning" : "No A/C"}
                    </span>
                  </div>
                )}
              </div>

              {/* Availability */}
              {(listing.available_from || listing.min_stay_weeks) && (
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">
                    Availability
                  </h2>
                  <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-300">
                    {listing.available_from && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        Available from {listing.available_from}
                      </div>
                    )}
                    {listing.min_stay_weeks && (
                      <div>
                        Min stay: {listing.min_stay_weeks} week
                        {listing.min_stay_weeks !== 1 ? "s" : ""}
                      </div>
                    )}
                    {listing.max_stay_weeks && (
                      <div>Max stay: {listing.max_stay_weeks} weeks</div>
                    )}
                  </div>
                </div>
              )}

              {/* Transport */}
              {listing.nearest_transport && (
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                    Transport
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {listing.nearest_transport}
                  </p>
                </div>
              )}

              {/* House rules */}
              {(listing.no_smoking || listing.quiet_hours || listing.tenant_prefs) && (
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">
                    House rules
                  </h2>
                  <ul className="space-y-1.5 text-sm text-slate-600 dark:text-slate-300">
                    {listing.no_smoking && <li>No smoking</li>}
                    {listing.quiet_hours && (
                      <li>Quiet hours: {listing.quiet_hours}</li>
                    )}
                    {listing.tenant_prefs && <li>{listing.tenant_prefs}</li>}
                  </ul>
                </div>
              )}

              {/* Safety */}
              {(listing.security_cameras || listing.other_safety_details) && (
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-slate-400" />
                    Safety
                  </h2>
                  <ul className="space-y-1.5 text-sm text-slate-600 dark:text-slate-300">
                    {listing.security_cameras && (
                      <li>
                        Security cameras
                        {listing.security_cameras_location &&
                          `: ${listing.security_cameras_location}`}
                      </li>
                    )}
                    {listing.other_safety_details && (
                      <li>{listing.other_safety_details}</li>
                    )}
                  </ul>
                </div>
              )}

              {/* Owner profile */}
              {ownerProfile.name && (
                <div className="card p-5 rounded-xl">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">
                    Your host
                  </h2>
                  <div className="flex items-center gap-3">
                    {ownerProfile.custom_pfp ? (
                      <img
                        src={ownerProfile.custom_pfp}
                        alt={ownerProfile.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                        {ownerProfile.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {ownerProfile.name}
                        {ownerProfile.verified && (
                          <span className="ml-1.5 text-xs text-blue-500 font-normal">
                            Verified
                          </span>
                        )}
                      </p>
                      {ownerProfile.bio && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                          {ownerProfile.bio}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right column - Booking form (sticky) */}
            <div className="lg:col-span-1">
              <div className="sticky top-20">
                {bookingSuccess ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="card p-6 rounded-2xl text-center border border-emerald-200 dark:border-emerald-500/30"
                  >
                    <CheckCircle className="w-12 h-12 mx-auto text-emerald-500 mb-3" />
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                      Request sent!
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                      The owner has been notified. You will receive an email when they respond.
                    </p>
                    <Link
                      href="/dashboard/seeker"
                      className="text-sm font-semibold text-rose-500 hover:text-rose-600"
                    >
                      View your bookings
                    </Link>
                  </motion.div>
                ) : isOwner ? (
                  <div className="card p-6 rounded-2xl text-center border border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      This is your listing. You can manage it from your{" "}
                      <Link
                        href="/dashboard/owner"
                        className="text-rose-500 font-semibold hover:text-rose-600"
                      >
                        owner dashboard
                      </Link>
                      .
                    </p>
                  </div>
                ) : !session && !refreshing ? (
                  <div className="card p-6 rounded-2xl text-center border border-slate-200 dark:border-slate-700 space-y-4">
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      Sign in to request a booking
                    </p>
                    <Link
                      href="/signin"
                      className="block w-full btn-primary py-3 px-6 rounded-xl text-sm font-semibold text-center"
                    >
                      Sign in
                    </Link>
                    <p className="text-xs text-slate-400">
                      New to MigRent?{" "}
                      <Link
                        href="/signup"
                        className="text-rose-500 hover:text-rose-600"
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
      </div>
    </>
  );
}
