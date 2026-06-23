import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../hooks/useAuth";
import {
  completeOnboarding,
  getNearestStation,
  validateAddress,
  validatePhone,
  updateMyProfile,
} from "../../lib/api";
import VisaSelector from "../../components/onboarding/VisaSelector";
import { Logo } from "../../components/ui/Logo";
import { motion, AnimatePresence } from "framer-motion";

// ── Types ─────────────────────────────────────────────────

interface FieldErrors {
  legalName?: string;
  preferredName?: string;
  residentialAddress?: string;
  suburbCity?: string;
  postcode?: string;
  phone?: string;
}

interface ValidationState {
  addressValid: boolean | null;
  phoneValid: boolean | null;
  addressChecking: boolean;
  phoneChecking: boolean;
}

// ── Debounce utility ──────────────────────────────────────

function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const debounced = useCallback(
    (...args: Parameters<T>) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => callback(...args), delay);
    },
    [callback, delay]
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return debounced;
}

// ── Suburb/City format regex ──────────────────────────────

const SUBURB_CITY_REGEX = /^[A-Za-z\s'-]+\/[A-Za-z\s'-]+$/;

function validateSuburbCityFormat(value: string): string | undefined {
  if (!value.trim()) return "Suburb & City is required";
  if (!SUBURB_CITY_REGEX.test(value.trim()))
    return "Format must be Suburb/City (e.g. Kellyville/Sydney)";
  return undefined;
}

