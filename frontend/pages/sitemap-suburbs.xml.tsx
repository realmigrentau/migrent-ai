import type { GetServerSideProps } from "next";
import { loadManifest, loadPlaces, loadRegions } from "../lib/suburbs/data.server";
import { placeHref } from "../lib/suburbs/search";
import { SITE_URL } from "../lib/site";

/**
 * The suburb sitemaps, kept out of the main one.
 *
 * 15,334 suburb URLs would be about 1.5MB in a single file - inside the
 * 50,000-URL limit but well past the point where it is quick to fetch or
 * useful to debug. So this route serves two things:
 *
 *   /sitemap-suburbs.xml          a sitemap index listing the chunks
 *   /sitemap-suburbs.xml?page=N   one chunk of CHUNK_SIZE URLs
 *
 * A query parameter rather than a path segment because the Pages Router only
 * makes whole path segments dynamic, and "sitemap-suburbs-[page].xml" is a
 * partial one. Search engines accept query strings in sitemap index entries.
 */

const CHUNK_SIZE = 5000;

function escapeXml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function buildIndex(chunks: number, lastmod: string): string {
  const entries = Array.from({ length: chunks }, (_, i) =>
    `  <sitemap>
    <loc>${escapeXml(`${SITE_URL}/sitemap-suburbs.xml?page=${i}`)}</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>`,
  );
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join("\n")}
</sitemapindex>`;
}

function buildChunk(page: number, lastmod: string): string {
  const places = loadPlaces();
  const slice = places.slice(page * CHUNK_SIZE, (page + 1) * CHUNK_SIZE);

  // The region landing views go in the first chunk so they are not lost.
  const extra =
    page === 0
      ? loadRegions().map(
          (r) => `  <url>
    <loc>${escapeXml(`${SITE_URL}/suburbs?region=${r.id}`)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`,
        )
      : [];

  const urls = slice.map((p) => {
    // A locality with no Census figures is a thin page; it stays in the
    // sitemap so it can be found, but at a lower priority than a suburb
    // with a full profile behind it.
    const priority = p.population >= 1000 ? "0.7" : p.population > 0 ? "0.5" : "0.3";
    return `  <url>
    <loc>${escapeXml(`${SITE_URL}${placeHref(p)}`)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${priority}</priority>
  </url>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...extra, ...urls].join("\n")}
</urlset>`;
}

export const getServerSideProps: GetServerSideProps = async ({ query, res }) => {
  const manifest = loadManifest();
  const lastmod = manifest.generatedAt.slice(0, 10);
  const total = loadPlaces().length;
  const chunks = Math.max(1, Math.ceil(total / CHUNK_SIZE));

  const raw = typeof query.page === "string" ? Number(query.page) : NaN;
  const body =
    Number.isInteger(raw) && raw >= 0 && raw < chunks
      ? buildChunk(raw, lastmod)
      : buildIndex(chunks, lastmod);

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800");
  res.write(body);
  res.end();
  return { props: {} };
};

export default function SuburbSitemap() {
  return null;
}
