import { useState } from "react";
import { motion } from "framer-motion";

interface ReviewFormProps {
  reviewType: "seeker_to_owner" | "owner_to_seeker";
  otherUserName: string;
  listingTitle?: string;
  onSubmit: (data: ReviewFormData) => Promise<void>;
  submitting?: boolean;
}

export interface ReviewFormData {
  rating: number;
  review_text: string;
  migrant_friendliness?: number;
  communication_language?: string;
  reliability_rating?: number;
  cleanliness_rating?: number;
  payment_rating?: number;
}

const LANGUAGES = [
  "English", "Mandarin", "Hindi", "Spanish", "Arabic",
  "Portuguese", "Japanese", "Korean", "Vietnamese", "Thai",
  "Indonesian", "Tagalog", "Other",
];

function StarPicker({ value, onChange, label, size = "lg" }: {
  value: number;
  onChange: (v: number) => void;
  label: string;
  size?: "sm" | "lg";
}) {
  const [hover, setHover] = useState(0);
  const starSize = size === "lg" ? "w-10 h-10" : "w-7 h-7";

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
        {label}
      </label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange(star)}
            className="transition-transform hover:scale-110 focus:outline-none"
          >
            <svg
              className={`${starSize} transition-colors ${
                star <= (hover || value)
                  ? "text-amber-400"
                  : "text-slate-200 dark:text-slate-700"
              }`}
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </button>
        ))}
        {value > 0 && (
          <span className="ml-2 text-sm text-slate-500 dark:text-slate-400 self-center">
            {value}/5
          </span>
        )}
      </div>
    </div>
  );
}

export default function ReviewForm({
  reviewType,
  otherUserName,
  listingTitle,
  onSubmit,
  submitting,
}: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [migrantFriendliness, setMigrantFriendliness] = useState(0);
  const [language, setLanguage] = useState("");
  const [reliability, setReliability] = useState(0);
  const [cleanliness, setCleanliness] = useState(0);
  const [payment, setPayment] = useState(0);
  const [error, setError] = useState("");

  const isSeeker = reviewType === "seeker_to_owner";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (rating === 0) {
      setError("Please select an overall rating");
      return;
    }

    const data: ReviewFormData = {
      rating,
      review_text: reviewText,
    };

    if (isSeeker) {
      if (migrantFriendliness > 0) data.migrant_friendliness = migrantFriendliness;
      if (language) data.communication_language = language;
    } else {
      if (reliability > 0) data.reliability_rating = reliability;
      if (cleanliness > 0) data.cleanliness_rating = cleanliness;
      if (payment > 0) data.payment_rating = payment;
    }

    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Context info */}
      <div className="card-subtle p-4 rounded-xl">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {isSeeker ? (
            <>Reviewing <strong>{otherUserName}</strong>{listingTitle ? <> for <strong>{listingTitle}</strong></> : null}</>
          ) : (
            <>Rating <strong>{otherUserName}</strong> as a tenant</>
          )}
        </p>
      </div>

      {/* Overall rating */}
      <StarPicker value={rating} onChange={setRating} label="Overall Rating *" />

      {/* Seeker-specific: migrant friendliness + language */}
      {isSeeker && (
        <>
          <StarPicker
            value={migrantFriendliness}
            onChange={setMigrantFriendliness}
            label="Migrant Friendliness"
            size="sm"
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
              Communication Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="input-field"
            >
              <option value="">Select language spoken...</option>
              {LANGUAGES.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
        </>
      )}

      {/* Owner-specific: reliability, cleanliness, payment */}
      {!isSeeker && (
        <>
          <StarPicker value={reliability} onChange={setReliability} label="Reliability" size="sm" />
          <StarPicker value={cleanliness} onChange={setCleanliness} label="Cleanliness" size="sm" />
          <StarPicker value={payment} onChange={setPayment} label="Payment Punctuality" size="sm" />
        </>
      )}

      {/* Review text */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
          Your Review
        </label>
        <textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder={
            isSeeker
              ? "How was your experience staying here? Was the owner welcoming to migrants?"
              : "How was this tenant? Were they respectful and punctual with payments?"
          }
          rows={4}
          maxLength={2000}
          className="input-field resize-none"
        />
        <p className="text-xs text-slate-400 mt-1 text-right">
          {reviewText.length}/2000
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <motion.button
        type="submit"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        disabled={submitting || rating === 0}
        className="btn-primary w-full py-3.5 rounded-xl text-sm font-semibold disabled:opacity-50"
      >
        {submitting ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Submitting...
          </span>
        ) : (
          "Submit Review"
        )}
      </motion.button>
    </form>
  );
}
