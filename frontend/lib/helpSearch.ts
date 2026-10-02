/**
 * "Quick answers" in the support widget: a plain keyword search over the
 * Help centre (lib/helpData.ts), which describes Migrent as it works today.
 *
 * It replaced data/supportKB.ts, an older answer bank that described
 * features Migrent does not have (AI matching, a Superhost programme,
 * promotional pricing, a dashboard). It is not AI and is not labelled as
 * such; every answer links to the Help article it came from.
 */
import { HELP_ARTICLES, HELP_FAQ } from "./helpData";

export interface HelpAnswer {
  text: string;
  link?: { href: string; label: string };
}

const STOP = new Set([
  "the", "and", "for", "you", "your", "can", "how", "what", "when", "who", "why", "where", "does", "are", "with",
  "this", "that", "from", "have", "has", "will", "would", "should", "about", "into", "there", "they", "them", "our", "out",
  "not", "but", "any", "all", "get", "got", "need", "want", "please", "help", "migrent", "much", "many", "its", "is", "my", "do", "me", "to", "of", "in", "on", "an", "or", "if", "be",
]);

// Words people use for the same thing.
const SYNONYMS: Record<string, string[]> = {
  deposit: ["bond"],
  bond: ["deposit"],
  scam: ["safety", "report", "unsafe"],
  fee: ["cost", "charge", "pay", "price"],
  cost: ["fee", "charge", "pay", "price"],
  price: ["fee", "cost"],
  pay: ["fee", "cost", "payment"],
  verify: ["verification", "check", "id"],
  verification: ["verify", "check", "id"],
  id: ["verification", "check"],
  delete: ["remove", "close", "account"],
  password: ["sign", "login"],
  login: ["sign", "password"],
  signin: ["sign", "login"],
  host: ["owner", "list", "listing"],
  owner: ["host", "listing"],
  room: ["rooms", "home", "search"],
  apply: ["application", "applying"],
  inspection: ["inspect", "viewing"],
  visa: ["visas", "rights"],
};

function words(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .map((w) => (w.length > 4 && w.endsWith("s") ? w.slice(0, -1) : w))
    .filter((w) => w.length >= 2 && !STOP.has(w));
}

function expand(terms: string[]): string[] {
  const out = new Set(terms);
  for (const t of terms) for (const s of SYNONYMS[t] ?? []) out.add(s);
  return [...out];
}

function score(terms: string[], fields: [string, number][]): number {
  let total = 0;
  for (const [text, weight] of fields) {
    const bag = new Set(words(text));
    for (const t of terms) if (bag.has(t)) total += weight;
  }
  return total;
}

const ARTICLE_LINK = (slug: string) => `/help/${slug}`;

/** The article's opening paragraph, as plain text: an answer, where the
 *  summary is only a description of the article. */
function opening(body: string): string {
  const para = body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .find((p) => p && !p.startsWith("#") && !p.startsWith("-") && !p.startsWith("|"));
  const text = (para ?? "").replace(/\*\*|__|`/g, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
  return text.length > 420 ? `${text.slice(0, 417).trimEnd()}...` : text;
}

/** The best Help centre answer for a question, or null. */
export function searchHelp(question: string): HelpAnswer | null {
  const asked = words(question);
  if (asked.length === 0) return null;
  const terms = expand(asked);

  type Hit = { s: number; answer: HelpAnswer };
  const hits: Hit[] = [];
  for (const group of HELP_FAQ) {
    for (const f of group.items) {
      // A short direct answer beats an article on the same subject.
      const s = score(terms, [[f.q, 6], [f.a, 1]]);
      if (s > 0) hits.push({ s: s + 2, answer: { text: f.a, link: { href: "/help", label: "More in the Help centre" } } });
    }
  }
  for (const a of HELP_ARTICLES) {
    const s = score(terms, [[a.title, 4], [a.tags.join(" "), 2], [a.summary, 1], [a.body, 0.5]]);
    if (s > 0) hits.push({ s, answer: { text: opening(a.body) || a.summary, link: { href: ARTICLE_LINK(a.slug), label: a.title } } });
  }
  if (hits.length === 0) return null;
  hits.sort((x, y) => y.s - x.s);
  // A single weak match in long body text is more confusing than no answer.
  return hits[0].s >= 2 ? hits[0].answer : null;
}
