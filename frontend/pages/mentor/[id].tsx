import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Globe, MapPin, MessageCircle, Star, Users as UsersIcon, Video } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../components/ui/Toast";
import SEOHead from "../../components/SEOHead";
import { Segmented } from "../../components/hub/ui/Field";
import { hubFromSite } from "../../lib/hub/routes";
import { API_BASE_URL as BASE_URL } from "../../lib/apiBase";

/**
 * One mentor, and the form to book a paid session with them. The old page's
 * "Verified" tag read profiles.verified, a flag a paid badge set without
 * checking any document, so it is gone (see components/mentors/MentorCard).
 */

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
  const toast = useToast();

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
      window.location.assign(hubFromSite.signIn(router.asPath));
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
        const err = await res.json().catch(() => ({}));
        toast.error(err.detail || "We couldn't book that session. Please try again.");
        return;
      }

      const data = await res.json();
      if (data.session?.checkout_url) {
        window.location.href = data.session.checkout_url;
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="site-shell pt-6 pb-16" aria-busy="true">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="site-card h-72 animate-pulse bg-[var(--color-surface-muted)]" />
          <div className="site-card h-96 animate-pulse bg-[var(--color-surface-muted)]" />
        </div>
      </div>
    );
  }

  if (!mentor) {
    return (
      <>
        <SEOHead title="Mentor not found" noIndex />
        <div className="site-shell site-shell--text flex min-h-[60vh] flex-col items-center justify-center text-center">
          <h1 className="site-h2 !text-[clamp(1.8rem,3.2vw,2.4rem)]">This mentor is not listed</h1>
          <p className="site-body mt-3">They may have paused their sessions.</p>
          <Link href="/mentors" className="btn-secondary mt-6">
            See all mentors
          </Link>
        </div>
      </>
    );
  }

  const name = mentor.profiles?.name || "Mentor";
  const photo = mentor.profiles?.custom_pfp;
  const priceDisplay = `$${(mentor.hourly_rate / 100).toFixed(0)}`;

  return (
    <>
      <SEOHead
        title={`${name}, local mentor in ${mentor.suburb}`}
        description={`Book a session with ${name}, a local mentor in ${mentor.suburb}.${mentor.languages.length ? ` Speaks ${mentor.languages.join(", ")}.` : ""}`}
      />

      <div className="site-shell pt-4 pb-20">
        <nav aria-label="Breadcrumb">
          <ol className="page-hero__crumbs">
            <li>
              <Link href="/">Home</Link>
            </li>
            <li>
              <Link href="/mentors">Local mentors</Link>
            </li>
            <li aria-current="page">{name}</li>
          </ol>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-12">
          <div className="min-w-0 space-y-6">
            <header className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-[28px] bg-[var(--color-primary-soft)]">
                {photo ? (
                  <img src={photo} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-3xl font-semibold text-[color:var(--color-primary-700)]" aria-hidden="true">
                    {name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <p className="eyebrow">Local mentor</p>
                <h1 className="site-h2 mt-2 !text-[clamp(2rem,4vw,3rem)]">{name}</h1>
                <p className="site-meta mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" aria-hidden="true" />
                    {mentor.suburb}
                    {mentor.postcode ? ` ${mentor.postcode}` : ""}
                  </span>
                  {mentor.rating > 0 && (
                    <span className="inline-flex items-center gap-1">
                      <Star className="h-4 w-4 fill-[var(--color-warn-500)] text-[var(--color-warn-500)]" aria-hidden="true" />
                      {mentor.rating.toFixed(1)} from {mentor.review_count} review{mentor.review_count === 1 ? "" : "s"}
                    </span>
                  )}
                </p>
              </div>
            </header>

            {mentor.languages.length > 0 && (
              <ul className="m-0 flex list-none flex-wrap gap-2 p-0" aria-label="Languages">
                {mentor.languages.map((lang) => (
                  <li key={lang} className="site-chip">
                    <Globe className="h-3.5 w-3.5" aria-hidden="true" />
                    {lang}
                  </li>
                ))}
              </ul>
            )}

            {mentor.bio && (
              <section className="site-card site-card--pad" aria-labelledby="about-mentor">
                <h2 id="about-mentor" className="site-h3 site-h3--lg">
                  About {name}
                </h2>
                <p className="site-body mt-3 whitespace-pre-line">{mentor.bio}</p>
              </section>
            )}

            {mentor.specialties.length > 0 && (
              <section className="site-card site-card--pad" aria-labelledby="mentor-help">
                <h2 id="mentor-help" className="site-h3 site-h3--lg">
                  Can help with
                </h2>
                <ul className="m-0 mt-4 flex list-none flex-wrap gap-2 p-0">
                  {mentor.specialties.map((spec) => (
                    <li key={spec} className="site-chip">
                      {spec}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {mentor.reviews && mentor.reviews.length > 0 && (
              <section className="site-card site-card--pad" aria-labelledby="mentor-reviews">
                <h2 id="mentor-reviews" className="site-h3 site-h3--lg">
                  Reviews ({mentor.review_count})
                </h2>
                <ul className="m-0 mt-4 list-none space-y-4 p-0">
                  {mentor.reviews.map((review) => (
                    <li key={review.id} className="border-b border-[var(--color-line)] pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[14px] font-semibold text-[var(--color-ink)]">{review.profiles?.name || "A Migrent member"}</span>
                        <span className="inline-flex items-center gap-0.5" aria-label={`${review.rating} out of 5`}>
                          {[0, 1, 2, 3, 4].map((i) => (
                            <Star key={i} className={`h-3.5 w-3.5 ${i < review.rating ? "fill-[var(--color-warn-500)] text-[var(--color-warn-500)]" : "text-[var(--color-ink-4)]"}`} aria-hidden="true" />
                          ))}
                        </span>
                      </div>
                      {review.comment && <p className="site-body mt-1.5">{review.comment}</p>}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          <aside className="lg:sticky lg:top-28 lg:self-start" aria-labelledby="book-heading">
            <div className="site-card site-card--pad space-y-5">
              <div className="flex items-baseline justify-between gap-4">
                <h2 id="book-heading" className="site-h3 site-h3--lg">
                  Book a session
                </h2>
                <p className="m-0 text-[22px] font-semibold tracking-[-0.01em] text-[var(--color-ink)] tabular-nums">
                  {priceDisplay}
                  <span className="text-[13px] font-normal text-[var(--color-ink-3)]"> AUD</span>
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <span className="field-label !mb-0">How you would like to meet</span>
                <Segmented<string>
                  label="How you would like to meet"
                  value={sessionType}
                  onChange={setSessionType}
                  options={[
                    { value: "video_call", label: "Video", icon: <Video className="h-4 w-4" aria-hidden="true" /> },
                    { value: "in_person", label: "In person", icon: <UsersIcon className="h-4 w-4" aria-hidden="true" /> },
                    { value: "chat", label: "Chat", icon: <MessageCircle className="h-4 w-4" aria-hidden="true" /> },
                  ]}
                />
              </div>

              <div>
                <label htmlFor="m-when" className="field-label">
                  A time that suits you <span className="font-normal text-[color:var(--color-ink-3)]">(optional)</span>
                </label>
                <input id="m-when" type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} className="input-field" />
              </div>

              <div>
                <label htmlFor="m-notes" className="field-label">
                  A note for {name} <span className="font-normal text-[color:var(--color-ink-3)]">(optional)</span>
                </label>
                <textarea
                  id="m-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="For example: I have just arrived and want help with transport and groceries."
                  rows={3}
                  maxLength={1000}
                  className="input-field min-h-[96px] resize-none"
                />
              </div>

              <button type="button" onClick={handleBook} disabled={booking} data-state={booking ? "loading" : undefined} className="btn-primary btn-lg w-full">
                {booking ? "Opening checkout" : `Book and pay ${priceDisplay}`}
              </button>
              <p className="site-meta m-0">You pay by card through Stripe. Your mentor confirms the time with you in Migrent messages.</p>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
