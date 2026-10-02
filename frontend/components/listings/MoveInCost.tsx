import { ExternalLink, Wallet } from "lucide-react";
import { siteUrl } from "../../lib/hub/routes";
import { MAX_BOND_WEEKS, type CostFields, isShortStay, maxRentInAdvanceWeeks, moveInCost, rentingAuthorityFor, weeksLabel, weeksOf } from "../../lib/listingCosts";

const aud = (n: number) => `$${n.toLocaleString("en-AU")}`;

/**
 * "How much do I need on day one?" - the number a new arrival most needs
 * (MIGRENT_MASTER_AUDIT MIG-017). Bond plus rent in advance, the bills
 * position, and where the bond goes. Used on the public listing page and on
 * the Hub's view of a home, so both say the same thing.
 */
export default function MoveInCost({
  listing,
  headingClassName = "text-[17px] font-semibold text-[var(--color-ink)]",
}: {
  listing: CostFields & { postcode?: string | number | null };
  headingClassName?: string;
}) {
  const cost = moveInCost(listing);
  const stay = isShortStay(listing);
  const authority = rentingAuthorityFor(listing.postcode);
  const weekly = Number(listing.weekly_price) || 0;
  const row = "flex items-baseline justify-between gap-4 py-2 text-[14px]";

  return (
    <section aria-labelledby="move-in-heading" className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-5" data-testid="move-in-cost">
      <h2 id="move-in-heading" className={`flex items-center gap-2 ${headingClassName}`}>
        <Wallet className="h-[18px] w-[18px] text-[color:var(--color-primary)]" strokeWidth={1.9} aria-hidden="true" />
        {stay ? "Before your stay" : "Before you move in"}
      </h2>

      {cost.known && !stay ? (
        <>
          <p className="mt-3 text-[28px] font-semibold leading-none tracking-[-0.02em] text-[var(--color-ink)] tabular-nums">
            {aud(cost.total ?? 0)}
            <span className="ml-1.5 text-[14px] font-normal tracking-normal text-[var(--color-ink-3)]">to move in</span>
          </p>
          <dl className="mt-3 divide-y divide-[var(--color-line)]">
            <div className={row}>
              <dt className="text-[var(--color-ink-2)]">{cost.bondWeeks ? `Bond (${weeksLabel(cost.bondWeeks)})` : "Bond"}</dt>
              <dd className="m-0 font-medium tabular-nums text-[var(--color-ink)]">{cost.bondWeeks ? aud(cost.bond ?? 0) : "None"}</dd>
            </div>
            <div className={row}>
              <dt className="text-[var(--color-ink-2)]">{cost.advanceWeeks ? `Rent in advance (${weeksLabel(cost.advanceWeeks)})` : "Rent in advance"}</dt>
              <dd className="m-0 font-medium tabular-nums text-[var(--color-ink)]">{cost.advanceWeeks ? aud(cost.advance ?? 0) : "None"}</dd>
            </div>
            <div className={row}>
              <dt className="text-[var(--color-ink-2)]">Then rent</dt>
              <dd className="m-0 font-medium tabular-nums text-[var(--color-ink)]">{aud(weekly)} a week</dd>
            </div>
          </dl>
        </>
      ) : stay ? (
        <dl className="mt-3 divide-y divide-[var(--color-line)]">
          <div className={row}>
            <dt className="text-[var(--color-ink-2)]">{cost.bondWeeks ? `Bond (${weeksLabel(cost.bondWeeks)})` : "Bond"}</dt>
            <dd className="m-0 font-medium tabular-nums text-[var(--color-ink)]">{cost.bondWeeks ? aud(cost.bond ?? 0) : cost.bondWeeks === 0 ? "None" : "Ask the host"}</dd>
          </div>
          <div className={row}>
            <dt className="text-[var(--color-ink-2)]">Rent</dt>
            <dd className="m-0 font-medium tabular-nums text-[var(--color-ink)]">{aud(weekly)} a week, paid as agreed with the host</dd>
          </div>
        </dl>
      ) : (
        <p className="mt-3 text-[14px] leading-relaxed text-[var(--color-ink-2)]">
          {listing.bond ? <>The host lists the bond as &ldquo;{listing.bond}&rdquo;. </> : null}
          Ask the host how much bond and rent in advance they need before you apply.
        </p>
      )}

      <p className="mt-3 text-[13.5px] leading-relaxed text-[var(--color-ink-2)]">
        {listing.bills_included
          ? "Bills are included in the rent."
          : listing.bills_estimate_weekly
            ? `Bills are extra: about ${aud(listing.bills_estimate_weekly)} a week (the host's estimate).`
            : "Bills are extra. Ask the host what to budget."}
      </p>

      <div className="mt-3 border-t border-[var(--color-line)] pt-3 text-[12.5px] leading-relaxed text-[var(--color-ink-3)]">
        {authority?.state === "NT" ? (
          <p className="m-0">In the Northern Territory the landlord holds the security deposit under territory law. Never pay it before you have inspected and signed an agreement.</p>
        ) : (
          <p className="m-0">
            Your bond is lodged with {authority ? authority.bondHolder : "your state's bond authority"}, never paid into a host&apos;s bank account or to Migrent.
          </p>
        )}
        <p className="m-0 mt-1.5">
          Hosts on Migrent can ask for up to {MAX_BOND_WEEKS} weeks&apos; bond and {weeksOf(maxRentInAdvanceWeeks(authority?.state))} rent in advance. If you are asked for more,{" "}
          {/* A plain link: this card also sits in the Hub, which may run on its own host. */}
          <a href={siteUrl("/contact?topic=SAFETY&subject=Asked%20for%20more%20than%20the%20bond%20limit")} className="underline underline-offset-2">
            tell us
          </a>
          .
        </p>
        {authority && (
          <a href={authority.url} target="_blank" rel="noopener noreferrer" className="mt-1.5 inline-flex items-center gap-1 font-semibold text-[var(--color-primary)] underline-offset-2 hover:underline">
            Renting rules in {authority.state}
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        )}
      </div>
    </section>
  );
}
