import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ListingFormProps {
  onSubmit: (data: ListingFormData) => void;
  loading?: boolean;
}

export interface ListingFormData {
  suburb: string;
  postcode: string;
  roomType: string;
  weeklyPrice: number;
  bond: string;
  furnished: boolean;
  billsIncluded: boolean;
  privateBathroom: boolean;
  parking: boolean;
  description: string;
  photos: File[];
  noSmoking: boolean;
  quietHours: string;
  tenantPrefs: string;
  minStay: string;
}

const STEPS = ["Basics", "Details", "Photos", "Rules"];

export default function ListingForm({ onSubmit, loading }: ListingFormProps) {
  const [step, setStep] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  const [form, setForm] = useState<ListingFormData>({
    suburb: "",
    postcode: "",
    roomType: "private",
    weeklyPrice: 250,
    bond: "",
    furnished: true,
    billsIncluded: true,
    privateBathroom: false,
    parking: false,
    description: "",
    photos: [],
    noSmoking: true,
    quietHours: "10pm-7am",
    tenantPrefs: "",
    minStay: "3 months",
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

  const canProceed = () => {
    if (step === 0) return form.suburb && form.postcode && form.weeklyPrice > 0;
    return true;
  };

  const handleSubmit = () => {
    onSubmit(form);
  };

  return (
    <div className="grid lg:grid-cols-5 gap-8">
      {/* Main form */}
      <div className="lg:col-span-3 space-y-6">
        {/* Step indicator */}
        <div className="flex items-center gap-2">
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
            className="card p-6 rounded-2xl space-y-4"
          >
            {step === 0 && (
              <>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Basics</h3>
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
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Room type</label>
                  <select
                    value={form.roomType}
                    onChange={(e) => update("roomType", e.target.value)}
                    className="input-field"
                  >
                    <option value="private">Private room</option>
                    <option value="shared">Shared room</option>
                    <option value="studio">Studio</option>
                    <option value="ensuite">Ensuite</option>
                  </select>
                </div>
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

            {step === 1 && (
              <>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Details</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { key: "furnished" as const, label: "Furnished" },
                    { key: "billsIncluded" as const, label: "Bills included" },
                    { key: "privateBathroom" as const, label: "Private bathroom" },
                    { key: "parking" as const, label: "Parking available" },
                  ].map(({ key, label }) => (
                    <label
                      key={key}
                      className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                        form[key]
                          ? "border-rose-300 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/5"
                          : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={form[key] as boolean}
                        onChange={(e) => update(key, e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-rose-500 focus:ring-rose-500"
                      />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
                    </label>
                  ))}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
                  <textarea
                    placeholder="Describe the room, location highlights, nearby transport..."
                    value={form.description}
                    onChange={(e) => update("description", e.target.value)}
                    rows={4}
                    className="input-field"
                  />
                </div>
              </>
            )}

            {step === 2 && (
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
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {step === 3 && (
              <>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">House rules</h3>
                <label className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.noSmoking}
                    onChange={(e) => update("noSmoking", e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-rose-500 focus:ring-rose-500"
                  />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">No smoking</span>
                </label>
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
                "Pay AUD 99 & Publish"
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
                    {form.suburb || "Suburb"}, {form.postcode || "0000"}
                  </h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">{form.roomType} room</p>
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20">
                  <span className="text-rose-600 dark:text-rose-400 font-bold text-sm">
                    ${form.weeklyPrice || 0}
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
                {form.privateBathroom && (
                  <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">Private bath</span>
                )}
                {form.parking && (
                  <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">Parking</span>
                )}
                {form.noSmoking && (
                  <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">No smoking</span>
                )}
              </div>
              {form.description && (
                <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3">{form.description}</p>
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
