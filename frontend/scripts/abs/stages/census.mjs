/**
 * Stage 2 - the 2021 Census, joined onto each suburb.
 *
 * Reads five General Community Profile tables straight out of the DataPack
 * zip. None of this reaches the browser: the zip is 98MB and the tables it
 * holds are ~600MB expanded, so everything is reduced here to the handful of
 * measures the pages actually show.
 *
 * Two things the ABS does that this stage has to respect:
 *
 *  - Small counts are randomly perturbed to protect confidentiality, so a
 *    locality of 30 people has numbers that do not add up and percentages
 *    that are noise. Anything below MIN_POPULATION_FOR_RATES keeps its
 *    population but publishes no derived rates.
 *  - A median of 0 does not mean "$0". It means the ABS had nothing to
 *    publish. Those become null, never zero.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { unzip } from "../xlsx.mjs";
import { parseCsv } from "../csv.mjs";

const DIR = "2021 Census GCP Suburbs and Localities for AUS";
const table = (t) => `${DIR}/2021Census_${t}_AUST_SAL.csv`;

/**
 * Below this, ABS perturbation dominates and a percentage says more about
 * the confidentiality process than about the place.
 */
export const MIN_POPULATION_FOR_RATES = 50;

/** How many countries / languages to keep per place. */
const TOP_N = 5;

/** ABS short country codes that are residual buckets, not countries. */
const NON_COUNTRIES = new Set(["Australia", "Elsewhere", "COB_NS", "Tot"]);

/** ABS short country code -> the name we print. */
const COUNTRY_LABELS = {
  Bosnia_Herzegov: "Bosnia and Herzegovina",
  Hong_Kong_SAR_Ch: "Hong Kong",
  Korea_South: "South Korea",
  North_Macedonia: "North Macedonia",
  New_Zealand: "New Zealand",
  PNG: "Papua New Guinea",
  South_Africa: "South Africa",
  Sri_Lanka: "Sri Lanka",
  USA: "United States",
};

/** ABS short language code -> the name we print. Residuals map to null. */
const LANGUAGE_LABELS = {
  AIndLng: "Australian Indigenous languages",
  CL_Canton: "Cantonese",
  CL_Mandarin: "Mandarin",
  CL_Oth: null,
  CL_Tot: null,
  IAL_Bengali: "Bengali",
  IAL_Guj: "Gujarati",
  IAL_Hindi: "Hindi",
  IAL_Nepali: "Nepali",
  IAL_Punjabi: "Punjabi",
  IAL_Sinhal: "Sinhalese",
  IAL_Urdu: "Urdu",
  IAL_Oth: null,
  IAL_Tot: null,
  Japan: "Japanese",
  Macedon: "Macedonian",
  Persian_ED: "Persian (excluding Dari)",
  SAL_Filipin: "Filipino",
  SAL_Indon: "Indonesian",
  SAL_Tagalog: "Tagalog",
  SAL_Oth: null,
  SAL_Tot: null,
  Oth: null,
  Tot: null,
};

const countryLabel = (code) => COUNTRY_LABELS[code] ?? code.replace(/_/g, " ");
const languageLabel = (code) =>
  code in LANGUAGE_LABELS ? LANGUAGE_LABELS[code] : code.replace(/_/g, " ");

/** Strip the "SAL" prefix the DataPack puts on every geography code. */
const salCode = (v) => String(v || "").replace(/^SAL/, "");

/** A median the ABS could not publish comes through as 0, which is not a value. */
const median = (v) => (v === null || v === undefined || Number(v) <= 0 ? null : Number(v));

const num = (v) => (v === null || v === undefined || v === "" ? 0 : Number(v));

/** Percentage to one decimal place, or null when the denominator is unusable. */
function pct(part, whole) {
  if (!whole || whole <= 0) return null;
  return Math.round((part / whole) * 1000) / 10;
}

/** Read one table out of the DataPack, keeping only the columns asked for. */
function readTable(zip, name, columns) {
  const entry = zip[table(name)];
  if (!entry) throw new Error(`Census DataPack has no ${table(name)}`);
  return parseCsv(entry.toString("utf8"), { columns });
}

