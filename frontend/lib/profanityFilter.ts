/**
 * Basic profanity / slur filter for user-generated content.
 * This is a simple keyword check — for production, consider
 * a more robust library or API-based content moderation service.
 */

const BLOCKED_PATTERNS: RegExp[] = [
  // Slurs & hate speech (abbreviated patterns to catch variations)
  /\bn[i1!|]gg/i,
  /\bf[a@]gg/i,
  /\bk[i1!|]ke\b/i,
  /\bch[i1!|]nk\b/i,
  /\bsp[i1!|]c\b/i,
  /\bwetback/i,
  /\btowelhead/i,
  /\bcamel\s*jockey/i,
  // Scam / spam signals
  /\bwire\s*transfer\b/i,
  /\bwestern\s*union\b/i,
  /\bsend\s*money\s*first\b/i,
  /\bpay\s*before\s*viewing\b/i,
  /\bno\s*inspection\s*needed\b/i,
  /\bbitcoin\b/i,
  /\bcrypto\s*only\b/i,
];

export interface FilterResult {
  clean: boolean;
  flagged: string[];
}

/**
 * Check a string for blocked content.
 * Returns { clean: true } if safe, or { clean: false, flagged: [...] } with matched patterns.
 */
export function checkContent(text: string): FilterResult {
  const flagged: string[] = [];
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(text)) {
      flagged.push(pattern.source);
    }
  }
  return { clean: flagged.length === 0, flagged };
}

/**
 * Quick boolean check — is the text acceptable?
 */
export function isClean(text: string): boolean {
  return checkContent(text).clean;
}
