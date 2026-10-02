import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import { Save } from "lucide-react";
import HubShell from "../../../../components/hub/HubShell";
import { useHubNavigate } from "../../../../components/hub/HubLink";
import PhotosStep from "../../../../components/hub/wizard/PhotosStep";
import { DetailsStep, Group, RentStep, SpaceStep } from "../../../../components/hub/wizard/Steps";
import { Button } from "../../../../components/hub/ui/Button";
import { CardSkeleton, EmptyState, ErrorState, InlineAlert } from "../../../../components/hub/ui/Feedback";
import { Field, Input, controlClass } from "../../../../components/hub/ui/Field";
import SuburbCombobox from "../../../../components/forms/SuburbCombobox";
import { PageHeader, Tabs } from "../../../../components/hub/ui/Layout";
import { useConfirm } from "../../../../components/ui/ConfirmDialog";
import { useToast } from "../../../../components/ui/Toast";
import { hubApi, HubError } from "../../../../lib/hub/api";
import { draftProblems, stepOf, type DraftData, type Problem } from "../../../../lib/hub/listingDraft";
import { invalidate, useHubQuery } from "../../../../lib/hub/query";
import { useHub } from "../../../../lib/hub/session";
import type { OwnerListing } from "../../../../lib/hub/types";
import { bondWeeksFromText } from "../../../../lib/listingCosts";
import { useLocationCheck } from "../../../../lib/hub/useLocationCheck";
import { cn } from "../../../../lib/cn";

type Section = "details" | "space" | "photos" | "rent" | "address";

const CANONICAL_PLACE: Record<string, string> = { "entire place": "entire_place", entire: "entire_place", entire_home: "entire_place", "private room": "private_room", private: "private_room", "shared room": "shared_room", shared: "shared_room" };
const CANONICAL_LAUNDRY: Record<string, string> = { "in-unit": "in_unit", "in unit": "in_unit", shared: "shared", none: "none" };
const CANONICAL_GENDER: Record<string, string> = { any: "any", "female only": "female", female: "female", "male only": "male", male: "male" };

function toDraft(l: OwnerListing): DraftData {
  const norm = (v: string | null | undefined, map: Record<string, string>) => (v ? map[v.trim().toLowerCase()] ?? v : undefined);
  const nn = <T,>(v: T | null | undefined) => (v === null ? undefined : v);
  return {
    street_address: nn(l.street_address),
    suburb: nn(l.suburb),
    postcode: l.postcode ?? undefined,
    property_type: l.property_type ? l.property_type.trim().toLowerCase().replace(/\s+/g, "_") : undefined,
    place_type: norm(l.place_type, CANONICAL_PLACE),
    unit_label: l.unit_label,
    bedrooms: nn(l.bedrooms),
    bathrooms: nn(l.bathrooms),
    bathroom_type: l.bathroom_type ? l.bathroom_type.toLowerCase() : undefined,
    beds: nn(l.beds),
    max_guests: nn(l.max_guests),
    parking: nn(l.parking),
    who_else_lives_here: nn(l.who_else_lives_here),
    total_other_people: nn(l.total_other_people),
    title: nn(l.title),
    description: nn(l.description),
    highlights: l.highlights ?? [],
    furnished: nn(l.furnished),
    bills_included: nn(l.bills_included),
    internet_included: nn(l.internet_included),
    internet_speed: nn(l.internet_speed),
    air_conditioning: nn(l.air_conditioning),
    laundry: norm(l.laundry, CANONICAL_LAUNDRY),
    dishwasher: nn(l.dishwasher),
    pets_allowed: nn(l.pets_allowed),
    pet_details: nn(l.pet_details),
    no_smoking: nn(l.no_smoking),
    quiet_hours: nn(l.quiet_hours),
    nearest_transport: nn(l.nearest_transport),
    neighbourhood_vibe: nn(l.neighbourhood_vibe),
    security_cameras: nn(l.security_cameras),
    security_cameras_location: nn(l.security_cameras_location),
    weapons_on_property: nn(l.weapons_on_property),
    weapons_explanation: nn(l.weapons_explanation),
    other_safety_details: nn(l.other_safety_details),
    images: l.images ?? [],
    weekly_price: nn(l.weekly_price),
    // Listings from before bond was set in weeks carry it as text.
    bond_weeks: l.bond_weeks ?? bondWeeksFromText(l.bond) ?? undefined,
    rent_in_advance_weeks: nn(l.rent_in_advance_weeks),
    bills_estimate_weekly: nn(l.bills_estimate_weekly),
    newcomer_friendly: nn(l.newcomer_friendly),
    weekly_discount: nn(l.weekly_discount),
    monthly_discount: nn(l.monthly_discount),
    listing_purpose: l.listing_purpose === "short_stay" ? "short_stay" : "long_term",
    available_from: nn(l.available_from),
    available_to: nn(l.available_to),
    lease_months: l.listing_purpose !== "short_stay" && l.min_stay_weeks ? Math.round(l.min_stay_weeks / 4.345) || undefined : undefined,
    min_stay_weeks: nn(l.min_stay_weeks),
    max_stay_weeks: nn(l.max_stay_weeks),
    tenant_prefs: nn(l.tenant_prefs),
    couples_ok: nn(l.couples_ok),
    gender_preference: norm(l.gender_preference, CANONICAL_GENDER),
  };
}

