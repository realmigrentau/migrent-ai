import { useRouter } from "next/router";
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useAuth } from "../../hooks/useAuth";
import { useDealReview, submitReview } from "../../hooks/useReviews";
import ReviewForm, { ReviewFormData } from "../../components/reviews/ReviewForm";
import ReviewCard from "../../components/reviews/ReviewCard";
import SEOHead from "../../components/SEOHead";

export default function ReviewDealPage() {
  const router = useRouter();
  const { dealId } = router.query;
  const { session, user, loading: authLoading } = useAuth();
  const { context, loading, error, refetch } = useDealReview(dealId as string);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-rose-200 border-t-rose-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!session || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="card p-8 rounded-2xl max-w-md w-full text-center">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Sign in Required</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Please sign in to leave a review.</p>
          <Link href="/signin" className="btn-primary py-3 px-6 rounded-xl text-sm inline-block">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="card p-8 rounded-2xl max-w-md w-full text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
            <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Error</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{error}</p>
          <button onClick={() => router.back()} className="mt-4 text-sm text-rose-500 hover:text-rose-600">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!context) return null;

  const handleSubmit = async (formData: ReviewFormData) => {
    setSubmitting(true);
    const result = await submitReview({
      deal_id: context.deal.id,
      reviewed_user_id: context.other_user.id,
      listing_id: context.deal.listing_id || undefined,
      review_type: context.is_owner ? "owner_to_seeker" : "seeker_to_owner",
      rating: formData.rating,
      review_text: formData.review_text || undefined,
      migrant_friendliness: formData.migrant_friendliness,
      communication_language: formData.communication_language,
      reliability_rating: formData.reliability_rating,
      cleanliness_rating: formData.cleanliness_rating,
      payment_rating: formData.payment_rating,
    });

    setSubmitting(false);

    if (result.success) {
      setSubmitted(true);
      refetch();
    }
  };

  // Success state
  if (submitted || context.my_review) {
    return (
      <>
        <SEOHead title="Review Submitted - MigRent" description="Your review has been submitted" />
        <div className="min-h-screen py-12 px-4">
          <div className="max-w-lg mx-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="card p-8 rounded-2xl text-center"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Review Submitted!
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                Thank you for sharing your experience. Your review helps build trust in the MigRent community.
              </p>

              {/* Show the submitted review */}
              {context.my_review && (
                <div className="mb-6 text-left">
                  <ReviewCard review={context.my_review} />
                </div>
              )}

              {/* Show the other party's review if exists */}
              {context.other_review && (
                <div className="mb-6 text-left">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                    {context.other_user.name}'s review:
                  </p>
                  <ReviewCard review={context.other_review} />
                </div>
              )}

              <div className="flex gap-3 justify-center">
                <Link href="/dashboard" className="btn-primary py-2.5 px-5 rounded-xl text-sm">
                  Dashboard
                </Link>
                <button onClick={() => router.back()} className="btn-secondary py-2.5 px-5 rounded-xl text-sm">
                  Go Back
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </>
    );
  }

  // Can't review (deal not completed)
  if (!context.can_review) {
    return (
      <>
        <SEOHead title="Review - MigRent" description="Leave a review" />
        <div className="min-h-screen py-12 px-4">
          <div className="max-w-lg mx-auto">
            <div className="card p-8 rounded-2xl text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
                <svg className="w-7 h-7 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Review Not Available
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {context.deal.status !== "completed"
                  ? "Reviews can only be submitted after the deal is completed."
                  : "You have already submitted a review for this deal."}
              </p>
              <button onClick={() => router.back()} className="mt-4 text-sm text-rose-500 hover:text-rose-600">
                Go Back
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Review form
  return (
    <>
      <SEOHead
        title="Leave a Review - MigRent"
        description={`Review your experience with ${context.other_user.name}`}
      />
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-lg mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mb-4 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>

            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Leave a Review
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Share your experience to help the community
            </p>
          </motion.div>

          {/* Other user card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="card p-4 rounded-2xl mb-6"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center overflow-hidden">
                {context.other_user.photo ? (
                  <img src={context.other_user.photo} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-lg font-bold text-white">
                    {context.other_user.name.charAt(0)}
                  </span>
                )}
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {context.other_user.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {context.is_owner ? "Tenant" : "Property Owner"}
                </p>
              </div>
            </div>
            {context.listing.title && (
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <p className="text-xs text-slate-400 dark:text-slate-500">Property</p>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  {context.listing.title || context.listing.address}
                </p>
              </div>
            )}
          </motion.div>

          {/* Review form */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card p-6 rounded-2xl"
          >
            <ReviewForm
              reviewType={context.is_owner ? "owner_to_seeker" : "seeker_to_owner"}
              otherUserName={context.other_user.name}
              listingTitle={context.listing.title || context.listing.address}
              onSubmit={handleSubmit}
              submitting={submitting}
            />
          </motion.div>

          {/* Other party's review if they already reviewed */}
          {context.other_review && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mt-6"
            >
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                {context.other_user.name} already reviewed:
              </p>
              <ReviewCard review={context.other_review} />
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}
