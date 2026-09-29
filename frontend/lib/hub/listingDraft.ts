/**
 * The listing wizard's draft: what each step collects, and what must be
 * there before it can be sent for review. The required checks mirror
 * draft_problems() in backend/routes_hub_owner.py; the server has the final
 * say and returns the same shape of problem if anything is missing.
 */

export interface DraftData {
  // Property
  street_address?: string;
  suburb?: string;
  state?: string;
  postcode?: string | number;
  property_type?: string;
  relationship?: "owner" | "manager";
  nickname?: string;
  property_bedrooms?: number;
  property_bathrooms?: number;
  parking_spaces?: number;
  // Space
  place_type?: string;
  unit_label?: string | null;
  bedrooms?: number;
  bathrooms?: number;
  bathroom_type?: string;
  beds?: number;
  max_guests?: number;
  parking?: boolean;
  who_else_lives_here?: string;
  total_other_people?: string;
  // Details
  title?: string;
  description?: string;
  highlights?: string[];
  furnished?: boolean;
  bills_included?: boolean;
  internet_included?: boolean;
  internet_speed?: string;
  air_conditioning?: boolean;
  laundry?: string;
  dishwasher?: boolean;
  pets_allowed?: boolean;
  pet_details?: string;
  no_smoking?: boolean;
  quiet_hours?: string;
  nearest_transport?: string;
  neighbourhood_vibe?: string;
  security_cameras?: boolean;
  security_cameras_location?: string;
  lockable_bedroom?: boolean;
  weapons_on_property?: boolean;
  weapons_explanation?: string;
  other_safety_details?: string;
  // Photos
  images?: string[];
  // Rent and dates
  weekly_price?: number;
  bond?: string;
  weekly_discount?: number;
  monthly_discount?: number;
  listing_purpose?: "long_term" | "short_stay";
  available_from?: string;
  available_to?: string;
  lease_months?: number;
  min_stay_weeks?: number;
  max_stay_weeks?: number;
  // Who it suits
  tenant_prefs?: string;
  couples_ok?: boolean;
  gender_preference?: string;
}

export interface Draft {
  id: string;
  property_id: string | null;
  data: DraftData;
  step: number;
  updated_at?: string;
  submitted_at?: string | null;
  listing_id?: string | null;
}

export const WIZARD_STEPS = [
  { key: "property", title: "The property", short: "Property" },
  { key: "space", title: "The space", short: "Space" },
  { key: "details", title: "Description and features", short: "Details" },
  { key: "photos", title: "Photos", short: "Photos" },
  { key: "rent", title: "Rent and dates", short: "Rent" },
  { key: "review", title: "Review and send", short: "Review" },
] as const;

export type StepKey = (typeof WIZARD_STEPS)[number]["key"];

export interface Problem {
  step: string;
  field: string;
  message: string;
}

export function draftProblems(d: DraftData): Problem[] {
  const out: Problem[] = [];
  const need = (ok: boolean, step: StepKey, field: string, message: string) => {
    if (!ok) out.push({ step, field, message });
  };
  need((d.street_address || "").trim().length >= 5, "property", "street_address", "Add the street address");
  need(Boolean((d.suburb || "").trim()), "property", "suburb", "Add the suburb");
  const pc = Number(d.postcode || 0);
  need(pc >= 800 && pc <= 9999, "property", "postcode", "Add a four-digit postcode");
  need(Boolean(d.place_type), "space", "place_type", "Choose whether this is the whole place or a room");
  need(Boolean((d.title || "").trim()), "details", "title", "Give the listing a title");
  need((d.description || "").trim().length >= 10, "details", "description", "Write a description (at least a sentence)");
  if (d.weapons_on_property) need(Boolean((d.weapons_explanation || "").trim()), "details", "weapons_explanation", "Explain the weapons disclosure");
  need((d.images || []).length >= 1, "photos", "images", "Add at least one photo");
  const price = Number(d.weekly_price || 0);
  need(price > 0 && price <= 50000, "rent", "weekly_price", "Set the weekly rent");
  need(Boolean(d.available_from), "rent", "available_from", "Choose when it is available from");
  if (d.available_from && d.available_to) need(d.available_to >= d.available_from, "rent", "available_to", "The end date must be after the start date");
  return out;
}

/** The server names the old step "pricing"/"availability"; the wizard folds them into "rent". */
export function stepOf(problemStep: string): StepKey {
  if (problemStep === "pricing" || problemStep === "availability") return "rent";
  if (problemStep === "preferences") return "details";
  return (WIZARD_STEPS.find((s) => s.key === problemStep)?.key ?? "review") as StepKey;
}

export const STATES = [
  { value: "NSW", label: "New South Wales" },
  { value: "VIC", label: "Victoria" },
  { value: "QLD", label: "Queensland" },
  { value: "WA", label: "Western Australia" },
  { value: "SA", label: "South Australia" },
  { value: "TAS", label: "Tasmania" },
  { value: "ACT", label: "Australian Capital Territory" },
  { value: "NT", label: "Northern Territory" },
];

/** First digit of a postcode to its state (good enough to pre-fill). */
export function stateForPostcode(pc: string | number | undefined): string | undefined {
  const n = Number(pc);
  if (!n) return undefined;
  if ((n >= 200 && n <= 299) || (n >= 2600 && n <= 2618) || (n >= 2900 && n <= 2920)) return "ACT";
  if (n >= 800 && n <= 999) return "NT";
  if (n >= 1000 && n <= 2999) return "NSW";
  if (n >= 3000 && n <= 3999) return "VIC";
  if (n >= 4000 && n <= 4999) return "QLD";
  if (n >= 5000 && n <= 5999) return "SA";
  if (n >= 6000 && n <= 6999) return "WA";
  if (n >= 7000 && n <= 7999) return "TAS";
  return undefined;
}

export const PROPERTY_TYPES = [
  { value: "house", label: "House" },
  { value: "apartment", label: "Apartment" },
  { value: "townhouse", label: "Townhouse" },
  { value: "unit", label: "Unit" },
  { value: "studio", label: "Studio" },
  { value: "granny_flat", label: "Granny flat" },
  { value: "other", label: "Other" },
];

export const PLACE_TYPES = [
  { value: "entire_place", label: "The whole place", description: "Renters have it to themselves." },
  { value: "private_room", label: "A private room", description: "Their own bedroom; living areas are shared." },
  { value: "shared_room", label: "A shared room", description: "They share the bedroom with someone else." },
];

export const BATHROOM_TYPES = [
  { value: "private", label: "Private" },
  { value: "ensuite", label: "Ensuite" },
  { value: "shared", label: "Shared" },
];

export const LAUNDRY = [
  { value: "in_unit", label: "In the home" },
  { value: "shared", label: "Shared" },
  { value: "none", label: "None" },
];

export const GENDER = [
  { value: "any", label: "Anyone" },
  { value: "female", label: "Women only" },
  { value: "male", label: "Men only" },
];

export const HIGHLIGHTS = [
  "Close to the station",
  "Quiet street",
  "Natural light",
  "Walk to shops",
  "Near a university",
  "Garden or balcony",
  "Recently renovated",
  "Built-in wardrobe",
  "Study desk",
  "Air conditioning",
  "Secure building",
  "Bike storage",
];

export const isRoom = (d: DraftData) => d.place_type === "private_room" || d.place_type === "shared_room";
