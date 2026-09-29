import { useId, useState } from "react";
import Link from "next/link";
import { Stepper } from "../hub/ui/Field";
import { siteIdentity } from "../../lib/siteIdentity";

/**
 * What your room could earn, from numbers you put in.
 *
 * It replaces the old "ROI calculator", which estimated yields from suburb
 * rents and property values with no source. This one never guesses: the
 * owner enters their own rent, and the only figures Migrent adds are its
 * own fees, read from lib/siteIdentity.ts so they cannot drift.
 */

const aud = (n: number) => n.toLocaleString("en-AU", { style: "currency", currency: "AUD", maximumFractionDigits: 0 });

export default function EarningsEstimate() {
  const [rent, setRent] = useState(320);
  const [rooms, setRooms] = useState(1);
  const [weeks, setWeeks] = useState(48);
  const ids = useId().replace(/:/g, "");
  const fee = siteIdentity.fees.host.listingFee;

  const safeRent = Number.isFinite(rent) ? Math.max(0, Math.min(rent, 5000)) : 0;
  const yearly = safeRent * rooms * weeks;

  return (
    <div className="site-card grid gap-8 p-[clamp(20px,3vw,36px)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-12">
      <div className="flex flex-col gap-6">
        <div>
          <label htmlFor={`${ids}-rent`} className="field-label">
            Weekly rent per room
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[15px] font-semibold text-[color:var(--color-ink-3)]" aria-hidden="true">
              $
            </span>
            <input
              id={`${ids}-rent`}
              type="number"
              inputMode="numeric"
              min={0}
              max={5000}
              step={10}
              value={Number.isFinite(rent) ? rent : ""}
              onChange={(e) => setRent(e.target.value === "" ? Number.NaN : Number(e.target.value))}
              className="input-field pl-8 tabular-nums"
              aria-describedby={`${ids}-rent-hint`}
            />
          </div>
          <p id={`${ids}-rent-hint`} className="field-hint">
            Not sure? <Link href="/suburbs" className="underline underline-offset-2">Suburb guides</Link> show the Census median rent for each suburb (whole homes, 2021).
          </p>
        </div>

        <div className="flex items-center justify-between gap-4">
          <span className="field-label !mb-0">Rooms you rent out</span>
          <Stepper label="Rooms you rent out" value={rooms} min={1} max={8} onChange={setRooms} />
        </div>

        <div>
          <div className="flex items-baseline justify-between">
            <label htmlFor={`${ids}-weeks`} className="field-label">
              Weeks rented a year
            </label>
            <span className="text-[15px] font-semibold tabular-nums text-[color:var(--color-ink)]">{weeks}</span>
          </div>
          <input
            id={`${ids}-weeks`}
            type="range"
            min={1}
            max={52}
            value={weeks}
            onChange={(e) => setWeeks(Number(e.target.value))}
            className="premium-range w-full"
          />
        </div>
      </div>

      <div className="site-card--muted flex flex-col justify-between gap-6 rounded-[18px] p-6">
        <div>
          <p className="site-meta m-0">Rent over a year</p>
          <p className="m-0 mt-1 font-[family-name:var(--font-display)] text-[clamp(2.4rem,5vw,3.4rem)] font-bold leading-none tracking-[-0.03em] text-[color:var(--color-ink)] tabular-nums" aria-live="polite">
            {aud(yearly)}
          </p>
          <p className="site-meta mt-2">
            {aud(safeRent)} a week × {rooms} {rooms === 1 ? "room" : "rooms"} × {weeks} weeks. Before tax and your own costs.
          </p>
        </div>
        <dl className="site-rows m-0">
          <div className="flex items-baseline justify-between gap-4 py-3">
            <dt className="site-body">Commission on rent</dt>
            <dd className="m-0 text-[15px] font-bold text-[color:var(--color-ink)]">None</dd>
          </div>
          <div className="flex items-baseline justify-between gap-4 py-3">
            <dt className="site-body">Long-term tenancy fee</dt>
            <dd className="m-0 text-[15px] font-bold text-[color:var(--color-ink)]">$0</dd>
          </div>
          <div className="flex items-baseline justify-between gap-4 py-3">
            <dt className="site-body">Stay bookings</dt>
            <dd className="m-0 text-right text-[15px] font-bold text-[color:var(--color-ink)]">{aud(fee)} once per property</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
