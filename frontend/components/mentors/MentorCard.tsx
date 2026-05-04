import { motion } from "framer-motion";
import Link from "next/link";
import { Star, MapPin, MessageCircle, Globe, ChevronRight } from "lucide-react";

interface MentorCardProps {
  id: string;
  name: string;
  photo?: string;
  suburb: string;
  languages: string[];
  bio?: string;
  specialties: string[];
  hourlyRate: number; // cents
  rating: number;
  reviewCount: number;
  verified: boolean;
  index?: number;
}

export default function MentorCard({
  id,
  name,
  photo,
  suburb,
  languages,
  bio,
  specialties,
  hourlyRate,
  rating,
  reviewCount,
  verified,
  index = 0,
}: MentorCardProps) {
  const priceDisplay = `$${(hourlyRate / 100).toFixed(0)}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link href={`/mentor/${id}`}>
        <div className="card p-5 hover:shadow-lg transition-all cursor-pointer group">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center">
              {photo ? (
                <img src={photo} alt={name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-white font-bold text-lg">
                  {name?.charAt(0).toUpperCase() || "M"}
                </span>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm truncate">
                  {name}
                </h3>
                {verified && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                    Verified
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-2">
                <MapPin className="w-3 h-3" />
                <span>{suburb}</span>
                {rating > 0 && (
                  <>
                    <span className="mx-1">-</span>
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span>{rating.toFixed(1)} ({reviewCount})</span>
                  </>
                )}
              </div>

              {bio && (
                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mb-2">
                  {bio}
                </p>
              )}

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5">
                {languages.slice(0, 3).map((lang) => (
                  <span
                    key={lang}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20"
                  >
                    <Globe className="w-2.5 h-2.5" />
                    {lang}
                  </span>
                ))}
                {specialties.slice(0, 2).map((spec) => (
                  <span
                    key={spec}
                    className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>

            {/* Price + CTA */}
            <div className="shrink-0 text-right flex flex-col items-end gap-2">
              <div className="bg-rose-600 text-white font-bold text-sm px-3 py-1 rounded-xl">
                {priceDisplay}
              </div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">per session</span>
              <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-indigo-500 transition-colors mt-1" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
