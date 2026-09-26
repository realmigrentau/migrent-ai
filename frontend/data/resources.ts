/**
 * The Resources index - one typed source for the whole section.
 *
 * Before this file the Resources dropdown carried eight destinations
 * (/guides, /blog, two calculators-and-laws pages, /faq, /help, plus
 * /careers and /become-mentor, which are not resources at all) and every
 * surface that listed them - the navbar, the mobile menu, the /resources
 * landing page, the footer - kept its own copy of the titles. They had
 * already drifted apart.
 *
 * Now there are three destinations, and they are declared once here:
 *
 *   /resources/guides   everything written  (guides + blog, merged)
 *   /resources/tools    everything you use  (calculators + lookups)
 *   /resources/help     everything you ask  (FAQ + help articles)
 *
 * There is deliberately no fourth "Stories & Updates" hub. The only
 * story-shaped content on the site is a single product announcement, so a
 * hub for it would be one card and five empty ones. It carries an "Update"
 * label inside Guides & Articles instead.
 *
 * The article index is DERIVED from data/guidesContent.ts and
 * data/blogPosts.ts rather than restated, so a title or a reading time can
 * only ever be changed in one place and nothing here can invent a page
 * that does not exist.
 */

import guidesContent from "./guidesContent";
import { getAllPosts } from "./blogPosts";

/* ── Shared vocabulary ─────────────────────────────────────────────── */

/** What a reader is looking at. Distinguishes merged content without
 *  needing the two separate sections it used to take. */
export type ResourceKind = "Guide" | "Article" | "Update";

/**
 * Filter categories. Every one of these is backed by at least two real
 * pieces of content - there are no empty chips. "Education" and
 * "Australian life" from the wider brief are not here because nothing on
 * the site is about them yet.
 */
export const RESOURCE_CATEGORIES = [
  "Housing",
  "Hosting",
  "Money",
  "Visas & rights",
  "Safety",
] as const;

export type ResourceCategory = (typeof RESOURCE_CATEGORIES)[number];

/** 24x24 stroke paths, drawn at the same weight everywhere they appear:
 *  the navbar dropdown, the landing cards and the hub heroes all read the
 *  same glyph from this one table. */
export const RESOURCE_ICON = {
  book: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
  clipboard:
    "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01",
  lifebuoy:
    "M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z",
  calculator:
    "M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z",
  scales:
    "M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3",
  compass:
    "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z",
} as const;

export type ResourceIconName = keyof typeof RESOURCE_ICON;

/* ── The three destinations ────────────────────────────────────────── */

export interface ResourceHub {
  /** Last path segment, and the anchor used on the landing page. */
  id: string;
  href: string;
  title: string;
  /** One line. It has to fit a dropdown row without wrapping twice. */
  description: string;
  icon: ResourceIconName;
}

export const RESOURCE_HUBS: ResourceHub[] = [
  {
    id: "guides",
    href: "/resources/guides",
    title: "Guides & Articles",
    description: "Practical advice for moving, living and settling in Australia.",
    icon: "book",
  },
  {
    id: "tools",
    href: "/resources/tools",
    title: "Tools & Checklists",
    description: "Planners, calculators and lookups for your move.",
    icon: "clipboard",
  },
  {
    id: "help",
    href: "/resources/help",
    title: "Help Centre",
    description: "Quick answers to common questions about MigRent.",
    icon: "lifebuoy",
  },
];

/* ── Articles: guides and blog posts, merged ───────────────────────── */

export interface ResourceArticle {
  /** Unique across the merged index. */
  key: string;
  /** The detail page, whose URL is unchanged by the consolidation. */
  href: string;
  kind: ResourceKind;
  title: string;
  summary: string;
  category: ResourceCategory;
  readMinutes: number;
  /** Real publication month, blog posts only. Guides are undated. */
  date?: string;
  author?: string;
  keywords: string[];
}

/** Guide id -> filter category. Derived from what each guide is actually
 *  about, not from its internal seeker/owner/legal audience field. */
const GUIDE_CATEGORY: Record<string, ResourceCategory> = {
  "host-first": "Hosting",
  "find-fast": "Housing",
  "verify-profile": "Safety",
  "list-property": "Hosting",
  superhost: "Hosting",
  earnings: "Money",
  visas: "Visas & rights",
  disputes: "Visas & rights",
};

/** Blog slug -> filter category, and the ones that read as product news
 *  rather than advice. */
const POST_CATEGORY: Record<string, ResourceCategory> = {
  "5-tips-first-time-migrants": "Housing",
  "sydney-rental-market-2026": "Money",
  "spot-rental-scams": "Safety",
  "superhost-program-launch": "Hosting",
  "budgeting-rent-students": "Money",
  "bond-rights-migrants": "Visas & rights",
};

const POST_KIND: Record<string, ResourceKind> = {
  "superhost-program-launch": "Update",
};

/** "7 min read" -> 7. Falls back to a conservative 5 rather than 0 so a
 *  card never claims a piece is instant. */
function minutesFrom(readTime: string): number {
  const n = Number.parseInt(readTime, 10);
  return Number.isFinite(n) && n > 0 ? n : 5;
}

const guideArticles: ResourceArticle[] = guidesContent.map((g) => ({
  key: `guide:${g.id}`,
  href: `/guides/${g.id}`,
  kind: "Guide" as const,
  title: g.title,
  summary: g.description,
  category: GUIDE_CATEGORY[g.id] ?? "Housing",
  readMinutes: minutesFrom(g.readTime),
  keywords: [g.difficulty, g.category, ...g.sections.map((s) => s.title)],
}));

