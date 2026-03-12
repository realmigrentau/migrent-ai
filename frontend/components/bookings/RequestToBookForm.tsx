import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Users, MessageSquare, Zap, Send } from "lucide-react";

interface Listing {
  id: string;
  title?: string;
  address: string;
  weekly_price: number;
  instant_book_enabled?: boolean;
  instant_book?: boolean;
  min_stay_weeks?: number;
  max_stay_weeks?: number;
  max_guests?: number;
}

interface RequestToBookFormProps {
  listing: Listing;
  onSubmit: (data: {
    listing_id: string;
    check_in: string;
    check_out: string;
    guests: number;
    message_to_owner?: string;
  }) => Promise<void>;
  loading?: boolean;
  disabled?: boolean;
}

export default function RequestToBookForm({
  listing,
  onSubmit,
  loading,
  disabled,
}: RequestToBookFormProps) {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const isInstantBook = listing.instant_book_enabled || listing.instant_book;
  const maxGuests = listing.max_guests || 20;

  // Calculate weeks and total
  const weeksEstimate =
    checkIn && checkOut
      ? Math.max(
          1,
          Math.ceil(
            (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
              (7 * 24 * 60 * 60 * 1000)
          )
        )
      : null;

  const totalRent = weeksEstimate
    ? listing.weekly_price * weeksEstimate
    : null;

  const today = new Date().toISOString().split("T")[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!checkIn || !checkOut) {
      setError("Please select check-in and check-out dates");
      return;
    }

    if (new Date(checkOut) <= new Date(checkIn)) {
      setError("Check-out must be after check-in");
      return;
    }

    try {
      await onSubmit({
        listing_id: listing.id,
        check_in: checkIn,
        check_out: checkOut,
        guests,
        message_to_owner: message || undefined,
      });
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="card p-6 rounded-2xl space-y-5 border border-slate-200 dark:border-slate-700"
    >
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              AUD ${listing.weekly_price.toLocaleString()}
            </span>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {" "}
              / week
            </span>
          </div>
          {isInstantBook && (
            <span className="flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-400 px-2.5 py-1 rounded-full">
              <Zap className="w-3 h-3" />
              Instant Book
            </span>
          )}
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
            Check-in
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              min={today}
              required
              className="input-field pl-10"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
            Check-out
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              min={checkIn || today}
              required
              className="input-field pl-10"
            />
          </div>
        </div>
      </div>

      {/* Guests */}
      <div>
        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
          Guests
        </label>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setGuests(Math.max(1, guests - 1))}
            className="w-8 h-8 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center text-slate-500 hover:border-rose-400 hover:text-rose-500 transition-colors"
          >
            -
          </button>
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-slate-400" />
            <span className="w-6 text-center text-sm font-bold text-slate-900 dark:text-white">
              {guests}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setGuests(Math.min(maxGuests, guests + 1))}
            className="w-8 h-8 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center text-slate-500 hover:border-rose-400 hover:text-rose-500 transition-colors"
          >
            +
          </button>
          <span className="text-xs text-slate-400">max {maxGuests}</span>
        </div>
      </div>

      {/* Message to owner */}
      {!isInstantBook && (
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
            <MessageSquare className="w-3.5 h-3.5 inline mr-1" />
            Message to owner (optional)
          </label>
          <textarea
            placeholder="Introduce yourself, mention your visa type, when you'll arrive in AU..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            maxLength={1000}
            className="input-field"
          />
          <p className="text-xs text-slate-400 mt-1">{message.length}/1000</p>
        </div>
      )}

      {/* Price breakdown */}
      {weeksEstimate && totalRent !== null && (
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-2">
          <div className="flex justify-between text-sm text-slate-600 dark:text-slate-300">
            <span>
              AUD ${listing.weekly_price.toLocaleString()} x {weeksEstimate} week
              {weeksEstimate !== 1 ? "s" : ""}
            </span>
            <span>AUD ${totalRent.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm text-slate-600 dark:text-slate-300">
            <span>Owner service fee</span>
            <span>AUD $99</span>
          </div>
          <div className="flex justify-between text-sm text-slate-600 dark:text-slate-300">
            <span>Seeker service fee</span>
            <span>AUD $19</span>
          </div>
          <div className="border-t border-slate-200 dark:border-slate-700 pt-2 flex justify-between text-sm font-bold text-slate-900 dark:text-white">
            <span>MigRent fees total</span>
            <span>AUD $118</span>
          </div>
          <p className="text-xs text-slate-400">
            Rent (AUD ${totalRent.toLocaleString()}) is paid directly to the owner.
            MigRent only charges the AUD $118 service fee at booking.
          </p>
        </div>
      )}

      {/* Stepper */}
      <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20">
        <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-1">
          How it works
        </p>
        <ol className="text-xs text-blue-600 dark:text-blue-300 space-y-0.5 list-decimal list-inside">
          {isInstantBook ? (
            <>
              <li>Pay the service fee to confirm</li>
              <li>Owner is notified of your booking</li>
              <li>Coordinate move-in details</li>
            </>
          ) : (
            <>
              <li>Send your request (no payment yet)</li>
              <li>Owner reviews and accepts or declines</li>
              <li>If accepted, pay the service fee to confirm</li>
              <li>Coordinate move-in details</li>
            </>
          )}
        </ol>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Submit */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        disabled={loading || disabled || !checkIn || !checkOut}
        className="w-full btn-primary py-3.5 px-6 rounded-xl text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Processing...
          </span>
        ) : isInstantBook ? (
          <>
            <Zap className="w-4 h-4" />
            Instant Book - Pay AUD $118
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            Request to Book
          </>
        )}
      </motion.button>

      <p className="text-center text-xs text-slate-400">
        {isInstantBook
          ? "Your booking will be confirmed after payment."
          : "You won't be charged until the owner accepts."}
      </p>
    </form>
  );
}
