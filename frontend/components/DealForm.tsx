import { useState } from "react";
import { motion } from "framer-motion";

export interface DealFormData {
  moveInDate: string;
  moveOutDate: string;
  numberOfGuests: number;
  guestNames: string;
  specialRequests: string;
  dealNotes: string;
}

interface DealFormProps {
  onSubmit: (data: DealFormData) => void;
  loading?: boolean;
  listingTitle?: string;
  weeklyPrice?: number;
}

export default function DealForm({ onSubmit, loading, listingTitle, weeklyPrice }: DealFormProps) {
  const [form, setForm] = useState<DealFormData>({
    moveInDate: "",
    moveOutDate: "",
    numberOfGuests: 1,
    guestNames: "",
    specialRequests: "",
    dealNotes: "",
  });

  const update = (key: keyof DealFormData, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  const weeksEstimate =
    form.moveInDate && form.moveOutDate
      ? Math.max(1, Math.ceil((new Date(form.moveOutDate).getTime() - new Date(form.moveInDate).getTime()) / (7 * 24 * 60 * 60 * 1000)))
      : null;

  return (
    <form onSubmit={handleSubmit} className="card p-6 rounded-2xl space-y-5">
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Customise your deal</h3>
        {listingTitle && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            For: {listingTitle}
          </p>
        )}
      </div>

      {/* Move-in / Move-out dates */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Move-in date *</label>
          <input
            type="date"
            value={form.moveInDate}
            onChange={(e) => update("moveInDate", e.target.value)}
            required
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Move-out date (optional)</label>
          <input
            type="date"
            value={form.moveOutDate}
            onChange={(e) => update("moveOutDate", e.target.value)}
            min={form.moveInDate || undefined}
            className="input-field"
          />
        </div>
      </div>

      {/* Stay estimate */}
      {weeksEstimate && weeklyPrice && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20">
          <p className="text-sm text-emerald-700 dark:text-emerald-400">
            ~{weeksEstimate} week{weeksEstimate !== 1 ? "s" : ""} &middot; Est. total rent: <span className="font-bold">AUD ${(weeksEstimate * weeklyPrice).toLocaleString()}</span>
          </p>
        </div>
      )}

      {/* Number of guests */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Number of guests</label>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => update("numberOfGuests", Math.max(1, form.numberOfGuests - 1))}
            className="w-8 h-8 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center text-slate-500 hover:border-rose-400 hover:text-rose-500 transition-colors"
          >
            -
          </button>
          <span className="w-8 text-center text-sm font-bold text-slate-900 dark:text-white">{form.numberOfGuests}</span>
          <button
            type="button"
            onClick={() => update("numberOfGuests", Math.min(20, form.numberOfGuests + 1))}
            className="w-8 h-8 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center text-slate-500 hover:border-rose-400 hover:text-rose-500 transition-colors"
          >
            +
          </button>
        </div>
      </div>

      {/* Guest names */}
      {form.numberOfGuests > 1 && (
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Guest names (optional)</label>
          <input
            type="text"
            placeholder="e.g. John Smith, Jane Doe"
            value={form.guestNames}
            onChange={(e) => update("guestNames", e.target.value)}
            className="input-field"
          />
        </div>
      )}

      {/* Special requests */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Special requests</label>
        <textarea
          placeholder="e.g. Early check-in, extra bedding, parking spot needed..."
          value={form.specialRequests}
          onChange={(e) => update("specialRequests", e.target.value)}
          rows={3}
          maxLength={500}
          className="input-field"
        />
        <p className="text-xs text-slate-400 mt-1">{form.specialRequests.length}/500</p>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Additional notes (optional)</label>
        <textarea
          placeholder="Anything else the owner should know..."
          value={form.dealNotes}
          onChange={(e) => update("dealNotes", e.target.value)}
          rows={2}
          maxLength={1000}
          className="input-field"
        />
      </div>

      {/* Fee notice */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          A one-time <span className="font-bold">AUD $99</span> owner fee applies to confirm this deal.
          The seeker may optionally pay an <span className="font-bold">AUD $19</span> support fee after.
        </p>
      </div>

      {/* Submit */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        disabled={loading || !form.moveInDate}
        className="w-full btn-primary py-3 px-6 rounded-xl text-sm font-semibold disabled:opacity-50"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Processing...
          </span>
        ) : (
          "Confirm deal & pay AUD $99"
        )}
      </motion.button>
    </form>
  );
}
