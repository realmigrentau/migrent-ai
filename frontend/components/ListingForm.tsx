import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ListingFormProps {
  onSubmit: (data: ListingFormData) => void;
  loading?: boolean;
  initialData?: Partial<ListingFormData>;
}

export interface ListingFormData {
  // Basics
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
}

const STEPS = ["Basics", "Details", "Hosting", "Photos", "Rules", "Safety"];

const PROPERTY_TYPES = ["House", "Apartment", "Townhouse", "Studio", "Other"];
const PLACE_TYPES = ["Entire place", "Private room", "Shared room", "Multiple rooms"];
const LAUNDRY_OPTIONS = ["In-unit", "Shared", "None"];
const GENDER_OPTIONS = ["Any", "Female only", "Male only"];

export default function ListingForm({ onSubmit, loading, initialData }: ListingFormProps) {
  const [step, setStep] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [highlightInput, setHighlightInput] = useState("");

  const [form, setForm] = useState<ListingFormData>({
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
    noSmoking: true,
    quietHours: "10pm-7am",
    tenantPrefs: "",
    minStay: "3 months",
    securityCameras: false,
    securityCamerasLocation: "",
    weaponsOnProperty: false,
    weaponsExplanation: "",
    otherSafetyDetails: "",
    ...initialData,
  });

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

  const canProceed = () => {
    if (step === 0) return form.suburb && form.postcode && form.weeklyPrice > 0;
    if (step === 1) return form.title.trim().length > 0 && form.description.trim().length > 0;
    return true;
  };

  const handleSubmit = () => {
    onSubmit(form);
  };

  const showWhoElse = form.placeType !== "Entire place";

  // Counter input helper
  const CounterInput = ({ label, value, onChange, min = 0 }: { label: string; value: number; onChange: (v: number) => void; min?: number }) => (
    <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50">
      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          className="w-8 h-8 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center text-slate-500 hover:border-rose-400 hover:text-rose-500 transition-colors"
        >
          -
        </button>
        <span className="w-6 text-center text-sm font-bold text-slate-900 dark:text-white">{value}</span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="w-8 h-8 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center text-slate-500 hover:border-rose-400 hover:text-rose-500 transition-colors"
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
          ? "border-rose-300 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/5"
          : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50"
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-rose-500 focus:ring-rose-500"
      />
      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
    </label>
  );

  return (
    <div className="grid lg:grid-cols-5 gap-8">
      {/* Main form */}
      <div className="lg:col-span-3 space-y-6">
        {/* Step indicator */}
        <div className="flex items-center gap-2 flex-wrap">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <button
                onClick={() => i < step && setStep(i)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  i === step
                    ? "bg-rose-500 text-white"
                    : i < step
                    ? "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 cursor-pointer"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500"
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
                <div className={`w-6 h-0.5 rounded-full ${i < step ? "bg-emerald-300 dark:bg-emerald-500/30" : "bg-slate-200 dark:bg-slate-700"}`} />
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
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Basics</h3>

                {/* Location */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Suburb</label>
                    <input
                      type="text"
                      placeholder="e.g. Surry Hills"
                      value={form.suburb}
                      onChange={(e) => update("suburb", e.target.value)}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Postcode</label>
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
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Property type</label>
                  <div className="flex flex-wrap gap-2">
                    {PROPERTY_TYPES.map((pt) => (
                      <button
                        key={pt}
                        type="button"
                        onClick={() => update("propertyType", pt)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                          form.propertyType === pt
                            ? "border-rose-400 dark:border-rose-500/40 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400"
                            : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 hover:border-slate-300"
                        }`}
                      >
                        {pt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Place type */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Place type</label>
                  <div className="flex flex-wrap gap-2">
                    {PLACE_TYPES.map((pt) => (
                      <button
                        key={pt}
                        type="button"
                        onClick={() => update("placeType", pt)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                          form.placeType === pt
                            ? "border-rose-400 dark:border-rose-500/40 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400"
                            : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 hover:border-slate-300"
                        }`}
                      >
                        {pt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Capacity counters */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Capacity &amp; layout</label>
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
                            ? "border-rose-400 dark:border-rose-500/40 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400"
                            : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-slate-600 dark:text-slate-300"
                        }`}
                      >
                        {bt} bathroom
                      </button>
                    ))}
                  </div>
                </div>

                {/* Who else might be there */}
                {showWhoElse && (
                  <div className="space-y-3 p-4 rounded-xl border border-amber-200 dark:border-amber-500/20 bg-amber-50/50 dark:bg-amber-500/5">
                    <label className="block text-sm font-semibold text-amber-700 dark:text-amber-400">Who else might be there?</label>
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
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Weekly price (AUD)</label>
                    <input
                      type="number"
                      placeholder="250"
                      value={form.weeklyPrice || ""}
                      onChange={(e) => update("weeklyPrice", Number(e.target.value))}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Bond</label>
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
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Details</h3>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Listing title *</label>
                  <input
                    type="text"
                    placeholder="e.g. Bright room near Central Station"
                    value={form.title}
                    onChange={(e) => update("title", e.target.value)}
                    maxLength={80}
                    className="input-field"
                  />
                  <p className="text-xs text-slate-400 mt-1">{form.title.length}/80</p>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Quick description *</label>
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
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
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
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20"
                        >
                          {h}
                          <button type="button" onClick={() => removeHighlight(i)} className="hover:text-rose-800 dark:hover:text-rose-300 transition-colors">
                            &times;
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-slate-400 mt-1">{form.highlights.length}/5 added{form.highlights.length < 3 ? " (minimum 3)" : ""}</p>
                </div>

                {/* Discounts */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Discounts (optional)</label>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Weekly discount (%)</label>
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
                      <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Monthly discount (%)</label>
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
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Hosting details</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Help seekers know when your place is available and what amenities are included.
                </p>

                {/* Availability dates */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Available from</label>
                    <input
                      type="date"
                      value={form.availableFrom}
                      onChange={(e) => update("availableFrom", e.target.value)}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Available to (optional)</label>
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
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Extra amenities</label>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <ToggleCard label="Air conditioning" checked={form.airConditioning} onChange={(v) => update("airConditioning", v)} />
                    <ToggleCard label="Dishwasher" checked={form.dishwasher} onChange={(v) => update("dishwasher", v)} />
                    <ToggleCard label="Couples OK" checked={form.couplesOk} onChange={(v) => update("couplesOk", v)} />
                  </div>
                </div>

                {/* Laundry */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Laundry</label>
                  <div className="flex flex-wrap gap-2">
                    {LAUNDRY_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => update("laundry", opt)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                          form.laundry === opt
                            ? "border-rose-400 dark:border-rose-500/40 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400"
                            : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 hover:border-slate-300"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Gender preference */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Tenant gender preference</label>
                  <div className="flex flex-wrap gap-2">
                    {GENDER_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => update("genderPreference", opt)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                          form.genderPreference === opt
                            ? "border-rose-400 dark:border-rose-500/40 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400"
                            : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 hover:border-slate-300"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Transport & neighbourhood */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Nearest transport</label>
                  <input
                    type="text"
                    placeholder="e.g. Central Station 5 min walk, Bus 370 at door"
                    value={form.nearestTransport}
                    onChange={(e) => update("nearestTransport", e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Neighbourhood vibe</label>
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
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Photos</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Add photos to help seekers visualise the room. Drag and drop or click to upload.
                </p>
                <div
                  onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-8 text-center cursor-pointer hover:border-rose-400 dark:hover:border-rose-500/40 transition-colors"
                >
                  <svg className="w-10 h-10 mx-auto text-slate-400 dark:text-slate-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-8m0 0l-3 3m3-3l3 3M3 16v2a2 2 0 002 2h14a2 2 0 002-2v-2" />
                  </svg>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Click to upload or drag photos here</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">JPG, PNG up to 5MB each</p>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotos}
                    className="hidden"
                  />
                </div>
                {photoPreviews.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {photoPreviews.map((src, i) => (
                      <div key={i} className="relative group aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                        <img src={src} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                        <button
                          onClick={() => removePhoto(i)}
                          className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* ── Step 4: Rules ── */}
            {step === 4 && (
              <>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">House rules</h3>
                <ToggleCard label="No smoking" checked={form.noSmoking} onChange={(v) => update("noSmoking", v)} />
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Quiet hours</label>
                  <input
                    type="text"
                    placeholder="e.g. 10pm-7am"
                    value={form.quietHours}
                    onChange={(e) => update("quietHours", e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Minimum stay</label>
                  <select
                    value={form.minStay}
                    onChange={(e) => update("minStay", e.target.value)}
                    className="input-field"
                  >
                    <option value="1 month">1 month</option>
                    <option value="3 months">3 months</option>
                    <option value="6 months">6 months</option>
                    <option value="12 months">12 months</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Tenant preferences</label>
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
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Safety details</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
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
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Other safety details</label>
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
          </motion.div>
        </AnimatePresence>

        {/* Navigation buttons */}
        <div className="flex justify-between">
          <button
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className="btn-secondary py-2.5 px-5 rounded-xl text-sm disabled:opacity-30"
          >
            Back
          </button>
          {step < STEPS.length - 1 ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
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
                "Pay AUD $99 & Publish"
              )}
            </motion.button>
          )}
        </div>
      </div>

      {/* Side preview */}
      <div className="lg:col-span-2 hidden lg:block">
        <div className="sticky top-24">
          <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-3">
            How seekers see your listing
          </h3>
          <div className="card rounded-2xl overflow-hidden">
            {/* Preview photo */}
            <div className="aspect-video bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              {photoPreviews.length > 0 ? (
                <img src={photoPreviews[0]} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <svg className="w-12 h-12 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              )}
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">
                    {form.title || `${form.suburb || "Suburb"}, ${form.postcode || "0000"}`}
                  </h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {form.propertyType} &middot; {form.placeType}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    {form.bedrooms} bed{form.bedrooms !== 1 ? "s" : ""} &middot; {form.bathrooms} bath &middot; {form.maxGuests} guest{form.maxGuests !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20">
                  <span className="text-rose-600 dark:text-rose-400 font-bold text-sm">
                    AUD ${form.weeklyPrice || 0}
                  </span>
                  <span className="text-rose-400 dark:text-rose-500 text-xs">/wk</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {form.furnished && (
                  <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">Furnished</span>
                )}
                {form.billsIncluded && (
                  <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">Bills incl.</span>
                )}
                {form.bathroomType === "private" && (
                  <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">Private bath</span>
                )}
                {form.parking && (
                  <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">Parking</span>
                )}
                {form.noSmoking && (
                  <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">No smoking</span>
                )}
                {form.internetIncluded && (
                  <span className="px-2 py-0.5 rounded-full text-xs bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">WiFi</span>
                )}
                {form.petsAllowed && (
                  <span className="px-2 py-0.5 rounded-full text-xs bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">Pets OK</span>
                )}
                {form.airConditioning && (
                  <span className="px-2 py-0.5 rounded-full text-xs bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400">A/C</span>
                )}
                {form.couplesOk && (
                  <span className="px-2 py-0.5 rounded-full text-xs bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400">Couples OK</span>
                )}
              </div>
              {form.highlights.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {form.highlights.map((h, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-full text-xs bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-500/20">
                      {h}
                    </span>
                  ))}
                </div>
              )}
              {form.description && (
                <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3">{form.description}</p>
              )}
              {form.availableFrom && (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Available: {form.availableFrom}{form.availableTo ? ` to ${form.availableTo}` : " onwards"}
                </p>
              )}
              {form.nearestTransport && (
                <p className="text-xs text-slate-500 dark:text-slate-400">Transport: {form.nearestTransport}</p>
              )}
              {(form.weeklyDiscount || form.monthlyDiscount) && (
                <div className="flex gap-2">
                  {form.weeklyDiscount && (
                    <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20">
                      {form.weeklyDiscount}% weekly discount
                    </span>
                  )}
                  {form.monthlyDiscount && (
                    <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20">
                      {form.monthlyDiscount}% monthly discount
                    </span>
                  )}
                </div>
              )}
              {form.minStay && (
                <p className="text-xs text-slate-400 dark:text-slate-500">Min stay: {form.minStay}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
