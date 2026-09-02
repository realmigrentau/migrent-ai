import type { GetServerSideProps } from "next";
import { SITE_URL } from "../lib/site";
import { API_BASE_URL } from "../lib/apiBase";
import { getAllPosts } from "../data/blogPosts";
import guidesContent from "../data/guidesContent";
import { HELP_ARTICLES } from "../lib/helpData";
import contentLastmod from "../data/contentLastmod.json";

// Dates come from git history via scripts/content-lastmod.mjs, committed as
// data/contentLastmod.json. A page with no recorded date is omitted from
// <lastmod> rather than stamped with today.
const LASTMOD: Record<string, string> = contentLastmod as Record<string, string>;

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
  { path: "/resources/rental-laws", priority: "0.5", changefreq: "monthly" },
  { path: "/suburbs", priority: "0.8", changefreq: "weekly" },
  { path: "/blog", priority: "0.7", changefreq: "weekly" },
  { path: "/help", priority: "0.6", changefreq: "monthly" },
  { path: "/contact", priority: "0.5", changefreq: "yearly" },
  { path: "/safety-verification", priority: "0.5", changefreq: "monthly" },
  { path: "/safety-reporting", priority: "0.4", changefreq: "yearly" },
  { path: "/support-disputes", priority: "0.4", changefreq: "yearly" },
  { path: "/no-agency", priority: "0.3", changefreq: "yearly" },
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

function urlTag(loc: string, changefreq: string, priority: string, lastmod?: string | null): string {
  return `  <url>
    <loc>${loc}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ""}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

function generateSitemap(
  suburbSlugs: string[] = [],
  listings: { id: string; updated_at?: string; created_at?: string }[] = []
): string {
  const tags: string[] = [];

  for (const page of STATIC_PAGES) {
    const loc = page.path === "/" ? `${SITE_URL}/` : `${SITE_URL}${page.path}`;
    tags.push(urlTag(loc, page.changefreq, page.priority, LASTMOD[page.path]));
  }
  for (const post of getAllPosts()) {
    tags.push(urlTag(`${SITE_URL}/blog/${post.slug}`, "monthly", "0.6", LASTMOD["data:blogPosts"]));
  }
  for (const guide of guidesContent) {
    tags.push(urlTag(`${SITE_URL}/guides/${guide.id}`, "monthly", "0.6", LASTMOD["data:guidesContent"]));
  }
  for (const article of HELP_ARTICLES) {
    tags.push(urlTag(`${SITE_URL}/help/${article.slug}`, "monthly", "0.5", LASTMOD["data:helpData"]));
  }
  for (const slug of suburbSlugs) {
    tags.push(urlTag(`${SITE_URL}/suburb/${slug}`, "weekly", "0.7", null));
  }
  // Listing pages: only published, still-available listings come back from
  // the search endpoint, so expired and unmoderated rooms never appear here.
  for (const l of listings) {
    const stamp = (l.updated_at || l.created_at || "").slice(0, 10) || null;
    tags.push(urlTag(`${SITE_URL}/listing/${l.id}`, "daily", "0.8", stamp));
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
  let listings: { id: string; updated_at?: string; created_at?: string }[] = [];
  try {
    const r = await fetch(`${API_BASE_URL}/listings/search?limit=100`);
    if (r.ok) {
      const data = await r.json();
      const rows = Array.isArray(data) ? data : data.listings || [];
      listings = rows
        .filter((l: { id?: string; public_state?: string }) => Boolean(l.id) && (l.public_state ?? "published") === "published")
        .map((l: { id: string; updated_at?: string; created_at?: string }) => ({ id: l.id, updated_at: l.updated_at, created_at: l.created_at }));
    }
  } catch {
    // Backend unreachable - ship the rest of the sitemap rather than nothing.
  }

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader(
    "Cache-Control",
    "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400"
  );
  res.write(generateSitemap(suburbSlugs, listings));
  res.end();
  return { props: {} };
};

export default function SiteMap() {
  return null;
}
