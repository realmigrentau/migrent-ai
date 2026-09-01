import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PhotoUploadZone from "./upload/PhotoUploadZone";
import { UploadablePhoto } from "../hooks/usePhotoUpload";
import AddressGeocoder from "./forms/AddressGeocoder";

interface ListingFormProps {
  onSubmit: (data: ListingFormData) => void;
  loading?: boolean;
  initialData?: Partial<ListingFormData>;
  userId?: string;
}

export interface ListingFormData {
  // Basics
  /**
   * Full street address, e.g. "12 Smith St, Carlton VIC 3053".
   *
   * Captured from the geocoder, which always returned it; the form used to
   * throw it away and store only "Suburb, Postcode" as the listing address.
   * That meant two rooms in the same suburb were indistinguishable to their
   * own owner, address search matched nothing, and the schema.org name on the
   * listing page read "Carlton, 3053".
   *
   * It is never shown publicly. The API replaces it with the suburb for
   * anyone who is not the owner or an admin.
   */
  streetAddress: string;
  suburb: string;
  postcode: string;
  propertyType: string;
  placeType: string;
  weeklyPrice: number;
  bond: string;
  // Basics – capacity
  maxGuests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  bathroomType: "private" | "shared";
  // Who else
  whoElseLivesHere: string;
  totalOtherPeople: string;
  // Details
  furnished: boolean;
  billsIncluded: boolean;
  parking: boolean;
  // Title & description
  title: string;
  description: string;
  // Highlights
  highlights: string[];
  // Discounts
  weeklyDiscount: string;
  monthlyDiscount: string;
  // Hosting fields
  availableFrom: string;
  availableTo: string;
  instantBook: boolean;
  internetIncluded: boolean;
  internetSpeed: string;
  petsAllowed: boolean;
  petDetails: string;
  airConditioning: boolean;
  laundry: string;
  dishwasher: boolean;
  nearestTransport: string;
  neighbourhoodVibe: string;
  genderPreference: string;
  couplesOk: boolean;
  // Photos
  photos: File[];
  photoUrls: string[];
  // Rules
  noSmoking: boolean;
  quietHours: string;
  tenantPrefs: string;
  minStay: string;
  // Safety
  securityCameras: boolean;
  securityCamerasLocation: string;
  weaponsOnProperty: boolean;
  weaponsExplanation: string;
  otherSafetyDetails: string;
  // Geocoding
  latitude: number | null;
  longitude: number | null;
  nearestStation: string | null;
  stationWalkMin: number | null;
}

// Bumping this key invalidates every saved draft, so change it only if the
// shape of ListingFormData changes incompatibly.
const DRAFT_KEY = "migrent_listing_draft_v1";

// "Review" is a deliberate stop before publishing. Owners used to hit
// "Publish Listing" straight off the Safety step, and the only preview lived
// in a sidebar hidden below the lg breakpoint, so phone users published
// without ever seeing the result.
const STEPS = ["Basics", "Details", "Hosting", "Photos", "Rules", "Safety", "Review"];
const REVIEW_STEP = STEPS.length - 1;

const PROPERTY_TYPES = ["House", "Apartment", "Townhouse", "Studio", "Other"];
const PLACE_TYPES = ["Entire place", "Private room", "Shared room", "Multiple rooms"];
const LAUNDRY_OPTIONS = ["In-unit", "Shared", "None"];
const GENDER_OPTIONS = ["Any", "Female only", "Male only"];

