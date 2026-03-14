import { useRouter } from "next/router";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../../hooks/useAuth";
import ReportModal from "../../../components/ReportModal";
import { getListingById } from "../../../lib/api";

export default function RoomDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { session } = useAuth();
  const [activePhoto, setActivePhoto] = useState(0);
  const [interestSent, setInterestSent] = useState(false);
  const [message, setMessage] = useState("");
  const [reportOpen, setReportOpen] = useState(false);
  const [room, setRoom] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Deal customization state
  const [dealStartDate, setDealStartDate] = useState("");
  const [dealEndDate, setDealEndDate] = useState("");
  const [dealGuests, setDealGuests] = useState(1);
  const [dealSpecialRequests, setDealSpecialRequests] = useState("");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError("");
    getListingById(id as string)
      .then((data) => {
        if (!data) {
          setError("Listing not found");
          return;
        }
        // Normalize backend fields to what the UI expects
        const normalized = {
          id: data.id,
          title: data.title || "",
          address: data.address || "",
          suburb: data.suburb || data.city || "",
          postcode: data.postcode ? String(data.postcode) : "",
          weeklyPrice: data.weekly_price ?? data.weeklyPrice ?? 0,
          bond: data.bond || null,
          minStay: data.min_stay || null,
          propertyType: data.property_type || "Apartment",
          placeType: data.place_type || "Private room",
          bedrooms: data.bedrooms ?? 1,
          beds: data.beds ?? 1,
          bathrooms: data.bathrooms ?? 1,
          bathroomType: data.bathroom_type || "shared",
          maxGuests: data.max_guests ?? 1,
          furnished: data.furnished ?? false,
          billsIncluded: data.bills_included ?? false,
          highlights: data.highlights || [],
          weeklyDiscount: data.weekly_discount || null,
          monthlyDiscount: data.monthly_discount || null,
          whoElseLivesHere: data.who_else_lives_here || "",
          totalOtherPeople: data.total_other_people || "",
          description: data.description || "",
          photos: data.images || data.photos || [],
          instantBook: data.instant_book || data.instant_book_enabled || false,
          internetIncluded: data.internet_included ?? false,
          internetSpeed: data.internet_speed || null,
          petsAllowed: data.pets_allowed ?? false,
          petDetails: data.pet_details || null,
          airConditioning: data.air_conditioning ?? false,
          laundry: data.laundry || null,
          dishwasher: data.dishwasher ?? false,
          nearestTransport: data.nearest_transport || null,
          neighbourhoodVibe: data.neighbourhood_vibe || null,
          noSmoking: data.no_smoking ?? true,
          quietHours: data.quiet_hours || null,
          tenantPrefs: data.tenant_prefs || null,
          genderPreference: data.gender_preference || "Any",
          couplesOk: data.couples_ok ?? false,
          minStayWeeks: data.min_stay_weeks ?? 1,
          maxStayWeeks: data.max_stay_weeks ?? 52,
          availableFrom: data.available_from || null,
          availableTo: data.available_to || null,
          safety: {
            securityCameras: data.security_cameras ?? false,
            securityCamerasLocation: data.security_cameras_location || "",
            weaponsOnProperty: data.weapons_on_property ?? false,
            weaponsExplanation: data.weapons_explanation || "",
            otherSafetyDetails: data.other_safety_details || "",
          },
          owner: data.owner_profile
            ? {
                id: data.owner_id,
                name: data.owner_profile.name || "Owner",
                bio: data.owner_profile.bio || "",
                verified: data.owner_profile.verified ?? false,
                identityVerified: data.owner_profile.identity_verified ?? false,
                profilePhoto: data.owner_profile.custom_pfp || null,
                listingsCount: data.owner_profile.listings_count || 0,
              }
            : {
                id: data.owner_id,
                name: "Owner",
                bio: "",
                verified: false,
                identityVerified: false,
                profilePhoto: null,
                listingsCount: 0,
              },
        };
        setRoom(normalized);
      })
      .catch((err) => {
        console.error("Failed to load listing:", err);
        setError("Failed to load listing");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleInterest = () => {
    setInterestSent(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading listing...</p>
        </div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">{error || "Listing not found"}</p>
          <Link href="/seeker/search" className="btn-primary py-2 px-6 rounded-xl text-sm inline-block">
            Back to search
          </Link>
        </div>
      </div>
    );
  }

  const hasSafetyInfo = room.safety && (
    room.safety.securityCameras ||
    room.safety.weaponsOnProperty ||
    room.safety.otherSafetyDetails
  );

  // Build amenities list from actual listing data
  const amenities: string[] = [];
  if (room.furnished) amenities.push("Furnished");
  if (room.billsIncluded) amenities.push("Bills included");
  if (room.internetIncluded) amenities.push(room.internetSpeed ? `WiFi (${room.internetSpeed})` : "WiFi included");
  if (room.airConditioning) amenities.push("Air conditioning");
  if (room.dishwasher) amenities.push("Dishwasher");
  if (room.laundry) amenities.push(`Laundry: ${room.laundry}`);
  if (room.petsAllowed) amenities.push(room.petDetails ? `Pets allowed (${room.petDetails})` : "Pets allowed");
  if (room.instantBook) amenities.push("Instant book available");

  // Build house rules from data
  const houseRules: string[] = [];
  if (room.noSmoking) houseRules.push("No smoking");
  if (room.quietHours) houseRules.push(`Quiet hours: ${room.quietHours}`);
  if (room.genderPreference && room.genderPreference !== "Any") houseRules.push(`Gender preference: ${room.genderPreference}`);
  if (room.couplesOk) houseRules.push("Couples welcome");
  if (room.tenantPrefs) houseRules.push(room.tenantPrefs);

  // Bond display
  const bondDisplay = room.bond
    ? room.bond
    : room.weeklyPrice
    ? `4 weeks rent (AUD $${room.weeklyPrice * 4})`
    : null;

  // Min stay display
  const minStayDisplay = room.minStay || (room.minStayWeeks ? `${room.minStayWeeks} week${room.minStayWeeks !== 1 ? "s" : ""}` : null);

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400"
      >
        <Link href="/seeker/search" className="hover:text-rose-500 transition-colors">
          Search
        </Link>
        <span>/</span>
        <span className="text-slate-900 dark:text-white font-medium">
          {room.suburb}{room.postcode ? `, ${room.postcode}` : ""}
        </span>
      </motion.div>

      {/* Photo gallery */}
      {room.photos && room.photos.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-4 gap-2 rounded-2xl overflow-hidden"
        >
          <div className="col-span-4 md:col-span-2 aspect-video bg-slate-100 dark:bg-slate-800 overflow-hidden cursor-pointer">
            <img
              src={room.photos[activePhoto] || room.photos[0]}
              alt={`${room.title} photo ${activePhoto + 1}`}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
          {room.photos.slice(1, 5).map((photo: string, i: number) => (
            <div
              key={i}
              onClick={() => setActivePhoto(i + 1)}
              className={`hidden md:block aspect-video bg-slate-100 dark:bg-slate-800 overflow-hidden cursor-pointer ${
                activePhoto === i + 1 ? "ring-2 ring-rose-500 ring-offset-1" : ""
              }`}
            >
              <img
                src={photo}
                alt={`${room.title} photo ${i + 2}`}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            </div>
          ))}
        </motion.div>
      ) : (
        <div className="aspect-video bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
          <p className="text-slate-400 dark:text-slate-500">No photos available</p>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              {room.title || `${room.address}, ${room.suburb}`}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {room.address}{room.suburb ? `, ${room.suburb}` : ""} {room.postcode}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              {room.propertyType} - {room.placeType} - {room.bedrooms} bed{room.bedrooms !== 1 ? "s" : ""} - {room.bathrooms} bath ({room.bathroomType}) - Up to {room.maxGuests} guest{room.maxGuests !== 1 ? "s" : ""}
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              <span className="px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-sm">
                AUD ${room.weeklyPrice}/wk
              </span>
              {room.billsIncluded && (
                <span className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                  Bills included
                </span>
              )}
              {minStayDisplay && (
                <span className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-medium">
                  Min stay: {minStayDisplay}
                </span>
              )}
              {bondDisplay && (
                <span className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-medium">
                  Bond: {bondDisplay}
                </span>
              )}
            </div>
            {/* Discounts */}
            {(room.weeklyDiscount || room.monthlyDiscount) && (
              <div className="flex gap-2 mt-3">
                {room.weeklyDiscount > 0 && (
                  <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20">
                    {room.weeklyDiscount}% weekly discount
                  </span>
                )}
                {room.monthlyDiscount > 0 && (
                  <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20">
                    {room.monthlyDiscount}% monthly discount
                  </span>
                )}
              </div>
            )}
          </motion.div>

          {/* Highlights */}
          {room.highlights && room.highlights.length > 0 && (
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Highlights</h2>
              <div className="flex flex-wrap gap-2">
                {room.highlights.map((h: string, i: number) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-full text-sm font-medium bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20"
                  >
                    {h}
                  </span>
                ))}
              </div>
            </motion.section>
          )}

          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">About this room</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{room.description}</p>
          </motion.section>

          {/* Who else lives here */}
          {room.whoElseLivesHere && room.placeType !== "Entire place" && (
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.17 }}>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Who else is there?</h2>
              <div className="card-subtle p-4 rounded-xl">
                <p className="text-sm text-slate-600 dark:text-slate-300">{room.whoElseLivesHere}</p>
                {room.totalOtherPeople && (
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Total other people: {room.totalOtherPeople}</p>
                )}
              </div>
            </motion.section>
          )}

          {/* Amenities */}
          {amenities.length > 0 && (
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Amenities</h2>
              <div className="grid sm:grid-cols-2 gap-2">
                {amenities.map((item: string, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <span className="text-rose-500">&#10003;</span>
                    {item}
                  </div>
                ))}
              </div>
            </motion.section>
          )}

          {/* House rules */}
          {houseRules.length > 0 && (
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">House rules</h2>
              <div className="space-y-2">
                {houseRules.map((rule: string, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <span className="text-slate-400 dark:text-slate-500">&bull;</span>
                    {rule}
                  </div>
                ))}
              </div>
            </motion.section>
          )}

          {/* Transport */}
          {room.nearestTransport && (
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Transport</h2>
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {room.nearestTransport}
              </div>
            </motion.section>
          )}

          {/* Availability */}
          {(room.availableFrom || room.availableTo) && (
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.31 }}>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Availability</h2>
              <div className="card-subtle p-4 rounded-xl text-sm text-slate-600 dark:text-slate-300">
                {room.availableFrom && <p>Available from: {new Date(room.availableFrom).toLocaleDateString()}</p>}
                {room.availableTo && <p>Available until: {new Date(room.availableTo).toLocaleDateString()}</p>}
                <p className="mt-1">Stay: {room.minStayWeeks} - {room.maxStayWeeks} weeks</p>
              </div>
            </motion.section>
          )}

          {/* Safety section */}
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.33 }}>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Safety &amp; property info</h2>
            <div className="card p-5 rounded-2xl space-y-3">
              {hasSafetyInfo ? (
                <>
                  {room.safety.securityCameras && (
                    <div className="flex items-start gap-2 text-sm">
                      <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <div>
                        <p className="font-medium text-slate-700 dark:text-slate-300">Security cameras on property</p>
                        {room.safety.securityCamerasLocation && (
                          <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">Location: {room.safety.securityCamerasLocation}</p>
                        )}
                      </div>
                    </div>
                  )}
                  {room.safety.weaponsOnProperty && (
                    <div className="flex items-start gap-2 text-sm">
                      <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <div>
                        <p className="font-medium text-slate-700 dark:text-slate-300">Weapons stored on property</p>
                        {room.safety.weaponsExplanation && (
                          <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">{room.safety.weaponsExplanation}</p>
                        )}
                      </div>
                    </div>
                  )}
                  {room.safety.otherSafetyDetails && (
                    <div className="flex items-start gap-2 text-sm">
                      <svg className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <div>
                        <p className="font-medium text-slate-700 dark:text-slate-300">Other safety info</p>
                        <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">{room.safety.otherSafetyDetails}</p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  No specific safety details disclosed by the owner. Always inspect the property before committing.
                </p>
              )}
            </div>
          </motion.section>

          {/* Owner */}
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Owner</h2>
            <Link href={`/users/profile/${room.owner.id}`} className="block card p-5 rounded-2xl hover:shadow-md dark:hover:shadow-2xl transition-shadow cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center text-white font-bold text-lg shrink-0 overflow-hidden ring-2 ring-white dark:ring-slate-800 shadow-lg">
                  {room.owner.profilePhoto ? (
                    <img src={room.owner.profilePhoto} alt={room.owner.name} className="w-full h-full object-cover" />
                  ) : (
                    room.owner.name[0]
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {room.owner.name}
                    </span>
                    {room.owner.verified && (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        &#10003; Verified
                      </span>
                    )}
                  </div>
                  {room.owner.listingsCount > 0 && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">{room.owner.listingsCount} listing{room.owner.listingsCount !== 1 ? "s" : ""}</p>
                  )}
                </div>
                <svg className="w-5 h-5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
              {room.owner.bio && (
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-3">{room.owner.bio}</p>
              )}
            </Link>
          </motion.section>

          {/* Report button */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            <button
              onClick={() => setReportOpen(true)}
              className="text-sm text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-colors flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
              </svg>
              Report this listing
            </button>
          </motion.div>
        </div>

        {/* Sidebar CTA */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card p-6 rounded-2xl space-y-4"
              id="interest"
            >
              <div className="text-center">
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  AUD ${room.weeklyPrice}
                  <span className="text-base font-normal text-slate-500 dark:text-slate-400">/wk</span>
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  {room.placeType} - {room.furnished ? "Furnished" : "Unfurnished"}
                </p>
              </div>

              {/* Deal customization section */}
              {session && !interestSent && (
                <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-700/50">
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Customise your deal</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Start date</label>
                      <input
                        type="date"
                        value={dealStartDate}
                        onChange={(e) => setDealStartDate(e.target.value)}
                        className="input-field text-xs py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">End date</label>
                      <input
                        type="date"
                        value={dealEndDate}
                        onChange={(e) => setDealEndDate(e.target.value)}
                        className="input-field text-xs py-2"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Total guests</label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setDealGuests(Math.max(1, dealGuests - 1))}
                        className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:border-rose-400 text-sm"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-sm font-bold text-slate-900 dark:text-white">{dealGuests}</span>
                      <button
                        type="button"
                        onClick={() => setDealGuests(Math.min(room.maxGuests || 20, dealGuests + 1))}
                        className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:border-rose-400 text-sm"
                      >
                        +
                      </button>
                      <span className="text-[11px] text-slate-400 ml-1">max {room.maxGuests}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Special requests (optional)</label>
                    <textarea
                      placeholder="e.g. Early check-in, extra keys..."
                      value={dealSpecialRequests}
                      onChange={(e) => setDealSpecialRequests(e.target.value)}
                      rows={2}
                      className="input-field text-xs"
                    />
                  </div>
                </div>
              )}

              {!session ? (
                <div className="text-center space-y-3">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Sign in to express interest
                  </p>
                  <Link
                    href="/signin"
                    className="btn-primary py-3 px-6 rounded-xl text-sm inline-block w-full text-center"
                  >
                    Sign in
                  </Link>
                </div>
              ) : interestSent ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl p-4 text-center"
                >
                  <svg className="w-8 h-8 mx-auto text-emerald-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                    Interest sent!
                  </p>
                  <p className="text-xs text-emerald-500 dark:text-emerald-400/70 mt-1">
                    The owner will review your profile.
                  </p>
                  {dealStartDate && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                      {dealStartDate}{dealEndDate ? ` - ${dealEndDate}` : ""} - {dealGuests} guest{dealGuests !== 1 ? "s" : ""}
                    </p>
                  )}
                </motion.div>
              ) : (
                <>
                  <textarea
                    placeholder="Introduce yourself briefly (optional)..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    className="input-field text-sm"
                  />
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleInterest}
                    className="btn-primary py-3 rounded-xl text-sm font-bold w-full"
                  >
                    I&apos;m interested
                  </motion.button>
                </>
              )}
            </motion.div>

            <Link
              href="/seeker/search"
              className="block text-center text-sm text-slate-500 dark:text-slate-400 hover:text-rose-500 transition-colors"
            >
              &larr; Back to search
            </Link>
          </div>
        </div>
      </div>

      {/* Report modal */}
      <ReportModal
        isOpen={reportOpen}
        onClose={() => setReportOpen(false)}
        itemType="listing"
        itemId={room.id}
      />
    </div>
  );
}