const postArticles: ResourceArticle[] = getAllPosts().map((p) => ({
  key: `post:${p.slug}`,
  href: `/blog/${p.slug}`,
  kind: POST_KIND[p.slug] ?? "Article",
  title: p.title,
  summary: p.excerpt,
  category: POST_CATEGORY[p.slug] ?? "Housing",
  readMinutes: minutesFrom(p.readTime),
  date: p.date,
  author: p.author,
  keywords: [p.category, ...p.tags],
}));

/**
 * Guides first, then posts newest-first - which is the order they were
 * already written in, so no date has to be parsed or invented.
 */
export const RESOURCE_ARTICLES: ResourceArticle[] = [...guideArticles, ...postArticles];

/** The one piece the hub leads with. "Find Rentals Fast" is the shortest
 *  path to the thing a first-time visitor came for. */
export const FEATURED_ARTICLE_KEY = "guide:find-fast";

export function getFeaturedArticle(): ResourceArticle {
  return (
    RESOURCE_ARTICLES.find((a) => a.key === FEATURED_ARTICLE_KEY) ?? RESOURCE_ARTICLES[0]
  );
}

/** Only the categories that actually have something in them, in the
 *  declared order, so a chip can never lead to an empty grid. */
export function getUsedCategories(): ResourceCategory[] {
  return RESOURCE_CATEGORIES.filter((c) =>
    RESOURCE_ARTICLES.some((a) => a.category === c),
  );
}

export function countByCategory(category: ResourceCategory): number {
  return RESOURCE_ARTICLES.filter((a) => a.category === category).length;
}

/* ── Tools: only what is built and working ─────────────────────────── */

export interface ResourceTool {
  id: string;
  href: string;
  title: string;
  summary: string;
  category: ResourceCategory;
  /** The button label. It says what the thing does, not "Learn more". */
  action: string;
  icon: ResourceIconName;
  /** Shown as a small qualifier when a tool is not for everyone. */
  audience?: string;
  keywords: string[];
}

/**
 * Three tools, all of them real and already shipping. There are no
 * placeholder cards here: a budget planner and a moving checklist would be
 * useful, but neither exists yet, and a card that opens nothing is worse
 * than a shorter page.
 */
export const RESOURCE_TOOLS: ResourceTool[] = [
  {
    id: "rental-laws",
    href: "/resources/rental-laws",
    title: "Rental law by state",
    summary:
      "Bond limits, tenant rights and the dispute process, for every state and territory.",
    category: "Visas & rights",
    action: "Look up your state",
    icon: "scales",
    keywords: ["bond", "tenancy", "fair trading", "tribunal", "rights", "lease", "eviction"],
  },
  {
    id: "suburbs",
    href: "/suburbs",
    title: "Suburb comparison",
    summary:
      "Compare rent, transport and communities suburb by suburb before you commit to an area.",
    category: "Housing",
    action: "Compare suburbs",
    icon: "compass",
    keywords: ["suburb", "rent", "transport", "commute", "neighbourhood", "compare"],
  },
  {
    id: "roi-calculator",
    href: "/resources/roi-calculator",
    title: "Room earnings calculator",
    summary:
      "Estimate what a spare room could earn, by suburb, room type and occupancy.",
    category: "Money",
    action: "Estimate earnings",
    icon: "calculator",
    audience: "For hosts",
    keywords: ["roi", "yield", "income", "earnings", "rent", "calculator", "owner"],
  },
];

/* ── In-development pages, named honestly ──────────────────────────── */

/**
 * Two routes that exist but have nothing behind them yet. They stay
 * reachable so old links and bookmarks keep working, and they are listed
 * as one line of text rather than as cards, because a card promises a
 * destination.
 */
export const RESOURCES_IN_PROGRESS = [
  { href: "/resources/api-docs", label: "Developer API" },
  { href: "/resources/discord", label: "Community chat" },
];

/* ── Search ────────────────────────────────────────────────────────── */

export interface ResourceHit {
  key: string;
  href: string;
  title: string;
  summary: string;
  /** "Guide" / "Article" / "Update" / "Tool". */
  label: string;
  category: ResourceCategory;
  readMinutes?: number;
}

function haystack(parts: (string | undefined)[]): string {
  return parts.filter(Boolean).join(" ").toLowerCase();
}

/**
 * Case-insensitive substring match across titles, summaries, categories
 * and keywords. Every term in the query has to match somewhere, so
 * "bond nsw" narrows instead of widening.
 *
 * It runs over 17 records held in memory, which is why there is no index
 * and no search dependency: the whole corpus is smaller than the library
 * that would search it.
 */
export function searchResources(query: string): ResourceHit[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];

  const articleHits: { hit: ResourceHit; text: string }[] = RESOURCE_ARTICLES.map((a) => ({
    hit: {
      key: a.key,
      href: a.href,
      title: a.title,
      summary: a.summary,
      label: a.kind,
      category: a.category,
      readMinutes: a.readMinutes,
    },
    text: haystack([a.title, a.summary, a.category, a.keywords.join(" ")]),
  }));

  const toolHits: { hit: ResourceHit; text: string }[] = RESOURCE_TOOLS.map((t) => ({
    hit: {
      key: `tool:${t.id}`,
      href: t.href,
      title: t.title,
      summary: t.summary,
      label: "Tool",
      category: t.category,
    },
    text: haystack([t.title, t.summary, t.category, t.keywords.join(" ")]),
  }));

  return [...toolHits, ...articleHits]
    .filter(({ text }) => terms.every((term) => text.includes(term)))
    .map(({ hit }) => hit);
}
