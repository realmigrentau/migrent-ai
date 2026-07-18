import type { GetStaticProps } from "next";
import Link from "next/link";
import { MapPin, ArrowRight } from "lucide-react";
import SEOHead from "../components/SEOHead";
import { API_BASE_URL as BASE_URL } from "../lib/apiBase";

interface SuburbSummary {
  slug: string;
  name: string;
  state: string;
  median_rent_room: number;
  vacancy_rate: number;
  safety_score: number;
  migrant_pct?: number;
  top_nationalities?: string[];
}

interface Props {
  suburbs: SuburbSummary[];
}

const CITY_BY_STATE: Record<string, string> = {
  NSW: "Sydney",
  VIC: "Melbourne",
  QLD: "Brisbane",
};
const CITY_ORDER = ["Sydney", "Melbourne", "Brisbane"];

export default function SuburbsIndex({ suburbs }: Props) {
  const byCity = new Map<string, SuburbSummary[]>();
  for (const s of suburbs) {
    const city = CITY_BY_STATE[s.state] || s.state;
    if (!byCity.has(city)) byCity.set(city, []);
    byCity.get(city)!.push(s);
  }
  const cities = [
    ...CITY_ORDER.filter((c) => byCity.has(c)),
    ...[...byCity.keys()].filter((c) => !CITY_ORDER.includes(c)),
  ];

  return (
    <>
      <SEOHead
        title="Suburb Guides - Where to Live in Australia"
        description="Suburb guides for migrants, students and new arrivals: real census data, typical room rents, transport and honest pros and cons across Sydney, Melbourne and Brisbane."
      />
      <div className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-14 py-14 md:py-20">
        <div className="max-w-[62ch]">
          <div className="eyebrow mb-3">Suburb guides</div>
          <h1 className="font-serif text-[40px] md:text-[54px] leading-[1.02] tracking-[-0.025em] text-[var(--color-ink)]">
            Where you can live, honestly told.
          </h1>
          <p className="mt-5 text-[16px] md:text-[17px] text-[var(--color-ink-2)] leading-[1.6]">
            Every guide is built on real 2021 Census data - who lives there,
            what a room typically costs, how the trains run - plus the cons
            most listings sites leave out.
          </p>
        </div>

        {suburbs.length === 0 ? (
          <p className="mt-14 text-[15px] text-[var(--color-ink-3)]">
            Suburb guides are loading - check back in a moment.
          </p>
        ) : (
          cities.map((city) => (
            <section key={city} className="mt-14">
              <div className="flex items-baseline gap-3 mb-6">
                <MapPin className="w-5 h-5 text-[var(--color-primary)] self-center" />
                <h2 className="font-serif text-[28px] md:text-[34px] tracking-[-0.02em] text-[var(--color-ink)]">
                  {city}
                </h2>
                <span className="font-mono text-[12px] text-[var(--color-ink-3)]">
                  {byCity.get(city)!.length} suburbs
                </span>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {byCity.get(city)!.map((s) => (
                  <Link
                    key={s.slug}
                    href={`/suburb/${s.slug}`}
                    className="card-lift group bg-[var(--color-surface-2)] border border-[var(--color-line)] rounded-[var(--radius-xl)] p-6 flex flex-col gap-3 hover:border-[var(--color-line-2)] transition-colors"
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="font-serif text-[22px] tracking-[-0.015em] text-[var(--color-ink)] leading-none">
                        {s.name}
                      </span>
                      <span className="font-mono text-[13px] text-[var(--color-primary)] whitespace-nowrap">
                        ~${s.median_rent_room}/wk
                      </span>
                    </div>
                    {typeof s.migrant_pct === "number" && (
                      <div className="text-[13px] text-[var(--color-ink-2)] leading-[1.5]">
                        {Math.round(s.migrant_pct)}% of residents born overseas
                      </div>
                    )}
                    {s.top_nationalities && s.top_nationalities.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {s.top_nationalities.slice(0, 3).map((n) => (
                          <span
                            key={n}
                            className="px-2 py-0.5 rounded-full text-[11.5px] bg-[var(--color-primary-soft)] text-[var(--color-primary)]"
                          >
                            {n}
                          </span>
                        ))}
                      </div>
                    )}
                    <span className="mt-auto inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--color-ink-2)] group-hover:text-[var(--color-primary)] transition-colors">
                      Read the guide <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </>
  );
}

// ISR, backend-independent builds: a sleeping backend yields an empty page
// that retries within 5 minutes rather than a failed deploy.
export const getStaticProps: GetStaticProps<Props> = async () => {
  try {
    const res = await fetch(`${BASE_URL}/suburb/`);
    if (!res.ok) throw new Error(String(res.status));
    const data = await res.json();
    return { props: { suburbs: data.suburbs || [] }, revalidate: 3600 };
  } catch {
    return { props: { suburbs: [] }, revalidate: 300 };
  }
};
