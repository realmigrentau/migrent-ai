import type { GetStaticPaths, GetStaticProps } from "next";
import Link from "next/link";
import { ArrowRight, Check, MapPin } from "lucide-react";
import SEOHead from "../../components/SEOHead";
import ListingHero from "../../components/listings/ListingHero";
import { EXAMPLE_LISTINGS, exampleListingTitle, getExampleListing, type ExampleListing } from "../../data/exampleListings";
import { hubFromSite } from "../../lib/hub/routes";
import { placeTypeLabel } from "../../lib/hub/format";
import { siteIdentity } from "../../lib/siteIdentity";

/**
 * One example listing (data/exampleListings.ts). It looks like a listing
 * page, but it is built from the example data alone: there is no host, no
 * address, and no Apply, message, save, inspection or booking control,
 * because there is no room behind it. Not indexed, not in the sitemap.
 */

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: siteIdentity.launchScope.exampleListings ? EXAMPLE_LISTINGS.map((e) => ({ params: { slug: e.slug } })) : [],
  fallback: false,
});

export const getStaticProps: GetStaticProps<{ example: ExampleListing }> = async ({ params }) => {
  const example = siteIdentity.launchScope.exampleListings ? getExampleListing(String(params?.slug || "")) : undefined;
  return example ? { props: { example } } : { notFound: true };
};

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[14px] border border-[var(--color-line)] px-4 py-3">
      <dt className="site-meta">{label}</dt>
      <dd className="m-0 mt-1 text-[15px] font-semibold text-[color:var(--color-ink)]">{value}</dd>
    </div>
  );
}

export default function ExampleListingPage({ example: e }: { example: ExampleListing }) {
  const title = exampleListingTitle(e);
  const bond = e.weeklyRent * e.bondWeeks;
  const bills = e.billsIncluded ? "Included" : e.billsEstimateWeekly ? `About $${e.billsEstimateWeekly} a week` : "Not included";

  return (
    <>
      <SEOHead title={title} description={`${title}, ${e.suburb} ${e.state}.`} noIndex />
      <div className="site-shell pt-6 pb-16" data-testid="example-listing">
        <ListingHero images={e.images} title={title} />

        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
          <div className="min-w-0">
            <h1 className="site-h2 !text-[clamp(2rem,4vw,3rem)]">{title}</h1>
            <p className="mt-3 inline-flex items-center gap-1.5 text-[14px] text-[var(--color-ink-2)]">
              <MapPin className="h-4 w-4 text-[var(--color-ink-3)]" aria-hidden="true" />
              {e.suburb}, {e.state}
            </p>

            <dl className="m-0 mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Fact label="Rent" value={`$${e.weeklyRent} a week`} />
              <Fact label="Bond" value={`$${bond.toLocaleString("en-AU")} (${e.bondWeeks} weeks)`} />
              <Fact label="Bills" value={bills} />
              <Fact label="Type" value={placeTypeLabel(e.placeType)} />
              <Fact label="Furnished" value={e.furnished ? "Yes" : "No"} />
              <Fact label="Shortest stay" value={`${e.minStayMonths} months`} />
            </dl>

            <section className="mt-10" aria-labelledby="about-heading">
              <h2 id="about-heading" className="site-h3 site-h3--lg">
                About this place
              </h2>
              <p className="site-body mt-3">{e.description}</p>
              <p className="site-body mt-3">
                <span className="font-semibold text-[color:var(--color-ink)]">Who lives there: </span>
                {e.household}
              </p>
            </section>

            <section className="mt-10" aria-labelledby="features-heading">
              <h2 id="features-heading" className="site-h3 site-h3--lg">
                What&apos;s included
              </h2>
              <ul className="m-0 mt-4 grid list-none gap-2.5 p-0 sm:grid-cols-2">
                {e.features.map((f) => (
                  <li key={f} className="flex gap-2.5 text-[15px] text-[color:var(--color-ink)]">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--color-primary)]" strokeWidth={2.4} aria-hidden="true" />
                    {f}
                  </li>
                ))}
              </ul>
            </section>

            <section className="mt-10" aria-labelledby="rules-heading">
              <h2 id="rules-heading" className="site-h3 site-h3--lg">
                House rules
              </h2>
              <ul className="m-0 mt-4 list-disc space-y-1.5 pl-5 text-[15px] text-[color:var(--color-ink)]">
                {e.rules.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </section>
          </div>

          <aside className="site-card site-card--pad lg:sticky lg:top-28" aria-label="Price">
            <p className="flex items-baseline gap-1.5">
              <span className="text-[28px] font-bold tracking-[-0.02em] text-[color:var(--color-ink)] tabular-nums">${e.weeklyRent}</span>
              <span className="site-meta">a week</span>
            </p>
            <p className="site-body mt-4">Example listings can&apos;t be rented.</p>
            <div className="mt-5 flex flex-col gap-3">
              <Link href={hubFromSite.listProperty()} className="btn-primary justify-center">
                List your room free <ArrowRight className="btn-arrow h-4 w-4" strokeWidth={2.2} aria-hidden="true" />
              </Link>
              <Link href={`/seeker/search?suburb=${encodeURIComponent(e.suburb)}`} className="btn-secondary justify-center">
                Search rooms in {e.suburb}
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
