import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowRight, MapPin, Search, Users } from "lucide-react";
import SEOHead from "../components/SEOHead";
import MentorCard from "../components/mentors/MentorCard";
import { CloseCard, PageHero, Reveal, SectionHead } from "../components/site";
import { API_BASE_URL as BASE_URL } from "../lib/apiBase";

/**
 * Local mentors: paid one-on-one sessions with someone who lives in the
 * suburb. Kept smaller since the 2026-09-29 redesign (it sits under
 * "Find a stay"). Each mentor sets their own price per session; Migrent
 * keeps a platform fee from it (backend routes_mentors.py).
 */

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
  profiles?: { name: string; custom_pfp: string };
}

const SUBURBS = ["Parramatta", "Kellyville", "Chatswood", "Hurstville", "Burwood", "Strathfield"];
const LANGUAGES = ["Mandarin", "Hindi", "Arabic", "Korean", "Vietnamese", "Tagalog", "English", "Spanish", "Japanese"];

const STEPS = [
  { n: "01", title: "Pick a mentor", body: "Search by suburb and the language you are most comfortable in." },
  { n: "02", title: "Book and pay", body: "Choose a video call, a chat or meeting in person. You see the price before you pay." },
  { n: "03", title: "Agree a time", body: "Suggest a time when you book. Your mentor confirms it with you in Migrent messages." },
];

