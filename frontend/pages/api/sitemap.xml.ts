import type { NextApiRequest, NextApiResponse } from "next";

const BASE_URL = "https://migrent-ai.vercel.app";

const STATIC_PAGES = [
  { path: "/", priority: "1.0", changefreq: "daily" },
  { path: "/seeker/search", priority: "0.9", changefreq: "daily" },
  { path: "/about", priority: "0.7", changefreq: "monthly" },
  { path: "/support", priority: "0.6", changefreq: "monthly" },
  { path: "/terms", priority: "0.4", changefreq: "yearly" },
  { path: "/privacy", priority: "0.4", changefreq: "yearly" },
  { path: "/rules", priority: "0.4", changefreq: "yearly" },
  { path: "/safety", priority: "0.5", changefreq: "monthly" },
];

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  const now = new Date().toISOString().split("T")[0];

  const urls = STATIC_PAGES.map(
    (p) => `
  <url>
    <loc>${BASE_URL}${p.path}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
  ).join("");

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  res.setHeader("Content-Type", "application/xml");
  res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=3600");
  res.status(200).send(sitemap);
}