// ── Component ─────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
  const { session, user } = useAuth();
  const [isReady, setIsReady] = useState(false);

  // Form fields
  const [legalName, setLegalName] = useState("");
  const [preferredName, setPreferredName] = useState("");
  const [residentialAddress, setResidentialAddress] = useState("");
  const [suburbCity, setSuburbCity] = useState("");
  const [postcode, setPostcode] = useState("");
  const [phone, setPhone] = useState("");

  // Visa type
  const [visaType, setVisaType] = useState("");

  // Station lookup
  const [nearestStation, setNearestStation] = useState("");
  const [stationLoading, setStationLoading] = useState(false);
  const [stationError, setStationError] = useState("");

  // Validation
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [validation, setValidation] = useState<ValidationState>({
    addressValid: null,
    phoneValid: null,
    addressChecking: false,
    phoneChecking: false,
  });

  // Submit
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Auth gate
  useEffect(() => {
    if (!session || !user) {
      router.push("/signin");
      return;
    }
    setIsReady(true);
  }, [session, user, router]);

  // ── Station lookup (debounced) ──────────────────────────

  const lookupStation = useCallback(
    async (value: string) => {
      const formatErr = validateSuburbCityFormat(value);
      if (formatErr) {
        setNearestStation("");
        setStationError("");
        return;
      }

      setStationLoading(true);
      setStationError("");
      setNearestStation("");

      const result = await getNearestStation(value.trim());

      if (result && result.station) {
        setNearestStation(result.display || result.station);
      } else if (result && result.message) {
        setStationError(result.message);
      } else {
        setStationError("Could not find a nearby station");
      }
      setStationLoading(false);
    },
    []
  );

  const debouncedLookupStation = useDebouncedCallback(lookupStation, 800);

  const handleSuburbCityChange = (value: string) => {
    setSuburbCity(value);
    setFieldErrors((prev) => ({ ...prev, suburbCity: undefined }));
    setValidation((prev) => ({ ...prev, addressValid: null }));

    if (value.trim() && !validateSuburbCityFormat(value)) {
      debouncedLookupStation(value);
    } else {
      setNearestStation("");
      setStationError("");
    }
  };

  // ── Submit handler ──────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    // Step 1: Client-side validation
    const errors: FieldErrors = {};

    if (!legalName.trim()) errors.legalName = "Legal name is required";
    if (!preferredName.trim()) errors.preferredName = "Preferred name is required";
    if (!residentialAddress.trim()) errors.residentialAddress = "Street address is required";

    const suburbErr = validateSuburbCityFormat(suburbCity);
    if (suburbErr) errors.suburbCity = suburbErr;

    if (!postcode.trim()) {
      errors.postcode = "Postcode is required";
    } else if (!/^\d{4}$/.test(postcode.trim())) {
      errors.postcode = "Must be a 4-digit Australian postcode";
    }

    if (!phone.trim()) errors.phone = "Phone number is required";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setSubmitting(true);

    // Step 2: Server-side validation (address + phone in parallel)
    setValidation({
      addressValid: null,
      phoneValid: null,
      addressChecking: true,
      phoneChecking: true,
    });

    const [addressResult, phoneResult] = await Promise.all([
      validateAddress(suburbCity.trim(), postcode.trim()),
      validatePhone(phone.trim()),
    ]);

    const addrValid = addressResult?.valid ?? false;
    const phValid = phoneResult?.valid ?? false;

    setValidation({
      addressValid: addrValid,
      phoneValid: phValid,
      addressChecking: false,
      phoneChecking: false,
    });

    if (!addrValid) {
      setFieldErrors((prev) => ({
        ...prev,
        suburbCity: addressResult?.reason || "Suburb/City combination doesn't look valid in Australia",
      }));
    }

    if (!phValid) {
      setFieldErrors((prev) => ({
        ...prev,
        phone: phoneResult?.reason || "Phone number appears invalid or not active",
      }));
    }

    if (!addrValid || !phValid) {
      setSubmitting(false);
      return;
    }

    // Step 3: Complete onboarding
    const result = await completeOnboarding(session!.access_token, {
      legal_name: legalName.trim(),
      preferred_name: preferredName.trim(),
      residential_address: residentialAddress.trim(),
      suburb_city: suburbCity.trim(),
      nearest_station: nearestStation || null,
      phone: phone.trim(),
    });

    if (result) {
      // Save visa type if selected
      if (visaType) {
        try {
          await updateMyProfile(session!.access_token, { visa_type: visaType });
        } catch (err) {
          console.error("Failed to save visa type:", err);
        }
      }

      const role =
        user!.user_metadata?.user_type ||
        user!.user_metadata?.type ||
        "seeker";
      router.push(role === "owner" ? "/dashboard/owner" : "/dashboard/seeker");
    } else {
      setSubmitError("Failed to complete onboarding. Please try again.");
    }

    setSubmitting(false);
  };

  // ── Loading state ───────────────────────────────────────

  if (!isReady) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[var(--color-line-2)] border-t-slate-600 dark:border-t-slate-300 rounded-full animate-spin mx-auto" />
          <p className="text-sm text-[var(--color-ink-2)] mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  // ── Render ──────────────────────────────────────────────

  const canSubmit =
    legalName.trim() &&
    preferredName.trim() &&
    residentialAddress.trim() &&
    suburbCity.trim() &&
    postcode.trim() &&
    phone.trim() &&
    !submitting;

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col">
      {/* Top bar with step indicator */}
      <div className="px-5 sm:px-8 py-5 flex items-center justify-between border-b border-[var(--color-line)]">
        <div className="inline-flex items-center gap-2.5 text-[var(--color-ink)]">
          <Logo size={24} />
          <span className="font-serif text-[20px] leading-none tracking-[-0.012em]">MigRent</span>
        </div>
        <div className="hidden md:flex items-center gap-6">
          {[
            { n: 1, t: "About you" },
            { n: 2, t: "Your preferences" },
            { n: 3, t: "Verify your ID" },
          ].map((s, i) => (
            <div key={s.n} className="flex items-center gap-2">
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold"
                style={{
                  background: i === 0 ? "var(--color-ink)" : "transparent",
                  color: i === 0 ? "var(--color-bg)" : "var(--color-ink-3)",
                  border: i === 0 ? "none" : "1.5px solid var(--color-line-2)",
                }}
              >
                {s.n}
              </span>
              <span
                className="text-[13px]"
                style={{
                  fontWeight: i === 0 ? 700 : 500,
                  color: i === 0 ? "var(--color-ink)" : "var(--color-ink-3)",
                }}
              >
                {s.t}
              </span>
              {i < 2 && <div className="w-8 h-px bg-[var(--color-line)]" />}
            </div>
          ))}
        </div>
        <span className="text-[13px] font-semibold text-[var(--color-ink-3)]">Step 1 of 3</span>
      </div>

      <div className="flex-1 flex items-start justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="w-full max-w-lg"
      >
        {/* Header */}
        <div className="mb-7">
          <div className="eyebrow mb-1.5">About you</div>
          <h1 className="font-serif text-[36px] md:text-[40px] leading-[1.05] tracking-[-0.02em] text-[var(--color-ink)]">
            Complete your profile
          </h1>
          <p className="text-[var(--color-ink-2)] text-[14px] mt-2 max-w-md">
            A few basics so we can verify your identity and match you faster.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-[var(--color-surface)] rounded-[14px] border border-[var(--color-line)]">
          <form onSubmit={handleSubmit}>
            {/* Section: Identity */}
            <div className="p-6 pb-0">
              <h2 className="eyebrow mb-5">
                Identity
              </h2>

              <div className="space-y-4">
                <FormField
                  label="Legal name"
                  value={legalName}
                  onChange={setLegalName}
                  placeholder="As it appears on your ID"
                  error={fieldErrors.legalName}
                  required
                />

                <FormField
                  label="Preferred name"
                  value={preferredName}
                  onChange={setPreferredName}
                  placeholder="What should we call you?"
                  error={fieldErrors.preferredName}
                  required
                />
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-[var(--color-line)] my-6 mx-6" />

            {/* Section: Address */}
            <div className="px-6">
              <h2 className="eyebrow mb-5">
                Residential address
              </h2>

              <div className="space-y-4">
                <FormField
                  label="Street address"
                  value={residentialAddress}
                  onChange={setResidentialAddress}
                  placeholder="123 Example Street, Unit 4A"
                  error={fieldErrors.residentialAddress}
                  required
                />

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <FormField
                      label="Suburb & City"
                      value={suburbCity}
                      onChange={handleSuburbCityChange}
                      placeholder="Kellyville/Sydney"
                      error={fieldErrors.suburbCity}
                      hint="Format: Suburb/City"
                      required
                    />
                  </div>
                  <div>
                    <FormField
                      label="Postcode"
                      value={postcode}
                      onChange={(v) => {
                        setPostcode(v);
                        setFieldErrors((prev) => ({ ...prev, postcode: undefined }));
                        setValidation((prev) => ({ ...prev, addressValid: null }));
                      }}
                      placeholder="2155"
                      error={fieldErrors.postcode}
                      maxLength={4}
                      required
                    />
                  </div>
                </div>

                {/* Nearest station (read-only, auto-populated) */}
                <div>
                  <label className="block text-[12.5px] font-semibold text-[var(--color-ink-2)] mb-1.5">
                    Nearest train station
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      readOnly
                      value={
                        stationLoading
                          ? "Looking up..."
                          : nearestStation || stationError || ""
                      }
                      placeholder="Auto-detected from your suburb"
                      className={`w-full px-3.5 py-2.5 bg-[var(--color-surface-sunk)] border rounded-lg text-sm cursor-default ${
                        stationError && !stationLoading
                          ? "border-amber-300 dark:border-amber-600 text-[var(--color-warn-600)] dark:text-[var(--color-warn-500)]"
                          : "border-[var(--color-line)] text-[var(--color-ink-2)]"
                      }`}
                    />
                    {stationLoading && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-[var(--color-line-2)] border-t-slate-600 dark:border-t-slate-300 rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                  {!stationLoading && nearestStation && (
                    <p className="text-xs text-[var(--color-accent)] dark:text-[var(--color-accent)] mt-1 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Station found
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-[var(--color-line)] my-6 mx-6" />

            {/* Section: Visa */}
            <div className="px-6">
              <h2 className="eyebrow mb-5">
                Visa type
              </h2>
              <p className="text-[13.5px] text-[var(--color-ink-2)] mb-4">
                This helps us show rooms that best fit your situation - near your uni, workplace, or flexible for travel.
              </p>
              <VisaSelector value={visaType} onChange={setVisaType} />
            </div>

            {/* Divider */}
            <div className="border-t border-[var(--color-line)] my-6 mx-6" />

            {/* Section: Contact */}
            <div className="px-6">
              <h2 className="eyebrow mb-5">
                Contact
              </h2>

              <FormField
                label="Phone number"
                value={phone}
                onChange={(v) => {
                  setPhone(v);
                  setFieldErrors((prev) => ({ ...prev, phone: undefined }));
                  setValidation((prev) => ({ ...prev, phoneValid: null }));
                }}
                placeholder="+61 412 345 678"
                error={fieldErrors.phone}
                type="tel"
                required
              />
            </div>

            {/* Validation status badges */}
            <AnimatePresence>
              {(validation.addressChecking || validation.phoneChecking) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-6 mt-4"
                >
                  <div className="flex items-center gap-2 text-sm text-[var(--color-ink-2)]">
                    <div className="w-3.5 h-3.5 border-2 border-[var(--color-line-2)] border-t-slate-600 dark:border-t-slate-300 rounded-full animate-spin" />
                    Verifying your details...
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit error */}
            <AnimatePresence>
              {submitError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-6 mt-4"
                >
                  <div className="p-3 bg-[#f1d8d4] dark:bg-[#2b1614] rounded-[10px] text-sm text-[var(--color-danger-500)]">
                    {submitError}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <div className="p-6 pt-6">
              <button
                type="submit"
                disabled={!canSubmit}
                className="w-full btn-primary w-full h-[46px] text-[15px] rounded-[10px] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 dark:border-slate-900/30 border-t-white dark:border-t-slate-900 rounded-full animate-spin" />
                    Verifying & saving...
                  </span>
                ) : (
                  "Continue"
                )}
              </button>

              <p className="text-[11.5px] text-[var(--color-ink-3)] text-center mt-4">
                These details are locked after submission and used for identity
                verification.
              </p>
            </div>
          </form>
        </div>
      </motion.div>
      </div>
    </div>
  );
}

