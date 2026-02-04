import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "../../../hooks/useAuth";
import ListingForm, { ListingFormData } from "../../../components/ListingForm";
import { createListing } from "../../../lib/api";

export default function NewListing() {
  const { session, user, loading } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && session && user?.user_metadata?.owner_account !== true) {
      router.replace("/owner/setup");
    }
  }, [loading, session, user, router]);

  const handleSubmit = async (data: ListingFormData) => {
    if (!session) return;
    setSubmitting(true);
    setError("");

    const result = await createListing(session.access_token, {
      address: `${data.suburb}, ${data.postcode}`,
      postcode: data.postcode,
      weeklyPrice: data.weeklyPrice,
      description: data.description,
      title: data.title,
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
    });

    if (result) {
      router.push("/owner/listings?created=1");
    } else {
      setError("Failed to create listing. Please try again.");
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-rose-300 dark:border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
      </div>
    );

  if (!session)
    return (
      <div className="card p-8 rounded-2xl text-center max-w-md mx-auto mt-12">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Sign in required</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Sign in as an owner to create a listing.
        </p>
        <Link href="/signin" className="btn-primary py-3 px-6 rounded-xl text-sm inline-block">
          Sign in
        </Link>
      </div>
    );

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-2">
          <Link href="/owner/listings" className="hover:text-rose-500 transition-colors">
            My listings
          </Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-white font-medium">New listing</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
          Post a <span className="gradient-text-accent">Room</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          Complete the steps below. A one-time AUD $99 fee applies on publish.
        </p>
      </motion.div>

      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400"
        >
          {error}
        </motion.p>
      )}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <ListingForm onSubmit={handleSubmit} loading={submitting} />
      </motion.div>
    </div>
  );
}