// Fields PATCH /listings/{id} accepts, by draft key.
const LISTING_FIELDS: Record<string, string> = {
  street_address: "address", suburb: "suburb", postcode: "postcode", property_type: "property_type", place_type: "place_type",
  bedrooms: "bedrooms", beds: "beds", bathrooms: "bathrooms", bathroom_type: "bathroom_type", max_guests: "max_guests", parking: "parking",
  who_else_lives_here: "who_else_lives_here", total_other_people: "total_other_people", title: "title", description: "description",
  highlights: "highlights", furnished: "furnished", bills_included: "bills_included", internet_included: "internet_included",
  internet_speed: "internet_speed", air_conditioning: "air_conditioning", laundry: "laundry", dishwasher: "dishwasher",
  pets_allowed: "pets_allowed", pet_details: "pet_details", no_smoking: "no_smoking", quiet_hours: "quiet_hours",
  nearest_transport: "nearest_transport", neighbourhood_vibe: "neighbourhood_vibe", security_cameras: "security_cameras",
  security_cameras_location: "security_cameras_location", weapons_on_property: "weapons_on_property", weapons_explanation: "weapons_explanation",
  other_safety_details: "other_safety_details", images: "images", weekly_price: "weekly_price", bond_weeks: "bond_weeks",
  rent_in_advance_weeks: "rent_in_advance_weeks", bills_estimate_weekly: "bills_estimate_weekly", newcomer_friendly: "newcomer_friendly",
  weekly_discount: "weekly_discount", monthly_discount: "monthly_discount", available_from: "available_from", available_to: "available_to",
  tenant_prefs: "tenant_prefs", couples_ok: "couples_ok", gender_preference: "gender_preference",
};

const same = (a: unknown, b: unknown) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

// Changes that send a live listing back to Migrent for review. Mirrors
// material_changes() in backend/routes_listings.py; the server decides, this
// only warns first.
const REVIEW_COLUMNS = ["title", "description", "images", "address", "suburb", "postcode", "bond_weeks", "rent_in_advance_weeks"];
const PRICE_REVIEW_RATIO = 0.15;

function needsReview(patch: Record<string, unknown>, before: Record<string, unknown>): boolean {
  if (REVIEW_COLUMNS.some((c) => c in patch)) return true;
  if (!("weekly_price" in patch)) return false;
  const was = Number(before.weekly_price) || 0;
  const now = Number(patch.weekly_price) || 0;
  return was <= 0 || Math.abs(now - was) / was > PRICE_REVIEW_RATIO;
}

