import type { ReactNode } from "react";
import { AlertCircle, Check, Lock } from "lucide-react";
import AiAssist from "./AiAssist";
import { ChoiceCard, Field, Input, Segmented, Select, Stepper, Switch, Textarea, controlClass } from "../ui/Field";
import SuburbCombobox from "../../forms/SuburbCombobox";
import type { LocationCheck } from "../../../lib/hub/useLocationCheck";
import { MAX_BOND_WEEKS, maxRentInAdvanceWeeks, moveInCost, weeksLabel, weeksOf } from "../../../lib/listingCosts";
import { Panel } from "../ui/Layout";
import { BATHROOM_TYPES, GENDER, HIGHLIGHTS, LAUNDRY, PLACE_TYPES, PROPERTY_TYPES, STATES, isRoom, stateForPostcode, type DraftData } from "../../../lib/hub/listingDraft";
import type { ListingCard } from "../../../lib/hub/types";
import { cn } from "../../../lib/cn";

/** The listing forms, shared by the new-listing wizard and the edit page. */

function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function Group({ title, description, children }: { title: string; description?: ReactNode; children: ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-4 border-t border-[var(--color-line)] pt-6 first:border-0 first:pt-0">
      <legend className="sr-only">{title}</legend>
      <div className="flex flex-col gap-1" aria-hidden>
        <p className="text-[16px] font-semibold text-[color:var(--color-ink)]">{title}</p>
        {description && <p className="text-[13.5px] leading-relaxed text-[color:var(--color-ink-3)]">{description}</p>}
      </div>
      {children}
    </fieldset>
  );
}

/* ── Steps ──────────────────────────────────────────────── */

export interface StepProps {
  d: DraftData;
  set: (patch: Partial<DraftData>) => void;
  err: (field: string) => string | undefined;
}