export default function ListingForm({ onSubmit, loading, initialData, userId }: ListingFormProps) {
  const [step, setStep] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [highlightInput, setHighlightInput] = useState("");
  const [photoCount, setPhotoCount] = useState(0);
  const [photosUploaded, setPhotosUploaded] = useState(false);
  const uploadZoneRef = useRef<{ triggerUpload: () => Promise<string[]> } | null>(null);

  const handlePhotosChange = useCallback((photos: UploadablePhoto[]) => {
    setPhotoCount(photos.length);
    // Update previews for the side preview
    setPhotoPreviews(photos.map((p) => p.preview));
  }, []);

  const handleUploadComplete = useCallback(
    (urls: string[]) => {
      update("photoUrls", urls);
      setPhotosUploaded(true);
    },
    []
  );

  const [form, setForm] = useState<ListingFormData>({
    streetAddress: "",
    suburb: "",
    postcode: "",
    propertyType: "Apartment",
    placeType: "Private room",
    weeklyPrice: 250,
    bond: "",
    maxGuests: 1,
    bedrooms: 1,
    beds: 1,
    bathrooms: 1,
    bathroomType: "shared",
    whoElseLivesHere: "",
    totalOtherPeople: "",
    furnished: true,
    billsIncluded: true,
    parking: false,
    title: "",
    description: "",
    highlights: [],
    weeklyDiscount: "",
    monthlyDiscount: "",
    // Hosting defaults
    availableFrom: "",
    availableTo: "",
    instantBook: false,
    internetIncluded: false,
    internetSpeed: "",
    petsAllowed: false,
    petDetails: "",
    airConditioning: false,
    laundry: "Shared",
    dishwasher: false,
    nearestTransport: "",
    neighbourhoodVibe: "",
    genderPreference: "Any",
    couplesOk: false,
    // Photos
    photos: [],
    photoUrls: [],
    noSmoking: true,
    quietHours: "10pm-7am",
    tenantPrefs: "",
    minStay: "",
    securityCameras: false,
    securityCamerasLocation: "",
    weaponsOnProperty: false,
    weaponsExplanation: "",
    otherSafetyDetails: "",
    // Geocoding
    latitude: null,
    longitude: null,
    nearestStation: null,
    stationWalkMin: null,
    ...initialData,
  });

  // ── Draft autosave ──────────────────────────────────────────
  //
  // Six steps of questions with nothing persisted: a refresh, a back button, a
  // phone call, or a dead battery lost the lot, including the photos already
  // uploaded. This is the highest-value flow in the product and it had no
  // safety net.
  //
  // Only new listings autosave. When initialData is present the owner is
  // editing something that already exists, and the server row is the source of
  // truth. `photos` holds File objects, which cannot be serialised; photoUrls
  // survives instead, and those uploads are already in storage.
  const isNewListing = !initialData;
  const [draftRestored, setDraftRestored] = useState(false);
  const [draftDismissed, setDraftDismissed] = useState(false);

  useEffect(() => {
    if (!isNewListing || typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as { form?: Partial<ListingFormData>; step?: number };
      if (!saved.form) return;
      setForm((prev) => ({ ...prev, ...saved.form, photos: [] }));
      if (typeof saved.step === "number") setStep(Math.min(saved.step, STEPS.length - 1));
      setDraftRestored(true);
    } catch {
      // A corrupt draft should never block someone from listing a room.
      window.localStorage.removeItem(DRAFT_KEY);
    }
  }, [isNewListing]);

  useEffect(() => {
    if (!isNewListing || typeof window === "undefined") return;
    const id = window.setTimeout(() => {
      try {
        const { photos, ...serialisable } = form;
        window.localStorage.setItem(
          DRAFT_KEY,
          JSON.stringify({ form: serialisable, step, savedAt: Date.now() })
        );
      } catch {
        // Private browsing or a full quota. Not worth interrupting the form.
      }
    }, 400);
    return () => window.clearTimeout(id);
  }, [form, step, isNewListing]);

  const clearDraft = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(DRAFT_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const discardDraft = () => {
    clearDraft();
    setDraftRestored(false);
    setDraftDismissed(true);
    window.location.reload();
  };

  const update = (key: keyof ListingFormData, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handlePhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    update("photos", [...form.photos, ...files]);
    const previews = files.map((f) => URL.createObjectURL(f));
    setPhotoPreviews((prev) => [...prev, ...previews]);
  };

  const removePhoto = (idx: number) => {
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== idx));
    update("photos", form.photos.filter((_: File, i: number) => i !== idx));
  };

  const addHighlight = () => {
    const trimmed = highlightInput.trim();
    if (trimmed && form.highlights.length < 5) {
      update("highlights", [...form.highlights, trimmed]);
      setHighlightInput("");
    }
  };

  const removeHighlight = (idx: number) => {
    update("highlights", form.highlights.filter((_, i) => i !== idx));
  };

  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const validateStep = (s: number): string[] => {
    // The review step only shows what earlier steps captured.
    if (s === REVIEW_STEP) return [];
    const errors: string[] = [];
    if (s === 0) {
      if (!form.suburb.trim()) errors.push("Suburb is required");
      if (!form.postcode.trim()) errors.push("Postcode is required");
      else {
        const pc = Number(form.postcode);
        if (isNaN(pc) || pc < 800 || pc > 9999) errors.push("Enter a valid Australian postcode (800-9999)");
      }
      if (!form.weeklyPrice || form.weeklyPrice <= 0) errors.push("Weekly price must be greater than $0");
      if (form.weeklyPrice > 50000) errors.push("Weekly price cannot exceed $50,000");
    }
    if (s === 1) {
      if (!form.title.trim()) errors.push("Title is required");
      if (form.description.trim().length < 10) errors.push("Description must be at least 10 characters");
      if (form.description.length > 5000) errors.push("Description cannot exceed 5000 characters");
    }
    if (s === 3) {
      if (photoCount < 5) errors.push("Add at least 5 photos");
    }
    return errors;
  };

  const canProceed = () => {
    return validateStep(step).length === 0;
  };

  const handleNext = () => {
    const errors = validateStep(step);
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }
    setValidationErrors([]);
    setStep(step + 1);
  };

  const handleSubmit = () => {
    // Validate all steps before submitting
    for (let s = 0; s < REVIEW_STEP; s++) {
      const errors = validateStep(s);
      if (errors.length > 0) {
        setValidationErrors(errors);
        setStep(s);
        return;
      }
    }
    setValidationErrors([]);
    clearDraft();
    onSubmit(form);
  };

  const showWhoElse = form.placeType !== "Entire place";

  // Counter input helper
  const CounterInput = ({ label, value, onChange, min = 0 }: { label: string; value: number; onChange: (v: number) => void; min?: number }) => (
    <div className="flex items-center justify-between p-3 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface-2)]/50">
      <span className="text-sm font-medium text-[var(--color-ink-2)]">{label}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          className="w-8 h-8 rounded-full border border-[var(--color-line-2)] flex items-center justify-center text-[var(--color-ink-3)] hover:border-[var(--color-line-2)] hover:text-[var(--color-primary)] transition-colors"
        >
          -
        </button>
        <span className="w-6 text-center text-sm font-bold text-[var(--color-ink)]">{value}</span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="w-8 h-8 rounded-full border border-[var(--color-line-2)] flex items-center justify-center text-[var(--color-ink-3)] hover:border-[var(--color-line-2)] hover:text-[var(--color-primary)] transition-colors"
        >
          +
        </button>
      </div>
    </div>
  );

  // Toggle card helper
  const ToggleCard = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) => (
    <label
      className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
        checked
          ? "border-[var(--color-line-2)] dark:border-[var(--color-primary-soft)] bg-[var(--color-primary-soft)] dark:bg-[var(--color-primary)]/5"
          : "border-[var(--color-line)] bg-[var(--color-surface-2)]/50"
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded border-[var(--color-line-2)] text-[var(--color-primary)] focus:ring-[var(--color-ink)]/30"
      />
      <span className="text-sm font-medium text-[var(--color-ink-2)]">{label}</span>
    </label>
  );

  // The listing preview, rendered twice: as the desktop sidebar and as the
  // Review step. It used to exist only in the sidebar, which is
  // `hidden lg:block`, so anyone listing from a phone published without
  // ever seeing what their listing looks like.
  const previewCard = (
      <div className="card rounded-2xl overflow-hidden">
        {/* Preview photo */}
        <div className="aspect-video bg-[var(--color-surface-muted)] flex items-center justify-center">
          {photoPreviews.length > 0 ? (
            <img src={photoPreviews[0]} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <svg className="w-12 h-12 text-[var(--color-ink-4)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          )}
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-bold text-[var(--color-ink)]">
                {form.title || `${form.suburb || "Suburb"}, ${form.postcode || "0000"}`}
              </h4>
              <p className="text-sm text-[var(--color-ink-3)]">
                {form.propertyType} &middot; {form.placeType}
              </p>
              <p className="text-xs text-[var(--color-ink-3)]">
                {form.bedrooms} bed{form.bedrooms !== 1 ? "s" : ""} &middot; {form.bathrooms} bath &middot; {form.maxGuests} guest{form.maxGuests !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-[var(--color-primary-soft)] dark:bg-[var(--color-primary)]/10 border border-[var(--color-primary-soft)] dark:border-[var(--color-primary-soft)]">
              <span className="text-[var(--color-primary)] dark:text-[var(--color-primary)] font-bold text-sm">
                AUD ${form.weeklyPrice || 0}
              </span>
              <span className="text-[var(--color-primary)] dark:text-[var(--color-primary)] text-xs">/wk</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {form.furnished && (
              <span className="px-2 py-0.5 rounded-full text-xs bg-[var(--color-surface-muted)] text-[var(--color-ink-2)]">Furnished</span>
            )}
            {form.billsIncluded && (
              <span className="px-2 py-0.5 rounded-full text-xs bg-[var(--color-surface-muted)] text-[var(--color-ink-2)]">Bills incl.</span>
            )}
            {form.bathroomType === "private" && (
              <span className="px-2 py-0.5 rounded-full text-xs bg-[var(--color-surface-muted)] text-[var(--color-ink-2)]">Private bath</span>
            )}
            {form.parking && (
              <span className="px-2 py-0.5 rounded-full text-xs bg-[var(--color-surface-muted)] text-[var(--color-ink-2)]">Parking</span>
            )}
            {form.noSmoking && (
              <span className="px-2 py-0.5 rounded-full text-xs bg-[var(--color-surface-muted)] text-[var(--color-ink-2)]">No smoking</span>
            )}
            {form.internetIncluded && (
              <span className="px-2 py-0.5 rounded-full text-xs bg-[var(--color-primary-50)] dark:bg-[var(--color-primary)]/10 text-[var(--color-primary)] dark:text-[var(--color-primary)]">WiFi</span>
            )}
            {form.petsAllowed && (
              <span className="px-2 py-0.5 rounded-full text-xs bg-[var(--color-warn-50)] dark:bg-[var(--color-warn-500)]/10 text-[var(--color-warn-600)] dark:text-[var(--color-warn-500)]">Pets OK</span>
            )}
            {form.airConditioning && (
              <span className="px-2 py-0.5 rounded-full text-xs bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400">A/C</span>
            )}
            {form.couplesOk && (
              <span className="px-2 py-0.5 rounded-full text-xs bg-[var(--color-primary-soft)] dark:bg-[var(--color-primary)]/10 text-[var(--color-primary)] dark:text-[var(--color-primary)]">Couples OK</span>
            )}
          </div>
          {form.highlights.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {form.highlights.map((h, i) => (
                <span key={i} className="px-2 py-0.5 rounded-full text-xs bg-[var(--color-primary-soft)] dark:bg-[var(--color-primary)]/10 text-[var(--color-primary)] dark:text-[var(--color-primary)] border border-[var(--color-primary-soft)] dark:border-[var(--color-primary-soft)]">
                  {h}
                </span>
              ))}
            </div>
          )}
          {form.description && (
            <p className="text-sm text-[var(--color-ink-2)] line-clamp-3">{form.description}</p>
          )}
          {form.availableFrom && (
            <p className="text-xs text-[var(--color-ink-3)]">
              Available: {form.availableFrom}{form.availableTo ? ` to ${form.availableTo}` : " onwards"}
            </p>
          )}
          {form.nearestTransport && (
            <p className="text-xs text-[var(--color-ink-3)]">Transport: {form.nearestTransport}</p>
          )}
          {(form.weeklyDiscount || form.monthlyDiscount) && (
            <div className="flex gap-2">
              {form.weeklyDiscount && (
                <span className="px-2 py-0.5 rounded-full text-xs bg-[var(--color-accent-soft)] dark:bg-[var(--color-accent)]/10 text-[var(--color-accent)] dark:text-[var(--color-accent)] border border-[var(--color-accent-soft)] dark:border-[var(--color-accent-soft)]">
                  {form.weeklyDiscount}% weekly discount
                </span>
              )}
              {form.monthlyDiscount && (
                <span className="px-2 py-0.5 rounded-full text-xs bg-[var(--color-accent-soft)] dark:bg-[var(--color-accent)]/10 text-[var(--color-accent)] dark:text-[var(--color-accent)] border border-[var(--color-accent-soft)] dark:border-[var(--color-accent-soft)]">
                  {form.monthlyDiscount}% monthly discount
                </span>
              )}
            </div>
          )}
          {form.minStay && (
            <p className="text-xs text-[var(--color-ink-3)]">Min stay: {form.minStay}</p>
          )}
        </div>
      </div>
  );

  return (
    <div className="grid lg:grid-cols-5 gap-8">
      {/* Main form */}
      <div className="lg:col-span-3 space-y-6">
        {draftRestored && !draftDismissed && (
          <div
            role="status"
            className="flex flex-wrap items-center justify-between gap-3 rounded-[10px] border border-[var(--color-line-2)] bg-[var(--color-surface)] px-4 py-3"
          >
            <p className="text-[13.5px] text-[var(--color-ink-2)]">
              We brought back what you had already filled in.
            </p>
            <button
              type="button"
              onClick={discardDraft}
              className="text-[13px] font-semibold text-[var(--color-ink-3)] hover:text-[var(--color-ink)] underline underline-offset-[3px] transition-colors"
            >
              Start fresh instead
            </button>
          </div>
        )}

        {/* Step indicator */}
        <div className="flex items-center gap-2 flex-wrap">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <button
                onClick={() => i < step && setStep(i)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  i === step
                    ? "bg-[var(--color-primary)] text-white"
                    : i < step
                    ? "bg-[var(--color-accent-soft)] dark:bg-[var(--color-accent)]/10 text-[var(--color-accent)] dark:text-[var(--color-accent)] cursor-pointer"
                    : "bg-[var(--color-surface-muted)] text-[var(--color-ink-3)]"
                }`}
              >
                {i < step ? (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span>{i + 1}</span>
                )}
                <span className="hidden sm:inline">{label}</span>
              </button>
              {i < STEPS.length - 1 && (
                <div className={`w-6 h-0.5 rounded-full ${i < step ? "bg-[var(--color-accent-soft)] dark:bg-[var(--color-accent)]/30" : "bg-[var(--color-line)]"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="card p-6 rounded-2xl space-y-5"
          >
            {/* ── Step 0: Basics ── */}
            {step === 0 && (
              <>
                <h3 className="text-lg font-bold text-[var(--color-ink)]">Basics</h3>

                {/* Address autocomplete with geocoding */}
                <AddressGeocoder
                  initialValue={form.streetAddress || (form.suburb ? `${form.suburb}, ${form.postcode}` : "")}
                  onSelect={(result) => {
                    update("streetAddress", result.address);
                    update("suburb", result.suburb);
                    update("postcode", result.postcode);
                    update("latitude", result.lat);
                    update("longitude", result.lng);
                    update("nearestStation", result.nearestStation);
                    update("stationWalkMin", result.walkMinutes);
                  }}
                />

                {/* Manual suburb/postcode override */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-ink-2)] mb-1.5">Suburb</label>
                    <input
                      type="text"
                      placeholder="e.g. Surry Hills"
                      value={form.suburb}
                      onChange={(e) => update("suburb", e.target.value)}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-ink-2)] mb-1.5">Postcode</label>
                    <input
                      type="text"
                      placeholder="e.g. 2010"
                      value={form.postcode}
                      onChange={(e) => update("postcode", e.target.value)}
                      className="input-field"
                    />
                  </div>
                </div>

                {/* Property type */}
                <div>
                  <label className="block text-sm font-medium text-[var(--color-ink-2)] mb-2">Property type</label>
                  <div className="flex flex-wrap gap-2">
                    {PROPERTY_TYPES.map((pt) => (
                      <button
                        key={pt}
                        type="button"
                        onClick={() => update("propertyType", pt)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                          form.propertyType === pt
                            ? "border-[var(--color-line-2)] dark:border-[var(--color-primary)]/40 bg-[var(--color-primary-soft)] dark:bg-[var(--color-primary)]/10 text-[var(--color-primary)] dark:text-[var(--color-primary)]"
                            : "border-[var(--color-line)] bg-[var(--color-surface-2)]/50 text-[var(--color-ink-2)] hover:border-[var(--color-line-2)]"
                        }`}
                      >
                        {pt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Place type */}
                <div>
                  <label className="block text-sm font-medium text-[var(--color-ink-2)] mb-2">Place type</label>
                  <div className="flex flex-wrap gap-2">
                    {PLACE_TYPES.map((pt) => (
                      <button
                        key={pt}
                        type="button"
                        onClick={() => update("placeType", pt)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                          form.placeType === pt
                            ? "border-[var(--color-line-2)] dark:border-[var(--color-primary)]/40 bg-[var(--color-primary-soft)] dark:bg-[var(--color-primary)]/10 text-[var(--color-primary)] dark:text-[var(--color-primary)]"
                            : "border-[var(--color-line)] bg-[var(--color-surface-2)]/50 text-[var(--color-ink-2)] hover:border-[var(--color-line-2)]"
                        }`}
                      >
                        {pt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Capacity counters */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[var(--color-ink-2)]">Capacity &amp; layout</label>
                  <CounterInput label="Max guests" value={form.maxGuests} onChange={(v) => update("maxGuests", v)} min={1} />
                  <CounterInput label="Bedrooms" value={form.bedrooms} onChange={(v) => update("bedrooms", v)} min={1} />
                  <CounterInput label="Beds" value={form.beds} onChange={(v) => update("beds", v)} min={1} />
                </div>

                {/* Bathrooms */}
                <div className="space-y-2">
                  <CounterInput label="Bathrooms" value={form.bathrooms} onChange={(v) => update("bathrooms", v)} min={1} />
                  <div className="flex gap-3">
                    {(["private", "shared"] as const).map((bt) => (
                      <button
                        key={bt}
                        type="button"
                        onClick={() => update("bathroomType", bt)}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all capitalize ${
                          form.bathroomType === bt
                            ? "border-[var(--color-line-2)] dark:border-[var(--color-primary)]/40 bg-[var(--color-primary-soft)] dark:bg-[var(--color-primary)]/10 text-[var(--color-primary)] dark:text-[var(--color-primary)]"
                            : "border-[var(--color-line)] bg-[var(--color-surface-2)]/50 text-[var(--color-ink-2)]"
                        }`}
                      >
                        {bt} bathroom
                      </button>
                    ))}
                  </div>
                </div>

                {/* Who else might be there */}
                {showWhoElse && (
                  <div className="space-y-3 p-4 rounded-xl border border-[var(--color-line-2)] dark:border-[var(--color-warn-500)]/20 bg-[var(--color-warn-50)]/50 dark:bg-[var(--color-warn-500)]/5">
                    <label className="block text-sm font-semibold text-[var(--color-warn-600)] dark:text-[var(--color-warn-500)]">Who else might be there?</label>
                    <input
                      type="text"
                      placeholder='e.g. "I live here", "Family", "Other tenants"'
                      value={form.whoElseLivesHere}
                      onChange={(e) => update("whoElseLivesHere", e.target.value)}
                      className="input-field"
                    />
                    <input
                      type="text"
                      placeholder="Total number of other people (optional)"
                      value={form.totalOtherPeople}
                      onChange={(e) => update("totalOtherPeople", e.target.value)}
                      className="input-field"
                    />
                  </div>
                )}

                {/* Price & bond */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-ink-2)] mb-1.5">Weekly price (AUD)</label>
                    <input
                      type="number"
                      placeholder="250"
                      value={form.weeklyPrice || ""}
                      onChange={(e) => update("weeklyPrice", Number(e.target.value))}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-ink-2)] mb-1.5">Bond</label>
                    <input
                      type="text"
                      placeholder="e.g. 4 weeks rent"
                      value={form.bond}
                      onChange={(e) => update("bond", e.target.value)}
                      className="input-field"
                    />
                  </div>
                </div>
              </>
            )}

            {/* ── Step 1: Details ── */}
            {step === 1 && (
              <>
                <h3 className="text-lg font-bold text-[var(--color-ink)]">Details</h3>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-[var(--color-ink-2)] mb-1.5">Listing title *</label>
                  <input
                    type="text"
                    placeholder="e.g. Bright room near Central Station"
                    value={form.title}
                    onChange={(e) => update("title", e.target.value)}
                    maxLength={80}
                    className="input-field"
                  />
                  <p className="text-xs text-[var(--color-ink-3)] mt-1">{form.title.length}/80</p>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-[var(--color-ink-2)] mb-1.5">Quick description *</label>
                  <textarea
                    placeholder="Describe the room, location highlights, nearby transport..."
                    value={form.description}
                    onChange={(e) => update("description", e.target.value)}
                    rows={4}
                    className="input-field"
                  />
                </div>

                {/* Amenity toggles */}
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    { key: "furnished" as const, label: "Furnished" },
                    { key: "billsIncluded" as const, label: "Bills included" },
                    { key: "parking" as const, label: "Parking available" },
                  ].map(({ key, label }) => (
                    <ToggleCard key={key} label={label} checked={form[key] as boolean} onChange={(v) => update(key, v)} />
                  ))}
                </div>

                {/* Highlights */}
                <div>
                  <label className="block text-sm font-medium text-[var(--color-ink-2)] mb-1.5">
                    Highlights (3-5 best things about your place)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Walk to station"
                      value={highlightInput}
                      onChange={(e) => setHighlightInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addHighlight())}
                      maxLength={60}
                      className="input-field flex-1"
                    />
                    <button
                      type="button"
                      onClick={addHighlight}
                      disabled={form.highlights.length >= 5 || !highlightInput.trim()}
                      className="btn-primary py-2.5 px-4 rounded-xl text-sm disabled:opacity-40"
                    >
                      Add
                    </button>
                  </div>
                  {form.highlights.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {form.highlights.map((h, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[var(--color-primary-soft)] dark:bg-[var(--color-primary)]/10 text-[var(--color-primary)] dark:text-[var(--color-primary)] border border-[var(--color-primary-soft)] dark:border-[var(--color-primary-soft)]"
                        >
                          {h}
                          <button type="button" onClick={() => removeHighlight(i)} className="hover:text-rose-800 dark:hover:text-[var(--color-primary)] transition-colors">
                            &times;
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-[var(--color-ink-3)] mt-1">{form.highlights.length}/5 added{form.highlights.length < 3 ? " (minimum 3)" : ""}</p>
                </div>

                {/* Discounts */}
                <div>
                  <label className="block text-sm font-medium text-[var(--color-ink-2)] mb-2">Discounts (optional)</label>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-[var(--color-ink-3)] mb-1">Weekly discount (%)</label>
                      <input
                        type="number"
                        placeholder="e.g. 5"
                        value={form.weeklyDiscount}
                        onChange={(e) => update("weeklyDiscount", e.target.value)}
                        min={0}
                        max={50}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[var(--color-ink-3)] mb-1">Monthly discount (%)</label>
                      <input
                        type="number"
                        placeholder="e.g. 10"
                        value={form.monthlyDiscount}
                        onChange={(e) => update("monthlyDiscount", e.target.value)}
                        min={0}
                        max={50}
                        className="input-field"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ── Step 2: Hosting ── */}
            {step === 2 && (
              <>
                <h3 className="text-lg font-bold text-[var(--color-ink)]">Hosting details</h3>
                <p className="text-sm text-[var(--color-ink-3)]">
                  Help seekers know when your place is available and what amenities are included.
                </p>

                {/* Availability dates */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-ink-2)] mb-1.5">Available from</label>
                    <input
                      type="date"
                      value={form.availableFrom}
                      onChange={(e) => update("availableFrom", e.target.value)}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-ink-2)] mb-1.5">Available to (optional)</label>
                    <input
                      type="date"
                      value={form.availableTo}
                      onChange={(e) => update("availableTo", e.target.value)}
                      className="input-field"
                    />
                  </div>
                </div>

                {/* Instant book */}
                <ToggleCard label="Instant book (seekers can book without approval)" checked={form.instantBook} onChange={(v) => update("instantBook", v)} />

                {/* Internet */}
                <div className="space-y-3">
                  <ToggleCard label="Internet included" checked={form.internetIncluded} onChange={(v) => update("internetIncluded", v)} />
                  {form.internetIncluded && (
                    <input
                      type="text"
                      placeholder="e.g. 50 Mbps NBN, unlimited data"
                      value={form.internetSpeed}
                      onChange={(e) => update("internetSpeed", e.target.value)}
                      className="input-field"
                    />
                  )}
                </div>

                {/* Pets */}
                <div className="space-y-3">
                  <ToggleCard label="Pets allowed" checked={form.petsAllowed} onChange={(v) => update("petsAllowed", v)} />
                  {form.petsAllowed && (
                    <input
                      type="text"
                      placeholder="e.g. Small dogs OK, cats welcome, no exotic pets"
                      value={form.petDetails}
                      onChange={(e) => update("petDetails", e.target.value)}
                      className="input-field"
                    />
                  )}
                </div>

                {/* Extra amenities */}
                <div>
                  <label className="block text-sm font-medium text-[var(--color-ink-2)] mb-2">Extra amenities</label>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <ToggleCard label="Air conditioning" checked={form.airConditioning} onChange={(v) => update("airConditioning", v)} />
                    <ToggleCard label="Dishwasher" checked={form.dishwasher} onChange={(v) => update("dishwasher", v)} />
                    <ToggleCard label="Couples OK" checked={form.couplesOk} onChange={(v) => update("couplesOk", v)} />
                  </div>
                </div>

                {/* Laundry */}
                <div>
                  <label className="block text-sm font-medium text-[var(--color-ink-2)] mb-2">Laundry</label>
                  <div className="flex flex-wrap gap-2">
                    {LAUNDRY_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => update("laundry", opt)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                          form.laundry === opt
                            ? "border-[var(--color-line-2)] dark:border-[var(--color-primary)]/40 bg-[var(--color-primary-soft)] dark:bg-[var(--color-primary)]/10 text-[var(--color-primary)] dark:text-[var(--color-primary)]"
                            : "border-[var(--color-line)] bg-[var(--color-surface-2)]/50 text-[var(--color-ink-2)] hover:border-[var(--color-line-2)]"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Gender preference */}
                <div>
                  <label className="block text-sm font-medium text-[var(--color-ink-2)] mb-2">Tenant gender preference</label>
                  <div className="flex flex-wrap gap-2">
                    {GENDER_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => update("genderPreference", opt)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                          form.genderPreference === opt
                            ? "border-[var(--color-line-2)] dark:border-[var(--color-primary)]/40 bg-[var(--color-primary-soft)] dark:bg-[var(--color-primary)]/10 text-[var(--color-primary)] dark:text-[var(--color-primary)]"
                            : "border-[var(--color-line)] bg-[var(--color-surface-2)]/50 text-[var(--color-ink-2)] hover:border-[var(--color-line-2)]"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Transport & neighbourhood */}
                <div>
                  <label className="block text-sm font-medium text-[var(--color-ink-2)] mb-1.5">Nearest transport</label>
                  <input
                    type="text"
                    placeholder="e.g. Central Station 5 min walk, Bus 370 at door"
                    value={form.nearestTransport}
                    onChange={(e) => update("nearestTransport", e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-ink-2)] mb-1.5">Neighbourhood vibe</label>
                  <input
                    type="text"
                    placeholder="e.g. Quiet residential, cafes nearby, 10 min to CBD"
                    value={form.neighbourhoodVibe}
                    onChange={(e) => update("neighbourhoodVibe", e.target.value)}
                    className="input-field"
                  />
                </div>
              </>
            )}

            {/* ── Step 3: Photos ── */}
            {step === 3 && (
              <>
                <h3 className="text-lg font-bold text-[var(--color-ink)]">Photos</h3>
                <p className="text-sm text-[var(--color-ink-3)]">
                  Add photos to help seekers visualise the room. Drag and drop or click to upload.
                </p>
                <PhotoUploadZone
                  bucket="listing-images"
                  pathPrefix={userId || "anonymous"}
                  maxFiles={20}
                  minFiles={5}
                  onPhotosChange={handlePhotosChange}
                  onUploadComplete={handleUploadComplete}
                />
              </>
            )}

            {/* ── Step 4: Rules ── */}
            {step === 4 && (
              <>
                <h3 className="text-lg font-bold text-[var(--color-ink)]">House rules</h3>
                <ToggleCard label="No smoking" checked={form.noSmoking} onChange={(v) => update("noSmoking", v)} />
                <div>
                  <label className="block text-sm font-medium text-[var(--color-ink-2)] mb-1.5">Quiet hours</label>
                  <input
                    type="text"
                    placeholder="e.g. 10pm-7am"
                    value={form.quietHours}
                    onChange={(e) => update("quietHours", e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-ink-2)] mb-1.5">Minimum stay</label>
                  <input
                    type="text"
                    value={form.minStay}
                    onChange={(e) => update("minStay", e.target.value)}
                    placeholder="e.g. 3 months, 6 weeks, flexible"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-ink-2)] mb-1.5">Tenant preferences</label>
                  <textarea
                    placeholder="e.g. Professional or student, non-smoker, tidy..."
                    value={form.tenantPrefs}
                    onChange={(e) => update("tenantPrefs", e.target.value)}
                    rows={3}
                    className="input-field"
                  />
                </div>
              </>
            )}

            {/* ── Step 5: Safety ── */}
            {step === 5 && (
              <>
                <h3 className="text-lg font-bold text-[var(--color-ink)]">Safety details</h3>
                <p className="text-sm text-[var(--color-ink-3)]">
                  Be transparent about safety-related aspects of the property. This builds trust with seekers.
                </p>

                {/* Security cameras */}
                <div className="space-y-3">
                  <ToggleCard label="Security cameras on property" checked={form.securityCameras} onChange={(v) => update("securityCameras", v)} />
                  {form.securityCameras && (
                    <input
                      type="text"
                      placeholder="Where are cameras located? (e.g. Front door, driveway)"
                      value={form.securityCamerasLocation}
                      onChange={(e) => update("securityCamerasLocation", e.target.value)}
                      className="input-field"
                    />
                  )}
                </div>

                {/* Weapons */}
                <div className="space-y-3">
                  <ToggleCard label="Weapons stored on property" checked={form.weaponsOnProperty} onChange={(v) => update("weaponsOnProperty", v)} />
                  {form.weaponsOnProperty && (
                    <textarea
                      placeholder="Please explain (e.g. Locked gun safe in garage)"
                      value={form.weaponsExplanation}
                      onChange={(e) => update("weaponsExplanation", e.target.value)}
                      rows={2}
                      className="input-field"
                    />
                  )}
                </div>

                {/* Other safety */}
                <div>
                  <label className="block text-sm font-medium text-[var(--color-ink-2)] mb-1.5">Other safety details</label>
                  <textarea
                    placeholder="Any other safety info seekers should know about? (optional)"
                    value={form.otherSafetyDetails}
                    onChange={(e) => update("otherSafetyDetails", e.target.value)}
                    rows={3}
                    className="input-field"
                  />
                </div>
              </>
            )}

            {step === REVIEW_STEP && (
              <>
                <div>
                  <h3 className="text-lg font-semibold text-[var(--color-ink)]">
                    Check it over
                  </h3>
                  <p className="text-sm text-[var(--color-ink-3)] mt-1">
                    This is exactly what renters will see. Go back to any step to change something.
                  </p>
                </div>

                {previewCard}

                <div className="rounded-[10px] border border-[var(--color-line)] divide-y divide-[var(--color-line)]">
                  {[
                    { label: "Address (private)", value: form.streetAddress || "Not set", step: 0 },
                    { label: "Shown publicly as", value: `${form.suburb || "Suburb"} ${form.postcode || ""}`.trim(), step: 0 },
                    { label: "Rent", value: `$${form.weeklyPrice} per week`, step: 0 },
                    { label: "Bond", value: form.bond || "Not set", step: 0 },
                    { label: "Photos", value: photoCount > 0 ? `${photoCount} uploaded` : "None yet", step: 3 },
                    { label: "Available from", value: form.availableFrom || "Any time", step: 2 },
                    { label: "Minimum stay", value: form.minStay || "No minimum", step: 4 },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between gap-3 px-4 py-2.5">
                      <span className="text-[13px] text-[var(--color-ink-3)]">{row.label}</span>
                      <span className="flex items-center gap-3 min-w-0">
                        <span className="text-[13.5px] text-[var(--color-ink)] truncate">{row.value}</span>
                        <button
                          type="button"
                          onClick={() => { setValidationErrors([]); setStep(row.step); }}
                          className="text-[12.5px] font-semibold text-[var(--color-primary)] hover:underline underline-offset-[3px] shrink-0"
                        >
                          Change
                        </button>
                      </span>
                    </div>
                  ))}
                </div>

                {photoCount === 0 && (
                  <p className="text-[13px] text-[var(--color-warn-600)]">
                    Listings with photos get far more enquiries. Worth adding a few before you publish.
                  </p>
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Validation errors */}
        {validationErrors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-xl bg-[var(--color-danger-50)] dark:bg-[var(--color-danger-500)]/10 border border-[var(--color-danger-500)]/30 dark:border-[var(--color-danger-500)]/20"
          >
            {validationErrors.map((err, i) => (
              <p key={i} className="text-sm text-[var(--color-danger-500)] dark:text-[var(--color-danger-500)]">{err}</p>
            ))}
          </motion.div>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between">
          <button
            onClick={() => { setValidationErrors([]); setStep(Math.max(0, step - 1)); }}
            disabled={step === 0}
            className="btn-secondary py-2.5 px-5 rounded-xl text-sm disabled:opacity-30"
          >
            Back
          </button>
          {step < STEPS.length - 1 ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleNext}
              className="btn-primary py-2.5 px-5 rounded-xl text-sm disabled:opacity-50"
            >
              Next
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={loading}
              className="btn-primary py-2.5 px-6 rounded-xl text-sm disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Publishing...
                </span>
              ) : (
                "Publish listing"
              )}
            </motion.button>
          )}
        </div>
      </div>

      {/* Side preview */}
      <div className="lg:col-span-2 hidden lg:block">
        <div className="sticky top-24">
          <h3 className="text-sm font-semibold text-[var(--color-ink-3)] mb-3">
            How seekers see your listing
          </h3>
          {previewCard}
        </div>
      </div>
    </div>
  );
}
