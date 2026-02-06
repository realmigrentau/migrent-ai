import Head from "next/head";

interface SEOHeadProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  noIndex?: boolean;
  listing?: {
    address: string;
    city?: string;
    weeklyPrice: number;
    description?: string;
    images?: string[];
  };
}

const SITE_NAME = "Migrent - AU Housing";
const DEFAULT_DESC =
  "Find safe, verified rooms and accommodation across Australia. Built for migrants, students and working holiday makers.";
const DEFAULT_OG = "https://migrent-ai.vercel.app/og-default.png";

export default function SEOHead({
  title,
  description = DEFAULT_DESC,
  canonical,
  ogImage = DEFAULT_OG,
  noIndex = false,
  listing,
}: SEOHeadProps) {
  const fullTitle = title ? `${title} | Migrent` : SITE_NAME;

  const jsonLd = listing
    ? {
        "@context": "https://schema.org",
        "@type": "Accommodation",
        name: listing.address,
        description: listing.description || "",
        address: {
          "@type": "PostalAddress",
          addressLocality: listing.city || "",
          addressCountry: "AU",
        },
        offers: {
          "@type": "Offer",
          price: listing.weeklyPrice,
          priceCurrency: "AUD",
          availability: "https://schema.org/InStock",
        },
        image: listing.images?.[0] || "",
      }
    : null;

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noIndex && <meta name="robots" content="noindex,nofollow" />}
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Migrent" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      {canonical && <meta property="og:url" content={canonical} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Favicons */}
      <link rel="icon" href="/favicon.ico" />
      <meta name="theme-color" content="#0d9488" />

      {/* JSON-LD structured data for listings */}
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
    </Head>
  );
}
