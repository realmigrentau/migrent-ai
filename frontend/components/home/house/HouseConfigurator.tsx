import { useId, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/router";
import { AirVent, ArrowRight, Car, KeyRound, MapPin, PawPrint, Receipt, Search, Sofa, Wifi, type LucideIcon } from "lucide-react";
import HouseScene from "./HouseScene";
import { Segmented, Stepper, Switch } from "../../hub/ui/Field";
import { Tabs } from "../../hub/ui/Layout";
import { useAuth } from "../../../hooks/useAuth";
import { useMounted } from "../../../hooks/useMounted";
import { hubAbsoluteUrl, hubFromSite } from "../../../lib/hub/routes";
import {
  BEDROOM_COUNT,
  EXTRA_KEYS,
  EXTRA_LABELS,
  describe,
  encodePrefill,
  initialState,
  selectedCount,
  setBedroomCount,
  setWholePlace,
  switchMode,
  toDraftPrefill,
  toSearchHref,
  toggleBedroom,
  type BathroomChoice,
  type CameraChoice,
  type ExtraKey,
  type HouseMode,
  type HouseState,
  type LaundryChoice,
} from "../../../lib/home/houseConfig";

/**
 * The homepage house and the panel that drives it.
 *
 * The panel is the real control - labelled, keyboard operable and read out
 * by a screen reader - and it is built from Migrent Hub's own switch,
 * segmented control, stepper and tabs, so the first thing a visitor
 * touches is the same object they will use once they sign in. The drawing
 * mirrors it, and a pointer can tap a bedroom in the drawing directly.
 */

type TabKey = "rooms" | "privacy" | "shared" | "extras";

const TABS: { value: TabKey; label: string }[] = [
  { value: "rooms", label: "Rooms" },
  { value: "privacy", label: "Privacy" },
  { value: "shared", label: "Shared" },
  { value: "extras", label: "Extras" },
];

const EXTRA_ICON: Record<ExtraKey, LucideIcon> = {
  parking: Car,
  pets: PawPrint,
  furnished: Sofa,
  bills: Receipt,
  aircon: AirVent,
  internet: Wifi,
};

function Row({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="hc-row">
      <div className="hc-row__text">
        <span className="hc-row__label">{label}</span>
        {hint && <span className="hc-row__hint">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

export default function HouseConfigurator() {
  const router = useRouter();
  const { session: authSession } = useAuth();
  const mounted = useMounted();
  const signedIn = mounted && Boolean(authSession);

  const [state, setState] = useState<HouseState>(() => initialState("looking"));
  const [tab, setTab] = useState<TabKey>("rooms");
  const ids = useId().replace(/:/g, "");
  const whereId = `${ids}-where`;

  const looking = state.mode === "looking";
  const rooms = selectedCount(state);
  const summary = useMemo(() => describe(state), [state]);

  const searchHref = toSearchHref(state);
  const listHref = useMemo(() => {
    const code = encodePrefill(toDraftPrefill(state));
    return signedIn ? hubAbsoluteUrl(`/properties/new?prefill=${code}`) : hubFromSite.listProperty(code);
  }, [state, signedIn]);

  const update = (patch: Partial<HouseState>) => setState((s) => ({ ...s, ...patch }));
  const toggleExtra = (k: ExtraKey) => setState((s) => ({ ...s, extras: { ...s.extras, [k]: !s.extras[k] } }));

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (looking) void router.push(searchHref);
    else window.location.assign(listHref);
  };

  return (
    <div className="hc" data-mode={state.mode}>
      <div className="hc__scene">
        <HouseScene state={state} onToggleBedroom={(i) => setState((s) => toggleBedroom(s, i))} />
        <p className="hc__tip" aria-hidden="true">
          Tap a bedroom to {looking ? "make it yours" : "rent it out"}
        </p>
      </div>

      <form className="hc__panel" onSubmit={onSubmit} aria-label={looking ? "Describe the home you want" : "Describe the home you are renting out"}>
        <Segmented<HouseMode>
          label="I am"
          value={state.mode}
          onChange={(m) => setState((s) => switchMode(s, m))}
          className="hc__mode"
          options={[
            { value: "looking", label: "I'm looking", icon: <Search className="h-4 w-4" strokeWidth={2} aria-hidden /> },
            { value: "hosting", label: "I'm hosting", icon: <KeyRound className="h-4 w-4" strokeWidth={2} aria-hidden /> },
          ]}
        />

        <label htmlFor={whereId} className="hc__where">
          <MapPin className="hc__where-icon" strokeWidth={1.9} aria-hidden="true" />
          <span className="sr-only">{looking ? "Where do you want to live?" : "Where is your home?"}</span>
          <input
            id={whereId}
            type="text"
            inputMode="search"
            autoComplete="address-level2"
            maxLength={80}
            value={state.where}
            onChange={(e) => update({ where: e.target.value })}
            placeholder={looking ? "Suburb, city or postcode" : "Your suburb or postcode"}
          />
        </label>

        <Tabs<TabKey> label="House settings" value={tab} onChange={setTab} tabs={TABS} idBase={ids} className="hc__tabs" />

        <div id={`${ids}-panel`} role="tabpanel" aria-labelledby={`${ids}-tab-${tab}`} className="hc__tabpanel">
          {tab === "rooms" && (
            <>
              <Row
                label={looking ? "Bedrooms you need" : "Bedrooms you rent out"}
                hint={looking ? (rooms > 1 ? "Whole places only" : "Or tap rooms in the house") : `Out of ${BEDROOM_COUNT} in this house`}
              >
                <Stepper
                  label={looking ? "Bedrooms you need" : "Bedrooms you rent out"}
                  value={rooms}
                  min={1}
                  max={BEDROOM_COUNT}
                  onChange={(n) => setState((s) => setBedroomCount(s, n))}
                />
              </Row>
              <Switch
                label={looking ? "Whole place only" : "Let the whole home as one"}
                description={
                  looking
                    ? "No housemates: the kitchen and living room are yours."
                    : "Otherwise each room is its own listing, with shared living areas."
                }
                checked={state.wholePlace}
                onChange={(v) => setState((s) => setWholePlace(s, v))}
              />
            </>
          )}

          {tab === "privacy" && (
            <>
              {looking ? (
                <Switch
                  label="No security cameras"
                  description="Hide homes where the host has declared cameras."
                  checked={state.cameras === "none"}
                  onChange={(v) => update({ cameras: (v ? "none" : "any") as CameraChoice })}
                />
              ) : (
                <Row label="Security cameras" hint="Renters are told before they apply. Never in bedrooms or bathrooms.">
                  <Segmented<CameraChoice>
                    label="Security cameras"
                    size="sm"
                    value={state.cameras}
                    onChange={(c) => update({ cameras: c })}
                    options={[
                      { value: "none", label: "None" },
                      { value: "outside", label: "Outside" },
                      { value: "inside", label: "Inside too" },
                    ]}
                  />
                </Row>
              )}
              <Switch
                label={looking ? "My bedroom door locks" : "Bedroom doors lock"}
                description={looking ? "Only homes where your own door locks." : "Each rented bedroom has a lock."}
                checked={state.lockable}
                onChange={(v) => update({ lockable: v })}
              />
            </>
          )}

          {tab === "shared" && (
            <>
              <Row label="Bathroom">
                {looking ? (
                  <Segmented<BathroomChoice>
                    label="Bathroom"
                    size="sm"
                    value={state.bathroom === "any" ? "any" : "private"}
                    onChange={(b) => update({ bathroom: b })}
                    options={[
                      { value: "any", label: "Any" },
                      { value: "private", label: "Private" },
                    ]}
                  />
                ) : (
                  <Segmented<BathroomChoice>
                    label="Bathroom"
                    size="sm"
                    value={state.bathroom === "any" ? "shared" : state.bathroom}
                    onChange={(b) => update({ bathroom: b })}
                    options={[
                      { value: "shared", label: "Shared" },
                      { value: "private", label: "Private" },
                      { value: "ensuite", label: "Ensuite" },
                    ]}
                  />
                )}
              </Row>
              <Row label="Laundry">
                {looking ? (
                  <Segmented<LaundryChoice>
                    label="Laundry"
                    size="sm"
                    value={state.laundry === "in_unit" ? "in_unit" : "any"}
                    onChange={(l) => update({ laundry: l })}
                    options={[
                      { value: "any", label: "Any" },
                      { value: "in_unit", label: "At home" },
                    ]}
                  />
                ) : (
                  <Segmented<LaundryChoice>
                    label="Laundry"
                    size="sm"
                    value={state.laundry === "any" ? "in_unit" : state.laundry}
                    onChange={(l) => update({ laundry: l })}
                    options={[
                      { value: "in_unit", label: "At home" },
                      { value: "shared", label: "Shared" },
                      { value: "none", label: "None" },
                    ]}
                  />
                )}
              </Row>
              <p className="hc__note">
                {state.wholePlace
                  ? "Kitchen and living room: all yours."
                  : "Kitchen and living room: shared with the others in the home."}
              </p>
            </>
          )}

          {tab === "extras" && (
            <ul className="hc__extras" aria-label={looking ? "Must haves" : "What the home has"}>
              {EXTRA_KEYS.map((k) => {
                const Icon = EXTRA_ICON[k];
                const on = state.extras[k];
                return (
                  <li key={k}>
                    <button type="button" className="hc-chip" aria-pressed={on} onClick={() => toggleExtra(k)}>
                      <Icon className="h-4 w-4" strokeWidth={1.9} aria-hidden="true" />
                      {looking ? EXTRA_LABELS[k].looking : EXTRA_LABELS[k].hosting}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <p className="hc__summary" aria-live="polite">
          {summary}
        </p>

        <button type="submit" className="btn-primary btn-lg btn-block hc__go">
          {looking ? "Show matching rooms" : "Start your listing"}
          <ArrowRight className="btn-arrow h-4 w-4" strokeWidth={2.2} aria-hidden="true" />
        </button>
        <p className="hc__small">
          {looking
            ? "Free for renters. Searching needs no account."
            : "Listing is free. You add photos and rent in Migrent Hub next."}
        </p>
      </form>
    </div>
  );
}
