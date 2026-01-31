import { motion } from "framer-motion";

interface ListingCardProps {
  address: string;
  city?: string;
  postcode: string;
  weeklyPrice: number;
  description: string;
  matchScore?: number;
}

export default function ListingCard({
  address,
  city,
  postcode,
  weeklyPrice,
  description,
  matchScore,
}: ListingCardProps) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="group card p-5 hover:shadow-md dark:hover:shadow-2xl cursor-default"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base">{address}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {city ? `${city}, ` : ""}
            {postcode}
          </p>
        </div>
        <div className="shrink-0 px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20">
          <span className="text-rose-600 dark:text-rose-400 font-bold text-sm">
            ${weeklyPrice}
          </span>
          <span className="text-rose-400 dark:text-rose-500 text-xs">/wk</span>
        </div>
      </div>

      <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
        {description}
      </p>

      {matchScore !== undefined && (
        <div className="mt-3 flex items-center gap-2">
          <div className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${matchScore}%` }}
              transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500"
            />
          </div>
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            {matchScore}%
          </span>
        </div>
      )}
    </motion.div>
  );
}
