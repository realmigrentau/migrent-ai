import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../../../hooks/useAuth";
import ListingForm, { ListingFormData } from "../../../../components/ListingForm";
import { getListingById, updateListing } from "../../../../lib/api";
import { DollarSign, ArrowLeft, AlertTriangle } from "lucide-react";
import ModerationStatusBanner from "../../../../components/listings/ModerationStatusBanner";

export default function EditListing() {
  const { session, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { id } = router.query;

  const [listing, setListing] = useState<any>(null);
  const [loadingListing, setLoadingListing] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [notOwner, setNotOwner] = useState(false);

  // Fetch listing data
  useEffect(() => {
    if (!id || typeof id !== "string") return;

    (async () => {
      setLoadingListing(true);
      try {
        const data = await getListingById(id);
        if (!data) {
          setError("Listing not found");
          setLoadingListing(false);
          return;
        }

        // Check ownership
        if (user && data.owner_id !== user.id) {
          setNotOwner(true);
          setLoadingListing(false);
          return;
        }

        setListing(data);
      } catch (err) {
        setError("Failed to load listing");
      } finally {
        setLoadingListing(false);
      }
    })();
  }, [id, user]);

  // Map Supabase listing data -> ListingFormData for the form
  const initialData: Partial<ListingFormData> | undefined = listing
    ? {
        suburb: listing.suburb || "",
        postcode: listing.postcode?.toString() || "",
        propertyType: listing.property_type || "Apartment",
        placeType: listing.place_type || "Private room",
        weeklyPrice: listing.weekly_price || 250,
        bond: listing.bond || "",
        maxGuests: listing.max_guests || 1,
        bedrooms: listing.bedrooms || 1,
        beds: listing.beds || 1,
        bathrooms: listing.bathrooms || 1,
        bathroomType: listing.bathroom_type || "shared",
        whoElseLivesHere: listing.who_else_lives_here || "",
        totalOtherPeople: listing.total_other_people || "",
        furnished: listing.furnished ?? true,
        billsIncluded: listing.bills_included ?? false,
        parking: listing.parking ?? false,
        title: listing.title || "",
        description: listing.description || "",
        highlights: listing.highlights || [],
        weeklyDiscount: listing.weekly_discount?.toString() || "",
        monthlyDiscount: listing.monthly_discount?.toString() || "",
        availableFrom: listing.available_from || "",
        availableTo: listing.available_to || "",
        instantBook: listing.instant_book ?? false,
        internetIncluded: listing.internet_included ?? false,
        internetSpeed: listing.internet_speed || "",
        petsAllowed: listing.pets_allowed ?? false,
        petDetails: listing.pet_details || "",
        airConditioning: listing.air_conditioning ?? false,
        laundry: listing.laundry || "Shared",
        dishwasher: listing.dishwasher ?? false,
        nearestTransport: listing.nearest_transport || "",
        neighbourhoodVibe: listing.neighbourhood_vibe || "",
        genderPreference: listing.gender_preference || "Any",
        couplesOk: listing.couples_ok ?? false,
        photos: [],
        photoUrls: listing.images || [],
        noSmoking: listing.no_smoking ?? true,
        quietHours: listing.quiet_hours || "10pm-7am",
        tenantPrefs: listing.tenant_prefs || "",
        minStay: listing.min_stay || "",
        securityCameras: listing.security_cameras ?? false,
        securityCamerasLocation: listing.security_cameras_location || "",
        weaponsOnProperty: listing.weapons_on_property ?? false,
        weaponsExplanation: listing.weapons_explanation || "",
        otherSafetyDetails: listing.other_safety_details || "",
        latitude: listing.latitude || null,
        longitude: listing.longitude || null,
        nearestStation: listing.nearest_station || null,
        stationWalkMin: listing.station_distance_min || null,
      }
    : undefined;

  const handleSubmit = async (data: ListingFormData) => {
    if (!session || !id || typeof id !== "string") return;
    setSubmitting(true);
    setError("");

    const imageUrls = data.photoUrls || [];

    const result = await updateListing(session.access_token, id, {
      address: `${data.suburb}, ${data.postcode}`,
      suburb: data.suburb,
      postcode: data.postcode,
      weeklyPrice: data.weeklyPrice,
      description: data.description,
      title: data.title,
      images: imageUrls.length > 0 ? imageUrls : undefined,
      propertyType: data.propertyType,
      placeType: data.placeType,
      maxGuests: data.maxGuests,
      bedrooms: data.bedrooms,
      beds: data.beds,
      bathrooms: data.bathrooms,
      bathroomType: data.bathroomType,
      whoElseLivesHere: data.whoElseLivesHere,
      totalOtherPeople: data.totalOtherPeople,
      furnished: data.furnished,
      billsIncluded: data.billsIncluded,
      parking: data.parking,
      highlights: data.highlights,
      weeklyDiscount: data.weeklyDiscount ? parseFloat(data.weeklyDiscount) : undefined,
      monthlyDiscount: data.monthlyDiscount ? parseFloat(data.monthlyDiscount) : undefined,
      bond: data.bond,
      noSmoking: data.noSmoking,
      quietHours: data.quietHours,
      tenantPrefs: data.tenantPrefs,
      minStay: data.minStay,
      securityCameras: data.securityCameras,
      securityCamerasLocation: data.securityCamerasLocation,
      weaponsOnProperty: data.weaponsOnProperty,
      weaponsExplanation: data.weaponsExplanation,
      otherSafetyDetails: data.otherSafetyDetails,
      availableFrom: data.availableFrom || undefined,
      availableTo: data.availableTo || undefined,
      instantBook: data.instantBook,
      internetIncluded: data.internetIncluded,
      internetSpeed: data.internetSpeed || undefined,
      petsAllowed: data.petsAllowed,
      petDetails: data.petDetails || undefined,
      airConditioning: data.airConditioning,
      laundry: data.laundry || undefined,
      dishwasher: data.dishwasher,
      nearestTransport: data.nearestTransport || undefined,
      neighbourhoodVibe: data.neighbourhoodVibe || undefined,
      genderPreference: data.genderPreference || undefined,
      couplesOk: data.couplesOk,
      latitude: data.latitude,
      longitude: data.longitude,
    });

    if (result && !result.error) {
      setSuccess(true);
      setTimeout(() => router.push("/owner/listings"), 1500);
    } else {
      setError(result?.error || "Failed to update listing. Please try again.");
      setSubmitting(false);
    }
  };

  // Loading states
  if (authLoading || loadingListing)
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-rose-300 dark:border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
      </div>
    );

  if (!session)
    return (
      <div className="card p-8 rounded-2xl text-center max-w-md mx-auto mt-12">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Sign in required</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Sign in as an owner to edit a listing.</p>
        <Link href="/signin" className="btn-primary py-3 px-6 rounded-xl text-sm inline-block">Sign in</Link>
      </div>
    );

  if (notOwner)
    return (
      <div className="card p-8 rounded-2xl text-center max-w-md mx-auto mt-12">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Not authorized</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">You can only edit your own listings.</p>
        <Link href="/owner/listings" className="btn-primary py-3 px-6 rounded-xl text-sm inline-block">Back to listings</Link>
      </div>
    );

  if (error && !listing)
    return (
      <div className="card p-8 rounded-2xl text-center max-w-md mx-auto mt-12">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Error</h2>
        <p className="text-sm text-red-500 mb-4">{error}</p>
        <Link href="/owner/listings" className="btn-primary py-3 px-6 rounded-xl text-sm inline-block">Back to listings</Link>
      </div>
    );

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-2">
          <Link href="/owner/listings" className="hover:text-rose-500 transition-colors flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" />
            My listings
          </Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-white font-medium">Edit listing</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
          Edit <span className="gradient-text-accent">Listing</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          Update your listing details. Changes will be saved to your listing.
        </p>
      </motion.div>

      {/* Moderation Status Banner */}
      {listing && (
        <ModerationStatusBanner
          status={listing.moderation_status}
          moderationNotes={listing.moderation_notes}
          moderationReason={listing.moderation_reason}
        />
      )}

      {/* Custom Price Callout */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20"
      >
        <DollarSign className="w-5 h-5 text-emerald-500 shrink-0" />
        <p className="text-sm text-emerald-700 dark:text-emerald-400">
          Your custom price is preserved. The weekly rent field is editable and will not be overwritten by defaults.
        </p>
      </motion.div>

      {/* Success banner */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-medium"
          >
            Listing updated successfully! Redirecting...
          </motion.div>
        )}
      </AnimatePresence>

      {error && listing && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400"
        >
          {error}
        </motion.p>
      )}

      {listing && initialData && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <ListingForm
            onSubmit={handleSubmit}
            loading={submitting}
            initialData={initialData}
            userId={user?.id}
          />
        </motion.div>
      )}
    </div>
  );
}