// ── Reusable form field ───────────────────────────────────

function FormField({
  label,
  value,
  onChange,
  placeholder,
  error,
  hint,
  type = "text",
  required,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  hint?: string;
  type?: string;
  required?: boolean;
  maxLength?: number;
}) {
  return (
    <div>
      <label className="block text-[12.5px] font-semibold text-[var(--color-ink-2)] mb-1.5">
        {label}
        {required && <span className="text-[var(--color-danger-500)] ml-0.5">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className={`w-full px-3.5 py-2.5 border rounded-lg text-sm transition-colors outline-none ${
          error
            ? "border-[var(--color-danger-500)]/30 dark:border-red-700 bg-[var(--color-danger-50)]/50 dark:bg-red-950/30 text-[var(--color-ink)] dark:text-[color:var(--color-primary-fg)] focus:border-red-400 dark:focus:border-red-600 focus:ring-1 focus:ring-red-100 dark:focus:ring-red-900/50"
            : "border-[var(--color-line)] bg-[var(--color-surface-2)] text-[var(--color-ink)] dark:text-[color:var(--color-primary-fg)] focus:border-slate-400 dark:focus:border-slate-500 focus:ring-1 focus:ring-slate-100 dark:focus:ring-slate-700/50"
        }`}
      />
      {hint && !error && (
        <p className="text-xs text-[var(--color-ink-3)] mt-1">{hint}</p>
      )}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-xs text-[var(--color-danger-500)] dark:text-[var(--color-danger-500)] mt-1"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
