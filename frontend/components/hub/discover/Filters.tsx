import { useEffect, useState } from "react";
import { DEFAULT_FILTERS, type SearchFilters } from "../../../lib/search/searchQuery";
import { Button } from "../ui/Button";
import { Field, Input, Segmented, Switch } from "../ui/Field";
import { Sheet } from "../ui/Overlay";

const PLACE_TYPES = [
  { value: "", label: "Any" },
  { value: "entire_place", label: "Whole place" },
  { value: "private_room", label: "Private room" },
  { value: "shared_room", label: "Shared room" },
];

const PROPERTY_TYPES = [
  { value: "", label: "Any type" },
  { value: "house", label: "House" },
  { value: "apartment", label: "Apartment" },
  { value: "townhouse", label: "Townhouse" },
  { value: "granny_flat", label: "Granny flat" },
  { value: "studio", label: "Studio" },
  { value: "student_accommodation", label: "Student accommodation" },
];

/**
 * All filters, grouped so the common ones come first. The panel edits a
 * copy; nothing changes on the page until "Show homes", so a half-set
 * price does not trigger six searches.
 */
export default function FilterSheet({ open, onClose, value, onApply }: { open: boolean; onClose: () => void; value: SearchFilters; onApply: (f: SearchFilters) => void }) {
  const [f, setF] = useState<SearchFilters>(value);
  useEffect(() => {
    if (open) setF(value);
  }, [open, value]);
  const set = <K extends keyof SearchFilters>(k: K, v: SearchFilters[K]) => setF((p) => ({ ...p, [k]: v, page: 1 }));
  const priceError = f.minPrice && f.maxPrice && Number(f.maxPrice) < Number(f.minPrice) ? "The maximum is below the minimum." : null;

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Filters"
      footer={
        <>
          <Button
            variant="ghost"
            onClick={() =>
              setF({
                ...DEFAULT_FILTERS,
                searchType: value.searchType,
                suburb: value.suburb,
                postcode: value.postcode,
                address: value.address,
                lat: value.lat,
                lng: value.lng,
              })
            }
          >
            Clear all
          </Button>
          <Button
            className="flex-1"
            disabled={Boolean(priceError)}
            onClick={() => {
              onApply(f);
              onClose();
            }}
          >
            Show homes
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-8">
        <section className="flex flex-col gap-3">
          <h3 className="text-[15px] font-semibold text-[color:var(--color-ink)]">Weekly rent</h3>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Minimum">
              {({ id }) => <Input id={id} inputMode="numeric" prefix="$" placeholder="0" value={f.minPrice} onChange={(e) => set("minPrice", e.target.value.replace(/\D/g, "").slice(0, 5))} />}
            </Field>
            <Field label="Maximum" error={priceError}>
              {({ id, describedBy, invalid }) => <Input id={id} inputMode="numeric" prefix="$" placeholder="Any" value={f.maxPrice} onChange={(e) => set("maxPrice", e.target.value.replace(/\D/g, "").slice(0, 5))} aria-invalid={invalid} aria-describedby={describedBy} />}
            </Field>
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h3 className="text-[15px] font-semibold text-[color:var(--color-ink)]">What kind of place</h3>
          <Segmented label="Place type" value={f.placeType} onChange={(v) => set("placeType", v)} options={PLACE_TYPES} className="w-full flex-wrap" />
          <div className="flex flex-wrap gap-2 pt-1">
            {PROPERTY_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                aria-pressed={f.propertyType === t.value}
                onClick={() => set("propertyType", t.value)}
                className={`hub-press h-9 rounded-full border px-3.5 text-[13.5px] font-semibold transition-colors ${
                  f.propertyType === t.value ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)] text-[color:var(--color-ink)]" : "border-[var(--color-line-2)] text-[color:var(--color-ink-2)] hover:border-[var(--color-ink-4)]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h3 className="text-[15px] font-semibold text-[color:var(--color-ink)]">Moving in</h3>
          <Field label="Available by" hint="Homes free on or before this date.">
            {({ id, describedBy }) => <Input id={id} type="date" value={f.checkIn} onChange={(e) => set("checkIn", e.target.value)} aria-describedby={describedBy} />}
          </Field>
        </section>

        <section className="flex flex-col gap-1">
          <h3 className="mb-1 text-[15px] font-semibold text-[color:var(--color-ink)]">Features</h3>
          <Switch checked={f.furnished} onChange={(v) => set("furnished", v)} label="Furnished" />
          <Switch checked={f.billsIncluded} onChange={(v) => set("billsIncluded", v)} label="Bills included" />
          <Switch checked={f.petsAllowed} onChange={(v) => set("petsAllowed", v)} label="Pets considered" />
          <Switch checked={f.parking} onChange={(v) => set("parking", v)} label="Parking" />
          <Switch checked={f.airCon} onChange={(v) => set("airCon", v)} label="Air conditioning" />
          <Switch checked={f.couplesOk} onChange={(v) => set("couplesOk", v)} label="Couples welcome" />
          <Switch checked={f.nearStation} onChange={(v) => set("nearStation", v)} label="Near a station" />
        </section>

        <section className="flex flex-col gap-1">
          <h3 className="mb-1 text-[15px] font-semibold text-[color:var(--color-ink)]">Trust</h3>
          <Switch checked={f.verifiedOwner} onChange={(v) => set("verifiedOwner", v)} label="ID-checked owners only" description="Owners whose government ID Migrent has checked. It is a document check, not a guarantee." />
        </section>
      </div>
    </Sheet>
  );
}
