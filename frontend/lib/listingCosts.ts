/**
 * What a renter pays before moving in, and where their bond goes.
 *
 * Bond and rent in advance are whole weeks of rent. Migrent caps them at 4
 * and 2 weeks in every state (owner decision, 2026-10-01): at or below the
 * legal limit everywhere for ordinary rents. The server enforces the same
 * numbers (backend/listing_rules.py).
 */
import { stateForPostcode } from "./hub/listingDraft";

export const MAX_BOND_WEEKS = 4;
export const MAX_RENT_IN_ADVANCE_WEEKS = 2;

/** Tasmania and the NT allow rent in advance for one rent period only, so
 * with weekly rent Migrent allows one week there (data/rentalLaws.ts;
 * backend/listing_rules.py max_rent_in_advance_weeks). */
export function maxRentInAdvanceWeeks(state: string | null | undefined): number {
  return state === "TAS" || state === "NT" ? 1 : MAX_RENT_IN_ADVANCE_WEEKS;
}

export interface CostFields {
  weekly_price?: number | null;
  bond_weeks?: number | null;
  rent_in_advance_weeks?: number | null;
  bills_included?: boolean | null;
  bills_estimate_weekly?: number | null;
  listing_purpose?: string | null;
  /** The old free-text bond, shown only when the weeks were never set. */
  bond?: string | null;
}

export interface MoveInCost {
  /** False when the host has not said yet (an older listing). */
  known: boolean;
  bondWeeks: number | null;
  bond: number | null;
  advanceWeeks: number | null;
  advance: number | null;
  total: number | null;
}

const money = (weeks: number | null | undefined, weekly: number) => (weeks == null ? null : Math.round(weeks * weekly));

export function isShortStay(l: Pick<CostFields, "listing_purpose">): boolean {
  return l.listing_purpose === "short_stay";
}

export function moveInCost(l: CostFields): MoveInCost {
  const weekly = Number(l.weekly_price) || 0;
  const bondWeeks = l.bond_weeks ?? null;
  // A short stay is paid per booking, never as rent in advance.
  const advanceWeeks = isShortStay(l) ? 0 : (l.rent_in_advance_weeks ?? null);
  const known = bondWeeks != null && advanceWeeks != null && weekly > 0;
  const bond = money(bondWeeks, weekly);
  const advance = money(advanceWeeks, weekly);
  return { known, bondWeeks, bond, advanceWeeks, advance, total: known ? (bond ?? 0) + (advance ?? 0) : null };
}

/** The old free-text bond ("4 weeks") as whole weeks, when it plainly is
 * one. Mirrors bond_weeks_from_text() in backend/listing_rules.py. */
export function bondWeeksFromText(text: string | null | undefined): number | undefined {
  const m = (text ?? "").trim().toLowerCase().match(/^(\d)\s*(weeks?|wks?|w)\b/);
  if (!m) return undefined;
  const weeks = Number(m[1]);
  return weeks <= MAX_BOND_WEEKS ? weeks : undefined;
}

export function weeksLabel(n: number): string {
  return `${n} week${n === 1 ? "" : "s"}`;
}

/** "1 week's" / "2 weeks'", as in "2 weeks' rent". */
export function weeksOf(n: number): string {
  return n === 1 ? "1 week's" : `${n} weeks'`;
}

export interface RentingAuthority {
  state: string;
  /** Who holds the bond, as a renter would search for it. */
  bondHolder: string;
  /** The state's official renting page. Matches fairTradingUrl in data/rentalLaws.ts. */
  url: string;
}

export const RENTING_AUTHORITIES: Record<string, RentingAuthority> = {
  NSW: { state: "NSW", bondHolder: "NSW Fair Trading (Rental Bonds Online)", url: "https://www.fairtrading.nsw.gov.au/housing-and-property/renting" },
  VIC: { state: "VIC", bondHolder: "the Residential Tenancies Bond Authority", url: "https://www.consumer.vic.gov.au/housing/renting" },
  QLD: { state: "QLD", bondHolder: "the Residential Tenancies Authority", url: "https://www.rta.qld.gov.au" },
  WA: { state: "WA", bondHolder: "the WA Bond Administrator", url: "https://www.commerce.wa.gov.au/consumer-protection/renting-home" },
  SA: { state: "SA", bondHolder: "Consumer and Business Services", url: "https://www.cbs.sa.gov.au/renting" },
  TAS: { state: "TAS", bondHolder: "the Rental Deposit Authority", url: "https://www.cbos.tas.gov.au/topics/housing/renting" },
  ACT: { state: "ACT", bondHolder: "the ACT Office of Rental Bonds", url: "https://www.accesscanberra.act.gov.au/s/article/renting-tab-overview" },
  // No government bond authority: the landlord holds the security deposit
  // under the territory's tenancy law (lib/helpData.ts says the same).
  NT: { state: "NT", bondHolder: "the landlord, under NT tenancy law", url: "https://nt.gov.au/property/renters" },
};

export function rentingAuthorityFor(postcode: string | number | null | undefined): RentingAuthority | null {
  const state = stateForPostcode(postcode ?? undefined);
  return state ? (RENTING_AUTHORITIES[state] ?? null) : null;
}
