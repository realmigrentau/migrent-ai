import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";
import {
  MapPin,
  Globe,
  Star,
  Clock,
  MessageCircle,
  Video,
  Users as UsersIcon,
  ChevronLeft,
  Calendar,
  DollarSign,
  Shield,
} from "lucide-react";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

interface MentorData {
  id: string;
  user_id: string;
  suburb: string;
  postcode: number;
  languages: string[];
  bio: string;
  specialties: string[];
  hourly_rate: number;
  rating: number;
  review_count: number;
  verified: boolean;
  active: boolean;
  profiles?: {
    name: string;
    custom_pfp: string;
    verified: boolean;
    about_me: string;
  };
  reviews?: {
    id: string;
    rating: number;
    comment: string;
    created_at: string;
    profiles?: { name: string; custom_pfp: string };
  }[];
}

export default function MentorProfilePage() {
  const router = useRouter();
  const { id } = router.query;
  const { session } = useAuth();

  const [mentor, setMentor] = useState<MentorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [sessionType, setSessionType] = useState("video_call");
  const [notes, setNotes] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");

  useEffect(() => {
    if (!id) return;
    fetch(`${BASE_URL}/mentors/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.id) setMentor(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleBook = async () => {
    if (!session?.access_token) {
      router.push(`/signin?redirect=/mentor/${id}`);
      return;
    }

    setBooking(true);
    try {
      const res = await fetch(`${BASE_URL}/mentors/sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          mentor_id: id,
          suburb: mentor?.suburb || "",
          session_type: sessionType,
          scheduled_at: scheduledAt || null,
          notes: notes || null,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.detail || "Failed to book session");
        return;
      }

      const data = await res.json();
      if (data.session?.checkout_url) {
        window.location.href = data.session.checkout_url;
      }
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
        <div className="shimmer rounded-2xl h-48" />
        <div className="shimmer rounded-2xl h-32" />
        <div className="shimmer rounded-2xl h-64" />
      </div>
    );
  }

  if (!mentor) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Mentor not found</h1>
        <Link href="/mentors" className="text-indigo-500 hover:text-indigo-600 text-sm font-medium">
          Back to directory
        </Link>
      </div>
    );
  }

  const name = mentor.profiles?.name || "Mentor";
  const photo = mentor.profiles?.custom_pfp;
  const priceDisplay = `$${(mentor.hourly_rate / 100).toFixed(0)}`;

  return (
    <>
      <Head>
        <title>{name} - Local Mentor in {mentor.suburb} - MigRent</title>
        <meta name="description" content={`Book a session with ${name}, a local mentor in ${mentor.suburb}. ${mentor.languages.join(", ")} speaker.`} />
      </Head>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Back */}
        <Link href="/mentors" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-500 transition-colors">
          <ChevronLeft className="w-4 h-4" />
          Back to mentors
        </Link>

        {/* Profile header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6"
        >
          <div className="flex flex-col sm:flex-row items-start gap-5">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center">
              {photo ? (
                <img src={photo} alt={name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-white font-bold text-2xl">
                  {name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">{name}</h1>
                {mentor.profiles?.verified && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                    <Shield className="w-3 h-3" />
                    Verified
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 flex-wrap">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {mentor.suburb}{mentor.postcode ? ` (${mentor.postcode})` : ""}
                </span>
                {mentor.rating > 0 && (
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    {mentor.rating.toFixed(1)} ({mentor.review_count} review{mentor.review_count !== 1 ? "s" : ""})
                  </span>
                )}
              </div>

              {/* Languages */}
              <div className="flex flex-wrap gap-2 mt-2">
                {mentor.languages.map((lang) => (
                  <span
                    key={lang}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20"
                  >
                    <Globe className="w-3 h-3" />
                    {lang}
                  </span>
                ))}
              </div>
            </div>

            {/* Price */}
            <div className="sm:text-right shrink-0">
              <div className="bg-rose-600 text-white font-bold text-xl px-5 py-2 rounded-xl inline-block">
                {priceDisplay}
              </div>
              <p className="text-xs text-slate-500 mt-1">per session</p>
            </div>
          </div>
        </motion.div>

        {/* Bio */}
        {mentor.bio && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card p-6"
          >
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-3">About {name}</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed">
              {mentor.bio}
            </p>
          </motion.div>
        )}

        {/* Specialties */}
        {mentor.specialties.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="card p-6"
          >
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-3">Can Help With</h2>
            <div className="flex flex-wrap gap-2">
              {mentor.specialties.map((spec) => (
                <span
                  key={spec}
                  className="px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20"
                >
                  {spec}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Book a session */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6 space-y-4"
        >
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-500" />
            Book a Session
          </h2>

          {/* Session type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Session Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: "video_call", label: "Video Call", icon: <Video className="w-4 h-4" /> },
                { value: "in_person", label: "In Person", icon: <UsersIcon className="w-4 h-4" /> },
                { value: "chat", label: "Chat", icon: <MessageCircle className="w-4 h-4" /> },
              ].map((type) => (
                <button
                  key={type.value}
                  onClick={() => setSessionType(type.value)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl text-xs font-medium transition-colors ${
                    sessionType === type.value
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                  }`}
                >
                  {type.icon}
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Schedule */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Preferred Date & Time (optional)
            </label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Message for {name} (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. I just arrived from India and need help finding groceries and setting up Medicare..."
              rows={3}
              maxLength={1000}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
            />
          </div>

          {/* Price summary */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Session total</p>
              <p className="text-xs text-slate-500">Secure payment via Stripe</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-slate-900 dark:text-white">{priceDisplay} AUD</p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleBook}
            disabled={booking}
            className="w-full bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 text-white font-semibold py-3 rounded-xl text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {booking ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <DollarSign className="w-4 h-4" />
                Book & Pay {priceDisplay}
              </>
            )}
          </motion.button>
        </motion.div>

        {/* Reviews */}
        {mentor.reviews && mentor.reviews.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="card p-6"
          >
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500" />
              Reviews ({mentor.review_count})
            </h2>
            <div className="space-y-4">
              {mentor.reviews.map((review) => (
                <div key={review.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0 pb-4 last:pb-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center overflow-hidden">
                      {review.profiles?.custom_pfp ? (
                        <img src={review.profiles.custom_pfp} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white text-xs font-bold">
                          {review.profiles?.name?.charAt(0) || "?"}
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-medium text-slate-900 dark:text-white">
                      {review.profiles?.name || "Anonymous"}
                    </span>
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < review.rating
                              ? "text-amber-500 fill-amber-500"
                              : "text-slate-300 dark:text-slate-600"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-slate-600 dark:text-slate-300">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </>
  );
}