export default function MentorsPage() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [suburb, setSuburb] = useState("");
  const [language, setLanguage] = useState("");
  const [searchSuburb, setSearchSuburb] = useState("");

  const fetchMentors = useCallback(async () => {
    setLoading(true);
    setLoadFailed(false);
    try {
      const params = new URLSearchParams();
      if (searchSuburb) params.set("suburb", searchSuburb);
      if (language) params.set("language", language);
      const res = await fetch(`${BASE_URL}/mentors?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setMentors(data.mentors || []);
      } else {
        setLoadFailed(true);
      }
    } catch {
      /* A failed request is not the same as "no mentors here yet". */
      setLoadFailed(true);
    } finally {
      setLoading(false);
    }
  }, [searchSuburb, language]);

  useEffect(() => {
    fetchMentors();
  }, [fetchMentors]);

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    setSearchSuburb(suburb.trim());
  };

  const clear = () => {
    setSuburb("");
    setSearchSuburb("");
    setLanguage("");
  };

  return (
    <>
      <SEOHead
        title="Local mentors"
        description="Book a paid one-on-one session with a local who can help you settle into your suburb. Each mentor sets their own price."
      />

      <PageHero
        eyebrow="Local mentors"
        crumbs={[{ label: "Home", href: "/" }, { label: "Local mentors" }]}
        title={
          <>
            Ask someone who <strong>lives there.</strong>
          </>
        }
        lead="Book a one-on-one session with a local who can show you the suburb, the transport and the shops. Sessions are optional and paid; each mentor sets their own price."
      >
        <form onSubmit={onSearch} role="search" aria-label="Find a mentor" className="mt-8 flex max-w-[720px] flex-col gap-3 sm:flex-row">
          <label className="site-search flex-1">
            <MapPin className="site-search__icon h-4 w-4" aria-hidden="true" />
            <span className="sr-only">Suburb</span>
            <input value={suburb} onChange={(e) => setSuburb(e.target.value)} placeholder="Suburb, e.g. Parramatta" autoComplete="address-level2" />
          </label>
          <select value={language} onChange={(e) => setLanguage(e.target.value)} aria-label="Language" className="input-field !h-[52px] sm:!w-[200px]">
            <option value="">Any language</option>
            {LANGUAGES.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
          <button type="submit" className="btn-primary btn-lg">
            <Search className="h-4 w-4" strokeWidth={2.2} aria-hidden="true" /> Search
          </button>
        </form>
        <div className="mt-4 flex flex-wrap gap-2" aria-label="Popular suburbs">
          {SUBURBS.map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={searchSuburb === s}
              onClick={() => {
                setSuburb(s);
                setSearchSuburb(s);
              }}
              className="hc-chip !h-9 !w-auto !rounded-[10px] !px-3 !text-[13px]"
            >
              {s}
            </button>
          ))}
          {(searchSuburb || language) && (
            <button type="button" onClick={clear} className="site-link px-2 text-[13px]">
              Clear
            </button>
          )}
        </div>
      </PageHero>

      <section className="site-section site-section--flush" aria-labelledby="mentor-results">
        <div className="site-shell site-shell--narrow">
          <h2 id="mentor-results" className="sr-only">
            Mentors
          </h2>
          <p className="site-card site-card--muted site-card--pad site-body mb-6">
            Mentors are Migrent members who sign up to help. Like hosts, each one has their government ID checked by Migrent before they are listed. Even so, meet somewhere public the first time.
          </p>
          <div aria-live="polite">
            {loading ? (
              <div className="space-y-3" aria-busy="true">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="site-card h-32 animate-pulse bg-[var(--color-surface-muted)]" />
                ))}
              </div>
            ) : loadFailed ? (
              <div className="site-card site-card--pad text-center">
                <p className="site-h3 site-h3--lg">We could not load mentors right now</p>
                <p className="site-body mx-auto mt-2 max-w-[46ch]">Something went wrong on our side, not yours. Your search is kept. Try again in a moment.</p>
                <button type="button" onClick={fetchMentors} className="btn-primary mt-5">
                  Try again
                </button>
              </div>
            ) : mentors.length > 0 ? (
              <>
                <p className="site-meta mb-4">
                  {mentors.length} mentor{mentors.length === 1 ? "" : "s"}
                  {searchSuburb ? ` in ${searchSuburb}` : ""}
                </p>
                <ul className="m-0 list-none space-y-3 p-0">
                  {mentors.map((m) => (
                    <li key={m.id}>
                      <MentorCard
                        id={m.id}
                        name={m.profiles?.name || "Mentor"}
                        photo={m.profiles?.custom_pfp}
                        suburb={m.suburb}
                        languages={m.languages || []}
                        bio={m.bio}
                        specialties={m.specialties || []}
                        hourlyRate={m.hourly_rate}
                        rating={m.rating}
                        reviewCount={m.review_count}
                      />
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <div className="site-card site-card--pad flex flex-col items-center text-center">
                <span className="site-icon site-icon--quiet" aria-hidden="true">
                  <Users className="h-5 w-5" strokeWidth={1.9} />
                </span>
                <p className="site-h3 site-h3--lg mt-4">No mentors {searchSuburb ? `in ${searchSuburb} ` : ""}yet</p>
                <p className="site-body mt-2 max-w-[46ch]">
                  {searchSuburb || language
                    ? "Mentors are locals who sign up to help. Try a nearby suburb or another language, or be the first here."
                    : "Mentors are locals who sign up to help, and Migrent checks each one before they appear here. Know your suburb well? You could be the first."}
                </p>
                <Link href="/become-mentor" className="btn-secondary mt-5">
                  Become a mentor <ArrowRight className="btn-arrow h-4 w-4" strokeWidth={2.2} aria-hidden="true" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="site-section" aria-labelledby="mentor-steps">
        <div className="site-shell">
          <Reveal>
            <SectionHead
              eyebrow="How sessions work"
              id="mentor-steps"
              heading={
                <>
                  Three steps, <strong>no subscription.</strong>
                </>
              }
            />
          </Reveal>
          <ol className="m-0 mt-10 grid list-none gap-3 p-0 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <Reveal as="li" key={s.n} delay={i * 0.05} className="site-card site-card--pad">
                <span aria-hidden="true" className="site-numeral text-[44px] text-[color:var(--color-primary-400)]">{s.n}</span>
                <h3 className="site-h3 mt-4">{s.title}</h3>
                <p className="site-body mt-1.5">{s.body}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <CloseCard
        heading={
          <>
            Know your suburb <strong className="type-script">well?</strong>
          </>
        }
        primary={{ label: "Become a mentor", href: "/become-mentor" }}
        secondary={{ label: "Search rooms", href: "/seeker/search" }}
      />
    </>
  );
}
