import type { GetServerSideProps } from "next";
import { SITE_URL } from "../lib/site";
import { API_BASE_URL } from "../lib/apiBase";
import { getAllPosts } from "../data/blogPosts";
import guidesContent from "../data/guidesContent";
import { HELP_ARTICLES } from "../lib/helpData";

type Entry = { path: string; priority: string; changefreq: string };

// Public, indexable pages only. Auth/dashboard/owner/seeker/admin pages are
// noindex and intentionally excluded.
const STATIC_PAGES: Entry[] = [
  { path: "/", priority: "1.0", changefreq: "daily" },
  { path: "/for-seekers", priority: "0.9", changefreq: "weekly" },
  { path: "/for-owners", priority: "0.9", changefreq: "weekly" },
  { path: "/pricing", priority: "0.8", changefreq: "monthly" },
  { path: "/features", priority: "0.8", changefreq: "monthly" },
  { path: "/about", priority: "0.7", changefreq: "monthly" },
  { path: "/mentors", priority: "0.6", changefreq: "monthly" },
  { path: "/become-mentor", priority: "0.5", changefreq: "monthly" },
  { path: "/faq", priority: "0.7", changefreq: "monthly" },
  { path: "/guides", priority: "0.7", changefreq: "weekly" },
  { path: "/resources", priority: "0.6", changefreq: "monthly" },
  { path: "/resources/roi-calculator", priority: "0.5", changefreq: "monthly" },
  { path: "/resources/rental-laws", priority: "0.5", changefreq: "monthly" },
  { path: "/resources/discord", priority: "0.4", changefreq: "monthly" },
  { path: "/suburbs", priority: "0.8", changefreq: "weekly" },
  { path: "/blog", priority: "0.7", changefreq: "weekly" },
  { path: "/help", priority: "0.6", changefreq: "monthly" },
  { path: "/contact", priority: "0.5", changefreq: "yearly" },
  { path: "/safety-verification", priority: "0.5", changefreq: "monthly" },
  { path: "/safety-reporting", priority: "0.4", changefreq: "yearly" },
  { path: "/support-disputes", priority: "0.4", changefreq: "yearly" },
  { path: "/no-agency", priority: "0.3", changefreq: "yearly" },
  { path: "/careers", priority: "0.4", changefreq: "monthly" },
  { path: "/press", priority: "0.3", changefreq: "yearly" },
  // Legal
  { path: "/terms-of-service", priority: "0.3", changefreq: "yearly" },
  { path: "/privacy-policy", priority: "0.3", changefreq: "yearly" },
  { path: "/cookie-policy", priority: "0.3", changefreq: "yearly" },
  { path: "/disclaimer", priority: "0.3", changefreq: "yearly" },
  { path: "/anti-discrimination", priority: "0.3", changefreq: "yearly" },
  { path: "/code-of-conduct", priority: "0.3", changefreq: "yearly" },
  { path: "/rules-community-guidelines", priority: "0.3", changefreq: "yearly" },
  { path: "/abn-terms", priority: "0.3", changefreq: "yearly" },
  { path: "/contact-legal", priority: "0.3", changefreq: "yearly" },
];

function urlTag(loc: string, changefreq: string, priority: string, lastmod: string): string {
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

function generateSitemap(
  suburbSlugs: string[] = [],
  listingIds: string[] = []
): string {
  const lastmod = new Date().toISOString().split("T")[0];
  const tags: string[] = [];

  for (const page of STATIC_PAGES) {
    const loc = page.path === "/" ? `${SITE_URL}/` : `${SITE_URL}${page.path}`;
    tags.push(urlTag(loc, page.changefreq, page.priority, lastmod));
  }
  for (const post of getAllPosts()) {
    tags.push(urlTag(`${SITE_URL}/blog/${post.slug}`, "monthly", "0.6", lastmod));
  }
  for (const guide of guidesContent) {
    tags.push(urlTag(`${SITE_URL}/guides/${guide.id}`, "monthly", "0.6", lastmod));
  }
  // Help articles. Excluded before because the page was client-rendered and
  // shipped an empty document; it is statically generated now.
  for (const article of HELP_ARTICLES) {
    tags.push(urlTag(`${SITE_URL}/help/${article.slug}`, "monthly", "0.5", lastmod));
  }
  for (const slug of suburbSlugs) {
    tags.push(urlTag(`${SITE_URL}/suburb/${slug}`, "weekly", "0.7", lastmod));
  }
  // Listing pages. These are the highest-intent organic pages a rental
  // marketplace has and none of them were ever submitted, because the page
  // was client-only and there was nothing for a crawler to index. It is
  // server-rendered now, so they belong here.
  for (const id of listingIds) {
    tags.push(urlTag(`${SITE_URL}/listing/${id}`, "daily", "0.8", lastmod));
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${tags.join("\n")}
</urlset>`;
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  // Pull the live suburb list from the backend so any suburb that exists gets
  // into the sitemap. If the backend is unreachable, ship the sitemap without
  // suburb URLs rather than failing the whole sitemap.
  let suburbSlugs: string[] = [];
  try {
    const r = await fetch(`${API_BASE_URL}/suburb/`);
    if (r.ok) {
      const data = await r.json();
      suburbSlugs = (data.suburbs || [])
        .map((s: { slug?: string }) => s.slug)
        .filter((s: string | undefined): s is string => Boolean(s));
    }
  } catch {
    // Backend unreachable - sitemap still ships with all static + content URLs.
  }

  // Approved listings only. The search endpoint already filters to
  // moderation_status = 'approved', so drafts and rejected listings cannot
  // leak into the sitemap.
  let listingIds: string[] = [];
  try {
    const r = await fetch(`${API_BASE_URL}/listings/search?limit=100`);
    if (r.ok) {
      const data = await r.json();
      const rows = Array.isArray(data) ? data : data.listings || [];
      listingIds = rows
        .map((l: { id?: string }) => l.id)
        .filter((v: string | undefined): v is string => Boolean(v));
    }
  } catch {
    // Backend unreachable - ship the rest of the sitemap rather than nothing.
  }

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader(
    "Cache-Control",
    "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400"
  );
  res.write(generateSitemap(suburbSlugs, listingIds));
  res.end();
  return { props: {} };
};

export default function SiteMap() {
  return null;
}
