import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, Train, ShieldCheck, ArrowRight, GraduationCap, Briefcase, Globe, Award } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { getVisaRecommended } from "../../lib/api";

interface VisaListing {
  id: string;
  title: string | null;
  address: string;
  city: string | null;
  suburb: string | null;
  weekly_price: number;
  images: string[];
  furnished: boolean;
  bills_included: boolean;
  nearest_transport: string | null;
  match_score: number;
  near_uni?: boolean;
  near_cbd?: boolean;
  owner?: {
    name: string | null;
    custom_pfp: string | null;
    verified: boolean;
  };
}

const VISA_ICONS: Record<string, React.ReactNode> = {
  student_500: <GraduationCap className="w-4 h-4" />,
  skilled_482: <Briefcase className="w-4 h-4" />,
  whv_417: <Globe className="w-4 h-4" />,
  graduate_485: <Award className="w-4 h-4" />,
};

function VisaMatchBadge({ score }: { score: number }) {
  let color = "bg-[var(--color-surface-sunk)] text-[var(--color-ink-2)]";
  let label = "Match";
  if (score >= 85) {
    color = "bg-[var(--color-accent-soft)] dark:bg-[var(--color-accent-soft)]0/10 text-[var(--color-accent)] dark:text-[var(--color-accent)] border border-[var(--color-accent-soft)] dark:border-[var(--color-accent-soft)]";
    label = "Excellent match";
  } else if (score >= 70) {
    color = "bg-[var(--color-primary-50)] dark:bg-[var(--color-primary)]/10 text-[var(--color-primary)] dark:text-[var(--color-primary)] border border-[var(--color-primary-100)] dark:border-[var(--color-primary)]/20";
    label = "Good match";
  } else if (score >= 55) {
    color = "bg-[var(--color-warn-50)] dark:bg-[var(--color-warn-50)]0/10 text-[var(--color-warn-600)] dark:text-[var(--color-warn-500)] border border-[var(--color-line-2)] dark:border-[var(--color-warn-500)]/20";
    label = "Fair match";
  }

  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${color}`}>
      {score}% - {label}
    </span>
  );
}

export default function VisaRecommendations() {
  const { session } = useAuth();
  const [listings, setListings] = useState<VisaListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [visaLabel, setVisaLabel] = useState<string | null>(null);
  const [visaType, setVisaType] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    getVisaRecommended(session.access_token, 6)
      .then((data) => {
        setListings(data.listings || []);
        setVisaLabel(data.visa_label);
        setVisaType(data.visa_type);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [session]);

  // Don't show if no visa type set
  if (!loading && !visaType) return null;

  if (loading) {
    return (
      <div className="card p-5">
        <div className="shimmer h-5 w-48 rounded mb-4" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl overflow-hidden animate-pulse">
              <div className="h-28 bg-[var(--color-line)]" />
              <div className="p-3 space-y-2">
                <div className="shimmer h-4 w-3/4 rounded" />
                <div className="shimmer h-3 w-1/2 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (listings.length === 0) return null;

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-[var(--color-ink)] flex items-center gap-2">
          {visaType && VISA_ICONS[visaType]}
          Recommended for {visaLabel || "Your Visa"}
        </h2>
        <Link
          href="/seeker/search"
          className="text-xs font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] flex items-center gap-1"
        >
          See all <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {listings.slice(0, 6).map((listing, i) => (
          <motion.div
            key={listing.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i }}
          >
            <Link href={`/listing/${listing.id}`}>
              <div className="rounded-xl overflow-hidden border border-[var(--color-line)] group hover:shadow-md hover:border-[var(--color-line-2)] dark:hover:border-[var(--color-primary)]/30 transition-all bg-[var(--color-surface)]">
                {/* Image */}
                <div className="relative h-28 bg-[var(--color-line)]">
                  {listing.images?.[0] ? (
                    <img
                      src={listing.images[0]}
                      alt={listing.title || listing.address}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[var(--color-ink-3)]">
                      <MapPin className="w-8 h-8" />
                    </div>
                  )}

                  {/* Visa match badge */}
                  <div className="absolute top-2 right-2">
                    <VisaMatchBadge score={listing.match_score} />
                  </div>

                  {/* Feature badges */}
                  <div className="absolute bottom-2 left-2 flex gap-1.5">
                    {listing.near_uni && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[var(--color-primary-soft)]0/90 text-white">
                        Near uni
                      </span>
                    )}
                    {listing.near_cbd && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[var(--color-primary)]/90 text-white">
                        Near CBD
                      </span>
                    )}
                    {listing.furnished && !listing.near_uni && !listing.near_cbd && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[var(--color-primary)]/90 text-white">
                        Furnished
                      </span>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[var(--color-ink)] truncate">
                        {listing.title || listing.address}
                      </p>
                      <p className="text-xs text-[var(--color-ink-3)] mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {listing.suburb || listing.city || listing.address}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-[var(--color-primary)] dark:text-[var(--color-primary)] shrink-0">
                      ${listing.weekly_price}/wk
                    </p>
                  </div>

                  <div className="flex items-center gap-3 mt-2">
                    {listing.nearest_transport && (
                      <span className="text-xs text-[var(--color-ink-3)] flex items-center gap-1">
                        <Train className="w-3 h-3" />
                        {listing.nearest_transport}
                      </span>
                    )}
                    {listing.owner?.verified && (
                      <span className="text-xs text-[var(--color-primary)] flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