export function PropertyStep({ d, set, err, linked, location }: StepProps & { linked: boolean; location?: LocationCheck | null }) {
  if (linked) {
    return (
      <div className="flex flex-col gap-5">
        <Panel className="flex items-start gap-3 bg-[var(--color-surface-muted)]">
          <Lock className="mt-0.5 h-5 w-5 shrink-0 text-[color:var(--color-ink-3)]" strokeWidth={1.75} aria-hidden />
          <div>
            <p className="text-[15px] font-semibold text-[color:var(--color-ink)]">{d.nickname || d.street_address}</p>
            <p className="text-[13.5px] text-[color:var(--color-ink-2)]">
              {d.street_address}, {d.suburb} {d.state} {d.postcode}
            </p>
            <p className="mt-2 text-[13px] text-[color:var(--color-ink-3)]">This listing is being added to a property you already have. Change the address from the property's page.</p>
          </div>
        </Panel>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-8">
      <Group title="Your connection to it">
        <div className="grid gap-3 sm:grid-cols-2">
          <ChoiceCard name="relationship" value="owner" selected={(d.relationship ?? "owner") === "owner"} onSelect={() => set({ relationship: "owner" })} title="I own it" description="Or it's where I live and I'm renting out a room." />
          <ChoiceCard name="relationship" value="manager" selected={d.relationship === "manager"} onSelect={() => set({ relationship: "manager" })} title="I manage it" description="On behalf of the owner." />
        </div>
      </Group>
      <Group title="Address" description="Renters see the suburb and an approximate area on the map. The street address is shared once someone books an inspection, or their application is finalised.">
        <Field label="Street address" error={err("street_address")}>
          {({ id, describedBy, invalid }) => <Input id={id} autoComplete="street-address" placeholder="e.g. 12 Example Street" value={d.street_address ?? ""} onChange={(e) => set({ street_address: e.target.value })} aria-describedby={describedBy} aria-invalid={invalid} maxLength={300} />}
        </Field>
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_160px_140px]">
          <Field label="Suburb" error={err("suburb")}>
            {({ id, describedBy, invalid }) => (
              <SuburbCombobox
                id={id}
                value={d.suburb ?? ""}
                onChange={(suburb) => set({ suburb })}
                onSelect={(c) => set({ suburb: c.name, state: c.state, ...(c.postcode ? { postcode: c.postcode } : {}) })}
                stateFilter={d.state || null}
                inputClassName={cn(controlClass, "h-11")}
                aria-describedby={describedBy}
                aria-invalid={invalid}
                maxLength={100}
                placeholder="Start typing, e.g. Parramatta"
              />
            )}
          </Field>
          <Field label="State">
            {({ id }) => (
              <Select id={id} value={d.state ?? ""} onChange={(e) => set({ state: e.target.value || undefined })}>
                <option value="">Choose</option>
                {STATES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.value}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field label="Postcode" error={err("postcode")}>
            {({ id, describedBy, invalid }) => (
              <Input
                id={id}
                inputMode="numeric"
                autoComplete="postal-code"
                maxLength={4}
                value={d.postcode ? String(d.postcode) : ""}
                onChange={(e) => {
                  const pc = e.target.value.replace(/\D/g, "").slice(0, 4);
                  set({ postcode: pc, ...(pc.length === 4 && !d.state ? { state: stateForPostcode(pc) } : {}) });
                }}
                aria-describedby={describedBy}
                aria-invalid={invalid}
              />
            )}
          </Field>
        </div>
        {location?.problem ? (
          <p role="alert" className="flex items-start gap-1.5 text-[13.5px] leading-snug text-[color:var(--color-danger-500)]">
            <AlertCircle className="mt-[2px] h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
            {location.problem}
          </p>
        ) : location?.hint ? (
          <p className="text-[13.5px] leading-snug text-[color:var(--color-ink-3)]" aria-live="polite">
            {location.hint}
          </p>
        ) : null}
      </Group>
      <Group title="Kind of property">
        <div className="flex flex-wrap gap-2">
          {PROPERTY_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              aria-pressed={d.property_type === t.value}
              onClick={() => set({ property_type: t.value })}
              className={cn(
                "h-10 rounded-full border px-4 text-[14px] font-semibold transition-colors",
                d.property_type === t.value ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)] text-[color:var(--color-ink)]" : "border-[var(--color-line-2)] text-[color:var(--color-ink-2)] hover:border-[var(--color-ink-4)]",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <Field label="Nickname" optional hint="Only you see this, e.g. 'Kellyville house'.">
          {({ id, describedBy }) => <Input id={id} value={d.nickname ?? ""} maxLength={80} onChange={(e) => set({ nickname: e.target.value })} aria-describedby={describedBy} />}
        </Field>
      </Group>
      <Group title="The whole property" description="Optional. Helps when you list rooms in it one by one.">
        <div className="grid gap-5 sm:grid-cols-3">
          <Stepper label="Bedrooms" value={d.property_bedrooms ?? 0} min={0} max={30} onChange={(v) => set({ property_bedrooms: v })} />
          <Stepper label="Bathrooms" value={d.property_bathrooms ?? 0} min={0} max={20} onChange={(v) => set({ property_bathrooms: v })} />
          <Stepper label="Car spaces" value={d.parking_spaces ?? 0} min={0} max={20} onChange={(v) => set({ parking_spaces: v })} />
        </div>
      </Group>
    </div>
  );
}

export function SpaceStep({ d, set, err }: StepProps) {
  const room = isRoom(d);
  return (
    <div className="flex flex-col gap-8">
      <Group title="What are you listing?">
        <div className="grid gap-3 sm:grid-cols-3" role="radiogroup" aria-label="What are you listing">
          {PLACE_TYPES.map((p) => (
            <ChoiceCard key={p.value} name="place_type" value={p.value} selected={d.place_type === p.value} onSelect={() => set({ place_type: p.value })} title={p.label} description={p.description} />
          ))}
        </div>
        {err("place_type") && <p className="text-[13px] font-medium text-[color:var(--color-danger-500)]">{err("place_type")}</p>}
      </Group>
      {room && (
        <Group title="Which room?" description="If you're listing several rooms in this property, a label keeps them apart.">
          <Field label="Room label" optional hint="e.g. Room 1, Front bedroom, Granny flat.">
            {({ id, describedBy }) => <Input id={id} value={d.unit_label ?? ""} maxLength={40} onChange={(e) => set({ unit_label: e.target.value })} aria-describedby={describedBy} />}
          </Field>
        </Group>
      )}
      <Group title={room ? "The room" : "Rooms and beds"}>
        <div className="grid gap-5 sm:grid-cols-2">
          {!room && <Stepper label="Bedrooms" value={d.bedrooms ?? 1} min={1} max={10} onChange={(v) => set({ bedrooms: v })} />}
          <Stepper label="Beds" value={d.beds ?? 1} min={1} max={20} onChange={(v) => set({ beds: v })} />
          <Stepper label="Bathrooms" value={d.bathrooms ?? 1} min={1} max={5} onChange={(v) => set({ bathrooms: v })} />
          <Stepper label="Most people who can live here" value={d.max_guests ?? (room ? 1 : 2)} min={1} max={20} onChange={(v) => set({ max_guests: v })} />
        </div>
        {room && (
          <div className="flex flex-col gap-2">
            <p className="text-[14px] font-semibold text-[color:var(--color-ink)]">Bathroom</p>
            <Segmented label="Bathroom" value={d.bathroom_type ?? "shared"} onChange={(v) => set({ bathroom_type: v })} options={BATHROOM_TYPES} className="w-fit" />
          </div>
        )}
        <Switch checked={Boolean(d.parking)} onChange={(v) => set({ parking: v })} label="Parking available" />
      </Group>
      {room && (
        <Group title="Who else lives here" description="Renters want to know who they'd share with.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Who they are" optional hint="e.g. The owner and one other renter, a working couple.">
              {({ id, describedBy }) => <Input id={id} value={d.who_else_lives_here ?? ""} maxLength={200} onChange={(e) => set({ who_else_lives_here: e.target.value })} aria-describedby={describedBy} />}
            </Field>
            <Field label="How many people" optional>
              {({ id }) => (
                <Select id={id} value={d.total_other_people ?? ""} onChange={(e) => set({ total_other_people: e.target.value || undefined })}>
                  <option value="">Choose</option>
                  {["0", "1", "2", "3", "4", "5+"].map((n) => (
                    <option key={n} value={n}>
                      {n === "0" ? "Nobody else" : n}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
          </div>
        </Group>
      )}
    </div>
  );
}

export function DetailsStep({ d, set, err, ai }: StepProps & { ai: boolean }) {
  const hl = d.highlights ?? [];
  const toggleHl = (h: string) => set({ highlights: hl.includes(h) ? hl.filter((x) => x !== h) : [...hl, h].slice(0, 8) });
  const len = (d.description || "").trim().length;
  return (
    <div className="flex flex-col gap-8">
      <Group title="Title and description">
        {ai && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[16px] bg-[var(--color-surface-muted)] px-4 py-3">
            <p className="text-[13.5px] text-[color:var(--color-ink-2)]">Stuck? Get a first draft from the details you've entered, then make it yours.</p>
            <AiAssist data={d} onUse={set} />
          </div>
        )}
        <Field label="Title" hint={`${(d.title || "").length}/80 · Say what it is and what makes it good.`} error={err("title")}>
          {({ id, describedBy, invalid }) => <Input id={id} value={d.title ?? ""} maxLength={80} placeholder="e.g. Bright room near Kellyville station" onChange={(e) => set({ title: e.target.value })} aria-describedby={describedBy} aria-invalid={invalid} />}
        </Field>
        <Field label="Description" hint={len < 10 ? "A few sentences at least." : `${len}/5000`} error={err("description")}>
          {({ id, describedBy, invalid }) => (
            <Textarea id={id} rows={8} value={d.description ?? ""} maxLength={5000} placeholder="The room, the home, the people, the area, and what's nearby." onChange={(e) => set({ description: e.target.value })} aria-describedby={describedBy} aria-invalid={invalid} />
          )}
        </Field>
        <div className="flex flex-col gap-2">
          <p className="text-[14px] font-semibold text-[color:var(--color-ink)]">
            Highlights <span className="font-normal text-[color:var(--color-ink-3)]">(up to 8)</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {HIGHLIGHTS.map((h) => (
              <button
                key={h}
                type="button"
                aria-pressed={hl.includes(h)}
                onClick={() => toggleHl(h)}
                className={cn(
                  "inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-[13.5px] font-medium transition-colors",
                  hl.includes(h) ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)] text-[color:var(--color-ink)]" : "border-[var(--color-line-2)] text-[color:var(--color-ink-2)] hover:border-[var(--color-ink-4)]",
                )}
              >
                {hl.includes(h) && <Check className="h-3.5 w-3.5 text-[color:var(--color-primary)]" strokeWidth={2.5} aria-hidden />}
                {h}
              </button>
            ))}
          </div>
        </div>
      </Group>
      <Group title="What's included">
        <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
          <Switch checked={Boolean(d.furnished)} onChange={(v) => set({ furnished: v })} label="Furnished" />
          <Switch checked={Boolean(d.bills_included)} onChange={(v) => set({ bills_included: v })} label="Bills included" description="Power, water and gas in the rent." />
          <Switch checked={Boolean(d.internet_included)} onChange={(v) => set({ internet_included: v })} label="Internet included" />
          <Switch checked={Boolean(d.air_conditioning)} onChange={(v) => set({ air_conditioning: v })} label="Air conditioning" />
          <Switch checked={Boolean(d.dishwasher)} onChange={(v) => set({ dishwasher: v })} label="Dishwasher" />
          <Switch checked={Boolean(d.pets_allowed)} onChange={(v) => set({ pets_allowed: v })} label="Pets considered" />
        </div>
        {d.internet_included && (
          <Field label="Internet speed" optional hint="e.g. NBN 100.">
            {({ id, describedBy }) => <Input id={id} value={d.internet_speed ?? ""} maxLength={60} onChange={(e) => set({ internet_speed: e.target.value })} aria-describedby={describedBy} />}
          </Field>
        )}
        {d.pets_allowed && (
          <Field label="About pets" optional hint="e.g. Small dogs and cats; no pets in the bedroom carpet.">
            {({ id, describedBy }) => <Input id={id} value={d.pet_details ?? ""} maxLength={200} onChange={(e) => set({ pet_details: e.target.value })} aria-describedby={describedBy} />}
          </Field>
        )}
        <div className="flex flex-col gap-2">
          <p className="text-[14px] font-semibold text-[color:var(--color-ink)]">Laundry</p>
          <Segmented label="Laundry" value={d.laundry ?? ""} onChange={(v) => set({ laundry: v })} options={LAUNDRY} className="w-fit" />
        </div>
      </Group>
      <Group title="The area">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nearest public transport" optional hint="e.g. Kellyville station, 6 minutes' walk.">
            {({ id, describedBy }) => <Input id={id} value={d.nearest_transport ?? ""} maxLength={200} onChange={(e) => set({ nearest_transport: e.target.value })} aria-describedby={describedBy} />}
          </Field>
          <Field label="The neighbourhood" optional hint="Quiet, family street, close to cafes...">
            {({ id, describedBy }) => <Input id={id} value={d.neighbourhood_vibe ?? ""} maxLength={300} onChange={(e) => set({ neighbourhood_vibe: e.target.value })} aria-describedby={describedBy} />}
          </Field>
        </div>
      </Group>
      <Group title="Who it suits" description="Preferences have to be fair: you can't refuse someone because of race, religion, disability, age or similar. Describe the home, not the person you imagine in it.">
        <Field label="Good to know" optional hint="e.g. Suits someone who works days. A quiet household.">
          {({ id, describedBy }) => <Input id={id} value={d.tenant_prefs ?? ""} maxLength={300} onChange={(e) => set({ tenant_prefs: e.target.value })} aria-describedby={describedBy} />}
        </Field>
        <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
          <Switch checked={Boolean(d.no_smoking)} onChange={(v) => set({ no_smoking: v })} label="No smoking" />
          <Switch checked={Boolean(d.couples_ok)} onChange={(v) => set({ couples_ok: v })} label="Couples welcome" />
          <Switch
            checked={Boolean(d.newcomer_friendly)}
            onChange={(v) => set({ newcomer_friendly: v })}
            label="Happy to rent to people new to Australia"
            description="No Australian rental history needed: overseas references, a job offer or study enrolment are fine. Renters can search for this."
          />
        </div>
        <Field label="Quiet hours" optional hint="e.g. 10pm to 7am.">
          {({ id, describedBy }) => <Input id={id} value={d.quiet_hours ?? ""} maxLength={100} onChange={(e) => set({ quiet_hours: e.target.value })} aria-describedby={describedBy} />}
        </Field>
        {isRoom(d) && (
          <div className="flex flex-col gap-2">
            <p className="text-[14px] font-semibold text-[color:var(--color-ink)]">Shared room or home preference</p>
            <p className="text-[13px] text-[color:var(--color-ink-3)]">Allowed for rooms in a shared home. Leave it on Anyone unless it matters for the household.</p>
            <Segmented label="Gender preference" value={d.gender_preference ?? "any"} onChange={(v) => set({ gender_preference: v })} options={GENDER} className="w-fit" />
          </div>
        )}
      </Group>
      <Group title="Safety disclosures" description="Required answers. Renters see them on the listing.">
        <Switch checked={Boolean(d.security_cameras)} onChange={(v) => set({ security_cameras: v })} label="There are security cameras" />
        {d.security_cameras && (
          <Field label="Where are they?" hint="Cameras must never cover bedrooms or bathrooms.">
            {({ id, describedBy }) => <Input id={id} value={d.security_cameras_location ?? ""} maxLength={200} onChange={(e) => set({ security_cameras_location: e.target.value })} aria-describedby={describedBy} />}
          </Field>
        )}
        <Switch
          checked={Boolean(d.lockable_bedroom)}
          onChange={(v) => set({ lockable_bedroom: v })}
          label="Bedroom doors lock"
          description="Each bedroom you rent out has a lock the renter controls. Renters can search for this."
        />
        <Switch checked={Boolean(d.weapons_on_property)} onChange={(v) => set({ weapons_on_property: v })} label="There are firearms or weapons on the property" />
        {d.weapons_on_property && (
          <Field label="Please explain" error={err("weapons_explanation")}>
            {({ id, describedBy, invalid }) => <Input id={id} value={d.weapons_explanation ?? ""} maxLength={300} onChange={(e) => set({ weapons_explanation: e.target.value })} aria-describedby={describedBy} aria-invalid={invalid} />}
          </Field>
        )}
        <Field label="Anything else renters should know" optional>
          {({ id, describedBy }) => <Input id={id} value={d.other_safety_details ?? ""} maxLength={300} onChange={(e) => set({ other_safety_details: e.target.value })} aria-describedby={describedBy} />}
        </Field>
      </Group>
    </div>
  );
}

export function RentStep({ d, set, err }: StepProps) {
  const purpose = d.listing_purpose ?? "long_term";
  const moveIn = moveInCost(d);
  const state = d.state || stateForPostcode(d.postcode);
  const maxAdvance = maxRentInAdvanceWeeks(state);
  return (
    <div className="flex flex-col gap-8">
      <Group title="What kind of stay">
        <div className="grid gap-3 sm:grid-cols-2">
          <ChoiceCard name="purpose" value="long_term" selected={purpose === "long_term"} onSelect={() => set({ listing_purpose: "long_term" })} title="A lease" description="Months or longer. Renters apply; you choose; Migrent checks and finalises." />
          <ChoiceCard name="purpose" value="short_stay" selected={purpose === "short_stay"} onSelect={() => set({ listing_purpose: "short_stay" })} title="A shorter stay" description="Weeks at a time, requested by the stay." />
        </div>
      </Group>
      <Group title="Rent">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Rent a week" error={err("weekly_price")}>
            {({ id, describedBy, invalid }) => (
              <Input id={id} inputMode="numeric" prefix="$" value={d.weekly_price ? String(d.weekly_price) : ""} onChange={(e) => set({ weekly_price: Number(e.target.value.replace(/\D/g, "").slice(0, 5)) || undefined })} aria-describedby={describedBy} aria-invalid={invalid} />
            )}
          </Field>
        </div>
        {purpose === "short_stay" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Discount for 4+ weeks" optional hint="Per cent off.">
              {({ id, describedBy }) => <Input id={id} inputMode="numeric" suffix="%" value={d.weekly_discount != null ? String(d.weekly_discount) : ""} onChange={(e) => set({ weekly_discount: e.target.value ? Math.min(50, Number(e.target.value.replace(/\D/g, ""))) : undefined })} aria-describedby={describedBy} />}
            </Field>
            <Field label="Discount for 3+ months" optional hint="Per cent off.">
              {({ id, describedBy }) => <Input id={id} inputMode="numeric" suffix="%" value={d.monthly_discount != null ? String(d.monthly_discount) : ""} onChange={(e) => set({ monthly_discount: e.target.value ? Math.min(70, Number(e.target.value.replace(/\D/g, ""))) : undefined })} aria-describedby={describedBy} />}
            </Field>
          </div>
        )}
      </Group>
      <Group
        title="Money up front"
        description={`Migrent allows up to ${MAX_BOND_WEEKS} weeks' bond${purpose === "long_term" ? ` and ${weeksOf(maxAdvance)} rent in advance` : ""}${maxAdvance === 1 ? ` (in ${state}, the law allows one rent period in advance)` : ""}. Renters see the total before they apply.`}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Bond" optional={purpose !== "long_term"} error={err("bond_weeks")} hint="Lodged with your state's bond authority (in the NT, held by you under territory law). Never paid to Migrent.">
            {({ id, describedBy, invalid }) => (
              <Select id={id} value={d.bond_weeks != null ? String(d.bond_weeks) : ""} onChange={(e) => set({ bond_weeks: e.target.value === "" ? undefined : Number(e.target.value) })} aria-describedby={describedBy} aria-invalid={invalid}>
                <option value="">Choose</option>
                <option value="0">No bond</option>
                {Array.from({ length: MAX_BOND_WEEKS }, (_, i) => i + 1).map((w) => (
                  <option key={w} value={w}>
                    {weeksLabel(w)}
                    {d.weekly_price ? ` ($${(w * d.weekly_price).toLocaleString("en-AU")})` : ""}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          {purpose === "long_term" && (
            <Field label="Rent in advance" error={err("rent_in_advance_weeks")} hint="Paid before moving in, then counted towards rent.">
              {({ id, describedBy, invalid }) => (
                <Select id={id} value={d.rent_in_advance_weeks != null ? String(d.rent_in_advance_weeks) : ""} onChange={(e) => set({ rent_in_advance_weeks: e.target.value === "" ? undefined : Number(e.target.value) })} aria-describedby={describedBy} aria-invalid={invalid}>
                  <option value="">Choose</option>
                  <option value="0">None</option>
                  {Array.from({ length: maxAdvance }, (_, i) => i + 1).map((w) => (
                    <option key={w} value={w}>
                      {weeksLabel(w)}
                      {d.weekly_price ? ` ($${(w * d.weekly_price).toLocaleString("en-AU")})` : ""}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
          )}
        </div>
        {!d.bills_included && (
          <Field label="Bills estimate a week" optional hint="Power, gas, water and internet for this renter. Shown as your estimate." error={err("bills_estimate_weekly")}>
            {({ id, describedBy, invalid }) => (
              <Input
                id={id}
                inputMode="numeric"
                prefix="$"
                className="sm:max-w-[220px]"
                value={d.bills_estimate_weekly != null ? String(d.bills_estimate_weekly) : ""}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, "").slice(0, 4);
                  set({ bills_estimate_weekly: v ? Math.min(1000, Number(v)) : undefined });
                }}
                aria-describedby={describedBy}
                aria-invalid={invalid}
              />
            )}
          </Field>
        )}
        {moveIn.known && moveIn.total != null && purpose === "long_term" && (
          <p className="rounded-[14px] bg-[var(--color-surface-muted)] px-4 py-3 text-[14px] text-[color:var(--color-ink-2)]" aria-live="polite">
            Renters will see <strong className="text-[color:var(--color-ink)]">${moveIn.total.toLocaleString("en-AU")} to move in</strong>
            {moveIn.total > 0 ? `: ${[moveIn.bondWeeks ? `${weeksOf(moveIn.bondWeeks)} bond` : "", moveIn.advanceWeeks ? `${weeksOf(moveIn.advanceWeeks)} rent in advance` : ""].filter(Boolean).join(" and ")}.` : "."}
          </p>
        )}
      </Group>
      <Group title="Dates" description="The listing comes down after the last date, so it never shows a home that isn't free.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Available from" error={err("available_from")}>
            {({ id, describedBy, invalid }) => <Input id={id} type="date" value={d.available_from ?? ""} onChange={(e) => set({ available_from: e.target.value })} aria-describedby={describedBy} aria-invalid={invalid} />}
          </Field>
          <Field label="Listing open until" optional hint="Leave empty to keep it open (you'll be reminded to renew)." error={err("available_to")}>
            {({ id, describedBy, invalid }) => <Input id={id} type="date" value={d.available_to ?? ""} min={d.available_from || todayIso()} onChange={(e) => set({ available_to: e.target.value || undefined })} aria-describedby={describedBy} aria-invalid={invalid} />}
          </Field>
        </div>
        {purpose === "long_term" ? (
          <Field label="Lease length" optional>
            {({ id }) => (
              <Select id={id} value={d.lease_months ? String(d.lease_months) : ""} onChange={(e) => set({ lease_months: e.target.value ? Number(e.target.value) : undefined })}>
                <option value="">Flexible</option>
                {[3, 6, 9, 12, 18, 24].map((m) => (
                  <option key={m} value={m}>
                    At least {m} months
                  </option>
                ))}
              </Select>
            )}
          </Field>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Shortest stay" optional>
              {({ id }) => (
                <Select id={id} value={d.min_stay_weeks ? String(d.min_stay_weeks) : ""} onChange={(e) => set({ min_stay_weeks: e.target.value ? Number(e.target.value) : undefined })}>
                  <option value="">No minimum</option>
                  {[1, 2, 4, 8, 12].map((w) => (
                    <option key={w} value={w}>
                      {w} week{w === 1 ? "" : "s"}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
            <Field label="Longest stay" optional>
              {({ id }) => (
                <Select id={id} value={d.max_stay_weeks ? String(d.max_stay_weeks) : ""} onChange={(e) => set({ max_stay_weeks: e.target.value ? Number(e.target.value) : undefined })}>
                  <option value="">No maximum</option>
                  {[4, 8, 12, 26, 52].map((w) => (
                    <option key={w} value={w}>
                      {w} weeks
                    </option>
                  ))}
                </Select>
              )}
            </Field>
          </div>
        )}
      </Group>
    </div>
  );
}

export function previewCard(d: DraftData): ListingCard {
  return {
    id: "preview",
    title: d.title || "Your listing",
    suburb: d.suburb || null,
    city: null,
    postcode: d.postcode ? Number(d.postcode) : null,
    state: d.state || null,
    timezone: "Australia/Sydney",
    display_address: [d.suburb, d.postcode].filter(Boolean).join(" ") || "Suburb",
    weekly_price: d.weekly_price ?? null,
    image: d.images?.[0] ?? null,
    images: d.images ?? [],
    property_type: d.property_type || null,
    place_type: d.place_type || null,
    bedrooms: d.bedrooms ?? null,
    bathrooms: d.bathrooms ?? null,
    parking: d.parking ?? null,
    furnished: d.furnished ?? null,
    bills_included: d.bills_included ?? null,
    pets_allowed: d.pets_allowed ?? null,
    available_from: d.available_from ?? null,
    available_to: d.available_to ?? null,
    public_state: "published",
    unit_label: d.unit_label ?? null,
    listing_purpose: d.listing_purpose ?? "long_term",
    nearest_transport: d.nearest_transport ?? null,
  };
}
