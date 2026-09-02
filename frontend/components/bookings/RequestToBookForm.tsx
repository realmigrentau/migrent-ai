import { useState } from "react";
import { Calendar, Users, MessageSquare, Zap, Send, Shield } from "lucide-react";

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
  available_from?: string;
  available_to?: string;
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
  // The host's availability window bounds the date pickers; the API enforces
  // the same rule, this just stops people picking dates that cannot work.
  const earliest = listing.available_from && listing.available_from > today ? listing.available_from : today;
  const latest = listing.available_to || undefined;

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
    if (checkIn < earliest) {
      setError(`This room is available from ${earliest}`);
      return;
    }
    if (latest && checkOut > latest) {
      setError(`This room is only available until ${latest}`);
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
      className="bg-[var(--color-surface-2)] p-6 rounded-[14px] space-y-5 border border-[var(--color-line)]"
    >
      {/* Header */}
      <div className="flex items-end justify-between">
        <div className="flex items-baseline gap-1">
          <span className="font-serif text-[34px] leading-none tracking-[-0.02em] text-[var(--color-ink)] tabular-nums">
            ${listing.weekly_price.toLocaleString()}
          </span>
          <span className="text-[13px] text-[var(--color-ink-3)] font-medium">AUD/wk</span>
        </div>
        {isInstantBook ? (
          <span className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-[var(--color-warn-500)] bg-[#f4e4cf] dark:bg-[#2c1e10] px-2 h-[22px] rounded-full">
            <Zap className="w-3 h-3" />
            Instant book
          </span>
        ) : (
          <span className="font-mono text-[10.5px] uppercase tracking-[0.04em] text-[var(--color-ink-3)]">
            No charge until accepted
          </span>
        )}
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="block" htmlFor="booking-check-in">
          <div className="eyebrow mb-1.5">Move-in</div>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-ink-3)] pointer-events-none" aria-hidden="true" />
            <input
              id="booking-check-in"
              name="check_in"
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              min={earliest}
              max={latest}
              required
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? "booking-error" : undefined}
              className="input-field pl-10"
            />
          </div>
        </label>
        <label className="block" htmlFor="booking-check-out">
          <div className="eyebrow mb-1.5">Move-out</div>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-ink-3)] pointer-events-none" aria-hidden="true" />
            <input
              id="booking-check-out"
              name="check_out"
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              min={checkIn || earliest}
              max={latest}
              required
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? "booking-error" : undefined}
              className="input-field pl-10"
            />
          </div>
        </label>
      </div>

      {/* Guests */}
      <div>
        <div className="eyebrow mb-1.5">Tenants</div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setGuests(Math.max(1, guests - 1))}
            className="w-8 h-8 rounded-full border border-[var(--color-line-2)] flex items-center justify-center text-[var(--color-ink-2)] hover:border-[var(--color-ink-3)] hover:text-[var(--color-ink)] transition-colors disabled:opacity-30"
            disabled={guests <= 1}
          >
            -
          </button>
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-[var(--color-ink-3)]" />
            <span className="w-6 text-center text-sm font-bold text-[var(--color-ink)] tabular-nums">
              {guests}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setGuests(Math.min(maxGuests, guests + 1))}
            className="w-8 h-8 rounded-full border border-[var(--color-line-2)] flex items-center justify-center text-[var(--color-ink-2)] hover:border-[var(--color-ink-3)] hover:text-[var(--color-ink)] transition-colors"
          >
            +
          </button>
          <span className="text-[11.5px] text-[var(--color-ink-3)]">max {maxGuests}</span>
        </div>
      </div>

      {/* Message to owner */}
      {!isInstantBook && (
        <label className="block">
          <div className="eyebrow mb-1.5 flex items-center gap-1">
            <MessageSquare className="w-3 h-3" /> A few words for the host
          </div>
          <textarea
            placeholder="What you're studying or doing, when you arrived, why this place. 2-4 sentences is the sweet spot."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            maxLength={800}
            className="input-field"
          />
          <p className="text-[11px] text-[var(--color-ink-3)] mt-1 text-right tabular-nums">{message.length} / 800</p>
        </label>
      )}

      {/* Breakdown - if accepted */}
      {weeksEstimate && totalRent !== null && (
        <div className="p-4 rounded-[10px] bg-[var(--color-surface-sunk)]">
          <div className="eyebrow mb-2.5">{isInstantBook ? "Breakdown" : "Breakdown - if accepted"}</div>
          <div className="flex justify-between py-1.5 text-[13px]">
            <span className="text-[var(--color-ink-2)]">
              ${listing.weekly_price.toLocaleString()} x {weeksEstimate} week{weeksEstimate !== 1 ? "s" : ""} rent
            </span>
            <span className="text-[var(--color-ink)] tabular-nums">${totalRent.toLocaleString()}</span>
          </div>
          <div className="flex justify-between py-1.5 text-[13px]">
            <span className="text-[var(--color-ink-2)]">Bond (typically 4 weeks, refundable)</span>
            <span className="text-[var(--color-ink)] tabular-nums">${listing.weekly_price.toLocaleString()}</span>
          </div>
          <div className="flex justify-between py-1.5 text-[13px]">
            <span className="text-[var(--color-ink-2)]">MigRent renter fee</span>
            <span className="text-[var(--color-accent)] font-bold tabular-nums">$0</span>
          </div>
          <div className="h-px bg-[var(--color-line)] my-2" />
          <div className="flex justify-between text-[14px] font-bold text-[var(--color-ink)]">
            <span>Move-in total</span>
            <span className="tabular-nums">${(totalRent + listing.weekly_price).toLocaleString()}</span>
          </div>
          <p className="text-[11.5px] text-[var(--color-ink-3)] leading-relaxed mt-2">
            Rent and bond are paid directly to your host, not to MigRent.
          </p>
        </div>
      )}

      {/* Bond guidance.
          This banner used to claim MigRent held the bond itself.
          MigRent never holds bond money, and in NSW, VIC and QLD a residential bond
          must be lodged with the state bond authority rather than held by a
          third party, so the claim was both untrue and not something we could
          lawfully build as described. */}
      <div className="flex items-start gap-3 rounded-[6px] border-l-[3px] border-l-[var(--color-accent)] bg-[var(--color-accent-soft)] px-3.5 py-2.5">
        <Shield className="w-4 h-4 text-[var(--color-accent)] mt-0.5 shrink-0" />
        <div>
          <div className="text-[13px] font-semibold text-[var(--color-ink)]">Protect your bond</div>
          <div className="text-[12px] text-[var(--color-ink-2)] mt-0.5 leading-relaxed">
            Your bond should be lodged with your state&rsquo;s bond authority, not held by
            your host. Ask for the lodgement receipt, and never pay a bond before
            you have seen the room.
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 rounded-[10px] bg-[#f1d8d4] dark:bg-[#2b1614] text-sm text-[var(--color-danger-500)]">
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || disabled || !checkIn || !checkOut}
        className="btn-primary w-full h-[46px] text-[15px] rounded-[10px] disabled:opacity-50"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Processing...
          </span>
        ) : isInstantBook ? (
          <>
            <Zap className="w-4 h-4" />
            Instant book - pay $118
          </>
        ) : (
          <>
            Submit application
            <Send className="w-4 h-4" />
          </>
        )}
      </button>

      <p className="text-center text-[11.5px] text-[var(--color-ink-3)]">
        {isInstantBook
          ? "Your booking is confirmed after payment."
          : "You won't be charged until the host accepts."}
      </p>
    </form>
  );
}
