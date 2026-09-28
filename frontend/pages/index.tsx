import type { GetStaticProps } from "next";
import Link from "next/link";
import SEOHead from "../components/SEOHead";
import MigrentHero from "../components/home/MigrentHero";
import TrustStrip from "../components/home/TrustStrip";
import RoomsNow from "../components/home/RoomsNow";
import HowItWorks from "../components/home/HowItWorks";
import TrustSection from "../components/home/TrustSection";
import OwnersTeaser from "../components/home/OwnersTeaser";
import Neighbourhoods, { type FeaturedSuburb } from "../components/home/Neighbourhoods";
import GuidesAndMentors, { type ArticleCard } from "../components/home/GuidesAndMentors";
import { CloseCard, Faq, Reveal, SectionHead, type FaqEntry } from "../components/site";
import { findPlace, getPlaceDetail } from "../lib/suburbs/data.server";
import { getPostBySlug } from "../data/blogPosts";
import { getGuideById } from "../data/guidesContent";

/**
 * The homepage, in running order:
 *
 *   the house        what you want, or what you have, in one interaction
 *   trust line       four true things
 *   rooms now        real listings, and a way to hear about the next ones
 *   how it works     four steps, told sideways
 *   trust            the host checks, and who holds your money (nobody here)
 *   owners           the other half of the audience, briefly
 *   suburbs          real places with Census numbers
 *   guides           reading, and a person to ask
 *   questions        then the close
 *
 * Every section is built from components/site, the same kit as the rest of
 * the public site, on the same canvas as Migrent Hub.
 */

interface HomeProps {
  suburbs: FeaturedSuburb[];
  articles: ArticleCard[];
}

const FAQS: FaqEntry[] = [
  {
    q: "Do I need an Australian rental history?",
    a: "No. You apply with your Rental Profile: your work or study, your household and your references. A local rental ledger is not required.",
  },
  {
    q: "What does Migrent cost renters?",
    a: "Nothing. Searching, messaging hosts, booking inspections and applying are free.",
  },
  {
    q: "Who holds my bond?",
    a: "Your state or territory's bond authority, never the host's bank account and never Migrent. Migrent does not collect bond or rent.",
  },
  {
    q: "How are hosts checked?",
    a: "A person at Migrent reviews each host's government ID and confirms their email before any of their rooms can be published, and every listing is read before it goes live.",
  },
  {
    q: "Is Migrent a real estate agent?",
    a: (
      <>
        No. You deal with the host directly; Migrent runs the platform, the checks and the support.{" "}
        <Link href="/how-renting-works#not-an-agent" className="underline underline-offset-2">
          What that means for you
        </Link>
        .
      </>
    ),
  },
];

export default function Home({ suburbs, articles }: HomeProps) {
  return (
    <>
      <SEOHead
        title="A real home in Australia, found the right way"
        description="Rooms and homes across Australia for migrants, students and new arrivals. Every host is ID-checked before a room goes live. Renters pay nothing."
      />

      <MigrentHero />
      <TrustStrip />
      <RoomsNow />
      <HowItWorks />
      <TrustSection />
      <OwnersTeaser />
      <Neighbourhoods suburbs={suburbs} />
      <GuidesAndMentors articles={articles} />

      <section id="faq" className="site-section site-section--tight scroll-mt-[96px]" aria-labelledby="faq-heading">
        <div className="site-shell grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-20">
          <Reveal className="lg:sticky lg:top-28 lg:self-start">
            <SectionHead
              eyebrow="Good to know"
              id="faq-heading"
              heading={
                <>
                  Questions, <strong>answered.</strong>
                </>
              }
            />
            <Link href="/help" className="site-link mt-6">
              All help topics
            </Link>
          </Reveal>
          <Reveal delay={0.06}>
            <Faq items={FAQS} />
          </Reveal>
        </div>
      </section>

      <CloseCard
        heading={
          <>
            Ready to find your <strong className="type-script">room</strong>?
          </>
        }
        lead="Whether you are moving in or opening a door, it starts the same way."
        primary={{ label: "Find a room", href: "/seeker/search" }}
        secondary={{ label: "List a property", href: "/for-owners" }}
      />
    </>
  );
}

/** Suburbs with a guide, spread across the three cities with most listings. */
const FEATURED: { state: string; slug: string; city: string }[] = [
  { state: "nsw", slug: "parramatta", city: "Sydney" },
  { state: "vic", slug: "carlton", city: "Melbourne" },
  { state: "qld", slug: "west-end-brisbane", city: "Brisbane" },
  { state: "nsw", slug: "strathfield", city: "Sydney" },
  { state: "vic", slug: "footscray", city: "Melbourne" },
  { state: "nsw", slug: "marrickville", city: "Sydney" },
  { state: "vic", slug: "box-hill", city: "Melbourne" },
  { state: "qld", slug: "sunnybank", city: "Brisbane" },
  { state: "nsw", slug: "burwood", city: "Sydney" },
  { state: "vic", slug: "clayton", city: "Melbourne" },
];

const ARTICLES: { kind: "blog" | "guide"; id: string }[] = [
  { kind: "blog", id: "spot-rental-scams" },
  { kind: "blog", id: "bond-rights-migrants" },
  { kind: "guide", id: "visas" },
];

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  const suburbs: FeaturedSuburb[] = [];
  for (const f of FEATURED) {
    const place = findPlace(f.state, f.slug);
    if (!place) continue;
    const detail = getPlaceDetail(place.salCode);
    const rent = detail?.census?.medianWeeklyRent;
    suburbs.push({
      name: place.name,
      city: f.city,
      href: `/suburb/${f.state}/${place.slug}`,
      medianRent: typeof rent === "number" && rent > 0 ? rent : null,
      overseasBornPct: place.overseasBornPct,
    });
  }

  const articles: ArticleCard[] = [];
  for (const a of ARTICLES) {
    if (a.kind === "blog") {
      const post = getPostBySlug(a.id);
      if (post) articles.push({ href: `/blog/${post.slug}`, title: post.title, excerpt: post.excerpt, kind: "Article", readTime: post.readTime });
    } else {
      const guide = getGuideById(a.id);
      if (guide) articles.push({ href: `/guides/${guide.id}`, title: guide.title, excerpt: guide.description, kind: "Guide", readTime: guide.readTime });
    }
  }

  return { props: { suburbs, articles } };
};
