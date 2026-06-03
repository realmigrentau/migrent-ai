import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import Head from "next/head";
import SEOHead from "../../components/SEOHead";
import SuburbHero from "../../components/suburb/SuburbHero";
import StatsCards from "../../components/suburb/StatsCards";
import LiveListings from "../../components/suburb/LiveListings";
import Liveability from "../../components/suburb/Liveability";
import TransportCalculator from "../../components/suburb/TransportCalculator";
import DemographicsCharts from "../../components/suburb/DemographicsCharts";
import SuburbFAQ from "../../components/suburb/SuburbFAQ";

import { API_BASE_URL as BASE_URL } from "../../lib/apiBase";
interface SuburbData {
  slug: string;
  name: string;
  state: string;
  median_rent_room: number;
  vacancy_rate: number;
  safety_score: number;
  migrant_pct: number;
  top_nationalities: string[];
  nearest_stations: { name: string; line: string; walk_min: number }[];
  transport_score: number | null;
  walkability_score: number | null;
  latitude: number | null;
  longitude: number | null;
  description: string;
  pros: string[];
  cons: string[];
  rent_trend: { month: string; rent: number }[];
  demographics: {
    overseas_born_pct: number;
    india_pct: number;
    china_pct: number;
    philippines_pct: number;
    sri_lanka_pct: number;
    nepal_pct: number;
    median_age: number;
    avg_household_size: number;
  };
  faq: { q: string; a: string }[];
}

export default function SuburbPage() {
  const router = useRouter();
  const { name } = router.query;
  const [suburb, setSuburb] = useState<SuburbData | null>(null);
  const [listingsCount, setListingsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!name || typeof name !== "string") return;

    const slug = name as string;
    async function fetchSuburb() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${BASE_URL}/suburb/${encodeURIComponent(slug)}/stats`);
        if (!res.ok) {
          if (res.status === 404) {
            setError("Suburb not found");
          } else {
            setError("Failed to load suburb data");
          }
          return;
        }
        const data = await res.json();
        setSuburb(data.suburb);
        setListingsCount(data.live_listings_count || 0);
      } catch (err) {
        console.error("Failed to fetch suburb:", err);
        setError("Failed to load suburb data");
      } finally {
        setLoading(false);
      }
    }

    fetchSuburb();
  }, [name]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
          <p className="text-slate-500">Loading suburb data...</p>
        </div>
      </div>
    );
  }

  if (error || !suburb) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            {error || "Suburb not found"}
          </h1>
          <p className="text-slate-500 mb-6">
            We don't have data for this suburb yet.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  const pageTitle = `${suburb.name} Rooms: $${suburb.median_rent_room}/wk`;
  const pageDescription = `Find verified rooms for rent in ${suburb.name}, Sydney. Median rent $${suburb.median_rent_room}/wk, ${suburb.vacancy_rate}% vacancy rate, safety score ${suburb.safety_score}/10. ${listingsCount} rooms available now.`;
  const canonicalUrl = `https://migrent-ai.vercel.app/suburb/${suburb.slug}`;

  // Schema.org structured data for local area
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Place",
    name: `${suburb.name}, ${suburb.state}`,
    description: suburb.description,
    address: {
      "@type": "PostalAddress",
      addressLocality: suburb.name,
      addressRegion: suburb.state,
      addressCountry: "AU",
    },
    geo: suburb.latitude
      ? {
          "@type": "GeoCoordinates",
          latitude: suburb.latitude,
          longitude: suburb.longitude,
        }
      : undefined,
  };

  const faqJsonLd =
    suburb.faq && suburb.faq.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: suburb.faq.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: {
              "@type": "Answer",
              text: item.a,
            },
          })),
        }
      : null;

  return (
    <>
      <SEOHead
        title={pageTitle}
        description={pageDescription}
        canonical={canonicalUrl}
      />
      <Head>
        {/* Additional structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {faqJsonLd && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
          />
        )}
      </Head>

      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        {/* Back nav */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-teal-600 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to MigRent
          </Link>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 space-y-12">
          <SuburbHero
            name={suburb.name}
            medianRent={suburb.median_rent_room}
            vacancyRate={suburb.vacancy_rate}
            nearestStations={suburb.nearest_stations}
            listingsCount={listingsCount}
          />

          <StatsCards
            medianRent={suburb.median_rent_room}
            vacancyRate={suburb.vacancy_rate}
            safetyScore={suburb.safety_score}
            migrantPct={suburb.migrant_pct}
            transportScore={suburb.transport_score}
            walkabilityScore={suburb.walkability_score}
          />

          <LiveListings
            suburbName={suburb.name}
            listingsCount={listingsCount}
          />

          <Liveability
            pros={suburb.pros}
            cons={suburb.cons}
            suburbName={suburb.name}
          />

          <TransportCalculator
            suburbName={suburb.name}
            stations={suburb.nearest_stations}
            transportScore={suburb.transport_score}
          />

          <DemographicsCharts
            demographics={suburb.demographics}
            rentTrend={suburb.rent_trend}
            suburbName={suburb.name}
          />

          <SuburbFAQ faqs={suburb.faq} suburbName={suburb.name} />

          {/* Bottom CTA */}
          <section className="rounded-2xl bg-[var(--color-primary)] from-teal-600 to-emerald-600 p-8 sm:p-12 text-center text-white">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">
              Ready to find your room in {suburb.name}?
            </h2>
            <p className="text-teal-100 mb-6 max-w-xl mx-auto">
              Join thousands of migrants and students who found their home through
              MigRent. Verified listings, no scams.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/auth/register"
                className="inline-flex items-center px-8 py-3 bg-white font-semibold rounded-xl hover:bg-teal-50 transition-colors"
                style={{ color: "#0f766e" }}
              >
                Sign Up Free
              </Link>
              <Link
                href={`/listings?suburb=${encodeURIComponent(suburb.name)}`}
                className="inline-flex items-center px-8 py-3 border-2 border-white/30 font-semibold rounded-xl hover:bg-white/10 transition-colors"
                style={{ color: "#ffffff" }}
              >
                Browse Rooms
              </Link>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
