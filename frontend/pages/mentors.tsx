import { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, MapPin, Globe, Users, ChevronRight, Sparkles, Heart } from "lucide-react";
import MentorCard from "../components/mentors/MentorCard";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

interface Mentor {
  id: string;
  user_id: string;
  suburb: string;
  languages: string[];
  bio: string;
  specialties: string[];
  hourly_rate: number;
  rating: number;
  review_count: number;
  verified: boolean;
  profiles?: {
    name: string;
    custom_pfp: string;
    verified: boolean;
  };
}

export default function MentorsPage() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [suburb, setSuburb] = useState("");
  const [language, setLanguage] = useState("");
  const [searchSuburb, setSearchSuburb] = useState("");

  const fetchMentors = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchSuburb) params.set("suburb", searchSuburb);
      if (language) params.set("language", language);
      const res = await fetch(`${BASE_URL}/mentors?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setMentors(data.mentors || []);
      }
    } catch (err) {
      console.error("Failed to fetch mentors:", err);
    } finally {
      setLoading(false);
    }
  }, [searchSuburb, language]);

  useEffect(() => {
    fetchMentors();
  }, [fetchMentors]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchSuburb(suburb);
  };

  const popularSuburbs = ["Kellyville", "Parramatta", "Chatswood", "Hurstville", "Burwood", "Strathfield"];
  const popularLanguages = ["Mandarin", "Hindi", "Arabic", "Korean", "Vietnamese", "Tagalog"];

  return (
    <>
      <Head>
        <title>Find a Local Mentor - MigRent</title>
        <meta name="description" content="Connect with verified local mentors who help new arrivals settle into their suburb. Video calls, suburb walks, and local tips." />
      </Head>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="w-16 h-16 rounded-2xl bg-[var(--color-primary-soft)] from-[var(--color-primary)] to-[var(--color-primary)] flex items-center justify-center mx-auto">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Find a Local Mentor
          </h1>
          <p className="text-slate-600 dark:text-slate-300 max-w-lg mx-auto">
            Connect with verified locals who know your suburb inside out.
            Get help with settling in, local tips, and navigating your new neighbourhood.
          </p>
          <Link href="/become-mentor">
            <motion.span
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-500)] text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors cursor-pointer mt-2"
            >
              <Heart className="w-4 h-4" />
              Become a Mentor
            </motion.span>
          </Link>
        </motion.div>

        {/* Search */}
        <form onSubmit={handleSearch} className="card p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={suburb}
                onChange={(e) => setSuburb(e.target.value)}
                placeholder="Search by suburb (e.g. Kellyville)"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-[var(--color-ink)]/30 focus:border-transparent outline-none"
              />
            </div>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-[var(--color-ink)]/30 focus:border-transparent outline-none"
            >
              <option value="">All Languages</option>
              {popularLanguages.map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
              <option value="English">English</option>
              <option value="Spanish">Spanish</option>
              <option value="Japanese">Japanese</option>
            </select>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-500)] text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors flex items-center gap-2 justify-center"
            >
              <Search className="w-4 h-4" />
              Search
            </motion.button>
          </div>
        </form>

        {/* Quick suburb filters */}
        <div className="flex flex-wrap gap-2">
          {popularSuburbs.map((s) => (
            <motion.button
              key={s}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { setSuburb(s); setSearchSuburb(s); }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                searchSuburb === s
                  ? "bg-[var(--color-primary)] text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {s}
            </motion.button>
          ))}
          {searchSuburb && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { setSuburb(""); setSearchSuburb(""); setLanguage(""); }}
              className="px-3 py-1.5 rounded-full text-xs font-medium bg-[var(--color-primary-soft)] dark:bg-[var(--color-primary)]/10 text-[var(--color-primary)] dark:text-[var(--color-primary)]"
            >
              Clear filters
            </motion.button>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="shimmer rounded-2xl h-32" />
            ))}
          </div>
        ) : mentors.length > 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {mentors.length} mentor{mentors.length !== 1 ? "s" : ""} found
              {searchSuburb ? ` in ${searchSuburb}` : ""}
            </p>
            {mentors.map((mentor, i) => (
              <MentorCard
                key={mentor.id}
                id={mentor.id}
                name={mentor.profiles?.name || "Mentor"}
                photo={mentor.profiles?.custom_pfp}
                suburb={mentor.suburb}
                languages={mentor.languages}
                bio={mentor.bio}
                specialties={mentor.specialties}
                hourlyRate={mentor.hourly_rate}
                rating={mentor.rating}
                reviewCount={mentor.review_count}
                verified={mentor.profiles?.verified || false}
                index={i}
              />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card p-8 text-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
              <Users className="w-7 h-7 text-slate-400" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-2">
              No mentors found
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              {searchSuburb
                ? `No mentors available in ${searchSuburb} yet. Be the first!`
                : "No mentors available yet. Be the first to help newcomers!"}
            </p>
            <Link href="/become-mentor">
              <motion.span
                whileHover={{ scale: 1.03 }}
                className="inline-flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-500)] text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors cursor-pointer"
              >
                Become a Mentor
                <ChevronRight className="w-4 h-4" />
              </motion.span>
            </Link>
          </motion.div>
        )}

        {/* How it works */}
        <div className="card p-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[var(--color-primary)]" />
            How It Works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { step: "1", title: "Find Your Mentor", desc: "Browse local mentors by suburb and language" },
              { step: "2", title: "Book a Session", desc: "Schedule a 30-min video call or in-person meetup" },
              { step: "3", title: "Settle In Faster", desc: "Get local tips, suburb walks, and community connections" },
            ].map((item) => (
              <div key={item.step} className="text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-[var(--color-primary-soft)] dark:bg-[var(--color-primary)]/20 text-[var(--color-primary)] dark:text-[var(--color-primary)] flex items-center justify-center mx-auto font-bold text-sm">
                  {item.step}
                </div>
                <h3 className="font-semibold text-sm text-slate-900 dark:text-white">{item.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
