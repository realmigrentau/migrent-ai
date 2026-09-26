/**
 * Names, slugs and the duplicate-name problem.
 *
 * 955 Australian place names are used by more than one locality. "Springfield"
 * is nine different places in six states; Queensland alone has two Richmonds
 * and two Newtowns. A suburb can therefore never be identified by its name,
 * and the SAL code is the primary key everywhere in this system.
 *
 * The ABS has already done most of the disambiguation work for us. Where a
 * name repeats, the published SAL name carries a qualifier:
 *
 *   "Auburn (NSW)"                        state only
 *   "Richmond (Mackay - Qld)"             local government area, then state
 *   "Springfield (Snowy Monaro Regional - NSW)"
 *
 * So the display name is the bare name, the state is shown beside it, and the
 * LGA qualifier is kept in reserve for the cases where a state still has two
 * places with the same name.
 */

/** ABS state suffixes as they appear inside SAL name parentheses. */
const STATE_SUFFIX = "NSW|Vic\\.|Qld|SA|WA|Tas\\.|NT|ACT|OT";
const NAME_RE = new RegExp(`^(.*?)\\s*\\((?:(.+?)\\s+-\\s+)?(${STATE_SUFFIX})\\)$`);

/**
 * Split a published SAL name into the part people say and the qualifier the
 * ABS added to keep it unique.
 *
 *   "Richmond (Mackay - Qld)" -> { name: "Richmond", qualifier: "Mackay" }
 *   "Auburn (NSW)"            -> { name: "Auburn",   qualifier: null }
 *   "Richmond Lowlands"       -> { name: "Richmond Lowlands", qualifier: null }
 */
export function parsePlaceName(salName) {
  const raw = String(salName || "").trim();
  const m = NAME_RE.exec(raw);
  if (!m) return { name: raw, qualifier: null, published: raw };
  return { name: m[1].trim(), qualifier: m[2] ? m[2].trim() : null, published: raw };
}

/** Lowercase, punctuation-free, hyphenated. Handles apostrophes and saints. */
export function slugify(value) {
  return String(value)
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/['‘’`]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Assign every place a URL slug that is unique within its state.
 *
 * Three passes, each only used where the one before it was not enough:
 *   1. the bare name                      /suburb/nsw/auburn
 *   2. bare name + the ABS LGA qualifier  /suburb/qld/richmond-mackay
 *   3. bare name + the SAL code           /suburb/qld/richmond-32424
 *
 * Mutates each place with `slug`, `displayName` and `disambiguatedBy`, and
 * returns the number that needed more than pass 1.
 */
export function assignSlugs(places) {
  const byStateSlug = new Map(); // "nsw/auburn" -> [place, ...]

  for (const p of places) {
    const parsed = parsePlaceName(p.name);
    p.displayName = parsed.name;
    p.publishedName = parsed.published;
    p.lgaQualifier = parsed.qualifier;
    p.slug = slugify(parsed.name);
    p.disambiguatedBy = null;
    const key = `${p.state.toLowerCase()}/${p.slug}`;
    if (!byStateSlug.has(key)) byStateSlug.set(key, []);
    byStateSlug.get(key).push(p);
  }

  let disambiguated = 0;
  for (const group of byStateSlug.values()) {
    if (group.length === 1) continue;

    // Pass 2: the qualifier the ABS already published.
    const bySecond = new Map();
    for (const p of group) {
      const suffix = p.lgaQualifier ? slugify(p.lgaQualifier) : "";
      p.slug = suffix ? `${slugify(p.displayName)}-${suffix}` : slugify(p.displayName);
      p.disambiguatedBy = suffix ? "lga" : null;
      if (!bySecond.has(p.slug)) bySecond.set(p.slug, []);
      bySecond.get(p.slug).push(p);
    }

    // Pass 3: still colliding, so fall back to the stable identifier.
    for (const second of bySecond.values()) {
      if (second.length === 1) continue;
      for (const p of second) {
        p.slug = `${slugify(p.displayName)}-${p.salCode}`;
        p.disambiguatedBy = "sal-code";
      }
    }
    disambiguated += group.length;
  }

  return disambiguated;
}

/**
 * The heading and search-result label. State always appears; the LGA is added
 * only where it is what tells two places apart.
 */
export function placeLabel(place) {
  return place.disambiguatedBy === "lga" && place.lgaQualifier
    ? `${place.displayName} (${place.lgaQualifier}), ${place.state}`
    : `${place.displayName}, ${place.state}`;
}
