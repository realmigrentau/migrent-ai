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
      // The real street address. It is stored privately: the API returns
      // "Suburb Postcode" in its place to anyone who is not the owner or an
      // admin. This used to BE "Suburb, Postcode", so no street address was
      // ever captured at all.
      address: data.streetAddress || `${data.suburb}, ${data.postcode}`,
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
      // The API reports which of the two outcomes happened, so the confirmation
      // can say either "in review" or "saved as a draft, verify to publish"
      // rather than dropping the owner on a list with no explanation.
      router.push(
        result.is_draft ? "/owner/listings?draft=1" : "/owner/listings?created=1"
      );
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

  // Unverified owners used to hit a hard wall here and never saw the form.
  // They now get a heads-up and can build the listing; it saves as a draft
  // that only they can see, and verification is required to publish it.
  const verificationNotice = verified === false && (
    <div className="rounded-[var(--radius-xl)] border border-[var(--color-line-2)] bg-[var(--color-warn-50)] p-5">
      <div className="flex items-start gap-3">
        <svg className="w-5 h-5 text-[var(--color-warn-500)] mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
        <div className="min-w-0">
          <h2 className="text-[15px] font-semibold text-[var(--color-ink)]">
            Build it now, verify before it goes live
          </h2>
          <p className="text-[13.5px] text-[var(--color-ink-2)] leading-[1.6] mt-1">
            Fill this in and we will save it as a private draft. To publish it you
            will need to verify your ID, which takes a few minutes and is how we
            keep every listed host accountable to renters.
          </p>
          <Link
            href="/account/settings?tab=verification"
            className="text-[13.5px] font-semibold text-[var(--color-primary)] hover:underline underline-offset-[3px] inline-block mt-2"
          >
            Verify now instead
          </Link>
        </div>
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

      {verificationNotice}

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