export default function EditListingPage() {
  const router = useRouter();
  const navigate = useHubNavigate();
  const toast = useToast();
  const confirm = useConfirm();
  const { me } = useHub();
  const id = typeof router.query.id === "string" ? router.query.id : null;
  const { data, error, refetch } = useHubQuery<{ listing: OwnerListing }>(id ? `/hub/listings/${id}` : null);
  const [original, setOriginal] = useState<DraftData | null>(null);
  const [d, setD] = useState<DraftData>({});
  const [section, setSection] = useState<Section>("details");
  const [saving, setSaving] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [serverProblems, setServerProblems] = useState<Problem[] | null>(null);
  const loadedFor = useRef<string | null>(null);

  useEffect(() => {
    if (data && loadedFor.current !== data.listing.id) {
      loadedFor.current = data.listing.id;
      const draft = toDraft(data.listing);
      setOriginal(draft);
      setD(draft);
    }
  }, [data]);

  const changed = useMemo(() => (original ? Object.keys({ ...original, ...d }).filter((k) => !same(original[k as keyof DraftData], d[k as keyof DraftData])) : []), [original, d]);
  const dirty = changed.length > 0;

  useEffect(() => {
    const onUnload = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener("beforeunload", onUnload);
    return () => window.removeEventListener("beforeunload", onUnload);
  }, [dirty]);

  // Only an address the host is changing is checked as they type.
  const addressChanged = Boolean(original) && (!same(original?.suburb, d.suburb) || !same(original?.postcode, d.postcode));
  const location = useLocationCheck(addressChanged ? d.suburb : null, d.postcode, null);
  const localProblems = (data: DraftData) => [...draftProblems(data), ...(location?.problem ? [{ step: "property", field: "location", message: location.problem }] : [])];
  const problems = serverProblems ?? localProblems(d);
  const err = (field: string) => (showErrors ? problems.find((p) => p.field === field)?.message : undefined);
  const set = (patch: Partial<DraftData>) => {
    setServerProblems(null);
    setD((prev) => ({ ...prev, ...patch }));
  };

  async function save() {
    if (!data || !original) return;
    setShowErrors(true);
    const local = localProblems(d);
    if (local.length) {
      const first = stepOf(local[0].step);
      setSection(first === "property" ? "address" : (first as Section));
      return toast.warning(local[0].message);
    }
    setSaving(true);
    try {
      const listingPatch: Record<string, unknown> = {};
      for (const k of changed) {
        const col = LISTING_FIELDS[k];
        if (!col) continue;
        let v = d[k as keyof DraftData] as unknown;
        if (k === "postcode") v = v ? Number(v) : undefined;
        if (v === "" || v === undefined) v = null;
        listingPatch[col] = v;
      }
      const unitPatch: Record<string, unknown> = {};
      if (changed.includes("unit_label")) unitPatch.unit_label = (d.unit_label || "").trim() || null;
      if (changed.includes("listing_purpose")) unitPatch.listing_purpose = d.listing_purpose;
      if (d.listing_purpose === "short_stay") {
        if (changed.includes("min_stay_weeks") && d.min_stay_weeks) unitPatch.min_stay_weeks = d.min_stay_weeks;
        if (changed.includes("max_stay_weeks") && d.max_stay_weeks) unitPatch.max_stay_weeks = d.max_stay_weeks;
      } else if (changed.includes("lease_months") && d.lease_months) {
        unitPatch.min_stay_weeks = Math.round(d.lease_months * 4.345);
      }
      const wasLive = data.listing.moderation_status === "approved";
      if (wasLive && needsReview(listingPatch, { weekly_price: original.weekly_price })) {
        const ok = await confirm({
          title: "Send these changes for review?",
          description:
            "Changes to the photos, title, description, address, bond, rent in advance or a big change in rent are checked by Migrent before renters see them. The listing goes offline until it is approved again, and we email you when it is.",
          confirmLabel: "Save and send for review",
        });
        if (!ok) return;
      }
      let updated: { moderation_status?: string } | null = null;
      if (Object.keys(listingPatch).length) updated = await hubApi.patch<{ moderation_status?: string }>(`/listings/${data.listing.id}`, listingPatch);
      if (Object.keys(unitPatch).length) await hubApi.patch(`/hub/listings/${data.listing.id}/unit`, unitPatch);
      setOriginal(d);
      invalidate(`/hub/listings/${data.listing.id}`);
      invalidate("/hub/properties");
      if (wasLive && updated?.moderation_status === "pending_approval") toast.info("Changes saved and sent to Migrent for review. The listing is offline until it is approved.");
      else toast.success("Changes saved");
      void navigate(`/listings/${data.listing.id}`);
    } catch (e) {
      if (e instanceof HubError && e.problems.length) setServerProblems(e.problems.map((p) => ({ step: String(p.step ?? "details"), field: String(p.field ?? ""), message: p.message })));
      toast.error(e instanceof HubError ? e.message : "Your changes didn't save.");
    } finally {
      setSaving(false);
    }
  }

  async function leave() {
    if (dirty && !(await confirm({ title: "Leave without saving?", description: "Your changes to this listing will be lost.", confirmLabel: "Leave", tone: "danger" }))) return;
    setOriginal(d);
    void navigate(`/listings/${id}`);
  }

  if (error) {
    return (
      <HubShell title="Edit listing">
        <PageHeader title="Edit listing" back={{ to: "/properties", label: "Properties" }} />
        {error.status === 404 ? <EmptyState title="Listing not found" /> : <ErrorState message={error.message} offline={error.offline} onRetry={() => void refetch()} />}
      </HubShell>
    );
  }
  if (!data || !original) {
    return (
      <HubShell title="Edit listing">
        <CardSkeleton />
      </HubShell>
    );
  }

  const l = data.listing;
  const live = l.moderation_status === "approved";
  const stepProps = { d, set, err };

  return (
    <HubShell title={`Edit ${l.title ?? "listing"}`}>
      <PageHeader
        title="Edit listing"
        eyebrow={l.unit_label || undefined}
        back={{ to: `/listings/${l.id}`, label: l.title || "Listing" }}
        actions={
          <>
            <Button variant="ghost" onClick={() => void leave()}>
              Cancel
            </Button>
            <Button loading={saving} disabled={!dirty} icon={<Save className="h-4 w-4" strokeWidth={1.75} />} onClick={() => void save()}>
              Save changes
            </Button>
          </>
        }
      />
      {live && <InlineAlert className="mb-6">This listing is live. Dates, features and small rent changes show straight away. New photos, a new title, description, address, bond or rent in advance, or a big change in rent go to Migrent for review first, and the listing is offline until they are approved.</InlineAlert>}
      <Tabs
        label="Sections"
        value={section}
        onChange={setSection}
        tabs={[
          { value: "details", label: "Description" },
          { value: "space", label: "Space" },
          { value: "photos", label: "Photos", count: (d.images ?? []).length || undefined },
          { value: "rent", label: "Rent and dates" },
          { value: "address", label: "Address" },
        ]}
        className="mb-6"
      />
      <div className="rounded-[22px] border border-[var(--color-line)] bg-[var(--color-surface)] p-5 sm:p-7">
        {section === "details" && <DetailsStep {...stepProps} ai={Boolean(me?.features.ai_listing_assist)} />}
        {section === "space" && <SpaceStep {...stepProps} />}
        {section === "photos" && (
          <>
            <PhotosStep images={d.images ?? []} onChange={(images) => set({ images })} />
            {err("images") && <p className="mt-4 text-[13px] font-medium text-[color:var(--color-danger-500)]">{err("images")}</p>}
          </>
        )}
        {section === "rent" && <RentStep {...stepProps} />}
        {section === "address" && (
          <Group title="Address" description="Changing the address re-checks where the listing appears on the map. Renters only see the suburb until they book an inspection.">
            <Field label="Street address" error={err("street_address")}>
              {({ id: fid, describedBy, invalid }) => <Input id={fid} value={d.street_address ?? ""} maxLength={300} onChange={(e) => set({ street_address: e.target.value })} aria-describedby={describedBy} aria-invalid={invalid} />}
            </Field>
            <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_160px]">
              <Field label="Suburb" error={err("suburb")}>
                {({ id: fid, describedBy, invalid }) => (
                  <SuburbCombobox
                    id={fid}
                    value={d.suburb ?? ""}
                    maxLength={100}
                    onChange={(suburb) => set({ suburb })}
                    onSelect={(c) => set({ suburb: c.name, ...(c.postcode ? { postcode: c.postcode } : {}) })}
                    inputClassName={cn(controlClass, "h-11")}
                    aria-describedby={describedBy}
                    aria-invalid={invalid}
                  />
                )}
              </Field>
              <Field label="Postcode" error={err("postcode")}>
                {({ id: fid, describedBy, invalid }) => <Input id={fid} inputMode="numeric" maxLength={4} value={d.postcode ? String(d.postcode) : ""} onChange={(e) => set({ postcode: e.target.value.replace(/\D/g, "").slice(0, 4) })} aria-describedby={describedBy} aria-invalid={invalid} />}
              </Field>
            </div>
            {location?.problem ? (
              <p role="alert" className="text-[13.5px] leading-snug text-[color:var(--color-danger-500)]">
                {location.problem}
              </p>
            ) : location?.hint ? (
              <p className="text-[13.5px] leading-snug text-[color:var(--color-ink-3)]">{location.hint}</p>
            ) : null}
          </Group>
        )}
      </div>
      <div className="hub-sticky-bar mt-6 flex justify-end lg:hidden">
        <Button loading={saving} disabled={!dirty} icon={<Save className="h-4 w-4" strokeWidth={1.75} />} onClick={() => void save()} className="shadow-[var(--shadow-pop)]">
          Save changes
        </Button>
      </div>
    </HubShell>
  );
}
