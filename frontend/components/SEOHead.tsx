import Head from "next/head";
import { useRouter } from "next/router";
import { SITE_URL } from "../lib/site";
import { siteIdentity } from "../lib/siteIdentity";

interface SEOHeadProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: "website" | "article";
  noIndex?: boolean;
  /** Real publication dates only. Rendered as article:published_time and
   * in Article JSON-LD when ogType is "article". */
  publishedAt?: string;
  modifiedAt?: string;
  authorName?: string;
  breadcrumbs?: { name: string; path: string }[];
  listing?: {
    address: string;
    city?: string;
    weeklyPrice: number;
    description?: string;
    images?: string[];
    availableFrom?: string;
    availableTo?: string;
    available?: boolean;
  };
}

const SITE_NAME = siteIdentity.brandName;
const DEFAULT_DESC =
  "Rooms across Australia for migrants, students and new arrivals. Hosts are ID-checked before a room goes live, and renters pay MigRent nothing.";
const DEFAULT_OG = `${SITE_URL}/og-default.png`;

/**
 * One <head> per page.
 *
 * Every tag carries a `key`, so when a page renders its own SEOHead the
 * page's values replace the defaults from _app.tsx instead of producing
 * two og:title tags. theme-color lives in _document.tsx only.
 */
export default function SEOHead({
  title,
  description = DEFAULT_DESC,
  canonical,
  ogImage = DEFAULT_OG,
  ogType = "website",
  noIndex = false,
  publishedAt,
  modifiedAt,
  authorName,
  breadcrumbs,
  listing,
}: SEOHeadProps) {
  const router = useRouter();
  const path = (router?.asPath || "/").split("?")[0].split("#")[0];
  const resolvedCanonical =
    canonical ?? (noIndex || path.includes("[") ? undefined : path === "/" ? `${SITE_URL}/` : `${SITE_URL}${path}`);

  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} - Rooms for new arrivals in Australia`;
  const absoluteImage = ogImage.startsWith("http") ? ogImage : `${SITE_URL}${ogImage.startsWith("/") ? "" : "/"}${ogImage}`;

  const jsonLd: Record<string, unknown>[] = [];

  if (listing) {
    const offer: Record<string, unknown> = {
      "@type": "Offer",
      price: listing.weeklyPrice,
      priceCurrency: "AUD",
      availability: listing.available === false ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
      url: resolvedCanonical,
    };
    if (listing.availableFrom) offer.validFrom = listing.availableFrom;
    if (listing.availableTo) offer.validThrough = listing.availableTo;
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "Accommodation",
      name: listing.address,
      description: listing.description || "",
      address: { "@type": "PostalAddress", addressLocality: listing.city || "", addressCountry: "AU" },
      offers: offer,
      image: listing.images?.[0] || "",
    });
  }

  if (ogType === "article" && title) {
    const article: Record<string, unknown> = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: title,
      description,
      image: absoluteImage,
      mainEntityOfPage: resolvedCanonical,
      publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    };
    if (publishedAt) article.datePublished = publishedAt;
    if (modifiedAt || publishedAt) article.dateModified = modifiedAt || publishedAt;
    if (authorName) article.author = { "@type": "Person", name: authorName };
    jsonLd.push(article);
  }

  if (breadcrumbs && breadcrumbs.length > 1) {
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: breadcrumbs.map((b, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: b.name,
        item: `${SITE_URL}${b.path}`,
      })),
    });
  }

  return (
    <Head>
      <title key="title">{fullTitle}</title>
      <meta key="description" name="description" content={description} />
      {noIndex ? <meta key="robots" name="robots" content="noindex,nofollow" /> : <meta key="robots" name="robots" content="index,follow" />}
      {resolvedCanonical && <link key="canonical" rel="canonical" href={resolvedCanonical} />}

      <meta key="og:type" property="og:type" content={ogType} />
      <meta key="og:site_name" property="og:site_name" content={SITE_NAME} />
      <meta key="og:locale" property="og:locale" content="en_AU" />
      <meta key="og:title" property="og:title" content={fullTitle} />
      <meta key="og:description" property="og:description" content={description} />
      <meta key="og:image" property="og:image" content={absoluteImage} />
      {resolvedCanonical && <meta key="og:url" property="og:url" content={resolvedCanonical} />}
      {ogType === "article" && publishedAt && <meta key="article:published_time" property="article:published_time" content={publishedAt} />}
      {ogType === "article" && (modifiedAt || publishedAt) && <meta key="article:modified_time" property="article:modified_time" content={modifiedAt || publishedAt} />}

      <meta key="twitter:card" name="twitter:card" content="summary_large_image" />
      <meta key="twitter:title" name="twitter:title" content={fullTitle} />
      <meta key="twitter:description" name="twitter:description" content={description} />
      <meta key="twitter:image" name="twitter:image" content={absoluteImage} />

      <link key="icon" rel="icon" href="/favicon.ico" />

      {jsonLd.map((block, i) => (
        <script
          key={`ld-${i}-${String(block["@type"])}`}
          type="application/ld+json"
          // JSON.stringify output only; never user-supplied markup. "<" is
          // escaped so a description cannot close the script tag.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(block).replace(/</g, "\\u003c") }}
        />
      ))}
    </Head>
  );
}