export function buildCensus(cacheDir, log = console.log) {
  log("  opening Census DataPack");
  const zipBuf = readFileSync(join(cacheDir, "2021_GCP_SAL_for_AUS_short-header.zip"));
  const wanted = ["G01", "G02", "G37", "G09F", "G09G", "G09H", "G13C", "G13D", "G13E"].map(table);
  const zip = unzip(zipBuf, wanted);

  const stats = new Map();
  const ensure = (code) => {
    let s = stats.get(code);
    if (!s) { s = { salCode: code }; stats.set(code, s); }
    return s;
  };

  // -- G01: population, birthplace, language spoken at home ---------------
  log("  G01 selected person characteristics");
  {
    const cols = [
      "SAL_CODE_2021", "Tot_P_P",
      "Birthplace_Australia_P", "Birthplace_Elsewhere_P",
      "Lang_used_home_Eng_only_P", "Lang_used_home_Oth_Lang_P",
    ];
    for (const r of readTable(zip, "G01", cols).rows) {
      const s = ensure(salCode(r.SAL_CODE_2021));
      s.population = num(r.Tot_P_P);
      s._bornAustralia = num(r.Birthplace_Australia_P);
      s._bornElsewhere = num(r.Birthplace_Elsewhere_P);
      s._engOnly = num(r.Lang_used_home_Eng_only_P);
      s._othLang = num(r.Lang_used_home_Oth_Lang_P);
    }
  }

  // -- G02: the published medians and averages ----------------------------
  log("  G02 medians and averages");
  {
    const cols = [
      "SAL_CODE_2021", "Median_age_persons", "Median_rent_weekly",
      "Median_tot_hhd_inc_weekly", "Median_tot_prsnl_inc_weekly",
      "Average_household_size", "Average_num_psns_per_bedroom",
    ];
    for (const r of readTable(zip, "G02", cols).rows) {
      const s = ensure(salCode(r.SAL_CODE_2021));
      s.medianAge = median(r.Median_age_persons);
      s.medianWeeklyRent = median(r.Median_rent_weekly);
      s.medianWeeklyHouseholdIncome = median(r.Median_tot_hhd_inc_weekly);
      s.medianWeeklyPersonalIncome = median(r.Median_tot_prsnl_inc_weekly);
      s.averageHouseholdSize = median(r.Average_household_size);
      s.averagePersonsPerBedroom = median(r.Average_num_psns_per_bedroom);
    }
  }

  // -- G37: tenure and dwelling structure ---------------------------------
  log("  G37 dwelling structure by tenure");
  {
    const cols = [
      "SAL_CODE_2021", "R_Tot_Total", "O_OR_Total", "O_MTG_Total",
      "Total_DS_Sep_house", "Total_DS_SemiD_ro_or_tce_h_th",
      "Total_DS_Flat_apart", "Total_DS_Oth_dwell", "Total_Total",
    ];
    for (const r of readTable(zip, "G37", cols).rows) {
      const s = ensure(salCode(r.SAL_CODE_2021));
      s._dwellings = num(r.Total_Total);
      s._rented = num(r.R_Tot_Total);
      s._ownedOutright = num(r.O_OR_Total);
      s._mortgaged = num(r.O_MTG_Total);
      s._dsHouse = num(r.Total_DS_Sep_house);
      s._dsSemi = num(r.Total_DS_SemiD_ro_or_tce_h_th);
      s._dsFlat = num(r.Total_DS_Flat_apart);
      s._dsOther = num(r.Total_DS_Oth_dwell);
    }
  }

  // -- G09F/G/H: country of birth, persons totals -------------------------
  log("  G09 country of birth");
  for (const part of ["G09F", "G09G", "G09H"]) {
    const entry = zip[table(part)];
    const header = entry.toString("utf8", 0, entry.indexOf(10)).trim().split(",");
    const keep = header.filter((h) => {
      const m = /^P_(.+)_Tot$/.exec(h);
      return m && !NON_COUNTRIES.has(m[1]);
    });
    if (keep.length === 0) continue;
    for (const r of readTable(zip, part, ["SAL_CODE_2021", ...keep]).rows) {
      const s = ensure(salCode(r.SAL_CODE_2021));
      s._countries = s._countries || [];
      for (const h of keep) {
        const n = num(r[h]);
        if (n > 0) s._countries.push([countryLabel(/^P_(.+)_Tot$/.exec(h)[1]), n]);
      }
    }
  }

  // -- G13C/D/E: language used at home, persons totals ---------------------
  log("  G13 language used at home");
  for (const part of ["G13C", "G13D", "G13E"]) {
    const entry = zip[table(part)];
    const header = entry.toString("utf8", 0, entry.indexOf(10)).trim().split(",");
    const keep = header.filter((h) => {
      const m = /^POL_(.+)_Tot$/.exec(h);
      // _UOLSE_Tot is the "does not speak English well" sub-total, not a language.
      return m && !m[1].endsWith("_UOLSE") && languageLabel(m[1]) !== null;
    });
    if (keep.length === 0) continue;
    for (const r of readTable(zip, part, ["SAL_CODE_2021", ...keep]).rows) {
      const s = ensure(salCode(r.SAL_CODE_2021));
      s._languages = s._languages || [];
      for (const h of keep) {
        const n = num(r[h]);
        if (n > 0) s._languages.push([languageLabel(/^POL_(.+)_Tot$/.exec(h)[1]), n]);
      }
    }
  }

  // -- Derive the published measures --------------------------------------
  log("  deriving rates");
  const out = new Map();
  for (const s of stats.values()) {
    const pop = s.population || 0;
    const ratesOk = pop >= MIN_POPULATION_FOR_RATES;

    const rec = {
      population: pop,
      medianAge: s.medianAge ?? null,
      medianWeeklyRent: s.medianWeeklyRent ?? null,
      medianWeeklyHouseholdIncome: s.medianWeeklyHouseholdIncome ?? null,
      medianWeeklyPersonalIncome: s.medianWeeklyPersonalIncome ?? null,
      averageHouseholdSize: s.averageHouseholdSize ?? null,
      averagePersonsPerBedroom: s.averagePersonsPerBedroom ?? null,

      overseasBornPct: ratesOk ? pct(s._bornElsewhere, pop) : null,
      bornAustraliaPct: ratesOk ? pct(s._bornAustralia, pop) : null,
      otherLanguageAtHomePct: ratesOk ? pct(s._othLang, pop) : null,
      englishOnlyAtHomePct: ratesOk ? pct(s._engOnly, pop) : null,

      totalDwellings: s._dwellings || 0,
      rentedDwellings: s._rented || 0,
      rentedDwellingsPct: ratesOk ? pct(s._rented, s._dwellings) : null,
      ownedOutrightPct: ratesOk ? pct(s._ownedOutright, s._dwellings) : null,
      mortgagedPct: ratesOk ? pct(s._mortgaged, s._dwellings) : null,
      dwellingTypes: ratesOk && s._dwellings > 0
        ? {
            separateHouse: pct(s._dsHouse, s._dwellings),
            semiDetached: pct(s._dsSemi, s._dwellings),
            flatOrApartment: pct(s._dsFlat, s._dwellings),
            other: pct(s._dsOther, s._dwellings),
          }
        : null,

      topCountriesOfBirth: null,
      topLanguagesAtHome: null,
    };

    if (ratesOk && s._countries?.length) {
      rec.topCountriesOfBirth = s._countries
        .sort((a, b) => b[1] - a[1])
        .slice(0, TOP_N)
        .map(([name, count]) => ({ name, count, pct: pct(count, pop) }));
    }
    if (ratesOk && s._languages?.length) {
      rec.topLanguagesAtHome = s._languages
        .sort((a, b) => b[1] - a[1])
        .slice(0, TOP_N)
        .map(([name, count]) => ({ name, count, pct: pct(count, pop) }));
    }

    // Why a place shows no rates, so the page can say so rather than print "N/A".
    rec.ratesSuppressed = !ratesOk;

    out.set(s.salCode, rec);
  }

  log(`  ${out.size.toLocaleString()} SAL census records`);
  return out;
}
