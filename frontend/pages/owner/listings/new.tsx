import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "../../../hooks/useAuth";
import ListingForm, { ListingFormData } from "../../../components/ListingForm";
import { createListing, getOwnerVerificationStatus } from "../../../lib/api";

export default function NewListing() {
  const { session, user, loading } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [verified, setVerified] = useState<boolean | null>(null);
  const [checkingVerification, setCheckingVerification] = useState(true);

  useEffect(() => {
    if (!session?.access_token) {
      setCheckingVerification(false);
      return;
    }
    getOwnerVerificationStatus(session.access_token).then((data) => {
      setVerified(data?.fully_verified ?? false);
      setCheckingVerification(false);
    });
  }, [session?.access_token]);

  const handleSubmit = async (data: ListingFormData) => {
    if (!session || !user) return;
    setSubmitting(true);
    setError("");

    // Photos are already uploaded via PhotoUploadZone - use URLs directly
    const imageUrls = data.photoUrls || [];

    const result = await createListing(session.access_token, {
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
      router.push("/owner/listings?created=1");
    } else {
      setError(result?.error || "Failed to create listing. Please try again.");
      setSubmitting(false);
    }
  };

  if (loading || checkingVerification)
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-[var(--color-line-2)] dark:border-[var(--color-primary-soft)] border-t-[var(--color-ink)] rounded-full animate-spin" />
      </div>
    );

  if (!session)
    return (
      <div className="card p-8 rounded-2xl text-center max-w-md mx-auto mt-12">
        <h2 className="text-lg font-bold text-[var(--color-ink)] mb-2">Sign in required</h2>
        <p className="text-sm text-[var(--color-ink-3)] mb-4">
          Sign in as an owner to create a listing.
        </p>
        <Link href="/signin" className="btn-primary py-3 px-6 rounded-xl text-sm inline-block">
          Sign in
        </Link>
      </div>
    );

  if (verified === false)
    return (
      <div className="max-w-lg mx-auto mt-12">
        <div className="card p-8 rounded-2xl text-center">
          <div className="w-16 h-16 bg-[var(--color-warn-50)] dark:bg-[var(--color-warn-50)]0/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[var(--color-warn-500)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-[var(--color-ink)] mb-2">Verification Required</h2>
          <p className="text-sm text-[var(--color-ink-3)] mb-6">
            To keep our community safe, all owners must complete identity verification before listing a room.
            This takes just a few minutes.
          </p>
          <div className="space-y-3 text-left mb-6">
            <div className="flex items-center gap-3 text-sm text-[var(--color-ink-2)]">
              <span className="w-6 h-6 rounded-full bg-[var(--color-accent-soft)] dark:bg-[var(--color-accent-soft)]0/10 flex items-center justify-center text-xs font-bold text-[var(--color-accent)]">1</span>
              Email verification (already done)
            </div>
            <div className="flex items-center gap-3 text-sm text-[var(--color-ink-2)]">
              <span className="w-6 h-6 rounded-full bg-[var(--color-warn-50)] dark:bg-[var(--color-warn-50)]0/10 flex items-center justify-center text-xs font-bold text-[var(--color-warn-600)]">2</span>
              Upload a government ID for review
            </div>
          </div>
          <Link
            href="/account/settings?tab=verification"
            className="btn-primary py-3 px-8 rounded-xl text-sm font-semibold inline-block"
          >
            Start Verification
          </Link>
        </div>
      </div>
    );

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 text-sm text-[var(--color-ink-3)] mb-2">
          <Link href="/owner/listings" className="hover:text-[var(--color-primary)] transition-colors">
            My listings
          </Link>
          <span>/</span>
          <span className="text-[var(--color-ink)] font-medium">New listing</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-[var(--color-ink)]">
          Post a Room
        </h1>
        <p className="text-sm text-[var(--color-ink-3)] mt-2">
          Complete the steps below to list your room for free.
        </p>
      </motion.div>

      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm p-3 rounded-xl bg-[var(--color-danger-50)] dark:bg-[var(--color-danger-50)]0/10 border border-[var(--color-danger-500)]/30 dark:border-[var(--color-danger-500)]/20 text-[var(--color-danger-500)] dark:text-[var(--color-danger-500)]"
        >
          {error}
        </motion.p>
      )}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <ListingForm onSubmit={handleSubmit} loading={submitting} userId={user?.id} />
      </motion.div>
    </div>
  );
}
