import Head from "next/head";

interface SEOHeadProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  noIndex?: boolean;
}

const SITE_NAME = "MigRent – Migrant Housing in Australia";
const DEFAULT_DESC =
  "Find safe, verified rooms and accommodation across Australia. Built for migrants, students and working holiday makers.";
const DEFAULT_OG = "https://migrent-ai.vercel.app/og-default.png";

export default function SEOHead({
  title,
  description = DEFAULT_DESC,
  canonical,
  ogImage = DEFAULT_OG,
  noIndex = false,
}: SEOHeadProps) {
  const fullTitle = title ? `${title} | MigRent` : SITE_NAME;

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noIndex && <meta name="robots" content="noindex,nofollow" />}
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="MigRent" />
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
    </Head>
  );
}
