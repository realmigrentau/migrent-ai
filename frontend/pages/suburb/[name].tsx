import type { GetStaticPaths, GetStaticProps } from "next";
import { ArrowLeft } from "lucide-react";
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
import { SITE_URL } from "../../lib/site";
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

interface Props {
  suburb: SuburbData;
  listingsCount: number;
}

export default function SuburbPage({ suburb, listingsCount }: Props) {
  const pageTitle = `${suburb.name} Rooms: $${suburb.median_rent_room}/wk`;
  const pageDescription = `Find verified rooms for rent in ${suburb.name}, ${suburb.state}. Median rent $${suburb.median_rent_room}/wk, ${suburb.vacancy_rate}% vacancy rate, safety score ${suburb.safety_score}/10. ${listingsCount} rooms available now.`;
  const canonicalUrl = `${SITE_URL}/suburb/${suburb.slug}`;

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

      <div className="min-h-screen bg-[var(--color-surface)] dark:bg-[var(--color-bg)]">
        {/* Back nav */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-[var(--color-ink-3)] hover:text-[var(--color-primary)] transition-colors mb-6"
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
          <section className="rounded-2xl bg-[var(--color-primary)] from-[var(--color-primary)] to-[var(--color-accent)] p-8 sm:p-12 text-center text-white">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">
              Ready to find your room in {suburb.name}?
            </h2>
            <p className="text-[var(--color-primary-fg)] mb-6 max-w-xl mx-auto">
              Find your next home with MigRent - verified listings, ID-checked
              hosts, and no scams.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/signup"
                className="inline-flex items-center px-8 py-3 bg-white font-semibold rounded-xl hover:bg-[var(--color-primary-50)] transition-colors"
                style={{ color: "#0f766e" }}
              >
                Sign Up Free
              </Link>
              <Link
                href={`/seeker/search?city=${encodeURIComponent(suburb.name)}`}
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

// Don't pre-render at build time: this keeps deploys independent of the
// backend (a slow or sleeping Render instance can never fail a build).
// Pages are generated on first request and then cached (ISR).
export const getStaticPaths: GetStaticPaths = async () => {
  return { paths: [], fallback: "blocking" };
};

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const slug = String(params?.name || "").toLowerCase();
  if (!slug) return { notFound: true };

  const res = await fetch(`${BASE_URL}/suburb/${encodeURIComponent(slug)}/stats`);

  // Genuinely no such suburb - cache the 404 but revalidate so it recovers
  // automatically once the suburb is added to the backend.
  if (res.status === 404) {
    return { notFound: true, revalidate: 3600 };
  }

  // Transient backend error: throw so the page is NOT cached and retries on
  // the next request, instead of caching a broken or empty page.
  if (!res.ok) {
    throw new Error(`Suburb stats fetch failed for "${slug}": ${res.status}`);
  }

  const data = await res.json();
  if (!data?.suburb) {
    return { notFound: true, revalidate: 3600 };
  }

  return {
    props: {
      suburb: data.suburb,
      listingsCount: data.live_listings_count || 0,
    },
    revalidate: 3600,
  };
};
