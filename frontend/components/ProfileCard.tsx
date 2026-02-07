import Link from "next/link";
import { motion } from "framer-motion";
import AvatarWithVerification from "./AvatarWithVerification";

interface ProfileCardProps {
  userId: string;
  name: string | null;
  photo: string | null;
  isVerified: boolean;
  verifiedLabel: string | null;
  isSuperhost: boolean;
  reviewsCount: number;
  averageRating: number;
  monthsHosting: number;
}

export default function ProfileCard({
  userId,
  name,
  photo,
  isVerified,
  verifiedLabel,
  isSuperhost,
  reviewsCount,
  averageRating,
  monthsHosting,
}: ProfileCardProps) {
  const displayName = name || "User";

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="card p-5 rounded-2xl hover:shadow-md dark:hover:shadow-2xl"
    >
      <div className="flex items-center gap-4">
        {/* Clickable avatar */}
        <AvatarWithVerification
          name={name}
          photo={photo}
          isVerified={isVerified}
          verifiedLabel={verifiedLabel}
          size={60}
        />

        {/* Name + badges */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href={`/users/profile/${userId}`}
              className="text-base font-bold text-slate-900 dark:text-white hover:text-rose-500 dark:hover:text-rose-400 transition-colors truncate"
            >
              {displayName}
            </Link>
            {isSuperhost && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
                <svg
                  className="w-3 h-3"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                Superhost
              </span>
            )}
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-3 mt-1.5 text-sm text-slate-500 dark:text-slate-400">
            {reviewsCount > 0 && (
              <span className="flex items-center gap-1">
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {reviewsCount}
                </span>{" "}
                Review{reviewsCount !== 1 ? "s" : ""}
              </span>
            )}
            {averageRating > 0 && (
              <span className="flex items-center gap-1">
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {averageRating.toFixed(2)}
                </span>
                <svg
                  className="w-3.5 h-3.5 text-amber-400"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </span>
            )}
          </div>

          {/* Hosting + verified row */}
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            {monthsHosting > 0 && (
              <span className="text-xs text-slate-400 dark:text-slate-500">
                {monthsHosting} month{monthsHosting !== 1 ? "s" : ""} hosting
              </span>
            )}
            {isVerified && verifiedLabel && (
              <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                Verified {verifiedLabel}
                <svg
                  className="w-3.5 h-3.5 text-rose-500"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
